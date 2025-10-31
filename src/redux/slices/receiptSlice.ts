import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Types
interface Receipt {
  id: string;
  receiptCode: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  // Add other receipt properties as needed
}

interface ReceiptPart {
  id: string;
  partCode: string;
  quantity: number;
  description: string;
  // Add other part properties as needed
}

interface ReceiptImage {
  id: string;
  url: string;
  description: string;
  // Add other image properties as needed
}

interface StoreBin {
  id: string;
  binCode: string;
  location: string;
  // Add other bin properties as needed
}

interface ReceiptState {
  receipts: Receipt[];
  receiptParts: ReceiptPart[];
  receiptDocuments: any[];
  isDone: boolean | null;
  loading: boolean;
  error: string | null;

  getReceipt: Receipt | null;
  getReceiptLoading: boolean;
  getReceiptError: string | null;

  makeReceiptLoading: boolean;
  makeReceiptError: string | null;
  makeReceiptIsDone: boolean | null;
  makeReceiptCode: string | null;

  getReceiptParts: ReceiptPart[];
  getReceiptPartsLoading: boolean;
  getReceiptPartsError: string | null;
  getReceiptPartsIsDone: boolean | null;

  updateReceiptPartLoading: boolean;
  updateReceiptPartError: string | null;
  updateReceiptPartIsDone: boolean | null;

  updateReceiptLoading: boolean;
  updateReceiptError: string | null;
  updateReceiptIsDone: boolean | null;

  getReceiptImagesLoading: boolean;
  getReceiptImagesError: string | null;
  images: ReceiptImage[];

  getStoreBinsLoading: boolean;
  getStoreBinsError: string | null;
  bins: StoreBin[];
}

// Initial state
const initialState: ReceiptState = {
  receipts: [],
  receiptParts: [],
  receiptDocuments: [],
  isDone: null,
  loading: false,
  error: null,

  getReceipt: null,
  getReceiptLoading: false,
  getReceiptError: null,

  makeReceiptLoading: false,
  makeReceiptError: null,
  makeReceiptIsDone: null,
  makeReceiptCode: null,

  getReceiptParts: [],
  getReceiptPartsLoading: false,
  getReceiptPartsError: null,
  getReceiptPartsIsDone: null,

  updateReceiptPartLoading: false,
  updateReceiptPartError: null,
  updateReceiptPartIsDone: null,

  updateReceiptLoading: false,
  updateReceiptError: null,
  updateReceiptIsDone: null,

  getReceiptImagesLoading: false,
  getReceiptImagesError: null,
  images: [],

  getStoreBinsLoading: false,
  getStoreBinsError: null,
  bins: [],
};

// Async thunks
export const makeReceipt = createAsyncThunk(
  'receipt/makeReceipt',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('RECEIPT', 'CREATE', request);

      if (response.status === 1 && response.data) {
        return { receiptCode: response.data.receiptCode || response.data.code };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to create receipt' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to create receipt' });
    }
  }
);

export const getItReceipt = createAsyncThunk(
  'receipt/getItReceipt',
  async (user: any, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('RECEIPT', 'LIST', { user });

      if (response.status === 1 && response.data) {
        return { receipts: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch receipts' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch receipts' });
    }
  }
);

export const GetOneReceipt = createAsyncThunk(
  'receipt/GetOneReceipt',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('RECEIPT', 'DETAILS', { id: data.id });

      if (response.status === 1 && response.data) {
        return { receipt: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch receipt' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch receipt' });
    }
  }
);

export const getReceiptParts = createAsyncThunk(
  'receipt/getReceiptParts',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('RECEIPT', 'PARTS', { id: request.receiptId });

      if (response.status === 1 && response.data) {
        return { parts: response.data.parts || response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch receipt parts' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch receipt parts' });
    }
  }
);

export const updateReceipt = createAsyncThunk(
  'receipt/updateReceipt',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.putByEndpoint('RECEIPT', 'UPDATE', request, { id: request.id });

      if (response.status === 1) {
        return { message: response.message || 'Receipt updated successfully' };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to update receipt' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to update receipt' });
    }
  }
);

export const getReceiptImages = createAsyncThunk(
  'receipt/getReceiptImages',
  async (request: any, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call when API is configured
      // const response = await axios.post(`${API_BASE_URL}/receipt/getReceiptImages`, request, {
      //   headers: { 'Content-Type': 'application/json' },
      // });

      // Mock response for now
      const mockImages: ReceiptImage[] = [
        {
          id: '1',
          url: 'https://example.com/receipt-image1.jpg',
          description: 'Sample receipt image',
        },
      ];

      return { status: 1, images: mockImages };
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch receipt images' });
    }
  }
);

export const GetStoreBins = createAsyncThunk(
  'receipt/GetStoreBins',
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

export const updateReceiptPart = createAsyncThunk(
  'receipt/updateReceiptPart',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.putByEndpoint('RECEIPT', 'PARTS', request, { id: request.receiptId });

      if (response.status === 1) {
        return { message: response.message || 'Receipt part updated successfully' };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to update receipt part' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to update receipt part' });
    }
  }
);

