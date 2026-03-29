import db from './users.db.json';

export interface User {
  id: string;
  role: 'admin' | 'analyst';
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface Transaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  createdAt: string;
  deviceInfo: string;
  ipAddress: string;
  notes: string;
  isFlagged: boolean;
}

const ALL_TRANSACTIONS: Transaction[] = Array.from({ length: 10 }).map((_, i) => {
  const statuses: Transaction['status'][] = ['pending', 'processing', 'success', 'failed'];
  return {
    id: `tx_${i + 1}`,
    reference: `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    amount: parseFloat((Math.random() * 5000 + 10).toFixed(2)),
    currency: 'USD',
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
    deviceInfo: `iPhone ${Math.floor(Math.random() * 5) + 11} / iOS ${Math.floor(Math.random() * 3) + 15}`,
    ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    notes: '',
    isFlagged: false
  };
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const MockAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    await delay(1000);
    const userRecords = db.users;
    const foundUser = userRecords.find(u => u.email === email && u.password === password);

    if (foundUser) {
      return {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        expiresIn: 3600,
        user: { 
          id: foundUser.id, 
          role: foundUser.role as 'admin' | 'analyst', 
          email: foundUser.email 
        }
      };
    }
    throw new Error('Invalid email or password');
  },

  refreshToken: async (token: string): Promise<AuthResponse> => {
    await delay(800);
    if (!token) throw new Error('No refresh token provided');
    return {
      accessToken: 'mock-access-token-refreshed-' + Date.now(),
      refreshToken: 'mock-refresh-token-refreshed-' + Date.now(),
      expiresIn: 3600,
      user: { id: 'usr_1', role: 'admin', email: 'admin@test.com' }
    };
  },

  getTransactions: async (
    page = 1,
    limit = 5,
    status?: string,
    search?: string
  ): Promise<{ data: Transaction[], hasMore: boolean }> => {
    await delay(800);
    
    // Simulate an error for demonstration if search is 'error'
    if (search && search.toLowerCase() === 'error') {
      throw new Error('Simulated API Error. Try clearing the search.');
    }

    let filtered = [...ALL_TRANSACTIONS];

    if (status && status !== 'All') {
      filtered = filtered.filter(tx => tx.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      filtered = filtered.filter(tx => 
        tx.reference.toLowerCase().includes(search.toLowerCase())
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      hasMore: startIndex + limit < filtered.length
    };
  },

  getTransaction: async (id: string): Promise<Transaction> => {
    await delay(400);
    const tx = ALL_TRANSACTIONS.find(t => t.id === id);
    if (!tx) throw new Error('Transaction not found');
    return tx;
  },

  updateTransaction: async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
    await delay(600);
    // 25% chance of failure to confidently demonstrate optimistic rollback functionality!
    if (Math.random() < 0.25) {
      throw new Error('Simulated network failure. Rollback engaged.');
    }
    
    const index = ALL_TRANSACTIONS.findIndex(t => t.id === id);
    if (index > -1) {
      ALL_TRANSACTIONS[index] = { ...ALL_TRANSACTIONS[index], ...updates };
      return ALL_TRANSACTIONS[index];
    }
    throw new Error('Transaction not found');
  },

  // Developer tool to synchronize randomly generated UI stream events with the "backend" memory
  injectMockEvent: (tx: Transaction) => {
    const index = ALL_TRANSACTIONS.findIndex(t => t.id === tx.id);
    if (index > -1) {
      ALL_TRANSACTIONS[index] = { ...ALL_TRANSACTIONS[index], ...tx };
    } else {
      ALL_TRANSACTIONS.unshift(tx);
    }
  }
};
