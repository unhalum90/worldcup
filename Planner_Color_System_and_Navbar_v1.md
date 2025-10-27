# 🎨 Planner Color System + Favorite Team Navbar (v1.0)
**Date:** October 26, 2025  
**Author:** Eric Chamberlin  
**Purpose:**  
Unify color usage across Trip Builder, Flight Planner, and Lodging Planner while introducing a dynamic, personalized navbar that reflects each fan’s favorite team colors and flag.

---

## 🧭 Overview

### Goals
- Establish a consistent, minimal color palette for the three core travel planners.  
- Apply those same colors to the planning homepage cards for visual continuity.  
- Add lightweight team personalization by recoloring the navbar and displaying the user’s favorite team flag.

---

## 🎨 1. Planner Color System

| Planner | Gradient / Primary | Secondary | Purpose / Mood |
|----------|--------------------|------------|----------------|
| **Trip Builder** | `#2563EB` → `#1D4ED8` | `#1E40AF` | Calm blue for logic, setup, and trust. |
| **Flight Planner** | `#0EA5E9` → `#0369A1` | `#0284C7` | Airy sky blue for travel, motion, and clarity. |
| **Lodging Planner** | `#F87171` → `#DC2626` | `#B91C1C` | Warm coral for comfort, neighborhoods, and energy. |

---

### Global Variables

In `globals.css`:

```css
:root {
  --trip-primary: #2563EB;
  --trip-secondary: #1D4ED8;

  --flight-primary: #0EA5E9;
  --flight-secondary: #0369A1;

  --lodging-primary: #F87171;
  --lodging-secondary: #DC2626;

  --primary-color: var(--trip-primary);
  --secondary-color: var(--trip-secondary);
}
```

---

### Planner-Level Override

Create `/hooks/usePlannerTheme.ts`:

```tsx
import { useEffect } from 'react';

type PlannerType = 'trip' | 'flight' | 'lodging';

export function usePlannerTheme(plannerType: PlannerType) {
  useEffect(() => {
    // Add planner class to body for scoped styling
    document.body.classList.remove('planner-trip', 'planner-flight', 'planner-lodging');
    document.body.classList.add(`planner-${plannerType}`);

    // Set CSS custom properties for dynamic theming
    const colors = {
      trip: {
        primary: '#2563EB',
        secondary: '#1D4ED8',
        accent: '#1E40AF'
      },
      flight: {
        primary: '#0EA5E9',
        secondary: '#0369A1',
        accent: '#0284C7'
      },
      lodging: {
        primary: '#F87171',
        secondary: '#DC2626',
        accent: '#B91C1C'
      }
    };

    const colorSet = colors[plannerType];
    document.documentElement.style.setProperty("--planner-primary", colorSet.primary);
    document.documentElement.style.setProperty("--planner-secondary", colorSet.secondary);
    document.documentElement.style.setProperty("--planner-accent", colorSet.accent);

    // Cleanup on unmount
    return () => {
      document.body.classList.remove(`planner-${plannerType}`);
    };
  }, [plannerType]);
}
```

**Usage in planner pages:**

```tsx
// In /app/planner/trip-builder/page.tsx
import { usePlannerTheme } from '@/hooks/usePlannerTheme';

export default function TripBuilderPage() {
  usePlannerTheme('trip');
  // Rest of component...
}

// In /app/flight-planner/page.tsx
export default function FlightPlannerPage() {
  usePlannerTheme('flight');
  // Rest of component...
}

// In /app/lodging-planner/page.tsx
export default function LodgingPlannerPage() {
  usePlannerTheme('lodging');
  // Rest of component...
}
```

---

### Homepage Card Alignment

**Update existing** `/app/planner/page.tsx` phase colors:

