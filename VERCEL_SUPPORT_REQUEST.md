# URGENT Vercel Support Request

## Subject: Bot Protection Blocking Payment Webhooks - Revenue System Down

## Message:

Hello Vercel Support,

I urgently need help with bot protection blocking legitimate payment webhooks from Lemon Squeezy.

**Project Details:**
- Project: worldcup26
- Domain: www.worldcup26fanzone.com  
- Plan: Pro ($30/month - just upgraded specifically for this)
- Deployment ID: dpl_CxNsvBxUEne8Z5gMGPwZwaFh9iPF

**Problem:**
My payment processor (Lemon Squeezy) sends webhooks to `/api/webhooks/lemon` but they are being blocked with 429 errors by Vercel's bot protection. This prevents membership purchases from being processed, blocking my revenue stream.

**Evidence:**
```bash
curl -X POST https://www.worldcup26fanzone.com/api/webhooks/lemon
# Returns: HTTP/2 429 - Vercel Security Checkpoint
```

**What I Need:**
Please whitelist the following for the `/api/webhooks/lemon` endpoint:
1. Lemon Squeezy's webhook IP ranges, OR
2. Disable bot protection for `/api/webhooks/lemon` only, OR  
3. Provide instructions on how to properly configure webhook endpoints on Vercel Pro

**Business Impact:**
My membership sales system has been down for several hours. Every purchase is failing to process because webhooks can't reach my server. I upgraded to Pro specifically to resolve this issue but the Firewall UI doesn't provide path-based exclusions.

**What I've Tried:**
- ✅ Upgraded to Pro plan
- ✅ Added `runtime = 'nodejs'` and `dynamic = 'force-dynamic'` to route
- ✅ Created vercel.json with header configurations
- ❌ Bot protection still blocks webhooks

Please help ASAP - this is preventing revenue generation.

Thank you,
Eric

---

## Alternative: Lemon Squeezy Webhook IPs

If Vercel support can't help immediately, request these IP ranges from Lemon Squeezy support:

**To: Lemon Squeezy Support**

Subject: Need Webhook IP Ranges for Firewall Whitelisting

Hi Lemon Squeezy Team,

I need to whitelist your webhook IPs in my hosting provider's firewall. Can you provide:
1. The IP address ranges your webhooks originate from
2. Any User-Agent headers your webhooks use

This is for webhook endpoint: https://www.worldcup26fanzone.com/api/webhooks/lemon

Store ID: 233625
Product ID: 688338

Thanks!
