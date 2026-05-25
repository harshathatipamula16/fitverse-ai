import { useAuth as useContextAuth } from '../context/AuthContext.js';

/**
 * Custom React hook to access Supabase auth session, registrations and credentials
 */
export function useAuth() {
  return useContextAuth();
}
export default useAuth;
