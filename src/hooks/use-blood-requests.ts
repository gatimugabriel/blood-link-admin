import { useQuery, useMutation, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client';
import { endpoints } from '@/lib/api/api-endpoints';

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
export function useBloodRequests(options: UseBloodRequestsOptions = {}): UseQueryResult<PaginatedResponse<BloodRequest>> {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search,
    status,
    bloodType,
    urgency,
    enableSearch = false, // Default
  } = options;

  return useQuery({
    queryKey: bloodRequestKeys.list(JSON.stringify({ 
      page, 
      limit, 
      sortBy, 
      sortOrder, 
      ...(enableSearch ? { search } : {}),
      status, 
      bloodType, 
      urgency 
    })),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // pagination + sorting params
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      // filter params
      if (enableSearch && search) params.append('search', search);
      if (status) params.append('status', status);
      if (bloodType) params.append('bloodType', bloodType);
      if (urgency) params.append('urgency', urgency);

      const { data } = await apiClient.get<PaginatedResponse<BloodRequest>>(
        `${endpoints.bloodRequests.list}?${params.toString()}`
      );
      return data;
    },
    staleTime: 0,
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
    mutationFn: async (options: UseBloodRequestsOptions = {}) => {
      const params = new URLSearchParams();
      
      // Add pagination and sorting params
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);

      // Add filter params if they exist
      if (options.search) params.append('search', options.search);
      if (options.status) params.append('status', options.status);
      if (options.bloodType) params.append('bloodType', options.bloodType);
      if (options.urgency) params.append('urgency', options.urgency);

      const response = await apiClient.get(
        `${endpoints.bloodRequests.export}?${params.toString()}`,
        { responseType: 'blob' }
      );
      return response.data;
    },
  });
}

export function useDeleteBloodRequest() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(endpoints.bloodRequests.delete(id));
      return data;
    },
  });
} 