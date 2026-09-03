import express, { Request, Response } from 'express';
import multer from 'multer';
import { DOMAINS, OPPORTUNITIES } from '../data/mockOpportunities';
import { analyzeResumeWithGemini, getAITutorResponse } from '../services/geminiService';
import { PRISMA_SCHEMA_CODE, SQL_DDL_CODE, SEED_JS_CODE } from '../data/schemaDocs';
import { UserStreakState, OpportunityStatus } from '../types';
import {
  getUserNotificationPreferences,
  updateUserNotificationPreferences,
  getNotificationLogs,
  sendMatchingDomainAlertEmail,
  sendApproachingDeadlineEmail,
  sendStatusUpdateNotificationEmail,
  sendTestEmail,
} from '../services/emailService';
import {
  POPULAR_HUBS,
  reverseGeocodeLocation,
  searchLocations,
  calculateHaversineDistance,
  findNearestHub,
} from '../services/locationService';
import { externalAggregator } from '../services/externalAggregator';
import { authService } from '../services/authService';

const router = express.Router();

// Helper to extract authenticated user profile
function getUserFromReq(req: Request) {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : undefined;
  const customUserId = req.headers['x-user-id'] as string | undefined;
  return authService.getUser(token || customUserId) || authService.getUser();
}

// Configure Multer for in-memory PDF/file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/**
 * =========================================================
 * AUTHENTICATION & USER PROFILE ROUTES
 * =========================================================
 */

/**
 * POST /api/auth/register
 * Register a new user starting with 0 streak
 */
router.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const { user, token } = authService.registerUser(name, email, password);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully with 0-day streak!',
      user,
      token,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to create account' });
  }
});

/**
 * POST /api/auth/login
 * Sign in user with email & password
 */
router.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { user, token } = authService.loginUser(email, password);
    return res.json({
      success: true,
      message: 'Logged in successfully',
      user,
      token,
    });
  } catch (error: any) {
    return res.status(401).json({ error: error.message || 'Invalid credentials' });
  }
});

/**
 * GET /api/auth/me
 * Get active user profile
 */
