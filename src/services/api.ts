import { 
  DomainItem, 
  Opportunity, 
  OpportunityStatus, 
  ResumeScanResult, 
  UserStreakState,
  UserNotificationPreferences,
  EmailNotificationLog,
  LocationData,
  ApiPlatformSource,
  SyncResult,
  ExternalPlatformId,
  UserProfile,
  AuthResponse
} from '../types';
import { DOMAINS, OPPORTUNITIES } from '../data/mockOpportunities';

const API_BASE = '/api';

export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem('nextgen_auth_token');
  } catch {
    return null;
  }
}

export function setStoredAuthToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem('nextgen_auth_token', token);
    } else {
      localStorage.removeItem('nextgen_auth_token');
    }
  } catch (e) {
    console.warn('LocalStorage access issue:', e);
  }
}

export function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem('nextgen_auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserProfile | null) {
  try {
    if (user) {
      localStorage.setItem('nextgen_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nextgen_auth_user');
    }
  } catch (e) {
    console.warn('LocalStorage access issue:', e);
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getStoredAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Utility to calculate Haversine distance in client fallback
 */
function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
  return parseFloat((R * c).toFixed(1));
}

/**
 * Helper to fetch with automatic quick retry and authorization headers
 */
async function fetchWithRetry(url: string, options?: RequestInit, retries: number = 1): Promise<Response> {
  try {
    const authHeaders = getAuthHeaders();
    const mergedHeaders = {
      ...authHeaders,
      ...(options?.headers || {}),
    };

    const res = await fetch(url, {
      ...options,
      headers: mergedHeaders,
    });
    return res;
  } catch (err) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 300));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
}

export async function fetchDomains(category?: string): Promise<DomainItem[]> {
  try {
    const url = category ? `${API_BASE}/domains?category=${category}` : `${API_BASE}/domains`;
    const res = await fetchWithRetry(url);
    if (res.ok) {
      const data = await res.json();
      if (data.domains && Array.isArray(data.domains)) {
        return data.domains;
      }
    }
  } catch (e) {
    console.warn('API domains fetch failed, using built-in data:', e);
  }

  // Graceful fallback
  if (category && (category === 'technical' || category === 'non-technical')) {
    return DOMAINS.filter((d) => d.category === category);
  }
  return DOMAINS;
}

