# Offset Pagination API

A minimal backend API built with Express, TypeScript, Prisma, PostgreSQL, and Zod.

The purpose of this project is to understand offset-based pagination from first principles by implementing `skip` / `take` pagination, pagination metadata, efficient database queries, request validation, and pagination edge cases.

## Features

* Create posts
* Fetch a single post by ID
* Offset-based pagination
* Page/limit query parameters
* Pagination metadata
* Prisma `skip` / `take`
* `findMany()` + `count()`
* Parallel database queries with `Promise.all()`
* Request validation with Zod
* Reusable request validation middleware
* Deterministic ordering for stable pagination
* Pagination edge-case handling

## Tech Stack

* Node.js
* Express
* TypeScript
* PostgreSQL
* Prisma ORM
* Zod

## Pagination Flow

### Fetch Paginated Posts

```text
Client
  ↓
GET /posts?page=2&limit=5
  ↓
Validate req.query with Zod
  ↓
Extract page and limit
  ↓
Calculate skip
  ↓
skip = (page - 1) × limit
  ↓
Run findMany() + count() in parallel
  ↓
Calculate totalPages
  ↓
Calculate hasNext / hasPrev
  ↓
Return posts + pagination metadata
```

## API Endpoints

### POST `/posts`

Creates a new post.

Request body:

```json
{
  "title": "Understanding Prisma",
  "content": "Learning Prisma database queries.",
  "author": "Divyansh"
}
```

Success response:

```json
{
  "post": {
    "id": "cuid...",
    "title": "Understanding Prisma",
    "content": "Learning Prisma database queries.",
    "author": "Divyansh",
    "createdAt": "2026-08-20T..."
  }
}
```

Status codes:

* `201` — Post created
* `400` — Validation failed
* `500` — Internal server error

### GET `/posts/:id`

Returns a single post using its unique ID.

Example:

```text
GET /posts/cmt14ffqw0001pepktk3pxj22
```

Success response:

```json
{
  "post": {
    "id": "cmt14ffqw0001pepktk3pxj22",
    "title": "Backend Engineering",
    "content": "Building backend systems from scratch.",
    "author": "Divyansh",
    "createdAt": "2026-08-20T..."
  }
}
```

Status codes:

* `200` — Post returned
* `400` — Invalid ID
* `404` — Post not found
* `500` — Internal server error

### GET `/posts?page=&limit=`

Returns a paginated list of posts.

Example:

```text
GET /posts?page=2&limit=5
```

Query parameters:

| Parameter | Type   | Default | Constraint  |
| --------- | ------ | ------: | ----------- |
| `page`    | number |     `1` | minimum `1` |
| `limit`   | number |     `5` | minimum `5` |

The query parameters are coerced from strings into numbers using Zod.

### Pagination Calculation

```text
skip = (page - 1) × limit
```

Example:

```text
page = 2
limit = 5

skip = (2 - 1) × 5
     = 5
```

Prisma maps:

```text
skip → OFFSET
take → LIMIT
```

### Database Queries

The endpoint requires two independent pieces of information:

```text
findMany()
  ↓
Requested posts

count()
  ↓
Total number of posts
```

Both queries are executed concurrently:

```ts
Promise.all([
  prisma.post.findMany(...),
  prisma.post.count(...)
])
```

The server then calculates:

```text
totalPages = Math.ceil(total / limit)

hasNext = page < totalPages

hasPrev = page > 1
```

Success response:

```json
{
  "data": [
    {
      "id": "...",
      "title": "...",
      "content": "...",
      "author": "Divyansh",
      "createdAt": "2026-08-20T..."
    }
  ],
  "pagination": {
    "total": 51,
    "page": 2,
    "limit": 5,
    "totalPages": 11,
    "hasNext": true,
    "hasPrev": true
  }
}
```

Status codes:

* `200` — Posts returned
* `400` — Invalid query parameters
* `500` — Internal server error

## Database Schema

```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  author    String
  createdAt DateTime @default(now())
}
```

## Pagination Ordering

Posts are ordered by:

```text
createdAt DESC
```

with:

```text
id DESC
```

as a tie-breaker.

This is necessary because multiple posts can have the same `createdAt`.

```text
createdAt DESC
      ↓
Same timestamp?
      ↓
id DESC
```

Since `id` is unique, this provides deterministic ordering and prevents records from appearing on multiple pages due to unstable ordering.

## Validation

The project uses reusable validation middleware for different request sources:

```text
validateRequest(schema, "body")
validateRequest(schema, "query")
validateRequest(schema, "params")
```

Validation flow:

```text
Request
  ↓
req.body / req.query / req.params
  ↓
Zod validation
  ↓
Validated data
  ↓
res.locals
  ↓
Route handler
```

Zod performs runtime validation, while TypeScript provides compile-time type checking.

## Testing

### POST `/posts`

* Valid request
* Missing title
* Missing content
* Missing author
* Invalid field types
* Empty values
* Minimum-length violations
* Extra fields

### GET `/posts/:id`

* Existing ID
* Non-existent ID
* Invalid/malformed ID

### GET `/posts`

* First page
* Middle pages
* Last page
* Page beyond the last page
* Different limits
* Missing page
* Missing limit
* Zero page
* Zero limit
* Negative page/limit
* Non-numeric values
* Uneven final page
* Pagination metadata
* Stable ordering
* Duplicate/missing records across pages

## Project Structure

```text
.
├── src/
│   ├── Routes/
│   │   └── postRouter.ts
│   ├── schemas/
│   │   └── postSchema.ts
│   ├── db.ts
│   └── index.ts
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── dist/
│   └── ...                  # Compiled JavaScript output
│
├── seed.ts
├── prisma.config.ts
├── package.json
├── tsconfig.json
├── .env
└── .gitignore
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file:

```env
DATABASE_URL="your_postgres_connection_string"
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Push the schema

```bash
npx prisma db push
```

### 5. Seed the database

```bash
npx tsx seed.ts
```

### 6. Start the development server

```bash
npm run dev
```

The API runs on:

```text
http://localhost:3000
```

## Key Learnings

### Database Layer

```text
LIMIT
  ↓
Number of rows to return

OFFSET
  ↓
Number of rows to skip
```

### Prisma Layer

```text
OFFSET → skip
LIMIT  → take
```

### Pagination

```text
page + limit
     ↓
skip = (page - 1) × limit
     ↓
skip + take
     ↓
Requested page
```

### Response Design

Before writing database queries:

```text
Design response
     ↓
Identify required information
     ↓
Map information to database queries
     ↓
Choose Prisma operations
```

### Query Parallelism

`findMany()` and `count()` are independent queries, so they can be executed concurrently using `Promise.all()` rather than sequentially.

### Deterministic Ordering

Offset pagination requires stable ordering. Ordering only by a non-unique field such as `createdAt` can cause duplicate or missing records between pages.

Adding a unique tie-breaker such as `id` makes the ordering deterministic.

## Engineering Process

The project was built using:

```text
Problem
  ↓
Ask the right question
  ↓
Understand the concept
  ↓
Design
  ↓
Implement
  ↓
Test
  ↓
Discover edge cases
  ↓
Understand the failure
  ↓
Improve the implementation
```

The goal was not simply to implement pagination, but to practice breaking backend problems into smaller engineering problems and solving them through reasoning, implementation, and testing.
