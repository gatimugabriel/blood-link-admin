interface Donation {
    id: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    request: DonationRequest
    donor: User
    donationDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

interface DonationStats {
    total: number;
    byStatus: Record<string, number>;
    byBloodType: Record<string, number>;
}

//---- Data fetching types -----//
interface UseDonationsOptions {
    page?: number;
    limit?: number;
    search?: string;
    enableSearch?: boolean;

    status?: string;
    dateFrom?: string;
    dateTo?: string;
    bloodGroup?: string;
}