export async function fetchOpportunities(params: {
  domain?: string;
  category?: string;
  type?: string;
  format?: string;
  search?: string;
  location?: string;
  radius?: number;
  lat?: number;
  lng?: number;
  country?: string;
  region?: string;
  status?: string;
  savedOnly?: boolean;
  platformSource?: string;
}): Promise<Opportunity[]> {
  try {
    const query = new URLSearchParams();
    if (params.domain && params.domain !== 'all') query.set('domain', params.domain);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.type && params.type !== 'all') query.set('type', params.type);
    if (params.format && params.format !== 'all') query.set('format', params.format);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.platformSource && params.platformSource !== 'all') query.set('platformSource', params.platformSource);
    if (params.search) query.set('search', params.search);
    if (params.location && params.location !== 'all') query.set('location', params.location);
    if (params.radius) query.set('radius', params.radius.toString());
    if (params.lat !== undefined && params.lng !== undefined && !isNaN(params.lat) && !isNaN(params.lng)) {
      query.set('lat', params.lat.toString());
      query.set('lng', params.lng.toString());
    }
    if (params.country && params.country !== 'all') query.set('country', params.country);
    if (params.savedOnly) query.set('savedOnly', 'true');

    const res = await fetchWithRetry(`${API_BASE}/opportunities?${query.toString()}`, undefined, 1);
    if (res.ok) {
      const data = await res.json();
      if (data.opportunities && Array.isArray(data.opportunities)) {
        return data.opportunities;
      }
    }
  } catch (err) {
    console.warn('API opportunities fetch failed, using local resilient engine:', err);
  }

  // Resilient Client-Side Fallback Filtering
  let results = [...OPPORTUNITIES];

  if (params.platformSource && params.platformSource !== 'all') {
    const src = params.platformSource.toLowerCase();
    results = results.filter(
      (opp) =>
        opp.externalPlatform === src ||
        (opp.source && opp.source.toLowerCase().includes(src)) ||
        opp.companyOrHost.toLowerCase().includes(src)
    );
  }

  if (params.category && params.category !== 'all') {
    results = results.filter((opp) => opp.category === params.category);
  }

  if (params.domain && params.domain !== 'all') {
    const domainIds = params.domain.split(',');
    results = results.filter((opp) => domainIds.includes(opp.domainId));
  }

  if (params.type && params.type !== 'all') {
    results = results.filter((opp) => opp.type === params.type);
  }

  if (params.format && params.format !== 'all') {
    results = results.filter((opp) => opp.format === params.format);
  }

  if (params.country && params.country !== 'all') {
    const c = params.country.toLowerCase();
    results = results.filter(
      (opp) =>
        (opp.country && opp.country.toLowerCase().includes(c)) ||
        opp.format === 'remote' ||
        (c === 'india' && opp.location.toLowerCase().includes('india'))
    );
  }

  if (params.search) {
    const q = params.search.toLowerCase().trim();
    results = results.filter(
      (opp) =>
        opp.title.toLowerCase().includes(q) ||
        opp.companyOrHost.toLowerCase().includes(q) ||
        opp.description.toLowerCase().includes(q) ||
        opp.location.toLowerCase().includes(q) ||
        (opp.city && opp.city.toLowerCase().includes(q)) ||
        opp.requiredSkills.some((s) => s.toLowerCase().includes(q))
    );
  }

  // Distance computation
  const userLat = params.lat;
  const userLng = params.lng;
  const maxRadiusKm = params.radius ? params.radius * 1.60934 : undefined;

  let enriched = results.map((opp) => {
    let distanceKm: number | undefined = undefined;
    if (userLat !== undefined && userLng !== undefined && !isNaN(userLat) && !isNaN(userLng) && opp.latitude && opp.longitude) {
      distanceKm = calculateHaversineDistanceKm(userLat, userLng, opp.latitude, opp.longitude);
    }
    return {
      ...opp,
      distanceKm,
    };
  });

  if (params.location && params.location !== 'all' && params.location !== 'Anywhere') {
    const loc = params.location.toLowerCase();
    if (loc === 'india' || loc.includes('india')) {
      enriched = enriched.filter(
        (opp) =>
          (opp.country && opp.country.toLowerCase() === 'india') ||
          opp.location.toLowerCase().includes('india') ||
          opp.format === 'remote'
      );
    } else {
      enriched = enriched.filter((opp) => {
        if (opp.format === 'remote') return true;
        const matchesName =
          opp.location.toLowerCase().includes(loc) ||
          (opp.city && opp.city.toLowerCase().includes(loc));
        if (opp.distanceKm !== undefined && maxRadiusKm) {
          return matchesName || opp.distanceKm <= maxRadiusKm;
        }
        return matchesName;
      });
    }
  }

  if (userLat !== undefined && userLng !== undefined && !isNaN(userLat) && !isNaN(userLng)) {
    enriched.sort((a, b) => {
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.distanceKm !== undefined) return -1;
      if (b.distanceKm !== undefined) return 1;
      return 0;
    });
  }

  return enriched;
}

/**
 * Live Location API Client Helpers
 */
export async function reverseGeocodeLocation(lat: number, lng: number): Promise<LocationData> {
  try {
    const res = await fetchWithRetry(`${API_BASE}/location/reverse-geocode?lat=${lat}&lng=${lng}`, undefined, 1);
    if (res.ok) {
      const data = await res.json();
      if (data.location) return data.location;
    }
  } catch (e) {
    console.warn('Reverse geocode API error, falling back:', e);
  }

  // Graceful client fallback: check nearest known hub
  const knownHubs = [
    { city: 'Bengaluru', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946 },
    { city: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.385, lng: 78.4867 },
    { city: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.5204, lng: 73.8567 },
    { city: 'Delhi NCR', state: 'Delhi', country: 'India', lat: 28.6139, lng: 77.209 },
    { city: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.076, lng: 72.8777 },
    { city: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lng: 80.2707 },
    { city: 'San Francisco', state: 'CA', country: 'USA', lat: 37.7749, lng: -122.4194 },
  ];

  let closest = knownHubs[0];
  let minD = Infinity;
  for (const hub of knownHubs) {
    const d = calculateHaversineDistanceKm(lat, lng, hub.lat, hub.lng);
    if (d < minD) {
      minD = d;
      closest = hub;
    }
  }

  return {
    city: closest.city,
    state: closest.state,
    country: closest.country,
    displayName: `${closest.city}, ${closest.state} (${closest.country})`,
    latitude: lat,
    longitude: lng,
    isLiveGps: true,
  };
}

