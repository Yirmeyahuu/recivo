import { 
  UserSubscription, 
  SubscriptionUsage, 
  SubscriptionTier, 
  SubscriptionPlan 
} from '@/subscriptions/types';
import apiClient from '@/lib/axios';

export const subscriptionService = {
  /**
   * Get current user's subscription
   */
  async getSubscription(): Promise<UserSubscription> {
    const response = await apiClient.get('/subscriptions/me');
    return {
      ...response.data,
      startDate: new Date(response.data.startDate),
      endDate: response.data.endDate ? new Date(response.data.endDate) : undefined,
      currentPeriodStart: new Date(response.data.currentPeriodStart),
      currentPeriodEnd: new Date(response.data.currentPeriodEnd),
      lastGenerationDate: new Date(response.data.lastGenerationDate),
      trialEndsAt: response.data.trialEndsAt ? new Date(response.data.trialEndsAt) : undefined,
    };
  },

  /**
   * Get subscription usage stats
   */
  async getUsage(): Promise<SubscriptionUsage> {
    const response = await apiClient.get('/subscriptions/usage');
    return {
      ...response.data,
      resetsAt: new Date(response.data.resetsAt),
    };
  },

  /**
   * Track receipt generation (increment usage counter)
   */
  async trackReceiptGeneration(): Promise<void> {
    await apiClient.post('/subscriptions/track-generation');
  },

  /**
   * Create a new subscription (upgrade from free)
   */
  async createSubscription(planId: string): Promise<{ 
    subscriptionId: string;
    clientSecret?: string; // For Stripe payment
    checkoutUrl?: string; // For redirect-based payment
  }> {
    const response = await apiClient.post('/subscriptions/create', { planId });
    return response.data;
  },

  /**
   * Update subscription (change plan)
   */
  async updateSubscription(newPlanId: string): Promise<UserSubscription> {
    const response = await apiClient.put('/subscriptions/update', { planId: newPlanId });
    return {
      ...response.data,
      startDate: new Date(response.data.startDate),
      endDate: response.data.endDate ? new Date(response.data.endDate) : undefined,
      currentPeriodStart: new Date(response.data.currentPeriodStart),
      currentPeriodEnd: new Date(response.data.currentPeriodEnd),
      lastGenerationDate: new Date(response.data.lastGenerationDate),
      trialEndsAt: response.data.trialEndsAt ? new Date(response.data.trialEndsAt) : undefined,
    };
  },

  /**
   * Cancel subscription (cancel at period end)
   */
  async cancelSubscription(): Promise<UserSubscription> {
    const response = await apiClient.post('/subscriptions/cancel');
    return {
      ...response.data,
      startDate: new Date(response.data.startDate),
      endDate: response.data.endDate ? new Date(response.data.endDate) : undefined,
      currentPeriodStart: new Date(response.data.currentPeriodStart),
      currentPeriodEnd: new Date(response.data.currentPeriodEnd),
      lastGenerationDate: new Date(response.data.lastGenerationDate),
      trialEndsAt: response.data.trialEndsAt ? new Date(response.data.trialEndsAt) : undefined,
    };
  },

  /**
   * Resume canceled subscription
   */
  async resumeSubscription(): Promise<UserSubscription> {
    const response = await apiClient.post('/subscriptions/resume');
    return {
      ...response.data,
      startDate: new Date(response.data.startDate),
      endDate: response.data.endDate ? new Date(response.data.endDate) : undefined,
      currentPeriodStart: new Date(response.data.currentPeriodStart),
      currentPeriodEnd: new Date(response.data.currentPeriodEnd),
      lastGenerationDate: new Date(response.data.lastGenerationDate),
      trialEndsAt: response.data.trialEndsAt ? new Date(response.data.trialEndsAt) : undefined,
    };
  },

  /**
   * Get billing portal URL (for Stripe)
   */
  async getBillingPortalUrl(): Promise<string> {
    const response = await apiClient.get('/subscriptions/billing-portal');
    return response.data.url;
  },

  /**
   * Verify in-app purchase (for mobile)
   */
  async verifyPurchase(receipt: string, platform: 'ios' | 'android'): Promise<UserSubscription> {
    const response = await apiClient.post('/subscriptions/verify-purchase', {
      receipt,
      platform,
    });
    return {
      ...response.data,
      startDate: new Date(response.data.startDate),
      endDate: response.data.endDate ? new Date(response.data.endDate) : undefined,
      currentPeriodStart: new Date(response.data.currentPeriodStart),
      currentPeriodEnd: new Date(response.data.currentPeriodEnd),
      lastGenerationDate: new Date(response.data.lastGenerationDate),
      trialEndsAt: response.data.trialEndsAt ? new Date(response.data.trialEndsAt) : undefined,
    };
  },

  /**
   * Get available subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get('/subscriptions/plans');
    return response.data;
  },
};