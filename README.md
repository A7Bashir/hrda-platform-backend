# HRDA Platform Backend API

## Overview
Backend API server for the HRDA Multi-Robot Big Screen Management Platform. This service handles robot management, content uploads, and communication between the cloud platform and robots.

## Features
- **Robot Management**: CRUD operations for robot instances
- **Content Management**: File upload, storage, and delivery
- **Real-time Updates**: Communication protocol for robot content updates
- **Security**: JWT authentication, rate limiting, and input validation
- **Monitoring**: Health checks and logging

## Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Cloud account
- Firebase project

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the environment template and configure your values:
```bash
cp env.example .env
```

Edit `.env` with your actual configuration values.

### 3. Google Cloud Setup
- Create a Google Cloud project
- Enable required APIs (Cloud Run, Firestore, Storage)
- Create a service account and download the key file
- Place the key file in the project root as `service-account-key.json`

### 4. Firebase Setup
- Create a Firebase project
- Enable Firestore database
- Configure security rules
- Update environment variables with Firebase credentials

## Development

### Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run deploy` - Deploy to Google Cloud Run

## API Endpoints

### Health Check
- `GET /health` - Service health status

### API Information
- `GET /api` - API overview and available endpoints

### Robot Management (Coming Soon)
- `GET /api/robots` - List all robots
- `GET /api/robots/:robotId` - Get robot details
- `PUT /api/robots/:robotId/status` - Update robot status

### Content Management (Coming Soon)
- `POST /api/content/upload` - Upload new content
- `GET /api/content` - List all content
- `DELETE /api/content/:contentId` - Delete content
- `PUT /api/content/:contentId/assign` - Assign content to robots

### Robot Updates (Coming Soon)
- `POST /api/updates/send` - Send content update to robot(s)
- `GET /api/updates/status` - Get update delivery status

## Project Structure
```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── env.example            # Environment configuration template
├── README.md              # This file
├── routes/                # API route handlers (coming soon)
├── controllers/           # Business logic (coming soon)
├── models/                # Data models (coming soon)
├── middleware/            # Custom middleware (coming soon)
├── services/              # External service integrations (coming soon)
└── utils/                 # Utility functions (coming soon)
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment mode | No | development |
| `GOOGLE_CLOUD_PROJECT_ID` | Google Cloud project ID | Yes | - |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `GOOGLE_CLOUD_STORAGE_BUCKET` | Storage bucket name | Yes | - |

## Security Features
- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Input Validation**: Request data sanitization
- **JWT Authentication**: Secure API access

## Deployment

### Google Cloud Run
```bash
npm run deploy
```

### Manual Deployment
1. Build the application
2. Upload to Google Cloud Storage
3. Deploy to Cloud Run
4. Configure environment variables

## Monitoring & Logging
- **Morgan**: HTTP request logging
- **Health Checks**: Service status monitoring
- **Error Handling**: Comprehensive error responses
- **Performance**: Response time tracking

## Contributing
1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Submit pull requests

## Support
For technical support or questions, contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: [Current Date]  
**Status**: Development Phase
