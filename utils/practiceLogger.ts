import { PracticeSession } from "@/types/Events";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "@react-native-firebase/firestore";
import { getApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";

const getPracticeDocRef = (uid: string) => {
  const db = getFirestore(getApp());
  return doc(db, "users", uid);
};

export const logPracticeSession = async (session: PracticeSession) => {
  const user = getAuth().currentUser;
  if (!user) return;

  const docRef = getPracticeDocRef(user.uid);
  const snap = await getDoc(docRef);
  const existing: PracticeSession[] = snap.exists()
    ? snap.data()?.practice || []
    : [];

  await setDoc(docRef, { practice: [...existing, session] }, { merge: true });
};

export const getPracticeHistory = async (): Promise<PracticeSession[]> => {
  const user = getAuth().currentUser;
  if (!user) return [];

  const snap = await getDoc(getPracticeDocRef(user.uid));
  return snap.exists() && snap.data()?.practice ? snap.data().practice : [];
};

export const clearPracticeHistory = async () => {
  const user = getAuth().currentUser;
  if (!user) return;

  await setDoc(getPracticeDocRef(user.uid), { practice: [] }, { merge: true });
};
