Write-Host "Setting up MenuQR with menu_basic Supabase project..." -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Linking to Supabase project..." -ForegroundColor Yellow
supabase link --project-ref owibhiiwghyznptfgfcr

Write-Host ""
Write-Host "Step 2: Applying database migrations..." -ForegroundColor Yellow
supabase db push

Write-Host ""
Write-Host "Step 3: Deploying edge functions..." -ForegroundColor Yellow
supabase functions deploy validate-signup
supabase functions deploy get-client-info

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Don't forget to:" -ForegroundColor Red
Write-Host "1. Update your .env file with the correct anon key" -ForegroundColor White
Write-Host "2. Configure authentication settings in Supabase dashboard" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start the development server" -ForegroundColor White
Write-Host ""
Write-Host "Available signup codes for testing:" -ForegroundColor Cyan
Write-Host "- 8119811655SS" -ForegroundColor White
Write-Host "- 9876543210AB" -ForegroundColor White
Write-Host "- 1234567890CD" -ForegroundColor White
Write-Host "- 5555666677EF" -ForegroundColor White
Write-Host "- 9999888877GH" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue"