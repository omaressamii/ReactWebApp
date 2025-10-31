import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/api';

export interface Report {
  id: string;
  workOrderNum: string;
  status: 'pending' | 'inprogress' | 'completed' | 'confirmed';
  description: string;
  createdAt: string;
  updatedAt: string;
  workOrderId?: string;
  userId?: string;
  location?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  assignedTo?: string;
  dueDate?: string;
  completedAt?: string;
  confirmedAt?: string;
  confirmedBy?: string;
}

export interface WorkOrderComment {
  id: string;
  workOrderNum: string;
  comment: string;
  user: string;
  transaction: any;
  createdAt: string;
  userId?: string;
  userCodeInfor?: string;
  addType?: string;
  addUrl?: string;
}

interface ReportState {
  reports: Report[];
  selectedReport: Report | null;
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

const initialState: ReportState = {
  reports: [],
  selectedReport: null,
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
export const fetchReports = createAsyncThunk(
  'report/fetchReports',
  async (params: { page?: number; limit?: number; status?: string; type?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('REPORT', 'LIST', params);

      if (response.status === 1 && response.data) {
        return { reports: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch reports' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch reports' });
    }
  }
);

export const fetchReportDetails = createAsyncThunk(
  'report/fetchReportDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('REPORT', 'DETAILS', { id });

      if (response.status === 1 && response.data) {
        return { report: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch report details' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch report details' });
    }
  }
);

export const createReport = createAsyncThunk(
  'report/createReport',
  async (reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'status'>, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('REPORT', 'CREATE', reportData);

      if (response.status === 1 && response.data) {
        return { report: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to create report' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to create report' });
    }
  }
);

export const updateReport = createAsyncThunk(
  'report/updateReport',
  async ({ id, data }: { id: string; data: Partial<Report> }, { rejectWithValue }) => {
    try {
      const response = await apiService.putByEndpoint('REPORT', 'UPDATE', data, { id });

      if (response.status === 1 && response.data) {
        return { report: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to update report' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to update report' });
    }
  }
);

export const updateReportStatus = createAsyncThunk(
  'report/updateReportStatus',
  async ({ id, status }: { id: string; status: Report['status'] }, { rejectWithValue }) => {
    try {
      const response = await apiService.putByEndpoint('REPORT', 'UPDATE', { status }, { id });

      if (response.status === 1 && response.data) {
        return { report: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to update report status' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to update report status' });
    }
  }
);

export const deleteReport = createAsyncThunk(
  'report/deleteReport',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.deleteByEndpoint('REPORT', 'DELETE', { id });

      if (response.status === 1) {
        return { id };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to delete report' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to delete report' });
    }
  }
);

// Legacy async thunks for backward compatibility
export const postReport = createAsyncThunk(
  'report/postReport',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('REPORT', 'CREATE', data);

      if (response.status === 1) {
        return { status: 1, message: 'Report posted successfully' };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to post report' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to post report' });
    }
  }
);

export const getManagerReports = createAsyncThunk(
  'report/getManagerReports',
  async (user: any, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('REPORT', 'LIST', { user, type: 'manager' });

      if (response.status === 1 && response.data) {
        return { status: 1, reports: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch manager reports' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch manager reports' });
    }
  }
);

export const getItReports = createAsyncThunk(
  'report/getItReports',
  async (user: any, { rejectWithValue }) => {
    try {
      const response = await apiService.postByEndpoint('REPORT', 'LIST', { user, type: 'it' });

      if (response.status === 1 && response.data) {
        return { status: 1, reports: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch IT reports' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch IT reports' });
    }
  }
);

export const inprogressReport = createAsyncThunk(
  'report/inprogressReport',
  async (report: any, { rejectWithValue }) => {
    try {
      const response = await apiService.putByEndpoint('REPORT', 'UPDATE', { status: 'inprogress' }, { id: report.id });

      if (response.status === 1 && response.data) {
        return { status: 1, reports: [response.data] };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to update report status' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to update report status' });
    }
  }
);

export const completedReport = createAsyncThunk(
  'report/completedReport',
  async (report: any, { rejectWithValue }) => {
    try {
      const response = await apiService.putByEndpoint('REPORT', 'UPDATE', { status: 'completed' }, { id: report.id });

      if (response.status === 1 && response.data) {
        return { status: 1, reports: [response.data] };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to complete report' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to complete report' });
    }
  }
);

export const confirmReport = createAsyncThunk(
  'report/confirmReport',
  async (report: any, { rejectWithValue }) => {
    try {
      const response = await apiService.putByEndpoint('REPORT', 'UPDATE', { status: 'confirmed' }, { id: report.id });

      if (response.status === 1 && response.data) {
        return { status: 1, reports: [response.data] };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to confirm report' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to confirm report' });
    }
  }
);

