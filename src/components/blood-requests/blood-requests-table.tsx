'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { type BloodRequest } from "@/lib/api/api-client";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Pagination } from "@/components/ui/pagination";
import { useState } from "react";

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  fulfilled: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
} as const;

const urgencyColors = {
  low: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  medium: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  high: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
} as const;

interface BloodRequestsTableProps {
  requests: BloodRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSort: (field: string, order: 'asc' | 'desc') => void;
}

export function BloodRequestsTable({
  requests,
  pagination,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onSort,
}: BloodRequestsTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    const newOrder = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
    onSort(field, newOrder);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'PPp');
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Blood Type</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>Hospital</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: pagination.limit }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="animate-pulse bg-muted/50">Loading...</TableCell>
                <TableCell className="animate-pulse bg-muted/50">Loading...</TableCell>
                <TableCell className="animate-pulse bg-muted/50">Loading...</TableCell>
                <TableCell className="animate-pulse bg-muted/50">Loading...</TableCell>
                <TableCell className="animate-pulse bg-muted/50">Loading...</TableCell>
                <TableCell className="animate-pulse bg-muted/50">Loading...</TableCell>
                <TableCell className="animate-pulse bg-muted/50">Loading...</TableCell>
                <TableCell></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pagination.limit}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('status')}
                className="flex items-center"
              >
                Status
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('bloodType')}
                className="flex items-center"
              >
                Blood Type
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('urgency')}
                className="flex items-center"
              >
                Urgency
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Hospital</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('createdAt')}
                className="flex items-center"
              >
                Created At
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.id}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={statusColors[request.status]}
                >
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{request.bloodType}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={urgencyColors[request.urgency]}
                >
                  {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{request.hospital}</TableCell>
              <TableCell>{request.patientName}</TableCell>
              <TableCell>{formatDate(request.createdAt)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => router.push(`/blood-requests/${request.id}`)}
                    >
                      View details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        pageSize={pagination.limit}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
} 