import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserSubscription, SubscriptionUsage, SubscriptionTier, SubscriptionStatus } from '../types';
import { subscriptionService } from '@/services/SubscriptionService';
import { useAuthStore } from '@/store/auth.store';
import { 
  canGenerateReceipt, 
  getGenerationsRemaining, 
  isSubscriptionActive,
  shouldShowUpgradePrompt 
} from '../utils/subscriptionHelpers';
import { getResetTime } from '../utils/subscriptionHelpers';

interface SubscriptionContextType {
  // State
  subscription: UserSubscription | null;
  usage: SubscriptionUsage | null;
  loading: boolean;
  error: string | null;

  // Computed values
  isActive: boolean;
  isPremium: boolean;
  canGenerate: boolean;
  generationsRemaining: number | null;
  showUpgradePrompt: boolean;

  // Actions
  refreshSubscription: () => Promise<void>;
  refreshUsage: () => Promise<void>;
  trackGeneration: () => Promise<void>;
  upgradeSubscription: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  resumeSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider = ({ children }: SubscriptionProviderProps) => {
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed values
  const isActive = subscription ? isSubscriptionActive(subscription) : false;
  const isPremium = subscription ? subscription.tier !== SubscriptionTier.FREE : false;
  const canGenerate = subscription && usage ? canGenerateReceipt(subscription, usage) : false;
  const generationsRemaining = subscription && usage ? getGenerationsRemaining(subscription, usage) : null;
  const showUpgradePrompt = subscription && usage ? shouldShowUpgradePrompt(subscription, usage) : false;

  // Load subscription data when user logs in
  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    } else {
      // Reset state when user logs out
      setSubscription(null);
      setUsage(null);
      setLoading(false);
    }
  }, [user]);

  // Auto-refresh usage at midnight
  useEffect(() => {
    if (!subscription) return;

    const now = new Date();
    const midnight = getResetTime();
    const timeUntilMidnight = midnight.getTime() - now.getTime();

    const timer = setTimeout(() => {
      refreshUsage();
      // Set up daily refresh
      const dailyRefresh = setInterval(() => {
        refreshUsage();
      }, 24 * 60 * 60 * 1000); // 24 hours

      return () => clearInterval(dailyRefresh);
    }, timeUntilMidnight);

    return () => clearTimeout(timer);
  }, [subscription]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [subData, usageData] = await Promise.all([
        subscriptionService.getSubscription(),
        subscriptionService.getUsage(),
      ]);

      setSubscription(subData);
      setUsage(usageData);
    } catch (err: any) {
      console.error('Failed to load subscription data:', err);
      setError(err.message || 'Failed to load subscription');
      
      // Create default free subscription if none exists
      setSubscription({
        id: 'free-default',
        userId: user?.uid || '',
        tier: SubscriptionTier.FREE,
        status: SubscriptionStatus.ACTIVE,
        planId: 'free',
        startDate: new Date(),
        cancelAtPeriodEnd: false,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        receiptGenerationsToday: 0,
        lastGenerationDate: new Date(),
      });

      setUsage({
        receiptGenerationsToday: 0,
        receiptGenerationsThisMonth: 0,
        limit: 5,
        canGenerate: true,
        resetsAt: getResetTime(),
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = async () => {
    try {
      const subData = await subscriptionService.getSubscription();
      setSubscription(subData);
    } catch (err: any) {
      console.error('Failed to refresh subscription:', err);
      setError(err.message || 'Failed to refresh subscription');
    }
  };

  const refreshUsage = async () => {
    try {
      const usageData = await subscriptionService.getUsage();
      setUsage(usageData);
    } catch (err: any) {
      console.error('Failed to refresh usage:', err);
      setError(err.message || 'Failed to refresh usage');
    }
  };

  const trackGeneration = async () => {
    try {
      await subscriptionService.trackReceiptGeneration();
      
      // Update local usage count immediately
      if (usage) {
        setUsage({
          ...usage,
          receiptGenerationsToday: usage.receiptGenerationsToday + 1,
          receiptGenerationsThisMonth: usage.receiptGenerationsThisMonth + 1,
          canGenerate: usage.limit === null || (usage.receiptGenerationsToday + 1) < usage.limit,
        });
      }

      // Refresh from server to ensure accuracy
      await refreshUsage();
    } catch (err: any) {
      console.error('Failed to track generation:', err);
      throw err;
    }
  };

  const upgradeSubscription = async (planId: string) => {
    try {
      setLoading(true);
      const result = await subscriptionService.createSubscription(planId);
      
      // If there's a checkout URL, redirect to payment
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }

      // Otherwise, refresh subscription data
      await refreshSubscription();
    } catch (err: any) {
      console.error('Failed to upgrade subscription:', err);
      setError(err.message || 'Failed to upgrade subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      setLoading(true);
      const updated = await subscriptionService.cancelSubscription();
      setSubscription(updated);
    } catch (err: any) {
      console.error('Failed to cancel subscription:', err);
      setError(err.message || 'Failed to cancel subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resumeSubscription = async () => {
    try {
      setLoading(true);
      const updated = await subscriptionService.resumeSubscription();
      setSubscription(updated);
    } catch (err: any) {
      console.error('Failed to resume subscription:', err);
      setError(err.message || 'Failed to resume subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        usage,
        loading,
        error,
        isActive,
        isPremium,
        canGenerate,
        generationsRemaining,
        showUpgradePrompt,
        refreshSubscription,
        refreshUsage,
        trackGeneration,
        upgradeSubscription,
        cancelSubscription,
        resumeSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptionContext = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  return context;
};