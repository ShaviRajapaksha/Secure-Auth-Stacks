# Auth Learning API

A backend authentication and authorization API built with **ASP.NET Core Web API**, **Entity Framework Core**, **PostgreSQL**, and **JWT**.

This project is designed as a learning project to understand how authentication and authorization work in a modern full-stack application.

## Tech Stack

* ASP.NET Core Web API
* C#
* Entity Framework Core
* PostgreSQL
* Npgsql
* JWT Bearer Authentication
* Swagger / OpenAPI
* ASP.NET Core Identity `PasswordHasher`

---

## Project Structure

```text
AuthLearningApi/
│
├── Controllers/
│   ├── AuthController.cs
│   └── UsersController.cs
│
├── Data/
│   └── AppDbContext.cs
│
├── DTOs/
│   ├── AuthResponse.cs
│   ├── LoginRequest.cs
│   └── RegisterRequest.cs
│
├── Models/
│   ├── Role.cs
│   └── User.cs
│
├── Services/
│   ├── AuthService.cs
│   └── JwtService.cs
│
├── Migrations/
│
├── Program.cs
├── appsettings.json
└── AuthLearningApi.csproj
```

---

# Features

## Authentication

* User registration
* User login
* Password hashing
* JWT token generation
* JWT token validation
* Get currently authenticated user
* Protected API endpoints

## Authorization

* Role-based authorization
* `USER` role
* `ADMIN` role
* Admin-only endpoints
* Authentication vs authorization handling
* HTTP `401 Unauthorized` and `403 Forbidden` responses

## Database

* PostgreSQL database
* Entity Framework Core
* Code-first migrations
* Unique email constraint
* User roles stored as strings

---

# Authentication Flow

The application uses JWT Bearer authentication.

```text
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │
       │ Email + Password
       ▼
┌──────────────────────┐
│    ASP.NET Core      │
│                      │
│  Validate User       │
│  Verify Password     │
└──────────┬───────────┘
           │
           │ Generate JWT
           ▼
┌──────────────────────┐
│      JWT Token       │
└──────────┬───────────┘
           │
           ▼
┌──────────────┐
│   Frontend   │
└──────────────┘
```

For subsequent protected requests:

```text
Frontend
   │
   │ Authorization: Bearer <JWT>
   ▼
ASP.NET Core
   │
   ├── Validate JWT
   ├── Validate signature
   ├── Validate expiration
   └── Read user claims
          │
          ▼
      Controller
```

---

# Authentication vs Authorization

### Authentication

Authentication answers:

> Who are you?

For example:

```text
Email: user@example.com
Password: ********
```

The API verifies the credentials and generates a JWT.

### Authorization

Authorization answers:

> What are you allowed to do?

For example:

```text
USER
 ├── Access profile
 └── Access dashboard

ADMIN
 ├── Access profile
 ├── Access dashboard
 └── Manage users
```

The backend enforces authorization using:

```csharp
[Authorize]
```

and:

```csharp
[Authorize(Roles = "ADMIN")]
```

---

# Roles

The application currently contains two roles:

```csharp
public enum Role
{
    USER,
    ADMIN
}
```

Newly registered users receive:

```text
USER
```

The role is controlled by the backend and is not accepted from the registration request.

---

# Database

The application uses PostgreSQL with Entity Framework Core.

## User Table

The main user entity contains:

```text
Users
├── Id
├── Name
├── Email
├── PasswordHash
├── Role
└── CreatedAt
```

Passwords are never stored as plain text.

Instead:

```text
Plain Password
      │
      ▼
PasswordHasher
      │
      ▼
Password Hash
      │
      ▼
PostgreSQL
```

---

# Configuration

The application uses `appsettings.json` for configuration.

Example:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=auth_learning;Username=YOUR_USERNAME;Password=YOUR_PASSWORD"
  },
  "Jwt": {
    "Key": "YOUR_JWT_SECRET",
    "Issuer": "AuthLearningApi",
    "Audience": "AuthLearningFrontend",
    "ExpiresInMinutes": 60
  }
}
```

> Do not commit real database passwords or JWT secrets to a public repository.

For production, sensitive configuration should be supplied through environment variables, user secrets, or a secure secrets manager.

---

# Setup

## 1. Clone the repository

```bash
git clone <repository-url>
```

Navigate to the backend:

```bash
cd backend/AuthLearningApi
```

---

## 2. Restore dependencies

```bash
dotnet restore
```

---

## 3. Configure PostgreSQL

Create a PostgreSQL database:

```sql
CREATE DATABASE auth_learning;
```

Update the connection string in:

```text
appsettings.json
```

Example:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=auth_learning;Username=YOUR_USERNAME;Password=YOUR_PASSWORD"
}
```

---

# Entity Framework Core

The project uses EF Core migrations to manage the database schema.

## Create a migration

```bash
dotnet ef migrations add InitialCreate
```

## Apply migrations

```bash
dotnet ef database update
```

## Run the API

```bash
dotnet run
```

The API will start on the URLs shown in the terminal.

---

# API Endpoints

## Authentication

### Register

```http
POST /api/Auth/register
```

Request:

```json
{
  "name": "Shavindu",
  "email": "shavindu@example.com",
  "password": "Password123!"
}
```

Response:

