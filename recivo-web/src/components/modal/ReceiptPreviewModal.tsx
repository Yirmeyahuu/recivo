import { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';
import { DownloadableReceipt } from '../../features/receipts/DownloadableReceipt';

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
  const [isDownloading, setIsDownloading] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    
    try {
      // Create a temporary container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      // Render the downloadable receipt
      const root = createRoot(container);
      root.render(
        <DownloadableReceipt
          receipt={receipt}
          cashierName={cashierName}
          footerMessage={footerMessage}
          formatCurrency={formatCurrency}
        />
      );

      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture with html2canvas
      const canvas = await html2canvas(container.firstChild as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Clean up
      root.unmount();
      document.body.removeChild(container);

      // Download
      const link = document.createElement('a');
      link.download = `receipt-${receipt.receiptNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      onDownloadSuccess?.();
    } catch (error) {
      console.error('Error generating receipt image:', error);
      onDownloadError?.();
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={handleBackdropClick}
      style={{ 
        isolation: 'isolate',
        zIndex: 99,
        margin: 0,
        padding: 0,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <div 
        className="bg-white w-full h-full sm:h-auto sm:rounded-2xl shadow-2xl 
          sm:max-w-lg sm:w-full sm:max-h-[90vh] 
          flex flex-col overflow-hidden animate-slide-up sm:animate-scale-in
          relative"
        style={{ zIndex: 10000 }}
      >
        {/* Modal Header - Sticky */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10 sm:rounded-t-2xl">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Receipt Preview</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors -mr-2"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Receipt Content - Scrollable with Tailwind */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8 max-w-md mx-auto">
            {/* Business Info */}
            <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {receipt.businessName}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {receipt.businessAddress}
              </p>
              {receipt.businessContact && (
                <p className="text-sm text-gray-600 mt-1">
                  {receipt.businessContact}
                </p>
              )}
            </div>

            {/* Receipt Details */}
            <div className="mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Receipt #:</span>
                <span className="font-mono font-semibold text-gray-900">
                  {receipt.receiptNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold text-gray-900">{receipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cashier:</span>
                <span className="font-semibold text-gray-900">{cashierName}</span>
              </div>
            </div>

            {/* Customer Info */}
            {(receipt.customerName || receipt.customerContact) && (
              <div className="mb-5 pb-4 border-b-2 border-gray-300">
                <p className="text-xs font-bold text-gray-700 mb-2 tracking-wider">
                  CUSTOMER:
                </p>
                {receipt.customerName && (
                  <p className="text-sm text-gray-900">{receipt.customerName}</p>
                )}
                {receipt.customerContact && (
                  <p className="text-sm text-gray-600 mt-1">{receipt.customerContact}</p>
                )}
              </div>
            )}

            {/* Items Table */}
            <div className="border-b-2 border-gray-300 pb-4 mb-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-1 text-xs font-bold text-gray-700 tracking-wider">
                      ITEM
                    </th>
                    <th className="text-center py-2 px-1 text-xs font-bold text-gray-700 tracking-wider">
                      QTY
                    </th>
                    <th className="text-right py-2 px-1 text-xs font-bold text-gray-700 tracking-wider">
                      PRICE
                    </th>
                    <th className="text-right py-2 px-1 text-xs font-bold text-gray-700 tracking-wider">
                      TOTAL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.items.map((item, index) => (
                    <tr key={item.id} className={index < receipt.items.length - 1 ? 'border-b border-gray-100' : ''}>
                      <td className="py-3 px-1 text-gray-900 break-words">{item.name}</td>
                      <td className="py-3 px-1 text-center text-gray-700 font-medium">{item.quantity}</td>
                      <td className="py-3 px-1 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 px-1 text-right font-semibold text-gray-900">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(receipt.subtotal)}</span>
              </div>
              {receipt.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(receipt.discount)}</span>
                </div>
              )}
              {receipt.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-semibold text-gray-900">+{formatCurrency(receipt.tax)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t-2 border-gray-300 mt-2">
                <span className="font-bold text-gray-900 text-base">TOTAL:</span>
                <span className="font-bold text-gray-900 text-xl">{formatCurrency(receipt.totalAmount)}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="border-t-2 border-gray-300 pt-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold text-gray-900">{receipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(receipt.amountPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Change:</span>
                <span className="font-bold text-emerald-600 text-base">{formatCurrency(receipt.change)}</span>
              </div>
            </div>

            {/* Footer Message */}
            {footerMessage && (
              <div className="text-center pt-4 border-t-2 border-gray-300">
                <p className="text-sm italic text-gray-500 leading-relaxed">
                  {footerMessage}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions - Sticky */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row gap-3 sm:rounded-b-2xl shadow-lg">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 
              text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/20 transition-all duration-200 
              disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 sm:px-6 py-3.5 bg-white hover:bg-gray-50 border-2 border-gray-300 
              text-gray-700 rounded-xl font-semibold transition-all duration-200
              hover:scale-[1.02] active:scale-[0.98]
              focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};