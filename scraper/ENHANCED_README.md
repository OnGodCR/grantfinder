# Enhanced Grant Scraper

A comprehensive, multi-source grant scraping system designed to collect 1000+ high-quality grants from various sources including federal agencies, foundations, international organizations, universities, and more.

## 🚀 Key Features

### Advanced Date Parsing
- **Multiple Format Support**: Handles various date formats including relative dates, absolute dates, natural language, and structured dates
- **Timezone Awareness**: Properly handles timezone conversions and UTC storage
- **Date Validation**: Ensures dates are reasonable and in the future
- **Context-Aware Parsing**: Uses surrounding text to improve date extraction accuracy

### Enhanced Grant Separation
- **Duplicate Detection**: Uses fuzzy matching to identify and remove duplicate grants
- **Confidence Scoring**: Calculates quality scores for each grant based on multiple factors
- **Category Classification**: Automatically categorizes grants (research, fellowship, equipment, etc.)
- **Status Tracking**: Monitors grant status (active, expired, urgent, approaching)

### Comprehensive Source Coverage
- **Federal Government**: NSF, NIH, Grants.gov, SAM.gov (300+ grants)
- **Foundations**: Ford, Gates, MacArthur, Rockefeller, Sloan, Hewlett (250+ grants)
- **International**: EU Horizon Europe, UK Research Councils, Canadian Research (200+ grants)
- **Academic**: Universities, Research Institutes (200+ grants)
- **Technology**: SBIR/STTR, Innovation Grants, AI/ML (150+ grants)
- **Specialized Fields**: Climate, Health, Arts, Education, Social Impact (200+ grants)
- **Corporate & CSR**: Corporate grants and social responsibility programs (100+ grants)

### Data Quality Improvements
- **AI-Enhanced Summaries**: Uses OpenAI GPT to generate better titles and summaries
- **Amount Parsing**: Advanced currency detection and amount extraction
- **Eligibility Extraction**: Better parsing of eligibility requirements
- **Keyword Extraction**: Automatic keyword tagging for better searchability

## 📋 Prerequisites

- Python 3.8+
- Virtual environment (recommended)
- Backend API access
- Optional: OpenAI API key for AI summaries
- Optional: Search API keys (SerpAPI, Bing, Google) for enhanced search

## 🛠️ Installation

1. **Clone and Navigate**
   ```bash
   cd scraper
   ```

2. **Run the Enhanced Deployment Script**
   ```bash
   ./enhanced_deploy.sh
   ```

   This script will:
   - Create a virtual environment
   - Install all dependencies
   - Set up environment variables
   - Test backend connection
   - Run the enhanced scraper

3. **Manual Installation** (if needed)
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Backend Configuration
BACKEND_INTERNAL_URL=https://your-backend-url/api/internal/grants
INTERNAL_API_TOKEN=your_internal_api_token

# OpenAI Configuration (optional)
OPENAI_API_KEY=your_openai_api_key

# Search API Keys (optional)
SERPAPI_KEY=your_serpapi_key
BING_API_KEY=your_bing_api_key
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CSE_ID=your_google_cse_id

# Scraper Configuration
SCRAPER_BATCH_LIMIT=50
SCRAPER_DRY_RUN=false
SCRAPER_LOG_LEVEL=info
SCRAPER_HTTP_TIMEOUT=30
SCRAPER_DELAY_MS=500
SCRAPER_CONFIDENCE_THRESHOLD=60.0
```

### Source Configuration

The scraper uses `enhanced_sources.yml` which contains:
- **50+ different grant sources**
- **Multiple collection methods** (RSS, HTML scraping, web search, sitemap)
- **Custom parsing rules** for each source
- **Priority levels** for source importance

## 🎯 Usage

### Basic Usage

```bash
# Run the enhanced scraper
python3 enhanced_scraper.py

# Run with validation
python3 enhanced_scraper.py --validate-existing

# Dry run (test without posting)
SCRAPER_DRY_RUN=true python3 enhanced_scraper.py
```

### Advanced Usage

```bash
# Run specific source categories
python3 enhanced_scraper.py --sources federal,foundation

# Set custom confidence threshold
SCRAPER_CONFIDENCE_THRESHOLD=70.0 python3 enhanced_scraper.py

