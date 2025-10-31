import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'inprogress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  location: string;
  assetId?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

interface WorkOrderState {
  workOrders: WorkOrder[];
  selectedWorkOrder: WorkOrder | null;
  loading: boolean;
  error: string | null;
  isDone: boolean | null;
}

const initialState: WorkOrderState = {
  workOrders: [],
  selectedWorkOrder: null,
  loading: false,
  error: null,
  isDone: null,
};

// Async thunks
export const fetchWorkOrders = createAsyncThunk(
  'workOrder/fetchWorkOrders',
  async (params: { page?: number; limit?: number; status?: string; priority?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('WORK_ORDER', 'LIST', params);

      if (response.status === 1 && response.data) {
        return { workOrders: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch work orders' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch work orders' });
    }
  }
);

export const fetchWorkOrderDetails = createAsyncThunk(
  'workOrder/fetchWorkOrderDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('WORK_ORDER', 'DETAILS', { id });

      if (response.status === 1 && response.data) {
        return { workOrder: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch work order details' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch work order details' });
    }
  }
);

export const createWorkOrder = createAsyncThunk(
  'workOrder/createWorkOrder',
  async (workOrderData: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('WORK_ORDER', 'CREATE', workOrderData);

      if (response.status === 1 && response.data) {
        return { workOrder: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to create work order' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to create work order' });
    }
  }
);

export const updateWorkOrder = createAsyncThunk(
  'workOrder/updateWorkOrder',
  async ({ id, data }: { id: string; data: Partial<WorkOrder> }, { rejectWithValue }) => {
    try {
      const response = await apiService.putByEndpoint('WORK_ORDER', 'UPDATE', data, { id });

      if (response.status === 1 && response.data) {
        return { workOrder: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to update work order' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to update work order' });
    }
  }
);

export const updateWorkOrderStatusAsync = createAsyncThunk(
  'workOrder/updateWorkOrderStatus',
  async ({ id, status }: { id: string; status: WorkOrder['status'] }, { rejectWithValue }) => {
    try {
      const response = await apiService.putByEndpoint('WORK_ORDER', 'STATUS_UPDATE', { status }, { id });

      if (response.status === 1 && response.data) {
        return { workOrder: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to update work order status' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to update work order status' });
    }
  }
);

export const deleteWorkOrder = createAsyncThunk(
  'workOrder/deleteWorkOrder',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.deleteByEndpoint('WORK_ORDER', 'DELETE', { id });

      if (response.status === 1) {
        return { id };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to delete work order' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to delete work order' });
    }
  }
);

const workOrderSlice = createSlice({
  name: 'workOrder',
  initialState,
  reducers: {
    setWorkOrders: (state, action: PayloadAction<WorkOrder[]>) => {
      state.workOrders = action.payload;
      state.loading = false;
      state.error = null;
      state.isDone = true;
    },
    setSelectedWorkOrder: (state, action: PayloadAction<WorkOrder | null>) => {
      state.selectedWorkOrder = action.payload;
      state.loading = false;
      state.error = null;
      state.isDone = true;
    },
    updateWorkOrderStatus: (state, action: PayloadAction<{ id: string; status: WorkOrder['status'] }>) => {
      const workOrder = state.workOrders.find(wo => wo.id === action.payload.id);
      if (workOrder) {
        workOrder.status = action.payload.status;
        workOrder.updatedAt = new Date().toISOString();
      }
      if (state.selectedWorkOrder?.id === action.payload.id) {
        state.selectedWorkOrder.status = action.payload.status;
        state.selectedWorkOrder.updatedAt = new Date().toISOString();
      }
      state.loading = false;
      state.error = null;
      state.isDone = true;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchWorkOrders
    builder
      .addCase(fetchWorkOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(fetchWorkOrders.fulfilled, (state, action) => {
        state.workOrders = action.payload.workOrders;
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(fetchWorkOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to fetch work orders';
        state.workOrders = [];
        state.isDone = false;
      });

    // fetchWorkOrderDetails
    builder
      .addCase(fetchWorkOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(fetchWorkOrderDetails.fulfilled, (state, action) => {
        state.selectedWorkOrder = action.payload.workOrder;
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(fetchWorkOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to fetch work order details';
        state.selectedWorkOrder = null;
        state.isDone = false;
      });

    // createWorkOrder
    builder
      .addCase(createWorkOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(createWorkOrder.fulfilled, (state, action) => {
        state.workOrders.push(action.payload.workOrder);
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(createWorkOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to create work order';
        state.isDone = false;
      });

    // updateWorkOrder
    builder
      .addCase(updateWorkOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(updateWorkOrder.fulfilled, (state, action) => {
        const index = state.workOrders.findIndex(wo => wo.id === action.payload.workOrder.id);
        if (index !== -1) {
          state.workOrders[index] = action.payload.workOrder;
        }
        if (state.selectedWorkOrder?.id === action.payload.workOrder.id) {
          state.selectedWorkOrder = action.payload.workOrder;
        }
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(updateWorkOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to update work order';
        state.isDone = false;
      });

    // updateWorkOrderStatusAsync
    builder
      .addCase(updateWorkOrderStatusAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(updateWorkOrderStatusAsync.fulfilled, (state, action) => {
        const workOrder = action.payload.workOrder;
        const index = state.workOrders.findIndex(wo => wo.id === workOrder.id);
        if (index !== -1) {
          state.workOrders[index] = workOrder;
        }
        if (state.selectedWorkOrder?.id === workOrder.id) {
          state.selectedWorkOrder = workOrder;
        }
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(updateWorkOrderStatusAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to update work order status';
        state.isDone = false;
      });

    // deleteWorkOrder
    builder
      .addCase(deleteWorkOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(deleteWorkOrder.fulfilled, (state, action) => {
        state.workOrders = state.workOrders.filter(wo => wo.id !== action.payload.id);
        if (state.selectedWorkOrder?.id === action.payload.id) {
          state.selectedWorkOrder = null;
        }
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(deleteWorkOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to delete work order';
        state.isDone = false;
      });
  },
});

export const { setWorkOrders, setSelectedWorkOrder, updateWorkOrderStatus, setLoading, clearError } = workOrderSlice.actions;

// Selectors
export const selectWorkOrders = (state: { workOrder: WorkOrderState }) => state.workOrder.workOrders;
export const selectSelectedWorkOrder = (state: { workOrder: WorkOrderState }) => state.workOrder.selectedWorkOrder;
export const selectWorkOrderLoading = (state: { workOrder: WorkOrderState }) => state.workOrder.loading;
export const selectWorkOrderError = (state: { workOrder: WorkOrderState }) => state.workOrder.error;
export const selectWorkOrderIsDone = (state: { workOrder: WorkOrderState }) => state.workOrder.isDone;

export default workOrderSlice.reducer;
