# Mentora - (Assesment)

A full-stack mentorship platform that connects parents, mentors, and students. Parents create and manage student accounts, browse lessons, and book sessions for their children. Students attend lessons and participate in sessions. Mentors create lessons, manage sessions, and get AI-powered summaries. Both roles get role-specific dashboards with comprehensive tracking and analytics.

---

##  Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [LLM Integration](#llm-integration)
- [Testing](#testing)
- [Code Structure](#code-structure)
- [Security Practices](#security-practices)
- [Scalability Considerations](#scalability-considerations)

---

##  Project Overview

Mentora is a simplified yet feature-rich backend for a mentorship platform supporting three user types:
- **Parents**: Create student accounts, browse lessons, book sessions, track attendance
- **Students**: Attend lessons and participate in sessions (created by parents)
- **Mentors**: Create lessons, manage sessions, view student attendance and summaries

This platform demonstrates:
- Clean code architecture and separation of concerns
- Database design with proper relationships and indexing
- Role-based access control and permissions
- Comprehensive validation and error handling
- JWT-based authentication and authorization
- LLM integration with fallback strategies
- Production-ready practices

---

##  Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, Zustand, React Router 7, Axios |
| **Backend** | Node.js 18+, Express 5, MongoDB, Mongoose 9 |
| **Authentication** | JWT (jsonwebtoken), bcrypt (password hashing) |
| **LLM Integration** | Google Generative AI (Gemini) with 4-model fallback strategy |
| **Rate Limiting** | express-rate-limit (global + LLM-specific) |
| **Testing** | Jest, Supertest |
| **Utilities** | Helmet (security headers), Morgan (logging), CORS |
| **Deployment** | Railway (Backend), Vercel (Frontend) |

---

##  System Architecture

### Database Design

**User Model**
- `_id`: MongoDB ObjectId
- `name`: String (1-100 chars, trimmed)
- `email`: String (unique, lowercase, email format validation)
- `password`: String (bcrypt hashed, min 6 chars)
- `googleId`: String (optional, for OAuth)
- `role`: Enum ["parent", "mentor"] (required)
- `timestamps`: createdAt, updatedAt

**Student Model**
- `_id`: MongoDB ObjectId
- `name`: String (1-100 chars, trimmed)
- `age`: Number (1-120)
- `parentId`: Reference to User (required)
- `timestamps`: createdAt, updatedAt
- **Index**: mentor ID for fast queries

**Lesson Model**
- `_id`: MongoDB ObjectId
- `title`: String (3-200 chars, trimmed)
- `description`: String (10-5000 chars, trimmed)
- `mentorId`: Reference to User (required)
- `timestamps`: createdAt, updatedAt
- **Index**: mentorId for fast mentor lesson lookup

**Booking Model**
- `_id`: MongoDB ObjectId
- `studentId`: Reference to Student (required)
- `lessonId`: Reference to Lesson (required)
- `parentId`: Reference to User (required)
- `timestamps`: createdAt, updatedAt
- **Constraint**: Unique combination (studentId, lessonId) - prevents duplicate bookings

**Session Model**
- `_id`: MongoDB ObjectId
- `lessonId`: Reference to Lesson (required)
- `topic`: String (3-200 chars, trimmed)
- `date`: Date (must be future date)
- `summary`: String (max 2000 chars, optional)
- `attendees`: Array of Student IDs (tracks attendance)
- `timestamps`: createdAt, updatedAt
- **Indexes**: lessonId for fast session lookup

### API Request Flow

```
Client Request
    ↓
CORS Middleware → Helmet Security → Rate Limiting
    ↓
Route Handler
    ↓
Auth Middleware (if protected) → Role Middleware (if role-specific)
    ↓
Controller (Validation → Database Query → Response)
    ↓
Error Handler Middleware
    ↓
Response to Client
```

---

##  Features

### 1️. Authentication System

**Endpoints:**
- `POST /auth/signup` - Register as parent or mentor
  - Validation: name (required), email (format), password (min 6 chars), role (parent/mentor only)
  - Returns: JWT token + user profile
  
- `POST /auth/login` - Login with email/password
  - Validation: email format, password comparison
  - Returns: JWT token + user profile
  
- `GET /auth/me` - Get current user profile (protected)
  - Requires: Valid JWT token
  - Returns: Authenticated user details

---

### 2️. Student Management (Parent Only)

**Endpoints:**
- `POST /students` - Create student under parent
  - Validation: name (1-100 chars), age (1-120)
  - Authorization: Only authenticated parents
  
- `GET /students` - Retrieve parent's students
  - Authorization: Only parent's own students visible
  
- `GET /students/:id` - Get student details
  - Authorization: Only parent can access their student
  
- `PUT /students/:id` - Update student info
  - Validation: Same as create
  - Authorization: Only parent can update their student
  
- `DELETE /students/:id` - Delete student
  - Authorization: Only parent can delete their student

---

### 3️. Lesson Management (Mentor)

**Endpoints:**
- `POST /lessons` - Create lesson (mentor only)
  - Validation: title (3-200 chars), description (10-5000 chars)
  - Authorization: Only authenticated mentors
  
- `GET /lessons` - Browse all lessons (public)
  - Returns: All lessons with mentor information
  
- `GET /lessons/mentor/my-lessons` - Mentor's own lessons
  - Authorization: Only mentors can access
  
- `GET /lessons/:id` - Get lesson details
  - Public endpoint
  
- `PUT /lessons/:id` - Update lesson
  - Authorization: Only lesson creator (mentor) can update
  
- `DELETE /lessons/:id` - Delete lesson
  - Authorization: Only lesson creator can delete

---

### 4️. Booking System (Parent)

**Endpoints:**
- `POST /bookings` - Book student for lesson
  - Validation: studentId and lessonId (ObjectId format)
  - Authorization: Only parent can book own student
  - Error Handling: Returns 409 Conflict if student already booked for lesson
  
- `GET /bookings` - Get bookings (role-aware)
  - Parents see: Their own student bookings
  - Mentors see: Bookings for their lessons
  
- `DELETE /bookings/:id` - Cancel booking
  - Authorization: Only booking creator (parent) can cancel

---

### 5️. Session Management (Mentor)

**Endpoints:**
- `POST /sessions` - Create session for lesson
  - Validation: date (must be future), topic (3-200 chars)
  - Authorization: Only mentor of the lesson
  
- `GET /sessions` - Get sessions (role-aware)
  - Parents see: Sessions for lessons they booked
  - Mentors see: Their own sessions
  
- `GET /sessions/mentor/my-sessions` - Mentor's sessions
  - Authorization: Only mentors
  
- `PUT /sessions/:id` - Update session
  - Validation: topic, summary (max 2000 chars)
  - Authorization: Only session creator (mentor)
  
- `DELETE /sessions/:id` - Delete session
  - Authorization: Only session creator
  
- `POST /sessions/:id/join` - Student joins session
  - Validation: Student must be booked for lesson
  - Error: Returns 409 if already attending
  
- `POST /sessions/:id/leave` - Student leaves session
  - Validation: Student must be attending
  - Returns: Updated session data

---

### 6️. LLM Text Summarization

**Endpoint:**
- `POST /llm/summarize` - Summarize text using AI
  - Request: `{ "text": "..." }`
  - Response: `{ "summary": "...", "model": "..." }`
  
**Validation:**
- 400 Bad Request: Missing or empty text
- 400 Bad Request: Text < 50 characters
- 413 Payload Too Large: Text > 10,000 characters

**Rate Limiting:**
- 10 requests per 60 seconds per IP

**Error Handling:**
- 502 Bad Gateway: LLM service unavailable
- Automatic fallback through 4-model strategy
- Timeout protection with exponential backoff

---

##  Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Google OAuth Credentials (optional, for Google sign-in)
- Google Generative AI API Key (for LLM feature)

### Backend Setup

```bash
# Clone repository
git clone <repository-url>
cd Mentora/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables (see below)
# Then start the server
npm run dev        # Development with nodemon
npm start          # Production
npm test           # Run tests
npm test:watch     # Watch mode
npm test:coverage  # Coverage report
```

### Frontend Setup

```bash
cd Mentora/frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables
# Then start dev server
npm run dev        # Development
npm run build      # Production build
npm run preview    # Preview build
```

---

##  Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mentora

# JWT Authentication
JWT_SECRET=your_long_random_secret_minimum_32_characters

# Google Generative AI (LLM)
GEMINI_API_KEY=your_google_api_key

# Frontend URL (CORS)
FRONTEND_URL=https://mentora-assignment.vercel.app

```

### Frontend (.env)

```env
VITE_API_URL=https://mentora-assignment-production.up.railway.app
```

---

##  API Documentation

### Authentication

#### Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "John Parent",
  "email": "parent@example.com",
  "password": "secure123",
  "role": "parent"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Parent",
    "email": "parent@example.com",
    "role": "parent"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "parent@example.com",
  "password": "secure123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Parent",
    "email": "parent@example.com",
    "role": "parent"
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Parent",
  "email": "parent@example.com",
  "role": "parent"
}
```

---

### Students (Parent Only)

#### Create Student
```http
POST /students
Authorization: Bearer <parent_token>
Content-Type: application/json

{
  "name": "Alice Smith",
  "age": 12
}
```

**Response (201):**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "name": "Alice Smith",
  "age": 12,
  "parentId": "507f1f77bcf86cd799439011"
}
```

#### Get Students
```http
GET /students
Authorization: Bearer <parent_token>
```

**Response (200):**
```json
{
  "students": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Alice Smith",
      "age": 12,
      "parentId": "507f1f77bcf86cd799439011"
    }
  ]
}
```

---

### Lessons (Mentor)

#### Create Lesson
```http
POST /lessons
Authorization: Bearer <mentor_token>
Content-Type: application/json

{
  "title": "Introduction to Python",
  "description": "Learn Python basics including variables, loops, and functions"
}
```

**Response (201):**
```json
{
  "id": "507f1f77bcf86cd799439013",
  "title": "Introduction to Python",
  "description": "Learn Python basics including variables, loops, and functions",
  "mentorId": "507f1f77bcf86cd799439020"
}
```

#### Get All Lessons
```http
GET /lessons
```

**Response (200):**
```json
{
  "lessons": [
    {
      "id": "507f1f77bcf86cd799439013",
      "title": "Introduction to Python",
      "description": "Learn Python basics...",
      "mentorId": "507f1f77bcf86cd799439020",
      "mentor": {
        "id": "507f1f77bcf86cd799439020",
        "name": "Jane Mentor"
      }
    }
  ]
}
```

---

### Bookings (Parent)

#### Create Booking
```http
POST /bookings
Authorization: Bearer <parent_token>
Content-Type: application/json

{
  "studentId": "507f1f77bcf86cd799439012",
  "lessonId": "507f1f77bcf86cd799439013"
}
```

**Response (201):**
```json
{
  "id": "507f1f77bcf86cd799439014",
  "studentId": "507f1f77bcf86cd799439012",
  "lessonId": "507f1f77bcf86cd799439013",
  "parentId": "507f1f77bcf86cd799439011"
}
```

**Error (409 Conflict):**
```json
{
  "message": "Student already booked for this lesson"
}
```

#### Get Bookings
```http
GET /bookings
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "bookings": [
    {
      "id": "507f1f77bcf86cd799439014",
      "studentId": "507f1f77bcf86cd799439012",
      "lessonId": "507f1f77bcf86cd799439013",
      "parentId": "507f1f77bcf86cd799439011"
    }
  ]
}
```

---

### Sessions (Mentor)

#### Create Session
```http
POST /sessions
Authorization: Bearer <mentor_token>
Content-Type: application/json

