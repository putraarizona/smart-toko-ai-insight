
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CheckCircle, 
  Printer, 
  X, 
  Ban,
  Receipt,
  CreditCard,
  Banknote,
  ShoppingCart,
  Percent,
  Calculator
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Sale = Database['public']['Tables']['sales']['Row'] & {
  sales_details: Array<Database['public']['Tables']['sales_details']['Row'] & {
    product: Database['public']['Tables']['products']['Row']
  }>
};

interface TransactionConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  receivedMoney?: number;
  onPrintReceipt?: () => void;
  onCancelTransaction?: () => void;
  isSuccess?: boolean;
  mode?: 'confirmation' | 'detail'; // New prop to distinguish modes
  title?: string; // Custom title for detail mode
}

const TransactionConfirmationDialog: React.FC<TransactionConfirmationDialogProps> = ({
  open,
  onOpenChange,
  sale,
  receivedMoney = 0,
  onPrintReceipt,
  onCancelTransaction,
  isSuccess = true,
  mode = 'confirmation',
  title
}) => {
  if (!sale) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods = {
      'cash': 'Tunai',
      'card': 'Kartu',
      'qris': 'QRIS',
      'bank_transfer': 'Transfer Bank',
      'e_wallet': 'E-Wallet'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const change = receivedMoney - sale.total_amount;

  // Determine dialog title based on mode
  const getDialogTitle = () => {
    if (title) return title;
    if (mode === 'detail') return 'Detail Penjualan';
    return isSuccess ? 'Transaksi Berhasil!' : 'Transaksi Gagal!';
  };

  // Determine if we should show success/error icon
  const showStatusIcon = mode === 'confirmation';

  // Determine if we should show content (success state or detail mode)
  const showContent = (mode === 'confirmation' && isSuccess) || mode === 'detail';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-6 pb-4 border-b">
          <DialogHeader className="text-center">
            {showStatusIcon && (
              <div className="flex justify-center mb-3">
                {isSuccess ? (
                  <CheckCircle className="w-12 h-12 text-green-500" />
                ) : (
                  <X className="w-12 h-12 text-red-500" />
                )}
              </div>
            )}
            <DialogTitle className="text-lg sm:text-xl font-bold">
              {getDialogTitle()}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 px-6">
          {showContent ? (
            <div className="space-y-4 pb-4">
              {/* Transaction Summary Card */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Receipt className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm">Ringkasan Transaksi</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    {mode === 'detail' ? 'Selesai' : 'Selesai'}
                  </Badge>
                </div>

                <Separator />

                {/* Transaction Details Grid - Updated with Discount and Tax */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">No. Transaksi:</span>
                      <span className="font-medium">{sale.sale_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal:</span>
                      <span className="font-medium">
                        {new Date(sale.sale_date).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kasir:</span>
                      <span className="font-medium">{sale.cashier_name}</span>
                    </div>
                    {/* New Discount Row */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Diskon:</span>
                      <div className="flex items-center space-x-1">
                        <Percent className="w-3 h-3 text-orange-500" />
                        <span className="font-medium text-orange-600">
                          {sale.discount_amount > 0 ? formatCurrency(sale.discount_amount) : '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Metode Bayar:</span>
                      <div className="flex items-center space-x-1">
                        {sale.payment_method === 'cash' ? (
                          <Banknote className="w-3 h-3" />
                        ) : (
                          <CreditCard className="w-3 h-3" />
                        )}
                        <span className="font-medium text-xs">
                          {getPaymentMethodLabel(sale.payment_method)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Item:</span>
                      <span className="font-medium">
                        {sale.sales_details?.length || 0} item
                      </span>
                    </div>
                    {/* New Tax Row */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pajak:</span>
                      <div className="flex items-center space-x-1">
                        <Calculator className="w-3 h-3 text-blue-500" />
                        <span className="font-medium text-blue-600">
                          {sale.tax_amount > 0 ? formatCurrency(sale.tax_amount) : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Detail Table */}
              <div className="bg-white border rounded-lg">
                <div className="p-3 border-b">
                  <h3 className="font-semibold text-sm text-gray-900 flex items-center">
                    <ShoppingCart className="w-4 h-4 mr-2 text-blue-600" />
                    Detail Barang
                  </h3>
                </div>
                
                <div className="max-h-48 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white">
                      <TableRow>
                        <TableHead className="w-8 text-center text-xs">No</TableHead>
                        <TableHead className="min-w-[120px] text-xs">Nama Barang</TableHead>
                        <TableHead className="w-12 text-center text-xs">Qty</TableHead>
                        <TableHead className="w-20 text-right text-xs">Harga</TableHead>
                        <TableHead className="w-20 text-right text-xs">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sale.sales_details?.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-center text-xs font-medium py-2">
                            {index + 1}
                          </TableCell>
                          <TableCell className="py-2">
                            <div>
                              <div className="font-medium text-xs">{item.product_name}</div>
                              <div className="text-xs text-gray-500">{item.product_code}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-xs py-2">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right text-xs py-2">
                            {formatCurrency(item.unit_price)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-xs py-2">
                            {formatCurrency(item.total_price)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!sale.sales_details || sale.sales_details.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500 py-4 text-xs">
                            Tidak ada item
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Payment Summary Card */}
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-blue-900 flex items-center text-sm">
                  <Banknote className="w-4 h-4 mr-2" />
                  Rincian Pembayaran
                </h3>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(sale.subtotal)}</span>
                  </div>
                  
                  {sale.tax_amount > 0 && (
                    <div className="flex justify-between">
                      <span>Pajak:</span>
                      <span>{formatCurrency(sale.tax_amount)}</span>
                    </div>
                  )}
                  
                  {sale.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span>Diskon:</span>
                      <span className="text-red-600">-{formatCurrency(sale.discount_amount)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold text-sm">
                    <span>Total Bayar:</span>
                    <span className="text-blue-600">{formatCurrency(sale.total_amount)}</span>
                  </div>
                  
                  {mode === 'confirmation' && receivedMoney > 0 && (
                    <>
                      <div className="flex justify-between font-medium text-sm">
                        <span>Uang Diterima:</span>
                        <span className="text-green-600">{formatCurrency(receivedMoney)}</span>
                      </div>
                      
                      <div className="flex justify-between font-bold text-sm">
                        <span>Kembalian:</span>
                        <span className="text-green-600">{formatCurrency(Math.max(0, change))}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Error State */
            <div className="text-center py-8">
              <p className="text-gray-600 text-sm">
                Terjadi kesalahan saat memproses transaksi. Silakan coba lagi.
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Fixed Action Buttons */}
        <div className="flex-shrink-0 p-4 border-t bg-white">
          {mode === 'confirmation' && showContent ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {onCancelTransaction && (
                <Button 
                  onClick={onCancelTransaction}
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50 text-sm h-10"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Batal Transaksi
                </Button>
              )}
              
              <Button 
                onClick={() => onOpenChange(false)}
                variant="outline" 
                className={`w-full text-sm h-10 ${(!onPrintReceipt && !onCancelTransaction) ? 'sm:col-span-3' : (onPrintReceipt && onCancelTransaction) ? '' : 'sm:col-span-2'}`}
              >
                <X className="w-4 h-4 mr-2" />
                Tutup
              </Button>

              {onPrintReceipt && (
                <Button 
                  onClick={onPrintReceipt}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm h-10"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Cetak Struk
                </Button>
              )}
            </div>
          ) : (
            /* Detail mode or error state - simple close button */
            <Button 
              onClick={() => onOpenChange(false)}
              variant="outline" 
              className="w-full text-sm h-10"
            >
              <X className="w-4 h-4 mr-2" />
              Tutup
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionConfirmationDialog;
