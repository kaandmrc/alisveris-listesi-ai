import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set, update, push, remove, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyBeULgND52D3BAdP7Y-ERBmnRL7r2-BHjs",
  authDomain: "personal-shop-app.firebaseapp.com",
  databaseURL: "https://personal-shop-app-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "personal-shop-app",
  storageBucket: "personal-shop-app.firebasestorage.app",
  messagingSenderId: "307669679279",
  appId: "1:307669679279:web:7597f15822049ceabf685a",
  measurementId: "G-L678PQB11W"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const listsRef = ref(db, 'shopping_lists');
const apiKeyRef = ref(db, 'api_key');

// --- State Management ---
let state = {
    activeListId: null,
    lists: [],
    apiKey: ''
};

function saveApiKey(key) {
    state.apiKey = key;
    set(apiKeyRef, key);
}

// --- DOM Elements ---
const syncIndicator = document.getElementById('sync-indicator');
const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');
const listsNav = document.getElementById('lists-nav');
const itemsList = document.getElementById('items-list');
const activeListTitle = document.getElementById('active-list-title');
const mobileTitle = document.getElementById('mobile-title');
const mobileCounter = document.getElementById('mobile-counter');
const listStatusCounter = document.getElementById('list-status-counter');
const addListBtn = document.getElementById('add-list-btn');
const listSearchInput = document.getElementById('list-search');
const addItemForm = document.getElementById('add-item-form');
const deleteListBtn = document.getElementById('delete-active-list-btn');

// Modal Elements
const modalOverlay = document.getElementById('modal-container');
const modalInput = document.getElementById('modal-input');
const modalCancel = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');

// Settings Modal
const settingsModal = document.getElementById('settings-modal');
const openSettingsBtn = document.getElementById('open-settings-btn');
const apiKeyInput = document.getElementById('api-key-input');
const settingsSaveBtn = document.getElementById('settings-save');
const settingsCancelBtn = document.getElementById('settings-cancel');

// AI Review Modal
const aiReviewModal = document.getElementById('ai-review-modal');
const aiReviewContent = document.getElementById('ai-review-content');
const aiReviewConfirmBtn = document.getElementById('ai-review-confirm');
const aiReviewCancelBtn = document.getElementById('ai-review-cancel');
const imageUploadInput = document.getElementById('image-upload');
const loadingState = document.getElementById('loading-state');
const aiModalFooter = document.getElementById('ai-modal-footer');
const aiLoadingStatus = document.getElementById('ai-loading-status');
const aiLoadingDetail = document.getElementById('ai-loading-detail');

// --- Mobile Navigation ---
window.toggleSidebar = () => {
    sidebar.classList.toggle('hidden-mobile');
    sidebar.classList.toggle('visible-mobile');
    sidebarBackdrop.classList.toggle('hidden');
};

// --- Firebase Sync ---
async function initializeData() {
    onValue(apiKeyRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            state.apiKey = data;
            if (apiKeyInput) apiKeyInput.value = data;
        }
    });

    onValue(listsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            state.lists = Object.keys(data).map(key => ({
                id: key,
                ...data[key],
                items: data[key].items ? Object.keys(data[key].items).map(iKey => ({
                    id: iKey,
                    ...data[key].items[iKey]
                })) : []
            }));
            
            // If active list was deleted or none selected, pick the first one
            if (!state.activeListId || !state.lists.find(l => l.id === state.activeListId)) {
                state.activeListId = state.lists.length > 0 ? state.lists[0].id : null;
            }
            
            syncIndicator.style.opacity = '1';
            renderLists();
            renderItems();
        } else {
            state.lists = [];
            state.activeListId = null;
            syncIndicator.style.opacity = '1';
            renderLists();
            renderItems();
            migrateFromLocalStorage();
        }
    });
}

function migrateFromLocalStorage() {
    const localData = localStorage.getItem('shopping_lists');
    if (localData) {
        const parsed = JSON.parse(localData);
        if (parsed.length > 0) {
            parsed.forEach(list => {
                const newListRef = push(listsRef);
                const listData = { title: list.title, items: {} };
                if (list.items) {
                    list.items.forEach(item => {
                        const itemKey = Date.now() + Math.random().toString(36).substr(2, 5);
                        listData.items[itemKey] = {
                            title: item.title, qty: item.qty || '', brand: item.brand || '', done: item.done || false
                        };
                    });
                }
                set(newListRef, listData);
            });
            localStorage.removeItem('shopping_lists');
        }
    }
}

