import { useSubscription } from './useSubscription';
import { SubscriptionTier } from '../types';

/**
 * Hook to check if user has access to a feature based on subscription tier
 * 
 * @example
 * ```tsx
 * const { requiresPremium, requiresOrg } = useSubscriptionCheck();
 * 
 * if (requiresPremium()) {
 *   return <UpgradePrompt />;
 * }
 * ```
 */
export const useSubscriptionCheck = () => {
  const { subscription, canGenerate, isPremium } = useSubscription();

  /**
   * Check if user can generate receipts
   */
  const canGenerateReceipt = (): boolean => {
    return canGenerate;
  };

  /**
   * Check if feature requires premium subscription
   */
  const requiresPremium = (): boolean => {
    return !isPremium;
  };

  /**
   * Check if feature requires organization subscription
   */
  const requiresOrg = (): boolean => {
    return subscription?.tier !== SubscriptionTier.PREMIUM_ORG;
  };

  /**
   * Check if user has at least a specific tier
   */
  const hasMinimumTier = (minimumTier: SubscriptionTier): boolean => {
    if (!subscription) return false;

    const tierHierarchy = {
      [SubscriptionTier.FREE]: 0,
      [SubscriptionTier.PREMIUM_SINGLE]: 1,
      [SubscriptionTier.PREMIUM_ORG]: 2,
    };

    return tierHierarchy[subscription.tier] >= tierHierarchy[minimumTier];
  };

  /**
   * Get user-friendly message about subscription requirement
   */
  const getUpgradeMessage = (requiredTier: SubscriptionTier): string => {
    switch (requiredTier) {
      case SubscriptionTier.PREMIUM_SINGLE:
        return 'This feature requires a Premium subscription.';
      case SubscriptionTier.PREMIUM_ORG:
        return 'This feature requires an Organization subscription.';
      default:
        return 'Upgrade your subscription to access this feature.';
    }
  };

  return {
    canGenerateReceipt,
    requiresPremium,
    requiresOrg,
    hasMinimumTier,
    getUpgradeMessage,
  };
};