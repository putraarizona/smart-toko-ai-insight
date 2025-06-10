
import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import LoginForm from './LoginForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'owner' | 'kasir';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, role, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Set timeout untuk loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 10000); // 10 detik timeout

    return () => clearTimeout(timer);
  }, []);

  // Jika loading terlalu lama, tampilkan error dan option untuk refresh
  if (loading && timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-4">Koneksi Terputus</h1>
          <p className="text-gray-600 mb-6">
            Sistem membutuhkan waktu terlalu lama untuk memuat. Ini mungkin disebabkan oleh:
          </p>
          <ul className="text-left text-gray-600 mb-6 space-y-2">
            <li>• Koneksi internet tidak stabil</li>
            <li>• Session telah berakhir</li>
            <li>• Laptop dalam mode sleep terlalu lama</li>
          </ul>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Muat Ulang Halaman
            </button>
            <button
              onClick={() => {
                // Clear all auth state and redirect to login
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/';
              }}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Keluar dan Login Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
          <p className="mt-2 text-sm text-gray-500">
            Jika loading terlalu lama, silakan refresh halaman
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (requiredRole && role !== requiredRole && role !== 'owner') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Akses Ditolak</h1>
          <p className="text-gray-600">Anda tidak memiliki akses ke halaman ini.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
