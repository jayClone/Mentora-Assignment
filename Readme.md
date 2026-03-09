# Mentora Backend API

## Project Overview

Mentora is a comprehensive mentorship platform that connects parents, mentors, and students. The backend provides RESTful APIs for user authentication, student management, lesson creation, booking systems, and AI-powered text summarization using Google's Gemini API.

### Key Features

- User authentication with JWT tokens (parent and mentor roles)
- Student profile management (parents only)
- Lesson creation and management (mentors only)
- Booking system for lesson reservations (parents can book for students)
- Session tracking with summaries (mentors can create/update sessions)
- AI-powered text summarization using Gemini 2.5 Flash
- Rate limiting on API endpoints
- Comprehensive error handling and logging
- MongoDB database for persistent storage

### Technology Stack

- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Bcrypt for password hashing
- Google Generative AI (Gemini) for LLM features
- Jest for testing
- Morgan for request logging

---

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote instance)
- Google AI Studio API Key for Gemini AI

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mentora/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory (see Environment Variables section)

4. Start the development server:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000` by default.

### Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

---

## Environment Variables

Create a `.env` file in the backend root directory with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port number | 5000 |
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/mentora |
| JWT_SECRET | Secret key for JWT token generation | abcdefghijklmnopqrstuvwxyz123456789 |
| GEMINI_API_KEY | Google AI Studio API key for Gemini | AIzaSy... |

Example `.env` file:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/mentora
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## API Documentation

### Authentication Endpoints

#### POST /auth/signup
Register a new user (parent or mentor)

Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "parent"
}
```

Response (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "role": "parent"
  }
}
```

#### POST /auth/login
Login with email and password

Request:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "role": "parent"
  }
}
```

#### GET /auth/me
Get current authenticated user

Headers:
```
Authorization: Bearer <token>
```

