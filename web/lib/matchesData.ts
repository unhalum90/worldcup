export interface Match {
  matchNumber: number;
  date: string;
  time: string; // ET timezone
  city: string;
  stadium: string;
  team1: string;
  team2: string;
}

// Group stage matches from official FIFA draw (December 5, 2025)
export const groupStageMatches: Match[] = [
  { matchNumber: 1, date: "June 11, 2026", time: "3:00 PM", city: "Mexico City", stadium: "Estadio Azteca", team1: "Mexico", team2: "South Africa" },
  { matchNumber: 2, date: "June 11, 2026", time: "10:00 PM", city: "Guadalajara", stadium: "Estadio Akron", team1: "South Korea", team2: "UEFA Playoff Winner D" },
  { matchNumber: 3, date: "June 12, 2026", time: "3:00 PM", city: "Toronto", stadium: "BMO Field", team1: "Canada", team2: "UEFA Playoff Winner A" },
  { matchNumber: 4, date: "June 12, 2026", time: "9:00 PM", city: "Los Angeles", stadium: "SoFi Stadium", team1: "USA", team2: "Paraguay" },
  { matchNumber: 5, date: "June 13, 2026", time: "3:00 PM", city: "Boston", stadium: "Gillette Stadium", team1: "Haiti", team2: "Scotland" },
  { matchNumber: 6, date: "June 13, 2026", time: "4:00 PM", city: "San Francisco Bay Area", stadium: "Levi's Stadium", team1: "Qatar", team2: "Switzerland" },
  { matchNumber: 7, date: "June 13, 2026", time: "6:00 PM", city: "New York/New Jersey", stadium: "MetLife Stadium", team1: "Brazil", team2: "Morocco" },
  { matchNumber: 8, date: "June 13, 2026", time: "12:00 AM", city: "Vancouver", stadium: "BC Place", team1: "Australia", team2: "UEFA Playoff Winner C" },
  { matchNumber: 9, date: "June 14, 2026", time: "1:00 PM", city: "Philadelphia", stadium: "Lincoln Financial Field", team1: "Ivory Coast", team2: "Ecuador" },
  { matchNumber: 10, date: "June 14, 2026", time: "4:00 PM", city: "Houston", stadium: "NRG Stadium", team1: "Germany", team2: "Curaçao" },
  { matchNumber: 11, date: "June 14, 2026", time: "7:00 PM", city: "Dallas", stadium: "AT&T Stadium", team1: "Netherlands", team2: "Japan" },
  { matchNumber: 12, date: "June 14, 2026", time: "10:00 PM", city: "Monterrey", stadium: "Estadio BBVA", team1: "UEFA Playoff Winner B", team2: "Tunisia" },
  { matchNumber: 13, date: "June 15, 2026", time: "12:00 PM", city: "Miami", stadium: "Hard Rock Stadium", team1: "Saudi Arabia", team2: "Uruguay" },
  { matchNumber: 14, date: "June 15, 2026", time: "3:00 PM", city: "Atlanta", stadium: "Mercedes-Benz Stadium", team1: "Spain", team2: "Cape Verde" },
  { matchNumber: 15, date: "June 15, 2026", time: "6:00 PM", city: "Los Angeles", stadium: "SoFi Stadium", team1: "Iran", team2: "New Zealand" },
  { matchNumber: 16, date: "June 15, 2026", time: "9:00 PM", city: "Seattle", stadium: "Lumen Field", team1: "Belgium", team2: "Egypt" },
  { matchNumber: 17, date: "June 16, 2026", time: "3:00 PM", city: "New York/New Jersey", stadium: "MetLife Stadium", team1: "France", team2: "Senegal" },
  { matchNumber: 18, date: "June 16, 2026", time: "6:00 PM", city: "Boston", stadium: "Gillette Stadium", team1: "FIFA Playoff Winner 2", team2: "Norway" },
  { matchNumber: 19, date: "June 16, 2026", time: "9:00 PM", city: "Kansas City", stadium: "Arrowhead Stadium", team1: "Argentina", team2: "Algeria" },
  { matchNumber: 20, date: "June 16, 2026", time: "12:00 AM", city: "San Francisco Bay Area", stadium: "Levi's Stadium", team1: "Austria", team2: "Jordan" },
  { matchNumber: 21, date: "June 17, 2026", time: "3:00 PM", city: "Toronto", stadium: "BMO Field", team1: "England", team2: "Croatia" },
  { matchNumber: 22, date: "June 17, 2026", time: "6:00 PM", city: "Dallas", stadium: "AT&T Stadium", team1: "Ghana", team2: "Panama" },
  { matchNumber: 23, date: "June 17, 2026", time: "9:00 PM", city: "Houston", stadium: "NRG Stadium", team1: "Portugal", team2: "FIFA Playoff Winner 1" },
  { matchNumber: 24, date: "June 17, 2026", time: "12:00 AM", city: "Mexico City", stadium: "Estadio Azteca", team1: "Uzbekistan", team2: "Colombia" },
  { matchNumber: 25, date: "June 18, 2026", time: "12:00 PM", city: "Atlanta", stadium: "Mercedes-Benz Stadium", team1: "UEFA Playoff Winner D", team2: "South Africa" },
  { matchNumber: 26, date: "June 18, 2026", time: "3:00 PM", city: "Los Angeles", stadium: "SoFi Stadium", team1: "Switzerland", team2: "UEFA Playoff Winner A" },
  { matchNumber: 27, date: "June 18, 2026", time: "6:00 PM", city: "Vancouver", stadium: "BC Place", team1: "Canada", team2: "Qatar" },
  { matchNumber: 28, date: "June 18, 2026", time: "9:00 PM", city: "Guadalajara", stadium: "Estadio Akron", team1: "Mexico", team2: "South Korea" },
  { matchNumber: 29, date: "June 19, 2026", time: "3:00 PM", city: "Philadelphia", stadium: "Lincoln Financial Field", team1: "Brazil", team2: "Haiti" },
  { matchNumber: 30, date: "June 19, 2026", time: "6:00 PM", city: "Boston", stadium: "Gillette Stadium", team1: "Scotland", team2: "Morocco" },
  { matchNumber: 31, date: "June 19, 2026", time: "9:00 PM", city: "San Francisco Bay Area", stadium: "Levi's Stadium", team1: "UEFA Playoff Winner C", team2: "Paraguay" },
  { matchNumber: 32, date: "June 19, 2026", time: "12:00 AM", city: "Seattle", stadium: "Lumen Field", team1: "USA", team2: "Australia" },
  { matchNumber: 33, date: "June 20, 2026", time: "1:00 PM", city: "Toronto", stadium: "BMO Field", team1: "Germany", team2: "Ivory Coast" },
  { matchNumber: 34, date: "June 20, 2026", time: "4:00 PM", city: "Kansas City", stadium: "Arrowhead Stadium", team1: "Ecuador", team2: "Curaçao" },
  { matchNumber: 35, date: "June 20, 2026", time: "7:00 PM", city: "Houston", stadium: "NRG Stadium", team1: "Netherlands", team2: "UEFA Playoff Winner B" },
  { matchNumber: 36, date: "June 20, 2026", time: "10:00 PM", city: "Monterrey", stadium: "Estadio BBVA", team1: "Tunisia", team2: "Japan" },
  { matchNumber: 37, date: "June 21, 2026", time: "12:00 PM", city: "Miami", stadium: "Hard Rock Stadium", team1: "Uruguay", team2: "Cape Verde" },
  { matchNumber: 38, date: "June 21, 2026", time: "3:00 PM", city: "Atlanta", stadium: "Mercedes-Benz Stadium", team1: "Spain", team2: "Saudi Arabia" },
  { matchNumber: 39, date: "June 21, 2026", time: "6:00 PM", city: "Los Angeles", stadium: "SoFi Stadium", team1: "Belgium", team2: "Iran" },
  { matchNumber: 40, date: "June 21, 2026", time: "9:00 PM", city: "Vancouver", stadium: "BC Place", team1: "New Zealand", team2: "Egypt" },
  { matchNumber: 41, date: "June 22, 2026", time: "3:00 PM", city: "New York/New Jersey", stadium: "MetLife Stadium", team1: "Norway", team2: "Senegal" },
  { matchNumber: 42, date: "June 22, 2026", time: "6:00 PM", city: "Philadelphia", stadium: "Lincoln Financial Field", team1: "France", team2: "FIFA Playoff Winner 2" },
  { matchNumber: 43, date: "June 22, 2026", time: "9:00 PM", city: "Dallas", stadium: "AT&T Stadium", team1: "Argentina", team2: "Austria" },
  { matchNumber: 44, date: "June 22, 2026", time: "12:00 AM", city: "San Francisco Bay Area", stadium: "Levi's Stadium", team1: "Jordan", team2: "Algeria" },
  { matchNumber: 45, date: "June 23, 2026", time: "3:00 PM", city: "Boston", stadium: "Gillette Stadium", team1: "England", team2: "Ghana" },
  { matchNumber: 46, date: "June 23, 2026", time: "6:00 PM", city: "Toronto", stadium: "BMO Field", team1: "Panama", team2: "Croatia" },
  { matchNumber: 47, date: "June 23, 2026", time: "9:00 PM", city: "Houston", stadium: "NRG Stadium", team1: "Portugal", team2: "Uzbekistan" },
  { matchNumber: 48, date: "June 23, 2026", time: "12:00 AM", city: "Guadalajara", stadium: "Estadio Akron", team1: "Colombia", team2: "FIFA Playoff Winner 1" },
  { matchNumber: 49, date: "June 24, 2026", time: "3:00 PM", city: "Miami", stadium: "Hard Rock Stadium", team1: "Scotland", team2: "Brazil" },
  { matchNumber: 50, date: "June 24, 2026", time: "3:00 PM", city: "Atlanta", stadium: "Mercedes-Benz Stadium", team1: "Morocco", team2: "Haiti" },
  { matchNumber: 51, date: "June 24, 2026", time: "6:00 PM", city: "Vancouver", stadium: "BC Place", team1: "Switzerland", team2: "Canada" },
  { matchNumber: 52, date: "June 24, 2026", time: "6:00 PM", city: "Seattle", stadium: "Lumen Field", team1: "UEFA Playoff Winner A", team2: "Qatar" },
  { matchNumber: 53, date: "June 24, 2026", time: "9:00 PM", city: "Mexico City", stadium: "Estadio Azteca", team1: "UEFA Playoff Winner D", team2: "Mexico" },
  { matchNumber: 54, date: "June 24, 2026", time: "9:00 PM", city: "Monterrey", stadium: "Estadio BBVA", team1: "South Africa", team2: "South Korea" },
  { matchNumber: 55, date: "June 25, 2026", time: "4:00 PM", city: "Philadelphia", stadium: "Lincoln Financial Field", team1: "Curaçao", team2: "Ivory Coast" },
  { matchNumber: 56, date: "June 25, 2026", time: "4:00 PM", city: "New York/New Jersey", stadium: "MetLife Stadium", team1: "Ecuador", team2: "Germany" },
  { matchNumber: 57, date: "June 25, 2026", time: "7:00 PM", city: "Dallas", stadium: "AT&T Stadium", team1: "Japan", team2: "UEFA Playoff Winner B" },
  { matchNumber: 58, date: "June 25, 2026", time: "7:00 PM", city: "Kansas City", stadium: "Arrowhead Stadium", team1: "Tunisia", team2: "Netherlands" },
  { matchNumber: 59, date: "June 25, 2026", time: "10:00 PM", city: "Los Angeles", stadium: "SoFi Stadium", team1: "UEFA Playoff Winner C", team2: "USA" },
  { matchNumber: 60, date: "June 25, 2026", time: "10:00 PM", city: "San Francisco Bay Area", stadium: "Levi's Stadium", team1: "Paraguay", team2: "Australia" },
  { matchNumber: 61, date: "June 26, 2026", time: "3:00 PM", city: "Boston", stadium: "Gillette Stadium", team1: "Norway", team2: "France" },
  { matchNumber: 62, date: "June 26, 2026", time: "3:00 PM", city: "Toronto", stadium: "BMO Field", team1: "Senegal", team2: "FIFA Playoff Winner 2" },
  { matchNumber: 63, date: "June 26, 2026", time: "6:00 PM", city: "Seattle", stadium: "Lumen Field", team1: "New Zealand", team2: "Belgium" },
  { matchNumber: 64, date: "June 26, 2026", time: "6:00 PM", city: "Vancouver", stadium: "BC Place", team1: "Egypt", team2: "Iran" },
  { matchNumber: 65, date: "June 26, 2026", time: "9:00 PM", city: "Houston", stadium: "NRG Stadium", team1: "Uruguay", team2: "Spain" },
  { matchNumber: 66, date: "June 26, 2026", time: "9:00 PM", city: "Guadalajara", stadium: "Estadio Akron", team1: "Cape Verde", team2: "Saudi Arabia" },
  { matchNumber: 67, date: "June 27, 2026", time: "3:00 PM", city: "New York/New Jersey", stadium: "MetLife Stadium", team1: "Panama", team2: "England" },
  { matchNumber: 68, date: "June 27, 2026", time: "3:00 PM", city: "Philadelphia", stadium: "Lincoln Financial Field", team1: "Croatia", team2: "Ghana" },
  { matchNumber: 69, date: "June 27, 2026", time: "6:00 PM", city: "Kansas City", stadium: "Arrowhead Stadium", team1: "Jordan", team2: "Argentina" },
  { matchNumber: 70, date: "June 27, 2026", time: "6:00 PM", city: "Dallas", stadium: "AT&T Stadium", team1: "Algeria", team2: "Austria" },
  { matchNumber: 71, date: "June 27, 2026", time: "9:00 PM", city: "Miami", stadium: "Hard Rock Stadium", team1: "Colombia", team2: "Portugal" },
  { matchNumber: 72, date: "June 27, 2026", time: "9:00 PM", city: "Atlanta", stadium: "Mercedes-Benz Stadium", team1: "FIFA Playoff Winner 1", team2: "Uzbekistan" },
];

