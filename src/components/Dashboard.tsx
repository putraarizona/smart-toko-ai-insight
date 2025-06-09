
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  ShoppingCart,
  Users,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getProducts, getSales } from '@/integrations/supabase/db';
import { useAuth } from './AuthProvider';

const Dashboard = () => {
  const { isOwner, profile } = useAuth();
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, salesData] = await Promise.all([
          getProducts(),
          getSales()
        ]);
        setProducts(productsData);
        setSales(salesData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  // Calculate statistics
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.current_stock <= p.min_stock).length;
  const criticalStockProducts = products.filter(p => p.current_stock < p.min_stock).length;
  
  const todaySales = sales.filter(s => {
    const saleDate = new Date(s.sale_date);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString() && s.status === 'completed';
  });

  const totalSalesToday = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const totalMarginToday = todaySales.reduce((sum, sale) => sum + sale.total_margin, 0);
  const transactionCount = todaySales.length;

  // Sample chart data (last 7 days)
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
    
    const daySales = sales.filter(s => {
      const saleDate = new Date(s.sale_date);
      return saleDate.toDateString() === date.toDateString() && s.status === 'completed';
    });
    
    return {
      name: dayName,
      penjualan: daySales.reduce((sum, sale) => sum + sale.total_amount, 0),
      margin: daySales.reduce((sum, sale) => sum + sale.total_margin, 0)
    };
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Selamat datang, {profile?.owner_name || 'User'}! 
            {isOwner ? ' Berikut ringkasan toko Anda.' : ' Berikut ringkasan penjualan hari ini.'}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Penjualan Hari Ini</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSalesToday)}</div>
            <p className="text-xs text-muted-foreground">
              {transactionCount} transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margin Hari Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMarginToday)}</div>
            <p className="text-xs text-muted-foreground">
              Keuntungan bersih
            </p>
          </CardContent>
        </Card>

        {isOwner && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  Barang dalam inventori
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stok Menipis</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{lowStockProducts}</div>
                <p className="text-xs text-muted-foreground">
                  {criticalStockProducts} kritis
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Penjualan 7 Hari Terakhir</CardTitle>
            <CardDescription>Tren penjualan harian</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="penjualan" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Margin 7 Hari Terakhir</CardTitle>
            <CardDescription>Tren keuntungan harian</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="margin" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions (for Owner) or Quick Actions (for Kasir) */}
      {isOwner ? (
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>5 transaksi penjualan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{sale.sale_number}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(sale.sale_date).toLocaleDateString('id-ID')} - {sale.cashier_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(sale.total_amount)}</p>
                    <Badge className={
                      sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                      sale.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {sale.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Shortcut untuk tugas harian</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <ShoppingCart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium">Transaksi Baru</h3>
                <p className="text-sm text-gray-500">Buat penjualan baru</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium">Riwayat Penjualan</h3>
                <p className="text-sm text-gray-500">Lihat transaksi hari ini</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
