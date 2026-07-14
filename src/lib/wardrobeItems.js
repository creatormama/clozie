// Helpers for reading/writing wardrobe items + photos in Supabase.
// Photos live at {user_id}/{filename}.{jpg|png} in the wardrobe-photos bucket.
// Errors are thrown so callers can show a warm Clozie message.

import { supabase } from './supabase';

const BUCKET = 'wardrobe-photos';
const SIGNED_URL_TTL_SECONDS = 3600;

function rowToItem(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    colour: row.colour ?? '',
    notes: row.notes ?? '',
    warmth: row.warmth ?? null,
    photoPath: row.photo_path ?? null,
    lastWorn: row.last_worn ?? null,
    createdAt: row.created_at,
  };
}

export async function fetchWardrobeItems() {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(rowToItem);
}

// Derive the file extension + MIME type from the actual local file URI.
// PNG cutouts (transparent) upload as image/png; everything else (jpeg-white
// cutout or the plain-JPEG fallback) uploads as image/jpeg — matching Build 25.
function extAndTypeFromUri(uri) {
  const clean = String(uri || '').split('?')[0].split('#')[0];
  const dot = clean.lastIndexOf('.');
  const ext = dot >= 0 ? clean.slice(dot + 1).toLowerCase() : '';
  if (ext === 'png') return { ext: 'png', contentType: 'image/png' };
  return { ext: 'jpg', contentType: 'image/jpeg' };
}

export async function uploadWardrobePhoto(localUri, userId) {
  const { ext, contentType } = extAndTypeFromUri(localUri);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const path = `${userId}/${filename}`;
  const arrayBuffer = await fetch(localUri).then((r) => r.arrayBuffer());
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, { contentType, upsert: false });
  if (error) throw error;
  return path;
}

export async function getSignedPhotoUrl(photoPath) {
  if (!photoPath) return null;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(photoPath, SIGNED_URL_TTL_SECONDS);
  if (error) throw error;
  return data.signedUrl;
}

export async function insertWardrobeItem(itemData) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not signed in');
  const user = session.user;
  const row = {
    user_id: user.id,
    name: itemData.name,
    category: itemData.category,
    colour: itemData.colour || null,
    notes: itemData.notes || null,
    warmth: itemData.warmth || null,
    photo_path: itemData.photoPath || null,
  };
  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return rowToItem(data);
}

export async function updateWardrobeItem(id, itemData) {
  const patch = {
    name: itemData.name,
    category: itemData.category,
    colour: itemData.colour || null,
    notes: itemData.notes || null,
    warmth: itemData.warmth || null,
    photo_path: itemData.photoPath || null,
  };
  const { data, error } = await supabase
    .from('wardrobe_items')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return rowToItem(data);
}

export async function deleteWardrobePhoto(photoPath) {
  if (!photoPath) return;
  const { error } = await supabase.storage.from(BUCKET).remove([photoPath]);
  if (error) throw error;
}

export async function deleteWardrobeItem(id, photoPath) {
  if (photoPath) {
    try {
      await deleteWardrobePhoto(photoPath);
    } catch {
      // Photo already gone or Storage unreachable — proceed with row delete.
    }
  }
  const { error } = await supabase.from('wardrobe_items').delete().eq('id', id);
  if (error) throw error;
}
