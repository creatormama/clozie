# BUILD 26 — FEASIBILITY FINDINGS (READ-ONLY AUDIT)

Date: 2026-07-13. Branch: `testing`. Author: Claude Code session (Build 26 opener).
Scope: reading and reporting only. **Zero code changed in this audit.** (Part A version bump 1.0.4→1.0.5 is a separate change, held for the end-of-session commit.)

**Verification legend:** every claim is marked **[VERIFIED — file:line]** (I read it) or **[NOT CHECKED]** (I could not run/observe it — reasoned estimate, honestly flagged). Nothing in between.

---

## 0. WIRING SANITY CHECK (Grace's Flag-2 correction, verified against code, not docs)

Background removal is **LIVE and wired**, confirmed in current code (the SHELVED file + the CLAUDE.md "pre-background-removal revert point" line are stale history — code wins):

- **[VERIFIED — App.js:41]** `import BackgroundRemoval from './modules/expo-background-removal';`
- **[VERIFIED — App.js:1755-1765]** `applyBackgroundRemoval(uprightUri)` calls `BackgroundRemoval.removeBackground`, sets `photoUri` to the cutout, keeps the original on null/throw (no user-facing error).
- **[VERIFIED — App.js:1791 and App.js:1823]** both add paths (camera + library) run `await Promise.all([runRecognition(fixed.uri), applyBackgroundRemoval(fixed.uri)])` on the EXIF-fixed photo.
- **[VERIFIED — App.js:6372]** a third call site exists but it is the **Settings test/diagnostics modal** (`handlePickTestPhoto`, `testCutoutUri`), feeding the raw pick, NOT the production add flow. Not part of the shipping user path.

**Verdict: AGREE with Grace.** Module is live in Build 25, producing white-JPEG cutouts in production.

---

## PIPELINE AS IT ACTUALLY RUNS TODAY (verified)

1. **Pick/camera** → `original.uri` (raw, may carry EXIF rotation). **[VERIFIED — App.js:1782 / 1814]**
2. **EXIF normalize + resize** → `ImageManipulator.manipulateAsync(original.uri, [{resize:{width:512}}], {compress:0.75, format:JPEG})` = `fixed.uri`. This bakes orientation in and shrinks to 512px wide JPEG. **[VERIFIED — App.js:1784-1788 / 1816-1820]**
3. **Parallel**: recognition (Anthropic) + background removal, BOTH on `fixed.uri`. **[VERIFIED — App.js:1791 / 1823]**
4. **Native cutout** (Swift): load file → Vision foreground mask → composite over white → JPEG q0.9 → temp `.jpg` → returned URI → `setPhotoUri(cutout)`. **[VERIFIED — BackgroundRemovalModule.swift:9-49]**
5. **Save**: `uploadWardrobePhoto(photoUri, userId)` uploads the cutout **directly** (no re-manipulation), hardcoded `.jpg` + `image/jpeg`. **[VERIFIED — App.js:1508-1509, 1601-1604; wardrobeItems.js:33-42]**

---

## Q1 — PARAMETERIZATION (the most important question)

**Can the module accept JS-side params (enhanceStrength, shadowOpacity, shadowBlur, offset, color, outputFormat) today?**

**NO — verified.**
- **[VERIFIED — BackgroundRemovalModule.swift:9]** signature is `AsyncFunction("removeBackground") { (imageUri: String) -> String? }` — one string arg, nothing else.
- **[VERIFIED — BackgroundRemovalModule.ts:4]** TS declaration is `removeBackground(imageUri: string): Promise<string | null>` — one arg.

**Smallest change to make it accept params:** add a second argument as an Expo Modules `Record` (struct), e.g. `removeBackground(imageUri, options)`, with fields `enhanceStrength`, `shadowOpacity`, `shadowBlur`, `shadowOffsetX/Y`, `shadowColor` (r/g/b), `outputFormat` ('png'|'jpeg-white'). Update the Swift signature, the `.ts` declaration, and the two production callers ([App.js:1758], and optionally the test modal [App.js:6372]). This is a **native (Swift) change → requires a native build.**

**Key consequence for the build budget:** parameterize ONCE in the Build 26 native build. After that, changing shadow/enhance *values* is a JS-only diff (pass different numbers) — **no Swift recompile.** This is exactly what lets Style Council tuning happen without new native code.

**OTA (expo-updates)?** **NOT AVAILABLE — verified.**
- **[VERIFIED — package.json]** `expo-updates` is NOT in dependencies (grep returned nothing).
- Per Grace's instruction, we are NOT adding it in Build 26. So even a JS-only value change must ship via a TestFlight build.

