import { useEffect, useState } from 'react';
import { useIdToken as useFirebaseUser } from 'react-firebase-hooks/auth';
import { getIdToken, Auth, User } from 'firebase/auth';

type AuthTokenState = {
  user: User | null | undefined;
  idToken: string | null;
  loading: boolean;
  error: Error | undefined;
};

const useAuthToken = (auth: Auth): AuthTokenState => {
  const [user, loadingUser, errorUser] = useFirebaseUser(auth);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(true);
  const [tokenError, setTokenError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setIdToken(null);
      setLoadingToken(false);
      return;
    }

    setLoadingToken(true);

    getIdToken(user)
      .then((token) => {
        if (isMounted) {
          setIdToken(token);
          setTokenError(undefined);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setIdToken(null);
          setTokenError(err);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingToken(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  return {
    user,
    idToken,
    loading: loadingUser || loadingToken,
    error: errorUser || tokenError,
  };
}

export default useAuthToken;
