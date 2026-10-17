# Cocktail API — KnSolvro Recruitment Task

REST API for managing cocktails, their ingredients, categories, and reviews, built with **NestJS**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**.

---

## Key Features

- **Cocktail Management (CRUD)**:
  - Recipe creation with ingredient lists, precise units/amounts, order, and instructions
  - Association of each cocktail with its author
  - Updating and deleting restricted exclusively to the cocktail author or a user with the `admin` role
  - Advanced filtering: search by name, category, author, alcoholic content, and ingredient
  - Sorting and pagination

- **Ingredient Management (CRUD)**:
  - Name, description, alcoholic flag, image
  - Public browsing with filtering and pagination
  - Updating and deleting restricted exclusively to a user with the `admin` role

- **Category Management (CRUD)**:
  - Assigning categories to cocktails
  - Updating and deleting restricted exclusively to a user with the `admin` role

- **Review and Rating System**:
  - Authenticated users can submit a rating (1-5) and a comment for a cocktail
  - Uniqueness constraint: a user can submit at most one review per cocktail
  - Updating and deleting restricted exclusively to the review author or a user with the `admin` role

- **Authentication and Authorization**:
  - Registration and login with password hashing
  - Roles: `user` and `admin`

- **Swagger Documentation**:
  - Full interactive documentation available at `/api` with Bearer JWT authorization.

---

## Database Schema (ERD)

The project uses a relational PostgreSQL database.

![databaseVisualised.png](databaseVisualised.png)

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Docker](https://www.docker.com/) (for the PostgreSQL database container)

---

## Getting Started

### 1. Clone repository and install dependencies

```bash
git clone https://github.com/S1iwa/KnSolvroRecruitment
cd KnSolvroRecruitment
npm install
```

### 2. Environment variables configuration

Ensure that the `.env` file exists in the root directory of the project:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cocktail_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
```

### 3. Start PostgreSQL database (Docker)

```bash
docker compose up -d
```

### 4. Prisma migrations and demo data seeding

```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Run the application

```bash
# Development mode
npm run start:dev
```
or
```bash
# Production mode
npm run build
npm run start:prod
```

The application will start at: `http://localhost:3000`

---

## API Documentation (Swagger)

Once the application is running, full documentation with interactive endpoint testing is available at:

**[http://localhost:3000/api](http://localhost:3000/api)**

---

## Demo Accounts (Seed)

| Role | Email | Password | Permissions |
|---|---|---|---|
| **ADMIN** | `admin@example.com` | `admin123` | Full access: adding ingredients, categories, editing/deleting any cocktails and reviews |
| **USER** | `user@example.com` | `user123` | Adding cocktails, editing own recipes, leaving reviews |
| **USER** | `bartender@example.com` | `user123` | Additional user account (author of Classic Mojito) |

---

## Tests

```bash
# Run unit tests
npm test
```