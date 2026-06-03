#!/bin/bash

echo "🚀 Setting up Tem's Portfolio Project"
echo "======================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create backend .env if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env - Please edit it with your configuration"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Start Docker containers
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Run database migrations
echo "🗄️ Running database migrations..."
cd backend
npm run db:migrate
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:3001"
echo "📊 Health check: http://localhost:3001/health"
echo ""
echo "To start the Telegram bot:"
echo "1. Get a bot token from @BotFather"
echo "2. Add it to backend/.env as TELEGRAM_BOT_TOKEN"
echo "3. Run: cd backend && npm run bot"
echo ""
echo "To start development:"
echo "Frontend: npm run dev"
echo "Backend: cd backend && npm run dev"