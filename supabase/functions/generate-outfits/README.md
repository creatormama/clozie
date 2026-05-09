# generate-outfits Edge Function

Backup of the working Supabase Edge Function code.

**This file is documentation only — editing it does NOT update the live function.**

To deploy or update: open Supabase dashboard → Edge Functions → `generate-outfits` → Code editor → paste this code → click Deploy.

First wired: 2026-05-09 (Session 7b-1 — skeleton + stub response, no Anthropic call yet).

## How it works (plain English)

1. The app sends weather + occasion + pin + brief + style profile with the user's session token in the Authorization header.
2. Function verifies the session is valid — if not, returns 401 (no work done).
3. Function fetches the user's wardrobe from the `wardrobe_items` table, dropping items flagged `exclude_from_styling = true`.
4. Three gates:
   - **Minimum count** — fewer than 5 styleable items → returns `not_enough_items`.
   - **Minimum essentials** — must have (Tops AND Bottoms) OR Dresses → returns `missing_essentials` if not.
   - **Pinned item validity** — if `pinnedItemId` is set, it must exist in the styleable set → returns `invalid_pin` if not.
5. Picks 3 stub outfits from the user's real wardrobe using anatomy-aware layouts:
   - Outfit 1: Tops + Bottoms + Shoes
   - Outfit 2: Dresses + Shoes (falls back to Outfit-1 layout if no dress)
   - Outfit 3: Tops + Bottoms + Light Outerwear (falls back to Shoes if no light outerwear)
6. If `pinnedItemId` is set, the pinned item appears in every outfit.
7. Returns `{ outfits: [...3...], source: "stub" }`. Each outfit has `{ id, vibe, name, description, items: [item_id, ...], styleMatchScore }`.

The `source: "stub"` field is a debug marker — it changes to `"sonnet"` in Session 7b-3 once the real Anthropic call is wired.

## Required secrets (Supabase → Edge Functions → Secrets)

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are auto-provided by Supabase. No `ANTHROPIC_API_KEY` is read by this function in 7b-1 (added in 7b-3).

## Code

