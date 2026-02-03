import { Url, LinkDetails, AnalyticsData } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  method?: RequestMethod;
  body?: any;
  headers?: Record<string, string>;
}

async function fetchClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;
  const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    ...(body && { body: JSON.stringify(body) }),
  };

  let url = endpoint;
  if (!endpoint.startsWith("http") && !endpoint.startsWith("/internal")) {
    url = `${API_BASE_URL}${endpoint}`;
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  // Handle empty responses (e.g. DELETE)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  links: {
    getAll: () => fetchClient<Url[]>("/api/urls"),
    getOne: (code: string) => fetchClient<LinkDetails>(`/api/urls/${code}`),
    create: (data: { originalUrl: string; code?: string; title?: string; expirationDays?: number }) =>
      fetchClient<Url>("/api/urls", { method: "POST", body: data }),
    update: (code: string, data: any) =>
      fetchClient<LinkDetails>(`/api/urls/${code}`, { method: "PUT", body: data }),
    delete: (code: string) => fetchClient<void>(`/api/urls/${code}`, { method: "DELETE" }),
    validate: (url: string) => fetchClient<{ title: string }>("/internal/validate-url", { method: "POST", body: { url } }), // Note: internal API
  },
  analytics: {
    get: (code: string) => fetchClient<AnalyticsData>(`/api/analytics/${code}`),
  }
};
