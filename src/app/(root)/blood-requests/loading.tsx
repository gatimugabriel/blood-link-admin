import {BloodRequestsTable} from "@/components/blood-requests/blood-requests-table";
import {Skeleton} from "@/components/ui/skeleton";
import {Search} from "lucide-react";

export default function BloodRequestsLoading() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-9 w-48"/>
                <Skeleton className="h-10 w-24"/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                    <Skeleton className="h-10 w-full"/>
                </div>
                <Skeleton className="h-10 w-full"/>
                <Skeleton className="h-10 w-full"/>
                <Skeleton className="h-10 w-full"/>
            </div>

            <BloodRequestsTable
                data={[]}
                pagination={{
                    total: 0,
                    page: 1,
                    limit: 10,
                    totalPages: 0,
                }}
                isLoading={true}
                onPageChange={() => {
                }}
                onPageSizeChange={() => {
                }}
                onSort={() => {
                }}
            />
        </div>
    );
} 