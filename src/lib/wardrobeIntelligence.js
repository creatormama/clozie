// Pure JS wardrobe-intelligence helper for the free "Analyse My Wardrobe" feature.
// Returns structured observations matching the May 27 Pro spec — Pro (Update 2)
// swaps the observation source (Sonnet/Haiku) without changing this shape or the UI.

const CANDIDATE_THRESHOLDS = {
  MIN_ITEMS: 5,
  RICH_PALETTE: 25,
  TOPS_COLLECTION: 8,
  SHOES_COVERED: 4,
  DEPTH_TOPS: 5,
  DEPTH_BOTTOMS: 3,
  DEPTH_SHOES: 2,
};

function makeObservation(type, title, body, count) {
  return { type, title, body, count, itemIds: null, actionable: false };
}

export function analyseWardrobe(items) {
  const source = 'javascript';

  if (!Array.isArray(items) || items.length < CANDIDATE_THRESHOLDS.MIN_ITEMS) {
    return { observations: [], source };
  }

  const itemCount = items.length;
  const tops = items.filter((i) => i?.category === 'Tops').length;
  const bottoms = items.filter((i) => i?.category === 'Bottoms').length;
  const dresses = items.filter((i) => i?.category === 'Dresses').length;
  const shoes = items.filter((i) => i?.category === 'Shoes').length;

  const observations = [];
  const usedKeys = new Set();

  // Slot 1 — at most one balance/structural observation. Branches are mutually
  // exclusive by construction.
  if (tops >= 5 && bottoms <= 2) {
    observations.push(
      makeObservation(
        'imbalance',
        'Your top game is strong',
        `${tops} tops and ${bottoms === 0 ? 'no bottoms yet' : `only ${bottoms} ${bottoms === 1 ? 'bottom' : 'bottoms'}`}. A few more bottoms would multiply your outfit possibilities.`,
        tops,
      ),
    );
    usedKeys.add('tops');
    usedKeys.add('bottoms');
  } else if (bottoms >= 5 && tops <= 2) {
    observations.push(
      makeObservation(
        'imbalance',
        'Your bottoms are well-stocked',
        `${bottoms} bottoms and ${tops === 0 ? 'no tops yet' : `only ${tops} ${tops === 1 ? 'top' : 'tops'}`}. A few more tops would let Clozie pair them in fresh ways.`,
        bottoms,
      ),
    );
    usedKeys.add('bottoms');
    usedKeys.add('tops');
  } else if (bottoms === 0 && dresses === 0) {
    observations.push(
      makeObservation(
        'gap',
        'Ready for your first full looks',
        'A few bottoms — trousers, jeans, or a skirt — would unlock your first complete outfits with Clozie.',
        null,
      ),
    );
    usedKeys.add('bottoms');
    usedKeys.add('dresses');
  }

  // Slots 2-3 — strengths in order: depth → rich palette → tops → shoes.
  // Skip any whose primary data already appeared in slot 1 to keep observations distinct.
  const strengthCandidates = [
    {
      fires:
        tops >= CANDIDATE_THRESHOLDS.DEPTH_TOPS &&
        bottoms >= CANDIDATE_THRESHOLDS.DEPTH_BOTTOMS &&
        shoes >= CANDIDATE_THRESHOLDS.DEPTH_SHOES,
      keys: ['tops', 'bottoms', 'shoes'],
      build: () =>
        makeObservation(
          'strength',
          'Your closet has real depth',
          'Tops, bottoms, and shoes all have options. Clozie has plenty to work with.',
          null,
        ),
    },
    {
      fires: itemCount >= CANDIDATE_THRESHOLDS.RICH_PALETTE,
      keys: ['itemCount'],
      build: () =>
        makeObservation(
          'strength',
          'A rich palette to play with',
          `${itemCount} pieces gives Clozie plenty to mix and match across the week.`,
          itemCount,
        ),
    },
    {
      fires: tops >= CANDIDATE_THRESHOLDS.TOPS_COLLECTION,
      keys: ['tops'],
      build: () =>
        makeObservation(
          'strength',
          'A beautiful collection of tops',
          `${tops} tops means plenty of starting points for any look.`,
          tops,
        ),
    },
    {
      fires: shoes >= CANDIDATE_THRESHOLDS.SHOES_COVERED,
      keys: ['shoes'],
      build: () =>
        makeObservation(
          'strength',
          'Your shoes have you covered',
          `${shoes} pairs means every outfit gets the right finish.`,
          shoes,
        ),
    },
  ];

  for (const candidate of strengthCandidates) {
    if (observations.length >= 3) break;
    if (!candidate.fires) continue;
    if (candidate.keys.some((k) => usedKeys.has(k))) continue;
    observations.push(candidate.build());
    candidate.keys.forEach((k) => usedKeys.add(k));
  }

  // Fallback — encouragement when nothing else fires. Never return zero observations.
  if (observations.length === 0) {
    observations.push(
      makeObservation(
        'encouragement',
        'Your closet is coming together',
        'Clozie has a nice range of pieces to work with.',
        null,
      ),
    );
  }

  return { observations, source };
}
