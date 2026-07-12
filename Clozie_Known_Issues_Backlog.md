# Clozie — Known Issues Backlog

Deferred, non-blocking issues. Newest at top. Reconcile with the backlog kept in the Claude.ai project.

**Housekeeping:** Full migration of the Claude.ai project backlog into this file = future housekeeping session.

---

## Interactions & Learning

- **Undo / untag interactions** — OPEN. Re-tap "I wore this today" to undo it (must decrement `times_worn`, remove today's `worn_dates` entry, and restore `last_worn` correctly) + same-tap to clear a Love / Like / Not-for-me rating (null the `rating` on the `outfit_history` row). Touches wear counters AND Layer 1 learning signals — needs care, own session. Natural pairing: build together with the Nope reason chip (same rating-row UI).

## Background Removal

- **Cutout returned rotated (~90°)** — normalize EXIF orientation before the Vision request in `BackgroundRemovalModule.swift`. Systematic (observed on both on-device TestFlight tests, Build 23, 2026-07-11 — pink striped pants + green floral tee both came back rotated while cutout quality was otherwise clean). Fix in next BR polish pass. Target: v1.0.4+ BR polish.
  - **Safety tag:** `v1.0.4-build23-br-verified` (annotated, pushed to origin, on commit `dd3b6fb`) marks the verified-working Build 23 state — restore point before any rotation fix. Code diagnosis 2026-07-11: root cause is `input.cgImage` at `BackgroundRemovalModule.swift:18` dropping `UIImage.imageOrientation`. Only the VIP test surface hits it today — the real Add Item path already hands the module an upright image via `ImageManipulator.manipulateAsync` (App.js:1765 camera / 1797 library), so deferral is safe as long as future wiring runs BR on `fixed.uri`, not the raw pick. Chosen fix approach when picked up: normalize the UIImage to an upright bitmap before the Vision request (not passing orientation into Vision).

## Background Removal — polish pass (post-ship, cosmetic, non-blocking)

Deferred after Build 24 (2026-07-11) shipped background removal into the real Add Item flow (camera + library, both paths, runs on the upright `fixed.uri`, Add disabled until the cutout is ready, falls back to `fixed.uri` on null/throw). All items below are cosmetic and non-blocking. Items 1–3 + the Swift EXIF orientation fix (above) are natural candidates to bundle into ONE future "BR polish" session/build.

1. **AUTO-CROP (biggest visual win)** — background-removed cutouts appear small in closet cards because the cutout keeps the original photo's full canvas with white padding around the garment. Fix: auto-crop the cutout to the garment's bounding box (plus a small margin) before saving, so items fill their cards at a consistent scale like product photos. Likely one line in the Swift (crop to the foreground extent before compositing) or a JS-side crop.
2. **RE-PROCESS EXISTING ITEMS (cheap — reuses shipped machinery)** — add a "Remove background" button in the Edit Item panel that runs the existing `applyBackgroundRemoval` helper on an item's current photo and re-saves. Fixes the mixed-background look of items added before Build 24 (puffer coat, raincoat, bracelet, etc.) without re-photographing. Same fallback rules: null/throw keeps the current photo.
3. **SOFT SHADOW** — subtle drop shadow under the garment in the cutout so it doesn't look pasted onto the white card. Pure cosmetic, premium feel.
4. **HINT TEXT (near-zero cost)** — add "smooth the garment flat" to the existing Best Results tip in the Add panel (App.js ~2289). Wrinkled garments are the main remaining quality limiter now that backgrounds are clean.

## v1.0.4 train — cross-reference (tracked elsewhere, not duplicated here)

- **Scheduled in `Clozie_NewFeatures_Roadmap_July4_2026.md`:** Nope reason chip + color learning Layers 2 & 3 + Manual Swap land in the v1.0.4 train; per-item rating lands around Pro.

---

## RESOLVED (moved here, never deleted)

- **Outfit structure — two bottoms / no top** — RESOLVED, Session 17F (2026-05-23). Three server-side composition checks in the `generate-outfits` Edge Function catch it: Check 1 (every outfit must include ≥1 Top or Dress), Check 3 (dedupe Bottoms, pinned-preference), Check 2 (trim Accessories > 6). Verified present in `supabase/functions/generate-outfits/index.ts` (itemById Map + checks at ~lines 1687–1748), 2026-07-11.
