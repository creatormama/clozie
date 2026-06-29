# CLOZIE — Session Notes

Rolling, append-only log of what happened in each session. Newest entry at top.

This file is NOT auto-loaded — read on demand when you need detail beyond the CURRENT BUILD STATE snapshot in CLAUDE.md.

Format: every entry uses the locked structure (Branch / Commits / Edge Function deploys / Cache token count / Goals / What changed / Tests / UNVERIFIED / Notes). Keep entries scrollable on a single screen; spillover means the detail belongs lifted into CLAUDE.md as a rule, or split into a follow-up session.

Session numbering reset to "Update N — Session M" starting 2026-06-21. All legacy sessions through Build 12 live in CLAUDE.md prose + CLAUDE_ARCHIVE.md.

---

## Update 1 — App Store Submission — 2026-06-29 — Version 1.0.1 / Build 14 submitted to App Store

**Branch:** testing (HEAD at session start: `476130c`; HEAD at session end: `01c1d0f`)
**Commit(s):** `01c1d0f` "Bump version to 1.0.1 for Build 14 (App Store update)" — single commit on testing bumping `app.config.js` + `package.json` version from `1.0.0` → `1.0.1`. No app code touched.
**Edge Function deploys:** 0.
**Cache token count:** 2,510 (unchanged — SYSTEM_PROMPT not touched).
**App Store impact:** Build 14 / version 1.0.1 submitted to App Store. Currently "Waiting for Review" with **MANUAL** release. Build 12 / v1.0.0 remains the immutable production pointer (tag `v1.0.0-build12-appstore-live`, branch `production` at `9d617db`) until Build 14 is Apple-approved AND released.

### What happened
- Built Build 13 against version 1.0.0 first. App Store Connect rejected it at AUTOMATED PROCESSING (not human review) with errors **90186** ("Invalid Pre-Release Train") and **90062** — both flagging that the bundle's version string (1.0.0) collided with the already-shipped Build 12 / v1.0.0. App Store Connect requires the version string to bump for any new App Store release, even when the build number increments.
- Fix: bumped `version` from `1.0.0` → `1.0.1` in `app.config.js` AND `package.json`. Single commit `01c1d0f` on `testing`. No app code touched.
- Rebuilt as Build 14 via EAS against version 1.0.1. Build succeeded.
- Uploaded the IPA to App Store Connect via **Transporter** (the standalone macOS upload app, not `eas submit`). Processing accepted cleanly — no 90186/90062 this time.
- Submitted Build 14 for App Store review. **Status: Waiting for Review. Release method: MANUAL** (will not auto-release on approval — Grace presses Release herself).
- Reviewer demo login confirmed working pre-submission: `hello@clozie.net` signs in cleanly, full app reachable end-to-end.

### Dynamic Type cap finding (for next session — read-only investigation queued)
- Real-iPhone test today against the 1.3× font cap shipped in Update 1 — Session 3 (`Text.defaultProps.maxFontSizeMultiplier = 1.3` and `TextInput.defaultProps.maxFontSizeMultiplier = 1.3` around App.js:52-57).
- The cap **HOLDS** under the standard Settings > Display & Brightness > Text Size slider — text scales up to ~1.3× and stops, layouts look fine.
- The cap **DOES NOT HOLD** under iOS Accessibility > Display & Text Size > Larger Text — text scales past 1.3× and layouts break across many screens.
- Cross-check: other apps on the same phone DO cap correctly under accessibility mode, so this is not a global iOS bug — Clozie's cap is not being applied to the iOS accessibility text-size pipeline.
- Conclusion: this is a "cap not holding under accessibility larger text" investigation, **NOT** a confirmed 7-screen layout rework. Next session opens with read-only diagnosis.

