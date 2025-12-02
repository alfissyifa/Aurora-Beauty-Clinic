'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '@/firebase'; // Use the central auth instance

/**
 * Hook for subscribing to the current user's authentication state.
 * @returns An object containing the user, loading state, and any error.
 */
export function useUser() {
  const auth = useAuth(); // Get auth instance from context
  const [user, setUser] = useState<import('firebase/auth').User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If auth is not ready, do nothing.
    if (!auth) {
        setIsLoading(false);
        // Optional: setError(new Error("Auth service not available."));
        return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        setIsLoading(false);
      },
      (err) => {
        console.error("useUser - Auth Error:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]); // Rerun effect if the auth instance changes

  return { user, isLoading, error };
}
