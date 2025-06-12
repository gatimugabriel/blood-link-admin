'use client';

import { useState, useCallback, useMemo, useEffect } from "react";
import { useDonations, useUpdateDonation } from "@/hooks/use-donations";
import { DataTable } from "@/components/ui/data-table";
import { donationsTableColumns } from "@/app/(root)/donations/tableColumns";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useExportDonations } from "@/hooks/use-donations";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { FilterOption, FilterValue } from "@/components/ui/data-table-filters";
import { format } from "date-fns";

const donationFilters: FilterOption[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
    placeholder: 'Select status...',
  },
  {
    id: 'bloodType',
    label: 'Blood Type',
    type: 'select',
    options: [
      { value: 'A+', label: 'A+' },
      { value: 'A-', label: 'A-' },
      { value: 'B+', label: 'B+' },
      { value: 'B-', label: 'B-' },
      { value: 'AB+', label: 'AB+' },
      { value: 'AB-', label: 'AB-' },
      { value: 'O+', label: 'O+' },
      { value: 'O-', label: 'O-' },
    ],
    placeholder: 'Select blood type...',
  },
  {
    id: 'dateRange',
    label: 'Date Range',
    type: 'date-range',
    placeholder: 'Select date range...',
  },
];

export function DonationsClient() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isServerSearch, setIsServerSearch] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValue[]>([]);

  const getApiFilters = useCallback(() => {
    const filters: any = {};
    
    filterValues.forEach(filter => {
      if (filter.id === 'dateRange' && typeof filter.value === 'object') {
        const dateRange = filter.value as { from?: Date; to?: Date };
        if (dateRange.from) {
          filters.dateFrom = format(dateRange.from, 'yyyy-MM-dd');
        }
        if (dateRange.to) {
          filters.dateTo = format(dateRange.to, 'yyyy-MM-dd');
        }
      } else {
        filters[filter.id] = filter.value;
      }
    });
    
    return filters;
  }, [filterValues]);

  // all data without search
  const { data: allData, isLoading: isLoadingAll, error: allError, refetch: refetchAll } = useDonations({
    page,
    limit,
    ...getApiFilters(),
  });

  console.log(allData)

  // server search results
  const { data: searchData, isLoading: isLoadingSearch, error: searchError, refetch: refetchSearch } = useDonations({
    page,
    limit,
    search: isServerSearch ? debouncedSearchQuery : undefined,
    ...getApiFilters(),
  });

  const updateMutation = useUpdateDonation();
  const exportMutation = useExportDonations();

  const isLoading = isServerSearch ? isLoadingSearch : isLoadingAll;
  const error = isServerSearch ? searchError : allError;
  const refetch = isServerSearch ? refetchSearch : refetchAll;

  // state data search
  const filteredData = useMemo(() => {
    if (!allData?.data || !debouncedSearchQuery || isServerSearch) {
      return isServerSearch ? searchData : allData;
    }

    // state data filtering
    const searchLower = debouncedSearchQuery.toLowerCase();
    const filtered = allData.data.filter((item) => 
      item.donor?.firstName?.toLowerCase().includes(searchLower) ||
      item.donor?.lastName?.toLowerCase().includes(searchLower) ||
      item.donor?.email?.toLowerCase().includes(searchLower) ||
      item.status?.toLowerCase().includes(searchLower)
    );

    // trigger server search
    if (filtered.length === 0 && debouncedSearchQuery.trim() !== '') {
      setIsServerSearch(true);

      return {
        ...allData,
        data: [],
        pagination: {
          ...allData.pagination,
          total: 0,
        },
      };
    }

    // filtered client data
    return {
      ...allData,
      data: filtered,
      pagination: {
        ...allData.pagination,
        total: filtered.length,
      },
    };
  }, [allData, searchData, debouncedSearchQuery, isServerSearch]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    setIsServerSearch(false);
  }, []);

  const handlePageSizeChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    setIsServerSearch(false);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
    setIsServerSearch(false);
  }, []);

  const handleFiltersChange = useCallback((filters: FilterValue[]) => {
    setFilterValues(filters);
    setPage(1);
    setIsServerSearch(false);
  }, []);

  const handleFiltersReset = useCallback(() => {
    setFilterValues([]);
    setPage(1);
    setIsServerSearch(false);
  }, []);

  // refetch when isServerSearch / when debouncedSearchQuery changes
  useEffect(() => {
    if (isServerSearch && debouncedSearchQuery) {
      refetchSearch();
    }
  }, [isServerSearch, debouncedSearchQuery, refetchSearch]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setIsServerSearch(false);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync({
        search: searchQuery || undefined,
        ...getApiFilters(),
      });
      toast.success("Donations exported successfully");
    } catch (error) {
      toast.error("Failed to export donations");
    }
  };

  const handleStatusUpdate = useCallback(async (id: string, status: string) => {
    try {
      await updateMutation.mutateAsync({ id, status });
      toast.success("Donation status updated successfully");
      refetch();
      setIsServerSearch(false);
    } catch (error) {
      toast.error("Failed to update donation status");
    }
  }, [updateMutation, refetch]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Donations</h1>
        <Button 
          onClick={handleExport} 
          variant="outline"
          disabled={isLoading || isRefreshing}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <DataTable
        columns={donationsTableColumns}
        data={filteredData?.data ?? []}
        filterBy="donor name"
        tableName="donations"
        isLoading={isLoading || isRefreshing}
        error={error}
        pagination={{
          currentPage: page,
          totalPages: filteredData ? Math.ceil(filteredData.pagination.total / limit) : 0,
          totalItems: filteredData?.pagination.total ?? 0,
          pageSize: limit,
        }}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRefresh={handleRefresh}
        onSearch={handleSearch}
        onStatusUpdate={handleStatusUpdate}
        filters={donationFilters}
        filterValues={filterValues}
        onFiltersChange={handleFiltersChange}
        onFiltersReset={handleFiltersReset}
      />
      <Toaster />
    </div>
  );
} 