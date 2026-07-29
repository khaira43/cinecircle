# CineCircle 🎬

A full-stack web application for reviewing and discussing movies and TV shows.
Built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript.

**Live Demo:** https://cinecircle-psi.vercel.app/
**Backend API:** https://cinecircle-khy1.onrender.com
**Repository:** https://github.com/khaira43/cinecircle

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Seeding the Database](#seeding-the-database)
- [Running Tests](#running-tests)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Team](#team)

---

## Project Overview

CineCircle is a community-driven movie and TV show review platform developed
as a course project for EECS4314Z. Users can register, browse media, write
structured reviews with category-based ratings, comment on reviews, vote on
reviews, and manage their accounts. The system features real-time viewer counts
on media pages using WebSockets.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB (Mongoose ODM) |
| Auth | JSON Web Tokens (JWT), bcrypt |
| Real-time | Socket.io |
| Testing | Jest, Supertest |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

---

## Features

- User registration and JWT-based authentication
- Browse and search the media catalogue
- Write reviews with category ratings (Story, Acting, Cinematography)
- One review per user per media item, enforced at the database level
- Comment on reviews
- Upvote and downvote reviews (one vote per user per review, upsert logic)
- Real-time viewer count on media detail pages via WebSocket
- Average rating aggregation displayed on browse and detail pages
- User settings: update profile, change password, delete account

---

## Local Setup

### Prerequisites

Make sure you have the following installed:
- Node.js v18 or higher
- npm v9 or higher
- MongoDB (local instance) or a MongoDB Atlas connection string

### 1. Clone the repository
```bash
git clone https://github.com/khaira43/cinecircle.git
cd cinecircle
```

### 2. Set up the backend
```bash
cd server
cp .env.example .env
```

Open `.env` and fill in your values (see [Environment Variables](#environment-variables)).
```bash
npm install
npm run dev
```

The backend will start on `http://localhost:5000`.

### 3. Set up the frontend

Open a new terminal tab:
```bash
cd client
cp .env.example .env
```

Open `.env` and set:
```
VITE_API_BASE_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000
```
```bash
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`.

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Port the API server listens on (defaults to `5000`). |
| `MONGO_URI` | Connection string for the development/production MongoDB database. |
| `TEST_MONGO_URI` | Connection string for the test database used by `npm run test`. |
| `JWT_SECRET` | Secret used to sign and verify JWT authentication tokens. |
| `CLIENT_URL` | Allowed frontend origin for CORS (e.g. `http://localhost:5173`). |

### Frontend (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Base URL of the backend API (e.g. `http://localhost:5000`). |
| `VITE_API_URL` | Base URL of the backend API (e.g. `http://localhost:5000`). |

Both `server/.env.example` and `client/.env.example` list these variables so you
can copy them with `cp .env.example .env` and fill in your own values.

---

## Seeding the Database

The backend includes a seed script (`server/seed.ts`) that populates the
`Media` collection with a starter catalogue of movies and shows. It connects
using `MONGO_URI`, clears any existing media, then inserts the seed data.

Make sure `MONGO_URI` is set in `server/.env`, then run:
```bash
cd server
npx ts-node seed.ts
```

Expected output:
```
Database seeded successfully
```

> ⚠️ The seed script deletes all existing documents in the `Media`
> collection before inserting, so do not run it against a database whose
> media you want to keep.

---

## Running Tests

Tests run against the `TEST_MONGO_URI` database, never your production
database. Make sure `TEST_MONGO_URI` is set in `server/.env` before running.
```bash
cd server
npm run test
```

Expected output:
```
PASS  tests/auth.test.ts
PASS  tests/reviews.test.ts
PASS  tests/votes.test.ts
PASS  tests/comments.test.ts
PASS  tests/users.test.ts

Test Suites: 5 passed, 5 total
Tests:       52 passed, 52 total
```

### Test coverage

| Test File | What It Covers |
|-----------|---------------|
| `auth.test.ts` | Registration, login, duplicate email/username |
| `reviews.test.ts` | Create, edit, delete, ownership rules, duplicate review prevention |
| `votes.test.ts` | Upvote, downvote, upsert logic, one vote per user enforcement |
| `comments.test.ts` | Post, fetch, delete, ownership rules, auth enforcement |
| `users.test.ts` | View profile, update profile, change password, delete account |

All 52 test cases are tied to functional requirements in the RTM included
in the final project report.

---

## Deployment

| Service | Platform | Purpose |
|---------|----------|---------|
| Frontend | Vercel | Hosts the React/Vite static build |
| Backend | Render | Runs the Node.js/Express API server |
| Database | MongoDB Atlas | Hosts the production MongoDB cluster |


---

## Project Structure

```
cinecircle/
├── client/                 # React + TypeScript + Vite frontend
│   └── src/
│       ├── api/            # API client wrappers
│       ├── assets/         # Static assets
│       ├── components/     # Reusable UI components
│       ├── context/        # React context providers (auth, etc.)
│       ├── pages/          # Route-level page components
│       ├── types/          # Shared TypeScript types
│       └── socket.ts       # Socket.io client setup
├── server/                 # Node.js + Express + TypeScript backend
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Auth and validation middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # Express route definitions
│   │   ├── services/      # Business logic
│   │   ├── db.ts          # Database connection
│   │   ├── app.ts         # Express app setup
│   │   └── index.ts       # Server entry point (HTTP + WebSocket)
│   ├── tests/             # Jest + Supertest test suites
│   └── seed.ts            # Database seed script
└── README.md
```

---

## Team

**EECS4314Z — Group 4**

| Name | Email |
|------|-------|
| Gurkirat Bindra | gb22@my.yorku.ca |
| Ranbir Khaira | ranbirk@my.yorku.ca |
| Arsh Khan | Arsho3@my.yorku.ca |
| Harjap Randhawa | harjap02@my.yorku.ca |
| Prabhjyot Grewal | bhaigrewal16@gmail.com |
| Abdulazeez Al-Daeni | abdul199@my.yorku.ca |
