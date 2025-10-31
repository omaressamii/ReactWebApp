import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Types - Updated to match exact backend data structures from mobile app
export interface Issue {
  issue_code: string;
  issue_description: string;
  issue_created_byId: string;
  issue_created_byName: string;
  issue_created_date: string;
  issue_created_ip: string;
  issue_created_vlan: number;
  issue_created_locationCode: string;
  issue_created_locationDesc: string;
  issue_created_toOrganization: string;
  issue_created_requisition_code: string;
  issue_created_requisition_desc: string;
  issue_created_requisition_fromStoreCode: string;
  issue_created_requisition_fromStoreDesc: string;
  issue_created_requisition_fromStoreOrg: string;
  issue_created_requisition_toStoreCode: string;
  issue_created_requisition_toStoreDesc: string;
  issue_created_requisition_toStoreOrg: string;
  issue_infor_usergroup: string;
  issue_unfinished_byId: string;
  issue_unfinished_byName: string;
  issue_unfinished_ip: string;
  issue_unfinished_vlan: number;
  issue_unfinished_locationCode: string;
  issue_unfinished_locationDesc: string;
  issue_unfinished_date: string;
  issue_status_code: string;
  issue_status_desc: string;
  issue_delete: string;
  // Additional computed fields
  transactionstatus_display?: string;
  transactionrstatus?: string;
  transactionstatus?: string;
  organization?: string;
  fromStoreOrg?: string;
  toStoreOrg?: string;
}

export interface IssuePart {
  PAR_CODE: string;
  PAR_DESC: string;
  TRL_QTY_REQUESTED: number;
  TRL_QTY_ISSUED: number;
  TRL_OBJECT: string;
  PAR_BYASSET: string;
  Confirmed: string;
  // Additional fields from backend
  TRL_LINE: number;
  TRL_PART: string;
  TRL_DESC: string;
  TRL_UOM: string;
  TRL_COST: number;
  TRL_TOTAL: number;
}

export interface IssueImage {
  id: string;
  path: string;
  documentInforType: string;
  image_entity: string;
  name: string;
  type: string;
  // Additional fields
  created_date?: string;
  created_by?: string;
}

export interface Requisition {
  requisitioncode: string;
  description: string;
  fromstore: string;
  tostore: string;
  FromStoreOrg: string;
  ToStoreOrg: string;
  status: string;
  created_date: string;
  // Additional fields from mobile app
  requisition_description?: string;
}

interface IssueState {
  issues: Issue[];
  requisitions: Requisition[];
  issueParts: IssuePart[];
  issueDocuments: any[];
  isDone: boolean | null;
  loading: boolean;
  error: string | null;

  getIssue: Issue | null;
  getIssueLoading: boolean;
  getIssueError: string | null;

  makeIssueLoading: boolean;
  makeIssueError: string | null;
  makeIssueIsDone: boolean | null;
  makeIssueCode: string | null;

  getIssueParts: IssuePart[];
  getIssueHasWoAssets: any[];
  getIssuePartsLoading: boolean;
  getIssuePartsError: string | null;
  getIssuePartsIsDone: boolean | null;

  updateIssuePartLoading: boolean;
  updateIssuePartError: string | null;
  updateIssuePartIsDone: boolean | null;

  updateIssueLoading: boolean;
  updateIssueError: string | null;
  updateIssueIsDone: boolean | null;

  getIssueImagesLoading: boolean;
  getIssueImagesError: string | null;
  images: IssueImage[];

  confirmIssuePartLoading: boolean;
  confirmIssuePartError: string | null;
  confirmIssuePartIsDone: boolean | null;

  getAssetCodes: any[];
  getAssetCodesLoading: boolean;
  getAssetCodesError: string | null;
  getAssetCodesIsDone: boolean | null;

  printIssueLoading: boolean;
  printIssueError: string | null;
  printIssueIsDone: boolean | null;
}

