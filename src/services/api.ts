import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import API, { APIConfigManager } from '../constants/api';
import { API_ENDPOINTS, buildEndpoint, type EndpointCategory, type EndpointKey } from '../constants/endpoints';

// API Response interface
export interface ApiResponse<T = any> {
  status: number;
  message?: string;
  data?: T;
  error?: string;
  [key: string]: any;
}

// API Error interface
export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API Service class
class ApiService {
  private axiosInstance: AxiosInstance;
  private initialized: boolean = false;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // Initialize the API service
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize API configuration
      await APIConfigManager.initialize();

      // Update axios base URL
      this.axiosInstance.defaults.baseURL = APIConfigManager.baseURL;
      this.axiosInstance.defaults.timeout = APIConfigManager.timeout;

      this.initialized = true;
      console.log('API Service initialized with baseURL:', APIConfigManager.baseURL);
    } catch (error) {
      console.error('Failed to initialize API service:', error);
      throw error;
    }
  }

  // Setup request and response interceptors
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add timestamp to prevent caching
        config.headers.set('X-Requested-At', new Date().toISOString());

        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.set('Authorization', `Bearer ${token}`);
        }

        console.log('API Request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error: AxiosError) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('API Response:', response.status, response.config.url);
        return response;
      },
      (error: AxiosError) => {
        console.error('API Response Error:', error.response?.status, error.config?.url, error.message);

        // Handle common error cases
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
          // Token expired or invalid
          this.handleUnauthorized();
        }

        return Promise.reject(this.transformError(error));
      }
    );
  }

  // Get auth token from storage
  private getAuthToken(): string | null {
    try {
      return localStorage.getItem('auth_token');
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  // Handle unauthorized access
  private handleUnauthorized(): void {
    // Clear auth token
    localStorage.removeItem('auth_token');

    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  // Transform axios error to our ApiError format
  private transformError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as any;
      return {
        status: error.response.status,
        message: data?.message || error.message,
        details: data,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        status: 0,
        message: 'Network error - please check your connection',
        details: error.request,
      };
    } else {
      // Something else happened
      return {
        status: 0,
        message: error.message || 'Unknown error occurred',
        details: error,
      };
    }
  }

  // Generic GET request
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    await this.ensureInitialized();
    const response = await this.axiosInstance.get(url, config);
    return this.transformResponse<T>(response);
  }

  // Generic POST request
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    await this.ensureInitialized();
    const response = await this.axiosInstance.post(url, data, config);
    return this.transformResponse<T>(response);
  }

  // Generic PUT request
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    await this.ensureInitialized();
    const response = await this.axiosInstance.put(url, data, config);
    return this.transformResponse<T>(response);
  }

  // Generic DELETE request
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    await this.ensureInitialized();
    const response = await this.axiosInstance.delete(url, config);
    return this.transformResponse<T>(response);
  }

  // Generic PATCH request
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    await this.ensureInitialized();
    const response = await this.axiosInstance.patch(url, data, config);
    return this.transformResponse<T>(response);
  }

  // Transform axios response to our ApiResponse format
  private transformResponse<T>(response: AxiosResponse): ApiResponse<T> {
    return {
      status: response.status,
      data: response.data,
      ...response.data, // Spread any additional fields from response
    };
  }

  // Ensure API service is initialized
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  // Typed API methods using endpoints constants
  async getByEndpoint<T = any>(
    category: EndpointCategory,
    endpointKey: string,
    params?: Record<string, string | number>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    await this.ensureInitialized();
    const endpoint = (API_ENDPOINTS as any)[category][endpointKey] as string;
    const url = buildEndpoint(endpoint, params);
    // For GET requests, pass remaining params as query parameters
    const queryParams = { ...params };
    // Remove path parameters that were already used in buildEndpoint
    Object.keys(params || {}).forEach(key => {
      if (endpoint.includes(`:${key}`)) {
        delete queryParams[key];
      }
    });
    const finalConfig = { ...config, params: queryParams };
    const response = await this.axiosInstance.get(url, finalConfig);
    return this.transformResponse<T>(response);
  }

  async postByEndpoint<T = any>(
    category: EndpointCategory,
    endpointKey: string,
    data?: any,
    params?: Record<string, string | number>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    await this.ensureInitialized();
    const endpoint = (API_ENDPOINTS as any)[category][endpointKey] as string;
    const url = buildEndpoint(endpoint, params);
    const response = await this.axiosInstance.post(url, data, config);
    return this.transformResponse<T>(response);
  }

  async putByEndpoint<T = any>(
    category: EndpointCategory,
    endpointKey: string,
    data?: any,
    params?: Record<string, string | number>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    await this.ensureInitialized();
    const endpoint = (API_ENDPOINTS as any)[category][endpointKey] as string;
    const url = buildEndpoint(endpoint, params);
    const response = await this.axiosInstance.put(url, data, config);
    return this.transformResponse<T>(response);
  }

  async deleteByEndpoint<T = any>(
    category: EndpointCategory,
    endpointKey: string,
    params?: Record<string, string | number>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    await this.ensureInitialized();
    const endpoint = (API_ENDPOINTS as any)[category][endpointKey] as string;
    const url = buildEndpoint(endpoint, params);
    const response = await this.axiosInstance.delete(url, config);
    return this.transformResponse<T>(response);
  }

  // Authentication convenience methods
  async login(credentials: { user_code_infor: string; user_password_infor: string; deviceId?: string; appVersion?: string }): Promise<ApiResponse<any>> {
    return this.postByEndpoint('AUTH', 'LOGIN', credentials);
  }

  async logout(): Promise<ApiResponse<any>> {
    return this.postByEndpoint('AUTH', 'LOGOUT');
  }

  async refreshToken(): Promise<ApiResponse<any>> {
    return this.postByEndpoint('AUTH', 'REFRESH_TOKEN');
  }

  async getUserProfile(): Promise<ApiResponse<any>> {
    return this.getByEndpoint('USER', 'PROFILE');
  }

  // Update API configuration
  async updateConfig(config: { host?: string; port?: string; protocol?: string }): Promise<void> {
    await APIConfigManager.updateConfig(config);

    // Update axios instance
    this.axiosInstance.defaults.baseURL = APIConfigManager.baseURL;
    this.axiosInstance.defaults.timeout = APIConfigManager.timeout;

    console.log('API Service configuration updated');
  }

  // Get current configuration
  getConfig() {
    return APIConfigManager.getConfig();
  }

  // Check if service is initialized
  isInitialized(): boolean {
    return this.initialized;
  }

  // Reset configuration to defaults
  async resetConfig(): Promise<void> {
    await APIConfigManager.resetToDefaults();
    this.axiosInstance.defaults.baseURL = APIConfigManager.baseURL;
    console.log('API Service configuration reset to defaults');
  }
}

// Create singleton instance
const apiService = new ApiService();

// Export the service instance
export default apiService;

// Export types
export type { ApiService };