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
// interface UseBloodRequestsOptions  {
//     status?: string;
//     bloodType?: string;
//     urgency?: string;
//     dateRange?: {
//         from: string;
//         to: string;
//     };
//     page?: number;
//     limit?: number;
//     sortBy?: string;
//     sortOrder?: 'asc' | 'desc';
// }

interface UseBloodRequestsOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    status?: string;
    bloodType?: string;
    urgency?: string;
    enableSearch?: boolean; // New option to control whether to use server-side search
}