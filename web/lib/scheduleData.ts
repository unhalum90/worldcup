// Pre-normalized match schedule derived from match_schedule.md
// Minimal typing to avoid circular imports
export type ScheduleItem = {
  country: string;
  city: string;
  stadium: string;
  date: string; // ISO
  displayDate: string; // Original label
  match: string;
};

export const MATCH_SCHEDULE: ScheduleItem[] = [
  // MEXICO
  { country: 'MEXICO', city: 'Mexico City', stadium: 'Estadio Azteca', date: '2026-06-11', displayDate: 'Jun 11 (Thu)', match: 'Match 1 Group A (Mexico #1)' },
  { country: 'MEXICO', city: 'Mexico City', stadium: 'Estadio Azteca', date: '2026-06-17', displayDate: 'Jun 17 (Wed)', match: 'Match 24 Group K' },
  { country: 'MEXICO', city: 'Mexico City', stadium: 'Estadio Azteca', date: '2026-06-24', displayDate: 'Jun 24 (Wed)', match: 'Match 53 Group A (Mexico #3)' },
  { country: 'MEXICO', city: 'Mexico City', stadium: 'Estadio Azteca', date: '2026-06-30', displayDate: 'Jun 30 (Tue)', match: 'Match 79 Round of 32 (Group A winners v 3rd place team)' },
  { country: 'MEXICO', city: 'Mexico City', stadium: 'Estadio Azteca', date: '2026-07-05', displayDate: 'Jul 5 (Sun)', match: 'Match 92 Round of 16 (Winner 79 v Winner 80)' },

  { country: 'MEXICO', city: 'Guadalajara', stadium: 'Estadio Guadalajara', date: '2026-06-11', displayDate: 'Jun 11 (Thu)', match: 'Match 2 Group A' },
  { country: 'MEXICO', city: 'Guadalajara', stadium: 'Estadio Guadalajara', date: '2026-06-18', displayDate: 'Jun 18 (Thu)', match: 'Match 28 Group A (Mexico #2)' },
  { country: 'MEXICO', city: 'Guadalajara', stadium: 'Estadio Guadalajara', date: '2026-06-23', displayDate: 'Jun 23 (Tue)', match: 'Match 48 Group K' },
  { country: 'MEXICO', city: 'Guadalajara', stadium: 'Estadio Guadalajara', date: '2026-06-26', displayDate: 'Jun 26 (Fri)', match: 'Match 66 Group H' },

  { country: 'MEXICO', city: 'Monterrey', stadium: 'Estadio Monterrey', date: '2026-06-14', displayDate: 'Jun 14 (Sun)', match: 'Match 12 Group F' },
  { country: 'MEXICO', city: 'Monterrey', stadium: 'Estadio Monterrey', date: '2026-06-20', displayDate: 'Jun 20 (Sat)', match: 'Match 36 Group F' },
  { country: 'MEXICO', city: 'Monterrey', stadium: 'Estadio Monterrey', date: '2026-06-25', displayDate: 'Jun 25 (Thu)', match: 'Match 54 Group A' },
  { country: 'MEXICO', city: 'Monterrey', stadium: 'Estadio Monterrey', date: '2026-06-29', displayDate: 'Jun 29 (Mon)', match: 'Match 75 Round of 32 (Group F winners v Group C runners-up)' },

  // CANADA
  { country: 'CANADA', city: 'Toronto', stadium: 'Toronto Stadium', date: '2026-06-12', displayDate: 'Jun 12 (Fri)', match: 'Match 3 Group B (Canada #1)' },
  { country: 'CANADA', city: 'Toronto', stadium: 'Toronto Stadium', date: '2026-06-17', displayDate: 'Jun 17 (Wed)', match: 'Match 21 Group L' },
  { country: 'CANADA', city: 'Toronto', stadium: 'Toronto Stadium', date: '2026-06-20', displayDate: 'Jun 20 (Sat)', match: 'Match 33 Group E' },
  { country: 'CANADA', city: 'Toronto', stadium: 'Toronto Stadium', date: '2026-06-23', displayDate: 'Jun 23 (Tue)', match: 'Match 46 Group L' },
  { country: 'CANADA', city: 'Toronto', stadium: 'Toronto Stadium', date: '2026-06-26', displayDate: 'Jun 26 (Fri)', match: 'Match 62 Group I' },
  { country: 'CANADA', city: 'Toronto', stadium: 'Toronto Stadium', date: '2026-07-02', displayDate: 'Jul 2 (Thu)', match: 'Match 83 Round of 32 (Group K runners-up v Group L runners-up)' },

  { country: 'CANADA', city: 'Vancouver', stadium: 'BC Place', date: '2026-06-13', displayDate: 'Jun 13 (Sat)', match: 'Match 6 Group D' },
  { country: 'CANADA', city: 'Vancouver', stadium: 'BC Place', date: '2026-06-18', displayDate: 'Jun 18 (Thu)', match: 'Match 27 Group B (Canada #2)' },
  { country: 'CANADA', city: 'Vancouver', stadium: 'BC Place', date: '2026-06-24', displayDate: 'Jun 24 (Wed)', match: 'Match 51 Group B (Canada #3)' },
  { country: 'CANADA', city: 'Vancouver', stadium: 'BC Place', date: '2026-06-26', displayDate: 'Jun 26 (Fri)', match: 'Match 64 Group G' },
  { country: 'CANADA', city: 'Vancouver', stadium: 'BC Place', date: '2026-07-07', displayDate: 'Jul 7 (Tue)', match: 'Match 96 Round of 16 (Winner 85 v Winner 87)' },

  // UNITED STATES
  { country: 'UNITED STATES', city: 'Atlanta', stadium: 'Atlanta Stadium', date: '2026-06-15', displayDate: 'Jun 15 (Mon)', match: 'Match 14 Group H' },
  { country: 'UNITED STATES', city: 'Atlanta', stadium: 'Atlanta Stadium', date: '2026-06-18', displayDate: 'Jun 18 (Thu)', match: 'Match 25 Group A' },
  { country: 'UNITED STATES', city: 'Atlanta', stadium: 'Atlanta Stadium', date: '2026-06-24', displayDate: 'Jun 24 (Wed)', match: 'Match 50 Group C' },
  { country: 'UNITED STATES', city: 'Atlanta', stadium: 'Atlanta Stadium', date: '2026-06-27', displayDate: 'Jun 27 (Sat)', match: 'Match 72 Group K' },
  { country: 'UNITED STATES', city: 'Atlanta', stadium: 'Atlanta Stadium', date: '2026-07-01', displayDate: 'Jul 1 (Wed)', match: 'Match 80 Round of 32' },
  { country: 'UNITED STATES', city: 'Atlanta', stadium: 'Atlanta Stadium', date: '2026-07-07', displayDate: 'Jul 7 (Tue)', match: 'Match 95 Round of 16 (Winner 86 v Winner 88)' },
  { country: 'UNITED STATES', city: 'Atlanta', stadium: 'Atlanta Stadium', date: '2026-07-15', displayDate: 'Jul 15 (Wed)', match: 'Match 102 Semi-final (Winner 99 v Winner 100)' },

  { country: 'UNITED STATES', city: 'Boston', stadium: 'Boston Stadium', date: '2026-06-13', displayDate: 'Jun 13 (Sat)', match: 'Match 5 Group C' },
  { country: 'UNITED STATES', city: 'Boston', stadium: 'Boston Stadium', date: '2026-06-16', displayDate: 'Jun 16 (Tue)', match: 'Match 18 Group I' },
  { country: 'UNITED STATES', city: 'Boston', stadium: 'Boston Stadium', date: '2026-06-19', displayDate: 'Jun 19 (Fri)', match: 'Match 30 Group C' },
  { country: 'UNITED STATES', city: 'Boston', stadium: 'Boston Stadium', date: '2026-06-23', displayDate: 'Jun 23 (Tue)', match: 'Match 45 Group L' },
  { country: 'UNITED STATES', city: 'Boston', stadium: 'Boston Stadium', date: '2026-06-26', displayDate: 'Jun 26 (Fri)', match: 'Match 61 Group I' },
  { country: 'UNITED STATES', city: 'Boston', stadium: 'Boston Stadium', date: '2026-06-29', displayDate: 'Jun 29 (Mon)', match: 'Match 74 Round of 32 (Group E winners v 3rd place team)' },
  { country: 'UNITED STATES', city: 'Boston', stadium: 'Boston Stadium', date: '2026-07-09', displayDate: 'Jul 9 (Thu)', match: 'Match 97 Quarter-final (Winner 89 v Winner 90)' },

  { country: 'UNITED STATES', city: 'Dallas', stadium: 'AT&T Stadium', date: '2026-06-14', displayDate: 'Jun 14 (Sun)', match: 'Match 11 Group F' },
  { country: 'UNITED STATES', city: 'Dallas', stadium: 'AT&T Stadium', date: '2026-06-17', displayDate: 'Jun 17 (Wed)', match: 'Match 22 Group L' },
  { country: 'UNITED STATES', city: 'Dallas', stadium: 'AT&T Stadium', date: '2026-06-22', displayDate: 'Jun 22 (Mon)', match: 'Match 43 Group J' },
  { country: 'UNITED STATES', city: 'Dallas', stadium: 'AT&T Stadium', date: '2026-06-25', displayDate: 'Jun 25 (Thu)', match: 'Match 57 Group F' },
  { country: 'UNITED STATES', city: 'Dallas', stadium: 'AT&T Stadium', date: '2026-06-30', displayDate: 'Jun 30 (Tue)', match: 'Match 78 Round of 32 (Group E runners-up v Group I runners-up)' },
  { country: 'UNITED STATES', city: 'Dallas', stadium: 'AT&T Stadium', date: '2026-07-06', displayDate: 'Jul 6 (Mon)', match: 'Match 93 Round of 16 (Winner 83 v Winner 84)' },
  { country: 'UNITED STATES', city: 'Dallas', stadium: 'AT&T Stadium', date: '2026-07-14', displayDate: 'Jul 14 (Tue)', match: 'Match 101 Semi-final (Winner 97 v Winner 98)' },

  { country: 'UNITED STATES', city: 'Houston', stadium: 'Houston Stadium', date: '2026-06-14', displayDate: 'Jun 14 (Sun)', match: 'Match 10 Group E' },
  { country: 'UNITED STATES', city: 'Houston', stadium: 'Houston Stadium', date: '2026-06-17', displayDate: 'Jun 17 (Wed)', match: 'Match 23 Group K' },
  { country: 'UNITED STATES', city: 'Houston', stadium: 'Houston Stadium', date: '2026-06-20', displayDate: 'Jun 20 (Sat)', match: 'Match 35 Group F' },
  { country: 'UNITED STATES', city: 'Houston', stadium: 'Houston Stadium', date: '2026-06-23', displayDate: 'Jun 23 (Tue)', match: 'Match 47 Group K' },
  { country: 'UNITED STATES', city: 'Houston', stadium: 'Houston Stadium', date: '2026-06-26', displayDate: 'Jun 26 (Fri)', match: 'Match 65 Group H' },
  { country: 'UNITED STATES', city: 'Houston', stadium: 'Houston Stadium', date: '2026-06-29', displayDate: 'Jun 29 (Mon)', match: 'Match 76 Round of 32 (Group C winners v Group F runners-up)' },
  { country: 'UNITED STATES', city: 'Houston', stadium: 'Houston Stadium', date: '2026-07-04', displayDate: 'Jul 4 (Sat)', match: 'Match 90 Round of 16 (Winner 73 v Winner 75)' },

  { country: 'UNITED STATES', city: 'Kansas City', stadium: 'Kansas City Stadium', date: '2026-06-16', displayDate: 'Jun 16 (Tue)', match: 'Match 19 Group J' },
  { country: 'UNITED STATES', city: 'Kansas City', stadium: 'Kansas City Stadium', date: '2026-06-20', displayDate: 'Jun 20 (Sat)', match: 'Match 34 Group E' },
  { country: 'UNITED STATES', city: 'Kansas City', stadium: 'Kansas City Stadium', date: '2026-06-25', displayDate: 'Jun 25 (Thu)', match: 'Match 58 Group F' },
  { country: 'UNITED STATES', city: 'Kansas City', stadium: 'Kansas City Stadium', date: '2026-06-27', displayDate: 'Jun 27 (Sat)', match: 'Match 69 Group J' },
  { country: 'UNITED STATES', city: 'Kansas City', stadium: 'Kansas City Stadium', date: '2026-07-03', displayDate: 'Jul 3 (Fri)', match: 'Match 87 Round of 32 (Group K winners v 3rd place team)' },
  { country: 'UNITED STATES', city: 'Kansas City', stadium: 'Kansas City Stadium', date: '2026-07-11', displayDate: 'Jul 11 (Sat)', match: 'Match 100 Quarter-final (Winner 95 v Winner 96)' },

  { country: 'UNITED STATES', city: 'Los Angeles', stadium: 'Los Angeles Stadium', date: '2026-06-12', displayDate: 'Jun 12 (Fri)', match: 'Match 4 Group D (USA #1)' },
  { country: 'UNITED STATES', city: 'Los Angeles', stadium: 'Los Angeles Stadium', date: '2026-06-15', displayDate: 'Jun 15 (Mon)', match: 'Match 15 Group G' },
  { country: 'UNITED STATES', city: 'Los Angeles', stadium: 'Los Angeles Stadium', date: '2026-06-18', displayDate: 'Jun 18 (Thu)', match: 'Match 26 Group B' },
  { country: 'UNITED STATES', city: 'Los Angeles', stadium: 'Los Angeles Stadium', date: '2026-06-21', displayDate: 'Jun 21 (Sat)', match: 'Match 39 Group G' },
  { country: 'UNITED STATES', city: 'Los Angeles', stadium: 'Los Angeles Stadium', date: '2026-06-25', displayDate: 'Jun 25 (Thu)', match: 'Match 59 Group D (USA #3)' },
  { country: 'UNITED STATES', city: 'Los Angeles', stadium: 'Los Angeles Stadium', date: '2026-07-02', displayDate: 'Jul 2 (Thu)', match: 'Match 84 Round of 32 (Group H winners v Group J runners-up)' },
  { country: 'UNITED STATES', city: 'Los Angeles', stadium: 'Los Angeles Stadium', date: '2026-07-10', displayDate: 'Jul 10 (Fri)', match: 'Match 98 Quarter-final (Winner 93 v Winner 94)' },

  { country: 'UNITED STATES', city: 'Miami', stadium: 'Miami Stadium', date: '2026-06-15', displayDate: 'Jun 15 (Mon)', match: 'Match 13 Group H' },
  { country: 'UNITED STATES', city: 'Miami', stadium: 'Miami Stadium', date: '2026-06-24', displayDate: 'Jun 24 (Wed)', match: 'Match 49 Group C' },
  { country: 'UNITED STATES', city: 'Miami', stadium: 'Miami Stadium', date: '2026-06-27', displayDate: 'Jun 27 (Sat)', match: 'Match 71 Group K' },
  { country: 'UNITED STATES', city: 'Miami', stadium: 'Miami Stadium', date: '2026-07-03', displayDate: 'Jul 3 (Fri)', match: 'Match 86 Round of 32 (Group J winners v Group H runners-up)' },
  { country: 'UNITED STATES', city: 'Miami', stadium: 'Miami Stadium', date: '2026-07-11', displayDate: 'Jul 11 (Sat)', match: 'Match 99 Quarter-final (Winner 91 v Winner 92)' },
  { country: 'UNITED STATES', city: 'Miami', stadium: 'Miami Stadium', date: '2026-07-18', displayDate: 'Jul 18 (Sat)', match: 'Match 103 Bronze Final (Loser 101 v Loser 102)' },

  { country: 'UNITED STATES', city: 'New York', stadium: 'MetLife Stadium', date: '2026-06-13', displayDate: 'Jun 13 (Sat)', match: 'Match 7 Group C' },
  { country: 'UNITED STATES', city: 'New York', stadium: 'MetLife Stadium', date: '2026-06-16', displayDate: 'Jun 16 (Tue)', match: 'Match 17 Group I' },
  { country: 'UNITED STATES', city: 'New York', stadium: 'MetLife Stadium', date: '2026-06-22', displayDate: 'Jun 22 (Mon)', match: 'Match 41 Group I' },
  { country: 'UNITED STATES', city: 'New York', stadium: 'MetLife Stadium', date: '2026-06-25', displayDate: 'Jun 25 (Thu)', match: 'Match 56 Group E' },
  { country: 'UNITED STATES', city: 'New York', stadium: 'MetLife Stadium', date: '2026-06-27', displayDate: 'Jun 27 (Sat)', match: 'Match 67 Group L' },
  { country: 'UNITED STATES', city: 'New York', stadium: 'MetLife Stadium', date: '2026-06-30', displayDate: 'Jun 30 (Tue)', match: 'Match 77 Round of 32 (Group I winners v 3rd place team)' },
  { country: 'UNITED STATES', city: 'New York', stadium: 'MetLife Stadium', date: '2026-07-05', displayDate: 'Jul 5 (Sun)', match: 'Match 91 Round of 16 (Winner 76 v Winner 78)' },
  { country: 'UNITED STATES', city: 'New York', stadium: 'MetLife Stadium', date: '2026-07-19', displayDate: 'Jul 19 (Sun)', match: '🏆 Match 104 Final (Winner 101 v Winner 102)' },

  { country: 'UNITED STATES', city: 'Philadelphia', stadium: 'Philadelphia Stadium', date: '2026-06-14', displayDate: 'Jun 14 (Sun)', match: 'Match 9 Group E' },
  { country: 'UNITED STATES', city: 'Philadelphia', stadium: 'Philadelphia Stadium', date: '2026-06-19', displayDate: 'Jun 19 (Fri)', match: 'Match 29 Group C' },
  { country: 'UNITED STATES', city: 'Philadelphia', stadium: 'Philadelphia Stadium', date: '2026-06-22', displayDate: 'Jun 22 (Mon)', match: 'Match 42 Group I' },
  { country: 'UNITED STATES', city: 'Philadelphia', stadium: 'Philadelphia Stadium', date: '2026-06-25', displayDate: 'Jun 25 (Thu)', match: 'Match 55 Group E' },
  { country: 'UNITED STATES', city: 'Philadelphia', stadium: 'Philadelphia Stadium', date: '2026-06-27', displayDate: 'Jun 27 (Sat)', match: 'Match 68 Group L' },
  { country: 'UNITED STATES', city: 'Philadelphia', stadium: 'Philadelphia Stadium', date: '2026-07-04', displayDate: 'Jul 4 (Sat)', match: 'Match 89 Round of 16 (Winner 74 v Winner 77)' },

  { country: 'UNITED STATES', city: 'San Francisco Bay Area', stadium: 'Bay Area Stadium', date: '2026-06-13', displayDate: 'Jun 13 (Sat)', match: 'Match 8 Group B' },
  { country: 'UNITED STATES', city: 'San Francisco Bay Area', stadium: 'Bay Area Stadium', date: '2026-06-16', displayDate: 'Jun 16 (Tue)', match: 'Match 20 Group J' },
  { country: 'UNITED STATES', city: 'San Francisco Bay Area', stadium: 'Bay Area Stadium', date: '2026-06-19', displayDate: 'Jun 19 (Fri)', match: 'Match 31 Group D' },
  { country: 'UNITED STATES', city: 'San Francisco Bay Area', stadium: 'Bay Area Stadium', date: '2026-06-22', displayDate: 'Jun 22 (Mon)', match: 'Match 44 Group J' },
  { country: 'UNITED STATES', city: 'San Francisco Bay Area', stadium: 'Bay Area Stadium', date: '2026-06-25', displayDate: 'Jun 25 (Thu)', match: 'Match 60 Group D' },
  { country: 'UNITED STATES', city: 'San Francisco Bay Area', stadium: 'Bay Area Stadium', date: '2026-07-01', displayDate: 'Jul 1 (Wed)', match: 'Match 81 Round of 32 (Group D winners v 3rd place team)' },

  { country: 'UNITED STATES', city: 'Seattle', stadium: 'Seattle Stadium', date: '2026-06-15', displayDate: 'Jun 15 (Mon)', match: 'Match 16 Group G' },
  { country: 'UNITED STATES', city: 'Seattle', stadium: 'Seattle Stadium', date: '2026-06-18', displayDate: 'Jun 18 (Thu)', match: 'Match 32 Group D (USA #2)' },
  { country: 'UNITED STATES', city: 'Seattle', stadium: 'Seattle Stadium', date: '2026-06-25', displayDate: 'Jun 25 (Thu)', match: 'Match 52 Group B' },
  { country: 'UNITED STATES', city: 'Seattle', stadium: 'Seattle Stadium', date: '2026-06-26', displayDate: 'Jun 26 (Fri)', match: 'Match 63 Group G' },
  { country: 'UNITED STATES', city: 'Seattle', stadium: 'Seattle Stadium', date: '2026-07-06', displayDate: 'Jul 6 (Mon)', match: 'Match 94 Round of 16 (Winner 81 v Winner 82)' },
];
