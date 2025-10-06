#!/bin/bash

# Enhanced Grant Scraper Deployment Script
# This script sets up and runs the enhanced scraper to collect 1000+ grants

set -e

echo "🚀 Starting Enhanced Grant Scraper Deployment..."

# Check if we're in the right directory
if [ ! -f "enhanced_scraper.py" ]; then
    echo "❌ Error: enhanced_scraper.py not found. Please run from the scraper directory."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Set environment variables
echo "🔐 Setting up environment variables..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️ Creating .env file from template..."
    cat > .env << EOF
# Backend Configuration
BACKEND_INTERNAL_URL=https://grantfinder-production.up.railway.app/api/internal/grants
INTERNAL_API_TOKEN=your_internal_api_token_here

# OpenAI Configuration (optional, for AI summaries)
OPENAI_API_KEY=your_openai_api_key_here

# Search API Keys (optional, for enhanced search)
SERPAPI_KEY=your_serpapi_key_here
BING_API_KEY=your_bing_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CSE_ID=your_google_cse_id_here

# Scraper Configuration
SCRAPER_BATCH_LIMIT=50
SCRAPER_DRY_RUN=false
SCRAPER_LOG_LEVEL=info
SCRAPER_HTTP_TIMEOUT=30
SCRAPER_DELAY_MS=500
SCRAPER_MAX_BODY_BYTES=2000000
SCRAPER_RELEVANCE_MIN_SCORE=6
SCRAPER_CONFIDENCE_THRESHOLD=60.0

# Enhanced Features
SCRAPER_ENABLE_AI_SUMMARIES=true
SCRAPER_ENABLE_DUPLICATE_DETECTION=true
SCRAPER_ENABLE_DATE_VALIDATION=true
SCRAPER_ENABLE_AMOUNT_PARSING=true
EOF
    echo "📝 Please edit .env file with your actual API keys and configuration."
    echo "Press Enter to continue after updating .env file..."
    read
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Validate required environment variables
echo "🔍 Validating configuration..."

if [ -z "$BACKEND_INTERNAL_URL" ]; then
    echo "❌ Error: BACKEND_INTERNAL_URL not set in .env file"
    exit 1
fi

if [ -z "$INTERNAL_API_TOKEN" ]; then
    echo "❌ Error: INTERNAL_API_TOKEN not set in .env file"
    exit 1
fi

echo "✅ Configuration validated"

# Test backend connection
echo "🔗 Testing backend connection..."
python3 -c "
import requests
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv('BACKEND_INTERNAL_URL')
token = os.getenv('INTERNAL_API_TOKEN')

if not url or not token:
    print('❌ Missing required environment variables')
    exit(1)

try:
    response = requests.post(
        url,
        json={},
        headers={'Authorization': f'Bearer {token}'},
        timeout=10
    )
    if response.status_code in [200, 400, 422]:
        print('✅ Backend connection successful')
    else:
        print(f'⚠️ Backend returned status {response.status_code}')
except Exception as e:
    print(f'❌ Backend connection failed: {e}')
    exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Backend connection test failed. Please check your configuration."
    exit 1
fi

# Run the enhanced scraper
echo "🎯 Starting enhanced scraper to collect 1000+ grants..."

# Create logs directory
mkdir -p logs

# Run scraper with enhanced configuration
echo "📊 Running enhanced scraper..."
python3 enhanced_scraper.py 2>&1 | tee logs/scraper_$(date +%Y%m%d_%H%M%S).log

# Check if scraper completed successfully
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo "✅ Enhanced scraper completed successfully!"
    
    # Show summary
    echo "📈 Scraping Summary:"
    echo "   - Check logs/scraper_*.log for detailed output"
    echo "   - Grants should now be available in your database"
    echo "   - Run 'python3 enhanced_scraper.py --validate-existing' to validate grants"
    
    # Optional: Run validation
    echo "🔍 Running grant validation..."
    python3 enhanced_scraper.py --validate-existing 2>&1 | tee logs/validation_$(date +%Y%m%d_%H%M%S).log
    
else
    echo "❌ Enhanced scraper failed. Check logs for details."
    exit 1
fi

echo "🎉 Enhanced Grant Scraper deployment completed!"
echo ""
echo "Next steps:"
echo "1. Check your database for new grants"
echo "2. Verify grant data quality in the admin panel"
echo "3. Set up automated scheduling (cron job) for regular scraping"
echo "4. Monitor logs for any issues"
echo ""
echo "To run again:"
echo "  source venv/bin/activate"
echo "  python3 enhanced_scraper.py"
