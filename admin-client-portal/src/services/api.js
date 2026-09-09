import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "https://constructai-backend-ikqh.onrender.com" : "http://localhost:5001"),
});

const CACHE_PREFIX = "PF_OFFLINE_CACHE_";

// Helper to compute cache key
const getCacheKey = (config) => {
  const url = config.url || "";
  const paramsStr = config.params ? JSON.stringify(config.params) : "";
  return `${CACHE_PREFIX}${url}_${paramsStr}`;
};

// Helper to safely save cache snapshot
const setCachedResponse = (config, data) => {
  try {
    const key = getCacheKey(config);
    const payload = {
      data,
      cachedAt: new Date().toISOString(),
      url: config.url
    };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (e) {
    // Gracefully handle storage quota limits
    console.warn("[API Cache] Storage quota exceeded or disabled:", e.message);
  }
};

// Helper to get cached snapshot
const getCachedResponse = (config) => {
  try {
    const key = getCacheKey(config);
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
};

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});

API.interceptors.response.use(
  (response) => {
    // Automatically cache successful GET API responses for offline resilience
    if (response.config.method?.toLowerCase() === "get" && response.status === 200 && response.data) {
      setCachedResponse(response.config, response.data);
    }
    return response;
  },
  (error) => {
    const { config, response } = error;

    // Handle 401/403 session expiration
    if (response && (response.status === 401 || response.status === 403)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      
      if (!window.location.pathname.endsWith("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    // 📱 Offline / Network Failure Interception for GET requests
    const isNetworkFailure = !response || error.code === "ERR_NETWORK" || error.message === "Network Error";
    if (config && config.method?.toLowerCase() === "get" && isNetworkFailure) {
      const cached = getCachedResponse(config);
      if (cached && cached.data) {
        console.log(`[API Cache] Offline fallback active for ${config.url} (cached at ${cached.cachedAt})`);
        
        // Notify UI about offline cached data
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("app-offline-cache-hit", {
              detail: { url: config.url, cachedAt: cached.cachedAt }
            })
          );
        }

        return Promise.resolve({
          data: cached.data,
          status: 200,
          statusText: "OK (Offline Cached)",
          headers: { "x-from-offline-cache": "true" },
          config,
          isOfflineData: true,
          cachedAt: cached.cachedAt
        });
      }
    }

    return Promise.reject(error);
  }
);

export default API;