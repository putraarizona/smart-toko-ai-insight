
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import StokModule from '@/components/StokModule';
import PembelianModule from '@/components/PembelianModule';
import PenjualanModule from '@/components/PenjualanModule';
import { useAuth } from '@/components/AuthProvider';

const Index = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const { isOwner } = useAuth();

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'stok':
        return isOwner ? <StokModule /> : <Dashboard />;
      case 'pembelian':
        return isOwner ? <PembelianModule /> : <Dashboard />;
      case 'penjualan':
        return <PenjualanModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
      <main className="flex-1 overflow-auto">
        {renderModule()}
      </main>
    </div>
  );
};

export default Index;
