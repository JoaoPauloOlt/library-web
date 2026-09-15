import test from "node:test";
import assert from "node:assert/strict";

const createStorage = () => {
    const values = new Map();
    return {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, String(value)),
        removeItem: (key) => values.delete(key)
    };
};

test("auth storage saves and reads access and refresh tokens", async () => {
    globalThis.window = { localStorage: createStorage() };
    const storage = await import(`./authStorage.js?test=${Date.now()}`);

    storage.saveTokens({ token: "access-token", refreshToken: "refresh-token" });

    assert.equal(storage.getAccessToken(), "access-token");
    assert.equal(storage.getRefreshToken(), "refresh-token");
});

test("auth storage clears both authentication tokens", async () => {
    globalThis.window = { localStorage: createStorage() };
    const storage = await import(`./authStorage.js?test=${Date.now()}`);

    storage.saveTokens({ token: "access-token", refreshToken: "refresh-token" });
    storage.clearTokens();

    assert.equal(storage.getAccessToken(), null);
    assert.equal(storage.getRefreshToken(), null);
});

test("auth storage rejects an empty access token", async () => {
    globalThis.window = { localStorage: createStorage() };
    const storage = await import(`./authStorage.js?test=${Date.now()}`);

    assert.throws(
        () => storage.saveTokens({ token: "   " }),
        /Invalid authentication token/
    );
});
