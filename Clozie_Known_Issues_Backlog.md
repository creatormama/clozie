# Clozie — Known Issues Backlog

Deferred, non-blocking issues. Newest at top. Reconcile with the backlog kept in the Claude.ai project.

---

## Background Removal

- **Cutout returned rotated (~90°)** — normalize EXIF orientation before the Vision request in `BackgroundRemovalModule.swift`. Systematic (observed on both on-device TestFlight tests, Build 23, 2026-07-11 — pink striped pants + green floral tee both came back rotated while cutout quality was otherwise clean). Fix in next BR polish pass. Target: v1.0.4+ BR polish.
