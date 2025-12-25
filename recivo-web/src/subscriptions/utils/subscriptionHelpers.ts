import { UserSubscription, SubscriptionStatus, SubscriptionTier, SubscriptionUsage } from '../types';
import { getPlanByTier } from './pricing';

export const isSubscriptionActive = (subscription: UserSubscription): boolean => {
  return subscription.status === SubscriptionStatus.ACTIVE || 
         subscription.status === SubscriptionStatus.TRIAL;
};

export const canGenerateReceipt = (subscription: UserSubscription, usage: SubscriptionUsage): boolean => {
  // Premium users have unlimited generations
  if (subscription.tier !== SubscriptionTier.FREE) {
    return true;
  }
  
  // Free users are limited
  const plan = getPlanByTier(subscription.tier);
  if (!plan) return false;
  
  const limit = plan.limits.receiptGenerationsPerDay;
  if (limit === null) return true; // unlimited
  
  return usage.receiptGenerationsToday < limit;
};

export const getGenerationsRemaining = (subscription: UserSubscription, usage: SubscriptionUsage): number | null => {
  const plan = getPlanByTier(subscription.tier);
  if (!plan) return 0;
  
  const limit = plan.limits.receiptGenerationsPerDay;
  if (limit === null) return null; // unlimited
  
  return Math.max(0, limit - usage.receiptGenerationsToday);
};

export const isTrialExpired = (subscription: UserSubscription): boolean => {
  if (!subscription.trialEndsAt) return false;
  return new Date() > subscription.trialEndsAt;
};

export const getDaysUntilRenewal = (subscription: UserSubscription): number => {
  const now = new Date();
  const endDate = subscription.currentPeriodEnd;
  const diffTime = endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const shouldShowUpgradePrompt = (subscription: UserSubscription, usage: SubscriptionUsage): boolean => {
  if (subscription.tier !== SubscriptionTier.FREE) return false;
  
  const remaining = getGenerationsRemaining(subscription, usage);
  if (remaining === null) return false;
  
  // Show prompt when user has 2 or fewer generations left
  return remaining <= 2;
};

export const getResetTime = (): Date => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};