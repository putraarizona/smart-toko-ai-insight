import React, { useState, useEffect } from 'react';
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
  Trash2,
  X
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import { getPurchases, createPurchase, updatePurchase, deletePurchase, searchProducts as searchProductsDb } from '@/integrations/supabase/db';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Purchase = Database['public']['Tables']['purchases']['Row'] & {
  purchase_details: Array<Database['public']['Tables']['purchase_details']['Row'] & {
    product: Database['public']['Tables']['products']['Row']
  }>
};

type Product = Database['public']['Tables']['products']['Row'];

type PurchaseDetail = Database['public']['Tables']['purchase_details']['Insert'] & {
  product?: Product;
};

type PurchaseFormData = Database['public']['Tables']['purchases']['Insert'];

type LocalPurchaseDetail = Omit<Database['public']['Tables']['purchase_details']['Insert'], 'purchase_id'> & {
  product?: Product;
};

const PembelianModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editPurchaseId, setEditPurchaseId] = useState<number | null>(null);
  const [prevStatus, setPrevStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<PurchaseFormData>({
    tanggal_pemesanan: new Date().toISOString().split('T')[0],
    no_pesanan: '',
    marketplace_supplier: '',
    akun: '',
    status: 'pending',
    total_harga: 0
  });

  const [purchaseDetails, setPurchaseDetails] = useState<LocalPurchaseDetail[]>([]);
  const [currentDetail, setCurrentDetail] = useState<LocalPurchaseDetail>({
    product_id: 0,
    qty: 0,
    harga_per_unit: 0,
    total_harga: 0
  });

  useEffect(() => {
    loadPurchases();
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        const results = await searchProductsDb(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Error searching products:', err);
      }
    };

    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const data = await getPurchases();
      setPurchases(data);
      setError(null);
    } catch (err) {
      console.error('Error loading purchases:', err);
      setError(`Gagal memuat data pembelian: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentDetail(prev => {
      const newDetail = {
        ...prev,
        [name]: name === 'qty' || name === 'harga_per_unit' ? parseInt(value) || 0 : value
      };

      // Calculate total
      if (name === 'qty' || name === 'harga_per_unit') {
        newDetail.total_harga = newDetail.qty * newDetail.harga_per_unit;
      }

      return newDetail;
    });
  };

  const handleProductSelect = (product: Product) => {
    setCurrentDetail(prev => ({
      ...prev,
      product_id: product.id,
      product: product,
      harga_per_unit: 0,
      total_harga: 0
    }));
    setOpen(false);
  };

  const addDetail = () => {
    if (currentDetail.product_id && currentDetail.qty > 0 && currentDetail.harga_per_unit > 0) {
      setPurchaseDetails(prev => [...prev, currentDetail]);
      setCurrentDetail({
        product_id: 0,
        qty: 0,
        harga_per_unit: 0,
        total_harga: 0
      });
    }
  };

  const removeDetail = (index: number) => {
    setPurchaseDetails(prev => prev.filter((_, i) => i !== index));
  };

  const handleEdit = async (purchase: Purchase) => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          purchase_details (
            *,
            product:products (*)
          )
        `)
        .eq('id', purchase.id)
        .single();
      if (error) throw error;
      setFormData({
        tanggal_pemesanan: data.tanggal_pemesanan,
        no_pesanan: data.no_pesanan,
        marketplace_supplier: data.marketplace_supplier,
        akun: data.akun,
        status: data.status,
        total_harga: data.total_harga
      });
      setPurchaseDetails(data.purchase_details.map(detail => ({
        product_id: detail.product_id,
        product: detail.product,
        qty: detail.qty,
        harga_per_unit: detail.harga_per_unit,
        total_harga: detail.total_harga
      })));
      setPrevStatus(data.status);
      setEditMode(true);
      setEditPurchaseId(data.id);
      setShowAddForm(true);
    } catch (err) {
      console.error('Error loading purchase details:', err);
      setError('Gagal memuat detail pembelian');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditPurchaseId(null);
    setPrevStatus(null);
    setFormData({
      tanggal_pemesanan: new Date().toISOString().split('T')[0],
      no_pesanan: '',
      marketplace_supplier: '',
      akun: '',
      status: 'pending',
      total_harga: 0
    });
    setPurchaseDetails([]);
    setShowAddForm(false);
  };

  async function updateProductStockOnCompleted(details) {
    for (const detail of details) {
      const { data: product, error } = await supabase
        .from('products')
        .select('current_stock')
        .eq('id', detail.product_id)
        .single();
      if (error || !product) continue;
      await supabase
        .from('products')
        .update({ current_stock: product.current_stock + detail.qty })
        .eq('id', detail.product_id);
    }
  }

  async function updateProductWACOnCompleted(details) {
    for (const detail of details) {
      const { data: product, error } = await supabase
        .from('products')
        .select('current_stock, wac_harga_beli')
        .eq('id', detail.product_id)
        .single();
      if (error || !product) continue;
      
      const stokLama = product.current_stock || 0;
      const wacLama = product.wac_harga_beli || 0;
      const qtyBeli = detail.qty || 0;
      const hargaBeli = detail.harga_per_unit || 0;
      
      // Calculate new WAC
      const totalNilaiLama = stokLama * wacLama;
      const totalNilaiBeli = qtyBeli * hargaBeli;
      const totalStokBaru = stokLama + qtyBeli;
      const wacBaru = totalStokBaru > 0 ? (totalNilaiLama + totalNilaiBeli) / totalStokBaru : hargaBeli;
      
      await supabase
        .from('products')
        .update({ wac_harga_beli: Math.round(wacBaru) })
        .eq('id', detail.product_id);
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseDetails.length === 0) {
      alert('Tambahkan minimal 1 barang!');
      return;
    }
    try {
      setIsSubmitting(true);
      const totalHarga = purchaseDetails.reduce((sum, detail) => sum + detail.total_harga, 0);
      if (editMode && editPurchaseId) {
        // Update
        const updatedPurchase = {
          tanggal_pemesanan: formData.tanggal_pemesanan,
          no_pesanan: formData.no_pesanan,
          marketplace_supplier: formData.marketplace_supplier,
          akun: formData.akun,
          status: formData.status,
          total_harga: totalHarga
        };
        await updatePurchase(editPurchaseId, updatedPurchase, purchaseDetails);
        if (prevStatus !== 'completed' && formData.status === 'completed') {
          await updateProductStockOnCompleted(purchaseDetails);
          await updateProductWACOnCompleted(purchaseDetails);
        }
        setEditMode(false);
        setEditPurchaseId(null);
        setPrevStatus(null);
      } else {
        // Create
        const newPurchase = {
          tanggal_pemesanan: formData.tanggal_pemesanan,
          no_pesanan: formData.no_pesanan,
          marketplace_supplier: formData.marketplace_supplier,
          akun: formData.akun,
          status: formData.status,
          total_harga: totalHarga
        };
        await createPurchase(newPurchase, purchaseDetails);
        if (formData.status === 'completed') {
          await updateProductStockOnCompleted(purchaseDetails);
          await updateProductWACOnCompleted(purchaseDetails);
        }
      }
      await loadPurchases();
      setShowAddForm(false);
      setFormData({
        tanggal_pemesanan: new Date().toISOString().split('T')[0],
        no_pesanan: '',
        marketplace_supplier: '',
        akun: '',
        status: 'pending',
        total_harga: 0
      });
      setPurchaseDetails([]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error('Error saving purchase:', err);
      setError(editMode ? 'Gagal memperbarui pembelian' : 'Gagal menambahkan pembelian');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = async (purchase: Purchase) => {
    try {
      // Load purchase details with product information
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          purchase_details (
            *,
            product:products (*)
          )
        `)
        .eq('id', purchase.id)
        .single();

      if (error) throw error;
      setSelectedPurchase(data);
      setIsViewDialogOpen(true);
    } catch (err) {
      console.error('Error loading purchase details:', err);
      setError('Gagal memuat detail pembelian');
    }
  };

  const handleDelete = async (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPurchase) return;
    
    try {
      setIsDeleting(true);
      await deletePurchase(selectedPurchase.id);
      await loadPurchases();
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting purchase:', err);
      setError('Gagal menghapus pembelian');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-[#A9DFBF] text-green-900'; // Hijau tua lembut
      case 'shipped':
        return 'bg-[#AED6F1] text-blue-900'; // Biru netral
      case 'pending':
        return 'bg-[#F9E79F] text-yellow-900'; // Oranye terang
      case 'cancelled':
        return 'bg-[#F5B7B1] text-red-900'; // Merah pastel
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {showSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow z-50">
          Data pembelian berhasil disimpan!
        </div>
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Modul Pembelian</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Pembelian
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{editMode ? 'Edit Pembelian' : 'Tambah Pembelian Baru'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={editMode ? handleCancelEdit : () => setShowAddForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="tanggal_pemesanan">Tanggal Pemesanan</Label>
                <Input
                    id="tanggal_pemesanan"
                    name="tanggal_pemesanan"
                  type="date"
                    value={formData.tanggal_pemesanan}
                  onChange={handleInputChange}
                    required
                />
              </div>
              
              <div className="space-y-2">
                  <Label htmlFor="no_pesanan">No. Pesanan</Label>
                <Input
                    id="no_pesanan"
                    name="no_pesanan"
                  placeholder="PO-2024-001"
                    value={formData.no_pesanan}
                  onChange={handleInputChange}
                    required
                />
              </div>
              
              <div className="space-y-2">
                  <Label htmlFor="marketplace_supplier">Marketplace/Supplier</Label>
                <Input
                    id="marketplace_supplier"
                    name="marketplace_supplier"
                  placeholder="PT Baby Care Indonesia"
                    value={formData.marketplace_supplier}
                  onChange={handleInputChange}
                    required
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
                    required
                />
              </div>
              
              <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>


              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-medium">Detail Barang</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Nama Barang</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>  
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between truncate"
                        >
                          {currentDetail.product?.name || "Pilih barang..."}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Cari barang..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                          />
                          <CommandEmpty>Tidak ada hasil</CommandEmpty>
                          <CommandGroup>
                            {searchResults.map((product) => (
                              <CommandItem
                                key={product.id}
                                value={product.name}
                                onSelect={() => handleProductSelect(product)}
                              >
                                <div className="flex flex-col">
                                  <span>{product.name}</span>
                                  <span className="text-sm text-gray-500">{product.code}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qty">Jumlah</Label>
                <Input
                  id="qty"
                  name="qty"
                  type="number"
                      value={currentDetail.qty || ''}
                      onChange={handleDetailChange}
                />
              </div>
              
              <div className="space-y-2">
                    <Label htmlFor="harga_per_unit">Harga Per Unit</Label>
                <Input
                      id="harga_per_unit"
                      name="harga_per_unit"
                  type="number"
                      value={currentDetail.harga_per_unit || ''}
                      onChange={handleDetailChange}
                />
              </div>
              
                  <div className="space-y-2 md:col-span-2 lg:col-span-1">
                    <Label>Total</Label>
                <Input
                      value={formatCurrency(currentDetail.total_harga)}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
            
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={addDetail}
                    disabled={!currentDetail.product_id || !currentDetail.qty || !currentDetail.harga_per_unit}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Barang
              </Button>
                </div>

                {purchaseDetails.length > 0 && (
                  <div className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Barang</TableHead>
                          <TableHead>Kode</TableHead>
                          <TableHead>Jumlah</TableHead>
                          <TableHead>Harga/Unit</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchaseDetails.map((detail, index) => (
                          <TableRow key={index}>
                            <TableCell>{detail.product?.name}</TableCell>
                            <TableCell>{detail.product?.code}</TableCell>
                            <TableCell>{detail.qty}</TableCell>
                            <TableCell>{formatCurrency(detail.harga_per_unit)}</TableCell>
                            <TableCell>{formatCurrency(detail.total_harga)}</TableCell>
                            <TableCell>
              <Button 
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDetail(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                {editMode && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Batal Edit
                  </Button>
                )}
                <Button type="submit" disabled={purchaseDetails.length === 0 || isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : (editMode ? 'Simpan Perubahan' : 'Simpan')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Detail Pembelian</DialogTitle>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 ">
                <div>
                  <Label>Tanggal Pemesanan</Label>
                  <p>{selectedPurchase.tanggal_pemesanan}</p>
                </div>
                <div>
                  <Label>No. Pesanan</Label>
                  <p>{selectedPurchase.no_pesanan}</p>
                </div>
                <div>
                  <Label>Marketplace/Supplier</Label>
                  <p>{selectedPurchase.marketplace_supplier}</p>
                </div>
                <div>
                  <Label>Akun</Label>
                  <p>{selectedPurchase.akun}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p><Badge className={getStatusColor(selectedPurchase.status)}>
                    {selectedPurchase.status.charAt(0).toUpperCase() + selectedPurchase.status.slice(1)}
                  </Badge></p>
                </div>
                <div>
                  <Label>Total Harga</Label>
                  <p>{formatCurrency(selectedPurchase.total_harga)}</p>
                </div>
            </div>
            
              <div className="mt-4">
                <h3 className="font-medium mb-2">Detail Barang</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead >Nama Barang</TableHead>
                      <TableHead className="text-center">Kode</TableHead>
                      <TableHead className="text-center">Jumlah</TableHead>
                      <TableHead className="text-center">Harga/Unit</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPurchase.purchase_details.map((detail, index) => (
                      <TableRow key={index}>
                        <TableCell>{detail.product?.name}</TableCell>
                        <TableCell>{detail.product?.code}</TableCell>
                        <TableCell className="text-center">{detail.qty}</TableCell>
                        <TableCell className="text-center">{formatCurrency(detail.harga_per_unit)}</TableCell>
                        <TableCell className="text-center">{formatCurrency(detail.total_harga)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus pembelian "{selectedPurchase?.no_pesanan}" secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>No. Pesanan</TableHead>
              <TableHead>Marketplace/Supplier</TableHead>
              <TableHead>Akun</TableHead>
              <TableHead>Total Harga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>{purchase.tanggal_pemesanan}</TableCell>
                <TableCell>{purchase.no_pesanan}</TableCell>
                <TableCell>{purchase.marketplace_supplier}</TableCell>
                <TableCell>{purchase.akun}</TableCell>
                <TableCell>{formatCurrency(purchase.total_harga)}</TableCell>
                    <TableCell>
                  <Badge className={getStatusColor(purchase.status)}>
                    {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleView(purchase)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(purchase)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(purchase)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
    </div>
  );
};

export default PembelianModule;
