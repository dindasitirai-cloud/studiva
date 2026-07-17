import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  ACTIVITIES as STATIC_ACTIVITIES,
  WEEKLY_PLANS as STATIC_PLANS,
  EDU_TOOLS as STATIC_TOOLS,
  DOWNLOADABLES as STATIC_DOWNLOADS,
  Activity, WeeklyPlan, EduTool, Downloadable, ContentStatus,
} from '../data/learningStrategies';
import { api } from '../api/client';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// followedPlanIds is keyed by childId (or '__global__' when no child context)
const GLOBAL_KEY = '__global__';

interface SavedIds {
  activities: Set<number>;
  plans: Set<number>;
  tools: Set<number>;
  downloads: Set<number>;
}

interface LearningStrategiesContextValue {
  savedIds: SavedIds;
  doneActivityIds: Set<number>;
  ownedToolIds: Set<number>;
  downloadedIds: Set<number>;
  planProgress: Record<number, Set<number>>; // planId -> set of day indices done
  followedPlanIds: Record<string, number>;   // childId -> planId (per-child)

  toggleSaved: (type: keyof SavedIds, id: number) => void;
  isSaved: (type: keyof SavedIds, id: number) => boolean;
  totalSaved: () => number;
  toggleDone: (activityId: number) => void;
  isDone: (activityId: number) => boolean;
  doneCount: () => number;
  toggleOwned: (toolId: number) => void;
  isOwned: (toolId: number) => boolean;
  toggleDownloaded: (downloadId: number) => void;
  isDownloaded: (downloadId: number) => boolean;
  togglePlanDay: (planId: number, dayIndex: number) => void;
  isPlanDayDone: (planId: number, dayIndex: number) => boolean;
  getPlanProgress: (planId: number) => number; // 0-7
  isPlanDone: (planId: number) => boolean;     // all 7 days checked
  getFollowedPlanId: (childId?: string) => number | null;
  followPlan: (planId: number, childId?: string) => void;
  unfollowPlan: (childId?: string) => void;
  isFollowing: (planId: number, childId?: string) => boolean;

  // Managed content (admin-editable, API-backed)
  managedActivities: Activity[];
  apiLoaded: boolean; // true once first API fetch completes
  managedPlans: WeeklyPlan[];
  managedTools: EduTool[];
  managedDownloads: Downloadable[];
  adminAddActivity: (a: Omit<Activity, 'id'>) => void;
  adminUpdateActivity: (id: number, patch: Partial<Omit<Activity, 'id'>>) => void;
  adminDeleteActivity: (id: number) => void;
  adminAddPlan: (p: Omit<WeeklyPlan, 'id'>) => void;
  adminUpdatePlan: (id: number, patch: Partial<Omit<WeeklyPlan, 'id'>>) => void;
  adminDeletePlan: (id: number) => void;
  adminAddTool: (t: Omit<EduTool, 'id'>) => void;
  adminUpdateTool: (id: number, patch: Partial<Omit<EduTool, 'id'>>) => void;
  adminDeleteTool: (id: number) => void;
  adminAddDownload: (d: Omit<Downloadable, 'id'>) => void;
  adminUpdateDownload: (id: number, patch: Partial<Omit<Downloadable, 'id'>>) => void;
  adminDeleteDownload: (id: number) => void;
  adminSetStatus: (type: 'activity' | 'plan' | 'tool' | 'download', id: number, status: ContentStatus) => void;
  adminBulkSetStatus: (type: 'activities' | 'plans' | 'tools' | 'downloads', ids: number[], status: ContentStatus) => void;
  adminDuplicateActivity: (id: number) => void;
  adminDuplicatePlan: (id: number) => void;
  adminDuplicateTool: (id: number) => void;
  adminDuplicateDownload: (id: number) => void;
  adminUpdateToolLink: (id: number, affiliateUrl: string, statusLink: 'KOSONG' | 'TERPASANG' | 'PERLU_CEK' | 'MATI', tanggalCekLink: string) => void;

