# HRDA Platform Backend - Setup Guide

## 🚀 Quick Start (Windows)

### Option 1: Automatic Setup (Recommended)
1. Double-click `start.bat` in the backend folder
2. The script will automatically:
   - Check if Node.js is installed
   - Install dependencies
   - Start the development server

### Option 2: Manual Setup
Follow the steps below if you prefer manual control.

## 📋 Prerequisites

### 1. Install Node.js
- Download from: https://nodejs.org/
- Choose LTS version (18.x or higher)
- Install with default settings
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

### 2. Install Git (if not already installed)
- Download from: https://git-scm.com/
- Install with default settings

## 🔧 Installation Steps

### 1. Navigate to Backend Directory
```bash
cd HRDA_Platform/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
1. Copy the environment template:
   ```bash
   copy env.example .env
   ```
2. Edit `.env` file with your configuration (see Configuration section below)

### 4. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## ⚙️ Configuration

### Environment Variables (.env file)

#### Required Configuration
```bash
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_REGION=us-central1

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

#### Optional Configuration
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# File Upload Configuration
MAX_FILE_SIZE=104857600
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,video/mp4,video/avi,video/mov
```

## 🧪 Testing

### 1. Start the Server
```bash
npm run dev
```

### 2. Run API Tests
In a new terminal:
```bash
node test-api.js
```

### 3. Manual Testing
- Health Check: http://localhost:3000/health
- API Info: http://localhost:3000/api
- Robots: http://localhost:3000/api/robots
- Content: http://localhost:3000/api/content
- Updates: http://localhost:3000/api/updates

## 📁 Project Structure

```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── env.example            # Environment configuration template
├── start.bat              # Windows startup script
├── test-api.js            # API testing script
├── README.md              # Project documentation
├── SETUP_GUIDE.md         # This file
├── routes/                # API route handlers
│   ├── robots.js         # Robot management endpoints
│   ├── content.js        # Content management endpoints
│   └── updates.js        # Update delivery endpoints
├── controllers/           # Business logic (coming soon)
├── models/                # Data models (coming soon)
├── middleware/            # Custom middleware (coming soon)
├── services/              # External service integrations (coming soon)
└── utils/                 # Utility functions (coming soon)
```

## 🚀 Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests (coming soon)
npm run deploy     # Deploy to Google Cloud Run
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "npm is not recognized"
- **Solution**: Install Node.js from https://nodejs.org/
- **Verify**: Run `node --version` and `npm --version`

#### 2. "Port 3000 is already in use"
- **Solution**: Change PORT in `.env` file or kill the process using port 3000
- **Command**: `netstat -ano | findstr :3000` then `taskkill /PID <PID>`

#### 3. "Module not found" errors
- **Solution**: Run `npm install` to install dependencies
- **Verify**: Check if `node_modules` folder exists

#### 4. "Permission denied" errors
- **Solution**: Run PowerShell as Administrator
- **Alternative**: Use `start.bat` which handles permissions better

### Getting Help

1. Check the console output for error messages
2. Verify all environment variables are set correctly
3. Ensure Node.js version is 18+ (`node --version`)
4. Check if all dependencies are installed (`npm list`)

## 📚 Next Steps

After successful setup:

1. **Test the API**: Run `node test-api.js`
2. **Set up Google Cloud**: Follow Google Cloud setup guide
3. **Set up Firebase**: Follow Firebase setup guide
4. **Start Frontend**: Navigate to `../frontend` folder
5. **Database Setup**: Configure Firestore database

## 🔗 Useful Links

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Google Cloud Documentation](https://cloud.google.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

---

**Need Help?** Check the troubleshooting section above or contact the development team.
