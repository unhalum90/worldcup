// Team data for World Cup 2026
// Last updated: December 2025 - Enhanced with comprehensive research

export interface PlayerDetail {
  name: string;
  position: string;
  club: string;
  number: number;
  age: number;
}

export interface HistoricalEvent {
  year: number;
  event: string;
  category: 'first_appearance' | 'championship' | 'notable_performance' | 'disappointment';
}

export interface GreatestMoment {
  title: string;
  description: string;
  year: number;
  tournament: string;
  video_search_query?: string;
}

export interface FanCulture {
  traditions: string;
  famous_chant: string;
  supporter_groups: string;
  match_day_atmosphere: string;
}

export interface TravelCulture {
  common_origin_cities: string[];
  travel_style: string;
  language_notes: string;
  cultural_considerations: string;
}

export interface Team {
  slug: string;
  name: string;
  confederation: 'AFC' | 'CAF' | 'CONCACAF' | 'CONMEBOL' | 'OFC' | 'UEFA';
  isProvisional: boolean;
  fifaRanking?: number;
  appearances?: number;
  bestFinish?: string;
  primaryColor: string;
  secondaryColor: string;
  flagEmoji: string;
  coach?: string;
  nickname?: string;
  starPlayers?: PlayerDetail[];
  greatestMoments?: GreatestMoment[];
  historicalTimeline?: HistoricalEvent[];
  fanCulture?: FanCulture;
  travelCulture?: TravelCulture;
  funFacts?: string[];
}

