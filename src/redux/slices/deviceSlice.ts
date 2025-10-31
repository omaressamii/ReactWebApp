import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Types
interface Device {
  id: string;
  name: string;
  code: string;
  class: string;
  location: string;
  status: string;
  // Add other device properties as needed
}

interface DeviceState {
  devices: Device[];
  device: Device | null;
  loading: boolean;
  error: string | null;
  isDone: boolean | null;

  // Scanning state
  scannedDevice: Device | null;
  scannedCode: string | null;
  scanning: boolean;
  scanError: string | null;
}

// Initial state
const initialState: DeviceState = {
  devices: [],
  device: null,
  loading: false,
  error: null,
  isDone: null,

  // Scanning state
  scannedDevice: null,
  scannedCode: null,
  scanning: false,
  scanError: null,
};

// Async thunks
export const fetchDevice = createAsyncThunk(
  'device/fetchDevice',
  async (data: { user: any; assetCode: string }, { rejectWithValue }) => {
    try {
      // Use the API service to fetch device details
      const response = await apiService.postByEndpoint('DEVICE', 'BARCODE_LOOKUP', {
        user: data.user,
        assetCode: data.assetCode,
      });

      if (response.status === 1 && response.data) {
        return { device: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch device' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch device' });
    }
  }
);

export const scanDevice = createAsyncThunk(
  'device/scanDevice',
  async (barcode: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('DEVICE', 'BARCODE_LOOKUP', { code: barcode });

      if (response.status === 1 && response.data) {
        return { device: response.data, scannedCode: barcode };
      } else {
        return rejectWithValue({ error: response.message || 'Device not found' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to scan device' });
    }
  }
);

export const fetchDevices = createAsyncThunk(
  'device/fetchDevices',
  async (params: { page?: number; limit?: number; search?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('DEVICE', 'LIST', params);

      if (response.status === 1 && response.data) {
        return { devices: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch devices' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch devices' });
    }
  }
);

export const createDevice = createAsyncThunk(
  'device/createDevice',
  async (deviceData: Omit<Device, 'id'>, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('DEVICE', 'CREATE', deviceData);

      if (response.status === 1 && response.data) {
        return { device: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to create device' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to create device' });
    }
  }
);

export const updateDevice = createAsyncThunk(
  'device/updateDevice',
  async ({ id, data }: { id: string; data: Partial<Device> }, { rejectWithValue }) => {
    try {
      const response = await apiService.putByEndpoint('DEVICE', 'UPDATE', data, { id });

      if (response.status === 1 && response.data) {
        return { device: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to update device' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to update device' });
    }
  }
);

export const deleteDevice = createAsyncThunk(
  'device/deleteDevice',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.deleteByEndpoint('DEVICE', 'DELETE', { id });

      if (response.status === 1) {
        return { id };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to delete device' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to delete device' });
    }
  }
);

// Slice
const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    setDeviceError: (state, action: PayloadAction<{ error: string }>) => {
      state.error = action.payload.error;
      state.loading = false;
      state.isDone = false;
    },
    resetDevice: (state) => {
      state.devices = [];
      state.device = null;
      state.loading = false;
      state.error = null;
      state.isDone = null;
    },
    setDevice: (state, action: PayloadAction<Device>) => {
      state.device = action.payload;
      state.loading = false;
      state.error = null;
      state.isDone = true;
    },
    setDevices: (state, action: PayloadAction<Device[]>) => {
      state.devices = action.payload;
      state.loading = false;
      state.error = null;
      state.isDone = true;
    },
  },
  extraReducers: (builder) => {
    // fetchDevice
    builder
      .addCase(fetchDevice.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(fetchDevice.fulfilled, (state, action) => {
        state.device = action.payload.device;
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(fetchDevice.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to fetch device';
        state.device = null;
        state.isDone = false;
      });

    // fetchDevices
    builder
      .addCase(fetchDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.devices = action.payload.devices;
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to fetch devices';
        state.devices = [];
        state.isDone = false;
      });

    // createDevice
    builder
      .addCase(createDevice.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(createDevice.fulfilled, (state, action) => {
        state.devices.push(action.payload.device);
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(createDevice.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to create device';
        state.isDone = false;
      });

    // updateDevice
    builder
      .addCase(updateDevice.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(updateDevice.fulfilled, (state, action) => {
        const index = state.devices.findIndex(d => d.id === action.payload.device.id);
        if (index !== -1) {
          state.devices[index] = action.payload.device;
        }
        if (state.device?.id === action.payload.device.id) {
          state.device = action.payload.device;
        }
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(updateDevice.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to update device';
        state.isDone = false;
      });

    // deleteDevice
    builder
      .addCase(deleteDevice.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(deleteDevice.fulfilled, (state, action) => {
        state.devices = state.devices.filter(d => d.id !== action.payload.id);
        if (state.device?.id === action.payload.id) {
          state.device = null;
        }
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(deleteDevice.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to delete device';
        state.isDone = false;
      });

    // scanDevice
    builder
      .addCase(scanDevice.pending, (state) => {
        state.scanning = true;
        state.scanError = null;
        state.scannedDevice = null;
        state.scannedCode = null;
      })
      .addCase(scanDevice.fulfilled, (state, action) => {
        state.scannedDevice = action.payload.device;
        state.scannedCode = action.payload.scannedCode;
        state.scanning = false;
        state.scanError = null;
      })
      .addCase(scanDevice.rejected, (state, action) => {
        state.scanning = false;
        state.scanError = (action.payload as any)?.error || 'Failed to scan device';
        state.scannedDevice = null;
        state.scannedCode = null;
      });
  },
});

// Actions
export const { setDeviceError, resetDevice, setDevice, setDevices } = deviceSlice.actions;

// Selectors
export const selectDevice = (state: { device: DeviceState }) => state.device.device;
export const selectDevices = (state: { device: DeviceState }) => state.device.devices;
export const selectDeviceLoading = (state: { device: DeviceState }) => state.device.loading;
export const selectDeviceError = (state: { device: DeviceState }) => state.device.error;
export const selectDeviceIsDone = (state: { device: DeviceState }) => state.device.isDone;

// Scanning selectors
export const selectScannedDevice = (state: { device: DeviceState }) => state.device.scannedDevice;
export const selectScannedCode = (state: { device: DeviceState }) => state.device.scannedCode;
export const selectScanning = (state: { device: DeviceState }) => state.device.scanning;
export const selectScanError = (state: { device: DeviceState }) => state.device.scanError;

// Reducer
export default deviceSlice.reducer;