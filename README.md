# CEN4721-Budgeting-Website

Personal budgeting web application used for tracking spending, goals, and categories. This repository contains a TypeScript/Node backend (Express + Mongoose) and a React frontend (Create React App).

## Key points

- Backend: TypeScript, Express, Mongoose (MongoDB). Entry: `backend/src/server.ts`
- Frontend: React (Create React App). Entry: `frontend/src/index.js`
- Local MongoDB is the simplest option; you may also use MongoDB Atlas with configuration changes.

## Table of contents

- [Prerequisites](#prerequisites)
- [Quick start (development)](#quick-start-development)
- [Environment variables](#environment-variables)
- [Backend scripts and API summary](#backend-scripts-and-api-summary)
- [Frontend scripts](#frontend-scripts)
- [Project structure](#project-structure)
- [Contributing](#contributing)

## Prerequisites

- Node.js (v16+ recommended) and npm
- MongoDB (local) or a MongoDB Atlas cluster

## Quick start (development)

Open two terminals (one for backend, one for frontend). Commands below assume you're using PowerShell on Windows.

1) Install dependencies

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

2) Configure the backend MongoDB database name

Create a file `backend/.env` and add the DB name (copy from `backend/env_template.txt`):

```
DB_NAME="your_database_name"
```

By default the backend connects to `mongodb://localhost:27017/${DB_NAME}`. If you want to use Atlas, either modify the connection code in `backend/src/server.ts` or set the connection URL in a `.env` and update the file accordingly.

3) Run the backend (development)

```powershell
cd backend
npm run dev
```

This uses `nodemon --exec ts-node src/server.ts` and listens on `PORT` or `5000` by default.

4) Run the frontend

```powershell
cd frontend
npm start
```

The React app runs on `http://localhost:3000` by default.

## Environment variables

- `DB_NAME` (required) — the name of the MongoDB database (used in `backend/env_template.txt`).
- `PORT` (optional) — the port for the backend server (defaults to `5000`).

If using a remote MongoDB (Atlas), update the connection string in `backend/src/server.ts` or extend the `.env` with a `MONGO_URI` and change the code to use it.

## Backend scripts and API summary

Location: `backend/package.json`

- `npm run dev` — Run backend in dev mode with ts-node and nodemon
- `npm run build` — Compile TypeScript to `dist/`
- `npm start` — Run the compiled server from `dist/server.js`

Important behavior from `backend/src/server.ts`:

- Connects to MongoDB at `mongodb://localhost:27017/${DB_NAME}`
- Default port: `process.env.PORT || 5000`

Selected API endpoints (use a tool like Postman or fetch from the frontend):

- GET `/` — Root route (sanity check)
- GET `/api/create-test-user` — Creates a test user (`testuser`) if not present
- GET `/api/user/:username` — Get user data
- POST `/api/user/spending/:username` — Add a spending transaction (body: `id`, `item`, `amount`, `transaction_date`)
- DELETE `/api/user/spending/:username` — Delete a transaction (body includes identifier)
- POST `/api/user/categories/:username` — Add a category (body: `name`, `limit`)
- PATCH `/api/user/categories/:username/:oldName` — Edit a category
- POST `/api/user/goals/:username` — Add a goal (body: `id`, `description`, `amount`, `due_date`)
- PATCH `/api/user/goals/:username/:id` — Edit a goal
- DELETE `/api/user/goals/:username/:id` — Delete a goal

The user model is defined in `backend/src/database.ts` and contains `username`, `goals`, `categories`, and `spending` arrays.

## Frontend scripts

Location: `frontend/package.json`

- `npm start` — Start the React development server
- `npm run build` — Create a production build in `frontend/build`
- `npm test` — Run tests (created by CRA)

The frontend communicates with the backend (default backend port 5000). If you change the backend port, update the frontend API URLs accordingly.

## Project structure (top-level)

- `backend/` — TypeScript Express API (MongoDB + Mongoose)
	- `src/` — server and database model
	- `env_template.txt` — required DB_NAME variable
- `frontend/` — React Create React App frontend
- `package.json` — (root) small dependency listing, main work is inside the two folders above

## Contributing

1. Create a branch for your feature: `git checkout -b feature/your-feature`
2. Make changes, add tests where helpful
3. Run the backend and frontend locally to verify behavior
4. Open a PR with a clear description of the change

