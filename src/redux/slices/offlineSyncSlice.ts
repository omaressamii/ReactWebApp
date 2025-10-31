import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
interface QueueItem {
  id: string;
  timestamp: string;
  operation: string;
  data: any;
  sessionId?: string;
  userId?: string;
  retryCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: 'high' | 'normal' | 'low';
  error?: string;
}

interface PendingAsset {
  id: string;
  queueId: string;
  asset: any;
  queuedAt: string;
  sessionId?: string;
}

interface SyncedAsset {
  id: string;
  asset: any;
  syncedAt: string;
}

interface FailedAsset {
  id: string;
  asset: any;
  failedAt: string;
  error: string;
  queueId?: string;
}

interface SyncError {
  id: number;
  timestamp: string;
  error: string;
}

interface OfflineSyncState {
  // Network status
  isConnected: boolean;
  connectionType: string | null;

  // Queue management
  offlineQueue: QueueItem[];
  queueSize: number;

  // Sync status
  isSyncing: boolean;
  syncProgress: number;
  lastSyncTime: string | null;
  syncErrors: SyncError[];

  // Asset states
  pendingAssets: PendingAsset[];
  syncedAssets: SyncedAsset[];
  failedAssets: FailedAsset[];

  // Statistics
  totalPendingOperations: number;
  successfulSyncs: number;
  failedSyncs: number;

  // Configuration
  autoSyncEnabled: boolean;
  syncRetryAttempts: number;
  syncTimeout: number;
}

// Storage keys
const STORAGE_KEYS = {
  OFFLINE_QUEUE: 'OFFLINE_QUEUE',
  SYNC_STATE: 'SYNC_STATE',
  LAST_SYNC: 'LAST_SYNC',
  PENDING_ASSETS: 'PENDING_ASSETS',
  FAILED_SYNCS: 'FAILED_SYNCS'
};

// Mock storage manager for web
class MockStorageManager {
  static async getOfflineQueue(): Promise<QueueItem[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get offline queue:', error);
      return [];
    }
  }

  static async saveOfflineQueue(queue: QueueItem[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  static async getSyncState(): Promise<any> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SYNC_STATE);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get sync state:', error);
      return {};
    }
  }

  static async updateSyncState(state: any): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_STATE, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to update sync state:', error);
    }
  }

  static async getLastSyncTime(): Promise<string | null> {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return null;
    }
  }

  static async getPendingAssets(): Promise<PendingAsset[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PENDING_ASSETS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get pending assets:', error);
      return [];
    }
  }
}

// Mock network monitor for web
class MockNetworkMonitor {
  static async refreshNetworkState(): Promise<{ isConnected: boolean; type: string }> {
    // In web environment, assume always connected
    return { isConnected: navigator.onLine, type: 'wifi' };
  }
}

// Initial state
const initialState: OfflineSyncState = {
  isConnected: navigator.onLine,
  connectionType: 'wifi',

  offlineQueue: [],
  queueSize: 0,

  isSyncing: false,
  syncProgress: 0,
  lastSyncTime: null,
  syncErrors: [],

  pendingAssets: [],
  syncedAssets: [],
  failedAssets: [],

  totalPendingOperations: 0,
  successfulSyncs: 0,
  failedSyncs: 0,

  autoSyncEnabled: true,
  syncRetryAttempts: 3,
  syncTimeout: 30000,
};

// Async thunks
export const initializeOfflineSync = createAsyncThunk(
  'offlineSync/initialize',
  async (_, { dispatch }) => {
    try {
      // Load persisted state
      const persistedQueue = await MockStorageManager.getOfflineQueue();
      const persistedSyncState = await MockStorageManager.getSyncState();
      const lastSync = await MockStorageManager.getLastSyncTime();
      const pendingAssets = await MockStorageManager.getPendingAssets();

      // Initialize network monitoring
      const networkState = await MockNetworkMonitor.refreshNetworkState();

      return {
        offlineQueue: persistedQueue || [],
        syncState: persistedSyncState || {},
        lastSyncTime: lastSync,
        pendingAssets: pendingAssets || [],
        networkState: {
          isConnected: networkState.isConnected,
          type: networkState.type
        }
      };
    } catch (error: any) {
      console.error('Failed to initialize offline sync:', error);
      throw error;
    }
  }
);

