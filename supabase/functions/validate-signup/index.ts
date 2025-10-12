import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { signupCode } = await req.json()

    if (!signupCode || typeof signupCode !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid signup code provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client with service role key - ALWAYS check database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if code exists in database
    const { data: codeData, error: fetchError } = await supabase
      .from('signup_codes')
      .select('id, code, is_used')
      .eq('code', signupCode)
      .single()

    if (fetchError || !codeData) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid signup code' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Universal code: Shy8119811655@34 - never gets marked as used
    const UNIVERSAL_CODE = 'Shy8119811655@34'
    
    if (codeData.code === UNIVERSAL_CODE) {
      // Universal code is always valid, don't mark as used
      return new Response(
        JSON.stringify({ valid: true }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // For non-universal codes, check if already used
    if (codeData.is_used) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Signup code already used' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Mark non-universal code as used
    const { error: updateError } = await supabase
      .from('signup_codes')
      .update({ 
        is_used: true, 
        used_at: new Date().toISOString() 
      })
      .eq('id', codeData.id)

    if (updateError) {
      console.error('Error updating signup code:', updateError)
      return new Response(
        JSON.stringify({ valid: false, error: 'Failed to validate code' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ valid: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in validate-signup function:', error)
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})