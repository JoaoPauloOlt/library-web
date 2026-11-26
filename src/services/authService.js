import api, { refreshAccessToken } from "./axios";

export const loginRequest = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
};

export const refreshRequest = async () => {
    const token = await refreshAccessToken();
    return { token };
};

export const logoutRequest = async () => {
    await api.post("/auth/logout");
};

export const registerRequest = async (payload) => {
    const { data } = await api.post("/users", payload);
    return data;
};