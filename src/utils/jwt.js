const decodeBase64Url = (value) => {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), "=");
    return decodeURIComponent(
        Array.from(atob(padded))
            .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
            .join("")
    );
};

export const decodeJwtPayload = (token) => {
    if (!token) return null;

    try {
        const [, payload] = token.split(".");
        if (!payload) return null;
        return JSON.parse(decodeBase64Url(payload));
    } catch {
        return null;
    }
};

export const getTokenPermissions = (token) => decodeJwtPayload(token)?.permissions ?? [];

export const getTokenGroups = (token) => decodeJwtPayload(token)?.groups ?? [];

export const hasPermission = (token, permission) =>
    getTokenPermissions(token).includes(permission);

export const hasAnyPermission = (token, permissions) =>
    permissions.some((permission) => hasPermission(token, permission));
