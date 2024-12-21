import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


// Verify environment variables are loaded
const requiredEnvVars = [
    'PUBLIC_FIREBASE_API_KEY',
    'PUBLIC_FIREBASE_AUTH_DOMAIN',
    'PUBLIC_FIREBASE_PROJECT_ID',
    'PUBLIC_FIREBASE_STORAGE_BUCKET',
    'PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'PUBLIC_FIREBASE_APP_ID'
];

for (const envVar of requiredEnvVars) {
    if (!import.meta.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
    }
}

// fix the syncing issue with an env file and ensure that api keys and sensitive firebase info are in an env file

const firebaseConfig = {
    apiKey: "AIzaSyBuPyj08MdiNqwcDW_CrJwQHHxtNvySASA",
    authDomain: "kipu-e48a9.firebaseapp.com",
    projectId: "kipu-e48a9",
    storageBucket: "kipu-e48a9.firebasestorage.app",
    messagingSenderId: "146715496296",
    appId: "1:146715496296:web:0e4510871bdb282bca10dd"
};

console.log('Initializing Firebase with config:', firebaseConfig);

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
