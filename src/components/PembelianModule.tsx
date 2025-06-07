
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Calendar,
  Package,
  Store,
  CreditCard,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const PembelianModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Sample purchase data
  const pembelianData = [
    {
      id: 1,
      tanggalPemesanan: '2024-01-15',
      noPesanan: 'PO-2024-001',
      kodeBarang: 'MP-XK-M32-C',
      namaBarang: 'Baby Milk Powder Premium',
      marketplaceSupplier: 'PT Baby Care Indonesia',
      akun: 'Supplier-001',
      qty: 50,
      totalHarga: 2500000,
      hargaPerUnit: 50000,
      status: 'completed'
    },
    {
      id: 2,
      tanggalPemesanan: '2024-01-14',
      noPesanan: 'PO-2024-002',
      kodeBarang: 'BP-XT-L45-A',
      namaBarang: 'Baby Bottle Set',
      marketplaceSupplier: 'Tokopedia - Babyku Store',
      akun: 'tokopedia-babyku',
      qty: 30,
      totalHarga: 900000,
      hargaPerUnit: 30000,
      status: 'pending'
    },
    {
      id: 3,
      tanggalPemesanan: '2024-01-13',
      noPesanan: 'PO-2024-003',
      kodeBarang: 'KD-MN-S12-B',
      namaBarang: 'Kids Diaper Large',
      marketplaceSupplier: 'Shopee - Diaper World',
      akun: 'shopee-diaper',
      qty: 100,
      totalHarga: 1200000,
      hargaPerUnit: 12000,
      status: 'shipped'
    },
    {
      id: 4,
      tanggalPemesanan: '2024-01-12',
      noPesanan: 'PO-2024-004',
      kodeBarang: 'TP-QW-M67-D',
      namaBarang: 'Toy Puzzle Educational',
      marketplaceSupplier: 'PT Mainan Edukatif',
      akun: 'Supplier-002',
      qty: 25,
      totalHarga: 625000,
      hargaPerUnit: 25000,
      status: 'cancelled'
    }
  ];

  const [formData, setFormData] = useState({
    tanggalPemesanan: '',
    noPesanan: '',
    kodeBarang: '',
    namaBarang: '',
    marketplaceSupplier: '',
    akun: '',
    qty: '',
    totalHarga: '',
    hargaPerUnit: '',
    status: 'pending'
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return '✅';
      case 'pending': return '⏳';
      case 'shipped': return '🚚';
      case 'cancelled': return '❌';
      default: return '📦';
    }
  };

  const filteredData = pembelianData.filter(item => {
    const matchesSearch = item.namaBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.kodeBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.noPesanan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.marketplaceSupplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || item.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const purchaseSummary = {
    total: pembelianData.length,
    completed: pembelianData.filter(item => item.status === 'completed').length,
    pending: pembelianData.filter(item => item.status === 'pending').length,
    shipped: pembelianData.filter(item => item.status === 'shipped').length,
    cancelled: pembelianData.filter(item => item.status === 'cancelled').length,
    totalValue: pembelianData.reduce((sum, item) => sum + item.totalHarga, 0)
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto calculate total harga when qty or harga per unit changes
    if (name === 'qty' || name === 'hargaPerUnit') {
      const qty = name === 'qty' ? parseInt(value) || 0 : parseInt(formData.qty) || 0;
      const hargaPerUnit = name === 'hargaPerUnit' ? parseInt(value) || 0 : parseInt(formData.hargaPerUnit) || 0;
      setFormData(prev => ({
        ...prev,
        totalHarga: (qty * hargaPerUnit).toString()
      }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Modul Pembelian</h1>
          <p className="text-gray-600 mt-1">Kelola pembelian dan tracking order supplier</p>
        </div>
        <Button 
          className="smart-button"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Pembelian
        </Button>
      </div>

      {/* Purchase Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="smart-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{purchaseSummary.total}</div>
            <p className="text-sm text-gray-600">Total Order</p>
          </CardContent>
        </Card>
        
        <Card className="smart-card border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{purchaseSummary.completed}</div>
            <p className="text-sm text-gray-600">Selesai</p>
          </CardContent>
        </Card>
        
        <Card className="smart-card border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{purchaseSummary.pending}</div>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
        
        <Card className="smart-card border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{purchaseSummary.shipped}</div>
            <p className="text-sm text-gray-600">Dikirim</p>
          </CardContent>
        </Card>
        
        <Card className="smart-card border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{purchaseSummary.cancelled}</div>
            <p className="text-sm text-gray-600">Dibatalkan</p>
          </CardContent>
        </Card>

        <Card className="smart-card border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-purple-600">{formatCurrency(purchaseSummary.totalValue)}</div>
            <p className="text-sm text-gray-600">Total Nilai</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Purchase Form */}
      {showAddForm && (
        <Card className="smart-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5 text-smart-blue" />
              <span>Tambah Pembelian Baru</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tanggalPemesanan">Tanggal Pemesanan</Label>
                <Input
                  id="tanggalPemesanan"
                  name="tanggalPemesanan"
                  type="date"
                  value={formData.tanggalPemesanan}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="noPesanan">No. Pesanan</Label>
                <Input
                  id="noPesanan"
                  name="noPesanan"
                  placeholder="PO-2024-001"
                  value={formData.noPesanan}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="kodeBarang">Kode Barang</Label>
                <Input
                  id="kodeBarang"
                  name="kodeBarang"
                  placeholder="MP-XK-M32-C"
                  value={formData.kodeBarang}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="namaBarang">Nama Barang</Label>
                <Input
                  id="namaBarang"
                  name="namaBarang"
                  placeholder="Baby Milk Powder Premium"
                  value={formData.namaBarang}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="marketplaceSupplier">Marketplace/Supplier</Label>
                <Input
                  id="marketplaceSupplier"
                  name="marketplaceSupplier"
                  placeholder="PT Baby Care Indonesia"
                  value={formData.marketplaceSupplier}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="akun">Akun</Label>
                <Input
                  id="akun"
                  name="akun"
                  placeholder="Supplier-001"
                  value={formData.akun}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="qty">Quantity</Label>
                <Input
                  id="qty"
                  name="qty"
                  type="number"
                  placeholder="50"
                  value={formData.qty}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hargaPerUnit">Harga Per Unit</Label>
                <Input
                  id="hargaPerUnit"
                  name="hargaPerUnit"
                  type="number"
                  placeholder="50000"
                  value={formData.hargaPerUnit}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalHarga">Total Harga</Label>
                <Input
                  id="totalHarga"
                  name="totalHarga"
                  type="number"
                  placeholder="2500000"
                  value={formData.totalHarga}
                  onChange={handleInputChange}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button className="smart-button">
                Simpan Pembelian
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card className="smart-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari no pesanan, nama barang, supplier..."
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
                variant={selectedFilter === 'pending' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('pending')}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={selectedFilter === 'completed' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('completed')}
                size="sm"
              >
                Selesai
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Table */}
      <Card className="smart-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-smart-blue" />
            <span>Daftar Pembelian</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>No. Pesanan</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Harga/Unit</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{item.tanggalPemesanan}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.noPesanan}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.kodeBarang}</div>
                        <div className="text-sm text-gray-600">{item.namaBarang}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.marketplaceSupplier}</div>
                        <div className="text-sm text-gray-600">{item.akun}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center font-bold">{item.qty}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatCurrency(item.hargaPerUnit)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold">{formatCurrency(item.totalHarga)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusIcon(item.status)} {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="smart-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-smart-purple" />
            <span>Insights Pembelian AI</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-l-4 border-green-500">
            <h4 className="font-medium text-gray-900 mb-2">💰 Supplier Termurah</h4>
            <p className="text-sm text-gray-700 mb-2">
              PT Baby Care Indonesia menawarkan harga terbaik untuk kategori Baby Care dengan rata-rata 15% lebih murah
            </p>
            <p className="text-xs text-green-600 font-medium">Rekomendasi: Tingkatkan order dari supplier ini</p>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-500">
            <h4 className="font-medium text-gray-900 mb-2">📊 Analisis Pembelian</h4>
            <p className="text-sm text-gray-700 mb-2">
              Total pembelian bulan ini: {formatCurrency(purchaseSummary.totalValue)} dengan {purchaseSummary.total} transaksi
            </p>
            <p className="text-xs text-yellow-600 font-medium">Rata-rata nilai per transaksi: {formatCurrency(purchaseSummary.totalValue / purchaseSummary.total)}</p>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-medium text-gray-900 mb-2">⚡ Rekomendasi Reorder</h4>
            <p className="text-sm text-gray-700 mb-2">
              Berdasarkan data penjualan, saatnya reorder "Baby Milk Powder Premium" dalam 3 hari ke depan
            </p>
            <p className="text-xs text-blue-600 font-medium">Estimasi qty optimal: 75 unit berdasarkan trend penjualan</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PembelianModule;
