#!/bin/bash
# Railway deployment script for GrantFinder Scraper

echo "--- GrantFinder Scraper Railway Deployment ---"

# 1. Install Python dependencies
echo "Installing Python dependencies..."
pip install -r scraper/requirements.txt

# 2. Set up environment variables
echo "Setting up environment variables..."

# Check if required environment variables are set
if [ -z "$BACKEND_INTERNAL_URL" ]; then
    echo "Error: BACKEND_INTERNAL_URL environment variable is required"
    exit 1
fi

if [ -z "$INTERNAL_API_TOKEN" ]; then
    echo "Error: INTERNAL_API_TOKEN environment variable is required"
    exit 1
fi

# 3. Run database migration (if needed)
echo "Running database migrations..."
# Note: Railway will handle this automatically if you have a migration setup

# 4. Start the scraper
echo "Starting GrantFinder Scraper..."

# Check if this is a validation-only run
if [ "$1" = "--validate-existing" ]; then
    echo "Running validation-only mode..."
    python3 scraper/scraper.py --validate-existing
else
    echo "Running full scraper..."
    python3 scraper/scraper.py
fi

echo "Scraper deployment completed."
