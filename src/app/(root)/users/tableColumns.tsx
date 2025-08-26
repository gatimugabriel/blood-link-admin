import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Check, Copy, EyeIcon, MoreHorizontal, TrashIcon, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

// Status color mappings
const statusColors = {
  active: "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20",
  inactive: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 border-gray-500/20",
  suspended: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20",
} as const;

// Role color mappings
const roleColors = {
  admin: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20",
  user: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20",
  donor: "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20",
  recipient: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20",
} as const;

interface TableActionsProps {
  user: User;
  onStatusUpdate: (id: string, status: string) => void;
}

function TableActions({ user, onStatusUpdate }: TableActionsProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/users/${user.id}`)}
          className="text-blue-600 focus:text-blue-600 focus:bg-blue-50"
        >
          <EyeIcon className="mr-2 h-4 w-4" />
          View details
        </DropdownMenuItem>

        {user.status === 'active' && (
          <DropdownMenuItem
            onClick={() => onStatusUpdate(user.id, 'suspended')}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <UserX className="mr-2 h-4 w-4" />
            Suspend user
          </DropdownMenuItem>
        )}

        {user.status === 'suspended' && (
          <DropdownMenuItem
            onClick={() => onStatusUpdate(user.id, 'active')}
            className="text-green-600 focus:text-green-600 focus:bg-green-50"
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Activate user
          </DropdownMenuItem>
        )}

        {user.status === 'inactive' && (
          <DropdownMenuItem
            onClick={() => onStatusUpdate(user.id, 'active')}
            className="text-green-600 focus:text-green-600 focus:bg-green-50"
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Activate user
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// @ts-ignore
export const usersTableColumns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      const id = row.original.id;
      const truncatedID = id.slice(0, 8) + "...";
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
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
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
    accessorKey: "firstName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-center w-full"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-center">
          {user.firstName} {user.lastName}
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-center w-full"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-center">{row.original.email}</div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <div className="text-center">{row.original.phone || 'N/A'}</div>
    ),
  },
  {
    accessorKey: "bloodGroup",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-center w-full"
        >
          Blood Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-center">{row.original.bloodGroup || 'N/A'}</div>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-center w-full"
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <div className="flex justify-center">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[role]}`}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-center w-full"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <div className="flex justify-center">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center justify-center w-full"
        >
          Registered
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-center">{formatDate(row.original.createdAt)}</div>
    ),
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <div className="text-center">
        <TableActions
          user={row.original}
          //@ts-expect-error the onStatusUpdate is there
          onStatusUpdate={(id, status) => (table.options.meta as unknown)?.onStatusUpdate?.(id, status)}
        />
      </div>
    ),
  },
]; 