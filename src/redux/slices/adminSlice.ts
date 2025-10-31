import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Types
interface AdminState {
  getUser: any | null;
  getUserLoading: boolean;
  getUserError: string | null;

  getAllUsers: any[];
  getAllUsersLoading: boolean;
  getAllUsersError: string | null;

  updateUserScreensLoading: boolean;
  updateUserScreensError: string | null;
  updateUserScreensIsDone: boolean | null;

  getAllGroups: any[];
  getAllGroupsLoading: boolean;
  getAllGroupsError: string | null;

  getGroupPermissions: any;
  getGroupPermissionsLoading: boolean;
  getGroupPermissionsError: string | null;

  updateGroupPermissionsLoading: boolean;
  updateGroupPermissionsError: string | null;
  updateGroupPermissionsIsDone: boolean | null;
}

interface ApiResponse {
  status: number;
  user?: any;
  users?: any[];
  allGroups?: any[];
  group?: any;
  error?: string;
  [key: string]: any;
}

// Initial state
const initialState: AdminState = {
  getUser: null,
  getUserLoading: false,
  getUserError: null,

  getAllUsers: [],
  getAllUsersLoading: false,
  getAllUsersError: null,

  updateUserScreensLoading: false,
  updateUserScreensError: null,
  updateUserScreensIsDone: null,

  getAllGroups: [],
  getAllGroupsLoading: false,
  getAllGroupsError: null,

  getGroupPermissions: {},
  getGroupPermissionsLoading: false,
  getGroupPermissionsError: null,

  updateGroupPermissionsLoading: false,
  updateGroupPermissionsError: null,
  updateGroupPermissionsIsDone: null,
};

// Async thunks
export const getUser = createAsyncThunk(
  'admin/getUser',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('ADMIN', 'USER_DETAILS', { id: request.userId });

      if (response.status === 1 && response.data) {
        return { user: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch user' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message });
    }
  }
);

export const getAllUsers = createAsyncThunk(
  'admin/getAllUsers',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('ADMIN', 'USERS', request);

      if (response.status === 1 && response.data) {
        return { users: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch users' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message });
    }
  }
);

export const getAllGroups = createAsyncThunk(
  'admin/getAllGroups',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('ADMIN', 'GROUPS', request);

      if (response.status === 1 && response.data) {
        return { allGroups: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch groups' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message });
    }
  }
);

export const getGroupPermissions = createAsyncThunk(
  'admin/getGroupPermissions',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('ADMIN', 'GROUP_PERMISSIONS', { id: request.groupId });

      if (response.status === 1 && response.data) {
        return { group: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch group permissions' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message });
    }
  }
);

export const updateGroupPermissions = createAsyncThunk(
  'admin/updateGroupPermissions',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.putByEndpoint('ADMIN', 'UPDATE_GROUP_PERMISSIONS', request, { id: request.groupId });

      if (response.status === 1) {
        return { message: response.message || 'Group permissions updated successfully' };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to update group permissions' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message });
    }
  }
);

