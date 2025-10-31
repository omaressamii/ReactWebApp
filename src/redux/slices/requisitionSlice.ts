import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Mobile app data structures based on backend analysis
export interface Requisition {
  requisition_code: string;
  requisition_description: string;
  requisition_created_byId: string;
  requisition_created_byName: string;
  requisition_created_fromStoreId: string;
  requisition_created_fromStoreDesc: string;
  requisition_created_fromStoreOrg: string;
  requisition_created_toStoreId: string;
  requisition_created_toStoreDesc: string;
  requisition_created_toStoreOrg: string;
  requisition_created_requistedById: string;
  requisition_created_requistedByDesc: string;
  requisition_created_toOrganization: string;
  requisition_status_code: 'U' | 'A' | 'C' | 'J'; // Unfinished, Approved, Cancelled, Rejected
  requisition_status_desc: string;
  requisition_created_date: string;
  requisition_delete: string;
  requisition_printed: string;
  // Status timestamps
  requisition_unfinished_date?: string;
  requisition_approved_date?: string;
  requisition_cancelled_date?: string;
  requisition_rejected_date?: string;
  requisition_awaitingApproval_date?: string;
  // Rejection reason
  requisition_reject_reason?: string;
}

export interface RequisitionPart {
  // InFor database fields (actual backend response)
  RQL_REQ?: string; // Requisition code
  RQL_REQLINE?: string; // Line number (unique identifier)
  RQL_PART?: string; // Part code
  RQL_QTY?: number; // Quantity requested
  RQL_STATUS?: string; // Status
  RQL_PART_ORG?: string; // Part organization
  PAR_DESC?: string; // Part description
  STO_QTY?: number; // Stock quantity

  // Legacy frontend fields (for compatibility)
  requisitioncode?: string;
  part?: string;
  description?: string;
  quantity?: number;
  fromstore?: string;
  organization?: string;
  recordid?: string;
}

// Delete part request structure (matches backend expectations)
export interface DeleteRequisitionPartRequest {
  requisitionCode: string;
  partLine: string;
  partOrganization: string;
}

export interface RequisitionImage {
  image_path: string;
  image_entity: string;
  image_entity_number: string;
}

interface RequisitionState {
  // Main data
  requisitions: Requisition[];
  requisitionParts: RequisitionPart[];
  images: RequisitionImage[];
  selectedRequisition: Requisition | null;

  // Loading states
  loading: boolean;
  makeRequisitionLoading: boolean;
  getRequisitionLoading: boolean;
  updateRequisitionLoading: boolean;
  getRequisitionPartsLoading: boolean;
  addRequisitionPartLoading: boolean;
  deleteRequisitionPartLoading: boolean;
  updateRequisitionPartLoading: boolean;
  getRequisitionImagesLoading: boolean;

  // Status states
  error: string | null;
  makeRequisitionError: string | null;
  getRequisitionError: string | null;
  updateRequisitionError: string | null;
  getRequisitionPartsError: string | null;
  addRequisitionPartError: string | null;
  deleteRequisitionPartError: string | null;
  updateRequisitionPartError: string | null;
  getRequisitionImagesError: string | null;

  // Success states
  makeRequisitionIsDone: boolean | null;
  getRequisitionIsDone: boolean | null;
  updateRequisitionIsDone: boolean | null;
  getRequisitionPartsIsDone: boolean | null;
  addRequisitionPartIsDone: boolean | null;
  deleteRequisitionPartIsDone: boolean | null;
  updateRequisitionPartIsDone: boolean | null;
  getRequisitionImagesIsDone: boolean | null;
}

const initialState: RequisitionState = {
  requisitions: [],
  requisitionParts: [],
  images: [],
  selectedRequisition: null,

  loading: false,
  makeRequisitionLoading: false,
  getRequisitionLoading: false,
  updateRequisitionLoading: false,
  getRequisitionPartsLoading: false,
  addRequisitionPartLoading: false,
  deleteRequisitionPartLoading: false,
  updateRequisitionPartLoading: false,
  getRequisitionImagesLoading: false,

  error: null,
  makeRequisitionError: null,
  getRequisitionError: null,
  updateRequisitionError: null,
  getRequisitionPartsError: null,
  addRequisitionPartError: null,
  deleteRequisitionPartError: null,
  updateRequisitionPartError: null,
  getRequisitionImagesError: null,

  makeRequisitionIsDone: null,
  getRequisitionIsDone: null,
  updateRequisitionIsDone: null,
  getRequisitionPartsIsDone: null,
  addRequisitionPartIsDone: null,
  deleteRequisitionPartIsDone: null,
  updateRequisitionPartIsDone: null,
  getRequisitionImagesIsDone: null,
};

