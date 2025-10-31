import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import workOrderReducer from './slices/workOrderSlice';
import requisitionReducer from './slices/requisitionSlice';
import deviceReducer from './slices/deviceSlice';
import reportReducer from './slices/reportSlice';
import searchReducer from './slices/searchSlice';
import issueReducer from './slices/issueSlice';
import receiptReducer from './slices/receiptSlice';
import issueReturnReducer from './slices/issueReturnSlice';
import arrangementReducer from './slices/arrangementSlice';
import assetInventoryLocationReducer from './slices/assetInventoryLocationSlice';
import offlineSyncReducer from './slices/offlineSyncSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    workOrder: workOrderReducer,
    requisition: requisitionReducer,
    device: deviceReducer,
    report: reportReducer,
    search: searchReducer,
    issue: issueReducer,
    receipt: receiptReducer,
    issueReturn: issueReturnReducer,
    arrangement: arrangementReducer,
    assetInventoryLocation: assetInventoryLocationReducer,
    offlineSync: offlineSyncReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
