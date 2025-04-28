// Firebase-Initialisierung für Firestore Cloud Save

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- HIER DEINE KONFIGURATION EINFÜGEN ---
const firebaseConfig = {
    apiKey: "AIzaSyCUYlKzMgiK3KXvY7kkyrplWAEUHGxsdgU",
    authDomain: "euro-clicker-game.firebaseapp.com",
    projectId: "euro-clicker-game",
    storageBucket: "euro-clicker-game.firebasestorage.app",
    messagingSenderId: "190247733101",
    appId: "1:190247733101:web:99b46bc319be9be4aa3c64"
};
// -----------------------------------------

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
