# CLOZIE — Session Notes

Rolling, append-only log of what happened in each session. Newest entry at top.

This file is NOT auto-loaded — read on demand when you need detail beyond the CURRENT BUILD STATE snapshot in CLAUDE.md.

Format: every entry uses the locked structure (Branch / Commits / Edge Function deploys / Cache token count / Goals / What changed / Tests / UNVERIFIED / Notes). Keep entries scrollable on a single screen; spillover means the detail belongs lifted into CLAUDE.md as a rule, or split into a follow-up session.

Session numbering reset to "Update N — Session M" starting 2026-06-21. All legacy sessions through Build 12 live in CLAUDE.md prose + CLAUDE_ARCHIVE.md.

---

## Update 1 — Session 1 — 2026-06-21 — Stay Logged In + Land on My Closet

**Branch:** testing (HEAD at session start: `f2d97e5`)
**Commit(s):** to be created at session end, single commit on testing
**Edge Function deploys:** none
**Cache token count:** 2,510 (unchanged — SYSTEM_PROMPT not touched)
**App Store impact:** none yet — work-in-progress toward Build 13

### Goals
- (a) Stay signed in across full app closes and reopens (no unnecessary re-login)
- (b) Returning users land on My Closet (new users still land on My Style)
- (c) Wake-up / loading race fix — DEFERRED to its own future session (rare in practice, has subtle edge cases worth treating separately)

### What changed (App.js only — no other files touched)

**Step 1 — Auto-resume session on cold launch.** Three edits inside `App()`:
- Initial state: `useState('splash')` → `useState('checking')` at App.js:7602.
- New `useEffect` calling `supabase.auth.getSession()` on mount: session present → set `mainInitialTab = 1` then `setCurrentScreen('main')`; no session → `setCurrentScreen('splash')`; on error → `setCurrentScreen('splash')` (fail-safe).
- New early-return `if (currentScreen === 'checking') return null;` so the native splash (Session 19D app.config.js setup) stays visible during the ~50-200ms `getSession()` resolves.

**Step 2 — Sign Out verification.** No code change. Confirmed as a side effect of Test A.

**Step 6 — `AppState` foreground/background refresh (inserted between Step 2 and Step 3).** Two edits:
- `AppState` added to the react-native import block.
- New `useEffect` inside `App()` subscribing to `AppState.addEventListener('change', ...)`: on `'active'` → `supabase.auth.startAutoRefresh()`, on background → `supabase.auth.stopAutoRefresh()`. Cleanup via `sub.remove()`. Canonical Supabase RN pattern preventing iOS deep-sleep from silently missing token refreshes.

**Step 3 — `initialTab` prop plumbing (default-preserving).** Two edits to MainAppScreen:
- Signature: `({ onSignOut })` → `({ onSignOut, initialTab = 0 })` at App.js:7078.
- Initial state: `useState(0)` → `useState(initialTab)` at App.js:7079.
- No caller passed the prop yet, so runtime behavior was byte-identical until Step 4 activated it.

**Step 4 — Wire `initialTab` from three entry points.** Five edits:
- New `mainInitialTab` state (default `0`) added in `App()`.
- Step 1's session-found branch now sets `setMainInitialTab(1)` before `setCurrentScreen('main')` → returning user → My Closet.
- AuthScreen `onDone` login branch now sets `setMainInitialTab(1)` → explicit Sign In → My Closet.
- PostLoginWelcomeScreen `onStart` now sets `setMainInitialTab(0)` → new signup → My Style (defensive explicit reset against a stale `1` leaking in from a prior in-app sign-in).
- `<MainAppScreen ...>` render now passes `initialTab={mainInitialTab}`.

### Tests — all live on iPhone in Expo Go

- **Test A** (Step 1): Sign Out → swipe app fully closed → reopen → landed on Welcome. ✅ PASSED.
- **Test B** (Step 1): Sign In → swipe app fully closed → reopen → straight into main app on My Style (initialTab not yet wired). ✅ PASSED.
- **Test C** (Step 6): backgrounded and returned 2-3 times, app resumed cleanly each time, tabs and scrolling responsive, no crash / white screen / errors. ✅ PASSED.
- **Test E** (Step 3 regression): cold launch → My Style (default `0` preserved), all four tabs rendered, Sign Out → Sign In → still My Style. Nothing changed. ✅ PASSED.
- **Test F** (Step 4): cold launch while signed in → **My Closet**. ✅ PASSED.
- **Test G** (Step 4): Sign Out → Sign In → **My Closet**. ✅ PASSED.
- **Test H** (Step 4): live throwaway-email signup → Welcome → **My Style**; then signed out and back in → **My Closet**. Full new-user lifecycle confirmed end-to-end. ✅ PASSED LIVE.
- **Test I** (Step 4): all four tabs rendered normally; wardrobe items load with the drawn-hanger placeholder briefly then real photos fill in (expected cold-launch signed-URL delay, not a bug). ✅ PASSED.

### UNVERIFIED — awaiting next TestFlight build (Build 13)

- **Test D — overnight long-sleep refresh (Step 6).** Cannot be reproduced in Expo Go because the access-token lifetime is ~1 hour and Expo Go's JS-runtime suspension behavior isn't representative of a standalone build. Must be tested on TestFlight Build 13: leave the app open, lock the phone overnight, return next morning, tap a Supabase-touching action (generate, add item) and confirm no re-sign-in. **If this fails on Build 13, revisit Step 6.**
- **Apple Sign-In end-to-end auth flow** (legacy carry-over from Session 22, 2026-06-03). Wired in code; Expo Go lacks the iOS Sign In with Apple entitlement so the native sheet only errors in dev. First real test happens on TestFlight Build 13.

### Notes / decisions

- Goal (c) (wardrobe `loadItems` race / disappearing-item flicker) explicitly deferred. The existing CLAUDE.md Known Issue already covers it; revisit in a focused session with the merge-by-id approach.
- Documentation structure formalized this session: CLAUDE.md (lean current state), CLAUDE_ARCHIVE.md (historical prose), SESSION_NOTES.md (this rolling log). Five ad-hoc per-session files at root left untouched — they are already history.
- Session numbering reset to Update 1 — Session 1. All legacy sessions through Build 12 stay exactly as-is in CLAUDE.md prose + archive.
