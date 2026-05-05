import api from "../services/axios";

export const getLoans = () => api.get("/loans");

export const createLoan = (data) => api.post("/loans", data);

export const returnLoan = (id) => api.put(`/loans/${id}/return`);