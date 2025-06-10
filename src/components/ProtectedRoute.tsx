
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

  // Set timeout for loading state - increased to 8 seconds to give more time
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  // If loading timeout reached, show login form immediately
  if (loading && timeoutReached) {
    console.log('Loading timeout reached, showing login form');
    return <LoginForm />;
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
