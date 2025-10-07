@echo off
echo 🚀 Starting User Migration from PostgreSQL to Firebase
echo ==================================================

REM Check if .env file exists
if not exist .env (
    echo ❌ Error: .env file not found
    echo Please create a .env file with your Firebase and database configuration
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist node_modules (
    echo 📦 Installing dependencies...
    npm install
)

REM Run the migration script
echo 🔄 Running migration script...
npx ts-node src/scripts/migrateUsers.ts

echo ✅ Migration script completed
pause
