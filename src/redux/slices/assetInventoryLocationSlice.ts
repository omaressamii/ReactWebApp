import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Types
interface AssetInventoryLocationState {
  // createAssetInventorySessionLocation
  createAssetInventorySessionLocationLoading: boolean;
  createAssetInventorySessionLocationError: string | null;
  createAssetInventorySessionLocationIsDone: boolean | null;

  // updateAssetsInventoryLocation
  updateAssetsInventoryLocationLoading: boolean;
  updateAssetsInventoryLocationError: string | null;
  updateAssetsInventoryLocationIsDone: boolean | null;

  // getLocationDepartments
  getLocationDepartments: any[];
  getLocationDepartmentsLoading: boolean;
  getLocationDepartmentsError: string | null;
  getLocationDepartmentsIsDone: boolean | null;

  // getSessionAssetInventoryLocation
  getSessionAssetInventoryLocation: any[];
  getSessionAssetInventoryLocationLoading: boolean;
  getSessionAssetInventoryLocationError: string | null;
  getSessionAssetInventoryLocationIsDone: boolean | null;

  // getSessionsAssetInventoryLocation
  getSessionsAssetInventoryLocation: any | null;
  getSessionsAssetInventoryLocationLoading: boolean;
  getSessionsAssetInventoryLocationError: string | null;
  getSessionsAssetInventoryLocationIsDone: boolean | null;

  // getAssetsInventoryLocation
  getAssetsInventoryLocation: any[];
  getAssetsInventoryLocationLoading: boolean;
  getAssetsInventoryLocationError: string | null;
  getAssetsInventoryLocationIsDone: boolean | null;

  // add asset to list
  assetToListLocationLoading: boolean;
  assetToListLocationError: string | null;
  assetToListLocationIsDone: boolean | null;

  // updateAssetPrintData
  updateAssetPrintDataLoading: boolean;
  updateAssetPrintDataError: string | null;
  updateAssetPrintDataIsDone: boolean | null;

  // updateAssetPrintDataInquiry
  updateAssetPrintDataInquiryLoading: boolean;
  updateAssetPrintDataInquiryError: string | null;
  updateAssetPrintDataInquiryIsDone: boolean | null;

  // updateAssetInquiryDetails
  updateAssetInquiryDetailsLoading: boolean;
  updateAssetInquiryDetailsError: string | null;
  updateAssetInquiryDetailsIsDone: boolean | null;
}

interface AssetUpdatePayload {
  Asset: any;
}

interface ApiResponse {
  status: number;
  departments?: any[];
  session?: any[];
  sessions?: any;
  assets?: any[];
  [key: string]: any;
}

// Initial state
const initialState: AssetInventoryLocationState = {
  createAssetInventorySessionLocationLoading: false,
  createAssetInventorySessionLocationError: null,
  createAssetInventorySessionLocationIsDone: null,

  updateAssetsInventoryLocationLoading: false,
  updateAssetsInventoryLocationError: null,
  updateAssetsInventoryLocationIsDone: null,

  getLocationDepartments: [],
  getLocationDepartmentsLoading: false,
  getLocationDepartmentsError: null,
  getLocationDepartmentsIsDone: null,

  getSessionAssetInventoryLocation: [],
  getSessionAssetInventoryLocationLoading: false,
  getSessionAssetInventoryLocationError: null,
  getSessionAssetInventoryLocationIsDone: null,

  getSessionsAssetInventoryLocation: null,
  getSessionsAssetInventoryLocationLoading: false,
  getSessionsAssetInventoryLocationError: null,
  getSessionsAssetInventoryLocationIsDone: null,

  getAssetsInventoryLocation: [],
  getAssetsInventoryLocationLoading: false,
  getAssetsInventoryLocationError: null,
  getAssetsInventoryLocationIsDone: null,

  assetToListLocationLoading: false,
  assetToListLocationError: null,
  assetToListLocationIsDone: null,

  updateAssetPrintDataLoading: false,
  updateAssetPrintDataError: null,
  updateAssetPrintDataIsDone: null,

  updateAssetPrintDataInquiryLoading: false,
  updateAssetPrintDataInquiryError: null,
  updateAssetPrintDataInquiryIsDone: null,

  updateAssetInquiryDetailsLoading: false,
  updateAssetInquiryDetailsError: null,
  updateAssetInquiryDetailsIsDone: null,
};

