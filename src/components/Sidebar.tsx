
import React from 'react';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  BarChart3, 
  Settings,
  LogOut,
  User,
  Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from './AuthProvider';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, onModuleChange }) => {
  const { signOut, profile, role, isOwner, isKasir } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      roles: ['owner', 'kasir']
    },
    {
      id: 'stok',
      label: 'Manajemen Stok',
      icon: Package,
      roles: ['owner']
    },
    {
      id: 'pembelian',
      label: 'Pembelian',
      icon: ShoppingCart,
      roles: ['owner']
    },
    {
      id: 'penjualan',
      label: 'Penjualan',
      icon: TrendingUp,
      roles: ['owner', 'kasir']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(role || 'kasir')
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {profile?.store_name || 'Sistem Toko'}
            </h1>
            <p className="text-sm text-gray-500">Manajemen Terpadu</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {profile?.owner_name || 'User'}
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant={isOwner ? 'default' : 'secondary'} className="text-xs">
                {role === 'owner' ? 'Pemilik' : 'Kasir'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onModuleChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeModule === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Keluar
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
