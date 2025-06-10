import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
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

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UseBloodRequestsOptions {
  page?: number;
  limit?: number;
  search?: string;
  enableSearch?: boolean;
  status?: 'open' | 'closed' | 'fulfilled';
  dateFrom?: string;
  dateTo?: string;
  bloodGroup?: string;
  urgency?: 'low' | 'medium' | 'high';
}

// -------- Hooks -------- //
export function useBloodRequests(options: UseBloodRequestsOptions = {}): UseQueryResult<PaginatedResponse<BloodRequest>> {
  const {
    page = 1,
    limit = 10,
    search,
    enableSearch = true,
    status,
    dateFrom,
    dateTo,
    bloodGroup,
    urgency,
  } = options;

  return useQuery({
    queryKey: bloodRequestKeys.list(JSON.stringify({
      page,
      limit,
      search: enableSearch ? search : undefined,
      status,
      dateFrom,
      dateTo,
      bloodGroup,
      urgency,
    })),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (enableSearch && search) {
        params.append('search', search);
      }
      
      // Add filter parameters
      if (status) {
        params.append('status', status);
      }
      if (dateFrom) {
        params.append('dateFrom', dateFrom);
      }
      if (dateTo) {
        params.append('dateTo', dateTo);
      }
      if (bloodGroup) {
        params.append('bloodGroup', bloodGroup);
      }
      if (urgency) {
        params.append('urgency', urgency);
      }

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
      
      if (options.search) {
        params.append('search', options.search);
      }
      if (options.status) {
        params.append('status', options.status);
      }
      if (options.dateFrom) {
        params.append('dateFrom', options.dateFrom);
      }
      if (options.dateTo) {
        params.append('dateTo', options.dateTo);
      }
      if (options.bloodGroup) {
        params.append('bloodGroup', options.bloodGroup);
      }
      if (options.urgency) {
        params.append('urgency', options.urgency);
      }

      const response = await apiClient.get(
        `${endpoints.bloodRequests.export}?${params.toString()}`,
        { responseType: 'blob' }
      );
      return response.data;
    },
  });
}

export function useDeleteBloodRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(endpoints.bloodRequests.delete(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bloodRequestKeys.lists() });
    },
  });
} 