import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080"
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => {
        const data = response.data;

        // The backend wraps paginated endpoints in PageResponse<T>.
        // Keep the existing frontend contract (response.data = array)
        // while preserving non-paginated responses unchanged.
        if (
            data &&
            Array.isArray(data.content) &&
            typeof data.page === "number" &&
            typeof data.totalPages === "number"
        ) {
            response.data = data.content;
        }

        return response;
    },
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/";
        }
        return Promise.reject(err);
    }
);

export default api;
