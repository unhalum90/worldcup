# Admin Authentication & Dashboard Fixes

## Issues Fixed

### 1. Login Requiring Page Refresh
**Problem**: After entering credentials, the admin dashboard required a manual page refresh to load properly.

**Root Cause**: 
- Using `window.location.href` for navigation bypassed Next.js client-side routing
- Session wasn't synced to server cookies before navigation
- Auth state change wasn't propagated properly

**Solution**:
- Changed from `window.location.href = "/admin"` to `router.push("/admin")`
- Added explicit session sync to `/api/auth/session` before redirecting
- This ensures cookies are set on the server before the dashboard layout checks auth

**Files Modified**:
- `/app/admin/login/page.tsx`

### 2. Blog & Drafts Sections Spinning/Timing Out
**Problem**: Blog and Drafts sections showed infinite loading spinner with "auth-timeout" errors in console.

**Root Causes**:
1. Admin layout had a 10-second timeout on `getUser()` that was racing with page load
2. `getUser()` makes a network request and can be slow, especially right after login
3. No error handling in blog/drafts pages for auth or database errors

**Solutions**:
1. **Improved Admin Layout Auth Check**:
   - Check `getSession()` first (faster, reads from local storage)
   - Only fall back to `getUser()` if session is missing
   - Reduced timeout from 10s to 5s
   - Better error handling for timeout scenarios
   - Redirect to login on timeout instead of failing open

2. **Added Error Handling to Dashboard Pages**:
   - Added error state tracking
   - Proper error checking on Supabase queries
   - Display error messages to user
   - Added retry buttons
   - Better console logging for debugging

**Files Modified**:
- `/app/admin/(dashboard)/layout.tsx`
- `/app/admin/(dashboard)/blog/page.tsx`
- `/app/admin/(dashboard)/drafts/page.tsx`

## Technical Details

### Auth Flow Before
```
1. User enters credentials
2. supabase.auth.signInWithPassword() → Creates session in browser
3. setTimeout(500ms) → Arbitrary wait
4. window.location.href = "/admin" → Hard page reload
5. Admin layout loads
6. getUser() with 10s timeout → Can be slow
7. Session may or may not be available yet → Race condition
```

### Auth Flow After
```
1. User enters credentials
2. supabase.auth.signInWithPassword() → Creates session
3. Sync session to server via /api/auth/session → Ensures cookies set
4. router.push("/admin") → Client-side navigation
5. Admin layout loads
6. getSession() → Fast, reads from storage
7. Fallback to getUser() only if needed
8. User sees dashboard immediately
```

### Session Sync Mechanism
The `/api/auth/session` endpoint uses `@supabase/ssr` to properly set auth cookies on the server. This is crucial for:
- Server-side rendering (SSR)
- Middleware authentication
- Avoiding race conditions between client and server

## Testing

### Manual Test Steps
1. **Test Login Flow**:
   ```
   - Go to /admin/login
   - Enter credentials
   - Click "Signing in..." button
   - Should navigate to /admin immediately without refresh
   - Dashboard should load without spinning
   ```

2. **Test Blog Dashboard**:
   ```
   - Navigate to /admin/blog
   - Should load stats without timeout
   - If error occurs, should show error message with Retry button
   ```

3. **Test Drafts Page**:
   ```
   - Navigate to /admin/drafts
   - Should load drafts and published posts
   - Tabs should switch properly
   - If error, should show error with Retry
   ```

### Console Logs to Monitor
- `[AdminLayout] Checking auth...`
- `[AdminLayout] No session, checking getUser...` (if session isn't available)
- `Login successful, user: <email>`
- Any errors should be descriptive, not just "auth-timeout"

## Additional Recommendations

### 1. Consider Adding Loading States
The admin layout could show a better loading UI during the initial auth check.

### 2. RLS Policies
Ensure that `blog_posts`, `keywords`, and related tables have appropriate RLS policies:
- Public read access OR
- Admin-only access with proper role checking

### 3. Environment Variables
Verify these are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ADMIN_EMAILS` (optional, for allowlist)

### 4. Monitoring
Add error tracking (e.g., Sentry) to catch auth timeouts in production.

## Rollback Instructions
If these changes cause issues, you can revert:
```bash
git diff HEAD app/admin/login/page.tsx app/admin/\(dashboard\)/layout.tsx app/admin/\(dashboard\)/blog/page.tsx app/admin/\(dashboard\)/drafts/page.tsx
```

Then restore previous versions or adjust as needed.
