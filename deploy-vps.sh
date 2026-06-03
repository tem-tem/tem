#!/bin/bash

echo "🚀 Deploying to VPS..."
echo "====================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating from example..."
    cp .env.example .env
    echo "📝 Please edit .env with your production values and run again."
    exit 1
fi

# Check if backend/.env exists
if [ ! -f backend/.env ]; then
    echo "❌ backend/.env file not found. Creating from example..."
    cp backend/.env.example backend/.env
    echo "📝 Please edit backend/.env with your production values and run again."
    exit 1
fi

# Pin Docker client API version to match the server's maximum supported version
export DOCKER_API_VERSION=1.43

# Load environment variables (skip blank lines and comments)
set -a
# shellcheck disable=SC1090
source <(grep -v '^\s*#' .env | grep -v '^\s*$')
source <(grep -v '^\s*#' backend/.env | grep -v '^\s*$')
set +a

echo "🔍 Environment loaded"

# Validate required variables
if [ -z "$DB_PASSWORD" ]; then
    echo "❌ DB_PASSWORD is required in backend/.env"
    exit 1
fi

# Pull latest changes (if using git)
if [ -d .git ]; then
    echo "📥 Pulling latest changes..."
    git pull
fi

# Stop existing services
echo "🛑 Stopping existing services..."
docker-compose -f docker-compose.prod.yml down

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 15

# Run migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T backend npm run db:migrate

# Check service health
echo "🏥 Checking service health..."
sleep 10

# Test API endpoint
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ API is healthy!"
else
    echo "❌ API health check failed"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 API: http://your-domain.com"
echo "🏥 Health: http://your-domain.com/health"
echo "📚 API Docs: http://your-domain.com/"
echo ""
echo "📋 Next steps:"
echo "1. Configure your domain DNS to point to this server"
echo "2. Update nginx.conf with your actual domain name"
echo "3. Add SSL certificates to ./ssl/ directory"
echo "4. Restart nginx: docker-compose -f docker-compose.prod.yml restart nginx"
echo ""
echo "📱 Telegram Bot:"
if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
    echo "✅ Bot should be running"
else
    echo "⚠️  Add TELEGRAM_BOT_TOKEN to backend/.env and restart"
fi