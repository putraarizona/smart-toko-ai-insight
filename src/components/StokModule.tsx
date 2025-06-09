import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Eye,
  X,
  Edit,
  SquarePen,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/integrations/supabase/db';
import type { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];

const StokModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    current_stock: '',
    min_stock: '',
    max_stock: '',
    avg_sales: '',
    last_update: new Date().toISOString().split('T')[0],
    status: 'good' as Product['status']
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      // Update status for each product based on new logic
      const updatedData = data.map(product => ({
        ...product,
        status: getStockStatus(parseInt(product.current_stock) || 0, parseInt(product.min_stock) || 0, parseInt(product.max_stock) || 0)
      }));
      setProducts(updatedData);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data produk');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateMaxStock = (min: number, max: number): boolean => {
    return max >= min + 4;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const currentStock = parseInt(formData.current_stock) || 0;
      const minStock = parseInt(formData.min_stock) || 0;
      const maxStock = parseInt(formData.max_stock) || 0;
      const avgSales = parseFloat(formData.avg_sales) || 0;

      if (!validateMaxStock(minStock, maxStock)) {
        setError('Stok maksimum harus lebih besar atau sama dengan stok minimum + 4');
        return;
      }

      const newProduct = {
        ...formData,
        current_stock: currentStock,
        min_stock: minStock,
        max_stock: maxStock,
        avg_sales: avgSales,
        status: getStockStatus(currentStock, minStock, maxStock)
      };

      await createProduct(newProduct);
      await loadProducts();
      setShowAddForm(false);
      setFormData({
        code: '',
        name: '',
        category: '',
        current_stock: '',
        min_stock: '',
        max_stock: '',
        avg_sales: '',
        last_update: new Date().toISOString().split('T')[0],
        status: 'good'
      });
      setError(null);
    } catch (err) {
      setError('Gagal menambahkan produk');
      console.error('Error creating product:', err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const currentStock = parseInt(formData.current_stock) || 0;
      const minStock = parseInt(formData.min_stock) || 0;
      const maxStock = parseInt(formData.max_stock) || 0;
      const avgSales = parseFloat(formData.avg_sales) || 0;

      if (!validateMaxStock(minStock, maxStock)) {
        setError('Stok maksimum harus lebih besar atau sama dengan stok minimum + 4');
        return;
      }

      const updatedProduct = {
        ...formData,
        current_stock: currentStock,
        min_stock: minStock,
        max_stock: maxStock,
        avg_sales: avgSales,
        status: getStockStatus(currentStock, minStock, maxStock)
      };

      await updateProduct(selectedProduct.id, updatedProduct);
      await loadProducts();
      setShowUpdateDialog(false);
      setSelectedProduct(null);
      setError(null);
    } catch (err) {
      setError('Gagal mengupdate produk');
      console.error('Error updating product:', err);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      await deleteProduct(selectedProduct.id);
      await loadProducts();
      setShowDeleteDialog(false);
      setSelectedProduct(null);
    } catch (err) {
      setError('Gagal menghapus produk');
      console.error('Error deleting product:', err);
    }
  };

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

  const getStockStatus = (current: number, min: number, max: number): Product['status'] => {
    // Cek overstock terlebih dahulu
    if (current > max) return 'overstock';
    // Kemudian cek status lainnya
    if (current < min) return 'critical';
    if (current <= min + 4) return 'low';
    return 'good';
  };

  const handleViewDetail = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailDialog(true);
  };

  const handleUpdateClick = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      code: product.code,
      name: product.name,
      category: product.category,
      current_stock: product.current_stock.toString(),
      min_stock: product.min_stock.toString(),
      max_stock: product.max_stock.toString(),
      avg_sales: product.avg_sales.toString(),
      last_update: product.last_update,
      status: product.status
    });
    setShowUpdateDialog(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const filteredData = products.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || item.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const stockSummary = {
    total: products.length,
    critical: products.filter(item => item.status === 'critical').length,
    low: products.filter(item => item.status === 'low').length,
    good: products.filter(item => item.status === 'good').length,
    overstock: products.filter(item => item.status === 'overstock').length,
  };

  // Validasi stok minimum > 0 dan stok maksimum >= minimum + 4
  const isMinStockValid = parseInt(formData.min_stock) > 0;
  const isMaxStockValid = validateMaxStock(parseInt(formData.min_stock), parseInt(formData.max_stock));
  const isFormValid = isMinStockValid && isMaxStockValid;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Modul Stok</h1>
          <p className="text-gray-600 mt-1">Kelola inventori dan monitoring stok real-time</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Produk
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Tambah Produk Baru</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Kode Produk</Label>
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="MP-XK-M32-C"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Produk</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Baby Milk Powder Premium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Baby Care"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_stock">Stok Saat Ini</Label>
                  <Input
                    id="current_stock"
                    name="current_stock"
                    type="number"
                    value={formData.current_stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_stock">Stok Minimum</Label>
                  <Input
                    id="min_stock"
                    name="min_stock"
                    type="number"
                    value={formData.min_stock}
                    onChange={handleInputChange}
                    required
                    min={1}
                  />
                  {!isMinStockValid && (
                    <p className="text-sm text-red-500 mt-1">
                      Stok minimum harus lebih dari 0
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_stock">Stok Maksimum</Label>
                  <Input
                    id="max_stock"
                    name="max_stock"
                    type="number"
                    value={formData.max_stock}
                    onChange={handleInputChange}
                    required
                  />
                  {parseInt(formData.min_stock) > 0 && parseInt(formData.max_stock) > 0 && 
                   !validateMaxStock(parseInt(formData.min_stock), parseInt(formData.max_stock)) && (
                    <p className="text-sm text-red-500 mt-1">
                      Stok maksimum harus ≥ {parseInt(formData.min_stock) + 4}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avg_sales">Rata-rata Penjualan</Label>
                  <Input
                    id="avg_sales"
                    name="avg_sales"
                    type="number"
                    step="0.1"
                    value={formData.avg_sales}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_update">Tanggal Update</Label>
                  <Input
                    id="last_update"
                    name="last_update"
                    type="date"
                    value={formData.last_update}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="text-sm text-red-500 mt-2">
                  {error}
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={!isFormValid}>
                  Simpan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

      <Card>
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
            
            <div className="flex gap-2 flex-wrap">
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
              <Button
                variant={selectedFilter === 'good' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('good')}
                size="sm"
              >
                Aman
              </Button>
              <Button
                variant={selectedFilter === 'overstock' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('overstock')}
                size="sm"
              >
                Berlebih
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
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
                      <p className="text-2xl font-bold text-gray-900">{item.current_stock}</p>
                      <p className="text-xs text-gray-600">Stok Saat Ini</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Min: {item.min_stock}</p>
                      <p className="text-sm text-gray-600">Max: {item.max_stock}</p>
                    </div>
                    
                    <div className="text-center">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                      <p className="text-xs text-gray-600 mt-1">{item.avg_sales}/hari</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewDetail(item)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleUpdateClick(item)}>
                        <SquarePen className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteClick(item)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Produk</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Kode Produk</p>
                  <p className="text-base">{selectedProduct.code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Nama Produk</p>
                  <p className="text-base">{selectedProduct.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Kategori</p>
                  <p className="text-base">{selectedProduct.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge className={getStatusColor(selectedProduct.status)}>
                    {selectedProduct.status.charAt(0).toUpperCase() + selectedProduct.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Stok Saat Ini</p>
                  <p className="text-base">{selectedProduct.current_stock}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Stok Minimum</p>
                  <p className="text-base">{selectedProduct.min_stock}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Stok Maksimum</p>
                  <p className="text-base">{selectedProduct.max_stock}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rata-rata Penjualan</p>
                  <p className="text-base">{selectedProduct.avg_sales}/hari</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Terakhir Update</p>
                  <p className="text-base">{selectedProduct.last_update}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Produk</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="update_code">Kode Produk</Label>
                <Input
                  id="update_code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="update_name">Nama Produk</Label>
                <Input
                  id="update_name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="update_category">Kategori</Label>
                <Input
                  id="update_category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="update_current_stock">Stok Saat Ini</Label>
                <Input
                  id="update_current_stock"
                  name="current_stock"
                  type="number"
                  value={formData.current_stock}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="update_min_stock">Stok Minimum</Label>
                <Input
                  id="update_min_stock"
                  name="min_stock"
                  type="number"
                  value={formData.min_stock}
                  onChange={handleInputChange}
                  required
                  min={1}
                />
                {!isMinStockValid && (
                  <p className="text-sm text-red-500 mt-1">
                    Stok minimum harus lebih dari 0
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="update_max_stock">Stok Maksimum</Label>
                <Input
                  id="update_max_stock"
                  name="max_stock"
                  type="number"
                  value={formData.max_stock}
                  onChange={handleInputChange}
                  required
                />
                {parseInt(formData.min_stock) > 0 && parseInt(formData.max_stock) > 0 && 
                 !validateMaxStock(parseInt(formData.min_stock), parseInt(formData.max_stock)) && (
                  <p className="text-sm text-red-500 mt-1">
                    Stok maksimum harus ≥ {parseInt(formData.min_stock) + 4}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="update_avg_sales">Rata-rata Penjualan</Label>
                <Input
                  id="update_avg_sales"
                  name="avg_sales"
                  type="number"
                  step="0.1"
                  value={formData.avg_sales}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-500 mt-2">
                {error}
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowUpdateDialog(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={!isFormValid}>
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus produk ini secara permanen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StokModule;
