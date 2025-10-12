# Edge Functions

## TypeScript Errors in IDE

If you see TypeScript errors like "Cannot find module 'https://deno.land/std@0.168.0/http/server.ts'" or "Cannot find name 'Deno'", these are **false positives**.

### Why?
- These functions run in **Deno runtime**, not Node.js
- VS Code's TypeScript server expects Node.js modules
- The functions are already **deployed and working** in Supabase

### To Fix IDE Errors (Optional):

1. Install Deno extension for VS Code:
   ```
   code --install-extension denoland.vscode-deno
   ```

2. Enable Deno for these folders in VS Code settings:
   ```json
   {
     "deno.enable": true,
     "deno.enablePaths": [
       "./supabase/functions"
     ]
   }
   ```

### Deployed Functions:

✅ **validate-signup** - Validates signup codes (checks database)
✅ **get-client-info** - Gets client information

Both functions are **ACTIVE** and working in production!

## Testing

The functions are deployed to:
- Project: owibhiiwghyznptfgfcr
- Status: ACTIVE
- Runtime: Deno Edge Runtime

You can test them via Supabase dashboard or by triggering signup flow.
