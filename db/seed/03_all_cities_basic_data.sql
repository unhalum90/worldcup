-- Seed Data: All 16 World Cup 2026 Host Cities
-- Basic stadium, fan fest, and airport data from CSV

-- ========================================
-- USA Cities
-- ========================================

-- Dallas / Arlington
UPDATE cities 
SET 
  stadium_name = 'AT&T Stadium',
  stadium_lat = 32.7473,
  stadium_long = -97.0945,
  fan_fest_location = 'Fair Park',
  fan_fest_lat = 32.7795,
  fan_fest_long = -96.7604,
  is_hub = TRUE,
  airport_code = 'DFW'
WHERE name = 'Dallas';

-- Kansas City
UPDATE cities 
SET 
  stadium_name = 'Arrowhead Stadium',
  stadium_lat = 39.0490,
  stadium_long = -94.4839,
  fan_fest_location = 'Union Station Fan Plaza',
  fan_fest_lat = 39.0840,
  fan_fest_long = -94.5859,
  is_hub = FALSE,
  airport_code = 'MCI'
WHERE name = 'Kansas City';

-- Houston
UPDATE cities 
SET 
  stadium_name = 'NRG Stadium',
  stadium_lat = 29.6847,
  stadium_long = -95.4107,
  fan_fest_location = 'EaDo Fan Festival',
  fan_fest_lat = 29.7485,
  fan_fest_long = -95.3517,
  is_hub = TRUE,
  airport_code = 'IAH'
WHERE name = 'Houston';

-- Atlanta
UPDATE cities 
SET 
  stadium_name = 'Mercedes-Benz Stadium',
  stadium_lat = 33.7554,
  stadium_long = -84.4008,
  fan_fest_location = 'Centennial Olympic Park',
  fan_fest_lat = 33.7603,
  fan_fest_long = -84.3938,
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
  fan_fest_lat = 25.7730,
  fan_fest_long = -80.1864,
  is_hub = TRUE,
  airport_code = 'MIA'
WHERE name = 'Miami';

-- Los Angeles
UPDATE cities 
SET 
  stadium_name = 'SoFi Stadium',
  stadium_lat = 33.9535,
  stadium_long = -118.3387,
  fan_fest_location = 'TBD Downtown LA',
  fan_fest_lat = 34.0443,
  fan_fest_long = -118.2673,
  is_hub = TRUE,
  airport_code = 'LAX'
WHERE name = 'Los Angeles';

-- San Francisco Bay Area
UPDATE cities 
SET 
  stadium_name = 'Levi''s Stadium',
  stadium_lat = 37.4030,
  stadium_long = -121.9700,
  fan_fest_location = 'Embarcadero Plaza',
  fan_fest_lat = 37.7955,
  fan_fest_long = -122.3937,
  is_hub = FALSE,
  airport_code = 'SFO'
WHERE name = 'San Francisco' OR name = 'San Francisco Bay Area';

-- Seattle
UPDATE cities 
SET 
  stadium_name = 'Lumen Field',
  stadium_lat = 47.5952,
  stadium_long = -122.3316,
  fan_fest_location = 'Seattle Center',
  fan_fest_lat = 47.6205,
  fan_fest_long = -122.3493,
  is_hub = FALSE,
  airport_code = 'SEA'
WHERE name = 'Seattle';

-- Boston
UPDATE cities 
SET 
  stadium_name = 'Gillette Stadium',
  stadium_lat = 42.0909,
  stadium_long = -71.2643,
  fan_fest_location = 'TBD Downtown Boston',
  fan_fest_lat = 42.3587,
  fan_fest_long = -71.0636,
  is_hub = FALSE,
  airport_code = 'BOS'
WHERE name = 'Boston';

-- New York / New Jersey
UPDATE cities 
SET 
  stadium_name = 'MetLife Stadium',
  stadium_lat = 40.8136,
  stadium_long = -74.0745,
  fan_fest_location = 'Liberty State Park',
  fan_fest_lat = 40.7536,
  fan_fest_long = -73.9832,
  is_hub = TRUE,
  airport_code = 'EWR'
WHERE name = 'New York' OR name = 'New York / New Jersey';

-- Philadelphia
UPDATE cities 
SET 
  stadium_name = 'Lincoln Financial Field',
  stadium_lat = 39.9008,
  stadium_long = -75.1675,
  fan_fest_location = 'Fairmont Park',
  fan_fest_lat = 39.9442,
  fan_fest_long = -75.1401,
  is_hub = FALSE,
  airport_code = 'PHL'
WHERE name = 'Philadelphia';

-- ========================================
-- Canada Cities
-- ========================================

-- Toronto
UPDATE cities 
SET 
  stadium_name = 'BMO Field',
  stadium_lat = 43.6332,
  stadium_long = -79.4180,
  fan_fest_location = 'Nathan Phillips Square',
  fan_fest_lat = 43.6526,
  fan_fest_long = -79.3832,
  is_hub = TRUE,
  airport_code = 'YYZ'
WHERE name = 'Toronto';

-- Vancouver
UPDATE cities 
SET 
  stadium_name = 'BC Place Stadium',
  stadium_lat = 49.2767,
  stadium_long = -123.1119,
  fan_fest_location = 'Jack Poole Plaza',
  fan_fest_lat = 49.2884,
  fan_fest_long = -123.1164,
  is_hub = FALSE,
  airport_code = 'YVR'
WHERE name = 'Vancouver';

-- ========================================
-- Mexico Cities
-- ========================================

-- Guadalajara
UPDATE cities 
SET 
  stadium_name = 'Estadio Akron',
  stadium_lat = 20.6737,
  stadium_long = -103.4618,
  fan_fest_location = 'Plaza de la Liberación',
  fan_fest_lat = 20.6762,
  fan_fest_long = -103.3476,
  is_hub = FALSE,
  airport_code = 'GDL'
WHERE name = 'Guadalajara';

-- Monterrey
UPDATE cities 
SET 
  stadium_name = 'Estadio BBVA',
  stadium_lat = 25.6486,
  stadium_long = -100.2899,
  fan_fest_location = 'Macroplaza',
  fan_fest_lat = 25.6709,
  fan_fest_long = -100.3090,
  is_hub = FALSE,
  airport_code = 'MTY'
WHERE name = 'Monterrey';

-- Mexico City
UPDATE cities 
SET 
  stadium_name = 'Estadio Azteca',
  stadium_lat = 19.3029,
  stadium_long = -99.1505,
  fan_fest_location = 'Zócalo',
  fan_fest_lat = 19.4326,
  fan_fest_long = -99.1332,
  is_hub = TRUE,
  airport_code = 'MEX'
WHERE name = 'Mexico City';
