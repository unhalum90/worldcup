import Link from 'next/link'
import MarkdownRenderer from '@/components/blog/MarkdownRenderer'

export const metadata = {
  title: 'World Cup 2026 Group D: Complete Travel Guide for Fans',
  description:
    'Follow the USA across Los Angeles, Vancouver, San Francisco, and Seattle with travel strategies, stadium transit intel, and planning tips for Group D.',
  alternates: {
    canonical: 'https://www.worldcup26fanzone.com/blog/world-cup-2026-group-d-travel-guide',
  },
}

const markdown = String.raw`
# World Cup 2026 Group D: Complete Travel Guide for Fans
Los Angeles | Vancouver | San Francisco | Seattle

*Last Updated: December 3, 2024*

---

![World Cup 2026 Group D Map](https://www.worldcup26fanzone.com/images/group-d-map.jpg)
*Group D spans 3,864 miles along the Pacific coast and across the US-Canada border.*

> **Interactive map:** Preview every stadium, transit rating, and climate snapshot on the [Group D city map](/groups/d).

> **Travel Complexity:** **** (High) | 3,864 miles | 2 border crossings | 4 host cities

## Group Snapshot

- **Host Nations:** USA (Los Angeles, San Francisco Bay Area, Seattle) | Canada (Vancouver)
- **Why it is tricky:** Long-haul flights plus repeat visits to both Los Angeles and the Bay Area.
- **Why it is worth it:** Follow the USMNT, see two walkable Pacific Northwest venues, and explore iconic coastal cities.

### Challenges
- **Two border crossings** require passports, eTA/ESTA checks, and buffer time for airport queues.
- **Two "gap" cities** (Los Angeles, San Francisco Bay Area) force reliance on shuttles or rideshares.
- **Repeat legs** between California cities add cost and fatigue if you try to attend every match.

### Advantages
- **Follow a host nation** and ride the energy around the USA's three guaranteed matches.
- **Walkable Pacific Northwest venues** (Vancouver, Seattle) provide low-stress match days.
- **Bucket-list destinations** for food, national parks, and coastal scenery.

---

## Match Schedule

| Match | Date | City | Notes |
| --- | --- | --- | --- |
| Match 4 | Jun 12 (Fri) | Los Angeles | USA opening match (USA #1) |
| Match 6 | Jun 13 (Sat) | Vancouver | BC Place showcase |
| Match 32 | Jun 18 (Thu) | Seattle | USA second match (USA #2) |
| Match 31 | Jun 19 (Fri) | San Francisco Bay Area | Levi's Stadium trek |
| Match 59 | Jun 25 (Thu) | Los Angeles | USA final group match (USA #3) |
| Match 60 | Jun 25 (Thu) | San Francisco Bay Area | Decision day doubleheader |

---

## Stadium Transit Access

| City | Venue | Access Quality | Notes |
| --- | --- | --- | --- |
| Los Angeles | SoFi Stadium | No rail | Shuttles or rideshares from Inglewood; allow heavy traffic buffers. |
| Vancouver | BC Place | Walkable | Downtown venue within a 5-15 minute walk or a short SkyTrain hop. |
| San Francisco Bay Area | Levi's Stadium | Complex | 90-120 minute combo of Caltrain + VTA from San Francisco. |
| Seattle | Lumen Field | Walkable | 5-10 minute walk from Pioneer Square or 2-minute Link ride. |

> **Transit gap reminder:** Build a rideshare budget for both California venues. Surge pricing on match day can exceed $60 each way.

---

## Hub Strategy Playbook

> **Pacific Northwest Base**
>
> Stay in Seattle or Vancouver for easier transit, then book 2-3 hour flights to the California matches.

- **Option 1 – Pacific Northwest hub:** Fly SEA/LAX or YVR/SFO for each California match; enjoy walkable home bases.
- **Option 2 – California split hub:** Base in Los Angeles or the Bay Area and hop north twice. Driving between LA and Santa Clara is 6+ hours, so plan flights if possible.
- **Option 3 – Full multi-city run:** Tack on extra buffer nights to absorb flight delays and border queues if you insist on attending every match.

---

## Climate & Packing List

- **Los Angeles:** 70-85F and sunny. Pack sunscreen, light layers, and breathable fabrics.
- **Vancouver & Seattle:** 55-75F with marine clouds. Bring layers plus a lightweight rain jacket.
- **San Francisco Bay Area:** 60-75F and fog-prone. Pack a warm mid-layer for evening kickoffs.

---

## Who Will Play in Group D?

The USA is locked into Group D with two matches in Los Angeles and one in Seattle. The remaining three slots will be filled by teams from Pots 2-4 at the Final Draw. Expect updates in December once opponents and storylines are set.

---

## Ready to Plan Your Group D Trip?

### Free Resources
- **Trip Planner:** [worldcup26fanzone.com](https://worldcup26fanzone.com)

### Detailed City Guides ($3.99 each)
- [Los Angeles Guide](https://worldcup26fanzone.com/guides/los-angeles)
- [Vancouver Guide](https://worldcup26fanzone.com/guides/vancouver)
- [San Francisco Guide](https://worldcup26fanzone.com/guides/san-francisco)
- [Seattle Guide](https://worldcup26fanzone.com/guides/seattle)

### AI-Powered Planning
- **AI Trip Optimizer ($29):** Personalized itineraries with flight, hotel, and rideshare cost modeling.

---

*Next update coming after the Final Draw with opponent-specific intel and refreshed pricing tips.*
`

export default function GroupDTravelGuidePage() {
  return (
    <article className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">Group D</span>
            <span>December 3, 2024</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            World Cup 2026 Group D: Complete Travel Guide for Fans
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed">
            Follow the USA across Los Angeles, Vancouver, San Francisco, and Seattle with travel strategies and transit intel.
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
