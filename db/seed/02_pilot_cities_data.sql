-- Seed Data: World Cup Travel Brain - Pilot Cities
-- Dallas, Atlanta, Miami with full zone data

-- ========================================
-- 1. Update Cities (add Travel Brain data)
-- ========================================

-- Dallas
UPDATE cities 
SET 
  stadium_name = 'AT&T Stadium',
  stadium_lat = 32.7473,
  stadium_long = -97.0945,
  fan_fest_location = 'Fair Park',
  fan_fest_lat = 32.7769,
  fan_fest_long = -96.7677,
  is_hub = TRUE,
  airport_code = 'DFW'
WHERE name = 'Dallas';

-- Atlanta  
UPDATE cities 
SET 
  stadium_name = 'Mercedes-Benz Stadium',
  stadium_lat = 33.7555,
  stadium_long = -84.4006,
  fan_fest_location = 'Centennial Olympic Park',
  fan_fest_lat = 33.7634,
  fan_fest_long = -84.3939,
  is_hub = TRUE,
  airport_code = 'ATL'
WHERE name = 'Atlanta';

-- Miami
UPDATE cities 
SET 
  stadium_name = 'Hard Rock Stadium',
  stadium_lat = 25.9580,
  stadium_long = -80.2389,
  fan_fest_location = 'Bayfront Park',
  fan_fest_lat = 25.7743,
  fan_fest_long = -80.1862,
  is_hub = FALSE,
  airport_code = 'MIA'
WHERE name = 'Miami';

-- ========================================
-- 2. Insert Zones - DALLAS
-- ========================================

INSERT INTO zones (city_id, zone_name, lat, long, drive_time_to_stadium, public_time_to_stadium, drive_time_to_fanfest, public_time_to_fanfest, transit_quality, hotel_density, safety_score, nightlife_score, family_score, tag, fan_vibe, parking_availability, notes)
SELECT 
  (SELECT id FROM cities WHERE name = 'Dallas'),
  'Downtown Dallas',
  32.7767,
  -96.7970,
  25, -- drive to stadium
  30, -- DART Red Line
  5,  -- drive to fan fest
  10, -- DART to Fair Park
  8,  -- transit quality
  85, -- hotel count
  7,  -- safety
  9,  -- nightlife
  6,  -- family
  'mid-range',
  'International fan hub, vibrant nightlife',
  'Parking garages available but expensive',
  'Most central location. Walking distance to Fan Festival. DART Red Line goes directly to stadium. Best for fans who want to be in the action.'
WHERE NOT EXISTS (SELECT 1 FROM zones WHERE zone_name = 'Downtown Dallas');

INSERT INTO zones (city_id, zone_name, lat, long, drive_time_to_stadium, public_time_to_stadium, drive_time_to_fanfest, public_time_to_fanfest, transit_quality, hotel_density, safety_score, nightlife_score, family_score, tag, fan_vibe, parking_availability, notes)
SELECT 
  (SELECT id FROM cities WHERE name = 'Dallas'),
  'Irving',
  32.8140,
  -96.9489,
  35, -- drive to stadium
  45, -- DART Orange Line + transfer
  40, -- drive to fan fest
  50, -- DART to Fair Park
  7,  -- transit quality
  54, -- hotel count
  8,  -- safety
  5,  -- nightlife
  8,  -- family
  'budget',
  'Quiet, family-friendly suburban area',
  'Free parking at most hotels',
  'Balanced option between cost and convenience. Near DFW Airport. Good for families. DART accessible but requires transfer.'
WHERE NOT EXISTS (SELECT 1 FROM zones WHERE zone_name = 'Irving');

INSERT INTO zones (city_id, zone_name, lat, long, drive_time_to_stadium, public_time_to_stadium, drive_time_to_fanfest, public_time_to_fanfest, transit_quality, hotel_density, safety_score, nightlife_score, family_score, tag, fan_vibe, parking_availability, notes)
SELECT 
  (SELECT id FROM cities WHERE name = 'Dallas'),
  'Fort Worth',
  32.7555,
  -97.3308,
  45, -- drive to stadium
  90, -- TEXRail + DART (long commute)
  60, -- drive to fan fest
  80, -- public transit
  6,  -- transit quality
  42, -- hotel count
  8,  -- safety
  7,  -- nightlife (different vibe)
  8,  -- family
  'budget',
  'Cowboy culture, distinct identity',
  'Ample free parking',
  'Maximum savings (~$75/night less). Own city experience with museums and stockyards. Long commute to stadium (90+ min transit). Best for multi-day stays who want to explore Texas.'
WHERE NOT EXISTS (SELECT 1 FROM zones WHERE zone_name = 'Fort Worth');