  // Published-only views (for user-facing pages)
  publishedActivities: Activity[];
  publishedPlans: WeeklyPlan[];
  publishedTools: EduTool[];
  publishedDownloads: Downloadable[];
}

const LearningStrategiesContext = createContext<LearningStrategiesContextValue | null>(null);

export function LearningStrategiesProvider({ children }: { children: React.ReactNode }) {
  // ── Managed content (admin-editable, API-backed) ──────────────────────────
  const [managedActivities, setManagedActivities] = useState<Activity[]>(() => STATIC_ACTIVITIES);
  const [managedPlans, setManagedPlans] = useState<WeeklyPlan[]>(() => STATIC_PLANS);
  const [managedTools, setManagedTools] = useState<EduTool[]>(() => STATIC_TOOLS);
  const [managedDownloads, setManagedDownloads] = useState<Downloadable[]>(() => STATIC_DOWNLOADS);
  const [apiLoaded, setApiLoaded] = useState(false);

  // Load from backend on mount; auto-seed if empty
  useEffect(() => {
    async function loadFromApi() {
      try {
        const [acts, plans, tools, dls] = await Promise.all([
          fetch(`${API}/api/learning-strategies/activities`).then(r => r.json()),
          fetch(`${API}/api/learning-strategies/plans`).then(r => r.json()),
          fetch(`${API}/api/learning-strategies/tools`).then(r => r.json()),
          fetch(`${API}/api/learning-strategies/downloads`).then(r => r.json()),
        ]);

        const hasData = (acts.items?.length ?? 0) + (plans.items?.length ?? 0) > 0;
        if (hasData) {
          if (acts.items?.length)  setManagedActivities(acts.items);
          if (plans.items?.length) setManagedPlans(plans.items);
          if (tools.items?.length) setManagedTools(tools.items);
          if (dls.items?.length)   setManagedDownloads(dls.items);
        }
        // else: backend empty → keep static data, admin will seed via StrategiesAdmin
        setApiLoaded(true);
      } catch {
        // backend offline → keep static data
        setApiLoaded(true);
      }
    }
    loadFromApi();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Admin: add (optimistic update + API)
  const adminAddActivity = useCallback((a: Omit<Activity, 'id'>) => {
    const newId = Math.max(0, ...managedActivities.map(x => x.id)) + 1;
    const item = { ...a, id: newId } as Activity;
    setManagedActivities(prev => [...prev, item]);
    api.post('/learning-strategies/admin/activities', item).catch(console.error);
  }, [managedActivities]);

  const adminUpdateActivity = useCallback((id: number, patch: Partial<Omit<Activity, 'id'>>) => {
    setManagedActivities(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
    api.put(`/learning-strategies/admin/activities/${id}`, patch).catch(console.error);
  }, []);

  const adminDeleteActivity = useCallback((id: number) => {
    setManagedActivities(prev => prev.filter(a => a.id !== id));
    api.delete(`/learning-strategies/admin/activities/${id}`).catch(console.error);
  }, []);

  const adminAddPlan = useCallback((p: Omit<WeeklyPlan, 'id'>) => {
    const newId = Math.max(0, ...managedPlans.map(x => x.id)) + 1;
    const item = { ...p, id: newId } as WeeklyPlan;
    setManagedPlans(prev => [...prev, item]);
    api.post('/learning-strategies/admin/plans', item).catch(console.error);
  }, [managedPlans]);

  const adminUpdatePlan = useCallback((id: number, patch: Partial<Omit<WeeklyPlan, 'id'>>) => {
    setManagedPlans(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
    api.put(`/learning-strategies/admin/plans/${id}`, patch).catch(console.error);
  }, []);

  const adminDeletePlan = useCallback((id: number) => {
    setManagedPlans(prev => prev.filter(p => p.id !== id));
    api.delete(`/learning-strategies/admin/plans/${id}`).catch(console.error);
  }, []);

  const adminAddTool = useCallback((t: Omit<EduTool, 'id'>) => {
    const newId = Math.max(0, ...managedTools.map(x => x.id)) + 1;
    const item = { ...t, id: newId } as EduTool;
    setManagedTools(prev => [...prev, item]);
    api.post('/learning-strategies/admin/tools', item).catch(console.error);
  }, [managedTools]);

  const adminUpdateTool = useCallback((id: number, patch: Partial<Omit<EduTool, 'id'>>) => {
    setManagedTools(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
    api.put(`/learning-strategies/admin/tools/${id}`, patch).catch(console.error);
  }, []);

  const adminDeleteTool = useCallback((id: number) => {
    setManagedTools(prev => prev.filter(t => t.id !== id));
    api.delete(`/learning-strategies/admin/tools/${id}`).catch(console.error);
  }, []);

  const adminAddDownload = useCallback((d: Omit<Downloadable, 'id'>) => {
    const newId = Math.max(0, ...managedDownloads.map(x => x.id)) + 1;
    const item = { ...d, id: newId } as Downloadable;
    setManagedDownloads(prev => [...prev, item]);
    api.post('/learning-strategies/admin/downloads', item).catch(console.error);
  }, [managedDownloads]);

  const adminUpdateDownload = useCallback((id: number, patch: Partial<Omit<Downloadable, 'id'>>) => {
    setManagedDownloads(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d));
    api.put(`/learning-strategies/admin/downloads/${id}`, patch).catch(console.error);
  }, []);

  const adminDeleteDownload = useCallback((id: number) => {
    setManagedDownloads(prev => prev.filter(d => d.id !== id));
    api.delete(`/learning-strategies/admin/downloads/${id}`).catch(console.error);
  }, []);

  const adminSetStatus = useCallback((type: 'activity' | 'plan' | 'tool' | 'download', id: number, status: ContentStatus) => {
    const typeMap: Record<typeof type, string> = { activity: 'activities', plan: 'plans', tool: 'tools', download: 'downloads' };
    if (type === 'activity') setManagedActivities(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    else if (type === 'plan') setManagedPlans(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    else if (type === 'tool') setManagedTools(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    else setManagedDownloads(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    api.patch(`/learning-strategies/admin/${typeMap[type]}/${id}/status`, { status }).catch(console.error);
  }, []);

  const adminBulkSetStatus = useCallback((type: 'activities' | 'plans' | 'tools' | 'downloads', ids: number[], status: ContentStatus) => {
    const idSet = new Set(ids);
    if (type === 'activities') setManagedActivities(prev => prev.map(a => idSet.has(a.id) ? { ...a, status } : a));
    else if (type === 'plans') setManagedPlans(prev => prev.map(p => idSet.has(p.id) ? { ...p, status } : p));
    else if (type === 'tools') setManagedTools(prev => prev.map(t => idSet.has(t.id) ? { ...t, status } : t));
    else setManagedDownloads(prev => prev.map(d => idSet.has(d.id) ? { ...d, status } : d));
  }, []);

  const adminDuplicateActivity = useCallback((id: number) => {
    setManagedActivities(prev => {
      const src = prev.find(a => a.id === id);
      if (!src) return prev;
      const newId = Math.max(0, ...prev.map(x => x.id)) + 1;
      return [...prev, { ...src, id: newId, status: 'draft' as ContentStatus, judul: `${src.judul} (Salinan)` }];
    });
  }, []);

  const adminDuplicatePlan = useCallback((id: number) => {
    setManagedPlans(prev => {
      const src = prev.find(p => p.id === id);
      if (!src) return prev;
      const newId = Math.max(0, ...prev.map(x => x.id)) + 1;
      return [...prev, { ...src, id: newId, status: 'draft' as ContentStatus, judul: `${src.judul} (Salinan)` }];
    });
  }, []);

  const adminDuplicateTool = useCallback((id: number) => {
    setManagedTools(prev => {
      const src = prev.find(t => t.id === id);
      if (!src) return prev;
      const newId = Math.max(0, ...prev.map(x => x.id)) + 1;
      return [...prev, { ...src, id: newId, status: 'draft' as ContentStatus, nama: `${src.nama} (Salinan)` }];
    });
  }, []);

  const adminDuplicateDownload = useCallback((id: number) => {
    setManagedDownloads(prev => {
      const src = prev.find(d => d.id === id);
      if (!src) return prev;
      const newId = Math.max(0, ...prev.map(x => x.id)) + 1;
      return [...prev, { ...src, id: newId, status: 'draft' as ContentStatus, nama: `${src.nama} (Salinan)` }];
    });
  }, []);

  const adminUpdateToolLink = useCallback((id: number, affiliateUrl: string, statusLink: 'KOSONG' | 'TERPASANG' | 'PERLU_CEK' | 'MATI', tanggalCekLink: string) => {
    setManagedTools(prev => prev.map(t => t.id === id ? { ...t, affiliateUrl, statusLink, tanggalCekLink } : t));
    api.patch(`/learning-strategies/admin/tools/${id}/link`, { affiliateUrl, statusLink, tanggalCekLink }).catch(console.error);
  }, []);

  // Published-only views — undefined or published status shows; draft/review/approved do not
  const publishedActivities = managedActivities.filter(a => a.status === 'published' || a.status === undefined);
  const publishedPlans      = managedPlans.filter(p => p.status === 'published' || p.status === undefined);
  const publishedTools      = managedTools.filter(t => t.status === 'published' || t.status === undefined);
  const publishedDownloads  = managedDownloads.filter(d => d.status === 'published' || d.status === undefined);

  // ── User interaction state ─────────────────────────────────────────────────
  const [savedIds, setSavedIds] = useState<SavedIds>({
    activities: new Set(),
    plans: new Set(),
    tools: new Set(),
    downloads: new Set(),
  });
  const [doneActivityIds, setDoneActivityIds] = useState<Set<number>>(new Set());
  const [ownedToolIds, setOwnedToolIds] = useState<Set<number>>(new Set());
  const [downloadedIds, setDownloadedIds] = useState<Set<number>>(new Set());
  const [planProgress, setPlanProgress] = useState<Record<number, Set<number>>>({});
  const [followedPlanIds, setFollowedPlanIds] = useState<Record<string, number>>({});

  const toggleSaved = useCallback((type: keyof SavedIds, id: number) => {
    setSavedIds(prev => {
      const next = { ...prev, [type]: new Set(prev[type]) };
      if (next[type].has(id)) next[type].delete(id); else next[type].add(id);
      return next;
    });
    // TODO: POST /api/learning-strategies/saved { type, id }
  }, []);

  const isSaved = useCallback((type: keyof SavedIds, id: number) => savedIds[type].has(id), [savedIds]);

  const totalSaved = useCallback(() =>
    savedIds.activities.size + savedIds.plans.size + savedIds.tools.size + savedIds.downloads.size,
  [savedIds]);

  const toggleDone = useCallback((activityId: number) => {
    setDoneActivityIds(prev => {
      const s = new Set(prev);
      if (s.has(activityId)) s.delete(activityId); else s.add(activityId);
      return s;
    });
    // TODO: POST /api/learning-strategies/done { activityId }
  }, []);

  const isDone = useCallback((activityId: number) => doneActivityIds.has(activityId), [doneActivityIds]);
  const doneCount = useCallback(() => doneActivityIds.size, [doneActivityIds]);

  const toggleOwned = useCallback((toolId: number) => {
    setOwnedToolIds(prev => {
      const s = new Set(prev);
      if (s.has(toolId)) s.delete(toolId); else s.add(toolId);
      return s;
    });
    // TODO: POST /api/learning-strategies/tools/owned { toolId }
  }, []);

  const isOwned = useCallback((toolId: number) => ownedToolIds.has(toolId), [ownedToolIds]);

  const toggleDownloaded = useCallback((downloadId: number) => {
    setDownloadedIds(prev => {
      const s = new Set(prev);
      if (s.has(downloadId)) s.delete(downloadId); else s.add(downloadId);
      return s;
    });
    // TODO: POST /api/learning-strategies/downloads/track { downloadId }
  }, []);

  const isDownloaded = useCallback((downloadId: number) => downloadedIds.has(downloadId), [downloadedIds]);

  const togglePlanDay = useCallback((planId: number, dayIndex: number) => {
    setPlanProgress(prev => {
      const existing = new Set(prev[planId] ?? []);
      if (existing.has(dayIndex)) existing.delete(dayIndex); else existing.add(dayIndex);
      return { ...prev, [planId]: existing };
    });
    // TODO: POST /api/learning-strategies/plans/progress { planId, dayIndex }
  }, []);

  const isPlanDayDone = useCallback((planId: number, dayIndex: number) =>
    planProgress[planId]?.has(dayIndex) ?? false, [planProgress]);

  const getPlanProgress = useCallback((planId: number) =>
    planProgress[planId]?.size ?? 0, [planProgress]);

  const isPlanDone = useCallback((planId: number) =>
    (planProgress[planId]?.size ?? 0) >= 7, [planProgress]);

  const getFollowedPlanId = useCallback((childId?: string): number | null => {
    const key = childId ?? GLOBAL_KEY;
    return followedPlanIds[key] ?? null;
  }, [followedPlanIds]);

  const followPlan = useCallback((planId: number, childId?: string) => {
    const key = childId ?? GLOBAL_KEY;
    setFollowedPlanIds(prev => ({ ...prev, [key]: planId }));
    // TODO: POST /api/learning-strategies/plans/follow { planId, childId }
    // TODO: schedule daily push notification reminder via backend
  }, []);

  const unfollowPlan = useCallback((childId?: string) => {
    const key = childId ?? GLOBAL_KEY;
    setFollowedPlanIds(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    // TODO: DELETE /api/learning-strategies/plans/follow { childId }
    // TODO: cancel scheduled push notifications
  }, []);

  const isFollowing = useCallback((planId: number, childId?: string) => {
    const key = childId ?? GLOBAL_KEY;
    return followedPlanIds[key] === planId;
  }, [followedPlanIds]);

  return (
    <LearningStrategiesContext.Provider value={{
      savedIds, doneActivityIds, ownedToolIds, downloadedIds, planProgress, followedPlanIds,
      toggleSaved, isSaved, totalSaved,
      toggleDone, isDone, doneCount,
      toggleOwned, isOwned,
      toggleDownloaded, isDownloaded,
      togglePlanDay, isPlanDayDone, getPlanProgress, isPlanDone,
      getFollowedPlanId, followPlan, unfollowPlan, isFollowing,
      managedActivities, managedPlans, managedTools, managedDownloads, apiLoaded,
      adminAddActivity, adminUpdateActivity, adminDeleteActivity,
      adminAddPlan, adminUpdatePlan, adminDeletePlan,
      adminAddTool, adminUpdateTool, adminDeleteTool,
      adminAddDownload, adminUpdateDownload, adminDeleteDownload,
      adminSetStatus,
      adminBulkSetStatus,
      adminDuplicateActivity, adminDuplicatePlan, adminDuplicateTool, adminDuplicateDownload,
      adminUpdateToolLink,
      publishedActivities, publishedPlans, publishedTools, publishedDownloads,
    }}>
      {children}
    </LearningStrategiesContext.Provider>
  );
}

export function useLearningStrategies() {
  const ctx = useContext(LearningStrategiesContext);
  if (!ctx) throw new Error('useLearningStrategies must be used within LearningStrategiesProvider');
  return ctx;
}