export const AddWoComment = createAsyncThunk(
  'report/AddWoComment',
  async (request: any, { rejectWithValue }) => {
    try {
      // Handle file upload for voice comments
      let data: any = {
        workOrderNum: request.workOrderNum,
        comment: request.comment,
        user: request.user,
        user_code_infor: request.user_code_infor,
        transaction: request.transaction,
      };

      if (request.transaction.add_type === 'voice' && request.transaction.add_url) {
        // For file uploads, we need to use FormData
        const formData = new FormData();
        formData.append('workOrderNum', JSON.stringify(request.workOrderNum));
        formData.append('comment', JSON.stringify(request.comment));
        formData.append('user', JSON.stringify(request.user));
        formData.append('user_code_infor', JSON.stringify(request.user_code_infor));
        formData.append('transaction', JSON.stringify(request.transaction));
        formData.append('voice', request.transaction.add_url);

        const response = await apiService.post('/reports/wo-comment', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.status === 1) {
          return { status: 1, message: 'Comment added successfully' };
        } else {
          return rejectWithValue({ error: response.message || 'Failed to add comment' });
        }
      } else {
        // Regular comment without file
        const response = await apiService.post('/reports/wo-comment', data);

        if (response.status === 1) {
          return { status: 1, message: 'Comment added successfully' };
        } else {
          return rejectWithValue({ error: response.message || 'Failed to add comment' });
        }
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to add comment' });
    }
  }
);

export const getWoComments = createAsyncThunk(
  'report/getWoComments',
  async (workorder: any, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/reports/get-wo-comment', workorder);

      if (response.status === 1 && response.data) {
        return { status: 1, comments: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch comments' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch comments' });
    }
  }
);

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setReports: (state, action: PayloadAction<Report[]>) => {
      state.reports = action.payload;
      state.loading = false;
      state.error = null;
      state.isDone = true;
    },
    setSelectedReport: (state, action: PayloadAction<Report | null>) => {
      state.selectedReport = action.payload;
      state.loading = false;
      state.error = null;
      state.isDone = true;
    },
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
      state.selectedReport = null;
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
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchReports
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.reports = action.payload.reports;
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to fetch reports';
        state.reports = [];
        state.isDone = false;
      });

    // fetchReportDetails
    builder
      .addCase(fetchReportDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(fetchReportDetails.fulfilled, (state, action) => {
        state.selectedReport = action.payload.report;
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(fetchReportDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to fetch report details';
        state.selectedReport = null;
        state.isDone = false;
      });

    // createReport
    builder
      .addCase(createReport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.reports.push(action.payload.report);
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(createReport.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to create report';
        state.isDone = false;
      });

    // updateReport
    builder
      .addCase(updateReport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(updateReport.fulfilled, (state, action) => {
        const index = state.reports.findIndex(report => report.id === action.payload.report.id);
        if (index !== -1) {
          state.reports[index] = action.payload.report;
        }
        if (state.selectedReport?.id === action.payload.report.id) {
          state.selectedReport = action.payload.report;
        }
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(updateReport.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to update report';
        state.isDone = false;
      });

    // updateReportStatus
    builder
      .addCase(updateReportStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(updateReportStatus.fulfilled, (state, action) => {
        const report = action.payload.report;
        const index = state.reports.findIndex(r => r.id === report.id);
        if (index !== -1) {
          state.reports[index] = report;
        }
        if (state.selectedReport?.id === report.id) {
          state.selectedReport = report;
        }
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(updateReportStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to update report status';
        state.isDone = false;
      });

    // deleteReport
    builder
      .addCase(deleteReport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isDone = null;
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.reports = state.reports.filter(report => report.id !== action.payload.id);
        if (state.selectedReport?.id === action.payload.id) {
          state.selectedReport = null;
        }
        state.loading = false;
        state.error = null;
        state.isDone = true;
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.error || 'Failed to delete report';
        state.isDone = false;
      });

    // Legacy async thunks for backward compatibility
    builder
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

export const { 
  setReports, 
  setSelectedReport, 
  setComplain, 
  setError, 
  setIsDone, 
  resetReport, 
  resetPostWoComments, 
  resetGetWoComments, 
  clearError 
} = reportSlice.actions;

// Selectors
export const selectReports = (state: { report: ReportState }) => state.report.reports;
export const selectSelectedReport = (state: { report: ReportState }) => state.report.selectedReport;
export const selectReportLoading = (state: { report: ReportState }) => state.report.loading;
export const selectReportError = (state: { report: ReportState }) => state.report.error;
export const selectReportIsDone = (state: { report: ReportState }) => state.report.isDone;
export const selectWoComments = (state: { report: ReportState }) => state.report.getWoComments;
export const selectWoCommentsLoading = (state: { report: ReportState }) => state.report.getWoCommentsLoading;

export default reportSlice.reducer;
