# Shala Shikshak Backend

Educational platform backend API built with Node.js, TypeScript, Express, and Prisma.

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ installed

### Setup

1. **Clone and navigate to the project:**
   ```bash
   cd "d:\All-Project\Freelance\shala shikshak\Backend"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start PostgreSQL with Docker:**
   ```bash
   npm run docker:up
   ```

4. **Run database migrations and seed data:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

### Alternative: One-command setup
```bash
npm run setup
```

## Docker Commands

- **Start all services:** `npm run docker:up`
- **Stop all services:** `npm run docker:down`
- **Start only database:** `npm run docker:db-only`
- **View logs:** `npm run docker:logs`
- **Reset everything:** `npm run docker:reset`
- **Development with Docker DB:** `npm run dev:docker`

## Database Access

### PostgreSQL Database
- **Host:** localhost
- **Port:** 5432
- **Database:** shala_shikshak
- **Username:** postgres
- **Password:** password123

### pgAdmin (Optional Web UI)
- **URL:** http://localhost:5050
- **Email:** admin@shalashikshak.com
- **Password:** admin123

To connect to PostgreSQL in pgAdmin:
- **Host:** postgres (or localhost if accessing from host machine)
- **Port:** 5432
- **Database:** shala_shikshak
- **Username:** postgres
- **Password:** password123

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Admin registration (dev only)
- `GET /api/auth/verify` - Verify token

### Standards
- `GET /api/standards` - Get all standards
- `GET /api/standards/:id` - Get standard by ID
- `POST /api/standards` - Create standard (admin only)
- `PUT /api/standards/:id` - Update standard (admin only)
- `DELETE /api/standards/:id` - Delete standard (admin only)

### Subjects
- `GET /api/subjects/standard/:standardId` - Get subjects by standard
- `GET /api/subjects/:id` - Get subject by ID
- `POST /api/subjects` - Create subject (admin only)
- `PUT /api/subjects/:id` - Update subject (admin only)
- `DELETE /api/subjects/:id` - Delete subject (admin only)

### Chapters
- `GET /api/chapters/subject/:subjectId` - Get chapters by subject
- `GET /api/chapters/:id` - Get chapter by ID
- `POST /api/chapters` - Create chapter (admin only)
- `PUT /api/chapters/:id` - Update chapter (admin only)
- `DELETE /api/chapters/:id` - Delete chapter (admin only)

### File Upload
- `POST /api/upload/pdf` - Upload PDF file (admin only)
- `DELETE /api/upload/pdf/:filename` - Delete uploaded file (admin only)

## Default Admin Credentials

After running the seed script, you can login with:
- **Email:** admin@shalashikshak.com
- **Password:** admin123

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```env
DATABASE_URL="postgresql://postgres:password123@localhost:5432/shala_shikshak"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
UPLOAD_DIR="uploads"
MAX_FILE_SIZE=10485760
```

## Development

### Database Operations
- **Generate Prisma client:** `npm run db:generate`
- **Run migrations:** `npm run db:migrate`
- **Reset database:** `npm run db:reset`
- **Seed database:** `npm run db:seed`
- **Open Prisma Studio:** `npm run db:studio`

### File Structure
```
src/
├── index.ts              # Main application entry
├── lib/
│   └── prisma.ts         # Prisma client setup
├── middleware/
│   └── auth.ts           # Authentication middleware
├── routes/
│   ├── auth.ts           # Authentication routes
│   ├── standards.ts      # Standards CRUD
│   ├── subjects.ts       # Subjects CRUD
│   ├── chapters.ts       # Chapters CRUD
│   └── upload.ts         # File upload routes
├── utils/
│   └── validation.ts     # Input validation schemas
└── seed.ts               # Database seeding script
```

## Production Deployment

1. Update environment variables for production
2. Change JWT_SECRET to a secure random string
3. Update database credentials
4. Set NODE_ENV to "production"
5. Build the application: `npm run build`
6. Start the production server: `npm start`

## Troubleshooting

### Docker Issues
- Ensure Docker is running
- Check if ports 5432 and 5050 are available
- Run `docker-compose logs` to see container logs

### Database Connection Issues
- Verify PostgreSQL container is running: `docker ps`
- Check database credentials in `.env` file
- Ensure database migrations have been run

### File Upload Issues
- Check if `uploads` directory exists and is writable
- Verify MAX_FILE_SIZE setting in environment variables
