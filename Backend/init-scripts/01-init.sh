#!/bin/bash

# Create database initialization script
# This script will be run when the PostgreSQL container starts for the first time

echo "Creating database and setting up permissions..."

# The database is already created by POSTGRES_DB environment variable
# But we can add additional setup here if needed

echo "Database setup completed!"
