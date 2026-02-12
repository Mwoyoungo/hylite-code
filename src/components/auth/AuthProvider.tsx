'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import type { UserProfile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Force-create user document using setDoc (creates or overwrites).
 * No getDoc check — just write directly.
 */
async function forceCreateUserDocument(user: User) {
  // Check if a role was stored during signup
  let role: 'student' | 'tutor' = 'student';
  if (typeof window !== 'undefined') {
    const pendingRole = localStorage.getItem('pendingSignupRole');
    if (pendingRole === 'tutor') role = 'tutor';
    localStorage.removeItem('pendingSignupRole');
  }

  console.log('[AuthProvider] Creating user doc for:', user.uid, 'role:', role, 'email:', user.email);

  const ref = doc(db, 'quiz_users', user.uid);
  await setDoc(ref, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || 'Developer',
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

  console.log('[AuthProvider] Successfully created quiz_users doc for:', user.uid);

  // Create tutor availability doc if role is tutor
  if (role === 'tutor') {
    console.log('[AuthProvider] Creating tutor_availability doc for:', user.uid);
    await setDoc(doc(db, 'tutor_availability', user.uid), {
      uid: user.uid,
      displayName: user.displayName || 'Tutor',
      photoURL: user.photoURL || null,
      isOnline: false,
      specialties: [],
      inSession: false,
      lastOnlineAt: Date.now(),
    });
    console.log('[AuthProvider] Successfully created tutor_availability doc for:', user.uid);
  }
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileVersion, setProfileVersion] = useState(0);
  const ensuredRef = useRef(false);

  const refreshProfile = useCallback(() => {
    setProfileVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('[AuthProvider] Auth state changed:', firebaseUser?.uid || 'null');
      setUser(firebaseUser);
      setError(null);
      ensuredRef.current = false;
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!user) return;

    console.log('[AuthProvider] Setting up onSnapshot for quiz_users/' + user.uid);

    const unsubscribeProfile = onSnapshot(
      doc(db, 'quiz_users', user.uid),
      async (snap) => {
        if (snap.exists()) {
          console.log('[AuthProvider] User doc found for:', user.uid);
          const data = snap.data();
          setProfile({
            uid: data.uid,
            email: data.email || '',
            displayName: data.displayName || 'Developer',
            photoURL: data.photoURL || null,
            role: data.role || 'student',
            mode: data.mode || null,
            totalXP: data.totalXP || 0,
            progress: data.progress || {},
            skillBars: data.skillBars || {
              syntaxFluency: 0,
              patternRecognition: 0,
              debugInstinct: 0,
              creativeThinking: 0,
              builderScore: 0,
            },
            beginnerProgress: data.beginnerProgress || {},
          });
          setError(null);
          setLoading(false);
        } else {
          console.log('[AuthProvider] No user doc found for:', user.uid, '— creating...');
          // Document doesn't exist — create it
          if (!ensuredRef.current) {
            ensuredRef.current = true;
            try {
              await forceCreateUserDocument(user);
              // onSnapshot will fire again with the new doc
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              console.error('[AuthProvider] FAILED to create user document:', msg);
              setError('Failed to create user profile: ' + msg);
              setLoading(false);
            }
          } else {
            console.error('[AuthProvider] Already tried creating doc, still missing');
            setError('User profile could not be created. Check Firestore rules.');
            setLoading(false);
          }
        }
      },
      (err) => {
        console.error('[AuthProvider] onSnapshot error:', err.message);
        setError('Firestore error: ' + err.message);
        setLoading(false);
      }
    );

    return unsubscribeProfile;
  }, [user, profileVersion]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {error && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: '#ff4444',
          color: 'white',
          padding: '12px 16px',
          fontFamily: 'monospace',
          fontSize: '13px',
        }}>
          AUTH ERROR: {error}
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}