```tsx
const phases: Phase[] = [
  {
    id: 1,
    emoji: '🗺️',
    title: 'Trip Builder',
    description: 'Choose the nearest airport, the host cities you plan to visit...',
    status: 'live',
    href: '/planner/trip-builder',
    color: 'from-[#2563EB] to-[#1D4ED8]', // Updated to match system
    features: [...]
  },
  {
    id: 2,
    emoji: '✈️',
    title: 'Flight Planner', // Updated name
    description: 'Find the fastest and most affordable ways to hop between World Cup cities...',
    status: 'coming-soon',
    href: '/flight-planner', // Updated path
    color: 'from-[#0EA5E9] to-[#0369A1]', // Updated to match system
    features: [...]
  },
  {
    id: 3,
    emoji: '🏨',
    title: 'Lodging Planner', // Updated name
    description: 'Hand-picked hotels, hostels, and neighborhoods...',
    status: 'coming-soon',
    href: '/lodging-planner', // Updated path
    color: 'from-[#F87171] to-[#DC2626]', // Updated to match system
    features: [...]
  },
  {
    id: 4,
    emoji: '🎉',
    title: 'While You\'re There',
    description: 'From fan fests to public transport...',
    status: 'may-2026',
    href: '#',
    color: 'from-orange-500 to-red-600', // Keep existing for phase 4
    features: [...]
  }
];
```

**Key Updates:**
- Phase 2: "Getting There" → "Flight Planner" + sky blue colors
- Phase 3: "Staying There" → "Lodging Planner" + coral colors  
- Updated hrefs to match actual planner routes
- Maintained existing phase 4 styling (not a core planner)

---

## ⚽ 2. Favorite Team Navbar + Flag

### Goal
Subtle personalization: the navbar background and text adapt to the fan’s favorite team colors (from `user_profile.favorite_team`), with a small team flag for flair.

---

### Palette Source

**Update existing** `/lib/constants/teamColors.ts` to include flag paths:

```ts
export const teamColors: Record<string, { primary: string; secondary: string; flag?: string }> = {
  Netherlands: { primary: "#FF4B17", secondary: "#002F6C", flag: "/flags/netherlands.svg" },
  'The Netherlands': { primary: "#FF4B17", secondary: "#002F6C", flag: "/flags/netherlands.svg" },
  France: { primary: "#0055A4", secondary: "#EF4135", flag: "/flags/france.svg" },
  Brazil: { primary: "#FEDD00", secondary: "#009739", flag: "/flags/brazil.svg" },
  Argentina: { primary: "#75AADB", secondary: "#FFFFFF", flag: "/flags/argentina.svg" },
  England: { primary: "#FFFFFF", secondary: "#C8102E", flag: "/flags/england.svg" },
  Spain: { primary: "#AA151B", secondary: "#F1BF00", flag: "/flags/spain.svg" },
  Germany: { primary: "#000000", secondary: "#DD0000", flag: "/flags/germany.svg" },
  Portugal: { primary: "#006600", secondary: "#FF0000", flag: "/flags/portugal.svg" },
  Italy: { primary: "#007FFF", secondary: "#FFFFFF", flag: "/flags/italy.svg" },
  USA: { primary: "#002868", secondary: "#BF0A30", flag: "/flags/usa.svg" },
  'United States': { primary: "#002868", secondary: "#BF0A30", flag: "/flags/usa.svg" },
  Mexico: { primary: "#006847", secondary: "#CE1126", flag: "/flags/mexico.svg" },
  Canada: { primary: "#FF0000", secondary: "#FFFFFF", flag: "/flags/canada.svg" },
  Uruguay: { primary: "#1EB4E8", secondary: "#FFD700", flag: "/flags/uruguay.svg" },
  Japan: { primary: "#002654", secondary: "#FFFFFF", flag: "/flags/japan.svg" },
  'South Korea': { primary: "#C60C30", secondary: "#003478", flag: "/flags/south-korea.svg" },
  Australia: { primary: "#FFCD00", secondary: "#00843D", flag: "/flags/australia.svg" },
  Morocco: { primary: "#C1272D", secondary: "#006233", flag: "/flags/morocco.svg" },
  Senegal: { primary: "#00853F", secondary: "#E31B23", flag: "/flags/senegal.svg" },
  Nigeria: { primary: "#008751", secondary: "#FFFFFF", flag: "/flags/nigeria.svg" },
  Croatia: { primary: "#171796", secondary: "#FF0000", flag: "/flags/croatia.svg" },
  Switzerland: { primary: "#DA291C", secondary: "#FFFFFF", flag: "/flags/switzerland.svg" },
  Belgium: { primary: "#000000", secondary: "#FFD700", flag: "/flags/belgium.svg" },
  Poland: { primary: "#DC143C", secondary: "#FFFFFF", flag: "/flags/poland.svg" },
  Ecuador: { primary: "#FFD100", secondary: "#0033A0", flag: "/flags/ecuador.svg" },
  Colombia: { primary: "#FCD116", secondary: "#003893", flag: "/flags/colombia.svg" },
  'Saudi Arabia': { primary: "#006C35", secondary: "#FFFFFF", flag: "/flags/saudi-arabia.svg" },
  Iran: { primary: "#239F40", secondary: "#DA0000", flag: "/flags/iran.svg" },
  Qatar: { primary: "#8A1538", secondary: "#FFFFFF", flag: "/flags/qatar.svg" },
};
```