```typescript
// Supabase Edge Function: generate-outfits
// Verifies the user's session, fetches their wardrobe, and returns 3 stub outfits.
// Session 7b-1 (2026-05-09): SKELETON ONLY — no Anthropic call yet. Anthropic wiring lands in 7b-3.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Light outerwear regex — names that should show on visual surfaces (matches CLAUDE.md spec).
// Heavy outerwear (puffers, parkas, trench coats) is dropped from outfits unless pinned — not used in 7b-1 stub.
const LIGHT_OUTERWEAR = /cardigan|blazer|vest|sweater|denim jacket|light jacket|shacket|cropped jacket|bolero/i

// Stub vibes/names — replaced by Sonnet output in 7b-3.
const STUB_LOOKS = [
  { vibe: 'EFFORTLESS', name: 'Morning Coffee Run', description: 'A relaxed combination pulled from your wardrobe.' },
  { vibe: 'CHIC',       name: 'Studio to Street',   description: 'Easy lines, ready for anywhere.' },
  { vibe: 'FRESH',      name: 'Quiet Confidence',   description: 'Layers that work together.' },
]

type Item = {
  id: string
  name: string
  category: string
  colour: string | null
  warmth: string | null
}

function pickRandom<T>(arr: T[]): T | null {
  if (!arr.length) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

// Pick from a category, avoiding items already used in this outfit.
// If everything in the category is taken, allow reuse (stub-only — keeps outfit complete).
function pickFromCategory(items: Item[], category: string, used: Set<string>): Item | null {
  const candidates = items.filter(i => i.category === category && !used.has(i.id))
  if (candidates.length) return pickRandom(candidates)
  const fallback = items.filter(i => i.category === category)
  return pickRandom(fallback)
}

function pickLightOuterwear(items: Item[], used: Set<string>): Item | null {
  const candidates = items.filter(i => i.category === 'Outerwear' && LIGHT_OUTERWEAR.test(i.name) && !used.has(i.id))
  return pickRandom(candidates)
}

Deno.serve(async (req) => {
  console.log('[generate-outfits] request received, method:', req.method)

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

    // Pass the user's JWT so RLS sees the logged-in user on subsequent queries.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userErr } = await userClient.auth.getUser(token)

    if (userErr || !user) {
      console.log('[generate-outfits] auth failed:', userErr?.message)
      return jsonResponse({ error: 'Invalid or expired session' }, 401)
    }

    console.log('[generate-outfits] auth OK, user:', user.id)

    // 2. Parse body
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return jsonResponse({ error: 'Missing or invalid request body' }, 400)
    }

    const temperature  = typeof body.temperature  === 'string' ? body.temperature  : null
    const condition    = typeof body.condition    === 'string' ? body.condition    : null
    const occasion     = typeof body.occasion     === 'string' ? body.occasion     : null
    const indoors      = body.indoors === true
    const pinnedItemId = typeof body.pinnedItemId === 'string' ? body.pinnedItemId : null
    const brief        = typeof body.brief        === 'string' ? body.brief        : null
    const styleProfile = body.styleProfile && typeof body.styleProfile === 'object' ? body.styleProfile : null

    if (!temperature || !condition || !occasion) {
      return jsonResponse({ error: 'Missing temperature, condition, or occasion' }, 400)
    }

    console.log('[generate-outfits] inputs:', {
      temperature, condition, occasion, indoors,
      hasPin: !!pinnedItemId, hasBrief: !!brief, hasProfile: !!styleProfile,
    })

    // 3. Fetch wardrobe — exclude items flagged not styleable.
    // Legacy rows may have NULL exclude_from_styling — treat NULL as "not excluded".
    const { data: rows, error: dbErr } = await userClient
      .from('wardrobe_items')
      .select('id, name, category, colour, warmth, exclude_from_styling')
      .eq('user_id', user.id)
    if (dbErr) {
      console.error('[generate-outfits] db error:', dbErr.message)
      return jsonResponse({ error: 'Could not load wardrobe' }, 500)
    }

    const items: Item[] = (rows || [])
      .filter(r => r.exclude_from_styling !== true)
      .map(r => ({
        id: r.id,
        name: r.name || '',
        category: r.category || '',
        colour: r.colour ?? null,
        warmth: r.warmth ?? null,
      }))

    console.log('[generate-outfits] styleable items:', items.length)

    // 4. Gate — minimum count (post-filter)
    if (items.length < 5) {
      return jsonResponse({
        error: 'not_enough_items',
        message: 'Add at least 5 items to your wardrobe for Clozie to style you.',
      }, 400)
    }

    // 5. Gate — minimum essentials: (Tops AND Bottoms) OR Dresses
    const hasTops    = items.some(i => i.category === 'Tops')
    const hasBottoms = items.some(i => i.category === 'Bottoms')
    const hasDress   = items.some(i => i.category === 'Dresses')
    if (!((hasTops && hasBottoms) || hasDress)) {
      return jsonResponse({
        error: 'missing_essentials',
        message: 'Add at least one top and one bottom (or a dress) so Clozie can style you.',
      }, 400)
    }

    // 6. Gate — pinned item must exist in styleable set
    let pinned: Item | null = null
    if (pinnedItemId) {
      pinned = items.find(i => i.id === pinnedItemId) || null
      if (!pinned) {
        return jsonResponse({
          error: 'invalid_pin',
          message: "That pinned item isn't available to style — pick another.",
        }, 400)
      }
    }

    // 7. STUB outfit composition — anatomy-aware
    // Layouts gracefully skip slots the user can't fill.
    // If a pinned item is provided, it appears in every outfit; if its category matches a layout
    // slot, that slot is filled by the pin instead of a random pick.
    // Stub may reuse items across the 3 outfits — Sonnet generation in 7b-3 will avoid this naturally.

    const buildOutfit = (layout: string[]): string[] => {
      const used = new Set<string>()
      const ids: string[] = []

      if (pinned) {
        ids.push(pinned.id)
        used.add(pinned.id)
      }

      for (const cat of layout) {
        if (pinned && pinned.category === cat) continue // pinned already covers this slot

        if (cat === 'LightOuterwear') {
          const item = pickLightOuterwear(items, used)
          if (item) { ids.push(item.id); used.add(item.id) }
          continue
        }

        const item = pickFromCategory(items, cat, used)
        if (item) { ids.push(item.id); used.add(item.id) }
      }

      return ids
    }

    const hasLightOuterwear = items.some(i => i.category === 'Outerwear' && LIGHT_OUTERWEAR.test(i.name))

    const layout1 = ['Tops', 'Bottoms', 'Shoes']
    const layout2 = hasDress ? ['Dresses', 'Shoes'] : ['Tops', 'Bottoms', 'Shoes']
    const layout3 = hasLightOuterwear ? ['Tops', 'Bottoms', 'LightOuterwear'] : ['Tops', 'Bottoms', 'Shoes']

    const outfits = [
      { id: crypto.randomUUID(), ...STUB_LOOKS[0], items: buildOutfit(layout1), styleMatchScore: 87 },
      { id: crypto.randomUUID(), ...STUB_LOOKS[1], items: buildOutfit(layout2), styleMatchScore: 87 },
      { id: crypto.randomUUID(), ...STUB_LOOKS[2], items: buildOutfit(layout3), styleMatchScore: 87 },
    ]

    console.log('[generate-outfits] success — 3 stub outfits returned')

    return jsonResponse({ outfits, source: 'stub' }, 200)
  } catch (e) {
    console.error('[generate-outfits] unexpected error:', (e as Error).message)
    return jsonResponse({ error: (e as Error).message }, 500)
  }
})
```
