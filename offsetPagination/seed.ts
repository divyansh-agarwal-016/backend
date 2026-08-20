// To Run This File - npx tsx seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const posts = [
  {
    title: "Understanding Prisma",
    content: "Learning Prisma database queries.",
    author: "Divyansh",
  },
  {
    title: "Backend Engineering",
    content: "Building backend systems from scratch.",
    author: "Divyansh",
  },
  {
    title: "Database Basics",
    content: "Learning relational database concepts.",
    author: "Aarav",
  },
  {
    title: "REST API Design",
    content: "Understanding how REST APIs are designed.",
    author: "Rahul",
  },
  {
    title: "PostgreSQL Guide",
    content: "Exploring PostgreSQL databases.",
    author: "Ananya",
  },
  {
    title: "Express Server",
    content: "Building APIs with Express and Node.js.",
    author: "Rohan",
  },
  {
    title: "TypeScript Basics",
    content: "Understanding TypeScript types.",
    author: "Priya",
  },
  {
    title: "Zod Validation",
    content: "Validating incoming API request data.",
    author: "Kabir",
  },
  {
    title: "API Testing",
    content: "Testing backend APIs with different inputs.",
    author: "Meera",
  },
  {
    title: "HTTP Fundamentals",
    content: "Understanding HTTP requests and responses.",
    author: "Arjun",
  },
  {
    title: "Pagination Basics",
    content: "Learning offset and limit pagination.",
    author: "Divyansh",
  },
  {
    title: "Prisma Queries",
    content: "Exploring Prisma database queries.",
    author: "Aarav",
  },
  {
    title: "Database Indexing",
    content: "Understanding database indexes.",
    author: "Rahul",
  },
  {
    title: "Server Performance",
    content: "Learning backend performance techniques.",
    author: "Ananya",
  },
  {
    title: "Clean Backend",
    content: "Organizing backend code effectively.",
    author: "Rohan",
  },
  {
    title: "REST API Design",
    content: "Learning principles for designing clean REST APIs.",
    author: "Rahul",
  },
  {
    title: "JWT Authentication",
    content: "Understanding how JSON Web Tokens authenticate users.",
    author: "Ananya",
  },
  {
    title: "Refresh Tokens",
    content: "Learning how refresh tokens maintain user sessions.",
    author: "Rohan",
  },
  {
    title: "Password Hashing",
    content: "Understanding how passwords are securely stored.",
    author: "Meera",
  },
  {
    title: "Database Indexing",
    content: "Learning how indexes improve database query performance.",
    author: "Arjun",
  },
  {
    title: "Connection Pooling",
    content:
      "Understanding how applications efficiently manage database connections.",
    author: "Kavya",
  },
  {
    title: "API Rate Limiting",
    content: "Learning how to restrict excessive API requests.",
    author: "Ritesh",
  },
  {
    title: "Logging Systems",
    content: "Understanding how backend applications record useful events.",
    author: "Nandini",
  },
  {
    title: "Environment Variables",
    content: "Learning how applications manage configuration securely.",
    author: "Mohit",
  },
  {
    title: "Database Migrations",
    content: "Understanding how database schemas evolve over time.",
    author: "Priya",
  },
  {
    title: "Transactions and Locks",
    content:
      "Learning how databases maintain consistency during concurrent operations.",
    author: "Akash",
  },
  {
    title: "HTTP Cookies",
    content: "Understanding how cookies store and transmit client information.",
    author: "Sakshi",
  },
  {
    title: "CORS Configuration",
    content: "Learning how browsers control cross-origin API requests.",
    author: "Varun",
  },
  {
    title: "API Versioning",
    content: "Exploring strategies for maintaining multiple API versions.",
    author: "Mansi",
  },
  {
    title: "Graceful Shutdown",
    content: "Understanding how servers safely handle application shutdowns.",
    author: "Abhishek",
  },
  {
    title: "Caching Strategies",
    content: "Learning how caching can improve API performance.",
    author: "Vikram",
  },
  {
    title: "Node Runtime",
    content: "Understanding how Node.js executes JavaScript.",
    author: "Neha",
  },
  {
    title: "SQL Queries",
    content: "Practicing SQL queries against relational databases.",
    author: "Aditya",
  },
  {
    title: "Database Transactions",
    content: "Understanding atomic operations in databases.",
    author: "Sneha",
  },
  {
    title: "Error Handling",
    content: "Designing reliable error handling for backend APIs.",
    author: "Karan",
  },
  {
    title: "Request Middleware",
    content: "Learning how middleware processes HTTP requests.",
    author: "Ishita",
  },
  {
    title: "API Security",
    content: "Understanding basic security practices for APIs.",
    author: "Manav",
  },
  {
    title: "Database Connections",
    content: "Learning how applications connect to PostgreSQL.",
    author: "Riya",
  },
  {
    title: "Query Optimization",
    content: "Understanding ways to make database queries faster.",
    author: "Yash",
  },
  {
    title: "HTTP Status Codes",
    content: "Learning when different HTTP status codes are used.",
    author: "Simran",
  },
  {
    title: "Request Validation",
    content: "Ensuring incoming requests contain valid information.",
    author: "Dev",
  },
  {
    title: "API Architecture",
    content: "Exploring different ways to structure backend APIs.",
    author: "Nikhil",
  },
  {
    title: "Database Schema",
    content: "Designing tables and fields for backend applications.",
    author: "Tanya",
  },
  {
    title: "Prisma Relations",
    content: "Understanding relationships between Prisma models.",
    author: "Harsh",
  },
  {
    title: "Async JavaScript",
    content: "Understanding promises and asynchronous operations.",
    author: "Pooja",
  },
  {
    title: "Promise Parallelism",
    content: "Learning how independent promises can run concurrently.",
    author: "Aman",
  },
  {
    title: "Database Pagination",
    content: "Understanding pagination at the database level.",
    author: "Kriti",
  },
  {
    title: "Cursor Pagination",
    content: "Exploring cursor based pagination for large datasets.",
    author: "Sahil",
  },
  {
    title: "Offset Pagination",
    content: "Implementing pagination using offset and limit.",
    author: "Divyansh",
  },
  {
    title: "Backend Testing",
    content: "Testing APIs using valid and invalid requests.",
    author: "Aditi",
  },
];

async function main() {
  await prisma.post.createMany({
    data: posts,
  });

  console.log("50 posts seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });