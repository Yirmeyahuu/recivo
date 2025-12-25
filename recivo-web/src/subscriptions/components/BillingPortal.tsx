import { useState } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { subscriptionService } from '@/services/SubscriptionService';
import { formatPrice } from '../utils/pricing';

export const BillingPortal = () => {
  const { subscription, loading } = useSubscription();
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenPortal = async () => {
    try {
      setIsOpening(true);
      setError(null);
      
      const url = await subscriptionService.getBillingPortalUrl();
      
      // Open billing portal in new window
      const portalWindow = window.open(url, '_blank', 'noopener,noreferrer');
      
      if (!portalWindow) {
        setError('Please allow popups for this site to access the billing portal.');
      }
    } catch (err: any) {
      console.error('Failed to open billing portal:', err);
      setError(err.message || 'Failed to open billing portal. Please try again.');
    } finally {
      setIsOpening(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  // Payment method mock data (replace with real data from backend)
  const paymentMethod = subscription.paymentProvider ? {
    type: subscription.paymentProvider === 'stripe' ? 'card' : 'mobile',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2025,
  } : null;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-6">
        <h3 className="text-xl font-bold text-white mb-2">
          Billing Information
        </h3>
        <p className="text-emerald-100 text-sm">
          Manage your payment methods and billing details
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Payment Method
          </h4>
          {paymentMethod ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-4">
                {/* Card Icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>

                {/* Card Details */}
                <div>
                  <p className="font-semibold text-gray-900">
                    {paymentMethod.brand} •••• {paymentMethod.last4}
                  </p>
                  <p className="text-sm text-gray-600">
                    Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
                  </p>
                </div>
              </div>

              {/* Default Badge */}
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                Default
              </span>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <p className="text-sm text-gray-600">No payment method on file</p>
            </div>
          )}
        </div>

        {/* Billing Details */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Billing Details
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-sm text-gray-700">Current Plan</span>
              <span className="text-sm font-semibold text-gray-900">
                {subscription.tier.replace('_', ' ').split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </span>
            </div>
            
            {subscription.tier !== 'free' && (
              <>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-700">Billing Cycle</span>
                  <span className="text-sm font-semibold text-gray-900">Monthly</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-sm text-gray-700">Next Payment</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {subscription.currentPeriodEnd.toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-700">Amount</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {subscription.tier === 'premium_single' ? formatPrice(9.99) : formatPrice(29.99)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleOpenPortal}
            disabled={isOpening}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-900 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isOpening ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Opening Portal...
              </>
            ) : (
              <>
                Manage Billing & Payments
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            You'll be redirected to a secure billing portal where you can update
            payment methods, view invoices, and manage your subscription.
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-900">Secure Payment</p>
              <p className="text-xs text-blue-700 mt-1">
                All payment information is encrypted and processed securely. We never
                store your full card details.
              </p>
            </div>
          </div>
        </div>

        {/* Invoice History Link */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleOpenPortal}
            className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            View Invoice History →
          </button>
        </div>
      </div>
    </div>
  );
};