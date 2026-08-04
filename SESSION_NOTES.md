# CLOZIE — Session Notes

Rolling, append-only log of what happened in each session. Newest entry at top.

This file is NOT auto-loaded — read on demand when you need detail beyond the CURRENT BUILD STATE snapshot in CLAUDE.md.

Format: every entry uses the locked structure (Branch / Commits / Edge Function deploys / Cache token count / Goals / What changed / Tests / UNVERIFIED / Notes). Keep entries scrollable on a single screen; spillover means the detail belongs lifted into CLAUDE.md as a rule, or split into a follow-up session.

Desktop copy at session close: name it `SESSION_NOTES_Update[N]_Session[M]_[YYYY-MM-DD]_[topic].md` (topic all-lowercase, hyphenated) and include ONLY that session's single entry — never this whole log. Full rule in CLAUDE.md → DOCUMENTATION LAYERS.

Session numbering reset to "Update N — Session M" starting 2026-06-21. All legacy sessions through Build 12 live in CLAUDE.md prose + CLAUDE_ARCHIVE.md.

---

## Update 4 — Session 29 — 2026-08-04 — READ-ONLY: baseline washout reproduced faithfully in a fresh Mac harness; "read the room" scene-classifier MEASURED and ruled out; pivot to garment-only chroma-threshold retune (tuned by eye). No shipping code, no build, no Edge Function.

**Branch:** testing @ `0095f89` at start; this session commits two docs files on top (testing → 1 ahead of origin, NOT pushed). main `062d15b` UNTOUCHED / production `0baff39` UNTOUCHED. Build 29 / v1.0.5 still LIVE.
**Commits (this session, testing, named-file only — no `git add -A`, no amend):** (1) this SESSION_NOTES.md entry; (2) CLAUDE.md CURRENT BUILD STATE pointer. Both "This commits to testing, not main."
**Edge Function deploys:** 0. **Cache token count:** 2,510 (SYSTEM_PROMPT untouched). **EAS builds:** 0. **Session type:** READ-ONLY diagnostic + Mac-harness measurement. **All work in the scratchpad, OUTSIDE the repo** — `AutoWhiteBalance.swift` READ only, never edited (still md5 `f929d680…`).

**Goal at start:** build a fresh, faithful baseline harness that reproduces the live washout, then measure whether the ROOM around a garment can tell a light-cast (→ whiten) from a garment's own colour (→ leave) — the only signal that could separate whites from pales.

