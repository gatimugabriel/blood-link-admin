'use client';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Download } from "lucide-react";
import { useExportDonations } from "@/hooks/use-donations";

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
const statuses = ['pending', 'approved', 'completed', 'cancelled'] as const;

interface DonationFiltersProps {
  filters: {
    status?: string;
    bloodType?: string;
    dateRange?: { from: Date; to: Date };
  };
  onFiltersChange: (filters: DonationFiltersProps['filters']) => void;
}

export function DonationFilters({ filters, onFiltersChange }: DonationFiltersProps) {
  const exportDonations = useExportDonations();

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : value,
    });
  };

  const handleBloodTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      bloodType: value === 'all' ? undefined : value,
    });
  };

  const handleExport = () => {
    exportDonations.mutate({
      ...filters,
      dateRange: filters.dateRange
        ? {
            from: filters.dateRange.from.toISOString(),
            to: filters.dateRange.to.toISOString(),
          }
        : undefined,
    });
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <Select
        value={filters.status || 'all'}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.bloodType || 'all'}
        onValueChange={handleBloodTypeChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by blood type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Blood Types</SelectItem>
          {bloodTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !filters.dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateRange?.from ? (
              filters.dateRange.to ? (
                <>
                  {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                  {format(filters.dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(filters.dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={filters.dateRange?.from}
            selected={{
              from: filters.dateRange?.from,
              to: filters.dateRange?.to,
            }}
            onSelect={(range) =>
              onFiltersChange({
                ...filters,
                dateRange: range as { from: Date; to: Date },
              })
            }
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        onClick={handleExport}
        disabled={exportDonations.isPending}
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
} 