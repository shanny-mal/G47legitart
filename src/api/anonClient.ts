// src/api/anonClient.ts
import axios from "axios";

const base = (import.meta.env.VITE_API_BASE as string | undefined) ?? "http://localhost:8000/api/";

const anonClient = axios.create({
  baseURL: base,
  // if your backend uses cookie auth/CSRF and you need cookies:
  // withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default anonClient;
