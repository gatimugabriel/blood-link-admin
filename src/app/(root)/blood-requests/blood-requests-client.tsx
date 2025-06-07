 'use client';

import { useState } from "react";
import { BloodRequestsTable } from "@/components/blood-requests/blood-requests-table";
import { useBloodRequests } from "@/hooks/use-blood-requests";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download } from "lucide-react";
import { useExportBloodRequests } from "@/hooks/use-blood-requests";

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
const STATUSES = ['pending', 'fulfilled', 'cancelled'] as const;
const URGENCIES = ['low', 'medium', 'high'] as const;

export function BloodRequestsClient() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    bloodType: 'all',
    status: 'all',
    urgency: 'all',
    search: '',
  });

  const { data, isLoading, error } = useBloodRequests({
    page,
    limit,
    sortBy: sortField,
    sortOrder,
    ...Object.fromEntries(
      Object.entries(filters).map(([key, value]) => [
        key,
        value === 'all' ? undefined : value
      ])
    ),
  });

  const exportMutation = useExportBloodRequests();

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    setSortField(field);
    setSortOrder(order);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync(
        Object.fromEntries(
          Object.entries({
            sortBy: sortField,
            sortOrder,
            ...filters,
          }).map(([key, value]) => [
            key,
            value === 'all' ? undefined : value
          ])
        )
      );
    } catch (error) {
      console.error('Failed to export blood requests:', error);
    }
  };

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Blood Requests</h1>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={filters.bloodType}
          onValueChange={(value) => handleFilterChange('bloodType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Blood Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Blood Types</SelectItem>
            {BLOOD_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.urgency}
          onValueChange={(value) => handleFilterChange('urgency', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Urgencies</SelectItem>
            {URGENCIES.map((urgency) => (
              <SelectItem key={urgency} value={urgency}>
                {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {data && (
        <BloodRequestsTable
          data={data.data}
          pagination={{
            total: data.pagination.total,
            page,
            limit,
            totalPages: Math.ceil(data.pagination.total / limit),
          }}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSort={handleSort}
        />
      )}
    </div>
  );
}