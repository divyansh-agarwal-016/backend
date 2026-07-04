# Authentication Service

A backend-only authentication service built with Express, TypeScript, Prisma, PostgreSQL, Zod, bcrypt, and JWT.

The purpose of this project is to understand authentication from first principles by implementing signup, signin, protected routes, access tokens, refresh tokens, and logout.

## Features

- User signup
- User signin
- Password hashing with bcrypt
- Request validation with Zod
- JWT access tokens
- JWT refresh tokens
- Refresh token persistence in PostgreSQL
- Protected routes using authentication middleware
- Access token renewal using refresh tokens
- Logout through refresh token deletion
- Multiple refresh tokens per user
- TypeScript Declaration Merging for authenticated requests

## Tech Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- Zod
- bcrypt
- jsonwebtoken

## Authentication Flow

### Signup

```text
Client
  ↓
POST /signup
  ↓
Validate request body with Zod
  ↓
Check if email already exists
  ↓
Hash password with bcrypt
  ↓
Create user in PostgreSQL
  ↓
Return success response
```

### Signin

```text
Client
  ↓
POST /signin
  ↓
Validate request body with Zod
  ↓
Find user by email
  ↓
Compare password with bcrypt
  ↓
Generate Access Token (15 minutes)
  ↓
Generate Refresh Token (7 days)
  ↓
Store Refresh Token in PostgreSQL
  ↓
Return both tokens
```

### Protected Route

```text
Client
  ↓
Authorization: Bearer <access_token>
  ↓
Authentication Middleware
  ↓
Verify Access Token
  ↓
Extract userId from JWT payload
  ↓
Attach userId to req.userId
  ↓
Continue to protected route
```

### Refresh Access Token

```text
Client
  ↓
POST /refresh
  ↓
Authorization: Bearer <refresh_token>
  ↓
Verify Refresh Token signature and expiry
  ↓
Validate userId exists in JWT payload
  ↓
Check exact Refresh Token exists in database
  ↓
Confirm token belongs to same user
  ↓
Generate new Access Token
  ↓
Return Access Token
```

### Logout

```text
Client
  ↓
POST /logout
  ↓
Authorization: Bearer <refresh_token>
  ↓
Find exact Refresh Token in database
  ↓
Delete Refresh Token
  ↓
Session revoked
```

## API Endpoints

### POST `/signup`

Creates a new user.

Request body:

```json
{
  "name": "Divyansh",
  "email": "divyansh@example.com",
  "password": "Password@123"
}
```

Success response:

```json
{
  "message": "User created successfully"
}
```

Status codes:

- `201` — User created
- `400` — Validation failed
- `409` — User already exists
- `500` — Internal server error

---

### POST `/signin`

Authenticates a user and creates a refresh-token session.

Request body:

```json
{
  "email": "divyansh@example.com",
  "password": "Password@123"
}
```

Success response:

```json
{
  "accessToken": "<access_token>",
  "refreshToken": "<refresh_token>"
}
```

Status codes:

- `200` — Signin successful
- `400` — Validation failed
- `401` — Invalid credentials
- `500` — Internal server error

---

### GET `/me`

Returns the currently authenticated user.

Headers:

```text
Authorization: Bearer <access_token>
```

Success response:

```json
{
  "user": {
    "id": "user_id",
    "name": "Divyansh",
    "email": "divyansh@example.com",
    "createdAt": "2026-07-04T00:00:00.000Z"
  }
}
```

Status codes:

- `200` — User returned
- `401` — Missing, invalid, or expired access token
- `404` — User not found
- `500` — Internal server error

---

### POST `/refresh`

Generates a new access token using a valid refresh token.

Headers:

```text
Authorization: Bearer <refresh_token>
```

Success response:

```json
{
  "accessToken": "<new_access_token>"
}
```

Status codes:

- `200` — New access token generated
- `401` — Missing, invalid, expired, or revoked refresh token
- `500` — Internal server error

---

### POST `/logout`

Revokes the current refresh-token session.

Headers:

```text
Authorization: Bearer <refresh_token>
```

Success response:

```json
{
  "message": "Logged out successfully"
}
```

Status codes:

- `200` — Logout successful
- `401` — Missing or invalid refresh token
- `500` — Internal server error

## JWT Design

