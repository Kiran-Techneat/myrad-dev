import axios from "axios";
import { clearSession, getUserData, refreshToken } from "./authUtility";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const apiInstance = axios.create({ baseURL: BASE_URL, headers: { "Content-Type": "application/json" } });

const generateTraceId = () => {
  const timeHex = Math.floor(Date.now() / 1000).toString(16);
  const randomHex = Array.from({ length: 24 })
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
  return `Root=1-${timeHex}-${randomHex}`;
};

apiInstance.interceptors.request.use(
    (config) => {
        const token = getUserData("accessToken");
        if (token) { config.headers.Authorization = `Bearer ${token}`; }
        
        // Inject AWS X-Ray Trace ID for observability
        config.headers["X-Amzn-Trace-Id"] = generateTraceId();
        
        return config;
    },
    (error) => Promise.reject(error),
);

apiInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (!error.response) return Promise.reject(error);

        const { status } = error.response;
        const originalRequest = error.config;

        if (status === 401 && !originalRequest._retried) {
            originalRequest._retried = true;
            const newToken = await refreshToken();
            if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiInstance(originalRequest);
            }
            // Refresh failed — clear session only if not already on login page
            const currentPath = window.location.pathname;
            if (currentPath !== "/" && !currentPath.includes("/login")) {
                clearSession();
            }
        }

        // 403 = not a token issue, don't log out
        return Promise.reject(error);
    },
);

export default apiInstance;
