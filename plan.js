// Training plan data — Riga Half Marathon (Sun May 16, 2027), goal sub-1:40.
//
// Structure: an 11-week rebuild + base lead-in, then the Nike Run Club
// 14-week Half Marathon plan (NRC "14 weeks to go" = week 12), with volume
// raised to peak ~35 mi/week and a 10K tune-up in late March.
// The previous Dresden plan is archived in plan-dresden-2026.js (not loaded).
//
// ===================== HOW TO ADJUST THE PLAN =====================
// Each week is ONE week(...) call with 7 day helpers [Mon..Sun]. Dates and
// weekday names fill in automatically from `start`. Helpers:
//   E(p, mi, note)      recovery run            ST(p, mi, strength) easy + strides
//   EB(p, mi)           recovery run + Strength B (home)
//   SP(title, detail, strength)  speed run (NRC workouts)
//   L(p, mi, note)      progression long run    LD(detail) long run, custom text
//   SA(note) Strength A (gym)   SC() Strength C (gym)   SL() Strength LIGHT
//   R(note)  rest       PL() Pilates           RC(title, detail) race day
// `p` is the NRC pace-chart row in use (P0 / P1 / P2 below).
// Weekly layout (Katie): Mon speed or easy | Tue gym, no run | Wed recovery |
// Thu speed + Strength B | Fri recovery | Sat long | Sun Pilates (alt weeks) / rest
// =================================================================

