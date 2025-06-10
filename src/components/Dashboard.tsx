
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
  Calendar,
  Star
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
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

  // Category distribution data
  const categoryData = products.reduce((acc, product) => {
    const category = product.category || 'Others';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const categoryPieData = Object.entries(categoryData).map(([name, value], index) => ({
    name,
    value,
    color: ['#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#6B7280', '#EF4444', '#F59E0B'][index % 7]
  }));

  // Top selling products (mock data for now - you can enhance this with actual sales details)
  const topProducts = products
    .sort((a, b) => (b.current_stock < b.min_stock ? 1 : 0) - (a.current_stock < a.min_stock ? 1 : 0))
    .slice(0, 4)
    .map(product => ({
      name: product.code,
      sales: Math.floor(Math.random() * 200) + 50, // Mock sales data
      stock: product.current_stock
    }));

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

      {/* New sections from old version */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="smart-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-smart-green" />
              <span>Distribusi Kategori</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="smart-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-smart-orange" />
              <span>Produk Terlaris</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.sales} terjual</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">Stok: {product.stock}</p>
                  <p className={`text-sm ${product.stock < 20 ? 'text-orange-600' : 'text-green-600'}`}>
                    {product.stock < 20 ? 'Perlu Restock' : 'Aman'}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights or Recent Transactions */}
      {isOwner ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {/* AI Insights */}
          <Card className="smart-card">
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-medium text-gray-900 mb-2">📈 Rekomendasi Hari Ini</h4>
                <p className="text-sm text-gray-700">
                  {lowStockProducts > 0 
                    ? `${lowStockProducts} produk memiliki stok menipis. Pertimbangkan untuk restock dalam 2-3 hari.`
                    : 'Semua produk memiliki stok yang aman. Pertahankan performa ini!'
                  }
                </p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-green-50 to-purple-50 rounded-lg border-l-4 border-green-500">
                <h4 className="font-medium text-gray-900 mb-2">💰 Analisis Margin</h4>
                <p className="text-sm text-gray-700">
                  {totalMarginToday > 0 
                    ? `Margin hari ini ${formatCurrency(totalMarginToday)}. ${totalMarginToday > 500000 ? 'Performa sangat baik!' : 'Ada ruang untuk peningkatan.'}`
                    : 'Belum ada penjualan hari ini. Saatnya mulai promosi!'
                  }
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-l-4 border-orange-500">
                <h4 className="font-medium text-gray-900 mb-2">⚠️ Alert</h4>
                <p className="text-sm text-gray-700">
                  {criticalStockProducts > 0 
                    ? `${criticalStockProducts} produk memiliki stok kritis. Periksa modul stok untuk detail lengkap.`
                    : 'Tidak ada produk dengan stok kritis. Manajemen inventory berjalan baik!'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
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
