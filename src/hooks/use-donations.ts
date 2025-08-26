import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {apiClient} from '@/lib/api/api-client';
import {endpoints} from "@/lib/api/api-endpoints";

// Query keys
export const donationKeys = {
    all: ['donations'] as const,
    lists: () => [...donationKeys.all, 'list'] as const,
    list: (filters: string) => [...donationKeys.lists(), {filters}] as const,
    details: () => [...donationKeys.all, 'detail'] as const,
    detail: (id: string) => [...donationKeys.details(), id] as const,
    stats: () => [...donationKeys.all, 'stats'] as const,
};

// Hooks
export function useDonations(options: UseDonationsOptions = {}) {
    const {
        page = 1,
        limit = 10,
        search,
        enableSearch = true,
        status,
        bloodGroup,
        dateFrom,
        dateTo,
    } = options;

    return useQuery<PaginatedResponse<Donation>>({
        queryKey: donationKeys.list(JSON.stringify({
            page,
            limit,
            search: enableSearch ? search : undefined,
            status,
            dateFrom,
            dateTo,
            bloodGroup
        })),
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', limit.toString());

            if (enableSearch && search) {
                params.append('search', search);
            }

            // filter params
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

            const {data} = await apiClient.get<PaginatedResponse<Donation>>(
                `${endpoints.donations.list}?${params.toString()}`
            );
            return data;
        },
        staleTime: 0
    });
}

export function useDonation(id: string) {
    return useQuery({
        queryKey: ['donation', id],
        queryFn: async () => {
            const {data} = await apiClient.get<Donation>(endpoints.donations.get(id));
            return data;
        },
        enabled: !!id,
    });
}

export function useUpdateDonation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({id, status}: { id: string; status: string }) => {
            const {data} = await apiClient.patch<Donation>(endpoints.donations.update(id), {status});
            return data;
        },
        onSuccess: (data) => {
            // Update the cache
            queryClient.setQueryData(['donation', data.id], data);
            // Invalidate the list query to refetch
            queryClient.invalidateQueries({queryKey: ['donations']});
        },
    });
}

export function useDonationStats() {
    return useQuery({
        queryKey: donationKeys.stats(),
        queryFn: async () => {
            const {data} = await apiClient.get(endpoints.donations.stats);
            return data;
        },
    });
}

export function useExportDonations() {
    return useMutation({
        mutationFn: async (filters?: {
            status?: string;
            bloodType?: string;
            dateRange?: { from: string; to: string }
        }) => {
            const queryString = new URLSearchParams();
            if (filters?.status) queryString.append('status', filters.status);
            if (filters?.bloodType) queryString.append('bloodType', filters.bloodType);
            if (filters?.dateRange) {
                queryString.append('from', filters.dateRange.from);
                queryString.append('to', filters.dateRange.to);
            }

            const response = await apiClient.get(endpoints.donations.export + (queryString.toString() ? `?${queryString}` : ''), {
                responseType: 'blob',
            });

            // Create a download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `donations-export-${new Date().toISOString()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        },
    });
} 