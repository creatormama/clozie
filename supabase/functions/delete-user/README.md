# delete-user Edge Function

Backup of the working Supabase Edge Function code.

**This file is documentation only — editing it does NOT update the live function.**

To deploy or update: open Supabase dashboard → Edge Functions → `delete-user` → Code editor → paste this code → click Deploy.

Required for Apple Guideline 5.1.1(v) — true account deletion.
First wired: 2026-05-04 (Supabase auth Session 2).

## How it works (plain English)

1. The app calls this function with the user's session token in the Authorization header.
2. Function uses the anon key to verify "whose token is this?" — gets the user ID.
3. If the token is missing or invalid → returns 401 error.
4. If the token is valid → uses the service role key (admin) to delete that user.
5. Returns success or error.

The two keys (`SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are automatically available inside Supabase Edge Functions as environment variables — no manual setup needed.

## Code

```typescript
// Supabase Edge Function: delete-user
// Deletes the currently-authenticated user's account.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  console.log('[delete-user] request received, method:', req.method)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    console.log('[delete-user] auth header present:', !!authHeader)

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('[delete-user] token length:', token.length)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    console.log('[delete-user] env vars present:', {
      url: !!supabaseUrl,
      anon: !!anonKey,
      service: !!serviceRoleKey,
    })

    // Verify the caller's session — pass token explicitly
    const userClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: userErr } = await userClient.auth.getUser(token)

    console.log('[delete-user] getUser result:', { hasUser: !!user, error: userErr?.message })

    if (userErr || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session', detail: userErr?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[delete-user] deleting user id:', user.id)

    // Use admin client to delete the user
    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const { error: deleteErr } = await adminClient.auth.admin.deleteUser(user.id)

    console.log('[delete-user] delete result:', { error: deleteErr?.message })

    if (deleteErr) {
      return new Response(
        JSON.stringify({ error: deleteErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[delete-user] success — user deleted')

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e) {
    console.error('[delete-user] unexpected error:', (e as Error).message)
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```
