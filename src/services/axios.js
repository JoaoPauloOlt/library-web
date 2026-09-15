import axios from "axios";
import { clearTokens, getAccessToken } from "./authStorage";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080"
});

api.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (err) => {
        if (err.response?.status === 401) {
            clearTokens();
            window.location.href = "/";
        }

        return Promise.reject(err);
    }
);

export default api;
