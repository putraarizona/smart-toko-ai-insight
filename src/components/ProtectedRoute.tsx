
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

  // Set timeout for loading state - reduced to 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 5000); // Reduced from 10 seconds

    return () => clearTimeout(timer);
  }, []);

  // If user exists but loading is taking too long, show timeout with better options
  if (loading && timeoutReached && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-blue-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-4">Memuat Data Pengguna</h1>
          <p className="text-gray-600 mb-6">
            Sistem sedang memuat data Anda. Jika terlalu lama, coba refresh halaman.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Halaman
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no user and loading timeout, show connection error
  if (loading && timeoutReached && !user) {
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

  // Normal loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // If user not logged in, show login form
  if (!user) {
    return <LoginForm />;
  }

  // If user logged in but role not loaded, wait a bit more
  if (user && !role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pengguna...</p>
        </div>
      </div>
    );
  }

  // Check role access
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
