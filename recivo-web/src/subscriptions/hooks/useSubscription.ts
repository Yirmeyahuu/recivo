import { useSubscriptionContext } from '../context/SubscriptionContext';

/**
 * Hook to easily access subscription data and actions
 * 
 * @example
 * ```tsx
 * const { isPremium, canGenerate, trackGeneration } = useSubscription();
 * 
 * if (!canGenerate) {
 *   return <UpgradePrompt />;
 * }
 * 
 * await trackGeneration();
 * ```
 */
export const useSubscription = () => {
  const context = useSubscriptionContext();
  
  return {
    // State
    subscription: context.subscription,
    usage: context.usage,
    loading: context.loading,
    error: context.error,
    
    // Computed values
    isActive: context.isActive,
    isPremium: context.isPremium,
    isFree: context.subscription?.tier === 'free',
    canGenerate: context.canGenerate,
    generationsRemaining: context.generationsRemaining,
    showUpgradePrompt: context.showUpgradePrompt,
    
    // Current tier info
    tier: context.subscription?.tier,
    status: context.subscription?.status,
    
    // Actions
    refresh: context.refreshSubscription,
    refreshUsage: context.refreshUsage,
    trackGeneration: context.trackGeneration,
    upgrade: context.upgradeSubscription,
    cancel: context.cancelSubscription,
    resume: context.resumeSubscription,
  };
};