**What we did (Mac swiftc; real Vision mask; ported VERBATIM from shipped `AutoWhiteBalance.swift` — estimator `:120–201`, apply tail `:245–313` = CIColorMatrix + CIExposureAdjust EV=log2 g + fork-b fringe blend + output image):**
- **Baseline VERIFIED to the digit.** Oatmeal: brightGain **1.4932**, sC **1.0000**, raw (212,193,168) → corrected **(234,232,230)**, warmth R−B **+44→+4**, brightness **191→232**. Reproduces the Session 26/27 signature; confirmed washed on the sage card #E8E4CE by Grace's eye. (Others: whitetee_warm +30→−2; whitetee_daylight −39→+11; babyblue −30→−5 — every pale flattened + brightened.)
- **Root cause restated:** the estimator reads a low-chroma garment's OWN colour as the illuminant and neutralises + brightens it; the `sC` chroma gate never fires on pales (meanBodyChroma below `protLo` 0.22 → sC=1.00). Whites AND pales are both low-chroma → nothing INTERNAL to the garment separates them.
- **"Read the room" (scene classifier) — MEASURED DEAD END.** Background R−B (red rug excluded via low-saturation filter, foreground + foot excluded, edge-eroded): whitetee_warm **+14**, babyblue **+15**, oatmeal **+7**, whitetee_daylight **−3**. No threshold separates the 2 whites from the 2 pales — whitetee_warm (+14) ≈ babyblue (+15) but need OPPOSITE treatment; oatmeal (warm garment in the SAME warm room) reads a warm bg = indistinguishable from a white under warm light. Root reason: **no true neutral/white reference in real user rooms** (rug / wood floor / beige couch / cream border all carry their own colour), and the iPhone capture-AWB has already partly flattened the cast (daylight couch bg −3 behind a −39 garment). Sampled-pixel visuals confirmed rug + foot were excluded. **This supersedes Session 27's tentative "a scene reference would preserve the pales."**
- **Re-shoot does NOT rescue it** as a shipping strategy — users photograph clothes on beds/rugs/sofas, not grey cards.
- **"Just turn AWB off" — REJECTED (Grace's eye, on record):** it regresses the whites, which were the entire point of the Session 13–19 white-fix (the warm white tee must stay clean).

**PRIORITY REFRAME (Grace, on record):**
- **IDEAL** = every garment its TRUE colour — white=white, oatmeal=oatmeal, peach=peach, yellow=yellow, blue=blue. That is the goal.
- **FALLBACK, only if all-correct is unreachable:** protect the CHROMATIC pales first (blues, peaches, yellows). Oatmeal→cream is the one to sacrifice first if forced — cream is an honest neighbour, low-harm, no user misled. A priority ORDER, not a wish to make oatmeal cream.
- **ADD yellow** to the 4-photo test set next session (untested so far).

**TWO on-record observations — both VERIFIED as COLOUR in the rendered cutout (NOT the AI text label; already checked):**
- (a) A genuinely WHITE tee sometimes renders CREAM/warm — the correction UNDER-cleans some whites (same washout mechanism, opposite direction). More evidence this is ONE miscalibrated correction, not a physical law.
- (b) Baby blue sometimes renders GRAY — chroma stripped to neutral = true colour-IDENTITY LOSS, not a gentle wash toward white. This is the RED-LINE failure.

**NEXT-SESSION GATE HIERARCHY (judged by Grace's eye on renders):**
1. **Best** = all colours true, including yellow.
2. **Hard red line** = NO chromatic colour goes neutral. Baby blue must never read gray; peach must stay peach.
3. **Tolerable only if forced** = oatmeal→cream; a slight cream cast on a genuine white.

**CHOSEN NEXT DIRECTION (NOT started) — garment-only chroma-threshold retune.** Because we do NOT need to win the hardest case (oatmeal vs warm-lit white), a chroma-threshold retune reopens: lower `protLo` to protect higher-chroma pales (baby blue ~0.09, peach higher) while still correcting the lowest-chroma (white ~0.05, oatmeal ~0.06 → cream, both fine). Automatic, closet-wide, no room signal, no per-item labour. **Honest residual risk on record:** a white under STRONG COOL DAYLIGHT measures chroma ~0.20 — bluer than baby blue — so the cool side is NOT cleanly threshold-separable; baby blue is protectable in normal light but may slip against a strong cool-daylight white. Peach (warm) is cleaner to protect.

**Tests:** none on device — read-only Mac measurement. No functional-regression risk (no shipping file touched).

**UNVERIFIED:** no correction candidate built or validated this session; the chroma-threshold retune, its `protLo` value, the gate hierarchy, and the cool-daylight-white residual risk are all unmeasured until next session's renders (test set to include yellow).

**Notes:** scratchpad (outside repo, throwaway): `render_baseline.swift` + binary, `render_step3b.swift` + binary, `measure_room.swift` + binary, `photos/` (4 byte-identical locked copies: whitetee_warm / whitetee_daylight / oatmeal / babyblue), `compare_baseline_*.png` (RAW | RAW-on-sage | AWB-on-sage), `room_*.png` (sampled-pixel visuals). cache 2,510, Build 29 / v1.0.5 still LIVE. Session 26 `MEASURE_COLOR_MODE` flag remains in code (unchanged) and MUST be removed before any App Store promotion. Separate parked task (NOT the washout fix): a plain/white capture background could improve the CUTOUT (cleaner isolation) but does not fix the washout and can slightly worsen it.

---

## Update 4 — Session 28 — 2026-08-03 — READ-ONLY: background removal measured IN ISOLATION (AWB off, enhance 0). Pipeline is colour-CLEAN; source photos carry different casts per lighting. No fix built, none validated. No shipping code, no build, no Edge Function.

**Branch:** testing @ `dfea4b8` at start (Session 27 docs commit); this session commits two docs files on top. main `062d15b` UNTOUCHED / production `0baff39` UNTOUCHED. Nothing pushed; testing ahead of origin (`5a8c046`).
**Commits (this session, testing, named-file only — no `git add -A`):** (1) this SESSION_NOTES.md entry; (2) CLAUDE.md pointer (new Last-updated block + Session 27 block demoted to a dated block). Both "This commits to testing, not main."
**Edge Function deploys:** 0. **Cache token count:** 2,510 (SYSTEM_PROMPT untouched). **EAS builds:** 0. **Session type:** READ-ONLY diagnostic. **All work in the scratchpad, OUTSIDE the repo** — `BackgroundRemovalModule.swift` + `AutoWhiteBalance.swift` READ only, never edited.

**Goal at start:** Session 27's Step 2 — measure background removal IN ISOLATION: same photo straight in vs straight out with `autoWhiteBalance` OFF, to see whether masking / cropping / compositing / PNG-encoding ADDS any colour shift of its own (never measured before).

**What we did (Mac swiftc harness; real Vision `VNGenerateForegroundInstanceMaskRequest`; faithful copy of `removeBackground()` for the AWB-off / enhance-0 / dials-identity / shadow-off path):** ran BOTH endings on 4 photos (warm white tee / daylight white tee / oatmeal / baby blue — the exact raw `fixed.uri` captures from Sessions 26/27). **PATH A** = mask → composite over white → JPEG q0.9 (Build-25 look); **PATH B** = mask → transparent PNG (current look). Production parity: `CIImage(cvPixelBuffer:)` no options, default `CIContext()`, `createCGImage(_,from:)` no colorspace — ZERO added colour management. Measured garment-interior median RGB (alpha ≥ 0.98, eroded 6px, 50k–113k px) in appearance-sRGB at 4 points: Source → Post-mask → Path A → Path B.

**MEASURED — pipeline is colour-clean (max delta 0–1 = rounding, every photo):**
- white tee warm: source (240,226,207) → post-mask (240,226,206) → A (240,226,206) → B (240,226,206)
- white tee daylight: (169,185,218) unchanged through all 4
- oatmeal: (218,200,171) → (218,200,171) → A (219,200,171) → B (218,200,171)
- baby blue: (182,204,212) → (182,204,212) → A (182,203,212) → B (182,204,212)

Mask / crop / white-composite / PNG-encode add NO colour shift. The Display-P3→sRGB output conversion is properly colour-managed and correctly tagged sRGB (NO profile mismatch). **The cutout machinery did NOT brown the whites.**

**MEASURED — source casts differ per lighting:** the SAME white tee is warm/cream in warm light (R−B **+33**) and cool/blue in daylight (R−B **−49**). The cast is in the CAPTURE, before the pipeline.

**PRIOR-established (NOT this session's harness), on the record:** enhance (`enhanceStrength 1.0`) damaged Build-26-era STORED files (ivory dingy, cream dress stored brown) — Build 26 TestFlight eyeball, 2026-07-14 Known Issue; harness ran enhance 0, so NOT re-tested here. Current AWB washes pales in the live closet — Grace on-device + Session 27 harness (`sC=1.00` on all pales).

**Renders (Grace's eye = required gate):** 4 side-by-side PNGs `compare_*.png` (RAW | Path A on white | Path B on sage #E8E4CE) delivered. Pixels proven identical A↔B; the renders show the same pixels under different framings.

**NO fix claimed or validated.** Session 27 Direction B FAILED Grace's eyeball (oatmeal too yellow). Nothing this session tested a correction.

**Tests:** none on device — read-only Mac measurement. No functional-regression risk (no shipping file touched).

**NEXT SESSION:** test correction candidates in the Mac harness against this 4-photo set (warm white / daylight white / oatmeal / baby blue). Grace's eyes are the ONLY pass gate.

**Notes:** scratchpad (outside repo, throwaway): `measure_twopath.swift` + binary, `render_step6.swift` + binary, `photos/` (4 byte-identical copies of the raw captures), `out/` (Path A jpg + Path B png per photo), `compare_*.png`. Reused Session 27's `probe_vision`/`measure_v2` patterns for the Vision mask + sampling. swiftc / macOS 26; Vision headless OK. cache 2,510, Build 29 / v1.0.5 still LIVE. The Session 26 `MEASURE_COLOR_MODE` flag remains in code (unchanged this session) and MUST be removed before any App Store promotion.

---

## Update 4 — Session 27 — 2026-08-03 — READ-ONLY Mac measurement of the AWB washout: root cause CONFIRMED in code; scene-reference fix simulated (colours preserved, whites don't converge); 4 visual comparisons rendered. No shipping code, no build, no Edge Function.

**Branch:** testing @ `5c8d14e` (HEAD unchanged all session; Session 26 docs commit). main `062d15b` UNTOUCHED / production `0baff39` UNTOUCHED. Nothing pushed; testing ahead of origin (`5a8c046`).
**Commits (this session, testing, named-file only — no `git add -A`):** (1) this SESSION_NOTES.md entry; (2) CLAUDE.md CURRENT BUILD STATE pointer (new Last-updated block + Session 26 block demoted to a dated block). All "This commits to testing, not main."
**Edge Function deploys:** 0. **Cache token count:** 2,510 (SYSTEM_PROMPT untouched). **EAS builds:** 0. **Session type:** READ-ONLY diagnostic + on-Mac simulation. **All work in the scratchpad, OUTSIDE the repo** — `AutoWhiteBalance.swift` and `BackgroundRemovalModule.swift` were READ only, never edited.

**Goal at start:** confirm/refute the Session 26 diagnosis (AWB over-whitens pale warm garments) at the code + numeric level, and scope the lowest-risk fix directions — before touching any shipping code.

**What we did (Mac swiftc harnesses; garment cut with real Vision `VNGenerateForegroundInstanceMaskRequest`; verbatim copies of the AWB math):**
- **Step 3 — instrumented measurement.** Copied the AWB constants + `estimateIlluminant` + `corrected()` math verbatim, added prints. Harness proven FAITHFUL: raw camera body (214,195,171) vs Grace's sips (211,191,164); raw library (218,199,172) vs (218,198,168); corrected oatmeal (234,232,230), warmth R−B **43→4** — the exact washout signature. **Root cause CONFIRMED in code:** (1) the estimator reads the garment's OWN colour as the illuminant (oatmeal illum ≈ garment; baby blue illum ≈ garment) and builds neutralising WB gains + a ~1.5× brightness lift; (2) the chroma-protection gate **never fires — `sC = 1.00` on ALL pales** (meanBodyChroma 0.05–0.15, far below `protLo` 0.22). The estimator is the damage; the gate is a backstop that structurally can't engage for low-chroma garments. `enhanceStrength` is `0.0` in live `CUTOUT_OPTIONS`, so AWB runs on the masked garment with no pre-enhance.
- **Direction A (hue/locus-aware protection) ruled OUT:** oatmeal's estimated illuminant is warm amber and baby blue's is blue-cyan — both sit ON the natural warm↔cool daylight axis, so hue can't separate garment-colour from light. Only a scene reference can.
- **V1 — scene-vs-garment divergence** (background sampled via inverse Vision mask). **Gray-world is defeated by the red rug (R/B 2.4–4.2 warm everywhere) — unusable.** **White-patch (brightest near-neutral scene pixels) reads ≈neutral (R/B ~1.0) in EVERY shot, including on a different rug** — strong evidence it finds real neutral references. Garment vs white-patch: oatmeal 1.73 vs 1.01, blue 0.74 vs 1.06 → **DIVERGE → a scene reference would preserve them.** White tee: garment 1.43 vs scene 1.07 → only partial.
- **V2 — full Direction-B simulation** (white-patch WB + gentle scene-anchored brightness) vs current AWB. **Colours preserved:** Dir-B oatmeal (247,235,203) R−B **+44**, baby blue (195,222,232) **−37**, where current AWB washes both to (234,232,230)/+4 and (226,228,231)/−5. **White-tee NON-CONVERGENCE found (key catch):** the SAME tee lands warm-light → chromaticity R/B **1.27 (cream)**, daylight → **0.63 (blue)** — ~2× apart, does NOT converge. Current AWB converges whites BETTER (warm (245,246,247), daylight (226,220,215)) because it neutralises the garment itself. Root of the Dir-B white failure: the daylight tee's **beige couch under cool light read FALSELY neutral**, leaving the shirt's blue cast in place.
- **Visual comparisons — 4 PNGs in scratchpad** (RAW | CURRENT AWB | DIR-B, full garment on white): `compare_oatmeal.png`, `compare_babyblue.png`, `compare_whitetee_warm.png`, `compare_whitetee_daylight.png`. Delivered to Grace.
- **Hybrid A/B analysis.** **A (garment-only chroma threshold):** lowest risk (retune the existing `sC` gate) but weak separating signal — warm-lit-white (0.05), neutral-ish oatmeal (0.06), baby blue (0.088) overlap → unavoidable gray zone; cool-daylight white (chroma 0.20) reads as colored → stays blue. **B (scene as CLASSIFIER, not corrector):** garment cast ≈ scene cast → near-white-under-cast → run current full AWB (clean, converged white); cast unexplained by scene → protect. **B keeps the Session 13–19 warm-white win AND preserves oatmeal/blue — strictly better than Direction B on whites, same on colours.** B's failure = false-neutral scenes (daylight couch). **No approach solves the gray zone** where "white under a cast" and "pale colour" are the same pixels with no true-white tie-breaker — fundamental.

**Grace's eyeball verdict (REQUIRED gate — numbers alone are NOT enough):** in the Direction-B renders, **oatmeal reads too YELLOW** to her eye (not true oatmeal); blue and white panels acceptable. Any future fix must pass Grace's VISUAL sign-off, not just the numeric scoreboard.

**ROOT-CAUSE FRAMING (on the record — Grace):** everything so far has fixed SYMPTOMS (whites fix → broke pales → judges to protect pales = patches on patches). **Key historical fact: whites WERE white on the closet cards when background removal FIRST shipped; the beige/brown whites appeared LATER.** So something CHANGED in between and THAT is the true root — none assumed. Candidates: BR-module rework across builds; the SDK 54→57 upgrade; the capture/resize path; the card compositing. Guiding principles: **the colours cannot disagree (same garment → same answer), and no more patches on patches.**

**Tests:** none on device — read-only Mac measurement + simulation only. No functional-regression risk (no shipping file touched).

**NEXT-SESSION PLAN (in order):**
1. **Establish the timeline** from SESSION_NOTES + build history — find which build/change turned whites from white to brown.
2. **Measure BR in isolation** — same image straight in vs straight out, `autoWhiteBalance` OFF, to see whether masking / cropping / compositing ADDS any colour shift of its own (never measured before).
3. **Only then decide fix strategy from the root** — Hybrid B (scene-as-classifier) LEAD candidate, Hybrid A (chroma threshold) FALLBACK, validated via V3 in the Mac harness IF the root investigation still points that way.

**Notes:** scratchpad (outside repo, throwaway): `probe_vision.swift`, `measure_awb.swift`, `measure_v1.swift`, `measure_v2.swift`, `render_compare.swift` + the 4 `compare_*.png`. swiftc 6.3.1 / macOS 26.4.1; Vision foreground-instance mask runs headless under CommandLineTools. One caught-and-fixed copy error in the harness (gB gain used the wrong source term) before any numbers were trusted. Nothing built, nothing deployed, cache 2,510, Build 29 / v1.0.5 still LIVE. The Session 26 `MEASURE_COLOR_MODE` flag remains in code (unchanged this session).

---

## Update 4 — Session 26 — 2026-08-02 — MEASURE-ONLY BUILD 30 + DECISIVE MEASUREMENT. Washout root cause FOUND: background-removal AWB over-whitening pale warm garments — Session 25 capture-path theory OVERTURNED. One EAS build (measure-only, TestFlight); no fix code yet.

**Branch:** testing @ `17472d1`, ahead of origin by 4, NOT pushed. main `062d15b` UNTOUCHED / production `0baff39` UNTOUCHED.
**Commits (this session, testing, named-file only — no `git add -A`, no amend):** `64b980e` version bump 1.0.5 → 1.0.6 (`app.config.js` + `package.json`); `17472d1` measure(camera-color) — `MEASURE_COLOR_MODE` share of raw `fixed.uri` on camera + library paths (`App.js` only, +20 lines, purely additive). Plus this SESSION_NOTES entry + a CLAUDE.md CURRENT BUILD STATE block + a KNOWN ISSUES bullet. All "This commits to testing, not main."
**Restore tag:** annotated `v2026-08-02-pre-camera-color-fix` @ `c447731` (known-good pre-camera-work bookmark; local only, not pushed).
**Edge Function deploys:** 0. **Cache token count:** 2,510 (SYSTEM_PROMPT untouched). **EAS builds:** 1 — Build 30 (v1.0.6), measure-only, delivered to TestFlight via Transporter; NOT promoted (Build 29 / v1.0.5 still LIVE). **Session type:** measure build + on-Mac measurement.

**Goal at start:** fix the oatmeal / pale-warm "washout" (garments coming out almost-white; misnamed "Stone Grey" / "Powder Blue").

**What we built — measure-only Build 30 (v1.0.6):** a TEMPORARY `MEASURE_COLOR_MODE` flag + `shareForMeasurement(uri, title)` helper (module scope, right after `CUTOUT_OPTIONS`), plus ONE added line in each of `handleTakePhoto` ("CAMERA capture — AirDrop to Mac") and `handleUploadFile` ("LIBRARY capture — AirDrop to Mac"). Fire-and-forget, error-swallowing, NOT awaited — the normal `Promise.all([runRecognition(fixed.uri), applyBackgroundRemoval(fixed.uri)])` + save-to-closet flow stays byte-identical to Build 29. Purpose: hand the raw `fixed.uri` (the exact bytes recognition reads, BEFORE background removal) off the phone for exact ICC/pixel inspection on the Mac. Uses expo-sharing (already installed) — no new dependency, no native code. EAS auto-incremented buildNumber 29 → 30 (remote `appVersionSource`). No `eas submit` (Grace's locked Transporter workflow).

**DECISIVE MEASUREMENT (Mac, sips + PIL/ImageCms, read-only):** same physical oatmeal cardigan, garment-region average RGB —
- **Raw CAMERA `fixed.uri`:** **(211,191,164)**, brightness 189, saturation ~46 — true warm oatmeal.
- **Raw LIBRARY `fixed.uri`:** **(218,198,168)**, brightness 195, saturation ~49 — true warm oatmeal; only ~6 levels brighter than camera, essentially the same colour.
- **Displayed closet CARD** (phone screenshot, garment area only): **(227,225,223)**, brightness 225, saturation **~3.8** — near-neutral white. Warmth (R−B) collapsed from ~47 (raw) to ~4 (card).

**KEY FINDING (decisive):** raw camera and raw library captures are BOTH correct warm oatmeal and nearly identical; the washout appears ONLY in the DISPLAYED card. The only processing between `fixed.uri` and the shown cutout is the background-removal module with `autoWhiteBalance: true`. **→ The visible washout is ADDED AFTER capture by the Fork-A AWB white-fix over-whitening a near-neutral WARM garment toward white. It is NOT the capture path.** This OVERTURNS the Session 25 "capture-path color-profile" diagnosis for the displayed washout.

**Also confirmed (earlier 4-file pass this session):** all four measured captures (camera/library × daylight/warm) carried a **byte-identical Display P3 ICC profile** (same MD5 `ecfda38e…`); converting P3→sRGB barely moved the numbers. There was NO tag mismatch and NO "P3 pixels wearing an sRGB label." **A P3→sRGB capture conversion (Session 25's chosen fix direction) would have done essentially nothing and risked DULLING real colours — measuring first stopped us shipping the wrong fix.**

**Tests:** measurement only. Measure build verified working on-device (share sheets fired on both paths; four raw captures + a card screenshot AirDropped). No functional-regression testing — no fix code was written.

**UNVERIFIED / open:**
- **NEXT STEP (Mac, NO build first):** compare the oatmeal cutout with `autoWhiteBalance` OFF vs ON to confirm AWB is the whitening agent and see the off-state colour. **HARD GUARD: must NOT regress WHITES.** The AWB white-fix was introduced by the Session 13–19 work specifically to clean whites (`modules/expo-background-removal/ios/AutoWhiteBalance.swift`, app-code commit `5b51910`, Session 19); Grace specifically recalls that raising whites is what made "oatmeal too white." BEFORE changing AWB, review where the white-fix was introduced and what it solved, so a pale-garment fix does not reopen the whites problem. The real fix likely must distinguish "warm neutral CAST to remove" (whites) from "genuine warm garment COLOUR to keep" (oatmeal) — not a blanket AWB on/off.
- The modest raw camera-vs-library difference (~6 levels, camera slightly duller in daylight) is real but NOT the washout — likely ordinary capture variation. The earlier colour-NAMING difference Grace saw ("Stone Grey" vs "Oatmeal") is not explained by a large raw-file gap and is a separate thread from the displayed-card washout resolved here.

**Notes:** the measure flag `MEASURE_COLOR_MODE = true` remains in committed code on testing (`17472d1`) — TestFlight-only, and MUST be flipped false / removed in the fix build before any App Store promotion. First EAS build attempt failed locally with a corrupted npx `eas-cli` cache (missing `pngjs/sync-reader`) — cleared `~/.npm/_npx/<hash>` and re-ran successfully; no EAS quota spent on the failed local attempt. EAS quota was available (buildNumber incremented, build ran) — the Session 22 "0 builds remain" note reflected July; August reset.

---

**[SUPERSEDED 2026-08-02 by Session 26 — the DISPLAYED washout is background-removal AWB over-whitening a warm garment, NOT the capture path. All four measured captures were byte-identical Display P3 (no tag mismatch), so the capture-path / P3-mistag diagnosis below is RETIRED. Kept for the record.]**

## Update 4 — Session 25 — 2026-08-01 — CAPTURE-PATH COLOR-PROFILE DIAGNOSIS (READ-ONLY). Pale-garment "washout" traced to the in-app camera path, NOT AWB, NOT lighting. No code changed, no build, no Edge Function. Branch untouched.

**Branch:** testing. main `062d15b` UNTOUCHED / production `0baff39` UNTOUCHED. HEAD `5a8c046` throughout. Nothing pushed.
**Commits (this session, testing, named-file only — no `git add -A`):** (1) this SESSION_NOTES.md entry; (2) a lean CLAUDE.md CURRENT BUILD STATE pointer. All "This commits to testing, not main."
**Edge Function deploys:** 0. **Cache token count:** 2,510 (SYSTEM_PROMPT untouched). **EAS builds:** 0. **Session type:** READ-ONLY DIAGNOSTIC.

**Goal at start:** fix the oatmeal / pale-warm "washout" (garments coming out almost-white).

**Grace's controlled experiment (on phone):** ONE physical oatmeal cardigan, added THREE ways — (1) camera-roll import → correct, named "Oatmeal"; (2) in-app camera in DAYLIGHT → washed out, misnamed "Stone Grey"; (3) in-app camera in WARM light → washed out, misnamed "Powder Blue". **Conclusion: the CAPTURE PATH predicts the washout, NOT the lighting.**

**Code-level diagnosis (VERIFIED against the real code):**
- **Both Add-Item paths are byte-for-byte identical AFTER acquisition.** Camera `handleTakePhoto` (`App.js:1787`) and library `handleUploadFile` (`App.js:1818`) both run the SAME `ImageManipulator.manipulateAsync(uri, [{ resize: { width: 512 } }], { compress: 0.75, format: JPEG })` (`App.js:1804` / `1836`), then the SAME `Promise.all([runRecognition(fixed.uri), applyBackgroundRemoval(fixed.uri)])` (`App.js:1811` / `1843`) with the SAME `CUTOUT_OPTIONS` (`autoWhiteBalance: true`, `App.js:59-62`) into the SAME shared native module (`BackgroundRemovalModule.swift:187-232`). The ONLY difference between the two paths is the picker call itself.
- **The picker is where the paths diverge (expo-image-picker `57.0.2`).** Camera → `UIImagePickerController` has **no original file** (`referenceURL` nil — the code comments this at `ImageUtils.swift:68`), so it is forced to **redraw** (`UIImage+fixOrientation.swift:50-78`, a CGContext redraw) and **re-encode** via `image.jpegData(compressionQuality: 0.85)` (`ImageUtils.swift:107`, the `default:` branch). Library → `PHPickerViewController` calls `loadImageDataRepresentation()` (`MediaHandler.swift:182`) and for HEIC returns the **ORIGINAL bytes untouched** (`ImageUtils.swift:146`) — embedded ICC/Display-P3 profile intact, no redraw, no re-encode.
- **Leading mechanism:** the P3 profile is dropped or mistagged somewhere in the camera-only redraw → `jpegData` → ImageManipulator-resize chain, so a downstream stage reads P3 pixels as sRGB → pale colors wash out. Library survives because its original profile travels through intact. **This is a profile-PRESERVATION/tagging difference, not a gamut difference** (both sources may be P3).
- **VERIFIED:** the redraw-vs-original-bytes asymmetry (camera must re-encode; library preserves original HEIC bytes). **NOT CHECKED:** the exact link where the profile is lost, and whether the camera JPEG ends up UNTAGGED vs MISTAGGED-sRGB — needs real-file inspection.

**KEY IMPLICATION — the AWB luma-gate is RETIRED for this issue.** Recognition runs on `fixed.uri` BEFORE any AWB (`runRecognition` → `recognizeWardrobePhoto` re-encodes `fixed.uri` to base64, `clozieRecognition.js:12`; AWB only ever touches the separate background-removal branch). Yet camera shots come back NAMED washed ("Stone Grey"/"Powder Blue") — so the washout is baked into `fixed.uri` UPSTREAM of AWB. The previously-scoped AWB `brightGain` luma-gate cannot fix this and would leave recognition wrong. **Luma-gate is off the table for the pale washout.**

**Package facts:** expo-image-picker `57.0.2`, expo-image-manipulator `57.0.2` — VERIFIED from node_modules. NEITHER exposes any color-space / ICC / gamut option (picker: quality/base64/exif/mediaTypes/allowsEditing/presentationStyle/cameraType; manipulator: format/compress/base64). **So there is no flag fix** — the fix must be an explicit color-managed conversion step (real code + a build).

**CHOSEN FIX DIRECTION (not yet designed):** a proper **COLOR-MANAGED P3→sRGB conversion at the CAPTURE stage, upstream of the split**, so the single shared `fixed.uri` is correctly sRGB-tagged before it fans out to recognition and background removal. This fixes BOTH the display washout AND the color-naming error at their shared root. It is a color-managed conversion (renders pixels through a real transform, preserves appearance), **NOT a blind re-tag** — a blind re-tag would dull colors and is explicitly RULED OUT.

**GRACE'S HARD CONSTRAINT:** the fix must NOT regress background removal, the whites, or the colored clothes — all three are non-negotiable. If an approach can't protect all three, it does not ship.

**Risk read on the chosen direction:** BR edges/shape — none expected (mask is shape/luminance-driven). Whites — very low (neutral is the same point in P3 and sRGB). Colored clothes — low but THE ONE TO WATCH (a managed conversion preserves in-gamut colors; only a blind re-tag would dull them). Color-naming — fixed as a bonus (shared `fixed.uri`).

**Confirmation method:** Xcode "Download Container" was considered but **Grace does NOT have Xcode installed — Xcode route ABANDONED.** Instead, fold a TEMPORARY logging step into the fix build to confirm the profile on the real files (read the base64 header for the ICC marker + sample a pixel), then remove it.

**BUILD PLAN (Grace's decision — 15 builds available this month, builds not scarce):**
- **Build 1** = capture-stage fix + TEMPORARY logging → test on phone + read the profile notes.
- **Build 2** = remove logging + bundle ONE small, pre-agreed, low-risk fix (candidate: the closet blank-images Option A fix, spec banked Session 24) → ship clean.
- Respect "one thing at a time / don't pile fixes" — the bundled extra must be small and pre-agreed.

**VERSION RULE reminder:** app-code change → bump `1.0.5` → `1.0.6` in BOTH `app.config.js` AND `package.json` before any EAS build.

**ON-DEVICE REGRESSION CHECKLIST (run next session before trusting any build):**
1. BR edges/shape clean on white / dark / patterned garments.
2. Whites still white via BOTH paths.
3. Colored garments still vivid AND now MATCH the library import of the same piece.
4. Oatmeal via in-app camera in daylight AND warm light now correct.
5. Recognizer names oatmeal correctly (→ "Oatmeal", not "Stone Grey"/"Powder Blue").
6. Library path renders byte-identically (unchanged — regression guard).
7. Same garment camera-vs-library now visually match (the definitive proof).
8. Nothing else moved (no Edge Function / SYSTEM_PROMPT, cache 2,510, version bumped before build).

**UNVERIFIED / NEXT SESSION:** fresh session — design the color-managed P3→sRGB capture conversion, build WITH temporary logging, confirm the profile on real files, then run the full regression checklist above. NOT CHECKED items to resolve at build time: exact profile-loss link; untagged vs mistagged-sRGB.

**Notes / git state:** READ-ONLY diagnostic — zero code, zero builds, zero deploys. testing HEAD `5a8c046` unchanged except this entry + a lean CLAUDE.md pointer. main untouched; production untouched; nothing pushed.

---

## Update 4 — Session 24 — 2026-07-29 — CLOSET BLANK-IMAGES DIAGNOSIS (spec banked, fix deferred to Aug 1) + 1e COLD-WEATHER WARMTH INTERIM (deployed Version 63, verified). No app-code shipped; one Edge Function deploy.

**Branch:** testing. main `062d15b` UNTOUCHED / production `0baff39` UNTOUCHED. HEAD on testing throughout. Nothing pushed.
**Commits (this session, testing, named-file only — no `git add -A`):** (1) `bc80ca5` — Option A closet-fix spec doc; (2) `b0a6621` — `index.ts` 1e warmth filter; (3) this SESSION_NOTES.md entry; (4) a lean CLAUDE.md update. All "This commits to testing, not main."
**Edge Function deploys:** 1 — `generate-outfits` via CLI `--use-api` → now **Version 63, ACTIVE**. **Cache token count:** 2,510 (SYSTEM_PROMPT untouched). **EAS builds:** 0.

**Goal:** (1) diagnose the closet blank-images-after-long-background bug read-only and bank the fix; (2) ship the cold-weather rain-shell interim without touching the prompt cache.

**What changed:**
- **CLOSET BLANK-IMAGES BUG — diagnosed, fix BANKED, deferred.** Root cause (VERIFIED): closet images are private Supabase Storage **signed URLs with a 1-hour TTL** (`wardrobeItems.js:8`), minted **once** on MainAppScreen mount (`loadItems`, `App.js:7789`/`7799`/`7806`) and **never regenerated on foreground return**. RN keeps the screen mounted while backgrounded, so after >1h the metadata renders but every `photoUri` is expired → blank images; force-quit remounts and re-mints → fixed. Auth-token hypothesis REJECTED (signed URLs are standalone; the AppState listener at `App.js:8356` only refreshes auth). **Fix = Option A** (gated foreground re-mint: on AppState `active`, if >45 min since last mint, re-mint signed URLs by mapping over items already in state via the safe functional-map setter — avoids the `loadItems` hard-replace race by both timing and mechanism). Fully spec'd + banked to **`Clozie_ClosetImage_SignedURL_Fix_OptionA_Spec_2026-07-29.md`** (commit `bc80ca5`). **DEFERRED to Aug 1** — it's an App.js native change, un-testable until the EAS quota resets. Two open flags to confirm AT BUILD TIME: (a) whether re-mint causes a visible image **re-download/flicker** depends on the closet grid's `<Image>` component + its cache behavior (`App.js:2138`); (b) Your Looks saved-outfit cards hold their **own** item-URL copies and are **not** covered by this fix (out of scope; refresh on next Generate).
- **VERSION CORRECTION:** older notes said the live `generate-outfits` edge version was 61. `supabase functions list` showed it was actually **62 pre-deploy** (notes were one version stale). Tonight's deploy incremented it cleanly to **Version 63, STATUS ACTIVE**.
- **1e COLD-WEATHER WARMTH INTERIM — DEPLOYED + VERIFIED.** Added const `RAIN_OUTERWEAR = /\brain[ -]?jacket|\brain[ -]?coat|\banorak|\bwindbreaker/i` near `index.ts:34` and a new filter block in `applySafetyFilters` right after the C4 Snowy block. Trigger: `!indoors && (condition === 'Snowy' || (temperature === 'Cold' && condition !== 'Rainy'))`. Pinned-exempt (single-pin `pinnedItemId`, same guard as every other filter); Outerwear-only category guard; house-style drop-count `console.log`. Leading word-boundaries only (no trailing `\b`) so plurals ("rain jackets", "anoraks", "windbreakers") still match. **SYSTEM_PROMPT untouched → cache stays 2,510.** Syntax verified via the installed TypeScript in transpile-only mode (throwaway scratchpad script, no toolchain install); all identifiers confirmed in scope. Deployed via CLI `--use-api` → Version 63.

**Tests / verification (on-device + Supabase Logs):**
- **Cold + Snowy** → log `Cold/Snowy rain-outerwear filter dropped 1 rain-shell items`; no rain jacket in the generated outfits. ✅
- **Cold + Rainy** → NO rain-outerwear drop line (carve-out held); the stone anorak correctly reappeared. ✅
- Cache round-trip: `cache_creation 2510` then `cache_read 2510`. ✅ 3 outfits each run, source sonnet.

**UNVERIFIED / OPEN / NEXT SESSION:**
- **Light non-warm outerwear (denim jacket, leather jacket) and light/short-sleeve TOPS still appear in Cold/Snowy — NOT covered by this rain-only interim** (confirmed via logs: only the rain filter touched outerwear; the warmth-column C1 Cold filter is dormant because `warmth` is NULL on all items). The interim removes the *wrong* outerwear; it does **not** guarantee the rest of the outfit is warm.
- **Real fix = the warmth-data layer (path b):** tag each item light/mid/warm, then require warm-enough outerwear AND tops in Cold/Snowy. This is the next spec. **Do NOT solve it with an ever-growing name blocklist.**
- Closet Option A fix awaits Aug 1 EAS quota + its two build-time flags above.

**Notes / git state:** testing holds spec commit `bc80ca5` + warmth commit `b0a6621` (+ this entry + a CLAUDE.md update). main untouched; production untouched; **nothing pushed.** Numbering: this is Session 24 — SESSION_NOTES skips 23 because Session 23 (Issue D, 2026-07-27) was recorded in CLAUDE.md only.

## Update 4 — Session 22 — 2026-07-21 — BUILD 29 APP STORE RELEASE + GIT BOOKKEEPING. Build 29 / v1.0.5 RELEASED; production INTENTIONALLY fast-forwarded f711c5d → 0baff39. main UNTOUCHED. Zero deploys, zero app-code, zero EAS builds — release + docs only.

**Branch:** testing `8bf90d5` → `6708c79` (two CLAUDE.md doc commits) / **production `f711c5d` → `0baff39` (INTENTIONAL fast-forward — this is a release, the one session that deliberately moves production)** / main `062d15b` UNTOUCHED (never checked out, never moved). HEAD stayed on testing throughout.
**Commits:** 3 total, all named-file, all "This commits to testing, not main." — (1) `868d320` CLAUDE.md CURRENT BUILD STATE → Build 29 live / Build 25 demoted in place / v1.0.5 train CLOSED; (2) `6708c79` CLAUDE.md standing fact SDK 54 → 57; (3) this SESSION_NOTES.md entry. Plus git refs: annotated tag `v1.0.5-build29-appstore-live` (tag-object `e2b79f2`) on commit `0baff39`, and production ff `f711c5d` → `0baff39`.
**Edge Function deploys:** 0. **Cache token count:** 2,510 (untouched — nothing deployed). **EAS builds:** 0 (0 remain this month; none needed — Build 29 was already built + Apple-approved).

**Goal:** press Release on the already-Apple-approved Build 29, then do the release git bookkeeping (appstore-live tag + production fast-forward) exactly per the Build 25 precedent, after independently re-verifying the fast-forward target that Session 21 flagged as unverified.

**What changed:**
- **Build 29 / v1.0.5 RELEASED to the App Store 2026-07-21 (US, 1 region).** Grace pressed Release in App Store Connect; sidebar status went **Pending Developer Release → Ready for Distribution**, rollout in progress. Build 25 / v1.0.4 is the prior live build.
- **Verified Build 29 source commit = `0baff39`.** Session 21 had flagged `0baff39` as NOT independently verified. Closed it SIX ways: (in-repo, all VERIFIED) real commit; contains phase15D `AutoWhiteBalance.swift` (app-code `5b51910` is its ancestor; fringeBlendLo 0.85 / fringeBlendHi 0.90, sC chroma, CIColorMatrix/CIExposureAdjust, alpha-gated blend all present); version `1.0.5` in BOTH app.config.js:7 + package.json:3; `f711c5d` is a true ANCESTOR (ff, nothing lost); reachable on testing (ancestor of HEAD). PLUS the **EAS server-side record** (`eas build:view 67b0bb56-…`): Version 1.0.5 / Build number 29 / Commit `0baff3924ec25bc28f827615d6a96d7332f147da` — the binary-to-commit link is cryptographically confirmed, not inferred from notes.
- **Annotated tag `v1.0.5-build29-appstore-live`** (tag-object `e2b79f2`) created on `0baff39`, Build 25-style annotation. **production fast-forwarded `f711c5d` → `0baff39`** — 41 commits, ff-only via `git push . 0baff39:production`, no `--force`, nothing discarded. Tag + production both pushed to origin (local `production` = `origin/production` = `0baff39`, VERIFIED).
- **Docs:** `868d320` (CURRENT BUILD STATE → Build 29 live, Build 25 demoted in place with no text deleted, v1.0.5 train CLOSED → next app CODE change bumps BOTH app.config.js + package.json to 1.0.6; both read 1.0.5 on disk, no bump yet) and `6708c79` (standing fact SDK 54 → 57, VERIFIED from package.json `expo ^57.0.0` + node_modules 57.0.4 / RN 0.86.0 — **npm audit fix ban KEPT IN FORCE and explicitly marked NOT re-validated against SDK 57: untested is not cleared**).

**Tests / verification:**
- production local = origin = `0baff39` (VERIFIED via `git ls-remote`). Tag on origin, tag-object `e2b79f2` (VERIFIED).
- **Build 25 restore point `v1.0.4-build25-appstore-live` @ `f711c5d` (tag-object `d219721`) VERIFIED INTACT after the production move.** Build 29 descriptive restore tag `v1.0.5-build29-awb-whitefix` @ `0baff39` also intact.
- main STILL `062d15b`, HEAD on testing STILL advanced only by the two doc commits, testing 0/0 with origin (all VERIFIED).

**SDK lineage (for the record, per Grace's own history check):** Build 15 / v1.0.2 was the last App Store-RELEASED build on SDK 54; Build 18 was the first EAS build on SDK 57; Build 19 became the TestFlight-verified SDK 57 baseline; everything from Build 18 onward — including Builds 25 and 29 — is SDK 57, so **production is now SDK 57**. **CAVEAT:** Builds 16/17 failed and never shipped — which SDK they were on is NOT VERIFIED, left unstated.

**UNVERIFIED / not done / still open:** ZERO Edge Function / SYSTEM_PROMPT / app-code / EAS-build changes this session. Deliberately NOT touched (future docs pass): CLAUDE.md flag #2 (`Latest TestFlight standalone (Update 0): Build 12` — stale) and flag #3 (main "107 commits behind testing" count — stale, NOT CHECKED). Build 29 field findings 2 (oatmeal / pale-warm over-whiten — AWB tuning) and 3 (busy-carpet cutout — Vision segmentation, out of AWB scope) remain in the backlog, UNFIXED. Whether `npm audit fix` is safe on SDK 57 — untested, ban stays.

**Notes / state:** This is the release session — the ONE session that intentionally moves production, exactly as CURRENT BUILD STATE's build convention prescribes. main `062d15b` untouched; production now `0baff39` (Build 29 / v1.0.5 LIVE); cache 2,510; EAS quota 0 remaining this month.

## Update 4 — Session 21 — 2026-07-21 — OUTFIT-GENERATION DIAGNOSTIC (READ-ONLY: zero deploys, zero app-code, zero commits except this entry). Diagnosed 6 issues (A–F) from Grace's Build-29 July-20 field testing against the live index.ts. NOTHING fixed — sized fix proposals only. Build 29 still awaiting Apple review; production stays f711c5d.

**Branch:** testing (HEAD `7164328`, clean, 0/0 with origin) / main `062d15b` / production `f711c5d` — main + production UNTOUCHED. Live App Store build unchanged: Build 25 / v1.0.4.
**Commits (this session, testing, named-file only):** 1 — SESSION_NOTES.md only (this entry). Zero app code, zero Edge Function, zero SYSTEM_PROMPT.
**Edge Function deploys:** 0. **Cache token count:** 2,510 (untouched — nothing deployed). **EAS builds:** 0.
**Live edge source diagnosed:** `supabase/functions/generate-outfits/index.ts`, last commit `7f238d5` ("Deploy 4"), deployed **Version 61** 2026-07-13.

**Goal:** diagnose (not fix) 6 generation problems from Grace's on-device Build-29 evidence. Per issue: what the code ACTUALLY does (file+line), root cause, smallest correct fix, size, risk, cache impact. Four issues carried Grace decisions — verified each against code.

**Headline doc-vs-code reconciliation:** `DEPLOY4_HANDOFF.md` says the Nope fix is "to be built." **The code proves it was built AND deployed** (Version 61, 2026-07-13, iPhone+Logs verified). So the Nope mechanism has been LIVE the whole time — Grace's July-20 evidence is a verdict against the deployed fix, not a missing feature. Code wins.

**FINDINGS (all VERIFIED file+line unless flagged):**

- **A + B — Nope doesn't stick (ONE combined fix).** Suppression path is live: occasion-scoped nope query `index.ts:1561-1576`, AVOID block `index.ts:684-696`, wired `index.ts:1784`. Occasion IS recorded on a fresh nope (INSERT path, `outfitHistory.js:34-35`), so the combo DOES reach the AVOID block. Second same-session signal = JUST SHOWN block `index.ts:661-663` (client sends `currentOutfits`, `App.js:8041-8044`). **Root cause: both are advisory TEXT nudges in the user message — nothing HARD-removes a rejected combination; Sonnet at temp 0.75 overrules them.** Secondary same-session contributor: `handleRate` is fire-and-forget (`App.js:3533`, no await) so a near-instant nope→regenerate can miss the write — but repeats across multiple regenerates prove advisory-weakness is dominant. **Issue B (verify-only, NO hard filter — code agrees with Grace's decision):** no JS dress+bottoms hard filter exists (read all of `applySafetyFilters` 1141-1434); structural checks (1801-1862) only enforce ≥1 Top/Dress, dedupe multiple Bottoms, trim >6 — dress+one-legging and tee-over-dress both pass untouched. DRESS RULE nudge (`index.ts:711`, USER MESSAGE not SYSTEM_PROMPT) covers BOTH bottoms-under and tops-over-dress; not broken, just soft. Whether leggings classify as Bottoms = data question, NOT CHECKED (needs the item's category). **Fix (A+B): hard, server-side, combination-level suppression** — after validate/structural checks, swap any outfit reproducing a disliked pairing via `buildSmartFallback` (same pattern as the structural missing-Top/Dress fix 1813-1825); keep the advisory block too. Occasion-scoped, windowed, never per-item, never permanent. **Size MEDIUM, risk LOW-MED, cache 2,510 (user-message + JS only).** Reuse with the future 4a Nope-chip: ~70-80% (same DB plumbing; 4a adds a reason column + reason-scoping). Addresses same-session AND cross-session.

- **C — Brief adherence + sneaker mapping.** Color half already resolved: Session-6 soft color lift is live (`colorFamilyForText` at `index.ts:523-524` + `1778`) — "white ignored" is NOT the live state. **Sneaker mapping bug:** description = Sonnet free prose; displayed items = Sonnet `items[]` mapped by names (`index.ts:893-906`) — two independent channels that can disagree. name→id map (`index.ts:858-870`): pass-1 registers BARE name → FIRST twin in DB order; `disambiguateNames` (482-512) only suffixes when two items share the same trimmed base name. **C(1) fix candidate: for collided base names, drop the bare-name fallback** so an un-suffixed echo rebuilds via fallback instead of silently showing the wrong-colour twin. Size SMALL, risk LOW-MED, cache 2,510. **Rule 14** (`index.ts:218`, SYSTEM_PROMPT prose) is SEPARATE from the JS lift and documented-dormant — inert prompt weight, not the color fix. **5a/5b reconcile (no fix, statement only):** 5a (COLOR_FAMILIES + colorFamilyForText) BUILT + CALLED; 5b soft version SHIPPED (single-Brief-color → pool re-sort). Still missing: `colorFamiliesForCategoryWord` DEFINED but ZERO call sites (grep-confirmed `index.ts:158`) → category phrases ("warm tones", "white top") unhandled; multi-color Briefs are first-color-wins; signal is soft (never validated). "5b going forward" = category phrases + a hard JS color check.

- **C CAVEAT — NEW evidence (Grace's Shoes screenshot, 2026-07-21):** Grace's two sneakers have DISTINCT names — **"Mesh Athletic Sneakers"** (colour **"Onyx Black & White"**) and **"Leather Low-Top Sneakers"** (colour **"Cream"**). They do NOT share a trimmed base name, so **the C(1) bare-name collision fix would NOT fire on them** and likely does NOT explain the observed "white sneakers' energy" over a black-sneaker card. More likely cause: the black pair's colour literally contains "White" ("Onyx Black & White") and "Cream" maps to the white family — so the color-lift / Sonnet prose can legitimately attach "white" to a black-and-white shoe. **This is a colour-NAMING issue, not a mapper collision.** ACTION for the future C fix session: BEFORE building C(1), re-verify against Grace's actual `outfit_history` record (which sneaker was in that outfit + the raw AI text). The real fix may be colour-naming / C(5b)-adjacent, not the collision fix.

- **D — New-item bias (Grace decided REMOVE; code supports it, low-risk).** Bias INSTRUCTION lives in the cached SYSTEM_PROMPT in TWO places: Rule 12 (`index.ts:216`) + anchor-priority-5 (`index.ts:319-320`). The `*` MARK is generated in the USER MESSAGE (`buildCompressedPool` `index.ts:533`/`558`, via `isToday` `index.ts:452`). **Smallest removal = ZERO cache:** delete the `todayMark` generation (533/558) → no item ever gets a `*` → Rule 12 + anchor-5 go dormant, cache stays 2,510, no byte audit. Optionally stripping the two prompt lines later = **SYSTEM_PROMPT touch = cache reset** (new token count + byte audit) — defer into a batched edit. Dependencies (grep-clean): `isToday` used only at 533; `createdAt` also drives the newest-first pool sort (527-528) which STAYS; no filter/log/downstream reads "added today". Size SMALL, risk LOW. **Opinion: AGREE with removal** — `isToday` fires for ANY item created today, so a bulk/backlog re-photography (Grace's July-20 AWB re-shoot) trips it en masse; the code cannot tell "bought for tonight" from "finally photographed my closet." Pinning is the deliberate replacement. Not load-bearing.

- **E — Cold-side warmth (diagnostic, both paths sized).** C4 Snowy (`index.ts:1256-1277`) drops suede/espadrille/sandals/open-toe/flip-flop/heels/pumps/stiletto — does NOT exclude rain anoraks. `HEAVY_OUTERWEAR` regex (`index.ts:34`) has windbreaker/rain-jacket but NOT "anorak"; heavy outerwear is only filtered on Hot/Warm/Indoor (correctly never Cold/Snowy). So a rain anorak gets no warmth tag (`index.ts:555`) and no name rule excludes it from Snowy/Cold → it can appear for "cold and snowy." **Bug confirmed.** Deploy-1 fixed only Hot (non-layering all-outerwear drop 1215-1231, name/category based). Warmth column NULL rests on in-code comments + CLAUDE.md, NOT a direct DB read. **Path (a) interim name filter** (`/anorak|rain jacket|rain coat|windbreaker/i`, Outerwear, Snowy/Cold, pinned-exempt): SMALL, LOW, cache 2,510. **Path (b) populate warmth column** (read path already at `index.ts:548`; needs data backfill + Add/Edit UI and/or recognition; wakes C1/C2/C5 with zero edge change): LARGE, MED. **Outerwear list for Grace: could NOT be pulled this session** (RLS; only anon key present, no JWT) — get it from Supabase dashboard (`wardrobe_items`, `category = Outerwear`, cols name/colour/id) or a JWT-authenticated session; light-vs-heavy categorization is Grace's styling call.

- **F — Style Learning Layer 1: DEPLOYED, STILL LIVE.** Ratings query `index.ts:1668-1673`, 5+ gate `1680`, vibe-lean `1683-1697`, star items `1704-1720`, STYLE NOTES block `1750-1768` injected into user message `713`. Introduced `17f75dd`, deployed Session 8 (2026-06-27), iPhone+Logs verified. No later commit removed/altered it. Confirms the foundation for color-learning Layers 2+3 (5c) is in place.

**RECOMMENDED DEPLOY ORDER (future sessions — nothing this session):** 1) D (remove `*` marker, zero-cache) → 2) E(a) (interim rain/anorak name filter) → 3) C(1) (sneaker fix — BUT see C CAVEAT: re-verify first, may be colour-naming instead) → 4) A+B (hard combination-level Nope suppression; land last, shares the `mapped[]` region). Separate later work: E(b) (populate warmth column, LARGE) and C(5b) (category phrases / hard color check). **Every proposed fix stays cache 2,510** — the ONLY cache-resetting option anywhere is the OPTIONAL tidy-up of Issue D's two dormant prompt lines (SYSTEM_PROMPT touch), recommended deferred into a batched edit.

**Two honesty flags:** (1) RLS-protected `wardrobe_items` rows could NOT be read this session (only the anon key is present locally; her rows need her JWT/service-role) — so the Issue C twin diagnosis and the Issue E outerwear list both need her DB rows (Supabase dashboard or JWT session). (2) "warmth column is NULL on all items" rests on in-code comments + CLAUDE.md, NOT a direct DB read.

**Build 29 release deferred:** Build 29 App Store release + git bookkeeping (create `v1.0.5-build29-appstore-live` on `0baff39` + fast-forward production `f711c5d → 0baff39`) is deferred to its own session. Production intentionally stays `f711c5d` this session.

**HEAD at session start:** `7164328` (Session 20 close).

---

## Update 4 — Session 20 — 2026-07-20 — DOCUMENTATION CATCH-UP (no app code, no builds). CLAUDE.md refreshed to Build-29-submitted state, 2 Build-29 findings logged to backlog, build/upload guide added to repo. Continues same session as the Build-29 restore tag.

**Branch:** testing → 3 doc commits this session / main `062d15b` / production `f711c5d` — main + production UNTOUCHED. Live App Store build unchanged: Build 25 / v1.0.4.
**Commits (this session, all testing, named-file only):**
- `10fcb32` — CLAUDE.md CURRENT BUILD STATE refresh: Last verified → 2026-07-20; new lean "Last updated" snapshot (Build 29 v1.0.5 submitted to Apple, awaiting review; restore tag; AWB in app code; pending release bookkeeping); old Build-28 block archived in place (no text deleted).
- `fc9a1cb` — `Clozie_Known_Issues_Backlog.md`: 2 Build-29 on-device findings logged under Background Removal (Finding 2 oatmeal/pale-warm over-whiten = AWB tuning; Finding 3 busy-carpet cutout = Vision segmentation, out of AWB scope). Fixes the docs gap where Session 19 *claimed* these were logged but they were never actually in the backlog file.
- `5146bf0` — new file `Clozie_Build_And_Upload_Guide.md` (60 lines) at repo root: current build/upload flow (Claude Code builds; download IPA to Desktop; Transporter as Clozie LLC T9PZ9RW7F5; never `eas submit`; pre-flight code + config checks). Closes the Session-19 gap where this guide was absent from the repo and Transporter steps had to be reconstructed.
**Tag (created earlier this session, already pushed):** `v1.0.5-build29-awb-whitefix` → commit `0baff39` (Build 29's EAS-confirmed source; tag-object `5314ce9`). Descriptive restore point only — NOT `-appstore-live`, no production move.
**Edge Function deploys:** 0. **Cache token count:** 2,510 (untouched). **EAS builds:** 0 (none this session; 0 remain this month).

**Goal:** bring the docs current with reality — CLAUDE.md was 2 builds + a submission stale (frontier still read "Build 28 EDGE FAIL"), 2 Build-29 findings were unlogged, and the build/upload guide was missing from the repo.

**What happened:**
- Build 29 (v1.0.5) was **submitted to Apple 2026-07-20 ~3:50 PM PT** and is **AWAITING REVIEW** — NOT approved, NOT released. Build 25 / v1.0.4 stays LIVE.
- State re-verified live from disk before every edit (branch/HEAD/main/production, tags, commit `5b51910` = AutoWhiteBalance.swift only). Every doc claim VERIFIED against git or marked as sourced from prior session notes / Grace.
- Build 29 TestFlight field-testing reconfirmed the oatmeal / pale-warm over-whitening (Finding 2, backlog `fc9a1cb`); fixes are queued for Session 21 (starter already prepared).

**Tests:** N/A — documentation only, no runnable surface. Read-back + git diff verified on each of the 3 commits; guide verified byte-exact valid UTF-8 (60 lines, em-dashes/arrows intact, no smart-quote corruption).

**UNVERIFIED / not done:** no promotion to production; Build 29 stays TestFlight-only awaiting Apple review. Findings 2 & 3 logged only, not fixed. Pending release bookkeeping (create `v1.0.5-build29-appstore-live` on `0baff39` + fast-forward `production` `f711c5d` → `0baff39`) waits until Apple approves and Grace presses Release.

**Notes / state:** testing advanced by 3 doc commits (`10fcb32` → `fc9a1cb` → `5146bf0`); main `062d15b` / production `f711c5d` UNTOUCHED; tag `v1.0.4-build25-appstore-live` → `f711c5d` intact; cache 2,510; zero Edge Function / SYSTEM_PROMPT / Supabase changes; zero app-code changes; zero EAS builds.

---

## Update 4 — Session 19 — 2026-07-19 — Build 29 CHUNK 2 of 2 — EAS build (LAST of the month) → Transporter delivered → on-phone verdict: MUCH better, not perfect. Session-16 gate-calibration PASS. phase15D iOS compile risk RESOLVED (Mac, ONE EAS build spent, repo write = this entry only)

**Branch:** testing `0baff39` (pre-entry HEAD, unchanged from Chunk 1) → SESSION_NOTES.md commit at close / main `062d15b` / production `f711c5d` — main + production UNTOUCHED. Live App Store build unchanged: Build 25 / v1.0.4. Only repo change this session is THIS SESSION_NOTES.md commit.
**Commits:** SESSION_NOTES.md ONLY (this entry) — "This commits to testing, not main." Zero app-code commits (all code landed in Chunk 1 `5b51910`).
**Edge Function deploys:** 0. **Cache token count:** 2,510 (untouched). **EAS builds:** 1 (Build 29) — the LAST of the month, **0 now remain** (quota resets ~2 weeks).

**Goal:** the first real iOS compile of the Chunk-1 phase15D port, then TestFlight delivery + Grace's on-device gate-calibration verdict — the one thing the Mac scoreboard could never answer.

**What happened:**
- **State re-verified from disk first (all VERIFIED):** branch/HEAD/main/production safe, tree clean of tracked changes. Version `1.0.5` in BOTH app.config.js:7 + package.json:3 → v1.0.5 train OPEN (Builds 26/27/28 TestFlight-only, never released; Build 25 / v1.0.4 LIVE) → NO bump. `AutoWhiteBalance.swift` read in full — fringeBlendLo 0.85 / fringeBlendHi 0.90 hardcoded, phase15D pipeline + both fail-safe guards intact, `corrected()` signature unchanged. `autoWhiteBalance: true` App.js:62 intact. Prototype enum md5 `26376fc8…` re-proven read-only over lines 21–241 (`sed`/`awk`/keepends convention — a no-trailing-newline variant differs, file genuinely unchanged). Backup `session19-prebackup` md5 `542e4918…` intact.
- **Pre-build triple check PASSED:** git clean + pinned; version rule satisfied (Build 29 via EAS remote autoIncrement, `eas.json appVersionSource: remote`); `eas whoami` = `clozie` / hello@clozie.net BEFORE the build so auth couldn't waste it; profile `preview` (matches Builds 25–28).
- **Build 29 / v1.0.5 EAS iOS preview build SUCCEEDED FIRST TRY (exit 0).** buildNumber auto-incremented 28→29; credentials ready (com.clozie.app, Apple Team T9PZ9RW7F5 Clozie LLC); "✔ Build finished". Build page `67b0bb56-d200-4566-b8c1-067fbc4c9bf3`. **This is the first real iOS compile of phase15D — the Chunk-1 honest risk (macOS typecheck ≠ iOS build) is RESOLVED.** As predicted, the two "new" calls carried no compile-time surface (log2f = libm; CIColorMatrix/CIExposureAdjust = string-resolved runtime filters).
- **Transporter DELIVERED 2026-07-19 7:47 PM — 1.0.5 (29)**, signed in as **Clozie LLC**, NEVER `eas submit`. TestFlight-only; nothing promoted; Build 25 / v1.0.4 stays LIVE.
- **CORRECTION ON THE RECORD:** during the session I suggested signing into Transporter as insuredbyjacek@msn.com — **that was WRONG**; the correct identity is **Clozie LLC** per `Clozie_Build_And_Upload_Guide.md`. That guide is **NOT in the repo** (confirmed absent this session) — Transporter steps were reconstructed from scratch; the guide should be added to the repo in a future session.

**GRACE'S ON-PHONE VERDICT (verbatim):** "So it is so much better, but it's not perfectly fine. So whites are whites. That's good. I can see the pretty good shape. If I put white T shirt and a busy carpet in a dim light with shades, it's not completely white. Colors are good. But if I put, like, colorful T shirt and a colorful carpet, sometimes does not cut out well. I mean, most of the time does not cut out well. And if I put the oatmeal sweater in a bright light, comes out almost white." On the halo: "The hollow is very minimal, almost not visible, it's fine."

**SESSION-16 GATE-CALIBRATION ANSWER — PASS:** edgeLumaLoss ≤0.10 matches real iPhone appearance at card size; the fringe halo is near-invisible on-device exactly as predicted. The Session-16 open question is answered YES.

**Findings sorted:**
1. **Dim-warm whites not fully white** (white tee, busy carpet, dim light/shades) — the KNOWN Session-16 open limitation, now confirmed on-device. Expected, not a regression. Whites in normal light DO read white; shape is good.
2. **NEW — oatmeal / low-chroma warm garments in bright light over-whiten** ("oatmeal sweater in bright light comes out almost white"). Cause: garment-level `sC` chroma protection reads a pale warm as near-neutral → full correction → whitening. Inherent trade of the sC design (the same mechanism that lets warm whites go white). Candidate follow-up: raise the sC protection floor for pale-warm garments, or gate brightGain by absolute luma. Logged to KNOWN ISSUES backlog.
3. **Colorful garment on busy colorful carpet fails cutout** ("most of the time does not cut out well"). This is **Vision segmentation / background-removal**, NOT AWB — OUT OF SCOPE for this workstream. Logged to KNOWN ISSUES backlog for the segmentation/cutout track.

**Net ruling:** phase15D is a clear improvement over Build 28 (whites white, shape preserved, halo gone, colors good) — but "better, not perfect." SHAPE OUTRANKS COLOR still holds; the residual color misses (dim-warm, pale-warm-bright) are AWB tuning, and the busy-carpet miss is a separate cutout problem.

**UNVERIFIED / not done:** no promotion to production; Build 29 stays TestFlight-only. Findings 2 & 3 not yet fixed — logged only. No further EAS build this month (0 remain).

**Notes / state:** testing HEAD `0baff39` pre-entry; main `062d15b` / production `f711c5d` UNTOUCHED; backup `AutoWhiteBalance.swift.session19-prebackup` intact; prototype read-only, untouched (enum md5 `26376fc8…`); cache 2,510; zero Edge Function / SYSTEM_PROMPT / Supabase changes.

---

## Update 4 — Session 19 — 2026-07-19 — Build 29 CHUNK 1 of 2 — port phase15D (Fork b winner) into the app: AutoWhiteBalance.swift rewritten to the validated C+D pipeline, committed + pushed (Mac, ZERO EAS builds, build deferred to Chunk 2)

**Branch:** testing `4bf5f5d` → `5b51910` (pushed to origin/testing, 0/0 ahead/behind) / main `062d15b` / production `f711c5d` — main + production UNTOUCHED. Live App Store build unchanged: Build 25 / v1.0.4.
**Commits:** ONE app-code commit `5b51910` — `modules/expo-background-removal/ios/AutoWhiteBalance.swift` ONLY (+64/−4). Named-file commit, "This commits to testing, not main." (This SESSION_NOTES.md entry is a second commit at close.)
**Edge Function deploys:** 0. **Cache token count:** 2,510 (untouched). **EAS builds:** 0 (1 still remains this month — spent in Chunk 2).
**Session split:** Chunk 1 = state-verify → port plan → edit → commit → push. STOPPED before the pre-build triple-check and any `eas build` — those run in a fresh Chunk-2 conversation that re-verifies all state from disk first.

**Goal:** replace Build-28's Approach-A per-pixel apply (which destroyed garment edges on-device) with the Session-18 Fork-b winner (phase15D): garment-level `sC` chroma protection + spatially-uniform CIColorMatrix/CIExposureAdjust + trailing alpha-gated fringe blend. No App.js/module change, no env dials.

**What changed (app code, one file):**
- **State verified first (all VERIFIED):** branch/HEAD/main/production safe, tree clean. Version `1.0.5` in BOTH app.config.js:7 + package.json:3 → v1.0.5 train OPEN (Builds 26/27/28 TestFlight-only, never released) → NO bump for Build 29. Build number = EAS remote autoIncrement (eas.json `appVersionSource: remote`). Prototype enum md5 `26376fc8…` re-proven over lines 21–241 (byte-identical; phase15C/D live in the harness extension 247–575, below the hashed core).
- **KEY finding:** the shipping enum core (`AutoWhiteBalance.swift` 35–255) was ALREADY byte-for-byte identical to the Mac-validated referee shared enum (`awb_phase16_referee.swift` 21–241) — all 18 estimate constants + `estimateIlluminant` + `applyCorrectionRGBA` + helpers present & correct. So the port touched ONLY `corrected()` + 2 new constants.
- **Edit 1:** added `fringeBlendLo = 0.85` / `fringeBlendHi = 0.90` (hardcoded, no env dials; `fringeBlendHi == alphaEstMin 0.9` by design = body cutoff).
- **Edit 2:** rewrote `corrected()`'s apply tail — removed `applyCorrectionRGBA(..., correct: true)` (the edge-destroyer), added phase15D verbatim: `refLin` render → `sC = 1 − smoothstep(protLo, protHi, meanBodyChroma)` → WB+brightGain attenuated by `sC` → uniform `CIColorMatrix` (diagonal WB, alpha row preserved) + `CIExposureAdjust` (EV = log2 g) → `blended = refLin + s·(ciLin − refLin)`, `s = smoothstep(0.85, 0.90, α)`, alpha passthrough → `applyCorrectionRGBA(idEst, correct:false)` → `bufferToCIImage`. Signature unchanged → no module edit. Two new fail-safe `guard`s (refLin + ciLin/size-match → nil → module keeps uncorrected foreground).
- **Integration confirmed read-only:** `BackgroundRemovalModule.swift:232` passes the premultiplied Vision-masked `foreground` (line 219, `croppedToInstancesExtent: true`) into `AutoWhiteBalance.corrected(...)` and nil-coalesces on failure — exactly what phase15D expects. `autoWhiteBalance: true` in App.js CUTOUT_OPTIONS (App.js:62) unchanged.

**Tests (Mac, static checks only — NO build):**
- **Numeric parity vs referee phase15D VERIFIED byte-identical:** sC chroma loop + gain attenuation (17/17 statements MATCH), CIColorMatrix/CIExposureAdjust (code identical; one inline comment not carried), alpha-gated blend loop (MATCH), final linToSrgb (identical bar the local buffer name). Only intended deltas: aLo/aHi → hardcoded constants; inline estimate (drops harness probes, same numbers); local names.
- **`swiftc -parse` AND `swiftc -typecheck` both exit 0** on this Mac (macOS SDK, arm64; NO artifacts written) — full CoreImage API surface resolves (CIColorMatrix params, CIVector, log2f, applyingFilter, Estimate init).

**UNVERIFIED / not done:** NOT iOS-compiled — macOS typecheck ≠ EAS iOS build; first real compile is Build 29 (Chunk 2). No pre-build triple-check, no `eas build`, no Transporter upload. On-phone verdict still OPEN — the port reproduces the config the Mac scoreboard passed; the Session-16 gate-calibration question (does edgeLumaLoss ≤0.10 match real iPhone appearance at card size? is the fringe halo invisible?) can ONLY be answered on-device next session.

**Notes / state:** backup `AutoWhiteBalance.swift.session19-prebackup` written (byte-identical, md5 `542e4918…`), untracked/local, never committed — instant revert door. Prototype read-only, untouched (enum md5 `26376fc8…` unchanged). Zero EAS builds (1 remains); main `062d15b` / production `f711c5d` UNTOUCHED; Build 25 / v1.0.4 LIVE; Build 28 stays TestFlight-only, NOT promoted; zero Edge Function/SYSTEM_PROMPT/Supabase changes; cache 2,510.

---

## Update 4 — Session 18 — 2026-07-19 — Phase 1.6 Fork (b) — alpha-gated fringe protection (phase15D) built in referee + measured: PASSES acceptance at aLo 0.85 / default cap — the previously-impossible pair (Mac, ZERO builds, repo untouched)

**Branch:** testing `09f0ac6` → docs commit at close / main `062d15b` / production `f711c5d` — main + production UNTOUCHED. Live App Store build unchanged: Build 25 / v1.0.4. Only repo change this session is THIS SESSION_NOTES.md commit.
**Commits:** SESSION_NOTES.md only (this entry) — "This commits to testing, not main." Zero app-code commits.
**Edge Function deploys:** 0. **Cache token count:** 2,510 (untouched). **EAS builds:** 0 (1 still remains this month).
**Where:** all work in `~/Desktop/clozie-awb-prototype/` (outside repo). `photos/`, `photos-newlight/`, `out/*` read-only originals — photos re-verified byte-identical to `photos_manifest.md5` at session start (21/21 PASS). Two source backups written to `src/` (`.session18-prebackup` pre-phase15D, `.session18-step7` pre-env-tunable) — outside git tracking, never committed.

**Goal:** implement Fork (b) from Sessions 16–17 — break the edge-vs-brightness mutual-exclusivity lock. Keep phase15C's ENTIRE pipeline (same estimate, same `sC` chroma protection, same attenuated CIColorMatrix + CIExposureAdjust) and ADD alpha-gated fringe protection so the correction reaches full strength only on the garment body; the diluted anti-aliased fringe keeps its ORIGINAL color/contrast. NO shipping/app code, NO enum change.

**What changed (harness only):** added ONE new function `phase15D` inside the ADDITIVE HARNESS extension of `src/awb_phase16_referee.swift`, PLUS ONE env-gated ternary in `main` (`APPROACH=="D" ? phase15D : =="C" ? phase15C : =="B" ? phase15B : phase15`). **`phase15`, `phase15B`, `phase15C` byte-for-byte UNTOUCHED. Enum region (lines 21–241) NEVER touched — md5 re-proven `26376fc8ce4577b3125074029639282f` after EVERY edit.**
- **Mechanism (analytic per-pixel lerp in the linear working space — NOT a CI filter):** phase15D runs C's whole pipeline to `ciLin` (C-corrected linear) and already holds `refLin` (straight original linear) at identical native res + alpha; the NEW step is `blended = refLin + s·(ciLin − refLin)` per channel, `s = smoothstep(aLo, aHi, α)`, then the SAME `applyCorrectionRGBA(idEst, correct:false)` → sRGB8 as C (byte-format identical). Chosen over a CIBlendWithMask/CIColorKernel because both operands are already rendered — zero new render passes, no third CI filter to re-prove in linear space. The lerp sits STRICTLY AFTER `sC`. `aHi` pinned at `alphaEstMin` 0.9 so the whole edge-metric band (0.05 ≤ α ≤ 0.9) lands on the protected side and body pixels (α>0.9) get `s=1` → byte-identical to C. The blend only ever moves a fringe pixel TOWARD its original value → cannot recreate the Build-28 dissolve; spatially smooth mask → no patchiness mechanism.
- **Two build steps, both new binaries (step5/step6/baseline never overwritten):** `step7` (aLo/aHi hardcoded 0.5/0.9 = Candidate 1); then `step8` (aLo/aHi env-tunable via `ALO`/`AHI`, defaults 0.5/0.9; **`aHi` HARD-CLAMPED `min(env ?? 0.9, 0.9)`** so no env value can ever erode body==C; `aLo` guarded `< aHi`). Self-check prints the RESOLVED aLo/aHi actually applied — never a trusted env echo.
- **Inertness proven (byte-level):** `step7` no-APPROACH == stored baseline (25+10 composites BYTE-IDENTICAL); `step7` `APPROACH=C` == Session-17 `phaseC_default` (25+10 PNGs + C self-check stderr BYTE-IDENTICAL — phase15D disturbed C by nothing); `step8` no-env `APPROACH=D` == `step7` D-default (BYTE-IDENTICAL — env defaults reproduce Candidate 1); `step8` no-APPROACH == baseline. Baseline edge numbers reproduced EXACTLY (1059 0.628 / 1060 0.505 / 1081 0.779 / 1118 0.752).
- **Self-check per photo (printed artifacts, not env vars):** body blend-weight `1.000` and body D-vs-analytic-C `meanAbs 0.00–0.03` levels on every photo-run → D's body IS C's correction, no color regression; fringe blend-weight drops monotonically with aLo (0.50→~0.275, 0.70→~0.16, 0.80→~0.09, 0.85→~0.05).

**Tests — the edge-vs-brightness lock, broken (gates LOCKED: edgeLumaLoss ≤0.10 PASS · warmVar ratio >1.4 confirmatory-only):**
- **Candidate 1 (aLo 0.5) at default cap — halves edge but FAILS primary:** warm whites 1059 0.634→**0.328**, 1060 0.608→**0.307**, 1078 0.285→**0.159** — all still >0.10. Body colors byte-identical to C. C1 caps run SKIPPED (Grace's call: acceptance caps run on the final config anyway, and Session-17 data already shows 1059/1060 can't reach ≥230 below default).
- **Candidate 2 (aLo sweep 0.70/0.80/0.85, aHi 0.90, env-tunable, default cap) — monotonic; 0.85 clears the gate:** 1059 0.21/0.122/**0.067**, 1060 0.198/0.113/**0.061**, 1078 0.105/0.060/**0.032**. Body colors byte-identical to C at every aLo (body `s=1` unchanged), whites ≥230 preserved.
- **Acceptance matrix on the chosen aLo 0.85 (default + caps 1.0/1.4/1.8, both sets):** edge ≤0.10 (PASS) on EVERY warm garment at EVERY cap (1081 camelWarm 0.816→0.077, 1118 beige 0.761→0.083, 1079 0.377→0.038). **Whites ≥230 ONLY at default cap** (1059 236, 1060 234, 1078 245); caps 1.0/1.4/1.8 keep edges clean but dim 1059/1060 below 230 for no edge gain → confirms the caps can't beat default. Controls 1061/1062/1063/1122 shift **0 at every cap**; camelRef 1080 PASS + camelWarm 1081 PASS at every cap; warmVar-after == C exactly (1081 15.2 — C's known marginal, NOT introduced by D).
- **Composites (Grace eyeball, APPROVED):** aLo 0.85 whites 1059/1060/1078 + ivory gauze 1120 read as CLEAN, crisp silhouettes over white — no dark/warm halo. The halo risk flagged for Fork (b) did not materialize at 0.85.

**VERDICT (VERIFIED):** **Fork (b) — phase15D, alpha-gated fringe protection — PASSES the locked acceptance. Winning config: aLo 0.85 / aHi 0.90 / DEFAULT cap (no BRIGHT_CAP).** It achieves the pair that was IMPOSSIBLE for C: at default cap, whites 1059/1060/1078 land ≥230 AND edgeLumaLoss ≤0.10 on the SAME run. Every C guarantee still holds (controls shift 0, camels pass, warmVar unmoved); body colors byte-identical to C everywhere; no regression vs C at any cap. D delivers clean edges WITHOUT a cap — exactly what C could not.

**HONEST FLAG ON RECORD:** this is proven ON THE MAC ONLY. The Session-16 OPEN QUESTION — whether `edgeLumaLoss ≤ 0.10` matches real iPhone appearance at card size — is STILL unresolved and still needs an on-phone check before this ships. Grace's eye approved the Mac composites; that is not the same as an on-device pass.

**UNVERIFIED / not done:** no repo port — porting phase15D into the app (and the Fork (a) vs Fork (b) final selection) is its OWN future session (Build 29); nothing ported this session; `autoWhiteBalance: true` still ON in committed code; Build 28 stays TestFlight-only and NOT promoted; on-phone gate-calibration check not done; no EAS build.

**Notes / state:** enum md5 `26376fc8ce4577b3125074029639282f` UNCHANGED; zero EAS builds (1 remains); zero repo code changes; main `062d15b` / production `f711c5d` UNTOUCHED; Build 25 / v1.0.4 LIVE and unchanged; zero Edge Function/SYSTEM_PROMPT/Supabase changes; cache 2,510. `phase15D` + the `APPROACH=D` env gate + env-tunable `ALO`/`AHI` (aHi clamped ≤0.9) + new `out/awb_phase16_step7` and `out/awb_phase16_step8` binaries remain in the harness for the Fork-(b) record; `phase15`/`phase15B`/`phase15C` and the enum unchanged. New out dirs saved: `out/phaseD_default(+-nl)`, `out/phaseD_alo70|alo80|alo85(+-nl)`, `out/phaseD_alo85_cap10|cap14|cap18(+-nl)`.

---

## Update 4 — Session 17 — 2026-07-19 — Phase 1.6 Fork (a) — chroma-protected Approach B (phase15C) built in referee + measured: PASSES acceptance at every cap (Mac, ZERO builds, repo untouched)

**Branch:** testing `727efde` → docs commit at close / main `062d15b` / production `f711c5d` — main + production UNTOUCHED. Live App Store build unchanged: Build 25 / v1.0.4. Only repo change this session is THIS SESSION_NOTES.md commit.
**Commits:** SESSION_NOTES.md only (this entry) — "This commits to testing, not main." Zero app-code commits.
**Edge Function deploys:** 0. **Cache token count:** 2,510 (untouched). **EAS builds:** 0 (1 still remains this month).
**Where:** all work in `~/Desktop/clozie-awb-prototype/` (outside repo). `photos/`, `photos-newlight/`, `out/*` read-only originals; nothing there committed. New read-only `photos_manifest.md5` (21-file md5 manifest, self-md5 `46827282…`) written to the prototype root to guard the originals — outside the repo, never committed.

**Goal:** implement Fork (a) from Session 16 — keep locked Approach B's spatially-uniform CIImage shape but ADD a chroma-protection equivalent so high-chroma/low-confidence garments (control 1063, gate 0.36; control 1061, gate 0.17) get identity gains, matching Approach A's shift 0, WITHOUT regressing edges vs B. NO shipping/app code, NO enum change.

**What changed (harness only):** added ONE new function `phase15C` inside the ADDITIVE HARNESS extension of `src/awb_phase16_referee.swift`, PLUS ONE env-gated ternary in `main` (`APPROACH=="C" ? phase15C : =="B" ? phase15B : phase15`). **`phase15` and `phase15B` byte-for-byte UNTOUCHED. Enum region (lines 21–241) NEVER touched — md5 re-proven `26376fc8ce4577b3125074029639282f` after every edit.**
- **Mechanism (garment-level chroma protection = A's per-pixel lerp, aggregated):** over body pixels (α>0.9) `phase15C` computes the provisional-corrected chroma EXACTLY as enum A's `applyCorrectionRGBA` does — `rolloff(px·gain·brightGain, knee)` → `(mx−mn)/max(mx,1e-5)` — takes the MEAN, and forms `sC = 1 − smoothstep(protLo 0.22, protHi 0.44, meanChroma)` (A's own ramp constants, reused verbatim). WB gains AND brightGain are attenuated toward identity by `sC`, then applied through the SAME single CIColorMatrix + CIExposureAdjust B uses. `sC≈1` (low-chroma whites) → byte-identical to B; `sC≈0` (high-chroma controls) → identity gains → shift 0. Spatially UNIFORM — no per-pixel apply, no new edge surface. Returned est carries the effective (post-sC) gains so the scoreboard shows what C applied.
- **Inertness proven (step6 = new binary; step5/baseline never overwritten):** step6 at no-APPROACH AND `APPROACH=B` == prior `step5` — 35/35 composites BYTE-IDENTICAL on BOTH paths, scoreboard data identical, and the B self-check stderr byte-identical. Baseline edge numbers reproduced EXACTLY (1059 0.628 / 1060 0.505 / 1081 0.779 / 1118 0.752). C code is reachable ONLY under `APPROACH=C`.
- **Caps + sC proven applied per photo via self-check stderr** (Session 15 zsh trap avoided — verified from printed artifacts, not the env var): cap field `none`/`1.0`/`1.4`/`1.8` ×17 each; CI-vs-analytic body `meanAbs ≤ 0.03` levels on every photo-run → the attenuated CI transform is FAITHFUL, not an artifact.

**Tests — C scoreboard, folding in the compact C / A / B comparison (gates LOCKED: edgeLumaLoss ≤0.10 PASS · warmVar ratio >1.4 confirmatory-only):**
- **PRIMARY ACCEPTANCE MET — all controls shift 0 at EVERY cap.** 1061 · 1062 · 1063 · 1122 = **0/0/0/0** at default/1.0/1.4/1.8. **C vs A vs B on the two leaky controls:** 1063 — **A 0 · B 66/32/23/22 · C 0/0/0/0**; 1061 — **A 0 · B 6 · C 0/0/0/0**. `sC=0.000` for all four (meanChroma 0.70–0.997, above protHi) → before=after byte-for-byte. C restores exactly what B dropped.
- **NO edge regression vs B (C ≤ B everywhere; C strictly dominates B on controls).** Whites 1059/1060/1078 · camelWarm 1081 · report 1079: **C == B edgeLumaLoss to 3 dp** (sC=1 → C *is* B). Controls: 1061 **0.298→0.000**, 1063 **0.437→0.000** (C *better* — identity gains never touch the fringe); 1062/1122 already 0. So on controls C beats B on color AND edge simultaneously; A also held color but its per-pixel brightness apply is what FAILED garment edges in Build 28 — **C = A's control protection inside B's uniform-edge shape.**
- **Camel guardrails hold** (sC=1 → C==B): camelRef 1080 shift 6 (<8) PASS every cap; camelWarm 1081 toward-ref & <230 every cap (78→18 default · →62 cap1.0 · →42 cap1.4 · →25 cap1.8) PASS.
- **Whites unchanged from B by construction (sC=1.000, meanChroma 0.077–0.111 << protLo).** 1059/1060 PASS white only at default (→236/234); 1078 (starts bright) PASSES at default/1.4/1.8; under cap they dim to warm-gray exactly as B did.
- **Composites** (Grace eyeball, APPROVED): 1063/1061/camels/colorful controls untouched at every cap; whites look same as B including the known gauze/soft-edge softness at default — confirmed the EXPECTED open problem for Fork (b), NOT a regression. Saved: `out/phaseC_default(+-nl)`, `out/phaseC_cap10|cap14|cap18(+-nl)`.

**VERDICT (VERIFIED):** **Fork (a) — phase15C, chroma-protected uniform CIImage correction — PASSES the locked acceptance at every cap.** It closes the Session-16 casualty (dropped chroma protection failing controls 1061/1063) with zero edge cost — matching Approach A's control protection while keeping Approach B's uniform, alpha-safe apply shape.

**HONEST FLAG ON RECORD:** Fork (a) does **NOT** fix the dim-warm-white brightness problem. Because whites have sC=1, C is byte-for-byte B on whites — 1059/1060 still land dim below the default cap and the gauze edge stays soft at default. That is Fork (b) (alpha-gate/feather the fringe to break the edge-vs-brightness lock) and remains the OPEN problem, exactly as expected. The Session-16 OPEN QUESTION — whether `edgeLumaLoss ≤ 0.10` matches real iPhone appearance at card size — is still unresolved and still needs an on-phone check before any gate change.

**UNVERIFIED / not done:** no repo port — porting phase15C into the app is its OWN future session (Build 29); `autoWhiteBalance: true` still ON in committed code; Build 28 stays TestFlight-only; Fork (b) not started; on-phone gate-calibration check not done.

**Notes / state:** enum md5 `26376fc8ce4577b3125074029639282f` UNCHANGED; zero EAS builds (1 remains); zero repo code changes; main `062d15b` / production `f711c5d` UNTOUCHED; Build 25 / v1.0.4 LIVE and unchanged; zero Edge Function/SYSTEM_PROMPT/Supabase changes; cache 2,510. `phase15C` + the `APPROACH=C` env gate + new `out/awb_phase16_step6` binary remain in the harness for the Fork-(a) record; `phase15B`/`APPROACH=B` and the enum unchanged.

---

## Update 4 — Session 16 — 2026-07-17 — Phase 1.6 — Approach B built in referee + measured: FAILS the locked gates at every cap (Mac, ZERO builds, repo untouched)

**Branch:** testing `149b486` → docs commit at close / main `062d15b` / production `f711c5d` — main + production UNTOUCHED. Live App Store build unchanged: Build 25 / v1.0.4. Only repo change this session is THIS SESSION_NOTES.md commit.
**Commits:** SESSION_NOTES.md only (this entry) — "This commits to testing, not main." Zero app-code commits.
**Edge Function deploys:** 0. **Cache token count:** 2,510 (untouched). **EAS builds:** 0 (1 still remains this month).
**Where:** all work in `~/Desktop/clozie-awb-prototype/` (outside repo). `photos/`, `photos-newlight/`, `out/phase16*`, `FINDINGS.md` read-only; nothing there committed.

**Goal:** implement locked Approach B (spatially-uniform CIImage correction) in the referee harness and measure it on the same scoreboard as the Build-28 baseline — default cap + the 1.0/1.4/1.8 cap sweep. NO shipping/app code, NO enum change.

**What changed (harness only):** added ONE new function `phase15B` inside the ADDITIVE HARNESS extension of `src/awb_phase16_referee.swift` — reuses `phase15`'s estimate VERBATIM (same WB gains + same capped brightGain incl. `BRIGHT_CAP`), applies WB via a diagonal **CIColorMatrix** + brightness via a uniform **CIExposureAdjust** (EV = log2 brightGain) in the linear working space; NO highlight knee, NO per-pixel chroma lerp (both dropped by design); output byte-format-identical to phase15's before/after so every existing metric/composite consumes it unchanged — PLUS ONE env-gated line in `main` (`APPROACH=="B" ? phase15B : phase15`). **Enum region (lines 21–241) NEVER touched — md5 re-proven `26376fc8ce4577b3125074029639282f` after every edit.** Gate OFF reproduced Step-3 baseline BYTE-IDENTICALLY (35/35 composites + identical metric tables) = wiring inert when off. **Self-check inside phase15B (CI-vs-analytic uniform multiply, body pixels) = meanAbs 0.00–0.03 levels on every photo → the CI filter path is a FAITHFUL uniform correction, not an implementation artifact.** Caps verified applied via self-check bGain (cap1.0→all 1.00 · cap1.4→max 1.40 · cap1.8→max 1.80).

**Tests — B scoreboard vs A (edgeLumaLoss ≤0.10 PASS · 0.10–0.30 WARN · >0.30 FAIL):**
- **Edge gate passes ONLY at cap 1.0** (zero brightness lift). DEFAULT→1.8→1.4→1.0: 1059 0.634→0.414→0.232→**0.003** · 1060 0.608→0.408→0.225→**0.005** · 1078 0.285(flat)→**0.001** · 1081 0.816→0.446→0.248→**0.011** · 1118nl 0.761→…→**0.006**; 1063 control 0.437→…→**0.104** (marginal WARN). At cap 1.4 the lifted whites are still 0.22–0.29 (FAIL). B is slightly **edge-worse than A at equal bGain** (1060 0.505→0.608) — the honest cost of dropping A's knee + lerp.
- **Color at the edge-safe cap 1.0:** whites NEUTRALIZED but DIM — 1059→(160,160,157) · 1060→(160,159,158) · **1078→(212,213,214) a regression** (was a bright 224-white, now <230). NO white reaches ≥230 under B's edge-safe cap. camelWarm 1081→(117,115,112) toward-ref 78→62 <230 PASS but dim/gray. camelRef 1080 shift 6 PASS. controls 1062/1122 shift 0 PASS.
- **NEW casualty — dropping the chroma lerp fails control 1063 at EVERY cap:** 1063 (pink, gate 0.36, extreme WB gains 0.72/2.00/1.54) shifts 66/32/23/**22** at DEFAULT/1.8/1.4/1.0 vs A's shift **0**. Verified proportional to the estimate's gate: gate 0.00 (1062,1122)→shift 0 fine · gate 0.17 (1061)→shift 6 borderline/cap-rescuable · gate 0.36 (1063)→shift 22 — **WB-driven, not brightness-driven, so NO cap fixes it.** A's per-pixel chroma protection was the safety net for nonzero-gate saturated garments; locked-B drops it.
- **warmVar QUIET at cap 1.0** — brown-patch flags gone: only 1081 trips (ratio 1.43, marginal, warm garment). B does NOT reintroduce widespread brown patchiness at the edge-safe cap (unlike default, where warmVars climbed).
- **Artifacts:** default-cap B in `out/phaseB/` + `out/phaseB-newlight/`; sweep in `out/phaseB-cap10|cap14|cap18(+-nl)/`; A baseline in `out/phaseBaseline*`.

**VERDICT (VERIFIED):** **Approach B as locked — uniform CIColorMatrix WB + capped CIExposureAdjust, chroma lerp dropped — FAILS the locked acceptance at every cap.** Two independent problems: (1) edge vs brightness mutual exclusivity (known, now confirmed for B) — the only edge-safe cap (1.0) surrenders all white brightening, and even the bright white 1078 can't reach 230; (2) the dropped chroma protection FAILS the 1063 control guardrail (shift 22), WB-driven and uncapfixable. Self-check proves this is B's true behaviour, not a bug.

**FORKS — both OPEN, nothing recommended or locked (Grace's call, future step):**
- **(a)** restore a chroma-protection equivalent in the CI path, and/or tighten the estimate's gate so high-chroma/low-confidence garments (1063) get identity gains.
- **(b)** alpha-gate/feather the correction at the fringe to break the edge-vs-brightness lock (explicitly on the Phase 1.6 fix-space list, NOT part of locked B).

**OPEN QUESTION ON RECORD (unresolved):** Grace's eye on the Mac before/after composites found the DEFAULT-cap B whites acceptable-looking, even though the edge gate FAILS them (0.6+). Whether `edgeLumaLoss ≤ 0.10` is calibrated to real iPhone appearance at card size — vs stricter than the eye needs — is **unresolved.** Needs an on-phone check (B output rendered at actual card size over the white surface) in a future session BEFORE any gate change or fork is locked. The gate stands as-is for now.

**UNVERIFIED / not done:** no fix chosen; `autoWhiteBalance: true` still ON in committed code; Build 28 stays TestFlight-only; no fork implemented; on-phone gate-calibration check not done.

**Notes / state:** enum md5 `26376fc8ce4577b3125074029639282f` UNCHANGED; zero EAS builds (1 remains); zero repo code changes; main `062d15b` / production `f711c5d` UNTOUCHED; Build 25 / v1.0.4 LIVE and unchanged; zero Edge Function/SYSTEM_PROMPT/Supabase changes; cache 2,510. `phase15B` + the `APPROACH=B` env gate remain in the harness for future fork measurement; enum unchanged.

---

## Update 4 — Session 15 — 2026-07-17 — Phase 1.6 A3 — brightGain-cap sweep + Approach B LOCKED + gates LOCKED (Mac, ZERO builds, repo untouched)

**Branch:** testing `279f680` → docs commit at close / main `062d15b` / production `f711c5d` — main + production UNTOUCHED. Live App Store build unchanged: Build 25 / v1.0.4. Only repo change this session is THIS SESSION_NOTES.md commit.
**Commits:** SESSION_NOTES.md only (this entry) — "This commits to testing, not main." Zero app-code commits.
**Edge Function deploys:** 0. **Cache token count:** 2,510 (untouched). **EAS builds:** 0 (1 still remains this month).
**Where:** all work in `~/Desktop/clozie-awb-prototype/` (outside repo). Originals in `photos/`, `photos-newlight/`, `FINDINGS.md` read-only; nothing there committed.

**Goal:** run the approach-agnostic brightGain-cap sweep proposed in Session 14 A3 — draw the color-vs-edge tradeoff curve with real data before any fix code — then Grace locks the fix approach + gates. NO algorithm/fix code this session.

**What changed (harness only):** 2-line edit inside the ADDITIVE HARNESS extension of `src/awb_phase16_referee.swift` (`phase15`, ~line 291): `let e` → `var e` + an env-var re-cap `if BRIGHT_CAP set: e.brightGain = min(cap, e.brightGain)`. Emulates lowering `brightClampHi` WITHOUT touching the enum (every sweep cap ∈ [0.80 floor, 3.0 enum cap], so `min()` is mathematically identical to re-clamping brightClampHi). Compiled once via macOS `swiftc -O`; ran the binary twice per cap (warm-light `photos/` + `photos-newlight/`, separate out dirs). **Enum region (lines 21–241) NEVER touched — md5 re-proven `26376fc8ce4577b3125074029639282f` after the edit.** Baseline run (no env var) reproduced Session 14 numbers EXACTLY (1059 0.628 / 1060 0.505 / 1081 0.779 / 1118 0.752) = proof the edit changed nothing on the default path. Cap effect verified (1081 bGain 1.00/1.30/1.50/2.00 at caps 1.0/1.3/1.5/2.0).

**Correction (post-commit, added in follow-up commit):** First cap loop mis-ran — zsh didn't word-split the unquoted loop var, so BRIGHT_CAP got a bad value and no cap applied; caught via missing cap*.txt, stray outputs cleaned, caps re-run with explicit hardcoded values and cap effect re-verified per 1081 bGain.

**Tests / the tradeoff curve (edgeLumaLoss gate ≤0.10 PASS · 0.10–0.30 WARN · >0.30 FAIL):**
- **Edge loss scales MONOTONICALLY with the cap → confirms brightness is the engine of edge destruction.** Worst garments base(3.0)→cap1.0: 1059 0.628→0.003 · 1060 0.505→0.003 · 1081 0.779→0.008 · 1118 0.752→0.005; all reach PASS only at cap 1.0, WARN at cap 1.3–1.5, FAIL at cap 2.0+.
- **Color guardrails:** dim-warm whites 1059/1060 PASS white ONLY at base (→236–240); every cap drops them below 230 (cap1.5→192–193 = a light warm gray, cap1.0→160). Bright white 1078 PASS through cap1.3 (→238) — it starts at raw 224 so needs only a small lift. Camel 1081 PASS camelWarm at EVERY cap (→192 base … →118 cap1.0, always toward-ref, never white). Controls 1061/62/63 shift 0 at every cap; camelRef 1080 shift 6 every cap; newlight control 1122 shift 0 every cap.
- **KEY FINDING — for dim warm-lit whites (1059/1060), color and edge are MUTUALLY EXCLUSIVE: at NO cap do both pass.** A raw-174 warm white needs bGain ~2.4 to reach ≥230, and that exact lift dissolves the edge (0.5–0.63 loss). → A one-line "just lower brightClampHi" fix CANNOT clear both gates; the fix must be structural.
- **warmVar barely responds to the cap** (1059 ratio stays ~1.4 even at cap1.0 where the edge is clean) → the brown-patch is driven by the chroma-protection / WB interaction, NOT brightness → confirms warmVar is confirmatory-only, and the brown fix is the chroma-protection lever (Approach B), not a brightness cap.
- **Caveat recorded:** these edge numbers are on the CURRENT alpha-blind per-pixel apply. Approach B (alpha-gated) may keep the edge intact at HIGHER brightness by construction — so the sweep prices the cheap fix + confirms the diagnosis; it does NOT cap what B can recover.
- **Composites saved per cap:** `out/sweep/cap100|cap130|cap150|cap200/` (+ matching `-nl` newlight dirs), baseline in `out/sweep/base/`. Judge the `_p16.png` files (before | after-over-white | after-over-cream).

**DECISIONS LOCKED (Grace, this session):**
1. **Approach B** — spatially-uniform CIImage correction (WB gains via a diagonal CIColorMatrix + a capped uniform CIExposureAdjust; DROP the per-pixel chroma lerp). Approach A (patch the per-pixel loop) REJECTED.
2. **Interim tradeoff ACCEPTED:** dim warm-lit whites may land as light warm gray — an honest interim FLOOR, **NOT a locked ceiling.** Approach B's alpha-gating may recover more brightness safely; the referee decides.
3. **Gates LOCKED:** `edgeLumaLoss ≤ 0.10 = PASS` primary (0.10–0.30 WARN, >0.30 FAIL); `warmVar after/before ratio > 1.4` = confirmatory brown-patch flag ONLY, not an independent hard gate. Fix acceptance = referee re-run: all garments edge ≤0.10 AND all color guardrails still pass (whites ≥230 where achievable given decision 2, controls shift 0, camelRef untouched, camelWarm toward-beige-never-white).

**UNVERIFIED / not done:** no fix/algorithm code written; `autoWhiteBalance: true` still ON in committed code; Build 28 stays TestFlight-only. Approach B NOT yet implemented — separate approved step, next session.

**Notes / state:** Build 25 / v1.0.4 LIVE and untouched. main `062d15b` / production `f711c5d` untouched. Zero EAS builds spent (1 remains), zero repo code changes, zero Edge Function/SYSTEM_PROMPT/Supabase changes, cache 2,510. The referee's brightGain-cap knob (env `BRIGHT_CAP`) remains in the harness for future sweeps; enum unchanged.

---

## Update 4 — Session 14 — 2026-07-17 — Phase 1.6 A2+A3 — referee harness that catches the Build 28 edge crime (Mac, ZERO builds, repo untouched)

**Branch:** testing `00e6628` / main `062d15b` / production `f711c5d` — main + production UNTOUCHED. Live App Store build unchanged: Build 25 / v1.0.4. Only repo change this session is THIS SESSION_NOTES.md commit.
**Commits:** SESSION_NOTES.md only (this entry) — "commits to testing, not main." Zero app-code commits.
**Edge Function deploys:** 0. **Cache token count:** 2,510 (untouched). **EAS builds:** 0 (1 still remains this month).
**Where:** all work in `~/Desktop/clozie-awb-prototype/` (outside repo). Originals in `photos/`, `photos-newlight/`, `FINDINGS.md` read-only; nothing there committed.

**Goal:** Step A1 confirmed the Phase-1.5 scoreboard was blind to edges (composited over gray-248, measured only center body color). A2 = build a referee that SEES the Build-28 edge failure; A3 = recommend the fix approach. NO algorithm changes this session.

**What changed (harness only):** New `src/awb_phase16_referee.swift` — a VERBATIM copy of the proven `awb_forkA_phase15.swift` (the `enum AutoWhiteBalance` and every color guardrail byte-identical) PLUS additions: white(255) + cream(#E8E4CE) before/after composites (judge over the app's real card/page surfaces, never gray); `edgeIntegrity()` — fringe visibility-over-white loss on the 0.05≤α≤0.9 band (the pixels the estimate excludes but the apply corrects); `brownPatch()` — spatial std-dev of per-cell chroma & warmth (R−B) over body pixels (α>0.9); cardigan trio 1079/1080/1081 grouped as ONE garment; newlight set 1118–1122 via file-existence gating. NO pass/fail thresholds — raw numbers only.

**Enum byte-identical THROUGHOUT (VERIFIED 4×):** committed `AutoWhiteBalance.swift` (35–255) vs referee enum region — `diff` empty, md5 `26376fc8ce4577b3125074029639282f` at A2-1 (pre-write), A2-2 (post-write), A2-3 (post compile-fix), A2-5 (post metric-swap). The referee runs the EXACT unmodified Build-28 algorithm.

**Tests (referee compiled clean via macOS `swiftc`, run on BOTH photo folders):**
- **Build-28 failure REPRODUCED on Mac.** Color guardrails still PASS exactly as Phase 1.5 (whites→neutral, controls 1061/1062/1063 shift 0, camel-daylight 1080 untouched, camel-warm 1081→beige & <230) — but the NEW edge metric FAILS: `edgeLumaLoss` **0.5–0.78** on the visible dissolves (1059 0.628 · 1060 0.505 · 1081 0.779 · 1118 0.752, all bGain 2.4–3.0) and **~0.00 on every clean case** (all bGain=1.0 rows). Confirmed causal: the damage is the brightness lift, not the WB gains (bGain-1.0 rows are clean even with WB gains active). White/cream composites eyeballed — silhouettes visibly bleed into the card exactly where the number is high; clean where it's 0.
- **Gradient metric DROPPED** — it INVERTED (retention >1 on whitened garments: 1081 2.05, 1060 1.79) because brightening widens P10–P90 spread while visually washing mid-tones. Wrong metric; removed.
- **warmVar brown-patch metric ADDED and validated** — spatial warmth variance (a variance, so a uniform shift doesn't move it; only patchiness does): **1081 warm cardigan 7.9→14.8 (+87%)**, 1059 6.3→9.9 (+57%), 1118 4.5→6.0 (+33%); **colored controls FLAT** (green 30.4→30.4, fuchsia 11.2→11.3) → clean discrimination. Honest caveat recorded: the chromaVar half mostly falls (global desaturation) and 1060 warmVar dropped despite a real edge fail → warmVar is SECONDARY/confirmatory, edgeLumaLoss is the primary gate.
- **Cardigan consistency:** same garment corrected to 3 different colors across lights, max pairwise shift 25.
- **Composites saved:** `~/Desktop/clozie-awb-prototype/out/phase16/` (12 warm-light + CARDIGAN_trio_p16.png) and `out/phase16-newlight/` (5). Judge `_p16.png`; ignore the `_p15.png` gray files.

**A3 recommendation ON RECORD (DECISION PENDING GRACE — deferred to next session per workflow):**
- **Approach B — spatially-uniform CIImage correction** (apply the smart estimate's per-channel WB gains via a diagonal CIColorMatrix + a capped uniform CIExposureAdjust; drop the per-pixel chroma lerp). Bet on B over Approach A (patch the per-pixel loop) because the referee proved both failure classes are properties of a non-uniform, alpha-blind, brightness-heavy apply — B removes the spatial + alpha classes by construction (SHAPE OUTRANKS COLOR becomes a guarantee), reuses existing module filters, and the global coverage/warmth gate already protects colored garments (so the per-pixel chroma protection — the brown-patch cause — can go). Honest tradeoff: dropping brightGain leaves dim-warm whites neutral-but-dim.
- **Proposed first A3 step (zero builds):** a **brightGain-cap sweep** in the harness (brightClampHi 1.0/1.3/1.5/2.0) to draw the color-vs-edge tradeoff curve on real photos before writing the real fix — approach-agnostic.
- **Suggested gates:** primary **edgeLumaLoss ≤ 0.10 = PASS** (fix target: all garments ≤0.10), 0.10–0.30 WARN, >0.30 FAIL; secondary **warmVar after/before ratio > 1.4 = brown-patch flag** (confirmatory only, not an independent hard gate). Fix acceptance = re-run referee: all garments edge ≤0.10, no warmVar ratio >1.4, AND all color guardrails still pass.

**UNVERIFIED / not done:** no algorithm/fix code written; `autoWhiteBalance: true` still ON in committed code; Build 28 stays TestFlight-only. Fix approach + thresholds NOT locked — Grace decides next session.

**Notes / state:** Build 25 / v1.0.4 LIVE and untouched. main `062d15b` / production `f711c5d` untouched. Zero EAS builds spent (1 remains), zero repo code changes, zero Edge Function/SYSTEM_PROMPT/Supabase changes, cache 2,510. Referee proven: color PASSES, edge FAILS — the harness now sees what Grace's eye saw on the iPhone.

---

## Update 4 — Session 13 — 2026-07-16 — Phase 2 AWB port → Build 28 TestFlight: EDGE FAIL (shape outranks color)

**Branch:** testing `329a50a` (pushed to origin) / main `062d15b` / production `f711c5d` — main + production UNTOUCHED. Live App Store build unchanged: Build 25 / v1.0.4.
**Commits (P1–P5, each "commits to testing, not main"):** `094e62d` P1 (correct inverted wbTemperature-direction comment — Task A: negative cools) · `b1660ce` P2 (port validated Fork-A AWB as isolated `AutoWhiteBalance.swift`, wired to nothing, byte-identical) · `2598c8a` P3 (add `autoWhiteBalance` enable flag, default off, wired to nothing) · `c630419` P4 (wire AWB at the correction chain, flag-gated, default off, byte-identical) · `329a50a` P5 (flip `autoWhiteBalance: true` in App.js `CUTOUT_OPTIONS`).
**Edge Function deploys:** 0. **Cache token count:** 2,510 (untouched).
**EAS builds:** 1 spent — **Build 28, v1.0.5, iOS preview** (buildNumber auto-incremented 27→28 remotely via `appVersionSource: remote`). Compiled **first try** — the full module + `AutoWhiteBalance.swift` iOS compile (the one thing unverifiable locally) PASSED. IPA delivered to TestFlight via Transporter. **1 EAS build remains this month; quota resets in ~2 weeks.**

**Goals:** ship the Phase-1-validated Fork-A automatic white balance (garment-only) into the real cutout pipeline in ONE build.

**What changed:** New `modules/expo-background-removal/ios/AutoWhiteBalance.swift` — CPU-buffer port of the prototype (`~/Desktop/clozie-awb-prototype/awb.swift`): unpremultiply → linear-sRGB estimate (garment alpha>0.9 guard, centerSigma 0.26) → per-channel WB + warmth-gated scene-anchored brightness → per-pixel chroma-protection → 8-bit sRGB straight-alpha rebuild, apply at capped-native res (`applyMaxSide 2400`). Wired at `BackgroundRemovalModule.swift:231` behind `autoWhiteBalance` (default off), flipped on in App.js `CUTOUT_OPTIONS`.

**Tests:**
- **Phase 1.5 (Mac, real Vision mask, 12 binding photos) — PASSED the gate:** whites 1059 (240,239,235) · 1060 (236,235,234) [Phase-1 soft-miss 224 resolved by the real mask] · 1078 (244,245,246); controls 1061/1062/1063 shift 0; camel-daylight 1080 shift 6; camel-warm 1081 (135,112,89)→(192,189,183), toward-ref 78→16 & <230 [ACCEPTED by Grace, 38pt margin]. Premultiply CONFIRMED (transpMeanRGB=(0,0,0) all 12); orientation upright; ~123 ms/photo. macOS `swiftc` compile of the ported enum = compile proof.
- **On-device (Build 28 TestFlight, Grace's eye) — FAIL.** Garment **silhouettes/edges DESTROYED on EVERY cutout** — worse than Build 25 for the product. Color may be closer, but the shape is wrecked.

**Grace's ruling (RECORDED): SHAPE OUTRANKS COLOR.** A clean silhouette with imperfect color beats perfect color with a dissolved edge.

**Diagnosis (read-only, VERIFIED by code-reading):**
- **Primary cause — brightening-on-white dissolves the edge (scale-independent).** `applyCorrectionRGBA` has **no alpha gate**: the estimate excludes alpha<0.9 but the APPLY runs the full gains (brightGain up to 3.0) on ALL pixels including the semi-transparent anti-aliased fringe. Walk of a 20%-alpha warm-white fringe pixel: straight ≈(0.55,0.50,0.42) × gains → rolloff → ≈(1,1,1) WHITE, alpha preserved 0.2 → a white fringe at 20% alpha. On the app's WHITE display surfaces, a near-white semi-transparent edge blends into white → the soft silhouette edge vanishes. Worst for the light/white garments the AWB whitens most → every cutout. Build 25 never brightened → garments kept contrast against white → crisp edges. Call site 1 (Add Item) feeds a **512px** image (App.js:1806) so `applyMaxSide 2400` never downscales → the cause is brightening, NOT resampling.
- **SECOND on-device symptom (distinct, same loop) — shadowed regions on light garments turn BROWN next to corrected white fabric.** Phase 1.6 hypothesis: the post-correction chroma-protection (protLo/protHi lerp) reads warm dark folds as "chromatic garment colour" and reverts them toward original while the surrounding lit fabric is corrected to white — one garment split into white + brown.
- **THIRD symptom — coloured garments (e.g. fuchsia joggers) ALSO lose their silhouette.** Edge pixels are diluted garment/background mixes with LOW chroma, so chroma-protection does NOT shield them; the brightness gain pushes the outline toward white → invisible on the white card — while the protected high-chroma body stays coloured. The same mechanism flattens internal shape (seams/sheen/pale shading are low-chroma too). **All three symptoms — blown whites, shapeless silhouettes on every garment, brown shadows — trace to the per-pixel apply's treatment of pixels the ESTIMATE excludes.**
- **`bufferToCIImage` alpha mode:** `.last` (straight) matches the straight buffer — self-consistent, NOT the primary cause. NOT CHECKED: RN `<Image>`/PNG-on-white pixel-level compositing (on-device layer, not inspectable read-only).
- **Phase 1.5 missed it** because its composites drew over gray-248, not white — a white fringe shows on gray but vanishes on white.

**UNVERIFIED / not done this session:** flag NOT turned off (stays ON in committed code); no fix attempted; Build 28 stays TestFlight-only.

**Notes / state:** `autoWhiteBalance: true` remains in committed code (testing). **Build 25 / v1.0.4 is the live App Store build, untouched.** main `062d15b` / production `f711c5d` untouched. No Edge Function / SYSTEM_PROMPT / eas.json / Supabase changes; cache 2,510. 1 EAS build remains; EAS resets ~2 weeks. The P1 comment fix and the AWB color math remain correct — the failure is purely the fringe/edge interaction with brightening on white.

**Next session — Phase 1.6 (Mac, ZERO builds):**
(a) Grace AirDrops tonight's **original camera photos** into `~/Desktop/clozie-awb-prototype/photos/` as the new **binding edge test set** (real edges + real backgrounds).
(b) **Phase 1.6 = reproduce all three symptoms locally** (blown whites, shapeless silhouettes on every garment, brown shadows) with **on-device-faithful alpha compositing** — composite the cutout PNG over **WHITE** and inspect. Fix space: **alpha-gate/feather the correction at edges** (gate correction strength by alpha so diluted/fringe pixels keep their original colour + contrast) **AND rethink chroma-protection for dark-warm and diluted pixels** (so warm folds aren't reverted to brown and low-chroma edges aren't left unshielded); all composites judged over WHITE.
(c) **Flag-off decision ONLY after the diagnosis is confirmed reproduced** — no blind flip.
(d) **All old scoreboard guardrails remain binding** (3 whites, 3 controls shift 0, camel-daylight untouched, camel-warm toward-beige-never-white) PLUS a new **edge/silhouette integrity** criterion.

---

## Update 4 — Session 12 — 2026-07-16 — Phase 1 AWB prototype COMPLETE (local Mac, zero builds, repo untouched)

**Branch:** testing c7e741a / main 062d15b / production f711c5d — ALL UNCHANGED this session until this docs commit. Zero code commits, zero EAS builds (budget still 2), zero Edge deploys, SYSTEM_PROMPT untouched (2,510).

**Where:** ~/Desktop/clozie-awb-prototype/ (outside repo). Contains FINDINGS.md, 3 Swift sources, 16 copied photos, compiled awb binary, 12 before/after composites, final_run.txt. Dated FINDINGS copy on Desktop.

### Results (14 local iterations, ~47ms/photo)
- Task A SETTLED at runtime: Swift:115 comment INVERTED — negative wbTemperature cools. Session 11 decision 5 confirmed.
- Final algorithm: garment-weighted illuminant estimate + warmth-gate (dim-warm→lift, daylight→leave) + scene-anchored brightness + post-WB per-pixel chroma-protection, all linear sRGB.
- Scoreboard: 1059 PASS (238,236,232) / 1078 PASS (244,246,247) / 1060 = 224 spread 4 — eye-validated white, numeric soft miss, ACCEPTED (revisit via Phase 2 real mask only, never garment-anchored brightening) / controls 1061-1063 shift 0 / camel-daylight 1080 untouched / camel-warm 1081 → beige, never white / 1076 nudged not blown / 1074-1075-1079 report-only.

### Criteria decisions (Grace)
- Camel/beige trio (IMG_1079/1080/1081) shot and added as binding tests — caught two whitening failure modes during tuning.
- 1074/1075 backlit-window → report-only: unrepresentative, users shoot against walls/doors (provenance recorded).
- Approved deviations from Session 11 locked decision 3: garment-weighted WB + scene-anchored brightness — original full-frame rationale honored by warmth-gate + chroma-protection.
- Measurement evolution recorded: single patch → median grid → flat-lit band (REVERTED, over-reached on 1061) → per-criterion.

### Next: Phase 2 (ONE EAS build)
Port validated algorithm into expo-background-removal at the Swift:214 chain. Checklist in FINDINGS.md: unpremultiply before estimate, exact CITemperatureAndTint parameterization, real Vision mask replaces border/center proxies (expected to improve 1060 + backlit), linear-sRGB math, Session 11 landmine list. Phase 3 (higher-res mask for edges) after EAS reset — never combined with color.

---

## Update 4 — Session 11 — 2026-07-15 (evening) — Build B redefined: read-only investigation, per-photo AWB architecture locked (NO code, NO build)

**Branch:** testing (HEAD `3ed93b4` at session start → docs commit at close). `main` `062d15b` / `production` `f711c5d` (Build 25 live) / tag `v1.0.4-build25-appstore-live` (→ `f711c5d`) — all UNCHANGED. Build A = Build 27 / v1.0.5 on TestFlight (compiled first try, verified today).

**Commit(s):** 1 docs-only, named files only (no `git add -A`, no amend): `SESSION_NOTES.md` (this entry). ZERO code commits — App.js / Swift / TS untouched. NO CLAUDE.md change (nothing shipped tonight).

**Edge Function deploys:** 0. **Cache token count:** 2,510 — SYSTEM_PROMPT NOT touched. **Version:** 1.0.5 (train OPEN) — untouched.

**EAS builds:** 0. Budget: 2 remain this month; EAS resets in ~2 weeks; app is LIVE (hotfix reserve weighed). Both builds unspent tonight.

### Goals
Values-only Build B was proposed (exposureEV 0.4). Grace brought MEASURED pixel-sampled evidence from Claude.ai that killed it. This session: read-only reality check of the actual Swift, then co-design the real fix. Zero code, zero build — Step 3 execution deferred to a future session.

### Decisions LOCKED tonight
1. **Values-only Build B is DEAD.** Exposure-only disproven twice: (a) math — exposureEV 0.4 on the measured tee → (197,179,155), R−B warm gap GROWS 38→42 (gamma); (b) real-world — Grace re-shot the same shirt on a DARK CARPET, iPhone auto-exposed ~+0.5EV, cutout measured (197,178,156), within 2 pts/channel of the math, still reads cream. Fixed global WB is non-universal (a closet-tuned 4,900K correction turns a 6,500K daylight photo blue and cools camel).
2. **ROOT CAUSE (agreed by both Claudes, confirmed against code):** the pipeline never estimates or removes the scene illuminant. White tee records RGB(174,158,136) ~4,876K under dim warm indoor light (EXIF ISO 640, 1/60, f/1.78); app card ~(248,248,248) ~6,471K. Warm-dim source pixels reproduced faithfully onto a neutral card read brown. Build A is FAITHFUL, not buggy (cutout (162,142,119) vs raw (174,158,136) within the shirt's own 146–191 fold variation; Display P3→sRGB shifts neutrals by 0.0000, eliminated).
3. **AGREED ARCHITECTURE:** per-photo AWB — near-neutral-selective estimator + confidence gate (no correction when scene has no neutral pixels) + strength clamp + brightness normalization toward ~245. Applied at the verified garment-only insertion point (Swift:214 chain). **Amendment accepted:** estimate from the FULL FRAME's near-neutral pixels (not garment-only) to resolve white-in-warm-light vs camel-in-daylight ambiguity. **Plain gray-world REJECTED** — would neutralize raspberry/terracotta/sage (the colors that currently PASS).
4. **EDGES root cause (accepted):** 512px matte upscaled to ~555×960 (hanger dress) + Vision segmentation-grade alpha, NO feathering/blur/threshold anywhere. Dormant edge dials (choke/sharpen) are lipstick (alias or eat the garment; choke worsens the ivory-shoulder mask gap). Real fix = higher-res mask (decouple BG-removal input from the 512 recognition payload) — SEPARATE later build, NEVER combined with color. ML matting / PhotoRoom API = product decisions, deferred (CLAUDE.md Phase 6).
5. **WB dial direction:** code comment at Swift:115 ("positive cools") is likely INVERTED per analysis — my derivation says negative `wbTemperature` cools (removes warm cast) in this parameterization. UNVERIFIED at runtime; must be pinned empirically before the manual dials are trusted as trim.
6. **PLAN:** Phase 1 (next session, ZERO builds) — standalone Swift CoreImage prototype compiled + run LOCALLY on this Mac against Grace's actual photos (added to repo/scratch): pin WB direction, implement estimator+gate+clamp+normalization, tune until whites read white AND raspberry/terracotta/sage/camel untouched. Phase 2 (ONE EAS build) — port validated algorithm into the module (unpremultiply before estimate; the landmine list is the checklist). Phase 3 (after EAS reset) — higher-res mask for edges.

### Step 1 — VERIFIED code findings (file:line)
- **(a) WB filter/units — VERIFIED (Swift:121-124):** `CITemperatureAndTint`, `inputNeutral=(6500+wbTemperature, wbTint)`, `inputTargetNeutral=(6500,0)`. `wbTemperature`=Kelvin delta, `wbTint`=green(−)/magenta(+) delta. Direction: analysis says comment inverted (NOT CHECKED at runtime).
- **(b) Insertion point — VERIFIED (Swift:214-226):** `foreground` (post-mask, garment-only, background zeroed) is the correct place; the existing dormant correction chain already inserts here.
- **(c) CIAreaAverage — available per Apple docs (standard CIFilter iOS 9+); NOT currently used (VERIFIED absent, full read); compile-availability provable only on build.** Landmine: averaging the masked buffer includes zeroed transparent pixels → must divide by coverage (avg premult-RGB ÷ avg alpha).
- **(d) Landmines — VERIFIED:** `CIImage(cvPixelBuffer:)` (Swift:214) is PREMULTIPLIED (must unpremultiply before estimate/decontam) and created with NO explicit color space (inherits P3/device default) → gamma/linear estimate-vs-apply mismatch risk (`CIExposureAdjust` works in linear).
- **(e) Raw mask handling — VERIFIED (Swift:202-247):** `generateMaskedImage(…croppedToInstancesExtent:true)` → `CIImage(cvPixelBuffer:)`; NO feathering/blur/threshold/erosion on alpha before compositing (choke dormant at 0). Native Vision matte verbatim. BG removal runs on the 512px `fixed.uri` (App.js:1801-1808/1833-1840), upscaled on display → soft edges.
- **(f) Edge options w/o ML:** CoreImage tricks (blur/sharpen/choke) are marginal/risky; biggest non-ML lever = higher-res mask; true catalog-crisp needs a matting model (Vision is segmentation-only = stage 1 of 2).

### UNVERIFIED (carry into Phase 1 prototype)
- WB dial direction at runtime (Swift:115 comment vs analysis).
- CIAreaAverage compile-availability in this module (provable only on build/local compile).
- Gamma-encoded vs linear working space for the estimate-vs-apply — must be made consistent.

### Notes
Recommendation on sequencing (accepted): color first, edges later, NEVER combined; given 2 builds + live app + ~2-week reset, prototype LOCALLY (zero builds) before spending any EAS build on the un-locally-compilable algorithm. Third-party PhotoRoom (matting+WB in one, zero build risk, but cost/privacy/CLAUDE.md-Phase-6) named honestly as the lowest-engineering-risk path to BOTH problems; deferred as a product decision.

---

## Update 4 — Session 10 — 2026-07-15 — Build 27 Build A: enhance-off + shadow tune + dormant Swift controls (code, NO build yet)

**Branch:** testing (HEAD `680cd61` at session start → `0a9338b` after 3 commits). `main` `062d15b` / `production` `f711c5d` (Build 25 live) / tag `v1.0.4-build25-appstore-live` (→ `f711c5d`) — all UNCHANGED, re-verified before and after every commit.

**Commit(s):** 3, named files only (no `git add -A`, no amend): `d008f92` — App.js `CUTOUT_OPTIONS` (S1); `5573ad6` — Swift dormant WB + exposure + edge-choke controls (S2–S6); `0a9338b` — TS types mirror + stale-comment fix (S7).

**Edge Function deploys:** 0. **Cache token count:** 2,510 — SYSTEM_PROMPT NOT touched. **Version:** 1.0.5 (train OPEN) — untouched this session.

**EAS build:** NONE — deferred to a separate GO. First EAS build is the only Swift compile test (no local swiftc). 3 builds remain this month; two-strike rule absolute.

### Context / decisions
- **Earlier today — read-only opinion session (2026-07-15):** re-verified all Build 27 findings against code at HEAD `680cd061`; **zero code changed.** Confirmed whites-regression root cause (`enhanceStrength: 1.0`) and that every finding still holds.
- **Grace's Option 2 decision:** narrowed Build A scope — **DROP the 512 → 768 resolution change** (both resize sites stay 512; Anthropic recognition payload unchanged); keep enhance-off + shadow tune + dormant garment-only Swift controls.
- **Supabase org upgraded to Pro on 2026-07-15** (browser work, separate from code).

### What changed
- **App.js CUTOUT_OPTIONS (:61/63/65):** `enhanceStrength 1.0→0.0` (kills the only garment-recoloring op — the verified brown-whites fix), `shadowBlur 18→12`, `shadowOffsetY 12→14`. All other fields byte-identical.
- **Swift:** 5 dormant `@Field`s at identity 0 (`wbTemperature`/`wbTint`/`exposureEV`/`edgeChokePx`/`edgeSharpness`); guarded helpers `whiteBalancedForeground` (:117), `exposureAdjustedForeground` (:132), `chokedForeground` (:151); wired at :223–230 as WB → exposure → choke → shadow. **Choke BEFORE shadow** so the baked shadow derives from the choked mask. Every helper early-returns the EXACT input at identity (mirrors existing :51/:83 guards). `CIColorClamp` uses the no-arg overload for compile safety.
- **TS:** mirrored the 5 dormant fields as optional numbers (Build B = JS-only); corrected the stale "single-arg Steps 1–7" forwarding comment (native is 2-arg since Build 26).

### Tests
No runtime test (no build). Static only: App.js diff = exactly 3 lines; Swift brace/paren/bracket balance 40/40, 100/100, 10/10; full top-to-bottom Swift read-back PASS (guards return exact input; dormant-at-defaults proof walked); every edit read back correct; `main`/`production` unchanged after each commit.

### UNVERIFIED (all pending first TestFlight build)
- Build A on-device: whites vs raw daylight photo (target raw-photo color, NOT better), shadow at blur 12 / offsetY 14, edges unchanged (choke OFF), old JPEG + old PNG items display, dress hanger slot, new-item add flow, recognition/COLOUR unaffected.
- **Entire Swift compile** — first EAS build is the compile test.
- **Choke active-path correctness** (RGB-edge darkening / premult) — flagged UNVERIFIED in-code; only relevant once Build B turns it on.

### Notes
Build B dormant params (identity → effect): `wbTemperature` 0 (+cools warm cast), `wbTint` 0, `exposureEV` 0 (+brightens), `edgeChokePx` 0 (erodes alpha), `edgeSharpness` 0 (steepens ramp). WB + exposure are JS-only in Build B; choke may need a native revision.

---

## Update 4 — Session 9 — 2026-07-14 — Docs-only: lock SESSION NOTES Desktop-copy rule (NO code, NO build)

**Branch:** testing (HEAD `cb11572` at session start; this session adds 3 commits on top). `main` `062d15b` / `production` `f711c5d` (Build 25 live) / tag `v1.0.4-build25-appstore-live` (→ `f711c5d`) — all UNCHANGED.

**Commit(s):** 3 docs-only commits, named files only (no `git add -A`, no amend). `b65cd77` — CLAUDE.md rule; `7ac1d63` — SESSION_NOTES.md header echo; plus this entry's commit at session close. ZERO code commits.

**Edge Function deploys:** 0. **Cache token count:** 2,510 — SYSTEM_PROMPT NOT touched.

### Goals
Lock a naming + contents rule for the Desktop session-notes copies (Goal A), then drop a dated CLAUDE.md copy on the Desktop for upload (Goal B). Root cause: audit of 32 Desktop copies found the ritual had drifted badly.

### What changed
- **Audit (read-only, VERIFIED against the 32 files in `~/Desktop/Session notes Clozie /`):** 14 topic-bearing / 18 number+date-only filenames; only **8 of 32** were a single session entry — the other **24 were cumulative full-log dumps** (H2-entry count climbs 12→…→35), totalling **3.06 MB** (3,057,537 bytes). Only **2** files ever carried a reference-only disclaimer. Grace's own numbers were directionally right, off by ≤1 each; her "the 9 correct ones carry a header" was the one materially wrong sub-claim (only 2 did).
- **CLAUDE.md** ([65–75](CLAUDE.md:65)) — amended the Desktop-copy convention into a **LOCKED** rule: filename `SESSION_NOTES_Update[N]_Session[M]_[YYYY-MM-DD]_[Topic].md` with `[Topic]` **required, last, 1-4 words, all-lowercase, hyphenated**; contents **ONLY that session's single entry**, never the whole log. `all-lowercase` written explicitly (Grace caught that "casing is fixed" was implied in reasoning but never in the text — the same assumed-but-unwritten hole that let `AnalyseRedesign` happen).
- **SESSION_NOTES.md** ([9](SESSION_NOTES.md:9)) — one-line echo of the rule in the repo header (read at session-close time).
- **Desktop copy of CLAUDE.md** — `~/Desktop/CLAUDE_2026-07-14.md`, 1,538 lines / 203,412 bytes, byte-identical to source (`cp` with `$HOME` inside quotes — a quoted `~` would NOT expand). Outside the repo; git can't see it.

### Tests
Docs only — no runtime. Verified: both edits read back correct (`all-lowercase` present at CLAUDE.md:71); git shows named-file commits only; `main`/`production` SHAs unchanged; Desktop copy `diff` IDENTICAL to source; nothing new staged/untracked from the copy.

### UNVERIFIED
None outstanding for this session.

### Notes
This entry's own Desktop copy is the **first real use of the new rule** — single entry only, named `SESSION_NOTES_Update4_Session9_2026-07-14_session-notes-rule.md`. If that copy exceeds ~60 lines, the rule failed on first use.

---

## Update 4 — Session 8 — 2026-07-14 — Build 27: read-only cutout-quality audit (NO code, NO build)

**Branch:** testing (HEAD `1a43b58` at session start; this docs commit adds one commit on top). `main` `062d15b` / `production` `f711c5d` (Build 25 live) / tag `v1.0.4-build25-appstore-live` (→ `f711c5d`) — all UNCHANGED.

**Commit(s):** 1 docs-only commit (this session close) — `CLAUDE.md` + `SESSION_NOTES.md` + `BUILD27_QUALITY_FINDINGS.md`, named files only, no `git add -A`, no amend. ZERO code commits — no App.js / Swift / TS / Edge Function change this session.

**Edge Function deploys:** 0. **Cache token count:** 2,510 — SYSTEM_PROMPT NOT touched.

### Goals
Read-only reality check on the Build 26 cutout-quality complaints (whites read brown, hazy edges, over-diffuse shadow) against the ACTUAL Swift/JS pipeline — every claim VERIFIED (file:line) or NOT CHECKED. Produce a findings file. No code changes, no code commits, no build.

### What happened
- **Branch safety (read-only):** confirmed on `testing`; `main` `062d15b` / `production` `f711c5d` untouched; working tree only untracked files.
- **Read the full pipeline:** `BackgroundRemovalModule.swift`, the `.ts` bridge, `App.js` `CUTOUT_OPTIONS` + both call sites + resize, `clozieRecognition.js`, `wardrobeItems.js`, and every display-size style.
- **Answered Q1–Q7** with VERIFIED/NOT-CHECKED markers. One file created: `BUILD27_QUALITY_FINDINGS.md`. No stored Vision cutout was reachable read-only → Q6 file size is a labeled proxy, not a real cutout.

### Findings summary
- **Whites regression (Q3b) — VERIFIED root cause:** the ONLY op that recolors the garment is `autoEnhancedCGImage` at `enhanceStrength: 1.0` (App.js:61 → Swift:123), run on the FULL warm frame BEFORE the mask (Swift:118/123/126). Build 25 (enhance 0) didn't degrade color → regression attributable to enhance. Fix is JS-only (`enhanceStrength → 0`).
- **No white balance today (Q3) — VERIFIED** (whole file read): only CIFilters are autoAdjustmentFilters / DissolveTransition / SourceInCompositing / GaussianBlur / ColorMatrix. No temperature/whitepoint/exposure.
- **512px resize is JS-side (Q1) — VERIFIED — App.js:1803/1835**, but SHARED with recognition (clozieRecognition.js:11-16 re-encodes with no downscale) → bumping to 768 also enlarges the Anthropic payload unless decoupled. Largest display box = hanger dress slot 185×320pt ≈ 555×960px @3x (App.js:5553); a 768 portrait source covers it, 512 is upscaled (a real edge-softness contributor).
- **Shadow values JS-tunable (Q5) — VERIFIED — App.js:59-69 → Swift:8-18/71-99**: blur/opacity/offset/color all no-op-default Record fields; blur 18→12 is a free JS diff.
- **Choke + garment-only WB/exposure (Q4/Q4b) — feasible** at the post-mask cutout (Swift:138), but Swift changes; the shadow shares the same alpha mask (Swift:84-86) so choke ordering matters. Honest caveat: a fixed white-balance can't whiten whites AND keep camel warm without an illuminant estimate.
- **PNG size (Q6) — NOT CHECKED (no real cutout on disk); proxy:** ~5-6× JPEG; 768 PNG ≈ ~1 MB/item → ~50 MB per 50-item closet.

### Grace's decision — quality-first TWO-BUILD plan
- **Build A (next native build, all Swift landed once):** `enhanceStrength → 0`; shadow `blur 18 → 12`; `resize 512 → 768` decoupled from recognition (recognition stays 512); dormant garment-only white-balance + exposure + ~1px alpha-choke added at ZERO/no-op defaults (ship inert, JS-tunable later).
- **Build B (JS-only tuning, only if Build A falls short):** flip WB / exposure / choke values on — no Swift recompile.

### UNVERIFIED / carried
- On-device look of any recipe change is UNVERIFIED until Build A is on TestFlight (Vision cutouts can't render read-only or in Expo Go).
- Build-26 items already have warm-enhanced color baked into the stored PNG — no recipe change fixes those without re-processing/re-shoot.
- Q6 real PNG size NOT CHECKED — proxy only.

### Notes
- Nothing shipped. `main` / `production` / tag untouched. Version unchanged (1.0.5 already set; 1.0.5 train OPEN). This docs commit lands on `testing`, not `main`.

---

## Update 4 — Session 7 — 2026-07-14 — Build 26: pre-build review + EAS build + TestFlight PASS

**Branch:** testing (HEAD `fb29844` at session start; this docs commit adds one commit on top). `main` `062d15b` / `production` `f711c5d` (Build 25 live) / tag `v1.0.4-build25-appstore-live` (→ `f711c5d`) — all UNCHANGED. Pushed to origin only with Grace's explicit OK.

**Commit(s):** 1 docs-only commit (this session close) — `CLAUDE.md` + `SESSION_NOTES.md`, named files only, no `git add -A`, no amend. ZERO code commits — no App.js / Swift / TS / Edge Function change this session.

**Edge Function deploys:** 0. **Cache token count:** 2,510 — SYSTEM_PROMPT NOT touched.

### Goals
Second-reviewer inspection of all Session 1 (Build 26) code before spending a build, then the single EAS build for Build 26, then hand off to Grace for Transporter/TestFlight. No code changes.

### What happened
- **Step 1 — branch safety (read-only):** confirmed on `testing`, HEAD `fb29844`, no tracked-file changes; `main`/`production`/tag all at expected SHAs; `origin/testing` == local `fb29844` (verified against live `git ls-remote`, not just the cached ref) → no pre-build push needed.
- **Step 2 — independent second-reviewer code read (read-only):** re-read all 7 Session 1 files. Verified (a) all NO-OP defaults are true no-ops, (b) `CUTOUT_OPTIONS` passed at BOTH `removeBackground` call sites (App.js:1775 production add flow + App.js:6389 Settings diagnostics), (c) no 1-arg call remains, (d) `uploadWardrobePhoto` content-type correct for png AND jpg (`extAndTypeFromUri`, wardrobeItems.js:36–42), (e) `.gitignore` `/ios/` + `/android/` still root-anchored (fix `e145753`) so the module native sources ship to EAS — proven by pattern test (`/ios/` matches `ios/Podfile` but NOT `modules/expo-background-removal/ios/…`). Verdict: AGREE — safe to build.
- **Step 3 — EAS build:** `eas build --profile preview --platform ios --non-interactive` from `fb29844`. buildNumber auto-incremented 25 → 26 (remote source). Build **finished** clean, exit 0.

### Build 26 (verified via `eas build:view`)
- Status finished · Version **1.0.5** · Build number **26** · Commit `fb29844` · Profile preview · Distribution store · SDK 57.0.0 · Fingerprint `689136ac…` (differs from Build 25's `fd943c7a…` → confirms the native module actually shipped, unlike the silently-dropped Builds 8–11/20).
- `.ipa`: https://expo.dev/artifacts/eas/aEAZnwK7G8Bdz2fuqpOPKnZmtgXCAkieOojRsdkZW-c.ipa
- Build page: https://expo.dev/accounts/clozie/projects/clozie/builds/08a73dd8-9fa5-4d59-8d62-778c24e607ac
- NO `eas submit` — Transporter hand-off to Grace.

### Tests — Build 26 on-device TestFlight PASS (Grace, 2026-07-14)
Transparency on dark backgrounds ✓ · shadow geometry correct (soft shadow BELOW garment) ✓ · EXIF test upright ✓ · app-restart persistence ✓ · old JPEG items still display ✓ · dress NOT clipped on Hanger View ✓ · clean segmentation even on a busy patterned rug background ✓. **Overall: Build 26 = PASS.**

### UNVERIFIED / carried
- Build 26 is TestFlight-only — NOT released to the App Store. Build 25 / v1.0.4 remains the LIVE build. 1.0.5 train OPEN.
- One tuning finding (see KNOWN ISSUES + Session 3 agenda): auto-enhance @ `enhanceStrength: 1.0` doesn't fix dim/warm lighting on light garments (ivory→dingy, cream→brown in the stored cutout). COLOUR recognition unaffected (separate image path). JS-only fix next session.

### Notes
- Two Known Issues logged this session: (1) the auto-enhance light-garment finding (Session 3 tuning agenda; evidence screenshots captured by Grace), (2) stale comment at `BackgroundRemovalModule.ts:17` (Swift 2-arg since `e62b08a`; dead + `try/catch`-guarded, cosmetic).
- No version bump (1.0.5 already set in `05d895e`). Session 3 tuning needs NO Swift recompile — recipe values are JS-tunable via a rebuild.

---

## Update 4 — Session 6 — 2026-07-13 — Build 26: background-removal Swift parameterization + JS wiring (NO EAS build)

**Branch:** testing (HEAD `a2fc8bf`). `main` `062d15b` / `production` `f711c5d` (Build 25 live) / tag `v1.0.4-build25-appstore-live` (→ `f711c5d`) — all UNCHANGED. No push this session unless Grace says.

**Commit(s):** 8 per-step commits, named files only, no amend:
- `da892f7` Step 1 — options contract (types.ts + wrapper .ts + web stub + Android .kt)
- `e62b08a` Step 2 — Swift accepts options Record (no-op defaults) + flatten shadowColor→R/G/B in types.ts
- `db80052` Step 3 — Swift EXIF rotation rider (UIImage.normalizedUp)
- `7adb38b` Step 4 — Swift transparent PNG branch (opt-in)
- `dbca755` Step 5 — Swift auto-enhance (opt-in, autoAdjustmentFilters)
- `6805dd9` Step 6 — Swift baked silhouette shadow (opt-in) [commit MESSAGE cosmetically garbled by a zsh backtick-substitution; CODE correct + full-file verified; left as-is per never-amend]
- `b258c63` Step 7 — uploadWardrobePhoto derives extension + content-type
- `a2fc8bf` Step 8 — wire CUTOUT_OPTIONS into both call sites (feature ON)

**Edge Function deploys:** 0. **Cache token count:** 2,510 — SYSTEM_PROMPT NOT touched. No Edge Function / eas.json / app.config.js / package.json / Supabase changes.

### Goals
Land ALL native (Swift) work for Build 26 in one pass so future shadow/enhance tuning is JS-only, then wire it on — WITHOUT an EAS build (that is Session 2). Follow BUILD26_FEASIBILITY_FINDINGS.md.

### What changed (7 files, +199/−19 vs opener 05d895e)
- **Swift module fully parameterized** (`ios/BackgroundRemovalModule.swift`): `removeBackground(imageUri, options?)`. Pipeline now: load → EXIF-normalize (`normalizedUp`) → auto-enhance (opt-in) → Vision mask → foreground → baked shadow (opt-in) → subject → PNG or jpeg-white encode. `RemoveBackgroundOptions` Record with all NO-OP defaults (enhance 0, shadow 0, jpeg-white).
- **Contract widened** across TS wrapper, web stub, Android Kotlin stub; wrapper forwards the 2nd arg only when defined.
- **uploadWardrobePhoto** (`src/lib/wardrobeItems.js`) derives ext + contentType from the file (png vs jpg).
- **App.js**: module-scope `CUTOUT_OPTIONS` (png, enhance 1.0, shadowOpacity 0.40, blur 18, offsetY 12, gray 0.3) passed to both `removeBackground` call sites (production add flow + Settings diagnostics modal).

### Design guarantees
- With no options / defaults, every opt-in is a no-op → output byte-identical to Build 25. The new look is turned on ENTIRELY by App.js passing CUTOUT_OPTIONS (Step 8). Reverting `a2fc8bf` alone restores Build 25 behavior with the machinery dormant.
- One identical shadow/enhance recipe catalog-wide; all values JS-tunable (rebuild, never a Swift recompile).
- No 1-arg removeBackground call remains on device.

### Tests
NONE possible this session — the Vision module returns null in Expo Go, and `testing` runs SDK 57 (Expo Go can't load it). Verified by inspection + git scope only. All on-device proof is Session 2's TestFlight build.

### UNVERIFIED / NOT CHECKED (Session 2 checklist, priority order)
1. **PNG alpha preservation** — `CIContext.createCGImage(foreground)` + `pngData()` must yield transparency, not black. #1 risk; isolated to the PNG branch if it fails.
2. Auto-enhance look on real garments (autoAdjustmentFilters may over-correct → lower enhanceStrength, JS-only).
3. Shadow geometry — offset sign for "downward" (CI y-up); if shadow lands above, flip `shadowOffsetY` sign, JS-only.
4. EXIF rider on a genuinely rotated input (test modal raw pick).
5. ~4× file size on real cutouts; closet grid load time.
6. Kotlin/Swift/Expo optional-arg + Record conversion all compile (no local compiler).

### Notes
- Supabase `wardrobe-photos` bucket verified by Grace in dashboard 2026-07-13: MIME = Any, 50 MB limit → PNG allowed, NO dashboard change made.
- `expo-dev-client` NOT installed (read-only check) → Session 2 tuning ships via TestFlight builds unless a dev-client is added later (its own native build).
- Step 6 commit-message garble is cosmetic only; committed Swift is byte-correct.

---

## Update 4 — Session 5 — 2026-07-13 — Build 26 opener: version bump 1.0.5 + read-only feasibility audit

**Branch:** testing (HEAD `49b19c0`). `main` `062d15b` / `production` `f711c5d` (Build 25 live) / tag `v1.0.4-build25-appstore-live` — all UNCHANGED. Commit to `origin/testing` only when Grace says push.

**Commit(s):**
- (this commit) — `app.config.js` + `package.json` (version 1.0.4 → 1.0.5) + `CLAUDE.md` (VERIFICATION RULES section + CURRENT BUILD STATE line) + `SESSION_NOTES.md` (this entry) + new `BUILD26_FEASIBILITY_FINDINGS.md`.

**Edge Function deploys:** 0. **Cache token count:** 2,510 — SYSTEM_PROMPT NOT touched. No Edge Function / eas.json / Supabase changes.

### Goals
Open the 1.0.5 train (mandatory VERSION RULE gate after Build 25 shipped) and run a READ-ONLY Build 26 feasibility audit: transparent PNG cutouts + auto-enhance + baked silhouette shadow + parameterized Swift module + re-process migration + EXIF rider. Zero code changes beyond the two version strings.

### What changed
- **Part A (only code-file change):** `app.config.js:7` `version '1.0.4' → '1.0.5'` + `package.json:3` `"version" "1.0.4" → "1.0.5"`. `buildNumber` untouched (EAS auto-increments). Mirrors the Session 5 (Update 2) two-file pattern that fixed the Build 13 rejection.
- **Part B:** read the live code, wrote `BUILD26_FEASIBILITY_FINDINGS.md` (Q1–Q9, each claim marked VERIFIED file:line or NOT CHECKED). No code touched in Part B.
- **CLAUDE.md:** added permanent VERIFICATION RULES section (before GOLDEN RULES) + CURRENT BUILD STATE "Last updated" line for the 1.0.5 train open + audit done.

### Key verified findings
- BG removal is LIVE in Build 25 (App.js:41, 1791, 1823 — Promise.all on EXIF-fixed `fixed.uri`); the SHELVED doc is stale. Code wins.
- Alpha cutout exists at Swift:33 BEFORE the white composite (Swift:34-35) → transparent PNG = delete composite + swap encoder, not new segmentation.
- Module takes only `imageUri` today (Swift:9, .ts:4) → needs a one-time `options` arg (native build); all later value-tuning is JS-only.
- `expo-updates` NOT installed → no OTA; tuning ships via TestFlight builds.
- PNG measured ~4× the JPEG (~250 KB vs ~60 KB at 512px) — accepted as the industry price.
- Only processed 512px images are stored — no originals kept (App.js:1782-1790).

### Build 26 scope LOCKED (Grace's decisions this session)
- ONE native (Swift) build bundles: parameterized `options`, auto-enhance (before mask), transparent PNG output, baked silhouette shadow (industry recipe defaults), + EXIF rotation rider. After that, tuning = JS-only.
- Re-process = manual opt-in "Refresh closet photos" row in SETTINGS only (never auto, never in My Closet UI); keep-old-on-fail; LOWEST priority, built last, cut without hesitation if heavy; its UI gets a design mini-session with a mockup before any code.
- PNG accepted (HEIC/WebP explicitly rejected as riskier). Wrinkle hint REMOVED from Build 26 scope — existing hint untouched.

### Tests
None — read-only audit + two version-string edits. Diff verified: only the two version lines changed, `buildNumber` untouched.

### UNVERIFIED / NOT CHECKED
- True Vision cutout PNG size (measured on a proxy photo, not a real cutout).
- Vision re-segmentation quality on stored white JPEGs, esp. light/cream garments (can't run Vision off-device).
- Visual look of transparency on `cover`-mode surfaces + Share Card (needs one on-device pass).
- Whether an `expo-dev-client` tuning path exists (would make JS tuning hot-reload without builds).
- Supabase `wardrobe-photos` bucket format policy (30-sec dashboard confirm before shipping PNG).

### Notes
- VERIFICATION RULES adopted as permanent project rules this session (now in CLAUDE.md). Flag-2 correction (BG removal not shelved — live in Build 25) verified against code, exactly the failure mode the rules target.

---

## Update 4 — Session 4 (Deploy 4) — 2026-07-13 — Occasion-scoped Nope suppression (Issue 2)

**Branch:** testing. `main` `062d15b` / `production` `ea8f0ca` (Build 15) / all build tags UNCHANGED. `index.ts` + docs to `origin/testing`.

**Commit(s):**
- (this commit) — `index.ts` (Deploy 4) + SESSION_NOTES entry + CLAUDE.md CURRENT BUILD STATE update.

**Edge Function deploys:** 1 (`generate-outfits`, CLI `--use-api`, no `--yes`) — **Version 61**. **Cache token count:** 2,510 — SYSTEM_PROMPT byte-identical (lines 198–413 diffed IDENTICAL vs HEAD); `cache_read_input_tokens: 2510` verified on every usage line in Supabase Logs, `cache_creation 0`.

### Goals
Build the deferred Issue 2 from Session 4 (2026-07-12): make a "not for me" rating actually suppress that combination on the next generation — occasion-scoped, combination-level, advisory, zero SYSTEM_PROMPT touch. Full design in `DEPLOY4_HANDOFF.md`.

### What changed (`index.ts` only — 6 edits, +38 net lines / +40 −2)
- **New query (1556–1576):** reads `outfit_history` `.eq('rating','nope').eq('occasion', occasion).order('rated_at' desc).limit(8)`; maps `item_ids` → names via `wardrobeNameById` (the unfiltered pool, same as recent history); drops empties; logs `disliked outfits (this occasion): N`.
- **`buildFreshContent` args (589) + destructure (594):** new `dislikedOutfits: { name; itemNames }[]`.
- **AVOID block builder (684–696):** item names ARE the pairing (name as fallback); header carries the per-item guard "individual pieces are fine in different combinations"; omitted entirely when empty (same pattern as `recentBlock`).
- **Placement (715):** in the user message between `currentBlock` and `recentBlock`.
- **Handler wiring (1784):** `dislikedOutfits` threaded into the `buildFreshContent(...)` call.

### Tests (iPhone + Supabase Logs) — PASS
- Nope'd combo did NOT return on same-occasion regenerate; individual items still appear freely on other occasions; outfits look normal everywhere.
- Logs: `disliked outfits (this occasion): 8 rows` firing on every generation (Work · Office, Going Out, Casual Day); `success — sonnet, 3 outfits` every call; `cache_read_input_tokens: 2510` on ALL usage lines; `cache_creation 0`.
- The `8 rows` appearing on all occasions *before* today's Nope = pre-existing Nope history from weeks of testing already filling the limit-8 window. Expected, not a bug.

### Constraints honored
Occasion-scoped (`.eq('occasion', occasion)`) + combination-level (whole `item_ids` list, never a single piece) + never permanent (`.limit(8)` rolling window that decays naturally as new nopes arrive) + zero SYSTEM_PROMPT touch (user-message/JS only) → cache stayed 2,510.

### UNVERIFIED / known limitations (conscious, accepted)
- **Plain names in the AVOID line** (`wardrobeNameById`), NOT Deploy 3's disambiguated `displayNameById` — matches the recent-block precedent; advisory-only so identical-named twins reading slightly less precisely is acceptable.
- **Legacy NULL-occasion rows** don't match `.eq('occasion', …)` → no-op, harmless. A nope only suppresses if that row recorded its occasion (normal in-session generate → rate does; a rate after a fresh reload where context was lost may not).
- **Fallback path never sees the AVOID text** — `buildSmartFallback` / `buildStubOutfits` build from Item objects, not `buildFreshContent`. Rare degraded path; accepted.
- **No dedup vs the recent-outfits block** — a nope'd combo may appear in both AVOID and RECENT blocks; both say "don't repeat," so it only reinforces. Left as-is (smaller change).

### Notes / decisions
- **July-12 deploy-state lesson applied:** verified live NOT by dashboard timestamp — pulled the deployed source back down from Supabase and grepped it, found all three markers (`disliked outfits (this occasion)`, `AVOID — she rated these…`, `.eq('rating','nope')`), byte-identical to the working copy. Working copy backed up + restored (sha match) around the download.
- **SHA caveat:** the 198–413 region SHA came out `447bd72…`, not the handoff's noted `ce2cc53…` — a tooling/line-range mismatch, NOT a change. Authoritative proof = the byte-for-byte diff vs HEAD (IDENTICAL) + live `cache_read 2510`.
- **All four outfit-quality issues from the 2026-07-12 diagnostic are now resolved** (Deploys 1–3 + Deploy 4).
- **Reuse:** ~75% of this plumbing (rating+occasion history read → suppression block) is the foundation for the planned Nope-reason-chip feature (adds a `reason` column + reason-scoping to the same query/block). Not throwaway.

### Release ritual (Build 25 → App Store LIVE, same session)
- Apple approved v1.0.4 (Build 25); Grace pressed Release ~3 PM — **Build 25 / v1.0.4 is now the LIVE App Store build** (prior live was Build 15 / v1.0.2). The 1.0.4 train is CLOSED (next app code change → bump to 1.0.5 in `app.config.js` + `package.json`).
- Git bookkeeping done: annotated tag `v1.0.4-build25-appstore-live` (tag-object `d219721`) on Build 25 commit `f711c5d` + `production` fast-forwarded `ea8f0ca` → `f711c5d` (clean ff through 37 commits, ff-enforced via `git push . f711c5d:production`), both pushed to origin. `main` `062d15b` untouched; stayed on `testing` throughout.
- CLAUDE.md CURRENT BUILD STATE updated to match (bookkeeping DONE, production pointer `f711c5d`, Build 15 → was-live, running-log blob slimmed + archived to CLAUDE_ARCHIVE.md). Repo commits this session: `7f238d5` (Deploy 4 code + docs) → `28d45f1` (doc-accuracy edits).

---

## Update 4 — Session 4 — 2026-07-12 — Outfit-generation quality fixes (Edge Function Deploys 1–3)

**Branch:** testing. `main` `062d15b` / `production` `ea8f0ca` (Build 15 live) / all build tags UNCHANGED. Docs + `index.ts` pushed to `origin/testing`.

**Commit(s):**
- (this commit) — `index.ts` (Deploys 1–3) + SESSION_NOTES entry + CLAUDE.md running-log line + new `DEPLOY4_HANDOFF.md`.

**Edge Function deploys:** 3 (all `generate-outfits`, CLI `--use-api`, no `--yes`). **Cache token count:** 2,510 — SYSTEM_PROMPT byte-identical across all three (region SHA `ce2cc53…`); `cache_read_input_tokens: 2510` verified on iPhone after every deploy.

### Goals
Read-only diagnostic of four outfit-generation issues, then land the three cheapest correct fixes + one nudge — zero SYSTEM_PROMPT touch, each deploy iPhone-verified before the next. Issue 2 (Nope suppression) scoped but DEFERRED — see `DEPLOY4_HANDOFF.md`.

### What changed (`index.ts` only)
- **Deploy 1 — Issue 4 (Hot outerwear):** new block in `applySafetyFilters`. When `temperature === 'Hot'` AND occasion NOT in {Work · Office, Going Out, Formal Event}, drop ALL Outerwear (pinned exempt). Closes the "light jacket in Hot" gap — the pre-existing Hot filter only dropped `HEAVY_OUTERWEAR` regex; warmth-column C2 is dormant. Layering occasions keep light blazers.
- **Deploy 2 — Issue 1 (tee+dress):** one-clause nudge on the DRESS RULE line in `buildFreshContent` (USER MESSAGE, not SYSTEM_PROMPT) — "never add a separate top over or under a dress unless the Brief clearly asks for layering." Soft; deliberate layering still allowed.
- **Deploy 3 — Issue 3 (twin names) + itemIds dedupe:** new `disambiguateNames(items)` → id→display-name map; collided names get a `(colour)` suffix (or `(#n)` when colours also match). Threaded into `buildCompressedPool` (pool lines), the `Must Include` line, and `validateAndMapOutfits` (name→id lookup). Mapper keeps plain-name fallback keys with the **pinned twin owning its plain key** so a dropped-suffix pin still resolves (net = fewer collision fallbacks). `itemIds` deduped per outfit via `new Set`.

### Tests (iPhone, per deploy)
- **Deploy 1 PASS:** Hot + Casual Day → no jacket; Hot + Work · Office → blazer kept; other temps unaffected; cache 2510.
- **Deploy 2 PASS:** dresses normal, filters healthy, cache 2510.
- **Deploy 3 PASS:** brief "jeans" surfaced BOTH twins (Mid-Wash Indigo appeared — previously impossible); pinning Indigo → in all 3 outfits, no collision fallback; both parachute pants reachable; sonnet successes across occasions, no `could not map name to UUID`; cache 2510.

### UNVERIFIED / known issues
- **Issue 2 (Nope suppression) NOT built** — scoped + designed, deferred. Full handoff in `DEPLOY4_HANDOFF.md`.
- **Forgot-pin fallback UNCHANGED (out of scope):** a pinned item Sonnet simply omits from one of 3 outfits still logs `outfit missing pinned item` → fallback. Deploy 3 fixes only the *collision* cause, not Sonnet obedience — and both causes print the identical log line (indistinguishable in logs).
- **Two-blazers 4th structural check** — deferred, watch only.

### Notes / decisions
- **DEPLOY-STATE GOTCHA (caught tonight):** Step 3 was reviewed + edited but the deploy was never run; a dashboard "deployed 22 min ago" timestamp actually matched Deploy 2 (~19:06), so all twin tests unknowingly ran on pre-Step-3 code (only Optic White ever appeared — the collision bug). Caught by comparing the dashboard timestamp against actual deploy history. **Lesson: verify deploy state FIRST (deploy history, not just a timestamp) before interpreting test results.**
- Zero SYSTEM_PROMPT changes; cache 2,510 held across all three (SHA `ce2cc53…`). Fixes are JS/user-message only; schema stays name-based in the cached prompt.
- Fallback builders (`buildSmartFallback` / `buildStubOutfits`) never see the DRESS RULE nudge or disambiguation — they build from Item objects directly. Accepted.

---

## Update 4 — App Store Submission — 2026-07-12 — v1.0.4 (Build 25) submitted

CORRECTION: live App Store version is 1.0.2 (Build 15), NOT 1.0.3/Build 19 — 1.0.3 (19) only ever reached TestFlight internal testing. Build 25 IPA (delivered via Transporter Jul 12, 8:34 AM) attached to new App Store Connect version 1.0.4; What's New used softened wording ("closet opens up smoother and cleaner", not "loads faster"); reviewer demo login re-verified on device pre-submit; Business Model note confirmed present. Submitted ~4:51 PM — Waiting for Review. Release: MANUAL. Keep existing rating. On approval: press Release, then tag v1.0.4-build25-appstore-live and fast-forward production. Zero code changes, zero deploys, cache 2,510.

---

## Update 4 — Session 3 — 2026-07-12 — Background Removal polish + cold-launch flash fix (v1.0.4 Build 25)

**Branch:** testing. `main` `062d15b` / `production` `ea8f0ca` (Build 15 live) / existing build tags UNCHANGED. Three new commits, pushed to `origin/testing`. New safety tag `v1.0.4-build25-br-polish-verified` (annotated, on `f711c5d`, pushed).

**Commit(s):**
- `951baa9` — `BackgroundRemovalModule.swift`: flip `croppedToInstancesExtent: false → true` so the Vision cutout crops to the garment bounding box.
- `f6a39ed` — App.js: reword Add-item Best Results tip → "hang your item against a white or light wall".
- `f711c5d` — App.js: gate both empty states (My Closet + Today's Vibe) behind a new `wardrobeLoaded` flag to stop the cold-launch empty-state flash.
- (this docs commit) — SESSION_NOTES entry + CLAUDE.md CURRENT BUILD STATE pointer + `Clozie_Known_Issues_Backlog.md` updates.

**Edge Function deploys:** 0. **Cache token count:** 2,510 (SYSTEM_PROMPT untouched).

### Goals
Land three low-risk polish items in one build: (1) auto-crop cutouts so items fill their closet cards, (2) reword the photo hint, (3) kill the cold-launch flash where returning users briefly saw "add your first item" before their closet loaded.

### What changed
- **Auto-crop (Swift, 1 word):** `generateMaskedImage(..., croppedToInstancesExtent: true)`. Downstream compositing reads `foreground.extent`, so it adapts with no other change. Cutout now crops tight to the garment; `resizeMode="contain"` on the white card renders it larger/centered. No padding added (verified not needed).
- **Hint reword (App.js:2309):** "photograph on a white or light background" → "hang your item against a white or light wall". 💡 kept, em-dash + UK "colours" preserved.
- **Cold-launch flash (App.js, 7 edits):** new `wardrobeLoaded` state (false → true in loadItems `finally`, reset false on SIGNED_OUT). Both empty-state early returns now require `wardrobeLoaded &&`. Prop drilled into WardrobeTab + TodaysVibeTab. Returning-user-with-items no longer flashes the empty state; genuinely-empty closets get a brief harmless fall-through (accepted, Decision B).
- **EAS Build 25** (`preview`, iOS, from `f711c5d`) — SUCCEEDED first try, buildNumber auto-incremented 24→25, no version bump (v1.0.4 train). No `eas submit`; IPA for Transporter.

### Tests
**On-device TestFlight (Build 25) — PASS on iPhone:** auto-crop — items fill cards, nothing clipped, no padding needed; hint text correct; cold-launch flash gone; Today's Vibe lands clean; add-item regression passes.

### UNVERIFIED / known issues
- None new. Remaining BR polish (soft shadow, re-process existing items) + Swift EXIF rotation fix stay in `Clozie_Known_Issues_Backlog.md`.

### Notes / decisions
- **Soft shadow DEFERRED** — looked at auto-crop on-device first; auto-crop alone reads clean, so shadow is now "decide after living with Build 25." Possible Build 26, not committed.
- **Padding follow-up NOT needed** — tight crop verified clean (no cramped sleeves/straps).
- **Hanger-in-frame policy DECIDED** — Policy A with B's common sense: a hanger in a cutout is embraced as a signature look, NOT engineered out.
- Three separate named-file commits so any one is revertible alone; testing branch only; `main`/`production`/existing tags untouched; no Edge Function / SYSTEM_PROMPT / eas.json / Supabase changes.

---

## Update 4 — Session 2 — 2026-07-11 — Background Removal wired into the REAL Add Item flow (v1.0.4 Build 24)

**Branch:** testing. `main` `062d15b` / `production` `ea8f0ca` (Build 15 live) / all build tags UNCHANGED.

**Commit(s):**
- `d845438` — App.js: wire background removal into the real Add Item flow (camera + library). Pushed to `origin/testing`.
- (this docs commit) — CLAUDE.md CURRENT BUILD STATE + this entry + `Clozie_Known_Issues_Backlog.md` BR polish section.

**Edge Function deploys:** 0. **Cache token count:** 2,510 (SYSTEM_PROMPT untouched).

### Goals
Move Apple Vision background removal off the hidden VIP test surface and into the real Add Item flow so every user's wardrobe photo gets a clean cutout — without reintroducing the deferred ~90° rotation bug.

### What changed
Five surgical App.js edits (read-only reality check first; Swift/Edge/SYSTEM_PROMPT/eas.json/Supabase/wardrobeItems.js all untouched):
1. New `isRemovingBg` state in WardrobeTab.
2. New `applyBackgroundRemoval(uprightUri)` helper — calls `BackgroundRemoval.removeBackground` on the **EXIF-normalized `fixed.uri`** (never the raw pick, which is what sidesteps the rotation bug), `setPhotoUri(cutout)` on success, `finally` always clears the flag.
3. `handleTakePhoto`: `await runRecognition(fixed.uri)` → `await Promise.all([runRecognition(fixed.uri), applyBackgroundRemoval(fixed.uri)])`.
4. `handleUploadFile`: identical Promise.all swap.
5. Add-to-Closet button gated on `isRemovingBg` in all 3 spots (disabled style, activeOpacity, disabled prop) — Add stays disabled until the cutout is ready, so tap-immediately users can never save the original.
- Reality-check finding: the module returns a **white-background JPEG** (not a transparent PNG) — no alpha, so `uploadWardrobePhoto`'s hardcoded `image/jpeg` and all display surfaces already handle it byte-for-byte; nothing downstream needed changing. Recognition deliberately kept on `fixed.uri` (known-good input). Fallback: null/throw → `photoUri` stays `fixed.uri`, item saves normally, no error/blank.
- **EAS Build 24** (`preview`, iOS, from `d845438`) — SUCCEEDED, buildNumber auto-incremented 23→24, no version bump (v1.0.4 train). No `eas submit`; IPA for Transporter.

### Tests
**On-device TestFlight (Build 24) — PASS on iPhone:** camera path AND library path both produce a background-removed cutout; 512px quality is clean (edges + print preservation held — newly proven at this size, Build 23 had tested on the raw full-res pick); the SAVED closet item is the cutout (not just the preview); recognition fields still auto-fill on both paths; BG removal finishes before recognition in practice, so the Add button re-enables with the cutout already in place → the bad-save race is closed.

### UNVERIFIED / known issues
- None new this session. (BR polish backlog — auto-crop, re-process existing items, soft shadow, hint text — plus the deferred Swift EXIF rotation fix are logged in `Clozie_Known_Issues_Backlog.md` as a future bundled "BR polish" pass.)

### Notes / decisions
- **Edit 6 (bar-mask) deliberately DROPPED** — forcing the recognition bar to `'scanning'` while `isRemovingBg` would have hidden real `error`/`no-key`/`offline` messages until BG finished. The button-gate alone closes the race; the rare cosmetic photo-swap glimpse while the button is greyed out is accepted.
- **Serial deliberately replaced by PARALLEL** (`Promise.all`) at Grace's direction — users tap Add the instant it's tappable, so the serial version's post-recognition swap window would have been hit constantly. Verified `Promise.all` can never reject from BG (both `applyBackgroundRemoval` and `runRecognition` swallow their own errors), so recognition always lands.
- **VIP-surface ~90° rotation accepted** as deferred — the real flow runs on the upright `fixed.uri`, so it's unaffected; the Swift EXIF fix stays backlogged.
- Hard rules honored: no version bump, no `eas submit`, named-file commit only, testing branch only, `main`/`production`/tags untouched.

---

## Update 4 — Session 1 — 2026-07-11 — Background Removal on SDK 57 — root cause found + FIXED, on-device VERIFIED (v1.0.4 Build 23)

**Branch:** testing. `main` `062d15b` / `production` `ea8f0ca` (Build 15 live) / all build tags UNCHANGED. Six new commits, ALL LOCAL (unpushed) as of this entry.

**Commit(s):**
- `4478ade` — recover `expo-background-removal` as a local `./modules` module (11 files, faithful from `session-24a-shelved`, zero shape edits).
- `446a85b` — App.js: VIP-gated Settings DEVELOPER test surface (8 hunks from ref `3f45855`, +312/-1; only deviation = relative import into `./modules/expo-background-removal`).
- `7bc1cac` — bump version 1.0.3 → 1.0.4.
- `af89d30` — temporary `eas-build-post-install` diagnostic hook [reverted by `eaa46d1`].
- `e145753` — **THE FIX**: anchor `.gitignore` `ios/` + `android/` → `/ios/` `/android/`.
- `eaa46d1` — revert the diagnostic commit (clean ship state).

**Edge Function deploys:** 0. **Cache token count:** 2,510 (SYSTEM_PROMPT untouched).

### Goals
Ship the shelved Apple Vision background removal on SDK 57 as a local `./modules` module (Plan A); after Strike 1 failed, diagnose and fix the worker-only module drop that killed six prior builds (Session 24A 8–11, Update 3 16/17, and now 20).

### What changed
- **Plan A wired + local pre-gate:** module recovered to `./modules`; SDK 57's `nativeModulesDir './modules'` scan discovers it via the **search-paths** channel (verified). CocoaPods 1.17.0 installed 2026-07-11 → local `pod install` pre-gate showed `Installing BackgroundRemoval` (first time this stage was ever testable locally).
- **Strike 1 (Build 20) FAILED** — same silent signature: module absent from the worker's 102 pods, referenced nowhere.
- **Diagnosis (read-only + one instrumentation build):** ruled OUT the EAS precompile-cache theory (cache-miss modules build from source and still install — RNSVG/RNCAsyncStorage), the cwd/app-root theory (worker resolved all 21 Expo deps; local scan works from `ios/`), and version/config divergence (autolinking **57.0.5 identical**; no `eas.json`/hook/`expo.autolinking` injection; only delta = worker Node 22 vs local 20). Added a temporary `eas-build-post-install` hook (Build 21) printing the worker's own `verify -v` + `ls modules/.../ios`.
- **ROOT CAUSE (Build 21 diagnostic):** `modules/expo-background-removal/ios/` was **EMPTY on the worker** — podspec + Swift missing. `.gitignore` `ios/` + `android/` (unanchored → match at any depth) matched the nested module dirs; EAS's **pure-pattern uploader stripped them** (the files are git-tracked, so `git archive` kept them — but EAS doesn't use git's tracked-file awareness). `verify` found the module (config survived) but `resolve` dropped it (no podspec) → never in the Podfile → never installed. Cleanly explains "works locally, fails on worker, verify-yes/resolve-no," and almost certainly Builds 8–11 too.
- **THE FIX (`e145753`):** `/ios/` `/android/` — root prebuild dirs still ignored, nested module native files ship. Confirmed via `git check-ignore --no-index` (module KEPT, root still IGNORED).
- **Build 22 (fix + diagnostic):** worker `ls` now shows podspec (810 B) + Swift (1810 B); `Installing BackgroundRemoval (0.1.0)` — **CHECK A PASS**; 103 pods.
- **Build 23 (clean, diagnostic reverted):** CHECK A/B PASS, doctor 19/20 (known benign `typescript`/`@types/react` dev mismatch), no diagnostic block. **This is the shipped build.**

### Tests
- Local pre-gate: `Installing BackgroundRemoval` (CocoaPods 1.17.0) — pass.
- Builds 20 (fail) / 21 (diagnostic) / 22 (fix, pass) / 23 (clean, pass) — all v1.0.4, buildNumbers 20–23; logs preserved in `build2{0,1,2,3}_logs/` (gitignored).
- **On-device TestFlight (Build 23) — VERIFIED PASS twice on iPhone:** busy Persian rug → pink striped pants + green floral tee both returned clean Apple Vision cutouts (backgrounds fully removed, garments intact, edges clean).

### UNVERIFIED / known issues
- **Cutout returns ~90° rotated** (systematic, both tests) — likely EXIF orientation not normalized before the Vision request in `BackgroundRemovalModule.swift`. Logged to `Clozie_Known_Issues_Backlog.md`; fix in next BR polish pass.
- Builds 16/17 (old npm-registry route) failure remains separately unexplained — moot; Plan A (local module) is the shipped approach.

### Notes / decisions
- Two-strike rule: only Build 20 counts as a failure (Strike 1). The fix passed → Strike 2 never needed. Builds 21/22/23 = instrumentation/fix/clean, not strikes.
- CocoaPods 1.17.0 installed via Homebrew 2026-07-11 (pre-gate tooling; no repo changes).
- Hard rules honored: no `npm audit fix`, no `--yes`; Edge Functions / SYSTEM_PROMPT (cache 2,510) / `eas.json` / Supabase untouched; named-file commits only; no branch/tag deleted; revert via `git revert` (never reset/amend); Transporter upload only.
- OPEN: push `testing` to origin (6 commits still local); promoting v1.0.4 to `production` / App Store is a separate future release decision.

---

## Update 3 — Session 9 — 2026-07-11 — Merge sdk56-upgrade → testing (SDK 57 goes official)

**Branch:** work committed on `sdk56-upgrade`, then `testing` fast-forwarded onto it. `main` `062d15b` / `production` `ea8f0ca` (Build 15 live) / all build tags UNCHANGED.

**Commit(s):**
- `9f070c7` — docs: KNOWN ISSUES — undo/untag feature request + backlog-migration housekeeping note (CLAUDE.md).
- `bdfb0d2` — docs: SESSION_NOTES — Build 19 (v1.0.3) TestFlight VERIFIED PASS (SESSION_NOTES.md).
- (this docs commit) — CLAUDE.md CURRENT BUILD STATE + this Session 9 entry.

**Edge Function deploys:** 0. **Cache token count:** 2,510 (SYSTEM_PROMPT untouched).

### Goals
Take the TestFlight-verified SDK 57 branch official: record the Build 19 pass, merge `sdk56-upgrade` → `testing`, and lay down two safety-net tags.

### What changed
- **Merge:** `testing` fast-forwarded `21e5db1` → `bdfb0d2` (pure FF, no merge commit; `testing` == `sdk56-upgrade`). Carried the 10 SDK-hop/version commits + 2 docs commits. `sdk56-upgrade` left at `bdfb0d2` as an extra safety pointer — NOT deleted.
- **Tags (annotated, local until pushed):** `sdk54-final` @ `21e5db1` = last SDK 54 / Expo Go-compatible state (Door 2); `sdk57-clean-baseline` @ `bdfb0d2` = proven Build 19 state / pre-background-removal revert point (Door 3).
- **Docs:** CLAUDE.md SDK bullet rewritten (merge done, `testing` = SDK 57, Expo Go can't run `testing`, both tag meanings); Last verified 2026-07-06 → 2026-07-11; Last updated prepended.

### Tests
Read-only pre-merge: clean fast-forward confirmed (`testing` was the merge-base), zero background-removal residue (no `modules/`, no `.npmrc`, `expo-background-removal` absent from package.json + lock, none in App.js). Post-merge verify: `testing` HEAD == `sdk56-upgrade` == `bdfb0d2`, single-parent (no merge commit), tracked tree clean, `main` + `production` untouched.

### UNVERIFIED
- Daily Notifications firing + tap routing (KNOWN ISSUES item 29) — NOT part of the Build 19 pass, still TestFlight-pending.
- **Consequence of the merge: Expo Go (SDK 54) can no longer run `testing`.** All future device testing is TestFlight until Expo Go ships SDK 57. `sdk54-final` is the Expo Go fallback if ever needed.

### Notes / decisions
- Hard rules honored: no `npm audit fix`, no `--yes`, no package.json edits; Edge Functions / SYSTEM_PROMPT / eas.json / app code untouched; named-file commits only; no branch/tag/file deleted; no amend.
- Promoting SDK 57 to `production` (the live App Store branch) is a SEPARATE future release decision — not done this session. Any future build follows the VERSION RULE.
- Pushes to origin (`testing` branch, tag `sdk54-final`, tag `sdk57-clean-baseline`) follow this docs commit — three separate pushes.

---

## Update 3 — Session 8 — 2026-07-10 — Build 18 prep + EAS build (SDK 57, TestFlight path)

**Branch:** `sdk56-upgrade` (HEAD at session start `7b38cba`). `testing` UNTOUCHED at `21e5db1`; `main` `062d15b`, `production` `ea8f0ca` (Build 15 live), all build tags — unchanged. Nothing pushed.

**Commit(s):**
- `356a301` — "docs: correct false Expo Go SDK 57 claim (Sessions 6 & 7) — upgrade is TestFlight-only" — SESSION_NOTES.md + CLAUDE.md only.
- (this docs commit) — SESSION_NOTES + CLAUDE.md, this Session 8 entry.

**Edge Function deploys:** 0. **Cache token count:** 2,510 (SYSTEM_PROMPT untouched).

### Goals
Take the compile-only SDK 57 checkpoint (hop 3, `23fc763`) to a real TestFlight-capable iOS binary. Correct the false "Expo Go = SDK 57" record from Sessions 6 & 7 first, then produce EAS Build 18 with zero app/config changes.

### The record correction (Step 1)
Sessions 6 & 7 asserted as fact that Grace's iPhone Expo Go runs SDK 57 and device testing was possible. FALSE — App Store Expo Go is capped at Supported SDK 54 (Grace's screenshots 2026-07-09; latest installable 54.0.2, client 1017756). No SDK 57 Expo Go exists. Consequence: the upgrade is TestFlight-only; `testing` (SDK 54) still matches Expo Go 54 so the fallback is intact. Full detail in the "CORRECTION — 2026-07-10" note below + CLAUDE.md SDK bullet / Last-updated line.

### Build 18 prep — evidence-based, zero edits
- **Deferred plugins (3): added NONE.** Read each plugin's on-disk source: `expo-sharing`/`withShareExtension` only builds an iOS share-INTO extension when `ios.enabled:true` (Clozie shares OUT via `Sharing.shareAsync`, needs no config); `expo-status-bar`/`withStatusBar` writes nothing to Info.plist with a bare entry; `expo-web-browser`/`withWebBrowser` is `if(!props) return config` and only touches Android. All iOS no-ops as bare entries — writing them buys nothing and breaks the app.config.js-untouched discipline. datetimepicker already auto-handled by SDK 57. app.config.js untouched.
- **`import 'dotenv/config'`: LEFT.** Needed for local `expo start` to resolve `extra.supabaseUrl`; harmless no-op on EAS. Removal risks local dev for zero build benefit.
- **eas.json image pin: SKIPPED.** EAS default image is SDK-aware; capture-from-log-and-pin-later deferred.
- **buildNumber: no edit possible.** `appVersionSource: remote` + `autoIncrement:true` → server-side. `eas build:version:get` read 17 → auto-incremented to 18. Version stays 1.0.2.
- **eas-cli:** left at 20.0.0 (latest 20.5.1, same major — negligible risk; Grace's call).

### Tests
- expo-doctor: **19/20** — the one fail is only the two accepted dev-only mismatches (`typescript` 5.9.3, `@types/react` 19.1.17). No plugins flagged.
- iOS bundle: `npx expo export --platform ios` → clean 2.7MB Hermes `.hbc`, zero resolution errors. `dist-build18check/` deleted.
- **EAS Build 18 — SUCCEEDED (exit 0).** buildNumber auto 17→18; remote iOS credentials reused non-interactively (dist cert serial `33BF3C…` to 2027-06-02, provisioning profile active); env vars EXPO_PUBLIC_SUPABASE_URL + ANON_KEY loaded from production environment. IPA: `https://expo.dev/artifacts/eas/vif5gWWX5_5gt9DID7FolsaqA5XXO-onxvSuy4YRnIM.ipa`. Build ID `cc112717-db23-4c22-955e-33543f8e3aa3`. Build page: `https://expo.dev/accounts/clozie/projects/clozie/builds/cc112717-db23-4c22-955e-33543f8e3aa3`.
- **SDK 54→57 now proven at binary/package level** — biggest upgrade unknown closed. Runtime unproven until TestFlight.

### UNVERIFIED / mandatory on the Build 18 TestFlight
- **`expo/fetch` swap** (every Supabase call): exercise **sign-in, photo upload, Generate.**
- **Share Card** (`react-native-view-shot` 4→5, 5.1.0): **Share Outfit → capture → share sheet.**
- General walkthrough: all 4 tabs + Settings. Any runtime regression at SDK 57 surfaces here first.

### Notes / decisions
- Hard rules honored: no `npm audit fix`, no `--yes`, no manual package.json edits; Edge Function + SYSTEM_PROMPT + app.config.js + eas.json + app code + ngrok + fonts all untouched. Only writes this session = docs correction (`356a301`) + this docs entry.
- Transporter upload of the IPA + TestFlight install are Grace's (not automated).
- **Merging `sdk56-upgrade` → `testing` is a SEPARATE future decision** — deferred until a Build 18 TestFlight passes on iPhone. `testing` stays frozen at `21e5db1`.
- **State at close:** `sdk56-upgrade` @ `356a301` (+ this docs commit); `testing` `21e5db1` (frozen); `main` `062d15b`; `production` `ea8f0ca` (Build 15 live). Nothing pushed.

### POST-BUILD CORRECTION — Build 18 (v1.0.2) REJECTED → Build 19 (v1.0.3) supersedes
Build 18 was DELIVERED via Transporter but **rejected at App Store Connect processing** (Transporter evidence): **90062** (CFBundleShortVersionString 1.0.2 must be higher than the already-approved 1.0.2) + **90186** (train version 1.0.2 closed for new build submissions). Root cause: Build 15 is LIVE at 1.0.2, so the 1.0.2 version train is closed — **the "version stays 1.0.2 / buildNumber: no edit possible" conclusion in the Build-18-prep section above was WRONG.** Same failure + fix as the Build 13 rejection (CLAUDE.md CURRENT BUILD STATE). Fix: bumped `version` 1.0.2 → 1.0.3 in BOTH `app.config.js` + `package.json` (commit `84a620a`, the documented two-file pattern from Build 13→14 and Session 5). **EAS Build 19 SUCCEEDED (exit 0)** at v1.0.3 / buildNumber auto 18→19; credentials + env identical to Build 18. IPA: `https://expo.dev/artifacts/eas/NFjENU6AK9p2ALDZeEG9ZNj4tcQWPgyXNxEhCekYBXA.ipa`. Build ID `1b33064c-b5b0-46b2-aaa8-a0db40557a52`. **Build 18 (1.0.2) is dead — never re-uploads; Build 19 (1.0.3) is the TestFlight candidate.** UNVERIFIED runtime list (fetch swap + Share Card) unchanged — carries to the Build 19 TestFlight. **Lesson: every new App Store submission needs a version string higher than the last SHIPPED build (train-closure rule) — check the live App Store version before concluding "version stays."** (New CLAUDE.md VERSION RULE added this session.)

### Build 19 (v1.0.3) TestFlight — VERIFIED PASS on iPhone — 2026-07-10/11
Build 19 IPA uploaded via Transporter, accepted at App Store Connect processing (v1.0.3 clears the closed 1.0.2 train), installed via TestFlight, and passed a full on-device walkthrough. **SDK 54→57 is now proven at runtime, not just compile/package level.** Verified PASS:
- **Auth:** sign-in, new account creation, and **Sign in with Apple** all work end-to-end — clears the Session 22 "Apple Sign-In UNVERIFIED on TestFlight" flag (KNOWN ISSUES item 22).
- **`expo/fetch` swap** (every Supabase call): exercised via sign-in, **photo upload**, **camera** capture, and **Generate** — the fetch swap is proven; outfits generate normally.
- **Share Card** (`react-native-view-shot` 4→5, 5.1.0): Share Outfit → capture → share sheet works — view-shot 5 proven.
- **Landing:** kill + reopen lands on Today's Vibe (as designed).
- **Navigation:** all 4 tabs + Settings walk clean, no runtime regressions.
- **Dynamic Type:** holds at the cap — no new SDK-57 layout breakage observed.
- **Overnight token refresh:** app left open overnight, returned next morning with no re-sign-in required — clears the Session 22-era "Long-sleep session refresh UNVERIFIED on TestFlight" flag (KNOWN ISSUES item 21).

Net: the entire "UNVERIFIED / mandatory on the Build 19 TestFlight" list above (fetch swap + Share Card) is now cleared, plus KNOWN ISSUES items 21 and 22. **Build 19 (v1.0.3) is the proven SDK 57 runtime baseline.** (Daily Notifications, KNOWN ISSUES item 29, was NOT part of this pass — stays UNVERIFIED.)

---

## CORRECTION — 2026-07-10 — the "Expo Go = SDK 57" claim in Sessions 6 & 7 was FALSE

Sessions 6 (reality check) and 7 (Goals + NEXT) recorded as fact: *"Grace's iPhone Expo Go = SDK 57 → Expo Go device testing becomes possible."* This was an unverified inference, disproven by Grace's App Store + Expo Go screenshots (2026-07-09): App Store Expo Go shows **Supported SDK: 54** (latest installable 54.0.2, ~9 months old, button reads "Open" — no update available); in-app Settings: Supported SDK 54, Client version 1017756. **No SDK 57 Expo Go exists in the App Store.** The npm fact (SDK 57 = latest *published* SDK) was true; the leap to "Grace's Expo Go therefore runs 57" was never checked — Expo Go's App Store release lags the npm SDK.

**Consequence:** the `sdk56-upgrade` branch CANNOT run in Expo Go on Grace's iPhone. The only device-test path is **TestFlight (Build 18)** via EAS + Transporter. The frozen `testing` branch (SDK 54) still matches Expo Go 54 → fallback intact. No commit, branch pointer, or Build-18 conclusion changes — only the stated testing path (Expo Go → TestFlight). Sessions 6 & 7 prose is left as written; this note supersedes their Expo Go claims.

---

## Update 3 — Session 7 — 2026-07-09 — SDK 56→57 upgrade — HOP 3 (SDK 56→57)

**Branch:** `sdk56-upgrade` (HEAD at session start `c799c90`). `testing` UNTOUCHED at `21e5db1`; `main` `062d15b`, `production` `ea8f0ca` (Build 15 live), all build tags — unchanged. Nothing pushed.

**Commit(s):**
- `23fc763` — "chore(sdk): hop 3 — Expo SDK 56 → 57 (expo install --fix)" — package.json + package-lock.json ONLY (explicit staging, never `-A`). +425 / −416.
- (this docs commit) — SESSION_NOTES + CLAUDE.md.

**Edge Function deploys:** 0. **Cache token count:** 2,510 (SYSTEM_PROMPT untouched).

### Goals
Execute HOP 3 (SDK 56→57) on the isolated branch, one command at a time, each Grace-approved. Land a compile-verified 57 checkpoint with its OWN separate commit. SDK 57 = latest → Expo Go device testing becomes possible next.

### Reality check at session start (read-only)
- Branch state verified: `sdk56-upgrade` @ `c799c90`/`7be9d27`; `testing` `21e5db1`, `main` `062d15b`, `production` `ea8f0ca` — no drift, tree clean (only untracked backups).
- `expo@^57.0.0` resolves to STABLE `57.0.4` (npm `latest`=`next`=57.0.4; caret excludes the `57.0.0-canary` prerelease). Node v20.20.2 (≥ SDK 56 floor 20.19.4).

### What changed (HOP 3, every command Grace-approved)
- **Step 1** `npx expo install expo@^57.0.0` → expo **57.0.4** (stable, verified no `-` prerelease tag). Forbidden pkgs untouched.
- **Step 2** `npx expo install --check` (read-only) → 15 packages to align; NO forbidden packages (ngrok ×2, 4 fonts, dotenv, supabase, async-storage, url-polyfill all absent). **`react-native-view-shot` NOT in the list** — SDK 57 happy with 5.1.0, no Share Card library bump this hop.
- **Step 3** `npx expo install --fix` → react-native **0.85.3→0.86.0**, react 19.2.3 (unchanged), all 12 expo-*/babel-preset-expo to ~57.x; view-shot 5.1.0 / svg 15.15.4 / datetimepicker 9.1.0 unchanged. Exit-1 was ONLY the deferred plugin-write (app.config.js untouched). Misplaced-package incident did NOT recur — `@types/react` + `typescript` stayed in devDependencies at old specs, no duplicate. `dotenv` untouched (direct dep).

### The divergence from the plan (benign, not a breakage)
- **Deferred plugin list SHRANK 4 → 3.** Plan (and hop 2) predicted 4; SDK 57's `--fix` lists only **`expo-sharing`, `expo-status-bar`, `expo-web-browser`** — **`@react-native-community/datetimepicker` DROPPED.** Package unchanged (9.1.0) and STILL ships its config plugin (`app.plugin.js` → `withDateTimePickerStyles`, verified on disk); SDK 57 simply no longer asks for an explicit `app.config.js` entry (auto-handled). All plugins were being deferred (none written to config) anyway → net effect is a simplification: Build-18 eval list is now 3. Memory `sdk56-deferred-plugins` corrected 4→3.

### Tests
- **Step 4** expo-doctor: **19/20** — the one failed check is ONLY the version-match check with the two accepted dev-only mismatches (`typescript` 5.9.3 vs ~6.0.3 major; `@types/react` 19.1.17 vs ~19.2.4 minor). 3 deferred plugins NOT flagged. (20 checks vs 21 at SDK 56 — check-set difference, not a concern.)
- **Step 5** iOS bundle: `npx expo export --platform ios` → clean 2.7MB Hermes `.hbc`, 923 modules, zero resolution/"cannot find module" errors. RN 0.85→0.86 proven at bundle level. `dist-hop3check/` deleted after.
- Git: `23fc763` contains only package.json + package-lock.json; `testing` pointer unchanged.
- **No device test this session** — that is the next stage, now POSSIBLE at SDK 57 (iPhone Expo Go runs latest = 57).

### UNVERIFIED / mandatory at the SDK 57 device-test stage
- **`expo/fetch` swap** (carried from hop 2, SDK 56): every Supabase call routes through it. Exercise **sign-in, photo upload, Generate.**
- **Share Card:** `react-native-view-shot` 4→5 (done hop 2, still 5.1.0). Exercise **Share Outfit → capture → share sheet.**
- All other runtime behavior at 57 — untested until iPhone.

### Notes / decisions
- Hard rules honored: no `npm audit fix` (advisory 18, ignored); no manual package.json version edits; no `--yes`; Edge Function + SYSTEM_PROMPT + app.config.js + app code + ngrok + fonts all untouched.
- **State at close:** `sdk56-upgrade` @ `23fc763` (+ this docs commit); `testing` @ `21e5db1` (frozen); `main` `062d15b`; `production` `ea8f0ca` (Build 15 live). Nothing pushed.

### NEXT — SDK 57 device testing (Grace's decision, not automatic)
Expo Go on the physical iPhone at SDK 57. MUST include the two UNVERIFIED items above (fetch swap + Share Card). Only after iPhone pass → Build 18 EAS prep: eval the 3 deferred plugins empirically, evaluate removing `import 'dotenv/config'` from app.config.js, pin eas.json build image / Xcode. testing stays frozen at `21e5db1` until a Build 18 TestFlight proves 57.

---

## Update 3 — Session 6 — 2026-07-09 — SDK 55→56 upgrade — HOP 2 (SDK 55→56)

**Branch:** `sdk56-upgrade` (HEAD at session start `6c7c728`). `testing` UNTOUCHED at `21e5db1`; `main` `062d15b`, `production` `ea8f0ca` (Build 15 live), all build tags — unchanged. Nothing pushed.

**Commit(s):**
- `7be9d27` — "chore(sdk): hop 2 — Expo SDK 55 → 56 (expo install --fix)" — package.json + package-lock.json ONLY (explicit staging, never `-A`). +799 / −2144.
- (this docs commit) — SESSION_NOTES + CLAUDE.md.

**Edge Function deploys:** 0. **Cache token count:** 2,510 (SYSTEM_PROMPT untouched).

### Goals
Execute HOP 2 (SDK 55→56) on the isolated branch, one command at a time, each Grace-approved. Land a compile-verified 56 checkpoint with its OWN separate commit. Do NOT roll into hop 3.

### Reality check at session start (read-only) — the SDK 57 finding
- **SDK 57 shipped since hop 1's plan was written.** npm `latest` = `57.0.4`, `sdk-56` = `56.0.15` (both stable). SDK 57 = RN 0.86, same React 19.2 — a small, non-breaking release over 56.
- **Consequence:** Expo Go supports the LATEST SDK only, and on a physical iPhone only the latest Expo Go is installable. Grace's iPhone Expo Go = SDK 57 → an SDK 56 project CANNOT run in it. Hop 1's assumption ("SDK 56 = latest, Expo Go CAN run it") is now FALSE.
- **Decision (Grace, Option 1):** land 56 as a compile-only checkpoint now, then a small non-breaking hop 3 → 57, and device-test in Expo Go at 57. Two conditions: (1) hop 2 gets its own separate commit before hop 3 begins; (2) hop 3 runs identical discipline, and if hop 2 has ANY surprise, hop 3 does NOT start — plan it fresh.
- Verified ready: `dotenv ^16.4.7` direct; view-shot 4.0.3; no expo-router / @react-navigation / @expo/vector-icons; Node v20.20.2 (≥ SDK 56 floor 20.19.4, verified from changelog).

### What changed (HOP 2, every command Grace-approved)
- **Step 1** `npx expo install expo@^56.0.0` → expo **56.0.15** (stable; caret correctly refused 57 + all canaries). Forbidden pkgs untouched.
- **Step 2** `npx expo install --check` (read-only) → NO forbidden packages in update list (ngrok ×2, 4 fonts, dotenv, supabase, async-storage, url-polyfill all absent). Surfaced the one item needing approval: `react-native-view-shot 4.0.3 → 5.1.0` (MAJOR — Share Card library).
- **view-shot decision (Grace-approved):** let `--fix` take it to **5.1.0**. v5 is the New-Architecture migration line (app already on New Arch); Expo SDK 56 pins exactly 5.1.0 (validated vs RN 0.85); holding 4.0.3 would be the riskier path. Share Card put on the mandatory iPhone test list.
- **Step 3** `npx expo install --fix` → react-native **0.83.6→0.85.3**, react 19.2.0→19.2.3, svg 15.15.4, datetimepicker 9.1.0, babel-preset-expo ~56.0.0, all 11 expo-* to ~56.x, view-shot **5.1.0**. Exit-1 was ONLY the deferred plugin-write (app.config.js untouched). **Hop-1 misplaced-package incident did NOT recur** — `@types/react` + `typescript` both stayed in devDependencies, no duplicate in dependencies. `dotenv` unchanged/not pruned (direct dep) — hop-1 config crash did not recur.

### The TWO divergences from hop 1's record (both benign, neither a breakage)
- **(a) Deferred plugin list grew 3 → 4.** Hop 1 recorded 3 (`@react-native-community/datetimepicker`, `expo-sharing`, `expo-web-browser`). SDK 56's `--fix` now also suggests **`expo-status-bar`** — NEW in SDK 56. All 4 remain DEFERRED to Build 18 (NOT written into app.config.js). Memory `sdk56-deferred-plugins` updated 3→4.
- **(b) expo-doctor now also flags `typescript`.** Doctor's one failed check (20/21 pass) lists **two** dev-only items: `@types/react` 19.1.17 vs ~19.2.14 (accepted, from hop 1) AND **`typescript` 5.9.3 vs ~6.0.3** (major — NEW). Both dev-only; app is plain JS → zero runtime effect. **NOT fixed** (no manual version edit; TS 6 buys nothing for a JS app). Accepted like @types/react.

### Tests
- **Step 4** expo-doctor: **20/21** (only the version-match check, containing the two accepted dev-only mismatches; the 4 deferred plugins NOT flagged).
- **Step 5** iOS bundle: `npx expo export --platform ios` → clean 2.7MB Hermes `.hbc`, zero resolution/"cannot find module" errors. RN 0.83→0.85 proven at bundle level. `dist-hop2check/` deleted after.
- Git: `7be9d27` contains only package.json + package-lock.json; `testing` pointer unchanged.
- **No device test** — impossible at SDK 56 (iPhone Expo Go = 57). Runtime testing happens at SDK 57 (after hop 3).

### UNVERIFIED / mandatory at the SDK 57 device-test stage
- **`expo/fetch` swap:** SDK 56 replaces global `fetch` with `expo/fetch` (opt-out `EXPO_PUBLIC_USE_RN_FETCH=1`, NOT applied). Every Supabase call routes through it. Exercise: **sign-in, photo upload, Generate.**
- **Share Card:** `react-native-view-shot` 4→5 major bump. Exercise: **Share Outfit → capture → share sheet.**
- All other runtime behavior at 56/57 — untested until iPhone at 57.

### Notes / decisions
- Hard rules honored: no `npm audit fix` (advisory count drifted 19→18, ignored); no manual package.json version edits; no `--yes`; Edge Function + SYSTEM_PROMPT + app.config.js + app code untouched; ngrok + fonts untouched.
- **Per Grace's condition #2, hop 3 does NOT start this session** — divergences (a)+(b) count as surprises; hop 3 planned fresh below.
- **State at close:** `sdk56-upgrade` @ `7be9d27` (+ this docs commit); `testing` @ `21e5db1` (frozen); `main` `062d15b`; `production` `ea8f0ca` (Build 15 live). Nothing pushed.

### NEXT SESSION — HOP 3 (SDK 56 → 57) — verbatim plan
Risk LOW (RN 0.85→0.86, same React 19.2 — Expo calls 57 a small non-breaking release). Command-by-command, pause after each, on `sdk56-upgrade`. Its OWN separate commit, never blended with hop 2.
0. Branch safety: confirm `sdk56-upgrade` @ `7be9d27`; `testing` `21e5db1`, `main` `062d15b`, `production` `ea8f0ca` unchanged. Any drift → STOP.
1. `npx expo install expo@^57.0.0` → verify resolved to a STABLE 57.x (no beta/canary/preview). Show + WAIT.
2. `npx expo install --check` (read-only preview) → confirm BEFORE mutating that no forbidden packages (`@expo/ngrok*`, 4 font packages) are touched; note the react-native-view-shot expected version (may bump past 5.1.0). Show + WAIT.
3. `npx expo install --fix` → align to SDK 57 pins. EXPECT the plugin-write exit-1 to recur — now expect **4** deferred plugins (datetimepicker, expo-sharing, expo-status-bar, expo-web-browser); confirm it's ONLY that. dotenv is direct (no config crash). `@types/react` + `typescript` will mismatch again → LEAVE both (accepted). If `--fix` bumps view-shot again, report the version; a change needing a separate `expo install` → show it + WAIT for YES. Any package landing in the wrong dependency section → revert immediately, don't repair in place, show. Show summary + WAIT.
4. `npx expo-doctor` → full output. Any failure OTHER than the accepted `@types/react` + `typescript` version-match items or the 4 deferred plugins → STOP and show.
5. iOS bundle compile via `npx expo export --platform ios` (delete dist/ after). "cannot find module" = pruned transitive dep → STOP, diagnose exact package + importing file, WAIT.
6. STOP before commit → `git status` (expect only package.json + package-lock.json) → propose hop-3 commit for approval. Commits to `sdk56-upgrade` only.
Then STOP + full state report. SDK 57 = latest, so Expo Go on the physical iPhone CAN run it → device testing via Expo Go is the next stage (Grace's decision, not automatic), and MUST include the two UNVERIFIED items above (fetch swap + Share Card). Only after iPhone pass → Build 18 EAS prep (eval the 4 deferred plugins empirically, evaluate removing `import 'dotenv/config'`, pin eas.json build image / Xcode 26.4). Hard stop: any error expo-doctor can't explain → STOP, no fixes without approval.

---

## Update 3 — Session 5 — 2026-07-08 — SDK 54→56 upgrade — Session 1 (reality check + HOP 1: SDK 54→55)

**Branch:** `sdk56-upgrade` (NEW, branched off `testing` at `21e5db1`). `testing` UNTOUCHED at `21e5db1`; `main` `062d15b`, `production` `ea8f0ca` (Build 15 live), both build tags — all unchanged. Nothing pushed.

**Commit(s):**
- `3a3cce9` — "chore(sdk): hop 1 — Expo SDK 54 → 55 (expo install --fix)" — package.json + package-lock.json ONLY (explicit staging, never `-A`). +1017 / −1796.
- (this docs commit) — SESSION_NOTES + CLAUDE.md.

**Edge Function deploys:** 0. **Cache token count:** 2,510 (SYSTEM_PROMPT untouched).

### Goals
Reality-check the codebase for SDK 56 blockers (read-only), then execute HOP 1 of the one-hop-at-a-time 54→55→56 upgrade on an isolated branch. testing stays clean until a Build 18 TestFlight proves 56.

### Reality check (read-only, no edits) — key findings
- No `expo-router`, no `@react-navigation/*` (manual App.js screens) → the biggest SDK 56 breaker misses us.
- No `expo-file-system` import anywhere. No `@expo/vector-icons` (not a direct dep, not imported).
- Node `nvm use 20` = v20.20.2 (≥ 20.19.4 floor ✓).
- Already on New Architecture (SDK 54 default, no opt-out) — proven by live Build 15 → SDK 55's New-Arch-only gate already satisfied.
- eas.json build image NOT pinned (EAS auto-selects Xcode 26 for SDK 56 → Liquid-Glass `UIDesignRequiresCompatibility` opt-out survives). iOS min bumps 15.1 → 16.4 (Grace approved as a business decision).
- Zero background-removal remnants (no ./modules/, no dep, no .npmrc, no autolinking block).
- expo-doctor at SDK 54 baseline: 18/18 pass.

### What changed (HOP 1, every command Grace-approved)
- `npx expo install expo@^55.0.0` → expo **55.0.27** (stable, no prerelease).
- `npx expo install --check` (preview) confirmed NO forbidden packages touched (ngrok / fonts / view-shot).
- `npx expo install --fix` → react 19.2.0, react-native 0.83.6, svg 15.15.3, datetimepicker 8.6.0, babel-preset-expo ~55.0.8, all 11 expo-* to ~55.x. `--fix` exited 1 ONLY on the dynamic-config plugin-write (expected; deferred — see below).
- **dotenv root cause + fix:** `--fix` pruned 110 pkgs incl. the *transitive* `dotenv`; `app.config.js:1 import 'dotenv/config'` then threw `Cannot find module 'dotenv/config'`, crashing all config evaluation (doctor/start/export). `expo install dotenv` deadlocked (it must read the config it can't load). FIX: `npm install dotenv@16.4.7` — the exact version present transitively under SDK 54 (v17 avoided — it prints a banner). **npm used instead of `expo install` as a justified one-off:** the deadlock made expo-install impossible, and dotenv is a pure-JS non-SDK package so the result is identical. `app.config.js` kept BYTE-IDENTICAL (Option 1).
- **@types/react detour:** doctor then flagged `@types/react` 19.1.17 vs expected ~19.2.10 (dev-only; app is JS → harmless). Attempted `npx expo install @types/react` but it wrongly added a SECOND `@types/react` to `dependencies` (~19.2.10) while the devDependencies one (~19.1.10) remained → duplicate/misplaced, npm still resolved 19.1.17. Per Rule 10 (revert, don't pile fixes) chose **Option A**: `npm pkg delete dependencies.@types/react` + `npm install` → back to clean known-good state; ACCEPT doctor 18/19 with the one cosmetic mismatch.
- **Bundle-check method:** used `npx expo export --platform ios` (full Metro compile to a 2.8MB Hermes `.hbc` bundle, deterministic pass/fail) rather than a background-dev-server bundle-URL fetch — same bundler/resolution, more robust. `dist-bundlecheck/` deleted after. Zero resolution/import errors.

### Tests
- expo-doctor: 18/19 (only the accepted `@types/react` dev-only mismatch; the 3 deferred plugins NOT flagged).
- iOS bundle: fully compiled, zero resolution/import errors.
- No device test at SDK 55 (Expo Go runs latest SDK only = 56) — accepted transient checkpoint; real device testing happens after HOP 2.
- Git: only package.json + package-lock.json in `3a3cce9`; `testing` pointer unchanged.

### UNVERIFIED / open questions
- Everything runtime at SDK 55/56 — no iPhone test yet. Full app regression happens on iPhone at SDK 56 (after HOP 2), then a Build 18 TestFlight before any merge to testing.

### Deferred to Build 18 EAS prep (logged to memory: sdk56-deferred-plugins)
- 3 config plugins recommended by SDK 55 `--fix`, deliberately NOT added: `@react-native-community/datetimepicker`, `expo-sharing`, `expo-web-browser`. Rationale: web-browser skipped since Session 14A (openBrowserAsync only), datetimepicker is time-mode not calendar-mode, sharing needs no plugin, and Build 15 shipped with none. Evaluate empirically at Build 18.
- `import 'dotenv/config'` in app.config.js is likely REDUNDANT (Expo native .env loading covers the EXPO_PUBLIC_ vars app.config.js reads). Evaluate REMOVING it at Build 18 as a separate deliberate change — never bundled with the upgrade.
- `react-native-view-shot@4.0.3` New-Arch compat to verify at HOP 2 (Step 3 addition b).

### Notes / decisions
- Hard rules honored: no `npm audit fix` (advisory count drifted 16→19→18, ignored); no manual package.json version edits (all via `expo install` / `npm install` / `npm pkg` — the dotenv npm exception justified above); no `--yes`; Edge Function + SYSTEM_PROMPT untouched; `@expo/ngrok*` + font packages untouched.
- **State at close:** `sdk56-upgrade` @ `3a3cce9` (+ this docs commit); `testing` @ `21e5db1` (frozen); `main` `062d15b`; `production` `ea8f0ca` (Build 15 live). Nothing pushed.

### NEXT SESSION — HOP 2 (SDK 55 → 56) — verbatim plan
Risk MEDIUM (RN 0.83→0.85, React 19.2, Hermes v1 default). Command-by-command, pause after each, on `sdk56-upgrade`:
1. `npx expo install expo@^56.0.0` → verify resolved to a STABLE 56.x (no beta/canary/preview).
2. `npx expo install --check` (read-only preview) → confirm BEFORE mutating that no forbidden packages (`@expo/ngrok*`, 4 font packages) are touched; note the `react-native-view-shot` expected version.
3. `npx expo install --fix` → align to SDK 56 pins. EXPECT the plugin-write exit-1 to recur (known/deferred — confirm it's ONLY that, then continue). dotenv is now a direct dep so the hop-1 config crash will NOT recur. `@types/react` will likely mismatch again → leave it (accepted). react-native-view-shot: report whether `--fix` bumped it; if not and SDK 56 wants newer, SHOW the proposed `npx expo install react-native-view-shot` + target version and WAIT for YES before running it.
4. `npx expo-doctor` → full output. Any failure OTHER than the accepted `@types/react` or the 3 deferred plugins → STOP and show Grace.
5. iOS bundle compile via `npx expo export --platform ios` (delete dist/ after).
6. STOP before commit → show `git status` (expect only package.json + package-lock.json) → propose hop-2 commit for approval.
Then STOP + full state report for iPhone testing via Expo Go (SDK 56 = latest, so Expo Go CAN run it) BEFORE discussing Build 18. Hard stop: any error expo-doctor can't explain → STOP, no fixes without approval.

---

## Update 3 — Session 4 — 2026-07-06 — Cleanup: remove Background Removal leftovers + verify identical to Build 15 + Build-15 tag ritual

**Branch:** testing (HEAD at session start: `7fdb14d`; two cleanup commits below, then this docs commit). `production` fast-forwarded to `ea8f0ca`.

**Commit(s):**
- `1f1c380` — "Cleanup: remove Background Removal Strike-1 test surface from App.js" — reverses the exact 8 App.js hunks (ActivityIndicator + BackgroundRemoval imports, SettingsScreen `isVip` prop + drill, VIP-gated DEVELOPER card, test modal, state/handlers, `testModalStyles`). App.js only, 1 ins / 312 del.
- `3c059c6` — "Cleanup: remove expo-background-removal dependency" — `npm uninstall expo-background-removal` (no npm audit fix). package.json + package-lock.json, 11 del.
- (this docs commit) — SESSION_NOTES + CLAUDE.md.

**Edge Function deploys:** 0. **Cache token count:** 2,510 (unchanged — SYSTEM_PROMPT not touched).

### Goals
Remove the two shelved-feature leftovers (App.js test surface + npm dependency), prove app code is byte-identical to Build 15, then perform the now-due Build-15 tag ritual.

### What changed (every phase Grace-approved individually)
- **Ordering: App.js first, dependency second** — so nothing ever imported a missing package.
- **App.js removal** — reversed the exact 8-hunk delta computed via `git diff v1.0.2-build15-submitted..HEAD -- App.js` (ground truth, not prose). Hand-edited today's App.js only — never checked out from any branch. Per-hunk Dynamic Type protection grep (`ClozieText|ClozieTextInput|maxFontSizeMultiplier|dontScale`) = zero matches. `node --check` passed. Expo Go smoke test (Grace, iPhone): boots clean, sign-in, all 4 tabs, Settings scrolls with NO DEVELOPER card, generate end-to-end — all pass.
- **Dependency removal** — `npm uninstall` touched ONLY the two `expo-background-removal` blocks; no other packages/hashes/ordering changed (16→20 audit count is advisory-DB drift, not a tree change; `npm audit fix` never run).
- **Identity proof** — `git diff v1.0.2-build15-submitted..HEAD` for App.js + package.json + app.config.js + eas.json = **completely empty** (byte-identical to Build 15). App.js line count 11348 = Build 15's 11348 (was 11659). package-lock.json diff = ONLY `version 1.0.0 → 1.0.2` (harmless — Build 15's lockfile was stale at 1.0.0 while its package.json already declared 1.0.2). Full `--stat` vs Build 15: only `.gitignore` + `CLAUDE.md` + `SESSION_NOTES.md` (docs) + `package-lock.json` (version).
- **Build-15 release ritual** (matching the Build 14 pattern): annotated tag `v1.0.2-build15-appstore-live` (tag-object `09b5ad1`) on `ea8f0ca`, pushed; `production` fast-forwarded `01c1d0f` → `ea8f0ca` via `--ff-only` (through the 12 Update 2 Session 1–5 commits), pushed. Returned to testing.

### Tests
- App.js identity vs Build 15: empty diff. `node --check` passed. Dynamic Type grep clean.
- Expo Go end-to-end (Grace): pass.
- Ritual: `production` == `ea8f0ca` == Build 15 commit; both build15 tags deref to `ea8f0ca`.

### UNVERIFIED / open questions
None new. Background Removal remains SHELVED (Update 3 — Session 3); future path = inline module on the SDK 56 upgrade.

### Notes / decisions
- **npm KEEP recorded:** `expo-background-removal@0.1.0` stays PUBLISHED on npm (Grace's call). The ~July 8 free-unpublish window is allowed to lapse — harmless; package.json no longer references it, so keeping it published breaks nothing.
- **Both Session-3 open items now CLOSED:** (a) App.js test surface + dependency removed; (b) keep-vs-unpublish decided (KEEP).
- **State at close:** testing @ `3c059c6` (+ this docs commit); production @ `ea8f0ca` (Build 15); main `062d15b` untouched; tags `v1.0.2-build15-appstore-live` (new) + `v1.0.2-build15-submitted` both → `ea8f0ca`; live App Store build = Build 15 (v1.0.2).

---

## Update 3 — Session 3 — 2026-07-06 — Background Removal STRIKE 2 (Build 17) — FAILED — feature SHELVED per two-strike rule

**Branch:** testing (HEAD at session start: `01a9b38`; HEAD at session end: `127aee2` + this docs commit, pushed to origin/testing).

**Commit(s):** Two code commits on testing, both pushed, plus this docs commit:
- `1e4b0ea` — "Background Removal Strike 2: opt back into node_modules searchPaths autolinking (package.json)" — the Phase-3b-proven `"expo": { "autolinking": { "searchPaths": ["./node_modules"] } }` block, 5 insertions, package.json only.
- `127aee2` — Revert of `1e4b0ea` via `git revert` as a NEW commit (never reset, never amend), after the strike-gate failed. package.json byte-identical to pre-Strike-2 state.

**Edge Function deploys:** 0.
**Cache token count:** 2,510 (unchanged — SYSTEM_PROMPT not touched).
**App Store impact:** Zero. Build 15 (v1.0.2) is the live App Store build (Apple-approved and released — review gate from Session 2's RESUME BLOCK cleared before this session). Build 17 was NOT uploaded anywhere.

### Goals
- Spend the one remaining strike: apply the searchPaths fix, run EAS Build 17, check the three-check strike gate.

### What changed (all phases Grace-approved individually)
- **Phase 0/1** — all safety checks passed; buildNumber confirmed remote + autoIncrement (eas.json `appVersionSource: "remote"`, preview `ios.autoIncrement: true`); App.js integration from `3f45855` confirmed intact by reading.
- **Phase 2** — fix applied (5-line diff above), JSON validated.
- **Phase 3 local proof on the committed state** — resolver (exact EAS command): 19 modules incl. ours (pod `ExpoBackgroundRemoval`), ZERO duplicates; `verify -v`: **"Found 21 modules in search paths"** (ours listed) + "Found 3 modules in dependencies" + "Everything is fine!" — byte-exact match with Session 2's Phase 3b. (Transient scare resolved: running verify with `--platform apple` lists 17 expo-only modules; without the flag it lists 21 incl. the 4 RN native libs — same tree, different listing scope. Disk truth: exactly 19 expo-module.config.json files anywhere in node_modules, all discovered.)
- **Phase 4** — commit `1e4b0ea` pushed to origin/testing.
- **Phase 5** — Build 17 triggered with the exact Strike-1 command (`eas build --profile preview --platform ios --non-interactive`). buildNumber auto-incremented 16 → 17 as predicted. Build ID `6fd1cca5-a12c-4380-9fdf-ff5df75ede23`, commit `1e4b0ea`, fingerprint computed, build FINISHED clean (~6 min), IPA produced.
- **Phase 6 — STRIKE GATE: FAILED.** Logs fetched via pre-signed URLs (15-min expiry) and preserved in `build17_logs/` (untracked, same convention as `build16_logs/`; worker.log 1,053 lines + xcode.log 39,791 lines, brotli-decoded).
  - **CHECK A — ❌ FAIL (the strike gate):** `grep "Installing ExpoBackgroundRemoval" worker.log` → zero occurrences (exit 1). Total "Installing " pod lines: **93** (identical to Build 16; a pass would have been ~94). Alphabetical neighborhood shows the gap directly: line 296 `"Installing ExpoAppleAuthentication (8.0.8)"` → line 297 `"Installing ExpoAsset (12.0.13)"`, both phase INSTALL_PODS. Byte-for-byte the Build 16 / Session 24A Builds 8–11 failure signature.
  - **CHECK B — ✅ PASS:** `grep -c "duplicates for expo-background-removal" worker.log` → 0. No duplicate-detection regression from searchPaths.
  - **CHECK C — ✅ PASS:** expo-doctor ran (line 119, phase RUN_EXPO_DOCTOR) and passed 18/18 checks, same as Build 16.
  - **Key diagnostic fact:** worker.log line 87 (phase READ_PACKAGE_JSON) shows the EAS worker received our committed package.json **with the searchPaths block intact, verbatim**. The fix was delivered to the worker and still did not take effect at the pod-install stage. npm install on the worker: "added 730 packages, and audited 731 packages in 7s" (INSTALL_DEPENDENCIES, line 98).
- **Post-gate (Grace-approved):** revert commit `127aee2` pushed. FULL STOP honored — no upload, no retry, no fix-piling, no source-code investigation beyond the gate greps (one investigation thread into how relative searchPaths resolve against cwd was started and STOPPED on Grace's order before completion — recorded here as unfinished, not as a finding).

### Tests
- Phase 3 local proof: resolver + verify -v on the committed fix — all pass (see above).
- Phase 6 strike gate: CHECK A FAIL / CHECK B PASS / CHECK C PASS → gate FAILED.

### UNVERIFIED / open questions
- WHY the search-path directory scan found the module locally but not on the EAS worker remains undiagnosed. Untested-locally combination flagged during the session: EAS's pod-install runs from cwd=`ios/`; whether the relative `"./node_modules"` search path resolves against cwd (→ `ios/node_modules`, which doesn't exist) rather than project root was NOT verified (investigation stopped per two-strike rule). Recorded as a hypothesis only, for whoever revisits this on SDK 56.

### Notes / decisions
- **SHELVED: Background Removal Plan A (npm-published expo-background-removal module) — two-strike rule invoked 2026-07-06.** Both strikes spent (Build 16 = Strike 1, Build 17 = Strike 2). Same silent autolinking-drop signature across Builds 8–11, 16, 17.
- **Future path = SDK 56:** revisit as an inline local module when the coordinated Expo SDK 54 → 56 upgrade session happens (SDK 55+ also has the `include` autolinking option that was rejected as SDK-55-only this round).
- **TWO OPEN ITEMS from the shelving:**
  - **(a) Remove the App.js background-removal test surface + the `expo-background-removal: ~0.1.0` dependency BEFORE the next App Store build.** App.js still contains the VIP-gated Settings DEVELOPER test surface + `expo-background-removal` import from `3f45855`; package.json still carries the dependency. Harmless in Expo Go and in builds (module simply never links), but must not ship in a store submission. Deliberately NOT removed tonight.
  - **(b) Decide keep-vs-unpublish for `expo-background-removal@0.1.0` on npm.** The free unpublish window closes ~July 8, 2026 (72h after the 2026-07-05 publish). Do NOT unpublish while package.json still references the package — item (a) must land first if unpublishing, or npm installs break. If the window lapses, keeping it published is harmless (it's a working, non-sensitive module).
- `build17_logs/` preserved locally, untracked (worker.log, xcode.log, raw .br originals via urls.txt). Build 17 IPA artifact exists on EAS but was never uploaded to TestFlight/App Store.
- State at close: testing @ `127aee2` (+ this docs commit); production `01c1d0f`; main `062d15b`; tags untouched; live App Store build = Build 15 (v1.0.2).

---

## Update 3 — Session 2 — 2026-07-06 — Background Removal Strike-2 local diagnostic (zero builds, zero code changes)

**Branch:** testing (HEAD `5f8c483` at session start AND end — the Session 1 docs commit; zero code commits this session).

**Commit(s):** One documentation-only commit (SESSION_NOTES.md + CLAUDE.md pointer — this entry). No code committed. No pushes to production/main. No tags.

**Edge Function deploys:** 0.
**Cache token count:** 2,510 (unchanged — SYSTEM_PROMPT not touched).
**App Store impact:** Zero. Build 15 (v1.0.2) remains in Apple review, untouched. **No EAS build spent — Strike 2 still available.**

### Goals
- Reproduce the EAS Build 16 autolinking failure locally for FREE, to test the `searchPaths` hypothesis (expo/expo#40323) without spending the last strike.
- Hard rules honored: no fix applied (beyond one Grace-authorized reverted-in-a-minute local experiment), no EAS builds, no CocoaPods/Homebrew installs, no commits until this authorized docs commit.

### What changed (evidence chain — all phases Grace-approved individually)
- **Phase 0** — two starter mismatches surfaced and accepted: HEAD is `5f8c483` not `3f45855` (one docs-only commit ahead — starter error), and 12 pre-existing untracked files (no modified tracked files). production `01c1d0f` / main `062d15b` / tag `v1.0.2-build15-submitted` → `ea8f0ca` all correct.
- **Phase 1 baseline** — module intact in node_modules (expo-module.config.json `platforms: ["apple"]` + ios/ExpoBackgroundRemoval.podspec). Exact EAS resolver command → 19 modules incl. ours. `verify` subcommand EXISTS in autolinking 3.0.26: "Found 24 modules in dependencies", ours at node_modules/expo-background-removal, "Everything is fine!".
- **Phase 1 source read** (resolution.js / utils.js / CachedDependenciesLinker.js / autolinkingOptions.js / findModules.js) — four findings:
  - **(A)** Graph-walk drops are SILENT by design: each dependency name is checked with `fs.realpath`; any failure → skipped with no warning/error. Matches EAS's no-error signature exactly.
  - **(B)** Only OUR module vanished on EAS while 18 Expo modules survived → the walk ran fine there; our package was either absent on disk or realpath-dropped.
  - **(C)** package-lock.json (v3) pins the module to exact path `node_modules/expo-background-removal` (normal registry entry, integrity verified) → `npm ci` must place it correctly → lowered repro odds, honestly flagged in advance.
  - **(D)** The `searchPaths` fix is ADDITIVE: directory scan merges WITH the graph walk; same-path double-discovery merges cleanly (duplicates recorded only when paths DIFFER — Build 11's `./modules` copy is gone). **The fix cannot break the 18 working modules.**
- **Phase 2 prebuild repro** — `npx expo prebuild --clean --platform ios --no-install`. Generated Podfile uses `use_expo_modules!` with NO arguments — no per-pod lines (greps structurally meaningless, as predicted); NO search paths anywhere in Podfile or Podfile.properties.json (options come solely from package.json `expo.autolinking`). Post-prebuild resolver: 19 incl. ours with full pod metadata. Also mimicked EAS's exact pod-install context (cwd=`ios/`, no `--project-root`): 19 incl. ours. verify passes. Drift: package.json scripts only (2 lines, `expo start --android/--ios` → `expo run:android/run:ios`). `ios/`+`android/` confirmed gitignored (.gitignore:13-14). **NO REPRO.**
- **Phase 3 npm ci clean-room** (after confirming no Metro/Expo process, port 8081 free) — `rm -rf node_modules` + `npm ci --include=dev` (exit 0; `npm audit fix` NOT run per locked rule). Module on disk; resolver from project root AND from ios/ cwd: 19 incl. ours; verify passes. **NO REPRO.**
- **Phase 3b (Grace-authorized, repurposed as harmlessness proof)** — temporarily added `"expo": { "autolinking": { "searchPaths": ["./node_modules"] } }` to package.json (md5-verified scratchpad backup first). Resolver: exactly 19 modules, ZERO duplicate entries (checked programmatically per module). **KEY EVIDENCE:** `verify -v` flipped from "Found 24 modules in dependencies" to **"Found 21 modules in search paths"** (ours listed) + "Found 3 modules in dependencies" (the 3 nested at node_modules/expo/node_modules — expo-asset / expo-file-system / expo-keep-awake — which a top-level scan correctly can't see; merge handled cleanly). The bypass mechanism observed working locally. Reverted immediately; md5 byte-identical to backup; git diff showed only the 2-line prebuild drift.
- **Phase 4 cleanup** — `rm -rf ios/` (android/ never created); `git checkout -- package.json`. Final proof: clean tracked-file status, HEAD `5f8c483`, no ios/ or android/, resolver still 19 incl. ours on fully restored state.

### Tests
- Resolver (exact EAS command): 4 contexts (baseline, post-prebuild, ios/-cwd EAS-style, npm-ci clean-room) — module found in ALL.
- `verify -v`: baseline, post-prebuild, npm-ci, and searchPaths-active — passed in ALL, zero warnings.
- searchPaths experiment: 19 modules, zero duplicates, bypass mechanism confirmed, revert proven by md5 + git diff.

### UNVERIFIED
- The actual EAS worker pod-install behavior — unreproducible locally without CocoaPods (deliberately not installed). By elimination, the failure is confined to that stage on the EAS worker (its env/PATH/Node context inside the CocoaPods Ruby process).
- Whether searchPaths fixes Build 17 — **assessed 70–80%**: signature match with expo/expo#40323 + the fix bypasses the failing graph walk entirely via a directory scan observed working locally + module provably on the EAS disk (npm package counts include it). Residual 20–30%: module genuinely absent from the EAS disk, or an unknown Ruby-side cause.

### Notes / RESUME BLOCK
- **Strike 2 status: EVIDENCE-COMPLETE, awaiting Grace's go.** The move when authorized: add the exact `expo.autolinking.searchPaths: ["./node_modules"]` block tested today to root package.json, commit, one EAS preview build (Build 17), same strike-gate (`Installing ExpoBackgroundRemoval` in the pod install log). No republish of expo-background-removal@0.1.0 needed; App.js untouched.
- Check Build 15's Apple review status BEFORE spending Strike 2 — a rejection hotfix takes priority.
- node_modules is now npm-ci-built (functionally identical — strictly lockfile-driven; Expo Go unaffected).
- State at close: testing @ `5f8c483` (+ this docs commit); production `01c1d0f`; main `062d15b`; tag `v1.0.2-build15-submitted` → `ea8f0ca`.

---

## Update 3 — Session 1 — 2026-07-05 — Background Removal (Plan A: npm publish) — STRIKE 1 of 2 on module registration

**Branch:** testing (HEAD at session start: `ea8f0ca` = Update 2 — Session 5 end; HEAD at session end: `3f45855`, pushed to origin/testing).

**Commit(s):** Two commits on testing, both pushed to origin/testing:
- `af1ee17` — "Background Removal: publish expo-background-removal@0.1.0 + wire root dep" (`.gitignore` + `package.json` + `package-lock.json`, 13 insertions / 2 deletions)
- `3f45855` — "Background Removal: wire VIP-gated Settings DEVELOPER test surface (App.js)" (App.js only, 312 insertions / 1 deletion)

Plus one annotated tag pushed: `v1.0.2-build15-submitted` on `ea8f0ca` (Build 15's commit, verified via EAS API `gitCommitHash` field — not `d5df5b2` as brief initially assumed, one docs commit newer). Anchor for Build 15 hotfix fallback while Apple review is pending.

**Edge Function deploys:** 0.
**Cache token count:** 2,510 (unchanged — SYSTEM_PROMPT not touched).
**App Store impact:** Zero this session. Build 15 (v1.0.2) remains in Apple review — untouched by this work. Background removal will ship in Update 3 (v1.0.3) IF strike-2 clears next session; otherwise shelved and Update 3 ships without it.

### Goals
- Tag Build 15 for hotfix fallback while Apple review is pending.
- Ship Session 24A's shelved Apple Vision background removal via Plan A: publish local module to npm so EAS Build's autolinking finds it via `node_modules/` like every other Expo module (Session 24A Builds 8-11 failed because local `./modules/` modules aren't reliably discovered on EAS in SDK 54).
- Faithfully re-implement the shelved App.js integration (VIP-gated DEVELOPER test surface in Settings) on TODAY's App.js — reference-read only from `session-24a-shelved`, never checkout/cherry-pick App.js (which predates ~700 lines of intervening Update 1+2 work including ClozieText/ClozieTextInput wrapper at ~389 call sites + nested-Text logo fixes).
- One EAS preview build. Strike-gate on `Installing ExpoBackgroundRemoval` in pod install log + expo-doctor no-duplicate-error. Transporter-upload only if gate passes. Two-strike rule.

### What changed
- **Build 15 tag** — `git tag -a v1.0.2-build15-submitted ea8f0ca` + push. Tag object SHA `c95a2ac5` on origin, dereferences to commit `ea8f0ca`. Matches Build 14 pattern (`8f0a104` → `01c1d0f`) from Session 5.
- **PART 1 reality check** — `session-24a-shelved` branch (tip `2084032`) recovered as READ-ONLY reference. Current tree clean of BR residue (no `modules/`, no `.npmrc`, no `expo-background-removal` in package.json, no BackgroundRemoval hits in App.js grep). `npm view expo-background-removal` → E404 (name free). `npm whoami` = `clozie`.
- **PART 2 module recovery** — `git checkout session-24a-shelved -- <12 files>`: `.gitignore` + 11 module files. Deliberately SKIPPED App.js (trap avoidance) and `.npmrc` (would be removed in PART 5, cleaner to skip). 196 insertions, 1 deletion staged. App.js / root package.json / package-lock.json UNCHANGED throughout.
- **PART 3 — 6 module edits** each diff-first, iPhone-approvable, Swift `Name("BackgroundRemoval")` runtime bridge UNTOUCHED (verified explicitly at Swift file line 7):
  1. package.json: remove `"private": true` + drop trailing comma on `"license"`
  2. podspec: `s.name = 'BackgroundRemoval'` → `'ExpoBackgroundRemoval'` + `git mv` file rename to `ExpoBackgroundRemoval.podspec`
  3. package.json: add `"types": "src/BackgroundRemovalModule.ts"` after `"main"`
  4. package.json: add `"peerDependencies": { "expo": "*" }` block
  5. expo-module.config.json: drop `"android"` block + change `platforms: ["apple", "android"]` → `["apple"]`
  6. podspec: add `s.swift_version = '5.9'` between `s.platforms` block and `s.source`
  
  `android/` directory left as-is per Grace's call (faithful recovery; harmless ~2KB in tarball).
- **PART 4 shape check + publish** — `npx expo-modules-autolinking resolve -p ios` returned 19 modules including `expo-background-removal` with pod `ExpoBackgroundRemoval` and podspecDir `modules/expo-background-removal/ios/`. `npm pack --dry-run` → 11-file tarball, 3.2kB compressed / 6.5kB unpacked, no sensitive files. Grace ran `npm publish --access public` from Terminal: `+ expo-background-removal@0.1.0`. Verified via `npm view`: SHA `a1aea3e87e5614e1eaeecde0c27e36e0e34eca76` byte-for-byte matches dry-run.
- **PART 5 cleanup + commit** (5 substeps):
  - 5.1 Root package.json: added `"expo-background-removal": "~0.1.0"` at line 23 (alphabetical, `~` matches Expo dep convention)
  - 5.2 `git rm -rf modules/expo-background-removal/` + `rmdir modules/` — initial `-r` failed (staged files needed `-f` confirmation), retried with `-rf`. Files gone; from HEAD's perspective they never existed.
  - 5.3 `npm install`: `added 1 package, and audited 731 packages in 5s` (clean signal — no unrelated drift). Vulnerability count 15 → 20 (+5 from unrelated transitive deps, NOT from our zero-dep package). NOT running `npm audit fix` per SDK 54 Known Issue. Lockfile integrity `sha512-S2rDiCE/...` matches `npm view` exactly.
  - 5.4 Re-ran shape check: `podspecDir` now points at `node_modules/expo-background-removal/ios/`. Exactly ONE entry, no duplicates.
  - 5.5 **DEFERRED** (not cancelled): Local `expo prebuild --clean` + `pod install --dry-run` — Grace's decision rule: `pod --version` returned "command not found" (CocoaPods absent). Installing just for a weak gate added Homebrew + Ruby + gem install failure surface for minimal confidence gain. Skipped in favor of the real EAS strike-gate.
  - 5.6 Commit `af1ee17`: `.gitignore` reverted to HEAD pre-PART-2 state (Grace's call for cleanest end state), `package.json` +1 line, `package-lock.json` +12/-2.
- **App.js re-implementation** (8 hunks between PART 5 commit and EAS build). Each hunk diff-first, iPhone-approvable, **strict Dynamic Type protection check after every single hunk** (`^[+-].*(ClozieText|ClozieTextInput|maxFontSizeMultiplier|dontScale)` grep — zero matches, every time):
  1. `ActivityIndicator` added to react-native destructure (line 21) — +1
  2. `import BackgroundRemoval from 'expo-background-removal'` (registry path — the SOLE intentional deviation from faithful recovery) at line 44 — +1
  3. `SettingsScreen({ ..., isVip })` prop destructure at line 5967 — ±1
  4. 5 useState hooks + `openTestModal` + `closeTestModal` + `handlePickTestPhoto` after `signOutError` state — +63
  5. VIP-gated DEVELOPER card JSX (Test Background Removal row + gold Test link) after LEGAL card, before Sign Out error — +19 (reuses `settingsStyles` — zero new styles)
  6. Test modal JSX (idle/picking/processing/done/unavailable states + picker + Original preview + APPLE VISION preview) inside SettingsScreen after last existing Modal — +87
  7. `isVip={isVip}` drilled to `<SettingsScreen>` render at line 8231 — +1
  8. `testModalStyles` StyleSheet 21 entries after `consentStyles` at line 11522 — +139 (locked palette, Apple HIG 4.5:1 contrast)
  
  Net App.js diff +312/-1. `node --check App.js` passes.
- **Expo Go smoke test (Grace on iPhone) — PASSED**: app boots clean, VIP sign-in works, Settings scroll shows DEVELOPER card with correct copy, Test modal opens with picker + Original preview, APPLE VISION section correctly shows "Background removal not available on this device" fallback panel (expected in Expo Go — no native binary; `requireOptionalNativeModule('BackgroundRemoval')` returns null → `status='unavailable'`). Regression checks clean. Non-VIP path: card correctly hidden.
- **Commit `3f45855`** (App.js only, +312/-1). Both commits pushed to `origin/testing`. `production` (`01c1d0f`) + `main` (`062d15b`) + all 4 anchor tags UNTOUCHED.
- **PART 6 — EAS Build 16 (v1.0.2, preview profile) — STRIKE 1**:
  - Preflight: `eas whoami` = clozie, Build 15 FINISHED, HEAD `3f45855`, clean tree, correct branch — all ✓.
  - `eas build --profile preview --platform ios --non-interactive`: buildNumber 15 → 16 auto-increment, credentials valid through June 2027, 9.8 MB tarball in 2s, `Build finished` ~5 min. IPA URL `https://expo.dev/artifacts/eas/Luyk1KsN9cqRoFgfWfNqxZCBjWce4W9DJsjpeWE2Fos.ipa`. Build ID `dd6e0cd3-6897-4e58-8876-559b308e8ab0`. Fingerprint changed vs Build 15 (`d7e0904756413fde...` vs `834256930b3c7677...`) — proves EAS saw our new commit.
  - **Strike-gate on decoded worker log (1062 lines) + xcode log (38841 lines):**
    - **Check A** (`grep "Installing ExpoBackgroundRemoval"`) → **ZERO HITS.** Alphabetical position would have been between `Installing ExpoAppleAuthentication (8.0.8)` (L305) and `Installing ExpoAsset (12.0.13)` (L306) among 93 total `Installing X` lines. Absent.
    - **Check B** (`grep "duplicates for expo-background-removal"`) → zero. NOT the Build 11 duplicate-detection pattern.
    - expo-doctor L121: `18/18 checks passed. No issues detected!`
  - Same failure signature as Session 24A Builds 8-11: module IS in root package.json (L87 READ_PACKAGE_JSON dump), IS in the tarball on the EAS builder disk (npm ci L90, npm install L142 says "up to date, audited 731 packages"), but NEVER appears in `Installing X` list from `use_expo_modules!` macro.

### Deep investigation before invoking two-strike rule
- **Local reproduction of EAS's exact autolinker command**: `node --no-warnings --eval "require('expo/bin/autolinking')" expo-modules-autolinking resolve --platform apple --project-root . --json` (extracted from `node_modules/expo-modules-autolinking/scripts/ios/autolinking_manager.rb`) — locally returns 19 modules INCLUDING `expo-background-removal` with pod name `ExpoBackgroundRemoval`. Same command, same code, same expo-modules-autolinking@3.0.26. EAS Build's cloud pipeline behavior diverges from local for reasons NOT YET DIAGNOSED.
- **L139 "Updated package.json" red flag CHASED — resolved as red herring.** Source: `node_modules/expo/node_modules/@expo/cli/build/src/prebuild/updatePackageJson.js` (`updatePackageJSONAsync` → `modifyPackageJson` → `updatePkgDependencies`). Only ADDS from template (scripts + missing deps like `expo`/`react-native`, both already present). Never REMOVES or FILTERS user deps. Cannot be the cause.
- **Autolinker filter is NOT the cause.** `defaultShouldIncludeDependency` at `node_modules/expo-modules-autolinking/build/dependencies/utils.js:16` excludes `@babel/*`, `@types/*`, `@eslint/*`, `@typescript-eslint/*`, `@testing-library/*`, `@aws-*`, and specific CLI/config packages. `expo-background-removal` is not on that list.
- **Not a stale-cache issue.** RESTORE_CACHE phase took 0ms (L159-160) — no cache hit. Fingerprint changed cleanly.

### Tests
- Local Expo Go smoke test on iPhone — PASSED.
- EAS Build 16 pod install log analysis — Check A FAILED, Check B PASSED, expo-doctor PASSED. Net: STRIKE 1 of 2 spent.
- No Transporter upload attempted (per two-strike rule — no point uploading a build that failed the strike-gate).
- `git diff v1.0.2-build15-submitted..HEAD -- App.js` = exactly the 312-line integration (no other drift).

### UNVERIFIED
- **Whether the SDK 54 autolinking graph-walk change is the root cause.** New input from Grace's planning chat: SDK 54 changed autolinking discovery from `node_modules/` directory scanning (SDK ≤53 default) to dependency-graph traversal from the app's `package.json`. Documented at `docs.expo.dev/modules/autolinking` — "Before SDK 54, this list defaulted to your app's node_modules directory". Opt-back exists via `expo.autolinking.searchPaths: ["./node_modules"]` in `package.json` (verified as valid SDK 54 option in `node_modules/expo-modules-autolinking/build/commands/autolinkingOptions.d.ts` lines 15 + 37). The `include` option is SDK 55+ only — REJECTED.
- **Whether local `expo prebuild --no-install` reproduces EAS's Podfile.** Not run this session (5.5 deferred). Recommended next-session diagnostic: `npx expo prebuild --clean --platform ios --no-install` + `grep "pod 'ExpoBackgroundRemoval'" ios/Podfile` — if generated Podfile locally OMITS our module (matching EAS behavior), we've reproduced the failure locally and can bisect without another EAS build slot.
- **Native module registration on standalone IPA.** By definition unverifiable this session because Build 16 has no pod for our module. Even if Transporter-uploaded, `requireOptionalNativeModule('BackgroundRemoval')` returns null → `status='unavailable'` panel → indistinguishable from Expo Go's fallback → no signal.

### EAS worker environment (captured from build16_logs/worker.log for reproducibility)
- macOS Sequoia 15.6 + Xcode 26.0 (L73 `builderEnvironment.image: "macos-sequoia-15.6-xcode-26.0"`)
- Node.js 20.19.4 (L7)
- npm 10.9.3 (L11)
- pnpm 10.16.1 (L10, unused — we use npm)
- expo-modules-autolinking 3.0.26 (same as local)
- Two-phase install: `npm ci --include=dev` in INSTALL_DEPENDENCIES (L90), then `npm install --include=dev` again in PREBUILD (L142, reports "up to date")

### RESUME BLOCK — read this first next session
- **Strike 1 of 2 spent.** Build 16 (v1.0.2, preview) IPA at `https://expo.dev/artifacts/eas/Luyk1KsN9cqRoFgfWfNqxZCBjWce4W9DJsjpeWE2Fos.ipa` — NEVER uploaded to Transporter (module doesn't register — no point).
- **Candidate Strike 2** = add `expo.autolinking.searchPaths: ["./node_modules"]` block to root `package.json`. Bump `expo-background-removal` to 0.1.1 is optional; the searchPaths change alone doesn't require re-publish. Run one EAS build, same strike-gate check. `include` option = SDK 55+ only, REJECTED.
- **Next session first step: local repro via `npx expo prebuild --clean --platform ios --no-install`**, then re-run the exact autolinker command from a state that matches EAS Build's context. If the generated `ios/Podfile` locally OMITS our module, we've reproduced the failure — investigate WHY the graph walk misses our node without another EAS build slot spent.
- **Decision point after local repro:** either take Strike 2 with `searchPaths` opt-back (if hypothesis confirmed) OR shelve Plan A entirely (invoke two-strike rule early). Grace calls this shot.
- **State to check first:**
  - `git branch --show-current` = testing
  - `git rev-parse HEAD` = `3f45855`
  - `git rev-parse production` = `01c1d0f` (Build 14, unchanged)
  - Anchor tag `v1.0.2-build15-submitted` on `ea8f0ca` (Build 15 restore)
  - `expo-background-removal@0.1.0` on npm (permanent; 72h unpublish window closed by then)
  - Build 15 (v1.0.2) status in App Store Connect (approved / in review / rejected). If rejected, hotfix takes priority over background removal.
- **Raw EAS logs preserved:** `~/Desktop/Clozie\ Native/build16_logs/` (gitignored via `build*_logs/` in `.gitignore`).

### Notes
- Two mid-session honest recalibrations: (1) "PART 5 step 1 = swap file: dep" was wrong — we never wired a `file:` dep in root package.json, so Step 5.1 was ADDING the registry dep fresh, not swapping. (2) Session 24A findings claimed "85% confidence" Plan A would fix autolinking discovery — that estimate was overconfident and I underweighted the 15% uncertainty when confirming to Grace. Own it: today's failure is inside that 15%. Not doubling down without new information.
- SDK 54 autolinking's documented change (graph-walk vs directory scan) is the strongest candidate cause identified so far. Session 24A predates this being surfaced in the plan; the earlier assumption was that publishing to npm makes our module "structurally identical" to working modules, which we've now proven isn't sufficient in the SDK 54 graph-walk world.

---

## Update 2 — Session 5 — 2026-07-04 — Version bump 1.0.1 → 1.0.2 + Build 14 tag rule satisfied

**Branch:** testing (HEAD at session start: `183f207`; HEAD at session end: `d5df5b2`).
**Commit(s):** Four commits on testing, all pushed to origin/testing:
- `3699b54` — "Update 2 — Session 5: version bump 1.0.1 → 1.0.2 (pre-Build 15)" (`app.config.js` + `package.json`)
- `a3ccc09` — "Update 2 — Session 5: docs — Build 14 live + Update 2 v1.0.2 pointer" (`CLAUDE.md`)
- `895ce59` — "Update 2 — Session 5: docs — production pointer moved to Build 14" (`CLAUDE.md`)
- `d5df5b2` — "Update 2 — Session 5: docs — Build 14 tag rule SATISFIED (pushed)" (`CLAUDE.md`)

**Edge Function deploys:** 0.
**Cache token count:** 2,510 (unchanged — SYSTEM_PROMPT not touched).
**App Store impact:** version string now `1.0.2` in both files — unblocks EAS Build 15 upload for Update 2. Build 14 tag housekeeping retroactively closed on origin. No code shipped to users this session; nothing new reaches users until Grace uploads Build 15 and Apple approves it.

### Goals
- Bump the App Store version string 1.0.1 → 1.0.2 in the same two-file pattern (`app.config.js` + `package.json`) that fixed the Build 13 rejection (errors 90186 + 90062), so EAS Build 15 doesn't fail the same way at App Store Connect processing.
- Correct CLAUDE.md's stale "Build 14 = Waiting for Review, MANUAL release" statement now that Grace confirmed Build 14 was Apple-approved and released.
- Discharge the CLAUDE.md tag-rule debt for Build 14: annotated tag `v1.0.1-build14-appstore-live` on the build's commit `01c1d0f` + `production` fast-forwarded `9d617db → 01c1d0f`. Both pushed to origin.
- Keep every step LOW risk; no code, no dependency, no Edge Function, no cache disturbance.

### What changed
- **Version bump (commit `3699b54`).** `app.config.js` line 7 `version: '1.0.1'` → `'1.0.2'`; `package.json` line 3 `"version": "1.0.1"` → `"1.0.2"`. One-character diff each. Both files touched together per the Build 13 rejection lesson.
- **Docs commit 1 (`a3ccc09`).** CLAUDE.md CURRENT BUILD STATE: "Last verified" 2026-06-29 → 2026-07-04; "UPDATE 1 SUBMITTED ... Waiting for Review (manual release)" paragraph rewritten as "UPDATE 1 LIVE: Build 14 / v1.0.1 — Apple-approved and released on the App Store." Full Build 13 rejection history preserved (load-bearing lesson). Added "Tag rule OWED for Build 14" flag + "UPDATE 2 = v1.0.2 CODE COMPLETE on testing, awaiting EAS Build 15 upload" pointer. Standing fact "Production pointer ... currently at 9d617db" line deliberately UNCHANGED at this point — still accurate before the fast-forward.
- **Annotated tag creation.** `git tag -a v1.0.1-build14-appstore-live 01c1d0f -m "..."`. Tag-object SHA `8f0a104`, distinct from commit SHA — normal, matches the Build 12 pattern (`512dbd2`/`2036b9c`) already documented in CLAUDE.md's standing facts. Tag message mirrors Build 12's factual one-paragraph style. Build 12's tag verified still at commit `9d617db` — restore point untouched.
- **Production fast-forward.** `git update-ref refs/heads/production 01c1d0f 9d617db`. Atomic compare-and-swap: only succeeds if `production` currently at `9d617db`. Ancestor check `git merge-base --is-ancestor 9d617db 01c1d0f` returned OK first (26 commits between, linear ancestry). HEAD stayed on testing throughout — no branch checkout, no working tree change.
- **Docs commit 2 (`895ce59`).** CLAUDE.md standing fact line 24: `9d617db` → `01c1d0f locally — origin/production still at 9d617db until pushed`. Honest local-vs-origin split disclosure until Push 2 landed.
- **Push 1 — `git push origin testing`.** `183f207..895ce59` — 3 commits fast-forwarded (version bump + 2 docs).
- **Push 2 — `git push origin production`.** `9d617db..01c1d0f` — 26 commits fast-forwarded. HEAD unaffected.
- **Push 3 — `git push origin v1.0.1-build14-appstore-live`.** `* [new tag]`. Explicit single-tag push (not `--tags`, to avoid leaking any local test tags). Tag-object SHA `8f0a104` verified on origin via `git ls-remote --tags`.
- **Docs commit 3 (`d5df5b2`).** CLAUDE.md wrap-up: standing fact line 24 stripped the "locally — until pushed" clause; "Tag rule OWED for Build 14 ... NOT been done yet" → "Tag rule SATISFIED for Build 14 (2026-07-04): annotated tag v1.0.1-build14-appstore-live (tag-object SHA 8f0a104) created on commit 01c1d0f AND production fast-forwarded 9d617db → 01c1d0f; both pushed to origin."
- **Push 4 — `git push origin testing`.** `895ce59..d5df5b2` — wrap-up docs commit fast-forwarded.

### Tests — read-only verifications throughout
- Ancestor safety check before the production ref move — `git merge-base --is-ancestor 9d617db 01c1d0f` returned OK.
- After every push: `git rev-parse --short <ref>` compared to `git rev-parse --short origin/<ref>` — all pushed refs converged with origin.
- Build 12 restore point re-verified after every operation via `git rev-parse v1.0.0-build12-appstore-live^{commit}` → `9d617db`. Untouched, immutable.
- Working tree checked after every commit: only the 12 pre-existing untracked docs/backups remain (`.claude/worktrees/`, CLAUDE backup MDs, SESSION_24A notes, `tsconfig.json`, `supabase/.temp/`, photo assets) — none swept into any Session 5 commit.
- No iPhone / Expo Go test needed this session — pure metadata + docs, zero App.js or code changes.

### UNVERIFIED
- EAS Build 15 not triggered this session. Version string is bumped in both files, buildNumber will auto-increment (EAS never has it set manually in this repo), but `eas build --platform ios --profile preview` + App Store Connect processing + Apple review + release are Grace's next steps outside of this session.
- If Grace inspects `Constants.expoConfig.version` in Expo Go before Metro reloads, it may still show `1.0.1` from the cached bundle — force-reload Metro if verifying the string in-app. EAS build itself is unaffected (reads `app.config.js` directly from disk at build time on Expo's remote servers).

### Notes
- Push order matched Grace's named sequence: testing → production → tag → testing-again. One-at-a-time cadence produced an auditable trail where every docs commit reads cleanly on its own.
- `git config` NOT touched — every commit uses Grace's auto-derived committer identity (`grace@Graces-MacBook-Air.local`), matching every prior commit in this repo. Cosmetic git warning suppressed by convention. CLAUDE.md rule: NEVER update git config.
- 4 safety refs at session close: `v1.0.0-build12-appstore-live` tag-object `512dbd2` → commit `9d617db` (unchanged); `main` `062d15b` (unchanged). The two refs that MOVED — Build 14 tag `v1.0.1-build14-appstore-live` (tag-object `8f0a104` → commit `01c1d0f`) and `production` (`9d617db` → `01c1d0f`) — both match the CLAUDE.md tag rule verbatim.
- Zero Edge Function deploys, zero SYSTEM_PROMPT edits, cache stays at 2,510 tokens (unchanged from Session 4).
- Zero App.js changes, zero `src/` changes, zero new dependencies, zero `node_modules` changes, zero EAS env-var changes.
- No new KNOWN ISSUES surfaced. None carried forward from Session 4 got resolved (Analyse caret glyph pair + dormant Pro tap target both still deferred per Session 4's plan).

---

## Update 2 — Session 4 — 2026-07-04 — Analyse My Wardrobe redesign (glance-first + toggle + contrast)

**Branch:** testing (HEAD at session start: `6ff6cf1`; HEAD at session end: this session's single new commit — see `git log -1`)
**Commit(s):** "Update 2 — Session 4: Analyse My Wardrobe redesign (glance-first + toggle + contrast)" — single commit on testing bundling code + docs (App.js + src/lib/wardrobeIntelligence.js + CLAUDE.md + SESSION_NOTES.md). Pushed to origin/testing.
**Edge Function deploys:** 0.
**Cache token count:** 2,510 (unchanged — SYSTEM_PROMPT not touched).
**App Store impact:** none — testing-only commit; reaches users when Update 2 = v1.0.2 ships.

### Goals
- Replace the vague "real depth" / "rich palette" observation padding from Update 1 — Session 9 with a truthful glance-first design: closet-at-a-glance count breakdown always visible, balance line only when a category is genuinely low, "forgot about" only when there's real wear history.
- Deliberately kill the "never zero observations" invariant. Zero is now a valid outcome (the glance breakdown always shows).
- Wire the accordion tap-to-toggle + caret flip so the entry card acts like a real disclosure.
- Fix the close-hint contrast (`#A09888` on cream = 2.24:1, WCAG fail).
- Full HIG audit of the changed area before shipping.

### What changed
- **Step 1 — `src/lib/wardrobeIntelligence.js` full rewrite.** Killed F1 encouragement fallback + all 4 strength candidates (depth / rich palette / tops collection / shoes covered). Added: glance breakdown (canonical category order Tops/Bottoms/Dresses/Outerwear/Shoes/Accessories, real counts only, singular/plural helper — `1 dress` / `1 pair of shoes` / `1 outerwear piece` / `1 accessory`), dress-aware guard (`dresses >= 3` suppresses top/bottom imbalance because the user builds outfits from dresses), forgot-about observation (`N pieces you forgot about — Worth bringing back into rotation.` — statement not question, question form deferred to v1.0.3), `wornCount + unwornCount` derived from `item.lastWorn`. Extended return shape from `{ observations, source }` to `{ observations, glance, wornCount, unwornCount, source }` — additive, Session 9 caller unaffected.
- **Step 2 — App.js results block rewrite ([App.js:1930-1985](App.js:1930)).** Removed `Here's what stands out about your closet right now.` header. Removed "Got it" sage button. New render order via IIFE inside the conditional (so the helper only runs when the block is open): `YOUR CLOSET AT A GLANCE` terracotta eyebrow (Outfit_700Bold 11pt #A44A34 letterSpacing 2.5) → glance chips row (light espresso wash `rgba(44,26,14,0.04)` + muted border, count Outfit_700Bold 14 espresso + category Outfit_400Regular 13 body-brown, only categories with count > 0) → observations map (unchanged rendering — balance line and/or forgot-about) → E small-closet invitation `You're just getting started — add a few more pieces you love and Clozie will have far more to create with.` OR D no-history tip `✦ Tap "I wore this today" on your outfits, and Clozie can point out the pieces you forgot about.` (both gated on `observations.length === 0`, mutually exclusive on itemCount + wornCount) → close hint `Tap the card again to close ↑`. 7 new styles added to `wardrobeStyles`: `glanceLabel`, `glanceChipsRow`, `glanceChip`, `glanceChipCount`, `glanceChipCategory`, `analyseInvitation`, `analyseCloseHint`. Old dead styles (`analyseCardButton`, `analyseCardButtonText`, `analyseResultsHeader`) left in place per comment-not-delete pattern.
- **Step 3 — Three surgical edits.** Entry-card `onPress` `setShowAnalyseMessage(true)` → `setShowAnalyseMessage((prev) => !prev)` (App.js:1918 — toggle). Caret hardcoded `▾` → `{showAnalyseMessage ? '▴' : '▾'}` (App.js:1926 — flips with state). `analyseCloseHint.color` `#A09888` → `#5C4A3A` (App.js:10055 — 2.24:1 → 6.58:1 WCAG). No conflict with the D2 useEffect (search-open one-way close at App.js:1558-1562) — confirmed by inspection.

### Tests — iPhone, Expo Go
- **Step 1 verified:** real closet (~50 items with mix of worn + unworn) rendered `19 pieces you forgot about — Worth bringing back into rotation.` + balance line as expected; strength padding lines gone. My Closet grid + progress bar + FAB + sticky pill byte-identical.
- **Step 2 verified:** eyebrow, glance chips (real counts, correct singular/plural including `1 dress`), observation cards, close hint all render cleanly on real closet. E/D correctly suppressed when observations fire. iPhone screenshot of the block shared and approved.
- **Step 3 verified:** entry-card tap now toggles the block open/closed (both directions); caret flips ▾ ↔ ▴ both directions; close-hint text now reads clearly in body brown at 12pt.

### HIG audit (submission-readiness for the changed area)
- **Contrast (WCAG 2.1 AA, ≥4.5:1 for normal text):** eyebrow `#A44A34` on cream `#E8E4CE` = **4.55:1 PASS** (0.05 margin, matches locked April 28 design-system colour); glance chip count `#2C1A0E` = **~12.5:1 PASS**; glance chip category + observation body + E/D + close-hint all `#5C4A3A` on cream/white = **6.5–8.4:1 PASS**; observation title `#2C1A0E` on white = **16.65:1 PASS**; dormant actionable link `#A44A34` on white = **5.82:1 PASS**. Close-hint was the only fail pre-Step 3 (2.24:1); now 6.58:1 after the colour fix.
- **Tap targets (Apple HIG, ≥44pt):** entry card ~66pt tall × full column width — PASS. Dormant actionable link inside observation cards ~28pt vertical — FAILS but unreachable in free (helper returns `actionable: false` on every observation) — logged as KNOWN ISSUE for Pro session.
- **Font sizes (≥11pt Apple HIG):** all elements 11-18pt — PASS across the block.

### UNVERIFIED
- TestFlight standalone (next EAS Build) behavior of the redesigned block — proven in Expo Go on real iPhone. Pure JSX + StyleSheet + pure JS helper — no native module, no env var. Standalone should match. Flag if any tester reports the block rendering differently.

### Notes
- HEAD at session start: `6ff6cf1` (Update 2 — Session 3 docs commit). HEAD at session end: single new commit this session (visible via `git log -1`).
- 4 safety refs unchanged: `v1.0.0-build12-appstore-live` tag-object `512dbd2` → commit `9d617db`; build14 commit `01c1d0f`; `production` `9d617db`; `main` `062d15b`.
- Two follow-up notes carried forward as KNOWN ISSUES in CLAUDE.md:
  - **Caret glyph mismatch** — `▾` (U+25BE) and `▴` (U+25B4) render at slightly different visual weights because Outfit variable font lacks these Geometric Shapes glyphs; RN falls back per-character to SF Pro on iOS. Not a code bug. Decision **Option A** (leave as-is) confirmed for App Store submission — WCAG passes, HIG passes, users read both unambiguously as open/closed. Post-launch **Option B** as a two-line follow-up: swap to `▲`/`▼` matched pair + drop `analyseEntryCaret.fontSize` 18 → 14.
  - **Dormant Pro-only actionable-link tap target** — TouchableOpacity at App.js:1943-1959 has ~28pt vertical hit area; fails 44pt HIG. Unreachable in free. Fix before Pro flips `actionable: true`: bump `hitSlop` from 6 to ≥15, or convert to full-width pill.
- Deferred to v1.0.3: "Show me these" filter that turns the forgot-about observation from statement into an actionable question (`Want Clozie to build looks around them?`).
- No deps added, no imports changed, no Edge Function touched, no Supabase touched, no SYSTEM_PROMPT edit, no CLI deploys. Pure JSX + StyleSheet + one pure-JS helper file.
- Pre-existing untracked files (backup MDs, worktrees dir, Session 24A notes, tsconfig, photo assets) NOT swept into this commit.

---

## Update 2 — Session 3 — 2026-07-04 — Land returning users on Today's Vibe

**Branch:** testing (HEAD at session start: `ad026c1`; HEAD at session end: `8eae387`)
**Commit(s):** "Update 2 — Session 3: land returning users on Today's Vibe" — single commit on testing (App.js only, +2 / -2 lines). Pushed to origin/testing.
**Edge Function deploys:** 0.
**Cache token count:** 2,510 (unchanged — SYSTEM_PROMPT not touched).
**App Store impact:** none — testing-only commit; reaches users when next build ships in Update 2 = v1.0.2.

### Goals
- Change the returning-user landing tab from My Closet (tab 1) to Today's Vibe (tab 2). Motivation: the My Closet grid briefly flashes empty/hanger placeholders while wardrobe thumbnails signed-URL-batch resolves (~200-800ms per pre-existing Known Issue), producing a weak first-impression moment on every app open. Today's Vibe composes cleanly (weather chips + occasion chips + Brief, no async media) and is the core daily action.
- Leave the new-user signup path completely untouched — Post-Login Welcome → My Style must still land on tab 0.

### What changed
- **Read-only investigation (prior session, HEAD `ad026c1`)** confirmed: landing is decided by a single `mainInitialTab` state in `App()` at App.js:8069; `MainAppScreen` reads it once as `initialTab` at App.js:7513-7514. Three separate entry points set the tab explicitly before flipping `currentScreen` to `'main'`: auto-resume (App.js:8110), explicit Sign In (App.js:8219), new-user signup via Post-Login Welcome (App.js:8201). The new-user path at line 8201 is on a structurally isolated branch — reached only from `PostLoginWelcomeScreen`'s `onStart`, which is only mounted when `currentScreen === 'postlogin'`. It cannot be reached from lines 8110 or 8219. Tab index 2 confirmed as `TodaysVibeTab` at App.js:8000.
- **Edit 1 — App.js:8110 (cold-launch auto-resume).** `setMainInitialTab(wasNotifTap ? 2 : 1)` → `setMainInitialTab(wasNotifTap ? 2 : 2)`. Comment updated: "notif tap → Today's Vibe, else Today's Vibe (returning user landing, Update 2 — Session 3)". Redundant ternary preserved deliberately — one-character diff, keeps `wasNotifTap` variable declaration + notification `Promise.all` intact for future re-differentiation. Applied first, iPhone-verified in isolation before Edit 2.
- **Edit 2 — App.js:8219 (explicit Sign In in AuthScreen).** `setMainInitialTab(1)` → `setMainInitialTab(2)`. Comment updated: "returning user signing in → Today's Vibe (Update 2 — Session 3)". Applied second, after Edit 1 was iPhone-verified.
- **Not touched:** App.js:8201 (`setMainInitialTab(0)` new-user path) verified absent from the diff.
- **Apple Sign-In inherits behaviour:** the Session 22 (2026-06-03) Apple Sign-In handler routes through the same AuthScreen `onDone` callback — first-time Apple signups → `mode: 'signup'` → PostLogin → tab 0 (unchanged); returning Apple sign-ins → `mode: 'login'` → tab 2 (Today's Vibe). Consistent with password sign-in.

### Tests — iPhone, Expo Go
- **Edit 1 in isolation:** close and reopen (still signed in, auto-resume) → landed on Today's Vibe. Sign in with password → still landed on My Closet (correct — Edit 2 not yet applied).
- **Edit 2 applied:** sign out from Settings → sign in with email + password → landed on Today's Vibe. Cold-launch auto-resume rechecked → still landed on Today's Vibe (Edit 1 behaviour unchanged after Edit 2).

### UNVERIFIED
- New-user signup path (email or Apple, both `mode: 'signup'`) landing on My Style (tab 0): verified STRUCTURALLY (line 8201 not in the diff, isolated branch, no regression path from 8110 or 8219). NOT end-to-end tested this session because no fresh signup was performed. Zero regression risk given the structural isolation.
- TestFlight standalone (Build 15 or later) behaviour of the landing change: proven in Expo Go on real iPhone across both returning paths. Standalone behaviour should match (pure JS + RN built-in state) — flag if any tester reports a different landing tab.
- Notification-tap cold-launch routing: now routes to Today's Vibe regardless of `wasNotifTap` value (both branches → 2). Pre-existing Session 7 notification-tap destination (tab 2) preserved. Cross-reference the pre-existing UNVERIFIED item for Daily Notifications firing on TestFlight standalone.

### Notes
- HEAD at session start: `ad026c1` (Update 2 Session 2 code+docs commit). HEAD at session end: `8eae387` (this session's single commit).
- Pushed to origin/testing this session (unlike Session 2 which was local only). Fast-forward `ad026c1..8eae387`.
- 4 safety refs unchanged: build12 tag object `512dbd2` → commit `9d617db`; build14 commit `01c1d0f` (no tag — Build 14 awaiting Apple approval per CLAUDE.md tag rule); `production` `9d617db`; `main` `062d15b`.
- No safety tag created this session (per Grace's directive — one anchor before background removal instead).
- Pre-existing working-tree modifications in CLAUDE.md and SESSION_NOTES.md (Session 2 tag-SHA annotation lines) preserved, not staged, not committed with the landing change — separate notes-save handles them.
- Redundant ternary at App.js:8110 (`wasNotifTap ? 2 : 2`) is semantically identical to `setMainInitialTab(2)`. Kept as-is for minimal diff and future-proofing. Cleanup candidate for any future polish session that touches the notification-tap block.
- No deps added, no imports changed, no Edge Function touched, no Supabase touched, no SYSTEM_PROMPT edit, no CLI deploys.

---

## Update 2 — Session 2 — 2026-06-30 — Nested-Text logo fix (Welcome, Sign In, Peek Inside, PostLogin Text→View)

**Branch:** testing (HEAD at session start: `d4a3129`; HEAD at session end: this session's single new commit on testing — see `git log -1`)
**Commit(s):** "Update 2 Session 2: nested-Text logo fix at AX sizes (Welcome, Sign In, Peek Inside, PostLogin — Text→View + flexDirection:row)" — single commit on testing bundling code + docs (App.js + SESSION_NOTES.md + CLAUDE.md). Not pushed.
**Edge Function deploys:** 0.
**Cache token count:** 2,510 (unchanged — SYSTEM_PROMPT not touched).
**App Store impact:** none — testing-only commit; reaches users when next build ships in Update 2 = v1.0.2.

### Goals
- Close the KNOWN OPEN item from Update 2 — Session 1: all 4 nested-Text logo sites overflow at AX max because iOS only honors `allowFontScaling={false}` on the outermost `<Text>` in a nested-Text tree, and the parent wrapper Text fell into the wrapper's pass-through branch (no own fontSize) — the child wrappers' `allowFontScaling={false}` was ignored by iOS.
- Land the four fixes in the smallest possible LOW-risk steps, mirroring Splash's structurally-working pattern (`<View style={splashLogo}>` with `flexDirection: 'row'`), one screen at a time, diff-first, iPhone-verified between each.

### What changed
- **Step 0 — Branch-safety check (read-only).** Verified testing branch, clean tracked working tree, 2 ahead / 0 pushed, all 4 safety refs unchanged. Reconciled session-notes discrepancy: real HEAD at session start = `d4a3129` (Update 2 Session 1 docs commit), not `9e450f8` (wrapper code commit) — Session 1 actually shipped as two commits, not one.
- **Step 1 — Read-only code review of all 7 logo sites.** Splash reference: `<View style={splashLogo}>` + `flexDirection: 'row'` + matching `lineHeight: 92` on both children. Peek Inside ([App.js:518-521](App.js:518)) + Sign In ([App.js:855-858](App.js:855)) share `styles.logo` which ALREADY has `flexDirection: 'row'` → Case A (tag swap only). Welcome ([App.js:357-360](App.js:357)) + PostLogin ([App.js:1131-1134](App.js:1131)) use their own per-screen `logoRow` styles which LACK `flexDirection: 'row'` → Case B (tag swap + style edit). Verified `welcomeStyles.logoRow`/`.logoClo`/`.logoZie` Welcome-exclusive and `postLoginStyles.logoRow`/`.logoClo`/`.logoZie` PostLogin-exclusive — no leak risk on the style edits. Two additional `<View>`-based logo sites (Subscription line 5658, Settings line 6305) confirmed already structurally correct and NOT in scope.
- **Edit 1 — Peek Inside.** Outer `<Text style={[styles.logo, { marginBottom: 4 }]}>` → `<View ...>`, matching `</Text>` → `</View>`. Children byte-identical. No style edit (shared `styles.logo` already has `flexDirection: 'row'`). iPhone-verified at NORMAL + AX MAX: clean, no baseline drift at 36pt.
- **Edit 2 — Sign In.** Same tag-swap-only pattern (shares `styles.logo`). Children with their inline DM Serif 36 / espresso / terracotta overrides byte-identical. iPhone-verified at NORMAL + AX MAX: clean, no drift at 36pt.
- **Edit 3 — Welcome.** Tag swap (line 357 + 360) PLUS added `flexDirection: 'row'` to `welcomeStyles.logoRow` (App.js:8416). `textAlign: 'center'` left in place (no-op on View, flagged for future cleanup). `maxFontSizeMultiplier={1.1}` on both children preserved. iPhone-verified at NORMAL + AX MAX at 64pt: clean, no baseline drift between regular "Clo" and italic "zie" without any `lineHeight` addition.
- **Edit 4 — PostLogin.** Same Case-B pattern — tag swap (line 1131 + 1134) PLUS added `flexDirection: 'row'` to `postLoginStyles.logoRow` (App.js:8839). `textAlign: 'center'` + `marginBottom: 16` preserved. Children byte-identical (no per-Text `maxFontSizeMultiplier` — inherits global 1.3× cap from `ClozieText` wrapper). iPhone-verified at NORMAL + AX MAX at 56pt: clean, no drift, no `lineHeight` needed.

### Tests — iPhone, Expo Go, end-to-end at NORMAL and AX MAX
- **NORMAL text size**, every screen after every edit: byte-visually identical to pre-edit (same centering, same spacing, same font weights). No regressions on Peek / Sign In / Welcome / PostLogin or adjacent screens.
- **AX MAX (Accessibility > Display & Text Size > Larger Text, slider near top)**: all 4 previously-broken logos now hold cleanly. "Clo" and italic "zie" render side-by-side, horizontally centered, scaled by the global `ClozieText` 1.3× cap (or per-Text 1.1× cap on Welcome's children). The Welcome stacked-zie-below-Clo failure from the original Session 1 plain-tag-swap attempt is closed because `flexDirection: 'row'` is now present.
- Splash retested at AX MAX as a sanity check: still caps correctly (structurally untouched this session).

### UNVERIFIED
- TestFlight standalone behavior (Build 13 or later) of the wrapper + the logo structural fix. Both proven in Expo Go on real iPhone at AX max. Standalone behavior should match (no native module, no env var, pure JS + RN built-ins) but flag if a tester reports any logo or AX text behavior diverging from Expo Go.
- ShareCard `dontScale` opt-out wiring: prop exists in `ClozieText` wrapper but no caller uses it yet (carried forward from Session 1). ShareCard's 5 Text props still scale with AX in the captured PNG — wiring lands in a follow-up session before any share-card usage at AX is a real risk.

### Notes
- HEAD at session start: `d4a3129` (Update 2 Session 1 docs commit). HEAD at session end: single new commit on testing this session (visible via `git log -1`). Testing now 3 ahead of origin / 0 pushed after this commit.
- 4 safety refs unchanged: `v1.0.0-build12-appstore-live` (`9d617db`), `v1.0.1-build14-submitted` (`01c1d0f`), `production` (`9d617db`), `main` (`062d15b`).
- Annotated-tag SHA note (so no future session mistakes it for drift): safety tags `v1.0.0-build12-appstore-live` and `v1.0.1-build14-submitted` are ANNOTATED tags. `git ls-remote` returns the TAG-OBJECT SHA (`512dbd2` for build12, `2036b9c` for build14), which differs from the COMMIT SHA the safety refs track (`9d617db` for build12, `01c1d0f` for build14). This is normal git behavior, NOT drift. Safety checks verify the COMMIT SHAs: build12 `9d617db`, build14 `01c1d0f`, production `9d617db`, main `062d15b`.
- Total in-file logo count: 7 (1 Splash reference + 4 fixed-this-session + 2 already-correct at Subscription line 5658 and Settings line 6305).
- Small dead-style debt accrued: `textAlign: 'center'` left in `welcomeStyles.logoRow` and `postLoginStyles.logoRow` (silent no-op on View after the swap). Kept per the no-silent-changes rule. Single-line cleanup; can ship with any future polish pass.
- Honest pre-edit predictions ran: Welcome at 64pt was estimated ~70% clean / 30% drift-needing-lineHeight; PostLogin at 56pt ~85% clean. Both held with NO `lineHeight` needed — better than predicted. Splash's `lineHeight: 92` (72pt × 1.28) precedent remains the reactive-fix recipe if any future site does show drift.
- No deps added, no imports changed, no Edge Function touched, no Supabase touched, no SYSTEM_PROMPT edit, no CLI deploys. Pure JSX + StyleSheet edits in App.js only.

---

## Update 2 — Session 1 — 2026-06-29 — Dynamic Type AX wrapper (ClozieText + ClozieTextInput)

**Branch:** testing (HEAD at session start: `eb7c2e3`; HEAD at session end: `9e450f8`)
**Commit(s):** `9e450f8` "Update 2 Session 1: Dynamic Type AX wrapper (ClozieText + ClozieTextInput)" — single commit on testing. Three files: `App.js` (+2/-2 import swap), `src/components/ClozieText.js` (new, 78 lines), `src/components/ClozieTextInput.js` (new, 58 lines). 138 insertions, 2 deletions. Not pushed.
**Edge Function deploys:** 0.
**Cache token count:** 2,510 (unchanged — SYSTEM_PROMPT not touched).
**App Store impact:** none — testing-only commit; reaches users when next build ships in Update 2 = v1.0.2.

### Goals
- Fix the Update 1 — Session 3 Dynamic Type cap escape: 1.3× cap holds under the standard Settings > Display & Brightness > Text Size slider, but **does not hold** under Settings > Accessibility > Display & Text Size > Larger Text (AX sizes), where text scales past 1.3× and breaks layouts. Cause confirmed in this session: documented Fabric bug (RN issue #47499) — `maxFontSizeMultiplier` and `defaultProps.maxFontSizeMultiplier` are both silently ignored at iOS AX sizes on RN 0.81.5 / Expo SDK 54 New Architecture.
- Land the fix in tiny LOW-risk steps with iPhone verification between each.

### What changed
- **Step 0 — fontScale probe (diagnostic-only, reverted before any wrapper work).** Inserted a throwaway white card on the Welcome screen rendering `useWindowDimensions().fontScale` + `PixelRatio.getFontScale()`. Real iPhone confirmed both APIs return **3.571 at AX max** — well above 1.3, meaning the JS-clamp approach has a working signal. Reverted via `git checkout App.js` before any wrapper code. Nothing committed from the probe.
- **Wrapper design — `src/components/ClozieText.js` + `ClozieTextInput.js`.** Reads `useWindowDimensions().fontScale` on every render, clamps via `min(fontScale, elementCap, 1.3)`, sets `allowFontScaling={false}` so iOS doesn't double-scale. Only scales elements whose flattened style has its own `fontSize` — nested-Text parents (Welcome / Peek / Auth logoRow) and inherited-size Texts pass through untouched. Also scales `lineHeight` proportionally when set, matching native scaling behavior. `dontScale={true}` opt-out forces `allowFontScaling={false}` + raw `fontSize` with zero JS scaling — reserved for ShareCard's offscreen PNG capture (wiring lands in a follow-up session).
- **App.js import swap (`App.js` line 4 + line 11 removed, lines 22-23 added).** `Text` and `TextInput` no longer destructured from `'react-native'`; instead imported from the wrappers. All 372 `<Text>` and 17 `<TextInput>` JSX call sites resolve to the wrapper with zero call-site changes. The single `Animated.Text` ([App.js:3775](App.js:3775) — spinning loading ✦) keeps using RN's native Text via `Animated.Text` namespace, unchanged.
- **Step 1 attempted + reverted within session.** Welcome logo Text→View change ([App.js:357-360](App.js:357)) applied, iPhone-tested at NORMAL text size, and "zie" dropped below "Clo" because `welcomeStyles.logoRow` lacks `flexDirection: 'row'` — View defaulted to column layout and stacked the children. Reverted byte-for-byte via surgical Edit (Text→View tags reversed only, wrapper imports kept). Welcome logo back to original `<Text>` parent. Splash's structurally-working pattern (`<View style={splashLogo}>` with `flexDirection: 'row'`) is what the next-session fix must mirror.

### Tests — iPhone, Expo Go, end-to-end at NORMAL and AX MAX
- **NORMAL text size** after wrapper import swap: every screen renders visually byte-identical to pre-session. Welcome / Peek / Splash / Auth logos, eyebrows, taglines, Mood Board polaroid captions, Hanger View, brief field typing, search bars, Settings forms — all unchanged.
- **AX MAX (Accessibility > Larger Text slider near top)**: My Closet, Today's Vibe, Your Looks, Mood Board, Hanger View, Saved Outfits, Settings — **all cap correctly**. Splash also caps correctly (its parent is `<View>` so children are top-level Texts whose `allowFontScaling={false}` is honored). Welcome eyebrow + tagline cap correctly. **Welcome + Sign In + PostLogin Welcome big "Clozie" wordmark logos overflow at AX max** (observed on iPhone). **Peek Inside not tested at AX tonight** but structurally identical (nested-Text parent) and listed as the 4th likely-affected site. See KNOWN OPEN below.

### KNOWN OPEN — 4 nested-Text logo sites still overflow at AX max
- **Cause:** iOS only honors `allowFontScaling` on the OUTERMOST `<Text>` in a nested-Text tree. The wrapper correctly sets `allowFontScaling={false}` on the child Texts (Clo / zie), but the parent `<Text style={welcomeStyles.logoRow}>` is in the wrapper's pass-through branch (no own fontSize) and ships to iOS with `allowFontScaling=true` by default. iOS reads the parent's setting, scales the entire nested tree by the OS font scale, and the child wrapper's `allowFontScaling={false}` is ignored. 64px × 3.571 ≈ 228px overflow at AX max.
- **Four sites affected:** Welcome ([App.js:357-360](App.js:357)), Sign In / Auth ([App.js:855-858](App.js:855)), Peek Inside ([App.js:518-521](App.js:518)), and PostLogin Welcome — all use `<Text>` parent wrapping `<Text>` children for the Clo+zie wordmark. **PostLogin Welcome was confirmed broken on iPhone tonight but its JSX structure was NOT line-verified during this session — locate exact line range + parent style ref during Step 1 v2 before applying any change.**
- **Splash is unaffected** because Session 13A (2026-05-18) restructured Splash's logo from nested-Text to `<View style={splashLogo}>` parent with `flexDirection: 'row'` + sibling Texts. Children become top-level Texts whose `allowFontScaling={false}` IS honored.
- **Fix queued for Update 2 — Session 2 (Step 1 v2):** swap outer `<Text>` → `<View>` AND add `flexDirection: 'row'` to `welcomeStyles.logoRow` (and likely `alignItems: 'baseline'`) so children render row-wise inline. `styles.logo` (used by Auth + Peek) already has `flexDirection: 'row'` so those two sites only need the tag swap. **PostLogin parent style not yet verified** — its requirement may match Welcome (no flexDirection, needs to be added) or Auth/Peek (`styles.logo` has flexDirection, tag swap alone is enough) depending on which stylesheet it uses; confirm during Step 1 v2. Tonight's plain Text→View attempt without the flexDirection addition is what failed — reverted cleanly. Four small surgical Edits, iPhone-tested between each.

### UNVERIFIED
- TestFlight standalone (Build 13 or later): wrapper proven in Expo Go on real iPhone at AX max. Standalone behavior should match (no native module, no env var) but flag if a tester reports any AX text growing past 1.3× on a non-nested-Text surface.
- ShareCard `dontScale` opt-out: prop exists in wrapper but no caller uses it yet. ShareCard's 5 Text props still scale with AX in the captured PNG — wiring lands in a follow-up session before any share-card usage at AX is a real risk.

### Notes
- HEAD at session start: `eb7c2e3` (Update 1 docs commit). HEAD at session end: `9e450f8` (this session's commit). Testing 1 ahead of origin. Not pushed.
- 4 safety refs unchanged: `v1.0.0-build12-appstore-live` (`9d617db`), `v1.0.1-build14-submitted` (`01c1d0f`), `production` (`9d617db`), `main` (`062d15b`).
- Dead-but-harmless: the existing `Text.defaultProps.maxFontSizeMultiplier = 1.3` and `TextInput.defaultProps.maxFontSizeMultiplier = 1.3` at [App.js:54-57](App.js:54) now run against the wrapper component instead of RN's Text. With the wrapper handling all clamping in JS, these lines are redundant — `elementCap` defaults to Infinity when prop is unset, and applying `1.3` from defaultProps yields the same `min(fontScale, 1.3, 1.3)` = `min(fontScale, 1.3)` result. Left in place to keep this commit's blast radius small; clean-up is a separate tidy-up step. React 19+ has also deprecated `.defaultProps` on function components — when those lines are removed, that deprecation warning goes away too.
- Wrapper structure picks: `React.forwardRef` on both wrappers (defensive — no current call site uses refs on Text/TextInput, but cheap insurance for future use). `StyleSheet.flatten()` resolves style refs + arrays uniformly. lineHeight scaling included so multi-line text (tagline, brief field, outfit name with `numberOfLines={2}`) doesn't overlap at AX.
- Decision NOT to take Option B (force `allowFontScaling={false}` in wrapper pass-through): would have fixed the 4 logos without JSX changes, but requires auditing every no-own-fontSize Text in App.js to confirm no regression. Higher hidden risk than 4 small surgical JSX edits matching the proven Splash pattern.
- Step 0 probe-fix-revert sequence proved the JS-clamp approach works before any wrapper code was written — saved the entire wrapper from being shelved if Fabric had broken the hook too.

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
