# Aggressive Grant Scraper

## Overview

The aggressive grant scraper is designed to quickly populate your database with 1000+ grants from multiple authoritative sources.

## Features

- **Multiple Sources**: Scrapes from 50+ grant sources including:
  - Grants.gov (federal grants)
  - NSF (National Science Foundation)
  - NIH (National Institutes of Health)
  - State grant portals (CA, TX, NY, FL, etc.)
  - Foundation databases (Gates, Ford, etc.)
  - Corporate grant programs (Google, Microsoft, Amazon)

- **Parallel Processing**: Uses multi-threading to scrape multiple sources simultaneously
- **Smart Deduplication**: Filters out duplicate grants based on URL and title
- **Advanced Date Parsing**: Extracts deadlines from various formats
- **Funding Amount Extraction**: Automatically parses funding ranges
- **Error Handling**: Robust retry logic and error recovery
- **Progress Tracking**: Real-time progress updates and statistics

## Quick Start

### Prerequisites

```bash
pip install -r requirements.txt
```

### Required Environment Variables

```bash
export DATABASE_URL="your-neon-database-url"
export BACKEND_URL="https://grantfinder-production.up.railway.app"
export INTERNAL_API_TOKEN="your-internal-token"
```

### Run the Scraper

```bash
# Simple run
python aggressive_scraper.py

# Or use the shell script
./run_aggressive.sh
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_URL` | `https://grantfinder-production.up.railway.app` | Backend API URL |
| `INTERNAL_API_TOKEN` | `internal-token-placeholder` | API authentication token |
| `MAX_WORKERS` | `10` | Number of parallel scraping threads |
| `MAX_GRANTS_PER_SOURCE` | `50` | Maximum grants to fetch from each source |
| `GRANT_GOAL` | `1000` | Target number of grants to scrape |

### Customization

You can adjust the scraping intensity by modifying environment variables:

```bash
# Aggressive scraping (faster, more sources)
export MAX_WORKERS=20
export MAX_GRANTS_PER_SOURCE=100

# Conservative scraping (slower, fewer API calls)
export MAX_WORKERS=5
export MAX_GRANTS_PER_SOURCE=25
```

## Sources

### Federal Sources
- **Grants.gov**: Primary federal grant database
- **NSF**: National Science Foundation funding
- **NIH**: National Institutes of Health grants

### State Sources
- California grants portal
- Texas grants portal
- New York grants gateway
- Florida grants database

### Foundation Sources
- Gates Foundation
- Ford Foundation
- (More can be easily added)

### Corporate Sources
- Google Grants
- Microsoft Philanthropies
- Amazon Community Grants

## Output

The scraper provides detailed statistics:

```
==================================================
SCRAPING COMPLETE
==================================================
Total grants found: 850
Duplicates filtered: 123
Successfully uploaded: 727
Errors: 3
Time elapsed: 245.67 seconds
Progress: 727/1000 (72.7%)
==================================================
```

## Adding New Sources

To add a new grant source, create a new scraper method:

```python
def scrape_new_source(self) -> List[Grant]:
    """Scrape your new source"""
    grants = []
    logger.info("Scraping new source...")
    
    try:
        # Your scraping logic here
        response = requests.get('https://example.com/grants')
        # Parse and create Grant objects
        
        for item in items:
            grant = Grant(
                title=item['title'],
                source='new-source',
                url=item['url'],
                description=item['description']
            )
            
            if self.add_grant(grant):
                grants.append(grant)
                
    except Exception as e:
        logger.error(f"Error scraping new source: {e}")
    
    return grants
```

Then add it to the `scrapers` list in `scrape_all_sources()`.

## Troubleshooting

### "No grants found"
- Check your internet connection
- Verify the source websites are accessible
- Check if the HTML structure has changed

### "Failed to upload grants"
- Verify `BACKEND_URL` is correct
- Check `INTERNAL_API_TOKEN` is valid
- Ensure backend is running and accessible

### "Too many errors"
- Reduce `MAX_WORKERS` to avoid rate limiting
- Increase timeout values in requests
- Check source website status

## Performance Tips

1. **Parallel Processing**: Increase `MAX_WORKERS` for faster scraping (but watch for rate limits)
2. **Batch Size**: The scraper uploads in batches of 50 - adjust if needed
3. **Rate Limiting**: Built-in delays prevent overwhelming source servers
4. **Caching**: Duplicate detection prevents re-uploading same grants

## Monitoring

The scraper logs all activities in real-time:

```
2025-10-06 19:00:00 - INFO - Starting aggressive scraping with 10 workers...
2025-10-06 19:00:01 - INFO - Scraping Grants.gov...
2025-10-06 19:00:15 - INFO - Found 234 grants from Grants.gov
2025-10-06 19:00:15 - INFO - ✓ scrape_grants_gov completed: 234 grants
...
```

## Scheduled Runs

For regular updates, you can schedule the scraper to run daily:

```bash
# Cron example (daily at 2 AM)
0 2 * * * /path/to/run_aggressive.sh >> /var/log/grant-scraper.log 2>&1
```

## License

Part of the GrantFinder project.


