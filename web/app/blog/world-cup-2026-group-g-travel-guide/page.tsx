import Link from 'next/link'
import MarkdownRenderer from '@/components/blog/MarkdownRenderer'

export const metadata = {
  title: 'World Cup 2026 Group G: Complete Travel Guide for Fans',
  description:
    'Tackle the West Coast ping-pong run between Los Angeles, Seattle, and Vancouver with travel plans, transit intel, and packing tips.',
  alternates: {
    canonical: 'https://www.worldcup26fanzone.com/blog/world-cup-2026-group-g-travel-guide',
  },
}

const markdown = String.raw`
# World Cup 2026 Group G: Complete Travel Guide for Fans
Los Angeles | Seattle | Vancouver

*Last Updated: December 3, 2024*

---

![World Cup 2026 Group G Map](https://www.worldcup26fanzone.com/images/group-g-map.jpg)
*Three cities, endless ping-pong: the West Coast corridor in motion.*

> **Interactive map:** Study the West Coast ping-pong route on the [Group G city map](/groups/g).

> **Travel Complexity:** **** (High) | 3,245 miles | 2 border crossings | 3 host cities

## Group Snapshot

- **Nations involved:** USA (Los Angeles, Seattle) | Canada (Vancouver)
- **Travel pattern:** Back-to-back flights between the same three airports.
- **Key perk:** Two of three venues are walkable from downtown hotels.

### Challenges
- **Constant bouncing** keeps you in airports every 2-3 days.
- **Two border crossings** require passport checks and plan-B flights.
- **SoFi Stadium** remains a no-rail zone with heavy traffic and surge fares.

### Advantages
- **Only three cities** to master—easy to memorize neighborhoods, shuttles, and airport transfers.
- **Seattle and Vancouver** provide low-stress match days with Link and SkyTrain access.
- **Iconic destinations** for food, mountains, and coastal views between games.

---

## Match Schedule

| Match | Date | City | Notes |
| --- | --- | --- | --- |
| Match 15 | Jun 15 (Mon) | Los Angeles | SoFi Stadium kickoff |
| Match 16 | Jun 15 (Mon) | Seattle | Same-day doubleheader |
| Match 39 | Jun 21 (Sat) | Los Angeles | Second LA outing |
| Match 40 | Jun 21 (Sat) | Vancouver | BC Place showcase |
| Match 63 | Jun 26 (Fri) | Seattle | Lumen Field decision day |
| Match 64 | Jun 26 (Fri) | Vancouver | Finale on the waterfront |

---

## Stadium Transit Access

| City | Venue | Access Quality | Notes |
| --- | --- | --- | --- |
| Los Angeles | SoFi Stadium | No rail | Shuttle or rideshare only; plan 2-3 hours before kickoff. |
| Seattle | Lumen Field | Walkable | 5-10 minute walk from Pioneer Square or short Link ride. |
| Vancouver | BC Place | Walkable | 5-15 minute walk; multiple SkyTrain stops nearby. |

> **Flight hack:** SEA ↔ YVR is a 55-minute hop. Clear customs in advance via Mobile Passport Control to avoid missed connections.

---

## Hub Strategy Playbook

- **Pick one base city** (Seattle or Vancouver recommended) and fly out-and-back for Los Angeles matches.
- **Los Angeles base** works if you prefer warmer weather and more flight options, but plan to budget for two extra rideshare-heavy match days.

> **Mileage saver:** Book an open-jaw ticket into Vancouver and out of Los Angeles (or vice versa) to cut redundant flights.

---

## Climate & Packing List

- **Los Angeles:** 70-85F and sunny. Sunscreen and sunglasses are musts.
- **Seattle & Vancouver:** 55-75F with marine drizzle. Pack layered clothing and a light rain shell.
- **General:** Comfortable walking shoes—you will be on foot for two-thirds of the venues.

---

## Who Will Play in Group G?

Four nations from Pots 1-4 join this West Coast gauntlet. Check back after the Final Draw for opponent-specific itineraries and supporters’ pubs.

---

## Ready to Plan Your Group G Trip?

### Free Resources
- **Trip Planner:** [worldcup26fanzone.com](https://worldcup26fanzone.com)

### Detailed City Guides ($3.99 each)
- [Los Angeles Guide](https://worldcup26fanzone.com/guides/los-angeles)
- [Seattle Guide](https://worldcup26fanzone.com/guides/seattle)
- [Vancouver Guide](https://worldcup26fanzone.com/guides/vancouver)

### AI-Powered Planning
- **AI Trip Optimizer ($29):** Compare YVR/SEA/LA flight triangles, find best day rooms, and estimate rideshare spend.

---

*We will refresh this post post-draw with opponent intel, shuttle details, and sample itineraries.*
`

export default function GroupGTravelGuidePage() {
  return (
    <article className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">Group G</span>
            <span>December 3, 2024</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            World Cup 2026 Group G: Complete Travel Guide for Fans
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed">
            Tackle the West Coast ping-pong run between Los Angeles, Seattle, and Vancouver with smart hub planning.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="blog-content prose prose-lg max-w-none prose-headings:mt-8 prose-headings:mb-4 prose-p:mb-4 prose-ul:my-4 prose-li:my-2">
            <MarkdownRenderer content={markdown} />
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            ← Back to All Articles
          </Link>
        </div>
      </div>
    </article>
  )
}
