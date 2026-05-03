# CLOZIE — Master Build Document

FILE NAME: CLAUDE.md
WHAT GRACE CALLS IT: Clozie MD / the master file
WHAT CLAUDE CODE CALLS IT: CLAUDE.md (must use this exact name)
HOW TO USE: Drop this file into the root of your clozie-native project folder. Claude Code reads it automatically every session. In claude.ai planning chats — paste the full contents.

READ THIS ENTIRE FILE before doing anything. No exceptions.

Last updated: March 27 2026 — Converted to plain text so Claude Code can read it correctly.
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
- EXPO_PUBLIC_SUPABASE_ANON
- EXPO_PUBLIC_ANTHROPIC_KEY
  - NOTE: REMOVE before launch. API key moves to Supabase Edge Function in Phase 2. Never in client code.
- EXPO_PUBLIC_PHOTOROOM_KEY (only when PhotoRoom is ready — not yet)

---

# VIP EMAILS — NEVER REMOVE. EVER. NON-NEGOTIABLE.

These 4 emails get ZERO restrictions. No caps. No limits. No walls. Every feature unlocked. Forever. Store in Supabase table in Phase 2 (NOT hardcoded in client code). Get written consent from all 4 before granting access.
VIP emails should never be hardcoded in client code. They go in a Supabase VIP table, checked on every login.
They get Pro the moment they log in. Never delete. Never change. Never question.

- insuredbyjacek@msn.com (Grace herself)
- zuzia.starz@gmail.com (friend)
- stefka992001@gmail.com (friend)
- jacek9901@gmail.com (friend)

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

Category tag pill: background rgba(188,199,183,0.30), text #6B7E65. Unified — all 6 categories use the same sage green pill. No per-category color mapping. Font: Outfit, 9px, weight 500, letter-spacing 0.3px, border-radius 100px, padding 2px 10px.

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

## Peek Inside Screen (How It Works)

TABS ARE TAPPABLE — user taps Step 1 / Step 2 / Step 3 to switch content

- Each tap shows different content card below — this is the main interaction
- Active tab: gold border, slightly lighter background
- Step 1: 📸 'Snap & Add Your Clothes' — shows clothing card with CLOZIE RECOGNISED ✦ label — never AI RECOGNISED
- Step 2: 🌤 'Tell Clozie Your Day' — shows weather chips + occasion chips
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
- Age checkbox: "I confirm I am 13 or older." Unchecked = cannot create account.
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
- Unified sage green category tag pill below photo — same color for all 6 categories (Tops, Bottoms, Dresses, Outerwear, Shoes, Accessories). Background: rgba(188,199,183,0.30), text color: #6B7E65. One pill style for all categories — no per-category color mapping.
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

## Your Looks Tab (was 'outfits' in code)

- "Your Looks" heading
- Empty state: 'No outfits yet ✦' 'Head to Today's Vibe, tell Clozie about your day, and she'll create your perfect looks.' [Gold pill button] Go to Today's Vibe →
- Loading state: Spinning gold ✦ 'Styling your outfits...' 'Clozie is working her magic ✦'

Each outfit card:
- Photo strip at top — 2-column grid of item photos with names
- VIBE label in gold (e.g. ROMANTIC)
- Outfit name in Playfair (e.g. 'Evening Glow')
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
- Unified sage green category tag pills — same color for all categories. Background: rgba(188,199,183,0.30), text: #6B7E65.
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

Name does not survive logout — reverts to email on next login
Fix in native: Always pull user's name from Supabase profile table on every login. Never rely on cached local data for the user's name.

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
- Indoor climate signals: if Brief mentions cold indoor conditions ('office is freezing', 'AC is cold'), add a light warmth layer even if outside is warm.
- Before generating: Clozie reads the user's style profile
- Before generating: Clozie reads all past ratings and learning notes
- Before generating: Clozie reads the 'Anything Else?' free text
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

- Supabase auth used properly — no localStorage ever
- Pull user name from Supabase on every login
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

LLC — Clozie LLC approved April 13, 2026. Registered with Northwest Registered Agent. Address: 418 Broadway STE N, Albany NY 12207.

D-U-N-S — request ~2 weeks before App Store submission. Not today.

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

INSTAGRAM — @cloziestyle
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

---

Created March 2026.
Updated March 24 2026 — REBUILD RULE and testing branch rule added.
Updated March 27 2026 — Converted to plain text so Claude Code can read it correctly.

Drop this file into the root of the clozie-native project folder.
Drop App_ORIGINAL.jsx in the same folder as reference.
Claude Code reads CLAUDE.md automatically at the start of every session.
