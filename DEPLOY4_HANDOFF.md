# DEPLOY 4 HANDOFF — Issue 2: occasion-scoped Nope suppression

Cold-session handoff. Deploys 1–3 (Update 4 — Session 4, 2026-07-12) shipped and iPhone-verified. This file is everything needed to build **Deploy 4 = Issue 2** next session. Read CLAUDE.md + SESSION_NOTES.md (top entry) first.

## The problem (diagnosed, not yet fixed)
A "Not for me" (nope) rating has **zero targeted effect** on regeneration. The recent-history block (`index.ts` ~line 1451, `.select('name, vibe, item_ids')`) reads outfits "avoid repeating" but **does not read `rating`** — a nope'd outfit gets the same soft weight as a loved one and ages out after 6 rows. Learning Layer 1 reads ratings only for vibe-lean / star items (nope = −1 to a vibe; never suppresses a combo). The circuit breaker only trips after 2 consecutive ALL-nope sessions. Net: the exact disliked combination keeps coming back.

## The fix (design — LOCKED constraints)
Interim, occasion-scoped, **combination-level** suppression. Advisory only.
- **NEVER per-item** (must not shrink the wardrobe) — suppress the exact combination, not individual pieces.
- **NEVER permanent** — windowed + occasion-scoped; a nope means "wrong for THIS occasion," not "never again."
- **ZERO SYSTEM_PROMPT touch** — user-message only; cache must stay 2,510 (`cache_read_input_tokens: 2510`, SHA check on lines 198–413, expected `ce2cc53…`).

### Implementation
1. **New query** (near the recent-history query ~line 1451, after `wardrobeNameById` / `displayNameById` are built so names resolve):
   ```
   .from('outfit_history')
   .select('name, item_ids')
   .eq('rating', 'nope')
   .eq('occasion', occasion)   // occasion-scoped
   .order('rated_at', { ascending: false })
   .limit(8)                    // recent window (never permanent)
   ```
   Map `item_ids` → names via `wardrobeNameById`; drop empties. Log the count.
2. **New block in `buildFreshContent`** (add `dislikedOutfits` to args + destructure; thread from handler like `recentOutfits`). Place it with the other "avoid/vary" blocks (after `currentBlock`, before `recentBlock`). Wording must include the per-item guard:
   > `AVOID — she rated these {occasion} combinations "not for me". Do not repeat these exact pairings (individual pieces are fine in different combinations):`
   > `- <item names>`
   Omit the block entirely when `dislikedOutfits` is empty (same pattern as `recentBlock`).

## Verification plan (iPhone)
1. Nope a specific outfit on occasion **X**. Regenerate **X** → that exact combination should not reappear (Logs: `disliked outfits (this occasion): N` and no repeat).
2. Generate occasion **Y** → the X-disliked combo is NOT suppressed (`.eq('occasion', occasion)` → count 0 for Y). Proves occasion-scoping.
3. Confirm the individual disliked items still appear in OTHER combinations (never-per-item).
4. `cache_read_input_tokens = 2510`.

## Reuse
~70–80% of this plumbing (read `rating` / `occasion` from history → build a suppression block) is reused by the planned **Nope reason chip** (adds a `reason` column + reason-scoping). This is the foundation, not throwaway.

## DB facts (verified)
- `outfit_history` has `rating`, `occasion`, `item_ids`, `rated_at`. `occasion` is written on INSERT via `buildSnapshot` (src/lib/outfitHistory.js), so a nope on a just-generated outfit records its occasion.
- Some legacy rows have `occasion = NULL` (won't match `.eq`, harmless).
- Occasion strings are byte-exact with middots: `'Work · Office'`, `'Outdoor · Sport'` (` c2 b7 `).

## Gotchas (from tonight)
- **Verify deploy state FIRST** — a dashboard "deployed N min ago" timestamp can match an OLDER deploy. Check deploy history / re-deploy to be certain before trusting test results.
- **Fallback path never sees user-message nudges** — `buildSmartFallback` / `buildStubOutfits` won't respect the AVOID block, so a fallback response can still show a disliked combo. Acceptable (fallback is the rare degraded path).
- **Deploy policy:** CLI only — `SUPABASE_ACCESS_TOKEN=$(security find-generic-password -s 'supabase-pat-clozie' -w) supabase functions deploy generate-outfits --project-ref sbiwuqjnwjgjazxlyfhb --use-api` (no `--yes`).
- Live App Store build is Build 15 / v1.0.2 and an Apple reviewer is testing Build 25 — the function is outward-facing; deploy deliberately, verify on device.
