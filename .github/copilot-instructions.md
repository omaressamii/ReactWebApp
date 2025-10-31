# InFor Web App - AI Coding Guidelines

## Migration Status: Phase 4 Complete ✅
**Current Progress**: ~95% complete
**Completed**: Full Redux API integration across all 13 slices + Native feature migration (camera, offline storage, file upload, permissions)
**Next Phase**: Advanced features (real-time notifications, background sync, i18n)

## Architecture Overview
Enterprise asset management React app with Redux Toolkit state management, Axios API service layer, and shadcn/ui component library. The app mirrors InFor Expo mobile functionality with web-specific adaptations.

**Key Files:**
- `src/redux/store.ts` - Redux store with 13 slices (all API-integrated)
- `src/services/api.ts` - Axios service with dynamic config and interceptors
- `src/constants/endpoints.ts` - Complete API endpoint definitions
- `src/App.tsx` - Main app with routing and providers

## ✅ API Integration Status
All Redux slices now use real API calls instead of mock data:
- **Authentication**: `userSlice` - Login, profile, password changes
- **Assets**: `deviceSlice` - CRUD operations, barcode lookup, scanning integration
- **Work Orders**: `workOrderSlice` - Full lifecycle management
- **Issues/Receipts**: `issueSlice`, `receiptSlice` - Part tracking and returns
- **Inventory**: `arrangementSlice`, `assetInventoryLocationSlice` - Bin management, sessions
- **Admin**: `adminSlice` - User/group management, permissions
- **Search**: `searchSlice` - Global search across all entities
- **Reports**: `reportSlice` - Work order reporting and analytics

## Next Phase: Advanced Features
**Priority Features to Implement:**
1. **Real-time Notifications**: WebSocket integration for live updates
2. **Background Sync**: Service Worker for offline queue processing
3. **Internationalization**: EN/AR language support with RTL layout

**Recently Completed - Native Feature Migration:**
- ✅ **Camera/Barcode Scanning**: `useCamera.ts` hook with ZXing library integration
- ✅ **File Upload**: `UploadImageButton.tsx` with multipart upload and drag-and-drop
- ✅ **Offline Storage**: `storage.ts` service replacing AsyncStorage with IndexedDB
- ✅ **Permissions System**: Role-based route guards and UI filtering with `Screens.ts`

**Web-Specific Patterns:**
```typescript
// Camera implementation
const useCamera = () => {
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    // Use ZXing for barcode detection
  };
};

// Offline storage
import { openDB } from 'idb';
const db = await openDB('infor-offline', 1, {
  upgrade(db) {
    db.createObjectStore('workOrders');
    db.createObjectStore('requisitions');
    db.createObjectStore('assets');
  }
});

// File upload with multipart
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return await apiService.postByEndpoint('UPLOAD', 'FILE', formData);
};

// Role-based permissions
import { getNavigationMenu } from '@/constants/Screens';
const menuItems = getNavigationMenu(user?.role || null);
```
    db.createObjectStore('workOrders');
  }
});
```
**Always follow this exact structure for new slices:**

```typescript
// 1. Define interfaces
interface Entity {
  id: string;
  // ... fields
}

interface EntityState {
  entities: Entity[];
  selectedEntity: Entity | null;
  loading: boolean;
  error: string | null;
  isDone: boolean | null;
}

// 2. Async thunks with error handling
export const fetchEntity = createAsyncThunk(
  'entity/fetchEntity',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiService.getByEndpoint('CATEGORY', 'ENDPOINT', params);
      if (response.status === 1 && response.data) {
        return { entity: response.data };
      } else {
        return rejectWithValue({ error: response.message || 'Failed to fetch' });
      }
    } catch (error: any) {
      return rejectWithValue({ error: error.message || 'Failed to fetch' });
    }
  }
);

// 3. Slice with consistent reducers
const entitySlice = createSlice({
  name: 'entity',
  initialState,
  reducers: { /* ... */ },
  extraReducers: (builder) => {
    builder.addCase(fetchEntity.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    // ... fulfilled and rejected cases
  }
});
```

**API Response Convention:** Success responses have `status: 1`, not HTTP status codes.

## API Integration
**Use typed endpoint methods:**
```typescript
// ✅ Correct
await apiService.getByEndpoint('DEVICE', 'LIST', params);
await apiService.postByEndpoint('WORK_ORDER', 'CREATE', data);

// ❌ Avoid direct URLs
await apiService.get('/api/devices');
```

**Error Handling:** Always check `response.status === 1` for success, use `rejectWithValue({ error: message })` for failures.

## Component Patterns
**State Selection:**
```typescript
const { entities, loading, error } = useAppSelector((state) => state.entitySlice);
const dispatch = useAppDispatch();
```

**Forms:** Use shadcn/ui Form components with react-hook-form:
```tsx
<FormField name="fieldName" control={control} render={({ field }) => (
  <FormItem>
    <FormLabel>Field Label</FormLabel>
    <FormControl>
      <Input {...field} />
    </FormControl>
    <FormMessage />
  </FormItem>
)} />
```

## Styling & UI
- **Theme:** Custom dark enterprise theme with CSS variables in `src/index.css`
- **Components:** Use shadcn/ui components from `src/components/ui/`
- **Classes:** Apply `gradient-card` and `gradient-primary` for branded styling
- **Icons:** Use Lucide React icons

## Authentication & Routing
- **Auth:** JWT tokens stored in localStorage as `auth_token`
- **Routes:** Protected routes check `state.user.isAuthenticated` and `user.role`
- **Roles:** Menu items and routes filtered by `user.role` (IT, Manager, Admin) using `Screens.ts`
- **Permissions:** Role-based access control with `hasPermission()` and `getNavigationMenu()` functions

## Development Workflow
- **Build:** `npm run dev` (Vite dev server on port 8080)
- **API Config:** Host/port/protocol stored in localStorage, defaults to localhost:8081
- **State Inspection:** Use Redux DevTools to debug state changes
- **Error Debugging:** Check browser console for API request/response logs

## Key Conventions
- **File Structure:** Feature-based organization (pages, components, redux slices)
- **Imports:** Use `@/` alias for `src/` directory
- **Types:** Strict TypeScript with interfaces for all data structures
- **Naming:** camelCase for variables, PascalCase for components/types
- **Error States:** Consistent loading/error/done state management across slices
- **Permissions:** Use `Screens.ts` for role-based access control and menu generation
- **Camera/Scanning:** Progressive enhancement with fallbacks for unsupported browsers
- **Offline Storage:** IndexedDB for complex data, localStorage for simple config/auth
- **File Upload:** Multipart FormData with progress tracking and error handling
