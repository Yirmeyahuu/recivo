import { 
  Organization, 
  OrganizationMember, 
  OrganizationInvite,
  OrganizationRole 
} from '@/organizations/types/organization.types';
import apiClient from '@/lib/axios';

export const organizationService = {
  /**
   * Create a new organization
   */
  async createOrganization(name: string): Promise<Organization> {
    const response = await apiClient.post('/organizations', { name });
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  },

  /**
   * Get user's organizations
   */
  async getMyOrganizations(): Promise<Organization[]> {
    const response = await apiClient.get('/organizations/me');
    return response.data.map((org: any) => ({
      ...org,
      createdAt: new Date(org.createdAt),
      updatedAt: new Date(org.updatedAt),
    }));
  },

  /**
   * Get organization by ID
   */
  async getOrganization(organizationId: string): Promise<Organization> {
    const response = await apiClient.get(`/organizations/${organizationId}`);
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  },

  /**
   * Update organization
   */
  async updateOrganization(organizationId: string, data: { name?: string }): Promise<Organization> {
    const response = await apiClient.put(`/organizations/${organizationId}`, data);
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  },

  /**
   * Delete organization
   */
  async deleteOrganization(organizationId: string): Promise<void> {
    await apiClient.delete(`/organizations/${organizationId}`);
  },

  /**
   * Get organization members
   */
  async getMembers(organizationId: string): Promise<OrganizationMember[]> {
    const response = await apiClient.get(`/organizations/${organizationId}/members`);
    return response.data.map((member: any) => ({
      ...member,
      joinedAt: new Date(member.joinedAt),
    }));
  },

  /**
   * Invite member to organization
   */
  async inviteMember(organizationId: string, email: string, role: OrganizationRole): Promise<OrganizationInvite> {
    const response = await apiClient.post(`/organizations/${organizationId}/invite`, {
      email,
      role,
    });
    return {
      ...response.data,
      invitedAt: new Date(response.data.invitedAt),
      expiresAt: new Date(response.data.expiresAt),
    };
  },

  /**
   * Accept organization invite
   */
  async acceptInvite(inviteId: string): Promise<OrganizationMember> {
    const response = await apiClient.post(`/organizations/invites/${inviteId}/accept`);
    return {
      ...response.data,
      joinedAt: new Date(response.data.joinedAt),
    };
  },

  /**
   * Remove member from organization
   */
  async removeMember(organizationId: string, memberId: string): Promise<void> {
    await apiClient.delete(`/organizations/${organizationId}/members/${memberId}`);
  },

  /**
   * Update member role
   */
  async updateMemberRole(organizationId: string, memberId: string, role: OrganizationRole): Promise<OrganizationMember> {
    const response = await apiClient.put(`/organizations/${organizationId}/members/${memberId}`, {
      role,
    });
    return {
      ...response.data,
      joinedAt: new Date(response.data.joinedAt),
    };
  },

  /**
   * Leave organization
   */
  async leaveOrganization(organizationId: string): Promise<void> {
    await apiClient.post(`/organizations/${organizationId}/leave`);
  },

  /**
   * Get pending invites
   */
  async getMyInvites(): Promise<OrganizationInvite[]> {
    const response = await apiClient.get('/organizations/invites/me');
    return response.data.map((invite: any) => ({
      ...invite,
      invitedAt: new Date(invite.invitedAt),
      expiresAt: new Date(invite.expiresAt),
    }));
  },
};