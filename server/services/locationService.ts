import { LocationData } from '../types';

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface CityHub {
  city: string;
  state: string;
  country: string;
  region: 'India' | 'North America' | 'Global';
  latitude: number;
  longitude: number;
  popularSearchTerms: string[];
}

export const POPULAR_HUBS: CityHub[] = [
  // India - South
  {
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    region: 'India',
    latitude: 12.9716,
    longitude: 77.5946,
    popularSearchTerms: ['bangalore', 'bengaluru', 'karnataka', 'electronic city', 'whitefield', 'koramangala', 'h错r', 'bellandur', 'indiranagar'],
  },
  {
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    region: 'India',
    latitude: 17.3850,
    longitude: 78.4867,
    popularSearchTerms: ['hyderabad', 'hitec city', 'gachibowli', 'telangana', 'cyberabad', 'kondapur', 'madhapur'],
  },
  {
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    region: 'India',
    latitude: 13.0827,
    longitude: 80.2707,
    popularSearchTerms: ['chennai', 'tamil nadu', 'madras', 'omr', 'guindy', 'sholinganallur', 'tidel park'],
  },
  {
    city: 'Kochi',
    state: 'Kerala',
    country: 'India',
    region: 'India',
    latitude: 9.9312,
    longitude: 76.2673,
    popularSearchTerms: ['kochi', 'cochin', 'kerala', 'infopark', 'kakkanad', 'thiruvananthapuram', 'technopark', 'trivandrum'],
  },
  {
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    region: 'India',
    latitude: 11.0168,
    longitude: 76.9558,
    popularSearchTerms: ['coimbatore', 'kovai', 'tamil nadu', 'tidco'],
  },

  // India - West
  {
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    region: 'India',
    latitude: 18.5204,
    longitude: 73.8567,
    popularSearchTerms: ['pune', 'hinjawadi', 'magarpatta', 'viman nagar', 'kharadi', 'baner', 'maharashtra'],
  },
  {
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    region: 'India',
    latitude: 19.0760,
    longitude: 72.8777,
    popularSearchTerms: ['mumbai', 'bombay', 'bkc', 'bandra', 'andheri', 'powai', 'navi mumbai', 'thane'],
  },
  {
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    region: 'India',
    latitude: 23.0225,
    longitude: 72.5714,
    popularSearchTerms: ['ahmedabad', 'gandhinagar', 'gift city', 'gujarat', 'sanand', 'sg highway'],
  },

  // India - North
  {
    city: 'Delhi NCR',
    state: 'Delhi',
    country: 'India',
    region: 'India',
    latitude: 28.6139,
    longitude: 77.2090,
    popularSearchTerms: ['delhi', 'new delhi', 'gurugram', 'gurgaon', 'noida', 'cyber city', 'faridabad', 'ghaziabad', 'ncr'],
  },
  {
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    region: 'India',
    latitude: 26.9124,
    longitude: 75.7873,
    popularSearchTerms: ['jaipur', 'rajasthan', 'sitapura', 'malviya nagar', 'pink city'],
  },
  {
    city: 'Chandigarh',
    state: 'Punjab / Haryana',
    country: 'India',
    region: 'India',
    latitude: 30.7333,
    longitude: 76.7794,
    popularSearchTerms: ['chandigarh', 'mohali', 'panchkula', 'punjab', 'tricity'],
  },

  // India - East & Central
  {
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    region: 'India',
    latitude: 22.5726,
    longitude: 88.3639,
    popularSearchTerms: ['kolkata', 'calcutta', 'salt lake', 'sector v', 'new town', 'rajarhat', 'west bengal'],
  },
  {
    city: 'Bhubaneswar',
    state: 'Odisha',
    country: 'India',
    region: 'India',
    latitude: 20.2961,
    longitude: 85.8245,
    popularSearchTerms: ['bhubaneswar', 'odisha', 'infocity', 'patia'],
  },
  {
    city: 'Indore',
    state: 'Madhya Pradesh',
    country: 'India',
    region: 'India',
    latitude: 22.7196,
    longitude: 75.8577,
    popularSearchTerms: ['indore', 'madhya pradesh', 'vijay nagar', 'super corridor'],
  },

  // Global / US Hubs
  {
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    region: 'North America',
    latitude: 37.7749,
    longitude: -122.4194,
    popularSearchTerms: ['sf', 'san francisco', 'bay area', 'soma', 'california'],
  },
  {
    city: 'San Jose',
    state: 'CA',
    country: 'USA',
    region: 'North America',
    latitude: 37.3382,
    longitude: -121.8863,
    popularSearchTerms: ['san jose', 'silicon valley', 'sunnyvale', 'santa clara', 'mountain view', 'palo alto'],
  },
  {
    city: 'Seattle',
    state: 'WA',
    country: 'USA',
    region: 'North America',
    latitude: 47.6062,
    longitude: -122.3321,
    popularSearchTerms: ['seattle', 'bellevue', 'redmond', 'washington'],
  },
  {
    city: 'New York',
    state: 'NY',
    country: 'USA',
    region: 'North America',
    latitude: 40.7128,
    longitude: -74.0060,
    popularSearchTerms: ['nyc', 'new york', 'manhattan', 'brooklyn'],
  },
];

