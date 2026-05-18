// Shared filter utility for saved outfits (Session 12 — Saved Outfits + Search).
// Mirrors src/lib/filterWardrobeItems.js pattern. Pure synchronous function —
// no Supabase, no side effects, no async.
//
// AND filter:
//   - occasion match (or 'All')
//   - search query matches outfit.name OR any item.name OR any item.colour
//
// Search match is OR across name + colour (same approach as filterWardrobeItems
// after its mid-Session 10B fix). Description / vibe / brief / item.notes are
// deliberately excluded — free-form text would over-filter (same decision as
// Session 7b-7 dislikes filter + Session 7C smart fallback descriptions).

export function filterSavedOutfits(savedOutfits, searchText, occasion) {
  if (!Array.isArray(savedOutfits)) return [];

  const query = typeof searchText === 'string' ? searchText.trim().toLowerCase() : '';
  const occ = typeof occasion === 'string' ? occasion : 'All';

  return savedOutfits.filter((outfit) => {
    if (!outfit) return false;

    if (occ !== 'All' && outfit.occasion !== occ) return false;

    if (query) {
      const outfitName = typeof outfit.name === 'string' ? outfit.name.toLowerCase() : '';
      if (outfitName.includes(query)) return true;

      const items = Array.isArray(outfit.items) ? outfit.items : [];
      const anyItemMatches = items.some((item) => {
        if (!item) return false;
        const name = typeof item.name === 'string' ? item.name.toLowerCase() : '';
        const colour = typeof item.colour === 'string' ? item.colour.toLowerCase() : '';
        return name.includes(query) || colour.includes(query);
      });
      if (!anyItemMatches) return false;
    }

    return true;
  });
}
