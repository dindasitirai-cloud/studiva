import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface PrivateRouteProps {
  children: ReactNode;
  roles?: UserRole[];
}

export default function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { user, supabaseUser, peranStaf, loading } = useAuth();

  if (loading) return null;

  // Rekah: pengguna Supabase
  if (supabaseUser) {
    const efektif = (peranStaf ?? 'parent') as UserRole;
    if (roles && !roles.includes(efektif)) return <Navigate to="/login" replace />;
    return <>{children}</>;
  }

  // Express auth (legacy, admin, guru)
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

export function ParentRoute({ children }: { children: ReactNode }) {
  return <PrivateRoute roles={['parent']}>{children}</PrivateRoute>;
}

export function TeacherRoute({ children }: { children: ReactNode }) {
  return <PrivateRoute roles={['teacher']}>{children}</PrivateRoute>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  // Ekspres admin ATAU Supabase user dengan role 'admin'
  return <PrivateRoute roles={['admin']}>{children}</PrivateRoute>;
}

/** Route khusus staf konten Rekah: admin dan peninjau_klinis. */
export function PeninjauRoute({ children }: { children: ReactNode }) {
  const { supabaseUser, peranStaf, loading } = useAuth();
  if (loading) return null;
  if (!supabaseUser) return <Navigate to="/login" replace />;
  if (!['admin', 'peninjau_klinis'].includes(peranStaf ?? '')) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
