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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const listsRef = ref(db, 'shopping_lists');

// --- State Management ---
let state = {
    activeListId: null,
    lists: [],
    apiKey: localStorage.getItem('gemini_api_key') || ''
};

function saveApiKey(key) {
    state.apiKey = key;
    localStorage.setItem('gemini_api_key', key);
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

// --- Firebase Sync & Migration ---
async function initializeData() {
    // 1. Listen for real-time changes
    onValue(listsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Convert Firebase object to array of lists
            state.lists = Object.keys(data).map(key => ({
                id: key,
                ...data[key],
                items: data[key].items ? Object.keys(data[key].items).map(iKey => ({
                    id: iKey,
                    ...data[key].items[iKey]
                })) : []
            }));
            
            if (!state.activeListId && state.lists.length > 0) {
                state.activeListId = state.lists[0].id;
            }
            
            syncIndicator.style.opacity = '1';
            renderLists();
            renderItems();
        } else {
            // Firebase is empty, check for migration
            migrateFromLocalStorage();
        }
    });
}

function migrateFromLocalStorage() {
    const localData = localStorage.getItem('shopping_lists');
    if (localData) {
        const parsed = JSON.parse(localData);
        if (parsed.length > 0) {
            console.log("Migrating local data to Firebase...");
            parsed.forEach(list => {
                const newListRef = push(listsRef);
                const listData = { 
                    title: list.title, 
                    items: {} 
                };
                if (list.items) {
                    list.items.forEach(item => {
                        const itemKey = Date.now() + Math.random().toString(36).substr(2, 5);
                        listData.items[itemKey] = {
                            title: item.title,
                            qty: item.qty || '',
                            brand: item.brand || '',
                            done: item.done || false
                        };
                    });
                }
                set(newListRef, listData);
            });
            // Clear local storage after migration
            localStorage.removeItem('shopping_lists');
        }
    }
}

// --- Render Functions ---

