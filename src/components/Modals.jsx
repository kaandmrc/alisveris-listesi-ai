import React, { useState, useEffect } from 'react';

// 1. New List Modal
export const NewListModal = ({ isOpen, onClose, onConfirm }) => {
  const [title, setTitle] = useState('Alışveriş Listem');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm grid place-items-center z-50 p-4">
      <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-sm shadow-2xl border border-zinc-100">
        <h3 className="text-xl font-bold tracking-tight mb-4">Yeni Liste Oluştur</h3>
        <input 
          type="text" 
          placeholder="Liste ismini yazın..." 
          className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg mb-6 focus:border-zinc-900 outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && onConfirm(title)}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-zinc-500 font-bold hover:bg-zinc-100 rounded-lg transition-colors">İptal</button>
          <button onClick={() => onConfirm(title)} className="px-5 py-2 bg-zinc-900 text-white font-bold rounded-lg hover:opacity-90">Kaydet</button>
        </div>
      </div>
    </div>
  );
};

// 2. Settings Modal
export const SettingsModal = ({ isOpen, onClose, onSave, currentApiKey }) => {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  useEffect(() => setApiKey(currentApiKey), [currentApiKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm grid place-items-center z-50 p-4">
      <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-sm shadow-2xl border border-zinc-100">
        <h3 className="text-xl font-bold tracking-tight mb-6">Ayarlar</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1">Gemini API Anahtarı</label>
            <input 
              type="password" 
              className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg outline-none focus:border-zinc-900 text-sm"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-[9px] text-zinc-400 mt-2 italic font-medium">* Bu anahtar tüm kullanıcılar için ortaktır ve bulut üzerinde senkronize edilir.</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-8">
          <button onClick={onClose} className="px-4 py-2 text-zinc-500 font-bold hover:bg-zinc-100 rounded-lg">Kapat</button>
          <button onClick={() => onSave(apiKey)} className="px-5 py-2 bg-zinc-900 text-white font-bold rounded-lg">Kaydet</button>
        </div>
      </div>
    </div>
  );
};

// 3. AI Review Modal
export const AiReviewModal = ({ isOpen, items, status, detail, onToggleSelection, onUpdateItem, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const isLoading = status !== 'Analiz Tamamlandı!';

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md grid place-items-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-3xl overflow-hidden border border-zinc-100">
        <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <div>
            <h3 className="text-lg font-black tracking-tight">Tarama Sonuçları</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Ürünleri kontrol edin</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 border-4 border-zinc-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest text-center px-4">{status}</span>
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest ai-pulse italic">{detail}</span>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="p-4 bg-zinc-50 rounded-2xl mb-3 border border-zinc-100 group hover:border-zinc-900 transition-all shadow-sm">
                <div className="flex items-start gap-4">
                  <input 
                    type="checkbox" 
                    checked={item.selected} 
                    className="w-5 h-5 mt-1 accent-zinc-900 rounded-lg cursor-pointer" 
                    onChange={(e) => onToggleSelection(index, e.target.checked)}
                  />
                  <div className="flex-1 flex flex-col gap-2">
                    <input 
                      type="text" 
                      value={item.title} 
                      className="w-full bg-transparent text-base font-bold border-none outline-none" 
                      onChange={(e) => onUpdateItem(index, 'title', e.target.value)}
                    />
                    <div className="flex gap-4">
                      <div className="flex-1 border-b border-zinc-200 py-1">
                        <span className="block text-[8px] font-black uppercase text-zinc-400">Miktar</span>
                        <input type="text" value={item.qty || ''} className="w-full bg-transparent text-xs italic outline-none" onChange={(e) => onUpdateItem(index, 'qty', e.target.value)} />
                      </div>
                      <div className="flex-1 border-b border-zinc-200 py-1">
                        <span className="block text-[8px] font-black uppercase text-zinc-400">Marka</span>
                        <input type="text" value={item.brand || ''} className="w-full bg-transparent text-[10px] font-bold uppercase outline-none" onChange={(e) => onUpdateItem(index, 'brand', e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!isLoading && (
          <div className="p-5 bg-zinc-50/80 border-t border-zinc-100 flex justify-between gap-3">
            <button onClick={onCancel} className="px-6 py-2.5 text-sm font-bold text-zinc-500 hover:text-zinc-900">İptal</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 bg-zinc-900 text-white text-sm font-extrabold rounded-2xl shadow-lg">Onayla ve Ekle</button>
          </div>
        )}
      </div>
    </div>
  );
};
