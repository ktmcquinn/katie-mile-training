// format.js — pure formatting / date / aggregation helpers.
//
// Same dual-use pattern as lib/training-math.js: loads as a classic <script>
// before app.js (shared global scope) AND exports for Node so tests/ can
// verify it. Nothing here touches the DOM, localStorage, or app state.

// Today's date as an ISO yyyy-mm-dd string.
function todayISO() {
  const t = new Date();
  return t.toISOString().slice(0, 10);
}

// True when timestamp string `a` is strictly newer than `b`. Uses Date.parse
// so ISO strings with different timezone notation compare correctly. A missing
// /unparseable `a` is treated as older; a missing `b` as older than any real a.
function tsNewer(a, b) {
  const ta = Date.parse(a), tb = Date.parse(b);
  if (isNaN(ta)) return false;
  if (isNaN(tb)) return true;
  return ta > tb;
}

// Seconds-per-mile -> "m:ss/mi" (null for missing/invalid input).
function fmtPace(secPerMile) {
  if (!secPerMile || !isFinite(secPerMile)) return null;
  const m = Math.floor(secPerMile / 60);
  const s = Math.round(secPerMile % 60);
  return `${m}:${String(s).padStart(2, "0")}/mi`;
}

// Seconds -> "m:ss" ("" for falsy input).
function fmtDuration(totalSec) {
  if (!totalSec) return "";
  const m = Math.floor(totalSec / 60);
  const s = Math.round(totalSec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Sum a list of meal objects into calorie + macro totals.
function sumMacros(meals) {
  const totals = { cal: 0, p: 0, c: 0, f: 0, fiber: 0, na: 0 };
  for (const m of meals) {
    totals.cal += parseFloat(m.cal) || 0;
    totals.p += parseFloat(m.p) || 0;
    totals.c += parseFloat(m.c) || 0;
    totals.f += parseFloat(m.f) || 0;
    totals.fiber += parseFloat(m.fiber) || 0;
    totals.na += parseFloat(m.na) || 0;
  }
  return totals;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { todayISO, tsNewer, fmtPace, fmtDuration, sumMacros };
}
