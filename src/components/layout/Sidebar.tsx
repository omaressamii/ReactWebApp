import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Wrench, Package, FileText, RotateCcw, Grid3X3, Search, MapPin, Archive, Settings, BarChart3, ClipboardList, FileOutput, FileInput, LayoutGrid, Users } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { getNavigationMenu } from '@/constants/Screens';

// Icon mapping for screens
const iconMap: Record<string, any> = {
  'LayoutDashboard': null, // Dashboard uses default
  'Wrench': Wrench,
  'Package': Package,
  'FileText': FileText,
  'RotateCcw': RotateCcw,
  'Grid3X3': Grid3X3,
  'Search': Search,
  'MapPin': MapPin,
  'Archive': Archive,
  'Settings': Settings,
  'BarChart3': BarChart3,
  'ClipboardList': ClipboardList,
  'FileOutput': FileOutput,
  'FileInput': FileInput,
  'LayoutGrid': LayoutGrid,
  'Users': Users,
};

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAppSelector((state) => state.user);

  const navigationMenu = getNavigationMenu(user?.role || null, user?.permissions);
  const menuItems = navigationMenu.flatMap(category => category.items);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card text-foreground shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-sidebar border-r border-sidebar-border
          transition-transform duration-300 z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 flex flex-col
        `}
      >
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-2xl font-bold text-gradient">InFor</h1>
          <p className="text-sm text-muted-foreground mt-1">Asset Management</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = iconMap[item.icon || ''] || Wrench; // Default to Wrench if icon not found
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${active 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-md' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }
                `}
              >
                <Icon size={20} className={active ? 'text-sidebar-primary' : ''} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent/30">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.username}</p>
                <p className="text-sm text-muted-foreground">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