INSERT INTO zones (city_id, zone_name, lat, long, drive_time_to_stadium, public_time_to_stadium, drive_time_to_fanfest, public_time_to_fanfest, transit_quality, hotel_density, safety_score, nightlife_score, family_score, tag, fan_vibe, parking_availability, notes)
SELECT 
  (SELECT id FROM cities WHERE name = 'Dallas'),
  'Uptown Dallas',
  32.8013,
  -96.8011,
  30, -- drive to stadium
  35, -- DART accessible
  10, -- drive to fan fest
  15, -- DART to Fair Park
  8,  -- transit quality
  38, -- hotel count
  9,  -- safety
  9,  -- nightlife
  5,  -- family
  'premium',
  'Upscale dining and shopping',
  'Valet parking common',
  'Trendy neighborhood with high-end hotels, restaurants, and bars. Young professional crowd. Good DART access. Premium pricing but walkable nightlife.'
WHERE NOT EXISTS (SELECT 1 FROM zones WHERE zone_name = 'Uptown Dallas');

-- ========================================
-- 3. Insert Zones - ATLANTA
-- ========================================

INSERT INTO zones (city_id, zone_name, lat, long, drive_time_to_stadium, public_time_to_stadium, drive_time_to_fanfest, public_time_to_fanfest, transit_quality, hotel_density, safety_score, nightlife_score, family_score, tag, fan_vibe, parking_availability, notes)
SELECT 
  (SELECT id FROM cities WHERE name = 'Atlanta'),
  'Downtown Atlanta',
  33.7490,
  -84.3880,
  10, -- drive to stadium
  12, -- MARTA direct (Blue/Green Line)
  5,  -- walking distance to Centennial Park
  5,  -- walking
  9,  -- transit quality (MARTA excellent)
  92, -- hotel count
  6,  -- safety (varies by block)
  8,  -- nightlife
  6,  -- family
  'mid-range',
  'Central hub, easy access to everything',
  'Parking garages ($20-40/day)',
  'Walkable to Fan Festival. MARTA Blue/Green Line goes directly to Mercedes-Benz Stadium (12 min). Central location for exploring Atlanta. Mix of business hotels and historic properties.'
WHERE NOT EXISTS (SELECT 1 FROM zones WHERE zone_name = 'Downtown Atlanta');

INSERT INTO zones (city_id, zone_name, lat, long, drive_time_to_stadium, public_time_to_stadium, drive_time_to_fanfest, public_time_to_fanfest, transit_quality, hotel_density, safety_score, nightlife_score, family_score, tag, fan_vibe, parking_availability, notes)
SELECT 
  (SELECT id FROM cities WHERE name = 'Atlanta'),
  'Midtown Atlanta',
  33.7870,
  -84.3840,
  15, -- drive to stadium
  15, -- MARTA Red/Gold Line + transfer
  15, -- drive to Centennial
  18, -- MARTA
  9,  -- transit quality
  48, -- hotel count
  8,  -- safety
  9,  -- nightlife
  7,  -- family
  'mid-range',
  'Arts district, young professionals',
  'Street parking and garages',
  'Piedmont Park nearby. Cultural attractions (High Museum, Fox Theatre). MARTA accessible. Walkable neighborhood with restaurants and bars. Slightly quieter than downtown.'
WHERE NOT EXISTS (SELECT 1 FROM zones WHERE zone_name = 'Midtown Atlanta');

INSERT INTO zones (city_id, zone_name, lat, long, drive_time_to_stadium, public_time_to_stadium, drive_time_to_fanfest, public_time_to_fanfest, transit_quality, hotel_density, safety_score, nightlife_score, family_score, tag, fan_vibe, parking_availability, notes)
SELECT 
  (SELECT id FROM cities WHERE name = 'Atlanta'),
  'Buckhead',
  33.8490,
  -84.3780,
  25, -- drive to stadium
  30, -- MARTA Red Line
  25, -- drive to Centennial
  35, -- MARTA
  8,  -- transit quality
  35, -- hotel count
  9,  -- safety
  8,  -- nightlife (upscale)
  8,  -- family
  'premium',
  'Upscale shopping and dining',
  'Hotel parking typically included',
  'Atlanta''s luxury district. High-end hotels, shopping (Lenox Square, Phipps Plaza), fine dining. Safer, cleaner, more expensive. MARTA accessible. Best for fans wanting premium experience away from downtown crowds.'
WHERE NOT EXISTS (SELECT 1 FROM zones WHERE zone_name = 'Buckhead');

INSERT INTO zones (city_id, zone_name, lat, long, drive_time_to_stadium, public_time_to_stadium, drive_time_to_fanfest, public_time_to_fanfest, transit_quality, hotel_density, safety_score, nightlife_score, family_score, tag, fan_vibe, parking_availability, notes)
SELECT 
  (SELECT id FROM cities WHERE name = 'Atlanta'),
  'Airport Area',
  33.6407,
  -84.4277,
  25, -- drive to stadium
  25, -- MARTA direct from airport
  30, -- drive to Centennial
  30, -- MARTA
  7,  -- transit quality
  28, -- hotel count
  7,  -- safety
  3,  -- nightlife (limited)
  7,  -- family
  'budget',
  'Convenient for late arrivals/early departures',
  'Free parking at most hotels',
  'Near Hartsfield-Jackson Airport. MARTA Gold Line connects directly to stadium and downtown. Budget-friendly option. Limited dining/entertainment but convenient for flights. Good for short stays.'