### Tests
- Build 14 IPA uploaded to App Store Connect via Transporter — no processing errors (vs Build 13's 90186 + 90062).
- Submitted for review — App Store Connect accepted.
- Reviewer demo login (hello@clozie.net) verified working from a fresh iPhone session before submission.

### UNVERIFIED
- Build 14 has not yet been reviewed by a human Apple reviewer.
- Build 14 has not yet been released to App Store users (MANUAL release; Grace presses Release after approval).
- All "UNVERIFIED until Build 13" items in earlier sessions (Daily Notifications firing + tap routing — Session 7; long-sleep session refresh + Apple Sign-In end-to-end — Session 1; Dynamic Type cap on TestFlight standalone — Session 3) carry forward — they will now first ship to real users via Build 14 once released.

### Notes
- Version-bump rule learned the hard way: bumping ONLY the buildNumber (`14`) without bumping the version string (`1.0.0`) is not enough for App Store Connect — every new App Store release needs a fresh version string. TestFlight tolerated this in earlier sessions; App Store submission does not.
- Update 1 work-stream is now closed (submitted). Next active work-stream is **Update 2 = version 1.0.2**, scoped (per Grace's call) to: (a) Dynamic Type accessibility-cap fix and (b) background removal.
- Production pointer (`production` branch, tag `v1.0.0-build12-appstore-live`, commit `9d617db`) NOT touched. Build 12 remains the immutable rollback point until Build 14 is approved + released, after which Update 1's commit gets its own immutable tag `v1.0.1-build14-appstore-live` and `production` fast-forwards.
- Earlier Build 13 IPA was never installed anywhere (rejected at processing before TestFlight or App Store). Build 14 is the first 1.0.1 IPA that exists; it is currently sitting in App Store Connect awaiting human review.

---

## Update 1 — Session B — 2026-06-28 — Hanger-icon fallback parity (Your Looks + Saved Outfits)

**Branch:** testing (HEAD at session start: `e200301`)
**Commit(s):** `a426be0` Step 1 (Your Looks photo strip) + `ec3d4b1` Step 2 (Saved Outfits thumbs). Two separate commits so either can be reverted independently.
**Edge Function deploys:** 0 (App.js only).
**Cache token count:** 2,510 (unchanged — SYSTEM_PROMPT not touched).
**App Store impact:** none — Edge Function untouched. Client-side fallback swap lives on testing only and reaches users when Build 13 ships.

### Goals
- Wherever a no-photo wardrobe item still showed a category emoji (👕/👖/👗/🧥/👟/👜), swap for the same sage-tint + TabHangerIcon + "No photo" placeholder My Closet has used since Session 10A Step 5.
- Two real targets after reality check: Your Looks outfit card photo strip thumbnails (~90×120pt, 3-col) and Saved Outfits item thumbnails (~60×60pt, 4-col). Mood Board / accessory grid / Hanger View / Share Card / Your Week all use intentional category-color or solid-block fallbacks per their Session 9D / 13E / 9G / 20 designs — deliberately out of scope.

### What changed
- **Step 1 — Your Looks outfit card photo strip ([App.js:3937-3956](App.js:3937)), two ternary swaps in the same block.** Main map branch (`outfit.items.map`): old `<Text style={{ fontSize: 22 }}>{getCategoryEmoji(item.category)}</Text>` → new `<View>` with `width: '100%', height: '100%', backgroundColor: 'rgba(188,199,183,0.18)', alignItems: 'center', justifyContent: 'center'` containing `<TabHangerIcon active={false} size={40} color="#BCC7B7" strokeWidth={1.6} viewBox="-2 -2 28 28" />` + `<Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 11, color: '#A09888', marginTop: 6, letterSpacing: 0.2 }}>No photo</Text>`. Same swap applied to the sample-item fallback inner ternary (`outfit.items.length === 0` branch — replaces `getCategoryEmoji('Tops')` with identical placeholder block). Inline styles deliberately chosen over new stylesheet entries — smallest possible diff, single-block revert if needed. `getCategoryEmoji` function definition untouched (still used by Peek Inside onboarding mockup at App.js:411, 424, 2678).
- **Step 2 — Saved Outfits item thumbnails ([App.js:4703-4709](App.js:4703)), single ternary swap.** Old `<Text style={{ fontSize: 20 }}>{getCategoryEmoji(item.category)}</Text>` → new `<View>` with same sage-tint background + `<TabHangerIcon active={false} size={28} color="#BCC7B7" strokeWidth={1.6} viewBox="-2 -2 28 28" />`. Two intentional deviations from Step 1: **size 28 instead of 40** (forced by ~60pt square thumb — 40 would fill ~67% of the thumb and dominate; 28 ≈ 47% and breathes), and **no "No photo" caption** (40pt hanger + 11pt caption with marginTop 6 ≈ 61pt total, won't fit in a 60pt thumb; outfit name + item chip labels below already tell the user what's there). Same sage hanger color, same viewBox, same background tint — reads as the same family as Step 1 + My Closet, just scaled.

### Apple HIG audit
- Tap target N/A — photo strip thumbs are non-interactive; whole saved outfit row is the interactive area.
- All visible text ≥11pt: "No photo" caption in Step 1 is 11pt ✓. Step 2 has no caption (icon-only).
- Contrast: `#BCC7B7` sage hanger silhouette + `#A09888` "No photo" caption both ride on `rgba(188,199,183,0.18)` sage-tint background — same exact color combination shipped through the May 24 Session 19C audit on My Closet's `gridCardPlaceholder` + `gridCardPlaceholderText`. No new colors introduced.
- Dynamic Type 1.3× cap inherited from Update 1 — Session 3 global cap ✓.

### Tests — both steps iPhone-verified in Expo Go with a no-photo wardrobe item
- **Step 1 (Your Looks):** added a wardrobe item without uploading a photo, generated outfits, found the no-photo item in the resulting photo strips. Hanger placeholder fills the thumb cleanly, no overflow, "No photo" caption readable + not clipped, items WITH photos render byte-identical to pre-session (Image at `looksStyles.photoStripThumbImage` unchanged), sample-item fallback case (zero items in an outfit, rare in practice) also renders the placeholder cleanly.
- **Step 2 (Saved Outfits):** opened ❤️ Saved modal, found the same no-photo item inside a saved outfit. 28pt hanger fits balanced next to photo thumbnails in the 4-column strip, no chunky/cramped feel, the row still reads as one card (vibe eyebrow + DM Serif outfit name + photo strip + item chips + Remove button below all visually unchanged).

### UNVERIFIED
- TestFlight standalone (Build 13): both swaps are pure JSX, no native module, no env var, no platform-conditional code — Expo Go behavior should carry over byte-identical to TestFlight. Flag only if a tester reports the hanger SVG path stroke rendering oddly at the smaller 28pt size.

### Notes
- HEAD at session start: `e200301` (Session A docs commit).
- Two commits deliberately separated so either can be reverted independently. They touch different JSX blocks (~770 lines apart) with no shared state. Step 1 is the larger swap (8 ins / 2 del across two hunks — both the map and sample-item branches); Step 2 is the smaller (3 ins / 1 del, single hunk).
- Out-of-scope locations confirmed via read-only audit and left untouched: Mood Board single-item polaroid (App.js:3151, 3165), Mood Board accessory grid cell (3087), Hanger View dress/top/pants/shoes/sideOuter/accessories (4357-4464), Share Card photo grid (3234-3238), Your Week mini cards (4862-4870). All five render solid `MOOD_PLACEHOLDER_COLORS[category]` or cream `#F5F0E8` blocks as intentional Session 9D / 13E / 9G / 20 design decisions, not emoji — they are NOT the bug Session B was fixing, and replacing them would alter polaroid + hanger-rod + share-card aesthetics that have been signed off.
- Inline styles chosen over new `looksStyles` / `savedStyles` entries deliberately. The My Closet pattern already lives in two stylesheets (`wardrobeStyles` from Session 10A and `pinSheetStyles` from Session 11 byte-mirror); Session 11 chose byte-mirroring over promoting to a shared scope, and this session follows that precedent at the inline level for minimum surface. If a fourth or fifth callsite of this placeholder ever lands, the right move is to extract a shared `<HangerPlaceholder size={...} showCaption={...} />` component — not yet warranted with two callsites + two reference callsites already in stylesheets.
- `getCategoryEmoji` helper function definition at App.js:1366 left in place — still used by Peek Inside Step 1 onboarding mockup (illustrative emoji teaching content, NOT a real wardrobe item display). Removing it would break onboarding; only the emoji DISPLAY in real wardrobe-item UI is the bug.
- Dead `wardrobeStyles.emptyEmoji` style at line 2069 sits inside a `{/* HIDDEN: Session 10A Step 4 */}` JSX comment block — not used anywhere live. Left untouched; future cleanup polish.
- Tab bar registration line `{ label: ..., icon: '👗', IconComponent: TabHangerIcon }` at App.js:7968 — the `icon` string is dormant fallback config; `IconComponent` is what actually renders the hanger in the tab bar. Already correct in practice, no action needed.
- Brief originally named this "Session B" (letter, not number); preserved as the literal session identifier per Grace's framing, matching the Session A convention from the same day.

---

## Update 1 — Session A — 2026-06-28 — Your Looks header reframe + View mood board restyle

**Branch:** testing (HEAD at session start: `ad10bc7`)
**Commit(s):** `5f9c852` Step 2 (header copy) + `d1bf146` Step 3 (mood board link restyle). Two separate commits so either can be reverted independently.
**Edge Function deploys:** 0 (App.js only).
**Cache token count:** 2,510 (unchanged — SYSTEM_PROMPT not touched).
**App Store impact:** none — Edge Function untouched. Client-side copy + style changes live on testing only and reach users when Build 13 ships.

### Goals
- Reframe the Your Looks subtitle so the user understands one of the three looks is deliberately meant to surprise her ("wear it bravely") and the rating buttons below are how Clozie learns her taste.
- Make the "View mood board" link read as clearly tappable. Pre-session it was small lowercase Outfit_400Regular 13pt terracotta text buried between the outfit description and the Save/rate buttons — easy to miss.

### What changed
- **Step 2 — App.js:3911, single-line subtitle swap.** Old: `Here are today's looks, styled just for you. ✦ Clozie learns your taste with every rating.` New: `Here are today's looks, styled just for you. One outfit is meant to surprise you — because great looks often start as a "maybe." Wear it bravely. ✦ Rate each look and Clozie learns your taste.` Em-dash U+2014, straight ASCII quotes around "maybe" (matches the existing straight apostrophe in `today's` rather than introducing curly quotes mid-string), sparkle U+2726, byte-verified before commit. Style untouched (`looksStyles.subtitle` — Outfit_400Regular 13 / `#5C4A3A` / lineHeight 20 / marginBottom 24). One flowing block, no line break, no new styles, no layout change. Closing phrase landed on the verb-only "Rate each look and Clozie learns your taste" after Grace switched mid-step from a first draft that named the buttons inline ("Tap Love it, Like it, or Not for me"). Header renders once at the top of the tab (not per-card), gated `hasGenerated && outfits.length > 0`.
- **Step 3 — `looksStyles.moodBoardLink` swapped to eyebrow style + new `moodBoardChevron` style + JSX wrap.** `moodBoardLink` was Outfit_400Regular 13 sentence case — now Outfit_700Bold 11 / letterSpacing 2.5 / textTransform uppercase / `#A44A34` unchanged. New sibling style `moodBoardChevron` — Outfit_700Bold 20 / `#A44A34` / lineHeight 18. JSX at App.js:3975-3987: the existing `TouchableOpacity` now lays out as a row (`flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'`) with the label on the left and a new `<Text style={looksStyles.moodBoardChevron}>›</Text>` (U+203A) at the right edge. Whole row stays one tap target at `minHeight: 44`. Handler `() => { setMoodBoardTab('moodboard'); setMoodBoardOutfit(outfit); }` byte-identical — opens the Mood Board modal on the Mood Board tab. No divider line, no hairline, no pill, no background, no box. Plain row. Only one render site in App.js — Saved Outfits opens the mood board by whole-card tap (different UI, not affected).

### Apple HIG audit
- Tap row `minHeight: 44` ✓
- All text ≥11pt: 11 (label), 20 (chevron) ✓
- Contrast: `#A44A34` on white card ~5.5:1 — WCAG AA ✓ (same color the existing VIBE eyebrow ships through the Session 19C audit on May 24)
- Dynamic Type 1.3× cap inherited from Update 1 — Session 3 global cap ✓

### Tests — both steps iPhone-verified in Expo Go on a real generated outfit set
- **Step 2:** subtitle reads as one flowing block, em-dash + sparkle both render cleanly, no tofu, no layout collision with recovery banner / session nudge / first outfit card.
- **Step 3:** row reads as visibly tappable, chevron sits centered and whole at the right edge (the `lineHeight: 18` paired with `fontSize: 20` was flagged as a possible clip risk pre-commit — turned out fine on iPhone, no follow-up needed), VIBE eyebrow above does NOT invite a tap (chevron is the differentiator), modal still opens to the Mood Board tab, no divider / pill / background appeared, outfit name + photos + description + Save + I wore this today + ratings + Share Outfit all visually unchanged.

### UNVERIFIED
- TestFlight standalone (Build 13): both changes are pure JSX + StyleSheet, no native module, no env var, no platform-conditional code — Expo Go behavior should carry over byte-identical to TestFlight. Flag only if a tester reports the chevron rendering oddly under iOS's bold-system-font fallback.

### Notes
- HEAD at session start: `ad10bc7` (Session 9 polish — sage ring on Analyse cards).
- Two commits deliberately separated so either can be reverted independently. Step 2 is a copy-only change; Step 3 is a style + tiny JSX change. They don't depend on each other.
- Chevron glyph chosen: `›` (U+203A) rendered in the existing Outfit font — same family as the `▾` caret used in Session 9. No icon font, no SVG, no new dependency.
- Quote-style decision in Step 2: straight ASCII `"` around "maybe" rather than curly `"…"`. The rest of the line uses straight apostrophes (`today's`), so straight double-quotes blend in; curly quotes in one spot of an otherwise-straight string read as inconsistent. Flagged before committing — Grace approved.
- Original brief named this session "Session A" (letter, not number); preserved as the literal session identifier per Grace's framing.

---

## Update 1 — Session 9 — 2026-06-28 — Analyse My Wardrobe (free JS, foundation for Pro)

**Branch:** testing (HEAD at session start: `17f75dd`)
**Commit(s):** to be created at session end, single commit on testing covering Steps A-D + docs.
**Edge Function deploys:** 0 (none — App.js + new helper + CLAUDE.md + SESSION_NOTES.md only).
**Cache token count:** 2,510 (unchanged — SYSTEM_PROMPT not touched).
**App Store impact:** none — Edge Function untouched. Client-side wiring lives on testing only and reaches users when Build 13 ships.

### Goals
- Build the free JavaScript version of "Analyse My Wardrobe". Pure client-side observations. Zero API calls.
- Place the entry card per the locked Nav Architecture v2 (between header and grid on My Closet, NOT bottom-of-scroll — the old April placement was explicitly rejected as undiscoverable).
- Structure helper + UI exactly to the May 27 Pro spec so the future Pro version (Haiku/Sonnet Edge Function) drops in as a pure data-flip: entry card + observation cards + structured shape stay identical, Pro only swaps the observation source and may flip `actionable: true` on its unworn-items card.

### What changed
- **Step A — `src/lib/wardrobeIntelligence.js` (new file, 147 lines).** Pure JS. Single export `analyseWardrobe(items)` returning `{ observations: [{ type, title, body, count, itemIds, actionable }], source: "javascript" }`. Selection logic: <5 items → empty array (defense in depth — UI also gates). ≥5 items → slot 1 one balance/structural (S1 tops≥5 & bottoms≤2 → S2 bottoms≥5 & tops≤2 → G2 bottoms=0 & dresses=0) + slots 2-3 strengths in order depth (tops≥5 & bottoms≥3 & shoes≥2) → rich palette (itemCount≥25) → tops collection (tops≥8) → shoes covered (shoes≥4), skipping any whose primary data-key already appeared in slot 1 + F1 encouragement fallback. Never returns zero observations at ≥5 items. Every count is real (tops/bottoms/itemCount/shoes) or null. After Step A's first paste, refined two body lines for the zero case: S1/S2 swap "only 0 bottoms/tops" for "no bottoms yet"/"no tops yet". Em-dash U+2014 in gap body preserved byte-perfect.
- **Step B — 10 new wardrobeStyles entries in App.js.** `analyseEntryCard` (white + soft border + radius 12 + padding 14/16 + flex row), `analyseEntryTextWrap` (flex:1), `analyseEntryLabel` (DM Serif 17 espresso), `analyseEntrySubtitle` (Outfit 13 body), `analyseEntryCaret` (Outfit 18 espresso), `analyseResultsBlock` (plain wrapper marginBottom 14), `analyseResultsHeader` (Outfit 13 body marginBottom 12), `analyseObservationCard` (white + soft border + radius 12 + padding 14/16, NOT nested inside another card), `analyseObservationTitle` (DM Serif 17 espresso), `analyseObservationBody` (Outfit 13 body lineHeight 20). Inserted between existing `analyseCardButtonText` and `vibeButton`. Zero existing styles modified.
- **Step C — entry card JSX + placeholder results + D2 useEffect.** Entry card inserted between progress bar (App.js:1904) and search-bar conditional (App.js:1907), gated `itemCount >= 5 && !searchVisible`. Title + subtitle (flex:1) + down-caret `▾` (U+25BE) right-aligned. `TouchableOpacity activeOpacity={0.7}` for pressed-state dim. Placeholder results block (gated `showAnalyseMessage && !searchVisible`): header line "Here's what stands out about your closet right now." + one placeholder card + Got it button (reuses existing `analyseCardButton` + `analyseCardButtonText`, no sparkle, hitSlop 6/6/6/6 → ~53pt effective tap target). D2 defensive useEffect right after `showAnalyseMessage` state declaration: when `searchVisible` flips true, also `setShowAnalyseMessage(false)` so results never orphan.
- **Step D — placeholder → real observations.** New import line `import { analyseWardrobe } from './src/lib/wardrobeIntelligence';`. Single placeholder card replaced with `.map()` over `analyseWardrobe(items).observations` — each iteration renders an `analyseObservationCard` with `analyseObservationTitle` + `analyseObservationBody` + dormant `{obs.actionable && (...)}` action block (inline terracotta `#A44A34` underline style, hitSlop 6/6/6/6, renders nothing in free because actionable is always false). Per-observation `key={`${obs.type}-${index}`}`. Helper called inline (no `useMemo` — O(n) on 50-item ceiling is sub-millisecond, gate short-circuits when card is closed). Header line + Got it button + all gating + D2 useEffect byte-identical to Step C.

### Apple HIG audit (during Step C)
- Entry card ~69pt visual height (≥44pt ✓) — no hitSlop needed.
- Got it button visual ~41pt + 6pt top/bottom hitSlop = ~53pt effective (≥44pt ✓).
- All text ≥11pt: 17 (titles), 13 (bodies/subtitles), 18 (caret) ✓.
- Contrast: caret #2C1A0E on white ~17:1, subtitle #5C4A3A on white ~8.8:1 — WCAG AAA ✓.
- Dynamic Type 1.3× cap inherited from Update 1 — Session 3 global cap ✓.

### Tests
- **Step A sanity check (Node script in scratchpad — not committed):** 8 fake closets covering empty, 5 Tops only (S1 with new "no bottoms yet"), 2 Tops + 5 Bottoms (S2 with "only 2 tops"), 0 Tops + 5 Bottoms (S2 with new "no tops yet"), 3 Shoes + 2 Accessories (G2 gap, em-dash intact), 25 mixed rich (Depth + Rich palette, C3/C4 correctly skipped by used-keys dedup), balanced 12 (Depth only), mini balanced 8 (F1 fallback). All 8 passed.
- **Step B:** additive styles only, no iPhone test.
- **Step C (iPhone):** entry card renders correctly in band, tap shows placeholder, Got it closes, re-tap reopens, opening Search hides both card and results cleanly, closing Search restores entry card.
- **Step D (iPhone, real 56-item closet):** TWO observations rendered — "Your closet has real depth" + "A rich palette to play with — 56 pieces gives Clozie plenty to mix and match across the week." The literal count 56 proves the helper is reading the real closet. Got it collapses cleanly, re-tapping reopens the same observations, Search hides everything.

### UNVERIFIED
- None for the free JS path itself — pure synchronous JS over in-memory state, fully exercised on the real closet.
- The dormant `obs.actionable` JSX block has never rendered (actionable hardcoded false in free). Will be exercised when Pro lands; rendering is straightforward but no-op'd today.

### Notes
- **Free is the foundation Pro builds on.** Pro version (Update 2, planned Haiku/Sonnet Edge Function) will: (a) swap the observation source from local JS to a server-side Edge Function call with its own caching + session limits, (b) flip `actionable: true` and add `onAction` + `actionLabel` on the unworn-items observation (which requires `times_worn` data not currently exposed via `rowToItem`), (c) potentially extend the helper with new observation types (e.g. "unworn"). Entry card + observation cards + Got it + structured shape stay byte-identical — zero UI work needed in Pro.
- Old dead `{false && ...}` Analyse button + card blocks at App.js:2331-2357 (from the pre-Update-1 hidden shell) NOT removed this session — that's Step E, deferred as its own focused step.
- Existing styles `analyseButton` / `analyseButtonText` / `analyseCard` / `analyseCardText` become unused as a side effect of Steps C+D but stay in place (Session 10A leave-in precedent); flag for future cleanup polish.
- Inline `analyseWardrobe(items)` call inside JSX short-circuits via the `showAnalyseMessage && !searchVisible` gate — runs only when the card is open. On a 56-item closet, 4 category filters × 56 items ≈ 224 comparisons per render. Sub-millisecond. No `useMemo`.
- Em-dash in the gap observation body (U+2014) was preserved through Step A's first paste + Step A's wording fix + the Step D iPhone test. Node sanity check printed it intact in case 5.
- HEAD at session start: `17f75dd` (Session 8 commit "Style Learning Layer 1: vibe lean + star items injected into user message").

### Polish (2026-06-28): sage ring on Analyse cards
Visual-only polish to two style entries so the Analyse entry card + 1-3 observation cards read as one cohesive family on My Closet (previously plain white + faint espresso border, blended with item cards).
- `analyseEntryCard` + `analyseObservationCard`: `borderColor: 'rgba(44,26,14,0.08)'` → `'#BCC7B7'` (the canonical sage from `floatingAddButton` + `stickyVibeBar` — verified live, not guessed).
- `borderWidth: 1` → `1.5` (matches Session 10B chip border convention; 2px felt chunky on a 12px-radius card).
- Added shadow block: `shadowColor: '#2C1A0E'` (espresso-tinted, matches `floatingAddButton`), `shadowOffset: { width: 0, height: 2 }`, `shadowOpacity: 0.06` (matches Session 9F recovery banner softness), `shadowRadius: 8`, `elevation: 2`.
- Identical treatment on both styles so all three visible cards are pixel-consistent.
- Zero JSX changes, zero new styles, zero logic changes. Style isolation verified: `analyseEntryCard` referenced only at App.js:1916, `analyseObservationCard` referenced only at App.js:1939 (inside the Session 9 `.map`).
- iPhone-verified on user's 56-item closet: sage ring + soft lift reads well, all three cards match, rest of My Closet visually identical, Search hides/restores cleanly. Shadow `0.06` was right — the pre-approved `0.10` fallback not needed.

---

## Update 1, Session 8 — Style Learning Layer 1 — 2026-06-27
Built and deployed Style Learning Layer 1 into generate-outfits.

What it does: learns two clean signals from the user's last 30 rated outfits and injects them as ONE soft block into the USER message (never the cached SYSTEM_PROMPT):
1. Vibe lean — mood words tallied love +2 / like +1 / nope −1; surface top 1–2 vibes clearing net +2.
2. Star items — pieces in 2+ positive (love/like) outfits; top 2 by count.
Gate: <5 rated rows emits nothing (new-user path). Color deliberately EXCLUDED — deferred to Update 1A.

Block position: after stylingLines/DRESS RULE, above currentBlock/recentBlock/WARDROBE POOL (pool stays last for recency bias).

Wildcard wording = Option C (upgraded from B mid-session to avoid over-varying a small closet):
"Let these notes shape two of the three looks; her broader closet still leads. Keep the third free of them — a fresh, different choice that still feels easy to wear, never a costume."
Star anti-domination guardrail: "feature them when they genuinely fit, but never force them, and never include either in every look."

Deployed via CLI (--use-api, no --yes, no dashboard). Two deploys: Deploy 1 shadow-compute only (logged, never used); Deploy 2 wired into the injected block.

VERIFICATION (all passed, iPhone + Logs):
- Cache held 2,510 both calls (call 1 creation 2510/read 0; call 2 creation 0/read 2510). Injecting a user-message block did NOT move the system-prompt cache.
- Full style notes block confirmed in logs on BOTH calls (19:32:08 and 19:32:31), complete through "never a costume."
- learning layer 1 log: ratedCount 30, vibeLean "sharp" score 5, starItems Leather Low-Top Sneakers + Woven Straw Fedora.
- Pool 56 styleable items — whole closet still in play.
- User eyeball: outfits "good, like always" — pass (no regression). NOT yet proof learning is helping; that needs a week of natural rating.

Corrections logged this session:
- Keychain service name confirmed as `supabase-pat-clozie`.
- Byte baseline confirmed em-dashes 140 / middots 18 (a prior note had middots wrong).

WATCH-ITEM (next week): confirm learning actually shifts outfits once the user rates naturally and vibe/stars move. One stable-data session can't show that yet.

HEAD at session start: 93e5270 (Session 7).

---

## Update 1 — Session 7 — 2026-06-27 — Daily Notifications (Free Plan feature)

**Branch:** testing (HEAD at session start: `61b9f6f`)
**Commit(s):** to be created at session end, single commit on testing
**Edge Function deploys:** 0 (none — App.js + package.json + package-lock.json + CLAUDE.md + SESSION_NOTES.md only)
**Cache token count:** 2,510 (unchanged — SYSTEM_PROMPT not touched at all)
**App Store impact:** none — Edge Function untouched. Client-side wiring on testing only; reaches users when Build 13 ships and replaces Build 12 via Apple review.

### Goals
- Local-only daily notifications, no push token, no backend table, no Privacy Policy data-category change.
- Settings toggle defaults OFF; flip ON shows Clozie pre-prompt → real iOS permission → 14-day rolling batch.
- 7 locked messages, no emojis, no Friday/day-of-week logic, no two consecutive days the same.
- Tap notification → Today's Vibe (both cold-launch and warm-launch); normal icon launch unchanged → My Closet for signed-in users.
- Each substep tested in Expo Go before the next; pieces only verifiable on Build 13 clearly flagged as UNVERIFIED.

### What changed
- **Substep 1 — install (`package.json` + `package-lock.json`):** `npx expo install expo-notifications @react-native-community/datetimepicker` → `expo-notifications ~0.32.17` and `@react-native-community/datetimepicker 8.4.4`. No manual edits, no `npm audit fix` (CLAUDE.md Session 17A lesson). Expo CLI flagged datetimepicker config-plugin entry — deferred to Build 13 prep.
- **Substep 2 — dead helpers in App.js:** new module-scope block at App.js:92-148 with `NOTIF_MESSAGES` (7 locked messages indexed 0–6), `NOTIF_ENABLED_KEY` / `NOTIF_TIME_KEY` / `NOTIF_LAST_MESSAGE_INDEX_KEY` under `@clozie:notif:*` namespace, and pure helpers `pickNextIndex(lastIdx)`, `formatTimeHHMM(date)`, `nextOccurrenceAt(hour, minute)`. Dead code on landing — no consumers.
- **Substep 3 — handler config + cold-launch detection in App():** new `Notifications.setNotificationHandler({ shouldShowBanner/List/PlaySound: true, shouldSetBadge: false })` at App.js:157. Existing cold-launch useEffect wrapped in `Promise.all([supabase.auth.getSession(), Notifications.getLastNotificationResponseAsync().catch(() => null)])`. If signed-in AND `lastResponse?.notification?.request?.content?.data?.kind === 'daily'`, sets `mainInitialTab = 2` (Today's Vibe); else byte-identical (still My Closet for signed-in returning users, splash for signed-out).
- **Substep 4 — toggle + AsyncStorage in SettingsScreen:** unhid the existing `{false && ...}` PREFERENCES card. Added `notifEnabled` useState, mount useEffect reading `NOTIF_ENABLED_KEY`, `handleNotifToggle` writing it. Subtitle "Get styled every morning · coming soon" → "Get styled every morning". No permission ask, no scheduling.
- **Substep 5 — pre-prompt + real iOS permission + time picker:** added `parseHHMMToDate` helper. New SettingsScreen state: `notifTimeDate` (default 7:30am), `showNotifPrePrompt`. Mount useEffect upgraded to `multiGet` both keys + reconcile with `Notifications.getPermissionsAsync()` (revoked-in-iOS-Settings auto-reverts AsyncStorage to false). New handlers: `acceptNotifPrePrompt` fires `requestPermissionsAsync` and reverts toggle on denial; `dismissNotifPrePrompt` reverts toggle; `handleTimeChange` writes new time. PREFERENCES card gains a conditional Time row with native iOS `DateTimePicker` (`mode="time"`, `display="default"`). New Modal reuses Session 13I `savedStyles.confirm*` cross-section pattern. Copy: "A morning nudge from Clozie" / "Yes, remind me" / "Not now". `app.config.js` NOT touched.
- **Substep 6 — actual scheduling:** new module-scope helpers `cancelAllClozieDailyNotifications` (read-filter-cancel-by-id, scoped to `data.kind === 'daily'`, NEVER calls `cancelAllScheduledNotificationsAsync`) and `batchScheduleNotifications(hour, minute)` (cancel first → read seed → 14 one-shot `SchedulableTriggerInputTypes.DATE` triggers, no-repeat enforced by `pickNextIndex` chain → persist day-1's index as the cross-batch no-repeat seed → diagnostic log). Wired into `acceptNotifPrePrompt` on grant, `handleNotifToggle` OFF path, `handleTimeChange` when enabled, mount-reconcile revoke case, and new App() cold-launch fire-and-forget useEffect (gates on `enabled === 'true'` AND `getPermissionsAsync().status === 'granted'`). `scheduleNotificationAsync` called from exactly one site in the codebase — inside the loop.
- **Substep 7 — warm-launch tap listener in MainAppScreen:** new useEffect registering `Notifications.addNotificationResponseReceivedListener` with `kind === 'daily'` gate before `setActiveTab(2)`. Empty deps array. Cleanup `subscription.remove()` on unmount. UNVERIFIED in Expo Go (cannot reliably fire-and-tap a real notification in dev).

### Tests (in Expo Go on iPhone)
- Substep 1: app boots clean after install — verified.
- Substep 2: app boots clean with dead helpers — verified.
- Substep 3: signed-in cold launch lands on My Closet (byte-identical) — verified.
- Substep 4: toggle ON/OFF, kill, reopen, state persists — verified both directions.
- Substep 5: pre-prompt appears, "Not now" reverts toggle, "Yes, remind me" → real iOS dialog (titled "Expo Go" in dev, expected) → Allow keeps toggle ON, time picker works, chosen time (6:00 AM) survived kill/reopen — verified.
- Substep 6: flip ON logged `[notif] batch scheduled: 14 daily (total pending: 14)` with 14 `kind=daily` entries, no back-to-back repeats, ~1-day stepping. Changing time produced fresh 14-entry batch with new shuffle. Toggle OFF produced no new schedule log (cancel confirmed) — verified.
- Substep 7: app boots clean after listener added; normal navigation unchanged — verified.

### UNVERIFIED (await Build 13 / TestFlight standalone)
- Actual notification firing at scheduled local time (Expo Go SDK 53+ has reduced local-notification reliability).
- Cold-launch tap → Today's Vibe routing (App() useEffect via `getLastNotificationResponseAsync`).
- Warm-launch tap → Today's Vibe routing (MainAppScreen useEffect via `addNotificationResponseReceivedListener`).
- Foreground display banner/sound from `setNotificationHandler`.
- Permission dialog title resolving from "Expo Go" (dev) to "Clozie" (standalone).

### Notes
- Local-only architecture choice: no push token created, no Supabase table, no Privacy Policy data-category change. Spec was explicit. Architecture remains revisitable if Pro launches a personalized smart-morning push later.
- iOS 64-pending-notification cap: well within (we schedule 14).
- Cross-batch no-repeat: first message of every batch is constrained by the persisted `NOTIF_LAST_MESSAGE_INDEX_KEY` to differ from that index. The persisted index is the previous batch's day-1 message — that's "what just fired this morning" if rebatch happens after the morning fire, or "what fires next" if rebatch happens before. Either reading satisfies the no-two-days-in-a-row rule for the user's actual lived sequence of fires.
- `cancelAllScheduledNotificationsAsync` is mentioned in one CODE COMMENT only (warning against using it) — zero call sites. Other apps' notifications and any future non-`kind:'daily'` Clozie notifications are untouched by both the cancel helper and the warm-launch listener.
- For Build 13 testing: plan to add a temporary "fire test notification in ~10 seconds" button so firing + tap-to-open verifies in seconds instead of waiting until morning. Remove before App Store submission. NOT in this session.

---

## Update 1 — Session 6 — 2026-06-27 — Brief color lift (first wiring of Session 5's color-family map)

**Branch:** testing (HEAD at session start: `c216b12`)
**Commit(s):** to be created at session end, single commit on testing
**Edge Function deploys:** 1 (`generate-outfits` via CLI `--use-api`, no `--yes` flag)
**Cache token count:** 2,510 (unchanged — SYSTEM_PROMPT not touched at all; verified `cache_creation_input_tokens: 2510` first call after deploy, then `cache_read_input_tokens: 2510` round-trip on subsequent call within 5 min)
**App Store impact:** LIVE — the same `generate-outfits` Edge Function is called by Build 12 in production. The deploy reached live App Store users immediately. Behavior degrades to byte-identical to pre-Session-6 when no color word is detected in the Brief (the dominant case), which protects the existing user base.

### Goals
- First real call site for the Session 5 color-family helpers: when the user names a color in the Brief, lift matching-colour items toward the top of the wardrobe pool the Edge Function sends to Sonnet.
- **Gentle Step 1 only** (per the advisory panel's staged plan). Pool is re-sorted, never filtered. No post-generation surgery. No swapping. No forcing.
- Pin is sacred — tested every run, must be present in all 3 outfits across every test.
- Third/wildcard outfit stays free of forced color — trust the gentle nudge, do NOT add per-outfit logic.
- Single colors only — `colorFamiliesForCategoryWord` (category phrases like "warm tones") deferred.
- SYSTEM_PROMPT untouched, cache must hold at 2,510.

### What changed (`supabase/functions/generate-outfits/index.ts` only — 4 hunks; +18 lines net, zero deletions, plain ASCII)

**Edit 1 — `buildCompressedPool` gains optional `briefFamily` arg.** Signature becomes `buildCompressedPool(items: Item[], briefFamily: ColorFamily | null = null)`. New short-circuit block at the top of the sort comparator: when `briefFamily` is non-null, items whose `colorFamilyForText(item.colour || '')` equals `briefFamily` get rank 0, others rank 1. Tiebreak is the existing newest-`createdAt`-first sort. When `briefFamily` is null, the new block is skipped entirely → sort is byte-identical to pre-Session-6 behavior.

**Edit 2 — `buildFreshContent` args type + destructure + forward.** New `briefFamily: ColorFamily | null` field on the args type, placed between `brief` and `pinned` for logical grouping. Destructured into scope. Existing `buildCompressedPool(items)` call updated to `buildCompressedPool(items, briefFamily)`.

**Edit 3 — Handler computes `briefFamily`.** Five-line block inserted between the safety-filter log and the Anthropic gate: `const briefFamily = brief ? colorFamilyForText(brief) : null` followed by a conditional `console.log('[generate-outfits] brief color lift:', briefFamily)` — log fires only when non-null (silent on no-color baseline). New field passed into the `buildFreshContent` call.

**Honors Session 5 input contract:** the comparator feeds `colorFamilyForText(a.colour || '')` — COLOUR FIELD ONLY, never `name + colour`. The fabric-word collision risk (Linen Shirt, Denim Jacket, Sand-Washed Tee) does not surface.

**Byte audit before deploy:** lines 1671 → 1689 (+18), em-dash count 137 → 137 (zero drift), middot count 17 → 17 (zero drift), bytes 74,924 → 76,133 (+1,209 plain ASCII). Confirmed no Unicode introduced by today's additions.

**Old inner `colorFamily(item)` at index.ts:904 NOT touched, NOT mirrored.** That helper uses `name + colour` deliberately for its smart-fallback purpose only.

### Tests — all PASSED on iPhone + Supabase Logs

1. **Pin + "navy" — 3 rounds, 3 different pinned tops (none of them navy).** Pinned item present in all 3 outfits every round. Navy/blue-family items surfaced. Log line `[generate-outfits] brief color lift: blue` fired on every run. Pool size 55 of 56 (one item filtered by safety filter — pool re-sorted, never emptied). ✅ PASSED.
2. **"purple" with no purple items owned, no pin.** Generated normally, no error, no empty state. Sonnet styled around it (added an amethyst bracelet, working with the implied request rather than forcing purple clothes). ✅ PASSED.
3. **No color in Brief.** Outfits behaved exactly like pre-Session-6. The new log line was NOT present (short-circuit confirmed). ✅ PASSED.
4. **Family-lookup verification in Logs.** "navy" → `blue` (per COLOR_FAMILIES line 100), "cream" → `white` (per line 94). Both confirmed in `[generate-outfits] brief color lift:` log lines. ✅ PASSED.
5. **Cache verification.** First call after deploy: `cache_creation_input_tokens: 2510`. Subsequent call within 5 min: `cache_read_input_tokens: 2510`. Round-trip proof; cache untouched. ✅ PASSED.
6. **Garment + colour, no pin.** Briefs "white t-shirt", "white sneakers", "navy blouse + pearls", "black sneakers" all surfaced the requested colour-garment combos correctly. The colour lift and Sonnet's natural garment-matching work together when no pin competes for attention. ✅ PASSED.
7. **Pin never dropped across all tests.** ✅ PASSED.

### UNVERIFIED
None this session. All seven scenarios verified directly on iPhone calling the live Edge Function. Cache integrity confirmed via Supabase Logs round-trip.

### Open issues surfaced (NOT fixed this session — flagged for future)

1. **PIN + COLOUR + GARMENT triple-combo in the Brief is inconsistent.** When the user pins an item AND the Brief names a colour + garment (e.g. pin denim jeans + Brief "white sneakers"), the requested colour-garment item surfaces only sometimes, and outfit quality drops on the misses. Three signals compete for Sonnet's attention: the HARD pin constraint (must appear in every outfit), the occasion + style profile, and the SOFT colour-family pool lift introduced this session. The pool lift is intentionally the weakest signal of the three (gentle nudge by design), so it loses when the pin and occasion also compete. NOT caused by today's change and NOT a regression — it's the ceiling of the soft pool-lift approach. Candidate fix for a future session: a light post-generation colour/garment check (the "Step 2" deferred from this session's staged plan). Needs council input before building. Added to CLAUDE.md KNOWN ISSUES.
2. **"navy blazer" watch item.** Once during testing, a "navy blazer" Brief produced two blazers in one outfit. Re-ran twice, did not repeat. Pre-existing Sonnet structural edge case (related to the Session 17F two-bottoms-no-top class), not caused by the colour lift. Watch only — flag if it reproduces in production. Added to CLAUDE.md KNOWN ISSUES.

### Notes / decisions
- **Staged-by-design.** The advisory panel deliberately started with the gentlest possible Step 1. Worst case the AI ignores the nudge and we get pre-Session-6 behavior back — there is no failure mode that makes outfits worse. Step 2 (post-generation check) is a separate decision next session if production behavior warrants it.
- **`colorFamiliesForCategoryWord` still uncalled.** Category phrases like "warm tones" / "earth tones" are out of scope this session. Single colors only.
- **First-detected-color-wins for multi-color briefs.** `colorFamilyForText` returns the first family it finds, driven by longest-key-first ordering in `COLOR_LOOKUP_PATTERNS`. For a Brief like "navy top with cream trousers", the lift targets the navy/blue family. Simple, predictable, documented.
- **False-positive risk acknowledged.** Phrases like "red carpet event" or "blue collar" would incorrectly trigger a colour lift. Acceptable for Step 1 because (a) the lift is gentle, (b) the Occasion chip and rest of the Brief dominate Sonnet's reasoning, (c) worst case is a soft preference toward red items in a Formal Event context — not a broken outfit. Revisit only if production telemetry shows abuse.
- **Live blast radius.** Same Edge Function that serves Build 12 in production. Behavior degrades cleanly to byte-identical when no color word is in the Brief, which is the dominant case (most Briefs have no color).
- **Helpers no longer dormant.** Session 5's `colorFamilyForText` is now load-bearing in production. The Session 5 standing-facts bullet in CLAUDE.md remains historically accurate (it captured what shipped in Session 5); the new Session 6 bullet supersedes the dormant claim.
- `session-24a-shelved` not restored. `main` untouched. `production` untouched. No tags. No `npm audit fix`. No new dependencies. No App.js touched. No SYSTEM_PROMPT touched. Old inner `colorFamily(item)` at index.ts:904 NOT touched.

---

## Update 1 — Session 5 — 2026-06-25 — Dormant color-family map (foundation for Session 6)

**Branch:** testing (HEAD at session start: `e7dae0b`, after Session 5 commit: `7d997a7`)
**Commit(s):** `7d997a7` on testing, pushed to origin/testing only. Main / production / tags untouched.
**Edge Function deploys:** 0 — dormant code; nothing in the function calls the new helpers. Deploy deferred to Session 6 when a call site lands.
**Cache token count:** 2,510 (unchanged — SYSTEM_PROMPT not touched at all; Anthropic prompt cache keys on SYSTEM_PROMPT content not function bundle, so even if we had deployed it would not have invalidated the cache)
**App Store impact:** none — Session 5 code is uncalled. No runtime behavior change reaches users.

### Goals
- Build the foundation: `COLOR_FAMILIES` map + two pure lookup helpers (`colorFamilyForText`, `colorFamiliesForCategoryWord`) in the `generate-outfits` Edge Function.
- DORMANT this session — added but called by nothing.
- Foundation for Session 6 (Brief color matching) and future color learning.
- Zero behavior change, zero deploy, zero cache cost.

### What changed (single file: `supabase/functions/generate-outfits/index.ts`; +88 lines, 0 deletions; inserted between line 74 `COLOR_NAVY` and line 79 `FALLBACK_NAMES_BY_OCCASION`)

- **`ColorFamily` union type** — 13 families: `white | beige-tan | brown | grey | black | metallic | blue | green | red | pink | purple | yellow | orange`.
- **`COLOR_FAMILIES` map** — 87 single-word entries + 26 compound entries across 13 families. Final word lists approved by Grace at Step A after mid-spec corrections (Change 1: dropped bare "powder" from blue to fix "powder pink" misroute to blue; Change 2: dropped "linen" from beige-tan because it's a fabric word that would mislabel "White Linen Shirt"; chartreuse moved yellow → green; bare "midnight" dropped from blue for the same logic as powder, kept "midnight blue" compound).
- **`COLOR_FAMILY_TEMPERATURE` map** — warm/cool/neutral tag per family (warm = beige-tan, brown, red, pink, yellow, orange; cool = blue, green, purple, grey; neutral = white, black, metallic).
- **`COLOR_CATEGORY_WORDS` map** — 7 category phrases → family lists (warm tones, cool tones, neutrals, black & white, monochrome, earth tones, jewel tones). "pastels" and "bold colors" deliberately return null (saturation concepts, no clean family mapping — Session 6 needs a separate mechanism for them).
- **`COLOR_LOOKUP_PATTERNS` IIFE** — precomputed at module load. Sorts entries by key length DESC so longest match wins (rose gold beats rose, powder blue beats blue, silver-grey beats silver). Regex metacharacters escaped via `replace(/[.*+?^${}()|[\]\\]/g, '\\$&')` so hyphens in `silver-grey` / `off-white` and any future special chars are safe.
- **`colorFamilyForText(text: string): ColorFamily | null`** — single-color lookup. Whole-word `\b` anchored so "tan" doesn't hit "tank top". Case-insensitive. Trims input. Empty/whitespace-only input returns null. Iterates precomputed patterns in length-DESC order; first regex hit wins.
- **`colorFamiliesForCategoryWord(text: string): ColorFamily[] | null`** — category-phrase lookup. Exact lowercase match against the `COLOR_CATEGORY_WORDS` keys via `?? null`. Case-insensitive. Trims input.

### Naming + scoping decisions

- New top-level helper deliberately named `colorFamilyForText(text)` to AVOID colliding with the existing inner `colorFamily(item: Item)` at index.ts:816 inside `buildSmartFallback` (Session 7C, 2026-05-14). The inner one is load-bearing for smart fallback and stays 100% byte-identical. Different signature (`text: string` vs `item: Item`), different name, no shadowing. Confirmed via `tsc --strict` clean compile.

### Tests — all PASSED locally; ZERO iPhone test required (dormant code)

1. **tsc compile check** — extracted insertion to a standalone `.ts` file in scratchpad, ran `npx tsc --noEmit --strict --target ES2022 --lib ES2022` with a small typed smoke-test calling both helpers and the temperature map → exit code 0, zero errors, zero warnings.
2. **Byte audit** — em-dash count 137 → 137 (unchanged), middot count 18 → 18 (unchanged), inserted region 5167 bytes all ASCII (zero non-ASCII bytes — verified by Python byte-scan).
3. **36/36 scratchpad tests pass** — standalone `.mjs` at `/private/tmp/claude-501/.../scratchpad/color_family_test.mjs`. Includes the four correctness-proof tests: `"powder pink"` → pink (Change 1 proof), `"linen"` → null (Change 2 proof), `"chartreuse"` → green (move proof), `"midnight purple"` → purple (midnight drop safe). All locked rulings hold: `copper` → brown, `terracotta` → orange, `teal` → blue, `Rose Gold` → metallic, `Coral Pink` → pink, `Silver-Grey` → grey.
4. **No iPhone test needed** — nothing in the Edge Function calls the new helpers; nothing the user can do triggers any new code path. The earliest user-visible effect from this foundation lands in Session 6.

### UNVERIFIED

- **Deno runtime compile** — `tsc --strict` is a faithful proxy for Supabase Edge Function type-checking, but Deno wasn't installed locally so we didn't run `deno check`. Risk is essentially zero (pure ES2022 + standard TypeScript; no Deno-specific APIs in the new code), but flag for the record. Will be verified the moment Session 6 deploys with a call site added.

### Notes / decisions

- **No deploy this session.** Dormant code has nothing to verify at runtime. Anthropic prompt caching keys on SYSTEM_PROMPT CONTENT, not on function bundle — so a redeploy with byte-identical SYSTEM_PROMPT would NOT have invalidated the cache. The only natural cache cost is the 5-min TTL lapse between generations. Deploy deferred to Session 6 when the helpers actually get called.
- **CRITICAL — Session 6 input contract (DO NOT FORGET):** when Session 6 wires `colorFamilyForText` to read item colours from the wardrobe, feed it the COLOUR FIELD ONLY (e.g. `item.colour`), NEVER `item.name + item.colour` combined. Item names contain fabric/style words (Linen Shirt, Denim Jacket, Sand-Washed Tee) that would produce false positives. The existing inner `colorFamily(item)` at index.ts:816 uses `name + colour` deliberately for its smart-fallback purpose only — do NOT propagate that pattern. The contract is anchored in three places: (a) the code comment above the helper definition, (b) the CLAUDE.md Standing Facts bullet for Session 5, (c) this SESSION_NOTES entry.
- **Pastels + Bold Colors return null** — known gap; saturation/lightness concepts can't translate to a single family list. Session 6 will need a separate mechanism (probably a flag passed to Sonnet, or per-item lightness/saturation check). Documented in the code comment.
- **One new low-priority KNOWN ISSUE added to CLAUDE.md** — Cool + Rainy occasionally picks a heavy winter parka. Read-only observation, no code change. Most users won't own a heavy winter parka. Revisit only if reported.
- **`session-24a-shelved` not restored. `main` untouched. `production` untouched. No tags. No `npm audit fix`. No new dependencies. No App.js touched. No SYSTEM_PROMPT touched.**

---

## Update 1 — Session 4 — 2026-06-24 — Indoor toggle silent-weather fix (Anorak bug)

**Branch:** testing (HEAD at session start: `73a4419`)
**Commit(s):** to be created at session end, single commit on testing
**Edge Function deploys:** 1 (`generate-outfits` via CLI `--use-api`, no `--yes` flag)
**Cache token count:** 2,510 (unchanged — SYSTEM_PROMPT not touched)
**App Store impact:** LIVE — same `generate-outfits` Edge Function is called by Build 12 in production. The deploy reached live App Store users immediately. Outdoor path was provably verified byte-identical via Regression Tests A/B/C before sign-off.

### Goals
- Close the "Rubber Rain Anorak indoors" bug: with Indoor toggle ON, Sonnet was still picking weather gear (e.g. a rubber rain anorak) because the weather signal was still reaching the prompt. The `HEAVY_OUTERWEAR` name-pattern filter that's supposed to catch heavy outerwear was missing the word `anorak` — fragile name-list whack-a-mole.
- Replace the fragile name-list defense (for the indoor case only) with a root-cause fix: silence the weather signal entirely when `indoors === true`. Sonnet then styles purely for Occasion + Brief.
- Outdoor path (`indoors === false`) must be byte-identical to before.

### What changed (`supabase/functions/generate-outfits/index.ts` only — 8 surgical edits gated behind `indoors === true`; +18 / -8 lines, net +10)

**In `buildFreshContent`:**
- Line 491 — `weatherHint` is now `null` when `indoors === true` (skips `buildWeatherHint`; removes the STYLING NOTES weather bullet on the indoor path). Otherwise calls `buildWeatherHint(temperature, condition)` as before.
- Line 545 — Weather data line renders as `'Weather: Indoors — climate not a factor'` when `indoors === true`, otherwise byte-identical `` `Weather: ${temperature}, ${condition}` ``.

**In `applySafetyFilters` — six weather filters now gated `!indoors`:**
- C1 Cold (drops Light/None-warmth Tops/Dresses)
- Cool/Cold open-footwear name-pattern (drops sandals / flip-flops / etc.)
- C2 Hot (drops Heavy warmth tag across all categories)
- Hot/Warm heavy-outerwear name-pattern (drops parkas / puffers / etc.)
- C3 Rainy (drops suede / open-toe shoes)
- C4 Snowy (drops suede / espadrille / heels / etc.)

Each guard added as `if (!indoors && <original condition>) { ... }` — smallest possible diff, preserves existing structure. Comment added above each: `Skipped when Indoor toggle is ON — climate is silent on the indoor path.`

**Kept as belt-and-suspenders (deliberately untouched):**
- C5 Indoor warmth filter (index.ts:1086) — still fires on `indoors === true`, drops Heavy-warmth Outerwear. Dormant today (warmth column NULL per Known Issue), ready when it lights up.
- Indoor name-pattern filter (index.ts:1102) — still fires on `indoors === true`, drops Outerwear items matching `HEAVY_OUTERWEAR` regex.

Neither is load-bearing now — silencing weather is the primary defense — but both cost nothing at runtime and provide layered defense against any future Sonnet prompt-rule slippage.

**Not touched:** SYSTEM_PROMPT, App.js, eas.json, app.config.js, Supabase schema, all Occasion filters (heels for active occasions / sneakers for Formal / open-footwear for Outdoor·Sport / fancy-dress / skirt), dislikes filter, the `Indoor: Yes/No` line at index.ts:546, the `Brief:` line at index.ts:547. Brief reaches Sonnet on every call regardless of toggle, so "office is freezing, bring a sweater" still overrides indoor silence.

**Byte audit before deploy:** em-dashes 137 (clean UTF-8 `0xE2 0x80 0x94`), middots 18 (clean UTF-8 `0xC2 0xB7`), zero mojibake sequences. One new em-dash in user-facing copy (`'Weather: Indoors — climate not a factor'`); six new em-dashes inside the new "Skipped when Indoor toggle is ON" comments.

### Mid-session: Supabase PAT rotation

First deploy attempt returned `401 Unauthorized`. PAT in Keychain (44 chars, correct `sbp_` prefix) was structurally fine, but Supabase had revoked or expired it on their side. Grace generated a fresh PAT via dashboard (https://supabase.com/dashboard/account/tokens), Supabase-side name `clozie-cli-2026-06-24`, expires 2026-12-19. Keychain entry `supabase-pat-clozie` updated in place via `security add-generic-password -U -s "supabase-pat-clozie" -a "$USER" -w "<new-PAT>" -T /usr/bin/security`. Redeploy succeeded. CLAUDE.md PAT rotation block updated with the rotation date and new token expiry as a standing fact.

### Tests — all PASSED on iPhone + Supabase Logs

1. Indoor ON + Rainy + Going Out → no anorak / no rubber rain anything in any of the 3 outfits. ✅
2. Indoor ON + Cold + Casual Day → no parka / puffer / heavy coat forced. ✅
3. **Seatbelt 1** — Indoor ON + Work · Office / Formal Event → blazer or suit jacket still appears. ✅
4. **Seatbelt 2** — Indoor ON + Brief = "office is cold, bring a sweater" → sweater / cover-up appears (Brief overrides indoor silence). ✅
5. **Regression A** — Indoor OFF + Rainy → behaves byte-identical to pre-fix (suede / sandals filtered, weather bullet present, Weather data line present). ✅
6. **Regression B** — Indoor OFF + Snowy → heels and unsafe-for-snow shoes filtered as before. ✅
7. **Regression C** — Indoor OFF + Warm + Sunny → normal outfits, no anomalies. ✅
8. **Cache check** — Supabase Logs showed `cache_read_input_tokens: 2510` on a second generation within 5 minutes (round-trip proof; SYSTEM_PROMPT untouched). ✅

### UNVERIFIED
- None. All seven scenarios verified directly on iPhone calling the live Edge Function. Cache integrity confirmed in Supabase Logs.

### Notes / decisions
- **Honest caveat acknowledged at planning time:** silencing weather makes the anorak indoors *extremely unlikely*, not *mathematically impossible*. Sonnet could still pick a rain anorak for purely aesthetic reasons on a Going Out occasion. Without a weather signal pushing it, probability collapses; with the belt-and-suspenders filters still active, even further. Accepted knowingly in the brief.
- **Deploy shape decision:** single focused deploy chosen over splitting into two (filter-guards first, then user-message changes). The three changes only make sense together — a partial deploy would have left the fix half-done. One revert path, one test pass.
- **Keep-the-name-list decision:** Grace had no preference; defaulted to keep the redundant Indoor name-pattern filter (and dormant C5 warmth filter) as belt-and-suspenders. If after a few days of TestFlight the name-list proves redundant, prune in a separate one-line session — don't bundle with the fix.
- **Live blast radius:** this Edge Function is the same function called by Build 12 in the App Store. Deploy reached LIVE App Store users immediately. Outdoor behavior (Indoor OFF) was verified byte-identical via Regression Tests A/B/C before sign-off.
- **No App.js change. No SYSTEM_PROMPT change. No `eas.json` / `app.config.js` / Supabase schema change. No new dependencies. No `npm audit fix`. `session-24a-shelved` not restored.**

---

## Update 1 — Session 3 — 2026-06-23 — Dynamic Type cap (iOS Larger Text)

**Branch:** testing (HEAD at session start: `94bde91`)
**Commit(s):** to be created at session end, single commit on testing
**Edge Function deploys:** none
**Cache token count:** 2,510 (unchanged — SYSTEM_PROMPT not touched)
**App Store impact:** none yet — work-in-progress toward Build 13

### Goals
- Cap how far iOS Dynamic Type can scale Clozie's fonts at the largest accessibility text sizes, so the Welcome and Splash layouts stop breaking when the slider is maxed (pre-fix the 64pt logo hit the notch and the tagline collided with the photo).
- **Scope: cap only.** Full responsive-layout rework (replacing fixed `top:80` / `bottom:60` with `useSafeAreaInsets`) explicitly DEFERRED to a dedicated future session. The cap is a MITIGATION, not a fix.

### Architecture context (one-paragraph preamble)

Expo SDK 54.0.35 + RN 0.81.5 + React 19.1.0. No `newArchEnabled: false` override anywhere → this build runs the New Architecture (Fabric). RN's `maxFontSizeMultiplier` has had a documented weakness on Fabric at the extreme accessibility sizes (AX1-AX5), so the plan was deliberately defensive from the start: one global default PLUS explicit per-component overrides on the biggest headings in the same session. Pre-session repo-wide grep for `maxFontSizeMultiplier`, `allowFontScaling`, `Text.defaultProps` returned zero matches — every Text was scaling unlimited.

### What changed (App.js only — 9 cap sites added; no styles, no layout, no new files, no new dependencies)

**Step 1 — global cap on Text + TextInput.** 8 lines inserted at module scope at App.js:48–55, immediately after the imports and before the design-tokens block:

    // Dynamic Type global cap — limits iOS Larger Text scaling to 1.3× app-wide.
    // Tighter caps on big headings live inline at Welcome + Splash.
    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.maxFontSizeMultiplier = 1.3;
    TextInput.defaultProps = TextInput.defaultProps || {};
    TextInput.defaultProps.maxFontSizeMultiplier = 1.3;

Module scope so it runs once at load, not on every render. No-op at the default text slider position (multiplier 1.0).

**Step 2 — Welcome explicit caps.** Four single-prop additions in WelcomeScreen JSX:
- App.js:189 — `logoClo` → `maxFontSizeMultiplier={1.1}`
- App.js:190 — `logoZie` → `maxFontSizeMultiplier={1.1}`
- App.js:192 — `eyebrow` → `maxFontSizeMultiplier={1.15}`
- App.js:196 — `tagline` → `maxFontSizeMultiplier={1.15}`

64pt × 1.1 = ~70pt at max slider, clears the notch. 18pt × 1.15 = ~20.7pt within the 26pt fixed `lineHeight` of the tagline, no vertical clipping.

**Step 3 — Splash explicit caps.** Three single-prop additions in SplashScreenView JSX:
- App.js:142 — `splashLogoClo` → `maxFontSizeMultiplier={1.1}` (72pt DM Serif "Clo")
- App.js:143 — `splashLogoZie` → `maxFontSizeMultiplier={1.1}` (72pt italic "zie")
- App.js:147 — `splashLabel` → `maxFontSizeMultiplier={1.15}` ("✦ YOUR PERSONAL STYLIST ✦")

72pt × 1.1 = ~79pt fits comfortably inside the existing 92pt `lineHeight` box.

**Native splash PNG unaffected.** The native splash configured in `app.config.js` (Session 19D — `expo-splash-screen` plugin) is a static image and does not respond to Dynamic Type at all. Only the React `<SplashScreenView>` (1.8s window after the native splash) needed the cap.

**Locked starting values, no tightening needed.** Pre-session call was "we tighten by 0.05 after iPhone test if anything collides." Nothing collided; numbers held.

### Tests — all live on iPhone in Expo Go, both normal text size AND slider all the way RIGHT, with Expo Go fully closed between cold-launch tests

- **Step 1 (global cap)** — normal size: zero visual change across Welcome, My Closet, Today's Vibe, Your Looks. Max slider: body/UI text "slightly enlarged, big enough to read, nothing huge, nothing broke." ✅ PASSED.
- **Step 2 (Welcome caps)** — normal size: Welcome byte-identical. Max slider: logo clears the notch, eyebrow sits clean under it, tagline fits two lines with no clipping. Closet, Hanger View, Mood Board confirmed good at both sizes. ✅ PASSED.
- **Step 3 (Splash caps)** — normal size: splash + Welcome unchanged. Max slider: splash logo clears the top with headroom + label on one line; Welcome holds; Peek Inside (no explicit cap, on global 1.3) enlarges cleanly with no clipping. ✅ PASSED.
- **Final pass** — Welcome, Peek Inside, Your Looks all unchanged at normal size. Nothing shrank, nothing shifted. ✅ PASSED.

### UNVERIFIED

- Cap behavior on a TestFlight standalone (Build 13). Expo Go and standalone share the Fabric runtime, but the documented AX-size weakness would most likely surface on standalone first. If a future tester reports text growing past the cap on a maxed slider, revisit per-component caps on the offender.

### Notes / decisions

- **MITIGATION, not a fix. Recorded explicitly in CLAUDE.md.** The cap stops the worst symptom (logo into notch, tagline into photo) at max slider but does NOT fix the underlying root cause — Welcome's `logoBlock top:80` and `bottomBlock bottom:60` (App.js:7925, 7953) are fixed-pixel positions that ignore the safe area. At the cap the logo is still bigger than at 1.0× and `top:80` still ignores the notch. The full responsive-layout rework stays DEFERRED to a dedicated future session. CLAUDE.md `WELCOME SCREEN LAYOUT` section updated to acknowledge the cap; a new KNOWN ISSUES entry was added so future-me cannot misread this as "Welcome is Dynamic Type clean."
- The cap also does NOT protect any FUTURE fixed-pixel layout. Every new layout still needs to be designed for the 1.3× / 1.15× / 1.1× growth bands.
- Did NOT use `allowFontScaling={false}` anywhere (explicitly out of scope; would have killed accessibility).
- Did NOT touch the Session 2 scroll fix, the Session 10A My Closet redesign, the debug button, the layout switcher, or DEBUG_LAYOUTS.
- No Edge Function deploys, no SYSTEM_PROMPT touch, no eas.json change, no app.config.js change, no Supabase schema change, no new dependencies. Pure client-side render-behavior change.

---

## Update 1 — Session 2 — 2026-06-22 — My Closet "second pencil while open" scroll fix

**Branch:** testing (HEAD at session start: `0c1d2c0`)
**Commit(s):** to be created at session end, single commit on testing
**Edge Function deploys:** none
**Cache token count:** 2,510 (unchanged — SYSTEM_PROMPT not touched)
**App Store impact:** none yet — work-in-progress toward Build 13

### Goals
- Fix the "stranded edit panel" symptom: when the Add/Edit panel was already open in My Closet and the user tapped a DIFFERENT pencil, the panel silently re-targeted to the new item off-screen and did NOT scroll into view. Looked like the app was broken.
- Two related symptoms (status-bar-tap-scrolls-to-top without closing; close strands list at the bottom; silent overwrite of unsaved typing on second pencil) deliberately NOT fixed this session — logged as open problems for future sessions.

### What changed (App.js only — no other files touched)

Three surgical edits inside WardrobeTab.

**Step 1 — new ref.** Added `const panelYRef = useRef(null);` immediately after the existing `scrollRef` + `hasScrolledForPanelRef` block (App.js around line 1311), with a comment explaining intent. Dead code until Step 3.

**Step 2 — capture panel Y on every onLayout.** Added `panelYRef.current = e.nativeEvent.layout.y;` as the first line inside the panel wrapper's existing `onLayout` (App.js around line 1939), OUTSIDE the existing `if (showAddPanel && !hasScrolledForPanelRef.current && scrollRef.current)` block. The existing one-shot first-open scroll is byte-identical; only the unconditional ref-capture is new.

**Step 3 — use captured Y in handleEditItem.** Appended a 7-line gated block at the end of `handleEditItem` (App.js around line 1377), after `setShowAddPanel(true)`:

    if (showAddPanel && panelYRef.current != null && scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: Math.max(0, panelYRef.current - 12), animated: true });
      });
    }

`showAddPanel` in this gate is the pre-render closure value (React state setters are async), so the branch fires only on "second pencil while panel is already open." First-open is still handled by the existing one-shot inside `onLayout`. `requestAnimationFrame` ensures the scroll runs after React commits the new field values.

### Tests — all live on iPhone in Expo Go

- First pencil tap from cold → panel auto-scrolls into view (existing behavior unchanged). ✅ PASSED.
- Open panel on item A → tap pencil on item B → panel scrolls back into view, fields update. ✅ PASSED.
- Both items have photos AND similar-length notes (the case where the cheaper "reset the existing guard" approach would have failed because onLayout doesn't re-fire when panel height is identical) → still scrolls. ✅ PASSED.
- Close via X → re-open via floating + → first-open auto-scroll still works. ✅ PASSED.
- Close via Cancel → re-open via pencil → first-open auto-scroll still works. ✅ PASSED.

### UNVERIFIED

None this session. Everything was iPhone-testable in Expo Go.

### Notes / decisions

- Considered the smaller "Option A" fix (reset `hasScrolledForPanelRef.current = false` in `handleEditItem` so the existing onLayout one-shot re-fires). Rejected after closer reading: `onLayout` only re-fires when the panel's measured height changes between the two items. Two items both with photos and similar-length notes produce identical panel height → onLayout doesn't re-fire → no scroll. A sometimes-works UI fix is worse than no fix. Capture-and-scroll-directly fires every time.
- Did NOT convert the inline panel to a real Modal. That is the structural fix that would also kill the status-bar-tap-to-top symptom AND the close-strands-the-list-at-the-bottom symptom in one pass. Logged as a new KNOWN ISSUES entry in CLAUDE.md for a dedicated future session — too much surface area to bundle here.
- Did NOT guard against silent overwrite of unsaved typing when a second pencil is tapped. Logged as a new KNOWN ISSUES entry in CLAUDE.md — planned as the next session.
- No new dependencies, no Edge Function deploys, no SYSTEM_PROMPT touch, no Supabase schema changes. Pure client-side fix.

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
