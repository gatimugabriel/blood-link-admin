import axios, {AxiosError, AxiosResponse, InternalAxiosRequestConfig} from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// request interceptor --> attach auth token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// response interceptor --> handle errors
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) { // Unauthorized cases
            localStorage.removeItem('token');
            window.location.href = '/signin';
        }
        console.log("error response", error)
        return Promise.reject(error);
    }
);

export {apiClient}