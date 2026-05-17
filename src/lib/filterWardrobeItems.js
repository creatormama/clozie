// Shared filter utility for wardrobe items.
// Used by My Closet search (Session 10B) and Pin Selector bottom sheet (Session 11).
// Pure synchronous function — no Supabase, no side effects, no async.

export function filterWardrobeItems(items, searchText, category) {
  if (!Array.isArray(items)) return [];

  const query = typeof searchText === 'string' ? searchText.trim().toLowerCase() : '';
  const cat = typeof category === 'string' ? category : 'All';

  return items.filter((item) => {
    if (!item) return false;

    if (cat !== 'All' && item.category !== cat) return false;

    if (query) {
      const name = typeof item.name === 'string' ? item.name.toLowerCase() : '';
      const colour = typeof item.colour === 'string' ? item.colour.toLowerCase() : '';
      if (!name.includes(query) && !colour.includes(query)) return false;
    }

    return true;
  });
}
