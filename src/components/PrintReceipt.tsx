
import React from 'react';
import type { Database } from '@/integrations/supabase/types';

type Sale = Database['public']['Tables']['sales']['Row'] & {
  sales_details: Array<Database['public']['Tables']['sales_details']['Row'] & {
    product: Database['public']['Tables']['products']['Row']
  }>
};

interface PrintReceiptProps {
  sale: Sale;
  onPrint: () => void;
}

const PrintReceipt: React.FC<PrintReceiptProps> = ({ sale, onPrint }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
    onPrint();
  };

  React.useEffect(() => {
    // Auto print after component mounts
    const timer = setTimeout(() => {
      handlePrint();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="print-receipt max-w-sm mx-auto bg-white p-4 text-sm">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-receipt, .print-receipt * {
            visibility: visible;
          }
          .print-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: none;
            margin: 0;
            padding: 10px;
            font-size: 12px;
            line-height: 1.2;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      
      <div className="text-center border-b pb-2 mb-2">
        <h2 className="font-bold text-lg">TOKO ANDA</h2>
        <p className="text-xs">Alamat Toko Anda</p>
        <p className="text-xs">Telp: 0123-456-789</p>
      </div>

      <div className="border-b pb-2 mb-2">
        <div className="flex justify-between">
          <span>No. Transaksi:</span>
          <span className="font-medium">{sale.sale_number}</span>
        </div>
        <div className="flex justify-between">
          <span>Tanggal:</span>
          <span>{formatDate(sale.sale_date)}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir:</span>
          <span>{sale.cashier_name}</span>
        </div>
        <div className="flex justify-between">
          <span>Pembayaran:</span>
          <span className="capitalize">{sale.payment_method.replace('_', ' ')}</span>
        </div>
      </div>

      <div className="border-b pb-2 mb-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1">Item</th>
              <th className="text-center py-1">Qty</th>
              <th className="text-right py-1">Harga</th>
              <th className="text-right py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.sales_details?.map((detail, index) => (
              <tr key={index}>
                <td className="py-1">
                  <div className="font-medium">{detail.product_name}</div>
                  <div className="text-gray-500">{detail.product_code}</div>
                </td>
                <td className="text-center py-1">{detail.quantity}</td>
                <td className="text-right py-1">{formatCurrency(detail.unit_price)}</td>
                <td className="text-right py-1">{formatCurrency(detail.total_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-1">
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
            <span>-{formatCurrency(sale.discount_amount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold border-t pt-1">
          <span>TOTAL:</span>
          <span>{formatCurrency(sale.total_amount)}</span>
        </div>
      </div>

      {sale.notes && (
        <div className="border-t pt-2 mt-2">
          <p className="text-xs">Catatan: {sale.notes}</p>
        </div>
      )}

      <div className="text-center text-xs mt-4 border-t pt-2">
        <p>Terima kasih atas kunjungan Anda!</p>
        <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
      </div>

      <div className="no-print mt-4 text-center">
        <button
          onClick={handlePrint}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Print Ulang
        </button>
      </div>
    </div>
  );
};

export default PrintReceipt;