function renderLists() {
    const searchTerm = listSearchInput.value.toLowerCase();
    listsNav.innerHTML = '';
    
    state.lists
        .filter(list => list.title.toLowerCase().includes(searchTerm))
        .forEach(list => {
            const container = document.createElement('div');
            const isActive = state.activeListId === list.id;
            
            container.className = `group relative w-full flex items-center transition-all ${
                isActive ? 'bg-white shadow-sm rounded-lg border border-zinc-200' : 'hover:bg-zinc-100 rounded-lg'
            }`;

            const btn = document.createElement('button');
            btn.className = `flex-1 text-left px-4 py-2.5 text-xs font-semibold ${
                isActive ? 'text-zinc-900' : 'text-zinc-400 group-hover:text-zinc-600'
            }`;
            btn.textContent = list.title;
            btn.onclick = () => {
                state.activeListId = list.id;
                renderLists();
                renderItems();
                if (window.innerWidth < 768) window.toggleSidebar();
            };

            const deleteIcon = document.createElement('button');
            deleteIcon.className = `opacity-0 group-hover:opacity-100 p-2 text-zinc-300 hover:text-red-500 transition-all`;
            deleteIcon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            `;
            deleteIcon.onclick = (e) => {
                e.stopPropagation();
                deleteListById(list.id);
            };

            container.appendChild(btn);
            container.appendChild(deleteIcon);
            listsNav.appendChild(container);
        });
}

function renderItems() {
    const activeList = state.lists.find(l => l.id === state.activeListId);
    if (!activeList) {
        itemsList.innerHTML = '';
        activeListTitle.textContent = 'Seçili liste yok';
        mobileTitle.textContent = 'Alışveriş Listesi';
        mobileCounter.textContent = '--';
        listStatusCounter.textContent = '--';
        addItemForm.parentElement.style.opacity = '0.3';
        addItemForm.parentElement.style.pointerEvents = 'none';
        deleteListBtn.style.display = 'none';
        return;
    }

    addItemForm.parentElement.style.opacity = '1';
    addItemForm.parentElement.style.pointerEvents = 'auto';
    activeListTitle.textContent = activeList.title;
    mobileTitle.textContent = activeList.title;
    deleteListBtn.style.display = 'block';

    const totalCount = activeList.items.length;
    const purchasedCount = activeList.items.filter(i => i.done).length;
    const counterText = totalCount > 0 ? `${purchasedCount}/${totalCount}` : '0/0';
    listStatusCounter.textContent = counterText;
    mobileCounter.textContent = counterText;

    const sortedItems = [...activeList.items].sort((a, b) => a.done - b.done);

    itemsList.innerHTML = '';
    sortedItems.forEach((item) => {
        const li = document.createElement('li');
        li.className = `grid grid-cols-[35px_1fr_60px_60px_40px] md:grid-cols-[35px_1fr_100px_100px_40px] items-center h-[52px] py-1 border-b border-zinc-100 transition-all group ${
            item.done ? 'opacity-40' : ''
        }`;
        // Note: Drag and drop would need complex handling in Firebase for arrays, keeping it simple for now
        li.dataset.id = item.id;

        li.innerHTML = `
            <div class="flex items-center justify-center">
                <div class="w-5 h-5 md:w-4 md:h-4 rounded-full border flex items-center justify-center cursor-pointer transition-all ${
                    item.done ? 'bg-zinc-900 border-zinc-900 shadow-inner' : 'border-zinc-300 bg-white hover:border-zinc-600'
                }" onclick="toggleItem('${item.id}', event)">
                    ${item.done ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
                </div>
            </div>
            <div class="px-2 text-sm font-semibold tracking-tight text-zinc-900 outline-none truncate ${item.done ? 'line-through' : ''}" 
                 contenteditable="true" onblur="updateItemValue('${item.id}', 'title', this.textContent)">${item.title}</div>
            <div class="px-1 text-[10px] text-zinc-500 font-medium italic outline-none truncate" 
                 contenteditable="true" onblur="updateItemValue('${item.id}', 'qty', this.textContent)">${item.qty || ''}</div>
            <div class="px-1 text-[9px] text-zinc-400 font-bold uppercase tracking-tighter outline-none truncate" 
                 contenteditable="true" onblur="updateItemValue('${item.id}', 'brand', this.textContent)">${item.brand || ''}</div>
            <div class="flex justify-end pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="p-1.5 text-zinc-300 hover:text-red-500 transition-all" onclick="deleteItem('${item.id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
        itemsList.appendChild(li);
    });
}

// --- AI Review Render ---
let tempAiItems = [];
function renderAiReview(items) {
    tempAiItems = items;
    aiReviewContent.innerHTML = '';
    items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = "p-4 bg-zinc-50 rounded-2xl mb-3 border border-zinc-100 group hover:border-zinc-900 transition-all shadow-sm";
        itemDiv.innerHTML = `
            <div class="flex items-start gap-4">
                <input type="checkbox" ${item.selected ? 'checked' : ''} class="w-5 h-5 mt-1 accent-zinc-900 rounded-lg cursor-pointer" onchange="toggleAiItemSelection(${index}, this.checked)">
                <div class="flex-1 flex flex-col gap-2">
                    <input type="text" value="${item.title}" class="w-full bg-transparent text-base font-bold border-none outline-none" onchange="updateAiItem(${index}, 'title', this.value)">
                    <div class="flex gap-4">
                        <div class="flex-1 border-b border-zinc-200 py-1">
                            <span class="block text-[8px] font-black uppercase text-zinc-400">Miktar</span>
                            <input type="text" value="${item.qty || ''}" class="w-full bg-transparent text-xs italic outline-none" onchange="updateAiItem(${index}, 'qty', this.value)">
                        </div>
                        <div class="flex-1 border-b border-zinc-200 py-1">
                            <span class="block text-[8px] font-black uppercase text-zinc-400">Marka</span>
                            <input type="text" value="${item.brand || ''}" class="w-full bg-transparent text-[10px] font-bold uppercase outline-none" onchange="updateAiItem(${index}, 'brand', this.value)">
                        </div>
                    </div>
                </div>
            </div>`;
        aiReviewContent.appendChild(itemDiv);
    });
}

