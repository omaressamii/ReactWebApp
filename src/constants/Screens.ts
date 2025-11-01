// Screen permissions and role-based access control for InFor Web App
// This file defines which screens/features are accessible to different user roles

export type UserRole = 'IT' | 'Manager' | 'Admin';

export interface ScreenPermission {
  id: string;
  name: string;
  description: string;
  path: string;
  icon?: string;
  roles: UserRole[];
  requiresAuth: boolean;
  category: 'dashboard' | 'work-orders' | 'assets' | 'issues' | 'receipts' | 'asset-inquiry' | 'inventory' | 'admin' | 'reports';
}

// Screen definitions with role-based access
export const SCREENS: ScreenPermission[] = [
  // Dashboard
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Main dashboard with overview and quick actions',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['IT', 'Manager', 'Admin'],
    requiresAuth: true,
    category: 'dashboard',
  },

  // Work Orders
  {
    id: 'work-orders',
    name: 'Work Orders',
    description: 'Manage work orders and maintenance tasks',
    path: '/work-orders',
    icon: 'Wrench',
    roles: ['IT', 'Manager', 'Admin'],
    requiresAuth: true,
    category: 'work-orders',
  },
  {
    id: 'work-order-create',
    name: 'Create Work Order',
    description: 'Create new work orders',
    path: '/work-orders/create',
    roles: ['IT', 'Manager', 'Admin'],
    requiresAuth: true,
    category: 'work-orders',
  },
  {
    id: 'work-order-details',
    name: 'Work Order Details',
    description: 'View and edit work order details',
    path: '/work-orders/:id',
    roles: ['IT', 'Manager', 'Admin'],
    requiresAuth: true,
    category: 'work-orders',
  },

  // Assets
  {
    id: 'asset-inquiry',
    name: 'Asset Inquiry',
    description: 'Search and view asset information',
    path: '/asset-inquiry',
    icon: 'Search',
    roles: ['IT', 'Manager', 'Admin'],
    requiresAuth: true,
    category: 'asset-inquiry',
  },
  {
    id: 'issues',
    name: 'Issues',
    description: 'Manage part issues and returns',
    path: '/issues',
    icon: 'Package',
    roles: ['IT', 'Manager', 'Admin'],
    requiresAuth: true,
    category: 'issues',
  },
  {
    id: 'issues-create',
    name: 'Create Issue',
    description: 'Create new part issues',
    path: '/issues/create',
    roles: ['IT', 'Manager', 'Admin'],
    requiresAuth: true,
    category: 'issues',
  },
  {
    id: 'issues-details',
    name: 'Issue Details',
    description: 'View and manage issue details',
    path: '/issues/:issueCode',
    roles: ['IT', 'Manager', 'Admin'],
    requiresAuth: true,
    category: 'issues',
  },
  {
    id: 'issue-return',
    name: 'Issue / Return',
    description: 'Issue and return parts between stores',
    path: '/returns',
    icon: 'ArrowLeftRight',
    roles: ['IT', 'Manager', 'Admin'],
    requiresAuth: true,
    category: 'issues',
  },
  {
    id: 'receipts',
    name: 'Receipts',
    description: 'Manage part receipts',
    path: '/receipts',
    icon: 'PackageCheck',
    roles: ['IT', 'Manager', 'Admin'],
    requiresAuth: true,
    category: 'receipts',
  },

  // Inventory
  {
    id: 'requisitions',
    name: 'Requisitions',
    description: 'Manage part requisitions',
    path: '/requisitions',
    icon: 'FileText',
    roles: ['IT', 'Manager', 'Admin'],
    requiresAuth: true,
    category: 'inventory',
  },
  {
    id: 'requisition-create',
    name: 'Create Requisition',
    description: 'Create new part requisitions',
    path: '/requisitions/create',
    roles: ['IT', 'Manager', 'Admin'],
    requiresAuth: true,
    category: 'inventory',
  },
  {
    id: 'requisition-details',
    name: 'Requisition Details',
    description: 'View and manage individual requisitions',
    path: '/requisitions/:id',
    roles: ['IT', 'Manager', 'Admin'],
    requiresAuth: true,
    category: 'inventory',
  },
  {
    id: 'location-inventory',
    name: 'Location Inventory',
    description: 'View inventory by location',
    path: '/location-inventory',
    icon: 'MapPin',
    roles: ['IT', 'Manager', 'Admin'],
    requiresAuth: true,
    category: 'inventory',
  },
  {
    id: 'asset-arrangements',
    name: 'Asset Arrangements',
    description: 'Manage asset storage arrangements',
    path: '/asset-arrangements',
    icon: 'Grid3X3',
    roles: ['IT', 'Manager', 'Admin'],
    requiresAuth: true,
    category: 'inventory',
  },

  // Reports
  {
    id: 'reports',
    name: 'Reports',
    description: 'View work order and system reports',
    path: '/reports',
    icon: 'BarChart3',
    roles: ['Manager', 'Admin'],
    requiresAuth: true,
    category: 'reports',
  },

  // Admin (Admin only)
  {
    id: 'admin',
    name: 'Admin',
    description: 'User and system administration',
    path: '/admin',
    icon: 'Settings',
    roles: ['Admin'],
    requiresAuth: true,
    category: 'admin',
  },
  {
    id: 'admin-users',
    name: 'User Management',
    description: 'Manage users and permissions',
    path: '/admin/users',
    roles: ['Admin'],
    requiresAuth: true,
    category: 'admin',
  },
  {
    id: 'admin-groups',
    name: 'Group Management',
    description: 'Manage user groups and roles',
    path: '/admin/groups',
    roles: ['Admin'],
    requiresAuth: true,
    category: 'admin',
  },
];

