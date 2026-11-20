import api from "../services/axios";

export const getLoans = (params) => api.get("/loans", { params });

export const getMyLoans = (params) => api.get("/loans/my", { params });

export const getLoanUsers = (params) => api.get("/loans/users", { params });

export const createLoan = (data) => api.post("/loans", data);

export const createLoanForUser = (data) => api.post("/loans/for-user", data);

export const approveLoan = (id) => api.put("/loans/" + id + "/approve");

export const returnLoan = (id) => api.put("/loans/" + id + "/return");

export const cancelLoan = (id) => api.put("/loans/" + id + "/cancel");
