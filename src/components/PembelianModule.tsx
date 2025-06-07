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
import { getPurchases, createPurchase, searchProducts as searchProductsDb } from '@/integrations/supabase/db';
import type { Database } from '@/integrations/supabase/types';

type Purchase = Database['public']['Tables']['purchases']['Row'] & {
  purchase_details: Array<Database['public']['Tables']['purchase_details']['Row'] & {
    product: Database['public']['Tables']['products']['Row']
  }>
};
type Product = Database['public']['Tables']['products']['Row'];

interface PurchaseDetail {
  product_id: number;
  product?: Product;
  qty: number;
  harga_per_unit: number;
  total_harga: number;
}

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

  const [formData, setFormData] = useState({
    tanggal_pemesanan: new Date().toISOString().split('T')[0],
    no_pesanan: '',
    marketplace_supplier: '',
    akun: '',
    status: 'pending' as const,
    total_harga: 0
  });

  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetail[]>([]);
  const [currentDetail, setCurrentDetail] = useState<PurchaseDetail>({
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const totalHarga = purchaseDetails.reduce((sum, detail) => sum + detail.total_harga, 0);

      const newPurchase: Database['public']['Tables']['purchases']['Insert'] = {
        tanggal_pemesanan: formData.tanggal_pemesanan,
        no_pesanan: formData.no_pesanan,
        marketplace_supplier: formData.marketplace_supplier,
        akun: formData.akun,
        status: formData.status,
        total_harga: totalHarga
      };

      await createPurchase(newPurchase, purchaseDetails);
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
    } catch (err) {
      setError('Gagal menambahkan pembelian');
      console.error('Error creating purchase:', err);
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

  return (
    <div className="p-6 space-y-6">
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
              <CardTitle>Tambah Pembelian Baru</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-medium">Detail Barang</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Barang</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between"
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
                      placeholder="50"
                      value={currentDetail.qty || ''}
                      onChange={handleDetailChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="harga_per_unit">Harga Per Unit</Label>
                    <Input
                      id="harga_per_unit"
                      name="harga_per_unit"
                      type="number"
                      placeholder="50000"
                      value={currentDetail.harga_per_unit || ''}
                      onChange={handleDetailChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Total</Label>
                    <Input
                      value={formatCurrency(currentDetail.total_harga)}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={addDetail}
                  disabled={!currentDetail.product_id || !currentDetail.qty || !currentDetail.harga_per_unit}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Barang
                </Button>

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
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={purchaseDetails.length === 0}
                >
                  Simpan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
                  <Badge variant={
                    purchase.status === 'completed' ? 'default' :
                    purchase.status === 'shipped' ? 'secondary' :
                    purchase.status === 'cancelled' ? 'destructive' :
                    'outline'
                  }>
                    {purchase.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
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