export const teams: Team[] = [
  // HOST NATIONS (3)
  {
    slug: 'canada',
    name: 'Canada',
    confederation: 'CONCACAF',
    isProvisional: false,
    fifaRanking: 26,
    appearances: 2,
    bestFinish: 'Group Stage (1986, 2022)',
    primaryColor: '#FF0000',
    secondaryColor: '#FFFFFF',
    flagEmoji: '🇨🇦',
    coach: 'Jesse Marsch',
    nickname: 'Les Rouges',
    starPlayers: [
      {
        name: 'Alphonso Davies',
        position: 'Defender',
        club: 'Bayern Munich',
        number: 19,
        age: 23
      },
      {
        name: 'Jonathan David',
        position: 'Forward',
        club: 'Lille',
        number: 10,
        age: 24
      },
      {
        name: 'Cyle Larin',
        position: 'Forward',
        club: 'Mallorca',
        number: 9,
        age: 29
      },
      {
        name: 'Ismaël Koné',
        position: 'Midfielder',
        club: 'Watford',
        number: 8,
        age: 22
      }
    ],
    historicalTimeline: [
      {
        year: 1904,
        event: 'Won Olympic Gold medal in football (Galt FC representing Canada).',
        category: 'championship'
      },
      {
        year: 1986,
        event: 'First FIFA World Cup appearance in Mexico.',
        category: 'first_appearance'
      },
      {
        year: 2000,
        event: 'Won the CONCACAF Gold Cup for the first time.',
        category: 'championship'
      },
      {
        year: 2022,
        event: 'Returned to the World Cup after a 36-year absence.',
        category: 'notable_performance'
      },
      {
        year: 2023,
        event: 'Finished as Copa América runners-up, defeating Venezuela and losing to Argentina in the final.',
        category: 'notable_performance'
      }
    ],
    greatestMoments: [
      {
        title: 'Return to the World Cup',
        description: 'After 36 years in the wilderness, Canada qualified for the 2022 World Cup in Qatar, reigniting a nation\'s footballing passion.',
        year: 2022,
        tournament: '2022 FIFA World Cup Qualification',
        video_search_query: 'Canada qualifies for 2022 World Cup highlights'
      },
      {
        title: 'Gold Cup Glory',
        description: 'Defeating Colombia on penalties in the 2000 Gold Cup final, Canada claimed their first major CONCACAF title.',
        year: 2000,
        tournament: '2000 CONCACAF Gold Cup',
        video_search_query: 'Canada vs Colombia 2000 Gold Cup Final'
      },
      {
        title: 'First World Cup Goal',
        description: 'Alphonso Davies scores Canada\'s first-ever World Cup goal against Croatia at the 2022 World Cup.',
        year: 2022,
        tournament: '2022 FIFA World Cup',
        video_search_query: 'Alphonso Davies first goal for Canada World Cup 2022'
      }
    ],
    fanCulture: {
      traditions: 'Canadian support is friendly, welcoming, and united, often chanting bilingual slogans. The Voyageurs, the official supporters\' group, are known for creating a vibrant, family-friendly atmosphere.',
      famous_chant: 'Oh Canada, We Stand On Guard For Thee!',
      supporter_groups: 'The Voyageurs',
      match_day_atmosphere: 'Enthusiastic and inclusive, characterized by red and white colors, maple leaf flags, and growing excitement as the golden generation emerges.'
    },
    funFacts: [
      'Canada\'s men\'s team won the Olympic Gold medal in 1904, though the competition only featured three clubs.',
      'The 1986 World Cup team was the first Canadian team in any major sport to play in a FIFA-sanctioned World Cup.',
      'Alphonso Davies became the first Canadian man to score a goal at a FIFA World Cup in 2022.'
    ]
  },
  {
    slug: 'mexico',
    name: 'Mexico',
    confederation: 'CONCACAF',
    isProvisional: false,
    fifaRanking: 14,
    appearances: 17,
    bestFinish: 'Quarter-finals (1970, 1986)',
    primaryColor: '#006847',
    secondaryColor: '#FFFFFF',
    flagEmoji: '🇲🇽',
    coach: 'Javier Aguirre',
    nickname: 'El Tri',
    starPlayers: [
      {
        name: 'Edson Álvarez',
        position: 'Midfielder',
        club: 'West Ham United',
        number: 4,
        age: 27
      },
      {
        name: 'Santiago Giménez',
        position: 'Forward',
        club: 'Feyenoord',
        number: 9,
        age: 23
      },
      {
        name: 'Hirving Lozano',
        position: 'Winger',
        club: 'PSV Eindhoven',
        number: 11,
        age: 29
      },
      {
        name: 'César Montes',
        position: 'Defender',
        club: 'FC Lokomotiv Moscow',
        number: 3,
        age: 27
      }
    ],
    historicalTimeline: [
      {
        year: 1930,
        event: 'Participated in the inaugural FIFA World Cup in Uruguay.',
        category: 'first_appearance'
      },
      {
        year: 1970,
        event: 'Hosts the World Cup for the first time and reaches the Quarter-finals.',
        category: 'notable_performance'
      },
      {
        year: 1986,
        event: 'Hosts the World Cup for the second time, matching their best-ever finish of the Quarter-finals.',
        category: 'notable_performance'
      },
      {
        year: 1999,
        event: 'Wins the FIFA Confederations Cup on home soil, defeating Brazil in the final.',
        category: 'championship'
      },
      {
        year: 2023,
        event: 'Wins the CONCACAF Gold Cup for the 12th time, defeating Panama 1-0 in the final.',
        category: 'championship'
      }
    ],
    greatestMoments: [
      {
        title: 'The Manuel Negrete Goal',
        description: 'During the 1986 World Cup, Manuel Negrete scored a spectacular scissors-kick volley against Bulgaria in the Round of 16, considered one of the greatest World Cup goals ever.',
        year: 1986,
        tournament: '1986 FIFA World Cup',
        video_search_query: 'Manuel Negrete Goal 1986 World Cup vs Bulgaria'
      },
      {
        title: 'Confederations Cup Triumph',
        description: 'In a thrilling match at the Estadio Azteca, Mexico defeats global giant Brazil 4-3 to win their only senior FIFA-sanctioned title outside of CONCACAF.',
        year: 1999,
        tournament: '1999 FIFA Confederations Cup',
        video_search_query: 'Mexico vs Brazil 1999 Confederations Cup Final'
      },
      {
        title: 'Upsetting the Holders',
        description: 'In their opening match of the 2018 World Cup, Mexico delivered a massive shock by defeating the defending champions Germany 1-0, with a goal from Hirving Lozano.',
        year: 2018,
        tournament: '2018 FIFA World Cup',
        video_search_query: 'Mexico vs Germany 2018 World Cup 1-0'
      }
    ],
    fanCulture: {
      traditions: 'Mexican fan culture is renowned for its noise, passion, and color, particularly at the Estadio Azteca. Fans frequently wear sombreros and traditional garments, and the \'Mexican Wave\' (La Ola) is said to have been popularized globally during the 1986 World Cup in Mexico.',
      famous_chant: 'Cielito Lindo (often played and sung after goals)',
      supporter_groups: 'La Afición (General Fan Base), Barra brava groups exist but are discouraged at official matches.',
      match_day_atmosphere: 'The atmosphere is overwhelmingly festive and intense. Games, even friendlies in the US, often feel like home matches due to the massive Mexican-American population and traveling support. The air is thick with excitement, horns, and chants.'
    },
    funFacts: [
      'Mexico is tied with Brazil for the most World Cup appearances (17, including 2026).',
      'From 1994 to 2018, Mexico qualified for the Round of 16 in seven consecutive World Cups, but lost every time.',
      'The Estadio Azteca, a co-host venue in 2026, is the only stadium in history to have hosted two World Cup Finals (1970 and 1986).'
    ]
  },
  {
    slug: 'united-states',
    name: 'United States',
    confederation: 'CONCACAF',
    isProvisional: false,
    fifaRanking: 13,
    appearances: 11,
    bestFinish: 'Third Place (1930)',
    primaryColor: '#002868',
    secondaryColor: '#BF0A30',
    flagEmoji: '🇺🇸',
    coach: 'Mauricio Pochettino',
    nickname: 'The Stars and Stripes',
    starPlayers: [
      {
        name: 'Christian Pulisic',
        position: 'Winger',
        club: 'AC Milan',
        number: 10,
        age: 26
      },
      {
        name: 'Weston McKennie',
        position: 'Midfielder',
        club: 'Juventus',
        number: 8,
        age: 26
      },
      {
        name: 'Folarin Balogun',
        position: 'Forward',
        club: 'AS Monaco',
        number: 20,
        age: 23
      },
      {
        name: 'Antonee Robinson',
        position: 'Defender',
        club: 'Fulham',
        number: 5,
        age: 27
      }
    ],
    historicalTimeline: [
      {
        year: 1930,
        event: 'Participated in the inaugural World Cup, finishing third (their best-ever result).',
        category: 'notable_performance'
      },
      {
        year: 1950,
        event: 'Achieved the \'Miracle on Grass\' by defeating a heavily favored England team 1-0.',
        category: 'notable_performance'
      },
      {
        year: 1990,
        event: 'Qualified for the World Cup after a 40-year drought, marking the start of their modern era.',
        category: 'first_appearance'
      },
      {
        year: 1994,
        event: 'Hosts the FIFA World Cup for the first time, setting tournament attendance records.',
        category: 'notable_performance'
      },
      {
        year: 2002,
        event: 'Reaches the World Cup Quarter-finals, narrowly losing to Germany.',
        category: 'notable_performance'
      }
    ],
    greatestMoments: [
      {
        title: 'The Miracle on Grass',
        description: 'In one of the biggest upsets in World Cup history, the largely amateur American team defeated the highly favored English side 1-0, with a goal by Joe Gaetjens.',
        year: 1950,
        tournament: '1950 FIFA World Cup',
        video_search_query: 'USA vs England 1950 World Cup full match highlights'
      },
      {
        title: 'Defeating Arch-Rival Mexico in the Round of 16',
        description: 'The U.S. defeated Mexico 2-0 in the World Cup knockout stage—a historic result dubbed the \'Dos a Cero\' match, advancing them to the Quarter-finals.',
        year: 2002,
        tournament: '2002 FIFA World Cup',
        video_search_query: 'USA vs Mexico 2002 World Cup Dos a Cero'
      },
      {
        title: 'Landon Donovan\'s Last-Minute Goal',
        description: 'In a crucial final group stage match, Landon Donovan scored in stoppage time against Algeria to win the group for the first time since 1930 and send the US through.',
        year: 2010,
        tournament: '2010 FIFA World Cup',
        video_search_query: 'Landon Donovan goal vs Algeria 2010 World Cup'
      }
    ],
    fanCulture: {
      traditions: 'USMNT fan culture blends traditional American sports atmosphere with international soccer elements. The term \'Dos a Cero\' (2-0) is a famous tradition, celebrating wins over Mexico in World Cup Qualifying. Chants often rely on English-language songs and specific player salutes.',
      famous_chant: 'I Believe That We Will Win!',
      supporter_groups: 'American Outlaws (AO), Sam\'s Army (Historical), The Federation (Official Supporter\'s Group for U.S. Soccer)',
      match_day_atmosphere: 'The atmosphere is loud, organized, and patriotic, with large US flags and banners. Support is strongest in specific soccer markets like Seattle, Kansas City, and the co-host cities.'
    },
    funFacts: [
      'The 1994 World Cup hosted in the US remains the most attended World Cup in history.',
      'The USMNT\'s third-place finish in 1930 is the best finish by any non-CONMEBOL/UEFA team.',
      'The team has developed a new generation of players, many of whom are starting for top clubs in Europe\'s \'Big Five\' leagues.'
    ]
  },

  // ASIA (AFC) - 8 teams
  {
    slug: 'australia',
    name: 'Australia',
    confederation: 'AFC',
    isProvisional: false,
    fifaRanking: 25,
    appearances: 6,
    bestFinish: 'Round of 16',
    primaryColor: '#FFCD00',
    secondaryColor: '#00843D',
    flagEmoji: '🇦🇺',
    coach: 'Graham Arnold',
    starPlayers: [
      { name: 'Mathew Ryan', position: 'Goalkeeper', club: 'AZ Alkmaar', number: 1, age: 32 },
      { name: 'Aaron Mooy', position: 'Midfielder', club: 'Shanghai Port', number: 13, age: 33 },
      { name: 'Martin Boyle', position: 'Winger', club: 'Hibernian', number: 6, age: 31 }
    ]
  },
  {
    slug: 'iran',
    name: 'Iran',
    confederation: 'AFC',
    isProvisional: false,
    fifaRanking: 21,
    appearances: 6,
    bestFinish: 'Group Stage',
    primaryColor: '#239F40',
    secondaryColor: '#DA0000',
    flagEmoji: '🇮🇷',
    coach: 'Amir Ghalenoei',
    starPlayers: [
      { name: 'Sardar Azmoun', position: 'Forward', club: 'AS Roma', number: 9, age: 29 },
      { name: 'Mehdi Taremi', position: 'Forward', club: 'FC Porto', number: 9, age: 32 },
      { name: 'Alireza Jahanbakhsh', position: 'Winger', club: 'Feyenoord', number: 7, age: 30 }
    ]
  },
  {
    slug: 'japan',
    name: 'Japan',
    confederation: 'AFC',
    isProvisional: false,
    fifaRanking: 18,
    appearances: 8,
    bestFinish: 'Round of 16',
    primaryColor: '#0A1F8F',
    secondaryColor: '#FFFFFF',
    flagEmoji: '🇯🇵',
    coach: 'Hajime Moriyasu',
    starPlayers: [
      { name: 'Takumi Minamino', position: 'Forward', club: 'AS Monaco', number: 18, age: 29 },
      { name: 'Kaoru Mitoma', position: 'Winger', club: 'Brighton', number: 9, age: 27 },
      { name: 'Takefusa Kubo', position: 'Midfielder', club: 'Real Sociedad', number: 20, age: 23 }
    ],
    greatestMoments: [
      {
        title: 'Japan 2–1 Germany (2022)',
        description: 'A stunning upset that shocked the world',
        year: 2022,
        tournament: '2022 FIFA World Cup'
      }
    ],
    historicalTimeline: [
      { year: 1998, event: 'First World Cup appearance', category: 'first_appearance' },
      { year: 2002, event: 'Co-hosted the tournament with South Korea', category: 'notable_performance' },
      { year: 2010, event: 'Advanced to Round of 16', category: 'notable_performance' },
      { year: 2018, event: 'Famous fair-play tiebreaker advancement', category: 'notable_performance' },
      { year: 2022, event: 'Beat Germany & Spain in group stage', category: 'notable_performance' }
    ]
  },
  {
    slug: 'jordan',
    name: 'Jordan',
    confederation: 'AFC',
    isProvisional: false,
    fifaRanking: 68,
    appearances: 1,
    bestFinish: 'TBD',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    flagEmoji: '🇯🇴',
    coach: 'Jamal Sellami',
    starPlayers: [
      { name: 'Yazan Al-Naimat', position: 'Forward', club: 'Al-Hussein', number: 9, age: 27 },
      { name: 'Musa Al-Taamari', position: 'Winger', club: 'Montpellier', number: 7, age: 27 }
    ]
  },
  {
    slug: 'qatar',
    name: 'Qatar',
    confederation: 'AFC',
    isProvisional: false,
    fifaRanking: 34,
    appearances: 2,
    bestFinish: 'Group Stage',
    primaryColor: '#8D1B3D',
    secondaryColor: '#FFFFFF',
    flagEmoji: '🇶🇦',
    coach: 'Tintin Márquez',
    starPlayers: [
      { name: 'Akram Afif', position: 'Winger', club: 'Al-Sadd', number: 11, age: 28 },
      { name: 'Almoez Ali', position: 'Forward', club: 'Al-Duhail', number: 19, age: 28 },
      { name: 'Hassan Al-Haydos', position: 'Midfielder', club: 'Al-Sadd', number: 10, age: 33 }
    ]
  },
  {
    slug: 'saudi-arabia',
    name: 'Saudi Arabia',
    confederation: 'AFC',
    isProvisional: false,
    fifaRanking: 56,
    appearances: 7,
    bestFinish: 'Round of 16',
    primaryColor: '#165B33',
    secondaryColor: '#FFFFFF',
    flagEmoji: '🇸🇦',
    coach: 'Roberto Mancini',
    starPlayers: [
      { name: 'Salem Al-Dawsari', position: 'Winger', club: 'Al-Hilal', number: 10, age: 32 },
      { name: 'Saleh Al-Shehri', position: 'Forward', club: 'Al-Hilal', number: 9, age: 31 }
    ]
  },
  {
    slug: 'south-korea',
    name: 'South Korea',
    confederation: 'AFC',
    isProvisional: false,
    fifaRanking: 23,
    appearances: 11,
    bestFinish: 'Fourth Place (2002)',
    primaryColor: '#CD2E3A',
    secondaryColor: '#FFFFFF',
    flagEmoji: '🇰🇷',
    coach: 'Jürgen Klinsmann',
    starPlayers: [
      { name: 'Son Heung-min', position: 'Forward', club: 'Tottenham', number: 7, age: 32 },
      { name: 'Lee Kang-in', position: 'Midfielder', club: 'Paris Saint-Germain', number: 18, age: 23 },
      { name: 'Kim Min-jae', position: 'Defender', club: 'Bayern Munich', number: 3, age: 28 }
    ]
  },
  {
    slug: 'uzbekistan',
    name: 'Uzbekistan',
    confederation: 'AFC',
    isProvisional: false,
    fifaRanking: 68,
    appearances: 1,
    bestFinish: 'TBD',
    primaryColor: '#1EB53A',
    secondaryColor: '#0099B5',
    flagEmoji: '🇺🇿',
    coach: 'Srecko Katanec',
    starPlayers: [
      { name: 'Eldor Shomurodov', position: 'Forward', club: 'Roma', number: 14, age: 27 },
      { name: 'Odil Ahmedov', position: 'Midfielder', club: 'Al-Wehda', number: 8, age: 37 }
    ]
  },

  // AFRICA (CAF) - 9 teams
  {
    slug: 'algeria',
    name: 'Algeria',
    confederation: 'CAF',
    isProvisional: false,
    fifaRanking: 37,
    appearances: 5,
    bestFinish: 'Round of 16 (2014)',
    primaryColor: '#006233',
    secondaryColor: '#FFFFFF',
    flagEmoji: '🇩🇿',
    coach: 'Vladimir Petković',
    nickname: 'The Fennecs',
    starPlayers: [
      {
        name: 'Riyad Mahrez',
        position: 'Winger',
        club: 'Al-Ahli SFC',
        number: 7,
        age: 33
      },
      {
        name: 'Ismaël Bennacer',
        position: 'Midfielder',
        club: 'AC Milan',
        number: 22,
        age: 26
      },
      {
        name: 'Mohamed Amoura',
        position: 'Forward',
        club: 'Union SG',
        number: 11,
        age: 24
      },
      {
        name: 'Houssem Aouar',
        position: 'Midfielder',
        club: 'AS Roma',
        number: 8,
        age: 26
      }
    ],
    historicalTimeline: [
      { 
        year: 1963, 
        event: 'Played their first official international match against Bulgaria.',
        category: 'first_appearance'
      },
      { 
        year: 1982, 
        event: 'First World Cup appearance, famously defeating West Germany 2-1.',
        category: 'first_appearance'
      },
      { 
        year: 1990, 
        event: 'Won their first Africa Cup of Nations title on home soil.',
        category: 'championship'
      },
      { 
        year: 2014, 
        event: 'Reached the World Cup Round of 16 for the first time, losing to Germany in extra time.',
        category: 'notable_performance'
      },
      { 
        year: 2019, 
        event: 'Won their second Africa Cup of Nations, defeating Senegal in the final.',
        category: 'championship'
      }
    ],
    greatestMoments: [
      {
        title: 'The Shame of Gijón (Victory vs West Germany)',
        description: 'In their World Cup debut, Algeria shocked the world by defeating the reigning European champions West Germany 2-1, although they were later eliminated by a controversial fixture result.',
        year: 1982,
        tournament: '1982 FIFA World Cup',
        video_search_query: 'Algeria vs West Germany 1982 highlights'
      },
      {
        title: 'Making the Round of 16',
        description: 'After finally advancing past the group stage, Algeria takes eventual champions Germany to extra time in a dramatic knockout match, signaling a new era of African football.',
        year: 2014,
        tournament: '2014 FIFA World Cup',
        video_search_query: 'Algeria vs Germany 2014 World Cup Round of 16'
      }
    ],
    fanCulture: {
      traditions: 'Algerian fans (\'El Khadra\' or \'The Greens\') are known for their intense passion, creating a fiery atmosphere with constant drumming, chanting, and heavy use of the green and white national colours.',
      famous_chant: 'One, Two, Three, Viva l\'Algérie!',
      supporter_groups: 'Various local fan clubs that unite for the national team.',
      match_day_atmosphere: 'Extremely passionate, loud, and often intimidating for opponents, especially in North Africa. The team is seen as a symbol of national pride and resilience.'
    },
    funFacts: [
      'Algeria is one of the four teams in the world to be eliminated from the World Cup group stage despite winning two matches (1982).',
      'They won the 2021 FIFA Arab Cup.',
      'Riyad Mahrez is the team\'s captain.'
    ]
  },
  {
    slug: 'cape-verde',
    name: 'Cape Verde',
    confederation: 'CAF',
    isProvisional: false,
    fifaRanking: 70,
    appearances: 1,
    bestFinish: 'Group stage (Debut)',
    primaryColor: '#003893',
    secondaryColor: '#CF2027',
    flagEmoji: '🇨🇻',
    coach: 'Bubista (Pedro Leitão Brito)',
    nickname: 'Blue Sharks',
    starPlayers: [
      {
        name: 'Ryan Mendes',
        position: 'Winger/Captain',
        club: 'Karagümrük',
        number: 10,
        age: 34
      },
      {
        name: 'Logan Costa',
        position: 'Defender',
        club: 'Toulouse FC',
        number: 5,
        age: 23
      },
      {
        name: 'Jamiro Monteiro',
        position: 'Midfielder',
        club: 'Gassman',
        number: 8,
        age: 31
      }
    ],
    historicalTimeline: [
      { 
        year: 1978, 
        event: 'Played their first international match against Guinea.',
        category: 'first_appearance'
      },
      { 
        year: 2013, 
        event: 'First qualification for the Africa Cup of Nations (AFCON), reaching the Quarter-finals.',
        category: 'first_appearance'
      },
      { 
        year: 2023, 
        event: 'Reached the AFCON Quarter-finals, equaling their best result.',
        category: 'notable_performance'
      },
      { 
        year: 2026, 
        event: 'Qualify for their first-ever FIFA World Cup, becoming the second-smallest nation by population to do so.',
        category: 'first_appearance'
      }
    ],
    greatestMoments: [
      {
        title: 'Historic World Cup Qualification',
        description: 'Cape Verde defeats Eswatini 3-0 to seal their first-ever World Cup berth, becoming the smallest African nation to qualify for the tournament.',
        year: 2025,
        tournament: '2026 FIFA World Cup Qualification',
        video_search_query: 'Cape Verde World Cup qualification 2026 highlights'
      },
      {
        title: 'Quarter-Final AFCON Debut',
        description: 'In their maiden AFCON appearance, the Blue Sharks defeat Angola and draw with Morocco and South Africa to reach the Quarter-finals.',
        year: 2013,
        tournament: '2013 Africa Cup of Nations',
        video_search_query: 'Cape Verde AFCON 2013 highlights'
      }
    ],
    fanCulture: {
      traditions: 'Reflecting its island and diaspora heritage, Cape Verdean support is highly festive and celebratory. Fans are known for using the Creole language and uniting players from across the global diaspora.',
      famous_chant: 'Tubarões Azuis (Blue Sharks)!',
      supporter_groups: 'Vast, informal groups of diaspora fans in Portugal, France, and the US.',
      match_day_atmosphere: 'Joyful and carnival-like, with immense national pride given the small size of the country and the scale of their achievement.'
    },
    funFacts: [
      'Cape Verde is the second-smallest nation by population (under 600,000) to ever qualify for the men\'s World Cup.',
      'Many top Portuguese players have Cape Verdean ancestry, but the current squad is drawn from 14 different foreign leagues.',
      'The team\'s nickname, \'Blue Sharks\' (\'Tubarões Azuis\'), reflects its island nature.'
    ]
  },
  {
    slug: 'egypt',
    name: 'Egypt',
    confederation: 'CAF',
    isProvisional: false,
    fifaRanking: 35,
    appearances: 3,
    bestFinish: 'Group Stage (1934, 1990, 2018)',
    primaryColor: '#CE1126',
    secondaryColor: '#FFFFFF',
    flagEmoji: '🇪🇬',
    coach: 'Hossam Hassan',
    nickname: 'The Pharaohs',
    starPlayers: [
      {
        name: 'Mohamed Salah',
        position: 'Winger/Captain',
        club: 'Liverpool',
        number: 10,
        age: 32
      },
      {
        name: 'Mostafa Mohamed',
        position: 'Forward',
        club: 'FC Nantes',
        number: 19,
        age: 27
      },
      {
        name: 'Trézéguet',
        position: 'Winger',
        club: 'Trabzonspor',
        number: 7,
        age: 30
      },
      {
        name: 'Mohamed Elneny',
        position: 'Midfielder',
        club: 'Beşiktaş',
        number: 17,
        age: 32
      }
    ],
    historicalTimeline: [
      {
        year: 1934,
        event: 'First World Cup appearance, becoming the first African team to play in the tournament.',
        category: 'first_appearance'
      },
      {
        year: 1957,
        event: 'Won the inaugural Africa Cup of Nations.',
        category: 'championship'
      },
      {
        year: 1990,
        event: 'Qualified for the World Cup after a 56-year absence.',
        category: 'notable_performance'
      },
      {
        year: 2006,
        event: 'Began a historic run, winning three consecutive Africa Cup of Nations titles (2006, 2008, 2010).',
        category: 'championship'
      },
      {
        year: 2018,
        event: 'Qualified for the World Cup after a 28-year absence, led by Mohamed Salah.',
        category: 'notable_performance'
      }
    ],
    greatestMoments: [
      {
        title: 'Africa\'s First World Cup Team',
        description: 'Egypt became the first African and Arab nation to compete in the World Cup, playing Hungary in the first round.',
        year: 1934,
        tournament: '1934 FIFA World Cup',
        video_search_query: 'Egypt 1934 World Cup first African team'
      },
      {
        title: 'Three-Peat AFCON Champions',
        description: 'Winning three consecutive Africa Cup of Nations titles between 2006 and 2010, establishing a dominance unmatched in the continent\'s history.',
        year: 2010,
        tournament: '2010 Africa Cup of Nations',
        video_search_query: 'Egypt AFCON 2010 final highlights'
      }
    ],
    fanCulture: {
      traditions: 'Egyptian fans, \'The Pharaohs\', are extremely passionate and create a famously loud, high-octane atmosphere, especially in Cairo. Their support for Mohamed Salah is quasi-religious.',
      famous_chant: 'Ya Ahly Ya Gameel (club chant, often adapted for the national team)',
      supporter_groups: 'Ultras affiliated with rival clubs often unite for the national team.',
      match_day_atmosphere: 'Intense, noisy, and enthusiastic, characterized by the roar of the crowd, with red and white dominating the stadium.'
    },
    funFacts: [
      'Egypt holds the record for the most Africa Cup of Nations titles (7).',
      'Their 56-year gap between the 1934 and 1990 World Cups is one of the longest in World Cup history.',
      'Hossam Hassan is a legendary former player and one of the most prolific African scorers.'
    ]
  },
  {
    slug: 'ghana',
    name: 'Ghana',
    confederation: 'CAF',
    isProvisional: false,
    fifaRanking: 61,
    appearances: 4,
    bestFinish: 'Quarter-finals (2010)',
    primaryColor: '#006B3F',
    secondaryColor: '#FCD116',
    flagEmoji: '🇬🇭',
    coach: 'Otto Addo',
    nickname: 'Black Stars',
    starPlayers: [
      {
        name: 'Mohammed Kudus',
        position: 'Midfielder',
        club: 'West Ham United',
        number: 20,
        age: 24
      },
      {
        name: 'Thomas Partey',
        position: 'Midfielder',
        club: 'Arsenal',
        number: 5,
        age: 31
      },
      {
        name: 'Iñaki Williams',
        position: 'Forward',
        club: 'Athletic Bilbao',
        number: 9,
        age: 30
      },
      {
        name: 'Tariq Lamptey',
        position: 'Defender',
        club: 'Brighton & Hove Albion',
        number: 2,
        age: 24
      }
    ],
    historicalTimeline: [
      { 
        year: 1963, 
        event: 'Won their first Africa Cup of Nations title.',
        category: 'championship'
      },
      { 
        year: 1982, 
        event: 'Won their fourth Africa Cup of Nations title.',
        category: 'championship'
      },
      { 
        year: 2006, 
        event: 'First World Cup appearance, reaching the Round of 16.',
        category: 'first_appearance'
      },
      { 
        year: 2010, 
        event: 'Reached the World Cup Quarter-finals, their best result, becoming Africa\'s third team to do so.',
        category: 'notable_performance'
      },
      { 
        year: 2014, 
        event: 'Failed to progress past the group stage, marred by a dispute over prize money.',
        category: 'disappointment'
      }
    ],
    greatestMoments: [
      {
        title: 'Quarter-Final Heartbreak',
        description: 'Ghana reaches the World Cup Quarter-finals but loses a dramatic penalty shootout to Uruguay after Luis Suárez controversially handles a goal-bound shot in the final minute of extra time.',
        year: 2010,
        tournament: '2010 FIFA World Cup',
        video_search_query: 'Ghana vs Uruguay 2010 World Cup penalty shootout'
      },
      {
        title: 'Debut World Cup Knockouts',
        description: 'In their first World Cup, Ghana defeats the USA 2-1 in the Round of 16 with a dramatic extra-time goal from Asamoah Gyan.',
        year: 2006,
        tournament: '2006 FIFA World Cup',
        video_search_query: 'Ghana vs USA 2006 World Cup Round of 16'
      }
    ],
    fanCulture: {
      traditions: 'Ghanaian fans are highly expressive, often incorporating traditional drumming, dancing, and the vibrant colours of the national flag (red, yellow, green, black star).',
      famous_chant: 'Ghana! Ghana!',
      supporter_groups: 'Ghana National Supporters Union (GHANSU), Black Stars Fans Club',
      match_day_atmosphere: 'Loud, musical, and very passionate. The Black Stars are viewed as a symbol of national hope and African pride.'
    },
    funFacts: [
      'Ghana has won the Africa Cup of Nations four times, though the last victory was in 1982.',
      'Asamoah Gyan holds the record for the most World Cup goals scored by an African player (6).',
      'Ghana\'s 2010 Quarter-final run remains a defining moment for modern African football.'
    ]
  },
  {
    slug: 'ivory-coast',
    name: 'Ivory Coast',
    confederation: 'CAF',
    isProvisional: false,
    fifaRanking: 47,
    appearances: 3,
    bestFinish: 'Group Stage (2006, 2010, 2014)',
    primaryColor: '#FF8200',
    secondaryColor: '#009E60',
    flagEmoji: '🇨🇮',
    coach: 'Emerse Faé',
    nickname: 'The Elephants',
    starPlayers: [
      {
        name: 'Sébastien Haller',
        position: 'Forward',
        club: 'Borussia Dortmund',
        number: 22,
        age: 30
      },
      {
        name: 'Franck Kessié',
        position: 'Midfielder',
        club: 'Al-Ahli SFC',
        number: 7,
        age: 27
      },
      {
        name: 'Simon Adingra',
        position: 'Winger',
        club: 'Brighton & Hove Albion',
        number: 19,
        age: 22
      },
      {
        name: 'Evan Ndicka',
        position: 'Defender',
        club: 'AS Roma',
        number: 17,
        age: 25
      }
    ],
    historicalTimeline: [
      { 
        year: 1992, 
        event: 'Won their first Africa Cup of Nations title.',
        category: 'championship'
      },
      { 
        year: 2006, 
        event: 'First World Cup appearance, drawn into the \'Group of Death\' alongside Argentina and Netherlands.',
        category: 'first_appearance'
      },
      { 
        year: 2015, 
        event: 'Won their second Africa Cup of Nations title, defeating Ghana in the final.',
        category: 'championship'
      },
      { 
        year: 2024, 
        event: 'Won the Africa Cup of Nations title on home soil after a dramatic comeback run.',
        category: 'championship'
      },
      { 
        year: 2026, 
        event: 'Qualified for the World Cup, marking their return after missing the 2018 and 2022 editions.',
        category: 'notable_performance'
      }
    ],
    greatestMoments: [
      {
        title: 'AFCON 2024 Home Triumph',
        description: 'After a humiliating group stage and mid-tournament coaching change, The Elephants staged a dramatic comeback through the knockouts to defeat Nigeria 2-1 in the final on home soil.',
        year: 2024,
        tournament: '2023 Africa Cup of Nations',
        video_search_query: 'Ivory Coast AFCON 2024 final highlights'
      },
      {
        title: 'The Golden Generation\'s First AFCON',
        description: 'Led by Didier Drogba, the Ivory Coast finally lifts the AFCON trophy after a dramatic 9-8 penalty shootout victory against Ghana.',
        year: 2015,
        tournament: '2015 Africa Cup of Nations',
        video_search_query: 'Ivory Coast vs Ghana AFCON 2015 final penalties'
      }
    ],
    fanCulture: {
      traditions: 'Ivorian fans (\'Les Éléphants\') are known for their passionate support and distinctive orange, white, and green colors. Their chant of \'Allez Les Éléphants\' is widely known.',
      famous_chant: 'Allez Les Éléphants!',
      supporter_groups: 'Various local fan clubs focused on unity and national pride.',
      match_day_atmosphere: 'Loud, rhythmic, and fiercely nationalistic, reflecting a unified culture around the football team.'
    },
    funFacts: [
      'The 2024 AFCON win was the first time a host nation won the tournament since 2006.',
      'The \'Golden Generation\' of Didier Drogba, Yaya Touré, and Didier Zokora failed to progress past the group stage in three consecutive World Cups.',
      'The team\'s nickname, The Elephants, is a national symbol.'
    ]
  },
  {
    slug: 'morocco',
    name: 'Morocco',
    confederation: 'CAF',
    isProvisional: false,
    fifaRanking: 12,
    appearances: 6,
    bestFinish: 'Fourth Place (2022)',
    primaryColor: '#C1272D',
    secondaryColor: '#006233',
    flagEmoji: '🇲🇦',
    coach: 'Walid Regragui',
    nickname: 'The Atlas Lions',
    starPlayers: [
      {
        name: 'Achraf Hakimi',
        position: 'Defender',
        club: 'Paris Saint-Germain',
        number: 2,
        age: 25
      },
      {
        name: 'Yassine Bounou',
        position: 'Goalkeeper',
        club: 'Al-Hilal SFC',
        number: 1,
        age: 33
      },
      {
        name: 'Sofyan Amrabat',
        position: 'Midfielder',
        club: 'Manchester United',
        number: 4,
        age: 28
      },
      {
        name: 'Hakim Ziyech',
        position: 'Winger',
        club: 'Galatasaray',
        number: 7,
        age: 31
      }
    ],
    historicalTimeline: [
      {
        year: 1970,
        event: 'First World Cup appearance, becoming the second African team to play in the tournament.',
        category: 'first_appearance'
      },
      {
        year: 1976,
        event: 'Won their only Africa Cup of Nations title.',
        category: 'championship'
      },
      {
        year: 1986,
        event: 'Reached the World Cup Round of 16, becoming the first African nation to do so.',
        category: 'notable_performance'
      },
      {
        year: 2022,
        event: 'Reached the World Cup Semi-finals (Fourth Place), becoming the first African and Arab nation to do so.',
        category: 'notable_performance'
      }
    ],
    greatestMoments: [
      {
        title: 'World Cup Semi-Final Run',
        description: 'Morocco defeated Spain and Portugal in the knockout rounds, becoming the first African and Arab nation to reach the World Cup Semi-finals in a historic campaign.',
        year: 2022,
        tournament: '2022 FIFA World Cup',
        video_search_query: 'Morocco World Cup 2022 Quarter-final vs Portugal'
      },
      {
        title: 'First African Team in the Knockouts',
        description: 'Morocco defeats Portugal 3-1 in the group stage to advance to the Round of 16, a monumental first for African football.',
        year: 1986,
        tournament: '1986 FIFA World Cup',
        video_search_query: 'Morocco vs Portugal 1986 World Cup'
      }
    ],
    fanCulture: {
      traditions: 'Moroccan fan support is globally renowned for its passionate, relentless volume and choreographies. Fans are known for creating an intense, unified wall of sound and color, heavily featuring the green and red national flag.',
      famous_chant: 'Sir Al Atlas (Go Atlas Lions)!',
      supporter_groups: 'Various official and diaspora fan groups (especially in Europe)',
      match_day_atmosphere: 'One of the most intense and emotional in the world, reflecting the team\'s role as a source of pan-African and Arab pride.'
    },
    funFacts: [
      'Morocco reached their highest-ever FIFA ranking (10th) in 1998.',
      'Goalkeeper Yassine Bounou (\'Bono\') was one of the heroes of the 2022 World Cup run.',
      'Walid Regragui is the first African coach to lead an African team to the World Cup semi-finals.'
    ]
  },
  {
    slug: 'senegal',
    name: 'Senegal',
    confederation: 'CAF',
    isProvisional: false,
    fifaRanking: 19,
    appearances: 3,
    bestFinish: 'Quarter-finals (2002)',
    primaryColor: '#00853F',
    secondaryColor: '#FDEF42',
    flagEmoji: '🇸🇳',
    coach: 'Pape Thiaw',
    nickname: 'Lions of Teranga',
    starPlayers: [
      {
        name: 'Sadio Mané',
        position: 'Winger',
        club: 'Al-Nassr FC',
        number: 10,
        age: 32
      },
      {
        name: 'Kalidou Koulibaly',
        position: 'Defender/Captain',
        club: 'Al-Hilal SFC',
        number: 3,
        age: 33
      },
      {
        name: 'Nicolas Jackson',
        position: 'Forward',
        club: 'Chelsea',
        number: 15,
        age: 23
      },
      {
        name: 'Pape Matar Sarr',
        position: 'Midfielder',
        club: 'Tottenham Hotspur',
        number: 17,
        age: 22
      }
    ],
    historicalTimeline: [
      { 
        year: 2002, 
        event: 'First World Cup appearance, reaching the Quarter-finals.',
        category: 'first_appearance'
      },
      { 
        year: 2019, 
        event: 'Finished as runners-up in the Africa Cup of Nations.',
        category: 'notable_performance'
      },
      { 
        year: 2022, 
        event: 'Won their first Africa Cup of Nations title (AFCON 2021, played in 2022).',
        category: 'championship'
      },
      { 
        year: 2022, 
        event: 'Reached the World Cup Round of 16 for the second time.',
        category: 'notable_performance'
      }
    ],
    greatestMoments: [
      {
        title: 'Opening Match Upset',
        description: 'In their debut World Cup match, Senegal defeats reigning world champions France 1-0 in a massive upset, setting the tone for their historic run.',
        year: 2002,
        tournament: '2002 FIFA World Cup',
        video_search_query: 'Senegal vs France 2002 World Cup highlights'
      },
      {
        title: 'Reaching the Quarter-finals',
        description: 'Senegal defeats Sweden 2-1 in the Round of 16 with a golden goal, becoming only the second African nation to reach the World Cup Quarter-finals.',
        year: 2002,
        tournament: '2002 FIFA World Cup',
        video_search_query: 'Senegal vs Sweden 2002 World Cup golden goal'
      },
      {
        title: 'First AFCON Title',
        description: 'Senegal defeats Egypt in a penalty shootout to claim their first-ever Africa Cup of Nations title, ending years of near misses.',
        year: 2022,
        tournament: '2021 Africa Cup of Nations',
        video_search_query: 'Senegal vs Egypt AFCON 2021 final penalties'
      }
    ],
    fanCulture: {
      traditions: 'Senegalese fans (\'Lions of Teranga\') are famous for their vibrant color, relentless drumming, and positive, fair-play spirit, earning the nickname \'Teranga\', meaning hospitality.',
      famous_chant: 'Allez les Lions!',
      supporter_groups: 'The 12th Lion, various diaspora groups (especially in France)',
      match_day_atmosphere: 'Lively, colorful, and musically driven, with a focus on drumming and dancing. They are known for traveling well and bringing joy to the stands.'
    },
    funFacts: [
      'Senegal is the highest-ranked team in West Africa.',
      'In 2018, Senegal was eliminated from the World Cup by Japan based on the fair play rule (fewer yellow cards) after finishing equal on points, goal difference, and goals scored.',
      'Aliou Cissé, the 2002 captain, later coached the team to their first AFCON title.'
    ]
  },
  {
    slug: 'south-africa',
    name: 'South Africa',
    confederation: 'CAF',
    isProvisional: false,
    fifaRanking: 58,
    appearances: 4,
    bestFinish: 'Group Stage',
    primaryColor: '#007A4D',
    secondaryColor: '#FFB612',
    flagEmoji: '🇿🇦',
    coach: 'Hugo Broos',
    starPlayers: [
      { name: 'Percy Tau', position: 'Winger', club: 'Al Ahly', number: 10, age: 30 },
      { name: 'Ronwen Williams', position: 'Goalkeeper', club: 'Mamelodi Sundowns', number: 1, age: 32 },
      { name: 'Themba Zwane', position: 'Midfielder', club: 'Mamelodi Sundowns', number: 11, age: 35 }
    ]
  },
  {
    slug: 'tunisia',
    name: 'Tunisia',
    confederation: 'CAF',
    isProvisional: false,
    fifaRanking: 47,
    appearances: 6,
    bestFinish: 'Group Stage',
    primaryColor: '#E70013',
    secondaryColor: '#FFFFFF',
    flagEmoji: '🇹🇳',
    coach: 'Jalel Kadri',
    starPlayers: [
      { name: 'Youssef Msakni', position: 'Forward', club: 'Al-Arabi', number: 7, age: 34 },
      { name: 'Wahbi Khazri', position: 'Midfielder', club: 'Montpellier', number: 10, age: 33 },
      { name: 'Aïssa Laïdouni', position: 'Midfielder', club: 'Union Berlin', number: 14, age: 27 }
    ]
  },

  // OCEANIA (OFC) - 1 team
  {
    slug: 'new-zealand',
    name: 'New Zealand',
    confederation: 'OFC',
    isProvisional: false,
    fifaRanking: 95,
    appearances: 3,
    bestFinish: 'Group Stage',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    flagEmoji: '🇳🇿',
    coach: 'Darren Bazeley',
    starPlayers: [
      { name: 'Chris Wood', position: 'Forward', club: 'Nottingham Forest', number: 9, age: 33 },
      { name: 'Winston Reid', position: 'Defender', club: 'Brentford', number: 5, age: 36 },
      { name: 'Liberato Cacace', position: 'Defender', club: 'Empoli', number: 3, age: 24 }
    ]
  },

  // SOUTH AMERICA (CONMEBOL) - 6 teams
  {
    slug: 'argentina',
    name: 'Argentina',
    confederation: 'CONMEBOL',
    isProvisional: false,
    fifaRanking: 1,
    appearances: 18,
    bestFinish: 'Champions (1978, 1986, 2022)',
    primaryColor: '#75AADB',
    secondaryColor: '#FFFFFF',
    flagEmoji: '🇦🇷',
    coach: 'Lionel Scaloni',
    nickname: 'La Albiceleste',
    starPlayers: [
      {
        name: 'Lionel Messi',
        position: 'Forward',
        club: 'Inter Miami CF',
        number: 10,
        age: 37
      },
      {
        name: 'Emiliano Martínez',
        position: 'Goalkeeper',
        club: 'Aston Villa',
        number: 23,
        age: 32
      },
      {
        name: 'Enzo Fernández',
        position: 'Midfielder',
        club: 'Chelsea',
        number: 24,
        age: 23
      },
      {
        name: 'Julián Álvarez',
        position: 'Forward',
        club: 'Manchester City',
        number: 9,
        age: 24
      }
    ],
    historicalTimeline: [
      {
        year: 1930,
        event: 'Participated in the inaugural World Cup, finishing as Runners-up.',
        category: 'first_appearance'
      },
      {
        year: 1978,
        event: 'Won their first World Cup on home soil, led by Mario Kempes.',
        category: 'championship'
      },
      {
        year: 1986,
        event: 'Won their second World Cup, largely dominated by the brilliance of Diego Maradona.',
        category: 'championship'
      },
      {
        year: 1993,
        event: 'Won the Copa América, starting a 28-year wait for the next major trophy.',
        category: 'championship'
      },
      {
        year: 2021,
        event: 'Won the Copa América, Lionel Messi\'s first major international title with the senior squad.',
        category: 'championship'
      },
      {
        year: 2022,
        event: 'Won their third World Cup in Qatar, defeating France in the final.',
        category: 'championship'
      }
    ],
    greatestMoments: [
      {
        title: 'The Hand of God and Goal of the Century',
        description: 'Diego Maradona scores two iconic goals against England: the controversial \'Hand of God\' goal, immediately followed by a mesmerizing solo run past five defenders, later voted the \'Goal of the Century\'.',
        year: 1986,
        tournament: '1986 FIFA World Cup',
        video_search_query: 'Maradona Goal of the Century vs England'
      },
      {
        title: 'Copa América 2021 Breakthrough',
        description: 'Defeating eternal rivals Brazil 1-0 at the Maracanã Stadium to win the Copa América, finally delivering a senior title for Lionel Messi and ending the team\'s long trophy drought.',
        year: 2021,
        tournament: '2021 Copa América',
        video_search_query: 'Argentina vs Brazil Copa America 2021 Final'
      },
      {
        title: 'World Cup 2022 Final Victory',
        description: 'A stunning final against France culminating in a penalty shootout victory, cementing Lionel Messi\'s legacy and capturing the nation\'s third World Cup title.',
        year: 2022,
        tournament: '2022 FIFA World Cup',
        video_search_query: 'Argentina vs France World Cup 2022 Final highlights'
      }
    ],
    fanCulture: {
      traditions: 'Argentine fan culture is highly intense, passionate, and often political. Supporters often hold massive, coordinated Tifos and have a massive repertoire of unique chants (canticos) aimed at rivals, particularly Brazil and England. Matches are vibrant, loud, and can feel like a carnival.',
      famous_chant: 'Muchachos, Ahora Nos Volvimos a Ilusionar (adopted during the 2022 World Cup)',
      supporter_groups: 'La Doce (Boca Juniors - influence extends to national team), Hinchas Argentinos',
      match_day_atmosphere: 'Unmatched intensity and noise, with drumming and constant singing for 90 minutes. Fans are fully committed to their players, especially Messi, creating a wall of sound and color.'
    },
    funFacts: [
      'Argentina holds the record for the most Copa América titles, tied with Uruguay, at 15 titles.',
      'They were the first team outside of the host nation to reach a World Cup Final (1930).',
      'Argentina and France are the only teams to have won the World Cup, the Olympic Gold Medal, and the Confederations Cup.'
    ]
  },
  {
    slug: 'brazil',
    name: 'Brazil',
    confederation: 'CONMEBOL',
    isProvisional: false,
    fifaRanking: 5,
    appearances: 22,
    bestFinish: 'Champions (5x)',
    primaryColor: '#009C3B',
    secondaryColor: '#FFDF00',
    flagEmoji: '🇧🇷',
    coach: 'Dorival Júnior',
    nickname: 'Seleção',
    starPlayers: [
      {
        name: 'Vinícius Júnior',
        position: 'Winger',
        club: 'Real Madrid',
        number: 7,
        age: 24
      },
      {
        name: 'Rodrygo',
        position: 'Forward',
        club: 'Real Madrid',
        number: 10,
        age: 23
      },
      {
        name: 'Marquinhos',
        position: 'Defender',
        club: 'Paris Saint-Germain',
        number: 4,
        age: 30
      },
      {
        name: 'Bruno Guimarães',
        position: 'Midfielder',
        club: 'Newcastle United',
        number: 5,
        age: 26
      }
    ],
    historicalTimeline: [
      {
        year: 1930,
        event: 'Participated in the inaugural FIFA World Cup.',
        category: 'first_appearance'
      },
      {
        year: 1950,
        event: 'Suffered the \'Maracanaço\' defeat in the World Cup final on home soil to Uruguay.',
        category: 'disappointment'
      },
      {
        year: 1958,
        event: 'Won their first World Cup title in Sweden, introducing the world to Pelé.',
        category: 'championship'
      },
      {
        year: 1970,
        event: 'Won their third World Cup, with the squad widely considered the greatest in history.',
        category: 'championship'
      },
      {
        year: 2002,
        event: 'Won their fifth and most recent World Cup title, led by Ronaldo, Rivaldo, and Ronaldinho.',
        category: 'championship'
      },
      {
        year: 2014,
        event: 'Suffered a historic 7-1 defeat to Germany in the World Cup semi-final on home soil (\'Mineirazo\').',
        category: 'disappointment'
      }
    ],
    greatestMoments: [
      {
        title: 'The 1970 Final Masterpiece',
        description: 'Brazil defeats Italy 4-1 in the World Cup final, with Carlos Alberto scoring one of the most famous team goals ever, securing the Jules Rimet Trophy permanently.',
        year: 1970,
        tournament: '1970 FIFA World Cup',
        video_search_query: 'Brazil vs Italy 1970 World Cup Final'
      },
      {
        title: 'Ronaldo\'s Redemption',
        description: 'Four years after an infamous seizure before the 1998 final, Ronaldo scores both goals in the 2-0 final victory over Germany, claiming Brazil\'s fifth star.',
        year: 2002,
        tournament: '2002 FIFA World Cup',
        video_search_query: 'Ronaldo goals vs Germany 2002 World Cup Final'
      },
      {
        title: 'Pelé\'s Debut World Cup',
        description: 'A 17-year-old Pelé scores a hat-trick in the semi-final and two goals in the final against Sweden, announcing himself as a global superstar and winning Brazil\'s first title.',
        year: 1958,
        tournament: '1958 FIFA World Cup',
        video_search_query: 'Pele 1958 World Cup highlights'
      }
    ],
    fanCulture: {
      traditions: 'Brazilian fan culture is synonymous with \'Samba football\'—a joyous, musical, and fluid style of support. Fans are known for bringing samba drums (bateria), elaborate flags, and dancing (torcida organizada) to the stands, celebrating with passion and flair.',
      famous_chant: 'Eu Sou Brasileiro, Com Muito Orgulho, Com Muito Amor (I am Brazilian, with much pride, with much love)',
      supporter_groups: 'Torcida Jovem, Gaviões da Fiel (often follow the national team in groups)',
      match_day_atmosphere: 'Vibrant, loud, and colorful. The stadium atmosphere is festive, reflecting the Brazilian spirit, often a stark contrast to the highly intense nature of the match itself.'
    },
    funFacts: [
      'Brazil is the only nation to have participated in every single FIFA World Cup since 1930.',
      'Brazil holds the record for the most World Cup titles (5).',
      'The team wore white until the 1950 World Cup loss, after which the now-famous yellow jersey (A Seleção) was adopted to inspire a new era.'
    ]
  },
  {
    slug: 'colombia',
    name: 'Colombia',
    confederation: 'CONMEBOL',
    isProvisional: false,
    fifaRanking: 12,
    appearances: 6,
    bestFinish: 'Quarter-finals (2014)',
    primaryColor: '#FCD116',
    secondaryColor: '#003893',
    flagEmoji: '🇨🇴',
    coach: 'Néstor Lorenzo',
    nickname: 'Los Cafeteros',
    starPlayers: [
      {
        name: 'Luis Díaz',
        position: 'Winger',
        club: 'Liverpool',
        number: 10,
        age: 27
      },
      {
        name: 'James Rodríguez',
        position: 'Midfielder',
        club: 'Rayo Vallecano',
        number: 10,
        age: 33
      },
      {
        name: 'Jhon Durán',
        position: 'Forward',
        club: 'Aston Villa',
        number: 17,
        age: 20
      },
      {
        name: 'Davinson Sánchez',
        position: 'Defender',
        club: 'Galatasaray',
        number: 23,
        age: 28
      }
    ],
    historicalTimeline: [
      {
        year: 1962,
        event: 'First participation in the FIFA World Cup, held in Chile.',
        category: 'first_appearance'
      },
      {
        year: 1990,
        event: 'Qualified for the World Cup after a 28-year absence, reaching the Round of 16.',
        category: 'notable_performance'
      },
      {
        year: 1993,
        event: 'Infamous 5-0 victory over Argentina in Buenos Aires during World Cup Qualification.',
        category: 'notable_performance'
      },
      {
        year: 2001,
        event: 'Won the Copa América for the first time on home soil.',
        category: 'championship'
      },
      {
        year: 2014,
        event: 'Reached the World Cup Quarter-finals, their best-ever result, with James Rodríguez winning the Golden Boot.',
        category: 'notable_performance'
      }
    ],
    greatestMoments: [
      {
        title: 'The Golden Generation\'s 5-0 Triumph',
        description: 'Colombia thrashes Argentina 5-0 in a crucial qualifier, a result that sent shockwaves through the football world and propelled them to the 1994 World Cup.',
        year: 1993,
        tournament: '1994 FIFA World Cup Qualification',
        video_search_query: 'Colombia 5-0 Argentina 1993'
      },
      {
        title: 'Copa América 2001 Champions',
        description: 'Undefeated and unscored upon throughout the tournament, Colombia defeated Mexico 1-0 in the final in Bogotá to lift their first major international trophy.',
        year: 2001,
        tournament: '2001 Copa América',
        video_search_query: 'Colombia vs Mexico Copa America 2001 Final'
      },
      {
        title: 'James\' Goal of the Tournament',
        description: 'James Rodríguez scores a stunning chest-and-volley goal against Uruguay in the Round of 16, later voted the Goal of the Tournament.',
        year: 2014,
        tournament: '2014 FIFA World Cup',
        video_search_query: 'James Rodriguez goal vs Uruguay 2014 World Cup'
      }
    ],
    fanCulture: {
      traditions: 'Colombian fans, \'Los Cafeteros,\' are known for their vibrant yellow jerseys and loud, synchronized chanting, especially the famous \'Si, se puede\' (Yes, we can) cheer. The atmosphere is generally colorful and celebratory.',
      famous_chant: 'Ole Ole Ole, Colombia, Colombia!',
      supporter_groups: 'La Barra del Centenario, El Frente Colombiano',
      match_day_atmosphere: 'Electric and passionate, characterized by vuvuzelas, drums, and a sea of yellow, blue, and red. Colombia\'s high-energy style of play is often mirrored by the non-stop intensity of their support.'
    },
    funFacts: [
      'Carlos Valderrama, \'El Pibe\', remains one of the most recognizable Colombian footballers due to his iconic hairstyle.',
      'The 1993-1994 team, known as the \'Golden Generation\', was famously hailed by Pelé as a favorite for the 1994 World Cup.',
      'Colombia\'s 2001 Copa América win was the first time a major tournament was held without incident in the country after years of conflict.'
    ]
  },
  {
    slug: 'ecuador',
    name: 'Ecuador',
    confederation: 'CONMEBOL',
    isProvisional: false,
    fifaRanking: 30,
    appearances: 4,
    bestFinish: 'Round of 16 (2006)',
    primaryColor: '#FFDD00',
    secondaryColor: '#034EA2',
    flagEmoji: '🇪🇨',
    coach: 'Sebastián Beccacece',
    nickname: 'La Tri',
    starPlayers: [
      {
        name: 'Moisés Caicedo',
        position: 'Midfielder',
        club: 'Chelsea',
        number: 23,
        age: 22
      },
      {
        name: 'Pervis Estupiñán',
        position: 'Defender',
        club: 'AC Milan',
        number: 7,
        age: 26
      },
      {
        name: 'Enner Valencia',
        position: 'Forward',
        club: 'Internacional',
        number: 13,
        age: 35
      },
      {
        name: 'Piero Hincapié',
        position: 'Defender',
        club: 'Bayer Leverkusen',
        number: 3,
        age: 22
      }
    ],
    historicalTimeline: [
      {
        year: 1993,
        event: 'Achieved their best Copa América finish, placing fourth as tournament hosts.',
        category: 'notable_performance'
      },
      {
        year: 2002,
        event: 'Qualified for the FIFA World Cup for the first time.',
        category: 'first_appearance'
      },
      {
        year: 2006,
        event: 'Reached the World Cup Round of 16, their best-ever performance, losing to England.',
        category: 'notable_performance'
      },
      {
        year: 2020,
        event: 'A new generation of players (Moisés Caicedo, Pervis Estupiñán) emerges from the Independiente del Valle academy.',
        category: 'notable_performance'
      },
      {
        year: 2022,
        event: 'Competed in the World Cup, defeating host nation Qatar in the opening match.',
        category: 'notable_performance'
      }
    ],
    greatestMoments: [
      {
        title: 'Debut World Cup Qualification',
        description: 'After decades of near misses, Ecuador finally secures a historic first World Cup berth in 2002, marking the beginning of their consistent presence on the global stage.',
        year: 2001,
        tournament: '2002 FIFA World Cup Qualification',
        video_search_query: 'Ecuador qualifies for 2002 World Cup'
      },
      {
        title: 'Advancing to the Round of 16',
        description: 'Ecuador achieved their best World Cup performance by defeating Poland and Costa Rica to qualify for the knockout stage in Germany.',
        year: 2006,
        tournament: '2006 FIFA World Cup',
        video_search_query: 'Ecuador vs Costa Rica 2006 World Cup highlights'
      },
      {
        title: 'Opening Match Victory',
        description: 'Enner Valencia scores twice against host nation Qatar, giving Ecuador a commanding 2-0 victory in the opening match of the 2022 World Cup.',
        year: 2022,
        tournament: '2022 FIFA World Cup',
        video_search_query: 'Ecuador vs Qatar 2022 World Cup highlights'
      }
    ],
    fanCulture: {
      traditions: 'Ecuadorian fans are known for their lively and warm support. They are often called \'La Marea Amarilla\' (The Yellow Tide), referring to the sheer volume of yellow jerseys visible in the stands. Support is deeply nationalistic.',
      famous_chant: 'Sí se puede (Yes, we can)!',
      supporter_groups: 'La Marea Amarilla (general fan movement)',
      match_day_atmosphere: 'Festive and enthusiastic, characterized by continuous singing and the traditional colors of the flag. Their spirit is one of optimism, especially with the current generation of young players.'
    },
    funFacts: [
      'Ecuador\'s qualification for the 2002 World Cup was often attributed to their reliance on home matches in the high altitude of Quito.',
      'Independiente del Valle, a club with a strong youth academy, has produced much of Ecuador\'s current golden generation, including Moisés Caicedo.',
      'Captain Enner Valencia is the team\'s all-time leading scorer.'
    ]
  },
  {
    slug: 'paraguay',
    name: 'Paraguay',
    confederation: 'CONMEBOL',
    isProvisional: false,
    fifaRanking: 43,
    appearances: 8,
    bestFinish: 'Quarter-finals (2010)',
    primaryColor: '#D52B1E',
    secondaryColor: '#0038A8',
    flagEmoji: '🇵🇾',
    coach: 'Gustavo Alfaro',
    nickname: 'La Albirroja',
    starPlayers: [
      {
        name: 'Miguel Almirón',
        position: 'Winger',
        club: 'Newcastle United',
        number: 23,
        age: 30
      },
      {
        name: 'Gustavo Gómez',
        position: 'Defender',
        club: 'Palmeiras',
        number: 15,
        age: 31
      },
      {
        name: 'Julio Enciso',
        position: 'Forward',
        club: 'Brighton & Hove Albion',
        number: 19,
        age: 20
      },
      {
        name: 'Richard Sánchez',
        position: 'Midfielder',
        club: 'Club América',
        number: 8,
        age: 28
      }
    ],
    historicalTimeline: [
      {
        year: 1930,
        event: 'Participated in the inaugural FIFA World Cup in Uruguay.',
        category: 'first_appearance'
      },
      {
        year: 1953,
        event: 'Won their first Copa América title, defeating Brazil in the final playoff match.',
        category: 'championship'
      },
      {
        year: 1979,
        event: 'Won their second Copa América title, defeating Chile in the final.',
        category: 'championship'
      },
      {
        year: 1998,
        event: 'Returned to the World Cup after a 12-year absence and reached the Round of 16.',
        category: 'notable_performance'
      },
      {
        year: 2010,
        event: 'Reached the World Cup Quarter-finals, their best-ever finish, narrowly losing to Spain.',
        category: 'notable_performance'
      }
    ],
    greatestMoments: [
      {
        title: 'Goalkeeper José Luis Chilavert\'s Legacy',
        description: 'During the 1990s and early 2000s, the legendary goal-scoring goalkeeper and captain, José Luis Chilavert, inspired the team to a major defensive transformation and multiple World Cup qualifications.',
        year: 1998,
        tournament: '1998 FIFA World Cup',
        video_search_query: 'Jose Luis Chilavert World Cup highlights'
      },
      {
        title: 'Quarter-final Run in South Africa',
        description: 'Paraguay achieved their best-ever World Cup run, advancing past the Round of 16 for the first time before losing 1-0 to eventual champions Spain in the Quarter-finals.',
        year: 2010,
        tournament: '2010 FIFA World Cup',
        video_search_query: 'Paraguay vs Spain 2010 World Cup Quarter-final'
      },
      {
        title: 'Copa América 1979 Triumph',
        description: 'Paraguay defeats both Brazil and Chile to win their second continental title in a format where no fixed venue was used, traveling across South America.',
        year: 1979,
        tournament: '1979 Copa América',
        video_search_query: 'Paraguay Copa America 1979 final'
      }
    ],
    fanCulture: {
      traditions: 'Paraguayan fans are highly committed and spirited, known for their powerful chants and the unwavering support of \'La Albirroja\' (The White and Red). Their passion is rooted in the country\'s tough, resilient national identity.',
      famous_chant: 'Vamos Albirroja, vamos a ganar!',
      supporter_groups: 'La Barra de la Albirroja',
      match_day_atmosphere: 'Determined and loud, with fans showing massive passion and dedication despite being one of the smaller nations in CONMEBOL. Red and white are the dominant colors, often with traditional hats.'
    },
    funFacts: [
      'Paraguay is the only landlocked country in CONMEBOL to have qualified for the World Cup.',
      'The 2010 Quarter-final run ended with a penalty missed by Óscar Cardozo against Spain\'s Iker Casillas, a moment often replayed in Paraguayan football.',
      'The country has a long tradition of producing tough, high-quality defenders and goalkeepers.'
    ]
  },
  {
    slug: 'uruguay',
    name: 'Uruguay',
    confederation: 'CONMEBOL',
    isProvisional: false,
    fifaRanking: 11,
    appearances: 14,
    bestFinish: 'Champions (1930, 1950)',
    primaryColor: '#0038A8',
    secondaryColor: '#FFFFFF',
    flagEmoji: '🇺🇾',
    coach: 'Marcelo Bielsa',
    nickname: 'La Celeste',
    starPlayers: [
      {
        name: 'Federico Valverde',
        position: 'Midfielder',
        club: 'Real Madrid',
        number: 15,
        age: 26
      },
      {
        name: 'Ronald Araújo',
        position: 'Defender',
        club: 'FC Barcelona',
        number: 4,
        age: 25
      },
      {
        name: 'Darwin Núñez',
        position: 'Forward',
        club: 'Liverpool',
        number: 19,
        age: 25
      },
      {
        name: 'Luis Suárez',
        position: 'Forward',
        club: 'Inter Miami CF',
        number: 9,
        age: 37
      }
    ],
    historicalTimeline: [
      {
        year: 1924,
        event: 'Won Olympic Gold at the Paris Games, establishing themselves as a global power.',
        category: 'championship'
      },
      {
        year: 1930,
        event: 'Hosts and wins the inaugural FIFA World Cup in Montevideo.',
        category: 'championship'
      },
      {
        year: 1950,
        event: 'Achieved the \'Maracanazo\', defeating hosts Brazil in the World Cup final match.',
        category: 'championship'
      },
      {
        year: 1987,
        event: 'Won the Copa América in Argentina, demonstrating success in modern tournament format.',
        category: 'championship'
      },
      {
        year: 2010,
        event: 'Reached the World Cup semi-finals for the first time in 40 years, finishing fourth.',
        category: 'notable_performance'
      },
      {
        year: 2011,
        event: 'Won a record-extending 15th Copa América title in Argentina.',
        category: 'championship'
      }
    ],
    greatestMoments: [
      {
        title: 'The Maracanazo',
        description: 'Against all odds, Uruguay defeats host nation Brazil 2-1 in the final decisive match of the 1950 World Cup at the Maracanã, a match that remains legendary in football lore.',
        year: 1950,
        tournament: '1950 FIFA World Cup',
        video_search_query: 'Uruguay vs Brazil 1950 Maracanazo'
      },
      {
        title: 'A Hand Saves a Nation',
        description: 'During the 2010 Quarter-finals, Luis Suárez deliberately hand-balls a goal-bound shot against Ghana. He is sent off, but Ghana misses the resulting penalty, and Uruguay wins the shootout.',
        year: 2010,
        tournament: '2010 FIFA World Cup',
        video_search_query: 'Luis Suarez handball vs Ghana 2010'
      },
      {
        title: 'Copa América 2011 Victory',
        description: 'Led by Diego Forlán and Luis Suárez, Uruguay defeats Paraguay 3-0 in the final to lift a record 15th Copa América trophy.',
        year: 2011,
        tournament: '2011 Copa América',
        video_search_query: 'Uruguay vs Paraguay Copa America 2011 Final'
      }
    ],
    fanCulture: {
      traditions: 'Uruguayan fan culture, though smaller in number, is fierce and proud, reflecting the country\'s huge footballing legacy (the \'Garra Charrúa\' or \'Charrúa Claw\' spirit). They use \'bombos\' (large drums) and fireworks to create an intense atmosphere.',
      famous_chant: 'Soy Celeste',
      supporter_groups: 'La Banda del Parque, La Gloriosa',
      match_day_atmosphere: 'Intense and highly competitive, fueled by national pride due to their overperformance for a small country. The energy is a mixture of passion and historical reverence.'
    },
    funFacts: [
      'Uruguay is the smallest country (by population) ever to win the FIFA World Cup.',
      'They are two-time World Champions (1930, 1950) and two-time Olympic Champions (1924, 1928), and consider the latter equal to World Cups.',
      'The Estadio Centenario, built for the 1930 World Cup, is a National Historic Monument of Football.'
    ]
  },

  // EUROPE (UEFA) - 1 qualified + 12 provisional
  {
    slug: 'england',
    name: 'England',
    confederation: 'UEFA',
    isProvisional: false,
    fifaRanking: 4,
    appearances: 16,
    bestFinish: 'Champions (1966)',
    primaryColor: '#FFFFFF',
    secondaryColor: '#C8102E',
    flagEmoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    coach: 'Thomas Tuchel',
    nickname: 'The Three Lions',
    starPlayers: [
      {
        name: 'Harry Kane',
        position: 'Forward',
        club: 'Bayern Munich',
        number: 9,
        age: 31
      },
      {
        name: 'Jude Bellingham',
        position: 'Midfielder',
        club: 'Real Madrid',
        number: 10,
        age: 21
      },
      {
        name: 'Phil Foden',
        position: 'Winger',
        club: 'Manchester City',
        number: 11,
        age: 24
      },
      {
        name: 'Declan Rice',
        position: 'Midfielder',
        club: 'Arsenal',
        number: 4,
        age: 25
      }
    ],
    historicalTimeline: [
      {
        year: 1872,
        event: 'Played the first official international football match against Scotland.',
        category: 'first_appearance'
      },
      {
        year: 1950,
        event: 'Participated in the World Cup for the first time, famously losing 1-0 to the USA.',
        category: 'disappointment'
      },
      {
        year: 1966,
        event: 'Won their only World Cup, defeating West Germany 4-2 in the final at Wembley.',
        category: 'championship'
      },
      {
        year: 1990,
        event: 'Reached the World Cup Semi-finals under Bobby Robson, losing on penalties to West Germany.',
        category: 'notable_performance'
      },
      {
        year: 2018,
        event: 'Reached the World Cup Semi-finals again, fostering a sense of national optimism.',
        category: 'notable_performance'
      },
      {
        year: 2024,
        event: 'Finished as Runners-up at the UEFA European Championship, losing the final to Spain.',
        category: 'notable_performance'
      }
    ],
    greatestMoments: [
      {
        title: 'The \'They Think It\'s All Over\' Final',
        description: 'Sir Geoff Hurst scores the only World Cup final hat-trick to date as England secures a dramatic 4-2 extra-time victory over West Germany to win the trophy on home soil.',
        year: 1966,
        tournament: '1966 FIFA World Cup',
        video_search_query: 'England vs West Germany 1966 final highlights'
      },
      {
        title: 'Gazza\'s Tears at Italia \'90',
        description: 'Paul Gascoigne\'s emotional reaction to a booking that would have ruled him out of the final defined a pivotal moment when the nation re-engaged with the team.',
        year: 1990,
        tournament: '1990 FIFA World Cup',
        video_search_query: 'Paul Gascoigne tears 1990 World Cup semi-final'
      },
      {
        title: 'Michael Owen\'s Solo Run',
        description: 'An 18-year-old Michael Owen scores a stunning solo goal against Argentina in the Round of 16, instantly establishing himself as a national star.',
        year: 1998,
        tournament: '1998 FIFA World Cup',
        video_search_query: 'Michael Owen goal vs Argentina 1998 World Cup'
      }
    ],
    fanCulture: {
      traditions: 'English fan culture is deeply rooted in club loyalty but unites passionately for the national team. Traditions include singing the national anthem loudly, waving \'St. George\'s Cross\' flags, and often wearing replica shirts. The term \'Three Lions\' is central to the identity.',
      famous_chant: 'Three Lions (Football\'s Coming Home)',
      supporter_groups: 'The Football Supporters\' Association (FSA), various official and unofficial \'Barmy Army\' style groups.',
      match_day_atmosphere: 'Loud, patriotic, and often high-anxiety, especially in knockout matches. The atmosphere has modernized to be more family-friendly at Wembley, but remains raucous when travelling abroad.'
    },
    funFacts: [
      'The 1966 final victory remains England\'s only win in a major international tournament.',
      'England and Scotland played the first official international football match in 1872.',
      'Harry Kane holds the record as England\'s all-time top scorer with 76 goals.'
    ]
  },

  // PROVISIONAL EUROPEAN TEAMS
  {
    slug: 'austria',
    name: 'Austria',
    confederation: 'UEFA',
    isProvisional: true,
    fifaRanking: 24,
    appearances: 7,
    bestFinish: 'Third Place (1954)',
    primaryColor: '#ED2939',
    secondaryColor: '#FFFFFF',
    flagEmoji: '🇦🇹',
    coach: 'Ralf Rangnick',
    nickname: 'Das Team',
    starPlayers: [
      {
        name: 'David Alaba',
        position: 'Defender',
        club: 'Real Madrid',
        number: 8,
        age: 32
      },
      {
        name: 'Marcel Sabitzer',
        position: 'Midfielder',
        club: 'Borussia Dortmund',
        number: 9,
        age: 30
      },
      {
        name: 'Christoph Baumgartner',
        position: 'Midfielder',
        club: 'RB Leipzig',
        number: 19,
        age: 25
      }
    ],
    historicalTimeline: [
      { 
        year: 1934, 
        event: 'First World Cup appearance, reaching the semi-finals.',
        category: 'first_appearance'
      },
      { 
        year: 1954, 
        event: 'Finished third at the World Cup in Switzerland, their best-ever major tournament finish.',
        category: 'notable_performance'
      },
      { 
        year: 1978, 
        event: 'Defeats West Germany 3-2 in the \'Miracle of Córdoba\', although already eliminated.',
        category: 'notable_performance'
      },
      { 
        year: 1982, 
        event: 'Infamous \'Disgrace of Gijón\' match against West Germany, which resulted in both teams advancing.',
        category: 'disappointment'
      },
      { 
        year: 2024, 
        event: 'Reached the Round of 16 at Euro 2024, demonstrating a resurgence under Ralf Rangnick.',
        category: 'notable_performance'
      }
    ],
    greatestMoments: [
      {
        title: 'The Miracle of Córdoba',
        description: 'Austria defeats West Germany 3-2 in a dramatic match, knocking the defending champions out of the World Cup and sparking massive celebrations back home.',
        year: 1978,
        tournament: '1978 FIFA World Cup',
        video_search_query: 'Austria vs West Germany 1978 Miracle of Córdoba'
      },
      {
        title: 'World Cup Bronze',
        description: 'After a high-scoring semi-final loss, Austria secures third place at the World Cup, a historic achievement for the nation.',
        year: 1954,
        tournament: '1954 FIFA World Cup',
        video_search_query: 'Austria vs Uruguay 1954 World Cup'
      },
      {
        title: 'Qualifying for Euro 2024',
        description: 'A strong qualification campaign ensures Austria\'s spot at the European Championship, showcasing the new generation\'s potential under Ralf Rangnick.',
        year: 2023,
        tournament: 'UEFA Euro 2024 Qualification',
        video_search_query: 'Austria qualifies for Euro 2024'
      }
    ],
    fanCulture: {
      traditions: 'Austrian fans are known for their strong national pride, often uniting under the banner of \'Das Team\'. They create an enthusiastic, friendly atmosphere, which blends modern football culture with Alpine tradition.',
      famous_chant: 'Immer wieder, immer wieder, immer wieder Österreich! (Again and again, always Austria!)',
      supporter_groups: 'Österreichische Nationalteam-Fanclub',
      match_day_atmosphere: 'Supportive and often light-hearted, contrasting the intensity of their neighbor Germany. There\'s a growing sense of excitement for the current squad\'s potential.'
    },
    funFacts: [
      'The 1930s Austrian national team, known as the \'Wunderteam,\' was one of the most celebrated sides of its time.',
      'Their World Cup absence between 1998 and 2022 marked a long period of decline for the national team.',
      'Many top Austrian players, including Alaba and Sabitzer, play for major German clubs.'
    ]
  },
  {
    slug: 'belgium',
    name: 'Belgium',
    confederation: 'UEFA',
    isProvisional: true,
    fifaRanking: 6,
    appearances: 14,
    bestFinish: 'Third Place (2018)',
    primaryColor: '#ED2939',
    secondaryColor: '#000000',
    flagEmoji: '🇧🇪',
    coach: 'Domenico Tedesco',
    nickname: 'Red Devils',
    starPlayers: [
      {
        name: 'Kevin De Bruyne',
        position: 'Midfielder',
        club: 'Manchester City',
        number: 7,
        age: 33
      },
      {
        name: 'Romelu Lukaku',
        position: 'Forward',
        club: 'Napoli',
        number: 9,
        age: 31
      },
      {
        name: 'Jérémy Doku',
        position: 'Winger',
        club: 'Manchester City',
        number: 11,
        age: 22
      },
      {
        name: 'Leandro Trossard',
        position: 'Winger',
        club: 'Arsenal',
        number: 17,
        age: 29
      }
    ],
    historicalTimeline: [
      { 
        year: 1920, 
        event: 'Won Olympic Gold at the Antwerp Games.',
        category: 'championship'
      },
      { 
        year: 1930, 
        event: 'Participated in the inaugural FIFA World Cup.',
        category: 'first_appearance'
      },
      { 
        year: 1980, 
        event: 'Finished as runners-up at the UEFA European Championship.',
        category: 'notable_performance'
      },
      { 
        year: 1986, 
        event: 'Reached the World Cup semi-finals, losing to eventual champions Argentina, finishing fourth.',
        category: 'notable_performance'
      },
      { 
        year: 2018, 
        event: 'Finished third at the World Cup, achieving the \'Golden Generation\'s\' best-ever result.',
        category: 'notable_performance'
      }
    ],
    greatestMoments: [
      {
        title: 'World Cup Bronze in Russia',
        description: 'Belgium defeats England 2-0 in the third-place play-off to secure the bronze medal, confirming the quality of their \'Golden Generation\' squad.',
        year: 2018,
        tournament: '2018 FIFA World Cup',
        video_search_query: 'Belgium vs England 2018 World Cup 3rd place'
      },
      {
        title: 'The Road to Mexico \'86 Semi-final',
        description: 'After a dramatic extra-time win against the Soviet Union, Belgium defeats Spain in a penalty shootout to reach the World Cup semi-finals for the first time.',
        year: 1986,
        tournament: '1986 FIFA World Cup',
        video_search_query: 'Belgium vs Spain 1986 penalty shootout'
      },
      {
        title: 'Euro 2000 Opening Win',
        description: 'Co-hosting Euro 2000, Belgium wins the opening match against Sweden 2-1, marking a major highlight for the home fans.',
        year: 2000,
        tournament: 'UEFA Euro 2000',
        video_search_query: 'Belgium vs Sweden Euro 2000 highlights'
      }
    ],
    fanCulture: {
      traditions: 'Belgian fan culture is united despite the country\'s linguistic divisions (Flemish, French, German). Fans are friendly and heavily feature the national colors (red, yellow, black) and the devil mascot in their support.',
      famous_chant: 'Alle, Alle, Alle (Come on, Come on, Come on)',
      supporter_groups: '1895 Official Belgian Fan Club',
      match_day_atmosphere: 'Passionate and focused on supporting \'The Golden Generation\'. Matches have a high-energy environment, especially when the team performs well, reflecting national unity.'
    },
    funFacts: [
      'Belgium\'s \'Golden Generation\' of the 2010s and 2020s has spent significant time ranked in the top 5 of the FIFA World Rankings.',
      'Belgium, along with France and the Netherlands, has co-hosted a major tournament (Euro 2000).',
      'Belgium\'s best World Cup finish (Third Place) was achieved in 2018.'
    ]
  },
  {
    slug: 'croatia',
    name: 'Croatia',
    confederation: 'UEFA',
    isProvisional: true,
    fifaRanking: 11,
    appearances: 6,
    bestFinish: 'Runners-up (2018)',
    primaryColor: '#FF0000',
    secondaryColor: '#FFFFFF',
    flagEmoji: '🇭🇷',
    coach: 'Zlatko Dalić',
    nickname: 'Vatreni',
    starPlayers: [
      {
        name: 'Luka Modrić',
        position: 'Midfielder',
        club: 'Real Madrid',
        number: 10,
        age: 39
      },
      {
        name: 'Joško Gvardiol',
        position: 'Defender',
        club: 'Manchester City',
        number: 20,
        age: 22
      },
      {
        name: 'Mateo Kovačić',
        position: 'Midfielder',
        club: 'Manchester City',
        number: 8,
        age: 30
      },
      {
        name: 'Andrej Kramarić',
        position: 'Forward',
        club: '1899 Hoffenheim',
        number: 9,
        age: 33
      }
    ],
    historicalTimeline: [
      { 
        year: 1998, 
        event: 'First World Cup appearance as an independent nation, finishing third.',
        category: 'first_appearance'
      },
      { 
        year: 2008, 
        event: 'Reached the Euro Quarter-finals, losing to Turkey on penalties.',
        category: 'notable_performance'
      },
      { 
        year: 2018, 
        event: 'Reached the World Cup final in Russia, losing to France, their best-ever result.',
        category: 'notable_performance'
      },
      { 
        year: 2022, 
        event: 'Finished third at the World Cup, defeating Morocco in the third-place play-off.',
        category: 'notable_performance'
      },
      { 
        year: 2023, 
        event: 'Finished as runners-up in the UEFA Nations League, losing the final to Spain.',
        category: 'notable_performance'
      }
    ],
    greatestMoments: [
      {
        title: 'First World Cup Bronze',
        description: 'In their debut World Cup, Croatia defeats the Netherlands 2-1 to secure a third-place finish, signaling their emergence as a football power.',
        year: 1998,
        tournament: '1998 FIFA World Cup',
        video_search_query: 'Croatia vs Netherlands 1998 3rd place'
      },
      {
        title: 'Reaching the World Cup Final',
        description: 'Croatia defeats England 2-1 in extra time in the semi-finals to reach their first-ever World Cup final, overcoming three consecutive knockout round extra-time battles.',
        year: 2018,
        tournament: '2018 FIFA World Cup',
        video_search_query: 'Croatia vs England 2018 semi-final highlights'
      },
      {
        title: 'World Cup Silver',
        description: 'Croatia secures the World Cup silver medal, a remarkable achievement for a nation of only 4 million people.',
        year: 2018,
        tournament: '2018 FIFA World Cup',
        video_search_query: 'Croatia World Cup 2018 final ceremony'
      }
    ],
    fanCulture: {
      traditions: 'Croatian fans, known as the \'Vatreni\' (The Fiery Ones), are famous for their passionate, constant chanting and the iconic red and white checkerboard pattern (šahovnica) seen everywhere, from jerseys to flags and face paint.',
      famous_chant: 'Bojna Čavoglave (often played at matches)',
      supporter_groups: 'Torcida (influence from Hajduk Split), Bad Blue Boys (influence from Dinamo Zagreb)',
      match_day_atmosphere: 'Intense, loud, and extremely patriotic. Support often comes from a cohesive, vocal group that travels well and turns any stadium into a home match.'
    },
    funFacts: [
      'Davor Šuker was the Golden Boot winner in the 1998 World Cup.',
      'Croatia is the only national team outside of the traditional footballing powers to reach a World Cup final since 1998.',
      'The checkerboard pattern on the jersey is based on the coat of arms of Croatia.'
    ]
  },
  {
    slug: 'denmark',
    name: 'Denmark',
    confederation: 'UEFA',
    isProvisional: true,
    fifaRanking: 20,
    appearances: 6,
    bestFinish: 'Quarter-finals (1998)',
    primaryColor: '#C8102E',
    secondaryColor: '#FFFFFF',
    flagEmoji: '🇩🇰',
    coach: 'Kasper Hjulmand',
    nickname: 'De Rød-Hvide',
    starPlayers: [
      {
        name: 'Rasmus Højlund',
        position: 'Forward',
        club: 'Manchester United',
        number: 11,
        age: 21
      },
      {
        name: 'Christian Eriksen',
        position: 'Midfielder',
        club: 'Manchester United',
        number: 10,
        age: 32
      },
      {
        name: 'Pierre-Emile Højbjerg',
        position: 'Midfielder',
        club: 'Tottenham Hotspur',
        number: 23,
        age: 29
      }
    ],
    historicalTimeline: [
      { 
        year: 1986, 
        event: 'First World Cup appearance.',
        category: 'first_appearance'
      },
      { 
        year: 1992, 
        event: 'Won the UEFA European Championship after being late entrants to the tournament.',
        category: 'championship'
      },
      { 
        year: 1998, 
        event: 'Reached the World Cup Quarter-finals, losing a classic 3-2 match to Brazil.',
        category: 'notable_performance'
      },
      { 
        year: 2021, 
        event: 'Reached the Euro Semi-finals after Christian Eriksen\'s collapse and recovery.',
        category: 'notable_performance'
      }
    ],
    greatestMoments: [
      {
        title: 'Euro 92 Shock Victory',
        description: 'As last-minute replacements, Denmark shocked the world by going all the way to win the European Championship, defeating Germany in the final.',
        year: 1992,
        tournament: 'UEFA Euro 1992',
        video_search_query: 'Denmark Euro 1992 final highlights'
      }
    ],
    fanCulture: {
      traditions: 'Known as \'Danish Dynamite\', fans are joyous and highly supportive, traveling in large, well-organized groups that sing unique and memorable chants.',
      famous_chant: 'Vi er røde, vi er hvide (We are red, we are white)',
      supporter_groups: 'Danske Fodbold Fanklubber (DFF)',
      match_day_atmosphere: 'Friendly, festive, and loud, with a positive, unifying atmosphere around the team.'
    },
    funFacts: [
      'Denmark\'s 1992 European Championship victory is considered one of the greatest underdog stories in football history.'
    ]
  },
  {
    slug: 'france',
    name: 'France',
    confederation: 'UEFA',
    isProvisional: true,
    fifaRanking: 2,
    appearances: 16,
    bestFinish: 'Champions (2x)',
    primaryColor: '#0055A4',
    secondaryColor: '#FFFFFF',
    flagEmoji: '🇫🇷',
    coach: 'Didier Deschamps',
    nickname: 'Les Bleus',
    starPlayers: [
      {
        name: 'Kylian Mbappé',
        position: 'Forward',
        club: 'Real Madrid',
        number: 10,
        age: 25
      },
      {
        name: 'Aurélien Tchouaméni',
        position: 'Midfielder',
        club: 'Real Madrid',
        number: 8,
        age: 24
      },
      {
        name: 'William Saliba',
        position: 'Defender',
        club: 'Arsenal',
        number: 17,
        age: 23
      },
      {
        name: 'Ousmane Dembélé',
        position: 'Winger',
        club: 'Paris Saint-Germain',
        number: 11,
        age: 27
      }
    ],
    historicalTimeline: [
      { 
        year: 1930, 
        event: 'Participated in the inaugural World Cup, finishing in the group stage.',
        category: 'first_appearance'
      },
      { 
        year: 1958, 
        event: 'Finished third, with Just Fontaine scoring a record 13 goals.',
        category: 'notable_performance'
      },
      { 
        year: 1998, 
        event: 'Won their first World Cup on home soil, defeating Brazil 3-0.',
        category: 'championship'
      },
      { 
        year: 2000, 
        event: 'Won the UEFA European Championship, forming the \'Golden Generation\'.',
        category: 'championship'
      },
      { 
        year: 2018, 
        event: 'Won their second World Cup in Russia, led by Kylian Mbappé.',
        category: 'championship'
      },
      { 
        year: 2022, 
        event: 'Finished as World Cup Runners-up in a legendary final against Argentina.',
        category: 'notable_performance'
      }
    ],
    greatestMoments: [
      {
        title: 'Zidane\'s Brace in the Final',
        description: 'Zinedine Zidane scores two iconic headers in the final against Brazil, securing France\'s first-ever World Cup triumph in front of their home fans.',
        year: 1998,
        tournament: '1998 FIFA World Cup',
        video_search_query: 'France vs Brazil 1998 World Cup final Zidane goals'
      },
      {
        title: 'Golden Goal at Euro 2000',
        description: 'David Trezeguet scores the golden goal in extra time against Italy, securing the European Championship and cementing the \'Golden Generation\' as dominant.',
        year: 2000,
        tournament: 'UEFA Euro 2000',
        video_search_query: 'Trezeguet golden goal Euro 2000'
      },
      {
        title: 'Mbappé\'s Final Showcase',
        description: 'Kylian Mbappé scores a hat-trick in a World Cup final, only the second player ever to do so, in a valiant effort that nearly saved the team against Argentina.',
        year: 2022,
        tournament: '2022 FIFA World Cup',
        video_search_query: 'Kylian Mbappé World Cup final hat-trick'
      }
    ],
    fanCulture: {
      traditions: 'French fan culture is highly patriotic, with supporters often singing the national anthem (La Marseillaise) with fervor. The culture is very diverse, reflecting the team\'s multi-ethnic composition. The tricolor flag is a constant fixture.',
      famous_chant: 'La Marseillaise (National Anthem)',
      supporter_groups: 'Les Irrésistibles Français (The Irresistible French), Club des Supporters de l\'Équipe de France',
      match_day_atmosphere: 'Energetic and passionate, characterized by the collective singing of the national anthem. There is immense pride in the team\'s recent successes and its current status as a global powerhouse.'
    },
    funFacts: [
      'Didier Deschamps is one of only three men to win the World Cup as both a player and a coach.',
      'France hosted the 1938 and 1998 World Cups.',
      'They are the current world record holders for the biggest victory in a European Qualifier, defeating Gibraltar 14-0 in 2023.'
    ]
  },
  {
    slug: 'germany',
    name: 'Germany',
    confederation: 'UEFA',
    isProvisional: true,
    fifaRanking: 10,
    appearances: 20,
    bestFinish: 'Champions (4x)',
    primaryColor: '#000000',
    secondaryColor: '#DD0000',
    flagEmoji: '🇩🇪',
    coach: 'Julian Nagelsmann',
    nickname: 'Die Mannschaft',
    starPlayers: [
      {
        name: 'Jamal Musiala',
        position: 'Midfielder',
        club: 'Bayern Munich',
        number: 10,
        age: 21
      },
      {
        name: 'Florian Wirtz',
        position: 'Midfielder',
        club: 'Bayer Leverkusen',
        number: 11,
        age: 21
      },
      {
        name: 'Joshua Kimmich',
        position: 'Midfielder',
        club: 'Bayern Munich',
        number: 6,
        age: 29
      },
      {
        name: 'Antonio Rüdiger',
        position: 'Defender',
        club: 'Real Madrid',
        number: 2,
        age: 31
      }
    ],
    historicalTimeline: [
      { 
        year: 1934, 
        event: 'First World Cup appearance, finishing third.',
        category: 'first_appearance'
      },
      { 
        year: 1954, 
        event: 'Achieved the \'Miracle of Bern\', winning their first World Cup as West Germany against the heavily favored Hungary.',
        category: 'championship'
      },
      { 
        year: 1974, 
        event: 'Won their second World Cup on home soil, defeating the Netherlands in the final.',
        category: 'championship'
      },
      { 
        year: 1990, 
        event: 'Won their third World Cup (as West Germany), shortly before reunification.',
        category: 'championship'
      },
      { 
        year: 2014, 
        event: 'Won their fourth World Cup in Brazil, highlighted by the 7-1 semi-final victory over the hosts.',
        category: 'championship'
      },
      { 
        year: 2018, 
        event: 'Infamously eliminated in the World Cup group stage as defending champions.',
        category: 'disappointment'
      }
    ],
    greatestMoments: [
      {
        title: 'The Miracle of Bern',
        description: 'West Germany, heavily depleted after WWII, stages a remarkable comeback to defeat the mighty Hungarian \'Magical Magyars\' 3-2 and claim their first World Cup title.',
        year: 1954,
        tournament: '1954 FIFA World Cup',
        video_search_query: 'Miracle of Bern 1954 World Cup final highlights'
      },
      {
        title: 'The 7-1 Demolition',
        description: 'In a shocking World Cup semi-final, Germany destroys host nation Brazil 7-1, a scoreline that became instantly infamous and secured their place in the final.',
        year: 2014,
        tournament: '2014 FIFA World Cup',
        video_search_query: 'Brazil vs Germany 7-1 highlights'
      },
      {
        title: 'Fourth World Cup Triumph',
        description: 'Mario Götze scores the only goal in extra time against Argentina, making Germany the first European nation to win a World Cup in the Americas.',
        year: 2014,
        tournament: '2014 FIFA World Cup',
        video_search_query: 'Germany vs Argentina 2014 World Cup Final'
      }
    ],
    fanCulture: {
      traditions: 'German fan culture is known for its structure, organization, and a wave of national pride that crests during major tournaments. Face painting, national flags, and massive public viewing parties (Fan Miles) are common traditions.',
      famous_chant: 'Olé, Olé, Olé, Deutschland!',
      supporter_groups: 'Fandachverband (Fan Association), diverse Ultras and fan clubs from the Bundesliga system.',
      match_day_atmosphere: 'Highly supportive and organized. Matches often reflect a mix of traditional European chanting and the celebratory atmosphere of a unified, modern nation.'
    },
    funFacts: [
      'Germany (including West Germany) has the most World Cup appearances of any European nation.',
      'They are tied with Italy for the second-most World Cup titles (4) and tied with Spain for the most European Championship titles (3).',
      'The 1954 World Cup victory is credited with helping to accelerate the post-war psychological recovery in West Germany.'
    ]
  },
  {
    slug: 'netherlands',
    name: 'Netherlands',
    confederation: 'UEFA',
    isProvisional: true,
    fifaRanking: 8,
    appearances: 11,
    bestFinish: 'Runners-up (3x)',
    primaryColor: '#FF4F00',
    secondaryColor: '#FFFFFF',
    flagEmoji: '🇳🇱',
    coach: 'Ronald Koeman',
    nickname: 'Oranje',
    starPlayers: [
      {
        name: 'Virgil van Dijk',
        position: 'Defender',
        club: 'Liverpool',
        number: 4,
        age: 33
      },
      {
        name: 'Frenkie de Jong',
        position: 'Midfielder',
        club: 'FC Barcelona',
        number: 21,
        age: 27
      },
      {
        name: 'Cody Gakpo',
        position: 'Forward',
        club: 'Liverpool',
        number: 18,
        age: 25
      },
      {
        name: 'Xavi Simons',
        position: 'Midfielder',
        club: 'RB Leipzig',
        number: 14,
        age: 21
      }
    ],
    historicalTimeline: [
      { 
        year: 1934, 
        event: 'First World Cup appearance.',
        category: 'first_appearance'
      },
      { 
        year: 1974, 
        event: 'Reached the World Cup final with the \'Total Football\' side, losing to West Germany.',
        category: 'notable_performance'
      },
      { 
        year: 1988, 
        event: 'Won their only major title, the UEFA European Championship, defeating the Soviet Union in the final.',
        category: 'championship'
      },
      { 
        year: 2010, 
        event: 'Reached the World Cup final for the third time, losing to Spain in extra time.',
        category: 'notable_performance'
      },
      { 
        year: 2014, 
        event: 'Finished third at the World Cup, defeating Brazil 3-0 in the third-place playoff.',
        category: 'notable_performance'
      }
    ],
    greatestMoments: [
      {
        title: 'Van Basten\'s Volley',
        description: 'Marco van Basten scores one of the greatest volleys in football history in the Euro final, securing the Netherlands\' only major trophy.',
        year: 1988,
        tournament: 'UEFA Euro 1988',
        video_search_query: 'Marco van Basten goal vs USSR 1988 final'
      },
      {
        title: 'Total Football\'s Peak',
        description: 'The innovative \'Total Football\' system, led by Johan Cruyff, dazzles the world, culminating in the team\'s first World Cup final appearance.',
        year: 1974,
        tournament: '1974 FIFA World Cup',
        video_search_query: 'Netherlands Total Football 1974 World Cup'
      },
      {
        title: 'Van Persie\'s Flying Header',
        description: 'Robin van Persie scores a spectacular diving header against Spain, kicking off a dominant 5-1 victory and gaining revenge for the 2010 final loss.',
        year: 2014,
        tournament: '2014 FIFA World Cup',
        video_search_query: 'Van Persie flying header vs Spain 2014'
      }
    ],
    fanCulture: {
      traditions: 'Dutch fans, universally known as \'Oranje\', create a massive sea of orange in the stands. They are famous for their festive, party-like atmosphere, often wearing orange wigs and face paint. Fan support is fiercely loyal to the national color.',
      famous_chant: 'Hup Holland Hup!',
      supporter_groups: 'Oranje Supporters, Dutch Lions',
      match_day_atmosphere: 'Highly festive and colorful, bringing a great sense of excitement and celebration to any stadium they visit. They are one of the most recognizable and passionate fanbases.'
    },
    funFacts: [
      'The Netherlands is the most successful national team never to have won the World Cup, reaching the final three times (1974, 1978, 2010).',
      'The \'Total Football\' system of the 1970s, invented by Rinus Michels and led by Johan Cruyff, changed modern football tactics forever.',
      'The number 14 jersey is iconic for the Netherlands, worn by the legendary Johan Cruyff.'
    ]
  },
  {
    slug: 'norway',
    name: 'Norway',
    confederation: 'UEFA',
    isProvisional: true,
    fifaRanking: 44,
    appearances: 3,
    bestFinish: 'Round of 16 (1998)',
    primaryColor: '#BA0C2F',
    secondaryColor: '#00205B',
    flagEmoji: '🇳🇴',
    coach: 'Ståle Solbakken',
    nickname: 'Drillos',
    starPlayers: [
      {
        name: 'Erling Haaland',
        position: 'Forward',
        club: 'Manchester City',
        number: 9,
        age: 24
      },
      {
        name: 'Martin Ødegaard',
        position: 'Midfielder',
        club: 'Arsenal',
        number: 10,
        age: 25
      },
      {
        name: 'Alexander Sørloth',
        position: 'Forward',
        club: 'Atlético Madrid',
        number: 11,
        age: 28
      }
    ],
    historicalTimeline: [
      { 
        year: 1938, 
        event: 'First World Cup appearance.',
        category: 'first_appearance'
      },
      { 
        year: 1993, 
        event: 'Reached a historic FIFA ranking of 2nd under coach Egil \'Drillo\' Olsen.',
        category: 'notable_performance'
      },
      { 
        year: 1994, 
        event: 'Competed in the World Cup, eliminated despite having 4 points in a group where all teams tied.',
        category: 'disappointment'
      },
      { 
        year: 1998, 
        event: 'Reached the World Cup Round of 16, defeating Brazil 2-1 in the group stage.',
        category: 'notable_performance'
      }
    ],
    greatestMoments: [
      {
        title: 'Defeating Reigning World Champions Brazil',
        description: 'Norway defeats Brazil 2-1 in the 1998 World Cup group stage, one of the biggest upsets in their history, securing their spot in the knockout round.',
        year: 1998,
        tournament: '1998 FIFA World Cup',
        video_search_query: 'Norway vs Brazil 1998 World Cup highlights'
      }
    ],
    fanCulture: {
      traditions: 'Norwegian support is passionate, often centered around their \'Drillos\' tactical era. There is huge excitement and focus on the current generation led by Haaland and Ødegaard.',
      famous_chant: 'Heia Norge! (Go Norway!)',
      supporter_groups: 'Oljeberget (The Oil Mountain, referring to oil wealth)',
      match_day_atmosphere: 'Patriotic and hopeful, especially during qualifying matches, with a growing belief in the team\'s potential for the first time in decades.'
    },
    funFacts: [
      'Norway remains undefeated in all matches against Brazil at the senior level (2 wins, 2 draws).'
    ]
  },
  {
    slug: 'poland',
    name: 'Poland',
    confederation: 'UEFA',
    isProvisional: true,
    fifaRanking: 33,
    appearances: 9,
    bestFinish: 'Third Place (1974, 1982)',
    primaryColor: '#DC143C',
    secondaryColor: '#FFFFFF',
    flagEmoji: '🇵🇱',
    coach: 'Michał Probierz',
    nickname: 'Biało-Czerwoni',
    starPlayers: [
      {
        name: 'Robert Lewandowski',
        position: 'Forward',
        club: 'FC Barcelona',
        number: 9,
        age: 36
      },
      {
        name: 'Piotr Zieliński',
        position: 'Midfielder',
        club: 'Inter Milan',
        number: 20,
        age: 30
      },
      {
        name: 'Wojciech Szczęsny',
        position: 'Goalkeeper',
        club: 'Juventus',
        number: 1,
        age: 34
      }
    ],
    historicalTimeline: [
      { 
        year: 1938, 
        event: 'First World Cup appearance.',
        category: 'first_appearance'
      },
      { 
        year: 1974, 
        event: 'Finished third at the World Cup in West Germany, defeating Brazil in the third-place match.',
        category: 'notable_performance'
      },
      { 
        year: 1982, 
        event: 'Finished third at the World Cup in Spain, defeating France in the third-place match.',
        category: 'notable_performance'
      },
      { 
        year: 2002, 
        event: 'Returned to the World Cup after a 16-year drought.',
        category: 'notable_performance'
      },
      { 
        year: 2022, 
        event: 'Advanced to the World Cup Round of 16 for the first time since 1986.',
        category: 'notable_performance'
      }
    ],
    greatestMoments: [
      {
        title: 'The Match on the Water',
        description: 'Poland famously draws 1-1 with England at Wembley in torrential rain, eliminating the hosts and qualifying for the 1974 World Cup.',
        year: 1973,
        tournament: '1974 FIFA World Cup Qualification',
        video_search_query: 'Poland vs England 1973 Match on the Water'
      },
      {
        title: 'World Cup Bronze in West Germany',
        description: 'Led by Grzegorz Lato (Golden Boot winner), Poland achieves a historic third place, defeating tournament favorites Brazil 1-0.',
        year: 1974,
        tournament: '1974 FIFA World Cup',
        video_search_query: 'Poland vs Brazil 1974 3rd place'
      }
    ],
    fanCulture: {
      traditions: 'Polish fans, \'Biało-Czerwoni\' (White and Red), are known for their massive presence, creating a highly patriotic and electric atmosphere, often using flares and loud, choreographed support.',
      famous_chant: 'Polska, Biało-Czerwoni!',
      supporter_groups: 'Kibice Reprezentacji Polski',
      match_day_atmosphere: 'Extremely passionate and fiery. The support is relentless, reflecting a deep sense of national identity tied to the team\'s history.'
    },
    funFacts: [
      'Poland has finished third in the World Cup twice, in 1974 and 1982.'
    ]
  },
  {
    slug: 'portugal',
    name: 'Portugal',
    confederation: 'UEFA',
    isProvisional: true,
    fifaRanking: 7,
    appearances: 8,
    bestFinish: 'Third Place (1966)',
    primaryColor: '#FF0000',
    secondaryColor: '#006600',
    flagEmoji: '🇵🇹',
    coach: 'Roberto Martínez',
    nickname: 'A Seleção',
    starPlayers: [
      {
        name: 'Cristiano Ronaldo',
        position: 'Forward',
        club: 'Al-Nassr FC',
        number: 7,
        age: 39
      },
      {
        name: 'Bruno Fernandes',
        position: 'Midfielder',
        club: 'Manchester United',
        number: 8,
        age: 30
      },
      {
        name: 'Bernardo Silva',
        position: 'Midfielder',
        club: 'Manchester City',
        number: 10,
        age: 30
      },
      {
        name: 'Rafael Leão',
        position: 'Winger',
        club: 'AC Milan',
        number: 11,
        age: 25
      }
    ],
    historicalTimeline: [
      { 
        year: 1928, 
        event: 'Reached the Quarter-finals of the Summer Olympics football tournament.',
        category: 'first_appearance'
      },
      { 
        year: 1966, 
        event: 'First World Cup appearance, finishing third, led by Eusébio (Golden Boot winner).',
        category: 'notable_performance'
      },
      { 
        year: 2004, 
        event: 'Finished as Runners-up while hosting the UEFA European Championship.',
        category: 'disappointment'
      },
      { 
        year: 2016, 
        event: 'Won their first major title, the UEFA European Championship, defeating hosts France in the final.',
        category: 'championship'
      },
      { 
        year: 2019, 
        event: 'Won the inaugural UEFA Nations League Finals on home soil.',
        category: 'championship'
      }
    ],
    greatestMoments: [
      {
        title: 'Eusébio\'s Four Goals in the Comeback',
        description: 'Eusébio scores four goals to lead Portugal back from a 3-0 deficit against North Korea to win 5-3 in the World Cup Quarter-finals, securing their third-place finish.',
        year: 1966,
        tournament: '1966 FIFA World Cup',
        video_search_query: 'Portugal vs North Korea 1966 World Cup Eusébio 4 goals'
      },
      {
        title: 'Euro 2016 Final Victory',
        description: 'Despite Cristiano Ronaldo leaving injured early, Portugal defeats hosts France 1-0 in extra time with an Eder goal to claim their first-ever European Championship.',
        year: 2016,
        tournament: 'UEFA Euro 2016',
        video_search_query: 'Portugal vs France Euro 2016 Final highlights'
      },
      {
        title: 'Nations League Champions',
        description: 'Portugal defeats the Netherlands 1-0 on home soil in the final to win the inaugural UEFA Nations League title, adding another major trophy to their recent haul.',
        year: 2019,
        tournament: '2019 UEFA Nations League Finals',
        video_search_query: 'Portugal vs Netherlands Nations League final 2019'
      }
    ],
    fanCulture: {
      traditions: 'Portuguese fan culture is patriotic and vocal, with fans known for waving large national flags and adopting the unofficial team motto, \'Força Portugal\'. Support is strongest in the large expat communities globally.',
      famous_chant: 'A Portuguesa (National Anthem)',
      supporter_groups: 'Vila Franca da Delegação (official fan club)',
      match_day_atmosphere: 'Passionate and focused on the national flag\'s colors (red and green). The presence of Cristiano Ronaldo has magnified the global support and attention at every match.'
    },
    funFacts: [
      'Portugal\'s best World Cup performance (Third Place in 1966) was also their first appearance.',
      'Cristiano Ronaldo is the leading goalscorer in men\'s international football history.',
      'Portugal\'s biggest footballing rivalry is historically with Spain, known as \'The Iberian Derby\'.'
    ]
  },
  {
    slug: 'spain',
    name: 'Spain',
    confederation: 'UEFA',
    isProvisional: true,
    fifaRanking: 3,
    appearances: 16,
    bestFinish: 'Champions (2010)',
    primaryColor: '#AA151B',
    secondaryColor: '#F1BF00',
    flagEmoji: '🇪🇸',
    coach: 'Luis de la Fuente',
    nickname: 'La Roja',
    starPlayers: [
      {
        name: 'Rodri',
        position: 'Midfielder',
        club: 'Manchester City',
        number: 16,
        age: 28
      },
      {
        name: 'Gavi',
        position: 'Midfielder',
        club: 'FC Barcelona',
        number: 9,
        age: 20
      },
      {
        name: 'Lamine Yamal',
        position: 'Winger',
        club: 'FC Barcelona',
        number: 19,
        age: 17
      },
      {
        name: 'Dani Carvajal',
        position: 'Defender',
        club: 'Real Madrid',
        number: 2,
        age: 32
      }
    ],
    historicalTimeline: [
      { 
        year: 1920, 
        event: 'Played their first official international match at the Antwerp Olympics, winning the Silver Medal.',
        category: 'first_appearance'
      },
      { 
        year: 1964, 
        event: 'Won their first major title, the UEFA European Championship, defeating the Soviet Union in the final.',
        category: 'championship'
      },
      { 
        year: 2008, 
        event: 'Won Euro 2008, starting the \'Golden Era\' of Spanish football under Luis Aragonés.',
        category: 'championship'
      },
      { 
        year: 2010, 
        event: 'Won the FIFA World Cup for the first time, defeating the Netherlands 1-0 in the final.',
        category: 'championship'
      },
      { 
        year: 2012, 
        event: 'Won Euro 2012, becoming the first nation to win three consecutive major international tournaments.',
        category: 'championship'
      },
      { 
        year: 2024, 
        event: 'Won UEFA Euro 2024, defeating England in the final, for their fourth European title.',
        category: 'championship'
      }
    ],
    greatestMoments: [
      {
        title: 'Iniesta\'s World Cup Winner',
        description: 'Andrés Iniesta scores the winning goal in the 116th minute of the final against the Netherlands, securing Spain\'s first-ever World Cup title.',
        year: 2010,
        tournament: '2010 FIFA World Cup',
        video_search_query: 'Andrés Iniesta goal vs Netherlands World Cup final'
      },
      {
        title: 'The Golden Era Begins',
        description: 'Fernando Torres scores the only goal against Germany in the Euro 2008 final, breaking a 44-year trophy drought and launching a period of global dominance.',
        year: 2008,
        tournament: 'UEFA Euro 2008',
        video_search_query: 'Spain vs Germany Euro 2008 final highlights'
      },
      {
        title: 'Euro 2024 Triumph',
        description: 'Spain secures their 4th European Championship, showcasing a new, dynamic generation of players and defeating rivals England in the final.',
        year: 2024,
        tournament: 'UEFA Euro 2024',
        video_search_query: 'Spain vs England Euro 2024 final highlights'
      }
    ],
    fanCulture: {
      traditions: 'Spanish fan culture is marked by regional diversity but unites under the banner of \'La Roja\' (The Red One). The \'tiki-taka\' playing style is a source of national pride. Fans are passionate, energetic, and often celebrate with traditional Spanish flags.',
      famous_chant: 'A por ellos! (Go get them!)',
      supporter_groups: 'Frente Atlético (influence from club), various regional supporter groups.',
      match_day_atmosphere: 'Loud, organized, and focused on celebrating the team\'s technical skill. The atmosphere is highly festive, often involving large gatherings for watching public screens.'
    },
    funFacts: [
      'Spain is the only national team in history to win three consecutive major international tournaments (Euro 2008, World Cup 2010, Euro 2012).',
      'Spain holds the record for the most UEFA European Championship titles (4), tied with Germany.',
      'The 2010 World Cup victory made Spain the first European team to win the trophy outside of Europe.'
    ]
  },
  {
    slug: 'switzerland',
    name: 'Switzerland',
    confederation: 'UEFA',
    isProvisional: true,
    fifaRanking: 17,
    appearances: 12,
    bestFinish: 'Quarter-finals',
    primaryColor: '#FF0000',
    secondaryColor: '#FFFFFF',
    flagEmoji: '🇨🇭',
    coach: 'Murat Yakin',
    starPlayers: [
      {
        name: 'Granit Xhaka',
        position: 'Midfielder',
        club: 'Bayer Leverkusen',
        number: 10,
        age: 31
      },
      {
        name: 'Xherdan Shaqiri',
        position: 'Winger',
        club: 'FC Basel',
        number: 23,
        age: 32
      },
      {
        name: 'Yann Sommer',
        position: 'Goalkeeper',
        club: 'Inter Milan',
        number: 1,
        age: 35
      }
    ]
  }
];

// Helper function to get teams by confederation
export function getTeamsByConfederation(confederation: Team['confederation']) {
  return teams.filter(team => team.confederation === confederation);
}

// Helper function to get all qualified teams
export function getQualifiedTeams() {
  return teams.filter(team => !team.isProvisional);
}

// Helper function to get all provisional teams
export function getProvisionalTeams() {
  return teams.filter(team => team.isProvisional);
}

// Helper function to get team by slug
export function getTeamBySlug(slug: string) {
  return teams.find(team => team.slug === slug);
}

// Confederation names and colors
export const confederations = {
  CONCACAF: { name: 'CONCACAF', color: '#0066CC', fullName: 'North & Central America' },
  AFC: { name: 'AFC', color: '#FF0000', fullName: 'Asia' },
  CAF: { name: 'CAF', color: '#00A651', fullName: 'Africa' },
  CONMEBOL: { name: 'CONMEBOL', color: '#FFD700', fullName: 'South America' },
  OFC: { name: 'OFC', color: '#0099CC', fullName: 'Oceania' },
  UEFA: { name: 'UEFA', color: '#003399', fullName: 'Europe' }
};
