import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Types
interface Asset {
  OBJ_CODE: string;
  OBJ_PART: string;
  OBJ_BIN: string;
  OBJ_LOT: string;
  OBJ_STORE: string;
  OBJ_LOCATION: string;
  OBJ_TRAN_TYPE: string;
  OBJ_STATUS: string;
  STR_DESC: string;
  LOC_DESC: string;
  STR_ORG: string;
  LOC_ORG: string;
  _USERCLASS?: string;
  TEMP?: string;
}

interface IssueReturnState {
  getAsset: Asset[];
  getAssetLoading: boolean;
  getAssetError: string | null;
  getAssetIsDone: boolean | null;

  makePartIssueLoading: boolean;
  makePartIssueError: string | null;
  makePartIssueIsDone: boolean | null;

  makePartReturnLoading: boolean;
  makePartReturnError: string | null;
  makePartReturnIsDone: boolean | null;
}

// Initial state
const initialState: IssueReturnState = {
  getAsset: [],
  getAssetLoading: false,
  getAssetError: null,
  getAssetIsDone: null,

  makePartIssueLoading: false,
  makePartIssueError: null,
  makePartIssueIsDone: null,

  makePartReturnLoading: false,
  makePartReturnError: null,
  makePartReturnIsDone: null,
};

// Async thunks
export const makePartIssue = createAsyncThunk(
  'issueReturn/makePartIssue',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('ISSUE_RETURN', 'MAKE_PART_ISSUE', request);

      if (response.status === 1 && response.data) {
        return { status: 1, message: 'Part issue created successfully' };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to create part issue' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to create part issue' });
    }
  }
);

export const makePartReturn = createAsyncThunk(
  'issueReturn/makePartReturn',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('ISSUE_RETURN', 'MAKE_PART_RETURN', request);

      if (response.status === 1 && response.data) {
        return { status: 1, message: 'Part return created successfully' };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to create part return' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to create part return' });
    }
  }
);

export const getAsset = createAsyncThunk(
  'issueReturn/getAsset',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('ISSUE_RETURN', 'GET_ASSET', request);

      if (response.status === 1 && response.asset) {
        return { status: 1, asset: response.asset };
      } else {
        return rejectWithValue({ error: response.error || 'Failed to fetch asset' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch asset' });
    }
  }
);

// Slice
const issueReturnSlice = createSlice({
  name: 'issueReturn',
  initialState,
  reducers: {
    resetMakePartIssue: (state) => {
      state.makePartIssueLoading = false;
      state.makePartIssueError = null;
      state.makePartIssueIsDone = null;
    },
    resetMakePartReturn: (state) => {
      state.makePartReturnLoading = false;
      state.makePartReturnError = null;
      state.makePartReturnIsDone = null;
    },
    resetGetAsset: (state) => {
      state.getAsset = [];
      state.getAssetLoading = false;
      state.getAssetError = null;
      state.getAssetIsDone = null;
    },
  },
  extraReducers: (builder) => {
    // makePartIssue
    builder
      .addCase(makePartIssue.pending, (state) => {
        state.makePartIssueLoading = true;
        state.makePartIssueError = null;
        state.makePartIssueIsDone = null;
      })
      .addCase(makePartIssue.fulfilled, (state) => {
        state.makePartIssueLoading = false;
        state.makePartIssueError = null;
        state.makePartIssueIsDone = true;
      })
      .addCase(makePartIssue.rejected, (state, action) => {
        state.makePartIssueLoading = false;
        state.makePartIssueError = (action.payload as any)?.error || 'Failed to create part issue';
        state.makePartIssueIsDone = false;
      })
      // makePartReturn
      .addCase(makePartReturn.pending, (state) => {
        state.makePartReturnLoading = true;
        state.makePartReturnError = null;
        state.makePartReturnIsDone = null;
      })
      .addCase(makePartReturn.fulfilled, (state) => {
        state.makePartReturnLoading = false;
        state.makePartReturnError = null;
        state.makePartReturnIsDone = true;
      })
      .addCase(makePartReturn.rejected, (state, action) => {
        state.makePartReturnLoading = false;
        state.makePartReturnError = (action.payload as any)?.error || 'Failed to create part return';
        state.makePartReturnIsDone = false;
      })
      // getAsset
      .addCase(getAsset.pending, (state) => {
        state.getAsset = [];
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
        state.getAsset = [];
        state.getAssetLoading = false;
        state.getAssetError = (action.payload as any)?.error || 'Failed to fetch asset';
        state.getAssetIsDone = false;
      });
  },
});

// Actions
export const { resetMakePartIssue, resetMakePartReturn, resetGetAsset } = issueReturnSlice.actions;

// Selectors
export const selectGetAsset = (state: { issueReturn: IssueReturnState }) => state.issueReturn.getAsset;
export const selectGetAssetLoading = (state: { issueReturn: IssueReturnState }) => state.issueReturn.getAssetLoading;
export const selectGetAssetError = (state: { issueReturn: IssueReturnState }) => state.issueReturn.getAssetError;
export const selectGetAssetIsDone = (state: { issueReturn: IssueReturnState }) => state.issueReturn.getAssetIsDone;

export const selectMakePartIssueLoading = (state: { issueReturn: IssueReturnState }) => state.issueReturn.makePartIssueLoading;
export const selectMakePartIssueError = (state: { issueReturn: IssueReturnState }) => state.issueReturn.makePartIssueError;
export const selectMakePartIssueIsDone = (state: { issueReturn: IssueReturnState }) => state.issueReturn.makePartIssueIsDone;

export const selectMakePartReturnLoading = (state: { issueReturn: IssueReturnState }) => state.issueReturn.makePartReturnLoading;
export const selectMakePartReturnError = (state: { issueReturn: IssueReturnState }) => state.issueReturn.makePartReturnError;
export const selectMakePartReturnIsDone = (state: { issueReturn: IssueReturnState }) => state.issueReturn.makePartReturnIsDone;

// Reducer
export default issueReturnSlice.reducer;