// Helper functions for permission checking
export const hasPermission = (userRole: UserRole | null, screenId: string): boolean => {
  if (!userRole) return false;

  const screen = SCREENS.find(s => s.id === screenId);
  if (!screen) return false;

  return screen.roles.includes(userRole);
};

export const getAllowedScreens = (userRole: UserRole | null): ScreenPermission[] => {
  if (!userRole) return [];

  return SCREENS.filter(screen => screen.roles.includes(userRole));
};

export const getScreensByCategory = (userRole: UserRole | null, category: string): ScreenPermission[] => {
  if (!userRole) return [];

  return SCREENS.filter(screen =>
    screen.roles.includes(userRole) && screen.category === category
  );
};

export const isScreenAccessible = (userRole: UserRole | null, path: string, userPermissions?: string[]): boolean => {
  if (!userRole && (!userPermissions || userPermissions.length === 0)) return false;

  // Find screen by path
  const screen = SCREENS.find(s => {
    // Handle dynamic routes (e.g., /work-orders/:id)
    const screenPath = s.path.replace(/:\w+/g, '[^/]+');
    const regex = new RegExp(`^${screenPath}$`);
    return regex.test(path);
  });

  if (!screen) return false;

  // Check role-based access
  if (userRole && screen.roles.includes(userRole)) {
    return true;
  }

  // Check permission-based access (if user has specific permissions)
  if (userPermissions && userPermissions.length > 0) {
    // Map permission codes to screen access
    // A* = Dashboard/Work Orders, B* = Assets, C* = Inventory/Requisitions, D* = Reports, etc.
    const permissionToCategory: Record<string, string[]> = {
      'A': ['dashboard', 'work-orders'],
      'B': ['assets', 'issues', 'receipts', 'asset-inquiry', 'issue-return'],
      'C': ['inventory', 'requisitions', 'location-inventory', 'arrangements'],
      'D': ['reports'],
      'E': ['admin'],
      'F': ['assets'],
      'G': ['work-orders'],
      'H': ['inventory'],
      'Z': ['dashboard', 'work-orders', 'assets', 'inventory', 'reports', 'admin']
    };

    const hasPermission = userPermissions.some(permission => {
      const category = permission.charAt(0); // Get first character (A, B, C, etc.)
      const allowedCategories = permissionToCategory[category] || [];
      return allowedCategories.includes(screen.category) ||
             permission === screen.id ||
             permission === screen.path ||
             permission === screen.path.replace('/', '') ||
             screen.path.includes(permission);
    });
    if (hasPermission) {
      return true;
    }
  }

  return false;
};

// Navigation menu configuration
export const getNavigationMenu = (userRole: UserRole | null, userPermissions?: string[]) => {
  if (!userRole && (!userPermissions || userPermissions.length === 0)) return [];

  const allowedScreens = getAllowedScreens(userRole);

  // Also include screens accessible via permissions
  let permissionBasedScreens: ScreenPermission[] = [];
  if (userPermissions && userPermissions.length > 0) {
    // Map permission codes to screen access
    const permissionToCategory: Record<string, string[]> = {
      'A': ['dashboard', 'work-orders'],
      'B': ['assets', 'issues', 'receipts', 'asset-inquiry', 'issue-return'],
      'C': ['inventory', 'requisitions', 'location-inventory', 'arrangements'],
      'D': ['reports'],
      'E': ['admin'],
      'F': ['assets'],
      'G': ['work-orders'],
      'H': ['inventory'],
      'Z': ['dashboard', 'work-orders', 'assets', 'inventory', 'reports', 'admin']
    };

    permissionBasedScreens = SCREENS.filter(screen => {
      return userPermissions.some(permission => {
        const category = permission.charAt(0);
        const allowedCategories = permissionToCategory[category] || [];
        return allowedCategories.includes(screen.category);
      });
    });
  }

  // Combine role-based and permission-based screens
  const allAllowedScreens = [...allowedScreens, ...permissionBasedScreens];
  const uniqueScreens = allAllowedScreens.filter((screen, index, self) =>
    index === self.findIndex(s => s.id === screen.id)
  );

  const menuItems = uniqueScreens.filter(screen => screen.icon); // Only screens with icons

  // Group by category
  const categories = ['dashboard', 'work-orders', 'assets', 'issues', 'receipts', 'asset-inquiry', 'inventory', 'reports', 'admin'];

  return categories.map(category => ({
    category,
    items: menuItems.filter(item => item.category === category),
  })).filter(group => group.items.length > 0);
};

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  IT: 1,
  Manager: 2,
  Admin: 3,
};

export const hasRoleLevel = (userRole: UserRole | null, requiredLevel: number): boolean => {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= requiredLevel;
};

// Feature flags based on roles
export const FEATURE_FLAGS = {
  canCreateWorkOrders: (role: UserRole | null) => hasRoleLevel(role, 1), // IT+
  canEditWorkOrders: (role: UserRole | null) => hasRoleLevel(role, 1), // IT+
  canApproveRequisitions: (role: UserRole | null) => hasRoleLevel(role, 2), // Manager+
  canManageUsers: (role: UserRole | null) => role === 'Admin',
  canViewReports: (role: UserRole | null) => hasRoleLevel(role, 2), // Manager+
  canManageGroups: (role: UserRole | null) => role === 'Admin',
  canAccessAdminPanel: (role: UserRole | null) => role === 'Admin',
};