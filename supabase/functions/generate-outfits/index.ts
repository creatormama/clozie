// Supabase Edge Function: generate-outfits
// Verifies the user's session, fetches their wardrobe, runs Anthropic Sonnet 4.6
// with the v5 stylist prompt + ephemeral prompt caching, and returns 3 outfits.
// Any AI/validation failure silently falls back to the stub composition from 7b-1.
//
// Session 7b-1 (2026-05-09): SKELETON ONLY — no Anthropic call.
// Session 7b-3 (2026-05-09): real Anthropic call wired. Stub kept as fallback.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const REQUESTED_OUTFITS = 3
const ANTHROPIC_TIMEOUT_MS = 15_000
const ANTHROPIC_MODEL = 'claude-sonnet-4-6'
const ANTHROPIC_TEMPERATURE = 0.75
const ANTHROPIC_MAX_TOKENS = 1500

// Fabrics commonly named in items — used to decide whether the pool line
// should add a separate "fabric" field after the colour.
const FABRIC_TOKENS = ['linen','silk','wool','cashmere','leather','suede','denim','cotton','tweed','velvet','satin','chiffon','lace','knit','fleece','down','nylon','polyester']
const FABRIC_REGEX = new RegExp(`\\b(${FABRIC_TOKENS.join('|')})\\b`, 'i')

// Light outerwear regex — names that should show on visual surfaces (matches CLAUDE.md spec).
// Heavy outerwear (puffers, parkas, trench coats) is dropped from outfits unless pinned — used by stub fallback.
const LIGHT_OUTERWEAR = /cardigan|blazer|vest|sweater|denim jacket|light jacket|shacket|cropped jacket|bolero/i

// Heavy outerwear name-pattern regex — used by the Hot/Warm temperature filter
// and the Indoor toggle. Active today; does not depend on the warmth column.
const HEAVY_OUTERWEAR = /parka|puffer|puff jacket|down coat|down jacket|duvet coat|winter coat|overcoat|shearling|sherpa|teddy|ski jacket|fur coat|faux fur|windbreaker|poncho|cape|quilted jacket|bomber|trench coat|rain jacket|peacoat|fleece jacket|fleece cover|leather jacket/i

// Open footwear name-pattern regex — used by the Cool/Cold temperature filter.
// Active today; targets shoes only — sleeveless tops and other categories untouched.
const OPEN_FOOTWEAR = /sandal|flip.?flop|flip flop|slide|espadrille|open.?toe|strappy flat|strappy heel|thong sandal/i

// Heel name-pattern regex — used by the Occasion filter for active/on-foot occasions.
// Word boundaries on heel/pump avoid false positives like "wheel" / "pumpkin".
// Other tokens (stiletto, wedge, etc.) use substring — unambiguous in the Shoes context.
const HEEL_PATTERN = /\bheels?\b|\bpumps?\b|stiletto|wedge|platform heel|high heel|kitten heel/i

// Sneaker name-pattern regex — used by the Occasion filter for Formal Event.
// Substring matching is safe — these tokens are unambiguous in the Shoes context.
const SNEAKER_PATTERN = /sneaker|trainer|running shoe|athletic shoe|tennis shoe/i

// Fancy-dress name-pattern regex — used by the Occasion filter for Outdoor · Sport.
// Delicate fabrics + formal-wear cues. Cotton/linen casual dresses unaffected.
const FANCY_DRESS_PATTERN = /chiffon|silk|satin|velvet|lace|organza|tulle|sequin|beaded|gown|evening|cocktail/i

// Skirt name-pattern regex — used by the Occasion filter for Outdoor · Sport.
// Substring match catches "skirt", "mini skirt", "miniskirt", "maxi skirt", "pencil skirt".
const SKIRT_PATTERN = /skirt/i

// Stub vibes/names — used when AI fails or returns invalid data.
const STUB_LOOKS = [
  { vibe: 'EFFORTLESS', name: 'Morning Coffee Run', description: 'A relaxed combination pulled from your wardrobe.' },
  { vibe: 'CHIC',       name: 'Studio to Street',   description: 'Easy lines, ready for anywhere.' },
  { vibe: 'FRESH',      name: 'Quiet Confidence',   description: 'Layers that work together.' },
]

const ALLOWED_VIBES = new Set([
  'CHIC','BOLD','ROMANTIC','POLISHED','EFFORTLESS','ELEVATED','PLAYFUL',
  'POWERFUL','FRESH','LUXE','RELAXED','TIMELESS','SOFT','SHARP','DREAMY',
])

// === Session 7C — Smart Fallback constants ===
// Color-family regexes. Matched against (item.name + ' ' + (item.colour || '')) lowercased.
// Word-boundary anchored to avoid false positives (e.g. "tan" inside "tank").
const COLOR_NEUTRAL = /\b(black|white|cream|ivory|beige|camel|grey|gray|charcoal|nude|stone|off-white|bone)\b/i
const COLOR_EARTH   = /\b(brown|tan|rust|terracotta|olive|khaki|chocolate|cognac|caramel|sand|taupe)\b/i
const COLOR_NAVY    = /\b(navy|midnight)\b/i

// Editorial name pools by occasion. Picked at random, no repeats within one generation.
// Keys match the exact middot strings the client sends (App.js:221, App.js:1726).
// Unrecognized occasions fall back to the 'Casual Day' pool.
const FALLBACK_NAMES_BY_OCCASION: Record<string, string[]> = {
  'Casual Day':       ['Easy Sunday', 'Weekend Edit', 'Off-Duty Ease', 'Sunday Morning', 'Relaxed & Ready'],
  'Work · Office':    ['Morning Confidence', 'Desk Ready', 'Clean Lines', 'Office Elevated', 'Power Soft'],
  'Going Out':        ['Night Mode', 'After Hours', 'Evening Edge', 'Out Tonight', 'Weekend Night'],
  'Formal Event':     ['Event Ready', 'Occasion Dressing', 'The Statement', 'Formal Grace'],
  'Outdoor · Sport':  ['Fresh Air', 'Active Day', 'Move Easy', 'Outdoor Ready'],
  'Weekend Errands':  ['Errand Chic', 'Sunday Errands', 'Quick & Easy', 'Casual Out'],
  'Travel':           ['Travel Light', 'In Transit', 'Journey Edit', 'Away Look'],
}

// Vibe pools by occasion. All entries are members of ALLOWED_VIBES so they pass validation.
const FALLBACK_VIBES_BY_OCCASION: Record<string, string[]> = {
  'Casual Day':       ['EFFORTLESS', 'RELAXED', 'FRESH', 'SOFT'],
  'Work · Office':    ['POLISHED', 'CHIC', 'ELEVATED', 'SHARP'],
  'Going Out':        ['BOLD', 'SHARP', 'LUXE', 'POWERFUL'],
  'Formal Event':     ['ELEVATED', 'TIMELESS', 'LUXE', 'POLISHED'],
  'Outdoor · Sport':  ['FRESH', 'RELAXED', 'EFFORTLESS', 'PLAYFUL'],
  'Weekend Errands':  ['EFFORTLESS', 'RELAXED', 'SOFT', 'FRESH'],
  'Travel':           ['EFFORTLESS', 'CHIC', 'TIMELESS', 'POLISHED'],
}

// One-word mood tags used in description templates.
const DESCRIPTION_MOODS = [
  'effortless', 'easy', 'considered', 'soft', 'sharp', 'polished',
  'just enough edge', 'quietly confident', 'fresh', 'pulled together',
]

