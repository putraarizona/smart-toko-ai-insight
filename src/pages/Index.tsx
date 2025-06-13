
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import StokModule from '@/components/StokModule';
import PembelianModule from '@/components/PembelianModule';
import PenjualanModule from '@/components/PenjualanModule';
import MasterKategoriModule from '@/components/MasterKategoriModule';
import MasterMarketplaceModule from '@/components/MasterMarketplaceModule';
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
      case 'master-kategori':
        return isOwner ? <MasterKategoriModule /> : <Dashboard />;
      case 'master-marketplace':
        return isOwner ? <MasterMarketplaceModule /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
      <main className="flex-1 overflow-hidden">
        {renderModule()}
      </main>
    </div>
  );
};

export default Index;
