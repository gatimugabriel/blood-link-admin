import {ColumnDef} from "@tanstack/react-table"
import {ArrowUpDown, Badge, EyeIcon, MoreHorizontal, PencilLine, TrashIcon} from "lucide-react"
import {Button} from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Status and urgency color mappings
const statusColors = {
    open: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
    fulfilled: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    closed: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
} as const;

const urgencyColors = {
    low: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    medium: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
    high: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
} as const;

interface TableActionsProps {
    request: BloodRequest;
    onDelete: (id: string) => void;
}

function TableActions({ request, onDelete }: TableActionsProps) {
    const router = useRouter();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() => router.push(`/blood-requests/${request.id}`)}
                    className="text-blue-600 focus:text-blue-600 focus:bg-blue-50"
                >
                    <EyeIcon className="mr-2 h-4 w-4"/>
                    View details
                </DropdownMenuItem>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                            <TrashIcon className="mr-2 h-4 w-4"/>
                            Delete request
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the blood request
                                for {request.patientName} at {request.healthFacility}.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => onDelete(request.id)}
                                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export const donationRequestsTableColumns: ColumnDef<BloodRequest>[] = [
    {
        accessorKey: "id",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    ID
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            )
        },
    },
    {
        accessorKey: "units",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Units
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            )
        },
    },
    {
        accessorKey: "bloodGroup",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="flex items-center justify-center w-full"
                >
                    Blood Type
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            )
        },
        cell: ({row}) => (
            <div className="text-center">{row.original.bloodGroup}</div>
        ),
    },
    {
        accessorKey: "urgency",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="flex items-center justify-center w-full"
                >
                    Urgency
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            )
        },
        cell: ({row}) => {
            const urgency = row.original.urgency;
            return (
                <div className="flex justify-center">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyColors[urgency]}`}>
                        {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "status",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="flex items-center justify-center w-full"
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            )
        },
        cell: ({row}) => {
            const status = row.original.status;
            return (
                <div className="flex justify-center">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "healthFacility",
        header: "Health Facility",
        cell: ({row}) => (
            <div className="text-center">{row.original.healthFacility}</div>
        ),
    },
    {
        accessorKey: "patientName",
        header: "Patient",
        cell: ({row}) => (
            <div className="text-center">{row.original.patientName}</div>
        ),
    },
    {
        accessorKey: "mobileNumber",
        header: "Phone",
    },
    // {
    //     accessorKey: "requestLocation",
    //     header: "Location",
    // },
    {
        accessorKey: "createdAt",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="flex items-center justify-center w-full"
                >
                    Created At
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            )
        },
        cell: ({row}) => (
            <div className="text-center">{formatDate(row.original.createdAt)}</div>
        ),
    },
    // {
    //     accessorKey: "updatedAt",
    //     header: "Last Update",
    // },

    {
        id: "actions",
        cell: ({row, table}) => (
            <div className="text-center">
                <TableActions
                    request={row.original}
                    onDelete={(id) => (table.options.meta as any)?.onDelete?.(id)}
                />
            </div>
        ),
    },
]