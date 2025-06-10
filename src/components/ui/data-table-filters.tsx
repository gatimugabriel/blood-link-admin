'use client';

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface FilterOption {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date-range' | 'date';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface FilterValue {
  id: string;
  value: string | { from?: Date; to?: Date } | Date;
}

interface DataTableFiltersProps {
  filters: FilterOption[];
  values: FilterValue[];
  onFiltersChange: (filters: FilterValue[]) => void;
  onReset: () => void;
}

export function DataTableFilters({
  filters,
  values,
  onFiltersChange,
  onReset,
}: DataTableFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = values.filter(f => f.id !== filterId);
    if (value !== undefined && value !== null && value !== '') {
      newFilters.push({ id: filterId, value });
    }
    onFiltersChange(newFilters);
  };

  const removeFilter = (filterId: string) => {
    const newFilters = values.filter(f => f.id !== filterId);
    onFiltersChange(newFilters);
  };

  const getFilterDisplayValue = (filter: FilterValue) => {
    const filterOption = filters.find(f => f.id === filter.id);
    if (!filterOption) return '';

    if (filterOption.type === 'select') {
      const option = filterOption.options?.find(opt => opt.value === filter.value);
      return option?.label || filter.value as string;
    }

    if (filterOption.type === 'date-range') {
      const dateRange = filter.value as { from?: Date; to?: Date };
      if (dateRange.from && dateRange.to) {
        return `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`;
      } else if (dateRange.from) {
        return `From ${format(dateRange.from, 'MMM dd')}`;
      } else if (dateRange.to) {
        return `Until ${format(dateRange.to, 'MMM dd')}`;
      }
    }

    if (filterOption.type === 'date') {
      return format(filter.value as Date, 'MMM dd, yyyy');
    }

    return filter.value as string;
  };

  const renderFilterInput = (filter: FilterOption) => {
    const currentValue = values.find(v => v.id === filter.id);

    switch (filter.type) {
      case 'text':
        return (
          <Input
            placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}...`}
            value={currentValue?.value as string || ''}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            className="w-full"
          />
        );

      case 'select':
        return (
          <Select
            value={currentValue?.value as string || ''}
            onValueChange={(value) => handleFilterChange(filter.id, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={filter.placeholder || `Select ${filter.label.toLowerCase()}...`} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !currentValue?.value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {currentValue?.value ? (
                  format(currentValue.value as Date, "PPP")
                ) : (
                  <span>{filter.placeholder || "Pick a date"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={currentValue?.value as Date}
                onSelect={(date) => handleFilterChange(filter.id, date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'date-range':
        const dateRange = currentValue?.value as { from?: Date; to?: Date } || {};
        return (
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    format(dateRange.from, "MMM dd")
                  ) : (
                    <span>From</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(date) => handleFilterChange(filter.id, { ...dateRange, from: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.to ? (
                    format(dateRange.to, "MMM dd")
                  ) : (
                    <span>To</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(date) => handleFilterChange(filter.id, { ...dateRange, to: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      default:
        return null;
    }
  };

  if (filters.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {values.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {values.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium leading-none">Filters</h4>
                {values.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="h-auto p-0 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {filters.map((filter) => (
                  <div key={filter.id} className="space-y-2">
                    <label className="text-sm font-medium">{filter.label}</label>
                    {renderFilterInput(filter)}
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Filters Display */}
        {values.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {values.map((filter) => (
              <Badge
                key={filter.id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                <span className="text-xs font-medium">
                  {filters.find(f => f.id === filter.id)?.label}: {getFilterDisplayValue(filter)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFilter(filter.id)}
                  className="h-auto p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 