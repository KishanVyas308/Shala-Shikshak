# Shala Shikshak - Educational Platform

A comprehensive educational platform with video lectures, textbooks, and solution guides for all standards.

## Features

### Public Features
- Browse standards (classes) and subjects
- View chapters with video lectures
- Download textbook PDFs and solution guides
- Responsive modern UI with Tailwind CSS

### Admin Features
- Admin authentication
- Manage standards, subjects, and chapters
- Upload PDF files (textbooks and solutions)
- Add YouTube video links
- Complete CRUD operations

## Tech Stack

### Backend
- Node.js with TypeScript
- Express.js
- Prisma ORM with PostgreSQL
- JWT Authentication
- File upload with Multer
- Input validation with Joi

### Frontend
- React with TypeScript
- React Router for navigation
- TanStack Query for data fetching
- React Hook Form with Zod validation
- Tailwind CSS for styling
- Lucide React for icons

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. Navigate to the Backend directory:
```bash
cd Backend
```

2. Copy environment file:
```bash
copy .env.example .env
```

3. Update the `.env` file with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/shala_shikshak"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
UPLOAD_DIR="uploads"
MAX_FILE_SIZE=10485760
```

4. Install dependencies:
```bash
npm install
```

5. Generate Prisma client:
```bash
npm run db:generate
```

6. Run database migrations:
```bash
npm run db:migrate
```

7. Seed the database with sample data:
```bash
npm run db:seed
```

8. Start the backend server:
```bash
npm run dev
```

The backend will be running on http://localhost:5000

### Frontend Setup

1. Navigate to the WebApp directory:
```bash
cd WebApp
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm run dev
```

The frontend will be running on http://localhost:5173

## Default Admin Credentials

After seeding the database, you can login with:
- **Email:** admin@shalashikshak.com
- **Password:** admin123

## Project Structure

```
Backend/
├── src/
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── lib/            # Database and utilities
│   ├── utils/          # Validation schemas
│   └── index.ts        # Main server file
├── prisma/
│   └── schema.prisma   # Database schema
└── uploads/            # Uploaded PDF files

WebApp/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── contexts/       # React contexts
│   ├── services/       # API service functions
│   ├── types/          # TypeScript types
│   └── lib/            # Utilities
```

## API Endpoints

### Public Endpoints
- `GET /api/standards` - Get all standards
- `GET /api/standards/:id` - Get standard by ID
- `GET /api/subjects/standard/:standardId` - Get subjects by standard
- `GET /api/subjects/:id` - Get subject by ID
- `GET /api/chapters/subject/:subjectId` - Get chapters by subject
- `GET /api/chapters/:id` - Get chapter by ID

### Admin Endpoints (Require Authentication)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify token
- `POST /api/standards` - Create standard
- `PUT /api/standards/:id` - Update standard
- `DELETE /api/standards/:id` - Delete standard
- `POST /api/subjects` - Create subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject
- `POST /api/chapters` - Create chapter
- `PUT /api/chapters/:id` - Update chapter
- `DELETE /api/chapters/:id` - Delete chapter
- `POST /api/upload/pdf` - Upload PDF file
- `DELETE /api/upload/pdf/:filename` - Delete PDF file

## Database Schema

The application uses the following main entities:
- **Admin** - Admin users with authentication
- **Standard** - Educational standards/classes (Class 1, 2, 3, etc.)
- **Subject** - Subjects within standards (Math, Science, etc.)
- **Chapter** - Individual chapters with content

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
