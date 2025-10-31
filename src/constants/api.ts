// API Configuration for InFor Web App
// Similar to Expo app's API.js but adapted for web environment

// Storage keys for web localStorage
const STORAGE_KEYS = {
  API_CONFIG: 'api_config',
  API_INITIALIZED: 'api_initialized'
};

// Default API configuration (fallback values)
const DEFAULT_API_CONFIG = {
  host: 'localhost',
  port: '8081',
  protocol: 'http',
  timeout: 30000,
  baseURL: 'http://localhost:8081'
};

// Dynamic API configuration class
class APIConfig {
  private config: any = null;
  private initialized: boolean = false;

  constructor() {
    this.config = { ...DEFAULT_API_CONFIG };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const storedConfig = localStorage.getItem(STORAGE_KEYS.API_CONFIG);
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig);
        this.config = { ...DEFAULT_API_CONFIG, ...parsedConfig };
      }

      // Mark as initialized
      localStorage.setItem(STORAGE_KEYS.API_INITIALIZED, 'true');
      this.initialized = true;

      console.log('API Config initialized:', this.config);
    } catch (error) {
      console.warn('Failed to load API config from storage:', error);
      this.config = { ...DEFAULT_API_CONFIG };
      this.initialized = true;
    }
  }

  async updateConfig(newConfig: Partial<typeof DEFAULT_API_CONFIG>): Promise<any> {
    try {
      this.config = { ...this.config, ...newConfig };

      // Update baseURL if host or port changed
      if (newConfig.host || newConfig.port || newConfig.protocol) {
        const protocol = this.config.protocol || 'http';
        const host = this.config.host || 'localhost';
        const port = this.config.port || '8081';
        this.config.baseURL = `${protocol}://${host}:${port}`;
      }

      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(this.config));

      console.log('API Config updated:', this.config);
      return this.config;
    } catch (error) {
      console.error('Failed to update API config:', error);
      throw error;
    }
  }

  get host(): string | null {
    return this.config?.host || null;
  }

  get port(): string | null {
    return this.config?.port || null;
  }

  get protocol(): string {
    return this.config?.protocol || 'http';
  }

  get baseURL(): string {
    return this.config?.baseURL || DEFAULT_API_CONFIG.baseURL;
  }

  get timeout(): number {
    return this.config?.timeout || DEFAULT_API_CONFIG.timeout;
  }

  getConfig(): any {
    return { ...this.config };
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // Reset to defaults
  async resetToDefaults(): Promise<void> {
    this.config = { ...DEFAULT_API_CONFIG };
    localStorage.removeItem(STORAGE_KEYS.API_CONFIG);
    localStorage.setItem(STORAGE_KEYS.API_INITIALIZED, 'true');
    console.log('API Config reset to defaults');
  }
}

// Create singleton instance
const apiConfigInstance = new APIConfig();

// Export both the instance and a compatibility object
export const APIConfigManager = apiConfigInstance;

// For backward compatibility, export default object that proxies to the dynamic config
const API = new Proxy({}, {
  get(_, prop: string) {
    if (prop === 'host') return apiConfigInstance.host;
    if (prop === 'port') return apiConfigInstance.port;
    if (prop === 'protocol') return apiConfigInstance.protocol;
    if (prop === 'baseURL') return apiConfigInstance.baseURL;
    if (prop === 'timeout') return apiConfigInstance.timeout;
    return apiConfigInstance.getConfig()[prop] || null;
  }
});

export default API;