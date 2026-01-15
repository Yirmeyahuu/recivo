import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ReceiptPreviewModal } from '@/components/modal/ReceiptPreviewModal';

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
  createdAt?: any;
}

interface Settings {
  businessName: string;
  businessAddress: string;
  businessContact: string;
  businessEmail: string;
  currency: string;
  currencySymbolPosition: 'before' | 'after';
  taxEnabled: boolean;
  defaultTaxRate: number;
  showDiscountField: boolean;
  footerMessage: string;
}

export const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [savedReceipt, setSavedReceipt] = useState<Receipt | null>(null);

  // Fetch settings from Firestore
  const [settings, setSettings] = useState<Settings>({
    businessName: 'Not Set',
    businessAddress: 'Not Set',
    businessContact: '',
    businessEmail: 'Not Set',
    currency: 'PHP',
    currencySymbolPosition: 'before',
    taxEnabled: true,
    defaultTaxRate: 12,
    showDiscountField: true,
    footerMessage: 'Thank you for your purchase!',
  });

  // Fetch display name from settings
  useEffect(() => {
    const fetchDisplayName = async () => {
      if (!user?.uid) return;
      try {
        const docRef = doc(db, 'settings', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().ownerName) {
          setDisplayName(docSnap.data().ownerName);
        } else {
          setDisplayName(user?.displayName || 'User');
        }
      } catch (error) {
        console.error('Error fetching display name:', error);
        setDisplayName(user?.displayName || 'User');
      }
    };
    fetchDisplayName();
  }, [user?.uid, user?.displayName]);

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Customer info (optional)
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');

  // Line items
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', name: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);

  // Payment info
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(12);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.uid) {
        setLoadingSettings(false);
        return;
      }
      try {
        const docRef = doc(db, 'settings', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Settings;
          setSettings(data);
          setTaxRate(data.defaultTaxRate);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, [user?.uid]);

  // Add new item row
  const addItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  // Remove item
  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // Update item
  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  // Get currency symbol
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

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = settings.showDiscountField ? (subtotal * discount) / 100 : 0;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = settings.taxEnabled ? (taxableAmount * taxRate) / 100 : 0;
  const totalAmount = taxableAmount + taxAmount;
  const change = amountPaid - totalAmount;

  // Generate receipt number
  const receiptNumber = `REC-${Date.now()}`;
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Save receipt to Firestore
  const handleSaveReceipt = async () => {
    const receipt: Receipt = {
      businessName: settings.businessName,
      businessAddress: settings.businessAddress,
      businessContact: settings.businessContact,
      customerName: customerName || undefined,
      customerContact: customerContact || undefined,
      items: items.filter(item => item.name.trim() !== ''),
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      totalAmount,
      paymentMethod,
      amountPaid,
      change,
      receiptNumber,
      date: today,
      createdAt: Timestamp.now(),
    };

    try {
      await addDoc(collection(db, 'receipts'), {
        ...receipt,
        userId: user?.uid || null,
      });
      
      // Save receipt data and show modal
      setSavedReceipt(receipt);
      setShowPreviewModal(true);
      
      setNotification({ type: 'success', message: 'Receipt saved successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to save receipt.' });
      setTimeout(() => setNotification(null), 3000);
      console.error(error);
    }
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setShowPreviewModal(false);
    setSavedReceipt(null);
    
    // Reset form
    setCustomerName('');
    setCustomerContact('');
    setItems([{ id: '1', name: '', quantity: 1, unitPrice: 0, total: 0 }]);
    setPaymentMethod('Cash');
    setAmountPaid(0);
    setDiscount(0);
    setTaxRate(settings.defaultTaxRate);
  };

  const handleDownloadSuccess = () => {
    setNotification({ type: 'success', message: 'Receipt downloaded successfully!' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDownloadError = () => {
    setNotification({ type: 'error', message: 'Failed to download receipt' });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loadingSettings) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
      {showPreviewModal && savedReceipt && (
        <ReceiptPreviewModal
          receipt={savedReceipt}
          cashierName={displayName || user?.displayName || user?.email || 'User'}
          footerMessage={settings.footerMessage}
          formatCurrency={formatCurrency}
          onClose={handleCloseModal}
          onDownloadSuccess={handleDownloadSuccess}
          onDownloadError={handleDownloadError}
        />
      )}
      
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Generate A Receipt</h1>
        <p className="text-sm text-gray-600 mt-1">
          Fill in the details to generate a new receipt
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* A. Business Information (Read-only) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4 justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6 6M3 17.25V21h3.75l11.06-11.06a2.121 2.121 0 00-3-3L3 17.25z" />
                </svg>
                Edit
              </button>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-gray-900">{settings.businessName}</p>
              <p className="text-sm text-gray-600">{settings.businessAddress}</p>
              {settings.businessContact && (
                <p className="text-sm text-gray-600">{settings.businessContact}</p>
              )}
              <p className="text-sm text-gray-600">{settings.businessEmail}</p>
            </div>
          </div>

          {/* B. Customer Information (Optional) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Optional</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Contact
                </label>
                <input
                  type="text"
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                  placeholder="Phone or email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* C. Items / Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">Items</h2>
              </div>
              <button
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              {/* Desktop View - Table */}
              <table className="hidden md:table w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Item Name</th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700 w-28">Qty</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 w-36">Unit Price</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 w-36">Total</th>
                    <th className="w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          placeholder="Item name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                          min="1"
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-center"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                          min="0"
                          step="0.01"
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-right"
                        />
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-gray-900 text-sm">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            
              {/* Mobile View - Grid Cards */}
              <div className="md:hidden space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                    {/* First Row: Item Name & Quantity */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Item Name
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          placeholder="Item name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Qty
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                          min="1"
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-center"
                        />
                      </div>
                    </div>
            
                    {/* Second Row: Unit Price & Total */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Unit Price
                        </label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                          min="0"
                          step="0.01"
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-right"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Total
                        </label>
                        <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-semibold text-emerald-700 text-right">
                          {formatCurrency(item.total)}
                        </div>
                      </div>
                    </div>
            
                    {/* Delete Button */}
                    <div className="flex justify-end pt-2 border-t border-gray-200">
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* E. Payment Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option>Cash</option>
                  <option>GCash</option>
                  <option>Bank Transfer</option>
                  <option>Credit Card</option>
                  <option>Debit Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Paid
                </label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* D. Totals Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-20">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>

              {/* Show discount only if enabled */}
              {settings.showDiscountField && (
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Discount:</span>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      min="0"
                      max="100"
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-xs text-right"
                    />
                    <span className="text-gray-500">%</span>
                  </div>
                  <span className="font-semibold text-red-600">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              {/* Show tax only if enabled */}
              {settings.taxEnabled && (
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Tax:</span>
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      min="0"
                      max="100"
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-xs text-right"
                    />
                    <span className="text-gray-500">%</span>
                  </div>
                  <span className="font-semibold">+{formatCurrency(taxAmount)}</span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-emerald-600">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-semibold">{formatCurrency(amountPaid)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Change:</span>
                  <span className={`font-semibold ${change < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {formatCurrency(change)}
                  </span>
                </div>
              </div>
            </div>

            {/* F. Receipt Metadata */}
            <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Receipt #:</span>
                <span className="font-mono">{receiptNumber}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Date:</span>
                <span>{today}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Cashier:</span>
                <span>{displayName || user?.displayName || user?.email || 'User'}</span>
              </div>
            </div>

            {/* Footer Message */}
            {settings.footerMessage && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-xs text-center text-gray-500 italic">{settings.footerMessage}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleSaveReceipt}
                disabled={items.filter(item => item.name.trim() !== '').length === 0 || amountPaid < totalAmount}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};