// Async thunks
export const createAssetInventorySessionLocation = createAsyncThunk(
  'assetInventoryLocationSlice/createAssetInventorySessionLocation',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('ASSET_INVENTORY_LOCATION', 'CREATE_SESSION', data);

      if (response.status === 1) {
        return {
          message: response.message || 'Asset inventory session location created successfully',
          sessionId: response.data?.sessionId || response.data?.id
        };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to create session' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message });
    }
  }
);

export const updateAssetsInventoryLocation = createAsyncThunk(
  'assetInventoryLocationSlice/updateAssetsInventoryLocation',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiService.putByEndpoint('ASSET_INVENTORY_LOCATION', 'UPDATE_LOCATION', data);

      if (response.status === 1) {
        return {
          message: response.message || 'Assets inventory location updated successfully'
        };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to update location' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message });
    }
  }
);

export const getLocationDepartments = createAsyncThunk(
  'assetInventoryLocationSlice/getLocationDepartments',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('ASSET_INVENTORY_LOCATION', 'DEPARTMENTS', data);

      if (response.status === 1 && response.data) {
        return { departments: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch departments' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message });
    }
  }
);

export const getSessionAssetInventoryLocation = createAsyncThunk(
  'assetInventoryLocationSlice/getSessionAssetInventoryLocation',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('ASSET_INVENTORY_LOCATION', 'SESSION_DETAILS', { id: data.sessionId });

      if (response.status === 1 && response.data) {
        return { session: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch session' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message });
    }
  }
);

export const getSessionsAssetInventoryLocation = createAsyncThunk(
  'assetInventoryLocationSlice/getSessionsAssetInventoryLocation',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('ASSET_INVENTORY_LOCATION', 'SESSIONS', data);

      if (response.status === 1 && response.data) {
        return { sessions: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch sessions' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message });
    }
  }
);

export const getAssetsInventoryLocation = createAsyncThunk(
  'assetInventoryLocationSlice/getAssetsInventoryLocation',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('ASSET_INVENTORY_LOCATION', 'ASSETS', data);

      if (response.status === 1 && response.data) {
        return { assets: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch assets' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message });
    }
  }
);

export const AssetToListLocation = createAsyncThunk(
  'assetInventoryLocationSlice/AssetToListLocation',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('ASSET_INVENTORY_LOCATION', 'ADD_TO_LIST', data);

      if (response.status === 1) {
        return { message: response.message || 'Asset added to location list successfully' };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to add asset to list' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message });
    }
  }
);

export const updateAssetPrintData = createAsyncThunk(
  'assetInventoryLocationSlice/updateAssetPrintData',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('ASSET_INVENTORY_LOCATION', 'PRINT_DATA', data);

      if (response.status === 1) {
        return { message: response.message || 'Asset print data updated successfully' };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to update print data' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message });
    }
  }
);

export const updateAssetPrintDataInquiry = createAsyncThunk(
  'assetInventoryLocationSlice/updateAssetPrintDataInquiry',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('ASSET_INVENTORY_LOCATION', 'PRINT_DATA_INQUIRY', data);

      if (response.status === 1) {
        return { message: response.message || 'Asset print data updated successfully' };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to update print data' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message });
    }
  }
);

export const updateAssetInquiryDetails = createAsyncThunk(
  'assetInventoryLocationSlice/updateAssetInquiryDetails',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('ASSET_INVENTORY_LOCATION', 'INQUIRY_DETAILS', data);

      if (response.status === 1) {
        return { message: response.message || 'Asset inquiry details updated successfully' };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to update inquiry details' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message });
    }
  }
);