// === V5 SYSTEM PROMPT — kept verbatim from CLAUDE.md spec ===
// Padded so total length comfortably exceeds Sonnet 4.6's 1,024-token cache minimum.
// First call after a deploy: cache write (cache_creation_input_tokens > 0).
// Subsequent calls within ~5 min: cache hit (cache_read_input_tokens > 0) at 10% cost.
const SYSTEM_PROMPT = `You are Clozie, a warm editorial personal stylist.
Sharp eye, gift for making women feel seen.
You receive a filtered pool of wardrobe items. Your job:
SELECT 3 distinct outfits, name them,
describe each in one sentence.

COMPOSITION RULES:
1. Select exactly 3 outfits.
2. Each outfit distinct — different energy, silhouette, anchor piece.
3. One outfit she'd choose herself. One she might not have tried. A push is not a costume.
4. Anchor each outfit around the most interesting piece. Basics support, never lead. If mostly basics, celebrate clean simplicity.
5. Vary footwear across outfits when multiple options exist.
6. Must Include Item: EVERY outfit must include it. Brief item requests are ADDITIONAL — include them in every outfit alongside any pin, not instead of it.
7. Cold: prefer Heavy/Medium. Sleeveless OK under layers, not as main layer. Hot: prefer Light/None, avoid heavy wool. Cool/Warm: mix freely. Rainy: avoid delicate fabrics. Prefer closed-toe.
8. Indoor ON: no thermal outerwear, occasion layers OK. Brief overrides indoor climate if mentioned.
9. Dislikes are absolute. Never select disliked items. Never brush against dislikes in descriptions.
10. Never apologize for wardrobe size. Never suggest adding items. Frame every outfit as intentional.
11. Only describe items from the pool. Never mention items she has not uploaded.
12. Items marked * were added today — she likely chose them for this occasion.
13. STRUCTURE: Every outfit MUST include at least one Top or one Dress. A Dress replaces both Top and Bottom. Never output two Bottoms in one outfit. Never output an outfit built from only Accessories, Bottoms, and Shoes — the core upper piece must always be present.
14. BRIEF MATCHING: When the Brief names an item with a color (white top, black dress, blue jeans), match both the garment AND the color from the pool. Do not substitute a different color.

VOICE: warm stylist friend, not a machine. Reference items by feel/color/fabric. Match tone to occasion.
Forbidden: AI, algorithm, generated, automated, system, model, processed.

Return ONLY valid JSON, no preamble:
{"outfits": [{
  "name": "2-4 words editorial",
  "vibe": "1 word from: Chic|Bold|Romantic|Polished|Effortless|Elevated|Playful|Powerful|Fresh|Luxe|Relaxed|Timeless|Soft|Sharp|Dreamy",
  "styleMatchScore": 82-99,
  "items": ["exact item names from pool"],
  "description": "1 sentence max 15 words"
}]}

--- PADDING SECTION 1: OUTFIT NAMING CRAFT ---

Outfit names make or break first impressions. The name
should make her want to wear it before she sees the items.

Good names evoke time, place, mood, or texture:
"Terracotta Tuesday" / "Morning in Milan" /
"After-Hours Edge" / "Sunday Linen" / "Power Soft" /
"Golden Hour Walk" / "Desk to Drinks" /
"Weekend in Wool" / "Rain Day Sharp" /
"Night Botanical" / "Coffee Run Chic" /
"Boardroom Bloom" / "Soft Landing" /
"Studio to Street" / "Quiet Confidence"

Never name outfits generically: "Casual Look 1" /
"Work Outfit" / "Going Out" / "Nice Outfit" /
"Everyday Style." Never number them. 2-4 words always.
Evocative, not descriptive. Reference time, place,
mood, or texture — never just the occasion name.

--- PADDING SECTION 2: DESCRIPTION VOICE ---

Descriptions must reference actual items by fabric,
color, or feel. Never say "this outfit" or "these
pieces" — name the pieces directly. Match the
emotional energy to the occasion.

Work: "The structured blazer anchors everything —
polished without trying too hard."
Weekend: "Soft cotton and clean sneakers — Saturday
morning, no agenda."
Going Out: "Dark denim against silk — just enough
edge for the evening."
Formal: "Clean lines from shoulder to hem — she walks
in and the room notices."
Outdoor: "Layered for the trail — warm where it counts,
free where it matters."
Rainy: "The trench earns its place — sharp even in
the downpour."
Date Night: "The silk does the talking — confident,
not overdressed."

When items share a color family, name the harmony:
"Tonal camel from knit to boot." When textures
contrast, celebrate it: "Matte wool against polished
leather." When one piece is the clear star, build the
description around it: "Everything orbits that
printed blouse."

--- PADDING SECTION 3: STYLING INTELLIGENCE ---

Silhouette contrast: If the top is oversized or relaxed,
pair with a slimmer bottom. If both pieces are similar
volume, add a structured layer from her wardrobe. Avoid
all-loose or all-fitted when alternatives exist —
contrast creates shape and visual interest.

Texture play: When the wardrobe contains variety, mix
matte and shine, structured and soft, heavy and light.
Cotton tee under a leather jacket. Silk blouse with
rough denim. Cashmere with crisp cotton trousers. Even
in an all-basic wardrobe, texture variety makes the
outfit feel styled, not just dressed.

The third piece: When her wardrobe includes accessories,
outerwear, scarves, belts, bags, or jewelry — use them.
A jacket over a simple top-and-jeans combination elevates
it from dressed to styled. A scarf adds a focal point.
Earrings complete the picture. If accessories exist in
the pool, at least one outfit should include them. The
third piece is what separates "I got dressed" from
"I got styled."

Proportion: Vary the visual weight across the outfit.
A chunky knit calls for a sleeker bottom. A flowing
dress pairs with structured shoes. Balance is not
matching — balance is intentional contrast.

--- PADDING SECTION 4: ANCHOR PIECE + EDGE CASES ---

Finding the anchor — the piece each outfit is built
around. Priority order:
(1) Print or pattern over solid.
(2) Named fabric (silk, cashmere, leather, linen,
    velvet) over unnamed.
(3) Color over neutral.
(4) Structured over basic.
(5) Items marked * were just added — she picked them
    for today, give them priority.
(6) All basics? The anchor is the piece with the most
    distinctive color or best-known fit.

A white t-shirt is never the anchor unless it is the
only top. A printed silk blouse is always more
interesting than a plain cotton tee. When in doubt,
anchor around whatever she would describe to a friend
first.

Edge cases:
All-black wardrobe: Celebrate texture contrast.
Structured jacket against flowing blouse. Matte knit
against shine. "All black, three different textures —
that is a statement."

All-basics wardrobe: Celebrate clean simplicity.
"She does not need noise — the fit does the work."
Focus on proportion and silhouette contrast instead
of color or pattern.

Monochrome palette: Vary weight and fabric across
the outfits. "Head-to-toe navy, each piece tells a
different story."

Single outfit requested: Make it the strongest
combination in the pool. No safe/push dynamic needed.

Large wardrobe (25+ items): Surface pieces she has
not used recently. Surprise her with a combination
she might not have tried.

--- PADDING SECTION 5: READING THE BRIEF ---

The Brief field reveals what she actually needs.
Read between the lines:

"Office is cold" — add a layer even if weather says Warm.
"No heels" — hard constraint, same weight as dislikes.
"First date" — confident but not overdressed. She wants
to feel like the best version of herself. Lean
Effortless or Chic, not Bold or Powerful.
"Job interview" — polished, structured, capable.
Not trendy. Lean Polished or Sharp.
"Festival" / "Coachella" — personality-forward,
layered, relaxed. Lean Playful or Fresh.
"Meeting his parents" — approachable, put-together,
not edgy. Lean Soft or Timeless.
"Brunch with the girls" — fun, slightly elevated
casual, could be photographed. Lean Chic or Playful.
"Easy day" / "I am tired" — comfort-first but still
styled. Prove that easy can look good. Lean Relaxed
or Effortless.

The Brief always outranks the Occasion chip when it
describes something more specific.

--- PADDING SECTION 6: FOOTWEAR + VARIETY ---

Never repeat the same shoes across all outfits when
alternatives exist. Footwear changes the entire energy:
the same jeans-and-blazer combination feels corporate
with heels, weekend with sneakers, edgy with boots.
Use this to create distinct moods across outfits.

When she only has one pair of shoes, they become the
constant — style everything else around them
differently across the outfits instead.

--- PADDING SECTION 7: FINISHING TOUCHES ---

Accessories follow the energy of the occasion:
Outdoor / Sport — no accessories. Zero.
Casual / Weekend / Travel — understated. Accessories
should disappear into the outfit, not lead it.
Work / Office — polished and intentional. Clean lines,
quiet confidence. Nothing distracting.
Going Out / Date Night — one statement piece allowed.
Personality shows here. Bold earrings OR a necklace,
never both at once.
Formal — elevated and cohesive. One focal point.

Never include bags in outfit selections. Even if bags
exist in the wardrobe pool, skip them. She chooses
her own bag.

One focal point per outfit. If the top is bold,
accessories stay quiet. If the outfit is simple,
one accessory becomes the star. Never stack scarf
plus necklace plus earrings — pick one lane.

At least one of the three outfits should include
accessories when they exist in the wardrobe.
Never force accessories into all three.`
// === END V5 SYSTEM PROMPT ===

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

