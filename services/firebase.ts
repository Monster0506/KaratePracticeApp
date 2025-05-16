// services/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBWBABkSFSntOMTwCOt2FTDgAfaMJpvKaw",
  authDomain: "karate-e403d.firebaseapp.com",
  databaseURL: "https://karate-e403d-default-rtdb.firebaseio.com",
  projectId: "karate-e403d",
  storageBucket: "karate-e403d.appspot.com",
  messagingSenderId: "956749449613",
  appId: "1:956749449613:web:77a1a76f9ce039e53d55c4",
  measurementId: "G-6JY0TEKY6H",
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);

export { auth, db, signInAnonymously };
