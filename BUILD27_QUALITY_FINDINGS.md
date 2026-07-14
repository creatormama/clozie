# BUILD 27 — CUTOUT QUALITY FINDINGS (READ-ONLY AUDIT)

Date: 2026-07-14. Branch: `testing`. Author: Claude Code session (Build 27 quality prep).
Scope: **reading and reporting only. Zero code changed. No commits. No build.**

**Verification legend:** every claim is **[VERIFIED — file:line]** (I read it) or **[NOT CHECKED]**
(I could not run/observe it — reasoned estimate, honestly flagged). Nothing in between.

---

## 0. BRANCH SAFETY (checked first, as instructed)

- **[VERIFIED — git]** Current branch: `testing`.
- **[VERIFIED — git]** `main` = `062d15bac08e79c9c1d66e59eb0be4f990b6ed51` (expected `062d15b`) — untouched.
- **[VERIFIED — git]** `production` = `f711c5d5d82a7f8cd995a51e0764c1891242ce17` (expected `f711c5d`) — untouched.
- **[VERIFIED — git]** `testing` HEAD = `1a43b58` (Build 26 tip). Working tree: untracked `??` files only, **zero modified tracked files.**

Nothing in this session changed any code, created any commit, or ran any build.

---

## PIPELINE AS IT ACTUALLY RUNS TODAY (verified against Swift, not docs)

1. **[VERIFIED — App.js:1795-1805 / 1826-1837]** Pick/camera → `original.uri` → `ImageManipulator.manipulateAsync(original.uri, [{resize:{width:512}}], {compress:0.75, JPEG})` = `fixed.uri` (512px-wide JPEG, EXIF baked).
2. **[VERIFIED — App.js:1808 / 1840]** `fixed.uri` feeds BOTH `runRecognition(...)` and `applyBackgroundRemoval(...)` in parallel.
3. **[VERIFIED — App.js:1775]** `applyBackgroundRemoval` calls `BackgroundRemoval.removeBackground(uprightUri, CUTOUT_OPTIONS)`.
4. **[VERIFIED — BackgroundRemovalModule.swift]** Native: load file (:114) → `normalizedUp()` EXIF bake (:117) → `.cgImage` = **whole frame** (:118) → **`autoEnhancedCGImage(cgImage, strength)` on the FULL FRAME BEFORE the mask** (:123) → Vision foreground mask on the enhanced full frame (:126-128) → `generateMaskedImage(… croppedToInstancesExtent:true)` alpha cutout, cropped tight (:132-136) → `shadowedForeground(...)` baked shadow under garment (:144) → PNG branch (:149-157) OR white-composite JPEG (:159-168).
5. **[VERIFIED — App.js:59-69]** `CUTOUT_OPTIONS` = `outputFormat:'png', enhanceStrength:1.0, shadowOpacity:0.40, shadowBlur:18, shadowOffsetX:0, shadowOffsetY:12, shadowColor(0.3,0.3,0.3)`.

---

## Q1 — WHERE IS THE 512px RESIZE? IS 768 JS-ONLY? IS 768 ENOUGH AT 3x?

**Resize location — JS-side, not Swift. [VERIFIED — App.js:1803 and App.js:1835]:** `[{ resize: { width: 512 } }]` in `ImageManipulator.manipulateAsync`, at both the camera path and the library path. Bumping to 768 is a two-number JS change — **no Swift recompile.**

**Critical nuance the working theory glossed — it is a SHARED resize.** `fixed.uri` feeds recognition too, and recognition re-encodes it to base64 with **NO downscale**:
- **[VERIFIED — clozieRecognition.js:11-16]** `ImageManipulator.manipulateAsync(localUri, [], { JPEG, base64:true })` — empty ops array, so it transports whatever pixel size it's given.
- Therefore bumping the shared resize to 768 **also enlarges the Anthropic recognition payload** (~2.25× pixels → more tokens, latency, cost).
- **To bump ONLY the cutout** without enlarging recognition, decouple: either add a 512 downscale inside `clozieRecognition.js`, or run a separate 768 manipulate for BG removal only. Both are JS-only, but **more than a one-line change.**

**Display sizes [VERIFIED]:**
- Closet grid card: `gridCard.width = (SCREEN_WIDTH - 60)/2` ≈ 165pt on a ~390pt screen, `gridCardPhoto.height = 150` (App.js:10004-10013). At 3x ≈ **495×450px**.
- Largest surface = hanger **dress** slot: `hangerSlotDress` 185×320pt (App.js:5553-5559). At 3x ≈ **555×960px**.
- Other hanger slots smaller: top 140×158, pants 165×195, shoes 125×95 (App.js:5515-5541).

**Is 768 enough at 3x? [VERIFIED math, NOT CHECKED visually]:** for a typical **portrait** garment photo, `resize width:768` → source ≈ 768×1024px. That covers the 960px-tall dress slot in height and the 555px width, and vastly exceeds the grid (495×450). **So 768 is sufficient at 3x for portrait shots.** 1024 only buys headroom for unusual aspect ratios or pinch-zoom. The **current 512 source is upscaled** on the dress hanger (512-wide portrait ≈ 683 tall vs 960 needed) — a real, verified contributor to edge softness. Landscape/square garment shots change the math but garments are typically portrait.

