export const endpoints = {
    auth: {
        signup: '/admin/signup',
        signin: '/admin/signin',
    },
    donations: {
        list: '/donation',
        get: (id: string) => `/donation/${id}`,
        update: (id: string) => `/donation/${id}`,
        stats: '/admin/reports/stats',
        export: '/admin/reports/export',
    },
    bloodRequests: {
        list: '/request',
        get: (id: string) => `/request/${id}`,
        update: (id: string) => `/request/${id}`,
        delete: (id: string) => `/request/${id}`,
        stats: '/admin/reports/blood-requests/stats',
        export: '/admin/reports/blood-requests/export',
    },
    users: {
        list: '/user/all',
        detail: (id: string) => `/user/${id}`,
        update: (id: string) => `/user/${id}`,
        getInRange: '/user/range',
        export: '/admin/users/export',
    },
} as const;