WHERE NOT EXISTS (SELECT 1 FROM zones WHERE zone_name = 'Airport Area');

-- ========================================
-- 4. Insert Zones - MIAMI
-- ========================================

INSERT INTO zones (city_id, zone_name, lat, long, drive_time_to_stadium, public_time_to_stadium, drive_time_to_fanfest, public_time_to_fanfest, transit_quality, hotel_density, safety_score, nightlife_score, family_score, tag, fan_vibe, parking_availability, notes)
SELECT 
  (SELECT id FROM cities WHERE name = 'Miami'),
  'South Beach',
  25.7907,
  -80.1300,
  35, -- drive to Hard Rock Stadium
  NULL, -- no direct public transit
  15, -- drive to Bayfront Park
  30, -- bus/metro combo
  5,  -- transit quality (poor for stadium)
  120, -- hotel count
  7,  -- safety
  10, -- nightlife (legendary)
  5,  -- family
  'premium',
  'International party destination',
  'Valet only ($40-60/day)',
  'Iconic beach and nightlife. NO direct transit to Hard Rock Stadium - requires car/Uber (~$45 each way). Best for fans prioritizing beach experience over easy stadium access. Walking distance to Fan Festival.'
WHERE NOT EXISTS (SELECT 1 FROM zones WHERE zone_name = 'South Beach');

INSERT INTO zones (city_id, zone_name, lat, long, drive_time_to_stadium, public_time_to_stadium, drive_time_to_fanfest, public_time_to_fanfest, transit_quality, hotel_density, safety_score, nightlife_score, family_score, tag, fan_vibe, parking_availability, notes)
SELECT 
  (SELECT id FROM cities WHERE name = 'Miami'),
  'Downtown Miami',
  25.7743,
  -80.1937,
  30, -- drive to stadium
  NULL, -- no direct public transit
  5,  -- walking to Bayfront Park
  5,  -- walking
  6,  -- transit quality
  68, -- hotel count
  8,  -- safety
  8,  -- nightlife
  7,  -- family
  'mid-range',
  'Central business district',
  'Parking garages ($25-40/day)',
  'Walking distance to Fan Festival at Bayfront Park. Brickell financial district nearby. Requires car/Uber to Hard Rock Stadium (30 min, ~$35). Mix of business and waterfront hotels.'
WHERE NOT EXISTS (SELECT 1 FROM zones WHERE zone_name = 'Downtown Miami');

INSERT INTO zones (city_id, zone_name, lat, long, drive_time_to_stadium, public_time_to_stadium, drive_time_to_fanfest, public_time_to_fanfest, transit_quality, hotel_density, safety_score, nightlife_score, family_score, tag, fan_vibe, parking_availability, notes)
SELECT 
  (SELECT id FROM cities WHERE name = 'Miami'),
  'Miami Gardens / Near Stadium',
  25.9420,
  -80.2456,
  10, -- drive to stadium (very close)
  NULL, -- no public transit
  40, -- drive to downtown
  NULL, -- no direct transit
  3,  -- transit quality (car essential)
  15, -- hotel count (limited)
  7,  -- safety
  4,  -- nightlife (limited)
  7,  -- family
  'budget',
  'Suburban, stadium-focused',
  'Free parking at hotels',
  'Closest to Hard Rock Stadium (10 min drive). Limited dining/entertainment options. Car absolutely necessary. Best for fans attending multiple matches who want minimal commute. Far from beach and Fan Festival.'
WHERE NOT EXISTS (SELECT 1 FROM zones WHERE zone_name = 'Miami Gardens / Near Stadium');

INSERT INTO zones (city_id, zone_name, lat, long, drive_time_to_stadium, public_time_to_stadium, drive_time_to_fanfest, public_time_to_fanfest, transit_quality, hotel_density, safety_score, nightlife_score, family_score, tag, fan_vibe, parking_availability, notes)
SELECT 
  (SELECT id FROM cities WHERE name = 'Miami'),
  'Fort Lauderdale',
  26.1224,
  -80.1373,
  25, -- drive to Hard Rock
  NULL, -- no direct transit
  35, -- drive to downtown Miami
  NULL, -- no direct transit
  4,  -- transit quality (car required)
  82, -- hotel count
  8,  -- safety
  7,  -- nightlife
  8,  -- family
  'budget',
  'Beach alternative, quieter than Miami',
  'Hotel parking usually included',
  'Alternative beach destination. Quieter and cheaper than South Beach. 25 min drive to Hard Rock Stadium. Own airport (FLL). Good for families or fans wanting beach access without Miami prices. Car required.'
WHERE NOT EXISTS (SELECT 1 FROM zones WHERE zone_name = 'Fort Lauderdale');