---

## Q2 — MOVE COLOR CORRECTION AFTER THE MASK (GARMENT-ONLY)?

**Feasible and low-touch. [VERIFIED — BackgroundRemovalModule.swift:138, 144, 149-168]:** the alpha-bearing cutout (`foreground`) exists at line 138, before shadow (:144) and before either encoder (:149-168). A garment-only correction inserted between :138 and :144 touches ~one block and nothing structurally downstream. This is exactly the professional order (cut first, correct the garment alone). It is Swift work → a native build.

---

## Q3 — WHAT IS `autoAdjustmentFilters()` FED, AND IS ANY WHITE BALANCE IN PLAY?

- **Fed the FULL FRAME. [VERIFIED — Swift:118, 123, 126]:** `autoEnhancedCGImage(cgImage, …)` runs on `upright.cgImage` (the whole image, :118) **before** the Vision mask (:126). The garment is corrected against the warm background average.
- **No white-balance step exists today. [VERIFIED — whole file read]:** the only CIFilters in the module are `autoAdjustmentFilters` (:44), `CIDissolveTransition` (:54), `CISourceInCompositing` (:84), `CIGaussianBlur` (:89), `CIColorMatrix` (:92). There is **no** `CITemperatureAndTint`, `CIWhitePointAdjust`, or exposure filter anywhere.
- **[NOT CHECKED at runtime]** `autoAdjustmentFilters()` itself, per Apple's documented set, returns tone-curve / vibrance / highlight-shadow (+ redeye/face-balance) — none is white balance. That the returned array carries no WB filter is documented Apple behavior; I cannot observe the actual array on-device from here.

---

## Q3b — REGRESSION: DOES THE PIPELINE DEGRADE A WHITE SHIRT TO BROWN?

**The enhance step is the ONLY operation that alters garment RGB. [VERIFIED]:**
- Mask (:132-136) and tight crop don't recolor; `shadowedForeground` composites shadow **under** the garment (:99); the PNG branch has no white composite (:149-157). The sole garment-RGB-altering op is `autoEnhancedCGImage` at `enhanceStrength:1.0` (App.js:61 → Swift:123, :40-66).

**Mechanism is plausible and consistent with the symptom [NOT CHECKED at runtime — cannot run CoreImage here]:**
- `CIVibrance` boosts saturation of near-neutral colors → nudges a white toward beige/cream.
- `CIToneCurve` / `CIHighlightShadowAdjust` are computed from the **whole-frame histogram** → a warm wall/door biases the curve and can pull the bright neutral garment darker/warmer.
- Because enhance runs on the full frame **before** the cut, the garment is corrected relative to the warm surroundings.

**Strong logical inference [VERIFIED by version history]:** Build 25 ran `enhanceStrength:0` (no tonal step) and did not degrade color; Build 26 set it to 1.0 and the degradation appeared. The regression is attributable to the enhance step. **This confirms the Style Council theory.**

---

## Q4 — CHOKE (~1px) + STEEPEN ALPHA RAMP — FEASIBLE? RISK TO SHADOW?

**Feasible with the CIFilter family already in the file. [VERIFIED — Swift:138, :92]:** the cutout is a CIImage at :138. Alpha-ramp steepening = `CIColorMatrix` (already used at :92) on the alpha channel + clamp. Choke = a morphology-minimum (or blur-then-threshold) pass on alpha.

**Real risk [VERIFIED by data flow — Swift:84-86]:** the shadow is derived from the **same** `foreground` alpha via `CISourceInCompositing`. Choke `foreground` before :84 and the shadow silhouette shrinks with it (likely fine/desirable); to keep the shadow off the un-choked mask, derive shadow first. Ordering must be deliberate — not hard, but a decision. Swift work → native build.

---

## Q4b — GARMENT-ONLY EXPOSURE LIFT + WHITE BALANCE — CHEAP IN THE SAME PASS?

**Yes, cheap and same CIContext. [VERIFIED — Swift:138 insertion point; no such filters exist today]:** right combination = `CITemperatureAndTint` (neutralize cast) + `CIExposureAdjust`/`CIColorControls` (brightness), applied to the garment-only `foreground`.

**Honest hard truth on the TARGET SPEC ("white reads white AND camel keeps its warmth"):** a *fixed* temperature shift removes the ambient cast **uniformly** — correct only if the cast is purely ambient (hits every garment equally). It **cannot** distinguish "white garment under warm light" from "genuinely camel garment," so a fixed WB that whitens whites will also cool a real camel. Recovering true color for both at once needs an **illuminant estimate** (e.g. gray-world auto-WB from garment pixels), which is more robust but can **over-cool genuinely warm garments**. This spec is not fully solvable with one global filter — the working theory undersells it.

---

## Q5 — DO ALL FOUR SHADOW VALUES FLOW FROM JS WITH NO RECOMPILE?

