# CLOZIE — Archive

This file holds dated session-history and other archived content moved out of CLAUDE.md starting 2026-06-15. It is NOT auto-loaded by Claude Code at session start — read on demand if you need historical context.

Content here is preserved exactly as it was written in CLAUDE.md before the slim-down (per the "never delete — only move" rule). Standing rules, current state, and locked decisions live in CLAUDE.md. If you find yourself needing to consult this archive frequently for the SAME fact, that fact probably belongs lifted up into CLAUDE.md as a standing rule.

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

## 2026-05-23 — Session 17F wired (SYSTEM_PROMPT Rule 13 + 3-check server-side outfit validation)

Nineteenth Edge Function session. Three CLI deploys to `generate-outfits`, each iPhone-verified before the next. Built on testing branch only — main untouched. App.js NOT touched at any point. Closes the May 19 (Session 13C) Known Issue about Sonnet generating outfits with two bottoms and no top, or bottoms + accessories + shoes only, AND the residual "Top + 2 Bottoms" (e.g., shirt + skirt + pants) edge case in one session.

**Deploy 1 — Rule 13 added to SYSTEM_PROMPT.** Single line inserted between Rule 12 and the VOICE section (line 129 in index.ts post-edit). Text: `13. STRUCTURE: Every outfit MUST include at least one Top or one Dress. A Dress replaces both Top and Bottom. Never output two Bottoms in one outfit. Never output an outfit built from only Accessories, Bottoms, and Shoes — the core upper piece must always be present.` Single em-dash, zero middots. UTF-8 byte-verified before deploy: em-dash count 33 → 34, em-dash hex bytes confirmed `e2 80 94` (real UTF-8 — no MacRoman mojibake), zero `‚Äî` / `¬∑` sequences anywhere in the prompt. SYSTEM_PROMPT byte length 8,701 → 8,971 (+270 bytes). Cache tokens 2,375 → 2,442 per Anthropic's tokenizer (verified via `cache_creation_input_tokens: 2442` on Call 1 + `cache_read_input_tokens: 2442` on Call 2 within 5-min TTL). Headroom above 2,048 caching threshold: 394 tokens / ~19% (was 327 / 16% — slight improvement). Cache reset cost ~$0.009 one-time. Format matches existing rules (single line, no wrapping in source).

**Deploy 2 — Server-side structural validation Check 1 + Check 2.** Inserted in `if (mapped)` block at lines 1411-1472 of index.ts. Three pieces of logic between `const mapped = validateAndMapOutfits(...)` and the `jsonResponse(...)` return:

(1) **Lookup map.** `const itemById = new Map(items.map(i => [i.id, i]))` — built once from the in-scope `items: Item[]` array. Needed because `mapped` outfits carry item UUIDs only (no category field) per `validateAndMapOutfits` return shape; category must be looked up via the source items array. Reused by all three checks.

(2) **Check 1 — Top/Dress requirement.** For each of the 3 mapped outfits, scan its `items: string[]` UUIDs, look each up in `itemById`, check if `item.category === 'Tops' || item.category === 'Dresses'`. Outfits with zero matches added to `malformedIndices: number[]`. If any malformed, call `buildSmartFallback(fallbackPool, pinned, occasion)` ONCE with `fallbackPool = filteredItems.length >= 5 ? filteredItems : items` (same soft-fail revert as line 1432). Positionally replace malformed outfits: `mapped[idx] = replacements[idx]` — chosen over the brief's literal "pick the first one" to preserve smart-fallback's 3-distinct-outfits property when 2 or 3 outfits need replacement (deviation flagged + applied). `try/catch` around `buildSmartFallback` — on throw, log warn `[generate-outfits] structural fix: smart fallback threw, leaving outfits as-is` and leave malformed outfits in place (graceful — the Session 13E client-side Hanger View outerwear-promotion fallback rescues the visual; request never crashes; user never sees an error). New log line on successful replacement: `[generate-outfits] structural fix: replaced outfit N (missing Top/Dress)`.

