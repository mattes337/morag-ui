#!/bin/sh
set -e

echo "🚀 Starting Morag UI container..."

# Function to wait for database to be ready
wait_for_db() {
    echo "⏳ Waiting for database to be ready..."
    
    # Extract database connection details from DATABASE_URL
    # Format: mysql://user:password@host:port/database
    if [ -z "$DATABASE_URL" ]; then
        echo "❌ DATABASE_URL environment variable is not set"
        exit 1
    fi
    
    # Parse DATABASE_URL to extract host and port
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    
    if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ]; then
        echo "❌ Could not parse database host and port from DATABASE_URL"
        exit 1
    fi
    
    echo "🔍 Checking database connectivity to $DB_HOST:$DB_PORT..."
    
    # Wait for database to be ready (max 60 seconds)
    timeout=60
    while [ $timeout -gt 0 ]; do
        if nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; then
            echo "✅ Database is ready!"
            return 0
        fi
        echo "⏳ Database not ready yet, waiting... ($timeout seconds remaining)"
        sleep 2
        timeout=$((timeout - 2))
    done
    
    echo "❌ Database connection timeout after 60 seconds"
    exit 1
}

# Function to run database operations
run_db_operations() {
    echo "🗄️ Running database operations..."

    # Skip Prisma client generation as it's already done during build
    echo "⏭️ Skipping Prisma client generation (already done during build)"

    # Push database schema (creates tables if they don't exist)
    echo "📤 Pushing database schema..."
    timeout 60 npx prisma db push --accept-data-loss || {
        echo "⚠️ Database schema push failed or timed out, continuing anyway..."
    }

    # Run migrations (if any pending)
    echo "🔄 Running database migrations..."
    timeout 60 npx prisma migrate deploy || {
        echo "⚠️ No migrations to deploy or migration failed, continuing anyway..."
    }

    echo "✅ Database operations completed!"
}

# Function to run database seeding (optional)
run_db_seed() {
    # Check if auto-seeding is enabled (default: true)
    AUTO_SEED=${AUTO_SEED_DATABASE:-true}

    if [ "$AUTO_SEED" = "true" ]; then
        echo "🌱 Running database seed..."
        if [ -f "scripts/seed-database.js" ]; then
            echo "🔧 Using unified seeding script..."
            timeout 60 node scripts/seed-database.js || {
                echo "⚠️ Database seeding failed, but continuing anyway..."
            }
        else
            echo "⚠️ Seed script not found, auto-seeding will happen on first API call"
        fi
    else
        echo "⏭️ Skipping database seeding (AUTO_SEED_DATABASE is false)"
    fi
}

# Main execution
main() {
    echo "🏁 Starting database initialization process..."
    
    # Wait for database to be available
    wait_for_db
    
    # Run database operations
    run_db_operations
    
    # Run seeding if requested
    run_db_seed
    
    echo "🎉 Database initialization completed! Starting application..."
    
    # Start the Next.js application
    exec "$@"
}

# Run main function with all arguments passed to script
main "$@"
