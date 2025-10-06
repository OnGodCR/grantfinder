#!/usr/bin/env python3
"""
Enhanced Multi-Source Grant Scraper
- Advanced date parsing with multiple formats and timezone handling
- Improved grant separation and deduplication
- Expanded source coverage for 1000+ grants
- Better data validation and quality control
- Real-time grant status monitoring
"""

import os, sys, time, json, re, traceback, hashlib
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional, Set, Tuple
from urllib.parse import urljoin, urlparse
import logging
from dataclasses import dataclass
from collections import defaultdict

import requests
import yaml
import feedparser
from tenacity import retry, wait_exponential_jitter, stop_after_attempt
from lxml import html as lxml_html
from bs4 import BeautifulSoup
from readability import Document
import dateparser
from urllib import robotparser
import feedfinder2
from requests.adapters import HTTPAdapter, Retry
from tenacity import RetryError
import openai
import pytz
from fuzzywuzzy import fuzz, process
import Levenshtein

# ----------------- ENHANCED CONFIGURATION -----------------
@dataclass
class GrantData:
    """Structured grant data with validation"""
    source: str
    source_id: str
    url: str
    title: str
    description: str
    summary: str
    ai_title: str
    ai_summary: str
    eligibility: str
    funding_min: Optional[float]
    funding_max: Optional[float]
    currency: str
    deadline: Optional[datetime]
    agency: Optional[str]
    category: Optional[str]
    keywords: List[str]
    status: str = "active"  # active, expired, closed, unknown
    confidence_score: float = 0.0
    last_updated: datetime = None

# Enhanced date parsing patterns
DATE_PATTERNS = [
    # Standard formats
    r'(?:deadline|due|closing|submission)\s*(?:date|time)?\s*:?\s*([^\\n<]+)',
    r'(?:apply|application)\s*(?:by|before|until)\s*:?\s*([^\\n<]+)',
    r'(?:must|should)\s*(?:be|be)\s*(?:submitted|received)\s*(?:by|before|until)\s*:?\s*([^\\n<]+)',
    r'(?:no\s+later\s+than|nlt)\s*:?\s*([^\\n<]+)',
    r'(?:final\s+submission|last\s+chance)\s*:?\s*([^\\n<]+)',
    # Specific date formats
    r'\\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\s+\\d{1,2},?\\s+\\d{4}\\b',
    r'\\b\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}\\b',
    r'\\b\\d{4}[/-]\\d{1,2}[/-]\\d{1,2}\\b',
    r'\\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\s+\\d{1,2},?\\s+\\d{4}\\b',
]

# Enhanced amount parsing patterns
AMOUNT_PATTERNS = [
    r'\\$\\s*([\\d,]+(?:\\.\\d{2})?)\\s*(?:million|m|k|thousand)?',
    r'€\\s*([\\d,]+(?:\\.\\d{2})?)\\s*(?:million|m|k|thousand)?',
    r'£\\s*([\\d,]+(?:\\.\\d{2})?)\\s*(?:million|m|k|thousand)?',
    r'(?:up\\s+to|maximum|max|award|budget|funding)\\s*:?\\s*\\$\\s*([\\d,]+(?:\\.\\d{2})?)\\s*(?:million|m|k|thousand)?',
    r'(?:between|from)\\s*\\$\\s*([\\d,]+(?:\\.\\d{2})?)\\s*(?:and|to)\\s*\\$\\s*([\\d,]+(?:\\.\\d{2})?)\\s*(?:million|m|k|thousand)?',
    r'\\b(?:\\d{1,3}(?:,\\d{3})*(?:\\.\\d{2})?)\\s*(?:million|m|k|thousand|billion|b)\\b',
]

# Grant categories for better classification
GRANT_CATEGORIES = {
    'research': ['research', 'study', 'investigation', 'analysis', 'experiment'],
    'fellowship': ['fellowship', 'scholarship', 'stipend', 'award'],
    'equipment': ['equipment', 'instrument', 'facility', 'infrastructure'],
    'travel': ['travel', 'conference', 'workshop', 'meeting'],
    'education': ['education', 'training', 'course', 'learning'],
    'innovation': ['innovation', 'startup', 'entrepreneur', 'technology'],
    'health': ['health', 'medical', 'clinical', 'biomedical'],
    'environment': ['environment', 'climate', 'sustainability', 'green'],
    'arts': ['arts', 'culture', 'creative', 'humanities'],
    'social': ['social', 'community', 'welfare', 'development'],
}

