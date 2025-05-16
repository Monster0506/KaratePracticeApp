import { FlagEvent } from "@/types/Events";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "@react-native-firebase/firestore";
import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";

const getFlagDocRef = (uid: string) => {
  const db = getFirestore(getApp());
  return doc(db, "users", uid);
};

export const logFlagEvent = async (event: Omit<FlagEvent, "timestamp">) => {
  const user = getAuth().currentUser;
  if (!user) return;

  const docRef = getFlagDocRef(user.uid);
  const snap = await getDoc(docRef);
  const existing: FlagEvent[] = snap.exists()
    ? snap.data()?.flagEvents || []
    : [];

  const timestamped = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  await setDoc(
    docRef,
    { flagEvents: [...existing, timestamped] },
    { merge: true },
  );
};

export const getFlagEvents = async (): Promise<FlagEvent[]> => {
  const user = getAuth().currentUser;
  if (!user) return [];

  const snap = await getDoc(getFlagDocRef(user.uid));
  return snap.exists() && snap.data()?.flagEvents ? snap.data().flagEvents : [];
};

export const clearFlagEvents = async () => {
  const user = getAuth().currentUser;
  if (!user) return;

  await setDoc(getFlagDocRef(user.uid), { flagEvents: [] }, { merge: true });
};
