import api from "../services/axios";

export const getBooks = () => api.get("/books");

export const createBook = (data) => api.post("/books", data);

export const deleteBook = (id) => api.delete(`/books/${id}`);