/**
 * Calculates distance between two GPS coordinates using Haversine formula in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Finds the nearest known popular hub from coordinate
 */
export function findNearestHub(lat: number, lng: number): { hub: CityHub; distanceKm: number } {
  let closest = POPULAR_HUBS[0];
  let minDistance = calculateHaversineDistance(lat, lng, closest.latitude, closest.longitude);

  for (let i = 1; i < POPULAR_HUBS.length; i++) {
    const d = calculateHaversineDistance(lat, lng, POPULAR_HUBS[i].latitude, POPULAR_HUBS[i].longitude);
    if (d < minDistance) {
      minDistance = d;
      closest = POPULAR_HUBS[i];
    }
  }

  return { hub: closest, distanceKm: minDistance };
}

/**
 * Reverse geocode coordinate using OpenStreetMap Nominatim with fallback to nearest hub
 */
export async function reverseGeocodeLocation(lat: number, lng: number): Promise<LocationData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'StreakMind-InternshipHackathonPortal/1.0 (contact: student-careers@streakmind.app)',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      
      const city = addr.city || addr.town || addr.municipality || addr.village || addr.suburb || addr.county || 'Detected City';
      const state = addr.state || addr.province || addr.region || '';
      const country = addr.country || (lat > 8 && lat < 38 && lng > 68 && lng < 98 ? 'India' : 'Unknown');

      const displayName = [city, state, country].filter(Boolean).join(', ');

      return {
        city,
        state,
        country,
        displayName: displayName || `${city}, ${country}`,
        latitude: lat,
        longitude: lng,
        isLiveGps: true,
      };
    }
  } catch (err) {
    console.warn('Live reverse geocoding API error / timeout, using high-accuracy hub matching:', err);
  }

  // Fallback to nearest hub
  const { hub, distanceKm } = findNearestHub(lat, lng);
  const isIndia = lat >= 6.5 && lat <= 37.5 && lng >= 68.0 && lng <= 97.5;
  const country = isIndia ? 'India' : hub.country;

  return {
    city: hub.city,
    state: hub.state,
    country,
    displayName: `${hub.city}, ${hub.state} (${country})`,
    latitude: lat,
    longitude: lng,
    isLiveGps: true,
  };
}

/**
 * Search locations by query string (autocomplete and geocoding)
 */
export async function searchLocations(query: string): Promise<LocationData[]> {
  const cleanQ = query.toLowerCase().trim();
  if (!cleanQ) return [];

  // Check local hubs first
  const matchedHubs = POPULAR_HUBS.filter(
    (h) =>
      h.city.toLowerCase().includes(cleanQ) ||
      h.state.toLowerCase().includes(cleanQ) ||
      h.country.toLowerCase().includes(cleanQ) ||
      h.popularSearchTerms.some((term) => term.includes(cleanQ))
  );

  const localResults: LocationData[] = matchedHubs.map((h) => ({
    city: h.city,
    state: h.state,
    country: h.country,
    displayName: `${h.city}, ${h.state}, ${h.country}`,
    latitude: h.latitude,
    longitude: h.longitude,
    isLiveGps: false,
  }));

  // If we have strong local matches, return them directly
  if (localResults.length >= 3) {
    return localResults;
  }

  // Otherwise query Nominatim for exact city search (prioritizing India if query has Indian context)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const isIndiaQuery = cleanQ.includes('india') || matchedHubs.some((h) => h.country === 'India');
    const countryCodes = isIndiaQuery ? 'in' : undefined;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=6&addressdetails=1${countryCodes ? `&countrycodes=${countryCodes}` : ''}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'StreakMind-InternshipHackathonPortal/1.0',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const onlineResults: LocationData[] = data.map((item: any) => {
        const addr = item.address || {};
        const city = addr.city || addr.town || addr.municipality || item.display_name.split(',')[0];
        const state = addr.state || '';
        const country = addr.country || '';
        return {
          city,
          state,
          country,
          displayName: [city, state, country].filter(Boolean).join(', ') || item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          isLiveGps: false,
        };
      });

      // Merge and deduplicate by city name
      const all = [...localResults, ...onlineResults];
      const seen = new Set<string>();
      return all.filter((item) => {
        const key = `${item.city.toLowerCase()}-${item.country.toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
  } catch (err) {
    console.warn('Online location search failed:', err);
  }

  return localResults;
}
