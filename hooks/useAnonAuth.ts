import React, { useEffect } from "react";
import { firebaseAuth } from "@/services/firebase";

export const useAnonymousAuth = () => {
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (user) => {
      if (!user) {
        try {
          await firebaseAuth.signInAnonymously();
          console.log("Signed in anonymously");
        } catch (e) {
          console.error("Anonymous sign-in failed:", e);
        }
      } else {
        console.log("User ID:", user.uid);
      }
    });

    return unsubscribe;
  }, []);
};
