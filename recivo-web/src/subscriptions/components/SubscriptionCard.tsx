import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { getPlanByTier, formatPrice } from '../utils/pricing';
import { getDaysUntilRenewal } from '../utils/subscriptionHelpers';
import { SubscriptionTier, SubscriptionStatus } from '../types';

interface SubscriptionCardProps {
  /** Show detailed information */
  detailed?: boolean;
  /** Show action buttons */
  showActions?: boolean;
}

export const SubscriptionCard = ({
  detailed = false,
  showActions = true,
}: SubscriptionCardProps) => {
  const navigate = useNavigate();
  const {
    subscription,
    usage,
    loading,
    isPremium,
    generationsRemaining,
    cancel,
    resume,
  } = useSubscription();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <p className="text-gray-600">No subscription found</p>
      </div>
    );
  }

  const plan = getPlanByTier(subscription.tier);
  const daysUntilRenewal = getDaysUntilRenewal(subscription);
  const isCanceled = subscription.cancelAtPeriodEnd;
  const isExpired = subscription.status === SubscriptionStatus.EXPIRED;
  const isTrial = subscription.status === SubscriptionStatus.TRIAL;

  const handleUpgrade = () => {
    navigate('/subscription');
  };

  const handleManageBilling = () => {
    navigate('/subscription/manage');
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
      try {
        await cancel();
      } catch (error) {
        console.error('Failed to cancel subscription:', error);
      }
    }
  };

  const handleResumeSubscription = async () => {
    try {
      await resume();
    } catch (error) {
      console.error('Failed to resume subscription:', error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div
        className={`p-6 ${
          isPremium
            ? 'bg-gradient-to-r from-emerald-600 to-emerald-800'
            : 'bg-gray-100'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3
              className={`text-2xl font-bold ${
                isPremium ? 'text-white' : 'text-gray-900'
              }`}
            >
              {plan?.name || 'Unknown Plan'}
            </h3>
            <p
              className={`text-sm mt-1 ${
                isPremium ? 'text-emerald-100' : 'text-gray-600'
              }`}
            >
              {isTrial ? 'Trial Period' : subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </p>
          </div>

          {/* Badge */}
          {isPremium && (
            <div className="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          )}
        </div>

        {/* Price */}
        {plan && (
          <div className="mt-4">
            <span
              className={`text-3xl font-bold ${
                isPremium ? 'text-white' : 'text-gray-900'
              }`}
            >
              {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
            </span>
            {plan.price > 0 && (
              <span
                className={`text-sm ml-2 ${
                  isPremium ? 'text-emerald-100' : 'text-gray-600'
                }`}
              >
                / {plan.interval}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Usage Stats */}
        {usage && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Receipt Generations
              </span>
              <span className="text-sm text-gray-600">
                {generationsRemaining === null
                  ? 'Unlimited'
                  : `${generationsRemaining} remaining today`}
              </span>
            </div>

            {/* Progress Bar */}
            {generationsRemaining !== null && usage.limit !== null && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    generationsRemaining <= 2
                      ? 'bg-red-500'
                      : generationsRemaining <= 5
                      ? 'bg-yellow-500'
                      : 'bg-emerald-600'
                  }`}
                  style={{
                    width: `${
                      ((usage.limit - generationsRemaining) / usage.limit) * 100
                    }%`,
                  }}
                ></div>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              {usage.receiptGenerationsThisMonth} generations this month
            </p>
          </div>
        )}

        {/* Status Messages */}
        {isCanceled && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  Subscription Canceled
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Your subscription will end on{' '}
                  {subscription.endDate?.toLocaleDateString()}. You can resume
                  anytime before then.
                </p>
              </div>
            </div>
          </div>
        )}

        {isTrial && subscription.trialEndsAt && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  Trial Period
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Your trial ends on{' '}
                  {subscription.trialEndsAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Renewal Info */}
        {!isCanceled && !isExpired && isPremium && (
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Next billing date:{' '}
              <span className="font-semibold text-gray-900">
                {subscription.currentPeriodEnd.toLocaleDateString()}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {daysUntilRenewal} days remaining
            </p>
          </div>
        )}

        {/* Features (detailed view) */}
        {detailed && plan && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Plan Features
            </h4>
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start text-sm text-gray-700">
                  <svg
                    className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="space-y-3">
            {!isPremium && (
              <button
                onClick={handleUpgrade}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-900 transition shadow-lg"
              >
                Upgrade to Premium
              </button>
            )}

            {isPremium && !isCanceled && (
              <>
                <button
                  onClick={handleManageBilling}
                  className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Manage Billing
                </button>
                <button
                  onClick={handleCancelSubscription}
                  className="w-full py-2 px-4 text-red-600 text-sm font-medium hover:text-red-700 transition"
                >
                  Cancel Subscription
                </button>
              </>
            )}

            {isCanceled && (
              <button
                onClick={handleResumeSubscription}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-900 transition shadow-lg"
              >
                Resume Subscription
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};