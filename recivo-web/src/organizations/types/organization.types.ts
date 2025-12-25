export enum OrganizationRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  subscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Limits based on subscription
  maxMembers: number;
  currentMembers: number;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  email: string;
  displayName?: string;
  role: OrganizationRole;
  joinedAt: Date;
  invitedBy: string;
}

export interface OrganizationInvite {
  id: string;
  organizationId: string;
  email: string;
  role: OrganizationRole;
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired';
}