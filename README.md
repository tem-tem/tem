# Tem's Portfolio

A dynamic portfolio website with a backend API and Telegram bot for managing projects.

## Architecture

- **Frontend**: SvelteKit with TailwindCSS
- **Backend**: Node.js/Express API
- **Database**: PostgreSQL
- **Bot**: Telegram Bot for project management
- **Deployment**: Docker containers

---

## Production Commands

> All commands must be run from `~/tem`. Always prefix docker/docker-compose with `DOCKER_API_VERSION=1.43`.

### Restart backend

```bash
cd ~/tem
DOCKER_API_VERSION=1.43 docker-compose -f docker-compose.prod.yml restart backend
```

### Rebuild & restart telegram bot

```bash
cd ~/tem
git pull
DOCKER_API_VERSION=1.43 docker-compose -f docker-compose.prod.yml build --no-cache telegram-bot
DOCKER_API_VERSION=1.43 docker-compose -f docker-compose.prod.yml up -d telegram-bot
```

### Rebuild & restart backend

```bash
cd ~/tem
git pull
DOCKER_API_VERSION=1.43 docker-compose -f docker-compose.prod.yml build --no-cache backend
DOCKER_API_VERSION=1.43 docker-compose -f docker-compose.prod.yml up -d backend
```

### Run database migrations

```bash
cd ~/tem
DOCKER_API_VERSION=1.43 docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate
```

> Note: migrations must run inside the backend container — postgres is not exposed to the host.

### View logs

```bash
cd ~/tem
DOCKER_API_VERSION=1.43 docker-compose -f docker-compose.prod.yml logs -f backend
DOCKER_API_VERSION=1.43 docker-compose -f docker-compose.prod.yml logs -f telegram-bot
```

### List running containers

```bash
DOCKER_API_VERSION=1.43 docker ps
```

---

## API Endpoints

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `GET /api/projects/status/:status` - Get projects by status
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## Project Status Values

- `current` - Active/live projects
- `wip` - Work in progress
- `in_review` - Under review
- `completed` - Finished projects
- `archived` - Archived projects
- `cancelled` - Cancelled projects

## Telegram Bot Commands

- `/start` - Welcome message and commands
- `/list` - Show all projects
- `/add` - Add new project (interactive)
- `/edit` - Edit existing project
- `/status` - Change project status
- `/order` - Set display order for a project
- `/delete` - Delete project
- `/help` - Show help

---

## Environment Variables

### Backend (`backend/.env`)

```env
DB_HOST=localhost
DB_PORT=1995
DB_NAME=tem_portfolio
DB_USER=tem
DB_PASSWORD=your_password
TELEGRAM_BOT_TOKEN=your_bot_token_here
PORT=19950804
```

### Frontend (`.env`)

```env
API_BASE_URL=https://portfolio.tem.dev
```

---

## Database Schema

### Projects Table

- `id` (Serial Primary Key)
- `name` (VARCHAR 255, NOT NULL)
- `description` (TEXT)
- `icon` (VARCHAR 500)
- `href` (VARCHAR 500)
- `status` (VARCHAR 50, DEFAULT 'current')
- `display_order` (INTEGER, nullable — lower = shown first)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Project Tags Table

- `id` (Serial Primary Key)
- `project_id` (INTEGER, Foreign Key)
- `tag` (VARCHAR 100, NOT NULL)
- `created_at` (TIMESTAMP)
