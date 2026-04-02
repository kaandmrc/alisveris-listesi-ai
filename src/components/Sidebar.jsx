import React from 'react';

const Sidebar = ({ 
  lists, 
  activeListId, 
  setActiveList, 
  deleteList, 
  onAddList, 
  onOpenSettings,
  isMobileVisible,
  toggleSidebar,
  searchTerm,
  setSearchTerm
}) => {
  return (
    <>
      {/* Sidebar Backdrop (Mobile Only) */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden ${isMobileVisible ? '' : 'hidden'}`} 
        onClick={toggleSidebar}
      ></div>

      <aside 
        id="sidebar" 
        className={`fixed md:relative inset-y-0 left-0 w-72 bg-zinc-50 border-r border-zinc-200 flex flex-col p-5 z-40 shadow-2xl md:shadow-none transition-transform duration-300 ${isMobileVisible ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight">Listelerim</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onAddList}
              className="bg-zinc-900 text-white w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
              title="Yeni Liste Ekle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <button className="md:hidden p-1 text-zinc-400" onClick={toggleSidebar}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <div className="mb-4">
          <input 
            type="text" 
            placeholder="Liste ara..." 
            className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs outline-none focus:border-zinc-900 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar space-y-0.5">
          {lists.filter(l => (l.title || '').toLowerCase().includes(searchTerm.toLowerCase())).map(list => (
            <div 
              key={list.id} 
              className={`group relative w-full flex items-center transition-all ${activeListId === list.id ? 'bg-white shadow-sm rounded-lg border border-zinc-200' : 'hover:bg-zinc-100 rounded-lg'}`}
            >
              <button 
                className={`flex-1 text-left px-4 py-2.5 text-xs font-semibold ${activeListId === list.id ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-600'}`}
                onClick={() => { setActiveList(list.id); if (window.innerWidth < 768) toggleSidebar(); }}
              >
                {list.title || 'İsimsiz Liste'}
              </button>
              <button 
                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-300 hover:text-red-500 transition-all"
                onClick={(e) => { e.stopPropagation(); deleteList(list.id); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          ))}
        </nav>
        
        <div className="mt-4 pt-4 border-t border-zinc-200">
          <button 
            onClick={onOpenSettings}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 text-xs font-bold transition-colors w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Ayarlar
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