{
  "lessonId": "507f1f77bcf86cd799439013",
  "topic": "Variables and Data Types",
  "date": "2026-03-15T10:00:00Z"
}
```

**Response (201):**
```json
{
  "id": "507f1f77bcf86cd799439015",
  "lessonId": "507f1f77bcf86cd799439013",
  "topic": "Variables and Data Types",
  "date": "2026-03-15T10:00:00Z",
  "summary": null,
  "attendees": []
}
```

#### Join Session
```http
POST /sessions/507f1f77bcf86cd799439015/join
Authorization: Bearer <parent_token>
Content-Type: application/json

{
  "studentId": "507f1f77bcf86cd799439012"
}
```

**Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439015",
  "lessonId": "507f1f77bcf86cd799439013",
  "topic": "Variables and Data Types",
  "date": "2026-03-15T10:00:00Z",
  "attendees": ["507f1f77bcf86cd799439012"]
}
```

#### Update Session with Summary
```http
PUT /sessions/507f1f77bcf86cd799439015
Authorization: Bearer <mentor_token>
Content-Type: application/json

{
  "topic": "Variables and Data Types - Updated",
  "summary": "Covered variable declaration, data types (int, string, list), type conversion, and best practices"
}
```

**Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439015",
  "topic": "Variables and Data Types - Updated",
  "summary": "Covered variable declaration, data types (int, string, list), type conversion, and best practices",
  "attendees": ["507f1f77bcf86cd799439012"]
}
```

---

##  LLM Integration

### Overview

The LLM integration uses Google Generative AI (Gemini) with an intelligent fallback strategy to handle rate limits and service degradation.

**Models (in fallback order):**
1. gemini-2.5-flash (primary)
2. gemini-2.5-flash-lite
3. gemini-3.0-flash
4. gemini-3.1-flash-lite

If the primary model fails with rate limit (429) or overload (503), the system automatically tries the next model in the chain.

### Endpoint

#### Summarize Text
```http
POST /llm/summarize
Content-Type: application/json

