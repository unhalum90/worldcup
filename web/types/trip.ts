export interface FlightLeg {
  from: string;
  to: string;
  airlines: string[];
  duration: string;
  exampleDeparture?: string;
  exampleArrival?: string;
  frequency?: string;
  notes?: string;
  layoverBefore?: string;
  layoverNotes?: string;
}

export interface TripCityLodgingZone {
  zoneName: string;
  whyStayHere: string;
  estimatedRate: string;
  transitToStadium: string;
  transitToFanFest: string;
  pros: string[];
  cons: string[];
}

export interface TripCityBlock {
  cityName: string;
  lodgingZones: TripCityLodgingZone[];
  matchDayLogistics: string;
  insiderTips: string[];
}

export interface ItineraryOption {
  title: string;
  summary: string;
  trip?: {
    cityOrder: string[];
    nightsPerCity: Record<string, number>;
    interCityMoves?: Array<{ day?: string; from: string; to: string; mode: string; estDuration?: string }>;
  };
  availableMatches?: Array<{ city: string; date: string; match?: string; stadium?: string }>;
  flights: {
    legs?: FlightLeg[];
    routing?: string;
    totalCost?: string;
    estimatedCost?: string;
    costBreakdown?: string;
    costNote?: string;
  };
  cities: TripCityBlock[];
}

export interface TripInput {
  originCity?: string;
  groupSize?: number;
  children?: number;
  seniors?: number;
  startDate?: string;
  endDate?: string;
  citiesVisiting?: string[];
}

export interface StoredSelection {
  optionIndex: number;
  option: ItineraryOption;
  tripInput?: TripInput;
  savedAt: number;
}