**Note:** Current file is missing flag paths - this update adds them for navbar personalization.

---

### Hook Implementation

Create `/hooks/useTeamNavbarTheme.ts`:

```ts
import { useEffect } from 'react';
import { teamColors } from "@/lib/constants/teamColors";

export function useTeamNavbarTheme(favoriteTeam?: string) {
  useEffect(() => {
    const team = favoriteTeam ? teamColors[favoriteTeam] : null;
    
    const bg = team ? team.primary : "#FFFFFF"; // default white
    const text = team ? getContrastColor(team.primary) : "#111827"; // dynamic contrast
    const borderColor = team ? team.secondary : "var(--color-neutral-100)";

    document.documentElement.style.setProperty("--nav-bg", bg);
    document.documentElement.style.setProperty("--nav-text", text);
    document.documentElement.style.setProperty("--nav-border", borderColor);
  }, [favoriteTeam]);

  const team = favoriteTeam ? teamColors[favoriteTeam] : null;
  const flag = team?.flag || null;

  return { flag, teamColors: team };
}

// Helper function to determine text color based on background
function getContrastColor(hexColor: string): string {
  // Remove # and convert to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white text for dark backgrounds, dark text for light backgrounds
  return luminance > 0.5 ? "#111827" : "#FFFFFF";
}
```

---

### Navbar Integration

**Update existing** `/components/Header.tsx`:

```tsx
// Add imports
import { useTeamNavbarTheme } from '@/hooks/useTeamNavbarTheme';
import { useAuth } from '@/lib/AuthContext';

export default function Header() {
  // Existing code...
  const { user, loading, profile } = useAuth();
  
  // Add team theming
  const { flag } = useTeamNavbarTheme(profile?.favorite_team);

  return (
    <header 
      className={`sticky top-0 z-40 transition-all ${isScrolled ? 'shadow-md' : ''}`}
      style={{
        backgroundColor: "var(--nav-bg, #FFFFFF)",
        color: "var(--nav-text, #111827)",
        borderBottomColor: "var(--nav-border, var(--color-neutral-100))"
      }}
    >
      <div className="container flex items-center justify-between py-3 gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
          {flag && (
            <img 
              src={flag} 
              alt={`${profile?.favorite_team} flag`} 
              className="h-5 w-7 rounded-sm shadow-sm object-cover" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <span className="text-2xl">⚽</span>
          <span className="hidden sm:inline">WC26 Fan Zone</span>
          <span className="sm:hidden">WC26</span>
        </Link>

        {/* Rest of existing navbar code... */}
        {/* Keep all existing navigation links, auth logic, etc. */}
      </div>
    </header>
  );
}
```

**Key Changes:**
- Import team theming hook
- Access user profile from AuthContext
- Apply CSS custom properties for dynamic theming
- Add flag display with error handling
- Maintain all existing functionality

---

### CSS Additions

**Add to existing** `/app/globals.css`:

