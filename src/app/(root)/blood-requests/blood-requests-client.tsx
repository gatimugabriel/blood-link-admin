'use client';

import { useState, useCallback, useMemo } from "react";
import { useBloodRequests, useDeleteBloodRequest } from "@/hooks/use-blood-requests";
import { DataTable } from "@/components/ui/data-table";
import { donationRequestsTableColumns } from "@/app/(root)/blood-requests/tableColumns";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useExportBloodRequests } from "@/hooks/use-blood-requests";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export function BloodRequestsClient() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isServerSearch, setIsServerSearch] = useState(false);

  // Get all data without search first
  const { data: allData, isLoading: isLoadingAll, error: allError, refetch: refetchAll } = useBloodRequests({
    page,
    limit,
  });

  // Get server search results when needed
  const { data: searchData, isLoading: isLoadingSearch, error: searchError, refetch: refetchSearch } = useBloodRequests({
    page,
    limit,
    search: isServerSearch ? searchQuery : undefined,
  });

  const deleteMutation = useDeleteBloodRequest();
  const exportMutation = useExportBloodRequests();

  // Determine which data source to use
  const data = isServerSearch ? searchData : allData;
  const isLoading = isServerSearch ? isLoadingSearch : isLoadingAll;
  const error = isServerSearch ? searchError : allError;
  const refetch = isServerSearch ? refetchSearch : refetchAll;

  // Client-side search
  const filteredData = useMemo(() => {
    if (!allData?.data || !searchQuery || isServerSearch) {
      return isServerSearch ? searchData : allData;
    }
    
    const searchLower = searchQuery.toLowerCase();
    const filtered = allData.data.filter((item) => 
      item.patientName.toLowerCase().includes(searchLower) ||
      item.healthFacility.toLowerCase().includes(searchLower) ||
      item.bloodGroup.toLowerCase().includes(searchLower)
    );

    // If no results found in client data, trigger server search
    if (filtered.length === 0) {
      console.log('No results in client data, switching to server search');
      setIsServerSearch(true);
      return searchData; // Return server data (might be loading)
    }

    return {
      ...allData,
      data: filtered,
      pagination: {
        ...allData.pagination,
        total: filtered.length,
      },
    };
  }, [allData, searchData, searchQuery, isServerSearch]);

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
    setIsServerSearch(false); // Reset to client search for new queries
  }, []);

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
    } catch (error) {
      toast.error("Failed to delete blood request");
    }
  }, [deleteMutation, refetch]);

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync({
        search: searchQuery || undefined,
      });
      
      // Create a download link
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
        filterBy="patientName"
        tableName="blood requests"
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
      />
      <Toaster />
    </div>
  );
} 