@echo off
echo 🚀 Pushing updated backend to GitHub...

echo.
echo 📁 Adding all files...
git add .

echo.
echo 💾 Committing changes...
git commit -m "Add authentication system with user management and admin panel"

echo.
echo 🚀 Pushing to GitHub...
git push origin main

echo.
echo ✅ Backend pushed to GitHub successfully!
echo.
echo 📋 Next steps:
echo 1. Go to Render dashboard
echo 2. Trigger deployment for your backend service
echo 3. Wait for deployment to complete
echo 4. Test the authentication endpoints
echo.
pause