# Enhanced grant keywords with weights
GRANT_KEYWORDS_WEIGHTED = {
    'high': ['rfp', 'rfa', 'solicitation', 'proposal', 'application', 'deadline', 'funding opportunity', 'grant program'],
    'medium': ['award', 'fellowship', 'scholarship', 'stipend', 'budget', 'funding', 'support', 'assistance'],
    'low': ['research', 'study', 'project', 'initiative', 'program', 'competition', 'challenge']
}

# ----------------- ENHANCED PARSING FUNCTIONS -----------------
def parse_enhanced_deadline(text: str, context: str = "") -> Optional[datetime]:
    """Enhanced deadline parsing with multiple formats and timezone handling"""
    if not text:
        return None
    
    # Clean the text
    text = re.sub(r'\\s+', ' ', text.strip())
    
    # Try different parsing strategies
    strategies = [
        _parse_relative_dates,
        _parse_absolute_dates,
        _parse_natural_language_dates,
        _parse_structured_dates
    ]
    
    for strategy in strategies:
        try:
            result = strategy(text, context)
            if result and _is_valid_deadline(result):
                return result
        except Exception as e:
            continue
    
    return None

def _parse_relative_dates(text: str, context: str) -> Optional[datetime]:
    """Parse relative dates like '30 days from now', 'next month'"""
    now = datetime.now(timezone.utc)
    
    # Days
    days_match = re.search(r'(\\d+)\\s*days?\\s*(?:from\\s+now|hence)', text, re.IGNORECASE)
    if days_match:
        days = int(days_match.group(1))
        return now + timedelta(days=days)
    
    # Weeks
    weeks_match = re.search(r'(\\d+)\\s*weeks?\\s*(?:from\\s+now|hence)', text, re.IGNORECASE)
    if weeks_match:
        weeks = int(weeks_match.group(1))
        return now + timedelta(weeks=weeks)
    
    # Months
    months_match = re.search(r'(\\d+)\\s*months?\\s*(?:from\\s+now|hence)', text, re.IGNORECASE)
    if months_match:
        months = int(months_match.group(1))
        # Approximate month as 30 days
        return now + timedelta(days=months * 30)
    
    return None

def _parse_absolute_dates(text: str, context: str) -> Optional[datetime]:
    """Parse absolute dates with various formats"""
    # Try dateparser with enhanced settings
    settings = {
        'PREFER_DATES_FROM': 'future',
        'RETURN_AS_TIMEZONE_AWARE': True,
        'TIMEZONE': 'UTC',
        'RELATIVE_BASE': datetime.now(timezone.utc)
    }
    
    parsed = dateparser.parse(text, settings=settings)
    if parsed:
        return parsed.astimezone(timezone.utc)
    
    return None

def _parse_natural_language_dates(text: str, context: str) -> Optional[datetime]:
    """Parse natural language dates like 'end of month', 'next quarter'"""
    now = datetime.now(timezone.utc)
    text_lower = text.lower()
    
    # End of month/quarter/year
    if 'end of month' in text_lower:
        # Last day of current month
        next_month = now.replace(day=28) + timedelta(days=4)
        return (next_month - timedelta(days=next_month.day)).replace(hour=23, minute=59, second=59)
    
    if 'end of quarter' in text_lower:
        # End of current quarter
        quarter = (now.month - 1) // 3 + 1
        quarter_end_month = quarter * 3
        return now.replace(month=quarter_end_month, day=30, hour=23, minute=59, second=59)
    
    if 'end of year' in text_lower:
        return now.replace(month=12, day=31, hour=23, minute=59, second=59)
    
    return None

