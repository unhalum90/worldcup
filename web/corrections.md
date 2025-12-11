# World Cup 2026 Site Corrections

This file tracks errors found on the site that need to be corrected across all data sources.

**Note:** FIFA times are in CEST (Central European Summer Time). Convert to ET by subtracting 6 hours.
- CEST 01:00 = ET 7:00 PM (previous day)
- CEST 19:00 = ET 1:00 PM
- CEST 22:00 = ET 4:00 PM

---

## Match Schedule Corrections

| Match # | Field | Current (Wrong) | Correct | Source |
|---------|-------|-----------------|---------|--------|
| 22 | City | Dallas | Toronto | FIFA site |
| 22 | Stadium | AT&T Stadium | BMO Field | FIFA site |
| 22 | Time | 6:00 PM ET | 7:00 PM ET | FIFA (01:00 CEST = 7PM ET) |
| 63 | City | Seattle | Vancouver | FIFA site |
| 63 | Stadium | Lumen Field | BC Place | FIFA site |
| 63 | Time | 6:00 PM ET | 11:00 PM ET | FIFA (05:00 CEST = 11PM ET prev day) |
| 64 | City | Vancouver | Seattle | FIFA site |
| 64 | Stadium | BC Place | Lumen Field | FIFA site |
| 64 | Time | 6:00 PM ET | 11:00 PM ET | FIFA (05:00 CEST = 11PM ET prev day) |
| 65 | City | Houston | Guadalajara | FIFA site |
| 65 | Stadium | NRG Stadium | Estadio Akron | FIFA site |
| 65 | Time | 9:00 PM ET | 8:00 PM ET | FIFA (02:00 CEST = 8PM ET) |
| 66 | City | Guadalajara | Houston | FIFA site |
| 66 | Stadium | Estadio Akron | NRG Stadium | FIFA site |
| 66 | Time | 9:00 PM ET | 8:00 PM ET | FIFA (02:00 CEST = 8PM ET) |
| 69 | City | Kansas City | Dallas | FIFA site |
| 69 | Stadium | Arrowhead Stadium | AT&T Stadium | FIFA site |
| 69 | Time | 6:00 PM ET | 10:00 PM ET | FIFA (04:00 CEST = 10PM ET prev day) |
| 70 | City | Dallas | Kansas City | FIFA site |
| 70 | Stadium | AT&T Stadium | Arrowhead Stadium | FIFA site |
| 70 | Time | 6:00 PM ET | 10:00 PM ET | FIFA (04:00 CEST = 10PM ET prev day) |

---

## Team Data Corrections

| Team | Field | Current (Wrong) | Correct | Source |
|------|-------|-----------------|---------|--------|
| | | | | |

---

## City/Stadium Corrections

| City | Field | Current (Wrong) | Correct | Source |
|------|-------|-----------------|---------|--------|
| | | | | |

---

## Other Corrections

| Location | Field | Current (Wrong) | Correct | Notes |
|----------|-------|-----------------|---------|-------|
| | | | | |

---

## Files to Update
- `lib/matchesData.ts` - Match schedule data
- `lib/teamsData.ts` - Team information
- `lib/cityData.ts` - City/stadium info
- `video_scripts/` - Regenerate after fixes
- `data/match_dates.json` - Match schedule JSON
- `src/data/match_dates.json` - Another match dates file
- `supabase/migrations/20241208_seed_match_pages.sql` - DB seeds

---

*Last updated: December 11, 2025*
