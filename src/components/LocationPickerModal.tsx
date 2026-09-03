import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Crosshair,
  Search,
  Check,
  X,
  Compass,
  Radio,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Globe2,
  Building2,
  Sliders,
  LocateFixed
} from 'lucide-react';
import { LocationData } from '../types';
import { reverseGeocodeLocation, searchLocationsApi, fetchLocationHubs } from '../services/api';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  currentRadius: number;
  currentLat?: number;
  currentLng?: number;
  isLiveTracking?: boolean;
  selectedRegion?: 'all' | 'india' | 'us' | 'global';
  onSelectLocation: (data: {
    locationName: string;
    latitude?: number;
    longitude?: number;
    radius: number;
    isLiveTracking?: boolean;
    region?: 'all' | 'india' | 'us' | 'global';
  }) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  currentRadius,
  currentLat,
  currentLng,
  isLiveTracking = false,
  selectedRegion = 'india',
  onSelectLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [liveLocationData, setLiveLocationData] = useState<LocationData | null>(null);
  const [activeRadius, setActiveRadius] = useState<number>(currentRadius || 25);
  const [activeRegion, setActiveRegion] = useState<'all' | 'india' | 'us' | 'global'>(selectedRegion);
  const [keepLiveSync, setKeepLiveSync] = useState<boolean>(isLiveTracking);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  const watchIdRef = useRef<number | null>(null);

  // Predefined popular Indian Hubs
  const INDIAN_HUBS_BY_ZONE = {
    'South Hubs': [
      { name: 'Bengaluru, Karnataka', city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, tag: 'Silicon Valley of India' },
      { name: 'Hyderabad, Telangana', city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, tag: 'Cyberabad / HITEC City' },
      { name: 'Chennai, Tamil Nadu', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, tag: 'SaaS Capital' },
      { name: 'Kochi, Kerala', city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, tag: 'KSUM Tech Hub' },
      { name: 'Coimbatore, Tamil Nadu', city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558, tag: 'Tier-2 Tech Cluster' },
    ],
    'West Hubs': [
      { name: 'Pune, Maharashtra', city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, tag: 'Automotive & IT Hub' },
      { name: 'Mumbai, Maharashtra', city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, tag: 'FinTech Capital' },
      { name: 'Ahmedabad / GIFT City, Gujarat', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, tag: 'FinTech & Trading City' },
    ],
    'North Hubs': [
      { name: 'Delhi NCR (Gurgaon / Noida)', city: 'Delhi NCR', state: 'Delhi', lat: 28.6139, lng: 77.2090, tag: 'Startup & Unicorn Hub' },
      { name: 'Jaipur, Rajasthan', city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, tag: 'Emerging Tech Zone' },
      { name: 'Chandigarh / Mohali', city: 'Chandigarh', state: 'Punjab', lat: 30.7333, lng: 76.7794, tag: 'Tricity Innovation' },
    ],
    'East & Central': [
      { name: 'Kolkata, West Bengal', city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, tag: 'Sector V Salt Lake' },
      { name: 'Bhubaneswar, Odisha', city: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245, tag: 'Infocity Zone' },
      { name: 'Indore, Madhya Pradesh', city: 'Indore', state: 'MP', lat: 22.7196, lng: 75.8577, tag: 'Super Corridor' },
    ],
  };

  const GLOBAL_HUBS = [
    { name: 'San Francisco, CA', city: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194, tag: 'Bay Area / AI Hub' },
    { name: 'San Jose, CA', city: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863, tag: 'Silicon Valley' },
    { name: 'Seattle, WA', city: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321, tag: 'Cloud Hub' },
    { name: 'New York, NY', city: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060, tag: 'East Coast Tech' },
    { name: 'Remote (Worldwide)', city: 'Remote', state: '', lat: 0, lng: 0, tag: 'Work From Anywhere' },
  ];

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocationsApi(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Request Live Browser GPS location & reverse geocode
  const handleDetectLiveLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setGpsAccuracy(Math.round(accuracy));

        try {
          // Call reverse geocoding API to resolve coordinates to Indian place
          const locationData = await reverseGeocodeLocation(latitude, longitude);
          setLiveLocationData(locationData);
          setIsLocating(false);

          // Apply location immediately
          onSelectLocation({
            locationName: locationData.displayName || `${locationData.city}, ${locationData.country}`,
            latitude,
            longitude,
            radius: activeRadius,
            isLiveTracking: keepLiveSync,
            region: locationData.country?.toLowerCase() === 'india' ? 'india' : 'all',
          });
          onClose();
        } catch (err) {
          setIsLocating(false);
          setGpsError('Failed to fetch address details for coordinates.');
        }
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError('Location permission was denied. Please allow location access or choose an Indian city below.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsError('GPS position unavailable. Please choose your city from the list.');
            break;
          case error.TIMEOUT:
            setGpsError('Location request timed out. Retrying...');
            break;
          default:
            setGpsError('Unable to retrieve location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  const handleSelectPreset = (hub: { name: string; lat: number; lng: number }) => {
    onSelectLocation({
      locationName: hub.name,
      latitude: hub.lat !== 0 ? hub.lat : undefined,
      longitude: hub.lng !== 0 ? hub.lng : undefined,
      radius: activeRadius,
      isLiveTracking: false,
      region: activeRegion,
    });
    onClose();
  };

  const handleSelectSearchResult = (res: LocationData) => {
    onSelectLocation({
      locationName: res.displayName,
      latitude: res.latitude,
      longitude: res.longitude,
      radius: activeRadius,
      isLiveTracking: false,
      region: res.country?.toLowerCase() === 'india' ? 'india' : 'all',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/40">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Opportunity Location & Live Tracking
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  Live API
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Filter internships and hackathons in India or across the globe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          
          {/* Top Action: Live GPS Location Detection Button */}
          <div className="bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-blue-50/80 border border-indigo-100 rounded-xl p-4 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm relative">
                  <LocateFixed className={`h-5 w-5 ${isLocating ? 'animate-spin' : ''}`} />
                  {isLiveTracking && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    Use Current Live Location
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">
                      GPS + Reverse Geocoding
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {currentLat && currentLng ? (
                      <span className="font-mono text-indigo-900 font-medium">
                        Active: {currentLocation} ({currentLat.toFixed(3)}°, {currentLng.toFixed(3)}°)
                      </span>
                    ) : (
                      'Auto-detect nearest Indian tech hub and show proximity radius'
                    )}
                  </p>
                  {gpsAccuracy && (
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      ✓ GPS Precision: accurate within ~{gpsAccuracy} meters
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleDetectLiveLocation}
                disabled={isLocating}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-semibold shadow-xs transition-all shrink-0 cursor-pointer disabled:opacity-75"
              >
                {isLocating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Resolving GPS...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="h-3.5 w-3.5 fill-current" />
                    <span>Detect Live Location</span>
                  </>
                )}
              </button>
            </div>

            {gpsError && (
              <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>{gpsError}</span>
              </div>
            )}
          </div>

          {/* Search Box with Autocomplete */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Search Indian City, State, or Global Location
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type e.g., Bengaluru, Hyderabad, Pune, Mumbai, Delhi NCR, Kochi..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs text-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
              />
              {isSearching && (
                <div className="absolute right-3.5 top-3">
                  <RefreshCw className="h-4 w-4 text-indigo-600 animate-spin" />
                </div>
              )}
            </div>

            {/* Search Autocomplete Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white border border-slate-200 rounded-xl shadow-lg divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {searchResults.map((res, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-indigo-50/60 flex items-center justify-between text-xs transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                      <div>
                        <span className="font-semibold text-slate-900">{res.displayName}</span>
                        {res.country && (
                          <span className="text-[10px] text-slate-500 ml-1.5">({res.country})</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Region Tabs (India Focus vs Global) */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveRegion('india')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeRegion === 'india'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>🇮🇳 India Hubs</span>
              </button>
              <button
                onClick={() => setActiveRegion('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeRegion === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>🌍 All / Global Hubs</span>
              </button>
            </div>

            {/* Quick "Pan-India" Button */}
            <button
              onClick={() => {
                onSelectLocation({
                  locationName: 'India (Pan-India)',
                  radius: 500,
                  region: 'india',
                });
                onClose();
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              <span>Show All Across India</span>
            </button>
          </div>

          {/* Indian Tech Hubs Sections */}
          {activeRegion === 'india' ? (
            <div className="space-y-4">
              {Object.entries(INDIAN_HUBS_BY_ZONE).map(([zoneName, hubs]) => (
                <div key={zoneName}>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-slate-400" />
                    <span>{zoneName}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {hubs.map((hub) => {
                      const isSelected = currentLocation.includes(hub.city);
                      return (
                        <button
                          key={hub.name}
                          onClick={() => handleSelectPreset(hub)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer group ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold ring-1 ring-indigo-600/30'
                              : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className={`h-3.5 w-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                            <div>
                              <div className="font-semibold text-slate-900">{hub.city}</div>
                              <div className="text-[10px] text-slate-500">{hub.state} • <span className="text-indigo-600">{hub.tag}</span></div>
                            </div>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Globe2 className="h-3 w-3 text-slate-400" />
                <span>International & Remote</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {GLOBAL_HUBS.map((hub) => {
                  const isSelected = currentLocation.includes(hub.city) || (hub.name.includes('Remote') && currentLocation.includes('Remote'));
                  return (
                    <button
                      key={hub.name}
                      onClick={() => handleSelectPreset(hub)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer group ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold ring-1 ring-indigo-600/30'
                          : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className={`h-3.5 w-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                        <div>
                          <div className="font-semibold text-slate-900">{hub.name}</div>
                          <div className="text-[10px] text-slate-500">{hub.tag}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Proximity Radius Selector */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-indigo-600" />
                Search Proximity Radius:
              </span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {activeRadius >= 100 ? 'Anywhere / Pan-Country' : `${activeRadius} miles (~${Math.round(activeRadius * 1.6)} km)`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[15, 25, 50, 100].map((rad) => (
                <button
                  key={rad}
                  onClick={() => setActiveRadius(rad)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer border ${
                    activeRadius === rad
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {rad === 100 ? 'Anywhere' : `${rad} mi (${Math.round(rad * 1.6)} km)`}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-indigo-600" />
            <span>OpenStreetMap Reverse Geocoding API active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
