import test from "node:test";
import assert from "node:assert/strict";
import {
    decodeJwtPayload,
    getTokenGroups,
    getTokenPermissions,
    hasAnyPermission,
    hasPermission
} from "./jwt.js";

const createToken = (payload) => {
    const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
    return `${encode({ alg: "none", typ: "JWT" })}.${encode(payload)}.`;
};

test("decodes JWT payload claims", () => {
    const token = createToken({
        sub: "7",
        name: "João",
        email: "joao@example.com",
        groups: ["USER"],
        permissions: ["BOOK_READ", "LOAN_CREATE"]
    });

    assert.deepEqual(decodeJwtPayload(token), {
        sub: "7",
        name: "João",
        email: "joao@example.com",
        groups: ["USER"],
        permissions: ["BOOK_READ", "LOAN_CREATE"]
    });
});

test("reads groups and permissions safely", () => {
    const token = createToken({
        groups: ["LIBRARIAN"],
        permissions: ["LOAN_READ_ALL", "BOOK_CREATE"]
    });

    assert.deepEqual(getTokenGroups(token), ["LIBRARIAN"]);
    assert.deepEqual(getTokenPermissions(token), ["LOAN_READ_ALL", "BOOK_CREATE"]);
    assert.equal(hasPermission(token, "LOAN_READ_ALL"), true);
    assert.equal(hasPermission(token, "USER_ADMIN"), false);
    assert.equal(hasAnyPermission(token, ["USER_ADMIN", "BOOK_CREATE"]), true);
});

test("returns safe defaults for invalid tokens", () => {
    assert.equal(decodeJwtPayload("invalid"), null);
    assert.deepEqual(getTokenGroups("invalid"), []);
    assert.deepEqual(getTokenPermissions("invalid"), []);
    assert.equal(hasPermission("invalid", "BOOK_READ"), false);
});
