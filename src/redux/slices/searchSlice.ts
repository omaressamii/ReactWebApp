import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';
import axios from 'axios';
import API from '../../constants/api';

// Types - Updated to match mobile app data structures
interface Person {
  PER_CODE: string;
  PER_DESC: string;
  PER_TRADE?: string;
}

interface Part {
  PAR_CODE: string;
  PAR_DESC: string;
  BIS_QTY: number;
  PAR_ORG: string;
}

interface Requisition {
  id: string;
  number: string;
  status: string;
  // Add other requisition properties as needed
}

interface Printer {
  id: string;
  name: string;
  location: string;
  // Add other printer properties as needed
}

interface Asset {
  id: string;
  OBJ_CODE: string;
  name: string;
  // Add other asset properties as needed
}

interface SearchState {
  persons: Person[];
  personLoading: boolean;
  personError: string | null;

  parts: Part[];
  partLoading: boolean;
  partError: string | null;

  issueRequisitions: Requisition[];
  issueRequisitionsLoading: boolean;
  issueRequisitionsError: string | null;

  receiptRequisitions: Requisition[];
  receiptRequisitionsLoading: boolean;
  receiptRequisitionsError: string | null;

  getPrinters: Printer[];
  getPrintersLoading: boolean;
  getPrintersError: string | null;
  getPrintersIsDone: boolean | null;

  findAsset: Asset | null;
  findAssetLoading: boolean;
  findAssetError: string | null;
  findAssetIsDone: boolean | null;
}

// Initial state
const initialState: SearchState = {
  persons: [],
  personLoading: false,
  personError: null,

  parts: [],
  partLoading: false,
  partError: null,

  issueRequisitions: [],
  issueRequisitionsLoading: false,
  issueRequisitionsError: null,

  receiptRequisitions: [],
  receiptRequisitionsLoading: false,
  receiptRequisitionsError: null,

  getPrinters: [],
  getPrintersLoading: false,
  getPrintersError: null,
  getPrintersIsDone: null,

  findAsset: null,
  findAssetLoading: false,
  findAssetError: null,
  findAssetIsDone: null,
};

// Async thunks
export const getPersons = createAsyncThunk(
  'search/getPersons',
  async ({ value }: { value: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('SEARCH', 'PERSON', { searchValue: value });

      if (response.status === 1 && response.persons) {
        return { persons: response.persons };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch persons' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch persons' });
    }
  }
);

export const getParts = createAsyncThunk(
  'search/getParts',
  async (search: any, { rejectWithValue }) => {
    try {
      // Use axios directly like Expo app - searchValue as query param, search object in body
      const response = await axios.post(
        `http://localhost:8081/search/getPart?searchValue=${encodeURIComponent(search.search.value)}`,
        search,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.status === 1 && response.data.parts) {
        return { parts: response.data.parts };
      } else {
        return rejectWithValue({ error: response.data.message || 'Failed to fetch parts' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch parts' });
    }
  }
);

export const getIssueRequisitions = createAsyncThunk(
  'search/getIssueRequisitions',
  async (search: any, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('SEARCH', 'REQUISITIONS', { q: search.search?.value, type: 'issue' });

      if (response.status === 1 && response.requisitions) {
        return { requisitions: response.requisitions };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch issue requisitions' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch issue requisitions' });
    }
  }
);

export const getReceiptRequisitions = createAsyncThunk(
  'search/getReceiptRequisitions',
  async (search: any, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('SEARCH', 'REQUISITIONS', { q: search.search?.value, type: 'receipt' });

      if (response.status === 1 && response.requisitions) {
        return { requisitions: response.requisitions };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch receipt requisitions' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch receipt requisitions' });
    }
  }
);

export const getPrinters = createAsyncThunk(
  'search/getPrinters',
  async (search: any, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('SEARCH', 'GLOBAL', { q: search.search?.value, type: 'printers' });

      if (response.status === 1 && response.printers) {
        return { printers: response.printers };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch printers' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch printers' });
    }
  }
);

export const findAsset = createAsyncThunk(
  'search/findAsset',
  async (search: any, { rejectWithValue }) => {
    try {
      console.log('🔍 [Redux.findAsset] Starting asset search request', {
        timestamp: new Date().toISOString(),
        searchParams: search,
        assetCode: search.assetCode
      });

      const response = await apiService.getByEndpoint('SEARCH', 'ASSETS', { q: search.assetCode });

      if (response.status === 1 && response.asset) {
        console.log('✅ [Redux.findAsset] Asset search successful', {
          assetCode: search.assetCode,
          returnedAsset: response.asset,
        });

        return { asset: response.asset };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to find asset' });
      }
    } catch (error: any) {
      console.error('❌ [Redux.findAsset] Network or other error', {
        assetCode: search.assetCode,
        error: error.message,
      });
      return rejectWithValue({ error: error.message || 'Failed to find asset' });
    }
  }
);

