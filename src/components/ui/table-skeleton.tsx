import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  showHeader?: boolean;
}

export function TableSkeleton({ columns, rows = 5, showHeader = true }: TableSkeletonProps) {
  return (
    <Table>
      {showHeader && (
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
      )}
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: columns }).map((_, j) => (
              <TableCell key={j}>
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 