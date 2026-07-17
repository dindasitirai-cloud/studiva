// Stub for apps/sekolah — no digital content here; types kept for DashboardTier2Context compat.
// TODO: remove once sekolah admin components (useAdminActionItems, BerandaAdmin) are decoupled from DashboardTier2Context.
export type CourseType = 'webinar' | 'video';
export type CourseStatus = 'upcoming' | 'available' | 'completed';
export type CourseVisibility = 'draft' | 'published';

export interface CourseAttachment {
  name: string;
  url: string;
  size?: string;
}

export interface Course {
  id: string;
  type: CourseType;
  title: string;
  psychologist: string;
  description: string;
  status: CourseStatus;
  visibility: CourseVisibility;
  date?: string;
  duration: number;
  webinarLink?: string;
  colorTheme: 'amber' | 'sky' | 'coral' | 'green';
  benefits?: string[];
  recordingUrl?: string;
  attachments?: CourseAttachment[];
  participantCount: number;
}

export const COURSES: Course[] = [];
