import { SubscriptionPlan, SubscriptionTier } from '../types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    tier: SubscriptionTier.FREE,
    name: 'Free',
    description: 'Perfect for trying out Recivo',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      '5 receipt generations per day',
      'Basic receipt templates',
      'Email support',
      'Mobile app access',
    ],
    limits: {
      receiptGenerationsPerDay: 5,
      maxUsers: 1,
    },
  },
  {
    id: 'premium_single',
    tier: SubscriptionTier.PREMIUM_SINGLE,
    name: 'Premium Single',
    description: 'Unlimited receipts for individuals',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited receipt generations',
      'All receipt templates',
      'Priority email support',
      'Mobile app access',
      'Cloud storage',
      'Export to PDF/CSV',
    ],
    limits: {
      receiptGenerationsPerDay: null, // unlimited
      maxUsers: 1,
    },
  },
  {
    id: 'premium_org',
    tier: SubscriptionTier.PREMIUM_ORG,
    name: 'Premium Organization',
    description: 'Perfect for teams',
    price: 29.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Everything in Premium Single',
      'Up to 5 team members',
      'Shared receipt templates',
      'Team collaboration',
      'Advanced analytics',
      'Priority support',
      'Admin dashboard',
    ],
    limits: {
      receiptGenerationsPerDay: null, // unlimited
      maxUsers: 5,
    },
  },
];

export const getPlanByTier = (tier: SubscriptionTier): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.tier === tier);
};

export const getPlanById = (planId: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
};

export const formatPrice = (price: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
};