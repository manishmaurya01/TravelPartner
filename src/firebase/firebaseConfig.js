// firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDf4Tzc2Z4aXRL_t6aNGzb0KTRaOTWc1cw",
    authDomain: "booking-957f2.firebaseapp.com",
    databaseURL: "https://booking-957f2-default-rtdb.firebaseio.com",
    projectId: "booking-957f2",
    storageBucket: "booking-957f2.firebasestorage.app",
    messagingSenderId: "265572378404",
    appId: "1:265572378404:web:6c43bdbc865463bebc35b1",
    measurementId: "G-6QR874ZXF9"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getFirestore(app);


