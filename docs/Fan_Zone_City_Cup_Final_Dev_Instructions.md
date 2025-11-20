# Fan Zone City Cup — Final Dev Instructions (Unified Update)

This document combines all final decisions, requirements, polish items, and the official 3‑week round schedule for the tournament feature. Ship exactly this — no scope beyond these items is needed for launch.

---

## 1) Voting & Commenting Rules (FINAL)

Voting
- Anonymous voting allowed; no login required.
- Record uniqueness via IP + browser cookie (`t_voter`).
- Logged‑in users can still vote; not required.
- Clicking "Vote for CITY" casts instantly (no modal).

Commenting
- Anonymous comments allowed; no login required (`user_id = null`).
- Minimal anti‑spam only: short rate limit + minimum length + optional profanity filter.

Goal: eliminate friction and maximize Reddit/community traffic.

---

## 2) Bracket Structure (FINAL)

Round 1 (8 matches)
1. Dallas vs Toronto
2. Houston vs Mexico City
3. Los Angeles vs San Francisco
4. Philadelphia vs Boston
5. Atlanta vs Miami
6. Seattle vs Monterrey
7. Vancouver vs Guadalajara
8. Kansas City vs New York/New Jersey

Quarterfinals
- QF1: Winner Match 1 vs Winner Match 2
- QF2: Winner Match 3 vs Winner Match 4
- QF3: Winner Match 5 vs Winner Match 6
- QF4: Winner Match 7 vs Winner Match 8

Semifinals
- SF1: Winner QF1 vs Winner QF2
- SF2: Winner QF3 vs Winner QF4

Final
- Winner SF1 vs Winner SF2

These 15 matches are final and will not change.

---

## 3) Round Schedule & Theming (3‑Week Tournament)

Round 1 — Best First Impression (Nov 18–21)
- Focus: Airport arrival, skyline, first 24 hours, transit to hotel.

Round 2 — Best Match Day Experience (Nov 22–25)
- Focus: Stadium energy, fan zones, bars, pre‑match buildup.

Round 3 — Best Between‑Match Adventure (Nov 26–29)
- Focus: Food, nightlife, attractions, neighborhoods, day trips.

Final — Ultimate Host City (Nov 30–Dec 4)
- Focus: Best overall WC26 host city — the complete package.

UI integration
- On hub, add a round context block above Live Matchups, e.g.,
  "Round 1 — Best First Impression (Nov 18–21). Vote in all eight opening matchups. Winners advance to Round 2."
- On match pages, add a header:
  "Round X • THEME — short prompt sentence for that round."

---

## 4) Country Flags (Required UI Enhancement)

Add a small SVG flag next to each city name on:
- The `/tournament` grid
- Individual match pages

Use static assets: `/public/flags/us.svg`, `/public/flags/mx.svg`, `/public/flags/ca.svg`.
City data needs `country_code` in {`us`,`mx`,`ca`} (map existing city meta if needed).

Example JSX: `<Image src={`/flags/${city.country_code}.svg`} width={20} height={14} alt="" />`

---

## 5) OG Images (Critical for Reddit Sharing)

Each match must have a static OG card (1200×630) at `/og/tournament/[slug].png`, e.g.,
`/og/tournament/dallas-vs-toronto.png` with:
- "City A vs City B"
- "Fan Zone City Cup — Vote Now"
- Tournament branding

Meta example:
```
<meta property="og:image" content="https://worldcup26fanzone.com/og/tournament/dallas-vs-toronto.png" />
<meta property="og:title" content="Dallas vs Toronto — Best First Impression (Round 1)" />
<meta property="og:description" content="Vote for the best 2026 host city — no login required." />
```

---

## 6) URL Structure (CONFIRMED)

Match pages use SEO slugs: `/tournament/dallas-vs-toronto`, `/tournament/houston-vs-mexico-city`, etc. Internals can reference IDs.

---

## 7) Match Page Enhancements

Add/keep:
- Country flags near city names.
- Round theme header.
- Vote count under buttons.
- Countdown timer ("Closes in X hours").
- Results bar after 50 votes.
- Anonymous "Share a tip or story" (modal CTA; no login required).
- Large bold "A vs B" vote buttons and optional city photos.

---

## 8) Tournament Hub Enhancements

Add a round context block, flags on cards, a bit more spacing, and a light visual hint of bracket flow.

Simple bracket flow visual:
```
Match 1 ───┐
           ├─ QF1 placeholder
Match 2 ───┘
```

---

## 9) Anti‑Spam Logic (Minimal)

Voting
- 1 vote per cookie OR IP per match; additional attempts show "Vote already counted".

Comments
- 1 comment per 5 seconds.
- Minimum 5 characters.
- Optional profanity filter.

No login required for either.

---

## 10) Admin & Ops (Minimal)

Provide only:
- Close match
- Set winner manually
- Activate next match

No automated scheduling required.

---

## Deliverable Notes

- Static OG images must be exported and placed in `/public/og/tournament/`.
- The hub and match pages should surface the current round and theme copy from a simple config or constants for clarity.
- Keep UI snappy and mobile‑first; anonymous flows only.

---

## Seeding Votes on Launch (Optional)

Two safe approaches:

1) One‑off seed of counters (simplest)
- On launch day, randomly pre‑fill `votes_a` and `votes_b` for Round 1 so totals look like dozens of votes.
- Pros: no code changes, immediately shows results bar if totals > 50.
- Cons: "seeded" votes are indistinguishable from real in totals (but uniqueness for new voters is unaffected).

2) Cosmetic offsets (slightly more work)
- Add `seed_votes_a/b` columns and display `votes + seed_votes` in UI while the RPC and uniqueness use real votes only.
- Pros: clarity between display baseline and real votes; can exclude offsets from the 50‑vote threshold.
- Cons: minor code changes required.

Included in repo is a seed script for option (1): `db/seeds/002_seed_launch_votes.sql`.
Run it once on launch day (and only for active Round 1 matches). See file for details.

