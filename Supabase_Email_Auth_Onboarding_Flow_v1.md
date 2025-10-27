# 🧭 Supabase Email Verification & Onboarding Flow — WC26 Fan Zone

**Date:** October 27, 2025  
**Author:** Eric Chamberlin  
**Purpose:** Define and implement a seamless, verified email onboarding experience for new users entering via the “Plan My Trip Free” CTA.

---

## ⚙️ Goal

Enable new users to:
1. Enter their email → receive Supabase confirmation link.  
2. Confirm via email → return automatically logged in.  
3. Launch onboarding instantly (no separate login screen).  
4. Optionally subscribe to newsletter (Beehiiv / Make.com).  

---

## 🧩 Flow Overview

### User Journey

```
Homepage → Email Modal → Supabase Confirmation Email
      ↓
User clicks confirmation link
      ↓
Supabase sets active session (no login prompt)
      ↓
Redirect → /onboarding (auto-start)
```

### Key Objectives
- ✅ Require real emails via Supabase’s built-in confirmation  
- ✅ Avoid extra “login” friction  
- ✅ Start onboarding automatically after verification  
- ✅ Integrate newsletter opt-in if checkbox ticked  

---

## 🧱 1. Front-End Components

### A. Homepage CTA
```jsx
<Button className="bg-red-600 hover:bg-red-700 text-white">
  Plan My Trip Free →
</Button>
```
On click → opens modal.

---

### B. Email Capture Modal

#### Copy:
**Header:** ✈️ Let’s plan your World Cup 26 trip  
**Body:**  
> Get instant access to your Trip Builder and personalized travel planners for all host cities.  
> You’ll also get updated guides automatically after the Dec 5 Draw.

Form fields:
```jsx
<input type="email" placeholder="you@example.com" required />
<label>
  <input type="checkbox" defaultChecked />
  Subscribe for travel alerts and city updates
</label>
<Button>Continue →</Button>
```

---

### C. Submit Handler (Supabase signUp)
```ts
import { supabase } from "@/lib/supabaseClient";

async function handleSignup(email: string, optIn: boolean) {
  const { error } = await supabase.auth.signUp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    toast.error("Error signing up. Please try again.");
  } else {
    // Send newsletter opt-in to Beehiiv via Make webhook
    if (optIn) {
      await fetch("/api/newsletter-optin", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    }
    router.push("/verify-email");
  }
}
```

---

## 💌 2. Verification Step

### `/verify-email` page

**Purpose:** Confirm that a verification email was sent.

**Content:**
```jsx
<h1>Check your inbox ✉️</h1>
<p>
  We’ve sent a confirmation link to your email.  
  Click it to verify and unlock your Trip Builder.
</p>
<Button onClick={resendEmail}>Resend Email</Button>
<Button variant="link" onClick={() => router.push("/")}>
  Back to Home
</Button>
```
Optional helper:
```ts
async function resendEmail() {
  await supabase.auth.resend({
    type: "signup",
    email: userEmail,
    options: { emailRedirectTo: `${SITE_URL}/auth/callback` },
  });
}
```

---

## 🔗 3. Supabase Confirmation & Session Handling

### `/auth/callback` page
```tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        router.replace("/onboarding");
      } else {
        router.replace("/login");
      }
    }
    checkSession();
  }, [router]);

  return (
    <main className="flex h-screen items-center justify-center">
      <p>Verifying your account...</p>
    </main>
  );
}
```

---

## 🧠 4. Onboarding Auto-Start

### `/onboarding` page logic
```ts
const { data: { user } } = await supabase.auth.getUser();

if (user) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      verified: true,
      favorite_team: null,
      created_at: new Date(),
    });
  }
}
```

Then, render onboarding wizard (Team, Group Size, Travel Style, etc.).

---

## 🔄 5. Newsletter Integration

### Option A — via Make.com Webhook
```ts
await fetch("https://hook.integromat.com/yourwebhookid", {
  method: "POST",
  body: JSON.stringify({
    email,
    source: "onboarding",
    project: "World Cup 26 Fan Zone",
    opt_in: true,
  }),
});
```

### Option B — Direct Beehiiv API
```ts
await fetch("https://api.beehiiv.com/v2/publications/{pub_id}/subscriptions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.BEEHIIV_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email }),
});
```

---

## 🧩 6. Database Schema Updates

| Table | Field | Type | Purpose |
|--------|-------|------|----------|
| `profiles` | `id` | UUID | Matches Supabase auth ID |
| `email` | text |  | Primary contact |
| `verified` | boolean |  | Email verified flag |
| `favorite_team` | text |  | Used later for color theming |
| `language` | text |  | EN / ES / FR etc |
| `created_at` | timestamptz |  | Default now() |

---

## ✅ 7. Expected User Flow Summary

| Step | User Sees | Action | System Response |
|------|------------|--------|----------------|
| Homepage | “Plan My Trip Free” | Click | Opens modal |
| Email Modal | Enter email + opt-in | Submit | Supabase sends confirmation email |
| Verify Page | “Check your inbox” | Wait | Email link received |
| Email Confirmation | Click verification link | Supabase logs in user |
| Redirect | `/onboarding` | Start | Session active, onboarding begins |

---

## 🎨 8. Visual Notes

| Step | Visual Element | Reference |
|------|----------------|------------|
| Email modal | 480px white card, blurred background | Same style as login |
| Verify page | Centered card, checkmark or envelope icon | Reuse auth layout |
| Onboarding | Existing flow (Team → Style → Focus) | No changes needed |
| Colors | Red CTA for submit, blue accent for secondary actions | Consistent with brand palette |

---

## 🔒 9. Testing Checklist

| Test | Expected Result |
|------|-----------------|
| Enter valid email | Confirmation email sent |
| Click Supabase link | Redirect → onboarding (no login prompt) |
| Invalid email | Error toast “Invalid email” |
| Opt-in checked | Added to Beehiiv list |
| Unchecked | No newsletter API call |
| Revisit site (logged in) | Redirect → dashboard or `/travel-planner` |

---

## 🚀 Next Steps
1. Implement `/auth/callback` + `/verify-email` pages.  
2. Connect Beehiiv opt-in endpoint.  
3. QA full journey across mobile + desktop.  
4. Merge flow before Dec 5 Draw to maximize subscriber onboarding window.  

---

**Filename:** `Supabase_Email_Auth_Onboarding_Flow_v1.md`