// Initial state
const initialState: IssueState = {
  issues: [],
  requisitions: [],
  issueParts: [],
  issueDocuments: [],
  isDone: null,
  loading: false,
  error: null,

  getIssue: null,
  getIssueLoading: false,
  getIssueError: null,

  makeIssueLoading: false,
  makeIssueError: null,
  makeIssueIsDone: null,
  makeIssueCode: null,

  getIssueParts: [],
  getIssueHasWoAssets: [],
  getIssuePartsLoading: false,
  getIssuePartsError: null,
  getIssuePartsIsDone: null,

  updateIssuePartLoading: false,
  updateIssuePartError: null,
  updateIssuePartIsDone: null,

  updateIssueLoading: false,
  updateIssueError: null,
  updateIssueIsDone: null,

  getIssueImagesLoading: false,
  getIssueImagesError: null,
  images: [],

  confirmIssuePartLoading: false,
  confirmIssuePartError: null,
  confirmIssuePartIsDone: null,

  getAssetCodes: [],
  getAssetCodesLoading: false,
  getAssetCodesError: null,
  getAssetCodesIsDone: null,

  printIssueLoading: false,
  printIssueError: null,
  printIssueIsDone: null,
};

// Async thunks
export const makeIssue = createAsyncThunk(
  'issue/makeIssue',
  async (request: any, { rejectWithValue }) => {
    try {
      // For file uploads, we need to use the direct axios call with FormData
      // since apiService.postByEndpoint doesn't handle multipart/form-data
      const formData = new FormData();
      formData.append('user', JSON.stringify(request.user));
      formData.append('ip', request.ip);
      formData.append('issue', JSON.stringify(request.issue));
      formData.append('requisition', JSON.stringify(request.requisition));
      formData.append('document', JSON.stringify(request.document));

      // Add image if present
      if (request.other?.selectedImage) {
        formData.append('image', request.other.selectedImage, 'image.jpg');
      }

      const response = await apiService.post('/issue/MakeIssue', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 1 && response.data) {
        return { issueCode: response.data.issueCode || response.data.code };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to create issue' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to create issue' });
    }
  }
);

export const getIssueRequisitions = createAsyncThunk(
  'issue/getIssueRequisitions',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('REQUISITION', 'LIST', params);

      if (response.status === 1 && response.data) {
        // Transform API response to match issueSlice Requisition interface
        const transformedRequisitions = (response.data.requisitions || []).map((req: any) => ({
          requisitioncode: req.requisition_code,
          description: req.requisition_description,
          fromstore: req.requisition_created_fromStoreDesc,
          tostore: req.requisition_created_toStoreDesc,
          FromStoreOrg: req.requisition_created_fromStoreOrg,
          ToStoreOrg: req.requisition_created_toStoreOrg,
          status: req.requisition_status_desc,
          created_date: req.requisition_created_date,
          requisition_description: req.requisition_description,
        }));

        return { requisitions: transformedRequisitions };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch requisitions' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch requisitions' });
    }
  }
);

export const getItIssue = createAsyncThunk(
  'issue/getItIssue',
  async (user: any, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('ISSUE', 'LIST', { user });

      if (response.status === 1 && response.data) {
        return { issues: response.data.issues || [] };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch issues' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch issues' });
    }
  }
);

export const GetOneIssue = createAsyncThunk(
  'issue/GetOneIssue',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('ISSUE', 'DETAILS', { id: data.id });

      if (response.status === 1 && response.data) {
        return { issue: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch issue' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch issue' });
    }
  }
);

export const getIssueParts = createAsyncThunk(
  'issue/getIssueParts',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('ISSUE', 'PARTS', { id: request.issueId });

      if (response.status === 1 && response.data) {
        return { parts: response.data.parts || response.data, hasWoAssets: response.data.hasWoAssets || [] };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch issue parts' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch issue parts' });
    }
  }
);

export const updateIssueParts = createAsyncThunk(
  'issue/updateIssueParts',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.putByEndpoint('ISSUE', 'PARTS', request, { id: request.issueId });

      if (response.status === 1) {
        return { message: response.message || 'Issue parts updated successfully' };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to update issue parts' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to update issue parts' });
    }
  }
);

export const updateIssue = createAsyncThunk(
  'issue/updateIssue',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.putByEndpoint('ISSUE', 'UPDATE', request, { id: request.id });

      if (response.status === 1) {
        return { message: response.message || 'Issue updated successfully' };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to update issue' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to update issue' });
    }
  }
);

export const getIssueImages = createAsyncThunk(
  'issue/getIssueImages',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('ISSUE', 'IMAGES', request);

      if (response.status === 1 && response.data) {
        return { images: response.data.images || response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch issue images' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch issue images' });
    }
  }
);

