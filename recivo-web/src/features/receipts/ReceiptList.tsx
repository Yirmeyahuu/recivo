import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useAuthStore } from '@/store/auth.store';

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
  customerName?: string;
  totalAmount: number;
  date: string;
  createdAt?: Timestamp;
  items: LineItem[];
  paymentMethod: string;
}

export const ReceiptList = () => {
  const user = useAuthStore((state) => state.user);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const receiptsPerPage = 8;

  const indexOfLast = currentPage * receiptsPerPage;
  const indexOfFirst = indexOfLast - receiptsPerPage;
  const currentReceipts = receipts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(receipts.length / receiptsPerPage);







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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">My Receipts</h1>
        <p className="text-sm text-gray-600 mt-1">
          List of all receipts you have created.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <span className="text-gray-500">Loading receipts...</span>
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center py-10">
          <span className="text-red-600">{error}</span>
        </div>
      )}

    {!loading && !error && (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {receipts.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
            No receipts found.
        </div>
        ) : (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentReceipts.map((receipt) => (
                <div
                key={receipt.id}
                className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl shadow-sm p-5 flex flex-col gap-2"
                >
                {/* ...card content... */}
                <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-gray-500">#{receipt.receiptNumber || receipt.id}</span>
                    <span className="text-xs px-2 py-1 rounded bg-emerald-200 text-emerald-800 font-semibold">{receipt.paymentMethod}</span>
                </div>
                <div className="font-bold text-lg text-emerald-700">₱{receipt.totalAmount?.toFixed(2)}</div>
                <div className="text-sm text-gray-900 font-semibold">{receipt.businessName}</div>
                <div className="text-sm text-gray-600">
                    Customer: {receipt.customerName || <span className="text-gray-400">N/A</span>}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                    {receipt.date ||
                    (receipt.createdAt && receipt.createdAt.toDate().toLocaleDateString())}
                </div>
                </div>
            ))}
            </div>
            {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
                <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border bg-white text-gray-700 disabled:opacity-50"
                >
                Prev
                </button>
                {[...Array(totalPages)].map((_, i) => (
                <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700'}`}
                >
                    {i + 1}
                </button>
                ))}
                <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border bg-white text-gray-700 disabled:opacity-50"
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