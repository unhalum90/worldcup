# Fan Zone City Cup — Build Plan

## Phase 1: Pre-Draw Tournament (Nov 18-Dec 4)
**Ship by: Nov 17 EOD**

---

## Database Schema

### New Tables to Add

```sql
-- Tournament configuration
CREATE TABLE public.tournament_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, -- "Pre-Draw City Showdown"
  slug text UNIQUE NOT NULL, -- "pre-draw-2024"
  status text CHECK (status IN ('upcoming', 'active', 'completed')) DEFAULT 'upcoming',
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone,
  description text,
  rules_md text,
  created_at timestamp with time zone DEFAULT now()
);

-- Tournament matchups
CREATE TABLE public.tournament_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES public.tournament_config(id),
  round_number integer NOT NULL, -- 1, 2, 3, 4
  round_name text NOT NULL, -- "Regional Quarterfinals", "Semifinals", etc.
  round_theme text NOT NULL, -- "Best First Impression", "Best Match Day Experience"
  round_theme_description text,
  
  city_a_id uuid REFERENCES public.cities(id),
  city_b_id uuid REFERENCES public.cities(id),
  
  votes_a integer DEFAULT 0,
  votes_b integer DEFAULT 0,
  
  status text CHECK (status IN ('upcoming', 'active', 'closed')) DEFAULT 'upcoming',
  voting_opens_at timestamp with time zone,
  voting_closes_at timestamp with time zone,
  
  winner_city_id uuid REFERENCES public.cities(id),
  
  match_number integer, -- For ordering within round
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- User votes (prevent duplicate voting)
CREATE TABLE public.tournament_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES public.tournament_matches(id),
  user_id uuid REFERENCES auth.users(id),
  city_id uuid REFERENCES public.cities(id) NOT NULL, -- Which city they voted for
  ip_address text, -- Backup for non-logged-in users
  created_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(match_id, user_id), -- One vote per user per match
  UNIQUE(match_id, ip_address) -- One vote per IP per match (if not logged in)
);

-- User stories/comments on matchups
CREATE TABLE public.tournament_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES public.tournament_matches(id),
  user_id uuid REFERENCES auth.users(id),
  city_id uuid REFERENCES public.cities(id), -- Which city they're commenting about
  comment_text text NOT NULL,
  is_featured boolean DEFAULT false, -- Admin can feature great stories
  score integer DEFAULT 0, -- For upvoting good stories
  created_at timestamp with time zone DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_comments ENABLE ROW LEVEL SECURITY;

-- Everyone can read matches
CREATE POLICY "Anyone can view matches" ON public.tournament_matches
  FOR SELECT USING (true);

-- Only authenticated users can vote
CREATE POLICY "Authenticated users can insert votes" ON public.tournament_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own votes" ON public.tournament_votes
  FOR SELECT USING (auth.uid() = user_id);

-- Anyone can read comments
CREATE POLICY "Anyone can view comments" ON public.tournament_comments
  FOR SELECT USING (true);

-- Authenticated users can add comments
CREATE POLICY "Authenticated users can add comments" ON public.tournament_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Database Functions

```sql
-- Function to cast vote and update match totals
CREATE OR REPLACE FUNCTION cast_tournament_vote(
  p_match_id uuid,
  p_city_id uuid,
  p_user_id uuid DEFAULT NULL,
  p_ip_address text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
  v_match record;
BEGIN
  -- Check if match is open for voting
  SELECT * INTO v_match 
  FROM tournament_matches 
  WHERE id = p_match_id AND status = 'active';
  
  IF v_match IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Match not open for voting');
  END IF;
  
  -- Insert vote (will fail if duplicate due to UNIQUE constraint)
  BEGIN
    INSERT INTO tournament_votes (match_id, user_id, city_id, ip_address)
    VALUES (p_match_id, p_user_id, p_city_id, p_ip_address);
  EXCEPTION WHEN unique_violation THEN
    RETURN json_build_object('success', false, 'error', 'Already voted');
  END;
  
  -- Update vote counts
  IF p_city_id = v_match.city_a_id THEN
    UPDATE tournament_matches 
    SET votes_a = votes_a + 1, updated_at = now()
    WHERE id = p_match_id;
  ELSIF p_city_id = v_match.city_b_id THEN
    UPDATE tournament_matches 
    SET votes_b = votes_b + 1, updated_at = now()
    WHERE id = p_match_id;
  END IF;
  
  -- Return updated totals
  SELECT json_build_object(
    'success', true,
    'votes_a', votes_a,
    'votes_b', votes_b
  ) INTO v_result
  FROM tournament_matches
  WHERE id = p_match_id;
  
  RETURN v_result;
END;
$$;
```

---

## Frontend Routes & Components

### New Routes

```
/tournament                    → Tournament hub page
/tournament/[slug]             → Specific tournament (e.g., /tournament/pre-draw-2024)
/tournament/[slug]/[matchId]   → Individual match page
/tournament/rules              → Rules & format explainer
```

### File Structure

```
app/
├── tournament/
│   ├── page.tsx                          → Main tournament hub
│   ├── [slug]/
│   │   ├── page.tsx                      → Tournament overview (bracket view)
│   │   ├── [matchId]/
│   │   │   └── page.tsx                  → Individual match voting page
│   ├── rules/
│   │   └── page.tsx                      → Rules & format
│
components/
├── tournament/
│   ├── TournamentBracket.tsx             → Visual bracket display
│   ├── MatchCard.tsx                     → City vs City card component
│   ├── VotingInterface.tsx               → Vote buttons + results
│   ├── MatchCountdown.tsx                → Timer to voting close
│   ├── RoundThemeHeader.tsx              → Round theme banner
│   ├── CityStoryForm.tsx                 → Comment/story submission
│   ├── FeaturedStories.tsx               → Showcase user stories
│   └── TournamentLeaderboard.tsx         → Standings (for Jan-Apr format)
```

---

## Component Specifications

### 1. `/tournament` — Main Hub Page

**Hero Section:**
```tsx
- Large "Fan Zone City Cup" logo
- "Vote for the Best 2026 Host City" headline
- Current tournament status: "Round 2: Best Match Day Experience"
- Countdown: "Voting closes in 2 days, 14 hours"
- CTA: "Vote Now" (scrolls to active matches)
```

**Active Matches Section:**
```tsx
<div className="grid md:grid-cols-2 gap-6">
  {activeMatches.map(match => (
    <MatchCard
      key={match.id}
      cityA={match.city_a}
      cityB={match.city_b}
      votesA={match.votes_a}
      votesB={match.votes_b}
      roundTheme={match.round_theme}
      closingTime={match.voting_closes_at}
      status={match.status}
    />
  ))}
</div>
```

**Bracket Overview:**
```tsx
<TournamentBracket
  matches={allMatches}
  currentRound={2}
  highlightActive={true}
/>
```

**How It Works:**
- 3-step explainer
- "New matchups every Monday"
- "Vote before Friday at 11:59 PM ET"
- "Share your city stories in comments"

---

### 2. `MatchCard.tsx` Component

```tsx
interface MatchCardProps {
  match: {
    id: string;
    city_a: City;
    city_b: City;
    votes_a: number;
    votes_b: number;
    round_theme: string;
    voting_closes_at: string;
    status: 'active' | 'closed' | 'upcoming';
  };
}

export function MatchCard({ match }: MatchCardProps) {
  const totalVotes = match.votes_a + match.votes_b;
  const percentA = totalVotes > 0 ? (match.votes_a / totalVotes) * 100 : 50;
  const percentB = totalVotes > 0 ? (match.votes_b / totalVotes) * 100 : 50;
  
  return (
    <Link href={`/tournament/pre-draw-2024/${match.id}`}>
      <div className="border rounded-lg p-6 hover:shadow-lg transition">
        {/* Round Theme Badge */}
        <div className="text-sm text-blue-600 font-semibold mb-2">
          {match.round_theme}
        </div>
        
        {/* City Matchup */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-center flex-1">
            <div className="text-2xl font-bold">{match.city_a.name}</div>
            <div className="text-sm text-gray-500">{match.city_a.stadium_name}</div>
          </div>
          
          <div className="text-3xl font-bold text-gray-300 mx-4">VS</div>
          
          <div className="text-center flex-1">
            <div className="text-2xl font-bold">{match.city_b.name}</div>
            <div className="text-sm text-gray-500">{match.city_b.stadium_name}</div>
          </div>
        </div>
        
        {/* Vote Progress Bar (only show if voting started) */}
        {match.status === 'active' && totalVotes > 50 && (
          <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div 
              className="absolute left-0 h-full bg-blue-500 flex items-center justify-start pl-3 text-white font-bold text-sm"
              style={{ width: `${percentA}%` }}
            >
              {percentA.toFixed(0)}%
            </div>
            <div 
              className="absolute right-0 h-full bg-red-500 flex items-center justify-end pr-3 text-white font-bold text-sm"
              style={{ width: `${percentB}%` }}
            >
              {percentB.toFixed(0)}%
            </div>
          </div>
        )}
        
        {/* Status / CTA */}
        {match.status === 'active' && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{totalVotes.toLocaleString()} votes</span>
            <MatchCountdown closingTime={match.voting_closes_at} />
          </div>
        )}
        
        {match.status === 'upcoming' && (
          <div className="text-center text-gray-500">
            Opens {new Date(match.voting_opens_at).toLocaleDateString()}
          </div>
        )}
        
        {match.status === 'closed' && (
          <div className="text-center font-bold text-green-600">
            Winner: {match.winner_city_id === match.city_a.id ? match.city_a.name : match.city_b.name}
          </div>
        )}
      </div>
    </Link>
  );
}
```

---

### 3. `/tournament/[slug]/[matchId]` — Match Voting Page

**Layout:**

```tsx
export default async function MatchPage({ params }: { params: { matchId: string } }) {
  const match = await getMatch(params.matchId);
  const userVote = await getUserVote(params.matchId); // Check if already voted
  
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Theme Header */}
      <RoundThemeHeader
        roundName={match.round_name}
        theme={match.round_theme}
        description={match.round_theme_description}
      />
      
      {/* City Matchup Hero */}
      <div className="grid md:grid-cols-2 gap-8 my-12">
        <CityCard city={match.city_a} />
        <CityCard city={match.city_b} />
      </div>
      
      {/* Voting Interface */}
      {match.status === 'active' && !userVote && (
        <VotingInterface
          matchId={match.id}
          cityA={match.city_a}
          cityB={match.city_b}
        />
      )}
      
      {userVote && (
        <div className="text-center p-6 bg-green-50 rounded-lg mb-8">
          <p className="text-lg font-semibold">
            Thanks for voting for {userVote.city.name}! 🎉
          </p>
          <p className="text-gray-600 mt-2">Share your story below to help fellow fans</p>
        </div>
      )}
      
      {/* Live Results (if enough votes) */}
      {match.votes_a + match.votes_b > 50 && (
        <MatchResults
          cityA={match.city_a}
          cityB={match.city_b}
          votesA={match.votes_a}
          votesB={match.votes_b}
        />
      )}
      
      {/* User Stories Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-6">Fan Stories & Tips</h2>
        
        {match.status === 'active' && (
          <CityStoryForm
            matchId={match.id}
            cityA={match.city_a}
            cityB={match.city_b}
          />
        )}
        
        <FeaturedStories matchId={match.id} />
      </div>
      
      {/* Match Details */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-bold mb-4">About This Matchup</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <strong>{match.city_a.name}</strong>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>Stadium: {match.city_a.stadium_name}</li>
              <li>Match Dates: {/* Pull from matches table */}</li>
              <li><Link href={`/guides/${match.city_a.slug}`} className="text-blue-600 hover:underline">View Full Guide →</Link></li>
            </ul>
          </div>
          <div>
            <strong>{match.city_b.name}</strong>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>Stadium: {match.city_b.stadium_name}</li>
              <li>Match Dates: {/* Pull from matches table */}</li>
              <li><Link href={`/guides/${match.city_b.slug}`} className="text-blue-600 hover:underline">View Full Guide →</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### 4. `VotingInterface.tsx`

```tsx
'use client';

export function VotingInterface({ matchId, cityA, cityB }: VotingProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  const handleVote = async (cityId: string) => {
    if (!user) {
      // Prompt sign in
      toast.error("Sign in to vote!");
      return;
    }
    
    setIsSubmitting(true);
    
    const { data, error } = await supabase.rpc('cast_tournament_vote', {
      p_match_id: matchId,
      p_city_id: cityId,
      p_user_id: user.id
    });
    
    if (error) {
      toast.error(error.message);
    } else if (data.success) {
      toast.success("Vote recorded! 🎉");
      // Refresh page to show results
      window.location.reload();
    }
    
    setIsSubmitting(false);
  };
  
  return (
    <div className="flex items-center justify-center gap-8 my-12">
      <button
        onClick={() => handleVote(cityA.id)}
        disabled={isSubmitting}
        className="flex-1 max-w-xs p-8 border-4 border-blue-500 rounded-xl hover:bg-blue-50 transition disabled:opacity-50"
      >
        <div className="text-3xl font-bold mb-2">{cityA.name}</div>
        <div className="text-blue-600 font-semibold">Vote for {cityA.name}</div>
      </button>
      
      <div className="text-4xl font-bold text-gray-300">VS</div>
      
      <button
        onClick={() => handleVote(cityB.id)}
        disabled={isSubmitting}
        className="flex-1 max-w-xs p-8 border-4 border-red-500 rounded-xl hover:bg-red-50 transition disabled:opacity-50"
      >
        <div className="text-3xl font-bold mb-2">{cityB.name}</div>
        <div className="text-red-600 font-semibold">Vote for {cityB.name}</div>
      </button>
    </div>
  );
}
```

---

## API Routes / Server Actions

```typescript
// app/actions/tournament.ts

'use server';

import { createServerClient } from '@/lib/supabase/server';

export async function castVote(matchId: string, cityId: string) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'Must be signed in to vote' };
  }
  
  const { data, error } = await supabase.rpc('cast_tournament_vote', {
    p_match_id: matchId,
    p_city_id: cityId,
    p_user_id: user.id
  });
  
  return { data, error };
}

export async function submitStory(matchId: string, cityId: string, story: string) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'Must be signed in' };
  }
  
  const { error } = await supabase
    .from('tournament_comments')
    .insert({
      match_id: matchId,
      user_id: user.id,
      city_id: cityId,
      comment_text: story
    });
  
  return { error };
}
```

---

## Admin Dashboard

### Route: `/admin/tournament`

**Features:**
- Create new tournament
- Add matchups with scheduling
- Set round themes
- Manually close voting / declare winners
- Feature user stories
- View analytics (votes per city, engagement)

**Quick Actions:**
```tsx
- "Open Next Round" button
- "Close Current Voting" button
- "Announce Winners" button
- Export results CSV
```

---

## Marketing Assets to Create

### Graphics (Canva/Figma)
1. **Tournament Bracket Graphic** (shareable PNG)
   - 16 cities, empty bracket template
   - Update weekly as rounds complete

2. **Matchup Cards** (Instagram/Twitter format)
   - Template: City A vs City B with stadium photos
   - Vote percentage bars
   - "Vote closes [date]" text

3. **Round Theme Banners**
   - "Round 1: Best First Impression"
   - Background: collage of city skylines

4. **Winner Announcement Graphics**
   - Trophy graphic with winning city
   - "Dallas wins Round 1!"

### Reddit Post Templates

**Launch Post (Nov 18):**
```
Title: We're running a tournament to crown the Best 2026 World Cup Host City — Vote Now!

Body:
With the FIFA draw happening Dec 5, we wanted to know: which of the 16 host cities are fans MOST excited about?

Over the next 3 weeks, vote in head-to-head matchups:
- Round 1 (Nov 18-21): Best First Impression
- Round 2 (Nov 22-25): Best Match Day Experience  
- Round 3 (Nov 26-29): Best Between-Match Adventure
- Finals (Nov 30-Dec 4): Ultimate Host City

Vote here: worldcup26fanzone.com/tournament

First matchup: Dallas vs Toronto — which city would blow you away on arrival day?
```

**Subreddits to target:**
- r/worldcup (500K+ members)
- r/ussoccer
- r/ligamx
- r/MLS
- City-specific: r/dallas, r/toronto, r/boston, etc.

---

## Email Campaign (MailerLite)

### Automation Sequence

**Email 1 (Nov 18 — Tournament Launch):**
```
Subject: 🏆 Vote for the Best World Cup 2026 Host City

The Fan Zone City Cup is LIVE!

16 cities. 4 rounds. Only 1 winner.

Starting today: Dallas vs Toronto, LA vs SF, Boston vs Philly, and more.

Vote now before Friday: [CTA Button]

Plus: share your city stories and help fellow fans plan their trips.

See the full bracket →
```

**Email 2 (Nov 22 — Round 2 Opens):**
```
Subject: Round 2 is LIVE: Best Match Day Experience

Round 1 winners are in! [City] pulled off the upset in a nail-biter.

Now it's time to decide: which city has the BEST stadium atmosphere?

Vote closes Monday: [CTA]
```

**Email 3 (Dec 4 — Finals Close):**
```
Subject: FINAL VOTE: Ultimate Host City

It all comes down to this.

[City A] vs [City B] for the championship.

Winner announced tomorrow morning — just hours before the FIFA draw.

Cast your vote: [CTA]
```

**Email 4 (Dec 5 — Winner + Draw Day):**
```
Subject: 👑 Your Champion + Today's Draw Analysis

Congratulations to [WINNER CITY] — your Fan Zone City Cup champion!

And now the REAL draw begins in [X] hours.

Here's what to watch for + which host cities benefit most from each group scenario.

[Link to draw analysis article]

Early members: Get instant access to our trip planner once groups are announced →
```

---

## Timeline: Nov 13-17 Build Sprint

### Day 1 (Nov 13): Database + Backend
- [ ] Create new Supabase tables
- [ ] Write `cast_tournament_vote()` function
- [ ] Set up RLS policies
- [ ] Seed first tournament + Round 1 matchups

### Day 2 (Nov 14): Core Components
- [ ] Build `MatchCard.tsx`
- [ ] Build `VotingInterface.tsx`
- [ ] Build `MatchCountdown.tsx`
- [ ] Build `TournamentBracket.tsx` (basic version)

### Day 3 (Nov 15): Pages
- [ ] `/tournament` hub page
- [ ] `/tournament/[slug]/[matchId]` match page
- [ ] Test voting flow end-to-end

### Day 4 (Nov 16): Stories + Polish
- [ ] `CityStoryForm.tsx` + `FeaturedStories.tsx`
- [ ] Admin dashboard basics (open/close voting)
- [ ] Mobile responsive testing
- [ ] SEO meta tags

### Day 5 (Nov 17): Marketing Assets
- [ ] Design bracket graphic
- [ ] Create 8 matchup cards (Round 1)
- [ ] Write Reddit post templates
- [ ] Set up MailerLite emails
- [ ] Pre-schedule social posts

### Launch Day (Nov 18):
- [ ] Open Round 1 voting at 12:00 AM ET
- [ ] Post to Reddit (r/worldcup, r/ussoccer, city subs)
- [ ] Send launch email
- [ ] Post on X/Twitter
- [ ] Monitor for bugs

---

## Success Metrics

**Week 1 (Nov 18-21):**
- 5,000+ votes cast
- 500+ newsletter signups
- 10+ Reddit posts with 100+ upvotes

**Week 2 (Nov 22-25):**
- 10,000+ votes cast
- 1,000 newsletter signups (cumulative)
- 50+ user stories submitted

**Week 3 (Nov 26-Dec 4):**
- 20,000+ votes cast (finals should spike)
- 2,000+ newsletter signups
- 3-5 local media pickups (city news covering their matchups)

**Draw Day (Dec 5):**
- Winner announcement gets 10K+ impressions
- 100+ early memberships sold ($2,900 revenue)

---

## Post-Tournament: January Setup

Once Pre-Draw tournament completes, use December to:

1. **Analyze data:**
   - Which matchups got most votes?
   - Which round themes resonated?
   - User story themes → feed into city guides

2. **Build "Best Of" format:**
   - Modify schema for category voting (all 16 cities at once)
   - Build leaderboard view
   - Plan 16-week calendar

3. **Update city guides:**
   - Add "Tournament Winner" badges
   - Feature top user stories on city pages
   - Create "As voted by fans" sections

---

## Part 2: Tournament Data Seeding

### SQL to Seed Pre-Draw Tournament

```sql
-- Step 1: Create the tournament
INSERT INTO public.tournament_config (name, slug, status, start_date, description, rules_md)
VALUES (
  'Pre-Draw City Showdown',
  'pre-draw-2024',
  'active',
  '2024-11-18 00:00:00-05',
  'Vote for the best 2026 World Cup host city across 4 rounds of themed matchups. Winner crowned Dec 5 — Draw Day!',
  '## How It Works

**Format:** 16 cities, single-elimination bracket

**Voting Rules:**
- One vote per user per matchup
- Must be signed in to vote
- Voting window: Monday 12 AM ET → Friday 11:59 PM ET
- Winners advance to next round

**Round Themes:**
1. **Best First Impression** (Nov 18-21): Airport, skyline, arrival experience
2. **Best Match Day Experience** (Nov 22-25): Stadium atmosphere, fan zones, pre-game energy
3. **Best Between-Match Adventure** (Nov 26-29): What to do with 3 days between games
4. **Ultimate Host City** (Nov 30-Dec 4): If you could only visit ONE city, which one?

**Winner Announcement:** Dec 5, 2025 (FIFA Draw Day)

Share your city stories in the comments to help fellow fans plan their trips!'
);
```

```sql
-- Step 2: Get city IDs (adjust these based on your actual city IDs)
-- Run this first to see your city IDs:
SELECT id, name, slug FROM public.cities ORDER BY name;

-- For this example, I'll use placeholder UUIDs. Replace with your actual IDs.
-- Let's assume your cities table has these (you'll need to update):

-- Step 3: Seed Round 1 Matchups (8 matches)
-- Get the tournament_id from the insert above, or:
-- SELECT id FROM tournament_config WHERE slug = 'pre-draw-2024';

DO $$
DECLARE
  v_tournament_id uuid;
  
  -- City IDs (REPLACE THESE WITH YOUR ACTUAL IDs from cities table)
  v_dallas uuid;
  v_toronto uuid;
  v_houston uuid;
  v_mexico_city uuid;
  v_la uuid;
  v_sf uuid;
  v_philly uuid;
  v_boston uuid;
  v_atlanta uuid;
  v_miami uuid;
  v_seattle uuid;
  v_monterrey uuid;
  v_vancouver uuid;
  v_guadalajara uuid;
  v_kc uuid;
  v_ny uuid;
  
BEGIN
  -- Get tournament ID
  SELECT id INTO v_tournament_id 
  FROM tournament_config 
  WHERE slug = 'pre-draw-2024';
  
  -- Get city IDs by name
  SELECT id INTO v_dallas FROM cities WHERE slug = 'dallas';
  SELECT id INTO v_toronto FROM cities WHERE slug = 'toronto';
  SELECT id INTO v_houston FROM cities WHERE slug = 'houston';
  SELECT id INTO v_mexico_city FROM cities WHERE slug = 'mexico-city';
  SELECT id INTO v_la FROM cities WHERE slug = 'los-angeles';
  SELECT id INTO v_sf FROM cities WHERE slug = 'san-francisco';
  SELECT id INTO v_philly FROM cities WHERE slug = 'philadelphia';
  SELECT id INTO v_boston FROM cities WHERE slug = 'boston';
  SELECT id INTO v_atlanta FROM cities WHERE slug = 'atlanta';
  SELECT id INTO v_miami FROM cities WHERE slug = 'miami';
  SELECT id INTO v_seattle FROM cities WHERE slug = 'seattle';
  SELECT id INTO v_monterrey FROM cities WHERE slug = 'monterrey';
  SELECT id INTO v_vancouver FROM cities WHERE slug = 'vancouver';
  SELECT id INTO v_guadalajara FROM cities WHERE slug = 'guadalajara';
  SELECT id INTO v_kc FROM cities WHERE slug = 'kansas-city';
  SELECT id INTO v_ny FROM cities WHERE slug = 'new-york';
  
  -- Insert Round 1 Matches
  INSERT INTO public.tournament_matches 
    (tournament_id, round_number, round_name, round_theme, round_theme_description, 
     city_a_id, city_b_id, status, voting_opens_at, voting_closes_at, match_number)
  VALUES
    -- Match 1: Dallas vs Toronto
    (v_tournament_id, 1, 'Regional Quarterfinals', 'Best First Impression',
     'Which city will WOW you the moment you arrive? Consider: airport experience, skyline views, getting to your hotel, and that crucial first 24 hours in a new place.',
     v_dallas, v_toronto, 'active', 
     '2024-11-18 00:00:00-05', '2024-11-21 23:59:00-05', 1),
    
    -- Match 2: Houston vs Mexico City
    (v_tournament_id, 1, 'Regional Quarterfinals', 'Best First Impression',
     'Which city will WOW you the moment you arrive? Consider: airport experience, skyline views, getting to your hotel, and that crucial first 24 hours in a new place.',
     v_houston, v_mexico_city, 'active',
     '2024-11-18 00:00:00-05', '2024-11-21 23:59:00-05', 2),
    
    -- Match 3: LA vs San Francisco
    (v_tournament_id, 1, 'Regional Quarterfinals', 'Best First Impression',
     'Which city will WOW you the moment you arrive? Consider: airport experience, skyline views, getting to your hotel, and that crucial first 24 hours in a new place.',
     v_la, v_sf, 'active',
     '2024-11-18 00:00:00-05', '2024-11-21 23:59:00-05', 3),
    
    -- Match 4: Philadelphia vs Boston
    (v_tournament_id, 1, 'Regional Quarterfinals', 'Best First Impression',
     'Which city will WOW you the moment you arrive? Consider: airport experience, skyline views, getting to your hotel, and that crucial first 24 hours in a new place.',
     v_philly, v_boston, 'active',
     '2024-11-18 00:00:00-05', '2024-11-21 23:59:00-05', 4),
    
    -- Match 5: Atlanta vs Miami
    (v_tournament_id, 1, 'Regional Quarterfinals', 'Best First Impression',
     'Which city will WOW you the moment you arrive? Consider: airport experience, skyline views, getting to your hotel, and that crucial first 24 hours in a new place.',
     v_atlanta, v_miami, 'active',
     '2024-11-18 00:00:00-05', '2024-11-21 23:59:00-05', 5),
    
    -- Match 6: Seattle vs Monterrey
    (v_tournament_id, 1, 'Regional Quarterfinals', 'Best First Impression',
     'Which city will WOW you the moment you arrive? Consider: airport experience, skyline views, getting to your hotel, and that crucial first 24 hours in a new place.',
     v_seattle, v_monterrey, 'active',
     '2024-11-18 00:00:00-05', '2024-11-21 23:59:00-05', 6),
    
    -- Match 7: Vancouver vs Guadalajara
    (v_tournament_id, 1, 'Regional Quarterfinals', 'Best First Impression',
     'Which city will WOW you the moment you arrive? Consider: airport experience, skyline views, getting to your hotel, and that crucial first 24 hours in a new place.',
     v_vancouver, v_guadalajara, 'active',
     '2024-11-18 00:00:00-05', '2024-11-21 23:59:00-05', 7),
    
    -- Match 8: Kansas City vs New York
    (v_tournament_id, 1, 'Regional Quarterfinals', 'Best First Impression',
     'Which city will WOW you the moment you arrive? Consider: airport experience, skyline views, getting to your hotel, and that crucial first 24 hours in a new place.',
     v_kc, v_ny, 'active',
     '2024-11-18 00:00:00-05', '2024-11-21 23:59:00-05', 8);
  
  RAISE NOTICE 'Round 1 matches created successfully!';
  
END $$;
```

```sql
-- Step 4: Create placeholder Round 2 matches (TBD winners)
-- These will be populated after Round 1 closes

DO $$
DECLARE
  v_tournament_id uuid;
BEGIN
  SELECT id INTO v_tournament_id 
  FROM tournament_config 
  WHERE slug = 'pre-draw-2024';
  
  INSERT INTO public.tournament_matches 
    (tournament_id, round_number, round_name, round_theme, round_theme_description,
     status, voting_opens_at, voting_closes_at, match_number)
  VALUES
    -- Round 2: Match 1 (TBD vs TBD)
    (v_tournament_id, 2, 'Semifinals', 'Best Match Day Experience',
     'Where will the stadium atmosphere be ELECTRIC? Consider: stadium quality, fan zones, walkability to bars and restaurants, and that pre-match energy.',
     'upcoming', '2024-11-22 00:00:00-05', '2024-11-25 23:59:00-05', 1),
    
    -- Round 2: Match 2
    (v_tournament_id, 2, 'Semifinals', 'Best Match Day Experience',
     'Where will the stadium atmosphere be ELECTRIC? Consider: stadium quality, fan zones, walkability to bars and restaurants, and that pre-match energy.',
     'upcoming', '2024-11-22 00:00:00-05', '2024-11-25 23:59:00-05', 2),
    
    -- Round 2: Match 3
    (v_tournament_id, 2, 'Semifinals', 'Best Match Day Experience',
     'Where will the stadium atmosphere be ELECTRIC? Consider: stadium quality, fan zones, walkability to bars and restaurants, and that pre-match energy.',
     'upcoming', '2024-11-22 00:00:00-05', '2024-11-25 23:59:00-05', 3),
    
    -- Round 2: Match 4
    (v_tournament_id, 2, 'Semifinals', 'Best Match Day Experience',
     'Where will the stadium atmosphere be ELECTRIC? Consider: stadium quality, fan zones, walkability to bars and restaurants, and that pre-match energy.',
     'upcoming', '2024-11-22 00:00:00-05', '2024-11-25 23:59:00-05', 4);
    
  RAISE NOTICE 'Round 2 placeholder matches created!';
END $$;
```

```sql
-- Step 5: Create Round 3 placeholders

DO $$
DECLARE
  v_tournament_id uuid;
BEGIN
  SELECT id INTO v_tournament_id 
  FROM tournament_config 
  WHERE slug = 'pre-draw-2024';
  
  INSERT INTO public.tournament_matches 
    (tournament_id, round_number, round_name, round_theme, round_theme_description,
     status, voting_opens_at, voting_closes_at, match_number)
  VALUES
    -- Round 3: Match 1
    (v_tournament_id, 3, 'Final Four', 'Best Between-Match Adventure',
     'You have 3 days between games—where do you want to be? Consider: nearby attractions (beaches, mountains, culture), nightlife, food scene, day trip options, and overall "things to do" depth.',
     'upcoming', '2024-11-26 00:00:00-05', '2024-11-29 23:59:00-05', 1),
    
    -- Round 3: Match 2
    (v_tournament_id, 3, 'Final Four', 'Best Between-Match Adventure',
     'You have 3 days between games—where do you want to be? Consider: nearby attractions (beaches, mountains, culture), nightlife, food scene, day trip options, and overall "things to do" depth.',
     'upcoming', '2024-11-26 00:00:00-05', '2024-11-29 23:59:00-05', 2);
    
  RAISE NOTICE 'Round 3 placeholder matches created!';
END $$;
```

```sql
-- Step 6: Create Finals placeholder

DO $$
DECLARE
  v_tournament_id uuid;
BEGIN
  SELECT id INTO v_tournament_id 
  FROM tournament_config 
  WHERE slug = 'pre-draw-2024';
  
  INSERT INTO public.tournament_matches 
    (tournament_id, round_number, round_name, round_theme, round_theme_description,
     status, voting_opens_at, voting_closes_at, match_number)
  VALUES
    -- Finals
    (v_tournament_id, 4, 'Championship', 'Ultimate Host City',
     'If you could only visit ONE World Cup 2026 host city, which one would it be? Consider the complete package: arrival experience, match day atmosphere, things to do, value for money, and that once-in-a-lifetime factor.',
     'upcoming', '2024-11-30 00:00:00-05', '2024-12-04 23:59:00-05', 1);
    
  RAISE NOTICE 'Finals match created!';
END $$;
```

---

### Helper Query: Check City Slugs

Run this to verify your city slugs match the script above:

```sql
SELECT 
  id,
  name,
  slug,
  stadium_name
FROM public.cities
ORDER BY name;
```

If your slugs are different (e.g., 'new-york-new-jersey' instead of 'new-york'), update the seeding script accordingly.

---

### Admin Helper Queries

**Close Round 1 and set winners:**

```sql
-- After Friday voting closes, manually set winners
-- Example: Toronto beat Dallas

UPDATE public.tournament_matches
SET 
  status = 'closed',
  winner_city_id = (SELECT id FROM cities WHERE slug = 'toronto')
WHERE 
  tournament_id = (SELECT id FROM tournament_config WHERE slug = 'pre-draw-2024')
  AND round_number = 1
  AND match_number = 1; -- Dallas vs Toronto match

-- Repeat for all 8 Round 1 matches
```

**Populate Round 2 with winners:**

```sql
-- After Round 1 closes, assign winners to Round 2 matches
-- Example: Match 1 of Round 2 is Toronto (beat Dallas) vs Mexico City (beat Houston)

UPDATE public.tournament_matches
SET 
  city_a_id = (SELECT winner_city_id FROM tournament_matches WHERE round_number = 1 AND match_number = 1), -- Toronto
  city_b_id = (SELECT winner_city_id FROM tournament_matches WHERE round_number = 1 AND match_number = 2), -- Mexico City
  status = 'active'
WHERE 
  tournament_id = (SELECT id FROM tournament_config WHERE slug = 'pre-draw-2024')
  AND round_number = 2
  AND match_number = 1;

-- Repeat for Round 2 matches 2, 3, 4
```

---

### Quick Test Data (Optional)

If you want to test with some fake votes before launch:

```sql
-- Add test votes to Match 1 (requires actual user IDs or use IP addresses)
-- This is just to see vote counts populate

INSERT INTO public.tournament_votes (match_id, city_id, ip_address)
SELECT 
  (SELECT id FROM tournament_matches WHERE round_number = 1 AND match_number = 1), -- Dallas vs Toronto
  (SELECT id FROM cities WHERE slug = 'dallas'),
  '192.168.1.' || generate_series::text
FROM generate_series(1, 50); -- 50 votes for Dallas

INSERT INTO public.tournament_votes (match_id, city_id, ip_address)
SELECT 
  (SELECT id FROM tournament_matches WHERE round_number = 1 AND match_number = 1),
  (SELECT id FROM cities WHERE slug = 'toronto'),
  '192.168.2.' || generate_series::text
FROM generate_series(1, 45); -- 45 votes for Toronto

-- Update match vote counts
UPDATE tournament_matches
SET 
  votes_a = 50,
  votes_b = 45
WHERE round_number = 1 AND match_number = 1;
```

---

## Verification Checklist

After running the seed scripts:

```sql
-- Check tournament created
SELECT * FROM tournament_config WHERE slug = 'pre-draw-2024';

-- Check all matches created (should be 15 total)
SELECT 
  round_number,
  round_name,
  COUNT(*) as match_count
FROM tournament_matches
WHERE tournament_id = (SELECT id FROM tournament_config WHERE slug = 'pre-draw-2024')
GROUP BY round_number, round_name
ORDER BY round_number;

-- Should return:
-- round_number | round_name             | match_count
-- 1            | Regional Quarterfinals | 8
-- 2            | Semifinals             | 4
-- 3            | Final Four             | 2
-- 4            | Championship           | 1

-- Check Round 1 matches have cities assigned
SELECT 
  m.round_number,
  m.match_number,
  ca.name as city_a,
  cb.name as city_b,
  m.status,
  m.voting_opens_at,
  m.voting_closes_at
FROM tournament_matches m
LEFT JOIN cities ca ON m.city_a_id = ca.id
LEFT JOIN cities cb ON m.city_b_id = cb.id
WHERE m.tournament_id = (SELECT id FROM tournament_config WHERE slug = 'pre-draw-2024')
  AND m.round_number = 1
ORDER BY m.match_number;
```

---







//NOT FOR DEVELOPMENT # Reddit Post Copy + Tournament Data Seeding

---

## Part 1: Reddit Post Templates

### Launch Post (Nov 18 — Monday Morning)

#### r/worldcup (Primary Launch)
```
Title: We're crowning the Best 2026 World Cup Host City — Vote in Round 1!

Hey r/worldcup!

With the FIFA draw happening in just 17 days (Dec 5), we wanted to settle the debate: which of the 16 North American host cities are YOU most excited about?

We built a tournament-style competition with 4 rounds of matchups. Each round has a different theme so you're not just voting on "vibes" — you're thinking about real travel scenarios.

**Round 1 (Nov 18-21): Best First Impression**
Which city will WOW you the moment you arrive? Think: airport experience, skyline, getting to your hotel, that first 24 hours.

**Current Matchups:**
- 🇺🇸 Dallas vs 🇨🇦 Toronto
- 🇺🇸 Houston vs 🇲🇽 Mexico City
- 🇺🇸 Los Angeles vs 🇺🇸 San Francisco
- 🇺🇸 Philadelphia vs 🇺🇸 Boston
- 🇺🇸 Atlanta vs 🇺🇸 Miami
- 🇺🇸 Seattle vs 🇲🇽 Monterrey
- 🇨🇦 Vancouver vs 🇲🇽 Guadalajara
- 🇺🇸 Kansas City vs 🇺🇸 New York/NJ

**Vote here:** [worldcup26fanzone.com/tournament](https://worldcup26fanzone.com/tournament)

Voting closes **Friday at 11:59 PM ET**. Winners advance to Round 2.

Bonus: Share your own stories about these cities in the comments on each matchup. Have you been to any of these places? What surprised you? What should first-timers know?

Next rounds:
- Round 2 (Nov 22): Best Match Day Experience
- Round 3 (Nov 26): Best Between-Match Adventure  
- Finals (Dec 4): Ultimate Host City

Let's settle this before the draw! 🏆

---

*Full disclosure: This is our site. We're building guides for all 16 cities and wanted to make the research phase more fun. No ads, no spam, just helping fans plan better trips.*
```

---

#### r/ussoccer
```
Title: Tournament: Which USMNT host city is the best for visiting fans?

The US has 11 of the 16 host cities for 2026. But which ones are actually the BEST for international fans traveling in?

We're running a 4-round tournament to find out. Round 1 theme: Best First Impression (airport, skyline, arrival day experience).

US Matchups in Round 1:
- Dallas vs Toronto
- Houston vs Mexico City  
- LA vs San Francisco
- Philly vs Boston
- Atlanta vs Miami
- Seattle vs Monterrey
- Kansas City vs NYC/NJ

Vote: worldcup26fanzone.com/tournament

Closes Friday. Tell us which city you're backing and WHY in the comments on the site.

Who you got? 🇺🇸
```

---

#### r/MLS
```
Title: MLS cities face off: Vote for the best 2026 WC host city

10 of the 16 host cities have MLS teams. Which one is going to give visiting World Cup fans the best experience?

Round 1 voting is open (closes Friday):
- Seattle vs Monterrey
- LA vs SF
- Houston vs Mexico City
- Dallas vs Toronto
- Atlanta vs Miami
- KC vs NYC/NJ
- Philly vs Boston
- Vancouver vs Guadalajara

Theme: Best First Impression — which city wows you on arrival day?

Vote + share your takes: worldcup26fanzone.com/tournament

Winner gets crowned Dec 4, right before the FIFA draw.
```

---

#### r/LigaMX
```
Title: México tiene 3 sedes — ¿Cuál es la mejor para fans internacionales?

[English translation below]

Estamos haciendo un torneo para decidir cuál de las 16 ciudades sede del Mundial 2026 es la MEJOR para visitar.

Ronda 1: Primera Impresión (aeropuerto, hotel, primeras 24 horas)

Las 3 ciudades mexicanas compiten hoy:
- 🇲🇽 Ciudad de México vs 🇺🇸 Houston
- 🇲🇽 Monterrey vs 🇺🇸 Seattle  
- 🇲🇽 Guadalajara vs 🇨🇦 Vancouver

Vota aquí: worldcup26fanzone.com/tournament

Cierra el viernes. ¿Cuál tiene tu voto?

---

[English: We're running a tournament to crown the best WC26 host city. Mexico's 3 cities are competing in Round 1. Vote before Friday!]
```

---

### City-Specific Posts (Example: r/Dallas)

```
Title: Dallas is in the World Cup 2026 Host City Tournament — vote now!

Dallas is going head-to-head with Toronto in Round 1 of a fan tournament to decide the best WC26 host city.

This round's theme: **Best First Impression** (airport, skyline, arrival experience)

I think Dallas has this locked — DFW is massive but well-organized, the skyline is underrated, and you're 20 min from downtown. Plus AT&T Stadium is a spectacle.

But I'm biased. What do y'all think? What should visiting fans know about arriving in Dallas for the World Cup?

Vote: worldcup26fanzone.com/tournament/pre-draw-2024/[matchId]

Closes Friday. Let's show up for our city! 🏆
```

**Repeat this template for:**
- r/houston
- r/atlanta  
- r/boston
- r/philadelphia
- r/miami
- r/toronto
- r/vancouver
- r/LosAngeles
- r/sanfrancisco
- r/seattle
- r/KansasCity
- r/nyc

---

### Mid-Week Engagement Posts (Wednesday, Nov 20)

#### r/worldcup
```
Title: Round 1 Update: Mexico City crushing Houston, but Dallas-Toronto is a nail-biter

Halfway through Round 1 voting and we've got some surprises:

**Blowouts:**
- Mexico City leading Houston 68%-32% (4,200 votes)
- LA dominating SF 71%-29% (3,800 votes)

**Toss-ups:**
- Dallas vs Toronto: 51%-49% (3,100 votes)
- Boston vs Philly: 52%-48% (2,900 votes)

**The upset watch:**
- KC giving NYC a run for their money (45%-55%, 2,400 votes)

Voting closes FRIDAY at midnight ET. If you haven't voted yet: worldcup26fanzone.com/tournament

What's surprising you most? I did NOT expect Mexico City to run away with it like this.
```

---

### Results Post (Saturday, Nov 23)

#### r/worldcup
```
Title: Round 1 Results: Your Best "First Impression" Host Cities

Round 1 voting is closed! Here are your winners (moving to Round 2):

🏆 **WINNERS:**
- Mexico City (def. Houston, 67%-33%)
- Toronto (def. Dallas, 51%-49%) ← UPSET!
- Los Angeles (def. San Francisco, 69%-31%)
- Boston (def. Philadelphia, 54%-46%)
- Miami (def. Atlanta, 58%-42%)
- Seattle (def. Monterrey, 61%-39%)
- Vancouver (def. Guadalajara, 55%-45%)
- New York/NJ (def. Kansas City, 59%-41%)

Total votes cast: **31,400+**

**Round 2 opens MONDAY** (Nov 25):
Theme: **Best Match Day Experience** (stadium atmosphere, fan zones, sports bars, pre-game energy)

This is where everything changes. Some cities that won on "first impression" might not have the best match day vibe. 

New matchups:
- Mexico City vs Toronto
- LA vs Boston
- Miami vs Seattle
- Vancouver vs NYC/NJ

Who you got? Vote starting Monday: worldcup26fanzone.com/tournament

---

Shoutout to everyone who shared their city stories in the comments. We're featuring the best ones on our city guide pages. Keep 'em coming in Round 2! 🙌
```

---

### Finals Week Post (Monday, Dec 2)

#### r/worldcup
```
Title: FINALS: Vote for the Ultimate 2026 World Cup Host City (Winner announced Thursday before the FIFA Draw!)

We're down to 2 cities after 3 rounds of voting:

🏆 **CHAMPIONSHIP MATCHUP:**
**[City A] vs [City B]**

Over 85,000 votes cast so far. Now it all comes down to this.

**The Final Question:**
If you could only visit ONE World Cup 2026 host city, which one would it be?

- [City A]: [Key selling points based on previous round performance]
- [City B]: [Key selling points]

**Vote here:** worldcup26fanzone.com/tournament

**Voting closes Wednesday, Dec 4 at 11:59 PM ET.**

Winner announced **Thursday morning (Dec 5)** — just hours before the FIFA draw begins.

Let's finish strong. Who's taking the crown? 👑
```

---

