import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function normalizeToHttps(u: string): string {
  if (!u) return ''
  try {
    const parsed = new URL(u)
    if (parsed.protocol !== 'https:') parsed.protocol = 'https:'
    return parsed.toString().replace(/\/$/, '')
  } catch {
    return u.replace(/^http:\/\//i, 'https://')
  }
}

// Inline article content to avoid relying on filesystem at runtime
const TRANSIT_MD = `
<article>

<h1>World Cup 2026: No-Car Needed – The 5 Most Transit-Friendly Lodging Zones</h1>
<h2>Leave the rental car at the airport and ride the rails to victory</h2>

<p>In a tournament spanning three countries and sixteen cities, one question separates the stress-free traveler from the traffic-trapped tourist: <strong>can you do it all without a car?</strong></p>

<p>While some World Cup venues require complex shuttle systems or long rideshare journeys, a select few offer that rare urban luxury—<strong>seamless public transit from hotel to stadium to fan festival and back again.</strong></p>

<p>After analyzing transit systems across 47+ lodging zones in all sixteen host cities, we've identified five zones where you can confidently skip the rental car counter, avoid surge pricing on match days, and experience the World Cup the way it was meant to be: riding the rails with thousands of fellow fans.</p>

<hr />

<h2>1. Vancouver: Downtown Core / BC Place District 🚇 <br><small>BEST TRANSIT EXPERIENCE</small></h2>
<p><strong>Why it’s unbeatable:</strong> The stadium is <strong>in downtown</strong>, the SkyTrain is world-class, and the airport rail link is direct.</p>
<ul>
  <li><strong>Stadium:</strong> 5–15 min walk or SkyTrain to Stadium–Chinatown</li>
  <li><strong>Airport:</strong> 25 min direct Canada Line</li>
  <li><strong>Frequency:</strong> 3–5 min peak</li>
  <li><strong>Cost:</strong> $3.15 CAD</li>
  <li><strong>Network:</strong> Expo, Millennium, and Canada lines</li>
  <li><strong>Where to stay:</strong> Yaletown, Gastown, Stadium District</li>
  <li><strong>City Guide:</strong> <a href="/guides/vancouver">Vancouver 2026 Guide</a></li>
</ul>

<hr />

<h2>2. Toronto: Downtown Core / Financial District 🚊 <br><small>BEST REGIONAL RAIL SPEED</small></h2>
<p><strong>Why it dominates:</strong> Fastest rail-to-stadium connection in the entire tournament—<strong>7 minutes</strong> Union → BMO Field.</p>
<ul>
  <li><strong>Stadium:</strong> 7 min GO Train</li>
  <li><strong>Airport:</strong> 25 min UP Express</li>
  <li><strong>Frequency:</strong> 15–30 min</li>
  <li><strong>Cost:</strong> $3.70 CAD</li>
  <li><strong>Where to stay:</strong> Financial District, Harbourfront, King West</li>
</ul>

<hr />

<h2>3. Seattle: Pioneer Square 🚶 <br><small>BEST WALKABILITY + RAIL</small></h2>
<p><strong>Why it works:</strong> You can literally <strong>walk to the stadium</strong> in under 10 minutes, and Link Light Rail reaches everywhere else.</p>
<ul>
  <li><strong>Stadium:</strong> 5–10 min walk</li>
  <li><strong>Airport:</strong> 35–40 min direct Link</li>
  <li><strong>Frequency:</strong> 8–10 min</li>
  <li><strong>Cost:</strong> $2.25–3.25</li>
</ul>

<hr />

<h2>4. Houston: Museum District / Medical Center 🚊 <br><small>BEST U.S. DIRECT RAIL</small></h2>
<p><strong>Why it delivers:</strong> One of the few U.S. host cities with a <strong>direct, no-transfer</strong> rail line from a major lodging zone to the stadium.</p>
<ul>
  <li><strong>Stadium:</strong> 15–20 min METRORail Red Line</li>
  <li><strong>Downtown:</strong> 10–15 min</li>
  <li><strong>Frequency:</strong> 6–12 min</li>
  <li><strong>Cost:</strong> $1.25</li>
</ul>

<hr />

<h2>5. Atlanta: Midtown Atlanta 🚇 <br><small>BEST FOR CITY EXPLORATION</small></h2>
<p><strong>Why it ranks:</strong> Direct airport rail, great nightlife, and Atlanta’s most walkable urban district.</p>
<ul>
  <li><strong>Stadium:</strong> 18–22 min MARTA (1 transfer)</li>
  <li><strong>Airport:</strong> 25 min direct MARTA</li>
  <li><strong>Frequency:</strong> 10–15 min</li>
  <li><strong>Cost:</strong> $2.50</li>
</ul>

<hr />

<h2>Honorable Mentions</h2>
<ul>
  <li><strong>Philadelphia:</strong> Center City / University City</li>
  <li><strong>Monterrey:</strong> Centro Monterrey</li>
  <li><strong>Mexico City:</strong> Polanco / Condesa</li>
  
</ul>

<hr />

<h2>Ready to find your perfect car-free zone?</h2>
<p>Our lodging calculator compares transfers and complexity, frequency, walk distances, airport connectivity, and more.</p>
<p><strong>Try it here:</strong> <a href="/">World Cup 26 Fan Zone Planner</a></p>

</article>
`

export async function POST() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      normalizeToHttps(process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    const slug = 'transit-friendly-lodging-zones-2026'
    const title = 'World Cup 2026: No-Car Needed – The 5 Most Transit-Friendly Lodging Zones'
    const excerpt = 'Skip the rental car. The five most transit-friendly lodging zones across North America for World Cup 2026.'

    // Upsert (insert or update on slug)
    const { error } = await supabase.from('blog_posts').upsert(
      {
        slug,
        title,
        content_markdown: TRANSIT_MD,
        excerpt,
        city: null,
        tags: ['transit', 'lodging', 'car-free', 'world cup 2026'],
        meta_description: excerpt,
        featured_image_url: '/1_World-Cup-2026-The-5-Best-No-Car-Lodging-Zones.png',
        status: 'published',
        published_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    )

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, slug })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}

