
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StokModule from './components/StokModule';
import PembelianModule from './components/PembelianModule';
import PenjualanModule from './components/PenjualanModule';
import MasterMarketplaceModule from './components/MasterMarketplaceModule';
import MasterKategoriModule from './components/MasterKategoriModule';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './components/AuthProvider';
import './App.css';

function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  
  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'stok':
        return <StokModule />;
      case 'pembelian':
        return <PembelianModule />;
      case 'penjualan':
        return <PenjualanModule />;
      case 'master-marketplace':
        return <MasterMarketplaceModule />;
      case 'master-kategori':
        return <MasterKategoriModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className="flex h-screen">
                  <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
                  <div className="flex-1 overflow-auto">
                    {renderModule()}
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
