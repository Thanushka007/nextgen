import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  X, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Bell, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  Zap,
  Sliders,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DomainItem, EmailNotificationLog, UserNotificationPreferences } from '../types';
import { 
  fetchNotificationPreferences, 
  saveNotificationPreferences, 
  fetchNotificationLogs,
  triggerMatchingDomainAlert, 
  triggerDeadlineReminder, 
  triggerTestEmail 
} from '../services/api';

interface EmailNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  domains: DomainItem[];
}

export const EmailNotificationModal: React.FC<EmailNotificationModalProps> = ({
  isOpen,
  onClose,
  domains,
}) => {
  const [preferences, setPreferences] = useState<UserNotificationPreferences>({
    email: 'demuduthanush@gmail.com',
    name: 'Student Builder',
    subscribedDomainIds: ['ai-ml', 'web-dev', 'product-mgmt'],
    notifyNewOpportunities: true,
    notifyDeadlineReminders: true,
    deadlineThresholdDays: 7,
  });

  const [logs, setLogs] = useState<EmailNotificationLog[]>([]);
  const [activeTab, setActiveTab] = useState<'settings' | 'trigger' | 'logs'>('settings');
  const [isSaving, setIsSaving] = useState(false);
  const [isTriggering, setIsTriggering] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [selectedDomainForAlert, setSelectedDomainForAlert] = useState('ai-ml');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [prefs, logData] = await Promise.all([
        fetchNotificationPreferences().catch(() => null),
        fetchNotificationLogs().catch(() => []),
      ]);
      if (prefs) setPreferences(prefs);
      if (logData) setLogs(logData);
    } catch (err) {
      console.error('Error loading notification data:', err);
    }
  };

  if (!isOpen) return null;

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const updated = await saveNotificationPreferences(preferences);
      setPreferences(updated);
      setStatusMessage({ text: 'Email notification preferences saved successfully!', type: 'success' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to save preferences', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDomainSubscription = (domainId: string) => {
    setPreferences((prev) => {
      const exists = prev.subscribedDomainIds.includes(domainId);
      return {
        ...prev,
        subscribedDomainIds: exists
          ? prev.subscribedDomainIds.filter((id) => id !== domainId)
          : [...prev.subscribedDomainIds, domainId],
      };
    });
  };

  const handleTriggerMatchingAlert = async () => {
    setIsTriggering('matching');
    setStatusMessage(null);
    try {
      const res = await triggerMatchingDomainAlert(preferences.email, selectedDomainForAlert);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      setStatusMessage({ text: res.message || 'Matching opportunities email sent!', type: 'success' });
      const updatedLogs = await fetchNotificationLogs();
      setLogs(updatedLogs);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to send matching domain alert', type: 'error' });
    } finally {
      setIsTriggering(null);
    }
  };

  const handleTriggerDeadlineReminder = async () => {
    setIsTriggering('deadline');
    setStatusMessage(null);
    try {
      const res = await triggerDeadlineReminder(preferences.email, preferences.deadlineThresholdDays);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      setStatusMessage({ text: res.message || 'Deadline reminder email sent!', type: 'success' });
      const updatedLogs = await fetchNotificationLogs();
      setLogs(updatedLogs);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to send deadline reminder', type: 'error' });
    } finally {
      setIsTriggering(null);
    }
  };

  const handleTriggerTestEmail = async () => {
    setIsTriggering('test');
    setStatusMessage(null);
    try {
      const res = await triggerTestEmail(preferences.email);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      setStatusMessage({ text: res.message || 'Test email dispatched!', type: 'success' });
      const updatedLogs = await fetchNotificationLogs();
      setLogs(updatedLogs);
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Failed to send test email', type: 'error' });
    } finally {
      setIsTriggering(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E2E8F0] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-[#E2E8F0] bg-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-[#94A3B8] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">
                Email Notifications & Deadline Alerts
              </h2>
              <p className="text-xs text-[#64748B]">
                Powered by Nodemailer SMTP engine for real-time domain matches & deadline countdowns
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 mt-4 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl self-start">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-white text-indigo-700 shadow-xs border border-[#E2E8F0]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Subscription Preferences
            </button>
            <button
              onClick={() => setActiveTab('trigger')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'trigger'
                  ? 'bg-white text-indigo-700 shadow-xs border border-[#E2E8F0]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Dispatch Alerts Now
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'logs'
                  ? 'bg-white text-indigo-700 shadow-xs border border-[#E2E8F0]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Sent Logs ({logs.length})
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto bg-white space-y-5">
          
          {/* Status Message Banner */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{statusMessage.text}</span>
            </div>
          )}

          {/* TAB 1: SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  required
                  value={preferences.email}
                  onChange={(e) => setPreferences({ ...preferences, email: e.target.value })}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors"
                />
                <p className="text-[11px] text-[#64748B] mt-1">
                  All automated opportunity matches and deadline warnings will be delivered to this address.
                </p>
              </div>

              {/* Subscribed Domains */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                  Subscribed Tracks & Domains (Receive new posting alerts)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {domains.map((dom) => {
                    const isSelected = preferences.subscribedDomainIds.includes(dom.id);
                    return (
                      <button
                        type="button"
                        key={dom.id}
                        onClick={() => toggleDomainSubscription(dom.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold'
                            : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{dom.name}</span>
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Threshold Days Slider */}
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0F172A]">
                    Deadline Alert Window
                  </label>
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {preferences.deadlineThresholdDays} Days Before
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={21}
                  value={preferences.deadlineThresholdDays}
                  onChange={(e) => setPreferences({ ...preferences, deadlineThresholdDays: parseInt(e.target.value, 10) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <p className="text-[11px] text-[#64748B]">
                  StreakMind will dispatch an alert when any opportunity has fewer than {preferences.deadlineThresholdDays} days left.
                </p>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-[#334155] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.notifyNewOpportunities}
                    onChange={(e) => setPreferences({ ...preferences, notifyNewOpportunities: e.target.checked })}
                    className="h-4 w-4 rounded accent-indigo-600"
                  />
                  <span>Email me when new internships & hackathons are posted for my domains</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-[#334155] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.notifyDeadlineReminders}
                    onChange={(e) => setPreferences({ ...preferences, notifyDeadlineReminders: e.target.checked })}
                    className="h-4 w-4 rounded accent-indigo-600"
                  />
                  <span>Email me urgent reminders for approaching deadlines</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2"
                >
                  {isSaving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Notification Settings</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: TRIGGER / DISPATCH NOW */}
          {activeTab === 'trigger' && (
            <div className="space-y-4">
              <p className="text-xs text-[#64748B]">
                Trigger on-demand email alerts instantly to test the backend Nodemailer notification service.
              </p>

              {/* Action 1: New Domain Match */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-xs font-bold text-[#0F172A]">New Domain Opportunities Alert</h3>
                  </div>
                  <p className="text-[11px] text-[#64748B] max-w-sm">
                    Renders an HTML email highlighting newly available roles for a specific domain track.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#475569]">Select domain:</span>
                    <select
                      value={selectedDomainForAlert}
                      onChange={(e) => setSelectedDomainForAlert(e.target.value)}
                      className="bg-white border border-[#E2E8F0] rounded-lg px-2 py-1 text-xs text-[#0F172A] focus:outline-none"
                    >
                      {domains.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleTriggerMatchingAlert}
                  disabled={isTriggering !== null}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  {isTriggering === 'matching' ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>Send Domain Alert</span>
                </button>
              </div>

              {/* Action 2: Approaching Deadlines Alert */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <h3 className="text-xs font-bold text-[#0F172A]">Approaching Deadline Warning</h3>
                  </div>
                  <p className="text-[11px] text-[#64748B] max-w-sm">
                    Scans all opportunities closing within {preferences.deadlineThresholdDays} days and sends an urgent email summary.
                  </p>
                </div>
                <button
                  onClick={handleTriggerDeadlineReminder}
                  disabled={isTriggering !== null}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  {isTriggering === 'deadline' ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                  <span>Send Deadline Alert</span>
                </button>
              </div>

              {/* Action 3: Test Welcome Email */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-xs font-bold text-[#0F172A]">Diagnostic Test Email</h3>
                  </div>
                  <p className="text-[11px] text-[#64748B] max-w-sm">
                    Tests SMTP handshake & verifies delivery to <strong>{preferences.email}</strong>.
                  </p>
                </div>
                <button
                  onClick={handleTriggerTestEmail}
                  disabled={isTriggering !== null}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  {isTriggering === 'test' ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Mail className="h-3.5 w-3.5" />
                  )}
                  <span>Send Test Email</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F172A]">Dispatched Notification History</span>
                <button
                  onClick={async () => {
                    const l = await fetchNotificationLogs();
                    setLogs(l);
                  }}
                  className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Refresh
                </button>
              </div>

              {logs.length > 0 ? (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-[#0F172A]">{log.subject}</span>
                        <span className="text-[10px] text-[#64748B] font-mono shrink-0">{log.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#475569] mb-1">
                        <span>To: <strong>{log.recipient}</strong></span>
                        <span>•</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.status === 'sent' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B]">{log.summary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <Mail className="h-6 w-6 text-[#94A3B8] mx-auto mb-2" />
                  <p className="text-xs text-[#64748B]">No notifications have been dispatched yet.</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs text-[#64748B]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Nodemailer SMTP integration active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A] font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
