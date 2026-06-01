import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../hooks/useAppState';

interface BiometricGateProps {
  children: React.ReactNode;
}

export function BiometricGate({ children }: BiometricGateProps) {
  const { isAuthenticated, lock } = useAuth();

  useAppState(() => {
    lock();
  });

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