**YES. [VERIFIED — App.js:59-69 → App.js:1775 → Swift:8-18, 71-99]:** `shadowOpacity 0.40 / shadowBlur 18 / shadowOffsetX 0 / shadowOffsetY 12 / shadowColor (0.3,0.3,0.3)` are set in `CUTOUT_OPTIONS`, passed as the 2nd arg to `removeBackground`, and consumed as `@Field` no-op-default Record fields. **Changing any shadow value is a pure JS diff — no Swift recompile.** (e.g. blur 18→12 is free.)

---

## Q6 — REAL PNG FILE SIZE

**No real Vision cutout is reachable read-only → [NOT CHECKED] for a true cutout.** (`find` for `clozie-bg-removed-*.png` on disk and in temp dirs returned nothing — cutouts are temp files uploaded to Supabase, not persisted locally.)

**Proxy [measured — real photo `assets/welcome-screen-photo.jpg`, LANCZOS resize, honest upper-ish bound]:**

| width | JPEG q90 | PNG opaque | PNG + alpha margin proxy | PNG vs JPEG |
|---|---|---|---|---|
| 512  | 143 KB | 771 KB | ~557 KB | ~5.4× |
| 768  | 262 KB | 1.5 MB | ~1.1 MB | ~5.8× |
| 1024 | 390 KB | 2.4 MB | ~1.7 MB | ~6.1× |

**Caveats [NOT CHECKED]:** this is a busy full portrait; a real garment cutout (simpler subject, more transparent area zeroed to fully-transparent) will compress **better** than this — treat the table as an upper bound. PIL's PNG encoder ≠ iOS `pngData()`.

**Storage implication:** 768 PNG ≈ ~1 MB/item → 50 items ≈ **~50 MB/user** vs ~28 MB at 512 PNG vs ~3 MB at Build 25 white-JPEG. Bumping resolution AND switching to PNG compound. A conscious decision, not a freebie.

---

## Q7 — BRUTALLY HONEST: RISKS, AND A CHEAPER PATH THE PLAN MISSED

1. **The single cheapest, highest-value fix is JS-only and the plan buried it: set `enhanceStrength: 0`.** Enhance is the *only* thing recoloring the garment (Q3b), and it is a **JS value change (App.js:61) — no Swift build.** Since the raw photo shows white but our output shows brown, turning enhance off should restore the garment to ~source color immediately. **White balance is a Swift build and is only needed to go *beyond* the source** (correct genuinely warm-lit photos) — a nice-to-have, not the regression fix. **Recommended sequence: ship a JS-only pass first** (enhance 0 + shadow blur 18→12, optionally resize 512→768), test on-device, and commit to the Swift WB/choke build **only if** that's still insufficient.

2. **Permanent-damage gotcha [VERIFIED by data flow].** Items already added in Build 26 have the warm-enhanced color **baked into the stored PNG**. No recipe change fixes those. A "Refresh my closet" migration would re-run correction on already-degraded pixels (lossy; may not recover white). Some items may need a re-shoot. The migration is riskier than "just re-process."

3. **768 is not free.** It ripples into recognition cost (shared resize, Q1) and ~doubles storage (Q6). And if edge softness is mostly the **feathered Vision matte** rather than upscaling, 768 alone won't fix edges — you'd still want the Swift choke. Don't assume 768 solves edges.

4. **Shadow blur 18→12 is a pure JS win** (Q5) — no reason to bundle it into a Swift build.

5. **The dress hanger crop is load-bearing** (App.js:5549-5568 comment warns the flex-start + 88%-height combo is deliberate). Eyeball that slot specifically if resolution changes.

**Net verdict:** the working theory is directionally right, and the code confirms its core claims — enhance runs on the full frame before the mask (Swift:118/123/126), no white balance exists today (whole-file read), shadow values are JS-tunable (App.js:59-69), and the shadow shares the garment's alpha mask (Swift:84-86). **But the cheapest real win — `enhanceStrength: 0` — is JS-only and needs no native build.** Prove out a JS-only tuning pass before spending a Swift build on white balance + choke.

---

## SUGGESTED SEQUENCING (recommendation only — nothing built)

- **Round 1 (JS-only, no Swift, next TestFlight):** `enhanceStrength: 0`; `shadowBlur: 18 → 12`. Optionally `resize 512 → 768` (accept recognition/storage ripple, or decouple recognition to 512). Verify whites + haze on-device. This may resolve most of the complaint with zero native code.
- **Round 2 (Swift native build) — ONLY if Round 1 falls short:** garment-only correction after the mask (`CITemperatureAndTint` + small `CIExposureAdjust`) with JS-tunable strength; alpha choke (~1px) + ramp steepen, ordered so the shadow derives from the intended (choked or un-choked) mask.
- **Migration:** treat separately and test on Grace's own closet first; Build-26 items with baked warmth may need re-shoots.

**Untouched this session:** all code, Edge Function, SYSTEM_PROMPT (stays 2,510), eas.json, app.config.js, package.json, Supabase. Read-only audit; this findings file is the only file created.