export async function searchLocationsApi(query: string): Promise<LocationData[]> {
  try {
    const res = await fetchWithRetry(`${API_BASE}/location/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      return data.results || [];
    }
  } catch (e) {
    console.warn('Location search API error:', e);
  }
  return [];
}

export async function fetchLocationHubs(): Promise<{
  indianHubs: any[];
  globalHubs: any[];
  allHubs: any[];
}> {
  try {
    const res = await fetchWithRetry(`${API_BASE}/location/hubs`);
    if (res.ok) return res.json();
  } catch (e) {
    // ignore
  }
  return {
    indianHubs: [],
    globalHubs: [],
    allHubs: [],
  };
}

export async function detectIpLocation(): Promise<LocationData> {
  try {
    const res = await fetchWithRetry(`${API_BASE}/location/detect-ip`);
    if (res.ok) return res.json();
  } catch (e) {
    // ignore
  }
  return {
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    displayName: 'Bengaluru, Karnataka (India)',
    latitude: 12.9716,
    longitude: 77.5946,
    isLiveGps: false,
  };
}

export async function fetchOpportunityById(id: string): Promise<Opportunity> {
  try {
    const res = await fetchWithRetry(`${API_BASE}/opportunities/${id}`);
    if (res.ok) {
      const data = await res.json();
      return data.opportunity;
    }
  } catch (e) {
    // ignore
  }
  const localOpp = OPPORTUNITIES.find((o) => o.id === id);
  if (localOpp) return localOpp;
  throw new Error('Opportunity not found');
}

export async function updateOpportunityStatus(
  opportunityId: string, 
  status: OpportunityStatus,
  sendEmailAlert: boolean = true
): Promise<{ success: boolean; opportunityId: string; status: OpportunityStatus; updatedAt: string }> {
  const now = new Date().toISOString();
  try {
    const localStatuses = JSON.parse(localStorage.getItem('streakmind_statuses') || '{}');
    localStatuses[opportunityId] = status;
    localStorage.setItem('streakmind_statuses', JSON.stringify(localStatuses));
  } catch (e) {
    // ignore
  }

  try {
    const res = await fetch(`${API_BASE}/opportunities/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opportunityId, status, sendEmailAlert }),
    });
    if (res.ok) return res.json();
  } catch (e) {
    console.warn('Status update API error, preserved locally:', e);
  }

  return { success: true, opportunityId, status, updatedAt: now };
}

export async function fetchOpportunityStatuses(): Promise<Record<string, OpportunityStatus>> {
  try {
    const res = await fetch(`${API_BASE}/opportunities/statuses`);
    if (res.ok) {
      const data = await res.json();
      return data.statuses || {};
    }
  } catch (e) {
    // fallback to localStorage
  }
  try {
    return JSON.parse(localStorage.getItem('streakmind_statuses') || '{}');
  } catch {
    return {};
  }
}

export async function scanResume(
  formDataOrJson: FormData | { resumeText: string; targetDomain: string; targetOpportunityTitle?: string }
): Promise<ResumeScanResult> {
  let res: Response;
  if (formDataOrJson instanceof FormData) {
    res = await fetch(`${API_BASE}/resume/scan`, {
      method: 'POST',
      body: formDataOrJson,
    });
  } else {
    res = await fetch(`${API_BASE}/resume/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formDataOrJson),
    });
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Scan failed' }));
    throw new Error(err.error || 'Failed to scan resume');
  }

  const data = await res.json();
  return data.result;
}

export async function sendTutorChatMessage(
  message: string,
  history: Array<{ role: 'user' | 'model'; text: string }>,
  context?: {
    domain?: string;
    opportunityTitle?: string;
    opportunityDetails?: string;
    prepMode?: 'interview' | 'hackathon' | 'general' | 'resume';
  }
): Promise<{ reply: string; suggestedPrompts?: string[] }> {
  const res = await fetch(`${API_BASE}/tutor/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, context }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Tutor chat failed' }));
    throw new Error(err.error || 'Failed to reach AI Tutor');
  }

  return res.json();
}

