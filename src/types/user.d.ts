interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    bloodGroup?: string;
    role: 'admin' | 'user' | 'donor' | 'recipient';
    status: 'active' | 'inactive' | 'suspended';
    location?: {
        coordinates:[number, number] // [longitude, latitude]

        lat: number;
        lng: number;
    };
    primaryLocation?: {
        coordinates:[number, number] // [longitude, latitude]

        lat: number;
        lng: number;
    };
    lastKnownLocation?: {
        coordinates:[number, number] // [longitude, latitude]

        lat: number;
        lng: number;
    };
    
    createdAt: string;
    updatedAt: string;
}