// Helper to get matches by city
export function getMatchesByCity(cityName: string): Match[] {
  const normalizedCity = cityName.toLowerCase().replace(/[^a-z]/g, '');
  return groupStageMatches.filter(match => {
    const matchCity = match.city.toLowerCase().replace(/[^a-z]/g, '');
    return matchCity.includes(normalizedCity) || normalizedCity.includes(matchCity);
  });
}

// Helper to get matches by team
export function getMatchesByTeam(teamName: string): Match[] {
  const normalizedTeam = teamName.toLowerCase();
  return groupStageMatches.filter(match => {
    const t1 = match.team1.toLowerCase();
    const t2 = match.team2.toLowerCase();
    return t1.includes(normalizedTeam) || normalizedTeam.includes(t1) ||
           t2.includes(normalizedTeam) || normalizedTeam.includes(t2);
  });
}

// City slug to official city name mapping
export const citySlugToName: Record<string, string> = {
  'atlanta': 'Atlanta',
  'boston': 'Boston',
  'dallas': 'Dallas',
  'guadalajara': 'Guadalajara',
  'houston': 'Houston',
  'kansas-city': 'Kansas City',
  'los-angeles': 'Los Angeles',
  'mexico-city': 'Mexico City',
  'miami': 'Miami',
  'monterrey': 'Monterrey',
  'new-york': 'New York/New Jersey',
  'philadelphia': 'Philadelphia',
  'san-francisco': 'San Francisco Bay Area',
  'seattle': 'Seattle',
  'toronto': 'Toronto',
  'vancouver': 'Vancouver',
};
