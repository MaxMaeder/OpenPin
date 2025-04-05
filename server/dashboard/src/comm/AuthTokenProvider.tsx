import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Auth, onIdTokenChanged, User } from "firebase/auth";
import { jwtDecode } from "jwt-decode";

interface AuthTokenContextType {
  user: User | null;
  idToken: string | null;
  loading: boolean;
  error?: Error;
}

const AuthTokenContext = createContext<AuthTokenContextType | undefined>(undefined);

interface AuthTokenProviderProps {
  auth: Auth;
  children: React.ReactNode;
}

export const AuthTokenProvider: React.FC<AuthTokenProviderProps> = ({ auth, children }) => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  // Reference to store the refresh timer
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleTokenRefresh = (token: string) => {
    try {
      const { exp } = jwtDecode<{ exp: number }>(token);
      const expiresAt = exp * 1000;
      const now = Date.now();
      const buffer = 5 * 60 * 1000; // 5 minutes buffer
      const refreshIn = expiresAt - now - buffer;

      // Clear any previously set timer
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      if (refreshIn > 0) {
        refreshTimeoutRef.current = setTimeout(async () => {
          if (auth.currentUser) {
            try {
              // Force refresh the token
              const newToken = await auth.currentUser.getIdToken(true);
              setIdToken(newToken);
              // Reset the timer with the new token's expiration time
              scheduleTokenRefresh(newToken);
            } catch (err) {
              setError(err as Error);
              setIdToken(null);
            }
          }
        }, refreshIn);
      }
    } catch (err) {
      console.error("Failed to schedule token refresh:", err);
    }
  };

  useEffect(() => {
    // Subscribe to token changes (login, logout, token refresh events)
    const unsubscribe = onIdTokenChanged(
      auth,
      async (user) => {
        setUser(user);
        if (user) {
          try {
            const token = await user.getIdToken();
            setIdToken(token);
            scheduleTokenRefresh(token);
            setError(undefined);
          } catch (err) {
            setError(err as Error);
            setIdToken(null);
          }
        } else {
          // Clear token and any scheduled refresh if the user signs out
          setIdToken(null);
          if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
          }
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [auth]);

  return (
    <AuthTokenContext.Provider value={{ user, idToken, loading, error }}>
      {children}
    </AuthTokenContext.Provider>
  );
};

export const useAuthToken = (): AuthTokenContextType => {
  const context = useContext(AuthTokenContext);
  if (!context) {
    throw new Error("useAuthToken must be used within an AuthTokenProvider");
  }
  return context;
};
