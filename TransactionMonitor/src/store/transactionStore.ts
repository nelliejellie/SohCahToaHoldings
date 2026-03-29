import { create } from 'zustand';
import { Transaction, MockAPI } from '../services/api';
import { apiClient } from '../services/apiClient';

interface TransactionState {
  // Data State
  transactions: Transaction[];
  loading: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  
  // UI State
  activeFilter: string;
  searchQuery: string;
  debouncedSearch: string;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setDebouncedSearch: (query: string) => void;
  setActiveFilter: (filter: string) => void;
  
  // API Calls (Business Logic Layer)
  fetchTransactions: (page?: number, isRefresh?: boolean) => Promise<void>;
  updateTransactionOptimistic: (id: string, updates: Partial<Transaction>) => Promise<void>;
  
  // Advanced Event Strategy
  startEventStream: () => void;
  stopEventStream: () => void;
}

// Persist the interval identifier securely out of React component lifecycle
let streamInterval: NodeJS.Timeout | null = null;

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: true,
  loadingMore: false,
  refreshing: false,
  error: null,
  page: 1,
  hasMore: true,
  activeFilter: 'All',
  searchQuery: '',
  debouncedSearch: '',

  setSearchQuery: (query) => set({ searchQuery: query }),
  setDebouncedSearch: (query) => set({ debouncedSearch: query }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),

  fetchTransactions: async (pageNum = 1, isRefresh = false) => {
    const state = get();
    if (isRefresh) set({ refreshing: true });
    else if (pageNum === 1) set({ loading: true });
    else set({ loadingMore: true });

    set({ error: null });

    try {
      const res = await apiClient.request(`GET /transactions?page=${pageNum}&filter=${state.activeFilter}`, () => 
        MockAPI.getTransactions(pageNum, 10, state.activeFilter, state.debouncedSearch)
      );
      
      set((prev) => {
        if (pageNum === 1) return { transactions: res.data, page: pageNum, hasMore: res.hasMore };
        
        // Ensure absolutely no strictly duplicate boundaries bypass pagination
        const existingIds = new Set(prev.transactions.map(t => t.id));
        const nonDuplicates = res.data.filter(t => !existingIds.has(t.id));
        
        return { 
          transactions: [...prev.transactions, ...nonDuplicates], 
          page: pageNum, 
          hasMore: res.hasMore 
        };
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to securely load transactions' });
    } finally {
      set({ loading: false, refreshing: false, loadingMore: false });
    }
  },

  updateTransactionOptimistic: async (id, updates) => {
    const { transactions } = get();
    const targetIdx = transactions.findIndex(t => t.id === id);
    if (targetIdx === -1) return;
    
    // Backup memory parameters instantly for potential rollback
    const previousState = { ...transactions[targetIdx] };
    const optimisticState = { ...previousState, ...updates };

    // Push local state mutation eagerly
    set(state => {
      const newTx = [...state.transactions];
      newTx[targetIdx] = optimisticState;
      return { transactions: newTx };
    });

    try {
      await apiClient.request(`PUT /transaction/${id}`, () => MockAPI.updateTransaction(id, updates));
    } catch (err: any) {
      // Strict Rollback on Network Rejection
      set(state => {
        const rollbackTx = [...state.transactions];
        const rtIdx = rollbackTx.findIndex(t => t.id === id);
        if (rtIdx > -1) rollbackTx[rtIdx] = previousState;
        return { transactions: rollbackTx };
      });
      throw err; // Propagate the error so UI throws specific Alert models
    }
  },

  startEventStream: () => {
    if (streamInterval) clearInterval(streamInterval);
    
    streamInterval = setInterval(() => {
      // Direct access circumvents React component stale enclosures
      const currentTx = get().transactions;
      if (currentTx.length === 0) return;

      const rand = Math.random();
      let map = new Map(currentTx.map(t => [t.id, t]));
      let modified = false;

      if (rand < 0.33) {
          const keys = Array.from(map.keys());
          const targetId = keys[Math.floor(Math.random() * keys.length)];
          const target = map.get(targetId)!;       
          const statuses: Transaction['status'][] = ['success', 'failed', 'processing', 'pending'];
          const newStatus = statuses.filter(s => s !== target.status)[Math.floor(Math.random() * 3)];
          
          const modifiedTx = { ...target, status: newStatus };
          map.set(targetId, modifiedTx);
          MockAPI.injectMockEvent(modifiedTx);
          modified = true;
          
      } else if (rand < 0.66) {
          const newId = `tx_stream_${Date.now()}`;
          if (!map.has(newId)) {
            const newTx: Transaction = {
              id: newId,
              reference: `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              amount: parseFloat((Math.random() * 5000 + 10).toFixed(2)) * (Math.random() > 0.5 ? 1 : -1),
              currency: 'USD',
              status: 'pending',
              createdAt: new Date().toISOString(),
              deviceInfo: `iPhone ${Math.floor(Math.random() * 5) + 11} / iOS ${Math.floor(Math.random() * 3) + 15}`,
              ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
              notes: '',
              isFlagged: false
            };
            MockAPI.injectMockEvent(newTx);
            set({ transactions: [newTx, ...currentTx] });
            return;
          }
      } else {
          const existing = Array.from(map.values());
          const dupTarget = existing[Math.floor(Math.random() * Math.min(5, existing.length))];
          const dupModified = { ...dupTarget };
          map.set(dupTarget.id, dupModified);
          MockAPI.injectMockEvent(dupModified);
          modified = true;
      }

      if (modified) {
        set({ transactions: Array.from(map.values()) });
      }
    }, 6000);
  },

  stopEventStream: () => {
    if (streamInterval) clearInterval(streamInterval);
    streamInterval = null;
  }
}));