export async function fetchUserStreak(): Promise<UserStreakState> {
  try {
    const res = await fetchWithRetry(`${API_BASE}/user/streak`);
    if (res.ok) {
      const data = await res.json();
      return data.streakState;
    }
  } catch (e) {
    console.warn('Streak fetch failed, using default state:', e);
  }

  return {
    currentStreak: 37,
    longestStreak: 45,
    todayCheckedIn: true,
    weeklyGoalDays: 5,
    daysCompletedThisWeek: 4,
    totalApplications: 12,
    totalPrepHours: 18.5,
    recentActivity: [
      { id: 'act-1', action: 'Streaked "AI Hackathon: Future City 2026"', timestamp: 'Today at 9:15 AM', icon: 'Flame' },
      { id: 'act-2', action: 'Marked "Google Summer of Code 2026" as Applied', timestamp: 'Today at 10:30 AM', icon: 'CheckCircle2' },
      { id: 'act-3', action: 'Completed AI Mock Technical Interview', timestamp: 'Yesterday at 4:30 PM', icon: 'Brain' },
    ],
  };
}

export async function checkInStreak(): Promise<UserStreakState> {
  try {
    const res = await fetch(`${API_BASE}/user/streak/checkin`, {
      method: 'POST',
    });
    if (res.ok) {
      const data = await res.json();
      return data.streakState;
    }
  } catch (e) {
    console.warn('Streak checkin error, updating locally:', e);
  }

  const current = await fetchUserStreak();
  return {
    ...current,
    currentStreak: current.currentStreak + 1,
    todayCheckedIn: true,
  };
}

export async function toggleSaveOpportunity(opportunityId: string): Promise<{ isSaved: boolean; savedCount: number; status?: OpportunityStatus }> {
  try {
    const res = await fetch(`${API_BASE}/events/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opportunityId }),
    });
    if (res.ok) return res.json();
  } catch (e) {
    console.warn('Save toggle API failed, handling locally:', e);
  }

  // Local fallback
  try {
    const saved = JSON.parse(localStorage.getItem('streakmind_saved') || '["opp-in-1", "opp-1"]');
    const set = new Set<string>(saved);
    let isSaved = false;
    if (set.has(opportunityId)) {
      set.delete(opportunityId);
      isSaved = false;
    } else {
      set.add(opportunityId);
      isSaved = true;
    }
    localStorage.setItem('streakmind_saved', JSON.stringify(Array.from(set)));
    return { isSaved, savedCount: set.size };
  } catch {
    return { isSaved: true, savedCount: 3 };
  }
}

export async function fetchSavedOpportunities(): Promise<Opportunity[]> {
  try {
    const res = await fetchWithRetry(`${API_BASE}/events/saved`);
    if (res.ok) {
      const data = await res.json();
      return data.savedOpportunities || [];
    }
  } catch (e) {
    console.warn('Fetch saved events failed, using fallback:', e);
  }

  try {
    const savedIds: string[] = JSON.parse(localStorage.getItem('streakmind_saved') || '["opp-in-1", "opp-1"]');
    return OPPORTUNITIES.filter((o) => savedIds.includes(o.id)).map((o) => ({ ...o, isSaved: true }));
  } catch {
    return OPPORTUNITIES.slice(0, 2).map((o) => ({ ...o, isSaved: true }));
  }
}

export async function fetchSchemaDocs(): Promise<{ prismaSchema: string; sqlDdl: string; seedJs: string }> {
  try {
    const res = await fetchWithRetry(`${API_BASE}/schema/sql`);
    if (res.ok) return res.json();
  } catch (e) {
    // ignore
  }
  return { prismaSchema: '', sqlDdl: '', seedJs: '' };
}

/**
 * Notification Preferences & Email Trigger Client Helpers
 */
export async function fetchNotificationPreferences(): Promise<UserNotificationPreferences> {
  try {
    const res = await fetchWithRetry(`${API_BASE}/notifications/settings`);
    if (res.ok) {
      const data = await res.json();
      return data.preferences;
    }
  } catch (e) {
    console.warn('Fetch notification preferences failed:', e);
  }
  return {
    email: 'user@example.com',
    name: 'StreakMind Innovator',
    notifyNewOpportunities: true,
    notifyDeadlineReminders: true,
    deadlineThresholdDays: 3,
    subscribedDomainIds: ['ai-ml', 'web-dev'],
  };
}

export async function saveNotificationPreferences(prefs: Partial<UserNotificationPreferences>): Promise<UserNotificationPreferences> {
  try {
    const res = await fetch(`${API_BASE}/notifications/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs),
    });
    if (res.ok) {
      const data = await res.json();
      return data.preferences;
    }
  } catch (e) {
    console.warn('Save notification preferences failed:', e);
  }
  return {
    email: prefs.email || 'user@example.com',
    name: prefs.name || 'StreakMind Innovator',
    notifyNewOpportunities: prefs.notifyNewOpportunities ?? true,
    notifyDeadlineReminders: prefs.notifyDeadlineReminders ?? true,
    deadlineThresholdDays: prefs.deadlineThresholdDays ?? 3,
    subscribedDomainIds: prefs.subscribedDomainIds ?? ['ai-ml'],
  };
}

