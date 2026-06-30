import { useDashboardTier2 } from '../../context/DashboardTier2Context';

export type AdminActionKind = 'forum-unanswered' | 'booking-new' | 'webinar-upcoming';

export interface AdminActionItem {
  id: string;
  kind: AdminActionKind;
  title: string;
  description: string;
  to: string;
}

// Derived directly from the SAME shared data the parent dashboards read -
// threads/bookings/courses all live in DashboardTier2Context. Nothing here
// is admin-only mock data, which is the point: it's a real reflection of
// what parents are currently doing on the shared Studiva Digital surface.
export function useAdminActionItems(): AdminActionItem[] {
  const { threads, bookings, courses } = useDashboardTier2();

  const unansweredSupportThreads = threads.filter(
    t => t.isSupportRequest && !t.replies.some(r => r.isSupport)
  );
  const newBookings = bookings.filter(b => b.status === 'pending');
  const upcomingWebinars = courses.filter(c => c.visibility === 'published' && c.type === 'webinar' && c.status === 'upcoming');

  return [
    ...unansweredSupportThreads.map(t => ({
      id: `forum-${t.id}`,
      kind: 'forum-unanswered' as const,
      title: 'Pertanyaan resmi belum dibalas',
      description: `"${t.title}" dari ${t.author}`,
      to: '/admin/forum',
    })),
    ...newBookings.map(b => ({
      id: `booking-${b.id}`,
      kind: 'booking-new' as const,
      title: 'Booking konsultasi baru',
      description: `Topik: ${b.topic}`,
      to: '/admin/konsultasi',
    })),
    ...upcomingWebinars.map(c => ({
      id: `webinar-${c.id}`,
      kind: 'webinar-upcoming' as const,
      title: 'Webinar mendatang perlu disiapkan',
      description: `${c.title} - ${c.date ?? 'jadwal belum ditentukan'}`,
      to: '/admin/courses',
    })),
  ];
}
