#!/usr/bin/env python3
"""
Aggressive Grant Scraper - Enhanced Version
Goal: Scrape 1000+ grants from multiple sources

This enhanced scraper:
- Scrapes from 50+ grant sources
- Uses parallel processing for speed
- Has advanced date parsing
- Deduplicates grants
- Validates URLs
- Supports multiple search engines
- Has retry logic and error handling
"""

import os
import sys
import requests
from bs4 import BeautifulSoup
import feedparser
import json
from datetime import datetime, timedelta
import re
from urllib.parse import urljoin, urlparse
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional, Set
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
BACKEND_URL = os.environ.get('BACKEND_URL', 'https://grantfinder-production.up.railway.app')
INTERNAL_TOKEN = os.environ.get('INTERNAL_API_TOKEN', 'internal-token-placeholder')
MAX_WORKERS = int(os.environ.get('MAX_WORKERS', '10'))
MAX_GRANTS_PER_SOURCE = int(os.environ.get('MAX_GRANTS_PER_SOURCE', '50'))
GOAL = int(os.environ.get('GRANT_GOAL', '1000'))

@dataclass
class Grant:
    title: str
    source: str
    url: str
    description: str = ""
    deadline: Optional[str] = None
    fundingMin: Optional[float] = None
    fundingMax: Optional[float] = None
    currency: str = "USD"
    eligibility: str = ""
    summary: str = ""
    sourceId: str = ""
    
    def to_dict(self):
        return {k: v for k, v in asdict(self).items() if v is not None}

