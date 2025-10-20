# 🌍 World Cup 2026 Team Page Template (Pre-Draw Phase)

Use this template for every *qualified* or *likely* team (28 confirmed + 12 provisional).  
Once the group draw is announced (Dec 5 2025), update the match-related placeholders.

---

## Page Metadata
**Slug:** `/teams/[team-slug]`  
**Example:** `/teams/japan`  
**SEO Title:** `Follow [TEAM] to the 2026 World Cup | Fan Zone Network`  
**Meta Description:**  
`Track [TEAM]'s journey to the 2026 World Cup — fixtures, cities, travel tips, and fan experiences across North America.`  

---

## 🇯🇵 Hero Section
```
# Follow Japan to the 2026 World Cup
Rising once again on the world stage — the Samurai Blue head to North America in 2026.
```
**CTA:** `Get notified when Japan’s match cities are announced → [Join Waitlist]`  
**Banner Assets:**  
- `team_flag_url`  
- `hero_image_url` (fan crowd, stadium, etc.)

---

## 🗓️ Tournament Status Block
| Field | Placeholder |
|--------|--------------|
| Group | TBD (updates Dec 5 2025) |
| Match 1 | Opponent TBD – City TBD – Date TBD |
| Match 2 | Opponent TBD – City TBD – Date TBD |
| Match 3 | Opponent TBD – City TBD – Date TBD |

**Note to visitors:**  
> FIFA will announce final fixtures and host cities on **December 5 2025**.  
> Bookmark this page — it will automatically update the moment details are confirmed.

---

## ⚽ Team Snapshot
| Item | Detail |
|------|--------|
| **Confederation** | AFC |
| **World Cup Appearances** | 8 |
| **Best Finish** | Round of 16 (multiple) |
| **Coach** | [Coach Name] |
| **Star Players** | [List key players] |
| **FIFA Ranking** | [Rank #] |

---

## 🏆 Greatest World Cup Moments
1. **Japan 2–1 Germany (2022)** — a stunning upset that shocked the world.  
2. **Clean-up Crew Tradition** — Japanese fans setting the global example for respect.  
3. **Historic Penalty Shootout vs Paraguay (2010)** — heartbreak but pride.

> _Add short YouTube embeds or highlight reels here._

---

## 🧭 Travel & Culture (Pre-Draw Content)
Until fixtures are set, highlight Japanese culture and where fans can connect abroad.

**Section Ideas**
- 🇺🇸 *“Where to find Japanese food in U.S. host cities”*  
- 🎌 *“Fan traditions to bring to North America (taiko drums, flags, chants)”*  
- 🌏 *“Travel etiquette tips for Japanese supporters visiting the Americas”*  

> Include 2-3 evergreen paragraphs that won’t change post-draw.

---

## 🧳 When Cities Are Announced…
This section auto-populates from Supabase (`team_pages_v` view).

```
{{#if cities}}
## 🗺️ Host Cities
Japan will play in:
- {{city_1}}
- {{city_2}}
- {{city_3}}
{{/if}}
```

**CTA Buttons**
- `Generate my Japan itinerary → /planner?team=japan`
- `Download Japan 3-City Fan Pack (PDF) → /downloads/japan-bundle`

---

## 💬 Community
> “Discuss Japan’s chances, share travel plans, or post photos from past tournaments.”

**Links**
- `/forums/japan` (on-site)
- `r/FanZoneNetwork` → flair `Japan`
- Discord invite (optional)

---

## 📜 Historical Timeline
| Year | Highlight |
|-------|------------|
| 1998 | First World Cup appearance |
| 2002 | Co-hosted the tournament with South Korea |
| 2010 | Advanced to Round of 16 |
| 2018 | Famous fair-play tiebreaker advancement |
| 2022 | Beat Germany & Spain in group stage |

---

## 📰 Latest Articles (auto-pull or manual)
- `[5 Smart Places for Japan Fans to Stay in Dallas](#)`
- `[Inside Japan’s Fan Culture at the World Cup](#)`
- `[Meet the Traveling Samurai: Japan’s Global Supporters’ Club](#)`

---

## 📩 Waitlist Footer
```
Stay updated the moment fixtures are confirmed.
👉 [Join the Japan 2026 Fan List]
```

---

## Data Placeholders for CMS / Supabase
| Field | Example |
|--------|----------|
| team_id | UUID |
| team_slug | `japan` |
| group_letter | `null` (until draw) |
| is_provisional | `false` |
| language | `ja` |
| primary_color | `#0A1F8F` |
| secondary_color | `#FFFFFF` |
| hero_image | `/images/teams/japan-hero.jpg` |
| flag_image | `/images/flags/japan.svg` |
| seo_title | `Follow Japan to the 2026 World Cup` |
| seo_description | `Track Japan’s 2026 World Cup journey — fixtures, cities, travel tips, and fan culture.` |

---

## 🔄 Post-Draw Update Checklist
1. Update `group_slots.csv` with Japan’s confirmed group + cities.  
2. Upload `fixtures.csv` with exact match details.  
3. Regenerate Japan’s AI itinerary + PDF bundle.  
4. Replace placeholder schedule block with live fixtures.  
5. Refresh SEO metadata (`Japan World Cup 2026 schedule, cities, tickets`).  

---

## 🧠 Optional Add-Ons
- **“Greatest Goals” Gallery:** carousel or YouTube playlist embed.  
- **Fan Map:** pins where Japanese supporters’ groups will gather.  
- **Language Toggle:** show Japanese text from translation table if available.  

---

**File Version:** v1.0 (October 2025)  
**Intended Use:** Staging / pre-draw content build for World Cup 2026 Fan Zone
