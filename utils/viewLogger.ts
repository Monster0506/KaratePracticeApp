import { TechniqueViewEvent } from "@/types/Events";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "@react-native-firebase/firestore";
import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";

const getViewDocRef = (uid: string) => {
  const db = getFirestore(getApp());
  return doc(db, "users", uid);
};

export const logTechniqueView = async (name: string) => {
  const user = getAuth().currentUser;
  if (!user) return;

  const docRef = getViewDocRef(user.uid);
  const snap = await getDoc(docRef);
  const data = snap.data() || {};
  const existing: TechniqueViewEvent[] = data.views || [];

  const newView: TechniqueViewEvent = {
    name,
    timestamp: new Date().toISOString(),
  };

  await setDoc(docRef, { views: [...existing, newView] }, { merge: true });
};

export const getTechniqueViews = async (): Promise<TechniqueViewEvent[]> => {
  const user = getAuth().currentUser;
  if (!user) return [];

  const snap = await getDoc(getViewDocRef(user.uid));
  return snap.exists() && snap.data()?.views ? snap.data().views : [];
};

export const clearTechniqueViews = async () => {
  const user = getAuth().currentUser;
  if (!user) return;

  await setDoc(getViewDocRef(user.uid), { views: [] }, { merge: true });
};