// --- Image Compression (TURBO v2.0 - WebP & 900px) ---
async function compressImage(file, maxWidth = 900) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(img.src);
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/webp', 0.6).split(',')[1]);
        };
    });
}

// --- Render Functions ---
function renderLists() {
    const searchTerm = listSearchInput.value.toLowerCase();
    listsNav.innerHTML = '';
    state.lists.filter(list => (list.title || '').toLowerCase().includes(searchTerm)).forEach(list => {
        const container = document.createElement('div');
        const isActive = state.activeListId === list.id;
        container.className = `group relative w-full flex items-center transition-all ${isActive ? 'bg-white shadow-sm rounded-lg border border-zinc-200' : 'hover:bg-zinc-100 rounded-lg'}`;
        const btn = document.createElement('button');
        btn.className = `flex-1 text-left px-4 py-2.5 text-xs font-semibold ${isActive ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-600'}`;
        btn.textContent = list.title || 'İsimsiz Liste';
        btn.onclick = () => { state.activeListId = list.id; renderLists(); renderItems(); if (window.innerWidth < 768) window.toggleSidebar(); };
        const deleteIcon = document.createElement('button');
        deleteIcon.className = `opacity-0 group-hover:opacity-100 p-2 text-zinc-300 hover:text-red-500 transition-all`;
        deleteIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
        deleteIcon.onclick = (e) => { e.stopPropagation(); deleteListById(list.id); };
        container.appendChild(btn);
        container.appendChild(deleteIcon);
        listsNav.appendChild(container);
    });
}

function renderItems() {
    const activeList = state.lists.find(l => l.id === state.activeListId);
    if (!activeList) {
        itemsList.innerHTML = ''; activeListTitle.textContent = 'Seçili liste yok'; mobileTitle.textContent = 'Alışveriş Listesi'; mobileCounter.textContent = '--'; listStatusCounter.textContent = '--'; addItemForm.parentElement.style.opacity = '0.3'; addItemForm.parentElement.style.pointerEvents = 'none'; deleteListBtn.style.display = 'none';
        return;
    }
    addItemForm.parentElement.style.opacity = '1'; addItemForm.parentElement.style.pointerEvents = 'auto'; activeListTitle.textContent = activeList.title; mobileTitle.textContent = activeList.title; deleteListBtn.style.display = 'block';
    const totalCount = activeList.items.length;
    const purchasedCount = activeList.items.filter(i => i.done).length;
    const counterText = totalCount > 0 ? `${purchasedCount}/${totalCount}` : '0/0';
    listStatusCounter.textContent = counterText; mobileCounter.textContent = counterText;
    const sortedItems = [...activeList.items].sort((a, b) => a.done - b.done);
    itemsList.innerHTML = '';
    sortedItems.forEach((item) => {
        const li = document.createElement('li');
        li.className = `grid grid-cols-[35px_1fr_60px_60px_40px] md:grid-cols-[35px_1fr_100px_100px_40px] items-center h-[52px] py-1 border-b border-zinc-100 transition-all group ${item.done ? 'opacity-40' : ''}`;
        li.dataset.id = item.id;
        li.innerHTML = `
            <div class="flex items-center justify-center"><div class="w-5 h-5 md:w-4 md:h-4 rounded-full border flex items-center justify-center cursor-pointer transition-all ${item.done ? 'bg-zinc-900 border-zinc-900 shadow-inner' : 'border-zinc-300 bg-white hover:border-zinc-600'}" onclick="toggleItem('${item.id}', event)">${item.done ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}</div></div>
            <div class="px-2 text-sm font-semibold tracking-tight text-zinc-900 outline-none truncate ${item.done ? 'line-through' : ''}" contenteditable="true" onblur="updateItemValue('${item.id}', 'title', this.textContent)">${item.title}</div>
            <div class="px-1 text-[10px] text-zinc-500 font-medium italic outline-none truncate" contenteditable="true" onblur="updateItemValue('${item.id}', 'qty', this.textContent)">${item.qty || ''}</div>
            <div class="px-1 text-[9px] text-zinc-400 font-bold uppercase tracking-tighter outline-none truncate" contenteditable="true" onblur="updateItemValue('${item.id}', 'brand', this.textContent)">${item.brand || ''}</div>
            <div class="flex justify-end pr-1 opacity-0 group-hover:opacity-100 transition-opacity"><button class="p-1.5 text-zinc-300 hover:text-red-500 transition-all" onclick="deleteItem('${item.id}')"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button></div>`;
        itemsList.appendChild(li);
    });
}

