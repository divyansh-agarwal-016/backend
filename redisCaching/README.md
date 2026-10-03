# Redis Leaderboard API

A backend leaderboard system built with Node.js, Express, TypeScript, Prisma, PostgreSQL, and Redis.

The main purpose of this project is to understand and implement Redis caching using the Cache-Aside pattern, along with cache invalidation when the underlying data changes.

## Tech Stack

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Neon PostgreSQL
- Redis
- Upstash Redis
- Zod

## Project Overview

The application manages developers and their scores in a leaderboard.

PostgreSQL acts as the source of truth, while Redis is used as a caching layer to reduce repeated database queries when fetching the leaderboard.

The application supports:

- Creating a developer record
- Fetching the top leaderboard
- Updating a developer's score
- Deleting a developer
- Redis caching
- Cache invalidation
- Request validation

## Architecture

```text
                    Client
                      |
                      v
                    Route
                      |
                      v
              Validation Middleware
                      |
                      v
                  Controller
                      |
                      v
                   Service
                  /       \
                 /         \
              Redis      Repository
                |             |
                |             v
                |           Prisma
                |             |
                |             v
                |        PostgreSQL
                |
                v
             Cache
```

The responsibilities are separated into different layers.

### Controller

Handles the HTTP request and response.

It extracts the required data from the request and calls the appropriate service method.

### Service

Contains the application/business logic.

It coordinates database operations and Redis operations.

For example, after updating or deleting a developer, the service invalidates the affected leaderboard caches.

### Repository

Responsible for communicating with PostgreSQL through Prisma.

The repository does not contain Redis logic.

### Redis

Acts as the caching layer for leaderboard results.

### PostgreSQL

Acts as the source of truth for developer data.

---

# Cache-Aside Pattern

The GET leaderboard endpoint uses the Cache-Aside pattern.

When a client requests the leaderboard:

```text
Client
  |
  v
GET /leaderboard?limit=10
  |
  v
Check Redis
  |
  +------ Cache HIT ------> Return cached data
  |
  |
 Cache MISS
  |
  v
PostgreSQL
  |
  v
Store result in Redis
  |
  v
Return data
```

The database is only queried when the requested leaderboard is not already present in Redis.

## Cache Keys

Different leaderboard sizes use different cache keys:

```text
leaderboard:10
leaderboard:50
leaderboard:100
```

For example:

```ts
const cacheKey = `leaderboard:${limit}`;
```

If the client requests:

```text
GET /leaderboard?limit=10
```

the cache key becomes:

```text
leaderboard:10
```

For:

```text
GET /leaderboard?limit=50
```

the cache key becomes:

```text
leaderboard:50
```

This prevents different leaderboard responses from overwriting each other.

## TTL

Cached leaderboard data is stored with a TTL.

For example:

```text
EX 60
```

means the cache entry expires after 60 seconds.

TTL helps prevent cached data from remaining stale indefinitely.

---

# Cache Invalidation

Caching creates a consistency problem.

Suppose the leaderboard is cached:

```text
Redis
leaderboard:10
```

and then a developer's score changes in PostgreSQL.

The database now contains the new score, but Redis may still contain the old leaderboard.

Therefore, when data changes, the corresponding cache entries are invalidated.

## Update

When a developer's score is updated:

```text
PATCH /leaderboard/:id
        |
        v
PostgreSQL
        |
        v
Update score
        |
        v
Delete cached leaderboards
        |
        +--> leaderboard:10
        +--> leaderboard:50
        +--> leaderboard:100
```

The next GET request will result in a cache miss and fetch fresh data from PostgreSQL.

## Delete

The same strategy is used when deleting a developer:

```text
DELETE /leaderboard/:id
        |
        v
Delete from PostgreSQL
        |
        v
Invalidate leaderboard caches
```

This keeps the cached leaderboard from serving deleted or outdated records.

---

# API Endpoints

## Create Developer

```http
POST /leaderboard/post
```

Request body:

```json
{
  "username": "Divyansh",
  "score": 40
}
```

Creates a new developer record in PostgreSQL.

---

## Get Leaderboard

```http
GET /leaderboard?limit=10
```

Supported limits:

```text
10
50
100
```

Example:

```http
GET /leaderboard?limit=50
```

The endpoint first checks Redis.

If the leaderboard exists in Redis, the cached result is returned.

If it does not exist, the application queries PostgreSQL, stores the result in Redis, and returns the result.

