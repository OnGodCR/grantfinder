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
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy scraper files
COPY scraper.py .
COPY sources.yml .
COPY deploy.sh .

# Make deploy script executable
RUN chmod +x deploy.sh

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV SCRAPER_LOG_LEVEL=info

# Default command
CMD ["python3", "scraper.py"]
