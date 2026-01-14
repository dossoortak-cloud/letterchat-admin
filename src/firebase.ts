import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // 🔥 WEB İÇİN BU YETERLİ
import { getFirestore } from 'firebase/firestore';

// 🔥 SENİN ANAHTARLARIN (Mobildekilerin aynısı)
const firebaseConfig = {
    apiKey: "AIzaSyDELbE1PwhowUDRzjro63slZgh9NUgp_xw",
    authDomain: "letterchatv1.firebaseapp.com",
    projectId: "letterchatv1",
    storageBucket: "letterchatv1.firebasestorage.app",
    messagingSenderId: "294068242272",
    appId: "1:294068242272:web:8d2e90b3a0f7b8a9b18005",
    measurementId: "G-Y8PRGJTGGX"
};

// Uygulamayı Başlat
const app = initializeApp(firebaseConfig);

// Web için Auth ve Firestore (Persistence ayarı gerekmez, otomatik yapar)
export const auth = getAuth(app);
export const db = getFirestore(app);