export const addToOfflineQueue = createAsyncThunk(
  'offlineSync/addToQueue',
  async (operation: any, { getState }) => {
    try {
      const queueItem: QueueItem = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        operation: operation.type,
        data: operation.data,
        sessionId: operation.sessionId,
        userId: operation.userId,
        retryCount: 0,
        status: 'pending',
        priority: operation.priority || 'normal'
      };

      // Save to storage
      const currentQueue = await MockStorageManager.getOfflineQueue();
      const updatedQueue = [...currentQueue, queueItem];
      await MockStorageManager.saveOfflineQueue(updatedQueue);

      return queueItem;
    } catch (error: any) {
      console.error('Failed to add to offline queue:', error);
      throw error;
    }
  }
);

export const processOfflineQueue = createAsyncThunk(
  'offlineSync/processQueue',
  async (_, { getState, dispatch }) => {
    const state = (getState() as any).offlineSync;

    if (state.isSyncing) {
      return { skipped: true, reason: 'Already syncing' };
    }

    // Check network connectivity
    try {
      const networkState = await MockNetworkMonitor.refreshNetworkState();
      if (!networkState?.isConnected) {
        return { skipped: true, reason: 'No network connection' };
      }
    } catch (error) {
      return { skipped: true, reason: 'Failed to check network connection' };
    }

    try {
      // Get queue from storage
      const queue = await MockStorageManager.getOfflineQueue();
      const inventoryBugs = queue.filter(item => item.operation === 'INVENTORY_BUG_REPORT');
      const otherItems = queue.filter(item => item.operation !== 'INVENTORY_BUG_REPORT');

      // Mock processing - in real implementation, this would sync with API
      const successful: QueueItem[] = [];
      const failed: QueueItem[] = [];
      const processed: string[] = [];

      // Process inventory bugs first (high priority)
      for (const item of inventoryBugs) {
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 500));
          successful.push(item);
          processed.push(item.id);
        } catch (error) {
          failed.push(item);
          processed.push(item.id);
        }
      }

      // Process other items
      for (const item of otherItems) {
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 300));
          successful.push(item);
          processed.push(item.id);
        } catch (error) {
          failed.push(item);
          processed.push(item.id);
        }
      }

      // Update storage
      const remainingQueue = queue.filter(item => !processed.includes(item.id));
      await MockStorageManager.saveOfflineQueue(remainingQueue);

      await MockStorageManager.updateSyncState({
        lastSyncTime: new Date().toISOString(),
        successfulSyncs: successful.length,
        failedSyncs: failed.length
      });

      return { successful, failed, processed };
    } catch (error: any) {
      console.error('Failed to process offline queue:', error);
      throw error;
    }
  }
);

export const syncAssetInventory = createAsyncThunk(
  'offlineSync/syncAssetInventory',
  async ({ asset, sessionId, operation }: { asset: any; sessionId: string; operation: string }, { getState, dispatch }) => {
    const state = (getState() as any).offlineSync;

    if (!state.isConnected) {
      // Add to offline queue
      await dispatch(addToOfflineQueue({
        type: 'ASSET_INVENTORY_UPDATE',
        data: asset,
        sessionId,
        userId: asset.INV_UserID,
        priority: 'high'
      }));

      return { queued: true, asset };
    }

    try {
      // Mock immediate sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { asset, synced: true };
    } catch (error: any) {
      // If sync fails, add to queue for retry
      await dispatch(addToOfflineQueue({
        type: 'ASSET_INVENTORY_UPDATE',
        data: asset,
        sessionId,
        userId: asset.INV_UserID,
        priority: 'high',
        error: error.message
      }));

      throw error;
    }
  }
);

export const retryFailedSync = createAsyncThunk(
  'offlineSync/retryFailedSync',
  async (queueItemId: string, { getState, dispatch }) => {
    try {
      // Mock retry logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, queueItemId };
    } catch (error: any) {
      console.error('Failed to retry sync:', error);
      throw error;
    }
  }
);

export const refreshQueueFromStorage = createAsyncThunk(
  'offlineSync/refreshQueueFromStorage',
  async (_, { dispatch }) => {
    try {
      const queue = await MockStorageManager.getOfflineQueue();
      const pendingAssets = await MockStorageManager.getPendingAssets();
      const syncState = await MockStorageManager.getSyncState();

      return {
        queue,
        pendingAssets,
        syncState
      };
    } catch (error: any) {
      console.error('Failed to refresh queue from storage:', error);
      throw error;
    }
  }
);

