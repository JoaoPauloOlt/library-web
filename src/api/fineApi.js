import api from "../services/axios";

export const getMyFines = (params) => api.get("/fines/my", { params });

export const getFines = (params) => api.get("/fines", { params });

export const waiveFine = (id, reason) => api.put(`/fines/${id}/waive`, { reason });
