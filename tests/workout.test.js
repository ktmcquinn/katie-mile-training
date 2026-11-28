// Tests for lib/workout.js (plan day text -> Runna-style steps + chart segments).
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { parseWorkout } = require("../lib/workout.js");

const code = fs.readFileSync(path.join(__dirname, "../plan.js"), "utf8");
const DATA = new Function(code + "\n;return DATA;")();
const allDays = DATA.weeks.flatMap((w) => w.days);

test("every plan day parses without throwing", () => {
  for (const d of allDays) assert.doesNotThrow(() => parseWorkout(d), d.date);
});

test("run days get a kind, miles, minutes and chart segments", () => {
  for (const d of allDays) {
    const r = parseWorkout(d);
    if (r.kind === "none") continue;
    assert.ok(r.miles > 0, `${d.date} miles`);
    assert.ok(r.minutes >= 10 && r.minutes <= 140, `${d.date} minutes ${r.minutes}`);
    assert.ok(r.segments.length > 0, `${d.date} segments`);
    for (const s of r.segments) {
      assert.ok(s.min > 0 && s.level > 0 && s.level <= 1, `${d.date} bad segment`);
    }
    assert.ok(r.steps.length > 0, `${d.date} steps`);
  }
});

test("speed sessions start with a warm-up and end with a cool-down", () => {
  for (const d of allDays) {
    const r = parseWorkout(d);
    if (r.kind !== "speed") continue;
    assert.equal(r.steps[0].title, "Warm up", d.date);
    assert.equal(r.steps[r.steps.length - 1].title, "Cool down", d.date);
  }
});

test("First Speed Run = 8 x 1:00 at 5K pace with 1:00 recoveries", () => {
  const r = parseWorkout({
    title: "Speed: First Speed Run",
    detail: "NRC intervals. WU 1.5 mi. MAIN: 8x1:00 @5K (7:20), 1:00 recovery between. CD 1 mi. ~4.5 mi.",
  });
  assert.equal(r.kind, "speed");
  assert.equal(r.miles, 4.5);
  assert.equal(r.repPace, "7:20");
  const rep = r.steps.find((s) => s.type === "repeat");
  assert.equal(rep.n, 8);
  assert.equal(rep.work.amount, "1:00");
  assert.equal(rep.rec.amount, "1:00");
  assert.equal(r.segments.filter((s) => s.kind === "work").length, 8);
});

test("mixed sessions fall back to a main-set step", () => {
  const r = parseWorkout({
    title: "Speed: Speedurance",
    detail: "WU 1.5 mi. MAIN: 3x2:00 @5K / 10:00 tempo (7:40) / 3x2:00 @5K; 1:00 after 5K reps, 2:00 after tempo. CD 1 mi. ~6 mi.",
  });
  assert.ok(r.steps.some((s) => s.type === "main"));
  assert.ok(r.segments.filter((s) => s.kind === "work").length >= 7);
});

test("easy runs with strides add a stride repeat", () => {
  const r = parseWorkout({ title: "Easy + strides", detail: "3 mi easy @ 9:30/mi + 4-6x20s relaxed strides (smooth, full walk-back)." });
  assert.equal(r.kind, "easy");
  assert.equal(r.miles, 3);
  assert.ok(r.steps.some((s) => s.type === "repeat"));
});

test("strength, rest and Pilates days have no run structure", () => {
  for (const t of ["Strength A (gym)", "REST", "Pilates"]) {
    assert.equal(parseWorkout({ title: t, detail: "No run today." }).kind, "none");
  }
});
