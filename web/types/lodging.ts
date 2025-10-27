import type { StoredSelection } from './trip';

export type LodgingPlannerWeights = {
  stadiumProximity: number;
  localCulture: number;
  walkability: number;
  nightlife: number;
  budgetSensitivity: number;
};

export interface LodgingPlannerPreferences {
  nightlyBudget: number;
  nights: number;
  carRental: boolean;
  multipleMatches: boolean;
  travelingWithFamily: boolean;
  weights: LodgingPlannerWeights;
  carpoolInterest?: boolean;
  notes?: string;
  language?: 'en' | 'es' | 'fr';
}

export interface LodgingMapMarker {
  name: string;
  lat: number;
  lng: number;
  matchScore: number;
  priceRange?: string;
  travelTimeToStadium?: string;
  travelTimeToFanFest?: string;
  highlight?: boolean;
}

export interface LodgingZoneComparison {
  zoneName: string;
  matchScore: number;
  priceRange: string;
  nightlyEstimate?: string;
  stadiumCommute: string;
  fanFestCommute?: string;
  vibe?: string;
  pros: string[];
  cons: string[];
}

export interface LodgingPlanTopRecommendation {
  zoneName: string;
  matchScore: number;
  priceRange: string;
  estimatedTotal: string;
  nightlyRate?: string;
  affordabilityLabel: string;
  stadiumCommute: string;
  fanFestCommute?: string;
  badge?: string;
  reasons: string[];
}

export interface LodgingPlannerPlan {
  generatedAt: string;
  city: string;
  travelerSummary?: string;
  stayDates?: string;
  nights?: number;
  nightlyBudget?: number;
  topRecommendation: LodgingPlanTopRecommendation;
  zoneComparisons: LodgingZoneComparison[];
  mapMarkers: LodgingMapMarker[];
  insights: string[];
  bookingGuidance: string[];
  warnings?: string[];
  summaryMarkdown?: string;
}

export interface LodgingPlannerRequestBody {
  selection: StoredSelection;
  preferences: LodgingPlannerPreferences;
}
