# Session 13 brief — Investigate Saved Outfits occasion chip filter bug

**Created:** end of Session 12 (2026-05-17)
**Status:** Bug isolated, root cause unknown, diagnostic plan defined
**Read this BEFORE doing anything else.**

---

## What this session is for

Session 12 built the Saved Outfits search + occasion chip filter (steps S0 through S6 — full archive in CLAUDE.md). End-to-end the feature works: search by text matches outfit name + item name + item colour correctly, "All" chip shows everything, "Casual Day" chip filters correctly. But **all OTHER occasion chips return 0 results** even when saved outfits with the matching occasion exist in the DB.

Session 13's job: find the actual root cause, apply a surgical fix, mark the Known Issue resolved.

---

## The bug — exact symptoms

1. Grace has saved outfits in `outfit_history` with `saved=true` and `occasion='Work · Office'` (visually confirmed in Supabase dashboard).
2. Open Saved Outfits modal → tap Search → tap the "Work · Office" chip → list shows zero outfits, result count says "Showing 0 outfits for Work · Office".
3. Same happens for Going Out, Formal Event, Outdoor · Sport, Weekend Errands, Travel.
4. ONLY "All" (default no-filter) and "Casual Day" (the chip Grace most recently used to generate-and-save in the same session) return non-zero results.

The "Casual Day" exception is the key clue. Outfits generated AND saved within the same session have their `occasion` field written correctly to the DB (because `lastPayload.occasion` was set at the time of save). Other-occasion outfits were generated in prior sessions OR had their `occasion` clobbered to NULL by a subsequent context-less write.

---

## What's already been verified — DO NOT redo

### Source-code byte audit (clean ✓)

Both arrays byte-identical, clean UTF-8 middot `c2 b7`:

| Source | Location | "Work · Office" bytes (hex) | Length |
|---|---|---|---|
| `OCCASION_CHIPS` (Saved Outfits filter) | App.js:2834 | `57 6f 72 6b 20 c2 b7 20 4f 66 66 69 63 65` | 14 |
| `occasionOptions` (TodaysVibeTab, source for DB writes) | App.js:1992 | `57 6f 72 6b 20 c2 b7 20 4f 66 66 69 63 65` | 14 |

So the source strings can't be the cause of mismatch.

### Context-clobbering theory (partially confirmed)

