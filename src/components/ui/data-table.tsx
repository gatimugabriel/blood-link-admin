'use client';

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {AlertCircle, Inbox, RefreshCw, Search, Settings2} from "lucide-react";
import {DataTablePagination} from "./data-table-pagination";
import {useDebounce} from "@/hooks/use-debounce";
import {TableSkeleton} from "./table-skeleton";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {DataTableFilters, FilterOption, FilterValue} from "./data-table-filters";
import {useRouter} from "next/navigation";

interface DataTableProps<TData> {
    columns: ColumnDef<TData, any>[];
    data: TData[];
    filterBy?: string;
    tableName?: string;
    isLoading?: boolean;
    error?: Error | null;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        pageSize: number;
    };
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    onRefresh: () => void;
    onSearch: (query: string) => void;
    onDelete?: (id: string) => void;
    onStatusUpdate?:(id: string, status: string) => void;

    // Optional filters
    filters?: FilterOption[];
    filterValues?: FilterValue[];
    onFiltersChange?: (filters: FilterValue[]) => void;
    onFiltersReset?: () => void;
}

export function DataTable<TData>({
                                     columns,
                                     data,
                                     filterBy,
                                     tableName,
                                     isLoading,
                                     error,
                                     pagination,
                                     onPageChange,
                                     onPageSizeChange,
                                     onRefresh,
                                     onSearch,
                                     onDelete,
                                     filters = [],
                                     filterValues = [],
                                     onFiltersChange,
                                     onFiltersReset,
                                     onStatusUpdate,
                                 }: DataTableProps<TData>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [globalFilter, setGlobalFilter] = React.useState("");
    const [debouncedSearch] = useDebounce(globalFilter, 300);
    const router = useRouter();

    React.useEffect(() => {
        setSorting([]);
    }, [data]);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            globalFilter,
        },
        enableSorting: true,
        enableColumnFilters: true,
        manualPagination: true,
        pageCount: pagination.totalPages,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        meta: {
            onDelete,
        },
    });

    React.useEffect(() => {
        onSearch?.(debouncedSearch);
    }, [debouncedSearch, onSearch]);

    const handleSearch = (value: string) => {
        setGlobalFilter(value);
        onSearch(value);
    };

    if (error) {
        return (
            <div className="space-y-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4"/>
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription className="flex items-center justify-between">
                        <span>{error.message}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            className="ml-4"
                        >
                            <RefreshCw className="mr-2 h-4 w-4"/>
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
                <TableSkeleton columns={columns.length} rows={pagination.pageSize} isLoading={false}/>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search Input + View-filters */}
            <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center space-x-2">
                    <div className="relative flex-1 lg:mr-12">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                        <Input
                            placeholder={`Search ${filterBy}...`}
                            value={globalFilter ?? ""}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRefresh?.()}
                        className="h-8 px-2 lg:px-3 mr-1"
                    >
                        <RefreshCw className="mr-2 h-4 w-4"/>
                        <span className="hidden lg:inline">Refresh</span>
                    </Button>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-auto h-8">
                            <Settings2 className="mr-2 h-4 w-4"/>
                            <span className="hidden lg:inline">View</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(value)}
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Filters */}
            {filters.length > 0 && (
                <DataTableFilters
                    filters={filters}
                    values={filterValues}
                    onFiltersChange={onFiltersChange || (() => {})}
                    onReset={onFiltersReset || (() => {})}
                />
            )}

            {/*Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-center">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            // skeleton loader
                            Array.from({length: pagination.pageSize}).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({length: columns.length}).map((_, j) => (
                                        <TableCell key={j}>
                                            <div className="h-4 w-full bg-muted animate-pulse rounded"/>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={`cursor-pointer`}
                                    // @ts-ignore - I know the records in my table has id
                                    onClick={() => router.push(`/${tableName}/${row.original.id}`)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className={`text-center`}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <Inbox className="h-8 w-8 text-muted-foreground"/>
                                        <p className="text-sm text-muted-foreground">
                                            No {tableName} found.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                pageSize={pagination.pageSize}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                isLoading={isLoading}
            />
        </div>
    );
}