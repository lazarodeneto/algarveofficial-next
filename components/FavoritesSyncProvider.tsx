import { useFavoritesSync } from '@/hooks/useFavoritesSync';

/**
 * Component that handles syncing localStorage favorites to Supabase on login.
 * This should be rendered once at the app level.
 */
export function FavoritesSyncProvider({ children }: { children: React.ReactNode }) {
  useFavoritesSync();
  return <>{children}</>;
}
