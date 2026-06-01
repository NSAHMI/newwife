export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  lastActiveAt: number | null;
}

export interface AuthContextType extends AuthState {
  unlock: () => Promise<void>;
  lock: () => void;
  refreshActivity: () => void;
}
