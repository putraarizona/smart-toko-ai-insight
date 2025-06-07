
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import StokModule from '@/components/StokModule';
import SmartAssistant from '@/components/SmartAssistant';

const Index = () => {
  const [activeModule, setActiveModule] = useState('dashboard');

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'stok':
        return <StokModule />;
      case 'penjualan':
        return (
          <div className="p-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Modul Penjualan</h1>
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-8 rounded-xl border-2 border-dashed border-blue-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">🛒 Coming Soon!</h3>
              <p className="text-gray-600">
                Modul Penjualan sedang dalam pengembangan. Fitur yang akan tersedia:
              </p>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li>• Input penjualan harian via form atau CSV</li>
                <li>• Kalkulasi margin otomatis oleh AI</li>
                <li>• Laporan penjualan real-time</li>
                <li>• Tracking customer behavior</li>
              </ul>
            </div>
          </div>
        );
      case 'laporan':
        return (
          <div className="p-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Modul Laporan</h1>
            <div className="bg-gradient-to-r from-purple-50 to-orange-50 p-8 rounded-xl border-2 border-dashed border-purple-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">📊 Coming Soon!</h3>
              <p className="text-gray-600">
                Modul Laporan sedang dalam pengembangan. Fitur yang akan tersedia:
              </p>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li>• Laba Rugi per barang/kategori/supplier</li>
                <li>• Export laporan ke Excel/PDF</li>
                <li>• Analisis trend penjualan</li>
                <li>• Perbandingan performa period to period</li>
              </ul>
            </div>
          </div>
        );
      case 'assistant':
        return <SmartAssistant />;
      case 'settings':
        return (
          <div className="p-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Pengaturan</h1>
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-8 rounded-xl border-2 border-dashed border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">⚙️ Coming Soon!</h3>
              <p className="text-gray-600">
                Halaman pengaturan sedang dalam pengembangan. Fitur yang akan tersedia:
              </p>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li>• Konfigurasi data toko</li>
                <li>• Pengaturan supplier</li>
                <li>• Manajemen kategori produk</li>
                <li>• Import/Export data</li>
              </ul>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
      <main className="flex-1 overflow-y-auto">
        {renderActiveModule()}
      </main>
    </div>
  );
};

export default Index;
