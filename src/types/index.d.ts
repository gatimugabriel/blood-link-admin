/*
* All types/interfaces here are generic and can be re-used in multiple places
* */

type PaginatedResponse<T> = {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"