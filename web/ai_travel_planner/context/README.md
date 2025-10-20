# City Context Files - Instructions

## Purpose
These markdown files contain detailed travel and logistics guides for each World Cup 2026 host city. They are automatically loaded and injected into the AI travel planner's prompts to ensure consistent, accurate recommendations.

## File Structure

```
context/
├── en/          (English guides)
│   ├── dallas.md
│   ├── atlanta.md
│   ├── vancouver.md
│   └── ... (16 total)
├── fr/          (French guides - À VENIR)
│   └── ... (same cities)
└── es/          (Spanish guides - PRÓXIMAMENTE)
    └── ... (same cities)
```

## How to Use

### 1. Paste Your Content
Simply open each city file and replace the placeholder text with your Google Docs content.

**Example:** For Dallas, open `en/dallas.md` and paste your full Dallas guide.

### 2. File Naming Convention
Files are named using lowercase, hyphenated city names:
- `dallas.md` → Dallas
- `kansas-city.md` → Kansas City
- `san-francisco.md` → San Francisco Bay Area
- `new-york.md` → New York/New Jersey
- `mexico-city.md` → Mexico City

### 3. Database City Name Mapping
The system automatically maps these file names to the city names in your database:

| Database Name | File Name |
|--------------|-----------|
| Dallas | `dallas.md` |
| Atlanta | `atlanta.md` |
| Houston | `houston.md` |
| Kansas City | `kansas-city.md` |
| Miami | `miami.md` |
| Los Angeles | `los-angeles.md` |
| San Francisco Bay Area | `san-francisco.md` |
| Seattle | `seattle.md` |
| Boston | `boston.md` |
| New York/New Jersey | `new-york.md` |
| Philadelphia | `philadelphia.md` |
| Toronto | `toronto.md` |
| Vancouver | `vancouver.md` |
| Guadalajara | `guadalajara.md` |
| Mexico City | `mexico-city.md` |
| Monterrey | `monterrey.md` |

## Content Guidelines

Each city guide should include:
1. **Executive Overview** - Why early planning matters for this specific city
2. **Tiered Travel & Lodging Strategies** - Premium, Mid-Range, and Budget options
3. **Strategic Booking Timeline** - When to book what
4. **Match Day Navigation** - Transportation options and local tips
5. **Alternative Hub Strategy** - Nearby airports and cities
6. **Essential Traveler Information** - Safety, weather, local know-how
7. **Essential Links & Resources** - Official websites and resources
8. **Coming Soon: Phase 2** - Teaser for fan experience guide

## Multi-Language Support (Coming Soon)

When ready, add French and Spanish versions:
- `fr/dallas.md` - French version of Dallas guide
- `es/dallas.md` - Spanish version of Dallas guide

The system will automatically serve the correct language based on user preference.

## How It Works

When a user selects cities in the travel planner:
1. System detects selected cities (e.g., "Dallas", "Atlanta")
2. Converts to file names (`dallas.md`, `atlanta.md`)
3. Loads English content from `en/` folder
4. Injects content into Gemini AI prompt
5. AI uses YOUR specific research to generate personalized itineraries

## Status

- ✅ **Vancouver** - Content added
- ⏳ **Dallas** - Awaiting content
- ⏳ **Atlanta** - Awaiting content
- ⏳ **Houston** - Awaiting content
- ⏳ **Kansas City** - Awaiting content
- ⏳ **Miami** - Awaiting content
- ⏳ **Los Angeles** - Awaiting content
- ⏳ **San Francisco** - Awaiting content
- ⏳ **Seattle** - Awaiting content
- ⏳ **Boston** - Awaiting content
- ⏳ **New York** - Awaiting content
- ⏳ **Philadelphia** - Awaiting content
- ⏳ **Toronto** - Awaiting content
- ⏳ **Guadalajara** - Awaiting content
- ⏳ **Mexico City** - Awaiting content
- ⏳ **Monterrey** - Awaiting content

## Questions?
Contact the development team for technical assistance with the context loading system.
