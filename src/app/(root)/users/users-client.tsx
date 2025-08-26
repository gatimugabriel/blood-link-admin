"use client"

import { useState, useCallback, useMemo, useEffect } from "react";
import { useUsers } from "@/hooks/use-users";
import { useUpdateUser } from "@/hooks/use-users";
import { DataTable } from "@/components/ui/data-table";
import { usersTableColumns } from "./tableColumns";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useExportUsers } from "@/hooks/use-users";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { FilterOption } from "@/components/ui/data-table-filters";

// Filter options for users
const filterOptions: FilterOption[] = [
  {
    id: "role",
    label: "Role",
    type: "select",
    options: [
      { value: "admin", label: "Admin" },
      { value: "user", label: "User" },
      { value: "donor", label: "Donor" },
      { value: "recipient", label: "Recipient" },
    ],
  },
  {
    id: "bloodGroup",
    label: "Blood Type",
    type: "select",
    options: [
      { value: "A+", label: "A+" },
      { value: "A-", label: "A-" },
      { value: "B+", label: "B+" },
      { value: "B-", label: "B-" },
      { value: "AB+", label: "AB+" },
      { value: "AB-", label: "AB-" },
      { value: "O+", label: "O+" },
      { value: "O-", label: "O-" },
    ],
  },
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "suspended", label: "Suspended" },
    ],
  },
  {
    id: "dateRange",
    label: "Registration Date",
    type: "date-range",
  },
];

export function UsersClient() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [useServerSearch, setUseServerSearch] = useState(false);
  const [clientSearchNoResults, setClientSearchNoResults] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Create API filters
  const apiFilters = useMemo(() => {
    const filters: Record<string, any> = {};

    if (filterValues.role) filters.role = filterValues.role;
    if (filterValues.bloodGroup) filters.bloodGroup = filterValues.bloodGroup;
    if (filterValues.status) filters.status = filterValues.status;
    if (filterValues.dateRange?.from) filters.startDate = filterValues.dateRange.from;
    if (filterValues.dateRange?.to) filters.endDate = filterValues.dateRange.to;

    return filters;
  }, [filterValues]);

  // Fetch all users data
  const {
    data: allUsersData,
    isLoading: isLoadingAll,
    error: allUsersError,
    refetch: refetchAllUsers,
  } = useUsers({
    page: 1,
    limit: 100,
    ...apiFilters,
  });

  // server search
  const {
    data: serverSearchData,
    isLoading: isLoadingServer,
    error: serverSearchError,
    refetch: refetchServerSearch,
  } = useUsers({
    page: currentPage,
    limit: pageSize,
    search: useServerSearch ? debouncedSearchQuery.toString() : "",
    ...apiFilters,
  });

  const updateUserMutation = useUpdateUser();
  const exportUsersMutation = useExportUsers();

  const data = useServerSearch ? serverSearchData : allUsersData;
  const isLoading = useServerSearch ? isLoadingServer : isLoadingAll;
  const error = useServerSearch ? serverSearchError : allUsersError;

  // Client-side filtering
  const filteredData = useMemo(() => {
    if (!allUsersData?.data || useServerSearch) {
      return serverSearchData || { data: [], total: 0 };
    }

    let filtered = allUsersData.data;

    // Apply search filter
    if (debouncedSearchQuery) {
      const searchLower = debouncedSearchQuery.toString().toLowerCase();
      filtered = filtered.filter((user) =>
        (user.firstName ? user.firstName.toLowerCase() : "").includes(searchLower) ||
        (user.lastName ? user.lastName.toLowerCase() : "").includes(searchLower) ||
        (user.email ? user.email.toLowerCase() : "").includes(searchLower) ||
        user.phone?.toLowerCase().includes(searchLower) ||
        user.bloodGroup?.toLowerCase().includes(searchLower)
      );
    }

    if (debouncedSearchQuery && filtered.length === 0) {
      setClientSearchNoResults(true);
    } else {
      setClientSearchNoResults(false);
    }

    // pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: filtered.length,
    };
  }, [allUsersData, serverSearchData, debouncedSearchQuery, currentPage, pageSize, useServerSearch]);

  // Trigger server search when client search finds no results
  useEffect(() => {
    if (clientSearchNoResults && !useServerSearch && debouncedSearchQuery) {
      console.log("Client search found no results, switching to server search");
      setUseServerSearch(true);
    }
  }, [clientSearchNoResults, useServerSearch, debouncedSearchQuery]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setUseServerSearch(false);
    setClientSearchNoResults(false);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    setUseServerSearch(false);
    setClientSearchNoResults(false);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setUseServerSearch(false);
    setClientSearchNoResults(false);
  }, []);

  const handleFilterChange = useCallback((filters: Record<string, any>) => {
    setFilterValues(filters);
    setCurrentPage(1);
    setUseServerSearch(false);
    setClientSearchNoResults(false);
  }, []);

  const handleStatusUpdate = useCallback(async (id: string, status: string) => {
    try {
      await updateUserMutation.mutateAsync({ id, status });
      toast.success("User status updated successfully");
      refetchAllUsers();
      if (useServerSearch) {
        refetchServerSearch();
      }
    } catch (error) {
      toast.error("Failed to update user status");
      console.error("Error updating user status:", error);
    }
  }, [updateUserMutation, refetchAllUsers, refetchServerSearch, useServerSearch]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    refetchAllUsers().finally(() => setIsRefreshing(false));
    if (useServerSearch) {
      refetchServerSearch();
    }
  }, [refetchAllUsers, refetchServerSearch, useServerSearch]);

  const handleExport = useCallback(async () => {
    try {
      const response = await exportUsersMutation.mutateAsync({
        search: typeof debouncedSearchQuery === 'string' ? debouncedSearchQuery : debouncedSearchQuery[0] || '',
        ...apiFilters,
      });

      // Create and download file
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Users exported successfully");
    } catch (error) {
      toast.error("Failed to export users");
      console.error("Export error:", error);
    }
  }, [exportUsersMutation, debouncedSearchQuery, apiFilters]);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <Button onClick={handleExport} disabled={exportUsersMutation.isPending}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* <DataTable
        data={filteredData.data}
        columns={usersTableColumns as any}
        total={filteredData.total}
        page={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        filterOptions={filterOptions}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        error={error}
        meta={{
          onStatusUpdate: handleStatusUpdate,
        }}
      /> */}

      <DataTable
        columns={usersTableColumns}
        data={filteredData?.data ?? []}
        filterBy="name or email"
        tableName="users"
        isLoading={isLoading || isRefreshing}
        error={error}
        pagination={{
          currentPage: currentPage,
          totalPages: filteredData ? Math.ceil(filteredData?.pagination.total / pageSize) : 0,
          totalItems: filteredData?.pagination?.total ?? 0,
          pageSize: pageSize,
        }}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRefresh={handleRefresh}
        onSearch={handleSearch}
        
      />


      <Toaster />
    </div>
  );
} 