// --- AI Review Render ---
let tempAiItems = [];
function renderAiReview(items) {
    tempAiItems = items; aiReviewContent.innerHTML = '';
    items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = "p-4 bg-zinc-50 rounded-2xl mb-3 border border-zinc-100 group hover:border-zinc-900 transition-all shadow-sm";
        itemDiv.innerHTML = `
            <div class="flex items-start gap-4">
                <input type="checkbox" ${item.selected ? 'checked' : ''} class="w-5 h-5 mt-1 accent-zinc-900 rounded-lg cursor-pointer" onchange="toggleAiItemSelection(${index}, this.checked)">
                <div class="flex-1 flex flex-col gap-2">
                    <input type="text" value="${item.title}" class="w-full bg-transparent text-base font-bold border-none outline-none" onchange="updateAiItem(${index}, 'title', this.value)">
                    <div class="flex gap-4">
                        <div class="flex-1 border-b border-zinc-200 py-1"><span class="block text-[8px] font-black uppercase text-zinc-400">Miktar</span><input type="text" value="${item.qty || ''}" class="w-full bg-transparent text-xs italic outline-none" onchange="updateAiItem(${index}, 'qty', this.value)"></div>
                        <div class="flex-1 border-b border-zinc-200 py-1"><span class="block text-[8px] font-black uppercase text-zinc-400">Marka</span><input type="text" value="${item.brand || ''}" class="w-full bg-transparent text-[10px] font-bold uppercase outline-none" onchange="updateAiItem(${index}, 'brand', this.value)"></div>
                    </div>
                </div>
            </div>`;
        aiReviewContent.appendChild(itemDiv);
    });
}

// Global functions
window.toggleAiItemSelection = (index, isChecked) => tempAiItems[index].selected = isChecked;
window.updateAiItem = (index, field, value) => tempAiItems[index][field] = value;
window.toggleItem = (itemId, event) => {
    event.stopPropagation();
    const itemRef = ref(db, `shopping_lists/${state.activeListId}/items/${itemId}`);
    const activeList = state.lists.find(l => l.id === state.activeListId);
    if (!activeList) return;
    const item = activeList.items.find(i => i.id === itemId);
    if (item) update(itemRef, { done: !item.done });
};
window.deleteItem = (itemId) => remove(ref(db, `shopping_lists/${state.activeListId}/items/${itemId}`));
window.updateItemValue = (itemId, field, value) => update(ref(db, `shopping_lists/${state.activeListId}/items/${itemId}`), { [field]: value });

// --- AI Action (SMART TURBO v3.0 - SEQUENTIAL + NATIVE JSON) ---
const MODEL_FALLBACKS = ['gemini-flash-latest', 'gemini-1.5-flash-8b'];

