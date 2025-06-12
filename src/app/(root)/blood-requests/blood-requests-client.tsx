'use client';

import { useState, useCallback, useMemo, useEffect } from "react";
import { useBloodRequests, useDeleteBloodRequest } from "@/hooks/use-blood-requests";
import { DataTable } from "@/components/ui/data-table";
import { donationRequestsTableColumns } from "@/app/(root)/blood-requests/tableColumns";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useExportBloodRequests } from "@/hooks/use-blood-requests";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { FilterOption, FilterValue } from "@/components/ui/data-table-filters";
import { format } from "date-fns";

const bloodRequestFilters: FilterOption[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'open', label: 'Open' },
      { value: 'closed', label: 'Closed' },
      { value: 'fulfilled', label: 'Fulfilled' },
    ],
    placeholder: 'Select status...',
  },
  {
    id: 'bloodGroup',
    label: 'Blood Group',
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
    placeholder: 'Select blood group...',
  },
  {
    id: 'urgency',
    label: 'Urgency',
    type: 'select',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
    ],
    placeholder: 'Select urgency...',
  },
  {
    id: 'dateRange',
    label: 'Date Range',
    type: 'date-range',
    placeholder: 'Select date range...',
  },
];

export function BloodRequestsClient() {
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
  const { data: allData, isLoading: isLoadingAll, error: allError, refetch: refetchAll } = useBloodRequests({
    page,
    limit,
    ...getApiFilters(),
  });

  // server search results
  const { data: searchData, isLoading: isLoadingSearch, error: searchError, refetch: refetchSearch } = useBloodRequests({
    page,
    limit,
    search: isServerSearch ? debouncedSearchQuery : undefined,
    enableSearch: isServerSearch,
    ...getApiFilters(),
  });

  const deleteMutation = useDeleteBloodRequest();
  const exportMutation = useExportBloodRequests();

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
      item?.patientName?.toLowerCase().includes(searchLower) ||
      item?.healthFacility?.toLowerCase().includes(searchLower) ||
      item?.bloodGroup?.toLowerCase().includes(searchLower)
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

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Blood request deleted successfully");
      refetch();
      setIsServerSearch(false);

      // @ts-ignore - incoming error,from API, has a 'message' field
    } catch (error: Error) {
      toast.error("Failed to delete blood request", {
        description: error?.message || "internal server error occurred",
      });
    }
  }, [deleteMutation, refetch]);

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync({
        search: searchQuery || undefined,
        ...getApiFilters(),
      });

      // download link
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `blood-requests-export-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to export blood requests");
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Blood Requests</h1>
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
        columns={donationRequestsTableColumns}
        data={filteredData?.data ?? []}
        filterBy="patient name or health facility"
        tableName="blood-requests"
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
        onDelete={handleDelete}
        filters={bloodRequestFilters}
        filterValues={filterValues}
        onFiltersChange={handleFiltersChange}
        onFiltersReset={handleFiltersReset}
      />
      <Toaster />
    </div>
  );
} 
