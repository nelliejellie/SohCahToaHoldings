import { create } from 'zustand';
import { saveSecureItem, getSecureItem, deleteSecureItem } from '../utils/storage';
import { MockAPI, User } from '../services/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

let refreshPromise: Promise<void> | null = null;
let refreshTimer: NodeJS.Timeout | null = null;

const scheduleRefresh = (expiresInSeconds: number, get: () => AuthState) => {
  if (refreshTimer) clearTimeout(refreshTimer);
  // Refresh 30 seconds before expiry
  const timeoutMs = (expiresInSeconds - 30) * 1000;
  
  if (timeoutMs > 0) {
    refreshTimer = setTimeout(() => {
      get().refreshToken();
    }, timeoutMs);
  } else {
    // If it's already expired or very close, refresh immediately
    get().refreshToken();
  }
};

const clearRefresh = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await MockAPI.login(email, password);
      
      await saveSecureItem('accessToken', response.accessToken);
      await saveSecureItem('refreshToken', response.refreshToken);
      await saveSecureItem('user', JSON.stringify(response.user));

      set({
        user: response.user,
        accessToken: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });

      scheduleRefresh(response.expiresIn, get);
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    clearRefresh();
    await deleteSecureItem('accessToken');
    await deleteSecureItem('refreshToken');
    await deleteSecureItem('user');
    
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  refreshToken: async () => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        const storedRefreshToken = await getSecureItem('refreshToken');
        if (!storedRefreshToken) throw new Error('No refresh token found');

        const response = await MockAPI.refreshToken(storedRefreshToken);
        
        await saveSecureItem('accessToken', response.accessToken);
        await saveSecureItem('refreshToken', response.refreshToken);
        
        set({
          accessToken: response.accessToken,
          isAuthenticated: true,
        });

        scheduleRefresh(response.expiresIn, get);
      } catch (error) {
        await get().logout();
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const accessToken = await getSecureItem('accessToken');
      const userStr = await getSecureItem('user');
      
      if (accessToken && userStr) {
        set({
          accessToken,
          user: JSON.parse(userStr),
          isAuthenticated: true,
        });
        
        get().refreshToken().catch(() => {});
      }
    } catch (e) {
      // Ignored
    } finally {
      set({ isLoading: false });
    }
  }
}));
