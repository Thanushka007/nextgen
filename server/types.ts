export type TrackCategory = 'technical' | 'non-technical';
export type OpportunityType = 'internship' | 'hackathon';
export type WorkFormat = 'in-person' | 'remote' | 'hybrid';
export type OpportunityStatus = 'None' | 'Interested' | 'Applied' | 'Accepted';
export type ExternalPlatformId = 'all' | 'devpost' | 'devfolio' | 'mlh' | 'unstop' | 'adzuna' | 'remoteok' | 'github';

export interface ApiPlatformSource {
  id: ExternalPlatformId;
  name: string;
  category: 'hackathon' | 'internship' | 'both';
  brandColor: string;
  description: string;
  apiDocsUrl: string;
  endpoint: string;
  authType: 'REST API Key' | 'GraphQL' | 'Public Open Feed' | 'ATOM/RSS';
  status: 'synced' | 'connecting' | 'idle' | 'error';
  itemCount: number;
  lastSynced?: string;
  latencyMs: number;
  supportedRegions: string[];
}

export interface SyncResult {
  sourceId: string;
  sourceName: string;
  fetchedCount: number;
  status: 'success' | 'failed';
  message: string;
  timestamp: string;
}

export interface DomainItem {
  id: string;
  name: string;
  category: TrackCategory;
  description: string;
  iconName: string;
  popularTags: string[];
  activeCount: number;
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
  isHot?: boolean;
  isFeatured?: boolean;
  participantCount?: number;
  isSaved?: boolean;
  status?: OpportunityStatus;
  statusUpdatedAt?: string;
  source?: string;
  sourceUrl?: string;
  externalPlatform?: string;
}


export interface ResumeScanResult {
  candidateName?: string;
  matchScore: number; // 0 to 100
  targetDomain: string;
  careerReadinessLevel: 'Entry-Level' | 'Intermediate' | 'Advanced' | 'Industry-Ready';
  summaryAssessment: string;
  matchedSkills: string[];
  missingKeywords: string[];
  improvementRecommendations: string[];
  suggestedProjects: string[];
  recommendedOpportunityIds: string[];
}

export interface TutorMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
  topicTag?: string;
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