(3) **Check 2 — Accessories trim.** For each outfit (post-Check 1 and post-Check 3), if `items.length > 6`, partition into nonAcc (Tops/Bottoms/Dresses/Outerwear/Shoes) and acc (Accessories) via `itemById.get(id)?.category` lookup. Compute `accBudget = Math.max(0, 6 - nonAcc.length)`. Trimmed array = `[...nonAcc, ...acc.slice(0, accBudget)]`. Defensive `if (trimmed.length >= 1)` floor prevents ever producing a 0-item outfit. New log line: `[generate-outfits] structural fix: trimmed outfit N from X to 6 items`.

**Dynamic source field.** New `const finalSource = allReplaced ? 'fallback' : 'sonnet'` (where `allReplaced = malformedIndices.length === mapped.length`). Success log uses template literal `[generate-outfits] success — ${finalSource}, 3 outfits returned`. Response uses `source: finalSource` instead of hardcoded `'sonnet'`. Semantics: a single bad outfit getting replaced doesn't demote the whole batch to fallback — only an all-3-replaced batch becomes `'fallback'`.

**Deploy 3 — Check 3 (Bottoms dedupe with pinned-preference).** Inserted between Check 1 (lines 1418-1441) and Check 2 (lines 1460-1478) at lines 1443-1458 of post-Deploy-3 index.ts. For each of the 3 mapped outfits: filter `items` for `category === 'Bottoms'` into `bottomIds`; if `bottomIds.length > 1`, compute `keepId = (pinned && bottomIds.includes(pinned.id)) ? pinned.id : bottomIds[0]` — pinned-preference deviation from the literal spec ("keep only the first Bottom") was flagged before any code change and applied because the literal would break `validateAndMapOutfits` line 714's pinned-item contract in the case where the user pins a Bottom (e.g., a skirt) and Sonnet adds another Bottom (e.g., jeans) — naïve `items[0]` would remove the pinned skirt and leave the jeans, silently violating the contract. Build `toRemove = new Set(bottomIds.filter(id => id !== keepId))`; mutate `mapped[i].items = mapped[i].items.filter(id => !toRemove.has(id))`. New log line: `[generate-outfits] structural fix: removed duplicate Bottom from outfit N` (singular per spec, even when 2+ removed — cosmetic, matches literal spec text). Pure filter operation, never crashes, never reduces outfit below valid structure (Check 1 already guaranteed Top/Dress present so removing Bottoms can't strip the outfit to nothing).

**Check execution order: Check 1 → Check 3 → Check 2.** Reasoning: Check 1 replaces malformed outfits wholesale via `buildSmartFallback` (those replacements come from Session 7C smart-fallback layouts which use one Bottom per outfit by design, so Check 3 finds nothing to dedup on them). Check 3 then dedupes Bottoms on the post-Check-1 outfits. Check 2 runs last so it sees the post-dedup `items.length` count — avoids wasted trim work on items we just removed. Comments at lines 1414-1416 list checks in execution order.

**SYSTEM_PROMPT NOT touched in Deploy 2 or Deploy 3.** Byte length stayed at 8,971. em-dash count stayed at 34. Cache stayed at 2,442 tokens (verified via Supabase Logs post-Deploy-2 AND post-Deploy-3 — `cache_read_input_tokens: 2442` on every call after both deploys).

**End-to-end iPhone verification.** Cache verified 2,442 across all calls after all three deploys. All test generates returned `source: 'sonnet'` (Rule 13 alone is sufficient on tested wardrobes; server-side checks all dormant as designed). Zero `structural fix:` lines fired across multiple test generates on healthy wardrobes (across Outdoor · Sport, Casual Day, Going Out, Work · Office, including generations with a Bottom pinned). Zero `unexpected error` lines, zero 500s. Outfits visibly structurally normal — every outfit shows a top or dress, exactly one Bottom, no jeans+skirt collisions.

**Design decisions made during the session:**

