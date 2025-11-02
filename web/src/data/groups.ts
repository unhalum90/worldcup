export interface StadiumAccess {
  city: string;
  stadium: string;
  rating: "excellent" | "partial" | "none";
  notes: string;
}

export interface ClimateZone {
  city: string;
  climate: string;
  range_f?: [number, number];
}

export interface MapCoord {
  city: string;
  lat: number;
  lng: number;
}

export interface GroupData {
  id: string;
  title: string;
  total_distance_miles: number;
  unique_cities: number;
  border_crossings: number;
  countries: string[];
  stadium_access: StadiumAccess[];
  climate_zones: ClimateZone[];
  complexity_rating: number;
  summary: string;
  best_of_links: string[];
  map_coords?: MapCoord[];
  metaDescription: string;
}

const createBestOfLinks = (cities: string[]): string[] => {
  return Array.from(new Set(cities)).map((city) =>
    `/groups_best/${city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`
  );
};

export const groups: GroupData[] = [
  {
    id: "A",
    title: "Mexico + Atlanta",
    total_distance_miles: 3953,
    unique_cities: 4,
    border_crossings: 2,
    countries: ["Mexico", "USA"],
    stadium_access: [
      {
        city: "Mexico City",
        stadium: "Estadio Azteca",
        rating: "partial",
        notes: "Metro + Tren Ligero with two transfers, 40-50 minutes from city centre.",
      },
      {
        city: "Guadalajara",
        stadium: "Estadio Akron",
        rating: "none",
        notes: "No rail; 15-20 km rideshare or taxi from downtown Zapopan.",
      },
      {
        city: "Atlanta",
        stadium: "Mercedes-Benz Stadium",
        rating: "excellent",
        notes: "Direct MARTA access with multiple stations surrounding the stadium.",
      },
      {
        city: "Monterrey",
        stadium: "Estadio BBVA",
        rating: "partial",
        notes: "Metro Line 3 plus 10 minute taxi/ride to the stadium.",
      },
    ],
    climate_zones: [
      { city: "Mexico City", climate: "High altitude, mild 60-75°F with afternoon rain risk." },
      { city: "Guadalajara", climate: "Warm 70-85°F with possible rainy season showers." },
      { city: "Atlanta", climate: "Hot and humid 80-95°F with high humidity." },
      { city: "Monterrey", climate: "Very hot 85-100°F, dry heat against the mountains." },
    ],
    complexity_rating: 4,
    summary:
      "Group A mixes Mexico's altitude with the Deep South's humidity. Travellers cross the border twice and face two gap cities with no rail coverage, though Atlanta offers world-class transit. Prepare for climate swings between cool evenings in Mexico City and triple-digit heat in Monterrey.",
    best_of_links: createBestOfLinks(["Mexico City", "Guadalajara", "Atlanta", "Monterrey"]),
    metaDescription:
      "Navigate Group A of the 2026 World Cup: transit gaps in Guadalajara, altitude in Mexico City, and humidity in Atlanta and Monterrey.",
  },
  {
    id: "B",
    title: "Canada + West Coast USA",
    total_distance_miles: 3815,
    unique_cities: 5,
    border_crossings: 3,
    countries: ["Canada", "USA"],
    stadium_access: [
      {
        city: "Toronto",
        stadium: "BMO Field",
        rating: "excellent",
        notes: "GO Train from Union Station reaches Exhibition GO in 7 minutes.",
      },
      {
        city: "San Francisco",
        stadium: "Levi's Stadium",
        rating: "partial",
        notes: "Complex multi-system ride (BART → Caltrain → VTA), 90+ minutes from San Francisco.",
      },
      {
        city: "Los Angeles",
        stadium: "SoFi Stadium",
        rating: "none",
        notes: "No rail to Inglewood; shuttles or rideshare required from downtown LA.",
      },
      {
        city: "Vancouver",
        stadium: "BC Place",
        rating: "excellent",
        notes: "Downtown location with SkyTrain access; walkable from central hotels.",
      },
      {
        city: "Seattle",
        stadium: "Lumen Field",
        rating: "excellent",
        notes: "Next to Pioneer Square and International District stations; fully walkable.",
      },
    ],
    climate_zones: [
      { city: "Toronto", climate: "Warm and humid 70-85°F with chance of rain." },
      { city: "San Francisco", climate: "Cool and foggy 60-75°F; evenings can be chilly." },
      { city: "Los Angeles", climate: "Sunny perfection 70-85°F with coastal breeze." },
      { city: "Vancouver", climate: "Cool 55-75°F; frequent drizzle possible." },
      { city: "Seattle", climate: "Cool 55-75°F with maritime showers." },
    ],
    complexity_rating: 5,
    summary:
      "Group B stretches from Toronto to Seattle with three border crossings and two challenging stadiums in Santa Clara and Inglewood. Fans enjoy fantastic transit in Toronto, Vancouver, and Seattle, but should budget extra travel time on the California legs. Climate swings from coastal fog to Canadian summer heat keep packing lists interesting.",
    best_of_links: createBestOfLinks([
      "Toronto",
      "San Francisco",
      "Los Angeles",
      "Vancouver",
      "Seattle",
    ]),
    metaDescription:
      "Plan Group B travel across Toronto, the California coast, and Cascadia with insight into stadium transit gaps and border logistics.",
  },
  {
    id: "C",
    title: "East Coast + South",
    total_distance_miles: 2406,
    unique_cities: 5,
    border_crossings: 0,
    countries: ["USA"],
    stadium_access: [
      {
        city: "Boston",
        stadium: "Gillette Stadium",
        rating: "partial",
        notes: "Special event trains from South Station, 60-75 minutes to Foxborough.",
      },
      {
        city: "New York",
        stadium: "MetLife Stadium",
        rating: "partial",
        notes: "NJ Transit from Penn Station with match-day transfers in New Jersey.",
      },
      {
        city: "Philadelphia",
        stadium: "Lincoln Financial Field",
        rating: "excellent",
        notes: "Broad Street Line stops at the stadium complex in 20 minutes.",
      },
      {
        city: "Miami",
        stadium: "Hard Rock Stadium",
        rating: "none",
        notes: "No rail; 20-25 mile drive from Miami Beach via rideshare or car.",
      },
      {
        city: "Atlanta",
        stadium: "Mercedes-Benz Stadium",
        rating: "excellent",
        notes: "Multiple MARTA stations integrated with the stadium concourse.",
      },
    ],
    climate_zones: [
      { city: "Boston", climate: "Warm 65-80°F and breezy; evenings can be cool." },
      { city: "New York", climate: "Hot and humid 75-90°F, classic summer weather." },
      { city: "Philadelphia", climate: "Hot and humid 75-90°F with occasional storms." },
      { city: "Miami", climate: "Tropical 85-95°F with frequent afternoon thunderstorms." },
      { city: "Atlanta", climate: "Hot and humid 80-95°F; air conditioning is essential." },
    ],
    complexity_rating: 2,
    summary:
      "Group C keeps everything inside the United States with manageable distances along the East Coast. Philadelphia and Atlanta deliver effortless rail access, while Boston and New Jersey require special-event trains. Expect steamy conditions in Miami contrasted with milder Boston evenings.",
    best_of_links: createBestOfLinks(["Boston", "New York", "Philadelphia", "Miami", "Atlanta"]),
    metaDescription:
      "Get the Group C travel breakdown for Boston, New York, Philadelphia, Miami, and Atlanta including transit tips and climate notes.",
  },
  {
    id: "D",
    title: "West Coast Loop",
    total_distance_miles: 3864,
    unique_cities: 4,
    border_crossings: 2,
    countries: ["USA", "Canada"],
    stadium_access: [
      {
        city: "Los Angeles",
        stadium: "SoFi Stadium",
        rating: "none",
        notes: "No fixed rail to Inglewood; rideshare shuttles are the only option.",
      },
      {
        city: "Vancouver",
        stadium: "BC Place",
        rating: "excellent",
        notes: "Downtown stadium with SkyTrain access and walkable streets.",
      },
      {
        city: "San Francisco",
        stadium: "Levi's Stadium",
        rating: "partial",
        notes: "Requires Caltrain or VTA transfers; over 90 minutes from downtown SF.",
      },
      {
        city: "Seattle",
        stadium: "Lumen Field",
        rating: "excellent",
        notes: "Adjacent to Link light rail and Amtrak hubs; very walkable.",
      },
    ],
    climate_zones: [
      { city: "Los Angeles", climate: "Sunny 70-85°F with minimal rain." },
      { city: "Vancouver", climate: "Cool 55-75°F with chance of rain." },
      { city: "San Francisco", climate: "Foggy 60-75°F; layers recommended." },
      { city: "Seattle", climate: "Cool 55-75°F with light rain." },
    ],
    complexity_rating: 4,
    summary:
      "Group D hops repeatedly between California and the Pacific Northwest, forcing fans to revisit Los Angeles and the Bay Area. Seattle and Vancouver shine with effortless transit, while SoFi and Levi's remain car-first venues. Pack layers for chilly northern nights before basking in LA sunshine again.",
    best_of_links: createBestOfLinks(["Los Angeles", "Vancouver", "San Francisco", "Seattle"]),
    metaDescription:
      "Follow Group D across the West Coast with guidance on SoFi and Levi's transit gaps, plus cool coastal climate prep.",
  },
  {
    id: "E",
    title: "Cross-Country Chaos",
    total_distance_miles: 4603,
    unique_cities: 5,
    border_crossings: 2,
    countries: ["USA", "Canada"],
    stadium_access: [
      {
        city: "Philadelphia",
        stadium: "Lincoln Financial Field",
        rating: "excellent",
        notes: "Direct Broad Street Line service to the sports complex.",
      },
      {
        city: "Houston",
        stadium: "NRG Stadium",
        rating: "excellent",
        notes: "METRORail Red Line stops beside the stadium in under 10 minutes.",
      },
      {
        city: "Toronto",
        stadium: "BMO Field",
        rating: "excellent",
        notes: "GO Train from Union Station; walkable Exhibition Grounds.",
      },
      {
        city: "Kansas City",
        stadium: "Arrowhead Stadium",
        rating: "none",
        notes: "No rail; 20 mile drive from downtown with heavy parking demand.",
      },
      {
        city: "New York",
        stadium: "MetLife Stadium",
        rating: "partial",
        notes: "NJ Transit commuter rail to Secaucus then shuttle to the Meadowlands.",
      },
    ],
    climate_zones: [
      { city: "Philadelphia", climate: "Hot and humid 75-90°F." },
      { city: "Houston", climate: "Very hot 85-100°F with high humidity." },
      { city: "Toronto", climate: "Warm 70-85°F; pleasant evenings." },
      { city: "Kansas City", climate: "Hot 80-95°F with thunderstorms." },
      { city: "New York", climate: "Hot and humid 75-90°F." },
    ],
    complexity_rating: 4,
    summary:
      "Group E criss-crosses North America with two border crossings and a wide geographic spread. Three stadiums boast excellent rail while Kansas City remains car-dependent. Expect heavy heat and humidity almost everywhere, with Toronto offering the lone weather reprieve.",
    best_of_links: createBestOfLinks([
      "Philadelphia",
      "Houston",
      "Toronto",
      "Kansas City",
      "New York",
    ]),
    metaDescription:
      "Master Group E logistics from Houston humidity to Toronto's breezes, highlighting the lone no-rail gap in Kansas City.",
  },
  {
    id: "F",
    title: "Texas + Mexico",
    total_distance_miles: 2348,
    unique_cities: 4,
    border_crossings: 2,
    countries: ["USA", "Mexico"],
    stadium_access: [
      {
        city: "Dallas",
        stadium: "AT&T Stadium",
        rating: "none",
        notes: "Located in Arlington with no DART rail; shuttle or rideshare only.",
      },
      {
        city: "Monterrey",
        stadium: "Estadio BBVA",
        rating: "partial",
        notes: "Metro Line 3 plus short road transfer.",
      },
      {
        city: "Houston",
        stadium: "NRG Stadium",
        rating: "excellent",
        notes: "METRORail Red Line arrives in under 10 minutes.",
      },
      {
        city: "Kansas City",
        stadium: "Arrowhead Stadium",
        rating: "none",
        notes: "20 mile drive from downtown with no fixed-route transit.",
      },
    ],
    climate_zones: [
      { city: "Dallas", climate: "Very hot 85-100°F with intense sun." },
      { city: "Monterrey", climate: "Very hot 85-100°F with dry heat." },
      { city: "Houston", climate: "Very hot 85-100°F with extreme humidity." },
      { city: "Kansas City", climate: "Hot 80-95°F summertime conditions." },
    ],
    complexity_rating: 4,
    summary:
      "Group F is geographically compact but punishing on heat and transit. Dallas and Kansas City both lack rail, while Houston's METRORail becomes the best friend of travelling supporters. Repeated legs through Monterrey and Dallas make careful planning essential.",
    best_of_links: createBestOfLinks(["Dallas", "Monterrey", "Houston", "Kansas City"]),
    metaDescription:
      "Handle Group F's scorching itinerary through Dallas, Monterrey, Houston, and Kansas City with transit and climate guidance.",
  },
  {
    id: "G",
    title: "West Coast Ping-Pong",
    total_distance_miles: 3245,
    unique_cities: 3,
    border_crossings: 2,
    countries: ["USA", "Canada"],
    stadium_access: [
      {
        city: "Los Angeles",
        stadium: "SoFi Stadium",
        rating: "none",
        notes: "No direct rail; rely on shuttles or rideshare in Inglewood.",
      },
      {
        city: "Seattle",
        stadium: "Lumen Field",
        rating: "excellent",
        notes: "Adjacent to Link light rail, Sounder, and Amtrak services.",
      },
      {
        city: "Vancouver",
        stadium: "BC Place",
        rating: "excellent",
        notes: "SkyTrain and walkable downtown location.",
      },
    ],
    climate_zones: [
      { city: "Los Angeles", climate: "Sunny 70-85°F with minimal rain." },
      { city: "Seattle", climate: "Cool 55-75°F with frequent drizzle." },
      { city: "Vancouver", climate: "Cool 55-75°F with marine cloud cover." },
    ],
    complexity_rating: 4,
    summary:
      "Group G bounces repeatedly between Vancouver, Seattle, and Los Angeles. Two excellent transit cities ease the northern legs, while LA remains a rideshare grind. Travellers should prep for climate extremes: marine layers up north and sun-drenched matchdays back in California.",
    best_of_links: createBestOfLinks(["Los Angeles", "Seattle", "Vancouver"]),
    metaDescription:
      "Tackle Group G's ping-pong itinerary between LA, Seattle, and Vancouver with key transit gaps and climate contrasts.",
  },
  {
    id: "H",
    title: "South + Mexico",
    total_distance_miles: 3322,
    unique_cities: 4,
    border_crossings: 1,
    countries: ["USA", "Mexico"],
    stadium_access: [
      {
        city: "Miami",
        stadium: "Hard Rock Stadium",
        rating: "none",
        notes: "No rail service; 20-25 mile road trip from Miami Beach.",
      },
      {
        city: "Atlanta",
        stadium: "Mercedes-Benz Stadium",
        rating: "excellent",
        notes: "Integrated MARTA rail with stations on both sides of the venue.",
      },
      {
        city: "Houston",
        stadium: "NRG Stadium",
        rating: "excellent",
        notes: "METRORail delivers 8-10 minute rides from downtown districts.",
      },
      {
        city: "Guadalajara",
        stadium: "Estadio Akron",
        rating: "none",
        notes: "No rail link; taxis or rideshare required from the city centre.",
      },
    ],
    climate_zones: [
      { city: "Miami", climate: "Tropical 85-95°F with afternoon storms." },
      { city: "Atlanta", climate: "Hot and humid 80-95°F." },
      { city: "Houston", climate: "Extremely hot 85-100°F with high humidity." },
      { city: "Guadalajara", climate: "Warm 70-85°F with rainy-season showers." },
    ],
    complexity_rating: 4,
    summary:
      "Group H keeps travel concentrated in the southern US with a late hop to Guadalajara. Miami and Guadalajara are car-first stadiums, while Atlanta and Houston offer excellent rail. Expect relentless heat and humidity nearly every day of the itinerary.",
    best_of_links: createBestOfLinks(["Miami", "Atlanta", "Houston", "Guadalajara"]),
    metaDescription:
      "See how Group H balances Atlanta and Houston's transit strengths with Miami and Guadalajara's car-heavy logistics plus extreme heat.",
  },
  {
    id: "I",
    title: "Northeast Corridor",
    total_distance_miles: 1161,
    unique_cities: 4,
    border_crossings: 1,
    countries: ["USA", "Canada"],
    stadium_access: [
      {
        city: "New York",
        stadium: "MetLife Stadium",
        rating: "partial",
        notes: "NJ Transit to Secaucus with event-day transfers to the Meadowlands.",
      },
      {
        city: "Boston",
        stadium: "Gillette Stadium",
        rating: "partial",
        notes: "Event trains from South Station, roughly 60 minutes to Foxborough.",
      },
      {
        city: "Philadelphia",
        stadium: "Lincoln Financial Field",
        rating: "excellent",
        notes: "Direct Broad Street Line service to the sports complex.",
      },
      {
        city: "Toronto",
        stadium: "BMO Field",
        rating: "excellent",
        notes: "GO Train from Union Station in minutes; walkable waterfront venue.",
      },
    ],
    climate_zones: [
      { city: "New York", climate: "Hot and humid 75-90°F." },
      { city: "Boston", climate: "Pleasant 65-80°F; cooler evenings." },
      { city: "Philadelphia", climate: "Hot and humid 75-90°F." },
      { city: "Toronto", climate: "Warm 70-85°F; lake breezes in the evening." },
    ],
    complexity_rating: 2,
    summary:
      "Group I is the most compact itinerary in the tournament, hugging the Amtrak spine from Boston to Philadelphia before finishing in Toronto. Only one border crossing is required, and two stadiums have excellent rail access. Stadiums in Foxborough and the Meadowlands sit outside downtown cores, so plan for special trains and bus shuttles.",
    best_of_links: createBestOfLinks(["New York", "Boston", "Philadelphia", "Toronto"]),
    metaDescription:
      "Group I keeps fans inside the Northeast Corridor with short hops, reliable rail, and only one border crossing to Toronto.",
  },
  {
    id: "J",
    title: "Cross-Country Nightmare",
    total_distance_miles: 6424,
    unique_cities: 3,
    border_crossings: 0,
    countries: ["USA"],
    stadium_access: [
      {
        city: "Kansas City",
        stadium: "Arrowhead Stadium",
        rating: "none",
        notes: "Car-dependent 20 mile trip from downtown; heavy parking reliance.",
      },
      {
        city: "San Francisco",
        stadium: "Levi's Stadium",
        rating: "partial",
        notes: "Complex Caltrain/VTA combination from San Francisco or San Jose.",
      },
      {
        city: "Dallas",
        stadium: "AT&T Stadium",
        rating: "none",
        notes: "No DART rail to Arlington; expect long shuttle or rideshare waits.",
      },
    ],
    climate_zones: [
      { city: "Kansas City", climate: "Hot 80-95°F with humidity." },
      { city: "San Francisco", climate: "Cool 60-75°F with evening fog." },
      { city: "Dallas", climate: "Very hot 85-100°F with intense sun." },
    ],
    complexity_rating: 5,
    summary:
      "Group J is the toughest travel draw: coast-to-coast swings between Dallas and the Bay Area with Kansas City wedged in the middle. None of the stadiums offer straightforward rail, so every leg relies on flights and road transfers. Prepare for wild climate swings between foggy Santa Clara nights and scorching Texas afternoons.",
    best_of_links: createBestOfLinks(["Kansas City", "San Francisco", "Dallas"]),
    metaDescription:
      "Survive Group J's brutal coast-to-coast itinerary with tips for handling three car-first stadiums and massive flight legs.",
  },
  {
    id: "K",
    title: "South + Mexico Odyssey",
    total_distance_miles: 4422,
    unique_cities: 5,
    border_crossings: 2,
    countries: ["USA", "Mexico"],
    stadium_access: [
      {
        city: "Houston",
        stadium: "NRG Stadium",
        rating: "excellent",
        notes: "Red Line light rail connects in under 10 minutes.",
      },
      {
        city: "Mexico City",
        stadium: "Estadio Azteca",
        rating: "partial",
        notes: "Metro + Tren Ligero with transfers and a final walk.",
      },
      {
        city: "Guadalajara",
        stadium: "Estadio Akron",
        rating: "none",
        notes: "Taxi or rideshare only; no rail infrastructure.",
      },
      {
        city: "Miami",
        stadium: "Hard Rock Stadium",
        rating: "none",
        notes: "Car-first venue 20+ miles from major tourist zones.",
      },
      {
        city: "Atlanta",
        stadium: "Mercedes-Benz Stadium",
        rating: "excellent",
        notes: "MARTA stations flank the venue for seamless entry.",
      },
    ],
    climate_zones: [
      { city: "Houston", climate: "Extremely hot 85-100°F with humidity." },
      { city: "Mexico City", climate: "Mild 60-75°F at 7,350 ft altitude." },
      { city: "Guadalajara", climate: "Warm 70-85°F with rainy season influence." },
      { city: "Miami", climate: "Tropical 85-95°F with storms." },
      { city: "Atlanta", climate: "Hot and humid 80-95°F." },
    ],
    complexity_rating: 5,
    summary:
      "Group K mixes altitude, tropical humidity, and long-haul flights. Houston and Atlanta offer stellar rail but both Miami and Guadalajara remain car-driven. Fans juggle currencies, heat, and elevation while revisiting Houston midway through the schedule.",
    best_of_links: createBestOfLinks(["Houston", "Mexico City", "Guadalajara", "Miami", "Atlanta"]),
    metaDescription:
      "Group K blends Mexico's altitude with Miami humidity; get transit and climate intel for a demanding south-to-north itinerary.",
  },
  {
    id: "L",
    title: "East Coast + Texas",
    total_distance_miles: 3605,
    unique_cities: 5,
    border_crossings: 2,
    countries: ["Canada", "USA"],
    stadium_access: [
      {
        city: "Toronto",
        stadium: "BMO Field",
        rating: "excellent",
        notes: "GO Train access with short walk along the waterfront.",
      },
      {
        city: "Dallas",
        stadium: "AT&T Stadium",
        rating: "none",
        notes: "No DART connection; use shuttle or rideshare from Dallas/Fort Worth.",
      },
      {
        city: "Boston",
        stadium: "Gillette Stadium",
        rating: "partial",
        notes: "Event trains + shuttle buses from South Station to Foxborough.",
      },
      {
        city: "New York",
        stadium: "MetLife Stadium",
        rating: "partial",
        notes: "NJ Transit rail with special-event transfers.",
      },
      {
        city: "Philadelphia",
        stadium: "Lincoln Financial Field",
        rating: "excellent",
        notes: "Broad Street Line stops at the stadium complex in 20 minutes.",
      },
    ],
    climate_zones: [
      { city: "Toronto", climate: "Warm 70-85°F with lake breezes." },
      { city: "Dallas", climate: "Very hot 85-100°F and sunny." },
      { city: "Boston", climate: "Warm 65-80°F with cooler nights." },
      { city: "New York", climate: "Hot and humid 75-90°F." },
      { city: "Philadelphia", climate: "Hot and humid 75-90°F." },
    ],
    complexity_rating: 4,
    summary:
      "Group L alternates between Toronto and major Northeast hubs before finishing in Philadelphia. Dallas is the outlier with no rail while Toronto and Philly deliver excellent transit. Fans should brace for cross-border checks and climate differences between breezy Lake Ontario nights and scorching Texas afternoons.",
    best_of_links: createBestOfLinks(["Toronto", "Dallas", "Boston", "New York", "Philadelphia"]),
    metaDescription:
      "Prepare for Group L's Toronto-to-Texas run with notes on transit gaps, border crossings, and wide-ranging summer climates.",
  },
];
