#!/bin/bash
# GrantFinder Scraper Deployment Script
# This script sets up the scraper with proper environment variables

set -e

echo "🚀 Setting up GrantFinder Scraper..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is required but not installed."
    exit 1
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# GrantFinder Scraper Configuration
# Copy this file and update with your actual values

# Backend API Configuration
BACKEND_INTERNAL_URL=https://your-railway-app.up.railway.app/api/internal/grants
INTERNAL_API_TOKEN=your-internal-api-token-here

# Search API Keys (optional - at least one recommended for internet-wide search)
SERPAPI_KEY=your-serpapi-key-here
BING_API_KEY=your-bing-api-key-here
GOOGLE_API_KEY=your-google-api-key-here
GOOGLE_CSE_ID=your-google-cse-id-here

# Scraper Configuration
SCRAPER_LOG_LEVEL=info
SCRAPER_DRY_RUN=false
SCRAPER_BATCH_LIMIT=50
SCRAPER_HTTP_TIMEOUT=30
SCRAPER_DELAY_MS=300
SCRAPER_MAX_BODY_BYTES=2000000
SCRAPER_RELEVANCE_MIN_SCORE=6

# Search Configuration
SCRAPER_ALLOW_EXTERNAL_FANOUT=true
SCRAPER_FANOUT_MAX_HOSTS=100
SCRAPER_FANOUT_DEPTH=3
SCRAPER_ALLOWED_TLDS=.gov,.edu,.org,.int,.com,.net,.uk,.ca,.au,.de,.fr,.es,.it,.nl,.se,.no,.dk,.fi,.ch,.at,.be,.ie,.pt,.pl,.cz,.hu,.ro,.bg,.hr,.si,.sk,.lt,.lv,.ee,.cy,.mt,.lu

# Grant Keywords (comma-separated)
SCRAPER_KEYWORDS=grant,funding,fellowship,rfp,rfa,solicitation,opportunity,award,scholarship,bursary,stipend,prize,competition,challenge,initiative,program,project,research,innovation,startup,accelerator,incubator,venture,investment,capital,finance,financial,support,assistance,sponsorship,donation,contribution,endowment,bequest,legacy,philanthropy,charitable,nonprofit,foundation,trust,fund,application,apply,deadline,due,closing,submission,proposal,request,call,announcement,notice,circular,bulletin,government,federal,state,local,municipal,public,private,corporate,business,commercial,industry,sector,field,education,academic,university,college,school,institution,research,development,innovation,technology,science,arts,culture,humanities,social,community,health,medical,environment,climate,sustainability,energy,renewable,international,global,worldwide,cross-border,transnational

# Deadline and Amount Hints
SCRAPER_DEADLINE_HINTS=deadline,due date,submission deadline,applications due,closing date,full proposal due,letter of intent due,LOI due
SCRAPER_AMOUNT_HINTS=amount,award,funding,budget,total costs,up to,maximum,min,max,$,€,£
EOF
    echo "✅ Created .env file. Please update it with your actual values."
else
    echo "✅ .env file already exists."
fi

# Make the scraper executable
chmod +x scraper.py

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the .env file with your actual API keys and backend URL"
echo "2. Run the scraper: python3 scraper.py"
echo "3. For dry run: SCRAPER_DRY_RUN=true python3 scraper.py"
echo ""
echo "Required environment variables:"
echo "- BACKEND_INTERNAL_URL: Your Railway backend URL"
echo "- INTERNAL_API_TOKEN: Your internal API token"
echo ""
echo "Optional but recommended for internet-wide search:"
echo "- SERPAPI_KEY: Get from https://serpapi.com/"
echo "- BING_API_KEY: Get from https://azure.microsoft.com/en-us/services/cognitive-services/bing-web-search-api/"
echo "- GOOGLE_API_KEY + GOOGLE_CSE_ID: Get from https://developers.google.com/custom-search/v1/introduction"
echo ""
echo "Happy scraping! 🕷️"
