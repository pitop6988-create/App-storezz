import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Gamepad2, Smartphone, LayoutGrid, User, Plus, Trash2, Edit2, Lock, Unlock, Download, Check, AlertCircle, ChevronLeft, Star, Share, ExternalLink, Image as ImageIcon, File, UploadCloud, X , ChevronRight, Mic, CloudDownload } from 'lucide-react';
import { AppEntry, AppCategory, UserEntry } from './types';
import { useStore } from './hooks/useStore';

const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = error => reject(error);
});

export default function App() {
  const {
    apps, saveApps,
    allUsers, saveAllUsers,
    downloadedApps, saveDownloadedApps,
    purchaseLibrary, savePurchaseLibrary,
    userBalance, saveUserBalance,
    currentUser, saveCurrentUser
  } = useStore();

  const [activeTab, setActiveTab] = useState<'Games' | 'Apps' | 'Publish' | 'Users' | 'Search'>('Games');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [viewingApp, setViewingApp] = useState<AppEntry | null>(null);

  // Download logic
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  const handleDownload = (app: AppEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentUser) {
      alert("Please sign in to download apps.");
      setShowAccountModal(true);
      return;
    }

    if (downloadedApps.has(app.id)) {
      // It's already downloaded, so this is the "OPEN" action
      if (app.externalLink || app.downloadUrl || app.apkUrl || app.iosUrl) {
        const link = app.externalLink || app.downloadUrl || app.apkUrl || app.iosUrl;
        window.open(link, '_blank');
      } else {
        alert("No game file or link provided for this app!");
      }
      return;
    }

    const isFree = !app.price || app.price === 'Free';
    const priceValue = isFree ? 0 : parseFloat(app.price.replace('$', ''));

    if (!purchaseLibrary.has(app.id) && !isFree) {
      if (userBalance < priceValue) {
        alert(`Insufficient funds. You need $${priceValue} but have $${userBalance}`);
        return;
      }
      saveUserBalance(userBalance - priceValue);
      const newPurchased = new Set<string>(purchaseLibrary);
      newPurchased.add(app.id);
      savePurchaseLibrary(newPurchased);
    }

    const sizeInMB = parseFloat((app.size || "100 MB").replace(/[^\d.]/g, '')) || 100;
    setDownloadingId(app.id);
    setDownloadProgress(0);

    const duration = 1500;
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setDownloadProgress((currentStep / steps) * sizeInMB);
      if (currentStep >= steps) {
        clearInterval(interval);
        const newDownloaded = new Set<string>(downloadedApps);
        newDownloaded.add(app.id);
        saveDownloadedApps(newDownloaded);
        setDownloadingId(null);
        setDownloadProgress(0);
      }
    }, intervalTime);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Today':
      case 'Games':
      case 'Apps':
      case 'Search':
        return (
          <StoreFront 
            apps={apps} 
            tab={activeTab} 
            onDownload={handleDownload}
            downloadingId={downloadingId} downloadProgress={downloadProgress}
            downloadedApps={downloadedApps}
            purchaseLibrary={purchaseLibrary}
            onAppClick={(app) => setViewingApp(app)}
            onAccountClick={() => setShowAccountModal(true)}
            currentUser={currentUser}
          />
        );
      case 'Publish':
        return (
          <AdminPage 
            apps={apps} saveApps={saveApps}
            allUsers={allUsers} saveAllUsers={saveAllUsers}
            isAuthenticated={isAdminAuthenticated}
            setIsAuthenticated={setIsAdminAuthenticated}
            initialTab="apps"
          />
        );
      case 'Users':
        return (
          <AdminPage 
            apps={apps} saveApps={saveApps}
            allUsers={allUsers} saveAllUsers={saveAllUsers}
            isAuthenticated={isAdminAuthenticated}
            setIsAuthenticated={setIsAdminAuthenticated}
            initialTab="users"
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-24 relative">
          {renderContent()}
        </div>

        {/* Bottom Nav */}
        <div className="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 flex justify-around px-2 py-3 z-40">
          <NavItem icon={Gamepad2} label="Games" active={activeTab === 'Games'} onClick={() => setActiveTab('Games')} />
          <NavItem icon={Smartphone} label="Apps" active={activeTab === 'Apps'} onClick={() => setActiveTab('Apps')} />
          <NavItem icon={Plus} label="Publish" active={activeTab === 'Publish'} onClick={() => setActiveTab('Publish')} />
          <NavItem icon={User} label="Users" active={activeTab === 'Users'} onClick={() => setActiveTab('Users')} />
          <NavItem icon={Search} label="Search" active={activeTab === 'Search'} onClick={() => setActiveTab('Search')} />
        </div>

        {/* Account Modal */}
        <AnimatePresence>
          {showAccountModal && (
            <AccountModal apps={apps} downloadedApps={downloadedApps} onDownload={handleDownload} downloadingId={downloadingId} downloadProgress={downloadProgress} purchaseLibrary={purchaseLibrary} 
              onClose={() => setShowAccountModal(false)}
              currentUser={currentUser}
              saveCurrentUser={saveCurrentUser}
              allUsers={allUsers}
              balance={userBalance}
              saveBalance={saveUserBalance}
            />
          )}
        </AnimatePresence>

        {/* App Details View */}
        <AnimatePresence>
          {viewingApp && (
            <AppDetails 
              app={viewingApp} 
              onClose={() => setViewingApp(null)} 
              onDownload={handleDownload}
              downloadingId={downloadingId} downloadProgress={downloadProgress}
              downloadedApps={downloadedApps}
              purchaseLibrary={purchaseLibrary}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 ${active ? 'text-blue-500' : 'text-gray-400'} px-4`}>
      <Icon size={24} className={active ? "fill-blue-500 text-blue-500" : "text-gray-400"} />
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}

function DownloadButton({ app, onDownload, downloadingId, downloadProgress, downloadedApps, purchaseLibrary }: any) {
  const isDownloaded = downloadedApps.has(app.id);
  const isPurchased = purchaseLibrary.has(app.id);
  const isFree = !app.price || app.price === 'Free';
  const isDownloading = downloadingId === app.id;

  let buttonText = isFree ? 'GET' : app.price;
  if (isPurchased) buttonText = 'DOWNLOAD';
  if (isDownloaded) buttonText = 'OPEN';

  if (isDownloading) {
    const sizeInMB = parseFloat((app.size || "100 MB").replace(/[^\d.]/g, '')) || 100;
    const radius = 12;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - ((downloadProgress || 0) / sizeInMB) * circumference;

    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-blue-500 uppercase">{(downloadProgress || 0).toFixed(1)} MB</span>
        <div className="w-8 h-8 flex items-center justify-center relative">
          <svg className="w-8 h-8 transform -rotate-90 absolute inset-0" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="12" className="stroke-gray-200 fill-none stroke-2" />
            <circle cx="16" cy="16" r="12" className="stroke-blue-500 fill-none stroke-2"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm absolute"></div>
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={(e) => onDownload(app, e)}
      className="px-5 py-1.5 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all text-blue-600 font-bold text-[13px] rounded-full uppercase tracking-wide"
    >
      {buttonText}
    </button>
  );
}

function StoreFront({ apps, tab, onDownload, downloadingId, downloadProgress, downloadedApps, purchaseLibrary, onAppClick, onAccountClick, currentUser }: any) {
  const [searchQuery, setSearchQuery] = useState('');

  let displayApps = apps;
  if (tab === 'Games') displayApps = apps.filter((a: AppEntry) => a.category === 'Game');
  if (tab === 'Apps') displayApps = apps.filter((a: AppEntry) => a.category === 'App');
  if (tab === 'Search') {
    displayApps = apps.filter((a: AppEntry) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.developer?.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="pt-12 px-5 space-y-6 pb-20">
      <div className="flex justify-between items-end mb-2">
        <div>
          {tab === 'Today' && <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{todayStr}</p>}
          <h1 className="text-3xl font-black">{tab}</h1>
        </div>
        <button onClick={onAccountClick} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden hover:bg-gray-200 transition-colors">
          <User size={20} className={currentUser ? 'text-blue-500' : 'text-gray-400'} />
        </button>
      </div>

      {tab === 'Search' && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Games, Apps, Stories and More"
            className="w-full bg-gray-100 py-3 pl-10 pr-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {tab === 'Today' && displayApps.slice(0,2).map((app: AppEntry, i: number) => (
        <div key={`featured-${app.id}`} onClick={() => onAppClick(app)} className="relative h-96 rounded-2xl overflow-hidden shadow-lg cursor-pointer group">
           <img src={app.screenshots?.[0] || app.iconUrl} alt={app.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
           <div className="absolute top-4 left-4">
             <span className="text-white/80 font-bold text-xs uppercase tracking-widest">{i === 0 ? 'PREMIERE' : 'NEW GAME'}</span>
             <h2 className="text-white text-3xl font-black mt-1 leading-tight">{app.name}</h2>
           </div>
           <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
             <img src={app.iconUrl} className="w-12 h-12 rounded-xl object-cover shadow-md" alt="" />
             <div className="flex-1">
               <p className="text-white font-bold text-sm line-clamp-1">{app.name}</p>
               <p className="text-white/70 text-xs line-clamp-1">{app.subtitle}</p>
             </div>
             <DownloadButton app={app} onDownload={onDownload} downloadingId={downloadingId} downloadProgress={downloadProgress} downloadedApps={downloadedApps} purchaseLibrary={purchaseLibrary} />
           </div>
        </div>
      ))}

      <div className="space-y-4 mt-8">
        {displayApps.map((app: AppEntry) => (
          <div key={app.id} onClick={() => onAppClick(app)} className="flex items-center gap-4 py-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors -mx-2 px-2">
            <img src={app.iconUrl} alt={app.name} className="w-16 h-16 rounded-[1.25rem] object-cover shadow-sm border border-gray-100" />
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <h3 className="font-bold text-gray-900 truncate text-[15px]">{app.name}</h3>
              <p className="text-[13px] text-gray-500 truncate">{app.subtitle}</p>
            </div>
            <DownloadButton app={app} onDownload={onDownload} downloadingId={downloadingId} downloadProgress={downloadProgress} downloadedApps={downloadedApps} purchaseLibrary={purchaseLibrary} />
          </div>
        ))}
      </div>
    </div>
  );
}

function AppDetails({ app, onClose, onDownload, downloadingId, downloadProgress, downloadedApps, purchaseLibrary }: any) {
  return (
    <motion.div 
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 bg-white z-50 flex flex-col"
    >
      <div className="absolute top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-md z-10 flex items-center px-4 border-b border-gray-100">
        <button onClick={onClose} className="flex items-center text-blue-500 font-medium">
          <ChevronLeft size={24} className="-ml-1" />
          Back
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pt-20 pb-24 px-5">
        <div className="flex gap-4 mb-6">
          <img src={app.iconUrl} alt={app.name} className="w-28 h-28 rounded-[1.75rem] shadow-md border border-gray-100 object-cover" />
          <div className="flex-1 flex flex-col justify-between py-1">
            <div>
              <h1 className="text-xl font-bold leading-tight text-gray-900">{app.name}</h1>
              <h2 className="text-sm text-gray-500 mt-0.5">{app.subtitle}</h2>
            </div>
            <div className="flex items-center justify-between mt-4">
               <DownloadButton app={app} onDownload={onDownload} downloadingId={downloadingId} downloadProgress={downloadProgress} downloadedApps={downloadedApps} purchaseLibrary={purchaseLibrary} />
               <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-blue-500"><Share size={16} /></button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 py-4 border-y border-gray-100 overflow-x-auto no-scrollbar mb-6">
           <div className="flex flex-col items-center flex-shrink-0">
             <p className="text-[10px] text-gray-500 font-bold uppercase">Rating</p>
             <p className="text-xl font-bold text-gray-600 mt-1">{app.rating || '4.5'}</p>
             <div className="flex text-gray-400 mt-0.5"><Star className="fill-current" size={12} /></div>
           </div>
           <div className="w-px h-8 bg-gray-200"></div>
           <div className="flex flex-col items-center flex-shrink-0">
             <p className="text-[10px] text-gray-500 font-bold uppercase">Developer</p>
             <User size={20} className="text-gray-400 mt-1.5" />
             <p className="text-[11px] text-gray-500 mt-1">{app.developer || 'Developer'}</p>
           </div>
           <div className="w-px h-8 bg-gray-200"></div>
           <div className="flex flex-col items-center flex-shrink-0">
             <p className="text-[10px] text-gray-500 font-bold uppercase">Size</p>
             <p className="text-xl font-bold text-gray-600 mt-1">{app.size || '100 MB'}</p>
           </div>
        </div>

        {app.screenshots && app.screenshots.length > 0 && (
          <div className="mb-8">
            <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 -mx-5 px-5">
              {app.screenshots.map((s: string, i: number) => (
                <img key={i} src={s} alt="Screenshot" className="w-[200px] h-[350px] object-cover rounded-2xl border border-gray-100 snap-center shadow-sm shrink-0 bg-gray-100" />
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <p className="text-[15px] leading-relaxed text-gray-700 whitespace-pre-wrap">{app.description || 'No description available.'}</p>
        </div>

        <div className="space-y-3 pt-6 border-t border-gray-100">
           <h3 className="font-bold text-lg">Information</h3>
           <div className="flex justify-between py-3 border-b border-gray-50 text-sm">
             <span className="text-gray-500">Provider</span>
             <span className="text-gray-900">{app.developer || 'Unknown'}</span>
           </div>
           <div className="flex justify-between py-3 border-b border-gray-50 text-sm">
             <span className="text-gray-500">Size</span>
             <span className="text-gray-900">{app.size || '100 MB'}</span>
           </div>
           <div className="flex justify-between py-3 border-b border-gray-50 text-sm">
             <span className="text-gray-500">Category</span>
             <span className="text-gray-900">{app.category || 'App'}</span>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---- Modals & Admin Below ----

function AccountModal({ onClose, currentUser, saveCurrentUser, allUsers, balance, saveBalance, apps, downloadedApps, onDownload, downloadingId, downloadProgress, purchaseLibrary }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [addBalancePassword, setAddBalancePassword] = useState('');
  const [addingFunds, setAddingFunds] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [appTab, setAppTab] = useState<'All' | 'Not'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = allUsers.find((u: UserEntry) => u.email === email && (u.password === password || !u.password));
    if (user) {
      saveCurrentUser(user);
    } else {
      alert("Invalid Apple ID or Password");
    }
  };

  const handleAddFunds = () => {
    if (addBalancePassword === 'EMAD8912') {
      saveBalance(balance + 50);
      setAddBalancePassword('');
      setAddingFunds(false);
    } else {
      alert('Incorrect Password');
    }
  };

  const myApps = apps.filter((a: any) => appTab === 'All' ? (downloadedApps.has(a.id) || purchaseLibrary.has(a.id)) : (purchaseLibrary.has(a.id) && !downloadedApps.has(a.id)));
  const filteredApps = myApps.filter((a: any) => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (showApps) {
    return (
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute inset-0 bg-[#F2F2F7] z-[60] flex flex-col"
      >
        <div className="pt-12 pb-4 px-4 flex items-center justify-between bg-white border-b border-gray-100">
          <button onClick={() => setShowApps(false)} className="w-8 h-8 bg-gray-200/80 rounded-full flex items-center justify-center text-black">
            <ChevronLeft size={22} className="-ml-0.5" />
          </button>
          <h2 className="font-bold text-[17px]">Apps</h2>
          <button onClick={onClose} className="w-8 h-8 bg-gray-200/80 rounded-full flex items-center justify-center">
            <X size={18} className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>
        
        <div className="bg-white px-4 py-3 flex gap-2 justify-center">
          <div className="flex bg-gray-100 p-1 rounded-full w-full max-w-[300px]">
            <button onClick={() => setAppTab('All')} className={`flex-1 py-1.5 text-[13px] font-semibold rounded-full transition-all ${appTab === 'All' ? 'bg-white shadow text-black' : 'text-gray-600'}`}>All</button>
            <button onClick={() => setAppTab('Not')} className={`flex-1 py-1.5 text-[13px] font-semibold rounded-full transition-all ${appTab === 'Not' ? 'bg-white shadow text-black' : 'text-gray-600'}`}>Not on this iPhone</button>
          </div>
        </div>
        
        <div className="bg-white px-4 pb-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Games, Apps, and More" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 py-2 pl-9 pr-10 rounded-xl outline-none text-[15px] focus:ring-2 focus:ring-blue-500/20" 
            />
            <Mic className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
           {filteredApps.map((app: any) => (
              <div key={app.id} className="flex items-center gap-4 py-3 px-4 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                 <img src={app.iconUrl} className="w-[60px] h-[60px] rounded-[14px] border border-gray-200/50 object-cover shadow-sm" />
                 <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-[15px] text-gray-900 truncate">{app.name}</h3>
                   <p className="text-[13px] text-gray-500 mt-0.5">{app.category}</p>
                 </div>
                 <div className="shrink-0 flex items-center justify-center min-w-[32px]">
                   {downloadingId === app.id ? (
                     <div className="w-8 h-8 flex items-center justify-center">
                       <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                     </div>
                   ) : downloadedApps.has(app.id) ? (
                     <button onClick={() => onDownload(app)} className="px-4 py-1.5 bg-gray-100 text-blue-600 font-bold text-[13px] rounded-full uppercase tracking-wide">Open</button>
                   ) : (
                     <button onClick={() => onDownload(app)} className="w-8 h-8 flex items-center justify-center text-blue-500 active:scale-95 transition-transform">
                        <CloudDownload size={26} strokeWidth={2} />
                     </button>
                   )}
                 </div>
              </div>
           ))}
           {filteredApps.length === 0 && (
             <div className="p-8 text-center text-gray-500 text-sm">No apps found.</div>
           )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 bg-[#F2F2F7] z-50 flex flex-col"
    >
      <div className="pt-12 pb-4 px-4 flex justify-between items-center bg-[#F2F2F7]">
        <div className="w-8"></div>
        <h2 className="font-bold text-[17px]">Account</h2>
        <button onClick={onClose} className="w-8 h-8 bg-gray-200/80 rounded-full flex items-center justify-center">
          <X size={18} className="text-gray-500 hover:text-gray-700" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 pb-12">
        {!currentUser ? (
          <form onSubmit={handleLogin} className="space-y-4 pt-12">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-500 rounded-[24px] mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6">
                <User className="text-white" size={40} />
              </div>
              <h2 className="text-[22px] font-bold text-gray-900">Sign in to Apple ID</h2>
            </div>
            <input 
              type="email" placeholder="Apple ID" required
              className="w-full p-4 bg-white rounded-xl outline-none border border-gray-200 focus:ring-2 focus:ring-blue-500/20 text-[15px]"
              value={email} onChange={e => setEmail(e.target.value)}
            />
            <input 
              type="password" placeholder="Password" required
              className="w-full p-4 bg-white rounded-xl outline-none border border-gray-200 focus:ring-2 focus:ring-blue-500/20 text-[15px]"
              value={password} onChange={e => setPassword(e.target.value)}
            />
            <button type="submit" className="w-full py-4 bg-blue-500 text-white font-bold rounded-xl mt-6 active:scale-95 transition-all text-[15px]">Sign In</button>
          </form>
        ) : (
          <div className="space-y-5">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
               <div className="p-4 flex items-center gap-4 border-b border-gray-100">
                  <div className="w-[60px] h-[60px] rounded-full bg-[#8E9BCE] text-white flex items-center justify-center font-semibold text-[22px] tracking-wide">
                    {currentUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-[17px] text-gray-900 leading-tight">{currentUser.name.toUpperCase()}</h3>
                    <p className="text-gray-500 text-[13px] mt-0.5">{currentUser.email}</p>
                  </div>
               </div>
               <div className="p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-red-400 via-purple-400 to-blue-400 rounded-full flex items-center justify-center shadow-sm">
                       <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                    </div>
                    <span className="text-blue-500 font-semibold text-[15px]">Game Center</span>
                  </div>
                  <span className="text-gray-400 text-[12px] font-bold uppercase tracking-wide">{currentUser.name.split(' ')[0]} ↗</span>
               </div>
            </div>

            {/* List 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm text-[15px] font-medium">
               <button onClick={() => setShowApps(true)} className="w-full flex justify-between items-center p-4 border-b border-gray-100 hover:bg-gray-50">
                  <span className="text-gray-900">Apps</span>
                  <ChevronRight size={20} className="text-gray-300" />
               </button>
               <button className="w-full flex justify-between items-center p-4 border-b border-gray-100 hover:bg-gray-50">
                  <span className="text-gray-900">Purchase History</span>
                  <ChevronRight size={20} className="text-gray-300" />
               </button>
               <button className="w-full flex justify-between items-center p-4 hover:bg-gray-50">
                  <span className="text-gray-900">Notifications</span>
                  <ChevronRight size={20} className="text-gray-300" />
               </button>
            </div>

            {/* List 2 - Add Funds */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm text-[15px] font-medium">
               <button className="w-full flex justify-between items-center p-4 border-b border-gray-100 text-blue-500 hover:bg-gray-50 text-left">
                  Redeem Gift Card or Code
               </button>
               <button className="w-full flex justify-between items-center p-4 border-b border-gray-100 text-blue-500 hover:bg-gray-50 text-left">
                  Send Gift Card by Email
               </button>
               {addingFunds ? (
                 <div className="p-4 bg-gray-50/50 flex gap-3">
                   <input 
                     type="password" 
                     value={addBalancePassword} 
                     onChange={e => setAddBalancePassword(e.target.value)} 
                     placeholder="Password (EMAD8912)" 
                     className="flex-1 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-[15px]" 
                   />
                   <button onClick={handleAddFunds} className="px-5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-[15px] transition-colors shadow-sm active:scale-95">Add $50</button>
                 </div>
               ) : (
                 <button onClick={() => setAddingFunds(true)} className="w-full flex justify-between items-center p-4 text-blue-500 hover:bg-gray-50 text-left">
                    Add Money to Account <span className="text-gray-400 font-normal text-[13px] px-2 py-0.5 bg-gray-100 rounded-md">Balance: ${balance.toFixed(2)}</span>
                 </button>
               )}
            </div>

            {/* List 3 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm text-[15px] font-medium">
               <button className="w-full flex justify-between items-center p-4 hover:bg-gray-50 text-left">
                  <span className="text-gray-900">Personalized Recommendations</span>
                  <ChevronRight size={20} className="text-gray-300" />
               </button>
            </div>
            
            {/* Sign Out */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm text-[15px] font-medium mt-6 mb-8">
               <button onClick={() => saveCurrentUser(null)} className="w-full text-center p-4 text-red-500 hover:bg-red-50 font-medium transition-colors">
                  Sign Out
               </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
function AdminPage({ apps, saveApps, allUsers, saveAllUsers, isAuthenticated, setIsAuthenticated, initialTab }: any) {
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'apps' | 'users'>(initialTab || 'apps');

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  const [appForm, setAppForm] = useState<Partial<AppEntry>>({ category: 'Game', screenshots: [] });
  const [userForm, setUserForm] = useState<Partial<UserEntry>>({});

  if (!isAuthenticated) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full pt-32">
        <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-black/20">
           <Lock size={40} className="text-white" />
        </div>
        <h2 className="text-2xl font-black mb-8 text-gray-900">Admin Area</h2>
        <input 
          type="password" placeholder="Enter Admin Password"
          className="w-full p-4 bg-gray-50 rounded-xl outline-none border border-gray-200 mb-4 text-center font-bold tracking-widest focus:ring-2 focus:ring-black/5"
          value={password} onChange={e => setPassword(e.target.value)}
        />
        <button 
          onClick={() => {
            if (password === 'EMAD8912') setIsAuthenticated(true);
            else alert("Incorrect password");
          }}
          className="w-full py-4 bg-black text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg"
        >
          Unlock Console
        </button>
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, index?: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await toBase64(file);
        if (field === 'iconUrl') {
          setAppForm({ ...appForm, iconUrl: base64 });
        } else if (field === 'downloadUrl') {
          const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
          setAppForm({ 
            ...appForm, 
            downloadUrl: base64, 
            externalLink: base64,
            name: appForm.name || nameWithoutExt,
            size: sizeMB
          });
        } else if (field === 'screenshot' && index !== undefined) {
          const newScreenshots = [...(appForm.screenshots || [])];
          newScreenshots[index] = base64;
          setAppForm({ ...appForm, screenshots: newScreenshots });
        }
      } catch (err) {
        alert("Failed to read file.");
      }
    }
  };

  const handleSaveApp = () => {
    if (!appForm.name) return alert("Name required");
    const appToSave = { ...appForm, category: appForm.category || 'App' } as AppEntry;
    
    if (appForm.id) {
      saveApps(apps.map((a: AppEntry) => a.id === appForm.id ? { ...a, ...appToSave } : a));
      alert("App updated successfully!");
    } else {
      appToSave.id = Date.now().toString();
      saveApps([...apps, appToSave]);
      alert("App added successfully!");
    }
    setAppForm({ category: 'Game', screenshots: [] });
  };

  const handleDeleteApp = (id: string) => {
    saveApps(apps.filter((a: AppEntry) => a.id !== id));
    alert("App deleted successfully!");
  };

  const handleSaveUser = () => {
    if (!userForm.email || !userForm.name) return alert("Name and Email required");
    if (userForm.id) {
      saveAllUsers(allUsers.map((u: UserEntry) => u.id === userForm.id ? { ...u, ...userForm } : u));
      alert("User updated successfully!");
    } else {
      saveAllUsers([...allUsers, { ...userForm, id: Date.now().toString() } as UserEntry]);
      alert("User added successfully!");
    }
    setUserForm({});
  };

  const handleDeleteUser = (id: string) => {
    saveAllUsers(allUsers.filter((u: UserEntry) => u.id !== id));
    alert("User deleted successfully!");
  };

  return (
    <div className="p-5 space-y-6 pt-12">
      <h1 className="text-2xl font-black mb-6">{tab === 'apps' ? 'Publishing' : 'User Management'}</h1>

      {tab === 'apps' ? (
        <div className="space-y-8">
          <div className="bg-white p-5 rounded-2xl space-y-4 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg text-gray-900">{appForm.id ? 'Edit App/Game' : 'Add New App/Game'}</h3>
              {appForm.id && <button onClick={() => setAppForm({ category: 'Game', screenshots: [] })} className="text-blue-500 text-sm font-bold">Clear</button>}
            </div>
            
            <input placeholder="App Name" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={appForm.name || ''} onChange={e => setAppForm({...appForm, name: e.target.value})} />
            <input placeholder="Subtitle" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={appForm.subtitle || ''} onChange={e => setAppForm({...appForm, subtitle: e.target.value})} />
            <textarea placeholder="Description" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[80px]" value={appForm.description || ''} onChange={e => setAppForm({...appForm, description: e.target.value})} />
            
            <div className="flex gap-3">
               <input placeholder="Price (Free, $0.99)" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={appForm.price || ''} onChange={e => setAppForm({...appForm, price: e.target.value})} />
               <select className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" value={appForm.category || 'App'} onChange={e => setAppForm({...appForm, category: e.target.value as AppCategory})}>
                 <option value="App">App</option>
                 <option value="Game">Game</option>
               </select>
            </div>

            <div className="pt-2 pb-1">
               <label className="text-xs font-bold text-gray-500 uppercase">App Icon (Image File)</label>
               <div className="mt-2 flex items-center gap-4">
                  {appForm.iconUrl ? (
                    <img src={appForm.iconUrl} alt="Icon" className="w-14 h-14 rounded-xl object-cover border border-gray-200" />
                  ) : (
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center border border-dashed border-gray-300">
                      <ImageIcon size={20} className="text-gray-400" />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'iconUrl')} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer" />
               </div>
               <input placeholder="Or enter Icon URL" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 mt-3 text-sm" value={appForm.iconUrl || ''} onChange={e => setAppForm({...appForm, iconUrl: e.target.value})} />
            </div>

            <div className="pt-2 pb-1 border-t border-gray-100">
               <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Screenshots (1-3 Files)</label>
               {[0, 1, 2].map((index) => (
                 <div key={index} className="flex items-center gap-4 mb-3">
                   {appForm.screenshots && appForm.screenshots[index] ? (
                     <img src={appForm.screenshots[index]} alt="Screenshot" className="w-10 h-16 rounded-md object-cover border border-gray-200" />
                   ) : (
                     <div className="w-10 h-16 bg-gray-100 rounded-md flex items-center justify-center border border-dashed border-gray-300">
                       <ImageIcon size={16} className="text-gray-400" />
                     </div>
                   )}
                   <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'screenshot', index)} className="text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                 </div>
               ))}
            </div>

            <div className="pt-2 pb-1 border-t border-gray-100">
               <label className="text-xs font-bold text-gray-500 uppercase">Game File or Link</label>
               <input placeholder="Enter Website/Download Link" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 mt-2" value={appForm.externalLink || ''} onChange={e => setAppForm({...appForm, externalLink: e.target.value})} />
               <p className="text-xs text-gray-400 font-medium text-center my-2">OR</p>
               <input type="file" onChange={(e) => handleFileUpload(e, 'downloadUrl')} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-all cursor-pointer" />
            </div>

            <button onClick={handleSaveApp} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl active:scale-95 transition-all uppercase tracking-wider mt-4">
              {appForm.id ? 'Save Changes' : 'Publish App'}
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 mb-4 px-1">Live Applications</h3>
            {apps.map((a: AppEntry) => (
              <div key={a.id} className="flex items-center justify-between bg-white p-4 border border-gray-100 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                  <img src={a.iconUrl} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <p className="font-bold text-sm text-gray-900">{a.name}</p>
                    <p className="text-xs text-gray-500">{a.category} • {a.price || 'Free'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => {
                    setAppForm({ ...a, screenshots: a.screenshots || [] });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"><Edit2 size={18} /></button>
                  <button onClick={() => handleDeleteApp(a.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white p-5 rounded-2xl space-y-4 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg text-gray-900">{userForm.id ? 'Edit User' : 'Add New User'}</h3>
              {userForm.id && <button onClick={() => setUserForm({})} className="text-blue-500 text-sm font-bold">Clear</button>}
            </div>
            
            <input placeholder="Name" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={userForm.name || ''} onChange={e => setUserForm({...userForm, name: e.target.value})} />
            <input type="email" placeholder="Apple ID (Email)" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={userForm.email || ''} onChange={e => setUserForm({...userForm, email: e.target.value})} />
            <input type="password" placeholder="Password (Optional)" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={userForm.password || ''} onChange={e => setUserForm({...userForm, password: e.target.value})} />
            
            <button onClick={handleSaveUser} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl active:scale-95 transition-all uppercase tracking-wider mt-4">
              {userForm.id ? 'Update User' : 'Create User'}
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 mb-4 px-1">Registered Users</h3>
            {allUsers.map((u: UserEntry) => (
              <div key={u.id} className="flex items-center justify-between bg-white p-4 border border-gray-100 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => {
                    setUserForm(u);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"><Edit2 size={18} /></button>
                  <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
