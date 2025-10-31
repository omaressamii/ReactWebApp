import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Requisition {
  id: string;
  partName: string;
  requester: string;
  fromStore: string;
  toStore: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface RequisitionState {
  requisitions: Requisition[];
  selectedRequisition: Requisition | null;
  loading: boolean;
}

const initialState: RequisitionState = {
  requisitions: [
    {
      id: 'REQ-001',
      partName: 'Kingston RAM 16GB DDR4',
      requester: 'Sarah Wilson',
      fromStore: 'Central Warehouse',
      toStore: 'Building A Store',
      quantity: 5,
      status: 'approved',
      description: 'Urgent requirement for workstation upgrades',
      createdAt: '2025-01-22T11:00:00Z',
      updatedAt: '2025-01-22T14:20:00Z',
    },
    {
      id: 'REQ-002',
      partName: 'Logitech Wireless Mouse',
      requester: 'Tom Brown',
      fromStore: 'Building B Store',
      toStore: 'Building C Store',
      quantity: 10,
      status: 'pending',
      description: 'Replacement for old wired mice',
      createdAt: '2025-01-23T09:30:00Z',
      updatedAt: '2025-01-23T09:30:00Z',
    },
  ],
  selectedRequisition: null,
  loading: false,
};

const requisitionSlice = createSlice({
  name: 'requisition',
  initialState,
  reducers: {
    setRequisitions: (state, action: PayloadAction<Requisition[]>) => {
      state.requisitions = action.payload;
    },
    setSelectedRequisition: (state, action: PayloadAction<Requisition | null>) => {
      state.selectedRequisition = action.payload;
    },
    addRequisition: (state, action: PayloadAction<Requisition>) => {
      state.requisitions.unshift(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setRequisitions, setSelectedRequisition, addRequisition, setLoading } = requisitionSlice.actions;
export default requisitionSlice.reducer;

