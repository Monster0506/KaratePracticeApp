import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/services/firebase";

export const getUserDoc = async (uid: string) => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

export const initUserDoc = async (uid: string, defaults: object) => {
  const ref = doc(db, "users", uid);
  await setDoc(ref, defaults, { merge: true });
};