type Item = {
  id: string
  name: string
  category: string
  colour: string | null
  warmth: string | null
  notes: string | null
  createdAt: string | null
}

function pickRandom<T>(arr: T[]): T | null {
  if (!arr.length) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

// Pick from a category, avoiding items already used in this outfit.
// If everything in the category is taken, allow reuse (stub fallback only).
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

function isToday(iso: string | null): boolean {
  if (!iso) return false
  try {
    const d = new Date(iso)
    const now = new Date()
    return d.getUTCFullYear() === now.getUTCFullYear()
      && d.getUTCMonth() === now.getUTCMonth()
      && d.getUTCDate() === now.getUTCDate()
  } catch {
    return false
  }
}

// Find a fabric token in a text blob. Returns the matched token (lowercased), or null.
function findFabric(text: string | null | undefined): string | null {
  if (!text) return null
  const m = String(text).match(FABRIC_REGEX)
  if (!m) return null
  return m[1].toLowerCase()
}

// Build the compressed wardrobe pool string for the AI.
// Format: Name | Category | Colour [| fabric] [| Warmth]
// Fabric only when NOT already in the name (else it doubles up). Warmth only on Outerwear.
// Today's uploads get a "* " prefix.
function buildCompressedPool(items: Item[]): string {
  const sorted = [...items].sort((a, b) => {
    const ta = a.createdAt ? Date.parse(a.createdAt) : 0
    const tb = b.createdAt ? Date.parse(b.createdAt) : 0
    return tb - ta
  })

  return sorted.map(item => {
    const todayMark = isToday(item.createdAt) ? '* ' : ''
    const parts = [item.name, item.category, item.colour || '—']

    // Fabric: only if NOT already in the name. Try notes if name has none.
    const nameFabric = findFabric(item.name)
    if (!nameFabric) {
      const noteFabric = findFabric(item.notes)
      if (noteFabric) parts.push(noteFabric)
    }

    // Warmth tag — Outerwear only.
    // Column wins when populated and not 'None'. Otherwise, fall back to name pattern:
    // HEAVY_OUTERWEAR regex first (safer bias — heavy mistagged as light is more dangerous),
    // then LIGHT_OUTERWEAR. If neither matches, no tag (avoids guessing on unknown outerwear).
    if (item.category === 'Outerwear') {
      if (item.warmth && item.warmth !== 'None') {
        parts.push(item.warmth)
      } else if (HEAVY_OUTERWEAR.test(item.name || '')) {
        parts.push('Heavy')
      } else if (LIGHT_OUTERWEAR.test(item.name || '')) {
        parts.push('Light')
      }
      // else: no tag — let Sonnet infer from name + category
    }

    return `${todayMark}${parts.join(' | ')}`
  }).join('\n')
}

// Build a concise per-call weather hint that echoes the system prompt's weather rules.
// Returns null for Cool/Warm + Sunny/Cloudy combinations where no specific rule applies.
// Goes into the user message only — does not affect the cached system prompt.
function buildWeatherHint(temperature: string, condition: string): string | null {
  const hints: string[] = []
  if (temperature === 'Cold') hints.push('prefer Heavy/Medium warmth')
  if (temperature === 'Hot') hints.push('prefer Light/None warmth, avoid heavy wool')
  if (condition === 'Rainy') hints.push('avoid delicate fabrics, prefer closed-toe shoes')
  if (condition === 'Snowy') hints.push('prefer closed-toe boots')

  if (hints.length === 0) return null
  return `For ${temperature} + ${condition}: ${hints.join('; ')}.`
}

// Build the fresh user-message content. Style profile + weather/occasion + pool.
function buildFreshContent(args: {
  styleProfile: { styles?: string[]; colours?: string[]; neverWear?: string } | null
  temperature: string
  condition: string
  occasion: string
  indoors: boolean
  brief: string | null
  pinned: Item | null
  items: Item[]
  recoveryMode: boolean
  recentOutfits: { name: string; vibe: string; itemNames: string[] }[]
  currentOutfits: { name: string; vibe: string; itemNames: string[] }[]
}): string {
  const { styleProfile, temperature, condition, occasion, indoors, brief, pinned, items, recoveryMode, recentOutfits, currentOutfits } = args

  const styles = styleProfile?.styles?.length ? styleProfile.styles.join(', ') : 'Not specified'
  const colours = styleProfile?.colours?.length ? styleProfile.colours.join(', ') : 'Not specified'
  const dislikes = (styleProfile?.neverWear || '').trim() || 'None'

  // Identity line uses styles for tone matching.
  const identity = styleProfile?.styles?.length
    ? styleProfile.styles.join(', ')
    : 'her own quiet style'

  // Category absence flags — prevent AI from hallucinating items the user does not own.
  const flags: string[] = []
  if (!items.some(i => i.category === 'Shoes')) {
    flags.push('No shoes uploaded. Do not mention footwear.')
  }
  if (!items.some(i => i.category === 'Accessories')) {
    flags.push('No accessories uploaded. Do not mention accessories.')
  }
  const coldOrCool = temperature === 'Cold' || temperature === 'Cool'
  if (coldOrCool && !items.some(i => i.category === 'Outerwear')) {
    flags.push('No outerwear uploaded.')
  }

  // Category imbalance — many tops but very few bottoms.
  // Tells Sonnet to vary the styling across outfits rather than reusing the same combination.
  const topsCount = items.filter(i => i.category === 'Tops').length
  const bottomsCount = items.filter(i => i.category === 'Bottoms').length
  if (bottomsCount <= 2 && topsCount > 8) {
    flags.push(`Only ${bottomsCount} bottom${bottomsCount === 1 ? '' : 's'} in pool — vary the styling across outfits.`)
  }

  // Small wardrobe framing — flips AI from "browsing a closet" to "solving a styling challenge".
  const small = items.length < 15
    ? 'She chose these pieces intentionally. Find the strongest combinations.'
    : ''

  // Indoor toggle ON: silence the weather signal so Sonnet styles purely for the
  // Occasion + Brief. Prevents rain anoraks / heavy parkas appearing on an
  // indoor day just because outside is Cold or Rainy. Brief overrides via the
  // Brief: line below (e.g. "office is freezing, bring a sweater" still reaches Sonnet).
  const weatherHint = indoors ? null : buildWeatherHint(temperature, condition)

  // 9F-C: Recovery directive — fires when circuit breaker is tripped (>=2 all-Nope sessions).
  // Surfaced as the second styling line so Sonnet weights it heavily, right after identity.
  const recoveryLine = recoveryMode
    ? "* RECOVERY: Her recent outfits weren't landing. Try a clearly different direction this time — vary the silhouette, mood, or anchor piece from her usual."
    : null

  const stylingLines = [
    `* Her identity is ${identity} — every outfit should feel like her, even at ${occasion}.`,
    ...(recoveryLine ? [recoveryLine] : []),
    ...(weatherHint ? [`* ${weatherHint}`] : []),
    ...flags.map(f => `* ${f}`),
    ...(small ? [`* ${small}`] : []),
  ].join('\n')

  // Just-shown outfits (this session) — stronger "vary from these" signal than recent history.
  // Block omitted entirely when empty (same pattern as recentBlock).
  const currentLines = currentOutfits
    .map(o => {
      if (!o.name && o.itemNames.length === 0) return null
      const vibePart = o.vibe ? ` (${o.vibe})` : ''
      const itemsPart = o.itemNames.length > 0 ? ` — ${o.itemNames.join(', ')}` : ''
      return `- "${o.name || 'Untitled'}"${vibePart}${itemsPart}`
    })
    .filter((line): line is string => line !== null)
  const currentBlock = currentLines.length > 0
    ? ['JUST SHOWN this session — vary the silhouette, mood, or anchor piece:', ...currentLines].join('\n')
    : null

  // Dedup: drop any recent-history outfit whose name matches a just-shown outfit
  // (avoids the same outfit appearing in both blocks if user previously rated it).
  const currentNameSet = new Set(currentOutfits.map(o => o.name).filter(Boolean))
  const dedupedRecent = recentOutfits.filter(o => !o.name || !currentNameSet.has(o.name))

  // 9F-D: Recent outfits block — formatted only when history has usable rows.
  // Returns null when no history so the block is omitted entirely from the user message.
  const recentLines = dedupedRecent
    .map(o => {
      if (!o.name && o.itemNames.length === 0) return null
      const vibePart = o.vibe ? ` (${o.vibe})` : ''
      const itemsPart = o.itemNames.length > 0 ? ` — ${o.itemNames.join(', ')}` : ''
      return `- "${o.name || 'Untitled'}"${vibePart}${itemsPart}`
    })
    .filter((line): line is string => line !== null)
  const recentBlock = recentLines.length > 0
    ? ['RECENT OUTFITS — already styled, avoid repeating these combinations:', ...recentLines].join('\n')
    : null

  return [
    `Style she loves: ${styles}`,
    `Colors she loves: ${colours}`,
    `Dislikes: ${dislikes}`,
    indoors ? 'Weather: Indoors — climate not a factor' : `Weather: ${temperature}, ${condition}`,
    `Occasion: ${occasion}`,
    `Indoor: ${indoors ? 'Yes' : 'No'}`,
    `Brief: ${brief && brief.trim() ? brief.trim() : 'None'}`,
    `Must Include: ${pinned ? pinned.name : 'None'}`,
    '',
    'STYLING NOTES:',
    stylingLines,
    '',
    'DRESS RULE: A dress is a complete outfit. Never pair a dress with bottoms. Shoes and outerwear are fine with a dress.',
    '',
    ...(currentBlock ? [currentBlock, ''] : []),
    ...(recentBlock ? [recentBlock, ''] : []),
    'WARDROBE POOL (sorted by preference):',
    buildCompressedPool(items),
  ].join('\n')
}

// Call Anthropic. Returns parsed outfits array, or null on any failure.
// Failure modes: timeout, fetch error, non-2xx, JSON parse failure, missing outfits array.
async function callAnthropic(args: {
  apiKey: string
  systemPrompt: string
  userContent: string
}): Promise<{ outfits: any[] } | null> {
  const { apiKey, systemPrompt, userContent } = args

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ANTHROPIC_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: ANTHROPIC_MAX_TOKENS,
        temperature: ANTHROPIC_TEMPERATURE,
        system: [{
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        }],
        messages: [{ role: 'user', content: userContent }],
      }),
    })
  } catch (e) {
    clearTimeout(timer)
    const msg = (e as Error).message || ''
    if (msg.includes('aborted') || msg.includes('AbortError')) {
      console.log('[generate-outfits] Anthropic timeout after 15s')
    } else {
      console.log('[generate-outfits] Anthropic fetch error:', msg)
    }
    return null
  }
  clearTimeout(timer)

  if (!response.ok) {
    const errBody = await response.text().catch(() => '')
    console.log('[generate-outfits] Anthropic non-2xx:', response.status, errBody.slice(0, 200))
    return null
  }

  let json: any
  try {
    json = await response.json()
  } catch (e) {
    console.log('[generate-outfits] Anthropic body not JSON:', (e as Error).message)
    return null
  }

  // Cache observability — non-zero cache_creation on first call after deploy (cache write),
  // non-zero cache_read on subsequent calls within ~5 min (cache hit, 10% cost).
  const usage = json?.usage || {}
  console.log('[generate-outfits] usage', JSON.stringify({
    cache_creation_input_tokens: usage.cache_creation_input_tokens ?? 0,
    cache_read_input_tokens: usage.cache_read_input_tokens ?? 0,
    input_tokens: usage.input_tokens ?? 0,
    output_tokens: usage.output_tokens ?? 0,
  }))

  const text = json?.content?.[0]?.text
  if (typeof text !== 'string' || !text) {
    console.log('[generate-outfits] Empty content from Anthropic')
    return null
  }

  // Parse JSON the AI returned. Try strict first, then regex-extract first {...} block.
  let parsed: any
  try {
    parsed = JSON.parse(text.trim())
  } catch {
    // Walk the string to find the FIRST balanced {...} block.
    // (The old greedy regex grabbed first { to LAST }, slurping any prose between blocks.)
    const start = text.indexOf('{')
    let extracted: string | null = null
    if (start !== -1) {
      let depth = 0
      for (let i = start; i < text.length; i++) {
        if (text[i] === '{') depth++
        else if (text[i] === '}') {
          depth--
          if (depth === 0) { extracted = text.slice(start, i + 1); break }
        }
      }
    }
    if (!extracted) {
      console.log('[generate-outfits] Could not locate JSON in AI response')
      return null
    }
    try {
      parsed = JSON.parse(extracted)
    } catch (e) {
      console.log('[generate-outfits] AI JSON parse failed:', (e as Error).message)
      return null
    }
  }

  if (!parsed || !Array.isArray(parsed.outfits)) {
    console.log('[generate-outfits] AI response missing outfits array')
    return null
  }

  return { outfits: parsed.outfits }
}

