# How to Add New Qualified Teams

This guide explains how to quickly add new teams as they qualify for the 2026 FIFA World Cup.

## Overview

The team pages system is designed to make adding new teams as simple as adding a new entry to a TypeScript array. All pages are automatically generated from the data.

## Files Structure

```
web/
├── lib/
│   └── teamsData.ts          # ⭐ Main data file - add teams here
├── app/
│   └── teams/
│       ├── page.tsx           # Index page (auto-updates)
│       └── [slug]/
│           └── page.tsx       # Individual team pages (auto-generates)
└── components/
    └── landing/
        └── QualifiedTeamsSection.tsx  # Homepage section (auto-updates)
```

## How to Add a New Team

### Step 1: Open `web/lib/teamsData.ts`

### Step 2: Add a New Team Object

Add a new team object to the `teams` array in alphabetical order. Here's the template:

```typescript
{
  slug: 'team-name',              // URL-friendly (e.g., 'costa-rica')
  name: 'Team Name',              // Display name (e.g., 'Costa Rica')
  confederation: 'CONCACAF',      // AFC, CAF, CONCACAF, CONMEBOL, OFC, UEFA
  isProvisional: false,           // true = provisional, false = qualified
  fifaRanking: 45,                // Optional: Current FIFA ranking
  appearances: 6,                 // Optional: Number of World Cup appearances
  bestFinish: 'Quarter-finals',   // Optional: Best World Cup result
  primaryColor: '#002B7F',        // Main team color (hex)
  secondaryColor: '#CE1126',      // Secondary team color (hex)
  flagEmoji: '🇨🇷',              // Flag emoji
  coach: 'Coach Name',            // Optional: Current coach
  starPlayers: [                  // Optional: Array of key players
    'Player 1',
    'Player 2',
    'Player 3'
  ],
  greatestMoments: [              // Optional: Memorable World Cup moments
    {
      title: 'Victory Title',
      description: 'What happened',
      year: 2014                  // Optional year
    }
  ],
  historicalTimeline: [           // Optional: Historical events
    {
      year: 2002,
      highlight: 'What happened this year'
    }
  ]
}
```

### Step 3: Save the File

That's it! The system will automatically:
- ✅ Add the team to `/teams` index page
- ✅ Generate an individual page at `/teams/[slug]`
- ✅ Update the homepage "Qualified Teams" section
- ✅ Sort teams alphabetically
- ✅ Apply team colors to the page design

## Example: Adding Costa Rica

```typescript
{
  slug: 'costa-rica',
  name: 'Costa Rica',
  confederation: 'CONCACAF',
  isProvisional: false,
  fifaRanking: 52,
  appearances: 6,
  bestFinish: 'Quarter-finals (2014)',
  primaryColor: '#002B7F',
  secondaryColor: '#CE1126',
  flagEmoji: '🇨🇷',
  coach: 'Gustavo Alfaro',
  starPlayers: ['Keylor Navas', 'Joel Campbell', 'Bryan Ruiz']
}
```

## Where to Find Team Information

### Official Sources
- **FIFA Rankings**: https://www.fifa.com/fifa-world-ranking
- **Confederation Info**: Team's continental federation website
- **Team Colors**: Official federation website or Wikipedia
- **Flag Emojis**: Copy from https://emojipedia.org/flags/

### Quick Tips

1. **Slug**: Always use lowercase with hyphens (e.g., `south-korea`, `new-zealand`)
2. **Colors**: Use hex codes from team jerseys or official branding
3. **Confederation**: 
   - AFC (Asia)
   - CAF (Africa)
   - CONCACAF (North/Central America, Caribbean)
   - CONMEBOL (South America)
   - OFC (Oceania)
   - UEFA (Europe)
4. **isProvisional**: Set to `true` until official qualification is confirmed

## Updating Teams from Provisional to Qualified

When a provisional team officially qualifies:

1. Find the team in `teamsData.ts`
2. Change `isProvisional: true` to `isProvisional: false`
3. Save the file

The team will automatically move from the "Provisional" section to "Qualified" on the index page.

## Testing New Teams

After adding a team:

1. Start the dev server: `npm run dev`
2. Visit `http://localhost:3000/teams` to see the team on the index
3. Click the team card to view the individual page
4. Check the homepage to see it in the featured teams section

## Batch Adding Multiple Teams

To add multiple teams at once (e.g., when UEFA qualifiers finish):

1. Prepare all team objects in a text editor
2. Add them all to the `teams` array at once
3. Save the file
4. All pages update automatically

## Advanced: Adding Rich Content

For teams with more content (like Japan's example), you can add:

- **Greatest Moments**: Array of memorable matches/achievements
- **Historical Timeline**: Year-by-year World Cup history
- **Star Players**: Current squad highlights
- **Coach Info**: Current manager

These sections only appear on the individual team page if data is provided.

## Summary

**To add a new team:**
1. Open `web/lib/teamsData.ts`
2. Add team object to `teams` array
3. Save file
4. Done! ✅

All pages automatically update with no additional code changes needed.
