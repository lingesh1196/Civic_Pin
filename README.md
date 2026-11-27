# CivicPin

**CivicPin** is a MERN-based platform for reporting local civic issues like potholes, garbage, and broken streetlights with photos and location. Citizens upvote issues for priority, while admins track and resolve them via a dashboard — bridging the gap between communities and authorities for faster, transparent civic action.

## Features

- **Report Civic Issues**: Submit reports with title, category, severity, description, photo upload (Multer), and exact interactive map pin location (Leaflet).
- **Community Upvoting & Discussion**: Citizens upvote issues to surface high-priority problems and post updates/comments.
- **Interactive Map & Grid Views**: Switch between a searchable, filterable card grid and a live color-coded civic issue map.
- **Admin Operations Dashboard**: View KPIs, category breakdown, triage issues sorted by community upvotes, update statuses (`Open` → `In Progress` → `Resolved` / `Rejected`), assign departments, and publish official resolution notes.
- **Transparent Status Timeline**: Every status transition and official note is logged on the issue's timeline.
- **MongoDB + Zero-Config Fallback**: Connects to MongoDB via Mongoose when `MONGODB_URI` is configured, and automatically falls back to a persistent local JSON store (`server/data/db.json`) for instant local development.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, React Router, Leaflet, Lucide Icons
- **Backend**: Node.js, Express, Mongoose (MongoDB), JWT Auth, bcryptjs, Multer

## Getting Started

```bash
# Install dependencies for both server and client
npm run install:all

# Start the Express API server (port 5000)
npm run dev:server

# In another terminal, start the React frontend (port 5173)
npm run dev:client
```

## Database Setup (MongoDB)

CivicPin uses **MongoDB + Mongoose** (`server/models/User.js`, `server/models/Issue.js`).

### Option 1: Docker (Local MongoDB)
```bash
docker compose up -d
cp server/.env.example server/.env
npm --prefix server run seed
```

### Option 2: MongoDB Atlas (Free Cloud)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) and copy your connection string.
2. Create `server/.env` from `server/.env.example` and set:
   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/civicpin
   JWT_SECRET=your_secret_key
   ```
3. Run `npm --prefix server run seed` to populate demo accounts and sample civic issues (or just start the server — it auto-seeds on first run).

> If `MONGODB_URI` is not set or MongoDB is unreachable, the server automatically falls back to a persistent local JSON store (`server/data/db.json`) so the app still runs out of the box.

### Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Citizen** | `citizen@civicpin.org` | `citizen123` |
| **Admin** | `admin@civicpin.org` | `admin123` |
