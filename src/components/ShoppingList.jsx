import React, { useState } from 'react';

const ShoppingList = ({ items, onAddItem, onToggleItem, onDeleteItem, onUpdateItem }) => {
  const [formData, setFormData] = useState({ title: '', qty: '', brand: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onAddItem(formData);
    setFormData({ title: '', qty: '', brand: '' });
  };

  const sortedItems = [...items].sort((a, b) => a.done - b.done);

  return (
    <div className="flex flex-col gap-6">
      <section className="mb-6 sticky top-0 z-10 md:static bg-white/95 backdrop-blur-sm -mx-4 px-4 py-2 md:m-0 md:p-0 md:bg-transparent">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex gap-1.5 items-center bg-zinc-50/50 p-1 rounded-xl border border-zinc-100 shadow-sm">
            <input 
              type="text" 
              placeholder="Ürün adını yazın..." 
              required 
              className="flex-1 px-3 py-2 text-sm bg-transparent outline-none font-semibold text-zinc-900 border-r border-zinc-200"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
            <input 
              type="text" 
              placeholder="Miktar" 
              className="w-16 px-2 py-2 text-xs bg-transparent outline-none italic text-zinc-500 border-r border-zinc-200"
              value={formData.qty}
              onChange={(e) => setFormData(prev => ({ ...prev, qty: e.target.value }))}
            />
            <input 
              type="text" 
              placeholder="Marka" 
              className="w-16 px-2 py-2 text-[10px] bg-transparent outline-none font-bold uppercase tracking-tighter text-zinc-400"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
            />
            
            <div className="flex gap-1 items-center pl-1">
              <button type="submit" className="bg-zinc-900 text-white p-2 rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="flex-1 relative min-h-[400px]">
        <div className="absolute inset-0 empty-lines-bg pointer-events-none opacity-40"></div>
        <ul className="relative z-10">
          {sortedItems.map((item) => (
            <li 
              key={item.id} 
              className={`grid grid-cols-[35px_1fr_60px_60px_40px] md:grid-cols-[35px_1fr_100px_100px_40px] items-center h-[52px] py-1 border-b border-zinc-100 transition-all group ${item.done ? 'opacity-40' : ''}`}
            >
              <div className="flex items-center justify-center">
                <div 
                  className={`w-5 h-5 md:w-4 md:h-4 rounded-full border flex items-center justify-center cursor-pointer transition-all ${item.done ? 'bg-zinc-900 border-zinc-900 shadow-inner' : 'border-zinc-300 bg-white hover:border-zinc-600'}`}
                  onClick={() => onToggleItem(item.id, item.done)}
                >
                  {item.done && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  )}
                </div>
              </div>
              <div 
                className={`px-2 text-sm font-semibold tracking-tight text-zinc-900 outline-none truncate ${item.done ? 'line-through' : ''}`} 
                contentEditable={!item.done}
                suppressContentEditableWarning={true}
                onBlur={(e) => onUpdateItem(item.id, 'title', e.target.textContent)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.target.blur())}
              >
                {item.title}
              </div>
              <div 
                className="px-1 text-[10px] text-zinc-500 font-medium italic outline-none truncate" 
                contentEditable={!item.done}
                suppressContentEditableWarning={true}
                onBlur={(e) => onUpdateItem(item.id, 'qty', e.target.textContent)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.target.blur())}
              >
                {item.qty || ''}
              </div>
              <div 
                className="px-1 text-[9px] text-zinc-400 font-bold uppercase tracking-tighter outline-none truncate" 
                contentEditable={!item.done}
                suppressContentEditableWarning={true}
                onBlur={(e) => onUpdateItem(item.id, 'brand', e.target.textContent)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.target.blur())}
              >
                {item.brand || ''}
              </div>
              <div className="flex justify-end pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  className="p-1.5 text-zinc-300 hover:text-red-500 transition-all"
                  onClick={() => onDeleteItem(item.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ShoppingList;
