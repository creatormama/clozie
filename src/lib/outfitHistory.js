// Helpers for persisting outfit interactions (ratings, save, wear) to Supabase.
// Single table `outfit_history` populated lazily on first interaction.
// Subsequent interactions on the same outfit UPSERT the existing row via
// (user_id, client_outfit_id) unique index.
//
// Errors are thrown so callers can show a warm Clozie message. The one
// exception is markItemsWorn — partial wear-log is better than nothing,
// so per-item failures are logged but don't throw.

import { supabase } from './supabase';

function itemsToIds(items) {
  return (Array.isArray(items) ? items : [])
    .map((i) => i?.id)
    .filter(Boolean);
}

// Identity fields are always written (same client_outfit_id always produces
// the same vibe/name/items so rewriting is safe).
// Context fields are written ONLY on INSERT — on UPDATE they're omitted so
// Supabase upsert preserves the existing DB values. Fixes Session 12 bug
// where context-less subsequent writes (e.g. unsave from a prior session
// where lastPayload was null) wiped occasion/temperature/etc. to NULL.
function buildSnapshot(outfit, context, isInsert) {
  const snapshot = {
    client_outfit_id: outfit.id,
    vibe: outfit.vibe || '',
    name: outfit.name || '',
    description: outfit.description || null,
    item_ids: itemsToIds(outfit.items),
    style_match_score: typeof outfit.styleMatchScore === 'number' ? outfit.styleMatchScore : null,
    source: outfit.source || null,
  };
  if (isInsert) {
    snapshot.occasion = context?.occasion || null;
    snapshot.temperature = context?.temperature || null;
    snapshot.condition = context?.condition || null;
    snapshot.indoors = context?.indoors === true;
    snapshot.brief = context?.brief || null;
    snapshot.pinned_item_id = context?.pinnedItemId || null;
  }
  return snapshot;
}

// Upsert one interaction onto an outfit_history row.
// patch is one of:
//   { rating: 'love' | 'like' | 'nope' }
//   { saved: true | false }
//   { appendWornDate: '<ISO timestamp>' }  // same-day dedupe applied
export async function upsertOutfitInteraction(outfit, context, patch) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not signed in');
  const user = session.user;
  if (!outfit?.id) throw new Error('Missing outfit id');

  const now = new Date().toISOString();

  // Session 13: single read at top drives both worn-date dedupe AND the
  // insert-vs-update decision for context-field preservation. Costs 1 extra
  // read per save/rate (worn-date already had this read). Trivial at this scale.
  const { data: existing, error: fetchErr } = await supabase
    .from('outfit_history')
    .select('worn_dates')
    .eq('user_id', user.id)
    .eq('client_outfit_id', outfit.id)
    .maybeSingle();
  if (fetchErr) throw fetchErr;
  const isInsert = existing === null;

  // worn-date append is read-modify-write so we can dedupe same-day taps.
  if (patch.appendWornDate) {
    const wornDates = Array.isArray(existing?.worn_dates) ? existing.worn_dates : [];
    const today = patch.appendWornDate.slice(0, 10); // 'YYYY-MM-DD'
    const alreadyLoggedToday = wornDates.some(
      (d) => typeof d === 'string' && d.slice(0, 10) === today
    );
    if (alreadyLoggedToday) return; // silent dedupe per Grace's spec

    const row = {
      user_id: user.id,
      ...buildSnapshot(outfit, context, isInsert),
      worn_dates: [...wornDates, patch.appendWornDate],
      updated_at: now,
    };
    const { error } = await supabase
      .from('outfit_history')
      .upsert(row, { onConflict: 'user_id,client_outfit_id' });
    if (error) throw error;
    return;
  }

  // rating + saved share the simple upsert path.
  const row = {
    user_id: user.id,
    ...buildSnapshot(outfit, context, isInsert),
    updated_at: now,
  };
  if (patch.rating !== undefined) {
    row.rating = patch.rating;
    row.rated_at = now;
  }
  if (patch.saved !== undefined) {
    row.saved = patch.saved === true;
    row.saved_at = patch.saved === true ? now : null;
  }
  const { error } = await supabase
    .from('outfit_history')
    .upsert(row, { onConflict: 'user_id,client_outfit_id' });
  if (error) throw error;
}

// Returns saved outfits (newest first). Used by Session 12 — written now
// so the helper surface is complete. Caller resolves itemIds against the
// current wardrobeItems state to get full WardrobeItem objects with photos.
export async function fetchSavedOutfits() {
  const { data, error } = await supabase
    .from('outfit_history')
    .select('*')
    .eq('saved', true)
    .order('saved_at', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data || []).map(rowToSavedOutfit);
}

function rowToSavedOutfit(row) {
  return {
    id: row.client_outfit_id,
    vibe: row.vibe,
    name: row.name,
    description: row.description ?? '',
    itemIds: Array.isArray(row.item_ids) ? row.item_ids : [],
    styleMatchScore: row.style_match_score,
    source: row.source,
    occasion: row.occasion,
    temperature: row.temperature,
    condition: row.condition,
    indoors: row.indoors === true,
    brief: row.brief,
    pinnedItemId: row.pinned_item_id,
    rating: row.rating,
    wornDates: Array.isArray(row.worn_dates) ? row.worn_dates : [],
    savedAt: row.saved_at,
    createdAt: row.created_at,
  };
}

// Bump last_worn + times_worn on each wardrobe item in an outfit.
// Best-effort: per-item failures are logged but don't throw, because a
// partial wear-log is better than failing the whole "I wore this today" flow.
// Read-modify-write per item because the Supabase JS SDK can't do
// `times_worn = times_worn + 1` inline.
export async function markItemsWorn(itemIds) {
  if (!Array.isArray(itemIds) || itemIds.length === 0) return;
  const now = new Date().toISOString();

  const { data: rows, error: fetchErr } = await supabase
    .from('wardrobe_items')
    .select('id, times_worn')
    .in('id', itemIds);
  if (fetchErr) throw fetchErr;

  await Promise.all(
    (rows || []).map(async (r) => {
      const next = (typeof r.times_worn === 'number' ? r.times_worn : 0) + 1;
      const { error } = await supabase
        .from('wardrobe_items')
        .update({ last_worn: now, times_worn: next })
        .eq('id', r.id);
      if (error) console.warn('[outfitHistory] mark worn failed for', r.id, error.message);
    })
  );
}

// Clear all Clozie-learned data for the current user.
// Three parallel writes:
//   1. Delete every outfit_history row (ratings + saved + worn_dates all live here)
//   2. Reset times_worn=0 + last_worn=null on every wardrobe_item (item-level wear history)
//   3. Delete every session_log row (resets the rolling 7-day session counter — clean slate)
// Wardrobe items themselves (photos/names/categories/colours), style profile,
// and ai_consent_given are deliberately NOT touched.
// Throws on any failure so the caller can show a warm Clozie error.
export async function clearClozieMemory() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not signed in');
  const user = session.user;

  const [historyResult, wardrobeResult, sessionResult] = await Promise.all([
    supabase
      .from('outfit_history')
      .delete()
      .eq('user_id', user.id),
    supabase
      .from('wardrobe_items')
      .update({ times_worn: 0, last_worn: null })
      .eq('user_id', user.id),
    supabase
      .from('session_log')
      .delete()
      .eq('user_id', user.id),
  ]);

  if (historyResult.error) throw historyResult.error;
  if (wardrobeResult.error) throw wardrobeResult.error;
  if (sessionResult.error) throw sessionResult.error;
}
