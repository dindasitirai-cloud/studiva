import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface PrivateRouteProps {
  children: ReactNode;
  roles?: UserRole[];
}

export default function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function ParentRoute({ children }: { children: ReactNode }) {
  return <PrivateRoute roles={['parent']}>{children}</PrivateRoute>;
}

export function TeacherRoute({ children }: { children: ReactNode }) {
  return <PrivateRoute roles={['teacher']}>{children}</PrivateRoute>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  return <PrivateRoute roles={['admin']}>{children}</PrivateRoute>;
}
