@echo off
echo ==================================
echo Applying Logo Migration
echo ==================================
echo.

echo This will apply the database migration for logo upload feature.
echo.
echo OPTION 1: Manual (Recommended)
echo -----------------------------
echo 1. Open: https://supabase.com/dashboard/project/owibhiiwghyznptfgfcr/sql/new
echo 2. Open file: supabase\migrations\20241011000016_add_logo_to_profiles.sql
echo 3. Copy ALL contents
echo 4. Paste into SQL Editor
echo 5. Click "Run"
echo.
echo OPTION 2: Using CLI
echo -----------------------------
echo.

set /p choice="Do you want to try CLI method? (y/n): "
if /i "%choice%"=="y" (
    echo.
    echo Checking Supabase CLI...
    where supabase >nul 2>nul
    if errorlevel 1 (
        echo Supabase CLI not found. Installing...
        npm install -g supabase
    )
    
    echo.
    set /p dbpass="Enter your Supabase database password: "
    
    echo.
    echo Applying migration...
    npx supabase db push --db-url "postgresql://postgres.owibhiiwghyznptfgfcr:%dbpass%@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
    
    if errorlevel 1 (
        echo.
        echo ==================================
        echo CLI method failed!
        echo ==================================
        echo Please use OPTION 1 (Manual method) above
        echo.
    ) else (
        echo.
        echo ==================================
        echo Migration applied successfully!
        echo ==================================
        echo.
    )
) else (
    echo.
    echo Please use OPTION 1 (Manual method) to apply the migration.
    echo.
)

echo.
pause
