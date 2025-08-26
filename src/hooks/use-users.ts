import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client';
import { endpoints } from '@/lib/api/api-endpoints';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  range: () => [...userKeys.all, 'range'] as const,
};

// Hooks
export function useUsers(filters?: { 
  page?: number; 
  limit?: number;
  bloodType?: string; 
  bloodGroup?: string;
  role?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string; 
}): UseQueryResult<PaginatedResponse<User>> {
  const queryString = new URLSearchParams();
  if (filters?.page) queryString.append('page', filters.page.toString());
  if (filters?.limit) queryString.append('limit', filters.limit.toString());
  if (filters?.bloodType) queryString.append('bloodType', filters.bloodType);
  if (filters?.bloodGroup) queryString.append('bloodGroup', filters.bloodGroup);
  if (filters?.role) queryString.append('role', filters.role);
  if (filters?.status) queryString.append('status', filters.status);
  if (filters?.startDate) queryString.append('startDate', filters.startDate);
  if (filters?.endDate) queryString.append('endDate', filters.endDate);
  if (filters?.search) queryString.append('search', filters.search);

  return useQuery({
    queryKey: userKeys.list(queryString.toString()),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<User>>(endpoints.users.list + (queryString.toString() ? `?${queryString}` : ''));
      return data;
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<User>(endpoints.users.detail(id));
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string; [key: string]: any }) => {
      const { data } = await apiClient.patch<User>(endpoints.users.update(id), updateData);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useExportUsers() {
  return useMutation({
    mutationFn: async (filters?: { 
      search?: string;
      bloodGroup?: string;
      role?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    }) => {
      const queryString = new URLSearchParams();
      if (filters?.search) queryString.append('search', filters.search);
      if (filters?.bloodGroup) queryString.append('bloodGroup', filters.bloodGroup);
      if (filters?.role) queryString.append('role', filters.role);
      if (filters?.status) queryString.append('status', filters.status);
      if (filters?.startDate) queryString.append('startDate', filters.startDate);
      if (filters?.endDate) queryString.append('endDate', filters.endDate);

      const { data } = await apiClient.get(endpoints.users.export + (queryString.toString() ? `?${queryString}` : ''), {
        responseType: 'blob',
      });
      return data;
    },
  });
}

export function useUsersInRange(coords: { lat: number; lng: number }, radius: number) {
  return useQuery({
    queryKey: userKeys.range(),
    queryFn: async () => {
      const { data } = await apiClient.post<User[]>(endpoints.users.getInRange, {
        lat: coords.lat,
        lng: coords.lng,
        radius,
      });
      return data;
    },
    enabled: !!coords.lat && !!coords.lng && !!radius,
  });
} 