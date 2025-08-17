# Free Hosting Setup on Render (Temporary Testing)

## Why Render?
- ✅ **Free tier**: 750 hours/month
- ✅ **Easy deployment**: Connect GitHub, auto-deploy
- ✅ **Perfect for testing**: No credit card required
- ✅ **Easy migration**: Can export to Google Cloud later

## Step 1: Prepare Your Code

### 1.1 Create a GitHub Repository
1. Go to [GitHub](https://github.com)
2. Create new repository: `hrda-platform-backend`
3. Make it **Public** (required for free Render)

### 1.2 Update package.json for Render
Add this to your `package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 1.3 Create Render Configuration
Create `render.yaml` in your backend folder:

```yaml
services:
  - type: web
    name: hrda-platform-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

## Step 2: Deploy to Render

### 2.1 Sign Up for Render
1. Go to [render.com](https://render.com)
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended)

### 2.2 Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select `hrda-platform-backend` repository
4. Choose branch: `main` or `master`

### 2.3 Configure Service
- **Name**: `hrda-platform-api`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: `Free`

### 2.4 Set Environment Variables
Add these in Render dashboard:

```bash
NODE_ENV=production
PORT=10000
JWT_SECRET=your-test-secret-key
ALLOWED_ORIGINS=https://your-frontend-url.com
```

## Step 3: Test Your Deployment

### 3.1 Check Deployment
- Render will build and deploy automatically
- Wait for "Live" status (green dot)
- Your API will be available at: `https://your-app-name.onrender.com`

### 3.2 Test Endpoints
```bash
# Health check
curl https://your-app-name.onrender.com/health

# API info
curl https://your-app-name.onrender.com/api

# Robots
curl https://your-app-name.onrender.com/api/robots
```

## Step 4: Update Frontend (When Ready)

When you build the frontend, update the API base URL to your Render URL:

```javascript
const API_BASE_URL = 'https://your-app-name.onrender.com/api';
```

## Migration to Google Cloud Later

When your boss is back and you want to switch to Google Cloud:

1. **Update environment variables** in Google Cloud
2. **Change API base URL** in frontend
3. **Deploy to Google Cloud Run**
4. **Delete Render service** (optional)

## Troubleshooting

### Common Issues:
1. **Build fails**: Check `package.json` and `render.yaml`
2. **Service sleeps**: Free tier sleeps after 15 min inactivity
3. **Environment variables**: Make sure they're set in Render dashboard

### Render Dashboard Features:
- **Logs**: View real-time logs
- **Metrics**: Monitor performance
- **Manual Deploy**: Trigger deployments manually
- **Rollback**: Revert to previous version

## Cost: $0/month (Free Tier)

Perfect for testing and development! 🎉

## Next Steps After Render Setup:
1. Test all API endpoints
2. Build frontend dashboard
3. Test file upload functionality
4. When ready, migrate to Google Cloud
