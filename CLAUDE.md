# CLOZIE — Master Build Document

FILE NAME: CLAUDE.md
WHAT GRACE CALLS IT: Clozie MD / the master file
WHAT CLAUDE CODE CALLS IT: CLAUDE.md (must use this exact name)
HOW TO USE: Drop this file into the root of your clozie-native project folder. Claude Code reads it automatically every session. In claude.ai planning chats — paste the full contents.

READ THIS ENTIRE FILE before doing anything. No exceptions.

Last updated: May 21 2026 — Session 14A wired (Privacy Policy + Terms of Service WebViews in Settings). Three LOW-risk substeps + one new dependency, each iPhone-tested before the next. App.js only — Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys. (Step 1) `npx expo install expo-web-browser` → `expo-web-browser ~15.0.11` added (SDK-54 compatible). Expo CLI noted `app.config.js` couldn't be auto-edited and suggested adding `"plugins": ["expo-web-browser"]` — deliberately SKIPPED because the plugin entry is only required for `WebBrowser.openAuthSessionAsync` (OAuth redirect handling); `WebBrowser.openBrowserAsync` (the in-app Safari View Controller sheet we want) works without it. `app.config.js` untouched. (Step 2) Two surgical additions in App.js: new `import * as WebBrowser from 'expo-web-browser';` at line 37 grouped with other `expo-*` imports next to expo-haptics; new "Legal document URLs (Termly-hosted)" section at lines 56-58 with `PRIVACY_POLICY_URL` and `TERMS_OF_SERVICE_URL` constants (both `https://app.termly.io/policy-viewer/policy.html?policyUUID=<UUID>` — verified live via `curl -sI` HTTP/2 200 before wiring). Pure dead code until Step 3. (Step 3) New LEGAL `<View style={settingsStyles.card}>` inserted between the closing of the ABOUT card (App.js:5788) and the Sign Out error block. Two rows matching the existing DATA card pattern byte-for-byte: Row 1 "Privacy Policy" / "How we handle your data" / gold `View` link → `WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL).catch(() => {})`; divider; Row 2 "Terms of Service" / "How Clozie works for you" / gold `View` link → `WebBrowser.openBrowserAsync(TERMS_OF_SERVICE_URL).catch(() => {})`. Reuses existing `settingsStyles.cardRow` / `cardRowLabel` / `cardRowValue` / `goldLink` / `divider` styles — zero new style entries. `hitSlop` 10/10/10/10 matches every other gold-link row (44pt+ effective tap target). `.catch(() => {})` swallows rare open errors silently — no crashes, no Alert. New visual hierarchy in Settings: ACCOUNT → DATA → ABOUT → **LEGAL** → Sign Out. Placement decision: separate LEGAL card rather than appending rows inside ABOUT — ABOUT ends with the destructive Delete Account button; stuffing legal docs into that same card would have muddled the hierarchy. `expo-web-browser` chosen over `Linking.openURL` because `openBrowserAsync` opens an in-app Safari View Controller (iOS) / Custom Tabs (Android) sheet — user stays inside Clozie, swipe-dismiss returns cleanly; `Linking.openURL` would have kicked them out to the OS default browser. `Linking` import (line 14) untouched — still used by the consent modal's anthropic.com/privacy link at App.js:6522. Verified end-to-end on iPhone: both rows render with correct label + subtitle + gold View link; tap Privacy Policy → Termly privacy doc opens in in-app sheet, scrolls, swipe-down dismisses cleanly back to Settings; tap Terms of Service → Termly terms doc opens + dismisses the same way; regression checks (Edit Profile, Change Password, Clear Clozie's Memory, Styling Permissions Revoke, Delete Account, Sign Out, Today's Vibe Generate) all unchanged. Closes the long-standing 'Privacy Policy Screen — Must be built before Phase 3 App Store submission' spec gap — both legal docs now reachable from Settings ahead of App Store submission. May 20 2026 — Session 13I wired (AI consent revoke — Apple 5.1.2(i) compliance gap closed). Three LOW-risk substeps in App.js only — Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys. (Step 1) New `handleRevokeConsent` async handler in MainAppScreen ([App.js:6749-6758](App.js:6749)) mirrors `handleAcceptConsent`'s optimistic pattern — `setConsentGiven(false)` first, then best-effort `supabase.auth.updateUser({ data: { ai_consent_given: false } })` with try/catch that swallows network errors. New `onRevokeConsent={handleRevokeConsent}` prop passed to SettingsScreen via expanded multi-line render call ([App.js:6826-6830](App.js:6826)). SettingsScreen signature ([App.js:5234](App.js:5234)) extended to destructure the new prop. Dead prop after Step 1 — UI consumer lands in Step 2. (Step 2) New `showRevokeConsentModal` useState hook in SettingsScreen next to `showClearMemoryModal`. New "Styling Permissions" row appended to DATA card after the Change Password panel — gets its own divider above, then label "Styling Permissions" + subtitle "Manage your consent for Clozie styling" + `Revoke` gold link. Tap opens new confirm Modal that byte-for-byte mirrors the Clear Clozie's Memory modal structure — same `savedStyles.confirmOverlay` / `confirmModal` / `confirmHeading` / `confirmBody` / `confirmPrimaryRing` / `confirmPrimaryButton` / `confirmCancelButton` — only strings change: heading "Revoke Styling Permissions?", body "This will require you to re-accept before Clozie can generate outfits. Continue?", primary "Yes, revoke", outlined Cancel. Both modal buttons close the modal in Step 2 — inert by design, wired in Step 3. Zero new style entries (full cross-component reuse of existing `settingsStyles` row styles + `savedStyles` confirm-modal styles). Row always visible regardless of `consentGiven` state — Grace's call, treats Revoke as a permission control, not a state-mirror toggle. (Step 3) New `revokeFlash` useState hook + useEffect with `setTimeout(1500)` + `clearTimeout` cleanup (handles unmount mid-flash safely — e.g. user closes Settings during the 1.5s window). Row's right side wrapped in ternary on `revokeFlash`: when true renders plain "Consent revoked" text (inline style — body color `#5C4A3A`, Outfit_500Medium 14pt, NO sparkle per Grace's directive); when false renders the original `Revoke` gold link TouchableOpacity. Style inlined rather than promoted to `settingsStyles` — minimum surface; can be promoted in a polish pass. "Yes, revoke" button onPress wired: `setShowRevokeConsentModal(false)` → `onRevokeConsent()` (fire-and-forget — function is async but caller doesn't await, matches MainAppScreen's `handlePersistInteraction` pattern) → `setRevokeFlash(true)`. Order matters — modal closes first for snappy feel, revoke fires second, flash starts third. LANGUAGE RULE compliance: row + subtitle + confirm modal copy carefully avoids "AI" — uses "Styling Permissions" + "Clozie styling" + "Clozie can generate outfits" throughout. Mirrors the ConsentModal's existing pattern of saying "Clozie uses Anthropic" rather than "AI". Initial session brief used "AI Data Consent" / "AI styling" / "AI consent" wording which would have violated CLAUDE.md Rule 17 — flagged + Clozie-first wording approved before any code touched the file. Verified end-to-end on iPhone across all 6 checks: tap Revoke → confirm modal opens → tap Yes, revoke → modal closes → row shows "Consent revoked" for 1.5s → row returns to `Revoke` link → close Settings → Today's Vibe → tap Generate → ConsentModal appears (proves local `setConsentGiven(false)` propagated through `handleGenerate`'s gate) → Accept → outfits generate normally → sign out → sign in → Revoke again → close Settings → Today's Vibe → Generate → ConsentModal appears again (proves Supabase `ai_consent_given: false` persisted across auth cycle); regression checks (Clear Clozie's Memory, Change password, Sign Out) all unchanged. May 20 2026 — Session 13H wired (My Closet empty state hanger drawing animation). Phase 1 (stagger-draw the hanger SVG) + Phase 3 (text + button fade-in) wired in App.js only. Phase 2 (settle bounce) deliberately SKIPPED per Grace's call after Phase 1 verified. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys, zero new dependencies (`react-native-svg 15.12.1` already installed, `Path` already imported at App.js:30, `Animated` already used elsewhere via Session 13E/13G). `react-native-reanimated` confirmed NOT installed during reality check — built-in `Animated` API used throughout. (Step 1.1 — path split + static parity) New local component `AnimatedEmptyStateHanger` ([App.js:6341](App.js:6341)) inserted directly below `TabHangerIcon`, parallel component scoped to the My Closet empty state only. `TabHangerIcon` completely untouched — three other callers (My Closet card placeholders App.js:1609, Pin Sheet placeholders App.js:2415, tab bar registration App.js:6672) continue using the original unchanged. The hanger SVG `d` attribute split into TWO `<Path>` elements: hook circle `M12 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4z` + stem-and-bar `M12 4v3L3.5 13.5A1.5 1.5 0 0 0 4.5 16h15a1.5 1.5 0 0 0 1-2.5L12 7` (absolute `M` on the second path because the original used relative `m0 0` from current point `(12,4)` after the `z`-close of the hook sub-path). Same `stroke` / `strokeWidth` / `strokeLinecap='round'` / `strokeLinejoin='round'` / viewBox / size params as the original combined-path render. JSX swap at empty state ([App.js:1408](App.js:1408)): `<TabHangerIcon active={false} size={80} ...>` → `<AnimatedEmptyStateHanger size={80} ...>`. iPhone-verified pixel-identical to pre-split render before adding any animation. (Step 1.2 — stroke-dashoffset draw animation) `const AnimatedPath = Animated.createAnimatedComponent(Path)` defined at module scope just above the component. Inside the component: two `useRef(new Animated.Value(100)).current` refs (`hookOffset` + `barOffset`, both starting at 100 = fully invisible). `useEffect([])` on mount runs `Animated.sequence([Animated.timing(hookOffset, { toValue: 0, duration: 400, useNativeDriver: false }), Animated.timing(barOffset, { toValue: 0, duration: 1100, useNativeDriver: false })]).start()`. Both `<Path>` swapped to `<AnimatedPath>` with `strokeDasharray={100}` + `strokeDashoffset={hookOffset/barOffset}`. Hardcoded `100` dash length is safely larger than both real path lengths (hook ~12 units, bar ~44 units) so dasharray renders as one long dash + one long gap — path fully invisible at offset 100, fully drawn at offset 0; the imprecision is invisible to the eye and avoids the runtime `ref.getTotalLength()` complexity. `useNativeDriver: false` because react-native-svg stroke props don't run on the native driver — fine here, animation is tiny (two offset values), zero perceivable jank. Re-mount mechanic confirmed: empty state is gated by `itemCount === 0 && !showAddPanel` at App.js:1400 — adding an item flips the gate false (component unmounts), deleting all items flips it true again (component remounts, useEffect re-runs, animation replays). (Step 3.1 — text + button fade-in) Phase 2 settle bounce deliberately SKIPPED per Grace's call — went straight to Phase 3 after Phase 1 verified. New local component `AnimatedEmptyStateText({ children })` inserted directly below `AnimatedEmptyStateHanger` (~App.js:6384). Single `Animated.Value(0)` ref drives BOTH opacity AND translateY via interpolation `inputRange:[0,1] outputRange:[10,0]` — value 0 = opacity 0 + 10px below, value 1 = opacity 1 + final position. `useEffect([])` on mount runs `Animated.timing(textAnim, { toValue: 1, duration: 500, delay: 1500, useNativeDriver: true })` — the 1500ms delay matches the exact end of the hanger draw sequence (400 hook + 1100 bar = 1500). `useNativeDriver: true` because opacity + transform both qualify, runs off the JS thread. Returns `<Animated.View style={{ width: '100%', alignItems: 'center', opacity: textAnim, transform: [{ translateY }] }}>{children}</Animated.View>` — `width: '100%' + alignItems: 'center'` preserves the horizontal centering that the parent `emptyStateContainer` (`alignItems: 'center'`) was doing for the three loose siblings. No layout shift during the 1.5s wait — opacity:0 elements still occupy their full layout space in RN, so the container is stable and the button doesn't jump up from below at fade-in time. JSX wrap at empty state ([App.js:1410-1424](App.js:1410)): heading `<Text>` + subtext `<Text>` + `<TouchableOpacity>` button (previously three loose siblings of the hanger View) wrapped in `<AnimatedEmptyStateText>...</AnimatedEmptyStateText>`. Hanger View stays OUTSIDE the wrapper, draws on its own timing. Mounts/unmounts with the empty state same as the hanger — full sequence replays whenever user returns to an empty closet. (Mid-session size bumps) Grace iPhone-tested three sizes on the `AnimatedEmptyStateHanger` call in the empty state JSX only: 80 → 100 → 120. Final 120 locked. Each size change was a single-number edit; `TabHangerIcon` and its three other callers byte-identical throughout. (Timing summary) t=0 hook starts drawing; t=400 hook complete + bar starts; t=1500 bar complete + text fade kicks in; t=2000 text + button fully visible. App.js net diff +93 / -14 lines across 5 edits in 2 regions (new `AnimatedPath` + `AnimatedEmptyStateHanger` + `AnimatedEmptyStateText` block ~App.js:6336-6410, JSX swap + wrap ~App.js:1407-1422). Zero deletions of behavior. May 20 2026 — Session 13G wired (haptics + LayoutAnimation + heart save pulse). Three LOW-risk tasks across App.js + one new dependency, each iPhone-tested before the next. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys. (Pre-step 0) `npx expo install expo-haptics` → `expo-haptics ~15.0.8` added, SDK-54-compatible, package.json + package-lock.json only. (Task 1 — Haptics) New `import * as Haptics from 'expo-haptics'` at App.js:35 grouped with other `* as` namespace imports. Five haptic moments wired: (1) `Haptics.impactAsync(Medium)` as first line of `handleGenerate` — fires on Generate AND Regenerate AND Save Feedback & Style Again (all route through MainAppScreen.handleGenerate via `lastPayload`). (2) `Haptics.impactAsync(Light)` inside `toggleSave` gated `if (isSavingNow)` so save buzzes and unsave is silent — matches the brief's "only animate on save" instinct extended to haptics. (3) `Haptics.impactAsync(Light)` as first line of pin-sheet grid card `onPress` — fires on both pin and unpin from the sheet (sheet stays open on unpin so haptic confirms tap registered). (4) `Haptics.impactAsync(Light)` inside the X-on-pinned-pill `onPress`, expanded from single-line arrow `() => setPinnedItemId(null)` to block body `() => { Haptics...; setPinnedItemId(null); }`. (5) `Haptics.notificationAsync(Success)` inside `runRecognition` immediately after `setRecognitionStatus('success')` — fires only on actual recognition success, silent on error/no-key paths. All five `impactAsync`/`notificationAsync` calls are fire-and-forget (no await) — non-blocking, no UI delay. (Task 2 — LayoutAnimation) `LayoutAnimation` added to existing `react-native` destructure block between `KeyboardAvoidingView` and `Linking`. Two `LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)` calls injected immediately before the two `setItems` array mutations in My Closet: `handleAddItem` array prepend at App.js:1140 and `handleDeleteItem` array filter at App.js:1252. `handleSaveEdit` at App.js:1217 (in-place mutation, no reflow) deliberately not animated. Android `UIManager.setLayoutAnimationEnabledExperimental(true)` enable deliberately NOT added — iOS works without it (Expo Go on iPhone is the testing target); add in follow-up if Android ever surfaces a problem. `easeInEaseOut` preset chosen for natural-feeling slide. (Task 3 — Heart save pulse) Three substeps. (Step 3.1) New `saveAnim = useRef(new Animated.Value(1)).current` + new `savingOutfitId` state hook added inside YourLooksTab body grouped with existing Animated.Values (`spinAnim`, four `hanger*Anim` refs). Initial scale 1.0 (no transform). (Step 3.2) Save button JSX wrapped: existing `<Text style={looksStyles.actionButtonText}>{...}</Text>` now inside `<Animated.View style={savingOutfitId === outfit.id ? { transform: [{ scale: saveAnim }] } : null}>`. **Approach A chosen (whole button content scales together) over Approach B (split heart from label) — Grace's call for lower structural risk.** Conditional gating via `savingOutfitId === outfit.id` ternary means only the just-saved card's wrapper attaches the transform; all other Animated.Views render inert with `style={null}`. (Step 3.3) Spring sequence wired inside `toggleSave`'s existing `if (isSavingNow)` gate: `setSavingOutfitId(outfit.id)` → `saveAnim.setValue(1)` → `Animated.sequence([Animated.spring(saveAnim, { toValue: 1.12, useNativeDriver: true, friction: 5, tension: 150 }), Animated.spring(saveAnim, { toValue: 1.0, useNativeDriver: true, friction: 4, tension: 120 })]).start(() => setSavingOutfitId(null))`. Two-spring sequence (up to 1.12, back to 1.0) totals ~400ms via the friction/tension tuning. Native driver compatible (transform-scale qualifies) → zero JS thread impact. Completion callback clears `savingOutfitId` so the Animated.View wrapper returns to inert state. Spam-tap mid-animation: re-pressing Save unsaves (Light haptic skipped, no animation per gate); pressing Save again resets `saveAnim` to 1 via `setValue(1)` mid-flight and starts the new sequence cleanly. Single shared Animated.Value is safe because only one card animates at a time — the conditional gate ensures other Animated.Views never read the live value. Unsave path: zero animation, zero haptic, instant icon swap (`❤️ Saved` → `🤍 Save`) per brief. Verified end-to-end on iPhone across all 5 haptic moments + add/delete grid animations + heart pulse on three independent saved outfits. May 20 2026 — Session 13F wired (splash logo baseline fix + saved outfits chip emoji removal). Two surgical fixes in App.js. (1) `splashLogoClo` style gained `lineHeight: 92` to match `splashLogoZie` — aligns "Clo" and "zie" to the same baseline on the splash screen (previously "Clo" sat slightly higher than the italic "zie"). (2) Saved Outfits item chip emoji prefix removed at App.js:4078 — chip renders only `item.name` now, dropped the `getCategoryEmoji(item.category)` prefix. `getCategoryEmoji` function untouched (still used in 3 other photo-thumbnail fallback locations). Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys. May 19 2026 — Session 13E wired (Hanger View headless outfit fix + entrance animation). Two LOW-risk phases in App.js only, each iPhone-verified before the next. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys. (Phase 1 — Headless outfit fix) When Sonnet produces an outfit with Outerwear + Bottoms + Shoes but no Tops and no Dresses, the centre top slot was rendering null (line 3601 `top = dress || Tops || null`) — pants and shoes anchored to an empty hanger, outerwear floated alone on the left side card. Fix: extended the categorisation block at App.js:3599-3612 — renamed the existing `top` const to `directTop`, added two derived lines `const top = directTop || lightOuter` and `const sideOuter = (top === lightOuter) ? null : lightOuter`. Side card render gate at App.js:3724 swapped from `{lightOuter && (...)}` to `{sideOuter && (...)}`, three inner refs swapped `lightOuter` → `sideOuter`. Outerwear promoted to centre uses existing `hangerSlotTop` (140×158, top:96) — same slot a regular Top would use, no new styles, no layout shift on non-headless outfits. Verified on iPhone across Tops outfit (byte-identical render), Dress outfit (byte-identical render), and headless outfit (outerwear now anchors centre, pants and shoes hang properly underneath, side card empty). (Phase 2 — Entrance animation) New staggered drop+fade animation when user opens Hanger View tab or switches outfit. 4 new `Animated.Value` refs in YourLooksTab (`hangerCentreAnim` / `hangerPantsAnim` / `hangerShoesAnim` / `hangerSideAnim`) inserted after the existing `spinAnim` ref at App.js:2860. New `useEffect` watching `[moodBoardTab, moodBoardOutfit]` — when tab is 'hanger' and outfit is set, resets all 4 anims to 0 and runs `Animated.stagger(250, [4× Animated.timing({ toValue: 1, duration: 350, useNativeDriver: true })])`. Timing: centre 0→350ms, pants 250→600, shoes 500→850, side 750→1100. Total ~1100ms. Initial timing (stagger 150, duration 200, total ~650ms) shipped, iPhone-tested, felt too fast — Grace called slower; bumped to 250/350 in a separate iPhone-verified edit. Six render blocks wrapped in `Animated.View` reading the appropriate ref: dress slot + top slot → `hangerCentreAnim`; pants → `hangerPantsAnim`; shoes → `hangerShoesAnim`; light outerwear side card + each of up to 5 accessory cards → `hangerSideAnim`. Each animated style: `opacity: anim` + `transform: [{ translateY: anim.interpolate({ inputRange: [0,1], outputRange: [-15, 0] }) }]`. For the two rotated card types (light outerwear `-4deg`, each accessory's per-card `pos.rot`), the existing rotation was moved INTO the animated transform array — without this, the animated `transform` would silently override the static rotation via style-array merge order and the cards would un-tilt. Native driver compatible (opacity + transform only, no layout properties animated). Zero JS thread impact, no interaction lag — 5-dot background colour picker stays responsive mid-animation. Entrance animation only — no continuous sway/idle motion yet, deferred to a future session. No `Animated` import change needed (already imported via existing `spinAnim`). One existing Known Issue persists from Session 13C: Sonnet Edge Function prompt sometimes generates outfits with two bottoms and no top (or bottoms + accessories + shoes with no top) — the Phase 1 headless fix covers the visual fallout client-side, but the underlying prompt rule still needs a dedicated Edge Function tuning session. May 19 2026 — Session 13D wired (Hanger View dress layout fix — closes the deferred Step 6 from Session 13C). Three small App.js changes shipped + one mid-session number experiment tried and reverted, iPhone-verified before lock. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys. New `hangerSlotDress` style (position absolute, top:88, left:'50%', marginLeft:-92.5, width:185, height:320, alignItems:'center', justifyContent:'flex-start', overflow:'hidden', zIndex:4) + new `hangerImageDress` style (width:'100%', height:'88%'). New module-scope const `DRESS_SHOES_TOP = 418` (10px gap from dress hem ending at y=408; LOCKED). JSX branch at App.js:3683-3713 area: when `dress` exists, render in `hangerSlotDress` with `hangerImageDress`; else render `top` in `hangerSlotTop` (byte-identical to pre-13D). `pants` block unchanged (categorisation already nulls pants when dress exists). `shoes` JSX gets inline `[hangerSlotShoes, dress && { top: DRESS_SHOES_TOP }]` style override — base `hangerSlotShoes.top:455` byte-identical for non-dress outfits, only overridden when dress exists. Z-index ladder NOT changed — current `hangerSvgWrap` zIndex:6 already sits above proposed dress zIndex:4 (the brief's Fix 3 z-index bump turned out unnecessary on inspection). The Image height < container height (88% of 320 = ~282px) combined with the parent's `justifyContent:'flex-start'` is the KEY piece that pins the photo to the top — neither alone is sufficient. `<Image resizeMode='contain'>` centers its scaled photo internally within Image bounds (not via parent flex), so when Image height was 100% in 13C's attempt the parent flex-start had nothing to anchor and the photo floated centered in the bigger box. Previous Session 13C attempts (170×310 then 170×380 at top:80, both with `hangerImage` at width:'100%'/height:'100%') failed for exactly this reason. Mid-session number experiment (top:82 + height:355 + DRESS_SHOES_TOP:445) shipped, iPhone-tested, reverted on Grace's call — first version (top:88 + height:320 + DRESS_SHOES_TOP:418) won and was locked. Resolves the Hanger View dress layout Known Issue surfaced in 13C. May 19 2026 — Session 13C wired (Hanger View polish + Your Looks photo strip redesign). Five LOW-risk App.js fixes shipped + one attempted + reverted, each iPhone-tested. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys. (Step 1 — Mood Board polaroids investigated) `MoodPolaroid` + `MoodAccCell` `<Image>` resizeMode="contain" added then reverted on Grace's call after iPhone test — `cover` reads better visually inside the polaroid frames (no change kept on Mood Board). (Step 2 — Your Looks outfit card photo strip redesigned) `photoStripItem.width: '47%' → '30%'` (2-col → 3-col); `photoStripThumb.height: 80` replaced with `aspectRatio: 3 / 4` (landscape → portrait — box now matches typical garment photo aspect so default `cover` becomes near-zero-crop). Per-thumbnail item name labels removed from both the mapped iteration ([App.js:3297](App.js:3297)) and the sample-item fallback ([App.js:3304](App.js:3304)) — narrower thumbs caused heavy truncation; names still available via Mood Board polaroids + Sonnet's italic description below the card. `looksStyles.photoStripName` style entry left in place (unused but cheap, Session 10A precedent). Now matches the no-labels treatment Saved Outfits modal already uses. (Step 3 — Saved Outfits photo strip) `<Image>` at [App.js:3983](App.js:3983) got `resizeMode='contain'` — KEPT. Square `aspectRatio: 1` thumbs use cream `#F5F0E8` letterbox. (Step 4 — Hanger View shoes bigger) `hangerSlotShoes`: `top: 438 → 455` (12px clean gap below pants ending at 443), `marginLeft: -52.5 → -62.5` (re-centers for new width), `width: 105 → 125`, `height: 72 → 95`. Stage bottom clearance 30px. (Step 5 — Hanger View outerwear card bigger + repositioned) `hangerLightOuterCard`: `top: 116 → 90 → 120` (two-step — first move to top:90 sat at hanger SVG level per Grace's iPhone feedback, then dropped to top:120 so the card visibly hangs below the hanger like a real jacket on its own hanger), `width: 76 → 110`, `height: 96 → 130`. Card y span 120 → 250; ~14px shoulder kiss with the centered top slot. (Step 6 — Hanger View dress layout ATTEMPTED + REVERTED) Added `hangerSlotDress` (170×380 at top:80), `hangerSlotShoesDress` (125×95 at top:470), and dress-aware JSX branch (`dress ? hangerSlotDress : top ? hangerSlotTop : null`; shoes conditionally pick `hangerSlotShoesDress` vs `hangerSlotShoes`). iPhone test showed dress filling the body but with awkward side-card overlap (~29px of dress left edge covered by the new bigger outerwear card). Grace called the full revert before adjusting Step 7 (Fix 6 side-card narrowing). Dress outfits still use `hangerSlotTop` (140×158 at y:96) with the awkward empty gap below — known issue, unchanged from pre-Session-14 state. Two future-session items flagged: (a) full Hanger View dress layout redesign — Fix 2 + Fix 5 headless outfit fallback + Fix 6 side-card sizing in one coherent design pass; (b) Edge Function bug — Sonnet sometimes generates broken outfits with two bottoms and no top (e.g. midi skirt + pants + earrings + sneakers). May 18 2026 — Session 13B wired (loading messages + sticky pill + consent copy). Three LOW-risk tasks shipped, each iPhone-verified before the next. App.js only — Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys. (Task 1A — Loading messages) `LOADING_MESSAGES` array at [App.js:2835](App.js:2835) grew from 3 → 5 entries; new entries `'Finding your best looks ✦'` and `'Almost there ✦'` inserted between `'Mixing and matching ✦'` and `'Clozie is working her magic ✦'`. setInterval at [App.js:3146-3148](App.js:3146) unchanged at 1500ms with modulo loop — 5 × 1.5s = 7.5s before any repeat (comfortably longer than typical 3-5s Sonnet call). (Task 1B SKIPPED — font size stays at 13) Original session brief proposed bumping `looksStyles.loadingSubtext.fontSize` from 13 → 17, but reality check found `loadingTitle` at fontSize 20 ([App.js:9091-9095](App.js:9091)); bumping subtitle to 17 would have crowded the hierarchy. Grace skipped after seeing actual values — font size stays at 13, font family Outfit_400Regular and terracotta color `#A44A34` also stay. (Task 2 — Sticky vibe bar → centered floating pill) Three changes shipped: (1) JSX at [App.js:1966-1977](App.js:1966) — existing `<TouchableOpacity>` now wrapped in `<View style={wardrobeStyles.stickyVibeBarWrapper} pointerEvents="box-none">`; pill text "Set Today's Vibe →" unchanged (NO sparkle change per Grace's directive), gate `itemCount > 0 && !showAddPanel` unchanged, handler `onGoToVibe` unchanged. (2) NEW style block `stickyVibeBarWrapper` at [App.js:7977](App.js:7977) — `position: 'absolute', bottom: Platform.OS === 'ios' ? 86 : 70, left: 0, right: 0, alignItems: 'center', zIndex: 5`. Full-width invisible positioned layer with cross-axis centering. (3) `stickyVibeBar` style block at [App.js:7989](App.js:7989) rewritten to drop position/bottom/left/right/zIndex (now on wrapper) and adopt the empty-state pill design language exactly: `height: 44, paddingHorizontal: 28, borderRadius: 22, borderWidth: 2, borderColor: '#FFFFFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 6, elevation: 2` — values byte-identical to `wardrobeStyles.emptyStateButton` at [App.js:7917-7928](App.js:7917). Critical layout decision: wrapper pattern with `pointerEvents="box-none"` chosen over `alignSelf: 'center'` on absolute child after Grace pushed back on cross-device App Store safety. Wrapper guarantees centering via the textbook RN pattern (full-width positioned parent + `alignItems: 'center'` centers any child on cross-axis); `alignSelf: 'center'` on absolute children relies on a Yoga implementation detail with documented edge cases. `pointerEvents="box-none"` on the wrapper is critical — without it the full-width invisible wrapper would absorb taps that should pass through to closet cards in the bottom strip; with it, only the pill itself absorbs taps. Text style `stickyVibeBarText` (Outfit_500Medium 15 white) untouched. (Task 3 — Consent modal copy update) Two text-string changes inside `ConsentModal` at [App.js:6242-6281](App.js:6242), zero logic changes. (1) Body at [App.js:6256-6262](App.js:6256): prose changed from "Clozie creates outfits using technology provided by Anthropic. To generate outfit suggestions, your wardrobe photos and style preferences are sent to Anthropic for processing. For details on how Anthropic handles data, see their privacy policy at anthropic.com/privacy." to "Clozie uses Anthropic to create outfit suggestions from your wardrobe details and style preferences. Learn more about how Anthropic handles data at anthropic.com/privacy." Inner `<Text style={consentStyles.link} onPress={openPrivacyLink}>anthropic.com/privacy</Text>` byte-identical — same terracotta link style, same `Linking.openURL('https://www.anthropic.com/privacy')` handler, same literal URL text. Trailing period and `{' '}` spacing preserved. (2) Accept button text at [App.js:6268](App.js:6268): "Accept — I'm ready to style ✦" → "Accept". Title "Before Clozie styles you" untouched. Decline button "Not now" untouched. `consentStyles` stylesheet untouched. All consent LOGIC untouched: gate in `handleGenerate`, mount useEffect reading `user_metadata.ai_consent_given`, `handleAcceptConsent` (optimistic flip + `updateUser` save + resumed `handleGenerate` with `skipConsentCheck: true`), `handleDeclineConsent`, all four state hooks (`pendingPayload`, `consentGiven`, `consentLoaded`, `showConsentModal`). Persistence verified intact across sign-out / sign-in. Per Grace's explicit directive: ✦ on Accept button removed; all other sparkles in the app (loading messages — note all 5 entries still end in `✦`; Generate button; everywhere else) untouched. May 18 2026 — Session 13A wired (quick UI fixes). Five LOW-risk fixes shipped, each iPhone-verified before the next. App.js only — Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys. (Fix 2 — Share Card watermark) [App.js:2734](App.js:2734) text changed from "Styled by Clozie ✦ Find us in the App Store" to just "Styled by Clozie" — sparkle was a separator between the old two-part text, not decoration. (Fix 3A — Keyboard.dismiss at 4 close sites) `Keyboard` added to react-native imports; `Keyboard.dismiss()` inserted as the first call in X button onPress at App.js:1712, Cancel button onPress at App.js:1879, handleAddItem save-success at App.js:1149-1150, handleSaveEdit save-success at App.js:1230-1231. Resolves the KAV layout race that was hiding the sticky vibe bar when keyboard was up at X tap. (Fix 3B — X swapped to LEFT of heading) addPanelHeader JSX order reversed at App.js:1708-1718 (X first, heading second) so `justifyContent: 'space-between'` places X on the left edge; inline `alignItems: 'flex-end'` → `'flex-start'` so the ✕ glyph hugs the left of its 44×44 wrapper. Puts ~280px of horizontal separation between X and the floating gear icon at App.js:6529 + 9321 (`position: absolute, top: 56, right: 16, zIndex: 10` — sits above all tab content). Eliminates accidental gear taps when closing the panel. (Fix 4 — empty search results) Two surfaces. My Closet (App.js:1566-1572) gets a new centered 2-line plain text block ("No items match your search" Outfit 15 #5C4A3A + "Try a different name or category" Outfit 13 #A09888 marginTop 4) gated `searchVisible && itemCount > 0 && filteredItems.length === 0`. Three new `wardrobeStyles` entries (`searchEmptyState`, `searchEmptyTitle`, `searchEmptySubtext`) at App.js:7807-7824. Saved Outfits (App.js:3935-3941) gets one additional Text line "Try a different name or occasion" (Outfit 13 #A09888) below the existing "No outfits found"; wrapped in Fragment; existing `savedStyles.emptySearchResults.marginBottom` reduced 20 → 4 so the lines visually pair; new `emptySearchSubtext` style added with marginBottom 20 to preserve the gap before next content. Plain text only — no icons, no sparkles, no decorations. (Fix 1 — Splash logo "e" upper-right curve clipping) Two surgical edits. Outer `<Text style={styles.splashLogo}>` at App.js:103 converted to `<View>` so the inner Text children get independent measurement (RN nested-Text doesn't honor inner padding for the parent's clip boundary — was the root cause of the earlier `paddingRight: 8` having no visible effect). `lineHeight: 92` added to `splashLogoZie` at App.js:6747 for vertical breathing room above the italic upper-curve at fontSize 72. `paddingRight: 8` retained — now actually applied because the View wrapper measures each Text independently. `splashLogo.flexDirection: 'row'` (previously a no-op on Text) now actually does something — keeps the two child Texts inline. Resolves the Session 10B "Add Item / Edit Item X button inconsistent" Known Issue. Adds one new Known Issue (Add Item panel doesn't close on outside-tap, scroll-only — not blocking submission). May 18 2026 — Session 12 wired (Saved Outfits + Search) + occasion chip filter bug fixed. Six LOW-risk substeps (S0 through S6) shipped 2026-05-17, plus two follow-up surgical fixes on 2026-05-18 to close the chip filter bug surfaced during S6 testing. Each step iPhone-tested before the next. New file `src/lib/filterSavedOutfits.js` + App.js changes — Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys. (S0) New pure utility `src/lib/filterSavedOutfits.js` — case-insensitive AND filter (occasion match + (outfit.name OR any item.name OR any item.colour)), defensive null/non-array guards; description / vibe / brief / item.notes deliberately excluded per Session 7b-7 dislikes-filter + 7C smart-fallback decisions. (S1a) `savedOutfits` lifted from YourLooksTab to MainAppScreen as `SavedOutfit[]` (full objects, not ID strings) — derived `savedIds` Set for O(1) `.has()` checks across 5 read sites; new `savedOutfits` + `setSavedOutfits` props passed to YourLooksTab; toggleSave operates on object array with newest-first ordering matching `fetchSavedOutfits`'s `saved_at DESC` order; saved screen `.map()` source swapped `outfits.filter(o => savedOutfits.includes(o.id)).map(...)` → `savedOutfits.map(...)`; latent pre-existing bug fixed — confirmRemove handler now calls `onPersistInteraction(outfitToRemove, { saved: false })` BEFORE setState filter so the closure captures the full object; DEMO_MODE `['demo-2']` seed dropped (DEMO_MODE hardcoded false in production); after S1a saved outfits survive tab switching within a session (improvement over pre-S1a where `{activeTab === 3 && <YourLooksTab />}` conditional render at App.js:6280 unmounted the local savedOutfits on every tab leave). (S1b) DB load on mount + hydration against `wardrobeItems`. New `wardrobeItemsRef = useRef([])` + sync useEffect so the savedOutfits load useEffect can read current wardrobeItems without including it in deps. New DB load useEffect calls `fetchSavedOutfits()` on mount, hydrates each row's `itemIds` against `wardrobeItemsRef.current` to attach `items: WardrobeItem[]`, merge-by-id (DB wins, local-only entries from optimistic toggleSave during load window preserved). New re-hydration useEffect watches [wardrobeItems] and rebuilds `items` array from `itemIds` for every saved outfit when wardrobe changes — deleted wardrobe items silently drop from outfit's items, edited photos surface fresh photoUri. SIGNED_OUT listener extended to also `setSavedOutfits([])`. toggleSave stamps `itemIds: outfit.items.map(i => i.id)` on optimistic adds so re-hydration can resolve items if wardrobeItems changes after save. After S1b saved outfits survive app reload — headline win. Three race conditions handled: load order wardrobe-first, load order saved-first, save during load window. Acknowledged edge case (rare ~500ms window): unsave during initial DB load can be undone by load completing — not fixed, similar to wardrobe loading race already in Known Issues. (S2) Three useState hooks in YourLooksTab (`searchVisible` / `searchText` / `selectedOccasion='All'`) + new module-scope `OCCASION_CHIPS` constant — 8 entries `['All', 'Casual Day', 'Work · Office', 'Going Out', 'Formal Event', 'Outdoor · Sport', 'Weekend Errands', 'Travel']` with byte-verified UTF-8 middot (c2 b7) matching the canonical strings the Edge Function writes. Dead state until S3-S6. (S3) Magnifying glass + "Search" button added to Saved Outfits modal — new `savedStyles.headingRow` flex-row pairs the "Saved Outfits" DM Serif heading with the button on the right; `marginBottom: 8` migrated from `heading` style to `headingRow` style to preserve identical spacing below the row (no layout shift). Button gated on `savedOutfits.length > 0` (empty state has nothing to search). Reuses `wardrobeStyles.searchButton*` cross-tab — same espresso-tint pill, sage active state, identical SVG (16×16 Circle r=7 + Line handle), identical hitSlop, identical onPress pattern. Session 11 precedent on cross-tab style reuse. (S4) 40px white search bar revealed when `searchVisible=true`. New JSX inserted between headingRow and empty state. Reuses `wardrobeStyles.searchBarRow` + `wardrobeStyles.searchBarInput` cross-tab. Placeholder "Search your outfits..." at `rgba(44,26,14,0.65)` matching Session 8 design system. X button clears all three pieces of state. KeyboardAvoidingView added around the modal's ScrollView (Saved Outfits modal was not touched in Session 8 because it had no TextInputs then) — `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`, `keyboardShouldPersistTaps='handled'` on the ScrollView so X close and S5 chips tap through open keyboard. (S5) 8 occasion chips horizontal scroll, gated `searchVisible`. Reuses `wardrobeStyles.chipsScroll` / `chipsScrollContent` / `categoryChip*` styles cross-tab — zero new style entries. Layout context is a vertical outer ScrollView (same as My Closet's chip row) — no Session 11 chip-stretch bug expected here (that was specific to bottom sheet's column-flex KAV directly wrapping chips). Tap toggles `selectedOccasion`; nothing filters yet (S6 wires that). (S6) Filter wired end-to-end. New `filterSavedOutfits` import; derived `filteredSavedOutfits = searchVisible ? filterSavedOutfits(savedOutfits, searchText, selectedOccasion) : savedOutfits` computed inside YourLooksTab before the loading early return. `showResultCount = searchVisible && (searchText.trim() !== '' || selectedOccasion !== 'All')`. Result count line — "Showing N results for [query]" when text non-empty, "Showing N outfits for [occasion]" when only occasion ≠ 'All' (proper singular/plural pluralization, slight improvement over My Closet's "N results" hardcoded pattern). `showFilteredEmpty = showResultCount && filteredSavedOutfits.length === 0` → "No outfits found" centered text. New `savedStyles.emptySearchResults` style entry (Outfit_400Regular 14 `#A09888` centered, paddingTop 40, marginBottom 20). Saved outfits list condition tightened to `{savedOutfits.length > 0 && !showFilteredEmpty && (...)}`; map source swapped `savedOutfits.map(...)` → `filteredSavedOutfits.map(...)`. "N saved looks" + "Tap an outfit to see the mood board" hidden when search filter is active (result count already communicates the relevant number). Result count line reuses `wardrobeStyles.searchResultsCount` cross-tab. Header "❤️ Saved (N)" pill in main Your Looks tab stays as TOTAL count, not filtered. (Bug surfaced mid-S6 testing — FIXED 2026-05-18) Occasion chip filter returned 0 results for non-"Casual Day" chips in-session but worked after app reload. Root cause: `toggleSave` at App.js:2989 spread the generated outfit object (no `occasion` field) and stamped only `itemIds`, so local entries had `outfit.occasion === undefined` and the chip filter `outfit.occasion !== occ` dropped them. After reload, `fetchSavedOutfits` correctly populates `occasion` via `rowToSavedOutfit` — explaining the session-vs-reload behaviour. Two fixes applied 2026-05-18. Fix 1 (chip bug): new `generationContext` prop on YourLooksTab pulls `lastPayload` from MainAppScreen; `toggleSave` now stamps the full shape `fetchSavedOutfits` returns — `occasion`, `temperature`, `condition`, `indoors`, `brief`, `pinnedItemId`, `rating: null`, `wornDates: []`, `savedAt: nowIso`, `createdAt: nowIso` — onto the optimistic entry. Fix 2 (preventive context preservation in `src/lib/outfitHistory.js`): `buildSnapshot` accepts `isInsert`, gates context fields; `upsertOutfitInteraction` does one `.maybeSingle()` read at top (folds in the worn-date dedupe read) and passes `isInsert` to both call sites. On INSERT context fields written; on UPDATE omitted so Supabase preserves existing DB values — stops future context-less writes (unsave/rate/wear with `lastPayload === null` after fresh reload) from clobbering `occasion` to NULL. Cost: 1 extra DB read per save/rate, trivial at scale. SQL hex-dump diagnostic in SESSION_13_BRIEF.md never needed — Grace's session-vs-reload observation made the bug deterministic from code reading. The "Work · Office" row that confused the original investigation was a same-session save written before Grace switched chips — the chip bug was always in the optimistic-add path, not the DB layer. Pre-existing rows with `occasion=NULL` from prior clobbering stay NULL — regenerate-and-resave to repopulate via INSERT path. Resolved: deferred Step 5 from Session 9C (saved outfits cross-session persistence) — closed by S1a + S1b together. Session 12 is now fully complete. App.js net diff approximately +200 lines across 6 substeps + ~20 lines for the two follow-up fixes. New file `src/lib/filterSavedOutfits.js`. `src/lib/outfitHistory.js` modified 2026-05-18 for Fix 2. May 17 2026 — Session 11 wired (Pin Selector redesign — PART B of Clozie_Session15_MyCloset_PinSelector_Spec.docx). Three LOW-risk substeps + one mid-session chip-stretch fix, each iPhone-tested before the next. App.js only — Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys. (Step B1) Must Include card on Today's Vibe redesigned text-only: heading + two stacked subtext lines (line 1 `#5C4A3A` Outfit_400Regular 13, line 2 `#A09888` italic 12) + magnifying-glass + "Search" button (visual match to My Closet's inactive search button — espresso-tint bg `rgba(44,26,14,0.06)`, border `rgba(44,26,14,0.08)`, borderRadius 10, padding 8/14). Conditional pinned pill: `rgba(200,122,82,0.08)` bg with 1.5px `rgba(200,122,82,0.18)` border, borderRadius 100; ✦ sparkle (chosen over star icon per Grace, matches app's existing brand glyph) + item name in `#C87A52` + 20px X-circle (`rgba(200,122,82,0.15)` bg, hitSlop 14 → 44px tap target, sets pinnedItemId to null). When no item pinned: muted italic hint "No item pinned — Clozie picks freely". Pinned pill text uses `Outfit_500Medium` (spec asked 600 but Outfit_600SemiBold not loaded — Session 10A precedent, deviation accepted). Old horizontal 👗-emoji thumbnail ScrollView at App.js:2129-2158 wrapped in JSX comment, not deleted; dead `wardrobeItems.length === 0` ternary (unreachable since the Session 8 empty-state early-return at App.js:2008 catches that case) dropped with the comment. New `pinnedItem` derived const (App.js:1973): `pinnedItemId ? wardrobeItems.find((i) => i.id === pinnedItemId) : null` — local-only, not lifted. (Step B2) Bottom sheet (`Modal transparent visible animationType="slide"` + `Pressable` backdrop) covering 85% of screen (deviation from spec's 80% — needed room for handle bar + header + subtext + search bar + chips + hint + 2 rows of grid above fold, flagged + accepted). Backdrop: `rgba(44,26,14,0.35)` espresso tint. Sheet: white bg, top corners borderRadius 20, overflow hidden, KAV inside for keyboard handling. Stack top→bottom: 36×4 handle bar (`rgba(44,26,14,0.15)`) → header row with "Pin an Item" DM Serif 20 + 32px circle X-close (hitSlop 8 → 48px) → subtext "Tap any item — Clozie builds every outfit around it." → 40px white search bar with magnifying glass + TextInput + conditional X to clear → 7 category chips horizontal ScrollView (REUSING `wardrobeStyles.categoryChip` / `categoryChipActive` / text variants cross-tab — deliberate, ensures visual parity with My Closet) → muted italic "Tap to pin" hint → vertical ScrollView flex:1 of 2-column 47%-width grid cards. Card structure mirrors My Closet: 150px photo zone (real photo via `Image source={{ uri: item.photoUri }} resizeMode="contain"` else 40px sage `TabHangerIcon` placeholder + "No photo" caption — same `viewBox="-2 -2 28 28"` pattern from Session 10A) + sage category pill + DM Serif item name + Outfit colour. NO pencil-edit, NO X-delete on these cards (different context — pin-selection, not edit). When `pinnedItemId === item.id`: card wrapped with 2.5px `#C87A52` border + 24px sage `#BCC7B7` check circle absolute top-right (1.5px white inner ring matching Session 10A floating + button idiom, white `✓` glyph centered, zIndex 1). New `sheetVisible`/`sheetSearchText`/`sheetSelectedCategory` useState in TodaysVibeTab + useEffect resets text + selectedCategory on close so reopens start fresh. Filter source: `filterWardrobeItems(wardrobeItems, sheetSearchText, sheetSelectedCategory)` — same shared utility used by My Closet (Session 10B). Empty result: "No items match" muted center text. New `pinSheetStyles = StyleSheet.create({...})` block (24 entries, locked palette colors only) added before the "Your Looks Tab styles" divider — module-scope pattern matching wardrobeStyles/vibeStyles/looksStyles. `Pressable` added to react-native imports (only new import). (Mid-session chip-stretch fix) After B2 verified, user reported category chips stretching vertically into huge sage rectangles. Root cause: horizontal ScrollView's content-container flex row defaults to `alignItems: 'stretch'` on its cross-axis (vertical) — chips were filling whatever vertical headroom the sheet's column-flex KAV gave the chip wrapper. My Closet doesn't hit this because its chip ScrollView lives inside a vertical outer ScrollView where each child sizes to content height (different layout context). Two surgical fixes inside `pinSheetStyles` only — `wardrobeStyles.categoryChip` NOT touched (My Closet byte-identical): `chipScroll` gained `flexGrow: 0` + explicit `height: 56`; `chipScrollContent` gained `alignItems: 'center'`. Chips now compact pills (~32px content + breathing room within 56px wrapper), horizontal scroll preserved. (Step B3) Grid card `onPress` rewired (one-handler change replacing the B2 console.log placeholder): if `pinnedItemId === item.id` → unpin (sheet stays open, terracotta border + check circle disappear in real time, pill on Today's Vibe disappears) else → set pinnedItemId + auto-dismiss sheet (handles both unpinned-tap AND switch-while-pinned cases — confirmed behavior). All other dismiss paths (header X, backdrop tap) already wired in B2; X on Today's Vibe pill already wired in B1. End-to-end verified on iPhone: pin from sheet → pill renders → switch pin → first item unpins automatically + sheet closes + new pill shows → tap pinned card from sheet → unpins + sheet stays open → generate outfits with pin → all 3 outfits contain the pinned item (Edge Function enforcement, payload already included `pinnedItemId` since the original Today's Vibe build at App.js:2243). pinnedItemId state remains LOCAL to TodaysVibeTab — not lifted to MainAppScreen, not persisted across tab unmount or app reload (explicit scope decision, matches every prior session's pattern). PART A of Session 15 spec was already shipped in Session 10A; PART B is now complete. Resolves one Known Issue ("Must Include pin selector needs a full design rethink"). May 17 2026 — Session 10B wired (My Closet search system + filterWardrobeItems shared utility). Six LOW-risk substeps + one mid-session search fix, each iPhone-tested before the next. App.js + new `src/lib/filterWardrobeItems.js` — Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys. Spec source: Clozie_Session15_MyCloset_PinSelector_Spec.docx PART A sections A4 + A5. (Step 0) New pure utility `src/lib/filterWardrobeItems.js` — case-insensitive name + colour AND category filter, defensive null/non-array guards, pinned for Pin Selector reuse in Session 11. (Step 1) Three `useState` hooks in WardrobeTab: `searchVisible` (false), `searchText` (''), `selectedCategory` ('All'). (Step 2) Magnifying glass + "Search" button added to header row — TouchableOpacity with inline SVG (Circle r=7 + Line handle), Outfit_500Medium 13px text; inactive bg `rgba(44,26,14,0.06)` with border `rgba(44,26,14,0.08)`; active bg `rgba(188,199,183,0.3)` with icon + text color `#6B7E65`; `headerRow` `justifyContent` flex-start → space-between; hitSlop 6/6/4/4 bumps visible 34px to ~46px tap target. (Step 3) 40px white search bar revealed when `searchVisible === true`, between progress bar and grid — magnifying glass left, TextInput middle, X right; placeholder "Search your closet..." at `rgba(44,26,14,0.65)` matching Session 8 design system; X clears `searchText`, resets `selectedCategory` to 'All', hides bar; `paddingVertical: 0` on TextInput prevents iOS implicit padding; KAV already wraps ScrollView from Session 8 so keyboard rises cleanly. (Step 4) 7 category chips in horizontal ScrollView: All · Tops · Bottoms · Dresses · Outerwear · Shoes · Accessories; module-scope `CATEGORY_CHIPS` constant for Session 11 reuse; active chip sage `#BCC7B7` bg + white text + white 1.5px inner border (matches Session 10A floating + button white-ring idiom — deviation from spec's literal "border-color #BCC7B7 + white ring shadow" chosen because shadow-based ring renders inconsistently across iOS/Android, white inner border achieves the same visual effect cross-platform); inactive chip white bg + body text + faint `rgba(44,26,14,0.10)` border; paddingVertical 8 paddingHorizontal 16 borderRadius 100 pill; `keyboardShouldPersistTaps='handled'` so chips tap through open keyboard. (Step 5) `filteredItems` computed inside WardrobeTab: `searchVisible ? filterWardrobeItems(items, searchText, selectedCategory) : items`; grid map source swapped `items.map` → `filteredItems.map`; result count "Showing N results for [query]" rendered when `searchVisible && searchText.trim() !== ''` — 12px Outfit_400Regular color `#A09888` marginBottom 12; header count "X/30 items" and progress bar continue to use `items.length` (TOTAL wardrobe, NOT filtered count); **Interpretation B chosen** (filter only runs when `searchVisible === true` — toggling Search button OFF restores full grid while preserving text/chip state for next reopen) — Interpretation A (filter persists across visibility toggle) rejected because it would create hidden filter state. (Mid-session search fix) After Step 5 verified end-to-end, user reported "black" returning 0 results despite items having colour "Jet Black"; `filterWardrobeItems` updated to OR-match `name + colour` both; UK spelling `colour` matches `wardrobe_items` DB column (rowToItem at `src/lib/wardrobeItems.js:15`); `notes` intentionally excluded (free-form text would over-filter, same decision as Session 7b-7 dislikes filter + Session 7C smart fallback descriptions). (Step 6 read-only investigation) Wardrobe loading delay root cause diagnosed: race between initial MainAppScreen `loadItems` useEffect (App.js:5858-5893) and `handleAddItem` optimistic prepend (App.js:1137). 200-800ms window after mount during which `fetchWardrobeItems` + `Promise.all` signed-URL batch is resolving. If user adds an item during this window, `setWardrobeItems(itemsWithUrls)` at App.js:5875 runs AFTER the optimistic `setItems(prev => [newItem, ...prev])` — and because the call is a hard array replace (not merge), the load's stale DB snapshot wipes the optimistic prepend. The added item IS in Supabase (`insertWardrobeItem` returned success) but missing from in-memory state until next app reload. Diagnosis only — no fix this session. Recommended fix: merge by id in `setWardrobeItems` setter inside `loadItems` — preserve any local-only items not present in DB fetch. Deferred to dedicated polish session. May 17 2026 — Session 10A wired (My Closet structural redesign + recovery banner polish). Seven LOW-risk substeps + one mid-session auto-scroll sub-step (1b), each iPhone-tested before the next. App.js only — Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys. Spec source: Clozie_Session15_MyCloset_PinSelector_Spec.docx PART A only (PART B pin selector deferred). (Step 7 first — isolated, lowest risk) YourLooksTab recovery banner restyled from sage-pill `rgba(188,199,183,0.30)` to white card with terracotta `#C87A52` 3px left-border accent stripe, borderRadius 14, subtle shadow (offset 0,1 / opacity 0.06 / radius 4 / elevation 1), padding 12/16, marginBottom 14. Copy + gating + recoveryBannerText untouched. (Step 2) Old "✦ Add Another Item" and "Set Today's Vibe →" buttons in WardrobeTab commented out with `// HIDDEN:` markers — nothing deleted. (Step 1) Floating + button added as absolute-positioned ScrollView sibling inside KeyboardAvoidingView, gated `itemCount > 0 && !showAddPanel`. 56×56 sage `#BCC7B7` circle with 3px white ring, white SVG + (two `<Line>` strokeWidth 2.5 strokeLinecap round). Platform-aware `bottom: 150 iOS / 134 Android` — measured tab bar 86/70 + 50 sticky bar + 14 gap. Spec's literal 120 would have overlapped tab bar; deviation flagged + accepted. onPress: setShowAddPanel(true). (Step 1b mid-session UX fix) Pre-existing inline Add Item panel had no slide-up animation; floating + exposed it by decoupling tap location from render position. Fix: `scrollRef = useRef(null)` + `hasScrolledForPanelRef = useRef(false)` + useEffect resets flag on panel close + `onLayout` on panel View calls `scrollRef.current.scrollTo({ y: Math.max(0, y - 12), animated: true })` exactly once per open. Re-layouts from typing/photo/scanning suppressed by one-shot flag. (Step 3) Sticky vibe bar — full-width sage `#BCC7B7`, 50px tall, absolute `bottom: 86 iOS / 70 Android` flush above tab bar, top-edge shadow offset 0,-2 / opacity 0.06 / radius 8 / elevation 8, zIndex 5. `Outfit_500Medium` 15 white "Set Today's Vibe →" centered (spec asked weight 600 but Outfit_600SemiBold not loaded — flagged + 500 swap accepted). Same `itemCount > 0 && !showAddPanel` gate (spec said "always visible" but `!showAddPanel` flagged + approved to prevent accidental nav mid-edit). `wardrobeStyles.scrollContent.paddingBottom` bumped 40 → 90 to clear the bar. (Step 4) Empty state — full-screen early return at top of WardrobeTab render, gated `itemCount === 0 && !showAddPanel`. Vertically + horizontally centered via `flex:1, justifyContent:center, alignItems:center, paddingHorizontal:32` (initial spec said `paddingTop:80` — Grace asked for true vertical center after iPhone test, applied). Stack: 80px sage `#BCC7B7` hanger SVG → DM Serif Display 22 espresso `#2C1A0E` heading "Every great wardrobe starts with one piece." → Outfit 14 body `#5C4A3A` subtext "Add your first item and let's see what Clozie can do" (trailing ✦ removed on Grace's call after iPhone test) → sage pill button "+ Add Your First Item" with 2px white border, Outfit_500Medium 15 WHITE text per spec. Tap → setShowAddPanel(true) → falls through to normal render. TabHangerIcon SVG extended with backward-compatible optional `size`/`color`/`strokeWidth`/`viewBox` props (defaults preserve tab bar visuals — tab bar call unchanged). Empty state passes padded `viewBox="-2 -2 28 28"` to prevent hook clip at top edge of default viewBox (hook circle reaches y=0 in path; thin stroke half-extends outside `0 0 24 24`). Old inline `{itemCount === 0 && (👗 + text)}` block commented out. (Step 5) Hanger placeholder — 👗 emoji fallback inside `gridCardPhoto` replaced with `gridCardPlaceholder` View: soft sage tint `rgba(188,199,183,0.18)` (solid not gradient — `expo-linear-gradient` dependency deliberately not added, flagged + approved), centered 40px sage hanger (same padded viewBox), Outfit 10 muted `#A09888` "No photo" caption letter-spacing 0.2. Cards with real photos unchanged. No emoji anywhere in My Closet now. (Step 6) Pencil reposition — old absolute-positioned pencil at `top:6, right:40` over photo commented out. Category tag pill wrapped in new `categoryTagRow` View (flexrow, justifyContent space-between, alignItems center, marginTop 10, paddingHorizontal 10). Pill on left, new pencil `editPencil`/`editPencilText` TouchableOpacity right-aligned: no background circle, Outfit 16 espresso `#5C4A3A` glyph, 44px tap target via hitSlop. X delete icon untouched, still floats top-right over photo. `categoryTag` style slimmed (removed `alignSelf`/`marginTop`/`marginLeft` — row container owns layout). Old `editIcon`/`editIconText` styles left in place (unused but cheap, comment-out pattern). May 16 2026 — Session 9F + 9H + 9J wired (Circuit Breaker + My Closet polish + Loading messages). Three discrete pieces shipped, each iPhone-verified before the next. (9J Loading messages) New `LOADING_MESSAGES` constant + state hook + `setInterval` rotate the subtitle every 1.5s across "Browsing your closet ✦" / "Mixing and matching ✦" / "Clozie is working her magic ✦"; spinner + title unchanged; cleanup clears interval on success/error/unmount; resets to index 0 on each new generation. App.js only, no Edge Function. (9H My Closet) `resizeMode="cover"` → `"contain"` on grid card photos so dresses/coats/shoes show in full without cropping; `gridCardPhoto.height` 120 → 150 for bigger photos in each card; new `formatLastWorn(iso)` helper renders ISO timestamps as "Last worn: May 16" (short month + day, no year) with `'Never worn'` fallback for null/malformed input. Optimistic local update on `handleMarkItemsWorn` deliberately deferred (separate follow-up). App.js only. (9I Outfit card photos) SKIPPED — read-only check confirmed photo strip is sized correctly at 80px in 47% columns with default `cover`; don't fix what isn't broken. (9F Circuit Breaker + Recent Outfit History) Five LOW-risk substeps across App.js + 3 Edge Function CLI deploys: (9F-A client only) YourLooksTab.handleRegenerate evaluates current ratings before resets — any Love/Like → reset `consecutive_negative_sessions` in `user_metadata` to 0; ALL outfits rated Nope → increment counter; incomplete sessions leave counter alone; fire-and-forget write via `supabase.auth.updateUser({ data: {...} })` (verified merge-not-replace behavior preserves other metadata keys). (9F-B Edge Function deploy 1) Counter read from `user.user_metadata.consecutive_negative_sessions` after existing `getUser()`; `recoveryMode = counter >= 2` computed; new field added to all 3 success response shapes (sonnet/fallback/stub); client captures via new `generationRecoveryMode` state hook, reset on each generation, populated from `response.recoveryMode === true`. (9F-C Edge Function deploy 2) `buildFreshContent` extended with `recoveryMode: boolean` arg; when active, prepends `"* RECOVERY: Her recent outfits weren't landing. Try a clearly different direction this time — vary the silhouette, mood, or anchor piece from her usual."` as the SECOND stylingLines bullet (right after identity, before weather). USER MESSAGE only — SYSTEM_PROMPT untouched. (9F-D Edge Function deploy 3) New DB query against `outfit_history` ordered by `created_at DESC LIMIT 6` after the wardrobe fetch; item names resolved server-side against UNFILTERED wardrobe pool so filtered-out items still display; passed to `buildFreshContent` as `recentOutfits: { name, vibe, itemNames }[]`; rendered as a "RECENT OUTFITS — already styled, avoid repeating these combinations:" block between DRESS RULE and WARDROBE POOL (preserves WARDROBE POOL's last-position recency bias on items); block omitted entirely when history empty (new users, no interactions). (9F-E client only) New `recoveryMode` prop on YourLooksTab; renders sage-pill banner above outfit cards when `recoveryMode && hasGenerated && outfits.length > 0`. Banner background `rgba(188,199,183,0.30)` (locked sage-pill color, same as CLOZIE RECOGNISED success bar) — first iPhone test caught that `#E8E4CE` is the tab background so a sage-on-sage banner was invisible; fixed by switching to sage-pill which has clear contrast against cream. Banner text: locked espresso `#2C1A0E`, Outfit Regular 14px, no italic. Spec-quoted copy: "I noticed my last few suggestions didn't land. I'm trying something different today — let me know if I'm getting warmer." Cache stayed at 2,375 across all 3 CLI deploys — verified via `cache_read_input_tokens: 2375` after each deploy. SYSTEM_PROMPT not touched at any point. Three CLI deploys total via `supabase functions deploy generate-outfits --project-ref sbiwuqjnwjgjazxlyfhb --use-api` (no `--yes` flag per Session 7b-6 lesson). May 16 2026 — Session 9D/9E/9G wired (Mood Board real photos + Hanger View fix + Share Card). Three visual fixes in App.js shipped in one session, each iPhone-tested before the next. (9E Hanger View) Five `.image` → `.photoUri` swaps in the Hanger View centre stack, side card, and accessory stack ([App.js:2842-3001](App.js:2842)) — real wardrobe photos now display across top/dress, bottoms, shoes, light outerwear, and up to 5 accessories; `MOOD_PLACEHOLDER_COLORS` fallback retained for items without a photo. (9D Mood Board) Two surgical edits in the polaroid system — `MoodPolaroid` single-item branch ([App.js:2177-2185](App.js:2177)) and `MoodAccCell` item fall-through ([App.js:2113-2117](App.js:2113)) both now render `<Image source={{ uri: item.photoUri }} />` (92%×92% for single, `flex: 1` for accessory grid cells) with the category color block retained as fallback. Polaroid frame, tilt rotations, layout positions A–G, accessory grid math, swatch palette and labels all unchanged. (9G Share Card) New cross-platform native share sheet — `react-native-view-shot@4.0.3` + `expo-sharing@~14.0.8` installed via `npx expo install` (SDK 54 compatible). New `ShareCard` component ([App.js:2245-2286](App.js:2245)) renders offscreen (position absolute top:-10000, pointerEvents none) ViewShot wrapper containing a 360×~480 white card: 2-column photo grid (4:5 aspect, max 4 items), vibe label + outfit name + description, sage `#E8E4CE` watermark bar with "Styled by Clozie ✦ Find us in the App Store" (Outfit 500, 12px, espresso). New `handleShareOutfit(outfit)` handler at [App.js:2504-2536](App.js:2504) — spam-tap guarded on `isSharing`, checks `Sharing.isAvailableAsync()`, sets state, waits 300ms for offscreen mount + image cache settle, `captureRef → PNG → Sharing.shareAsync`. Share Outfit button now has `onPress`, `disabled={isSharing}`, label flips to "Preparing…" during capture. YourLooksTab return wrapped in a Fragment so `<ShareCard>` is a sibling of the ScrollView (not clipped). Caption (CLAUDE.md spec: "Styled by Clozie. Wear it or not?") deliberately NOT pre-filled — `expo-sharing` is file-only on both platforms; the on-image watermark is the durable brand mark instead. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens. Zero CLI deploys. May 16 2026 — Session 9A/9B/9C wired (outfit history persistence — rating + wore today + save/unsave). New `outfit_history` Supabase table (4 RLS policies + GRANTs scoped to authenticated, created via dashboard SQL Editor). New `src/lib/outfitHistory.js` helper exports `upsertOutfitInteraction(outfit, context, patch)` (UPSERT on `(user_id, client_outfit_id)` unique index; handles `{ rating }`, `{ saved }`, `{ appendWornDate }` patches; worn-date append is read-modify-write to silently dedupe same-day re-taps), `fetchSavedOutfits()` (newest-saved-first, written for Session 12 — not yet called), and `markItemsWorn(itemIds)` (bumps `wardrobe_items.times_worn` + `last_worn` per item, best-effort). App.js: two MainAppScreen wrappers (`handlePersistInteraction` curries `lastPayload` away, `handleMarkItemsWorn` fire-and-forget); passed as `onPersistInteraction` + `onMarkItemsWorn` props to YourLooksTab. `handleRate`, `handleWornToday`, `toggleSave` all changed to accept full `outfit` object instead of `outfit.id` so the snapshot can be written. Call sites updated. Local UI behavior identical (toasts, button states, Saved Outfits modal current-session filter all unchanged). Lazy persistence — row inserted only on first interaction. Pre-existing bug surfaced and fixed: original `handleWornToday` only flipped the transient toast flag — never touched any wardrobe item state, so the spec ("saves today's date against every item in this outfit") was essentially unbuilt until Step 3. Verified end-to-end on iPhone: rating UPSERT (re-rating same outfit updates same row, no duplicate); wore-today same-day dedupe (second tap silently no-ops); `wardrobe_items.times_worn` increments correctly across multiple outfits sharing items; save/unsave flips `saved` boolean cleanly with `saved_at` toggling between ISO timestamp and null; rating + save + wear coexist on a single row. Step 5 of original plan (lift savedOutfits to MainAppScreen + load from DB + render Saved Outfits from DB snapshots) DEFERRED to Session 12 (Saved Outfits + Search) where Mood Board polaroid placeholders + Hanger View `item.image` mismatch will also be fixed (Sessions 9D + 9E land later today). Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens. Zero CLI deploys. May 16 2026 — Session 8 wired (AI Consent Modal + Keyboard Fixes + Today's Vibe Polish). Four tasks complete, all in `App.js` only — Edge Function NOT touched, SYSTEM_PROMPT NOT touched, prompt cache stays at 2,375 tokens, no CLI deploys this session. (1) AI Consent Modal (Apple Guideline 5.1.2i) — new `ConsentModal` function component renders modal with title "Before Clozie styles you", body naming Anthropic explicitly, tappable `anthropic.com/privacy` link (opens via `Linking.openURL`), "Accept — I'm ready to style ✦" sage button, "Not now" plain text link. State (`consentGiven`, `consentLoaded`, `showConsentModal`, `pendingPayload`) lives in MainAppScreen, loaded from `user_metadata.ai_consent_given` on mount via existing `supabase.auth.getUser()` pattern. Gate inserted at top of `handleGenerate` before spam-tap guard: if `consentLoaded && !consentGiven`, stash payload + show modal + return. Accept saves `ai_consent_given: true` via `supabase.auth.updateUser({ data: {...} })` (best-effort — local state flips regardless so a transient network blip doesn't block the user), then calls `handleGenerate(stash, { skipConsentCheck: true })` to resume generation. Decline closes modal + clears pendingPayload (no save, no generation). Persistence verified across sign-out / sign-in cycle. Same `auth.user_metadata` pattern used by style profile (Session 7b-0) — no new Supabase table, no Edge Function change. (2) KeyboardAvoidingView fixes — wrapped StyleDNATab ScrollView, TodaysVibeTab ScrollView, SettingsScreen ScrollView, and Delete Account Modal's overlay each with `<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>`. AuthScreen + WardrobeTab already had KAV (verified directly from code, not assumed). My Closet KAV touch skipped per Grace's directive (Session 15 redesign). All KAV wrappers include `keyboardShouldPersistTaps='handled'` on their inner ScrollViews so chip taps work while the keyboard is open. (3) Placeholder contrast fix — Today's Vibe Brief field placeholder `rgba(44,26,14,0.40)` → `0.65`; StyleDNA "I never want to wear" placeholder `rgba(44,26,14,0.35)` → `0.65`. Now matches WardrobeTab Add Item placeholders for consistency across the app. (4) Today's Vibe empty state — when `wardrobeItems.length === 0`, TodaysVibeTab early-returns a centered empty state (message "Add a few pieces to your closet first — Clozie will do the rest." + sage "Go to My Closet →" button — text-only, no title per Grace's choice). New `onGoToCloset` prop on TodaysVibeTab, MainAppScreen passes `() => setActiveTab(1)`. Empty-state styles added to `vibeStyles` matching `looksStyles.emptyButton` pattern. The full weather/occasion/Brief/Generate UI is replaced until at least one item exists — friendlier than letting the user tap Generate and hit the `not_enough_items` gate. Thirteen tiny LOW-risk sub-steps total (Task 1: 5, Task 2: 4, Task 3: 1, Task 4: 3), each tested on iPhone before the next. App.js net diff approximately +205 lines, zero deletions. Zero Edge Function deploys. No changes to `recognize-photo`, `delete-user`, or `generate-outfits` at any point in the session. May 14 2026 — Session 7C wired (JavaScript Smart Fallback). New `buildSmartFallback` function in `generate-outfits` Edge Function fires when Anthropic fails for any reason (timeout / 5xx / 429 / malformed JSON / schema validation / name→UUID mapping failure). Returns 3 outfits with editorial-occasion names from per-occasion pools (Casual Day → "Easy Sunday" / "Weekend Edit" / "Off-Duty Ease" / "Sunday Morning" / "Relaxed & Ready"; Work · Office → "Morning Confidence" / "Desk Ready" / "Clean Lines" / "Office Elevated" / "Power Soft"; Going Out → "Night Mode" / "After Hours" / "Evening Edge" / "Out Tonight" / "Weekend Night"; Formal Event; Outdoor · Sport; Weekend Errands; Travel). Color-aware composition (neutral / earth / navy family pairing with navy+earth clash detection); pinned-item enforcement (forced into every outfit); item-aware descriptions ("[colour first-word] with [colour first-word] — [mood]."). Uses safety-filtered `filteredItems` pool with soft-fail revert to unfiltered `items` if pool went thin. If `buildSmartFallback` itself throws, last-resort to existing `buildStubOutfits` — 3-tier safety net (Sonnet → smart fallback → stub) live in production. New response `source` values: `"sonnet" | "fallback" | "stub"`. Built across 5 verified deploys (constants → function → handler wiring → force-on-test → revert) via Supabase CLI from `index.ts`, each tested on iPhone before next. SYSTEM_PROMPT NOT touched — cache stayed at 2,375 tokens across every deploy. App.js NOT touched at any point this session. Verified force-on test against Casual Day / Formal Event / Going Out — names from pools, real photos, source "fallback", no Anthropic API cost, all safety filters active. After revert: Sonnet editorial names back, cache 2,375, source "sonnet" across Casual Day / Work · Office / Outdoor · Sport. May 14 2026 — Session 7b-7 wired (dislikes hard filter + Regenerate button). Edge Function: new dislikes hard filter inside `applySafetyFilters` after the existing C1–C5 / occasion filters, reading `styleProfile.neverWear` from request body. Tokenization: split on commas + semicolons, lowercase, trim, drop empties, drop stopwords (`anything`, `the`, `a`, `an`, `no`, `hate`, `nothing`, `with`), minimum token length 4 (avoids `tan` matching `tank top`, `red` matching `adidas`). Match on `name + colour` only — `notes` is free-form text and would over-filter. Pinned item exempt (user pinned it deliberately — overrides dislikes). Soft-fail safety net unchanged. One CLI deploy via `supabase functions deploy generate-outfits --project-ref sbiwuqjnwjgjazxlyfhb --use-api` (no `--yes` flag, per 7b-6 lesson). Verified on iPhone: chiffon, cotton, leather, boots all correctly filtered when entered in My Style; pin override works; cache safe at 2,375 tokens across all calls. App.js: Regenerate button (🔄) and Save Feedback & Style Again → both fire real Edge Function via new `lastPayload` state in MainAppScreen + new `onRegenerate` prop on YourLooksTab. Fake 2-second `setTimeout` + manual `setLoading` / `setHasGenerated` / `spinAnim` from old local handler deleted — redundant since lifted useEffect at App.js:2373-2392 drives those from `generationStatus`. Local UI resets preserved (ratings, feedback, wornToday, boutique panels) before firing `onRegenerate()`. Both buttons share the local handler; Session 9 will split when ratings → Supabase wiring lands. Tested on iPhone across 4 scenarios — fresh editorial names, resets clear, spam-tap guard intact. SYSTEM_PROMPT NOT touched. Known curiosity: `[generate-outfits] dislikes filter dropped N items` log line does not appear in Supabase Logs even when filter is firing (iPhone behavior confirms drops happen) — visibility issue only, separate polish session. Three Session 9 candidates surfaced from read-only code check at session start: (1) Mood Board polaroids render solid-color tiles via `MOOD_PLACEHOLDER_COLORS` instead of real photos via `<Image source={{ uri: item.photoUri }} />` — already in Known Issues; (2) Hanger View reads `top.image` instead of `top.photoUri` at App.js:2894-2897 so real wardrobe items always fall through to placeholder — new Known Issue; (3) Share Outfit button at App.js:2607-2613 has NO `onPress` prop — tap does literally nothing, new Known Issue. All three deferred to Session 9. May 13 2026 — Session 7b-6 cleanup wired (skirt filter + weather hint + outerwear tags + Padding Section 7 + diagnostic log cleanup confirmation). Five Edge Function deploys via CLI on `generate-outfits`, each verified on iPhone with cache health intact. Five concrete changes to `index.ts` (App.js NOT touched): (1) new `SKIRT_PATTERN = /skirt/i` constant + filter block in `applySafetyFilters` for `occasion === 'Outdoor · Sport'` — drops items whose name contains `skirt` from the Bottoms category, pinned exempt, soft-fail safety net unchanged; substring (not word-boundary) regex chosen to catch `miniskirt` single-word edge case (real-world false-positive risk in clothing-pool context is effectively zero). (2) new `buildWeatherHint(temperature, condition)` helper between `buildCompressedPool` and `buildFreshContent` — emits a per-call STYLING NOTES bullet echoing the cached system prompt's COMPOSITION RULES line 7 (Cold → "prefer Heavy/Medium warmth"; Hot → "prefer Light/None warmth, avoid heavy wool"; Rainy → "avoid delicate fabrics, prefer closed-toe shoes"; Snowy → "prefer closed-toe boots"), returns null for Cool/Warm + Sunny/Cloudy where no specific rule applies, wired into stylingLines right after the identity line; ~15-30 user-message tokens per call, zero system-prompt impact. (3) `buildCompressedPool` warmth-tag block rewritten — column wins when populated AND not 'None'; otherwise falls back to HEAVY_OUTERWEAR regex first (bias toward safer "heavy-mistagged-as-light is the more dangerous failure mode") then LIGHT_OUTERWEAR; no tag for unrecognized outerwear (avoids lying to Sonnet about unknown warmth). Existing regex constants reused unchanged. Outerwear-only — other categories untouched. Pre-existing column-wins behavior preserved for the day warmth UI ships. (4) Padding Section 7 "FINISHING TOUCHES" appended to SYSTEM_PROMPT — codifies accessory rules by occasion (Outdoor · Sport zero accessories, Casual / Weekend / Travel understated, Work / Office polished and intentional, Going Out / Date Night one statement piece — bold earrings OR a necklace, never both at once — Formal one focal point), explicit "Never include bags in outfit selections. Even if bags exist in the wardrobe pool, skip them. She chooses her own bag." directive, one-focal-point-per-outfit constraint, "at least one of three outfits should include accessories when they exist in the wardrobe. Never force accessories into all three" balance rule. Section 7 body: 962 bytes / ~243 tokens added per Anthropic's tokenizer. New SYSTEM_PROMPT total: ~2,375 tokens (verified via Call 2 `cache_read_input_tokens` = 2,375), 327 tokens / ~16% margin above the 2,048 caching threshold — best margin to date. Cache reset cleanly: Call 1 `cache_creation_input_tokens` ~2,375, Call 2 `cache_read_input_tokens` ~2,375 (exact round-trip). One-time cache-write cost ~$0.009. (5) Diagnostic log cleanup — local `index.ts` confirmed clean of `[7b6-sentinel-v2]` / `[7b6-literal-check]` / `[diag-5b]` markers via grep at session start; the five CLI deploys this session overwrote any stale runtime markers regardless — no code edit needed. Two discoveries mid-session: (i) FIRST CLI deploy attempt of the session reported `Deployed Functions on project sbiwuqjnwjgjazxlyfhb: generate-outfits` success but logs and dashboard search proved nothing propagated (SKIRT_PATTERN 0/0 in Supabase Code tab, last-deploy timestamp showed 20h old). Root cause never definitively isolated; working hypothesis is the `--yes` flag on the CLAUDE.md-documented command may have caused a silent failure path. Removing `--yes` from subsequent deploys + running them via Bash tool (inherits the project working directory automatically) made all five subsequent deploys propagate cleanly. (ii) Supabase dashboard "Code" tab is a STALE EDITOR VIEW, NOT a live runtime mirror. Even after a successful CLI deploy with `Last deployed` timestamp showing "a minute ago", the Code tab continued showing the OLD code — Cmd+F for newly-added constants returned 0/0 — but iPhone behavior + Supabase Logs confirmed the new code was actually running. Verification must go via iPhone + Logs from here on; never trust the Code tab for deploy verification. App.js NOT touched at any point. Two KNOWN ISSUES resolved: the May 11 paused-state "deploy propagation BLOCKER" (now closed — both clipboard-corruption root cause from May 12 archive AND today's silent-first-deploy-failure are isolated; CLI-from-disk workflow is now battle-tested across five successful deploys in one session) AND the May 12 "Diagnostic logs still in production" item (overwritten by today's deploys). One NEW KNOWN ISSUE added: Supabase dashboard "Code" tab is a stale editor view; never use for deploy verification. May 12 2026 — Session 7b-6 CLI deploy + CLAUDE.md corrections. supabase functions deploy via CLI (--use-api) bypasses dashboard paste and clipboard locale corruption (awk + pbcopy decoded file bytes as MacRoman, mangling em-dashes 0xE2 0x80 0x94 → ‚Äî 7-byte mojibake and middots 0xC2 0xB7 → ¬∑ 5-byte mojibake — silently broke every prior dashboard-paste deploy since 7b-4; chat-paste truncated content for files >40KB). Canonical v5 SYSTEM_PROMPT token count CORRECTED from 2,267 to 2,132 (every prior cache_read measurement at 2,267 was reading mojibake-inflated content — 27 em-dashes × ~5 extra tokens each). Cache still healthy at 2,132 (above 2,048 threshold by 84 tokens / 4% headroom — thinner than the 11% docs previously claimed but real). FANCY_DRESS_PATTERN filter added for Outdoor · Sport (drops chiffon/silk/satin/velvet/lace/organza/tulle/sequin/beaded/gown/evening/cocktail dresses; pinned exempt). New files: `supabase/config.toml` and `supabase/functions/generate-outfits/index.ts` (extracted from README via Python binary I/O — preserves all 84 em-dashes and 13 middots byte-perfectly). Diagnostic logs `[7b6-sentinel-v2]`, `[7b6-literal-check]`, `[diag-5b]` still firing in production — remove via CLI in a future cleanup pass. CLAUDE.md corrections in same session: D-U-N-S RECEIVED status (was "request ~2 weeks before App Store submission"), Anthropic spend cap $100 dev / $50 alert (was $50/$200), @styledbyclozie Instagram handle (was @cloziestyle), "Outfit name in DM Serif Display" font fix (was "Playfair" — conflicted with locked design system), clozieapp.com noted as Resend SMTP delivery domain (was missing). Steps 8 (weather constraint hints in user message) and 9 (Heavy/Light warmth labels in compressed pool + styling signal extraction) both deferred — Step 9 bundled with the deferred warmth UI session since both depend on warmth column being populated. App.js NOT touched. CLAUDE_May12_2026.md backup placed on Desktop. Workflow change: future Edge Function deploys MUST use `supabase functions deploy --use-api` (not dashboard paste). May 10 2026 — JS Safety Filters wired (Session 7b-5) — added five weather/indoor safety filters to the `generate-outfits` Edge Function (C1 Cold, C2 Hot, C3 Rainy, C4 Snowy, C5 Indoor) via a new `applySafetyFilters` function called between gate 6 and the Anthropic call. Pinned item exempt from all filters. Soft-fail safety net reverts to the unfiltered pool if filters break the essentials gate. C1 drops Light/None warmth from Tops/Dresses; C2 drops Heavy warmth from all categories; C3 drops names containing `suede`, `sandal`, `open-toe`, `mule`; C4 drops `suede`/`espadrille`/`sandal`/`open-toe`/`flip-flop`/`stiletto` substrings plus word-boundary regex `/\bheels?\b/` and `/\bpumps?\b/` (avoids `wheel`/`pumpkin` false positives) — snow is the one weather where heels ARE filtered, as safety not taste; C5 drops Heavy Outerwear when "I'll be indoors" toggle is ON. Also added: inert `computeOutfitPotential` stub helper for Session 9, and a category imbalance flag in the user message (fires only when bottoms ≤ 2 AND tops > 8 — tells Sonnet to vary the styling rather than reusing the same combination). Discovery mid-session: `warmth` column is NULL on every wardrobe item — warmth UI was deferred from Sessions 6A and 6B and never built. C1, C2, and C5 are therefore DORMANT today (zero items match `warmth === 'Light'` etc.) but will activate the moment warmth gets populated, with no code change needed. C3 and C4 work today via name-pattern matching. Dynamic outfit count from the original plan (STEP 4) was explicitly KILLED to protect the 2,267-token cached system prompt — three outfits stays as the spec. STEP 3 (pool format), STEP 5 (absent-category flags), STEP 7 (small-wardrobe framing) all SKIPPED — already wired in 7b-3. Six deploys total, each tested on iPhone before the next, `cache_read_input_tokens=2267` confirmed intact after each deploy. App.js was NOT opened or edited at any point in this session — all changes were inside `supabase/functions/generate-outfits/README.md` (the source-of-truth backup) and pasted into the deployed Edge Function via the Supabase dashboard. Warmth UI + SQL heuristic backfill deferred to a dedicated warmth session. May 10 2026 — Prompt caching fixed (Session 7b-4) — Anthropic prompt caching now works on every generate-outfits call. Two surgical Edge Function changes in two separate deploys: (1) removed Session 7b-3's temporary diagnostic `console.log('[generate-outfits] raw AI text:', text)` in callAnthropic; (2) replaced the deployed SYSTEM_PROMPT (~1,720 tokens — below Sonnet 4.6's 2,048-token caching threshold, which is why cache_control was being silently ignored on every call) with the v5 padded prompt designed by the Style Council/Business Council on May 8 2026 — 7,714 chars / 187 lines / 2,267 actual tokens per Anthropic's tokenizer, comfortably above 2,048 by ~219 tokens (11% margin). Both `{{requestedOutfits}}` template placeholders substituted to literal `3` before paste (REQUESTED_OUTFITS is hardcoded to 3 in the Edge Function — no template substitution wired in code). Verified end-to-end on iPhone with raw Supabase log paste from browser (after Grace sanity-checked her hand-typed-from-photo numbers against the raw copy — both matched exactly): Call 1 `cache_creation_input_tokens`=2267, `cache_read_input_tokens`=0, `input_tokens`=274, `output_tokens`=464. Call 2 (within 5 min): `cache_creation_input_tokens`=271, `cache_read_input_tokens`=2267, `input_tokens`=3, `output_tokens`=374. The 2,267-token round-trip on Call 2 is the smoking gun — system prompt is cached and read back at 0.10× cost. input_tokens collapsed 274 → 3 on cached call. Estimated cost impact: ~4–4.5× cheaper input on every cached call within the 5-min TTL window. KNOWN curiosity: Call 2's `cache_creation_input_tokens`=271 alongside the 2,267 cache_read appears to be Anthropic auto-extending the cache into portions of the user message even though our code declares only one `cache_control` breakpoint on the system prompt. Cosmetic, not blocking — flagged as a possible future optimisation (add explicit `cache_control` on the user message content block too). App.js was NOT opened or edited at any point in this session — all changes were inside `supabase/functions/generate-outfits/README.md` (the source-of-truth backup) and pasted into the deployed Supabase Edge Function via the dashboard. May 10 2026 — Real Anthropic call live (Session 7b-3) — generate-outfits Edge Function now fires real Sonnet 4.6 with editorial outfit names on iPhone (verified "Cream & Cool" and "Boho Off-Duty" rendering with real descriptions and real wardrobe items). Three sequential bugs hunted via Supabase logs and a temporary `raw AI text:` debug log: (1) greedy JSON regex `/\{[\s\S]*\}/` slurped from first `{` to LAST `}` in Sonnet's response, joining the JSON object with trailing prose — replaced with a brace-walk that stops at the first balanced `{...}` block; (2) Sonnet was hitting the `max_tokens: 500` ceiling and being truncated mid-JSON (output_tokens equaled exactly 500) — bumped to 1500; (3) Sonnet returned items in full pool format like "Knit Cotton Sweater | Tops | Camel" instead of just the name — name-to-UUID lookup now splits on `|` and uses only the first segment as the lookup key. All three fixes are surgical edits inside `supabase/functions/generate-outfits/README.md` (and the deployed Supabase Edge Function). One temporary debug log added (`console.log('[generate-outfits] raw AI text:', text)`) — leave in place for now, remove in a polish pass before App Store submission. KNOWN: Anthropic prompt caching reports `cache_creation_input_tokens: 0` AND `cache_read_input_tokens: 0` on every call — caching is not working, costing ~10× expected on every generate. Separate session. May 9 2026 — Client wiring Session 7b-2 complete (`src/lib/outfitGeneration.js` helper created; Generate button sends full payload to Edge Function; `hasTriggeredGenerate` replaced with proper state — idle/loading/success/error; Edge Function item IDs resolved to full WardrobeItem objects on client; 3 gate errors mapped to warm Clozie messages; outfit card photo strip + saved outfits photo strip now render real wardrobe photos via signed URLs; stub outfits display end-to-end on iPhone using user's real closet items). May 9 2026 — generate-outfits Edge Function Session 7b-1 wired (skeleton + stub response — no Anthropic call yet; auth-gated, JWT verify ON; accepts temperature/condition/occasion/indoors/pinnedItemId/brief/styleProfile; three gates — minimum 5 styleable items + (Tops AND Bottoms) OR Dresses + valid pin; returns 3 stub outfits with real wardrobe item UUIDs and source: "stub"; tested via curl; client wiring deferred to Session 7b-2). May 9 2026 — My Style Persistence Session 7b-0 wired (style profile — selected styles, colour palettes, and never-wear text — now persists in Supabase via auth.user_metadata; loads on My Style tab mount; saves when user taps Build My Closet; Skip does not save; gentle terracotta inline error if save fails). May 8 2026 — Outfit Edge Function Session 7a wired (photo recognition migrated to Supabase Edge Function `recognize-photo`; Anthropic API key removed from client `.env` and `app.config.js`; key now lives ONLY in Supabase Edge Function secrets as ANTHROPIC_API_KEY; auth-gated; closes the API-key-in-client vulnerability described in Legal Tracker §14.10). May 8 2026 — Photo Recognition Session 6B wired (camera + gallery photos auto-recognized via Claude Sonnet 4.6, fields auto-fill while preserving user-typed content, terracotta CLOZIE RECOGNISED eyebrow inside the sage success bar, terracotta auto-fill border on Clozie-filled fields that clears on user edit, retake refreshes scan via React functional setters). May 7 2026 — Supabase Wardrobe Session 6A wired (wardrobe_items table + private wardrobe-photos Storage bucket + RLS policies; full Add/Edit/Delete CRUD persists to Supabase; photos upload via arrayBuffer; signed URLs for display; cross-user isolation verified). May 6 2026 — Photo Upload Session 5 wired (camera + gallery in Add Item panel via expo-image-picker; EXIF orientation fix via expo-image-manipulator; photos save with closet items in local state; edit flow preserves photos). May 5 2026: VIP investigation complete (no code changes; VIP work deferred to Session 9). May 4 2026: Supabase auth Session 2 wired (Settings Sign Out, Forgot Password, Update Password, Clear Memory stub, Delete Account). May 3 2026: Sections 1-3 cleanup + Supabase auth Session 1.
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

- Wardrobe items loading delay — on first login, My Closet sometimes appears empty until the user navigates or interacts with the app, then items reappear. Timing/loading issue, not data loss. Items are persisted correctly in Supabase. Address in a future polish session. Session 10B Step 6 (2026-05-17) read-only investigation diagnosed a related symptom — "sometimes 1-2 items don't appear after upload" — as a race between initial MainAppScreen `loadItems` useEffect (App.js:5858-5893) and `handleAddItem` optimistic prepend (App.js:1137). If the user adds an item during the 200-800ms load window, the load's `setWardrobeItems(itemsWithUrls)` at App.js:5875 (hard replace, not merge) arrives AFTER the optimistic `setItems(prev => [newItem, ...prev])` and wipes the prepend. The item IS in Supabase but missing from in-memory state until next reload. Recommended fix: merge-by-id in the loadItems setter, preserving any local-only items not present in the DB fetch. Both symptoms (empty-flicker on first login + intermittent missing items after upload) are likely facets of the same load-timing architecture and should be addressed in a single dedicated session.
- Call 2 cache write curiosity in `generate-outfits` Edge Function — every cached call shows a small `cache_creation_input_tokens` (~270 tokens) alongside the expected ~2,267 `cache_read_input_tokens`. Our code declares only ONE `cache_control` breakpoint (on the system prompt), so only the system prompt should be cached. The extra ~270-token cache write appears to be Anthropic auto-extending the cache into portions of the user message even without an explicit breakpoint. First observed Session 7b-4 (2026-05-10). Cosmetic — does not block system-prompt caching, just means there's a separate small cache layer for the user message we're not deliberately controlling. Possible future optimisation: add explicit `cache_control: { type: 'ephemeral' }` to the user message content block too, to make this behavior deliberate rather than accidental. Not urgent — flagging only because it surfaced during caching verification.
- `warmth` column NULL on every wardrobe item — DB column exists (Session 6A), helper layer (`wardrobeItems.js`) supports read/write, but no UI was ever built in Add/Edit Item to set it (deferred from Sessions 6A and 6B). Photo recognition does not detect warmth either. Consequence: the C1 Cold, C2 Hot, and C5 Indoor safety filters in `generate-outfits` are DORMANT — they never match anything because every item's `warmth` is NULL. C3 Rainy and C4 Snowy still work (name-pattern based). Surfaced 2026-05-10 (Session 7b-5). Fix needs a dedicated warmth session — design decisions required (chip set vs dropdown in Add Item panel, required vs optional, default to Medium vs blank, AI-detection in `recognize-photo` vs user-only, heuristic SQL backfill of existing items vs leave NULL). Not blocking — dormant filters cost nothing at runtime. Activates with zero Edge Function code change the day warmth gets populated.
- Supabase dashboard "Code" tab is a STALE EDITOR VIEW, not a live runtime mirror. After a successful CLI deploy (`supabase functions deploy generate-outfits --project-ref sbiwuqjnwjgjazxlyfhb --use-api`) with `Last deployed` timestamp updating to "a minute ago", the Code tab still shows OLD code — Cmd+F for newly-added constants returns 0/0 even though those constants ARE running at the edge. iPhone behavior + Supabase Logs (Edge Functions → Logs) are the source of truth for deployed Edge Function code. Surfaced 2026-05-13 (Session 7b-6 cleanup). NEVER use the dashboard Code tab for deploy verification.
- Dislikes filter log line not appearing in Supabase Logs — `console.log('[generate-outfits] dislikes filter dropped ${before - filtered.length} items (tokens: ${tokens.join(', ')})')` statement added in Session 7b-7 inside `applySafetyFilters`. iPhone behavior confirms the filter IS dropping items (chiffon, cotton, leather, boots all filter correctly across multiple test calls), but the log line never appears in the Supabase Edge Function Logs tab. Other log lines from the same function (cache usage, success messages, other filter drops) DO appear normally. Possibly a log buffer flush issue or template-string formatting quirk in the Deno runtime. Not blocking — filter works in production; just no visibility into how many items dropped per call. Investigation in a future polish session.
- Dislikes filter false-positive escape — `Leather Chelsea Boots` escapes when user types `leather` as a dislike token. Surfaced 2026-05-14 (Session 7b-7 iPhone test). Working theory: substring match against `name + colour` succeeded structurally but `colour` field on that item probably stores `Black` or similar rather than `Leather Black`, so neither name (`Leather Chelsea Boots` does contain `leather` though — needs deeper investigation) nor colour matched. Investigation deferred to a polish session. Not blocking — minor edge case.
- Optimistic local update for "Last worn" date after `handleMarkItemsWorn` not wired. The `formatLastWorn(iso)` helper (Session 9H, 2026-05-16) now renders the date cleanly as "Last worn: May 16" once items load from the DB — but tapping "I wore this today" on an outfit only updates the DB; the local `wardrobeItems` state stays stale until sign-out/in or fresh launch. Surfaced 2026-05-16 (Session 9H). Fix needs `setWardrobeItems(prev => prev.map(...))` injection in `handleMarkItemsWorn` to bump `lastWorn` + `times_worn` on matching items optimistically. Not blocking — DB is correct, only UI refresh delayed. Polish session.
- Saved outfits do not survive app reload (Session 9C Step 5 deferred to Session 12). The `outfit_history` table correctly records every save with `saved=true` + `saved_at`, but the Saved Outfits modal at App.js:3057-3058 still filters the current-session `outfits` array by ID. After app reload, `generatedOutfits` empties and the saved outfit disappears from UI even though its DB row still has `saved=true`. Explicit Step 5 deferral — Session 12 will lift `savedOutfits` to MainAppScreen + load from DB via `fetchSavedOutfits()` + resolve `item_ids` against the current `wardrobeItems` state. The helper API is already written; only the wiring remains. (Mood Board polaroid placeholders and Hanger View `item.image` mismatch were resolved separately in Session 9D/9E on 2026-05-16.)
- Add Item / Edit Item X button inconsistent — the X close button on the Add Item and Edit Item panels ([App.js:1710](App.js:1710)) does not always close the panel reliably. Sometimes it closes correctly; other times the panel stays open. When it fails to close cleanly, the sticky "Set Today's Vibe →" bar at the bottom of My Closet disappears and only comes back on scroll or the next panel open. The Cancel button at the bottom of the panel ([App.js:1877](App.js:1877)) always works correctly and does not produce the bar-disappearing symptom. Surfaced 2026-05-17 during Session 10B testing. Working hypothesis (Session 10B read-only diagnosis): KeyboardAvoidingView layout race — when the keyboard is up at the moment X is tapped, KAV's bottom edge is still keyboard-adjusted when the sticky bar (position absolute, bottom 86 iOS / 70 Android) re-mounts via the `!showAddPanel` gate at App.js:1953, so the bar's computed screen position lands offscreen until a subsequent layout pass (scroll, next remount) corrects it. Floating + button at bottom 150/134 shares the same gate and may also be affected but hasn't been observed in this configuration. Two candidate fixes: cheap (call `Keyboard.dismiss()` in the X handler before `setShowAddPanel(false)`) or proper (move floating + and sticky bar OUTSIDE the KeyboardAvoidingView into a sibling absolute-positioned layer). Root cause needs investigation in a future session. Not blocking — bar reappears on scroll. ✅ RESOLVED 2026-05-18 (Session 13A) — fixed via the "cheap" candidate fix flagged in the original entry: `Keyboard.dismiss()` added to all four close sites (X, Cancel, handleAddItem save-success, handleSaveEdit save-success) so the keyboard slides down before `setShowAddPanel(false)` runs, letting the KAV layout settle before the sticky vibe bar re-mounts. Combined with Session 13A Fix 3B (X swapped to left of heading), the X button is now both reliable and far from the gear icon. Both reported symptoms (X intermittently not closing + sticky bar disappearing) resolved.
- Tapping outside the Add Item panel (on the closet grid above) scrolls to the top of the closet but does NOT close the panel. The panel stays open off-screen below. The sticky vibe bar and floating + button are hidden (correctly — gated by !showAddPanel). User must scroll back down to find the panel and close it with X or Cancel. Fix: either close the panel on outside tap, or convert the Add Item panel to a modal slide-up sheet (Open Issue #8). Not blocking submission.
- Hanger View dress layout still has awkward empty gap below the dress. Dress outfits render the dress in `hangerSlotTop` (140×158 at y:96), pants slot empty (categorisation correctly nulls pants when dress exists), shoes at y:455 — small dress floating at top with a huge empty middle. Session 13C attempted a fix (new `hangerSlotDress` 170×380 at top:80 + `hangerSlotShoesDress` 125×95 at top:470 + dress-aware JSX branch) but reverted on iPhone test after side-card overlap (~29px of dress left edge covered by the bigger outerwear card) read poorly. Needs a clean design pass that handles dress sizing + side-card sizing + headless outfit fallback (Fix 2 + Fix 5 + Fix 6 from the Session 13C brief) in one coherent session. Working values from the reverted attempt for future reference: dress slot 170×380 at top:80, dress-layout shoes 125×95 at top:470. Surfaced + reverted 2026-05-19 (Session 13C). ✅ RESOLVED 2026-05-19 (Session 13D) — fixed via a different sizing strategy than 13C's attempt. New `hangerSlotDress` at 185×320, top:88, with `alignItems:'center'` + `justifyContent:'flex-start'`, paired with a new `hangerImageDress` style at `width:'100%', height:'88%'`. The combination is the actual fix — 13C used `hangerImage` (width:100%/height:100%) which gave `contain` a full-size box to center within; 13D shrinks the Image's height bounds to 88% so parent flex-start has something to anchor. Shoes positioned at `DRESS_SHOES_TOP = 418` (10px gap below dress hem at y=408) via inline style override on `hangerSlotShoes` — base style untouched for non-dress outfits. Mid-session experiment (top:82/height:355/shoes:445) tried, iPhone-tested, reverted; first version locked. Side-card overlap concern flagged in the original 13C entry (~29px overlap with outerwear card when 13C used 170-wide) may or may not still apply at 185-wide — not verified in 13D testing, flag for a focused outerwear-positioning session if it surfaces; not blocking dress-layout-itself sign-off.
- Sonnet sometimes generates outfits with two bottoms and no top — e.g. midi skirt + pants + earrings + sneakers, or bottoms + accessories + shoes with no top. Edge Function prompt issue — the structural rule "an outfit needs exactly one bottom OR one dress, plus a top OR dress" is in the cached SYSTEM_PROMPT v5 but not always enforced by Sonnet. Surfaced 2026-05-19 (Session 13C). Needs a dedicated Edge Function prompt-tuning session — CLI deploy via `supabase functions deploy generate-outfits --use-api`. Cache discipline: prompt additions over the 2,375-token plateau will reset the cache write cost. Not blocking — JS Smart Fallback (Session 7C) and safety filters (Session 7b-5) catch most edge cases, but the dress-vs-bottoms structural rule needs tightening in the prompt. Session 13E (2026-05-19) added a CLIENT-SIDE visual fallback: when no top/dress exists in the outfit, the Hanger View now promotes outerwear to the centre top slot (App.js:3599-3612 `directTop`/`sideOuter` derived pattern) so the hanger isn't visibly headless. The underlying Edge Function prompt bug is still open — Sonnet shouldn't generate the malformed outfit in the first place; the headless promotion just stops it looking broken in Hanger View when it does slip through.

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
- Mood Board real photos + Hanger View fix + Share Card (Session 9D/9E/9G) — Three visual fixes in App.js, all in one session. (9E Hanger View) Five `.image` → `.photoUri` swaps in the Hanger View centre stack, side card, and right-side accessory stack ([App.js:2842-3001](App.js:2842)) — real wardrobe photos now render on the hanger across top/dress, bottoms, shoes, light outerwear, and up to 5 accessories; `MOOD_PLACEHOLDER_COLORS` fallback retained for items without a photo. (9D Mood Board) Two surgical edits in the polaroid system — `MoodPolaroid` single-item branch ([App.js:2177-2185](App.js:2177)) and `MoodAccCell` item fall-through ([App.js:2113-2117](App.js:2113)) both render `<Image source={{ uri: item.photoUri }} />` (92%×92% single / `flex: 1` accessory grid cells) with category color block fallback; polaroid frame, tilt rotations, layout positions A–G, accessory grid math, swatch palette and labels all unchanged. (9G Share Card) Native share sheet wired — `react-native-view-shot@4.0.3` + `expo-sharing@~14.0.8` installed via `npx expo install` (SDK 54 compatible). New `ShareCard` component ([App.js:2245-2286](App.js:2245)) renders an offscreen 360×~480 watermarked card (photo grid + vibe + name + description + sage `#E8E4CE` bar with "Styled by Clozie ✦ Find us in the App Store"). `handleShareOutfit` handler ([App.js:2504-2536](App.js:2504)) spam-tap guarded, checks `Sharing.isAvailableAsync()`, waits 300ms for offscreen mount + image cache settle, `captureRef → PNG → Sharing.shareAsync` with `dialogTitle / mimeType / UTI`. Share Outfit button at [App.js:2820-2826](App.js:2820) now has `onPress`, `disabled={isSharing}`, label flips to "Preparing…". YourLooksTab return wrapped in Fragment so `<ShareCard>` sibling of ScrollView (not clipped). Caption "Styled by Clozie. Wear it or not?" deliberately NOT pre-filled — `expo-sharing` is file-only on both platforms; on-image watermark is the durable brand mark. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens. Zero CLI deploys ✅ DONE 2026-05-16 (Session 9D/9E/9G)
- Session 9F/9H/9J wired (Loading messages + My Closet polish + Circuit Breaker + Recent Outfit History). 9J: rotating loading subtitle every 1.5s ("Browsing your closet ✦" / "Mixing and matching ✦" / "Clozie is working her magic ✦"). 9H: My Closet grid card photos switched to `resizeMode="contain"` + height bumped 120→150, plus `formatLastWorn` helper renders ISO timestamps as "Last worn: May 16" (no year) with `'Never worn'` fallback. 9I: SKIPPED — outfit card photo strip already sized correctly. 9F: circuit breaker (counter in `user_metadata.consecutive_negative_sessions`, increments on all-Nope sessions, resets on Love/Like) + recent outfit history (last 6 outfits from `outfit_history`, injected as "RECENT OUTFITS — already styled, avoid repeating" block between DRESS RULE and WARDROBE POOL in user message) + recovery directive ("* RECOVERY: ... vary the silhouette, mood, or anchor piece") prepended to stylingLines when `recoveryMode=true` + warm sage-pill banner above outfit cards ("I noticed my last few suggestions didn't land. I'm trying something different today — let me know if I'm getting warmer."). Five LOW-risk substeps across App.js + three Edge Function CLI deploys. SYSTEM_PROMPT NOT touched. Cache verified at 2,375 tokens across all three deploys. App.js net diff approximately +95 lines across 14 edits in 6 regions ✅ DONE 2026-05-16 (Session 9F/9H/9J)
- My Closet structural redesign + recovery banner polish (Session 10A) — Seven LOW-risk substeps + one mid-session sub-step in App.js only, each iPhone-tested before the next. Spec source: Clozie_Session15_MyCloset_PinSelector_Spec.docx PART A only (PART B pin selector deferred). (Step 7) YourLooksTab recovery banner: sage-pill → white card with terracotta 3px left-border accent + subtle shadow. (Step 2) Old "Add Another Item" + "Set Today's Vibe →" buttons commented out. (Step 1) Floating + button (56×56 sage circle with white ring, white SVG plus) added as ScrollView sibling, Platform-aware `bottom: 150 iOS / 134 Android`. (Step 1b) Auto-scroll fix — one-shot `onLayout`-driven `scrollTo` lands the panel header at viewport top regardless of tap location. (Step 3) Sticky 50px sage vibe bar at `bottom: 86 iOS / 70 Android`, Outfit Medium 15 white text, scrollContent.paddingBottom bumped 40 → 90. (Step 4) Empty state — full-screen early return when `itemCount === 0 && !showAddPanel`, vertically centered 80px sage hanger SVG + DM Serif 22 heading + Outfit 14 subtext + sage pill button "+ Add Your First Item" white text. TabHangerIcon extended with backward-compatible `size`/`color`/`strokeWidth`/`viewBox` props — tab bar call unchanged. Spec's `paddingTop:80` swapped to true vertical center on Grace's call; trailing ✦ on subtext removed on Grace's call. (Step 5) 👗 emoji fallback replaced with sage-tint placeholder (40px sage hanger + 10px "No photo" muted caption). (Step 6) Pencil moved off the photo to category-tag row, right-aligned in a new flex-row container; no background circle, Outfit 16 espresso glyph, 44px tap target. X delete icon untouched. SYSTEM_PROMPT NOT touched. Cache stays at 2,375 tokens. Zero CLI deploys. ✅ DONE 2026-05-17 (Session 10A)
- My Closet search system + filterWardrobeItems shared utility (Session 10B). Six LOW-risk substeps + one mid-session search fix, each iPhone-tested. (Step 0) New pure utility `src/lib/filterWardrobeItems.js` — case-insensitive name + colour AND category filter, defensive null/non-array guards. (Step 1) Three useState hooks in WardrobeTab: `searchVisible`, `searchText`, `selectedCategory='All'`. (Step 2) Magnifying glass + "Search" button added to header row; `headerRow.justifyContent` flex-start → space-between; active state swaps icon + text color to `#6B7E65` and bg to `rgba(188,199,183,0.3)`. (Step 3) 40px white search bar revealed when searchVisible=true; magnifying glass + TextInput + X reset; X clears searchText, resets selectedCategory to 'All', hides bar. (Step 4) 7 category chips horizontal ScrollView (All · Tops · Bottoms · Dresses · Outerwear · Shoes · Accessories); module-scope `CATEGORY_CHIPS` const for Session 11 reuse; active = sage `#BCC7B7` + white text + white 1.5px inner border (matches Session 10A floating + idiom — deviation from spec's literal "border-color #BCC7B7 + white ring shadow" chosen for cross-platform consistency). (Step 5) `filteredItems = searchVisible ? filterWardrobeItems(...) : items`; grid swaps `items.map` → `filteredItems.map`; result count "Showing N results for X" when searchVisible && searchText non-empty; header count + progress bar continue to use `items.length` (TOTAL wardrobe). **Interpretation B** chosen (filter active only when searchVisible=true). (Mid-session search fix) `filterWardrobeItems` updated to OR-match `name + colour` after user reported "black" returning 0 results for items with colour "Jet Black"; notes excluded. (Step 6 read-only) Wardrobe loading delay diagnosed as race between initial loadItems useEffect and handleAddItem optimistic prepend; recommended fix is merge-by-id in setWardrobeItems setter; deferred to dedicated session. Edge Function NOT touched. SYSTEM_PROMPT NOT touched. Cache stays at 2,375 tokens. Zero CLI deploys ✅ DONE 2026-05-17 (Session 10B)
- Today's Vibe Pin Selector redesigned (Session 11 — Part B of Clozie_Session15_MyCloset_PinSelector_Spec.docx). Three LOW-risk substeps + one mid-session chip-stretch fix, each iPhone-tested. App.js only — Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys. (B1) Must Include card on Today's Vibe redesigned text-only: heading + two stacked subtext lines + magnifying-glass + "Search" button + conditional terracotta pinned pill (✦ + name + X) or muted italic "No item pinned" hint. Old horizontal 👗-emoji thumbnail ScrollView commented out (not deleted); dead `wardrobeItems.length === 0` ternary (unreachable since the Session 8 early-return) dropped with the comment. New `pinnedItem` derived const local to TodaysVibeTab. (B2) Bottom sheet (`Modal transparent animationType="slide"` + `Pressable` backdrop) at 85% screen height with handle bar + header + subtext + search + 7 category chips (reusing `wardrobeStyles.categoryChip` cross-tab for visual parity with My Closet) + "Tap to pin" hint + 2-column grid using `filterWardrobeItems` (Session 10B utility). Pinned card wrapped with 2.5px `#C87A52` border + 24px sage check circle top-right (white inner ring matching Session 10A floating + idiom). New `pinSheetStyles` block (24 entries). `Pressable` added to react-native imports (only new import). Mid-session fix: chips were stretching vertically into huge rectangles — fixed by adding `flexGrow: 0` + `height: 56` to `chipScroll` and `alignItems: 'center'` to `chipScrollContent` (both inside `pinSheetStyles` only — `wardrobeStyles.categoryChip` not touched, My Closet visual byte-identical). (B3) Grid card `onPress` wired: tap already-pinned card → unpin + sheet stays open; tap any other card → set pin + auto-dismiss sheet. End-to-end verified on iPhone: pin from sheet, pill renders, switch pin, generate with pin → all 3 outfits contain the pinned item. pinnedItemId state remains local to TodaysVibeTab — not lifted, not persisted across tab unmount or app reload. Resolves the Known Issue about the pin selector design rethink ✅ DONE 2026-05-17 (Session 11)
- Saved Outfits + Search (Session 12) — Six LOW-risk substeps, each iPhone-tested. (S0) New pure utility `src/lib/filterSavedOutfits.js` — case-insensitive name+colour OR-match across outfit name + item names + item colours, AND with occasion match; mirror of `filterWardrobeItems` pattern. (S1a) `savedOutfits` lifted from YourLooksTab to MainAppScreen as `SavedOutfit[]` (full objects, not ID strings); derived `savedIds` Set for O(1) lookups; toggleSave operates on object array newest-first; saved screen map source uses lifted array directly; latent pre-existing bug fixed (confirmRemove now persists `{ saved: false }` to DB before local filter); DEMO_MODE `['demo-2']` seed dropped. After S1a, saved outfits survive tab switching within a session. (S1b) DB load + hydration. `fetchSavedOutfits()` called on mount via new useEffect; rows hydrated against `wardrobeItems` (resolved via `wardrobeItemsRef = useRef([])` synced via separate effect so the DB load can read current value without including it in deps); merge-by-id preserves optimistic local saves during load window; re-hydration effect watching [wardrobeItems] rebuilds items array when wardrobe changes; SIGNED_OUT listener also resets savedOutfits; toggleSave stamps `itemIds: outfit.items.map(i => i.id)` on optimistic adds for re-hydration compatibility. After S1b, saved outfits survive app reload + sign-out/sign-in + cross-user RLS. (S2) `searchVisible` / `searchText` / `selectedOccasion='All'` state added to YourLooksTab + new module-scope `OCCASION_CHIPS = ['All', 'Casual Day', 'Work · Office', 'Going Out', 'Formal Event', 'Outdoor · Sport', 'Weekend Errands', 'Travel']` with UTF-8 middot byte-verified `c2 b7` matching the Edge Function's canonical strings. (S3) Magnifying glass + "Search" button added inside Saved Outfits modal — new `savedStyles.headingRow` flex-row, marginBottom migrated from heading to row (no layout shift), button gated `savedOutfits.length > 0`; reuses `wardrobeStyles.searchButton*` cross-tab (Session 11 precedent). (S4) 40px white search bar revealed when `searchVisible=true` — placeholder "Search your outfits...", X clears all 3 state pieces; KeyboardAvoidingView added around modal's ScrollView with `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` and `keyboardShouldPersistTaps='handled'` (Saved Outfits modal was untouched in Session 8 because no TextInputs existed then); reuses `wardrobeStyles.searchBarRow` + `searchBarInput` cross-tab. (S5) 8 occasion chips horizontal scroll, gated `searchVisible`; reuses `wardrobeStyles.chipsScroll` / `categoryChip*` styles cross-tab; no Session 11 chip-stretch bug because layout context is a vertical outer ScrollView (same as My Closet), not a column-flex bottom sheet. (S6) Filter wired — `filteredSavedOutfits = searchVisible ? filterSavedOutfits(...) : savedOutfits`; result count "Showing N results for [query]" or "Showing N outfits for [occasion]" with proper plural; "No outfits found" centered when filtered count is 0 (distinct from original "Your saved looks will live here" empty state for `savedOutfits.length === 0`); "N saved looks" + hint hidden during active filter; header `❤️ Saved (N)` pill stays as TOTAL count. KNOWN ISSUE surfaced (NOT fixed this session): occasion chip filter returns 0 results for non-"Casual Day" chips even where `saved=true` rows exist with matching `occasion`; byte audit of source strings passed; DB hex inspection + runtime byte comparison pending Session 13 (see SESSION_13_BRIEF.md). S6-fix plan (read-before-upsert preservation of context fields) drafted but NOT applied — pending root-cause confirmation. Resolves the deferred Step 5 from Session 9C (saved outfits cross-session persistence) ✅ DONE 2026-05-17 (Session 12 — partial, occasion chip filter pending Session 13)
- Quick UI fixes (Session 13A) — Five LOW-risk fixes shipped 2026-05-18, each iPhone-verified before the next. App.js only — Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys. (Fix 2) Share Card watermark text simplified to "Styled by Clozie" (removed both " Find us in the App Store" and the trailing sparkle separator). (Fix 3A) `Keyboard.dismiss()` added before `setShowAddPanel(false)` at all four close sites (X button, Cancel button, handleAddItem save-success, handleSaveEdit save-success); `Keyboard` added to react-native imports. Resolves the Session 10B KAV layout race that was making the sticky vibe bar disappear when X was tapped with keyboard up. (Fix 3B) X close button swapped to the LEFT of the panel heading inside `addPanelHeader` — `justifyContent: 'space-between'` now places X on the left edge and heading on the right; inline `alignItems` on the X TouchableOpacity flipped `flex-end` → `flex-start` so the ✕ glyph hugs the left of its 44×44 wrapper. Eliminates accidental gear-icon taps (the gear at `top: 56, right: 16, zIndex: 10` was within ~20px vertical overlap of the X tap zone in the auto-scrolled position). (Fix 4) Friendly empty search results — both My Closet and Saved Outfits search now show plain text messages ("No items match your search" / "Try a different name or category" on closet; "No outfits found" / "Try a different name or occasion" on saved outfits) when filter returns zero matches. Plain text only — no icons, no sparkles. (Fix 1) Splash logo italic "e" upper-right curve no longer clipped — outer Text wrapper converted to View so the inner Text children get independent measurement (RN's nested-Text pattern doesn't honor inner padding for the parent's clip boundary); `lineHeight: 92` added to `splashLogoZie` for vertical breathing room above the italic ascender at fontSize 72; `paddingRight: 8` retained and now actually applied due to the View wrapper. One Known Issue resolved (Add Item X button inconsistent — Session 10B), one new Known Issue added (Add Item panel doesn't close on outside-tap, scroll-only) ✅ DONE 2026-05-18 (Session 13A)
- Quick UI fixes round 2 (Session 13B) — Three LOW-risk tasks shipped 2026-05-18, each iPhone-verified before the next. App.js only — Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys. (Task 1A) `LOADING_MESSAGES` array at [App.js:2835](App.js:2835) grew 3 → 5 entries: 'Browsing your closet ✦' / 'Mixing and matching ✦' / 'Finding your best looks ✦' / 'Almost there ✦' / 'Clozie is working her magic ✦'. setInterval timing at [App.js:3146-3148](App.js:3146) unchanged at 1.5s; 5 × 1.5s = 7.5s before any repeat. (Task 1B SKIPPED) Font size on loading subtitle stays at 13 — reality check found `loadingTitle` at fontSize 20 ([App.js:9091-9095](App.js:9091)); bumping subtitle to 17 would have crowded the hierarchy. Grace skipped after seeing actual values. (Task 2) Sticky vibe bar at the bottom of My Closet redesigned from a full-width 50px bar into a centered floating pill matching the empty-state pill design language. Three changes in App.js: JSX wrapped existing `<TouchableOpacity>` in `<View style={wardrobeStyles.stickyVibeBarWrapper} pointerEvents="box-none">` at [App.js:1966-1977](App.js:1966); NEW `stickyVibeBarWrapper` style block at [App.js:7977](App.js:7977) (position absolute, bottom Platform-aware 86 iOS / 70 Android, left:0 right:0, alignItems:'center', zIndex:5); `stickyVibeBar` style block at [App.js:7989](App.js:7989) rewritten as a pure pill (height 44, paddingHorizontal 28, borderRadius 22, 2px white border, drop shadow {0,2} opacity 0.10 radius 6 elevation 2 — values byte-identical to `wardrobeStyles.emptyStateButton` at [App.js:7917-7928](App.js:7917)). Critical layout decision: wrapper pattern with `pointerEvents="box-none"` chosen over `alignSelf: 'center'` on absolute child after Grace pushed back on cross-device App Store safety. Wrapper guarantees centering via flex alignItems on full-width positioned parent; `alignSelf: 'center'` on absolute children relies on a Yoga implementation detail with edge cases. `pointerEvents="box-none"` on wrapper preserves tap-through to closet cards in the bottom strip; without it the full-width invisible wrapper would absorb taps. Pill text "Set Today's Vibe →" unchanged (NO sparkle change per directive); gate `itemCount > 0 && !showAddPanel` unchanged; handler `onGoToVibe` unchanged; text style `stickyVibeBarText` (Outfit_500Medium 15 white) unchanged. (Task 3) Consent modal copy update — two text-string changes inside `ConsentModal` at [App.js:6242-6281](App.js:6242), zero logic changes. Body at [App.js:6256-6262](App.js:6256) simplified to "Clozie uses Anthropic to create outfit suggestions from your wardrobe details and style preferences. Learn more about how Anthropic handles data at anthropic.com/privacy." with inner `<Text style={consentStyles.link} onPress={openPrivacyLink}>anthropic.com/privacy</Text>` byte-identical (same terracotta style, same `Linking.openURL`, same literal URL text). Accept button text at [App.js:6268](App.js:6268): "Accept — I'm ready to style ✦" → "Accept". Title "Before Clozie styles you" untouched. Decline button "Not now" untouched. `consentStyles` untouched. All consent LOGIC untouched (gate in handleGenerate, mount useEffect, handleAcceptConsent + handleDeclineConsent, all 4 state hooks). Persistence verified intact across sign-out / sign-in. Sparkle removed on Accept button only — all other sparkles in app (loading messages, Generate button, everywhere else) untouched per Grace's explicit directive ✅ DONE 2026-05-18 (Session 13B)
- Hanger View polish + Your Looks photo strip redesign (Session 13C). Five LOW-risk fixes shipped in App.js, each iPhone-tested. (Step 1 Mood Board investigation) `MoodPolaroid` + `MoodAccCell` `<Image>` resizeMode="contain" added then reverted on Grace's call — `cover` reads better in polaroid frames. (Step 2 Your Looks outfit card photo strip) 2-col landscape → 3-col portrait redesign: `photoStripItem.width: '47%' → '30%'`, `photoStripThumb.height: 80` swapped for `aspectRatio: 3 / 4`. Default `cover` near-zero-crop now that the box matches typical 3:4 garment photo aspect. Per-thumb item name labels removed from both mapped iteration ([App.js:3297](App.js:3297)) and sample-item fallback ([App.js:3304](App.js:3304)) — narrower thumbs caused heavy truncation; names still in Mood Board polaroids + Sonnet description. `looksStyles.photoStripName` style entry left in place (unused but cheap). (Step 3 Saved Outfits) `<Image>` at [App.js:3983](App.js:3983) got `resizeMode='contain'` — KEPT. (Step 4 Hanger View shoes bigger) `hangerSlotShoes`: top 438→455 (12px clear below pants), marginLeft -52.5→-62.5, width 105→125, height 72→95. (Step 5 Hanger View outerwear card bigger + repositioned) `hangerLightOuterCard`: top 116→90→120 (two-step iPhone feedback — finally hangs visibly below the hanger), width 76→110, height 96→130. (Step 6 dress layout ATTEMPTED + REVERTED) Added `hangerSlotDress` (170×380 at top:80) + `hangerSlotShoesDress` (125×95 at top:470) + dress-aware JSX branch. iPhone test surfaced awkward side-card overlap with the bigger dress. Grace called full revert. Dress outfits still use `hangerSlotTop` (140×158 at y:96) with awkward gap below — known issue, unchanged. Deferred: full dress layout redesign (Fix 2 + Fix 5 headless outfit fallback + Fix 6 side-card sizing) for a dedicated future session ✅ DONE 2026-05-19 (Session 13C)
- Hanger View dress layout fix (Session 13D) — closes the deferred Step 6 from Session 13C. Three small App.js changes + one mid-session number experiment tried and reverted, iPhone-verified before lock. New `hangerSlotDress` style (position absolute, top:88, left:'50%', marginLeft:-92.5, width:185, height:320, alignItems:'center', justifyContent:'flex-start', overflow:'hidden', zIndex:4) + new `hangerImageDress` style (width:'100%', height:'88%' — the actual key, NOT just the parent's flex-start). New module-scope const `DRESS_SHOES_TOP = 418` (10px gap from dress hem at y=408). JSX branch added in the hanger render block: `dress ? <hangerSlotDress + hangerImageDress> : top ? <hangerSlotTop + hangerImage> : null`. `pants` block unchanged (already null when dress exists via categorisation). `shoes` JSX gets inline `[hangerSlotShoes, dress && { top: DRESS_SHOES_TOP }]` override — base `hangerSlotShoes.top:455` byte-identical for non-dress outfits. Z-index ladder unchanged — `hangerSvgWrap` zIndex:6 already sits above dress zIndex:4 (brief's Fix 3 z-index bump turned out unnecessary on inspection). The Image-height-less-than-container-height piece combined with parent flex-start is what actually anchors the photo — neither alone is sufficient because `<Image resizeMode='contain'>` centers its scaled photo internally within Image bounds, not via parent flex. Session 13C's prior attempts (170×310 then 170×380 at top:80, both with `hangerImage` at width:100%/height:100%) failed for this reason — bigger box, same internal-centering, photo still floated. Mid-session number experiment (top:82/height:355/DRESS_SHOES_TOP:445) shipped, iPhone-tested, reverted on Grace's call — first version (top:88/height:320/DRESS_SHOES_TOP:418) won and was locked. Side-card overlap concern from the original 13C Known Issue may or may not still apply at 185-wide — not verified in 13D testing, flag for separate outerwear-positioning session if it surfaces. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys ✅ DONE 2026-05-19 (Session 13D)
- Hanger View headless outfit fix + entrance animation (Session 13E) — Two LOW-risk phases in App.js only, each iPhone-verified before the next. Phase 1: when an outfit has Outerwear + Bottoms + Shoes but no Tops and no Dresses, the categorisation block at App.js:3599-3612 now promotes outerwear from the side card to the centre top slot (`hangerSlotTop` 140×158) via a derived `directTop` / `sideOuter` pattern. One side-card render gate swap at App.js:3724 hides the now-empty side card. Outfits with a real Top or Dress render byte-identical. Phase 2: new staggered drop+fade entrance animation when user opens Hanger View tab or switches outfit. 4 `Animated.Value` refs (centre/pants/shoes/side) in YourLooksTab + new `useEffect` watching `[moodBoardTab, moodBoardOutfit]` running `Animated.stagger(250, [4× Animated.timing({ toValue: 1, duration: 350, useNativeDriver: true })])`. Total ~1100ms. Six render blocks (dress, top, pants, shoes, light outerwear side card, each of up to 5 accessory cards) wrapped in `Animated.View` reading the appropriate ref. Each style adds `opacity: anim` + `translateY: anim.interpolate([-15, 0])`. Existing card rotations (light outerwear `-4deg`, per-accessory `pos.rot`) moved INTO the animated transform array to survive style-array merge order. Native driver, zero JS thread impact. Entrance animation only — no continuous sway yet, deferred. Initial timing (stagger 150 / duration 200, total ~650ms) felt too fast on iPhone, bumped to 250/350. No new imports, no new styles. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys ✅ DONE 2026-05-19 (Session 13E)
- Session 13I wired (AI consent revoke — Apple 5.1.2(i)). Three LOW-risk substeps in App.js only, each iPhone-verified. New `handleRevokeConsent` handler in MainAppScreen mirrors `handleAcceptConsent`'s optimistic pattern (`setConsentGiven(false)` → best-effort `supabase.auth.updateUser({ data: { ai_consent_given: false } })`). New "Styling Permissions" row in Settings DATA card opens confirm modal byte-mirroring Clear Clozie's Memory structure (zero new styles, full reuse of `settingsStyles` row + `savedStyles` confirm-modal styles). 1.5s inline "Consent revoked" body-color flash replaces the `Revoke` link, then swaps back via useEffect setTimeout + clearTimeout cleanup. "Yes, revoke" onPress order: close modal → fire revoke → start flash. Row always visible regardless of `consentGiven`. LANGUAGE RULE compliance: copy uses "Styling Permissions" / "Clozie styling" / "Clozie can generate outfits" — never says "AI" (initial brief's "AI Data Consent" wording caught + replaced before code touched the file). Verified across 6 end-to-end checks: tap Revoke → confirm → modal closes → flash shows → close Settings → Today's Vibe → Generate → ConsentModal reappears (local state propagation); sign out → sign in → same flow again (Supabase persistence). Edge Function NOT touched. SYSTEM_PROMPT NOT touched. Cache stays at 2,375 tokens. Zero CLI deploys ✅ DONE 2026-05-20 (Session 13I)
- Session 14A wired (Privacy Policy + Terms of Service WebViews in Settings — closes the Phase 3 App Store legal-doc requirement). New `expo-web-browser ~15.0.11` dependency (SDK 54 compatible, base `openBrowserAsync` only — `app.config.js` plugin entry deliberately not added because we don't use `openAuthSessionAsync`). App.js: new `WebBrowser` import + two `PRIVACY_POLICY_URL` / `TERMS_OF_SERVICE_URL` Termly constants + new LEGAL card inserted between ABOUT and Sign Out with two rows mirroring the DATA card pattern (label + subtitle + gold `View` link, divider between). `WebBrowser.openBrowserAsync` opens an in-app Safari View Controller / Custom Tabs sheet that swipe-dismisses cleanly. Zero new styles (all existing `settingsStyles` reused). Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys ✅ DONE 2026-05-21 (Session 14A)
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
- No session counter / weekly limits / VIP table — Session 13C / 16.
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

## 2026-05-16 — Session 9D/9E/9G wired (Mood Board real photos + Hanger View fix + Share Card)

Fourteenth session of the native-app build. Three discrete visual features wired in one focused session, each iPhone-tested before the next began. Built on testing branch only — main untouched. Edge Function NOT touched at any point. SYSTEM_PROMPT NOT touched. Prompt cache stays at 2,375 tokens across the session. Zero CLI deploys.

What was wired:

- **Step 1 — 9E Hanger View `.image` → `.photoUri` (5 places).** The Hanger View tab read `top.image`, `pants.image`, `shoes.image`, `lightOuter.image`, and `acc.image` (App.js:2842-3001) — five places where the wrong property name meant the ternary always fell through to the `MOOD_PLACEHOLDER_COLORS` color block. Wardrobe items expose `photoUri`, not `image`, so the bug was 100% reproducible. Fix: five surgical Edit calls replacing each `*.image` ternary check AND each `uri: *.image` value with `*.photoUri`. Fallback color block preserved exactly as-is for items genuinely missing a photo. Grep verification post-edit: zero `.image` references remain in App.js. iPhone-verified across centre stack (top/dress, pants, shoes), left side card (light outerwear), and right-side accessory stack — all real photos rendering correctly on the hanger.

- **Step 2 — 9D Mood Board polaroids — real photos in single-item and accessory polaroids.** The polaroid system at App.js:1966-2187 rendered solid color blocks via `MOOD_PLACEHOLDER_COLORS[category]` in two places: (1) `MoodPolaroid` single-item branch (App.js:2177-2181) — the photo zone inside each tilted polaroid card; (2) `MoodAccCell` `kind: 'item'` fall-through (App.js:2113) — each cell inside the accessory grid. Fix: replaced both color-block branches with `<Image source={{ uri: item.photoUri }} />` at 92%×92% (single-item) or `flex: 1` (accessory cell), keeping the color block as fallback for the rare case of a missing photo. The `photoZone` already had `overflow: 'hidden'` (App.js:2218), so the photo can't bleed past the polaroid's white border. Default `resizeMode: 'cover'` fills the frame neatly — same pattern as the existing outfit-card photo strip. Polaroid frame, tilt rotations, layout positions A–G, accessory grid math (1/2/3/4/+overflow), swatch palette, and label text all unchanged. iPhone-verified across Mood Board tab.

- **Step 3 — 9G Share Card (full spec, watermarked image, native share sheet).**

  - **Libraries installed.** `react-native-view-shot@4.0.3` + `expo-sharing@~14.0.8` via `npx expo install` (SDK 54 compatible). Both well-established libraries; `expo-sharing` chosen over React Native built-in `Share.share` because the latter only supports text on Android. `expo-sharing` is cross-platform file-share.
  - **Imports added** (App.js:31-32): `ViewShot, { captureRef }` from `react-native-view-shot`, `* as Sharing` from `expo-sharing`.
  - **`ShareCard` component** (App.js:2245-2286) — pure React component. Renders `null` when `outfit` is falsy. Otherwise renders `<View>` at `position: absolute, top: -10000, left: 0, pointerEvents: 'none'` (off-screen, non-interactive) wrapping a `<ViewShot ref={shotRef} options={{ format: 'png', quality: 0.95, result: 'tmpfile' }}>`. Inside ViewShot: a 360-wide white card with 12px border-radius and `overflow: 'hidden'`, containing a 2-column photo grid (4:5 aspect, padding 18px, gap 12px, max 4 items with `slice(0, 4)`), then a text block (vibe eyebrow `#A44A34` Outfit 700 11px letter-spaced 2.5 uppercase / outfit name DM Serif Display 24px espresso `#2C1A0E` / description Outfit italic 13px body color `#5C4A3A` truncated to 3 lines), then a sage `#E8E4CE` watermark bar with **"Styled by Clozie ✦ Find us in the App Store"** in Outfit 500 12px espresso letter-spacing 0.4. Fallback color block on each photo cell for items without `photoUri`.
  - **`shareCardStyles`** (App.js:2287-2365) — new StyleSheet block, locked palette colors only. Photo cell width computed: `(360 - 18*2 - 12) / 2 = 154px`. No new design tokens introduced.
  - **State + ref** in YourLooksTab (App.js:2386-2388): `outfitToShare` (null or current outfit), `isSharing` (boolean), `shareShotRef` (useRef). Tab-local — no MainAppScreen lift needed.
  - **`handleShareOutfit(outfit)` async handler** (App.js:2504-2536):
    1. Spam-tap guard: `if (!outfit || isSharing) return`
    2. `await Sharing.isAvailableAsync()` — warm Alert "Sharing isn't available on this device" if false (rare on real iPhone, occasional on simulator)
    3. `setOutfitToShare(outfit); setIsSharing(true)` — triggers the offscreen ShareCard to mount with this outfit's content
    4. `await new Promise((resolve) => setTimeout(resolve, 300))` — belt-and-suspenders so the offscreen card has a moment to mount + RN's image cache settles. The `photoUri` values are the same signed URLs the visible photo strip just rendered above the button, so cache hits are the common case; the 300ms covers cold first capture.
    5. `const uri = await captureRef(shareShotRef, { format: 'png', quality: 0.95, result: 'tmpfile' })` — produces a tmpfile path that survives the share lifecycle.
    6. `await Sharing.shareAsync(uri, { dialogTitle: 'Share your outfit', mimeType: 'image/png', UTI: 'public.png' })` — opens native share sheet.
    7. Wrapped in try/catch with warm Alert "Couldn't share — Something went wrong opening the share sheet. Please try again." `console.warn` for diagnostic; user cancel resolves silently on iOS so it's not treated as a failure.
    8. `finally` block: `setIsSharing(false); setOutfitToShare(null)` — clean state reset whether share succeeded, failed, or was cancelled. Means the button re-enables immediately after the sheet closes.
  - **Share Outfit button wired** (App.js:2820-2826) — added `onPress={() => handleShareOutfit(outfit)}`, `disabled={isSharing}`, text flips to "Preparing…" during the capture window. The disabled-during-capture behavior makes spam-tap a no-op.
  - **YourLooksTab return wrapped in Fragment** (App.js:2622 + 3343-3346) — added `<>...</>` around the ScrollView so the offscreen ShareCard renders as a sibling of the ScrollView, not a child. Important because ScrollView's content gets clipped to its scroll bounds; placing ShareCard outside via Fragment ensures `top: -10000` positioning works reliably across iOS and Android.

What was deliberately NOT done this session:

- **No caption pre-fill** (CLAUDE.md spec: "Styled by Clozie. Wear it or not?"). `expo-sharing` is a file-only share API — it does not support pre-filling a text caption alongside the image. React Native's built-in `Share.share({ message, url })` supports caption on iOS but on Android only supports text-or-image (not both). Going with `expo-sharing` for cross-platform parity means the watermark on the image itself carries the brand signal — which is more durable anyway (it travels with the image even if someone re-shares it). Documented as a deliberate spec trade-off, not a deferred item.
- **No save-to-camera-roll** — `expo-media-library` not installed, separate feature. CLAUDE.md lists this as "Save to camera roll — Expo MediaLibrary" elsewhere in the Phase 2 list; out of scope for this session.
- **No Edge Function changes** — `generate-outfits`, `recognize-photo`, `delete-user` all untouched. Zero CLI deploys.
- **No SYSTEM_PROMPT changes** — cache stays at 2,375 tokens.
- **No `src/lib/outfitHistory.js` changes** — Session 9A/9B/9C work untouched.
- **No Saved Outfits modal changes** — Mood Board polaroids and Hanger View `item.image` mismatch are both fixed now, BUT the cross-session Saved Outfits persistence is still deferred to Session 12 (per the explicit Step 5 deferral in Session 9C). Saved outfits viewed within the current session benefit from today's visual fixes; after app reload, saved outfits still vanish from the modal until Session 12 lifts state to MainAppScreen + loads from DB. The Known Issue entry for that is updated to acknowledge that Mood Board and Hanger View are no longer waiting on Session 12.
- **No My Closet redesign** — Session 15 territory.
- **No diagnostic log cleanup in Edge Function** — out of scope (no deploys this session).
- **No fix for the missing dislikes-filter log line in Supabase Logs** (Session 7b-7 Known Issue) — out of scope.
- **No fix for the `Leather Chelsea Boots` dislikes-filter token escape** (Session 7b-7 Known Issue) — out of scope.
- **No My Closet "Last worn" date formatter** (Session 9B Known Issue) — separate polish session.

Three Known Issues resolved this session:
- Mood Board polaroid system uses category color placeholders — RESOLVED by Step 2 (9D).
- Hanger View tab reads `top.image`, `pants.image`, etc. — RESOLVED by Step 1 (9E).
- Share Outfit button at [App.js:2607-2613] has NO `onPress` prop — RESOLVED by Step 3 (9G).

One Known Issue updated:
- "Saved outfits do not survive app reload" — the sentence "Same Session 12 fixes the Mood Board polaroid placeholders + Hanger View `item.image` mismatch." replaced with "(Mood Board polaroid placeholders and Hanger View `item.image` mismatch were resolved separately in Session 9D/9E on 2026-05-16.)" — the cross-session Saved Outfits state lift is the only remaining piece for Session 12.

App.js net diff for the session: approximately +145 lines added across roughly 12 surgical edits in 6 regions (imports block, new ShareCard component + styles block, YourLooksTab state additions, new handleShareOutfit handler, Share Outfit button onPress wiring, Fragment wrap + ShareCard render). 10 line modifications in the Hanger View block (5 ternary checks + 5 `uri:` swaps). 2 surgical edits in the Mood Board polaroid system (single-item branch + accessory cell). Zero deletions.

Files changed:
- `App.js` — modified (visual fixes + new ShareCard component)
- `package.json` — `react-native-view-shot@4.0.3` + `expo-sharing@~14.0.8` added
- `package-lock.json` — updated by npm install
- `node_modules/` — new packages installed
- `supabase/functions/generate-outfits/` — UNTOUCHED
- `supabase/functions/recognize-photo/` — UNTOUCHED
- `supabase/functions/delete-user/` — UNTOUCHED
- `src/lib/outfitHistory.js` — UNTOUCHED

Commit: TBD on testing branch. Version label: v2026-05-16-session9deg. Push to remote — Grace's call.

## 2026-05-16 — Session 9F/9H/9J wired (Circuit Breaker + My Closet polish + Loading messages)

Fifteenth session of the native-app build. Three discrete features wired across the session: 9J Loading messages (App.js only), 9H My Closet polish in three sub-fixes (App.js only, no Edge Function), 9F Circuit Breaker + Recent Outfit History (five LOW-risk substeps across App.js + three Edge Function CLI deploys). 9I (outfit card photo strip polish) deliberately SKIPPED after read-only check confirmed it was sized correctly — don't fix what isn't broken. Built on testing branch only — main untouched. SYSTEM_PROMPT NOT touched at any point. Prompt cache verified at 2,375 tokens after every CLI deploy via `cache_read_input_tokens: 2375` on second generation within 5 min. App.js net diff approximately +95 lines across 14 edits in 6 regions; +5 line modifications in Edge Function (counter read + recovery directive + history fetch + history block + 3 response field additions + 1 call site update).

What was wired (in build order):

- **9J Loading messages** — New `LOADING_MESSAGES` constant at module scope (`['Browsing your closet ✦', 'Mixing and matching ✦', 'Clozie is working her magic ✦']`) placed just above `function YourLooksTab` ([App.js:2368-2372](App.js:2368)). New state hook `loadingMessageIndex` inside YourLooksTab + new useEffect that watches `generationStatus`: when `'loading'`, resets index to 0 and starts a `setInterval` rotating every 1.5s with modulo-loop for slow generations; cleanup clears interval on `'success'`/`'error'`/unmount/regenerate. Subtitle render swapped from static "Clozie is working her magic ✦" → `{LOADING_MESSAGES[loadingMessageIndex]}`. Spinner animation + title ("Styling your outfits...") unchanged. Verified on iPhone — first message "Browsing your closet ✦" → 1.5s → "Mixing and matching ✦" → 1.5s → "Clozie is working her magic ✦", reset on each new generation. Edge Function NOT touched. Cache stays at 2,375.

- **9H My Closet polish (3 sub-fixes)** —
  - (1) `resizeMode="cover"` → `"contain"` on grid card photo ([App.js:1401](App.js:1401)). Photos now show in full without cropping (no more cut-off coat tops or shoe toes). Letterboxing whitespace sits on the existing white `gridCardPhoto` background (already `#FFFFFF`) so visually clean. Add Item panel preview ([App.js:1512](App.js:1512)) intentionally kept at `cover` — different surface, intentional tight crop. Hanger View already uses `contain` — consistent visual language across the app.
  - (2) `gridCardPhoto.height` 120 → 150 ([App.js:7248](App.js:7248)). Photos visibly larger in each card; whole grid feels more substantial. Parent grid card has no fixed height so layout grows naturally — nothing below shifts in unexpected ways.
  - (3) New `formatLastWorn(iso)` helper at module scope just before `function WardrobeTab` ([App.js:1059-1067](App.js:1059)), alongside `getCategoryEmoji`. Returns `'Never worn'` when iso is null/undefined/empty/malformed (defensive `isNaN(d.getTime())` check); otherwise `'Last worn: May 16'` format via `toLocaleString('en-US', { month: 'short' })` + `d.getDate()`. English month abbreviations regardless of device locale — matches the app's English-only copy. Render at [App.js:1479](App.js:1479) swapped from `${item.lastWorn}` (raw ISO) to `formatLastWorn(item.lastWorn)`. Both branches (Never worn + formatted date) preserved through the helper. Only ONE call site for `lastWorn` in App.js — no inconsistency risk across surfaces.
  - Optimistic local state update after `handleMarkItemsWorn` deliberately deferred to a follow-up polish session (separate concern from formatting). Known Issue updated to reflect this remaining piece.

- **9I Outfit card photo strip polish** — SKIPPED after read-only check. Photo strip thumbs are 80px tall in 47% columns ([App.js:7793-7810](App.js:7793)) using default `cover` (no explicit prop — RN default). Functional, consistent, appropriate sizing for a 2-column thumb teaser. Not broken. Skipped per the "don't fix what isn't broken" principle. The only theoretical polish would be adding `resizeMode="cover"` explicitly for codebase consistency — purely cosmetic, not done.

- **9F Circuit Breaker + Recent Outfit History (5 substeps, 3 CLI deploys)** —

  - **9F-A Client counter writes** (App.js only, no deploy) — YourLooksTab.handleRegenerate ([App.js:2493-2516](App.js:2493)) extended with counter eval BEFORE local UI resets (so `ratings` state is still readable). Three rating-state cases: (1) any 'love'/'like' → reset `consecutive_negative_sessions` to 0; (2) all outfits rated 'nope' (full negative session) → increment counter (read current value via `getUser`, write `current + 1`); (3) incomplete session (0/1/2 ratings, no positives) → leave counter alone. Fire-and-forget — `.catch(console.warn)` on both branches; doesn't await. Reasoning: awaiting would create a ~200ms window where ratings/feedback cleared but spinner hadn't appeared (visual flash). Race trade-off accepted: in rare cases the immediate-next generation may see the old counter value, but the generation after always sees the correct value. Spec-compliant — recovery is meant to fire "on subsequent generations", not retroactively. Verified end-to-end via Supabase dashboard: increment 0→1→2 across all-Nope sessions, reset 2→0 on Love rating, no change on incomplete (2 Nope + 1 unrated). `updateUser({ data: {...} })` merge behavior confirmed — other metadata keys (full_name, styles, colours, never_wear, ai_consent_given) preserved.

  - **9F-B Edge Function deploy 1** (`supabase functions deploy generate-outfits --use-api`) — Counter read from `user.user_metadata.consecutive_negative_sessions` placed immediately after the existing `console.log('[generate-outfits] auth OK, user:', user.id)` ([index.ts:1221-1228](supabase/functions/generate-outfits/index.ts:1221)). `recoveryMode = consecutiveNegativeSessions >= 2`. New diagnostic log `[generate-outfits] circuit breaker: { consecutiveNegativeSessions, recoveryMode }`. New `recoveryMode` field added to all 3 success response shapes (sonnet, fallback, stub) — error responses unchanged. Client: new `generationRecoveryMode` state hook in MainAppScreen ([App.js:5600](App.js:5600)), reset to false at start of every `handleGenerate`, populated from `response.recoveryMode === true` on success. Not consumed yet — banner UI is 9F-E. Verified on iPhone: log line appears with correct values; cache stays at 2,375 via `cache_read_input_tokens: 2375` on second generation.

  - **9F-C Edge Function deploy 2** — `buildFreshContent` signature extended with `recoveryMode: boolean` ([index.ts:448](supabase/functions/generate-outfits/index.ts:448)); destructured at [index.ts:451](supabase/functions/generate-outfits/index.ts:451). Recovery directive computed conditionally: `"* RECOVERY: Her recent outfits weren't landing. Try a clearly different direction this time — vary the silhouette, mood, or anchor piece from her usual."` Prepended to `stylingLines` as the SECOND bullet (right after the identity line, before weather hint and flags) — Sonnet weights early instructions more heavily. Call site at [index.ts:1325](supabase/functions/generate-outfits/index.ts:1325) updated to pass `recoveryMode`. USER MESSAGE only — SYSTEM_PROMPT untouched. ~30 tokens added to user message when active; zero when inactive. Verified on iPhone: cache stays at 2,375.

  - **9F-D Edge Function deploy 3** — New DB query against `outfit_history` table after the styleable-items log ([index.ts:1301-1322](supabase/functions/generate-outfits/index.ts:1301)): `select('name, vibe, item_ids').order('created_at', { ascending: false }).limit(6)`. Errors silently swallowed (no destructure of `error`) — fetch failure must not block generation; empty array fallback = same code path as a new user. Item names resolved server-side via `wardrobeNameById = new Map(items.map(i => [i.id, i.name]))` against the UNFILTERED `items` array so filtered-out items still show by name. Each row mapped to `{ name, vibe, itemNames: string[] (max 4) }`. `buildFreshContent` extended with `recentOutfits` arg ([index.ts:449](supabase/functions/generate-outfits/index.ts:449)); new conditional history block built inside the function — for each row, formats as `- "Name" (VIBE) — Item1, Item2, Item3` (vibe and items both conditional); if no usable rows, block returns null and is omitted entirely. Block placement chosen carefully: BETWEEN DRESS RULE and WARDROBE POOL — preserves WARDROBE POOL's existing last-position recency bias on items themselves while still surfacing the history as context. Diagnostic log `[generate-outfits] recent outfit history: <N> rows`. ~15-25 tokens per line × max 6 lines. Verified on iPhone — Grace's account had 6 rows of history (max cap), block rendered, cache stayed at 2,375, no regression.

  - **9F-E Client recovery banner UI** (App.js only, no deploy) — New `recoveryMode` prop on YourLooksTab ([App.js:2387](App.js:2387)), passed from MainAppScreen ([App.js:5823](App.js:5823)) reading `generationRecoveryMode`. Banner JSX inserted just above the outfit cards map at [App.js:2761-2769](App.js:2761), gated on `recoveryMode && hasGenerated && outfits.length > 0` (banner never appears during loading or empty state or warm error message; gated belt-and-suspenders to never show with zero outfits below). Banner text spec-quoted: "I noticed my last few suggestions didn't land. I'm trying something different today — let me know if I'm getting warmer." New styles `recoveryBanner` + `recoveryBannerText` added to `looksStyles` ([App.js:7797-7811](App.js:7797)). Initial styling caught on iPhone test: first pass used `backgroundColor: '#E8E4CE'` (cream sage) which is the YourLooksTab background — banner was invisible (sage-on-sage). Fixed by switching to locked sage-pill color `rgba(188,199,183,0.30)` — same value used 5+ other places in the codebase (CLOZIE RECOGNISED success bar, category tag pills) — clear contrast against cream background, established "Clozie speaks" visual idiom. Text uses locked espresso `#2C1A0E` + Outfit Regular 14px + line height 21. `fontStyle: 'italic'` was initially included but removed per Grace's call after iPhone test — normal weight reads as more warmly conversational than italic in this context. Verified end-to-end: counter 0 → no banner; counter 2 (via natural Nope-rating flow) → banner appears with sage-pill background, espresso normal-weight text, correct copy; counter resets to 0 on Love rating → next generation has no banner.

Design / scope decisions made during the session:

- **9J — three messages, 1.5s rotation.** Grace chose the wording herself. 1.5s is fast enough to feel responsive (3 messages cycle in 4.5s — typical Sonnet call duration) but slow enough to be readable. Modulo loop covers slow generations gracefully.

- **9H — `contain` over `cover` despite occasional whitespace.** The whole point of a closet grid is "see what you own clearly." Lost detail (cropped coat collar, missing shoe toe) is a worse failure than airy whitespace. Hanger View already uses `contain` — consistent visual language. The 120→150 height bump partially offsets whitespace by giving photos more vertical room.

- **9H formatter — English `toLocaleString` regardless of device locale.** Matches the app's English-only copy. Polish language is in the Phase 6+ roadmap, will get handled then. Defensive `isNaN(d.getTime())` check prevents bad data crashing the UI.

- **9I deliberately skipped.** Reading the code honestly: photo strip thumbs are 80px in 47% columns with default `cover` — appropriate sizing for a 2-column teaser chip below a header. Mood Board is the hero photo surface (and 9D fixed that). Don't fix what isn't broken.

- **9F user_metadata over new Supabase table.** Chose `user_metadata.consecutive_negative_sessions` (client-writes pattern) over a new `user_styling_state` table. Same pattern as style profile, AI consent. Zero dashboard work, zero Edge Function write path, simpler. Edge Function reads it for free during the existing `getUser(token)` call.

- **9F `recoveryMode` returned as response field, not inferred client-side.** Two options were on the table: (a) Edge Function returns `recoveryMode: true`, client reads it directly; (b) client reads its own `user_metadata` to decide. Chose (a) — one extra response field, cleanly signalled by the server, source of truth in one place. Banner can never disagree with Sonnet's directive injection because both read from the same Edge Function compute.

- **9F counter eval lives in YourLooksTab, not split between buttons.** Save Feedback & Style Again → and 🔄 Regenerate share the same local `handleRegenerate` (per Session 7b-7 archive — "by design, Session 9 can split them when ratings → Supabase wiring lands"). 9F-A's eval naturally handles both buttons because the rating-state logic is identical regardless of which button triggers it. Splitting buttons was unnecessary churn.

- **9F counter race trade-off — fire-and-forget over await.** Awaiting `updateUser` before `onRegenerate()` would create a ~200ms visual flash (ratings cleared, spinner not yet appeared). Race is rare and benign: the immediate-next generation may see the old counter, but the generation after that always sees the correct value. Spec-compliant — recovery fires "on subsequent generations", not retroactively.

- **9F recovery directive placement — SECOND in stylingLines.** Right after the identity anchor, before weather hint and flags. Sonnet weights early instructions more heavily; identity stays first as the always-on north star; recovery is a session-specific override semantically secondary to identity but primary over weather/flags.

- **9F recent outfits block placement — BETWEEN DRESS RULE and WARDROBE POOL.** WARDROBE POOL stays the LAST thing Sonnet reads — preserves the existing recency bias on actual items. History sits in context-setting territory alongside DRESS RULE.

- **9F item names resolved against UNFILTERED wardrobe pool.** If a recent outfit referenced an item that got filtered out today (e.g. a sandal in snow), it still shows by name in the history block. Filter only affects what Sonnet can SELECT, not what's named in context.

- **9F lazy persistence acknowledged trade-off.** `outfit_history` only contains outfits the user actually interacted with (rated/saved/worn) per Session 9A architecture. New users / users who don't engage have empty history blocks. Acceptable for v1 — engagement is the signal we care about. Could be enriched later by pre-inserting all generated outfits at generation time, but would write hundreds of unused rows per user.

- **9F banner background — sage-pill not cream.** First iPhone test caught that `#E8E4CE` is the YourLooksTab background → sage-on-sage banner invisible. Switched to `rgba(188,199,183,0.30)` (locked sage-pill color, established "Clozie speaks" idiom — same as CLOZIE RECOGNISED success bar, category tag pills, 5+ uses). Clear contrast against cream, no new tokens introduced.

- **9F banner text not italic.** Initial style included `fontStyle: 'italic'`; Grace called for `'normal'` after iPhone test — normal weight reads as more warmly conversational than italic in this context. `fontStyle` line removed (default is 'normal' anyway).

What was deliberately NOT done this session:

- No SYSTEM_PROMPT changes — cache verified at 2,375 tokens after every CLI deploy.
- No `recognize-photo` or `delete-user` Edge Function changes.
- No `src/lib/outfitHistory.js` changes — read-only consumer via Edge Function.
- No `src/lib/wardrobeItems.js` changes.
- No optimistic local state update for "Last worn" after `handleMarkItemsWorn` — deferred to a polish session (new Known Issue updated to reflect this specifically remains).
- No splitting of 🔄 Regenerate vs Save Feedback & Style Again handlers — still share local `handleRegenerate` in YourLooksTab. Session 9F's counter eval lives in that shared path; no split needed.
- No 9I outfit card photo strip changes — verified sized correctly, skipped intentionally.
- No `user_styling_state` table — used `user_metadata` instead.
- No new Supabase schema changes whatsoever — `outfit_history` table from Session 9A reused, `wardrobe_items` table from Session 6A reused.
- No "Save Feedback" button separation from "Regenerate" — still share handler.
- No My Closet redesign — Session 15 territory.
- No diagnostic log cleanup in `generate-outfits` (the three logs from earlier sessions still print; not blocking).
- No warmth UI / SQL backfill — separate warmth session.
- No fix for the `Leather Chelsea Boots` dislikes-filter token escape (Session 7b-7 Known Issue).
- No fix for the missing dislikes-filter log line in Supabase Logs (Session 7b-7 Known Issue).
- No save-to-camera-roll for share card — separate feature, expo-media-library not installed.

Known limitations carried forward / NEW Known Issue:
- Optimistic local update for "Last worn" date — `formatLastWorn` helper renders the date cleanly once items load from DB, but tapping "I wore this today" only updates the DB; local `wardrobeItems` stays stale until sign-out/in or fresh launch. Polish session. (Replaces the pre-9H "raw ISO timestamp" Known Issue, which is now resolved.)

Files changed:
- `App.js` — modified (loading messages, photo height + resizeMode, formatLastWorn helper + render swap, counter logic in handleRegenerate, generationRecoveryMode state + reset + capture, YourLooksTab prop + banner JSX + styles)
- `supabase/functions/generate-outfits/index.ts` — modified (counter read, recoveryMode response field × 3, buildFreshContent recoveryMode arg + recovery directive, outfit_history fetch + recentOutfits resolution, buildFreshContent recentOutfits arg + history block, call site updated × 2)
- `supabase/functions/recognize-photo/` — UNTOUCHED
- `supabase/functions/delete-user/` — UNTOUCHED
- `src/lib/outfitHistory.js` — UNTOUCHED
- `src/lib/outfitGeneration.js` — UNTOUCHED
- `src/lib/wardrobeItems.js` — UNTOUCHED

Three CLI deploys total via `supabase functions deploy generate-outfits --project-ref sbiwuqjnwjgjazxlyfhb --use-api` (no `--yes` flag per Session 7b-6 lesson). Each iPhone-verified before the next.

Commit: TBD on testing branch. Version label: v2026-05-16-session9fhij. Push to remote — Grace's call.

## 2026-05-17 — Session 10A wired (My Closet structural redesign + recovery banner polish)

Sixteenth session of the native-app build. Seven LOW-risk substeps from the locked spec (Clozie_Session15_MyCloset_PinSelector_Spec.docx PART A — PART B pin selector deferred) plus one mid-session UX fix discovered during iPhone testing, all in App.js, each iPhone-tested before the next began. Built on testing branch only — main untouched. Edge Function NOT touched at any point. SYSTEM_PROMPT NOT touched. Prompt cache stays at 2,375 tokens across the session. Zero CLI deploys.

Build order: Step 7 first (recovery banner — most isolated, lowest risk), then Step 2 (comment out old buttons), Step 1 (floating + button), Step 1b (mid-session auto-scroll fix), Step 3 (sticky vibe bar), Step 4 (empty state), Step 5 (hanger placeholder on cards), Step 6 (pencil reposition).

**Step 7 — Recovery banner polish (YourLooksTab).** Single style block edit at `looksStyles.recoveryBanner`. Changed: backgroundColor sage-pill `rgba(188,199,183,0.30)` → white `#FFFFFF`; borderRadius 12 → 14; added `borderLeftWidth: 3` + `borderLeftColor: '#C87A52'` (terracotta accent stripe); paddingVertical 14 → 12; removed marginTop 4 (spec only specifies marginBottom); marginBottom 16 → 14; added shadow `offset {0,1} / opacity 0.06 / radius 4 / elevation 1`. `recoveryBannerText` untouched (still Outfit Regular 14 espresso lineHeight 21). Gating logic (`recoveryMode && hasGenerated && outfits.length > 0`) and copy untouched.

**Step 2 — Comment out old buttons.** Two JSX blocks in WardrobeTab wrapped in JSX comments with `// HIDDEN: Session 10A Step 2 — replaced by floating + button (Step 1) and sticky bar (Step 3)` markers. Nothing deleted. (1) "✦ Add Your First Item / Another Item" button. (2) "Set Today's Vibe →" button. Both `wardrobeStyles.addButton` and `wardrobeStyles.vibeButton` style entries left in place (unused but cheap).

**Step 1 — Floating + button.** New JSX added as absolute-positioned sibling of ScrollView inside KeyboardAvoidingView, gated on `itemCount > 0 && !showAddPanel`. 56×56 circle, borderRadius 28, sage `#BCC7B7` background with 3px white border, shadow offset 0,2 / opacity 0.18 / radius 8 / elevation 6, zIndex 10. White "+" icon as inline SVG: 26×26 viewBox 0 0 26 26 with two `<Line>` elements (vertical 13,4→13,22 and horizontal 4,13→22,13) strokeWidth 2.5 strokeLinecap round. Imports unchanged — `Svg, Line` already in module imports from react-native-svg; `Platform` already imported. onPress: `setShowAddPanel(true)`. Position: Platform-aware `bottom: 150 iOS / 134 Android`. Reasoning: real tab bar measured at ~86px iOS / ~70px Android (44 minHeight + 12 padTop + 30/14 padBottom). Sticky vibe bar (Step 3) sits flush above tab bar at the 86/70 mark. Floating + sits clear of the sticky bar: tab bar 86 + sticky bar 50 + breathing gap 14 = 150 iOS (134 Android with 70 base). Spec's literal 120 would have overlapped tab bar on iPhone; deviation flagged + accepted before applying. `hitSlop` 8 all sides for slightly extended tap target. `activeOpacity` 0.85 for tap feedback.

**Step 1b — Auto-scroll-on-open mid-session UX fix.** During iPhone testing of Step 1, Grace tapped the floating + from the top of a populated closet and the Add Item panel appeared to "not slide up" — it rendered at its same inline JSX position far below the current viewport. Investigation (read-only) confirmed: the panel has never had any animation. It renders inline at its fixed JSX position (after the grid, before the now-commented-out Analyse Wardrobe / Vibe buttons), wrapped in `{showAddPanel && (<View>...</View>)}` — not a `<Modal>`. No `scrollTo` refs existed anywhere in WardrobeTab. Pre-Step-1 the old "✦ Add Another Item" button sat at the BOTTOM of the scroll content, so users had to scroll there to tap it, and the panel naturally appeared in their viewport. Step 1's floating + decoupled the tap location from the panel's render position, exposing the missing auto-scroll behavior. Fix (Option A — auto-scroll, chosen over Option B Modal conversion as smaller change): added `const scrollRef = useRef(null)` and `const hasScrolledForPanelRef = useRef(false)` to WardrobeTab body. Added useEffect that resets `hasScrolledForPanelRef.current = false` whenever `showAddPanel` is false (next open scrolls fresh). Attached `ref={scrollRef}` to the existing ScrollView. Added `onLayout` to the Add Item panel View — when `showAddPanel && !hasScrolledForPanelRef.current && scrollRef.current`, sets the flag true once and calls `scrollRef.current.scrollTo({ y: Math.max(0, y - 12), animated: true })` to land panel header at viewport top with 12px breathing room. Re-layouts during the panel session (typing, photo upload, scanning bar) suppressed by one-shot flag — user keeps scroll control. `useRef` + `useEffect` were already imported.

**Step 3 — Sticky vibe bar.** New JSX added as second absolute-positioned sibling of ScrollView (just after the floating + block). Same `itemCount > 0 && !showAddPanel` gate as floating + — spec said "always visible" but `!showAddPanel` gate flagged + approved to prevent accidental navigation-away mid-add (loses panel state). Full-width sage `#BCC7B7` bar, height 50, position absolute `bottom: Platform.OS === 'ios' ? 86 : 70` (flush above measured tab bar), left/right 0, alignItems/justifyContent center, top-edge shadow offset {0,-2} opacity 0.06 radius 8 elevation 8 zIndex 5. Text "Set Today's Vibe →" centered, `Outfit_500Medium` 15 white. Spec specified weight 600 but Outfit_600SemiBold is not in the existing `@expo-google-fonts/outfit` import (only 400/500/700 loaded) — adding a new weight would require import + fresh font-load cycle at app boot. Swap to 500 flagged + approved as the safer call; white-on-sage reads fine without extra weight. onPress: existing `onGoToVibe` prop (no handler change). `wardrobeStyles.scrollContent.paddingBottom` bumped 40 → 90 statically so last grid items + Add Item panel save button clear the 50px sticky bar. Static bump preferred over conditional — empty state (Step 4) is its own early-return code path, doesn't use the scroll padding.

**Step 4 — Empty state.** New early-return block at the top of WardrobeTab render, just after `handleUploadFile` definition and before the main `return (`. Gated `if (itemCount === 0 && !showAddPanel)`. When user taps the new "+ Add Your First Item" button, `setShowAddPanel(true)` flips the gate false and the normal render path kicks in — at which point the Add Item panel renders inline and the heading/count/progress bar above are visible (the auto-scroll from Step 1b lands user at the panel header). After first save, `itemCount === 1`, `showAddPanel === false` → normal grid render with floating + and sticky bar both visible. Empty-state JSX structure: outer `<KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#E8E4CE' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>` wrapping an `<View style={emptyStateContainer}>` with `flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:32` (initial spec said `paddingTop:80` but Grace asked for true vertical center after iPhone test — applied). Content: 80px sage hanger SVG (via extended TabHangerIcon with `size={80} color="#BCC7B7" strokeWidth={1.6} viewBox="-2 -2 28 28"`), DM Serif Display 22 espresso `#2C1A0E` heading "Every great wardrobe starts with one piece." lineHeight 30 marginBottom 12, Outfit 14 body `#5C4A3A` subtext "Add your first item and let's see what Clozie can do" lineHeight 22 marginBottom 32 maxWidth 320 (trailing ✦ removed on Grace's call after iPhone test), TouchableOpacity pill button with sage `#BCC7B7` background, 2px white border, padding 16/48, borderRadius 100, soft shadow, label "+ Add Your First Item" in `Outfit_500Medium` 15 WHITE per spec. `TabHangerIcon` SVG extended with backward-compatible optional `size = 20` / `color` / `strokeWidth` / `viewBox = '0 0 24 24'` props. Existing tab bar call at the MainAppScreen tab definitions passes only `active` — defaults preserve tab bar visuals exactly. The padded `viewBox="-2 -2 28 28"` for the empty state prevents the hanger hook (which reaches `y=0` in the path) from being clipped at the top when rendered at large sizes — a 1.6 stroke half-extends outside the default `0 0 24 24` viewBox. Old inline `{itemCount === 0 && (<View><Text>👗</Text><Text>Every great...</Text></View>)}` block commented out. Old `wardrobeStyles.emptyState`/`emptyEmoji`/`emptyText` styles left in place.

**Step 5 — Hanger placeholder.** Inside the grid card photo zone (`{item.photoUri ? <Image /> : <Text>👗</Text>}`), the 👗 emoji fallback replaced with a new `<View style={gridCardPlaceholder}>` containing `<TabHangerIcon active={false} size={40} color="#BCC7B7" strokeWidth={1.6} viewBox="-2 -2 28 28" />` and `<Text style={gridCardPlaceholderText}>No photo</Text>`. Placeholder style: full container fill (100%/100%), `rgba(188,199,183,0.18)` soft sage tint background, alignItems/justifyContent center. Caption style: Outfit 10 muted `#A09888` letter-spacing 0.2 marginTop 6. Spec said "sage gradient" — solid sage tint chosen instead (flagged + approved before applying) to avoid adding `expo-linear-gradient` dependency for a barely-visible difference at small card scale. Real photos unchanged. With this change there is no `👗` emoji anywhere in My Closet (grid cards or empty state); confirmed via grep.

**Step 6 — Pencil reposition.** Old over-photo absolute-positioned pencil at `top:6, right:40` (with `editIcon`/`editIconText` styles, white circle background) commented out. Category tag pill below the photo wrapped in a new `categoryTagRow` flex-row container (flexDirection row, alignItems center, justifyContent space-between, marginTop 10, paddingHorizontal 10). The pill remains the row's left child, a new pencil TouchableOpacity becomes the row's right child: no background, just the ✎ glyph in `editPencilText` (Outfit 16 espresso `#5C4A3A`), styled with `editPencil` (paddingVertical 2 paddingHorizontal 4), `activeOpacity` 0.7, `hitSlop` 14 all sides (44px effective tap target). onPress: existing `handleEditItem(item)` — same handler, same Edit Item flow. `categoryTag` style slimmed: removed `alignSelf: 'flex-start'`, `marginTop: 10`, `marginLeft: 10` — the new row container owns positioning now. `categoryTag` was only used in one place (grep verified) so the slim is safe. `categoryTagText` unchanged. Old `editIcon`/`editIconText` styles left in place (unused but cheap). X delete icon at `top:6, right:6` untouched — still floats top-right over the photo. New visual hierarchy on each card: photo (with placeholder if no photo) → sage pill + espresso pencil row → item name → colour → last worn.

What was deliberately NOT done this session:
- PART B of the spec (pin selector redesign for Today's Vibe) — separate session.
- No Edge Function changes whatsoever. `generate-outfits`, `recognize-photo`, `delete-user` all untouched. Zero CLI deploys.
- No SYSTEM_PROMPT changes — cache stays at 2,375 tokens.
- No My Closet code structural refactor — surgical insertions/comments only, all old code commented-out (not deleted) for easy revert.
- No deletion of old `addButton` / `vibeButton` / `editIcon` / `emptyState` / `emptyEmoji` / `emptyText` style entries from `wardrobeStyles` — left in place (unused but cheap during the session). Future polish pass can prune.
- No conversion of Add Item panel to a `Modal` (Option B from Step 1b discussion) — auto-scroll Option A chosen as smaller change.
- No `expo-linear-gradient` dependency added — solid sage tint instead of real gradient for Step 5.
- No new font weight added (Outfit_600SemiBold) for sticky bar — used `Outfit_500Medium` instead.
- No update to the deprecated CLAUDE.md copy at `/Users/grace/Desktop/CLAUDE.md` — only the project copy at `/Users/grace/Desktop/Clozie Native/CLAUDE.md` updated. Grace syncs the Desktop copy manually per established pattern.
- No `searchIcon` added to closet (spec mentioned not showing it during empty state but didn't say to build it during this session).

Known limitations carried forward / new this session:
- Old commented-out JSX blocks and unused style entries (`addButton`, `vibeButton`, `editIcon`, `editIconText`, `emptyState`, `emptyEmoji`, `emptyText`) accumulate in `wardrobeStyles` and WardrobeTab JSX. Cheap during a single session, but a polish pass should prune them before App Store submission.
- The sticky vibe bar overlaps the safe-area bottom-edge on devices with home indicators if the actual tab bar somehow renders shorter than expected. Mitigated by Platform-aware offset (86 iOS / 70 Android) which matches the existing tab bar's own paddingBottom logic.
- Spec PART B (Today's Vibe pin selector redesign) not yet started. Existing pin selector still has the known emoji-thumb / horizontal-scroll-of-everything issue documented in the standing Known Issues list.

Files changed:
- `App.js` — modified (multiple surgical insertions, comments, style additions, one ref + useEffect, TabHangerIcon signature extension)
- `supabase/functions/generate-outfits/` — UNTOUCHED
- `supabase/functions/recognize-photo/` — UNTOUCHED
- `supabase/functions/delete-user/` — UNTOUCHED
- `src/lib/outfitHistory.js` — UNTOUCHED
- `src/lib/outfitGeneration.js` — UNTOUCHED
- `src/lib/wardrobeItems.js` — UNTOUCHED
- `src/lib/clozieRecognition.js` — UNTOUCHED

App.js net diff approximately +180 lines (substantial because comment-out + dual-style cohabitation rather than deletion). Zero net deletions of behavior.

Commit: TBD on testing branch. Version label: v2026-05-17-session10a. Push to remote — Grace's call.

## 2026-05-17 — Session 11 wired (Pin Selector redesign — PART B from Clozie_Session15_MyCloset_PinSelector_Spec.docx)

Seventeenth session of the native-app build. Three LOW-risk substeps (B1 text-only Must Include card → B2 bottom sheet → B3 pin/unpin handler) plus one mid-session chip-stretch fix discovered during iPhone testing, all in App.js, each iPhone-tested before the next began. Built on testing branch only — main untouched. Edge Function NOT touched at any point. SYSTEM_PROMPT NOT touched. Prompt cache stays at 2,375 tokens across the session. Zero CLI deploys. PART A of the Session 15 spec was shipped in Session 10A on 2026-05-17; PART B is now complete in this session — same date.

**Step B1 — Must Include card redesigned text-only.** Old horizontal 👗-emoji thumbnail ScrollView at App.js:2129-2158 wrapped in a JSX comment with the marker `{/* HIDDEN: Session 11 Step B1 — replaced by text-only card + search button. Bottom sheet wires in B2. */}` — nothing deleted. The dead `wardrobeItems.length === 0` ternary inside that block (unreachable since the Session 8 empty-state early-return at App.js:2008 catches an empty wardrobe before the tab body ever renders) dropped along with the commented JSX. Original single-line `vibeStyles.cardSubtext` Text at App.js:2128 replaced with two separate `<Text>` elements: `vibeStyles.mustIncludeLine1` ("Something in mind? Pin it — Clozie builds around it." — Outfit_400Regular 13, `#5C4A3A`, lineHeight 20, marginTop 6) and `vibeStyles.mustIncludeLine2` ("A jacket, a dress, those new shoes." — Outfit_400Regular italic 12, `#A09888`, lineHeight 18). New `mustIncludeRow` flex-row container with the Search button + conditional pinned pill. Search button (`mustIncludeSearchBtn`): flex-row with inline SVG magnifying glass (Circle r=7 stroke `#5C4A3A` + Line handle, same as My Closet header search SVG) + "Search" text in `Outfit_500Medium` 13 espresso. Visual match to My Closet's inactive search button — espresso-tint bg `rgba(44,26,14,0.06)`, border 1.5px `rgba(44,26,14,0.08)`, borderRadius 10, paddingV 8/H 14, hitSlop 6/6/4/4. Spec said "saga tint" (typo for sage); My Closet's inactive search button uses espresso-tint and the Must Include button doesn't toggle (it triggers a sheet rather than a toggle state), so matching the inactive style was the correct interpretation — flagged + applied. Conditional pinned pill (rendered when `pinnedItem` derived const is truthy): bg `rgba(200,122,82,0.08)`, border 1.5px `rgba(200,122,82,0.18)`, borderRadius 100, paddingV 8/H 14. Pill children: `✦` sparkle in `#C87A52` 14 (chosen over star icon/SVG — `✦` is the app's existing brand glyph used 50+ places, keeps vocabulary consistent and saves a new asset) + item name `Outfit_500Medium` 13 `#C87A52` (spec asked weight 600 but Outfit_600SemiBold isn't loaded per CLAUDE.md font config — Session 10A precedent established the swap to 500, deviation accepted) + 20×20 X-circle (`rgba(200,122,82,0.15)` bg, borderRadius 10, hitSlop 14 → 44px effective tap target, `onPress={() => setPinnedItemId(null)}`). Pill itself NOT tappable — only the X — preventing accidental unpins. Conditional muted italic hint `mustIncludeHint` ("No item pinned — Clozie picks freely" — `Outfit_400Regular` italic 12 `#A09888`) renders when `pinnedItem` is null/undefined. New `pinnedItem` derived const at App.js:1973: `const pinnedItem = pinnedItemId ? wardrobeItems.find((i) => i.id === pinnedItemId) : null;` — computed on every render, local to TodaysVibeTab, no state lift. Search button onPress in B1 was a placeholder `console.log('[Pin Selector] Search tapped — sheet wiring lands in B2')` — replaced in B2 with `setSheetVisible(true)`. B1 net new styles in `vibeStyles`: 10 entries (`mustIncludeLine1`, `mustIncludeLine2`, `mustIncludeRow`, `mustIncludeSearchBtn`, `mustIncludeSearchBtnText`, `mustIncludeHint`, `pinnedPill`, `pinnedPillSparkle`, `pinnedPillText`, `pinnedPillX`, `pinnedPillXText`). One honest test limitation flagged before iPhone test: the pinned-pill render path is unverifiable on-device in B1 alone (no way to set pinnedItemId without the sheet wired in B2); confirmed via code-read only at the B1 stage and visually verified end-to-end in B3.

**Step B2 — Bottom sheet for pin selection (render-only).** New `Modal` JSX block inserted between the existing `</ScrollView>` (App.js:2257) and `</KeyboardAvoidingView>` of TodaysVibeTab. `Modal` props: `transparent`, `visible={sheetVisible}`, `animationType="slide"`, `onRequestClose={() => setSheetVisible(false)}`. Inside the Modal: a `modalRoot` flex:1 container holding (a) an absolute-fill `Pressable backdrop` with `rgba(44,26,14,0.35)` espresso-tint bg + `onPress={() => setSheetVisible(false)}` and (b) a sheet `View` positioned absolute at the bottom, height 85% of screen, white bg, borderTopLeftRadius/borderTopRightRadius 20, overflow hidden. Spec said ~80%; bumped to 85% to give the grid room for subtext + search + chips + hint + 2 rows of cards above the fold without forcing scroll — deviation flagged + accepted. Sheet inner content wrapped in a KAV (`flex:1`, `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`) so the search input doesn't get covered when the keyboard rises. Sheet stack top → bottom: (1) 36×4 handle bar centered (`rgba(44,26,14,0.15)`, borderRadius 2, marginTop 10, marginBottom 6); (2) header row with "Pin an Item" DMSerifDisplay_400Regular 20 espresso left-aligned + 32×32 circle X-close button right-aligned (`rgba(44,26,14,0.06)` bg, Outfit 20 espresso glyph, hitSlop 8 → 48px tap target); (3) subtext "Tap any item — Clozie builds every outfit around it." (`Outfit_400Regular` 13 `#5C4A3A`); (4) 40px white search bar (border 1.5px `rgba(44,26,14,0.10)`, borderRadius 10, paddingH 12, marginH 20) with magnifying glass SVG + TextInput (placeholder "Search your closet..." at 0.65 opacity matching Session 8 design system, `paddingVertical: 0` to prevent iOS implicit padding, `autoCorrect={false}`, `autoCapitalize="none"`) + conditional X to clear (rendered when `sheetSearchText.length > 0`, hitSlop 8 → 44px); (5) horizontal category chips ScrollView reusing CATEGORY_CHIPS module constant from App.js:1072 and reusing `wardrobeStyles.categoryChip` / `categoryChipActive` / `categoryChipText` / `categoryChipTextActive` cross-tab (deliberate deviation from the cross-tab-isolation rule used in B1 — chips serve the exact same wardrobe-filtering function in both places and reusing the styles guarantees visual parity; if they drift in future, that's a bug); (6) muted italic "Tap to pin" hint (`Outfit_400Regular` italic 12 `#A09888`, centered); (7) vertical ScrollView flex:1 of 2-column 47%-width grid cards. Grid card structure mirrors My Closet (Session 10A): 150px photo zone (real photo via `Image source={{ uri: item.photoUri }} resizeMode="contain"` else sage `TabHangerIcon` placeholder with `size={40} color="#BCC7B7" strokeWidth={1.6} viewBox="-2 -2 28 28"` + "No photo" muted caption — same padded viewBox pattern from Session 10A preventing hook clip) + category pill (sage `rgba(188,199,183,0.30)` bg + `#5C4A3A` text in `Outfit_500Medium` 11) + DM Serif 16 espresso item name + Outfit 12 `#5C4A3A` colour. Cards have NO pencil-edit and NO X-delete (intentional — different context; pin-selection, not item-edit). When `pinnedItemId === item.id`: card wrapped with `gridCardPinned` style (borderWidth 2.5, borderColor `#C87A52`) + absolute-positioned 24px sage check circle top-right (top 6, right 6, sage `#BCC7B7` bg, 1.5px white inner ring matching the Session 10A floating + button idiom, white `✓` glyph centered in `Outfit_700Bold` 13 lineHeight 14 with `includeFontPadding: false`, zIndex 1). Empty results state: when `sheetFilteredItems.length === 0`, render "No items match" (`Outfit_400Regular` 14 `#A09888`, centered, marginTop 40). New state in TodaysVibeTab: `sheetVisible` (bool, default false), `sheetSearchText` (string, default ''), `sheetSelectedCategory` (string, default 'All'). useEffect watching `sheetVisible` resets `sheetSearchText` to '' and `sheetSelectedCategory` to 'All' whenever the sheet closes — reopens always start fresh, no inherited filter state. Filter source: `sheetFilteredItems = sheetVisible ? filterWardrobeItems(wardrobeItems, sheetSearchText, sheetSelectedCategory) : []` — same `filterWardrobeItems` utility from Session 10B (`src/lib/filterWardrobeItems.js`), cross-tab reuse of the shared filter. Sheet open trigger: B1's Search button onPress placeholder changed from `console.log(...)` to `setSheetVisible(true)`. New `pinSheetStyles = StyleSheet.create({...})` block (24 entries: `modalRoot`, `backdrop`, `sheet`, `handleBar`, `headerRow`, `headerTitle`, `closeButton`, `closeButtonText`, `subtext`, `searchBar`, `searchInput`, `searchClearX`, `chipScroll`, `chipScrollContent`, `tapHint`, `gridContent`, `grid`, `gridCard`, `gridCardPinned`, `gridCardPhoto`, `gridCardPhotoImage`, `gridCardPlaceholder`, `gridCardPlaceholderText`, `checkCircle`, `checkCircleText`, `categoryTag`, `categoryTagText`, `gridCardName`, `gridCardColour`, `emptyResults`) added immediately before the "Your Looks Tab styles" section divider — module-scope pattern matching `wardrobeStyles`/`vibeStyles`/`looksStyles`. All entries use locked palette colors only, no new design tokens introduced. `Pressable` added to `react-native` imports at App.js:14 (only new import this session — `Modal`, `KeyboardAvoidingView`, `Platform`, `TextInput`, `Image`, `Svg`/`Circle`/`Line` were all already imported). Grid card `onPress` in B2 was a placeholder `console.log('[Pin Selector] item tapped — pin wiring lands in B3', item.id)` — wired in B3.

**Mid-session chip-stretch fix.** After B2 verified on iPhone (search, filter, keyboard, dismiss all working), user reported category chips stretching vertically into huge sage rectangles instead of compact pills. Root cause diagnosed: horizontal `ScrollView`'s content container is internally a flex row, where `alignItems` defaults to `'stretch'` on the cross axis (vertical) — chips were stretching vertically to fill whatever vertical headroom the sheet's column-flex KAV gave the chip wrapper. The wrapper itself wasn't strictly content-sized inside the KAV column flex (RN's horizontal-ScrollView intrinsic-height behavior is flaky inside column-flex parents). My Closet doesn't hit this bug because its chip ScrollView lives inside a vertical outer ScrollView where each child sizes to content height (different layout context — vertical scroll column vs flex column with one flex:1 child for the grid). Two surgical fixes inside `pinSheetStyles` only (no JSX changes, `wardrobeStyles.categoryChip` NOT touched — My Closet visual byte-identical): (1) `pinSheetStyles.chipScroll` gained `flexGrow: 0` (locks the ScrollView wrapper to content size, prevents any extra vertical allocation from the column flex) + explicit `height: 56` (defensive against any remaining intrinsic-height oddness; chip content is ~32px so 56 gives breathing room while constraining the wrapper); (2) `pinSheetStyles.chipScrollContent` gained `alignItems: 'center'` (chips center vertically within the wrapper and refuse to stretch on the cross-axis). Verified on iPhone post-fix: chips now compact pills, horizontal scroll preserved, active "All" chip identical to My Closet's active chip. My Closet's chip row re-verified post-fix — visually unchanged.

**Step B3 — Pin/unpin handler wired (one-handler change).** Grid card `onPress` placeholder from B2 (`console.log('[Pin Selector] item tapped — pin wiring lands in B3', item.id)`) replaced with the real handler: if `pinnedItemId === item.id` → call `setPinnedItemId(null)` (unpin, sheet stays open so the user can see the terracotta border + check circle disappear in real time and pick another item); else → call `setPinnedItemId(item.id)` followed by `setSheetVisible(false)` (sets pin to this item AND auto-dismisses sheet — covers both unpinned-tap AND switch-while-already-pinned cases per Grace's confirmed behavior). All other dismiss paths were already wired before B3: header X close button (B2), backdrop tap (B2), X on the terracotta pill on Today's Vibe card (B1). Generate button payload at App.js:2243 already included `pinnedItemId` since the original Today's Vibe build — no wiring needed on the Generate side, the Edge Function's `invalid_pin` gate and pinned-item enforcement (Session 7b-1+) handle everything once the client sets `pinnedItemId`. End-to-end verified on iPhone: tap Search → tap card → sheet closes + pill renders on Today's Vibe with item name → tap X on pill → pill disappears + state cleared → reopen sheet → pin Item A → close → reopen → tap a different Item B → A unpinned automatically + sheet closes + pill switches to B → reopen sheet → grid shows B with terracotta border + check circle top-right → tap that same B card → sheet stays open + border and check circle disappear in real time + pill on Today's Vibe disappears → pin an item → tap Generate → all 3 outfits contain the pinned item (Edge Function enforcement confirmed end-to-end).

**Design / scope decisions made during the session:**

- `✦` sparkle over a star icon/SVG for the pinned pill. The app uses `✦` 50+ places as its brand glyph — using a real star asset would introduce a new visual idiom for no functional gain. Grace confirmed before B1 started.
- `wardrobeStyles.categoryChip` cross-tab reuse vs isolated copy. In B1 the Search button styles stayed isolated in `vibeStyles` because they have different semantics from My Closet's search button (this Must Include button triggers a sheet rather than toggles a search-bar visibility). In B2 the chips DO have identical semantics (wardrobe filtering with the same 7 categories using the same `filterWardrobeItems` utility) — reusing the exact styles guarantees parity. If they ever drift, that's a bug not a feature.
- 85% sheet height vs spec's 80%. With subtext + search + chips + hint stacked above the grid, 80% only showed one row of cards above the fold. 85% shows two rows comfortably without forcing scroll on first open. Grace approved before B2 started.
- Separate `pinSheetStyles` block vs adding to `vibeStyles`. With 24 new entries, a separate module-scope stylesheet keeps `vibeStyles` (already 230+ lines) readable. Matches the existing `wardrobeStyles` / `vibeStyles` / `looksStyles` pattern. Grace approved before B2 started.
- `Outfit_500Medium` for pinned pill text where spec asked weight 600. Outfit_600SemiBold isn't in the existing `@expo-google-fonts/outfit` import (only 400/500/700 loaded). Adding a new weight would require an import change + fresh font-load cycle at app boot — risk not justified for a single use site. Session 10A established the precedent (sticky vibe bar accepted the same swap). Deviation flagged before B1 started.
- `Modal animationType="slide"` over manual `Animated.Value` translate. The slide animates overlay + sheet together from bottom which is slightly less polished than fade-in-overlay + slide-in-sheet, but matches iOS native sheet behavior closely and avoids hand-rolled animation code. Acceptable for v1; flagged as an easy follow-up if it ever feels off.
- `pinnedItemId` state stays local to TodaysVibeTab. Not lifted to MainAppScreen. Not persisted to Supabase or AsyncStorage. Tab unmount or app reload clears it. Same scope as the pre-Session-11 behavior — this session was a redesign of the picker UX, not a change to the persistence model. If we ever want pin-survives-reload, that's a dedicated lift session.
- `Pressable` backdrop + plain `View` sheet (instead of nested Pressables). Taps on empty sheet area don't have to be absorbed by an inner Pressable because the sheet `View` is positioned absolute at `bottom: 0` and the backdrop is positioned absolute behind it via `StyleSheet.absoluteFillObject` — z-order separation means taps on sheet area hit the sheet (which has no `onPress` and just absorbs them), taps anywhere else hit the backdrop's `onPress`. Cleanest standard RN bottom sheet pattern, no `e.stopPropagation()` shenanigans needed.

**What was deliberately NOT done this session:**

- No Edge Function changes whatsoever. `generate-outfits`, `recognize-photo`, `delete-user` all untouched. Zero CLI deploys.
- No SYSTEM_PROMPT changes — cache stays at 2,375 tokens.
- No `pinnedItemId` lift to MainAppScreen.
- No persistence of `pinnedItemId` across tab unmount or app reload.
- No new npm packages — `Pressable` is part of `react-native` core, just wasn't imported yet.
- No new design tokens — every color is from the locked palette.
- No deletion of pre-Session-11 dead code (the old emoji-thumbnail ScrollView JSX is COMMENTED OUT, not deleted, per the cross-session pattern from Sessions 10A/10B). Future polish pass can prune.
- No changes to `filterWardrobeItems` utility — used as-is from Session 10B.
- No changes to the Generate button or its payload — `pinnedItemId` was already in the payload since the original Today's Vibe build.
- No changes to My Closet (the chip-stretch fix is sheet-local; `wardrobeStyles.categoryChip` is byte-identical).
- No fix for the standing Known Issues unrelated to the pin selector (wardrobe loading delay, dislikes filter log line, warmth column NULL, etc.) — out of scope.

**One Known Issue resolved this session:**
- Must Include pin selector (Today's Vibe) needed a full design rethink — RESOLVED by Sessions B1+B2+B3. The horizontal scroll of all wardrobe items with 👗 emoji placeholders is replaced with: (a) a text-only Must Include card showing the pinned state via a terracotta pill, (b) a tappable Search button that opens a bottom sheet with the full pin-selection UI, (c) a category-filtered, name+colour-searchable, 2-column grid of real wardrobe photos inside the sheet, with the currently-pinned item visually distinguished by a terracotta border + sage check circle. Original entry text preserved here: "Must Include pin selector (Today's Vibe) needs a full design rethink — current horizontal scroll of all wardrobe items with emoji placeholders doesn't scale. Shows 👗 instead of real photos. Needs category filter, searchable list, or bottom sheet pattern. Separate design session — not just a photo swap."

**Files changed:**
- `App.js` — modified (5 surgical edits: `Pressable` import, new state hooks + reset useEffect + `pinnedItem` derived const, Search button onPress wiring, full Must Include card body redesign + JSX-comment of old code, full Modal JSX block, grid card `onPress` handler, `pinSheetStyles` block). Net diff approximately +280 lines (substantial because the old code is commented-out rather than deleted, and `pinSheetStyles` adds 24 entries).
- `supabase/functions/generate-outfits/` — UNTOUCHED
- `supabase/functions/recognize-photo/` — UNTOUCHED
- `supabase/functions/delete-user/` — UNTOUCHED
- `src/lib/outfitHistory.js` — UNTOUCHED
- `src/lib/outfitGeneration.js` — UNTOUCHED
- `src/lib/wardrobeItems.js` — UNTOUCHED
- `src/lib/filterWardrobeItems.js` — UNTOUCHED (consumed as-is by the new sheet)
- `src/lib/clozieRecognition.js` — UNTOUCHED

Commit: TBD on testing branch. Version label: v2026-05-17-session11. Push to remote — Grace's call.

## 2026-05-17 — Session 12 wired (Saved Outfits + Search)

Eighteenth session of the native-app build. Six LOW-risk substeps (S0 through S6) each iPhone-tested before the next, all in App.js + one new file (`src/lib/filterSavedOutfits.js`). Built on testing branch only — main untouched. Edge Function NOT touched at any point. SYSTEM_PROMPT NOT touched. Prompt cache stays at 2,375 tokens. Zero CLI deploys. Two distinct architectural achievements: (1) saved outfits now survive app reload via DB load + hydration against wardrobeItems (closing the deferred Step 5 from Session 9C), (2) search UI inside the Saved Outfits modal with text + occasion chip filtering. One bug surfaced mid-session and handed off to Session 13 with full diagnostic plan (see SESSION_13_BRIEF.md at project root).

**Step S0 — New utility `src/lib/filterSavedOutfits.js` (40 lines, dead code on creation).** Pure synchronous function mirroring the `filterWardrobeItems` pattern. Signature: `filterSavedOutfits(savedOutfits, searchText, occasion)`. AND filter: (occasion match OR 'All') AND (search query empty OR matches outfit.name OR matches any item.name OR matches any item.colour). Defensive guards: `Array.isArray` check on input + items array, type-check each string before `.toLowerCase()`. Description / vibe / brief / item.notes deliberately excluded per Session 7b-7 dislikes-filter + Session 7C smart-fallback decisions (free-form text would over-filter). Verified clean app boot post-creation — no callers yet.

**Step S1a — Lift `savedOutfits` to MainAppScreen + fix Remove DB persistence (9 surgical edits in App.js).** State location moved from YourLooksTab (local) to MainAppScreen (lifted). Type changed from `string[]` (outfit IDs) to `SavedOutfit[]` (full outfit objects with `items: WardrobeItem[]`). New `savedOutfits` + `setSavedOutfits` props passed down to YourLooksTab. Inside YourLooksTab, derived `savedIds = new Set((savedOutfits || []).map((o) => o.id))` for O(1) `.has()` lookups across 5 read sites in the render tree (App.js:3278, 3284 swapped from `.includes()` → `.has()`; 5 other sites use `.length` which works identically on object arrays). `toggleSave` rewritten to push/filter outfit objects with newest-first ordering (`[outfit, ...prev]`) matching `fetchSavedOutfits`'s `saved_at DESC` order. Saved screen `.map()` source swapped from `outfits.filter(o => savedOutfits.includes(o.id)).map(...)` to `savedOutfits.map(...)` — reading directly from the lifted array. Latent pre-existing bug fixed: `confirmRemove` handler now calls `onPersistInteraction(outfitToRemove, { saved: false })` BEFORE the setState filter, so the `.find()` closure captures the full outfit object before it's filtered out (the previous code only updated local state, never persisting the unsave to DB — meant Remove was effectively a no-op across reloads). DEMO_MODE `['demo-2']` seed dropped (DEMO_MODE hardcoded false in production; the seed was a string shape that doesn't fit the new object shape; if DEMO_MODE testing returns it'll need its own seed). Side-effect improvement: saved outfits now survive tab switching within a session (previously the `{activeTab === 3 && <YourLooksTab />}` conditional render at App.js:6280 unmounted the local savedOutfits on every tab leave — pre-existing bug, not in scope but fixed by the lift). Verified end-to-end on iPhone including DB column inspection (saved=true with saved_at timestamps; saved=false with saved_at=null on Remove).

**Step S1b — DB load on mount + hydration against wardrobeItems (6 changes in App.js).** Extended `outfitHistory` import to include `fetchSavedOutfits`. New `wardrobeItemsRef = useRef([])` + a small sync useEffect that mirrors `wardrobeItems` into the ref whenever it changes — pattern lets the savedOutfits DB load read the latest wardrobeItems without including it in the load useEffect's deps (avoiding re-fetching on every wardrobe edit). New DB load useEffect with mount-only deps: `await fetchSavedOutfits()` → map each row to `{...row, items: (row.itemIds || []).map((id) => byId.get(id)).filter(Boolean)}` via `wardrobeItemsRef.current` lookup → merge-by-id with current `savedOutfits` (DB version wins for matching IDs, local-only entries from optimistic toggleSave during the load window are preserved). Cancellation flag for unmount safety. New re-hydration useEffect with `[wardrobeItems]` deps: runs whenever wardrobeItems changes, rebuilds `items` array from `itemIds` for every saved outfit — handles edge cases like edited photo URIs (new photoUri surfaces), deleted wardrobe items (silently drop from outfit's items), and the load-order race where savedOutfits loads before wardrobeItems. Existing SIGNED_OUT listener in the wardrobe useEffect extended to also `setSavedOutfits([])` — single listener stays single, no duplicate auth-state subscription. `toggleSave` extended to stamp `itemIds: (outfit.items || []).map((i) => i.id)` on optimistic adds, so the re-hydration effect can rebuild items if wardrobeItems changes after the local save. Three race conditions handled deliberately: wardrobeItems-loads-first (DB load uses ref, hydrates correctly), savedOutfits-loads-first (re-hydration effect catches up when wardrobeItems loads), save-during-load-window (merge-by-id preserves optimistic add). Acknowledged unfixed edge case: unsave during the ~500ms initial load window can theoretically be undone by the DB load completing with the row still `saved=true` — extremely rare, not fixed, similar in spirit to the wardrobe loading race already documented in Known Issues. After S1b, saved outfits survive app reload — the headline win. Verified: save outfit → fully reload Expo Go → outfit still appears in Saved Outfits screen with photo strip + name + items. Cross-session deleted wardrobe item drops cleanly from saved outfit's photo strip without crash.

**Step S2 — Three useState hooks + new `OCCASION_CHIPS` constant (dead state, no consumers).** Module-scope `OCCASION_CHIPS = ['All', 'Casual Day', 'Work · Office', 'Going Out', 'Formal Event', 'Outdoor · Sport', 'Weekend Errands', 'Travel']` placed adjacent to the existing `LOADING_MESSAGES` constant just before `function YourLooksTab`. Byte-verified UTF-8 middot encoding (each `·` is `c2 b7` in UTF-8) matching the canonical strings the Edge Function writes into `outfit_history.occasion` (`occasionOptions` array in TodaysVibeTab at App.js:1992 byte-identical). Three new useState hooks inside YourLooksTab placed after `confirmRemoveId` and before the Share state: `searchVisible` (default false), `searchText` (default ''), `selectedOccasion` (default 'All'). Pure dead state — no consumers yet. Same scaffolding risk profile as S0.

**Step S3 — Magnifying glass + "Search" button in Saved Outfits modal heading row (2 edits).** New `savedStyles.headingRow` style block (flex-row, justifyContent space-between, alignItems center, marginBottom 8). The existing `savedStyles.heading.marginBottom: 8` migrated to `headingRow.marginBottom` so vertical spacing below the row is identical to pre-S3 spacing below the standalone heading (no layout shift). JSX edit: wrapped `<Text style={savedStyles.heading}>Saved Outfits</Text>` in `<View style={savedStyles.headingRow}>...</View>` with a TouchableOpacity Search button on the right, gated `{savedOutfits.length > 0 && (...)}` (empty state has nothing to search). Button reuses `wardrobeStyles.searchButton*` cross-tab — same espresso-tint pill bg `rgba(44,26,14,0.06)` + 1.5px border `rgba(44,26,14,0.08)` + 10px radius + 8/14 padding, same active sage-tint state, same 16×16 SVG (Circle r=7 + Line handle), same hitSlop, same icon stroke and text color swap on active (`#5C4A3A` → `#6B7E65`). Session 11 precedent on cross-tab style reuse: same visual context (both surfaces sit on cream `#E8E4CE` bg), same action (toggle search visibility), pixel-identical pill desired. No new styles created beyond `headingRow`. Verified on iPhone: button renders, active-state color flip works, button absent in empty state.

**Step S4 — 40px white search bar reveal + KeyboardAvoidingView wrap (3 pieces).** KeyboardAvoidingView added around the Saved Outfits modal ScrollView (the modal had no TextInputs in Session 8 so it wasn't wrapped then) — `<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>` wrapping the ScrollView, with `keyboardShouldPersistTaps="handled"` added to the ScrollView itself so the X close button and S5 chips tap through when the keyboard is open. Search bar JSX inserted between the heading row and the empty-state block, gated `{searchVisible && (...)}`. Layout: `View style={wardrobeStyles.searchBarRow}` (40px height, white bg, 10px radius, 1.5px `rgba(44,26,14,0.12)` border) containing magnifying glass SVG + TextInput + X close button. TextInput placeholder "Search your outfits..." at `rgba(44,26,14,0.65)` matching the Session 8 design system, `value={searchText}`, `onChangeText={setSearchText}`, `autoCorrect={false}`, `autoCapitalize="none"`, `returnKeyType="search"`. X close button (18×18 SVG with two diagonal lines forming an X) `onPress={() => { setSearchVisible(false); setSearchText(''); setSelectedOccasion('All'); }}` — full reset on close. Reuses `wardrobeStyles.searchBarRow` + `wardrobeStyles.searchBarInput` cross-tab (Session 11 precedent). After S4: typing in the bar updates `searchText` but nothing filters yet (no consumer); X close button DOES function (clears state and hides bar). Verified on iPhone: bar reveals, keyboard rises, input stays visible above keyboard (KAV working), X clears, no spurious behavior on tab cards beneath while keyboard open.

**Step S5 — 8 occasion chips horizontal scroll (one JSX block inserted).** New `<ScrollView horizontal ...>` block gated `{searchVisible && (...)}` placed between the search bar (S4) and the empty-state block. `OCCASION_CHIPS.map(label => <TouchableOpacity ...>{label}</TouchableOpacity>)` rendering all 8 chips. Each chip uses `wardrobeStyles.categoryChip` + `wardrobeStyles.categoryChipActive` (active when `selectedOccasion === label`) and `wardrobeStyles.categoryChipText` + `wardrobeStyles.categoryChipTextActive`. `keyboardShouldPersistTaps="handled"` so chips tap through open keyboard. The chip ScrollView's outer container is the Saved Outfits modal's vertical ScrollView (same layout context as My Closet's chip row in WardrobeTab) — no Session 11 chip-stretch bug expected here because that bug was specific to the bottom sheet's column-flex KAV directly wrapping chips. Verified on iPhone: 8 chips render as compact pills, horizontal scroll smooth, "All" chip active by default, tapping any other chip toggles active state correctly, X close button clears chip selection back to 'All'. After S5: tapping a chip updates `selectedOccasion` but nothing filters yet (S6 wires that).

**Step S6 — Filter wired end-to-end (4 edits in App.js).** Edit 1: extended `import { filterWardrobeItems }` line with new `import { filterSavedOutfits } from './src/lib/filterSavedOutfits'`. Edit 2: derived values inside YourLooksTab body before the loading early return — `filteredSavedOutfits = searchVisible ? filterSavedOutfits(savedOutfits, searchText, selectedOccasion) : savedOutfits` (when not searching, full list passes through; when searching with default 'All' + empty text, utility returns full list — no-op). `showResultCount = searchVisible && (searchText.trim() !== '' || selectedOccasion !== 'All')` — true when filter has actual content. `resultCountText` computed conditionally: text-query branch wins over chip branch when both are active (`Showing N result${n===1?'':'s'} for ${searchText.trim()}` or `Showing N outfit${n===1?'':'s'} for ${selectedOccasion}`). Pluralization handled properly — minor improvement over My Closet's "N results" hardcoded pattern. `showFilteredEmpty = showResultCount && filteredSavedOutfits.length === 0`. Edit 3: restructured the Saved Outfits modal body — preserved the original "Your saved looks will live here" empty state (gated `savedOutfits.length === 0`), added new `<Text style={wardrobeStyles.searchResultsCount}>{resultCountText}</Text>` line gated `{showResultCount && (...)}` reusing the cross-tab style, added new "No outfits found" centered Text gated `{showFilteredEmpty && (...)}` using new `savedStyles.emptySearchResults` style. Saved outfits list outer condition tightened from `{savedOutfits.length > 0 && (...)}` to `{savedOutfits.length > 0 && !showFilteredEmpty && (...)}`. Inside, "N saved looks" + "Tap an outfit to see the mood board" hint pair now wrapped in `{!showResultCount && (<>...</>)}` — hidden when filter active because the result count line already communicates the relevant number. Map source swapped from `savedOutfits.map(...)` → `filteredSavedOutfits.map(...)`. Edit 4: new `savedStyles.emptySearchResults` entry (Outfit_400Regular 14 `#A09888` centered, paddingTop 40, marginBottom 20) — distinct from `savedStyles.emptyState` (which is the "no saved outfits at all" state). Header `❤️ Saved (N)` pill in the main Your Looks tab stays as TOTAL count, not filtered. After S6: typing in the search bar OR tapping an occasion chip filters the list in real time, result count surfaces above the cards, "No outfits found" replaces cards when zero match, X close button restores full list.

**Bug surfaced mid-S6 testing — FIXED 2026-05-18 (Session 12 wrap-up).** Search by text worked from day one. "All" chip worked (filter no-op). "Casual Day" chip filtered correctly for outfits Grace generated AND saved in the same session. All other occasion chips (Work · Office, Going Out, Formal Event, Outdoor · Sport, Weekend Errands, Travel) initially returned 0 results even when Grace had saved outfits visibly tagged with those occasions in the Supabase dashboard. Diagnostic work performed in-session: (1) source-code byte audit of `OCCASION_CHIPS` (App.js:2834) confirmed clean UTF-8 middot `c2 b7`, 14 bytes for "Work · Office" specifically (hex `576f726b20c2b7204f6666696365`); (2) source-code byte audit of `occasionOptions` in TodaysVibeTab (App.js:1992) confirmed byte-identical to OCCASION_CHIPS; both source-of-truth arrays match for every entry, no mojibake, no zero-width characters, no non-breaking spaces. Initial theory: `upsertOutfitInteraction` writes ALL snapshot fields on every UPSERT including context fields, and Supabase upsert with these columns present overwrites existing values — so context-less subsequent writes (unsave/rate/wear with `lastPayload === null`) clobber `occasion` to NULL on existing rows. Grace's dashboard inspection partially confirmed: most saved rows showed `occasion=NULL`, the exceptions being this-session "Casual Day" generations. The "Work · Office" row with `saved=true` AND `occasion='Work · Office'` visibly present in the DB but still returning 0 results in the chip filter was the one piece the context-clobbering theory couldn't explain — it was punted to Session 13 in SESSION_13_BRIEF.md with an SQL hex-dump diagnostic plan.

**Resolution 2026-05-18 (Session 12 wrap-up).** Grace's new session-vs-reload observation on 2026-05-18 made the bug deterministic from code reading alone — chip filter works after app reload but fails in-session. The SQL hex-dump in SESSION_13_BRIEF.md (kept on disk for reference) was never needed. Root cause was 100% in the optimistic-add path: `toggleSave` at App.js:2989 spread the generated outfit object (which has no `occasion` field — generated outfits from the Edge Function response carry only `{id, vibe, name, description, items, styleMatchScore}`) and stamped only `itemIds`. Local entries had `outfit.occasion === undefined`; chip filter `outfit.occasion !== occ` returned true; outfit dropped from the filtered list. After reload, `fetchSavedOutfits` correctly populates `occasion` via `rowToSavedOutfit`, which is why reload "fixed" the symptom. The "Work · Office" row that confused the original investigation was a same-session save written before Grace switched chips for testing — the chip bug was always in the optimistic-add path, not the DB layer. The original context-clobbering theory was correct as far as it went, just incomplete.

**Fix 1 — chip bug (Step 1B, 2026-05-18).** New `generationContext` prop on YourLooksTab pulls `lastPayload` from MainAppScreen. `toggleSave` now stamps the full shape that `fetchSavedOutfits` returns — `occasion`, `temperature`, `condition`, `indoors`, `brief`, `pinnedItemId`, `rating: null`, `wornDates: []`, `savedAt: nowIso`, `createdAt: nowIso` — onto the optimistic entry. Local shape now matches DB shape exactly. Verified end-to-end on iPhone: generate Outdoor · Sport → save → tap Outdoor · Sport chip → outfit appears; reload → chip still works.

**Fix 2 — preventive context preservation (Step 2, 2026-05-18, `src/lib/outfitHistory.js`).** `buildSnapshot` accepts `isInsert` and gates context fields (occasion/temperature/condition/indoors/brief/pinned_item_id). On INSERT they're written; on UPDATE they're omitted from the upsert payload so Supabase preserves existing DB values. `upsertOutfitInteraction` does one `.maybeSingle()` read at the top (folds in the worn-date dedupe read), passes `isInsert` to both call sites. Stops future context-less writes (unsave/rate/wear with `lastPayload === null` after fresh app reload) from clobbering `occasion` to NULL on existing rows. Cost: 1 extra DB read per save/rate, trivial at scale. Verified on iPhone: cold-start unsave preserves DB `occasion` (would have been NULL before this fix). Pre-existing rows with `occasion=NULL` from prior clobbering stay NULL — regenerate-and-resave the affected test outfits to repopulate via the INSERT path.

**Files changed this session:**
- `App.js` — modified (~+200 lines net across 6 substeps, zero deletions; multiple surgical edits in MainAppScreen state + load useEffects, YourLooksTab signature + body + state hooks + derived values + JSX restructure + style entries, savedStyles new headingRow + emptySearchResults entries)
- `src/lib/filterSavedOutfits.js` — NEW (40 lines, pure utility, exports `filterSavedOutfits`)
- `src/lib/outfitHistory.js` — modified 2026-05-18 (Session 12 wrap-up Fix 2): `buildSnapshot` accepts `isInsert` and gates context fields; `upsertOutfitInteraction` does one `.maybeSingle()` read at top, passes `isInsert` through both call sites
- `src/lib/outfitGeneration.js` — UNTOUCHED
- `src/lib/filterWardrobeItems.js` — UNTOUCHED (consumed as-is for the My Closet search system from Session 10B)
- `src/lib/wardrobeItems.js` — UNTOUCHED
- `supabase/functions/generate-outfits/` — UNTOUCHED (no CLI deploys this session)
- `supabase/functions/recognize-photo/` — UNTOUCHED
- `supabase/functions/delete-user/` — UNTOUCHED
- `CLAUDE.md` — modified (this archive entry + Known Issue + Phase 2 entry + Last-updated paragraph)
- `SESSION_13_BRIEF.md` — NEW (handoff brief for next session)

Edge Function NOT touched at any point. SYSTEM_PROMPT NOT touched. Prompt cache stayed at 2,375 tokens. Zero CLI deploys.

**What was deliberately NOT done this session:**
- No Edge Function changes whatsoever
- No SYSTEM_PROMPT changes — cache stays at 2,375 tokens
- No `src/lib/outfitGeneration.js` changes
- No Supabase table schema changes — `outfit_history` table from Session 9A reused as-is
- No backfill of corrupted DB rows (rows with `occasion=NULL` from prior context-clobbering writes stay as-is; future writes are now correct after the 2026-05-18 Fix 2 — regenerate-and-resave the affected outfits to repopulate via INSERT path)
- No optimistic local state update for "Last worn" after `handleMarkItemsWorn` — still deferred from Session 9H
- No My Closet redesign — Sessions 10A/10B/11 already shipped the Session 15 spec
- No diagnostic log cleanup in `generate-outfits`
- No warmth UI / SQL backfill — separate session
- No fix for the `Leather Chelsea Boots` dislikes-filter token escape (Session 7b-7 known issue)
- No fix for the missing dislikes-filter log line in Supabase Logs (Session 7b-7 known issue)
- No "Saved outfits do not survive app reload" Known Issue entry update — it's now stale (resolved by S1a + S1b) but per RULE 18 it stays as-is until Grace says otherwise; the Session 9C archive note inside it is now incorrect but no edits made

**Known limitations carried forward / new this session:**
- Occasion chip filter returns 0 results for non-"Casual Day" chips — full bug investigation handed off to Session 13 (see SESSION_13_BRIEF.md and the new Known Issue entry). Source code byte audit passed; DB hex inspection pending.
- Pre-existing context-clobbering bug in `upsertOutfitInteraction` partially confirmed (most prior saved rows have `occasion=NULL`); fix drafted but not applied. The drafted fix preserves data integrity going forward but doesn't backfill corrupted rows.
- Race condition (rare ~500ms window) on initial DB load: if user UNSAVES an outfit during the brief load window before `fetchSavedOutfits()` resolves, the DB version (still `saved=true`) wins via the merge-by-id and the unsave gets visually undone. Acceptable trade-off; tombstone tracking would add complexity not worth the rare exposure.

Commit: TBD on testing branch. Version label: v2026-05-17-session12-saved-outfits-search. Push to remote — Grace's call.

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
Updated May 16 2026 — Session 9D/9E/9G wired (Mood Board real photos + Hanger View fix + Share Card). Three visual fixes in App.js shipped in one focused session. Step 1 (9E Hanger View) — five `.image` → `.photoUri` swaps so real wardrobe photos render on the hanger across centre stack, side card, and accessory stack; fallback color block retained. Step 2 (9D Mood Board polaroids) — two surgical edits in `MoodPolaroid` single-item branch + `MoodAccCell` item fall-through; both now render `<Image source={{ uri: item.photoUri }} />` with category color block as fallback; polaroid frame, tilt rotations, layouts A–G, accessory grid math, swatch palette, labels all unchanged. Step 3 (9G Share Card) — `react-native-view-shot@4.0.3` + `expo-sharing@~14.0.8` installed via `npx expo install`; new `ShareCard` component renders offscreen at top:-10000 with watermarked outfit card (photo grid + vibe + name + description + sage "Styled by Clozie ✦ Find us in the App Store" footer); `handleShareOutfit` handler spam-tap-guarded, checks `Sharing.isAvailableAsync()`, waits 300ms, `captureRef → PNG → Sharing.shareAsync` with native share sheet; Share Outfit button at App.js:2820-2826 has `onPress`, `disabled={isSharing}`, label flips to "Preparing…"; YourLooksTab return wrapped in Fragment so ShareCard sibling of ScrollView; caption deliberately NOT pre-filled (expo-sharing is file-only) — on-image watermark is the durable brand mark. Edge Function NOT touched. SYSTEM_PROMPT NOT touched. Cache stays at 2,375 tokens. Zero CLI deploys. Three Known Issues resolved (Mood Board polaroids, Hanger View item.image mismatch, Share Outfit no onPress). All three features iPhone-verified end-to-end.
Updated May 16 2026 — Session 9F/9H/9J wired (Circuit Breaker + My Closet polish + Loading messages). 9J: rotating loading subtitle every 1.5s ("Browsing your closet ✦" / "Mixing and matching ✦" / "Clozie is working her magic ✦"). 9H: grid card photos `resizeMode="cover"`→`"contain"` (no cropping), photo height 120→150, new `formatLastWorn(iso)` helper renders "Last worn: May 16" with `'Never worn'` fallback. 9I: SKIPPED — photo strip already sized correctly. 9F: counter in `user_metadata.consecutive_negative_sessions` (client increments on all-Nope, resets on Love/Like, leaves alone on incomplete) + recent outfit history from `outfit_history` (last 6, item names resolved server-side, "RECENT OUTFITS — avoid repeating" block between DRESS RULE and WARDROBE POOL) + recovery directive prepended to stylingLines when `recoveryMode=true` + sage-pill banner above outfit cards when active. Five LOW-risk substeps across App.js + 3 Edge Function CLI deploys. SYSTEM_PROMPT NOT touched. Cache verified at 2,375 tokens across all deploys. Initial banner background `#E8E4CE` was invisible (sage-on-sage) — fixed to `rgba(188,199,183,0.30)` sage-pill. fontStyle 'italic' removed on Grace's call.
Updated May 17 2026 — Session 10A wired (My Closet structural redesign + recovery banner polish). Seven LOW-risk substeps + one mid-session sub-step in App.js, each iPhone-tested. (Step 7) Your Looks recovery banner restyled: sage-pill → white card with terracotta 3px left-border. (Step 2) Old "Add Another Item" + "Set Today's Vibe →" buttons commented out. (Step 1) Floating sage + button bottom-right with Platform-aware offset clearing tab bar + sticky bar + gap. (Step 1b) Auto-scroll-on-open fix for the pre-existing inline Add Item panel — one-shot `onLayout`-driven `scrollTo` exactly once per open. (Step 3) Sticky 50px sage vibe bar flush above tab bar; `scrollContent.paddingBottom` 40 → 90 to clear. (Step 4) Full-screen empty state — vertically centered 80px sage hanger SVG + DM Serif heading + subtext + sage pill button with white text. TabHangerIcon extended with backward-compatible optional `size`/`color`/`strokeWidth`/`viewBox` props (tab bar call unchanged). Spec's `paddingTop:80` swapped to true vertical center on Grace's call; trailing ✦ on subtext removed on Grace's call. (Step 5) Sage-tint placeholder with 40px hanger + 10px "No photo" replaces 👗 emoji on photo-less cards. (Step 6) Pencil edit icon moved from over-photo to category-tag row (right-aligned, no background circle, espresso 16 glyph). X delete icon untouched. Edge Function NOT touched. SYSTEM_PROMPT NOT touched. Cache stays at 2,375 tokens. Zero CLI deploys.
Updated May 17 2026 — Session 10B wired (My Closet search system). Six LOW-risk substeps + one mid-session search fix, each iPhone-tested. (Step 0) New pure utility `src/lib/filterWardrobeItems.js` — case-insensitive name + colour AND category filter, defensive null/non-array guards; pinned for Pin Selector reuse in Session 11. (Step 1) Three useState hooks in WardrobeTab: searchVisible, searchText, selectedCategory='All'. (Step 2) Magnifying glass + "Search" button added to header row; headerRow justifyContent flex-start → space-between; active state swaps colors to sage tint + `#6B7E65`; hitSlop 6/6/4/4 → ~46px tap target. (Step 3) 40px white search bar revealed when searchVisible=true; magnifying glass + TextInput + X reset; placeholder "Search your closet..." at 0.65 opacity; X clears searchText, resets selectedCategory to 'All', hides bar. (Step 4) 7 category chips horizontal ScrollView (All · Tops · Bottoms · Dresses · Outerwear · Shoes · Accessories); module-scope `CATEGORY_CHIPS` const; active = sage bg + white text + white inner border (deviation from spec's literal "border-color #BCC7B7 + white ring shadow" — chosen for cross-platform consistency, matches Session 10A floating + button idiom); inactive = white bg + body text + faint border. (Step 5) `filteredItems = searchVisible ? filterWardrobeItems(...) : items`; grid swaps `items.map` → `filteredItems.map`; result count "Showing N results for X" when searchVisible && searchText non-empty; 12px Outfit_400Regular color `#A09888`. Header count and progress bar continue to use `items.length` (TOTAL wardrobe). **Interpretation B chosen** (filter active only when searchVisible=true). (Mid-session search fix) `filterWardrobeItems` updated to OR-match name + colour after user reported "black" returning 0 results for items with colour "Jet Black"; notes excluded. (Step 6 read-only) Wardrobe loading delay root-cause diagnosed: race between initial loadItems useEffect and handleAddItem optimistic prepend; recommended fix is merge-by-id in setWardrobeItems setter; deferred. New Known Issue added: Add Item / Edit Item X button inconsistent — sometimes fails to close the panel; when it fails, the sticky vibe bar disappears until scroll/remount; working hypothesis is KAV layout race; root cause needs investigation. Edge Function NOT touched. SYSTEM_PROMPT NOT touched. Cache stays at 2,375 tokens. Zero CLI deploys.
Updated May 17 2026 — Session 11 wired (Pin Selector redesign — Part B of Clozie_Session15_MyCloset_PinSelector_Spec.docx). Three LOW-risk substeps + one mid-session chip-stretch fix in App.js, each iPhone-tested. (B1) Must Include card redesigned text-only: heading + two stacked subtext lines + magnifying-glass + "Search" button + conditional terracotta pinned pill (✦ + name + X) or muted "No item pinned" hint. Old horizontal 👗-emoji thumbnail scroll commented out (not deleted), dead `wardrobeItems.length === 0` ternary dropped. (B2) Bottom sheet at 85% screen height with handle bar + header + subtext + search + 7 category chips (reused `wardrobeStyles.categoryChip` cross-tab) + "Tap to pin" hint + 2-column grid using `filterWardrobeItems`. Pinned card: 2.5px terracotta border + 24px sage check circle top-right (white inner ring). New `pinSheetStyles` block (24 entries). `Pressable` added to react-native imports (only new import). Mid-session chip-stretch fix: chips were stretching vertically into huge sage rectangles — root cause was horizontal ScrollView content-container default `alignItems: 'stretch'` cross-axis interacting with the sheet's column-flex KAV; fixed inside `pinSheetStyles` only (`chipScroll` got `flexGrow: 0` + `height: 56`; `chipScrollContent` got `alignItems: 'center'`). `wardrobeStyles.categoryChip` NOT touched — My Closet byte-identical. (B3) Grid card `onPress` wired: tap already-pinned card → unpin + sheet stays open; tap any other card → set pin + auto-dismiss. End-to-end verified on iPhone: pin from sheet, pill renders, switch pin, unpin from sheet, generate with pin → all 3 outfits contain the pinned item (Edge Function enforcement). pinnedItemId state remains local to TodaysVibeTab — not lifted, not persisted across tab unmount or app reload. Resolves Known Issue about pin selector design rethink. Edge Function NOT touched. SYSTEM_PROMPT NOT touched. Cache stays at 2,375 tokens. Zero CLI deploys.
Updated May 18 2026 — Session 13A wired (quick UI fixes). Five LOW-risk fixes in App.js, each iPhone-verified before the next. (Fix 2) Share Card watermark text reduced to "Styled by Clozie" — removed " ✦ Find us in the App Store" and the trailing sparkle. (Fix 3A) `Keyboard.dismiss()` added before `setShowAddPanel(false)` at all four close sites (X button, Cancel button, handleAddItem save-success, handleSaveEdit save-success); `Keyboard` added to react-native imports. Resolves the KAV layout race from the Session 10B Known Issue. (Fix 3B) X close button swapped to the LEFT of the panel heading inside `addPanelHeader` — JSX order reversed with `justifyContent: 'space-between'`; inline `alignItems` flipped `flex-end` → `flex-start`. Eliminates accidental gear-icon taps. (Fix 4) Plain-text empty-search-results state added to both My Closet and Saved Outfits — no icons, no sparkles. (Fix 1) Splash logo italic "e" upper-right curve no longer clipped — outer `<Text style={splashLogo}>` converted to `<View>` so inner Text children get independent measurement; `lineHeight: 92` added to `splashLogoZie` for vertical italic breathing room; `paddingRight: 8` retained. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys. One Known Issue resolved (X button inconsistent — Session 10B), one added by Step 2 of this session (outside-tap doesn't close Add Item panel — not blocking submission).
Updated May 18 2026 — Session 13B wired (loading messages + sticky pill + consent copy). Three LOW-risk tasks in App.js, each iPhone-verified before the next. (Task 1A) `LOADING_MESSAGES` array grew 3 → 5 entries: added 'Finding your best looks ✦' and 'Almost there ✦' between 'Mixing and matching ✦' and 'Clozie is working her magic ✦'. setInterval unchanged at 1.5s. (Task 1B SKIPPED) Loading subtitle font size stays at 13 — Grace skipped after reality check found loading title at fontSize 20 (bumping subtitle to 17 would have crowded the hierarchy). (Task 2) Sticky vibe bar redesigned from full-width 50px bar to centered floating pill. JSX wrapped existing `<TouchableOpacity>` in `<View style={wardrobeStyles.stickyVibeBarWrapper} pointerEvents="box-none">`. New wrapper style block (position absolute, bottom Platform-aware, left:0 right:0, alignItems:'center', zIndex:5). Pill style rewritten to match empty-state pill design language (height 44, paddingHorizontal 28, borderRadius 22, 2px white border, drop shadow {0,2} opacity 0.10 radius 6 elevation 2). Wrapper pattern with pointerEvents="box-none" chosen over alignSelf:'center' on absolute child for cross-device App Store safety. Pill text "Set Today's Vibe →" unchanged (NO sparkle change). (Task 3) Consent modal: body prose simplified to "Clozie uses Anthropic to create outfit suggestions from your wardrobe details and style preferences. Learn more about how Anthropic handles data at anthropic.com/privacy." with anthropic.com/privacy link byte-identical (same terracotta style, same Linking.openURL, same URL text). Accept button "Accept — I'm ready to style ✦" → "Accept". Title and decline button untouched. All consent logic untouched. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys.
Updated May 17 2026 — Session 12 wired (Saved Outfits + Search). New `src/lib/filterSavedOutfits.js` utility + App.js Saved Outfits modal redesign across 6 LOW-risk substeps. Headline: saved outfits survive reload and cross-session via `fetchSavedOutfits()` + hydration against `wardrobeItems` + lifted state in MainAppScreen. Search UI added inside the Saved Outfits modal — magnifying glass + Search button in heading row, 40px white search bar with X clear, 8 occasion chips horizontal scroll (All + 7 occasions matching Edge Function strings byte-perfect), result count with proper plural, "No outfits found" empty-search-results state. All Session 11 cross-tab style reuse precedent applied (wardrobeStyles.searchButton / searchBarRow / chipsScroll / categoryChip all shared across My Closet, Pin Sheet, and now Saved Outfits search). Pre-existing latent bug fixed in confirmRemove handler — DB persistence of `{ saved: false }` now wired (was local-only before). KeyboardAvoidingView added around the Saved Outfits modal's ScrollView. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys. App.js net diff approximately +200 lines across all 6 substeps. Known Issue surfaced (NOT fixed): occasion chip filter returns 0 results for non-"Casual Day" chips even when `saved=true` rows exist with matching occasion strings. Byte audit of source code passed (c2 b7 clean UTF-8 middot, byte-identical across both `OCCASION_CHIPS` line 2834 and `occasionOptions` line 1992). DB-side hex inspection via SQL pending — diagnostic plan handed off to Session 13 (see SESSION_13_BRIEF.md at project root). S6-fix plan (read-before-upsert preservation of context fields in `upsertOutfitInteraction`) drafted but NOT applied this session — pending root-cause confirmation.

Updated May 19 2026 — Session 13C wired (Hanger View polish + Your Looks photo strip redesign). Five LOW-risk App.js fixes shipped + one attempted + reverted. (Mood Board polaroids) resizeMode="contain" added then reverted — cover reads better in the polaroid frames. (Your Looks outfit card photo strip) Major redesign — 2-col landscape (47% × 80px fixed) → 3-col portrait (30% × aspectRatio 3/4). Per-thumb item name labels removed (heavy truncation at narrow widths; names visible in Mood Board polaroids + Sonnet description). (Saved Outfits) `<Image>` got `resizeMode="contain"` — KEPT. (Hanger View shoes) 105×72 at top:438 → 125×95 at top:455. (Hanger View outerwear card) 76×96 at top:116 → 110×130 at top:120 (two-step — first attempt at top:90 sat at hanger SVG level; final top:120 visibly hangs below). (Dress layout) `hangerSlotDress` 170×380 at top:80 + `hangerSlotShoesDress` 125×95 at top:470 + dress-aware JSX branch — attempted, reverted on Grace's call after iPhone test surfaced awkward side-card overlap. Dress outfits still use `hangerSlotTop` with the awkward empty gap below — known issue, full dress layout redesign deferred. Edge Function NOT touched. SYSTEM_PROMPT NOT touched. Cache stays at 2,375 tokens. Zero CLI deploys.
Updated May 19 2026 — Session 13D wired (Hanger View dress layout fix — closes deferred Step 6 from Session 13C). Three small App.js changes + one mid-session number experiment tried and reverted, iPhone-verified before lock. New `hangerSlotDress` style (185×320 at top:88, alignItems:'center' + justifyContent:'flex-start', overflow:hidden, zIndex:4) + new `hangerImageDress` style (width:'100%', height:'88%' — the key piece). New module-scope const `DRESS_SHOES_TOP = 418` (10px gap from dress hem at y=408; LOCKED). JSX branch: when `dress` exists, render in `hangerSlotDress` with `hangerImageDress`; else render `top` in `hangerSlotTop` (byte-identical). `pants` block unchanged. `shoes` JSX gets inline `[hangerSlotShoes, dress && { top: DRESS_SHOES_TOP }]` override — base style untouched for non-dress outfits. Z-index ladder unchanged — hanger SVG already at zIndex:6 above dress zIndex:4 (brief's Fix 3 unnecessary on inspection). The Image height < container height combined with parent flex-start is the actual fix — neither alone works because `<Image resizeMode='contain'>` centers its scaled photo internally within Image bounds (not via parent flex). Session 13C's prior attempt (170×310 → 170×380, both with `hangerImage` at width:100%/height:100%) failed for exactly this reason — bigger box, same internal-centering, photo still floated. Mid-session experiment (top:82/height:355/DRESS_SHOES_TOP:445) shipped, iPhone-tested, reverted on Grace's call — first version locked. Edge Function NOT touched. SYSTEM_PROMPT NOT touched. Cache stays at 2,375 tokens. Zero CLI deploys.
Updated May 19 2026 — Session 13E wired (Hanger View headless outfit fix + entrance animation). Two LOW-risk phases in App.js only, each iPhone-verified before the next. Phase 1: when no Tops and no Dresses exist in the outfit, the categorisation block at App.js:3599-3612 promotes outerwear to the centre top slot via a derived `directTop`/`sideOuter` pattern — existing `top` const renamed to `directTop`, then `const top = directTop || lightOuter` and `const sideOuter = (top === lightOuter) ? null : lightOuter`. Side-card render gate at App.js:3724 swapped from `{lightOuter && (...)}` to `{sideOuter && (...)}`, three inner refs swapped accordingly. Outerwear in the centre uses existing `hangerSlotTop` (140×158, top:96) — same slot a regular Top would use. Outfits with a real Top or Dress render byte-identical. Phase 2: new staggered drop+fade entrance animation when user opens Hanger View tab or switches outfit. 4 `Animated.Value` refs in YourLooksTab (`hangerCentreAnim` / `hangerPantsAnim` / `hangerShoesAnim` / `hangerSideAnim`) inserted after existing `spinAnim`. New `useEffect` watching `[moodBoardTab, moodBoardOutfit]` runs `Animated.stagger(250, [4× Animated.timing({ toValue: 1, duration: 350, useNativeDriver: true })])` — centre 0→350ms, pants 250→600, shoes 500→850, side 750→1100, total ~1100ms. Six render blocks (dress, top, pants, shoes, light outerwear side card, each of up to 5 accessory cards) wrapped in `Animated.View` reading the appropriate ref. Each style adds `opacity: anim` + `transform: [{ translateY: anim.interpolate([-15, 0]) }]`. For the two rotated card types (light outerwear `-4deg`, each accessory's per-card `pos.rot`), the existing rotation was moved INTO the animated transform array to survive style-array merge order (the animated transform would otherwise silently override the static rotation and un-tilt the cards). Native driver compatible (opacity + transform only). Zero JS thread impact — 5-dot background colour picker stays responsive mid-animation. Initial timing (stagger 150 / duration 200, total ~650ms) shipped, iPhone-tested, felt too fast — Grace called slower; bumped to 250/350 in a separate iPhone-verified edit. Entrance animation only — no continuous sway/idle motion yet, deferred to future session. No new imports (Animated already imported via spinAnim), no new styles. Edge Function NOT touched. SYSTEM_PROMPT NOT touched. Cache stays at 2,375 tokens. Zero CLI deploys.
Updated May 20 2026 — Session 13F wired. Two surgical fixes in App.js. (1) Splash logo baseline fix — added lineHeight: 92 to splashLogoClo style to match splashLogoZie, aligning "Clo" and "zie" to the same baseline. (2) Saved Outfits item chip emojis removed — line 4078 changed to render only item.name without getCategoryEmoji prefix. getCategoryEmoji function untouched (still used in 3 other photo-thumbnail fallback locations). Edge Function NOT touched. SYSTEM_PROMPT NOT touched. Cache stays at 2,375 tokens. Zero CLI deploys.
Updated May 20 2026 — Session 13G wired (haptics + LayoutAnimation + heart save pulse). Three LOW-risk tasks in App.js + one new dependency. Pre-step 0: `npx expo install expo-haptics` → expo-haptics ~15.0.8 (SDK-54). (Task 1) `import * as Haptics from 'expo-haptics'` added; five haptic moments — Medium on `handleGenerate` (covers Generate + Regenerate + Save Feedback), Light on `toggleSave` gated by `isSavingNow` (save buzzes, unsave silent), Light on pin-sheet grid card onPress, Light on pinned-pill X onPress (expanded from single-line arrow to block body), Success on `runRecognition` immediately after `setRecognitionStatus('success')`. All fire-and-forget, non-blocking. (Task 2) LayoutAnimation added to react-native imports; `configureNext(easeInEaseOut)` injected before the two My Closet `setItems` mutations — App.js:1140 (add) + App.js:1252 (delete). Edit path not animated (in-place mutation, no reflow). Android UIManager enable deliberately skipped — iOS works without it. (Task 3) Heart save pulse on Your Looks outfit cards. New `saveAnim = useRef(new Animated.Value(1)).current` + `savingOutfitId` state in YourLooksTab grouped with existing Animated.Values. Save button Text wrapped in Animated.View with conditional `transform: [{ scale: saveAnim }]` only when `savingOutfitId === outfit.id` (Approach A — whole button text scales together, Grace's call over the split heart/label Approach B). Spring sequence inside `toggleSave`'s `if (isSavingNow)` gate: `setSavingOutfitId` → `saveAnim.setValue(1)` → two chained `Animated.spring` (up to 1.12, back to 1.0) with friction/tension tuned to ~400ms total; completion callback clears savingOutfitId. Native driver, zero JS thread impact. Unsave path: no animation, no haptic, instant icon swap per brief. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys.
Updated May 20 2026 — Session 13H wired (My Closet empty state hanger drawing animation). Phase 1 (stagger-draw the hanger SVG) + Phase 3 (text + button fade-in) wired in App.js only — Phase 2 (settle bounce) deliberately skipped per Grace's call. Reality check: `react-native-reanimated` NOT installed, `react-native-svg 15.12.1` already installed with `Path` already imported, `Animated` already used elsewhere — zero new dependencies needed. (Step 1.1) New local component `AnimatedEmptyStateHanger` inserted directly below `TabHangerIcon` (parallel component, `TabHangerIcon` completely untouched, three other callers byte-identical). Hanger SVG split into TWO `<Path>` elements: hook circle + stem-and-bar (absolute `M12 4` on second path because original used relative `m0 0` from current point after hook's `z`-close). JSX at empty state swapped from `<TabHangerIcon ... size={80}>` to `<AnimatedEmptyStateHanger ... size={80}>`. Static visual parity iPhone-verified before adding animation. (Step 1.2) `const AnimatedPath = Animated.createAnimatedComponent(Path)` at module scope. Two `useRef(new Animated.Value(100)).current` refs (`hookOffset` + `barOffset`, both invisible at 100). `useEffect([])` runs `Animated.sequence([timing(hookOffset, 0, 400ms), timing(barOffset, 0, 1100ms)])`. Both `<Path>` swapped to `<AnimatedPath>` with `strokeDasharray={100}` + `strokeDashoffset={hookOffset/barOffset}`. Hardcoded 100 dash length is safely larger than both real path lengths (hook ~12, bar ~44) so invisible at offset 100, fully drawn at offset 0. `useNativeDriver: false` because react-native-svg stroke props don't qualify — fine, animation is tiny. Re-mount mechanic confirmed: gate `itemCount === 0 && !showAddPanel` at App.js:1400 — add an item, component unmounts; delete all items, remounts + useEffect re-fires + animation replays. (Step 3.1) New local component `AnimatedEmptyStateText({ children })` below `AnimatedEmptyStateHanger`. Single `Animated.Value(0)` drives both opacity + translateY via interpolation `[0,1] → [10,0]`. `useEffect([])` runs `Animated.timing(textAnim, 1, 500ms, delay: 1500ms, useNativeDriver: true)` — 1500ms delay matches end of hanger draw (400+1100). Returns `<Animated.View style={{ width: '100%', alignItems: 'center', opacity, transform: [{ translateY }] }}>` — preserves the centering parent `emptyStateContainer` was doing for the three loose siblings. No layout shift during 1.5s wait — opacity:0 elements still occupy layout space. JSX at empty state: heading + subtext + button wrapped in `<AnimatedEmptyStateText>...</AnimatedEmptyStateText>`; hanger View stays outside the wrapper. (Mid-session size bumps) Hanger size iPhone-tested at 80 → 100 → 120; final 120 locked. `TabHangerIcon` and its three other callers byte-identical throughout. Timing summary: t=0 hook starts, t=400 bar starts, t=1500 text fade starts, t=2000 fully settled. App.js net diff +93 / -14 lines across 5 edits in 2 regions. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys.
Updated May 20 2026 — Session 13I wired (AI consent revoke — Apple 5.1.2(i) compliance gap closed). Three LOW-risk substeps in App.js only, each iPhone-tested before the next. (Step 1) New `handleRevokeConsent` async handler in MainAppScreen mirrors `handleAcceptConsent`'s optimistic pattern (`setConsentGiven(false)` → best-effort `supabase.auth.updateUser({ data: { ai_consent_given: false } })` with try/catch). Passed as `onRevokeConsent` prop to SettingsScreen via expanded multi-line render call. SettingsScreen signature extended. (Step 2) New `showRevokeConsentModal` state in SettingsScreen. New "Styling Permissions" row appended to Settings DATA card (label + "Manage your consent for Clozie styling" subtitle + `Revoke` gold link). Tap opens confirm modal byte-mirroring Clear Clozie's Memory structure — heading "Revoke Styling Permissions?", body "This will require you to re-accept before Clozie can generate outfits. Continue?", sage "Yes, revoke", outlined Cancel. Zero new styles (full cross-component reuse of `settingsStyles` row + `savedStyles` confirm-modal styles). Row always visible regardless of `consentGiven`. (Step 3) New `revokeFlash` state + useEffect with `setTimeout(1500)` + `clearTimeout` cleanup → 1.5s inline "Consent revoked" plain body-color text (inline style `#5C4A3A` + Outfit_500Medium 14pt, NO sparkle per directive) replaces the `Revoke` link, then swaps back. "Yes, revoke" onPress: close modal → `onRevokeConsent()` fire-and-forget → start flash. LANGUAGE RULE compliance: all user-facing copy uses "Styling Permissions" / "Clozie styling" / "Clozie can generate outfits" — never says "AI" (initial session brief's "AI Data Consent" wording caught + replaced before code touched the file). Verified end-to-end on iPhone across all 6 checks including sign-out/sign-in auth-cycle persistence + regression checks for Clear Clozie's Memory + Change password + Sign Out. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,375 tokens, zero CLI deploys.
Updated May 21 2026 — Session 14A wired (Privacy Policy + Terms of Service WebViews in Settings). Three LOW-risk substeps + one new dependency. (Step 1) `npx expo install expo-web-browser` → `expo-web-browser ~15.0.11` (SDK-54). `app.config.js` plugin entry deliberately skipped (only needed for `openAuthSessionAsync`, not `openBrowserAsync`). (Step 2) New `import * as WebBrowser from 'expo-web-browser';` at App.js:37 + new `PRIVACY_POLICY_URL` + `TERMS_OF_SERVICE_URL` Termly constants at App.js:56-58 (both verified live HTTP/2 200 before wiring). (Step 3) New LEGAL `<View style={settingsStyles.card}>` inserted between ABOUT and Sign Out with two rows ("Privacy Policy" / "How we handle your data" / gold `View`; divider; "Terms of Service" / "How Clozie works for you" / gold `View`), each onPress → `WebBrowser.openBrowserAsync(URL).catch(() => {})`. Zero new style entries — full reuse of existing `settingsStyles.cardRow` / `cardRowLabel` / `cardRowValue` / `goldLink` / `divider`. `expo-web-browser` chosen over `Linking.openURL` for in-app Safari View Controller sheet (user stays inside Clozie). `Linking` import untouched (still used by consent modal). Visual hierarchy in Settings: ACCOUNT → DATA → ABOUT → LEGAL → Sign Out. Closes the Phase 3 App Store legal-doc spec gap. Edge Function NOT touched. SYSTEM_PROMPT NOT touched. Cache stays at 2,375 tokens. Zero CLI deploys.

Drop this file into the root of the clozie-native project folder.
Drop App_ORIGINAL.jsx in the same folder as reference.
Claude Code reads CLAUDE.md automatically at the start of every session.
