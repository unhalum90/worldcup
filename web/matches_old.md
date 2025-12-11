Create a dynamic match page template that:

1. Pulls from Supabase:
   - Match number, date, time
   - Teams (with flags, FIFA rankings)
   - Stadium details
   - City context
   - Transport options from 'stadiums' table
   - Hotel data from 'cities' table

2. Includes sections for:
   - Embedded YouTube video (iframe)
   - Team storylines (editable text field)
   - Rivalry context (editable text field)
   - Fan experience notes (editable text field)
   - Embedded infographic (image upload)
   - Reddit quotes (repeatable quote blocks)
   - Map embed (Google Maps iframe)
   - Weather widget (for match date)
   - CTA button (to trip planner with match pre-selected)

3. SEO optimization:
   - Auto-generate meta title: "Match {number}: {Team A} vs {Team B} - {City} Travel Guide"
   - Auto-generate meta description from first 155 chars of content
   - Schema markup for sporting event
   - Open Graph tags for social sharing

4. Related content:
   - "Other matches at this stadium" (auto-populate from Supabase)
   - "This team's other matches" (auto-populate for both teams)
   - "Matches on this date" (auto-populate)

Generate all 72 pages from Supabase data.