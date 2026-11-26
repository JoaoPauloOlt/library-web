import test from "node:test";
import assert from "node:assert/strict";

const createStorage = (initial = {}) => {
    const values = new Map(Object.entries(initial));
    return {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, String(value)),
        removeItem: (key) => values.delete(key)
    };
};

test("auth storage keeps access token in memory and removes legacy persisted tokens", async () => {
    const localStorage = createStorage({ token: "old-access", refreshToken: "old-refresh" });
    globalThis.window = { localStorage };
    const storage = await import("./authStorage.js?sec005-memory");

    storage.saveTokens({ token: "access-token", refreshToken: "must-not-be-stored" });

    assert.equal(storage.getAccessToken(), "access-token");
    assert.equal(storage.getRefreshToken(), null);
    assert.equal(localStorage.getItem("token"), null);
    assert.equal(localStorage.getItem("refreshToken"), null);
});

test("auth storage clears the in-memory access token", async () => {
    globalThis.window = { localStorage: createStorage() };
    const storage = await import("./authStorage.js?sec005-clear");
    storage.saveTokens({ token: "access-token" });
    storage.clearTokens();
    assert.equal(storage.getAccessToken(), null);
});

test("auth storage rejects an empty access token", async () => {
    globalThis.window = { localStorage: createStorage() };
    const storage = await import("./authStorage.js?sec005-invalid");
    assert.throws(() => storage.saveTokens({ token: "   " }), /Invalid authentication token/);
});