import React, { useState, useRef } from 'react';
import { useFirebaseSync } from './hooks/useFirebaseSync';
import { useAiScan } from './hooks/useAiScan';
import Sidebar from './components/Sidebar';
import MainArea from './components/MainArea';
import ShoppingList from './components/ShoppingList';
import { NewListModal, SettingsModal, AiReviewModal } from './components/Modals';

function App() {
  const { 
    lists, activeListId, apiKey, loading, 
    setActiveList, addList, deleteList, updateListTitle,
    addItem, toggleItem, deleteItem, updateItem, saveApiKey 
  } = useFirebaseSync();

  const {
    isScanning, scanStatus, scanDetail, scanResults, setScanResults,
    handleScan, resetScan
  } = useAiScan(apiKey);

  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const fileInputRef = useRef(null);
  const activeList = lists.find(l => l.id === activeListId);

  const handleAddListConfirm = (title) => {
    if (title.trim()) {
      addList(title.trim());
      setIsNewListModalOpen(false);
    }
  };

  const handleSettingsSave = (key) => {
    saveApiKey(key);
    setIsSettingsModalOpen(false);
  };

  const handleAiConfirm = () => {
    scanResults.filter(i => i.selected).forEach(item => {
      addItem(activeListId, { title: item.title, qty: item.qty, brand: item.brand });
    });
    resetScan();
  };

  if (loading) {
    return (
      <div className="h-screen w-screen grid place-items-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin"></div>
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen relative font-sans antialiased text-zinc-900 bg-white overflow-hidden">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => e.target.files[0] && handleScan(e.target.files[0])} 
        className="hidden" 
        accept="image/*" 
      />

      <Sidebar 
        lists={lists}
        activeListId={activeListId}
        setActiveList={setActiveList}
        deleteList={deleteList}
        onAddList={() => setIsNewListModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isMobileVisible={isSidebarVisible}
        toggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <MainArea 
        activeList={activeList}
        onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
        onImageUpload={() => fileInputRef.current.click()}
        onDeleteList={() => deleteList(activeListId)}
        onUpdateTitle={(id, title) => updateListTitle(id, title)}
      >
        {activeList && (
          <ShoppingList 
            items={activeList.items}
            onAddItem={(item) => addItem(activeListId, item)}
            onToggleItem={(itemId, done) => toggleItem(activeListId, itemId, done)}
            onDeleteItem={(itemId) => deleteItem(activeListId, itemId)}
            onUpdateItem={(itemId, field, value) => updateItem(activeListId, itemId, field, value)}
          />
        )}
      </MainArea>

      <NewListModal 
        isOpen={isNewListModalOpen}
        onClose={() => setIsNewListModalOpen(false)}
        onConfirm={handleAddListConfirm}
      />

      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleSettingsSave}
        currentApiKey={apiKey}
      />

      <AiReviewModal 
        isOpen={isScanning || scanResults.length > 0}
        items={scanResults}
        status={scanStatus}
        detail={scanDetail}
        onToggleSelection={(index, val) => {
          const next = [...scanResults];
          next[index].selected = val;
          setScanResults(next);
        }}
        onUpdateItem={(index, field, value) => {
          const next = [...scanResults];
          next[index][field] = value;
          setScanResults(next);
        }}
        onConfirm={handleAiConfirm}
        onCancel={resetScan}
      />
    </div>
  );
}

export default App;