```json
{
  "token": "<jwt-token>",
  "userId": "<user-id>",
  "name": "Shavindu",
  "email": "shavindu@example.com",
  "role": "USER"
}
```

---

### Login

```http
POST /api/Auth/login
```

Request:

```json
{
  "email": "shavindu@example.com",
  "password": "Password123!"
}
```

Response:

```json
{
  "token": "<jwt-token>",
  "userId": "<user-id>",
  "name": "Shavindu",
  "email": "shavindu@example.com",
  "role": "USER"
}
```

---

### Get Current User

```http
GET /api/Auth/me
```

Requires authentication.

Request header:

```http
Authorization: Bearer <jwt-token>
```

Example response:

```json
{
  "userId": "<user-id>",
  "name": "Shavindu",
  "email": "shavindu@example.com",
  "role": "USER"
}
```

---

# User Endpoints

### Get Profile

```http
GET /api/Users/profile
```

Requires authentication.

Any authenticated user can access this endpoint.

---

### Get All Users

```http
GET /api/Users
```

Requires:

```text
Authentication
+
ADMIN role
```

This endpoint demonstrates role-based authorization.

```csharp
[Authorize(Roles = "ADMIN")]
```

---

# HTTP Status Codes

The API uses different status codes for authentication and authorization failures.

## 401 Unauthorized

The request is not authenticated.

Examples:

```text
Missing JWT
Invalid JWT
Expired JWT
Invalid credentials
```

---

## 403 Forbidden

The user is authenticated but does not have permission to access the resource.

Example:

```text
USER
  ↓
GET /api/Users
  ↓
403 Forbidden
```

because the endpoint requires:

```text
ADMIN
```

---

# JWT Claims

The generated JWT contains user information such as:

```text
User ID
Name
Email
Role
```

Example:

```text
UserId → 123
Name   → Shavindu
Email  → shavindu@example.com
Role   → ADMIN
```

The ASP.NET Core authorization system uses the role claim to determine whether the user can access role-protected endpoints.

---

# API Request Flow

A protected request follows this process:

```text
Client
  │
  │ Authorization: Bearer <JWT>
  ▼
ASP.NET Core
  │
  ▼
JWT Authentication
  │
  ├── Signature valid?
  ├── Token expired?
  ├── Issuer valid?
  └── Audience valid?
  │
  ▼
Authenticated User
  │
  ▼
Authorization
  │
  ├── [Authorize]
  │
  └── [Authorize(Roles = "ADMIN")]
  │
  ▼
Controller
  │
  ▼
Service
  │
  ▼
Entity Framework Core
  │
  ▼
PostgreSQL
```

---

# Testing With Swagger

After starting the application:

```bash
dotnet run
```

Open the Swagger URL displayed by ASP.NET Core.

Swagger provides an interface for testing the API endpoints.

Recommended testing order:

```text
1. Register
   ↓
2. Login
   ↓
3. Copy JWT
   ↓
4. Authorize in Swagger
   ↓
5. Call /api/Auth/me
   ↓
6. Call /api/Users/profile
   ↓
7. Test /api/Users as USER
```

The final request should return:

```text
403 Forbidden
```

when the authenticated user has the `USER` role.

---

# Important Security Concepts

This project demonstrates several important backend security concepts.

### Passwords

Passwords are hashed before being stored:

```text
Password
   ↓
PasswordHasher
   ↓
PasswordHash
   ↓
Database
```

### JWT

JWTs are used to identify authenticated users on subsequent requests.

### Role-Based Authorization

Access to administrative resources is controlled by the backend:

```csharp
[Authorize(Roles = "ADMIN")]
```

### Client Cannot Choose Its Own Role

The registration endpoint creates users with:

```csharp
Role = Role.USER;
```

The client cannot simply send:

```json
{
  "role": "ADMIN"
}
```

and become an administrator.

---

# Learning Objectives

This backend project is intended to provide practical understanding of:

* ASP.NET Core Web API
* REST API design
* Controllers
* Dependency injection
* DTOs
* Services
* Entity Framework Core
* PostgreSQL
* Database migrations
* Password hashing
* JWT authentication
* JWT claims
* Role-based authorization
* `[Authorize]`
* `[Authorize(Roles = "ADMIN")]`
* HTTP 401 vs 403
* Protected API endpoints
* Authentication flow
* Authorization flow

---

# Next Step

The next part of the project will add the Next.js frontend.

The frontend will use:

```text
Next.js
TypeScript
Ant Design
Axios
```

It will provide:

```text
/auth/login
/auth/register

/dashboard
/profile

/admin
/admin/users
```

The frontend will communicate with this ASP.NET Core API:

```text
                    ┌─────────────────────┐
                    │      Next.js        │
                    │                     │
                    │  Ant Design         │
                    │  Authentication     │
                    │  Protected Routes   │
                    └──────────┬──────────┘
                               │
                         HTTP + JWT
                               │
                               ▼
                    ┌─────────────────────┐
                    │   ASP.NET Core     │
                    │                     │
                    │  Authentication    │
                    │  Authorization     │
                    │  Controllers       │
                    │  Services          │
                    └──────────┬──────────┘
                               │
                         Entity Framework
                               │
                               ▼
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    └─────────────────────┘
```

This separation makes it possible to understand the responsibilities of both sides independently before connecting them together.
