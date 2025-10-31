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
  originAirport?: {
    code?: string;
    name?: string;
    city?: string;
    country?: string;
  } | null;
  groupSize?: number;
  children?: number;
  seniors?: number;
  startDate?: string;
  endDate?: string;
  citiesVisiting?: string[];
  tripFocus?: string[];
  ticketCities?: string[];
  matchDates?: string[];
  budgetLevel?: string;
  favoriteTeam?: string;
  hasMatchTickets?: boolean;
  transportMode?: string;
  surpriseMe?: boolean;
  foodPreference?: string;
  nightlifePreference?: string;
  climatePreference?: string;
  mobilityIssues?: boolean;
}

export interface StoredSelection {
  optionIndex: number;
  option: ItineraryOption;
  tripInput?: TripInput;
  savedAt: number;
}

export type SavedItineraryPayload = {
  options?: ItineraryOption[];
  [key: string]: unknown;
};

export interface SavedTravelPlanRecord {
  id: string;
  user_id: string;
  trip_input: TripInput | null;
  itinerary: SavedItineraryPayload | null;
  selected_option_index: number | null;
  title: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedTravelPlan {
  id: string;
  userId: string;
  tripInput: TripInput | null;
  itinerary: SavedItineraryPayload | null;
  selectedOptionIndex: number | null;
  title: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
