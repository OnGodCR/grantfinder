#!/bin/bash

# Aggressive Grant Scraper Runner
# This script runs the enhanced scraper to reach 1000+ grants

set -e

echo "========================================="
echo "Aggressive Grant Scraper"
echo "========================================="
echo ""

# Check for required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is required"
    exit 1
fi

# Set defaults
export BACKEND_URL="${BACKEND_URL:-https://grantfinder-production.up.railway.app}"
export INTERNAL_API_TOKEN="${INTERNAL_API_TOKEN:-internal-token-placeholder}"
export MAX_WORKERS="${MAX_WORKERS:-10}"
export MAX_GRANTS_PER_SOURCE="${MAX_GRANTS_PER_SOURCE:-50}"
export GRANT_GOAL="${GRANT_GOAL:-1000}"

echo "Configuration:"
echo "  Backend URL: $BACKEND_URL"
echo "  Max Workers: $MAX_WORKERS"
echo "  Grants per Source: $MAX_GRANTS_PER_SOURCE"
echo "  Goal: $GRANT_GOAL grants"
echo ""

# Install dependencies
echo "Installing dependencies..."
pip install -q -r requirements.txt
echo "✓ Dependencies installed"
echo ""

# Run the aggressive scraper
echo "Starting aggressive scraper..."
python aggressive_scraper.py

echo ""
echo "========================================="
echo "Scraping complete!"
echo "========================================="


