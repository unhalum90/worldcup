# 🗨️ World Cup Fan Zone — Reddit-Style Forum Build Spec

> **Goal:** Recreate a Reddit-style discussion board experience within the World Cup 26 Fan Zone app, integrated with Supabase for auth, data, and role-based moderation.

---

## 🧱 1. System Overview

A **Reddit-style discussion module** will serve as the social backbone of the Fan Zone app.  
Each **host city** has its own subforum (e.g., `/forums/seattle`, `/forums/dallas`).  
Threads, posts, votes, and comments are stored in Supabase with granular role-based access.  
Front-end powered by **Next.js 15**, **TailwindCSS**, **shadcn/ui**, and **Supabase client hooks**.

---

## 🧩 2. Supabase Tables

### **users**
Stores user account data synced with Supabase Auth.

| Column | Type | Description |
|---------|------|--------------|
| id | uuid (PK) | user ID from auth |
| handle | text | display name |
| avatar_url | text | public avatar image |
| country | text | fan's home country |
| role | enum('user','paid','moderator','admin') | access level |
| created_at | timestamp | registration date |

---

### **cities**
Used to scope subforums per host city.

| Column | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | unique ID |
| name | text | City name (e.g., Seattle) |
| slug | text | URL slug (e.g., seattle) |
| country | text | US / MX / CA |
| tz | text | Timezone |

---

### **threads**
Top-level discussions (similar to Reddit posts).

| Column | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | thread ID |
| city_id | uuid (FK → cities.id) | links to host city |
| author_id | uuid (FK → users.id) | creator |
| title | text | thread title |
| body_md | text | markdown body |
| topic | text | category (e.g., "Tickets", "Food", "Transport") |
| pinned | boolean | pinned thread flag |
| locked | boolean | lock thread to stop replies |
| score | integer | upvotes - downvotes |
| created_at | timestamp | created date |
| updated_at | timestamp | last edit |

**Indexes:** `(city_id, created_at DESC)` for listing, `(score DESC)` for trending.

---

### **posts**
Replies to threads (first-level only).

| Column | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | post ID |
| thread_id | uuid (FK → threads.id) | parent thread |
| author_id | uuid (FK → users.id) | poster |
| body_md | text | reply markdown |
| score | integer | upvotes - downvotes |
| created_at | timestamp | reply date |

---

### **comments**
Nested replies to posts (for threaded discussions).

| Column | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | comment ID |
| post_id | uuid (FK → posts.id) | parent post |
| author_id | uuid (FK → users.id) | commenter |
| body_md | text | markdown content |
| score | integer | vote count |
| created_at | timestamp | timestamp |

---

### **votes**
Stores upvotes/downvotes by user per item (thread, post, or comment).

| Column | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | unique vote ID |
| user_id | uuid (FK → users.id) | voter |
| target_type | enum('thread','post','comment') | vote target |
| target_id | uuid | target reference ID |
| value | smallint | +1 or -1 |

---

### **reports**
User flagging for moderation.

| Column | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | report ID |
| reporter_id | uuid (FK → users.id) | reporter |
| target_type | enum('thread','post','comment') | |
| target_id | uuid | item being reported |
| reason | text | user-provided reason |
| status | enum('open','resolved','dismissed') | moderation workflow |
| created_at | timestamp | |

---

### **topics**
Predefined categories for each city (like Reddit flairs).

| Column | Type | Description |
|---------|------|-------------|
| id | uuid (PK) | unique ID |
| city_id | uuid (FK → cities.id) | host city |
| name | text | Topic name (e.g., “Tickets”, “Meetups”) |
| slug | text | topic slug |

---

## 🔐 3. Row Level Security (RLS) Policies

**threads**  
- `SELECT`: public  
- `INSERT`: `auth.uid() = author_id`  
- `UPDATE`: only author or moderator  
- `DELETE`: admin only

**posts/comments**  
- `SELECT`: public  
- `INSERT`: logged-in users only  
- `UPDATE`: author or moderator  
- `DELETE`: moderator/admin

**votes**  
- `INSERT/UPDATE`: one per user per target (`ON CONFLICT` constraint)

**reports**  
- `INSERT`: logged-in users  
- `UPDATE`: moderators/admin only

**cities/topics**  
- `SELECT`: public (used for route generation)

---

## 🖥️ 4. Front-End Setup (Next.js + Supabase + Tailwind)

### Framework Stack
- **Frontend:** Next.js 15 App Router + Server Components  
- **Styling:** TailwindCSS + shadcn/ui  
- **Auth:** Supabase Auth (email magic links → persistent session)  
- **State Management:** TanStack Query / SWR for cache  
- **Markdown Rendering:** `react-markdown` + `rehype-sanitize`  
- **Icons:** Lucide React  
- **Pagination:** Infinite scroll per city feed

### Folder Structure

```
app/
 ├─ (marketing)/
 │   ├─ page.tsx              → Landing page
 │   └─ waitlist/page.tsx     → Waitlist
 ├─ forums/
 │   ├─ [city]/page.tsx       → Forum index (threads list)
 │   ├─ [city]/[thread]/page.tsx → Thread + posts view
 │   └─ new/page.tsx          → Create thread form
 ├─ components/
 │   ├─ ThreadCard.tsx
 │   ├─ PostItem.tsx
 │   ├─ CommentTree.tsx
 │   ├─ UpvoteButton.tsx
 │   └─ MarkdownEditor.tsx
 ├─ lib/
 │   ├─ supabaseClient.ts
 │   └─ types.ts
 └─ utils/
     └─ timeAgo.ts
```

---

## 🧠 5. UI / UX Details

### Thread List (City Forum)
- Reddit-like cards with title, author, city flair, vote count, comment count, and time ago.  
- Sort toggles: *Hot, New, Top, Rising* (based on score + time).  
- Filters by *Topic* (Tickets, Food, Transport, etc).

### Thread View
- Markdown-rendered body.  
- Reply box (auto-expanding textarea).  
- Upvote/downvote toggles on both thread and replies.  
- “Best” sort (top-scored replies).

### New Thread Form
- Dropdown for city + topic.  
- Markdown editor preview.  
- Auto-save draft in localStorage.  

### Comments
- Nested reply tree (max depth 3).  
- “View more replies” collapsible.  
- Light/dark mode friendly design.

### Moderator Panel
- Inline moderation actions (pin, lock, delete, ban).  
- Bulk resolve reports.  
- Automod triggers: block spam terms, throttle posting rate.

---

## 💾 6. Future Enhancements

| Feature | Description |
|----------|--------------|
| **Badges & Flair** | Add fan country flags next to usernames. |
| **Tag by Team** | Link posts to teams once group draw is official. |
| **Live Match Threads** | Auto-generate pinned matchday threads per city & match. |
| **Media Embeds** | Support YouTube, TikTok, and image uploads (Supabase storage). |
| **AI Thread Summaries** | Daily digest summarizing trending threads. |

---

## 🧩 7. Minimal Viable Build Order

1. **Sprint 1:** Threads + Posts CRUD (auth + markdown).  
2. **Sprint 2:** Votes + Pagination + City filter.  
3. **Sprint 3:** Comments nesting + Moderator actions.  
4. **Sprint 4:** Reports + Automod.  
5. **Sprint 5:** Matchday Live Threads + Flair.  

---

**Prepared by:** Eric Chamberlin  
**Date:** October 6, 2025  
**File:** `reddit_style_forum_build.md`
