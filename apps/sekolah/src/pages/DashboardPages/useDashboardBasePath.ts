import { useLocation } from 'react-router-dom';

// The Studiva Digital pages (Resource Library, Courses, Learning Strategies,
// Community Forum, Konsultasi) are mounted under BOTH /dashboard/tier2 and
// /dashboard/tier1 (Sekolah Studiva parents get the same shared content/data
// via the same DashboardTier2Context, just wrapped in their own shell). Any
// internal navigation inside those shared pages must stay within whichever
// dashboard the parent is currently in, instead of hardcoding /dashboard/tier2.
export function useDashboardBasePath(): '/dashboard/tier1' | '/dashboard/tier2' {
  const location = useLocation();
  return location.pathname.startsWith('/dashboard/tier1') ? '/dashboard/tier1' : '/dashboard/tier2';
}
