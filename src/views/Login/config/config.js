import { initializeApp } from "firebase/app";
import { getAuth , GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA0ax80GACLGyNhOy6ZxdefeAyOWqPkxk8",
  authDomain: "launchpad-cc20b.firebaseapp.com",
  databaseURL: "https://launchpad-cc20b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "launchpad-cc20b",
  storageBucket: "launchpad-cc20b.appspot.com",
  messagingSenderId: "614615091187",
  appId: "1:614615091187:web:d04be665fe27ab3e55b486",
  measurementId: "G-D2CETVEHBS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
export {auth,provider,db}



