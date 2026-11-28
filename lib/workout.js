// workout.js — turns a plan day's text into a Runna-style workout structure:
// ordered steps (warm up → main set → cool down) for the workout breakdown,
// and effort "segments" for the little bar chart.
//
// Same dual-use pattern as lib/format.js: loads as a classic <script> before
// app.js (shared global scope) AND exports for Node so tests/ can verify it.
// Pure: no DOM, no storage. Input is a plan day object { title, detail }.

const WK_EASY_MIN_PER_MI = 9.5; // rough easy pace used for time estimates

// Effort level (0..1) for each pace zone — drives bar height in the chart.
const WK_LEVEL = {
  easy: 0.3,
  recovery: 0.2,
  steady: 0.42,
  half: 0.72,
  tempo: 0.7,
  "10K": 0.8,
  "5K": 0.88,
  hard: 0.9,
  mile: 0.97,
  best: 1,
};
const WK_ZONE_LABEL = {
  mile: "Mile pace",
  "5K": "5K pace",
  "10K": "10K pace",
  tempo: "Tempo",
  half: "Half-marathon pace",
  best: "All-out",
  hard: "Hard",
  recovery: "Recovery pace",
};

function wkNum(s) { return s == null ? null : parseFloat(s); }
function wkClock(s) {
  // "1:30" -> 1.5 (minutes)
  const m = String(s).match(/^(\d+):(\d{2})$/);
  return m ? parseInt(m[1], 10) + parseInt(m[2], 10) / 60 : null;
}
function wkFmtMin(min) {
  const m = Math.floor(min);
  const s = Math.round((min - m) * 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
function wkZone(tok) {
  const t = String(tok || "").toLowerCase();
  if (/best/.test(t)) return "best";
  if (/mile/.test(t)) return "mile";
  if (/5k/.test(t)) return "5K";
  if (/10k/.test(t)) return "10K";
  if (/half|hm/.test(t)) return "half";
  if (/tempo|threshold/.test(t)) return "tempo";
  if (/recovery/.test(t)) return "recovery";
  if (/hard/.test(t)) return "hard";
  return "hard";
}
// Miles from "WU 1.5 mi" / "2K WU" style fragments.
function wkMiles(text, which) {
  const a = text.match(new RegExp(which + "\\s+(\\d+(?:\\.\\d+)?)\\s*mi", "i"));
  if (a) return { mi: wkNum(a[1]), label: `${wkNum(a[1])} mi` };
  const b = text.match(new RegExp("(\\d+(?:\\.\\d+)?)K\\s+" + which, "i"));
  if (b) return { mi: Math.round(wkNum(b[1]) * 0.621 * 100) / 100, label: `${wkNum(b[1])} km` };
  return { mi: 0, label: "" };
}
// A pace (not a duration): "(7:20)", "(~8:15/mi)", "@ 7:55/mi", "than 9:30/mi".
function wkFirstPace(text) {
  const t = String(text);
  const m = t.match(/\(~?(\d{1,2}:\d{2})(?:\/mi)?[)\s/]/) || t.match(/(\d{1,2}:\d{2})\/mi/);
  return m ? m[1] : null;
}

// Build effort blocks for a free-form main set like
// "3x[1:30 @5K / 1:30 @10K / 1:30 @mile]" or "1:00 @mile / 2:00 @5K ...".
function wkGenericBlocks(main) {
  // Keep the parts that describe work; drop "1:00 recovery after …" notes.
  const body = main
    .split(/;|\.\s/)
    .map((p) => p.trim())
    .filter((p) => p && /\d+:\d{2}/.test(p) && !/^(\d+:\d{2}(\s*\/\s*\d+:\d{2})*\s*(recovery|after|easy jog)|recovery\s+\d)/i.test(p))
    .join(" / ");
  let mult = 1;
  let inner = body;
  const pre = body.match(/^(\d+)x\[(.*)\]/);
  const post = body.match(/^\[(.*)\]\s*x(\d+)/);
  if (pre) { mult = parseInt(pre[1], 10); inner = pre[2]; }
  else if (post) { mult = parseInt(post[2], 10); inner = post[1]; }
  const re = /(?:(\d+)x)?(\d+:\d{2})\s*(?:uphill\s*)?(@\s*[A-Za-z0-9 ]+?|recovery pace|tempo|hard|easy)(?=[\s,/+→)\]]|$)/g;
  const once = [];
  let m;
  while ((m = re.exec(inner))) {
    const reps = m[1] ? parseInt(m[1], 10) : 1;
    const dur = wkClock(m[2]);
    const zone = /easy/i.test(m[3]) ? "recovery" : wkZone(m[3]);
    for (let i = 0; i < reps; i++) once.push({ min: dur, zone });
  }
  const out = [];
  for (let r = 0; r < mult; r++) {
    once.forEach((b, i) => {
      out.push({ min: b.min, level: WK_LEVEL[b.zone] || 0.85, kind: b.zone === "recovery" ? "recovery" : "work" });
      const last = r === mult - 1 && i === once.length - 1;
      if (!last && b.zone !== "recovery") out.push({ min: 1, level: WK_LEVEL.recovery, kind: "recovery" });
    });
  }
  return out;
}

