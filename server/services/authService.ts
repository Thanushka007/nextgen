import { UserProfile, UserStreakState, OpportunityStatus } from '../types';

interface StoredUser {
  profile: UserProfile;
  passwordHash: string; // Plain/hash for auth check
}

// In-memory user database
const usersByEmail = new Map<string, StoredUser>();
const usersById = new Map<string, StoredUser>();
const tokensToUserId = new Map<string, string>();

// Seed default demo user for reference
const demoUserId = 'usr-demo-001';
const demoUserStreak: UserStreakState = {
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
    { id: 'act-4', action: 'Scanned Resume for Full-Stack Track (Match: 88%)', timestamp: '2 days ago', icon: 'FileCheck' },
    { id: 'act-5', action: 'Marked "MIT Climate Tech Hackathon" as Accepted 🎉', timestamp: '3 days ago', icon: 'Trophy' },
  ],
};

const demoProfile: UserProfile = {
  id: demoUserId,
  name: 'Alex Morgan',
  email: 'alex.morgan@stanford.edu',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  joinedAt: '2026-01-10T08:00:00.000Z',
  streakState: demoUserStreak,
  savedEventIds: ['opp-1', 'opp-3'],
  opportunityStatuses: {
    'opp-1': { status: 'Applied', updatedAt: new Date().toISOString() },
    'opp-2': { status: 'Interested', updatedAt: new Date().toISOString() },
    'opp-3': { status: 'Accepted', updatedAt: new Date().toISOString() },
    'opp-5': { status: 'Interested', updatedAt: new Date().toISOString() },
  },
};

usersByEmail.set(demoProfile.email.toLowerCase(), {
  profile: demoProfile,
  passwordHash: 'password123',
});
usersById.set(demoProfile.id, {
  profile: demoProfile,
  passwordHash: 'password123',
});

// Currently active user ID for requests without custom header
let activeUserId = demoUserId;

