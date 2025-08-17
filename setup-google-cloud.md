# Google Cloud Setup Guide for HRDA Platform

## Prerequisites
- Google Cloud account
- Google Cloud CLI (gcloud) installed (optional but recommended)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Project name: `hrda-platform-dev`
4. Click "Create"
5. Note down your **Project ID** (you'll need this)

## Step 2: Enable Required APIs

1. In your project, go to "APIs & Services" → "Library"
2. Search and enable these APIs:
   - **Cloud Run API**
   - **Firestore API**
   - **Cloud Storage API**
   - **Cloud Build API**

## Step 3: Create Service Account

1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Service account name: `hrda-platform-sa`
4. Description: `Service account for HRDA Platform backend`
5. Click "Create and Continue"

### Grant Permissions
Add these roles:
- **Cloud Run Admin**
- **Firestore Admin**
- **Storage Admin**
- **Cloud Build Service Account**

### Create and Download Key
1. Click "Done"
2. Click on your service account
3. Go to "Keys" tab
4. Click "Add Key" → "Create new key"
5. Choose "JSON"
6. Download the key file
7. **Rename it to**: `service-account-key.json`
8. **Move it to**: `HRDA_Platform/backend/`

## Step 4: Configure Environment Variables

1. Copy `env.example` to `.env`
2. Update these values in `.env`:

```bash
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-actual-project-id
GOOGLE_CLOUD_REGION=us-central1

# Firebase/Firestore Configuration
FIREBASE_PROJECT_ID=your-actual-project-id
FIREBASE_PRIVATE_KEY_ID=from-service-account-key
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=from-service-account-key
FIREBASE_CLIENT_ID=from-service-account-key
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=from-service-account-key

# Google Cloud Storage Configuration
GOOGLE_CLOUD_STORAGE_BUCKET=hrda-content-bucket
GOOGLE_CLOUD_STORAGE_KEY_FILE=./service-account-key.json
```

## Step 5: Create Firestore Database

1. Go to "Firestore" → "Create Database"
2. Choose "Start in test mode" (for development)
3. Select location: `us-central1` (or your preferred region)
4. Click "Create"

## Step 6: Create Cloud Storage Bucket

1. Go to "Cloud Storage" → "Buckets"
2. Click "Create Bucket"
3. Bucket name: `hrda-content-bucket`
4. Location: `us-central1` (same as Firestore)
5. Click "Create"

## Step 7: Test Configuration

After completing all steps, run:
```bash
npm run dev
```

The server should start without errors.

## Troubleshooting

### Common Issues:
1. **Permission denied**: Make sure service account has all required roles
2. **API not enabled**: Double-check all APIs are enabled
3. **Invalid key file**: Ensure service account key is in the correct location
4. **Project ID mismatch**: Verify project ID in `.env` matches your actual project

### Verification Commands:
```bash
# Check if gcloud is configured (optional)
gcloud auth list
gcloud config get-value project

# Test environment variables
node -e "require('dotenv').config(); console.log('Project ID:', process.env.GOOGLE_CLOUD_PROJECT_ID)"
```

## Next Steps

After successful setup:
1. Test the backend with real Google Cloud services
2. Implement file upload functionality
3. Create authentication system
4. Build frontend dashboard