// Slice
const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setPersonError: (state, action: PayloadAction<{ error: string }>) => {
      state.personError = action.payload.error;
    },
    resetPerson: (state) => {
      state.persons = [];
      state.personLoading = false;
      state.personError = null;
    },
    resetPart: (state) => {
      state.parts = [];
      state.partLoading = false;
      state.partError = null;
    },
    resetGetPrinters: (state) => {
      state.getPrinters = [];
      state.getPrintersLoading = false;
      state.getPrintersError = null;
      state.getPrintersIsDone = null;
    },
    resetFindAsset: (state) => {
      state.findAsset = null;
      state.findAssetLoading = false;
      state.findAssetError = null;
      state.findAssetIsDone = null;
    },
  },
  extraReducers: (builder) => {
    // getPersons
    builder
      .addCase(getPersons.pending, (state) => {
        state.persons = [];
        state.personLoading = true;
        state.personError = null;
      })
      .addCase(getPersons.fulfilled, (state, action) => {
        state.persons = action.payload.persons;
        state.personLoading = false;
        state.personError = null;
      })
      .addCase(getPersons.rejected, (state, action) => {
        state.persons = [];
        state.personLoading = false;
        state.personError = (action.payload as any)?.error || 'Failed to fetch persons';
      })
      // getParts
      .addCase(getParts.pending, (state) => {
        state.parts = [];
        state.partLoading = true;
        state.partError = null;
      })
      .addCase(getParts.fulfilled, (state, action) => {
        state.parts = action.payload.parts;
        state.partLoading = false;
        state.partError = null;
      })
      .addCase(getParts.rejected, (state, action) => {
        state.parts = [];
        state.partLoading = false;
        state.partError = (action.payload as any)?.error || 'Failed to fetch parts';
      })
      // getIssueRequisitions
      .addCase(getIssueRequisitions.pending, (state) => {
        state.issueRequisitions = [];
        state.issueRequisitionsLoading = true;
        state.issueRequisitionsError = null;
      })
      .addCase(getIssueRequisitions.fulfilled, (state, action) => {
        state.issueRequisitions = action.payload.requisitions;
        state.issueRequisitionsLoading = false;
        state.issueRequisitionsError = null;
      })
      .addCase(getIssueRequisitions.rejected, (state, action) => {
        state.issueRequisitions = [];
        state.issueRequisitionsLoading = false;
        state.issueRequisitionsError = (action.payload as any)?.error || 'Failed to fetch issue requisitions';
      })
      // getReceiptRequisitions
      .addCase(getReceiptRequisitions.pending, (state) => {
        state.receiptRequisitions = [];
        state.receiptRequisitionsLoading = true;
        state.receiptRequisitionsError = null;
      })
      .addCase(getReceiptRequisitions.fulfilled, (state, action) => {
        state.receiptRequisitions = action.payload.requisitions;
        state.receiptRequisitionsLoading = false;
        state.receiptRequisitionsError = null;
      })
      .addCase(getReceiptRequisitions.rejected, (state, action) => {
        state.receiptRequisitions = [];
        state.receiptRequisitionsLoading = false;
        state.receiptRequisitionsError = (action.payload as any)?.error || 'Failed to fetch receipt requisitions';
      })
      // getPrinters
      .addCase(getPrinters.pending, (state) => {
        state.getPrinters = [];
        state.getPrintersLoading = true;
        state.getPrintersError = null;
        state.getPrintersIsDone = null;
      })
      .addCase(getPrinters.fulfilled, (state, action) => {
        state.getPrinters = action.payload.printers;
        state.getPrintersLoading = false;
        state.getPrintersError = null;
        state.getPrintersIsDone = true;
      })
      .addCase(getPrinters.rejected, (state, action) => {
        state.getPrinters = [];
        state.getPrintersLoading = false;
        state.getPrintersError = (action.payload as any)?.error || 'Failed to fetch printers';
        state.getPrintersIsDone = false;
      })
      // findAsset
      .addCase(findAsset.pending, (state) => {
        state.findAsset = null;
        state.findAssetLoading = true;
        state.findAssetError = null;
        state.findAssetIsDone = null;
      })
      .addCase(findAsset.fulfilled, (state, action) => {
        state.findAsset = action.payload.asset;
        state.findAssetLoading = false;
        state.findAssetError = null;
        state.findAssetIsDone = true;
      })
      .addCase(findAsset.rejected, (state, action) => {
        state.findAsset = null;
        state.findAssetLoading = false;
        state.findAssetError = (action.payload as any)?.error || 'Failed to find asset';
        state.findAssetIsDone = false;
      });
  },
});

// Actions
export const { setPersonError, resetPerson, resetPart, resetGetPrinters, resetFindAsset } = searchSlice.actions;

// Selectors
export const selectPersons = (state: { search: SearchState }) => state.search.persons;
export const selectPersonLoading = (state: { search: SearchState }) => state.search.personLoading;
export const selectPersonError = (state: { search: SearchState }) => state.search.personError;

export const selectParts = (state: { search: SearchState }) => state.search.parts;
export const selectPartLoading = (state: { search: SearchState }) => state.search.partLoading;
export const selectPartError = (state: { search: SearchState }) => state.search.partError;

export const selectIssueRequisitions = (state: { search: SearchState }) => state.search.issueRequisitions;
export const selectIssueRequisitionsLoading = (state: { search: SearchState }) => state.search.issueRequisitionsLoading;
export const selectIssueRequisitionsError = (state: { search: SearchState }) => state.search.issueRequisitionsError;

export const selectReceiptRequisitions = (state: { search: SearchState }) => state.search.receiptRequisitions;
export const selectReceiptRequisitionsLoading = (state: { search: SearchState }) => state.search.receiptRequisitionsLoading;
export const selectReceiptRequisitionsError = (state: { search: SearchState }) => state.search.receiptRequisitionsError;

export const selectPrinters = (state: { search: SearchState }) => state.search.getPrinters;
export const selectPrintersLoading = (state: { search: SearchState }) => state.search.getPrintersLoading;
export const selectPrintersError = (state: { search: SearchState }) => state.search.getPrintersError;
export const selectPrintersIsDone = (state: { search: SearchState }) => state.search.getPrintersIsDone;

export const selectFindAsset = (state: { search: SearchState }) => state.search.findAsset;
export const selectFindAssetLoading = (state: { search: SearchState }) => state.search.findAssetLoading;
export const selectFindAssetError = (state: { search: SearchState }) => state.search.findAssetError;
export const selectFindAssetIsDone = (state: { search: SearchState }) => state.search.findAssetIsDone;

// Reducer
export default searchSlice.reducer;