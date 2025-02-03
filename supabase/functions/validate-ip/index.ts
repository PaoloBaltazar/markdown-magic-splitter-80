import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get client IP from request headers, handling multiple IPs in x-forwarded-for
    const forwardedFor = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    
    // Extract the original client IP (first one in the list if multiple)
    const clientIP = forwardedFor?.split(',')[0].trim() || 
                    realIp || 
                    '0.0.0.0'
    
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))
    console.log('Validating IP:', clientIP)

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration')
      throw new Error('Server configuration error')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Query allowed_ips table using maybeSingle() instead of single()
    const { data: allowedIP, error: queryError } = await supabaseClient
      .from('allowed_ips')
      .select('ip_address')
      .eq('ip_address', clientIP)
      .maybeSingle()

    if (queryError) {
      console.error('Database query error:', queryError)
      throw queryError
    }

    const isAllowed = !!allowedIP
    console.log(`IP check result for ${clientIP}: ${isAllowed ? 'allowed' : 'denied'}`)
    console.log('Allowed IP data:', allowedIP)

    return new Response(
      JSON.stringify({
        allowed: isAllowed,
        message: isAllowed ? 'Access granted' : 'IP address not allowed',
        ip: clientIP // Include the detected IP in the response for debugging
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: isAllowed ? 200 : 403
      }
    )

  } catch (error) {
    console.error('Error in validate-ip function:', error)
    return new Response(
      JSON.stringify({
        allowed: false,
        message: 'Internal server error',
        details: error.message,
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '0.0.0.0'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    )
  }
})