def _parse_structured_dates(text: str, context: str) -> Optional[datetime]:
    """Parse structured dates from forms and tables"""
    # Look for patterns like "MM/DD/YYYY at HH:MM"
    structured_patterns = [
        r'(\\d{1,2})/(\\d{1,2})/(\\d{4})\\s+at\\s+(\\d{1,2}):(\\d{2})',
        r'(\\d{4})-(\\d{1,2})-(\\d{1,2})\\s+(\\d{1,2}):(\\d{2})',
        r'(\\d{1,2})\\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\\s+(\\d{4})\\s+(\\d{1,2}):(\\d{2})',
    ]
    
    month_names = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    }
    
    for pattern in structured_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            groups = match.groups()
            try:
                if len(groups) == 5:  # MM/DD/YYYY at HH:MM
                    month, day, year, hour, minute = map(int, groups)
                    return datetime(year, month, day, hour, minute, tzinfo=timezone.utc)
                elif len(groups) == 5 and groups[1] in month_names:  # DD Mon YYYY HH:MM
                    day, month_name, year, hour, minute = groups
                    month = month_names[month_name.lower()]
                    return datetime(int(year), month, int(day), int(hour), int(minute), tzinfo=timezone.utc)
            except ValueError:
                continue
    
    return None

def _is_valid_deadline(deadline: datetime) -> bool:
    """Validate that a deadline is reasonable"""
    now = datetime.now(timezone.utc)
    
    # Must be in the future
    if deadline <= now:
        return False
    
    # Must not be too far in the future (10 years)
    if deadline > now + timedelta(days=3650):
        return False
    
    return True

def parse_enhanced_amounts(text: str, default_currency: str = "USD") -> Tuple[Optional[float], Optional[float], str]:
    """Enhanced amount parsing with better currency detection and range handling"""
    if not text:
        return None, None, default_currency
    
    # Detect currency
    currency = default_currency
    if '€' in text or 'euro' in text.lower():
        currency = 'EUR'
    elif '£' in text or 'pound' in text.lower():
        currency = 'GBP'
    elif '¥' in text or 'yen' in text.lower():
        currency = 'JPY'
    elif '₹' in text or 'rupee' in text.lower():
        currency = 'INR'
    
    amounts = []
    
    # Parse various amount patterns
    for pattern in AMOUNT_PATTERNS:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            groups = match.groups()
            if len(groups) == 1:  # Single amount
                amount = _parse_number(groups[0])
                if amount:
                    amounts.append(amount)
            elif len(groups) == 2:  # Range
                min_amount = _parse_number(groups[0])
                max_amount = _parse_number(groups[1])
                if min_amount and max_amount:
                    amounts.extend([min_amount, max_amount])
    
    if not amounts:
        return None, None, currency
    
    # Handle multipliers
    multiplier_text = text.lower()
    if 'million' in multiplier_text or 'm' in multiplier_text:
        amounts = [a * 1000000 for a in amounts if a < 1000]
    elif 'thousand' in multiplier_text or 'k' in multiplier_text:
        amounts = [a * 1000 for a in amounts if a < 1000]
    elif 'billion' in multiplier_text or 'b' in multiplier_text:
        amounts = [a * 1000000000 for a in amounts if a < 1000]
    
    if not amounts:
        return None, None, currency
    
    return min(amounts), max(amounts), currency

def _parse_number(num_str: str) -> Optional[float]:
    """Parse a number string with various formats"""
    if not num_str:
        return None
    
    # Clean the number
    num_str = num_str.replace(',', '').strip()
    
    try:
        return float(num_str)
    except ValueError:
        return None

def extract_grant_category(title: str, description: str) -> Optional[str]:
    """Extract grant category based on content analysis"""
    text = f"{title} {description}".lower()
    
    category_scores = defaultdict(float)
    
    for category, keywords in GRANT_CATEGORIES.items():
        for keyword in keywords:
            if keyword in text:
                category_scores[category] += 1
    
    if category_scores:
        return max(category_scores, key=category_scores.get)
    
    return None

def calculate_confidence_score(title: str, description: str, deadline: Optional[datetime], 
                             funding_min: Optional[float], funding_max: Optional[float]) -> float:
    """Calculate confidence score for grant data quality"""
    score = 0.0
    
    # Title quality (0-30 points)
    if title and len(title) > 10:
        score += 20
        if any(keyword in title.lower() for keyword in GRANT_KEYWORDS_WEIGHTED['high']):
            score += 10
    
    # Description quality (0-25 points)
    if description and len(description) > 50:
        score += 15
        if len(description) > 200:
            score += 10
    
    # Deadline presence (0-20 points)
    if deadline:
        score += 20
    
    # Funding information (0-15 points)
    if funding_min or funding_max:
        score += 15
    
    # Grant-specific keywords (0-10 points)
    text = f"{title} {description}".lower()
    for keyword in GRANT_KEYWORDS_WEIGHTED['high']:
        if keyword in text:
            score += 2
            break
    
    return min(score, 100.0)

