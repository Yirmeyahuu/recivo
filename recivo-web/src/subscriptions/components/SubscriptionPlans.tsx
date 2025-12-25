import { useState } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { SUBSCRIPTION_PLANS, formatPrice } from '../utils/pricing';
import { SubscriptionTier } from '../types';

interface SubscriptionPlansProps {
  /** Show only specific tiers */
  tiers?: SubscriptionTier[];
  /** Callback when plan is selected */
  onSelectPlan?: (planId: string) => void;
  /** Show current plan badge */
  showCurrentBadge?: boolean;
}

export const SubscriptionPlans = ({
  tiers,
  onSelectPlan,
  showCurrentBadge = true,
}: SubscriptionPlansProps) => {
  const { subscription, upgrade, loading } = useSubscription();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Filter plans if specific tiers are requested
  const plans = tiers
    ? SUBSCRIPTION_PLANS.filter(plan => tiers.includes(plan.tier))
    : SUBSCRIPTION_PLANS;

  const handleSelectPlan = async (planId: string) => {
    if (loading) return;

    setSelectedPlanId(planId);

    if (onSelectPlan) {
      onSelectPlan(planId);
      return;
    }

    // Default behavior: upgrade subscription
    try {
      await upgrade(planId);
    } catch (error) {
      console.error('Failed to upgrade:', error);
      setSelectedPlanId(null);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return subscription?.planId === planId;
  };

  const isDowngrade = (tier: SubscriptionTier) => {
    if (!subscription) return false;

    const tierHierarchy = {
      [SubscriptionTier.FREE]: 0,
      [SubscriptionTier.PREMIUM_SINGLE]: 1,
      [SubscriptionTier.PREMIUM_ORG]: 2,
    };

    return tierHierarchy[tier] < tierHierarchy[subscription.tier];
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isCurrent = isCurrentPlan(plan.id);
            const isPopular = plan.tier === SubscriptionTier.PREMIUM_SINGLE;
            const isProcessing = selectedPlanId === plan.id && loading;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:scale-105 ${
                  isPopular
                    ? 'border-emerald-600 shadow-2xl shadow-emerald-200'
                    : 'border-gray-200'
                } ${isCurrent ? 'ring-4 ring-emerald-400' : ''}`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-5 left-0 right-0 flex justify-center">
                    <span className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrent && showCurrentBadge && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.price === 0 ? (
                      <div className="flex items-baseline">
                        <span className="text-5xl font-bold text-gray-900">Free</span>
                      </div>
                    ) : (
                      <div className="flex items-baseline">
                        <span className="text-5xl font-bold text-gray-900">
                          {formatPrice(plan.price).replace('.00', '')}
                        </span>
                        <span className="text-gray-600 ml-2">/ {plan.interval}</span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrent || isProcessing || loading}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      isCurrent
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : isPopular
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-800 text-white hover:from-emerald-700 hover:to-emerald-900 shadow-lg hover:shadow-xl'
                        : 'bg-white text-emerald-600 border-2 border-emerald-600 hover:bg-emerald-50'
                    } ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
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
                        Processing...
                      </span>
                    ) : isCurrent ? (
                      'Current Plan'
                    ) : isDowngrade(plan.tier) ? (
                      'Downgrade'
                    ) : plan.price === 0 ? (
                      'Get Started'
                    ) : (
                      'Upgrade Now'
                    )}
                  </button>

                  {/* Limits Info */}
                  {plan.limits.receiptGenerationsPerDay !== null && (
                    <p className="text-xs text-gray-500 text-center mt-4">
                      {plan.limits.receiptGenerationsPerDay} receipts per day
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            All plans include a 7-day money-back guarantee
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Secure Payment
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
              Cancel Anytime
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              24/7 Support
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};