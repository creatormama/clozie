// Clozie Outfit Generation — sends Today's Vibe inputs to the Supabase Edge
// Function `generate-outfits`, which returns 3 outfits.
//
// Session 7b-2 (2026-05-09): client wiring on top of 7b-1's stub Edge Function.
// Session 7b-3 will swap the stub for a real Anthropic call — this client
// helper does not change between 7b-2 and 7b-3.
//
// Payload shape (all temperature/condition/occasion required by the function):
//   { temperature, condition, occasion, indoors, pinnedItemId, brief, styleProfile }
//
// Returns: { outfits: [...], source: 'stub' | 'sonnet' }
//   each outfit: { id, vibe, name, description, items: [item_id, ...], styleMatchScore }
//
// On non-2xx responses, throws an Error with `.code` and `.message` set so the
// caller can surface warm Clozie messages for the three known gates:
//   not_enough_items / missing_essentials / invalid_pin

import { supabase } from './supabase';

export async function generateOutfits(payload) {
  const { data, error } = await supabase.functions.invoke('generate-outfits', {
    body: payload,
  });

  if (error) {
    // supabase-js wraps non-2xx as FunctionsHttpError with `context` = Response.
    // Parse the body so we can surface gate codes (not_enough_items, etc).
    let code = null;
    let message = error.message || 'Unknown error';
    try {
      if (error.context && typeof error.context.json === 'function') {
        const body = await error.context.json();
        if (body && typeof body === 'object') {
          if (typeof body.error === 'string') code = body.error;
          if (typeof body.message === 'string') message = body.message;
        }
      }
    } catch {
      // Fall through with whatever we have.
    }
    const err = new Error(message);
    err.code = code;
    throw err;
  }

  if (!data || !Array.isArray(data.outfits)) {
    throw new Error('Missing outfits in Clozie response');
  }

  return data;
}
