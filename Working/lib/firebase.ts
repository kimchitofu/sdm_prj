import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBuMhNuVd3rqVdd8o-wqcT_nWXPT3qJ-KE",
  authDomain: "softwaremethods-prj.firebaseapp.com",
  projectId: "softwaremethods-prj",
  storageBucket: "softwaremethods-prj.firebasestorage.app",
  messagingSenderId: "785017370662",
  appId: "1:785017370662:web:3f1cd33bc8c7c00092cee7",
  databaseURL: "https://softwaremethods-prj-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

export default app;