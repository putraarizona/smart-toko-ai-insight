
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
import { 
  CheckCircle, 
  Printer, 
  X, 
  Ban,
  Receipt,
  CreditCard,
  Banknote,
  Calendar
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
  receivedMoney: number;
  onPrintReceipt: () => void;
  onCancelTransaction?: () => void;
  isSuccess: boolean;
}

const TransactionConfirmationDialog: React.FC<TransactionConfirmationDialogProps> = ({
  open,
  onOpenChange,
  sale,
  receivedMoney,
  onPrintReceipt,
  onCancelTransaction,
  isSuccess = true
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg md:max-w-2xl mx-auto">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            {isSuccess ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : (
              <X className="w-16 h-16 text-red-500" />
            )}
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            {isSuccess ? 'Transaksi Berhasil!' : 'Transaksi Gagal!'}
          </DialogTitle>
        </DialogHeader>

        {isSuccess && (
          <div className="space-y-6">
            {/* Transaction Summary Card */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Ringkasan Transaksi</span>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  Selesai
                </Badge>
              </div>

              <Separator />

              {/* Transaction Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
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
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Metode Bayar:</span>
                    <div className="flex items-center space-x-1">
                      {sale.payment_method === 'cash' ? (
                        <Banknote className="w-4 h-4" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                      <span className="font-medium">
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
                </div>
              </div>
            </div>

            {/* Payment Summary Card */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-blue-900 flex items-center">
                <Banknote className="w-5 h-5 mr-2" />
                Rincian Pembayaran
              </h3>
              
              <div className="space-y-2 text-sm">
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
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Bayar:</span>
                  <span className="text-blue-600">{formatCurrency(sale.total_amount)}</span>
                </div>
                
                <div className="flex justify-between font-medium">
                  <span>Uang Diterima:</span>
                  <span className="text-green-600">{formatCurrency(receivedMoney)}</span>
                </div>
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Kembalian:</span>
                  <span className="text-green-600">{formatCurrency(Math.max(0, change))}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
              <Button 
                onClick={onPrintReceipt}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Printer className="w-4 h-4 mr-2" />
                Cetak Struk
              </Button>
              
              {onCancelTransaction && (
                <Button 
                  onClick={onCancelTransaction}
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Batal Transaksi
                </Button>
              )}
              
              <Button 
                onClick={() => onOpenChange(false)}
                variant="outline" 
                className={`w-full ${onCancelTransaction ? 'sm:col-span-2 lg:col-span-1' : ''}`}
              >
                <X className="w-4 h-4 mr-2" />
                Tutup
              </Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isSuccess && (
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Terjadi kesalahan saat memproses transaksi. Silakan coba lagi.
            </p>
            <Button 
              onClick={() => onOpenChange(false)}
              variant="outline" 
              className="w-full"
            >
              Tutup
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionConfirmationDialog;
