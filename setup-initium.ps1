# Initium.AI - Professional Setup Script
# ─────────────────────────────────────

Write-Host "🚀 Starting Initium.AI Setup..." -ForegroundColor Cyan

# 1. Check Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "✅ Node.js is installed." -ForegroundColor Green
}
else {
    Write-Host "❌ Node.js is missing! Please install it from https://nodejs.org" -ForegroundColor Red
    exit
}

# 2. Check MongoDB
$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if ($mongoProcess) {
    Write-Host "✅ MongoDB service is running." -ForegroundColor Green
}
else {
    Write-Host "⚠️ MongoDB is NOT running locally." -ForegroundColor Yellow
    Write-Host "💡 Note: You can also use MongoDB Atlas by updating backend/.env" -ForegroundColor Gray
}

# 3. Install Root Orchestration Dependencies
Write-Host "📦 Installing Root Dependencies..." -ForegroundColor Cyan
npm install

# 4. Install Backend Dependencies
Write-Host "📦 Installing Backend Dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install

# 5. Install Frontend Dependencies
Write-Host "📦 Installing Frontend Dependencies..." -ForegroundColor Cyan
Set-Location ../frontend-react
npm install

# Return to root
Set-Location ..

Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To run the platform:" -ForegroundColor Cyan
Write-Host "  Option 1: Run 'npm start' in this folder"
Write-Host "  Option 2: Run backend and frontend in separate terminals"
Write-Host ""
