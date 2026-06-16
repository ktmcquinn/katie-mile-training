// Tests for the pure running-math in lib/training-math.js.
// Run with:  npm test   (uses Node's built-in test runner — no deps needed)

const test = require("node:test");
const assert = require("node:assert");
const TM = require("../lib/training-math.js");

// Helper: assert a time (sec) is within `tol` seconds of expected.
function near(actual, expected, tol, msg) {
  assert.ok(Math.abs(actual - expected) <= tol,
    `${msg}: expected ~${expected}s, got ${Math.round(actual)}s (tol ${tol}s)`);
}

test("fmtRaceTime formats mm:ss and h:mm:ss", () => {
  assert.equal(TM.fmtRaceTime(0), "0:00");
  assert.equal(TM.fmtRaceTime(65), "1:05");
  assert.equal(TM.fmtRaceTime(1323), "22:03");      // 5K
  assert.equal(TM.fmtRaceTime(6789), "1:53:09");    // half
  assert.equal(TM.fmtRaceTime(360.4), "6:00");      // rounds
});

test("parseTimeToSec parses mm:ss and h:mm:ss, rejects junk", () => {
  assert.equal(TM.parseTimeToSec("22:03"), 1323);
  assert.equal(TM.parseTimeToSec("1:53:09"), 6789);
  assert.equal(TM.parseTimeToSec("6:00"), 360);
  assert.equal(TM.parseTimeToSec(""), null);
  assert.equal(TM.parseTimeToSec("abc"), null);
  assert.equal(TM.parseTimeToSec("90"), null);       // needs at least mm:ss
});

test("fmt/parse round-trip", () => {
  for (const s of [0, 59, 60, 1323, 3599, 3600, 6789]) {
    assert.equal(TM.parseTimeToSec(TM.fmtRaceTime(s)), s);
  }
});

test("vdotOf matches Daniels for a 20:00 5K (~49.8)", () => {
  const v = TM.vdotOf(TM.MI_5K, 20 * 60);
  near(v, 49.8, 0.4, "VDOT from 20:00 5K");
});

test("timeAtVdot round-trips with vdotOf", () => {
  const v = TM.vdotOf(TM.MI_5K, 20 * 60);
  near(TM.timeAtVdot(TM.MI_5K, v), 20 * 60, 1, "5K time back from its own VDOT");
});

test("VDOT cross-distance equivalents match Daniels tables (20:00 5K)", () => {
  const v = TM.vdotOf(TM.MI_5K, 20 * 60);
  near(TM.timeAtVdot(TM.MI_10K, v), 41 * 60 + 24, 20, "10K");      // Daniels ~41:24
  near(TM.timeAtVdot(TM.MI_HALF, v), 91 * 60 + 35, 45, "half");    // Daniels ~1:31:35
  near(TM.timeAtVdot(TM.MI_MAR, v), 3 * 3600 + 10 * 60, 120, "marathon"); // Daniels ~3:10
});

test("faster effort yields higher VDOT and faster projections", () => {
  const slow = TM.vdotOf(TM.MI_5K, 24 * 60);
  const fast = TM.vdotOf(TM.MI_5K, 20 * 60);
  assert.ok(fast > slow, "faster 5K -> higher VDOT");
  assert.ok(TM.timeAtVdot(TM.MI_HALF, fast) < TM.timeAtVdot(TM.MI_HALF, slow),
    "higher VDOT -> faster half");
});

test("Katie's Garmin baseline produces sane VDOTs (speed > endurance)", () => {
  const v5k = TM.vdotOf(TM.MI_5K, 22 * 60 + 3);
  const vHalf = TM.vdotOf(TM.MI_HALF, 113 * 60 + 9);
  assert.ok(v5k > vHalf, "5K VDOT should exceed half VDOT for a speed-skewed profile");
  // mile estimated from her 5K-level fitness should land near her ~6:30 anchor
  near(TM.timeAtVdot(TM.MI_MILE, v5k), 6 * 60 + 30, 12, "mile estimate from 5K fitness");
});
