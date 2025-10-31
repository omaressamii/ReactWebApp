import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// Types
interface User {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  role: 'IT' | 'Manager' | 'Admin';
  USR_CLASSES: string[];
  userLocationsIds: number[];
  userStoresIds: number[];
  teamId?: number;
  isActive: boolean;
  lastLogin?: string;
  permissions?: string[];
  // Backend properties needed for API calls
  USR_CODE?: string;
  USR_DESC?: string;
  USR_GROUP?: string;
  userOrganizations?: any[];
  userStores?: any[];
  // InFor ERP authentication fields (required for workOrder.inforLogin)
  user_code_infor?: string;
  user_password_infor?: string;
}

// Helper function to determine role from user classes
const getRoleFromUserClasses = (userClasses: string[]): 'IT' | 'Manager' | 'Admin' => {
  if (userClasses.includes('Admin') || userClasses.includes('ADMIN')) {
    return 'Admin';
  }
  if (userClasses.includes('Manager') || userClasses.includes('MANAGER')) {
    return 'Manager';
  }
  return 'IT'; // Default role
};

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthResponse {
  status: number;
  user: any; // Backend user object with properties like USR_CODE, USR_DESC, etc.
  // Note: Backend doesn't provide JWT tokens
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  // Removed token fields since backend doesn't use JWT tokens
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Helper function to encrypt password (matches backend custom encryption)
const encryptPassword = (password: string): string => {
  return password.split('').map(char => {
    const code = char.charCodeAt(0);
    return (code * 5 + 13).toString(16).padStart(4, '0');
  }).join('');
};

// Async thunks
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await apiService.login({
        user_code_infor: credentials.username,
        user_password_infor: encryptPassword(credentials.password),
        deviceId: 'web-client', // Fixed device ID for web client
        appVersion: '1.0.9' // App version
      });

      if (response.status === 1 && response.data) {
        const authData = response.data as AuthResponse;

        // Backend doesn't provide JWT tokens - authentication is session-based
        // No tokens to store

        return authData;
      } else {
        return rejectWithValue({ error: response.error || response.message || 'Login failed' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Login failed' });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.logout();

      // Backend doesn't use JWT tokens - no tokens to clear from localStorage

      if (response.status === 1) {
        return { success: true };
      } else {
        // Still consider logout successful even if API fails
        return { success: true };
      }
    } catch (error: any) {
      // Still consider logout successful even if API call fails
      return { success: true };
    }
  }
);

export const getUserProfile = createAsyncThunk(
  'user/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getUserProfile();

      if (response.status === 1 && response.data) {
        return { user: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to get user profile' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to get user profile' });
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        // Transform backend user data to match frontend User interface
        const backendUser = action.payload.user;
        const transformedUser: User = {
          id: parseInt(backendUser.USR_CODE) || 0,
          username: backendUser.USR_CODE || '',
          fullName: backendUser.USR_DESC || '',
          email: backendUser.USR_EMAILADDRESS || '',
          role: getRoleFromUserClasses(backendUser.USR_CLASSES) || 'IT',
          USR_CLASSES: backendUser.USR_CLASSES || [],
          userLocationsIds: backendUser.userLocationsIds || [],
          userStoresIds: backendUser.userStoresIds || [],
          teamId: backendUser.teamId,
          isActive: backendUser.logout_flag !== '1',
          lastLogin: backendUser.lastLogin,
          permissions: backendUser.User_Screens || [],
          // Include backend properties
          USR_CODE: backendUser.USR_CODE,
          USR_DESC: backendUser.USR_DESC,
          USR_GROUP: backendUser.USR_GROUP,
          userOrganizations: backendUser.userOrganizations,
          userStores: backendUser.userStores,
          // Include InFor ERP authentication fields
          user_code_infor: backendUser.user_code_infor,
          user_password_infor: backendUser.user_password_infor,
        };

        state.user = transformedUser;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Login failed';
        state.isAuthenticated = false;
        state.user = null;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout API fails, clear local state
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });

    // Get profile
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.loading = false;
        state.error = null;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to get user profile';
      });
  },
});

export const { setUser, logout, clearError, setLoading } = userSlice.actions;

// Selectors
export const selectUser = (state: { user: UserState }) => state.user.user;
export const selectIsAuthenticated = (state: { user: UserState }) => state.user.isAuthenticated;
export const selectUserLoading = (state: { user: UserState }) => state.user.loading;
export const selectUserError = (state: { user: UserState }) => state.user.error;

export default userSlice.reducer;
