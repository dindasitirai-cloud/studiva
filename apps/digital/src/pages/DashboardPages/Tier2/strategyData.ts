// PARKIR: Strategies feature removed in Rekah build 1 — types kept for DashboardTier2Context compat.
import { LearningStyle } from '../../../context/DashboardTier2Context';
export const ACTIVITY_TYPES = ['Semua', 'Motorik', 'Sensorik', 'Sosial', 'Akademik', 'Komunikasi'];
export const AGE_GROUPS: string[] = [];
export interface Strategy {
  id: string; title: string; activityType: 'Motorik' | 'Sensorik' | 'Sosial' | 'Akademik' | 'Komunikasi';
  ageGroup: string; learningStyles: LearningStyle[]; summary: string;
  duration: string; materials: string[]; steps: string[]; tip: string;
  colorTheme: 'amber' | 'sky' | 'coral' | 'green'; status: 'draft' | 'published'; thumbnailUrl?: string;
}
export const STRATEGIES: Strategy[] = [];
