let accessToken = null;

const removeLegacyTokens = () => {
    try {
        if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.removeItem("token");
            window.localStorage.removeItem("refreshToken");
        }
    } catch {
        // Storage may be unavailable; authentication no longer depends on it.
    }
};

// Remove credentials persisted by previous versions as soon as this module loads.
removeLegacyTokens();

export const getAccessToken = () => accessToken;
export const getRefreshToken = () => null;

export const saveTokens = ({ token }) => {
    if (typeof token !== "string" || !token.trim()) {
        throw new Error("Invalid authentication token");
    }
    accessToken = token;
};

export const clearTokens = () => {
    accessToken = null;
    removeLegacyTokens();
};