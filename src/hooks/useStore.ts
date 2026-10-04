import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppEntry, UserEntry } from '../types';
import { INITIAL_APPS } from '../constants';

export function useStore() {
  const [apps, setApps] = useState<AppEntry[]>([]);
  const [allUsers, setAllUsers] = useState<UserEntry[]>([]);
  const [downloadedApps, setDownloadedApps] = useState<Set<string>>(new Set());
  const [purchaseLibrary, setPurchaseLibrary] = useState<Set<string>>(new Set());
  const [updatedApps, setUpdatedApps] = useState<Record<string, number>>({});
  const [userBalance, setUserBalance] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<UserEntry | null>(null);
  const [globalSettings, setGlobalSettings] = useState<{ adminCode: string; moneyCode: string; moneyCodes?: { code: string; amount: number }[] }>({
    adminCode: 'EMAD8912',
    moneyCode: 'EMAD8912', moneyCodes: []
  });

  // Sync Apps
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'apps'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data() } as AppEntry));
      if (data.length > 0) {
        setApps(data);
      } else {
        // Seed initial apps if none exist
        INITIAL_APPS.forEach(async (app) => {
          await setDoc(doc(db, 'apps', app.id), app);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Users
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data() } as UserEntry));
      setAllUsers(data);
      
      // Seed default admin if no users exist
      if (snapshot.empty) {
        const adminUser = { id: '1', name: 'Admin', email: 'admin@apple.com', password: 'admin' };
        setDoc(doc(db, 'users', adminUser.id), adminUser);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync User Settings (Balance, Library)
  useEffect(() => {
    if (!currentUser) {
      setDownloadedApps(new Set());
      setPurchaseLibrary(new Set());
      setUserBalance(0);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'users', currentUser.id, 'settings', 'default'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setDownloadedApps(new Set(data.downloadedApps || []));
        setPurchaseLibrary(new Set(data.purchaseLibrary || []));
        setUpdatedApps(data.updatedApps || {});
        setUserBalance(data.balance || 0);
      } else {
        // Initialize settings if they don't exist
        setDoc(doc(db, 'users', currentUser.id, 'settings', 'default'), {
          balance: 0,
          downloadedApps: [],
          purchaseLibrary: [],
          updatedApps: {}
        });
      }
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Sync Global Settings
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        setGlobalSettings(snapshot.data() as any);
      } else {
        // Seed default settings
        setDoc(doc(db, 'settings', 'global'), {
          adminCode: 'EMAD8912',
          moneyCode: 'EMAD8912', moneyCodes: []
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const updateApp = async (app: AppEntry) => {
    await setDoc(doc(db, 'apps', app.id), app);
  };

  const saveApps = async (newApps: AppEntry[]) => {
    // In Firestore, we update individual docs or use batch. 
    // For simplicity, we'll assume the caller passes the whole list and we sync it.
    // Better yet, just handle the specific mutations if possible, but the current UI passes the full list.
    for (const app of newApps) {
      await setDoc(doc(db, 'apps', app.id), app);
    }
    // Handle deletions if needed (comparing newApps with current apps)
    const currentIds = new Set(newApps.map(a => a.id));
    const toDelete = apps.filter(a => !currentIds.has(a.id));
    for (const app of toDelete) {
      await deleteDoc(doc(db, 'apps', app.id));
    }
  };

  const saveAllUsers = async (newUsers: UserEntry[]) => {
    for (const user of newUsers) {
      await setDoc(doc(db, 'users', user.id), user);
    }
  };

  const saveDownloadedApps = async (newDownloaded: Set<string>) => {
    if (!currentUser) return;
    setDownloadedApps(newDownloaded);
    await updateDoc(doc(db, 'users', currentUser.id, 'settings', 'default'), {
      downloadedApps: Array.from(newDownloaded)
    });
  };

  const savePurchaseLibrary = async (newPurchased: Set<string>) => {
    if (!currentUser) return;
    setPurchaseLibrary(newPurchased);
    await updateDoc(doc(db, 'users', currentUser.id, 'settings', 'default'), {
      purchaseLibrary: Array.from(newPurchased)
    });
  };

  const saveUpdatedApps = async (newUpdatedApps: Record<string, number>) => {
    if (!currentUser) return;
    setUpdatedApps(newUpdatedApps);
    await updateDoc(doc(db, 'users', currentUser.id, 'settings', 'default'), {
      updatedApps: newUpdatedApps
    });
  };

  const saveUserBalance = async (newBalance: number) => {
    if (!currentUser) return;
    setUserBalance(newBalance);
    await updateDoc(doc(db, 'users', currentUser.id, 'settings', 'default'), {
      balance: newBalance
    });
  };

  const saveGlobalSettings = async (settings: { adminCode: string; moneyCode: string; moneyCodes?: { code: string; amount: number }[] }) => {
    setGlobalSettings(settings);
    await setDoc(doc(db, 'settings', 'global'), settings);
  };

  const saveCurrentUser = (user: UserEntry | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('ios_store_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ios_store_current_user');
    }
  };

  // Initial load for currentUser from localStorage (for session persistence)
  useEffect(() => {
    const saved = localStorage.getItem('ios_store_current_user');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  const transferBalanceToUser = async (targetAppleId: string, amount: number) => {
    if (!currentUser) throw new Error("Please sign in to transfer balance.");
    if (amount <= 0) throw new Error("Please enter a valid amount.");
    if (userBalance < amount) throw new Error(`Insufficient balance. You have $${userBalance.toFixed(2)}.`);

    const targetUser = allUsers.find(
      u => u.email.toLowerCase() === targetAppleId.toLowerCase().trim() ||
           u.id === targetAppleId.trim() ||
           u.name.toLowerCase() === targetAppleId.toLowerCase().trim()
    );

    if (!targetUser) {
      throw new Error(`User with Apple ID "${targetAppleId}" was not found.`);
    }

    if (targetUser.id === currentUser.id) {
      throw new Error("You cannot send money to yourself.");
    }

    // Deduct from sender's balance in Firestore
    const newSenderBalance = userBalance - amount;
    setUserBalance(newSenderBalance);
    await updateDoc(doc(db, 'users', currentUser.id, 'settings', 'default'), {
      balance: newSenderBalance
    });

    // Credit to receiver's balance in Firestore
    const targetRef = doc(db, 'users', targetUser.id, 'settings', 'default');
    const targetSnap = await getDoc(targetRef);
    let targetCurrentBalance = 0;
    if (targetSnap.exists()) {
      targetCurrentBalance = targetSnap.data().balance || 0;
    }
    const newTargetBalance = targetCurrentBalance + amount;
    await setDoc(targetRef, { balance: newTargetBalance }, { merge: true });

    return {
      senderNewBalance: newSenderBalance,
      targetUser
    };
  };

  return {
    apps, saveApps, updateApp,
    allUsers, saveAllUsers,
    downloadedApps, saveDownloadedApps,
    purchaseLibrary, savePurchaseLibrary,
    updatedApps, saveUpdatedApps,
    userBalance, saveUserBalance,
    currentUser, saveCurrentUser,
    globalSettings, saveGlobalSettings,
    transferBalanceToUser
  };
}