export async function fetchNotificationLogs(): Promise<EmailNotificationLog[]> {
  try {
    const res = await fetchWithRetry(`${API_BASE}/notifications/history`);
    if (res.ok) {
      const data = await res.json();
      return data.logs || [];
    }
  } catch (e) {
    // ignore
  }
  return [];
}

export async function triggerMatchingDomainAlert(email?: string, domainId?: string): Promise<{ success: boolean; message: string; log: EmailNotificationLog }> {
  const res = await fetch(`${API_BASE}/notifications/send-matching-alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, domainId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to send alert' }));
    throw new Error(err.error || 'Failed to send matching domain alert');
  }
  return res.json();
}

export async function triggerDeadlineReminder(email?: string, thresholdDays?: number): Promise<{ success: boolean; message: string; log: EmailNotificationLog }> {
  const res = await fetch(`${API_BASE}/notifications/send-deadline-reminder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, thresholdDays }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to send deadline reminder' }));
    throw new Error(err.error || 'Failed to send deadline reminder');
  }
  return res.json();
}

export async function triggerTestEmail(email?: string): Promise<{ success: boolean; message: string; log: EmailNotificationLog }> {
  const res = await fetch(`${API_BASE}/notifications/test-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to send test email' }));
    throw new Error(err.error || 'Failed to send test email');
  }
  return res.json();
}

/**
 * External API Platform Sources & Live Synchronization Client
 */
export async function fetchConnectedApiSources(): Promise<ApiPlatformSource[]> {
  try {
    const res = await fetchWithRetry(`${API_BASE}/external/sources`);
    if (res.ok) {
      const data = await res.json();
      if (data.sources && Array.isArray(data.sources)) {
        return data.sources;
      }
    }
  } catch (err) {
    console.warn('Fetch external sources failed, using local list:', err);
  }

  return [
    {
      id: 'devpost',
      name: 'Devpost Hackathons',
      category: 'hackathon',
      brandColor: '#003E54',
      description: 'Premier global platform for in-person and online AI, Web, and Cloud hackathons.',
      apiDocsUrl: 'https://devpost.com/hackathons',
      endpoint: 'https://devpost.com/api/hackathons',
      authType: 'ATOM/RSS',
      status: 'synced',
      itemCount: 12,
      lastSynced: new Date().toISOString(),
      latencyMs: 142,
      supportedRegions: ['Global', 'USA', 'India', 'Europe'],
    },
    {
      id: 'devfolio',
      name: 'Devfolio Community',
      category: 'hackathon',
      brandColor: '#3770FF',
      description: 'India and Asia’s largest builder community for Web3, AI, and campus hackathons.',
      apiDocsUrl: 'https://devfolio.co/hackathons',
      endpoint: 'https://api.devfolio.co/graphql',
      authType: 'GraphQL',
      status: 'synced',
      itemCount: 8,
      lastSynced: new Date().toISOString(),
      latencyMs: 198,
      supportedRegions: ['India', 'Asia-Pacific', 'Remote'],
    },
    {
      id: 'mlh',
      name: 'Major League Hacking (MLH)',
      category: 'hackathon',
      brandColor: '#E73427',
      description: 'Official student hackathon league powering 200+ university competitions worldwide.',
      apiDocsUrl: 'https://mlh.io/seasons/2026/events',
      endpoint: 'https://mlh.io/api/v2/events',
      authType: 'Public Open Feed',
      status: 'synced',
      itemCount: 9,
      lastSynced: new Date().toISOString(),
      latencyMs: 165,
      supportedRegions: ['Global', 'North America', 'India', 'UK'],
    },
    {
      id: 'unstop',
      name: 'Unstop (Dare2Compete)',
      category: 'both',
      brandColor: '#1C4980',
      description: 'India’s #1 early talent platform for hiring hackathons, corporate challenges & internships.',
      apiDocsUrl: 'https://unstop.com/hackathons',
      endpoint: 'https://unstop.com/api/public/opportunity/search',
      authType: 'Public Open Feed',
      status: 'synced',
      itemCount: 15,
      lastSynced: new Date().toISOString(),
      latencyMs: 210,
      supportedRegions: ['India', 'South Asia', 'Remote'],
    },
    {
      id: 'adzuna',
      name: 'Adzuna Jobs & Internships API',
      category: 'internship',
      brandColor: '#2563EB',
      description: 'Global jobs search engine API with geo-radius distance matching and salary estimates.',
      apiDocsUrl: 'https://developer.adzuna.com/docs/search',
      endpoint: 'https://api.adzuna.com/v1/api/jobs',
      authType: 'REST API Key',
      status: 'synced',
      itemCount: 14,
      lastSynced: new Date().toISOString(),
      latencyMs: 235,
      supportedRegions: ['USA', 'India', 'UK', 'Canada', 'Australia'],
    },
    {
      id: 'remoteok',
      name: 'RemoteOK Student & Entry Tech',
      category: 'internship',
      brandColor: '#FF4742',
      description: 'High-paying worldwide remote software engineering, AI, and design internships.',
      apiDocsUrl: 'https://remoteok.com/api',
      endpoint: 'https://remoteok.com/api?tag=internship',
      authType: 'Public Open Feed',
      status: 'synced',
      itemCount: 10,
      lastSynced: new Date().toISOString(),
      latencyMs: 180,
      supportedRegions: ['Global', 'Remote (Worldwide)'],
    },
    {
      id: 'github',
      name: 'GitHub Open Opportunities',
      category: 'both',
      brandColor: '#24292E',
      description: 'Community-curated tech internships and open-source fellowship directories (GSoC, LFX, MLH Fellowship).',
      apiDocsUrl: 'https://github.com/topics/internship',
      endpoint: 'https://api.github.com/search/repositories',
      authType: 'Public Open Feed',
      status: 'synced',
      itemCount: 11,
      lastSynced: new Date().toISOString(),
      latencyMs: 155,
      supportedRegions: ['Global', 'India', 'USA'],
    }
  ];
}

export async function syncApiPlatforms(sourceId?: string): Promise<{
  report?: any;
  result?: SyncResult;
  sources: ApiPlatformSource[];
}> {
  const res = await fetch(`${API_BASE}/external/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Sync failed' }));
    throw new Error(err.error || 'Failed to sync API sources');
  }

  return res.json();
}

