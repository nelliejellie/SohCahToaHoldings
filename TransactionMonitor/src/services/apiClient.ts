import { useAuthStore } from '../store/authStore';

// Centralized HTTP Client Wrapper for cleanly separated networking requests
class ApiClient {
  private async getHeaders() {
    const { accessToken } = useAuthStore.getState();
    return {
      'Content-Type': 'application/json',
      // Token injection dynamically retrieved from secure state
      'Authorization': accessToken ? `Bearer ${accessToken}` : '',
    };
  }

  // Generic request wrapper with Token Injection, 401 Handling, and Retry Strategy
  async request<T>(
    endpointName: string, 
    mockResolver: () => Promise<T>, 
    retries = 1
  ): Promise<T> {
    const headers = await this.getHeaders();
    console.log(`[API Request] -> ${endpointName}`, { Authorization: headers.Authorization ? 'Bearer *******' : 'None' });

    try {
      // Execute the actual payload
      return await mockResolver();
    } catch (error: any) {
      console.warn(`[API Error] <- ${endpointName}`, error.message);
      
      // Strict 401 Unauthorized handling logic (Interceptor pattern)
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.log('[API] 401 Caught. Attempting token refresh...');
        const authStore = useAuthStore.getState();
        try {
          await authStore.refreshAuthToken();
          console.log('[API] Token refreshed successfully. Retrying request...');
          if (retries > 0) {
            return this.request(endpointName, mockResolver, retries - 1);
          }
        } catch (refreshErr) {
          console.log('[API] Refresh completely failed. Session expired -> Logging out.');
          authStore.logout();
          throw refreshErr;
        }
      }

      // General Automated Retry Strategy for intermittent network errors
      if (retries > 0) {
        console.log(`[API] Retrying ${endpointName}... (${retries} attempts remaining)`);
        await new Promise(res => setTimeout(res, 1000)); // Delay sequence before retry
        return this.request(endpointName, mockResolver, retries - 1);
      }
      
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