export const updateUserScreens = createAsyncThunk(
  'admin/updateUserScreens',
  async (request: any, { rejectWithValue }) => {
    try {
      const response = await apiService.putByEndpoint('ADMIN', 'UPDATE_USER_SCREENS', request, { id: request.userId });

      if (response.status === 1) {
        return { message: response.message || 'User screens updated successfully' };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to update user screens' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message });
    }
  }
);

// Slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    resetGetUser: (state) => {
      state.getUser = null;
      state.getUserLoading = false;
      state.getUserError = null;
    },

    resetGetAllGroups: (state) => {
      state.getAllGroups = [];
      state.getAllGroupsLoading = false;
      state.getAllGroupsError = null;
    },

    resetGetGroupPermissions: (state) => {
      state.getGroupPermissions = {};
      state.getGroupPermissionsLoading = false;
      state.getGroupPermissionsError = null;
    },

    resetUpdateGroupPermissions: (state) => {
      state.updateGroupPermissionsLoading = false;
      state.updateGroupPermissionsError = null;
      state.updateGroupPermissionsIsDone = null;
    },

    resetUpdateUserScreens: (state) => {
      state.updateUserScreensLoading = false;
      state.updateUserScreensError = null;
      state.updateUserScreensIsDone = null;
    },

    setGetAllUsers: (state) => {
      state.getAllUsers = [];
      state.getAllUsersLoading = false;
      state.getAllUsersError = null;
    },

    setGetUser: (state, action) => {
      state.getUser = action.payload;
      state.getUserLoading = false;
      state.getUserError = null;
    },

    UPDATE_GROUP_PERMISSIONS: (state, action) => {
      state.getGroupPermissions = action.payload;
      state.getGroupPermissionsLoading = false;
      state.getGroupPermissionsError = null;
    },
  },
  extraReducers: (builder) => {
    // getUser
    builder
      .addCase(getUser.pending, (state) => {
        state.getUser = null;
        state.getUserLoading = true;
        state.getUserError = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.getUser = action.payload.user;
        state.getUserLoading = false;
        state.getUserError = null;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.getUser = null;
        state.getUserLoading = false;
        state.getUserError = (action.payload as any)?.error || 'Unknown error';
      });

    // getAllUsers
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.getAllUsers = [];
        state.getAllUsersLoading = true;
        state.getAllUsersError = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.getAllUsers = action.payload.users || [];
        state.getAllUsersLoading = false;
        state.getAllUsersError = null;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.getAllUsers = [];
        state.getAllUsersLoading = false;
        state.getAllUsersError = (action.payload as any)?.error || 'Unknown error';
      });

    // getAllGroups
    builder
      .addCase(getAllGroups.pending, (state) => {
        state.getAllGroups = [];
        state.getAllGroupsLoading = true;
        state.getAllGroupsError = null;
      })
      .addCase(getAllGroups.fulfilled, (state, action) => {
        state.getAllGroups = action.payload.allGroups || [];
        state.getAllGroupsLoading = false;
        state.getAllGroupsError = null;
      })
      .addCase(getAllGroups.rejected, (state, action) => {
        state.getAllGroups = [];
        state.getAllGroupsLoading = false;
        state.getAllGroupsError = (action.payload as any)?.error || 'Unknown error';
      });

    // getGroupPermissions
    builder
      .addCase(getGroupPermissions.pending, (state) => {
        state.getGroupPermissions = {};
        state.getGroupPermissionsLoading = true;
        state.getGroupPermissionsError = null;
      })
      .addCase(getGroupPermissions.fulfilled, (state, action) => {
        state.getGroupPermissions = action.payload.group || {};
        state.getGroupPermissionsLoading = false;
        state.getGroupPermissionsError = null;
      })
      .addCase(getGroupPermissions.rejected, (state, action) => {
        state.getGroupPermissions = {};
        state.getGroupPermissionsLoading = false;
        state.getGroupPermissionsError = (action.payload as any)?.error || 'Unknown error';
      });

    // updateGroupPermissions
    builder
      .addCase(updateGroupPermissions.pending, (state) => {
        state.updateGroupPermissionsLoading = true;
        state.updateGroupPermissionsError = null;
        state.updateGroupPermissionsIsDone = null;
      })
      .addCase(updateGroupPermissions.fulfilled, (state) => {
        state.updateGroupPermissionsLoading = false;
        state.updateGroupPermissionsError = null;
        state.updateGroupPermissionsIsDone = true;
      })
      .addCase(updateGroupPermissions.rejected, (state, action) => {
        state.updateGroupPermissionsLoading = false;
        state.updateGroupPermissionsError = (action.payload as any)?.error || 'Unknown error';
        state.updateGroupPermissionsIsDone = false;
      });

    // updateUserScreens
    builder
      .addCase(updateUserScreens.pending, (state) => {
        state.updateUserScreensLoading = true;
        state.updateUserScreensError = null;
        state.updateUserScreensIsDone = null;
      })
      .addCase(updateUserScreens.fulfilled, (state) => {
        state.updateUserScreensLoading = false;
        state.updateUserScreensError = null;
        state.updateUserScreensIsDone = true;
      })
      .addCase(updateUserScreens.rejected, (state, action) => {
        state.updateUserScreensLoading = false;
        state.updateUserScreensError = (action.payload as any)?.error || 'Unknown error';
        state.updateUserScreensIsDone = false;
      });
  },
});

// Actions
export const adminAction = adminSlice.actions;

// Reducer
export default adminSlice.reducer;