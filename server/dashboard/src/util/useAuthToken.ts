import { useEffect, useState } from 'react';
import { Auth, onIdTokenChanged, User } from 'firebase/auth';

type AuthTokenState = {
  user: User | null;
  idToken: string | null;
  loading: boolean;
  error?: Error;
};

const useAuthToken = (auth: Auth): AuthTokenState => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    // Subscribe to token changes via onIdTokenChanged.
    const unsubscribe = onIdTokenChanged(
      auth,
      async (user) => {
        console.log("New ID Token")
        setUser(user);
        if (user) {
          try {
            // Fetch the token
            const token = await user.getIdToken();
            setIdToken(token);
            setError(undefined);
          } catch (err) {
            setError(err as Error);
            setIdToken(null);
          }
        } else {
          setIdToken(null);
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
    };
  }, [auth]);

  return { user, idToken, loading, error };
};

export default useAuthToken;
