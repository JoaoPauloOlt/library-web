import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { loginRequest } from "../services/authService";

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(
        localStorage.getItem("token") || null
    );

    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);

        try {
            const data = await loginRequest(email, password);
            const newToken = data.token;

            localStorage.setItem("token", newToken);
            setToken(newToken);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                isAuthenticated: !!token,
                loading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
