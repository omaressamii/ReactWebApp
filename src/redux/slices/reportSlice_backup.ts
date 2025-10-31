import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
interface Report {
  id: string;
  workOrderNum: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  // Add other report properties as needed
}

interface WorkOrderComment {
  id: string;
  workOrderNum: string;
  comment: string;
  user: string;
  transaction: any;
  createdAt: string;
}

interface ReportState {
  reports: Report[];
  loading: boolean;
  error: string | null;
  isDone: boolean | null;
  complain: any;
  getWoComments: WorkOrderComment[];
  getWoCommentsLoading: boolean;
  getWoCommentsError: string | null;
  getWoCommentsIsDone: boolean | null;
  postWoCommentsLoading: boolean;
  postWoCommentsError: string | null;
  postWoCommentsIsDone: boolean | null;
}

// Initial state
const initialState: ReportState = {
  reports: [],
  loading: false,
  error: null,
  isDone: null,
  complain: null,
  getWoComments: [],
  getWoCommentsLoading: false,
  getWoCommentsError: null,
  getWoCommentsIsDone: null,
  postWoCommentsLoading: false,
  postWoCommentsError: null,
  postWoCommentsIsDone: null,
};

// Async thunks
export const postReport = createAsyncThunk(
  'report/postReport',
  async (data: any, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call when API is configured
      // const response = await axios.post(`${API_BASE_URL}/reports/add-report`, data, {
      //   headers: { 'Content-Type': 'application/json' },
      // });

      // Mock response for now
      return { status: 1, message: 'Report posted successfully' };
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to post report' });
    }
  }
);

