#!/bin/bash

# User Migration Script
echo "🚀 Starting User Migration from PostgreSQL to Firebase"
echo "=================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create a .env file with your Firebase and database configuration"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if Firebase config is present
if [ -z "$FIREBASE_API_KEY" ]; then
    echo "❌ Error: Firebase configuration not found in .env"
    echo "Please add Firebase configuration to your .env file"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run the migration script
echo "🔄 Running migration script..."
npx ts-node src/scripts/migrateUsers.ts

echo "✅ Migration script completed"