// Global window functions for HTML
window.toggleAiItemSelection = (index, isChecked) => tempAiItems[index].selected = isChecked;
window.updateAiItem = (index, field, value) => tempAiItems[index][field] = value;
window.toggleItem = (itemId, event) => {
    event.stopPropagation();
    const itemRef = ref(db, `shopping_lists/${state.activeListId}/items/${itemId}`);
    const activeList = state.lists.find(l => l.id === state.activeListId);
    const item = activeList.items.find(i => i.id === itemId);
    update(itemRef, { done: !item.done });
};
window.deleteItem = (itemId) => {
    const itemRef = ref(db, `shopping_lists/${state.activeListId}/items/${itemId}`);
    remove(itemRef);
};
window.updateItemValue = (itemId, field, value) => {
    const itemRef = ref(db, `shopping_lists/${state.activeListId}/items/${itemId}`);
    update(itemRef, { [field]: value });
};

// --- AI Action ---
const MODEL_FALLBACKS = ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-1.5-flash-8b'];
async function handleAiScan(file) {
    if (!state.apiKey) return alert("Lütfen API anahtarınızı girin.");
    aiReviewModal.classList.remove('hidden');
    loadingState.classList.remove('hidden');
    aiReviewContent.classList.add('hidden');
    aiModalFooter.style.display = 'none';
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const base64Data = reader.result.split(',')[1];
        for (let model of MODEL_FALLBACKS) {
            aiLoadingStatus.textContent = "Analiz Ediliyor...";
            aiLoadingDetail.textContent = `Model: ${model}`;
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${state.apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [
                        { text: "Analyze as shopping list JSON array with title, qty, brand." },
                        { inline_data: { mime_type: file.type, data: base64Data } }
                    ]}] })
                });
                const data = await response.json();
                if (data.error) continue;
                const items = JSON.parse(data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim());
                loadingState.classList.add('hidden');
                aiReviewContent.classList.remove('hidden');
                aiModalFooter.style.display = 'flex';
                renderAiReview(items.map(i => ({ ...i, selected: true })));
                break;
            } catch (e) { console.error(e); }
        }
    };
}

// --- CRUD Actions ---
function addList(title) {
    const newListRef = push(listsRef);
    set(newListRef, { title: title, items: {} });
    state.activeListId = newListRef.key;
}

function deleteListById(id) {
    if (confirm('Bu listeyi silmek istediğinize emin misiniz?')) {
        const listRef = ref(db, `shopping_lists/${id}`);
        remove(listRef);
    }
}

function addItem(title, qty, brand) {
    const itemsRef = ref(db, `shopping_lists/${state.activeListId}/items`);
    const newItemRef = push(itemsRef);
    set(newItemRef, { title, qty, brand, done: false });
}

// --- Event Listeners ---
imageUploadInput.onchange = (e) => e.target.files[0] && handleAiScan(e.target.files[0]);
aiReviewConfirmBtn.onclick = () => {
    tempAiItems.filter(i => i.selected).forEach(i => addItem(i.title, i.qty, i.brand));
    aiReviewModal.classList.add('hidden');
};
aiReviewCancelBtn.onclick = () => aiReviewModal.classList.add('hidden');
openSettingsBtn.onclick = () => { apiKeyInput.value = state.apiKey; settingsModal.classList.remove('hidden'); };
settingsSaveBtn.onclick = () => { saveApiKey(apiKeyInput.value.trim()); settingsModal.classList.add('hidden'); };
settingsCancelBtn.onclick = () => settingsModal.classList.add('hidden');

addListBtn.onclick = () => { modalOverlay.classList.remove('hidden'); modalInput.focus(); };
modalCancel.onclick = () => { modalOverlay.classList.add('hidden'); modalInput.value = ''; };
modalConfirm.onclick = () => {
    if (modalInput.value.trim()) { addList(modalInput.value.trim()); modalOverlay.classList.add('hidden'); modalInput.value = ''; }
};

addItemForm.onsubmit = (e) => {
    e.preventDefault();
    addItem(document.getElementById('item-title').value, document.getElementById('item-quantity').value, document.getElementById('item-brand').value);
    addItemForm.reset();
};

deleteListBtn.onclick = () => deleteListById(state.activeListId);
listSearchInput.oninput = renderLists;
activeListTitle.onblur = function() {
    if (state.activeListId) {
        update(ref(db, `shopping_lists/${state.activeListId}`), { title: this.textContent.trim() });
    }
};
activeListTitle.onkeydown = (e) => e.key === 'Enter' && (e.preventDefault(), activeListTitle.blur());

// --- Start ---
initializeData();