Response (200):
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "parent"
  }
}
```

---

### Student Endpoints (Parent Only)

#### POST /students
Create a new student

Request:
```json
{
  "name": "Alice Doe",
  "age": 12
}
```

Response (201):
```json
{
  "message": "Student created successfully",
  "student": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Alice Doe",
    "age": 12,
    "parentId": "507f1f77bcf86cd799439011"
  }
}
```

#### GET /students
Get all students of authenticated parent

Response (200):
```json
{
  "students": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Alice Doe",
      "age": 12,
      "parentId": "507f1f77bcf86cd799439011"
    }
  ]
}
```

#### GET /students/:id
Get student by ID

Response (200):
```json
{
  "student": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Alice Doe",
    "age": 12
  }
}
```

#### PUT /students/:id
Update student details

Request:
```json
{
  "name": "Alice Smith",
  "age": 13
}
```

Response (200):
```json
{
  "message": "Student updated successfully",
  "student": { ... }
}
```

#### DELETE /students/:id
Delete a student

Response (200):
```json
{
  "message": "Student deleted successfully"
}
```

---

### Lesson Endpoints

#### POST /lessons (Mentor Only)
Create a new lesson

Request:
```json
{
  "title": "Mathematics Fundamentals",
  "description": "Learn basic algebra and geometry concepts"
}
```

Response (201):
```json
{
  "message": "Lesson created successfully",
  "lesson": {
    "_id": "507f1f77bcf86cd799439020",
    "title": "Mathematics Fundamentals",
    "description": "Learn basic algebra and geometry concepts",
    "mentorId": "507f1f77bcf86cd799439001"
  }
}
```

#### GET /lessons
Get all lessons (public)

Response (200):
```json
{
  "lessons": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "title": "Mathematics Fundamentals",
      "description": "Learn basic algebra and geometry concepts"
    }
  ]
}
```

#### GET /lessons/:id
Get lesson by ID (public)

Response (200):
```json
{
  "lesson": { ... }
}
```

#### PUT /lessons/:id (Mentor Only)
Update lesson

Request:
```json
{
  "title": "Advanced Mathematics",
  "description": "Advanced algebra and calculus"
}
```

Response (200):
```json
{
  "message": "Lesson updated successfully",
  "lesson": { ... }
}
```

#### DELETE /lessons/:id (Mentor Only)
Delete lesson

Response (200):
```json
{
  "message": "Lesson deleted successfully"
}
```

---

### Booking Endpoints

#### POST /bookings (Parent Only)
Create a lesson booking for student

Request:
```json
{
  "studentId": "507f1f77bcf86cd799439012",
  "lessonId": "507f1f77bcf86cd799439020"
}
```

Response (201):
```json
{
  "message": "Booking created successfully",
  "booking": {
    "_id": "507f1f77bcf86cd799439030",
    "studentId": "507f1f77bcf86cd799439012",
    "lessonId": "507f1f77bcf86cd799439020",
    "parentId": "507f1f77bcf86cd799439011"
  }
}
```

#### GET /bookings
Get bookings (filtered by role)

Response (200):
```json
{
  "bookings": [ ... ]
}
```

#### GET /bookings/:id
Get booking by ID

Response (200):
```json
{
  "booking": { ... }
}
```

#### DELETE /bookings/:id (Parent Only)
Cancel booking

Response (200):
```json
{
  "message": "Booking cancelled successfully"
}
```

---

### Session Endpoints

#### POST /sessions (Mentor Only)
Create a session for a lesson

Request:
```json
{
  "lessonId": "507f1f77bcf86cd799439020",
  "date": "2025-03-15T10:00:00Z",
  "topic": "Algebra Basics",
  "summary": "Covered linear equations"
}
```

Response (201):
```json
{
  "message": "Session created successfully",
  "session": { ... }
}
```

#### GET /sessions/lesson/:lessonId
Get all sessions for a lesson (public)

Response (200):
```json
{
  "sessions": [ ... ]
}
```

#### GET /sessions/:id
Get session by ID (public)

Response (200):
```json
{
  "session": { ... }
}
```

#### PUT /sessions/:id (Mentor Only)
Update session

Request:
```json
{
  "topic": "Algebra Advanced",
  "summary": "Covered quadratic equations"
}
```

Response (200):
```json
{
  "message": "Session updated successfully",
  "session": { ... }
}
```

#### DELETE /sessions/:id (Mentor Only)
Delete session

Response (200):
```json
{
  "message": "Session deleted successfully"
}
```

---

### Health Endpoint

#### GET /health
Check API health status (public)

Response (200):
```json
{
  "success": true,
  "message": "Service is healthy",
  "uptime": 3600.5,
  "timestamp": "2025-03-08T10:30:00.000Z"
}
```

---

## LLM Integration

### Gemini AI Summarization

#### POST /llm/summarize
Summarize text using Google Gemini AI

Request:
```json
{
  "text": "JavaScript is a versatile programming language used primarily for web development. It runs in web browsers and can also be used on servers with Node.js. JavaScript enables interactive web pages and is an essential part of web applications."
}
```

Response (200):
```json
{
  "summary": "JavaScript is a versatile language for web development that runs in browsers and servers (Node.js), enabling interactive web applications.",
  "model": "gemini-2.5-flash"
}
```

### Requirements

- Text must be between 50 and 10000 characters
- API key must be configured in environment variables
- Rate limited to 10 requests per minute per endpoint

### Error Responses

| Status | Message | Reason |
|--------|---------|--------|
| 400 | Text is required | Missing text field |
| 400 | Text must be at least 50 characters | Text too short |
| 413 | Text too large | Text exceeds 10000 characters |
| 429 | Too many requests | Rate limit exceeded |
| 502 | LLM service failed | API error or connection issue |

---

## Example Requests

### Complete Workflow Example

1. User Registration (Parent):
   ```bash
   curl -X POST http://localhost:5000/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"name":"John","email":"john@example.com","password":"pass123","role":"parent"}'
   ```

2. Create Student:
   ```bash
   curl -X POST http://localhost:5000/students \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"Alice","age":12}'
   ```

3. Browse Lessons:
   ```bash
   curl http://localhost:5000/lessons
   ```

4. Book Lesson:
   ```bash
   curl -X POST http://localhost:5000/bookings \
     -H "Authorization: Bearer PARENT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"studentId":"STUDENT_ID","lessonId":"LESSON_ID"}'
   ```

5. Summarize Text:
   ```bash
   curl -X POST http://localhost:5000/llm/summarize \
     -H "Content-Type: application/json" \
     -d '{"text":"Your long text here..."}'
   ```

---

## Error Handling

All API errors follow a standard format:

```json
{
  "message": "Error description",
  "statusCode": 400
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error
- 502: Bad Gateway

---

## Authentication

All protected endpoints require JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens expire after 7 days. Include the token from login/signup responses.

---

## Rate Limiting

Global rate limiting: 100 requests per 15 minutes per IP
LLM endpoint: 10 requests per minute

When limit is exceeded, API returns 429 status with message: "Too many requests, please try again later"

---

## Database Schema

### User Collection
- _id: ObjectId
- name: String
- email: String (unique)
- password: String (hashed)
- role: String (parent/mentor)
- timestamps

### Student Collection
- _id: ObjectId
- name: String
- age: Number
- parentId: ObjectId (ref: User)
- timestamps

### Lesson Collection
- _id: ObjectId
- title: String
- description: String
- mentorId: ObjectId (ref: User)
- timestamps

### Booking Collection
- _id: ObjectId
- studentId: ObjectId (ref: Student)
- lessonId: ObjectId (ref: Lesson)
- parentId: ObjectId (ref: User)
- timestamps

### Session Collection
- _id: ObjectId
- lessonId: ObjectId (ref: Lesson)
- date: Date
- topic: String
- summary: String (optional)
- timestamps

---

## Support and Contribution

For issues, feature requests, or contributions, please contact me :).