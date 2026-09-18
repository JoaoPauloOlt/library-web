import axios from "axios";
import { clearTokens, getAccessToken } from "./authStorage";

const apiUrl =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? "http://localhost:8080" : null);

if (!apiUrl) {
    throw new Error(
        "VITE_API_URL is not configured. Define it in the deployment environment."
    );
}

const api = axios.create({
    baseURL: apiUrl.replace(/\/$/, "")
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
