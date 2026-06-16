// training-math.js — pure, dependency-free running math.
//
// Dual-use by design:
//   • In the browser it loads as a classic <script> BEFORE app.js, so its
//     top-level const/function bindings live in the shared global scope and
//     app.js can reference them by bare name (same pattern as plan.js).
//   • In Node it exports via module.exports, so tests/ can import and verify
//     it directly. This is the single source of truth for the race-prediction
//     math — keep new pure helpers here so they stay testable.
//
// Nothing in here touches the DOM, localStorage, or app state. If a helper
// needs those, it belongs in app.js, not this file.

// ---- Distance constants (miles) ----
const MILE_M = 1609.344;
const MI_MILE = 1;
const MI_5K = 3.106855;
const MI_10K = 6.213712;
const MI_HALF = 13.109375;
const MI_MAR = 26.21875;

// ---- VDOT engine (Daniels–Gilbert) ----
// %VO2max sustainable for an effort of tMin minutes.
function pctVO2max(tMin) {
  return 0.8 + 0.1894393 * Math.exp(-0.012778 * tMin)
             + 0.2989558 * Math.exp(-0.1932605 * tMin);
}
// O2 cost (ml/kg/min) of running at v meters/min.
function o2Cost(vMetersPerMin) {
  return -4.60 + 0.182258 * vMetersPerMin + 0.000104 * vMetersPerMin * vMetersPerMin;
}
// VDOT (VO2max-equivalent) implied by covering distMi in sec.
function vdotOf(distMi, sec) {
  const tMin = sec / 60;
  const v = (distMi * MILE_M) / tMin;
  return o2Cost(v) / pctVO2max(tMin);
}
// Predicted time (sec) to race distMi at a VDOT — binary search, since
// vdotOf is monotonic decreasing in time.
function timeAtVdot(distMi, vdot) {
  let lo = 10, hi = 36000;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (vdotOf(distMi, mid) > vdot) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

// ---- Time formatting / parsing ----
// Race times can exceed an hour (half marathon) — h:mm:ss when needed.
function fmtRaceTime(totalSec) {
  totalSec = Math.round(totalSec);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}
// Parse "mm:ss" or "h:mm:ss" into seconds; null if malformed.
function parseTimeToSec(str) {
  const parts = String(str || "").trim().split(":").map((x) => parseInt(x, 10));
  if (parts.some(isNaN) || parts.length < 2 || parts.length > 3) return null;
  return parts.length === 3
    ? parts[0] * 3600 + parts[1] * 60 + parts[2]
    : parts[0] * 60 + parts[1];
}

// Node export only — in the browser `module` is undefined and this is skipped,
// leaving the bindings above in the shared global script scope for app.js.
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    MILE_M, MI_MILE, MI_5K, MI_10K, MI_HALF, MI_MAR,
    pctVO2max, o2Cost, vdotOf, timeAtVdot, fmtRaceTime, parseTimeToSec,
  };
}
