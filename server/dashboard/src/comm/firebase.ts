import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDqPy3ZgmyHCyYm28HMr8sWzv5byPdV1A0",
  authDomain: "smartglasses-e58d8.firebaseapp.com",
  projectId: "smartglasses-e58d8",
  storageBucket: "smartglasses-e58d8.appspot.com",
  messagingSenderId: "240789295848",
  appId: "1:240789295848:web:8145be722d8cab5fadaf5d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
