import api from "./axios";

export const loginRequest = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    return data; // { token: "..." }
};

export const registerRequest = async (payload) => {
    const { data } = await api.post("/users", payload);
    return data;
};