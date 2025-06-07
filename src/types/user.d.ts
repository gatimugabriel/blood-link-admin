interface User {
    id: string;
    name: string;
    email: string;
    bloodType: string;
    location?: {
        lat: number;
        lng: number;
    };
}
