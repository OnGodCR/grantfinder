# GrantFinder Internet-Wide Scraper

A comprehensive web scraper that searches the entire internet for grant opportunities, funding programs, and research opportunities across multiple categories and sources.

## Features

🌐 **Internet-Wide Search**: Searches across government sites, foundations, universities, corporations, and NGOs
🔍 **Multiple Search Engines**: Supports SerpAPI, Bing, Google Custom Search, and DuckDuckGo
📊 **Comprehensive Categories**: Covers federal grants, foundation funding, academic research, corporate grants, and more
🤖 **AI-Powered Filtering**: Uses relevance scoring to identify grant-related content
🌍 **International Coverage**: Searches across multiple countries and domains
⚡ **High Performance**: Parallel processing and intelligent rate limiting
🛡️ **Robust Error Handling**: Retry logic and graceful failure handling

## Quick Start

1. **Run the deployment script:**
   ```bash
   ./deploy.sh
   ```

2. **Update your `.env` file** with your actual API keys and backend URL

3. **Run the scraper:**
   ```bash
   python3 scraper.py
   ```

## Configuration

### Required Environment Variables

- `BACKEND_INTERNAL_URL`: Your Railway backend URL (e.g., `https://your-app.up.railway.app/api/internal/grants`)
- `INTERNAL_API_TOKEN`: Your internal API token for authentication

### Optional Search API Keys (Recommended for Internet-Wide Search)

- `SERPAPI_KEY`: Get from [SerpAPI](https://serpapi.com/) - Most comprehensive
- `BING_API_KEY`: Get from [Azure Cognitive Services](https://azure.microsoft.com/en-us/services/cognitive-services/bing-web-search-api/)
- `GOOGLE_API_KEY` + `GOOGLE_CSE_ID`: Get from [Google Custom Search](https://developers.google.com/custom-search/v1/introduction)

### Scraper Configuration

- `SCRAPER_DRY_RUN`: Set to `true` to test without posting to backend
- `SCRAPER_BATCH_LIMIT`: Number of grants to process per source (default: 50)
- `SCRAPER_LOG_LEVEL`: Logging level (`debug`, `info`, `warn`, `error`)
- `SCRAPER_HTTP_TIMEOUT`: HTTP request timeout in seconds (default: 30)
- `SCRAPER_DELAY_MS`: Delay between requests in milliseconds (default: 300)

## Search Categories

The scraper searches across these comprehensive categories:

### Government Sources
- **Federal Grants**: NSF, NIH, Grants.gov, SAM.gov
- **State & Local**: State government funding opportunities
- **International**: EU Horizon Europe, UK Research Councils

### Foundation & NGO Grants
- **Major Foundations**: Ford Foundation, Gates Foundation, etc.
- **Nonprofit Organizations**: .org domain searches
- **International NGOs**: Global funding opportunities

### Academic & Research
- **University Grants**: .edu domain searches
- **Research Funding**: Academic research opportunities
- **Fellowships**: Academic and research fellowships

### Corporate & Innovation
- **Corporate Grants**: Company foundation funding
- **Technology Innovation**: SBIR, startup funding
- **Industry Challenges**: Corporate innovation programs

### Specialized Categories
- **Climate & Environment**: Environmental funding
- **Health & Medical**: Medical research grants
- **Arts & Culture**: Cultural funding opportunities
- **Education**: Educational grants and scholarships

## Data Sources

The scraper uses multiple data collection methods:

1. **RSS Feeds**: Direct RSS feed parsing from official sources
2. **Sitemap Crawling**: Automated discovery via XML sitemaps
3. **Web Search**: Internet-wide search using multiple search engines
4. **HTML Crawling**: Deep crawling of specific websites
5. **Auto-Discovery**: Automatic RSS feed discovery from websites

## Output Format

Each grant is processed and sent to your backend with this structure:

```json
{
  "source": "Source Name",
  "sourceId": "unique-identifier",
  "url": "https://example.com/grant-page",
  "title": "Grant Title",
  "description": "Detailed grant description",
  "eligibility": "Eligibility requirements",
  "fundingMin": 10000,
  "fundingMax": 50000,
  "currency": "USD",
  "deadline": "2024-12-31T23:59:59.000Z"
}
```

## Advanced Usage

### Custom Search Queries

You can add custom search queries by editing `sources.yml`:

```yaml
- name: "Custom Search"
  type: search
  queries:
    - "your custom search query"
    - "another specific query"
  max_results_per_query: 20
  limit: 30
```

### Domain Filtering

Control which domains to search:

```bash
SCRAPER_ALLOWED_TLDS=.gov,.edu,.org,.com,.uk,.ca
```

### Relevance Filtering

Adjust the relevance threshold:

```bash
SCRAPER_RELEVANCE_MIN_SCORE=8  # Higher = more strict filtering
```

## Monitoring & Logging

The scraper provides comprehensive logging:

```bash
# Enable debug logging
SCRAPER_LOG_LEVEL=debug python3 scraper.py

# Dry run to test without posting
SCRAPER_DRY_RUN=true python3 scraper.py
```

## Performance Tuning

### Rate Limiting
- Adjust `SCRAPER_DELAY_MS` to control request frequency
- Higher values = more polite, slower scraping
- Lower values = faster, but may trigger rate limits

### Batch Processing
- Increase `SCRAPER_BATCH_LIMIT` for more grants per run
- Monitor your backend's capacity

### Search Engine Limits
- SerpAPI: 100 searches/month (free tier)
- Bing: 1,000 searches/month (free tier)
- Google Custom Search: 100 searches/day (free tier)

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check your `INTERNAL_API_TOKEN`
2. **429 Rate Limited**: Increase `SCRAPER_DELAY_MS`
3. **No results**: Check your search API keys
4. **Timeout errors**: Increase `SCRAPER_HTTP_TIMEOUT`

### Debug Mode

```bash
SCRAPER_LOG_LEVEL=debug SCRAPER_DRY_RUN=true python3 scraper.py
```

## Contributing

To add new grant sources or improve the scraper:

1. Edit `sources.yml` to add new sources
2. Update `scraper.py` for new parsing logic
3. Test with `SCRAPER_DRY_RUN=true`
4. Submit a pull request

## License

This scraper is part of the GrantFinder project. See the main project README for license information.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the logs with debug mode
3. Open an issue in the project repository
