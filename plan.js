// Training plan data - edit this file to update workouts without touching app code.
// Loaded via <script src="plan.js"> before the main app script.
// NRC-based dual-race plan: 3-week base/strength block (wk10-12) then the Nike Run
// Club 14-week half-marathon plan (wk13-26), scaled up to ~35 mpw peak off a 20+ mi base.
// Weekly layout: Mon recovery - Tue rest - Wed+Fri NRC speed - Thu recovery+Strength B - Sat Strength A+bike - Sun long.
// Mile B-race Sep 19 is run as a hard tune-up (no real taper). Half A-race Oct 25.
// Weeks 1-9 (through 2026-06-28) are the original/completed workouts, untouched.

const DATA = {
  "meta": {
    "name": "Katie",
    "race_date": "2026-10-25",
    "race_name": "Dresden Half Marathon",
    "race_goal": "Sub-1:45 (8:00/mi)",
    "b_race_date": "2026-09-19",
    "b_race_name": "Copenhagen 1-Mile",
    "b_race_goal": "Sub-6:00",
    "plan_start": "2026-04-27",
    "weeks_total": 26,
    "goal_mile": "Sub-6:00 (B-race Sep 19, Copenhagen)",
    "goal_half": "Sub-1:45 half marathon (A-race Oct 25, Dresden)"
  },
  "phases": [
    {
      "num": 1,
      "name": "Foundation & Rebuild",
      "weeks": "1-4",
      "color": "#5CB88A",
      "goal": "Settle the ankle, address hip/shin, build durability with low-volume aerobic running. Daily mobility becomes a habit."
    },
    {
      "num": 2,
      "name": "Aerobic Base",
      "weeks": "5-7",
      "color": "#A8D8EA",
      "goal": "Steadily increase mileage. Add hill strides and fartlek to wake up neuromuscular system without high-impact intensity."
    },
    {
      "num": 3,
      "name": "Half-Marathon Base Build",
      "weeks": "8-12",
      "color": "#6B9FD4",
      "goal": "Weeks 8-9 done. Weeks 10-12: a dedicated base + strength block before the NRC plan — hold ~22-24 mpw easy with strides/light fartlek and two strength days, arriving at the NRC build with a 20+ mi/wk base."
    },
    {
      "num": 4,
      "name": "Speed Development (Mile Prep)",
      "weeks": "13-17",
      "color": "#D4A050",
      "goal": "Nike Run Club 14-week half plan begins (scaled up off your base). Two NRC speed sessions/week — intervals, fartlek, hills, tempo — plus progression long runs. Build 25 -> 30 mpw."
    },
    {
      "num": 5,
      "name": "Mile Peak & Taper",
      "weeks": "18-21",
      "color": "#9B7FCA",
      "goal": "Peak the aerobic build toward ~35 mpw with NRC's faster mixed-pace work. Race the Copenhagen 1-mile (Sep 19) as a hard tune-up — no real taper, keep half volume."
    },
    {
      "num": 6,
      "name": "Half Marathon Build",
      "weeks": "22-24",
      "color": "#3B7D72",
      "goal": "Half-specific peak: longest runs of the plan (to ~13 mi) and race-pace tempos, ~33-35 mpw, then volume eases."
    },
    {
      "num": 7,
      "name": "Half Marathon Taper",
      "weeks": "25-26",
      "color": "#B85450",
      "goal": "Taper. Cut volume, keep legs sharp with short race-pace touches. Race Oct 25 — sub-1:45 in Dresden."
    }
  ],
  "pace_ref": {
    "easy": "9:30-10:30/mi (conversational, can chat in full sentences)",
    "long": "9:30-10:00/mi (steady, comfortable)",
    "marathon": "8:30-9:00/mi",
    "tempo_HM": "8:00-8:15/mi (comfortably hard, controlled breathing)",
    "tempo_10K": "7:30-7:45/mi",
    "5K": "7:00-7:15/mi",
    "3K": "6:30-6:40/mi",
    "mile_goal": "6:00/mi = 90s/400m, 45s/200m, 22.5s/100m",
    "mile_stretch": "5:45/mi = 86s/400m, 43s/200m",
    "recovery": "10:30-11:30/mi"
  },
  "routines": {
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
    "yoga": "YOGA (45-60 min, Fridays): Hip-focused flow or yin yoga. Priority poses: pigeon (right side 2+ min); lizard lunge; supine figure-4 / thread the needle; supine twisted root; low lunge with twist; reclined butterfly; legs up the wall (5 min at end). Taper weeks: 20-min restorative only — no deep holds that create soreness. Use a Peloton yoga class or a structured YouTube runner's flow."
  },
  "strength": {
    "A_full_gym": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets.",
    "B_home": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20.",
    "light_taper": "STRENGTH LIGHT (~25 min): Bodyweight squat 2x12; glute bridge 2x15; push-up 2x10-15; band row 2x12; side plank 2x30s; dead bug 2x10/side. Keep RPE 5-6 - maintenance only."
  },
  "weeks": [
    {
      "num": 1,
      "phase": 1,
      "mileage": 14,
      "theme": "Re-entry. Easy effort only. Build habit of mobility.",
      "days": [
        {
          "date": "2026-04-27",
          "day_name": "Mon",
          "title": "Easy run",
          "detail": "3 mi easy @ 9:45-10:30/mi. Pre-run + post-run routines. Listen to ankle.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-04-28",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Full rest. Mon-night sleep is usually short - today is recovery. Mobility routine + 15-min walk if restless. Couch stretch 90s/side.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-04-29",
          "day_name": "Wed",
          "title": "Easy run + drills",
          "detail": "3 mi easy. Add drills before run: A-skips 2x30m, B-skips 2x30m, high-knee carioca 2x30m.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-04-30",
          "day_name": "Thu",
          "title": "Easy run + Strength B",
          "detail": "3 mi easy + Strength B (home). Strength B is short and light - you'll be fresh enough.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-05-01",
          "day_name": "Fri",
          "title": "Bike + core",
          "detail": "Peloton 45 min Power Zone Endurance (Z2). 10 min core after: dead bug 3x10/side, side plank 2x30s/side, Pallof press 3x10/side.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": null
        },
        {
          "date": "2026-05-02",
          "day_name": "Sat",
          "title": "Strength A + bike",
          "detail": "Strength A (full gym, ~50 min) + 30 min easy Peloton ride. No run today - your gym day. Core is on the bike, focus on quality lifting form.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets."
        },
        {
          "date": "2026-05-03",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "5 mi easy. Aim for last mile slightly faster than first. Walk breaks ok. Legs may feel slightly heavy from yesterday's gym - that's fine, just ease into it.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-04-27",
      "end_date": "2026-05-03"
    },
    {
      "num": 2,
      "phase": 1,
      "mileage": 16,
      "theme": "Tiny step up. Notice ankle/shin daily - 0-3/10 pain ok, 4+ means back off.",
      "days": [
        {
          "date": "2026-05-04",
          "day_name": "Mon",
          "title": "Easy run",
          "detail": "3 mi easy.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-05-05",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Full rest. Foam roll quads + IT band 5 min/side.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-05-06",
          "day_name": "Wed",
          "title": "Easy run + 4x20s strides",
          "detail": "4 mi easy + 4x20s strides at end (FAST but relaxed; full walk-back recovery).",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-05-07",
          "day_name": "Thu",
          "title": "Easy run + Strength B",
          "detail": "3 mi easy + Strength B.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-05-08",
          "day_name": "Fri",
          "title": "Bike + core",
          "detail": "Peloton 45 min Z2 + core block.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": null
        },
        {
          "date": "2026-05-09",
          "day_name": "Sat",
          "title": "Strength A + bike",
          "detail": "Strength A + 30 min easy Peloton ride.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets."
        },
        {
          "date": "2026-05-10",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "6 mi easy.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-05-04",
      "end_date": "2026-05-10"
    },
    {
      "num": 3,
      "phase": 1,
      "mileage": 18,
      "theme": "Begin to feel like a runner again. Strides are non-negotiable.",
      "days": [
        {
          "date": "2026-05-11",
          "day_name": "Mon",
          "title": "Easy run",
          "detail": "3 mi easy.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-05-12",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Yoga or restorative stretching 20 min.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-05-13",
          "day_name": "Wed",
          "title": "Easy + drills + strides",
          "detail": "4 mi easy + drills (A/B-skips, carioca) + 4x20s strides.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-05-14",
          "day_name": "Thu",
          "title": "Easy run + Strength B",
          "detail": "4 mi easy + Strength B.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-05-15",
          "day_name": "Fri",
          "title": "Bike Z2 + core",
          "detail": "Peloton 50 min Z2 endurance ride + core.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": null
        },
        {
          "date": "2026-05-16",
          "day_name": "Sat",
          "title": "Strength A + bike",
          "detail": "Strength A + 30 min easy bike. If feeling strong, work up to a top set on squat at RPE 7.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets."
        },
        {
          "date": "2026-05-17",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "7 mi easy. First time at 7 - slow down if breathing labored.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-05-11",
      "end_date": "2026-05-17"
    },
    {
      "num": 4,
      "phase": 1,
      "mileage": 16,
      "theme": "DELOAD. Recovery week - hold or slightly reduce. Re-evaluate hip/shin.",
      "days": [
        {
          "date": "2026-05-18",
          "day_name": "Mon",
          "title": "Easy run",
          "detail": "3 mi easy.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-05-19",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Full rest.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-05-20",
          "day_name": "Wed",
          "title": "Easy + 6x20s strides",
          "detail": "4 mi easy + 6x20s strides - more strides this week, no other pace work.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-05-21",
          "day_name": "Thu",
          "title": "Easy run + Strength B",
          "detail": "3 mi easy + Strength B.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-05-22",
          "day_name": "Fri",
          "title": "Bike easy",
          "detail": "Peloton 40 min Z2 + core.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": null
        },
        {
          "date": "2026-05-23",
          "day_name": "Sat",
          "title": "Strength A (lighter) + bike",
          "detail": "Strength A with moderate weights (RPE 7), focus on form. + 30 min easy bike.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets."
        },
        {
          "date": "2026-05-24",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "6 mi easy - purposely shorter than last week. End of Phase 1 - reflect: ankle? hip? shin? sleep? Adjust Phase 2 starting volume if anything is sore.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-05-18",
      "end_date": "2026-05-24"
    },
    {
      "num": 5,
      "phase": 2,
      "mileage": 20,
      "theme": "Add hill strides. Bigger long run. You're rebuilding your engine.",
      "days": [
        {
          "date": "2026-05-25",
          "day_name": "Mon",
          "title": "Easy run",
          "detail": "3 mi easy.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-05-26",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Mobility 15 min. Couch stretch and 90/90 hip work emphasized.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-05-27",
          "day_name": "Wed",
          "title": "Hill strides",
          "detail": "4 mi: 1 mi WU; 6x20s hill strides on a moderate hill (relaxed but hard, jog down full recovery); 2 mi easy CD. Hills = strength + form without impact.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-05-28",
          "day_name": "Thu",
          "title": "Easy + Strength B",
          "detail": "4 mi easy + Strength B.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-05-29",
          "day_name": "Fri",
          "title": "Bike + core",
          "detail": "Peloton 45 min Z2 + core.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": null
        },
        {
          "date": "2026-05-30",
          "day_name": "Sat",
          "title": "Strength A + bike",
          "detail": "Strength A + 30 min easy Peloton spin.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets."
        },
        {
          "date": "2026-05-31",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "9 mi easy - keep effort honest, conversational throughout.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-05-25",
      "end_date": "2026-05-31"
    },
    {
      "num": 6,
      "phase": 2,
      "mileage": 22,
      "theme": "First quality session. Intro fartlek — controlled effort, not all-out. Add 5 lb to lifts if last week felt strong.",
      "days": [
        {
          "date": "2026-06-01",
          "day_name": "Mon",
          "title": "Easy run",
          "detail": "4 mi easy.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-06-02",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Foam roll session 15 min.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-06-03",
          "day_name": "Wed",
          "title": "Intro Fartlek",
          "detail": "5 mi: 1 mi WU; 8x(45s ON @ comfortably hard / 90s easy jog); 1.5 mi CD. First quality session — ON segments should feel controlled, not all-out. Focus on smooth turnover.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-06-04",
          "day_name": "Thu",
          "title": "Bike + core",
          "detail": "Peloton 45 min Z2 + core.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": null
        },
        {
          "date": "2026-06-05",
          "day_name": "Fri",
          "title": "Easy + Strength B",
          "detail": "4 mi easy + Strength B.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-06-06",
          "day_name": "Sat",
          "title": "Strength A + bike",
          "detail": "Strength A + 30 min easy bike. Top squat set at RPE 7-8.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets."
        },
        {
          "date": "2026-06-07",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "9 mi easy.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-06-01",
      "end_date": "2026-06-07"
    },
    {
      "num": 7,
      "phase": 2,
      "mileage": 24,
      "theme": "Build fartlek. More volume on the ON segments — still controlled.",
      "days": [
        {
          "date": "2026-06-08",
          "day_name": "Mon",
          "title": "Easy run",
          "detail": "4 mi easy.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-06-09",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Rest. Mobility + walk.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-06-10",
          "day_name": "Wed",
          "title": "Fartlek",
          "detail": "5 mi: 1.5 mi WU; 10x(1 min ON @ 10K effort / 1 min easy jog); 1 mi CD. ON segments should feel comfortably hard, not all-out.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-06-11",
          "day_name": "Thu",
          "title": "Easy + Strength B",
          "detail": "4 mi easy + Strength B.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-06-12",
          "day_name": "Fri",
          "title": "Recovery run",
          "detail": "2 mi VERY easy - the slower the better. No watch.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-06-13",
          "day_name": "Sat",
          "title": "Strength A + bike",
          "detail": "Strength A + 30 min easy Peloton.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets."
        },
        {
          "date": "2026-06-14",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "9 mi easy.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-06-08",
      "end_date": "2026-06-14"
    },
    {
      "num": 8,
      "phase": 3,
      "mileage": 20,
      "theme": "RETURN FROM INJURY. Conservative re-entry; settle the hip before loading anything hard. If pain by Day 3, take the full week as rest and push start to Jun 22.",
      "days": [
        {
          "date": "2026-06-15",
          "day_name": "Mon",
          "title": "Easy 3 mi",
          "detail": "3 mi easy @ Z2 (9:00-9:30/mi). Take stock of how the injury feels — if pain, rest immediately. Hip protocol before run.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-06-16",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Full rest. Hip protocol + foam rolling.",
          "routines": [
            "hip_protocol"
          ],
          "strength": null
        },
        {
          "date": "2026-06-17",
          "day_name": "Wed",
          "title": "Peloton 40 min",
          "detail": "Easy recovery spin — Z1-Z2, low resistance, cadence 85-95 rpm.",
          "routines": [
            "hip_protocol",
            "pre_bike",
            "post_bike"
          ],
          "strength": null
        },
        {
          "date": "2026-06-18",
          "day_name": "Thu",
          "title": "Easy 3 mi",
          "detail": "Z2 conversational pace. Hip protocol before run.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-06-19",
          "day_name": "Fri",
          "title": "Light tempo / fartlek",
          "detail": "5:00 WU · 12-15:00 steady @ ~8:20-8:30/mi (comfortably hard) · 5:00 CD",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-06-20",
          "day_name": "Sat",
          "title": "Strength — heavy lift",
          "detail": "Heavy gym session (no running today). Posterior chain + single-leg + core.",
          "routines": [
            "hip_protocol"
          ],
          "strength": "BLOCK B (60-75 min, Saturday gym): Trap bar deadlift 4x5 (heavy); Single-leg box step-up 3x10/leg (moderate DBs, controlled descent); Goblet squat 3x10 (tempo: 3 sec down, 1 sec up); Single-leg RDL 3x8/leg (right-side balance focus); Pallof press 3x12/side (anti-rotation); Glute-ham raise OR band pull-through 3x10."
        },
        {
          "date": "2026-06-21",
          "day_name": "Sun",
          "title": "Long run 7 mi",
          "detail": "7 mi as a progression: ease in ~9:15/mi, finish ~8:15/mi.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-06-15",
      "end_date": "2026-06-21"
    },
    {
      "num": 9,
      "phase": 3,
      "mileage": 19,
      "theme": "Aerobic lead-in",
      "days": [
        {
          "date": "2026-06-22",
          "day_name": "Mon",
          "title": "Recovery run",
          "detail": "Easy 30-35 min @ ~9:50-10:30/mi — fully conversational. Keep it genuinely easy.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-06-23",
          "day_name": "Tue",
          "title": "Rest / cross-train",
          "detail": "No running. Optional: yoga, core, or an easy 30-min Peloton spin — any of those, or full rest. Daily hip mobility.",
          "routines": [
            "hip_protocol"
          ],
          "strength": null
        },
        {
          "date": "2026-06-24",
          "day_name": "Wed",
          "title": "Easy + strides",
          "detail": "4 mi easy @ 9:45-10:30, then 4×20s relaxed strides (smooth and quick, full walk-back - not a workout). ~4 mi.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-06-25",
          "day_name": "Thu",
          "title": "Peloton + Strength B",
          "detail": "Peloton 40-45 min Power Zone Endurance (Z2), easy aerobic spin (no impact), then Strength B (home).",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-06-26",
          "day_name": "Fri",
          "title": "Easy run",
          "detail": "4 mi easy @ 9:45-10:30, conversational. Keep it relaxed and aerobic during the base block - nothing hard. ~4 mi.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-06-27",
          "day_name": "Sat",
          "title": "Strength — heavy lift",
          "detail": "Heavy gym session (no running today). Posterior chain + single-leg + core.",
          "routines": [
            "hip_protocol"
          ],
          "strength": "BLOCK A (60-75 min, Saturday gym): Barbell Romanian Deadlift 4x6 (heavy, hip hinge); Bulgarian split squat 3x8/leg (right leg as REAR to load right glute); Barbell hip thrust 4x8 (drive through right heel); Nordic hamstring curl 3x6 (slow eccentric); Lateral band walk 3x15/side (heavy band); Copenhagen adductor hold 3x8/side (3-sec holds)."
        },
        {
          "date": "2026-06-28",
          "day_name": "Sun",
          "title": "Long run 8 mi",
          "detail": "8 mi as a progression: ease in ~9:15/mi, finish ~8:15/mi.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-06-22",
      "end_date": "2026-06-28"
    },
    {
      "num": 10,
      "phase": 3,
      "mileage": 19,
      "theme": "Base wk1 (pre-block): easy aerobic miles + a little stride work. The goal is to arrive at the 14-week plan healthy and strong - not to train hard yet.",
      "days": [
        {
          "date": "2026-06-29",
          "day_name": "Mon",
          "title": "Recovery run",
          "detail": "3 mi easy @ 9:45-10:30/mi, conversational. Ease in - all easy this block.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-06-30",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Full rest + daily mobility. 15-min walk or easy spin if restless.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-07-01",
          "day_name": "Wed",
          "title": "Easy + strides",
          "detail": "4 mi easy @ 9:45-10:30, then 4x20s relaxed strides (smooth and quick, full walk-back - not a workout). ~4 mi.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-07-02",
          "day_name": "Thu",
          "title": "Peloton + Strength B",
          "detail": "Peloton 40-45 min Power Zone Endurance (Z2), easy aerobic spin (no impact), then Strength B (home).",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-07-03",
          "day_name": "Fri",
          "title": "Recovery run",
          "detail": "4 mi easy @ 9:45-10:30/mi, conversational. Keep it gentle.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-07-04",
          "day_name": "Sat",
          "title": "Strength A + bike",
          "detail": "Strength A (full gym) + 30 min easy Z2 Peloton spin. No run today.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets."
        },
        {
          "date": "2026-07-05",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "8 mi easy/steady @ 9:45-10:15, relaxed and conversational. Just aerobic time on feet - no fast finish during the base block.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-06-29",
      "end_date": "2026-07-05"
    },
    {
      "num": 11,
      "phase": 3,
      "mileage": 21,
      "theme": "Base wk2: a touch more volume, same easy effort. Strides keep the legs springy without any real quality work.",
      "days": [
        {
          "date": "2026-07-06",
          "day_name": "Mon",
          "title": "Recovery run",
          "detail": "4 mi easy @ 9:45-10:30/mi, conversational.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-07-07",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Full rest + daily mobility. 15-min walk or easy spin if restless.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-07-08",
          "day_name": "Wed",
          "title": "Easy + strides",
          "detail": "5 mi easy @ 9:45-10:30, then 5x20s relaxed strides (smooth and quick, full walk-back - not a workout). ~5 mi.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-07-09",
          "day_name": "Thu",
          "title": "Peloton + Strength B",
          "detail": "Peloton 40-45 min Power Zone Endurance (Z2), easy aerobic spin (no impact), then Strength B (home).",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-07-10",
          "day_name": "Fri",
          "title": "Recovery run",
          "detail": "4 mi easy @ 9:45-10:30/mi, conversational.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-07-11",
          "day_name": "Sat",
          "title": "Strength A + bike",
          "detail": "Strength A (full gym) + 30 min easy Z2 Peloton spin. No run today.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets."
        },
        {
          "date": "2026-07-12",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "8 mi easy/steady @ 9:45-10:15, relaxed and conversational. Just aerobic time on feet - no fast finish during the base block.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-07-06",
      "end_date": "2026-07-12"
    },
    {
      "num": 12,
      "phase": 3,
      "mileage": 20,
      "theme": "Base wk3: last easy week before the block. A few relaxed strides, nothing structured. Show up fresh - the quality starts next week.",
      "days": [
        {
          "date": "2026-07-13",
          "day_name": "Mon",
          "title": "Recovery run",
          "detail": "4 mi easy @ 9:45-10:30/mi, conversational.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-07-14",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Full rest + daily mobility. 15-min walk or easy spin if restless.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-07-15",
          "day_name": "Wed",
          "title": "Easy + strides",
          "detail": "5 mi easy @ 9:45-10:30, then 6x20s relaxed strides (smooth and quick, full walk-back - not a workout). ~5 mi.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-07-16",
          "day_name": "Thu",
          "title": "Peloton + Strength B",
          "detail": "Peloton 40-45 min Power Zone Endurance (Z2), easy aerobic spin (no impact), then Strength B (home).",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-07-17",
          "day_name": "Fri",
          "title": "Recovery run",
          "detail": "3 mi easy @ 9:45-10:30/mi, conversational.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-07-18",
          "day_name": "Sat",
          "title": "Strength A + bike",
          "detail": "Strength A (full gym) + 30 min easy Z2 Peloton spin. No run today.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets."
        },
        {
          "date": "2026-07-19",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "8 mi easy/steady @ 9:45-10:15, relaxed and conversational. Just aerobic time on feet - no fast finish during the base block.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-07-13",
      "end_date": "2026-07-19"
    },
    {
      "num": 13,
      "phase": 4,
      "mileage": 25,
      "theme": "NRC begins (14 to go). Two speed days a week, progression long runs — at a 20+ mi base, everything starts bigger than NRC's stock numbers.",
      "days": [
        {
          "date": "2026-07-20",
          "day_name": "Mon",
          "title": "Recovery run",
          "detail": "4 mi easy @ 9:45-10:30/mi, conversational.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-07-21",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Full rest + daily mobility. 15-min walk or easy spin if restless.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-07-22",
          "day_name": "Wed",
          "title": "Speed: 8x1:00 @5K",
          "detail": "8x1:00 @5K pace (7:00-7:15), 1:00 easy jog between. WU 1.5 mi + drills; CD 1 mi. ~5 mi. Smooth turnover, not a sprint. PLYO before intervals (~5 min): pogo hops 2x20s, single-leg pogos 2x10/leg, A-skip 2x20m, broad jumps 2x5.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-07-23",
          "day_name": "Thu",
          "title": "Recovery run + Strength B",
          "detail": "3 mi easy @ 9:45-10:30, then Strength B (home).",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-07-24",
          "day_name": "Fri",
          "title": "Speed: fartlek 21:00",
          "detail": "21:00 fartlek — alternate 1:00 hard / 2:00 easy, continuous. WU 1 mi; CD 1 mi. ~5 mi. Play with effort.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-07-25",
          "day_name": "Sat",
          "title": "Strength A + bike",
          "detail": "Strength A (full gym) + 30 min easy Z2 Peloton spin. No run today.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets."
        },
        {
          "date": "2026-07-26",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "8 mi as a progression run: start easy (9:45-10:15), drift to ~9:30 by halfway, close the last 2-3 mi at HM effort (8:15-8:45). Dial in race-day fueling and hydration.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-07-20",
      "end_date": "2026-07-26"
    },
    {
      "num": 14,
      "phase": 4,
      "mileage": 27,
      "theme": "13 to go. Pyramid intervals + 5K reps. Long run stretches to 9.",
      "days": [
        {
          "date": "2026-07-27",
          "day_name": "Mon",
          "title": "Recovery run",
          "detail": "4 mi easy @ 9:45-10:30/mi, conversational.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-07-28",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Full rest + daily mobility. 15-min walk or easy spin if restless.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-07-29",
          "day_name": "Wed",
          "title": "Speed: pyramid",
          "detail": "1:00 @mile(6:00) / 2:00 @5K / 3:00 @10K(7:30-45) / 2:00 @5K / 1:00 @mile, 1:00 easy between. WU 1.5 + drills; CD 1 mi. ~6 mi. PLYO before intervals (~5 min): pogo hops 2x20s, single-leg pogos 2x10/leg, A-skip 2x20m, broad jumps 2x5.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-07-30",
          "day_name": "Thu",
          "title": "Recovery run + Strength B",
          "detail": "3 mi easy @ 9:45-10:30, then Strength B (home).",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-07-31",
          "day_name": "Fri",
          "title": "Speed: 5K + mile reps",
          "detail": "2 rounds of [4x1:30 @5K (45s jog) + 1x1:30 @mile (1:00 jog)]. WU 1 mi; CD 1 mi. ~5 mi.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-08-01",
          "day_name": "Sat",
          "title": "Strength A + bike",
          "detail": "Strength A (full gym) + 30 min easy Z2 Peloton spin. No run today.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets."
        },
        {
          "date": "2026-08-02",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "9 mi as a progression run: start easy (9:45-10:15), drift to ~9:30 by halfway, close the last 2-3 mi at HM effort (8:15-8:45). Dial in race-day fueling and hydration.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-07-27",
      "end_date": "2026-08-02"
    },
    {
      "num": 15,
      "phase": 4,
      "mileage": 29,
      "theme": "12 to go. First hill workout + long 5K reps. Build week.",
      "days": [
        {
          "date": "2026-08-03",
          "day_name": "Mon",
          "title": "Recovery run",
          "detail": "5 mi easy @ 9:45-10:30/mi, conversational.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-08-04",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Full rest + daily mobility. 15-min walk or easy spin if restless.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-08-05",
          "day_name": "Wed",
          "title": "Speed: hills 5x(45s/15s)",
          "detail": "Hill workout: 5x(45s @10K effort uphill + 15s @best), jog-down recovery. WU 1 mi to hill; CD 1 mi. ~5 mi. Effort > pace. PLYO before intervals (~5 min): pogo hops 2x20s, single-leg pogos 2x10/leg, A-skip 2x20m, broad jumps 2x5.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-08-06",
          "day_name": "Thu",
          "title": "Recovery run + Strength B",
          "detail": "3 mi easy @ 9:45-10:30, then Strength B (home).",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-08-07",
          "day_name": "Fri",
          "title": "Speed: 3x7:00 @5K",
          "detail": "3x7:00 @5K pace, 2:30 easy jog between. WU 1.5 mi; CD 1 mi. ~6 mi. Long, honest reps.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-08-08",
          "day_name": "Sat",
          "title": "Strength A + bike",
          "detail": "Strength A (full gym) + 30 min easy Z2 Peloton spin. No run today.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets."
        },
        {
          "date": "2026-08-09",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "10 mi as a progression run: start easy (9:45-10:15), drift to ~9:30 by halfway, close the last 2-3 mi at HM effort (8:15-8:45). Dial in race-day fueling and hydration.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-08-03",
      "end_date": "2026-08-09"
    },
    {
      "num": 16,
      "phase": 4,
      "mileage": 24,
      "theme": "11 to go. Cutback week — absorb the work. Lighter volume, quality stays.",
      "days": [
        {
          "date": "2026-08-10",
          "day_name": "Mon",
          "title": "Recovery run",
          "detail": "4 mi easy @ 9:45-10:30/mi, conversational.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-08-11",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Full rest + daily mobility. 15-min walk or easy spin if restless.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-08-12",
          "day_name": "Wed",
          "title": "Speed: descending intervals",
          "detail": "3x1:00 @mile/3x2:00 @5K, then 2x/2x, then 1x/1x. 1:00 after mile, 1:30 after 5K. WU 1 mi; CD 1 mi. ~5 mi. PLYO before intervals (~5 min): pogo hops 2x20s, single-leg pogos 2x10/leg, A-skip 2x20m, broad jumps 2x5.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-08-13",
          "day_name": "Thu",
          "title": "Recovery run + Strength B",
          "detail": "3 mi easy @ 9:45-10:30, then Strength B (home).",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-08-14",
          "day_name": "Fri",
          "title": "Speed: 25:00 tempo",
          "detail": "25:00 continuous tempo @HM pace (8:00-8:15). WU 1 mi; CD 1 mi. ~5 mi. Comfortably hard.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-08-15",
          "day_name": "Sat",
          "title": "Strength A + bike",
          "detail": "Strength A (full gym) + 30 min easy Z2 Peloton spin. No run today.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets."
        },
        {
          "date": "2026-08-16",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "8 mi as a progression run: start easy (9:45-10:15), drift to ~9:30 by halfway, close the last 2-3 mi at HM effort (8:15-8:45). Dial in race-day fueling and hydration.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-08-10",
      "end_date": "2026-08-16"
    },
    {
      "num": 17,
      "phase": 4,
      "mileage": 30,
      "theme": "10 to go. Mile-pace touches + progression tempo. Cross 30 mpw.",
      "days": [
        {
          "date": "2026-08-17",
          "day_name": "Mon",
          "title": "Recovery run",
          "detail": "5 mi easy @ 9:45-10:30/mi, conversational.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-08-18",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Full rest + daily mobility. 15-min walk or easy spin if restless.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-08-19",
          "day_name": "Wed",
          "title": "Speed: 5K + mile-pace set",
          "detail": "3 rounds of [1x1:30 @5K + 3x0:45 @mile], 1:00 easy between everything. WU 1.5; CD 1 mi. ~6 mi. PLYO before intervals (~5 min): pogo hops 2x20s, single-leg pogos 2x10/leg, A-skip 2x20m, broad jumps 2x5.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-08-20",
          "day_name": "Thu",
          "title": "Recovery run + Strength B",
          "detail": "4 mi easy @ 9:45-10:30, then Strength B (home).",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-08-21",
          "day_name": "Fri",
          "title": "Speed: 23:00 progression tempo",
          "detail": "23:00 progression — build from easy to HM pace; last 5:00 @10K effort. WU 1 mi; CD 1 mi. ~5 mi.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-08-22",
          "day_name": "Sat",
          "title": "Strength A + bike",
          "detail": "Strength A (full gym) + 30 min easy Z2 Peloton spin. No run today.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets."
        },
        {
          "date": "2026-08-23",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "10 mi as a progression run: start easy (9:45-10:15), drift to ~9:30 by halfway, close the last 2-3 mi at HM effort (8:15-8:45). Dial in race-day fueling and hydration.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-08-17",
      "end_date": "2026-08-23"
    },
    {
      "num": 18,
      "phase": 5,
      "mileage": 32,
      "theme": "9 to go. Speed sharpens (mile-pace volume) + hill ladder. Aerobic build deepens.",
      "days": [
        {
          "date": "2026-08-24",
          "day_name": "Mon",
          "title": "Recovery run",
          "detail": "5 mi easy @ 9:45-10:30/mi, conversational.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-08-25",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Full rest + daily mobility. 15-min walk or easy spin if restless.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-08-26",
          "day_name": "Wed",
          "title": "Speed: 20x0:30 @mile",
          "detail": "20x0:30 @mile pace, 1:00 easy jog between; run #1 and #11 at 5K pace. WU 1.5 + drills; CD 1 mi. ~6 mi. Quick, light feet. PLYO before intervals (~5 min): pogo hops 2x20s, single-leg pogos 2x10/leg, A-skip 2x20m, broad jumps 2x5.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-08-27",
          "day_name": "Thu",
          "title": "Recovery run + Strength B",
          "detail": "4 mi easy @ 9:45-10:30, then Strength B (home).",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-08-28",
          "day_name": "Fri",
          "title": "Speed: hill ladder",
          "detail": "3x(1:00 @10K + 0:45 @5K + 0:30 @mile uphill), jog-down recoveries. WU 1 mi; CD 1 mi. ~6 mi.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-08-29",
          "day_name": "Sat",
          "title": "Strength A + bike",
          "detail": "Strength A (full gym) + 30 min easy Z2 Peloton spin. No run today.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets."
        },
        {
          "date": "2026-08-30",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "11 mi as a progression run: start easy (9:45-10:15), drift to ~9:30 by halfway, close the last 2-3 mi at HM effort (8:15-8:45). Dial in race-day fueling and hydration.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-08-24",
      "end_date": "2026-08-30"
    },
    {
      "num": 19,
      "phase": 5,
      "mileage": 35,
      "theme": "8 to go. PEAK build week (~35 mpw). Mixed-pace 'shifter' + power pyramid. Biggest long yet.",
      "days": [
        {
          "date": "2026-08-31",
          "day_name": "Mon",
          "title": "Recovery run",
          "detail": "6 mi easy @ 9:45-10:30/mi, conversational.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-09-01",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Full rest + daily mobility. 15-min walk or easy spin if restless.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-09-02",
          "day_name": "Wed",
          "title": "Speed: the shifter",
          "detail": "1:00@mile -> 3:00@10K -> 2:00@5K -> 1:00@mile -> 1:00@best, easy float (1:00-2:00) between. WU 1.5; CD 1 mi. ~6 mi. PLYO before intervals (~5 min): pogo hops 2x20s, single-leg pogos 2x10/leg, A-skip 2x20m, broad jumps 2x5.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-09-03",
          "day_name": "Thu",
          "title": "Recovery run + Strength B",
          "detail": "5 mi easy @ 9:45-10:30, then Strength B (home).",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-09-04",
          "day_name": "Fri",
          "title": "Speed: power pyramid",
          "detail": "1:00@mile / 5:00@5K / 10:00@10K / 5:00@5K / 1:00@mile, short recoveries. WU 1.5; CD 1 mi. ~6 mi.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-09-05",
          "day_name": "Sat",
          "title": "Strength A + bike",
          "detail": "Strength A (full gym) + 30 min easy Z2 Peloton spin. No run today.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets."
        },
        {
          "date": "2026-09-06",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "12 mi as a progression run: start easy (9:45-10:15), drift to ~9:30 by halfway, close the last 2-3 mi at HM effort (8:15-8:45). Dial in race-day fueling and hydration.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-08-31",
      "end_date": "2026-09-06"
    },
    {
      "num": 20,
      "phase": 5,
      "mileage": 28,
      "theme": "7 to go. Cutback into mile week. 5K reps + short fartlek, freshen the legs.",
      "days": [
        {
          "date": "2026-09-07",
          "day_name": "Mon",
          "title": "Recovery run",
          "detail": "5 mi easy @ 9:45-10:30/mi, conversational.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-09-08",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Full rest + daily mobility. 15-min walk or easy spin if restless.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-09-09",
          "day_name": "Wed",
          "title": "Speed: 10x2:00 @5K",
          "detail": "10x2:00 @5K pace, 1:00 easy between (2:00 after reps #4 and #8). WU 1.5; CD 1 mi. ~5 mi.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-09-10",
          "day_name": "Thu",
          "title": "Recovery run + Strength B",
          "detail": "4 mi easy @ 9:45-10:30, then Strength B (home).",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-09-11",
          "day_name": "Fri",
          "title": "Speed: fartlek 15:00",
          "detail": "15:00 fartlek — 1:00 hard / 1:00 easy. WU 1 mi; CD 1 mi. ~5 mi. Snappy and relaxed.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-09-12",
          "day_name": "Sat",
          "title": "Strength A + bike",
          "detail": "Strength A (full gym) + 30 min easy Z2 Peloton spin. No run today.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets."
        },
        {
          "date": "2026-09-13",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "9 mi as a progression run: start easy (9:45-10:15), drift to ~9:30 by halfway, close the last 2-3 mi at HM effort (8:15-8:45). Dial in race-day fueling and hydration.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-09-07",
      "end_date": "2026-09-13"
    },
    {
      "num": 21,
      "phase": 5,
      "mileage": 28,
      "theme": "6 to go — MILE TUNE-UP WEEK. Race the Copenhagen 1-mile Sat (Sep 19) as a hard B-effort; no real taper, keep half volume.",
      "days": [
        {
          "date": "2026-09-14",
          "day_name": "Mon",
          "title": "Recovery run",
          "detail": "4 mi easy @ 9:45-10:30/mi, conversational.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-09-15",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Full rest + daily mobility. 15-min walk or easy spin if restless.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-09-16",
          "day_name": "Wed",
          "title": "Speed: mile sharpener",
          "detail": "'Rock-n-roller' lite: 5:00@10K / 2:30@5K / 1:00@mile / 2x0:30@best / 1:00@mile, 1:30 recoveries. WU 1.5; CD 1 mi. ~5 mi. Last real speed before the mile.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-09-17",
          "day_name": "Thu",
          "title": "Recovery run + Strength B",
          "detail": "3 mi easy @ 9:45-10:30, then Strength B (home).",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-09-18",
          "day_name": "Fri",
          "title": "Easy + strides",
          "detail": "3 mi easy + 4x20s relaxed strides. Legs fresh for tomorrow's mile. ~3 mi.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-09-19",
          "day_name": "Sat",
          "title": "🏁 COPENHAGEN 1-MILE",
          "detail": "Race day (B-race). WU 1.5 mi + 4 strides; race the mile by feel (~6:00 target); CD 1 mi easy. ~3 mi. Hard tune-up effort — you didn't taper, so just run honest and have fun.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-09-20",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "10 mi easy/relaxed — legs may be flat from yesterday's mile, so keep it gentle (10:00-10:30), walk breaks fine. Pure aerobic time on feet.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-09-14",
      "end_date": "2026-09-20"
    },
    {
      "num": 22,
      "phase": 6,
      "mileage": 33,
      "theme": "5 to go. Back to half building. '90s' + speedurance, long jumps to 12.",
      "days": [
        {
          "date": "2026-09-21",
          "day_name": "Mon",
          "title": "Recovery run",
          "detail": "5 mi easy @ 9:45-10:30/mi, conversational.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-09-22",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Full rest + daily mobility. 15-min walk or easy spin if restless.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-09-23",
          "day_name": "Wed",
          "title": "Speed: 90s",
          "detail": "3 rounds of [1:30 @5K / 1:30 @10K / 1:30 @mile], 1:30 easy between. WU 1.5; CD 1 mi. ~6 mi. PLYO before intervals (~5 min): pogo hops 2x20s, single-leg pogos 2x10/leg, A-skip 2x20m, broad jumps 2x5.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-09-24",
          "day_name": "Thu",
          "title": "Recovery run + Strength B",
          "detail": "4 mi easy @ 9:45-10:30, then Strength B (home).",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-09-25",
          "day_name": "Fri",
          "title": "Speed: speedurance",
          "detail": "3x2:00 @5K / 10:00 @HM tempo / 3x2:00 @5K. 1:00 after 5K reps, 2:00 around tempo. WU 1 mi; CD 1 mi. ~6 mi.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-09-26",
          "day_name": "Sat",
          "title": "Strength A + bike",
          "detail": "Strength A (full gym) + 30 min easy Z2 Peloton spin. No run today.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets."
        },
        {
          "date": "2026-09-27",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "12 mi as a progression run: start easy (9:45-10:15), drift to ~9:30 by halfway, close the last 2-3 mi at HM effort (8:15-8:45). Dial in race-day fueling and hydration.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-09-21",
      "end_date": "2026-09-27"
    },
    {
      "num": 23,
      "phase": 6,
      "mileage": 35,
      "theme": "4 to go. PEAK long run (13 mi) + 10K-power reps. Top of the build.",
      "days": [
        {
          "date": "2026-09-28",
          "day_name": "Mon",
          "title": "Recovery run",
          "detail": "6 mi easy @ 9:45-10:30/mi, conversational.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-09-29",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Full rest + daily mobility. 15-min walk or easy spin if restless.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-09-30",
          "day_name": "Wed",
          "title": "Speed: 5x5:00 @10K",
          "detail": "5x5:00 @10K pace (7:30-7:45), 2:00 easy jog between. WU 1.5; CD 1 mi. ~6 mi. Big aerobic-power day. PLYO before intervals (~5 min): pogo hops 2x20s, single-leg pogos 2x10/leg, A-skip 2x20m, broad jumps 2x5.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-10-01",
          "day_name": "Thu",
          "title": "Recovery run + Strength B",
          "detail": "4 mi easy @ 9:45-10:30, then Strength B (home).",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-10-02",
          "day_name": "Fri",
          "title": "Speed: fartlek 21:00",
          "detail": "21:00 fartlek — 2:00 hard / 1:00 easy, continuous. WU 1 mi; CD 1 mi. ~6 mi.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-10-03",
          "day_name": "Sat",
          "title": "Strength A + bike",
          "detail": "Strength A (full gym) + 30 min easy Z2 Peloton spin. No run today.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets."
        },
        {
          "date": "2026-10-04",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "13 mi as a progression run: start easy (9:45-10:15), drift to ~9:30 by halfway, close the last 2-3 mi at HM effort (8:15-8:45). Dial in race-day fueling and hydration.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-09-28",
      "end_date": "2026-10-04"
    },
    {
      "num": 24,
      "phase": 6,
      "mileage": 30,
      "theme": "3 to go. Race-specific 'long & strong' + bring-it-down tempo. Volume starts to ease.",
      "days": [
        {
          "date": "2026-10-05",
          "day_name": "Mon",
          "title": "Recovery run",
          "detail": "5 mi easy @ 9:45-10:30/mi, conversational.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-10-06",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Full rest + daily mobility. 15-min walk or easy spin if restless.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-10-07",
          "day_name": "Wed",
          "title": "Speed: long & strong",
          "detail": "3x(8:00 @10K / 4:00 @5K / 2:00 @mile); 3:00 after 10K, 2:00 after others. WU 1.5; CD 1 mi. ~6 mi.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-10-08",
          "day_name": "Thu",
          "title": "Recovery run + Strength B",
          "detail": "4 mi easy @ 9:45-10:30, then Strength B (home).",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": "STRENGTH B (Home, ~35 min): Bulgarian split squat 3x8/leg @ 25-30 lb DBs; DB Romanian deadlift 3x10 @ 30 lb; DB bench press 3x10; single-arm DB row 3x10/side; banded clamshell 3x15/side; banded monster walk 2x15 steps; copenhagen plank 3x20s/side; toe raises 2x20."
        },
        {
          "date": "2026-10-09",
          "day_name": "Fri",
          "title": "Speed: bring it down",
          "detail": "15:00 progression tempo: 5:00 easy / 4:00@10K / 3:00@5K / 2:00@mile / 1:00@best, continuous. WU 1 mi; CD 1 mi. ~5 mi.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-10-10",
          "day_name": "Sat",
          "title": "Strength A + bike",
          "detail": "Strength A (full gym) + 30 min easy Z2 Peloton spin. No run today.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (Full Gym, ~50 min): Back squat 3x5-8 (work up); Romanian deadlift 3x6-8; bench press 3x6-8; pull-up or lat pulldown 3x6-10; Pallof press 3x10/side; side plank 3x30s/side. Rest 90-120s between sets."
        },
        {
          "date": "2026-10-11",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "11 mi as a progression run: start easy (9:45-10:15), drift to ~9:30 by halfway, close the last 2-3 mi at HM effort (8:15-8:45). Dial in race-day fueling and hydration.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-10-05",
      "end_date": "2026-10-11"
    },
    {
      "num": 25,
      "phase": 7,
      "mileage": 23,
      "theme": "2 to go — TAPER. Cut volume, keep the legs sharp. Short, crisp speed only.",
      "days": [
        {
          "date": "2026-10-12",
          "day_name": "Mon",
          "title": "Recovery run",
          "detail": "4 mi easy @ 9:45-10:30/mi, conversational.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-10-13",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Full rest + daily mobility. 15-min walk or easy spin if restless.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-10-14",
          "day_name": "Wed",
          "title": "Speed: stronger faster",
          "detail": "3x(3:00 @5K + 4x0:30 @mile); 2:00 after 5K, 1:00 after mile set. WU 1 mi; CD 1 mi. ~4 mi. Sharp but short.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-10-15",
          "day_name": "Thu",
          "title": "Recovery run + Strength B",
          "detail": "3 mi easy, then Strength B (short/maintenance).",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": "STRENGTH B (short, ~20 min): Bulgarian split squat 2x8/leg (lighter); banded clamshell 2x15/side; monster walk 2x15; copenhagen plank 2x20s/side. Maintenance only."
        },
        {
          "date": "2026-10-16",
          "day_name": "Fri",
          "title": "Speed: in control",
          "detail": "1:00 @mile / 3:00 @5K / 5:00 @10K / 7:00 easy, short recoveries. WU 1 mi; CD 0.5 mi. ~3 mi.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-10-17",
          "day_name": "Sat",
          "title": "Strength A (light) + bike",
          "detail": "Strength A (lighter) + 20-30 min very easy spin. Keep it crisp, not heavy.",
          "routines": [
            "pre_bike",
            "post_bike"
          ],
          "strength": "STRENGTH A (lighter, ~35 min): Back squat 2x5 (moderate); RDL 2x6; bench 2x6; lat pulldown 2x8; Pallof 2x10/side. Cut volume — taper week, keep it crisp not crushing."
        },
        {
          "date": "2026-10-18",
          "day_name": "Sun",
          "title": "LONG RUN",
          "detail": "9 mi as a progression run: start easy (9:45-10:15), drift to ~9:30 by halfway, close the last 2-3 mi at HM effort (8:15-8:45). Dial in race-day fueling and hydration.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-10-12",
      "end_date": "2026-10-18"
    },
    {
      "num": 26,
      "phase": 7,
      "mileage": 21,
      "theme": "1 to go — RACE WEEK. Trust the work. Tiny touches of pace, then 13.1 on Sunday.",
      "days": [
        {
          "date": "2026-10-19",
          "day_name": "Mon",
          "title": "Recovery run",
          "detail": "3 mi easy @ 9:45-10:30/mi, conversational.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-10-20",
          "day_name": "Tue",
          "title": "REST",
          "detail": "Full rest + daily mobility. 15-min walk or easy spin if restless.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-10-21",
          "day_name": "Wed",
          "title": "Speed: race primer",
          "detail": "WU 1 mi; 1:00@5K / 2:00@10K / 5:00 @HM pace / 2:00@10K / 1:00@5K, 1:00 easy between; CD 1 mi. ~3 mi. Legs say 'ready'.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-10-22",
          "day_name": "Thu",
          "title": "REST + mobility",
          "detail": "Full rest. Light mobility, foam roll. Stay off the legs.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-10-23",
          "day_name": "Fri",
          "title": "Easy shakeout + strides",
          "detail": "2 mi very easy + 4x20s strides. Loosen up — nothing hard. ~2 mi.",
          "routines": [
            "pre_run",
            "post_run"
          ],
          "strength": null
        },
        {
          "date": "2026-10-24",
          "day_name": "Sat",
          "title": "REST (pre-race)",
          "detail": "Full rest. Lay out kit, hydrate well, carbs in, early night. Optional 10-min shakeout walk.",
          "routines": [
            "mobility_daily"
          ],
          "strength": null
        },
        {
          "date": "2026-10-25",
          "day_name": "Sun",
          "title": "🏁 DRESDEN HALF MARATHON",
          "detail": "Race day! 13.1 mi. Even or slightly negative split — settle into ~8:00/mi by mile 2. Trust the work.",
          "routines": [
            "hip_protocol",
            "pre_run",
            "post_run"
          ],
          "strength": null
        }
      ],
      "start_date": "2026-10-19",
      "end_date": "2026-10-25"
    }
  ]
};
