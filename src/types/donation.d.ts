interface Donation {
    id: string;
    status: 'pending' | 'approved' | 'completed' | 'cancelled';
    bloodType: string;
    createdAt: string;
    updatedAt: string;
}

interface DonationStats {
    total: number;
    byStatus: Record<string, number>;
    byBloodType: Record<string, number>;
}

//---- Data fetching types -----//
interface UseDonationsOptions {
    status?: string;
    bloodType?: string;
    dateRange?: {
        from: string;
        to: string;
    };
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}