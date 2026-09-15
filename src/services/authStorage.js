const ACCESS_TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";

const storage = typeof window !== "undefined" ? window.localStorage : null;

const read = (key) => storage?.getItem(key) || null;

export const getAccessToken = () => read(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => read(REFRESH_TOKEN_KEY);

export const saveTokens = ({ token, refreshToken }) => {
    if (!storage || typeof token !== "string" || !token.trim()) {
        throw new Error("Invalid authentication token");
    }

    storage.setItem(ACCESS_TOKEN_KEY, token);

    if (typeof refreshToken === "string" && refreshToken.trim()) {
        storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
        storage.removeItem(REFRESH_TOKEN_KEY);
    }
};

export const clearTokens = () => {
    storage?.removeItem(ACCESS_TOKEN_KEY);
    storage?.removeItem(REFRESH_TOKEN_KEY);
};
