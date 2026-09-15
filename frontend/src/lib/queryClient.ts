import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 0, // Fresh queries
      gcTime: 1000 * 60 * 60 * 24, // 24-hour garbage collection
      retry: 1,
    },
  },
});

/**
 * Completely purges all in-memory React Query cache and user-specific localStorage items.
 * Call this whenever a user logs out, logs in, or registers a new account.
 */
export function clearUserCache() {
  // 1. Wipe all React Query in-memory cache
  queryClient.clear();

  // 2. Wipe all user-specific cache keys from localStorage
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith("sl-cache-") ||
          key.startsWith("sl-dashboard-cache") ||
          key.startsWith("sl-quests-cache") ||
          key.startsWith("sl-profile") ||
          key.startsWith("sl-user") ||
          key.startsWith("sl-token") ||
          key.startsWith("sl-offline-")) &&
        key !== "upwise_sfx_enabled" // Preserve audio settings
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.error("Error clearing user cache:", e);
  }
}
