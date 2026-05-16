import { useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

export default function usePresence() {
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);

    const setOnline = async () => {
      await updateDoc(userRef, { online: true });
    };

    const setOffline = async () => {
      await updateDoc(userRef, { online: false });
    };

    setOnline();

    const onUnload = () => {
      setOffline();
    };

    // window.addEventListener('beforeunload', onUnload);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') setOffline();
      else setOnline();
    });

    // return () => {
    //   setOffline();
    //   window.removeEventListener('beforeunload', onUnload);
    // };
  }, []);
}
