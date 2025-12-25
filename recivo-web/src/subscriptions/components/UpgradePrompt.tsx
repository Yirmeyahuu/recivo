import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { SubscriptionTier } from '../types';
import { getPlanByTier, formatPrice } from '../utils/pricing';

interface UpgradePromptProps {
  /** Custom title */
  title?: string;
  /** Custom message */
  message?: string;
  /** Recommended tier to upgrade to */
  recommendedTier?: SubscriptionTier;
  /** Show as modal or inline */
  variant?: 'modal' | 'inline' | 'banner';
  /** Callback when dismissed */
  onDismiss?: () => void;
}

export const UpgradePrompt = ({
  title = 'Upgrade to Premium',
  message,
  recommendedTier = SubscriptionTier.PREMIUM_SINGLE,
  variant = 'inline',
  onDismiss,
}: UpgradePromptProps) => {
  const navigate = useNavigate();
  const { generationsRemaining, subscription } = useSubscription();
  
  const recommendedPlan = getPlanByTier(recommendedTier);

  const defaultMessage = 
    generationsRemaining !== null && generationsRemaining <= 2
      ? `You have ${generationsRemaining} receipt${generationsRemaining === 1 ? '' : 's'} remaining today. Upgrade to generate unlimited receipts!`
      : 'Unlock unlimited receipt generations and premium features.';

  const handleUpgrade = () => {
    navigate('/subscription');
  };

  // Banner variant (top of page)
  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex items-center flex-1">
              <span className="flex p-2 rounded-lg bg-emerald-900">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <p className="ml-3 font-medium text-sm">
                {message || defaultMessage}
              </p>
            </div>
            <div className="flex-shrink-0 mt-2 sm:mt-0 sm:ml-3">
              <button
                onClick={handleUpgrade}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-emerald-600 bg-white hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modal variant
  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          {/* Close button */}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          {/* Content */}
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
            {title}
          </h3>
          
          <p className="text-gray-600 text-center mb-6">
            {message || defaultMessage}
          </p>

          {/* Plan info */}
          {recommendedPlan && (
            <div className="bg-emerald-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-gray-900">
                  {recommendedPlan.name}
                </span>
                <span className="text-2xl font-bold text-emerald-600">
                  {formatPrice(recommendedPlan.price)}
                  <span className="text-sm font-normal text-gray-600">/month</span>
                </span>
              </div>
              <ul className="space-y-2 mt-3">
                {recommendedPlan.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <svg className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Maybe Later
              </button>
            )}
            <button
              onClick={handleUpgrade}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-900 transition shadow-lg"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant (default)
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">
                {generationsRemaining !== null && (
                  <span className="font-semibold text-emerald-600">
                    {generationsRemaining} generations remaining today
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        <p className="text-gray-700 mb-6">
          {message || defaultMessage}
        </p>

        {/* Plan comparison */}
        {recommendedPlan && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Current Plan */}
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Current Plan</p>
              <p className="text-lg font-bold text-gray-900">Free</p>
              <p className="text-sm text-gray-600 mt-2">5 receipts/day</p>
            </div>

            {/* Recommended Plan */}
            <div className="border-2 border-emerald-600 rounded-lg p-4 bg-emerald-50">
              <p className="text-xs text-emerald-600 uppercase font-semibold mb-1">Recommended</p>
              <p className="text-lg font-bold text-gray-900">{recommendedPlan.name}</p>
              <p className="text-sm text-gray-600 mt-2">Unlimited receipts</p>
            </div>
          </div>
        )}

        {/* Action */}
        <button
          onClick={handleUpgrade}
          className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-900 transition shadow-lg"
        >
          View Plans & Upgrade
        </button>
      </div>
    </div>
  );
};