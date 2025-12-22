import apiClient from '@/lib/axios';

export const apiService = {
  // Auth endpoints
  auth: {
    getCurrentUser: () => apiClient.get('/auth/me'),
    verifyToken: () => apiClient.get('/auth/verify'),
  },

  // Add more API endpoints here as you build features
  receipts: {
    getAll: () => apiClient.get('/receipts'),
    getById: (id: string) => apiClient.get(`/receipts/${id}`),
    create: (data: any) => apiClient.post('/receipts', data),
    update: (id: string, data: any) => apiClient.put(`/receipts/${id}`, data),
    delete: (id: string) => apiClient.delete(`/receipts/${id}`),
  },
};