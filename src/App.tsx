/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Download, 
  Share2, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  LayoutGrid, 
  Gamepad2, 
  Smartphone, 
  SmartphoneNfc,
  PlayCircle,
  Calendar,
  Lock,
  Plus,
  Trash2,
  ExternalLink,
  Facebook,
  Twitter,
  Instagram as InstagramIcon,
  MessageCircle,
  MoreHorizontal,
  User,
  CreditCard,
  Wallet,
  Globe,
  Check,
  Circle,
  PlusCircle,
  Rocket,
  ArrowDownToLine,
  CloudDownload,
  Package,
  Bell,
  BellOff,
  Sun,
  Moon,
  Mic,
  Joystick,
  Layers,
  LayoutTemplate,
  UserPlus
} from 'lucide-react';
import { AppEntry, AppCategory } from './types';
import { INITIAL_APPS } from './constants';

// --- Constants & Utilities ---

// --- Main App ---

export default function App() {
  const [allUsers, setAllUsers] = useState<{id: string, name: string, email: string}[]>(() => {
    const saved = localStorage.getItem('ios_store_all_users');
    return saved ? JSON.parse(saved) : [{ id: '1', name: 'Admin', email: 'admin@apple.com' }];
  });

  useEffect(() => {
    localStorage.setItem('ios_store_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  const [apps, setApps] = useState<AppEntry[]>(() => {
    const saved = localStorage.getItem('ios_store_apps');
    return saved ? JSON.parse(saved) : INITIAL_APPS;
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('notifications_enabled') === 'true';
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('dark_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('dark_mode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('notifications_enabled', notificationsEnabled.toString());
  }, [notificationsEnabled]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      if ('Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            setNotificationsEnabled(true);
          } else {
            console.log('Notification permission denied');
            setNotificationsEnabled(false);
          }
        } catch (e) {
          setNotificationsEnabled(true); // Dummy toggle for environments that error
        }
      } else {
        setNotificationsEnabled(true);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('ios_store_apps', JSON.stringify(apps));
  }, [apps]);

  const [activeTab, setActiveTab] = useState<'Today' | 'Games' | 'Apps' | 'Search' | 'Admin'>('Today');
  const [viewingAppId, setViewingAppId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [storePassword, setStorePassword] = useState(() => localStorage.getItem('ios_store_password') || 'EMAD8912');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordPrompt, setPasswordPrompt] = useState<{ type: 'funds' | 'purchase', amount?: number, appId?: string } | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [downloadedApps, setDownloadedApps] = useState<Set<string>>(new Set());
  const [purchaseLibrary, setPurchaseLibrary] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('ios_store_purchase_library');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem('ios_store_purchase_library', JSON.stringify(Array.from(purchaseLibrary)));
  }, [purchaseLibrary]);

  useEffect(() => {
    localStorage.setItem('ios_store_password', storePassword);
  }, [storePassword]);

  const [currentUser, setCurrentUser] = useState<{name: string, email: string} | null>(() => {
    const saved = localStorage.getItem('ios_store_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ios_store_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ios_store_current_user');
    }
  }, [currentUser]);

  const [showAccount, setShowAccount] = useState(false);
  const [confirmingAppId, setConfirmingAppId] = useState<string | null>(null);
  const [userCountry, setUserCountry] = useState(() => {
    const saved = localStorage.getItem('ios_store_user_country');
    return saved || 'United States';
  });

  const [userBalance, setUserBalance] = useState(() => {
    const saved = localStorage.getItem('ios_store_user_balance');
    return saved ? parseFloat(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem('ios_store_user_country', userCountry);
  }, [userCountry]);

  useEffect(() => {
    localStorage.setItem('ios_store_user_balance', userBalance.toString());
  }, [userBalance]);

  const filteredApps = apps.filter(app => {
    if (!app.country || app.country === 'Global') return true;
    return app.country === userCountry;
  });

  const currentApp = apps.find(a => a.id === viewingAppId);

  const handleAddApp = (newApp: AppEntry) => {
    setApps([...apps, newApp]);
  };

  const handleDeleteApp = (id: string) => {
    setApps(apps.filter(app => app.id !== id));
  };

  const handleDownload = (id: string) => {
    setConfirmingAppId(id);
  };

  const [downloadStatus, setDownloadStatus] = useState<Record<string, 'idle' | 'second' | 'finish' | 'open' | 'save'>>({});

  const executeDownload = (id: string) => {
    const app = apps.find(a => a.id === id);
    if (!app) return;
    
    // Price Validation
    const isFree = !app.price || app.price === 'Free';
    const priceValue = isFree ? 0 : parseFloat(app.price.replace('$', ''));
    
    if (!isFree && !passwordPrompt) {
      setPasswordPrompt({ type: 'purchase', appId: id });
      setConfirmingAppId(null);
      return;
    }

    if (userBalance < priceValue) {
      alert(`Insufficient Funds: This app costs ${app.price}. You only have $${userBalance.toFixed(2)}.`);
      setConfirmingAppId(null);
      setPasswordPrompt(null);
      return;
    }

    // Increment download count immediately on tap/confirmation
    setApps(prevApps => prevApps.map(a => {
      if (a.id === id) {
        const current = a.downloads || '10K+';
        const match = current.match(/^([\d.]+)([KMB+]*)$/);
        if (match) {
          const num = parseFloat(match[1]);
          const suffix = match[2];
          const increment = suffix.includes('M') ? 0.1 : (suffix.includes('K') ? 1 : 1);
          const newNum = (num + increment).toFixed(suffix.includes('M') || suffix.includes('B') ? 1 : 0);
          return { ...a, downloads: `${newNum}${suffix}` };
        }
        return { ...a, downloads: '11K+' };
      }
      return a;
    }));
    
    const duration = (app.redirectTime || 10) * 1000;
    
    setDownloadStatus(prev => ({ ...prev, [id]: 'second' }));
    setIsDownloading(id);
    setConfirmingAppId(null);
    setPasswordPrompt(null);

    // After half duration, switch to 'finish'
    setTimeout(() => {
      setDownloadStatus(prev => ({ ...prev, [id]: 'finish' }));
    }, duration / 2);

    setTimeout(() => {
      setIsDownloading(null);
      setDownloadStatus(prev => ({ ...prev, [id]: 'open' }));
      setDownloadedApps(prev => new Set(prev).add(id));
      setPurchaseLibrary(prev => new Set(prev).add(id));
      
      if (!isFree) {
        setUserBalance(prev => prev - priceValue);
      }
      if (app.apkUrl || app.externalLink) {
        window.open(app.apkUrl || app.externalLink, '_blank');
      } else if (app.iosUrl || app.androidUrl) {
        window.open(app.iosUrl || app.androidUrl, '_blank');
      } else if (app.downloadUrl) {
        window.open(app.downloadUrl, '_blank');
      }
    }, duration);
  };

  const handleUpdateApp = (updatedApp: AppEntry) => {
    setApps(apps.map(app => app.id === updatedApp.id ? updatedApp : app));
    
    // Simulate Push Notification for version updates
    if (notificationsEnabled && updatedApp.versionDate === 'Just Now') {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('App Store Update', {
          body: `A new version (${updatedApp.version}) of ${updatedApp.name} is now available!`,
          icon: updatedApp.iconUrl
        });
      } else {
        // Fallback for demo if native notifications aren't available or granted
        const toast = document.createElement('div');
        toast.className = 'fixed top-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-6 py-4 rounded-3xl shadow-2xl z-[9999] flex items-center gap-4 border border-white/10 animate-in fade-in slide-in-from-top-4 duration-500';
        toast.innerHTML = `
          <img src="${updatedApp.iconUrl}" class="w-10 h-10 rounded-xl" />
          <div class="text-left">
            <p class="font-bold text-sm">Update Available</p>
            <p class="text-xs opacity-70">v${updatedApp.version} for ${updatedApp.name}</p>
          </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.classList.add('animate-out', 'fade-out', 'slide-out-to-top-4');
          setTimeout(() => toast.remove(), 500);
        }, 4000);
      }
    }
  };

  const renderTabContent = () => {
    if (viewingAppId) return (
      <AppDetail 
        app={currentApp!} 
        onBack={() => setViewingAppId(null)} 
        onDownload={handleDownload} 
        isDownloading={isDownloading === currentApp?.id}
        isDownloaded={downloadedApps.has(currentApp?.id || '')}
        isPurchased={purchaseLibrary.has(currentApp?.id || '')}
        downloadStatus={downloadStatus[currentApp?.id || '']}
        onDeveloperClick={(dev) => {
          setSearchQuery(dev);
          setActiveTab('Search');
          setViewingAppId(null);
        }}
      />
    );

    switch (activeTab) {
      case 'Today': return <TodayPage apps={filteredApps.slice(0, 3)} onSelect={setViewingAppId} onAccountClick={() => setShowAccount(true)} downloadedApps={downloadedApps} purchaseLibrary={purchaseLibrary} onDownload={handleDownload} isDownloading={isDownloading} downloadStatus={downloadStatus} currentUser={currentUser} />;
      case 'Games': return <ListPage title="Games" category="Game" apps={filteredApps.filter(a => a.category === 'Game')} onSelect={setViewingAppId} onDownload={handleDownload} isDownloading={isDownloading} onAccountClick={() => setShowAccount(true)} downloadedApps={downloadedApps} purchaseLibrary={purchaseLibrary} downloadStatus={downloadStatus} currentUser={currentUser} />;
      case 'Apps': return <ListPage title="Apps" category="App" apps={filteredApps.filter(a => a.category === 'App')} onSelect={setViewingAppId} onDownload={handleDownload} isDownloading={isDownloading} onAccountClick={() => setShowAccount(true)} downloadedApps={downloadedApps} purchaseLibrary={purchaseLibrary} downloadStatus={downloadStatus} currentUser={currentUser} />;
      case 'Search': return <SearchPage apps={filteredApps} onSelect={setViewingAppId} query={searchQuery} setQuery={setSearchQuery} downloadedApps={downloadedApps} purchaseLibrary={purchaseLibrary} onDownload={handleDownload} isDownloading={isDownloading} downloadStatus={downloadStatus} />;
      case 'Admin': return (
        <AdminPage 
          isAuthenticated={isAdminAuthenticated} 
          password={passwordInput}
          setPassword={setPasswordInput}
          onLogin={() => {
            if (passwordInput === 'EMAD8912') {
              setIsAdminAuthenticated(true);
            } else {
              alert('Wrong password');
            }
          }}
          onAdd={handleAddApp}
          onUpdate={handleUpdateApp}
          apps={apps}
          onDelete={handleDeleteApp}
          allUsers={allUsers}
          onAddUser={(user) => setAllUsers([...allUsers, user])}
          onUpdateUser={(user) => setAllUsers(allUsers.map(u => u.id === user.id ? user : u))}
          onDeleteUser={(id) => setAllUsers(allUsers.filter(u => u.id !== id))}
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans flex justify-center selection:bg-blue-100 transition-colors duration-300">
      <div className="w-full max-w-[500px] bg-white dark:bg-black min-h-screen relative shadow-2xl flex flex-col border-x border-gray-100 dark:border-zinc-800 transition-colors duration-300">
        <div id="main-scroll-container" className="flex-1 relative overflow-y-auto overflow-x-hidden no-scrollbar pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewingAppId || activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Account Modal */}
        <AnimatePresence>
          {showAccount && (
            <AccountModal 
              apps={apps}
              downloadedApps={downloadedApps}
              purchaseLibrary={purchaseLibrary}
              userCountry={userCountry} 
              setUserCountry={setUserCountry} 
              balance={userBalance}
              onAddFunds={(amt) => setPasswordPrompt({ type: 'funds', amount: amt })}
              onClose={() => setShowAccount(false)}
              onSelectApp={(id) => {
                setViewingAppId(id);
                setShowAccount(false);
              }}
              notificationsEnabled={notificationsEnabled}
              toggleNotifications={toggleNotifications}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
            />
          )}

          {passwordPrompt && (
            <PasswordPrompt 
              password={
                passwordPrompt.type === 'funds' 
                  ? (passwordPrompt.amount === 25 ? 'djwar25' : 
                     passwordPrompt.amount === 50 ? 'djwar50' : 
                     passwordPrompt.amount === 100 ? 'djwar100' : storePassword)
                  : storePassword
              }
              onConfirm={() => {
                const { type, amount, appId } = passwordPrompt;
                if (type === 'funds' && amount) {
                  setUserBalance(prev => prev + amount);
                  setPasswordPrompt(null);
                  alert(`Successfully added $${amount} to your balance!`);
                } else if (type === 'purchase' && appId) {
                  executeDownload(appId);
                }
              }}
              onCancel={() => {
                setPasswordPrompt(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Side Button Confirmation */}
        <AnimatePresence>
          {confirmingAppId && (
            <SideButtonConfirmation 
              app={apps.find(a => a.id === confirmingAppId)!} 
              onConfirm={() => executeDownload(confirmingAppId)}
              onCancel={() => setConfirmingAppId(null)}
            />
          )}
        </AnimatePresence>

            {/* Navigation Bar - iOS 18 iPad aesthetic adapted for mobile */}
            {!viewingAppId && (
              <div className="fixed bottom-6 w-full px-4 flex justify-center z-50">
                {activeTab !== 'Search' ? (
                  <div className="flex items-center gap-2 max-w-[500px] w-full mx-auto">
                    <div className="flex-1 flex items-center justify-around bg-[#1c1c1e] p-[5px] rounded-full shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] border border-white/5">
                      <NavButton icon={LayoutTemplate} label="Today" active={activeTab === 'Today'} onClick={() => setActiveTab('Today')} />
                      <NavButton icon={Rocket} label="Games" active={activeTab === 'Games'} onClick={() => setActiveTab('Games')} />
                      <NavButton icon={Layers} label="Apps" active={activeTab === 'Apps'} onClick={() => setActiveTab('Apps')} />
                      <NavButton icon={Joystick} label="Arcade" active={activeTab === 'Arcade'} onClick={() => setActiveTab('Arcade')} />
                      <NavButton icon={Lock} label="Admin" active={activeTab === 'Admin'} onClick={() => setActiveTab('Admin')} />
                    </div>
                    <button 
                      onClick={() => setActiveTab('Search')}
                      className="w-[62px] h-[62px] shrink-0 rounded-full bg-[#1c1c1e] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] border border-white/5 flex items-center justify-center text-white hover:bg-[#2c2c2e] transition-colors"
                    >
                      <Search size={28} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 max-w-[500px] w-full mx-auto">
                    <button 
                      onClick={() => setActiveTab('Today')}
                      className="w-[62px] h-[62px] shrink-0 rounded-full bg-[#1c1c1e] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] border border-white/5 flex items-center justify-center text-white hover:bg-[#2c2c2e] transition-colors"
                    >
                      <LayoutTemplate size={28} strokeWidth={2.5} />
                    </button>
                    <div className="flex-1 h-[62px] rounded-full bg-[#1c1c1e] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] border border-white/5 flex items-center px-6 gap-3">
                      <Search size={24} strokeWidth={3} className="text-white" />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Games, Apps, and More"
                        className="bg-transparent border-none text-[#8e8e93] focus:text-white font-bold text-[19px] focus:outline-none w-full placeholder:text-[#8e8e93]"
                        autoFocus
                      />
                      <Mic size={24} strokeWidth={2.5} className="text-white" />
                    </div>
                  </div>
                )}
              </div>
            )}
      </div>
    </div>
  );
}

// --- Subcomponents ---

function PasswordPrompt({ password, onConfirm, onCancel }: { password: string, onConfirm: () => void, onCancel: () => void }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === password) {
      onConfirm();
    } else {
      setError(true);
      setInput('');
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-[300px] bg-white/90 backdrop-blur-xl rounded-[2rem] overflow-hidden shadow-2xl border border-white/20"
      >
        <form onSubmit={handleSubmit} className="p-6 pt-8 space-y-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <User className="text-white" size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-black">Sign In</h3>
            <p className="text-[12px] text-gray-500 font-medium">Enter the Apple ID password for your account.</p>
          </div>
          
          <div className="w-full space-y-4">
            <div className={`relative transition-transform ${error ? 'animate-shake' : ''}`}>
              <input 
                autoFocus
                type="password" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Password" 
                className="w-full bg-gray-100/50 p-3 rounded-xl border border-gray-100 text-center font-bold focus:bg-white transition-all outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onCancel}
                className="flex-1 py-3 text-blue-500 font-bold text-sm"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20"
              >
                Sign In
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function AccountModal({ 
  onClose, 
  userCountry, 
  setUserCountry, 
  balance, 
  onAddFunds,
  apps,
  downloadedApps,
  purchaseLibrary,
  onSelectApp,
  notificationsEnabled,
  toggleNotifications,
  darkMode,
  toggleDarkMode,
  currentUser,
  setCurrentUser
}: { 
  onClose: () => void, 
  userCountry: string, 
  setUserCountry: (c: string) => void, 
  balance: number, 
  onAddFunds: (amount: number) => void,
  apps: AppEntry[],
  downloadedApps: Set<string>,
  purchaseLibrary: Set<string>,
  onSelectApp: (id: string) => void,
  notificationsEnabled: boolean,
  toggleNotifications: () => void,
  darkMode: boolean,
  toggleDarkMode: () => void,
  currentUser: {name: string, email: string} | null,
  setCurrentUser: (user: {name: string, email: string} | null) => void
}) {
  const [view, setView] = useState<'main' | 'country' | 'funds' | 'languages' | 'purchased' | 'history'>('main');
  const [purchasedFilter, setPurchasedFilter] = useState<'all' | 'not_on_iphone' | 'games' | 'apps'>('all');
  const [selectedCountry, setSelectedCountry] = useState(userCountry);

  const countries = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany", 
    "France", "Japan", "China", "South Korea", "Brazil", "India"
  ];

  const languages = ["English", "Kurdish"];
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const handleSaveCountry = (country: string) => {
    setSelectedCountry(country);
    setUserCountry(country);
    setView('main');
  };

  const addOptions = [25, 50, 100];

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed inset-0 z-[60] bg-white/40 dark:bg-black/40 backdrop-blur-3xl flex flex-col"
    >
      <div className="p-6 h-20 flex items-center justify-between border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-10 transition-colors">
        {view !== 'main' ? (
          <button onClick={() => setView('main')} className="text-blue-500 font-bold flex items-center gap-1">
            <ChevronLeft size={20} />
            <span>Account</span>
          </button>
        ) : (
          <h2 className="text-xl font-bold">Account</h2>
        )}
        <button onClick={onClose} className="text-blue-500 font-bold">Done</button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-zinc-950 pb-10 transition-colors">
        <AnimatePresence mode="wait">
          {!currentUser ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="px-6 space-y-8 mt-12 flex flex-col items-center justify-center"
            >
              <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-2">
                <User className="text-white" size={40} />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sign in to Apple ID</h2>
                <p className="text-gray-500 text-sm font-medium">Use your Apple ID to sign in and download apps.</p>
              </div>
              
              <form 
                className="w-full max-w-sm space-y-4 pt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const email = fd.get('email') as string;
                  if (email) {
                    setCurrentUser({ name: email.split('@')[0], email });
                  }
                }}
              >
                <input 
                  name="email"
                  type="email" 
                  placeholder="Apple ID" 
                  required
                  className="w-full bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-white/5 font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
                <input 
                  name="password"
                  type="password" 
                  placeholder="Password" 
                  className="w-full bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-white/5 font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
                <button 
                  type="submit"
                  className="w-full py-4 mt-2 bg-blue-500 text-white font-bold rounded-xl text-lg shadow-md shadow-blue-500/20"
                >
                  Sign In
                </button>
              </form>
            </motion.div>
          ) : view === 'main' ? (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="px-6 space-y-8 mt-6"
            >
              {/* User Profile */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-white/5 flex items-center gap-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden ring-4 ring-gray-50 dark:ring-white/5">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} alt="User" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 capitalize">{currentUser.name}</h3>
                  <p className="text-gray-400 text-sm">{currentUser.email}</p>
                </div>
              </div>

              {/* Apple ID Balance */}
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-white/5 flex justify-between items-center shadow-sm">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Apple ID Balance</p>
                  <p className="text-xl font-black text-black dark:text-white transition-colors">${balance.toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => setView('funds')}
                  className="bg-blue-500/10 text-blue-600 px-4 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-wider"
                >
                  Manage
                </button>
              </div>

              {/* Menu Sections */}
              <div className="mt-8 space-y-8">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-white/5 divide-y divide-gray-100 dark:divide-white/5 overflow-hidden shadow-sm">
                  <AccountRow icon={LayoutGrid} label="Purchased" onClick={() => setView('purchased')} showChevron />
                  <AccountRow icon={CreditCard} label="Purchase History" onClick={() => setView('history')} showChevron />
                  <AccountRow icon={Smartphone} label="Not on this iPhone" onClick={() => { setView('purchased'); setPurchasedFilter('not_on_iphone'); }} showChevron />
                  <AccountRow icon={Gamepad2} label="Games" onClick={() => { setView('purchased'); setPurchasedFilter('games'); }} showChevron />
                  <AccountRow icon={Smartphone} label="Apps" onClick={() => { setView('purchased'); setPurchasedFilter('apps'); }} showChevron />
                  <AccountRow icon={CreditCard} label="Add Payment Method" onClick={() => alert('Secure payment integration required')} showChevron />
                  <AccountRow icon={Calendar} label="Subscriptions" />
                  <AccountRow 
                    icon={notificationsEnabled ? Bell : BellOff} 
                    label="Push Notifications" 
                    value={notificationsEnabled ? "On" : "Off"}
                    onClick={toggleNotifications}
                    showChevron
                  />
                  <AccountRow 
                    icon={darkMode ? Moon : Sun} 
                    label="Dark Mode" 
                    value={darkMode ? "On" : "Off"}
                    onClick={toggleDarkMode}
                    showChevron
                  />
                </div>
                
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-white/5 divide-y divide-gray-100 dark:divide-white/5 overflow-hidden shadow-sm">
                  <AccountRow 
                    icon={Globe} 
                    label="Country/Region" 
                    value={selectedCountry} 
                    showChevron 
                    onClick={() => setView('country')}
                  />
                  <AccountRow 
                    icon={Globe} 
                    label="Languages" 
                    value={selectedLanguage} 
                    showChevron 
                    onClick={() => setView('languages')}
                  />
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                  <AccountRow 
                    icon={Wallet} 
                    label="Add Money to Account" 
                    showChevron 
                    onClick={() => setView('funds')}
                  />
                </div>

                {/* Automation Sections */}
                <div className="space-y-1">
                  <p className="px-6 py-2 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Updates</p>
                  <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-white/5 divide-y divide-gray-100 dark:divide-white/5 overflow-hidden shadow-sm">
                    <AccountRow icon={Plus} label="Upcoming Automatic Updates" />
                    <AccountRow icon={Check} label="Updated Recently" />
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                  <button onClick={() => setCurrentUser(null)} className="w-full p-4 text-red-500 font-bold text-center">Sign Out</button>
                </div>
              </div>
            </motion.div>
          ) : view === 'funds' ? (
            <motion.div
              key="funds"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="p-6 space-y-8"
            >
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold">Add Funds</h3>
                <p className="text-gray-500 text-sm">Select an amount to add to your Apple ID balance.</p>
              </div>

              <div className="space-y-4">
                {addOptions.map(amount => (
                  <button 
                    key={amount}
                    onClick={() => { onAddFunds(amount); setView('main'); }}
                    className="w-full flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 active:bg-blue-50 transition-colors shadow-sm"
                  >
                    <span className="text-2xl font-black text-blue-500">${amount}</span>
                    <div className="bg-blue-500 text-white px-6 py-2 rounded-full font-bold text-sm">Add</div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : view === 'purchased' ? (
            <motion.div
              key="purchased"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col h-full bg-white"
            >
              <div className="px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Purchased</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPurchasedFilter(purchasedFilter === 'games' ? 'all' : 'games')}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${purchasedFilter === 'games' ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white border-gray-200 text-gray-400'}`}
                    >
                      Games
                    </button>
                    <button 
                      onClick={() => setPurchasedFilter(purchasedFilter === 'apps' ? 'all' : 'apps')}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${purchasedFilter === 'apps' ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white border-gray-200 text-gray-400'}`}
                    >
                      Apps
                    </button>
                  </div>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setPurchasedFilter('all')}
                    className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${purchasedFilter === 'all' || purchasedFilter === 'games' || purchasedFilter === 'apps' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setPurchasedFilter('not_on_iphone')}
                    className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${purchasedFilter === 'not_on_iphone' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                  >
                    <Smartphone size={14} className={purchasedFilter === 'not_on_iphone' ? 'text-blue-500' : 'text-gray-400'} />
                    Not on this iPhone
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-white divide-y divide-gray-50">
                {(() => {
                  const items = Array.from(purchasedFilter === 'not_on_iphone' 
                    ? Array.from(purchaseLibrary).filter(id => !downloadedApps.has(id))
                    : Array.from(purchaseLibrary)
                  )
                  .map(id => apps.find(a => a.id === id))
                  .filter(app => {
                    if (!app) return false;
                    if (purchasedFilter === 'games') return app.category === 'Game';
                    if (purchasedFilter === 'apps') return app.category === 'App';
                    return true;
                  });

                  if (items.length === 0) {
                    return (
                      <div className="p-12 text-center text-gray-400 py-32 space-y-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto ring-1 ring-gray-100">
                          <Download size={32} className="opacity-20" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-gray-900">No Apps Found</p>
                          <p className="text-sm px-10">Apps you have previously downloaded will appear here.</p>
                        </div>
                      </div>
                    );
                  }

                  return items.map(app => {
                    if (!app) return null;
                    const isOnDevice = downloadedApps.has(app.id);
                    return (
                      <div 
                        key={app.id} 
                        onClick={() => onSelectApp(app.id)}
                        className="flex items-center gap-4 p-4 active:bg-gray-50 transition-all cursor-pointer group"
                      >
                        <img src={app.iconUrl} className="w-12 h-12 rounded-xl shadow-sm border border-black/5 transition-transform group-active:scale-95" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate text-gray-900 group-hover:text-blue-600 transition-colors">{app.name}</p>
                          <p className="text-gray-400 text-[11px] truncate uppercase font-bold tracking-tight opacity-70">{app.subtitle}</p>
                        </div>
                        {isOnDevice ? (
                          <button 
                            className="bg-gray-100 text-blue-500 px-4 py-1.5 rounded-full font-black text-[11px] uppercase tracking-wider active:scale-90 transition-transform"
                            onClick={(e) => { e.stopPropagation(); onSelectApp(app.id); }}
                          >
                            Open
                          </button>
                        ) : (
                          <button 
                            className="text-blue-500 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center active:scale-90 active:bg-blue-100 transition-all"
                            onClick={(e) => { e.stopPropagation(); onSelectApp(app.id); }}
                          >
                            <Download size={20} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </motion.div>
          ) : view === 'history' ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="p-6 space-y-6"
            >
              <h3 className="text-2xl font-bold">Purchase History</h3>
              <div className="bg-white rounded-3xl border border-gray-100 divide-y divide-gray-50 overflow-hidden shadow-sm px-4">
                {Array.from(downloadedApps).length > 0 ? (
                  Array.from(downloadedApps).map(id => {
                    const app = apps.find(a => a.id === id);
                    if (!app) return null;
                    return (
                      <div key={app.id} className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-3">
                           <img src={app.iconUrl} className="w-10 h-10 rounded-lg shadow-sm" />
                           <div>
                              <p className="font-bold text-sm text-gray-900">{app.name}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Total: {app.price || 'Free'}</p>
                           </div>
                        </div>
                        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Yesterday</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-20 text-center text-gray-400">
                    <CreditCard size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="font-bold">No Purchase History</p>
                    <p className="text-sm">Your order history will appear here.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : view === 'country' || view === 'languages' ? (
            <motion.div
              key="country-region"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="p-6 space-y-6"
            >
              <h3 className="text-2xl font-bold">{view === 'languages' ? 'Languages' : 'Country or Region'}</h3>
              <p className="text-gray-500 text-sm">Select your preferred {view === 'languages' ? 'language' : 'location'} for content.</p>
              
              <div className="bg-white rounded-3xl border border-gray-100 divide-y divide-gray-100 overflow-hidden shadow-sm">
                {(view === 'languages' ? languages : countries).map(item => (
                  <button 
                    key={item}
                    onClick={() => view === 'languages' ? (setSelectedLanguage(item), setView('main')) : handleSaveCountry(item)}
                    className="w-full px-6 py-4 flex justify-between items-center text-left active:bg-gray-50 transition-colors"
                  >
                    <span className={`font-bold text-sm ${ (view === 'languages' ? selectedLanguage : selectedCountry) === item ? 'text-blue-500' : 'text-gray-800'}`}>{item}</span>
                    {((view === 'languages' ? selectedLanguage : selectedCountry) === item) && <Check size={18} className="text-blue-500" />}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function AccountRow({ icon: Icon, label, value, showChevron, onClick }: { icon: any, label: string, value?: string, showChevron?: boolean, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex items-center gap-4 p-4 active:bg-gray-50 dark:active:bg-zinc-800 cursor-pointer group transition-colors">
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 dark:text-gray-400 group-active:scale-95 transition-transform">
        <Icon size={18} />
      </div>
      <span className="flex-1 font-medium text-gray-900 dark:text-gray-100">{label}</span>
      {value && <span className="text-gray-400 text-sm">{value}</span>}
      {showChevron && <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />}
    </div>
  );
}

function SideButtonConfirmation({ app, onConfirm, onCancel }: { app: AppEntry, onConfirm: () => void, onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-12 sm:pb-24">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      
      {/* Side Button Indicator */}
      <motion.div 
        initial={{ x: 100 }}
        animate={{ x: 0 }}
        exit={{ x: 100 }}
        className="fixed right-0 top-[20%] z-[110] flex flex-col items-center gap-4"
      >
        <div className="relative mr-[-10px]">
          <div className="w-1.5 h-16 bg-white/20 rounded-l-full backdrop-blur-md border border-white/10" />
          <motion.div 
            animate={{ scaleX: [1, 1.5, 1], x: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute right-0 top-0 w-1.5 h-16 bg-blue-500 rounded-l-full shadow-lg shadow-blue-500/50"
          />
          <div className="absolute top-1/2 -translate-y-1/2 right-4 whitespace-nowrap bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-xl">
            Double Click to Install
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-[380px] bg-white rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] p-8 space-y-6"
      >
        <div className="flex items-start gap-5">
           <img src={app.iconUrl} className="w-16 h-16 rounded-2xl shadow-xl border border-gray-100 object-cover" />
           <div className="flex-1 min-w-0 pt-1">
             <h3 className="font-bold text-xl truncate">{app.name}</h3>
             <p className="text-gray-400 text-sm truncate">Apple ID: pitop6988@gmail.com</p>
           </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-gray-100">
           <div className="flex justify-between items-center">
             <span className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">Account</span>
             <span className="font-bold text-gray-800">pitop6988@gmail.com</span>
           </div>
           <div className="flex justify-between items-center">
             <span className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">Price</span>
             <span className="font-black text-gray-900">{app.price || 'Free'}</span>
           </div>
        </div>

        <div className="pt-6">
           {(!app.price || app.price === 'Free') ? (
             <button 
               onClick={onConfirm}
               className="w-full bg-blue-500 text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/30 active:scale-95 transition-transform"
             >
               Confirm with Side Button
             </button>
           ) : (
             <div className="space-y-3">
               <button 
                 disabled
                 className="w-full bg-gray-200 text-gray-400 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest cursor-not-allowed opacity-70"
               >
                 Purchase Required
               </button>
               <p className="text-[10px] text-red-500 font-bold text-center uppercase tracking-widest">Insufficient Funds</p>
             </div>
           )}
           <button 
            onClick={onCancel}
            className="w-full mt-4 text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-gray-600 transition-colors"
           >
             Cancel
           </button>
        </div>
      </motion.div>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className={`relative flex flex-col items-center justify-center h-[52px] w-[60px] rounded-full gap-0.5 transition-all duration-300 z-10 ${active ? 'text-blue-400' : 'text-white hover:text-white/80'}`}
    >
      {active && (
        <motion.div 
          layoutId="activeTabBackground"
          className="absolute inset-0 bg-[#3a3a3c] rounded-full -z-10"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <Icon size={24} strokeWidth={2.5} />
      <span className="text-[10px] font-bold mt-0.5 tracking-tight">{label}</span>
    </button>
  );
}

function DownloadButton({ 
  app, 
  onDownload, 
  isDownloading, 
  isDownloaded, 
  isPurchased = false,
  status = 'idle',
  variant = 'blue' 
}: { 
  app: AppEntry, 
  onDownload: (id: string) => void, 
  isDownloading: boolean, 
  isDownloaded: boolean, 
  isPurchased?: boolean,
  status?: 'idle' | 'second' | 'finish' | 'open' | 'save',
  variant?: 'blue' | 'white' | 'gray'
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloaded && app.downloadUrl) {
      window.open(app.downloadUrl, '_blank');
    } else {
      onDownload(app.id);
    }
  };

  const baseStyles = "rounded-full font-bold transition-all flex items-center justify-center relative overflow-hidden active:scale-95 px-5";
  const variants = {
    blue: "bg-[#007aff] text-white text-[15px] py-1.5 font-bold",
    white: "bg-white text-black text-[11px] py-1.5 shadow-lg uppercase font-black",
    gray: "bg-gray-100 text-[#007aff] text-[15px] min-w-[76px] h-[30px] px-4 font-bold"
  };

  if (isDownloading) {
    const isSecond = status === 'second';
    return (
      <button disabled className={`${baseStyles} ${variants[variant]} opacity-90 cursor-wait min-w-[76px] transition-all duration-500`}>
        {isSecond ? (
          <div className="relative w-6 h-6 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="12"
                cy="12"
                r="10"
                className="stroke-gray-200 fill-none"
                strokeWidth="2"
              />
              <motion.circle
                cx="12"
                cy="12"
                r="10"
                className={`${variant === 'blue' ? 'stroke-white' : 'stroke-blue-500'} fill-none`}
                strokeWidth="2"
                strokeDasharray="62.8"
                initial={{ strokeDashoffset: 62.8 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: app.redirectTime || 3, ease: "linear" }}
              />
            </svg>
            <div className="absolute w-1.5 h-1.5 bg-current rounded-sm" />
          </div>
        ) : (
          <>
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: app.redirectTime || 10, ease: "linear" }}
              className="absolute inset-y-0 left-0 bg-white/20"
            />
            <span className="relative z-10 text-[10px] tracking-tight">{status === 'finish' ? 'FINISH' : 'LOADING'}</span>
          </>
        )}
      </button>
    );
  }

  if (isDownloaded) {
    const isUpdate = app.versionDate === 'Just Now';
    return (
      <button onClick={handleClick} className={`${baseStyles} ${variants[variant]}`}>
        {isUpdate ? 'UPDATE' : (app.downloadUrl ? 'SAVE' : 'OPEN')}
      </button>
    );
  }

  if (isPurchased) {
    return (
      <button onClick={handleClick} className={`flex items-center justify-center active:scale-90 transition-transform ${variant === 'white' ? 'text-white' : 'text-blue-500'}`}>
        <CloudDownload size={24} strokeWidth={2.5} />
      </button>
    );
  }

  const hasRedirection = !!(app.iosUrl || app.androidUrl || app.apkUrl || app.externalLink);

  return (
    <button onClick={handleClick} className={`${baseStyles} ${variants[variant]}`}>
      {app.price && app.price !== 'Free' ? app.price : (hasRedirection ? 'Open' : 'Get')}
    </button>
  );
}

function TodayPage({ 
  apps, 
  onSelect, 
  onAccountClick, 
  downloadedApps, 
  purchaseLibrary,
  onDownload, 
  isDownloading, 
  downloadStatus,
  currentUser
}: { 
  apps: AppEntry[], 
  onSelect: (id: string) => void, 
  onAccountClick: () => void, 
  downloadedApps: Set<string>, 
  purchaseLibrary: Set<string>,
  onDownload: (id: string) => void, 
  isDownloading: string | null, 
  downloadStatus: Record<string, string>,
  currentUser: {name: string, email: string} | null
}) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  return (
    <div className="p-6 pt-12 space-y-6 pb-32">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-gray-400 capitalize text-[13px] font-bold tracking-tight mb-1">{today}</p>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 italic tracking-tighter">Today</h1>
        </div>
        <div 
          onClick={onAccountClick}
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden shadow-sm ring-4 ring-gray-50 dark:ring-white/5 cursor-pointer active:scale-95 transition-all flex items-center justify-center text-gray-400"
        >
          {currentUser ? (
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} alt="User Profile" />
          ) : (
            <User size={24} />
          )}
        </div>
      </div>
      
      {/* Featured Single Card */}
      {apps[0] && (
        <motion.div 
          onClick={() => onSelect(apps[0].id)}
          className="relative rounded-3xl overflow-hidden shadow-xl shadow-black/10 aspect-[4/5] cursor-pointer group"
        >
          <img src={apps[0].screenshots[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          <div className="absolute top-6 left-6 right-6">
            <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest">{apps[0].category === 'Game' ? 'World Premiere' : 'Editors Choice'}</span>
            <h2 className="text-3xl font-bold text-white mt-1 leading-tight">Step Into the Future</h2>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center gap-4 bg-white/10 dark:bg-black/20 backdrop-blur-md transition-colors">
             <img src={apps[0].iconUrl} className="w-12 h-12 rounded-xl shadow-lg border border-white/10" referrerPolicy="no-referrer" />
             <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm truncate">{apps[0].name}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-white/60 text-xs truncate font-medium">{apps[0].subtitle}</p>
                  {(apps[0].iosUrl || apps[0].androidUrl) && (
                    <div className="flex items-center gap-1 opacity-60">
                      {apps[0].iosUrl && <Smartphone size={10} className="text-white fill-white/20" />}
                      {apps[0].androidUrl && <SmartphoneNfc size={10} className="text-white fill-white/20" />}
                    </div>
                  )}
                </div>
             </div>
             <DownloadButton 
               app={apps[0]} 
               onDownload={onDownload} 
               isDownloading={isDownloading === apps[0].id} 
               isDownloaded={downloadedApps.has(apps[0].id)} 
               isPurchased={purchaseLibrary.has(apps[0].id)}
               status={downloadStatus[apps[0].id] as any}
               variant="white" 
             />
          </div>
        </motion.div>
      )}

      {/* Suggested List Card */}
      <motion.div 
        className="bg-zinc-900 rounded-[2.5rem] p-6 shadow-xl shadow-black/20 space-y-6 transition-colors"
      >
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Collection</span>
            <h3 className="text-xl font-bold text-white">Apps for You</h3>
          </div>
        </div>

        <div className="space-y-5">
          {apps.slice(0, 4).map(app => (
            <div key={app.id} onClick={(e) => { e.stopPropagation(); onSelect(app.id); }} className="flex items-center gap-4 cursor-pointer active:opacity-60 transition-opacity">
              <img src={app.iconUrl} className="w-14 h-14 rounded-2xl shadow-sm border border-white/10" referrerPolicy="no-referrer" />
              <div className="flex-1 min-w-0 border-b border-white/5 pb-5 last:border-0 last:pb-0">
                <h4 className="font-bold text-[15px] truncate text-white">{app.name}</h4>
                <div className="flex items-center gap-2 pr-2">
                  <p className="text-white/40 text-xs truncate font-medium flex-1">{app.subtitle}</p>
                  {app.iosUrl && <Smartphone size={10} className="text-blue-400" />}
                  {app.androidUrl && <SmartphoneNfc size={10} className="text-green-400" />}
                </div>
              </div>
              <DownloadButton 
                app={app} 
                onDownload={onDownload} 
                isDownloading={isDownloading === app.id} 
                isDownloaded={downloadedApps.has(app.id)} 
                isPurchased={purchaseLibrary.has(app.id)}
                status={downloadStatus[app.id] as any}
                variant="gray" 
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function ListPage({ 
  title, 
  apps, 
  onSelect, 
  onDownload, 
  isDownloading, 
  onAccountClick, 
  downloadedApps, 
  purchaseLibrary,
  downloadStatus,
  currentUser
}: { 
  title: string, 
  category: AppCategory, 
  apps: AppEntry[], 
  onSelect: (id: string) => void, 
  onDownload: (id: string) => void, 
  isDownloading: string | null, 
  onAccountClick: () => void, 
  downloadedApps: Set<string>, 
  purchaseLibrary: Set<string>,
  downloadStatus: Record<string, string>,
  currentUser: {name: string, email: string} | null
}) {
  const featured = apps.slice(0, 3);
  const topCharts = apps.slice(0, 5);
  const categories = title === 'Games' 
    ? ['Action', 'RPG', 'Puzzle', 'Sports', 'Strategy', 'Indie']
    : ['Social', 'Photo', 'Music', 'Utility', 'Health', 'Travel'];

  return (
    <div className="pb-32 bg-white dark:bg-black transition-colors">
      {/* Page Header */}
      <div className="p-6 pt-12 flex justify-between items-center bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
        <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 italic tracking-tighter">{title}</h1>
        <div 
          onClick={onAccountClick}
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden shadow-sm ring-2 ring-gray-50 dark:ring-white/5 cursor-pointer active:scale-95 transition-all flex items-center justify-center text-gray-400"
        >
          {currentUser ? (
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} alt="User" />
          ) : (
            <User size={20} />
          )}
        </div>
      </div>

      {/* Category Chips */}
      <div className="px-6 flex overflow-x-auto gap-2 no-scrollbar py-2 border-b border-gray-50 dark:border-white/5 overflow-y-hidden transition-colors">
        {categories.map(c => (
          <button key={c} className="whitespace-nowrap px-4 py-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-blue-500 font-bold text-xs hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
            {c}
          </button>
        ))}
      </div>

      {/* Featured Header Slider */}
      <div className="p-6 pt-4">
        <div className="flex overflow-x-auto gap-4 no-scrollbar pb-2 -mx-6 px-6">
          {featured.map(app => (
            <motion.div 
              key={app.id} 
              onClick={() => onSelect(app.id)}
              className="min-w-[300px] max-w-[300px] space-y-2 cursor-pointer pt-2"
            >
              <div className="aspect-[16/9] rounded-2xl overflow-hidden relative shadow-lg">
                <img src={app.screenshots[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent flex items-center gap-4">
                   <img src={app.iconUrl} className="w-12 h-12 rounded-xl shadow-lg" referrerPolicy="no-referrer" />
                   <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{app.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-white/60 text-xs truncate font-medium">{app.subtitle}</p>
                        {(app.iosUrl || app.androidUrl) && (
                          <div className="flex items-center gap-1 opacity-60">
                            {app.iosUrl && <Smartphone size={10} className="text-white fill-white/20" />}
                            {app.androidUrl && <SmartphoneNfc size={10} className="text-white fill-white/20" />}
                          </div>
                        )}
                      </div>
                   </div>
                    <DownloadButton 
                       app={app} 
                       onDownload={onDownload} 
                       isDownloading={isDownloading === app.id} 
                       isDownloaded={downloadedApps.has(app.id)} 
                       isPurchased={purchaseLibrary.has(app.id)}
                       status={downloadStatus[app.id] as any}
                       variant="white" 
                    />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Top Charts Section */}
      <div className="p-6 pt-2 bg-black">
        <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-bold text-white">Top Charts</h2>
           <button className="text-blue-400 text-sm font-medium">See All</button>
        </div>
        <div className="space-y-6">
          {topCharts.map((app, idx) => (
              <div key={app.id} className="flex gap-4 items-center" onClick={() => onSelect(app.id)}>
                <span className="w-5 text-center font-bold text-white/40">{idx + 1}</span>
                <img src={app.iconUrl} className="w-14 h-14 rounded-2xl shadow-sm border border-white/5" referrerPolicy="no-referrer" />
                <div className={`flex-1 min-w-0 ${idx < topCharts.length - 1 ? 'border-b border-white/10' : ''} pb-4 flex justify-between items-center`}>
                  <div className="min-w-0 pr-2">
                     <h3 className="font-bold text-[15px] truncate text-white">{app.name}</h3>
                     <div className="flex items-center gap-2">
                        <p className="text-white/40 text-xs truncate font-medium">{app.subtitle}</p>
                        {app.iosUrl && <Smartphone size={10} className="text-blue-400" />}
                        {app.androidUrl && <SmartphoneNfc size={10} className="text-green-400" />}
                     </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                  <DownloadButton 
                    app={app} 
                    onDownload={onDownload} 
                    isDownloading={isDownloading === app.id} 
                    isDownloaded={downloadedApps.has(app.id)} 
                    isPurchased={purchaseLibrary.has(app.id)}
                    status={downloadStatus[app.id] as any}
                    variant="gray" 
                  />
                    {app.hasInAppPurchases && (
                      <span className="text-[8px] text-gray-300 font-bold uppercase tracking-tighter">In-App Purchases</span>
                    )}
                  </div>
                </div>
             </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function AppDetail({ 
  app, 
  onBack, 
  onDownload, 
  isDownloading, 
  isDownloaded, 
  isPurchased,
  downloadStatus, 
  onDeveloperClick 
}: { 
  app: AppEntry, 
  onBack: () => void, 
  onDownload: (id: string) => void, 
  isDownloading: boolean, 
  isDownloaded: boolean, 
  isPurchased: boolean,
  downloadStatus: string, 
  onDeveloperClick: (dev: string) => void 
}) {
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [fullscreenScreenshot, setFullscreenScreenshot] = useState<string | null>(null);
  const redirectionRef = useRef<HTMLDivElement>(null);
  const hasRedirection = !!(app.iosUrl || app.androidUrl || app.apkUrl || app.externalLink);
  const [scrolledAmount, setScrolledAmount] = useState(0);

  useEffect(() => {
    const el = document.getElementById('main-scroll-container');
    if (!el) return;
    const handleScroll = () => {
      setScrolledAmount(el.scrollTop);
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetClick = (id: string) => {
    if (hasRedirection) {
      // If there's only one link, open it directly
      const links = [app.apkUrl, app.iosUrl, app.androidUrl, app.externalLink].filter(Boolean);
      if (links.length === 1) {
        window.open(links[0], '_blank');
        return;
      }
      
      redirectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Temporary highlight effect
      const el = redirectionRef.current;
      if (el) {
        el.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
        setTimeout(() => { el.style.backgroundColor = 'transparent'; }, 2000);
      }
    } else {
      onDownload(id);
    }
  };

  return (
    <div className="h-full bg-white dark:bg-black relative transition-colors">
      {/* Header bar that appears on scroll */}
      <div 
        className={`px-4 h-[60px] flex items-center justify-between sticky top-0 z-40 transition-all duration-300 ${
          scrolledAmount > 100 
            ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-50 dark:border-white/5' 
            : 'bg-transparent'
        }`}
      >
        <button 
          onClick={onBack} 
          className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-[#1c1c1e] text-gray-700 dark:text-white/90 shadow-sm transition-transform active:scale-95 z-10"
        >
          <ChevronLeft size={24} strokeWidth={3} className="-ml-0.5" />
        </button>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: scrolledAmount > 150 ? 1 : 0, 
            scale: scrolledAmount > 150 ? 1 : 0.8
          }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-[0.4rem] overflow-hidden border border-gray-100 dark:border-white/10"
        >
          <img src={app.iconUrl} className="w-full h-full object-cover" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: scrolledAmount > 150 ? 1 : 0 }}
          className={`flex items-center gap-3 z-10 ${scrolledAmount > 150 ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          {app.hasInAppPurchases && (
            <div className="text-[9px] text-gray-500 dark:text-gray-400 font-bold leading-[1.1] text-right uppercase tracking-wide">
              In-App<br/>Purchases
            </div>
          )}
          <div className="origin-right ml-1">
            <DownloadButton 
              app={app} 
              onDownload={handleGetClick} 
              isDownloading={isDownloading} 
              isDownloaded={isDownloaded} 
              isPurchased={isPurchased}
              status={downloadStatus as any}
              variant="blue" 
            />
          </div>
        </motion.div>
      </div>

      <div className="pt-8 px-6 space-y-8 pb-32">
        {/* Header Section */}
        <div className="flex gap-5">
          <img 
            src={app.iconUrl || 'https://via.placeholder.com/150'} 
            className="w-28 h-28 rounded-[22%] shadow-2xl shadow-black/10 border border-gray-50 dark:border-white/5 cursor-pointer" 
            referrerPolicy="no-referrer" 
            onClick={() => alert(`App ID: ${app.id}\nCreator App ID: ${app.creatorAppleId || 'Not set'}`)}
          />
          <div className="flex-1 flex flex-col justify-between py-1">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 dark:text-gray-100">{app.name}</h1>
              <div className="flex items-center gap-2">
                <p className="text-gray-400 font-bold text-sm tracking-tight">{app.subtitle}</p>
                {hasRedirection && (
                  <div className="flex items-center gap-1.5 ml-1 border-l-2 border-gray-100 pl-2">
                    {app.iosUrl && <Smartphone size={12} className="text-blue-500" />}
                    {app.androidUrl && <SmartphoneNfc size={12} className="text-green-500" />}
                    {app.apkUrl && <ArrowDownToLine size={12} className="text-orange-500" />}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <DownloadButton 
                  app={app} 
                  onDownload={handleGetClick} 
                  isDownloading={isDownloading} 
                  isDownloaded={isDownloaded} 
                  isPurchased={isPurchased}
                  status={downloadStatus as any}
                  variant="blue" 
                />
                <button className="bg-gray-100 dark:bg-zinc-800 p-2.5 rounded-full text-blue-500 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all active:scale-90">
                  <Share2 size={20} />
                </button>
              </div>
              <div className="flex items-center px-1">
                {app.hasInAppPurchases && (
                  <span className="text-[9px] text-gray-400 uppercase font-black tracking-tighter bg-gray-50 dark:bg-zinc-900 px-1.5 py-0.5 rounded">In-App Purchases</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-5 divide-x divide-gray-100 dark:divide-white/5 py-4 border-y border-gray-100 dark:border-white/5">
          <div className="flex flex-col items-center gap-1">
            <p className="text-[9px] text-gray-400 font-black uppercase">Rating</p>
            <div className="flex items-center gap-1 font-bold text-gray-700 dark:text-gray-300 text-sm">
              {app.rating} <Star size={12} className="fill-gray-700 dark:fill-gray-300" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-[9px] text-gray-400 font-black uppercase">Age</p>
            <div className="font-bold text-gray-700 dark:text-gray-300 text-sm">{app.ageRating}</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-[9px] text-gray-400 font-black uppercase">Downloads</p>
            <div className="font-bold text-gray-700 dark:text-gray-300 text-sm">{app.downloads || '10K+'}</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-[9px] text-gray-400 font-black uppercase">Size</p>
            <div className="font-bold text-gray-700 dark:text-gray-300 text-sm whitespace-nowrap">{app.size}</div>
          </div>
          <div className="flex flex-col items-center gap-1">
             <p className="text-[9px] text-gray-400 font-black uppercase">Dev</p>
             <button onClick={() => onDeveloperClick(app.developer)} className="font-bold text-blue-500 text-[10px] truncate max-w-full px-1">{app.developer.split(' ')[0]}</button>
          </div>
        </div>

        {/* What's New */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
             <h3 className="font-bold text-xl">What's New</h3>
             <button onClick={() => setShowVersionHistory(true)} className="text-blue-500 text-sm font-medium hover:opacity-70 transition-all">Version History</button>
          </div>
          <div className="flex justify-between text-gray-400 text-xs font-medium">
             <span>Version {app.version || '1.0.0'}</span>
             <span>{app.versionDate || 'Recently'}</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {app.whatsNew || 'New features and bug fixes to improve your experience.'}
          </p>
        </div>

        {/* Screenshots */}
        <div className="space-y-4">
          <h3 className="font-bold text-xl">Preview</h3>
          <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar -mx-6 px-6">
            {app.screenshots.map((s, i) => (
              <img 
                key={i} 
                src={s} 
                onClick={() => setFullscreenScreenshot(s)}
                className="h-80 rounded-3xl object-cover shadow-lg cursor-zoom-in active:scale-95 transition-transform" 
                referrerPolicy="no-referrer" 
              />
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">Description</h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-[15px]">{app.description}</p>
        </div>

        {/* Dynamic Events Section */}
        {app.events && app.events.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="font-bold text-xl">Events</h3>
            {app.events.map(event => (
              <div key={event.id} className="relative aspect-[16/9] rounded-3xl overflow-hidden group active:scale-[0.98] transition-transform">
                <img src={event.imageUrl} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                   <div className="space-y-1">
                      <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black text-white uppercase tracking-tighter">
                        {event.badge}
                      </span>
                      <h4 className="text-xl font-bold text-white leading-tight">{event.title}</h4>
                      <p className="text-white/70 text-sm font-medium">{event.subtitle}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Redirection Settings Section */}
        {(app.iosUrl || app.androidUrl || app.apkUrl || app.externalLink) && (
          <div ref={redirectionRef} className="space-y-4 pt-6 border-t border-gray-100 transition-colors duration-500 rounded-3xl p-2 -mx-2">
             <div className="grid grid-cols-1 gap-3">
               {app.apkUrl && (
                 <button 
                   onClick={() => window.open(app.apkUrl, '_blank')}
                   className="w-full bg-orange-50/30 p-5 rounded-3xl border-2 border-dashed border-orange-200 flex items-center justify-between group active:scale-95 transition-all hover:bg-orange-50"
                 >
                   <div className="flex items-center gap-4">
                     <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-500/20 text-white group-hover:scale-110 transition-transform">
                       <ArrowDownToLine size={24} strokeWidth={2.5} />
                     </div>
                     <div className="text-left">
                       <p className="font-black text-base text-gray-900 leading-tight">Direct APK Download</p>
                       <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-0.5">Install Package Directly</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="bg-orange-100 text-orange-700 text-[9px] font-black px-2 py-1 rounded-full uppercase">Fast</span>
                     <ChevronRight size={20} className="text-orange-300 group-hover:text-orange-500 transform group-hover:translate-x-1 transition-all" />
                   </div>
                 </button>
               )}
               <div className="grid grid-cols-2 gap-3">
                 {app.iosUrl && (
                   <button 
                     onClick={() => window.open(app.iosUrl, '_blank')}
                     className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col gap-3 group active:scale-95 transition-all shadow-sm hover:shadow-md text-left"
                   >
                     <div className="bg-blue-50 p-2.5 rounded-2xl w-fit group-hover:bg-blue-100 transition-colors">
                       <Smartphone size={20} className="text-blue-500" />
                     </div>
                     <div>
                       <p className="font-bold text-sm text-gray-900">iOS Store</p>
                       <p className="text-[9px] font-medium text-gray-400 uppercase tracking-widest">App Store</p>
                     </div>
                   </button>
                 )}
                 {app.androidUrl && (
                   <button 
                     onClick={() => window.open(app.androidUrl, '_blank')}
                     className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col gap-3 group active:scale-95 transition-all shadow-sm hover:shadow-md text-left"
                   >
                     <div className="bg-green-50 p-2.5 rounded-2xl w-fit group-hover:bg-green-100 transition-colors">
                       <SmartphoneNfc size={20} className="text-green-500" />
                     </div>
                     <div>
                       <p className="font-bold text-sm text-gray-900">Play Store</p>
                       <p className="text-[9px] font-medium text-gray-400 uppercase tracking-widest">Google Play</p>
                     </div>
                   </button>
                 )}
               </div>
               {app.externalLink && (
                 <button 
                   onClick={() => window.open(app.externalLink, '_blank')}
                   className="w-full bg-gray-50 p-4 rounded-3xl border border-gray-100 flex items-center justify-between group active:scale-95 transition-all hover:bg-white hover:border-gray-200"
                 >
                   <div className="flex items-center gap-4">
                     <div className="bg-white p-2.5 rounded-2xl group-hover:bg-gray-100 transition-colors border border-gray-100 shadow-sm">
                       <PlayCircle size={20} className="text-gray-600" />
                     </div>
                     <div className="text-left">
                       <p className="font-bold text-sm text-gray-900">Official Website</p>
                       <p className="text-[9px] font-medium text-gray-400 uppercase tracking-widest">Visit Link</p>
                     </div>
                   </div>
                   <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-900 transform group-hover:translate-x-1 transition-all" />
                 </button>
               )}
             </div>
          </div>
        )}

        {/* Information Table */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
           <h3 className="font-bold text-xl uppercase tracking-tighter text-gray-900 border-l-4 border-gray-300 pl-4 opacity-50">Information</h3>
           <div className="space-y-4">
              <InfoRow label="Provider" value={app.developer} />
              <InfoRow label="Size" value={app.size} />
              <InfoRow label="Category" value={app.category === 'Game' ? 'Games: Action' : 'Apps: Social'} />
              {app.downloads && <InfoRow label="Downloads" value={app.downloads} />}
              <div onClick={() => alert(`${app.name} compatibility checked: ${app.compatibility || 'Requires iOS 12.0 or later.'}`)} className="cursor-pointer">
                <InfoRow label="Compatibility" value={app.compatibility || "Works on this iPhone"} isBlue />
              </div>
              <InfoRow label="Languages" value="English" isBlue />
              <InfoRow label="Age Rating" value={app.ageRating} />
              <InfoRow label="In-App Purchases" value={app.hasInAppPurchases ? 'Yes' : 'No'} />
           </div>
        </div>

        {/* Social Share */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
           <h3 className="font-bold text-lg">Spread the word</h3>
           <div className="flex justify-between items-center gap-2">
              <SocialIcon icon={<Facebook size={24} />} color="bg-blue-600" label="Facebook" />
              <SocialIcon icon={<Twitter size={24} />} color="bg-blue-400" label="Twitter" />
              <SocialIcon icon={<InstagramIcon size={24} />} color="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600" label="Instagram" />
              <SocialIcon icon={<MessageCircle size={24} />} color="bg-green-500" label="Messages" />
           </div>
        </div>
      </div>

      {/* Version History Overlay */}
      <AnimatePresence>
        {fullscreenScreenshot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/95 flex items-center justify-center p-6"
            onClick={() => setFullscreenScreenshot(null)}
          >
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={fullscreenScreenshot} 
              className="max-w-full max-h-full rounded-3xl shadow-2xl ring-1 ring-white/10" 
              onClick={(e) => e.stopPropagation()}
            />
            <button className="absolute top-8 right-8 text-white bg-white/10 p-2 rounded-full backdrop-blur-md">
              <Plus className="rotate-45" size={24} />
            </button>
          </motion.div>
        )}

        {showVersionHistory && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[110] bg-white dark:bg-black pt-16 transition-colors duration-300"
          >
            <div className="p-6 flex items-center border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-md fixed top-0 left-0 right-0 z-10 justify-between transition-colors">
              <button 
                onClick={() => setShowVersionHistory(false)} 
                className="text-blue-500 flex items-center gap-1 font-bold"
              >
                <ChevronLeft size={24} />
                <span>Back</span>
              </button>
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Version History</h3>
              <div className="w-12"></div>
            </div>
            <div className="p-6 space-y-8 overflow-y-auto h-full pt-12">
              {app.versionHistory && app.versionHistory.length > 0 ? (
                app.versionHistory.map((v, i) => (
                  <div key={i} className="space-y-4 pb-8 border-b border-gray-50 dark:border-white/5 last:border-0 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{v.version}</span>
                      <span className="text-gray-400 text-sm">{v.date}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                      {v.notes}
                    </p>
                  </div>
                ))
              ) : (
                <div className="space-y-4 pb-8 border-b border-gray-50 dark:border-white/5 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{app.version || '1.0.0'}</span>
                    <span className="text-gray-400 text-sm">{app.versionDate || 'Recently'}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line transition-colors">
                    {app.whatsNew || 'New features and bug fixes to improve your experience.'}
                  </p>
                </div>
              )}
              <div className="bg-gray-50 p-4 rounded-2xl text-center">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Initial Release 1.0.0</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoRow({ label, value, isBlue, onClick }: { label: string, value: string, isBlue?: boolean, onClick?: () => void }) {
  return (
    <div 
      className={`flex justify-between items-center py-5 border-b border-gray-100/30 last:border-0 last:pb-0 ${onClick ? 'cursor-pointer active:opacity-60 transition-opacity' : ''}`}
      onClick={onClick}
    >
      <span className="text-gray-400 text-xs font-black uppercase tracking-widest">{label}</span>
      <span className={`text-sm font-black italic truncate ml-4 ${isBlue ? 'text-blue-600' : 'text-gray-900 opacity-90'}`}>{value}</span>
    </div>
  );
}

function SocialIcon({ icon, color, label }: { icon: React.ReactNode, color: string, label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm ${color}`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium text-gray-500">{label}</span>
    </div>
  );
}

function SearchPage({ 
  apps, 
  onSelect, 
  query, 
  setQuery, 
  downloadedApps, 
  purchaseLibrary,
  onDownload, 
  isDownloading, 
  downloadStatus 
}: { 
  apps: AppEntry[], 
  onSelect: (id: string) => void, 
  query: string, 
  setQuery: (q: string) => void, 
  downloadedApps: Set<string>, 
  purchaseLibrary: Set<string>,
  onDownload: (id: string) => void, 
  isDownloading: string | null, 
  downloadStatus: Record<string, string> 
}) {
  const trendingSearches = ["Action Games", "Social Apps", "Photo Editor", "Music Player"];
  
  const results = apps.filter(a => 
    a.name.toLowerCase().includes(query.toLowerCase()) || 
    a.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    a.developer.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-6 pt-12 space-y-6 pb-32 bg-white dark:bg-black transition-colors">
      <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 italic tracking-tighter">Search</h1>

      <div className="space-y-6">
        {!query && (
          <div className="space-y-4">
            <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">Trending</h3>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map(s => (
                <button 
                  key={s} 
                  onClick={() => setQuery(s)}
                  className="bg-white dark:bg-zinc-900 px-4 py-2 rounded-full text-blue-500 font-bold text-sm border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
           <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">{query ? 'Search Results' : 'Suggested'}</h3>
           {query && <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{results.length} found</span>}
        </div>
        
        <div className="space-y-6">
          {(query ? results : apps.slice(0, 6)).map(app => (
            <div key={app.id} onClick={() => onSelect(app.id)} className="flex items-center gap-4 cursor-pointer active:opacity-60 transition-opacity">
              <div className="w-16 h-16 rounded-[22%] shadow-sm overflow-hidden flex-shrink-0 border border-white/10 transition-colors">
                <img src={app.iconUrl} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 border-b border-white/5 pb-2 transition-colors">
                <h4 className="font-bold text-[15px] truncate text-white transition-colors">{app.name}</h4>
                <p className="text-white/40 text-xs truncate mb-1">{app.subtitle}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] bg-zinc-800 px-1.5 py-0.5 rounded text-white/60 font-bold uppercase tracking-tighter">{app.category}</span>
                  {app.hasInAppPurchases && <span className="text-[9px] text-white/30 font-bold uppercase tracking-tighter">In-App Purchases</span>}
                </div>
              </div>
              <DownloadButton 
                app={app} 
                onDownload={onDownload} 
                isDownloading={isDownloading === app.id} 
                isDownloaded={downloadedApps.has(app.id)} 
                isPurchased={purchaseLibrary.has(app.id)}
                status={downloadStatus[app.id] as any}
                variant="gray" 
              />
            </div>
          ))}
          
          {query && results.length === 0 && (
            <div className="text-center py-20 space-y-2">
              <p className="text-gray-800 font-bold text-xl">No Results for "{query}"</p>
              <p className="text-gray-400 text-sm">Check the spelling or try a more general term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminPage({ isAuthenticated, password, setPassword, onLogin, onAdd, onUpdate, apps, onDelete, allUsers = [], onAddUser, onUpdateUser, onDeleteUser }: any) {
  const [adminTab, setAdminTab] = useState<'apps' | 'users'>('apps');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({ name: '', email: '' });
  const [form, setForm] = useState<Partial<AppEntry>>({
    category: 'Game',
    rating: 4.5,
    reviewsCount: '10K',
    size: '100 MB',
    ageRating: '4+',
    redirectTime: 2,
    version: '1.0.0',
    versionDate: 'Today',
    whatsNew: 'Brand new release!',
    versionHistory: [],
    price: 'Free',
    country: 'Global',
    iconUrl: '',
    compatibility: 'Works on this iPhone',
    apkUrl: '',
    externalLink: '',
    iosUrl: '',
    androidUrl: '',
    events: [],
    screenshots: ['', '', '']
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'icon' | 'apk' | number | null>(null);

  useEffect(() => {
    if (editingId) {
      const app = apps.find((a: AppEntry) => a.id === editingId);
      if (app) setForm(app);
    } else {
      setForm({ 
        category: 'Game', 
        rating: 4.5, 
        reviewsCount: '10K', 
        size: '100 MB', 
        ageRating: '4+', 
        redirectTime: 2, 
        version: '1.0.0',
        versionDate: 'Today',
        whatsNew: 'Brand new release!',
        versionHistory: [],
        price: 'Free',
        country: 'Global',
        iconUrl: '', 
        compatibility: 'Works on this iPhone',
        apkUrl: '',
        externalLink: '',
        iosUrl: '',
        androidUrl: '',
        events: [],
        screenshots: ['', '', ''] 
      });
    }
  }, [editingId, apps]);

  if (!isAuthenticated) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center space-y-6">
        <Lock size={64} className="text-gray-300" />
        <div className="text-center space-y-2">
           <h1 className="text-2xl font-bold">Admin Portal</h1>
           <p className="text-gray-400 text-sm">Enter the creator password to manage the store content.</p>
        </div>
        <div className="w-full space-y-4">
           <input 
            type="password" 
            placeholder="Enter Administrator Password" 
            className="w-full bg-gray-100 p-4 rounded-xl focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
           />
           <button onClick={onLogin} className="w-full bg-blue-500 text-white p-4 rounded-xl font-bold shadow-lg shadow-blue-500/20">Login</button>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadType !== null) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (uploadType === 'icon') {
          setForm({ ...form, iconUrl: result });
        } else if (uploadType === 'apk') {
          setForm({ ...form, apkUrl: result });
        } else {
          const newScreenshots = [...(form.screenshots || ['', '', ''])];
          newScreenshots[uploadType] = result;
          setForm({ ...form, screenshots: newScreenshots });
        }
      };
      reader.readAsDataURL(file);
    }
    setUploadType(null);
  };

  const triggerUpload = (type: 'icon' | 'apk' | number) => {
    setUploadType(type);
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.iconUrl) return alert('Fill required fields (Name and Icon)');
    
    const seed = form.name.toLowerCase().replace(/\s/g, '');
    const finalScreenshots = (form.screenshots || []).map((s, i) => 
      s || `https://picsum.photos/seed/${seed}${i}/600/400`
    );

    if (editingId) {
      onUpdate({
        ...form,
        id: editingId,
        screenshots: finalScreenshots
      } as AppEntry);
      setEditingId(null);
      alert('Updated successfully!');
    } else {
      const newId = form.id || (apps.length + 1).toString();
      onAdd({
        ...form,
        id: newId,
        screenshots: finalScreenshots
      } as AppEntry);
      alert('Added successfully!');
    }

    setForm({ 
      category: 'Game', 
      rating: 4.5, 
      reviewsCount: '10K', 
      size: '100 MB', 
      ageRating: '4+',
      iconUrl: '',
      redirectTime: 2,
      version: '1.0.0',
      versionDate: 'Today',
      whatsNew: 'Brand new release!',
      versionHistory: [],
      price: 'Free',
      country: 'Global',
      compatibility: 'Works on this iPhone',
      apkUrl: '',
      externalLink: '',
      iosUrl: '',
      androidUrl: '',
      events: [],
      screenshots: ['', '', '']
    });
  };

  return (
    <div className="p-6 pt-12 space-y-8 pb-32">
       <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Creator Dashboard</h1>
          <button onClick={() => window.location.reload()} className="text-[12px] text-gray-400 font-bold uppercase">Log out</button>
       </div>

       <div className="flex space-x-4 border-b border-gray-100 pb-2">
         <button 
           onClick={() => setAdminTab('apps')} 
           className={`pb-2 px-2 font-bold ${adminTab === 'apps' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
         >
           Apps
         </button>
         <button 
           onClick={() => setAdminTab('users')} 
           className={`pb-2 px-2 font-bold ${adminTab === 'users' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
         >
           Users
         </button>
       </div>

       {adminTab === 'apps' ? (
         <>
           <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept={uploadType === 'apk' ? '.apk,application/vnd.android.package-archive' : 'image/*'} 
          />

           {/* Add Form */}
           <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl space-y-8 border border-gray-100 shadow-xl shadow-black/5">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <h3 className="font-black text-xl flex items-center gap-3 text-gray-900">
              {editingId ? <Smartphone className="text-blue-500" size={24} /> : <PlusCircle className="text-blue-500" size={24} />} 
              {editingId ? 'Edit Application' : 'Add New Application'}
            </h3>
            {editingId && (
              <button 
                type="button"
                onClick={() => setEditingId(null)}
                className="text-[10px] bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">General Info</p>
                <div className="space-y-3">
                  <input placeholder="App ID (e.g. com.example.app)" className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" value={form.id || ''} onChange={e => setForm({...form, id: e.target.value})} />
                  <input placeholder="App Name" className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} />
                  <input placeholder="Subtitle (social, games, etc.)" className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" value={form.subtitle || ''} onChange={e => setForm({...form, subtitle: e.target.value})} />
                </div>
              </div>

              {/* Icon Upload */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">App Icon</p>
                <div 
                  onClick={() => triggerUpload('icon')}
                  className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[22%] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all overflow-hidden group shadow-sm"
                >
                  {form.iconUrl ? (
                    <img src={form.iconUrl} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <LayoutGrid className="text-gray-300 group-hover:text-blue-500 transition-colors" size={32} />
                      <span className="text-[9px] text-gray-400 font-bold mt-1 uppercase">Select</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">Details & Pricing</p>
                <div className="grid grid-cols-2 gap-3">
                  <select className="bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium" value={form.category} onChange={e => setForm({...form, category: e.target.value as AppCategory})}>
                    <option value="Game">Games</option>
                    <option value="App">Apps</option>
                  </select>
                  <input placeholder="Developer Name" className="bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium" value={form.developer || ''} onChange={e => setForm({...form, developer: e.target.value})} />
                  <input placeholder="Price (Free/$0.99)" className="bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium" value={form.price || ''} onChange={e => setForm({...form, price: e.target.value})} />
                  <input placeholder="Size (e.g. 150 MB)" className="bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium" value={form.size || ''} onChange={e => setForm({...form, size: e.target.value})} />
                  <input placeholder="Downloads (e.g. 1.2M)" className="bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium" value={form.downloads || ''} onChange={e => setForm({...form, downloads: e.target.value})} />
                  <input placeholder="Creator Apple ID (e.g. apple@example.com)" className="bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium col-span-2" value={form.creatorAppleId || ''} onChange={e => setForm({...form, creatorAppleId: e.target.value})} />
                  <input placeholder="Compatibility (e.g. Works on this iPhone)" className="bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium col-span-2" value={form.compatibility || ''} onChange={e => setForm({...form, compatibility: e.target.value})} />
                </div>
              </div>

              {/* Redirection Settings */}
              <div className="space-y-4 pt-4 border-t border-gray-50 text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-widest">Redirection Settings (APK / Links)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-2 col-span-2 md:col-span-1">
                    <div className="relative flex-1 group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors">
                        <Package size={18} />
                      </div>
                      <input 
                        placeholder="APK Download File/URL" 
                        className="w-full bg-gray-50 p-4 pl-12 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-green-500/20 outline-none text-sm font-medium" 
                        value={form.apkUrl || ''} 
                        onChange={e => setForm({...form, apkUrl: e.target.value})} 
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => triggerUpload('apk')}
                      className="bg-green-50 text-green-600 px-4 rounded-2xl border border-green-100 hover:bg-green-100 transition-colors flex items-center justify-center p-2"
                      title="Upload APK File"
                    >
                      <ArrowDownToLine size={20} />
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors">
                      <Globe size={18} />
                    </div>
                    <input 
                      placeholder="External Website Link" 
                      className="w-full bg-gray-50 p-4 pl-12 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-gray-500/20 outline-none text-sm font-medium" 
                      value={form.externalLink || ''} 
                      onChange={e => setForm({...form, externalLink: e.target.value})} 
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                      <Smartphone size={18} />
                    </div>
                    <input 
                      placeholder="iOS App Store URL" 
                      className="w-full bg-gray-50 p-4 pl-12 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium" 
                      value={form.iosUrl || ''} 
                      onChange={e => setForm({...form, iosUrl: e.target.value})} 
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
                      <SmartphoneNfc size={18} />
                    </div>
                    <input 
                      placeholder="Android Play Store URL" 
                      className="w-full bg-gray-50 p-4 pl-12 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-green-600/20 outline-none text-sm font-medium" 
                      value={form.androidUrl || ''} 
                      onChange={e => setForm({...form, androidUrl: e.target.value})} 
                    />
                  </div>
                </div>
                {form.apkUrl && form.apkUrl.startsWith('data:') && (
                  <p className="text-[9px] text-green-600 font-bold uppercase mt-1 ml-1 flex items-center gap-1">
                    <Check size={10} /> APK File Attached (Stored in local data)
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">Region</p>
                  <select 
                    className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium" 
                    value={form.country || ''} 
                    onChange={e => setForm({...form, country: e.target.value})}
                  >
                    <option value="Global">Global</option>
                    <option value="United States">USA</option>
                    <option value="United Kingdom">UK</option>
                    <option value="Canada">Canada</option>
                    <option value="Japan">Japan</option>
                  </select>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">In-App Purchases</p>
                   <button 
                    type="button"
                    onClick={() => setForm({...form, hasInAppPurchases: !form.hasInAppPurchases})}
                    className={`w-full p-4 rounded-2xl border font-bold text-xs transition-all ${form.hasInAppPurchases ? 'bg-green-50 border-green-100 text-green-600' : 'bg-gray-100 border-gray-200 text-gray-400'}`}
                   >
                     {form.hasInAppPurchases ? 'ENABLED' : 'DISABLED'}
                   </button>
                </div>
              </div>
            </div>
          </div>

          {/* Events Section */}
          <div className="space-y-4 pt-4 border-t border-gray-50">
            <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">Featured Event (Optional)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                placeholder="Event Title" 
                className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" 
                value={form.events?.[0]?.title || ''} 
                onChange={e => {
                  const events = [...(form.events || [])];
                  if (events.length === 0) events.push({ id: 'e1', title: '', subtitle: '', badge: 'NEW EVENT', imageUrl: '' });
                  events[0].title = e.target.value;
                  setForm({...form, events});
                }} 
              />
              <input 
                placeholder="Event Subtitle" 
                className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" 
                value={form.events?.[0]?.subtitle || ''} 
                onChange={e => {
                  const events = [...(form.events || [])];
                  if (events.length === 0) events.push({ id: 'e1', title: '', subtitle: '', badge: 'NEW EVENT', imageUrl: '' });
                  events[0].subtitle = e.target.value;
                  setForm({...form, events});
                }} 
              />
              <input 
                placeholder="Event Badge (e.g. MAJOR EVENT)" 
                className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" 
                value={form.events?.[0]?.badge || ''} 
                onChange={e => {
                  const events = [...(form.events || [])];
                  if (events.length === 0) events.push({ id: 'e1', title: '', subtitle: '', badge: 'NEW EVENT', imageUrl: '' });
                  events[0].badge = e.target.value;
                  setForm({...form, events});
                }} 
              />
              <input 
                placeholder="Event Image URL" 
                className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" 
                value={form.events?.[0]?.imageUrl || ''} 
                onChange={e => {
                  const events = [...(form.events || [])];
                  if (events.length === 0) events.push({ id: 'e1', title: '', subtitle: '', badge: 'NEW EVENT', imageUrl: '' });
                  events[0].imageUrl = e.target.value;
                  setForm({...form, events});
                }} 
              />
            </div>
          </div>

          {/* Screenshots Upload */}
          <div className="space-y-3 pt-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">Screenshot Gallery (3 Required)</p>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {[0, 1, 2].map(idx => (
                <div 
                  key={idx}
                  onClick={() => triggerUpload(idx)}
                  className="min-w-[140px] h-[240px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all overflow-hidden group shadow-sm"
                >
                  {form.screenshots?.[idx] ? (
                    <img src={form.screenshots[idx]} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Smartphone className="text-gray-300 group-hover:text-blue-500 transition-colors" size={24} />
                      <span className="text-[9px] text-gray-400 font-bold mt-2 uppercase text-center px-4">Upload {idx + 1}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">About the App</p>
                <textarea placeholder="Long description..." className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 h-32 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm leading-relaxed" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">Redirection Settings</p>
                <div className="space-y-3">
                  <input placeholder="Redirection URL (https://...)" className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" value={form.downloadUrl || ''} onChange={e => setForm({...form, downloadUrl: e.target.value})} />
                  <div className="flex items-center gap-3">
                     <span className="text-xs text-gray-400 font-bold uppercase whitespace-nowrap">Wait Time:</span>
                     <input type="number" className="w-20 bg-gray-50 p-2 text-center rounded-xl border border-gray-100 text-sm font-bold" value={form.redirectTime} onChange={e => setForm({...form, redirectTime: parseInt(e.target.value) || 0})} />
                     <span className="text-xs text-gray-400">seconds</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">What's New in {form.version}</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input placeholder="Ver: 1.0.0" className="bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:bg-white outline-none text-sm" value={form.version || ''} onChange={e => setForm({...form, version: e.target.value})} />
                  <input placeholder="Date: 2d ago" className="bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:bg-white outline-none text-sm" value={form.versionDate || ''} onChange={e => setForm({...form, versionDate: e.target.value})} />
                </div>
                <textarea placeholder="Release notes..." className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 h-28 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm leading-relaxed" value={form.whatsNew || ''} onChange={e => setForm({...form, whatsNew: e.target.value})} />
              </div>
            </div>
          </div>
          
          {/* Version History List Management */}
          <div className="space-y-4 pt-4 border-t border-gray-50">
             <div className="flex justify-between items-center px-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Legacy Version History</p>
                <span className="text-[10px] text-gray-300 font-bold">{form.versionHistory?.length || 0} Entries</span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {(form.versionHistory || []).map((v, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex justify-between items-start group">
                        <div className="text-[11px] flex-1 pr-4">
                          <div className="flex justify-between items-center mb-1.5 focus-within:ring-2">
                             <span className="font-bold text-gray-900">v{v.version}</span>
                             <span className="text-gray-400 text-[10px]">{v.date}</span>
                          </div>
                          <p className="text-gray-500 line-clamp-2 leading-relaxed">{v.notes}</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                             const newList = [...(form.versionHistory || [])];
                             newList.splice(i, 1);
                             setForm({...form, versionHistory: newList});
                          }}
                          className="text-gray-300 hover:text-red-500 p-1.5 bg-white rounded-full shadow-sm transition-all opacity-0 group-hover:opacity-100"
                        >
                           <Trash2 size={12} />
                        </button>
                    </div>
                  ))}
                  {(!form.versionHistory || form.versionHistory.length === 0) && (
                    <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 text-center text-gray-300 text-xs italic">
                      No previous versions added yet.
                    </div>
                  )}
                </div>
                
                <div className="bg-blue-50/50 p-6 rounded-3xl border-2 border-dashed border-blue-100 space-y-4 self-start sticky top-24">
                   <h4 className="text-center text-[10px] font-bold text-blue-400 uppercase tracking-widest">New History Entry</h4>
                   <div className="grid grid-cols-2 gap-3">
                      <input id="new-v-num" placeholder="Ver: 1.0.0" className="w-full bg-white p-3 rounded-xl text-xs border border-blue-50 outline-none focus:ring-2 focus:ring-blue-100" />
                      <input id="new-v-date" placeholder="Date: 1m ago" className="w-full bg-white p-3 rounded-xl text-xs border border-blue-50 outline-none focus:ring-2 focus:ring-blue-100" />
                   </div>
                   <textarea id="new-v-notes" placeholder="Detailed release notes for this version..." className="w-full bg-white p-3 rounded-xl text-xs h-24 border border-blue-50 outline-none focus:ring-2 focus:ring-blue-100" />
                   <button 
                     type="button"
                     onClick={() => {
                        const numEl = document.getElementById('new-v-num') as HTMLInputElement;
                        const dateEl = document.getElementById('new-v-date') as HTMLInputElement;
                        const notesEl = document.getElementById('new-v-notes') as HTMLTextAreaElement;
                        
                        if (numEl.value && dateEl.value && notesEl.value) {
                           setForm({
                              ...form,
                              versionHistory: [
                                 ...(form.versionHistory || []),
                                 { version: numEl.value, date: dateEl.value, notes: notesEl.value }
                              ]
                           });
                           numEl.value = '';
                           dateEl.value = '';
                           notesEl.value = '';
                        }
                     }}
                     className="w-full bg-blue-600 text-white py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/30 active:scale-95 transition-transform"
                   >
                     Push to History
                   </button>
                </div>
             </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-3">
            {editingId ? <Smartphone size={20} /> : <Rocket size={20} />}
            {editingId ? 'UPDATE & SAVE ALL' : 'LAUNCH & SAVE ALL'}
          </button>
       </form>

       {/* Manage List */}
       <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="font-black text-xl text-gray-900">Live App Store Items</h3>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{apps.length} Total</span>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              placeholder="Search live items..." 
              className="w-full bg-white p-3 pl-11 rounded-xl border border-gray-100 text-sm focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
              onChange={(e) => {
                // local filter logic can be added here if we want to store it in state
              }}
            />
          </div>

          <div className="space-y-3">
             {apps.map((app: AppEntry) => (
                <div key={app.id} className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                   <img src={app.iconUrl} className="w-12 h-12 rounded-xl shadow-sm ring-1 ring-black/5" referrerPolicy="no-referrer" />
                   <div className="flex-1 min-w-0">
                      <p className="font-bold truncate text-sm text-gray-900">{app.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-tight mb-1 opacity-70">{app.subtitle}</p>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-bold">{app.size}</span>
                        <span className="text-[9px] bg-yellow-50 px-2 py-0.5 rounded-full text-yellow-700 font-bold">{app.price || 'Free'}</span>
                        {app.country && <span className="text-[9px] bg-purple-50 px-2 py-0.5 rounded-full text-purple-600 font-bold">{app.country}</span>}
                        {app.hasInAppPurchases && <span className="text-[9px] bg-blue-50 px-2 py-0.5 rounded-full text-blue-500 font-bold">IAP</span>}
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          const newVersion = (parseFloat(app.version || '1.0') + 0.1).toFixed(1);
                          onUpdate(app.id, { ...app, version: newVersion, versionDate: 'Just Now' });
                        }}
                        className="text-orange-600 bg-orange-50 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight hover:bg-orange-100 transition-colors flex items-center gap-1"
                        title="Force Notify Update"
                      >
                         <Bell size={12} />
                         Notify
                      </button>
                      <button 
                        onClick={() => {
                          setEditingId(app.id);
                          setForm({...app});
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }} 
                        className="text-blue-600 bg-blue-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button onClick={() => onDelete(app.id)} className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-all">
                        <Trash2 size={18} />
                      </button>
                   </div>
                </div>
             ))}
          </div>
       </div>
       </>
       ) : (
         <div className="space-y-8">
            {/* User Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingUserId) {
                onUpdateUser({ ...userForm, id: editingUserId });
                setEditingUserId(null);
              } else {
                onAddUser({ ...userForm, id: Date.now().toString() });
              }
              setUserForm({ name: '', email: '' });
            }} className="bg-white p-8 rounded-3xl space-y-8 border border-gray-100 shadow-xl shadow-black/5">
              <h3 className="font-black text-xl flex items-center gap-3 text-gray-900">
                {editingUserId ? <User className="text-blue-500" size={24} /> : <UserPlus className="text-blue-500" size={24} />}
                {editingUserId ? 'Edit User' : 'Add New User'}
              </h3>
              <div className="space-y-4">
                <input placeholder="Name" required className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} />
                <input placeholder="Apple ID (Email)" type="email" required className="w-full bg-gray-50 p-4 rounded-2xl border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-3">
                {editingUserId ? 'UPDATE USER' : 'ADD USER'}
              </button>
            </form>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <h3 className="font-black text-xl text-gray-900">All Users</h3>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{allUsers.length} Total</span>
              </div>
              <div className="space-y-3">
                 {allUsers.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                       <div>
                         <p className="font-bold text-gray-900">{user.name}</p>
                         <p className="text-xs text-gray-500">{user.email}</p>
                       </div>
                       <div className="flex items-center gap-2">
                          <button onClick={() => {
                            setEditingUserId(user.id);
                            setUserForm(user);
                          }} className="text-blue-600 bg-blue-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors">Edit</button>
                          <button onClick={() => onDeleteUser(user.id)} className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-all">
                            <Trash2 size={18} />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
            </div>
         </div>
       )}
    </div>
  );
}

