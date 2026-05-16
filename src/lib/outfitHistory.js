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

// Snapshot fields written on every upsert. Same outfit + same client_outfit_id
// always produces identical snapshot values, so rewriting them is a no-op.
function buildSnapshot(outfit, context) {
  return {
    client_outfit_id: outfit.id,
    vibe: outfit.vibe || '',
    name: outfit.name || '',
    description: outfit.description || null,
    item_ids: itemsToIds(outfit.items),
    style_match_score: typeof outfit.styleMatchScore === 'number' ? outfit.styleMatchScore : null,
    source: outfit.source || null,
    occasion: context?.occasion || null,
    temperature: context?.temperature || null,
    condition: context?.condition || null,
    indoors: context?.indoors === true,
    brief: context?.brief || null,
    pinned_item_id: context?.pinnedItemId || null,
  };
}

// Upsert one interaction onto an outfit_history row.
// patch is one of:
//   { rating: 'love' | 'like' | 'nope' }
//   { saved: true | false }
//   { appendWornDate: '<ISO timestamp>' }  // same-day dedupe applied
export async function upsertOutfitInteraction(outfit, context, patch) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  if (!outfit?.id) throw new Error('Missing outfit id');

  const now = new Date().toISOString();

  // worn-date append is read-modify-write so we can dedupe same-day taps.
  if (patch.appendWornDate) {
    const { data: existing, error: fetchErr } = await supabase
      .from('outfit_history')
      .select('worn_dates')
      .eq('user_id', user.id)
      .eq('client_outfit_id', outfit.id)
      .maybeSingle();
    if (fetchErr) throw fetchErr;

    const wornDates = Array.isArray(existing?.worn_dates) ? existing.worn_dates : [];
    const today = patch.appendWornDate.slice(0, 10); // 'YYYY-MM-DD'
    const alreadyLoggedToday = wornDates.some(
      (d) => typeof d === 'string' && d.slice(0, 10) === today
    );
    if (alreadyLoggedToday) return; // silent dedupe per Grace's spec

    const row = {
      user_id: user.id,
      ...buildSnapshot(outfit, context),
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
    ...buildSnapshot(outfit, context),
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