async function handleAiScan(file) {
    if (!state.apiKey) return alert("API anahtarı bulunamadı.");
    aiReviewModal.classList.remove('hidden');
    loadingState.classList.remove('hidden');
    aiReviewContent.classList.add('hidden');
    aiModalFooter.style.display = 'none';
    aiReviewContent.innerHTML = '';
    
    aiLoadingStatus.textContent = "Görüntü Hazırlanıyor...";
    aiLoadingDetail.textContent = "Sıkıştırılıyor (WebP)...";

    try {
        const compressedBase64 = await compressImage(file);
        
        let success = false;
        let lastError = "";

        for (let model of MODEL_FALLBACKS) {
            aiLoadingStatus.textContent = "Buluta Gönderiliyor...";
            aiLoadingDetail.textContent = `${model.split('-').pop()} deneniyor...`;
            
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${state.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        contents: [{ 
                            parts: [
                                { text: "Analyze this image and identify all items that could be part of a shopping list. Return a JSON array of objects with 'title', 'qty', and 'brand' keys. Use Turkish for titles." },
                                { inline_data: { mime_type: 'image/webp', data: compressedBase64 } }
                            ]
                        }],
                        // Native JSON Mime Type
                        generationConfig: {
                            responseMimeType: "application/json"
                        }
                    })
                });
                
                const data = await response.json();
                if (data.error) throw new Error(data.error.message);
                
                // If it succeeds, parse and display
                aiLoadingStatus.textContent = "Analiz Tamamlandı!";
                const text = data.candidates[0].content.parts[0].text;
                // Since MimeType is application/json, the API guarantees JSON format. No markdown cleanup needed.
                const items = JSON.parse(text);
                
                loadingState.classList.add('hidden');
                aiReviewContent.classList.remove('hidden');
                aiModalFooter.style.display = 'flex';
                renderAiReview(items.map(i => ({ ...i, selected: true })));
                
                success = true;
                break; // Break the loop on success
            } catch (e) {
                console.error(`Model ${model} failed:`, e);
                lastError = e.message;
            }
        }

        if (!success) {
            throw new Error(lastError || "Tüm modeller meşgul görünüyor (Kota aşımı olabilir).");
        }

    } catch (e) {
        console.error("AI Smart Turbo Error:", e);
        loadingState.classList.add('hidden');
        aiReviewContent.classList.remove('hidden');
        aiReviewContent.innerHTML = `<div class='text-center p-10 text-red-500 font-bold text-sm'>Hata: ${e.message}</div>`;
    }
    imageUploadInput.value = '';
}

// --- CRUD Actions ---
function addList(title) { const newListRef = push(listsRef); set(newListRef, { title, items: {} }); state.activeListId = newListRef.key; }
function deleteListById(id) { if (confirm('Bu listeyi silmek istediğinize emin misiniz?')) remove(ref(db, `shopping_lists/${id}`)); }
function addItem(title, qty, brand) { const itemsRef = ref(db, `shopping_lists/${state.activeListId}/items`); push(itemsRef).then(newRef => set(newRef, { title, qty, brand, done: false })); }

// Event Listeners
if (imageUploadInput) imageUploadInput.onchange = (e) => e.target.files[0] && handleAiScan(e.target.files[0]);
if (aiReviewConfirmBtn) aiReviewConfirmBtn.onclick = () => { tempAiItems.filter(i => i.selected).forEach(i => addItem(i.title, i.qty, i.brand)); aiReviewModal.classList.add('hidden'); };
if (aiReviewCancelBtn) aiReviewCancelBtn.onclick = () => aiReviewModal.classList.add('hidden');
if (openSettingsBtn) openSettingsBtn.onclick = () => { if (apiKeyInput) apiKeyInput.value = state.apiKey; settingsModal.classList.remove('hidden'); };
if (settingsSaveBtn) settingsSaveBtn.onclick = () => { if (apiKeyInput) saveApiKey(apiKeyInput.value.trim()); settingsModal.classList.add('hidden'); };
if (settingsCancelBtn) settingsCancelBtn.onclick = () => settingsModal.classList.add('hidden');
if (addListBtn) addListBtn.onclick = () => { modalOverlay.classList.remove('hidden'); modalInput.focus(); };
if (modalCancel) modalCancel.onclick = () => { modalOverlay.classList.add('hidden'); modalInput.value = ''; };
if (modalConfirm) modalConfirm.onclick = () => { if (modalInput.value.trim()) { addList(modalInput.value.trim()); modalOverlay.classList.add('hidden'); modalInput.value = ''; } };
if (addItemForm) { addItemForm.onsubmit = (e) => { e.preventDefault(); addItem(document.getElementById('item-title').value, document.getElementById('item-quantity').value, document.getElementById('item-brand').value); addItemForm.reset(); }; }
if (deleteListBtn) deleteListBtn.onclick = () => deleteListById(state.activeListId);
if (listSearchInput) listSearchInput.oninput = renderLists;
if (activeListTitle) {
    activeListTitle.onblur = function() { if (state.activeListId) update(ref(db, `shopping_lists/${state.activeListId}`), { title: this.textContent.trim() }); };
    activeListTitle.onkeydown = (e) => e.key === 'Enter' && (e.preventDefault(), activeListTitle.blur());
}

initializeData();
