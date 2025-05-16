import { useEffect, useState } from "react";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

export const useAnonymousAuth = () => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        setInitializing(false);
      } else {
        try {
          const result = await auth().signInAnonymously();
          setUser(result.user);
          console.log("Anonymous user signed in:", result.user.uid);
        } catch (err: any) {
          setError(err);
        } finally {
          setInitializing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, initializing, error };
};
