# CLOZIE — Master Build Document

FILE NAME: CLAUDE.md
WHAT GRACE CALLS IT: Clozie MD / the master file
WHAT CLAUDE CODE CALLS IT: CLAUDE.md (must use this exact name)
HOW TO USE: Drop this file into the root of your clozie-native project folder. Claude Code reads it automatically every session. In claude.ai planning chats — paste the full contents.

READ THIS ENTIRE FILE before doing anything. No exceptions.

---

# CURRENT BUILD STATE — UPDATE THIS SECTION WHEN STATE CHANGES

Last verified: 2026-07-21.

**LIVE / FROZEN: Clozie v1.0.0 (Build 12)** — commit `9d617db`, tagged `v1.0.0-build12-appstore-live`, branch `production`. Submitted to Apple 2026-06-04, in Apple review. **Build 12 does not move.** Tags are immutable; `production` only fast-forwards when a new build is Apple-approved and replaces it. The `v1.0.0-build12-appstore-live` tag is the permanent restore point for Build 12 forever.

**UPDATE 1 LIVE: Build 14 / v1.0.1 — Apple-approved and released on the App Store.** All Update 1 work landed on the `testing` branch. Build 13 was built first against version 1.0.0 and REJECTED at App Store Connect automated processing on 2026-06-29 with errors **90186** + **90062** because the version string still matched the already-shipped Build 12 / v1.0.0. Fix: version bumped 1.0.0 → 1.0.1 in `app.config.js` + `package.json` (commit `01c1d0f` on testing). Build 14 rebuilt via EAS, uploaded via Transporter, submitted to App Store, Apple-approved, and released — Build 14 (v1.0.1) was the live App Store build until Build 15 replaced it. **Tag rule SATISFIED for Build 14** (2026-07-04): annotated tag `v1.0.1-build14-appstore-live` (tag-object SHA `8f0a104`) created on commit `01c1d0f` AND `production` fast-forwarded `9d617db` → `01c1d0f`; both pushed to origin. **UPDATE 2 LIVE: Build 15 / v1.0.2 — Apple-approved and RELEASED on the App Store (confirmed 2026-07-06). Build 15 was the live App Store build until Build 25 replaced it (2026-07-13). Tag rule SATISFIED for Build 15** (2026-07-06, Update 3 — Session 4): annotated tag `v1.0.2-build15-appstore-live` (tag-object SHA `09b5ad1`) created on commit `ea8f0ca` AND `production` fast-forwarded `01c1d0f` → `ea8f0ca`; both pushed to origin. Sessions 1-4 landed the code (Dynamic Type AX wrapper, nested-Text logo fix, land returning users on Today's Vibe, Analyse My Wardrobe redesign); Session 5 (2026-07-04, commit `3699b54`) bumped the version 1.0.1 → 1.0.2 in `app.config.js` + `package.json` — same two-file pattern that fixed the Build 13 rejection. Session-by-session detail lives in SESSION_NOTES.md.

**UPDATE 4 LIVE: Build 25 / v1.0.4 — Apple-APPROVED and RELEASED on the App Store 2026-07-13 (Grace pressed Release in App Store Connect ~3 PM). Build 25 / v1.0.4 was the LIVE App Store build until Build 29 / v1.0.5 replaced it (2026-07-21).** (Build 19 / v1.0.3 only ever reached TestFlight internal testing and was never released; Build 15 / v1.0.2 was the prior live build.) **The v1.0.4 train is now CLOSED — per the VERSION RULE, any future app CODE change requires bumping the version to 1.0.5 in BOTH `app.config.js` AND `package.json` FIRST, or Apple rejects the build with 90062/90186.** (Edge Function deploys are server-side and NOT gated by this — they ship independently of the app version.) **Release git bookkeeping DONE 2026-07-13:** annotated tag `v1.0.4-build25-appstore-live` (tag-object `d219721`) created on the shipped Build 25 commit `f711c5d` AND `production` fast-forwarded `ea8f0ca` → `f711c5d`; both pushed to origin. `production` now points at the live Build 25.

**UPDATE 4 LIVE: Build 29 / v1.0.5 — Apple-APPROVED and RELEASED on the App Store 2026-07-21 (Grace pressed Release in App Store Connect; US, 1 region; rollout in progress). Build 29 / v1.0.5 is now the LIVE App Store build.** (Builds 26/27/28 were TestFlight-only and never released; Build 25 / v1.0.4 was the prior live build.) Ships the phase15D automatic white balance (AWB) white-fix — `modules/expo-background-removal/ios/AutoWhiteBalance.swift`, app-code commit `5b51910` (Session 19). EAS Build 29 was built from commit `0baff39` — VERIFIED via `eas build:view` server record (Version 1.0.5 / Build 29 / Commit `0baff3924ec…`). **The v1.0.5 train is now CLOSED — per the VERSION RULE, any future app CODE change requires bumping the version to 1.0.6 in BOTH `app.config.js` AND `package.json` FIRST, or Apple rejects the build with 90062/90186.** (Edge Function deploys are server-side and NOT gated by this — they ship independently of the app version.) **Release git bookkeeping DONE 2026-07-21:** annotated tag `v1.0.5-build29-appstore-live` (tag-object `e2b79f2`) created on the shipped Build 29 commit `0baff39` AND `production` fast-forwarded `f711c5d` → `0baff39` (true fast-forward, 41 commits, nothing lost); both pushed to origin. `production` now points at the live Build 29. The Build 25 restore tag `v1.0.4-build25-appstore-live` (tag-object `d219721`) @ `f711c5d` stays permanent; the descriptive restore tag `v1.0.5-build29-awb-whitefix` @ `0baff39` also remains.

**Session numbering reset 2026-06-21.** All legacy sessions through Build 12 are closed. Going forward, the unit is "Update N — Session M" matching the App Store lifecycle. Legacy session prose stays in this file + CLAUDE_ARCHIVE.md unchanged.

Standing facts:

- Production pointer: branch `production` (tracking `origin/production`), currently at `0baff39` (Build 29 / v1.0.5, live on the App Store; fast-forwarded from `f711c5d` on 2026-07-21).
- **SDK 54→57 upgrade — DONE and MERGED to `testing`** (Update 3 — Session 9, 2026-07-11): `testing` fast-forwarded `21e5db1` → `bdfb0d2`, so it now runs `expo` 57.0.4 / `react-native` 0.86.0. **Build 19 (v1.0.3) is TestFlight-VERIFIED on iPhone** (fetch swap, Share Card / view-shot 5, camera + photo + Generate, Apple Sign-In, overnight token refresh — all pass). **Consequence: Expo Go (capped at SDK 54) can NO LONGER run `testing`** — all device testing is TestFlight-only until Expo Go ships SDK 57. Two revert doors, both annotated tags: `sdk54-final` (@ `21e5db1`) = last Expo Go-compatible fallback; `sdk57-clean-baseline` (@ `bdfb0d2`) = pre-background-removal revert point. Branch `sdk56-upgrade` kept at `bdfb0d2` as an extra safety pointer. Full detail: SESSION_NOTES Update 3 — Sessions 8 & 9.
- Going-forward build convention: every App Store build gets (a) an annotated tag `vX.Y.Z-buildN-appstore-live` pinned to that commit forever, AND (b) `production` fast-forwarded to point at that commit. Tags never move; `production` moves only with each new shipped build.
- **VERSION RULE:** Once a version is live on the App Store, its train is closed — Apple rejects any new build with that version string (90062/90186). Every TestFlight/App Store build after a release MUST bump the version in BOTH `app.config.js` and `package.json` first. Check the live App Store version before every EAS build.
- Annotated tags show tag-object SHAs (`512dbd2`/`2036b9c`) via `git ls-remote` — differs from commit SHAs, normal, not drift. See SESSION_NOTES Update 2 — Session 2.
- Main branch (THIS repo, `creatormama/clozie.git`): stale at `062d15b` (March 30 Phase 1 snapshot, 107 commits behind testing). Nothing deploys off it. Safe to leave alone — decision on whether to fast-forward main to Build 12 deferred.
- Latest TestFlight standalone (Update 0): Build 12.
- Edge Function `generate-outfits` SYSTEM_PROMPT cache: 2,510 tokens (verified via Supabase Logs `cache_read_input_tokens` round-trip). 462 tokens of headroom above the 2,048 caching threshold.
- Active Edge Functions: `generate-outfits`, `recognize-photo`, `delete-user`. All deploy via Supabase CLI from disk only — see EDGE FUNCTION DEPLOY POLICY.
- Current Expo SDK: 54. Do NOT run `npm audit fix` against this SDK — see THINGS TRIED THAT DID NOT WORK.
- Dynamic Type cap live (Update 1 — Session 3): Text/TextInput global cap at `maxFontSizeMultiplier = 1.3`; explicit `maxFontSizeMultiplier={1.1}` on Welcome + Splash big DM Serif headings; `maxFontSizeMultiplier={1.15}` on Welcome eyebrow + tagline + Splash label. MITIGATION only — Welcome safe-area debt (fixed `top:80` / `bottom:60`) is unchanged and stays on the deferred-layout list.
- Dynamic Type AX wrapper live (Update 2 — Session 1, 2026-06-29, commit `9e450f8` on testing — not pushed): `Text` and `TextInput` are redirected to wrappers in `src/components/` for JS-level Dynamic Type capping; 4 nested-Text logo sites (Welcome / Sign In / Peek Inside / PostLogin) closed in Update 2 — Session 2.
- Nested-Text logo fix live (Update 2 — Session 2, 2026-06-30, on testing — not pushed): Welcome / Sign In / Peek Inside / PostLogin big DM Serif wordmark logos all swapped from `<Text>` parent to `<View>` parent with `flexDirection: 'row'` — Splash structural pattern now applied across every big wordmark. Six surgical App.js edits (4 tag swaps + 2 `flexDirection: 'row'` style additions). iPhone-verified at NORMAL + AX MAX in Expo Go — all four hold clean with no `lineHeight` needed at 64pt / 56pt / 36pt / 36pt. Only ShareCard `dontScale` opt-out wiring remains pending from the AX work. SYSTEM_PROMPT untouched, cache stays 2,510, zero CLI deploys, App.js-only.
- Indoor Toggle silent-weather fix live (Update 1 — Session 4): when `indoors === true` in the `generate-outfits` Edge Function, the weather signal goes silent before the prompt is built — weather data line renders as `Weather: Indoors — climate not a factor`, `buildWeatherHint` returns `null`, and weather safety filters C1 Cold / Cool-Cold open-footwear / C2 Hot / Hot-Warm heavy-outerwear name-pattern / C3 Rainy / C4 Snowy all skip. Occasion layering + Brief untouched, so blazers / suits / cardigans / sweaters / cover-ups survive. C5 Indoor warmth filter + Indoor name-pattern filter retained as belt-and-suspenders. SYSTEM_PROMPT untouched; cache stayed at 2,510 tokens. Closes the "Rubber Rain Anorak indoors" bug surfaced post-Build 12.
- Color family foundation (Update 1 — Session 5, DORMANT): `COLOR_FAMILIES` map + `colorFamilyForText` / `colorFamiliesForCategoryWord` helpers landed in `generate-outfits` Edge Function — nothing calls them yet; Session 6 (Brief color matching) wires the first call site. SYSTEM_PROMPT untouched, cache stays at 2,510 tokens, zero CLI deploys, commit `7d997a7` on testing. **Session 6 input contract: feed `colorFamilyForText` the COLOUR field only, NOT `name + colour` — item names contain fabric words (Linen Shirt, Denim Jacket) that would produce false hits.**
- Brief color lift wired (Update 1 — Session 6, 2026-06-27): the Session 5 helpers are now live. `buildCompressedPool` gains an optional `briefFamily: ColorFamily | null` arg; when the user names a single color in the Brief (e.g. "navy" / "cream" / "purple"), matching-colour items are lifted ahead of others in the wardrobe pool the Edge Function sends to Sonnet. Gentle nudge only — the pool is re-sorted, never filtered; when no color word is detected the new sort key short-circuits and behavior is byte-identical to pre-Session-6. Honors the Session 5 input contract: `colorFamilyForText(item.colour || '')` reads the COLOUR field only, never name + colour. Pin enforcement, third/wildcard-outfit freedom, and all safety filters untouched. Single colors only — `colorFamiliesForCategoryWord` (category phrases) still uncalled. Old inner `colorFamily(item)` at index.ts:904 NOT touched, NOT mirrored. iPhone-verified across pin + color (3 rounds, 3 different pinned tops — pin survived every round, navy/blue surfaced), unowned-color fall-through (no error, pool re-sorted not emptied), no-color baseline (no log line, byte-identical behavior), and garment + color combos with no pin ("white t-shirt", "white sneakers", "navy blouse + pearls", "black sneakers" all surfaced correctly). One CLI deploy via `--use-api` (no `--yes`). SYSTEM_PROMPT untouched; cache verified at 2,510 tokens via `cache_creation_input_tokens: 2510` then `cache_read_input_tokens: 2510` round-trip within 5 min. App.js NOT touched. Two new open issues surfaced and added to KNOWN ISSUES (PIN + COLOUR + GARMENT triple-combo inconsistency — the ceiling of soft pool-lift; "navy blazer" two-blazers watch item).
- Daily Notifications wired (Update 1 — Session 7, 2026-06-27): local-only daily nudges, 7:30am default (user-changeable), 7 rotating messages (no repeats, no day-of-week logic), scoped cancel via `data.kind === 'daily'` marker, tap opens Today's Vibe; normal icon launch still lands on My Closet. No push token, no backend, no Privacy Policy data-category change. Full detail in SESSION_NOTES Session 7. UNVERIFIED firing + tap-routing until Build 13.
- Style Learning Layer 1 live (Update 1 — Session 8, 2026-06-27): `generate-outfits` learns from the user's last 30 rated outfits and injects one soft `STYLE NOTES (from recent ratings):` block into the USER message — never the cached SYSTEM_PROMPT. Two signals: (1) **vibe lean** (love +2 / like +1 / nope -1, top 1-2 vibes whose net score ≥ +2), (2) **star items** (love/like only, items appearing in 2+ positive outfits, top 2 by count). Gate: <5 rated rows emits nothing (new-user path). Color deliberately excluded — deferred to Update 1A. Block sits between DRESS RULE and currentBlock/recentBlock/WARDROBE POOL (pool stays last for recency bias). Position is also after Gate 7 so session-limit-blocked calls skip the extra DB read. Wildcard line (Option C, upgraded from B mid-session): "Let these notes shape two of the three looks; her broader closet still leads. Keep the third free of them — a fresh, different choice that still feels easy to wear, never a costume." Star anti-domination guardrail: "feature them when they genuinely fit, but never force them, and never include either in every look." Two CLI deploys: Deploy 1 shadow compute (logged, never injected); Deploy 2 wired live into the user message. SYSTEM_PROMPT untouched both deploys; cache held at 2,510 with cache_creation 2510 then cache_read 2510 round-trip both deploys. Byte baseline post-Session-8: em-dashes 140, middots 18 (corrects an older note that had middots 17). iPhone + Logs verified: ratedCount 30, vibeLean "sharp" score 5, stars Leather Low-Top Sneakers + Woven Straw Fedora, full STYLE NOTES block present on both calls (19:32:08 + 19:32:31). Pool 56 styleable items remained in play. User eyeball: outfits "good, like always" — pass (no regression). NOT yet proof learning is shifting outfits in a measurable way; that needs a week of natural rating to confirm. App.js NOT touched. No schema changes. No new dependencies.
- Analyse My Wardrobe (free JS) wired — Update 1 Session 9 (2026-06-28): tappable card on My Closet computes up to 3 warm observations in-app via `src/lib/wardrobeIntelligence.js`; free foundation for Pro (Pro swaps observation source only, UI identical). Sage ring polish same day: entry + observation cards wear a `#BCC7B7` 1.5px ring + soft shadow so the trio reads as one family. Full detail in SESSION_NOTES.

This is the load-bearing snapshot of "where Clozie stands right now." When a state fact changes (new build ships, Edge Function deploys, cache token count moves, Expo SDK upgrades), update THIS section. Session-by-session narrative for all legacy sessions through Build 12 lives below in this file + CLAUDE_ARCHIVE.md. From Update 1 onward, session narrative lives in SESSION_NOTES.md.

Last updated: **2026-07-21 — Update 4, Session 22 (Build 29 App Store release + git bookkeeping — production intentionally moved).** **Build 29 (v1.0.5) is now the LIVE App Store build** — Apple-approved; Grace pressed Release in App Store Connect 2026-07-21 (US, 1 region; rollout in progress). **Build 25 / v1.0.4 → prior live build**; its restore tag `v1.0.4-build25-appstore-live` (tag-object `d219721`) @ `f711c5d` stays permanent (VERIFIED intact after the move). **The v1.0.5 train is now CLOSED** — per the VERSION RULE the next app CODE change bumps the version to 1.0.6 in BOTH `app.config.js` AND `package.json` first; both files read `1.0.5` on disk right now (VERIFIED, no bump yet). **Release git bookkeeping DONE 2026-07-21:** annotated tag `v1.0.5-build29-appstore-live` (tag-object `e2b79f2`) created on the shipped Build 29 commit `0baff39` AND `production` fast-forwarded `f711c5d` → `0baff39` (true fast-forward, 41 commits, nothing lost); both pushed to origin (local `production` = `origin/production` = `0baff39`, VERIFIED). EAS server record confirms Build 29 = commit `0baff39` (`eas build:view`: Version 1.0.5 / Build 29 / Commit `0baff3924ec…`). The descriptive restore tag `v1.0.5-build29-awb-whitefix` @ `0baff39` also remains. AWB phase15D detail unchanged — SESSION_NOTES Update 4 — Sessions 13–19. Two known AWB colour limitations (dim-warm whites not fully white; pale-warm/oatmeal over-whitens in bright light) + one out-of-scope busy-carpet cutout miss remain — see KNOWN ISSUES / `Clozie_Known_Issues_Backlog.md`. **main `062d15b` UNTOUCHED this session** (never checked out, never moved); cache 2,510 (nothing deployed); zero Edge Function / SYSTEM_PROMPT / app-code changes; **EAS quota: 0 builds remain this month.**

**2026-07-20 — Update 4, Session 20 (docs catch-up; Build 29 submitted to Apple, awaiting review).** **Build 25 / v1.0.4 remains the LIVE App Store build.** The **v1.0.5 train is OPEN** — Builds 26/27/28 were TestFlight-only and never released; **Build 29 (v1.0.5) was SUBMITTED to Apple 2026-07-20 ~3:50 PM PT and is AWAITING REVIEW — NOT approved, NOT released.** Per the VERSION RULE the next App Store release ships 1.0.5 with no bump; once 1.0.5 ships, its train closes. **AWB is now in the app code:** `modules/expo-background-removal/ios/AutoWhiteBalance.swift` runs the phase15D pipeline (app-code commit `5b51910`, Session 19); the Session-16 gate-calibration PASSED on-device in Build 29 (edgeLumaLoss ≤0.10 matches real iPhone; fringe halo near-invisible). Full AWB detail: SESSION_NOTES Update 4 — Sessions 13–19. **New restore tag** `v1.0.5-build29-awb-whitefix` → commit `0baff39` (Build 29's EAS-confirmed source; tag-object `5314ce9`) — descriptive restore point only, NOT `-appstore-live`, no production move. **Pending release bookkeeping (when Apple approves + Grace presses Release):** create `v1.0.5-build29-appstore-live` on `0baff39` AND fast-forward `production` `f711c5d` → `0baff39`; waits until then. Two known AWB colour limitations (dim-warm whites not fully white; pale-warm/oatmeal over-whitens in bright light) + one out-of-scope busy-carpet cutout miss — see KNOWN ISSUES / `Clozie_Known_Issues_Backlog.md`. main `062d15b` / production `f711c5d` UNTOUCHED; cache 2,510; **EAS quota: 0 builds remain this month.**

**2026-07-16 — Update 4, Session 13 (Phase 2 AWB port → Build 28 TestFlight: EDGE FAIL).** Ported the Phase-1-validated Fork-A automatic white balance into the cutout pipeline as new `modules/expo-background-removal/ios/AutoWhiteBalance.swift`, wired behind an `autoWhiteBalance` flag (default off) and flipped ON in App.js `CUTOUT_OPTIONS`. Commits P1–P5 on testing (`094e62d` comment fix · `b1660ce` port · `2598c8a` flag · `c630419` wire · `329a50a` enable). Phase 1.5 (Mac, real Vision mask, 12 photos) passed the colour scoreboard; ONE EAS build spent — **Build 28 / v1.0.5 iOS preview, compiled first try**, delivered to TestFlight via Transporter. **On-device verdict FAIL (Grace's eye): garment silhouettes/edges destroyed on EVERY cutout, worse than Build 25.** Ruling recorded: **SHAPE OUTRANKS COLOR.** VERIFIED diagnosis: `applyCorrectionRGBA` has no alpha gate, so the full brightness gains hit semi-transparent fringe pixels and push them toward white — on the app's white surfaces the soft edge dissolves (worst for light/white garments); scale-independent (Add Item feeds a 512px image, no downscale). Two further on-device symptoms same loop: warm shadow folds on light garments revert to BROWN (chroma-protection reads them as garment colour), and coloured garments lose their outline too (low-chroma diluted edge pixels aren't shielded, brightness whitens them). `autoWhiteBalance: true` STAYS in committed code but **Build 28 is TestFlight-only and NOT promoted; Build 25 / v1.0.4 remains LIVE and untouched; main `062d15b` / production `f711c5d` untouched.** 1 EAS build remains this month (quota resets ~2 weeks). Next: Phase 1.6 (Mac, ZERO builds) — reproduce all three symptoms locally compositing over WHITE, fix space = alpha-gate/feather the correction at edges AND rethink chroma-protection for dark-warm and diluted pixels; all old scoreboard guardrails remain binding plus a new edge-integrity criterion. Full detail: SESSION_NOTES Update 4 — Session 13.

**2026-07-13 — Build 26 opener:** version bumped 1.0.4 → 1.0.5 in `app.config.js` + `package.json` (testing branch) — the 1.0.5 train is now OPEN. Read-only Build 26 feasibility audit completed (transparent PNG cutouts + auto-enhance + baked silhouette shadow + parameterized Swift module + re-process migration + EXIF rider); full findings in **BUILD26_FEASIBILITY_FINDINGS.md**. Zero Edge Function / SYSTEM_PROMPT / eas.json / Supabase changes; cache stays **2,510**. Background removal confirmed LIVE in Build 25 (verified against code, not the stale SHELVED doc).

**2026-07-13 — Build 26, Session 1 (code, NO EAS build):** background-removal Swift module fully parameterized + JS wired on `testing` (HEAD `a2fc8bf`), 8 per-step commits `da892f7`→`a2fc8bf`. `removeBackground(imageUri, options?)` now supports transparent PNG output, auto-enhance (Core Image `autoAdjustmentFilters`, before masking), a baked silhouette shadow (blurred/offset/gray-tinted alpha silhouette composited under the garment), and a Swift EXIF rotation rider — all with NO-OP defaults, so unwired the output stays byte-identical to Build 25. App.js `CUTOUT_OPTIONS` (png / enhance 1.0 / shadowOpacity 0.40 / blur 18 / offsetY 12 / gray 0.3) turns the new look ON at both call sites; `uploadWardrobePhoto` now derives extension + content-type (png vs jpg). Starting recipe values are JS-tunable (rebuild, never a Swift recompile). **NO EAS build this session — all on-device verification deferred to Build 26 Session 2 (TestFlight).** Safety net UNCHANGED: `main` `062d15b`, `production` `f711c5d`, tag `v1.0.4-build25-appstore-live` → `f711c5d`. Supabase `wardrobe-photos` bucket confirmed MIME=Any / 50 MB (PNG allowed, no dashboard change). Zero Edge Function / SYSTEM_PROMPT / eas.json / app.config.js / package.json changes; cache stays **2,510**. Full detail: SESSION_NOTES Update 4 — Session 6.
Original: March 24 2026 — REBUILD RULE and testing branch rule added.

---

# DOCUMENTATION LAYERS — LOCKED 2026-06-21

Three layers, each with one job. Future sessions follow this contract.

- **CLAUDE.md** — lean living document. Standing rules, locked decisions, design system, env vars, VIPs, language rule, edge function deploy policy, CURRENT BUILD STATE snapshot, active KNOWN ISSUES. Auto-loaded at session start. Trim continuously; never let dated session prose accumulate here.
- **CLAUDE_ARCHIVE.md** — historical session prose lifted out of CLAUDE.md during slim-down passes. Newest-first. Not auto-loaded; read on demand.
- **SESSION_NOTES.md** — rolling, append-only session log. Newest entry at top. Each session appends ONE entry using the locked structure (Branch / Commits / Edge Function deploys / Cache token count / Goals / What changed / Tests / UNVERIFIED / Notes). Not auto-loaded; read on demand.

**Desktop copy convention.** The repo file is ALWAYS named exactly `SESSION_NOTES.md` (one rolling file, never renamed). At the end of every session, also drop a COPY on Grace's Desktop with a UNIQUE DATED filename so uploads can be told apart.

**SESSION NOTES DESKTOP COPY — LOCKED**

`SESSION_NOTES_Update[N]_Session[M]_[YYYY-MM-DD]_[Topic].md`

- **Filename:** `[Topic]` is required, placed last (after the date), 1-4 words, all-lowercase, hyphen-separated, no spaces (e.g. `SESSION_NOTES_Update4_Session8_2026-07-14_session-notes-rule.md`). Keep it descriptive of the session's main outcome.
- **Contents:** ONLY that session's single entry — never the whole rolling log. Copy the one `## Update N — Session M …` block and nothing above or below it.
- **Canonical full log:** `SESSION_NOTES.md` in the repo stays cumulative; the Desktop copy is reference-only, lives outside the repo, and is never committed.

Example: `SESSION_NOTES_Update1_Session2_2026-07-04.md` was an early copy dropped before this rule was formalized (no `[Topic]`). Update 1 Session 1's Desktop copy (2026-06-21) was left as the plain `SESSION_NOTES.md`; the dated convention applies from Update 1 Session 2 onward, and the single-entry + `[Topic]` rule above applies going forward.

Session numbering format is `Update[N]_Session[M]` matching the App Store lifecycle described in CURRENT BUILD STATE.

---

# WHO I AM

I am Grace — non-technical founder of Clozie.
I work solo. I do NOT use the command line. Ever.
I work on a MacBook. I communicate by voice.

Transcription quirks — I may say:
- "Subbase" = Supabase
- "Verso" or "Walter" = Vercel
- "Gipha" = GitHub
- "Nut butter" = Notepad
- "Cloth coat" or "Clothe code" = Claude Code
- "Comit" = Commit
- "Expo" = Expo (correct)
- "React Native" = React Native (correct)

Very smart business thinker with excellent instincts.
Needs everything explained one tiny step at a time.
Never rush Grace — always reassure warmly.

---

# THE APP — TWO VERSIONS

## Version 1 — Web App (LIVE — FROZEN — DO NOT TOUCH. EVER.)

- Live at: clozie.vercel.app
- Stack: React + Vite + Supabase + Anthropic Claude API + Vercel + GitHub
- Status: Left exactly as-is. No more development here. Ever.
- Current live file: App_WORKING_NewWelcome_SettingsFix_NoShare_March15_2026.jsx
- Main branch = live to users — leave completely alone
- NEVER TOUCH THE WEB APP. It stays live as a backup. Leave it completely alone.

## Version 2 — Native App (THIS IS OUR ONLY FOCUS NOW)

- Name: Clozie
- Tagline: "Everyone says I have nothing to wear. Clozie solves that in 30 seconds."
- Stack: React Native + Expo + Supabase + Anthropic Claude API
- Target user: Everyday busy woman 25-45
- Platforms: iOS + Android — same codebase, one build serves both platforms
- Testing: Expo Go app on iPhone — free, no Apple fees needed yet
- Publishing: App Store + Google Play — only when Grace says she is ready
- Ad-free: Clozie is completely ad-free. Never show ads. Never let advertisers influence anything.
- 5 items rule: Outfit generation must work with as few as 5 wardrobe items — show value quickly
- Encouragement nudges: Show warm encouraging messages as users add items — reduces drop-off
- TikTok hook: "I have nothing to wear" — core message for all marketing
- "Would you wear this?" sharing via WhatsApp, iMessage, Instagram Stories

---

# ALL IMPORTANT LINKS

- Web app (frozen): https://clozie.vercel.app
- GitHub: github.com — repository "clozie" (web app — leave alone)
- Vercel: vercel.com — project "clozie" (web app — leave alone)
- Supabase: supabase.com — project "clozie" (SHARED — native app uses same database)
- Anthropic: platform.anthropic.com
- Expo: expo.dev — native app lives here

---

# ENVIRONMENT VARIABLES

## Web App — Set in Vercel — DO NOT TOUCH
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON
- VITE_ANTHROPIC_KEY

## Native App — Set in Expo / app.config.js
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY
- EXPO_PUBLIC_PHOTOROOM_KEY (only when PhotoRoom is ready — not yet)

## Supabase Edge Function secrets (Project → Edge Functions → Secrets)
- ANTHROPIC_API_KEY — server-side Anthropic key. Added 2026-05-08 (Session 7a). Never lives in client.
- SUPABASE_URL and SUPABASE_ANON_KEY are auto-provided to functions by Supabase — no manual setup.

## Anthropic dashboard (console.anthropic.com → Settings → Spend limits)
- Monthly spend cap: $100 (development). $50 email alert threshold. Raise to $200 at launch. Set 2026-05-08 (Session 7a). Updated 2026-05-12.

ARCHIVED 2026-05-08 (Session 7a): EXPO_PUBLIC_ANTHROPIC_KEY removed from client. Was previously listed here as: "EXPO_PUBLIC_ANTHROPIC_KEY — NOTE: REMOVE before launch. API key moves to Supabase Edge Function in Phase 2. Never in client code." Done. Key now only lives in Supabase Edge Function secrets as ANTHROPIC_API_KEY.

---

# VIP EMAILS — NEVER REMOVE. EVER. NON-NEGOTIABLE.

These 4 emails get ZERO restrictions. No caps. No limits. No walls. Every feature unlocked. Forever. Store in Supabase table in Phase 2 (NOT hardcoded in client code). Get written consent from all 4 before granting access.
VIP emails should never be hardcoded in client code. They go in a Supabase VIP table, checked on every login.
They get Pro the moment they log in. Never delete. Never change. Never question.

- insuredbyjacek@msn.com (Grace herself)
- zuzia.starz@gmail.com (friend)
- stefka992001@gmail.com (friend)
- jacek9901@gmail.com (friend)

VIP INFRASTRUCTURE COMPLETE (Session 16A/B, 2026-05-23): the `vip_emails` Supabase table exists with RLS; the runtime VIP check fires on every auth event (see pattern below); the bypass paths are wired (wardrobe cap, session limit). VIP emails are NOT hardcoded in client code, web app, or Edge Functions. The 4 VIP emails remain unchanged.

**Runtime VIP check pattern (live since Session 16A/B, 2026-05-23):** the `vip_emails` table is queried on every auth event (mount, SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED) via `.select('email').eq('email', userEmail).maybeSingle()` — a row returned = VIP, null = non-VIP. RLS scopes the SELECT to the user's own email so no enumeration is possible. Fail-safe to non-VIP on any query error. No cross-session caching — fresh check every login.

---

# LANGUAGE RULE — APPLIES EVERYWHERE IN THE APP

NON-NEGOTIABLE. NO EXCEPTIONS. EVER.

Anything VISIBLE TO USERS in the app:
Never say AI. Always say Clozie.

WRONG: AI fills in your details   RIGHT: Clozie fills in your details
WRONG: AI recognised              RIGHT: Clozie recognised
WRONG: Clear AI memory            RIGHT: Clear Clozie's Memory

Tone: warm, friendly, like a knowledgeable friend. Never clinical. Never robotic.

DO NOT change these — they stay as AI:
- Anthropic Claude API (technical reference)
- Claude API reads the image (code section)
- AI COMPONENT section heading (for Claude Code)
- AI Editorial Photos (Elite feature name)
- if AI call fails (technical fallback in code)

---

# FREE PLAN LIMITS — ENFORCED FROM DAY ONE

WARNING: Limits enforced in code from the very first version of the app. Never unlimited. No exceptions.

- 50 wardrobe items maximum
- 12 sessions per week (36 outfits) — rolling 7-day window

Rolling 7-day window: When a user tries to generate, the Edge Function counts their sessions in the last 7 days. If < 12, allow. If >= 12, block and show over-cap error. No cron job, no timezone math.

Session counter only increments on successful API response containing 3 complete outfits. Failed, timed out, or malformed responses do not count.

NUDGE MESSAGES — never a hard wall, always a warm invitation:

At 48 items show: "2 spots left in your wardrobe."
At 49 items show: "1 spot left in your wardrobe."
At 50 items show: "Your wardrobe is full."
At session 9 of 12 show: "3 styling sessions left this week."
At session 11 of 12 show: "1 styling session left this week."
When all 12 sessions used show: "You've used all 12 styling sessions this week. Your earliest session refreshes soon."

OLD PRO NUDGES (keep in code as comments for post-Pro launch — format: // PRO LAUNCH: uncomment below, delete simple version above)

---

# UPGRADE INCENTIVES

Never hide Pro features completely. Show them. Let her see they exist. Then gate the action behind the upgrade.

Key upgrade moments:
- Hits 12 sessions mid-week with big weekend coming
- Wardrobe hits 30 items after shopping
- Planning holiday — sees Trip Planner greyed out
- Seasonal Report shows unworn items — Clear Out is Pro — upgrades to fix it
- Wants to log what she wore — Wear History is Pro — upgrades for the habit

Tone always: warm and exciting. Never guilt-tripping.
"Unlock Trip Planner ✦" — NOT "You can't do this on your plan."

---

# FIRST TIME SETUP — BEFORE BUILDING ANYTHING

WARNING: THIS MUST BE DONE BEFORE A SINGLE SCREEN IS BUILT. NO EXCEPTIONS.

Follow this exact order. Grace approves each step before the next begins.

- Download Claude Desktop — claude.com/download — log in with Anthropic account
- Create project folder on Desktop called: clozie-native
- Put CLAUDE.md and App_ORIGINAL.jsx inside the clozie-native folder
- Connect GitHub FIRST — before anything is built — so all work is saved safely from day one
- Connect Supabase — Grace provides Project URL and anon key from Supabase → Settings → API
- Add Anthropic API key to the project
- Install Expo Go on iPhone from App Store — free
- Only after all of the above is confirmed working — start building screens

---

# CURRENT DESIGN SYSTEM — LOCKED (April 2026)

DO NOT CHANGE any of these unless Grace specifically and explicitly asks.

Colors:
- Background: #E8E4CE
- Cards: #FFFFFF
- Headings: #2C1A0E
- Body text: #5C4A3A
- Buttons: #BCC7B7 sage green with white ring
- Unselected chips: white with border rgba(44,26,14,0.12)
- Logo Clo: #2C1A0E
- Logo zie (welcome): #DC8F68
- Logo zie (inner): #C87A52
- Tab bar active: #A44A34 with dot
- Tab bar inactive: #2C1A0E at 28%
- Eyebrow labels: #A44A34, 700 weight, 11px, letter-spacing 2.5px, uppercase
- App icon background: #E8E4CE app sage
- Back button: #2C1A0E espresso
- Button text on sage `#BCC7B7` buttons: `#2C1A0E` espresso (Apple WCAG AA — Session 19C, May 24 2026; overrides earlier Session 10A/13B 'white text on sage' specs). White rings/borders unchanged. Two small decorative ✓ glyphs (age checkbox, pin-sheet check circle) stay white — classified as decorative.

UI terracotta (eyebrows, vibe tags, active tab): #A44A34 — replaces #C87A52 for text. Logo "zie" stays #C87A52.

Fonts: DM Serif Display (logo, titles, outfit names, tagline — 'zie' always italic) + Outfit (all UI, buttons, chips, labels, body text). Both from Google Fonts.

Rejected fonts — never use: Cormorant Garamond, Playfair Display, DM Mono.

Category tag pill: background rgba(188,199,183,0.30), text #5C4A3A. Unified — all 6 categories use the same sage green pill. No per-category color mapping. Font: Outfit, 11px, weight 500, letter-spacing 0.3px, border-radius 100px, padding 2px 10px.

Warmth tag (None/Light/Medium/Heavy) is NOT displayed on the closet grid card. It is stored on the item data and used by the AI for outfit generation. The user sets warmth when adding/editing an item — it is not visible in the closet browse view.

Screen heading layout: no eyebrow labels above headings. Screen titles stand alone in DM Serif Display. The old pattern of small caps labels (e.g. 'YOUR STYLE DNA', 'YOUR WARDROBE', 'TODAY'S VIBE', 'YOUR LOOKS') above headings is removed. Eyebrow labels are ONLY used inside cards as section labels (e.g. 'STYLES I LOVE', 'WEATHER') — never as screen-level headers.

---

# DECISIONS GRACE STILL NEEDS TO MAKE — DO NOT PROCEED WITHOUT HER INSTRUCTION

These are confirmed open decisions. Do NOT make any of them without Grace explicitly saying so.

- Color scheme: ✅ RESOLVED — sage/cream/espresso palette shipped April 2026. See `# CURRENT DESIGN SYSTEM — LOCKED (April 2026)`.
- Welcome screen redesign: Current design (2 emojis) OR new design with phone mockup (teal/coral) — PENDING — Grace will upload design image when ready
- Phone mockup on welcome screen: Include 160px phone mockup with 2x2 emoji grid — PENDING — only when color decision is made
- Large retailers for Shop For Me: Boutiques only OR add large stores like Zara/H&M later — PENDING — boutiques first, Grace decides later

---

# REBUILD RULE — CRITICAL. READ THIS BEFORE BUILDING ANYTHING.

Clozie is being rebuilt as a React Native app from scratch.
The goal of Phase 1 is to rebuild every screen from the existing web app exactly as it works today — nothing more.
DO NOT add any new features during Phase 1. Not even small ones.
Rebuild first. Confirm with Grace it works perfectly. Add later.

New features — including anything agreed in CLAUDE.md outside Phase 1 — are only added AFTER:
- The screen is fully rebuilt
- Grace has tested it on her iPhone via Expo Go
- Grace has explicitly said "yes this is working, now add X"

Never skip ahead. Never add new things without Grace's permission.
Rebuild first. Grace approves. Then and only then — add agreed features.

---

# TESTING BRANCH RULE — NON-NEGOTIABLE.

ALL native app building happens on a testing branch. Never on main.

- Main branch (THIS repo, `creatormama/clozie.git`) = stale March 2026 Phase 1 snapshot at `062d15b`, nothing watching it. The Vercel-deployed web app at clozie.vercel.app is a SEPARATE repo (`creatormama/clozie-website`) — never touch THAT repo's main. **Live App Store builds live on the `production` branch in THIS repo: currently Build 12 (frozen) at `9d617db`. Update 1 / Build 13 work happens on `testing` and replaces Build 12 only when Apple-approved.** See CURRENT BUILD STATE.
- Native app is built on a separate testing branch from day one
- When an App Store build ships from testing — tag that commit `vX.Y.Z-buildN-appstore-live` (annotated tag, immutable forever) and fast-forward `production` to point at it. Main stays put at the March 2026 snapshot.
- If something breaks on testing branch — revert immediately. The build tag and `production` branch are the immutable safety nets; nothing on testing can damage them.
- This is set up by Claude Code on day one — Grace does not need to do this manually

---

# EDGE FUNCTION DEPLOY POLICY — LOCKED 2026-05-12

NON-NEGOTIABLE. NO EXCEPTIONS.

ALL Supabase Edge Function deploys go via the Supabase CLI from local disk. Never paste into the Supabase dashboard editor.

Command: `supabase functions deploy <function-name> --project-ref sbiwuqjnwjgjazxlyfhb --use-api`

Do NOT add `--yes` — Session 7b-6 isolated it as the cause of a silent first-deploy failure.

Reason — Session 7b-6 (May 11-12, 2026) revealed two clipboard-corruption bugs that silently broke every prior dashboard-paste deploy since at least 7b-4:

- `awk + pbcopy` decoded file bytes as MacRoman, mangling em-dashes (`—` → `‚Äî`, 3 bytes → 7 bytes) and middots (`·` → `¬∑`, 2 bytes → 5 bytes)
- Chat-paste from rendered code blocks truncated content for files >40KB and lost em-dashes

Both pipelines silently corrupted bytes. The deployed function would compile and Sonnet would still produce outfits, but the SYSTEM_PROMPT was garbled. Token-count claims in CLAUDE.md before 2026-05-12 (e.g., "2,267 tokens for v5") were measurements of mojibake-inflated content. The real canonical v5 token count is 2,132.

## Source of truth per function

- **generate-outfits** — `supabase/functions/generate-outfits/index.ts` (created 2026-05-12). README.md is documentation only.
- **recognize-photo** — currently `supabase/functions/recognize-photo/README.md`. Migrate to `index.ts` source-of-truth on next change.
- **delete-user** — currently `supabase/functions/delete-user/README.md`. Migrate to `index.ts` source-of-truth on next change.

## Deploy workflow

1. Edit `index.ts` directly (preferred), OR edit README.md and re-extract typescript via Python binary I/O
2. Verify byte-perfect: em-dash count, middot count, total bytes match expected canonical reference
3. Authenticate: PAT stored in macOS Keychain as `supabase-pat-clozie` (created 2026-05-12, scoped to `/usr/bin/security` only via `-T` flag — no auth dialog on read). Read via: `SUPABASE_ACCESS_TOKEN=$(security find-generic-password -s 'supabase-pat-clozie' -w)`. To rotate: revoke at https://supabase.com/dashboard/account/tokens, generate new PAT, then run `security add-generic-password -U -s "supabase-pat-clozie" -a "$USER" -w "<new-PAT>" -T /usr/bin/security` (the `-U` flag updates the existing entry). Last rotated 2026-06-24 (Update 1 — Session 4) — new Supabase-side token named `clozie-cli-2026-06-24`, expires 2026-12-19.
4. Deploy: `supabase functions deploy <function-name> --project-ref sbiwuqjnwjgjazxlyfhb --use-api`
5. Verify on iPhone — generate, check Supabase logs for cache_creation/cache_read tokens

The Supabase dashboard editor remains fine for VIEWING deployed code. NEVER use it for deploying.

## Cache discipline

The `generate-outfits` Edge Function uses Anthropic prompt caching on its SYSTEM_PROMPT. This pays for itself ~4–4.5× on every cached call within the 5-minute TTL window. The rules to keep it working:

- SYSTEM_PROMPT must stay ABOVE Anthropic's 2,048-token caching threshold. Below 2,048, `cache_control` is silently ignored and every call hits the prompt uncached at full price (the bug Session 7b-4 caught). Current token count is in CURRENT BUILD STATE — never let it drop below 2,048.
- Any edit to SYSTEM_PROMPT invalidates the existing cache. The next call writes a new cache entry (one-time ~$0.009). Subsequent calls within the 5-min TTL read at the cached price.
- After every deploy that touches SYSTEM_PROMPT, verify cache health on iPhone: Call 1 should show `cache_creation_input_tokens` matching new prompt size; Call 2 within 5 min should show `cache_read_input_tokens` with the same number (round-trip proof). Check Supabase Logs (Edge Functions → Logs).
- Supabase dashboard "Code" tab is a STALE EDITOR VIEW, not a live runtime mirror. After a CLI deploy completes successfully, the Code tab may continue showing OLD code — Cmd+F for newly-added constants returns 0/0 even though those constants ARE running at the edge. iPhone behavior + Supabase Logs are the only source of truth. Never trust the Code tab for deploy verification.

---

# WELCOME SCREEN LAYOUT — NATIVE APP

Welcome screen has been redesigned. Full bleed portrait photo, top and bottom gradients, no emojis. See Design Tracker §1.4 for locked spec. Do not match web app.

- ✦ PERSONAL STYLIST ✦ — small, gold accent, letter-spacing 3px, uppercase
- Logo "Clozie" — large, "Clo" cream, "zie" italic gold
- Tagline — italic DM Serif Display, 2 lines: Line 1: Everyone says I have nothing to wear. Line 2: Clozie solves that in 30 seconds.
- Gold pill button: "Next →"
- NOTE: Welcome screen button is 'Next →'. Peek Inside button is '✦ Start Styling — It's Free'. Two different buttons, two different actions.
- "Already have an account? Sign in" — underlined gold link
- No Preview Demo button — removed completely
- No 3 bottom icons — removed completely
- Welcome screen ONLY gets subtle radial gold glow in center
- All other screens — plain solid dark background, NO glow, NO pattern
- ⚠️ Safe area debt: logoBlock top:80 and bottomBlock bottom:60 use fixed values — fix with useSafeAreaInsets when changing Welcome screen photo. The Dynamic Type cap (Update 1 — Session 3, 2026-06-23) MITIGATES the symptom at large text sizes; it is NOT a fix for the underlying safe-area debt and the layout still needs the responsive-layout session.

Flow: Welcome → taps Next → Peek Inside → taps Start Styling → Sign Up
Login link → Login screen directly.

---

# SCREENS — WHAT THEY ARE CALLED AND HOW THEY WORK

This is taken directly from the working web app code. Rebuild each screen to match exactly.

## BACK BUTTON — APPLIES TO EVERY SCREEN THAT IS NOT A MAIN TAB

Espresso #2C1A0E ← arrow. Top left, 44px tap target, every non-tab screen.

## Splash Screen

- Full dark background
- Logo "Clozie" fades in — 72px, "Clo" cream, "zie" italic gold
- "✦ YOUR PERSONAL STYLIST ✦" pulses in gold below
- Auto-advances after 1.8 seconds — no tap needed
- Only shows on first open, not after login

## Welcome Screen

- Dark background with subtle radial gold glow in center
- ✦ PERSONAL STYLIST ✦ — small, gold, letter-spaced
- Logo large — "Clo" cream + "zie" italic gold
- Italic tagline: "Everyone says I have nothing to wear. Clozie solves that in 30 seconds."
- Gold pill button: "Next →"
- "Already have an account? Sign in"
- ⚠️ Safe area debt: logoBlock top:80 and bottomBlock bottom:60 use fixed values — fix with useSafeAreaInsets when changing Welcome screen photo. The Dynamic Type cap (Update 1 — Session 3, 2026-06-23) MITIGATES the symptom at large text sizes; it is NOT a fix for the underlying safe-area debt and the layout still needs the responsive-layout session.

## Peek Inside Screen (How It Works)

TABS ARE TAPPABLE — user taps Step 1 / Step 2 / Step 3 to switch content

- Each tap shows different content card below — this is the main interaction
- Active tab: gold border, slightly lighter background
- Step 1: 📸 'Snap & Add Your Clothes' — shows clothing card with CLOZIE RECOGNISED ✦ label — never AI RECOGNISED
- Step 2: 🌤 'Tell Clozie Your Day' — Pick the weather and your plans. Heading to work? Going out? Weekend errands? Clozie styles you for the moment.
- Step 3: ✨ 'Get 3 Perfect Outfits' — shows outfit card with Mood Board / Hanger View tabs
- Bouncing gold dot on Step 1 tab before user taps anything — disappears after first tap
- Gold pulsing pill: '👆 Tap each step to explore' — MORE VISIBLE than before. Pulses softly 3 times then stays still. Disappears after first tap.
- Navigation dots at bottom — tap to move between steps
- Gold button at bottom: '✦ Start Styling — It's Free'
- "Already have an account? Sign in"

## Auth Screen (Login / Sign Up / Forgot Password)

Three modes: login, signup, forgot

Sign Up screen:
- Heading: "✦ CREATE YOUR ACCOUNT ✦" — small gold, letter-spaced, centered
- "Continue with Google" button — full width, dark card, gold border
- "Continue with Apple" button — full width, dark card, gold border
- OR divider — thin gold lines
- Full name field · Email field · Password field with show/hide eye icon
- "At least 8 characters" — tiny cream text below password
- Password requirement: 8 characters minimum ONLY — no other rules
- Age checkbox: "I am at least 13 years old" Unchecked = cannot create account.
- Gold pill button: "Create Account →"
- "Already have an account? Sign in"
- Error messages — warm gold text directly below relevant field:
  - Empty name → "Please tell us your name"
  - Invalid email → "That email doesn't look right — please check it"
  - Password too short → "Password needs at least 8 characters"
  - Email exists → "An account with this email already exists — try signing in instead"

Login screen:
- Heading: "✦ WELCOME BACK ✦" — small gold, letter-spaced, centered
- "Continue with Google" button
- "Continue with Apple" button
- OR divider
- Email field · Password field with show/hide eye icon
- "Forgot password?" — right-aligned, gold underlined, CLEARLY VISIBLE — never tiny grey text
- Gold pill button: "Sign In →"
- "Don't have an account? Sign up"
- Wrong credentials → "Email or password doesn't match — please try again"
- Empty fields → "Please enter your email and password"

Forgot Password screen:
- Heading: "✦ RESET YOUR PASSWORD ✦"
- "Enter your email and we'll send you a reset link"
- Email field only
- Gold pill button: "Send Reset Link →"
- After tapping: "Check your email — We've sent a reset link to [her email]"
- "← Back to Sign In"

All error messages in warm terracotta Outfit font — below the relevant field — never aggressive red

## Post-Login Welcome Screen

- Shows once for new users only, after first sign up
- "Welcome to Clozie" heading
- "The more you use Clozie, the better she knows you"
- Gold button: "Let's Start"
- Goes to main app

## Main App — Four Tabs (bottom navigation)

Tab 1: My Style (star SVG)   Tab 2: My Closet (hanger SVG, shows item count)   Tab 3: Today's Vibe (sun SVG)   Tab 4: My Looks (mirror SVG)

Landing screen behaviour (locked Update 1 — Session 1, 2026-06-21; returning users → Today's Vibe, Update 2 — Session 3, 2026-07-04):
- New signup → PostLoginWelcomeScreen → **My Style** tab (so they go through the style profile flow first).
- Returning user explicit Sign In → **Today's Vibe** tab.
- Returning user cold launch with auto-resumed session → **Today's Vibe** tab.
- Tab switching after landing is fully under the user's control via the bottom tab bar.

## My Style Tab (was 'profile' in code)

- "Takes 30 seconds · The more you share, the better your outfits ✦" — subtitle below heading
- UX note: must feel like a fun quick quiz — not a form. Exciting, not homework.
- Card: STYLES I LOVE — tag chips: Minimalist, Streetwear, Classic, Bohemian, Sporty, Romantic, Edgy, Business
- Card: MY COLOUR PALETTE — tag chips: Neutrals, Earth Tones, Bold Colors, Pastels, Monochrome, Black & White, Warm Tones, Cool Tones
- Card: I NEVER WANT TO WEAR — text input
- Chip states: Unselected: dark card + gold border / Selected: gold background + dark text / Tap animation: slight scale pulse
- If no ratings yet: "Rate your first outfit and Clozie will start learning your taste"
- If ratings exist: "What Clozie has learned about your style (X ratings)" — shows last 4 notes
- Gold button: "Build My Closet →"
- Skip link below button

## My Closet Tab (was 'closet' in code)

- Item count in gold top right e.g. "12/50 items" (non-VIP); VIPs see plain "12 items" with no denominator
- Gold progress bar below header showing items used
- Bar turns amber at 25+ items
- Nudge at 25+: "5 spots left in your wardrobe."
- Empty state: closet emoji, 'Every great wardrobe starts with one piece. Add your first item and let's see what Clozie can do ✦'
- Progressive empty state — 3 states: (1) Empty closet: warm encouragement to add first item. (2) Under 5 items: 'Add X more items for your first outfits ✦'. (3) 5+ items: Generate button activates.
- Items shown in 2-column grid

Each item card:
- Real photo fills the card top
- ✎ pencil icon (edit) top right corner of photo — 44px minimum tap target
- × delete icon top right corner of photo (next to pencil) — 44px minimum tap target
- When × delete tapped — confirmation required: 'Remove [item name]? This cannot be undone.' [Gold button] Remove · [Outlined button] Cancel
- Unified sage green category tag pill below photo — same color for all 6 categories (Tops, Bottoms, Dresses, Outerwear, Shoes, Accessories). Background: rgba(188,199,183,0.30), text color: #5C4A3A. One pill style for all categories — no per-category color mapping.
- Item name in DM Serif Display — espresso #2C1A0E, prominent
- Color description below name in Outfit — body text #5C4A3A
- Last worn date below color — small, muted — e.g. 'Last worn: March 15' or 'Never worn'
- 'What goes with this?' — small gold link below last worn date — HIDDEN for Apple review. Build TouchableOpacity + overlay in Phase 2.

When 'What goes with this?' tapped: full screen overlay slides up. Shows ALL wardrobe items that pair well. Her wardrobe ONLY — never boutique suggestions. Does NOT count toward weekly generation limit. Warm message. Close × top right — gold — 44px tap target.

Add Item panel:
- Photo section with dashed border — TWO SEPARATE BUTTONS: 📸 Take Photo (opens camera) and 🖼 Upload File (opens photo library)
- While scanning: gold spinning ✦ + 'Clozie IS READING YOUR ITEM...' pulse animation
- After photo: gold shimmer bar + 'Clozie IS SCANNING YOUR ITEM...'
- After scan: green ✅ bar + 'Clozie filled in your details — check and edit below!'
- If no key: grey bar + 'No Clozie key — fill in details manually'
- Tip box — always visible, NOT dismissable: '💡 Best results: photograph on a white or light background — Clozie reads colours more accurately.'
- Upload tip — always visible, not dismissible: 'Upload clothing and accessories only.' Styled in Outfit font, body text color (#5C4A3A), 11px.
- Fields: Name (required), Category dropdown, Colour/pattern, Notes
- Fields highlighted in gold when Clozie has filled them in
- "Add to Closet" button — disabled while scanning
- Cancel button

"Analyse My Wardrobe" button — gold outline, below the item grid. When tapped: slides up as card overlay — not a new screen. Maximum 3 warm Clozie observations. Gold button "Got it ✦" to dismiss. HIDDEN for Apple review. Wire to Haiku with caching in Phase 2.
"Set Today's Vibe →" gold button at bottom of wardrobe — navigates to Today's Vibe

## Today's Vibe Tab (was 'context' in code)

- "Pick your weather and occasion — Clozie does the rest." — subheading below. Outfit font 13.5px, #5C4A3A. No sparkle.
- Personalized greeting at top: 'Good morning, [Name] ✦' (or afternoon/evening based on device time). Falls back to 'Good morning ✦' if no name. DM Serif Display, espresso #2C1A0E. This IS the heading — not an addition above it.
- Shows closet count badge: "Styling from X items in your closet"
- Card: WEATHER OUTSIDE — Two-row weather input. Row 1 — Temperature: Cold / Cool / Warm / Hot. Row 2 — Condition: Sunny / Cloudy / Rainy / Snowy. User selects one from each row. Both required before Generate button activates.
- Card: THE OCCASION — tag chips: Casual Day, Work / Office, Going Out, Formal Event, Outdoor / Sport, Weekend Errands, Travel
- 'I'll be indoors' toggle below occasion chips. When ON: skip heavy outerwear suggestions, relax warmth constraints. AI uses the Occasion chip and Brief to decide whether occasion layering (blazer, jacket) is still appropriate indoors.
- Card: MUST INCLUDE ITEM — Label (2 lines): Line 1 'Something in mind? Pin it — Clozie builds around it.' Line 2 'A jacket, a dress, those new shoes.' User sees wardrobe thumbnails in horizontal scroll. Tapping highlights in gold. Tapping again deselects.
- Brief field — 'Tell Clozie more' text input. Placeholder: 'Tell Clozie more — which jacket? office is cold, dinner out, no heels today…' When the Brief describes a specific context more precise than the Occasion chip, it outranks the chip and defines the aesthetic direction.
- Brief field spec: Height 72px fixed (2 visible lines). Font: Outfit 14px, placeholder 13.5px. Background: #FAFAF6. Border: 1.5px rgba(44,26,14,0.12), border-radius 10px. Focus: border #BCC7B7 + box-shadow. Padding: 14px. Character limit: 150. Counter: bottom-right, 11px, #A09888, turns #C87A52 at 130+.
- Gold pill button sticky: "✦ Generate My Outfits →" — greyed out until weather AND occasion both selected
- Hint text shown below when greyed: "Select weather and occasion first" — disappears when button activates

WARNING: Every generated outfit MUST include the pinned item — no exceptions. Clozie cannot skip or replace it.

WARNING: Clozie does not use any weather API, GPS, or location service. Weather input is fully manual. This is a locked decision (April 17, 2026).

- Empty wardrobe state: when wardrobe has 0 items, the tab shows a centered empty state with message "Add a few pieces to your closet first — Clozie will do the rest." and a sage "Go to My Closet →" button. The full weather/occasion/Brief/Generate UI is hidden until at least one item exists in the wardrobe.

## Your Looks Tab (was 'outfits' in code)

- "Your Looks" heading
- Empty state: 'No outfits yet ✦' 'Head to Today's Vibe, tell Clozie about your day, and she'll create your perfect looks.' [Gold pill button] Go to Today's Vibe →
- Loading state: Spinning gold ✦ 'Styling your outfits...' 'Clozie is working her magic ✦'

Each outfit card:
- Photo strip at top — 2-column grid of item photos with names
- VIBE label in gold (e.g. ROMANTIC)
- Outfit name in DM Serif Display (e.g. 'Evening Glow')
- "94% match with your style profile" — small gold text below outfit name — HIDDEN for Apple review, unhide when real calculation exists
- "These N pieces create N×4 outfits together" — small muted text below score — HIDDEN for Apple review, unhide when real logic exists
- "View mood board" gold link
- Item chips showing each item with thumbnail photo
- Italic description from Clozie
- Outfit card button hierarchy (confirmed):
  - Row 1: ♡ Save + 'I wore this today' (equal pills, side by side).
    - Save: "🤍 Save" / "❤️ Saved" — border colour changes when saved.
    - 'I wore this today': saves today's date to Supabase against every item in this outfit. Button changes to '✓ Worn today' for a few seconds.
  - Row 2: rating pills (Love it / Like it / Not for me).
    - Selected pill fills, others stay outlined.
    - After rating: '✦ Thanks! Clozie is learning your taste' fades in, disappears after 2 seconds.
  - Row 3: Share Outfit (primary sage green).
    - Shares outfit card with Clozie watermark via native share sheet.
    - Pre-written caption: "Styled by Clozie. Wear it or not?"
  - Row 4: Clozie's Pick (terracotta outline). HIDDEN for Apple review.
    - Goes straight to ONE boutique suggestion — photo, item name, price, store name, 'Shop Now →' button.
    - One suggestion only — never a list. Boutique stores only — never large retailers.
    - If no boutique connection yet — shows "Boutique partners coming soon" — HIDDEN for Apple review.

Bottom of screen — two buttons side by side:
- Left: 🔄 Regenerate — dark square outlined button
- Right: "Save Feedback & Style Again →" — large gold filled button
- Save Feedback button is disabled until at least one outfit is rated

## Mood Board / Hanger View Screen (modal overlay)

- Opens as full-screen modal overlay — dark semi-transparent background
- Header: vibe label + outfit name + ✕ Close button
- Two tabs: 🖼 Mood Board — 'Photos side by side' / ✦ Hanger View — 'Styled together'
- Mood Board tab: shows item photos in grid — 1 column for single item, 2 columns for multiple

Store Suggestions section inside Mood Board:
- Clozie shows boutique items matching the saved outfit
- User taps item → goes directly to boutique website to buy
- Boutiques only — never large retailers
- FREE feature

Hanger View tab:
- Items displayed on a closet rod with hook + hanger, stacked top to bottom
- Order: Top / Dress → Bottom → Shoes → Accessories
- Item list below hanger display with gold dots
- See full Hanger View spec below

## Saved Outfits Screen

- Accessed from header "❤️ Saved (X)" button
- "Saved Outfits" heading
- "X saved looks"
- "Tap an outfit to see the mood board"
- Each saved outfit shows photo strip + vibe + name + item chips + Remove button
- Tap any outfit to open Mood Board modal
- When Remove tapped — confirmation required: 'Remove [outfit name] from your collection? This cannot be undone.' [Gold] Remove [Outlined] Cancel
- Empty state: [Large gold ♡] 'Your saved looks will live here' 'Generate outfits and save the ones you love.' [Gold pill button] Generate My First Looks →

## Clear Out Screen (PRO)

- Accessed from My Closet tab — '✦ Clear Out My Closet' button below the item grid
- "Time for a refresh ✦" heading
- "These pieces haven't been worn in 6 months or more"
- "X pieces ready to clear out ✦"
- Each item shows: photo, item name, category, last worn date, and three buttons: Sell · Donate · Swap
- Sell — Clozie writes a selling description the user can copy straight to Vinted, Facebook Marketplace, or anywhere else
- Donate — generates a shareable donation card with item photo, name, size, and condition. User shares via WhatsApp, iMessage, or anywhere. No GPS, no location services, no maps API.
- Swap — moves item to the Clothes Swap list
- PRO feature only — free users see upgrade prompt

## Clothes Swap Screen (PRO)

- PRO feature only
- Shows all items the user has marked as available to swap
- Each item shows: photo, name, size, Share button, Remove from swap button
- Swap card is shareable via WhatsApp, iMessage, anywhere
- "Styled by Clozie ✦ Find us in the App Store" — watermark on every swap card
- Empty state: 'No items marked for swap yet ✦'

## Trip Planner Screen (PRO)

- PRO feature only
- Destination field — user types where they are going
- Date picker — from date and to date
- Activities — user selects all that apply: Beach · Hiking · City exploring · Formal dinner · Business meetings · Sport · Casual days · Nights out
- User provides weather conditions manually per day using the same two-row chip format (Temperature + Condition). No weather API, no location lookup.
- Generates one outfit per day from the user's actual wardrobe
- Each day shows: date, weather that day, outfit photos
- Clozie suggests what is missing from their wardrobe for that specific trip
- Shareable packing list card at the bottom with Clozie watermark
- Empty state if wardrobe has fewer than 5 items: warm message encouraging user to add more pieces first

## Privacy Policy Screen

- Accessed from the very bottom of Settings screen
- Plain dark screen — Clozie logo at top
- "Privacy Policy" heading in gold
- Plain text: what data Clozie collects, how it is used, Supabase storage, no selling of data to third parties
- Last updated date shown at bottom
- hello@clozie.net contact email at the bottom
- No buttons — scroll only
- WARNING: Must be built before Phase 3 App Store submission — required by Apple

## Settings Screen

- ← Back button + Clozie logo in header
- "SETTINGS" label in gold
- "Your Account" heading — "Your" normal weight, "Account" italic gold

ACCOUNT card:
- Name + email displayed, 'Edit Profile' gold link on right
- Subscription row: 'Subscription / Free Plan' + 'Upgrade ✦' gold link

EDIT PROFILE panel (slides in inline when Edit Profile tapped):
- 'EDIT PROFILE' label + × close button top right
- 'Your Name' label + editable name field
- 'Email' label + email field (disabled) + 'Email cannot be changed' note
- 'Save Changes' gold button + 'Cancel' dark button side by side

PREFERENCES card:
- 'Daily outfit notifications' toggle — 'Get styled every morning · coming soon'

DATA card:
- 'Clear Clozie's Memory' — 'Reset learned preferences' + gold 'Clear' link
- When tapped — warning: 'This will reset everything Clozie has learned about your taste. Are you sure?' [Gold] Yes, reset [Outlined] Cancel
- 'Change password' — 'Update your password' + gold 'Update' link

CHANGE PASSWORD panel:
- Current Password field / New Password field / Confirm New Password field
- 'Update Password' gold button + 'Cancel' dark button side by side

ABOUT card:
- 'Clozie' — 'Version 1.0 — Your personal stylist' + v1.0 on right
- 'Delete Account' — outlined red button
- When tapped — warning screen listing everything permanently deleted. Input field: 'Type DELETE to confirm'. TWO confirmation steps minimum — never one tap.
- "Sign Out" — red outlined button at very bottom of page

## Subscription Screen

Accessed from Settings → Upgrade ✦ link OR from upgrade prompt when free limit hit.

HEADER:
- ← Back button + Clozie logo
- "✦ PLANS & PRICING ✦" label in gold
- "Choose Your Plan" heading
- "Simple, honest pricing. No surprises." subtext in Outfit

FREE CARD (shown first — always visible):
- ✓ Up to 50 wardrobe items
- ✓ 12 sessions per week (36 outfits)
- ✓ Clozie styling + learning
- ✓ Saved favourites
- ✓ style profile
- ✓ 📸 Clozie photo recognition
- ✓ Share outfits with friends
- ✓ Log what you wore — track your week
- ✓ Clozie's Pick — one boutique suggestion per outfit — HIDDEN for Apple review
- ✓ Store suggestions in Mood Board
- ✓ Wardrobe Intelligence — Analyse My Wardrobe — HIDDEN for Apple review
- ✓ Style Match Score + Outfit Potential on every outfit — HIDDEN for Apple review
- ✓ What Goes With This — tap any item to see pairings — HIDDEN for Apple review
- "✓ Your Current Plan" grey outlined button (disabled — not tappable)

PRO CARD — Coming Soon:
- "✦ PRO — Coming Soon"
- $6.99/month · $67.99/year
- Everything in Free, unlimited, plus:
- Unlimited wardrobe items
- 10 styling sessions daily
- Smarter wardrobe tools
- Plan ahead features
- Exclusive Pro perks
- [Gold pill button] "Notify Me When Pro Launches ✦" — Supabase saves email and notify_pro flag
- Confirmation: "✦ You're on the list! We'll let you know the moment Pro is ready."

ELITE CARD — Coming Soon:
- "✦ ELITE — Coming Soon"
- $9.99/month · $95.99/year
- Everything in Pro, plus: 📸 Photo Outfit Matching 🛍️ Shop For Me ✦ And more exciting features coming
- WARNING: DO NOT list all Elite features — keeps flexibility
- [Outlined gold button] "Notify Me When Elite Launches ✦"

FOOTER: 'Secure payment · Cancel anytime · No hidden fees'

WARNING: When Stripe is live — rebuild this screen with real pricing and feature lists. Grace will decide exact wording when ready.

---

# WHAT IS BUILT IN WEB APP — MUST BE REBUILT IN NATIVE

Every single one of these must be in the native app:

- Full AI outfit generation — 3 outfits from user's own wardrobe
- Smart filtering — weather, occasion, heels/sneakers/dress rules
- Must Include Item — lives in Today's Vibe screen
- Clozie learns from ratings
- style profile (always use 'Your Style')
- Saved favourite outfits
- Mood Board tab
- Hanger View tab — items displayed on closet rod/hanger, top to bottom
- Clozie Photo Recognition — camera AND gallery both work
- Take Photo button + Upload File button — both must work
- Gold shimmer scanning animation while Clozie reads the photo
- Green bar shown when Clozie successfully fills in the item fields
- CLOZIE RECOGNISED ✦ label when recognition completes
- Peek Inside screen — with bouncing dot on Step 1 tab + gold pulsing pill hint
- Splash screen — auto-advances 1.8 seconds
- Stay Logged In
- Supabase cloud saving — Supabase is the ONLY storage. No localStorage at all.
- VIP free Pro access for 4 emails listed above
- Post-login welcome screen (new users only)
- Subscription page with teaser cards
- Edit Profile panel in Settings
- Change Password panel in Settings
- Unified sage green category tag pills — same color for all categories. Background: rgba(188,199,183,0.30), text: #5C4A3A.
- Edit button (✎) for each wardrobe item — 44px tap target
- Empty wardrobe encouragement
- Outfit generation works with as few as 5 items
- Last worn date shown on each item card
- "I wore this today" button on each outfit card — saves date to Supabase for every item in that outfit

---

# WHAT IS NEW IN NATIVE — NOT IN WEB APP

These are built fresh — exactly why we switched:

- Native share sheet — sharing WORKS on iPhone + Android (was broken on web)
- Save to camera roll — works properly in native
- Storage fixed from day one — Supabase auth, no localStorage bug
- Clozie smarter from day one — built correctly this time
- Outfit Wear History — 'I wore this today' saves date, shown on item cards. Your Week calendar pill on Your Looks (📅) shows a recap of which outfits she wore each day this week (Session 20)
- Complete The Look — straight to boutique, no wardrobe check, earns commission
- Store Suggestions in Mood Board — boutique items matching saved outfits
- Wardrobe Intelligence — Analyse My Wardrobe
- Style Match Score + Outfit Potential on every outfit card
- What Goes With This — from My Closet tab
- Outfit Sharing with watermark
- Trip Planner
- Clear Out
- Clothes Swap
- PhotoRoom — AFTER Stripe is live

---

# BUGS FROM WEB APP — FIX IN NATIVE FROM DAY ONE

Login data bug — wrong user's data loaded on shared devices
Fix in native: Use Supabase auth session properly from day one. No localStorage at all. Every piece of data is keyed to the user's Supabase session, not to the device.
✅ FIXED 2026-05-03 (v2026-05-03-supabase-auth-session1) — real Supabase auth wired for Sign Up + Sign In. Sessions persist via AsyncStorage (Supabase's native RN pattern, not browser localStorage). Settings reads logged-in user from session — no hardcoded values.
✅ EXTENDED 2026-05-07 (v2026-05-07-supabase-wardrobe-session6a) — wardrobe items now persist in Supabase wardrobe_items table with user_id RLS. Photos live in private wardrobe-photos Storage bucket scoped per-user via storage.foldername RLS. No localStorage anywhere in the wardrobe flow.

Name does not survive logout — reverts to email on next login
Fix in native: Always pull user's name from Supabase profile table on every login. Never rely on cached local data for the user's name.
✅ FIXED 2026-05-03 (v2026-05-03-supabase-auth-session1) — Settings reads full_name from user_metadata on every open. Edit Profile → Save persists to Supabase via auth.updateUser, so the name now survives sign-out.

---

# KNOWN ISSUES — ADDRESS IN FUTURE POLISH SESSIONS

Rough edges that don't block current work but should be cleaned up before Phase 3 (App Store submission). Add new entries here when bugs are discovered but deferred.

- Wardrobe items loading delay — on first login, My Closet sometimes appears empty until the user navigates or interacts with the app, then items reappear. Timing/loading issue, not data loss. Items are persisted correctly in Supabase. Address in a future polish session. Session 10B Step 6 (2026-05-17) read-only investigation diagnosed a related symptom — "sometimes 1-2 items don't appear after upload" — as a race between initial MainAppScreen `loadItems` useEffect (App.js:5858-5893) and `handleAddItem` optimistic prepend (App.js:1137). If the user adds an item during the 200-800ms load window, the load's `setWardrobeItems(itemsWithUrls)` at App.js:5875 (hard replace, not merge) arrives AFTER the optimistic `setItems(prev => [newItem, ...prev])` and wipes the prepend. The item IS in Supabase but missing from in-memory state until next reload. Recommended fix: merge-by-id in the loadItems setter, preserving any local-only items not present in the DB fetch. Both symptoms (empty-flicker on first login + intermittent missing items after upload) are likely facets of the same load-timing architecture and should be addressed in a single dedicated session.
- Call 2 cache write curiosity in `generate-outfits` Edge Function — every cached call shows a small `cache_creation_input_tokens` (~270 tokens) alongside the expected ~2,267 `cache_read_input_tokens`. Our code declares only ONE `cache_control` breakpoint (on the system prompt), so only the system prompt should be cached. The extra ~270-token cache write appears to be Anthropic auto-extending the cache into portions of the user message even without an explicit breakpoint. First observed Session 7b-4 (2026-05-10). Cosmetic — does not block system-prompt caching, just means there's a separate small cache layer for the user message we're not deliberately controlling. Possible future optimisation: add explicit `cache_control: { type: 'ephemeral' }` to the user message content block too, to make this behavior deliberate rather than accidental. Not urgent — flagging only because it surfaced during caching verification.
- `warmth` column NULL on every wardrobe item — DB column exists (Session 6A), helper layer (`wardrobeItems.js`) supports read/write, but no UI was ever built in Add/Edit Item to set it (deferred from Sessions 6A and 6B). Photo recognition does not detect warmth either. Consequence: the C1 Cold, C2 Hot, and C5 Indoor safety filters in `generate-outfits` are DORMANT — they never match anything because every item's `warmth` is NULL. C3 Rainy and C4 Snowy still work (name-pattern based). Surfaced 2026-05-10 (Session 7b-5). Fix needs a dedicated warmth session — design decisions required (chip set vs dropdown in Add Item panel, required vs optional, default to Medium vs blank, AI-detection in `recognize-photo` vs user-only, heuristic SQL backfill of existing items vs leave NULL). Not blocking — dormant filters cost nothing at runtime. Activates with zero Edge Function code change the day warmth gets populated.
- Supabase dashboard "Code" tab is a STALE EDITOR VIEW, not a live runtime mirror. After a successful CLI deploy (`supabase functions deploy generate-outfits --project-ref sbiwuqjnwjgjazxlyfhb --use-api`) with `Last deployed` timestamp updating to "a minute ago", the Code tab still shows OLD code — Cmd+F for newly-added constants returns 0/0 even though those constants ARE running at the edge. iPhone behavior + Supabase Logs (Edge Functions → Logs) are the source of truth for deployed Edge Function code. Surfaced 2026-05-13 (Session 7b-6 cleanup). NEVER use the dashboard Code tab for deploy verification.
- Dislikes filter log line not appearing in Supabase Logs — `console.log('[generate-outfits] dislikes filter dropped ${before - filtered.length} items (tokens: ${tokens.join(', ')})')` statement added in Session 7b-7 inside `applySafetyFilters`. iPhone behavior confirms the filter IS dropping items (chiffon, cotton, leather, boots all filter correctly across multiple test calls), but the log line never appears in the Supabase Edge Function Logs tab. Other log lines from the same function (cache usage, success messages, other filter drops) DO appear normally. Possibly a log buffer flush issue or template-string formatting quirk in the Deno runtime. Not blocking — filter works in production; just no visibility into how many items dropped per call. Investigation in a future polish session.
- Dislikes filter false-positive escape — `Leather Chelsea Boots` escapes when user types `leather` as a dislike token. Surfaced 2026-05-14 (Session 7b-7 iPhone test). Working theory: substring match against `name + colour` succeeded structurally but `colour` field on that item probably stores `Black` or similar rather than `Leather Black`, so neither name (`Leather Chelsea Boots` does contain `leather` though — needs deeper investigation) nor colour matched. Investigation deferred to a polish session. Not blocking — minor edge case.
- Optimistic local update for "Last worn" date after `handleMarkItemsWorn` not wired. The `formatLastWorn(iso)` helper (Session 9H, 2026-05-16) now renders the date cleanly as "Last worn: May 16" once items load from the DB — but tapping "I wore this today" on an outfit only updates the DB; the local `wardrobeItems` state stays stale until sign-out/in or fresh launch. Surfaced 2026-05-16 (Session 9H). Fix needs `setWardrobeItems(prev => prev.map(...))` injection in `handleMarkItemsWorn` to bump `lastWorn` + `times_worn` on matching items optimistically. Not blocking — DB is correct, only UI refresh delayed. Polish session. ✅ RESOLVED 2026-05-23 (Session 19B) — fixed in App.js only via two surgical edits. handleMarkItemsWorn restructured from `.catch()` to `.then().catch()`; on Supabase success, runs `setWardrobeItems((prev) => prev.map((item) => itemIds.includes(item.id) ? { ...item, lastWorn: now } : item))` with `now = new Date().toISOString()`. handleClearMemory (Session 19A) gained a one-line `setWardrobeItems((prev) => prev.map((item) => ({ ...item, lastWorn: null })))` inserted between `await clearClozieMemory()` and the existing six state resets. Both fixes preserve the failure-path contract — Supabase error → local state not mutated → UI stays consistent with DB. `times_worn` deliberately NOT bumped locally (not exposed in `rowToItem`, no UI consumer). Verified end-to-end on iPhone — "I wore this today" surfaces today's date on My Closet cards instantly; Clear Clozie's Memory resets all cards to "Never worn" instantly. Edge Functions NOT touched, cache stays at 2,442 tokens, zero CLI deploys.
- Saved outfits do not survive app reload (Session 9C Step 5 deferred to Session 12). The `outfit_history` table correctly records every save with `saved=true` + `saved_at`, but the Saved Outfits modal at App.js:3057-3058 still filters the current-session `outfits` array by ID. After app reload, `generatedOutfits` empties and the saved outfit disappears from UI even though its DB row still has `saved=true`. Explicit Step 5 deferral — Session 12 will lift `savedOutfits` to MainAppScreen + load from DB via `fetchSavedOutfits()` + resolve `item_ids` against the current `wardrobeItems` state. The helper API is already written; only the wiring remains. (Mood Board polaroid placeholders and Hanger View `item.image` mismatch were resolved separately in Session 9D/9E on 2026-05-16.)
- Add Item / Edit Item X button inconsistent — the X close button on the Add Item and Edit Item panels ([App.js:1710](App.js:1710)) does not always close the panel reliably. Sometimes it closes correctly; other times the panel stays open. When it fails to close cleanly, the sticky "Set Today's Vibe →" bar at the bottom of My Closet disappears and only comes back on scroll or the next panel open. The Cancel button at the bottom of the panel ([App.js:1877](App.js:1877)) always works correctly and does not produce the bar-disappearing symptom. Surfaced 2026-05-17 during Session 10B testing. Working hypothesis (Session 10B read-only diagnosis): KeyboardAvoidingView layout race — when the keyboard is up at the moment X is tapped, KAV's bottom edge is still keyboard-adjusted when the sticky bar (position absolute, bottom 86 iOS / 70 Android) re-mounts via the `!showAddPanel` gate at App.js:1953, so the bar's computed screen position lands offscreen until a subsequent layout pass (scroll, next remount) corrects it. Floating + button at bottom 150/134 shares the same gate and may also be affected but hasn't been observed in this configuration. Two candidate fixes: cheap (call `Keyboard.dismiss()` in the X handler before `setShowAddPanel(false)`) or proper (move floating + and sticky bar OUTSIDE the KeyboardAvoidingView into a sibling absolute-positioned layer). Root cause needs investigation in a future session. Not blocking — bar reappears on scroll. ✅ RESOLVED 2026-05-18 (Session 13A) — fixed via the "cheap" candidate fix flagged in the original entry: `Keyboard.dismiss()` added to all four close sites (X, Cancel, handleAddItem save-success, handleSaveEdit save-success) so the keyboard slides down before `setShowAddPanel(false)` runs, letting the KAV layout settle before the sticky vibe bar re-mounts. Combined with Session 13A Fix 3B (X swapped to left of heading), the X button is now both reliable and far from the gear icon. Both reported symptoms (X intermittently not closing + sticky bar disappearing) resolved.
- Tapping outside the Add Item panel (on the closet grid above) scrolls to the top of the closet but does NOT close the panel. The panel stays open off-screen below. The sticky vibe bar and floating + button are hidden (correctly — gated by !showAddPanel). User must scroll back down to find the panel and close it with X or Cancel. Fix: either close the panel on outside tap, or convert the Add Item panel to a modal slide-up sheet (Open Issue #8). Not blocking submission.
- Hanger View dress layout still has awkward empty gap below the dress. Dress outfits render the dress in `hangerSlotTop` (140×158 at y:96), pants slot empty (categorisation correctly nulls pants when dress exists), shoes at y:455 — small dress floating at top with a huge empty middle. Session 13C attempted a fix (new `hangerSlotDress` 170×380 at top:80 + `hangerSlotShoesDress` 125×95 at top:470 + dress-aware JSX branch) but reverted on iPhone test after side-card overlap (~29px of dress left edge covered by the bigger outerwear card) read poorly. Needs a clean design pass that handles dress sizing + side-card sizing + headless outfit fallback (Fix 2 + Fix 5 + Fix 6 from the Session 13C brief) in one coherent session. Working values from the reverted attempt for future reference: dress slot 170×380 at top:80, dress-layout shoes 125×95 at top:470. Surfaced + reverted 2026-05-19 (Session 13C). ✅ RESOLVED 2026-05-19 (Session 13D) — fixed via a different sizing strategy than 13C's attempt. New `hangerSlotDress` at 185×320, top:88, with `alignItems:'center'` + `justifyContent:'flex-start'`, paired with a new `hangerImageDress` style at `width:'100%', height:'88%'`. The combination is the actual fix — 13C used `hangerImage` (width:100%/height:100%) which gave `contain` a full-size box to center within; 13D shrinks the Image's height bounds to 88% so parent flex-start has something to anchor. Shoes positioned at `DRESS_SHOES_TOP = 418` (10px gap below dress hem at y=408) via inline style override on `hangerSlotShoes` — base style untouched for non-dress outfits. Mid-session experiment (top:82/height:355/shoes:445) tried, iPhone-tested, reverted; first version locked. Side-card overlap concern flagged in the original 13C entry (~29px overlap with outerwear card when 13C used 170-wide) may or may not still apply at 185-wide — not verified in 13D testing, flag for a focused outerwear-positioning session if it surfaces; not blocking dress-layout-itself sign-off.
- Sonnet sometimes generates outfits with two bottoms and no top — e.g. midi skirt + pants + earrings + sneakers, or bottoms + accessories + shoes with no top. Edge Function prompt issue — the structural rule "an outfit needs exactly one bottom OR one dress, plus a top OR dress" is in the cached SYSTEM_PROMPT v5 but not always enforced by Sonnet. Surfaced 2026-05-19 (Session 13C). Needs a dedicated Edge Function prompt-tuning session — CLI deploy via `supabase functions deploy generate-outfits --use-api`. Cache discipline: prompt additions over the 2,375-token plateau will reset the cache write cost. Not blocking — JS Smart Fallback (Session 7C) and safety filters (Session 7b-5) catch most edge cases, but the dress-vs-bottoms structural rule needs tightening in the prompt. Session 13E (2026-05-19) added a CLIENT-SIDE visual fallback: when no top/dress exists in the outfit, the Hanger View now promotes outerwear to the centre top slot (App.js:3599-3612 `directTop`/`sideOuter` derived pattern) so the hanger isn't visibly headless. The underlying Edge Function prompt bug is still open — Sonnet shouldn't generate the malformed outfit in the first place; the headless promotion just stops it looking broken in Hanger View when it does slip through. ✅ RESOLVED 2026-05-23 (Session 17F) — three-layer fix. Layer 1 (prompt): SYSTEM_PROMPT Rule 13 explicitly forbids the failure modes ("Every outfit MUST include at least one Top or one Dress. ... Never output two Bottoms in one outfit. Never output an outfit built from only Accessories, Bottoms, and Shoes"). Layer 2 (server-side validation): three checks after `validateAndMapOutfits` scan each outfit's items via `itemById = new Map(items.map(i => [i.id, i]))` lookup. Check 1 — any outfit with zero Tops AND zero Dresses gets positionally replaced from a single `buildSmartFallback(fallbackPool, pinned, occasion)` call (`source` stays 'sonnet' unless all 3 replaced). Check 3 — any outfit with more than one Bottom gets deduped, keeping the pinned Bottom if user pinned one (preserves `validateAndMapOutfits` line 714 pinned-item contract) else the first encountered; rest removed via Set-filter. Check 2 — any outfit with > 6 items has Accessories trimmed to fit (Tops/Bottoms/Dresses/Outerwear/Shoes all kept). All three checks are pure mutations to `mapped[i].items` arrays; never crash; never block the user. Layer 3 (client-side defense of last resort): Session 13E Hanger View outerwear-promotion fallback stays in place — if both Layer 1 and Layer 2 somehow fail, the client still renders a structurally clean hanger. End-to-end iPhone verified across multiple test generates — zero `structural fix:` log lines fired on healthy wardrobes (Layers 1+2+3 all dormant as designed), validation nets cost nothing at runtime when Sonnet behaves.
- Message 4 (Supabase outage escalation to "Something's not quite right on Clozie's end. Please try again in a moment.") deferred from Session 14B (2026-05-21) to Phase 2 polish. The 4-message offline copy spec called for a shared global counter incrementing on non-network Supabase failures across all surfaces (handleGenerate, handleAddItem, handleSaveEdit, runRecognition), escalating to Message 4 wording after the 3rd consecutive failure, resetting on any success. Counter would live in `useRef` in MainAppScreen with `recordSupabaseFailure()` + `resetSupabaseFailures()` helpers passed as props to WardrobeTab. New `'supabase-down'` recognition bar state would render Message 4 inline in the Add Item panel; Your Looks empty state would render it for Generate failures. Deferred per Grace's honest-question pushback because (a) Supabase 5xx outage is rare in production, (b) existing generic fallbacks ("Couldn't generate outfits — please try again", Alert.alert for save) are already warm and on-brand, (c) Apple reviewer tests airplane mode (covered by Messages 1/2/3) not backend outages, (d) untestable on iPhone without forcing the counter to ≥3 (contrivance, not real validation), (e) cross-component state via prop drilling + 3 new reset call sites + new bar state add architectural weight for marginal benefit. Revisit with production telemetry — if real Supabase outage patterns surface, wire it with the exact spec above. Not blocking App Store submission.
- Race condition on rapid Generate taps for `session_limit_reached` gate (Session 16A, 2026-05-23). The gate reads `sessionsUsedThisWeek` from a SELECT COUNT against `session_log` that ran ~50ms earlier; the matching INSERT happens AFTER Anthropic returns. If a non-VIP user fires N Generate requests in parallel from one or multiple devices when their current count is e.g. 11, all N requests independently see count=11 in their separate queries → all N pass the gate → all N proceed to Anthropic → all N INSERT their row. Result: count could reach 12+N instead of capping at 12. The existing App.js spam-tap guard (`if (status === 'loading') return` from Session 7b-2) covers the single-device-rapid-tap case at the client. Cross-device or genuinely parallel sub-second requests could still squeeze through. Acceptable for Phase 2 Free Plan launch — vanishingly rare in practice (12 sessions = a lot of taps in a short window), cost impact minimal (a few extra Sonnet calls at ~$0.002 each, not paid-tier abuse), and there's a small natural counter-balance because parallel INSERTs after the gate also race so some may trip transient DB errors and not persist — so the user's count tends to fall slightly behind reality rather than far ahead. Future harden: PostgreSQL row locking via `SELECT ... FOR UPDATE` inside a Supabase RPC function, or atomic INSERT-with-precondition. Not blocking, revisit only if production telemetry shows abuse.
- npm audit fix breaks Metro bundler mid-SDK — DO NOT retry against Expo SDK 54. Surfaced 2026-05-23 (Session 17A). Running plain `npm audit fix` (no --force) — even though it only touches transitive deps (`@xmldom/xmldom`, `brace-expansion`, `ws`) and leaves `package.json` clean — repositioned packages inside `node_modules` in a way Metro can't resolve, producing "Cannot find module transform-worker.js" from `@expo/metro-config` on next iPhone load. Reverted cleanly via `git checkout package-lock.json && npm install` (fully restored 16-vuln pre-fix state, app boots clean). The Expo internal toolchain hoists transitive deps in a way that's sensitive to even safe minor-version bumps. All 16 audit findings (1 HIGH `@xmldom/xmldom` XML injection inside Supabase realtime, 15 moderate including the postcss/uuid chain deep inside `@expo/cli` / `@expo/config-plugins` / `expo-asset` / `expo-constants` / `expo-splash-screen`) are practically dormant in Clozie — we don't use Supabase realtime subscriptions (REST + Edge Functions only), don't parse XML anywhere, and Apple reviewers can't reach any of these internals. Defer the entire chain to a coordinated Expo SDK 54 → 56 upgrade session where postcss + uuid get fixed naturally and the `node_modules` repositioning happens alongside a planned migration. `npm audit fix --force` WOULD do the SDK upgrade but as a side-effect dressed up as a security fix — never run it. Workflow lock: future sessions MUST NOT retry `npm audit fix` against Expo SDK 54 — the failure mode is deterministic.
- Rule 14 (BRIEF MATCHING) color qualifier enforcement not effective at prompt-only level — added to SYSTEM_PROMPT in Session 19E (2026-05-24) as: "When the Brief names an item with a color (white top, black dress, blue jeans), match both the garment AND the color from the pool. Do not substitute a different color." iPhone testing post-deploy confirmed Sonnet honors the GARMENT TYPE part of brief item requests (Brief says "white blouse" → outfit contains a blouse-style top) but IGNORES the color qualifier (Sonnet selects any color top from pool, not the requested white). Rule 14 currently dormant on the color front — neither helping nor hurting. Rule 6 amendment from the same session DOES work (brief items now stack with pin instead of replacing it). Deferred fix for color enforcement: JavaScript-level post-processing (parse Brief for color+garment tokens via regex, validate Sonnet's selected items against the pool's actual colours, swap or warn on mismatch). Same belt-and-suspenders pattern as Session 7b-7 dislikes filter (prompt-level instruction + JS hard filter together). Rule 14 left in prompt as documentation + possible future prompt-level effectiveness if cached system prompt evolves. Surfaced 2026-05-24 (Session 19E).
- Your Week calendar pill (Session 20) shows wear day by LOCAL date, but the underlying dedupe in `upsertOutfitInteraction` (outfitHistory.js:73) uses UTC `slice(0,10)`. For a user in a non-UTC timezone, a wear at 11:55pm local (= early-morning UTC next day) followed by a wear at 12:05am local (= same UTC day as the first) gets silently blocked by the DB dedupe — the second wear never persists. Pre-existing behavior carried forward from Session 9B; surfaced more visibly now that Your Week renders wears by local day. Edge case only — very few users wear an outfit twice within a 5-minute window straddling midnight. Polish opportunity: switch dedupe to local-date slice via `toLocalYMD()` on both layers. Would need a coordinated DB/client change. Surfaced 2026-05-26 (Session 20).
- Your Week late-night week-shift edge case (Session 20): if a user opens the sheet just before local midnight on Sunday and the app stays in foreground past midnight, the dot row regenerates for the new week. The previously-selected day is no longer in the new week's day array — the highlighted sage circle visually disappears. Rare; not handled. Polish would be a useEffect re-syncing selectedDay when the week shifts. Surfaced 2026-05-26 (Session 20).
- metro.config.js absent from project root — expo-doctor flagged this on every EAS Build run (build 1, 2, 3 — Session 23) with "you are using a custom metro.config.js that does not extend expo/metro-config". Investigation 2026-06-02 found there is no metro.config.js anywhere in the project; EAS Build's prebuild step generates a minimal default during build, which doctor classifies as "custom and not extending". NON-BLOCKING — build 3 succeeded without it (IPA produced, Session 23E). Fix is the canonical Expo SDK 54 starter (5 lines): `const { getDefaultConfig } = require('expo/metro-config'); const config = getDefaultConfig(__dirname); module.exports = config;`. Runtime impact zero (same Metro behavior, just declared explicitly). Polish session before App Store submission. Surfaced 2026-06-02 (Session 23).
- Sonnet sometimes recommends light jackets for Hot weather despite SYSTEM_PROMPT v5 COMPOSITION RULES line 7 ("Hot → prefer Light/None warmth, avoid heavy wool") AND Session 7b-6 buildWeatherHint Hot bullet (which echoes that rule in the per-call user-message STYLING NOTES). Surfaced 2026-06-03 (Session 25) on TestFlight Build 5 — generated outfit recommended a light jacket / denim jacket-style layer for a Hot weather scenario where no outerwear should appear. Not blocking — Sonnet still composes the outfit cleanly. Root cause not yet investigated: prompt-level instructions may be losing weight against learned styling patterns, OR the C2 Hot safety filter (Session 7b-5) only drops Heavy-warmth tagged items (dormant filter because warmth column is NULL per separate Known Issue) so Light or untagged light jackets escape the filter. Two candidate fixes: (a) prompt-tuning — tighten Rule 7 or add a new Rule 15 explicitly forbidding outerwear in Hot weather without an occasion-layering exception, (b) extend C2 filter to drop ALL outerwear (not just Heavy) when temperature is Hot AND occasion isn't a layering-aesthetic occasion like Work · Office or Going Out. Needs a dedicated Edge Function session — CLI deploy via `supabase functions deploy generate-outfits --use-api`. Cache discipline: stays at 2,510 tokens unless SYSTEM_PROMPT is touched.
- Long-sleep session refresh UNVERIFIED on TestFlight. The `AppState` listener calling `supabase.auth.startAutoRefresh()` / `stopAutoRefresh()` was wired Update 1 — Session 1 (2026-06-21) and verified in Expo Go for short backgrounding (10-30 seconds, Test C). The original symptom — app left open, phone locked overnight, return next morning with no re-sign-in required — cannot be reproduced in Expo Go and awaits TestFlight Build 13 verification. If it fails on Build 13, revisit. See SESSION_NOTES.md Update 1 — Session 1 for full detail.
- Apple Sign-In end-to-end auth flow UNVERIFIED on TestFlight. Wired in Session 22 (2026-06-03) but Expo Go lacks the iOS Sign In with Apple entitlement, so the native sheet only errors out in dev. First real test happens on TestFlight Build 13. Re-flagged Update 1 — Session 1 alongside the long-sleep retest. See SESSION_NOTES.md Update 1 — Session 1.
- My Closet Add/Edit panel still lives INLINE inside the closet ScrollView, not as a real Modal. Update 1 — Session 2 (2026-06-22) removed the worst symptom (second pencil while panel is open now scrolls back into view via a captured panel Y) but the structural root cause is unchanged. Two residual symptoms remain inherent to the inline structure: (a) tapping near the X close button can clip the iOS status bar and trigger iOS's built-in scroll-to-top without closing the panel, (b) closing the panel does NOT restore the scroll position the user was at before opening — list stays parked where the auto-scroll landed it. Real fix is converting the panel to a `<Modal>` overlay, which would eliminate both residual symptoms AND the silent-overwrite issue (next entry) in one structural change. Deferred because the panel is ~200 lines with photo upload, recognition bar, category picker, KeyboardAvoidingView behavior, and four close paths — needs its own session with full iPhone regression across add-item + edit-item + photo recognition + offline. Surfaced Update 1 — Session 2 (2026-06-22). See SESSION_NOTES.md Update 1 — Session 2.
- My Closet — tapping a second pencil while the Add/Edit panel is already open silently OVERWRITES any unsaved typing in the open panel. No confirmation, no warning. `handleEditItem` at App.js:1377 has no guard — it unconditionally repopulates all field state (`setNewItemName`, `setNewItemCategory`, `setNewItemColour`, `setNewItemNotes`, `setPhotoUri`) with the new item's data even if the user just typed an unsaved edit on item A. Update 1 — Session 2 (2026-06-22) made the re-targeted panel visible (it used to be off-screen), which makes this data-loss risk more discoverable. Candidate fixes for the next session: (a) guard with a "Discard unsaved changes?" confirm modal when any field has been edited from the original item's value, or (b) just block the second pencil tap with a brief toast when the panel is dirty. Surfaced Update 1 — Session 2 (2026-06-22). Planned as the next session per Grace's call.
- Dynamic Type cap (Update 1 — Session 3, 2026-06-23) is a MITIGATION, not a fix. The cap limits how far iOS Larger Text can scale fonts in Clozie (global Text/TextInput at 1.3×, Welcome + Splash big DM Serif headings at 1.1×, Welcome eyebrow/tagline + Splash label at 1.15×). It prevents the worst layout breakage on Welcome and Splash at the largest accessibility text sizes — pre-cap the 64pt Welcome logo hit the notch and the tagline collided with the woman's photo. But the underlying root cause — fixed-pixel positioning that ignores the safe area (Welcome `logoBlock top:80` and `bottomBlock bottom:60` at App.js:7925 / 7953) — is unchanged. At the cap the logo is still bigger than at 1.0× and `top:80` still ignores the notch. The full responsive-layout rework remains DEFERRED to a dedicated session; until then, do NOT treat the cap as "Welcome is fixed for Dynamic Type." The cap also does not protect any future fixed-pixel layout that gets added — every new layout still needs to be designed for the 1.3× / 1.15× / 1.1× growth bands. UNVERIFIED on TestFlight standalone (Build 13) — the documented Fabric AX-size weakness in RN's `maxFontSizeMultiplier` would surface on standalone first if at all; flag if a future tester reports text growing past the cap on a maxed slider.
- Cool + Rainy occasionally picks a heavy winter parka. Working hypothesis: the per-call STYLING NOTES weather bullet from Session 7b-6 `buildWeatherHint` says "avoid delicate fabrics, prefer closed-toe shoes" for Rainy but doesn't explicitly cap outerwear heaviness; combined with Cool temperature inviting outerwear in general, Sonnet sometimes lands on a parka. Low-priority polish, not a correctness bug — most users won't own a heavy winter parka. Revisit only if real users report it. Surfaced 2026-06-25 during Update 1 — Session 5 planning (read-only observation, no code change).
- PIN + COLOUR + GARMENT triple-combo in the Brief is inconsistent. When the user pins an item AND the Brief names a colour + garment (e.g. pin denim jeans + Brief "white sneakers"), the requested colour-garment item surfaces only sometimes, and outfit quality drops on the misses. Three signals compete for Sonnet's attention: the HARD pin constraint (must appear in every outfit), the occasion + style profile, and the SOFT colour-family pool lift introduced in Update 1 — Session 6 (2026-06-27). The pool lift is intentionally the weakest signal of the three (gentle nudge by design), so it loses when the pin and occasion also compete. NOT caused by Session 6's change and NOT a regression — it's the ceiling of the soft pool-lift approach. Candidate fix for a future session: a light post-generation colour/garment check (the "Step 2" deferred from Session 6's staged plan). Needs council input before building. Surfaced Update 1 — Session 6 (2026-06-27). See SESSION_NOTES.md Update 1 — Session 6.
- "navy blazer" two-blazers watch item. Once during Update 1 — Session 6 testing (2026-06-27), a "navy blazer" Brief produced two blazers in a single outfit. Re-ran twice, did not repeat. Pre-existing Sonnet structural edge case (related to the Session 17F two-bottoms-no-top class), NOT caused by the Session 6 colour lift. Watch only — flag if it reproduces in production. The Session 17F server-side structural checks at index.ts:1545–1620 catch two-bottoms-no-top and Top + 2 Bottoms via Map-based `itemById` lookup; two-of-the-same-category-tag for Outerwear is not in the current Check set. If this surfaces repeatably, the candidate fix is a fourth check (dedupe Outerwear with pinned-preference, mirroring Check 3's Bottoms pattern).
- Daily Notifications firing + tap routing UNVERIFIED on TestFlight. Code-complete on testing 2026-06-27 (Update 1 — Session 7); Expo Go since SDK 53 cannot reliably simulate actual firing, cold-launch tap routing (`getLastNotificationResponseAsync` in App()), warm-launch tap routing (`addNotificationResponseReceivedListener` in MainAppScreen), or foreground display banner/sound. All four await TestFlight Build 13. See SESSION_NOTES Session 7.
- `app.config.js` plugin entry for `@react-native-community/datetimepicker` deferred to Build 13 EAS prep (Update 1 — Session 7, 2026-06-27). Picker works without it in Expo Go and on EAS Build for `mode="time"` (plugin only adds `NSCalendarsUsageDescription` for calendar mode we don't use). Add `{ "plugins": ["@react-native-community/datetimepicker"] }` to the plugins array before Build 13 as cheap insurance — not blocking.
- Analyse My Wardrobe entry-card caret `▾` (closed) / `▴` (open) renders at slightly different visual weights due to font substitution. Both go through the identical `wardrobeStyles.analyseEntryCaret` style (Outfit_400Regular fontSize 18 #2C1A0E) — verified. Cause: Outfit variable font almost certainly lacks the Geometric Shapes glyphs U+25BE / U+25B4, so RN falls back per-character to SF Pro on iOS, which draws `▾` as a compact dropdown caret and `▴` as a fuller triangle (heavier ink coverage, taller apparent height). Not a code bug. Passes contrast (16.65:1 on white) and both read unambiguously as open/closed. Session 4 (2026-07-04) confirmed **Option A (leave as-is)** for App Store submission. Cheap post-launch **Option B** if pixel-parity ever wanted: swap glyphs to `▲` (U+25B2) / `▼` (U+25BC) — matched "BLACK TRIANGLE" pair guaranteed across fonts — and drop `analyseEntryCaret.fontSize` from 18 → 14 to match the current visual weight of the closed-state caret. Two-line change. Surfaced 2026-07-04 (Session 4).
- Analyse My Wardrobe results block — dormant Pro-only actionable-link TouchableOpacity at [App.js:1943-1959](App.js:1943) has effective ~28pt vertical tap target (13pt Outfit_500Medium text + hitSlop `{ top: 6, bottom: 6, left: 6, right: 6 }` = ~27.6pt), fails Apple's 44pt HIG minimum. Currently **UNREACHABLE in free** because `src/lib/wardrobeIntelligence.js` returns `actionable: false` on every observation — the JSX branch never renders. Not a submission blocker. Fix before Pro observations flip `actionable: true`: bump the TouchableOpacity's `hitSlop` from 6 to ≥15 in all four directions (raises effective target to ~43.6pt), OR convert to a full-width pill button matching the observation-card padding. Surfaced 2026-07-04 (Session 4).
- Undo/untag for 'I wore this today' — double-tap or tap-again to remove the tag if tapped by mistake. Same undo pattern for love/like reactions. UX mistake-proofing, target v1.0.4+. Requested 2026-07-10 during Build 19 TestFlight.
- Auto-enhance (`enhanceStrength: 1.0` in App.js `CUTOUT_OPTIONS`) does NOT correct dim/warm lighting on light garments. Build 26 TestFlight (2026-07-14, Grace): ivory/white shirts read dingy, and a cream dress shot in poor light displays brown in the stored cutout. COLOUR recognition stays accurate — recognition runs on a separate image path, NOT the enhanced cutout (confirmed, matches Session 2 caveat 3). Cosmetic: affects only the displayed/stored item photo, never outfit generation or the COLOUR field. **Session 3 (Build 26 tuning) agenda item** — fix is JS-only (a rebuild, never a Swift recompile): lower `enhanceStrength` toward 0, or set `enhanceStrength: 0` and rely on the cutout + baked shadow alone. Evidence screenshots captured on-device by Grace 2026-07-14. Surfaced 2026-07-14 (Update 4 — Session 7, Build 26 TestFlight PASS).
- ✅ RESOLVED (verified 2026-07-16, Update 4 — Session 13) — Stale comment at `modules/expo-background-removal/src/BackgroundRemovalModule.ts:17`. The comment was already corrected in commit `0a9338b` ("fix stale forwarding comment", Build 27 s7); `ts:16-18` now accurately describes the 2-arg module ("Both production call sites pass CUTOUT_OPTIONS; the no-options branch is a defensive fallback for any future 1-arg caller (the native module has been 2-arg since Build 26)"). This KNOWN-ISSUE entry was itself stale — code wins over docs; no code change was needed. Originally surfaced 2026-07-14 (Update 4 — Session 7).
- Housekeeping (future session): migrate KNOWN ISSUES out of CLAUDE.md into a dedicated backlog file, reconcile with the July 4 backlog kept in the Claude.ai project, and re-verify items 21/22/29 against Build 19 results.

---

# THINGS TRIED THAT DID NOT WORK — NEVER RETRY

- Background removal via Remove.bg — looked horrible, never use again
- Demo Mode — built and removed, don't rebuild
- Login data bug fix on web app — broke entire app, reverted
- Old Onboarding screens — removed March 14, replaced with Peek Inside flow
- Photo sharing via Web Share API on iPhone — Apple blocks it in web apps
- Long press to save photo on web — saves to Files not camera roll

NOTE: Worth trying properly in native — previous failure was a coding mistake, not an iPhone limit

---

# NEVER TOUCH — EVER

- VIP emails — never remove, never change
- Outfit generation rules and smart filtering logic
- Hanger View layout and spec — do not change without Grace's approval
- Colors and fonts — never change unless Grace explicitly asks
- Supabase database structure — only ever add to it, never break it
- Web app at clozie.vercel.app — completely frozen, never touch
- Camera: in native use Expo Camera + Expo ImagePicker. Do NOT copy web camera code.
- Working features not part of the current task

---

# HOW GRACE WORKS — CRITICAL. READ THIS EVERY SESSION.

- Plain English only — no jargon, no tech terms without explaining them first
- One step at a time — always, no exceptions — NEVER combine multiple steps
- Every single step must be approved by Grace before the next step begins — no exceptions, ever
- Must see complete plan BEFORE any code is written
- Grace approves the plan — then Claude Code builds step 1 only — Grace tests — Grace approves — then step 2 begins
- State risk level before every single change — must always be LOW
- If a step cannot be done at LOW risk — break it into smaller steps until each one is LOW risk
- Complete replacement files only — never line-by-line edits
- If something breaks — revert immediately, never pile fixes on top
- Label every working version clearly: date + short description
- Never rush Grace — always warm, always reassuring
- Never present uncertain information as fact
- Never lie, never guess — if unsure, say so and ask Grace
- When in doubt — ask Grace first, always
- Grace needs proof that each step works before moving to the next
- Code quality is non-negotiable: the native app must work IDENTICALLY to the web app — same flow, same screens, same Clozie behaviour, same design, same animations, same everything.
- App_ORIGINAL.jsx is the exact reference for every behaviour. The only differences are the agreed changes listed in this file. Everything else must match exactly. Never cut corners.

---

# GRACE'S WORKFLOW — CLAUDE CODE + EXPO

This is how every session works. Follow this every time without exception.

To build something:
- Open Claude Desktop app on MacBook
- Claude Code reads CLAUDE.md + App_ORIGINAL.jsx automatically
- Grace says what she wants in plain English
- Claude Code shows the full plan — Grace reads it and approves before anything is built
- Claude Code builds STEP 1 ONLY — complete file, never partial
- Grace tests step 1 on iPhone via Expo Go
- Grace confirms step 1 works and approves it
- Only then does Claude Code move to step 2
- Repeat for every step — no exceptions
- Claude Code labels the version with today's date + short description

To test on iPhone:
- Grace opens Terminal on MacBook (Press Command + Space → type Terminal → press Enter)
- Grace types these commands and presses Enter: cd ~/Desktop/Clozie\ Native, then nvm use 20 && npx expo start
- A QR code appears on the MacBook screen
- Grace opens the camera on her iPhone
- Points the camera at the QR code → taps the yellow link that appears
- Expo Go opens on iPhone → Clozie appears on the phone
- Grace tests it → tells Claude Code what needs fixing in plain English
- If it works → Grace confirms → Claude Code labels the version and moves to next step
- If it breaks → revert immediately, never touch anything else first

The terminal commands Grace types are: cd ~/Desktop/Clozie\ Native, then nvm use 20 && npx expo start (no tunnel needed, LAN mode works).
Everything else — building, fixing, labelling — is done through Claude Code in plain English.

---

# VERIFICATION RULES — PERMANENT

- Never describe code from memory. Before stating anything that will be acted on (a commit, build, deploy, or plan decision), read the actual file first.
- Docs describe history; code describes NOW. Never treat old session docs, SHELVED files, or stale CLAUDE.md lines as the source of truth about current code. When docs and code disagree, the code wins — verify against the code.
- If something hasn't been verified, say "I haven't checked this" — never guess, never fill gaps with plausible assumptions.
- After every edit, read the changed lines back and show them — don't claim success without looking.
- In any findings or audit document, mark each claim VERIFIED (file + line) or NOT CHECKED. Nothing in between.

---

# GOLDEN RULES — EVERY SINGLE SESSION

RULE 1: READ THIS ENTIRE FILE FIRST — before doing anything at all
RULE 2: ONE STEP AT A TIME — never combine steps, always wait for Grace to confirm each step
RULE 3: GRACE APPROVES EVERY STEP — no step begins until Grace has explicitly said yes to the previous one
RULE 4: STATE RISK LEVEL before every change — must always be LOW — if not LOW, break into smaller steps
RULE 5: ASK BEFORE DOING ANYTHING — show plan, wait for Grace to approve
RULE 6: NEVER TOUCH THE WEB APP — it is frozen, leave it completely alone
RULE 7: LABEL EVERY WORKING VERSION — date + description every time
RULE 8: VERIFY CODE IS COMPLETE before giving to Grace — no partial files ever
RULE 9: NEVER LIE, NEVER GUESS — if unsure, say so and ask Grace
RULE 10: IF SOMETHING BREAKS — revert immediately, never pile fixes on top
RULE 11: NEVER TOUCH outfit rules, VIP emails, Hanger View layout, Supabase structure, design
RULE 12: ONLY WORK FROM FILES GRACE GIVES YOU — never assume or invent
RULE 13: DOUBLE CHECK NOTHING IS FORGOTTEN before finishing any session
RULE 14: WHEN IN DOUBT — ask Grace first
RULE 15: FOLLOW GRACE'S WORKFLOW EVERY TIME — no shortcuts ever
RULE 16: DO NOT APOLOGIZE EXCESSIVELY — just follow the rules instead
RULE 17: NEVER SAY AI TO USERS — anything visible in the app always says Clozie, never AI
RULE 18: NEVER EDIT CLAUDE.md without showing Grace the exact change word for word and waiting for YES. Additions and archiving only — nothing permanently deleted.

Every step must be LOW risk. Every step must be tested and confirmed by Grace before the next step begins. Grace needs proof everything works before moving forward. No exceptions. Ever.

---

# CODING PATTERNS — APPLY THESE WHEN WRITING CODE

Established patterns to follow when writing App.js, src/lib/*, or Edge Functions. Each is the result of a learned-the-hard-way session lesson — deviate only with a specific reason.

## Use `supabase.auth.getSession()`, NOT `supabase.auth.getUser()`, when offline-safety matters

`getUser()` makes a network call to verify the JWT against the Supabase auth server — offline it returns `{ data: { user: null }, error: AuthError('Network request failed') }`, which looks like the user is signed out and misleads downstream code into auth-flavoured error messages. `getSession()` reads the cached session from AsyncStorage with no network call, returns immediately, refreshes the access token only when online. Use it in any flow that needs to work offline (wardrobe add/edit/delete, photo upload, VIP check, generate error paths). Established Session 14B (2026-05-21). Already wired in `src/lib/wardrobeItems.js`, `src/lib/outfitHistory.js`, and the MainAppScreen VIP-check useEffect.

## Per-user state goes in `auth.user_metadata`, NOT in a new Supabase table

Small per-user state (full_name, `ai_consent_given`, style preferences, counters like `consecutive_negative_sessions`) lives in `auth.user_metadata`. Read via `session.user.user_metadata` from `getSession()`. Write via `supabase.auth.updateUser({ data: { ... } })` — merges with existing keys, doesn't replace. Zero Supabase dashboard work; RLS implicit; Edge Functions get it for free in their existing `getUser(token)` call. The skeleton `profiles` table in Supabase is intentionally unused — do NOT resurrect it. Only create a new Supabase table when data is genuinely cross-user-queryable OR grows unbounded per user (`wardrobe_items`, `outfit_history`, `session_log`, `vip_emails`). Established Sessions 7b-0, 8, 16B, 19A.

## App() owns auth-aware routing

On cold launch, the root `App()` component calls `supabase.auth.getSession()` once on mount and routes directly to `main` if a session exists, otherwise to the standard splash → welcome flow. Initial `currentScreen` state is `'checking'` and renders `null` while `getSession()` resolves so the native splash from `app.config.js` (Session 19D) stays visible — no Welcome flicker for already-signed-in users. Sign Out flips `currentScreen` back to `'welcome'` directly; next cold launch sees no session and falls through to the welcome flow. Established Update 1 — Session 1 (2026-06-21).

Separately, an `AppState` listener registered in `App()` calls `supabase.auth.startAutoRefresh()` on `'active'` and `stopAutoRefresh()` on background — canonical Supabase RN pattern that prevents iOS from silently missing token refreshes during deep sleep (the JS timer is throttled when backgrounded; without this listener, returning from long sleep can present an expired-token failure on the next Supabase call).

Which tab `MainAppScreen` lands on is controlled by a single `mainInitialTab` state in `App()`, set explicitly by each entry point BEFORE the `setCurrentScreen('main')` flip. Three entry points: auto-resume → `2` (Today's Vibe), explicit Sign In → `2` (Today's Vibe), Signup → PostLoginWelcome → `0` (My Style — defensive explicit reset so a leftover tab index from a prior in-app login cannot leak into a new account). `MainAppScreen` accepts `initialTab` (default `0`) and reads it once via `useState(initialTab)` at mount. `MainAppScreen` unmounts on Sign Out (gated by `currentScreen === 'main'`) so it picks up a fresh prop on every transition into main.

---

# UI STATES — LOCKED APRIL 19 2026

Error colors: errors do NOT use red or orange. Error headings: #2C1A0E espresso. Error body text: #5C4A3A. Inline error messages: #C87A52 terracotta at 88% opacity. Errors feel like gentle Clozie guidance, not alarm bells.

Disabled button: background #BCC7B7 sage green at 45% opacity. Text: white at 35% opacity. No white ring on disabled state. Button appears muted but recognizable.

---

# BUSINESS MODEL & PRICING

## FREE PLAN

- Up to 50 wardrobe items
- 12 sessions per week (36 outfits) — rolling 7-day window
- Clozie styling + learning
- Saved favourites
- style profile
- 📸 Clozie photo recognition
- Share outfits with friends
- ✦ Complete The Look — Clozie suggests ONE boutique piece to complete outfit — earns commission
- Store Suggestions inside Mood Board — boutique items matching saved outfits — earns commission
- Wardrobe Intelligence — Analyse My Wardrobe — finds gaps and imbalances
- ✦ Style Match Score — % match with style profile on every outfit card
- ✦ Outfit Potential — how many combinations these pieces create
- What Goes With This — tap any item, Clozie shows everything that pairs with it
- WARNING: Limits enforced in code from day one — 30 items, 12 sessions per week. Never unlimited. No exceptions.

## PRO PLAN — $6.99/month or $67.99/year (20% off)

- Everything in Free — unlimited
- Trip Planner — enter destination + dates, manual weather per day, outfit per day from your wardrobe, packing list with Clozie watermark
- Clear Out — items not worn in 6+ months flagged, Sell / Donate / Swap each one
- Clothes Swap — mark items for swap, share swap card with watermark
- Outfit Wear History — tracks which items are worn and when, feeds Clear Out and Trip Planner
- WARNING: DO NOT LAUNCH Stripe until Trip Planner + Clear Out + Clothes Swap are all built and working

## ELITE PLAN — $9.99/month or $95.99/year (20% off)

- Everything in Pro
- Photo Outfit Matching — user uploads inspiration photo → Clozie finds similar pieces → searches ALL stores → shows where to buy with direct links
- Shop For Me — user says 'Surprise Me' OR fills questionnaire → Clozie finds complete outfits → ALL stores → boutiques AND large retailers → buy buttons → Clozie earns commission
- Event Planner — invite friends, Clozie makes sure nobody wears the same thing
- Virtual Try-On
- AI Editorial Photos
- Trend Awareness — combined with Wardrobe Intelligence to show which owned pieces are trending
- Sale Alerts
- Early access to new features
- NOTE: Build only after Pro revenue exists

---

# SHOP FOR ME — FULL DETAIL

Screen opens with a large '✨ Surprise Me' button at the top.

If user taps Surprise Me — Clozie uses only their style profile plus the 2 required answers below.

Otherwise user answers the questionnaire — all questions visible on screen at once:
- Occasion — Going Out / Work / Wedding Guest / Special Event / Indoor Event / Surprise Me — REQUIRED
- Indoor or Outdoor — always shown for every occasion — REQUIRED
- Season — Spring / Summer / Autumn / Winter — optional
- Looking For — Full outfit / Dress / Top / Trousers / Shoes / Jacket / Accessories / Surprise Me — optional
- Colour — My usual palette / I must wear a specific colour / Surprise me — optional
- Budget — price range slider — optional
- Anything Else — free text — optional

Clozie uses your style profile to fill in everything the user skips.

Results: 2-3 complete outfit options from ALL stores. User picks outfit, sees each piece with photo, price, store name. Can swap any individual piece. Buy button on each piece — taps it — goes directly to store website. Clozie earns commission on every purchase.

---

# AI COMPONENT — HOW IT WORKS — NEVER CHANGE WITHOUT ASKING GRACE

## Outfit Generation

- Clozie generates exactly 3 outfits from the user's actual wardrobe items
- Each outfit uses only items the user has already added to their wardrobe
- Works with as few as 5 items — never requires a full wardrobe to start

Smart filtering rules — ALL must be respected every single time:
- Weather-appropriate — checks temperature and season
- Occasion-appropriate — casual, work, formal, smart casual, etc.
- Heels rule — never with Outdoor / Sport or Weekend Errands (unless pinned as Must Include). Heels allowed with Going Out, Work / Office, and Formal Event. Heels allowed with Casual Day — AI uses judgment based on Brief.
- Sneakers rule — never with Formal Event (unless pinned). Sneakers allowed with Going Out — AI uses judgment based on Brief. Sneakers allowed with Casual Day, Work / Office, Outdoor / Sport, Weekend Errands, and Travel.
- Dress rule — Dresses fine for all occasions. When Brief mentions sport, gym, hiking, or heavy physical activity, AI skips dresses unless she explicitly requests one.
- Cold/Rainy rule — outerwear is added when weather is cold or rainy
- Warmth tags apply to ALL categories — Tops, Bottoms, Dresses, AND Outerwear. Each item may have a warmth tag: None, Light, Medium, or Heavy. Cold prefers Heavy/Medium. Hot prefers Light/None. Cool and Warm mix freely.
- Outerwear splits into two categories: (a) THERMAL — warmth response to weather (heavy coats, puffers, parkas). Add only when Cold or Cool. Match warmth tag to temperature. (b) OCCASION LAYERING — aesthetic signaling (blazers, structured jackets, leather jackets). Responds to Occasion, not weather. Gated only by warmth tag compatibility.
- Light outerwear (shows on all visual surfaces): Cardigan, Blazer, Vest, Down vest, Sweater, Denim jacket, Light jacket, Shacket, Cropped jacket, Bolero.
- Heavy outerwear (dropped from visual surfaces unless pinned): Leather jacket, Bomber jacket, Trench coat, Parka, Rain jacket, Fur coat/faux fur, Windbreaker, Poncho/cape, Quilted jacket, Puffer/down coat, Winter coat/overcoat, Shearling coat, Ski jacket, Peacoat, Fleece jacket.
- Hoodie removed from outerwear — usually categorized as Tops.
- Indoor climate signals: if Brief mentions cold indoor conditions ('office is freezing', 'AC is cold'), add a light warmth layer even if outside is warm.
- Before generating: Clozie reads the user's style profile, all past ratings and learning notes, and the Brief field
- Clozie avoids repeating outfit combinations the user has rated poorly
- Always returns 3 distinct and different outfit options
- Fallback: if AI call fails, rule-based fallback generates outfits without AI naming
- Each outfit has: name, vibe word, items list, item objects with photos, description

## Must Include Item (Today's Vibe screen)

WARNING: THIS IS CRITICAL — CLOZIE MUST RESPECT THIS ALWAYS

- User can optionally pick ONE item from their wardrobe they want to wear today
- Lives in Today's Vibe screen — between THE OCCASION and the Brief field
- When a user pins an item: EVERY SINGLE OUTFIT generated must include that item — no exceptions
- Example: user pins yellow blouse → all 3 outfits must contain the yellow blouse
- Clozie is not allowed to skip the pinned item or replace it
- Pinned item is highlighted in gold in the selector
- User can un-pin by tapping the item again
- Not pinning an item is fine — generation works normally without it

## Clozie's Pick (formerly Complete The Look)

- Lives on every outfit card in Your Looks tab — gold outline button 'Clozie's Pick' — HIDDEN for Apple review
- When tapped: Clozie identifies ONE piece that would complete the outfit
- Goes STRAIGHT to ONE boutique suggestion — no wardrobe check
- Shows: photo, item name, price, store name, 'Shop Now →' gold button
- Tapping 'Shop Now →' opens the boutique website in the browser
- One suggestion only — never a list
- Boutique stores only — never large retailers like ASOS or Zara
- If no boutique connection set up yet — shows 'Boutique partners coming soon' — HIDDEN for Apple review

HOW BOUTIQUE CONNECTION WORKS:
- Phase 1: Shows 'Boutique partners coming soon' — no connection needed yet — HIDDEN for Apple review
- Phase 2: Connect Avara affiliate API — Clozie identifies the missing piece, searches Avara catalogue automatically, returns photo, price, store name, buy link
- Grace applies for Avara affiliate account at avara.com while app is being built — this happens in parallel, not blocking
- FREE feature — available to all users — earns commission on every purchase

## Wardrobe Intelligence — Analyse My Wardrobe

- Lives in My Closet tab — 'Analyse My Wardrobe' button — HIDDEN for Apple review. Wire to Haiku with caching in Phase 2.
- FREE feature — available to all users
- When tapped: Clozie scans entire wardrobe and identifies gaps and imbalances
- Shows maximum 3 observations — warm encouraging tone — never makes user feel bad
- Each observation can link to Complete The Look or Store Suggestions to buy the missing piece

## What Goes With This

- Lives on every item card in My Closet tab — 'What goes with this?' small gold link — HIDDEN for Apple review. Build TouchableOpacity + overlay in Phase 2.
- FREE feature — available to all users
- When tapped: Clozie scans entire wardrobe and shows all items that pair well with this piece
- Results shown as warm grid of item thumbnails
- Different from Must Include Item — this is casual browsing, not outfit generation

## Style Match Score + Outfit Potential

- Both shown on every outfit card in Your Looks tab
- Style Match Score: '94% match with your style profile' — how well outfit matches user's taste — HIDDEN for Apple review, unhide when real calculation exists
- Outfit Potential: 'These N pieces create N×4 outfits together' — shows versatility of pieces — HIDDEN for Apple review, unhide when real logic exists
- Both are FREE — available to all users

## Seasonal Wardrobe Report

Seasonal Wardrobe Report moved to Phase 4+ as a Pro feature. No spec needed before Phase 2.

## Outfit Wear History

- On every outfit card in Your Looks tab: 'I wore this today' button — small, gold outline
- When tapped: saves today's date to Supabase against every item in that outfit
- Button changes to '✓ Worn today' for a few seconds then returns to normal
- On every item card in My Closet tab: shows 'Last worn: [date]' or 'Never worn'
- This data feeds: Clear Out (flags items not worn in 6+ months) and Trip Planner and Seasonal Report
- Data model: `wardrobe_items.last_worn` (ISO timestamp) + `times_worn` (integer counter) bumped by `markItemsWorn(itemIds)` in `src/lib/outfitHistory.js`. Outfit-level worn history lives separately in `outfit_history.worn_dates` (ISO array — Session 20 Your Week pill reads this). NOT a new table — both fields are on the existing `wardrobe_items` row from Session 6A.
- Lazy persistence (Session 9A architectural choice): `outfit_history` rows are inserted only on first user interaction with that outfit (rate / save / mark-worn) — outfits the user sees and ignores are NEVER persisted. This affects future analytics (Clear Out, Trip Planner, any Pro-tier "your style trends" feature) — they can only ever see engaged outfits, not the full universe Clozie has shown. Trade-off: cheap storage (no row bloat from non-engagement) at the cost of incomplete coverage.

## Clozie Photo Recognition

- User takes a photo with camera OR uploads from gallery — both must always work
- In native: use Expo Camera for camera, Expo ImagePicker for gallery
- Claude API reads the image
- Auto-fills ALL fields automatically: Item name, Category, Color, Description/notes
- Category must be exactly one of: Tops, Bottoms, Dresses, Outerwear, Shoes, Accessories
- Green confirmation bar appears when Clozie has successfully filled the fields
- CLOZIE RECOGNISED ✦ label appears on the item
- If recognition fails — fields stay empty — user fills in manually — never crashes
- Shows gold shimmer scanning animation while Clozie is working
- Never crashes — always has a fallback

## Clozie Learning System — How Clozie Gets Smarter Over Time

What happens right now — built from day one:
Every time a user rates an outfit, Clozie saves a small note about it.
The next time the user asks for outfits, Clozie reads all those notes first.
Simple memory — like a notepad Clozie checks before styling you.

Phase 2 upgrade:
Clozie saves specific details from every rating — exact color, category, occasion.
After 5+ ratings, Clozie detects patterns and adds them to the user's style profile automatically.
The more they use it, the smarter it gets. It starts to feel like a real personal stylist.

## Your Style

- Built from what the user selects and from their ratings over time
- Stores: favourite styles, favourite color palettes, dislikes, pattern-detected preferences
- Shown to the user on their My Style tab
- Never reset or deleted — always saved safely in Supabase
- Always read by Clozie before generating any outfit suggestions

## Mood Board

- Visual board of item photos shown side by side
- Grid: 1 column for 1 item, 2 columns for 2+ items
- If no item photos: empty state with instructions

## Hanger View

Hanger View (locked April 19, 2026). Tab label: 'Hanger View'. Subtitle: 'Styled together'. Tab ID: 'hanger'. Tab icon: hanger SVG (same as My Closet tab bar icon, scaled to fit modal tab label). Layout: closet rod → hook → hanger → items stacked top to bottom (Top/Dress → Bottom → Shoes → Accessories). object-fit: contain on all items. Slight negative margin overlap. Background color selector: 5 options (Cream #F5F0E8, White #FFFFFF, Sage #E8E4CE, Dark #2C1A0E, Sage green #BCC7B7). Apple Vision background removal on iOS 16+ (on-device, no privacy impact, fallback to full photos). Heavy outerwear not shown — light outerwear shows. Open items needing mockup: accessory placement, light outerwear layering. See full spec in hanger-view-update-spec.

---

# HOW CLOZIE LEARNING WORKS — PLAIN ENGLISH SUMMARY

Right now — built from day one:
User rates an outfit → Clozie saves a note → Clozie reads all notes before generating next time.

Phase 2 upgrade:
Saves specific color, type, occasion from every rating.
After 5+ ratings, detects patterns, adds to style profile automatically.
Feels personal. Feels like it knows you.

---

# DAILY NOTIFICATIONS — PHASE 2

Free feature. Every morning at her chosen time, Clozie sends a push notification.
She taps it. App opens directly to Today's Vibe.
Built using Expo Notifications.
Default time: 7:30am. She can change this time in Settings.
First time app opens — ask permission: 'Can Clozie remind you to get dressed? 👗' [Allow] [Maybe Later]
Free feature — builds daily habit and retention. Build in Phase 2 — not Phase 1.

---

# REFERRAL SYSTEM — DEFERRED TO PHASE 4+

Referral system deferred to Phase 4+. Not in scope for Phase 2.

(Planned spec, for when it's revisited: every user gets a unique referral link. When a friend uses it and signs up — Supabase records who referred them. Referrer gets 3 bonus outfit generations that week — credited automatically.)

---

# NATIVE APP ROADMAP

Every step must be LOW risk. One step at a time. Grace approves each step before the next begins.
Grace tests each step on iPhone via Expo Go. No step begins until Grace confirms the previous one works.

## PHASE 1 — Core App Rebuilt

One screen at a time. In this exact order. Grace approves each screen before the next is built.

- Splash Screen — auto-advance 1.8s, fade animation, pulse animation
- Welcome Screen — exact spec above, radial glow, Next → button
- Peek Inside Screen — 3 steps, bouncing dot, gold pulsing pill hint, tab navigation, dots
- Login Screen + Sign Up Screen + Forgot Password — with exact headings and error messages per spec above
- Post-Login Welcome Screen — new users only
- Main App shell — 4 bottom tabs with correct labels and icons
- My Style Tab — style tags, color tags, dislikes input, learning notes, subtitle, chip states
- My Closet Tab — grid view, item count + progress bar, add item, photo upload + Clozie recognition, edit item, delete item + confirmation, coloured tags, empty encouragement, last worn date, What Goes With This, Analyse My Wardrobe button
- Today's Vibe Tab — weather tags, occasion tags, Must Include Item picker, extra note, generate button
- Your Looks Tab — outfit cards, photos, Style Match Score, Outfit Potential, rating buttons, save button, mood board link, regenerate, 'I wore this today', Complete The Look
- Mood Board + Hanger View modal — tabs, photo grid, Store Suggestions, Hanger View layout, background selector
- Saved Outfits Screen — grid of saved looks, tap to view mood board, remove button
- Settings Screen — edit profile, change password, Clear Clozie's Memory, notifications toggle, sign out, delete account
- Subscription Screen — free plan features, Pro teaser + Notify Me, Elite teaser + Notify Me

## PHASE 2 — Make It Solid — Free Plan Complete

- Supabase auth used properly — no localStorage ever ✅ DONE 2026-05-03 (Session 1 — Sign Up + Sign In)
- Pull user name from Supabase on every login ✅ DONE 2026-05-03 (Session 1 — Settings reads full_name from session)
- Settings Sign Out wired to Supabase ✅ DONE 2026-05-04 (Session 2)
- Settings Forgot Password wired to Supabase ✅ DONE 2026-05-04 (Session 2 — note: needs Resend SMTP for emails to actually deliver)
- Settings Update Password wired to Supabase ✅ DONE 2026-05-04 (Session 2 — verifies current password, validates 8+ chars + new != current + match)
- Settings Delete Account wired via delete-user Edge Function ✅ DONE 2026-05-04 (Session 2 — Apple Guideline 5.1.1v compliant)
- Wardrobe items persist in Supabase (wardrobe_items table + private wardrobe-photos Storage bucket + RLS) ✅ DONE 2026-05-07 (Session 6A — full Add/Edit/Delete CRUD)
- Photo recognition wired — Claude Sonnet 4.6 auto-fills name/category/colour/notes from a wardrobe photo, terracotta CLOZIE RECOGNISED eyebrow inside sage success bar, terracotta auto-fill border on Clozie-filled fields that clears on user edit, no-key + network-error fallbacks ✅ DONE 2026-05-08 (Session 6B)
- Photo recognition Edge Function migration — `recognize-photo` Supabase Edge Function holds Anthropic key server-side, JWT-verify ON, internal auth check + image size sanity check; client `src/lib/clozieRecognition.js` now calls `supabase.functions.invoke('recognize-photo', ...)` instead of api.anthropic.com directly; EXPO_PUBLIC_ANTHROPIC_KEY removed from `.env` and `app.config.js`; closes Legal Tracker §14.10 vulnerability ✅ DONE 2026-05-08 (Session 7a)
- My Style profile persists in Supabase (selected styles + colour palettes + never-wear text saved to auth.user_metadata; loads on tab mount; saves on Build My Closet tap; Skip does not save) ✅ DONE 2026-05-09 (Session 7b-0)
- generate-outfits Edge Function deployed in stub mode — auth-gated (JWT verify ON), reads wardrobe from Supabase (excluding exclude_from_styling=true), enforces three gates (5 styleable items minimum, (Tops AND Bottoms) OR Dresses essentials, valid pin), returns 3 stub outfits with real wardrobe item UUIDs and source: "stub" debug marker; tested via curl from terminal; client wiring + Anthropic call + JS smart fallback all in later 7b sessions ✅ DONE 2026-05-09 (Session 7b-1)
- generate-outfits client wiring + outfit display — `src/lib/outfitGeneration.js` helper (mirrors `clozieRecognition.js`); Generate button (Today's Vibe) sends temperature/condition/occasion/indoors/pinnedItemId/brief/styleProfile to Edge Function; MainAppScreen orchestrates `handleGenerate` (spam-tap guarded, switches to Your Looks immediately, reads styleProfile from `auth.user_metadata`, calls helper, resolves Edge Function item IDs to full WardrobeItem objects from local state); YourLooksTab driven by lifted `generationStatus` (idle/loading/success/error); 3 gate errors (`not_enough_items` / `missing_essentials` / `invalid_pin`) map to warm Clozie messages rendered in the empty-state slot; outfit card photo strip + saved outfits photo strip now show real wardrobe photos via signed URLs (`overflow:'hidden'` + `photoStripThumbImage` style mirrors `gridCardPhoto` pattern). Stub outfits display end-to-end on iPhone — first time outfits visually appear in the native app ✅ DONE 2026-05-09 (Session 7b-2)
- generate-outfits real Anthropic call live — Edge Function now fires Sonnet 4.6 (claude-sonnet-4-6, temperature 0.75, max_tokens 1500, 15s timeout) with the v5 stylist system prompt + ephemeral cache_control. Three bugs hunted and fixed in sequence via Supabase logs: (1) greedy JSON regex replaced with brace-walk that stops at first balanced {...}; (2) max_tokens bumped from 500 → 1500 to stop Sonnet truncating mid-JSON; (3) name-to-UUID lookup now splits on `|` and uses only the first segment, since Sonnet was echoing items in full pool format ("Knit Cotton Sweater | Tops | Camel"). Verified on iPhone — real editorial outfit names ("Cream & Cool", "Boho Off-Duty") with real descriptions; source field returns "sonnet" not "stub". Diagnostic `raw AI text:` log added in callAnthropic — leave in for now, remove in polish pass before App Store. KNOWN: Anthropic prompt caching is not working — both cache_creation_input_tokens and cache_read_input_tokens are 0 on every call. Costing ~10× expected. Separate session ✅ DONE 2026-05-10 (Session 7b-3)
- generate-outfits prompt caching fixed + Session 7b-3 diagnostic log removed (Session 7b-4) — Anthropic prompt caching was silently disabled on every call because the deployed SYSTEM_PROMPT (~1,720 tokens) sat below Sonnet 4.6's 2,048-token caching threshold, even though `cache_control: { type: 'ephemeral' }` was set correctly on the system content block. Replaced the deployed prompt with the canonical v5 padded prompt (Style Council/Business Council, May 8 2026) — 7,714 chars / 187 lines / 2,267 actual tokens per Anthropic's tokenizer (~219 tokens / 11% headroom above 2,048). Both `{{requestedOutfits}}` template placeholders substituted to literal `3` before paste. Diagnostic `console.log('[generate-outfits] raw AI text:', text)` from Session 7b-3 also removed in a separate earlier deploy. Two changes shipped in TWO SEPARATE DEPLOYS — debug log first, prompt swap second — so a regression in either could be reverted independently. Verified via raw Supabase log paste from browser: Call 1 cache_creation 2,267 tokens; Call 2 (within 5 min) cache_read 2,267 tokens (exact round-trip). input_tokens 274 → 3 on cached call. Estimated cost impact: ~4–4.5× cheaper input on every cached call within the 5-min TTL window. App.js was not opened or edited at any point in the session ✅ DONE 2026-05-10 (Session 7b-4)
- generate-outfits JS safety filters + category imbalance flag + computeOutfitPotential stub (Session 7b-5) — added five weather/indoor safety filters via new `applySafetyFilters` function (C1 Cold drops Light/None Tops/Dresses; C2 Hot drops Heavy across all categories; C3 Rainy drops `suede`/`sandal`/`open-toe`/`mule` names; C4 Snowy drops `suede`/`espadrille`/`sandal`/`open-toe`/`flip-flop`/`stiletto` substrings + word-boundary regex for `heel(s)`/`pump(s)`; C5 Indoor drops Heavy Outerwear when toggle ON). Pinned item exempt from every filter; soft-fail safety net reverts to unfiltered pool if essentials gate breaks post-filter. Snow is the one weather where heels are filtered — safety not taste. Heels and sneakers explicitly excluded from all other filters per Grace's directive ("heels are taste decisions, Sonnet decides"). Category imbalance flag added to user message (fires when bottoms ≤ 2 AND tops > 8). Inert `computeOutfitPotential(_outfitItems, _fullWardrobe)` stub helper added for Session 9. C1/C2/C5 are DORMANT until warmth column is populated (deferred to warmth session); C3/C4 work today. Dynamic outfit count from original plan explicitly KILLED to protect cached system prompt. App.js not touched. README.md prose updated to reflect all changes. Six deploys, each verified on iPhone with cache_read_input_tokens=2267 intact ✅ DONE 2026-05-10 (Session 7b-5)
- generate-outfits Session 7b-6 wired across three legs (May 11 paused / May 12 resumed + closed / May 13 cleanup). Leg 1 (May 11, paused): five paste-into-dashboard deploys later proved corrupted by awk + pbcopy MacRoman mojibake and chat-paste truncation — pause-state established. Leg 2 (May 12, resumed + closed): switched to `supabase functions deploy --use-api` from local disk via newly-installed Supabase CLI v2.98.2 (`brew install supabase/tap/supabase`); created `supabase/config.toml` and `supabase/functions/generate-outfits/index.ts` (extracted from README.md via Python binary I/O — byte-perfect). Canonical v5 SYSTEM_PROMPT token count corrected from 2,267 to 2,132 (all prior 2,267 readings were mojibake-inflated). Added FANCY_DRESS_PATTERN filter for Outdoor · Sport (chiffon / silk / satin / velvet / lace / organza / tulle / sequin / beaded / gown / evening / cocktail). CLAUDE.md corrections in same session (D-U-N-S RECEIVED, Anthropic spend cap, Instagram handle, outfit-name font, Resend SMTP domain). Leg 3 (May 13, cleanup): five concrete additions — SKIRT_PATTERN `/skirt/i` filter for Outdoor · Sport (Bottoms category, pinned exempt); buildWeatherHint helper emitting per-call styling-notes bullets that echo cached system prompt weather rules; buildCompressedPool warmth-tag block rewritten (column wins, falls back to HEAVY_OUTERWEAR / LIGHT_OUTERWEAR regex, no tag for unrecognized); Padding Section 7 "FINISHING TOUCHES" appended to SYSTEM_PROMPT (~243 tokens, cache moved 2,132 → ~2,375, 16% margin above 2,048 threshold); diagnostic logs confirmed clean. Two mid-session discoveries on May 13: first CLI deploy of the session silently failed despite success-style output (root cause unisolated; removing `--yes` flag unblocked subsequent four deploys), AND Supabase dashboard "Code" tab proved to be a stale editor view rather than a live runtime mirror (verification must go via iPhone + Logs). App.js NOT touched at any point across all three legs. Workflow change permanent: future Edge Function deploys MUST use CLI (`supabase functions deploy --use-api`), never dashboard paste — dashboard Code tab is for VIEWING (sometimes stale) deployed code only ✅ DONE 2026-05-13 (Session 7b-6 across May 11 / 12 / 13)
- generate-outfits dislikes hard filter + Regenerate button wired (Session 7b-7). Edge Function: new dislikes filter inside `applySafetyFilters` reads `styleProfile.neverWear` from request body, tokenizes (split on `,`/`;`, lowercase, trim, drop stopwords + min length 4), matches case-insensitive substring on `name + colour` only (NOT notes), pinned item exempt, soft-fail safety net unchanged. One CLI deploy. SYSTEM_PROMPT untouched. App.js: 5 edits across 1 file — new `lastPayload` state in MainAppScreen, `setLastPayload(payload)` inside `handleGenerate`, new MainAppScreen `handleRegenerate` helper, `onRegenerate={handleRegenerate}` prop on YourLooksTab, YourLooksTab signature extended, local `handleRegenerate` rewritten to do local UI resets (ratings, feedback, wornToday, showBoutique) then call `onRegenerate()`. Fake 2-second `setTimeout` + manual spinAnim/setLoading/setHasGenerated calls deleted — redundant since lifted useEffect at App.js:2373-2392 drives spinner from `generationStatus`. Both 🔄 Regenerate AND Save Feedback & Style Again → share local handler. Tested on iPhone across basic regenerate, local-resets, Save Feedback path, spam-tap guard. Cache verified safe at 2,375 across all calls in Supabase Logs ✅ DONE 2026-05-14 (Session 7b-7)
- generate-outfits JavaScript Smart Fallback wired (Session 7C). New `buildSmartFallback` function fires when Anthropic returns null (any timeout / 5xx / 429 / malformed JSON / schema validation / name→UUID mapping failure) — replaces the basic `buildStubOutfits` as the primary fallback. Color-aware composition (COLOR_NEUTRAL / COLOR_EARTH / COLOR_NAVY regex families with word-boundary anchors; navy+earth clash detection; falls back to any in-category item if no compatible match exists). Per-occasion editorial name pools (Casual Day / Work · Office / Going Out / Formal Event / Outdoor · Sport / Weekend Errands / Travel — keys match the exact middot strings sent from App.js:221 + App.js:1726). Per-occasion vibe pools, all members of `ALLOWED_VIBES`. Names shuffled and 3 distinct picks per generation. Layout selection adapts to wardrobe and pin: dress-pin → all dress-centered; outerwear-pin → outerwear in every outfit; tops+bottoms+dress → mixed; tops+bottoms-only → 3 top/bottom outfits; dress-only → 3 dress outfits (essentials gate guarantees one of these branches). Pinned item forced into every outfit. Uses safety-filtered `filteredItems` pool with soft-fail revert (< 5 items) to unfiltered `items`. If `buildSmartFallback` itself throws a runtime exception, last-resort to existing `buildStubOutfits` — 3-tier safety net live. Descriptions: "[colour first-word] with [colour first-word] — [mood]." with fallback to lowercased name when colour is missing. `styleMatchScore: 85` on all fallback outfits (vs 87 on stub). Response `source` field now returns `"sonnet" | "fallback" | "stub"`. Five CLI deploys via `supabase functions deploy --use-api` (no `--yes` flag, per Session 7b-6 lesson): (1) constants only no caller; (2) function definition no caller; (3) wire fallback into handler + update two stale log lines; (4) force fallback on via `if (false && anthropicKey)` 8-char flip; (5) revert to `if (anthropicKey)`. Each step verified on iPhone before the next. Step 4 verified across Casual Day / Formal Event / Going Out — pool names rendered, real photos, source "fallback", no Anthropic API cost (no `usage {...}` log line), all safety filters active. Step 5 verified Sonnet back across Casual Day / Work · Office / Outdoor · Sport — editorial names, cache 2,375, source "sonnet". SYSTEM_PROMPT NOT touched at any point — cache stayed at 2,375 across every deploy. App.js NOT touched at any point. README.md "What changed" note + step 8/9 prose updated; canonical `index.ts` is the runtime source of truth ✅ DONE 2026-05-14 (Session 7C)
- AI consent modal (Apple Guideline 5.1.2i) wired + KeyboardAvoidingView added to StyleDNA/TodaysVibe/Settings/Delete Account modal + placeholder contrast fixed on TodaysVibe Brief (0.40→0.65) and StyleDNA never-wear (0.35→0.65) + TodaysVibe empty-state when wardrobe is empty (Session 8). Consent modal names Anthropic explicitly, links to anthropic.com/privacy via `Linking.openURL`, saves `ai_consent_given: true` to `user_metadata` on Accept (same pattern as style profile from 7b-0). Gate placed in `handleGenerate` before spam-tap guard. Decline closes modal without saving. Persistence verified across sign-out/sign-in. AuthScreen + WardrobeTab already had KAV; My Closet KAV touch skipped per Grace (Session 15 redesign). All in App.js. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens ✅ DONE 2026-05-16 (Session 8)
- Outfit history persistence (Session 9A/9B/9C) — new `outfit_history` Supabase table (created via dashboard SQL Editor with 4 RLS policies + GRANTs scoped to authenticated; unique index on `(user_id, client_outfit_id)` enables UPSERT; partial index on `(user_id, created_at DESC) WHERE saved = true` for fast saved-outfits listing). New `src/lib/outfitHistory.js` helper (130 lines) exports `upsertOutfitInteraction(outfit, context, patch)` — single entry point supporting `{ rating }`, `{ saved }`, `{ appendWornDate }` patches; worn-date append is read-modify-write to silently dedupe same-day re-taps; same outfit ID always produces identical snapshot values so rewriting via UPSERT is a safe no-op. Also `fetchSavedOutfits()` (newest-saved-first, returns `{id, vibe, name, description, itemIds, ...}` — written for Session 12, not yet called) and `markItemsWorn(itemIds)` (bumps `wardrobe_items.times_worn + last_worn` per item, best-effort with per-item `console.warn`). App.js: two MainAppScreen wrappers (`handlePersistInteraction` curries `lastPayload` context away so callers pass only `outfit + patch`; `handleMarkItemsWorn` fire-and-forget); passed as `onPersistInteraction + onMarkItemsWorn` props to YourLooksTab. `handleRate`, `handleWornToday`, `toggleSave` all changed to accept full `outfit` object instead of `outfit.id`. Local UI behavior identical. Lazy persistence — row inserted only on first interaction. Step 5 of original plan (lift savedOutfits to MainAppScreen + load from DB on mount + render Saved Outfits modal from DB snapshots resolved against current wardrobeItems) DEFERRED to Session 12 (Saved Outfits + Search) where Mood Board polaroid placeholders + Hanger View `item.image` mismatch will also be fixed (Sessions 9D + 9E land later today). Pre-existing bug fixed: original `handleWornToday` never touched any wardrobe item state. App.js net diff +43 lines / -14 lines across sixteen tiny edits in 5 distinct regions. Verified end-to-end on iPhone. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens ✅ DONE 2026-05-16 (Session 9A/9B/9C)
- Mood Board real photos + Hanger View fix + Share Card (Session 9D/9E/9G) — Three visual fixes in App.js, all in one session. (9E Hanger View) Five `.image` → `.photoUri` swaps in the Hanger View centre stack, side card, and right-side accessory stack ([App.js:2842-3001](App.js:2842)) — real wardrobe photos now render on the hanger across top/dress, bottoms, shoes, light outerwear, and up to 5 accessories; `MOOD_PLACEHOLDER_COLORS` fallback retained for items without a photo. (9D Mood Board) Two surgical edits in the polaroid system — `MoodPolaroid` single-item branch ([App.js:2177-2185](App.js:2177)) and `MoodAccCell` item fall-through ([App.js:2113-2117](App.js:2113)) both render `<Image source={{ uri: item.photoUri }} />` (92%×92% single / `flex: 1` accessory grid cells) with category color block fallback; polaroid frame, tilt rotations, layout positions A–G, accessory grid math, swatch palette and labels all unchanged. (9G Share Card) Native share sheet wired — `react-native-view-shot@4.0.3` + `expo-sharing@~14.0.8` installed via `npx expo install` (SDK 54 compatible). New `ShareCard` component ([App.js:2245-2286](App.js:2245)) renders an offscreen 360×~480 watermarked card (photo grid + vibe + name + description + sage `#E8E4CE` bar with "Styled by Clozie ✦ Find us in the App Store"). `handleShareOutfit` handler ([App.js:2504-2536](App.js:2504)) spam-tap guarded, checks `Sharing.isAvailableAsync()`, waits 300ms for offscreen mount + image cache settle, `captureRef → PNG → Sharing.shareAsync` with `dialogTitle / mimeType / UTI`. Share Outfit button at [App.js:2820-2826](App.js:2820) now has `onPress`, `disabled={isSharing}`, label flips to "Preparing…". YourLooksTab return wrapped in Fragment so `<ShareCard>` sibling of ScrollView (not clipped). Caption "Styled by Clozie. Wear it or not?" deliberately NOT pre-filled — `expo-sharing` is file-only on both platforms; on-image watermark is the durable brand mark. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens. Zero CLI deploys ✅ DONE 2026-05-16 (Session 9D/9E/9G)
- Session 9F/9H/9J wired (Loading messages + My Closet polish + Circuit Breaker + Recent Outfit History). 9J: rotating loading subtitle every 1.5s ("Browsing your closet ✦" / "Mixing and matching ✦" / "Clozie is working her magic ✦"). 9H: My Closet grid card photos switched to `resizeMode="contain"` + height bumped 120→150, plus `formatLastWorn` helper renders ISO timestamps as "Last worn: May 16" (no year) with `'Never worn'` fallback. 9I: SKIPPED — outfit card photo strip already sized correctly. 9F: circuit breaker (counter in `user_metadata.consecutive_negative_sessions`, increments on all-Nope sessions, resets on Love/Like) + recent outfit history (last 6 outfits from `outfit_history`, injected as "RECENT OUTFITS — already styled, avoid repeating" block between DRESS RULE and WARDROBE POOL in user message) + recovery directive ("* RECOVERY: ... vary the silhouette, mood, or anchor piece") prepended to stylingLines when `recoveryMode=true` + warm sage-pill banner above outfit cards ("I noticed my last few suggestions didn't land. I'm trying something different today — let me know if I'm getting warmer."). Five LOW-risk substeps across App.js + three Edge Function CLI deploys. SYSTEM_PROMPT NOT touched. Cache verified at 2,375 tokens across all three deploys. App.js net diff approximately +95 lines across 14 edits in 6 regions ✅ DONE 2026-05-16 (Session 9F/9H/9J)
- My Closet structural redesign + recovery banner polish (Session 10A) — Seven LOW-risk substeps + one mid-session sub-step in App.js only, each iPhone-tested before the next. Spec source: Clozie_Session15_MyCloset_PinSelector_Spec.docx PART A only (PART B pin selector deferred). (Step 7) YourLooksTab recovery banner: sage-pill → white card with terracotta 3px left-border accent + subtle shadow. (Step 2) Old "Add Another Item" + "Set Today's Vibe →" buttons commented out. (Step 1) Floating + button (56×56 sage circle with white ring, white SVG plus) added as ScrollView sibling, Platform-aware `bottom: 150 iOS / 134 Android`. (Step 1b) Auto-scroll fix — one-shot `onLayout`-driven `scrollTo` lands the panel header at viewport top regardless of tap location. (Step 3) Sticky 50px sage vibe bar at `bottom: 86 iOS / 70 Android`, Outfit Medium 15 white text, scrollContent.paddingBottom bumped 40 → 90. (Step 4) Empty state — full-screen early return when `itemCount === 0 && !showAddPanel`, vertically centered 80px sage hanger SVG + DM Serif 22 heading + Outfit 14 subtext + sage pill button "+ Add Your First Item" white text. TabHangerIcon extended with backward-compatible `size`/`color`/`strokeWidth`/`viewBox` props — tab bar call unchanged. Spec's `paddingTop:80` swapped to true vertical center on Grace's call; trailing ✦ on subtext removed on Grace's call. (Step 5) 👗 emoji fallback replaced with sage-tint placeholder (40px sage hanger + 10px "No photo" muted caption). (Step 6) Pencil moved off the photo to category-tag row, right-aligned in a new flex-row container; no background circle, Outfit 16 espresso glyph, 44px tap target. X delete icon untouched. SYSTEM_PROMPT NOT touched. Cache stays at 2,375 tokens. Zero CLI deploys. ✅ DONE 2026-05-17 (Session 10A)
- My Closet search system + filterWardrobeItems shared utility (Session 10B). Six LOW-risk substeps + one mid-session search fix, each iPhone-tested. (Step 0) New pure utility `src/lib/filterWardrobeItems.js` — case-insensitive name + colour AND category filter, defensive null/non-array guards. (Step 1) Three useState hooks in WardrobeTab: `searchVisible`, `searchText`, `selectedCategory='All'`. (Step 2) Magnifying glass + "Search" button added to header row; `headerRow.justifyContent` flex-start → space-between; active state swaps icon + text color to `#6B7E65` and bg to `rgba(188,199,183,0.3)`. (Step 3) 40px white search bar revealed when searchVisible=true; magnifying glass + TextInput + X reset; X clears searchText, resets selectedCategory to 'All', hides bar. (Step 4) 7 category chips horizontal ScrollView (All · Tops · Bottoms · Dresses · Outerwear · Shoes · Accessories); module-scope `CATEGORY_CHIPS` const for Session 11 reuse; active = sage `#BCC7B7` + white text + white 1.5px inner border (matches Session 10A floating + idiom — deviation from spec's literal "border-color #BCC7B7 + white ring shadow" chosen for cross-platform consistency). (Step 5) `filteredItems = searchVisible ? filterWardrobeItems(...) : items`; grid swaps `items.map` → `filteredItems.map`; result count "Showing N results for X" when searchVisible && searchText non-empty; header count + progress bar continue to use `items.length` (TOTAL wardrobe). **Interpretation B** chosen (filter active only when searchVisible=true). (Mid-session search fix) `filterWardrobeItems` updated to OR-match `name + colour` after user reported "black" returning 0 results for items with colour "Jet Black"; notes excluded. (Step 6 read-only) Wardrobe loading delay diagnosed as race between initial loadItems useEffect and handleAddItem optimistic prepend; recommended fix is merge-by-id in setWardrobeItems setter; deferred to dedicated session. Edge Function NOT touched. SYSTEM_PROMPT NOT touched. Cache stays at 2,375 tokens. Zero CLI deploys ✅ DONE 2026-05-17 (Session 10B)
- Today's Vibe Pin Selector redesigned (Session 11 — Part B of Clozie_Session15_MyCloset_PinSelector_Spec.docx). Three LOW-risk substeps + one mid-session chip-stretch fix, each iPhone-tested. App.js only — Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys. (B1) Must Include card on Today's Vibe redesigned text-only: heading + two stacked subtext lines + magnifying-glass + "Search" button + conditional terracotta pinned pill (✦ + name + X) or muted italic "No item pinned" hint. Old horizontal 👗-emoji thumbnail ScrollView commented out (not deleted); dead `wardrobeItems.length === 0` ternary (unreachable since the Session 8 early-return) dropped with the comment. New `pinnedItem` derived const local to TodaysVibeTab. (B2) Bottom sheet (`Modal transparent animationType="slide"` + `Pressable` backdrop) at 85% screen height with handle bar + header + subtext + search + 7 category chips (reusing `wardrobeStyles.categoryChip` cross-tab for visual parity with My Closet) + "Tap to pin" hint + 2-column grid using `filterWardrobeItems` (Session 10B utility). Pinned card wrapped with 2.5px `#C87A52` border + 24px sage check circle top-right (white inner ring matching Session 10A floating + idiom). New `pinSheetStyles` block (24 entries). `Pressable` added to react-native imports (only new import). Mid-session fix: chips were stretching vertically into huge rectangles — fixed by adding `flexGrow: 0` + `height: 56` to `chipScroll` and `alignItems: 'center'` to `chipScrollContent` (both inside `pinSheetStyles` only — `wardrobeStyles.categoryChip` not touched, My Closet visual byte-identical). (B3) Grid card `onPress` wired: tap already-pinned card → unpin + sheet stays open; tap any other card → set pin + auto-dismiss sheet. End-to-end verified on iPhone: pin from sheet, pill renders, switch pin, generate with pin → all 3 outfits contain the pinned item. pinnedItemId state remains local to TodaysVibeTab — not lifted, not persisted across tab unmount or app reload. Resolves the Known Issue about the pin selector design rethink ✅ DONE 2026-05-17 (Session 11)
- Saved Outfits + Search (Session 12) — Six LOW-risk substeps, each iPhone-tested. (S0) New pure utility `src/lib/filterSavedOutfits.js` — case-insensitive name+colour OR-match across outfit name + item names + item colours, AND with occasion match; mirror of `filterWardrobeItems` pattern. (S1a) `savedOutfits` lifted from YourLooksTab to MainAppScreen as `SavedOutfit[]` (full objects, not ID strings); derived `savedIds` Set for O(1) lookups; toggleSave operates on object array newest-first; saved screen map source uses lifted array directly; latent pre-existing bug fixed (confirmRemove now persists `{ saved: false }` to DB before local filter); DEMO_MODE `['demo-2']` seed dropped. After S1a, saved outfits survive tab switching within a session. (S1b) DB load + hydration. `fetchSavedOutfits()` called on mount via new useEffect; rows hydrated against `wardrobeItems` (resolved via `wardrobeItemsRef = useRef([])` synced via separate effect so the DB load can read current value without including it in deps); merge-by-id preserves optimistic local saves during load window; re-hydration effect watching [wardrobeItems] rebuilds items array when wardrobe changes; SIGNED_OUT listener also resets savedOutfits; toggleSave stamps `itemIds: outfit.items.map(i => i.id)` on optimistic adds for re-hydration compatibility. After S1b, saved outfits survive app reload + sign-out/sign-in + cross-user RLS. (S2) `searchVisible` / `searchText` / `selectedOccasion='All'` state added to YourLooksTab + new module-scope `OCCASION_CHIPS = ['All', 'Casual Day', 'Work · Office', 'Going Out', 'Formal Event', 'Outdoor · Sport', 'Weekend Errands', 'Travel']` with UTF-8 middot byte-verified `c2 b7` matching the Edge Function's canonical strings. (S3) Magnifying glass + "Search" button added inside Saved Outfits modal — new `savedStyles.headingRow` flex-row, marginBottom migrated from heading to row (no layout shift), button gated `savedOutfits.length > 0`; reuses `wardrobeStyles.searchButton*` cross-tab (Session 11 precedent). (S4) 40px white search bar revealed when `searchVisible=true` — placeholder "Search your outfits...", X clears all 3 state pieces; KeyboardAvoidingView added around modal's ScrollView with `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` and `keyboardShouldPersistTaps='handled'` (Saved Outfits modal was untouched in Session 8 because no TextInputs existed then); reuses `wardrobeStyles.searchBarRow` + `searchBarInput` cross-tab. (S5) 8 occasion chips horizontal scroll, gated `searchVisible`; reuses `wardrobeStyles.chipsScroll` / `categoryChip*` styles cross-tab; no Session 11 chip-stretch bug because layout context is a vertical outer ScrollView (same as My Closet), not a column-flex bottom sheet. (S6) Filter wired — `filteredSavedOutfits = searchVisible ? filterSavedOutfits(...) : savedOutfits`; result count "Showing N results for [query]" or "Showing N outfits for [occasion]" with proper plural; "No outfits found" centered when filtered count is 0 (distinct from original "Your saved looks will live here" empty state for `savedOutfits.length === 0`); "N saved looks" + hint hidden during active filter; header `❤️ Saved (N)` pill stays as TOTAL count. KNOWN ISSUE surfaced (NOT fixed this session): occasion chip filter returns 0 results for non-"Casual Day" chips even where `saved=true` rows exist with matching `occasion`; byte audit of source strings passed; DB hex inspection + runtime byte comparison pending Session 13 (see SESSION_13_BRIEF.md). S6-fix plan (read-before-upsert preservation of context fields) drafted but NOT applied — pending root-cause confirmation. Resolves the deferred Step 5 from Session 9C (saved outfits cross-session persistence) ✅ DONE 2026-05-17 (Session 12 — partial, occasion chip filter pending Session 13)
- Quick UI fixes (Session 13A) — Five LOW-risk fixes shipped 2026-05-18, each iPhone-verified before the next. App.js only — Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys. (Fix 2) Share Card watermark text simplified to "Styled by Clozie" (removed both " Find us in the App Store" and the trailing sparkle separator). (Fix 3A) `Keyboard.dismiss()` added before `setShowAddPanel(false)` at all four close sites (X button, Cancel button, handleAddItem save-success, handleSaveEdit save-success); `Keyboard` added to react-native imports. Resolves the Session 10B KAV layout race that was making the sticky vibe bar disappear when X was tapped with keyboard up. (Fix 3B) X close button swapped to the LEFT of the panel heading inside `addPanelHeader` — `justifyContent: 'space-between'` now places X on the left edge and heading on the right; inline `alignItems` on the X TouchableOpacity flipped `flex-end` → `flex-start` so the ✕ glyph hugs the left of its 44×44 wrapper. Eliminates accidental gear-icon taps (the gear at `top: 56, right: 16, zIndex: 10` was within ~20px vertical overlap of the X tap zone in the auto-scrolled position). (Fix 4) Friendly empty search results — both My Closet and Saved Outfits search now show plain text messages ("No items match your search" / "Try a different name or category" on closet; "No outfits found" / "Try a different name or occasion" on saved outfits) when filter returns zero matches. Plain text only — no icons, no sparkles. (Fix 1) Splash logo italic "e" upper-right curve no longer clipped — outer Text wrapper converted to View so the inner Text children get independent measurement (RN's nested-Text pattern doesn't honor inner padding for the parent's clip boundary); `lineHeight: 92` added to `splashLogoZie` for vertical breathing room above the italic ascender at fontSize 72; `paddingRight: 8` retained and now actually applied due to the View wrapper. One Known Issue resolved (Add Item X button inconsistent — Session 10B), one new Known Issue added (Add Item panel doesn't close on outside-tap, scroll-only) ✅ DONE 2026-05-18 (Session 13A)
- Quick UI fixes round 2 (Session 13B) — Three LOW-risk tasks shipped 2026-05-18, each iPhone-verified before the next. App.js only — Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys. (Task 1A) `LOADING_MESSAGES` array at [App.js:2835](App.js:2835) grew 3 → 5 entries: 'Browsing your closet ✦' / 'Mixing and matching ✦' / 'Finding your best looks ✦' / 'Almost there ✦' / 'Clozie is working her magic ✦'. setInterval timing at [App.js:3146-3148](App.js:3146) unchanged at 1.5s; 5 × 1.5s = 7.5s before any repeat. (Task 1B SKIPPED) Font size on loading subtitle stays at 13 — reality check found `loadingTitle` at fontSize 20 ([App.js:9091-9095](App.js:9091)); bumping subtitle to 17 would have crowded the hierarchy. Grace skipped after seeing actual values. (Task 2) Sticky vibe bar at the bottom of My Closet redesigned from a full-width 50px bar into a centered floating pill matching the empty-state pill design language. Three changes in App.js: JSX wrapped existing `<TouchableOpacity>` in `<View style={wardrobeStyles.stickyVibeBarWrapper} pointerEvents="box-none">` at [App.js:1966-1977](App.js:1966); NEW `stickyVibeBarWrapper` style block at [App.js:7977](App.js:7977) (position absolute, bottom Platform-aware 86 iOS / 70 Android, left:0 right:0, alignItems:'center', zIndex:5); `stickyVibeBar` style block at [App.js:7989](App.js:7989) rewritten as a pure pill (height 44, paddingHorizontal 28, borderRadius 22, 2px white border, drop shadow {0,2} opacity 0.10 radius 6 elevation 2 — values byte-identical to `wardrobeStyles.emptyStateButton` at [App.js:7917-7928](App.js:7917)). Critical layout decision: wrapper pattern with `pointerEvents="box-none"` chosen over `alignSelf: 'center'` on absolute child after Grace pushed back on cross-device App Store safety. Wrapper guarantees centering via flex alignItems on full-width positioned parent; `alignSelf: 'center'` on absolute children relies on a Yoga implementation detail with edge cases. `pointerEvents="box-none"` on wrapper preserves tap-through to closet cards in the bottom strip; without it the full-width invisible wrapper would absorb taps. Pill text "Set Today's Vibe →" unchanged (NO sparkle change per directive); gate `itemCount > 0 && !showAddPanel` unchanged; handler `onGoToVibe` unchanged; text style `stickyVibeBarText` (Outfit_500Medium 15 white) unchanged. (Task 3) Consent modal copy update — two text-string changes inside `ConsentModal` at [App.js:6242-6281](App.js:6242), zero logic changes. Body at [App.js:6256-6262](App.js:6256) simplified to "Clozie uses Anthropic to create outfit suggestions from your wardrobe details and style preferences. Learn more about how Anthropic handles data at anthropic.com/privacy." with inner `<Text style={consentStyles.link} onPress={openPrivacyLink}>anthropic.com/privacy</Text>` byte-identical (same terracotta style, same `Linking.openURL`, same literal URL text). Accept button text at [App.js:6268](App.js:6268): "Accept — I'm ready to style ✦" → "Accept". Title "Before Clozie styles you" untouched. Decline button "Not now" untouched. `consentStyles` untouched. All consent LOGIC untouched (gate in handleGenerate, mount useEffect, handleAcceptConsent + handleDeclineConsent, all 4 state hooks). Persistence verified intact across sign-out / sign-in. Sparkle removed on Accept button only — all other sparkles in app (loading messages, Generate button, everywhere else) untouched per Grace's explicit directive ✅ DONE 2026-05-18 (Session 13B)
- Hanger View polish + Your Looks photo strip redesign (Session 13C). Five LOW-risk fixes shipped in App.js, each iPhone-tested. (Step 1 Mood Board investigation) `MoodPolaroid` + `MoodAccCell` `<Image>` resizeMode="contain" added then reverted on Grace's call — `cover` reads better in polaroid frames. ✅ PARTIALLY RESOLVED 2026-05-23 — MoodPolaroid now uses category-aware resizeMode (Shoes use `contain` to prevent toe/heel side-crop; all other categories keep default `cover`). MoodAccCell accessory grid still uses default cover — deliberately untouched. (Step 2 Your Looks outfit card photo strip) 2-col landscape → 3-col portrait redesign: `photoStripItem.width: '47%' → '30%'`, `photoStripThumb.height: 80` swapped for `aspectRatio: 3 / 4`. Default `cover` near-zero-crop now that the box matches typical 3:4 garment photo aspect. Per-thumb item name labels removed from both mapped iteration ([App.js:3297](App.js:3297)) and sample-item fallback ([App.js:3304](App.js:3304)) — narrower thumbs caused heavy truncation; names still in Mood Board polaroids + Sonnet description. `looksStyles.photoStripName` style entry left in place (unused but cheap). (Step 3 Saved Outfits) `<Image>` at [App.js:3983](App.js:3983) got `resizeMode='contain'` — KEPT. (Step 4 Hanger View shoes bigger) `hangerSlotShoes`: top 438→455 (12px clear below pants), marginLeft -52.5→-62.5, width 105→125, height 72→95. (Step 5 Hanger View outerwear card bigger + repositioned) `hangerLightOuterCard`: top 116→90→120 (two-step iPhone feedback — finally hangs visibly below the hanger), width 76→110, height 96→130. (Step 6 dress layout ATTEMPTED + REVERTED) Added `hangerSlotDress` (170×380 at top:80) + `hangerSlotShoesDress` (125×95 at top:470) + dress-aware JSX branch. iPhone test surfaced awkward side-card overlap with the bigger dress. Grace called full revert. Dress outfits still use `hangerSlotTop` (140×158 at y:96) with awkward gap below — known issue, unchanged. Deferred: full dress layout redesign (Fix 2 + Fix 5 headless outfit fallback + Fix 6 side-card sizing) for a dedicated future session ✅ DONE 2026-05-19 (Session 13C)
- Hanger View dress layout fix (Session 13D) — closes the deferred Step 6 from Session 13C. Three small App.js changes + one mid-session number experiment tried and reverted, iPhone-verified before lock. New `hangerSlotDress` style (position absolute, top:88, left:'50%', marginLeft:-92.5, width:185, height:320, alignItems:'center', justifyContent:'flex-start', overflow:'hidden', zIndex:4) + new `hangerImageDress` style (width:'100%', height:'88%' — the actual key, NOT just the parent's flex-start). New module-scope const `DRESS_SHOES_TOP = 418` (10px gap from dress hem at y=408). JSX branch added in the hanger render block: `dress ? <hangerSlotDress + hangerImageDress> : top ? <hangerSlotTop + hangerImage> : null`. `pants` block unchanged (already null when dress exists via categorisation). `shoes` JSX gets inline `[hangerSlotShoes, dress && { top: DRESS_SHOES_TOP }]` override — base `hangerSlotShoes.top:455` byte-identical for non-dress outfits. Z-index ladder unchanged — `hangerSvgWrap` zIndex:6 already sits above dress zIndex:4 (brief's Fix 3 z-index bump turned out unnecessary on inspection). The Image-height-less-than-container-height piece combined with parent flex-start is what actually anchors the photo — neither alone is sufficient because `<Image resizeMode='contain'>` centers its scaled photo internally within Image bounds, not via parent flex. Session 13C's prior attempts (170×310 then 170×380 at top:80, both with `hangerImage` at width:100%/height:100%) failed for this reason — bigger box, same internal-centering, photo still floated. Mid-session number experiment (top:82/height:355/DRESS_SHOES_TOP:445) shipped, iPhone-tested, reverted on Grace's call — first version (top:88/height:320/DRESS_SHOES_TOP:418) won and was locked. Side-card overlap concern from the original 13C Known Issue may or may not still apply at 185-wide — not verified in 13D testing, flag for separate outerwear-positioning session if it surfaces. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys ✅ DONE 2026-05-19 (Session 13D)
- Hanger View headless outfit fix + entrance animation (Session 13E) — Two LOW-risk phases in App.js only, each iPhone-verified before the next. Phase 1: when an outfit has Outerwear + Bottoms + Shoes but no Tops and no Dresses, the categorisation block at App.js:3599-3612 now promotes outerwear from the side card to the centre top slot (`hangerSlotTop` 140×158) via a derived `directTop` / `sideOuter` pattern. One side-card render gate swap at App.js:3724 hides the now-empty side card. Outfits with a real Top or Dress render byte-identical. Phase 2: new staggered drop+fade entrance animation when user opens Hanger View tab or switches outfit. 4 `Animated.Value` refs (centre/pants/shoes/side) in YourLooksTab + new `useEffect` watching `[moodBoardTab, moodBoardOutfit]` running `Animated.stagger(250, [4× Animated.timing({ toValue: 1, duration: 350, useNativeDriver: true })])`. Total ~1100ms. Six render blocks (dress, top, pants, shoes, light outerwear side card, each of up to 5 accessory cards) wrapped in `Animated.View` reading the appropriate ref. Each style adds `opacity: anim` + `translateY: anim.interpolate([-15, 0])`. Existing card rotations (light outerwear `-4deg`, per-accessory `pos.rot`) moved INTO the animated transform array to survive style-array merge order. Native driver, zero JS thread impact. Entrance animation only — no continuous sway yet, deferred. Initial timing (stagger 150 / duration 200, total ~650ms) felt too fast on iPhone, bumped to 250/350. No new imports, no new styles. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys ✅ DONE 2026-05-19 (Session 13E)
- Session 13I wired (AI consent revoke — Apple 5.1.2(i)). Three LOW-risk substeps in App.js only, each iPhone-verified. New `handleRevokeConsent` handler in MainAppScreen mirrors `handleAcceptConsent`'s optimistic pattern (`setConsentGiven(false)` → best-effort `supabase.auth.updateUser({ data: { ai_consent_given: false } })`). New "Styling Permissions" row in Settings DATA card opens confirm modal byte-mirroring Clear Clozie's Memory structure (zero new styles, full reuse of `settingsStyles` row + `savedStyles` confirm-modal styles). 1.5s inline "Consent revoked" body-color flash replaces the `Revoke` link, then swaps back via useEffect setTimeout + clearTimeout cleanup. "Yes, revoke" onPress order: close modal → fire revoke → start flash. Row always visible regardless of `consentGiven`. LANGUAGE RULE compliance: copy uses "Styling Permissions" / "Clozie styling" / "Clozie can generate outfits" — never says "AI" (initial brief's "AI Data Consent" wording caught + replaced before code touched the file). Verified across 6 end-to-end checks: tap Revoke → confirm → modal closes → flash shows → close Settings → Today's Vibe → Generate → ConsentModal reappears (local state propagation); sign out → sign in → same flow again (Supabase persistence). Edge Function NOT touched. SYSTEM_PROMPT NOT touched. Cache stays at 2,375 tokens. Zero CLI deploys ✅ DONE 2026-05-20 (Session 13I)
- Session 14A wired (Privacy Policy + Terms of Service WebViews in Settings — closes the Phase 3 App Store legal-doc requirement). New `expo-web-browser ~15.0.11` dependency (SDK 54 compatible, base `openBrowserAsync` only — `app.config.js` plugin entry deliberately not added because we don't use `openAuthSessionAsync`). App.js: new `WebBrowser` import + two `PRIVACY_POLICY_URL` / `TERMS_OF_SERVICE_URL` Termly constants + new LEGAL card inserted between ABOUT and Sign Out with two rows mirroring the DATA card pattern (label + subtitle + gold `View` link, divider between). `WebBrowser.openBrowserAsync` opens an in-app Safari View Controller / Custom Tabs sheet that swipe-dismisses cleanly. Zero new styles (all existing `settingsStyles` reused). Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys ✅ DONE 2026-05-21 (Session 14A)
- Session 14B wired (offline error messages — branded warm copy across Auth screen + Generate + Photo upload + Recognition; Apple-review-critical airplane-mode handling). Three messages shipped from the original 4 in the brief; Message 4 (3 consecutive Supabase failures escalation) deferred to Phase 2 polish per Grace's pushback (rare scenario, untestable without contrivance, existing fallbacks already warm). New `isNetworkError(err)` pure helper at App.js:61-78 detects RN fetch failures via 6 patterns (4 message substrings + TypeError-network combo + `FunctionsFetchError` + `AuthRetryableFetchError` name checks). Message 1 (Auth offline) wired across Sign Up + Login + Forgot Password × supaErr-branch + catch-block = 6 surgical edits, all routing network errors to terracotta `authStyles.errorText` with "Clozie needs internet to style you. Check your connection and try again." — prior misleading "Email or password doesn't match" on offline login replaced. Message 2 (Generate offline) wired in `handleGenerate` catch block — network branch ahead of existing gate-code cascade — "Clozie needs a connection to style you. Check your connection and try again." in Your Looks empty state. Today's Vibe local selections preserved. Message 3 (Photo offline) wired across `runRecognition` + `handleAddItem` + `handleSaveEdit` catches via new `'offline'` recognition-bar state (reuses existing `recognitionBarError` terracotta style — zero new style entries) — "Your photo didn't go through. Check your connection and try again." Two mid-session sub-fixes after iPhone testing caught that `supabase.auth.getUser()` makes a network call to verify JWT (offline returns null user, triggering misleading "Please sign in again" / "Not signed in" auth-flavored errors that escape `isNetworkError`): 3a swapped `getUser()` → `getSession()` in `handleAddItem` (App.js:1143) + `handleSaveEdit` (App.js:1224); 3b same swap inside `src/lib/wardrobeItems.js:54` (`insertWardrobeItem`) + `src/lib/outfitHistory.js:51` (`upsertOutfitInteraction`). `getSession()` reads from AsyncStorage, no network — downstream Supabase calls produce real network errors offline that `isNetworkError` catches. Step 5a (helper extension) verified `AuthRetryableFetchError` class by reading supabase-js source at `node_modules/@supabase/auth-js/src/lib/errors.ts` + `fetch.ts` + `GoTrueClient.ts` — added explicit `name === 'AuthRetryableFetchError'` to isNetworkError for belt-and-suspenders against future RN/Expo error-message wording changes. All messages: terracotta `rgba(164,74,52,0.88)` (locked UI States color from April 19 2026), Outfit 13px, NO sparkles per directive. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys, zero new dependencies (no expo-network / @react-native-community/netinfo — detection via catch-and-classify) ✅ DONE 2026-05-21 (Session 14B)
- Session 14C wired (TOS + Privacy Policy agreement text on signup screen — Apple-compliance acceptance pattern). Two LOW-risk steps in App.js only. (Step 1) Two new style entries appended to `authStyles`: `legalAgreement` + `legalAgreementLink` — second one byte-identical to `consentStyles.link` (`#A44A34` + underline). (Step 2) New JSX `<Text>` block inserted between the 13+ checkbox and the error message in AuthScreen, gated `{!isLogin && !isForgot}` so it only renders on Sign Up. Copy: "By creating an account, you agree to the Terms of Service and Privacy Policy" with two tappable inline `<Text>` spans opening `TERMS_OF_SERVICE_URL` + `PRIVACY_POLICY_URL` via `WebBrowser.openBrowserAsync(...).catch(() => {})` — same in-app Safari View Controller pattern as Session 14A's Settings LEGAL card. Passive text — no checkbox, no blocking logic, no new state. Reuses Session 14A's `expo-web-browser` + URL constants — zero new dependencies. Closes the Phase 3 App Store requirement for visible TOS + Privacy acceptance at signup. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys ✅ DONE 2026-05-21 (Session 14C)
- Password reset web page wired — `clozie.net/reset-password.html` now works end-to-end on iPhone (Session 15). Cross-repo fix on `creatormama/clozie-website` (separate repo from the native app, single `main` branch, Vercel auto-deploys). The Update Password button was doing nothing on click — no error, no feedback, no button state change. Root cause was a fragile init chain in the inline `<script>`: form-section visible by default in HTML so the visible form didn't prove the script ran; inline `onclick="handleSubmit()"` relied on `handleSubmit` being hoisted to window after a non-guaranteed Supabase CDN + `createClient` chain; and `detectSessionInUrl: true` could fire `PASSWORD_RECOVERY` (showing the form) without actually installing a usable session for `updateUser`. Fix: replaced the entire inline `<script>` block in `reset-password.html` with a robust version — `auth: { detectSessionInUrl: false, persistSession: false, autoRefreshToken: false, flowType: 'implicit' }` config, manual `URLSearchParams` hash parsing, explicit `await supabase.auth.setSession({ access_token, refresh_token })` BEFORE showing the form, `addEventListener('click', handleSubmit)` inside `DOMContentLoaded` instead of inline onclick, `window.addEventListener('error', ...)` + new `setError()` helper that surfaces uncaught errors to the on-page `#error-msg` div, plus `console.error` logging on every failure branch. HTML change: one line — removed `onclick="handleSubmit()"` from button. `togglePassword` eye-toggle inline `onclick` preserved. `index.html` redirect script untouched. Supabase project URL + publishable key + CDN URL all identical. Single commit `177cc1f` on `main` of `creatormama/clozie-website` (98 ins / 45 del, +53 net lines, 208 → 261). End-to-end iPhone verified — real email link → form → new password → "Updating…" → green ✓ success → signed in with new password. Closes the third and final piece of the forgot-password flow (Session 2 wired the in-app call; this session makes the email landing page actually work). Apple App Store submission blocker resolved. Native app NOT touched ✅ DONE 2026-05-22 (Session 15)
- Session limits + VIP table backend wired (Session 16A — backend only, App.js wiring lands in Session 16B). Two new Supabase tables via dashboard SQL paste: `vip_emails` (email text PRIMARY KEY + created_at, 4 RLS-scoped VIP rows seeded, SELECT policy `email = (auth.jwt() ->> 'email')` so users only see their own row, no enumeration) + `session_log` (id uuid PK + user_id uuid FK auth.users ON DELETE CASCADE + created_at timestamptz, `(user_id, created_at DESC)` index, RLS SELECT + INSERT scoped to `auth.uid() = user_id`, no UPDATE/DELETE — rows immutable). Three CLI deploys of `generate-outfits` Edge Function across 3 substeps, each iPhone-verified before next. (Substep 1) VIP check + 7-day session count via parallel `Promise.all` between gate 6 and safety filter; new `isVip: boolean` + `sessionsUsedThisWeek: number` fields added to all 3 success response shapes; value at this point is count BEFORE today's pending insert. (Substep 2) `session_log` INSERT at each of 3 success return points before `jsonResponse(...)` — two-layer error handling (Supabase JS SDK `{ data, error }` destructure + outer `try/catch` for runtime exceptions); `sessionsUsedThisWeek` in response bumped to `+1` reflecting post-insert count; awaited not fire-and-forget (~50ms negligible vs Sonnet) so Substep 3 gate is accurate; inner `catch` renamed to `innerErr` in stub path to avoid shadowing outer `catch (e)`. (Substep 3) Gate 7 between session-check block and safety filter: `if (!isVip && sessionsUsedThisWeek >= 12) { return jsonResponse({ error: 'session_limit_reached', message: "You've used all 12 styling sessions this week. Your earliest session refreshes soon." }, 400) }`. VIPs bypass via short-circuit `!isVip`. `>= 12` not `> 12` because count is BEFORE pending insert — 13th attempt blocks at count=12. Diagnostic log on gate fire. Warm spec-quoted message satisfies LANGUAGE RULE. End-to-end verified via fresh non-VIP test account: sign out of VIP main, sign up new account, AI Consent Accept, SQL-paste 5 placeholder items (3 Tops + 1 Bottoms + 1 Shoes — passes gate 5), generated 12 times naturally with counter incrementing 1→12 in responses, 13th blocked with `session_limit_reached` in Supabase Logs + 400 response + zero session_log row for blocked attempt, 14th same block confirming consistency, then signed back into VIP main account and re-verified VIP bypass works in production. App.js NOT touched. SYSTEM_PROMPT NOT touched — cache verified at 2,375 across all 3 deploys ✅ DONE 2026-05-23 (Session 16A)
- Session limits + VIP bypass client wiring (Session 16B — App.js only). Five LOW-risk substeps, each iPhone-verified before next. (Step 1) Wardrobe cap 30 → 50 — `maxItems = 30` → `50` at App.js:1167 (progress bar width auto-recalculates); Free plan card text 30 → 50 at App.js:5002. (Step 2) VIP check wired — new `isVip` useState in MainAppScreen + new useEffect calling `supabase.auth.getSession()` + `supabase.from('vip_emails').select('email').eq('email', userEmail).maybeSingle()` on mount AND on SIGNED_IN / TOKEN_REFRESHED / USER_UPDATED auth events (SIGNED_OUT silently clears to false). `getSession()` chosen over `getUser()` for offline safety per Session 14B precedent. Fail-safe to false on any query error. New `[VIP check]` diagnostic log per check + `[VIP check] query error:` / `[VIP check] failed:` console.warns. Fresh check every login — no caching across sessions per LOCKED-2026-05-12 directive. (Step 3) Wardrobe cap enforcement + 48/49/50 nudges + VIP bypass — `isVip` prop drilled to WardrobeTab; new derived `wardrobeNudge` (null for VIPs, 48→"2 spots left", 49→"1 spot left", 50→"Your wardrobe is full"); header count line VIP-aware via inline ternary (`X items` for VIPs vs `X/50 items` for non-VIPs); new `<Text style={wardrobeStyles.wardrobeNudge}>` between count row and progress bar with new terracotta `rgba(164,74,52,0.88)` Outfit_400Regular 13 style; floating + button gated `(isVip || itemCount < maxItems)` so non-VIPs at cap can't open the Add panel; belt-and-suspenders early-return in `handleAddItem`. (Step 4) `handleGenerate` reads response — new `sessionsUsedThisWeek` useState in MainAppScreen, reset to null on new generation start, captured from `response.sessionsUsedThisWeek` on success with `typeof === 'number'` guard. New `[VIP mismatch]` console.warn if `response.isVip` and client-side `isVip` ever disagree. New error-code branch `session_limit_reached` maps to warm spec-quoted "You've used all 12 styling sessions this week. Your earliest session refreshes soon." Two new props (`sessionsUsedThisWeek`, `isVip`) passed to YourLooksTab. (Step 5) Session nudge UI — new derived `sessionNudge` (null for VIPs, 9→"3 styling sessions left this week.", 11→"1 styling session left this week."); new conditional render between recovery banner and outfit cards map gated `sessionNudge && hasGenerated && outfits.length > 0` (same gate as recovery banner so nudge never appears on empty/loading/error states); new `looksStyles.sessionNudge` entry (Outfit_400Regular 13, `rgba(164,74,52,0.88)`, textAlign center). End-to-end verified on iPhone: VIP path generates with no nudge, plain count, no `[VIP mismatch]` warnings, floating + always visible; non-VIP path shows nudges at 9 and 11 + blocked at 12 with warm message. App.js net diff approximately +60 / -8 lines across 18 surgical edits in 6 regions. Zero new files, zero new dependencies, zero CLI deploys. SYSTEM_PROMPT NOT touched. Cache stays at 2,375 tokens ✅ DONE 2026-05-23 (Session 16B)
- SYSTEM_PROMPT Rule 13 + 3-check server-side outfit structural validation wired (Session 17F). Three CLI deploys, each iPhone-verified. Deploy 1: Rule 13 inserted between Rule 12 and VOICE section, single line matching existing rules format, UTF-8 byte-verified (em-dash count 33 → 34, zero middots, zero mojibake). SYSTEM_PROMPT cache 2,375 → 2,442 tokens (~19% headroom above 2,048 threshold). Round-trip verified via Supabase Logs (Call 1 cache_creation 2,442, Call 2 cache_read 2,442). Deploy 2: server-side Check 1 (Top/Dress requirement → positional `buildSmartFallback` replacement, distinct outfits preserved) and Check 2 (Accessories trim if outfit > 6 items) inside `if (mapped)` block in index.ts — Map<id, Item> lookup, dynamic `finalSource` ('sonnet' unless all 3 replaced), `buildSmartFallback` wrapped in try/catch (graceful fail — log warn, leave outfits, never crash). Deploy 3: Check 3 (Bottoms dedupe with pinned-preference — `keepId = (pinned && bottomIds.includes(pinned.id)) ? pinned.id : bottomIds[0]` preserves pinned-item contract from `validateAndMapOutfits` line 714 in the edge case where user pins a Bottom and Sonnet adds another). Cache stayed at 2,442 across all post-Deploy-2 and post-Deploy-3 calls (SYSTEM_PROMPT untouched after Deploy 1). Closes the May 19 (Session 13C) Known Issue about Sonnet two-bottoms-no-top outfits AND the residual "Top + 2 Bottoms" edge case in one session. App.js NOT touched. Edge Function net diff +70 lines total (1,462 → 1,532) across three deploys ✅ DONE 2026-05-23 (Session 17F)
- Clear Clozie's Memory wired end-to-end (Session 19A) — DELETE outfit_history rows + UPDATE wardrobe_items wear counters to zero + DELETE session_log rows via new `clearClozieMemory()` helper in `src/lib/outfitHistory.js`. SettingsScreen handler awaits helper, shows 1.5s "Memory cleared" inline flash on success or 4s terracotta inline error on failure (auto-dismiss, "Clear" link stays visible for retry). Local state reset on success: savedOutfits + generatedOutfits + generationStatus + generationError + sessionsUsedThisWeek + lastPayload. Wardrobe items themselves, My Style preferences, ai_consent_given, and account all deliberately untouched. Modal body copy updated to reflect that saved outfits ARE cleared. Local refresh of `wardrobeItems.lastWorn` deferred — same class of bug as the existing Session 9H Known Issue (markItemsWorn local refresh), tackle together in a polish session. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,442 tokens, zero CLI deploys, zero new dependencies ✅ DONE 2026-05-23 (Session 19A)
- Session 19C Apple HIG accessibility fixes wired — 9 LOW-risk App.js fixes after a 7-category read-only audit + SVG stroke/fill sweep. Tab bar labels + 2 placeholder captions fontSize 10 → 11 (Apple HIG 11pt minimum). Today's Vibe chips × 3 + filter chips × 3 sites got hitSlop additions for 44pt-effective tap targets. Recognition bar scanning text + 3 pinned-pill text colors swapped #C87A52 → #A44A34 (April 28 lock — UI text uses #A44A34, #C87A52 logo-only). White → espresso on 5 sage button text labels + floating + button SVG glyph (Apple WCAG AA contrast supersedes Session 10A/13B "white text" lock — matches existing primaryButtonText pattern at App.js:9931 Save Feedback button). VIP check console.log no longer leaks user email to Metro / Xcode Console / future crash-reporting SDKs. Three audit findings deliberately SKIPPED after verification (dead-code `label` style, decorative `<View>` mockup misidentified as tappable tab, pinned pill X already had hitSlop). Full SVG sweep verified 13 PASS + 3 EXEMPT (decoration / inactive UI per WCAG 1.4.11 exceptions) + 1 HIDDEN + 1 added MUST FIX (floating + button glyph). App.js net diff ~+11/-4 lines across 17 surgical edits. Edge Functions NOT touched. SYSTEM_PROMPT NOT touched. Cache stays at 2,442 tokens. app.config.js NOT touched (bundle ID + splash icon + privacy manifest are separate EAS Build session) ✅ DONE 2026-05-24 (Session 19C)
- Session 19D wired (app.config.js setup for App Store submission — bundleId + icon + splash + privacy manifest + light mode + no tablet + Liquid Glass opt-out). Seven LOW-risk substeps in app.config.js only, each shown as a diff and approved before applying. Two new files created: `assets/clozie-icon-sage-larger-1024.png` (1024×1024 RGB, Apple-compliant no-alpha icon, SHA1 byte-verified copy from `~/Desktop/`) and `assets/splash-clozie.png` (880×440 RGBA transparent 3x retina, generated via Python+Pillow using DM Serif Display TTFs from node_modules). Splash renders "Clozie" wordmark + "YOUR PERSONAL STYLIST" label — sparkle ✦ chars removed from splash PNG mid-session because Outfit font lacks U+2726 and SFNS fallback rendered wrong glyph (full sparkles preserved in the React `<SplashScreenView>` after JS loads). app.config.js gained: `icon`, `userInterfaceStyle: 'light'`, `ios.bundleIdentifier: 'com.clozie.app'`, `ios.supportsTablet: false`, `ios.infoPlist.UIDesignRequiresCompatibility: true`, `ios.privacyManifests` (AsyncStorage NSUserDefaults reason CA92.1 + NSPrivacyTracking false + empty domains/data-types), `expo-splash-screen` plugin in plugins array. App.js NOT touched, Edge Functions NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,442 tokens, zero CLI deploys, zero new dependencies. Commit `89fc306` on testing branch, pushed to `origin/testing` (main untouched). Unblocks App Store EAS Build prerequisites that were called out in Session 19C as needing a separate session ✅ DONE 2026-05-24 (Session 19D)
- Branded Clozie password reset email template live in Supabase dashboard (Authentication → Email Templates → Reset Password). Subject: "Reset Your Clozie Password". Body: sage `#E8E4CE` background + Clozie logo + "Reset My Password" CTA button. Confirmed visually by Grace 2026-05-24 ✅ DONE 2026-05-24
- Custom SMTP (Resend) for password reset email delivery — fully configured 2026-05-05 (the day after the Session 2 deferral was written). Resend domain `clozieapp.com` verified; SMTP credentials (`smtp.resend.com`, port 465, sender `noreply@clozieapp.com`) pasted into Supabase Authentication → SMTP Settings; iPhone test confirmed reset email arrived from Clozie. The "deferred to its own session" Phase 2 line that previously sat here had been stale from 2026-05-06 onward — corrected on 2026-05-24 ✅ DONE 2026-05-05
- SYSTEM_PROMPT Rule 6 amended + Rule 14 added (Session 19E). One CLI deploy. Rule 6 extended with one sentence: "Brief item requests are ADDITIONAL — include them in every outfit alongside any pin, not instead of it." Closes the failure mode where Sonnet would substitute brief-named items for the pin instead of stacking both. New Rule 14 inserted between Rule 13 and VOICE: "14. BRIEF MATCHING: When the Brief names an item with a color (white top, black dress, blue jeans), match both the garment AND the color from the pool. Do not substitute a different color." iPhone-verified post-deploy: pin enforcement still works, Rule 6 amendment WORKS (pin + brief garment-type both honored in all 3 outfits across multiple test runs), Rule 14 garment-type matching WORKS, Rule 14 color matching does NOT work in real-world testing (Sonnet ignores color qualifiers). Color enforcement deferred to a JavaScript-level solution in a future session — Rule 14 left in prompt as dormant guidance per Grace's call (neither hurts nor helps). SYSTEM_PROMPT bytes 8,947 → 9,242. em-dash count 34 → 35. Cache tokens ~2,442 → 2,510 (verified via cache_read_input_tokens round-trip in Supabase Logs). UTF-8 byte audit clean before deploy (zero mojibake). App.js NOT touched. recognize-photo / delete-user NOT touched ✅ DONE 2026-05-24 (Session 19E)
- Session 20 wired (This Week You Wore / Your Week calendar pill on Your Looks tab). UI-only feature reading existing outfit_history.worn_dates populated by Session 9B's "I wore this today" flow. New fetchWornOutfits() helper in src/lib/outfitHistory.js (selects rows with non-empty worn_dates, client-filters, reuses rowToSavedOutfit). New wornOutfits state lifted to MainAppScreen with mount load + re-hydration on [wardrobeItems] + reset on SIGNED_OUT + reset on Clear Clozie's Memory mirroring Session 12 savedOutfits byte-for-byte. New 📅 pill in YourLooksTab heading row (plain emoji styled identical to Saved button — no pill chrome — with hitSlop bumped for HIG 44pt+ effective tap target). New bottom sheet reuses pinSheetStyles cross-tab. Week-dot row Mon→Sun in LOCAL time via new module-scope helpers (toLocalYMD/getMondayOfWeek/buildWeekDays/formatWeekRange) + WEEK_DAY_LABELS const. selectedDay defaults to today, resets on every sheet open. Date-range subtitle with U+2013 en-dash and multi-month support. wornByDay map derived per render bucketed by LOCAL date with per-outfit per-day dedupe; days with wears render terracotta dots, days without render hollow. Mini white outfit cards stacked vertically below dots for selectedDay: vibe eyebrow + DM Serif outfit name + horizontal 56×56 photo thumb row. Empty day renders "No outfit logged" muted centered text (no card, no sparkle). Optimistic update in handleWornToday with same-day UTC dedupe matching DB layer — pill visibility AND dot fills AND day-content card refresh without reload. Subscription Free card extended with "Log what you wore — track your week" bullet. Closes the May 13 2026 Feature Map line "This Week You Wore (Free Plan)". Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,510 tokens, zero CLI deploys, zero new dependencies, zero schema changes ✅ DONE 2026-05-26 (Session 20)
- Apple Sign-In wired — `expo-apple-authentication ~8.0.8` + `supabase.auth.signInWithIdToken({ provider: 'apple', token })`. Official `AppleAuthenticationButton` (buttonStyle BLACK, cornerRadius 12, height 52) replaces previous custom-SVG TouchableOpacity placeholder. Reuses existing AuthScreen state (`loading` / `error` / `isNetworkError` / `onDone` / `supabase`) — zero new state hooks. Routes signup vs login by Apple's `credential.fullName` presence (Apple returns it ONLY on first sign-in per Apple's documented behavior) — first-time users → Post-Login Welcome (matches email signup), returning users → straight to main (matches email login). First-time signups also best-effort persist `full_name` via `supabase.auth.updateUser`. Silent on user cancel (`ERR_REQUEST_CANCELED`); warm Clozie message on network errors (via existing Session 14B `isNetworkError` helper); generic 'Something went wrong' on other Supabase errors. Loading-state tap blocking via `<View opacity / pointerEvents>` wrapper (`AppleAuthenticationButton` has no `disabled` prop). `Platform.OS === 'ios'` gate. `app.config.js` plugins array gained `"expo-apple-authentication"` for EAS Build entitlement auto-sync. Email + Sign Up + Forgot Password + hidden Google block all verified byte-identical to pre-session state. Code-complete in Expo Go; end-to-end auth flow test requires TestFlight Build 6 (`eas build --profile preview --platform ios --non-interactive` then `eas submit --platform ios`) since Expo Go lacks the native iOS Sign In with Apple entitlement ✅ DONE 2026-06-03 (Session 22)
- Clozie smarter learning — smarter note-saving + pattern detection after 5+ ratings
- Native sharing — outfit cards + Clozie watermark — works on iPhone + Android
- Save to camera roll — Expo MediaLibrary
- Complete The Look fully connected to boutique partners
- Store Suggestions in Mood Board fully connected
- Wardrobe Intelligence fully working
- Outfit Wear History saving to Supabase correctly
- What Goes With This fully working
- Daily Notifications — Expo Notifications, 7:30am default, permission prompt on first open

## PHASE 3 — App Store + Google Play

- Submit FREE version only — do not wait for Pro
- Privacy Policy screen built inside app — required before submission
- Apple Developer Program: $99/year — pay only when ready
- Submit using EAS Build + EAS Submit
- Grace approves all store listing copy, screenshots, and icon before submitting
- TestFlight Build 5 LIVE on iPhone — first working standalone. Build 4 had splash-screen-stuck bug, fixed by creating EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY in EAS preview + production environments via `eas env:create`. Apple Developer enrollment + bundle ID + App Store Connect app + Internal Testers group + App Store Connect API Key (ADMIN, Key ID RT93WYL7A4) all live. End-to-end iPhone-verified across all screens, no crashes ✅ DONE 2026-06-03 (Session 25)

## PHASE 4 — Pro Plan + Stripe

- Build Trip Planner FIRST — fully working and tested
- Build Clear Out FIRST — fully working and tested
- Build Clothes Swap FIRST — fully working and tested
- THEN connect Stripe — Pro launches with all three features ready on day one
- Pro: $6.99/month or $67.99/year
- DO NOT enforce limits until Stripe is fully live and tested

## PHASE 5 — Elite Plan

- Build after Pro revenue exists
- Photo Outfit Matching — ALL stores
- Shop For Me — ALL stores, Surprise Me + questionnaire
- Event Planner — multi-user, group coordination
- Virtual Try-On, AI Editorial Photos, Trend Awareness, Sale Alerts
- Elite: $9.99/month or $95.99/year

## PHASE 6 — PhotoRoom Background Removal

- Only after Stripe is live and paying customers exist
- Grace decides when to add this — added silently — no announcement needed
- Available to ALL users — Free and Pro — not gated
- Cost: $0.02 per image — free tier 250 images/month
- Get API key at photoroom.com/api
- Add EXPO_PUBLIC_PHOTOROOM_KEY to Expo environment variables
- Nothing breaks if key is missing — falls back to original image safely

## LATER — Future Features

- Polish language — auto-detected from phone settings, added in Settings
- Wardrobe Intelligence + Trend Awareness combined (Elite)
- Product Hunt launch — preparation only, no code needed
- Google Play refinements post-launch

---

# SHARING RULES — APPLIES TO EVERYTHING SHARED FROM CLOZIE

"Styled by Clozie ✦ Find us in the App Store"

This applies to: outfit cards, swap cards, packing lists, voting cards, seasonal reports.
No exceptions. Ever.

Pre-written caption Clozie suggests when sharing an outfit: "Styled by Clozie. Wear it or not?"
User just taps share — caption is pre-filled. No friction.

---

# TOOLS GRACE USES

- Claude Desktop app — claude.com/download — this is where Claude Code lives
- Claude Code — inside Claude Desktop — Grace types plain English, Claude Code builds
- Expo Go — free app on iPhone — used to test on phone
- Terminal — Grace opens this ONE time per session to type: cd ~/Desktop/Clozie\ Native, then nvm use 20 && npx expo start
- Claude.ai chat — strategy, decisions, colors, brainstorming, questions

---

# BUSINESS TASKS

TRADEMARK — FILED March 22, 2026. Serial 99717374. In review queue.
Clozie filed in Class 042. TM symbol usable now. Full approval pending. USPTO account uses insuredbyjacek@msn.com.

DOMAIN — clozie.net (registered).

LANDING PAGE — clozie.net is LIVE and looks good (confirmed May 22, 2026). Framer redesign no longer urgent — revisit only if needed post-launch.

EMAIL — hello@clozie.net (Namecheap Private Email).

EMAIL DOMAIN (TRANSACTIONAL) — clozieapp.com (verified May 5, 2026, used for Resend SMTP / password reset email delivery). Distinct from clozie.net (marketing site). Never confuse the two — Apple submissions, share cards, and user-facing copy reference clozie.net only.

LLC — Clozie LLC approved April 13, 2026. Registered with Northwest Registered Agent. Address: 418 Broadway STE N, Albany NY 12207.

D-U-N-S — RECEIVED May 5, 2026. Apple Developer enrollment can proceed.

APPLE DEVELOPER — Organization enrollment (Clozie LLC) APPROVED June 2, 2026. Team ID: T9PZ9RW7F5. Bundle ID `com.clozie.app` registered. App Store Connect app created (Apple ID 6775998682). TestFlight LIVE as of June 3, 2026 (Session 25) — Build 5 distributed via Internal Testers group, Grace as first tester. App Store Connect API Key for `eas submit` automation: ADMIN role, Key ID RT93WYL7A4.

COMPLIANCE — GDPR handled via Termly from day one — applies to any EU user who downloads regardless of marketing.

PAYMENTS — Pro subscriptions on iOS use Apple In-App Purchase via RevenueCat in Phase 4. Stripe is not used for in-app purchases. Older Stripe-in-app guidance is obsolete.

ANTHROPIC DATA HANDLING — point to their privacy policy, never promise on their behalf. Correct language: 'Your wardrobe photos and style preferences are processed by Anthropic to generate outfit suggestions. For details on how Anthropic handles data, see their privacy policy at anthropic.com/privacy.' Do not claim Anthropic does or does not store photos.

REFUNDS — handled by Apple, not by Clozie. TOS must state: 'To request a refund, visit reportaproblem.apple.com or contact Apple Support.'

REASONABLE PERSONAL USE — unlimited wardrobe clause: 'Accounts used for commercial purposes, automated bulk uploads, or activity inconsistent with personal wardrobe management may be suspended.'

SHARE CARD CONTENT PROTECTION — user retains ownership of photos. Clozie watermark may not be removed. User grants limited license for promotional use with credit.

AI CONSENT MODAL (Apple guideline 5.1.2(i)) — one-time modal before first outfit generation. Title: 'Before Clozie styles you'. Body explains Anthropic processes wardrobe photos, links to anthropic.com/privacy. Buttons: 'Accept — I'm ready to style ✦' and 'Not now'. Shown once, consent stored in Supabase. Must name Anthropic explicitly.

AFFILIATES — Commission-only — no upfront cost to partners ever.
Sign up in this order when Shop For Me is ready to build:
- Avara — avara.com — 10% START HERE
- Shopbop — shopbop.com — 10%
- Revolve — revolve.com/affiliate — 5-20%
- Anthropologie — anthropologie.com — competitive commission
- ModCloth — modcloth.com — boutique, real women, vintage-inspired
- FarFetch has closed down — do not use.

For small independent boutiques not on any affiliate network — Grace emails them directly using the boutique outreach email template.

INSTAGRAM — @styledbyclozie
3 posts per week minimum.
"I have nothing to wear. I built an app that fixes it in 30 seconds."

---

# COMPETITIVE ADVANTAGES OVER ALTA

- Clear Out with Sell / Donate / Swap — nobody has this
- Clothes Swap — nobody has this
- Trip Planner using YOUR actual wardrobe + manual weather input — nobody does it this way
- Wardrobe Intelligence — tells you exactly why your wardrobe feels broken — nobody has this
- What Goes With This — instant pairings from your own wardrobe — nobody has this
- Shop For Me via ALL stores including boutiques
- Warm, friendly, everyday feel — vs Alta's cold luxury positioning
- Accessible pricing — $6.99/month
- iOS + Android from day one — same codebase, one build

---

# NEW CHAT STARTER — PASTE THIS AT THE START OF EVERY CLAUDE CODE SESSION

I am Grace. I am the non-technical solo founder of Clozie.
I am building Clozie as a React Native Expo app.
I work on a MacBook. The terminal commands I use are: cd ~/Desktop/Clozie\ Native, then nvm use 20 && npx expo start
Everything else I do through Claude Code in plain English.

Stack: React Native + Expo + Supabase + Anthropic Claude API

VIP emails — never remove under any circumstances:
- insuredbyjacek@msn.com
- zuzia.starz@gmail.com
- stefka992001@gmail.com
- jacek9901@gmail.com

CLAUDE.md is in the root folder of this project.
Read it completely before doing anything else.

App_ORIGINAL.jsx is the existing web app — my working reference.
Use it to understand every screen, flow, and feature. Never touch it.

My rules for every session:
- Plain English only — no jargon
- Show me the full plan before doing anything
- One step at a time — wait for my approval at each step
- Every step must be LOW risk — if not LOW, break it into smaller steps
- Grace approves every single step before the next one begins — no exceptions
- Complete files only — never partial edits
- If anything breaks — revert immediately, never pile fixes
- Label every working version with date + description
- I need proof everything works before we move forward
- Never say AI to users — always say Clozie for anything visible in the app

Now read CLAUDE.md and tell me you are ready.

---

# SETUP STATUS — March 27 2026

COMPLETED:
- MacBook Air M5 set up
- Node.js installed
- Expo Go installed on iPhone
- Claude Desktop installed
- GitHub connected — creatormama/clozie repository
- Supabase keys added to project (.env file — stays local, never goes to GitHub)
- Anthropic API key added to project (.env file — stays local, never goes to GitHub)
- app.config.js created — Expo reads keys correctly
- Version tagged: v2026-03-26

NEXT SESSION:
- Initialise the Expo/React Native project properly so npx expo start works
- Test on iPhone via Expo Go — scan QR code and see something on screen
- Only after that confirmed working — begin Phase 1 screen rebuild

---

Created March 2026.

Drop this file into the root of the clozie-native project folder.
Drop App_ORIGINAL.jsx in the same folder as reference.
Claude Code reads CLAUDE.md automatically at the start of every session.
