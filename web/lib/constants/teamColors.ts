// 28 Qualified Teams for World Cup 2026
export const teamColors: Record<string, { primary: string; secondary: string; flag?: string }> = {
  // Host Nations (3)
  Canada: { primary: '#FF0000', secondary: '#FFFFFF', flag: '/flags/canada.svg' },
  Mexico: { primary: '#006847', secondary: '#CE1126', flag: '/flags/mexico.svg' },
  'United States': { primary: '#002868', secondary: '#BF0A30', flag: '/flags/usa.svg' },
  
  // Asia AFC (8)
  Australia: { primary: '#FFCD00', secondary: '#00843D', flag: '/flags/australia.svg' },
  Iran: { primary: '#239F40', secondary: '#DA0000', flag: '/flags/iran.svg' },
  Japan: { primary: '#002654', secondary: '#FFFFFF', flag: '/flags/japan.svg' },
  Jordan: { primary: '#000000', secondary: '#FFFFFF', flag: '/flags/jordan.svg' },
  Qatar: { primary: '#8A1538', secondary: '#FFFFFF', flag: '/flags/qatar.svg' },
  'Saudi Arabia': { primary: '#006C35', secondary: '#FFFFFF', flag: '/flags/saudi-arabia.svg' },
  'South Korea': { primary: '#C60C30', secondary: '#003478', flag: '/flags/south-korea.svg' },
  Uzbekistan: { primary: '#1EB53A', secondary: '#0099B5', flag: '/flags/uzbekistan.svg' },
  
  // Africa CAF (9)
  Algeria: { primary: '#006233', secondary: '#FFFFFF', flag: '/flags/algeria.svg' },
  'Cape Verde': { primary: '#003893', secondary: '#CF2027', flag: '/flags/cape-verde.svg' },
  Egypt: { primary: '#CE1126', secondary: '#FFFFFF', flag: '/flags/egypt.svg' },
  Ghana: { primary: '#006B3F', secondary: '#FCD116', flag: '/flags/ghana.svg' },
  'Ivory Coast': { primary: '#FF8200', secondary: '#009E60', flag: '/flags/ivory-coast.svg' },
  Morocco: { primary: '#C1272D', secondary: '#006233', flag: '/flags/morocco.svg' },
  Senegal: { primary: '#00853F', secondary: '#FDEF42', flag: '/flags/senegal.svg' },
  'South Africa': { primary: '#007A4D', secondary: '#FFB612', flag: '/flags/south-africa.svg' },
  Tunisia: { primary: '#E70013', secondary: '#FFFFFF', flag: '/flags/tunisia.svg' },
  
  // Oceania OFC (1)
  'New Zealand': { primary: '#000000', secondary: '#FFFFFF', flag: '/flags/new-zealand.svg' },
  
  // South America CONMEBOL (6)
  Argentina: { primary: '#75AADB', secondary: '#FFFFFF', flag: '/flags/argentina.svg' },
  Brazil: { primary: '#009C3B', secondary: '#FFDF00', flag: '/flags/brazil.svg' },
  Colombia: { primary: '#FCD116', secondary: '#003893', flag: '/flags/colombia.svg' },
  Ecuador: { primary: '#FFDD00', secondary: '#034EA2', flag: '/flags/ecuador.svg' },
  Paraguay: { primary: '#D52B1E', secondary: '#0038A8', flag: '/flags/paraguay.svg' },
  Uruguay: { primary: '#0038A8', secondary: '#FFFFFF', flag: '/flags/uruguay.svg' },
  
  // Europe UEFA (1 qualified + provisional)
  England: { primary: '#FFFFFF', secondary: '#C8102E', flag: '/flags/england.svg' }
};
