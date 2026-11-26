import axios from "axios";
import {
    clearTokens,
    getAccessToken,
    getRefreshToken,
    saveTokens
} from "./authStorage";

const apiUrl =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? "http://localhost:8080" : null);

if (!apiUrl) {
    throw new Error(
        "VITE_API_URL is not configured. Define it in the deployment environment."
    );
}

const baseURL = apiUrl.replace(/\/$/, "");

const api = axios.create({ baseURL });

// Refresh requests use the plain Axios client to avoid interceptor recursion.
let refreshPromise = null;

const notifyTokenRefreshed = (token) => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(
            new CustomEvent("auth:token-refreshed", { detail: { token } })
        );
    }
};

const notifySessionExpired = () => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:session-expired"));
    }
};

const refreshAccessToken = () => {
    if (!refreshPromise) {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
            return Promise.reject(new Error("Refresh token is unavailable"));
        }

        refreshPromise = axios
            .post(`${baseURL}/auth/refresh`, { refreshToken })
            .then(({ data }) => {
                saveTokens(data);
                notifyTokenRefreshed(data.token);
                return data.token;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
};

api.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (err) => {
        const config = err.config;
        const status = err.response?.status;
        const requestUrl = config?.url ?? "";
        const isAuthenticationRequest = /^\/auth\/(login|refresh|logout)(?:\?|$)/.test(
            requestUrl
        );

        if (status !== 401 || !config || config._retry || isAuthenticationRequest) {
            return Promise.reject(err);
        }

        config._retry = true;

        try {
            const token = await refreshAccessToken();
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${token}`;
            return api(config);
        } catch (refreshError) {
            clearTokens();
            notifySessionExpired();
            return Promise.reject(refreshError);
        }
    }
);

export default api;
