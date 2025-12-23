import { useRef } from 'react';
import html2canvas from 'html2canvas';

interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Receipt {
  businessName: string;
  businessAddress: string;
  businessContact: string;
  customerName?: string;
  customerContact?: string;
  items: LineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: string;
  amountPaid: number;
  change: number;
  receiptNumber: string;
  date: string;
}

interface ReceiptPreviewModalProps {
  receipt: Receipt;
  cashierName: string;
  footerMessage?: string;
  formatCurrency: (amount: number) => string;
  onClose: () => void;
  onDownloadSuccess?: () => void;
  onDownloadError?: () => void;
}

export const ReceiptPreviewModal = ({
  receipt,
  cashierName,
  footerMessage,
  formatCurrency,
  onClose,
  onDownloadSuccess,
  onDownloadError,
}: ReceiptPreviewModalProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      
      const link = document.createElement('a');
      link.download = `receipt-${receipt.receiptNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      onDownloadSuccess?.();
    } catch (error) {
      console.error('Error generating receipt image:', error);
      onDownloadError?.();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-semibold text-gray-900">Receipt Preview</h3>
        </div>

        {/* Receipt Content */}
        <div className="p-6">
          <div 
            ref={receiptRef} 
            style={{ 
              backgroundColor: '#ffffff',
              padding: '2rem',
              border: '1px solid #E5E7EB',
              borderRadius: '0.5rem'
            }}
          >
            {/* Business Info */}
            <div style={{ 
              textAlign: 'center',
              marginBottom: '1.5rem',
              borderBottom: '1px solid #D1D5DB',
              paddingBottom: '1rem'
            }}>
              <h2 style={{ 
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '0.25rem'
              }}>
                {receipt.businessName}
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#4B5563', marginTop: '0.25rem' }}>
                {receipt.businessAddress}
              </p>
              {receipt.businessContact && (
                <p style={{ fontSize: '0.875rem', color: '#4B5563' }}>
                  {receipt.businessContact}
                </p>
              )}
            </div>

            {/* Receipt Details */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#4B5563' }}>Receipt #:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#111827' }}>
                  {receipt.receiptNumber}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#4B5563' }}>Date:</span>
                <span style={{ fontWeight: '600', color: '#111827' }}>{receipt.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: '#4B5563' }}>Cashier:</span>
                <span style={{ fontWeight: '600', color: '#111827' }}>{cashierName}</span>
              </div>
            </div>

            {/* Customer Info (if provided) */}
            {(receipt.customerName || receipt.customerContact) && (
              <div style={{ 
                marginBottom: '1rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid #D1D5DB'
              }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  CUSTOMER:
                </p>
                {receipt.customerName && (
                  <p style={{ fontSize: '0.875rem', color: '#111827' }}>{receipt.customerName}</p>
                )}
                {receipt.customerContact && (
                  <p style={{ fontSize: '0.875rem', color: '#4B5563' }}>{receipt.customerContact}</p>
                )}
              </div>
            )}

            {/* Items */}
            <div style={{ 
              borderBottom: '1px solid #D1D5DB',
              paddingBottom: '1rem',
              marginBottom: '1rem'
            }}>
              <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: '600', color: '#374151' }}>
                      ITEM
                    </th>
                    <th style={{ textAlign: 'center', padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: '600', color: '#374151' }}>
                      QTY
                    </th>
                    <th style={{ textAlign: 'right', padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: '600', color: '#374151' }}>
                      PRICE
                    </th>
                    <th style={{ textAlign: 'right', padding: '0.5rem 0', fontSize: '0.75rem', fontWeight: '600', color: '#374151' }}>
                      TOTAL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '0.5rem 0', color: '#111827' }}>{item.name}</td>
                      <td style={{ padding: '0.5rem 0', textAlign: 'center', color: '#374151' }}>{item.quantity}</td>
                      <td style={{ padding: '0.5rem 0', textAlign: 'right', color: '#374151' }}>
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td style={{ padding: '0.5rem 0', textAlign: 'right', fontWeight: '600', color: '#111827' }}>
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#4B5563' }}>Subtotal:</span>
                <span style={{ fontWeight: '600', color: '#111827' }}>{formatCurrency(receipt.subtotal)}</span>
              </div>
              {receipt.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#4B5563' }}>Discount:</span>
                  <span style={{ fontWeight: '600', color: '#DC2626' }}>-{formatCurrency(receipt.discount)}</span>
                </div>
              )}
              {receipt.tax > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#4B5563' }}>Tax:</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>+{formatCurrency(receipt.tax)}</span>
                </div>
              )}
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.5rem',
                borderTop: '1px solid #D1D5DB'
              }}>
                <span style={{ fontWeight: 'bold', color: '#111827' }}>TOTAL:</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#111827' }}>
                  {formatCurrency(receipt.totalAmount)}
                </span>
              </div>
            </div>

            {/* Payment Info */}
            <div style={{ 
              borderTop: '1px solid #D1D5DB',
              paddingTop: '1rem',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#4B5563' }}>Payment Method:</span>
                <span style={{ fontWeight: '600', color: '#111827' }}>{receipt.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#4B5563' }}>Amount Paid:</span>
                <span style={{ fontWeight: '600', color: '#111827' }}>{formatCurrency(receipt.amountPaid)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#4B5563' }}>Change:</span>
                <span style={{ fontWeight: '600', color: '#059669' }}>{formatCurrency(receipt.change)}</span>
              </div>
            </div>

            {/* Footer Message */}
            {footerMessage && (
              <div style={{ 
                textAlign: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid #D1D5DB'
              }}>
                <p style={{ fontSize: '0.75rem', color: '#6B7280', fontStyle: 'italic' }}>
                  {footerMessage}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 rounded-b-2xl">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold shadow-lg"
            style={{ backgroundColor: '#059669', color: '#ffffff' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white border rounded-lg font-semibold"
            style={{ borderColor: '#D1D5DB', color: '#374151' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};