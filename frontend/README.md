# EduPlatform Frontend

React + TypeScript + Vite + SCSS frontend for EduPlatform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Run the development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

- React 18
- TypeScript
- Vite
- SCSS
- Nginx (for production)

## Docker

### Build the Docker image

```bash
docker build -t eduplatform-frontend .
```

### Run the container

```bash
docker run -p 8080:80 eduplatform-frontend
```

The frontend will be available at http://localhost:8080

### Using Docker Compose

From the project root:
```bash
docker-compose up frontend
```

## Production

The production build uses Nginx to serve the static files with:
- Gzip compression
- Cache headers for static assets
- SPA routing support (serves index.html for all routes)
- Health check endpoint at `/health`
