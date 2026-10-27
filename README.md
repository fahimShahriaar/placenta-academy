# Placenta Academy

Curated medical education notes (PDFs) and blog posts, browsable by subject, phase, system and topic, with an admin panel for managing content.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · PostgreSQL · Prisma 7 · Auth.js (NextAuth v5) · Tailwind CSS 4 · shadcn/ui

## Prerequisites

- **Node.js** 20.19+, 22.12+ or 24+ (required by Prisma 7)
- **npm**
- **Docker** (for the local database), or a PostgreSQL server you already run

## Getting started

### 1. Clone and install

```bash
git clone <repo-url>
cd placenta-academy
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Then generate a secret with `openssl rand -base64 32` and paste it into `AUTH_SECRET` in `.env`.

The defaults in `.env.example` work with the database command below. See [Environment variables](#environment-variables) for details.

### 3. Start the database

```bash
docker run -d --name placenta-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=placenta_academy \
  -p 5432:5432 \
  -v placenta-pgdata:/var/lib/postgresql/data \
  --restart unless-stopped \
  postgres:17
```

You only need to run this once. Afterwards, start or stop it with `docker start placenta-postgres` / `docker stop placenta-postgres`.

> Using your own PostgreSQL instead? Create a `placenta_academy` database and update `DATABASE_URL` in `.env`.

### 4. Set up Prisma and the database

```bash
npm run db:generate   # generate the Prisma client into src/generated/prisma
npm run db:migrate    # apply migrations
npm run db:seed       # create the admin user and default tags
```

### 5. Run the app

```bash
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin/login

The seed creates a local admin account:

| Email                       | Password    |
| --------------------------- | ----------- |
| `admin@placentaacademy.com` | `Admin@123` |

These credentials are for local development only. Change them in any shared or production environment.

## Environment variables

| Variable                | Required | Description                                       | Default                 |
| ----------------------- | -------- | ------------------------------------------------- | ----------------------- |
| `DATABASE_URL`          | Yes      | PostgreSQL connection string                      | —                       |
| `AUTH_SECRET`           | Yes      | Secret used by Auth.js to sign sessions           | —                       |
| `UPLOAD_DIR`            | No       | Where uploaded PDFs and images are stored         | `./uploads`             |
| `MAX_PDF_SIZE`          | No       | Max PDF upload size in bytes                      | `52428800` (50 MB)      |
| `MAX_IMAGE_SIZE`        | No       | Max image upload size in bytes                    | `5242880` (5 MB)        |
| `NEXT_PUBLIC_SITE_URL`  | No       | Public URL of the site (used for SEO and sitemap) | `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_NAME` | No       | Site name shown in the UI and metadata            | `Placenta Academy`      |

## Scripts

| Command               | Description                                       |
| --------------------- | ------------------------------------------------- |
| `npm run dev`         | Start the development server                      |
| `npm run build`       | Build for production                              |
| `npm run start`       | Start the production server (after `build`)       |
| `npm run lint`        | Run ESLint                                        |
| `npm run db:generate` | Generate the Prisma client                        |
| `npm run db:migrate`  | Create and apply migrations (development)         |
| `npm run db:push`     | Push the schema to the database without migrating |
| `npm run db:seed`     | Seed the admin user and default tags              |
| `npm run db:studio`   | Open Prisma Studio to browse the database         |

## Project structure

```
prisma/
  schema.prisma       Database schema
  migrations/         Migration history
  seed.ts             Seed script
src/
  app/(public)/       Public site: home, notes, blog
  app/admin/          Admin panel
  app/api/            Auth, OG images and upload routes
  actions/            Server actions
  components/         UI components
  lib/                Prisma client, auth, uploads, search, helpers
  generated/prisma/   Generated Prisma client (git-ignored)
uploads/              Uploaded files (git-ignored)
```

## Production

```bash
npm ci
npm run db:generate
npx prisma migrate deploy   # apply migrations without creating new ones
npm run build
npm run start
```

Set `DATABASE_URL`, `AUTH_SECRET` and `NEXT_PUBLIC_SITE_URL` for the production environment, and make sure `UPLOAD_DIR` points to persistent storage.

## Troubleshooting

**`Module not found: Can't resolve '@/generated/prisma/...'`**
The Prisma client hasn't been generated. Run `npm run db:generate`, and run it again after every change to `prisma/schema.prisma`.

**`P1001: Can't reach database server at localhost:5432`**
PostgreSQL isn't running. Start Docker Desktop, then run `docker start placenta-postgres`.

**`port is already allocated` when starting the container**
Another PostgreSQL is already running on your machine. Stop it, or map a different port (e.g. `-p 5433:5432`) and update the port in `DATABASE_URL`.
