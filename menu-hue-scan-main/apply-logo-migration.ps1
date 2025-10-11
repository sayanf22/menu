# PowerShell script to apply logo migration
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Applying Logo Migration" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseInstalled) {
    Write-Host "Supabase CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g supabase
}

# Read the SQL migration file
$sqlFile = ".\supabase\migrations\20241011000016_add_logo_to_profiles.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "Migration file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "Reading migration file..." -ForegroundColor Green
$sql = Get-Content $sqlFile -Raw

Write-Host ""
Write-Host "Migration SQL:" -ForegroundColor Yellow
Write-Host $sql
Write-Host ""

# Get project details from .env
$projectId = "owibhiiwghyznptfgfcr"
$projectUrl = "https://owibhiiwghyznptfgfcr.supabase.co"

Write-Host "Project ID: $projectId" -ForegroundColor Cyan
Write-Host "Project URL: $projectUrl" -ForegroundColor Cyan
Write-Host ""

# Prompt for database password
Write-Host "Please enter your Supabase database password:" -ForegroundColor Yellow
$dbPassword = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Construct connection string
$connectionString = "postgresql://postgres.owibhiiwghyznptfgfcr:$plainPassword@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

Write-Host ""
Write-Host "Applying migration..." -ForegroundColor Green

# Try to apply migration using Supabase CLI
try {
    npx supabase db push --db-url $connectionString
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "Migration applied successfully!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Red
    Write-Host "CLI method failed. Please apply manually:" -ForegroundColor Red
    Write-Host "==================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "1. Go to: https://supabase.com/dashboard/project/owibhiiwghyznptfgfcr/sql/new" -ForegroundColor Yellow
    Write-Host "2. Copy the SQL from: $sqlFile" -ForegroundColor Yellow
    Write-Host "3. Paste and click 'Run'" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
