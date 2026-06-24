# Saumya Parekh - Multi-Dashboard Launcher & Environment Installer
# Automatically configures a Python virtual environment and launches all 4 backends.

$PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
$VenvPath = "$PSScriptRoot\.venv"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Saumya Parekh - Portfolio Dashboard Launcher" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check/Setup Virtual Environment
if (-not (Test-Path $VenvPath)) {
    Write-Host "No Python virtual environment detected at $VenvPath." -ForegroundColor Yellow
    Write-Host "Creating Virtual Environment (.venv)... This may take a minute." -ForegroundColor Yellow
    
    # Try launching python
    try {
        python -m venv "$PSScriptRoot\.venv"
    } catch {
        Write-Host "Error: Could not execute 'python'. Ensure Python is installed and added to your system PATH." -ForegroundColor Red
        Exit
    }
    
    if (-not (Test-Path $VenvPath)) {
        Write-Host "Failed to create virtual environment." -ForegroundColor Red
        Exit
    }
    
    Write-Host "Virtual environment created successfully. Upgrading pip..." -ForegroundColor Green
    & "$VenvPath\Scripts\python.exe" -m pip install --upgrade pip
    
    Write-Host "Installing dashboard dependencies from requirements.txt..." -ForegroundColor Green
    & "$VenvPath\Scripts\pip.exe" install -r "$PSScriptRoot\requirements.txt"
    
    Write-Host "Environment preparation completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Python virtual environment detected. Proceeding to launch..." -ForegroundColor Green
}

Write-Host "Starting Flask servers on their respective ports..." -ForegroundColor Yellow

# 2. Soil Strain and Settlement Analysis (Port 8085)
Write-Host "-> Soil Strain Monitoring: Port 8085" -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\projects\soil analysis automated\backend'; Write-Host 'Starting Soil Strain Monitoring Dashboard on Port 8085...' -ForegroundColor Green; & '$VenvPath\Scripts\python.exe' app.py"

# 3. ProMix Concrete Mix Design Compliance (Port 5001)
Write-Host "-> ProMix Compliance Dashboard: Port 5001" -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\projects\concretemixdesign'; Write-Host 'Starting ProMix Concrete Compliance Dashboard on Port 5001...' -ForegroundColor Green; & '$VenvPath\Scripts\python.exe' app.py"

# 4. Intelligent Compaction / NHAI App Demo (Port 5002)
Write-Host "-> Intelligent Compaction Dashboard: Port 5002" -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\projects\nhai-app demo'; Write-Host 'Starting Intelligent Compaction Dashboard on Port 5002...' -ForegroundColor Green; & '$VenvPath\Scripts\python.exe' app.py"

# 5. Soil Analysis / Crop Recommendation (Port 5003)
Write-Host "-> Crop Recommendation Dashboard: Port 5003" -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\projects\done-FINAL\Crop-recommendations_ml_with_AI_gemini_final\Crop-recommendations_ml_with_AI_gemini_final\Crop_recommendation'; Write-Host 'Starting Crop Recommendation Dashboard on Port 5003...' -ForegroundColor Green; & '$VenvPath\Scripts\python.exe' app.py"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "All backends launched! Check the spawned terminal windows." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
