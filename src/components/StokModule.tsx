import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct, getProductCategories } from '@/integrations/supabase/db';
import type { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];
type ProductCategory = Database['public']['Tables']['product_categories']['Row'];

const StokModule = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    current_stock: 0,
    min_stock: 0,
    max_stock: 0,
    harga_jual: 0,
    wac_harga_beli: 0,
    status: 'active' as 'active' | 'inactive',
    avg_sales: 0
  });

  const [isMinStockValid, setIsMinStockValid] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await getProducts();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getProductCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const updateProductStatus = async (productId: number, currentStock: number, minStock: number, maxStock: number) => {
    try {
      const status = getStockStatus(currentStock, minStock, maxStock).status;
      const last_update = new Date().toISOString().split('T')[0];
      await updateProduct(productId, { status, last_update });
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        await updateProductStatus(
          editingProduct.id,
          formData.current_stock,
          formData.min_stock,
          formData.max_stock
        );
      } else {
        const productData = {
          code: formData.code,
          name: formData.name,
          category: formData.category,
          current_stock: formData.current_stock,
          min_stock: formData.min_stock,
          max_stock: formData.max_stock,
          harga_jual: formData.harga_jual,
          wac_harga_beli: formData.wac_harga_beli,
          avg_sales: formData.avg_sales,
          last_update: new Date().toISOString().split('T')[0],
          status: 'good',
        };
        const newProduct = await createProduct(productData);
        if (newProduct) {
          await updateProductStatus(
            newProduct.id,
            formData.current_stock,
            formData.min_stock,
            formData.max_stock
          );
        }
      }
      await fetchProducts();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      code: product.code,
      name: product.name,
      category: product.category,
      current_stock: product.current_stock,
      min_stock: product.min_stock,
      max_stock: product.max_stock,
      harga_jual: Number(product.harga_jual) || 0,
      wac_harga_beli: Number(product.wac_harga_beli) || 0,
      status: product.status as 'active' | 'inactive',
      avg_sales: Number(product.avg_sales) || 0
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus produk ini?`)) {
      try {
        await deleteProduct(id);
        await fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      category: '',
      current_stock: 0,
      min_stock: 0,
      max_stock: 0,
      harga_jual: 0,
      wac_harga_beli: 0,
      status: 'active',
      avg_sales: 0
    });
    setEditingProduct(null);
    setCategorySearch('');
    setIsMinStockValid(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? Number(value) : value;
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    if (editingProduct && ['current_stock', 'min_stock', 'max_stock'].includes(name)) {
      const currentStock = name === 'current_stock' ? Number(value) : formData.current_stock;
      const minStock = name === 'min_stock' ? Number(value) : formData.min_stock;
      const maxStock = name === 'max_stock' ? Number(value) : formData.max_stock;
      
      updateProductStatus(editingProduct.id, currentStock, minStock, maxStock);
    }
  };

  const validateMaxStock = (min: number, max: number): boolean => {
    return max >= min + 4;
  };

  const getStatusColor = (status: Product['status']) => {
    switch(status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-orange-100 text-orange-800';
      case 'good': return 'bg-green-100 text-green-800';
      case 'overstock': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Product['status']) => {
    switch(status) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <TrendingDown className="w-4 h-4" />;
      case 'good': return <TrendingUp className="w-4 h-4" />;
      case 'overstock': return <Package className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStockStatus = (current: number, min: number, max: number): { status: Product['status'], color: string } => {
    // Cek overstock terlebih dahulu
    if (current > max) return { status: 'overstock', color: 'info' };
    // Kemudian cek status lainnya
    if (current < min) return { status: 'critical', color: 'destructive' };
    if (current <= min + 4) return { status: 'low', color: 'warning' };
    return { status: 'good', color: 'success' };
  };

  // Fixed calculation for total stock value
  const totalStockValue = products.reduce((total, product) => {
    const wacPrice = Number(product.wac_harga_beli) || 0;
    const currentStock = Number(product.current_stock) || 0;
    return total + (currentStock * wacPrice);
  }, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Stok</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Kode Produk</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingProduct}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nama Produk</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1">
                      <Input
                        placeholder="Cari kategori..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_stock">Stok Saat Ini</Label>
                  <Input
                    id="current_stock"
                    name="current_stock"
                    type="number"
                    value={String(formData.current_stock)}
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
                    value={String(formData.min_stock)}
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_stock">Stok Maksimum</Label>
                  <Input
                    id="max_stock"
                    name="max_stock"
                    type="number"
                    value={String(formData.max_stock)}
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
                  <Label htmlFor="harga_jual">Harga Jual</Label>
                  <Input
                    id="harga_jual"
                    name="harga_jual"
                    type="number"
                    value={String(formData.harga_jual)}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wac_harga_beli">WAC Harga Beli</Label>
                  <Input
                    id="wac_harga_beli"
                    name="wac_harga_beli"
                    type="number"
                    value={String(formData.wac_harga_beli)}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avg_sales">Rata-rata Penjualan</Label>
                  <Input
                    id="avg_sales"
                    name="avg_sales"
                    type="number"
                    value={String(formData.avg_sales)}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit">
                  {editingProduct ? 'Update' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.current_stock <= p.min_stock).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nilai Stok</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {totalStockValue.toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategori</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(products.map(p => p.category)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Cari produk berdasarkan nama, kode, atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Min/Max</TableHead>
                  <TableHead>Harga Jual</TableHead>
                  <TableHead>WAC</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.current_stock, product.min_stock, product.max_stock);
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.code}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.color as any}>
                          {product.current_stock}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.min_stock} / {product.max_stock}
                      </TableCell>
                      <TableCell>Rp {Number(product.harga_jual).toLocaleString('id-ID')}</TableCell>
                      <TableCell>Rp {Number(product.wac_harga_beli).toLocaleString('id-ID')}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(stockStatus.status)}>
                          {stockStatus.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                          >
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StokModule;
