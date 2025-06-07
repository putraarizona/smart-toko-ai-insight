
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign,
  AlertTriangle,
  Star
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const statsData = [
    { title: 'Total Produk', value: '1,247', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Penjualan Hari Ini', value: 'Rp 2,450,000', icon: ShoppingCart, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Laba Kotor', value: 'Rp 850,000', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Stok Menipis', value: '23', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const salesData = [
    { name: 'Sen', value: 2400 },
    { name: 'Sel', value: 1398 },
    { name: 'Rab', value: 2800 },
    { name: 'Kam', value: 3908 },
    { name: 'Jum', value: 4800 },
    { name: 'Sab', value: 3800 },
    { name: 'Min', value: 4300 },
  ];

  const topProducts = [
    { name: 'MP-XK-M32-C', sales: 145, stock: 23 },
    { name: 'BP-XT-L45-A', sales: 132, stock: 45 },
    { name: 'KD-MN-S12-B', sales: 98, stock: 12 },
    { name: 'TP-QW-M67-D', sales: 87, stock: 67 },
  ];

  const categoryData = [
    { name: 'Baby Care', value: 35, color: '#3B82F6' },
    { name: 'Feeding', value: 25, color: '#10B981' },
    { name: 'Clothing', value: 20, color: '#F97316' },
    { name: 'Toys', value: 15, color: '#8B5CF6' },
    { name: 'Others', value: 5, color: '#6B7280' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Selamat datang di SmartToko AI System</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Today</p>
          <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleDateString('id-ID')}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="smart-card hover:scale-105 transition-transform duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} p-3 rounded-full`}>
                    <IconComponent className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card className="smart-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-smart-blue" />
              <span>Penjualan 7 Hari Terakhir</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`Rp ${value.toLocaleString()}`, 'Penjualan']} />
                <Bar dataKey="value" fill="url(#smartGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="smartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <Card className="smart-card">
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-l-4 border-smart-blue">
              <h4 className="font-medium text-gray-900 mb-2">📈 Rekomendasi Hari Ini</h4>
              <p className="text-sm text-gray-700">
                Produk "MP-XK-M32-C" memiliki tingkat penjualan tinggi tapi stok menipis. 
                Pertimbangkan untuk restock dalam 2-3 hari.
              </p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-purple-50 rounded-lg border-l-4 border-smart-green">
              <h4 className="font-medium text-gray-900 mb-2">💰 Analisis Margin</h4>
              <p className="text-sm text-gray-700">
                Kategori "Baby Care" memiliki margin terbaik (34.5%). 
                Fokus pada promosi kategori ini untuk meningkatkan profit.
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-l-4 border-smart-orange">
              <h4 className="font-medium text-gray-900 mb-2">⚠️ Alert</h4>
              <p className="text-sm text-gray-700">
                23 produk memiliki stok di bawah minimum. 
                Periksa modul stok untuk detail lengkap.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
