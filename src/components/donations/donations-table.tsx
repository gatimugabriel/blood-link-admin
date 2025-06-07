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
import { type Donation } from "@/lib/api/api-client";
import { useUpdateDonation } from "@/hooks/use-donations";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/pagination";
import { useState } from "react";

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  approved: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  completed: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
} as const;

interface DonationsTableProps {
  donations: Donation[];
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

export function DonationsTable({
  donations,
  pagination,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onSort,
}: DonationsTableProps) {
  const router = useRouter();
  const updateDonation = useUpdateDonation();
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    const newOrder = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
    onSort(field, newOrder);
  };

  const handleStatusChange = async (id: string, status: Donation['status']) => {
    try {
      await updateDonation.mutateAsync({ id, status });
      toast.success('Donation status updated successfully');
    } catch (error) {
      toast.error('Failed to update donation status');
    }
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
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
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
                onClick={() => handleSort('createdAt')}
                className="flex items-center"
              >
                Created At
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('updatedAt')}
                className="flex items-center"
              >
                Updated At
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {donations.map((donation) => (
            <TableRow key={donation.id}>
              <TableCell className="font-medium">{donation.id}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={statusColors[donation.status]}
                >
                  {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{donation.bloodType}</TableCell>
              <TableCell>{formatDate(donation.createdAt)}</TableCell>
              <TableCell>{formatDate(donation.updatedAt)}</TableCell>
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
                      onClick={() => router.push(`/donations/${donation.id}`)}
                    >
                      View details
                    </DropdownMenuItem>
                    {donation.status === 'pending' && (
                      <>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(donation.id, 'approved')}
                        >
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(donation.id, 'cancelled')}
                          className="text-red-600"
                        >
                          Cancel
                        </DropdownMenuItem>
                      </>
                    )}
                    {donation.status === 'approved' && (
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(donation.id, 'completed')}
                      >
                        Mark as completed
                      </DropdownMenuItem>
                    )}
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