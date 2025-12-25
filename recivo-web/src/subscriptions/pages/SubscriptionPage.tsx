import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubscriptionPlans } from '../components/SubscriptionPlans';
import { SubscriptionCard } from '../components/SubscriptionCard';
import { useSubscription } from '../hooks/useSubscription';

export const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { subscription, isPremium } = useSubscription();
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
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
                Subscription Plans
              </h1>
              <p className="text-gray-600 mt-2">
                Choose the perfect plan for your needs
              </p>
            </div>

            {isPremium && (
              <button
                onClick={() => navigate('/subscription/manage')}
                className="px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition"
              >
                Manage Subscription
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Current Subscription Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Current Plan
              </h2>
              <SubscriptionCard detailed showActions={false} />

              {/* Quick Stats */}
              <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        subscription?.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {subscription?.status || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Plan Type</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {subscription?.tier || 'Free'}
                    </span>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-blue-900 mb-3">
                  💡 Need Help?
                </h3>
                <ul className="space-y-2 text-xs text-blue-800">
                  <li>• All plans include 7-day money-back guarantee</li>
                  <li>• Cancel anytime, no questions asked</li>
                  <li>• Instant activation after payment</li>
                  <li>• Secure payment with encryption</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Plans Section */}
          <div className="lg:col-span-2">
            {/* Toggle for comparison view */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Available Plans
              </h2>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                {showComparison ? 'Hide' : 'Show'} Comparison
              </button>
            </div>

            {/* Comparison Table */}
            {showComparison && (
              <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Feature
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                          Free
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-emerald-50">
                          Premium Single
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                          Premium Org
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          Receipt Generations
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">
                          5/day
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-900 bg-emerald-50 font-semibold">
                          Unlimited
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-900 font-semibold">
                          Unlimited
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          Team Members
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">
                          1
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600 bg-emerald-50">
                          1
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-900 font-semibold">
                          Up to 5
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          Cloud Storage
                        </td>
                        <td className="px-6 py-4 text-center">
                          <svg
                            className="w-5 h-5 text-gray-400 mx-auto"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </td>
                        <td className="px-6 py-4 text-center bg-emerald-50">
                          <svg
                            className="w-5 h-5 text-emerald-600 mx-auto"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <svg
                            className="w-5 h-5 text-emerald-600 mx-auto"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          Priority Support
                        </td>
                        <td className="px-6 py-4 text-center">
                          <svg
                            className="w-5 h-5 text-gray-400 mx-auto"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </td>
                        <td className="px-6 py-4 text-center bg-emerald-50">
                          <svg
                            className="w-5 h-5 text-emerald-600 mx-auto"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <svg
                            className="w-5 h-5 text-emerald-600 mx-auto"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Plans Grid */}
            <SubscriptionPlans />
          </div>
        </div>

        {/* Testimonials or Trust Badges */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 text-center mb-8">
            Trusted by thousands of users
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                10K+
              </div>
              <p className="text-gray-600">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                500K+
              </div>
              <p className="text-gray-600">Receipts Generated</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                4.9/5
              </div>
              <p className="text-gray-600">User Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};