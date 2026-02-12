import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

const googleProvider = new GoogleAuthProvider();

export async function signUp(
  email: string,
  password: string,
  displayName: string,
  role: 'student' | 'tutor' = 'student'
) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName });

  // Store role in localStorage so the AuthProvider fallback can use it
  // if the Firestore write fails here.
  if (typeof window !== 'undefined') {
    localStorage.setItem('pendingSignupRole', role);
  }

  // Retry document creation up to 3 times — Firebase Auth already succeeded
  // so we don't want a transient Firestore error to leave the user doc-less.
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await createUserDocument(user, displayName, role);
      lastError = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pendingSignupRole');
      }
      break;
    } catch (err) {
      lastError = err;
      console.error(`createUserDocument attempt ${attempt}/3 failed:`, err);
      if (attempt < 3) await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
  if (lastError) {
    console.error('All createUserDocument attempts failed. AuthProvider fallback will handle it.');
  }

  return user;
}

export async function signIn(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function signInWithGoogle() {
  const { user } = await signInWithPopup(auth, googleProvider);
  // Create user doc if first time
  try {
    const userDoc = await getDoc(doc(db, 'quiz_users', user.uid));
    if (!userDoc.exists()) {
      await createUserDocument(user, user.displayName || 'Developer', 'student');
    }
  } catch (err) {
    console.error('Google sign-in: failed to check/create user doc:', err);
    // AuthProvider ensureUserDocument fallback will handle it
  }
  return user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

async function createUserDocument(
  user: User,
  displayName: string,
  role: 'student' | 'tutor' = 'student'
) {
  await setDoc(doc(db, 'quiz_users', user.uid), {
    uid: user.uid,
    email: user.email,
    displayName,
    photoURL: user.photoURL || null,
    role,
    mode: null,
    createdAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
    totalXP: 0,
    progress: {},
    beginnerProgress: {},
    skillBars: {
      syntaxFluency: 0,
      patternRecognition: 0,
      debugInstinct: 0,
      creativeThinking: 0,
      builderScore: 0,
    },
  });

  // Create tutor availability doc for tutors
  if (role === 'tutor') {
    await setDoc(doc(db, 'tutor_availability', user.uid), {
      uid: user.uid,
      displayName,
      photoURL: user.photoURL || null,
      isOnline: false,
      specialties: [],
      inSession: false,
      lastOnlineAt: Date.now(),
    });
  }
}