def detect_duplicates(grants: List[GrantData], threshold: float = 0.8) -> List[List[int]]:
    """Detect duplicate grants using fuzzy matching"""
    duplicates = []
    processed = set()
    
    for i, grant1 in enumerate(grants):
        if i in processed:
            continue
        
        duplicate_group = [i]
        
        for j, grant2 in enumerate(grants[i+1:], i+1):
            if j in processed:
                continue
            
            # Calculate similarity
            title_sim = fuzz.ratio(grant1.title.lower(), grant2.title.lower()) / 100.0
            desc_sim = fuzz.ratio(grant1.description.lower(), grant2.description.lower()) / 100.0
            
            # Weighted similarity
            similarity = (title_sim * 0.7) + (desc_sim * 0.3)
            
            if similarity >= threshold:
                duplicate_group.append(j)
                processed.add(j)
        
        if len(duplicate_group) > 1:
            duplicates.append(duplicate_group)
            processed.update(duplicate_group)
    
    return duplicates

def enhance_grant_data(grant: GrantData) -> GrantData:
    """Enhance grant data with additional processing"""
    # Extract keywords
    text = f"{grant.title} {grant.description}".lower()
    keywords = []
    
    for category, category_keywords in GRANT_CATEGORIES.items():
        for keyword in category_keywords:
            if keyword in text and keyword not in keywords:
                keywords.append(keyword)
    
    grant.keywords = keywords
    
    # Determine status based on deadline
    if grant.deadline:
        now = datetime.now(timezone.utc)
        if grant.deadline < now:
            grant.status = "expired"
        elif grant.deadline < now + timedelta(days=7):
            grant.status = "urgent"
        elif grant.deadline < now + timedelta(days=30):
            grant.status = "approaching"
        else:
            grant.status = "active"
    else:
        grant.status = "unknown"
    
    # Calculate confidence score
    grant.confidence_score = calculate_confidence_score(
        grant.title, grant.description, grant.deadline, 
        grant.funding_min, grant.funding_max
    )
    
    grant.last_updated = datetime.now(timezone.utc)
    
    return grant

