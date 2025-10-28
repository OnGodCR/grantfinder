#!/usr/bin/env python3
"""
Grant Database Cleanup Script

This script connects to the Neon PostgreSQL database and:
1. Identifies and removes "fake" grants (test data, placeholders)
2. Identifies and marks expired grants (past deadline)
3. Validates grant URLs and removes invalid ones
4. Removes duplicate grants
5. Provides a summary of cleanup actions
"""

import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
import requests
from urllib.parse import urlparse
import re

# Configuration
DATABASE_URL = os.environ.get('DATABASE_URL')
DRY_RUN = os.environ.get('DRY_RUN', 'true').lower() == 'true'

# Patterns to identify fake/test grants
FAKE_PATTERNS = [
    r'test\s+grant',
    r'sample\s+grant',
    r'placeholder',
    r'fake\s+grant',
    r'demo\s+grant',
    r'example\s+grant',
    r'lorem\s+ipsum',
    r'xxx+',
    r'yyy+',
    r'zzz+',
]

# Common test/fake domains
FAKE_DOMAINS = [
    'example.com',
    'test.com',
    'localhost',
    'example.org',
    'test.org',
]

class GrantCleaner:
    def __init__(self, database_url, dry_run=True):
        self.database_url = database_url
        self.dry_run = dry_run
        self.conn = None
        self.stats = {
            'total_grants': 0,
            'fake_grants': 0,
            'expired_grants': 0,
            'invalid_urls': 0,
            'duplicates': 0,
            'deleted': 0,
        }
    
    def connect(self):
        """Connect to the database"""
        try:
            self.conn = psycopg2.connect(self.database_url)
            print(f"✓ Connected to database")
            return True
        except Exception as e:
            print(f"✗ Failed to connect to database: {e}")
            return False
    
    def get_total_grants(self):
        """Get total number of grants"""
        with self.conn.cursor() as cur:
            cur.execute('SELECT COUNT(*) FROM "Grant"')
            count = cur.fetchone()[0]
            self.stats['total_grants'] = count
            return count
    
    def find_fake_grants(self):
        """Find grants that appear to be fake/test data"""
        fake_ids = []
        
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('SELECT id, title, description, url FROM "Grant"')
            grants = cur.fetchall()
            
            for grant in grants:
                is_fake = False
                reasons = []
                
                # Check title and description for fake patterns
                for pattern in FAKE_PATTERNS:
                    if re.search(pattern, grant['title'] or '', re.IGNORECASE):
                        is_fake = True
                        reasons.append(f"Title matches pattern: {pattern}")
                    if grant['description'] and re.search(pattern, grant['description'], re.IGNORECASE):
                        is_fake = True
                        reasons.append(f"Description matches pattern: {pattern}")
                
                # Check for fake domains
                if grant['url']:
                    try:
                        domain = urlparse(grant['url']).netloc
                        if any(fake_domain in domain for fake_domain in FAKE_DOMAINS):
                            is_fake = True
                            reasons.append(f"URL contains fake domain: {domain}")
                    except:
                        pass
                
                # Check for very short titles (likely test data)
                if grant['title'] and len(grant['title'].strip()) < 10:
                    is_fake = True
                    reasons.append("Title too short (< 10 chars)")
                
                if is_fake:
                    fake_ids.append({
                        'id': grant['id'],
                        'title': grant['title'],
                        'reasons': reasons
                    })
        
        self.stats['fake_grants'] = len(fake_ids)
        return fake_ids
    
    def find_expired_grants(self):
        """Find grants with past deadlines"""
        expired_ids = []
        
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('''
                SELECT id, title, deadline 
                FROM "Grant" 
                WHERE deadline IS NOT NULL AND deadline < NOW()
            ''')
            grants = cur.fetchall()
            
            for grant in grants:
                days_past = (datetime.now() - grant['deadline']).days
                expired_ids.append({
                    'id': grant['id'],
                    'title': grant['title'],
                    'deadline': grant['deadline'],
                    'days_past': days_past
                })
        
        self.stats['expired_grants'] = len(expired_ids)
        return expired_ids
    
    def find_invalid_urls(self):
        """Find grants with invalid or unreachable URLs"""
        invalid_ids = []
        
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('SELECT id, title, url FROM "Grant" WHERE url IS NOT NULL')
            grants = cur.fetchall()
            
            print(f"\nValidating {len(grants)} grant URLs...")
            for i, grant in enumerate(grants):
                if (i + 1) % 10 == 0:
                    print(f"  Progress: {i + 1}/{len(grants)}")
                
                try:
                    # Try to access the URL
                    response = requests.head(grant['url'], timeout=5, allow_redirects=True)
                    if response.status_code >= 400:
                        invalid_ids.append({
                            'id': grant['id'],
                            'title': grant['title'],
                            'url': grant['url'],
                            'status': response.status_code
                        })
                except requests.exceptions.RequestException as e:
                    invalid_ids.append({
                        'id': grant['id'],
                        'title': grant['title'],
                        'url': grant['url'],
                        'error': str(e)[:100]
                    })
        
        self.stats['invalid_urls'] = len(invalid_ids)
        return invalid_ids
    
    def find_duplicates(self):
        """Find duplicate grants based on title similarity"""
        duplicates = []
        
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Find grants with exact same title
            cur.execute('''
                SELECT title, array_agg(id) as ids, COUNT(*) as count
                FROM "Grant"
                GROUP BY title
                HAVING COUNT(*) > 1
            ''')
            duplicate_groups = cur.fetchall()
            
            for group in duplicate_groups:
                # Keep the oldest grant, mark others as duplicates
                ids = group['ids']
                duplicates.extend(ids[1:])  # Skip the first (oldest) one
        
        self.stats['duplicates'] = len(duplicates)
        return duplicates
    
    def delete_grants(self, grant_ids):
        """Delete grants by IDs"""
        if not grant_ids:
            return 0
        
        if self.dry_run:
            print(f"\n[DRY RUN] Would delete {len(grant_ids)} grants")
            return 0
        
        with self.conn.cursor() as cur:
            cur.execute('DELETE FROM "Grant" WHERE id = ANY(%s)', (grant_ids,))
            deleted = cur.rowcount
            self.conn.commit()
            self.stats['deleted'] = deleted
            return deleted
    
    def run_cleanup(self, check_urls=False):
        """Run the full cleanup process"""
        print("\n" + "="*70)
        print("Grant Database Cleanup Script")
        print("="*70)
        print(f"Mode: {'DRY RUN' if self.dry_run else 'LIVE'}")
        print(f"Database: {self.database_url[:50]}...")
        print("="*70 + "\n")
        
        if not self.connect():
            return False
        
        total = self.get_total_grants()
        print(f"Total grants in database: {total}\n")
        
        # Find fake grants
        print("🔍 Searching for fake/test grants...")
        fake_grants = self.find_fake_grants()
        if fake_grants:
            print(f"✗ Found {len(fake_grants)} fake/test grants:")
            for grant in fake_grants[:5]:  # Show first 5
                print(f"  - {grant['title']} (ID: {grant['id']})")
                print(f"    Reasons: {', '.join(grant['reasons'])}")
            if len(fake_grants) > 5:
                print(f"  ... and {len(fake_grants) - 5} more")
        else:
            print("✓ No fake/test grants found")
        
        # Find expired grants
        print("\n🔍 Searching for expired grants...")
        expired_grants = self.find_expired_grants()
        if expired_grants:
            print(f"✗ Found {len(expired_grants)} expired grants:")
            for grant in expired_grants[:5]:  # Show first 5
                print(f"  - {grant['title']} (expired {grant['days_past']} days ago)")
            if len(expired_grants) > 5:
                print(f"  ... and {len(expired_grants) - 5} more")
        else:
            print("✓ No expired grants found")
        
        # Find duplicates
        print("\n🔍 Searching for duplicate grants...")
        duplicate_ids = self.find_duplicates()
        if duplicate_ids:
            print(f"✗ Found {len(duplicate_ids)} duplicate grants")
        else:
            print("✓ No duplicate grants found")
        
        # Find invalid URLs (optional, can be slow)
        if check_urls:
            print("\n🔍 Validating grant URLs...")
            invalid_urls = self.find_invalid_urls()
            if invalid_urls:
                print(f"✗ Found {len(invalid_urls)} grants with invalid URLs:")
                for grant in invalid_urls[:5]:
                    print(f"  - {grant['title']}")
                    print(f"    URL: {grant['url']}")
                if len(invalid_urls) > 5:
                    print(f"  ... and {len(invalid_urls) - 5} more")
            else:
                print("✓ All grant URLs are valid")
        else:
            print("\n⚠️  URL validation skipped (use --check-urls to enable)")
            invalid_urls = []
        
        # Collect all IDs to delete
        ids_to_delete = []
        ids_to_delete.extend([g['id'] for g in fake_grants])
        # Don't auto-delete expired grants, just report them
        # ids_to_delete.extend([g['id'] for g in expired_grants])
        ids_to_delete.extend(duplicate_ids)
        if check_urls:
            ids_to_delete.extend([g['id'] for g in invalid_urls])
        
        # Remove duplicates from deletion list
        ids_to_delete = list(set(ids_to_delete))
        
        # Summary
        print("\n" + "="*70)
        print("CLEANUP SUMMARY")
        print("="*70)
        print(f"Total grants: {total}")
        print(f"Fake/test grants: {len(fake_grants)}")
        print(f"Expired grants: {len(expired_grants)} (not auto-deleted)")
        print(f"Duplicate grants: {len(duplicate_ids)}")
        if check_urls:
            print(f"Invalid URLs: {len(invalid_urls)}")
        print(f"\nTotal to delete: {len(ids_to_delete)}")
        print("="*70 + "\n")
        
        # Delete grants
        if ids_to_delete:
            if self.dry_run:
                print("⚠️  DRY RUN MODE: No changes will be made")
                print(f"To actually delete these grants, run with DRY_RUN=false")
            else:
                confirm = input("\n⚠️  Are you sure you want to delete these grants? (yes/no): ")
                if confirm.lower() == 'yes':
                    deleted = self.delete_grants(ids_to_delete)
                    print(f"\n✓ Deleted {deleted} grants")
                else:
                    print("\n✗ Deletion cancelled")
        else:
            print("✓ No grants need to be deleted")
        
        self.conn.close()
        return True


def main():
    if not DATABASE_URL:
        print("Error: DATABASE_URL environment variable not set")
        print("Usage: DATABASE_URL='your-connection-string' python cleanup_grants.py")
        sys.exit(1)
    
    # Parse command line arguments
    check_urls = '--check-urls' in sys.argv
    
    cleaner = GrantCleaner(DATABASE_URL, dry_run=DRY_RUN)
    cleaner.run_cleanup(check_urls=check_urls)


if __name__ == '__main__':
    main()