function parseWorkout(day) {
  const title = String((day && day.title) || "");
  const detail = String((day && day.detail) || "");
  const res = { kind: "none", miles: 0, minutes: 0, segments: [], steps: [], repPace: null };
  const totalM = detail.match(/~(\d+(?:\.\d+)?)\s*mi/);
  const leadM = detail.match(/(\d+(?:\.\d+)?)\s*mi\b/);

  // ---- Races ----
  if (/🏁/.test(title) || /RACE DAY/i.test(detail)) {
    res.kind = "race";
    if (/10K/i.test(title)) {
      res.miles = totalM ? wkNum(totalM[1]) : 9;
      res.segments = [
        { min: 2 * WK_EASY_MIN_PER_MI, level: WK_LEVEL.easy, kind: "easy" },
        { min: 46, level: WK_LEVEL["5K"], kind: "work" },
        { min: WK_EASY_MIN_PER_MI, level: WK_LEVEL.easy, kind: "easy" },
      ];
      res.steps = [
        { type: "easy", title: "Warm up", sub: "Easy + 4 strides", amount: "2 mi" },
        { type: "work", title: "Race 10K", sub: "Hard but even · ~7:20/mi", amount: "6.2 mi" },
        { type: "easy", title: "Cool down", sub: "Easy", amount: "1 mi" },
      ];
    } else {
      res.miles = 13.1;
      res.segments = [{ min: 100, level: WK_LEVEL.half, kind: "work" }];
      res.steps = [
        { type: "work", title: "First 5K", sub: "Controlled · ~7:40/mi", amount: "3.1 mi" },
        { type: "work", title: "Settle in", sub: "Goal pace · 7:35/mi", amount: "to 10 mi" },
        { type: "work", title: "Empty the tank", sub: "Whatever's left", amount: "3.1 mi" },
      ];
    }
    res.minutes = Math.round(res.segments.reduce((a, s) => a + s.min, 0));
    return res;
  }

  // ---- Speed sessions (WU … MAIN: … CD …) ----
  const mainM = detail.match(/MAIN:\s*([\s\S]*?)(?:\s+(?:CD\s+\d|\d+(?:\.\d+)?K\s+CD)|$)/i);
  if (/^Speed:/i.test(title) && mainM) {
    res.kind = "speed";
    const main = mainM[1].trim().replace(/\.$/, "");
    const wuInfo = wkMiles(detail, "WU");
    const cdInfo = wkMiles(detail, "CD");
    const wu = wuInfo.mi, cd = cdInfo.mi;
    res.miles = totalM ? wkNum(totalM[1]) : wu + cd + 2;
    res.repPace = wkFirstPace(main);
    const segs = [];
    const steps = [];
    if (wu) {
      segs.push({ min: wu * WK_EASY_MIN_PER_MI, level: WK_LEVEL.easy, kind: "easy" });
      steps.push({ type: "easy", title: "Warm up", sub: "Easy, conversational", amount: wuInfo.label });
    }
    let m;
    if ((m = main.match(/^(\d+):(\d{2})\s*fartlek\s*[—-]\s*(\d+:\d{2})\s*hard\s*\/\s*(\d+:\d{2})\s*easy/i))) {
      // Fartlek: alternate hard/easy for the given time
      const total = parseInt(m[1], 10) + parseInt(m[2], 10) / 60;
      const h = wkClock(m[3]), e = wkClock(m[4]);
      const n = Math.max(1, Math.round(total / (h + e)));
      for (let i = 0; i < n; i++) {
        segs.push({ min: h, level: WK_LEVEL.hard, kind: "work" });
        segs.push({ min: e, level: WK_LEVEL.recovery, kind: "recovery" });
      }
      steps.push({ type: "repeat", n, work: { title: "Hard", sub: "Strong effort, by feel", amount: m[3] }, rec: { title: "Easy", sub: "Keep jogging", amount: m[4] } });
    } else if ((m = main.match(/^(\d+)x(\d+:\d{2})\s*(hard|@\s*(?:tempo|mile|5K|10K)[^,(]*)?/i)) && !/^\d+x\[/.test(main) && (main.match(/\d+x\d+:\d{2}/g) || []).length === 1 && !/\btempo\b.*\d+x/i.test(main.replace(/^\d+x\d+:\d{2}\s*@\s*tempo/i, ""))) {
      // Simple reps: "8x1:00 @5K (7:20), 1:00 recovery between"
      const n = parseInt(m[1], 10);
      const work = wkClock(m[2]);
      const zone = wkZone(m[3] || "hard");
      const recM = main.match(/(\d+:\d{2})\s*(?:recovery|easy jog|jog|easy)/i);
      const rec = recM ? wkClock(recM[1]) : 1;
      for (let i = 0; i < n; i++) {
        segs.push({ min: work, level: WK_LEVEL[zone], kind: "work" });
        if (i < n - 1) segs.push({ min: rec, level: WK_LEVEL.recovery, kind: "recovery" });
      }
      const pace = res.repPace ? ` · ${res.repPace}/mi` : "";
      steps.push({
        type: "repeat",
        n,
        work: { title: zone === "tempo" ? "Tempo" : "Run fast", sub: `${WK_ZONE_LABEL[zone] || "Hard"}${pace}`, amount: wkFmtMin(work) },
        rec: { title: "Recover", sub: "Easy jog or walk", amount: wkFmtMin(rec) },
      });
    } else if ((m = main.match(/^(\d+):(\d{2})\s*tempo/i))) {
      const t = parseInt(m[1], 10) + parseInt(m[2], 10) / 60;
      segs.push({ min: t, level: WK_LEVEL.tempo, kind: "work" });
      steps.push({ type: "work", title: "Tempo", sub: res.repPace ? `Comfortably hard · ${res.repPace}/mi` : "Comfortably hard", amount: wkFmtMin(t) });
    } else if ((m = main.match(/^(\d+)K\s*\((\d+(?:\.\d+)?)\s*mi\)\s*tempo/i))) {
      const mi = wkNum(m[2]);
      segs.push({ min: mi * 7.7, level: WK_LEVEL.tempo, kind: "work" });
      steps.push({ type: "work", title: "Tempo", sub: res.repPace ? `Comfortably hard · ${res.repPace}/mi` : "Comfortably hard", amount: `${mi} mi` });
    } else if ((m = main.match(/^(\d+):(\d{2})\s*progression/i))) {
      const t = parseInt(m[1], 10) + parseInt(m[2], 10) / 60;
      [0.6, 0.68, 0.76, 0.84].forEach((lv) => segs.push({ min: t / 4, level: lv, kind: "work" }));
      steps.push({ type: "work", title: "Progression", sub: "Start at tempo, finish near 10K pace", amount: wkFmtMin(t) });
    } else {
      const blocks = wkGenericBlocks(main);
      if (blocks.length) segs.push(...blocks);
      else segs.push({ min: 15, level: WK_LEVEL.hard, kind: "work" });
      const mins = (blocks.length ? blocks : [{ min: 15 }]).reduce((a, b) => a + b.min, 0);
      steps.push({ type: "main", title: "Main set", sub: main, amount: `~${Math.round(mins)} min` });
    }
    if (cd) {
      segs.push({ min: cd * WK_EASY_MIN_PER_MI, level: WK_LEVEL.easy, kind: "easy" });
      steps.push({ type: "easy", title: "Cool down", sub: "Easy, conversational", amount: cdInfo.label });
    }
    res.segments = segs;
    res.steps = steps;
    res.minutes = Math.round(segs.reduce((a, s) => a + s.min, 0) / 5) * 5;
    return res;
  }

  // ---- Long runs ----
  if (/LONG/i.test(title)) {
    res.kind = "long";
    const dr = detail.match(/(\d+(?:\.\d+)?)\s*mi easy,\s*then\s*(\d+(?:\.\d+)?)\s*mi[^@]*@[^0-9]*(\d+:\d{2})[^,]*,\s*(\d+(?:\.\d+)?)\s*mi easy/i);
    if (dr) {
      const a = wkNum(dr[1]), b = wkNum(dr[2]), c = wkNum(dr[4]);
      res.miles = a + b + c;
      res.segments = [
        { min: a * WK_EASY_MIN_PER_MI, level: WK_LEVEL.easy, kind: "easy" },
        { min: b * 7.6, level: WK_LEVEL.half, kind: "work" },
        { min: c * WK_EASY_MIN_PER_MI, level: WK_LEVEL.easy, kind: "easy" },
      ];
      res.repPace = dr[3];
      res.steps = [
        { type: "easy", title: "Warm up", sub: "Easy", amount: `${a} mi` },
        { type: "work", title: "Goal half pace", sub: `Race rehearsal · ${dr[3]}/mi`, amount: `${b} mi` },
        { type: "easy", title: "Cool down", sub: "Easy", amount: `${c} mi` },
      ];
    } else {
      const mi = leadM ? wkNum(leadM[1]) : 0;
      res.miles = mi;
      const startPace = wkFirstPace(detail);
      const finish = mi >= 4 ? Math.min(2, Math.round(mi * 0.2)) : 1;
      res.segments = [
        { min: (mi - finish) * WK_EASY_MIN_PER_MI, level: WK_LEVEL.easy, kind: "easy" },
        { min: finish * 9, level: WK_LEVEL.steady, kind: "work" },
      ];
      res.steps = [
        { type: "easy", title: "Easy", sub: startPace ? `Start slower than ${startPace}/mi` : "Conversational", amount: `${mi - finish} mi` },
        { type: "work", title: "Finish a bit quicker", sub: "Still controlled — not a race", amount: `${finish} mi` },
      ];
    }
    res.minutes = Math.round(res.segments.reduce((a, s) => a + s.min, 0) / 5) * 5;
    return res;
  }

  // ---- Easy / recovery / strides ----
  if (leadM && !/^(Strength|Pilates|REST)/i.test(title)) {
    res.kind = "easy";
    const mi = wkNum(leadM[1]);
    res.miles = mi;
    const pace = wkFirstPace(detail);
    res.segments = [{ min: mi * WK_EASY_MIN_PER_MI, level: WK_LEVEL.easy, kind: "easy" }];
    res.steps = [{ type: "easy", title: /shakeout/i.test(detail) ? "Shakeout" : "Easy run", sub: pace ? `${pace}/mi or slower · conversational` : "Conversational", amount: `${mi} mi` }];
    if (/strides/i.test(title + " " + detail)) {
      for (let i = 0; i < 5; i++) {
        res.segments.push({ min: 0.35, level: WK_LEVEL.mile, kind: "work" });
        res.segments.push({ min: 0.6, level: WK_LEVEL.recovery, kind: "recovery" });
      }
      res.steps.push({ type: "repeat", n: "4–6", work: { title: "Stride", sub: "Smooth and fast, not a sprint", amount: "0:20" }, rec: { title: "Walk back", sub: "Full recovery", amount: "~0:40" } });
    }
    res.minutes = Math.round(res.segments.reduce((a, s) => a + s.min, 0) / 5) * 5;
    return res;
  }

  return res;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { parseWorkout, WK_LEVEL };
}
