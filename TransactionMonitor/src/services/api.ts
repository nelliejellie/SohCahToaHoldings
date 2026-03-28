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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const MockAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    await delay(1000);
    if (email === 'admin@test.com' && password === 'password123') {
      return {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        expiresIn: 3600,
        user: { id: 'usr_1', role: 'admin', email }
      };
    } else if (email === 'analyst@test.com' && password === 'password123') {
      return {
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        expiresIn: 3600,
        user: { id: 'usr_2', role: 'analyst', email }
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
  }
};
