import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { set, get, del, clear } from 'idb-keyval';

interface InForDB extends DBSchema {
  workOrders: {
    key: string;
    value: any;
  };
  requisitions: {
    key: string;
    value: any;
  };
  issues: {
    key: string;
    value: any;
  };
  receipts: {
    key: string;
    value: any;
  };
  assets: {
    key: string;
    value: any;
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      type: 'workOrder' | 'requisition' | 'issue' | 'receipt';
      action: 'create' | 'update' | 'delete';
      data: any;
      timestamp: number;
      retryCount: number;
    };
    indexes: {
      'by-type': string;
      'by-timestamp': number;
    };
  };
}

class StorageManager {
  private db: IDBPDatabase<InForDB> | null = null;
  private readonly DB_NAME = 'infor-offline';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await openDB<InForDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // Create object stores if they don't exist
          if (!db.objectStoreNames.contains('workOrders')) {
            db.createObjectStore('workOrders');
          }
          if (!db.objectStoreNames.contains('requisitions')) {
            db.createObjectStore('requisitions');
          }
          if (!db.objectStoreNames.contains('issues')) {
            db.createObjectStore('issues');
          }
          if (!db.objectStoreNames.contains('receipts')) {
            db.createObjectStore('receipts');
          }
          if (!db.objectStoreNames.contains('assets')) {
            db.createObjectStore('assets');
          }
          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
            syncStore.createIndex('by-type', 'type');
            syncStore.createIndex('by-timestamp', 'timestamp');
          }
        },
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw new Error('Offline storage initialization failed');
    }
  }

  // Generic storage methods (AsyncStorage-like interface)
  async setItem(key: string, value: any): Promise<void> {
    try {
      await set(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
      throw error;
    }
  }

  async getItem(key: string): Promise<any> {
    try {
      return await get(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await del(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await clear();
    } catch (error) {
      console.error('Storage clear error:', error);
      throw error;
    }
  }

  // Work Orders
  async saveWorkOrder(id: string, data: any): Promise<void> {
    await this.ensureDB();
    await this.db!.put('workOrders', data, id);
  }

  async getWorkOrder(id: string): Promise<any> {
    await this.ensureDB();
    return await this.db!.get('workOrders', id);
  }

  async getAllWorkOrders(): Promise<any[]> {
    await this.ensureDB();
    return await this.db!.getAll('workOrders');
  }

  async deleteWorkOrder(id: string): Promise<void> {
    await this.ensureDB();
    await this.db!.delete('workOrders', id);
  }

  // Requisitions
  async saveRequisition(id: string, data: any): Promise<void> {
    await this.ensureDB();
    await this.db!.put('requisitions', data, id);
  }

  async getRequisition(id: string): Promise<any> {
    await this.ensureDB();
    return await this.db!.get('requisitions', id);
  }

  async getAllRequisitions(): Promise<any[]> {
    await this.ensureDB();
    return await this.db!.getAll('requisitions');
  }

  async deleteRequisition(id: string): Promise<void> {
    await this.ensureDB();
    await this.db!.delete('requisitions', id);
  }

  // Issues
  async saveIssue(id: string, data: any): Promise<void> {
    await this.ensureDB();
    await this.db!.put('issues', data, id);
  }

  async getIssue(id: string): Promise<any> {
    await this.ensureDB();
    return await this.db!.get('issues', id);
  }

  async getAllIssues(): Promise<any[]> {
    await this.ensureDB();
    return await this.db!.getAll('issues');
  }

  async deleteIssue(id: string): Promise<void> {
    await this.ensureDB();
    await this.db!.delete('issues', id);
  }

  // Receipts
  async saveReceipt(id: string, data: any): Promise<void> {
    await this.ensureDB();
    await this.db!.put('receipts', data, id);
  }

  async getReceipt(id: string): Promise<any> {
    await this.ensureDB();
    return await this.db!.get('receipts', id);
  }

  async getAllReceipts(): Promise<any[]> {
    await this.ensureDB();
    return await this.db!.getAll('receipts');
  }

  async deleteReceipt(id: string): Promise<void> {
    await this.ensureDB();
    await this.db!.delete('receipts', id);
  }

  // Assets
  async saveAsset(id: string, data: any): Promise<void> {
    await this.ensureDB();
    await this.db!.put('assets', data, id);
  }

  async getAsset(id: string): Promise<any> {
    await this.ensureDB();
    return await this.db!.get('assets', id);
  }

  async getAllAssets(): Promise<any[]> {
    await this.ensureDB();
    return await this.db!.getAll('assets');
  }

  async deleteAsset(id: string): Promise<void> {
    await this.ensureDB();
    await this.db!.delete('assets', id);
  }

  // Sync Queue Management
  async addToSyncQueue(item: {
    id: string;
    type: 'workOrder' | 'requisition' | 'issue' | 'receipt';
    action: 'create' | 'update' | 'delete';
    data: any;
  }): Promise<void> {
    await this.ensureDB();
    const queueItem = {
      ...item,
      timestamp: Date.now(),
      retryCount: 0,
    };
    await this.db!.put('syncQueue', queueItem);
  }

  async getSyncQueue(): Promise<any[]> {
    await this.ensureDB();
    return await this.db!.getAll('syncQueue');
  }

  async getSyncQueueByType(type: string): Promise<any[]> {
    await this.ensureDB();
    return await this.db!.getAllFromIndex('syncQueue', 'by-type', type);
  }

  async updateSyncQueueItem(id: string, updates: Partial<any>): Promise<void> {
    await this.ensureDB();
    const item = await this.db!.get('syncQueue', id);
    if (item) {
      await this.db!.put('syncQueue', { ...item, ...updates });
    }
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    await this.ensureDB();
    await this.db!.delete('syncQueue', id);
  }

  async clearSyncQueue(): Promise<void> {
    await this.ensureDB();
    const tx = this.db!.transaction('syncQueue', 'readwrite');
    await tx.objectStore('syncQueue').clear();
    await tx.done;
  }

  // Utility methods
  async getStorageInfo(): Promise<{
    workOrders: number;
    requisitions: number;
    issues: number;
    receipts: number;
    assets: number;
    syncQueue: number;
  }> {
    await this.ensureDB();
    const [workOrders, requisitions, issues, receipts, assets, syncQueue] = await Promise.all([
      this.db!.count('workOrders'),
      this.db!.count('requisitions'),
      this.db!.count('issues'),
      this.db!.count('receipts'),
      this.db!.count('assets'),
      this.db!.count('syncQueue'),
    ]);

    return {
      workOrders,
      requisitions,
      issues,
      receipts,
      assets,
      syncQueue,
    };
  }

  async clearAllData(): Promise<void> {
    await this.ensureDB();
    const tx = this.db!.transaction(
      ['workOrders', 'requisitions', 'issues', 'receipts', 'assets', 'syncQueue'],
      'readwrite'
    );

    await Promise.all([
      tx.objectStore('workOrders').clear(),
      tx.objectStore('requisitions').clear(),
      tx.objectStore('issues').clear(),
      tx.objectStore('receipts').clear(),
      tx.objectStore('assets').clear(),
      tx.objectStore('syncQueue').clear(),
    ]);

    await tx.done;
  }

  private async ensureDB(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }

  // Check if IndexedDB is supported
  isSupported(): boolean {
    return 'indexedDB' in window;
  }

  // Get storage quota information (if available)
  async getStorageEstimate(): Promise<{ quota?: number; usage?: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return await navigator.storage.estimate();
    }
    return {};
  }
}

// Create singleton instance
const storageManager = new StorageManager();

export default storageManager;