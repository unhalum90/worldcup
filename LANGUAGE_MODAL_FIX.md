# 🔧 Language Modal Cookie Fix

## Issue
Language modal was setting cookies (`NEXT_LOCALE`) but the app wasn't reading them, so language changes had no effect.

## Root Cause
1. **LanguageModal** correctly set `NEXT_LOCALE` cookie ✅
2. **middleware.ts** was not reading the cookie ❌
3. **i18n/request.ts** was not checking cookies for locale ❌

## Solution Applied

### 1. Updated `middleware.ts`
```typescript
export function middleware(req: NextRequest) {
  // Get locale from cookie
  const locale = req.cookies.get('NEXT_LOCALE')?.value || defaultLocale;
  
  // Clone the request headers
  const requestHeaders = new Headers(req.headers);
  
  // Set the locale header so next-intl can pick it up
  requestHeaders.set('x-next-intl-locale', locale);
  
  // Return response with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
```

**What this does:**
- Reads `NEXT_LOCALE` cookie from request
- Sets `x-next-intl-locale` header
- Passes it to next-intl

### 2. Updated `i18n/request.ts`
```typescript
export default getRequestConfig(async () => {
  // Get locale from cookie
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  
  const lc = (localeCookie ?? defaultLocale) as (typeof locales)[number];
  const isSupported = (locales as readonly string[]).includes(lc);
  const current = (isSupported ? lc : defaultLocale) as string;

  return {
    locale: current,
    messages: (await import(`../messages/${current}.json`)).default,
  };
});
```

**What this does:**
- Directly reads `NEXT_LOCALE` cookie using Next.js `cookies()` API
- Validates locale is supported
- Loads correct translation messages
- Falls back to `defaultLocale` if invalid

## How It Works Now

### User Flow:
1. **First Visit:**
   - User sees language modal after 500ms
   - User clicks "Français" (French)
   - Modal sets two cookies:
     - `wc26-language-selected=true` (prevents modal showing again)
     - `NEXT_LOCALE=fr` (stores language preference)
   - Page reloads

2. **On Reload:**
   - **Middleware** reads `NEXT_LOCALE` cookie → finds `fr`
   - Sets `x-next-intl-locale: fr` header
   - **Request config** also reads cookie → confirms `fr`
   - Loads `/messages/fr.json`
   - All `useTranslations()` hooks return French text
   - **Layout** sets `<html lang="fr">`

3. **Subsequent Visits:**
   - Cookie persists for 365 days
   - No modal shown (has `wc26-language-selected` cookie)
   - Site automatically loads in French

4. **Language Switching (Footer):**
   - User clicks "Español" badge in footer
   - JavaScript updates `NEXT_LOCALE` cookie to `es`
   - Page reloads
   - Same flow as above → Spanish content loads

## Testing Instructions

### Test 1: First Visit with French Selection
1. Clear all cookies for localhost:3000
2. Visit homepage
3. Wait for modal (500ms)
4. Click "Français"
5. **Expected:** Page reloads, all content is in French

### Test 2: Cookie Persistence
1. After Test 1 completes (French loaded)
2. Navigate to `/guides`, `/forums`, `/contact`
3. **Expected:** All pages display in French
4. Close browser completely
5. Reopen and visit localhost:3000
6. **Expected:** Site loads in French, no modal

### Test 3: Language Switching
1. Scroll to footer
2. Click "Español" badge
3. **Expected:** Page reloads, all content switches to Spanish
4. Navigate to other pages
5. **Expected:** All pages remain in Spanish

### Test 4: Arabic RTL
1. Click "العربية" (Arabic) in footer
2. **Expected:** Page reloads with:
   - All text in Arabic
   - Right-to-left layout
   - Text right-aligned
   - Navigation reversed

### Test 5: Invalid Cookie Handling
1. Open browser DevTools → Console
2. Set invalid cookie: `document.cookie = "NEXT_LOCALE=invalid; path=/"`
3. Reload page
4. **Expected:** Site falls back to English (defaultLocale)

## Verification Checklist

- [ ] Modal appears on first visit (after cookie clear)
- [ ] Selecting language sets both cookies
- [ ] Page reloads after language selection
- [ ] Content changes to selected language
- [ ] Modal doesn't appear on second visit
- [ ] Footer language switcher works
- [ ] Language persists across page navigations
- [ ] Language persists after browser close/reopen
- [ ] Arabic enables RTL layout
- [ ] Invalid locale falls back to English

## Files Modified

| File | Change | Purpose |
|------|--------|---------|
| `web/middleware.ts` | Read cookie, set header | Pass locale to next-intl |
| `web/i18n/request.ts` | Read cookie directly | Load correct translations |

## Technical Notes

### Why Two Approaches?
We're using both middleware header setting AND direct cookie reading in request config for redundancy and compatibility with next-intl's expected patterns.

### Cookie vs URL Routing
This approach uses **cookies** instead of URL-based routing (`/fr/guides`):
- ✅ **Pros:** Simple, no app restructuring, works immediately
- ❌ **Cons:** URLs don't show language, requires page reload

### Next.js 15 Compatibility
- Uses `await cookies()` (Next.js 15 async API)
- Middleware uses new `NextRequest` cookie access
- Compatible with App Router

## Debugging Tips

### Check Cookie Value
Open DevTools → Application → Cookies → localhost:3000
Look for: `NEXT_LOCALE` → should show `fr`, `es`, `pt`, or `ar`

### Check Current Locale
In any component:
```typescript
import { useLocale } from 'next-intl';

const locale = useLocale();
console.log('Current locale:', locale);
```

### Check Loaded Messages
In any component:
```typescript
import { useTranslations } from 'next-intl';

const t = useTranslations('nav');
console.log('Guides text:', t('guides')); // Should be translated
```

### Server Logs
Watch terminal for:
```
 ✓ Compiled in XXXms
 GET / 200 in XXXms
```
No errors should appear after locale changes.

---

**Status:** ✅ Fixed and Ready to Test  
**Date:** January 2025  
**Branch:** feat/website-updates
