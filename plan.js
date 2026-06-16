// Training plan data — edit this file to update workouts without touching app code.
// Loaded via <script src="plan.js"> before the main app script.

const DATA = {
  meta: {
    name: "Katie",
    race_date: "2026-10-25",
    race_name: "Dresden Half Marathon",
    race_goal: "Sub-1:45 (8:00/mi)",
    b_race_date: "2026-09-19",
    b_race_name: "Copenhagen 1-Mile",
    b_race_goal: "Sub-6:00",
    plan_start: "2026-04-27",
    weeks_total: 26,
    goal_mile: "Sub-6:00 (B-race Sep 19, Copenhagen)",
    goal_half: "Sub-1:45 half marathon (A-race Oct 25, Dresden)",
  },
  phases: [
    {
      num: 1,
      name: "Foundation & Rebuild",
      weeks: "1-4",
      color: "#5CB88A",
      goal: "Settle the ankle, address hip/shin, build durability with low-volume aerobic running. Daily mobility becomes a habit.",
    },
    {
      num: 2,
      name: "Aerobic Base",
      weeks: "5-7",
      color: "#A8D8EA",
      goal: "Steadily increase mileage. Add hill strides and fartlek to wake up neuromuscular system without high-impact intensity.",
    },
    {
      num: 3,
      name: "Half-Marathon Base Build",
      weeks: "8-12",
      color: "#6B9FD4",
      goal: "Return from injury conservatively. Build from ~20 to ~29 mpw, establish daily hip protocol, introduce easy strides. No hard track work yet. 5K time trial after Week 12 to recalibrate zones.",
    },
    {
      num: 4,
      name: "Speed Development (Mile Prep)",
      weeks: "13-17",
      color: "#D4A050",
      goal: "Introduce track work and build mile-specific speed. Lactate tolerance and 400m rep capacity. Mileage 28-33 mpw. Thursday becomes a second quality day.",
    },
    {
      num: 5,
      name: "Mile Peak & Taper",
      weeks: "18-21",
      color: "#9B7FCA",
      goal: "Sharpen for the mile B-race. Cut volume, trust the fitness. Race Sep 19 — sub-6:00 mile in Copenhagen.",
    },
    {
      num: 6,
      name: "Half Marathon Build",
      weeks: "22-24",
      color: "#3B7D72",
      goal: "Capitalize on mile speed. Shift to longer tempos and half-pace efforts. Mileage rebuilds to 30-31 mpw across three full weeks before taper.",
    },
    {
      num: 7,
      name: "Half Marathon Taper",
      weeks: "25-26",
      color: "#B85450",
      goal: "Trust the work. Goal of taper: arrive fresh and sharp, not cram more fitness. Race Oct 25 — sub-1:45 in Dresden.",
    },
  ],
  pace_ref: {
    easy: "9:30-10:30/mi (conversational, can chat in full sentences)",
    long: "9:30-10:00/mi (steady, comfortable)",
    marathon: "8:30-9:00/mi",
    tempo_HM: "8:00-8:15/mi (comfortably hard, controlled breathing)",
    tempo_10K: "7:30-7:45/mi",
    "5K": "7:00-7:15/mi",
    "3K": "6:30-6:40/mi",
    mile_goal: "6:00/mi = 90s/400m, 45s/200m, 22.5s/100m",
    mile_stretch: "5:45/mi = 86s/400m, 43s/200m",
    recovery: "10:30-11:30/mi",
  },
  routines: {
    pre_run:
      "PRE-RUN (10 min): Clamshells 10/side; single-leg bridges 10/side; leg swings (front/back, side/side) 10 ea; walking lunges 10; high knees 30 sec; butt kicks 30 sec; A-skips 20m x2; ankle circles 10 ea. Strides belong AFTER the run, not before.",
    post_run:
      "POST-RUN (10 min): 5 min easy walk to bring HR down -> standing calf stretch 30s/side; couch stretch (hip flexor) 60s/side - CRITICAL for desk-tight hips; figure-4 (piriformis) 45s/side; standing hamstring 30s/side; child's pose 60s. Refuel within 30-60 min.",
    pre_bike:
      "PRE-BIKE (5 min): Hip openers (90/90 hold 30s/side); deep squat hold 30s; ankle dorsiflexion (knee-to-wall) 10/side; cat-cow x10. Set saddle height: knee should have ~25-30 deg bend at bottom of pedal stroke.",
    post_bike:
      "POST-BIKE (8 min): Couch stretch 60s/side (hips will be tight); pigeon 60s/side; standing forward fold 60s; thoracic spine opener (foam roller) 60s; calf stretch 30s/side. Cycling shortens hip flexors - DO NOT skip this.",
    mobility_daily:
      "DAILY MOBILITY (5-10 min, anytime - shower, lunch break, before bed): Couch stretch 60s/side; 90/90 hip rotation 5 reps/side; world's greatest stretch 5/side; cat-cow x10; dead bug x10/side. Do this on rest days too - your hips will thank you.",
    desk_breaks:
      "DESK BREAKS: Every 60-90 min stand and do: 10 squats + 10s couch-stretch each side + 30s hip flexor stretch. Set a phone timer. Sitting 4 hr/day is the root cause of your hip tightness - these micro-breaks change the trajectory.",
    shin_protocol:
      "SHIN PROTOCOL (do daily until pain resolves, then 3x/week): Toe raises (heels on floor, lift toes) 2x20; calf raises (eccentric: 1s up, 3s down) 2x15; tibialis raises against band 2x15; ice shins 10 min after running if sore; foam roll calves 2 min/side. If pain >4/10 or sharp, REST and reassess.",
    core:
      "CORE WORKOUT (10-12 min, runner-specific): Plank 3x30-45s; side plank 3x30s/side; dead bug 3x10/side; bird dog 3x8/side; Pallof press 3x10/side; glute bridge with march 2x10/side. Anti-rotation + lateral core are the running-specific patterns.",
    plyo:
      "PLYO BLOCK (~5 min, ~15-20 foot contacts — quality days only): Pogo hops 2x20s; single-leg pogos 2x10/leg; A-skip for height 2x20m; broad jumps 2x5 with full reset between. Do AFTER warmup, BEFORE intervals. Builds tendon stiffness, top-end speed, and running economy — the magic ingredient for a fast mile. Auto-skipped during peak weeks (P4) and the 3-week taper (P5) when freshness > stimulus.",
    hip_protocol:
      "HIP PROTOCOL (10 min, daily): 90/90 hip stretch 2 min/side (priority right); couch stretch 60s/side (priority right); clamshells w/ resistance band 3x15/side (slow & controlled — feel the right glute); side-lying hip abduction 3x12/side (keep hip stacked, don't roll back); single-leg glute bridge 3x10/side (pause 2 sec at top); dead bug 3x8/side. Targets right-side hip flexor tightness and glute/abductor weakness. Do every morning or before any run.",
    yoga:
      "YOGA (45-60 min, Fridays): Hip-focused flow or yin yoga. Priority poses: pigeon (right side 2+ min); lizard lunge; supine figure-4 / thread the needle; supine twisted root; low lunge with twist; reclined butterfly; legs up the wall (5 min at end). Taper weeks: 20-min restorative only — no deep holds that create soreness. Use a Peloton yoga class or a structured YouTube runner's flow.",
  },
  strength: {
    A_full_gym:
      "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets.",
    B_home:
      "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20.",
    light_taper:
      "STRENGTH LIGHT (~25 min): Bodyweight squat 2x12; glute bridge 2x15; push-up 2x10-15; band row 2x12; side plank 2x30s; dead bug 2x10/side. Keep RPE 5-6 - maintenance only.",
  },
  weeks: [
    {
      num: 1,
      phase: 1,
      mileage: 14,
      theme: "Re-entry. Easy effort only. Build habit of mobility.",
      days: [
        {
          date: "2026-04-27",
          day_name: "Mon",
          title: "Easy run",
          detail:
            "3 mi easy @ 9:45-10:30/mi. Pre-run + post-run routines. Listen to ankle.",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-04-28",
          day_name: "Tue",
          title: "REST",
          detail:
            "Full rest. Mon-night sleep is usually short - today is recovery. Mobility routine + 15-min walk if restless. Couch stretch 90s/side.",
          routines: ["mobility_daily"],
          strength: null,
        },
        {
          date: "2026-04-29",
          day_name: "Wed",
          title: "Easy run + drills",
          detail:
            "3 mi easy. Add drills before run: A-skips 2x30m, B-skips 2x30m, high-knee carioca 2x30m.",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-04-30",
          day_name: "Thu",
          title: "Easy run + Strength B",
          detail:
            "3 mi easy + Strength B (home). Strength B is short and light - you'll be fresh enough.",
          routines: ["pre_run", "post_run"],
          strength:
            "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20.",
        },
        {
          date: "2026-05-01",
          day_name: "Fri",
          title: "Bike + core",
          detail:
            "Peloton 45 min Power Zone Endurance (Z2). 10 min core after: dead bug 3x10/side, side plank 2x30s/side, Pallof press 3x10/side.",
          routines: ["pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-05-02",
          day_name: "Sat",
          title: "Strength A + bike",
          detail:
            "Strength A (full gym, ~50 min) + 30 min easy Peloton ride. No run today - your gym day. Core is on the bike, focus on quality lifting form.",
          routines: ["pre_bike", "post_bike"],
          strength:
            "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets.",
        },
        {
          date: "2026-05-03",
          day_name: "Sun",
          title: "LONG RUN",
          detail:
            "5 mi easy. Aim for last mile slightly faster than first. Walk breaks ok. Legs may feel slightly heavy from yesterday's gym - that's fine, just ease into it.",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-04-27",
      end_date: "2026-05-03",
    },
    {
      num: 2,
      phase: 1,
      mileage: 16,
      theme:
        "Tiny step up. Notice ankle/shin daily - 0-3/10 pain ok, 4+ means back off.",
      days: [
        {
          date: "2026-05-04",
          day_name: "Mon",
          title: "Easy run",
          detail: "3 mi easy.",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-05-05",
          day_name: "Tue",
          title: "REST",
          detail: "Full rest. Foam roll quads + IT band 5 min/side.",
          routines: ["mobility_daily"],
          strength: null,
        },
        {
          date: "2026-05-06",
          day_name: "Wed",
          title: "Easy run + 4x20s strides",
          detail:
            "4 mi easy + 4x20s strides at end (FAST but relaxed; full walk-back recovery).",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-05-07",
          day_name: "Thu",
          title: "Easy run + Strength B",
          detail: "3 mi easy + Strength B.",
          routines: ["pre_run", "post_run"],
          strength:
            "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20.",
        },
        {
          date: "2026-05-08",
          day_name: "Fri",
          title: "Bike + core",
          detail: "Peloton 45 min Z2 + core block.",
          routines: ["pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-05-09",
          day_name: "Sat",
          title: "Strength A + bike",
          detail: "Strength A + 30 min easy Peloton ride.",
          routines: ["pre_bike", "post_bike"],
          strength:
            "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets.",
        },
        {
          date: "2026-05-10",
          day_name: "Sun",
          title: "LONG RUN",
          detail: "6 mi easy.",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-05-04",
      end_date: "2026-05-10",
    },
    {
      num: 3,
      phase: 1,
      mileage: 18,
      theme:
        "Begin to feel like a runner again. Strides are non-negotiable.",
      days: [
        {
          date: "2026-05-11",
          day_name: "Mon",
          title: "Easy run",
          detail: "3 mi easy.",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-05-12",
          day_name: "Tue",
          title: "REST",
          detail: "Yoga or restorative stretching 20 min.",
          routines: ["mobility_daily"],
          strength: null,
        },
        {
          date: "2026-05-13",
          day_name: "Wed",
          title: "Easy + drills + strides",
          detail:
            "4 mi easy + drills (A/B-skips, carioca) + 4x20s strides.",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-05-14",
          day_name: "Thu",
          title: "Easy run + Strength B",
          detail: "4 mi easy + Strength B.",
          routines: ["pre_run", "post_run"],
          strength:
            "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20.",
        },
        {
          date: "2026-05-15",
          day_name: "Fri",
          title: "Bike Z2 + core",
          detail: "Peloton 50 min Z2 endurance ride + core.",
          routines: ["pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-05-16",
          day_name: "Sat",
          title: "Strength A + bike",
          detail:
            "Strength A + 30 min easy bike. If feeling strong, work up to a top set on squat at RPE 7.",
          routines: ["pre_bike", "post_bike"],
          strength:
            "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets.",
        },
        {
          date: "2026-05-17",
          day_name: "Sun",
          title: "LONG RUN",
          detail:
            "7 mi easy. First time at 7 - slow down if breathing labored.",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-05-11",
      end_date: "2026-05-17",
    },
    {
      num: 4,
      phase: 1,
      mileage: 16,
      theme:
        "DELOAD. Recovery week - hold or slightly reduce. Re-evaluate hip/shin.",
      days: [
        {
          date: "2026-05-18",
          day_name: "Mon",
          title: "Easy run",
          detail: "3 mi easy.",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-05-19",
          day_name: "Tue",
          title: "REST",
          detail: "Full rest.",
          routines: ["mobility_daily"],
          strength: null,
        },
        {
          date: "2026-05-20",
          day_name: "Wed",
          title: "Easy + 6x20s strides",
          detail:
            "4 mi easy + 6x20s strides - more strides this week, no other pace work.",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-05-21",
          day_name: "Thu",
          title: "Easy run + Strength B",
          detail: "3 mi easy + Strength B.",
          routines: ["pre_run", "post_run"],
          strength:
            "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20.",
        },
        {
          date: "2026-05-22",
          day_name: "Fri",
          title: "Bike easy",
          detail: "Peloton 40 min Z2 + core.",
          routines: ["pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-05-23",
          day_name: "Sat",
          title: "Strength A (lighter) + bike",
          detail:
            "Strength A with moderate weights (RPE 7), focus on form. + 30 min easy bike.",
          routines: ["pre_bike", "post_bike"],
          strength:
            "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets.",
        },
        {
          date: "2026-05-24",
          day_name: "Sun",
          title: "LONG RUN",
          detail:
            "6 mi easy - purposely shorter than last week. End of Phase 1 - reflect: ankle? hip? shin? sleep? Adjust Phase 2 starting volume if anything is sore.",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-05-18",
      end_date: "2026-05-24",
    },
    {
      num: 5,
      phase: 2,
      mileage: 20,
      theme:
        "Add hill strides. Bigger long run. You're rebuilding your engine.",
      days: [
        {
          date: "2026-05-25",
          day_name: "Mon",
          title: "Easy run",
          detail: "3 mi easy.",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-05-26",
          day_name: "Tue",
          title: "REST",
          detail:
            "Mobility 15 min. Couch stretch and 90/90 hip work emphasized.",
          routines: ["mobility_daily"],
          strength: null,
        },
        {
          date: "2026-05-27",
          day_name: "Wed",
          title: "Hill strides",
          detail:
            "4 mi: 1 mi WU; 6x20s hill strides on a moderate hill (relaxed but hard, jog down full recovery); 2 mi easy CD. Hills = strength + form without impact.",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-05-28",
          day_name: "Thu",
          title: "Easy + Strength B",
          detail: "4 mi easy + Strength B.",
          routines: ["pre_run", "post_run"],
          strength:
            "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20.",
        },
        {
          date: "2026-05-29",
          day_name: "Fri",
          title: "Bike + core",
          detail: "Peloton 45 min Z2 + core.",
          routines: ["pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-05-30",
          day_name: "Sat",
          title: "Strength A + bike",
          detail: "Strength A + 30 min easy Peloton spin.",
          routines: ["pre_bike", "post_bike"],
          strength:
            "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets.",
        },
        {
          date: "2026-05-31",
          day_name: "Sun",
          title: "LONG RUN",
          detail:
            "9 mi easy - keep effort honest, conversational throughout.",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-05-25",
      end_date: "2026-05-31",
    },
    {
      num: 6,
      phase: 2,
      mileage: 22,
      theme:
        "Steady build. Hills again. Add 5 lb to lifts if last week felt strong.",
      days: [
        {
          date: "2026-06-01",
          day_name: "Mon",
          title: "Easy run",
          detail: "4 mi easy.",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-06-02",
          day_name: "Tue",
          title: "REST",
          detail: "Foam roll session 15 min.",
          routines: ["mobility_daily"],
          strength: null,
        },
        {
          date: "2026-06-03",
          day_name: "Wed",
          title: "Hill strides",
          detail:
            "5 mi: 1 mi WU; 6x30s hill strides (longer this week); 2.5 mi CD.",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-06-04",
          day_name: "Thu",
          title: "Bike + core",
          detail: "Peloton 45 min Z2 + core.",
          routines: ["pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-06-05",
          day_name: "Fri",
          title: "Easy + Strength B",
          detail: "4 mi easy + Strength B.",
          routines: ["pre_run", "post_run"],
          strength:
            "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20.",
        },
        {
          date: "2026-06-06",
          day_name: "Sat",
          title: "Strength A + bike",
          detail:
            "Strength A + 30 min easy bike. Top squat set at RPE 7-8.",
          routines: ["pre_bike", "post_bike"],
          strength:
            "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets.",
        },
        {
          date: "2026-06-07",
          day_name: "Sun",
          title: "LONG RUN",
          detail: "9 mi easy.",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-06-01",
      end_date: "2026-06-07",
    },
    {
      num: 7,
      phase: 2,
      mileage: 24,
      theme: "Introduce fartlek. First taste of varied pace running.",
      days: [
        {
          date: "2026-06-08",
          day_name: "Mon",
          title: "Easy run",
          detail: "4 mi easy.",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-06-09",
          day_name: "Tue",
          title: "REST",
          detail: "Rest. Mobility + walk.",
          routines: ["mobility_daily"],
          strength: null,
        },
        {
          date: "2026-06-10",
          day_name: "Wed",
          title: "Fartlek",
          detail:
            "5 mi: 1.5 mi WU; 10x(1 min ON @ 10K effort / 1 min easy jog); 1 mi CD. ON segments should feel comfortably hard, not all-out.",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-06-11",
          day_name: "Thu",
          title: "Easy + Strength B",
          detail: "4 mi easy + Strength B.",
          routines: ["pre_run", "post_run"],
          strength:
            "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20.",
        },
        {
          date: "2026-06-12",
          day_name: "Fri",
          title: "Recovery run",
          detail: "2 mi VERY easy - the slower the better. No watch.",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-06-13",
          day_name: "Sat",
          title: "Strength A + bike",
          detail: "Strength A + 30 min easy Peloton.",
          routines: ["pre_bike", "post_bike"],
          strength:
            "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets.",
        },
        {
          date: "2026-06-14",
          day_name: "Sun",
          title: "LONG RUN",
          detail: "9 mi easy.",
          routines: ["pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-06-08",
      end_date: "2026-06-14",
    },
    {
      num: 8,
      phase: 3,
      mileage: 20,
      theme: "RETURN FROM INJURY. Conservative re-entry; settle the hip before loading anything hard. If pain by Day 3, take the full week as rest and push start to Jun 22.",
      days: [
        {
          date: "2026-06-15",
          day_name: "Mon",
          title: "Easy 3 mi",
          detail: "3 mi easy @ Z2 (9:00-9:30/mi). Take stock of how the injury feels — if pain, rest immediately. Hip protocol before run.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-06-16",
          day_name: "Tue",
          title: "REST",
          detail: "Full rest. Hip protocol + foam rolling.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-06-17",
          day_name: "Wed",
          title: "Peloton 40 min",
          detail:
            "Easy recovery spin — Z1-Z2, low resistance, cadence 85-95 rpm.",
          routines: ["hip_protocol", "pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-06-18",
          day_name: "Thu",
          title: "Easy 3 mi",
          detail:
            "Z2 conversational pace. Hip protocol before run.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-06-19",
          day_name: "Fri",
          title: "Yoga 45 min",
          detail:
            "Hip-opening focus: pigeon, lizard, figure-4. Use Peloton yoga or a guided runner's flow.",
          routines: ["hip_protocol", "yoga"],
          strength: null,
        },
        {
          date: "2026-06-20",
          day_name: "Sat",
          title: "Block A (60% load)",
          detail:
            "Block A at 60% load — first gym back from injury. Assess how the hip responds to single-leg work; start light.",
          routines: ["hip_protocol"],
          strength:
            "BLOCK A — 60% load (recovery / injury return week): Same exercises as full Block A, drop weights 30-40%. Focus on form, slow tempo, and right glute activation. Barbell RDL 4x6; Bulgarian split squat 3x8/leg; Barbell hip thrust 4x8; Nordic hamstring curl 3x6; Lateral band walk 3x15/side; Copenhagen hold 3x8/side.",
        },
        {
          date: "2026-06-21",
          day_name: "Sun",
          title: "LONG RUN 7 mi",
          detail:
            "Z2 (9:00-9:30/mi). Stop at 7 regardless of how good you feel.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-06-15",
      end_date: "2026-06-21",
    },
    {
      num: 9,
      phase: 3,
      mileage: 22,
      theme:
        "Build week. Add Z3 finish + strides. Hip should feel better than last week.",
      days: [
        {
          date: "2026-06-22",
          day_name: "Mon",
          title: "Easy 5 mi w/ Z3 finish",
          detail:
            "3 mi Z2 → last 2 mi at Z3 (8:15-8:30/mi). Solid steady-state work.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-06-23",
          day_name: "Tue",
          title: "REST",
          detail:
            "Full rest. Hip protocol.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-06-24",
          day_name: "Wed",
          title: "Peloton 45 min",
          detail:
            "20 min Z2 → 15 min Z3 (standing climb intervals) → 10 min Z2.",
          routines: ["hip_protocol", "pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-06-25",
          day_name: "Thu",
          title: "Easy 4 mi",
          detail:
            "Z2 + 4x20-sec strides (relaxed, not all-out).",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-06-26",
          day_name: "Fri",
          title: "Yoga 50 min",
          detail:
            "Runner's yin flow — hold each pose 2-3 min. Priority: pigeon and supine figure-4 right side.",
          routines: ["hip_protocol", "yoga"],
          strength: null,
        },
        {
          date: "2026-06-27",
          day_name: "Sat",
          title: "Block B",
          detail:
            "Block B. Return to normal load if hip cooperated last week.",
          routines: ["hip_protocol"],
          strength:
            "BLOCK B (60-75 min, Saturday gym): Trap bar deadlift 4x5 (heavy); Single-leg box step-up 3x10/leg (moderate DBs, controlled descent); Goblet squat 3x10 (tempo: 3 sec down, 1 sec up); Single-leg RDL 3x8/leg (right-side balance focus); Pallof press 3x12/side (anti-rotation); Glute-ham raise OR band pull-through 3x10.",
        },
        {
          date: "2026-06-28",
          day_name: "Sun",
          title: "LONG RUN 8 mi",
          detail:
            "Z2 (9:00-9:30/mi). Should feel easy from start to finish.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-06-22",
      end_date: "2026-06-28",
    },
    {
      num: 10,
      phase: 3,
      mileage: 25,
      theme:
        "Tempo enters. Mileage climbs. Hip protocol every day still non-negotiable.",
      days: [
        {
          date: "2026-06-29",
          day_name: "Mon",
          title: "Tempo 5 mi",
          detail:
            "1.5 mi Z2 WU → 2.5 mi Z4 (7:40-7:55/mi) → 1 mi Z2 CD. First real tempo of the block.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-06-30",
          day_name: "Tue",
          title: "REST",
          detail:
            "Hip protocol.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-07-01",
          day_name: "Wed",
          title: "Peloton 50 min",
          detail:
            "10 min WU → 3x8 min Z3/Z4 efforts w/ 4 min Z2 recovery → 10 min CD.",
          routines: ["hip_protocol", "pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-07-02",
          day_name: "Thu",
          title: "Easy 5 mi",
          detail:
            "Z2 + 6x20-sec strides.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-07-03",
          day_name: "Fri",
          title: "Yoga 50 min",
          detail:
            "Hip-focused flow. Add low lunge with thoracic twist; legs up the wall 5 min at end.",
          routines: ["hip_protocol", "yoga"],
          strength: null,
        },
        {
          date: "2026-07-04",
          day_name: "Sat",
          title: "Block A",
          detail:
            "Full load. Heavy lift day.",
          routines: ["hip_protocol"],
          strength:
            "BLOCK A (60-75 min, Saturday gym): Barbell Romanian Deadlift 4x6 (heavy, hip hinge); Bulgarian split squat 3x8/leg (right leg as REAR to load right glute); Barbell hip thrust 4x8 (drive through right heel); Nordic hamstring curl 3x6 (slow eccentric); Lateral band walk 3x15/side (heavy band); Copenhagen adductor hold 3x8/side (3-sec holds).",
        },
        {
          date: "2026-07-05",
          day_name: "Sun",
          title: "LONG RUN 9 mi",
          detail:
            "Z2. Break it up mentally: 3 mi easy → 4 mi steady → 2 mi easy.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-06-29",
      end_date: "2026-07-05",
    },
    {
      num: 11,
      phase: 3,
      mileage: 21,
      theme:
        "RECOVERY WEEK. Reduced volume + light lift. Let the body absorb the work.",
      days: [
        {
          date: "2026-07-06",
          day_name: "Mon",
          title: "Easy 4 mi",
          detail:
            "Z2 only, no tempo. Recovery week — keep it light.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-07-07",
          day_name: "Tue",
          title: "REST",
          detail:
            "Hip protocol + foam roll priority.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-07-08",
          day_name: "Wed",
          title: "Peloton 40 min",
          detail:
            "Easy Z1-Z2 spin only.",
          routines: ["hip_protocol", "pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-07-09",
          day_name: "Thu",
          title: "Easy 3 mi",
          detail:
            "Z2 + 4 strides.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-07-10",
          day_name: "Fri",
          title: "Yoga 45 min",
          detail:
            "Restorative yin — extra time on right hip and hamstrings.",
          routines: ["hip_protocol", "yoga"],
          strength: null,
        },
        {
          date: "2026-07-11",
          day_name: "Sat",
          title: "Block B (60% load)",
          detail:
            "Block B at 60% load (recovery week). Drop weights 30-40%, focus on form and right glute activation.",
          routines: ["hip_protocol"],
          strength:
            "BLOCK B — 60% load (recovery week): Same exercises as full Block B, drop weights 30-40%. Trap bar deadlift 4x5; Single-leg box step-up 3x10/leg; Goblet squat 3x10 (tempo); Single-leg RDL 3x8/leg; Pallof press 3x12/side; GHR or band pull-through 3x10.",
        },
        {
          date: "2026-07-12",
          day_name: "Sun",
          title: "LONG RUN 8 mi",
          detail:
            "Z2, relaxed and comfortable.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-07-06",
      end_date: "2026-07-12",
    },
    {
      num: 12,
      phase: 3,
      mileage: 29,
      theme:
        "Mileage peak of Phase 1. After this: 5K time trial to recalibrate all zones for Phases 2-3.",
      days: [
        {
          date: "2026-07-13",
          day_name: "Mon",
          title: "Tempo 6 mi",
          detail:
            "1.5 mi Z2 WU → 3.5 mi Z4 (7:35-7:50/mi) → 1 mi Z2 CD.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-07-14",
          day_name: "Tue",
          title: "REST",
          detail:
            "Hip protocol.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-07-15",
          day_name: "Wed",
          title: "Peloton 55 min",
          detail:
            "15 min WU → 4x6 min Z4 hard climbs w/ 3 min recovery → CD.",
          routines: ["hip_protocol", "pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-07-16",
          day_name: "Thu",
          title: "Easy 5 mi",
          detail:
            "Z2 + 6 strides.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-07-17",
          day_name: "Fri",
          title: "Yoga 50 min",
          detail:
            "Hip-opening flow.",
          routines: ["hip_protocol", "yoga"],
          strength: null,
        },
        {
          date: "2026-07-18",
          day_name: "Sat",
          title: "Block A",
          detail:
            "Full load.",
          routines: ["hip_protocol"],
          strength:
            "BLOCK A (60-75 min, Saturday gym): Barbell Romanian Deadlift 4x6 (heavy, hip hinge); Bulgarian split squat 3x8/leg (right leg as REAR to load right glute); Barbell hip thrust 4x8 (drive through right heel); Nordic hamstring curl 3x6 (slow eccentric); Lateral band walk 3x15/side (heavy band); Copenhagen adductor hold 3x8/side (3-sec holds).",
        },
        {
          date: "2026-07-19",
          day_name: "Sun",
          title: "LONG RUN 11 mi",
          detail:
            "Z2. First time past 9 mi — treat miles 9-11 at 9:30+/mi. Eat 1 gel at mile 6. Run a 5K time trial NEXT WEEK to recalibrate paces.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-07-13",
      end_date: "2026-07-19",
    },
    {
      num: 13,
      phase: 4,
      mileage: 28,
      theme:
        "Phase 2 begins. Track work + tempo. Thursday becomes a second quality day.",
      days: [
        {
          date: "2026-07-20",
          day_name: "Mon",
          title: "TRACK: 6×800m",
          detail:
            "WU 1.5 mi → 6×800m at Z5 (3:35-3:45 per rep) w/ 2-min jog rest → CD 1 mi. Total ~5.5 mi.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-07-21",
          day_name: "Tue",
          title: "REST",
          detail:
            "Hip protocol.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-07-22",
          day_name: "Wed",
          title: "Peloton 45 min",
          detail:
            "Z2-Z3 recovery ride post-track.",
          routines: ["hip_protocol", "pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-07-23",
          day_name: "Thu",
          title: "TEMPO 5 mi",
          detail:
            "1 mi Z2 → 3 mi Z4 → 1 mi Z2.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-07-24",
          day_name: "Fri",
          title: "Yoga 50 min",
          detail:
            "Hip-opening flow. Right pigeon and lizard priority.",
          routines: ["hip_protocol", "yoga"],
          strength: null,
        },
        {
          date: "2026-07-25",
          day_name: "Sat",
          title: "Block B",
          detail:
            "Full load.",
          routines: ["hip_protocol"],
          strength:
            "BLOCK B (60-75 min, Saturday gym): Trap bar deadlift 4x5 (heavy); Single-leg box step-up 3x10/leg (moderate DBs, controlled descent); Goblet squat 3x10 (tempo: 3 sec down, 1 sec up); Single-leg RDL 3x8/leg (right-side balance focus); Pallof press 3x12/side (anti-rotation); Glute-ham raise OR band pull-through 3x10.",
        },
        {
          date: "2026-07-26",
          day_name: "Sun",
          title: "LONG RUN 12 mi",
          detail:
            "Z2 (9:00-9:20/mi). Gel at mile 6. Practice hydration.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-07-20",
      end_date: "2026-07-26",
    },
    {
      num: 14,
      phase: 4,
      mileage: 30,
      theme:
        "10×400m sharpens speed. Tempo at 7:30s holds aerobic threshold.",
      days: [
        {
          date: "2026-07-27",
          day_name: "Mon",
          title: "TRACK: 10×400m",
          detail:
            "WU 1.5 mi → 10×400m at Z5-Z6 (1:38-1:45 per rep / ~6:35-7:00/mi) w/ 90-sec standing rest → CD 1 mi.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-07-28",
          day_name: "Tue",
          title: "REST",
          detail:
            "Hip protocol.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-07-29",
          day_name: "Wed",
          title: "Peloton 50 min",
          detail:
            "Z2-Z3 recovery ride.",
          routines: ["hip_protocol", "pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-07-30",
          day_name: "Thu",
          title: "TEMPO 5 mi",
          detail:
            "1 mi Z2 → 3 mi Z4 → 1 mi Z2.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-07-31",
          day_name: "Fri",
          title: "Yoga 50 min",
          detail:
            "Runner's flow, hip-focused.",
          routines: ["hip_protocol", "yoga"],
          strength: null,
        },
        {
          date: "2026-08-01",
          day_name: "Sat",
          title: "Block A",
          detail:
            "Full load.",
          routines: ["hip_protocol"],
          strength:
            "BLOCK A (60-75 min, Saturday gym): Barbell Romanian Deadlift 4x6 (heavy, hip hinge); Bulgarian split squat 3x8/leg (right leg as REAR to load right glute); Barbell hip thrust 4x8 (drive through right heel); Nordic hamstring curl 3x6 (slow eccentric); Lateral band walk 3x15/side (heavy band); Copenhagen adductor hold 3x8/side (3-sec holds).",
        },
        {
          date: "2026-08-02",
          day_name: "Sun",
          title: "LONG RUN 12 mi",
          detail:
            "Z2, relaxed.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-07-27",
      end_date: "2026-08-02",
    },
    {
      num: 15,
      phase: 4,
      mileage: 22,
      theme:
        "RECOVERY WEEK. Pull back volume, reset for the second block of speed.",
      days: [
        {
          date: "2026-08-03",
          day_name: "Mon",
          title: "Easy 5 mi",
          detail:
            "Z2 + 6 strides only — no track this week.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-08-04",
          day_name: "Tue",
          title: "REST",
          detail:
            "Hip protocol.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-08-05",
          day_name: "Wed",
          title: "Peloton 40 min",
          detail:
            "Z2 recovery ride.",
          routines: ["hip_protocol", "pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-08-06",
          day_name: "Thu",
          title: "Easy 4 mi",
          detail:
            "Z2.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-08-07",
          day_name: "Fri",
          title: "Yoga 45 min",
          detail:
            "Restorative yin — long holds, parasympathetic reset.",
          routines: ["hip_protocol", "yoga"],
          strength: null,
        },
        {
          date: "2026-08-08",
          day_name: "Sat",
          title: "Block B (60% load)",
          detail:
            "Block B at 60% load — recovery week.",
          routines: ["hip_protocol"],
          strength:
            "BLOCK B — 60% load (recovery week): Same exercises as full Block B, drop weights 30-40%. Trap bar deadlift 4x5; Single-leg box step-up 3x10/leg; Goblet squat 3x10 (tempo); Single-leg RDL 3x8/leg; Pallof press 3x12/side; GHR or band pull-through 3x10.",
        },
        {
          date: "2026-08-09",
          day_name: "Sun",
          title: "LONG RUN 10 mi",
          detail:
            "Z2.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-08-03",
      end_date: "2026-08-09",
    },
    {
      num: 16,
      phase: 4,
      mileage: 32,
      theme:
        "Back to two quality days. 1000m reps build lactate threshold.",
      days: [
        {
          date: "2026-08-10",
          day_name: "Mon",
          title: "TRACK: 5×1000m",
          detail:
            "WU 1.5 mi → 5×1000m at Z5 (4:22-4:35 per rep / ~7:00-7:22/mi) w/ 2-min jog rest → CD 1 mi.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-08-11",
          day_name: "Tue",
          title: "REST",
          detail:
            "Hip protocol.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-08-12",
          day_name: "Wed",
          title: "Peloton 55 min",
          detail:
            "Z3 structured: 3x10 min efforts w/ 5 min recovery.",
          routines: ["hip_protocol", "pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-08-13",
          day_name: "Thu",
          title: "TEMPO 6 mi",
          detail:
            "1 mi Z2 → 4 mi Z4 (7:30-7:45) → 1 mi Z2.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-08-14",
          day_name: "Fri",
          title: "Yoga 50 min",
          detail:
            "Hip and hamstring focus.",
          routines: ["hip_protocol", "yoga"],
          strength: null,
        },
        {
          date: "2026-08-15",
          day_name: "Sat",
          title: "Block A",
          detail:
            "Full load.",
          routines: ["hip_protocol"],
          strength:
            "BLOCK A (60-75 min, Saturday gym): Barbell Romanian Deadlift 4x6 (heavy, hip hinge); Bulgarian split squat 3x8/leg (right leg as REAR to load right glute); Barbell hip thrust 4x8 (drive through right heel); Nordic hamstring curl 3x6 (slow eccentric); Lateral band walk 3x15/side (heavy band); Copenhagen adductor hold 3x8/side (3-sec holds).",
        },
        {
          date: "2026-08-16",
          day_name: "Sun",
          title: "LONG RUN 13 mi",
          detail:
            "Z2. Gel at miles 5 and 10. Race-day fueling practice.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-08-10",
      end_date: "2026-08-16",
    },
    {
      num: 17,
      phase: 4,
      mileage: 33,
      theme:
        "Peak mileage of Phase 2. Mile-pace specificity introduced on Thu.",
      days: [
        {
          date: "2026-08-17",
          day_name: "Mon",
          title: "TRACK: 12×400m",
          detail:
            "WU 1.5 mi → 12×400m at Z5-Z6 (1:33-1:40 per rep) w/ 75-sec rest → CD 1 mi.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-08-18",
          day_name: "Tue",
          title: "REST",
          detail:
            "Hip protocol.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-08-19",
          day_name: "Wed",
          title: "Peloton 50 min",
          detail:
            "Z2-Z3 moderate intensity.",
          routines: ["hip_protocol", "pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-08-20",
          day_name: "Thu",
          title: "MILE-PACE 3×600m",
          detail:
            "WU 1.5 mi → 3×600m @ mile goal pace (6:10-6:20/mi = ~2:18-2:23 per rep) w/ 3-min rest → 2 mi Z2 CD.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-08-21",
          day_name: "Fri",
          title: "Yoga 50 min",
          detail:
            "Hip-focused; add supine twist and legs-up-wall.",
          routines: ["hip_protocol", "yoga"],
          strength: null,
        },
        {
          date: "2026-08-22",
          day_name: "Sat",
          title: "Block A",
          detail:
            "Full load.",
          routines: ["hip_protocol"],
          strength:
            "BLOCK A (60-75 min, Saturday gym): Barbell Romanian Deadlift 4x6 (heavy, hip hinge); Bulgarian split squat 3x8/leg (right leg as REAR to load right glute); Barbell hip thrust 4x8 (drive through right heel); Nordic hamstring curl 3x6 (slow eccentric); Lateral band walk 3x15/side (heavy band); Copenhagen adductor hold 3x8/side (3-sec holds).",
        },
        {
          date: "2026-08-23",
          day_name: "Sun",
          title: "LONG RUN 13 mi",
          detail:
            "Z2. Miles 10-12 at Z3 (8:15-8:30) as a light progression.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-08-17",
      end_date: "2026-08-23",
    },
    {
      num: 18,
      phase: 5,
      mileage: 30,
      theme:
        "Phase 3 begins. Transition/peak — high-quality 400s with race-pace work.",
      days: [
        {
          date: "2026-08-24",
          day_name: "Mon",
          title: "TRACK: 2×(4×400m)",
          detail:
            "WU 1.5 mi → Set 1: 4×400m @ ~1:30 w/ 90-sec rest; 4-min break; Set 2: 4×400m @ ~1:32 w/ 90-sec rest → CD 1 mi.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-08-25",
          day_name: "Tue",
          title: "REST",
          detail:
            "Hip protocol + compression legs.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-08-26",
          day_name: "Wed",
          title: "Peloton 45 min",
          detail:
            "Z2 recovery.",
          routines: ["hip_protocol", "pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-08-27",
          day_name: "Thu",
          title: "TEMPO 7 mi",
          detail:
            "1 mi Z2 → 5 mi Z4 (7:25-7:40/mi) → 1 mi Z2.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-08-28",
          day_name: "Fri",
          title: "Yoga 50 min",
          detail:
            "Deep hip and IT band work.",
          routines: ["hip_protocol", "yoga"],
          strength: null,
        },
        {
          date: "2026-08-29",
          day_name: "Sat",
          title: "Block B",
          detail:
            "Last heavy lift before sharpening phase.",
          routines: ["hip_protocol"],
          strength:
            "BLOCK B (60-75 min, Saturday gym): Trap bar deadlift 4x5 (heavy); Single-leg box step-up 3x10/leg (moderate DBs, controlled descent); Goblet squat 3x10 (tempo: 3 sec down, 1 sec up); Single-leg RDL 3x8/leg (right-side balance focus); Pallof press 3x12/side (anti-rotation); Glute-ham raise OR band pull-through 3x10.",
        },
        {
          date: "2026-08-30",
          day_name: "Sun",
          title: "LONG RUN 13 mi",
          detail:
            "Z2. Comfort and consistency.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-08-24",
      end_date: "2026-08-30",
    },
    {
      num: 19,
      phase: 5,
      mileage: 26,
      theme:
        "SHARPENING. 400s at mile race pace. Last moderate lift before taper.",
      days: [
        {
          date: "2026-08-31",
          day_name: "Mon",
          title: "TRACK: 8×400m @ mile pace",
          detail:
            "WU 1.5 mi → 8×400m @ 1:28-1:33 (5:52-6:12/mi) w/ 90-sec rest → CD 1 mi.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-09-01",
          day_name: "Tue",
          title: "REST",
          detail:
            "Hip protocol.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-09-02",
          day_name: "Wed",
          title: "Peloton 45 min",
          detail:
            "Z2 recovery ride.",
          routines: ["hip_protocol", "pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-09-03",
          day_name: "Thu",
          title: "Easy 5 mi w/ strides",
          detail:
            "Z2 + 6 strides (final 2 at mile-race effort, ~30-sec bursts).",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-09-04",
          day_name: "Fri",
          title: "Yoga 45 min",
          detail:
            "Light hip flow.",
          routines: ["hip_protocol", "yoga"],
          strength: null,
        },
        {
          date: "2026-09-05",
          day_name: "Sat",
          title: "Block A (70% load)",
          detail:
            "Block A at 70% — last moderate lift before taper.",
          routines: ["hip_protocol"],
          strength:
            "BLOCK A — 70% load (sharpening / last moderate lift before taper): Barbell RDL 4x6; Bulgarian split squat 3x8/leg; Barbell hip thrust 4x8; Nordic hamstring curl 3x6; Lateral band walk 3x15/side; Copenhagen hold 3x8/side. Same exercises at moderate load.",
        },
        {
          date: "2026-09-06",
          day_name: "Sun",
          title: "LONG RUN 11 mi",
          detail:
            "Z2, relaxed.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-08-31",
      end_date: "2026-09-06",
    },
    {
      num: 20,
      phase: 5,
      mileage: 17,
      theme:
        "MILE TAPER. Race simulation Monday. Volume drops. Trust the work.",
      days: [
        {
          date: "2026-09-07",
          day_name: "Mon",
          title: "TRACK: race simulation",
          detail:
            "WU 2 mi → 1×800m @ 2:52 (5:44/mi effort) → full rest 5 min → 1×600m @ 2:05 (5:34/mi) → rest 4 min → 4×200m @ 0:54-0:56 w/ 2-min rest → CD 1.5 mi.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-09-08",
          day_name: "Tue",
          title: "REST",
          detail:
            "Compression legs. Hip protocol.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-09-09",
          day_name: "Wed",
          title: "Easy 3 mi",
          detail:
            "Z1-Z2, very light.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-09-10",
          day_name: "Thu",
          title: "Easy 3 mi",
          detail:
            "Z2 + 2 strides.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-09-11",
          day_name: "Fri",
          title: "Yoga 20 min",
          detail:
            "Short restorative only — no deep holds that create soreness.",
          routines: ["hip_protocol", "yoga"],
          strength: null,
        },
        {
          date: "2026-09-12",
          day_name: "Sat",
          title: "Rest or 20-min jog",
          detail:
            "No gym. Eat well, sleep well. Optional 20-min easy shake-out only.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-09-13",
          day_name: "Sun",
          title: "Easy 3 mi",
          detail:
            "Z1-Z2. Shake out the legs before the travel / race prep week.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-09-07",
      end_date: "2026-09-13",
    },
    {
      num: 21,
      phase: 5,
      mileage: 10,
      theme:
        "MILE RACE WEEK. Race-pace preview Mon. Race Saturday Sep 19 — Copenhagen sub-6:00.",
      days: [
        {
          date: "2026-09-14",
          day_name: "Mon",
          title: "TRACK: race preview",
          detail:
            "WU 1.5 mi → 2×400m @ race pace (1:27-1:29) w/ 4-min rest → 2×200m fast → CD 1.5 mi.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-09-15",
          day_name: "Tue",
          title: "REST",
          detail:
            "Hip protocol.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-09-16",
          day_name: "Wed",
          title: "Peloton 30 min",
          detail:
            "Easy Z1-Z2 spin.",
          routines: ["hip_protocol", "pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-09-17",
          day_name: "Thu",
          title: "Easy 2 mi + strides",
          detail:
            "Z2, very short. 4×100m strides. Race is in 2 days.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-09-18",
          day_name: "Fri",
          title: "REST",
          detail:
            "Light hip protocol + foam roll. No yoga today. Off feet.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-09-19",
          day_name: "Sat",
          title: "MILE B-RACE — Copenhagen",
          detail:
            "RACE DAY! Sub-6:00 road mile, Copenhagen. WU: 10 min easy jog → dynamic drills (leg swings, A-skips, high knees) → 3×100m strides building to race effort → hip mini-set (clamshells + glute bridges). Splits: Lap 1 1:30-1:32 (resist going fast); Lap 2 1:28-1:30 (settle); Lap 3 1:28-1:30 (stay tall, don't tighten); Lap 4 1:24-1:28 (empty the tank, drive arms). Pre-race: light meal 2-3 hrs before; half gel + 8 oz water 30 min before. CELEBRATE.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-09-20",
          day_name: "Sun",
          title: "REST + recovery",
          detail:
            "Full recovery. Compression legs. Easy walk only. You earned it.",
          routines: ["hip_protocol"],
          strength: null,
        },
      ],
      start_date: "2026-09-14",
      end_date: "2026-09-20",
    },
    {
      num: 22,
      phase: 6,
      mileage: 28,
      theme:
        "Phase 4 begins. POST-RACE TRANSITION. Capitalize on mile speed. Shift to half-marathon work.",
      days: [
        {
          date: "2026-09-21",
          day_name: "Mon",
          title: "Easy 4 mi",
          detail:
            "Z2 only. Assess soreness from mile race.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-09-22",
          day_name: "Tue",
          title: "REST",
          detail:
            "Foam roll + compression legs. Full recovery.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-09-23",
          day_name: "Wed",
          title: "Peloton 45 min",
          detail:
            "Z2 recovery spin.",
          routines: ["hip_protocol", "pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-09-24",
          day_name: "Thu",
          title: "Easy 5 mi",
          detail:
            "Z2 + 4 strides.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-09-25",
          day_name: "Fri",
          title: "Yoga 50 min",
          detail:
            "Return to full hip-opening flow.",
          routines: ["hip_protocol", "yoga"],
          strength: null,
        },
        {
          date: "2026-09-26",
          day_name: "Sat",
          title: "Block A",
          detail:
            "Return to full strength work.",
          routines: ["hip_protocol"],
          strength:
            "BLOCK A (60-75 min, Saturday gym): Barbell Romanian Deadlift 4x6 (heavy, hip hinge); Bulgarian split squat 3x8/leg (right leg as REAR to load right glute); Barbell hip thrust 4x8 (drive through right heel); Nordic hamstring curl 3x6 (slow eccentric); Lateral band walk 3x15/side (heavy band); Copenhagen adductor hold 3x8/side (3-sec holds).",
        },
        {
          date: "2026-09-27",
          day_name: "Sun",
          title: "LONG RUN 12 mi",
          detail:
            "Z2 (9:00-9:15/mi). Getting the long-run legs back.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-09-21",
      end_date: "2026-09-27",
    },
    {
      num: 23,
      phase: 6,
      mileage: 30,
      theme:
        "Half-pace work introduced. 4×1.5mi tempos at goal HM pace (8:00/mi).",
      days: [
        {
          date: "2026-09-28",
          day_name: "Mon",
          title: "TEMPO: 4×1.5mi @ HM pace",
          detail:
            "WU 1.5 mi → 4×1.5 mi at goal half pace (8:00/mi) w/ 90-sec jog → CD 1.5 mi.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-09-29",
          day_name: "Tue",
          title: "REST",
          detail:
            "Hip protocol.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-09-30",
          day_name: "Wed",
          title: "Peloton 55 min",
          detail:
            "Z3 structured: 4×8 min efforts.",
          routines: ["hip_protocol", "pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-10-01",
          day_name: "Thu",
          title: "Easy 5 mi",
          detail:
            "Z2 + 6 strides.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-10-02",
          day_name: "Fri",
          title: "Yoga 50 min",
          detail:
            "Hip-focused flow.",
          routines: ["hip_protocol", "yoga"],
          strength: null,
        },
        {
          date: "2026-10-03",
          day_name: "Sat",
          title: "Block B (70% load)",
          detail:
            "Block B at 70% — last meaningful lift before half taper.",
          routines: ["hip_protocol"],
          strength:
            "BLOCK B — 70% load (last meaningful lift before half taper): Trap bar deadlift 4x5; Single-leg box step-up 3x10/leg; Goblet squat 3x10 (tempo); Single-leg RDL 3x8/leg; Pallof press 3x12/side; GHR or band pull-through 3x10.",
        },
        {
          date: "2026-10-04",
          day_name: "Sun",
          title: "LONG RUN 14 mi",
          detail:
            "Miles 1-10 Z2 → Miles 11-13 at Z3 (8:15-8:30/mi) → Mile 14 easy. Gel at miles 5 and 10.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-09-28",
      end_date: "2026-10-04",
    },
    {
      num: 24,
      phase: 6,
      mileage: 31,
      theme:
        "HALF MARATHON PEAK. Final long training run. Hold confident effort all the way.",
      days: [
        {
          date: "2026-10-05",
          day_name: "Mon",
          title: "TEMPO 8 mi: 5 mi @ HM pace",
          detail:
            "1.5 mi Z2 → 5 mi at 8:00/mi → 1.5 mi CD.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-10-06",
          day_name: "Tue",
          title: "REST",
          detail:
            "Hip protocol.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-10-07",
          day_name: "Wed",
          title: "Peloton 50 min",
          detail:
            "Z2-Z3 moderate: 3×8 min efforts.",
          routines: ["hip_protocol", "pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-10-08",
          day_name: "Thu",
          title: "Easy 5 mi",
          detail:
            "Z2 + 4 strides.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-10-09",
          day_name: "Fri",
          title: "Yoga 50 min",
          detail:
            "Hip-focused flow.",
          routines: ["hip_protocol", "yoga"],
          strength: null,
        },
        {
          date: "2026-10-10",
          day_name: "Sat",
          title: "Block A (70% load)",
          detail:
            "Block A at 70% — last meaningful strength session.",
          routines: ["hip_protocol"],
          strength:
            "BLOCK A — 70% load (sharpening / last moderate lift before taper): Barbell RDL 4x6; Bulgarian split squat 3x8/leg; Barbell hip thrust 4x8; Nordic hamstring curl 3x6; Lateral band walk 3x15/side; Copenhagen hold 3x8/side. Same exercises at moderate load.",
        },
        {
          date: "2026-10-11",
          day_name: "Sun",
          title: "LONG RUN 13 mi",
          detail:
            "Z2 the whole way. This is your final long training run. Run it easy and confident.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-10-05",
      end_date: "2026-10-11",
    },
    {
      num: 25,
      phase: 7,
      mileage: 22,
      theme:
        "Phase 5 begins. TAPER BEGINS. Volume drops, intensity moderates. Arrive fresh and sharp.",
      days: [
        {
          date: "2026-10-12",
          day_name: "Mon",
          title: "TEMPO 3mi @ HM pace",
          detail:
            "WU 1.5 mi → 3 mi at 8:00/mi goal pace → CD 1 mi. Should feel controlled and strong.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-10-13",
          day_name: "Tue",
          title: "REST",
          detail:
            "Hip protocol.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-10-14",
          day_name: "Wed",
          title: "Peloton 35 min",
          detail:
            "Easy Z2 spin.",
          routines: ["hip_protocol", "pre_bike", "post_bike"],
          strength: null,
        },
        {
          date: "2026-10-15",
          day_name: "Thu",
          title: "Easy 4 mi",
          detail:
            "Z2 + 4 strides.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-10-16",
          day_name: "Fri",
          title: "Yoga 20 min",
          detail:
            "Short restorative flow only — no deep holds that create soreness.",
          routines: ["hip_protocol", "yoga"],
          strength: null,
        },
        {
          date: "2026-10-17",
          day_name: "Sat",
          title: "Bodyweight only",
          detail:
            "No heavy lifting. Bodyweight squats, glute bridges, band work only.",
          routines: ["hip_protocol"],
          strength:
            "STRENGTH LIGHT (~25 min, bodyweight only — TAPER WEEK): No heavy lifting. Bodyweight squat 2x12; glute bridge 2x15; push-up 2x10-15; band row 2x12; side plank 2x30s/side; dead bug 2x10/side. Maintenance only — keep RPE 5-6.",
        },
        {
          date: "2026-10-18",
          day_name: "Sun",
          title: "Easy 8 mi",
          detail:
            "Z2, relaxed. Last real long run.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-10-12",
      end_date: "2026-10-18",
    },
    {
      num: 26,
      phase: 7,
      mileage: 5,
      theme:
        "RACE WEEK — DRESDEN. Sun Oct 25 — sub-1:45 half marathon. Trust the work. Arrive fresh.",
      days: [
        {
          date: "2026-10-19",
          day_name: "Mon",
          title: "Shake-out + strides",
          detail:
            "20-min easy jog → 4×20-sec strides at race effort → done.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-10-20",
          day_name: "Tue",
          title: "REST",
          detail:
            "Light walk. Off feet. Hydrate aggressively (clear urine).",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-10-21",
          day_name: "Wed",
          title: "Easy 20 min",
          detail:
            "Z1 only. Just moving — shake out the legs.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-10-22",
          day_name: "Thu",
          title: "REST",
          detail:
            "Hip protocol + foam roll + compression legs.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-10-23",
          day_name: "Fri",
          title: "REST / travel",
          detail:
            "Light foam roll. Off feet as much as possible. Travel day if needed. Carb-emphasized dinner.",
          routines: ["hip_protocol"],
          strength: null,
        },
        {
          date: "2026-10-24",
          day_name: "Sat",
          title: "10-min shake-out + strides",
          detail:
            "10-min easy jog + 2 strides. Shake out the nerves. Nothing more. Bib pickup; rest of day off feet. Lay out kit. In bed by 10pm.",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
        {
          date: "2026-10-25",
          day_name: "Sun",
          title: "RACE DAY — Dresden Half",
          detail:
            "RACE DAY! Sub-1:45 half marathon, Dresden. Splits: Mi 1-3 8:10-8:15 (start conservative); Mi 4-7 8:00-8:05 (settle into goal); Mi 8-10 7:55-8:00 (small negative split); Mi 11-12 7:45-7:55 (race); Mi 13-13.1 all out. Pre-race: oatmeal/bagel + PB + banana + coffee 3 hrs before; 1 gel + 8-12 oz water 30 min before. During: 1 gel mile 4, 1 gel mile 8; water at every aid station. Mental cues: Mi 1 'hold back'; Mi 6 'here we go'; Mi 10 'only a 5K left'; Mi 12 'this is what you trained for.'",
          routines: ["hip_protocol", "pre_run", "post_run"],
          strength: null,
        },
      ],
      start_date: "2026-10-19",
      end_date: "2026-10-25",
    },
  ],
};
