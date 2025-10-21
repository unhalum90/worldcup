-- 02_insert_cities.sql
-- Run this after 01_create_extensions_and_tables.sql

INSERT INTO cities (id, name, slug, country, tz) VALUES
('0fd93f79-35f3-4df6-8350-03f47e3002d6', 'Boston', 'boston', 'US', 'America/New_York'),
('1fd93f79-35f3-4df6-8350-03f47e3002d7', 'Atlanta', 'atlanta', 'US', 'America/New_York'),
('2fd93f79-35f3-4df6-8350-03f47e3002d8', 'Dallas', 'dallas', 'US', 'America/Chicago'),
('3fd93f79-35f3-4df6-8350-03f47e3002d9', 'Guadalajara', 'guadalajara', 'MX', 'America/Mexico_City'),
('4fd93f79-35f3-4df6-8350-03f47e3002da', 'Houston', 'houston', 'US', 'America/Chicago'),
('5fd93f79-35f3-4df6-8350-03f47e3002db', 'Kansas City', 'kansas-city', 'US', 'America/Chicago'),
('6fd93f79-35f3-4df6-8350-03f47e3002dc', 'Los Angeles', 'los-angeles', 'US', 'America/Los_Angeles'),
('7fd93f79-35f3-4df6-8350-03f47e3002dd', 'Mexico City', 'mexico-city', 'MX', 'America/Mexico_City'),
('8fd93f79-35f3-4df6-8350-03f47e3002de', 'Miami', 'miami', 'US', 'America/New_York'),
('9fd93f79-35f3-4df6-835f-4df6-8350-03f47e3002df', 'Monterrey', 'monterrey', 'MX', 'America/Mexico_City'),
('afd93f79-35f3-4df6-8350-03f47e3002d0', 'New York', 'new-york', 'US', 'America/New_York'),
('bfd93f79-35f3-4df6-8350-03f47e3002d1', 'Philadelphia', 'philadelphia', 'US', 'America/New_York'),
('cfd93f79-35f3-4df6-8350-03f47e3002d2', 'San Francisco', 'san-francisco', 'US', 'America/Los_Angeles'),
('dfd93f79-35f3-4df6-8350-03f47e3002d3', 'Seattle', 'seattle', 'US', 'America/Los_Angeles'),
('efd93f79-35f3-4df6-8350-03f47e3002d4', 'Toronto', 'toronto', 'CA', 'America/Toronto'),
('ffd93f79-35f3-4df6-8350-03f47e3002d5', 'Vancouver', 'vancouver', 'CA', 'America/Vancouver')
ON CONFLICT (slug) DO NOTHING;
