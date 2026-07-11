# Clozie — Known Issues Backlog

Deferred, non-blocking issues. Newest at top. Reconcile with the backlog kept in the Claude.ai project.

**Housekeeping:** Full migration of the Claude.ai project backlog into this file = future housekeeping session.

---

## Interactions & Learning

- **Undo / untag interactions** — OPEN. Re-tap "I wore this today" to undo it (must decrement `times_worn`, remove today's `worn_dates` entry, and restore `last_worn` correctly) + same-tap to clear a Love / Like / Not-for-me rating (null the `rating` on the `outfit_history` row). Touches wear counters AND Layer 1 learning signals — needs care, own session. Natural pairing: build together with the Nope reason chip (same rating-row UI).

## Background Removal

- **Cutout returned rotated (~90°)** — normalize EXIF orientation before the Vision request in `BackgroundRemovalModule.swift`. Systematic (observed on both on-device TestFlight tests, Build 23, 2026-07-11 — pink striped pants + green floral tee both came back rotated while cutout quality was otherwise clean). Fix in next BR polish pass. Target: v1.0.4+ BR polish.

## v1.0.4 train — cross-reference (tracked elsewhere, not duplicated here)

- **Scheduled in `Clozie_NewFeatures_Roadmap_July4_2026.md`:** Nope reason chip + color learning Layers 2 & 3 + Manual Swap land in the v1.0.4 train; per-item rating lands around Pro.

---

## RESOLVED (moved here, never deleted)

- **Outfit structure — two bottoms / no top** — RESOLVED, Session 17F (2026-05-23). Three server-side composition checks in the `generate-outfits` Edge Function catch it: Check 1 (every outfit must include ≥1 Top or Dress), Check 3 (dedupe Bottoms, pinned-preference), Check 2 (trim Accessories > 6). Verified present in `supabase/functions/generate-outfits/index.ts` (itemById Map + checks at ~lines 1687–1748), 2026-07-11.
