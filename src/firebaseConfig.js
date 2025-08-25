// import {initializeApp, auth} from "firebase/compat/app"
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD9mzyGX0GMeS_ASyVawUf6lpV1h97gt_0",
  authDomain: "depsure-a9b61.firebaseapp.com",
  projectId: "depsure-a9b61",
  storageBucket: "depsure-a9b61.firebasestorage.app",
  messagingSenderId: "656713548553",
  appId: "1:656713548553:web:8ce67c5c807bcab02709d8"
};
export const firebaseApp = initializeApp(firebaseConfig);
// export const auth = firebaseApp.auth();

export const auth = getAuth();
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);