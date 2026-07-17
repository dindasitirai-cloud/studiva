// PARKIR: Courses feature removed in Rekah build 1 — types kept for DashboardTier2Context compat.
export type CourseType = 'webinar' | 'video';
export type CourseStatus = 'upcoming' | 'available' | 'completed';
export type CourseVisibility = 'draft' | 'published';
export interface CourseAttachment { name: string; url: string; size?: string; }
export interface Course {
  id: string; type: CourseType; title: string; psychologist: string;
  description: string; status: CourseStatus; visibility: CourseVisibility;
  date?: string; duration: number; webinarLink?: string;
  colorTheme: 'amber' | 'sky' | 'coral' | 'green'; benefits?: string[];
  recordingUrl?: string; attachments?: CourseAttachment[]; participantCount: number;
  thumbnailUrl?: string;
}
export const COURSES: Course[] = [];
export function isVideoLike(c: Course): boolean { return c.type === 'video'; }
