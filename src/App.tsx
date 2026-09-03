import React, { useState, useEffect, useRef } from 'react';
import { 
  fetchDomains, 
  fetchOpportunities, 
  fetchUserStreak, 
  checkInStreak, 
  toggleSaveOpportunity, 
  fetchSavedOpportunities,
  updateOpportunityStatus,
  reverseGeocodeLocation,
  fetchCurrentUserProfile,
  logoutAccount,
  resetUserStreakToZero,
  switchDemoAccount
} from './services/api';
import { 
  DomainItem, 
  Opportunity, 
  UserStreakState, 
  UserProfile,
  ViewMode, 
  FilterState,
  OpportunityStatus 
} from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TrackSelector } from './components/TrackSelector';
import { OpportunityFeed } from './components/OpportunityFeed';
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { StreakAnalyticsView } from './components/StreakAnalyticsView';
import { MyEventsView } from './components/MyEventsView';
import { DatabaseSchemaViewer } from './components/DatabaseSchemaViewer';
import { ApiExplorerView } from './components/ApiExplorerView';
import { EmailNotificationModal } from './components/EmailNotificationModal';
import { LocationPickerModal } from './components/LocationPickerModal';
import { AuthModal } from './components/AuthModal';
import { MapPin, Navigation, Radio, Sparkles, Flame, UserCheck } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('feed');
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedOpportunities, setSavedOpportunities] = useState<Opportunity[]>([]);
  const [streakState, setStreakState] = useState<UserStreakState | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');
  const [welcomeBanner, setWelcomeBanner] = useState<string | null>(null);

  // Filter State (Defaulting to India's Tech Capital Bengaluru with live coordinate capability)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    type: 'all',
    selectedDomainIds: [],
    format: 'all',
    location: 'Bengaluru, Karnataka',
    userLatitude: 12.9716,
    userLongitude: 77.5946,
    radius: 25,
    isLiveTracking: false,
    region: 'india',
    technicalEnabled: true,
    nonTechnicalEnabled: true,
  });

  // Modal & Drawer State
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [assistantMode, setAssistantMode] = useState<'scanner' | 'tutor'>('tutor');
  const [opportunityForPrep, setOpportunityForPrep] = useState<Opportunity | null>(null);

  const watchIdRef = useRef<number | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [domainsData, userProfile, streakData, savedData] = await Promise.all([
          fetchDomains(),
          fetchCurrentUserProfile(),
          fetchUserStreak(),
          fetchSavedOpportunities(),
        ]);
        setDomains(domainsData);
        if (userProfile) {
          setCurrentUser(userProfile);
          setStreakState(userProfile.streakState || streakData);
        } else {
          setStreakState(streakData);
        }
        setSavedOpportunities(savedData);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    }
    loadInitialData();
  }, []);

  // Handle live continuous GPS tracking if enabled
  useEffect(() => {
    if (filters.isLiveTracking && navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const locData = await reverseGeocodeLocation(latitude, longitude);
            setFilters((prev) => ({
              ...prev,
              userLatitude: latitude,
              userLongitude: longitude,
              location: locData.displayName || `${locData.city}, ${locData.state}`,
            }));
          } catch (e) {
            setFilters((prev) => ({
              ...prev,
              userLatitude: latitude,
              userLongitude: longitude,
            }));
          }
        },
        (err) => console.warn('Live location watch error:', err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );
    } else if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [filters.isLiveTracking]);

  // Fetch opportunities when filters or coordinates change
  useEffect(() => {
    async function loadOpportunities() {
      setIsLoading(true);
      try {
        let categoryParam = filters.category;
        if (!filters.technicalEnabled && filters.nonTechnicalEnabled) {
          categoryParam = 'non-technical';
        } else if (filters.technicalEnabled && !filters.nonTechnicalEnabled) {
          categoryParam = 'technical';
        }

        const data = await fetchOpportunities({
          category: categoryParam,
          domain: filters.selectedDomainIds.length > 0 ? filters.selectedDomainIds.join(',') : undefined,
          type: filters.type,
          format: filters.format,
          search: filters.search,
          location: filters.location,
          radius: filters.radius,
          lat: filters.userLatitude,
          lng: filters.userLongitude,
        });

        // Sync with saved IDs and local status overrides
        const savedMap = new Map<string, Opportunity>(savedOpportunities.map((s) => [s.id, s]));
        const synced = data.map((item) => {
          const saved = savedMap.get(item.id);
          return {
            ...item,
            isSaved: !!saved,
            status: saved?.status || item.status || 'None',
          };
        });

        setOpportunities(synced);
      } catch (err) {
        console.error('Failed to fetch opportunities:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOpportunities();
  }, [
    filters.category,
    filters.selectedDomainIds,
    filters.type,
    filters.format,
    filters.search,
    filters.location,
    filters.radius,
    filters.userLatitude,
    filters.userLongitude,
    filters.technicalEnabled,
    filters.nonTechnicalEnabled,
    savedOpportunities.length,
  ]);

  /* ------------------- INTERACTION HANDLERS ------------------- */
  const handleCheckInStreak = async () => {
    try {
      const updated = await checkInStreak();
      setStreakState(updated);
    } catch (err) {
      console.error('Streak check-in failed:', err);
    }
  };

  const handleToggleSave = async (id: string) => {
    try {
      const res = await toggleSaveOpportunity(id);
      
      // Update local opportunity state
      setOpportunities((prev) =>
        prev.map((o) => (o.id === id ? { ...o, isSaved: res.isSaved, status: res.isSaved && o.status === 'None' ? 'Interested' : o.status } : o))
      );

      if (selectedOpportunity && selectedOpportunity.id === id) {
        setSelectedOpportunity((prev) => prev ? { ...prev, isSaved: res.isSaved } : null);
      }

      // Refresh saved opportunities
      const savedList = await fetchSavedOpportunities();
      setSavedOpportunities(savedList);

      // Refresh streak state
      const streak = await fetchUserStreak();
      setStreakState(streak);
    } catch (err) {
      console.error('Save toggle error:', err);
    }
  };

  const handleUpdateStatus = async (id: string, status: OpportunityStatus) => {
    try {
      await updateOpportunityStatus(id, status);

      // Update state in main feed opportunities
      setOpportunities((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status, isSaved: status !== 'None' ? true : o.isSaved } : o))
      );

      // Update in selected modal if open
      if (selectedOpportunity && selectedOpportunity.id === id) {
        setSelectedOpportunity((prev) => prev ? { ...prev, status } : null);
      }

      // Refresh saved list
      const savedList = await fetchSavedOpportunities();
      setSavedOpportunities(savedList);

      // Refresh streak state
      const streak = await fetchUserStreak();
      setStreakState(streak);
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleOpenAITutorPrep = (opp: Opportunity) => {
    setOpportunityForPrep(opp);
    setAssistantMode('tutor');
    setIsAssistantOpen(true);
  };

  const handleOpenGeneralTutor = () => {
    setOpportunityForPrep(null);
    setAssistantMode('tutor');
    setIsAssistantOpen(true);
  };

  const handleOpenResumeScanner = () => {
    setAssistantMode('scanner');
    setIsAssistantOpen(true);
  };

  const handleToggleDomain = (domainId: string) => {
    setFilters((prev) => {
      const exists = prev.selectedDomainIds.includes(domainId);
      return {
        ...prev,
        selectedDomainIds: exists
          ? prev.selectedDomainIds.filter((id) => id !== domainId)
          : [...prev.selectedDomainIds, domainId],
      };
    });
  };

  const handleToggleTechnicalTrack = (enabled: boolean) => {
    setFilters((prev) => ({
      ...prev,
      technicalEnabled: enabled,
      selectedDomainIds: enabled ? prev.selectedDomainIds : prev.selectedDomainIds.filter((id) => {
        const d = domains.find((item) => item.id === id);
        return d?.category !== 'technical';
      }),
    }));
  };

  const handleToggleNonTechnicalTrack = (enabled: boolean) => {
    setFilters((prev) => ({
      ...prev,
      nonTechnicalEnabled: enabled,
      selectedDomainIds: enabled ? prev.selectedDomainIds : prev.selectedDomainIds.filter((id) => {
        const d = domains.find((item) => item.id === id);
        return d?.category !== 'non-technical';
      }),
    }));
  };

  const handleLocationModalSelect = (data: {
    locationName: string;
    latitude?: number;
    longitude?: number;
    radius: number;
    isLiveTracking?: boolean;
    region?: 'all' | 'india' | 'us' | 'global';
  }) => {
    setFilters((prev) => ({
      ...prev,
      location: data.locationName,
      userLatitude: data.latitude,
      userLongitude: data.longitude,
      radius: data.radius,
      isLiveTracking: !!data.isLiveTracking,
      region: data.region || 'india',
    }));
  };

  const handleAuthSuccess = async (user: UserProfile) => {
    setCurrentUser(user);
    setStreakState(user.streakState);
    if (user.streakState.currentStreak === 0) {
      setWelcomeBanner(`Welcome ${user.name}! Your account has been initialized with a clean 0-day streak. Start your journey today!`);
      setTimeout(() => setWelcomeBanner(null), 8000);
    }

    try {
      const [savedList, streakData] = await Promise.all([
        fetchSavedOpportunities(),
        fetchUserStreak(),
      ]);
      setSavedOpportunities(savedList);
      setStreakState(streakData);
    } catch (e) {
      console.warn('Failed to refresh data after auth:', e);
    }
  };

  const handleLogout = async () => {
    await logoutAccount();
    setCurrentUser(null);
    try {
      const [streak, savedList] = await Promise.all([
        fetchUserStreak(),
        fetchSavedOpportunities(),
      ]);
      setStreakState(streak);
      setSavedOpportunities(savedList);
    } catch (e) {
      console.warn('Refresh after logout error:', e);
    }
  };

  const handleResetStreak = async () => {
    try {
      const updated = await resetUserStreakToZero();
      setStreakState(updated);
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          streakState: updated,
        });
      }
      setWelcomeBanner('Your streak has been reset to 0 days. Time for a brand new streak run!');
      setTimeout(() => setWelcomeBanner(null), 6000);
    } catch (e) {
      console.error('Failed to reset streak:', e);
    }
  };

  const handleSwitchDemo = async () => {
    try {
      const demoUser = await switchDemoAccount();
      setCurrentUser(demoUser);
      setStreakState(demoUser.streakState);
      const [savedList] = await Promise.all([
        fetchSavedOpportunities(),
      ]);
      setSavedOpportunities(savedList);
      setWelcomeBanner(`Switched to Demo Account (${demoUser.name} - 37d streak)`);
      setTimeout(() => setWelcomeBanner(null), 5000);
    } catch (e) {
      console.error('Failed to switch demo account:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Dynamic Welcome / 0-Streak Toast Banner */}
      {welcomeBanner && (
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-orange-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs animate-in slide-in-from-top-2 duration-300 z-50">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
                🔥
              </span>
              <span className="font-semibold">{welcomeBanner}</span>
            </div>
            <button 
              onClick={() => setWelcomeBanner(null)}
              className="text-white/80 hover:text-white text-xs font-bold px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation Header */}
      <Header
        streakState={streakState}
        currentUser={currentUser}
        onCheckInStreak={handleCheckInStreak}
        onOpenAuth={(mode = 'signup') => {
          setAuthModalMode(mode);
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onResetStreak={handleResetStreak}
        onSwitchDemo={handleSwitchDemo}
        selectedLocation={filters.location}
        onChangeLocation={(loc) => setFilters((prev) => ({ 
          ...prev, 
          location: loc,
          isLiveTracking: false,
          userLatitude: undefined,
          userLongitude: undefined 
        }))}
        selectedFormat={filters.format}
        onChangeFormat={(fmt) => setFilters((prev) => ({ ...prev, format: fmt as any }))}
        selectedRadius={filters.radius}
        onChangeRadius={(rad) => setFilters((prev) => ({ ...prev, radius: rad }))}
        onOpenResumeScanner={handleOpenResumeScanner}
        onOpenAITutor={handleOpenGeneralTutor}
        onOpenEmailNotifications={() => setIsEmailModalOpen(true)}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        isLiveTracking={filters.isLiveTracking}
        savedCount={savedOpportunities.length}
      />

      {/* Main Content Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        
        {/* Left Sidebar (Matches Clean Minimalism Layout) */}
        <Sidebar
          currentView={currentView}
          onSelectView={(view) => {
            if (view === 'tutor') {
              handleOpenGeneralTutor();
            } else if (view === 'scanner') {
              handleOpenResumeScanner();
            } else {
              setCurrentView(view);
            }
          }}
          filters={filters}
          onToggleTechnicalTrack={handleToggleTechnicalTrack}
          onToggleNonTechnicalTrack={handleToggleNonTechnicalTrack}
          onToggleDomain={handleToggleDomain}
          onOpenEmailNotifications={() => setIsEmailModalOpen(true)}
          savedCount={savedOpportunities.length}
        />

        {/* Center / Right Dynamic Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          
          {/* FEED VIEW */}
          {currentView === 'feed' && (
            <>
              {/* Live Location Alert / Indian Cities Quick Bar */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0F172A]">
                        Live Location Active: {filters.location}
                      </span>
                      {filters.isLiveTracking && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <Radio className="h-2.5 w-2.5 text-emerald-600 animate-pulse" />
                          GPS Synced
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      Showing opportunities matching radius <span className="font-semibold text-indigo-600">{filters.radius} mi (~{Math.round(filters.radius * 1.6)} km)</span> in India & Global Hubs
                    </p>
                  </div>
                </div>

                {/* Quick Action Button: Change / Live Location */}
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Navigation className="h-3 w-3 fill-current" />
                  <span>Choose Indian Place / GPS</span>
                </button>
              </div>

              {/* Track & Domain Category Selector */}
              <TrackSelector
                domains={domains}
                selectedCategory={filters.category}
                onSelectCategory={(cat) => setFilters((prev) => ({ ...prev, category: cat }))}
                selectedDomainIds={filters.selectedDomainIds}
                onToggleDomain={handleToggleDomain}
              />

              {/* Feed Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
                    Live Opportunities in {filters.location.split(',')[0]}
                  </h1>
                  <p className="text-xs text-[#64748B] mt-1">
                    Real-time tech and non-tech internships, hackathons & accelerators across India
                  </p>
                </div>
              </div>

              {/* Opportunities Feed */}
              <OpportunityFeed
                opportunities={opportunities}
                domains={domains}
                filters={filters}
                onUpdateFilters={setFilters}
                onToggleSave={handleToggleSave}
                onUpdateStatus={handleUpdateStatus}
                onOpenAITutorPrep={handleOpenAITutorPrep}
                onSelectDetails={(opp) => setSelectedOpportunity(opp)}
                onOpenEmailNotifications={() => setIsEmailModalOpen(true)}
                onOpenApiExplorer={() => setCurrentView('api-explorer')}
                isLoading={isLoading}
              />
            </>
          )}

          {/* API EXPLORER & LIVE AGGREGATOR VIEW */}
          {currentView === 'api-explorer' && (
            <ApiExplorerView
              onSelectOpportunity={(opp) => setSelectedOpportunity(opp)}
            />
          )}

          {/* MY EVENTS / SAVED & TRACKED VIEW */}
          {currentView === 'saved' && (
            <MyEventsView
              savedOpportunities={savedOpportunities}
              onToggleSave={handleToggleSave}
              onUpdateStatus={handleUpdateStatus}
              onOpenAITutorPrep={handleOpenAITutorPrep}
              onSelectDetails={(opp) => setSelectedOpportunity(opp)}
            />
          )}

          {/* STREAK ANALYTICS VIEW */}
          {currentView === 'analytics' && (
            <StreakAnalyticsView
              streakState={streakState}
              onCheckInStreak={handleCheckInStreak}
            />
          )}

          {/* DATABASE SCHEMA & API VIEW */}
          {currentView === 'schema' && (
            <DatabaseSchemaViewer />
          )}

        </main>
      </div>

      {/* Slide-over AI Assistant Drawer (Resume Scanner & AI Tutor) */}
      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        initialMode={assistantMode}
        selectedOpportunityForPrep={opportunityForPrep}
        domains={domains}
        allOpportunities={opportunities}
        onSelectOpportunity={(opp) => {
          setIsAssistantOpen(false);
          setSelectedOpportunity(opp);
        }}
      />

      {/* Opportunity Details Modal */}
      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        onToggleSave={handleToggleSave}
        onUpdateStatus={handleUpdateStatus}
        onOpenAITutorPrep={handleOpenAITutorPrep}
      />

      {/* Email Notifications Modal (Nodemailer / SMTP / Deadline reminders) */}
      <EmailNotificationModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        domains={domains}
        opportunities={opportunities}
      />

      {/* Location Picker & Live GPS Geocoding Modal */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={filters.location}
        currentRadius={filters.radius}
        currentLat={filters.userLatitude}
        currentLng={filters.userLongitude}
        isLiveTracking={filters.isLiveTracking}
        selectedRegion={filters.region}
        onSelectLocation={handleLocationModalSelect}
      />

      {/* User Login & 0-Streak Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={handleAuthSuccess}
      />

    </div>
  );
}

