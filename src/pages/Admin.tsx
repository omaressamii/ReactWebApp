import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Settings, Database, UserPlus, Lock } from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { isScreenAccessible } from '../constants/Screens';

interface SystemUser {
  id: string;
  username: string;
  email: string;
  role: 'IT' | 'Manager' | 'Admin';
  status: 'active' | 'inactive';
  lastLogin: string;
  location: string;
}

const mockUsers: SystemUser[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@infor.com',
    role: 'Admin',
    status: 'active',
    lastLogin: '2025-01-24T15:30:00Z',
    location: 'All Locations',
  },
  {
    id: '2',
    username: 'john.doe',
    email: 'john.doe@infor.com',
    role: 'IT',
    status: 'active',
    lastLogin: '2025-01-24T14:20:00Z',
    location: 'Building A',
  },
  {
    id: '3',
    username: 'jane.smith',
    email: 'jane.smith@infor.com',
    role: 'Manager',
    status: 'active',
    lastLogin: '2025-01-23T16:45:00Z',
    location: 'Building B',
  },
];

const roleColors = {
  Admin: 'bg-destructive/20 text-destructive',
  IT: 'bg-primary/20 text-primary',
  Manager: 'bg-accent/20 text-accent',
};

const statusColors = {
  active: 'bg-success/20 text-success',
  inactive: 'bg-muted text-muted-foreground',
};

export default function Admin() {
  const { user } = useAppSelector((state) => state.user);
  const [users] = useState<SystemUser[]>(mockUsers);

  if (!isScreenAccessible(user?.role || null, '/admin', user?.permissions)) {
    return (
      <div className="p-6">
        <Card className="gradient-card border-destructive/50">
          <CardContent className="p-12 text-center">
            <Lock className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Administration</h1>
        <p className="text-muted-foreground mt-1">Manage users, permissions, and system settings</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="gradient-card border-border/50 hover:shadow-glow transition-all cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Add User</p>
                <p className="text-xs text-muted-foreground">Create new account</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50 hover:shadow-glow transition-all cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-accent/10">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="font-medium">Permissions</p>
                <p className="text-xs text-muted-foreground">Manage access rights</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50 hover:shadow-glow transition-all cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success/10">
                <Database className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="font-medium">Backup</p>
                <p className="text-xs text-muted-foreground">System backup</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50 hover:shadow-glow transition-all cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-warning/10">
                <Settings className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="font-medium">Settings</p>
                <p className="text-xs text-muted-foreground">System config</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card className="gradient-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
              <CardDescription>Manage system users and their access levels</CardDescription>
            </div>
            <Button className="gradient-primary shadow-glow">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((systemUser) => (
              <div
                key={systemUser.id}
                className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      {systemUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{systemUser.username}</h4>
                        <Badge className={roleColors[systemUser.role]}>
                          {systemUser.role}
                        </Badge>
                        <Badge className={statusColors[systemUser.status]}>
                          {systemUser.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{systemUser.email}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground mb-1">Last Login</p>
                    <p className="font-medium">{new Date(systemUser.lastLogin).toLocaleString()}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <Badge className="bg-success/20 text-success">Online</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">API</span>
                <Badge className="bg-success/20 text-success">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Backup</span>
                <Badge className="bg-success/20 text-success">Scheduled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-5xl font-bold text-primary mb-2">
                {users.filter(u => u.status === 'active').length}
              </p>
              <p className="text-sm text-muted-foreground">Currently Active</p>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Last Backup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Jan 24, 2025</p>
              <p className="text-sm text-muted-foreground">02:00 AM</p>
              <Button variant="outline" size="sm" className="mt-3">
                Run Backup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
