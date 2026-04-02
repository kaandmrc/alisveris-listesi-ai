import React from 'react';

const MainArea = ({ 
  activeList, 
  onToggleSidebar, 
  onImageUpload, 
  onDeleteList,
  onUpdateTitle,
  children
}) => {
  const totalCount = activeList?.items?.length || 0;
  const purchasedCount = activeList?.items?.filter(i => i.done).length || 0;
  const counterText = activeList ? `${purchasedCount}/${totalCount}` : '--';

  return (
    <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <button className="p-2 -ml-2 text-zinc-900" onClick={onToggleSidebar}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div id="mobile-title" className="text-sm font-extrabold tracking-tight truncate flex-1 px-4 text-center">
          {activeList ? activeList.title : 'Alışveriş Listesi'}
        </div>
        
        <div className="flex items-center gap-1">
          <button onClick={onImageUpload} className="p-2 text-zinc-900" title="Fotoğraf Tara">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          </button>
          <div className="text-[10px] font-black tabular-nums bg-zinc-900 text-white px-2 py-1 rounded-md">
            {counterText}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6 max-w-4xl mx-auto w-full flex flex-col pt-4 md:pt-6">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-end mb-4 border-b-2 border-zinc-900 pb-1">
          <h2 
            className="text-2xl font-extrabold tracking-tighter outline-none focus:bg-zinc-50 rounded flex-1" 
            contentEditable={!!activeList}
            suppressContentEditableWarning={true}
            onBlur={(e) => activeList && onUpdateTitle(activeList.id, e.target.textContent)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.target.blur())}
          >
            {activeList ? activeList.title : 'Seçili liste yok'}
          </h2>
          <div className="flex items-center gap-1.5 h-8">
            <button 
              onClick={onImageUpload} 
              className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all" 
              title="Fotoğraf Tara"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            </button>
            <span className="text-2xl text-zinc-200 font-black tracking-tighter tabular-nums px-2 border-l border-zinc-100 h-full flex items-center">
              {counterText}
            </span>
            {activeList && (
              <button 
                onClick={onDeleteList}
                className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" 
                title="Listeyi Sil"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Children (Form and List) */}
        <div style={{ opacity: activeList ? 1 : 0.3, pointerEvents: activeList ? 'auto' : 'none' }}>
           {children}
        </div>
      </div>
    </main>
  );
};

export default MainArea;
