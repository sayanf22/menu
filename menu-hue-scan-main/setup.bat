@echo off
echo Setting up MenuQR with menu_basic Supabase project...
echo.

echo Step 1: Linking to Supabase project...
supabase link --project-ref owibhiiwghyznptfgfcr

echo.
echo Step 2: Applying database migrations...
supabase db push

echo.
echo Step 3: Deploying edge functions...
supabase functions deploy validate-signup
supabase functions deploy get-client-info

echo.
echo Setup complete! 
echo.
echo IMPORTANT: Don't forget to:
echo 1. Update your .env file with the correct anon key
echo 2. Configure authentication settings in Supabase dashboard
echo 3. Run 'npm run dev' to start the development server
echo.
echo Available signup codes for testing:
echo - 8119811655SS
echo - 9876543210AB  
echo - 1234567890CD
echo - 5555666677EF
echo - 9999888877GH
echo.
pause