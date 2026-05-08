// Clozie Photo Recognition — sends a wardrobe photo to Claude Sonnet
// and returns { name, category, color, description }.
//
// Session 6B note: API key lives in client (.env EXPO_PUBLIC_ANTHROPIC_KEY)
// for fast iteration. Session 7 moves this to a Supabase Edge Function
// alongside outfit generation — REMOVE client-side key before Phase 3.

import * as ImageManipulator from 'expo-image-manipulator';

const ALLOWED_CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'];

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
JSON only. No preamble.`;

// Catches the ~5% of cases where the model picks the wrong category despite naming the item correctly.
function correctCategoryFromName(name, category) {
  const n = (name || '').toLowerCase();
  if (/jacket|coat|blazer|cardigan/.test(n) && category !== 'Outerwear') return 'Outerwear';
  if (/jumpsuit|romper/.test(n) && category !== 'Dresses') return 'Dresses';
  if (/\b(bag|scarf|hat|belt|jewelry|jewellery)\b/.test(n) && category !== 'Accessories') return 'Accessories';
  return category;
}

export async function recognizeWardrobePhoto(localUri) {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_KEY;
  if (!apiKey) {
    const err = new Error('No Clozie key configured');
    err.code = 'NO_KEY';
    throw err;
  }

  // Re-encode the (already-512px) photo to base64 for the API call
  const { base64 } = await ImageManipulator.manipulateAsync(
    localUri,
    [],
    { format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  if (!base64) throw new Error('Could not read photo');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
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
                data: base64,
              },
            },
            { type: 'text', text: PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`API ${response.status}: ${errBody.slice(0, 200)}`);
  }

  const json = await response.json();
  const text = json?.content?.[0]?.text;
  if (!text) throw new Error('Empty response from Clozie');

  let parsed;
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    // Fallback: extract a JSON object if the model wrapped it in prose
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Could not parse Clozie response');
    parsed = JSON.parse(match[0]);
  }

  let { name, category, color, description } = parsed;
  if (!name || !category) throw new Error('Missing fields in Clozie response');

  if (!ALLOWED_CATEGORIES.includes(category)) category = 'Tops';
  category = correctCategoryFromName(name, category);

  return {
    name: String(name).trim(),
    category,
    color: color ? String(color).trim() : '',
    description: description ? String(description).trim() : '',
  };
}
