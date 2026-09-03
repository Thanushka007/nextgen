export type TrackCategory = 'technical' | 'non-technical';
export type OpportunityType = 'internship' | 'hackathon';
export type WorkFormat = 'in-person' | 'remote' | 'hybrid';
export type OpportunityStatus = 'None' | 'Interested' | 'Applied' | 'Accepted';
export type ExternalPlatformId = 'devpost' | 'devfolio' | 'mlh' | 'unstop' | 'adzuna' | 'remoteok' | 'github' | 'streakmind' | 'all';

export interface DomainItem {
  id: string;
  name: string;
  category: TrackCategory;
  description: string;
  iconName: string;
  popularTags: string[];
  activeCount: number;
}

export interface ApiPlatformSource {
  id: string;
  name: string;
  category: 'hackathon' | 'internship' | 'both';
  brandColor: string;
  description: string;
  apiDocsUrl: string;
  endpoint: string;
  authType: 'Public Open Feed' | 'REST API Key' | 'GraphQL' | 'ATOM/RSS';
  status: 'active' | 'synced' | 'connecting';
  itemCount: number;
  lastSynced: string;
  latencyMs: number;
  supportedRegions: string[];
}

export interface SyncResult {
  sourceId: string;
  sourceName: string;
  itemsFetched: number;
  status: 'success' | 'rate_limited' | 'error';
  latencyMs: number;
  message: string;
}

export interface LocationData {
  city: string;
  state?: string;
  country: string;
  displayName: string;
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  isLiveGps?: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  type: OpportunityType;
  category: TrackCategory;
  domainId: string;
  domainName: string;
  companyOrHost: string;
  location: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  format: WorkFormat;
  radiusMiles?: number;
  distanceKm?: number;
  stipendOrPrize: string;
  stipendAmount?: number;
  deadline: string;
  daysRemaining: number;
  summary: string[];
  requiredSkills: string[];
  description: string;
  perks: string[];
  registrationUrl: string;
  source?: string;
  sourceUrl?: string;
  externalPlatform?: ExternalPlatformId;
  isHot?: boolean;
  isFeatured?: boolean;
  participantCount?: number;
  isSaved?: boolean;
  status?: OpportunityStatus;
  statusUpdatedAt?: string;
}

export interface EmailNotificationLog {
  id: string;
  recipient: string;
  subject: string;
  type: 'matching_domain' | 'deadline_reminder' | 'status_change' | 'test';
  timestamp: string;
  status: 'sent' | 'simulated';
  previewUrl?: string;
  summary: string;
  opportunityTitles?: string[];
}

export interface UserNotificationPreferences {
  email: string;
  name?: string;
  subscribedDomainIds: string[];
  notifyNewOpportunities: boolean;
  notifyDeadlineReminders: boolean;
  deadlineThresholdDays: number;
}


export interface ResumeScanResult {
  candidateName?: string;
  matchScore: number;
  targetDomain: string;
  careerReadinessLevel: 'Entry-Level' | 'Intermediate' | 'Advanced' | 'Industry-Ready';
  summaryAssessment: string;
  matchedSkills: string[];
  missingKeywords: string[];
  improvementRecommendations: string[];
  suggestedProjects: string[];
  recommendedOpportunityIds: string[];
}

export interface TutorChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
  prepMode?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: string;
  streakState: UserStreakState;
  savedEventIds: string[];
  opportunityStatuses: Record<string, { status: OpportunityStatus; updatedAt: string }>;
}

export interface AuthResponse {
  success: boolean;
  user: UserProfile;
  token: string;
  message?: string;
}

export interface UserStreakState {
  currentStreak: number;
  longestStreak: number;
  todayCheckedIn: boolean;
  weeklyGoalDays: number;
  daysCompletedThisWeek: number;
  totalApplications: number;
  totalPrepHours: number;
  recentActivity: {
    id: string;
    action: string;
    timestamp: string;
    icon: string;
  }[];
}

export type ViewMode = 'feed' | 'tutor' | 'saved' | 'scanner' | 'analytics' | 'api-explorer' | 'schema';

export interface FilterState {
  search: string;
  category: 'all' | 'technical' | 'non-technical';
  type: 'all' | 'internship' | 'hackathon';
  selectedDomainIds: string[];
  platformSource?: ExternalPlatformId;
  format: 'all' | 'in-person' | 'remote' | 'hybrid';
  location: string;
  radius: number;
  radiusUnit?: 'km' | 'miles';
  userLatitude?: number;
  userLongitude?: number;
  isLiveTracking?: boolean;
  region?: 'all' | 'india' | 'us' | 'global';
  technicalEnabled: boolean;
  nonTechnicalEnabled: boolean;
}