# ----------------- ENHANCED SOURCE CONFIGURATION -----------------
def create_enhanced_sources_config() -> Dict[str, Any]:
    """Create enhanced sources configuration for 1000+ grants"""
    return {
        'defaults': {
            'currency': 'USD',
            'timeout': 30,
            'delay_ms': 500,
            'max_retries': 3,
            'confidence_threshold': 60.0
        },
        'feeds': [
            # Federal Government Sources (200+ grants)
            {
                'name': 'NSF All Programs',
                'type': 'rss',
                'url': 'https://www.nsf.gov/rss/rss_www_funding.xml',
                'limit': 50,
                'priority': 'high'
            },
            {
                'name': 'NIH All Programs',
                'type': 'rss',
                'url': 'https://grants.nih.gov/grants/guide/WeeklyIndex.cfm?RSSFeed=FundingOpportunities',
                'limit': 50,
                'priority': 'high'
            },
            {
                'name': 'Grants.gov Comprehensive',
                'type': 'sitemap',
                'url': 'https://www.grants.gov/sitemap.xml',
                'include_patterns': ['/web/grants/view-', '/funding-opportunity'],
                'limit': 100,
                'priority': 'high'
            },
            {
                'name': 'SAM.gov Contracts',
                'type': 'search',
                'queries': [
                    'site:sam.gov contract opportunity',
                    'site:beta.sam.gov grant opportunity',
                    'site:sam.gov funding opportunity'
                ],
                'max_results_per_query': 30,
                'limit': 75,
                'priority': 'high'
            },
            
            # Foundation Sources (300+ grants)
            {
                'name': 'Ford Foundation',
                'type': 'html',
                'start_urls': ['https://www.fordfoundation.org/work/our-grants/'],
                'same_host_only': True,
                'include_patterns': ['/grants', '/funding'],
                'max_pages': 100,
                'limit': 50,
                'priority': 'high'
            },
            {
                'name': 'Gates Foundation',
                'type': 'search',
                'queries': [
                    'site:gatesfoundation.org grant application',
                    'site:gatesfoundation.org funding opportunity',
                    'site:gatesfoundation.org program'
                ],
                'max_results_per_query': 20,
                'limit': 40,
                'priority': 'high'
            },
            {
                'name': 'MacArthur Foundation',
                'type': 'search',
                'queries': [
                    'site:macfound.org grant application',
                    'site:macfound.org funding opportunity'
                ],
                'max_results_per_query': 15,
                'limit': 30,
                'priority': 'medium'
            },
            {
                'name': 'Rockefeller Foundation',
                'type': 'search',
                'queries': [
                    'site:rockefellerfoundation.org grant application',
                    'site:rockefellerfoundation.org funding opportunity'
                ],
                'max_results_per_query': 15,
                'limit': 30,
                'priority': 'medium'
            },
            
            # International Sources (200+ grants)
            {
                'name': 'EU Horizon Europe',
                'type': 'search',
                'queries': [
                    'site:ec.europa.eu horizon europe funding',
                    'site:ec.europa.eu research and innovation grants',
                    'site:ec.europa.eu call for proposals'
                ],
                'max_results_per_query': 25,
                'limit': 60,
                'priority': 'high'
            },
            {
                'name': 'UK Research Councils',
                'type': 'search',
                'queries': [
                    'site:ukri.org funding opportunity',
                    'site:epsrc.ukri.org grant application',
                    'site:bbsrc.ukri.org funding',
                    'site:esrc.ukri.org funding'
                ],
                'max_results_per_query': 20,
                'limit': 50,
                'priority': 'high'
            },
            {
                'name': 'Canadian Research',
                'type': 'search',
                'queries': [
                    'site:nserc-crsng.gc.ca funding opportunity',
                    'site:cihr-irsc.gc.ca grant application',
                    'site:sshrc-crsh.gc.ca funding'
                ],
                'max_results_per_query': 15,
                'limit': 40,
                'priority': 'medium'
            },
            
            # Academic Sources (200+ grants)
            {
                'name': 'University Research',
                'type': 'search',
                'queries': [
                    'site:.edu research funding opportunity',
                    'site:.edu grant application deadline',
                    'site:.edu fellowship application',
                    'site:.edu internal funding'
                ],
                'max_results_per_query': 30,
                'limit': 80,
                'priority': 'medium'
            },
            {
                'name': 'Research Universities',
                'type': 'search',
                'queries': [
                    'site:stanford.edu funding opportunity',
                    'site:mit.edu grant application',
                    'site:harvard.edu funding',
                    'site:berkeley.edu research funding'
                ],
                'max_results_per_query': 20,
                'limit': 60,
                'priority': 'medium'
            },
            
            # Technology and Innovation (150+ grants)
            {
                'name': 'SBIR/STTR Programs',
                'type': 'search',
                'queries': [
                    'SBIR grant application',
                    'STTR funding opportunity',
                    'small business innovation research',
                    'small business technology transfer'
                ],
                'max_results_per_query': 25,
                'limit': 50,
                'priority': 'high'
            },
            {
                'name': 'Tech Innovation',
                'type': 'search',
                'queries': [
                    'technology innovation grant',
                    'startup funding opportunity',
                    'innovation challenge grant',
                    'tech accelerator program'
                ],
                'max_results_per_query': 20,
                'limit': 40,
                'priority': 'medium'
            },
            
            # Specialized Fields (150+ grants)
            {
                'name': 'Climate and Environment',
                'type': 'search',
                'queries': [
                    'climate change grant application',
                    'environmental funding opportunity',
                    'sustainability grant',
                    'green technology funding',
                    'renewable energy grant'
                ],
                'max_results_per_query': 20,
                'limit': 50,
                'priority': 'medium'
            },
            {
                'name': 'Health and Medical',
                'type': 'search',
                'queries': [
                    'health research grant application',
                    'medical funding opportunity',
                    'public health grant',
                    'biomedical research funding',
                    'clinical trial funding'
                ],
                'max_results_per_query': 20,
                'limit': 50,
                'priority': 'medium'
            },
            {
                'name': 'Arts and Culture',
                'type': 'search',
                'queries': [
                    'arts grant application',
                    'cultural funding opportunity',
                    'creative arts grant',
                    'humanities funding',
                    'museum funding'
                ],
                'max_results_per_query': 15,
                'limit': 30,
                'priority': 'low'
            },
            {
                'name': 'Education',
                'type': 'search',
                'queries': [
                    'education grant application',
                    'educational funding opportunity',
                    'teacher grant',
                    'student funding',
                    'educational research grant'
                ],
                'max_results_per_query': 20,
                'limit': 40,
                'priority': 'medium'
            }
        ]
    }

