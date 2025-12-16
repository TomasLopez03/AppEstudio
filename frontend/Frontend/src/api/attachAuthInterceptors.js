import axios from 'axios'
import { refreshToken as refreshTokenApi } from './auth'

// Attach interceptors to an axios instance to add Authorization header
// and automatically refresh the access token on 401 responses.
export function attachAuthInterceptors(instance) {
    // Request: add Authorization header from localStorage
    instance.interceptors.request.use(
        (config) => {
            try {
                const token = localStorage.getItem('accessToken');
                if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
            } catch (e) {
                // ignore
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response: on 401, try to refresh token once and retry the request
    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            if (!originalRequest) return Promise.reject(error);

            // Avoid infinite loop and only retry once
            if (error.response && error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const refresh = localStorage.getItem('refreshToken');
                    if (!refresh) {
                        // No refresh token -> logout signal
                        window.dispatchEvent(new CustomEvent('auth:logout'));
                        return Promise.reject(error);
                    }
                    // Call refresh API
                    const resp = await refreshTokenApi({ refresh });
                    const newAccess = resp?.data?.access;
                    if (newAccess) {
                        localStorage.setItem('accessToken', newAccess);
                        // notify app about token refresh so contexts can update
                        window.dispatchEvent(new CustomEvent('auth:token_refreshed', { detail: { access: newAccess } }));
                        // set header and retry original request
                        originalRequest.headers = { ...(originalRequest.headers || {}), Authorization: `Bearer ${newAccess}` };
                        return instance(originalRequest);
                    }
                } catch (refreshErr) {
                    // refresh failed -> logout
                    window.dispatchEvent(new CustomEvent('auth:logout'));
                    return Promise.reject(refreshErr);
                }
            }
            return Promise.reject(error);
        }
    );
}

export default attachAuthInterceptors;
