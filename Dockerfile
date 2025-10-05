FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libxml2-dev \
    libxslt1-dev \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY scraper/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy scraper files
COPY scraper/scraper.py .
COPY scraper/sources.yml .
COPY railway-deploy.sh .

# Make deploy script executable
RUN chmod +x railway-deploy.sh

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV SCRAPER_LOG_LEVEL=info

# Default command
CMD ["python3", "scraper.py"]
