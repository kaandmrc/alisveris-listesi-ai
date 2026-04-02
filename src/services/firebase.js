import { initializeApp } from "firebase/app";
import { getDatabase, ref } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBeULgND52D3BAdP7Y-ERBmnRL7r2-BHjs",
  authDomain: "personal-shop-app.firebaseapp.com",
  databaseURL: "https://personal-shop-app-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "personal-shop-app",
  storageBucket: "personal-shop-app.firebasestorage.app",
  messagingSenderId: "307669679279",
  appId: "1:307669679279:web:7597f15822049ceabf685a",
  measurementId: "G-L678PQB11W"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export const listsRef = ref(db, 'shopping_lists');
export const apiKeyRef = ref(db, 'api_key');
