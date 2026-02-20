# Initium.AI - Professional Setup Script
# -------------------------------------

Write-Host "Starting Initium.AI Setup..."

# 1. Check Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "Node.js is installed."
}
else {
    Write-Host "Node.js is missing! Please install it from https://nodejs.org"
    exit
}

# 2. Check MongoDB
$mongoProcess = Get-Process mongod -ErrorAction SilentlyContinue
if ($mongoProcess) {
    Write-Host "MongoDB service is running."
}
else {
    Write-Host "MongoDB is NOT running locally."
    Write-Host "Note: You can also use MongoDB Atlas by updating backend/.env"
}

# 3. Install Root Orchestration Dependencies
Write-Host "Installing Root Dependencies..."
npm install

# 4. Install Backend Dependencies
Write-Host "Installing Backend Dependencies..."
Set-Location backend
npm install

# 5. Install Frontend Dependencies
Write-Host "Installing Frontend Dependencies..."
Set-Location ../frontend-react
npm install

# Return to root
Set-Location ..

Write-Host "Setup Complete!"
Write-Host ""
Write-Host "To run the platform:"
Write-Output "  Option 1: Run npm start in this folder"
Write-Output "  Option 2: Run backend and frontend in separate terminals"
Write-Output ""