**Important honesty caveat on "JS-only tuning" [NOT CHECKED]:** the Vision native module does **not** run in Expo Go at all (`requireOptionalNativeModule` returns null there — **[VERIFIED — BackgroundRemovalModule.ts:7-9]**), and CLAUDE.md notes `testing` now runs SDK 57 which Expo Go can't load. So cutouts can only be seen on a real device build. Two device-testing paths exist, and I have NOT verified which Grace uses:
- **TestFlight build per tuning round** (what CLAUDE.md describes today), OR
- **A custom `expo-dev-client` build installed once**, after which JS param changes hot-reload on-device with no new build. This would be the cheapest tuning loop — but I have NOT verified a dev-client is set up. Flagging as a question, not a fact.

---

## Q2 — WHERE THE WHITE COMPOSITE HAPPENS

**[VERIFIED — BackgroundRemovalModule.swift:27-40]:**
- Line 27-31: `generateMaskedImage(...)` → `maskedPixelBuffer` — this is the garment **with alpha** (background pixels transparent).
- Line 33: `let foreground = CIImage(cvPixelBuffer: maskedPixelBuffer)` — **the alpha-bearing cutout exists HERE.**
- Line 34-35: `let whiteBg = CIImage(color: .white)...; let composited = foreground.composited(over: whiteBg)` — **THE WHITE COMPOSITE.**
- Line 40: `outputImage.jpegData(compressionQuality: 0.9)` — JPEG encode.

**Verdict: AGREE with Grace.** The alpha mask exists before the composite. Transparent PNG = **skip lines 34-35** (encode `foreground` directly) and **encode PNG instead of JPEG** (line 40). This is *removing* a step + swapping the encoder — NOT new segmentation work.

---

## Q3 — AUTO-ENHANCE INSERTION POINT

There is **no enhance step today** — **[VERIFIED — BackgroundRemovalModule.swift:9-50]** (the pipeline is load → mask → composite → JPEG, nothing tonal).

**Correct insertion point:** at the top, on the loaded input, **before** the Vision request (before line 21). Convert input to `CIImage`, apply `autoAdjustmentFilters()` chain, render to a corrected `CGImage`, then feed THAT to `VNImageRequestHandler`. Shadow render happens **after** masking.

**Verdict: AGREE with Grace's ordering** (enhance before masking, shadow after masking).

**EXIF caveat [VERIFIED — App.js:1791/1823 + BackgroundRemovalModule.swift:17-18]:** enhance will operate on whatever URI is passed. Production passes `fixed.uri` (already EXIF-baked), so enhance respects the rotation lesson **as long as the caller keeps passing `fixed.uri`.** Note the Swift itself uses `input.cgImage` (line 18), which drops `UIImage.imageOrientation` — see Q9; that's why the JS-side ImageManipulator pre-bake is currently load-bearing.

---

## Q4 — SHADOW RENDERING (bake in Swift vs RN display-time)

**Claim: RN shadow props follow the view rectangle, not the image alpha; so a display-time silhouette shadow isn't viable and must be baked into the PNG.**

**Verdict: AGREE (bake it in) — with a nuance. [NOT CHECKED by running; reasoned from framework behavior + our multi-surface, cross-platform reality]:**
- Android `elevation` shadows are strictly rectangular (bounding box), never alpha-shaped. So a display-time silhouette shadow is impossible on Android regardless.
- iOS RN `shadow*` props *can* sometimes follow layer alpha, but it is inconsistent across RN versions and would differ from Android — unacceptable for a "one identical recipe catalog-wide" brand goal.
- We render item photos on ~11 surfaces (see Q7); a per-surface RN shadow would need re-tuning 11 times and still diverge by platform.
- **Baking the shadow into the PNG** (blurred, offset, gray-tinted copy of the alpha mask composited under the garment, in Swift) gives ONE identical shadow everywhere, on both platforms, on every surface, for free at render time.

