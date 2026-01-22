'use client';

import { usePermisos } from '@/hooks/usePermisos';
import { ReactNode } from 'react';

interface PermissionGuardProps {
  children: ReactNode;
  permiso?: string;
  permisos?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  showLoading?: boolean;
}

export function PermissionGuard({
  children,
  permiso,
  permisos,
  requireAll = false,
  fallback = null,
  showLoading = false,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermisos();

  if (loading && showLoading) {
    return <div className="animate-pulse bg-gray-200 rounded h-8 w-24" />;
  }

  if (loading) {
    return null;
  }

  let hasAccess = false;

  if (permiso) {
    hasAccess = hasPermission(permiso);
  } else if (permisos && permisos.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(permisos) : hasAnyPermission(permisos);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface CanProps {
  do: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ do: permiso, children, fallback = null }: CanProps) {
  return (
    <PermissionGuard permiso={permiso} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

interface CannotProps {
  do: string;
  children: ReactNode;
}

export function Cannot({ do: permiso, children }: CannotProps) {
  const { hasPermission, loading } = usePermisos();

  if (loading) {
    return null;
  }

  if (hasPermission(permiso)) {
    return null;
  }

  return <>{children}</>;
}
