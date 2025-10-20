# Internationalization (i18n) Setup Guide

## Overview
WC26 Fan Zone is fully localized across 5 languages to serve the global World Cup 2026 audience.

## Supported Languages
- 🇺🇸 **English** (en) - Default
- 🇫🇷 **French** (fr)
- 🇪🇸 **Spanish** (es)
- 🇵🇹 **Portuguese** (pt)
- 🇸🇦 **Arabic** (ar)
- 🇩🇪 **German** (de) - Coming soon

## Implementation

### Technology Stack
- **next-intl** - Next.js i18n framework
- JSON translation files in `/messages` directory
- Middleware-based locale detection
- Server and client component support

### File Structure
```
web/
├── i18n.ts                  # Locale configuration
├── middleware.ts            # Locale detection middleware
├── messages/
│   ├── en.json             # English translations
│   ├── fr.json             # French translations
│   ├── es.json             # Spanish translations
│   ├── pt.json             # Portuguese translations
│   ├── ar.json             # Arabic translations
│   └── de.json             # German translations
└── i18n/
    └── request.ts          # Request configuration
```

## Translation Keys Structure

### Navigation (`nav`)
- `home` - Home link
- `blog` - Newsletter link
- `privacy` - Privacy policy link
- `guides` - City guides link
- `forums` - Forums link
- `planner` - AI planner link
- `roadmap` - Roadmap link

### Hero Section (`hero`)
- `title` - Main headline
- `subtitle` - Subheadline
- `subline` - Additional description line
- `emailPlaceholder` - Email input placeholder
- `cta` - Call-to-action button
- `exploreFeatures` - Explore features button

### Features (`features`)
- `title` - Section title
- `showcase.guides` - City guides feature card
- `showcase.forums` - Forums feature card
- `showcase.planner` - AI planner feature card

### Demo Section (`demo`)
- `title` - Demo video title
- `duration` - Video length
- `launching` - Launch date message
- `stayTuned` - Coming soon message

### Timeline (`timeline`)
- `title` - Timeline section title
- `subtitle` - Hover instruction
- `swipeHint` - Mobile swipe instruction
- `legend.past/upcoming/tournament/highlight` - Legend labels

### Guides Page (`guides`)
- `title` - Page heading
- `subtitle` - Page description
- `freeDownload` - Free download badge
- `cityCount` - Number of cities
- `downloadCTA` - Download button
- `waitlistCTA` - Waitlist button

### Forums Page (`forums`)
- `title` - Page heading
- `subtitle` - Page description
- `trending` - Trending section title
- `cityForums` - City forums section title
- `joinDiscussion` - Join button
- `createPost` - Create post button
- `replies/views` - Stats labels

### Contact Page (`contact`)
- `title` - Page heading
- `subtitle` - Page description
- `general/support/partnerships/media` - Contact categories
- `form.*` - Form field labels

### Footer (`footer`)
- `rights` - Copyright text
- `description` - Site description
- `disclaimer` - FIFA disclaimer
- `features/legal` - Section headings
- `cityGuides/fanForums/aiPlanner/newsletter` - Feature links
- `privacyPolicy/terms/contact` - Legal links
- `languages` - Language selector label

## Usage in Components

### Server Components
```typescript
import { useTranslations } from 'next-intl';

export default function Page() {
  const t = useTranslations('hero');
  
  return <h1>{t('title')}</h1>;
}
```

### Client Components
```typescript
'use client';
import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations('nav');
  
  return <Link href="/">{t('home')}</Link>;
}
```

### With Parameters
```typescript
const t = useTranslations('contact');

<p>{t('form.responseTime')}</p>
```

## Adding New Translations

1. **Add key to English file** (`messages/en.json`)
2. **Run translation update script:**
   ```bash
   cd web/messages
   ./update-translations.sh
   ```
3. **Manually translate** new keys in each language file
4. **Test** across all locales

## Locale Detection

The app automatically detects user locale via:
1. URL path prefix (`/fr/`, `/es/`, etc.)
2. Browser `Accept-Language` header
3. Falls back to English if unsupported

## Right-to-Left (RTL) Support

Arabic (`ar`) is configured with RTL support:
- Direction automatically set via `dir` attribute
- CSS adjusted for RTL layout
- Icon positions flipped appropriately

## Best Practices

### DO:
✅ Keep translation keys descriptive (`hero.exploreFeatures` not `hero.btn1`)
✅ Group related keys (`contact.form.*`, `nav.*`)
✅ Use consistent naming patterns
✅ Test all locales before deployment
✅ Keep strings short for UI elements
✅ Use placeholders for dynamic content

### DON'T:
❌ Hardcode English text in components
❌ Mix translation namespaces unnecessarily
❌ Forget to update all language files
❌ Use overly long strings in buttons
❌ Assume word length is consistent across languages
❌ Skip RTL testing for Arabic

## Translation Status

| Language | Coverage | Status | Notes |
|----------|----------|--------|-------|
| English  | 100%     | ✅ Complete | Base language |
| French   | 100%     | ✅ Complete | Professional translation |
| Spanish  | 100%     | ✅ Complete | Professional translation |
| Portuguese | 100%   | ✅ Complete | Professional translation |
| Arabic   | 100%     | ✅ Complete | Professional translation + RTL |
| German   | 50%      | 🚧 In Progress | Legacy content only |

## Testing Locales

### Local Development
```bash
# Visit specific locale
http://localhost:3000/fr
http://localhost:3000/es
http://localhost:3000/pt
http://localhost:3000/ar

# Default (English)
http://localhost:3000
```

### Automated Testing
```bash
# Check for missing keys
npm run i18n:check

# Validate JSON syntax
npm run i18n:validate
```

## Performance

- **Load Time:** Translation files loaded per locale (code splitting)
- **Bundle Size:** ~5-8KB per language file (gzipped)
- **Caching:** Static translations cached by Next.js
- **Server-Side:** First render uses server translations (no flicker)

## Future Enhancements

- [ ] Add Japanese (🇯🇵) and Korean (🇰🇷) for Asian markets
- [ ] Implement translation management platform (Lokalise/Crowdin)
- [ ] Add community translation contributions
- [ ] Create translation style guide
- [ ] Implement automatic translation updates via CI/CD
- [ ] Add locale-specific date/time formatting
- [ ] Implement currency conversion for different markets

## Resources

- **next-intl docs:** https://next-intl-docs.vercel.app/
- **Translation files:** `/web/messages/`
- **Config:** `/web/i18n.ts`
- **Middleware:** `/web/middleware.ts`

---

Last updated: November 10, 2024
