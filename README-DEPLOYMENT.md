# Deployment Guide

This guide covers deploying the backend to a VPS and frontend to Vercel.

## Architecture Overview

```
Internet → Vercel (Frontend) → VPS (Backend + Database + Bot)
                              ↓
                          PostgreSQL Database
                              ↓
                          Telegram Bot
```

## VPS Backend Deployment

### Prerequisites

- Ubuntu/Debian VPS with Docker and Docker Compose
- Domain name pointed to your VPS
- SSL certificate (Let's Encrypt recommended)

### 1. Initial VPS Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin

# Clone your repository
git clone <your-repo-url>
cd tem
```

### 2. Configure Environment

```bash
# Copy and edit environment files
cp .env.example .env
cp backend/.env.example backend/.env

# Edit backend/.env with production values:
nano backend/.env
```

Required backend environment variables:
```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=tem_portfolio
DB_USER=tem
DB_PASSWORD=your_secure_password_here
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
PORT=3001
NODE_ENV=production
```

### 3. Configure Domain and SSL

Update `nginx.conf`:
```bash
# Replace 'your-domain.com' with your actual domain
sed -i 's/your-domain.com/yourdomain.com/g' nginx.conf
```

Get SSL certificate with Let's Encrypt:
```bash
# Install Certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/your-domain.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/your-domain.key
sudo chown -R $USER:$USER ssl/
```

### 4. Deploy

```bash
# Run deployment script
./deploy-vps.sh
```

### 5. Verify Deployment

```bash
# Check services
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs telegram-bot

# Test API
curl https://yourdomain.com/health
curl https://yourdomain.com/api/projects
curl https://yourdomain.com/api/profile
```

## Vercel Frontend Deployment

### 1. Environment Variables

In Vercel dashboard, add environment variable:
- `API_BASE_URL`: `https://yourdomain.com`

### 2. Deploy to Vercel

Option A - Vercel CLI:
```bash
npm i -g vercel
vercel --prod
```

Option B - GitHub Integration:
1. Connect your GitHub repository to Vercel
2. Add the environment variable in Vercel dashboard
3. Deploy automatically on git push

### 3. Configure Build Settings

Vercel should auto-detect SvelteKit. If needed, configure:
- Build Command: `npm run build`
- Output Directory: `.svelte-kit` (auto-detected)
- Install Command: `npm install`

## Telegram Bot Setup

### 1. Create Bot

1. Message @BotFather on Telegram
2. Create new bot with `/newbot`
3. Copy the bot token
4. Add token to `backend/.env` as `TELEGRAM_BOT_TOKEN`

### 2. Configure Bot Commands

```bash
# Set bot commands (optional, done automatically)
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setMyCommands" \
  -H "Content-Type: application/json" \
  -d '{
    "commands": [
      {"command": "start", "description": "Start the bot"},
      {"command": "list", "description": "List all projects"},
      {"command": "add", "description": "Add a new project"},
      {"command": "edit", "description": "Edit existing project"},
      {"command": "status", "description": "Change project status"},
      {"command": "delete", "description": "Delete a project"},
      {"command": "profile", "description": "Edit profile settings"},
      {"command": "help", "description": "Show help"}
    ]
  }'
```

## Maintenance

### Updates

```bash
# Pull latest code
git pull

# Update backend
docker-compose -f docker-compose.prod.yml build backend
docker-compose -f docker-compose.prod.yml up -d backend

# Run new migrations
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate
```

### Backups

```bash
# Database backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U tem -d tem_portfolio > backup-$(date +%Y%m%d).sql

# Restore backup
cat backup.sql | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U tem -d tem_portfolio
```

### Monitoring

```bash
# View all services
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f telegram-bot
docker-compose -f docker-compose.prod.yml logs -f nginx

# Resource usage
docker stats
```

### SSL Certificate Renewal

```bash
# Renew certificate (run monthly via cron)
sudo certbot renew --quiet

# Update nginx certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/your-domain.crt
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/your-domain.key
docker-compose -f docker-compose.prod.yml restart nginx
```

## Troubleshooting

### Common Issues

1. **API not accessible from frontend**:
   - Check CORS configuration in backend
   - Verify API_BASE_URL in Vercel environment variables
   - Check SSL certificate

2. **Database connection issues**:
   - Verify database credentials in backend/.env
   - Check if PostgreSQL container is running
   - Review backend logs

3. **Telegram bot not responding**:
   - Verify TELEGRAM_BOT_TOKEN is correct
   - Check bot container logs
   - Ensure database is accessible from bot service

4. **SSL issues**:
   - Verify certificate files exist and are readable
   - Check nginx configuration
   - Test with curl -k for bypass

### Logs and Debugging

```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs telegram-bot

# Database logs
docker-compose -f docker-compose.prod.yml logs postgres

# Nginx logs
docker-compose -f docker-compose.prod.yml logs nginx

# Enter container for debugging
docker-compose -f docker-compose.prod.yml exec backend sh
```

## Performance Optimization

### Database

```sql
-- Add indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_status_created ON projects(status, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_tags_compound ON project_tags(project_id, tag);
```

### API Caching

Add Redis for caching (optional):

```yaml
# Add to docker-compose.prod.yml
redis:
  image: redis:7-alpine
  restart: unless-stopped
  volumes:
    - redis_data:/data
```

### Frontend Optimization

- Enable Vercel Analytics
- Configure CDN for assets
- Implement service worker for offline support