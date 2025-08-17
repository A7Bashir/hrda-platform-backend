@echo off
echo ========================================
echo HRDA Platform - Google Cloud Setup
echo ========================================
echo.

echo Step 1: Creating .env file from template...
if not exist .env (
    copy env.example .env
    echo ✅ .env file created from template
) else (
    echo ⚠️  .env file already exists
)

echo.
echo Step 2: Checking for service account key...
if exist service-account-key.json (
    echo ✅ Service account key found
) else (
    echo ❌ Service account key NOT found
    echo.
    echo Please follow the setup-google-cloud.md guide to:
    echo 1. Create Google Cloud project
    echo 2. Create service account
    echo 3. Download service-account-key.json
    echo 4. Place it in this directory
    echo.
    pause
    exit /b 1
)

echo.
echo Step 3: Testing environment configuration...
node -e "require('dotenv').config(); console.log('Project ID:', process.env.GOOGLE_CLOUD_PROJECT_ID || 'NOT SET'); console.log('Storage Bucket:', process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'NOT SET')"

echo.
echo Step 4: Installing dependencies...
npm install

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update .env with your actual Google Cloud values
echo 2. Run: npm run dev
echo 3. Test the API endpoints
echo.
echo For detailed setup instructions, see: setup-google-cloud.md
echo.
pause
