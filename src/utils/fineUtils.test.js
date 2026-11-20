import test from "node:test";
import assert from "node:assert/strict";
import { fineStatusLabel, formatFineAmount } from "./fineUtils.js";

test("formats fine amounts as Brazilian currency", () => {
    assert.equal(formatFineAmount("6.00"), "R$ 6,00");
});

test("translates known fine statuses", () => {
    assert.equal(fineStatusLabel("OPEN"), "Em aberto");
    assert.equal(fineStatusLabel("WAIVED"), "Isenta");
});

test("preserves unknown statuses without inventing a label", () => {
    assert.equal(fineStatusLabel("PENDING"), "PENDING");
});
