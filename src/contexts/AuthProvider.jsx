import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import { loginRequest, logoutRequest, refreshRequest } from "../services/authService";
import { saveTokens, clearTokens } from "../services/authStorage";
import { decodeJwtPayload, hasAnyPermission, hasPermission } from "../utils/jwt";

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const handleTokenRefreshed = (event) => {
            const refreshedToken = event.detail?.token;
            if (refreshedToken) setToken(refreshedToken);
        };
        const handleSessionExpired = () => {
            clearTokens();
            setToken(null);
            window.location.href = "/";
        };
        window.addEventListener("auth:token-refreshed", handleTokenRefreshed);
        window.addEventListener("auth:session-expired", handleSessionExpired);

        // Restore after reload using the browser-managed HttpOnly refresh cookie.
        refreshRequest()
            .then((data) => {
                if (active) {
                    saveTokens(data);
                    setToken(data.token);
                }
            })
            .catch(() => {
                clearTokens();
                if (active) setToken(null);
            })
            .finally(() => { if (active) setLoading(false); });

        return () => {
            active = false;
            window.removeEventListener("auth:token-refreshed", handleTokenRefreshed);
            window.removeEventListener("auth:session-expired", handleSessionExpired);
        };
    }, []);

    const claims = useMemo(() => decodeJwtPayload(token), [token]);
    const permissions = claims?.permissions ?? [];
    const groups = claims?.groups ?? [];

    const login = useCallback(async (email, password) => {
        setLoading(true);
        try {
            const data = await loginRequest(email, password);
            saveTokens(data);
            setToken(data.token);
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await logoutRequest();
        } catch {
            // Local cleanup still occurs when server-side logout cannot complete.
        } finally {
            clearTokens();
            setToken(null);
        }
    }, []);

    const value = useMemo(() => ({
        token, claims, permissions, groups,
        user: claims ? { id: claims.sub, name: claims.name, email: claims.email } : null,
        isAuthenticated: !!token, loading, login, logout,
        hasPermission: (permission) => hasPermission(token, permission),
        hasAnyPermission: (requiredPermissions) => hasAnyPermission(token, requiredPermissions)
    }), [token, claims, permissions, groups, loading, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};