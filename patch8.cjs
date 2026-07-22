const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add Fingerprint to imports
code = code.replace(
  "import { Gamepad2, Smartphone, Search, User, Lock, Plus, Upload, Trash2, ArrowLeft, Star, Edit, Save, X, Settings as SettingsIcon, ChevronRight, Share, Download, ChevronLeft } from 'lucide-react';",
  "import { Gamepad2, Smartphone, Search, User, Lock, Plus, Upload, Trash2, ArrowLeft, Star, Edit, Save, X, Settings as SettingsIcon, ChevronRight, Share, Download, ChevronLeft, Fingerprint, Power } from 'lucide-react';"
);

// 2. Add state
code = code.replace(
  "const [viewingDeveloper, setViewingDeveloper] = useState<string | null>(null);",
  "const [viewingDeveloper, setViewingDeveloper] = useState<string | null>(null);\n  const [confirmingApp, setConfirmingApp] = useState<AppEntry | null>(null);"
);

// 3. Rewrite handleDownload to separate processDownload
const oldHandleDownload = `  const handleDownload = (app: AppEntry, e?: React.MouseEvent) => {
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
        alert(\`Insufficient funds. You need \$\${priceValue} but have \$\${userBalance}\`);
        return;
      }
      saveUserBalance(userBalance - priceValue);
      const newPurchased = new Set<string>(purchaseLibrary);
      newPurchased.add(app.id);
      savePurchaseLibrary(newPurchased);
    }

    const sizeInMB = parseFloat((app.size || "100 MB").replace(/[^\\d.]/g, '')) || 100;
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
  };`;

const newHandleDownload = `  const handleDownload = (app: AppEntry, e?: React.MouseEvent) => {
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
        alert(\`Insufficient funds. You need \$\${priceValue} but have \$\${userBalance}\`);
        return;
      }
      saveUserBalance(userBalance - priceValue);
      const newPurchased = new Set<string>(purchaseLibrary);
      newPurchased.add(app.id);
      savePurchaseLibrary(newPurchased);
    }

    const sizeInMB = parseFloat((app.size || "100 MB").replace(/[^\\d.]/g, '')) || 100;
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
  };`;

code = code.replace(oldHandleDownload, newHandleDownload);

const confirmModalUI = `        {/* Install Confirmation Modal */}
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
                
                <div className="w-full py-4 px-5 border-t border-b border-gray-200 text-sm text-gray-500 bg-white mb-6">
                  Account: <span className="text-gray-900">{currentUser?.email || currentUser?.username || 'user@icloud.com'}</span>
                </div>
                
                <div className="mt-2 flex flex-col items-center w-full pb-8">
                  <button 
                    onDoubleClick={() => processDownload(confirmingApp)}
                    onClick={() => processDownload(confirmingApp)}
                    className="w-14 h-14 rounded-full border-2 border-blue-500 flex items-center justify-center text-blue-500 mb-3 hover:bg-blue-50 active:bg-blue-100 transition-colors shadow-sm"
                  >
                    <Fingerprint size={32} />
                  </button>
                  <p className="font-bold text-gray-900">Confirm with Side Button</p>
                </div>

                {/* Double-click text hovering */}
                <div className="absolute top-28 right-4 flex flex-col items-end pointer-events-none z-50 mix-blend-difference text-white">
                  <div className="font-bold text-lg whitespace-nowrap">
                    Double-Click
                  </div>
                  <div className="font-bold text-lg whitespace-nowrap">
                    to Install
                  </div>
                  <div className="w-8 h-1 bg-white mt-2 rounded-full relative">
                     <div className="absolute right-0 top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-[6px] border-t-transparent border-b-transparent border-l-white"></div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* App Details View */}`;

code = code.replace('{/* App Details View */}', confirmModalUI);

fs.writeFileSync('src/App.tsx', code);