// Validate AI outfits and map item NAMES to UUIDs.
// Returns mapped outfits, or null if any validation step fails.
function validateAndMapOutfits(args: {
  aiOutfits: any[]
  items: Item[]
  pinned: Item | null
}): Array<{ id: string; vibe: string; name: string; description: string; items: string[]; styleMatchScore: number }> | null {
  const { aiOutfits, items, pinned } = args

  if (aiOutfits.length < REQUESTED_OUTFITS) {
    console.log('[generate-outfits] AI returned fewer than', REQUESTED_OUTFITS, 'outfits:', aiOutfits.length)
    return null
  }
  // Take exactly REQUESTED_OUTFITS, even if AI returned more.
  const limited = aiOutfits.slice(0, REQUESTED_OUTFITS)

  // Build lowercase-trimmed name → UUID lookup.
  const nameToId = new Map<string, string>()
  for (const item of items) {
    const key = (item.name || '').trim().toLowerCase()
    if (key) nameToId.set(key, item.id)
  }

  const mapped: Array<{ id: string; vibe: string; name: string; description: string; items: string[]; styleMatchScore: number }> = []
  for (const o of limited) {
    if (!o || typeof o !== 'object') {
      console.log('[generate-outfits] outfit not an object')
      return null
    }
    const name = typeof o.name === 'string' ? o.name.trim() : ''
    const description = typeof o.description === 'string' ? o.description.trim() : ''
    let vibe = typeof o.vibe === 'string' ? o.vibe.trim().toUpperCase() : ''
    if (!ALLOWED_VIBES.has(vibe)) vibe = 'EFFORTLESS'

    const styleMatchScore = (typeof o.styleMatchScore === 'number' && o.styleMatchScore >= 70 && o.styleMatchScore <= 100)
      ? Math.round(o.styleMatchScore)
      : 87

    if (!Array.isArray(o.items) || o.items.length < 1) {
      console.log('[generate-outfits] outfit missing items array')
      return null
    }

    // Map names → UUIDs (case-insensitive).
    const itemIds: string[] = []
    for (const rawName of o.items) {
      if (typeof rawName !== 'string') {
        console.log('[generate-outfits] item entry not a string')
        return null
      }
      const key = rawName.split('|')[0].trim().toLowerCase()
      const id = nameToId.get(key)
      if (!id) {
        console.log('[generate-outfits] could not map name to UUID:', rawName)
        return null
      }
      itemIds.push(id)
    }

    // Pinned item must appear in every outfit.
    if (pinned && !itemIds.includes(pinned.id)) {
      console.log('[generate-outfits] outfit missing pinned item:', pinned.name)
      return null
    }

    if (!name || !description) {
      console.log('[generate-outfits] outfit missing name or description')
      return null
    }

    mapped.push({
      id: crypto.randomUUID(),
      vibe,
      name,
      description,
      items: itemIds,
      styleMatchScore,
    })
  }

  return mapped
}

