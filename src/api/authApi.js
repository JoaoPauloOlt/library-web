import api from "../services/axios";

export const loginRequest = (email, password) => {
    return api.post("/auth/login", { email, password });
};