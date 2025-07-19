# Database Persistent Storage Setup

## Overview
The PostgreSQL database data is now stored in a local directory (`./data/postgres`) instead of a Docker volume. This ensures that your data persists even when you remove the Docker container. The database configuration is now managed through environment variables for better security and flexibility.

## Environment Variables Setup

1. **Copy the example environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Update the `.env` file** with your desired database credentials:
   ```bash
   POSTGRES_DB=shala_shikshak
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_secure_password_here
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   ```

## Directory Structure
```
Backend/
├── data/
│   └── postgres/          # PostgreSQL data files stored here
├── .env                   # Your environment variables (not in git)
├── .env.example          # Template for environment variables
├── docker-compose.yml
└── init-scripts/          # Database initialization scripts
```

## Benefits
- **Data Persistence**: Database data survives container removal
- **Easy Backup**: Simply copy the `data/` folder to backup your database
- **Easy Migration**: Move the `data/` folder to migrate your database to another system
- **Development Friendly**: No need to worry about losing data during development
- **Environment Based**: Database credentials are managed through environment variables
- **Security**: Sensitive credentials are not hardcoded in docker-compose.yml

## Usage

### Initial Setup
1. Copy environment template: `cp .env.example .env`
2. Update `.env` with your database credentials
3. Create data directory (if not exists): `mkdir -p data/postgres`

### Starting the Database
```bash
docker-compose up -d
```

### Stopping the Database (data preserved)
```bash
docker-compose down
```

### Removing Container and Images (data still preserved)
```bash
docker-compose down --rmi all
```

### Complete Reset (this will delete all data)
```bash
docker-compose down -v
rm -rf data/postgres/*
```

## Important Notes

1. **First Run**: On the first run, Docker will create the necessary database files in `./data/postgres/`

2. **Permissions**: Make sure the `data/postgres` directory has proper permissions. Docker will handle this automatically on first run.

3. **Backup**: To backup your database, simply copy the entire `data/` folder:
   ```bash
   cp -r data/ backup-$(date +%Y%m%d)/
   ```

4. **Restore**: To restore from a backup, replace the `data/` folder with your backup:
   ```bash
   docker-compose down
   rm -rf data/
   cp -r backup-20250719/ data/
   docker-compose up -d
   ```

## Troubleshooting

### Environment Variables Not Loading
If the container fails to start with environment variable errors:
1. Ensure `.env` file exists in the Backend directory
2. Check that all required variables are set in `.env`
3. Verify no extra spaces around the `=` sign in `.env`
4. Restart docker-compose: `docker-compose down && docker-compose up -d`

### Permission Issues
If you encounter permission issues, you can fix them by:
```bash
sudo chown -R 999:999 data/postgres
```

### Data Corruption
If the database fails to start due to data corruption:
1. Stop the container: `docker-compose down`
2. Remove corrupted data: `rm -rf data/postgres/*`
3. Restart: `docker-compose up -d`
4. Restore from backup if available

### Changing Database Credentials
To change database credentials:
1. Stop the container: `docker-compose down`
2. Update credentials in `.env` file
3. Remove existing data: `rm -rf data/postgres/*` (optional, will reset database)
4. Start container: `docker-compose up -d`
