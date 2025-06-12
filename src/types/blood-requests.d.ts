interface BloodRequest {
    id: string;
    units: number;
    bloodGroup: BloodType;
    urgency: 'low' | 'medium' | 'high';
    status: "open" | "fulfilled" | "closed"
    healthFacility: string;
    requestFor: "self" | "other";
    patientName: string;
    mobileNumber: string;
    requestLocation: {
        coordinates:[number, number] // [longitude, latitude]
        // latitude: number;
        // longitude: number;
    };
    stringRequestLocation: any
    user: User
    createdAt: string;
    updatedAt: string;
}

// --- Data fetching Types/interfaces --- //
interface UseBloodRequestsOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    search?: string;
    sortOrder?: 'asc' | 'desc';
    bloodType?: string;
    status?: 'open' | 'closed' | 'fulfilled';
    dateFrom?: string;
    dateTo?: string;
    bloodGroup?: string;
    urgency?: 'low' | 'medium' | 'high';
    enableSearch?: boolean; // controls whether to hit the server for new results or use state data for searching
}