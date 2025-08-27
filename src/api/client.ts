// src/api/client.ts
import axios from "axios";

/**
 * Central axios client. Base URL points to your Django API root (/api).
 * Change VITE_API_URL in .env if you serve API elsewhere.
 */
const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000/api";

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: false, // change if you use cookies
});

/**
 * Set or remove Authorization header for all future requests.
 */
export function setAuthToken(token?: string | null) {
  if (token) {
    client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common["Authorization"];
  }
}

export default client;