export const getManagerReports = createAsyncThunk(
  'report/getManagerReports',
  async (user: any, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call when API is configured
      // const response = await axios.post(`${API_BASE_URL}/reports/get-manager-report`, { user }, {
      //   headers: { 'Content-Type': 'application/json' },
      // });

      // Mock response for now
      const mockReports: Report[] = [
        {
          id: '1',
          workOrderNum: 'WO001',
          status: 'PENDING',
          description: 'Sample manager report',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      return { status: 1, reports: mockReports };
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch manager reports' });
    }
  }
);

export const getItReports = createAsyncThunk(
  'report/getItReports',
  async (user: any, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call when API is configured
      // const response = await axios.post(`${API_BASE_URL}/reports/get-it-report`, { user }, {
      //   headers: { 'Content-Type': 'application/json' },
      // });

      // Mock response for now
      const mockReports: Report[] = [
        {
          id: '2',
          workOrderNum: 'WO002',
          status: 'IN_PROGRESS',
          description: 'Sample IT report',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      return { status: 1, reports: mockReports };
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch IT reports' });
    }
  }
);

export const inprogressReport = createAsyncThunk(
  'report/inprogressReport',
  async (report: any, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call when API is configured
      // const response = await axios.post(`${API_BASE_URL}/reports/inprogress`, report, {
      //   headers: { 'Content-Type': 'application/json' },
      // });

      // Mock response for now
      const mockReports: Report[] = [
        {
          id: '1',
          workOrderNum: 'WO001',
          status: 'IN_PROGRESS',
          description: 'Report marked as in progress',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      return { status: 1, reports: mockReports };
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to update report status' });
    }
  }
);

export const completedReport = createAsyncThunk(
  'report/completedReport',
  async (report: any, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call when API is configured
      // const response = await axios.post(`${API_BASE_URL}/reports/completed`, report, {
      //   headers: { 'Content-Type': 'application/json' },
      // });

      // Mock response for now
      const mockReports: Report[] = [
        {
          id: '1',
          workOrderNum: 'WO001',
          status: 'COMPLETED',
          description: 'Report marked as completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      return { status: 1, reports: mockReports };
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to complete report' });
    }
  }
);

export const confirmReport = createAsyncThunk(
  'report/confirmReport',
  async (report: any, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call when API is configured
      // const response = await axios.post(`${API_BASE_URL}/reports/confirmed`, report, {
      //   headers: { 'Content-Type': 'application/json' },
      // });

      // Mock response for now
      const mockReports: Report[] = [
        {
          id: '1',
          workOrderNum: 'WO001',
          status: 'CONFIRMED',
          description: 'Report confirmed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      return { status: 1, reports: mockReports };
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to confirm report' });
    }
  }
);

export const AddWoComment = createAsyncThunk(
  'report/AddWoComment',
  async (request: any, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call when API is configured
      // const data = new FormData();
      // data.append("workOrderNum", JSON.stringify(request.workOrderNum));
      // data.append("comment", JSON.stringify(request.comment));
      // data.append("user", JSON.stringify(request.user));
      // data.append("user_code_infor", JSON.stringify(request.user_code_infor));
      // data.append("transaction", JSON.stringify(request.transaction));
      // if (request.transaction.add_type === "voice") {
      //   data.append("voice", request.transaction.add_url);
      // }
      // const response = await axios.post(`${API_BASE_URL}/reports/wo-comment`, data, {
      //   headers: { 'Content-Type': 'multipart/form-data' },
      // });

      // Mock response for now
      return { status: 1, message: 'Comment added successfully' };
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to add comment' });
    }
  }
);

export const getWoComments = createAsyncThunk(
  'report/getWoComments',
  async (workorder: any, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call when API is configured
      // const response = await axios.post(`${API_BASE_URL}/reports/get-wo-comment`, workorder, {
      //   headers: { 'Content-Type': 'application/json' },
      // });

      // Mock response for now
      const mockComments: WorkOrderComment[] = [
        {
          id: '1',
          workOrderNum: workorder.workOrderNum,
          comment: 'Sample comment',
          user: 'user1',
          transaction: {},
          createdAt: new Date().toISOString(),
        },
      ];

      return { status: 1, comments: mockComments };
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch comments' });
    }
  }
);

// Slice
const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setComplain: (state, action: PayloadAction<{ complain: any }>) => {
      state.complain = action.payload.complain;
    },
    setError: (state, action: PayloadAction<{ error: string }>) => {
      state.error = action.payload.error;
    },
    setIsDone: (state, action: PayloadAction<{ isDone: boolean }>) => {
      state.isDone = action.payload.isDone;
    },
    resetReport: (state) => {
      state.reports = [];
      state.complain = null;
      state.getWoComments = [];
      state.loading = false;
      state.error = null;
      state.isDone = null;
    },
    resetPostWoComments: (state) => {
      state.postWoCommentsLoading = true;
      state.postWoCommentsError = null;
      state.postWoCommentsIsDone = null;
    },
    resetGetWoComments: (state) => {
      state.getWoComments = [];
      state.getWoCommentsLoading = true;
      state.getWoCommentsError = null;
      state.getWoCommentsIsDone = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // postReport
      .addCase(postReport.pending, (state) => {
        state.complain = null;
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(postReport.fulfilled, (state) => {
        state.complain = null;
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(postReport.rejected, (state, action) => {
        state.complain = null;
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to post report';
        state.isDone = false;
      })
      // getManagerReports
      .addCase(getManagerReports.pending, (state) => {
        state.reports = [];
        state.complain = null;
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(getManagerReports.fulfilled, (state, action) => {
        state.reports = action.payload.reports;
        state.complain = null;
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(getManagerReports.rejected, (state, action) => {
        state.reports = [];
        state.complain = null;
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to fetch manager reports';
        state.isDone = false;
      })
      // confirmReport
      .addCase(confirmReport.pending, (state) => {
        state.complain = null;
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(confirmReport.fulfilled, (state, action) => {
        state.reports = action.payload.reports || state.reports;
        state.complain = null;
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(confirmReport.rejected, (state, action) => {
        state.complain = null;
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to confirm report';
        state.isDone = false;
      })
      // getItReports
      .addCase(getItReports.pending, (state) => {
        state.complain = null;
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(getItReports.fulfilled, (state, action) => {
        state.reports = action.payload.reports;
        state.complain = null;
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(getItReports.rejected, (state, action) => {
        state.complain = null;
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to fetch IT reports';
        state.isDone = false;
      })
      // inprogressReport
      .addCase(inprogressReport.pending, (state) => {
        state.complain = null;
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(inprogressReport.fulfilled, (state, action) => {
        state.reports = action.payload.reports || state.reports;
        state.complain = null;
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(inprogressReport.rejected, (state, action) => {
        state.complain = null;
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to update report status';
        state.isDone = false;
      })
      // completedReport
      .addCase(completedReport.pending, (state) => {
        state.complain = null;
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(completedReport.fulfilled, (state, action) => {
        state.reports = action.payload.reports || state.reports;
        state.complain = null;
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(completedReport.rejected, (state, action) => {
        state.complain = null;
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to complete report';
        state.isDone = false;
      })
      // AddWoComment
      .addCase(AddWoComment.pending, (state) => {
        state.postWoCommentsLoading = true;
        state.postWoCommentsError = null;
        state.postWoCommentsIsDone = null;
      })
      .addCase(AddWoComment.fulfilled, (state) => {
        state.postWoCommentsLoading = false;
        state.postWoCommentsError = null;
        state.postWoCommentsIsDone = true;
      })
      .addCase(AddWoComment.rejected, (state, action) => {
        state.postWoCommentsLoading = false;
        state.postWoCommentsError = (action.payload as any)?.error || 'Failed to add comment';
        state.postWoCommentsIsDone = false;
      })
      // getWoComments
      .addCase(getWoComments.pending, (state) => {
        state.getWoComments = [];
        state.getWoCommentsLoading = true;
        state.getWoCommentsError = null;
        state.getWoCommentsIsDone = null;
      })
      .addCase(getWoComments.fulfilled, (state, action) => {
        state.getWoComments = action.payload.comments;
        state.getWoCommentsLoading = false;
        state.getWoCommentsError = null;
        state.getWoCommentsIsDone = true;
      })
      .addCase(getWoComments.rejected, (state, action) => {
        state.getWoComments = [];
        state.getWoCommentsLoading = false;
        state.getWoCommentsError = (action.payload as any)?.error || 'Failed to fetch comments';
        state.getWoCommentsIsDone = false;
      });
  },
});

// Actions
export const { setComplain, setError, setIsDone, resetReport, resetPostWoComments, resetGetWoComments } = reportSlice.actions;

// Selectors
export const selectReports = (state: { report: ReportState }) => state.report.reports;
export const selectReportLoading = (state: { report: ReportState }) => state.report.loading;
export const selectReportError = (state: { report: ReportState }) => state.report.error;
export const selectReportIsDone = (state: { report: ReportState }) => state.report.isDone;
export const selectWoComments = (state: { report: ReportState }) => state.report.getWoComments;
export const selectWoCommentsLoading = (state: { report: ReportState }) => state.report.getWoCommentsLoading;

// Reducer
export default reportSlice.reducer;
