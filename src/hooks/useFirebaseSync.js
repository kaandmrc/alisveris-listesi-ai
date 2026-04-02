import { useState, useEffect } from 'react';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import { db, listsRef, apiKeyRef } from '../services/firebase';

export function useFirebaseSync() {
  const [state, setState] = useState({
    lists: [],
    activeListId: null,
    apiKey: '',
    loading: true
  });

  useEffect(() => {
    // Sync API Key
    const unsubscribeApi = onValue(apiKeyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setState(prev => ({ ...prev, apiKey: data }));
    });

    // Sync Lists
    const unsubscribeLists = onValue(listsRef, (snapshot) => {
      const data = snapshot.val();
      let updatedLists = [];
      if (data) {
        updatedLists = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          items: data[key].items ? Object.keys(data[key].items).map(iKey => ({
            id: iKey,
            ...data[key].items[iKey]
          })) : []
        }));
      }

      setState(prev => {
        const nextActiveId = (!prev.activeListId || !updatedLists.find(l => l.id === prev.activeListId))
          ? (updatedLists.length > 0 ? updatedLists[0].id : null)
          : prev.activeListId;

        return {
          ...prev,
          lists: updatedLists,
          activeListId: nextActiveId,
          loading: false
        };
      });
    });

    return () => {
      unsubscribeApi();
      unsubscribeLists();
    };
  }, []);

  // --- CRUD Actions ---
  const actions = {
    setActiveList: (id) => setState(prev => ({ ...prev, activeListId: id })),
    
    addList: (title) => {
      const newListRef = push(listsRef);
      set(newListRef, { title, items: {} });
      setState(prev => ({ ...prev, activeListId: newListRef.key }));
    },

    deleteList: (id) => {
      if (window.confirm('Bu listeyi silmek istediğinize emin misiniz?')) {
        remove(ref(db, `shopping_lists/${id}`));
      }
    },

    updateListTitle: (id, title) => {
      update(ref(db, `shopping_lists/${id}`), { title: title.trim() });
    },

    addItem: (listId, item) => {
      const itemsRef = ref(db, `shopping_lists/${listId}/items`);
      const newItemRef = push(itemsRef);
      set(newItemRef, { ...item, done: false });
    },

    toggleItem: (listId, itemId, currentDone) => {
      update(ref(db, `shopping_lists/${listId}/items/${itemId}`), { done: !currentDone });
    },

    deleteItem: (listId, itemId) => {
      remove(ref(db, `shopping_lists/${listId}/items/${itemId}`));
    },

    updateItem: (listId, itemId, field, value) => {
      update(ref(db, `shopping_lists/${listId}/items/${itemId}`), { [field]: value });
    },

    saveApiKey: (key) => {
      set(apiKeyRef, key);
    }
  };

  return { ...state, ...actions };
}
