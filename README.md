# EduPlatform - Interactive Educational Platform

An interactive educational platform with diagnostic assessments and course management for students, teachers, and administrators.

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- MongoDB

### Frontend
- React + Vite
- TypeScript
- SCSS

## Getting Started (Development)

### Prerequisites
- Node.js 20+
- MongoDB
- npm

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update the `.env` file with the correct values

5. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`


## Docker Support (Production)

The project includes Dockerfiles for both frontend and backend, and a docker-compose.yml for easy deployment.

```bash
docker-compose up
```

Aditionally, docker images are also available on GitHub Container Registry (ghcr.io):

```bash
docker pull ghcr.io/ovosimpatico/eduplatform-backend:latest
docker pull ghcr.io/ovosimpatico/eduplatform-frontend:latest
```


## License

This project is licensed under the AGPL-3.0 license. In short, this means:

- You can use, modify, and distribute this software freely
- If you modify and distribute the software, you must share your changes under the same license
- If you run a modified version on a server that others can access, you must provide the source code to those users

For the complete license terms, see the [LICENSE](LICENSE) file.