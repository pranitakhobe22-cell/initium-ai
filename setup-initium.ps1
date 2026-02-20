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
    Write-Host "💡 Please start MongoDB or provide an Atlas URI in backend/.env" -ForegroundColor Gray
}

# 3. Install Backend Dependencies
Write-Host "📦 Installing Backend Dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install

# 4. Install Frontend Dependencies
Write-Host "📦 Installing Frontend Dependencies..." -ForegroundColor Cyan
Set-Location ../frontend-react
npm install

Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To run the platform:" -ForegroundColor Cyan
Write-Host "  1. Backend:  cd backend; npm start"
Write-Host "  2. Frontend: cd frontend-react; npm run dev"
Write-Host ""
