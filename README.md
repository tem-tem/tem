docker

docker-compose -f docker-compose.prod.yml restart backend

DOCKER_API_VERSION=1.43 docker-compose -f docker-compose.prod.yml up -d --build telegram-bot

# Tem's Portfolio

A dynamic portfolio website with a backend API and Telegram bot for managing projects.

## Architecture

- **Frontend**: SvelteKit with TailwindCSS
- **Backend**: Node.js/Express API
- **Database**: PostgreSQL
- **Bot**: Telegram Bot for project management
- **Deployment**: Docker containers

## Features

- Dynamic project listing with API integration
- Project status management (current, wip, in_review, completed, archived, cancelled)
- Tag system for categorization
- Telegram bot for remote project management
- Server-side rendering with fallback data

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- Telegram Bot Token (optional, for bot functionality)

### Setup

1. **Clone and setup backend**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   npm install
   ```

2. **Start the services**:
   ```bash
   # Start PostgreSQL and Backend API
   docker-compose up -d
   
   # Run database migrations
   cd backend && npm run db:migrate
   ```

3. **Start the frontend**:
   ```bash
   # Install frontend dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

4. **Setup Telegram Bot** (optional):
   - Create a bot with @BotFather on Telegram
   - Add your bot token to `backend/.env`
   - Start the bot: `cd backend && npm run bot`

### API Endpoints

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `GET /api/projects/status/:status` - Get projects by status
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Project Status Values

- `current` - Active/live projects
- `wip` - Work in progress
- `in_review` - Under review
- `completed` - Finished projects
- `archived` - Archived projects
- `cancelled` - Cancelled projects

### Telegram Bot Commands

- `/start` - Welcome message and commands
- `/list` - Show all projects
- `/add` - Add new project (interactive)
- `/edit` - Edit existing project
- `/status` - Change project status
- `/delete` - Delete project
- `/help` - Show help

## Development

### Backend Development

```bash
cd backend
npm run dev  # Start with nodemon for auto-reload
```

### Frontend Development

```bash
npm run dev  # Start SvelteKit dev server
```

### Database Management

```bash
cd backend
npm run db:migrate  # Run migrations
```

## Production Deployment

1. Set production environment variables
2. Build the frontend: `npm run build`
3. Use `docker-compose.prod.yml` for production containers
4. Set up reverse proxy (nginx) for the frontend

## Environment Variables

### Backend (.env)

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tem_portfolio
DB_USER=tem
DB_PASSWORD=password
TELEGRAM_BOT_TOKEN=your_bot_token_here
PORT=3001
```

### Frontend

```env
API_BASE_URL=http://localhost:3001
```

## Database Schema

### Projects Table

- `id` (Serial Primary Key)
- `name` (VARCHAR 255, NOT NULL)
- `description` (TEXT)
- `icon` (VARCHAR 500)
- `href` (VARCHAR 500)
- `status` (VARCHAR 50, DEFAULT 'current')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Project Tags Table

- `id` (Serial Primary Key)
- `project_id` (INTEGER, Foreign Key)
- `tag` (VARCHAR 100, NOT NULL)
- `created_at` (TIMESTAMP)