// Build the 3 stub outfits — used when AI fails or returns invalid data.
// Same composition logic from Session 7b-1, kept verbatim as the silent fallback.
function buildStubOutfits(items: Item[], pinned: Item | null) {
  const hasDress = items.some(i => i.category === 'Dresses')
  const hasLightOuterwear = items.some(i => i.category === 'Outerwear' && LIGHT_OUTERWEAR.test(i.name))

  const layout1 = ['Tops', 'Bottoms', 'Shoes']
  const layout2 = hasDress ? ['Dresses', 'Shoes'] : ['Tops', 'Bottoms', 'Shoes']
  const layout3 = hasLightOuterwear ? ['Tops', 'Bottoms', 'LightOuterwear'] : ['Tops', 'Bottoms', 'Shoes']

  const buildOutfit = (layout: string[]): string[] => {
    const used = new Set<string>()
    const ids: string[] = []

    if (pinned) {
      ids.push(pinned.id)
      used.add(pinned.id)
    }

    for (const cat of layout) {
      if (pinned && pinned.category === cat) continue

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

  return [
    { id: crypto.randomUUID(), ...STUB_LOOKS[0], items: buildOutfit(layout1), styleMatchScore: 87 },
    { id: crypto.randomUUID(), ...STUB_LOOKS[1], items: buildOutfit(layout2), styleMatchScore: 87 },
    { id: crypto.randomUUID(), ...STUB_LOOKS[2], items: buildOutfit(layout3), styleMatchScore: 87 },
  ]
}

// Smart fallback (Session 7C) — used when Anthropic fails (timeout / 5xx / 429 / malformed JSON).
// Returns 3 outfits with editorial-occasion names and color-aware composition.
// Reuses existing pickRandom, LIGHT_OUTERWEAR regex, and Item type.
// If this function itself throws, the handler reverts to buildStubOutfits as last resort.
function buildSmartFallback(
  items: Item[],
  pinned: Item | null,
  occasion: string,
): Array<{ id: string; vibe: string; name: string; description: string; items: string[]; styleMatchScore: number }> {
  // Color-family classifier — matches against name + colour fields.
  function colorFamily(item: Item): 'neutral' | 'earth' | 'navy' | 'other' {
    const haystack = (item.name + ' ' + (item.colour || '')).toLowerCase()
    if (COLOR_NEUTRAL.test(haystack)) return 'neutral'
    if (COLOR_EARTH.test(haystack))   return 'earth'
    if (COLOR_NAVY.test(haystack))    return 'navy'
    return 'other'
  }

  // Two items pair well if: either is unknown ('other'), either is neutral,
  // same family, OR mixed-family combo isn't a known clash (navy+earth).
  function colorsCompatible(a: Item, b: Item): boolean {
    const fa = colorFamily(a)
    const fb = colorFamily(b)
    if (fa === 'other' || fb === 'other') return true
    if (fa === 'neutral' || fb === 'neutral') return true
    if (fa === fb) return true
    if ((fa === 'navy' && fb === 'earth') || (fa === 'earth' && fb === 'navy')) return false
    return true
  }

  // Pick the best item in a category, preferring color-compatibility with already-chosen items.
  // Falls back to any in-category item rather than fail.
  function pickCompatible(category: string, used: Set<string>, chosenSoFar: Item[]): Item | null {
    const candidates = items.filter(i => i.category === category && !used.has(i.id))
    if (!candidates.length) {
      const anyInCategory = items.filter(i => i.category === category)
      return pickRandom(anyInCategory)
    }
    const compatible = candidates.filter(c => chosenSoFar.every(m => colorsCompatible(c, m)))
    return pickRandom(compatible.length ? compatible : candidates)
  }

  // Build one outfit given a slot layout. Pinned item fills its own slot if relevant,
  // and is always included regardless.
  function buildOne(layout: string[]): Item[] {
    const used = new Set<string>()
    const chosen: Item[] = []

    if (pinned) {
      chosen.push(pinned)
      used.add(pinned.id)
    }

    for (const slot of layout) {
      if (pinned) {
        if (slot === pinned.category) continue
        if (slot === 'LightOuterwear' && pinned.category === 'Outerwear') continue
      }

      let item: Item | null = null
      if (slot === 'LightOuterwear') {
        const lightCands = items.filter(i =>
          i.category === 'Outerwear' && LIGHT_OUTERWEAR.test(i.name) && !used.has(i.id)
        )
        const compatible = lightCands.filter(c => chosen.every(m => colorsCompatible(c, m)))
        item = pickRandom(compatible.length ? compatible : lightCands)
      } else {
        item = pickCompatible(slot, used, chosen)
      }

      if (item) {
        chosen.push(item)
        used.add(item.id)
      }
    }

    return chosen
  }

  // Pick layouts based on what the wardrobe supports and what (if anything) is pinned.
  const hasTops = items.some(i => i.category === 'Tops')
  const hasBottoms = items.some(i => i.category === 'Bottoms')
  const hasDress = items.some(i => i.category === 'Dresses')
  const hasLightOuterwear = items.some(i => i.category === 'Outerwear' && LIGHT_OUTERWEAR.test(i.name))
  const tbViable = hasTops && hasBottoms

  let layouts: string[][]
  if (pinned?.category === 'Dresses') {
    layouts = [['Dresses', 'Shoes'], ['Dresses', 'Shoes', 'LightOuterwear'], ['Dresses', 'Shoes']]
  } else if (pinned?.category === 'Outerwear') {
    const base = tbViable ? ['Outerwear', 'Tops', 'Bottoms', 'Shoes'] : ['Outerwear', 'Dresses', 'Shoes']
    const alt  = hasDress  ? ['Outerwear', 'Dresses', 'Shoes']        : base
    layouts = [base, alt, base]
  } else if (tbViable && hasDress) {
    layouts = [
      ['Tops', 'Bottoms', 'Shoes'],
      ['Dresses', 'Shoes'],
      hasLightOuterwear ? ['Tops', 'Bottoms', 'LightOuterwear'] : ['Tops', 'Bottoms', 'Shoes'],
    ]
  } else if (tbViable) {
    layouts = [
      ['Tops', 'Bottoms', 'Shoes'],
      ['Tops', 'Bottoms', 'Shoes'],
      hasLightOuterwear ? ['Tops', 'Bottoms', 'LightOuterwear'] : ['Tops', 'Bottoms', 'Shoes'],
    ]
  } else {
    // Dress-only wardrobe (essentials gate already passed)
    layouts = [
      ['Dresses', 'Shoes'],
      ['Dresses', 'Shoes'],
      hasLightOuterwear ? ['Dresses', 'LightOuterwear'] : ['Dresses', 'Shoes'],
    ]
  }

  const outfitItems = [buildOne(layouts[0]), buildOne(layouts[1]), buildOne(layouts[2])]

  // Names — 3 distinct, randomly picked from occasion pool. Unknown occasion → Casual Day pool.
  // Pad with " II" suffix if pool has fewer than 3 entries (shouldn't happen with current pools).
  const namePool = FALLBACK_NAMES_BY_OCCASION[occasion] || FALLBACK_NAMES_BY_OCCASION['Casual Day']
  const shuffled = [...namePool].sort(() => Math.random() - 0.5).slice(0, 3)
  while (shuffled.length < 3) shuffled.push((shuffled[shuffled.length - 1] || 'Easy Sunday') + ' II')

  // Vibes — may repeat across outfits; pools are smaller and vibes feel less unique than names.
  const vibePool = FALLBACK_VIBES_BY_OCCASION[occasion] || FALLBACK_VIBES_BY_OCCASION['Casual Day']

  // Describe an outfit as "[colour first-word] with [colour first-word] — mood."
  // Falls back to item.name when colour is missing.
  function describeItem(item: Item): string {
    const colour = (item.colour || '').trim()
    const firstWord = (item.name || '').split(/\s+/)[0] || 'piece'
    if (colour) return `${colour.toLowerCase()} ${firstWord.toLowerCase()}`
    return (item.name || 'piece').toLowerCase()
  }
  function capitalize(s: string): string {
    return s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s
  }
  function describe(arr: Item[]): string {
    const mood = pickRandom(DESCRIPTION_MOODS) || 'effortless'
    if (arr.length === 0) return 'A look pulled together from your wardrobe.'
    if (arr.length === 1) return `${capitalize(describeItem(arr[0]))} — ${mood}.`
    return `${capitalize(describeItem(arr[0]))} with ${describeItem(arr[1])} — ${mood}.`
  }

  return [0, 1, 2].map(i => ({
    id: crypto.randomUUID(),
    vibe: pickRandom(vibePool) || 'EFFORTLESS',
    name: shuffled[i],
    description: describe(outfitItems[i]),
    items: outfitItems[i].map(it => it.id),
    styleMatchScore: 85,
  }))
}

// Stub for Session 9 — outfit potential calculation. Currently inert (no callers).
// Real formula lands in Session 9 alongside ratings/learning_notes tables.
function computeOutfitPotential(_outfitItems: Item[], _fullWardrobe: Item[]): number {
  return 12
}

// Apply weather and indoor safety filters to the wardrobe pool before Sonnet sees it.
// Pinned item is always exempt. If filters reduce the pool below the essentials gate,
// revert to the unfiltered pool (gates 4/5/6 already passed it — it's known viable).
// Filters are additive; this function expands as Session 7b-5 lands C1→C5.
function applySafetyFilters(args: {
  items: Item[]
  temperature: string
  condition: string
  occasion: string
  indoors: boolean
  pinnedItemId: string | null
  neverWear: string | null
}): Item[] {
  const { items, temperature, condition, occasion, indoors, pinnedItemId, neverWear } = args
  let filtered = [...items]

  // C1 — Cold: drop Light/None warmth from Tops and Dresses (unless pinned).
  // Skipped when Indoor toggle is ON — climate is silent on the indoor path.
  if (!indoors && temperature === 'Cold') {
    const before = filtered.length
    filtered = filtered.filter(i => {
      if (i.id === pinnedItemId) return true
      if (i.category !== 'Tops' && i.category !== 'Dresses') return true
      if (i.warmth === 'Light' || i.warmth === 'None') return false
      return true
    })
    if (filtered.length !== before) {
      console.log(`[generate-outfits] C1 Cold filter dropped ${before - filtered.length} Light/None Tops or Dresses`)
    }
  }

  // Cool/Cold — drop open-toe and exposed-foot shoes by name pattern (unless pinned).
  // Footwear-only — sleeveless tops are unaffected (they can go under layers).
  // Skipped when Indoor toggle is ON — climate is silent on the indoor path.
  if (!indoors && (temperature === 'Cool' || temperature === 'Cold')) {
    const before = filtered.length
    filtered = filtered.filter(i => {
      if (i.id === pinnedItemId) return true
      if (i.category !== 'Shoes') return true
      if (OPEN_FOOTWEAR.test(i.name || '')) return false
      return true
    })
    if (filtered.length !== before) {
      console.log(`[generate-outfits] Cool/Cold name-pattern filter dropped ${before - filtered.length} open-footwear items`)
    }
  }

  // C2 — Hot: drop Heavy warmth from all categories (unless pinned).
  // Skipped when Indoor toggle is ON — climate is silent on the indoor path.
  if (!indoors && temperature === 'Hot') {
    const before = filtered.length
    filtered = filtered.filter(i => {
      if (i.id === pinnedItemId) return true
      if (i.warmth === 'Heavy') return false
      return true
    })
    if (filtered.length !== before) {
      console.log(`[generate-outfits] C2 Hot filter dropped ${before - filtered.length} Heavy items`)
    }
  }

  // Hot/Warm — drop heavy outerwear by name pattern (unless pinned).
  // Name-pattern based, active today regardless of warmth column.
  // Companion to C2 which is warmth-column based (dormant until warmth UI lands).
  // Skipped when Indoor toggle is ON — climate is silent on the indoor path.
  if (!indoors && (temperature === 'Hot' || temperature === 'Warm')) {
    const before = filtered.length
    filtered = filtered.filter(i => {
      if (i.id === pinnedItemId) return true
      if (i.category !== 'Outerwear') return true
      if (HEAVY_OUTERWEAR.test(i.name || '')) return false
      return true
    })
    if (filtered.length !== before) {
      console.log(`[generate-outfits] Hot/Warm name-pattern filter dropped ${before - filtered.length} heavy outerwear items`)
    }
  }

  // C3 — Rainy: drop suede items and open-toe shoes (unless pinned).
  // Detection by name pattern (case-insensitive). Suede applies across all categories
  // because suede bags/jackets/skirts also get ruined in rain.
  // Skipped when Indoor toggle is ON — climate is silent on the indoor path.
  if (!indoors && condition === 'Rainy') {
    const before = filtered.length
    filtered = filtered.filter(i => {
      if (i.id === pinnedItemId) return true
      const n = (i.name || '').toLowerCase()
      if (n.includes('suede')) return false
      if (n.includes('sandal') || n.includes('open-toe') || n.includes('mule')) return false
      return true
    })
    if (filtered.length !== before) {
      console.log(`[generate-outfits] C3 Rainy filter dropped ${before - filtered.length} suede or open-toe items`)
    }
  }

  // C4 — Snowy: drop suede, espadrille, exposed-foot shoes, and heels (unless pinned).
  // Snow is the one weather where heels are filtered — slip risk + salt damage are
  // safety/destruction concerns, not taste. Word-boundary regex on heel/pump avoids
  // false positives like "wheel" or "pumpkin".
  // Skipped when Indoor toggle is ON — climate is silent on the indoor path.
  if (!indoors && condition === 'Snowy') {
    const before = filtered.length
    filtered = filtered.filter(i => {
      if (i.id === pinnedItemId) return true
      const n = (i.name || '').toLowerCase()
      // Destruction risk
      if (n.includes('suede')) return false
      if (n.includes('espadrille')) return false
      // Exposed-foot shoes
      if (n.includes('sandal')) return false
      if (n.includes('open-toe')) return false
      if (n.includes('flip-flop')) return false
      // Heels — slippery on ice, salt damage
      if (/\bheels?\b/.test(n)) return false
      if (/\bpumps?\b/.test(n)) return false
      if (n.includes('stiletto')) return false
      return true
    })
    if (filtered.length !== before) {
      console.log(`[generate-outfits] C4 Snowy filter dropped ${before - filtered.length} unsafe-for-snow items`)
    }
  }

  // C5 — Indoor: drop Heavy Outerwear when user toggles "I'll be indoors" (unless pinned).
  // Light/Medium outerwear (blazers, cardigans) stays — they're aesthetic layers, not thermal.
  // Currently dormant — warmth is NULL on all items until the warmth UI session lands.
  if (indoors === true) {
    const before = filtered.length
    filtered = filtered.filter(i => {
      if (i.id === pinnedItemId) return true
      if (i.category === 'Outerwear' && i.warmth === 'Heavy') return false
      return true
    })
    if (filtered.length !== before) {
      console.log(`[generate-outfits] C5 Indoor filter dropped ${before - filtered.length} Heavy Outerwear items`)
    }
  }

  // Indoor — drop heavy outerwear by name pattern when "I'll be indoors" toggle is ON (unless pinned).
  // Active today. Sits alongside the dormant warmth-based C5 above — both fire independently.
  // Fires regardless of temperature: Indoor ON at any temp drops parkas, puffers, winter coats.
  // Light outerwear (blazers, cardigans, vests, denim jackets) stays — they're occasion layers.
  if (indoors === true) {
    const before = filtered.length
    filtered = filtered.filter(i => {
      if (i.id === pinnedItemId) return true
      if (i.category !== 'Outerwear') return true
      if (HEAVY_OUTERWEAR.test(i.name || '')) return false
      return true
    })
    if (filtered.length !== before) {
      console.log(`[generate-outfits] Indoor name-pattern filter dropped ${before - filtered.length} heavy outerwear items`)
    }
  }

  // Occasion — drop heels for active/on-foot occasions (unless pinned).
  // Per CLAUDE.md AI COMPONENT: heels stay allowed for Casual Day (Sonnet decides via Brief),
  // Work · Office, Going Out, Formal Event. Filtered only for Outdoor · Sport, Weekend
  // Errands, Travel — where she's moving on foot all day.
  if (occasion === 'Outdoor · Sport' || occasion === 'Weekend Errands' || occasion === 'Travel') {
    const before = filtered.length
    filtered = filtered.filter(i => {
      if (i.id === pinnedItemId) return true
      if (i.category !== 'Shoes') return true
      if (HEEL_PATTERN.test(i.name || '')) return false
      return true
    })
    if (filtered.length !== before) {
      console.log(`[generate-outfits] Occasion heels filter dropped ${before - filtered.length} heeled shoes`)
    }
  }

  // Occasion — drop sneakers for Formal Event (unless pinned).
  // Per CLAUDE.md AI COMPONENT: sneakers stay allowed for Going Out (Sonnet decides via Brief)
  // and all casual occasions. Formal Event is the hard line.
  if (occasion === 'Formal Event') {
    const before = filtered.length
    filtered = filtered.filter(i => {
      if (i.id === pinnedItemId) return true
      if (i.category !== 'Shoes') return true
      if (SNEAKER_PATTERN.test(i.name || '')) return false
      return true
    })
    if (filtered.length !== before) {
      console.log(`[generate-outfits] Occasion sneakers filter dropped ${before - filtered.length} sneakers`)
    }
  }

  // Occasion — drop open footwear for Outdoor · Sport (unless pinned).
  // Safety/practicality: this occasion means moving on foot, often on rough terrain.
  // Slides, sandals, flip-flops are wrong regardless of temperature.
  if (occasion === 'Outdoor · Sport') {
    const before = filtered.length
    filtered = filtered.filter(i => {
      if (i.id === pinnedItemId) return true
      if (i.category !== 'Shoes') return true
      if (OPEN_FOOTWEAR.test(i.name || '')) return false
      return true
    })
    if (filtered.length !== before) {
      console.log(`[generate-outfits] Outdoor · Sport open-footwear filter dropped ${before - filtered.length} items`)
    }
  }

  // Occasion — drop fancy/delicate dresses for Outdoor · Sport (unless pinned).
  // Parallel to Step 5b open-footwear: practical-safety filter for the
  // "moving on foot, rough conditions" occasion. Cotton/linen casual dresses
  // unaffected — Sonnet still picks them based on Brief and judgment.
  if (occasion === 'Outdoor · Sport') {
    const before = filtered.length
    filtered = filtered.filter(i => {
      if (i.id === pinnedItemId) return true
      if (i.category !== 'Dresses') return true
      if (FANCY_DRESS_PATTERN.test(i.name || '')) return false
      return true
    })
    if (filtered.length !== before) {
      console.log(`[generate-outfits] Outdoor · Sport fancy-dress filter dropped ${before - filtered.length} dresses`)
    }
  }

  // Occasion — drop skirts for Outdoor · Sport (unless pinned).
  // Parallel to FANCY_DRESS_PATTERN: practical-safety filter for the
  // "moving on foot, rough conditions" occasion. Substring match catches
  // "skirt", "mini skirt", "miniskirt", "maxi skirt", "pencil skirt".
  if (occasion === 'Outdoor · Sport') {
    const before = filtered.length
    filtered = filtered.filter(i => {
      if (i.id === pinnedItemId) return true
      if (i.category !== 'Bottoms') return true
      if (SKIRT_PATTERN.test(i.name || '')) return false
      return true
    })
    if (filtered.length !== before) {
      console.log(`[generate-outfits] Outdoor · Sport skirt filter dropped ${before - filtered.length} bottoms`)
    }
  }

  // Dislikes — drop items whose name or colour matches user's "I never want to wear" text.
  // Tokenized: split on commas/semicolons, lowercase, trim, drop empties, drop stopwords,
  // minimum token length 4 to avoid false positives like "tan" matching "tank top" or
  // "red" matching "adidas". Match on name + colour only — notes is free-form text and
  // would over-filter. Pinned item is exempt (user pinned it deliberately, overrides dislikes).
  if (typeof neverWear === 'string' && neverWear.trim()) {
    const STOPWORDS = new Set(['anything', 'the', 'a', 'an', 'no', 'hate', 'nothing', 'with'])
    const tokens = neverWear
      .toLowerCase()
      .split(/[,;]/)
      .map(t => t.trim())
      .filter(t => t.length >= 4 && !STOPWORDS.has(t))

    if (tokens.length > 0) {
      const before = filtered.length
      filtered = filtered.filter(i => {
        if (i.id === pinnedItemId) return true
        const name = (i.name || '').toLowerCase()
        const colour = (i.colour || '').toLowerCase()
        for (const token of tokens) {
          if (name.includes(token) || colour.includes(token)) return false
        }
        return true
      })
      if (filtered.length !== before) {
        console.log(`[generate-outfits] dislikes filter dropped ${before - filtered.length} items (tokens: ${tokens.join(', ')})`)
      }
    }
  }

  // Soft-fail safety net — if filters break the essentials gate, revert to unfiltered.
  const hasTops    = filtered.some(i => i.category === 'Tops')
  const hasBottoms = filtered.some(i => i.category === 'Bottoms')
  const hasDress   = filtered.some(i => i.category === 'Dresses')
  if (!((hasTops && hasBottoms) || hasDress)) {
    console.log('[generate-outfits] Filters broke essentials gate — reverting to unfiltered pool')
    return items
  }

  return filtered
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
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')

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

    // 9F-B: Circuit-breaker counter — read from user_metadata (free, already did getUser).
    // Client increments on all-Nope sessions and resets to 0 on any Love/Like.
    const consecutiveNegativeSessions =
      typeof user.user_metadata?.consecutive_negative_sessions === 'number'
        ? user.user_metadata.consecutive_negative_sessions
        : 0
    const recoveryMode = consecutiveNegativeSessions >= 2
    console.log('[generate-outfits] circuit breaker:', { consecutiveNegativeSessions, recoveryMode })

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
    const currentOutfits = Array.isArray(body.currentOutfits)
      ? body.currentOutfits.filter((o: any) =>
          o && typeof o === 'object'
          && typeof o.name === 'string'
          && typeof o.vibe === 'string'
          && Array.isArray(o.itemIds)
        )
      : []

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
      .select('id, name, category, colour, warmth, notes, created_at, exclude_from_styling')
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
        notes: r.notes ?? null,
        createdAt: r.created_at ?? null,
      }))

    console.log('[generate-outfits] styleable items:', items.length)

    // 9F-D: Recent outfit history — last 6 outfits (≈ last 2 sessions of 3) as don't-repeat hint.
    // Lazy persistence (Session 9A) means outfit_history only contains outfits she actually
    // interacted with (rated/saved/worn). New users start with empty history — no harm.
    // Item names resolved here against the UNFILTERED wardrobe pool so filtered-out items
    // still show by name in the history block. Errors silently swallowed — failure must not
    // block generation.
    const { data: historyRows } = await userClient
      .from('outfit_history')
      .select('name, vibe, item_ids')
      .order('created_at', { ascending: false })
      .limit(6)
    const wardrobeNameById = new Map(items.map(i => [i.id, i.name]))
    const recentOutfits = (historyRows || []).map(r => {
      const ids = Array.isArray(r.item_ids) ? r.item_ids : []
      const itemNames = ids
        .map(id => wardrobeNameById.get(id))
        .filter((n): n is string => Boolean(n))
        .slice(0, 4)
      return { name: r.name || '', vibe: r.vibe || '', itemNames }
    })
    console.log('[generate-outfits] recent outfit history:', recentOutfits.length, 'rows')

    // Just-shown outfits (sent from client on regenerate). Names resolved against
    // the same wardrobeNameById Map as recent history — no extra DB query.
    const resolvedCurrentOutfits = currentOutfits.map((o: any) => {
      const itemNames = (o.itemIds as unknown[])
        .map((id) => typeof id === 'string' ? wardrobeNameById.get(id) : undefined)
        .filter((n): n is string => Boolean(n))
        .slice(0, 4)
      return { name: o.name, vibe: o.vibe, itemNames }
    })
    console.log('[generate-outfits] just-shown outfits:', resolvedCurrentOutfits.length, 'rows')

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

    // Session 16A — VIP check + 7-day session count.
    // Two parallel queries via Promise.all. Both queries scoped by RLS to the user's own data.
    // sessionsUsedThisWeek is the count BEFORE today's pending generation — Substep 2 adds +1
    // after the successful INSERT lands in session_log.
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const userEmail = user.email || ''
    const [vipResult, countResult] = await Promise.all([
      userEmail
        ? userClient.from('vip_emails').select('email').eq('email', userEmail).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      userClient
        .from('session_log')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),
    ])
    if (vipResult.error) {
      console.warn('[generate-outfits] VIP check failed:', vipResult.error.message)
    }
    if (countResult.error) {
      console.warn('[generate-outfits] session count failed:', countResult.error.message)
    }
    const isVip = !!vipResult.data
    const sessionsUsedThisWeek = countResult.count ?? 0
    console.log('[generate-outfits] session check:', { isVip, sessionsUsedThisWeek })

    // Gate 7 (Session 16A) — weekly session limit. VIPs bypass entirely.
    // 400 with session_limit_reached code. App.js Session 16B will map this to a warm
    // Clozie message in Your Looks tab. Until 16B lands, client falls back to generic copy.
    if (!isVip && sessionsUsedThisWeek >= 12) {
      console.log('[generate-outfits] session_limit_reached — blocked', { sessionsUsedThisWeek })
      return jsonResponse({
        error: 'session_limit_reached',
        message: "You've used all 12 styling sessions this week. Your earliest session refreshes soon.",
      }, 400)
    }

    // 6.5. Apply weather/indoor safety filters before Sonnet sees the pool.
    // Pinned item is exempt. Soft-fail reverts to unfiltered if filters break essentials.
    const filteredItems = applySafetyFilters({ items, temperature, condition, occasion, indoors, pinnedItemId, neverWear: styleProfile?.neverWear ?? null })
    console.log('[generate-outfits] pool size after filters:', filteredItems.length, 'of', items.length)

    // 7. Try Anthropic. On any failure, fall back to stub silently.
    if (anthropicKey) {
      const userContent = buildFreshContent({
        styleProfile, temperature, condition, occasion, indoors, brief, pinned, items: filteredItems, recoveryMode, recentOutfits, currentOutfits: resolvedCurrentOutfits,
      })

      const aiResult = await callAnthropic({
        apiKey: anthropicKey,
        systemPrompt: SYSTEM_PROMPT,
        userContent,
      })

      if (aiResult) {
        const mapped = validateAndMapOutfits({ aiOutfits: aiResult.outfits, items, pinned })
        if (mapped) {
          // SESSION 17F STEP 4: Server-side structural validation (belt-and-suspenders
          // even though SYSTEM_PROMPT Rule 13 instructs Sonnet to enforce structure).
          // Check 1: every outfit must have at least one Top or Dress.
          // Check 3: dedupe Bottoms — keep pinned Bottom if any, else first encountered.
          // Check 2: trim Accessories if outfit has more than 6 items.
          const itemById = new Map(items.map(i => [i.id, i]))

          const malformedIndices: number[] = []
          for (let i = 0; i < mapped.length; i++) {
            const hasTopOrDress = mapped[i].items.some(id => {
              const item = itemById.get(id)
              return !!item && (item.category === 'Tops' || item.category === 'Dresses')
            })
            if (!hasTopOrDress) malformedIndices.push(i)
          }

          let allReplaced = false
          if (malformedIndices.length > 0) {
            try {
              const fallbackPool = filteredItems.length >= 5 ? filteredItems : items
              const replacements = buildSmartFallback(fallbackPool, pinned, occasion)
              for (const idx of malformedIndices) {
                mapped[idx] = replacements[idx]
                console.log(`[generate-outfits] structural fix: replaced outfit ${idx} (missing Top/Dress)`)
              }
              allReplaced = malformedIndices.length === mapped.length
            } catch (e) {
              console.warn('[generate-outfits] structural fix: smart fallback threw, leaving outfits as-is:', (e as Error).message)
            }
          }

          // Check 3: dedupe Bottoms — Sonnet has historically slipped in two Bottoms
          // (e.g. jeans + skirt) despite Rule 13. Keep the pinned Bottom if it's among
          // them (preserves pinned-item contract from validateAndMapOutfits line 714);
          // otherwise keep the first encountered. Remove the rest.
          for (let i = 0; i < mapped.length; i++) {
            const bottomIds = mapped[i].items.filter(id => {
              const item = itemById.get(id)
              return !!item && item.category === 'Bottoms'
            })
            if (bottomIds.length > 1) {
              const keepId = (pinned && bottomIds.includes(pinned.id)) ? pinned.id : bottomIds[0]
              const toRemove = new Set(bottomIds.filter(id => id !== keepId))
              mapped[i].items = mapped[i].items.filter(id => !toRemove.has(id))
              console.log(`[generate-outfits] structural fix: removed duplicate Bottom from outfit ${i}`)
            }
          }

          for (let i = 0; i < mapped.length; i++) {
            if (mapped[i].items.length > 6) {
              const beforeCount = mapped[i].items.length
              const nonAcc = mapped[i].items.filter(id => {
                const item = itemById.get(id)
                return !item || item.category !== 'Accessories'
              })
              const acc = mapped[i].items.filter(id => {
                const item = itemById.get(id)
                return !!item && item.category === 'Accessories'
              })
              const accBudget = Math.max(0, 6 - nonAcc.length)
              const trimmed = [...nonAcc, ...acc.slice(0, accBudget)]
              if (trimmed.length >= 1) {
                mapped[i].items = trimmed
                console.log(`[generate-outfits] structural fix: trimmed outfit ${i} from ${beforeCount} to ${trimmed.length} items`)
              }
            }
          }

          const finalSource = allReplaced ? 'fallback' : 'sonnet'
          console.log(`[generate-outfits] success — ${finalSource}, 3 outfits returned`)
          try {
            const { error: logErr } = await userClient.from('session_log').insert({ user_id: user.id })
            if (logErr) {
              console.warn('[generate-outfits] session_log insert failed:', logErr.message)
            }
          } catch (e) {
            console.warn('[generate-outfits] session_log insert threw:', (e as Error).message)
          }
          return jsonResponse({ outfits: mapped, source: finalSource, recoveryMode, sessionsUsedThisWeek: sessionsUsedThisWeek + 1, isVip }, 200)
        }
      }
      console.log('[generate-outfits] AI path failed — falling back')
    } else {
      console.log('[generate-outfits] no ANTHROPIC_API_KEY set — falling back')
    }

    // 8. SMART fallback (Session 7C) — uses filteredItems (safety filters already applied).
    //    If filtered pool went thin, revert to unfiltered items (essentials gate already passed those).
    //    If buildSmartFallback itself throws (any internal error), last-resort to buildStubOutfits.
    try {
      const fallbackPool = filteredItems.length >= 5 ? filteredItems : items
      const outfits = buildSmartFallback(fallbackPool, pinned, occasion)
      console.log('[generate-outfits] success — fallback, 3 outfits returned')
      try {
        const { error: logErr } = await userClient.from('session_log').insert({ user_id: user.id })
        if (logErr) {
          console.warn('[generate-outfits] session_log insert failed:', logErr.message)
        }
      } catch (e) {
        console.warn('[generate-outfits] session_log insert threw:', (e as Error).message)
      }
      return jsonResponse({ outfits, source: 'fallback', recoveryMode, sessionsUsedThisWeek: sessionsUsedThisWeek + 1, isVip }, 200)
    } catch (e) {
      console.log('[generate-outfits] smart fallback threw — last-resort stub:', (e as Error).message)
      const outfits = buildStubOutfits(items, pinned)
      console.log('[generate-outfits] success — stub, 3 outfits returned')
      try {
        const { error: logErr } = await userClient.from('session_log').insert({ user_id: user.id })
        if (logErr) {
          console.warn('[generate-outfits] session_log insert failed:', logErr.message)
        }
      } catch (innerErr) {
        console.warn('[generate-outfits] session_log insert threw:', (innerErr as Error).message)
      }
      return jsonResponse({ outfits, source: 'stub', recoveryMode, sessionsUsedThisWeek: sessionsUsedThisWeek + 1, isVip }, 200)
    }
  } catch (e) {
    console.error('[generate-outfits] unexpected error:', (e as Error).message)
    return jsonResponse({ error: (e as Error).message }, 500)
  }
})