---

## Update Score

```http
PATCH /leaderboard/:id
```

Request body:

```json
{
  "score": 100
}
```

The developer's score is updated in PostgreSQL.

After the update, leaderboard caches are invalidated:

```text
leaderboard:10
leaderboard:50
leaderboard:100
```

---

## Delete Developer

```http
DELETE /leaderboard/:id
```

Deletes the developer from PostgreSQL and invalidates the leaderboard caches.

---

# Validation

Request data is validated using Zod before reaching the controller.

For example, if a POST request does not contain a valid score:

```json
{
  "username": "Divyansh"
}
```

the validation middleware rejects the request.

The request flow is:

```text
Request
   |
   v
Validation Middleware
   |
   +---- Invalid ----> 400 Bad Request
   |
   v
Controller
```

This prevents invalid data from reaching the service, repository, or database.

---

# Database Schema

The main model is `Developer`.

```prisma
model Developer {
  id        String   @id @default(cuid())
  username  String   @unique
  score     Int
  createdAt DateTime @default(now())

  @@index([score(sort: Desc)])
}
```

The score index allows the database to efficiently retrieve developers ordered by score.

---

# Environment Variables

Create a `.env` file:

```env
DATABASE_URL="your-neon-postgresql-url"

UPSTASH_REDIS_REST_URL="your-upstash-redis-url"

UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"
```

Do not commit `.env` to GitHub.

Make sure `.env` is included in `.gitignore`.

---

# Installation

Clone the repository and install dependencies:

```bash
npm install
```

Generate the Prisma client:

```bash
npx prisma generate
```

Run the development server:

```bash
npm run dev
```

---

# Testing

The API can be tested using Postman or another API client.

Recommended testing sequence:

### 1. Test GET

```http
GET /leaderboard?limit=10
```

Send the request twice.

The first request should result in a cache miss.

The second request should be served from Redis.

### 2. Test Different Cache Keys

```http
GET /leaderboard?limit=10
GET /leaderboard?limit=50
GET /leaderboard?limit=100
```

These should use:

```text
leaderboard:10
leaderboard:50
leaderboard:100
```

### 3. Test PATCH

Update a developer's score.

Then request the leaderboard again.

The old cache should have been invalidated and fresh data should be retrieved from PostgreSQL.

### 4. Test DELETE

Delete a developer.

Then request the leaderboard again.

The deleted developer should no longer appear.

### 5. Test Validation

Send invalid or missing fields and verify that the validation middleware rejects the request with a `400 Bad Request`.

---

# Project Structure

```text
src/
├── Controllers/
│   └── leaderboard.controller.ts
│
├── Repository/
│   └── leaderboard.repository.ts
│
├── Routes/
│   └── leaderboard.routes.ts
│
├── Schema/
│   └── leaderboard.schema.ts
│
├── Services/
│   └── leaderboard.service.ts
│
├── Middleware/
│   └── validateRequest.ts
│
├── config/
│   ├── db.ts
│   └── redis.ts
│
└── index.ts

prisma/
└── schema.prisma
```

---

# Key Concepts Practiced

This project was built to understand the following backend concepts:

- REST API design
- Express routing
- Middleware
- Zod validation
- Controller-Service-Repository architecture
- Prisma ORM
- PostgreSQL
- Redis
- Upstash Redis
- Cache-Aside pattern
- Cache hit and cache miss
- Cache keys
- TTL
- Cache invalidation
- Database indexing
- CRUD operations
- TypeScript request types
- Separation of concerns

---

# What I Learned

The main lesson from this project is that Redis is not a replacement for the database.

PostgreSQL remains the source of truth.

Redis sits in front of the database and temporarily stores frequently requested data so that repeated requests can be served faster.

The basic flow is:

```text
                    ┌─────────────┐
                    │   Client    │
                    └──────┬──────┘
                           |
                           v
                    ┌─────────────┐
                    │   Express   │
                    └──────┬──────┘
                           |
                           v
                    ┌─────────────┐
                    │   Service   │
                    └──────┬──────┘
                           |
                    ┌──────┴──────┐
                    v             v
                 Redis        PostgreSQL
                    |             |
                    └──────┬──────┘
                           |
                           v
                       Response
```

The important trade-off is that caching improves read performance but introduces the problem of keeping cached data consistent with the database.

This project addresses that problem through cache invalidation after updates and deletes.