```css
:root {
  /* Existing variables... */
  
  /* Navbar theming variables */
  --nav-bg: #FFFFFF;
  --nav-text: #111827;
  --nav-border: var(--color-neutral-100);
  
  /* Planner color system variables */
  --trip-primary: #2563EB;
  --trip-secondary: #1D4ED8;
  --trip-accent: #1E40AF;

  --flight-primary: #0EA5E9;
  --flight-secondary: #0369A1;
  --flight-accent: #0284C7;

  --lodging-primary: #F87171;
  --lodging-secondary: #DC2626;
  --lodging-accent: #B91C1C;

  /* Dynamic planner theming */
  --planner-primary: var(--trip-primary);
  --planner-secondary: var(--trip-secondary);
  --planner-accent: var(--trip-accent);
}

/* Smooth transitions for theme changes */
header, nav {
  transition: background-color 0.4s ease, color 0.4s ease, border-color 0.4s ease;
}

/* Planner-specific overrides */
.planner-trip {
  --planner-primary: var(--trip-primary);
  --planner-secondary: var(--trip-secondary);
  --planner-accent: var(--trip-accent);
}

.planner-flight {
  --planner-primary: var(--flight-primary);
  --planner-secondary: var(--flight-secondary);
  --planner-accent: var(--flight-accent);
}

.planner-lodging {
  --planner-primary: var(--lodging-primary);
  --planner-secondary: var(--lodging-secondary);
  --planner-accent: var(--lodging-accent);
}

/* Utility classes for planner theming */
.btn-planner-primary {
  background-color: var(--planner-primary);
  color: white;
}

.btn-planner-primary:hover {
  background-color: var(--planner-secondary);
}

.border-planner-primary {
  border-color: var(--planner-primary);
}

.text-planner-primary {
  color: var(--planner-primary);
}

.bg-planner-gradient {
  background: linear-gradient(135deg, var(--planner-primary), var(--planner-secondary));
}
```

---

### Example UX Flow
- A fan selects **Netherlands** during onboarding.  
- All planners use consistent Trip/Flight/Lodging base colors.  
- The navbar background switches to **orange (#FF4B17)** with **Dutch flag 🇳🇱** displayed left of the logo.  
- This personalization carries across all pages (Trip Builder → Flight → Lodging → Guides).

---

## 🚀 Implementation Roadmap

### Phase 1: Core System Setup ⏱️ (2-3 hours)
1. **Update `teamColors.ts`** - Add flag paths to existing color constants
2. **Create `usePlannerTheme.ts`** - Hook for planner-specific color theming
3. **Create `useTeamNavbarTheme.ts`** - Hook for navbar personalization
4. **Update `globals.css`** - Add CSS custom properties and utility classes

### Phase 2: Planner Integration ⏱️ (3-4 hours)
1. **Update Trip Builder** - Apply `usePlannerTheme('trip')` hook
2. **Update Flight Planner** - Apply `usePlannerTheme('flight')` hook  
3. **Update Lodging Planner** - Apply `usePlannerTheme('lodging')` hook
4. **Update Planner Homepage** - Align card colors with system

### Phase 3: Navbar Personalization ⏱️ (2-3 hours)
1. **Update `Header.tsx`** - Integrate team theming hook
2. **Update `AuthContext.tsx`** - Ensure profile data includes `favorite_team`
3. **Add flag assets** - Download/create SVG flags for `/public/flags/`
4. **Test theme switching** - Verify smooth transitions and fallbacks

### Phase 4: Testing & Polish ⏱️ (2-3 hours)
1. **Accessibility testing** - Verify contrast ratios meet WCAG standards
2. **Responsive testing** - Ensure themes work across all device sizes
3. **Error handling** - Test missing flags, invalid team names
4. **Performance check** - Ensure no layout shifts or theme flickers

---

## 🧪 Testing Checklist

### Color System Tests
- [ ] Trip Builder shows blue theme (`#2563EB` → `#1D4ED8`)
- [ ] Flight Planner shows sky blue theme (`#0EA5E9` → `#0369A1`)  
- [ ] Lodging Planner shows coral theme (`#F87171` → `#DC2626`)
- [ ] Homepage cards match planner colors exactly
- [ ] Planner buttons/accents use CSS custom properties

### Navbar Personalization Tests
- [ ] Default navbar: white background, dark text
- [ ] Netherlands fan: orange background `#FF4B17`, white text
- [ ] Brazil fan: yellow background `#FEDD00`, dark text
- [ ] England fan: white background `#FFFFFF`, red accents
- [ ] Flag displays correctly (5×7 rounded, with error fallback)
- [ ] Smooth 0.4s transitions between theme changes

### Edge Cases
- [ ] User with no `favorite_team` → default styling
- [ ] Invalid team name → default styling  
- [ ] Missing flag file → flag hidden gracefully
- [ ] Team with light primary color → dark text for contrast
- [ ] Mobile navbar maintains theming
- [ ] Theme persists across page navigation

### Accessibility
- [ ] Minimum 4.5:1 contrast ratio for all team/text combinations
- [ ] Flag images have proper alt text
- [ ] Keyboard navigation unaffected
- [ ] Screen readers can identify team context

---

## 🧠 Developer Notes

- **Scope Limitation**: Team colors affect navbar only (not full-site theming)
- **Performance**: CSS custom properties enable instant theme switching
- **Fallback Strategy**: Always provide default values for non-team users
- **Flag Management**: Store all flags in `/public/flags/` as optimized SVGs
- **Contrast Testing**: Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) for validation
- **Profile Integration**: `favorite_team` comes from existing user profile onboarding
- **Cache Strategy**: Team preference stored in Supabase profile, no additional caching needed