// Slice
const receiptSlice = createSlice({
  name: 'receipt',
  initialState,
  reducers: {
    setError: (state, action: PayloadAction<{ error: string }>) => {
      state.error = action.payload.error;
    },
    resetMakeReceipt: (state) => {
      state.makeReceiptLoading = false;
      state.makeReceiptError = null;
      state.makeReceiptIsDone = null;
      state.makeReceiptCode = null;
    },
    resetGetReceiptParts: (state) => {
      state.getReceiptParts = [];
      state.getReceiptPartsLoading = false;
      state.getReceiptPartsError = null;
      state.getReceiptPartsIsDone = null;
    },
    resetUpdateReceiptPart: (state) => {
      state.updateReceiptPartLoading = false;
      state.updateReceiptPartError = null;
      state.updateReceiptPartIsDone = null;
    },
    resetUpdateReceipt: (state) => {
      state.updateReceiptLoading = false;
      state.updateReceiptError = null;
      state.updateReceiptIsDone = null;
    },
    resetGetStoreBins: (state) => {
      state.getStoreBinsLoading = false;
      state.getStoreBinsError = null;
      state.bins = [];
    },
    setReceiptError: (state, action: PayloadAction<{ error: string; isDone: boolean }>) => {
      state.error = action.payload.error;
      state.isDone = action.payload.isDone;
    },
    resetGetOneReceipt: (state) => {
      state.getReceipt = null;
      state.getReceiptLoading = false;
      state.getReceiptError = null;
    },
  },
  extraReducers: (builder) => {
    // makeReceipt
    builder
      .addCase(makeReceipt.pending, (state) => {
        state.makeReceiptLoading = true;
        state.makeReceiptError = null;
        state.makeReceiptIsDone = null;
        state.makeReceiptCode = null;
      })
      .addCase(makeReceipt.fulfilled, (state, action) => {
        state.makeReceiptLoading = false;
        state.makeReceiptError = null;
        state.makeReceiptIsDone = true;
        state.makeReceiptCode = action.payload.receiptCode;
      })
      .addCase(makeReceipt.rejected, (state, action) => {
        state.makeReceiptLoading = false;
        state.makeReceiptError = (action.payload as any)?.error || 'Failed to create receipt';
        state.makeReceiptIsDone = false;
        state.makeReceiptCode = null;
      })
      // getItReceipt
      .addCase(getItReceipt.pending, (state) => {
        state.receipts = [];
        state.receiptParts = [];
        state.receiptDocuments = [];
        state.isDone = null;
        state.loading = true;
        state.error = null;
      })
      .addCase(getItReceipt.fulfilled, (state, action) => {
        state.receipts = action.payload.receipts;
        state.receiptParts = [];
        state.receiptDocuments = [];
        state.isDone = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(getItReceipt.rejected, (state, action) => {
        state.receipts = [];
        state.receiptParts = [];
        state.receiptDocuments = [];
        state.isDone = false;
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to fetch receipts';
      })
      // GetOneReceipt
      .addCase(GetOneReceipt.pending, (state) => {
        state.getReceipt = null;
        state.getReceiptLoading = true;
        state.getReceiptError = null;
      })
      .addCase(GetOneReceipt.fulfilled, (state, action) => {
        state.getReceipt = action.payload.receipt;
        state.getReceiptLoading = false;
        state.getReceiptError = null;
      })
      .addCase(GetOneReceipt.rejected, (state, action) => {
        state.getReceipt = null;
        state.getReceiptLoading = false;
        state.getReceiptError = (action.payload as any)?.error || 'Failed to fetch receipt';
      })
      // getReceiptParts
      .addCase(getReceiptParts.pending, (state) => {
        state.getReceiptParts = [];
        state.getReceiptPartsLoading = true;
        state.getReceiptPartsError = null;
        state.getReceiptPartsIsDone = null;
      })
      .addCase(getReceiptParts.fulfilled, (state, action) => {
        state.getReceiptParts = action.payload.parts;
        state.getReceiptPartsLoading = false;
        state.getReceiptPartsError = null;
        state.getReceiptPartsIsDone = true;
      })
      .addCase(getReceiptParts.rejected, (state, action) => {
        state.getReceiptParts = [];
        state.getReceiptPartsLoading = false;
        state.getReceiptPartsError = (action.payload as any)?.error || 'Failed to fetch receipt parts';
        state.getReceiptPartsIsDone = false;
      })
      // updateReceiptPart
      .addCase(updateReceiptPart.pending, (state) => {
        state.updateReceiptPartLoading = true;
        state.updateReceiptPartError = null;
        state.updateReceiptPartIsDone = null;
      })
      .addCase(updateReceiptPart.fulfilled, (state) => {
        state.updateReceiptPartLoading = false;
        state.updateReceiptPartError = null;
        state.updateReceiptPartIsDone = true;
      })
      .addCase(updateReceiptPart.rejected, (state, action) => {
        state.updateReceiptPartLoading = false;
        state.updateReceiptPartError = (action.payload as any)?.error || 'Failed to update receipt part';
        state.updateReceiptPartIsDone = false;
      })
      // updateReceipt
      .addCase(updateReceipt.pending, (state) => {
        state.updateReceiptLoading = true;
        state.updateReceiptError = null;
        state.updateReceiptIsDone = null;
      })
      .addCase(updateReceipt.fulfilled, (state) => {
        state.updateReceiptLoading = false;
        state.updateReceiptError = null;
        state.updateReceiptIsDone = true;
      })
      .addCase(updateReceipt.rejected, (state, action) => {
        state.updateReceiptLoading = false;
        state.updateReceiptError = (action.payload as any)?.error || 'Failed to update receipt';
        state.updateReceiptIsDone = false;
      })
      // getReceiptImages
      .addCase(getReceiptImages.pending, (state) => {
        state.getReceiptImagesLoading = true;
        state.getReceiptImagesError = null;
        state.images = [];
      })
      .addCase(getReceiptImages.fulfilled, (state, action) => {
        state.getReceiptImagesLoading = false;
        state.getReceiptImagesError = null;
        state.images = action.payload.images;
      })
      .addCase(getReceiptImages.rejected, (state, action) => {
        state.getReceiptImagesLoading = false;
        state.getReceiptImagesError = (action.payload as any)?.error || 'Failed to fetch receipt images';
        state.images = [];
      })
      // GetStoreBins
      .addCase(GetStoreBins.pending, (state) => {
        state.getStoreBinsLoading = true;
        state.getStoreBinsError = null;
        state.bins = [];
      })
      .addCase(GetStoreBins.fulfilled, (state, action) => {
        state.getStoreBinsLoading = false;
        state.getStoreBinsError = null;
        state.bins = action.payload.bins;
      })
      .addCase(GetStoreBins.rejected, (state, action) => {
        state.getStoreBinsLoading = false;
        state.getStoreBinsError = (action.payload as any)?.error || 'Failed to fetch store bins';
        state.bins = [];
      });
  },
});

// Actions
export const {
  setError,
  resetMakeReceipt,
  resetGetReceiptParts,
  resetUpdateReceiptPart,
  resetUpdateReceipt,
  resetGetStoreBins,
  setReceiptError,
  resetGetOneReceipt,
} = receiptSlice.actions;

// Selectors
export const selectReceipts = (state: { receipt: ReceiptState }) => state.receipt.receipts;
export const selectReceiptLoading = (state: { receipt: ReceiptState }) => state.receipt.loading;
export const selectReceiptError = (state: { receipt: ReceiptState }) => state.receipt.error;
export const selectReceiptIsDone = (state: { receipt: ReceiptState }) => state.receipt.isDone;

export const selectGetReceipt = (state: { receipt: ReceiptState }) => state.receipt.getReceipt;
export const selectGetReceiptLoading = (state: { receipt: ReceiptState }) => state.receipt.getReceiptLoading;
export const selectGetReceiptError = (state: { receipt: ReceiptState }) => state.receipt.getReceiptError;

export const selectMakeReceiptLoading = (state: { receipt: ReceiptState }) => state.receipt.makeReceiptLoading;
export const selectMakeReceiptError = (state: { receipt: ReceiptState }) => state.receipt.makeReceiptError;
export const selectMakeReceiptIsDone = (state: { receipt: ReceiptState }) => state.receipt.makeReceiptIsDone;
export const selectMakeReceiptCode = (state: { receipt: ReceiptState }) => state.receipt.makeReceiptCode;

export const selectReceiptParts = (state: { receipt: ReceiptState }) => state.receipt.getReceiptParts;
export const selectReceiptPartsLoading = (state: { receipt: ReceiptState }) => state.receipt.getReceiptPartsLoading;
export const selectReceiptPartsError = (state: { receipt: ReceiptState }) => state.receipt.getReceiptPartsError;
export const selectReceiptPartsIsDone = (state: { receipt: ReceiptState }) => state.receipt.getReceiptPartsIsDone;

export const selectReceiptImages = (state: { receipt: ReceiptState }) => state.receipt.images;
export const selectReceiptImagesLoading = (state: { receipt: ReceiptState }) => state.receipt.getReceiptImagesLoading;
export const selectReceiptImagesError = (state: { receipt: ReceiptState }) => state.receipt.getReceiptImagesError;

export const selectStoreBins = (state: { receipt: ReceiptState }) => state.receipt.bins;
export const selectStoreBinsLoading = (state: { receipt: ReceiptState }) => state.receipt.getStoreBinsLoading;
export const selectStoreBinsError = (state: { receipt: ReceiptState }) => state.receipt.getStoreBinsError;

// Reducer
export default receiptSlice.reducer;