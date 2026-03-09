# Mentora

A full-stack mentorship platform that connects parents, mentors, and students. Parents browse lessons, book sessions for their children, and track attendance. Mentors manage their lessons and sessions. Both roles get role-specific dashboards with AI-powered session summaries.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4, Zustand, React Router 7 |
| Backend | Node.js 18+, Express 5, MongoDB, Mongoose 9 |
| Auth | JWT (7-day tokens), bcrypt password hashing |
| AI | Google Gemini API with multi-model fallback chain |
| Validation | Zod (backend) |
| Security | Helmet, CORS lockdown, express-rate-limit |
| Testing | Jest, Supertest |

---

## Features

**For Parents**
- Register / login with JWT-based auth
- Add and manage student profiles (children)
- Browse all available lessons with mentor info
- Book lessons for specific students, with duplicate booking prevention
- View all bookings and session history
- Mark session attendance (join / leave)
- AI-powered session summarizer — paste any text, get bullet-point summary

**For Mentors**
- Role-separated dashboard and navigation
- Create, edit, and delete lessons
- Create and manage sessions (date, topic, summary)
- View enrolled students and session attendance data

**Platform**
- Role-based access control on every endpoint
- Global rate limiting (100 req / 15 min) + per-route LLM limiter (10 req / min)
- AI with multi-model fallback: if one Gemini model hits its quota, the next is tried automatically
- Full REST API with consistent error responses

---

## Project Structure

```
Mentora/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection, env validation
│   │   ├── controllers/    # Route handler logic
│   │   ├── middleware/     # Auth, error handling, rate limiting
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   ├── utils/          # LLM client (Gemini fallback)
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/              # Jest + Supertest integration tests
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/     # Navbar, Sidebar, ProtectedRoute, Loading
    │   ├── pages/          # Auth, Dashboard, Students, Lessons,
    │   │                   # Bookings, Sessions, LLM
    │   ├── services/       # Axios API layer
    │   ├── store/          # Zustand auth store
    │   └── App.jsx
    └── .env.example
```

---

## Database Schema

```
User          — name, email, password (hashed), role (parent | mentor)
Student       — name, age, parentId → User
Lesson        — title, description, mentorId → User
Booking       — studentId → Student, lessonId → Lesson, parentId → User
                unique index on (studentId, lessonId) prevents duplicates
Session       — lessonId → Lesson, date, topic, summary, attendees[]
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- Google AI Studio API key ([get one free](https://aistudio.google.com))

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev            # runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:5000
npm run dev            # runs on http://localhost:5173
```

### Environment Variables

**`backend/.env`**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/mentora
JWT_SECRET=your_32_char_minimum_secret
GEMINI_API_KEY=your_google_ai_studio_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**`frontend/.env`**
```
VITE_API_URL=http://localhost:5000
```

### Running Tests

```bash
cd backend
npm test                # run all tests
npm run test:coverage   # with coverage report
```

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | — | Register (parent or mentor) |
| POST | `/auth/login` | — | Login, returns JWT |
| GET | `/auth/me` | Bearer | Get current user |

### Students *(parent only)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/students` | List own students |
| POST | `/students` | Create student |
| PUT | `/students/:id` | Update student |
| DELETE | `/students/:id` | Delete student |

### Lessons
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/lessons` | — | Browse all lessons |
| POST | `/lessons` | Mentor | Create lesson |
| PUT | `/lessons/:id` | Mentor | Update lesson |
| DELETE | `/lessons/:id` | Mentor | Delete lesson |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/bookings` | Bearer | List bookings (role-filtered) |
| POST | `/bookings` | Parent | Book a lesson for a student |
| DELETE | `/bookings/:id` | Parent | Cancel booking |

### Sessions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/sessions` | Bearer | List sessions (role-filtered) |
| POST | `/sessions` | Mentor | Create session |
| PUT | `/sessions/:id` | Mentor | Update session |
| DELETE | `/sessions/:id` | Mentor | Delete session |
| POST | `/sessions/:id/join` | Parent | Mark attendance (join) |
| POST | `/sessions/:id/leave` | Parent | Mark attendance (leave) |

### AI Summary
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/llm/summarize` | Summarize text (50–10,000 chars) into bullet points |

Gemini fallback chain: `gemini-2.5-flash` → `gemini-2.5-flash-lite` → `gemini-3.0-flash` → `gemini-3.1-flash-lite`  
On a 429 rate-limit response the next model is tried automatically.

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Uptime and service status |

---

## Deployment

**Railway** (backend) + **Vercel** (frontend) + **MongoDB Atlas**

### 1. MongoDB Atlas
1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user and whitelist `0.0.0.0/0` (required for Railway's dynamic IPs)
3. Copy the connection string — this becomes `MONGO_URI`

### 2. Backend — Railway
1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select your repo, then under **Settings** set **Root Directory** to `backend`
3. Railway auto-detects Node.js and runs `npm start` — no extra config needed
4. Add environment variables in the Railway dashboard:
   ```
   NODE_ENV=production
   MONGO_URI=...your Atlas URI...
   JWT_SECRET=...strong random string (32+ chars)...
   GEMINI_API_KEY=...your key...
   FRONTEND_URL=https://your-app.vercel.app
   ```
   > **Note:** Do **not** set `PORT` — Railway injects it automatically.
5. Deploy → copy the generated Railway URL (e.g. `https://mentora-api.up.railway.app`)

### 3. Frontend — Vercel
1. Go to [vercel.com](https://vercel.com) → **New Project** → import same repo
2. Set **Root Directory** to `frontend`
3. Build command: `npm run build` — Output directory: `dist`
4. Add environment variable:
   ```
   VITE_API_URL=https://mentora-api.up.railway.app
   ```
   > Vite bakes this in at build time — must be set before deploying.
5. Deploy → copy your Vercel URL

### 4. Wire them together
Go back to Railway → update `FRONTEND_URL` to your Vercel domain → redeploy.  
This activates the CORS lockdown so the backend only accepts requests from your frontend.

---

## License

MIT