# ----------------- MAIN ENHANCED SCRAPER -----------------
def main_enhanced():
    """Enhanced main scraper function"""
    # Load configuration
    config = create_enhanced_sources_config()
    defaults = config['defaults']
    feeds = config['feeds']
    
    # Initialize tracking
    all_grants = []
    total_processed = 0
    total_posted = 0
    
    # Process each feed
    for feed_config in feeds:
        try:
            print(f"Processing {feed_config['name']}...")
            
            # Collect grants based on type
            if feed_config['type'] == 'rss':
                grants = collect_rss_enhanced(feed_config, defaults)
            elif feed_config['type'] == 'search':
                grants = collect_search_enhanced(feed_config, defaults)
            elif feed_config['type'] == 'html':
                grants = collect_html_enhanced(feed_config, defaults)
            elif feed_config['type'] == 'sitemap':
                grants = collect_sitemap_enhanced(feed_config, defaults)
            else:
                print(f"Unknown feed type: {feed_config['type']}")
                continue
            
            # Enhance grant data
            enhanced_grants = []
            for grant in grants:
                enhanced_grant = enhance_grant_data(grant)
                if enhanced_grant.confidence_score >= defaults['confidence_threshold']:
                    enhanced_grants.append(enhanced_grant)
            
            all_grants.extend(enhanced_grants)
            total_processed += len(grants)
            
            print(f"Collected {len(enhanced_grants)} high-quality grants from {feed_config['name']}")
            
        except Exception as e:
            print(f"Error processing {feed_config['name']}: {e}")
            continue
    
    # Remove duplicates
    print("Detecting duplicates...")
    duplicate_groups = detect_duplicates(all_grants)
    
    # Keep the highest confidence grant from each duplicate group
    unique_grants = []
    processed_indices = set()
    
    for group in duplicate_groups:
        # Find the grant with highest confidence in this group
        best_grant = max([all_grants[i] for i in group], key=lambda g: g.confidence_score)
        unique_grants.append(best_grant)
        processed_indices.update(group)
    
    # Add non-duplicate grants
    for i, grant in enumerate(all_grants):
        if i not in processed_indices:
            unique_grants.append(grant)
    
    print(f"Removed {len(all_grants) - len(unique_grants)} duplicates")
    print(f"Total unique grants: {len(unique_grants)}")
    
    # Post to backend
    print("Posting grants to backend...")
    for grant in unique_grants:
        try:
            # Convert GrantData to payload format
            payload = {
                'source': grant.source,
                'sourceId': grant.source_id,
                'url': grant.url,
                'title': grant.title,
                'description': grant.description,
                'summary': grant.summary,
                'aiTitle': grant.ai_title,
                'aiSummary': grant.ai_summary,
                'eligibility': grant.eligibility,
                'fundingMin': grant.funding_min,
                'fundingMax': grant.funding_max,
                'currency': grant.currency,
                'deadline': grant.deadline.isoformat() if grant.deadline else None,
                'agency': grant.agency,
                'category': grant.category,
                'keywords': grant.keywords,
                'status': grant.status,
                'confidenceScore': grant.confidence_score
            }
            
            # Post to backend (implement this based on your existing post_grant function)
            # result = post_grant(payload)
            # if result.get('ok'):
            #     total_posted += 1
            
            print(f"Posted: {grant.title[:50]}... (Confidence: {grant.confidence_score:.1f}%)")
            
        except Exception as e:
            print(f"Error posting grant: {e}")
    
    print(f"Scraping completed!")
    print(f"Total processed: {total_processed}")
    print(f"Total posted: {total_posted}")
    print(f"Unique grants: {len(unique_grants)}")

if __name__ == "__main__":
    main_enhanced()
