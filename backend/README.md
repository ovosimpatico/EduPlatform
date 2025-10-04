# EduPlatform Backend

Node.js + TypeScript + Express backend for EduPlatform.

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

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests

## API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check endpoint