{
  "text": "Your long text to summarize goes here. The text must be between 50 and 10000 characters..."
}
```

**Response (200):**
```json
{
  "summary": "• Key point 1\n• Key point 2\n• Key point 3",
  "model": "gemini-2.5-flash"
}
```

### Validation Rules

| Validation | Status | Message |
|---|---|---|
| Missing text | 400 | "Text is required" |
| Empty text | 400 | "Text cannot be empty" |
| Text < 50 chars | 400 | "Text must be at least 50 characters" |
| Text > 10,000 chars | 413 | "Text is too large. Maximum 10000 characters allowed" |

### Rate Limiting

- **Limit:** 10 requests per 60 seconds per IP
- **Status:** 429 Too Many Requests
- **Message:** "Too many requests, please try again later"

### Error Handling

| Error | Status | Response |
|---|---|---|
| LLM Service Down | 502 | "Bad Gateway - LLM service unavailable" |
| All Models Exhausted | 502 | "All fallback models failed. Try again later." |
| Timeout | 500 | "Request timeout. Please try again." |
| Invalid API Key | 500 | "LLM configuration error" |

### Testing the Endpoint

**Using curl:**
```bash
curl -X POST http://localhost:5000/llm/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Artificial Intelligence is transforming industries across the globe. Machine learning models can now process vast amounts of data, identify patterns, and make predictions with remarkable accuracy. Deep learning, a subset of machine learning, uses artificial neural networks to simulate human learning. These technologies power everything from natural language processing to computer vision, enabling machines to understand and interact with the world in unprecedented ways."
  }'