**Documented starting recipe (from the industry baseline research, to hard-code as defaults in the parameterized module):**
- Opacity: **0.40** (industry 0.30–0.70; sweet spot 0.40–0.60).
- Color: soft transparent **gray — never pure black** (#000 is a listed mistake).
- Edges: **gaussian blur** (soft; sharp edges = the #1 listed mistake).
- Offset: **small, downward** (garment grounded under the hem; big offsets look fake).
- Consistency: **one identical recipe across every item** (brand recognition).
- Technically: blurred + offset + tinted copy of the **alpha mask**, composited **under** the subject (follows the silhouette, not a rectangle).

---

## Q5 — PNG FILE SIZE (measured on a proxy, honestly labeled)

**I cannot run the iOS Vision pipeline outside a device build [NOT CHECKED — true Vision cutout].** I measured **format overhead on a real photographic sample** (`assets/welcome-screen-photo.jpg`) via `sips` + Python/PIL, resized to 512px:

| Format (512px) | Bytes | vs JPEG |
|---|---|---|
| JPEG q90 (today's format, opaque) | **61,862** (~60 KB) | 1.0× |
| PNG opaque (same pixels) | 247,278 (~242 KB) | ~4.0× |
| PNG tight cutout proxy (~85% garment + transparent margin) | 255,613 (~250 KB) | ~4.1× |
| PNG loose cutout proxy (~55% garment) | 255,395 (~250 KB) | ~4.1× |

**Finding:** transparency barely helps, because the cutout is cropped tight to the garment (`croppedToInstancesExtent: true` — **[VERIFIED — BackgroundRemovalModule.swift:30]**), so photographic garment content dominates and PNG (lossless) can't compress it like JPEG (lossy). **Expect ~3–5× the current file size.**

**Caveats [NOT CHECKED]:** these are proxy numbers on a landscape photo, not a real garment cutout; PIL's PNG encoder ≠ iOS `pngData()`; PIL keeps RGB under transparent pixels whereas a real cutout may zero them (a little smaller). The ~4× ratio is robust regardless.

**Storage/load implication to discuss before committing to PNG:** 50 items × ~250 KB ≈ **12.5 MB** vs ~3 MB today; the closet grid downloads ~4× the bytes per thumbnail. Options to weigh:
- Accept it (small user base, modern connections) — simplest.
- **HEIC with alpha** (iOS encodes natively, ~JPEG size, supports transparency) — but RN/Android/web decode reliability is **[NOT CHECKED]** and risky.
- **WebP** (alpha + lossy, ~JPEG size) — but native iOS WebP *encoding* needs a library (non-trivial in Swift) — **[NOT CHECKED]**.
- Hybrid (white-JPEG for grid, PNG for hanger/mood) — doubles processing + storage complexity; not recommended.

**Recommendation:** PNG for reliability; accept the ~4× size for now; revisit HEIC/WebP only if load-time hurts.

---

## Q6 — UPLOAD + STORAGE RIPPLE (full list, file+line)

For transparent PNG output, these must change:

1. **[VERIFIED — wardrobeItems.js:34]** filename is hardcoded `...${...}.jpg` → needs `.png` (or derive from the actual file).
2. **[VERIFIED — wardrobeItems.js:39]** `upload(path, arrayBuffer, { contentType: 'image/jpeg', ... })` → needs `image/png`.
3. **Mixed-format reality [VERIFIED — App.js:1759 + 1755-1764]:** when Vision returns null (iOS<17, throw, unavailable) the code keeps `fixed.uri`, which is a **JPEG**. So some uploads will be PNG (cutout succeeded) and some JPEG (fallback). Therefore `uploadWardrobePhoto` must **derive extension + contentType from the actual file**, not hardcode either. This is the cleanest fix and handles both.
4. **[VERIFIED — App.js:1508-1509, 1601-1604]** callers pass `photoUri` straight to `uploadWardrobePhoto` with **no ImageManipulator step on the cutout** → good, nothing flattens alpha between cutout and upload. (The ImageManipulator JPEG re-encode at App.js:1784/1816 is only on the *input* to Vision, not the output — alpha is safe.)
5. **Recognition path is unaffected [VERIFIED — clozieRecognition.js:12-15]:** it makes its own JPEG base64 copy for the API; it does not touch the stored photo.
6. **Supabase Storage bucket config [NOT CHECKED]:** the `wardrobe-photos` bucket almost certainly accepts any binary (no format restriction in the client code), but I cannot see the dashboard bucket policy from here — worth a 30-second dashboard confirm before shipping.

---

## Q7 — SURFACE INVENTORY (every place an item photo renders)

All render sites use `item.photoUri` (a signed URL) in an `<Image>`. **[VERIFIED — grep of App.js]:**

| # | Surface | File:line | resizeMode | Container bg | What changes with transparency |
|---|---|---|---|---|---|
| 1 | Closet grid card | App.js:2119-2123 | contain | **#FFFFFF** (gridCardPhoto, App.js:9997) | Floats on white — same look as today, cleaner edges. Neutral/slight ✅ |
| 2 | Add-item preview | App.js:2257-2261 | cover | (panel) | `cover` may crop edges; transparent margins show panel bg. Minor. |
| 3 | Pin selector sheet grid | App.js:2933-2937 | contain | (sheet card) | Floats on sheet bg. Fine. |
| 4 | Mood accessory cell | App.js:3119-3122 | default (cover) | placeholder color fallback | Fine; cover crop unchanged. |
| 5 | Mood polaroid | App.js:3186-3194 | Shoes contain / else cover | placeholder color (App.js:3200) | Floats in polaroid frame. Fine. |
| 6 | Share Card | App.js:3269-3270 | (photoImage) | **#F5F0E8** cream (photoThumb, App.js:3324) | Floats on cream. Fine ✅ (shared externally — worth a visual check). |
| 7 | Your Looks card strip | App.js:3972-3973 | (photoStripThumbImage) | (card) | Floats on card. Fine. |
| 8 | Hanger: dress/top/pants/shoes | App.js:4398-4446 | contain | **stageBg selector** (App.js:4321): Cream/White/Sage/**Dark**/Sage green | **BIG WIN.** Today white-JPEG shows a white rectangle on the Dark/Sage stages; transparent PNG floats the garment on the chosen bg = the intended premium hanger look ✅✅ |
| 9 | Hanger: side outerwear | App.js:4466-4467 | contain | stageBg | Same win. |
| 10 | Hanger: accessories | App.js:4502-4503 | contain | stageBg | Same win. |
| 11 | Saved Outfits strip | App.js:4738-4739 | contain | (card) | Floats on card. Fine. |
| 12 | Your Week mini card | App.js:4905-4909 | cover | (white card) | Fine. |
| (—) | Settings test modal | App.js:7101/7118 | contain | (modal) | Diagnostics only. |

**Overall Q7 verdict:** transparency is **neutral-to-positive everywhere**, and a **clear win on the Hanger** (surfaces 8-10) where white rectangles on dark/sage backgrounds look broken today. No surface *requires* a white/opaque photo. **[NOT CHECKED visually — cannot render]:** exact look under transparency needs one on-device pass, especially `cover` surfaces (2, 4, 12) where edge cropping meets transparent margins.

**Tall-dress cropping note (as instructed — DO NOT touch):** the deliberately-tuned dress cropping lives on the Your Looks card strip (surface 7, App.js:3972) and the Mood polaroid (surface 5, App.js:3186-3194), plus the Hanger dress slot (App.js:5536-5551, comment explicitly warns the flex-start + 88% height combo is load-bearing). **Read git history before ANY future change there.** Inventory only; nothing changed.

---

## Q8 — RE-PROCESS EXISTING ITEMS (Grace's decision: CORE)

**Do we still have originals, or only processed images? — ONLY the processed 512px images. [VERIFIED — App.js:1782-1790, 1508-1509]:** the raw pick (`original.uri`) is never uploaded; only `fixed.uri`/cutout (512px) goes to Storage. So existing items are **512px white-composite JPEGs** (for items added since Build 25's BG removal), and possibly **512px plain photos** for older items added before BG removal shipped. No originals to fall back to.

**Can Vision re-segment a garment off a plain white background? — Likely yes, with caveats. [NOT CHECKED — cannot run Vision]:**
- `VNGenerateForegroundInstanceMaskRequest` works on any image and is *strongest* on clean product-on-white photos, so re-segmenting our white JPEGs should generally succeed.
- **Risk 1:** white/cream/light garments on white bg = low edge contrast → possible under-segmentation (garment edges eaten or whole frame kept).
- **Risk 2:** double-processing — re-enhancing an already-processed, already-JPEG-compressed 512px image adds mild quality loss. Consider **skipping re-enhance on already-processed items** (enhance mainly helps raw photos); re-segment + shadow only.
- **Risk 3:** pre-BG-removal older items are raw photos with real backgrounds — re-processing those is actually ideal (that's what the pipeline is for).

**Mechanics — recommended:**
- A **manual "Refresh my closet ✦" button** (e.g. in Settings or My Closet), NOT auto-on-open. Auto-on-open risks battery/CPU spikes and surprising the user; a manual one-tap batch is safer and, with a small user base, cheap.
- Batch loop: for each item → download stored image → `removeBackground` (with PNG+shadow options) → re-upload → update `photo_path`. Show progress ("12 of 40…").
- **Per-item failure handling:** on null/throw, **keep the existing image untouched** (same contract as the add flow, App.js:1759). Never blank an item. Optionally log which items were skipped so the user can re-shoot them.
- **Idempotency:** store a marker (e.g. a `photo_v2` boolean or filename suffix) so re-running only processes un-migrated items.

**Honest risk statement:** the migration's quality is **[NOT CHECKED]** until run on real closet data on-device. Recommend testing on Grace's own closet first (TestFlight) before offering it to others.

---

## Q9 — RIDERS

**Swift EXIF rotation fix (backlogged):**
- **[VERIFIED — BackgroundRemovalModule.swift:17-18]** the module does `UIImage(contentsOfFile:)` then `input.cgImage`, which **drops `UIImage.imageOrientation`**. Today this is masked because production always passes the JS-side EXIF-baked `fixed.uri`. But the test modal (App.js:6372) passing raw `original` would show rotation, and it's fragile.
- **Fix:** normalize orientation in Swift before `cgImage` (redraw the UIImage upright into a context, or read/apply `imageOrientation`). ~10 lines.
- **Verdict: AGREE it can ride in the same native build at near-zero risk** — it's additive, self-contained, and makes the module robust regardless of caller. Recommend including it.

**Wrinkle hint:**
- **[NOT CHECKED]** — I did not find an existing "wrinkle hint" implementation in the code (no matching reference surfaced). If it means a UI text nudge ("lay the item flat / smooth wrinkles for the best cutout") on the add-item panel, that is **JS-only** and low risk. If it means *detecting* wrinkles, that's a much larger vision task — out of scope. Recommend the UI-hint interpretation; confirm with Grace what she means before building.

---

## PROPOSED BUILD 26 PLAN (my recommendation)

**Guiding principle:** land ALL native (Swift) work in ONE build so Style Council value-tuning afterward never needs another Swift change.

**Native build #1 (the only planned Swift build) — bundles:**
1. Parameterize `removeBackground(imageUri, options)` — options: `enhanceStrength`, `shadowOpacity`, `shadowBlur`, `shadowOffsetX/Y`, `shadowColor`, `outputFormat`. (Q1)
2. Auto-enhance via `autoAdjustmentFilters()` before masking, blended by `enhanceStrength` (start 1.0). (Q3)
3. Transparent PNG output (skip white composite, `pngData`), gated by `outputFormat`. (Q2)
4. Baked silhouette shadow (blurred/offset/gray-tinted alpha mask under garment), defaults = the Q4 industry recipe. (Q4)
5. **Rider:** Swift EXIF orientation normalization. (Q9)

**JS changes in the same build (no extra native cost):**
- `uploadWardrobePhoto`: derive extension + contentType from the actual file (handles PNG cutout + JPEG fallback). (Q6)
- Callers pass an `options` object with the starting recipe values. (Q1)
- "Refresh my closet ✦" migration button + batch logic + per-item keep-on-fail. (Q8)
- Optional wrinkle UI hint text, if confirmed. (Q9)

**After Build 26 — tuning rounds:** change option *values* only (JS diff) → new TestFlight build (or dev-client hot reload if that path is set up). **No Swift recompile.** This is where Zuzia/Style Council dial in shadow + enhance on real cutouts.

**Build count:** ideally **1 native build** for the whole feature, then N cheap JS-only tuning builds. If we split for safety (Grace's one-step-at-a-time preference), a low-risk ordering is: (a) parameterize + PNG output first (see cutouts float), (b) enhance, (c) baked shadow, (d) migration button, (e) EXIF rider — but each of a-c-e is Swift, so **grouping all Swift into one build is far cheaper** given the ~15 builds/month ceiling. **My recommendation: one Swift build, sequenced internally, tested on TestFlight.**

**Open decisions for Grace / Council (nothing assumed):**
- PNG ~4× size — accept, or investigate HEIC/WebP? (Q5)
- Re-enhance on migration, or re-segment+shadow only for already-processed items? (Q8)
- Migration: manual button (recommended) vs auto-on-open? (Q8)
- Dev-client for cheap tuning, or TestFlight per round? (Q1)
- Wrinkle hint = UI text vs detection? (Q9)

**Untouched this session:** Edge Function, SYSTEM_PROMPT (stays 2,510), eas.json, Supabase, all product code. Only `app.config.js` + `package.json` version strings changed (Part A, held for end-of-session commit).