const DATA = (function () {
  // ---- NRC pace-chart rows (mile best → paces per mile) ----
  // P0: current fitness (~1:47 Dresden) — NRC 7:00 row
  // P1: mid-build — between the 7:00 and 6:30 rows
  // P2: goal — NRC 6:30 row (1:40:00 half). Confirm with the 10K tune-up:
  //     10K ≤ ~45:45 → keep P2. 46-48 min → use P1 paces and aim ~1:42.
  const P0 = { rec: "9:30", tempo: "8:15", k10: "7:55", k5: "7:40", mile: "7:00", hm: "8:20" };
  const P1 = { rec: "9:00", tempo: "7:55", k10: "7:35", k5: "7:20", mile: "6:45", hm: "7:55" };
  const P2 = { rec: "8:45", tempo: "7:40", k10: "7:20", k5: "7:05", mile: "6:30", hm: "7:35" };

  // ---- Strength (hip mobility + hip strength + calf/Achilles in every session) ----
  const SA_TXT = "STRENGTH A (Gym, ~50 min): 90/90 hip switches 2x6/side (warm-up); trap-bar deadlift 3x5 @ RPE 7; Bulgarian split squat 3x6-8/leg; heavy standing calf raise 4x6-8 (3s lower); seated calf raise 3x10-12; hip airplane 3x5/side (hold a rack at first); Copenhagen plank 3x20-30s/side; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side. Rest 90-120s on heavy sets; leave 2-3 reps in the tank.";
  const SB_TXT = "STRENGTH B (Home, ~35 min): 90/90 hip lift-offs 2x5/side; single-leg DB RDL 3x8/leg; DB step-up or split squat 3x8/leg; eccentric heel drops 3x12/side straight knee + 3x12/side bent knee (3s lower off a step); single-leg glute bridge 3x10/leg; hip airplane 2x5/side; Copenhagen plank 3x20s/side; banded monster walk 2x15 steps; tibialis raise 2x20.";
  const SC_TXT = "STRENGTH C (Gym, ~40 min): 90/90 hip switches 2x6/side; leg press 3x8-10; step-up with knee drive 3x8/leg; heavy seated calf raise 4x8 (3s lower); single-leg calf raise 3x10/leg; hip thrust 3x8; cable hip abduction 2x12/side; hip airplane 3x5/side; Copenhagen plank 3x20s/side; seated cable row 3x10.";
  const SL_TXT = "STRENGTH LIGHT (~25 min): 90/90 hip switches 2x5/side; single-leg glute bridge 2x10/leg; hip airplane 2x4/side; Copenhagen plank 2x15s/side; calf raise 2x12 (light, smooth); side plank 2x30s/side; push-up 2x10. RPE 5-6 — sharp, not sore.";

  const RUN = ["achilles_iso", "pre_run", "post_run"];
  const KEY = ["achilles_iso", "hip_protocol", "pre_run", "post_run"];
  const MOB = ["mobility_daily"];
  const PIL = ["pilates", "mobility_daily"];

  // ---- day builders ----
  const E = (p, mi, note) => ({ title: "Recovery run", detail: mi + " mi recovery @ " + p.rec + "/mi or slower — conversational. Start easy, finish a touch quicker." + (note ? " " + note : ""), routines: RUN });
  const EB = (p, mi, note) => ({ title: "Recovery run + Strength B", detail: mi + " mi recovery @ " + p.rec + "/mi or slower, then Strength B (home)." + (note ? " " + note : ""), routines: RUN, strength: SB_TXT });
  const ST = (p, mi, strength) => ({ title: "Easy + strides" + (strength ? " + Strength" : ""), detail: mi + " mi easy @ " + p.rec + "/mi + 4-6x20s relaxed strides (smooth, full walk-back)." + (strength ? " Strength after." : ""), routines: RUN, strength: strength || null });
  const SP = (title, detail, strength) => ({ title: "Speed: " + title, detail, routines: KEY, strength: strength || null });
  const L = (p, mi, note) => ({ title: "LONG RUN", detail: mi + " mi progression long run: start slower than " + p.rec + "/mi, settle in, finish the last 1-2 mi a bit quicker. Averages out around recovery pace." + (note ? " " + note : ""), routines: KEY });
  const LD = (detail) => ({ title: "LONG RUN", detail, routines: KEY });
  const SA = (note) => ({ title: "Strength A (gym)", detail: "No run today. Strength A at the gym." + (note ? " " + note : " Moderate loads — Wednesday should still feel good."), routines: MOB, strength: SA_TXT });
  const SC = () => ({ title: "Strength C (gym)", detail: "No run. Strength C — calf/Achilles + hip day. Slow, heavy calf raises.", routines: MOB, strength: SC_TXT });
  const SL = () => ({ title: "Strength LIGHT", detail: "No run. Light maintenance strength — sharp, not sore.", routines: MOB, strength: SL_TXT });
  const R = (note) => ({ title: "REST", detail: note || "Full rest + daily mobility. Gentle calf/Achilles stretch, easy walk if restless.", routines: MOB });
  const PL = () => ({ title: "Pilates", detail: "Pilates class (10 or 11am). No run — counts as core + hip work.", routines: PIL });
  const RC = (title, detail) => ({ title, detail, routines: KEY });

  // ---- week builder: fills dates + weekday names from the Monday start ----
  function week(num, m, partials) {
    const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const base = new Date(m.start + "T00:00:00");
    const days = partials.map((p, i) => {
      const d = new Date(base); d.setDate(base.getDate() + i);
      const date = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      return { date, day_name: names[i], title: p.title, detail: p.detail, routines: p.routines || null, strength: p.strength || null };
    });
    return { num, phase: m.phase, mileage: m.miles, theme: m.theme, days, start_date: days[0].date, end_date: days[6].date };
  }

  const WEEKS = [
  // ===== PHASE 1 — REBUILD (4 runs + 3 strength; Pilates counts on class weeks) =====
  week(1, {phase:1, miles:10, start:"2026-11-23", theme:"Ease back in. All easy — run/walk is fine if the Achilles is stiff. Learn the lifts at moderate loads."}, [
      E(P0, 2.5, "Run/walk is fine."),
      SA("First week back — light loads, learn the movements."),
      EB(P0, 2),
      R(),
      E(P0, 2.5),
      L(P0, 3),
      PL(),
  ]),
  week(2, {phase:1, miles:12, start:"2026-11-30", theme:"Still all easy. Calf isometrics before every run."}, [
      E(P0, 3),
      SA(),
      EB(P0, 2.5),
      R(),
      E(P0, 2.5),
      L(P0, 4),
      SC(),
  ]),
  week(3, {phase:1, miles:14, start:"2026-12-07", theme:"Strides start Friday — smooth and relaxed, not sprints."}, [
      E(P0, 3),
      SA(),
      EB(P0, 3),
      R(),
      ST(P0, 3),
      L(P0, 5),
      PL(),
  ]),
  week(4, {phase:1, miles:16, start:"2026-12-14", theme:"Building. Achilles check: still tight mid-December? Book a physio before base phase."}, [
      E(P0, 4),
      SA(),
      EB(P0, 3),
      R(),
      ST(P0, 3),
      L(P0, 6),
      SC(),
  ]),
  week(5, {phase:1, miles:14, start:"2026-12-21", theme:"Christmas week — lighter. Lift at ~70% loads."}, [
      E(P0, 3),
      SA("Lighter week — ~70% loads."),
      EB(P0, 3),
      R(),
      ST(P0, 3),
      L(P0, 5),
      PL(),
  ]),
  week(6, {phase:1, miles:18, start:"2026-12-28", theme:"Last rebuild week. Next week the 5th run comes in and Strength C drops."}, [
      E(P0, 4),
      SA(),
      EB(P0, 4),
      R(),
      ST(P0, 3),
      L(P0, 7),
      SC(),
  ]),

  // ===== PHASE 2 — AEROBIC BASE (5 runs + 2 strength) =====
  week(7, {phase:2, miles:20, start:"2027-01-04", theme:"5 runs a week from here. Monday = strides only this week."}, [
      ST(P0, 4),
      SA(),
      E(P0, 3),
      ST(P0, 3, SB_TXT),
      E(P0, 3),
      L(P0, 7),
      PL(),
  ]),
  week(8, {phase:2, miles:22, start:"2027-01-11", theme:"First light speed — fartlek by feel."}, [
      SP("fartlek 8x1:00", "WU 1 mi. MAIN: 8x1:00 @10K effort (~" + P0.k10 + "), 1:00 easy jog between. CD 1 mi. ~4.5 mi."),
      SA(),
      E(P0, 3),
      ST(P0, 3, SB_TXT),
      E(P0, 3.5),
      L(P0, 8),
      R(),
  ]),
  week(9, {phase:2, miles:24, start:"2027-01-18", theme:"First tempo. Comfortably hard, not a race."}, [
      SP("tempo 3x8:00", "WU 1.5 mi. MAIN: 3x8:00 @ tempo (~" + P0.tempo + "/mi), 2:00 jog between. CD 1 mi. ~5 mi."),
      SA(),
      E(P0, 4),
      ST(P0, 4, SB_TXT),
      E(P0, 3),
      L(P0, 8),
      PL(),
  ]),
  week(10, {phase:2, miles:20, start:"2027-01-25", theme:"Cutback week — absorb the work. Lift at ~70%."}, [
      SP("fartlek 10x1:00", "WU 1 mi. MAIN: 10x1:00 hard / 1:00 easy, continuous. CD 0.5 mi. ~4 mi."),
      SA("Cutback week — ~70% loads."),
      E(P0, 3),
      ST(P0, 3, SB_TXT),
      E(P0, 3),
      L(P0, 7),
      R(),
  ]),
  week(11, {phase:2, miles:25, start:"2027-02-01", theme:"Last base week. NRC plan starts next Monday."}, [
      SP("tempo 2x12:00", "WU 1.5 mi. MAIN: 2x12:00 @ tempo (~" + P0.tempo + "/mi), 3:00 jog between. CD 1 mi. ~5 mi."),
      SA(),
      E(P0, 4),
      ST(P0, 4, SB_TXT),
      E(P0, 3),
      L(P0, 9),
      PL(),
  ]),

  // ===== PHASE 3 — NRC BUILD (NRC 14 → 8 weeks to go) + 10K tune-up =====
  week(12, {phase:3, miles:27, start:"2027-02-08", theme:"NRC 14 weeks to go. Paces step up to the mid-build row."}, [
      SP("First Speed Run", "NRC intervals. WU 1.5 mi. MAIN: 8x1:00 @5K (" + P1.k5 + "), 1:00 recovery between. CD 1 mi. ~4.5 mi."),
      SA(),
      E(P1, 4, "(NRC: 14 Weeks to Go — extended.)"),
      SP("One Hard Two Easy", "NRC fartlek. WU 1 mi. MAIN: 21:00 fartlek — 1:00 hard / 2:00 easy. CD 1 mi. ~4.5 mi.", SB_TXT),
      E(P1, 4, "(NRC: Easy Run — extended.)"),
      L(P1, 10, "(NRC: 5K Run — extended for volume.)"),
      R(),
  ]),
  week(13, {phase:3, miles:28, start:"2027-02-15", theme:"NRC 13 weeks to go."}, [
      SP("No Time Go Time", "WU 1.5 mi. MAIN: 1:00 @mile (" + P1.mile + ") / 2:00 @5K (" + P1.k5 + ") / 3:00 @10K (" + P1.k10 + ") / 2:00 @5K / 1:00 @mile, 1:00 recovery between. CD 1 mi. ~4.5 mi."),
      SA(),
      E(P1, 4, "(NRC: 13 Weeks to Go — extended.)"),
      SP("Run Strong. Repeat.", "WU 1.5 mi. MAIN: [4x1:30 @5K (" + P1.k5 + ") + 1x1:30 @mile (" + P1.mile + ")] x2; 0:45 recovery after 5K reps, 1:00 after mile. CD 1 mi. ~5 mi.", SB_TXT),
      E(P1, 4.5, "(NRC: Recovery Run with Headspace.)"),
      L(P1, 10, "(NRC: Four Mile Run — extended.)"),
      PL(),
  ]),
  week(14, {phase:3, miles:30, start:"2027-02-22", theme:"NRC 12 weeks to go. First hill session — gentle grade."}, [
      SP("Runner Up (hills)", "NRC hill workout. WU 1.5 mi. MAIN: 5x[0:45 uphill @10K effort + 0:15 @best effort]; 1:15 recovery after 10K effort, 0:45 after best. Gentle grade — run it flat if the Achilles complains. CD 1 mi. ~4.5 mi."),
      SA(),
      E(P1, 4, "(NRC: 12 Weeks to Go — extended.)"),
      SP("Triple 7's", "WU 1.5 mi. MAIN: 3x7:00 @5K (" + P1.k5 + "), 2:30 recovery. CD 1 mi. ~5.5 mi.", SB_TXT),
      E(P1, 5, "(NRC: Just A Run.)"),
      L(P1, 11),
      R(),
  ]),
  week(15, {phase:3, miles:26, start:"2027-03-01", theme:"NRC 11 weeks to go. Cutback week — lift at ~70%."}, [
      SP("The Rundown", "WU 1.5 mi. MAIN: 3x1:00 @mile, 3x2:00 @5K, 2x1:00 @mile, 2x2:00 @5K, 1x1:00 @mile, 1x2:00 @5K (" + P1.mile + " / " + P1.k5 + "); 1:00 recovery after mile, 1:30 after 5K. CD 1 mi. ~4.5 mi."),
      SA("Cutback week — ~70% loads."),
      E(P1, 4, "(NRC: 11 Weeks to Go — extended.)"),
      SP("Tempo Run", "NRC tempo (Emily Infeld). WU 1.5 mi. MAIN: 25:00 tempo @ " + P1.tempo + "/mi. CD 1 mi. ~5.5 mi.", SB_TXT),
      E(P1, 4, "(NRC: Running Towards Your Goal.)"),
      L(P1, 8, "(NRC: 10K Run — extended.)"),
      PL(),
  ]),
  week(16, {phase:3, miles:31, start:"2027-03-08", theme:"NRC 10 weeks to go."}, [
      SP("Sneaky Speed", "WU 1.5 mi. MAIN: 3x[1:30 @5K (" + P1.k5 + ") + 3x0:45 @mile (" + P1.mile + ")], 1:00 recovery between all. CD 1 mi. ~4.5 mi."),
      SA(),
      E(P1, 4, "(NRC: 10 Weeks to Go — extended.)"),
      SP("Out Strong Back Fast", "NRC progression tempo. WU 1.5 mi. MAIN: 23:00 progression — start at tempo (" + P1.tempo + "), finish near 10K pace (" + P1.k10 + "). CD 1 mi. ~5.5 mi.", SB_TXT),
      E(P1, 5, "(NRC: 30 Minute Head Starts — extended.)"),
      L(P1, 12, "(NRC: Another 10K Run — extended.)"),
      R(),
  ]),
  week(17, {phase:3, miles:32, start:"2027-03-15", theme:"NRC 9 weeks to go. Biggest week before the tune-up."}, [
      SP("Run Fast. Repeat.", "WU 1.5 mi. MAIN: 20x0:30 @mile (" + P1.mile + ") — #1 and #11 @5K — 1:00 recovery between. CD 1 mi. ~5 mi."),
      SA(),
      E(P1, 5, "(NRC: 9 Weeks to Go — extended.)"),
      SP("Hill Hillier Hilliest", "NRC hill workout. WU 1.5 mi. MAIN: 3x[1:00 @10K effort / 0:45 @5K effort / 0:30 @mile effort] uphill; recovery 2:00 / 1:30 / 1:00. Flat if the Achilles complains. CD 1 mi. ~5 mi.", SB_TXT),
      E(P1, 5, "(NRC: Run with Shalane Flanagan, 45:00.)"),
      L(P1, 12, "(NRC: Eight Mile Run — extended.)"),
      PL(),
  ]),
  week(18, {phase:3, miles:27, start:"2027-03-22", theme:"NRC 8 weeks to go — 10K TUNE-UP week. Pick a race Mar 27/28 (shift the week if yours is a different weekend)."}, [
      SP("The Shifter", "WU 1.5 mi. MAIN: 4:00 recovery pace → 1:00 @mile; 3:00 @10K → 1:00 @mile; 2:00 @5K → 1:00 @mile; 1:00 @mile → 1:00 @best. 1:00 / 1:30 / 2:00 recovery after each block. CD 1 mi. ~5 mi."),
      SA("Race week — ~70% loads, nothing new."),
      E(P1, 4, "(NRC: 8 Weeks to Go — extended.)"),
      ST(P1, 4, SL_TXT),
      E(P1, 3),
      E(P1, 2, "Shakeout + 4 relaxed strides. Lay out race kit."),
      RC("🏁 10K TUNE-UP RACE", "Race day (tune-up). WU 2 mi + 4 strides; race the 10K hard but even. ~45:45 (7:20/mi) or faster = on track for sub-1:40. CD 1 mi. ~9 mi total. Racing Saturday instead? Swap with the shakeout."),
  ]),

  // ===== PHASE 4 — HALF-SPECIFIC (NRC 7 → 3 weeks to go) =====
  week(19, {phase:4, miles:31, start:"2027-03-29", theme:"NRC 7 weeks to go. Update paces from your 10K: ≤45:45 → goal paces as written; 46-48 → use the mid-build row and aim ~1:42."}, [
      E(P2, 4, "Day after the 10K — truly easy."),
      SA(),
      E(P2, 5, "(NRC: 7 Weeks to Go — extended.)"),
      SP("Deuces", "WU 1.5 mi. MAIN: 10x2:00 @5K (" + P2.k5 + "), 1:00 recovery (2:00 after #4 and #8). CD 1 mi. ~6 mi.", SB_TXT),
      E(P2, 5, "(NRC: Just Another Run.)"),
      L(P2, 11, "(NRC: Ten Mile Run.)"),
      PL(),
  ]),
  week(20, {phase:4, miles:35, start:"2027-04-05", theme:"NRC 6 weeks to go. PEAK WEEK."}, [
      SP("Rock n Roller", "WU 1.5 mi. MAIN: 5:00 @10K / 2:30 @5K / 1:00 @mile / 0:30 @best / 0:30 @best / 1:00 @mile / 2:30 @5K / 5:00 @10K (" + P2.k10 + " / " + P2.k5 + " / " + P2.mile + "); 1:30 recovery after 10K + 5K, 1:00 after mile + best. CD 1 mi. ~5.5 mi."),
      SA(),
      E(P2, 5, "(NRC: 6 Weeks to Go — extended.)"),
      SP("8K Tempo Run", "2K WU. MAIN: 8K (5 mi) tempo @ " + P2.tempo + "/mi. 2K CD. ~7.5 mi.", SB_TXT),
      E(P2, 5, "(NRC: Suckcess Run.)"),
      L(P2, 12, "(NRC: Another Ten Mile Run — extended.)"),
      R(),
  ]),
  week(21, {phase:4, miles:32, start:"2027-04-12", theme:"NRC 5 weeks to go. Saturday is the dress rehearsal."}, [
      SP("90's", "WU 1.5 mi. MAIN: 3x[1:30 @5K / 1:30 @10K / 1:30 @mile] (" + P2.k5 + " / " + P2.k10 + " / " + P2.mile + "), 1:30 recovery between each. CD 1 mi. ~5.5 mi."),
      SA(),
      E(P2, 5, "(NRC: 5 Weeks to Go — extended.)"),
      SP("Speedurance", "WU 1.5 mi. MAIN: 3x2:00 @5K / 10:00 tempo (" + P2.tempo + ") / 3x2:00 @5K; 1:00 after 5K reps, 2:00 after tempo. CD 1 mi. ~6 mi.", SB_TXT),
      E(P2, 5, "(NRC: Thank You Run, 45:00.)"),
      LD("DRESS REHEARSAL — 10.5 mi: 1.5 mi easy, then 8 mi (13.1K) @ goal half pace 7:35/mi, 1 mi easy. Race kit, race breakfast, practice gels. (NRC: 13.1K Dress Rehearsal.)"),
      PL(),
  ]),
  week(22, {phase:4, miles:34, start:"2027-04-19", theme:"NRC 4 weeks to go. Longest run of the plan on Saturday."}, [
      SP("5 x 5 x 10K Pace", "WU 1.5 mi. MAIN: 5x5:00 @10K (" + P2.k10 + "), 2:00 recovery. CD 1 mi. ~6 mi."),
      SA(),
      E(P2, 5, "(NRC: 4 Weeks to Go — extended.)"),
      SP("Two Hard. One Easy.", "NRC fartlek. WU 1 mi. MAIN: 21:00 fartlek — 2:00 hard / 1:00 easy. CD 1 mi. ~5 mi.", SB_TXT),
      E(P2, 5, "(NRC: Whole Run with Headspace, 45:00.)"),
      L(P2, 13, "(NRC: 20K Run — longest of the plan.)"),
      R(),
  ]),
  week(23, {phase:4, miles:31, start:"2027-04-26", theme:"NRC 3 weeks to go. Last heavy lift Tuesday."}, [
      SP("Long and Strong and Fast", "WU 1 mi. MAIN: 3x[8:00 @10K / 4:00 @5K / 2:00 @mile] (" + P2.k10 + " / " + P2.k5 + " / " + P2.mile + "); 3:00 recovery after 10K, 2:00 after 5K + mile. CD 1 mi. ~6.5 mi."),
      SA("Last heavy session before the race."),
      E(P2, 4, "(NRC: 3 Weeks to Go — extended.)"),
      SP("Bring It Down", "NRC progression tempo. WU 1 mi. MAIN: 15:00 continuous — 5:00 recovery pace / 4:00 @10K / 3:00 @5K / 2:00 @mile / 1:00 @best. CD 1 mi. ~4.5 mi.", SB_TXT),
      E(P2, 6, "(NRC: Run with Eliud Kipchoge, 60:00.)"),
      L(P2, 10, "(NRC: One Hour Run — extended a little.)"),
      PL(),
  ]),

  // ===== PHASE 5 — TAPER (NRC 2 → 1 weeks to go) =====
  week(24, {phase:5, miles:22.5, start:"2027-05-03", theme:"NRC 2 weeks to go. Volume drops, sharpness stays. Light strength only."}, [
      SP("Stronger Faster", "WU 1 mi. MAIN: 3x[3:00 @5K (" + P2.k5 + ") + 4x0:30 @mile (" + P2.mile + ")]; 2:00 after 5K, 1:00 after mile set. CD 1 mi. ~4.5 mi."),
      SL(),
      E(P2, 4, "(NRC: 2 Weeks to Go — extended.)"),
      SP("In Control", "WU 1 mi. MAIN: 1:00 @mile / 3:00 @5K / 5:00 @10K / 7:00 recovery pace; 0:30 / 1:30 / 2:30 recovery. CD 0.5 mi. ~4 mi."),
      E(P2, 3, "(NRC: 5K Head Starts.)"),
      L(P2, 7, "(NRC: Seven Mile Run.)"),
      R(),
  ]),
  week(25, {phase:5, miles:25.1, start:"2027-05-10", theme:"RACE WEEK — Riga. Trust the work."}, [
      E(P2, 3, "(NRC: 1 Week to Go.)"),
      R("Rest + mobility. No lifting race week — a few 90/90s and gentle hip airplanes at most."),
      SP("The Speed Run Before", "WU 1 mi. MAIN: 1:00 @5K / 2:00 @10K / 5:00 @half pace (7:35) / 2:00 @10K / 1:00 @5K, 1:00 recovery between. CD 1 mi. ~4 mi."),
      R("Full rest. Hydrate; start carb-loading Friday."),
      E(P2, 3, "(NRC: Big Day Run.) Travel day? Keep it short and easy."),
      E(P2, 2, "Shakeout + 4 relaxed strides. Lay out race kit. (NRC: Two Mile Run.)"),
      RC("🏁 RIGA HALF MARATHON", "Race day! 13.1 mi. Goal sub-1:40 = 7:35/mi (4:43/km). First 5K controlled (~7:40), settle into 7:35 through 10 mi, then empty the tank. Gel every ~35-40 min. Trust the work."),
  ]),
  ];

  return {
    meta: {
  "name": "Katie",
  "race_date": "2027-05-16",
  "race_name": "Riga Half Marathon",
  "race_goal": "Sub-1:40 half — 7:35/mi (4:43/km)",
  "b_race_date": "2027-03-28",
  "b_race_name": "10K tune-up",
  "b_race_goal": "~45:45 (7:20/mi) = on track for sub-1:40",
  "plan_start": "2026-11-23",
  "weeks_total": 25,
  "goal_half": "Sub-1:40 half (Riga, May 16 2027)",
  "source_plan": "Nike Run Club 14-week Half Marathon plan (weeks 12-25), volume raised"
},
    phases: [
  {
    "num": 1,
    "name": "Rebuild",
    "weeks": "1-6",
    "color": "#5CB88A",
    "goal": "Come back from the post-Dresden break. All easy running (4 runs/wk) + 3 strength sessions (Pilates counts on class weeks). Heavy calf/Achilles and hip work; calf isometrics before every run."
  },
  {
    "num": 2,
    "name": "Aerobic Base",
    "weeks": "7-11",
    "color": "#6B9FD4",
    "goal": "5 runs/wk + 2 strength. Build to 25 mi/wk with one light session (fartlek / tempo) and long runs up to 9 mi."
  },
  {
    "num": 3,
    "name": "NRC Build + 10K",
    "weeks": "12-18",
    "color": "#D4A050",
    "goal": "NRC 14 → 8 weeks to go. Two NRC speed runs a week at mid-build paces, long runs to 12 mi, 10K tune-up the weekend of Mar 28."
  },
  {
    "num": 4,
    "name": "Half-Specific",
    "weeks": "19-23",
    "color": "#3B7D72",
    "goal": "NRC 7 → 3 weeks to go at goal paces. Peak 35 mi, 8K tempo, 8-mile dress rehearsal at 7:35, longest run 13 mi."
  },
  {
    "num": 5,
    "name": "Taper",
    "weeks": "24-25",
    "color": "#B85450",
    "goal": "NRC 2 → 1 weeks to go. Cut volume, keep short sharp touches, light strength only. Race Riga Sun May 16."
  }
],
    pace_ref: {
  "goal_half": "7:35/mi (4:43/km) → 1:39:20",
  "rebuild_base (Nov-Feb, NRC 7:00 row)": "recovery 9:30+ · tempo 8:15 · 10K 7:55 · 5K 7:40 · mile 7:00",
  "nrc_build (Feb-Mar)": "recovery 9:00 · tempo 7:55 · 10K 7:35 · 5K 7:20 · mile 6:45",
  "half_specific (Apr-May, NRC 6:30 row)": "recovery 8:45 · tempo 7:40 · HM 7:35 · 10K 7:20 · 5K 7:05 · mile 6:30",
  "10K checkpoint": "≤45:45 → keep goal paces; 46-48 → stay on build paces, aim ~1:42",
  "effort guide (NRC)": "mile 9/10 · 5K 7-8/10 · 10K 6-7/10 · tempo 6/10 · recovery 4-5/10"
},
    routines: {
  "pre_run": "PRE-RUN (10 min): Clamshells 10/side; single-leg bridges 10/side; leg swings (front/back, side/side) 10 ea; walking lunges 10; high knees 30 sec; butt kicks 30 sec; A-skips 20m x2; ankle circles 10 ea. Strides belong AFTER the run, not before.",
  "post_run": "POST-RUN (10 min): 5 min easy walk to bring HR down -> standing calf stretch 30s/side; couch stretch (hip flexor) 60s/side - CRITICAL for desk-tight hips; figure-4 (piriformis) 45s/side; standing hamstring 30s/side; child's pose 60s. Refuel within 30-60 min.",
  "pre_bike": "PRE-BIKE (5 min): Hip openers (90/90 hold 30s/side); deep squat hold 30s; ankle dorsiflexion (knee-to-wall) 10/side; cat-cow x10. Set saddle height: knee should have ~25-30 deg bend at bottom of pedal stroke.",
  "post_bike": "POST-BIKE (8 min): Couch stretch 60s/side (hips will be tight); pigeon 60s/side; standing forward fold 60s; thoracic spine opener (foam roller) 60s; calf stretch 30s/side. Cycling shortens hip flexors - DO NOT skip this.",
  "mobility_daily": "DAILY MOBILITY (5-10 min, anytime - shower, lunch break, before bed): Couch stretch 60s/side; 90/90 hip rotation 5 reps/side; world's greatest stretch 5/side; cat-cow x10; dead bug x10/side. Do this on rest days too - your hips will thank you.",
  "desk_breaks": "DESK BREAKS: Every 60-90 min stand and do: 10 squats + 10s couch-stretch each side + 30s hip flexor stretch. Set a phone timer. Sitting 4 hr/day is the root cause of your hip tightness - these micro-breaks change the trajectory.",
  "shin_protocol": "SHIN PROTOCOL (do daily until pain resolves, then 3x/week): Toe raises (heels on floor, lift toes) 2x20; calf raises (eccentric: 1s up, 3s down) 2x15; tibialis raises against band 2x15; ice shins 10 min after running if sore; foam roll calves 2 min/side. If pain >4/10 or sharp, REST and reassess.",
  "core": "CORE WORKOUT (10-12 min, runner-specific): Plank 3x30-45s; side plank 3x30s/side; dead bug 3x10/side; bird dog 3x8/side; Pallof press 3x10/side; glute bridge with march 2x10/side. Anti-rotation + lateral core are the running-specific patterns.",
  "plyo": "PLYO BLOCK (~5 min, ~15-20 foot contacts — quality days only): Pogo hops 2x20s; single-leg pogos 2x10/leg; A-skip for height 2x20m; broad jumps 2x5 with full reset between. Do AFTER warmup, BEFORE intervals. Builds tendon stiffness, top-end speed, and running economy — the magic ingredient for a fast mile. Auto-skipped during peak weeks (P4) and the 3-week taper (P5) when freshness > stimulus.",
  "hip_protocol": "HIP PROTOCOL (10 min, daily): 90/90 hip stretch 2 min/side (priority right); couch stretch 60s/side (priority right); clamshells w/ resistance band 3x15/side (slow & controlled — feel the right glute); side-lying hip abduction 3x12/side (keep hip stacked, don't roll back); single-leg glute bridge 3x10/side (pause 2 sec at top); dead bug 3x8/side. Targets right-side hip flexor tightness and glute/abductor weakness. Do every morning or before any run.",
  "yoga": "YOGA (45-60 min, Fridays): Hip-focused flow or yin yoga. Priority poses: pigeon (right side 2+ min); lizard lunge; supine figure-4 / thread the needle; supine twisted root; low lunge with twist; reclined butterfly; legs up the wall (5 min at end). Taper weeks: 20-min restorative only — no deep holds that create soreness. Use a Peloton yoga class or a structured YouTube runner's flow.",
  "achilles_iso": "ACHILLES PREP (4 min, before every run): Wall calf isometric hold — stand on the ball of one foot (or both), heel lifted mid-range, push hard into the floor ~70% effort and hold 45 sec; 5 holds, alternating legs if single-leg, 30s rest. Finish with 1 bent-knee hold per side. Calms a tight Achilles and preps the tendon to load.",
  "pilates": "PILATES (class, every other Sunday, ~50 min). Counts as core + hip mobility for the week. On rebuild weeks it replaces Strength C."
},
    strength: {
  "A_full_gym": SA_TXT,
  "B_home": SB_TXT,
  "C_gym": SC_TXT,
  "light_taper": SL_TXT
},
    weeks: WEEKS,
  };
})();
