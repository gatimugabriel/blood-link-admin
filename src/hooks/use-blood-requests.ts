import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client';
import {endpoints } from '@/lib/api/api-endpoints';

// Query keys
export const bloodRequestKeys = {
  all: ['blood-requests'] as const,
  lists: () => [...bloodRequestKeys.all, 'list'] as const,
  list: (filters: string) => [...bloodRequestKeys.lists(), { filters }] as const,
  details: () => [...bloodRequestKeys.all, 'detail'] as const,
  detail: (id: string) => [...bloodRequestKeys.details(), id] as const,
  stats: () => [...bloodRequestKeys.all, 'stats'] as const,
};

// -------- Hooks -------- //
export function useBloodRequests(options: UseBloodRequestsOptions = {}) {
  const {
    status,
    bloodType,
    urgency,
    dateRange,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;

  return useQuery<PaginatedResponse<BloodRequest>>({
    queryKey: ['blood-requests', { status, bloodType, urgency, dateRange, page, limit, sortBy, sortOrder }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (bloodType) params.append('bloodType', bloodType);
      if (urgency) params.append('urgency', urgency);
      if (dateRange) {
        params.append('from', dateRange.from);
        params.append('to', dateRange.to);
      }
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const {data} = await apiClient.get<PaginatedResponse<BloodRequest>>(
        `${endpoints.bloodRequests.list}?${params.toString()}`
      );
      return data;
    },
  });
}

export function useBloodRequest(id: string) {
  return useQuery({
    queryKey: ['blood-request', id],
    queryFn: async () => {
      const { data } = await apiClient.get<BloodRequest>(endpoints.bloodRequests.get(id));
      return data;
    },
    enabled: !!id,
  });
}

export function useBloodRequestStats() {
  return useQuery({
    queryKey: ['blood-requests', 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get(endpoints.bloodRequests.stats);
      return data;
    },
  });
}

export function useExportBloodRequests() {
  return useMutation({
    mutationFn: async (filters?: { 
      status?: string; 
      bloodType?: string; 
      urgency?: string;
      dateRange?: { from: string; to: string } 
    }) => {
      const queryString = new URLSearchParams();
      if (filters?.status) queryString.append('status', filters.status);
      if (filters?.bloodType) queryString.append('bloodType', filters.bloodType);
      if (filters?.urgency) queryString.append('urgency', filters.urgency);
      if (filters?.dateRange) {
        queryString.append('from', filters.dateRange.from);
        queryString.append('to', filters.dateRange.to);
      }

      const response = await apiClient.get(endpoints.bloodRequests.export + (queryString.toString() ? `?${queryString}` : ''), {
        responseType: 'blob',
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `blood-requests-export-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
} 