export async function triggerLiveOpportunitiesRefresh(): Promise<{
  total: number;
  opportunities: Opportunity[];
  sources: ApiPlatformSource[];
  report?: any;
}> {
  const res = await fetch(`${API_BASE}/opportunities/live-refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Live refresh failed' }));
    throw new Error(err.error || 'Failed to refresh live opportunities');
  }

  return res.json();
}

export async function searchExternalApis(params: {
  keyword?: string;
  platform?: string;
  category?: string;
  type?: string;
  location?: string;
}): Promise<Opportunity[]> {
  try {
    const res = await fetch(`${API_BASE}/external/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      return data.opportunities || [];
    }
  } catch (err) {
    console.warn('External API search error:', err);
  }
  return [];
}

/**
 * =========================================================
 * AUTHENTICATION & USER MANAGEMENT API
 * =========================================================
 */

export async function registerAccount(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create account');
  }

  setStoredAuthToken(data.token);
  setStoredUser(data.user);
  return data;
}

export async function loginAccount(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to sign in');
  }

  setStoredAuthToken(data.token);
  setStoredUser(data.user);
  return data;
}

export async function fetchCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const res = await fetchWithRetry(`${API_BASE}/auth/me`);
    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        setStoredUser(data.user);
        return data.user;
      }
    }
  } catch (e) {
    console.warn('Failed to fetch auth/me:', e);
  }

  return getStoredUser();
}

export async function logoutAccount(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch (e) {
    console.warn('Logout API failed:', e);
  } finally {
    setStoredAuthToken(null);
    setStoredUser(null);
  }
}

export async function resetUserStreakToZero(): Promise<UserStreakState> {
  const res = await fetch(`${API_BASE}/auth/reset-streak`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to reset streak');
  }
  return data.streakState;
}

export async function switchDemoAccount(): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/auth/switch-demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to switch to demo account');
  }
  setStoredAuthToken('tok_usr-demo-001');
  setStoredUser(data.user);
  return data.user;
}

