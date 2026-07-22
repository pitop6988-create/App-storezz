import { QRCodeSVG } from "qrcode.react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { QrCode } from "lucide-react";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Rocket, Layers, Layout, Gamepad2, Smartphone, LayoutGrid, User, Plus, Trash2, Edit2, Lock, Unlock, Download, Check, AlertCircle, ChevronLeft, Star, Share, ExternalLink, Image as ImageIcon, File, UploadCloud, X , ChevronRight, Mic, CloudDownload, Fingerprint, Video, Play } from 'lucide-react';
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
    currentUser, saveCurrentUser,
    globalSettings, saveGlobalSettings
  } = useStore();

  const [activeTab, setActiveTab] = useState<'Today' | 'Games' | 'Apps' | 'Arcade' | 'Publish' | 'Users' | 'Settings' | 'Search'>('Today');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [viewingApp, setViewingApp] = useState<AppEntry | null>(null);
  const [viewingDeveloper, setViewingDeveloper] = useState<string | null>(null);
  const [confirmingApp, setConfirmingApp] = useState<AppEntry | null>(null);
  const [isConfirmingDownload, setIsConfirmingDownload] = useState(false);

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
      if (app.externalLink || app.downloadUrl || app.apkUrl || app.iosUrl) {
        const link = app.externalLink || app.downloadUrl || app.apkUrl || app.iosUrl;
        window.open(link, '_blank');
      } else {
        alert("No game file or link provided for this app!");
      }
      return;
    }

    const isPurchased = purchaseLibrary.has(app.id);
    if (!isPurchased) {
      setConfirmingApp(app);
    } else {
      processDownload(app);
    }
  };

  const processDownload = (app: AppEntry) => {
    setConfirmingApp(null);
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
      case 'Arcade':
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
            globalSettings={globalSettings} saveGlobalSettings={saveGlobalSettings}
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
            globalSettings={globalSettings}
            saveGlobalSettings={saveGlobalSettings}
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
            globalSettings={globalSettings}
            saveGlobalSettings={saveGlobalSettings}
          />
        );
      case 'Settings':
        return (
          <AdminPage 
            apps={apps} saveApps={saveApps}
            allUsers={allUsers} saveAllUsers={saveAllUsers}
            isAuthenticated={isAdminAuthenticated}
            setIsAuthenticated={setIsAdminAuthenticated}
            initialTab="settings"
            globalSettings={globalSettings}
            saveGlobalSettings={saveGlobalSettings}
          />
        );
    }
  };

  return (
    <div className="h-[100dvh] bg-gray-50 text-gray-900 font-sans flex justify-center overflow-hidden">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-24 relative">
          {renderContent()}
        </div>

        {/* Bottom Nav */}
        <div className="absolute bottom-6 inset-x-0 flex justify-center px-4 z-40 pointer-events-none">
          <div className="flex gap-4 items-center pointer-events-auto">
             <div className="bg-white/95 backdrop-blur-2xl shadow-xl shadow-black/10 border border-gray-100 rounded-full flex px-1 py-1 h-[68px] max-w-[calc(100vw-110px)] overflow-x-auto no-scrollbar">
                {!isAdminAuthenticated ? (
                  <>
                    <NavItem icon={Layout} label="Today" active={activeTab === 'Today'} onClick={() => setActiveTab('Today')} />
                    <NavItem icon={Rocket} label="Games" active={activeTab === 'Games'} onClick={() => setActiveTab('Games')} />
                    <NavItem icon={Layers} label="Apps" active={activeTab === 'Apps'} onClick={() => setActiveTab('Apps')} />
                    <NavItem icon={Gamepad2} label="Arcade" active={activeTab === 'Arcade'} onClick={() => setActiveTab('Arcade')} />
                  </>
                ) : (
                  <>
                    <NavItem icon={Rocket} label="Games" active={activeTab === 'Games'} onClick={() => setActiveTab('Games')} />
                    <NavItem icon={Layers} label="Apps" active={activeTab === 'Apps'} onClick={() => setActiveTab('Apps')} />
                    <NavItem icon={Gamepad2} label="Arcade" active={activeTab === 'Arcade'} onClick={() => setActiveTab('Arcade')} />
                    <NavItem icon={Plus} label="Publish" active={activeTab === 'Publish'} onClick={() => setActiveTab('Publish')} />
                    <NavItem icon={User} label="Users" active={activeTab === 'Users'} onClick={() => setActiveTab('Users')} />
                    <NavItem icon={Lock} label="Settings" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
                  </>
                )}
             </div>
             <button onClick={() => setActiveTab('Search')} className={`w-[68px] h-[68px] bg-white/95 backdrop-blur-2xl shadow-xl shadow-black/10 border border-gray-100 rounded-full flex items-center justify-center transition-colors ${activeTab === 'Search' ? 'bg-gray-100' : ''}`}>
                <Search size={32} strokeWidth={2.5} className={activeTab === 'Search' ? "text-blue-500" : "text-gray-900"} />
             </button>
          </div>
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
              globalSettings={globalSettings} saveGlobalSettings={saveGlobalSettings}
              isAdminAuthenticated={isAdminAuthenticated}
              setIsAdminAuthenticated={setIsAdminAuthenticated}
              setActiveTab={setActiveTab}
            />
          )}
        </AnimatePresence>

        {/* Developer View */}
        <AnimatePresence>
          {viewingDeveloper && (
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 bg-white z-[60] flex flex-col"
            >
              <div className="absolute top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-md z-10 flex items-center px-4 border-b border-gray-100">
                <button onClick={() => setViewingDeveloper(null)} className="flex items-center text-blue-500 font-medium">
                  <ChevronLeft size={24} className="-ml-1" />
                  Back
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pt-20 pb-24 px-5">
                <h1 className="text-3xl font-black mb-6">{viewingDeveloper}</h1>
                <div className="space-y-4">
                  {apps.filter(a => a.developer === viewingDeveloper).map(app => (
                    <div key={app.id} onClick={() => setViewingApp(app)} className="flex items-center gap-4 py-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors -mx-2 px-2">
                      <img src={app.iconUrl} alt={app.name} className="w-16 h-16 rounded-[1.25rem] object-cover shadow-sm border border-gray-100" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{app.name}</p>
                        <p className="text-xs text-gray-500 truncate">{app.subtitle}</p>
                      </div>
                      <DownloadButton app={app} onDownload={handleDownload} downloadingId={downloadingId} downloadProgress={downloadProgress} downloadedApps={downloadedApps} purchaseLibrary={purchaseLibrary} />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

                {/* Install Confirmation Modal */}
        <AnimatePresence>
          {confirmingApp && (
            <div className="absolute inset-0 z-[100] flex flex-col justify-end">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setConfirmingApp(null)}
              />
              <motion.div 
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative bg-gray-100 rounded-t-3xl shadow-2xl flex flex-col items-center w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="w-full bg-white px-5 pt-6 pb-4 rounded-t-3xl relative overflow-hidden">
                  <div className="w-full flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl">App Store</h3>
                    <button onClick={() => setConfirmingApp(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold hover:bg-gray-200">
                      <X size={18} />
                    </button>
                  </div>
                  
                  <div className="w-full flex items-center gap-4">
                    <img src={confirmingApp.iconUrl} alt={confirmingApp.name} className="w-16 h-16 rounded-[1.25rem] object-cover border border-gray-100 shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 truncate">{confirmingApp.name}</h4>
                      <p className="text-sm text-gray-500 truncate">{confirmingApp.developer || 'Evolve Global, Inc.'}</p>
                      <p className="text-xs text-gray-400 mt-1">Offers In-App Purchases</p>
                    </div>
                  </div>
                </div>
                
                <div className="w-full border-t border-gray-200 bg-white">
                  <div className="px-5 py-4 flex justify-between items-center border-b border-gray-100">
                    <div>
                       <p className="font-bold text-gray-900 text-lg">{(!confirmingApp.price || confirmingApp.price === 'Free') ? 'Free' : confirmingApp.price}</p>
                       <p className="text-sm text-gray-500">{(!confirmingApp.price || confirmingApp.price === 'Free') ? 'App' : 'One-time charge'}</p>
                    </div>
                  </div>
                  <div className="px-5 py-4 flex justify-between items-center border-b border-gray-100 text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-50">
                     <span>You are purchasing a license. See license details.</span>
                     <ChevronRight size={16} className="text-gray-400" />
                  </div>
                  <div className="px-5 py-4 text-sm text-gray-500 border-b border-gray-200">
                    Account: <span className="text-gray-900">{currentUser?.email || currentUser?.name || 'user@icloud.com'}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col items-center w-full pb-8">
                  <button 
                    onDoubleClick={() => {
                      setIsConfirmingDownload(true);
                      setTimeout(() => {
                        setIsConfirmingDownload(false);
                        if (confirmingApp) processDownload(confirmingApp);
                      }, 1000);
                    }}
                    onClick={() => {
                      setIsConfirmingDownload(true);
                      setTimeout(() => {
                        setIsConfirmingDownload(false);
                        if (confirmingApp) processDownload(confirmingApp);
                      }, 1000);
                    }}
                    className={`w-14 h-14 rounded-full border-2 flex items-center justify-center mb-3 transition-colors shadow-sm ${isConfirmingDownload ? 'bg-blue-500 border-blue-500 text-white' : 'border-blue-500 text-blue-500 hover:bg-blue-50 active:bg-blue-100'}`}
                  >
                    {isConfirmingDownload ? <Check size={32} /> : <Fingerprint size={32} />}
                  </button>
                  <p className="font-bold text-gray-900">{isConfirmingDownload ? 'Confirmed' : 'Confirm with Side Button'}</p>
                </div>

                {/* Double-click text hovering */}
                <div className="absolute top-28 right-4 flex flex-col items-end pointer-events-none z-50 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  <div className="font-bold text-xl whitespace-nowrap">
                    Double-Click
                  </div>
                  <div className="font-bold text-xl whitespace-nowrap">
                    to {(!confirmingApp?.price || confirmingApp?.price === 'Free') ? 'Install' : 'Pay'}
                  </div>
                  <div className="w-8 h-1 bg-white mt-2 rounded-full relative">
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-[6px] border-t-transparent border-b-transparent border-l-white"></div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        
        {/* App Details View */}
        <AnimatePresence>
          {viewingApp && (
            <AppDetails 
              app={viewingApp}
              onDeveloperClick={setViewingDeveloper} 
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
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 min-w-[72px] px-2 py-1 rounded-[1.75rem] transition-colors ${active ? 'bg-[#E5E5EA] text-blue-500' : 'text-black'}`}>
      <Icon size={28} strokeWidth={2.5} className={active ? "text-blue-500" : "text-black"} />
      <span className={`text-[11px] ${active ? 'font-bold' : 'font-semibold'}`}>{label}</span>
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
  if (tab === 'Arcade') {
    const arcadeOnly = apps.filter((a: AppEntry) => a.category === 'Arcade');
    displayApps = arcadeOnly.length > 0 ? arcadeOnly : apps.filter((a: AppEntry) => a.category === 'Game' || a.category === 'Arcade');
  }
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
          {currentUser ? (
            <span className="text-[14px] font-bold text-gray-700">
              {currentUser.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : currentUser.email.substring(0, 2).toUpperCase()}
            </span>
          ) : (
            <User size={20} className="text-gray-400" />
          )}
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

function AppDetails({ app, onClose, onDownload, downloadingId, downloadProgress, downloadedApps, purchaseLibrary, onDeveloperClick }: any) {
  const [fullscreenScreenshot, setFullscreenScreenshot] = React.useState<string | null>(null);
  const [showVersionHistoryModal, setShowVersionHistoryModal] = React.useState(false);
  const [isWhatsNewExpanded, setIsWhatsNewExpanded] = React.useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false);

  // Derive version history list
  const versionHistoryList = (app.versionHistory && app.versionHistory.length > 0)
    ? app.versionHistory
    : [
        { 
          version: app.version || '1.0.0', 
          date: app.versionDate || '1w ago', 
          notes: app.whatsNew || 'General bug fixes and performance improvements.' 
        },
        { 
          version: '0.9.0', 
          date: '1m ago', 
          notes: 'Beta release with core features and UI enhancements.' 
        }
      ];

  const latestVersion = versionHistoryList[0];
  const whatsNewNotes = app.whatsNew || latestVersion?.notes || 'Bug fixes and performance improvements.';

  return (
    <motion.div 
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 bg-white z-50 flex flex-col"
    >
      <AnimatePresence>
        {fullscreenScreenshot && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setFullscreenScreenshot(null)}
          >
            <img src={fullscreenScreenshot} className="max-w-full max-h-[90vh] object-contain rounded-xl" />
          </motion.div>
        )}

        {/* Version History Sheet / Modal */}
        {showVersionHistoryModal && (
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col"
          >
            <div className="sticky top-0 bg-white/90 backdrop-blur-md px-5 py-4 border-b border-gray-100 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Version History</h2>
              <button 
                onClick={() => setShowVersionHistoryModal(false)}
                className="px-4 py-1.5 bg-gray-100 text-blue-600 font-bold text-sm rounded-full active:scale-95 transition-transform"
              >
                Done
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
              {versionHistoryList.map((v: any, idx: number) => (
                <div key={idx} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-bold text-base text-gray-900">Version {v.version}</h3>
                    <span className="text-xs text-gray-400 font-medium">{v.date}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{v.notes}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <p onClick={() => onDeveloperClick && onDeveloperClick(app.developer)} className="text-xs text-blue-500 font-medium mt-1 cursor-pointer">{app.developer}</p>
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

        {/* What's New Section with Version History & More */}
        <div className="mb-6 pb-6 border-b border-gray-100">
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="font-bold text-xl text-gray-900 tracking-tight">What's New</h3>
            <button 
              onClick={() => setShowVersionHistoryModal(true)}
              className="text-blue-500 font-medium text-sm hover:underline flex items-center gap-0.5"
            >
              Version History <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs text-gray-400 font-medium">Version {latestVersion?.version || app.version || '1.0.0'}</span>
            <span className="text-xs text-gray-400 font-medium">{latestVersion?.date || app.versionDate || '1w ago'}</span>
          </div>
          <div className="relative">
            <p className={`text-sm leading-relaxed text-gray-800 ${!isWhatsNewExpanded ? 'line-clamp-2' : ''}`}>
              {whatsNewNotes}
            </p>
            {!isWhatsNewExpanded && whatsNewNotes.length > 50 && (
              <button 
                onClick={() => setIsWhatsNewExpanded(true)}
                className="text-blue-500 font-semibold text-xs mt-1 hover:underline focus:outline-none"
              >
                more
              </button>
            )}
          </div>
        </div>

        {/* Video Preview */}
        {app.videoUrl && (
          <div className="mb-8">
            <h3 className="font-bold text-lg text-gray-900 tracking-tight mb-3 flex items-center gap-2">
              <Video size={18} className="text-purple-600" /> Preview Video
            </h3>
            <div className="rounded-2xl overflow-hidden bg-black shadow-md border border-gray-100 relative group">
              <video 
                src={app.videoUrl} 
                controls 
                playsInline 
                className="w-full max-h-[320px] object-contain mx-auto" 
              />
            </div>
          </div>
        )}

        {app.screenshots && app.screenshots.length > 0 && (
          <div className="mb-8">
            <h3 className="font-bold text-lg text-gray-900 tracking-tight mb-3">Screenshots</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 -mx-5 px-5">
              {app.screenshots.map((s: string, i: number) => (
                <img key={i} src={s} alt={`Screenshot ${i + 1}`} onClick={() => setFullscreenScreenshot(s)} className="w-[200px] h-[350px] object-cover rounded-2xl border border-gray-100 snap-center shadow-sm shrink-0 bg-gray-100 cursor-pointer hover:opacity-95 transition-opacity" />
              ))}
            </div>
          </div>
        )}

        <div className="mb-8 relative">
          <p className={`text-[15px] leading-relaxed text-gray-700 whitespace-pre-wrap ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
            {app.description || 'No description available.'}
          </p>
          {!isDescriptionExpanded && (app.description?.length || 0) > 120 && (
            <button 
              onClick={() => setIsDescriptionExpanded(true)}
              className="text-blue-500 font-semibold text-sm mt-1.5 hover:underline focus:outline-none"
            >
              more
            </button>
          )}
        </div>

        <div className="space-y-3 pt-6 border-t border-gray-100">
           <h3 className="font-bold text-lg mb-2">Information</h3>
           <div className="flex justify-between items-center py-3 border-b border-gray-50 text-sm">
             <span className="text-gray-500">Provider</span>
             <span className="text-blue-500 font-medium cursor-pointer" onClick={() => onDeveloperClick && onDeveloperClick(app.developer || 'Unknown')}>{app.developer || 'Unknown'}</span>
           </div>
           <div className="flex justify-between items-center py-3 border-b border-gray-50 text-sm">
             <span className="text-gray-500">Size</span>
             <span className="text-gray-900 font-medium">{app.size || '100 MB'}</span>
           </div>
           <div className="flex justify-between items-center py-3 border-b border-gray-50 text-sm">
             <span className="text-gray-500">Category</span>
             <span className="text-gray-900 font-medium">{app.category || 'App'}</span>
           </div>
           <div className="flex justify-between items-center py-3 border-b border-gray-50 text-sm">
             <span className="text-gray-500">Compatibility</span>
             <span className="text-gray-900 font-medium">Works on this device</span>
           </div>
           <div className="flex justify-between items-center py-3 border-b border-gray-50 text-sm">
             <span className="text-gray-500">Age Rating</span>
             <span className="text-gray-900 font-medium">{app.category === 'Game' ? '12+' : '4+'}</span>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---- Modals & Admin Below ----

function AccountModal({ onClose, currentUser, saveCurrentUser, allUsers, balance, saveBalance, apps, downloadedApps, onDownload, downloadingId, downloadProgress, purchaseLibrary, globalSettings, saveGlobalSettings, isAdminAuthenticated, setIsAdminAuthenticated, setActiveTab }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [addBalancePassword, setAddBalancePassword] = useState('');
  const [addingFunds, setAddingFunds] = useState(false);
  const [isScanningCode, setIsScanningCode] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [appTab, setAppTab] = useState<'All' | 'Not'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminUnlock, setShowAdminUnlock] = useState(false);

  const handleAdminUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const correctCode = globalSettings?.adminCode || '1234';
    if (adminPasswordInput === correctCode) {
      setIsAdminAuthenticated(true);
      setAdminPasswordInput('');
      setShowAdminUnlock(false);
      alert('Admin Mode Unlocked successfully!');
    } else {
      alert('Incorrect Admin Password');
    }
  };

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
    let addedAmount = 0;
    let matchedCodeObj = globalSettings.moneyCodes?.find((c: any) => c.code === addBalancePassword || c === addBalancePassword);
    
    if (addBalancePassword === globalSettings.moneyCode) {
      addedAmount = 50;
    } else if (matchedCodeObj) {
      addedAmount = matchedCodeObj.amount || 50;
      const newCodes = globalSettings.moneyCodes.filter((c: any) => c !== matchedCodeObj);
      saveGlobalSettings({ ...globalSettings, moneyCodes: newCodes });
    }

    if (addedAmount > 0) {
      saveBalance(balance + addedAmount);
      setAddBalancePassword('');
      setAddingFunds(false);
      alert(`Successfully added ${addedAmount} to your balance!`);
    } else {
      alert('Invalid Code');
    }
  };

  const myApps = apps.filter((a: any) => appTab === 'All' ? (downloadedApps.has(a.id) || purchaseLibrary.has(a.id)) : (purchaseLibrary.has(a.id) && !downloadedApps.has(a.id)));
  const filteredApps = myApps.filter((a: any) => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (isScanningCode) {
    return (
      <motion.div 
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute inset-0 bg-white z-[100] flex flex-col"
      >
        <div className="pt-12 pb-4 px-4 flex justify-between items-center bg-white border-b border-gray-100">
          <div className="w-8"></div>
          <h2 className="font-bold text-[17px]">Scan Code</h2>
          <button onClick={() => setIsScanningCode(false)} className="w-8 h-8 bg-gray-200/80 rounded-full flex items-center justify-center">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        
        <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
           <Scanner
              onScan={(result) => {
                if (result && result.length > 0) {
                  setAddBalancePassword(result[0].rawValue);
                  setIsScanningCode(false);
                }
              }}
              onError={(error) => {
                console.error(error);
              }}
           />
        </div>
        <div className="p-6 text-center bg-white">
          <p className="text-sm text-gray-500 font-medium">Position the QR code within the frame to scan.</p>
        </div>
      </motion.div>
    );
  }

  if (isScanningCode) {
    return (
      <motion.div 
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute inset-0 bg-white z-[100] flex flex-col"
      >
        <div className="pt-12 pb-4 px-4 flex justify-between items-center bg-white border-b border-gray-100">
          <div className="w-8"></div>
          <h2 className="font-bold text-[17px]">Scan Code</h2>
          <button onClick={() => setIsScanningCode(false)} className="w-8 h-8 bg-gray-200/80 rounded-full flex items-center justify-center">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        
        <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
           <Scanner
              onScan={(result) => {
                if (result && result.length > 0) {
                  setAddBalancePassword(result[0].rawValue);
                  setIsScanningCode(false);
                }
              }}
              onError={(error) => {
                console.error(error);
              }}
           />
        </div>
        <div className="p-6 text-center bg-white">
          <p className="text-sm text-gray-500 font-medium">Position the QR code within the frame to scan.</p>
        </div>
      </motion.div>
    );
  }

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
          <div className="space-y-6 pt-12">
            <form onSubmit={handleLogin} className="space-y-4">
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

            {/* Admin Access Card for Signed-out mode */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-3 mt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-gray-900 font-bold text-sm">
                  <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center">
                    <Lock size={14} />
                  </div>
                  <span>Admin Console</span>
                </div>
                {isAdminAuthenticated ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    Active
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 font-normal">Locked</span>
                )}
              </div>

              {!isAdminAuthenticated ? (
                <form onSubmit={handleAdminUnlock} className="space-y-3 pt-1">
                  <p className="text-xs text-gray-500">Enter Admin password to manage apps, users, and store settings.</p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Admin Password"
                      value={adminPasswordInput}
                      onChange={e => setAdminPasswordInput(e.target.value)}
                      className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-medium focus:ring-2 focus:ring-black/10"
                    />
                    <button type="submit" className="px-4 bg-black text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition-colors">
                      Unlock
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3 pt-1">
                  <p className="text-xs text-green-600 font-medium">Administrator Console Unlocked.</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => { setActiveTab?.('Publish'); onClose(); }} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-800 flex flex-col items-center gap-1 transition-colors">
                      <Plus size={16} className="text-blue-500" /> Publish
                    </button>
                    <button onClick={() => { setActiveTab?.('Users'); onClose(); }} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-800 flex flex-col items-center gap-1 transition-colors">
                      <User size={16} className="text-purple-500" /> Users
                    </button>
                    <button onClick={() => { setActiveTab?.('Settings'); onClose(); }} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-800 flex flex-col items-center gap-1 transition-colors">
                      <Lock size={16} className="text-amber-500" /> Settings
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
               <div className="p-4 flex items-center gap-4 border-b border-gray-100">
                  <div className="w-[60px] h-[60px] rounded-full bg-[#8E9BCE] text-white flex items-center justify-center font-semibold text-[22px] tracking-wide">
                    {currentUser.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : currentUser.email.substring(0, 2).toUpperCase()}
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

            {/* Admin Console Card */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm text-[15px] font-medium border border-gray-100">
               <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                 <div className="flex items-center gap-2.5 font-bold text-gray-900">
                   <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center">
                     <Lock size={14} />
                   </div>
                   <span>Admin Console</span>
                 </div>
                 {isAdminAuthenticated ? (
                   <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200">
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                     Active
                   </span>
                 ) : (
                   <span className="text-xs text-gray-400 font-normal">Locked</span>
                 )}
               </div>

               {!isAdminAuthenticated ? (
                 <div className="p-4 space-y-3">
                   <p className="text-xs text-gray-500">Unlock to publish apps, manage users, and adjust global settings.</p>
                   {showAdminUnlock ? (
                     <form onSubmit={handleAdminUnlock} className="flex gap-2">
                       <input
                         type="password"
                         placeholder="Enter Admin Password"
                         value={adminPasswordInput}
                         onChange={e => setAdminPasswordInput(e.target.value)}
                         className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-medium focus:ring-2 focus:ring-black/10"
                       />
                       <button type="submit" className="px-4 bg-black text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition-colors">
                         Unlock
                       </button>
                     </form>
                   ) : (
                     <button 
                       onClick={() => setShowAdminUnlock(true)}
                       className="w-full py-3 bg-black text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                     >
                       <Unlock size={14} /> Unlock Admin Console
                     </button>
                   )}
                 </div>
               ) : (
                 <div className="p-2 space-y-1">
                   <button onClick={() => { setActiveTab?.('Publish'); onClose(); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-left transition-colors">
                     <div className="flex items-center gap-3 text-gray-900 font-semibold text-sm">
                       <Plus size={18} className="text-blue-500" />
                       <span>Publish & Edit Apps</span>
                     </div>
                     <ChevronRight size={18} className="text-gray-300" />
                   </button>
                   <button onClick={() => { setActiveTab?.('Users'); onClose(); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-left transition-colors">
                     <div className="flex items-center gap-3 text-gray-900 font-semibold text-sm">
                       <User size={18} className="text-purple-500" />
                       <span>User Management</span>
                     </div>
                     <ChevronRight size={18} className="text-gray-300" />
                   </button>
                   <button onClick={() => { setActiveTab?.('Settings'); onClose(); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-left transition-colors">
                     <div className="flex items-center gap-3 text-gray-900 font-semibold text-sm">
                       <Lock size={18} className="text-amber-500" />
                       <span>Global Settings & Codes</span>
                     </div>
                     <ChevronRight size={18} className="text-gray-300" />
                   </button>
                   <div className="pt-2 border-t border-gray-100 px-1">
                     <button onClick={() => setIsAdminAuthenticated(false)} className="w-full py-2 text-center text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                       Lock Admin Console
                     </button>
                   </div>
                 </div>
               )}
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
                     placeholder="Enter Password" 
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
function AdminPage({ apps, saveApps, allUsers, saveAllUsers, isAuthenticated, setIsAuthenticated, initialTab, globalSettings, saveGlobalSettings }: any) {
  const [viewingQrCode, setViewingQrCode] = useState<{code: string, amount: number} | null>(null);
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'apps' | 'users' | 'settings'>(initialTab || 'apps');

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  const [appForm, setAppForm] = useState<Partial<AppEntry>>({ category: 'Game', screenshots: [] });
  const [userForm, setUserForm] = useState<Partial<UserEntry>>({});
  const [settingsForm, setSettingsForm] = useState(globalSettings);

  useEffect(() => {
    setSettingsForm(globalSettings);
  }, [globalSettings]);

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
            if (password === globalSettings.adminCode) setIsAuthenticated(true);
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
        } else if (field === 'videoUrl') {
          setAppForm({ ...appForm, videoUrl: base64 });
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
      <h1 className="text-2xl font-black mb-6">
        {tab === 'apps' ? 'Publishing' : tab === 'users' ? 'User Management' : 'Global Settings'}
      </h1>

      {tab === 'apps' ? (
        <div className="space-y-8">
          <div className="bg-white p-5 rounded-2xl space-y-4 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg text-gray-900">{appForm.id ? 'Edit App/Game' : 'Add New App/Game'}</h3>
              {appForm.id && <button onClick={() => setAppForm({ category: 'Game', screenshots: [] })} className="text-blue-500 text-sm font-bold">Clear</button>}
            </div>
            
            <input placeholder="App Name" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={appForm.name || ''} onChange={e => setAppForm({...appForm, name: e.target.value})} />
            <input placeholder="Subtitle" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={appForm.subtitle || ''} onChange={e => setAppForm({...appForm, subtitle: e.target.value})} />
            <input placeholder="Developer" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={appForm.developer || ''} onChange={e => setAppForm({...appForm, developer: e.target.value})} />
            <textarea placeholder="Description" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[80px]" value={appForm.description || ''} onChange={e => setAppForm({...appForm, description: e.target.value})} />
            
            <div className="flex gap-3">
               <input placeholder="Price (Free, $0.99)" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={appForm.price || ''} onChange={e => setAppForm({...appForm, price: e.target.value})} />
               <input placeholder="Size (e.g. 100 MB)" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20" value={appForm.size || ''} onChange={e => setAppForm({...appForm, size: e.target.value})} />
               <select className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 font-medium" value={appForm.category || 'App'} onChange={e => setAppForm({...appForm, category: e.target.value as AppCategory})}>
                 <option value="App">App</option>
                 <option value="Game">Game</option>
                 <option value="Arcade">Arcade</option>
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

            {/* Video Preview (1 File) */}
            <div className="pt-3 pb-2 border-t border-gray-100">
               <label className="text-xs font-bold text-gray-500 uppercase flex items-center justify-between mb-2">
                 <span className="flex items-center gap-1.5"><Video size={14} className="text-purple-600" /> App Preview Video (1 File)</span>
                 {appForm.videoUrl && (
                   <button 
                     type="button"
                     onClick={() => setAppForm({ ...appForm, videoUrl: '' })} 
                     className="text-red-500 hover:underline text-xs font-semibold"
                   >
                     Remove Video
                   </button>
                 )}
               </label>
               <div className="flex items-center gap-4 mt-2">
                  {appForm.videoUrl ? (
                    <div className="w-20 h-14 bg-black rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center shrink-0 relative">
                      <video src={appForm.videoUrl} className="w-full h-full object-cover" muted />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Video size={16} className="text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-14 bg-gray-100 rounded-xl flex items-center justify-center border border-dashed border-gray-300 shrink-0">
                      <Video size={20} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <input 
                      type="file" 
                      accept="video/*" 
                      onChange={(e) => handleFileUpload(e, 'videoUrl')} 
                      className="text-xs w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-all cursor-pointer" 
                    />
                  </div>
               </div>
               <input 
                 placeholder="Or enter Video URL (e.g. https://.../preview.mp4)" 
                 className="w-full p-2.5 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 mt-3 text-xs font-medium" 
                 value={appForm.videoUrl || ''} 
                 onChange={e => setAppForm({...appForm, videoUrl: e.target.value})} 
               />
            </div>

            {/* Screenshots (1-3 Files) */}
            <div className="pt-3 pb-2 border-t border-gray-100">
               <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Screenshots (1-3 Files)</label>
               <div className="space-y-3">
                 {[0, 1, 2].map((index) => {
                   const screenshotUrl = appForm.screenshots && appForm.screenshots[index];
                   return (
                     <div key={index} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                       <div className="flex items-center justify-between">
                         <span className="text-xs font-bold text-gray-600">Screenshot #{index + 1}</span>
                         {screenshotUrl && (
                           <button 
                             type="button"
                             onClick={() => {
                               const newScreenshots = [...(appForm.screenshots || [])];
                               newScreenshots[index] = '';
                               setAppForm({ ...appForm, screenshots: newScreenshots });
                             }}
                             className="text-red-500 hover:bg-red-50 p-1 rounded-full text-xs"
                             title="Clear screenshot"
                           >
                             <X size={14} />
                           </button>
                         )}
                       </div>
                       <div className="flex items-center gap-3">
                         {screenshotUrl ? (
                           <img src={screenshotUrl} alt={`Screenshot ${index + 1}`} className="w-10 h-16 rounded-md object-cover border border-gray-200 shrink-0" />
                         ) : (
                           <div className="w-10 h-16 bg-white rounded-md flex items-center justify-center border border-dashed border-gray-300 shrink-0">
                             <ImageIcon size={16} className="text-gray-400" />
                           </div>
                         )}
                         <div className="flex-1 min-w-0 space-y-2">
                           <input 
                             type="file" 
                             accept="image/*" 
                             onChange={(e) => handleFileUpload(e, 'screenshot', index)} 
                             className="text-xs w-full file:mr-2 file:py-1 file:px-2.5 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
                           />
                           <input 
                             placeholder={`Or Image URL #${index + 1}`} 
                             className="w-full p-2 bg-white rounded-lg outline-none border border-gray-200 text-xs focus:border-blue-500" 
                             value={screenshotUrl || ''} 
                             onChange={e => {
                               const newScreenshots = [...(appForm.screenshots || [])];
                               newScreenshots[index] = e.target.value;
                               setAppForm({ ...appForm, screenshots: newScreenshots });
                             }} 
                           />
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>

            <div className="pt-2 pb-1 border-t border-gray-100">
               <label className="text-xs font-bold text-gray-500 uppercase">Game File or Link</label>
               <input placeholder="Enter Website/Download Link" className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 mt-2" value={appForm.externalLink || ''} onChange={e => setAppForm({...appForm, externalLink: e.target.value})} />
               <p className="text-xs text-gray-400 font-medium text-center my-2">OR</p>
               <input type="file" onChange={(e) => handleFileUpload(e, 'downloadUrl')} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-all cursor-pointer" />
            </div>

            <div className="pt-4 pb-2 border-t border-gray-100">
               <label className="text-xs font-bold text-gray-500 uppercase flex justify-between items-center mb-3">
                 Version History
                 <button 
                   onClick={() => {
                     const newVersions = [...(appForm.versionHistory || [])];
                     newVersions.unshift({ version: '1.0.0', date: 'Just now', notes: 'Initial release' });
                     setAppForm({...appForm, versionHistory: newVersions});
                   }}
                   className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors normal-case"
                 >+ Add Version</button>
               </label>
               
               <div className="space-y-4">
                 {(appForm.versionHistory || []).map((v: any, idx: number) => (
                   <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 relative">
                     <button 
                       onClick={() => {
                         const newVersions = [...appForm.versionHistory!];
                         newVersions.splice(idx, 1);
                         setAppForm({...appForm, versionHistory: newVersions});
                       }}
                       className="absolute top-2 right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200"
                     ><X size={14} /></button>
                     <div className="flex gap-2 mb-2 pr-8">
                       <input placeholder="Version (e.g. 1.0.0)" className="w-1/2 p-2 bg-white rounded-lg outline-none border border-gray-200 text-sm focus:border-blue-500" value={v.version} onChange={e => {
                         const newVersions = [...appForm.versionHistory!];
                         newVersions[idx].version = e.target.value;
                         setAppForm({...appForm, versionHistory: newVersions});
                       }} />
                       <input placeholder="Date (e.g. 2d ago)" className="w-1/2 p-2 bg-white rounded-lg outline-none border border-gray-200 text-sm focus:border-blue-500" value={v.date} onChange={e => {
                         const newVersions = [...appForm.versionHistory!];
                         newVersions[idx].date = e.target.value;
                         setAppForm({...appForm, versionHistory: newVersions});
                       }} />
                     </div>
                     <textarea placeholder="Release notes" className="w-full p-2 bg-white rounded-lg outline-none border border-gray-200 text-sm focus:border-blue-500 min-h-[60px]" value={v.notes} onChange={e => {
                       const newVersions = [...appForm.versionHistory!];
                       newVersions[idx].notes = e.target.value;
                       setAppForm({...appForm, versionHistory: newVersions});
                     }} />
                   </div>
                 ))}
               </div>
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
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                      {a.category === 'Arcade' ? (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded-md font-bold text-[10px]">
                          <Gamepad2 size={12} /> Arcade
                        </span>
                      ) : a.category === 'Game' ? (
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md font-bold text-[10px]">
                          <Rocket size={12} /> Game
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold text-[10px]">
                          <Layers size={12} /> App
                        </span>
                      )}
                      <span>•</span>
                      <span>{a.price || 'Free'}</span>
                    </p>
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
      ) : tab === 'users' ? (
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
      ) : (
        <div className="space-y-8">
           <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              <div>
                 <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Admin Console Password</label>
                 <div className="flex gap-2">
                   <input 
                     type="text" 
                     value={settingsForm.adminCode} 
                     onChange={e => setSettingsForm({...settingsForm, adminCode: e.target.value})}
                     className="flex-1 p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                   />
                   <button 
                     onClick={() => {
                        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                        let code = '';
                        for(let i=0; i<8; i++) code += chars[Math.floor(Math.random() * chars.length)];
                        const newSettings = {...settingsForm, adminCode: code};
                        setSettingsForm(newSettings);
                        saveGlobalSettings(newSettings);
                     }}
                     className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-xs uppercase"
                   >
                     Random
                   </button>
                 </div>
                 <p className="text-[10px] text-gray-400 mt-2 px-1">This code is required to access the Publish, Users, and Settings tabs.</p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                 <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Money Addition Codes (One Tap Copy)</label>
                 <div className="space-y-2">
                   {(settingsForm.moneyCodes || []).map((cObj: any, idx: number) => (
                     <div key={idx} className="flex gap-2 items-center">
                       <input 
                         type="text" 
                         value={cObj.code || cObj}
                         readOnly
                         className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none font-bold text-sm text-gray-600"
                       />
                       <span className="font-black text-green-600 w-12">${cObj.amount || 50}</span>
                       <button onClick={() => setViewingQrCode({ code: cObj.code || cObj, amount: cObj.amount || 50 })} className="px-3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"><QrCode size={16}/></button>
                       <button onClick={() => {
                          navigator.clipboard.writeText(cObj.code || cObj);
                          alert("Code Copied!");
                       }} className="px-3 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-bold text-xs uppercase transition-colors">Copy</button>
                       <button onClick={() => {
                          const newCodes = settingsForm.moneyCodes.filter((_: any, i: number) => i !== idx);
                          const newSettings = {...settingsForm, moneyCodes: newCodes};
                          setSettingsForm(newSettings);
                          saveGlobalSettings(newSettings);
                       }} className="px-3 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs uppercase transition-colors"><Trash2 size={16}/></button>
                     </div>
                   ))}
                   
                   <div className="grid grid-cols-2 gap-2 pt-2">
                     {[5, 10, 50, 100].map(amount => (
                       <button 
                         key={amount}
                         onClick={() => {
                            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                            let code = '';
                            for(let i=0; i<8; i++) code += chars[Math.floor(Math.random() * chars.length)];
                            const newCodes = [...(settingsForm.moneyCodes || []), { code, amount }];
                            const newSettings = {...settingsForm, moneyCodes: newCodes};
                            setSettingsForm(newSettings);
                            saveGlobalSettings(newSettings);
                         }}
                         className="px-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-xs uppercase flex justify-center items-center gap-1"
                       >
                         <Plus size={14} /> ${amount}
                       </button>
                     ))}
                   </div>
                 </div>
                 <p className="text-[10px] text-gray-400 mt-2 px-1">These codes can be used to add balance. Users can consume a code once.</p>
              </div>

              <button 
                onClick={() => {
                  saveGlobalSettings(settingsForm);
                  alert("Settings saved successfully!");
                }}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl active:scale-95 transition-all shadow-lg uppercase tracking-wider"
              >
                Save All Settings
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