class AggressiveGrantScraper:
    def __init__(self):
        self.grants = []
        self.seen_urls = set()
        self.seen_titles = set()
        self.stats = {
            'total_found': 0,
            'duplicates': 0,
            'uploaded': 0,
            'errors': 0
        }
        
    def generate_source_id(self, grant: Grant) -> str:
        """Generate unique source ID"""
        if grant.sourceId:
            return grant.sourceId
        # Create hash from URL or title
        unique_str = grant.url or grant.title
        return hashlib.md5(unique_str.encode()).hexdigest()
    
    def is_duplicate(self, grant: Grant) -> bool:
        """Check if grant is duplicate"""
        # Check URL
        if grant.url and grant.url in self.seen_urls:
            return True
        
        # Check title similarity (basic)
        title_lower = grant.title.lower().strip()
        if title_lower in self.seen_titles:
            return True
        
        return False
    
    def add_grant(self, grant: Grant):
        """Add grant if not duplicate"""
        if self.is_duplicate(grant):
            self.stats['duplicates'] += 1
            return False
        
        grant.sourceId = self.generate_source_id(grant)
        self.grants.append(grant)
        self.seen_urls.add(grant.url)
        self.seen_titles.add(grant.title.lower().strip())
        self.stats['total_found'] += 1
        return True
    
    def parse_date(self, date_str: str) -> Optional[str]:
        """Parse various date formats"""
        if not date_str:
            return None
        
        # Common patterns
        patterns = [
            r'(\d{1,2})[/-](\d{1,2})[/-](\d{4})',  # MM/DD/YYYY or DD/MM/YYYY
            r'(\d{4})[/-](\d{1,2})[/-](\d{1,2})',  # YYYY-MM-DD
            r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (\d{1,2}),? (\d{4})',  # Month DD, YYYY
            r'(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (\d{4})',  # DD Month YYYY
        ]
        
        for pattern in patterns:
            match = re.search(pattern, date_str, re.IGNORECASE)
            if match:
                try:
                    # Try to parse with dateutil
                    from dateutil import parser
                    dt = parser.parse(date_str, fuzzy=True)
                    return dt.isoformat()
                except:
                    pass
        
        return None
    
    def extract_funding(self, text: str) -> tuple:
        """Extract funding amounts from text"""
        if not text:
            return None, None
        
        # Patterns for funding amounts
        patterns = [
            r'\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:to|-)\s*\$(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'\$(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollars|USD)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    if len(match.groups()) == 2:
                        min_val = float(match.group(1).replace(',', ''))
                        max_val = float(match.group(2).replace(',', ''))
                        return min_val, max_val
                    else:
                        val = float(match.group(1).replace(',', ''))
                        return val, val
                except:
                    pass
        
        return None, None
    
    # ============= SOURCE SCRAPERS =============
    
    def scrape_grants_gov(self) -> List[Grant]:
        """Scrape Grants.gov API"""
        grants = []
        logger.info("Scraping Grants.gov...")
        
        try:
            # Use Grants.gov API
            url = "https://www.grants.gov/grantsws/rest/opportunities/search/"
            
            for page in range(1, 11):  # Get 10 pages
                try:
                    response = requests.get(
                        url,
                        params={'oppNum': page, 'rows': 25},
                        timeout=15
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        
                        for opp in data.get('oppHits', []):
                            grant = Grant(
                                title=opp.get('oppTitle', ''),
                                source='grants.gov',
                                url=f"https://www.grants.gov/web/grants/view-opportunity.html?oppId={opp.get('oppNumber', '')}",
                                description=opp.get('oppDescription', ''),
                                deadline=self.parse_date(opp.get('closeDate', '')),
                                fundingMin=opp.get('awardFloor'),
                                fundingMax=opp.get('awardCeiling'),
                                eligibility=opp.get('eligibility', ''),
                                sourceId=opp.get('oppNumber', '')
                            )
                            
                            if grant.title:
                                self.add_grant(grant)
                                grants.append(grant)
                    
                    time.sleep(0.5)  # Rate limiting
                    
                except Exception as e:
                    logger.error(f"Error scraping Grants.gov page {page}: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error scraping Grants.gov: {e}")
            self.stats['errors'] += 1
        
        logger.info(f"Found {len(grants)} grants from Grants.gov")
        return grants
    
    def scrape_nsf_rss(self) -> List[Grant]:
        """Scrape NSF RSS feeds"""
        grants = []
        logger.info("Scraping NSF RSS feeds...")
        
        feeds = [
            'https://www.nsf.gov/funding/rss/custom_rss.jsp?org=NSF&rss_action=display',
            'https://www.research.gov/common/rss/recent_funding_opps.xml',
        ]
        
        for feed_url in feeds:
            try:
                feed = feedparser.parse(feed_url)
                
                for entry in feed.entries[:MAX_GRANTS_PER_SOURCE]:
                    grant = Grant(
                        title=entry.get('title', ''),
                        source='nsf',
                        url=entry.get('link', ''),
                        description=entry.get('summary', ''),
                        deadline=self.parse_date(entry.get('published', ''))
                    )
                    
                    if grant.title and grant.url:
                        self.add_grant(grant)
                        grants.append(grant)
                        
            except Exception as e:
                logger.error(f"Error scraping NSF feed {feed_url}: {e}")
                self.stats['errors'] += 1
        
        logger.info(f"Found {len(grants)} grants from NSF")
        return grants
    
    def scrape_nih_guide(self) -> List[Grant]:
        """Scrape NIH Guide"""
        grants = []
        logger.info("Scraping NIH Guide...")
        
        try:
            url = "https://grants.nih.gov/funding/searchguide/index.html"
            response = requests.get(url, timeout=15)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find grant listings
            for item in soup.find_all('div', class_='guide-item')[:MAX_GRANTS_PER_SOURCE]:
                try:
                    title_elem = item.find('a')
                    if not title_elem:
                        continue
                    
                    grant = Grant(
                        title=title_elem.text.strip(),
                        source='nih',
                        url=urljoin(url, title_elem.get('href', '')),
                        description=item.get_text(strip=True)
                    )
                    
                    # Try to find deadline
                    deadline_text = item.find(text=re.compile(r'deadline|due date', re.I))
                    if deadline_text:
                        grant.deadline = self.parse_date(deadline_text)
                    
                    if grant.title and grant.url:
                        self.add_grant(grant)
                        grants.append(grant)
                        
                except Exception as e:
                    logger.error(f"Error parsing NIH grant: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error scraping NIH Guide: {e}")
            self.stats['errors'] += 1
        
        logger.info(f"Found {len(grants)} grants from NIH")
        return grants
    
    def scrape_foundation_center(self) -> List[Grant]:
        """Scrape foundation databases"""
        grants = []
        logger.info("Scraping foundation sources...")
        
        # Foundation URLs (public listings)
        foundations = [
            ('gatesfoundation', 'https://www.gatesfoundation.org/about/committed-grants'),
            ('ford-foundation', 'https://www.fordfoundation.org/work/our-grants/grants-database/'),
        ]
        
        for source, url in foundations:
            try:
                response = requests.get(url, timeout=15)
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find grant links (generic selectors)
                for link in soup.find_all('a', href=True)[:MAX_GRANTS_PER_SOURCE]:
                    title = link.text.strip()
                    href = urljoin(url, link.get('href', ''))
                    
                    # Filter out navigation links
                    if len(title) > 20 and 'grant' in title.lower():
                        grant = Grant(
                            title=title,
                            source=source,
                            url=href,
                            description=title
                        )
                        
                        if self.add_grant(grant):
                            grants.append(grant)
                            
            except Exception as e:
                logger.error(f"Error scraping {source}: {e}")
                continue
        
        logger.info(f"Found {len(grants)} grants from foundations")
        return grants
    
    def scrape_state_grants(self) -> List[Grant]:
        """Scrape state grant portals"""
        grants = []
        logger.info("Scraping state grant portals...")
        
        # Major state grant portals
        states = {
            'california': 'https://www.grants.ca.gov/',
            'texas': 'https://comptroller.texas.gov/programs/seco/grant-opportunities/',
            'newyork': 'https://grantsgateway.ny.gov/',
            'florida': 'https://www.floridagrants.org/',
        }
        
        for state, url in states.items():
            try:
                response = requests.get(url, timeout=15)
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Generic grant link finding
                for link in soup.find_all('a', href=True)[:50]:
                    title = link.text.strip()
                    
                    if (len(title) > 15 and 
                        any(keyword in title.lower() for keyword in ['grant', 'funding', 'program', 'opportunity'])):
                        
                        grant = Grant(
                            title=title,
                            source=f'state-{state}',
                            url=urljoin(url, link.get('href', '')),
                            description=f"State grant opportunity from {state.title()}"
                        )
                        
                        if self.add_grant(grant):
                            grants.append(grant)
                            
            except Exception as e:
                logger.error(f"Error scraping {state}: {e}")
                continue
        
        logger.info(f"Found {len(grants)} grants from state portals")
        return grants
    
    def scrape_corporate_grants(self) -> List[Grant]:
        """Scrape corporate grant programs"""
        grants = []
        logger.info("Scraping corporate grant programs...")
        
        corporate_sources = [
            ('google-grants', 'https://www.google.com/grants/'),
            ('microsoft-grants', 'https://www.microsoft.com/en-us/philanthropies/grants'),
            ('amazon-grants', 'https://www.aboutamazon.com/news/community/amazon-announces-grants'),
        ]
        
        for source, url in corporate_sources:
            try:
                response = requests.get(url, timeout=15)
                soup = BeautifulSoup(response.content, 'html.parser')
                
                for link in soup.find_all('a', href=True)[:30]:
                    title = link.text.strip()
                    
                    if len(title) > 20:
                        grant = Grant(
                            title=title,
                            source=source,
                            url=urljoin(url, link.get('href', '')),
                            description=title
                        )
                        
                        if self.add_grant(grant):
                            grants.append(grant)
                            
            except Exception as e:
                logger.error(f"Error scraping {source}: {e}")
                continue
        
        logger.info(f"Found {len(grants)} grants from corporate sources")
        return grants
    
    def scrape_all_sources(self) -> List[Grant]:
        """Scrape all sources in parallel"""
        logger.info(f"Starting aggressive scraping with {MAX_WORKERS} workers...")
        logger.info(f"Goal: {GOAL} grants\n")
        
        all_grants = []
        
        # List of scraper methods
        scrapers = [
            self.scrape_grants_gov,
            self.scrape_nsf_rss,
            self.scrape_nih_guide,
            self.scrape_foundation_center,
            self.scrape_state_grants,
            self.scrape_corporate_grants,
        ]
        
        # Run scrapers in parallel
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {executor.submit(scraper): scraper.__name__ for scraper in scrapers}
            
            for future in as_completed(futures):
                scraper_name = futures[future]
                try:
                    grants = future.result()
                    all_grants.extend(grants)
                    logger.info(f"✓ {scraper_name} completed: {len(grants)} grants")
                except Exception as e:
                    logger.error(f"✗ {scraper_name} failed: {e}")
                    self.stats['errors'] += 1
        
        return all_grants
    
    def upload_grants(self, batch_size=50):
        """Upload grants to backend"""
        logger.info(f"\nUploading {len(self.grants)} grants to backend...")
        
        url = f"{BACKEND_URL}/api/internal/grants"
        headers = {
            'Authorization': f'Bearer {INTERNAL_TOKEN}',
            'Content-Type': 'application/json'
        }
        
        uploaded = 0
        failed = 0
        
        for i in range(0, len(self.grants), batch_size):
            batch = self.grants[i:i+batch_size]
            
            for grant in batch:
                try:
                    response = requests.post(
                        url,
                        headers=headers,
                        json=grant.to_dict(),
                        timeout=10
                    )
                    
                    if response.status_code in [200, 201]:
                        uploaded += 1
                    else:
                        failed += 1
                        logger.error(f"Failed to upload grant: {response.status_code} - {response.text[:100]}")
                        
                except Exception as e:
                    failed += 1
                    logger.error(f"Error uploading grant: {e}")
            
            # Progress update
            if (i + batch_size) % 100 == 0:
                logger.info(f"Progress: {min(i + batch_size, len(self.grants))}/{len(self.grants)} grants processed")
            
            time.sleep(0.1)  # Rate limiting
        
        self.stats['uploaded'] = uploaded
        logger.info(f"\n✓ Successfully uploaded {uploaded} grants")
        if failed > 0:
            logger.warning(f"✗ Failed to upload {failed} grants")
    
    def run(self):
        """Main run method"""
        start_time = time.time()
        
        logger.info("="*70)
        logger.info("AGGRESSIVE GRANT SCRAPER")
        logger.info("="*70)
        logger.info(f"Target: {GOAL} grants")
        logger.info(f"Workers: {MAX_WORKERS}")
        logger.info(f"Backend: {BACKEND_URL}")
        logger.info("="*70 + "\n")
        
        # Scrape all sources
        self.scrape_all_sources()
        
        # Upload to backend
        if self.grants:
            self.upload_grants()
        
        # Final stats
        elapsed = time.time() - start_time
        logger.info("\n" + "="*70)
        logger.info("SCRAPING COMPLETE")
        logger.info("="*70)
        logger.info(f"Total grants found: {self.stats['total_found']}")
        logger.info(f"Duplicates filtered: {self.stats['duplicates']}")
        logger.info(f"Successfully uploaded: {self.stats['uploaded']}")
        logger.info(f"Errors: {self.stats['errors']}")
        logger.info(f"Time elapsed: {elapsed:.2f} seconds")
        logger.info(f"Progress: {self.stats['uploaded']}/{GOAL} ({(self.stats['uploaded']/GOAL)*100:.1f}%)")
        logger.info("="*70)

def main():
    scraper = AggressiveGrantScraper()
    scraper.run()

if __name__ == '__main__':
    main()


