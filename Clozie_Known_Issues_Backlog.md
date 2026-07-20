# Clozie — Known Issues Backlog

Deferred, non-blocking issues. Newest at top. Reconcile with the backlog kept in the Claude.ai project.

**Housekeeping:** Full migration of the Claude.ai project backlog into this file = future housekeeping session.

---

## Interactions & Learning

- **Undo / untag interactions** — OPEN. Re-tap "I wore this today" to undo it (must decrement `times_worn`, remove today's `worn_dates` entry, and restore `last_worn` correctly) + same-tap to clear a Love / Like / Not-for-me rating (null the `rating` on the `outfit_history` row). Touches wear counters AND Layer 1 learning signals — needs care, own session. Natural pairing: build together with the Nope reason chip (same rating-row UI).

## Background Removal

- **Oatmeal / low-chroma pale-warm garments over-whiten in bright light** — OPEN, AWB tuning. In bright light, pale-warm / low-chroma garments (e.g. an oatmeal sweater) come out almost white. Cause: garment-level `sC` chroma protection reads a pale-warm as near-neutral → full correction applied → whitening. Inherent trade of the `sC` design — the *same* mechanism that correctly lets warm whites go white. Candidate follow-ups: raise the `sC` protection floor for pale-warms, or gate `brightGain` by absolute luma. Surfaced on-device in Build 29 (2026-07-19, Session 19); logged to backlog Session 20 (2026-07-20). Related: dim-warm whites not fully white (known Session-16 limit). AWB detail in SESSION_NOTES Update 4 — Session 19.
- **Colorful garment on a busy colorful carpet fails cutout (most of the time)** — OPEN, Vision segmentation / background-removal track, **NOT AWB**. When a colorful garment is photographed on a busy colorful carpet, the Vision cutout usually fails to separate garment from background. This is a segmentation limitation, independent of the AWB colour work. Surfaced on-device in Build 29 (2026-07-19, Session 19); logged to backlog Session 20 (2026-07-20). Mitigation for users today = the existing "hang against a plain light wall" hint.

- **Cutout returned rotated (~90°)** — normalize EXIF orientation before the Vision request in `BackgroundRemovalModule.swift`. Systematic (observed on both on-device TestFlight tests, Build 23, 2026-07-11 — pink striped pants + green floral tee both came back rotated while cutout quality was otherwise clean). Fix in next BR polish pass. Target: v1.0.4+ BR polish.
  - **Safety tag:** `v1.0.4-build23-br-verified` (annotated, pushed to origin, on commit `dd3b6fb`) marks the verified-working Build 23 state — restore point before any rotation fix. Code diagnosis 2026-07-11: root cause is `input.cgImage` at `BackgroundRemovalModule.swift:18` dropping `UIImage.imageOrientation`. Only the VIP test surface hits it today — the real Add Item path already hands the module an upright image via `ImageManipulator.manipulateAsync` (App.js:1765 camera / 1797 library), so deferral is safe as long as future wiring runs BR on `fixed.uri`, not the raw pick. Chosen fix approach when picked up: normalize the UIImage to an upright bitmap before the Vision request (not passing orientation into Vision).

## Background Removal — polish pass (post-ship, cosmetic, non-blocking)

Deferred after Build 24 (2026-07-11) shipped background removal into the real Add Item flow (camera + library, both paths, runs on the upright `fixed.uri`, Add disabled until the cutout is ready, falls back to `fixed.uri` on null/throw). All items below are cosmetic and non-blocking. Items 1–3 + the Swift EXIF orientation fix (above) are natural candidates to bundle into ONE future "BR polish" session/build.

**Hanger-in-frame — DECIDED (2026-07-12):** Policy A with B's common sense — when a cutout includes the hanger, it's embraced as a signature Clozie look, NOT engineered out. No detection/removal work planned.

1. **AUTO-CROP (biggest visual win)** — ✅ DONE Build 25 (2026-07-12). Flipped `croppedToInstancesExtent: false → true` in `BackgroundRemovalModule.swift` (commit `951baa9`) so the Vision cutout crops to the garment bounding box; `resizeMode="contain"` then renders items larger/centered on the white card. On-device verified: items fill cards, nothing clipped — **padding follow-up NOT needed.**
2. **RE-PROCESS EXISTING ITEMS (cheap — reuses shipped machinery)** — add a "Remove background" button in the Edit Item panel that runs the existing `applyBackgroundRemoval` helper on an item's current photo and re-saves. Fixes the mixed-background look of items added before Build 24 (puffer coat, raincoat, bracelet, etc.) without re-photographing. Same fallback rules: null/throw keeps the current photo.
3. **SOFT SHADOW** — DEFERRED, now gated on TRANSPARENT PNG CUTOUTS shipping first (see Ideas / unscoped). Research (2026-07-12) upgraded this from "if still wanted" to EXPECTED COMPANION of transparency: cutouts without a shadow read as floating; a shadow baked into a white JPEG would be redone after the PNG switch, while a shadow under a transparent cutout works on every background. Subtle, one consistent recipe across all items. Pure cosmetic. Native-only — needs its own build to tune.
4. **HINT TEXT (near-zero cost)** — ✅ DONE Build 25 (2026-07-12). Reworded the Best Results tip (App.js:2309) "photograph on a white or light background" → "hang your item against a white or light wall" (commit `f6a39ed`). Note: this shipped a BACKGROUND reword, NOT the original "smooth the garment flat" wrinkle idea — the wrinkle tip stays OPEN as a separate micro-item (wrinkles are the main remaining photo-quality limiter for flat-lay users).

## v1.0.4 train — cross-reference (tracked elsewhere, not duplicated here)

- **Scheduled in `Clozie_NewFeatures_Roadmap_July4_2026.md`:** Nope reason chip + color learning Layers 2 & 3 + Manual Swap land in the v1.0.4 train; per-item rating lands around Pro.

## Ideas / unscoped

- **AUTO-ENHANCE LIGHTING** — strong Build 26 candidate (priority). Real-user photos in bad light look dim/muddy even after background removal; good-light photos look great (on-device verified by Grace, 2026-07-12). Research on-device Core Image auto-enhance (autoAdjustmentFilters: exposure/contrast/vibrance) applied in `BackgroundRemovalModule.swift` before or after the composite. Competitor context: Indyx "Enhance" (PhotoRoom API) and Whering "Enhance — fix bad lighting and creased fabric" both ship exactly this — table stakes. Read-only feasibility first.
- **TRANSPARENT PNG CUTOUTS** — strong Build 26 candidate; pairs with Auto-Enhance (same Swift file). Research replacing the white-JPEG composite with an alpha-transparent PNG (the Vision mask already produces alpha — the white composite is the extra step). Fixes the white-rectangle-on-cream flaw on Mood Board polaroids + Hanger View. Trade-offs to audit: PNG file size, Supabase storage/load, mixed old+new item formats, every surface assuming white photos. Ships WITH a subtle soft shadow (see item 3 above) — transparent without shadow reads as floating.
- **BULK ADD** — batch photo upload with queued recognition + BR and a review-later flow. Onboarding friction killer (adding 60 items one at a time). Medium feature, Pro-era candidate.
- **PRODUCT-LINK IMPORT (someday)** — paste a retailer URL to import the official product photo for newly bought items (Indyx/Whering pattern). Cheap way to get perfect images for new purchases.
- **OUTFIT PHOTO → ITEMS (someday, parked)** — extract garments from a photo of a worn outfit. Not feasible on-device today: needs server-side garment segmentation, and occlusion produces poor cutouts. Revisit only if we ever go server-side for other reasons.

---

## RESOLVED (moved here, never deleted)

- **Outfit structure — two bottoms / no top** — RESOLVED, Session 17F (2026-05-23). Three server-side composition checks in the `generate-outfits` Edge Function catch it: Check 1 (every outfit must include ≥1 Top or Dress), Check 3 (dedupe Bottoms, pinned-preference), Check 2 (trim Accessories > 6). Verified present in `supabase/functions/generate-outfits/index.ts` (itemById Map + checks at ~lines 1687–1748), 2026-07-11.
