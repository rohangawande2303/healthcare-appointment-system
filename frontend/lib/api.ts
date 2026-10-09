import axios from "axios";
import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if ((session?.user as any)?.accessToken) {
    config.headers.Authorization = `Bearer ${(session?.user as any).accessToken}`;
  }
  return config;
});

export default api;
