import api from "../services/axios";

export const createUser = (data) => {
    return api.post("/users", data);
};

export const getUsers = () => {
    return api.get("/users");
};