`upsertOutfitInteraction` in `src/lib/outfitHistory.js` calls `buildSnapshot(outfit, context)` which writes ALL snapshot fields (including `occasion`, `temperature`, `condition`, `indoors`, `brief`, `pinned_item_id`) on every upsert. Supabase upsert with these columns present overwrites the existing values. So when a user does any interaction (unsave / rate / wear) in a session where `lastPayload === null` (e.g. reopened the app, didn't generate yet), the context fields all get clobbered to NULL.

Grace's Supabase dashboard inspection confirmed: most saved rows have `occasion=NULL`. The exceptions are this-session "Casual Day" generations.

**BUT** — Grace also found a `Work · Office` row with `saved=true` AND `occasion='Work · Office'` visually present in the DB. That chip STILL returns 0 results. So the context-clobbering theory explains most-but-not-all of the symptom.

---

## What remains to check — START HERE

### Diagnostic 1 (MUST RUN FIRST) — SQL hex dump

Open Supabase dashboard → SQL Editor → run:

```sql
SELECT 
  client_outfit_id,
  occasion,
  octet_length(occasion) AS byte_length,
  encode(occasion::bytea, 'hex') AS hex_bytes,
  saved,
  saved_at
FROM outfit_history
WHERE saved = true
ORDER BY saved_at DESC;
```

**Expected for "Work · Office":** byte_length=14, hex_bytes=`576f726b20c2b7204f6666696365`

**Three scenarios:**

| If hex shows… | Root cause is… |
|---|---|
| `576f726b20c2b7204f6666696365` (clean) for "Work · Office" row | Runtime issue — DB has correct bytes but JS fetch/compare path is mutating something. Move to Diagnostic 2. |
| Different middot (e.g. `e2 80 a2` for U+2022 bullet, 3 bytes) | DB write encoded a different codepoint than the source string. Find where the path mutated. |
| Different space (e.g. `c2 a0` non-breaking space instead of `20`) | Same — DB write got a different byte. Trace the path. |
| Higher byte_length than 14 (trailing whitespace?) | Trim before write or after read. |

### Diagnostic 2 (only if Diagnostic 1 is clean) — runtime byte comparison

If DB hex matches the expected clean bytes, the mismatch is happening at runtime — between `fetchSavedOutfits` returning the row and `filterSavedOutfits` comparing it.

Add a temporary `console.log` to `src/lib/filterSavedOutfits.js`:

```js
// TEMP DEBUG — REMOVE after fixing
if (occ !== 'All' && outfit && outfit.occasion) {
  const occBytes = Array.from(new TextEncoder().encode(outfit.occasion)).map(b => b.toString(16).padStart(2,'0')).join(' ');
  const chipBytes = Array.from(new TextEncoder().encode(occ)).map(b => b.toString(16).padStart(2,'0')).join(' ');
  console.log(`[filter] outfit.occasion(${JSON.stringify(outfit.occasion)}) bytes:[${occBytes}] vs chip(${JSON.stringify(occ)}) bytes:[${chipBytes}] equal=${outfit.occasion === occ}`);
}
```

Reload Expo Go, watch Metro logs, tap the "Work · Office" chip, see what bytes are being compared.

---

## What was drafted but NOT applied this session — the S6-fix plan

I drafted a fix for the context-clobbering bug (the broader bug, not specific to the "Work · Office" mystery row). The plan:

- Modify `src/lib/outfitHistory.js` `upsertOutfitInteraction` to do a `.maybeSingle()` read at the top to detect insert vs update.
- Modify `buildSnapshot` to accept an `isInsert` parameter — context fields only included on INSERT, omitted on UPDATE so existing DB values are preserved by Supabase's upsert-with-omitted-columns semantics.
- One extra DB read per save/rate (the wear-today path already had this read for same-day dedupe).

This fix should be APPLIED after Diagnostics 1 and 2 confirm what's actually different about the "Work · Office" row. The fix is good regardless — it stops subsequent writes from wiping context fields. But there may be a SECOND fix needed depending on what the diagnostics reveal.

### The exact S6-fix code (rewriting `upsertOutfitInteraction` + `buildSnapshot`)

```js
// Modified buildSnapshot — adds isInsert parameter, gates context fields
function buildSnapshot(outfit, context, isInsert) {
  // Identity fields: always present. These are immutable per client_outfit_id
  // (same outfit ID always produces same vibe/name/items), so rewriting is safe.
  const snapshot = {
    client_outfit_id: outfit.id,
    vibe: outfit.vibe || '',
    name: outfit.name || '',
    description: outfit.description || null,
    item_ids: itemsToIds(outfit.items),
    style_match_score: typeof outfit.styleMatchScore === 'number' ? outfit.styleMatchScore : null,
    source: outfit.source || null,
  };
  // Context fields: write ONLY on INSERT (first-time interaction). On UPDATE,
  // these fields are omitted from the row payload → Supabase upsert preserves
  // the existing DB values. Fixes Session 12 bug where context-less subsequent
  // writes (e.g. unsave from a prior session) wiped occasion/temperature/etc.
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

// Modified upsertOutfitInteraction — single read at top, both paths use isInsert
export async function upsertOutfitInteraction(outfit, context, patch) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  if (!outfit?.id) throw new Error('Missing outfit id');

  const now = new Date().toISOString();

  // Single read: drives both worn-date dedupe AND insert-vs-update detection.
  const { data: existing, error: fetchErr } = await supabase
    .from('outfit_history')
    .select('worn_dates')
    .eq('user_id', user.id)
    .eq('client_outfit_id', outfit.id)
    .maybeSingle();
  if (fetchErr) throw fetchErr;
  const isInsert = existing === null;

  // worn-date append path
  if (patch.appendWornDate) {
    const wornDates = Array.isArray(existing?.worn_dates) ? existing.worn_dates : [];
    const today = patch.appendWornDate.slice(0, 10);
    const alreadyLoggedToday = wornDates.some(
      (d) => typeof d === 'string' && d.slice(0, 10) === today
    );
    if (alreadyLoggedToday) return;

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

  // rating + saved share the simple upsert path
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
```

**Cost:** 1 extra DB read per save/rate. Trivial at Grace's app scale.

**What this fix does NOT do:** backfill pre-existing rows that were corrupted by the bug. Those rows stay with `occasion=NULL`. Grace can either regenerate-and-resave the test outfits (insert path will write correct context), or run a one-off SQL UPDATE if she remembers which occasion each was for. Recommend the regenerate path — easier than backfill for the small test dataset.

---

## Files to read first in Session 13

1. **This brief** — you're reading it
2. **CLAUDE.md** — auto-read, gives full session history (Session 12 archive entry has the full play-by-play)
3. **`src/lib/outfitHistory.js`** — contains the upsert logic that may be writing wrong bytes; current `buildSnapshot` and `upsertOutfitInteraction` are at lines ~20 and ~43
4. **`src/lib/filterSavedOutfits.js`** — the filter that's returning 0 for the chip (40 lines, simple)
5. **App.js around line 2834** — `OCCASION_CHIPS` constant
6. **App.js around line 1992** — `occasionOptions` constant (source of what gets written to DB)
7. **App.js around line 6461** — `handlePersistInteraction` (curries `lastPayload` into `upsertOutfitInteraction`)

---

## How to start the session

1. Read this brief. Confirm understanding.
2. Ask Grace to run the SQL query in Supabase dashboard and paste the result back.
3. Based on what the SQL returns, propose the fix plan (could be the S6-fix as drafted, or a different fix depending on what the bytes show).
4. Wait for Grace's YES before touching any code.
5. Apply the fix surgically, iPhone-test, commit.
6. Update CLAUDE.md to mark the Known Issue resolved.

DO NOT pre-emptively apply the S6-fix. The diagnostic-first approach matters here — there could be TWO bugs.

---

## Grace's rules (from CLAUDE.md, restated)

- Plain English only — no jargon
- One step at a time — wait for YES at each step
- Every step must be LOW risk — if not, break into smaller steps
- Show the plan before any code
- Complete files only — never partial edits
- Revert immediately if anything breaks
- Label version on commit
- Never say AI to users — always say Clozie
- Never edit CLAUDE.md without showing Grace the exact change word for word and waiting for YES
