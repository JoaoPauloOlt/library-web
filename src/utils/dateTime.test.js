import test from "node:test";
import assert from "node:assert/strict";
import {
    formatApiDate,
    formatApiDateTime,
    getSaoPauloMonthRange,
} from "./dateTime.js";

test("interprets offset-less API LocalDateTime as UTC and displays Sao Paulo time", () => {
    assert.equal(formatApiDateTime("2026-11-26T15:00:00"), "26/11/2026, 12:00");
});

test("formats UTC due date in Sao Paulo calendar date", () => {
    assert.equal(formatApiDate("2026-11-27T01:30:00"), "26/11/2026");
});

test("uses Sao Paulo month even when UTC date is already next month", () => {
    assert.deepEqual(
        getSaoPauloMonthRange(new Date("2026-03-01T01:00:00Z")),
        { from: "2026-02-01", to: "2026-03-01" },
    );
});

test("handles December year boundary", () => {
    assert.deepEqual(
        getSaoPauloMonthRange(new Date("2026-12-15T12:00:00Z")),
        { from: "2026-12-01", to: "2027-01-01" },
    );
});
