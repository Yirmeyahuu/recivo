import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubscriptionCard } from '../components/SubscriptionCard';
import { BillingPortal } from '../components/BillingPortal';
import { useSubscription } from '../hooks/useSubscription';
import { subscriptionService } from '@/services/SubscriptionService';

export const ManageSubscriptionPage = () => {
  const navigate = useNavigate();
  const { subscription, cancel, resume, loading } = useSubscription();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingPortalUrl, setBillingPortalUrl] = useState<string | null>(null);

  const handleOpenBillingPortal = async () => {
    try {
      setIsProcessing(true);
      const url = await subscriptionService.getBillingPortalUrl();
      setBillingPortalUrl(url);
      // Open in new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setIsProcessing(true);
      await cancel();
      setShowCancelConfirm(false);
      alert('Subscription canceled successfully. You will retain access until the end of your billing period.');
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResumeSubscription = async () => {
    try {
      setIsProcessing(true);
      await resume();
      alert('Subscription resumed successfully!');
    } catch (error) {
      console.error('Failed to resume subscription:', error);
      alert('Failed to resume subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Subscription
          </h1>
          <p className="text-gray-600 mt-2">
            Update your plan, billing, and payment methods
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Subscription Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Subscription Card */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Current Plan
              </h2>
              <SubscriptionCard detailed showActions={false} />
            </section>

            {/* Billing Portal */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Billing & Payment
              </h2>
              <BillingPortal />
            </section>

            {/* Plan Changes */}
            <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Plan Options
              </h2>

              <div className="space-y-4">
                {/* Upgrade/Change Plan */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Change Plan
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Upgrade or downgrade your subscription
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/subscription')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
                  >
                    View Plans
                  </button>
                </div>

                {/* Cancel/Resume */}
                {subscription?.cancelAtPeriodEnd ? (
                  <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-yellow-900">
                        Subscription Canceled
                      </h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your subscription will end on{' '}
                        {subscription.endDate?.toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={handleResumeSubscription}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : 'Resume'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Cancel Subscription
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Cancel your subscription at any time
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="px-4 py-2 text-red-600 border border-red-600 rounded-lg font-medium hover:bg-red-50 transition"
                    >
                      Cancel Plan
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Usage History */}
            <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Usage History
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-700">This Month</span>
                  <span className="font-semibold text-gray-900">
                    {subscription?.receiptGenerationsToday || 0} receipts
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-700">Last Month</span>
                  <span className="font-semibold text-gray-900">
                    0 receipts
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-700">All Time</span>
                  <span className="font-semibold text-gray-900">
                    {subscription?.receiptGenerationsToday || 0} receipts
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Quick Actions & Info */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleOpenBillingPortal}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition text-left flex items-center justify-between disabled:opacity-50"
                >
                  <span>Update Payment Method</span>
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleOpenBillingPortal}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition text-left flex items-center justify-between disabled:opacity-50"
                >
                  <span>Download Invoices</span>
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Support */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-emerald-900 mb-3">
                Need Help?
              </h3>
              <p className="text-sm text-emerald-800 mb-4">
                Our support team is here to help you with any questions or issues.
              </p>
              <button className="w-full py-2 px-4 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition">
                Contact Support
              </button>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Common Questions
              </h3>
              <div className="space-y-4">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-900">
                    How do I cancel my subscription?
                    <svg
                      className="w-5 h-5 text-gray-500 group-open:rotate-180 transition"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    You can cancel your subscription anytime from this page. You'll
                    retain access until the end of your billing period.
                  </p>
                </details>
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-900">
                    Can I upgrade or downgrade my plan?
                    <svg
                      className="w-5 h-5 text-gray-500 group-open:rotate-180 transition"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    Yes! You can change your plan at any time. Changes take effect
                    immediately for upgrades, or at the next billing cycle for
                    downgrades.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Cancel Subscription?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your subscription? You will still have
              access until {subscription?.currentPeriodEnd.toLocaleDateString()}.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {isProcessing ? 'Canceling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};