// Structural validation for plan.js (the training plan data).
//
// plan.js is pure data (`const DATA = {…}`) loaded as a classic script in the
// browser, so there's nothing to `require`. We read the file and evaluate it in
// an isolated scope to pull out DATA, then assert the invariants the app relies
// on — this catches malformed plan edits (bad dates, wrong week count, a
// non-numeric mileage) before they ship.

const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const code = fs.readFileSync(path.join(__dirname, "../plan.js"), "utf8");
const DATA = new Function(code + "\n;return DATA;")();

const ISO = /^\d{4}-\d{2}-\d{2}$/;

test("meta has the required fields with ISO dates", () => {
  for (const k of ["name", "race_date", "plan_start", "weeks_total"]) {
    assert.ok(DATA.meta[k] != null, `meta.${k} missing`);
  }
  assert.match(DATA.meta.race_date, ISO);
  assert.match(DATA.meta.plan_start, ISO);
});

test("weeks is an array matching meta.weeks_total", () => {
  assert.ok(Array.isArray(DATA.weeks));
  assert.equal(DATA.weeks.length, DATA.meta.weeks_total);
});

test("phases is a non-empty array", () => {
  assert.ok(Array.isArray(DATA.phases) && DATA.phases.length > 0);
});

test("weeks are numbered 1..N and reference a valid phase", () => {
  DATA.weeks.forEach((w, i) => {
    assert.equal(w.num, i + 1, `week index ${i} has num ${w.num}`);
    assert.ok(Number.isInteger(w.phase) && w.phase >= 1 && w.phase <= DATA.phases.length,
      `week ${w.num} phase ${w.phase} out of range`);
    if (w.mileage != null) {
      assert.ok(Number.isFinite(w.mileage) && w.mileage >= 0,
        `week ${w.num} mileage not a non-negative number`);
    }
    assert.ok(Array.isArray(w.days) && w.days.length === 7, `week ${w.num} must have 7 days`);
  });
});

test("every day has an ISO date + title, and dates strictly increase", () => {
  let prev = "";
  for (const w of DATA.weeks) {
    for (const d of w.days) {
      assert.match(d.date, ISO, `bad date ${d.date} in week ${w.num}`);
      assert.ok(d.title && typeof d.title === "string", `day ${d.date} missing title`);
      assert.ok(d.date > prev, `dates out of order at ${d.date} (after ${prev})`);
      prev = d.date;
    }
  }
});

test("plan starts on meta.plan_start", () => {
  assert.equal(DATA.weeks[0].days[0].date, DATA.meta.plan_start);
});