### Access Token

Purpose:

- Authenticate protected API requests
- Avoid querying the database on every authenticated request

Expiry:

```text
15 minutes
```

Payload:

```json
{
  "userId": "user_id"
}
```

### Refresh Token

Purpose:

- Generate new access tokens
- Represent a longer-lived authenticated session

Expiry:

```text
7 days
```

Payload:

```json
{
  "userId": "user_id"
}
```

Refresh tokens are stored in PostgreSQL so they can be explicitly revoked during logout.

## Database Schema

```prisma
model User {
  id            String         @id @default(cuid())
  name          String
  email         String         @unique
  password      String
  createdAt     DateTime       @default(now())
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  userId    String
  user      User     @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )
}
```

## Database Relationship

```text
User
 │
 │ 1
 │
 └─────────────── *
              RefreshToken
```

One user can have multiple refresh tokens.

Example:

```text
User
├── Laptop Refresh Token
├── Phone Refresh Token
└── Tablet Refresh Token
```

Deleting a user also deletes all associated refresh tokens because the relation uses:

```prisma
onDelete: Cascade
```

## Project Structure

```text
src/
├── controllers/
│   └── userController.ts
├── services/
│   └── userService.ts
├── repositories/
│   └── userRepository.ts
├── middleware/
│   ├── authMiddleware.ts
│   └── validateBody.ts
├── routes/
│   └── userRouter.ts
├── schemas/
│   └── userSchema.ts
├── types/
│   └── express.d.ts
├── db.ts
└── index.ts

prisma/
├── migrations/
└── schema.prisma
```

## Architecture

```text
HTTP Request
    ↓
Route
    ↓
Validation Middleware
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
Prisma
    ↓
PostgreSQL
```

### Routes

Responsible for:

- Mapping HTTP methods and paths
- Attaching middleware
- Calling controllers

### Controllers

Responsible for:

- Reading request data
- Sending HTTP responses
- HTTP status codes
- Handling request-level errors

### Services

Responsible for:

- Authentication logic
- Password hashing
- Password comparison
- JWT generation
- Application decisions

### Repositories

Responsible for:

- Prisma queries
- Database reads
- Database writes
- Database deletes

### Middleware

Responsible for:

- Request validation
- Access token authentication
- Attaching authenticated user information to requests

## TypeScript Declaration Merging

Express `Request` does not contain a `userId` property by default.

The authentication middleware needs to attach the authenticated user's ID:

```ts
req.userId = decoded.userId;
```

The Express `Request` interface is extended using TypeScript Declaration Merging.

File:

```text
src/types/express.d.ts
```

Example:

```ts
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export {};
```

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://..."

JWT_ACCESS_SECRET="your_access_token_secret"

JWT_REFRESH_SECRET="your_refresh_token_secret"
```

Do not commit `.env` to version control.

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd <project-directory>
```

Install dependencies:

```bash
npm install
```

Generate Prisma Client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

## Version 1 Scope

This version intentionally keeps authentication simple to focus on core backend concepts.

Implemented:

- Signup
- Signin
- Password hashing
- Access tokens
- Refresh tokens
- Database-backed refresh tokens
- Protected routes
- Token refresh
- Logout
- Request validation
- Layered project structure

Not implemented yet:

- HttpOnly cookies
- Refresh token rotation
- Hashed refresh tokens
- Advanced session management
- Device/session metadata
- Global error architecture
- Rate limiting
- Email verification
- Password reset

These are intentionally deferred to a future version.

## Key Learnings

This project was built to understand:

- How password hashing works in authentication systems
- Why access tokens are short-lived
- Why refresh tokens exist
- Why refresh tokens can be stored in a database
- How logout revokes a refresh-token session
- How JWT verification differs from payload validation
- How authentication middleware protects routes
- How Prisma queries map to database operations
- How one-to-many relationships work in Prisma
- How TypeScript Declaration Merging extends Express Request
- How to separate routes, controllers, services, and repositories

## Future Improvements

Version 2 may include:

- HttpOnly cookie-based authentication
- Refresh token rotation
- Refresh token reuse detection
- Hashed refresh token storage
- Session management
- Logout from all devices
- Device-aware sessions
- Centralized error handling
- Rate limiting
- Email verification
- Password reset flow