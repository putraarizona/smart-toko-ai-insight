import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { NumpadInput } from '@/components/ui/numpad-input';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Calendar,
  CreditCard,
  User,
  Eye,
  Edit,
  Trash2,
  X,
  Ban,
  RotateCcw
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
import { getSales, createSale, updateSaleStatus, deleteSale, searchProducts as searchProductsDb, getSaleById } from '@/integrations/supabase/db';
import { useAuth } from './AuthProvider';
import PrintReceipt from './PrintReceipt';
import TransactionConfirmationDialog from './TransactionConfirmationDialog';
import { useAudioFeedback } from '@/hooks/useAudioFeedback';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Sale = Database['public']['Tables']['sales']['Row'] & {
  sales_details: Array<Database['public']['Tables']['sales_details']['Row'] & {
    product: Database['public']['Tables']['products']['Row']
  }>
};

type Product = Database['public']['Tables']['products']['Row'];

type SaleDetail = {
  product_id: number;
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  total_price: number;
  total_cost: number;
  margin: number;
  product?: Product;
};

type SaleFormData = {
  sale_number: string;
  cashier_name: string;
  payment_method: Database['public']['Tables']['sales']['Row']['payment_method'];
  tax_amount: number;
  discount_amount: number;
  notes: string;
};

const PenjualanModule = () => {
  const { user, profile, isOwner } = useAuth();
  const { playSuccessSound, playErrorSound } = useAudioFeedback();
  const { toast } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPrintReceipt, setShowPrintReceipt] = useState(false);
  const [showTransactionConfirmation, setShowTransactionConfirmation] = useState(false);
  const [lastCreatedSale, setLastCreatedSale] = useState<Sale | null>(null);
  const [receivedMoney, setReceivedMoney] = useState<string>('');

  const [formData, setFormData] = useState<SaleFormData>({
    sale_number: `SAL-${Date.now()}`,
    cashier_name: profile?.owner_name || user?.email || '',
    payment_method: 'cash',
    tax_amount: 0,
    discount_amount: 0,
    notes: ''
  });

  const [saleDetails, setSaleDetails] = useState<SaleDetail[]>([]);
  const [currentDetail, setCurrentDetail] = useState<Partial<SaleDetail>>({
    product_id: 0,
    quantity: 0,
    unit_price: 0,
    unit_cost: 0
  });

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    if (profile?.owner_name) {
      setFormData(prev => ({ ...prev, cashier_name: profile.owner_name || user?.email || '' }));
    }
  }, [profile, user]);

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

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await getSales();
      setSales(data);
      setError(null);
    } catch (err) {
      console.error('Error loading sales:', err);
      setError(`Gagal memuat data penjualan: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tax_amount' || name === 'discount_amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields more carefully
    let numericValue = 0;
    if (name === 'quantity') {
      // For quantity, only allow integers
      numericValue = parseInt(value) || 0;
    } else if (name === 'unit_price') {
      // For unit_price, allow decimals
      numericValue = parseFloat(value) || 0;
    }
    
    setCurrentDetail(prev => {
      const newDetail = {
        ...prev,
        [name]: name === 'quantity' || name === 'unit_price' ? numericValue : value
      };

      if (name === 'quantity' || name === 'unit_price') {
        const qty = newDetail.quantity || 0;
        const price = newDetail.unit_price || 0;
        const cost = newDetail.unit_cost || 0;
        newDetail.total_price = qty * price;
        newDetail.total_cost = qty * cost;
        newDetail.margin = newDetail.total_price - newDetail.total_cost;
      }

      return newDetail;
    });
  };

  // Handlers for numpad inputs
  const handleQuantityChange = (value: string) => {
    const numericValue = parseInt(value) || 0;
    setCurrentDetail(prev => {
      const newDetail = {
        ...prev,
        quantity: numericValue
      };

      const qty = newDetail.quantity || 0;
      const price = newDetail.unit_price || 0;
      const cost = newDetail.unit_cost || 0;
      newDetail.total_price = qty * price;
      newDetail.total_cost = qty * cost;
      newDetail.margin = newDetail.total_price - newDetail.total_cost;

      return newDetail;
    });
  };

  const handleTaxAmountChange = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      tax_amount: numericValue
    }));
  };

  const handleDiscountAmountChange = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      discount_amount: numericValue
    }));
  };

  const handleReceivedMoneyChange = (value: string) => {
    setReceivedMoney(value);
  };

  const handleProductSelect = (product: Product) => {
    setCurrentDetail(prev => ({
      ...prev,
      product_id: product.id,
      product_code: product.code,
      product_name: product.name,
      unit_price: product.harga_jual || 0,
      unit_cost: product.wac_harga_beli || 0,
      product: product
    }));
    setOpen(false);
  };

  const addDetail = () => {
    if (currentDetail.product_id && currentDetail.quantity && currentDetail.unit_price) {
      const detail: SaleDetail = {
        product_id: currentDetail.product_id!,
        product_code: currentDetail.product_code!,
        product_name: currentDetail.product_name!,
        quantity: currentDetail.quantity!,
        unit_price: currentDetail.unit_price!,
        unit_cost: currentDetail.unit_cost!,
        total_price: currentDetail.quantity! * currentDetail.unit_price!,
        total_cost: currentDetail.quantity! * currentDetail.unit_cost!,
        margin: (currentDetail.quantity! * currentDetail.unit_price!) - (currentDetail.quantity! * currentDetail.unit_cost!),
        product: currentDetail.product
      };

      setSaleDetails(prev => [...prev, detail]);
      setCurrentDetail({
        product_id: 0,
        quantity: 0,
        unit_price: 0,
        unit_cost: 0
      });
    }
  };

  const removeDetail = (index: number) => {
    setSaleDetails(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = saleDetails.reduce((sum, detail) => sum + detail.total_price, 0);
    const totalAmount = subtotal + formData.tax_amount - formData.discount_amount;
    const totalCost = saleDetails.reduce((sum, detail) => sum + detail.total_cost, 0);
    const totalMargin = saleDetails.reduce((sum, detail) => sum + detail.margin, 0);
    const receivedMoneyNum = parseFloat(receivedMoney) || 0;
    const change = receivedMoneyNum - totalAmount;

    return { subtotal, totalAmount, totalCost, totalMargin, change };
  };

  const showErrorNotification = (errorMessage: string) => {
    toast({
      variant: "destructive",
      title: "Transaksi Gagal",
      description: errorMessage || "Terjadi kesalahan saat menyimpan transaksi. Silakan coba lagi.",
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saleDetails.length === 0) {
      showErrorNotification('Tambahkan minimal 1 barang!');
      return;
    }

    try {
      const { subtotal, totalAmount, totalCost, totalMargin, change } = calculateTotals();
      
      const newSale = {
        user_id: user.id,
        sale_number: formData.sale_number,
        cashier_name: formData.cashier_name,
        payment_method: formData.payment_method,
        subtotal,
        tax_amount: formData.tax_amount,
        discount_amount: formData.discount_amount,
        total_amount: totalAmount,
        total_cost: totalCost,
        total_margin: totalMargin,
        status: 'completed' as const,
        notes: formData.notes
      };

      const createdSale = await createSale(newSale, saleDetails);
      
      // Play success sound
      playSuccessSound();
      
      // Get the complete sale data with details for the confirmation dialog
      const completeSaleData = await getSaleById(createdSale.id);
      setLastCreatedSale(completeSaleData);
      
      await loadSales();
      
      // Reset form
      setShowAddForm(false);
      setFormData({
        sale_number: `SAL-${Date.now()}`,
        cashier_name: profile?.owner_name || user?.email || '',
        payment_method: 'cash',
        tax_amount: 0,
        discount_amount: 0,
        notes: ''
      });
      setSaleDetails([]);
      setReceivedMoney('');
      
      // Show transaction confirmation dialog instead of immediate print
      setShowTransactionConfirmation(true);
    } catch (err) {
      console.error('Error saving sale:', err);
      
      // Play error sound
      playErrorSound();
      
      // Show error notification instead of setting error state
      let errorMessage = 'Gagal menyimpan penjualan';
      
      if (err instanceof Error) {
        // Extract specific error messages
        if (err.message.includes('Nomor transaksi sudah digunakan')) {
          errorMessage = 'Nomor transaksi sudah digunakan. Silakan gunakan nomor yang berbeda.';
        } else if (err.message.includes('duplicate')) {
          errorMessage = 'Nomor penjualan sudah digunakan. Silakan gunakan nomor yang berbeda.';
        } else if (err.message.includes('stock')) {
          errorMessage = 'Stok tidak mencukupi untuk salah satu produk.';
        } else if (err.message.includes('permission')) {
          errorMessage = 'Anda tidak memiliki izin untuk melakukan transaksi ini.';
        } else if (err.message.includes('network')) {
          errorMessage = 'Koneksi internet bermasalah. Periksa koneksi dan coba lagi.';
        } else {
          errorMessage = `Gagal menyimpan penjualan: ${err.message}`;
        }
      }
      
      showErrorNotification(errorMessage);
    }
  };

  const handlePrintFromConfirmation = () => {
    setShowTransactionConfirmation(false);
    setShowPrintReceipt(true);
  };

  const handleCancelTransactionFromConfirmation = async () => {
    if (!lastCreatedSale) return;
    
    try {
      await updateSaleStatus(lastCreatedSale.id, 'cancelled');
      await loadSales();
      setShowTransactionConfirmation(false);
      setLastCreatedSale(null);
    } catch (err) {
      console.error('Error cancelling transaction:', err);
      setError('Gagal membatalkan transaksi');
    }
  };

  const handleStatusChange = async (sale: Sale, newStatus: Database['public']['Tables']['sales']['Row']['status']) => {
    try {
      await updateSaleStatus(sale.id, newStatus);
      await loadSales();
      
      toast({
        title: "Status Berhasil Diubah",
        description: `Status penjualan ${sale.sale_number} berhasil diubah menjadi ${newStatus}.`,
      });
    } catch (err) {
      console.error('Error updating status:', err);
      
      let errorMessage = 'Gagal mengubah status';
      if (err instanceof Error) {
        if (err.message.includes('permission')) {
          errorMessage = 'Anda tidak memiliki izin untuk mengubah status transaksi.';
        } else {
          errorMessage = `Gagal mengubah status: ${err.message}`;
        }
      }
      
      showErrorNotification(errorMessage);
    }
  };

  const handleView = async (sale: Sale) => {
    try {
      // Get complete sale data with details
      const completeSaleData = await getSaleById(sale.id);
      setSelectedSale(completeSaleData);
      setIsViewDialogOpen(true);
    } catch (err) {
      console.error('Error loading sale details:', err);
      
      let errorMessage = 'Gagal memuat detail penjualan';
      if (err instanceof Error) {
        errorMessage = `Gagal memuat detail: ${err.message}`;
      }
      
      showErrorNotification(errorMessage);
    }
  };

  const handleDelete = async (sale: Sale) => {
    setSelectedSale(sale);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSale) return;
    
    try {
      setIsDeleting(true);
      await deleteSale(selectedSale.id);
      await loadSales();
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Transaksi Berhasil Dihapus",
        description: `Transaksi ${selectedSale.sale_number} berhasil dihapus.`,
      });
    } catch (err) {
      console.error('Error deleting sale:', err);
      
      let errorMessage = 'Gagal menghapus penjualan';
      if (err instanceof Error) {
        if (err.message.includes('permission')) {
          errorMessage = 'Anda tidak memiliki izin untuk menghapus transaksi ini.';
        } else {
          errorMessage = `Gagal menghapus transaksi: ${err.message}`;
        }
      }
      
      showErrorNotification(errorMessage);
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
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const { subtotal, totalAmount, totalCost, totalMargin, change } = calculateTotals();
  const receivedMoneyNum = parseFloat(receivedMoney) || 0;
  const isPaymentSufficient = receivedMoneyNum >= totalAmount;

  return (
    <div className="p-6 space-y-6">
      {showSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow z-50">
          Penjualan berhasil disimpan!
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Modul Penjualan</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Transaksi Baru
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Transaksi Penjualan Baru</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sale_number">No. Penjualan</Label>
                  <Input
                    id="sale_number"
                    name="sale_number"
                    value={formData.sale_number}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cashier_name">Nama Kasir</Label>
                  <Input
                    id="cashier_name"
                    name="cashier_name"
                    value={formData.cashier_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Metode Pembayaran</Label>
                  <select
                    id="payment_method"
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="cash">Tunai</option>
                    <option value="card">Kartu</option>
                    <option value="qris">QRIS</option>
                    <option value="bank_transfer">Transfer Bank</option>
                    <option value="e_wallet">E-Wallet</option>
                  </select>
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
                                  <span className="text-sm text-gray-500">{product.code} - Stok: {product.current_stock}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Jumlah</Label>
                    <NumpadInput
                      value={String(currentDetail.quantity || '')}
                      onChange={handleQuantityChange}
                      placeholder="0"
                      allowDecimal={false}
                      maxLength={6}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="unit_price">Harga Satuan</Label>
                    <Input
                      id="unit_price"
                      name="unit_price"
                      type="number"
                      value={Math.round(currentDetail.unit_price || 0)}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Total</Label>
                    <Input
                      value={formatCurrency(Math.round((currentDetail.quantity || 0) * (currentDetail.unit_price || 0)))}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={addDetail}
                    disabled={!currentDetail.product_id || !currentDetail.quantity || !currentDetail.unit_price}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Barang
                  </Button>
                </div>

                {saleDetails.length > 0 && (
                  <div className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama Barang</TableHead>
                          <TableHead>Kode</TableHead>
                          <TableHead>Jumlah</TableHead>
                          <TableHead>Harga</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Margin</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {saleDetails.map((detail, index) => (
                          <TableRow key={index}>
                            <TableCell>{detail.product_name}</TableCell>
                            <TableCell>{detail.product_code}</TableCell>
                            <TableCell>{detail.quantity}</TableCell>
                            <TableCell>{formatCurrency(detail.unit_price)}</TableCell>
                            <TableCell>{formatCurrency(detail.total_price)}</TableCell>
                            <TableCell>{formatCurrency(detail.margin)}</TableCell>
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_amount">Pajak</Label>
                  <NumpadInput
                    value={String(formData.tax_amount || '')}
                    onChange={handleTaxAmountChange}
                    placeholder="0"
                    allowDecimal={true}
                    maxLength={10}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discount_amount">Diskon</Label>
                  <NumpadInput
                    value={String(formData.discount_amount || '')}
                    onChange={handleDiscountAmountChange}
                    placeholder="0"
                    allowDecimal={true}
                    maxLength={10}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="received_money">Uang Diterima</Label>
                  <NumpadInput
                    value={receivedMoney}
                    onChange={handleReceivedMoneyChange}
                    placeholder="Masukkan nominal uang yang diberikan oleh pelanggan"
                    allowDecimal={true}
                    maxLength={12}
                    formatCurrency={false}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Total Bayar</Label>
                  <Input
                    value={formatCurrency(Math.round(totalAmount))}
                    readOnly
                    className="bg-gray-50 font-bold text-lg"
                  />
                </div>
              </div>

              {/* Kembalian dan peringatan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kembalian</Label>
                  <Input
                    value={formatCurrency(Math.round(Math.max(0, change)))}
                    readOnly
                    className="bg-green-50 font-bold text-lg"
                  />
                </div>
                
                {receivedMoneyNum > 0 && !isPaymentSufficient && (
                  <div className="flex items-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      Uang yang diterima kurang
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Catatan transaksi (opsional)"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={saleDetails.length === 0 || !isPaymentSufficient || receivedMoneyNum === 0}
                >
                  Simpan Penjualan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Transaction Confirmation Dialog */}
      <TransactionConfirmationDialog
        open={showTransactionConfirmation}
        onOpenChange={setShowTransactionConfirmation}
        sale={lastCreatedSale}
        receivedMoney={receivedMoneyNum}
        onPrintReceipt={handlePrintFromConfirmation}
        onCancelTransaction={handleCancelTransactionFromConfirmation}
        isSuccess={true}
        mode="confirmation"
      />

      {/* View Sale Details Dialog - using the same TransactionConfirmationDialog */}
      <TransactionConfirmationDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        sale={selectedSale}
        mode="detail"
        title="Detail Penjualan"
        onPrintReceipt={() => setShowPrintReceipt(true)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus transaksi "{selectedSale?.sale_number}" secara permanen dan mengembalikan stok.
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

      {/* Print Receipt Dialog */}
      <Dialog open={showPrintReceipt} onOpenChange={setShowPrintReceipt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cetak Struk</DialogTitle>
          </DialogHeader>
          {lastCreatedSale && (
            <PrintReceipt 
              sale={lastCreatedSale} 
              onPrint={() => setShowPrintReceipt(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Penjualan</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Kasir</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Margin</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.sale_number}</TableCell>
                <TableCell>{new Date(sale.sale_date).toLocaleDateString('id-ID')}</TableCell>
                <TableCell>{sale.cashier_name}</TableCell>
                <TableCell>{formatCurrency(sale.total_amount)}</TableCell>
                <TableCell>{formatCurrency(sale.total_margin)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(sale.status)}>
                    {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleView(sale)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {isOwner && sale.status === 'completed' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleStatusChange(sale, 'cancelled')}
                        title="Batalkan"
                      >
                        <Ban className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                    {isOwner && sale.status === 'completed' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleStatusChange(sale, 'returned')}
                        title="Retur"
                      >
                        <RotateCcw className="w-4 h-4 text-yellow-500" />
                      </Button>
                    )}
                    {isOwner && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(sale)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
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

export default PenjualanModule;
