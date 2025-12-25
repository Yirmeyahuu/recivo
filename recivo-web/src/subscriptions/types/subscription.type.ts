export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM_SINGLE = 'premium_single',
  PREMIUM_ORG = 'premium_org',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  TRIAL = 'trial',
}

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    receiptGenerationsPerDay: number | null; // null means unlimited
    maxUsers: number;
  };
}

export interface UserSubscription {
  id: string;
  userId: string;
  organizationId?: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  planId: string;
  startDate: Date;
  endDate?: Date;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: Date;
  
  // Usage tracking
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  receiptGenerationsToday: number;
  lastGenerationDate: Date;
  
  // Payment info (if using Stripe, RevenueCat, etc.)
  paymentProvider?: 'stripe' | 'revenuecat' | 'google_play' | 'app_store';
  externalSubscriptionId?: string;
}

export interface SubscriptionUsage {
  receiptGenerationsToday: number;
  receiptGenerationsThisMonth: number;
  limit: number | null;
  canGenerate: boolean;
  resetsAt: Date;
}