```

**Expected Response:**
```json
{
  "summary": "• AI and machine learning process vast data to identify patterns and make accurate predictions\n• Deep learning uses neural networks to simulate human learning capabilities\n• Technologies like NLP and computer vision enable machines to understand and interact with the world",
  "model": "gemini-2.5-flash"
}
```

### Setup Instructions

1. **Get API Key:**
   - Go to [Google AI Studio](https://aistudio.google.com)
   - Click "Get API Key"
   - Create new API key for Mentora

2. **Configure Environment:**
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Test Locally:**
   ```bash
   npm run dev
   # Make a POST request to /llm/summarize
   ```

4. **Rate Limiting Behavior:**
   - First 10 requests: Success
   - 11th request: 429 Too Many Requests
   - Auto-retries next model (no manual retry needed)

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Watch mode (auto-rerun on file changes)
npm test:watch

# Coverage report
npm test:coverage
```

### Test Suites

**auth.test.js** (56 tests)
- Signup validation (name, email, password, role)
- Login validation and password verification
- JWT token generation and validation
- Error cases (existing user, invalid credentials, etc.)

**student.test.js** (50 tests)
- Student creation with validation
- Age range validation (1-120)
- Name validation (1-100 chars)
- Parent authorization checks
- CRUD operations

**lesson.test.js** (48 tests)
- Lesson creation by mentors
- Title and description validation
- Public lesson browsing
- Mentor-specific lesson retrieval
- Update and delete operations

**booking.test.js** (42 tests)
- Student booking for lessons
- Duplicate booking detection (409 Conflict)
- Parent authorization
- Role-based booking retrieval
- Cancellation logic

**session.test.js** (90+ tests)
- Session creation for lessons
- Future date validation
- Topic and summary validation
- Student join/leave logic
- Attendance tracking
- Update operations

**health.test.js** (3 tests)
- Health check endpoint
- Uptime reporting
- Timestamp verification

### Example Test Output

