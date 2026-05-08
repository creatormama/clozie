# recognize-photo Edge Function

Backup of the working Supabase Edge Function code.

**This file is documentation only — editing it does NOT update the live function.**

To deploy or update: open Supabase dashboard → Edge Functions → `recognize-photo` → Code editor → paste this code → click Deploy.

First wired: 2026-05-08 (Session 7a — photo recognition migrated off client).

## How it works (plain English)

1. The app sends a base64-encoded JPEG photo with the user's session token in the Authorization header.
2. Function verifies the session is valid — if not, returns 401 (no Anthropic call made).
3. Function calls Anthropic with the photo + recognition prompt, using `ANTHROPIC_API_KEY` from secrets.
4. Parses Anthropic's JSON, validates the category against the allowed list, runs the name-mismatch correction (e.g. if name says "Linen Blazer" but category came back "Tops", corrects to "Outerwear").
5. Returns `{ name, category, color, description }` to the app.

The Anthropic key never leaves Supabase. The client never sees it.

## Required secrets (Supabase → Edge Functions → Secrets)

- `ANTHROPIC_API_KEY` — added 2026-05-08 in Session 7a.

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are auto-provided by Supabase.

## Code

```typescript
// Supabase Edge Function: recognize-photo
// Verifies the user's session, then calls Anthropic to recognize a wardrobe photo.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const ALLOWED_CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories']

const PROMPT = `You are a fashion expert analysing a clothing item photo for a wardrobe app called Clozie.
Return ONLY a JSON object:
{
  "name": "fabric + garment type, 2-4 words",
  "category": "exactly one of: Tops, Bottoms, Dresses, Outerwear, Shoes, Accessories",
  "color": "fashion color name + pattern if any",
  "description": "fit and style phrase"
}
NAME: MUST include fabric. 'White Linen Shirt' not 'White Shirt'. 'Black Leather Pants' not 'Black Pants'. 'Navy Silk Camisole' not 'Blue Top'.
COLOR: Fashion names. Navy not Blue, Cream not White, Olive not Green, Burgundy not Red, Camel not Brown, Blush not Pink, Charcoal not Dark Grey. Patterns: 'Navy & White Stripe', 'Floral on Cream'.
DESCRIPTION: Include fit when visible: oversized, fitted, relaxed, cropped, slim, wide-leg, structured.
CATEGORY: Jackets/coats/blazers/cardigans = Outerwear. Jumpsuits/rompers = Dresses. Bags/scarves/hats/jewelry/belts = Accessories.
JSON only. No preamble.`

// Catches the ~5% of cases where the model picks the wrong category despite naming the item correctly.
function correctCategoryFromName(name: string, category: string): string {
  const n = (name || '').toLowerCase()
  if (/jacket|coat|blazer|cardigan/.test(n) && category !== 'Outerwear') return 'Outerwear'
  if (/jumpsuit|romper/.test(n) && category !== 'Dresses') return 'Dresses'
  if (/\b(bag|scarf|hat|belt|jewelry|jewellery)\b/.test(n) && category !== 'Accessories') return 'Accessories'
  return category
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  console.log('[recognize-photo] request received, method:', req.method)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization header' }, 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')

    if (!anthropicKey) {
      console.error('[recognize-photo] missing ANTHROPIC_API_KEY secret')
      return jsonResponse({ error: 'Server misconfigured' }, 500)
    }

    const userClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: userErr } = await userClient.auth.getUser(token)

    if (userErr || !user) {
      console.log('[recognize-photo] auth failed:', userErr?.message)
      return jsonResponse({ error: 'Invalid or expired session' }, 401)
    }

    console.log('[recognize-photo] auth OK, user:', user.id)

    // 2. Parse body
    const body = await req.json().catch(() => null)
    if (!body || typeof body.imageBase64 !== 'string' || !body.imageBase64) {
      return jsonResponse({ error: 'Missing imageBase64 in request body' }, 400)
    }

    const imageBase64: string = body.imageBase64

    // Sanity check: reject suspiciously large images (a 512px JPEG at q=0.75 is ~50-150KB base64)
    if (imageBase64.length > 2_000_000) {
      console.log('[recognize-photo] image too large:', imageBase64.length)
      return jsonResponse({ error: 'Image too large' }, 413)
    }

    // 3. Call Anthropic
    console.log('[recognize-photo] calling Anthropic, base64 length:', imageBase64.length)
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
              { type: 'text', text: PROMPT },
            ],
          },
        ],
      }),
    })

    if (!anthropicResponse.ok) {
      const errBody = await anthropicResponse.text().catch(() => '')
      console.error('[recognize-photo] Anthropic error:', anthropicResponse.status, errBody.slice(0, 200))
      return jsonResponse({ error: `Anthropic API ${anthropicResponse.status}` }, 502)
    }

    const json = await anthropicResponse.json()
    const text = json?.content?.[0]?.text
    if (!text) {
      console.error('[recognize-photo] empty content in Anthropic response')
      return jsonResponse({ error: 'Empty response from Clozie' }, 502)
    }

    // 4. Parse + validate JSON
    let parsed
    try {
      parsed = JSON.parse(String(text).trim())
    } catch {
      const match = String(text).match(/\{[\s\S]*\}/)
      if (!match) {
        console.error('[recognize-photo] could not parse JSON from response')
        return jsonResponse({ error: 'Could not parse Clozie response' }, 502)
      }
      try {
        parsed = JSON.parse(match[0])
      } catch {
        return jsonResponse({ error: 'Could not parse Clozie response' }, 502)
      }
    }

    let { name, category, color, description } = parsed
    if (!name || !category) {
      return jsonResponse({ error: 'Missing fields in Clozie response' }, 502)
    }

    if (!ALLOWED_CATEGORIES.includes(category)) category = 'Tops'
    category = correctCategoryFromName(name, category)

    const result = {
      name: String(name).trim(),
      category,
      color: color ? String(color).trim() : '',
      description: description ? String(description).trim() : '',
    }

    console.log('[recognize-photo] success:', result.name, '/', result.category)

    return jsonResponse(result, 200)
  } catch (e) {
    console.error('[recognize-photo] unexpected error:', (e as Error).message)
    return jsonResponse({ error: (e as Error).message }, 500)
  }
})
```
