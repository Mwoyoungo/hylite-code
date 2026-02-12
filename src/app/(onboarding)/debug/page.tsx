'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/components/auth/AuthProvider';
import { Loader2 } from 'lucide-react';

export default function DebugPage() {
  const { user, profile, loading } = useAuth();
  const [collections, setCollections] = useState<string[]>([]);
  const [quizUsersCount, setQuizUsersCount] = useState<number | null>(null);
  const [tutorAvailCount, setTutorAvailCount] = useState<number | null>(null);
  const [myDoc, setMyDoc] = useState<Record<string, unknown> | null>(null);
  const [myTutorDoc, setMyTutorDoc] = useState<Record<string, unknown> | null>(null);
  const [checking, setChecking] = useState(false);

  const runCheck = async () => {
    if (!user) return;
    setChecking(true);

    try {
      // Check quiz_users collection
      const quizUsersSnap = await getDocs(collection(db, 'quiz_users'));
      setQuizUsersCount(quizUsersSnap.size);

      // Check tutor_availability collection
      const tutorSnap = await getDocs(collection(db, 'tutor_availability'));
      setTutorAvailCount(tutorSnap.size);

      // Check my own quiz_users doc
      const myDocSnap = await getDoc(doc(db, 'quiz_users', user.uid));
      setMyDoc(myDocSnap.exists() ? myDocSnap.data() : null);

      // Check my tutor_availability doc
      const myTutorSnap = await getDoc(doc(db, 'tutor_availability', user.uid));
      setMyTutorDoc(myTutorSnap.exists() ? myTutorSnap.data() : null);
    } catch (err) {
      console.error('Debug check error:', err);
    }

    setChecking(false);
  };

  useEffect(() => {
    if (user && !loading) runCheck();
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary p-8 font-mono text-[13px]">
      <h1 className="text-xl font-bold text-text-bright mb-6">Auth & Firestore Debug</h1>

      {/* Auth State */}
      <div className="mb-6 p-4 bg-bg-secondary border border-border rounded">
        <h2 className="text-sm font-bold text-accent mb-2">Firebase Auth</h2>
        <div className="text-text-primary">
          <p>UID: <span className="text-teal">{user?.uid || 'NOT LOGGED IN'}</span></p>
          <p>Email: <span className="text-teal">{user?.email || 'N/A'}</span></p>
          <p>Display Name: <span className="text-teal">{user?.displayName || 'N/A'}</span></p>
        </div>
      </div>

      {/* Profile from AuthProvider */}
      <div className="mb-6 p-4 bg-bg-secondary border border-border rounded">
        <h2 className="text-sm font-bold text-accent mb-2">AuthProvider Profile (from onSnapshot)</h2>
        {profile ? (
          <pre className="text-text-primary whitespace-pre-wrap overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        ) : (
          <p className="text-error">profile is NULL — quiz_users doc was NOT loaded</p>
        )}
      </div>

      {/* Direct Firestore Reads */}
      <div className="mb-6 p-4 bg-bg-secondary border border-border rounded">
        <h2 className="text-sm font-bold text-accent mb-2">Direct Firestore Check</h2>
        {checking ? (
          <Loader2 size={16} className="animate-spin text-text-muted" />
        ) : (
          <div className="text-text-primary space-y-2">
            <p>quiz_users collection: <span className="text-teal">{quizUsersCount ?? '?'} documents</span></p>
            <p>tutor_availability collection: <span className="text-teal">{tutorAvailCount ?? '?'} documents</span></p>

            <div className="mt-3">
              <p className="font-bold text-text-bright">My quiz_users/{user?.uid} doc:</p>
              {myDoc ? (
                <pre className="text-success mt-1 whitespace-pre-wrap overflow-auto">
                  {JSON.stringify(myDoc, null, 2)}
                </pre>
              ) : (
                <p className="text-error">DOES NOT EXIST</p>
              )}
            </div>

            <div className="mt-3">
              <p className="font-bold text-text-bright">My tutor_availability/{user?.uid} doc:</p>
              {myTutorDoc ? (
                <pre className="text-success mt-1 whitespace-pre-wrap overflow-auto">
                  {JSON.stringify(myTutorDoc, null, 2)}
                </pre>
              ) : (
                <p className="text-yellow-500">DOES NOT EXIST (expected for students)</p>
              )}
            </div>
          </div>
        )}

        <button
          onClick={runCheck}
          disabled={checking}
          className="mt-4 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded transition-colors disabled:opacity-50"
        >
          {checking ? 'Checking...' : 'Re-check Firestore'}
        </button>
      </div>
    </div>
  );
}