- **Positional replacement over single-index in Check 1.** Brief said "pick the first one as the replacement"; instead used `replacements[idx]` (positional). Reasoning: if 2 outfits are malformed, using `replacements[0]` twice would clone one fallback outfit; positional preserves Session 7C's 3-distinct-outfits property. Pure improvement, deviation flagged + applied.
- **Graceful try/catch on `buildSmartFallback` in Check 1.** Rejected "bubble the throw to the outer 500 handler" — that would crash a request just because the safety net itself failed. Chose log warn + leave malformed outfits as-is, relying on the Session 13E client-side Hanger View fix as third-line defense.
- **Pinned-preference in Check 3.** Grace's literal spec was "keep only the first Bottom"; Claude flagged the pinned-item bug (`validateAndMapOutfits` line 714 invariant would silently break if user pinned a Bottom and Sonnet added another, naïve `items[0]` would remove the pinned one); Grace approved the one-line conditional `keepId = (pinned && bottomIds.includes(pinned.id)) ? pinned.id : bottomIds[0]` to make the fix robust regardless of Sonnet's non-deterministic `items[]` ordering.
- **Source stays 'sonnet' unless ALL 3 replaced.** A single-outfit replacement is still a Sonnet-driven generation overall — the user's preferences, brief, recovery mode, weather hints, recent outfits all came from the Sonnet pipeline. Only full-batch replacement deserves the 'fallback' source label.
- **Map<id, Item> lookup once per request.** Built at start of validation block, reused across all three checks. Avoids O(n) array scans inside hot loops.
- **Check execution order Check 1 → Check 3 → Check 2.** Comments at lines 1414-1416 reflect execution order, not numeric labeling order. Numbering preserved for narrative clarity (Check 3 was added later) and to match log line conventions.
- **No new file created, no new dependencies, no App.js changes, no new style entries.** Edge Function only.

**What was deliberately NOT done this session:**

- No App.js changes (Session 13E client-side Hanger View outerwear-promotion fallback stays in place — now serves as third-line defense rather than primary visual rescue).
- No changes to `validateAndMapOutfits`, `buildSmartFallback`, `buildStubOutfits`, `applySafetyFilters`, `buildFreshContent`, `callAnthropic`, or any other pre-existing function.
- No changes to `recognize-photo` or `delete-user` Edge Functions.
- No changes to Supabase tables.
- No removal of the Session 13E client-side fix — kept as belt-and-suspenders.
- No diagnostic log cleanup in `generate-outfits` (Session 7b-6 era logs still print; not blocking).
- No upgrade of Supabase CLI from v2.98.2 → v2.101.0 (CLI prompted; declined mid-session to avoid unnecessary risk).

**Known limitations / new this session:**

- Smart fallback throw path is now reachable from two call sites (the existing Session 7C line ~1432 for full-batch fallback, AND the Session 17F Check 1 line ~1431 for single-outfit replacement). If a future change breaks `buildSmartFallback`, BOTH paths surface the failure — single-outfit path falls through gracefully (warn + leave outfits); full-batch path falls through to `buildStubOutfits`. Both safety nets remain.
- Check 3 log line says "Bottom" singular even when 2+ Bottoms are removed (e.g., outfit with 3 Bottoms — keep 1, remove 2, log once with "Bottom" singular). Cosmetic; matches Grace's literal spec text. Could pluralize in a future polish pass if production telemetry shows multi-Bottom outfits at non-trivial rate.

Files changed:
- `supabase/functions/generate-outfits/index.ts` — modified (+1 line for Rule 13 in Deploy 1; +51 lines for Check 1 + Check 2 in Deploy 2; +18 lines for Check 3 in Deploy 3; total +70 lines net, 1,462 → 1,532)
- `App.js` — UNTOUCHED
- `supabase/functions/recognize-photo/` — UNTOUCHED
- `supabase/functions/delete-user/` — UNTOUCHED
- All `src/lib/*` files — UNTOUCHED
- All Supabase tables — UNTOUCHED

Three CLI deploys total via `SUPABASE_ACCESS_TOKEN=$(security find-generic-password -s 'supabase-pat-clozie' -w) supabase functions deploy generate-outfits --project-ref sbiwuqjnwjgjazxlyfhb --use-api` (no `--yes` flag per Session 7b-6 lesson). Each iPhone-verified before the next.

Commit: TBD on testing branch. Version label: v2026-05-23-session17f-rule13-validation-bottoms-dedupe. Push to remote — Grace's call.

## 2026-05-26 — Session 20 wired (This Week You Wore / Your Week calendar pill)

Twentieth session of the native-app build. Eight LOW-risk substeps (S1 → S8) plus 2 follow-up edits, each iPhone-tested before the next began. Built on testing branch only — main untouched. Edge Function NOT touched at any point. SYSTEM_PROMPT NOT touched. Prompt cache stays at 2,510 tokens. Zero CLI deploys. Zero new dependencies. Zero Supabase schema changes. App.js + src/lib/outfitHistory.js touched; nothing else.

