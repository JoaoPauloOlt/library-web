import api, { ensureCsrfToken, refreshAccessToken, resetCsrfToken } from "./axios";

export const loginRequest = async (email, password) => {
    await ensureCsrfToken();
    const { data } = await api.post("/auth/login", { email, password });
    return data;
};

export const refreshRequest = async () => {
    const token = await refreshAccessToken();
    return { token };
};

export const logoutRequest = async () => {
    try {
        await api.post("/auth/logout");
    } finally {
        resetCsrfToken();
    }
};

export const registerRequest = async (payload) => {
    const { data } = await api.post("/users", payload);
    return data;
};