router.get('/auth/me', (req: Request, res: Response) => {
  try {
    const user = getUserFromReq(req);
    return res.json({
      success: true,
      user,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch user' });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/auth/logout', (req: Request, res: Response) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * POST /api/auth/reset-streak
 */
router.post('/auth/reset-streak', (req: Request, res: Response) => {
  try {
    const user = getUserFromReq(req);
    const updatedStreak = authService.resetStreak(user.id);
    return res.json({
      success: true,
      message: 'Streak has been reset to 0 days',
      streakState: updatedStreak,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to reset streak' });
  }
});

/**
 * POST /api/auth/switch-demo
 */
router.post('/auth/switch-demo', (req: Request, res: Response) => {
  try {
    const user = authService.setActiveUser('usr-demo-001');
    return res.json({
      success: true,
      user,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to switch to demo user' });
  }
});

/**
 * GET /api/domains
 * Returns all technical and non-technical categories
 */
router.get('/domains', (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  if (category && (category === 'technical' || category === 'non-technical')) {
    return res.json({
      domains: DOMAINS.filter((d) => d.category === category),
    });
  }
  return res.json({
    domains: DOMAINS,
    categories: [
      { id: 'technical', label: 'Technical Tracks', count: DOMAINS.filter((d) => d.category === 'technical').length },
      { id: 'non-technical', label: 'Non-Technical Tracks', count: DOMAINS.filter((d) => d.category === 'non-technical').length },
    ],
  });
});

/**
 * GET /api/opportunities
 * Query params: domain, category, type, format, search, location, radius, lat, lng, region, country, savedOnly, status
 */
router.get('/opportunities', (req: Request, res: Response) => {
  try {
    const {
      domain,
      category,
      type,
      format,
      search,
      location,
      radius,
      lat,
      lng,
      country,
      savedOnly,
      status,
      platformSource,
      source,
    } = req.query;

    // Combine base opportunities with live synced external opportunities (deduplicating by ID)
    const externalItems = externalAggregator.getAllExternalOpportunities();
    const existingIds = new Set(OPPORTUNITIES.map((o) => o.id));
    const allOpportunities = [...OPPORTUNITIES, ...externalItems.filter((item) => !existingIds.has(item.id))];

    let results = [...allOpportunities];

    // Filter by platform source (e.g. devpost, devfolio, mlh, unstop, adzuna, remoteok, github)
    const selectedSource = (platformSource || source) as string | undefined;
    if (selectedSource && selectedSource !== 'all') {
      const src = selectedSource.toLowerCase();
      results = results.filter(
        (opp) =>
          opp.externalPlatform === src ||
          (opp.source && opp.source.toLowerCase().includes(src)) ||
          opp.companyOrHost.toLowerCase().includes(src)
      );
    }

    const currentUser = getUserFromReq(req);
    const userSavedIds = new Set(currentUser.savedEventIds || []);
    const userStatusMap = currentUser.opportunityStatuses || {};

    if (savedOnly === 'true') {
      results = results.filter((opp) => userSavedIds.has(opp.id));
    }

    if (category && category !== 'all') {
      results = results.filter((opp) => opp.category === category);
    }

    if (domain && domain !== 'all') {
      const domainIds = Array.isArray(domain) ? (domain as string[]) : (domain as string).split(',');
      results = results.filter((opp) => domainIds.includes(opp.domainId));
    }

    if (type && type !== 'all') {
      results = results.filter((opp) => opp.type === type);
    }

    if (format && format !== 'all') {
      results = results.filter((opp) => opp.format === format);
    }

    if (status && status !== 'all') {
      results = results.filter((opp) => {
        const currentStatus = userStatusMap[opp.id]?.status || 'None';
        return currentStatus === status;
      });
    }

    // Region / Country filtering (e.g. 'india', 'usa', 'global')
    if (country && country !== 'all') {
      const c = (country as string).toLowerCase();
      results = results.filter(
        (opp) =>
          (opp.country && opp.country.toLowerCase().includes(c)) ||
          opp.format === 'remote' ||
          (c === 'india' && opp.location.toLowerCase().includes('india'))
      );
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (opp) =>
          opp.title.toLowerCase().includes(q) ||
          opp.companyOrHost.toLowerCase().includes(q) ||
          opp.description.toLowerCase().includes(q) ||
          opp.location.toLowerCase().includes(q) ||
          (opp.city && opp.city.toLowerCase().includes(q)) ||
          (opp.state && opp.state.toLowerCase().includes(q)) ||
          (opp.source && opp.source.toLowerCase().includes(q)) ||
          opp.requiredSkills.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Parse user GPS coordinates if provided
    const userLat = lat ? parseFloat(lat as string) : undefined;
    const userLng = lng ? parseFloat(lng as string) : undefined;
    const maxRadiusKm = radius ? parseFloat(radius as string) * 1.60934 : undefined; // Convert miles to km

    // Compute live distances for each opportunity
    let enriched = results.map((opp) => {
      let distanceKm: number | undefined = undefined;

      if (userLat !== undefined && userLng !== undefined && !isNaN(userLat) && !isNaN(userLng) && opp.latitude && opp.longitude) {
        distanceKm = calculateHaversineDistance(userLat, userLng, opp.latitude, opp.longitude);
      }

      const statusData = userStatusMap[opp.id];
      return {
        ...opp,
        distanceKm,
        isSaved: userSavedIds.has(opp.id),
        status: statusData?.status || 'None',
        statusUpdatedAt: statusData?.updatedAt,
      };
    });

    // Location filter by name or proximity
    if (location && typeof location === 'string' && location !== 'all' && location !== 'Anywhere' && location !== 'Remote (Worldwide)') {
      const loc = location.toLowerCase();
      // If it is 'India' or an Indian city
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
            (opp.city && opp.city.toLowerCase().includes(loc)) ||
            (opp.state && opp.state.toLowerCase().includes(loc));
          
          // If distance is available and within reasonable radius
          if (opp.distanceKm !== undefined && maxRadiusKm) {
            return matchesName || opp.distanceKm <= maxRadiusKm;
          }
          return matchesName;
        });
      }
    }

    // If user GPS is active and provided, sort by nearest distance first (with remote options preserved)
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

    return res.json({
      total: enriched.length,
      opportunities: enriched,
      userLocation: userLat && userLng && !isNaN(userLat) && !isNaN(userLng) ? { lat: userLat, lng: userLng } : null,
    });
  } catch (error: any) {
    console.error('Error fetching opportunities:', error);
    return res.status(200).json({
      total: OPPORTUNITIES.length,
      opportunities: OPPORTUNITIES,
      error: error.message,
    });
  }
});

/**
 * GET /api/external/sources
 * Returns status, metadata, endpoints and counts of all connected hackathon & internship APIs
 */
router.get('/external/sources', (req: Request, res: Response) => {
  try {
    const sources = externalAggregator.getConnectedSources();
    return res.json({
      success: true,
      sources,
      totalSources: sources.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch sources' });
  }
});

/**
 * POST /api/external/sync
 * Triggers real-time sync across connected APIs (Devpost, Devfolio, MLH, Unstop, Adzuna, RemoteOK, GitHub)
 */
router.post('/external/sync', async (req: Request, res: Response) => {
  try {
    const { sourceId } = req.body || {};
    if (sourceId && sourceId !== 'all') {
      const result = await externalAggregator.syncSource(sourceId);
      return res.json({
        success: true,
        result,
        sources: externalAggregator.getConnectedSources(),
      });
    }

    const syncReport = await externalAggregator.syncAllSources();
    return res.json({
      success: true,
      report: syncReport,
      sources: externalAggregator.getConnectedSources(),
    });
  } catch (err: any) {
    console.error('Sync error:', err);
    return res.status(500).json({ error: err.message || 'Failed to sync APIs' });
  }
});

/**
 * POST /api/opportunities/live-refresh
 * Instantly synchronizes all live external APIs and returns fresh opportunities
 */
router.post('/opportunities/live-refresh', async (req: Request, res: Response) => {
  try {
    const syncReport = await externalAggregator.syncAllSources();
    const externalItems = externalAggregator.getAllExternalOpportunities();
    const existingIds = new Set(OPPORTUNITIES.map((o) => o.id));
    const allOpportunities = [...OPPORTUNITIES, ...externalItems.filter((item) => !existingIds.has(item.id))];

    const currentUser = getUserFromReq(req);
    const userSavedIds = new Set(currentUser.savedEventIds || []);
    const userStatusMap = currentUser.opportunityStatuses || {};

    const enriched = allOpportunities.map((opp) => ({
      ...opp,
      isSaved: userSavedIds.has(opp.id),
      status: userStatusMap[opp.id]?.status || 'None',
      statusUpdatedAt: userStatusMap[opp.id]?.updatedAt,
    }));

    return res.json({
      success: true,
      total: enriched.length,
      opportunities: enriched,
      report: syncReport,
      sources: externalAggregator.getConnectedSources(),
    });
  } catch (err: any) {
    console.error('Live refresh error:', err);
    return res.status(500).json({ error: err.message || 'Failed to refresh live opportunities' });
  }
});

/**
 * POST /api/external/search
 * Search across connected external APIs
 */
router.post('/external/search', (req: Request, res: Response) => {
  try {
    const { keyword, platform, category, type, location } = req.body || {};
    const results = externalAggregator.searchExternal({
      keyword,
      platform,
      category,
      type,
      location,
    });
    return res.json({
      success: true,
      count: results.length,
      opportunities: results,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Search failed' });
  }
});

/**
 * GET /api/location/reverse-geocode
 * Reverse geocode coordinate into city, state, country
 */
router.get('/location/reverse-geocode', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Valid lat and lng query params are required' });
    }

    const locationData = await reverseGeocodeLocation(lat, lng);
    return res.json({
      success: true,
      location: locationData,
    });
  } catch (error: any) {
    console.error('Reverse geocode route error:', error);
    return res.status(500).json({ error: 'Failed to reverse geocode coordinate' });
  }
});

/**
 * GET /api/location/search
 * Autocomplete / place search for Indian cities and global tech hubs
 */
router.get('/location/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || '';
    const results = await searchLocations(q);
    return res.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error('Location search route error:', error);
    return res.status(500).json({ error: 'Failed to search locations' });
  }
});

/**
 * GET /api/location/hubs
 * Returns categorized list of popular Indian and Global hubs
 */
router.get('/location/hubs', (req: Request, res: Response) => {
  const indianHubs = POPULAR_HUBS.filter((h) => h.country === 'India');
  const globalHubs = POPULAR_HUBS.filter((h) => h.country !== 'India');

  return res.json({
    indianHubs,
    globalHubs,
    allHubs: POPULAR_HUBS,
  });
});

/**
 * GET /api/location/detect-ip
 * Detects approximate location based on client headers or default Indian/Global hub
 */
router.get('/location/detect-ip', (req: Request, res: Response) => {
  // Check common Cloudflare/AppEngine/Proxy headers
  const cfCountry = req.headers['cf-ipcountry'] as string;
  const cfCity = req.headers['cf-ipcity'] as string;
  const xForwardedFor = req.headers['x-forwarded-for'] as string;

  if (cfCity) {
    return res.json({
      city: cfCity,
      country: cfCountry || 'India',
      displayName: `${cfCity}, ${cfCountry || 'India'}`,
      isLiveGps: false,
    });
  }

  // Default to Bengaluru (India's primary Silicon Valley tech hub) for quick onboarding
  const defaultHub = POPULAR_HUBS.find((h) => h.city === 'Bengaluru') || POPULAR_HUBS[0];
  return res.json({
    city: defaultHub.city,
    state: defaultHub.state,
    country: defaultHub.country,
    displayName: `${defaultHub.city}, ${defaultHub.state} (${defaultHub.country})`,
    latitude: defaultHub.latitude,
    longitude: defaultHub.longitude,
    isLiveGps: false,
    note: 'Defaulted to Silicon Valley of India hub',
  });
});

/**
 * GET /api/opportunities/statuses
 * Returns dictionary of all tracked statuses
 */
router.get('/opportunities/statuses', (req: Request, res: Response) => {
  const currentUser = getUserFromReq(req);
  const statusObj: Record<string, OpportunityStatus> = {};
  if (currentUser.opportunityStatuses) {
    Object.entries(currentUser.opportunityStatuses).forEach(([key, val]) => {
      statusObj[key] = val.status;
    });
  }
  return res.json({ statuses: statusObj });
});

/**
 * POST /api/opportunities/status
 * Update the application status of an opportunity ('None' | 'Interested' | 'Applied' | 'Accepted')
 */
router.post('/opportunities/status', async (req: Request, res: Response) => {
  try {
    const { opportunityId, status, sendEmailAlert } = req.body;

    if (!opportunityId || !status) {
      return res.status(400).json({ error: 'opportunityId and status are required' });
    }

    const opp = OPPORTUNITIES.find((o) => o.id === opportunityId);
    if (!opp) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    const validStatuses: OpportunityStatus[] = ['None', 'Interested', 'Applied', 'Accepted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status: ${status}` });
    }

    const now = new Date().toISOString();

    const currentUser = getUserFromReq(req);
    authService.setOpportunityStatus(opportunityId, status, currentUser.id);

    // Optionally send email notification
    const prefs = getUserNotificationPreferences();
    if (sendEmailAlert !== false && (status === 'Applied' || status === 'Accepted')) {
      await sendStatusUpdateNotificationEmail(prefs.email, opp, status);
    }

    const updatedUser = authService.getUser(currentUser.id)!;
    return res.json({
      success: true,
      opportunityId,
      status,
      updatedAt: new Date().toISOString(),
      totalSaved: updatedUser.savedEventIds.length,
    });
  } catch (error: any) {
    console.error('Failed to update status:', error);
    return res.status(500).json({ error: error.message || 'Failed to update opportunity status' });
  }
});

/**
 * GET /api/opportunities/:id
 */
router.get('/opportunities/:id', (req: Request, res: Response) => {
  const opp = OPPORTUNITIES.find((o) => o.id === req.params.id);
  if (!opp) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }
  const currentUser = getUserFromReq(req);
  const statusData = currentUser.opportunityStatuses?.[opp.id];
  const isSaved = currentUser.savedEventIds?.includes(opp.id) || false;

  return res.json({
    opportunity: {
      ...opp,
      isSaved,
      status: statusData?.status || 'None',
      statusUpdatedAt: statusData?.updatedAt,
    },
  });
});

/**
 * POST /api/resume/scan
 * Accepts multipart/form-data or application/json text
 */
router.post('/resume/scan', upload.single('resumeFile'), async (req: Request, res: Response) => {
  try {
    let resumeText = '';
    const targetDomain = (req.body.targetDomain as string) || 'ai-ml';
    const targetOpportunityTitle = req.body.targetOpportunityTitle as string | undefined;
    let fileBuffer: Buffer | undefined = undefined;
    let fileMimeType: string | undefined = undefined;

    if (req.file) {
      fileBuffer = req.file.buffer;
      fileMimeType = req.file.mimetype || 'application/pdf';
      const originalName = req.file.originalname.toLowerCase();

      if (originalName.endsWith('.txt') || originalName.endsWith('.md')) {
        resumeText = fileBuffer.toString('utf-8');
      } else {
        // Extract basic ASCII printable tokens as text fallback
        const rawString = fileBuffer.toString('latin1');
        const matches = rawString.match(/[a-zA-Z0-9.,;:!?()\s@#%&'"+/=-]{4,}/g);
        resumeText = matches ? matches.join(' ') : req.file.originalname;
      }
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    } else {
      return res.status(400).json({ error: 'Please provide either resumeText or a resumeFile upload.' });
    }

    const scanResult = await analyzeResumeWithGemini(
      resumeText,
      targetDomain,
      targetOpportunityTitle,
      fileBuffer,
      fileMimeType
    );

    // Record activity for authenticated user
    const currentUser = getUserFromReq(req);
    authService.recordActivity(
      `Scanned Resume for ${targetDomain} (Score: ${scanResult.matchScore}%)`,
      'FileCheck',
      currentUser.id
    );

    return res.json({
      success: true,
      result: scanResult,
    });
  } catch (error: any) {
    console.error('Resume scan endpoint error:', error);
    return res.status(500).json({ error: error.message || 'Failed to scan resume' });
  }
});

/**
 * POST /api/tutor/chat
 * Conversational domain-specific tutor
 */
router.post('/tutor/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const tutorResult = await getAITutorResponse(
      message,
      Array.isArray(history) ? history : [],
      context
    );

    return res.json({
      success: true,
      reply: tutorResult.reply,
      suggestedPrompts: tutorResult.suggestedPrompts,
    });
  } catch (error: any) {
    console.error('Tutor chat endpoint error:', error);
    return res.status(500).json({ error: error.message || 'Failed to chat with AI Tutor' });
  }
});

/**
 * GET /api/user/streak
 */
router.get('/user/streak', (req: Request, res: Response) => {
  const currentUser = getUserFromReq(req);
  return res.json({ streakState: currentUser.streakState });
});

/**
 * POST /api/user/streak/checkin
 */
router.post('/user/streak/checkin', (req: Request, res: Response) => {
  try {
    const currentUser = getUserFromReq(req);
    const updatedStreak = authService.checkInStreak(currentUser.id);
    return res.json({
      success: true,
      streakState: updatedStreak,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to check in streak' });
  }
});

/**
 * GET /api/events/saved
 */
router.get('/events/saved', (req: Request, res: Response) => {
  const currentUser = getUserFromReq(req);
  const savedIds = new Set(currentUser.savedEventIds || []);
  const statuses = currentUser.opportunityStatuses || {};

  const savedList = OPPORTUNITIES.filter((o) => savedIds.has(o.id)).map((opp) => {
    const statusData = statuses[opp.id];
    return {
      ...opp,
      isSaved: true,
      status: statusData?.status || 'None',
      statusUpdatedAt: statusData?.updatedAt,
    };
  });
  return res.json({ savedOpportunities: savedList });
});

/**
 * POST /api/events/save
 */
router.post('/events/save', (req: Request, res: Response) => {
  const { opportunityId } = req.body;
  if (!opportunityId) {
    return res.status(400).json({ error: 'opportunityId is required' });
  }

  const opp = OPPORTUNITIES.find((o) => o.id === opportunityId);
  if (!opp) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }

  const currentUser = getUserFromReq(req);
  const result = authService.toggleSaveOpportunity(opportunityId, currentUser.id);
  const updatedUser = authService.getUser(currentUser.id)!;
  const status = updatedUser.opportunityStatuses[opportunityId]?.status || 'None';

  return res.json({
    success: true,
    isSaved: result.isSaved,
    opportunityId,
    status,
    savedCount: result.savedCount,
  });
});

/**
 * Notification Settings & Email Trigger Routes
 */

/**
 * GET /api/notifications/settings
 */
router.get('/notifications/settings', (req: Request, res: Response) => {
  const prefs = getUserNotificationPreferences();
  return res.json({ preferences: prefs });
});

/**
 * POST /api/notifications/settings
 */
router.post('/notifications/settings', (req: Request, res: Response) => {
  const updated = updateUserNotificationPreferences(req.body);
  return res.json({ success: true, preferences: updated });
});

/**
 * GET /api/notifications/history
 */
router.get('/notifications/history', (req: Request, res: Response) => {
  const logs = getNotificationLogs();
  return res.json({ logs });
});

/**
 * POST /api/notifications/send-matching-alert
 * Trigger an email alert with new opportunities matching user's selected domains
 */
router.post('/notifications/send-matching-alert', async (req: Request, res: Response) => {
  try {
    const { email, domainId } = req.body;
    const prefs = getUserNotificationPreferences();
    const targetEmail = email || prefs.email;
    const targetDomainId = domainId || prefs.subscribedDomainIds[0] || 'ai-ml';

    const domainObj = DOMAINS.find((d) => d.id === targetDomainId);
    const domainName = domainObj?.name || 'Selected Tracks';

    // Find matching opportunities
    const matching = OPPORTUNITIES.filter((o) => o.domainId === targetDomainId);
    const selectedMatching = matching.length > 0 ? matching : OPPORTUNITIES.slice(0, 3);

    const result = await sendMatchingDomainAlertEmail(targetEmail, selectedMatching, domainName);

    return res.json({
      success: true,
      message: `Email alert sent to ${targetEmail} for ${domainName}`,
      log: result.log,
    });
  } catch (error: any) {
    console.error('Matching alert error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send matching domain alert' });
  }
});

/**
 * POST /api/notifications/send-deadline-reminder
 * Trigger an email reminder for tracked/saved opportunities closing soon
 */
router.post('/notifications/send-deadline-reminder', async (req: Request, res: Response) => {
  try {
    const { email, thresholdDays } = req.body;
    const prefs = getUserNotificationPreferences();
    const targetEmail = email || prefs.email;
    const maxDays = thresholdDays || prefs.deadlineThresholdDays || 10;

    // Filter opportunities closing soon (< maxDays)
    const closingSoon = OPPORTUNITIES.filter((o) => o.daysRemaining <= maxDays);
    const selected = closingSoon.length > 0 ? closingSoon : OPPORTUNITIES.slice(0, 3);

    const result = await sendApproachingDeadlineEmail(targetEmail, selected);

    return res.json({
      success: true,
      message: `Deadline alert sent to ${targetEmail} for ${selected.length} closing opportunities`,
      log: result.log,
    });
  } catch (error: any) {
    console.error('Deadline reminder error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send deadline reminder' });
  }
});

/**
 * POST /api/notifications/test-email
 * Send a welcome/test email
 */
router.post('/notifications/test-email', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const prefs = getUserNotificationPreferences();
    const targetEmail = email || prefs.email;

    const result = await sendTestEmail(targetEmail);

    return res.json({
      success: true,
      message: `Test email dispatched to ${targetEmail}`,
      log: result.log,
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send test email' });
  }
});

/**
 * GET /api/schema/sql
 * Provides Prisma Schema, PostgreSQL DDL, and seed.js
 */
router.get('/schema/sql', (req: Request, res: Response) => {
  return res.json({
    prismaSchema: PRISMA_SCHEMA_CODE,
    sqlDdl: SQL_DDL_CODE,
    seedJs: SEED_JS_CODE,
  });
});

export default router;