# Enable detailed logging
SCRAPER_LOG_LEVEL=debug python3 enhanced_scraper.py
```

## 📊 Expected Results

The enhanced scraper is designed to collect **1000+ grants** with the following distribution:

| Category | Expected Grants | Sources |
|----------|----------------|---------|
| Federal Government | 300+ | NSF, NIH, Grants.gov, SAM.gov |
| Foundations | 250+ | Ford, Gates, MacArthur, Rockefeller, etc. |
| International | 200+ | EU, UK, Canada, Australia |
| Academic | 200+ | Universities, Research Institutes |
| Technology | 150+ | SBIR/STTR, Innovation, AI/ML |
| Specialized | 200+ | Climate, Health, Arts, Education |
| Corporate | 100+ | CSR, Corporate Foundations |
| **Total** | **1000+** | **50+ Sources** |

## 🔍 Data Quality Features

### Confidence Scoring
Each grant receives a confidence score (0-100) based on:
- Title quality and relevance (0-30 points)
- Description completeness (0-25 points)
- Deadline presence and validity (0-20 points)
- Funding information availability (0-15 points)
- Grant-specific keyword presence (0-10 points)

### Duplicate Detection
- Uses fuzzy string matching (Levenshtein distance)
- Compares titles and descriptions
- Configurable similarity threshold (default: 80%)
- Keeps highest confidence grant from duplicate groups

### Date Parsing Enhancements
- **Relative dates**: "30 days from now", "next month"
- **Absolute dates**: Various formats (MM/DD/YYYY, YYYY-MM-DD, etc.)
- **Natural language**: "end of quarter", "next Tuesday"
- **Structured dates**: Form fields, tables, structured content

### Amount Parsing
- **Currency detection**: USD, EUR, GBP, JPY, INR
- **Range handling**: "$50,000 - $100,000"
- **Multiplier support**: "up to $2M", "€500K"
- **Multiple patterns**: Various amount description formats

## 📈 Monitoring and Logging

### Log Files
- `logs/scraper_YYYYMMDD_HHMMSS.log` - Main scraper output
- `logs/validation_YYYYMMDD_HHMMSS.log` - Grant validation results

### Log Levels
- `debug`: Detailed parsing information
- `info`: General progress and results
- `warn`: Non-fatal issues
- `error`: Fatal errors

### Key Metrics
- Total grants processed
- High-quality grants (confidence > threshold)
- Duplicates removed
- Successfully posted grants
- Processing time per source

## 🔧 Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Check `BACKEND_INTERNAL_URL` and `INTERNAL_API_TOKEN`
   - Verify backend is running and accessible
   - Check network connectivity

2. **Low Grant Quality**
   - Adjust `SCRAPER_CONFIDENCE_THRESHOLD`
   - Check source-specific parsing rules
   - Verify source URLs are accessible

3. **Rate Limiting**
   - Increase `SCRAPER_DELAY_MS`
   - Reduce `SCRAPER_BATCH_LIMIT`
   - Check source-specific rate limits

4. **Date Parsing Issues**
   - Check source-specific date patterns
   - Verify timezone settings
   - Review date validation rules

### Debug Mode

```bash
SCRAPER_LOG_LEVEL=debug python3 enhanced_scraper.py
```

## 🚀 Performance Optimization

### Scaling for 1000+ Grants
- **Parallel Processing**: Process multiple sources simultaneously
- **Batch Operations**: Group API calls for efficiency
- **Caching**: Cache parsed content to avoid re-processing
- **Incremental Updates**: Only process new/updated grants

### Resource Management
- **Memory Usage**: Process grants in batches
- **Network Optimization**: Use connection pooling
- **Error Handling**: Robust retry mechanisms
- **Timeout Management**: Configurable timeouts per source

## 📅 Scheduling

### Cron Job Setup
```bash
# Run every 6 hours
0 */6 * * * cd /path/to/scraper && ./enhanced_deploy.sh

# Run daily at 2 AM
0 2 * * * cd /path/to/scraper && ./enhanced_deploy.sh

# Run weekly on Sunday at 1 AM
0 1 * * 0 cd /path/to/scraper && ./enhanced_deploy.sh
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python3", "enhanced_scraper.py"]
```

## 🤝 Contributing

### Adding New Sources
1. Add source configuration to `enhanced_sources.yml`
2. Define appropriate parsing rules
3. Test with `SCRAPER_DRY_RUN=true`
4. Monitor quality metrics

### Improving Parsing
1. Update parsing patterns in the scraper
2. Add new date/amount formats
3. Enhance confidence scoring
4. Test with diverse grant sources

## 📞 Support

For issues or questions:
1. Check the logs for error details
2. Review the troubleshooting section
3. Verify configuration settings
4. Test with dry run mode first

## 🎯 Success Metrics

A successful run should achieve:
- **1000+ unique grants** collected
- **80%+ confidence score** average
- **<5% duplicate rate** after deduplication
- **90%+ valid dates** parsed correctly
- **85%+ funding amounts** extracted
- **<2% error rate** overall

The enhanced scraper is designed to be robust, scalable, and maintainable while providing high-quality grant data for your application.