// Async thunks matching mobile app API calls
export const getItRequisition = createAsyncThunk(
  'requisition/getItRequisition',
  async (user: any, { rejectWithValue }) => {
    try {
      // Map USR_CODE to user_code_infor for backend compatibility
      const apiUser = {
        user_code_infor: user.USR_CODE,
        ...user
      };

      const response = await apiService.postByEndpoint('REQUISITION', 'LIST', { user: apiUser });

      if (response.status === 1 && response.requisitions) {
        return { requisitions: response.requisitions };
      } else {
        return rejectWithValue({ error: response.error || 'Failed to fetch requisitions' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch requisitions' });
    }
  }
);

export const GetOneRequisition = createAsyncThunk(
  'requisition/GetOneRequisition',
  async (data: { user: any; requisition: { requisition_code: string } }, { rejectWithValue }) => {
    try {
      // Map USR_CODE to user_code_infor for backend compatibility
      const apiUser = {
        user_code_infor: data.user.USR_CODE,
        ...data.user
      };

      const response = await apiService.postByEndpoint('REQUISITION', 'DETAILS', {
        user: apiUser,
        requisition: data.requisition
      });

      if (response.status === 1 && response.requisition) {
        return { requisition: response.requisition };
      } else {
        return rejectWithValue({ error: response.error || 'Failed to fetch requisition details' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch requisition details' });
    }
  }
);

export const makeRequisition = createAsyncThunk(
  'requisition/makeRequisition',
  async (request: {
    user: any;
    ip: string;
    requisition: any;
    part: any;
    document: any;
    other?: { selectedImage?: any };
  }, { rejectWithValue }) => {
    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('user', JSON.stringify(request.user));
      formData.append('ip', request.ip);
      formData.append('requisition', JSON.stringify(request.requisition));
      formData.append('part', JSON.stringify(request.part));
      formData.append('document', JSON.stringify(request.document));

      if (request.other?.selectedImage) {
        formData.append('image', {
          uri: request.document.path,
          name: 'image.jpg',
          type: 'image/jpeg',
        } as any);
      }

      const response = await apiService.postByEndpoint('REQUISITION', 'CREATE', formData);

      if (response.status === 1) {
        return { requisitioncode: response.requisitioncode, ...response };
      } else {
        return rejectWithValue({ error: response.error || 'Failed to create requisition' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to create requisition' });
    }
  }
);

export const getRequisitionParts = createAsyncThunk(
  'requisition/getRequisitionParts',
  async (request: { requisition: Requisition }, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('REQUISITION', 'PARTS', { requisition: request.requisition });

      if (response.status === 1 && response.parts) {
        return { parts: response.parts };
      } else {
        return rejectWithValue({ error: response.error || 'Failed to fetch requisition parts' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch requisition parts' });
    }
  }
);

export const addRequisitionPart = createAsyncThunk(
  'requisition/addRequisitionPart',
  async (request: { part: RequisitionPart; user: any }, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('REQUISITION', 'ADD_PART', request);

      if (response.status === 1) {
        return response;
      } else {
        return rejectWithValue({ error: response.error || 'Failed to add part' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to add part' });
    }
  }
);

export const updateRequisition = createAsyncThunk(
  'requisition/updateRequisition',
  async (request: { requisition: any; user: any; ip: string }, { rejectWithValue }) => {
    try {
      // Map USR_CODE to user_code_infor for backend compatibility
      const apiUser = {
        user_code_infor: request.user.USR_CODE,
        ...request.user
      };

      const response = await apiService.postByEndpoint('REQUISITION', 'UPDATE', {
        ...request,
        user: apiUser
      });

      if (response.status === 1) {
        return response;
      } else {
        return rejectWithValue({ error: response.error || 'Failed to update requisition' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to update requisition' });
    }
  }
);

export const getRequisitionImages = createAsyncThunk(
  'requisition/getRequisitionImages',
  async (request: { requisition: Requisition }, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('REQUISITION', 'IMAGES', { requisition: request.requisition });

      if (response.status === 1 && response.data) {
        return { images: response.data };
      } else {
        return rejectWithValue({ error: response.error || 'Failed to fetch images' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch images' });
    }
  }
);

export const deleteRequisitionPart = createAsyncThunk(
  'requisition/deleteRequisitionPart',
  async (request: { part: DeleteRequisitionPartRequest; user: any }, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('REQUISITION', 'DELETE_PART', request);

      if (response.status === 1) {
        return response;
      } else {
        return rejectWithValue({ error: response.error || 'Failed to delete part' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to delete part' });
    }
  }
);

export const updateRequisitionPart = createAsyncThunk(
  'requisition/updateRequisitionPart',
  async (request: { part: RequisitionPart }, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('REQUISITION', 'UPDATE_PART', { part: request.part });

      if (response.status === 1) {
        return response;
      } else {
        return rejectWithValue({ error: response.error || 'Failed to update part' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to update part' });
    }
  }
);

const requisitionSlice = createSlice({
  name: 'requisition',
  initialState,
  reducers: {
    // Reset functions matching mobile app
    resetMakeRequisition: (state) => {
      state.makeRequisitionLoading = false;
      state.makeRequisitionError = null;
      state.makeRequisitionIsDone = null;
    },
    resetAddPart: (state) => {
      state.addRequisitionPartLoading = false;
      state.addRequisitionPartError = null;
      state.addRequisitionPartIsDone = false;
    },
    resetUpdateRequisition: (state) => {
      state.updateRequisitionLoading = false;
      state.updateRequisitionError = null;
      state.updateRequisitionIsDone = null;
    },
    resetUpdatePart: (state) => {
      state.updateRequisitionPartLoading = false;
      state.updateRequisitionPartError = null;
      state.updateRequisitionPartIsDone = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // getItRequisition
    builder
      .addCase(getItRequisition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getItRequisition.fulfilled, (state, action) => {
        state.requisitions = Array.isArray(action.payload.requisitions) ? action.payload.requisitions : [];
        state.loading = false;
        state.error = null;
      })
      .addCase(getItRequisition.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error;
        state.requisitions = []; // Ensure requisitions is always an array
      });

    // GetOneRequisition
    builder
      .addCase(GetOneRequisition.pending, (state) => {
        state.getRequisitionLoading = true;
        state.getRequisitionError = null;
        state.getRequisitionIsDone = null;
      })
      .addCase(GetOneRequisition.fulfilled, (state, action) => {
        state.selectedRequisition = action.payload.requisition;
        state.getRequisitionLoading = false;
        state.getRequisitionError = null;
        state.getRequisitionIsDone = true;
      })
      .addCase(GetOneRequisition.rejected, (state, action) => {
        state.getRequisitionLoading = false;
        state.getRequisitionError = (action.payload as any)?.error;
        state.getRequisitionIsDone = false;
        state.selectedRequisition = null;
      });

    // makeRequisition
    builder
      .addCase(makeRequisition.pending, (state) => {
        state.makeRequisitionLoading = true;
        state.makeRequisitionError = null;
        state.makeRequisitionIsDone = null;
      })
      .addCase(makeRequisition.fulfilled, (state, action) => {
        state.makeRequisitionLoading = false;
        state.makeRequisitionError = null;
        state.makeRequisitionIsDone = true;
      })
      .addCase(makeRequisition.rejected, (state, action) => {
        state.makeRequisitionLoading = false;
        state.makeRequisitionError = (action.payload as any)?.error;
        state.makeRequisitionIsDone = false;
      });

    // getRequisitionParts
    builder
      .addCase(getRequisitionParts.pending, (state) => {
        state.getRequisitionPartsLoading = true;
        state.getRequisitionPartsError = null;
      })
      .addCase(getRequisitionParts.fulfilled, (state, action) => {
        state.requisitionParts = action.payload.parts;
        state.getRequisitionPartsLoading = false;
        state.getRequisitionPartsError = null;
      })
      .addCase(getRequisitionParts.rejected, (state, action) => {
        state.getRequisitionPartsLoading = false;
        state.getRequisitionPartsError = (action.payload as any)?.error;
        state.requisitionParts = [];
      });

    // addRequisitionPart
    builder
      .addCase(addRequisitionPart.pending, (state) => {
        state.addRequisitionPartLoading = true;
        state.addRequisitionPartError = null;
        state.addRequisitionPartIsDone = null;
      })
      .addCase(addRequisitionPart.fulfilled, (state) => {
        state.addRequisitionPartLoading = false;
        state.addRequisitionPartError = null;
        state.addRequisitionPartIsDone = true;
      })
      .addCase(addRequisitionPart.rejected, (state, action) => {
        state.addRequisitionPartLoading = false;
        state.addRequisitionPartError = (action.payload as any)?.error;
        state.addRequisitionPartIsDone = false;
      });

    // updateRequisition
    builder
      .addCase(updateRequisition.pending, (state) => {
        state.updateRequisitionLoading = true;
        state.updateRequisitionError = null;
        state.updateRequisitionIsDone = null;
      })
      .addCase(updateRequisition.fulfilled, (state) => {
        state.updateRequisitionLoading = false;
        state.updateRequisitionError = null;
        state.updateRequisitionIsDone = true;
      })
      .addCase(updateRequisition.rejected, (state, action) => {
        state.updateRequisitionLoading = false;
        state.updateRequisitionError = (action.payload as any)?.error;
        state.updateRequisitionIsDone = false;
      });

    // getRequisitionImages
    builder
      .addCase(getRequisitionImages.pending, (state) => {
        state.getRequisitionImagesLoading = true;
        state.getRequisitionImagesError = null;
      })
      .addCase(getRequisitionImages.fulfilled, (state, action) => {
        state.images = action.payload.images;
        state.getRequisitionImagesLoading = false;
        state.getRequisitionImagesError = null;
      })
      .addCase(getRequisitionImages.rejected, (state, action) => {
        state.getRequisitionImagesLoading = false;
        state.getRequisitionImagesError = (action.payload as any)?.error;
        state.images = [];
      });

    // deleteRequisitionPart
    builder
      .addCase(deleteRequisitionPart.pending, (state) => {
        state.deleteRequisitionPartLoading = true;
      })
      .addCase(deleteRequisitionPart.fulfilled, (state) => {
        state.deleteRequisitionPartLoading = false;
        state.deleteRequisitionPartIsDone = true;
      })
      .addCase(deleteRequisitionPart.rejected, (state, action) => {
        state.deleteRequisitionPartLoading = false;
        state.deleteRequisitionPartError = (action.payload as any)?.error;
        state.deleteRequisitionPartIsDone = false;
      });

    // updateRequisitionPart
    builder
      .addCase(updateRequisitionPart.pending, (state) => {
        state.updateRequisitionPartLoading = true;
        state.updateRequisitionPartError = null;
        state.updateRequisitionPartIsDone = null;
      })
      .addCase(updateRequisitionPart.fulfilled, (state) => {
        state.updateRequisitionPartLoading = false;
        state.updateRequisitionPartError = null;
        state.updateRequisitionPartIsDone = true;
      })
      .addCase(updateRequisitionPart.rejected, (state, action) => {
        state.updateRequisitionPartLoading = false;
        state.updateRequisitionPartError = (action.payload as any)?.error;
        state.updateRequisitionPartIsDone = false;
      });
  },
});

export const {
  resetMakeRequisition,
  resetAddPart,
  resetUpdateRequisition,
  resetUpdatePart,
  setError
} = requisitionSlice.actions;

// Selectors
export const selectRequisitions = (state: { requisition: RequisitionState }) => state.requisition.requisitions;
export const selectSelectedRequisition = (state: { requisition: RequisitionState }) => state.requisition.selectedRequisition;
export const selectRequisitionParts = (state: { requisition: RequisitionState }) => state.requisition.requisitionParts;
export const selectRequisitionImages = (state: { requisition: RequisitionState }) => state.requisition.images;
export const selectRequisitionLoading = (state: { requisition: RequisitionState }) => state.requisition.loading;
export const selectRequisitionError = (state: { requisition: RequisitionState }) => state.requisition.error;

export default requisitionSlice.reducer;
