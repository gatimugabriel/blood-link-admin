export const endpoints = {
    auth: {
        signup: '/admin/signup',
        signin: '/admin/signin',
    },
    donations: {
        list: '/admin/donations',
        get: (id: string) => `/admin/donations/${id}`,
        update: (id: string) => `/admin/donations/${id}`,
        stats: '/admin/reports/stats',
        export: '/admin/reports/export',
    },
    bloodRequests: {
        list: '/admin/requests',
        get: (id: string) => `/admin/requests/${id}`,
        update: (id: string) => `/admin/requests/${id}`,
        delete: (id: string) => `/admin/requests/${id}`,
        stats: '/admin/reports/blood-requests/stats',
        export: '/admin/reports/blood-requests/export',
    },
    users: {
        list: '/user',
        getInRange: '/user/range',
    },
} as const;