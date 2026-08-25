import { useCallback, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import { loginRequest } from "../services/authService";
import { decodeJwtPayload, hasAnyPermission, hasPermission } from "../utils/jwt";

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(
        localStorage.getItem("token") || null
    );
    const [loading, setLoading] = useState(false);

    const claims = useMemo(() => decodeJwtPayload(token), [token]);
    const permissions = claims?.permissions ?? [];
    const groups = claims?.groups ?? [];

    const login = useCallback(async (email, password) => {
        setLoading(true);

        try {
            const data = await loginRequest(email, password);
            const newToken = data.token;

            localStorage.setItem("token", newToken);
            setToken(newToken);
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        setToken(null);
    }, []);

    const value = useMemo(() => ({
        token,
        claims,
        permissions,
        groups,
        user: claims
            ? {
                id: claims.sub,
                name: claims.name,
                email: claims.email
            }
            : null,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
        hasPermission: (permission) => hasPermission(token, permission),
        hasAnyPermission: (requiredPermissions) =>
            hasAnyPermission(token, requiredPermissions)
    }), [token, claims, permissions, groups, loading, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