Closes the May 13 2026 Feature Map line "This Week You Wore" under Free Plan. UI-only feature reading existing `outfit_history.worn_dates` (JSONB array of ISO timestamps populated by Session 9B's "I wore this today" flow). RLS-scoped to current user via existing schema; no policy changes needed. Explicit distinction documented: "This Week You Wore" (calendar pill viewing existing data, FREE) is DIFFERENT from "Outfit Wear History" (Pro Phase 4 advanced wear analytics + Clear Out + Trip Planner integration).

Pre-session planning surfaced 5 honest concerns + 5 open questions before any code touched. Grace answered all 5 in one message (sheet title "Your Week", day-card design = mini white card with vibe eyebrow + DM Serif name + horizontal photo strip, default selectedDay = today, include optimistic update, free tier not Pro-gated). One concern (UTC dedupe vs local display) accepted as pre-existing behavior carried forward + documented as Known Issue going in.

What was wired (in build order):

(S1) `fetchWornOutfits()` helper added to `src/lib/outfitHistory.js` between `rowToSavedOutfit` and `markItemsWorn`. Selects all outfit_history rows for current user, client-filters non-empty `worn_dates`, maps via existing `rowToSavedOutfit` (zero duplication — that helper returns the full row shape including wornDates). Pure dead code on creation.

(S2) Seven surgical edits in App.js for wornOutfits state + load. Import extended to include fetchWornOutfits. New `wornOutfits` useState in MainAppScreen alongside savedOutfits. setWornOutfits([]) added to existing SIGNED_OUT branch + to handleClearMemory (since clearClozieMemory deletes outfit_history rows). New mount-load useEffect mirroring savedOutfits load — uses wardrobeItemsRef.current for hydration, merge-by-id keeps optimistic local entries during load window. New re-hydration useEffect on `[wardrobeItems]` rebuilding items from itemIds (mirrors savedOutfits re-hydration byte-for-byte). `wornOutfits` + `setWornOutfits` drilled into YourLooksTab.

(S3) 📅 pill in YourLooksTab heading row. Initial diff proposed white pill chrome (bg + border + borderRadius 20 + paddingV 6 / paddingH 12); Grace rejected and locked plain-emoji style matching Saved button exactly (`minHeight: 44, paddingHorizontal: 4, justifyContent: 'center'`). Apple HIG audit before applying: minHeight 44 ✓ height; visible width fails 44pt at fontSize 16 emoji (~22-26px visible + paddingH 4 — fixed via `hitSlop: {top: 10, bottom: 10, left: 14, right: 14}` giving ~50×54px effective tap target (avoids violating "match Saved exactly" via paddingH bump or oversized emoji). Mid-substep iteration: emoji fontSize 13 → 16 after Grace iPhone-flagged 📅 looking smaller than ❤️ in "❤️ Saved (5)" at fontSize 13 (calendar has dense detail; heart is simple silhouette). accessibilityLabel="Your Week" + accessibilityRole="button" per Session 19C audit pattern.

(S4) Bottom sheet shell. New weekSheetVisible useState. New Modal JSX inserted between `</ScrollView>` and `<ShareCard>` in YourLooksTab (sibling of main ScrollView, cleaner than nesting like Saved Outfits modal does). Reuses `pinSheetStyles` cross-tab for modalRoot/backdrop/sheet/handleBar/headerRow/headerTitle/closeButton/closeButtonText (Session 11 precedent). 85% sheet height per brief. NO KeyboardAvoidingView (no TextInput; Pin Sheet's KAV was for search). Title "Your Week" + X close (hitSlop 8 all sides for 48px tap target). `Pressable` import already in scope. Empty content area placeholder for S5/S6.

(S5) Week-dot row + date-range subtitle. New module-scope date helpers inserted after `formatLastWorn` at App.js:1143 — `toLocalYMD(date)` returns local YYYY-MM-DD via getFullYear/getMonth/getDate (NOT UTC via toISOString — critical so users see wears bucketed by THEIR calendar day); `getMondayOfWeek(date)` returns Monday-of-week via `getDay() === 0 ? -6 : 1 - day` offset; `buildWeekDays(monday)` returns 7-element array; `formatWeekRange(monday)` returns "May 25 – 31" with en-dash U+2013 (UTF-8 byte-perfect via Edit tool — no clipboard MacRoman risk per Session 7b-6 lesson) + multi-month spans ("December 30 – January 5"). Plus `WEEK_DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']` const. New `selectedDay` useState with `useState(() => toLocalYMD(new Date()))` lazy initializer + useEffect on `[weekSheetVisible]` re-syncing to today on every sheet open (matches Pin Sheet filter-reset pattern). JSX adds subtitle Text + dot row View; each of 7 columns is TouchableOpacity with letter + 28×28 date wrapper + 8×8 dot. Selected wrapper sage `rgba(188,199,183,0.30)` tint (locked category-pill color). accessibilityLabel/Role/State per HIG audit. New `weekSheetStyles` block inserted after `pinSheetStyles` (~App.js:9762) containing dateRangeSubtitle / dotRow / dayColumn / dayLabel / dateNumberCircle / dateNumberCircleSelected / dateNumber / dot / dotHollow / dotFilled — `dotFilled` is dead code in S5 (forward-compat for S6). HIG audit: dayColumn minWidth 36 + paddingH 4×2 + hitSlop 8 vertical / 4 horizontal → effective ~77×52 tap target; day-label fontSize 11 (HIG min). All ✓.

(S6) Dot fills + day-content mini cards. Inline `wornByDay = new Map()` derivation inserted in YourLooksTab body between `sessionNudge` and `return (`. Bucket loop iterates `wornOutfits` → each outfit's `wornDates` array → parse ISO via `new Date(iso)` → convert to `toLocalYMD()` → push outfit into Map[ymd] array. Per-outfit per-day Set-based dedupe handles the rare case where one outfit has multiple ISO timestamps resolving to the same local day (UTC-dedupe edge case). `selectedDayOutfits = wornByDay.get(selectedDay) || []`. Inline (not memoized) — typical scale 10-50 outfits × 1-10 wears = sub-millisecond. Dot style array changed to `[weekSheetStyles.dot, wornByDay.has(dayYMD) ? weekSheetStyles.dotFilled : weekSheetStyles.dotHollow]`. Empty content placeholder comment replaced with `<ScrollView>` containing `selectedDayOutfits.map()` rendering mini white cards. Card structure: vibe eyebrow + outfit name (numberOfLines={2}) + horizontal ScrollView of 56×56 thumbs. Thumb's own `rgba(188,199,183,0.18)` sage tint background serves as no-photo fallback — no separate placeholder View needed. Image resizeMode="cover". Extended weekSheetStyles with dayCardsScroll / dayCardsContent (gap: 12) / dayCard (white bg, borderRadius 12, shadow offset 0,1 opacity 0.06 radius 4 elevation 1) / dayCardVibe (Outfit_700Bold 11pt `#A44A34` uppercase letter-spaced 2.5 — matches locked April 2026 eyebrow design system) / dayCardName (DMSerifDisplay 18pt `#2C1A0E` lineHeight 22) / dayCardThumbsRow (flexGrow 0) / dayCardThumbsContent (gap: 8) / dayCardThumb (56×56 borderRadius 8 overflow hidden sage tint bg) / dayCardThumbImage (100% × 100%). `gap` works on RN 0.71+; Expo SDK 54 = RN 0.81. HIG: cards display-only (no onPress) so no tap target requirement; vibe eyebrow 11pt ✓; outfit name 18pt ✓; all WCAG AA / AAA contrast on white card bg.

(S7) Empty week no-op per Grace's S5 directive ("hollow dots are clear enough"). S6's natural behavior verified: when `wornByDay.size === 0`, all 7 dots render hollow gray + day-content ScrollView's `.map()` produces no children → blank area below dots. No code change. Later reversed in follow-up F1 below: Grace added "No outfit logged" empty-day message after iPhone testing felt blank without orientation.

(S8) Optimistic update extending `handleWornToday` in YourLooksTab. Original 3 fire-and-forget operations (setWornToday flash, onPersistInteraction, onMarkItemsWorn) preserved. New 4th: `setWornOutfits((prev) => ...)` with two branches. Branch A: outfit.id exists in prev → append nowIso to wornDates IF today's UTC `slice(0,10)` isn't already present (matches `upsertOutfitInteraction`'s UTC dedupe in outfitHistory.js:73 so DB and local agree on what gets blocked, no "appears then disappears on reload" surprise). Branch B: outfit.id NOT in prev → prepend new entry with full shape mirroring `rowToSavedOutfit` (`...outfit` spread + itemIds from `outfit.items.map(i => i.id)` + context fields from `generationContext?.occasion ?? null` etc. + `rating: null` + `wornDates: [nowIso]` + `savedAt: null` + `createdAt: nowIso`). Shape parity critical so the S2 merge-by-id load can cleanly overwrite optimistic entry on next reload — same pattern as Session 12 `toggleSave`. Side benefit: pill visibility (`wornOutfits.length > 0`) also updates instantly — fresh user's first "I wore this today" tap makes 📅 pill appear without reload.

Two follow-up edits in same session:

(F1) "No outfit logged" empty-day message — reverses S7 no-op directive after Grace iPhone-tested empty-day cards area feeling blank. Two edits: JSX conditional `<Text>No outfit logged</Text>` inside day-content ScrollView gated `selectedDayOutfits.length === 0`; new `dayEmptyMessage` style in weekSheetStyles (Outfit_400Regular 13pt `#A09888` centered paddingTop 40). No card wrapper, no sparkle per spec.

(F2) Subscription Free card — 1-line addition to `freeFeatures` array at App.js:5285. New string "Log what you wore — track your week" inserted after "Share outfit cards". Em-dash U+2014 real UTF-8 via Edit tool.

Design decisions made during the session:
- Pill style: plain emoji not chrome pill. Grace's call after seeing initial diff. HIG width compliance via hitSlop, not visible chrome.
- Emoji fontSize 16 (23% bump over Saved's 13) to balance visual weight against the simpler heart silhouette.
- All date math LOCAL via new helpers, NOT UTC. Existing UTC dedupe in `upsertOutfitInteraction` left untouched. Late-night edge case documented as Known Issue.
- `selectedDay` re-syncs to today on every sheet open (matches Pin Sheet filter-reset pattern).
- Reuse `pinSheetStyles` cross-tab for sheet shell (Session 11 + 12 precedent).
- Optimistic update uses UTC `slice(0,10)` for dedupe (matches DB layer) even though display uses local date — so both layers agree on what's blocked.
- Day cards stack via `gap: 12`; horizontal thumb row via `gap: 8` (RN 0.71+ feature, Expo SDK 54 is RN 0.81).
- Subtitle deferred to S5 (depends on Monday-week computation); S4 was pure shell.

What was deliberately NOT done this session:
- No Edge Function changes. `recognize-photo` / `generate-outfits` / `delete-user` untouched.
- No SYSTEM_PROMPT changes — cache stays at 2,510 tokens.
- No Supabase schema, table, RLS, or policy changes. `outfit_history` (Session 9A) consumed as-is.
- No Pro gating for the calendar pill — Free tier per Feature Map.
- No UTC-to-local dedupe migration in `upsertOutfitInteraction` — pre-existing behavior, documented as Known Issue.
- No "today" indicator beyond default-selected state. Once user taps a different day, today no longer visually distinguished. v1 acceptable.
- No memoization of `wornByDay` — typical scale makes inline recomputation negligible.

Known limitations / new this session:
- UTC dedupe vs LOCAL display inconsistency in late-night wears straddling midnight UTC. Added to Known Issues list. Polish opportunity: switch both layers to local-date dedupe via `toLocalYMD()`.
- Late-night week-shift edge case: user opens sheet at 11:55pm Sunday → midnight passes → next-week's days render → previously-selected Sunday is no longer in the day array → highlighted dot disappears. Rare; not handled.

App.js net diff approximately +395 lines across 8 substeps + 2 follow-up edits. src/lib/outfitHistory.js net diff +21 lines (`fetchWornOutfits` export only — no signature changes to existing exports). No new files, no new dependencies, no new style modules beyond `weekSheetStyles`. Edge Function NOT touched, SYSTEM_PROMPT NOT touched, cache stays at 2,510 tokens, zero CLI deploys, zero new dependencies, zero schema changes. Commit: TBD on testing branch. Version label: v2026-05-26-session20-your-week-calendar-pill.

---

