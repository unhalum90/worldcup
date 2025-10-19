#!/bin/bash

# Test the World Cup Travel Planner API
# Make sure the dev server is running first: npm run dev

echo "🧪 Testing World Cup Travel Planner API"
echo "========================================"
echo ""

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "❌ Error: Dev server is not running on localhost:3000"
    echo "   Please start it first with: npm run dev"
    exit 1
fi

echo "✓ Server is running"
echo ""
echo "📤 Sending test request..."
echo "   Scenario: 2 fans from Lisbon → Dallas + Atlanta"
echo ""

# Make the API call
RESPONSE=$(curl -s -X POST http://localhost:3000/api/travel-planner \
  -H "Content-Type: application/json" \
  -d '{
    "originCity": "Lisbon, PT",
    "originAirport": {
      "code": "LIS",
      "name": "Lisbon Portela Airport",
      "city": "Lisbon",
      "country": "PT"
    },
    "groupSize": 2,
    "children": 0,
    "seniors": 0,
    "mobilityIssues": false,
    "citiesVisiting": ["Dallas", "Atlanta"],
    "transportMode": "mixed",
    "budgetLevel": "moderate",
    "startDate": "2026-06-15",
    "endDate": "2026-06-22",
    "personalContext": "First time in USA, interested in trying local BBQ"
  }')

# Check if response contains error
if echo "$RESPONSE" | grep -q '"error"'; then
    echo "❌ API returned an error:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

# Check if response contains success
if echo "$RESPONSE" | grep -q '"success"'; then
    echo "✅ API call successful!"
    echo ""
    echo "📋 Response preview:"
    echo "$RESPONSE" | jq '.itinerary.options[0].title' 2>/dev/null || echo "Response received (jq not installed for formatting)"
    echo ""
    echo "💾 Full response saved to: api-test-response.json"
    echo "$RESPONSE" | jq '.' > api-test-response.json 2>/dev/null || echo "$RESPONSE" > api-test-response.json
else
    echo "⚠️  Unexpected response format:"
    echo "$RESPONSE"
fi