export const authService = {
  /**
   * Register a new user starting from 0 streak
   */
  registerUser(name: string, email: string, password: string): { user: UserProfile; token: string } {
    const normalizedEmail = email.trim().toLowerCase();
    
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Valid email address is required');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    if (usersByEmail.has(normalizedEmail)) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // STRICT REQUIREMENT: Creating account starting from 0 streak
    const initialZeroStreakState: UserStreakState = {
      currentStreak: 0,
      longestStreak: 0,
      todayCheckedIn: false,
      weeklyGoalDays: 5,
      daysCompletedThisWeek: 0,
      totalApplications: 0,
      totalPrepHours: 0,
      recentActivity: [
        {
          id: `act-${Date.now()}`,
          action: 'Account created! Starting your journey with 0-day streak',
          timestamp: 'Just now',
          icon: 'Sparkles',
        },
      ],
    };

    const newProfile: UserProfile = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      avatar: undefined,
      joinedAt: new Date().toISOString(),
      streakState: initialZeroStreakState,
      savedEventIds: [],
      opportunityStatuses: {},
    };

    const storedUser: StoredUser = {
      profile: newProfile,
      passwordHash: password,
    };

    usersByEmail.set(normalizedEmail, storedUser);
    usersById.set(userId, storedUser);

    const token = `tok_${userId}_${Date.now()}`;
    tokensToUserId.set(token, userId);
    activeUserId = userId;

    return {
      user: newProfile,
      token,
    };
  },

  /**
   * Login user with email & password
   */
  loginUser(email: string, password: string): { user: UserProfile; token: string } {
    const normalizedEmail = email.trim().toLowerCase();
    const stored = usersByEmail.get(normalizedEmail);

    if (!stored) {
      throw new Error('No account found with this email. Please create an account.');
    }

    if (stored.passwordHash !== password) {
      throw new Error('Incorrect password. Please verify and try again.');
    }

    const token = `tok_${stored.profile.id}_${Date.now()}`;
    tokensToUserId.set(token, stored.profile.id);
    activeUserId = stored.profile.id;

    return {
      user: stored.profile,
      token,
    };
  },

  /**
   * Get user by ID or token
   */
  getUser(userIdOrToken?: string): UserProfile | null {
    if (!userIdOrToken) {
      const stored = usersById.get(activeUserId);
      return stored ? stored.profile : demoProfile;
    }

    // Try direct ID
    if (usersById.has(userIdOrToken)) {
      return usersById.get(userIdOrToken)!.profile;
    }

    // Try token
    const userIdFromToken = tokensToUserId.get(userIdOrToken);
    if (userIdFromToken && usersById.has(userIdFromToken)) {
      return usersById.get(userIdFromToken)!.profile;
    }

    const fallback = usersById.get(activeUserId);
    return fallback ? fallback.profile : demoProfile;
  },

  /**
   * Set active user
   */
  setActiveUser(userId: string): UserProfile | null {
    if (usersById.has(userId)) {
      activeUserId = userId;
      return usersById.get(userId)!.profile;
    }
    return null;
  },

  /**
   * User Streak Check-In
   */
  checkInStreak(userId?: string): UserStreakState {
    const user = this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const streak = user.streakState;
    if (!streak.todayCheckedIn) {
      streak.currentStreak += 1;
      streak.todayCheckedIn = true;
      streak.daysCompletedThisWeek = Math.min(streak.weeklyGoalDays, streak.daysCompletedThisWeek + 1);
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }

      streak.recentActivity.unshift({
        id: `act-${Date.now()}`,
        action: `Daily Streak Check-in Completed (+1 Day! Now ${streak.currentStreak}d)`,
        timestamp: 'Just now',
        icon: 'Flame',
      });
    }

    return streak;
  },

  /**
   * Reset streak (for testing starting at 0 or resetting)
   */
  resetStreak(userId?: string): UserStreakState {
    const user = this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.streakState.currentStreak = 0;
    user.streakState.todayCheckedIn = false;
    user.streakState.daysCompletedThisWeek = 0;
    user.streakState.recentActivity.unshift({
      id: `act-${Date.now()}`,
      action: 'Streak reset to 0 days',
      timestamp: 'Just now',
      icon: 'RotateCcw',
    });

    return user.streakState;
  },

  /**
   * Toggle save opportunity
   */
  toggleSaveOpportunity(opportunityId: string, userId?: string): { isSaved: boolean; savedCount: number } {
    const user = this.getUser(userId);
    if (!user) throw new Error('User not found');

    const index = user.savedEventIds.indexOf(opportunityId);
    let isSaved = false;
    if (index >= 0) {
      user.savedEventIds.splice(index, 1);
      isSaved = false;
    } else {
      user.savedEventIds.push(opportunityId);
      isSaved = true;
    }

    return {
      isSaved,
      savedCount: user.savedEventIds.length,
    };
  },

  /**
   * Update opportunity status
   */
  setOpportunityStatus(opportunityId: string, status: OpportunityStatus, userId?: string) {
    const user = this.getUser(userId);
    if (!user) throw new Error('User not found');

    if (status === 'None') {
      delete user.opportunityStatuses[opportunityId];
    } else {
      user.opportunityStatuses[opportunityId] = {
        status,
        updatedAt: new Date().toISOString(),
      };
      if (status === 'Applied') {
        user.streakState.totalApplications = (user.streakState.totalApplications || 0) + 1;
      }
    }

    user.streakState.recentActivity.unshift({
      id: `act-${Date.now()}`,
      action: `Status marked as "${status}" for opportunity`,
      timestamp: 'Just now',
      icon: status === 'Accepted' ? 'Trophy' : status === 'Applied' ? 'CheckCircle2' : 'Clock',
    });

    return user.opportunityStatuses[opportunityId] || { status: 'None', updatedAt: new Date().toISOString() };
  },

  /**
   * Record activity
   */
  recordActivity(action: string, icon: string = 'Sparkles', userId?: string) {
    const user = this.getUser(userId);
    if (!user) return;

    user.streakState.recentActivity.unshift({
      id: `act-${Date.now()}`,
      action,
      timestamp: 'Just now',
      icon,
    });
  }
};