export const ConfirmIssuePart = createAsyncThunk(
  'issue/ConfirmIssuePart',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('ISSUE', 'RETURN', request);

      if (response.status === 1) {
        return { message: response.message || 'Issue part confirmed successfully' };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to confirm issue part' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to confirm issue part' });
    }
  }
);

export const getAssetCodes = createAsyncThunk(
  'issue/getAssetCodes',
  async (request: any, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call when API is configured
      // const response = await axios.post(`${API_BASE_URL}/issue/selectAllAssetCodes`, request, {
      //   headers: { 'Content-Type': 'application/json' },
      // });

      // Mock response for now
      const mockAssetCodes = [
        { code: 'ASSET001', name: 'Asset 1' },
        { code: 'ASSET002', name: 'Asset 2' },
      ];

      return { status: 1, partAssetCodes: mockAssetCodes };
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch asset codes' });
    }
  }
);

export const printIssue = createAsyncThunk(
  'issue/printIssue',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('ISSUE', 'PRINT', request);

      if (response.status === 1) {
        return { message: response.message || 'Issue printed successfully' };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to print issue' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to print issue' });
    }
  }
);

// Slice
const issueSlice = createSlice({
  name: 'issue',
  initialState,
  reducers: {
    setError: (state, action: PayloadAction<{ error: string }>) => {
      state.error = action.payload.error;
    },
    resetMakeIssue: (state) => {
      state.makeIssueLoading = false;
      state.makeIssueError = null;
      state.makeIssueIsDone = null;
      state.makeIssueCode = null;
    },
    resetGetIssueParts: (state) => {
      state.getIssueParts = [];
      state.getIssueHasWoAssets = [];
      state.getIssuePartsLoading = false;
      state.getIssuePartsError = null;
      state.getIssuePartsIsDone = null;
    },
    resetUpdateIssueParts: (state) => {
      state.updateIssuePartLoading = false;
      state.updateIssuePartError = null;
      state.updateIssuePartIsDone = null;
    },
    resetUpdateIssue: (state) => {
      state.updateIssueLoading = false;
      state.updateIssueError = null;
      state.updateIssueIsDone = null;
    },
    resetGetAssetCodes: (state) => {
      state.getAssetCodes = [];
      state.getAssetCodesLoading = false;
      state.getAssetCodesError = null;
      state.getAssetCodesIsDone = null;
    },
    setIssueError: (state, action: PayloadAction<{ error: string; isDone: boolean }>) => {
      state.error = action.payload.error;
      state.isDone = action.payload.isDone;
    },
    resetGetIssue: (state) => {
      state.getIssue = null;
      state.getIssueLoading = false;
      state.getIssueError = null;
    },
    resetPrintIssue: (state) => {
      state.printIssueLoading = false;
      state.printIssueError = null;
      state.printIssueIsDone = null;
    },
  },
  extraReducers: (builder) => {
    // makeIssue
    builder
      .addCase(makeIssue.pending, (state) => {
        state.makeIssueLoading = true;
        state.makeIssueError = null;
        state.makeIssueIsDone = null;
        state.makeIssueCode = null;
      })
      .addCase(makeIssue.fulfilled, (state, action) => {
        state.makeIssueLoading = false;
        state.makeIssueError = null;
        state.makeIssueIsDone = true;
        state.makeIssueCode = action.payload.issueCode;
      })
      .addCase(makeIssue.rejected, (state, action) => {
        state.makeIssueLoading = false;
        state.makeIssueError = (action.payload as any)?.error || 'Failed to create issue';
        state.makeIssueIsDone = false;
        state.makeIssueCode = null;
      })
      // getItIssue
      .addCase(getItIssue.pending, (state) => {
        state.issues = [];
        state.issueParts = [];
        state.issueDocuments = [];
        state.isDone = null;
        state.loading = true;
        state.error = null;
      })
      .addCase(getItIssue.fulfilled, (state, action) => {
        state.issues = action.payload.issues;
        state.issueParts = [];
        state.issueDocuments = [];
        state.isDone = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(getItIssue.rejected, (state, action) => {
        state.issues = [];
        state.issueParts = [];
        state.issueDocuments = [];
        state.isDone = false;
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to fetch issues';
      })
      // getIssueRequisitions
      .addCase(getIssueRequisitions.pending, (state) => {
        state.requisitions = [];
      })
      .addCase(getIssueRequisitions.fulfilled, (state, action) => {
        state.requisitions = action.payload.requisitions;
      })
      .addCase(getIssueRequisitions.rejected, (state, action) => {
        state.requisitions = [];
        state.error = (action.payload as any)?.error || 'Failed to fetch requisitions';
      })
      // GetOneIssue
      .addCase(GetOneIssue.pending, (state) => {
        state.getIssue = null;
        state.getIssueLoading = true;
        state.getIssueError = null;
      })
      .addCase(GetOneIssue.fulfilled, (state, action) => {
        state.getIssue = action.payload.issue;
        state.getIssueLoading = false;
        state.getIssueError = null;
      })
      .addCase(GetOneIssue.rejected, (state, action) => {
        state.getIssue = null;
        state.getIssueLoading = false;
        state.getIssueError = (action.payload as any)?.error || 'Failed to fetch issue';
      })
      // getIssueParts
      .addCase(getIssueParts.pending, (state) => {
        state.getIssueParts = [];
        state.getIssueHasWoAssets = [];
        state.getIssuePartsLoading = true;
        state.getIssuePartsError = null;
        state.getIssuePartsIsDone = null;
      })
      .addCase(getIssueParts.fulfilled, (state, action) => {
        state.getIssueParts = action.payload.parts;
        state.getIssueHasWoAssets = action.payload.hasWoAssets;
        state.getIssuePartsLoading = false;
        state.getIssuePartsError = null;
        state.getIssuePartsIsDone = true;
      })
      .addCase(getIssueParts.rejected, (state, action) => {
        state.getIssueParts = [];
        state.getIssueHasWoAssets = [];
        state.getIssuePartsLoading = false;
        state.getIssuePartsError = (action.payload as any)?.error || 'Failed to fetch issue parts';
        state.getIssuePartsIsDone = false;
      })
      // updateIssueParts
      .addCase(updateIssueParts.pending, (state) => {
        state.updateIssuePartLoading = true;
        state.updateIssuePartError = null;
        state.updateIssuePartIsDone = null;
      })
      .addCase(updateIssueParts.fulfilled, (state) => {
        state.updateIssuePartLoading = false;
        state.updateIssuePartError = null;
        state.updateIssuePartIsDone = true;
      })
      .addCase(updateIssueParts.rejected, (state, action) => {
        state.updateIssuePartLoading = false;
        state.updateIssuePartError = (action.payload as any)?.error || 'Failed to update issue parts';
        state.updateIssuePartIsDone = false;
      })
      // updateIssue
      .addCase(updateIssue.pending, (state) => {
        state.updateIssueLoading = true;
        state.updateIssueError = null;
        state.updateIssueIsDone = null;
      })
      .addCase(updateIssue.fulfilled, (state) => {
        state.updateIssueLoading = false;
        state.updateIssueError = null;
        state.updateIssueIsDone = true;
      })
      .addCase(updateIssue.rejected, (state, action) => {
        state.updateIssueLoading = false;
        state.updateIssueError = (action.payload as any)?.error || 'Failed to update issue';
        state.updateIssueIsDone = false;
      })
      // getIssueImages
      .addCase(getIssueImages.pending, (state) => {
        state.getIssueImagesLoading = true;
        state.getIssueImagesError = null;
        state.images = [];
      })
      .addCase(getIssueImages.fulfilled, (state, action) => {
        state.getIssueImagesLoading = false;
        state.getIssueImagesError = null;
        state.images = action.payload.images;
      })
      .addCase(getIssueImages.rejected, (state, action) => {
        state.getIssueImagesLoading = false;
        state.getIssueImagesError = (action.payload as any)?.error || 'Failed to fetch issue images';
        state.images = [];
      })
      // ConfirmIssuePart
      .addCase(ConfirmIssuePart.pending, (state) => {
        state.confirmIssuePartLoading = true;
        state.confirmIssuePartError = null;
        state.confirmIssuePartIsDone = null;
      })
      .addCase(ConfirmIssuePart.fulfilled, (state) => {
        state.confirmIssuePartLoading = false;
        state.confirmIssuePartError = null;
        state.confirmIssuePartIsDone = true;
      })
      .addCase(ConfirmIssuePart.rejected, (state, action) => {
        state.confirmIssuePartLoading = false;
        state.confirmIssuePartError = (action.payload as any)?.error || 'Failed to confirm issue part';
        state.confirmIssuePartIsDone = false;
      })
      // getAssetCodes
      .addCase(getAssetCodes.pending, (state) => {
        state.getAssetCodes = [];
        state.getAssetCodesLoading = true;
        state.getAssetCodesError = null;
        state.getAssetCodesIsDone = null;
      })
      .addCase(getAssetCodes.fulfilled, (state, action) => {
        state.getAssetCodes = action.payload.partAssetCodes;
        state.getAssetCodesLoading = false;
        state.getAssetCodesError = null;
        state.getAssetCodesIsDone = true;
      })
      .addCase(getAssetCodes.rejected, (state, action) => {
        state.getAssetCodes = [];
        state.getAssetCodesLoading = false;
        state.getAssetCodesError = (action.payload as any)?.error || 'Failed to fetch asset codes';
        state.getAssetCodesIsDone = false;
      })
      // printIssue
      .addCase(printIssue.pending, (state) => {
        state.printIssueLoading = true;
        state.printIssueError = null;
        state.printIssueIsDone = null;
      })
      .addCase(printIssue.fulfilled, (state) => {
        state.printIssueLoading = false;
        state.printIssueError = null;
        state.printIssueIsDone = true;
      })
      .addCase(printIssue.rejected, (state, action) => {
        state.printIssueLoading = false;
        state.printIssueError = (action.payload as any)?.error || 'Failed to print issue';
        state.printIssueIsDone = false;
      });
  },
});

// Actions
export const {
  setError,
  resetMakeIssue,
  resetGetIssueParts,
  resetUpdateIssueParts,
  resetUpdateIssue,
  resetGetAssetCodes,
  setIssueError,
  resetGetIssue,
  resetPrintIssue,
} = issueSlice.actions;

// Selectors
export const selectIssues = (state: { issue: IssueState }) => state.issue.issues;
export const selectIssueLoading = (state: { issue: IssueState }) => state.issue.loading;
export const selectIssueError = (state: { issue: IssueState }) => state.issue.error;
export const selectIssueIsDone = (state: { issue: IssueState }) => state.issue.isDone;

export const selectGetIssue = (state: { issue: IssueState }) => state.issue.getIssue;
export const selectGetIssueLoading = (state: { issue: IssueState }) => state.issue.getIssueLoading;
export const selectGetIssueError = (state: { issue: IssueState }) => state.issue.getIssueError;

export const selectMakeIssueLoading = (state: { issue: IssueState }) => state.issue.makeIssueLoading;
export const selectMakeIssueError = (state: { issue: IssueState }) => state.issue.makeIssueError;
export const selectMakeIssueIsDone = (state: { issue: IssueState }) => state.issue.makeIssueIsDone;
export const selectMakeIssueCode = (state: { issue: IssueState }) => state.issue.makeIssueCode;

export const selectIssueParts = (state: { issue: IssueState }) => state.issue.getIssueParts;
export const selectIssuePartsLoading = (state: { issue: IssueState }) => state.issue.getIssuePartsLoading;
export const selectIssuePartsError = (state: { issue: IssueState }) => state.issue.getIssuePartsError;
export const selectIssuePartsIsDone = (state: { issue: IssueState }) => state.issue.getIssuePartsIsDone;

export const selectIssueImages = (state: { issue: IssueState }) => state.issue.images;
export const selectIssueImagesLoading = (state: { issue: IssueState }) => state.issue.getIssueImagesLoading;
export const selectIssueImagesError = (state: { issue: IssueState }) => state.issue.getIssueImagesError;

export const selectAssetCodes = (state: { issue: IssueState }) => state.issue.getAssetCodes;
export const selectAssetCodesLoading = (state: { issue: IssueState }) => state.issue.getAssetCodesLoading;
export const selectAssetCodesError = (state: { issue: IssueState }) => state.issue.getAssetCodesError;
export const selectAssetCodesIsDone = (state: { issue: IssueState }) => state.issue.getAssetCodesIsDone;

// Reducer
export default issueSlice.reducer;