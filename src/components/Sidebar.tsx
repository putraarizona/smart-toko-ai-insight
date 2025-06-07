
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Brain, 
  Settings, 
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const Sidebar = ({ activeModule, onModuleChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stok', label: 'Modul Stok', icon: Package },
    { id: 'penjualan', label: 'Modul Penjualan', icon: ShoppingCart },
    { id: 'laporan', label: 'Laporan', icon: TrendingUp },
    { id: 'assistant', label: 'Smart Assistant', icon: Brain },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-sidebar text-sidebar-foreground h-screen transition-all duration-300 flex flex-col`}>
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 smart-gradient rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-sidebar-primary-foreground">SmartToko</h1>
                <p className="text-xs text-sidebar-foreground">AI System</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-sidebar-foreground hover:text-sidebar-primary-foreground"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeModule === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onModuleChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md' 
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <IconComponent className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        {!isCollapsed && (
          <div className="bg-sidebar-accent rounded-lg p-3">
            <p className="text-xs text-sidebar-accent-foreground font-medium mb-1">
              💡 Tips Smart
            </p>
            <p className="text-xs text-sidebar-foreground">
              Tanya "Produk mana yang paling laris?" di Smart Assistant
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
