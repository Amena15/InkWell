#!/bin/bash

# Connect to PostgreSQL and set up the database
PGPASSWORD=postgres psql -h localhost -U postgres -d postgres <<-EOSQL
    -- Create the database if it doesn't exist
    SELECT 'CREATE DATABASE inkwell'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inkwell')\gexec
    
    -- Connect to the database
    \c inkwell
    
    -- Create the schema if it doesn't exist
    CREATE SCHEMA IF NOT EXISTS auth;
    
    -- Grant all privileges on the schema to the postgres user
    GRANT ALL PRIVILEGES ON SCHEMA auth TO postgres;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO postgres;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO postgres;
    
    -- Set the search path for the postgres user
    ALTER ROLE postgres SET search_path TO auth, public;
EOSQL

echo "Database setup completed successfully!"

# Run Prisma migrations
npx prisma migrate dev --name init

echo "Migrations completed successfully!"