---

## � Files to Create/Update

### New Files ✨
```
/hooks/usePlannerTheme.ts          # Planner color theming hook
/hooks/useTeamNavbarTheme.ts       # Navbar personalization hook
/public/flags/netherlands.svg      # Team flag assets
/public/flags/brazil.svg           # (28 total flags needed)
/public/flags/[...].svg            # etc.
```

### Updated Files 📝
```
/lib/constants/teamColors.ts       # Add flag paths to existing colors
/components/Header.tsx             # Integrate team navbar theming
/app/globals.css                   # Add CSS custom properties + utilities
/app/planner/page.tsx             # Update card colors to match system
/app/planner/trip-builder/page.tsx # Apply trip theme hook
/app/flight-planner/page.tsx       # Apply flight theme hook  
/app/lodging-planner/page.tsx      # Apply lodging theme hook
```

---

## �🚀 Executive Summary

| Area | Purpose | Primary Colors | Status |
|-------|----------|----------------|--------|
| Trip Builder | Planning / setup | `#2563EB` → `#1D4ED8` | 🔄 Integration needed |
| Flight Planner | Air travel | `#0EA5E9` → `#0369A1` | 🔄 Integration needed |
| Lodging Planner | Stay & comfort | `#F87171` → `#DC2626` | 🔄 Integration needed |
| Navbar (personalized) | Fan identity | Team primary + flag | ✨ New feature |

### Key Benefits:
- **Visual Consistency**: Unified color palette across all planners
- **Personal Touch**: Navbar reflects each fan's favorite team  
- **Scalable System**: CSS custom properties enable easy theming
- **Accessibility**: Dynamic contrast ensures readable text
- **Performance**: Smooth transitions without layout shifts

### Implementation Impact:
- **Total Development**: ~10-13 hours across 4 phases
- **User Experience**: Subtle personalization without overwhelming design
- **Technical Debt**: Minimal - builds on existing systems
- **Maintenance**: Self-contained hooks and CSS variables

---

**Outcome:**  
The site maintains a clean, professional visual identity while giving every fan a meaningful personal connection through their navbar. The three core planners feel distinct yet unified, and the homepage creates clear expectations that are fulfilled when users click through to each tool.

**Next Steps:**  
1. Start with Phase 1 (Core System Setup) to establish foundation
2. Test thoroughly in development with multiple team selections
3. Gather user feedback on team navbar personalization
4. Consider expanding theming to other site sections if well-received
