import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCyR4T65I4BRj2GHZTLcwDKRhH7Nw_UEcM",
  authDomain: "algebra-cbc78.firebaseapp.com",
  projectId: "algebra-cbc78",
  storageBucket: "algebra-cbc78.appspot.com",
  messagingSenderId: "296429198062",
  appId: "1:296429198062:web:cf197b186b61b7edc6f1ff"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Auth functions
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

const registerWithEmailAndPassword = async (email, password, name, role) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      role,
      createdAt: new Date()
    });
    
    return user;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

const logout = () => {
  return signOut(auth);
};

const getUserRole = async (uid) => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().role : null;
};

export { 
  auth, 
  db, 
  signInWithGoogle, 
  registerWithEmailAndPassword, 
  logout, 
  getUserRole 
};