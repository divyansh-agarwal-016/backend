# Course Selling App Backend

A backend-only REST API for a course selling platform built with Node.js, Express, MongoDB, JWT Authentication, bcrypt, and Zod.

The application supports two roles:

* Admins can create and manage courses.
* Users can browse and purchase courses.

---
c
## Features

### Admin

* Register account
* Login using JWT authentication
* Create courses
* Update owned courses
* View all created courses

### User

* Register account
* Login using JWT authentication
* Purchase courses
* View purchased courses

### Courses

* Public course preview endpoint
* Purchase tracking

### Security

* Password hashing using bcrypt
* JWT authentication
* Route protection via middleware
* Ownership-based authorization
* Request validation using Zod

---

## Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Zod

---

## Project Structure

course-selling-app-backend/
│
├── middleware/
│   ├── admin.middleware.js
│   └── user.middleware.js
│
├── routes/
│   ├── admin.routes.js
│   ├── user.routes.js
│   └── course.routes.js
│
├── .env
├── .env.example
├── .gitignore
├── db.js
├── index.js
├── package.json
├── package-lock.json
└── README.md

---

## Installation

### Clone the repository

```bash
git clone <repository-url>
cd course-selling-app-backend
```

### Install dependencies

```bash
npm install
```

### Create .env file

```env
MONGO_URL=your_mongodb_connection_string

JWT_ADMIN_SECRET=your_admin_secret

JWT_USER_SECRET=your_user_secret

PORT=3000
```

### Run the application

```bash
npm start
```

Server runs on:

```text
http://localhost:3000
```

---

## Database Design

### User

```js
{
  _id,
  name,
  email,
  password
}
```

### Admin

```js
{
  _id,
  name,
  email,
  password
}
```

### Course

```js
{
  _id,
  title,
  description,
  price,
  creatorId
}
```

### Purchase

```js
{
  _id,
  userId,
  courseId
}
```

---

## Authentication Flow

### Admin

```text
Admin Login
     │
     ▼
Generate JWT
     │
     ▼
Client Sends Token
     │
     ▼
Admin Middleware
     │
     ▼
req.adminId
```

### User

```text
User Login
     │
     ▼
Generate JWT
     │
     ▼
Client Sends Token
     │
     ▼
User Middleware
     │
     ▼
req.userId
```

---

## Authorization Flow

### Course Ownership

When an admin creates a course:

```js
{
  title,
  description,
  price,
  creatorId: adminId
}
```

The course is linked to the admin that created it.

Before updating a course:

```js
courseModel.findOne({
    _id: courseId,
    creatorId: adminId
})
```

This ensures:

```text
Course Exists
AND
Course Belongs To Current Admin
```

Only then can the course be updated.

---

# API Documentation

## Admin Routes

### Register Admin

```http
POST /admin/signup
```

Request

```json
{
  "name": "Admin",
  "email": "admin@test.com",
  "password": "Admin@123"
}
```

---

### Login Admin

```http
POST /admin/signin
```

Request

```json
{
  "email": "admin@test.com",
  "password": "Admin@123"
}
```

Response

```json
{
  "token": "jwt-token"
}
```

---

### Create Course

```http
POST /admin/course
```

Headers

```http
Authorization: jwt-token
```

Request

```json
{
  "title": "React Mastery",
  "description": "Learn React",
  "price": 999
}
```

Response

```json
{
  "message": "Course Created",
  "courseId": "..."
}
```

---

### Update Course

```http
PUT /admin/course
```

Headers

```http
Authorization: jwt-token
```

Request

```json
{
  "courseId": "course-id",
  "title": "Advanced React",
  "description": "Updated Content",
  "price": 1499
}
```

Response

```json
{
  "message": "Course updated successfully"
}
```

---

### Get All Courses Created By Admin

```http
GET /admin/bulk
```

Headers

```http
Authorization: jwt-token
```

Response

```json
{
  "courses": [...]
}
```

---

## User Routes

### Register User

```http
POST /user/signup
```

Request

```json
{
  "name": "User",
  "email": "user@test.com",
  "password": "User@123"
}
```

---

### Login User

```http
POST /user/signin
```

Request

```json
{
  "email": "user@test.com",
  "password": "User@123"
}
```

Response

```json
{
  "token": "jwt-token"
}
```

---

### View Purchased Courses

```http
GET /user/course
```

Headers

```http
Authorization: jwt-token
```

Response

```json
{
  "purchases": [...],
  "courseData": [...]
}
```

---

## Course Routes

### Purchase Course

```http
POST /course/purchase
```

Headers

```http
Authorization: jwt-token
```

Request

```json
{
  "courseId": "course-id"
}
```

Response

```json
{
  "message": "You have successfully bought the course"
}
```

---

### Preview All Courses

```http
GET /course/preview
```

Response

```json
{
  "courses": [...]
}
```

---

# Testing Guide

## Admin Workflow

### 1. Signup

```http
POST /admin/signup
```

Expected:

```json
{
  "message": "Admin Signed Up!"
}
```

---

### 2. Signin

```http
POST /admin/signin
```

Expected:

```json
{
  "token": "..."
}
```

Save the token.

---

### 3. Create Course

```http
POST /admin/course
```

Expected:

```json
{
  "message": "Course Created",
  "courseId": "..."
}
```

Save the courseId.

---

### 4. Update Course

```http
PUT /admin/course
```

Expected:

```json
{
  "message": "Course updated successfully"
}
```

---

### 5. Get Courses

```http
GET /admin/bulk
```

Expected:

```json
{
  "courses": [...]
}
```

---

## User Workflow

### 1. Signup

```http
POST /user/signup
```

### 2. Signin

```http
POST /user/signin
```

Save the token.

### 3. Preview Courses

```http
GET /course/preview
```

### 4. Purchase Course

```http
POST /course/purchase
```

### 5. View Purchased Courses

```http
GET /user/course
```

Expected:

```json
{
  "purchases": [...],
  "courseData": [...]
}
```

---

# Security Test Cases

## Unauthorized Course Update

1. Create Admin A
2. Create Admin B
3. Login as Admin A and create a course
4. Copy the courseId
5. Login as Admin B
6. Try updating Admin A's course

Expected:

```json
{
  "message": "You are not allowed to edit this course"
}
```

---

## Missing Token

Expected:

```json
{
  "message": "Token missing"
}
```

---

## Invalid Token

Expected:

```json
{
  "message": "Invalid token"
}
```

---

## Invalid Course ID

Example:

```json
{
  "courseId": "6850fake123"
}
```

Expected:

```json
{
  "message": "Invalid course id"
}
```

(Recommended enhancement)

---

## Author

Divyansh Agarwal

Backend learning project focused on:

* REST APIs
* Authentication
* Authorization
* JWT
* Express Middleware
* MongoDB Relationships
* Backend Architecture
