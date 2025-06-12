import {ColumnDef} from "@tanstack/react-table";
import {ArrowUpDown, Check, Copy, EyeIcon, MoreHorizontal, TrashIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {useRouter} from "next/navigation";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {useState} from "react";
import {formatDate} from "@/lib/utils/date";

const statusColors = {
    scheduled: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20",
    // approved: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20",
    completed: "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20",
} as const;

interface TableActionsProps {
    donation: Donation;
    onStatusUpdate: (id: string, status: string) => void;
}

function TableActions({donation, onStatusUpdate}: TableActionsProps) {
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
                    onClick={() => router.push(`/donations/${donation.id}`)}
                    className="text-blue-600 focus:text-blue-600 focus:bg-blue-50"
                >
                    <EyeIcon className="mr-2 h-4 w-4"/>
                    View details
                </DropdownMenuItem>

                {donation.status === 'scheduled' && (
                    <>
                        <DropdownMenuItem
                            onClick={() => onStatusUpdate(donation.id, 'approved')}
                            className="text-green-600 focus:text-green-600 focus:bg-green-50"
                        >
                            <Check className="mr-2 h-4 w-4"/>
                            Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onStatusUpdate(donation.id, 'cancelled')}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                            <TrashIcon className="mr-2 h-4 w-4"/>
                            Cancel
                        </DropdownMenuItem>
                    </>
                )}

                {donation.status === 'completed' && (
                    <DropdownMenuItem
                        onClick={() => onStatusUpdate(donation.id, 'completed')}
                        className="text-green-600 focus:text-green-600 focus:bg-green-50"
                    >
                        <Check className="mr-2 h-4 w-4"/>
                        Mark as completed
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export const donationsTableColumns: ColumnDef<Donation>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({row}) => {
            const id = row.original.id;
            const truncatedID = id.slice(0, 2) + "...";
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center space-x-2 cursor-pointer">
                                <span>{truncatedID}</span>
                                {(() => {
                                    const [copied, setCopied] = useState(false);

                                    const handleCopy = async () => {
                                        await navigator.clipboard.writeText(id);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    };

                                    return (
                                        <div
                                            className="ml-2 h-4 w-4 cursor-pointer"
                                            onClick={handleCopy}
                                        >
                                            {copied ? (
                                                <Check className="h-4 w-4 text-green-600"/>
                                            ) : (
                                                <Copy className="h-4 w-4"/>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-background text-text p-4 border">
                            <p>{id}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
    },
    {
        accessorKey: "donor",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="flex items-center justify-center w-full"
                >
                    Donor
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            );
        },
        cell: ({row}) => {
            const donor = row.original.donor;
            return (
                <div className="text-center">
                    {donor ? `${donor.firstName} ${donor.lastName}` : 'N/A'}
                </div>
            );
        },
    },
    {
        accessorKey: "request",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="flex items-center justify-center w-full"
                >
                    Receiver
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            );
        },
        cell: ({row}) => {
            const request = row.original.request;
            return (
                <div className="text-center">
                    {request
                        ? (request.requestFor === 'self'
                            ? `${request?.user?.firstName} ${request?.user?.lastName}`
                            : request.patientName)
                        : 'N/A'}
                </div>
            )
        },
    },
    // {
    //   accessorKey: "donor.email",
    //   header: "Email",
    //   cell: ({ row }) => (
    //     <div className="text-center">{row.original.donor?.email || 'N/A'}</div>
    //   ),
    // },
    {
        accessorKey: "request.bloodGroup",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="flex items-center justify-center w-full"
                >
                    Blood Group
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            );
        },
        cell: ({row}) => (
            <div className="text-center">{row.original.request?.bloodGroup || 'N/A'}</div>
        ),
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
            );
        },
        cell: ({row}) => {
            const status = row.original.status;
            return (
                <div className="flex justify-center">
                    <div className={`px - 2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "donationDate",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="flex items-center justify-center w-full"
                >
                    Date Completed
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            );
        },
        cell: ({row}) => (
            <div className="text-center">
                {row.original.donationDate ? formatDate(row.original.donationDate) : 'N/A'}
            </div>
        ),
    },
    {
        accessorKey: "createdAt",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="flex items-center justify-center w-full"
                >
                    Date Scheduled
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            );
        },
        cell: ({row}) => (
            <div className="text-center">{formatDate(row.original.createdAt)}</div>
        ),
    },
    {
        id: "actions",
        cell: ({row, table}) => (
            <div className="text-center">
                <TableActions
                    donation={row.original}
                    onStatusUpdate={(id, status) => (table.options.meta as any)?.onStatusUpdate?.(id, status)}
                />
            </div>
        ),
    },
]; 