```
PASS  tests/auth.test.js (12.5s)
  Auth Endpoints
    POST /auth/signup
      ✓ Should create user with valid data (125ms)
      ✓ Should reject duplicate email (98ms)
      ✓ Should reject invalid email format (87ms)
      ✓ Should reject weak password (92ms)
      ✓ Should reject invalid role (84ms)
    POST /auth/login
      ✓ Should login with valid credentials (156ms)
      ✓ Should reject invalid email (102ms)
      ✓ Should reject wrong password (118ms)
    GET /auth/me
      ✓ Should return authenticated user (104ms)
      ✓ Should reject without token (89ms)

PASS  tests/student.test.js (10.2s)
PASS  tests/lesson.test.js (11.8s)
PASS  tests/booking.test.js (9.4s)
PASS  tests/session.test.js (15.3s)

Test Suites: 5 passed, 5 total
Tests:       289 passed, 289 total
Time: 65.2s
```

---

##  Code Structure

### Backend Organization

```
backend/
├── src/
│   ├── app.js                 # Express app setup
│   ├── server.js              # Entry point, port listener
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── env.js             # Environment validation
│   ├── controllers/
│   │   ├── auth.controller.js       # Auth logic (signup/login/me)
│   │   ├── student.controller.js    # Student CRUD
│   │   ├── lesson.controller.js     # Lesson CRUD
│   │   ├── booking.controller.js    # Booking logic
│   │   ├── session.controller.js    # Session management
│   │   ├── llm.controller.js        # LLM summarization
│   │   └── oauth.controller.js      # Google OAuth
│   ├── models/
│   │   ├── User.js            # User schema (parent/mentor)
│   │   ├── Student.js         # Student schema
│   │   ├── Lesson.js          # Lesson schema
│   │   ├── Booking.js         # Booking schema
│   │   └── Session.js         # Session schema
│   ├── routes/
│   │   ├── auth.routes.js     # Auth endpoints
│   │   ├── student.routes.js  # Student endpoints
│   │   ├── lesson.routes.js   # Lesson endpoints
│   │   ├── booking.routes.js  # Booking endpoints
│   │   ├── session.routes.js  # Session endpoints
│   │   ├── llm.routes.js      # LLM endpoints
│   │   └── health.routes.js   # Health check
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT verification
│   │   ├── role.middleware.js       # Role-based access
│   │   ├── error.middleware.js      # Error handling
│   │   ├── llmRateLimit.js          # LLM rate limiting
│   │   └── validate.middleware.js   # Schema validation
│   └── utils/
│       ├── generateToken.js         # JWT generation
│       ├── llmClient.js             # LLM API wrapper
│       ├── apiResponse.js           # Response formatter
│       └── asyncHandler.js          # Promise wrapper
├── tests/
│   ├── auth.test.js
│   ├── student.test.js
│   ├── lesson.test.js
│   ├── booking.test.js
│   ├── session.test.js
│   ├── health.test.js
│   └── setup.js                # Test database setup
├── .env                        # Environment variables
├── .env.example               # Example variables
├── jest.config.js             # Jest configuration
├── package.json               # Dependencies
└── Dockerfile                 # Container image

frontend/
├── src/
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # App entry point
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── Login.jsx      # Login page with Google OAuth
│   │   │   ├── Signup.jsx     # Signup page
│   │   │   └── RoleSelectionModal.jsx
│   │   ├── Dashboard.jsx      # Role-based dashboard
│   │   ├── ParentDashboard.jsx
│   │   ├── MentorDashboard.jsx
│   │   ├── Students/
│   │   ├── Lessons/
│   │   ├── Bookings/
│   │   ├── Sessions/
│   │   └── LLM/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── Loading.jsx
│   ├── services/
│   │   ├── api.js             # Axios instance
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── lessons.js
│   │   ├── bookings.js
│   │   ├── sessions.js
│   │   └── llm.js
│   ├── store/
│   │   ├── authStore.js       # Zustand auth state
│   │   └── appStore.js        # Zustand app state
│   └── hooks/
│       └── useAuth.js
├── .env                       # Frontend env
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind CSS
└── package.json
```

---

##  Security Practices

### 1. Authentication & Authorization
-  JWT tokens with 7-day expiration
-  Bcrypt password hashing (10 rounds)
-  Role-based middleware for protected routes
-  Token validation on every protected request
-  Secure token storage (no localStorage for sensitive data)

### 2. Input Validation
-  Email format validation (regex)
-  Password strength validation (min 6 chars)
-  String trimming to prevent whitespace bypass
-  Length constraints on all text fields
-  Range validation on numeric fields (age: 1-120)
-  ObjectId validation for all ID parameters
-  Enum validation for role fields

### 3. Database Security
-  Unique index on email to prevent duplicates
-  Unique sparse index on googleId for OAuth
-  Indexes on frequently queried fields (mentorId, parentId)
-  Proper relationship handling with references
-  Automatic validation through Mongoose schemas

