import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  signup: (email: string, password: string, name: string) =>
    apiClient.post("/auth/signup", { email, password, name }),
  login: (email: string, password: string) =>
    apiClient.post("/auth/login", { email, password }),
  getProfile: () => apiClient.get("/auth/profile"),
};

// Campaigns API
export const campaignAPI = {
  create: (data: { name: string; message: string }) =>
    apiClient.post("/campaigns", data),
  list: () => apiClient.get("/campaigns"),
  getById: (id: string) => apiClient.get(`/campaigns/${id}`),
  addContacts: (campaignId: string, contacts: string[]) =>
    apiClient.post(`/campaigns/${campaignId}/contacts`, { contacts }),
  send: (campaignId: string) =>
    apiClient.post(`/campaigns/${campaignId}/send`, {}),
  getStats: (campaignId: string) =>
    apiClient.get(`/campaigns/${campaignId}/stats`),
  delete: (campaignId: string) =>
    apiClient.delete(`/campaigns/${campaignId}`),
};

// Messages API
export const messageAPI = {
  send: (phoneNumber: string, message: string, campaignId?: string) =>
    apiClient.post("/messages/send", { phoneNumber, message, campaignId }),
  schedule: (campaignId: string, scheduledTime: string) =>
    apiClient.post(`/messages/campaign-schedule`, { campaignId, scheduledTime }),
  getScheduled: () => apiClient.get("/messages/scheduled"),
  cancelSchedule: (campaignId: string) =>
    apiClient.delete(`/messages/schedule/${campaignId}`),
  getQueueStats: () => apiClient.get("/messages/queue/stats"),
};

export default apiClient;
