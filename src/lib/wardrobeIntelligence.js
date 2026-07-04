// Pure JS wardrobe-intelligence helper for the free "Analyse My Wardrobe" feature.
// Returns structured observations matching the May 27 Pro spec — Pro (Update 2)
// swaps the observation source (Sonnet/Haiku) without changing this shape or the UI.
//
// Update 2 — Session 4: rewrite. Killed the "never zero" F1 fallback and all
// strength padding (depth / rich palette / tops / shoes). Zero observations is a
// valid outcome — the glance breakdown always shows in the UI instead. Added:
// glance breakdown, "forgot about" wear-history observation, dress-aware guard
// on the balance line, singular/plural helper. See CLAUDE.md CURRENT BUILD
// STATE and SESSION_NOTES.md Update 2 — Session 4.

const MIN_ITEMS = 5;
const WEAK_SIDE_MAX = 2;
const STRONG_SIDE_MIN = 5;
const DRESS_AWARE_GUARD = 3;
const FORGOT_ABOUT_MIN_WORN = 3;

const CATEGORY_ORDER = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories'];

const CATEGORY_LABELS = {
  Tops:        { one: 'top',             many: 'tops' },
  Bottoms:     { one: 'bottom',          many: 'bottoms' },
  Dresses:     { one: 'dress',           many: 'dresses' },
  Outerwear:   { one: 'outerwear piece', many: 'outerwear pieces' },
  Shoes:       { one: 'pair of shoes',   many: 'pairs of shoes' },
  Accessories: { one: 'accessory',       many: 'accessories' },
};

function labelFor(category, count) {
  const entry = CATEGORY_LABELS[category];
  if (!entry) return category.toLowerCase();
  return count === 1 ? entry.one : entry.many;
}

function makeObservation(type, title, body, count) {
  return { type, title, body, count, itemIds: null, actionable: false };
}

export function analyseWardrobe(items) {
  const source = 'javascript';

  if (!Array.isArray(items) || items.length < MIN_ITEMS) {
    return { observations: [], glance: [], wornCount: 0, unwornCount: 0, source };
  }

  const tops    = items.filter((i) => i?.category === 'Tops').length;
  const bottoms = items.filter((i) => i?.category === 'Bottoms').length;
  const dresses = items.filter((i) => i?.category === 'Dresses').length;

  // Wear history — item.lastWorn is null until "I wore this today" bumps it.
  const wornCount   = items.filter((i) => i?.lastWorn).length;
  const unwornCount = items.filter((i) => !i?.lastWorn).length;

  // Glance — real counts only, canonical order, categories with count > 0.
  const counts = {};
  for (const item of items) {
    const cat = item?.category;
    if (!cat) continue;
    counts[cat] = (counts[cat] || 0) + 1;
  }
  const glance = CATEGORY_ORDER
    .filter((cat) => counts[cat] > 0)
    .map((cat) => ({
      category: cat,
      count: counts[cat],
      label: labelFor(cat, counts[cat]),
    }));

  const observations = [];

  // Balance line — at most one. Ordered by severity: gap first (no way to
  // complete an outfit), then dress-aware imbalance. Dress-aware guard
  // suppresses top/bottom imbalance when the user builds outfits from dresses.
  if (bottoms === 0 && dresses === 0) {
    observations.push(
      makeObservation(
        'gap',
        'Ready for your first full looks',
        'A few bottoms — trousers, jeans, or a skirt — would unlock your first complete outfits with Clozie.',
        null,
      ),
    );
  } else if (dresses < DRESS_AWARE_GUARD) {
    if (tops >= STRONG_SIDE_MIN && bottoms <= WEAK_SIDE_MAX) {
      const weakClause = bottoms === 0 ? 'no bottoms yet' : `only ${bottoms} ${labelFor('Bottoms', bottoms)}`;
      observations.push(
        makeObservation(
          'imbalance',
          'Light on bottoms',
          `You've got ${tops} tops but ${weakClause} — a couple more bottoms would unlock a lot more combinations.`,
          tops,
        ),
      );
    } else if (bottoms >= STRONG_SIDE_MIN && tops <= WEAK_SIDE_MAX) {
      const weakClause = tops === 0 ? 'no tops yet' : `only ${tops} ${labelFor('Tops', tops)}`;
      observations.push(
        makeObservation(
          'imbalance',
          'Light on tops',
          `You've got ${bottoms} bottoms but ${weakClause} — a couple more tops would unlock a lot more combinations.`,
          bottoms,
        ),
      );
    }
  }

  // Forgot-about — fires at ANY closet size when there's real wear history
  // (>= 3 worn items) AND at least one unworn item. C and E are mutually
  // exclusive on wornCount; C and D are mutually exclusive on wornCount.
  if (wornCount >= FORGOT_ABOUT_MIN_WORN && unwornCount > 0) {
    const pieceLabel = unwornCount === 1 ? 'piece' : 'pieces';
    observations.push(
      makeObservation(
        'forgot',
        `${unwornCount} ${pieceLabel} you forgot about`,
        'Worth bringing back into rotation.',
        unwornCount,
      ),
    );
  }

  return { observations, glance, wornCount, unwornCount, source };
}
