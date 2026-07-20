# Clozie — Build & Upload to TestFlight

**My current flow (as of Build 29).** This replaces the earlier Terminal-first method — I no longer run the build myself in Terminal. Claude Code runs the build; I download the IPA and upload it via Transporter.

Last confirmed working: **July 19, 2026 — Build 29.**

App identity that should always be true: bundle ID **com.clozie.app**, profile **preview**, Apple Team **Clozie LLC (T9PZ9RW7F5)**.

-----

## STEP 1 — Verify the code is correct first

Before anything, Claude Code reads the ACTUAL changed files and confirms the intended change is intact and nothing else moved. (Example from Session 19: read AutoWhiteBalance.swift in full, confirmed the pipeline + both fail-safe guards + unchanged function signature, checked the App.js wiring line, md5-checked that untouched files were untouched, confirmed the pre-change backup exists.) Code = NOW, never from memory.

## STEP 2 — Pre-build config check (so there are no errors and no wasted build)

Claude Code confirms the build will pass before spending it:
- Branch is **testing**, git clean + pinned.
- **VERSION RULE** — if the current version is already live on the App Store, bump it in BOTH `app.config.js` AND `package.json` first, or Apple rejects the build (error 90062 / 90186).
- `eas whoami` is the **clozie** account, confirmed BEFORE the build so bad auth can't waste it.
- Profile is **preview**.

## STEP 3 — Claude Code runs the build

`eas build --platform ios --profile preview`. The build number auto-increments on its own — I don't set it. The build runs on Expo's cloud (~3–20 min).

## STEP 4 — Download the IPA to my Desktop

I click the download link — the .ipa downloads straight to my **Desktop**.
- It downloads silently and double-clicking it does nothing — that's normal. I never "open" it; I drag it into Transporter.

## STEP 5 — Upload with Transporter

- Open **Transporter**, signed in as **Clozie LLC**.
- If Transporter shows "Delivered" at the top, that may be left over from a PREVIOUS build — it does NOT mean this one is uploaded.
- Click **+** → pick the .ipa from my Desktop → **Open** → **Deliver**.
- **Never `eas submit`** — it stalls on "waiting for an available submitter" (hung 40 min once). Transporter uploads straight to Apple, no queue.

## STEP 6 — Wait for Apple processing

Apple processes the build (~5–15 min usually, up to 30–60 min is normal and not a problem). Status is in App Store Connect → TestFlight tab: "Processing" = still working; "Ready to Test" = done. "Missing Compliance" (yellow dot) is just the encryption question, one tap to clear.

## STEP 7 — Test the build on my iPhone (TestFlight)

When it appears in TestFlight, install it and run the checklist on the real build:
1. Opens past the splash — no splash hang.
2. Apple Sign-In works end-to-end.
3. Email sign up / sign in works.
4. All four tabs load: My Closet, Today's Vibe, Your Looks, Settings.
5. Generate an outfit end-to-end.

-----

## CRITICAL RULES

- If a build fails or behaves weird: **read the actual EAS Build logs on expo.dev FIRST.** Never guess from local files. Never approve a fix-and-rebuild without evidence from the logs.
- Skip `eas submit` — use Transporter.
- The .ipa never "opens" — drag into Transporter, don't double-click.
- Don't trust Transporter's "Delivered" if it might be from a previous build.
- Build number auto-increments — I don't set it.
