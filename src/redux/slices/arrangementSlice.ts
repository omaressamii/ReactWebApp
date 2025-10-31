import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Types
interface StoreBin {
  id: string;
  binCode: string;
  location: string;
  // Add other bin properties as needed
}

interface Asset {
  id: string;
  code: string;
  name: string;
  currentBin: string;
  // Add other asset properties as needed
}

interface ArrangementState {
  getStoreBins: StoreBin[];
  getStoreBinsLoading: boolean;
  getStoreBinsError: string | null;

  getAsset: Asset | null;
  getAssetLoading: boolean;
  getAssetError: string | null;
  getAssetIsDone: boolean | null;

  updateAssetsBinLoading: boolean;
  updateAssetsBinError: string | null;
  updateAssetsIncompleteAssets: any[];
  updateAssetsBinIsDone: boolean | null;
}

// Initial state
const initialState: ArrangementState = {
  getStoreBins: [],
  getStoreBinsLoading: false,
  getStoreBinsError: null,

  getAsset: null,
  getAssetLoading: false,
  getAssetError: null,
  getAssetIsDone: null,

  updateAssetsBinLoading: false,
  updateAssetsBinError: null,
  updateAssetsIncompleteAssets: [],
  updateAssetsBinIsDone: null,
};

// Async thunks
export const getStoreBins = createAsyncThunk(
  'arrangement/getStoreBins',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('ARRANGEMENT', 'STORE_BINS', request);

      if (response.status === 1 && response.data) {
        return { bins: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch store bins' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch store bins' });
    }
  }
);

export const updateAssetsBin = createAsyncThunk(
  'arrangement/updateAssetsBin',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.putByEndpoint('ARRANGEMENT', 'BIN_UPDATE', request, { id: request.binId });

      if (response.status === 1) {
        return {
          IncompleteAssets: response.data?.IncompleteAssets || [],
          message: response.message || 'Assets bin updated successfully'
        };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to update assets bin' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to update assets bin' });
    }
  }
);

export const getAsset = createAsyncThunk(
  'arrangement/getAsset',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('DEVICE', 'DETAILS', { id: request.assetId });

      if (response.status === 1 && response.data) {
        return { asset: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch asset' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch asset' });
    }
  }
);

// Slice
const arrangementSlice = createSlice({
  name: 'arrangement',
  initialState,
  reducers: {
    resetGetStoreBins: (state) => {
      state.getStoreBins = [];
      state.getStoreBinsLoading = false;
      state.getStoreBinsError = null;
    },
    resetGetAsset: (state) => {
      state.getAsset = null;
      state.getAssetLoading = false;
      state.getAssetError = null;
      state.getAssetIsDone = null;
    },
    resetUpdateAssetsBin: (state) => {
      state.updateAssetsBinLoading = false;
      state.updateAssetsBinError = null;
      state.updateAssetsIncompleteAssets = [];
      state.updateAssetsBinIsDone = null;
    },
  },
  extraReducers: (builder) => {
    // getStoreBins
    builder
      .addCase(getStoreBins.pending, (state) => {
        state.getStoreBins = [];
        state.getStoreBinsLoading = true;
        state.getStoreBinsError = null;
      })
      .addCase(getStoreBins.fulfilled, (state, action) => {
        state.getStoreBins = action.payload.bins;
        state.getStoreBinsLoading = false;
        state.getStoreBinsError = null;
      })
      .addCase(getStoreBins.rejected, (state, action) => {
        state.getStoreBins = [];
        state.getStoreBinsLoading = false;
        state.getStoreBinsError = (action.payload as any)?.error || 'Failed to fetch store bins';
      })
      // getAsset
      .addCase(getAsset.pending, (state) => {
        state.getAsset = null;
        state.getAssetLoading = true;
        state.getAssetError = null;
        state.getAssetIsDone = null;
      })
      .addCase(getAsset.fulfilled, (state, action) => {
        state.getAsset = action.payload.asset;
        state.getAssetLoading = false;
        state.getAssetError = null;
        state.getAssetIsDone = true;
      })
      .addCase(getAsset.rejected, (state, action) => {
        state.getAsset = null;
        state.getAssetLoading = false;
        state.getAssetError = (action.payload as any)?.error || 'Failed to fetch asset';
        state.getAssetIsDone = false;
      })
      // updateAssetsBin
      .addCase(updateAssetsBin.pending, (state) => {
        state.updateAssetsBinLoading = true;
        state.updateAssetsBinError = null;
        state.updateAssetsIncompleteAssets = [];
        state.updateAssetsBinIsDone = null;
      })
      .addCase(updateAssetsBin.fulfilled, (state, action) => {
        state.updateAssetsBinLoading = false;
        state.updateAssetsBinError = null;
        state.updateAssetsIncompleteAssets = action.payload.IncompleteAssets || [];
        state.updateAssetsBinIsDone = true;
      })
      .addCase(updateAssetsBin.rejected, (state, action) => {
        state.updateAssetsBinLoading = false;
        state.updateAssetsBinError = (action.payload as any)?.error || 'Failed to update assets bin';
        state.updateAssetsIncompleteAssets = (action.payload as any)?.IncompleteAssets || [];
        state.updateAssetsBinIsDone = false;
      });
  },
});

// Actions
export const { resetGetStoreBins, resetGetAsset, resetUpdateAssetsBin } = arrangementSlice.actions;

// Selectors
export const selectStoreBins = (state: { arrangement: ArrangementState }) => state.arrangement.getStoreBins;
export const selectStoreBinsLoading = (state: { arrangement: ArrangementState }) => state.arrangement.getStoreBinsLoading;
export const selectStoreBinsError = (state: { arrangement: ArrangementState }) => state.arrangement.getStoreBinsError;

export const selectArrangementAsset = (state: { arrangement: ArrangementState }) => state.arrangement.getAsset;
export const selectArrangementAssetLoading = (state: { arrangement: ArrangementState }) => state.arrangement.getAssetLoading;
export const selectArrangementAssetError = (state: { arrangement: ArrangementState }) => state.arrangement.getAssetError;
export const selectArrangementAssetIsDone = (state: { arrangement: ArrangementState }) => state.arrangement.getAssetIsDone;

export const selectUpdateAssetsBinLoading = (state: { arrangement: ArrangementState }) => state.arrangement.updateAssetsBinLoading;
export const selectUpdateAssetsBinError = (state: { arrangement: ArrangementState }) => state.arrangement.updateAssetsBinError;
export const selectUpdateAssetsIncompleteAssets = (state: { arrangement: ArrangementState }) => state.arrangement.updateAssetsIncompleteAssets;
export const selectUpdateAssetsBinIsDone = (state: { arrangement: ArrangementState }) => state.arrangement.updateAssetsBinIsDone;

// Reducer
export default arrangementSlice.reducer;