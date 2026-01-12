import { useRef, useEffect, useState } from 'react';
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
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleDownload = async () => {
    if (!receiptRef.current || isDownloading) return;

    setIsDownloading(true);
    
    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: receiptRef.current.scrollWidth,
        height: receiptRef.current.scrollHeight,
      });
      
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
        zIndex: 9999,
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

        {/* Receipt Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          <div 
            ref={receiptRef} 
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
            style={{ 
              padding: isMobile ? '1.5rem' : '2rem',
            }}
          >
            {/* ...existing receipt content... */}
            {/* Business Info */}
            <div className="text-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-300">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                {receipt.businessName}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {receipt.businessAddress}
              </p>
              {receipt.businessContact && (
                <p className="text-xs sm:text-sm text-gray-600">
                  {receipt.businessContact}
                </p>
              )}
            </div>

            {/* Receipt Details */}
            <div className="mb-3 sm:mb-4 space-y-1.5 sm:space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Receipt #:</span>
                <span className="font-mono font-semibold text-gray-900">
                  {receipt.receiptNumber}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold text-gray-900">{receipt.date}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Cashier:</span>
                <span className="font-semibold text-gray-900">{cashierName}</span>
              </div>
            </div>

            {/* Customer Info (if provided) */}
            {(receipt.customerName || receipt.customerContact) && (
              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-300">
                <p className="text-xs font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  CUSTOMER:
                </p>
                {receipt.customerName && (
                  <p className="text-xs sm:text-sm text-gray-900">{receipt.customerName}</p>
                )}
                {receipt.customerContact && (
                  <p className="text-xs sm:text-sm text-gray-600">{receipt.customerContact}</p>
                )}
              </div>
            )}

            {/* Items Table */}
            <div className="border-b border-gray-300 pb-3 sm:pb-4 mb-3 sm:mb-4 overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-xs font-semibold text-gray-700">
                      ITEM
                    </th>
                    <th className="text-center py-2 px-2 text-xs font-semibold text-gray-700 whitespace-nowrap">
                      QTY
                    </th>
                    <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700 whitespace-nowrap">
                      PRICE
                    </th>
                    <th className="text-right py-2 text-xs font-semibold text-gray-700 whitespace-nowrap">
                      TOTAL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-2 text-gray-900 break-words">{item.name}</td>
                      <td className="py-2 px-2 text-center text-gray-700 whitespace-nowrap">{item.quantity}</td>
                      <td className="py-2 px-2 text-right text-gray-700 whitespace-nowrap">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-2 text-right font-semibold text-gray-900 whitespace-nowrap">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
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
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="font-bold text-gray-900">TOTAL:</span>
                <span className="font-bold text-base sm:text-lg text-gray-900">
                  {formatCurrency(receipt.totalAmount)}
                </span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="border-t border-gray-300 pt-3 sm:pt-4 mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
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
                <span className="font-semibold text-emerald-600">{formatCurrency(receipt.change)}</span>
              </div>
            </div>

            {/* Footer Message */}
            {footerMessage && (
              <div className="text-center pt-3 sm:pt-4 border-t border-gray-300">
                <p className="text-xs text-gray-500 italic">
                  {footerMessage}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions - Sticky with proper padding */}
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