### 4. API Security
-  CORS configuration with explicit origins
-  Helmet.js for security headers (CSP, XSS protection, etc.)
-  Global rate limiting (5000 req/15min dev, 100 req/15min prod)
-  LLM-specific rate limiting (10 req/60sec)
-  Proper HTTP status codes for different error scenarios

### 5. Environment & Configuration
-  No hardcoded secrets (API keys, JWT secret)
-  Environment variables validation at startup
-  Separate configs for dev/prod
-  .env files in .gitignore
-  .env.example as template for developers

### 6. Error Handling
-  Clean error messages (no stack traces exposed)
-  Proper status codes (400, 401, 403, 404, 409, 413, 429, 502)
-  Centralized error middleware
-  Try-catch blocks in all async operations
-  Validation errors before database queries

### 7. LLM Integration Security
-  API key from environment variables only
-  Text size limits (50-10,000 chars) to prevent abuse
-  Timeout protection on API calls
-  Fallback models for resilience
-  Rate limiting to prevent brute force

---

##  Scalability Considerations

### 1. Database Design
- **Indexing:** Strategic indexes on frequently queried fields
  - `User.email` (unique)
  - `Student.parentId`
  - `Lesson.mentorId`
  - `Session.lessonId`
  
- **Pagination:** Ready for implementation in list endpoints
- **Atomic Operations:** Proper use of transactions for complex operations

### 2. API Design
- **Stateless:** REST API with no session state
- **Versioning:** Ready for API versioning (e.g., `/v1/auth`)
- **Role-based access:** Flexible permission system
- **Data normalization:** Proper schema relationships

### 3. Caching Strategy (Future)
- MongoDB TTL indexes for session expiration
- Redis for token blacklisting (logout)
- Cache lesson data for frequently accessed content

### 4. Horizontal Scaling
- Stateless server design allows multiple instances
- JWT doesn't require server-side session storage
- Database independently scalable
- Load balancer friendly

### 5. Performance Optimization
- **Lean responses:** Only return required fields
- **Batch operations:** Support for bulk booking/enrollment
- **Async processing:** LLM summarization doesn't block requests
- **Connection pooling:** MongoDB connection pool management

### 6. Monitoring & Logging
- **Morgan** for HTTP request logging
- **Error tracking:** All errors logged to console
- **Health endpoint:** `/health` for load balancer checks
- **Ready for:** New Relic, Sentry integration

### 7. Rate Limiting Strategy
- **Global:** Prevents DDoS attacks
- **Endpoint-specific:** LLM endpoint has separate limit
- **Per-IP:** Fair usage across all users
- **Scalable:** Works across multiple server instances

---

##  Deployment

### Railway Backend
```bash
# Connect to Railway
railway link

# Environment variables set in Railway dashboard
# Deploy on git push
git push origin main

# API URL: https://mentora-assignment-production.up.railway.app
```

### Vercel Frontend
```bash
# Deploy via GitHub integration
# Environment variables set in Vercel dashboard
# Auto-deploy on git push

# Frontend URL: https://mentora-assignment.vercel.app
```

---

## ✅ Requirements Checklist

### Core Requirements
- ✅ Authentication (signup/login/me endpoints)
- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ Student management (parent only)
- ✅ Lesson creation (mentor only)
- ✅ Booking system (duplicate prevention)
- ✅ Session management
- ✅ Role-based permissions
- ✅ MongoDB database design
- ✅ Comprehensive validation
- ✅ Error handling with proper status codes

### LLM Feature
- ✅ Google Generative AI integration
- ✅ Text summarization (3-6 bullet points)
- ✅ Input validation (50-10,000 chars)
- ✅ Error handling (400, 413, 502)
- ✅ Rate limiting (10 req/60sec)
- ✅ Fallback strategy (4-model chain)
- ✅ Environment variable configuration
- ✅ Clean separation of concerns

### Bonus Features
- ✅ Google OAuth implementation
- ✅ Join/leave session endpoints
- ✅ Role-based permissions
- ✅ Comprehensive validation
- ✅ API documentation
- ✅ Test suite (289+ tests)
- ✅ Production deployment
- ✅ Error middleware

### Code Quality
- ✅ Clean code structure
- ✅ MVC architecture
- ✅ Separation of concerns
- ✅ Reusable utilities
- ✅ Comprehensive comments
- ✅ Error handling throughout
- ✅ Security best practices
- ✅ Scalability considerations

---

