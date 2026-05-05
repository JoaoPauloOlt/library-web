import api from "../services/axios";

export const getAuthors = () => api.get("/authors");

export const createAuthor = (data) => api.post("/authors", data);