// Slice
const assetInventoryLocationSlice = createSlice({
  name: 'assetInventoryLocationSlice',
  initialState,
  reducers: {
    resetCreateAssetInventorySessionLocation(state) {
      state.createAssetInventorySessionLocationLoading = false;
      state.createAssetInventorySessionLocationError = null;
      state.createAssetInventorySessionLocationIsDone = null;
    },

    resetUpdateAssetsInventoryLocation(state) {
      state.updateAssetsInventoryLocationLoading = false;
      state.updateAssetsInventoryLocationError = null;
      state.updateAssetsInventoryLocationIsDone = null;
    },

    resetGetLocationDepartments(state) {
      state.getLocationDepartments = [];
      state.getLocationDepartmentsLoading = false;
      state.getLocationDepartmentsError = null;
      state.getLocationDepartmentsIsDone = null;
    },

    resetGetSessionAssetInventoryLocation(state) {
      state.getSessionAssetInventoryLocation = [];
      state.getSessionAssetInventoryLocationLoading = false;
      state.getSessionAssetInventoryLocationError = null;
      state.getSessionAssetInventoryLocationIsDone = null;
    },

    resetGetSessionsAssetInventoryLocation(state) {
      state.getSessionsAssetInventoryLocation = null;
      state.getSessionsAssetInventoryLocationLoading = false;
      state.getSessionsAssetInventoryLocationError = null;
      state.getSessionsAssetInventoryLocationIsDone = null;
    },

    resetGetAssetsInventoryLocation(state) {
      state.getAssetsInventoryLocation = [];
      state.getAssetsInventoryLocationLoading = false;
      state.getAssetsInventoryLocationError = null;
      state.getAssetsInventoryLocationIsDone = null;
    },

    updateAsset: (state, action: PayloadAction<AssetUpdatePayload>) => {
      const { Asset } = action.payload;

      // Find the asset index
      const assetIndex = state.getAssetsInventoryLocation.findIndex(
        asset => asset.AIR_OBJ === Asset.AIR_OBJ
      );

      if (assetIndex !== -1) {
        // Update the asset directly (Immer handles immutability)
        const updatedAsset = {
          ...state.getAssetsInventoryLocation[assetIndex],
          ...Asset,
        };

        // Mark asset as inventoried if it has required fields
        if (updatedAsset.AIR_OBSERVED_LOCATION && updatedAsset.AIR_OBSERVED_LOCATION_ORG) {
          updatedAsset.AIR_INVENTORYVERIFICATIONDATE = updatedAsset.AIR_INVENTORYVERIFICATIONDATE || new Date().toISOString();
        }

        state.getAssetsInventoryLocation[assetIndex] = updatedAsset;
      } else {
        // Insert the new asset and mark as inventoried if applicable
        const newAsset = { ...Asset };
        if (newAsset.AIR_OBSERVED_LOCATION && newAsset.AIR_OBSERVED_LOCATION_ORG) {
          newAsset.AIR_INVENTORYVERIFICATIONDATE = newAsset.AIR_INVENTORYVERIFICATIONDATE || new Date().toISOString();
        }
        state.getAssetsInventoryLocation.push(newAsset);
      }
    },

    resetAssetToListLocation(state) {
      state.assetToListLocationLoading = false;
      state.assetToListLocationError = null;
      state.assetToListLocationIsDone = null;
    },

    resetUpdateAssetPrintData(state) {
      state.updateAssetPrintDataLoading = false;
      state.updateAssetPrintDataError = null;
      state.updateAssetPrintDataIsDone = null;
    },

    resetUpdateAssetPrintDataInquiry(state) {
      state.updateAssetPrintDataInquiryLoading = false;
      state.updateAssetPrintDataInquiryError = null;
      state.updateAssetPrintDataInquiryIsDone = null;
    },

    resetUpdateAssetInquiryDetails(state) {
      state.updateAssetInquiryDetailsLoading = false;
      state.updateAssetInquiryDetailsError = null;
      state.updateAssetInquiryDetailsIsDone = null;
    },

    resetAll(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    // createAssetInventorySessionLocation
    builder
      .addCase(createAssetInventorySessionLocation.pending, (state) => {
        state.createAssetInventorySessionLocationLoading = true;
        state.createAssetInventorySessionLocationError = null;
        state.createAssetInventorySessionLocationIsDone = null;
      })
      .addCase(createAssetInventorySessionLocation.fulfilled, (state) => {
        state.createAssetInventorySessionLocationLoading = false;
        state.createAssetInventorySessionLocationError = null;
        state.createAssetInventorySessionLocationIsDone = true;
      })
      .addCase(createAssetInventorySessionLocation.rejected, (state, action) => {
        state.createAssetInventorySessionLocationLoading = false;
        state.createAssetInventorySessionLocationError = (action.payload as any)?.error || 'Unknown error';
        state.createAssetInventorySessionLocationIsDone = false;
      });

    // updateAssetsInventoryLocation
    builder
      .addCase(updateAssetsInventoryLocation.pending, (state) => {
        state.updateAssetsInventoryLocationLoading = true;
        state.updateAssetsInventoryLocationError = null;
        state.updateAssetsInventoryLocationIsDone = null;
      })
      .addCase(updateAssetsInventoryLocation.fulfilled, (state) => {
        state.updateAssetsInventoryLocationLoading = false;
        state.updateAssetsInventoryLocationError = null;
        state.updateAssetsInventoryLocationIsDone = true;
      })
      .addCase(updateAssetsInventoryLocation.rejected, (state, action) => {
        state.updateAssetsInventoryLocationLoading = false;
        state.updateAssetsInventoryLocationError = (action.payload as any)?.error || 'Unknown error';
        state.updateAssetsInventoryLocationIsDone = false;
      });

    // getLocationDepartments
    builder
      .addCase(getLocationDepartments.pending, (state) => {
        state.getLocationDepartments = [];
        state.getLocationDepartmentsLoading = true;
        state.getLocationDepartmentsError = null;
        state.getLocationDepartmentsIsDone = null;
      })
      .addCase(getLocationDepartments.fulfilled, (state, action) => {
        state.getLocationDepartments = action.payload.departments || [];
        state.getLocationDepartmentsLoading = false;
        state.getLocationDepartmentsError = null;
        state.getLocationDepartmentsIsDone = true;
      })
      .addCase(getLocationDepartments.rejected, (state, action) => {
        state.getLocationDepartments = [];
        state.getLocationDepartmentsLoading = false;
        state.getLocationDepartmentsError = (action.payload as any)?.error || 'Unknown error';
        state.getLocationDepartmentsIsDone = false;
      });

    // getSessionAssetInventoryLocation
    builder
      .addCase(getSessionAssetInventoryLocation.pending, (state) => {
        state.getSessionAssetInventoryLocation = [];
        state.getSessionAssetInventoryLocationLoading = true;
        state.getSessionAssetInventoryLocationError = null;
        state.getSessionAssetInventoryLocationIsDone = null;
      })
      .addCase(getSessionAssetInventoryLocation.fulfilled, (state, action) => {
        state.getSessionAssetInventoryLocation = action.payload.session || [];
        state.getSessionAssetInventoryLocationLoading = false;
        state.getSessionAssetInventoryLocationError = null;
        state.getSessionAssetInventoryLocationIsDone = true;
      })
      .addCase(getSessionAssetInventoryLocation.rejected, (state, action) => {
        state.getSessionAssetInventoryLocation = [];
        state.getSessionAssetInventoryLocationLoading = false;
        state.getSessionAssetInventoryLocationError = (action.payload as any)?.error || 'Unknown error';
        state.getSessionAssetInventoryLocationIsDone = false;
      });

    // getSessionsAssetInventoryLocation
    builder
      .addCase(getSessionsAssetInventoryLocation.pending, (state) => {
        state.getSessionsAssetInventoryLocation = null;
        state.getSessionsAssetInventoryLocationLoading = true;
        state.getSessionsAssetInventoryLocationError = null;
        state.getSessionsAssetInventoryLocationIsDone = null;
      })
      .addCase(getSessionsAssetInventoryLocation.fulfilled, (state, action) => {
        state.getSessionsAssetInventoryLocation = action.payload.sessions || null;
        state.getSessionsAssetInventoryLocationLoading = false;
        state.getSessionsAssetInventoryLocationError = null;
        state.getSessionsAssetInventoryLocationIsDone = true;
      })
      .addCase(getSessionsAssetInventoryLocation.rejected, (state, action) => {
        state.getSessionsAssetInventoryLocation = null;
        state.getSessionsAssetInventoryLocationLoading = false;
        state.getSessionsAssetInventoryLocationError = (action.payload as any)?.error || 'Unknown error';
        state.getSessionsAssetInventoryLocationIsDone = false;
      });

    // getAssetsInventoryLocation
    builder
      .addCase(getAssetsInventoryLocation.pending, (state) => {
        state.getAssetsInventoryLocation = [];
        state.getAssetsInventoryLocationLoading = true;
        state.getAssetsInventoryLocationError = null;
        state.getAssetsInventoryLocationIsDone = null;
      })
      .addCase(getAssetsInventoryLocation.fulfilled, (state, action) => {
        state.getAssetsInventoryLocation = action.payload.assets || [];
        state.getAssetsInventoryLocationLoading = false;
        state.getAssetsInventoryLocationError = null;
        state.getAssetsInventoryLocationIsDone = true;
      })
      .addCase(getAssetsInventoryLocation.rejected, (state, action) => {
        state.getAssetsInventoryLocation = [];
        state.getAssetsInventoryLocationLoading = false;
        state.getAssetsInventoryLocationError = (action.payload as any)?.error || 'Unknown error';
        state.getAssetsInventoryLocationIsDone = false;
      });

    // AssetToListLocation
    builder
      .addCase(AssetToListLocation.pending, (state) => {
        state.assetToListLocationLoading = true;
        state.assetToListLocationError = null;
        state.assetToListLocationIsDone = null;
      })
      .addCase(AssetToListLocation.fulfilled, (state) => {
        state.assetToListLocationLoading = false;
        state.assetToListLocationError = null;
        state.assetToListLocationIsDone = true;
      })
      .addCase(AssetToListLocation.rejected, (state, action) => {
        state.assetToListLocationLoading = false;
        state.assetToListLocationError = (action.payload as any)?.error || 'Unknown error';
        state.assetToListLocationIsDone = false;
      });

    // updateAssetPrintData
    builder
      .addCase(updateAssetPrintData.pending, (state) => {
        state.updateAssetPrintDataLoading = true;
        state.updateAssetPrintDataError = null;
        state.updateAssetPrintDataIsDone = null;
      })
      .addCase(updateAssetPrintData.fulfilled, (state) => {
        state.updateAssetPrintDataLoading = false;
        state.updateAssetPrintDataError = null;
        state.updateAssetPrintDataIsDone = true;
      })
      .addCase(updateAssetPrintData.rejected, (state, action) => {
        state.updateAssetPrintDataLoading = false;
        state.updateAssetPrintDataError = (action.payload as any)?.error || 'Unknown error';
        state.updateAssetPrintDataIsDone = false;
      });

    // updateAssetPrintDataInquiry
    builder
      .addCase(updateAssetPrintDataInquiry.pending, (state) => {
        state.updateAssetPrintDataInquiryLoading = true;
        state.updateAssetPrintDataInquiryError = null;
        state.updateAssetPrintDataInquiryIsDone = null;
      })
      .addCase(updateAssetPrintDataInquiry.fulfilled, (state) => {
        state.updateAssetPrintDataInquiryLoading = false;
        state.updateAssetPrintDataInquiryError = null;
        state.updateAssetPrintDataInquiryIsDone = true;
      })
      .addCase(updateAssetPrintDataInquiry.rejected, (state, action) => {
        state.updateAssetPrintDataInquiryLoading = false;
        state.updateAssetPrintDataInquiryError = (action.payload as any)?.error || 'Unknown error';
        state.updateAssetPrintDataInquiryIsDone = false;
      });

    // updateAssetInquiryDetails
    builder
      .addCase(updateAssetInquiryDetails.pending, (state) => {
        state.updateAssetInquiryDetailsLoading = true;
        state.updateAssetInquiryDetailsError = null;
        state.updateAssetInquiryDetailsIsDone = null;
      })
      .addCase(updateAssetInquiryDetails.fulfilled, (state) => {
        state.updateAssetInquiryDetailsLoading = false;
        state.updateAssetInquiryDetailsError = null;
        state.updateAssetInquiryDetailsIsDone = true;
      })
      .addCase(updateAssetInquiryDetails.rejected, (state, action) => {
        state.updateAssetInquiryDetailsLoading = false;
        state.updateAssetInquiryDetailsError = (action.payload as any)?.error || 'Unknown error';
        state.updateAssetInquiryDetailsIsDone = false;
      });
  },
});

// Selectors
export const selectInventoriedAssetsCount = (state: { assetInventoryLocation: AssetInventoryLocationState }) => {
  return state.assetInventoryLocation.getAssetsInventoryLocation.filter(
    (asset) => asset.AIR_OBSERVED_LOCATION && asset.AIR_OBSERVED_LOCATION_ORG
  ).length;
};

export const selectTotalAssetsCount = (state: { assetInventoryLocation: AssetInventoryLocationState }) => {
  return state.assetInventoryLocation.getAssetsInventoryLocation.length;
};

export const selectAssetsNeedingResolutionCount = (state: { assetInventoryLocation: AssetInventoryLocationState }) => {
  return state.assetInventoryLocation.getAssetsInventoryLocation.filter(
    (asset) => asset.AIR_DISPOSITION === '+'
  ).length;
};

export const selectInventoryProgress = (state: { assetInventoryLocation: AssetInventoryLocationState }) => {
  const total = selectTotalAssetsCount(state);
  const inventoried = selectInventoriedAssetsCount(state);
  return {
    total,
    inventoried,
    percentage: total > 0 ? Math.round((inventoried / total) * 100) : 0,
    remaining: total - inventoried
  };
};

// Actions
export const AssetInventoryLocationAction = assetInventoryLocationSlice.actions;

// Reducer
export default assetInventoryLocationSlice.reducer;