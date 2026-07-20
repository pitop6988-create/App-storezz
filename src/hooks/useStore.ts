import { useState, useEffect } from 'react';
import localforage from 'localforage';
import { AppEntry, UserEntry } from '../types';
import { INITIAL_APPS } from '../constants';

// We'll use BroadcastChannel for cross-tab localforage sync
const syncChannel = new BroadcastChannel('ios_store_sync');

export function useStore() {
  const [apps, setApps] = useState<AppEntry[]>(INITIAL_APPS);
  const [allUsers, setAllUsers] = useState<UserEntry[]>([{ id: '1', name: 'Admin', email: 'admin@apple.com' }]);
  const [downloadedApps, setDownloadedApps] = useState<Set<string>>(new Set());
  const [purchaseLibrary, setPurchaseLibrary] = useState<Set<string>>(new Set());
  const [userBalance, setUserBalance] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<UserEntry | null>(null);

  const loadApps = async () => {
    const saved = await localforage.getItem<AppEntry[]>('ios_store_apps');
    if (saved) setApps(saved);
  };

  const loadState = () => {
    loadApps();
    const savedUsers = localStorage.getItem('ios_store_all_users');
    if (savedUsers) setAllUsers(JSON.parse(savedUsers));

    const savedDownloaded = localStorage.getItem('ios_store_downloaded_apps');
    if (savedDownloaded) setDownloadedApps(new Set(JSON.parse(savedDownloaded)));

    const savedPurchased = localStorage.getItem('ios_store_purchase_library');
    if (savedPurchased) setPurchaseLibrary(new Set(JSON.parse(savedPurchased)));

    const savedBalance = localStorage.getItem('ios_store_user_balance');
    if (savedBalance) setUserBalance(parseFloat(savedBalance));

    const savedCurrentUser = localStorage.getItem('ios_store_current_user');
    if (savedCurrentUser) setCurrentUser(JSON.parse(savedCurrentUser));
  };

  useEffect(() => {
    loadState();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ios_store_all_users' && e.newValue) setAllUsers(JSON.parse(e.newValue));
      if (e.key === 'ios_store_downloaded_apps' && e.newValue) setDownloadedApps(new Set(JSON.parse(e.newValue)));
      if (e.key === 'ios_store_purchase_library' && e.newValue) setPurchaseLibrary(new Set(JSON.parse(e.newValue)));
      if (e.key === 'ios_store_user_balance' && e.newValue) setUserBalance(parseFloat(e.newValue));
      if (e.key === 'ios_store_current_user') {
        setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };

    window.addEventListener('storage', handleStorage);
    
    syncChannel.onmessage = (event) => {
      if (event.data.type === 'SYNC_APPS') {
        loadApps();
      }
    };

    return () => {
      window.removeEventListener('storage', handleStorage);
      syncChannel.onmessage = null;
    };
  }, []);

  const saveApps = async (newApps: AppEntry[]) => {
    setApps(newApps);
    await localforage.setItem('ios_store_apps', newApps);
    syncChannel.postMessage({ type: 'SYNC_APPS' });
  };

  const saveAllUsers = (newUsers: UserEntry[]) => {
    setAllUsers(newUsers);
    localStorage.setItem('ios_store_all_users', JSON.stringify(newUsers));
  };

  const saveDownloadedApps = (newDownloaded: Set<string>) => {
    setDownloadedApps(newDownloaded);
    localStorage.setItem('ios_store_downloaded_apps', JSON.stringify(Array.from(newDownloaded)));
  };

  const savePurchaseLibrary = (newPurchased: Set<string>) => {
    setPurchaseLibrary(newPurchased);
    localStorage.setItem('ios_store_purchase_library', JSON.stringify(Array.from(newPurchased)));
  };

  const saveUserBalance = (newBalance: number) => {
    setUserBalance(newBalance);
    localStorage.setItem('ios_store_user_balance', newBalance.toString());
  };

  const saveCurrentUser = (user: UserEntry | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('ios_store_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ios_store_current_user');
    }
  };

  return {
    apps, saveApps,
    allUsers, saveAllUsers,
    downloadedApps, saveDownloadedApps,
    purchaseLibrary, savePurchaseLibrary,
    userBalance, saveUserBalance,
    currentUser, saveCurrentUser
  };
}
