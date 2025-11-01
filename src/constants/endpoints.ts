// API Endpoints for InFor Web App
// Organized by feature modules to match Redux slices

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    VERIFY_TOKEN: '/auth/verify',
  },

  // User Management
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
  },

  // Work Orders
  WORK_ORDER: {
    LIST: '/work-orders',
    CREATE: '/work-orders',
    UPDATE: '/work-orders/:id',
    DELETE: '/work-orders/:id',
    DETAILS: '/work-orders/:id',
    STATUS_UPDATE: '/work-orders/:id/status',
  },

  // Requisitions
  REQUISITION: {
    LIST: '/requisition/get-it-requisition',
    CREATE: '/requisition/makeRequisition',
    DETAILS: '/requisition/GetOneRequisition',
    UPDATE: '/requisition/updateRequisition',
    PARTS: '/requisition/getRequisitionParts',
    ADD_PART: '/requisition/addRequisitionPart',
    DELETE_PART: '/requisition/deleteRequisitionPart',
    UPDATE_PART: '/requisition/updateRequisitionPart',
    IMAGES: '/requisition/getRequisitionImages',
  },

  // Device/Asset Management
  DEVICE: {
    LIST: '/devices',
    CREATE: '/devices',
    UPDATE: '/devices/:id',
    DELETE: '/devices/:id',
    DETAILS: '/devices/:id',
    SCAN: '/devices/scan',
    BARCODE_LOOKUP: '/devices/barcode/:code',
  },

  // Reports
  REPORT: {
    LIST: '/reports',
    CREATE: '/reports',
    UPDATE: '/reports/:id',
    DELETE: '/reports/:id',
    DETAILS: '/reports/:id',
    GENERATE: '/reports/generate',
    EXPORT: '/reports/:id/export',
  },

  // Search
  SEARCH: {
    GLOBAL: '/search',
    PERSON: '/search/getPerson',
    PART: '/search/getPart',
    ASSETS: '/search/findAsset',
    WORK_ORDERS: '/search/work-orders',
    REQUISITIONS: '/search/requisitions',
  },

  // Issues
  ISSUE: {
    LIST: '/issue/get-it-issue',
    CREATE: '/issue/MakeIssue',
    DETAILS: '/issue/GetOneIssue',
    UPDATE: '/issue/updateIssue',
    PARTS: '/issue/RetrieveIssueParts',
    UPDATE_PARTS: '/issue/UpdateIssueParts',
    IMAGES: '/issue/getIssueImages',
    PRINT: '/issue/printIssue',
  },

  // Receipts
  RECEIPT: {
    LIST: '/receipts',
    CREATE: '/receipts',
    UPDATE: '/receipts/:id',
    DELETE: '/receipts/:id',
    DETAILS: '/receipts/:id',
    PARTS: '/receipts/:id/parts',
  },

  // Issue Returns
  ISSUE_RETURN: {
    MAKE_PART_ISSUE: '/issueReturn/MakePartIssue',
    MAKE_PART_RETURN: '/issueReturn/MakePartReturn',
    GET_ASSET: '/issueReturn/getAsset',
    // Legacy endpoints for future use
    LIST: '/issue-returns',
    CREATE: '/issue-returns',
    UPDATE: '/issue-returns/:id',
    DELETE: '/issue-returns/:id',
    DETAILS: '/issue-returns/:id',
    APPROVE: '/issue-returns/:id/approve',
  },

  // Asset Arrangement
  ARRANGEMENT: {
    LIST: '/arrangements',
    CREATE: '/arrangements',
    UPDATE: '/arrangements/:id',
    DELETE: '/arrangements/:id',
    DETAILS: '/arrangements/:id',
    STORE_BINS: '/arrangements/store-bins',
    BIN_UPDATE: '/arrangements/bins/:id',
  },

  // Asset Inventory Location
  ASSET_INVENTORY_LOCATION: {
    SESSIONS: '/assetInventory/getSessionsAssetInventoryLocation',
    CREATE_SESSION: '/assetInventory/CreateAssetInventorySessionLocation',
    SESSION_DETAILS: '/assetInventory/getSessionAssetInventoryLocation',
    UPDATE_LOCATION: '/assetInventory/updateAssetsInventoryLocation',
    DEPARTMENTS: '/assetInventory/getLocationDepartments',
    ASSETS: '/assetInventory/getAssetsInventoryLocation',
    ADD_TO_LIST: '/assetInventory/AssetToListLocation',
    PRINT_DATA: '/assetInventory/updateAssetPrintData',
    PRINT_DATA_INQUIRY: '/assetInventory/updateAssetPrintDataInquiry',
    INQUIRY_DETAILS: '/assetInventory/updateAssetInquiryDetails',
  },

  // Offline Sync
  OFFLINE_SYNC: {
    STATUS: '/sync/status',
    PROCESS_QUEUE: '/sync/process',
    RETRY_FAILED: '/sync/retry/:id',
    CLEAR_DATA: '/sync/clear',
  },

  // Admin
  ADMIN: {
    USERS: '/admin/users',
    USER_DETAILS: '/admin/users/:id',
    GROUPS: '/admin/groups',
    GROUP_DETAILS: '/admin/groups/:id',
    GROUP_PERMISSIONS: '/admin/groups/:id/permissions',
    UPDATE_GROUP_PERMISSIONS: '/admin/groups/:id/permissions',
    UPDATE_USER_SCREENS: '/admin/users/:id/screens',
  },

  // File Upload
  UPLOAD: {
    IMAGE: '/upload/image',
    DOCUMENT: '/upload/document',
    FILE: '/upload/file',
  },
} as const;

// Helper function to replace path parameters
export const buildEndpoint = (endpoint: string, params: Record<string, string | number> = {}): string => {
  let url = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, String(value));
  });
  return url;
};

// Export types for TypeScript
export type ApiEndpoints = typeof API_ENDPOINTS;
export type EndpointCategory = keyof ApiEndpoints;
export type EndpointKey<T extends EndpointCategory> = keyof ApiEndpoints[T];