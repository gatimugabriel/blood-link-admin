import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client';

export interface DashboardStats {
  totalUsers: number;
  totalDonationRequests: number;
  totalDonations: number;
  activeRequests: number;
  completedDonations: number;
  successRate: number;
}

export interface BloodTypeReport {
  bloodType: string;
  requestCount: number;
  donationCount: number;
  fulfillmentRate: number;
}

export interface UrgencyReport {
  urgency: string;
  total: number;
  fulfilled: number;
  fulfillmentRate: number;
}

export interface TrendData {
  period: string;
  requests: number;
  donations: number;
  newUsers: number;
}

export function useReportsDashboard() {
  return useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardStats>('/reports/dashboard');
      return data;
    },
  });
}

export function useBloodTypeReports() {
  return useQuery({
    queryKey: ['reports', 'blood-types'],
    queryFn: async () => {
      const { data } = await apiClient.get<BloodTypeReport[]>('/reports/blood-types');
      return data;
    },
  });
}

export function useUrgencyReports() {
  return useQuery({
    queryKey: ['reports', 'urgency'],
    queryFn: async () => {
      const { data } = await apiClient.get<UrgencyReport[]>('/reports/urgency');
      return data;
    },
  });
}

export function useTrendReports(days: number = 30) {
  return useQuery({
    queryKey: ['reports', 'trends', days],
    queryFn: async () => {
      const { data } = await apiClient.get<TrendData[]>(`/reports/trends?days=${days}`);
      return data;
    },
  });
}

export function useExportReports() {
  return useMutation({
    mutationFn: async ({ format = 'csv', type = 'donations', days = 30 }: {
      format?: 'csv' | 'json';
      type?: 'blood-types' | 'urgency' | 'trends' | 'donations';
      days?: number;
    }) => {
      const params = new URLSearchParams();
      params.append('format', format);
      params.append('type', type);
      if (type === 'trends') {
        params.append('days', days.toString());
      }

      const response = await apiClient.get(`/reports/export?${params.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    },
  });
}