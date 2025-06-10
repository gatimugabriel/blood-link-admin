interface BloodRequest {
    id: string;
    units: number;
    bloodGroup: BloodType;
    urgency: 'low' | 'medium' | 'high';
    status: "open" | "fulfilled" | "closed"
    healthFacility: string;
    patientName: string;
    mobileNumber: string;
    requestLocation: {
        latitude: number;
        longitude: number;
        address: string;
    };
    createdAt: string;
    updatedAt: string;
}

// --- Data fetching Types/interfaces --- //
interface UseBloodRequestsOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    status?: string;
    bloodType?: string;
    urgency?: string;
    enableSearch?: boolean; // controls whether to hit the server for new results or use state data for searching
}