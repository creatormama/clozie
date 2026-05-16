# CLOZIE — Master Build Document

FILE NAME: CLAUDE.md
WHAT GRACE CALLS IT: Clozie MD / the master file
WHAT CLAUDE CODE CALLS IT: CLAUDE.md (must use this exact name)
HOW TO USE: Drop this file into the root of your clozie-native project folder. Claude Code reads it automatically every session. In claude.ai planning chats — paste the full contents.

READ THIS ENTIRE FILE before doing anything. No exceptions.

Last updated: May 16 2026 — Session 9A/9B/9C wired (outfit history persistence — rating + wore today + save/unsave). New `outfit_history` Supabase table (4 RLS policies + GRANTs scoped to authenticated, created via dashboard SQL Editor). New `src/lib/outfitHistory.js` helper exports `upsertOutfitInteraction(outfit, context, patch)` (UPSERT on `(user_id, client_outfit_id)` unique index; handles `{ rating }`, `{ saved }`, `{ appendWornDate }` patches; worn-date append is read-modify-write to silently dedupe same-day re-taps), `fetchSavedOutfits()` (newest-saved-first, written for Session 12 — not yet called), and `markItemsWorn(itemIds)` (bumps `wardrobe_items.times_worn` + `last_worn` per item, best-effort). App.js: two MainAppScreen wrappers (`handlePersistInteraction` curries `lastPayload` away, `handleMarkItemsWorn` fire-and-forget); passed as `onPersistInteraction` + `onMarkItemsWorn` props to YourLooksTab. `handleRate`, `handleWornToday`, `toggleSave` all changed to accept full `outfit` object instead of `outfit.id` so the snapshot can be written. Call sites updated. Local UI behavior identical (toasts, button states, Saved Outfits modal current-session filter all unchanged). Lazy persistence — row inserted only on first interaction. Pre-existing bug surfaced and fixed: original `handleWornToday` only flipped the transient toast flag — never touched any wardrobe item state, so the spec ("saves today's date against every item in this outfit") was essentially unbuilt until Step 3. Verified end-to-end on iPhone: rating UPSERT (re-rating same outfit updates same row, no duplicate); wore-today same-day dedupe (second tap silently no-ops); `wardrobe_items.times_worn` increments correctly across multiple outfits sharing items; save/unsave flips `saved` boolean cleanly with `saved_at` toggling between ISO timestamp and null; rating + save + wear coexist on a single row. Step 5 of original plan (lift savedOutfits to MainAppScreen + load from DB + render Saved Outfits from DB snapshots) DEFERRED to Session 12 (Saved Outfits + Search) where Mood Board polaroid placeholders + Hanger View `item.image` mismatch will also be fixed (Sessions 9D + 9E land later today). Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens. Zero CLI deploys. May 16 2026 — Session 8 wired (AI Consent Modal + Keyboard Fixes + Today's Vibe Polish). Four tasks complete, all in `App.js` only — Edge Function NOT touched, SYSTEM_PROMPT NOT touched, prompt cache stays at 2,375 tokens, no CLI deploys this session. (1) AI Consent Modal (Apple Guideline 5.1.2i) — new `ConsentModal` function component renders modal with title "Before Clozie styles you", body naming Anthropic explicitly, tappable `anthropic.com/privacy` link (opens via `Linking.openURL`), "Accept — I'm ready to style ✦" sage button, "Not now" plain text link. State (`consentGiven`, `consentLoaded`, `showConsentModal`, `pendingPayload`) lives in MainAppScreen, loaded from `user_metadata.ai_consent_given` on mount via existing `supabase.auth.getUser()` pattern. Gate inserted at top of `handleGenerate` before spam-tap guard: if `consentLoaded && !consentGiven`, stash payload + show modal + return. Accept saves `ai_consent_given: true` via `supabase.auth.updateUser({ data: {...} })` (best-effort — local state flips regardless so a transient network blip doesn't block the user), then calls `handleGenerate(stash, { skipConsentCheck: true })` to resume generation. Decline closes modal + clears pendingPayload (no save, no generation). Persistence verified across sign-out / sign-in cycle. Same `auth.user_metadata` pattern used by style profile (Session 7b-0) — no new Supabase table, no Edge Function change. (2) KeyboardAvoidingView fixes — wrapped StyleDNATab ScrollView, TodaysVibeTab ScrollView, SettingsScreen ScrollView, and Delete Account Modal's overlay each with `<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>`. AuthScreen + WardrobeTab already had KAV (verified directly from code, not assumed). My Closet KAV touch skipped per Grace's directive (Session 15 redesign). All KAV wrappers include `keyboardShouldPersistTaps='handled'` on their inner ScrollViews so chip taps work while the keyboard is open. (3) Placeholder contrast fix — Today's Vibe Brief field placeholder `rgba(44,26,14,0.40)` → `0.65`; StyleDNA "I never want to wear" placeholder `rgba(44,26,14,0.35)` → `0.65`. Now matches WardrobeTab Add Item placeholders for consistency across the app. (4) Today's Vibe empty state — when `wardrobeItems.length === 0`, TodaysVibeTab early-returns a centered empty state (message "Add a few pieces to your closet first — Clozie will do the rest." + sage "Go to My Closet →" button — text-only, no title per Grace's choice). New `onGoToCloset` prop on TodaysVibeTab, MainAppScreen passes `() => setActiveTab(1)`. Empty-state styles added to `vibeStyles` matching `looksStyles.emptyButton` pattern. The full weather/occasion/Brief/Generate UI is replaced until at least one item exists — friendlier than letting the user tap Generate and hit the `not_enough_items` gate. Thirteen tiny LOW-risk sub-steps total (Task 1: 5, Task 2: 4, Task 3: 1, Task 4: 3), each tested on iPhone before the next. App.js net diff approximately +205 lines, zero deletions. Zero Edge Function deploys. No changes to `recognize-photo`, `delete-user`, or `generate-outfits` at any point in the session. May 14 2026 — Session 7C wired (JavaScript Smart Fallback). New `buildSmartFallback` function in `generate-outfits` Edge Function fires when Anthropic fails for any reason (timeout / 5xx / 429 / malformed JSON / schema validation / name→UUID mapping failure). Returns 3 outfits with editorial-occasion names from per-occasion pools (Casual Day → "Easy Sunday" / "Weekend Edit" / "Off-Duty Ease" / "Sunday Morning" / "Relaxed & Ready"; Work · Office → "Morning Confidence" / "Desk Ready" / "Clean Lines" / "Office Elevated" / "Power Soft"; Going Out → "Night Mode" / "After Hours" / "Evening Edge" / "Out Tonight" / "Weekend Night"; Formal Event; Outdoor · Sport; Weekend Errands; Travel). Color-aware composition (neutral / earth / navy family pairing with navy+earth clash detection); pinned-item enforcement (forced into every outfit); item-aware descriptions ("[colour first-word] with [colour first-word] — [mood]."). Uses safety-filtered `filteredItems` pool with soft-fail revert to unfiltered `items` if pool went thin. If `buildSmartFallback` itself throws, last-resort to existing `buildStubOutfits` — 3-tier safety net (Sonnet → smart fallback → stub) live in production. New response `source` values: `"sonnet" | "fallback" | "stub"`. Built across 5 verified deploys (constants → function → handler wiring → force-on-test → revert) via Supabase CLI from `index.ts`, each tested on iPhone before next. SYSTEM_PROMPT NOT touched — cache stayed at 2,375 tokens across every deploy. App.js NOT touched at any point this session. Verified force-on test against Casual Day / Formal Event / Going Out — names from pools, real photos, source "fallback", no Anthropic API cost, all safety filters active. After revert: Sonnet editorial names back, cache 2,375, source "sonnet" across Casual Day / Work · Office / Outdoor · Sport. May 14 2026 — Session 7b-7 wired (dislikes hard filter + Regenerate button). Edge Function: new dislikes hard filter inside `applySafetyFilters` after the existing C1–C5 / occasion filters, reading `styleProfile.neverWear` from request body. Tokenization: split on commas + semicolons, lowercase, trim, drop empties, drop stopwords (`anything`, `the`, `a`, `an`, `no`, `hate`, `nothing`, `with`), minimum token length 4 (avoids `tan` matching `tank top`, `red` matching `adidas`). Match on `name + colour` only — `notes` is free-form text and would over-filter. Pinned item exempt (user pinned it deliberately — overrides dislikes). Soft-fail safety net unchanged. One CLI deploy via `supabase functions deploy generate-outfits --project-ref sbiwuqjnwjgjazxlyfhb --use-api` (no `--yes` flag, per 7b-6 lesson). Verified on iPhone: chiffon, cotton, leather, boots all correctly filtered when entered in My Style; pin override works; cache safe at 2,375 tokens across all calls. App.js: Regenerate button (🔄) and Save Feedback & Style Again → both fire real Edge Function via new `lastPayload` state in MainAppScreen + new `onRegenerate` prop on YourLooksTab. Fake 2-second `setTimeout` + manual `setLoading` / `setHasGenerated` / `spinAnim` from old local handler deleted — redundant since lifted useEffect at App.js:2373-2392 drives those from `generationStatus`. Local UI resets preserved (ratings, feedback, wornToday, boutique panels) before firing `onRegenerate()`. Both buttons share the local handler; Session 9 will split when ratings → Supabase wiring lands. Tested on iPhone across 4 scenarios — fresh editorial names, resets clear, spam-tap guard intact. SYSTEM_PROMPT NOT touched. Known curiosity: `[generate-outfits] dislikes filter dropped N items` log line does not appear in Supabase Logs even when filter is firing (iPhone behavior confirms drops happen) — visibility issue only, separate polish session. Three Session 9 candidates surfaced from read-only code check at session start: (1) Mood Board polaroids render solid-color tiles via `MOOD_PLACEHOLDER_COLORS` instead of real photos via `<Image source={{ uri: item.photoUri }} />` — already in Known Issues; (2) Hanger View reads `top.image` instead of `top.photoUri` at App.js:2894-2897 so real wardrobe items always fall through to placeholder — new Known Issue; (3) Share Outfit button at App.js:2607-2613 has NO `onPress` prop — tap does literally nothing, new Known Issue. All three deferred to Session 9. May 13 2026 — Session 7b-6 cleanup wired (skirt filter + weather hint + outerwear tags + Padding Section 7 + diagnostic log cleanup confirmation). Five Edge Function deploys via CLI on `generate-outfits`, each verified on iPhone with cache health intact. Five concrete changes to `index.ts` (App.js NOT touched): (1) new `SKIRT_PATTERN = /skirt/i` constant + filter block in `applySafetyFilters` for `occasion === 'Outdoor · Sport'` — drops items whose name contains `skirt` from the Bottoms category, pinned exempt, soft-fail safety net unchanged; substring (not word-boundary) regex chosen to catch `miniskirt` single-word edge case (real-world false-positive risk in clothing-pool context is effectively zero). (2) new `buildWeatherHint(temperature, condition)` helper between `buildCompressedPool` and `buildFreshContent` — emits a per-call STYLING NOTES bullet echoing the cached system prompt's COMPOSITION RULES line 7 (Cold → "prefer Heavy/Medium warmth"; Hot → "prefer Light/None warmth, avoid heavy wool"; Rainy → "avoid delicate fabrics, prefer closed-toe shoes"; Snowy → "prefer closed-toe boots"), returns null for Cool/Warm + Sunny/Cloudy where no specific rule applies, wired into stylingLines right after the identity line; ~15-30 user-message tokens per call, zero system-prompt impact. (3) `buildCompressedPool` warmth-tag block rewritten — column wins when populated AND not 'None'; otherwise falls back to HEAVY_OUTERWEAR regex first (bias toward safer "heavy-mistagged-as-light is the more dangerous failure mode") then LIGHT_OUTERWEAR; no tag for unrecognized outerwear (avoids lying to Sonnet about unknown warmth). Existing regex constants reused unchanged. Outerwear-only — other categories untouched. Pre-existing column-wins behavior preserved for the day warmth UI ships. (4) Padding Section 7 "FINISHING TOUCHES" appended to SYSTEM_PROMPT — codifies accessory rules by occasion (Outdoor · Sport zero accessories, Casual / Weekend / Travel understated, Work / Office polished and intentional, Going Out / Date Night one statement piece — bold earrings OR a necklace, never both at once — Formal one focal point), explicit "Never include bags in outfit selections. Even if bags exist in the wardrobe pool, skip them. She chooses her own bag." directive, one-focal-point-per-outfit constraint, "at least one of three outfits should include accessories when they exist in the wardrobe. Never force accessories into all three" balance rule. Section 7 body: 962 bytes / ~243 tokens added per Anthropic's tokenizer. New SYSTEM_PROMPT total: ~2,375 tokens (verified via Call 2 `cache_read_input_tokens` = 2,375), 327 tokens / ~16% margin above the 2,048 caching threshold — best margin to date. Cache reset cleanly: Call 1 `cache_creation_input_tokens` ~2,375, Call 2 `cache_read_input_tokens` ~2,375 (exact round-trip). One-time cache-write cost ~$0.009. (5) Diagnostic log cleanup — local `index.ts` confirmed clean of `[7b6-sentinel-v2]` / `[7b6-literal-check]` / `[diag-5b]` markers via grep at session start; the five CLI deploys this session overwrote any stale runtime markers regardless — no code edit needed. Two discoveries mid-session: (i) FIRST CLI deploy attempt of the session reported `Deployed Functions on project sbiwuqjnwjgjazxlyfhb: generate-outfits` success but logs and dashboard search proved nothing propagated (SKIRT_PATTERN 0/0 in Supabase Code tab, last-deploy timestamp showed 20h old). Root cause never definitively isolated; working hypothesis is the `--yes` flag on the CLAUDE.md-documented command may have caused a silent failure path. Removing `--yes` from subsequent deploys + running them via Bash tool (inherits the project working directory automatically) made all five subsequent deploys propagate cleanly. (ii) Supabase dashboard "Code" tab is a STALE EDITOR VIEW, NOT a live runtime mirror. Even after a successful CLI deploy with `Last deployed` timestamp showing "a minute ago", the Code tab continued showing the OLD code — Cmd+F for newly-added constants returned 0/0 — but iPhone behavior + Supabase Logs confirmed the new code was actually running. Verification must go via iPhone + Logs from here on; never trust the Code tab for deploy verification. App.js NOT touched at any point. Two KNOWN ISSUES resolved: the May 11 paused-state "deploy propagation BLOCKER" (now closed — both clipboard-corruption root cause from May 12 archive AND today's silent-first-deploy-failure are isolated; CLI-from-disk workflow is now battle-tested across five successful deploys in one session) AND the May 12 "Diagnostic logs still in production" item (overwritten by today's deploys). One NEW KNOWN ISSUE added: Supabase dashboard "Code" tab is a stale editor view; never use for deploy verification. May 12 2026 — Session 7b-6 CLI deploy + CLAUDE.md corrections. supabase functions deploy via CLI (--use-api) bypasses dashboard paste and clipboard locale corruption (awk + pbcopy decoded file bytes as MacRoman, mangling em-dashes 0xE2 0x80 0x94 → ‚Äî 7-byte mojibake and middots 0xC2 0xB7 → ¬∑ 5-byte mojibake — silently broke every prior dashboard-paste deploy since 7b-4; chat-paste truncated content for files >40KB). Canonical v5 SYSTEM_PROMPT token count CORRECTED from 2,267 to 2,132 (every prior cache_read measurement at 2,267 was reading mojibake-inflated content — 27 em-dashes × ~5 extra tokens each). Cache still healthy at 2,132 (above 2,048 threshold by 84 tokens / 4% headroom — thinner than the 11% docs previously claimed but real). FANCY_DRESS_PATTERN filter added for Outdoor · Sport (drops chiffon/silk/satin/velvet/lace/organza/tulle/sequin/beaded/gown/evening/cocktail dresses; pinned exempt). New files: `supabase/config.toml` and `supabase/functions/generate-outfits/index.ts` (extracted from README via Python binary I/O — preserves all 84 em-dashes and 13 middots byte-perfectly). Diagnostic logs `[7b6-sentinel-v2]`, `[7b6-literal-check]`, `[diag-5b]` still firing in production — remove via CLI in a future cleanup pass. CLAUDE.md corrections in same session: D-U-N-S RECEIVED status (was "request ~2 weeks before App Store submission"), Anthropic spend cap $100 dev / $50 alert (was $50/$200), @styledbyclozie Instagram handle (was @cloziestyle), "Outfit name in DM Serif Display" font fix (was "Playfair" — conflicted with locked design system), clozieapp.com noted as Resend SMTP delivery domain (was missing). Steps 8 (weather constraint hints in user message) and 9 (Heavy/Light warmth labels in compressed pool + styling signal extraction) both deferred — Step 9 bundled with the deferred warmth UI session since both depend on warmth column being populated. App.js NOT touched. CLAUDE_May12_2026.md backup placed on Desktop. Workflow change: future Edge Function deploys MUST use `supabase functions deploy --use-api` (not dashboard paste). May 10 2026 — JS Safety Filters wired (Session 7b-5) — added five weather/indoor safety filters to the `generate-outfits` Edge Function (C1 Cold, C2 Hot, C3 Rainy, C4 Snowy, C5 Indoor) via a new `applySafetyFilters` function called between gate 6 and the Anthropic call. Pinned item exempt from all filters. Soft-fail safety net reverts to the unfiltered pool if filters break the essentials gate. C1 drops Light/None warmth from Tops/Dresses; C2 drops Heavy warmth from all categories; C3 drops names containing `suede`, `sandal`, `open-toe`, `mule`; C4 drops `suede`/`espadrille`/`sandal`/`open-toe`/`flip-flop`/`stiletto` substrings plus word-boundary regex `/\bheels?\b/` and `/\bpumps?\b/` (avoids `wheel`/`pumpkin` false positives) — snow is the one weather where heels ARE filtered, as safety not taste; C5 drops Heavy Outerwear when "I'll be indoors" toggle is ON. Also added: inert `computeOutfitPotential` stub helper for Session 9, and a category imbalance flag in the user message (fires only when bottoms ≤ 2 AND tops > 8 — tells Sonnet to vary the styling rather than reusing the same combination). Discovery mid-session: `warmth` column is NULL on every wardrobe item — warmth UI was deferred from Sessions 6A and 6B and never built. C1, C2, and C5 are therefore DORMANT today (zero items match `warmth === 'Light'` etc.) but will activate the moment warmth gets populated, with no code change needed. C3 and C4 work today via name-pattern matching. Dynamic outfit count from the original plan (STEP 4) was explicitly KILLED to protect the 2,267-token cached system prompt — three outfits stays as the spec. STEP 3 (pool format), STEP 5 (absent-category flags), STEP 7 (small-wardrobe framing) all SKIPPED — already wired in 7b-3. Six deploys total, each tested on iPhone before the next, `cache_read_input_tokens=2267` confirmed intact after each deploy. App.js was NOT opened or edited at any point in this session — all changes were inside `supabase/functions/generate-outfits/README.md` (the source-of-truth backup) and pasted into the deployed Edge Function via the Supabase dashboard. Warmth UI + SQL heuristic backfill deferred to a dedicated warmth session. May 10 2026 — Prompt caching fixed (Session 7b-4) — Anthropic prompt caching now works on every generate-outfits call. Two surgical Edge Function changes in two separate deploys: (1) removed Session 7b-3's temporary diagnostic `console.log('[generate-outfits] raw AI text:', text)` in callAnthropic; (2) replaced the deployed SYSTEM_PROMPT (~1,720 tokens — below Sonnet 4.6's 2,048-token caching threshold, which is why cache_control was being silently ignored on every call) with the v5 padded prompt designed by the Style Council/Business Council on May 8 2026 — 7,714 chars / 187 lines / 2,267 actual tokens per Anthropic's tokenizer, comfortably above 2,048 by ~219 tokens (11% margin). Both `{{requestedOutfits}}` template placeholders substituted to literal `3` before paste (REQUESTED_OUTFITS is hardcoded to 3 in the Edge Function — no template substitution wired in code). Verified end-to-end on iPhone with raw Supabase log paste from browser (after Grace sanity-checked her hand-typed-from-photo numbers against the raw copy — both matched exactly): Call 1 `cache_creation_input_tokens`=2267, `cache_read_input_tokens`=0, `input_tokens`=274, `output_tokens`=464. Call 2 (within 5 min): `cache_creation_input_tokens`=271, `cache_read_input_tokens`=2267, `input_tokens`=3, `output_tokens`=374. The 2,267-token round-trip on Call 2 is the smoking gun — system prompt is cached and read back at 0.10× cost. input_tokens collapsed 274 → 3 on cached call. Estimated cost impact: ~4–4.5× cheaper input on every cached call within the 5-min TTL window. KNOWN curiosity: Call 2's `cache_creation_input_tokens`=271 alongside the 2,267 cache_read appears to be Anthropic auto-extending the cache into portions of the user message even though our code declares only one `cache_control` breakpoint on the system prompt. Cosmetic, not blocking — flagged as a possible future optimisation (add explicit `cache_control` on the user message content block too). App.js was NOT opened or edited at any point in this session — all changes were inside `supabase/functions/generate-outfits/README.md` (the source-of-truth backup) and pasted into the deployed Supabase Edge Function via the dashboard. May 10 2026 — Real Anthropic call live (Session 7b-3) — generate-outfits Edge Function now fires real Sonnet 4.6 with editorial outfit names on iPhone (verified "Cream & Cool" and "Boho Off-Duty" rendering with real descriptions and real wardrobe items). Three sequential bugs hunted via Supabase logs and a temporary `raw AI text:` debug log: (1) greedy JSON regex `/\{[\s\S]*\}/` slurped from first `{` to LAST `}` in Sonnet's response, joining the JSON object with trailing prose — replaced with a brace-walk that stops at the first balanced `{...}` block; (2) Sonnet was hitting the `max_tokens: 500` ceiling and being truncated mid-JSON (output_tokens equaled exactly 500) — bumped to 1500; (3) Sonnet returned items in full pool format like "Knit Cotton Sweater | Tops | Camel" instead of just the name — name-to-UUID lookup now splits on `|` and uses only the first segment as the lookup key. All three fixes are surgical edits inside `supabase/functions/generate-outfits/README.md` (and the deployed Supabase Edge Function). One temporary debug log added (`console.log('[generate-outfits] raw AI text:', text)`) — leave in place for now, remove in a polish pass before App Store submission. KNOWN: Anthropic prompt caching reports `cache_creation_input_tokens: 0` AND `cache_read_input_tokens: 0` on every call — caching is not working, costing ~10× expected on every generate. Separate session. May 9 2026 — Client wiring Session 7b-2 complete (`src/lib/outfitGeneration.js` helper created; Generate button sends full payload to Edge Function; `hasTriggeredGenerate` replaced with proper state — idle/loading/success/error; Edge Function item IDs resolved to full WardrobeItem objects on client; 3 gate errors mapped to warm Clozie messages; outfit card photo strip + saved outfits photo strip now render real wardrobe photos via signed URLs; stub outfits display end-to-end on iPhone using user's real closet items). May 9 2026 — generate-outfits Edge Function Session 7b-1 wired (skeleton + stub response — no Anthropic call yet; auth-gated, JWT verify ON; accepts temperature/condition/occasion/indoors/pinnedItemId/brief/styleProfile; three gates — minimum 5 styleable items + (Tops AND Bottoms) OR Dresses + valid pin; returns 3 stub outfits with real wardrobe item UUIDs and source: "stub"; tested via curl; client wiring deferred to Session 7b-2). May 9 2026 — My Style Persistence Session 7b-0 wired (style profile — selected styles, colour palettes, and never-wear text — now persists in Supabase via auth.user_metadata; loads on My Style tab mount; saves when user taps Build My Closet; Skip does not save; gentle terracotta inline error if save fails). May 8 2026 — Outfit Edge Function Session 7a wired (photo recognition migrated to Supabase Edge Function `recognize-photo`; Anthropic API key removed from client `.env` and `app.config.js`; key now lives ONLY in Supabase Edge Function secrets as ANTHROPIC_API_KEY; auth-gated; closes the API-key-in-client vulnerability described in Legal Tracker §14.10). May 8 2026 — Photo Recognition Session 6B wired (camera + gallery photos auto-recognized via Claude Sonnet 4.6, fields auto-fill while preserving user-typed content, terracotta CLOZIE RECOGNISED eyebrow inside the sage success bar, terracotta auto-fill border on Clozie-filled fields that clears on user edit, retake refreshes scan via React functional setters). May 7 2026 — Supabase Wardrobe Session 6A wired (wardrobe_items table + private wardrobe-photos Storage bucket + RLS policies; full Add/Edit/Delete CRUD persists to Supabase; photos upload via arrayBuffer; signed URLs for display; cross-user isolation verified). May 6 2026 — Photo Upload Session 5 wired (camera + gallery in Add Item panel via expo-image-picker; EXIF orientation fix via expo-image-manipulator; photos save with closet items in local state; edit flow preserves photos). May 5 2026: VIP investigation complete (no code changes; VIP work deferred to Session 9). May 4 2026: Supabase auth Session 2 wired (Settings Sign Out, Forgot Password, Update Password, Clear Memory stub, Delete Account). May 3 2026: Sections 1-3 cleanup + Supabase auth Session 1.
Original: March 24 2026 — REBUILD RULE and testing branch rule added.

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

VIP INVESTIGATION COMPLETE (May 5, 2026): Native app confirmed clean — zero hardcoded VIP emails in App.js, src/lib/supabase.js, or Edge Function. No VIP/bypass logic exists yet. VIP table creation, VIP check on login, and VIP bypass wiring are all deferred to the session that builds limits and caps (Session 9). The 4 VIP emails remain unchanged.

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

- 30 wardrobe items maximum
- 12 sessions per week (36 outfits) — rolling 7-day window

Rolling 7-day window: When a user tries to generate, the Edge Function counts their sessions in the last 7 days. If < 12, allow. If >= 12, block and show over-cap error. No cron job, no timezone math.

Session counter only increments on successful API response containing 3 complete outfits. Failed, timed out, or malformed responses do not count.

NUDGE MESSAGES — never a hard wall, always a warm invitation:

At 28 items show: "2 spots left in your wardrobe."
At 30 items show: "Your wardrobe is full."
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

UI terracotta (eyebrows, vibe tags, active tab): #A44A34 — replaces #C87A52 for text. Logo "zie" stays #C87A52.

Fonts: DM Serif Display (logo, titles, outfit names, tagline — 'zie' always italic) + Outfit (all UI, buttons, chips, labels, body text). Both from Google Fonts.

Rejected fonts — never use: Cormorant Garamond, Playfair Display, DM Mono.

Category tag pill: background rgba(188,199,183,0.30), text #5C4A3A. Unified — all 6 categories use the same sage green pill. No per-category color mapping. Font: Outfit, 11px, weight 500, letter-spacing 0.3px, border-radius 100px, padding 2px 10px.

Warmth tag (None/Light/Medium/Heavy) is NOT displayed on the closet grid card. It is stored on the item data and used by the AI for outfit generation. The user sets warmth when adding/editing an item — it is not visible in the closet browse view.

Screen heading layout: no eyebrow labels above headings. Screen titles stand alone in DM Serif Display. The old pattern of small caps labels (e.g. 'YOUR STYLE DNA', 'YOUR WARDROBE', 'TODAY'S VIBE', 'YOUR LOOKS') above headings is removed. Eyebrow labels are ONLY used inside cards as section labels (e.g. 'STYLES I LOVE', 'WEATHER') — never as screen-level headers.

---

# DECISIONS GRACE STILL NEEDS TO MAKE — DO NOT PROCEED WITHOUT HER INSTRUCTION

These are confirmed open decisions. Do NOT make any of them without Grace explicitly saying so.

- Color scheme: Keep current black/gold OR switch to Option B (Deep Teal + Warm Coral) OR Option A/C/D — PENDING — current black/gold stays until Grace decides
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

- Main branch = frozen web app at clozie.vercel.app — NEVER touch it
- Native app is built on a separate testing branch from day one
- When a screen is confirmed working on iPhone — merge to main. Not before.
- If something breaks on testing branch — revert immediately. Main is always safe.
- This is set up by Claude Code on day one — Grace does not need to do this manually

---

# EDGE FUNCTION DEPLOY POLICY — LOCKED 2026-05-12

NON-NEGOTIABLE. NO EXCEPTIONS.

ALL Supabase Edge Function deploys go via the Supabase CLI from local disk. Never paste into the Supabase dashboard editor.

Command: `supabase functions deploy <function-name> --project-ref sbiwuqjnwjgjazxlyfhb --use-api --yes`

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
3. Authenticate: PAT stored in macOS Keychain as `supabase-pat-clozie` (created 2026-05-12, scoped to `/usr/bin/security` only via `-T` flag — no auth dialog on read). Read via: `SUPABASE_ACCESS_TOKEN=$(security find-generic-password -s 'supabase-pat-clozie' -w)`. To rotate: revoke at https://supabase.com/dashboard/account/tokens, generate new PAT, then run `security add-generic-password -U -s "supabase-pat-clozie" -a "$USER" -w "<new-PAT>" -T /usr/bin/security` (the `-U` flag updates the existing entry).
4. Deploy: `supabase functions deploy <function-name> --project-ref sbiwuqjnwjgjazxlyfhb --use-api --yes`
5. Verify on iPhone — generate, check Supabase logs for cache_creation/cache_read tokens

The Supabase dashboard editor remains fine for VIEWING deployed code. NEVER use it for deploying.

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
- ⚠️ Safe area debt: logoBlock top:80 and bottomBlock bottom:60 use fixed values — fix with useSafeAreaInsets when changing Welcome screen photo.

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
- ⚠️ Safe area debt: logoBlock top:80 and bottomBlock bottom:60 use fixed values — fix with useSafeAreaInsets when changing Welcome screen photo.

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

Landing screen behaviour:
- After first login (new user): lands on My Style tab.
- Every subsequent app open (returning user): lands on Today's Vibe tab.

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

- Item count in gold top right e.g. "12/30 items"
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
- ✓ Up to 30 wardrobe items
- ✓ 12 sessions per week (36 outfits)
- ✓ Clozie styling + learning
- ✓ Saved favourites
- ✓ style profile
- ✓ 📸 Clozie photo recognition
- ✓ Share outfits with friends
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
- Outfit Wear History — 'I wore this today' saves date, shown on item cards
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

- Wardrobe items loading delay — on first login, My Closet sometimes appears empty until the user navigates or interacts with the app, then items reappear. Timing/loading issue, not data loss. Items are persisted correctly in Supabase. Address in a future polish session.
- Must Include pin selector (Today's Vibe) needs a full design rethink — current horizontal scroll of all wardrobe items with emoji placeholders doesn't scale. Shows 👗 instead of real photos. Needs category filter, searchable list, or bottom sheet pattern. Separate design session — not just a photo swap.
- Mood Board polaroid system still uses category color placeholders (`MOOD_PLACEHOLDER_COLORS`) instead of real photos. Pre-existing — see existing CLAUDE.md note: "Placeholder fill colors per category (used until real item photos land in Phase 2)." Surfaced during 7b-2 visual testing on iPhone. Separate session.
- Call 2 cache write curiosity in `generate-outfits` Edge Function — every cached call shows a small `cache_creation_input_tokens` (~270 tokens) alongside the expected ~2,267 `cache_read_input_tokens`. Our code declares only ONE `cache_control` breakpoint (on the system prompt), so only the system prompt should be cached. The extra ~270-token cache write appears to be Anthropic auto-extending the cache into portions of the user message even without an explicit breakpoint. First observed Session 7b-4 (2026-05-10). Cosmetic — does not block system-prompt caching, just means there's a separate small cache layer for the user message we're not deliberately controlling. Possible future optimisation: add explicit `cache_control: { type: 'ephemeral' }` to the user message content block too, to make this behavior deliberate rather than accidental. Not urgent — flagging only because it surfaced during caching verification.
- `warmth` column NULL on every wardrobe item — DB column exists (Session 6A), helper layer (`wardrobeItems.js`) supports read/write, but no UI was ever built in Add/Edit Item to set it (deferred from Sessions 6A and 6B). Photo recognition does not detect warmth either. Consequence: the C1 Cold, C2 Hot, and C5 Indoor safety filters in `generate-outfits` are DORMANT — they never match anything because every item's `warmth` is NULL. C3 Rainy and C4 Snowy still work (name-pattern based). Surfaced 2026-05-10 (Session 7b-5). Fix needs a dedicated warmth session — design decisions required (chip set vs dropdown in Add Item panel, required vs optional, default to Medium vs blank, AI-detection in `recognize-photo` vs user-only, heuristic SQL backfill of existing items vs leave NULL). Not blocking — dormant filters cost nothing at runtime. Activates with zero Edge Function code change the day warmth gets populated.
- Supabase dashboard "Code" tab is a STALE EDITOR VIEW, not a live runtime mirror. After a successful CLI deploy (`supabase functions deploy generate-outfits --project-ref sbiwuqjnwjgjazxlyfhb --use-api`) with `Last deployed` timestamp updating to "a minute ago", the Code tab still shows OLD code — Cmd+F for newly-added constants returns 0/0 even though those constants ARE running at the edge. iPhone behavior + Supabase Logs (Edge Functions → Logs) are the source of truth for deployed Edge Function code. Surfaced 2026-05-13 (Session 7b-6 cleanup). NEVER use the dashboard Code tab for deploy verification.
- Hanger View tab reads `top.image`, `pants.image`, `shoes.image`, etc. instead of `*.photoUri` ([App.js:2894-2957](App.js:2894)). Real wardrobe items use `photoUri`, so `*.image` is always undefined and the fallback `<View backgroundColor: MOOD_PLACEHOLDER_COLORS />` renders every time. Only DEMO_MODE outfits (which assign `.image` directly in the debug switcher) appear to work. Surfaced 2026-05-14 (Session 7b-7 read-only code check). Session 9 fix: rename all `item.image` references in the Hanger View block to `item.photoUri`.
- Share Outfit button at [App.js:2607-2613](App.js:2607) has NO `onPress` prop — tapping does literally nothing. No image generation, no native share sheet, no caption. Surfaced 2026-05-14 (Session 7b-7 read-only code check). Session 9 build needed: expo-sharing or React Native `Share` API + `react-native-view-shot` for the watermarked card with "Styled by Clozie ✦ Find us in the App Store" footer + pre-filled caption "Styled by Clozie. Wear it or not?".
- Dislikes filter log line not appearing in Supabase Logs — `console.log('[generate-outfits] dislikes filter dropped ${before - filtered.length} items (tokens: ${tokens.join(', ')})')` statement added in Session 7b-7 inside `applySafetyFilters`. iPhone behavior confirms the filter IS dropping items (chiffon, cotton, leather, boots all filter correctly across multiple test calls), but the log line never appears in the Supabase Edge Function Logs tab. Other log lines from the same function (cache usage, success messages, other filter drops) DO appear normally. Possibly a log buffer flush issue or template-string formatting quirk in the Deno runtime. Not blocking — filter works in production; just no visibility into how many items dropped per call. Investigation in a future polish session.
- Dislikes filter false-positive escape — `Leather Chelsea Boots` escapes when user types `leather` as a dislike token. Surfaced 2026-05-14 (Session 7b-7 iPhone test). Working theory: substring match against `name + colour` succeeded structurally but `colour` field on that item probably stores `Black` or similar rather than `Leather Black`, so neither name (`Leather Chelsea Boots` does contain `leather` though — needs deeper investigation) nor colour matched. Investigation deferred to a polish session. Not blocking — minor edge case.
- My Closet card "Last worn" rendering is a raw ISO timestamp after Session 9B. The card at App.js:1465 renders `Last worn: ${item.lastWorn}` with zero date formatting. Before today, every item had `lastWorn = null` so this code only ever rendered "Never worn". After Session 9B, items in worn outfits have `last_worn` populated in the DB with ISO strings like `2026-05-16T19:34:21.456Z` — on next full app reload (sign-out/in or fresh launch), those render raw on the card. Within a single session after tapping "I wore this today", the local state still shows "Never worn" because no optimistic local update was wired (deliberately deferred to keep Session 9B Step 3 surgical and avoid surfacing the formatting bug as a regression). Two follow-ups needed: (a) `formatLastWorn(iso)` helper that renders `Last worn: 16 May` or similar, (b) optimistic local `wardrobeItems` state update in `handleMarkItemsWorn` so the card refreshes immediately after wear is logged. Surfaced 2026-05-16 (Session 9B). Not blocking — feature works at the DB layer. Polish session.
- Saved outfits do not survive app reload (Session 9C Step 5 deferred to Session 12). The `outfit_history` table correctly records every save with `saved=true` + `saved_at`, but the Saved Outfits modal at App.js:3057-3058 still filters the current-session `outfits` array by ID. After app reload, `generatedOutfits` empties and the saved outfit disappears from UI even though its DB row still has `saved=true`. Explicit Step 5 deferral — Session 12 will lift `savedOutfits` to MainAppScreen + load from DB via `fetchSavedOutfits()` + resolve `item_ids` against the current `wardrobeItems` state. The helper API is already written; only the wiring remains. Same Session 12 fixes the Mood Board polaroid placeholders + Hanger View `item.image` mismatch.

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

# UI STATES — LOCKED APRIL 19 2026

Error colors: errors do NOT use red or orange. Error headings: #2C1A0E espresso. Error body text: #5C4A3A. Inline error messages: #C87A52 terracotta at 88% opacity. Errors feel like gentle Clozie guidance, not alarm bells.

Disabled button: background #BCC7B7 sage green at 45% opacity. Text: white at 35% opacity. No white ring on disabled state. Button appears muted but recognizable.

---

# BUSINESS MODEL & PRICING

## FREE PLAN

- Up to 30 wardrobe items
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
- Custom SMTP (Resend) for password reset email delivery — deferred to its own session
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

EMAIL — hello@clozie.net (Namecheap Private Email).

EMAIL DOMAIN (TRANSACTIONAL) — clozieapp.com (verified May 5, 2026, used for Resend SMTP / password reset email delivery). Distinct from clozie.net (marketing site). Never confuse the two — Apple submissions, share cards, and user-facing copy reference clozie.net only.

LLC — Clozie LLC approved April 13, 2026. Registered with Northwest Registered Agent. Address: 418 Broadway STE N, Albany NY 12207.

D-U-N-S — RECEIVED May 5, 2026. Apple Developer enrollment can proceed.

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

# OLD DESIGN — DO NOT USE (archived April 2026)

NOTE: Preserved for historical reference only. Replaced by the CURRENT DESIGN SYSTEM — LOCKED (April 2026) section above. Do NOT build from this spec.

## CURRENT DESIGN SYSTEM — SACRED. NEVER CHANGE. (archived)

DO NOT CHANGE any of these unless Grace specifically and explicitly asks.

- Background: #0D0C0A
- Gold accent: #C9A96E
- Card: #161512
- Border: #252320
- Heading font: Playfair Display
- Body font: DM Mono
- Logo: "Clo" light cream + "zie" italic gold
- Style: Dark luxury

In the code these are defined as:
- G = "#C9A96E" (gold)
- BG = "#0D0C0A" (background)
- CARD = "#161512" (card)
- BORDER = "#252320" (border)

## COLOR CHANGE PLAN — WHEN / IF GRACE DECIDES (archived)

Current: black and gold stays until Grace decides. No changes until she says so explicitly.

Option A — Berry Purple + Sage Green
- Background: #6B3A5B
- Accent/Logo 'zie': #B5BD6B
- Buttons: #7A8A3A
- Cards: #F5F2ED

Option B — Deep Teal + Warm Coral (Grace's current favourite)
- Background: #1B6B5A + subtle SVG pattern on welcome screen only
- Accent/Button/Logo 'zie': #E8956A
- Cards: #F5F0E8

Option C — Cherry Blossom (Deep Teal + Blush Pink)
- Background: #1E5A6A
- Accent: #ECAFC0
- Button: #C84B6A
- Cards: #FFF0F3

Option D — Cherry Red + Blue Green
- Background: #5A1E22
- Accent: #7DBDB8
- Cards: #F5FAFA

Other explored: Terracotta, Dusty Rose, Fuchsia, Cinnamon Rust, Cobalt Blue, Slate Blue, Forest Green, Coral Red, Navy.

WHEN GRACE DECIDES — FOLLOW EXACTLY:
- Grace tells Claude Code in plain English
- Grace uploads a design image showing exactly what she wants
- Change ONE screen at a time — never whole app
- Order: Welcome → Splash → Peek Inside → Auth → My Style → My Closet → Today's Vibe → Your Looks → Mood Board → Saved Outfits → Settings → Subscription
- Grace tests on iPhone → confirms → approves → then next screen only
- Risk level: LOW. If wrong: revert immediately.
- Never assume. Never guess.

---

# ARCHIVED — pre-April-19-2026 Mannequin spec

NOTE: Preserved for historical reference only. Replaced by the Hanger View spec (locked April 19, 2026). Do NOT build from this spec.

## Mannequin (On Body SVG)

- Built from SVG paths — head, neck, torso, arms, legs, feet
- Skin color: #DDD0BC with stroke #C8B8A2
- Clothing items overlay by zone using real item photos with mixBlendMode multiply
- Zones: Dress (top 60 to bottom 400), Top (58-228), Bottom (220-410), Shoes (402-472), Hat (-10 to 34), Accessories (18 left and right)
- Background has 5 color options the user can tap to change

WARNING: BUILD MANNEQUIN EXACTLY AS IN WEB APP for now.
WARNING: DECISION PENDING — Grace is still deciding whether to keep the mannequin or replace it with a flat lay view. Do NOT remove or change the mannequin without Grace's explicit instruction.

## On Body — Mannequin View

- SVG mannequin with real clothing item photos layered over it by zone
- Zones: dress/top, bottom, shoes, hat, accessories (earrings/bag)
- Background color selector: Cream, White, Grey, Dark, Sage
- Items list shown below mannequin with gold dots
- Rebuild mannequin carefully using react-native-svg — decision pending on whether to keep or replace with flat lay

---

# ARCHIVED DECISIONS

## 2026-05-03 — Removed from Language Rule exceptions list

- "Version 1.0 — Your personal AI stylist (About)" — removed from the list of allowed AI references. Reason: tightening the language rule. Originally left untouched in the Settings ABOUT card spec; later updated in the Section 2 cleanup on 2026-05-03 — "AI" removed from the live spec line. Final wording: "Version 1.0 — Your personal stylist".

## 2026-05-03 — Removed from "Decisions Grace still needs to make"

- Mannequin vs Flat Lay: Mannequin was replaced by Hanger View (locked April 19, 2026). Decision is closed and no longer pending — moved out of the open-decisions list to keep that list accurate.

## 2026-05-03 — Old Pro nudge wording archived

Archived 2026-05-03 — old Pro nudge wording, replaced with simple versions for Apple first submission.

FREE PLAN LIMITS section (replaced):
- At 28 items: "2 spots left in your free wardrobe ✦ Upgrade to Pro for unlimited"
- At session 11 of 12: "1 session left this week — Pro members never run out ✦"
- When all 12 sessions used: "You've used all 12 sessions this week ✦ Sessions refresh as the week rolls forward. In the meantime — explore What Goes With This in your wardrobe, or upgrade to Pro for unlimited looks."

My Closet section (replaced):
- Nudge at 25+: "5 spots left · Upgrade for unlimited ✦"

## 2026-05-03 — ANYTHING ELSE card removed from Today's Vibe

Archived 2026-05-03 — the standalone "ANYTHING ELSE?" extra-notes card was merged into the Brief field. Decision: 12-0 council vote on April 30. Removed line from Today's Vibe Tab spec:

- Card: ANYTHING ELSE? — text input for extra notes

## 2026-05-03 — MY COLLECTION eyebrow label removed from Saved Outfits

Archived 2026-05-03 — the "MY COLLECTION" eyebrow label above the Saved Outfits heading was removed from the code on April 23, 2026. Aligns with the broader eyebrow-label cleanup ("Screen heading layout: no eyebrow labels above headings"). Spec line removed:

- "MY COLLECTION" label

## 2026-05-03 — Supabase auth wired (Session 1)

First real authentication session. Replaced fake auth flow with real Supabase calls. Built on testing branch only — main untouched.

What was wired:
- Sign Up screen — calls supabase.auth.signUp with email + password. Saves full_name as user_metadata. Maps "User already registered" to warm terracotta: "An account with this email already exists — try signing in instead". Generic fallback: "Something went wrong — please try again".
- Sign In screen — calls supabase.auth.signInWithPassword. Wrong email or wrong password → "Email or password doesn't match — please try again" (same message for both, matches Supabase's deliberate generic error for security).
- Settings screen — reads logged-in user via supabase.auth.getUser on mount. Pulls email and full_name from session. If no name, shows just email.
- Edit Profile → Save Changes — calls supabase.auth.updateUser to persist full_name. Name now survives sign-out (closes the long-standing bug).
- Age 13+ checkbox added to Sign Up form (was missing). Wording: "I am at least 13 years old". Unchecked blocks Create Account with warm terracotta error: "Please confirm you are 13 or older".

What was added:
- @supabase/supabase-js, @react-native-async-storage/async-storage, react-native-url-polyfill installed via npx expo install.
- New file src/lib/supabase.js — single Supabase client used everywhere. Reads keys from process.env.EXPO_PUBLIC_SUPABASE_URL + process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY.

Supabase dashboard change Grace made:
- Authentication → Providers → Email → "Confirm email" turned OFF. New users now sign up + are logged in immediately, no email-link friction. (Option A from the session plan.)

What was deliberately NOT touched this session:
- Forgot Password screen — Session 2.
- Apple Sign-In button — separate session, requires expo-apple-authentication.
- Google Sign-In button — still hidden behind false flag, separate session.
- Change Password panel in Settings — still placeholder, future session.
- Delete Account — still placeholder, future session.
- Clear Clozie's Memory — still placeholder, future session.
- VIP email logic — still not implemented (no Supabase VIP table yet).

Commit: 3a1f537 on testing branch. Pushed to origin/testing only — main not touched.

## 2026-05-04 — Supabase auth wired (Session 2)

Second authentication session. Wired the 5 remaining Settings actions to real Supabase calls. Built on testing branch only — main untouched.

What was wired:
- Sign Out — calls supabase.auth.signOut. On success, navigates to Welcome (clears AsyncStorage session — confirmed by killing app and reopening). On failure, terracotta inline error above the button: "Couldn't sign out — please try again".
- Forgot Password — calls supabase.auth.resetPasswordForEmail with the typed email. On success, shows existing "Check your email — We've sent a reset link to [email]" confirmation. On failure, terracotta error: "Couldn't send reset link — please try again". Existing email validation untouched.
- Update Password (Settings → Change Password panel) — chose Option B (verify current password). Order: validate non-empty current → validate new ≥ 8 chars → validate new != current → validate new == confirm → verify current via supabase.auth.signInWithPassword → call supabase.auth.updateUser({ password }). On success: terracotta "Password updated ✦" inside panel for 1.5s, then panel closes. Real password change confirmed by signing out and signing in with new password.
- Clear Clozie's Memory — Option B (deferred). Comment-only stub. Modal still opens and "Yes, reset" closes it. Comment notes Phase 2 work: delete user's rows from ratings + learning_notes tables, clear pattern-detected style fields. Tables don't exist yet (outfit ratings not built).
- Delete Account — true Apple-compliant deletion (Guideline 5.1.1v). App calls supabase.functions.invoke('delete-user'), then signs out locally on success. Edge Function 'delete-user' verifies the user's session token, then uses service role key to call supabase.auth.admin.deleteUser. After deletion: app navigates to Welcome; sign-in attempt with deleted email correctly fails. Verified with throwaway test accounts.

Edge Function 'delete-user' — deployed via Supabase dashboard browser editor. Service role key + anon key auto-provided as env vars (no manual setup). Code backed up in repo at supabase/functions/delete-user/README.md (Markdown only — not auto-deployed; paste into Supabase to update).

Edge Function bug fixed mid-session: original code used userClient.auth.getUser() with no arguments, which returned null on the server. Fixed by passing the token explicitly: userClient.auth.getUser(token). Diagnostic console.log statements added at every step for future troubleshooting.

Supabase dashboard changes Grace made:
- Project Settings → Authentication → Site URL: changed from http://localhost:3000 (leftover from web app) to https://clozie.net.
- Edge Functions → deployed delete-user function (one-time, in browser editor).

What was deliberately NOT done this session:
- Custom SMTP setup (Resend) — deferred to its own session. Password reset emails won't deliver until done. Supabase's built-in email service is rate-limited and not for production. App code is correct; only delivery is missing.
- Apple Sign-In wiring — separate session, requires expo-apple-authentication.
- Google Sign-In — still hidden behind false flag.
- VIP table — not implemented yet.
- Deep linking for the password reset email link back into the app — Phase 2.

Commit: 84447ff (App.js + Edge Function backup) on testing branch. Pushed to origin/testing only — main not touched.

## 2026-05-06 — Photo Upload wired (Session 5)

First session on the My Closet photo flow. Camera + gallery now working in the Add Item panel; photos persist on items in component state. Built on testing branch only — main untouched.

What was wired:
- Take Photo button — calls ImagePicker.requestCameraPermissionsAsync, then launchCameraAsync. Permission requested only when button is tapped, not on app launch. After capture, image runs through ImageManipulator.manipulateAsync (re-encoded as JPEG, quality 0.85) so EXIF orientation is baked in — photos never display sideways.
- Upload File button — same pattern using requestMediaLibraryPermissionsAsync + launchImageLibraryAsync with mediaTypes ['images'] (videos filtered out per spec). Same EXIF fix.
- Photo preview — when a photo is selected in the Add Item panel, it appears as a 200x200 preview replacing the 📷 emoji placeholder. Buttons relabel to "📸 Retake" and "🖼 Replace" while a photo is set.
- Permission denied UX — Alert.alert with warm Clozie wording: "Clozie needs camera access to add photos. You can enable this in iPhone Settings." Two existing custom modals replaced Alert.alert (Remove item, Clear memory) but those are confirmation dialogs for destructive actions. Permission denial is a one-shot iOS-system interaction — Alert.alert is the standard pattern there. Easy to swap to a custom Clozie-styled message later if preferred.
- Photo persistence on items — handleAddItem saves photoUri onto the new item; grid card displays the real photo if present (replaces 👗 emoji). Edit flow: handleEditItem loads existing item.photoUri into state when the panel opens; handleSaveEdit persists photoUri on the merged item.
- State lifecycle hygiene — photoUri state is reset on Add to Closet, Save Changes, Cancel, and ✕ Close. No ghost photos on next panel open.

What was added:
- Two npm packages: expo-image-picker (~17.0.11), expo-image-manipulator (~14.0.8). Installed via npx expo install for SDK 54 compatibility.
- iOS permission strings in app.config.js: NSCameraUsageDescription = "Clozie uses your camera to photograph wardrobe items." / NSPhotoLibraryUsageDescription = "Clozie needs access to your photo library so you can add wardrobe items." These are baked into standalone builds (EAS Build, Phase 3) — Expo Go ignores them and shows its own generic prompts during testing.
- New styles: gridCardPhotoImage (width/height 100% — fills the existing 120px gridCardPhoto slot) and photoPreview (200x200, border-radius 10) for the Add Item panel.
- Imports added to App.js: Alert from react-native, plus * as ImagePicker and * as ImageManipulator.

What was deliberately NOT done this session:
- Supabase Storage upload — Session 6. Photos currently live as local file:// URIs in component state and are lost when the app reloads. Expected and intentional for Session 5.
- Claude photo recognition (auto-fill name/category/colour/notes) — Session 6.
- Gold shimmer scanning animation — Session 6.
- Green confirmation bar after recognition — Session 6.
- "CLOZIE RECOGNISED ✦" label — Session 6.

Known limitation:
- Items disappear on app reload because there is no persistence yet. Session 6 wires Supabase Storage so photos survive reload.

Apple Sign-In, Google Sign-In, VIP table, deep linking — still not wired (Sessions 7+).

Commit: aa920df on testing branch (local only — not yet pushed to remote).

## 2026-05-07 — Supabase Wardrobe wired (Session 6A)

First session on wardrobe persistence. Closet items now save to Supabase across reload, sign-out/in, and device changes. Built on testing branch only — main untouched.

What was wired:
- Wardrobe items load from Supabase on app open + after sign-in. Each item with a photo gets a 1-hour signed URL for display; URLs regenerate on next load.
- Add to Closet — uploads photo to Storage at {user_id}/{filename}.jpg, inserts row in wardrobe_items, returns the saved item with signed URL. Button shows "Saving…" during upload.
- Edit (Save Changes) — detects photo replacement by URI scheme (file:// = new local pick, https:// = unchanged signed URL). Uploads new + updates row + best-effort deletes old photo from Storage.
- Delete — removes the row + the photo from Storage (best-effort, so a missing photo file never blocks row deletion). Modal disabled during delete with "Removing…" label.
- Sign-out clears wardrobeItems via onAuthStateChange listener; cross-user isolation verified.
- Errors throughout: warm Clozie Alert ("Couldn't save your item" / "Couldn't save your changes" / "Couldn't remove your item") with err.message detail. No silent failures.

Supabase setup (one-time, in dashboard):
- Table wardrobe_items created with full schema: core fields (id uuid PK, user_id uuid FK to auth.users ON DELETE CASCADE, name, category, colour, notes, warmth, photo_path, last_worn, created_at) + AI tracking fields with defaults (exclude_from_styling, times_generated, times_in_loved_outfit, times_in_disliked_outfit, times_worn, times_pinned). Index on user_id.
- RLS enabled with 4 policies (SELECT/INSERT/UPDATE/DELETE) — each scoped to auth.uid() = user_id.
- Private Storage bucket wardrobe-photos created. 4 storage.objects RLS policies — each restricts read/upload/update/delete to (storage.foldername(name))[1] = auth.uid()::text.
- Verification dry-run (test row + test photo upload) confirmed schema + bucket + folder structure work end-to-end.

What was added in code:
- New file src/lib/wardrobeItems.js — pure helper module exporting fetchWardrobeItems, uploadWardrobePhoto (using fetch + arrayBuffer), getSignedPhotoUrl (1-hour TTL), insertWardrobeItem, updateWardrobeItem, deleteWardrobePhoto, deleteWardrobeItem.
- App.js — imports from the new helper; new useEffect in MainAppScreen to load items on mount + listen for SIGNED_OUT; isSaving state in WardrobeTab; handleAddItem, handleSaveEdit, handleDeleteItem all rewritten as async with full Supabase wiring; Add/Edit button shows "Saving…" disabled; Remove/Cancel modal buttons disabled with "Removing…" during delete.

Photo upload technique (the footgun):
The naive fetch(uri).then(r => r.blob()) approach uploads 0-byte files in some RN versions. The reliable path used here is fetch(uri).then(r => r.arrayBuffer()) → upload as ArrayBuffer with contentType 'image/jpeg'. Verified on iPhone in Step 2.3 with file size > 0 bytes confirmation.

Pre-existing tables left alone:
The Supabase project also contains closet, favorites, profiles tables (default skeletons with only id + created_at, 0 records). Web app uses localStorage, not these tables. They are unused. Not in scope to clean up this session — separate decision.

What was deliberately NOT done this session:
- AI photo recognition (auto-fill name/category/colour/notes) — Session 6B.
- Gold shimmer scanning animation — Session 6B.
- Green confirmation bar after recognition — Session 6B.
- "CLOZIE RECOGNISED ✦" label — Session 6B.
- Warmth tag UI in Add Item panel — separate session (warmth column exists in DB, just no input).
- VIP table / VIP bypass logic — Session 9.
- Outfit ratings, favorites table wiring — later session.
- Clean up of unused closet/favorites/profiles tables — separate decision.
- Custom SMTP for password reset emails — its own session.

Known limitations:
- Brief flash of empty closet on app open (network roundtrip ~200–500ms) before items load. Acceptable; could add a loading state in a polish pass.
- Signed URLs expire after 1 hour. They regenerate on next closet load. If user keeps app open longer than 1 hour, photos remain cached in memory; only re-fetched URLs (e.g. after sign-out/in) are fresh.

Committed on testing branch (local). Version label: v2026-05-07-supabase-wardrobe-session6a. Push to remote — Grace's call.

## 2026-05-08 — Outfit Edge Function wired (Session 7a — photo recognition only)

First Edge Function session for the AI surfaces. Migrated photo recognition off the client to close the Anthropic-key-in-client vulnerability. Built on testing branch only — main untouched. Outfit generation deferred to Session 7b.

What was wired:
- New Supabase Edge Function `recognize-photo` (deployed in Supabase dashboard, JWT-verify ON). Verifies user's auth token, then calls Anthropic with model claude-sonnet-4-6, max_tokens 500. Same prompt and category-correction logic as Session 6B's client code, just moved server-side. Returns clean { name, category, color, description } JSON.
- Edge Function source-of-truth backup at supabase/functions/recognize-photo/README.md (markdown only — paste into Supabase dashboard editor to deploy/update). Same pattern as delete-user (Session 2).
- Defense-in-depth in the function: Supabase JWT verification gate (outer layer) + internal `auth.getUser(token)` check + image size sanity check (rejects base64 > 2MB) + ANTHROPIC_API_KEY presence check (returns 500 if missing in secrets).
- src/lib/clozieRecognition.js rewritten — went from 113 lines to 41 lines. Removed: direct fetch to api.anthropic.com, `anthropic-dangerous-direct-browser-access` header, EXPO_PUBLIC_ANTHROPIC_KEY read, ALLOWED_CATEGORIES list, correctCategoryFromName helper (all moved server-side). Added: import of supabase client, single `supabase.functions.invoke('recognize-photo', { body: { imageBase64 } })` call. Public function signature unchanged — App.js needed zero edits.
- EXPO_PUBLIC_ANTHROPIC_KEY removed from `.env` and from `app.config.js` extra block. Verified by repo-wide grep — zero references remain in active client code.
- Anthropic key still has the same value (Grace decided not to rotate, since she's the only person with builds). Now lives ONLY in Supabase Edge Function secrets as ANTHROPIC_API_KEY.
- Anthropic monthly spend cap set to $50 in console.anthropic.com (safety belt — function calls would be rejected by Anthropic if the cap is hit).

Phase-by-phase summary (each phase tested and approved before next):
- Phase A — Manual dashboard setup: Anthropic key copied from `.env` to Supabase Edge Function secrets via pbcopy (kept out of chat transcript); $50/month spend cap set in Anthropic dashboard.
- Phase B — Edge Function build: README.md backup written, code pasted into Supabase dashboard, deployed; smoke test via curl confirmed 401 rejection on unauthenticated calls (Supabase outer JWT layer doing its job).
- Phase C — Client switched to Edge Function: clozieRecognition.js rewritten; tested on iPhone (camera + gallery + save) — both work end-to-end.
- Phase D — Client key removed: app.config.js + `.env` cleaned; iPhone retested with `--clear` cache reload — recognition still works, proving the Edge Function is doing all the work.

What was deliberately NOT done this session (Session 7b owns these):
- Outfit generation Edge Function — not built. The 10-step v4 prompt, JS intelligence layer (minimum essentials gate, dynamic outfit count, safety filters, compressed pool format, category imbalance check, learnings/history/circuit-breaker placeholders, etc.), prompt caching (with system prompt padded to ≥1024 tokens to actually trigger Sonnet ephemeral cache), JSON validation — all deferred.
- Outfit display on Your Looks tab — Session 8.
- Rate limiting / session counter / VIP bypass — Session 16.
- AI consent modal (Apple Guideline 5.1.2(i)) — Session 8.
- Outfit history storage — Session 9.
- Smart rule-based fallback when Anthropic API fails — future session.
- Haiku evaluation for photo recognition (~3× cheaper than Sonnet) — deferred until Session 7b ships, then evaluate quality on production data.

Known limitations / dead code:
- `recognitionStatus === 'no-key'` UI branch in App.js (the grey "No Clozie key — fill in details manually" bar) is now dead code. It can no longer trigger because the client doesn't read the key any more. Left in place this session for minimum diff / easier revert. Can be removed in a polish pass.
- `process.env.EXPO_PUBLIC_ANTHROPIC_KEY` reads anywhere in client code now return undefined — no impact since the only file that read it was rewritten.
- Cold-start latency: Supabase Edge Function cold start (~200-500ms) + Anthropic call (~2-5s) on first photo after idle. Subsequent photos in the same session are warm and faster. Existing scanning bar handles this — no UX change needed.
- Edge Function code is not version-controlled — only the README.md is in the repo. Same dashboard-paste workflow as delete-user. Acceptable for solo founder; just be disciplined about updating the README every time you edit the dashboard code.

Pre-existing leftover (out of scope):
- `.claude/worktrees/elastic-solomon-b2c77d/` is an untracked worktree from an earlier session containing stale copies of `app.config.js` and `App_ORIGINAL.jsx`. Not active. Separate cleanup decision — left alone this session.

Commit: TBD on testing branch. Version label: v2026-05-08-photo-edge-function-session7a. Push to remote — Grace's call.

## 2026-05-08 — Photo Recognition wired (Session 6B)

First session wiring Clozie photo recognition into the Add Item panel. Camera + gallery photos auto-fill Name/Category/Colour/Notes via Claude Sonnet 4.6. Built on testing branch only — main untouched.

What was wired:
- Photo compression (already in place from earlier): expo-image-manipulator resizes to 512px width / 0.75 JPEG quality in both handleTakePhoto and handleUploadFile. Faster API roundtrip, smaller Supabase Storage footprint, EXIF orientation baked in.
- src/lib/clozieRecognition.js — recognition helper. Uses claude-sonnet-4-6, max_tokens 500. Reads API key from process.env.EXPO_PUBLIC_ANTHROPIC_KEY (consistent with src/lib/supabase.js). Validates category against the 6 allowed values, falls back to 'Tops' if invalid, plus a correctCategoryFromName heuristic that catches the ~5% case where the model names "Linen Blazer" but picks the wrong category.
- Add Item panel scaffolding: three new useState hooks (isScanning, recognitionStatus, autoFilledFields). Conditional status bar between the photo buttons and the tip box. isScanning wired into the Add to Closet button's disable triggers (button greys out during scan).
- runRecognition + clearStaleClozieFills helpers in WardrobeTab. Four onChangeText/onPress handlers wrapped to drop a field from autoFilledFields the moment the user edits (so retake-clearing knows which fields are still "Clozie's", which are user-typed).
- Two `await runRecognition(fixed.uri)` calls — one in each photo handler. Recognition becomes live.
- Retake-bug fix: runRecognition's auto-fill checks switched from closure reads (`!newItemName.trim()`) to functional setters (`setNewItemName((current) => current.trim() ? current : recognized.name)`). Closure values were stale by the time the network call resolved on retake — functional setters always read live state.
- Terracotta CLOZIE RECOGNISED eyebrow (#A44A34, Outfit Bold, 11px, letter-spacing 2.5, NO sparkle) inside the sage success bar only. Other states (scanning / no-key / error) render without the eyebrow.
- Terracotta #A44A34 border on auto-filled fields. Same 1.5px width as default — no layout shift. Clears the instant the user types or picks a different category, via the Step 4a onChange wrappers.

Status bar — 4 states, all using locked palette colors only:
- scanning — bg rgba(200,122,82,0.10), text #C87A52, message "✦ Clozie is reading your item…"
- success — bg rgba(188,199,183,0.30) (sage pill bg), text #5C4A3A, terracotta eyebrow CLOZIE RECOGNISED in #A44A34, message "Clozie filled in your details — check and edit below!"
- no-key — bg rgba(44,26,14,0.06), text #5C4A3A, message "No Clozie key — fill in details manually"
- error — bg rgba(200,122,82,0.10), text #5C4A3A, message "Couldn't read your item — fill in details manually"

Critical design correction caught mid-session:
The session brief specified #C87A52 for the eyebrow label. I proposed it. Grace caught the error: per the locked design system and the Apple WCAG AA contrast audit (April 28 2026), all UI eyebrow labels use #A44A34; #C87A52 fails contrast on tinted backgrounds. Saved as feedback memory (feedback_eyebrow_label_color.md) to prevent repeats. Final eyebrow color: #A44A34.

Auto-fill behavior on retake (Option A — confirmed with Grace before coding):
- User-typed fields are never overwritten (functional setter checks current value).
- Clozie-filled fields are tracked in autoFilledFields. On retake, those fields are cleared so the new scan can refill them.
- The moment a user edits a field, that field is removed from autoFilledFields — so a subsequent retake won't clobber the user's edit.

What was added in code (App.js + new helper):
- Import of recognizeWardrobePhoto from src/lib/clozieRecognition.
- Three new useState hooks in WardrobeTab (isScanning, recognitionStatus, autoFilledFields).
- Two new helpers in WardrobeTab: clearStaleClozieFills, runRecognition.
- Six reset spots updated to clear the new state (handleAddItem success, handleSaveEdit success, handleEditItem entry, X-close button, Cancel button, helper-internal).
- Four onChangeText/onPress handlers wrapped to drop their field from autoFilledFields on user edit.
- New status-bar JSX between photo buttons and tip box in the Add Item panel.
- Eight new wardrobeStyles entries: recognitionBar, recognitionBarScanning, recognitionBarSuccess, recognitionBarNoKey, recognitionBarError, recognitionBarText, recognitionBarTextScanning, recognitionBarBadge, fieldInputAutoFilled.

What was deliberately NOT done this session:
- API key migration to Supabase Edge Function — Session 7 (alongside outfit generation). REMOVE EXPO_PUBLIC_ANTHROPIC_KEY from client before Phase 3 (App Store submission).
- Outfit generation — Session 7+.
- Warmth tag UI in Add Item panel — separate session (warmth column already exists in DB).
- VIP table / VIP bypass logic — Session 9.
- Custom SMTP for password reset — its own session.

Known limitations / future-session notes captured during this session (spawned as task chips):
- Some grid card photos look poorly cropped for large photos (Image resizeMode investigation needed).
- One existing item silently shows the 👗 emoji placeholder — likely a photo that failed to upload during Session 6A.
- Offline save shows "Please sign in again to add items" instead of a network-aware message. Pre-existing from Session 6A — not in 6B's scope.

Other known limitation:
- Race condition: if a user retakes a photo before the previous scan completes, the second scan's results win after the first. Not user-noticeable in practice (would require a sub-second retake) but worth a cancel-token in a future polish pass.

Committed on testing branch (local). Version label: v2026-05-08-photo-recognition-session6b. Push to remote — Grace's call.

## 2026-05-09 — My Style Persistence wired (Session 7b-0)

Hard blocker for outfit generation cleared. Style profile (selected styles, colour palettes, never-wear text) now persists across app restart, sign-out/in, and device changes. Built on testing branch only — main untouched.

What was wired:
- StyleDNATab loads style profile from Supabase user_metadata on mount via supabase.auth.getUser(). Pre-fills selectedStyles + selectedColours + neverWear if values exist; falls back silently to blank if no session or network error. New users still start blank.
- Build My Closet button now saves style profile to user_metadata via supabase.auth.updateUser({ data: { styles, colours, never_wear } }) BEFORE navigating to My Closet tab. Button shows "Saving…" disabled state during save (opacity 0.6, follows existing Edit Profile pattern).
- Save error → gentle terracotta inline message ("Couldn't save your style — please try again") below button. Stays on screen so user can retry. Navigation blocked until save succeeds — no data loss.
- Skip link unchanged — does NOT save, just navigates. Skip means "I don't want to do this," so silent skip is the right behaviour.

Persistence model — auth.user_metadata (not a separate profiles table):
- Identical pattern to Settings → Edit Profile (full_name persistence wired in Session 1).
- Zero Supabase dashboard work — no new table, no new columns, no new RLS policies.
- The Edge Function in Session 7b-1+ reads user_metadata for free during its required getUser(token) auth call — no extra DB query.
- The skeleton "profiles" table in Supabase remains unused (id + created_at only). Will be introduced in a later session only if real cross-user queryable profile data is ever needed.

What was added in code:
- App.js — StyleDNATab only. Two new useState hooks (isSaving, saveError). One useEffect for load on mount (with cancelled-flag cleanup to avoid setState-after-unmount). One handleBuildCloset async helper. Build My Closet button JSX updated to use handleBuildCloset + show "Saving…" + disabled prop. Inline saveError Text element below button. New dnaStyles.saveError style (rgba(164,74,52,0.88) Outfit 13pt — matches existing terracotta inline error pattern).
- No new files. No new imports (supabase + useEffect already imported). No new dependencies.

What was deliberately NOT done this session:
- No new "profiles" table — using auth.user_metadata is simpler and sufficient.
- No state lifted to MainAppScreen — Edge Function reads user_metadata server-side directly via auth.getUser(token). Client doesn't need My Style state outside StyleDNATab.
- No clearing of style profile on Clear Clozie's Memory — that handler is still a Phase 2 stub. Will be wired when ratings/learning_notes tables exist.
- No outfit generation — Sessions 7b-1 through 7b-4 own that.

Commit: TBD on testing branch. Version label: v2026-05-09-mystyle-persistence-session7b0. Push to remote — Grace's call.

## 2026-05-09 — generate-outfits Edge Function wired in stub mode (Session 7b-1)

First session of the outfit generation system. New Supabase Edge Function deployed — STUB ONLY, no Anthropic call. Built on testing branch only — main untouched.

What was wired:
- New Edge Function `generate-outfits` deployed via Supabase dashboard (paste-via-editor — same pattern as recognize-photo and delete-user). JWT verify ON. Source-of-truth backup at supabase/functions/generate-outfits/README.md (markdown only — paste into dashboard to update).
- CORS preflight handler + `[generate-outfits]` log prefix mirrors recognize-photo's structure.
- Auth flow: extracts Bearer token → `auth.getUser(token)` → 401 if invalid. User's JWT also passed via global.headers.Authorization so RLS sees the logged-in user on subsequent DB queries.
- Request body: temperature, condition, occasion (all required strings); indoors (boolean), pinnedItemId (string|null), brief (string|null), styleProfile ({styles, colours, neverWear}|null) all optional. Type-validated, logged, but NOT used in stub composition (stays for future sessions).
- DB query: `wardrobe_items` filtered to `exclude_from_styling !== true` (NULL treated as not-excluded for legacy rows).

Three gates (in order):
- Minimum count: < 5 styleable items → 400 `{ error: "not_enough_items", message: "Add at least 5 items to your wardrobe for Clozie to style you." }`. Counted POST-filter so excluded items don't pad the total.
- Minimum essentials: must have (Tops AND Bottoms) OR Dresses → 400 `{ error: "missing_essentials", message: "Add at least one top and one bottom (or a dress) so Clozie can style you." }`.
- Valid pin: if pinnedItemId provided, must exist in styleable set → 400 `{ error: "invalid_pin", message: "That pinned item isn't available to style — pick another." }`.

Stub composition (anatomy-aware — picks real items from user's wardrobe):
- Outfit 1 (vibe EFFORTLESS, name "Morning Coffee Run"): Tops + Bottoms + Shoes layout.
- Outfit 2 (vibe CHIC, name "Studio to Street"): Dresses + Shoes layout (falls back to Outfit-1 layout if no dress).
- Outfit 3 (vibe FRESH, name "Quiet Confidence"): Tops + Bottoms + Light Outerwear layout (falls back to Shoes if no light outerwear).
- Light outerwear regex matches CLAUDE.md spec — cardigans, blazers, vests, sweaters, denim/light jackets, shackets, cropped jackets, boleros. Heavy outerwear (puffers, parkas, trench coats) intentionally excluded from stub.
- Pinned item appears in every outfit. If its category matches a layout slot, the pin fills it instead of a random pick. Same contract Sonnet generation will follow in 7b-3.
- Stub may reuse items across outfits if a category has only 1 item (e.g. Grace's account has 1 Shoe → it appears in all 3 outfits). Documented as intentional. Sonnet generation will avoid reuse naturally.
- `crypto.randomUUID()` for outfit IDs.
- Hardcoded `styleMatchScore: 87` on every outfit.

Response shape: `{ outfits: [...3...], source: "stub" }`. Each outfit: `{ id, vibe (UPPERCASE), name, description, items: [item_id_string, ...], styleMatchScore }`. The items array is item_id strings (NOT full WardrobeItem objects) — Session 7b-2 will resolve IDs against the client's wardrobeItems state to populate the display objects expected by the Your Looks tab. Slim payload, decouples server model from client display.

Source field: "stub" → changes to "sonnet" in 7b-3 once the real Anthropic call is wired.

Testing approach:
- Server-side curl test from terminal — no iPhone testing needed for 7b-1.
- Temporary one-line console.log added to App.js to print the user's JWT to Metro logs, then reverted before commit. App.js diff for 7b-1 = zero net lines (added then removed in same session).
- Verified end-to-end with Grace's account (insuredbyjacek@msn.com): 3 outfits returned with real wardrobe item UUIDs from her closet, all gates passed, source: "stub" confirmed.

What was deliberately NOT done this session (later 7b sessions own these):
- No Anthropic API call (7b-3). The function does not read ANTHROPIC_API_KEY in 7b-1.
- No client-side wiring — App.js untouched (zero net diff). Generate button still flips a flag and switches tabs. Wiring lands in 7b-2.
- No iPhone testing — server-side curl only.
- No real outfit intelligence — input fields validated and logged but ignored by composition. Comes in 7b-3 (Anthropic) + 7b-4 (intelligence layer).
- No prompt caching, no system prompt, no JSON validation logic (7b-3+).
- No JS smart rule-based fallback when Anthropic fails (Session 7c).
- No session counter / weekly limits / VIP table / VIP bypass (Session 9 / 16).
- No AI consent modal (Session 8 territory before App Store).
- No outfit history storage (Session 9).

Known limitations:
- Edge Function code lives in Supabase dashboard, not in version control. Only the README.md is in repo. Same paste-deploy discipline as recognize-photo and delete-user — must update the README.md every time the dashboard code changes.
- Stub may produce 1-item or 2-item outfits if user is missing layout categories (e.g. has tops + dress but no bottoms or shoes). Acceptable for a skeleton — Sonnet generation will produce richer outfits.
- Cross-outfit item reuse when a category has only 1 item — by design; Sonnet handles this differently.

Commit: TBD on testing branch. Version label: v2026-05-09-generate-outfits-stub-session7b1. Push to remote — Grace's call.

## 2026-05-09 — Client wiring + outfit display wired (Session 7b-2)

First session where outfits actually appear on Grace's iPhone. Generate button now sends full payload to the Edge Function deployed in 7b-1; stub outfits display end-to-end with real wardrobe photos. Built on testing branch only — main untouched.

What was wired:
- **New file `src/lib/outfitGeneration.js`** — 51 lines, mirrors `clozieRecognition.js` pattern. Exports `generateOutfits(payload)`. Calls `supabase.functions.invoke('generate-outfits', { body: payload })`. On non-2xx, parses the 4xx body via `await error.context.json()` to surface gate codes; throws `Error` with `.code` (e.g. `'not_enough_items'`) and `.message` set. Validates response shape (`outfits` array required).
- **MainAppScreen state** — replaced `hasTriggeredGenerate` boolean with three new pieces: `generationStatus` (`'idle' | 'loading' | 'success' | 'error'`), `generatedOutfits` (`[]`), `generationError` (`''`).
- **`handleGenerate(payload)` async handler in MainAppScreen** — spam-tap guard (returns early if status is already `'loading'`); sets status to `'loading'`; switches `activeTab` to Your Looks (3); reads styleProfile from `auth.user_metadata` (same shape StyleDNATab persists in 7b-0 — `{ styles, colours, neverWear }`); calls `generateOutfits` with merged payload; on success, resolves each item ID against local `wardrobeItems` via `Map.get` (with `.filter(Boolean)` defensive guard) so `outfit.items` becomes a `WardrobeItem[]` with `photoUri` already attached; sets status to `'success'`. On error, maps `err.code` to warm Clozie text (the three 4xx gates plus a generic fallback), sets status to `'error'`.
- **TodaysVibeTab** — one-line change to the Generate button's `onPress`. State stays local to the tab. Calls `onGenerate({ temperature: selectedTemperature, condition: selectedCondition, occasion: selectedOccasion, indoors, pinnedItemId, brief: extraNotes.trim() || null })`.
- **YourLooksTab signature** — receives `generationStatus`, `outfits` (renamed to `outfitsProp` internally), `generationError` instead of the old `isGenerating` boolean. Local fake-spinner `useEffect` rewritten to watch `generationStatus`: on `'loading'` it shows the spinner and resets `hasGenerated` so stale outfits don't flash on re-generate; on `'success'` it sets `hasGenerated`; on `'error'` it clears the loading state.
- **Outfits source** — old `const outfits = DEMO_MODE ? [...] : []` replaced with `const outfits = DEMO_MODE ? DEMO_OUTFITS : (outfitsProp || [])`. DEMO_MODE escape hatch preserved for visual testing.
- **Warm error UI** — when `generationStatus === 'error'`, the existing empty-state slot renders the warm Clozie message ("Hmm" title + the gate-specific message + "Adjust your vibe →" button). Same visual pattern as the no-outfits empty state — never a red Alert.

Photo display fix (during iPhone testing — caught by Grace):
- **Outfit card photo strip** (`looksStyles.photoStripThumb` area) — was rendering category emoji only. Now: `{item.photoUri ? <Image source={{ uri: item.photoUri }} style={looksStyles.photoStripThumbImage} /> : <Text>{getCategoryEmoji(item.category)}</Text>}`. Same pattern as My Closet card. Added `overflow: 'hidden'` to `photoStripThumb` and new `photoStripThumbImage` style (`width: '100%', height: '100%'`).
- **Saved outfits photo strip** (`savedStyles.photoStripThumb` area) — same fix applied to `savedStyles` for consistency.
- This was a pre-existing render choice (emoji only) that became visible the moment real outfits started flowing — fixed before commit.

Testing on iPhone (Grace's account, `insuredbyjacek@msn.com`):
- Today's Vibe → Warm + Sunny + Casual Day → Generate → real spinner ✦ → 3 stub outfits with names "Morning Coffee Run", "Studio to Street", "Quiet Confidence" → real wardrobe photos in the photo strip → outfit names match real closet items.
- Photo display verified working on outfit cards and saved outfits screen.

Known limitation surfaced (pre-existing, separate session):
- Mood Board polaroid system still uses `MOOD_PLACEHOLDER_COLORS` solid-color tiles instead of real photos. Existing CLAUDE.md note already says "until real item photos land in Phase 2" — confirmed still pending. Out of scope for 7b-2.

What was deliberately NOT done this session:
- **Regenerate button wiring deferred** — the 🔄 button in Your Looks still kicks off a 2-second fake spinner from the original build. Must be addressed in 7b-3 or a dedicated mini-session before App Store submission. Plan documented in Known Issues.
- **No Anthropic call** — that's 7b-3. Brief field is passed through to the Edge Function but the stub ignores it; will plug into the prompt in 7b-3.
- **No Mood Board real photos** — pre-existing, separate session.
- **No Must Include pin selector redesign** — pre-existing emoji-thumb issue requires design rethink, not a photo swap. Separate session.
- **No JS intelligence layer** (gate-7+ filters, dynamic count, pool compression, etc.) — Session 7b-4.
- **No session counter / weekly limits / VIP table** — Sessions 9 / 16.

Commit: TBD on testing branch. Version label: `v2026-05-09-client-wiring-session7b2`. Push to remote — Grace's call.

## 2026-05-10 — Real Anthropic call wired (Session 7b-3)

First session where Sonnet is actually styling outfits on the iPhone. Edge Function `generate-outfits` now returns `source: "sonnet"` with real editorial outfit names. Three bugs hunted and fixed in sequence using Supabase Edge Function logs as the source of truth. Built on testing branch only — main untouched. App.js was not opened or edited at any point in this session.

What was wired (in order of discovery):

- Bug 1 — greedy JSON regex slurped JSON + prose. Sonnet's first AI-firing call returned a well-formed JSON object followed by trailing English prose. The existing greedy regex `/\{[\s\S]*\}/` matched from the first `{` all the way to the LAST `}` in the entire response, concatenating the JSON object with the prose. JSON.parse choked mid-array → `Expected ',' or ']'`. Fix: replaced the regex with a character-by-character brace-walk that increments depth on `{`, decrements on `}`, and stops at the first balanced closing `}`. Now the function extracts only the first complete JSON object regardless of trailing prose. Surgical edit inside the existing `} catch {` block in `callAnthropic`. Strict-parse fast path (`JSON.parse(text.trim())`) untouched — still wins when Sonnet returns clean unwrapped JSON.

- Diagnostic log added — `console.log('[generate-outfits] raw AI text:', text)` placed immediately after the empty-text guard in `callAnthropic`. One line. Logs every Anthropic response before parsing so failures become debuggable. Kept in place for now; remove in a polish pass before App Store submission.

- Bug 2 — Sonnet hitting max_tokens ceiling. After the brace-walk fix, the next failure was `Could not locate JSON in AI response`. The `usage` log showed `output_tokens: 500` exactly — the same value as the `max_tokens: 500` ceiling. Sonnet was being truncated mid-JSON, leaving an unbalanced `{` with no closing `}`, and the brace-walk correctly returned null. Fix: bumped `const ANTHROPIC_MAX_TOKENS = 500` to `1500`. One-character edit. Sonnet now has room to finish 3 outfits with names + descriptions + items + scores.

- Bug 3 — Sonnet returning items in full pool format. After the max_tokens bump, parsing succeeded but the name-to-UUID lookup failed: `could not map name to UUID: Knit Cotton Sweater | Tops | Camel`. The system prompt asks for "exact item names from pool", but Sonnet was echoing back the full pipe-separated pool line including category and colour. Fix: changed the lookup key from `rawName.trim().toLowerCase()` to `rawName.split('|')[0].trim().toLowerCase()`. The split is a no-op on clean names (`split('|')` returns `[name]`, `[0]` is the same string) and only strips decorations when present. Happy path unchanged.

End-to-end verified on iPhone (Grace's account, `insuredbyjacek@msn.com`):
- Today's Vibe → Generate.
- Real editorial outfit names appeared: "Cream & Cool", "Boho Off-Duty" (and a third).
- Real Sonnet descriptions on each outfit.
- Real wardrobe item photos in the photo strips (still working from 7b-2).
- Supabase logs showed `[generate-outfits] success — sonnet, 3 outfits returned` with `source: "sonnet"`.

Workflow used (matched 7a / 6B / 7b-1 pattern):
- All Edge Function changes made by editing `supabase/functions/generate-outfits/README.md` on disk first (the source-of-truth backup).
- After each tiny edit, the full updated TypeScript code block was extracted via `sed`/`pbcopy` and put on Grace's clipboard.
- Grace pasted into Supabase dashboard → Edge Functions → `generate-outfits` → Code editor → Deploy.
- Tested on iPhone before each next change. One change per round-trip — three round-trips total.

What was deliberately NOT done this session:
- Regenerate button wiring — still using the fake 2-second `setTimeout` from Session 7b-2. Documented in Known Issues. Must be addressed in a dedicated mini-session before App Store submission. (7b-3 was consumed by Edge Function debugging instead.)
- Anthropic prompt caching fix — `cache_creation_input_tokens` and `cache_read_input_tokens` are both 0 on every call, meaning the v5 system prompt is being sent uncached every single time. Costing ~10× expected on every generate. Separate session — needs investigation of cache_control field placement, system prompt token count vs the 1024-token Sonnet 4.6 cache minimum, and API request format.
- Debug log removal — the `raw AI text:` log line in `callAnthropic` is still printing the full AI response to Supabase logs on every call. Useful for ongoing debugging but should be removed before App Store submission.
- JS smart rule-based fallback (when AI fails AND stub is undesirable) — still relies on the existing stub composition from 7b-1. Future session.
- Session counter / weekly limits / VIP table — Session 9 / 16.
- AI consent modal (Apple Guideline 5.1.2(i)) — Session 8 territory before App Store.
- Outfit history storage — Session 9.

Known limitations carried forward:
- Edge Function code lives in Supabase dashboard, not version control. Only the README.md is in the repo. Same paste-deploy discipline as `recognize-photo` and `delete-user`. The README on disk now reflects exactly what is deployed live as of 2026-05-10.
- Cold-start latency on the Edge Function (first call after idle): a few seconds. Acceptable — existing spinner handles it.

Commit: TBD on testing branch. Version label: v2026-05-10-real-anthropic-session7b3. Push to remote — Grace's call.

## 2026-05-10 — Prompt caching fixed (Session 7b-4)

Sixth Edge Function session, second of two on May 10 2026. Two surgical changes deployed in two separate deploys to fix the prompt-caching regression flagged at the end of Session 7b-3. Built on testing branch only — main untouched. App.js was not opened or edited at any point in this session — all changes were inside `supabase/functions/generate-outfits/README.md` (the source-of-truth backup) and pasted into the deployed Edge Function via the Supabase dashboard.

What was wired:

- Step 1 — Diagnosis. Investigation walked through 5 questions: (1) where is the debug log? line 357. (2) is the `system` field a content block array or a plain string? content block array — correct format. (3) where is `cache_control` placed? inside the content block, alongside `type: 'text'` and `text: systemPrompt` — correct placement. (4) what is the model string? `claude-sonnet-4-6` — correct. (5) honest diagnosis? Initial hypothesis was that the deployed SYSTEM_PROMPT was below Sonnet's 1,024-token public minimum, but a `wc -c` count showed 6,360 chars / ~1,720 tokens — comfortably above 1,024. Pivoted to the `anthropic-beta: prompt-caching-2024-07-31` header as the next-most-likely cause. Was about to recommend that as the fix. Grace pushed back: the v5 prompt was designed by the Style Council/Business Council on May 8 2026 to exceed a 2,048-token threshold (not 1,024). Showed the deployed SYSTEM_PROMPT in full. All 6 padding sections were present by header but several were thinner than the original v5 design — Section 3 (Styling Intelligence) was 2 paragraphs vs 4 in v5 (missing "The third piece" + "Proportion" sub-sections), Section 4 (Anchor Piece) was missing the explicit "Finding the anchor" priority order list (1)–(6). The deployed prompt was a partial / earlier draft, not the canonical v5. Padding WAS the issue all along — just against a different threshold than the public 1,024.

- Step 2 — Debug log removal. One-line removal at line 357 of README.md: `console.log('[generate-outfits] raw AI text:', text)`. Used the Edit tool with exact surrounding context to make the removal atomic. Post-edit sanity: 0 matches for "raw AI text" remaining; usage log block (lines 344–350) preserved unchanged. Extracted typescript code block via awk (between ` ```typescript ` and the next ` ``` ` markers), piped to `pbcopy`. 626 lines / 27,873 chars on clipboard. Pasted into Supabase dashboard → Edge Functions → generate-outfits → Code → Deploy. Verified on iPhone — 3 outfits appeared with real names and photos. No regression. Step 2 confirmed working before moving to Step 3.

- Step 3 — v5 prompt swap. Replaced the entire SYSTEM_PROMPT constant in README.md (lines 87–127, 41 lines) with the canonical v5 padded prompt (187 lines, with both `{{requestedOutfits}}` template placeholders substituted to literal `3` before paste — REQUESTED_OUTFITS is hardcoded to 3 in the Edge Function and there is no template substitution wired in code; pasting unsubstituted placeholders would have shown Sonnet literal `{{requestedOutfits}}` characters). Used a Python `re.sub` regex substitution (`re.compile(r'const SYSTEM_PROMPT = \`.*?\`', re.DOTALL).subn(...)`) to do the swap, to avoid typos when reproducing 187 lines manually via the Edit tool. Sanity checks ran post-substitution: 0 remaining `{{requestedOutfits}}`; "SELECT 3 distinct outfits" present (intro line); "Select exactly 3 outfits" present (Rule 1); all 6 PADDING SECTION headers present; `=== END V5 SYSTEM PROMPT ===` marker preserved; `Deno.serve` handler intact; closing ` ``` ` of typescript code block intact; exactly 1 `const SYSTEM_PROMPT = \`` opening. Total file lines: 668 → 813 (+145, net of the 41 → 187 prompt expansion). Re-extracted typescript via awk → pbcopy. 773 lines / 29,228 chars on clipboard. Pasted into Supabase dashboard → Deploy.

- Step 4 — Verification. Grace did one test generate on iPhone, then a second within ~5 min. First sent hand-typed-from-photo numbers as a sanity check, then paused the session and went back to Supabase to copy the raw log lines directly from the browser. The raw paste matched the hand-typed copy byte-for-byte — zero discrepancies. Raw log lines (verified):
  - Call 1: `[generate-outfits] usage {"cache_creation_input_tokens":2267,"cache_read_input_tokens":0,"input_tokens":274,"output_tokens":464}`
  - Call 2: `[generate-outfits] usage {"cache_creation_input_tokens":271,"cache_read_input_tokens":2267,"input_tokens":3,"output_tokens":374}`

Numbers explained:
- Call 1 cache_creation = 2,267 → cache write succeeded. This is also the EXACT real token count of the v5 system prompt per Anthropic's tokenizer.
- Call 2 cache_read = 2,267 → cache read succeeded. Same number as Call 1's write — proof of round-trip.
- Call 2 input_tokens = 3 → only 3 fresh tokens billed at full rate (vs 274 on Call 1).
- Threshold validation: 2,267 - 2,048 = 219 tokens of headroom (~11% margin above the 2,048 caching threshold).
- Calibration data for future: actual chars/token ratio = 7,714 / 2,267 = 3.4 — slightly more generous than the 3.7 estimate used during diagnosis.
- Cost impact (Sonnet 4.6 input pricing ~$3/M base, cache write 1.25× = $3.75/M, cache read 0.10× = $0.30/M): per-call input cost dropped from ~$0.0076 (uncached, 2,540 input tokens × $3/M) to ~$0.0017 (cached: 2,267 × $0.30/M + 271 × $3.75/M + 3 × $3/M) — about 4–4.5× cheaper input on every cached call within the 5-min TTL.

Two Known Issues entries removed from the live KNOWN ISSUES list (text preserved here in the archive):
- "Anthropic prompt caching not working in `generate-outfits` Edge Function — Supabase logs show `cache_creation_input_tokens: 0` AND `cache_read_input_tokens: 0` on every call (verified Session 7b-3, 2026-05-10). The v5 system prompt has `cache_control: { type: 'ephemeral' }` set, but neither cache writes nor cache reads are happening. Result: ~2000 input tokens hit Anthropic uncached on every generate, costing roughly 10× what it should. Needs investigation: is the system prompt actually above Sonnet 4.6's 1024-token cache minimum? Is the `cache_control` field placement correct in the request? Does the API request format need adjustment? Separate session before launch — not blocking iPhone testing." — RESOLVED by deploying the v5 padded prompt (2,267 actual tokens, above the 2,048 threshold).
- "Diagnostic `console.log('[generate-outfits] raw AI text:', text)` left in place in `callAnthropic` (added Session 7b-3 to debug Sonnet's JSON output) — logs the full AI response to Supabase logs on every call. Useful for ongoing debugging but should be removed before App Store submission to keep logs clean." — RESOLVED by removing the line in Step 2 of this session.

What was deliberately NOT done this session:
- `anthropic-beta: prompt-caching-2024-07-31` header NOT added — it was on my fix-proposal list as a backup if padding didn't fix it. Padding fixed it, so no header change was needed. Worth keeping in pocket if caching ever regresses for a different reason.
- App.js NOT opened or edited at any point. Net diff for App.js this session: zero lines.
- Regenerate button (🔄 in Your Looks) still uses the fake 2-second `setTimeout` from Session 7b-2. Documented in Known Issues. Must be addressed in a dedicated mini-session before App Store submission.
- JS smart rule-based fallback when AI fails AND stub is undesirable — still relies on the stub composition from Session 7b-1. Future session.
- Session counter / weekly limits / VIP table — Session 9 / 16.
- AI consent modal (Apple Guideline 5.1.2(i)) — Session 8 territory before App Store.
- Outfit history storage — Session 9.
- Custom SMTP (Resend) for password reset email delivery — its own session.

Known curiosity surfaced this session (not blocking, NEW Known Issue carried forward):
- Call 2 showed `cache_creation_input_tokens: 271` alongside the 2,267 cache_read. Our code declares only ONE `cache_control` breakpoint (on the system prompt), so technically only the system prompt should be cached. The 271-token cache write on Call 2 looks like Anthropic auto-extending the cache into portions of the user message even without an explicit breakpoint. Cosmetic — does not block caching of the system prompt, just means there's a separate small cache layer for the user message that we're not paying full attention to. Possible future optimisation: add explicit `cache_control: { type: 'ephemeral' }` to the user message content block too, to make this behavior deliberate rather than accidental. Not urgent.

Commit: TBD on testing branch. Version label: v2026-05-10-caching-fix-session7b4. Push to remote — Grace's call.

## 2026-05-10 — JS Safety Filters wired (Session 7b-5)

Seventh Edge Function session, third on May 10 2026. Five weather/indoor safety filters added to the `generate-outfits` Edge Function inside a new `applySafetyFilters` function. Plus a category imbalance flag in the user message, an inert `computeOutfitPotential` stub for Session 9, and a documentation pass on the README's "How it works" prose. Built on testing branch only — main untouched. App.js was NOT opened or edited at any point — all changes were inside `supabase/functions/generate-outfits/README.md` (the source-of-truth backup) and pasted into the deployed Edge Function via the Supabase dashboard.

What was wired (in deploy order):

- Step A — `computeOutfitPotential(_outfitItems: Item[], _fullWardrobe: Item[]): number` — inert stub helper. Always returns 12. Placed between `buildStubOutfits` and `Deno.serve`. No callers anywhere in the function. Pure scaffolding for Session 9 (outfit-potential calculation against ratings/learning_notes tables). Zero runtime impact.

- Step B — Category imbalance flag inside `buildFreshContent`. New conditional pushed into the existing `flags` array. Triggers when `bottoms ≤ 2 AND tops > 8`. Wording: `Only ${bottomsCount} bottom${bottomsCount === 1 ? '' : 's'} in pool — vary the styling across outfits.` Grammar correct for both singular and plural cases. Renders as a `* `-prefixed line in the user message via the existing render code.

- Step C1 — `applySafetyFilters` function shell + Cold filter. New function placed between `computeOutfitPotential` and `Deno.serve`. Accepts `{ items, temperature, condition, indoors, pinnedItemId }` in its args type (C3 and C5 add `condition` and `indoors` to the destructuring respectively). Cold filter drops `Light`/`None` warmth from Tops and Dresses, with pinned-item exemption. Soft-fail safety net at the bottom of the function: if filters break the essentials check ((Tops AND Bottoms) OR Dresses), revert to the unfiltered `items` array (gates 4/5/6 already proved that pool viable). Function wired into main handler between gate 6 and the Anthropic call. Filtered pool is passed to `buildFreshContent` only; `validateAndMapOutfits` and `buildStubOutfits` continue to use the unfiltered `items`.

- Step C2 — Hot filter. New `if` block after C1. Drops `Heavy` warmth from all categories. Pinned exempt.

- Step C3 — Rainy filter. New `if` block after C2. Drops items whose name (lowercased) contains `suede`, `sandal`, `open-toe`, or `mule`. Pinned exempt. Destructuring updated to include `condition`. Suede applies across all categories because suede bags/jackets/skirts also get ruined in rain.

- Step C4 — Snowy filter. New `if` block after C3. Drops `suede`, `espadrille`, `sandal`, `open-toe`, `flip-flop`, `stiletto` via `.includes()` substring match. Drops `heel(s)` and `pump(s)` via word-boundary regex (`/\bheels?\b/`, `/\bpumps?\b/`) — avoids `wheel` / `pumpkin` false positives. `mule` NOT included in Snowy (Grace's spec listed it for Rainy only). `slide` and `shorts` NOT included (Grace's explicit decision). Pinned exempt. Snow is the one weather where heels ARE filtered, deliberately overriding Grace's general "no heels filter" directive — slip risk and salt damage are objective safety/destruction concerns, not taste decisions.

- Step C5 — Indoor filter. New `if` block after C4. Drops Heavy Outerwear when `indoors === true`. Pinned exempt. Destructuring updated to include `indoors`. Light/Medium outerwear (blazers, cardigans, light jackets, vests) stays — they're aesthetic layering pieces. Currently DORMANT because warmth is NULL on every item.

- README.md "How it works" prose pass — header dates updated (added 7b-4 and 7b-5 lines), stale `max_tokens: 500` corrected to `1500` (the 7b-3 fix), new step 5 added describing the safety filters, steps renumbered 5→6/6→7/7→8/8→9, `category imbalance flag` added to step 6's user message content list, `split('|')[0]` detail added to step 7's lookup description, trailing sentence about the `computeOutfitPotential` helper. Documentation-only — no code change, no redeploy needed.

Six deploys total, each verified on iPhone with `cache_read_input_tokens=2267` intact after the second call. Cache stayed warm across the entire session because every change was OUTSIDE the cached system prompt.

Discovery mid-session — warmth column is NULL on every wardrobe item:

During iPhone testing of C2 Hot, the filter logged `pool size after filters: 10 of 10` even though Grace's wardrobe contains items that should have matched. Investigation:
- DB column `warmth` exists (added in Session 6A schema).
- Helper layer `src/lib/wardrobeItems.js` supports warmth read/write.
- App.js has zero warmth state, zero warmth UI in Add/Edit Item — the only `warmth` matches are an unrelated visual gradient on the Welcome screen.
- `recognize-photo` Edge Function does not request or return warmth.
- Result: every wardrobe item has `warmth = NULL`, so C1/C2/C5 never match anything.

Per CLAUDE.md Session 6A and 6B notes, the warmth UI was explicitly deferred ("warmth column exists in DB, just no input"). The deferral was never picked up in 7b-0 through 7b-5.

Grace's decision: continue with C3, C4, C5 today for symmetry with C1/C2 (also dormant), defer warmth UI + heuristic SQL backfill to a dedicated warmth session. C5 ships as scaffolding alongside C1 and C2 — all three activate with zero Edge Function code change the day warmth gets populated.

Design decisions made during the session:

- **Heels and sneakers**: Grace's directive — "heels are taste decisions, Sonnet decides" — applies generally, with one exception. Snow is the one weather where heels ARE filtered (objective safety, not taste). C4 Snowy filters heels via word-boundary regex; C1/C2/C3 do not. Sneakers are never filtered anywhere — Sonnet's cached system prompt handles sneaker appropriateness.
- **Word-boundary regex on heel/pump only**: `heel` substring would match `wheel` (false positive); `pump` substring would match `pumpkin` (false positive on color names like "Pumpkin Orange Sweater"). Other patterns (`suede`, `sandal`, `espadrille`, `stiletto`, etc.) are unambiguous fashion terms with near-zero false positive risk — substring match is fine.
- **C4 Snowy patterns vs C3 Rainy patterns**: not symmetric. C3 has `mule`; C4 doesn't (Grace's spec). C4 adds `espadrille`, `flip-flop`, `heel(s)`, `pump(s)`, `stiletto`; C3 doesn't. Rainy is mostly about exposed feet getting wet. Snowy adds destruction (salt + slush) and safety (slipperiness).
- **`slide` and `shorts` skipped from C4**: Grace explicitly chose to skip them despite recommendation. Trusted her judgment.
- **Dynamic outfit count (original STEP 4) explicitly KILLED**: not deferred — killed. The cached system prompt has "SELECT 3 distinct outfits" baked verbatim (line 90 of the SYSTEM_PROMPT constant). Making the count dynamic in the user message would either (a) create contradictory instructions Sonnet sees on every call, or (b) require re-padding the system prompt with template placeholders, breaking the 2,267-token cache. Three outfits stays as the spec. Future sessions should not revisit this without explicit cache-reflow budget.
- **STEP 3, STEP 5, STEP 7 from the original plan all SKIPPED**: already wired in 7b-3. STEP 3 pool format (`Name | Category | Colour [| fabric] [| Warmth]` with today-prefix and sort) lives in `buildCompressedPool`. STEP 5 absent-category flags (`No shoes uploaded` etc.) live in `buildFreshContent`. STEP 7 small-wardrobe framing (`She chose these pieces intentionally...`) also in `buildFreshContent`. Touching them would have churned the user message without value.
- **Filtered pool passed to `buildFreshContent` only**: `validateAndMapOutfits` and `buildStubOutfits` continue to use the unfiltered `items`. Sonnet can only suggest items that exist in its user message (the filtered pool), but the name-lookup against the full pool is more robust against edge cases. Stub fallback uses full pool for maximum success rate when AI fails.
- **`indoors === true` strict equality**: handler already coerces with `body.indoors === true`. The filter uses strict equality for belt-and-suspenders consistency.

What was deliberately NOT done this session:

- No warmth UI — deferred to a dedicated warmth session.
- No SQL heuristic backfill of `warmth` on existing items — deferred to the warmth session.
- No App.js changes whatsoever. Net diff for App.js this session: zero lines.
- No `recognize-photo` Edge Function changes.
- No dynamic outfit count — KILLED, not deferred.
- No `slide` or `shorts` patterns in C4 Snowy — Grace's explicit decision.
- No heels filter on C1/C2/C3 — Grace's general directive. Snow is the exception.
- No sneakers filter anywhere — Grace's general directive.
- No JS smart rule-based fallback for AI failures — stub composition from Session 7b-1 still serves as the silent fallback.
- No Anthropic API call changes, no cached system prompt changes, no JSON parser changes, no name-to-UUID lookup changes — protected surfaces from earlier sessions.
- No session counter / weekly limits / VIP table — Session 9 / 16.
- No AI consent modal (Apple Guideline 5.1.2(i)) — Session 8 territory before App Store.

Known limitations carried forward:

- C1, C2, C5 are dormant until warmth column is populated. Architectural verification only — never confirmed against real warmth data.
- `computeOutfitPotential` always returns 12 — placeholder, no caller. Wired up in Session 9.
- C3/C4 name-pattern matching is substring-based for everything except heel/pump in C4. Some theoretical false positives exist (e.g., `shortsleeve` could match `shorts` if typed without a separator; not currently in any filter), but extremely low real-world risk.
- Soft-fail safety net only checks essentials, not minimum count. If filters drop the pool from 30 items to 4 items but essentials are still met, the filter wins and Sonnet sees a 4-item pool. Acceptable — the gate 4 minimum-count check only runs on the unfiltered pool, and Sonnet handles small pools.
- Edge Function code still lives in Supabase dashboard, not version control. Only the README.md is in repo. The README on disk now reflects exactly what is deployed live as of end of Session 7b-5.

Commit: TBD on testing branch. Version label: v2026-05-10-js-filters-session7b5. Push to remote — Grace's call.

## 2026-05-12 — Session 7b-6 resumed + closed (CLI deploy via Supabase functions deploy)

Eighth Edge Function session. Resumed from May 11 paused state. Root cause of 7b-6 deploy mystery turned out to be **TWO different clipboard-corruption bugs**, not Supabase's deploy infrastructure. Built on testing branch only — main untouched. App.js was NOT opened or edited at any point.

What was diagnosed and fixed:

- **Root cause #1 — `awk + pbcopy` mojibake.** Grace's macOS shell decodes file bytes as MacRoman before re-encoding as UTF-8. Middots `·` (UTF-8 `0xC2 0xB7`) get transformed to `¬∑` (5 bytes). Em-dashes `—` (UTF-8 `0xE2 0x80 0x94`) get transformed to `‚Äî` (7 bytes). Both have been silently corrupting every paste-into-Supabase-dashboard deploy since at least 7b-4. Sonnet handled the garbled punctuation gracefully because the meaning still reads, but the deployed bytes were wrong throughout. Empirically verified mid-session by piping README typescript through `awk → pbcopy → pbpaste` and inspecting bytes — em-dashes 0, mojibake 7-byte sequences present.

- **Root cause #2 — chat-paste truncation + char loss.** Switched mid-session to copying typescript directly from chat code blocks (Grace's preferred path: "no command touches the characters"). The chat rendering preserves Unicode end-to-end on screen, but the underlying paste data for files >40KB silently truncates portions and/or drops em-dashes. After this paste, deployed SYSTEM_PROMPT contained no v5 content (Cmd+F for "Each outfit distinct", "PADDING SECTION", "COMPOSITION RULES" all returned 0/0 in Supabase editor). Cache still hit at 2,132 tokens because *something* was deployed; Sonnet still produced reasonable outfits because the safety filters carried it. But the v5 stylist prompt was effectively destroyed.

- **Solution — Supabase CLI deploy from disk.** Installed `supabase` CLI v2.98.2 via Homebrew (`brew install supabase/tap/supabase`). Created `supabase/config.toml` (1 line: `project_id = "clozie-native"`) and `supabase/functions/generate-outfits/index.ts` (extracted from README.md via Python binary I/O — `open('rb')` + `subprocess.run(['pbcopy'], input=bytes)` — preserves all 84 em-dashes and 13 middots byte-perfectly; round-trip verified identical). Deployed via `SUPABASE_ACCESS_TOKEN=$(pbpaste | tr -d '\n\r ') supabase functions deploy generate-outfits --project-ref sbiwuqjnwjgjazxlyfhb --use-api --yes`. Token came from clipboard via command substitution, never appeared in chat or logs. Clipboard cleared after deploy via `pbcopy < /dev/null`. PAT instructed to be revoked from dashboard immediately after.

- **Canonical token count CORRECTED.** Previous CLAUDE.md (Sessions 7b-4, 7b-5) claimed v5 = 2,267 tokens. **The real canonical count is 2,132 tokens.** Every prior `cache_read_input_tokens=2267` measurement was reading mojibake-inflated content (27 em-dashes in SYSTEM_PROMPT × ~5 extra tokens per `‚Äî` mojibake = +135 tokens). Today's CLI deploy of byte-perfect bytes from disk: Call 1 cache_creation 2,132. Call 2 (within 5 min) cache_read 2,132. Verified end-to-end on iPhone with Outdoor · Sport + Warm test. Cache discount still active (2,132 > 2,048 threshold by 84 tokens / 4% headroom — thinner than the 11% docs previously claimed but real and stable).

- **FANCY_DRESS_PATTERN filter added.** New regex `/chiffon|silk|satin|velvet|lace|organza|tulle|sequin|beaded|gown|evening|cocktail/i` filters delicate-fabric / formal-wear dresses for `occasion === 'Outdoor · Sport'`. Pinned exempt. Parallel to Step 5b open-footwear filter (also Outdoor · Sport only). Cotton/linen casual dresses unaffected. Triggered: dropped 1 chiffon midi from Grace's wardrobe in verification test ("Outdoor · Sport fancy-dress filter dropped 1 dresses" log line confirmed). Token "pleated" considered for inclusion but dropped per Grace's call (would over-filter casual cotton pleated styles; today's actual problem dress is already caught by `chiffon`).

- **Sentinel + literal-check diagnostic logs.** Added `[7b6-sentinel-v2]` (logs args object including character codes of `occasion` to runtime) and `[7b6-literal-check]` (compares deployed literal `'Outdoor · Sport'` to runtime occasion via `===`). Both fire unconditionally on every call. Used to definitively prove deploy propagation was NOT the issue (sentinel fired with correct values) and to isolate the byte-corruption pattern. `[diag-5b]` from yesterday's session also still in place. ALL THREE diagnostic logs are still firing in production after today's CLI deploy — should be removed in a 5-min cleanup deploy via CLI (no clipboard needed).

What was deliberately NOT done this session (deferred):

- **Step 8 (weather constraint hints in user message)** — pending. The cached system prompt has weather rules (COMPOSITION RULES line 7), but no per-call weather HINTS in the `buildFreshContent` user message. Deferred to a future session.

- **Step 9 (Heavy/Light label fix in compressed pool + styling signal extraction)** — pending. Bundled with the deferred warmth UI session, since both depend on the `warmth` column being populated. Currently NULL on every wardrobe item.

- **Diagnostic log cleanup** — `[7b6-sentinel-v2]`, `[7b6-literal-check]`, and `[diag-5b]` are still firing. Cost negligible but log noise. Dedicated cleanup pass via CLI in a future session.

- **App.js NOT touched** — net diff zero lines.

- **README.md / index.ts duplication.** Both contain identical typescript content. Long-term, `index.ts` becomes canonical (it's what CLI deploys); README.md should reduce to docs-only. Refactor for a future session.

- **CLAUDE.md drift between Desktop and project copies** — the Desktop `/Users/grace/Desktop/CLAUDE.md` (May 10) is now older than the project version (May 12). Project version is the source of truth. CLAUDE_May12_2026.md backup placed on Desktop in this same session for reference.

Workflow change going forward (CRITICAL):

- **Future Edge Function deploys MUST use Supabase CLI**, not dashboard paste. Command: `supabase functions deploy <function-name> --use-api`. Bytes go from disk straight to Supabase via API — no clipboard, no editor paste handler, no shell locale interpretation. The dashboard editor remains fine for VIEWING deployed code, but never for DEPLOYING. This applies to `generate-outfits`, `recognize-photo`, `delete-user`, and any future Edge Functions.

CLAUDE.md corrections in same session: D-U-N-S RECEIVED status (was "request ~2 weeks before App Store submission"), Anthropic spend cap raised to $100 dev / $50 alert / $200 launch (was $50/$200), @styledbyclozie Instagram handle (was @cloziestyle), "Outfit name in DM Serif Display" font fix (was "Playfair" — which conflicted with locked design system listing Playfair as a rejected font), clozieapp.com noted as Resend SMTP delivery domain (was missing — distinct from clozie.net marketing site).

Files created this session: `supabase/config.toml`, `supabase/functions/generate-outfits/index.ts`. Both new files in repo. Grace to decide commit/gitignore status.

Commit: TBD on testing branch. Version label: v2026-05-12-cli-deploy-session7b6. Push to remote — Grace's call.

## 2026-05-13 — Session 7b-6 cleanup wired (skirt filter, weather hint, outerwear tags, Padding Section 7)

Ninth Edge Function session, cleanup pass that closes out the Session 7b-6 arc started May 11 and CLI-unblocked May 12. Five concrete changes to `supabase/functions/generate-outfits/index.ts`, each deployed via Supabase CLI in its own pass and verified on iPhone before the next began. Built on testing branch only — main untouched. App.js was NOT opened or edited at any point.

What was wired (in deploy order):

- Step 1 — Skirt filter for Outdoor · Sport. New `SKIRT_PATTERN = /skirt/i` constant (substring match, intentionally not word-boundary — catches `miniskirt` single-word edge case; false-positive risk in clothing pool effectively zero). New filter block inside `applySafetyFilters` for `occasion === 'Outdoor · Sport'`, immediately after the FANCY_DRESS_PATTERN block. Category-gated to Bottoms (parallel structure to FANCY_DRESS_PATTERN being category-gated to Dresses). Pinned item exempt. Soft-fail safety net unchanged. Log line: `[generate-outfits] Outdoor · Sport skirt filter dropped N bottoms`. Verified on iPhone — "Embroidered Linen Midi Skirt" no longer appears in Outdoor · Sport generations across two test calls. Cache stayed at 2,132 (no system-prompt change).

- Step 2 — Weather constraint hint in user message. New `buildWeatherHint(temperature: string, condition: string): string | null` helper inserted between `buildCompressedPool` and `buildFreshContent`. Echoes COMPOSITION RULES line 7 from the cached system prompt as a per-call STYLING NOTES bullet so Sonnet has an explicit nudge for THIS call's weather instead of just the raw `Weather: ${temperature}, ${condition}` data line. Mapping: Cold → "prefer Heavy/Medium warmth"; Hot → "prefer Light/None warmth, avoid heavy wool"; Rainy → "avoid delicate fabrics, prefer closed-toe shoes"; Snowy → "prefer closed-toe boots". Sleeveless caveat from system prompt deliberately omitted from hint (system prompt already covers it — hint stays terse). Returns null for Cool/Warm + Sunny/Cloudy where no specific rule applies — no line gets added in those cases, matching the system prompt's "Cool/Warm: mix freely" stance. Wired into `stylingLines` right after the identity line. Adds ~15-30 tokens per call to the USER message only — zero system-prompt impact. Verified on iPhone: Hot + Sunny dropped heavy pieces from outfits, Cool + Rainy applied the rainy guidance, Cool + Sunny behaved identically to pre-change. Cache stayed at 2,132 across all calls.

- Step 3 — Heavy/Light name-pattern outerwear tags in buildCompressedPool. Rewrote the warmth-tag block (previously column-only, dormant because warmth column is NULL on every wardrobe item). New logic: if `category === 'Outerwear'` AND `item.warmth` is populated AND not 'None' → push column value (preserves the existing behavior for the day warmth UI ships); else if name matches HEAVY_OUTERWEAR regex → push 'Heavy'; else if name matches LIGHT_OUTERWEAR regex → push 'Light'; else no tag (avoids lying to Sonnet about unknown warmth). Order matters: HEAVY first because heavy-mistagged-as-light is the more dangerous failure mode (could leave her cold). Existing regex constants `HEAVY_OUTERWEAR` and `LIGHT_OUTERWEAR` reused without change. Outerwear-only branch — other categories untouched. Safety filters (Hot/Warm name-pattern outerwear filter, Indoor name-pattern outerwear filter) all run independently against `item.name` directly via the same regexes — they don't read the pool string, so enriching the pool string changes Sonnet's view only, not filter behavior. Verified on iPhone: Cold outfits correctly anchored on Heavy outerwear (Peacoat / Puffer / Parka surfaced), cache stayed at 2,132.

- Step 4 — Padding Section 7 "FINISHING TOUCHES" appended to SYSTEM_PROMPT. The ONE step in this session that touched the cached system prompt. Six paragraphs codifying accessory rules by occasion (Outdoor · Sport — zero accessories; Casual / Weekend / Travel — understated; Work / Office — polished and intentional; Going Out / Date Night — one statement piece, bold earrings OR a necklace, never both at once; Formal — one focal point), explicit "Never include bags in outfit selections" directive ("Even if bags exist in the wardrobe pool, skip them. She chooses her own bag."), one-focal-point-per-outfit constraint, and "at least one of three outfits should include accessories when they exist in the wardrobe; never force into all three" balance rule. Section text: 962 bytes / ~243 tokens. Edit made via the Edit tool (UTF-8-clean, no clipboard, no awk, no mojibake — six new em-dashes verified at `\xe2\x80\x94` and zero mojibake sequences via Python byte audit before deploy). New SYSTEM_PROMPT total: ~2,375 tokens (verified via Call 2 `cache_read_input_tokens = 2,375`). New headroom: 327 tokens / ~16% margin above the 2,048 caching threshold — best margin to date. Cache reset cleanly: Call 1 wrote new cache (cache_creation ~2,375), Call 2 within 5 min read from new cache (cache_read ~2,375 — exact round-trip). One-time cache-write cost ~$0.009. Verified on iPhone: filters still firing across all occasions, outfit quality intact.

- Step 5 — Diagnostic log cleanup confirmation. Local `index.ts` confirmed clean of `[7b6-sentinel-v2]` / `[7b6-literal-check]` / `[diag-5b]` markers via grep at session start (consistent with Session 7b-6 May 12 archive note that local had been cleaned at some prior moment). The five CLI deploys executed in this session would have overwritten any stale runtime markers regardless. No code edit needed.

Two mid-session discoveries:

- First CLI deploy attempt of the session silently failed despite reporting success. The command `SUPABASE_ACCESS_TOKEN=$(security find-generic-password -s 'supabase-pat-clozie' -w) supabase functions deploy generate-outfits --project-ref sbiwuqjnwjgjazxlyfhb --use-api --yes` returned `Uploading asset (generate-outfits): supabase/functions/generate-outfits/index.ts` and `Deployed Functions on project sbiwuqjnwjgjazxlyfhb: generate-outfits` — but Supabase dashboard showed `Last deployed: 20 hours ago` and `SKIRT_PATTERN` 0/0 in the Code tab + the iPhone test showed the filter not firing. Re-running the same command WITHOUT the `--yes` flag, from inside this same session, succeeded and propagated cleanly within a minute. Root cause never definitively isolated. Working hypothesis: the `--yes` flag on this CLI version (v2.98.2) may have triggered a silent failure path. CLAUDE.md's documented deploy command had included `--yes`; subsequent deploys in this session intentionally omitted it and all four propagated cleanly. Recommend dropping `--yes` from the canonical CLAUDE.md command going forward.

- Supabase dashboard "Code" tab is a STALE EDITOR VIEW, not a live runtime mirror. Even after a successful CLI deploy with `Last deployed` timestamp updating to "a minute ago", the Code tab continued showing old code — Cmd+F for `SKIRT_PATTERN` returned 0/0 even though `SKIRT_PATTERN` was definitively in the deployed runtime code (proven by the log line `[generate-outfits] Outdoor · Sport skirt filter dropped 1 bottoms` firing in production logs). Hypothesis: the Code tab is wired to the dashboard's editor draft persistence, not the runtime bundle. Since 7b-6's CLI-from-disk workflow uses the API path (`--use-api`), the editor draft never gets touched. This means: for all CLI-deployed Edge Functions going forward, the dashboard Code tab will show stale code indefinitely unless someone manually pastes into the editor (which is exactly what 7b-6 moved AWAY from). Verification must go via iPhone behavior + Supabase Logs from here on. Added as a permanent KNOWN ISSUE replacing the now-closed deploy-propagation BLOCKER entry.

Two KNOWN ISSUES resolved this session:
- The May 11 paused-state "deploy propagation BLOCKER" (now closed — both root causes are isolated: (1) clipboard corruption per Session 7b-6 May 12 archive, (2) silent-first-deploy-failure surfaced and worked-around today; CLI-from-disk workflow is battle-tested across five successful deploys in one session).
- The May 12 "Diagnostic logs still in production" item (overwritten by today's deploys).

One new KNOWN ISSUE added (replaces the deploy-propagation BLOCKER slot): Supabase dashboard "Code" tab is a stale editor view; never use for deploy verification.

What was deliberately NOT done this session:
- App.js — net diff zero lines.
- recognize-photo / delete-user Edge Functions — untouched.
- Warmth UI / SQL backfill — still deferred to dedicated warmth session.
- SESSION_7b6_HANDOFF.md — left on disk despite being obsolete (deletion deferred to a future cleanup session — out of scope today).
- Step 9's styling-signal extraction (Heavy/Light label part is now done in Step 3; styling-signal extraction stays bundled with the warmth UI session).

Commit: TBD on testing branch. Version label: v2026-05-13-session7b6-cleanup. Push to remote — Grace's call.

## 2026-05-14 — Session 7b-7 wired (dislikes hard filter + Regenerate button)

Tenth Edge Function session. Two concrete changes plus a documentation pass — both verified on iPhone before moving forward. Built on testing branch only — main untouched.

What was wired:

- Dislikes hard filter (Edge Function — Step 1). New filter block inside `applySafetyFilters` ([index.ts:962-985](supabase/functions/generate-outfits/index.ts:962)) after the skirt filter and before the soft-fail safety net. Reads `neverWear: string | null` from extended args type ([index.ts:735](supabase/functions/generate-outfits/index.ts:735)). Call site at [index.ts:1112](supabase/functions/generate-outfits/index.ts:1112) passes `styleProfile?.neverWear ?? null`. Tokenization: lowercase, split on `/[,;]/`, trim, drop empties, drop stopwords `Set(['anything', 'the', 'a', 'an', 'no', 'hate', 'nothing', 'with'])`, minimum token length 4 (avoids `tan` matching `tank top`, `red` matching `adidas`). Match: case-insensitive substring on `name + colour` ONLY — `notes` excluded per Grace's call (free-form text, would over-filter on e.g. "great with my silk camisole" against `silk` token). Pinned item exempt per existing pattern (`if (i.id === pinnedItemId) return true`). Existing `Dislikes: ${dislikes}` line in user message at [index.ts:461](supabase/functions/generate-outfits/index.ts:461) left intact — Sonnet still sees the user's free-text dislikes as fuzzy instruction (good for multi-word phrases like `anything cropped` that the JS filter wouldn't match), and the JS filter handles hard single-token enforcement. Belt and suspenders. Soft-fail safety net at [index.ts:987-996](supabase/functions/generate-outfits/index.ts:987) unchanged — if dislikes filter accidentally breaks the essentials gate, the existing net reverts to unfiltered `items`. One CLI deploy: `SUPABASE_ACCESS_TOKEN=$(security find-generic-password -s 'supabase-pat-clozie' -w) supabase functions deploy generate-outfits --project-ref sbiwuqjnwjgjazxlyfhb --use-api` (no `--yes` flag, per 7b-6 lesson). Verified on iPhone: chiffon, cotton, leather, boots all correctly filtered when entered in My Style; pin override works (pinned item bypasses dislikes); cache safe at 2,375 tokens across all calls. SYSTEM_PROMPT NOT touched. Edge case discovered: `Leather Chelsea Boots` escaped the `leather` token (deferred to polish session — added to Known Issues).

- Regenerate button wired (App.js — Step 2). Five edits in App.js, one file touched. Edit A: new state `const [lastPayload, setLastPayload] = useState(null)` in MainAppScreen ([App.js:5261](App.js:5261)) alongside existing generation state. Edit B: `setLastPayload(payload)` inside `handleGenerate` ([App.js:5314](App.js:5314)) right after the spam-tap guard. Edit C: new `handleRegenerate` helper in MainAppScreen ([App.js:5364-5367](App.js:5364)) — defensive `if (!lastPayload) return` no-op + `handleGenerate(lastPayload)`. Edit D: `onRegenerate={handleRegenerate}` prop added to `<YourLooksTab>` ([App.js:5396](App.js:5396)). Edit E (two parts): YourLooksTab signature ([App.js:2199](App.js:2199)) receives `onRegenerate`; local `handleRegenerate` ([App.js:2289-2298](App.js:2289)) rewritten — kept local UI resets (`setRatings({})`, `setRatingFeedback({})`, `setWornToday({})`, `setShowBoutique({})`) then calls `onRegenerate()`. Deleted: fake `setTimeout(..., 2000)`, manual `setLoading(true/false)`, `setHasGenerated(false/true)`, `spinAnim.setValue(0) + Animated.loop(...)` from the old handler. All redundant because the lifted useEffect at [App.js:2373-2392](App.js:2373) drives all of those when `generationStatus === 'loading'` arrives. Both buttons (🔄 Regenerate AND Save Feedback & Style Again →) share the local handler — by design from original code, Session 9 can split them when ratings → Supabase wiring lands. Tested on iPhone across 4 scenarios: basic Regenerate produces fresh outfits with new editorial names; local UI resets clear ratings + wornToday + boutique panels; Save Feedback button fires same flow; spam-tap guard prevents double-fires. Multiple `[generate-outfits] usage` lines visible in Supabase Logs with different timestamps confirming real API calls; cache verified safe at 2,375 across all.

- Documentation pass (Step 3). README.md updated with new "Updated: 2026-05-14" line at line 14 + new Dislikes bullet under Step 5 safety filters. CLAUDE.md updated with this archive entry + Phase 2 checklist entry + Known Issues updates (Regenerate entry removed; 4 new entries added — Hanger View `item.image` mismatch, Share Outfit no `onPress`, dislikes log line missing, leather token escape). CLAUDE_May14_2026.md backup placed on Desktop.

What was deliberately NOT done this session:

- No SYSTEM_PROMPT changes — cache stays at 2,375 tokens (verified across all generates).
- No buildFreshContent changes — `Dislikes:` text line in user message kept as belt-and-suspenders alongside the new JS filter.
- No stub fallback changes — stub composition at [index.ts:1109](supabase/functions/generate-outfits/index.ts:1109) still uses unfiltered `items`, consistent with the existing pattern from Session 7b-5.
- No Save Feedback button split — still shares the local handler with Regenerate; Session 9 will split when ratings persistence to Supabase lands.
- No fix for the three Session 9 candidates surfaced in the read-only code check at session start (Mood Board polaroids, Hanger View `item.image` mismatch, Share Outfit stub). All documented in Known Issues for Session 9.
- No fix for the dislikes filter log-line not appearing in Supabase Logs. Filter works in production; visibility issue only. Documented in Known Issues.
- No fix for the `Leather Chelsea Boots` token-escape. Edge case; documented in Known Issues.
- Session counter / weekly limits / VIP table — Session 9 / 16.
- AI consent modal (Apple Guideline 5.1.2(i)) — Session 8 territory before App Store.

Commit: TBD on testing branch. Version label: v2026-05-14-session7b7. Push to remote — Grace's call.

## 2026-05-14 — Session 7C wired (JavaScript Smart Fallback)

Eleventh Edge Function session. Replaced the basic stub fallback with a smart, color-aware, occasion-aware fallback that fires when Anthropic fails for any reason. Built across five surgical CLI deploys, each verified on iPhone before the next. Built on testing branch only — main untouched. App.js was NOT opened or edited at any point.

What was wired:

- **Constants (Step 1):** Six new constants inserted in `index.ts` between `ALLOWED_VIBES` and the `SYSTEM_PROMPT` block. Three color-family regexes (`COLOR_NEUTRAL`, `COLOR_EARTH`, `COLOR_NAVY`) with word-boundary anchors to avoid false positives (e.g. `tan` matching `tank`). Two per-occasion maps (`FALLBACK_NAMES_BY_OCCASION`, `FALLBACK_VIBES_BY_OCCASION`) keyed by the exact middot strings the client sends from App.js:221 and App.js:1726. One mood array (`DESCRIPTION_MOODS`) for description templates. All vibe pool entries verified members of existing `ALLOWED_VIBES` set so they pass `validateAndMapOutfits`. Dead code (no callers) — deploy compile-only verification. iPhone confirmed `source: "sonnet"` and `cache_read_input_tokens: 2375` unchanged.

- **Function (Step 2):** `buildSmartFallback(items, pinned, occasion)` added between `buildStubOutfits` and `computeOutfitPotential` in `index.ts`. Pure function. Internal closures: `colorFamily` classifies items by name+colour regex match; `colorsCompatible` enforces navy+earth clash detection but defaults permissive elsewhere; `pickCompatible` prefers color-compatible candidates but falls back to any in-category item rather than fail; `buildOne` assembles one outfit per layout slot. Five layout branches gate on pinned category + wardrobe composition (dress-pin → all dress-centered; outerwear-pin → outerwear-wrapped; tops+bottoms+dress → mixed; tops+bottoms only → all top/bottom; dress-only → all dress-centered). Pinned item always added and always honored. Name pool shuffled via `Math.random() - 0.5`; 3 distinct picks per generation (pad with " II" suffix if pool < 3, defensive only). Vibes pick at random with repeats allowed. Descriptions: `"[colour first-word] with [colour first-word] — [mood]."` with `name`-based fallback when colour is missing. `styleMatchScore: 85`. Reuses existing `pickRandom`, `LIGHT_OUTERWEAR` regex, and `Item` type — no duplication. Still no caller. iPhone confirmed Sonnet path unchanged.

- **Wiring (Step 3):** Three edits in `index.ts` handler region. Main edit: lines 1329–1332 (the old `buildStubOutfits`/`source: 'stub'` block) replaced with a try/catch that calls `buildSmartFallback(fallbackPool, pinned, occasion)` first — where `fallbackPool` is `filteredItems` if ≥ 5 items else `items` (soft-fail revert mirrors the safety-filter soft-fail net) — returning `source: 'fallback'` on success. If `buildSmartFallback` throws, catch block falls to `buildStubOutfits(items, pinned)` returning `source: 'stub'`. Two stale log lines updated for accuracy (`'falling back to stub'` → `'falling back'`) on lines 1324 and 1326. Sonnet happy path (lines 1305–1323) byte-identical — when `aiResult` and `mapped` both exist, line 1321 returns `source: 'sonnet'` and the new code below never runs. iPhone confirmed Sonnet still happy.

- **Force-on test (Step 4):** Single-line flip on index.ts:1306 — `if (anthropicKey) {` → `if (false && anthropicKey) {     // SESSION 7C STEP 4 TEMP — force fallback. REVERT IN STEP 5.` JavaScript short-circuits on `false &&`, so the entire Anthropic block (lines 1306–1327) is skipped — control flows directly to the new fallback. Anthropic API not called at all during this test (no cost, no `usage {...}` log line). Verified on iPhone across three occasions: Casual Day pool ("Easy Sunday" / "Weekend Edit" / "Off-Duty Ease"), Formal Event pool ("Event Ready" / "Occasion Dressing" / "The Statement"), Going Out pool ("Night Mode" / "Out Tonight" / "Evening Edge"). All three confirmed: real wardrobe photos rendering, descriptions referencing real item colours/names, `source: "fallback"` in Supabase Logs, `[generate-outfits] success — fallback, 3 outfits returned`, NO `usage {...}` line (zero Anthropic spend), all safety filters still active. Pinned-item enforcement also tested and confirmed.

- **Revert (Step 5):** Single-line revert on index.ts:1306 back to `if (anthropicKey) {`. Byte-identical to pre-Step-4 state — sentinel comment and `false && ` both gone. iPhone confirmed Sonnet back across three occasions (Casual Day / Work · Office / Outdoor · Sport): editorial Sonnet names ("Cream & Cool" style), `source: "sonnet"`, `cache_read_input_tokens: 2375` intact. 3-tier safety net (Sonnet → smart fallback → stub) now live in production with full automatic failover.

- **Documentation (Step 6):** README.md "What changed" note added at the top; steps 8 and 9 in the "How it works" section rewritten to describe the 3-tier fallback and the new `source` field shape. The stale `## Code` block at the bottom of README.md (line 52+) was deliberately NOT updated — per Session 7b-6 policy, `index.ts` is the canonical runtime source and README.md is documentation prose only.

Design decisions made during the session:

- **Color compatibility model — permissive, not strict.** `colorFamily` returns one of four labels (neutral / earth / navy / other). `colorsCompatible` returns `true` if either side is "other" (unknown), either is "neutral", they share a family, OR the cross is anything except navy+earth. This means: a "blue jacket" (returns "other" — not in any regex) pairs with anything. A "burgundy dress" (returns "other") pairs with anything. Only items the regex confidently classifies get pairing rules applied. Bias is toward producing outfits rather than over-constraining. Compared to a strict whitelist (which would block too much), this is more like Sonnet's own approach.

- **Five layout branches, gated on pin + wardrobe.** Hardcoded if/else rather than a generic algorithm because outfit composition logic is small and reads more clearly as five named cases than as table-driven config. Each branch produces 3 layout arrays; the function calls `buildOne` three times.

- **Names always distinct within one generation; vibes can repeat.** Pool sizes are 4-5 names per occasion and 4 vibes per occasion. Names feel more like editorial labels (repeats would jar). Vibes are tonal — "POLISHED / CHIC / ELEVATED" all feel related, so repeating one across two outfits in the same generation is acceptable.

- **`styleMatchScore: 85` on fallback** (vs `87` on stub). Subtle signal that the fallback is a notch less confident than Sonnet (which can return 70–100) but still respectable. Number is invisible to the user today (UI hides it for Apple review) — meaningful only when the score eventually unhides.

- **Soft-fail at the wire point, not inside `buildSmartFallback`.** The handler checks `filteredItems.length >= 5` and passes either `filteredItems` or `items` into the fallback. Keeps `buildSmartFallback` simple (it just trusts its input pool). Mirrors the existing `applySafetyFilters` soft-fail pattern.

- **3-tier safety net structure.** Sonnet (preferred) → smart fallback (free, JS-only, ~1 second) → stub (last-resort if smart fallback throws). The third tier protects against my own bugs in the new code without anyone noticing. `source` field surfaces which tier fired for log diagnostics.

- **Color regex word-boundary anchors.** `\b(black|white|...)\b` instead of substring match. Same lesson as Session 7b-7's dislikes filter (`\b\b` on `heel`/`pump`). Prevents `tan` matching `tank top`, `red` matching `adidas`.

- **Map keys are middot strings.** `Work · Office` not `Work / Office`. Confirmed by `grep` against App.js (line 221, line 1726) before adding constants. Same string everywhere — client send, safety filter checks, fallback name pool lookup.

What was deliberately NOT done this session:

- App.js — net diff zero lines.
- SYSTEM_PROMPT — untouched (cache stays at 2,375 tokens, verified across all deploys).
- `buildStubOutfits` — kept verbatim as last-resort net. Not deleted, not modified.
- `validateAndMapOutfits` — Sonnet-only, unchanged.
- `applySafetyFilters` — unchanged. Fallback reuses its output via `filteredItems`.
- `recognize-photo` / `delete-user` Edge Functions — untouched.
- No cache monitoring email alerts (out of scope).
- No spend tracking / `daily_api_spend` table (out of scope).
- No Haiku middle tier (only at 300+ users per session brief).
- No session counter / weekly limits / VIP table — Session 9 / 16.
- No ratings / learning_notes persistence — Session 9.
- No fix for Mood Board polaroid placeholders / Hanger View `item.image` mismatch / Share Outfit no `onPress` — all Session 9 candidates from 7b-7 read-only check.
- No fix for `Leather Chelsea Boots` dislikes-filter escape (Session 7b-7 known issue) — separate polish session.
- No fix for the missing `dislikes filter dropped` log line (Session 7b-7 known issue).
- No AI consent modal (Apple Guideline 5.1.2(i)) — Session 8 before App Store.
- No deletion of `SESSION_7b6_HANDOFF.md` if still on disk — separate cleanup.

Known limitations carried forward:

- **Outfit distinctness within one generation is randomness-only.** When `tbViable && !hasDress` (the most common case), outfit 1 and outfit 2 use the same `['Tops', 'Bottoms', 'Shoes']` layout. They will pick different items most of the time given random shuffling, but with a 5-item wardrobe (1 top, 1 bottom, multiple shoes) the two outfits could collide. Acceptable trade-off — the alternative would be a "must differ from outfit 1" pass that complicates the code substantially. Sonnet handles this naturally; fallback is best-effort.
- **`Math.random() - 0.5` shuffle bias.** Standard JavaScript shuffle quirk — not a true uniform shuffle, slightly biased toward keeping original order. Fine for a 4-5 element name pool where the bias is invisible. Worth replacing with a proper Fisher-Yates if name pools ever grow.
- **Description templates are templated, not editorial.** Sonnet writes "The boucle blazer and tailored trousers — quietly confident before 10am." Fallback writes "Camel blazer with cream trousers — quietly confident." Both work; Sonnet's is just richer. Acceptable for a fallback path that fires rarely.
- **No notes-field reading in descriptions or composition.** Notes is free-form and unreliable as a structured signal. Sonnet reads it via the user message; the JS fallback ignores it. Same decision as the Session 7b-7 dislikes filter.

Commit: TBD on testing branch. Version label: v2026-05-14-session7c. Push to remote — Grace's call.

## 2026-05-16 — Session 8 wired (AI Consent Modal + Keyboard Fixes + Today's Vibe Polish)

Twelfth session of the native-app build. Four discrete tasks, all in App.js. Edge Function NOT touched at any point. SYSTEM_PROMPT NOT touched. Prompt cache stays at 2,375 tokens across the session (no Anthropic API calls made during the session beyond Grace's manual iPhone tests). Built on testing branch only — main untouched. Thirteen tiny LOW-risk sub-steps total, each tested on iPhone before the next began.

What was wired:

- **Task 1 — AI Consent Modal (Apple Guideline 5.1.2i) — 5 sub-steps.** New `ConsentModal` function component inserted just before `MainAppScreen`. Renders an RN `<Modal>` (transparent, fade animation) with semi-transparent backdrop (`rgba(0,0,0,0.5)`), white card (16px radius, max-width 340), title "Before Clozie styles you" (DM Serif Display, espresso `#2C1A0E`, 22px), body text (Outfit 15px, body color `#5C4A3A`, lineHeight 22) explicitly naming Anthropic, tappable `anthropic.com/privacy` link styled with terracotta `#A44A34` + underline (opens via `Linking.openURL('https://www.anthropic.com/privacy')`), Accept button (sage `#BCC7B7` filled, white ring inset, white text, Outfit Medium 15px) labeled "Accept — I'm ready to style ✦", Decline button labeled "Not now" as plain text link (Outfit Regular 14px, body color). New `Linking` added to react-native imports. New `consentStyles` StyleSheet block at end of file (~60 lines, locked palette values only). Four new state hooks in MainAppScreen: `consentGiven` (bool, starts false), `consentLoaded` (bool, starts false — gates the modal trigger during the brief initial-load window), `showConsentModal` (bool, starts false), `pendingPayload` (null). New useEffect after the wardrobe-loading useEffect reads `user_metadata.ai_consent_given` on mount via `supabase.auth.getUser()` and flips `consentGiven` + `consentLoaded` (mirrors the StyleDNATab load pattern from Session 7b-0, with cancelled-flag cleanup for unmount safety). `handleGenerate` signature changed to accept optional `{ skipConsentCheck = false } = {}` arg. Consent gate inserted at the very top of `handleGenerate`, BEFORE the spam-tap guard: `if (!skipConsentCheck && consentLoaded && !consentGiven) { setPendingPayload(payload); setShowConsentModal(true); return; }`. New `handleAcceptConsent` async handler: stashes pendingPayload locally, clears state, flips `consentGiven` to true optimistically, awaits `supabase.auth.updateUser({ data: { ai_consent_given: true } })` (best-effort — catches errors silently because local state already flipped for this session and the disclosure was already made the moment the modal appeared), then calls `handleGenerate(stash, { skipConsentCheck: true })` to resume generation. The skipConsentCheck flag avoids a React setState race: `setConsentGiven(true)` is async, so without the flag the closure inside the resumed `handleGenerate` call would still see `consentGiven === false` and re-show the modal. New `handleDeclineConsent` handler: closes modal + clears pendingPayload (no save, no generation). Persistence verified end-to-end: sign out → sign in → tap Generate → no modal (consent persisted via Supabase). Apple compliance rationale documented inline — disclosure is made the moment the modal appears; the save is for persistence only, so a save failure doesn't block the user.

- **Task 2 — KeyboardAvoidingView fixes — 4 sub-steps.** Reality-check at session start verified directly from code (not assumed) which screens had KAV and which didn't. Result table:
  - **AuthScreen (Sign Up / Sign In / Forgot Password)** — already had KAV. Confirmed all three modes are inside the same wrapper because AuthScreen has a single `return (...)` with conditional rendering on `isLogin` / `isForgot` props. No change.
  - **StyleDNATab** — Step 2.1 wrapped the ScrollView with `<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>` and added `keyboardShouldPersistTaps="handled"` to the inner ScrollView so chip taps still work while keyboard is open.
  - **WardrobeTab (My Closet)** — already had KAV. Verified. Explicitly skipped any KAV touch per Grace's directive (Session 15 redesign coming).
  - **TodaysVibeTab** — Step 2.2 wrapped the ScrollView with the same KAV pattern + `keyboardShouldPersistTaps="handled"`.
  - **SettingsScreen** — Step 2.3 wrapped the inner ScrollView (NOT the outer container View) with KAV. Header stays fixed above the KAV. The existing ScrollView already had `keyboardShouldPersistTaps="handled"`. Edit Profile panel (inline, conditional inside ScrollView) and Change Password panel (same) both fall under this wrapper. Tested on iPhone: name field, current/new/confirm password fields all stay visible above keyboard.
  - **Delete Account Modal** — Step 2.4 added a separate KAV inside the Modal, wrapping the deleteOverlay. KAV-inside-outer-screen does NOT propagate into RN Modals, so this required its own wrapper. The "Type DELETE here" input now stays visible above the keyboard. Tested on iPhone with Cancel only — Delete My Account button never tapped during testing.

- **Task 3 — Placeholder contrast — 1 sub-step.** Two `placeholderTextColor` values updated to `rgba(44,26,14,0.65)` to match the WardrobeTab Add Item placeholders:
  - Today's Vibe Brief field: `0.40` → `0.65`
  - StyleDNA "I never want to wear": `0.35` → `0.65`
  Both placeholders are now legibly readable while still subdued. No layout shift, no interaction change.

- **Task 4 — Today's Vibe empty state — 3 sub-steps.** When `wardrobeItems.length === 0`, TodaysVibeTab early-returns a centered empty state instead of the normal weather/occasion/Brief/Generate UI. Step 4.1 added four new style entries to `vibeStyles`: `emptyContainer` (flex 1, centered, paddingHorizontal 24, background `#E8E4CE`), `emptyText` (Outfit Regular 16px, body color, centered, lineHeight 24, marginBottom 28, maxWidth 320), `emptyButton` (sage `#BCC7B7` filled, white ring inset, padding 18×64, border-radius 100, shadow — byte-identical to `looksStyles.emptyButton`), `emptyButtonText` (Outfit Medium 16px espresso centered). Step 4.2 added `onGoToCloset` prop to TodaysVibeTab signature, and MainAppScreen passes `() => setActiveTab(1)` (My Closet tab index). Step 4.3 inserted the early-return JSX immediately before the existing main return — when wardrobe is empty, renders the centered message "Add a few pieces to your closet first — Clozie will do the rest." (text-only per Grace's choice, no title) followed by the sage "Go to My Closet →" button. The empty state has no TextInput, so no KAV needed there. Verified on iPhone end-to-end: empty wardrobe → empty state shows → tap button → My Closet → add item → return to Today's Vibe → normal UI returns.

Design / scope decisions made during the session:

- **Consent persistence model:** chose `auth.user_metadata.ai_consent_given` (the existing Session 7b-0 style-profile pattern) rather than a new Supabase table. Zero dashboard work. Edge Function reads it for free during its required `getUser(token)` auth call (no separate query). Same RLS semantics as user_metadata. The skeleton `profiles` table in Supabase remains unused.
- **Optimistic state flip on Accept:** local `consentGiven` set to true BEFORE the `updateUser` await completes. If the save fails for any reason, the user is not blocked from generating — they'll see the modal again next session if persistence didn't land, which is acceptable. The Apple-compliant disclosure happens the moment the modal appears, not when the save succeeds.
- **skipConsentCheck flag (not a ref) for the post-Accept resume:** chosen for clarity. React setState is async; passing the flag explicitly is the cleanest way to bypass the closure-staleness race rather than introducing a synchronously-updated ref.
- **AuthScreen mode-switching verified directly from code, not assumed.** Grace asked for direct evidence before moving to Task 3 that all three Auth modes were inside the existing KAV. Confirmed via grep + Read: single `return (...)` at App.js:522, KAV at line 525, mode conditionals via `isLogin` / `isForgot` booleans inside the same render.
- **Empty state styling — text-only, no title.** Grace explicitly chose this over the alternative title+body+button hierarchy used in Your Looks / Saved Outfits. The single message is rendered at Outfit Regular 16px (larger than Your Looks' 13px) since it carries the prominence alone.
- **KAV in Settings wraps ScrollView only, not outer View.** Header stays fixed above. Two Modals below (Subscription, Delete Account) stay outside the Settings KAV — they're sibling overlays. Delete Account got its own KAV in Step 2.4. Subscription has no TextInputs so it doesn't need one.
- **StyleDNA placeholder contrast (0.35 → 0.65) added to scope** despite not being in the original brief, per Grace's call for consistency across the app. Now all three text-input placeholders (Today's Vibe Brief, StyleDNA never-wear, WardrobeTab Add Item) use 0.65.

What was deliberately NOT done this session:

- No Edge Function changes whatsoever. `generate-outfits`, `recognize-photo`, `delete-user` all untouched. Zero CLI deploys.
- No SYSTEM_PROMPT changes — cache stays at 2,375 tokens. Verified by not touching `supabase/functions/generate-outfits/index.ts` or `README.md` at any point.
- No `recognize-photo` migration to `index.ts` source-of-truth (still on the deferred list from Session 7b-6).
- No `delete-user` migration to `index.ts` source-of-truth (still deferred).
- No My Closet redesign — Session 15 territory.
- No My Closet KAV touch — Session 15 redesign coming, deliberately skipped.
- No Apple Sign-In wiring — Session 17.
- No Google Sign-In wiring — still hidden behind false flag.
- No session counter / weekly limits / VIP table / VIP bypass — Session 9 / 14 / 16.
- No ratings persistence / Save / Wore Today wiring — Session 9.
- No Mood Board real-photo wiring — Session 9 (placeholder color tiles still rendering).
- No Hanger View `item.image` → `item.photoUri` fix — Session 9 (known issue still active).
- No Share Outfit `onPress` wiring — Session 9 (button still does nothing).
- No Saved Outfits search — Session 10.
- No warmth UI / SQL backfill — separate warmth session.
- No diagnostic log cleanup in `generate-outfits` — still no deploys planned for that.
- No fix for the dislikes-filter log line not appearing in Supabase Logs — out of scope.
- No fix for the "Leather Chelsea Boots" dislikes-filter escape — out of scope.

Known limitations carried forward:

- Race condition window for new users: if a brand new user with no saved consent taps Generate during the brief initial-load window (consentLoaded === false), the consent gate falls through and Generate fires without the modal. The load completes in ~100-300ms; the user must also pick weather + occasion + tap Generate, which takes seconds at minimum. In practice this race never fires on real devices. Documented inline as belt-and-suspenders.
- Consent save is best-effort: if `supabase.auth.updateUser` fails (e.g. network blip during Accept), local state flips for the current session but persistence doesn't land. Next session the user sees the modal again and re-accepts. Not user-visible unless persistence repeatedly fails.
- Today's Vibe empty state replaces the entire tab content. The "Styling from X items" badge at the top of the normal tab does NOT render in the empty state. Acceptable — the empty state has its own warm guidance.

App.js net diff: approximately +205 lines added across 13 edits in 5 different regions of the file (imports, MainAppScreen state, MainAppScreen useEffect, MainAppScreen handleGenerate / handleRegenerate / handleAcceptConsent / handleDeclineConsent, ConsentModal component above MainAppScreen, ConsentModal render call inside MainAppScreen, StyleDNATab KAV wrap, TodaysVibeTab KAV wrap + early-return, SettingsScreen KAV wrap, Delete Account Modal KAV wrap, two placeholder contrast values, vibeStyles new style entries, consentStyles new StyleSheet block, onGoToCloset prop wiring). Zero deletions.

Commit: TBD on testing branch. Version label: v2026-05-16-session8. Push to remote — Grace's call.

## 2026-05-16 — Session 9A/9B/9C wired (outfit history persistence — rating + wore today + save/unsave)

Thirteenth session of the native-app build. Three discrete features wired in five tiny LOW-risk steps (Step 0 schema → Step 1 helper → Step 2 ratings → Step 3 wore-today → Step 4 save/unsave). Each step iPhone-tested before the next. Built on testing branch only — main untouched. Edge Function NOT touched at any point. SYSTEM_PROMPT NOT touched. Prompt cache stays at 2,375 tokens. Zero CLI deploys this session. Step 5 of the original plan (lift savedOutfits to MainAppScreen + load from DB on mount + render Saved Outfits modal from DB snapshots) DEFERRED to Session 12 (Saved Outfits + Search) because (a) state lift is invariant under the Session 12 screen redesign so deferring costs nothing, (b) Session 12 already touches that screen, (c) wiring real cross-session data into a screen with two known render bugs (Mood Board polaroid placeholders + Hanger View `item.image` mismatch — both pending Sessions 9D + 9E later today) would surface those bugs at the worst moment.

What was wired:

- **Step 0 — Supabase schema (one table, lazy persistence model).** New `outfit_history` table created via Supabase dashboard SQL Editor (matches Session 6A pattern; no migrations folder in this project). Columns: `id uuid PK`, `user_id uuid NOT NULL FK auth.users(id) ON DELETE CASCADE`, `client_outfit_id text NOT NULL`, snapshot fields (`vibe text NOT NULL`, `name text NOT NULL`, `description text`, `item_ids jsonb NOT NULL DEFAULT '[]'::jsonb`, `style_match_score integer`, `source text`), generation context (`occasion text`, `temperature text`, `condition text`, `indoors boolean DEFAULT false`, `brief text`, `pinned_item_id uuid`), interaction state (`rating text`, `rated_at timestamptz`, `saved boolean NOT NULL DEFAULT false`, `saved_at timestamptz`, `worn_dates jsonb NOT NULL DEFAULT '[]'::jsonb`), `created_at timestamptz NOT NULL DEFAULT now()`, `updated_at timestamptz NOT NULL DEFAULT now()`. Unique index `outfit_history_user_client_idx ON (user_id, client_outfit_id)` enables UPSERT on conflict. Partial index `outfit_history_saved_idx ON (user_id, created_at DESC) WHERE saved = true` for fast saved-outfits listing. RLS enabled with four policies (`outfit_history_select`, `outfit_history_insert`, `outfit_history_update`, `outfit_history_delete`) each scoped to `auth.uid() = user_id`. Explicit `GRANT SELECT, INSERT, UPDATE, DELETE ON public.outfit_history TO authenticated` as belt-and-suspenders. Grace pasted SQL into dashboard SQL Editor; confirmed table appears in Table Editor with RLS lock + all 4 policies visible in Authentication → Policies before proceeding. `pinned_item_id` deliberately has NO foreign key to `wardrobe_items.id` — preserves snapshot integrity if the pinned item gets deleted later; the field is for history only, never resolved at read time.

- **Step 1 — New helper `src/lib/outfitHistory.js` (130 lines).** Three exported async functions matching `wardrobeItems.js` pattern (import `supabase` from `./supabase`, throw on error so callers can show warm Clozie messages). `upsertOutfitInteraction(outfit, context, patch)` — single entry point. `patch` shape determines what changes: `{ rating: 'love' | 'like' | 'nope' }`, `{ saved: true | false }`, or `{ appendWornDate: <ISO> }`. `rating` and `saved` use simple UPSERT with `onConflict: 'user_id,client_outfit_id'`. `appendWornDate` is read-modify-write: SELECT existing `worn_dates` via `.maybeSingle()` → check if today's `YYYY-MM-DD` prefix already in the array → if yes, silent dedupe (per Grace's spec) → if no, append new ISO timestamp + UPSERT. Internal `buildSnapshot(outfit, context)` produces the same column-set on every call — same outfit ID always produces identical snapshot values (vibe/name/items don't change), so rewriting them via UPSERT is a safe no-op. `fetchSavedOutfits()` — written now so helper API is complete; returns `{ id, vibe, name, description, itemIds: string[], styleMatchScore, source, occasion, temperature, condition, indoors, brief, pinnedItemId, rating, wornDates, savedAt, createdAt }` ordered by `saved_at DESC NULLS LAST`. Caller (Session 12) resolves `itemIds` against current `wardrobeItems` state to get full WardrobeItem objects with photos. `markItemsWorn(itemIds)` — bumps `last_worn` + `times_worn` on each wardrobe item. Read-modify-write per item because Supabase JS SDK can't do `times_worn = times_worn + 1` inline; sequential parallel UPDATEs via `Promise.all`. Best-effort: per-item failures are `console.warn` not throw, because partial wear-log is better than failing the whole "I wore this today" flow. After Step 1: file written, nothing imports it, app booted clean on iPhone — pure dead code, no behavior change.

- **Step 2 — Ratings persistence (9A).** Five edits in App.js. (1) Import `upsertOutfitInteraction` from new helper at App.js:35. (2) New `handlePersistInteraction(outfit, patch)` wrapper in MainAppScreen right after `handleRegenerate` — curries `lastPayload` context away so callers pass only `outfit + patch`; fire-and-forget with `console.warn` on failure (local state is source of truth for current session). (3) Pass `onPersistInteraction={handlePersistInteraction}` prop to YourLooksTab. (4) Add `onPersistInteraction` to YourLooksTab destructured signature at App.js:2232. (5a) Update `handleRate(outfitId, rating)` → `handleRate(outfit, rating)` and add `onPersistInteraction(outfit, { rating })` call after the existing toast setup. (5b) Update call site at App.js:2613 from `handleRate(outfit.id, r.key)` to `handleRate(outfit, r.key)`. iPhone verified: tap Love → toast fires (2 sec) → DB row appears with `rating='love'`, `rated_at` populated with ISO timestamp, snapshot fields (vibe/name/item_ids/occasion/temperature/condition) populated, `saved=false`, `worn_dates=[]`. Re-tap with Like on same outfit → SAME row updates to `rating='like'`, no duplicate (UPSERT unique index doing its job). Rate Not-for-me on different outfit → new row inserts. Two rows total after rating two outfits.

- **Step 3 — Wore Today persistence (9B).** Six edits in App.js. (1) Extend helper import to include `markItemsWorn`. (2) New `handleMarkItemsWorn(itemIds)` wrapper in MainAppScreen right after `handlePersistInteraction` — fire-and-forget like its sibling. (3) Pass `onMarkItemsWorn={handleMarkItemsWorn}` prop to YourLooksTab. (4) Add `onMarkItemsWorn` to YourLooksTab signature. (5a) Update `handleWornToday(outfitId)` → `handleWornToday(outfit)`; calls both `onPersistInteraction(outfit, { appendWornDate: new Date().toISOString() })` and `onMarkItemsWorn(outfit.items.map(i => i?.id).filter(Boolean))`. (5b) Update call site at App.js:2596 from `handleWornToday(outfit.id)` to `handleWornToday(outfit)`. **Pre-existing bug surfaced and fixed:** the original `handleWornToday` only flipped the transient `wornToday` flag for 2 seconds — it did NOT touch any wardrobe item state, did NOT save any wear date anywhere. The CLAUDE.md spec ("saves today's date to Supabase against every item in this outfit") was essentially unbuilt — only the button visual existed. This session is the first time "I wore this today" actually does anything beyond the toast. iPhone verified: tap → toast → `outfit_history.worn_dates` shows ONE ISO timestamp; second tap same day same outfit → silent dedupe, still one entry in `worn_dates` (today's date prefix already matched); `wardrobe_items.times_worn` increments correctly (some items reached 2 in testing from appearing in multiple worn outfits); `wardrobe_items.last_worn` populated with today's ISO timestamp.

- **Step 3 deliberate scope limit: no optimistic local `wardrobeItems` state update.** After Step 3 lands, the My Closet "Last worn" display on each item card still shows "Never worn" until next full app reload (sign-out/in or fresh launch). Reason: the local `wardrobeItems` state stays stale until reload — no setter call in `handleMarkItemsWorn`. Adding optimistic local update was rejected because (a) Step 3 stays smaller and lower-risk without it, (b) it would surface a hidden second bug — the My Closet card at App.js:1465 renders `Last worn: ${item.lastWorn}` with zero date formatting, so an optimistic `lastWorn: new Date().toISOString()` would render an ugly raw ISO string like `2026-05-16T19:34:21.456Z`. Both the optimistic update AND a `formatLastWorn(iso)` helper land in a follow-up polish session. Documented as a new Known Issue.

- **Step 4 — Save/Unsave persistence (9C).** Two edits in App.js. (1) Update `toggleSave(outfitId)` → `toggleSave(outfit)`; compute `isSavingNow = !savedOutfits.includes(outfit.id)` BEFORE the setState so the closure capture is accurate, then call `onPersistInteraction(outfit, { saved: isSavingNow })`. (2) Update call site at App.js:2587 to pass full `outfit`. No new imports, no new props — `onPersistInteraction` already passes through from Step 2. iPhone verified: tap Save → `saved=true` + `saved_at` ISO timestamp on that row. Tap Unsave → SAME row, `saved=false` + `saved_at=null`. Tap Save again → SAME row, `saved=true` + NEW `saved_at` ISO timestamp. Combined with rating: single row shows `rating='love'` + `saved=true` + `saved_at` populated + (if worn) `worn_dates=[<iso>]`. UPSERT preserves prior interaction state on every patch because Supabase JS SDK's `.upsert()` only updates columns present in the row payload.

- **Step 5 deferred to Session 12 (Saved Outfits + Search).** Original plan included lifting `savedOutfits` from YourLooksTab to MainAppScreen + loading from DB on mount via `fetchSavedOutfits()` + sign-out reset + rendering Saved Outfits modal from DB snapshots resolved against current `wardrobeItems` state. Deferred per Grace's call after I recommended deferral. Three reasons: (1) Step 4 alone is a clean checkpoint with zero user-visible regression — `savedOutfits` local state continues to drive current-session display, exactly as before this session. (2) State lift is not throwaway work — same data-layer architecture works regardless of Session 12's presentation-layer changes (search, layout, card chrome). (3) Wiring real cross-session data into the existing Saved Outfits screen TODAY would surface two known render bugs (Mood Board polaroid placeholder colors instead of real photos via `MOOD_PLACEHOLDER_COLORS`, plus Hanger View at App.js:2894-2957 reading `top.image` instead of `top.photoUri`) — both pending fixes in Sessions 9D + 9E later today. Session 12 lift + render fixes + search ship in one focused pass against the right surface. Session 12 is 2 days out.

Design / scope decisions made during the session:

- **Lazy persistence, not eager.** Row inserted on first interaction (rate / save / wear), never on generation. The 3 outfits returned from every Generate call are NOT pre-inserted into `outfit_history`. Vast majority of outfits are scrolled past untouched — eager insert would write hundreds of useless rows per user.
- **One table over many.** Recommended `outfit_history` (single table) populated lazily over the AI Blueprint Section 10.3's row-per-generated-outfit. Single-table-lazy captures the future Clozie Learning analytics value while staying simple today. Same row can grow rating + saved + worn_dates over time.
- **UPSERT via `onConflict: 'user_id,client_outfit_id'`.** Unique index enables it. Supabase JS SDK's `.upsert()` only updates columns present in the row payload, so partial patches (e.g., setting just `rating`) don't accidentally clear `saved` or `worn_dates`. This is what makes the three-feature single-row design work.
- **`buildSnapshot(outfit, context)` writes all snapshot fields on every UPSERT.** Vibe/name/items don't change for a given client_outfit_id, so rewriting is safe. Belt-and-suspenders for the theoretical case where someone later changes which patches the function accepts.
- **`client_outfit_id text` not `uuid`.** Edge Function uses `crypto.randomUUID()` so all live values are valid UUIDs, but stubs and DEMO_MODE generate IDs like `'demo-1'`. Text type avoids future surprises with non-UUID identifiers.
- **Helper API: three patches, one function.** Considered separate `saveOutfit() / unsaveOutfit() / rateOutfit() / logWear()` functions but rejected — single `upsertOutfitInteraction(outfit, context, patch)` is simpler to call and easier to extend.
- **Persistence calls are fire-and-forget from MainAppScreen wrappers.** No spinner, no error toast. Local state is the source of truth for the current session. If the DB write fails, `console.warn` fires and the user is unaware — same pattern as `markItemsWorn`. Acceptable trade-off because every UI is locally-driven and the persistence is a background concern (nothing in the current UI reads from `outfit_history` yet).
- **Closure read of `savedOutfits` in `toggleSave` is intentional, not stale.** `isSavingNow = !savedOutfits.includes(outfit.id)` reads the closure-captured state at call time. React re-renders between taps, so the closure is always current. Different from the Session 6B retake closure-staleness bug (which involved multiple async operations writing to the same field).
- **No FK from `pinned_item_id` to `wardrobe_items.id`.** Preserves snapshot integrity if a pinned item gets deleted later. The field is for history only, never resolved at read time.
- **`indoors === true` strict equality in `buildSnapshot`.** Matches `applySafetyFilters` pattern in the Edge Function — defensive against `false` / `undefined` / `null` distinctions in JSON.

What was deliberately NOT done this session:

- No Edge Function changes whatsoever. `generate-outfits`, `recognize-photo`, `delete-user` all untouched. Zero CLI deploys.
- No SYSTEM_PROMPT changes — cache stays at 2,375 tokens. `supabase/functions/generate-outfits/index.ts` and `README.md` both untouched.
- No Step 5 (Saved Outfits cross-session display) — deferred to Session 12.
- No optimistic local `wardrobeItems` state update after `markItemsWorn` — polish session.
- No `formatLastWorn(iso)` helper for the My Closet card — polish session.
- No spinner / error toast for persistence failures — fire-and-forget pattern.
- No wiring of `Clear Clozie's Memory` to delete `outfit_history` rows. That handler in Settings has been a comment-only stub since Session 2. Now that real ratings/wear/save data exists, the stub should be wired in a future session to delete the user's `outfit_history` rows (RLS auto-scopes via `auth.uid() = user_id`).
- No "Save Feedback & Style Again" button-split — currently still shares the local `handleRegenerate` with the 🔄 Regenerate button per Session 7b-7. Will split when ratings → batched-write-then-regenerate flow lands.
- No session counter / weekly limits / VIP table — Session 14 / 16.
- No Apple Sign-In / Google Sign-In wiring — separate sessions.
- No Mood Board real-photo wiring — Session 9D / 9E.
- No Hanger View `item.image` → `item.photoUri` fix — Session 9D / 9E.
- No Share Outfit `onPress` wiring — Session 9 candidate.
- No warmth UI / SQL backfill — separate warmth session.
- No diagnostic log cleanup in `generate-outfits` — out of scope (no deploys this session).
- No fix for the `Leather Chelsea Boots` dislikes-filter token escape (Session 7b-7 known issue).
- No fix for the missing dislikes-filter log line in Supabase Logs.

Known limitations carried forward (new this session):

- My Closet card "Last worn" rendering is a raw ISO timestamp after Session 9B (App.js:1465). Before today, every item had `lastWorn = null` so the path was always "Never worn". Now worn items have ISO strings in the DB; on next reload they render raw on the card. Two follow-ups: (a) `formatLastWorn(iso)` helper, (b) optimistic local state update so the card refreshes immediately. New Known Issue entry added.
- Saved outfits do not survive app reload. DB row correctly has `saved=true`, but Saved Outfits modal at App.js:3057-3058 still filters current-session `outfits` by ID. After reload, `generatedOutfits` empties so saved outfits disappear from UI. Explicit Step 5 deferral to Session 12. New Known Issue entry added.
- Known minor race in `markItemsWorn`: if same item appears in two outfits the user marks worn within ~100ms, parallel UPDATEs could read `times_worn=5` twice and both write 6 (lost increment). The 2-second toast lockout in `handleWornToday` makes this practically impossible. Not worth solving with an RPC today.

App.js net diff for the session: +43 lines, -14 lines across sixteen tiny edits in 5 distinct regions (imports block at line 35, MainAppScreen wrappers `handlePersistInteraction` + `handleMarkItemsWorn`, MainAppScreen YourLooksTab render line, YourLooksTab destructured signature, three YourLooksTab handlers `handleRate` / `handleWornToday` / `toggleSave` + their three call sites).

Files created/modified:
- `src/lib/outfitHistory.js` — NEW (130 lines)
- `App.js` — modified (signature changes + persistence wiring)
- Supabase `outfit_history` table — NEW (out-of-band via dashboard SQL Editor)
- `supabase/functions/generate-outfits/` — UNTOUCHED
- `supabase/functions/recognize-photo/` — UNTOUCHED
- `supabase/functions/delete-user/` — UNTOUCHED

Commit: TBD on testing branch. Version label: v2026-05-16-session9abc. Push to remote — Grace's call.

---

Created March 2026.
Updated March 24 2026 — REBUILD RULE and testing branch rule added.
Updated March 27 2026 — Converted to plain text so Claude Code can read it correctly.
Updated May 3 2026 — includes all decisions from April 28, 30, May 1, May 2 sessions. Sections 1-3 cleanup applied. Supabase auth Session 1 wired (Sign Up, Sign In, Settings).
Updated May 4 2026 — Supabase auth Session 2 wired (Settings Sign Out, Forgot Password, Update Password, Clear Memory stub, Delete Account via Edge Function). Site URL fixed.
Updated May 5 2026 — VIP investigation complete. Native app confirmed clean — zero hardcoded VIP emails. VIP work deferred to Session 9 (limits and caps).
Updated May 6 2026 — Photo Upload Session 5 wired. Camera + gallery via expo-image-picker, EXIF orientation fix via expo-image-manipulator. Photos save with items in local state (Supabase Storage upload = Session 6). Add Item panel: Take Photo + Upload File buttons fully functional, 200x200 photo preview, edit flow preserves existing photos. iOS permission strings added to app.config.js.
Updated May 7 2026 — Supabase Wardrobe Session 6A wired. wardrobe_items table + private wardrobe-photos Storage bucket + RLS policies. Full Add/Edit/Delete CRUD persists to Supabase. Photos upload via arrayBuffer (the RN footgun-safe path). Signed URLs (1hr TTL) for display. Cross-user isolation verified. Helper module src/lib/wardrobeItems.js. App.js: load items on mount, async handlers, Saving/Removing button states, warm Alert on errors.
Updated May 8 2026 — Photo Recognition Session 6B wired. Camera + gallery photos auto-recognized via Claude Sonnet 4.6 (helper at src/lib/clozieRecognition.js, max_tokens 500, category validation + name/category-mismatch correction). Add Item panel: scanning bar, sage success bar with terracotta CLOZIE RECOGNISED eyebrow (#A44A34, no sparkle), terracotta #A44A34 border on Clozie-filled fields that clears on user edit, no-key + network-error fallbacks. Auto-fill never overwrites user-typed content; retake refreshes via React functional setters (closure-staleness fix). API key still in client (.env EXPO_PUBLIC_ANTHROPIC_KEY) — moves to Edge Function in Session 7.
Updated May 8 2026 — Outfit Edge Function Session 7a wired. Photo recognition migrated to Supabase Edge Function `recognize-photo` (source-of-truth backup at supabase/functions/recognize-photo/README.md). EXPO_PUBLIC_ANTHROPIC_KEY removed from `.env` and `app.config.js` — Anthropic key now lives ONLY in Supabase Edge Function secrets as ANTHROPIC_API_KEY. Anthropic $50/month spend cap set as safety belt. src/lib/clozieRecognition.js rewritten (113 → 41 lines): now calls `supabase.functions.invoke('recognize-photo', ...)` instead of api.anthropic.com directly. Public function signature unchanged — App.js untouched. Closes Legal Tracker §14.10 (API-key-in-client vulnerability). Outfit generation deferred to Session 7b.
Updated May 9 2026 — My Style Persistence Session 7b-0 wired. Style profile (selected styles, colour palettes, never-wear text) now persists in Supabase via auth.user_metadata. StyleDNATab loads from user_metadata on mount; Build My Closet saves before navigating; Skip navigates without saving; gentle terracotta inline error on save failure. No new table — uses same pattern as Settings → Edit Profile. Hard blocker for outfit generation cleared. Sessions 7b-1 through 7b-4 will build the outfit Edge Function on top of this.
Updated May 9 2026 — generate-outfits Edge Function Session 7b-1 wired. Skeleton + stub response only — no Anthropic call yet (lands in 7b-3). Auth-gated (JWT verify ON), reads wardrobe from Supabase, three gates (5 styleable items, (Tops AND Bottoms) OR Dresses, valid pin). Returns 3 stub outfits with real wardrobe item UUIDs from user's closet — anatomy-aware layouts (Top+Bottom+Shoes / Dress+Shoes / Top+Bottom+LightOuterwear), pinned item appears in every outfit. Source field "stub" → "sonnet" in 7b-3. Source-of-truth backup at supabase/functions/generate-outfits/README.md. Tested via curl. Client wiring deferred to Session 7b-2.
Updated May 9 2026 — Client wiring Session 7b-2 wired. New helper at `src/lib/outfitGeneration.js` (mirrors `clozieRecognition.js` — calls `supabase.functions.invoke('generate-outfits')` and parses 4xx error bodies via `error.context.json()` to surface gate codes). Generate button in Today's Vibe sends full payload (temperature, condition, occasion, indoors, pinnedItemId, brief, styleProfile from `auth.user_metadata`). MainAppScreen orchestrates via `handleGenerate(payload)` — spam-tap guard, switches to Your Looks, calls helper, resolves item IDs to full WardrobeItem objects from local `wardrobeItems` state. YourLooksTab driven by lifted `generationStatus` (idle/loading/success/error) replacing fake-spinner `hasTriggeredGenerate`. Three gate errors mapped to warm Clozie messages in the empty-state slot ("Hmm" title + "Adjust your vibe →" button). Outfit card photo strip + Saved Outfits photo strip now show real wardrobe photos via signed URLs (`overflow:'hidden'` + `photoStripThumbImage` style mirrors `gridCardPhoto` pattern). Tested on iPhone — 3 stub outfits display with real photos and item names from real closet. Brief field passed through but ignored by stub composition (lands in 7b-3). Regenerate wiring + Must Include pin selector redesign + Mood Board real photos all deferred to follow-up sessions.
Updated May 10 2026 — Real Anthropic call wired (Session 7b-3). generate-outfits Edge Function now fires real Sonnet 4.6 with editorial outfit names. Three sequential bug fixes via Supabase logs: (1) greedy JSON regex replaced with brace-walk that stops at first balanced {...}; (2) max_tokens bumped 500 → 1500 to stop truncation; (3) name-to-UUID lookup now splits on `|` and uses only the first segment, since Sonnet was returning items in full pool format including category and colour. Verified on iPhone — "Cream & Cool" and "Boho Off-Duty" appeared with real descriptions; Supabase logs showed `source: "sonnet"`. Diagnostic `raw AI text:` log added in callAnthropic — temporary, remove in polish pass. KNOWN: Anthropic prompt caching not working (both cache_creation_input_tokens and cache_read_input_tokens are 0 on every call) — separate session before launch.
Updated May 10 2026 — Prompt caching fixed (Session 7b-4). Two surgical Edge Function changes in two separate deploys: (1) removed Session 7b-3's diagnostic `console.log('[generate-outfits] raw AI text:', text)`; (2) replaced the deployed SYSTEM_PROMPT (~1,720 tokens — below Sonnet 4.6's 2,048-token caching threshold, which is why cache_control was being silently ignored) with the canonical v5 padded prompt designed by the Style Council/Business Council on May 8 2026 — 7,714 chars / 187 lines / 2,267 actual tokens per Anthropic's tokenizer (~219 tokens / 11% margin above 2,048). Both `{{requestedOutfits}}` template placeholders substituted to literal `3` before paste. Verified via raw Supabase log paste from browser: Call 1 cache_creation_input_tokens=2267, Call 2 cache_read_input_tokens=2267 (exact round-trip), input_tokens 274 → 3 on cached call. Estimated cost impact: ~4–4.5× cheaper input on every cached call within the 5-min TTL window. KNOWN curiosity (now in Known Issues): Call 2 also shows cache_creation_input_tokens=271 alongside the 2,267 cache_read — appears to be Anthropic auto-extending cache into portions of the user message even though we declare only one cache_control breakpoint. Cosmetic, possible future optimisation. App.js was NOT opened or edited at any point.
Updated May 10 2026 — JS Safety Filters wired (Session 7b-5). Five weather/indoor safety filters added to the `generate-outfits` Edge Function (C1 Cold drops Light/None warmth from Tops/Dresses; C2 Hot drops Heavy across all categories; C3 Rainy drops `suede`/`sandal`/`open-toe`/`mule` names; C4 Snowy drops `suede`/`espadrille`/`sandal`/`open-toe`/`flip-flop`/`stiletto` substrings + word-boundary regex for `heel(s)`/`pump(s)` — snow is the one weather where heels are filtered, as safety not taste; C5 Indoor drops Heavy Outerwear when toggle ON). Pinned item exempt from all filters; soft-fail safety net reverts to unfiltered pool if essentials gate breaks. Category imbalance flag added to user message (fires when bottoms ≤ 2 AND tops > 8). Inert `computeOutfitPotential` stub for Session 9. Discovery mid-session: warmth column is NULL on every wardrobe item — deferred from Sessions 6A and 6B — so C1/C2/C5 are dormant today, will activate when warmth UI session lands. C3/C4 work today via name pattern matching. Dynamic outfit count from original plan explicitly KILLED to protect 2,267-token cached system prompt. App.js NOT touched. Six deploys, each verified on iPhone with `cache_read_input_tokens=2267` intact (NOTE: cache_read=2267 figure later corrected to 2132 in Session 7b-6 — see below).
Updated May 12 2026 — Session 7b-6 CLI deploy + CLAUDE.md corrections (Session 7b-6 closed). Resumed from May 11 paused state. Root cause of 7b-6 deploy mystery: TWO clipboard-corruption bugs (awk + pbcopy MacRoman decode mangled em-dashes/middots; chat-paste truncated >40KB files). Switched to `supabase functions deploy --use-api` from disk via CLI v2.98.2 (`brew install supabase/tap/supabase`). Bypasses all clipboard surfaces. Created `supabase/config.toml` and `supabase/functions/generate-outfits/index.ts` (extracted from README via Python binary I/O, byte-perfect). Canonical v5 SYSTEM_PROMPT corrected from 2,267 to 2,132 tokens (every prior 2,267 measurement was mojibake-inflated by ~135 tokens). Cache still works (2,132 > 2,048 threshold, 84-token headroom). Added FANCY_DRESS_PATTERN filter for Outdoor · Sport (chiffon/silk/satin/velvet/lace/organza/tulle/sequin/beaded/gown/evening/cocktail). Steps 8 (weather hints) and 9 (Heavy/Light label + styling signal — bundle with warmth UI session) deferred. Diagnostic logs `[7b6-sentinel-v2]`, `[7b6-literal-check]`, `[diag-5b]` still in production — cleanup deploy via CLI in future polish pass. CLAUDE.md corrections: D-U-N-S RECEIVED, Anthropic spend cap $100/$50/$200, @styledbyclozie, "DM Serif Display" outfit name font, clozieapp.com (Resend SMTP delivery). App.js NOT touched. CLAUDE_May12_2026.md backup placed on Desktop. Workflow change: future Edge Function deploys MUST use CLI (`supabase functions deploy --use-api`), not dashboard paste.
Updated May 13 2026 — Session 7b-6 cleanup wired (skirt filter + weather hint + outerwear tags + Padding Section 7 + diagnostic log cleanup confirmation). Five CLI deploys, each iPhone-verified. SYSTEM_PROMPT moved 2,132 → ~2,375 tokens after Section 7 (327-token / ~16% headroom above 2,048). Two new discoveries: first CLI deploy attempt of session silently failed (--yes flag suspected; removing it unblocked subsequent four deploys); Supabase dashboard "Code" tab is a stale editor view rather than runtime mirror — verification via iPhone + Logs only. App.js NOT touched. Two KNOWN ISSUES resolved (deploy propagation BLOCKER + diagnostic logs still in prod); one new KNOWN ISSUE added (Code tab is stale).
Updated May 14 2026 — Session 7b-7 wired (dislikes hard filter + Regenerate button). One CLI deploy on `generate-outfits` (no `--yes` flag, per 7b-6 lesson) + 5 surgical App.js edits, all verified on iPhone. Dislikes filter: new block inside `applySafetyFilters` reads `styleProfile.neverWear`, tokenizes on commas + semicolons with stopword filtering and min length 4, matches case-insensitive substring on `name + colour` only (NOT notes), pinned exempt. Regenerate: new `lastPayload` state in MainAppScreen + `onRegenerate` prop on YourLooksTab; fake 2-second `setTimeout` deleted from local YourLooksTab handler. Both 🔄 Regenerate AND Save Feedback & Style Again → share the local handler. SYSTEM_PROMPT untouched — cache safe at 2,375 across all session calls. Three Session 9 candidates surfaced from read-only code check at session start: Mood Board polaroids still placeholders (already known); Hanger View reads `item.image` instead of `item.photoUri` (new — App.js:2894-2957); Share Outfit button at App.js:2607-2613 has no `onPress` prop (new). Dislikes filter log line does not appear in Supabase Logs (visibility issue only, filter works in production). `Leather Chelsea Boots` escapes the `leather` token (minor false-positive). All four new items added to KNOWN ISSUES.
Updated May 14 2026 — Session 7C wired (JavaScript Smart Fallback). Five CLI deploys via `supabase functions deploy --use-api`, each iPhone-verified before next. New `buildSmartFallback` function in `generate-outfits` replaces basic stub as the primary fallback for any Anthropic failure (timeout / 5xx / 429 / malformed JSON / schema validation / name→UUID mapping failure). Returns 3 outfits with per-occasion editorial names (Casual Day → "Easy Sunday" etc., Work · Office → "Morning Confidence" etc., 7 occasion pools total), color-aware composition (neutral / earth / navy family pairing with navy+earth clash detection), pinned-item enforcement, item-aware descriptions ("colour-word with colour-word — mood."). Uses safety-filtered `filteredItems` pool with soft-fail revert (<5 items) to unfiltered `items`. If smart fallback itself throws, last-resort to existing `buildStubOutfits` — 3-tier safety net (Sonnet → smart fallback → stub) live in production. New `source` field values: `"sonnet" | "fallback" | "stub"`. SYSTEM_PROMPT NOT touched — cache stayed at 2,375 tokens across every deploy. App.js NOT touched at any point. Verified force-on test against Casual Day / Formal Event / Going Out (source "fallback", no Anthropic cost). After revert: Sonnet editorial names back, cache 2,375 confirmed across Casual Day / Work · Office / Outdoor · Sport.
Updated May 16 2026 — Session 8 wired (AI Consent Modal + Keyboard Fixes + Today's Vibe Polish). Four tasks complete, all in App.js. (1) AI Consent Modal (Apple 5.1.2i) — new `ConsentModal` component, names Anthropic explicitly, tappable anthropic.com/privacy link, Accept saves `ai_consent_given: true` to `user_metadata` (same pattern as style profile from 7b-0), Decline closes without saving, gate placed in `handleGenerate` before spam-tap guard, persistence verified across sign-out/sign-in, skipConsentCheck flag handles React setState race when resuming generation. (2) KeyboardAvoidingView wrapped around StyleDNATab, TodaysVibeTab, SettingsScreen ScrollView, and Delete Account Modal overlay — AuthScreen + WardrobeTab already had KAV (My Closet skipped per Grace, Session 15 redesign). (3) Placeholder contrast 0.40→0.65 on TodaysVibe Brief and 0.35→0.65 on StyleDNA never-wear — both now match WardrobeTab Add Item. (4) Today's Vibe empty state — when wardrobeItems.length === 0, tab early-returns a centered empty state ("Add a few pieces to your closet first — Clozie will do the rest." + sage "Go to My Closet →" button, text-only, no title per Grace's choice). New `onGoToCloset` prop; MainAppScreen passes `() => setActiveTab(1)`. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens. No CLI deploys. Thirteen tiny LOW-risk sub-steps, each iPhone-tested before next. App.js net diff approximately +205 lines, zero deletions.
Updated May 16 2026 — Session 9A/9B/9C wired (outfit history persistence — rating + wore today + save/unsave). New `outfit_history` Supabase table created via dashboard SQL Editor (4 RLS policies + GRANTs scoped to authenticated; unique index on `(user_id, client_outfit_id)` enables UPSERT). New `src/lib/outfitHistory.js` helper (130 lines) — three exports: `upsertOutfitInteraction(outfit, context, patch)`, `fetchSavedOutfits()` (Session 12 reader, not yet called), `markItemsWorn(itemIds)` (bumps wardrobe_items counters). App.js: two MainAppScreen wrappers + `onPersistInteraction` / `onMarkItemsWorn` props passed to YourLooksTab; `handleRate` + `handleWornToday` + `toggleSave` all changed to accept full `outfit` object. Local UI behavior identical — toasts, button states, Saved Outfits modal current-session filter all unchanged. Lazy persistence — row inserted only on first interaction (rate / save / wear). Verified on iPhone: rating UPSERT (re-rate updates same row), wore-today same-day dedupe (second tap silent no-op), `wardrobe_items.times_worn` increments across shared items, save/unsave flips boolean cleanly, all three interaction types coexist on single row. Pre-existing bug fixed: original `handleWornToday` only flipped the transient toast flag — never persisted anything. Step 5 (lift + load Saved Outfits from DB) DEFERRED to Session 12 (Saved Outfits + Search) — same session fixes Mood Board polaroid placeholders + Hanger View `item.image` mismatch (Sessions 9D + 9E later today). Edge Function NOT touched. SYSTEM_PROMPT NOT touched. Cache stays at 2,375 tokens. Zero CLI deploys.

Drop this file into the root of the clozie-native project folder.
Drop App_ORIGINAL.jsx in the same folder as reference.
Claude Code reads CLAUDE.md automatically at the start of every session.
