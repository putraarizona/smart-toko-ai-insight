
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Eye
} from 'lucide-react';

const StokModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const stockData = [
    { 
      id: 1, 
      code: 'MP-XK-M32-C', 
      name: 'Baby Milk Powder Premium', 
      category: 'Baby Care',
      currentStock: 15, 
      minStock: 20, 
      maxStock: 100,
      avgSales: 5.2,
      lastUpdate: '2024-01-15',
      status: 'low'
    },
    { 
      id: 2, 
      code: 'BP-XT-L45-A', 
      name: 'Baby Bottle Set', 
      category: 'Feeding',
      currentStock: 45, 
      minStock: 30, 
      maxStock: 80,
      avgSales: 3.8,
      lastUpdate: '2024-01-15',
      status: 'good'
    },
    { 
      id: 3, 
      code: 'KD-MN-S12-B', 
      name: 'Kids Diaper Large', 
      category: 'Baby Care',
      currentStock: 12, 
      minStock: 25, 
      maxStock: 150,
      avgSales: 8.1,
      lastUpdate: '2024-01-14',
      status: 'critical'
    },
    { 
      id: 4, 
      code: 'TP-QW-M67-D', 
      name: 'Toy Puzzle Educational', 
      category: 'Toys',
      currentStock: 67, 
      minStock: 20, 
      maxStock: 100,
      avgSales: 2.5,
      lastUpdate: '2024-01-15',
      status: 'overstock'
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-orange-100 text-orange-800';
      case 'good': return 'bg-green-100 text-green-800';
      case 'overstock': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <TrendingDown className="w-4 h-4" />;
      case 'good': return <TrendingUp className="w-4 h-4" />;
      case 'overstock': return <Package className="w-4 h-4" />;
      default: return null;
    }
  };

  const filteredData = stockData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || item.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const stockSummary = {
    total: stockData.length,
    critical: stockData.filter(item => item.status === 'critical').length,
    low: stockData.filter(item => item.status === 'low').length,
    good: stockData.filter(item => item.status === 'good').length,
    overstock: stockData.filter(item => item.status === 'overstock').length,
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Modul Stok</h1>
          <p className="text-gray-600 mt-1">Kelola inventori dan monitoring stok real-time</p>
        </div>
        <Button className="smart-button">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Produk
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="smart-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stockSummary.total}</div>
            <p className="text-sm text-gray-600">Total Produk</p>
          </CardContent>
        </Card>
        
        <Card className="smart-card border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stockSummary.critical}</div>
            <p className="text-sm text-gray-600">Kritis</p>
          </CardContent>
        </Card>
        
        <Card className="smart-card border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stockSummary.low}</div>
            <p className="text-sm text-gray-600">Rendah</p>
          </CardContent>
        </Card>
        
        <Card className="smart-card border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stockSummary.good}</div>
            <p className="text-sm text-gray-600">Aman</p>
          </CardContent>
        </Card>
        
        <Card className="smart-card border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stockSummary.overstock}</div>
            <p className="text-sm text-gray-600">Berlebih</p>
          </CardContent>
        </Card>
      </div>

      <Card className="smart-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari nama produk atau kode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('all')}
                size="sm"
              >
                Semua
              </Button>
              <Button
                variant={selectedFilter === 'critical' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('critical')}
                size="sm"
              >
                Kritis
              </Button>
              <Button
                variant={selectedFilter === 'low' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('low')}
                size="sm"
              >
                Rendah
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="smart-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-smart-blue" />
            <span>Daftar Inventori</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="space-y-4">
              {filteredData.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(item.status)}
                        <div>
                          <p className="font-medium text-gray-900">{item.code}</p>
                          <p className="text-sm text-gray-600">{item.name}</p>
                          <Badge variant="outline" className="text-xs mt-1">{item.category}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{item.currentStock}</p>
                      <p className="text-xs text-gray-600">Stok Saat Ini</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Min: {item.minStock}</p>
                      <p className="text-sm text-gray-600">Max: {item.maxStock}</p>
                    </div>
                    
                    <div className="text-center">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                      <p className="text-xs text-gray-600 mt-1">{item.avgSales}/hari</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" className="smart-button text-xs px-3">
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="smart-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-smart-purple" />
            <span>Rekomendasi AI</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-l-4 border-red-500">
            <h4 className="font-medium text-gray-900 mb-2">🚨 Perlu Restock Segera</h4>
            <p className="text-sm text-gray-700 mb-2">
              "KD-MN-S12-B" (Kids Diaper Large) - Stok tersisa 12 unit, rata-rata penjualan 8.1/hari
            </p>
            <p className="text-xs text-red-600 font-medium">Prediksi habis dalam 1-2 hari</p>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-l-4 border-orange-500">
            <h4 className="font-medium text-gray-900 mb-2">⚠️ Monitoring Required</h4>
            <p className="text-sm text-gray-700 mb-2">
              "MP-XK-M32-C" (Baby Milk Powder Premium) - Stok di bawah minimum (15 &lt; 20)
            </p>
            <p className="text-xs text-orange-600 font-medium">Prediksi habis dalam 3 hari</p>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-medium text-gray-900 mb-2">📊 Optimasi Stok</h4>
            <p className="text-sm text-gray-700 mb-2">
              "TP-QW-M67-D" (Toy Puzzle Educational) - Overstock, pertimbangkan promosi
            </p>
            <p className="text-xs text-blue-600 font-medium">Stok berlebih 47 unit dari maksimum</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StokModule;
