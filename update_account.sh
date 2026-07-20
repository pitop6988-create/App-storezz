#!/bin/bash
cat << 'INNER_EOF' > account_modal.tsx
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

  const myApps = apps.filter((a: any) => downloadedApps.has(a.id) || purchaseLibrary.has(a.id));
  const filteredApps = myApps.filter((a: any) => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (showApps) {
    return (
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute inset-0 bg-[#F2F2F7] z-[60] flex flex-col"
      >
        <div className="pt-12 pb-4 px-4 flex items-center justify-between bg-white border-b border-gray-100">
          <button onClick={() => setShowApps(false)} className="w-8 h-8 flex items-center justify-center text-black">
            <ChevronLeft size={28} className="-ml-1" />
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
INNER_EOF

# Replace the existing AccountModal
awk '
  /^function AccountModal/ { skip=1; print "#INCLUDE_MODAL#"; next }
  /^function AdminPage/ { skip=0 }
  !skip { print $0 }
' src/App.tsx > src/App_temp.tsx

awk '
  /#INCLUDE_MODAL#/ {
    system("cat account_modal.tsx")
    next
  }
  { print $0 }
' src/App_temp.tsx > src/App.tsx

rm account_modal.tsx src/App_temp.tsx
