import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const storedToken = localStorage.getItem('sb-terrarium-auth-token');
      if (storedToken) {
        const { access_token } = JSON.parse(storedToken);
        if (config.headers) {
          config.headers.Authorization = `Bearer ${access_token}`;
        }
      }
      return config;
    } catch (error) {
      console.error('Error setting auth token:', error);
      return config;
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const storedToken = localStorage.getItem('sb-terrarium-auth-token');
        if (storedToken) {
          const { refresh_token } = JSON.parse(storedToken);
          const response = await api.post('/auth/refresh', { refresh_token });
          const { access_token } = response.data;

          // Update stored token
          const updatedToken = JSON.parse(storedToken);
          updatedToken.access_token = access_token;
          localStorage.setItem(
            'sb-terrarium-auth-token',
            JSON.stringify(updatedToken)
          );

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear auth and redirect to login
        localStorage.removeItem('sb-terrarium-auth-token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
