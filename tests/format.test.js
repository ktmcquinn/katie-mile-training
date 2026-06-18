// Tests for lib/format.js (pure formatting / date / aggregation helpers).
const test = require("node:test");
const assert = require("node:assert");
const F = require("../lib/format.js");

test("todayISO returns yyyy-mm-dd", () => {
  assert.match(F.todayISO(), /^\d{4}-\d{2}-\d{2}$/);
});

test("tsNewer compares ISO timestamps (incl. tz notation)", () => {
  assert.equal(F.tsNewer("2026-06-16T10:00:00Z", "2026-06-16T09:00:00Z"), true);
  assert.equal(F.tsNewer("2026-06-16T09:00:00Z", "2026-06-16T10:00:00Z"), false);
  assert.equal(F.tsNewer("2026-06-16T10:00:00+00:00", "2026-06-16T09:00:00Z"), true);
  assert.equal(F.tsNewer("2026-01-01", null), true);   // valid a vs unknown b -> a wins
  assert.equal(F.tsNewer("garbage", "2026-01-01"), false); // unparseable a -> older
});

test("fmtPace formats seconds-per-mile, null on bad input", () => {
  assert.equal(F.fmtPace(480), "8:00/mi");
  assert.equal(F.fmtPace(509), "8:29/mi");
  assert.equal(F.fmtPace(0), null);
  assert.equal(F.fmtPace(Infinity), null);
  assert.equal(F.fmtPace(undefined), null);
});

test("fmtDuration formats seconds, empty on falsy", () => {
  assert.equal(F.fmtDuration(125), "2:05");
  assert.equal(F.fmtDuration(0), "");
});

test("sumMacros totals calories + macros and ignores junk", () => {
  const meals = [
    { cal: 350, p: 20, c: 40, f: 10, fiber: 5, na: 300 },
    { cal: "150", p: "5", c: "20", f: "3", fiber: "2", na: "100" },
    { cal: null, p: undefined, c: "x" },
  ];
  const t = F.sumMacros(meals);
  assert.equal(t.cal, 500);
  assert.equal(t.p, 25);
  assert.equal(t.c, 60);
  assert.equal(t.f, 13);
  assert.equal(t.fiber, 7);
  assert.equal(t.na, 400);
});
