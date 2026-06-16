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

