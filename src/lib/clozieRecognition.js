// Clozie Photo Recognition — sends a wardrobe photo to the Supabase Edge Function
// `recognize-photo`, which calls Claude Sonnet server-side.
//
// Session 7a (2026-05-08): migrated off direct Anthropic call. API key now lives
// only in Supabase Edge Function secrets — never in client code.

import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from './supabase';

export async function recognizeWardrobePhoto(localUri) {
  // Re-encode the (already-512px) photo to base64 for transport
  const { base64 } = await ImageManipulator.manipulateAsync(
    localUri,
    [],
    { format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );

  if (!base64) throw new Error('Could not read photo');

  const { data, error } = await supabase.functions.invoke('recognize-photo', {
    body: { imageBase64: base64 },
  });

  if (error) {
    // Supabase wraps non-2xx responses as FunctionsHttpError. Try to surface
    // the function's error body for clearer logging, but don't crash if absent.
    const detail = error?.context?.error || error?.message || 'Unknown error';
    throw new Error(`Recognition failed: ${detail}`);
  }

  if (!data || !data.name || !data.category) {
    throw new Error('Missing fields in Clozie response');
  }

  return {
    name: String(data.name).trim(),
    category: String(data.category).trim(),
    color: data.color ? String(data.color).trim() : '',
    description: data.description ? String(data.description).trim() : '',
  };
}