export const clearSyncData = createAsyncThunk(
  'offlineSync/clearSyncData',
  async (options: { clearQueue?: boolean; clearErrors?: boolean; clearAll?: boolean } = {}, { dispatch }) => {
    try {
      if (options.clearQueue) {
        localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
      }

      if (options.clearErrors) {
        localStorage.removeItem(STORAGE_KEYS.FAILED_SYNCS);
      }

      if (options.clearAll) {
        Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
        });
      }

      return options;
    } catch (error: any) {
      console.error('Failed to clear sync data:', error);
      throw error;
    }
  }
);

// Slice
const offlineSyncSlice = createSlice({
  name: 'offlineSync',
  initialState,
  reducers: {
    setNetworkStatus: (state, action: PayloadAction<{ isConnected: boolean; type: string }>) => {
      const { isConnected, type } = action.payload;
      state.isConnected = isConnected;
      state.connectionType = type;
    },

    updateSyncProgress: (state, action: PayloadAction<number>) => {
      state.syncProgress = action.payload;
    },

    addSyncError: (state, action: PayloadAction<string>) => {
      state.syncErrors.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        error: action.payload
      });

      // Keep only last 50 errors
      if (state.syncErrors.length > 50) {
        state.syncErrors = state.syncErrors.slice(-50);
      }
    },

    clearSyncErrors: (state) => {
      state.syncErrors = [];
    },

    updateAssetStatus: (state, action: PayloadAction<{ assetId: string; status: string; data?: any }>) => {
      const { assetId, status, data } = action.payload;

      // Remove from pending if exists
      state.pendingAssets = state.pendingAssets.filter(asset => asset.id !== assetId);

      if (status === 'synced') {
        state.syncedAssets.push({ id: assetId, asset: data, syncedAt: new Date().toISOString() });
        state.successfulSyncs += 1;
      } else if (status === 'failed') {
        state.failedAssets.push({ id: assetId, asset: data, failedAt: new Date().toISOString(), error: 'Sync failed' });
        state.failedSyncs += 1;
      }
    },

    toggleAutoSync: (state) => {
      state.autoSyncEnabled = !state.autoSyncEnabled;
    },

    updateSyncConfig: (state, action: PayloadAction<{ retryAttempts?: number; timeout?: number }>) => {
      const { retryAttempts, timeout } = action.payload;
      if (retryAttempts !== undefined) state.syncRetryAttempts = retryAttempts;
      if (timeout !== undefined) state.syncTimeout = timeout;
    },

    resetSyncStats: (state) => {
      state.successfulSyncs = 0;
      state.failedSyncs = 0;
      state.syncErrors = [];
      state.syncedAssets = [];
      state.failedAssets = [];
    }
  },
  extraReducers: (builder) => {
    // Initialize offline sync
    builder
      .addCase(initializeOfflineSync.pending, (state) => {
        state.isSyncing = true;
      })
      .addCase(initializeOfflineSync.fulfilled, (state, action) => {
        const { offlineQueue, syncState, lastSyncTime, networkState, pendingAssets } = action.payload;
        state.offlineQueue = offlineQueue;
        state.queueSize = offlineQueue.length;
        state.lastSyncTime = lastSyncTime;
        state.isConnected = networkState.isConnected;
        state.connectionType = networkState.type;
        state.pendingAssets = pendingAssets;
        state.isSyncing = false;

        // Update stats from sync state
        if (syncState) {
          state.successfulSyncs = syncState.successfulSyncs || 0;
          state.failedSyncs = syncState.failedSyncs || 0;
        }
      })
      .addCase(initializeOfflineSync.rejected, (state, action) => {
        state.isSyncing = false;
        state.syncErrors.push({
          id: Date.now(),
          timestamp: new Date().toISOString(),
          error: (action.error as any)?.message || 'Initialization failed'
        });
      });

    // Add to offline queue
    builder
      .addCase(addToOfflineQueue.fulfilled, (state, action) => {
        state.offlineQueue.push(action.payload);
        state.queueSize = state.offlineQueue.length;
        state.totalPendingOperations += 1;

        // Add to pending assets
        if (action.payload.operation === 'ASSET_INVENTORY_UPDATE') {
          state.pendingAssets.push({
            id: action.payload.data.AIR_OBJ || action.payload.data.assetCode,
            queueId: action.payload.id,
            asset: action.payload.data,
            queuedAt: action.payload.timestamp,
            sessionId: action.payload.sessionId
          });
        }
      })
      .addCase(addToOfflineQueue.rejected, (state, action) => {
        state.syncErrors.push({
          id: Date.now(),
          timestamp: new Date().toISOString(),
          error: `Failed to queue operation: ${(action.error as any)?.message || 'Unknown error'}`
        });
      });

    // Process offline queue
    builder
      .addCase(processOfflineQueue.pending, (state) => {
        state.isSyncing = true;
        state.syncProgress = 0;
      })
      .addCase(processOfflineQueue.fulfilled, (state, action) => {
        if (action.payload.skipped) {
          state.isSyncing = false;
          return;
        }

        const { successful, failed, processed } = action.payload;

        // Remove processed items from queue
        state.offlineQueue = state.offlineQueue.filter(
          item => !processed.includes(item.id)
        );
        state.queueSize = state.offlineQueue.length;

        // Update stats
        state.successfulSyncs += successful.length;
        state.failedSyncs += failed.length;
        state.lastSyncTime = new Date().toISOString();
        state.isSyncing = false;
        state.syncProgress = 100;

        // Update asset statuses
        successful.forEach(item => {
          if (item.operation === 'ASSET_INVENTORY_UPDATE') {
            state.pendingAssets = state.pendingAssets.filter(
              asset => asset.queueId !== item.id
            );
            state.syncedAssets.push({
              id: item.data.AIR_OBJ || item.data.assetCode,
              asset: item.data,
              syncedAt: new Date().toISOString()
            });
          }
        });

        failed.forEach(item => {
          if (item.operation === 'ASSET_INVENTORY_UPDATE') {
            const pendingIndex = state.pendingAssets.findIndex(
              asset => asset.queueId === item.id
            );
            if (pendingIndex !== -1) {
              state.failedAssets.push({
                ...state.pendingAssets[pendingIndex],
                failedAt: new Date().toISOString(),
                error: 'Sync failed'
              });
              state.pendingAssets.splice(pendingIndex, 1);
            }
          }
        });
      })
      .addCase(processOfflineQueue.rejected, (state, action) => {
        state.isSyncing = false;
        state.syncProgress = 0;
        state.syncErrors.push({
          id: Date.now(),
          timestamp: new Date().toISOString(),
          error: `Queue processing failed: ${(action.error as any)?.message || 'Unknown error'}`
        });
      });

    // Sync asset inventory
    builder
      .addCase(syncAssetInventory.fulfilled, (state, action) => {
        if (action.payload.queued) {
          // Already handled in addToOfflineQueue
          return;
        }

        // Direct sync successful
        const asset = action.payload.asset || action.payload;
        state.syncedAssets.push({
          id: asset.AIR_OBJ || asset.assetCode,
          asset: asset,
          syncedAt: new Date().toISOString()
        });
        state.successfulSyncs += 1;
      })
      .addCase(syncAssetInventory.rejected, (state, action) => {
        state.syncErrors.push({
          id: Date.now(),
          timestamp: new Date().toISOString(),
          error: `Asset sync failed: ${(action.error as any)?.message || 'Unknown error'}`
        });
      });

    // Refresh queue from storage
    builder
      .addCase(refreshQueueFromStorage.fulfilled, (state, action) => {
        const { queue, pendingAssets, syncState } = action.payload;

        state.offlineQueue = queue;
        state.queueSize = queue.length;
        state.pendingAssets = pendingAssets || [];

        if (syncState) {
          state.successfulSyncs = syncState.successfulSyncs || 0;
          state.failedSyncs = syncState.failedSyncs || 0;
          state.lastSyncTime = syncState.lastSyncTime;
        }
      });
  }
});

// Actions
export const {
  setNetworkStatus,
  updateSyncProgress,
  addSyncError,
  clearSyncErrors,
  updateAssetStatus,
  toggleAutoSync,
  updateSyncConfig,
  resetSyncStats
} = offlineSyncSlice.actions;

// Reducer
export default offlineSyncSlice.reducer;