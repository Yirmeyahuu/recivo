// filepath: /Users/jeremiahpantaras/Downloads/Recivo/recivo-web/src/features/receipts/ReceiptList.tsx
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '@/store/auth.store';
import { ReceiptPreviewModal } from '@/components/modal/ReceiptPreviewModal';

interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Receipt {
  id: string;
  businessName: string;
  businessAddress: string;
  businessContact: string;
  customerName?: string;
  customerContact?: string;
  totalAmount: number;
  date: string;
  createdAt?: Timestamp;
  items: LineItem[];
  paymentMethod: string;
  receiptNumber: string;
  subtotal: number;
  discount: number;
  tax: number;
  amountPaid: number;
  change: number;
}

interface Settings {
  currency: string;
  currencySymbolPosition: 'before' | 'after';
  footerMessage: string;
  ownerName?: string;
}

export const ReceiptList = () => {
  const user = useAuthStore((state) => state.user);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    currency: 'PHP',
    currencySymbolPosition: 'before',
    footerMessage: 'Thank you for your purchase!',
  });
  const [displayName, setDisplayName] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('All');
  const [sortByDate, setSortByDate] = useState<'newest' | 'oldest'>('newest');

  const receiptsPerPage = 8;
  const indexOfLast = currentPage * receiptsPerPage;
  const indexOfFirst = indexOfLast - receiptsPerPage;
  const currentReceipts = filteredReceipts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredReceipts.length / receiptsPerPage);

  const paymentMethods = ['All', 'Cash', 'GCash', 'Bank Transfer', 'Credit Card', 'Debit Card'];

  // Fetch settings and display name
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.uid) return;
      try {
        const docRef = doc(db, 'settings', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Settings;
          setSettings(data);
          setDisplayName(data.ownerName || user?.displayName || 'User');
        } else {
          setDisplayName(user?.displayName || 'User');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        setDisplayName(user?.displayName || 'User');
      }
    };
    fetchSettings();
  }, [user?.uid, user?.displayName]);

  // Fetch receipts
  useEffect(() => {
    const fetchReceipts = async () => {
      if (!user?.uid) {
        setError('User not logged in.');
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'receipts'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const data: Receipt[] = [];
        querySnapshot.forEach((doc) => {
          data.push({
            id: doc.id,
            ...(doc.data() as Omit<Receipt, 'id'>),
          });
        });
        setReceipts(data);
      } catch (err) {
        setError('Failed to load receipts.');
      } finally {
        setLoading(false);
      }
    };
    fetchReceipts();
  }, [user?.uid]);

  // Filter and Sort Receipts
  useEffect(() => {
    let result = [...receipts];

    // Search by customer name
    if (searchQuery.trim()) {
      result = result.filter((receipt) =>
        receipt.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by payment method
    if (selectedPaymentMethod !== 'All') {
      result = result.filter((receipt) => receipt.paymentMethod === selectedPaymentMethod);
    }

    // Sort by date
    result.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      const comparison = b.createdAt.toMillis() - a.createdAt.toMillis();
      return sortByDate === 'newest' ? comparison : -comparison;
    });

    setFilteredReceipts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [receipts, searchQuery, selectedPaymentMethod, sortByDate]);

  // Format currency
  const getCurrencySymbol = () => {
    const symbols: { [key: string]: string } = {
      PHP: '₱',
      USD: '$',
      EUR: '€',
    };
    return symbols[settings.currency] || '₱';
  };

  const formatCurrency = (amount: number) => {
    const symbol = getCurrencySymbol();
    return settings.currencySymbolPosition === 'before'
      ? `${symbol}${amount.toFixed(2)}`
      : `${amount.toFixed(2)}${symbol}`;
  };

  // Handle receipt card click
  const handleReceiptClick = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setShowPreviewModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowPreviewModal(false);
    setSelectedReceipt(null);
  };

  // Download success/error handlers
  const handleDownloadSuccess = () => {
    setNotification({ type: 'success', message: 'Receipt downloaded successfully!' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDownloadError = () => {
    setNotification({ type: 'error', message: 'Failed to download receipt' });
    setTimeout(() => setNotification(null), 3000);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedPaymentMethod('All');
    setSortByDate('newest');
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-9999 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3
            ${notification.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
            }`}
          style={{ minWidth: 280 }}
        >
          {notification.type === 'success' ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {showPreviewModal && selectedReceipt && (
        <ReceiptPreviewModal
          receipt={selectedReceipt}
          cashierName={displayName}
          footerMessage={settings.footerMessage}
          formatCurrency={formatCurrency}
          onClose={handleCloseModal}
          onDownloadSuccess={handleDownloadSuccess}
          onDownloadError={handleDownloadError}
        />
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">My Receipts</h1>
        <p className="text-sm text-gray-600 mt-1">
          Click on any receipt to view details and download
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Payment Method Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort by Date
              </label>
              <select
                value={sortByDate}
                onChange={(e) => setSortByDate(e.target.value as 'newest' | 'oldest')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-emerald-600">{filteredReceipts.length}</span> of{' '}
            <span className="font-semibold">{receipts.length}</span> receipts
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <span className="text-gray-500">Loading receipts...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex justify-center items-center py-10">
          <span className="text-red-600">{error}</span>
        </div>
      )}

      {/* Receipts List */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-10">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">No receipts found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentReceipts.map((receipt) => (
                  <button
                    key={receipt.id}
                    onClick={() => handleReceiptClick(receipt)}
                    className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl shadow-sm p-5 flex flex-col gap-2 text-left hover:shadow-lg hover:border-emerald-300 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer"
                  >
                    {/* Payment Method Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2 py-1 rounded bg-emerald-200 text-emerald-800 font-semibold">
                        {receipt.paymentMethod}
                      </span>
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>

                    {/* Total Amount */}
                    <div className="font-bold text-lg text-emerald-700">
                      {formatCurrency(receipt.totalAmount)}
                    </div>

                    {/* Business Name */}
                    <div className="text-sm text-gray-900 font-semibold">
                      {receipt.businessName}
                    </div>

                    {/* Customer */}
                    <div className="text-sm text-gray-600">
                      Customer: {receipt.customerName || <span className="text-gray-400">N/A</span>}
                    </div>

                    {/* Receipt Number */}
                    <div className="text-xs text-gray-500 font-mono">
                      {receipt.receiptNumber}
                    </div>

                    {/* Date */}
                    <div className="text-xs text-gray-500 mt-2">
                      {receipt.date || (receipt.createdAt && receipt.createdAt.toDate().toLocaleDateString())}
                    </div>
                  </button>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                  >
                    Prev
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded border ${
                        currentPage === i + 1
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border bg-white text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};