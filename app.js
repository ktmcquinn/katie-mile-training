// The Dresden Half — application logic. Extracted from the main HTML file.
// Loaded at the end of <body>, so the DOM is fully parsed when this runs.
      // =========================================================================
      // Supabase config — fill these in ONCE with your project's values.
      // Find them in your Supabase dashboard at: Settings → API
      //   - Project URL: looks like "https://abcdefg.supabase.co"
      //   - anon public key: long "eyJhbGc..." string
      // These are SAFE to commit to a public repo. The anon key is designed to be
      // public; your data is protected by Row Level Security policies in the DB.
      // =========================================================================
      const SUPABASE_URL = "https://wsbqdltgtbfjqhtkutgq.supabase.co";
      const SUPABASE_ANON_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzYnFkbHRndGJmanFodGt1dGdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MTg4NjYsImV4cCI6MjA5MzA5NDg2Nn0.yJV55I0dm0cilyAn3szJ31uazFDKijHae0PNqC5JTTE";

      // Strava Client ID (PUBLIC — safe to commit. The Client Secret stays in
      // Vercel environment variables, never in this file.) Get it from your app
      // at strava.com/settings/api after creating one.
      const STRAVA_CLIENT_ID_PUBLIC = "246580";
      // =========================================================================

      // ---------- localStorage schema versioning ----------
      // Runs once per device, before any state is loaded, so future changes to
      // the shape of stored data are explicit and safe. To change a data shape,
      // bump SCHEMA_VERSION and append a migration function that converts the
      // PREVIOUS shape to the new one (it receives no args — read/write
      // localStorage directly). Migrations run in order and only for versions
      // the device hasn't applied yet.
      const SCHEMA_VERSION = 1;
      const SCHEMA_VERSION_KEY = "katie-mile-schema-version";
      const SCHEMA_MIGRATIONS = [
        // index 0 → version 1: baseline. (The legacy single time-trial → results
        // list conversion still runs lazily in loadResults(); new shape changes
        // belong here so they're applied exactly once and in a known order.)
        function v0_to_v1() {},
      ];
      function runSchemaMigrations() {
        let from = 0;
        try { from = parseInt(localStorage.getItem(SCHEMA_VERSION_KEY) || "0", 10) || 0; } catch (e) {}
        if (from >= SCHEMA_VERSION) return;
        for (let i = from; i < SCHEMA_MIGRATIONS.length && i < SCHEMA_VERSION; i++) {
          try { SCHEMA_MIGRATIONS[i](); }
          catch (e) { console.warn("[schema] migration", i, "→", i + 1, "failed:", e); }
        }
        try { localStorage.setItem(SCHEMA_VERSION_KEY, String(SCHEMA_VERSION)); } catch (e) {}
      }
      runSchemaMigrations();

      // ---------- Theme (light/dark) - run early to avoid flash ----------
      const THEME_KEY = "katie-mile-theme";
      function loadTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === "dark" || saved === "light") return saved;
        return window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      function applyTheme(theme) {
        if (theme === "dark")
          document.documentElement.setAttribute("data-theme", "dark");
        else document.documentElement.removeAttribute("data-theme");
        const btn = document.getElementById("themeToggle");
        if (btn) {
          btn.textContent = theme === "dark" ? "☀️" : "🌙";
          btn.setAttribute(
            "aria-label",
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
          );
        }
      }
      function toggleTheme() {
        const cur =
          document.documentElement.getAttribute("data-theme") === "dark"
            ? "dark"
            : "light";
        const next = cur === "dark" ? "light" : "dark";
        localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
        // Re-render charts (they bake some colors into SVG)
        if (typeof renderWeightChart === "function") renderWeightChart();
      }
      // Apply theme immediately so the page boots in the right colors
      applyTheme(loadTheme());

      // ---------- Tabs (bottom nav) ----------
      const TAB_KEY = "katie-mile-active-tab";
      const TAB_LABELS = { today: "Home", fuel: "Fuel", plan: "Plan", trends: "Trends" };
      function switchTab(name) {
        document.querySelectorAll(".tab-page").forEach((p) => {
          p.classList.toggle("active", p.id === `tab-${name}`);
        });
        document.querySelectorAll(".tab-btn").forEach((b) => {
          b.classList.toggle("active", b.dataset.tab === name);
        });
        const pageEl = document.getElementById("topBarPage");
        if (pageEl) pageEl.textContent = TAB_LABELS[name] || name;
        try { localStorage.setItem(TAB_KEY, name); } catch (e) {}
        // Scroll to top of the newly active tab
        window.scrollTo({ top: 0, behavior: "instant" });
        // If switching to Trends, render the whole Trends tab (stats, sparklines,
        // period strip, weight chart) so it's always up-to-date when viewed.
        if (name === "trends" && typeof renderTrends === "function") {
          renderTrends();
        }
        // Re-render Fuel tab on entry to pick up any new workouts logged today
        if (name === "fuel" && typeof renderFuel === "function") {
          renderFuel();
        }
      }
      function initTabs() {
        document.querySelectorAll(".tab-btn").forEach((b) => {
          b.addEventListener("click", () => switchTab(b.dataset.tab));
        });
        let saved = "today";
        try { saved = localStorage.getItem(TAB_KEY) || "today"; } catch (e) {}
        switchTab(saved);
      }

      // DATA is loaded from plan.js (see <script src="plan.js"> in the <head>)
      const ROUTINE_LABELS = {
        pre_run: "Pre-run",
        post_run: "Post-run",
        pre_bike: "Pre-bike",
        post_bike: "Post-bike",
        mobility_daily: "Mobility",
        desk_breaks: "Desk breaks",
        shin_protocol: "Shin protocol",
        core: "Core",
        plyo: "Plyometrics",
        hip_protocol: "Hip protocol",
        yoga: "Yoga",
      };

      // Chronological category for each routine — drives modal display order.
      const ROUTINE_PHASE = {
        mobility_daily: "anytime",
        shin_protocol: "anytime",
        hip_protocol: "anytime",
        yoga: "anytime",
        pre_run: "pre",
        pre_bike: "pre",
        // Plyometrics is power/strength work, not running or biking — keep it
        // out of the Cardio group and render it under Strength instead.
        plyo: "core",
        core: "core",
        post_run: "post",
        post_bike: "post",
        desk_breaks: "after_hours",
      };

      // Short one-line descriptions for each routine (full prescription lives
      // in the "Check off each move" exercise tracker sub-modal).
      const ROUTINE_SHORT_DESC = {
        pre_run: "10-min dynamic warmup: leg swings, lunges, high knees, A-skips.",
        post_run: "10-min cooldown + key stretches (couch, figure-4, hamstring).",
        pre_bike: "5-min hip openers + ankle mobility before riding.",
        post_bike: "8-min stretches — cycling shortens hip flexors, don't skip.",
        mobility_daily: "5-10 min daily mobility — couch stretch, 90/90, dead bug.",
        desk_breaks: "Every 60-90 min during desk work: squats + couch stretch.",
        shin_protocol: "Toe raises, eccentric calf raises, tibialis work for shin health.",
        core: "10-12 min runner core: plank, dead bug, Pallof, glute bridge.",
        plyo: "5-min plyo block after warmup, before intervals. ~15-20 foot contacts: pogos, A-skip, broad jumps. Builds tendon stiffness for the mile.",
        hip_protocol: "10 min daily: 90/90, couch stretch, clamshells, side-lying abduction, single-leg glute bridge, dead bug. Priority right side.",
        yoga: "45-60 min Friday hip-focused flow: pigeon, lizard, figure-4, twisted root, low lunge w/ twist, legs up the wall. Replaces an easy run.",
      };

      // ---------- Structured exercise data (for the exercise tracker sub-modal) ----------
      // Strength routines, restructured into exercise lists.
      // Single-leg moves are featured prominently because running is a single-leg
      // sport — Single-leg RDL, step-ups, single-leg glute bridges, single-leg calf
      // raises directly train the patterns and imbalances that cause running injuries.
      DATA.strength_routines = {
        A_full_gym: {
          label: "Strength A — Full Gym",
          duration: "~50 min",
          description: "Heavy bilateral + single-leg foundation. Rest 90-120s between heavy sets. Total exercise count is 9: do all of the main 9, OR swap 1-2 of the alternates at the bottom in place of similar-pattern exercises to keep the rotation fresh.",
          exercises: [
            { key: "back_squat", name: "Back squat", prescription: "3x5-8", note: "The bilateral king lift — work up to a top set at RPE 7-8." },
            { key: "single_leg_rdl", name: "Single-leg Romanian deadlift", prescription: "3x8/leg", note: "The most running-specific lift you'll do. Single-leg posterior chain + balance. Slow eccentric." },
            { key: "bulgarian_split_squat", name: "Bulgarian split squat", prescription: "3x8/leg", note: "Foundation single-leg quad/glute work. Front shin vertical, drop straight down." },
            { key: "step_up_knee_drive", name: "Step-up with knee drive", prescription: "3x6/leg", note: "Mimics the running drive phase — drive opposite knee up explosively at the top." },
            { key: "pull_up_or_pulldown", name: "Pull-up or lat pulldown", prescription: "3x6-10", note: "Upper-body pull keeps shoulders balanced." },
            { key: "bench_press", name: "Bench press", prescription: "3x6-8", note: "Upper-body push for posture and shoulder health." },
            { key: "pallof_press", name: "Pallof press", prescription: "3x10/side", note: "Anti-rotation core. Slow + controlled." },
            { key: "side_plank", name: "Side plank", prescription: "3x30s/side", note: "Lateral core — hips drive sideways stability when running." },
            { key: "single_leg_calf_raise", name: "Single-leg calf raise", prescription: "2x15/leg", note: "Each running stride is a calf rep. Build calf power directly." },
            { key: "goblet_squat", name: "Goblet squat (alternate)", prescription: "Alt for back squat — 3x8-10", note: "Lower-back-friendly squat pattern. Hold a heavy DB or KB at the chest, knees tracking over toes. Good week to swap in when the spine wants a break from barbell loading.", alternate: true },
            { key: "single_leg_hip_thrust", name: "Single-leg hip thrust (alternate)", prescription: "Alt for any glute work — 3x10/leg", note: "Shoulders on a bench, one foot on the floor with knee bent ~90°. Drive through the heel, squeeze the glute at the top. Direct glute strength = better push-off.", alternate: true },
            { key: "lateral_lunge", name: "Lateral lunge (alternate)", prescription: "Alt for Bulgarian split squat — 3x8/side", note: "Step wide to the side, sit into that hip with the other leg straight. Trains adductors + frontal-plane control — the plane running never touches but ankles/hips need.", alternate: true },
          ],
        },
        B_home: {
          label: "Strength B — Home",
          duration: "~35 min",
          description: "Single-leg dominant, dumbbell-friendly. 25-30 lb DBs + a band. Total exercise count is 9: do all of the main 9, OR swap 1-2 of the alternates at the bottom in place of similar-pattern exercises to keep variety in the rotation.",
          exercises: [
            { key: "bulgarian_split_squat", name: "Bulgarian split squat", prescription: "3x8/leg @ 25-30 lb DBs", note: "Foundation single-leg lift. Drop straight down, front shin vertical." },
            { key: "single_leg_db_rdl", name: "Single-leg DB Romanian deadlift", prescription: "3x8/leg @ 25 lb", note: "Hinge from the hip. Keep moving leg straight back. Slow eccentric." },
            { key: "step_up_knee_drive", name: "Step-up with knee drive", prescription: "3x8/leg @ 20 lb DBs", note: "Drive opposite knee up at the top. Use a 12-18 inch box." },
            { key: "db_bench_press", name: "DB bench press", prescription: "3x10", note: "On floor or bench. Upper push." },
            { key: "db_row", name: "Single-arm DB row", prescription: "3x10/side", note: "Brace core, don't twist. Pull elbow back along the ribs." },
            { key: "single_leg_glute_bridge", name: "Single-leg glute bridge", prescription: "3x12/leg", note: "Squeeze glutes hard at the top. Elevate feet on a couch if too easy." },
            { key: "copenhagen_plank", name: "Copenhagen plank", prescription: "3x20s/side", note: "Top leg on couch. Brutal but builds groin/adductor strength runners need." },
            { key: "single_leg_calf_raise", name: "Single-leg calf raise", prescription: "2x15/leg", note: "On a step, drop heel below, drive up. Eccentric: 1s up, 3s down." },
            { key: "tibialis_raise", name: "Tibialis raise (toe raise)", prescription: "2x20", note: "Heels on floor, lift toes — shin pain prevention." },
            { key: "reverse_lunge", name: "Reverse lunge (alternate)", prescription: "Alt for Bulgarian split squat — 3x10/leg @ 20-25 lb DBs", note: "Step BACK into the lunge (knee-friendlier than forward). Drive through the front heel. Easier balance demand than BSS so you can chase a slightly heavier load.", alternate: true },
            { key: "lateral_lunge_db", name: "Lateral lunge w/ DB (alternate)", prescription: "Alt for step-up — 3x8/side @ 20-25 lb DB goblet", note: "Step wide to one side, sit into that hip, other leg stays straight. Adductor + frontal-plane strength — exactly the plane running ignores but ankles/hips need.", alternate: true },
            { key: "hip_airplane", name: "Hip airplane (alternate)", prescription: "Alt for any single-leg lift — 3x6/leg, no weight", note: "Stand on one leg, hinge forward, rotate hips open/closed (toes up to ceiling, then down). Brutal single-leg balance + hip rotational control. Bodyweight is enough.", alternate: true },
          ],
        },
        light_taper: {
          label: "Strength LIGHT — Taper",
          duration: "~25 min",
          description: "Maintenance only — keep RPE 5-6. Goal is sharp, not sore.",
          exercises: [
            { key: "single_leg_squat", name: "Single-leg bodyweight squat", prescription: "2x8/leg", note: "Pistol regression to a chair. Slow + controlled." },
            { key: "single_leg_glute_bridge", name: "Single-leg glute bridge", prescription: "2x12/leg", note: "Light activation, not maximal." },
            { key: "push_up", name: "Push-up", prescription: "2x10-15", note: "On knees if needed." },
            { key: "band_row", name: "Band row", prescription: "2x12", note: "Light." },
            { key: "side_plank", name: "Side plank", prescription: "2x30s/side", note: "" },
            { key: "dead_bug", name: "Dead bug", prescription: "2x10/side", note: "Slow + controlled. Low back pressed to floor." },
            { key: "single_leg_calf_raise", name: "Single-leg calf raise", prescription: "1x15/leg", note: "Feel-good sets only." },
          ],
        },
        block_a: {
          label: "Block A — Posterior Chain & Single-Leg Strength",
          duration: "60-75 min",
          description: "Heavy bilateral hinge + single-leg strength. Alternates with Block B (Block A on odd-numbered new-plan weeks: 1, 3, 5, 7, 9, 11). Reduce load 40% on recovery weeks. No heavy lifting in taper weeks.",
          exercises: [
            { key: "barbell_rdl", name: "Barbell Romanian Deadlift", prescription: "4x6", note: "Heavy. Hip hinge, no rounding. The most posterior-chain bang-for-buck lift you do." },
            { key: "bulgarian_split_squat", name: "Bulgarian Split Squat", prescription: "3x8/leg", note: "Right leg as REAR leg to load the right glute. Front shin vertical, drop straight down." },
            { key: "barbell_hip_thrust", name: "Barbell Hip Thrust", prescription: "4x8", note: "Drive through the right heel. Squeeze glutes hard at top, pause 1 sec." },
            { key: "nordic_hamstring", name: "Nordic Hamstring Curl", prescription: "3x6", note: "Slow eccentric — lower for 4-5 sec, catch with hands. Critical for hamstring health and injury prevention." },
            { key: "lateral_band_walk", name: "Lateral Band Walk", prescription: "3x15/side", note: "Heavy band above the knees or ankles. Slight athletic stance, push the floor sideways." },
            { key: "copenhagen_hold", name: "Copenhagen Adductor Hold", prescription: "3x8/side", note: "3-sec holds. Top leg on a bench, body angled — builds adductor + groin strength most runners ignore." },
          ],
        },
        block_b: {
          label: "Block B — Force Absorption & Single-Leg Power",
          duration: "60-75 min",
          description: "Trap bar deadlift + single-leg power work + tempo squats + anti-rotation core. Alternates with Block A (Block B on even-numbered new-plan weeks: 2, 4, 6, 8, 10, 12). Reduce load 40% on recovery weeks. No heavy lifting in taper weeks.",
          exercises: [
            { key: "trap_bar_deadlift", name: "Trap Bar Deadlift", prescription: "4x5", note: "Heavy. Back-friendlier than conventional. Drive the floor away — explosive concentric, controlled lower." },
            { key: "sl_box_step_up", name: "Single-Leg Box Step-Up", prescription: "3x10/leg", note: "Moderate DBs, knee-height box. Controlled descent (3-sec) — eccentric is the magic." },
            { key: "goblet_squat_tempo", name: "Goblet Squat (tempo)", prescription: "3x10", note: "3 sec down, 1 sec up. Heavy KB or DB at the chest. Knees track over toes." },
            { key: "single_leg_rdl", name: "Single-Leg RDL", prescription: "3x8/leg", note: "Focus on right-side balance. Hinge from the hip, moving leg straight back. Slow eccentric." },
            { key: "pallof_press", name: "Pallof Press", prescription: "3x12/side", note: "Anti-rotation core — hold 1-2 sec at full extension. Resist the cable pulling you sideways." },
            { key: "ghr_or_pullthrough", name: "Glute-Ham Raise OR Band Pull-Through", prescription: "3x10", note: "Either works. GHR if you have the machine; banded pull-through (cable or band between feet, hinge + drive hips forward) otherwise." },
          ],
        },
      };

      // Routines (mobility / warmup / cooldown), exercise-by-exercise.
      DATA.routine_exercises = {
        pre_run: [
          { key: "clamshells", name: "Clamshells", prescription: "10/side", note: "" },
          { key: "single_leg_bridges", name: "Single-leg bridges", prescription: "10/side", note: "" },
          { key: "leg_swings_fwd", name: "Leg swings front/back", prescription: "10 each leg", note: "" },
          { key: "leg_swings_side", name: "Leg swings side/side", prescription: "10 each leg", note: "" },
          { key: "walking_lunges", name: "Walking lunges", prescription: "10 total", note: "" },
          { key: "high_knees", name: "High knees", prescription: "30 sec", note: "" },
          { key: "butt_kicks", name: "Butt kicks", prescription: "30 sec", note: "" },
          { key: "a_skips", name: "A-skips", prescription: "20m x 2", note: "" },
          { key: "ankle_circles", name: "Ankle circles", prescription: "10 each direction", note: "" },
        ],
        post_run: [
          { key: "easy_walk_5", name: "Easy walk to drop HR", prescription: "5 min", note: "" },
          { key: "calf_stretch", name: "Standing calf stretch", prescription: "30s/side", note: "" },
          { key: "couch_stretch", name: "Couch stretch (hip flexor)", prescription: "60s/side", note: "CRITICAL for desk-tight hips. Don't skip." },
          { key: "figure_4", name: "Figure-4 (piriformis)", prescription: "45s/side", note: "" },
          { key: "hamstring_stretch", name: "Standing hamstring stretch", prescription: "30s/side", note: "" },
          { key: "childs_pose", name: "Child's pose", prescription: "60 sec", note: "Refuel within 30-60 min after." },
        ],
        pre_bike: [
          { key: "hip_90_90", name: "90/90 hip hold", prescription: "30s/side", note: "" },
          { key: "deep_squat_hold", name: "Deep squat hold", prescription: "30 sec", note: "" },
          { key: "knee_to_wall", name: "Knee-to-wall ankle", prescription: "10/side", note: "" },
          { key: "cat_cow", name: "Cat-cow", prescription: "x10", note: "" },
        ],
        post_bike: [
          { key: "couch_stretch", name: "Couch stretch", prescription: "60s/side", note: "Cycling shortens hip flexors. DO NOT SKIP." },
          { key: "pigeon", name: "Pigeon pose", prescription: "60s/side", note: "" },
          { key: "forward_fold", name: "Standing forward fold", prescription: "60 sec", note: "" },
          { key: "tspine_opener", name: "T-spine opener (foam roller)", prescription: "60 sec", note: "" },
          { key: "calf_stretch", name: "Calf stretch", prescription: "30s/side", note: "" },
        ],
        mobility_daily: [
          { key: "couch_stretch", name: "Couch stretch", prescription: "60s/side", note: "Anytime — shower, lunch break, before bed." },
          { key: "hip_90_90", name: "90/90 hip rotation", prescription: "5 reps/side", note: "" },
          { key: "worlds_greatest", name: "World's greatest stretch", prescription: "5/side", note: "Lunge + reach + twist. Hits everything." },
          { key: "cat_cow", name: "Cat-cow", prescription: "x10", note: "" },
          { key: "dead_bug", name: "Dead bug", prescription: "10/side", note: "Slow, low back to floor." },
        ],
        hip_protocol: [
          { key: "hip_90_90_stretch", name: "90/90 hip stretch", prescription: "2 min/side", note: "Hold the right side longer." },
          { key: "couch_stretch", name: "Couch stretch (hip flexor)", prescription: "60s/side", note: "Priority on right." },
          { key: "clamshells_banded", name: "Clamshells w/ resistance band", prescription: "3x15/side", note: "Slow & controlled. Feel the right glute fire." },
          { key: "side_hip_abduction", name: "Side-lying hip abduction", prescription: "3x12/side", note: "Keep hip stacked, don't roll back." },
          { key: "single_leg_glute_bridge", name: "Single-leg glute bridge", prescription: "3x10/side", note: "Pause 2 sec at top." },
          { key: "dead_bug", name: "Dead bug", prescription: "3x8/side", note: "Core + hip flexor coordination." },
        ],
        desk_breaks: [
          { key: "squats_10", name: "Bodyweight squats", prescription: "x10", note: "Every 60-90 min during desk work." },
          { key: "couch_stretch_short", name: "Couch stretch (each side)", prescription: "10s/side", note: "" },
          { key: "hip_flexor_stretch", name: "Hip flexor stretch", prescription: "30 sec", note: "Sitting 4 hr/day is the root cause of hip tightness." },
        ],
        shin_protocol: [
          { key: "tibialis_raise", name: "Tibialis (toe) raises", prescription: "2x20", note: "Heels on floor, lift toes." },
          { key: "calf_raises_eccentric", name: "Calf raises (eccentric)", prescription: "2x15", note: "1s up, 3s down. Slow lowering is the magic." },
          { key: "tibialis_band", name: "Tibialis raises against band", prescription: "2x15", note: "Band around forefoot, dorsiflex against tension." },
          { key: "ice_shins", name: "Ice shins after running", prescription: "10 min if sore", note: "Skip if no pain." },
          { key: "foam_roll_calves", name: "Foam roll calves", prescription: "2 min/side", note: "" },
        ],
        core: [
          { key: "plank", name: "Plank", prescription: "3 x 30-45 sec", note: "Form > duration. Squeeze glutes, neutral spine. Stop when form breaks." },
          { key: "side_plank", name: "Side plank", prescription: "3 x 30s/side", note: "Hips driven up. Lateral core builds running stability." },
          { key: "dead_bug", name: "Dead bug", prescription: "3 x 10/side", note: "Slow. Low back glued to floor. Opposite arm + leg lower together." },
          { key: "bird_dog", name: "Bird dog", prescription: "3 x 8/side", note: "Hold each rep 2 sec. Hips square — don't twist." },
          { key: "pallof_press", name: "Pallof press", prescription: "3 x 10/side", note: "Anti-rotation core — the most running-specific core lift. Hold 1-2 sec at full extension." },
          { key: "glute_bridge_march", name: "Glute bridge with march", prescription: "2 x 10/side", note: "Bridge up, march knees alternating. Hips do not drop or twist." },
        ],
        plyo: [
          { key: "pogo_hops", name: "Pogo hops (double-leg)", prescription: "2 x 20 sec", note: "Stiff ankles, minimal ground contact. Bounce in place — quick and springy, not deep. Think 'hot pavement.'" },
          { key: "single_leg_pogos", name: "Single-leg pogos", prescription: "2 x 10/leg", note: "Same idea on one leg. Stay tall, soft knee, all the bounce comes from the ankle. Trains the stiffness your stride lives or dies by." },
          { key: "a_skip_height", name: "A-skip for height", prescription: "2 x 20m", note: "Drive knee up + opposite arm. POP off the ground each contact — this is the running stride exaggerated. Quality over distance." },
          { key: "broad_jumps", name: "Broad jumps (full reset)", prescription: "2 x 5", note: "Max-distance jump, swing the arms, stick the landing. Walk back between reps — full recovery. This is power, not conditioning." },
        ],
      };

      // Helper: detect which strength routine key from the day's strength text.
      function detectStrengthKey(strengthText) {
        if (!strengthText) return null;
        const t = strengthText.toUpperCase();
        if (t.startsWith("STRENGTH LIGHT")) return "light_taper";
        // New plan (Jun 15+) uses "BLOCK A" / "BLOCK B" prefixes for the
        // half-marathon strength program. Check these BEFORE the legacy
        // "STRENGTH A/B" so the new prefix wins when both could match.
        if (t.startsWith("BLOCK A")) return "block_a";
        if (t.startsWith("BLOCK B")) return "block_b";
        if (t.startsWith("STRENGTH B") || t.includes("(HOME")) return "B_home";
        if (t.startsWith("STRENGTH A") || t.includes("(FULL GYM")) return "A_full_gym";
        return null;
      }

      // ---------- Date helpers ----------
      function parseISO(s) {
        const [y, m, d] = s.split("-").map(Number);
        return new Date(y, m - 1, d);
      }
      function daysBetween(a, b) {
        return Math.round((b - a) / 86400000);
      }
      function fmtDate(
        s,
        opts = { weekday: "short", month: "short", day: "numeric" },
      ) {
        return parseISO(s).toLocaleDateString("en-US", opts);
      }
      // todayISO() now lives in lib/format.js (loaded first, shared scope).
      function todayClampedISO() {
        // For demo / before-plan-start, clamp to plan range
        const t = todayISO();
        const start = DATA.weeks[0].days[0].date;
        const end = DATA.weeks[DATA.weeks.length - 1].days[6].date;
        if (t < start) return start;
        if (t > end) return end;
        return t;
      }

      // ---------- Toast notifications (in-app replacement for alert) ----------
      let toastContainer = null;
      function showToast(message, type) {
        if (!toastContainer) {
          toastContainer = document.createElement("div");
          toastContainer.className = "toast-container";
          document.body.appendChild(toastContainer);
        }
        const el = document.createElement("div");
        el.className = "toast" + (type ? " toast-" + type : "");
        el.textContent = message;
        toastContainer.appendChild(el);
        requestAnimationFrame(() => el.classList.add("show"));
        setTimeout(() => {
          el.classList.remove("show");
          setTimeout(() => el.remove(), 300);
        }, 3500);
      }

      // True when timestamp string `a` is strictly newer than `b`.
      // Uses Date.parse so ISO strings with different timezone notation
      // ("Z" from the client vs "+00:00" from Postgres) compare correctly.
      // tsNewer() now lives in lib/format.js (loaded first, shared scope).

      // ---------- Task completion storage (localStorage) ----------
      const STORAGE_KEY = "katie-mile-training-completed";
      function loadCompleted() {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          return raw ? JSON.parse(raw) : {};
        } catch (e) {
          return {};
        }
      }
      function saveCompleted(map) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
        } catch (e) {}
        if (typeof scheduleSync === "function") scheduleSync();
      }
      let COMPLETED = loadCompleted();

      // ── Actual workout override (for fuel target adjustment) ──
      const WORKOUT_ACTUAL_KEY = "katie-mile-workout-actual";
      function loadWorkoutActual() {
        try { return JSON.parse(localStorage.getItem(WORKOUT_ACTUAL_KEY) || "{}"); } catch(e) { return {}; }
      }
      function saveWorkoutActual(data) {
        try { localStorage.setItem(WORKOUT_ACTUAL_KEY, JSON.stringify(data)); } catch(e) {}
      }
      let WORKOUT_ACTUAL = loadWorkoutActual();

      // Get all section keys for a given day
      function getSections(day) {
        const sections = ["workout"];
        if (day.strength) sections.push("strength");
        if (day.routines)
          for (const r of day.routines) sections.push("routine_" + r);
        return sections;
      }
      function isSectionDone(day, key) {
        const state = COMPLETED[day.date];
        if (state === true) return true; // legacy: whole day was marked done
        return !!(state && state[key]);
      }
      function isDone(day) {
        // Accept day object OR legacy date-string for back-compat
        if (typeof day === "string") return !!COMPLETED[day];
        const state = COMPLETED[day.date];
        if (state === true) return true; // legacy
        if (!state) return false;
        const sections = getSections(day);
        return sections.every((s) => !!state[s]);
      }
      function sectionCounts(day) {
        const sections = getSections(day);
        const done = sections.filter((s) => isSectionDone(day, s)).length;
        return { done, total: sections.length };
      }
      function setSectionDone(day, key, val) {
        let state = COMPLETED[day.date];
        if (state === true) {
          // expand legacy whole-day marker into per-section
          state = {};
          for (const s of getSections(day)) state[s] = true;
        }
        if (!state) state = {};
        if (val) state[key] = true;
        else delete state[key];
        // "__updatedAt" is a metadata key (sync conflict resolution), not a
        // section — ignore it when deciding whether the day is now empty.
        const realKeys = Object.keys(state).filter((k) => k !== "__updatedAt");
        if (realKeys.length === 0) delete COMPLETED[day.date];
        else {
          state.__updatedAt = new Date().toISOString();
          COMPLETED[day.date] = state;
        }
        saveCompleted(COMPLETED);
        renderProgress();
        if (typeof renderFuelTarget === "function") renderFuelTarget();
      }
      function setDayDone(day, val) {
        if (val) {
          const state = {};
          for (const s of getSections(day)) state[s] = true;
          state.__updatedAt = new Date().toISOString();
          COMPLETED[day.date] = state;
        } else {
          delete COMPLETED[day.date];
        }
        saveCompleted(COMPLETED);
        renderProgress();
        if (typeof renderFuelTarget === "function") renderFuelTarget();
      }
      function totalDays() {
        let n = 0;
        for (const w of DATA.weeks) n += w.days.length;
        return n;
      }
      function totalDone() {
        let n = 0;
        for (const w of DATA.weeks) for (const d of w.days) if (isDone(d)) n++;
        return n;
      }

      // ---------- Workout log storage ----------
      const LOG_STORAGE_KEY = "katie-mile-workout-logs";
      function loadLogs() {
        try {
          const raw = localStorage.getItem(LOG_STORAGE_KEY);
          return raw ? JSON.parse(raw) : {};
        } catch (e) {
          return {};
        }
      }
      function saveLogs() {
        try {
          localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(LOGS));
        } catch (e) {}
        if (typeof scheduleSync === "function") scheduleSync();
      }
      let LOGS = loadLogs();
      function getLog(date) {
        return LOGS[date] || null;
      }
      function saveLog(date, log) {
        LOGS[date] = log;
        saveLogs();
      }
      function deleteLog(date) {
        delete LOGS[date];
        saveLogs();
        cloudDelete && cloudDelete("workouts", date);
      }
      function hasLog(date) {
        return !!LOGS[date];
      }

      // ---------- Pace helpers ----------
      function durationToSeconds(min, sec) {
        const m = parseFloat(min) || 0;
        const s = parseFloat(sec) || 0;
        return m * 60 + s;
      }
      function calcPace(distanceMi, totalSec) {
        if (!distanceMi || !totalSec || distanceMi <= 0 || totalSec <= 0)
          return null;
        return totalSec / distanceMi; // seconds per mile
      }
      // fmtPace() and fmtDuration() now live in lib/format.js (shared scope).

      // Bike: speed (mph) helpers — distance(mi) / duration(sec) → mph
      function calcSpeed(distanceMi, totalSec) {
        if (!distanceMi || !totalSec || distanceMi <= 0 || totalSec <= 0) return null;
        return (distanceMi / (totalSec / 3600)); // mph
      }
      function fmtSpeed(mph) {
        if (!mph || !isFinite(mph)) return null;
        return `${mph.toFixed(1)} mph`;
      }

      // ---------- Trends tab renderers ----------
      function totalLoggedMiles() {
        let total = 0;
        for (const date in LOGS) {
          const log = LOGS[date];
          if (log && log.distance) total += parseFloat(log.distance) || 0;
        }
        return total;
      }
      function countLogs() { return Object.keys(LOGS).length; }
      function countCheckins() { return Object.keys(CHECKINS).length; }

      // Streak: consecutive days back from today where a morning check-in was saved.
      // Today is "free" — not having checked in yet today doesn't break the streak.
      function currentStreak() {
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 366; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const iso = d.toISOString().slice(0, 10);
          if (CHECKINS[iso]) streak++;
          else {
            if (i === 0) continue; // today doesn't count against streak
            break;
          }
        }
        return streak;
      }

      function renderStatsCards() {
        const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
        const m = document.getElementById("statTotalMiles");
        const w = document.getElementById("statWorkouts");
        const c = document.getElementById("statCheckins");
        const s = document.getElementById("statStreak");
        if (m) m.textContent = fmt(totalLoggedMiles());
        if (w) w.textContent = countLogs();
        if (c) c.textContent = countCheckins();
        if (s) s.textContent = currentStreak();
      }

      // Generic SVG sparkline. dataPoints: [{date, value}], opts: {valueRange, lineColor, unit}
      function renderSparkline(elementId, dataPoints, opts = {}) {
        const el = document.getElementById(elementId);
        if (!el) return;
        if (!dataPoints || dataPoints.length === 0) {
          el.innerHTML = `<div class="sparkline-empty">No data yet</div>`;
          return;
        }
        // Last 30 entries, sorted by date
        const pts = dataPoints
          .slice()
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-30);
        const W = 300, H = 60;
        const padL = 4, padR = 4, padT = 6, padB = 6;
        const chartW = W - padL - padR;
        const chartH = H - padT - padB;
        const values = pts.map((p) => p.value);
        const minV = opts.valueRange ? opts.valueRange[0] : Math.min(...values) - 1;
        const maxV = opts.valueRange ? opts.valueRange[1] : Math.max(...values) + 1;
        const range = maxV - minV || 1;
        const xFor = (i) =>
          pts.length === 1
            ? padL + chartW / 2
            : padL + (i / (pts.length - 1)) * chartW;
        const yFor = (v) => padT + ((maxV - v) / range) * chartH;
        const line = pts.map((p, i) => `${xFor(i)},${yFor(p.value)}`).join(" ");
        const color = opts.lineColor || "var(--accent)";
        let svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">`;
        // Soft area fill below the line
        svg += `<polygon fill="${color}" fill-opacity="0.15" points="${padL},${H - padB} ${line} ${padL + chartW},${H - padB}"/>`;
        // Line
        if (pts.length > 1) {
          svg += `<polyline points="${line}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
        }
        // Points (dots)
        for (let i = 0; i < pts.length; i++) {
          const cx = xFor(i), cy = yFor(pts[i].value);
          svg += `<circle cx="${cx}" cy="${cy}" r="2.5" fill="${color}"><title>${pts[i].date}: ${pts[i].value}${opts.unit || ""}</title></circle>`;
        }
        svg += `</svg>`;
        el.innerHTML = svg;
      }

      // Build dataPoints for a check-in field
      function checkinPoints(field) {
        const points = [];
        for (const date in CHECKINS) {
          const v = CHECKINS[date][field];
          if (v != null) points.push({ date, value: v });
        }
        return points;
      }

      function renderRecoveryTrends() {
        // Body Battery (0–100)
        const bb = checkinPoints("bodyBattery");
        renderSparkline("bbChart", bb, {
          valueRange: [0, 100],
          lineColor: "var(--p2)",
        });
        updateTrendMeta("bbMeta", bb, { unit: "", goodDirection: "up" });
        // Resting HR (dynamic range)
        const rhr = checkinPoints("restingHr");
        renderSparkline("rhrChart", rhr, { lineColor: "var(--p4)", unit: " bpm" });
        updateTrendMeta("rhrMeta", rhr, { unit: " bpm", goodDirection: "down" });
        // Energy (1–10)
        const en = checkinPoints("energy");
        renderSparkline("energyChart", en, {
          valueRange: [1, 10],
          lineColor: "var(--p1)",
        });
        updateTrendMeta("energyMeta", en, { unit: "/10", goodDirection: "up" });
        // Weight (lb) — uses WEIGHTS store; down is "good" given deficit phase
        const wts = weightPoints();
        renderSparkline("weightSlChart", wts, { lineColor: "var(--p5)", unit: " lb" });
        updateWeightTrendMeta("weightSlMeta", wts);
      }

      // Build weight data points from WEIGHTS store
      function weightPoints() {
        const points = [];
        for (const date in WEIGHTS) {
          const w = WEIGHTS[date];
          if (w && w.weight != null) points.push({ date, value: parseFloat(w.weight) });
        }
        return points;
      }

      // Weight-specific meta line: shows current weight, BF% if known, and 7-day avg.
      // Direction-of-good is "down" since user is in a planned deficit through phases 1-3.
      function updateWeightTrendMeta(elementId, points) {
        const el = document.getElementById(elementId);
        if (!el) return;
        if (!points || points.length === 0) {
          el.textContent = "No data yet";
          return;
        }
        const sorted = points.slice().sort((a, b) => a.date.localeCompare(b.date));
        const latest = sorted[sorted.length - 1];
        const last7 = sorted.slice(-7);
        const avg7 = last7.reduce((s, p) => s + p.value, 0) / last7.length;
        // BF % from same-date entry
        const bf = WEIGHTS[latest.date] && WEIGHTS[latest.date].bodyFat;
        // Direction (down = good for weight; tolerance 0.3 lb)
        let arrow = "";
        if (sorted.length >= 2) {
          const diff = latest.value - avg7;
          if (Math.abs(diff) < 0.3) arrow = `<span class="trend-arrow flat">→</span>`;
          else if (diff > 0) arrow = `<span class="trend-arrow up">↑</span>`;
          else arrow = `<span class="trend-arrow down">↓</span>`;
        }
        let html = `<span class="trend-current">${latest.value.toFixed(1)} lb</span>`;
        if (bf != null) html += `<span class="trend-avg">${parseFloat(bf).toFixed(1)}% BF</span> `;
        html += `${arrow}<span class="trend-avg">7-day avg ${avg7.toFixed(1)}</span>`;
        el.innerHTML = html;
      }

      function updateTrendMeta(elementId, points, opts) {
        const el = document.getElementById(elementId);
        if (!el) return;
        if (!points || points.length === 0) {
          el.textContent = "No data yet";
          return;
        }
        const sorted = points.slice().sort((a, b) => a.date.localeCompare(b.date));
        const latest = sorted[sorted.length - 1].value;
        // 7-day average (last up-to-7 entries)
        const last7 = sorted.slice(-7);
        const avg7 = last7.reduce((s, p) => s + p.value, 0) / last7.length;
        // Direction of last entry vs 7-day average (skip if only 1 point)
        let arrow = "";
        if (sorted.length >= 2) {
          const diff = latest - avg7;
          const threshold = opts.unit === " bpm" ? 2 : 0.5;
          if (Math.abs(diff) < threshold) arrow = `<span class="trend-arrow flat">→</span>`;
          else if (diff > 0) {
            const cls = opts.goodDirection === "up" ? "down" : "up";
            arrow = `<span class="trend-arrow ${cls}">↑</span>`;
          } else {
            const cls = opts.goodDirection === "down" ? "down" : "up";
            // For "down is good" (RHR): a drop is good (green/down).
            // For "up is good" (BB/Energy): a drop is bad (red/up).
            arrow = `<span class="trend-arrow ${cls === "down" ? "down" : "up"}">↓</span>`;
          }
        }
        const fmt = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
        el.innerHTML = `<span class="trend-current">${fmt(latest)}${opts.unit}</span>${arrow}<span class="trend-avg">7-day avg ${fmt(avg7)}</span>`;
      }

      // Period strip: last 60 days
      function renderPeriodStrip() {
        const stripEl = document.getElementById("periodStrip");
        const axisEl = document.getElementById("periodAxis");
        const metaEl = document.getElementById("periodMeta");
        if (!stripEl) return;
        const today = new Date();
        const todayISOStr = today.toISOString().slice(0, 10);
        const cells = [];
        for (let i = 59; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const iso = d.toISOString().slice(0, 10);
          const c = CHECKINS[iso];
          const flow = c ? c.cyclePhase : null;
          cells.push({ date: iso, day: d.getDate(), month: d.getMonth() + 1, flow, isToday: iso === todayISOStr });
        }
        // Strip
        let stripHtml = "";
        const flowLabel = {
          spotting: "Spotting",
          light: "Light",
          medium: "Medium",
          heavy: "Heavy",
          none: "None",
        };
        for (const cell of cells) {
          const cls = [];
          if (cell.flow && cell.flow !== "none") cls.push(`flow-${cell.flow}`);
          if (cell.isToday) cls.push("is-today");
          const tip = `${cell.date}: ${cell.flow ? flowLabel[cell.flow] || cell.flow : "(no entry)"}`;
          stripHtml += `<div class="period-cell ${cls.join(" ")}" title="${tip}"></div>`;
        }
        stripEl.innerHTML = stripHtml;
        // Axis: label every 10 days
        let axisHtml = "";
        for (let i = 0; i < cells.length; i++) {
          axisHtml += `<div>${i % 10 === 0 ? `${cells[i].month}/${cells[i].day}` : ""}</div>`;
        }
        axisEl.innerHTML = axisHtml;
        // Meta: last period summary
        if (metaEl) metaEl.innerHTML = computePeriodMeta();
      }

      function computePeriodMeta() {
        // Sorted bleed entries (any non-"none" value)
        const bleedDays = [];
        for (const date in CHECKINS) {
          const c = CHECKINS[date];
          if (c.cyclePhase && c.cyclePhase !== "none") bleedDays.push(date);
        }
        if (!bleedDays.length) {
          return 'No bleeding logged yet — mark "Period" in your daily check-in to start tracking.';
        }
        bleedDays.sort();
        // Group consecutive days into "periods" (a sequence is broken by a gap of 2+ days)
        const periods = [];
        let current = [bleedDays[0]];
        for (let i = 1; i < bleedDays.length; i++) {
          const prev = new Date(current[current.length - 1] + "T00:00:00");
          const cur = new Date(bleedDays[i] + "T00:00:00");
          const gap = Math.round((cur - prev) / 86400000);
          if (gap <= 2) current.push(bleedDays[i]);
          else { periods.push(current); current = [bleedDays[i]]; }
        }
        periods.push(current);
        const lastPeriod = periods[periods.length - 1];
        const firstDay = lastPeriod[0];
        const lastDay = lastPeriod[lastPeriod.length - 1];
        const today = new Date();
        const lastEnd = new Date(lastDay + "T00:00:00");
        const daysSince = Math.round((today - lastEnd) / 86400000);
        const lengthDays = lastPeriod.length;
        let html = `Last period: <b>${firstDay}</b>`;
        if (lengthDays > 1) html += ` &ndash; <b>${lastDay}</b> (${lengthDays} days)`;
        else html += ` (1 day so far)`;
        if (daysSince === 0) html += ` &middot; happening today`;
        else if (daysSince > 0) html += ` &middot; ${daysSince} day${daysSince === 1 ? "" : "s"} ago`;
        // Cycle length (gap between starts of last two periods)
        if (periods.length >= 2) {
          const prevStart = new Date(periods[periods.length - 2][0] + "T00:00:00");
          const thisStart = new Date(firstDay + "T00:00:00");
          const cycleLen = Math.round((thisStart - prevStart) / 86400000);
          html += ` &middot; last cycle: <b>${cycleLen}</b> days`;
        }
        return html;
      }

      function renderTrends() {
        renderStatsCards();
        renderRecap();
        renderRacePredictor();
        renderRecoveryTrends();
        renderPeriodStrip();
      }

      // ---------- Fuel: nutrition tracking (PCOS-aware) ----------
      // Per nutritionist guidance: energy availability is the key metric for
      // a female athlete with PCOS. Calorie targets are tuned to keep EA
      // (intake − exercise) / kg LBM in the optimal zone (≥45) on training
      // days, with deliberate cycling between rest/easy/quality/long days.
      const LBM_KG = 47.8; // 105.4 lb → kg
      const LUTEAL_BUMP = 200;

      // Calorie ranges by phase + day type (nutritionist's revised numbers).
      // For each phase: { rest, easy, bike, quality, long, race }.
      // Strength is handled as a +250 cal adjustment via exercise math, not target.
      const PHASE_CAL_RANGES = {
        1: { rest: 1650, easy: 1750, bike: 1750, quality: 1850, long: 2050, race: 2200 },
        2: { rest: 1700, easy: 1800, bike: 1800, quality: 1900, long: 2100, race: 2200 },
        3: { rest: 1700, easy: 1800, bike: 1800, quality: 1950, long: 2150, race: 2200 },
        4: { rest: 1750, easy: 1850, bike: 1850, quality: 2000, long: 2200, race: 2200 },
        5: { rest: 1650, easy: 1750, bike: 1750, quality: 1850, long: 1950, race: 2100 },
      };

      // EA zones (kcal/kg LBM)
      function eaZoneFor(ea) {
        if (ea == null || isNaN(ea)) return null;
        if (ea >= 45) return { label: "Optimal", cls: "optimal", desc: "Excellent — your body has what it needs to recover and adapt." };
        if (ea >= 30) return { label: "Subclinical LEA", cls: "subclinical", desc: "Borderline. Add ~150-250 cal to today's intake, prioritizing carbs around training." };
        return { label: "Clinical LEA / RED-S risk", cls: "clinical", desc: "Too low. Fuel more today — your body needs the energy to support training and hormones." };
      }

      // Pick today's day + week (or clamp to first / last day of plan)
      function findDayForDate(dateStr) {
        for (const w of DATA.weeks) {
          for (const d of w.days) {
            if (d.date === dateStr) return { day: d, week: w };
          }
        }
        return null;
      }

      // Estimate exercise calories for a date based on logs + completed sections.
      function exerciseCalsForDate(date) {
        let total = 0;
        const log = LOGS[date];
        if (log) {
          const isBike = !!(log.avgPower || log.avgSpeedLabel);
          if (isBike && log.durationSec) {
            total += (log.durationSec / 60) * 8; // ~8 cal/min Z2 bike
          } else if (log.distance) {
            total += parseFloat(log.distance) * 100; // 100 cal/mile running
          } else if (log.durationSec) {
            total += (log.durationSec / 60) * 8;
          }
        }
        // Strength bonus when section marked done
        const completed = COMPLETED[date];
        if (completed && typeof completed === "object" && completed.strength === true) {
          total += 250;
        }
        return Math.round(total);
      }

      // Build today's target object (cal + macros + meta)
      function buildTodayTarget() {
        const dateStr = todayClampedISO();
        const ctx = findDayForDate(dateStr);
        if (!ctx) return null;
        const day = ctx.day;
        const week = ctx.week;
        const phase = week.phase;
        const plannedCat = categorize(day);

        // If workout not done, check for actual workout override
        const workoutDone = isDone(day);
        const actual = WORKOUT_ACTUAL[dateStr];

        // Map actual selection to a calorie category
        const actualCatMap = {
          nothing:  "rest",
          walk:     "easy",
          easy_run: "easy",
          bike:     "bike",
          done:     plannedCat,
        };
        const cat = (!workoutDone && actual) ? (actualCatMap[actual] || plannedCat) : plannedCat;

        const baseCal = (PHASE_CAL_RANGES[phase] && PHASE_CAL_RANGES[phase][cat]) || PHASE_CAL_RANGES[phase].easy;
        const luteal = !!FUEL_PREFS.luteal;
        const targetCal = baseCal + (luteal ? LUTEAL_BUMP : 0);
        const targetP = 150;
        const targetF = luteal ? 70 : 60;
        const targetFi = 30;
        const targetNa = (cat === "quality" || cat === "long" || cat === "race") ? 2600 : 2300;
        const carbCal = targetCal - targetP * 4 - targetF * 9;
        const targetC = Math.max(120, Math.round(carbCal / 4));
        return {
          date: dateStr,
          day, week, phase, cat, plannedCat,
          baseCal, targetCal, luteal,
          targetP, targetF, targetC, targetFi, targetNa,
          workoutDone, actual,
        };
      }

      // ---------- Meal storage ----------
      const MEAL_KEY = "katie-mile-meals";
      function loadMeals() {
        try { const raw = localStorage.getItem(MEAL_KEY); return raw ? JSON.parse(raw) : {}; }
        catch (e) { return {}; }
      }
      function persistMeals() {
        try { localStorage.setItem(MEAL_KEY, JSON.stringify(MEALS)); } catch (e) {}
        if (typeof scheduleSync === "function") scheduleSync();
      }
      let MEALS = loadMeals();

      // Fuel preferences (luteal toggle, etc.)
      const FUEL_PREFS_KEY = "katie-mile-fuel-prefs";
      function loadFuelPrefs() {
        try { const raw = localStorage.getItem(FUEL_PREFS_KEY); return raw ? JSON.parse(raw) : { luteal: false }; }
        catch (e) { return { luteal: false }; }
      }
      function persistFuelPrefs() {
        try { localStorage.setItem(FUEL_PREFS_KEY, JSON.stringify(FUEL_PREFS)); } catch (e) {}
      }
      let FUEL_PREFS = loadFuelPrefs();

      // ---------- Saved scans (searchable pantry of past scans + USDA picks) ----------
      // Every successful barcode/label scan and every applied USDA pick is
      // remembered here with its BASE values (per_100g or per_serving), so it
      // can be searched and re-logged later without re-photographing the label
      // or re-running the USDA lookup. The search box (initFoodSearch) surfaces
      // matches; clicking one reopens the normal portion picker (showScanPortion).
      const SAVED_FOODS_KEY = "katie-mile-saved-foods";
      function loadSavedFoods() {
        try { const raw = localStorage.getItem(SAVED_FOODS_KEY); return raw ? JSON.parse(raw) : []; }
        catch (e) { return []; }
      }
      function persistSavedFoods() {
        try { localStorage.setItem(SAVED_FOODS_KEY, JSON.stringify(SAVED_FOODS)); } catch (e) {}
        if (typeof scheduleSync === "function") scheduleSync();
      }
      let SAVED_FOODS = loadSavedFoods();

      // Identity for a saved food so re-scanning the same product updates one
      // entry instead of piling up duplicates.
      function savedFoodKey(r) {
        return [
          (r.name || "").toLowerCase().trim(),
          (r.brand || "").toLowerCase().trim(),
          r.basis || "",
          Math.round(r.cal || 0),
        ].join("|");
      }

      // Remember (or refresh) a scanned / looked-up product. `r` must carry the
      // BASE nutrition (per_100g or per_serving), not a scaled portion.
      function rememberSavedFood(r) {
        if (!r) return;
        if (r.cal == null && r.protein_g == null && r.carbs_g == null) return;
        const key = savedFoodKey(r);
        const now = new Date().toISOString();
        const existing = SAVED_FOODS.find((f) => f.key === key);
        if (existing) {
          existing.lastUsed = now;
          existing.useCount = (existing.useCount || 1) + 1;
          Object.assign(existing, {
            name: r.name || existing.name,
            brand: r.brand != null ? r.brand : existing.brand,
            serving: r.serving != null ? r.serving : existing.serving,
            basis: r.basis || existing.basis,
            cal: r.cal, protein_g: r.protein_g, carbs_g: r.carbs_g, fat_g: r.fat_g,
            fiber_g: r.fiber_g, sodium_mg: r.sodium_mg,
            source: r.source || existing.source, foodId: r.foodId || existing.foodId,
          });
        } else {
          SAVED_FOODS.push({
            key,
            name: r.name || "Saved food", brand: r.brand || null,
            serving: r.serving || null, basis: r.basis || "unknown",
            cal: r.cal, protein_g: r.protein_g ?? null, carbs_g: r.carbs_g ?? null,
            fat_g: r.fat_g ?? null, fiber_g: r.fiber_g ?? null, sodium_mg: r.sodium_mg ?? null,
            source: r.source || "scan", foodId: r.foodId || null,
            savedAt: now, lastUsed: now, useCount: 1,
          });
        }
        // Keep the library bounded (most-recently-used 200).
        if (SAVED_FOODS.length > 200) {
          SAVED_FOODS.sort((a, b) => (b.lastUsed || "").localeCompare(a.lastUsed || ""));
          SAVED_FOODS = SAVED_FOODS.slice(0, 200);
        }
        persistSavedFoods();
      }

      // Local fuzzy-ish search over saved foods: substring match on name or
      // brand, ranked by how often / how recently it's been used.
      function searchSavedFoods(q, limit = 6) {
        const needle = (q || "").toLowerCase().trim();
        if (!needle) return [];
        return SAVED_FOODS
          .filter((f) => (f.name || "").toLowerCase().includes(needle) ||
                         (f.brand || "").toLowerCase().includes(needle))
          .sort((a, b) => (b.useCount || 0) - (a.useCount || 0) ||
                          (b.lastUsed || "").localeCompare(a.lastUsed || ""))
          .slice(0, limit);
      }

      // Holds the FatSecret food-pick metadata between "user picked a result
      // and clicked Use this" and "user clicks Add on the form". Lets us
      // attach food_id / brand / serving to the meal row even though the
      // form itself only carries the editable nutrition numbers.
      let PENDING_FOOD_PICK = null;

      function todaysMeals() {
        const date = todayISO();
        return MEALS[date] || [];
      }
      function addMeal(date, meal) {
        if (!MEALS[date]) MEALS[date] = [];
        MEALS[date].push(meal);
        persistMeals();
      }
      function deleteMeal(date, id) {
        if (!MEALS[date]) return;
        MEALS[date] = MEALS[date].filter(m => m.id !== id);
        if (MEALS[date].length === 0) delete MEALS[date];
        persistMeals();
        if (isSignedIn && isSignedIn() && supaClient) {
          supaClient.from("meals").delete().eq("id", id).then(() => {});
        }
      }

      // Sum macros for a list of meals
      // sumMacros() now lives in lib/format.js (loaded first, shared scope).

      // ---------- Fuel rendering ----------
      const dayTypeLabel = {
        rest: "Rest day",
        easy: "Easy run",
        bike: "Bike / cross-train",
        quality: "Quality (intervals/tempo)",
        long: "Long run",
        race: "Race day",
      };

      function renderFuelTarget() {
        const target = buildTodayTarget();
        if (!target) return;

        // Meta line
        const metaEl = document.getElementById("fuelTargetMeta");
        const lbl = dayTypeLabel[target.cat] || target.cat;
        let meta = `Phase ${target.phase} · ${lbl}`;
        if (target.luteal) meta += ` · luteal +${LUTEAL_BUMP}`;
        if (metaEl) metaEl.textContent = meta;

        // Compute totals logged so far today
        const meals = todaysMeals();
        const totals = sumMacros(meals);

        // Remaining
        const remCal  = Math.round(target.targetCal - totals.cal);
        const remP    = Math.round(target.targetP   - totals.p);
        const remC    = Math.round(target.targetC   - totals.c);
        const remF    = Math.round(target.targetF   - totals.f);
        const pct     = Math.min(100, Math.round((totals.cal / Math.max(target.targetCal, 1)) * 100));
        const isOver  = totals.cal > target.targetCal;

        // Hero remaining cal
        const remEl = document.getElementById("ftcRemaining");
        if (remEl) {
          remEl.textContent = Math.abs(remCal).toLocaleString();
          remEl.className = "ftc-remaining" + (isOver ? " over" : "");
        }
        const remLblEl = document.querySelector(".ftc-remaining-label");
        if (remLblEl) remLblEl.textContent = isOver ? "calories over target" : "calories remaining";

        // Bar
        const fill = document.getElementById("ftcCalFill");
        if (fill) { fill.style.width = pct + "%"; fill.className = "ftc-bar-fill" + (isOver ? " over" : ""); }
        const cons = document.getElementById("ftcConsumed");
        const tgt  = document.getElementById("ftcTarget");
        if (cons) cons.textContent = Math.round(totals.cal).toLocaleString() + " consumed";
        if (tgt)  tgt.textContent  = target.targetCal.toLocaleString() + " target";

        // Macro pills
        const setMacro = (id, lblId, barId, val, target, name) => {
          const el = document.getElementById(id);
          const lbl = document.getElementById(lblId);
          const bar = document.getElementById(barId);
          if (!el) return;
          el.textContent = Math.abs(val) + "g";
          const over = val < 0;
          el.className = "ftc-macro-val" + (over ? " over" : "");
          if (lbl) lbl.textContent = name + (over ? " over" : " left");
          if (bar) {
            const pct = Math.min(100, Math.round(((target - Math.max(val, 0)) / Math.max(target, 1)) * 100));
            bar.style.width = pct + "%";
            bar.className = "ftc-macro-bar-fill" + (over ? " over" : "");
          }
        };
        setMacro("ftcProtein", "ftcProteinLbl", "ftcProteinBar", remP, target.targetP, "protein");
        setMacro("ftcCarbs",   "ftcCarbsLbl",   "ftcCarbsBar",   remC, target.targetC, "carbs");
        setMacro("ftcFat",     "ftcFatLbl",      "ftcFatBar",     remF, target.targetF, "fat");

        // Luteal toggle
        const lutealCb = document.getElementById("lutealCheck");
        const lutealEl = document.getElementById("lutealToggle");
        if (lutealCb) lutealCb.checked = !!target.luteal;
        if (lutealEl) lutealEl.classList.toggle("active", !!target.luteal);

        // Show/hide actual workout selector
        const actualEl = document.getElementById("ftcActual");
        if (actualEl) {
          actualEl.style.display = target.workoutDone ? "none" : "block";
          // Highlight selected pill
          actualEl.querySelectorAll(".ftc-pill").forEach(btn => {
            btn.classList.toggle("selected", btn.dataset.actual === (target.actual || ""));
            btn.onclick = () => {
              WORKOUT_ACTUAL[target.date] = btn.dataset.actual;
              saveWorkoutActual(WORKOUT_ACTUAL);
              renderFuelTarget();
            };
          });
        }

        return target;
      }

      // Build a list of recent unique foods sorted by frequency, then recency.
      // De-duplicate by name+cal+macros so "Oatmeal 350 cal" appears once even if logged daily.
      // Note: we carry brand / serving / na / foodId on the chip too so that
      // re-logging a previously-searched food preserves the FatSecret metadata.
      function recentUniqueFoods(limit = 12) {
        const seen = new Map();
        const dates = Object.keys(MEALS).sort().reverse();
        for (const date of dates) {
          for (const m of (MEALS[date] || [])) {
            const key = `${(m.name || "").toLowerCase().trim()}|${m.cal || 0}|${m.p || 0}|${m.c || 0}|${m.f || 0}|${m.fiber || 0}|${m.na || 0}|${m.serving || ""}`;
            if (!seen.has(key)) {
              seen.set(key, {
                name: m.name, cal: m.cal, p: m.p, c: m.c, f: m.f, fiber: m.fiber, na: m.na,
                brand: m.brand || null, serving: m.serving || null, foodId: m.foodId || null,
                source: m.source || null,
                count: 1, lastDate: date,
              });
            } else {
              seen.get(key).count++;
            }
          }
        }
        return Array.from(seen.values())
          .sort((a, b) => b.count - a.count || b.lastDate.localeCompare(a.lastDate))
          .slice(0, limit);
      }

      function renderRecentChips() {
        const el = document.getElementById("recentFoods");
        if (!el) return;
        const items = recentUniqueFoods(6);
        if (!items.length) { el.style.display = "none"; return; }
        el.style.display = "";
        let html = `<div class="recent-label">Recent — tap to log again</div><div class="recent-chips">`;
        for (let i = 0; i < items.length; i++) {
          const m = items[i];
          const safeName = (m.name || "(unnamed)").replace(/</g, "&lt;");
          html += `<button type="button" class="recent-chip" data-idx="${i}" title="${safeName} — ${m.cal} cal"><span class="chip-name">${safeName}</span><span class="chip-cal">${m.cal} cal</span></button>`;
        }
        html += `</div>`;
        el.innerHTML = html;
        el.querySelectorAll(".recent-chip").forEach((btn) => {
          btn.addEventListener("click", () => {
            const item = items[parseInt(btn.dataset.idx, 10)];
            if (!item) return;
            const meal = {
              id: (crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(36).slice(2)),
              name: item.name,
              cal: item.cal,
              p: item.p, c: item.c, f: item.f, fiber: item.fiber, na: item.na,
              foodId: item.foodId || null,
              brand: item.brand || null,
              serving: item.serving || null,
              source: item.source || (item.foodId ? "usda" : "manual"),
              loggedAt: new Date().toISOString(),
            };
            addMeal(todayISO(), meal);
            renderFuel();
            showToast(`Logged ${item.name} (${item.cal} cal).`);
          });
        });
      }

      function renderFuelMeals() {
        const listEl = document.getElementById("fuelMealList");
        if (!listEl) return;
        const meals = todaysMeals();
        if (!meals.length) {
          listEl.innerHTML = `<div class="fuel-empty">No meals logged yet today.</div>`;
          return;
        }
        let html = "";
        for (const m of meals) {
          const stats = [];
          if (m.p) stats.push(`${m.p}P`);
          if (m.c) stats.push(`${m.c}C`);
          if (m.f) stats.push(`${m.f}F`);
          if (m.fiber) stats.push(`${m.fiber} fiber`);
          if (m.na) stats.push(`${Math.round(m.na)}mg Na`);
          // Build a "Brand · serving" subtitle for foods looked up via FatSecret
          const subBits = [];
          if (m.brand) subBits.push(m.brand);
          if (m.serving) subBits.push(m.serving);
          const subtitle = subBits.length
            ? `<div class="ms" style="opacity:.75">${subBits.join(" · ").replace(/</g, "&lt;")}</div>`
            : "";
          html += `<div class="fuel-meal-row">
            <div>
              <div class="mn">${(m.name || "(unnamed)").replace(/</g, "&lt;")}</div>
              ${subtitle}
              ${stats.length ? `<div class="ms">${stats.join(" · ")}</div>` : ""}
            </div>
            <div class="mc">${m.cal} cal</div>
            <button type="button" data-del-id="${m.id}" title="Delete">×</button>
          </div>`;
        }
        listEl.innerHTML = html;
        listEl.querySelectorAll("[data-del-id]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const date = todayISO();
            deleteMeal(date, btn.dataset.delId);
            renderFuel();
          });
        });
      }

      function renderFuelProgress(target) {
        const meals = todaysMeals();
        const totals = sumMacros(meals);
        function pct(v, t) { return Math.min(120, Math.round((v / Math.max(t, 1)) * 100)); }
        function setBar(barId, valId, val, target, unit, isCal) {
          const fill = document.getElementById(barId);
          const valEl = document.getElementById(valId);
          if (!fill || !valEl) return;
          const p = pct(val, target);
          fill.style.width = Math.min(100, p) + "%";
          fill.classList.toggle("over", val > target);
          const fmt = (n) => (isCal ? Math.round(n) : n.toFixed(0));
          valEl.innerHTML = `<b>${fmt(val)}${unit || ""}</b> / ${target}${unit || ""}`;
        }
        setBar("fuelBarCal", "fuelValCal", totals.cal, target.targetCal, "", true);
        setBar("fuelBarP", "fuelValP", totals.p, target.targetP, "g");
        setBar("fuelBarC", "fuelValC", totals.c, target.targetC, "g");
        setBar("fuelBarF", "fuelValF", totals.f, target.targetF, "g");
        setBar("fuelBarFi", "fuelValFi", totals.fiber, target.targetFi, "g");
        setBar("fuelBarNa", "fuelValNa", totals.na, target.targetNa, "mg", true);
      }

      function renderFuelEA(target) {
        const meals = todaysMeals();
        const totals = sumMacros(meals);
        const exCal = exerciseCalsForDate(todayISO());
        const ea = totals.cal > 0 ? (totals.cal - exCal) / LBM_KG : null;
        const card = document.getElementById("eaCard");
        const val = document.getElementById("eaValue");
        const zoneEl = document.getElementById("eaZone");
        const detailEl = document.getElementById("eaDetail");
        if (!card) return;
        card.classList.remove("optimal", "subclinical", "clinical");

        // Nothing eaten yet at all — neutral "log some food" state
        if (ea == null) {
          val.textContent = "—";
          zoneEl.textContent = "Log some food to see your EA";
          detailEl.innerHTML = `Exercise today: <b>${exCal}</b> cal. EA = (intake − ${exCal}) / 47.8 kg LBM. Optimal ≥ 45 · subclinical LEA 30–45 · clinical &lt; 30.`;
          return;
        }

        // Time-aware: an EA reading isn't meaningful until most of the day's
        // eating has happened. At 5am with a banana logged, "RED-S risk" is
        // a false alarm — you just haven't had breakfast yet.
        // Reliable threshold: 5pm onwards, OR you've logged ≥ 40% of your
        // calorie target (substantial intake suggests most meals are in).
        const hour = new Date().getHours();
        const reliable = hour >= 17 || totals.cal >= (target.targetCal || 2000) * 0.4;

        val.textContent = ea.toFixed(0);

        if (!reliable) {
          // Show the EA number for awareness but skip the zone warnings —
          // it's normal to be low this early.
          zoneEl.textContent = "Still early — keep logging through the day";
          let stamp;
          if (hour < 11) stamp = "Morning";
          else if (hour < 14) stamp = "Around lunchtime";
          else stamp = "Afternoon";
          detailEl.innerHTML = `${stamp}, intake so far: <b>${Math.round(totals.cal)}</b> cal · Exercise today: <b>${exCal}</b> cal. EA will read low until you've finished most of today's eating — check back this evening for a meaningful reading.`;
          return;
        }

        // Reliable EA reading — show actual zone
        const zone = eaZoneFor(ea);
        zoneEl.textContent = zone.label;
        card.classList.add(zone.cls);
        detailEl.innerHTML = `Intake: <b>${Math.round(totals.cal)}</b> cal · Exercise: <b>${exCal}</b> cal · Net: <b>${Math.round(totals.cal - exCal)}</b> / 47.8 kg LBM. ${zone.desc}`;
      }

      function renderFuel() {
        const target = renderFuelTarget();
        if (!target) return;
        renderRecentChips();
        renderFuelMeals();
        renderFuelProgress(target);
        renderFuelEA(target);
      }

      function initFuel() {
        const form = document.getElementById("fuelForm");
        if (!form) return;
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const name = document.getElementById("mealName").value.trim();
          const cal = document.getElementById("mealCal").value;
          if (!cal) return;
          // PENDING_FOOD_PICK carries forward the FatSecret metadata
          // (food_id / brand / serving) when the user filled the form via
          // search. For manual entries it's null and those fields stay empty.
          const pending = PENDING_FOOD_PICK || {};
          const meal = {
            id: (crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(36).slice(2)),
            name: name || "(unnamed)",
            cal: parseInt(cal, 10),
            p: parseFloat(document.getElementById("mealP").value) || null,
            c: parseFloat(document.getElementById("mealC").value) || null,
            f: parseFloat(document.getElementById("mealF").value) || null,
            fiber: parseFloat(document.getElementById("mealFi").value) || null,
            na: parseFloat(document.getElementById("mealNa").value) || null,
            // FatSecret-sourced metadata (null for manual entries)
            foodId: pending.foodId || null,
            brand: pending.brand || null,
            serving: pending.serving || null,
            source: pending.source || (pending.foodId ? "usda" : "manual"),
            loggedAt: new Date().toISOString(),
          };
          addMeal(todayISO(), meal);
          // Clear inputs (including the new sodium field) + pending pick
          ["mealName", "mealCal", "mealP", "mealC", "mealF", "mealFi", "mealNa"].forEach((id) => {
            document.getElementById(id).value = "";
          });
          PENDING_FOOD_PICK = null;
          renderFuel();
        });
        // Luteal toggle
        const lutealCb = document.getElementById("lutealCheck");
        if (lutealCb) {
          lutealCb.addEventListener("change", (e) => {
            FUEL_PREFS.luteal = e.target.checked;
            persistFuelPrefs();
            renderFuel();
          });
        }
        // FatSecret food-search wiring (search box, dropdown, serving picker)
        initFoodSearch();
        // Camera scan (barcode / nutrition label) wiring
        initFoodScan();
        initScanPortion();
        renderFuel();
      }


      // ---------- Food scan: barcode (Open Food Facts) or label photo (vision AI) ----------
      // One photo, two attempts: try to decode a barcode from the image first
      // (free, exact, great EU coverage via Open Food Facts); if there is no
      // readable barcode, send the downscaled photo to /api/label/proxy where
      // a vision model reads the nutrition table (handles German/Danish labels,
      // per-100g vs per-serving, salt->sodium conversion).
      const ZXING_CDN = "https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js";
      let zxingLoading = null;
      function loadZXing() {
        if (window.ZXing) return Promise.resolve(window.ZXing);
        if (zxingLoading) return zxingLoading;
        zxingLoading = new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = ZXING_CDN;
          s.onload = () => resolve(window.ZXing);
          s.onerror = () => { zxingLoading = null; reject(new Error("barcode lib failed to load")); };
          document.head.appendChild(s);
        });
        return zxingLoading;
      }
      function setScanStatus(text) {
        const el = document.getElementById("scanStatus");
        if (el) el.textContent = text || "";
      }
      function fileToImage(file) {
        return new Promise((resolve, reject) => {
          const url = URL.createObjectURL(file);
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("could not read photo")); };
          img.src = url;
        });
      }
      // Downscale for upload: vision models don't need more than ~1280px,
      // and Vercel functions cap request size.
      function downscaleToBase64(img, maxDim = 1280, quality = 0.85) {
        const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/jpeg", quality).split(",")[1];
      }
      // Try to find a barcode in the (full-resolution) photo. Returns the
      // digits or null — never throws, a miss just means "use the vision path".
      async function tryDecodeBarcode(img) {
        try {
          const ZX = await loadZXing();
          const reader = new ZX.BrowserMultiFormatReader();
          const result = reader.decodeFromImageElement
            ? await reader.decodeFromImageElement(img)
            : await reader.decodeFromImage(img);
          const text = result && (result.getText ? result.getText() : result.text);
          return text && /^\d{8,14}$/.test(text) ? text : null;
        } catch (e) {
          return null; // NotFoundException etc. — no barcode in frame
        }
      }
      async function lookupOpenFoodFacts(code) {
        const url = `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,brands,serving_size,nutriments`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        if (data.status !== 1 || !data.product) return null;
        const p = data.product;
        const n = p.nutriments || {};
        // Prefer per-serving values when present; otherwise per 100 g.
        const perServing = n["energy-kcal_serving"] != null;
        const sfx = perServing ? "_serving" : "_100g";
        const cal = n["energy-kcal" + sfx];
        if (cal == null) return null;
        // OFF stores sodium in grams; some products only list salt (salt/2.5 = sodium).
        let sodiumMg = null;
        if (n["sodium" + sfx] != null) sodiumMg = Math.round(n["sodium" + sfx] * 1000);
        else if (n["salt" + sfx] != null) sodiumMg = Math.round((n["salt" + sfx] / 2.5) * 1000);
        return {
          name: p.product_name || "Scanned food",
          brand: p.brands || null,
          serving: perServing ? (p.serving_size || "1 serving") : "100 g",
          basis: perServing ? "per_serving" : "per_100g",
          cal: Math.round(cal),
          protein_g: n["proteins" + sfx] ?? null,
          carbs_g: n["carbohydrates" + sfx] ?? null,
          fat_g: n["fat" + sfx] ?? null,
          fiber_g: n["fiber" + sfx] ?? null,
          sodium_mg: sodiumMg,
          source: "barcode",
          foodId: "off:" + code,
        };
      }
      async function readLabelWithVision(base64) {
        const res = await fetch("/api/label/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, mediaType: "image/jpeg" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "label read failed");
        data.source = "label_scan";
        return data;
      }
      // ---------- Scan portion picker ----------
      // Scanned values are per 100 g or per serving — this panel scales them
      // to what was actually eaten (e.g. a 250 ml energy drink scanned per
      // 100 ml) before the form is filled. Mirrors the USDA serving picker.
      let SCAN_RESULT = null;
      // Pull a number out of serving text like "250 ml", "40 g", "1 cup (240ml)".
      function servingGrams(text) {
        const m = String(text || "").match(/(\d+(?:[.,]\d+)?)\s*(?:g|ml)\b/i);
        return m ? parseFloat(m[1].replace(",", ".")) : null;
      }
      function scanScale() {
        const amt = parseFloat(String(document.getElementById("spAmount").value).replace(",", ".")) || 0;
        if (!SCAN_RESULT || amt <= 0) return null;
        return SCAN_RESULT.basis === "per_100g" ? amt / 100 : amt;
      }
      function renderScanPreview() {
        const el = document.getElementById("spPreview");
        if (!el || !SCAN_RESULT) return;
        const k = scanScale();
        if (k == null) { el.textContent = "Enter an amount above 0."; return; }
        const r = SCAN_RESULT;
        const f1 = (v) => (v == null ? "—" : (v * k).toFixed(1).replace(/\.0$/, ""));
        el.textContent = `${Math.round(r.cal * k)} kcal · ${f1(r.protein_g)}g P · ${f1(r.carbs_g)}g C · ${f1(r.fat_g)}g F`;
      }
      function showScanPortion(result) {
        SCAN_RESULT = result;
        // Remember the base scan so it's searchable later (Monster, etc.).
        rememberSavedFood(result);
        const panel = document.getElementById("scanPortion");
        if (!panel) { prefillMealForm(result); return; } // fallback: no panel in DOM
        const per100 = result.basis === "per_100g";
        document.getElementById("spName").textContent = result.name || "Scanned food";
        document.getElementById("spBasis").textContent = per100
          ? "label values are per 100 g/ml"
          : `per serving${result.serving ? ` (${result.serving})` : ""}`;
        document.getElementById("spAmountLbl").textContent = per100 ? "Amount eaten (g/ml)" : "× Servings";
        // Sensible default: the stated serving size (e.g. "250 ml" for an
        // energy drink) when we know it, else 100 g / 1 serving.
        const def = per100 ? (servingGrams(result.serving) || 100) : 1;
        document.getElementById("spAmount").value = String(def);
        panel.style.display = "";
        renderScanPreview();
        if (panel.scrollIntoView) panel.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      function hideScanPortion() {
        SCAN_RESULT = null;
        const panel = document.getElementById("scanPortion");
        if (panel) panel.style.display = "none";
      }
      function applyScanPortion() {
        const k = scanScale();
        if (!SCAN_RESULT || k == null) return;
        const r = SCAN_RESULT;
        const per100 = r.basis === "per_100g";
        const amtTxt = document.getElementById("spAmount").value;
        const portion = per100
          ? `${amtTxt} g/ml`
          : (parseFloat(amtTxt) === 1 ? (r.serving || "1 serving") : `${amtTxt} × ${r.serving || "serving"}`);
        const sc = (v) => (v == null ? null : v * k);
        prefillMealForm({
          name: `${r.name || "Scanned food"} (${portion})`,
          brand: r.brand || null,
          serving: portion,
          basis: "scaled",
          cal: r.cal * k,
          protein_g: sc(r.protein_g),
          carbs_g: sc(r.carbs_g),
          fat_g: sc(r.fat_g),
          fiber_g: sc(r.fiber_g),
          sodium_mg: sc(r.sodium_mg),
          source: r.source,
          foodId: r.foodId || null,
        });
        hideScanPortion();
      }
      function initScanPortion() {
        const apply = document.getElementById("spApply");
        const cancel = document.getElementById("spCancel");
        const amount = document.getElementById("spAmount");
        if (apply) apply.addEventListener("click", applyScanPortion);
        if (cancel) cancel.addEventListener("click", hideScanPortion);
        if (amount) amount.addEventListener("input", renderScanPreview);
      }

      // Prefill the existing manual meal form so the user reviews before Add.
      function prefillMealForm(r) {
        const set = (id, v, dp) => {
          const el = document.getElementById(id);
          if (el) el.value = v == null ? "" : (dp != null ? Number(v).toFixed(dp).replace(/\.0$/, "") : String(v));
        };
        let name = r.name || "Scanned food";
        if (r.basis === "per_100g") name += " (per 100 g)";
        else if (r.basis !== "scaled" && r.serving) name += ` (${r.serving})`;
        set("mealName", name);
        set("mealCal", Math.round(r.cal));
        set("mealP", r.protein_g, 1);
        set("mealC", r.carbs_g, 1);
        set("mealF", r.fat_g, 1);
        set("mealFi", r.fiber_g, 1);
        set("mealNa", r.sodium_mg != null ? Math.round(r.sodium_mg) : null);
        PENDING_FOOD_PICK = {
          foodId: r.foodId || null,
          brand: r.brand || null,
          serving: r.serving || null,
          source: r.source,
        };
        const nameEl = document.getElementById("mealName");
        if (nameEl) {
          nameEl.focus();
          if (nameEl.scrollIntoView) nameEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      async function handleScanPhoto(file) {
        const btn = document.getElementById("scanFoodBtn");
        if (btn) btn.disabled = true;
        try {
          hideScanPortion(); // a new scan replaces any pending portion picker
          setScanStatus("Reading photo…");
          const img = await fileToImage(file);
          // 1) Barcode first — exact and free
          const code = await tryDecodeBarcode(img);
          if (code) {
            setScanStatus("Barcode found — looking up…");
            const off = await lookupOpenFoodFacts(code);
            if (off) {
              showScanPortion(off);
              setScanStatus("");
              showToast(`Found ${off.name} — set your portion below.`);
              return;
            }
            // Barcode read but product unknown — fall through to the label reader
          }
          // 2) Vision label read
          setScanStatus("Reading nutrition label…");
          const result = await readLabelWithVision(downscaleToBase64(img));
          showScanPortion(result);
          setScanStatus("");
          const warn = result.confidence != null && result.confidence < 0.5;
          showToast(
            warn
              ? "Label was hard to read — double-check the values before adding."
              : `Read ${result.name || "label"} — set your portion below.`,
            warn ? "error" : undefined
          );
        } catch (err) {
          setScanStatus("");
          showToast("Scan failed: " + (err.message || err), "error");
        } finally {
          if (btn) btn.disabled = false;
        }
      }
      function initFoodScan() {
        const btn = document.getElementById("scanFoodBtn");
        const input = document.getElementById("scanFoodInput");
        if (!btn || !input) return;
        btn.addEventListener("click", () => input.click());
        input.addEventListener("change", () => {
          const file = input.files && input.files[0];
          input.value = ""; // allow rescanning the same file
          if (file) handleScanPhoto(file);
        });
      }

      // ---------- FatSecret food search ----------
      // Wires the search box to /api/fatsecret/proxy. UX:
      //   1. User types → debounced 300ms → search API called
      //   2. Results render as a dropdown of <div.food-result>
      //   3. Clicking a result fetches full nutrition + opens the serving picker
      //   4. User picks serving + quantity → "Use this — fill the form"
      //   5. Form's nutrition fields auto-fill; user can still edit; hits Add
      //
      // The serverless function holds the API key — the browser never sees
      // it. See api/usda/proxy.js for the server side. (We still have an
      // api/fatsecret/proxy.js sitting alongside in case FatSecret Premier
      // Free comes through later and we want to switch back — just flip the
      // FOOD_API_BASE constant.)
      const FOOD_API_BASE = "/api/usda/proxy";
      let foodSearchDebounceId = null;
      let foodSearchInFlight = 0;
      let currentFoodDetail = null; // result of /food/{id} after a pick

      async function foodSearchApi(query) {
        const url = `${FOOD_API_BASE}?method=search&query=${encodeURIComponent(query)}&max=10`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Search failed");
        return data.results || [];
      }
      async function foodLookupApi(foodId) {
        const url = `${FOOD_API_BASE}?method=food&id=${encodeURIComponent(foodId)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Food lookup failed");
        return data.food;
      }

      function initFoodSearch() {
        const input = document.getElementById("foodSearchInput");
        const clearBtn = document.getElementById("foodSearchClear");
        const resultsEl = document.getElementById("foodSearchResults");
        const statusEl = document.getElementById("foodSearchStatus");
        const pickerEl = document.getElementById("foodServingPicker");
        if (!input) return;

        function setStatus(text, isError) {
          statusEl.textContent = text || "";
          statusEl.classList.toggle("is-error", !!isError);
        }
        function clearResults() {
          resultsEl.style.display = "none";
          resultsEl.innerHTML = "";
        }
        function closePicker() {
          pickerEl.style.display = "none";
          currentFoodDetail = null;
        }

        // ---- Search box: debounced query → results dropdown ----
        input.addEventListener("input", (e) => {
          const q = e.target.value.trim();
          clearBtn.style.display = q ? "" : "none";
          clearTimeout(foodSearchDebounceId);
          if (q.length < 2) {
            clearResults();
            setStatus("");
            return;
          }
          // Saved scans/USDA picks are local — show them instantly while the
          // USDA network search runs in the background.
          const savedNow = searchSavedFoods(q);
          renderResults([], savedNow);
          setStatus("Searching…");
          foodSearchDebounceId = setTimeout(async () => {
            const myReq = ++foodSearchInFlight;
            try {
              const results = await foodSearchApi(q);
              // Bail if a newer request finished before us
              if (myReq !== foodSearchInFlight) return;
              const saved = searchSavedFoods(q);
              renderResults(results, saved);
              setStatus((results.length || saved.length) ? "" : "No matches.");
            } catch (err) {
              if (myReq !== foodSearchInFlight) return;
              // Network search failed, but saved matches may still be useful.
              const saved = searchSavedFoods(q);
              renderResults([], saved);
              setStatus(saved.length ? "Showing saved foods (USDA search failed)."
                                     : "Search failed: " + (err.message || err), !saved.length);
            }
          }, 300);
        });

        clearBtn.addEventListener("click", () => {
          input.value = "";
          clearBtn.style.display = "none";
          clearResults();
          setStatus("");
          closePicker();
          input.focus();
        });

        // ---- Results dropdown: saved scans on top, USDA matches below ----
        function renderResults(results, saved = []) {
          if (!results.length && !saved.length) {
            resultsEl.style.display = "none";
            resultsEl.innerHTML = "";
            return;
          }
          resultsEl.style.display = "";
          const safe = (s) => String(s || "").replace(/</g, "&lt;");
          let html = "";
          if (saved.length) {
            html += `<div class="fr-section-lbl">★ Saved — tap to log again</div>`;
            html += saved.map((f, i) => {
              const tag = f.source === "usda" ? "USDA"
                        : (f.source === "barcode" ? "barcode" : "label scan");
              const per = f.basis === "per_100g" ? "per 100 g/ml"
                        : (f.serving ? safe(f.serving) : "per serving");
              return `
              <div class="food-result saved" data-saved-idx="${i}">
                <div class="fr-name">${safe(f.name)}${f.brand ? `<span class="fr-brand">${safe(f.brand)}</span>` : ""}</div>
                <div class="fr-desc">${Math.round(f.cal || 0)} cal · ${per} · ${tag}</div>
              </div>`;
            }).join("");
          }
          if (results.length) {
            if (saved.length) html += `<div class="fr-section-lbl">USDA database</div>`;
            html += results.map((r) => `
              <div class="food-result" data-id="${safe(r.food_id)}">
                <div class="fr-name">${safe(r.name)}${r.brand ? `<span class="fr-brand">${safe(r.brand)}</span>` : ""}</div>
                ${r.description ? `<div class="fr-desc">${safe(r.description)}</div>` : ""}
              </div>
            `).join("");
          }
          resultsEl.innerHTML = html;
          // Saved item → reopen the normal portion picker with its base values.
          resultsEl.querySelectorAll(".food-result.saved").forEach((row) => {
            row.addEventListener("click", () => {
              const f = saved[parseInt(row.dataset.savedIdx, 10)];
              if (!f) return;
              clearResults();
              showScanPortion({
                name: f.name, brand: f.brand, serving: f.serving, basis: f.basis,
                cal: f.cal, protein_g: f.protein_g, carbs_g: f.carbs_g, fat_g: f.fat_g,
                fiber_g: f.fiber_g, sodium_mg: f.sodium_mg,
                source: f.source, foodId: f.foodId,
              });
            });
          });
          // USDA item → existing lookup → serving picker.
          resultsEl.querySelectorAll(".food-result:not(.saved)").forEach((row) => {
            row.addEventListener("click", () => onPickResult(row.dataset.id));
          });
        }

        async function onPickResult(foodId) {
          setStatus("Loading nutrition…");
          try {
            const food = await foodLookupApi(foodId);
            currentFoodDetail = food;
            openServingPicker(food);
            setStatus("");
          } catch (err) {
            setStatus("Food lookup failed: " + (err.message || err), true);
          }
        }

        // ---- Serving picker: choose which serving + quantity multiplier ----
        function openServingPicker(food) {
          document.getElementById("fspFoodName").textContent = food.name;
          const brandEl = document.getElementById("fspBrand");
          brandEl.textContent = food.brand || "";
          const sel = document.getElementById("fspServing");
          sel.innerHTML = (food.servings || []).map((s, i) =>
            `<option value="${i}">${(s.description || "1 serving").replace(/</g, "&lt;")}</option>`,
          ).join("");
          document.getElementById("fspQty").value = "1";
          updatePreview();
          pickerEl.style.display = "";
          // Hide the results dropdown so the picker is the only thing visible
          clearResults();
        }

        function selectedServing() {
          if (!currentFoodDetail) return null;
          const idx = parseInt(document.getElementById("fspServing").value, 10) || 0;
          return (currentFoodDetail.servings || [])[idx] || null;
        }

        function updatePreview() {
          const s = selectedServing();
          const previewEl = document.getElementById("fspPreview");
          if (!s) { previewEl.textContent = "—"; return; }
          const qty = parseFloat(document.getElementById("fspQty").value) || 0;
          const scale = qty;
          const num = (v, decimals = 0) => {
            if (v == null) return "—";
            const scaled = v * scale;
            return decimals ? scaled.toFixed(decimals) : Math.round(scaled);
          };
          previewEl.innerHTML = `
            <b>${num(s.calories)}</b> cal · ${num(s.protein, 1)}g P · ${num(s.carbs, 1)}g C ·
            ${num(s.fat, 1)}g F · ${num(s.fiber, 1)}g fiber · ${num(s.sodium)}mg Na
          `;
        }

        document.getElementById("fspServing").addEventListener("change", updatePreview);
        document.getElementById("fspQty").addEventListener("input", updatePreview);
        document.getElementById("fspCancel").addEventListener("click", closePicker);

        // ---- Apply: stuff the selected nutrition into the existing form ----
        document.getElementById("fspApply").addEventListener("click", () => {
          const s = selectedServing();
          if (!s || !currentFoodDetail) return;
          const qty = parseFloat(document.getElementById("fspQty").value) || 0;
          if (qty <= 0) return;
          const scale = qty;
          const round0 = (v) => v == null ? "" : String(Math.round(v * scale));
          const round1 = (v) => v == null ? "" : (v * scale).toFixed(1);
          // Build the displayed name: include qty/serving for clarity
          const qtyLabel = (qty === 1) ? "" : `${qty} × `;
          const servingLabel = s.description || "";
          const displayName = `${qtyLabel}${currentFoodDetail.name}${servingLabel ? ` (${servingLabel})` : ""}`;
          document.getElementById("mealName").value = displayName;
          document.getElementById("mealCal").value = round0(s.calories);
          document.getElementById("mealP").value = round1(s.protein);
          document.getElementById("mealC").value = round1(s.carbs);
          document.getElementById("mealF").value = round1(s.fat);
          document.getElementById("mealFi").value = round1(s.fiber);
          document.getElementById("mealNa").value = round0(s.sodium);
          // Stash the FatSecret metadata so the form-submit handler can
          // attach it to the meal row without losing the brand/serving.
          PENDING_FOOD_PICK = {
            foodId: currentFoodDetail.food_id,
            brand: currentFoodDetail.brand || null,
            serving: qtyLabel + servingLabel,
          };
          // Remember this USDA pick as a re-searchable saved food. Store the
          // single-serving base values (basis per_serving) so re-logging via
          // the portion picker's "× Servings" reproduces it cleanly.
          rememberSavedFood({
            name: currentFoodDetail.name,
            brand: currentFoodDetail.brand || null,
            serving: servingLabel || "1 serving",
            basis: "per_serving",
            cal: s.calories, protein_g: s.protein, carbs_g: s.carbs,
            fat_g: s.fat, fiber_g: s.fiber, sodium_mg: s.sodium,
            source: "usda", foodId: currentFoodDetail.food_id,
          });
          // Reset the search UI for the next entry
          closePicker();
          input.value = "";
          clearBtn.style.display = "none";
          clearResults();
          setStatus("");
          // Bring the Add button into view so the user can confirm
          document.getElementById("mealName").focus();
          document.getElementById("mealName").scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }

      // ---------- Weight tracking ----------
      const WEIGHT_KEY = "katie-mile-weight-logs";
      const WEIGHT_START = 147.9; // from your reference panel
      const WEIGHT_GOAL = 135.0;
      const BF_START = 28.7;
      const BF_GOAL = 22.5;

      function loadWeights() {
        try {
          const raw = localStorage.getItem(WEIGHT_KEY);
          return raw ? JSON.parse(raw) : {};
        } catch (e) {
          return {};
        }
      }
      function persistWeights() {
        try {
          localStorage.setItem(WEIGHT_KEY, JSON.stringify(WEIGHTS));
        } catch (e) {}
        if (typeof scheduleSync === "function") scheduleSync();
      }
      let WEIGHTS = loadWeights();
      function setWeight(date, weight, bf) {
        WEIGHTS[date] = {
          date,
          weight: parseFloat(weight),
          bodyFat:
            bf !== null && bf !== undefined && bf !== ""
              ? parseFloat(bf)
              : null,
          loggedAt: new Date().toISOString(),
        };
        persistWeights();
      }
      function deleteWeightEntry(date) {
        delete WEIGHTS[date];
        persistWeights();
        cloudDelete && cloudDelete("weights", date);
      }
      function sortedWeights() {
        return Object.values(WEIGHTS).sort((a, b) =>
          a.date.localeCompare(b.date),
        );
      }
      function latestWeight() {
        const s = sortedWeights();
        return s.length ? s[s.length - 1] : null;
      }

      function renderWeightStats() {
        const el = document.getElementById("weightStats");
        if (!el) return;
        const latest = latestWeight();
        if (!latest) {
          el.innerHTML = `<span class="togo">Goal: ${WEIGHT_GOAL} lb · ${(WEIGHT_START - WEIGHT_GOAL).toFixed(1)} lb to lose · log your first weight to begin</span>`;
          return;
        }
        const delta = latest.weight - WEIGHT_START;
        const togo = latest.weight - WEIGHT_GOAL;
        const sign = delta < 0 ? "↓" : delta > 0 ? "↑" : "";
        const cls = delta < 0 ? "positive" : delta > 0 ? "negative" : "";
        let html = `<span class="current">${latest.weight.toFixed(1)} lb</span>`;
        if (latest.bodyFat)
          html += `<span class="togo">${latest.bodyFat.toFixed(1)}% BF</span> `;
        html += `<span class="delta ${cls}">${sign} ${Math.abs(delta).toFixed(1)} lb from start</span>`;
        if (togo > 0)
          html += `<span class="togo">· ${togo.toFixed(1)} lb to goal</span>`;
        else
          html += `<span class="delta positive" style="margin-left:4px">at/under goal!</span>`;
        el.innerHTML = html;
      }

      function renderWeightChart() {
        const el = document.getElementById("weightChart");
        if (!el) return;
        const weights = sortedWeights();
        const planStart = parseISO(DATA.weeks[0].days[0].date);
        const raceDate = parseISO(DATA.meta.race_date);
        const totalDays = (raceDate - planStart) / 86400000;

        // Y-range: include start, goal, and all logged values + a small pad
        const allW = weights.map((w) => w.weight);
        const yMaxRaw = Math.max(
          WEIGHT_START,
          ...(allW.length ? allW : [WEIGHT_START]),
        );
        const yMinRaw = Math.min(
          WEIGHT_GOAL,
          ...(allW.length ? allW : [WEIGHT_GOAL]),
        );
        const yMax = yMaxRaw + 1.5;
        const yMin = yMinRaw - 1.5;
        const yRange = yMax - yMin;

        const W = 800,
          H = 200;
        const PAD_L = 42,
          PAD_R = 14,
          PAD_T = 14,
          PAD_B = 28;
        const chartW = W - PAD_L - PAD_R;
        const chartH = H - PAD_T - PAD_B;

        const xFor = (dateStr) => {
          const d = parseISO(dateStr);
          const dayIdx = Math.max(
            0,
            Math.min(totalDays, (d - planStart) / 86400000),
          );
          return PAD_L + (dayIdx / totalDays) * chartW;
        };
        const yFor = (w) => PAD_T + ((yMax - w) / yRange) * chartH;

        let svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">`;
        // Y grid + labels
        const ticks = 4;
        for (let i = 0; i <= ticks; i++) {
          const v = yMin + (yRange * i) / ticks;
          const y = yFor(v);
          svg += `<line class="grid" x1="${PAD_L}" y1="${y}" x2="${W - PAD_R}" y2="${y}"/>`;
          svg += `<text class="axis-label" x="${PAD_L - 4}" y="${y + 3}" text-anchor="end">${v.toFixed(0)}</text>`;
        }
        // Goal line
        const yGoal = yFor(WEIGHT_GOAL);
        svg += `<line class="goal-line" x1="${PAD_L}" y1="${yGoal}" x2="${W - PAD_R}" y2="${yGoal}"/>`;
        svg += `<text class="legend-text" x="${W - PAD_R - 2}" y="${yGoal - 4}" text-anchor="end" fill="#4A7C59">goal ${WEIGHT_GOAL}</text>`;
        // Start line
        const yStart = yFor(WEIGHT_START);
        svg += `<line class="start-line" x1="${PAD_L}" y1="${yStart}" x2="${W - PAD_R}" y2="${yStart}"/>`;
        svg += `<text class="legend-text" x="${PAD_L + 4}" y="${yStart - 4}" fill="#94A3B8">start ${WEIGHT_START}</text>`;
        // Trajectory line: ideal slope from start at plan start to goal at race day
        svg += `<line class="trajectory" x1="${xFor(DATA.weeks[0].days[0].date)}" y1="${yStart}" x2="${xFor(DATA.meta.race_date)}" y2="${yGoal}"/>`;
        // Race day vertical
        const xRace = xFor(DATA.meta.race_date);
        svg += `<line class="race-line" x1="${xRace}" y1="${PAD_T}" x2="${xRace}" y2="${H - PAD_B}"/>`;
        svg += `<text class="legend-text" x="${xRace - 4}" y="${PAD_T + 10}" text-anchor="end" fill="#B85450">race</text>`;

        // X-axis: month labels
        const months = [
          { label: "May", d: "2026-05-01" },
          { label: "Jun", d: "2026-06-01" },
          { label: "Jul", d: "2026-07-01" },
          { label: "Aug", d: "2026-08-01" },
          { label: "Sep", d: "2026-09-01" },
        ];
        for (const m of months) {
          const d = parseISO(m.d);
          if (d < planStart || d > raceDate) continue;
          svg += `<text class="axis-label" x="${xFor(m.d)}" y="${H - PAD_B + 15}" text-anchor="middle">${m.label}</text>`;
        }

        // Data line + points
        if (weights.length > 0) {
          if (weights.length > 1) {
            const pts = weights
              .map((w) => `${xFor(w.date)},${yFor(w.weight)}`)
              .join(" ");
            svg += `<polyline class="data-line" points="${pts}" fill="none"/>`;
          }
          for (const w of weights) {
            const cx = xFor(w.date),
              cy = yFor(w.weight);
            svg += `<circle class="data-point" cx="${cx}" cy="${cy}" r="4">
                <title>${fmtDate(w.date, { weekday: "short", month: "short", day: "numeric" })}: ${w.weight} lb${w.bodyFat ? " · " + w.bodyFat + "% BF" : ""}</title>
              </circle>`;
          }
        } else {
          svg += `<text class="empty-msg" x="${W / 2}" y="${H / 2}" text-anchor="middle">No entries yet - log a weight below to start the chart</text>`;
        }
        svg += `</svg>`;
        el.innerHTML = svg;
      }

      function renderWeightHistory() {
        const el = document.getElementById("weightHistory");
        if (!el) return;
        const weights = sortedWeights().slice().reverse();
        if (!weights.length) {
          el.innerHTML = `<div style="color:var(--muted);font-size:13px">No entries yet.</div>`;
          return;
        }
        let html = "";
        for (const w of weights) {
          html += `<div class="weight-entry">
      <div class="date-col">${fmtDate(w.date)}</div>
      <div class="weight-col">${w.weight} lb</div>
      <div class="bf-col">${w.bodyFat ? w.bodyFat + "% BF" : ""}</div>
      <button data-del-date="${w.date}">Delete</button>
    </div>`;
        }
        el.innerHTML = html;
        el.querySelectorAll("[data-del-date]").forEach((b) => {
          b.addEventListener("click", () => {
            if (
              !confirm(`Delete weight entry for ${fmtDate(b.dataset.delDate)}?`)
            )
              return;
            deleteWeightEntry(b.dataset.delDate);
            renderWeightStats();
            renderWeightChart();
            renderWeightHistory();
          });
        });
      }

      // ---------- Daily check-in (Body Battery, RHR, cycle phase, energy) ----------
      // Storage: CHECKINS[date] = { bodyBattery, restingHr, energy, cyclePhase, updatedAt }
      const CHECKIN_KEY = "katie-mile-checkins";
      function loadCheckins() {
        try {
          const raw = localStorage.getItem(CHECKIN_KEY);
          return raw ? JSON.parse(raw) : {};
        } catch (e) { return {}; }
      }
      function persistCheckins() {
        try { localStorage.setItem(CHECKIN_KEY, JSON.stringify(CHECKINS)); } catch (e) {}
        if (typeof scheduleSync === "function") scheduleSync();
      }
      let CHECKINS = loadCheckins();
      function getCheckin(date) { return CHECKINS[date] || null; }
      function setCheckin(date, data) {
        CHECKINS[date] = { ...data, updatedAt: new Date().toISOString() };
        persistCheckins();
      }
      function deleteCheckinFor(date) {
        delete CHECKINS[date];
        persistCheckins();
      }

      // Weigh-ins are a Friday-only ritual: the daily check-in form shows the
      // Weight + Body Fat inputs only on Fridays, and a small note on other
      // days pointing at the most recent / next Friday.
      function isWeighInDay(dateStr) {
        try {
          return new Date(dateStr + "T00:00:00").getDay() === 5;
        } catch (e) { return false; }
      }
      // Days until the next Friday (0 if today IS Friday).
      function daysUntilFriday(dateStr) {
        try {
          const dow = new Date(dateStr + "T00:00:00").getDay();
          return (5 - dow + 7) % 7;
        } catch (e) { return 0; }
      }
      // Find the most recent Friday on or before the given date (used to look
      // up the latest weigh-in for the note shown on non-Friday days).
      function lastFridayOnOrBefore(dateStr) {
        try {
          const d = new Date(dateStr + "T00:00:00");
          const dow = d.getDay();
          const back = (dow - 5 + 7) % 7;
          d.setDate(d.getDate() - back);
          return d.getFullYear() + "-" +
            String(d.getMonth() + 1).padStart(2, "0") + "-" +
            String(d.getDate()).padStart(2, "0");
        } catch (e) { return null; }
      }
      function fmtFriendlyDate(dateStr) {
        try {
          return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "long", month: "long", day: "numeric"
          });
        } catch (e) { return dateStr; }
      }

      // Render the check-in form (populate fields from today's entry if it exists)
      function renderCheckin() {
        const dateEl = document.getElementById("checkinDate");
        if (!dateEl) return;
        const today = todayISO();
        const todayDisplay = fmtFriendlyDate(today);
        dateEl.textContent = todayDisplay;
        const c = getCheckin(today) || {};
        document.getElementById("ciBodyBattery").value = c.bodyBattery ?? "";
        document.getElementById("ciRHR").value = c.restingHr ?? "";
        document.getElementById("ciEnergy").value = c.energy ?? "";
        // Period defaults to "none" every day  — user changes it only on
        // bleeding days. Existing saved values still override the default.
        document.getElementById("ciCycle").value = c.cyclePhase ?? "none";

        // ---- Friday-only weight section ----
        const isFriday = isWeighInDay(today);
        const weightField = document.getElementById("ciWeightField");
        const bfField = document.getElementById("ciBodyFatField");
        const note = document.getElementById("ciWeighInNote");
        const noteText = document.getElementById("ciWeighInNoteText");
        const weightEl = document.getElementById("ciWeight");
        const bfEl = document.getElementById("ciBodyFat");
        if (isFriday) {
          if (weightField) weightField.style.display = "";
          if (bfField) bfField.style.display = "";
          if (note) note.style.display = "none";
          // Pull weight + BF% from the WEIGHTS store (in sync with Trends weight sparkline)
          const todayW = WEIGHTS && WEIGHTS[today];
          if (weightEl) weightEl.value = todayW && todayW.weight != null ? todayW.weight : "";
          if (bfEl) bfEl.value = todayW && todayW.bodyFat != null ? todayW.bodyFat : "";
        } else {
          if (weightField) weightField.style.display = "none";
          if (bfField) bfField.style.display = "none";
          // Show a small note explaining when the next weigh-in is, plus the
          // most recent Friday weight if we have one on file.
          const days = daysUntilFriday(today);
          const lastFri = lastFridayOnOrBefore(today);
          const lastW = lastFri && WEIGHTS ? WEIGHTS[lastFri] : null;
          const lastStr = lastW && lastW.weight != null
            ? ` Last weigh-in: <b>${lastW.weight} lb</b> on ${fmtFriendlyDate(lastFri)}.`
            : "";
          if (noteText) {
            noteText.innerHTML = `Weigh-in is Fridays only — next in <b>${days} day${days === 1 ? "" : "s"}</b>.${lastStr}`;
          }
          if (note) note.style.display = "";
          // Clear the inputs so any stale value doesn't sneak into a save
          if (weightEl) weightEl.value = "";
          if (bfEl) bfEl.value = "";
        }

        // Update Save button text based on whether today is already logged
        const btn = document.getElementById("ciSave");
        if (btn) btn.textContent = (getCheckin(today) || (isFriday && WEIGHTS && WEIGHTS[today])) ? "Update check-in" : "Save check-in";
      }

      function saveCheckin() {
        const today = todayISO();
        const bb = document.getElementById("ciBodyBattery").value;
        const rhr = document.getElementById("ciRHR").value;
        const en = document.getElementById("ciEnergy").value;
        const phase = document.getElementById("ciCycle").value;
        // Weight + body fat are Friday-only — ignore whatever the (hidden)
        // inputs contain on any other day of the week.
        const isFriday = isWeighInDay(today);
        const weight = isFriday ? document.getElementById("ciWeight").value : "";
        const bf = isFriday ? document.getElementById("ciBodyFat").value : "";
        const statusEl = document.getElementById("ciStatus");
        if (!bb && !rhr && !en && !phase && !weight && !bf) {
          statusEl.style.color = "#B85450";
          statusEl.textContent = "Fill in at least one field before saving.";
          setTimeout(() => { if (statusEl) statusEl.textContent = ""; }, 3000);
          return;
        }
        // Save check-in fields (the ones that belong to CHECKINS proper)
        if (bb || rhr || en || phase) {
          setCheckin(today, {
            bodyBattery: bb ? parseInt(bb, 10) : null,
            restingHr: rhr ? parseInt(rhr, 10) : null,
            energy: en ? parseInt(en, 10) : null,
            cyclePhase: phase || null,
          });
        }
        // Save weight + body fat to the WEIGHTS store (same store the Trends
        // weight sparkline reads from — morning weigh-in flows straight there).
        if ((weight || bf) && typeof setWeight === "function") {
          const existing = WEIGHTS && WEIGHTS[today];
          const finalWeight = weight ? parseFloat(weight) : (existing ? existing.weight : null);
          const finalBf = bf ? parseFloat(bf) : (existing ? existing.bodyFat : null);
          // setWeight requires a weight value — only call it if we have one
          if (finalWeight != null && !isNaN(finalWeight)) {
            setWeight(today, finalWeight, finalBf);
          }
        }
        statusEl.style.color = "var(--p1)";
        statusEl.textContent = "Saved!";
        setTimeout(() => { if (statusEl) statusEl.textContent = ""; }, 2000);
        const btn = document.getElementById("ciSave");
        if (btn) btn.textContent = "Update check-in";
        // Refresh Today so the readiness banner reflects the new check-in
        if (typeof renderToday === "function") renderToday();
      }

      function initCheckin() {
        const btn = document.getElementById("ciSave");
        if (btn) btn.addEventListener("click", saveCheckin);
        renderCheckin();
      }

      // ---------- Day-swap (rearrange plan) ----------
      const OVERRIDE_KEY = "katie-mile-day-overrides";
      function loadOverrides() {
        try {
          const raw = localStorage.getItem(OVERRIDE_KEY);
          return raw ? JSON.parse(raw) : {};
        } catch (e) {
          return {};
        }
      }
      function persistOverrides() {
        try {
          localStorage.setItem(OVERRIDE_KEY, JSON.stringify(OVERRIDES));
        } catch (e) {}
        if (typeof scheduleSync === "function") scheduleSync();
      }
      let OVERRIDES = loadOverrides();

      // Snapshot original DATA (so "reset plan" can restore it after we mutate DATA)
      const ORIGINAL_DAYS = {};
      function snapshotOriginalDays() {
        for (const w of DATA.weeks) {
          for (const d of w.days) {
            ORIGINAL_DAYS[d.date] = {
              title: d.title,
              detail: d.detail,
              routines: d.routines ? d.routines.slice() : null,
              strength: d.strength,
            };
          }
        }
      }
      // Add the core routine to Tuesday + Friday of every week (2x/week).
      // These are the lowest-impact days (Tue = rest, Fri = bike-only) so core
      // doesn't compete with the heavy run/lift sessions.
      function injectCoreRoutine() {
        for (const w of DATA.weeks) {
          // Only apply to pre-cutoff weeks (1-7, ending Jun 14). The new
          // half-marathon plan (weeks 8+) specifies every day's routine
          // list explicitly via the markdown source.
          if (w.num > 7) continue;
          for (const d of w.days) {
            if (d.day_name === "Tue" || d.day_name === "Fri") {
              if (!d.routines) d.routines = [];
              if (!d.routines.includes("core")) d.routines.push("core");
            }
          }
        }
      }

      // Add a short plyometric block to quality-run days during phases 1-3.
      // Plyos build tendon stiffness + running economy for the mile, but get
      // skipped during peak mileage and taper where freshness > stimulus.
      // Inserted right after pre_run so warmup → plyos → main set is the order.
      // Limited to pre-cutoff weeks (1-7) — the new half-marathon plan handles
      // its own per-day prescription via the markdown source.
      function injectPlyometrics() {
        for (const w of DATA.weeks) {
          if (w.num > 7) continue;
          if (w.phase < 1 || w.phase > 3) continue;
          for (const d of w.days) {
            if (categorize(d) !== "quality") continue;
            if (!Array.isArray(d.routines)) d.routines = [];
            if (d.routines.includes("plyo")) continue;
            const preRunIdx = d.routines.indexOf("pre_run");
            if (preRunIdx >= 0) d.routines.splice(preRunIdx + 1, 0, "plyo");
            else d.routines.unshift("plyo");
          }
        }
      }

      function applyOverrides() {
        for (const w of DATA.weeks) {
          for (const d of w.days) {
            const ov = OVERRIDES[d.date];
            if (ov) {
              d.title = ov.title;
              d.detail = ov.detail;
              d.routines = ov.routines ? ov.routines.slice() : null;
              d.strength = ov.strength;
            }
          }
        }
      }
      function findDay(date) {
        for (const w of DATA.weeks)
          for (const d of w.days) if (d.date === date) return d;
        return null;
      }
      function isSwapped(date) {
        return !!OVERRIDES[date];
      }

      // Persist a day's CURRENT state as an OVERRIDES row (or clear the
      // override entirely if the day now matches its untouched original
      // plan exactly). Extracted from swapDays so moveSection can reuse it.
      function saveOrClearOverride(date, day) {
        const orig = ORIGINAL_DAYS[date];
        const same =
          orig &&
          orig.title === day.title &&
          orig.detail === day.detail &&
          JSON.stringify(orig.routines) === JSON.stringify(day.routines) &&
          orig.strength === day.strength;
        if (same) delete OVERRIDES[date];
        else
          OVERRIDES[date] = {
            title: day.title,
            detail: day.detail,
            routines: day.routines,
            strength: day.strength,
            updatedAt: new Date().toISOString(),
          };
      }

      function swapDays(dateA, dateB) {
        if (dateA === dateB) return;
        const a = findDay(dateA),
          b = findDay(dateB);
        if (!a || !b) return;
        // Swap workout content (date + day_name stay in place)
        const tmp = {
          title: a.title,
          detail: a.detail,
          routines: a.routines,
          strength: a.strength,
        };
        a.title = b.title;
        a.detail = b.detail;
        a.routines = b.routines;
        a.strength = b.strength;
        b.title = tmp.title;
        b.detail = tmp.detail;
        b.routines = tmp.routines;
        b.strength = tmp.strength;
        saveOrClearOverride(dateA, a);
        saveOrClearOverride(dateB, b);
        persistOverrides();
        // Re-render
        renderWeeks();
        renderToday();
        renderProgress();
        if (typeof renderThisWeek === "function") renderThisWeek();
        // Day content/completion changed — today's Fuel targets may shift too.
        if (typeof renderFuel === "function") renderFuel();
      }

      // Move a SINGLE section from sourceDate to targetDate.
      //   sectionKey: "workout" | "strength" | "routine_<key>"
      // - workout: swaps title/detail between the two days (every day has
      //   SOMETHING scheduled, so this is effectively a swap of just the
      //   cardio block — source becomes whatever target had).
      // - strength: pure transfer. Source's strength is cleared, target's
      //   strength is set to source's value. If target already had a
      //   different strength program scheduled, prompts to confirm
      //   overwriting it.
      // - routine_<key>: pure transfer. Removes the routine from source's
      //   routines list and appends it to target's (if not already there).
      // Also clears any stale completion flag on source for the moved
      // section, since that section no longer lives there.
      function moveSection(sourceDate, targetDate, sectionKey) {
        if (sourceDate === targetDate) return false;
        const src = findDay(sourceDate);
        const tgt = findDay(targetDate);
        if (!src || !tgt) {
          console.warn("[moveSection] findDay miss", { sourceDate, targetDate, srcFound: !!src, tgtFound: !!tgt });
          return false;
        }

        // Capture starting values for the verification step below.
        const before = {
          srcStrength: src.strength,
          tgtStrength: tgt.strength,
          srcRoutines: Array.isArray(src.routines) ? src.routines.slice() : null,
          tgtRoutines: Array.isArray(tgt.routines) ? tgt.routines.slice() : null,
          srcTitle: src.title,
          tgtTitle: tgt.title,
        };

        if (sectionKey === "workout") {
          const tmpTitle = src.title;
          const tmpDetail = src.detail;
          src.title = tgt.title;
          src.detail = tgt.detail;
          tgt.title = tmpTitle;
          tgt.detail = tmpDetail;
        } else if (sectionKey === "strength") {
          if (!src.strength) {
            console.warn("[moveSection] source has no strength to move", { sourceDate });
            return false;
          }
          if (tgt.strength && tgt.strength !== src.strength) {
            const tgtLabel = fmtDate(targetDate, { weekday: "long", month: "short", day: "numeric" });
            const ok = confirm(
              `${tgtLabel} already has a strength workout scheduled.\n\nMove anyway? The strength workout currently on ${tgtLabel} will be replaced.`
            );
            if (!ok) return false;
          }
          tgt.strength = src.strength;
          src.strength = null;
        } else if (sectionKey.startsWith("routine_")) {
          const r = sectionKey.slice("routine_".length);
          if (!Array.isArray(src.routines) || !src.routines.includes(r)) {
            console.warn("[moveSection] routine not present on source", { sourceDate, r });
            return false;
          }
          src.routines = src.routines.filter(x => x !== r);
          if (!Array.isArray(tgt.routines)) tgt.routines = [];
          if (!tgt.routines.includes(r)) tgt.routines.push(r);
        } else {
          console.warn("[moveSection] unknown sectionKey", sectionKey);
          return false;
        }

        saveOrClearOverride(sourceDate, src);
        saveOrClearOverride(targetDate, tgt);
        persistOverrides();
        // Defensive: re-apply the overrides we just persisted so the in-
        // memory DATA.weeks is guaranteed to match what we just saved.
        // (If anything downstream — a render hook, a parallel sync —
        // somehow mutates a day reference, applyOverrides() makes the
        // change durable.)
        applyOverrides();

        // Verify the move actually landed on both sides. If a downstream
        // mutation reverted the change we want to know about it
        // immediately rather than silently letting the UI lie.
        const tgtAfter = findDay(targetDate);
        const srcAfter = findDay(sourceDate);
        if (sectionKey === "strength") {
          if (!tgtAfter || !tgtAfter.strength) {
            console.error("[moveSection] target did not retain strength after save", {
              sourceDate, targetDate, before, tgtAfterStrength: tgtAfter && tgtAfter.strength,
              overrideTgt: OVERRIDES[targetDate],
            });
          }
          if (srcAfter && srcAfter.strength) {
            console.error("[moveSection] source still has strength after clear", {
              sourceDate, srcAfterStrength: srcAfter.strength,
              overrideSrc: OVERRIDES[sourceDate],
            });
          }
        }
        console.log("[moveSection] ok", {
          sourceDate, targetDate, sectionKey,
          srcStrengthAfter: srcAfter && srcAfter.strength,
          tgtStrengthAfter: tgtAfter && tgtAfter.strength,
        });

        // Clear any completion flag for the moved section on the source
        // (the section is gone from there, so a leftover checkmark would
        // be misleading). Do NOT carry the checkmark to the target — the
        // user is moving an UNFINISHED section by definition, and the
        // target's completion will be set when they actually finish it.
        const srcState = COMPLETED[sourceDate];
        if (srcState && typeof srcState === "object" && srcState[sectionKey]) {
          delete srcState[sectionKey];
          if (Object.keys(srcState).length === 0) delete COMPLETED[sourceDate];
          saveCompleted(COMPLETED);
        }

        // Re-render everything that displays per-day content.
        renderWeeks();
        renderToday();
        renderProgress();
        if (typeof renderThisWeek === "function") renderThisWeek();
        // Day content/completion changed — today's Fuel targets may shift too.
        if (typeof renderFuel === "function") renderFuel();
        return true;
      }

      // Open the date-picker modal so the user can choose where to move a
      // section. sectionKey is "workout" | "strength" | "routine_<key>".
      // We surface ±14 days around the source (clamped to the plan range)
      // and exclude the source date itself.
      // launchedFrom (optional): "tracker" | "log" — tells the picker which
      // sub-modal to close on a successful move (in addition to the parent
      // day-detail modal).
      function openMoveSectionPicker(sourceDate, sectionKey, launchedFrom) {
        const src = findDay(sourceDate);
        if (!src) return;
        const sectionLabel =
          sectionKey === "workout" ? "this workout"
          : sectionKey === "strength" ? "this strength workout"
          : sectionKey.startsWith("routine_") ? `the "${(ROUTINE_LABELS[sectionKey.slice(8)] || sectionKey.slice(8))}" routine`
          : "this section";

        // Build a flat list of plan days, sorted by date. We'll show a
        // window of ±14 around the source.
        const allDays = [];
        for (const w of DATA.weeks) for (const d of w.days) allDays.push(d);
        allDays.sort((a, b) => a.date.localeCompare(b.date));
        const srcIdx = allDays.findIndex(d => d.date === sourceDate);
        const lo = Math.max(0, srcIdx - 14);
        const hi = Math.min(allDays.length, srcIdx + 15);
        const candidates = allDays.slice(lo, hi).filter(d => d.date !== sourceDate);

        const todayStr = todayISO();
        const srcLabel = fmtDate(sourceDate, { weekday: "long", month: "short", day: "numeric" });

        let body = `<button class="close" onclick="closeMoveSectionPicker()" style="position:absolute;top:14px;right:14px;background:none;border:0;font-size:24px;cursor:pointer;color:var(--muted);line-height:1">×</button>`;
        body += `<h2>Move to another day</h2>`;
        body += `<div class="ex-meta">Moving ${sectionLabel} from <b>${srcLabel}</b></div>`;
        body += `<div class="ex-desc" style="margin-bottom:8px">Tap a day below to move ${sectionLabel} there. The section will be removed from ${srcLabel} and added to the day you pick.</div>`;
        body += `<div class="move-target-list" id="moveTargetList">`;
        if (!candidates.length) {
          body += `<div class="ex-meta">No other days in range.</div>`;
        } else {
          for (const d of candidates) {
            const dateLbl = fmtDate(d.date, { weekday: "short", month: "short", day: "numeric" });
            const isToday = d.date === todayStr;
            const badge = isToday ? `<span class="mt-badge">Today</span>` : "";
            const titleSafe = (d.title || "").replace(/</g, "&lt;");
            body += `<button type="button" class="move-target-row${isToday ? " is-today" : ""}" data-target-date="${d.date}">
              <span class="mt-date">${dateLbl}</span>
              <span class="mt-title">${titleSafe}</span>
              ${badge}
            </button>`;
          }
        }
        body += `</div>`;

        const root = document.getElementById("moveSectionModal");
        root.innerHTML = body;
        root.style.position = "relative";
        document.getElementById("moveSectionModalBg").classList.add("show");

        // Wire each candidate row.
        root.querySelectorAll(".move-target-row").forEach((row) => {
          row.addEventListener("click", () => {
            const targetDate = row.dataset.targetDate;
            const ok = moveSection(sourceDate, targetDate, sectionKey);
            if (!ok) return; // user cancelled overwrite prompt or no-op
            closeMoveSectionPicker();
            // Close any sub-modal we were launched from — the section it
            // was tracking no longer lives on this day.
            if (launchedFrom === "tracker" && typeof closeExerciseTracker === "function") {
              closeExerciseTracker();
            } else if (launchedFrom === "log" && typeof closeWorkoutLogModal === "function") {
              closeWorkoutLogModal();
            }
            // Also close the parent day-detail modal — the source day's
            // section list has changed underneath us and showing the
            // stale modal would be confusing. User can re-open if needed.
            if (typeof closeModal === "function") closeModal();
            const tgtLbl = fmtDate(targetDate, { weekday: "long", month: "short", day: "numeric" });
            // Friendly section name in the confirmation so the user knows
            // exactly what landed where (and is more likely to spot it on
            // the destination day card after they dismiss this alert).
            const moveLbl =
              sectionKey === "workout" ? "workout"
              : sectionKey === "strength" ? "strength workout"
              : sectionKey.startsWith("routine_") ? `${ROUTINE_LABELS[sectionKey.slice(8)] || sectionKey.slice(8)} routine`
              : "section";
            showToast(`Moved ${moveLbl} to ${tgtLbl} — open that day to see it.`);
          });
        });
      }

      function closeMoveSectionPicker() {
        const bg = document.getElementById("moveSectionModalBg");
        if (bg) bg.classList.remove("show");
      }

      // Close picker on backdrop click or Escape.
      (function wireMoveSectionPickerDismissals() {
        const bg = document.getElementById("moveSectionModalBg");
        if (bg) {
          bg.addEventListener("click", (e) => {
            if (e.target === bg) closeMoveSectionPicker();
          });
        }
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            const bg2 = document.getElementById("moveSectionModalBg");
            if (bg2 && bg2.classList.contains("show")) closeMoveSectionPicker();
          }
        });
      })();
      function resetPlan() {
        if (
          !confirm(
            "Restore the original training plan? All your workout swaps will be undone. (Completion checkmarks and logs are kept.)",
          )
        )
          return;
        // Cloud cleanup: drop all overrides for this user
        if (isSignedIn && isSignedIn() && supaClient) {
          supaClient
            .from("day_overrides")
            .delete()
            .eq("user_id", supaUser.id)
            .then(() => {});
        }
        OVERRIDES = {};
        persistOverrides();
        // Restore DATA from snapshot
        for (const w of DATA.weeks) {
          for (const d of w.days) {
            const orig = ORIGINAL_DAYS[d.date];
            if (orig) {
              d.title = orig.title;
              d.detail = orig.detail;
              d.routines = orig.routines ? orig.routines.slice() : null;
              d.strength = orig.strength;
            }
          }
        }
        renderWeeks();
        renderToday();
        renderProgress();
        if (typeof renderThisWeek === "function") renderThisWeek();
        // Day content/completion changed — today's Fuel targets may shift too.
        if (typeof renderFuel === "function") renderFuel();
      }

      // Tap-based swap (works on touch screens)
      let SWAP_ARMED = null; // { date, element }
      function armOrPerformSwap(date, dEl) {
        // Same card tapped twice → cancel
        if (SWAP_ARMED && SWAP_ARMED.date === date) {
          SWAP_ARMED.element.classList.remove("swap-armed");
          SWAP_ARMED = null;
          return;
        }
        // Second card tapped → swap
        if (SWAP_ARMED) {
          const fromDate = SWAP_ARMED.date;
          SWAP_ARMED.element.classList.remove("swap-armed");
          SWAP_ARMED = null;
          swapDays(fromDate, date);
          return;
        }
        // Arm this card
        SWAP_ARMED = { date, element: dEl };
        dEl.classList.add("swap-armed");
      }
      function clearSwapArmed() {
        if (SWAP_ARMED) {
          SWAP_ARMED.element.classList.remove("swap-armed");
          SWAP_ARMED = null;
        }
      }

      function initWeightForm() {
        const form = document.getElementById("weightForm");
        if (!form) return;
        const dateEl = document.getElementById("weightDate");
        dateEl.value = new Date().toISOString().slice(0, 10);
        // Pre-fill body fat with last entry's value if user has logged before
        const last = latestWeight();
        if (last && last.bodyFat)
          document.getElementById("bfPct").placeholder = String(last.bodyFat);

        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const date = dateEl.value;
          const weight = document.getElementById("weightVal").value;
          const bf = document.getElementById("bfPct").value;
          if (!date || !weight) return;
          setWeight(date, weight, bf);
          document.getElementById("weightVal").value = "";
          document.getElementById("bfPct").value = "";
          const status = document.getElementById("weightStatus");
          status.textContent = "Logged!";
          setTimeout(() => {
            if (status) status.textContent = "";
          }, 2000);
          renderWeightStats();
          renderWeightChart();
          renderWeightHistory();
        });

        document
          .getElementById("weightHistoryToggle")
          .addEventListener("click", () => {
            const h = document.getElementById("weightHistory");
            const isOpen = h.style.display !== "none";
            h.style.display = isOpen ? "none" : "block";
            document.getElementById("weightHistoryToggle").textContent = isOpen
              ? "View history"
              : "Hide history";
            if (!isOpen) renderWeightHistory();
          });
      }
      function renderProgress() {
        const total = totalDays();
        const done = totalDone();
        const pct = total ? Math.round((done / total) * 100) : 0;
        const fill = document.getElementById("progressFill");
        const ddone = document.getElementById("progressDone");
        const dtot = document.getElementById("progressTotal");
        if (fill) fill.style.width = pct + "%";
        if (ddone) ddone.textContent = done;
        if (dtot) dtot.textContent = total;
      }

      // ---------- Categorize a day ----------
      function categorize(day) {
        const t = (day.title + " " + day.detail).toUpperCase();
        if (t.includes("RACE DAY") || t.includes("1-MILE RACE") || day.title.includes("🏁")) return "race";
        if (day.title.toUpperCase().startsWith("REST")) return "rest";
        // Strength-only / cross-training days (no run) read as rest-from-running
        // so they don't mislabel as "Easy Run"; the strength + mobility blocks
        // still render in their own sections.
        if (/^(STRENGTH|BLOCK [AB]|YOGA)/i.test(day.title)) return "rest";
        if (
          /TRACK:|FARTLEK|TEMPO|HILL STRIDE|VO2|TT |TIME TRIAL|MILE-PACE|RACE-PACE|TUNE-UP|SPEED:|INTERVAL|SHARPENER/i.test(
            t,
          )
        )
          return "quality";
        if (
          /LONG RUN|LONG W/.test(t) ||
          day.title.toUpperCase().includes("LONG")
        )
          return "long";
        if (/BIKE|PELOTON/.test(t) && !/RUN/.test(t)) return "bike";
        return "easy";
      }
      function dayIcon(day) {
        const cat = categorize(day);
        if (cat === "race") return "RACE";
        if (cat === "rest") return "REST";
        if (cat === "quality") return "QUALITY";
        if (cat === "long") return "LONG";
        if (cat === "bike") return "BIKE";
        return "EASY";
      }
      function dayHasStrength(day) {
        return !!day.strength;
      }

      // ---------- Display label + specs for the workout pill ----------
      // The pill shows two lines under the date:
      //   1) labelForDay()   — short type tag: "Easy Run", "Quality Run",
      //      "Long Run", "Easy Bike", "Quality Bike", "Rest Day", "Race Day"
      //      (with " + Strength" appended when the day has strength work)
      //   2) specsForDay()   — the actual workout content (distance for runs,
      //      duration for bikes, interval prescription for quality days).
      function labelForDay(day) {
        const cat = categorize(day);
        let base;
        if (cat === "race") base = "Race Day";
        else if (cat === "rest") base = "Rest Day";
        else if (cat === "quality") base = "Quality Run";
        else if (cat === "long") base = "Long Run";
        else if (cat === "bike") {
          // Heuristic: "quality bike" if the detail mentions intervals,
          // thresholds, or HIIT. Otherwise it's an easy Z2 spin.
          const txt = ((day.title || "") + " " + (day.detail || "")).toUpperCase();
          base = /SPRINT|INTERVAL|THRESHOLD|VO2|HIIT|FTP|TABATA|HARD\b/.test(txt)
            ? "Quality Bike"
            : "Easy Bike";
        } else {
          base = "Easy Run";
        }
        // Append strength when the day has a strength block scheduled
        if (day.strength) base = `${base} + Strength`;
        return base;
      }
      function specsForDay(day) {
        const detail = (day.detail || "").trim();
        if (!detail) return "";
        const cat = categorize(day);
        if (cat === "rest") return "Recovery";
        if (cat === "race") return detail;
        // Quality: prefer the "MAIN:" segment of the prescription; fall back
        // to the first meaningful phrase. Track + interval workouts use
        // "WU/CD" framing around a MAIN section that holds the real work.
        if (cat === "quality") {
          const mainMatch = detail.match(/MAIN:\s*([^.]+)/i);
          if (mainMatch) {
            return mainMatch[1].split(/[,;]/)[0].trim().replace(/\.$/, "");
          }
          // No MAIN marker (e.g. tempo runs like "5 mi: 1 mi WU; 3 mi @ HM pace; 1 mi CD"):
          // strip the leading total + WU/CD bookends to highlight the meat.
          const cleaned = detail
            .replace(/^\d+(?:\.\d+)?\s*mi[:.\s]*/i, "")
            .replace(/\d+(?:\.\d+)?\s*mi\s*WU[;,.\s]*/gi, "")
            .replace(/\d+(?:\.\d+)?\s*mi\s*CD\.?\s*$/gi, "")
            .trim();
          return cleaned.split(/[,;]/)[0].trim().replace(/\.$/, "") || detail;
        }
        // Easy / long runs: pull the headline distance.
        if (cat === "easy" || cat === "long") {
          const miMatch = detail.match(/(\d+(?:\.\d+)?)\s*mi(?:le)?s?\b/i);
          if (miMatch) {
            const n = miMatch[1];
            return `${n} ${n === "1" ? "mile" : "miles"}`;
          }
          return detail;
        }
        // Bike days: extract minutes and a flavor word (Z2 / easy).
        if (cat === "bike") {
          const minMatch = detail.match(/(\d+)\s*min\b/i);
          if (minMatch) {
            const m = minMatch[1];
            const flavor = /\bZ2\b/i.test(detail)
              ? "Z2"
              : /easy/i.test(detail)
                ? "easy spin"
                : "";
            return flavor ? `${m} min ${flavor}` : `${m} min`;
          }
          return detail;
        }
        return detail;
      }

      // ---------- Hero countdown ----------
      function renderCountdown() {
        const race = parseISO(DATA.meta.race_date);
        const now = new Date();
        const days = Math.max(0, Math.ceil((race - now) / 86400000));
        const todayD = todayClampedISO();
        let weekIdx = 0,
          dayIdx = 0;
        for (let i = 0; i < DATA.weeks.length; i++) {
          const w = DATA.weeks[i];
          if (todayD >= w.start_date && todayD <= w.end_date) {
            weekIdx = i;
            for (let d = 0; d < w.days.length; d++)
              if (w.days[d].date === todayD) {
                dayIdx = d;
                break;
              }
            break;
          }
        }
        const cd = document.getElementById("countdown");
        cd.innerHTML = `
    <div class="cd-box"><div class="v">${days}</div><div class="l">days to race</div></div>
    <div class="cd-box"><div class="v">W${weekIdx + 1}</div><div class="l">current week</div></div>
    <div class="cd-box"><div class="v">${DATA.weeks[weekIdx].mileage}</div><div class="l">miles this week</div></div>
    <div class="cd-box"><div class="v">P${DATA.weeks[weekIdx].phase}</div><div class="l">phase</div></div>
  `;
      }

      // ---------- Phase bar ----------
      function renderPhaseBar() {
        const todayD = todayClampedISO();
        const bar = document.getElementById("phaseBar");
        bar.innerHTML = "";
        for (const ph of DATA.phases) {
          const seg = document.createElement("div");
          seg.className = "phase-seg";
          seg.style.background = ph.color;
          seg.textContent = `P${ph.num}: ${ph.name}`;
          seg.title = ph.goal;
          // determine span — first/last week of phase
          const phaseWeeks = DATA.weeks.filter((w) => w.phase === ph.num);
          const first = phaseWeeks[0],
            last = phaseWeeks[phaseWeeks.length - 1];
          seg.style.flex = phaseWeeks.length;
          if (todayD >= first.start_date && todayD <= last.end_date)
            seg.classList.add("active");
          seg.addEventListener("click", () => {
            const target = document.getElementById(`week-${first.num}`);
            if (target) {
              target.scrollIntoView({ behavior: "smooth", block: "start" });
              target.querySelector(".week-head").click();
            }
          });
          bar.appendChild(seg);
        }
      }

      // ---------- Today card ----------
      function renderToday() {
        const todayD = todayClampedISO();
        const beforeStart = todayISO() < DATA.weeks[0].days[0].date;
        const afterRace = todayISO() > DATA.meta.race_date;
        let day = null,
          week = null;
        for (const w of DATA.weeks) {
          for (const d of w.days) {
            if (d.date === todayD) {
              day = d;
              week = w;
              break;
            }
          }
          if (day) break;
        }
        if (!day) return;
        const ph = DATA.phases[week.phase - 1];
        document.getElementById("todayLabel").textContent = beforeStart
          ? "PLAN STARTS"
          : afterRace
            ? "POST-RACE"
            : "TODAY";
        document.getElementById("todayDate").textContent =
          `${fmtDate(day.date, { weekday: "long", month: "long", day: "numeric" })} · Week ${week.num} · Phase ${ph.num}`;
        // Title shows the new category label ("Easy Run + Strength", "Quality Run", etc.)
        // Detail stays as the full workout description from the plan.
        document.getElementById("todayTitle").textContent = labelForDay(day);
        document.getElementById("todayDetail").textContent = day.detail;
        const badges = document.getElementById("todayBadges");
        badges.innerHTML = "";
        badges.innerHTML += `<span class="phase-pill pp${week.phase}">${ph.name}</span>`;
        // Category + strength are now part of todayTitle, so we don't add
        // separate badges for them anymore.

        // Today completion checkbox
        const todayCard = document.getElementById("todayCard");
        const existingRow = document.getElementById("todayCheckRow");
        if (existingRow) existingRow.remove();
        const row = document.createElement("label");
        row.id = "todayCheckRow";
        row.className = "today-check-row";
        const isComplete = isDone(day);
        const counts = sectionCounts(day);
        if (isComplete) todayCard.classList.add("completed");
        else todayCard.classList.remove("completed");
        const lblText = isComplete
          ? "Workout complete - nice work!"
          : counts.done > 0
            ? `In progress: ${counts.done}/${counts.total} sections done - tap to mark all complete`
            : "Mark today's workout complete";
        row.innerHTML = `<input type="checkbox" class="task-check" ${isComplete ? "checked" : ""}>
                   <span class="lbl">${lblText}</span>`;
        row.querySelector("input").addEventListener("change", (e) => {
          setDayDone(day, e.target.checked);
          renderToday();
          // Sync every matching day card in both Home + Plan views
          document.querySelectorAll(`.day[data-date="${day.date}"]`).forEach((el) => {
            el.classList.toggle("completed", e.target.checked);
            const cb = el.querySelector(".task-check");
            if (cb) cb.checked = e.target.checked;
          });
        });
        // Stop the checkbox row from bubbling clicks up to the card
        row.addEventListener("click", (e) => e.stopPropagation());
        todayCard.appendChild(row);

        // Open the full day modal when the Today card is tapped
        // (Assigning onclick replaces any previous handler — safe to re-render.)
        todayCard.onclick = (e) => {
          if (e.target.closest("#todayCheckRow")) return;
          openModal(day, week);
        };

        // Brand-v2 quick-stat tiles (only render if the tab has the
        // brand-v2 class — i.e. once we roll out further this will be a
        // no-op on any tab that hasn't been migrated).
        renderBrandV2Stats();

        // Performance features: pace target chip, readiness banner, recap
        renderTodayPaceHint(day);
        renderReadiness(day);
        renderRecapToday();
      }

      // Populate the three quick-stat tiles in the brand-v2 Today header.
      // Each tile shows: current value, formatted, with a progress ring
      // representing today's value vs. a sensible target.
      function renderBrandV2Stats() {
        const today = todayISO();
        const log = (typeof getLog === "function") ? (getLog(today) || {}) : {};

        // --- Distance --------------------------------------------------
        // Target: today's planned distance if we can pluck it from the
        // workout title (e.g. "5 mi"), else fall back to a 6mi default.
        const distMi = Number(log.distance) || 0;
        let plannedDist = 0;
        try {
          let day = null;
          for (const w of DATA.weeks) for (const d of w.days) if (d.date === today) { day = d; break; }
          if (day) {
            const m = (day.detail || day.title || "").match(/(\d+(?:\.\d+)?)\s*mi/i);
            if (m) plannedDist = parseFloat(m[1]);
          }
        } catch (e) {}
        const distTarget = plannedDist > 0 ? plannedDist : 6;
        setStatTile("v2StatDistance",
          distMi > 0 ? `${distMi.toFixed(distMi >= 10 ? 0 : 1)} mi` : "0 mi",
          distMi / distTarget);

        // --- Calories --------------------------------------------------
        let calIn = 0;
        let calTarget = 2000;
        try {
          if (typeof todaysMeals === "function" && typeof sumMacros === "function") {
            calIn = Math.round(sumMacros(todaysMeals()).cal || 0);
          }
          if (typeof buildTodayTarget === "function") {
            const t = buildTodayTarget();
            if (t && t.targetCal) calTarget = t.targetCal;
          }
        } catch (e) {}
        setStatTile("v2StatCalories",
          calIn > 0 ? calIn.toLocaleString() : "0",
          calIn / calTarget);

        // --- Activity duration ----------------------------------------
        const sec = Number(log.durationSec) || 0;
        const min = Math.round(sec / 60);
        let durStr;
        if (min === 0) durStr = "0m";
        else if (min < 60) durStr = `${min}m`;
        else durStr = `${Math.floor(min / 60)}h ${min % 60}m`;
        // 60 min is a reasonable "full day" target for the ring.
        setStatTile("v2StatDuration", durStr, min / 60);
      }

      // Helper — set the number text + drive the progress ring for one
      // stat tile. pct is 0..1+ ; we clamp the ring's visible fill at 1.0.
      function setStatTile(tileId, valueText, pct) {
        const tile = document.getElementById(tileId);
        if (!tile) return;
        const num = tile.querySelector(".v2-stat-num");
        if (num) num.textContent = valueText;
        const ring = tile.querySelector(".ring-fill");
        if (ring) {
          // Circumference for r=19 → 2 * Math.PI * 19 ≈ 119.38.
          const C = 119.38;
          const clamped = Math.max(0, Math.min(1, pct || 0));
          ring.style.strokeDashoffset = String(C * (1 - clamped));
          ring.dataset.pct = String(Math.round(clamped * 100));
        }
      }

      // ---------- Mileage chart ----------
      // Convert "#RRGGBB" to "rgba(r,g,b,a)" — used to make planned-bar background translucent
      function rgbaFromHex(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
      }
      function phaseColorFor(week) {
        return DATA.phases[week.phase - 1].color;
      }
      function renderMilesChart() {
        const max = Math.max(...DATA.weeks.map((w) => w.mileage));
        const chart = document.getElementById("milesChart");
        const axis = document.getElementById("milesAxis");
        chart.innerHTML = "";
        axis.innerHTML = "";
        for (const w of DATA.weeks) {
          const phaseColor = phaseColorFor(w);
          const actual = actualWeekMiles(w);
          const planned = w.mileage;
          const fillPct = planned > 0 ? Math.min(100, (actual / planned) * 100) : 0;

          const bar = document.createElement("div");
          bar.className = "bar" + (w.num === 21 ? " race" : "");
          bar.dataset.weekNum = w.num;
          bar.style.height = `${(planned / max) * 100}%`;
          // Planned bar is translucent; actual fill is solid
          bar.style.background = rgbaFromHex(phaseColor, 0.25);
          bar.title = `Week ${w.num}: ${actual.toFixed(1)} / ${planned} mi · ${w.theme}`;

          if (fillPct > 0) {
            const fill = document.createElement("div");
            fill.className = "bar-fill";
            fill.style.background = phaseColor;
            fill.style.height = `${fillPct}%`;
            bar.appendChild(fill);
          }

          const lbl = document.createElement("div");
          lbl.className = "lbl";
          lbl.textContent = planned;
          bar.appendChild(lbl);

          bar.addEventListener("click", () => {
            const target = document.getElementById(`week-${w.num}`);
            if (target) {
              target.scrollIntoView({ behavior: "smooth", block: "start" });
              if (!target.classList.contains("open"))
                target.querySelector(".week-head").click();
            }
          });
          chart.appendChild(bar);
          const a = document.createElement("div");
          a.textContent = w.num;
          axis.appendChild(a);
        }
      }

      // ---------- Weeks ----------
      // Sum logged distance for run-type days in a week (skip bike + rest)
      function actualWeekMiles(week) {
        let total = 0;
        for (const d of week.days) {
          const log = LOGS[d.date];
          if (!log || !log.distance) continue;
          const cat = categorize(d);
          if (cat === "bike" || cat === "rest") continue;
          total += parseFloat(log.distance) || 0;
        }
        return total;
      }
      // Build the inner HTML for the .week-stat block — actual / planned + label
      function weekStatHtml(week) {
        const actual = actualWeekMiles(week);
        const planned = week.mileage;
        const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
        let cls = "actual";
        if (actual === 0) cls += " under";
        else if (actual > planned * 1.05) cls += " over";
        return `<div class="miles">
          <span class="${cls}">${fmt(actual)}</span><span class="sep">/</span><span class="planned">${planned}</span>
        </div>
        <div class="lbl">miles</div>`;
      }
      // Update just the week-stat block for a single week without re-rendering all weeks
      function refreshWeekStat(week) {
        const el = document.querySelector(`.week-stat[data-week-num="${week.num}"]`);
        if (el) el.innerHTML = weekStatHtml(week);
      }
      // Find the week that contains a given date (used after a log changes)
      function weekForDate(date) {
        for (const w of DATA.weeks) {
          if (date >= w.start_date && date <= w.end_date) return w;
        }
        return null;
      }
      function refreshAllWeekStats() {
        for (const w of DATA.weeks) refreshWeekStat(w);
      }
      // Refresh just one bar in the mileage chart without re-rendering the whole chart
      function refreshBarFill(week) {
        const bar = document.querySelector(`.bar[data-week-num="${week.num}"]`);
        if (!bar) return;
        const planned = week.mileage;
        const actual = actualWeekMiles(week);
        const fillPct = planned > 0 ? Math.min(100, (actual / planned) * 100) : 0;
        bar.title = `Week ${week.num}: ${actual.toFixed(1)} / ${planned} mi · ${week.theme}`;
        let fill = bar.querySelector(".bar-fill");
        if (fillPct === 0) {
          if (fill) fill.remove();
          return;
        }
        if (!fill) {
          fill = document.createElement("div");
          fill.className = "bar-fill";
          fill.style.background = phaseColorFor(week);
          // Insert before the label so the label stays on top
          bar.insertBefore(fill, bar.firstChild);
        }
        fill.style.height = `${fillPct}%`;
      }

      function renderWeeks() {
        const todayD = todayClampedISO();
        const root = document.getElementById("weeks");
        root.innerHTML = "";
        for (const w of DATA.weeks) {
          const ph = DATA.phases[w.phase - 1];
          const wEl = document.createElement("div");
          wEl.id = `week-${w.num}`;
          wEl.className = `week p${w.phase}`;
          if (todayD >= w.start_date && todayD <= w.end_date)
            wEl.classList.add("open");

          const head = document.createElement("div");
          head.className = "week-head";
          head.innerHTML = `
      <div class="week-num">W${w.num}</div>
      <div class="week-meta">
        <div class="top">${fmtDate(w.start_date)} - ${fmtDate(w.end_date)}</div>
        <div class="bot">${w.theme}</div>
      </div>
      <div class="week-stat" data-week-num="${w.num}">${weekStatHtml(w)}</div>
      <div class="chev">▼</div>
    `;
          head.addEventListener("click", () => wEl.classList.toggle("open"));
          wEl.appendChild(head);

          const days = document.createElement("div");
          days.className = "days";
          days.style.display = wEl.classList.contains("open") ? "grid" : "none";
          // wire toggle to display (so transitions can occur)
          head.addEventListener("click", () => {
            days.style.display = wEl.classList.contains("open")
              ? "grid"
              : "none";
          });
          for (const d of w.days) {
            const dEl = createDayCard(d, w, { swappable: true });
            days.appendChild(dEl);
          }
          wEl.appendChild(days);
          root.appendChild(wEl);
        }
      }

      // Shared day-card builder. Used by renderWeeks (Plan tab) and renderThisWeek (Home tab).
      // opts.swappable: include drag-and-drop + swap-handle (only on Plan tab).
      function createDayCard(d, w, opts = {}) {
        const swappable = !!opts.swappable;
        const cat = categorize(d);
        const dEl = document.createElement("div");
        dEl.className = `day cat-${cat}`;
        if (d.date === todayISO()) dEl.classList.add("today");
        if (cat === "race") dEl.classList.add("race");
        if (isDone(d)) dEl.classList.add("completed");
        if (isSwapped(d.date)) dEl.classList.add("swapped");
        dEl.dataset.cat = cat;
        dEl.dataset.strength = dayHasStrength(d) ? "1" : "0";
        dEl.dataset.date = d.date;
        if (swappable) dEl.setAttribute("draggable", "true");
        dEl.innerHTML = `
        <div class="day-top">
          <div class="date-block">
            <div class="dn">${d.day_name}</div>
            <div class="dd">${fmtDate(d.date, { month: "short", day: "numeric" })}</div>
          </div>
          ${swappable ? '<span class="swap-handle" title="Drag to another day to swap, or tap two days to swap">⋮⋮</span>' : ""}
          <input type="checkbox" class="task-check" title="Mark all sections complete" ${isDone(d) ? "checked" : ""}>
        </div>
        <div class="dt">${labelForDay(d)}</div>
        <div class="day-specs">${specsForDay(d)}</div>
      `;
        // Checkbox: don't open modal when interacted with; sync state across both views
        const cb = dEl.querySelector(".task-check");
        cb.addEventListener("click", (e) => { e.stopPropagation(); });
        cb.addEventListener("change", (e) => {
          e.stopPropagation();
          setDayDone(d, e.target.checked);
          // Update every day card with this date (both Plan and Home tabs)
          document.querySelectorAll(`.day[data-date="${d.date}"]`).forEach((el) => {
            el.classList.toggle("completed", e.target.checked);
            const elCb = el.querySelector(".task-check");
            if (elCb && elCb !== cb) elCb.checked = e.target.checked;
          });
          if (d.date === todayClampedISO()) renderToday();
        });
        cb.setAttribute("draggable", "false");

        if (swappable) {
          // Tap-to-swap: swap handle click
          const handle = dEl.querySelector(".swap-handle");
          if (handle) handle.addEventListener("click", (e) => {
            e.stopPropagation();
            armOrPerformSwap(d.date, dEl);
          });
          // HTML5 drag-and-drop for desktop
          dEl.addEventListener("dragstart", (e) => {
            if (e.target.classList.contains("task-check")) {
              e.preventDefault();
              return;
            }
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", d.date);
            dEl.classList.add("dragging");
          });
          dEl.addEventListener("dragend", () => {
            dEl.classList.remove("dragging");
            document
              .querySelectorAll(".day.drag-over")
              .forEach((el) => el.classList.remove("drag-over"));
          });
          dEl.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            if (!dEl.classList.contains("dragging"))
              dEl.classList.add("drag-over");
          });
          dEl.addEventListener("dragleave", () => {
            dEl.classList.remove("drag-over");
          });
          dEl.addEventListener("drop", (e) => {
            e.preventDefault();
            e.stopPropagation();
            dEl.classList.remove("drag-over");
            const sourceDate = e.dataTransfer.getData("text/plain");
            if (sourceDate && sourceDate !== d.date)
              swapDays(sourceDate, d.date);
          });
        }

        dEl.addEventListener("click", (e) => {
          e.stopPropagation();
          openModal(d, w);
        });
        const existingLog = getLog(d.date);
        if (existingLog) updateDayCardLog(dEl, existingLog);
        return dEl;
      }

      // Render the current week's day grid on the Home tab.
      function renderThisWeek() {
        const container = document.getElementById("thisWeekDays");
        const statEl = document.getElementById("thisWeekStat");
        if (!container) return;
        const todayD = todayClampedISO();
        let currentWeek = null;
        for (const w of DATA.weeks) {
          if (todayD >= w.start_date && todayD <= w.end_date) {
            currentWeek = w;
            break;
          }
        }
        if (!currentWeek) currentWeek = DATA.weeks[0];
        container.innerHTML = "";
        for (const d of currentWeek.days) {
          // No swap handles on Home — keep this view focused
          container.appendChild(createDayCard(d, currentWeek, { swappable: false }));
        }
        if (statEl) {
          const actual = actualWeekMiles(currentWeek);
          const planned = currentWeek.mileage;
          const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
          statEl.innerHTML = `Week ${currentWeek.num} · <b>${fmt(actual)}</b> / ${planned} mi`;
        }
      }

      // ---------- Modal ----------
      function sectionLabel(day, key) {
        if (key === "workout") return "Workout";
        if (key === "strength") return "Strength";
        if (key === "fueling") return "Fueling cue";
        if (key.startsWith("routine_")) {
          const r = key.slice("routine_".length);
          return ROUTINE_LABELS[r] || r;
        }
        return key;
      }
      function openModal(day, week) {
        const ph = DATA.phases[week.phase - 1];
        const cat = categorize(day);
        const m = document.getElementById("modal");
        const counts = sectionCounts(day);
        let html = `<button class="close" onclick="closeModal()">×</button>`;
        html += `<h2>${day.title}</h2>`;
        html += `<div class="meta">${fmtDate(day.date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })} · Week ${week.num} · Phase ${ph.num}: ${ph.name} · <b>${cat.toUpperCase()}</b> · <span class="section-progress" id="modalSectionProgress"><b>${counts.done}</b>/${counts.total} sections done</span></div>`;

        // Group routines by chronological phase
        const byPhase = { anytime: [], pre: [], core: [], post: [], after_hours: [] };
        for (const r of (day.routines || [])) {
          const phase = ROUTINE_PHASE[r] || "anytime";
          byPhase[phase].push(r);
        }

        // ---- Child renderers (used inside top-level groups) ----
        // NOTE: Each child row is a <div> (not <label>) so clicking the body
        // does NOT toggle the checkbox — clicking the body opens the tracker
        // / log sub-modal instead. The checkbox is only toggled by clicking
        // the checkbox itself (its handler calls stopPropagation so the row's
        // click handler doesn't also fire).
        function childRoutineHtml(r) {
          const rKey = "routine_" + r;
          const rDone = isSectionDone(day, rKey);
          const hasTracker = !!DATA.routine_exercises[r];
          const rCounts = hasTracker ? exerciseProgress(day.date, rKey) : null;
          const progressPill = rCounts ? `<span class="modal-child-progress">${rCounts.done}/${rCounts.total}</span>` : "";
          const clickableAttrs = hasTracker
            ? ` is-clickable" data-tracker-kind="routine" data-tracker-key="${r}`
            : "";
          return `<div class="modal-child ${rDone ? "child-done" : ""}${clickableAttrs}" data-section-key="${rKey}">
              <input type="checkbox" class="task-check child-check" data-section="${rKey}" ${rDone ? "checked" : ""}>
              <div class="modal-child-body">
                <div class="modal-child-title">${ROUTINE_LABELS[r] || r}${progressPill}</div>
                <div class="modal-child-desc">${ROUTINE_SHORT_DESC[r] || (DATA.routines[r] || "").slice(0, 120)}</div>
              </div>
            </div>`;
        }

        function workoutChildHtml() {
          const wDone = isSectionDone(day, "workout");
          const hasLogged = hasLog(day.date);
          // Same condition as before for "is this row a log-target": every
          // non-rest day, plus any rest day that already has a log to edit.
          const canLog = cat !== "rest" || hasLogged;
          const clickableAttrs = canLog
            ? ` is-clickable" data-action="log`
            : "";
          return `<div class="modal-child ${wDone ? "child-done" : ""}${clickableAttrs}" data-section-key="workout">
              <input type="checkbox" class="task-check child-check" data-section="workout" ${wDone ? "checked" : ""}>
              <div class="modal-child-body">
                <div class="modal-child-title">${day.title}</div>
                <div class="modal-child-desc">${day.detail}</div>
              </div>
            </div>`;
        }

        function strengthChildHtml() {
          const sDone = isSectionDone(day, "strength");
          const sKey = detectStrengthKey(day.strength);
          const sCounts = sKey ? exerciseProgress(day.date, "strength_" + sKey) : null;
          const progressPill = sCounts ? `<span class="modal-child-progress">${sCounts.done}/${sCounts.total}</span>` : "";
          const meta = sKey ? DATA.strength_routines[sKey] : null;
          const title = meta ? meta.label : "Strength";
          const desc = meta ? `${meta.description} (${meta.duration})` : day.strength.split(":")[0];
          const clickableAttrs = sKey
            ? ` is-clickable" data-tracker-kind="strength" data-tracker-key="${sKey}`
            : "";
          return `<div class="modal-child ${sDone ? "child-done" : ""}${clickableAttrs}" data-section-key="strength">
              <input type="checkbox" class="task-check child-check" data-section="strength" ${sDone ? "checked" : ""}>
              <div class="modal-child-body">
                <div class="modal-child-title">${title}${progressPill}</div>
                <div class="modal-child-desc">${desc}</div>
              </div>
            </div>`;
        }

        function renderGroup(id, title, childrenHtml) {
          if (!childrenHtml) return "";
          return `<div class="modal-group" data-group-id="${id}">
            <label class="modal-group-head">
              <input type="checkbox" class="task-check group-check" data-group-id="${id}">
              <h3>${title}</h3>
            </label>
            <div class="modal-group-children">${childrenHtml}</div>
          </div>`;
        }

        // ---- Build top-level groups ----
        // 1. Morning Mobility (anytime routines: mobility_daily, shin_protocol)
        if (byPhase.anytime.length) {
          html += renderGroup("morning", "Morning Mobility", byPhase.anytime.map(childRoutineHtml).join(""));
        }

        // 2. Cardio (pre-warmup + workout + post-cooldown)
        const hasWorkout = cat !== "rest";
        if (byPhase.pre.length || hasWorkout || byPhase.post.length || hasLog(day.date)) {
          let cardioChildren = "";
          for (const r of byPhase.pre) cardioChildren += childRoutineHtml(r);
          if (hasWorkout || hasLog(day.date)) cardioChildren += workoutChildHtml();
          for (const r of byPhase.post) cardioChildren += childRoutineHtml(r);
          html += renderGroup("cardio", "Cardio", cardioChildren);
        }

        // 3. Strength (formal strength routine + core)
        if (day.strength || byPhase.core.length) {
          let strengthChildren = "";
          if (day.strength) strengthChildren += strengthChildHtml();
          for (const r of byPhase.core) strengthChildren += childRoutineHtml(r);
          html += renderGroup("strength-group", "Strength", strengthChildren);
        }

        // 4. Throughout the Day (desk breaks)
        if (byPhase.after_hours.length) {
          html += renderGroup("anytime-group", "Throughout the Day", byPhase.after_hours.map(childRoutineHtml).join(""));
        }

        // Master "all complete" checkbox at the bottom
        const allDone = isDone(day);
        html += `<label class="modal-check-row ${allDone ? "is-done" : ""}" id="modalCheckRow">
            <input type="checkbox" class="task-check" id="modalCheck" ${allDone ? "checked" : ""}>
            <span class="lbl" id="modalCheckLbl">${allDone ? "Workout complete - all sections done" : "Mark all sections complete"}</span>
          </label>`;

        m.innerHTML = html;
        document.getElementById("modalBg").classList.add("show");

        // Helper to refresh the master checkbox + progress + external UI
        function refreshMaster() {
          const c = sectionCounts(day);
          const all = c.done === c.total && c.total > 0;
          const master = document.getElementById("modalCheck");
          if (master) master.checked = all;
          const row = document.getElementById("modalCheckRow");
          if (row) row.classList.toggle("is-done", all);
          const lbl = document.getElementById("modalCheckLbl");
          if (lbl)
            lbl.textContent = all
              ? "Workout complete - all sections done"
              : "Mark all sections complete";
          const sp = document.getElementById("modalSectionProgress");
          if (sp) sp.innerHTML = `<b>${c.done}</b>/${c.total} sections done`;
          // sync week-grid card
          const dayCard = document.querySelector(
            `.day[data-date="${day.date}"]`,
          );
          if (dayCard) {
            dayCard.classList.toggle("completed", all);
            const cb = dayCard.querySelector(".task-check");
            if (cb) cb.checked = all;
          }
          // sync today panel
          if (day.date === todayClampedISO()) renderToday();
        }

        // Reflect group checkbox state from child states (checked/indeterminate/unchecked)
        function refreshGroupStates() {
          m.querySelectorAll(".modal-group").forEach((groupEl) => {
            const groupCb = groupEl.querySelector(".group-check");
            const childCbs = groupEl.querySelectorAll(".child-check");
            const total = childCbs.length;
            const done = Array.from(childCbs).filter((c) => c.checked).length;
            if (total === 0) {
              groupCb.checked = false; groupCb.indeterminate = false;
            } else if (done === total) {
              groupCb.checked = true; groupCb.indeterminate = false;
            } else if (done === 0) {
              groupCb.checked = false; groupCb.indeterminate = false;
            } else {
              groupCb.checked = false; groupCb.indeterminate = true;
            }
            const head = groupEl.querySelector(".modal-group-head");
            if (head) head.classList.toggle("group-done", total > 0 && done === total);
          });
        }

        // Wire child checkboxes
        m.querySelectorAll(".child-check").forEach((cb) => {
          cb.addEventListener("click", (e) => e.stopPropagation());
          cb.addEventListener("change", (e) => {
            const key = e.target.dataset.section;
            setSectionDone(day, key, e.target.checked);
            const parentLabel = e.target.closest(".modal-child");
            if (parentLabel) parentLabel.classList.toggle("child-done", e.target.checked);
            refreshGroupStates();
            refreshMaster();
          });
        });

        // Wire group checkboxes (toggle all children in the group)
        m.querySelectorAll(".group-check").forEach((cb) => {
          cb.addEventListener("click", (e) => e.stopPropagation());
          cb.addEventListener("change", (e) => {
            const v = e.target.checked;
            const groupEl = e.target.closest(".modal-group");
            if (!groupEl) return;
            groupEl.querySelectorAll(".child-check").forEach((c) => {
              c.checked = v;
              setSectionDone(day, c.dataset.section, v);
              const parentLabel = c.closest(".modal-child");
              if (parentLabel) parentLabel.classList.toggle("child-done", v);
            });
            refreshGroupStates();
            refreshMaster();
          });
        });

        // Wire whole-row click → opens the appropriate sub-modal.
        // The child checkbox's own click handler calls stopPropagation, so
        // checking the box does NOT bubble up and open the tracker.
        // The "Move to another day" button lives INSIDE the sub-modals
        // (tracker / log modal), not on the row itself.
        m.querySelectorAll(".modal-child.is-clickable").forEach((row) => {
          row.addEventListener("click", (e) => {
            // Ignore clicks that originated on the checkbox or its label area.
            // (stopPropagation on the checkbox already covers this — belt +
            //  suspenders for any focus-via-keyboard or programmatic clicks.)
            if (e.target.classList && e.target.classList.contains("task-check")) return;
            if (row.dataset.action === "log") {
              openWorkoutLogModal(day, week);
            } else if (row.dataset.trackerKind) {
              openExerciseTracker(day, row.dataset.trackerKind, row.dataset.trackerKey);
            }
          });
        });

        // Wire master checkbox — toggle EVERY child + every group
        const mcb = document.getElementById("modalCheck");
        if (mcb) {
          mcb.addEventListener("change", (e) => {
            const v = e.target.checked;
            setDayDone(day, v);
            m.querySelectorAll(".child-check").forEach((c) => {
              c.checked = v;
              const parentLabel = c.closest(".modal-child");
              if (parentLabel) parentLabel.classList.toggle("child-done", v);
            });
            refreshGroupStates();
            refreshMaster();
          });
        }

        // Initial computation of group states from current child states
        refreshGroupStates();
      }

      // Workout log sub-modal — opens from the "Log workout" / "Edit log"
      // button inside the day modal. Replaces the old inline log form.
      function openWorkoutLogModal(day, week) {
        const cat = categorize(day);
        const log = getLog(day.date) || {};
        const isBike = cat === "bike";
        const m = document.getElementById("logModal");
        let html = `<button class="close" onclick="closeWorkoutLogModal()" style="float:right;cursor:pointer;border:0;background:none;font-size:24px;color:var(--muted);line-height:1;padding:0 4px">×</button>`;
        html += `<h2>${isBike ? "Bike log" : "Workout log"}</h2>`;
        html += `<div class="ex-meta">${fmtDate(day.date, { weekday: "long", month: "long", day: "numeric" })} · ${day.title}</div>`;
        html += `<div class="ex-desc">${isBike ? "Log your bike session. Avg speed auto-calculates from distance + time." : "Log what you actually did. Pace auto-calculates from distance + duration."}</div>`;
        html += `<div class="log-grid">
          <div class="log-field">
            <label>Distance (mi)</label>
            <input type="text" inputmode="decimal" id="logDistance" step="0.01" min="0" placeholder="${isBike ? "12.0" : "3.0"}" value="${log.distance ?? ""}">
          </div>
          <div class="log-field">
            <label>${isBike ? "Time rode (min : sec)" : "Duration (min : sec)"}</label>
            <div class="duration-inputs">
              <input type="number" id="logMin" min="0" placeholder="0" value="${log.minutes ?? ""}">
              <span>:</span>
              <input type="number" id="logSec" min="0" max="59" placeholder="00" value="${log.seconds ?? ""}">
            </div>
          </div>
          <div class="log-field">
            <label>${isBike ? "Avg speed" : "Pace"}</label>
            <div class="log-pace empty" id="logPaceDisplay">${isBike ? "—.— mph" : "—:—/mi"}</div>
          </div>
          ${isBike ? `<div class="log-field">
            <label>Avg power (W)</label>
            <input type="number" id="logPower" min="0" max="600" placeholder="—" value="${log.avgPower ?? ""}">
          </div>` : ""}
          <div class="log-field">
            <label>Avg HR (optional)</label>
            <input type="number" id="logHR" min="0" max="250" placeholder="—" value="${log.heartRate ?? ""}">
          </div>
        </div>
        <div class="log-field">
          <label>How it felt (RPE 1-10)</label>
          <div class="rpe-buttons" id="rpeButtons">
            ${[1,2,3,4,5,6,7,8,9,10].map((n) => `<button type="button" class="rpe-btn ${log.rpe === n ? "selected" : ""}" data-rpe="${n}">${n}</button>`).join("")}
          </div>
        </div>
        <div class="log-field" style="margin-top:10px">
          <label>Notes</label>
          <textarea id="logNotes" placeholder="${isBike ? "How the legs felt, class type, anything notable..." : "Weather, how you felt, anything notable..."}">${log.notes ? log.notes.replace(/</g, "&lt;") : ""}</textarea>
        </div>
        <div class="log-actions">
          <button type="button" class="btn btn-primary" id="saveLog">${hasLog(day.date) ? "Update workout" : "Save workout"}</button>
          <button type="button" class="btn btn-danger" id="deleteLog" style="${hasLog(day.date) ? "" : "display:none"}">Delete log</button>
          <button type="button" class="btn" id="logMoveSection">Move to another day</button>
          <button type="button" class="btn" id="logCloseBtn">Close</button>
          <span class="log-status" id="logStatus"></span>
        </div>`;

        m.innerHTML = html;
        document.getElementById("logModalBg").classList.add("show");

        // Wire the form
        const distEl = document.getElementById("logDistance");
        const minEl = document.getElementById("logMin");
        const secEl = document.getElementById("logSec");
        const hrEl = document.getElementById("logHR");
        const notesEl = document.getElementById("logNotes");
        const paceEl = document.getElementById("logPaceDisplay");
        const statusEl = document.getElementById("logStatus");
        const powerEl = document.getElementById("logPower");
        let selectedRpe = (getLog(day.date) || {}).rpe ?? null;

        function updatePace() {
          const dist = parseFloat(distEl.value);
          const totalSec = durationToSeconds(minEl.value, secEl.value);
          if (isBike) {
            const mph = calcSpeed(dist, totalSec);
            if (mph) { paceEl.textContent = fmtSpeed(mph); paceEl.classList.remove("empty"); }
            else { paceEl.textContent = "—.— mph"; paceEl.classList.add("empty"); }
          } else {
            const sec = calcPace(dist, totalSec);
            if (sec) { paceEl.textContent = fmtPace(sec); paceEl.classList.remove("empty"); }
            else { paceEl.textContent = "—:—/mi"; paceEl.classList.add("empty"); }
          }
        }
        distEl.addEventListener("input", updatePace);
        minEl.addEventListener("input", updatePace);
        secEl.addEventListener("input", updatePace);
        updatePace();

        m.querySelectorAll(".rpe-btn").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            m.querySelectorAll(".rpe-btn").forEach((b) => b.classList.remove("selected"));
            btn.classList.add("selected");
            selectedRpe = parseInt(btn.dataset.rpe, 10);
          });
        });

        document.getElementById("saveLog").addEventListener("click", () => {
          const dist = parseFloat(distEl.value);
          const totalSec = durationToSeconds(minEl.value, secEl.value);
          if (!dist && !totalSec && selectedRpe == null && !notesEl.value.trim()) {
            statusEl.textContent = "Add at least one field before saving.";
            statusEl.style.color = "#B85450";
            return;
          }
          const newLog = {
            date: day.date,
            distance: isNaN(dist) ? null : dist,
            minutes: minEl.value ? parseInt(minEl.value, 10) : null,
            seconds: secEl.value ? parseInt(secEl.value, 10) : null,
            durationSec: totalSec || null,
            rpe: selectedRpe,
            heartRate: hrEl.value ? parseInt(hrEl.value, 10) : null,
            notes: notesEl.value.trim() || null,
            loggedAt: new Date().toISOString(),
          };
          if (isBike) {
            const mph = calcSpeed(dist, totalSec);
            newLog.avgSpeedMph = mph || null;
            newLog.avgSpeedLabel = mph ? fmtSpeed(mph) : null;
            newLog.avgPower = powerEl && powerEl.value ? parseInt(powerEl.value, 10) : null;
            newLog.paceSecPerMile = null; newLog.paceLabel = null;
          } else {
            const paceSec = calcPace(dist, totalSec);
            newLog.paceSecPerMile = paceSec || null;
            newLog.paceLabel = paceSec ? fmtPace(paceSec) : null;
            newLog.avgSpeedMph = null; newLog.avgSpeedLabel = null; newLog.avgPower = null;
          }
          saveLog(day.date, newLog);
          // Auto-check workout section + sync main modal UI
          setSectionDone(day, "workout", true);
          const wCb = document.querySelector('.child-check[data-section="workout"]');
          if (wCb) wCb.checked = true;
          const wChild = document.querySelector('.modal-child[data-section-key="workout"]');
          if (wChild) wChild.classList.add("child-done");
          // Day card update across all views
          document.querySelectorAll(`.day[data-date="${day.date}"]`).forEach((el) => updateDayCardLog(el, newLog));
          // Week stat + bar fill
          const wk = weekForDate(day.date);
          if (wk) { refreshWeekStat(wk); refreshBarFill(wk); }
          statusEl.style.color = "var(--p1)";
          statusEl.textContent = "Saved!";
          setTimeout(() => { if (statusEl) statusEl.textContent = ""; }, 2000);
          document.getElementById("saveLog").textContent = "Update workout";
          document.getElementById("deleteLog").style.display = "";
        });

        document.getElementById("deleteLog").addEventListener("click", () => {
          if (!confirm("Delete this workout log? Your completion checkmarks will stay.")) return;
          deleteLog(day.date);
          distEl.value = ""; minEl.value = ""; secEl.value = ""; hrEl.value = ""; notesEl.value = "";
          m.querySelectorAll(".rpe-btn").forEach((b) => b.classList.remove("selected"));
          selectedRpe = null;
          updatePace();
          document.getElementById("saveLog").textContent = "Save workout";
          document.getElementById("deleteLog").style.display = "none";
          statusEl.style.color = "var(--muted)";
          statusEl.textContent = "Log deleted.";
          setTimeout(() => { if (statusEl) statusEl.textContent = ""; }, 2000);
          document.querySelectorAll(`.day[data-date="${day.date}"]`).forEach((el) => updateDayCardLog(el, null));
          const wk = weekForDate(day.date);
          if (wk) { refreshWeekStat(wk); refreshBarFill(wk); }
        });

        document.getElementById("logCloseBtn").addEventListener("click", closeWorkoutLogModal);
        // "Move to another day" — opens the date-picker for the workout section.
        const logMoveBtn = document.getElementById("logMoveSection");
        if (logMoveBtn) {
          logMoveBtn.addEventListener("click", () => {
            openMoveSectionPicker(day.date, "workout", "log");
          });
        }
      }

      function closeWorkoutLogModal() {
        const bg = document.getElementById("logModalBg");
        if (bg) bg.classList.remove("show");
      }
      // Click-outside + Escape close handlers for workout log sub-modal
      document.addEventListener("click", (e) => {
        const bg = document.getElementById("logModalBg");
        if (bg && e.target === bg) closeWorkoutLogModal();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          const bg = document.getElementById("logModalBg");
          if (bg && bg.classList.contains("show")) closeWorkoutLogModal();
        }
      });

      // Update or remove the actual-pace pill on a day card
      function updateDayCardLog(dayCard, log) {
        let pill = dayCard.querySelector(".actual");
        if (!log) {
          if (pill) pill.remove();
          return;
        }
        if (!pill) {
          pill = document.createElement("div");
          pill.className = "actual";
          dayCard.appendChild(pill);
        }
        const parts = [];
        if (log.distance) parts.push(`${log.distance} mi`);
        // Bike: speed (and optionally power); Run: pace
        if (log.avgSpeedLabel) parts.push(log.avgSpeedLabel);
        else if (log.paceLabel) parts.push(log.paceLabel);
        else if (log.durationSec) parts.push(fmtDuration(log.durationSec));
        if (log.avgPower) parts.push(`${log.avgPower}W`);
        pill.textContent = parts.join(" · ") || "logged";
      }
      function closeModal() {
        document.getElementById("modalBg").classList.remove("show");
      }
      document.getElementById("modalBg").addEventListener("click", (e) => {
        if (e.target.id === "modalBg") closeModal();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
      });

      function fuelingCue(day, cat, week) {
        const phase = week.phase;
        const calRange =
          phase <= 1
            ? "1,650-1,750 cal"
            : phase === 2
              ? "1,700-1,800 cal"
              : phase === 3
                ? "1,700-1,950 cal"
                : phase === 4
                  ? "1,750-2,000 cal"
                  : "1,650-1,950 cal";
        if (cat === "race") {
          return `<b>RACE DAY.</b> Wake 3-4 hr before race. Breakfast 600-800 cal mostly carbs (bagel + jam + banana + coffee). Sip electrolyte water through morning. 60 min before: small snack if hungry (half banana). 45 min before: caffeine (1 cup coffee or gel) - only if rehearsed. Post-race: refuel within 60 min, celebrate with what you want.`;
        }
        if (cat === "rest") {
          return `<b>Rest day.</b> Today's calories: <b>${calRange}</b>. Slightly lower carbs (~3-4 g/kg = 200-275g). Protein 4 meals @ 25-35g. Lots of veggies. Don't undereat - recovery happens on rest days.`;
        }
        if (cat === "quality") {
          return `<b>Quality day.</b> Today's calories: <b>${calRange}</b>. PRE-WORKOUT (60-90 min before): 200-300 cal mostly carbs (banana + nut butter, oatmeal, toast + jam). DURING: water; if >75 min, gel/chews. POST (within 30 min): 20-30g protein + 40-60g carbs (shake + banana, choc milk + PB sandwich, Greek yogurt + granola). Carbs higher today (~5-6 g/kg).`;
        }
        if (cat === "long") {
          return `<b>Long run day.</b> Today's calories: <b>${calRange}</b>. PRE: 200-300 cal carb-focused 60-90 min before. DURING (>75 min): 30-60g carbs/hr - practice gels/chews. Sip electrolyte water. POST: real meal within 60 min, big plate. Carbs highest today (~6 g/kg).`;
        }
        if (cat === "bike") {
          return `<b>Bike day.</b> Today's calories: <b>${calRange}</b>. Treat like easy: hydrate well, fuel before if morning, eat real food within 60 min after. Watch hip flexor tightness post-bike - DO the post-bike stretch.`;
        }
        return `<b>Easy day.</b> Today's calories: <b>${calRange}</b>. Standard meals, ~4 g/kg carbs. PRE: optional 100-150 cal (banana + coffee). POST: balanced meal within 60 min - protein 25-35g + carbs.`;
      }

      // ---------- Filters ----------
      function applyFilter(f) {
        const allDays = document.querySelectorAll(".day");
        for (const d of allDays) {
          let show = true;
          if (f === "quality") show = d.dataset.cat === "quality";
          if (f === "strength") show = d.dataset.strength === "1";
          if (f === "long") show = d.dataset.cat === "long";
          if (f === "race") show = d.dataset.cat === "race";
          d.style.display = show ? "flex" : "none";
        }
        if (f !== "all") {
          document.querySelectorAll(".week").forEach((w) => {
            w.classList.add("open");
            w.querySelector(".days").style.display = "grid";
          });
        }
      }
      document.querySelectorAll("[data-filter]").forEach((b) =>
        b.addEventListener("click", () => {
          document
            .querySelectorAll("[data-filter]")
            .forEach((x) => x.classList.remove("active"));
          b.classList.add("active");
          applyFilter(b.dataset.filter);
        }),
      );
      document.getElementById("expandAll").addEventListener("click", () => {
        document.querySelectorAll(".week").forEach((w) => {
          w.classList.add("open");
          w.querySelector(".days").style.display = "grid";
        });
      });
      document.getElementById("collapseAll").addEventListener("click", () => {
        document.querySelectorAll(".week").forEach((w) => {
          w.classList.remove("open");
          w.querySelector(".days").style.display = "none";
        });
      });

      // ---------- Reference panel ----------
      function fillRef() {
        // Format a routine string into a clean per-exercise list
        function formatRoutine(text) {
          // Strip the "LABEL (time):" prefix
          const prefixMatch = text.match(/^[^:]+:\s*/);
          const body = prefixMatch ? text.slice(prefixMatch[0].length) : text;

          // Split on semicolons first, then also split any item on ". " before an uppercase letter (trailing note)
          const rawParts = body.split(/;/).map(s => s.trim()).filter(Boolean);
          const exercises = [];
          const notes = [];

          rawParts.forEach(part => {
            // Check if this part contains a sentence note appended after a period
            const noteSplit = part.match(/^(.+?\d[^.]*)\.\s+([A-Z].+)$/);
            if (noteSplit) {
              exercises.push(noteSplit[1].trim());
              notes.push(noteSplit[2].trim());
            } else if (/\d|\/side|\/leg|\/arm|sec|min| ea\b|reps|sets|x\d|\d+s\b/i.test(part)) {
              // Strip trailing period if present
              exercises.push(part.replace(/\.$/, '').trim());
            } else {
              notes.push(part.replace(/\.$/, '').trim());
            }
          });

          const rows = exercises.map(e => {
            // Split name from quantity — quantity starts at first digit
            const match = e.match(/^(.*?)\s+(\d[\d\/\w\s\(\),.x-]*)$/);
            if (match) {
              return `<div class="ref-exercise">
                <span class="ref-ex-name">${capitalise(match[1].trim())}</span>
                <span class="ref-ex-reps">${match[2].trim()}</span>
              </div>`;
            }
            return `<div class="ref-exercise"><span class="ref-ex-name">${capitalise(e)}</span></div>`;
          }).join('');

          const noteHtml = notes.length
            ? `<div class="ref-note">${notes.join(' ')}</div>`
            : '';

          return rows + noteHtml;
        }

        function capitalise(str) {
          return str.charAt(0).toUpperCase() + str.slice(1);
        }

        for (const k of [
          "pre_run",
          "post_run",
          "pre_bike",
          "post_bike",
          "mobility_daily",
          "desk_breaks",
          "shin_protocol",
        ]) {
          const el = document.getElementById("ref_" + k);
          if (el) el.innerHTML = formatRoutine(DATA.routines[k]);
        }
        document.getElementById("ref_strength_A").textContent =
          DATA.strength.A_full_gym;
        document.getElementById("ref_strength_B").textContent =
          DATA.strength.B_home;
        document.getElementById("ref_strength_L").textContent =
          DATA.strength.light_taper;
        let paces = "";
        for (const [k, v] of Object.entries(DATA.pace_ref)) {
          paces += `<div><b>${k.replace(/_/g, " ")}:</b> ${v}</div>`;
        }
        document.getElementById("ref_paces").innerHTML = paces;
        document.getElementById("ref_fuel").innerHTML = `
    <div style="background:var(--bf-note-bg);padding:8px;border-radius:6px;margin-bottom:10px;font-size:12px"><b>Tuned to your body comp:</b> 147.9 lb / 28.7% BF / 105.4 lb LBM (47.8 kg) / BMR 1,403. Goal: 135 lb @ ~22-23% BF. Use the <b>Fuel tab</b> for daily logging — these ranges are now PCOS-tuned for energy availability ≥ 38 on training days.</div>
    <div><b>P1 (W1-4):</b> 1,650-1,750 cal/day. ~200-250 cal deficit. P 110-120g · F 55-65g · C 130-150g.</div>
    <div><b>P2 (W5-9):</b> 1,700-1,800 cal/day. ~200-250 cal deficit. P 115-125g · F 58-68g · C 135-155g.</div>
    <div><b>P3 (W10-14):</b> 1,700-1,950 cal/day. ~200 cal deficit. P 120-130g · F 60-70g · C 140-160g.</div>
    <div><b>P4 (W15-18):</b> 1,750-2,000 cal/day. Mild deficit only — prioritise fuelling peak mileage. P 125-135g · F 60-70g · C 145-165g.</div>
    <div><b>P5 (W19-21):</b> 1,650-1,950 cal/day. ~150-200 cal mild taper deficit. P 110-120g · F 55-65g · C 130-150g.</div>
    <div style="margin-top:8px"><b>Day cycling (key for PCOS):</b> quality / long-run days → top of range (+100-200 on long days). Easy / bike / strength → middle. Rest day → bottom (not lower). Place carbs around training — that's when insulin sensitivity is highest.</div>
    <div style="margin-top:6px"><b>Luteal phase:</b> +150-250 cal/day in the 7-10 days before your period (mostly carbs + protein, not fat). Toggle "Luteal" in the Fuel tab to apply this automatically.</div>
    <div style="margin-top:6px"><b>Always:</b> protein 4 meals @ 30-40g (target 150g/day) · 75+ oz water · 25-35g fiber (5-10g soluble for PCOS) · 7-9 hr sleep.</div>
    <div style="margin-top:6px"><b>LEA warning signs:</b> cycle gets longer or disappears, sleep degrades, workouts feel harder at same RPE, persistent cold hands/feet, mood crashes. Eat more, not less.</div>
    <div style="margin-top:6px;font-size:11px;color:#6B7280"><b>BIA caveat:</b> home-scale body fat % is ±3-5% off DEXA. Trust 4-week rolling averages over the daily number. Check-in every 2 weeks, not weekly — long runs and your cycle add noise.</div>
  `;
      }

      // ---------- Exercise log storage (per-exercise tracking) ----------
      // Schema: EX_LOGS[date][routineKey][exerciseKey] = {completed, weight, reps, notes, updatedAt}
      // routineKey is "strength_A_full_gym", "strength_B_home", "strength_light_taper",
      // or a routine key like "pre_run", "post_run", "mobility_daily", etc.
      const EX_LOG_KEY = "katie-mile-exercise-logs";
      function loadExerciseLogs() {
        try {
          const raw = localStorage.getItem(EX_LOG_KEY);
          return raw ? JSON.parse(raw) : {};
        } catch (e) { return {}; }
      }
      function persistExerciseLogs() {
        try { localStorage.setItem(EX_LOG_KEY, JSON.stringify(EX_LOGS)); } catch (e) {}
        if (typeof scheduleSync === "function") scheduleSync();
      }
      let EX_LOGS = loadExerciseLogs();

      function getExerciseList(routineKey) {
        // routineKey like "strength_A_full_gym" or "pre_run"
        if (routineKey.startsWith("strength_")) {
          const sk = routineKey.slice("strength_".length);
          return DATA.strength_routines[sk] ? DATA.strength_routines[sk].exercises : [];
        }
        return DATA.routine_exercises[routineKey] || [];
      }
      function getRoutineLabel(routineKey) {
        if (routineKey.startsWith("strength_")) {
          const sk = routineKey.slice("strength_".length);
          return DATA.strength_routines[sk] ? DATA.strength_routines[sk].label : routineKey;
        }
        return ROUTINE_LABELS[routineKey] || routineKey;
      }
      function getRoutineMeta(routineKey) {
        if (routineKey.startsWith("strength_")) {
          const sk = routineKey.slice("strength_".length);
          return DATA.strength_routines[sk] || {};
        }
        return { label: ROUTINE_LABELS[routineKey], description: DATA.routines && DATA.routines[routineKey] };
      }
      // Parse the leading set count from a prescription string.
      // "3x8" → 3, "3 x 30s/side" → 3, "2x15" → 2. Returns 0 if no pattern.
      function parseSetCount(prescription) {
        if (!prescription) return 0;
        const m = String(prescription).match(/^(\d+)\s*[x×]\s*/i);
        return m ? parseInt(m[1], 10) : 0;
      }

      // Extract the "per-set" portion of a prescription (what goes inside each set circle).
      // "3x6" → "6", "3x5-8" → "5-8", "3x8/leg" → "8", "3x30s/side" → "30s".
      function parsePerSetLabel(prescription) {
        if (!prescription) return "";
        const m = String(prescription).match(/^\d+\s*[x×]\s*([\d.\-]+s?|\d+\s*sec)/i);
        return m ? m[1].trim() : "";
      }

      // Numeric prescribed reps, used as the default in the set-log modal.
      // "6" → 6, "5-8" → 8 (upper bound), "30s" → null (time-based, not reps).
      function parsePrescribedReps(prescription) {
        const label = parsePerSetLabel(prescription);
        if (!label) return null;
        if (/s$|sec/i.test(label)) return null; // time-based, no reps
        const range = label.match(/^(\d+)-(\d+)/);
        if (range) return parseInt(range[2], 10);
        const single = label.match(/^(\d+)/);
        if (single) return parseInt(single[1], 10);
        return null;
      }

      // Ensure log has a `sets` array in the new format. Migrates old `setsCompleted`.
      function ensureSetsArray(log, ex) {
        if (Array.isArray(log.sets) && log.sets.length > 0) return log.sets;
        const setCount = parseSetCount(ex.prescription);
        if (setCount === 0) return [];
        const defaultReps = parsePrescribedReps(ex.prescription);
        const oldSets = Array.isArray(log.setsCompleted) ? log.setsCompleted : [];
        const sets = [];
        for (let i = 0; i < setCount; i++) {
          sets.push({
            reps: defaultReps,
            weight: log.weight ?? null,
            weightUnit: "lb",
            completed: !!oldSets[i],
          });
        }
        return sets;
      }

      // Find previous logs of this exercise across past dates (any routine).
      // Used to populate the history section + suggest default weights.
      function getExerciseHistory(exerciseKey, beforeDate, limit = 5) {
        const results = [];
        const dates = Object.keys(EX_LOGS).filter((d) => d < beforeDate).sort().reverse();
        for (const date of dates) {
          const dayLogs = EX_LOGS[date];
          if (!dayLogs) continue;
          for (const rk in dayLogs) {
            const exLog = dayLogs[rk][exerciseKey];
            if (!exLog) continue;
            const sets = Array.isArray(exLog.sets) ? exLog.sets : [];
            // Get the typical weight (last set's, or legacy log.weight)
            let weight = null, weightUnit = "lb";
            for (let i = sets.length - 1; i >= 0; i--) {
              if (sets[i].weight != null) {
                weight = sets[i].weight;
                weightUnit = sets[i].weightUnit || "lb";
                break;
              }
            }
            if (weight == null && exLog.weight != null) weight = exLog.weight;
            results.push({ date, sets, weight, weightUnit, routineKey: rk });
            if (results.length >= limit) return results;
          }
        }
        return results;
      }

      // Default weight when opening a set log: prior set today, else last week's value.
      function findDefaultWeight(day, routineKey, exerciseKey, setIdx) {
        const log = getExerciseLog(day.date, routineKey, exerciseKey);
        if (log && Array.isArray(log.sets)) {
          for (let i = setIdx - 1; i >= 0; i--) {
            if (log.sets[i] && log.sets[i].weight != null) {
              return { weight: log.sets[i].weight, unit: log.sets[i].weightUnit || "lb" };
            }
          }
        }
        const history = getExerciseHistory(exerciseKey, day.date, 1);
        if (history.length > 0 && history[0].weight != null) {
          return { weight: history[0].weight, unit: history[0].weightUnit || "lb" };
        }
        return null;
      }

      function exerciseProgress(date, routineKey) {
        const list = getExerciseList(routineKey);
        if (!list.length) return null;
        const dayLogs = (EX_LOGS[date] && EX_LOGS[date][routineKey]) || {};
        const done = list.filter(ex => dayLogs[ex.key] && dayLogs[ex.key].completed).length;
        return { done, total: list.length };
      }
      function getExerciseLog(date, routineKey, exerciseKey) {
        return (EX_LOGS[date] && EX_LOGS[date][routineKey] && EX_LOGS[date][routineKey][exerciseKey]) || null;
      }
      function setExerciseLog(date, routineKey, exerciseKey, log) {
        if (!EX_LOGS[date]) EX_LOGS[date] = {};
        if (!EX_LOGS[date][routineKey]) EX_LOGS[date][routineKey] = {};
        EX_LOGS[date][routineKey][exerciseKey] = { ...log, updatedAt: new Date().toISOString() };
        persistExerciseLogs();
      }
      function clearExerciseLog(date, routineKey, exerciseKey) {
        if (EX_LOGS[date] && EX_LOGS[date][routineKey]) {
          delete EX_LOGS[date][routineKey][exerciseKey];
          if (Object.keys(EX_LOGS[date][routineKey]).length === 0) delete EX_LOGS[date][routineKey];
          if (Object.keys(EX_LOGS[date]).length === 0) delete EX_LOGS[date];
          persistExerciseLogs();
        }
      }

      // ---------- Exercise tracker sub-modal ----------
      // routineKey: for strength → "strength_A_full_gym", "strength_B_home", "strength_light_taper"
      //             for routines → "pre_run", "post_run", "mobility_daily", etc.
      // Track currently-open exercise tracker so set-log modal can re-render it
      let CURRENT_TRACKER = null;
      function refreshExerciseTrackerModal() {
        if (CURRENT_TRACKER) {
          const { day, kind, key } = CURRENT_TRACKER;
          openExerciseTracker(day, kind, key);
        }
      }
      function openExerciseTracker(day, kind, key) {
        CURRENT_TRACKER = { day, kind, key };
        const routineKey = kind === "strength" ? "strength_" + key : key;
        const exercises = getExerciseList(routineKey);
        const meta = getRoutineMeta(routineKey);
        const isStrength = kind === "strength";
        if (!exercises.length) return;

        const m = document.getElementById("exModal");
        let html = `<button class="close" onclick="closeExerciseTracker()" style="float:right;cursor:pointer;border:0;background:none;font-size:24px;color:var(--muted);line-height:1;padding:0 4px">×</button>`;
        html += `<h2>${meta.label || getRoutineLabel(routineKey)}</h2>`;
        html += `<div class="ex-meta">${fmtDate(day.date, { weekday: "long", month: "long", day: "numeric" })} · ${day.title}${meta.duration ? " · " + meta.duration : ""}</div>`;
        if (meta.description) html += `<div class="ex-desc">${meta.description}</div>`;

        const counts = exerciseProgress(day.date, routineKey);
        html += `<div class="ex-progress" id="exProgressLabel"><b>${counts.done}</b>/${counts.total} complete</div>`;

        for (const ex of exercises) {
          const log = getExerciseLog(day.date, routineKey, ex.key) || {};
          const sets = isStrength ? ensureSetsArray(log, ex) : [];
          const completedCount = sets.filter((s) => s.completed).length;
          const totalSets = sets.length;
          const done = isStrength
            ? totalSets > 0 && completedCount === totalSets
            : !!log.completed;
          const perSetLabel = isStrength ? parsePerSetLabel(ex.prescription) || "?" : "";

          // Build set circle buttons (strength only)
          let circlesHtml = "";
          if (isStrength) {
            for (let i = 0; i < totalSets; i++) {
              const s = sets[i] || {};
              const insideLabel = s.completed && s.reps != null
                ? String(s.reps)
                : perSetLabel;
              circlesHtml += `<button type="button" class="set-circle ${s.completed ? "completed" : ""}" data-set-idx="${i}" title="Set ${i + 1}">${insideLabel}</button>`;
            }
          }

          // Build history block (strength only — last 3 prior workouts of this exercise)
          let historyHtml = "";
          if (isStrength) {
            const history = getExerciseHistory(ex.key, day.date, 3);
            if (history.length > 0) {
              const rows = history.map((h) => {
                const repList = (h.sets || []).map((s) => (s.reps != null ? s.reps : "?")).join(",") || "—";
                const wDisplay = h.weight != null ? `${h.weight} ${h.weightUnit || "lb"}` : "—";
                return `<div class="ex-history-row">
                  <span class="h-date">${fmtDate(h.date, { month: "short", day: "numeric" })}</span>
                  <span class="h-sets">${repList} reps</span>
                  <span class="h-weight">${wDisplay}</span>
                </div>`;
              }).join("");
              historyHtml = `<div class="ex-history">
                <div class="ex-history-toggle" data-history-toggle>
                  <span class="chev-mini">▸</span> History (${history.length})
                </div>
                <div class="ex-history-list">${rows}</div>
              </div>`;
            }
          }

          html += `<div class="ex-row ${done ? "done" : ""}" data-ex-key="${ex.key}">
            <div class="ex-head">
              <input type="checkbox" class="task-check ex-done-check" ${done ? "checked" : ""}>
              <div class="ex-name">
                <div class="name">${ex.name}</div>
                <div class="prescription">${ex.prescription || ""}</div>
                ${ex.note ? `<div class="tip">${ex.note}</div>` : ""}
              </div>
            </div>
            ${isStrength ? `
              <div class="strength-set-area">
                <div class="sets-summary"><b>${completedCount}</b> / ${totalSets} sets ${totalSets > 0 ? "· tap a circle to log" : ""}</div>
                <div class="set-circles">${circlesHtml || `<span style="font-size:12px;color:var(--muted)">No sets parsed from prescription</span>`}</div>
              </div>
              ${historyHtml}
            ` : ``}
          </div>`;
        }

        html += `<div class="ex-actions">
          <button type="button" class="btn btn-primary" id="exMarkAll">Mark all done</button>
          <button type="button" class="btn" id="exClearAll">Clear all</button>
          <button type="button" class="btn" id="exMoveSection">Move to another day</button>
          <span style="flex:1"></span>
          <span class="ex-status" id="exStatus"></span>
          <button type="button" class="btn" id="exClose">Close</button>
        </div>`;

        m.innerHTML = html;
        document.getElementById("exModalBg").classList.add("show");
        document.body.style.overflow = "hidden";

        // Wire each row
        m.querySelectorAll(".ex-row").forEach((row) => {
          const exKey = row.dataset.exKey;
          const cb = row.querySelector(".ex-done-check");
          const nEl = row.querySelector(".ex-notes"); // routines only
          const circles = Array.from(row.querySelectorAll(".set-circle"));

          // Routine note + completion persistence (non-strength only)
          function persistRoutine() {
            const completed = cb.checked;
            const notes = nEl && nEl.value.trim() ? nEl.value.trim() : null;
            if (!completed && !notes) {
              clearExerciseLog(day.date, routineKey, exKey);
            } else {
              setExerciseLog(day.date, routineKey, exKey, { completed, notes });
            }
            row.classList.toggle("done", completed);
            updateExProgress(day, routineKey);
            propagateToParentSection(day, routineKey);
          }

          // Strength master done — toggling marks all sets done/undone with default reps
          function strengthMasterToggle(toCompleted) {
            const ex = exercises.find((e) => e.key === exKey);
            if (!ex) return;
            const log = getExerciseLog(day.date, routineKey, exKey) || {};
            const sets = ensureSetsArray(log, ex);
            const defaultReps = parsePrescribedReps(ex.prescription);
            const def = findDefaultWeight(day, routineKey, exKey, sets.length);
            for (let i = 0; i < sets.length; i++) {
              sets[i] = {
                reps: sets[i].reps != null ? sets[i].reps : defaultReps,
                weight: sets[i].weight != null ? sets[i].weight : (def ? def.weight : null),
                weightUnit: sets[i].weightUnit || (def ? def.unit : "lb"),
                completed: toCompleted,
              };
            }
            const completed = toCompleted;
            setExerciseLog(day.date, routineKey, exKey, { completed, sets });
            updateExProgress(day, routineKey);
            propagateToParentSection(day, routineKey);
            refreshExerciseTrackerModal();
          }

          // Master done checkbox
          cb.addEventListener("change", () => {
            if (isStrength) {
              strengthMasterToggle(cb.checked);
            } else {
              persistRoutine();
            }
          });

          // Set circles — tap to open the per-set log sub-modal
          circles.forEach((circle) => {
            circle.addEventListener("click", (e) => {
              e.stopPropagation();
              const idx = parseInt(circle.dataset.setIdx, 10);
              openSetLogModal(day, routineKey, exKey, idx);
            });
          });

          // History toggle
          const histToggle = row.querySelector("[data-history-toggle]");
          if (histToggle) {
            histToggle.addEventListener("click", (e) => {
              e.stopPropagation();
              histToggle.classList.toggle("open");
              const list = row.querySelector(".ex-history-list");
              if (list) list.classList.toggle("open");
            });
          }

          // Notes textarea (routines only)
          if (nEl) nEl.addEventListener("change", persistRoutine);
        });

        // Mark all / Clear all
        document.getElementById("exMarkAll").addEventListener("click", () => {
          m.querySelectorAll(".ex-row").forEach((row) => {
            const cb = row.querySelector(".ex-done-check");
            if (!cb.checked) { cb.checked = true; cb.dispatchEvent(new Event("change")); }
          });
          flashStatus("All marked done");
        });
        document.getElementById("exClearAll").addEventListener("click", () => {
          if (!confirm("Clear all exercise logs for this workout?")) return;
          m.querySelectorAll(".ex-row").forEach((row) => {
            const exKey = row.dataset.exKey;
            clearExerciseLog(day.date, routineKey, exKey);
          });
          updateExProgress(day, routineKey);
          propagateToParentSection(day, routineKey);
          flashStatus("Cleared");
          refreshExerciseTrackerModal();
        });
        document.getElementById("exClose").addEventListener("click", closeExerciseTracker);
        // "Move to another day" → opens the date-picker. Section key is
        // "strength" for strength workouts, "routine_<key>" otherwise.
        const moveBtn = document.getElementById("exMoveSection");
        if (moveBtn) {
          moveBtn.addEventListener("click", () => {
            const sectionKey = isStrength ? "strength" : "routine_" + key;
            openMoveSectionPicker(day.date, sectionKey, "tracker");
          });
        }
      }

      function flashStatus(text) {
        const el = document.getElementById("exStatus");
        if (!el) return;
        el.textContent = text;
        setTimeout(() => { if (el) el.textContent = ""; }, 1500);
      }
      function updateExProgress(day, routineKey) {
        const counts = exerciseProgress(day.date, routineKey);
        const lbl = document.getElementById("exProgressLabel");
        if (lbl) lbl.innerHTML = `<b>${counts.done}</b>/${counts.total} complete`;
        // Also update the pill in the main modal if it's open
        // (Main modal will re-render on close anyway)
      }
      function propagateToParentSection(day, routineKey) {
        const counts = exerciseProgress(day.date, routineKey);
        if (!counts) return;
        const allDone = counts.done === counts.total;
        const sectionKey = routineKey.startsWith("strength_") ? "strength" : "routine_" + routineKey;
        const wasComplete = isSectionDone(day, sectionKey);
        if (allDone && !wasComplete) {
          setSectionDone(day, sectionKey, true);
        } else if (!allDone && wasComplete) {
          setSectionDone(day, sectionKey, false);
        }
        // Sync the main modal's nested layout (child checkbox + group state)
        const mainCb = document.querySelector(`.child-check[data-section="${sectionKey}"]`);
        if (mainCb) {
          const newDone = isSectionDone(day, sectionKey);
          mainCb.checked = newDone;
          const childRow = mainCb.closest(".modal-child");
          if (childRow) childRow.classList.toggle("child-done", newDone);
          // Recompute the parent group's checkbox/indeterminate state
          const groupEl = mainCb.closest(".modal-group");
          if (groupEl) {
            const groupCb = groupEl.querySelector(".group-check");
            const childCbs = groupEl.querySelectorAll(".child-check");
            const total = childCbs.length;
            const done = Array.from(childCbs).filter((c) => c.checked).length;
            if (groupCb) {
              if (total === 0) { groupCb.checked = false; groupCb.indeterminate = false; }
              else if (done === total) { groupCb.checked = true; groupCb.indeterminate = false; }
              else if (done === 0) { groupCb.checked = false; groupCb.indeterminate = false; }
              else { groupCb.checked = false; groupCb.indeterminate = true; }
            }
            const head = groupEl.querySelector(".modal-group-head");
            if (head) head.classList.toggle("group-done", total > 0 && done === total);
          }
        }
        // Sync the day card in both week grids (Plan + Home)
        document.querySelectorAll(`.day[data-date="${day.date}"]`).forEach((el) => {
          el.classList.toggle("completed", isDone(day));
        });
      }
      function closeExerciseTracker() {
        document.getElementById("exModalBg").classList.remove("show");
        document.body.style.overflow = "";
        CURRENT_TRACKER = null;
      }

      // Per-set log sub-modal — opened by tapping a set circle
      function openSetLogModal(day, routineKey, exerciseKey, setIdx) {
        const exercises = getExerciseList(routineKey);
        const ex = exercises.find((e) => e.key === exerciseKey);
        if (!ex) return;
        const log = getExerciseLog(day.date, routineKey, exerciseKey) || {};
        const sets = ensureSetsArray(log, ex);
        const currentSet = sets[setIdx] || {};
        const defaultReps = currentSet.reps != null ? currentSet.reps : parsePrescribedReps(ex.prescription);
        const def = findDefaultWeight(day, routineKey, exerciseKey, setIdx);
        const defaultWeight = currentSet.weight != null ? currentSet.weight : (def ? def.weight : null);
        const defaultUnit = currentSet.weightUnit || (def ? def.unit : "lb");

        const m = document.getElementById("setLogModal");
        let html = `<button class="close" onclick="closeSetLogModal()" style="float:right;cursor:pointer;border:0;background:none;font-size:24px;color:var(--muted);line-height:1;padding:0 4px">×</button>`;
        html += `<h2>Set ${setIdx + 1} of ${sets.length}</h2>`;
        html += `<div class="set-log-meta">${ex.name}</div>`;
        html += `<div class="set-log-prescription">Prescription: ${ex.prescription || "—"}</div>`;
        html += `<div class="set-log-form">
          <div class="field">
            <label>Reps</label>
            <input type="number" id="setRepsInput" min="0" max="500" placeholder="—" value="${defaultReps ?? ""}" inputmode="numeric">
          </div>
          <div class="field">
            <label>Weight</label>
            <input type="text" inputmode="decimal" id="setWeightInput" min="0" step="0.5" placeholder="—" value="${defaultWeight ?? ""}" inputmode="decimal">
          </div>
        </div>
        <div class="weight-unit-row">
          <span class="label-text">Unit</span>
          <div class="weight-unit-toggle">
            <button type="button" class="unit-btn ${defaultUnit === "lb" ? "active" : ""}" data-unit="lb">lb</button>
            <button type="button" class="unit-btn ${defaultUnit === "kg" ? "active" : ""}" data-unit="kg">kg</button>
          </div>
        </div>
        <div class="set-log-actions">
          <button type="button" class="btn btn-primary" id="setLogSaveBtn">${currentSet.completed ? "Update set" : "Save set"}</button>
          ${currentSet.completed ? `<button type="button" class="btn btn-danger" id="setLogClearBtn">Clear set</button>` : ""}
          <span style="flex:1"></span>
          <button type="button" class="btn" id="setLogCancelBtn">Cancel</button>
        </div>`;

        m.innerHTML = html;
        document.getElementById("setLogModalBg").classList.add("show");

        let selectedUnit = defaultUnit;
        m.querySelectorAll(".unit-btn").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            m.querySelectorAll(".unit-btn").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            selectedUnit = btn.dataset.unit;
          });
        });

        document.getElementById("setLogSaveBtn").addEventListener("click", () => {
          const repsVal = document.getElementById("setRepsInput").value;
          const weightVal = document.getElementById("setWeightInput").value;
          sets[setIdx] = {
            reps: repsVal !== "" ? parseInt(repsVal, 10) : null,
            weight: weightVal !== "" ? parseFloat(weightVal) : null,
            weightUnit: selectedUnit,
            completed: true,
          };
          // Auto-complete = all sets done
          const allDone = sets.every((s) => s.completed);
          setExerciseLog(day.date, routineKey, exerciseKey, {
            completed: allDone,
            sets,
          });
          updateExProgress(day, routineKey);
          propagateToParentSection(day, routineKey);
          closeSetLogModal();
          refreshExerciseTrackerModal();
        });

        const clearBtn = document.getElementById("setLogClearBtn");
        if (clearBtn) {
          clearBtn.addEventListener("click", () => {
            sets[setIdx] = {
              reps: currentSet.reps,
              weight: currentSet.weight,
              weightUnit: currentSet.weightUnit,
              completed: false,
            };
            const allDone = sets.every((s) => s.completed);
            setExerciseLog(day.date, routineKey, exerciseKey, {
              completed: allDone,
              sets,
            });
            updateExProgress(day, routineKey);
            propagateToParentSection(day, routineKey);
            closeSetLogModal();
            refreshExerciseTrackerModal();
          });
        }

        document.getElementById("setLogCancelBtn").addEventListener("click", closeSetLogModal);

        // Focus reps input for quick keyboard entry
        setTimeout(() => {
          const r = document.getElementById("setRepsInput");
          if (r) { r.focus(); r.select(); }
        }, 100);
      }

      function closeSetLogModal() {
        document.getElementById("setLogModalBg").classList.remove("show");
      }
      // Click outside + Escape to close set log modal
      document.addEventListener("click", (e) => {
        const bg = document.getElementById("setLogModalBg");
        if (bg && e.target === bg) closeSetLogModal();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          const bg = document.getElementById("setLogModalBg");
          if (bg && bg.classList.contains("show")) closeSetLogModal();
        }
      });
      // Click outside to close, Esc to close
      document.addEventListener("click", (e) => {
        const bg = document.getElementById("exModalBg");
        if (bg && e.target === bg) closeExerciseTracker();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          const bg = document.getElementById("exModalBg");
          if (bg && bg.classList.contains("show")) closeExerciseTracker();
          const siBg = document.getElementById("stravaInboxModalBg");
          if (siBg && siBg.classList.contains("show")) closeStravaInbox();
        }
      });

      // ---------- Strava integration ----------
      // Token storage (in-memory + synced to Supabase strava_tokens table)
      let STRAVA = null; // { access_token, refresh_token, expires_at, athlete_id, athlete_name }
      const STRAVA_LAST_SYNC_KEY = "katie-mile-strava-last-sync";

      // ---------- Strava skipped-activities inbox ----------
      // Persistent map of activities the auto-sync couldn't place. Shape:
      //   { [activityId]: { activity, reason, status, updatedAt } }
      // status: "pending" | "ignored" | "assigned"
      // reason: "no_plan_day" | "unsupported_type" | "strength_no_day"
      const STRAVA_INBOX_KEY = "katie-mile-strava-inbox";
      let STRAVA_INBOX_SHOW_IGNORED = false;

      function loadStravaInbox() {
        try {
          const raw = localStorage.getItem(STRAVA_INBOX_KEY);
          return raw ? JSON.parse(raw) : {};
        } catch (e) { return {}; }
      }
      function saveStravaInbox(obj) {
        try { localStorage.setItem(STRAVA_INBOX_KEY, JSON.stringify(obj)); } catch (e) {}
      }
      // Slim the activity payload before storing so the inbox doesn't carry
      // every Strava field forever.
      function slimStravaActivity(a) {
        return {
          id: a.id,
          name: a.name,
          type: a.type,
          sport_type: a.sport_type,
          start_date: a.start_date,
          start_date_local: a.start_date_local,
          distance: a.distance,
          moving_time: a.moving_time,
          elapsed_time: a.elapsed_time,
          average_heartrate: a.average_heartrate,
          average_watts: a.average_watts,
        };
      }
      // Add or refresh a pending inbox entry. If the entry was already
      // 'assigned' or 'ignored', leave it alone — the user already decided.
      function addToStravaInbox(activity, reason) {
        const inbox = loadStravaInbox();
        const existing = inbox[activity.id];
        if (existing && (existing.status === "assigned" || existing.status === "ignored")) {
          return existing.status;
        }
        inbox[activity.id] = {
          activity: slimStravaActivity(activity),
          reason,
          status: "pending",
          updatedAt: new Date().toISOString(),
        };
        saveStravaInbox(inbox);
        return "pending";
      }
      function markStravaActivityStatus(id, status) {
        const inbox = loadStravaInbox();
        if (!inbox[id]) return;
        inbox[id].status = status;
        inbox[id].updatedAt = new Date().toISOString();
        saveStravaInbox(inbox);
      }
      function getStravaInboxStatus(id) {
        const inbox = loadStravaInbox();
        return inbox[id]?.status || null;
      }
      function countStravaInboxPending() {
        const inbox = loadStravaInbox();
        let n = 0;
        for (const id in inbox) if (inbox[id].status === "pending") n++;
        return n;
      }
      function updateStravaInboxBadge() {
        const btn = document.getElementById("stravaInboxBtn");
        const badge = document.getElementById("stravaInboxBadge");
        if (!btn || !badge) return;
        const n = countStravaInboxPending();
        if (n > 0) {
          btn.style.display = "";
          badge.textContent = String(n);
          badge.classList.remove("zero");
        } else {
          // Hide the button entirely when nothing is pending — but keep it
          // accessible if there are ignored items the user might un-ignore.
          const inbox = loadStravaInbox();
          const anyIgnored = Object.values(inbox).some((e) => e.status === "ignored");
          if (anyIgnored) {
            btn.style.display = "";
            badge.textContent = "0";
            badge.classList.add("zero");
          } else {
            btn.style.display = "none";
          }
        }
      }

      function fmtInboxStats(a, defaultType) {
        const distMi = a.distance ? a.distance / 1609.344 : null;
        const dur = a.moving_time || a.elapsed_time || null;
        const parts = [];
        if (defaultType !== "strength" && distMi)
          parts.push(`<b>${(Math.round(distMi * 100) / 100).toFixed(2)} mi</b>`);
        if (dur) parts.push(`<b>${fmtDuration(dur)}</b>`);
        if (a.average_heartrate) parts.push(`HR ${Math.round(a.average_heartrate)}`);
        if (a.average_watts) parts.push(`${Math.round(a.average_watts)} W`);
        return parts.join(" · ");
      }
      function reasonLabel(reason) {
        if (reason === "no_plan_day") return { text: "No matching plan day", cls: "" };
        if (reason === "unsupported_type") return { text: "Unsupported activity type", cls: "" };
        if (reason === "strength_no_day") return { text: "Strength on a non-strength day", cls: "warn" };
        return { text: reason, cls: "" };
      }
      // Best guess at workout type from the original Strava activity, used
      // to pre-select the type dropdown for the user.
      function guessWorkoutType(a) {
        const type = (a.type || "").toLowerCase();
        const sportType = (a.sport_type || "").toLowerCase();
        const name = (a.name || "").toLowerCase();
        if (type.includes("run") || sportType.includes("run")) return "run";
        if (type.includes("ride") || type.includes("bike") || type.includes("velo")
          || sportType.includes("ride") || sportType.includes("bike") || sportType.includes("velo")
          || name.includes("peloton") || name.includes("bike") || name.includes("cycl")
          || name.includes("ride") || name.includes("spin")) return "bike";
        if (type === "weighttraining" || sportType === "weighttraining"
          || type === "crossfit" || sportType === "crossfit"
          || type === "highintensityintervaltraining" || sportType === "highintensityintervaltraining"
          || name.includes("strength") || name.includes("weight") || name.includes("lift")
          || name.includes("bootcamp")) return "strength";
        return "run";
      }
      // Compute the browser-local calendar date for an activity (same rule
      // as the auto-import uses), formatted YYYY-MM-DD for <input type="date">.
      function activityLocalDate(a) {
        const utc = new Date(a.start_date);
        return utc.getFullYear() + "-" +
          String(utc.getMonth() + 1).padStart(2, "0") + "-" +
          String(utc.getDate()).padStart(2, "0");
      }

      function openStravaInbox() {
        renderStravaInbox();
        const bg = document.getElementById("stravaInboxModalBg");
        if (bg) bg.classList.add("show");
      }
      function closeStravaInbox() {
        const bg = document.getElementById("stravaInboxModalBg");
        if (bg) bg.classList.remove("show");
      }
      function renderStravaInbox() {
        const root = document.getElementById("stravaInboxModal");
        if (!root) return;
        const inbox = loadStravaInbox();
        const entries = Object.values(inbox);
        const pending = entries.filter((e) => e.status === "pending");
        const ignored = entries.filter((e) => e.status === "ignored");
        // Sort pending newest-first by activity start date
        pending.sort((a, b) => (b.activity.start_date || "").localeCompare(a.activity.start_date || ""));
        ignored.sort((a, b) => (b.activity.start_date || "").localeCompare(a.activity.start_date || ""));

        const headerHtml = `
          <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:14px">
            <div style="flex:1">
              <h2>Unassigned Strava Activities</h2>
              <div class="ex-meta">${pending.length} pending${ignored.length ? ` · ${ignored.length} ignored` : ""}</div>
            </div>
            <button type="button" class="btn" id="siCloseBtn">Close</button>
          </div>
          <div class="ex-desc">These activities couldn't be auto-assigned. Pick a date and workout type, then Assign. Use Ignore to dismiss activities you don't want to track (e.g. walks, recovery rides).</div>
        `;

        const renderRow = (entry) => {
          const a = entry.activity;
          const reason = reasonLabel(entry.reason);
          const guess = guessWorkoutType(a);
          const localDate = activityLocalDate(a);
          const friendlyDate = new Date(a.start_date).toLocaleString(undefined, {
            weekday: "short", month: "short", day: "numeric",
            hour: "numeric", minute: "2-digit",
          });
          const typeLabel = a.sport_type || a.type || "Activity";
          const isIgnored = entry.status === "ignored";
          if (isIgnored) {
            return `<div class="si-row ignored" data-id="${a.id}">
              <div class="si-head">
                <div class="si-name">${escapeHtml(a.name || "Untitled")}</div>
                <span class="si-reason">Ignored</span>
              </div>
              <div class="si-meta">${escapeHtml(typeLabel)} · ${friendlyDate}</div>
              <div class="si-stats">${fmtInboxStats(a, guess)}</div>
              <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end">
                <button type="button" class="btn si-btn-unignore" data-id="${a.id}">Un-ignore</button>
              </div>
            </div>`;
          }
          return `<div class="si-row" data-id="${a.id}">
            <div class="si-head">
              <div class="si-name">${escapeHtml(a.name || "Untitled")}</div>
              <span class="si-reason ${reason.cls}">${reason.text}</span>
            </div>
            <div class="si-meta">${escapeHtml(typeLabel)} · ${friendlyDate}</div>
            <div class="si-stats">${fmtInboxStats(a, guess)}</div>
            <div class="si-controls">
              <div>
                <label>Assign to date</label>
                <input type="date" class="si-date" value="${localDate}">
              </div>
              <div>
                <label>Workout type</label>
                <select class="si-type">
                  <option value="run"${guess === "run" ? " selected" : ""}>Run</option>
                  <option value="bike"${guess === "bike" ? " selected" : ""}>Bike</option>
                  <option value="strength"${guess === "strength" ? " selected" : ""}>Strength</option>
                </select>
              </div>
              <button type="button" class="btn btn-primary si-btn-assign" data-id="${a.id}">Assign</button>
              <button type="button" class="btn si-btn-ignore" data-id="${a.id}">Ignore</button>
            </div>
          </div>`;
        };

        let body = "";
        if (pending.length === 0) {
          body = `<div class="si-empty">No pending Strava activities to assign. Hit "Pull recent runs &amp; rides" to look for new ones.</div>`;
        } else {
          body = pending.map(renderRow).join("");
        }

        let ignoredBlock = "";
        if (ignored.length > 0) {
          const toggleLabel = STRAVA_INBOX_SHOW_IGNORED
            ? `Hide ignored (${ignored.length})`
            : `Show ignored (${ignored.length})`;
          ignoredBlock = `
            <button type="button" class="si-toggle-ignored" id="siToggleIgnored">${toggleLabel}</button>
            ${STRAVA_INBOX_SHOW_IGNORED ? `<div style="margin-top:8px">${ignored.map(renderRow).join("")}</div>` : ""}
          `;
        }

        root.innerHTML = headerHtml + body + ignoredBlock;

        // Wire row handlers
        root.querySelector("#siCloseBtn")?.addEventListener("click", closeStravaInbox);
        root.querySelector("#siToggleIgnored")?.addEventListener("click", () => {
          STRAVA_INBOX_SHOW_IGNORED = !STRAVA_INBOX_SHOW_IGNORED;
          renderStravaInbox();
        });
        root.querySelectorAll(".si-btn-assign").forEach((btn) => {
          btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const row = btn.closest(".si-row");
            const dateStr = row.querySelector(".si-date")?.value;
            const type = row.querySelector(".si-type")?.value;
            assignFromInbox(id, dateStr, type);
          });
        });
        root.querySelectorAll(".si-btn-ignore").forEach((btn) => {
          btn.addEventListener("click", () => ignoreFromInbox(btn.dataset.id));
        });
        root.querySelectorAll(".si-btn-unignore").forEach((btn) => {
          btn.addEventListener("click", () => unignoreFromInbox(btn.dataset.id));
        });
      }

      function escapeHtml(s) {
        return String(s || "").replace(/[&<>"']/g, (c) => (
          { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
        ));
      }

      // Assign a stored Strava activity to a specific plan day + workout type.
      // Mirrors the bookkeeping the auto-import does, plus a conflict prompt
      // when the target date already has a log (or strength check) recorded.
      function assignFromInbox(id, dateStr, type) {
        const inbox = loadStravaInbox();
        const entry = inbox[id];
        if (!entry) return;
        const a = entry.activity;
        if (!dateStr) {
          showToast("Pick a date for this activity first.", "error");
          return;
        }
        const ctx = findDayForDate(dateStr);
        if (!ctx) {
          showToast("That date isn't in the training plan. Pick a date inside the plan range.", "error");
          return;
        }
        if (type === "strength") {
          if (!ctx.day.strength) {
            if (!confirm("That day has no strength workout scheduled. Mark strength done on this day anyway?")) {
              return;
            }
          } else {
            const already = COMPLETED[dateStr];
            const alreadyDone = already && typeof already === "object" && already.strength === true;
            if (alreadyDone) {
              const keep = confirm("Strength is already marked complete on " + dateStr + ".\n\nOK = keep existing (no change)\nCancel = re-mark from this Strava activity");
              if (keep) {
                // User wants to keep the existing check; still clear from inbox.
                markStravaActivityStatus(id, "assigned");
                updateStravaInboxBadge();
                renderStravaInbox();
                return;
              }
            }
          }
          setSectionDone(ctx.day, "strength", true);
          markStravaActivityStatus(id, "assigned");
          updateStravaInboxBadge();
          renderStravaInbox();
          return;
        }
        // Run or Bike
        const distanceMi = a.distance ? a.distance / 1609.344 : null;
        const durationSec = a.moving_time || a.elapsed_time || null;
        const avgHr = a.average_heartrate ? Math.round(a.average_heartrate) : null;
        const newLog = {
          date: dateStr,
          distance: distanceMi ? Math.round(distanceMi * 100) / 100 : null,
          minutes: durationSec ? Math.floor(durationSec / 60) : null,
          seconds: durationSec ? durationSec % 60 : null,
          durationSec,
          rpe: null,
          heartRate: avgHr,
          notes: `Imported from Strava (${a.name}). Manually assigned.`.trim(),
          loggedAt: new Date().toISOString(),
        };
        if (type === "bike") {
          const mph = calcSpeed(distanceMi, durationSec);
          newLog.avgSpeedMph = mph || null;
          newLog.avgSpeedLabel = mph ? fmtSpeed(mph) : null;
          newLog.avgPower = a.average_watts ? Math.round(a.average_watts) : null;
          newLog.paceSecPerMile = null;
          newLog.paceLabel = null;
        } else {
          const paceSec = calcPace(distanceMi, durationSec);
          newLog.paceSecPerMile = paceSec || null;
          newLog.paceLabel = paceSec ? fmtPace(paceSec) : null;
          newLog.avgSpeedMph = null;
          newLog.avgSpeedLabel = null;
          newLog.avgPower = null;
        }
        // Conflict prompt — three-way choice via two confirms (no custom prompt UI)
        if (hasLog(dateStr)) {
          const overwrite = confirm("There's already a workout log on " + dateStr + ".\n\nOK = overwrite with this Strava activity\nCancel = keep the existing log (do nothing)");
          if (!overwrite) return;
        }
        saveLog(dateStr, newLog);
        setSectionDone(ctx.day, "workout", true);
        document.querySelectorAll(`.day[data-date="${dateStr}"]`).forEach((el) => updateDayCardLog(el, newLog));
        refreshWeekStat(ctx.week);
        refreshBarFill(ctx.week);
        markStravaActivityStatus(id, "assigned");
        updateStravaInboxBadge();
        renderStravaInbox();
      }

      function ignoreFromInbox(id) {
        markStravaActivityStatus(id, "ignored");
        updateStravaInboxBadge();
        renderStravaInbox();
      }
      function unignoreFromInbox(id) {
        markStravaActivityStatus(id, "pending");
        updateStravaInboxBadge();
        renderStravaInbox();
      }

      function setStravaStatus(state, text) {
        const el = document.getElementById("stravaStatus");
        const t = document.getElementById("stravaStatusText");
        if (!el || !t) return;
        el.className = "cloud-status " + state;
        t.textContent = text;
      }

      function updateStravaLastSync() {
        const el = document.getElementById("stravaLastSync");
        if (!el) return;
        const ts = localStorage.getItem(STRAVA_LAST_SYNC_KEY);
        if (!ts) { el.textContent = ""; return; }
        const d = new Date(ts);
        const mins = Math.floor((Date.now() - d.getTime()) / 60000);
        if (mins < 1) el.textContent = "Last pulled just now";
        else if (mins < 60) el.textContent = `Last pulled ${mins} min ago`;
        else if (mins < 60 * 24) el.textContent = `Last pulled ${Math.floor(mins/60)} hr ago`;
        else el.textContent = `Last pulled ${d.toLocaleDateString()}`;
      }

      // Load saved tokens from Supabase on sign-in
      async function loadStravaTokens() {
        if (!isSignedIn || !isSignedIn() || !supaClient) return;
        try {
          const { data, error } = await supaClient
            .from("strava_tokens")
            .select("*")
            .eq("user_id", supaUser.id)
            .single();
          if (error && error.code !== "PGRST116") throw error;
          if (data) {
            STRAVA = {
              access_token: data.access_token,
              refresh_token: data.refresh_token,
              expires_at: data.expires_at,
              athlete_id: data.athlete_id,
              athlete_name: data.athlete_name,
            };
            onStravaConnected();
          } else {
            onStravaDisconnected();
          }
        } catch (err) {
          console.warn("Failed to load Strava tokens:", err);
          onStravaDisconnected();
        }
      }

      async function saveStravaTokens(tokens) {
        if (!isSignedIn || !isSignedIn() || !supaClient) return;
        const row = {
          user_id: supaUser.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expires_at,
          athlete_id: tokens.athlete_id || (tokens.athlete && tokens.athlete.id) || null,
          athlete_name: tokens.athlete_name || (tokens.athlete ? `${tokens.athlete.firstname} ${tokens.athlete.lastname}` : null),
        };
        const { error } = await supaClient.from("strava_tokens").upsert(row, { onConflict: "user_id" });
        if (error) throw error;
        STRAVA = {
          access_token: row.access_token,
          refresh_token: row.refresh_token,
          expires_at: row.expires_at,
          athlete_id: row.athlete_id,
          athlete_name: row.athlete_name,
        };
      }

      // Start OAuth flow: redirect to Strava authorization page.
      // We pass our own URL as redirect_uri so Strava bounces back.
      function connectStrava() {
        // We use a placeholder client_id since the actual one is on the server.
        // Reconnect with the real client ID via env var injection at deploy time would be cleaner,
        // but since the client_id is public anyway, easiest is to fetch it from server first.
        fetch("/api/strava/exchange", { method: "OPTIONS" }) // warmup, ignore result
          .catch(() => {});
        // Use the public Strava OAuth URL. Client ID needs to be hardcoded or fetched.
        // We'll fetch from server via a small unauthenticated endpoint that returns the client_id.
        // Simpler: prompt user to paste their client_id once OR hardcode after first deploy.
        // For now: open Strava OAuth with the Client ID baked in via STRAVA_CLIENT_ID_PUBLIC constant.
        const clientId = STRAVA_CLIENT_ID_PUBLIC;
        if (!clientId || clientId === "PASTE_YOUR_STRAVA_CLIENT_ID_HERE") {
          showToast("Strava Client ID not configured yet. See setup instructions in Settings.", "error");
          return;
        }
        const redirect = location.origin + location.pathname;
        const scope = "read,activity:read_all";
        const url = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&approval_prompt=auto&scope=${encodeURIComponent(scope)}`;
        location.href = url;
      }

      // After Strava redirects back to our app with ?code=..., exchange code for tokens
      async function handleStravaCallback() {
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        const scope = params.get("scope");
        const error = params.get("error");
        if (!code && !error) return false;
        // Clean the URL (remove the OAuth params)
        history.replaceState(null, "", location.pathname);
        if (error) {
          setStravaStatus("error", "Authorization denied: " + error);
          return true;
        }
        if (!code) return false;
        // OAuth redirect lands on a fresh page load. Supabase session restoration
        // is async — wait up to ~5s for supaUser to populate before deciding the
        // user isn't signed in. Without this wait, the callback fires before
        // initSupabase() has read the session from localStorage and we lose the code.
        setStravaStatus("syncing", "Waiting for sign-in to load...");
        if (configIsValid && configIsValid() && window.supabase) {
          let waited = 0;
          while ((!supaClient || !supaUser) && waited < 5000) {
            await new Promise((r) => setTimeout(r, 100));
            waited += 100;
          }
        }
        if (!isSignedIn || !isSignedIn()) {
          setStravaStatus("error", "Not signed in to Cloud Sync");
          showToast("Sign in to your training app first (Cloud Sync), then reconnect Strava.", "error");
          return true;
        }
        setStravaStatus("syncing", "Exchanging code for token...");
        try {
          const res = await fetch("/api/strava/exchange", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Token exchange failed");
          await saveStravaTokens(data);
          onStravaConnected();
          setStravaStatus("signed-in", `Connected as ${STRAVA.athlete_name || "athlete"}`);
        } catch (err) {
          console.error(err);
          setStravaStatus("error", "Connection failed: " + (err.message || err));
        }
        return true;
      }

      // Refresh access token if expired
      async function ensureStravaToken() {
        if (!STRAVA) throw new Error("Not connected to Strava");
        const nowSec = Math.floor(Date.now() / 1000);
        if (STRAVA.expires_at && nowSec < STRAVA.expires_at - 60) {
          return STRAVA.access_token; // still valid
        }
        // Refresh
        const res = await fetch("/api/strava/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: STRAVA.refresh_token }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Token refresh failed");
        await saveStravaTokens({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
          athlete_id: STRAVA.athlete_id,
          athlete_name: STRAVA.athlete_name,
        });
        return STRAVA.access_token;
      }

      // Fetch recent activities from Strava and pre-fill workout logs
      async function pullStravaActivities() {
        if (!STRAVA) {
          showToast("Connect Strava first.", "error");
          return;
        }
        setStravaStatus("syncing", "Pulling activities from Strava...");
        try {
          const token = await ensureStravaToken();
          // Use last sync time minus 24hr buffer (catches delayed Strava uploads),
          // otherwise fall back to 30 days ago for first sync
          const lastSync = localStorage.getItem(STRAVA_LAST_SYNC_KEY);
          const after = lastSync
            ? Math.floor(new Date(lastSync).getTime() / 1000) - 86400
            : Math.floor(Date.now() / 1000) - 30 * 86400;
          const res = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=50`, {
            headers: { "Authorization": `Bearer ${token}` },
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `HTTP ${res.status}`);
          }
          const activities = await res.json();
          // Process each activity into a workout log
          let imported = 0, skipped = 0, newlySkipped = 0;
          for (const a of activities) {
            // Skip activities the user has already manually handled in the
            // inbox — assigned ones shouldn't be silently re-imported, and
            // ignored ones shouldn't be resurfaced.
            const handledStatus = getStravaInboxStatus(a.id);
            if (handledStatus === "assigned" || handledStatus === "ignored") {
              continue;
            }
            // Bucket the activity by the user's BROWSER-LOCAL calendar date.
            // Strava's `start_date_local` is the activity's recorded timezone,
            // which Peloton hardcodes to the user's Peloton account timezone
            // (Washington, DC) regardless of where the rider actually is — so
            // a 5am Stuttgart Peloton ride lands on the previous calendar day
            // if we use start_date_local naively. Using UTC start_date plus
            // the browser's local timezone produces the right date no matter
            // how the activity itself was timezoned.
            const utc = new Date(a.start_date);
            const date = utc.getFullYear() + "-" +
              String(utc.getMonth() + 1).padStart(2, "0") + "-" +
              String(utc.getDate()).padStart(2, "0");
            // Find matching day in plan
            const ctx = findDayForDate(date);
            if (!ctx) {
              console.log("Strava sync: skipped (no matching plan day)", { id: a.id, name: a.name, date, start_date: a.start_date, start_date_local: a.start_date_local, type: a.type, sport_type: a.sport_type });
              const prev = addToStravaInbox(a, "no_plan_day");
              if (prev === "pending") newlySkipped++;
              skipped++;
              continue;
            }
            // Determine if this is a run, bike, or strength activity. Strava exposes
            // both `type` (legacy, broad category) and `sport_type` (newer, more
            // granular). Peloton's integration usually sends `Ride` for bike classes
            // and `WeightTraining` for strength classes, but Bike Bootcamp and some
            // hybrid classes sync as the generic `Workout` type — so we also peek at
            // the activity name for keywords.
            const type = (a.type || "").toLowerCase();
            const sportType = (a.sport_type || "").toLowerCase();
            const name = (a.name || "").toLowerCase();
            const isRun = type.includes("run") || sportType.includes("run");
            const nameLooksLikeBike =
              name.includes("peloton") || name.includes("bike") ||
              name.includes("cycl") || name.includes("ride") ||
              name.includes("spin");
            const nameLooksLikeStrength =
              name.includes("strength") || name.includes("weight") ||
              name.includes("lift") || name.includes("crossfit") ||
              name.includes("bootcamp") || name.includes("arms") ||
              name.includes("legs") || name.includes("upper body") ||
              name.includes("lower body") || name.includes("full body");
            const isBike =
              type.includes("ride") || type.includes("bike") || type.includes("velo") ||
              sportType.includes("ride") || sportType.includes("bike") || sportType.includes("velo") ||
              ((type === "workout" || sportType === "workout") && nameLooksLikeBike);
            const isStrength =
              type === "weighttraining" || sportType === "weighttraining" ||
              type === "crossfit" || sportType === "crossfit" ||
              type === "highintensityintervaltraining" || sportType === "highintensityintervaltraining" ||
              ((type === "workout" || sportType === "workout") && !nameLooksLikeBike && nameLooksLikeStrength);
            if (!isRun && !isBike && !isStrength) {
              console.log("Strava sync: skipped (unsupported activity type)", { id: a.id, name: a.name, type: a.type, sport_type: a.sport_type });
              const prev = addToStravaInbox(a, "unsupported_type");
              if (prev === "pending") newlySkipped++;
              skipped++;
              continue;
            }
            // Strength activities don't have pace/speed/distance, so we handle them
            // separately: auto-check the strength section on planned strength days
            // without touching any existing cardio workout log on the same date.
            if (isStrength) {
              if (ctx.day.strength) {
                setSectionDone(ctx.day, "strength", true);
                imported++;
              } else {
                console.log("Strava sync: strength activity on a day with no strength scheduled", { id: a.id, name: a.name, date });
                const prev = addToStravaInbox(a, "strength_no_day");
                if (prev === "pending") newlySkipped++;
                skipped++;
              }
              continue;
            }
            const distanceMi = a.distance ? a.distance / 1609.344 : null;
            const durationSec = a.moving_time || a.elapsed_time || null;
            const avgHr = a.average_heartrate ? Math.round(a.average_heartrate) : null;
            const newLog = {
              date,
              distance: distanceMi ? Math.round(distanceMi * 100) / 100 : null,
              minutes: durationSec ? Math.floor(durationSec / 60) : null,
              seconds: durationSec ? durationSec % 60 : null,
              durationSec,
              rpe: null,
              heartRate: avgHr,
              notes: `Imported from Strava (${a.name}). ${a.notes || ""}`.trim(),
              loggedAt: new Date().toISOString(),
            };
            if (isBike) {
              const mph = calcSpeed(distanceMi, durationSec);
              newLog.avgSpeedMph = mph || null;
              newLog.avgSpeedLabel = mph ? fmtSpeed(mph) : null;
              newLog.avgPower = a.average_watts ? Math.round(a.average_watts) : null;
              newLog.paceSecPerMile = null;
              newLog.paceLabel = null;
            } else {
              const paceSec = calcPace(distanceMi, durationSec);
              newLog.paceSecPerMile = paceSec || null;
              newLog.paceLabel = paceSec ? fmtPace(paceSec) : null;
              newLog.avgSpeedMph = null;
              newLog.avgSpeedLabel = null;
              newLog.avgPower = null;
            }
            saveLog(date, newLog);
            // Auto-check workout section
            setSectionDone(ctx.day, "workout", true);
            // Refresh day card pace pill
            document.querySelectorAll(`.day[data-date="${date}"]`).forEach((el) => updateDayCardLog(el, newLog));
            // Week totals
            refreshWeekStat(ctx.week);
            refreshBarFill(ctx.week);
            imported++;
          }
          localStorage.setItem(STRAVA_LAST_SYNC_KEY, new Date().toISOString());
          updateStravaLastSync();
          setStravaStatus("signed-in", `Connected as ${STRAVA.athlete_name || "athlete"}`);
          updateStravaInboxBadge();
          // Re-render the Fuel tab so its exercise-calorie / EA readings
          // pick up the freshly-imported workout(s). Meal data is never
          // modified by this pull, but if the user is sitting on the Fuel
          // tab a stale UI can falsely look like meals disappeared.
          if (typeof renderFuel === "function") renderFuel();
          const pendingCount = countStravaInboxPending();
          const skipMsg = skipped
            ? ` ${skipped} skipped — ${pendingCount} waiting in the Unassigned list.`
            : "";
          if (imported === 0 && skipped === 0) {
            showToast("Already up to date — no new activities since last sync.");
          } else {
            showToast(`${imported} new activit${imported === 1 ? "y" : "ies"} synced from Strava.${skipMsg}`);
          }
          // Auto-open the inbox modal when there's anything new to assign,
          // so the user can act on it without hunting for a button.
          if (newlySkipped > 0) openStravaInbox();
        } catch (err) {
          console.error(err);
          setStravaStatus("error", "Pull failed: " + (err.message || err));
        }
      }

      function onStravaConnected() {
        document.getElementById("stravaConnectRow").style.display = "none";
        document.getElementById("stravaConnectedRow").style.display = "flex";
        const lbl = document.getElementById("stravaUserLabel");
        if (lbl) lbl.textContent = "Connected as " + (STRAVA.athlete_name || `athlete ${STRAVA.athlete_id}`);
        setStravaStatus("signed-in", "Connected");
        updateStravaLastSync();
        updateStravaInboxBadge();
      }
      function onStravaDisconnected() {
        document.getElementById("stravaConnectRow").style.display = "flex";
        document.getElementById("stravaConnectedRow").style.display = "none";
        setStravaStatus("disconnected", "Not connected");
      }

      async function disconnectStrava() {
        if (!confirm("Disconnect Strava? Your existing imported workout logs are kept.")) return;
        if (isSignedIn && isSignedIn() && supaClient) {
          await supaClient.from("strava_tokens").delete().eq("user_id", supaUser.id);
        }
        STRAVA = null;
        onStravaDisconnected();
      }

      function initStrava() {
        const connectBtn = document.getElementById("stravaConnectBtn");
        const pullBtn = document.getElementById("stravaPullBtn");
        const inboxBtn = document.getElementById("stravaInboxBtn");
        const disconnectBtn = document.getElementById("stravaDisconnectBtn");
        if (connectBtn) connectBtn.addEventListener("click", connectStrava);
        if (pullBtn) pullBtn.addEventListener("click", pullStravaActivities);
        if (inboxBtn) inboxBtn.addEventListener("click", openStravaInbox);
        if (disconnectBtn) disconnectBtn.addEventListener("click", disconnectStrava);

        // Top bar sync button — tap for incremental, hold 1s for full 30-day sync
        const topSyncBtn = document.getElementById("topBarSyncBtn");
        if (topSyncBtn) {
          let holdTimer = null;
          const startSync = async (force = false) => {
            topSyncBtn.classList.add("syncing");
            if (force) {
              localStorage.removeItem(STRAVA_LAST_SYNC_KEY);
              showToast("Syncing last 30 days from Strava…");
            }
            try { await pullStravaActivities(); } finally {
              topSyncBtn.classList.remove("syncing");
            }
          };
          topSyncBtn.addEventListener("pointerdown", () => {
            holdTimer = setTimeout(() => { holdTimer = null; startSync(true); }, 1000);
          });
          topSyncBtn.addEventListener("pointerup", () => {
            if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; startSync(false); }
          });
          topSyncBtn.addEventListener("pointercancel", () => {
            if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
          });
        }

        // Settings drawer: move the real #tab-more node into the drawer once.
        // (Cloning innerHTML duplicated every element ID and dropped event
        // listeners, so drawer buttons were dead or targeted the wrong copy.)
        {
          const moreSrc = document.getElementById("tab-more");
          const drawerBody = document.getElementById("settingsDrawerBody");
          if (moreSrc && drawerBody) drawerBody.appendChild(moreSrc);
        }
        // Top bar settings button — open settings drawer
        const topSettingsBtn = document.getElementById("topBarSettingsBtn");
        if (topSettingsBtn) {
          topSettingsBtn.addEventListener("click", () => {
            document.getElementById("settingsOverlay").classList.add("open");
          });
        }
        const overlay = document.getElementById("settingsOverlay");
        document.getElementById("settingsDrawerClose")?.addEventListener("click", () => overlay.classList.remove("open"));
        overlay?.addEventListener("click", (e) => { if (e.target === overlay) overlay.classList.remove("open"); });

        // Close drawer when navigating via bottom tab bar
        document.querySelectorAll(".tab-btn").forEach((btn) => {
          btn.addEventListener("click", () => overlay.classList.remove("open"));
        });
        // Close the inbox modal on backdrop click or Escape
        const inboxBg = document.getElementById("stravaInboxModalBg");
        if (inboxBg) {
          inboxBg.addEventListener("click", (e) => {
            if (e.target === inboxBg) closeStravaInbox();
          });
        }
        // Surface any pending Strava activities from prior sessions
        updateStravaInboxBadge();
        // Handle OAuth callback if present in URL
        handleStravaCallback().then((handled) => {
          if (!handled) {
            // Try to load existing tokens
            if (isSignedIn && isSignedIn()) loadStravaTokens();
          }
        });
      }

      // ---------- Cloud sync (Supabase) ----------
      const CLOUD_LAST_SYNC_KEY = "katie-mile-cloud-last-sync";
      let supaClient = null;
      let supaUser = null;
      let syncTimeout = null;

      function setCloudStatus(state, text) {
        const el = document.getElementById("cloudStatus");
        const t = document.getElementById("cloudStatusText");
        if (!el || !t) return;
        el.className = "cloud-status " + state;
        t.textContent = text;
      }
      function setAuthMsg(text, isError) {
        const el = document.getElementById("cloudAuthMsg");
        if (!el) return;
        el.style.color = isError ? "#B85450" : "var(--p1)";
        el.textContent = text;
        if (text)
          setTimeout(() => {
            if (el && el.textContent === text) el.textContent = "";
          }, 5000);
      }
      function updateLastSyncDisplay() {
        const el = document.getElementById("cloudLastSync");
        if (!el) return;
        const ts = localStorage.getItem(CLOUD_LAST_SYNC_KEY);
        if (!ts) {
          el.textContent = "";
          return;
        }
        const d = new Date(ts);
        const mins = Math.floor((Date.now() - d.getTime()) / 60000);
        if (mins < 1) el.textContent = "Synced just now";
        else if (mins < 60) el.textContent = `Synced ${mins} min ago`;
        else if (mins < 60 * 24)
          el.textContent = `Synced ${Math.floor(mins / 60)} hr ago`;
        else el.textContent = `Synced ${d.toLocaleDateString()}`;
      }
      function isSignedIn() {
        return supaClient && supaUser;
      }

      function configIsValid() {
        return (
          SUPABASE_URL &&
          SUPABASE_ANON_KEY &&
          !SUPABASE_URL.includes("PASTE_YOUR") &&
          !SUPABASE_ANON_KEY.includes("PASTE_YOUR") &&
          SUPABASE_URL.startsWith("http")
        );
      }

      async function initSupabase() {
        if (!configIsValid()) {
          setCloudStatus(
            "disconnected",
            "Not configured — see setup instructions",
          );
          return;
        }
        if (!window.supabase) {
          setCloudStatus("error", "Supabase library not loaded");
          return;
        }
        try {
          supaClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY,
            {
              auth: { persistSession: true, autoRefreshToken: true },
            },
          );
          // Check current session
          const { data } = await supaClient.auth.getSession();
          if (data.session && data.session.user) {
            supaUser = data.session.user;
            onSignedIn();
          } else {
            onSignedOut();
          }
          // Listen for auth changes.
          // IMPORTANT: Supabase fires this listener for every auth event,
          // including TOKEN_REFRESHED (~every 50 min while signed in) and
          // USER_UPDATED. Treating those the same as a real sign-in
          // triggers a destructive pullFromCloud() that wipes local-only
          // data — for example per-set strength logs that haven't been
          // synced (the cloud schema doesn't even have a column for the
          // sets array). So we ONLY trigger onSignedIn for actual sign-in
          // events, not token refreshes.
          supaClient.auth.onAuthStateChange((event, session) => {
            // Password reset link from email — Supabase fires PASSWORD_RECOVERY
            // and gives us a temporary session. Show the "set new password" form.
            if (event === "PASSWORD_RECOVERY") {
              if (session && session.user) supaUser = session.user;
              showPasswordRecovery();
              return;
            }
            // Sign-out: clear user + flip UI back to the sign-in form.
            if (event === "SIGNED_OUT" || !session || !session.user) {
              supaUser = null;
              onSignedOut();
              return;
            }
            // Real sign-in event — keep the existing behavior (auto-pull).
            if (event === "SIGNED_IN") {
              supaUser = session.user;
              onSignedIn();
              return;
            }
            // TOKEN_REFRESHED / USER_UPDATED / INITIAL_SESSION when we're
            // already signed in: just keep supaUser fresh. NO pullFromCloud.
            // The page-load path already pulled when it called onSignedIn
            // the first time, and an automatic mid-session pull would clobber
            // any in-progress local edits.
            supaUser = session.user;
          });
        } catch (err) {
          console.error(err);
          setCloudStatus("error", "Connection failed: " + (err.message || err));
        }
      }

      function onSignedIn() {
        document.getElementById("cloudAuthForm").style.display = "none";
        document.getElementById("cloudRecoveryForm").style.display = "none";
        document.getElementById("cloudSignedInRow").style.display = "flex";
        document.getElementById("cloudUserLabel").textContent =
          `Signed in as ${supaUser.email}`;
        setCloudStatus("signed-in", "Synced");
        updateLastSyncDisplay();
        // Auto-pull on sign-in
        pullFromCloud();
        // Load Strava connection if any
        if (typeof loadStravaTokens === "function") loadStravaTokens();
      }
      function onSignedOut() {
        document.getElementById("cloudAuthForm").style.display = "flex";
        document.getElementById("cloudRecoveryForm").style.display = "none";
        document.getElementById("cloudSignedInRow").style.display = "none";
        setCloudStatus("signed-out", "Sign in to enable sync");
      }

      // Password reset / recovery flow
      function showPasswordRecovery() {
        document.getElementById("cloudAuthForm").style.display = "none";
        document.getElementById("cloudSignedInRow").style.display = "none";
        document.getElementById("cloudRecoveryForm").style.display = "flex";
        setCloudStatus("syncing", "Set a new password to finish");
        // Scroll into view so the user actually sees the form
        document
          .getElementById("cloudRecoveryForm")
          .scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          const f = document.getElementById("newPassword");
          if (f) f.focus();
        }, 400);
      }

      function setRecoveryMsg(text, isError) {
        const el = document.getElementById("cloudRecoveryMsg");
        if (!el) return;
        el.style.color = isError ? "#B85450" : "var(--p1)";
        el.textContent = text;
      }

      async function setNewPassword() {
        if (!supaClient) return;
        const pw1 = document.getElementById("newPassword").value;
        const pw2 = document.getElementById("newPasswordConfirm").value;
        if (!pw1 || !pw2) {
          setRecoveryMsg("Both fields are required.", true);
          return;
        }
        if (pw1.length < 6) {
          setRecoveryMsg("Password must be at least 6 characters.", true);
          return;
        }
        if (pw1 !== pw2) {
          setRecoveryMsg("Passwords don't match.", true);
          return;
        }
        setRecoveryMsg("Updating...");
        const { data, error } = await supaClient.auth.updateUser({
          password: pw1,
        });
        if (error) {
          setRecoveryMsg(error.message || "Failed to update password.", true);
          return;
        }
        // Success — user is now fully signed in with the new password.
        // Clean the recovery hash out of the URL so future loads don't re-trigger recovery.
        if (location.hash) history.replaceState(null, "", location.pathname + location.search);
        document.getElementById("newPassword").value = "";
        document.getElementById("newPasswordConfirm").value = "";
        if (data && data.user) {
          supaUser = data.user;
          onSignedIn();
        }
      }

      function cancelRecovery() {
        document.getElementById("newPassword").value = "";
        document.getElementById("newPasswordConfirm").value = "";
        // Also sign out the recovery session so we go back to a clean state
        if (supaClient) supaClient.auth.signOut();
        if (location.hash) history.replaceState(null, "", location.pathname + location.search);
        document.getElementById("cloudRecoveryForm").style.display = "none";
      }

      async function forgotPassword() {
        if (!supaClient) {
          setAuthMsg("Not connected to Supabase.", true);
          return;
        }
        const email = document.getElementById("cloudEmail").value.trim();
        if (!email) {
          setAuthMsg("Enter your email above first, then click Forgot password.", true);
          return;
        }
        setCloudStatus("syncing", "Sending reset link...");
        const { error } = await supaClient.auth.resetPasswordForEmail(email, {
          redirectTo: location.href.split("#")[0],
        });
        if (error) {
          setCloudStatus("signed-out", "Sign in to enable sync");
          setAuthMsg(error.message || "Failed to send reset email.", true);
          return;
        }
        setCloudStatus("signed-out", "Sign in to enable sync");
        setAuthMsg("Reset link sent — check your email.");
      }

      async function signInWithPassword(e) {
        if (e) e.preventDefault();
        if (!supaClient) {
          setAuthMsg("Not connected to Supabase.", true);
          return;
        }
        const email = document.getElementById("cloudEmail").value.trim();
        const password = document.getElementById("cloudPassword").value;
        if (!email || !password) {
          setAuthMsg("Email and password required.", true);
          return;
        }
        setCloudStatus("syncing", "Signing in...");
        const { error } = await supaClient.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setCloudStatus("signed-out", "Sign in to enable sync");
          setAuthMsg(error.message || "Sign-in failed.", true);
        }
        // Success path is handled by onAuthStateChange
      }

      async function signUpWithPassword() {
        if (!supaClient) {
          setAuthMsg("Not connected to Supabase.", true);
          return;
        }
        const email = document.getElementById("cloudEmail").value.trim();
        const password = document.getElementById("cloudPassword").value;
        if (!email || !password) {
          setAuthMsg("Email and password required.", true);
          return;
        }
        if (password.length < 6) {
          setAuthMsg("Password must be at least 6 characters.", true);
          return;
        }
        setCloudStatus("syncing", "Creating account...");
        const { data, error } = await supaClient.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: location.href.split("#")[0] },
        });
        if (error) {
          setCloudStatus("signed-out", "Sign in to enable sync");
          setAuthMsg(error.message || "Sign-up failed.", true);
          return;
        }
        // If email confirmation is disabled in Supabase, the user is signed in already.
        // If enabled, they'll need to click a confirmation link in their inbox.
        if (data.session) {
          setAuthMsg("Account created — you're in!");
        } else {
          setCloudStatus(
            "signed-out",
            "Confirm your email to finish signing up",
          );
          setAuthMsg("Check your inbox to confirm your email.");
        }
      }

      async function signOut() {
        if (!supaClient) return;
        await supaClient.auth.signOut();
        // onAuthStateChange listener handles the UI update
        document.getElementById("cloudPassword").value = "";
      }

      // Pull entire dataset from Supabase, replace local
      async function pullFromCloud() {
        if (!isSignedIn()) return;
        setCloudStatus("syncing", "Pulling from cloud...");
        try {
          const uid = supaUser.id;
          const [w, c, weight, ov, ex, ci, ml, sf] = await Promise.all([
            supaClient.from("workouts").select("*").eq("user_id", uid),
            supaClient.from("completions").select("*").eq("user_id", uid),
            supaClient.from("weights").select("*").eq("user_id", uid),
            supaClient.from("day_overrides").select("*").eq("user_id", uid),
            supaClient.from("exercise_logs").select("*").eq("user_id", uid),
            supaClient.from("checkins").select("*").eq("user_id", uid),
            supaClient.from("meals").select("*").eq("user_id", uid),
            supaClient.from("saved_foods").select("*").eq("user_id", uid),
          ]);
          if (w.error || c.error || weight.error || ov.error || ex.error || ci.error || ml.error || (sf && sf.error)) {
            throw w.error || c.error || weight.error || ov.error || ex.error || ci.error || ml.error || sf.error;
          }
          // Workouts — last-write-wins per date using loggedAt timestamp.
          // If the local record is newer than the cloud version, keep local
          // (e.g. logged on phone while offline before this pull ran).
          const cloudLogs = {};
          for (const r of w.data) {
            cloudLogs[r.date] = {
              date: r.date,
              distance: r.distance,
              minutes:
                r.duration_seconds != null
                  ? Math.floor(r.duration_seconds / 60)
                  : null,
              seconds:
                r.duration_seconds != null ? r.duration_seconds % 60 : null,
              durationSec: r.duration_seconds,
              paceSecPerMile: r.pace_seconds_per_mile,
              paceLabel: r.pace_label,
              avgSpeedMph: r.avg_speed_mph != null ? parseFloat(r.avg_speed_mph) : null,
              avgSpeedLabel: r.avg_speed_label,
              avgPower: r.avg_power,
              rpe: r.rpe,
              heartRate: r.heart_rate,
              notes: r.notes,
              loggedAt: r.logged_at,
            };
          }
          const mergedLogs = { ...cloudLogs };
          for (const date in LOGS) {
            const local = LOGS[date];
            const cloud = cloudLogs[date];
            if (!cloud) {
              // Local-only (not yet pushed) — preserve it; scheduleSync will push it.
              mergedLogs[date] = local;
            } else if (local.loggedAt && cloud.loggedAt && tsNewer(local.loggedAt, cloud.loggedAt)) {
              // Local record is newer — keep it.
              mergedLogs[date] = local;
            }
          }
          LOGS = mergedLogs;
          saveLogs();
          // Completions — last-write-wins per date. The timestamp rides
          // inside the sections JSONB as "__updatedAt" (stamped by
          // setSectionDone/setDayDone), so no schema change is needed.
          // Local-only dates, and local records with a newer timestamp than
          // the cloud copy, are preserved and pushed on the next sync cycle.
          const mergedCompleted = {};
          for (const r of c.data) {
            mergedCompleted[r.date] = r.sections || {};
          }
          for (const date in COMPLETED) {
            const local = COMPLETED[date];
            const cloud = mergedCompleted[date];
            if (!cloud) {
              mergedCompleted[date] = local;
              continue;
            }
            const lts = local && local !== true ? local.__updatedAt : null;
            const cts = cloud && cloud !== true ? cloud.__updatedAt : null;
            if (lts && tsNewer(lts, cts)) mergedCompleted[date] = local;
          }
          COMPLETED = mergedCompleted;
          saveCompleted(COMPLETED);
          // Weights — last-write-wins per date using loggedAt timestamp.
          const cloudWeights = {};
          for (const r of weight.data) {
            cloudWeights[r.date] = {
              date: r.date,
              weight: parseFloat(r.weight),
              bodyFat: r.body_fat != null ? parseFloat(r.body_fat) : null,
              loggedAt: r.logged_at,
            };
          }
          const mergedWeights = { ...cloudWeights };
          for (const date in WEIGHTS) {
            const local = WEIGHTS[date];
            const cloud = cloudWeights[date];
            if (!cloud) {
              mergedWeights[date] = local;
            } else if (local.loggedAt && cloud.loggedAt && tsNewer(local.loggedAt, cloud.loggedAt)) {
              mergedWeights[date] = local;
            }
          }
          WEIGHTS = mergedWeights;
          persistWeights();
          // Overrides — MERGE rather than overwrite so any local-only
          // override (e.g. a move just made by the user that hasn't been
          // pushed to cloud yet because the 1.5s sync debounce hasn't
          // fired — or because a prior push failed) survives this pull.
          // For dates present in the cloud snapshot we take the cloud
          // version (cloud is the source of truth for already-synced
          // moves); for dates only in local we keep the local entry and
          // let persistOverrides → scheduleSync push it up next cycle.
          // This is the same pattern we use for MEALS below.
          const mergedOverrides = {};
          for (const r of ov.data) {
            mergedOverrides[r.date] = {
              title: r.title,
              detail: r.detail,
              routines: r.routines,
              strength: r.strength,
              updatedAt: r.updated_at,
            };
          }
          let preservedLocalOverrides = 0;
          for (const date in OVERRIDES) {
            const local = OVERRIDES[date];
            const cloud = mergedOverrides[date];
            if (!cloud) {
              mergedOverrides[date] = local;
              preservedLocalOverrides++;
            } else if (local.updatedAt && tsNewer(local.updatedAt, cloud.updatedAt)) {
              // Local override is newer (edited on this device since the
              // cloud copy was written) — keep it; next push syncs it up.
              mergedOverrides[date] = local;
              preservedLocalOverrides++;
            }
          }
          OVERRIDES = mergedOverrides;
          if (preservedLocalOverrides > 0) {
            console.log(
              "[pullFromCloud] preserved",
              preservedLocalOverrides,
              "local-only override(s) — will be pushed on next sync"
            );
          }
          persistOverrides();
          applyOverrides();
          // Exercise logs — MERGE rather than overwrite.
          // 1. Build the cloud snapshot, including the per-set `sets`
          //    array (new column; older rows may have null/undefined).
          // 2. For each (date, routineKey, exerciseKey) tuple that
          //    exists locally but not in the cloud snapshot, keep the
          //    local entry. This protects in-progress workout logs that
          //    haven't yet been pushed (debounce window, push failure,
          //    or a session token refresh racing the save).
          const cloudEx = {};
          for (const r of ex.data) {
            if (!cloudEx[r.date]) cloudEx[r.date] = {};
            if (!cloudEx[r.date][r.routine_key]) cloudEx[r.date][r.routine_key] = {};
            cloudEx[r.date][r.routine_key][r.exercise_key] = {
              completed: r.completed,
              weight: r.weight != null ? parseFloat(r.weight) : null,
              reps: r.reps,
              notes: r.notes,
              sets: Array.isArray(r.sets) ? r.sets : (r.sets || undefined),
              updatedAt: r.updated_at,
            };
          }
          // Layer any local-only entries on top so we don't lose them.
          for (const date in EX_LOGS) {
            for (const routineKey in EX_LOGS[date]) {
              for (const exerciseKey in EX_LOGS[date][routineKey]) {
                const localLog = EX_LOGS[date][routineKey][exerciseKey];
                const cloudLog = cloudEx[date] && cloudEx[date][routineKey] && cloudEx[date][routineKey][exerciseKey];
                if (!cloudLog) {
                  if (!cloudEx[date]) cloudEx[date] = {};
                  if (!cloudEx[date][routineKey]) cloudEx[date][routineKey] = {};
                  cloudEx[date][routineKey][exerciseKey] = localLog;
                } else if (localLog.updatedAt && tsNewer(localLog.updatedAt, cloudLog.updatedAt)) {
                  // Local entry is newer than the cloud copy (e.g. logged on
                  // this device while another device pushed earlier data) —
                  // keep local; the scheduleSync below pushes it up.
                  cloudEx[date][routineKey][exerciseKey] = localLog;
                } else if (Array.isArray(localLog.sets) && !Array.isArray(cloudLog.sets)) {
                  // Cloud row exists but doesn't have a sets array yet
                  // (legacy row from before the sets column existed).
                  // Keep the local sets array so per-set history is
                  // preserved.
                  cloudLog.sets = localLog.sets;
                }
              }
            }
          }
          EX_LOGS = cloudEx;
          try { localStorage.setItem(EX_LOG_KEY, JSON.stringify(EX_LOGS)); } catch (e) {}
          // Re-push so any local-only entries we just preserved actually
          // make it to the cloud on the next sync cycle.
          if (typeof scheduleSync === "function") scheduleSync();
          // Check-ins — last-write-wins per date using updatedAt timestamp.
          const cloudCheckins = {};
          for (const r of ci.data) {
            cloudCheckins[r.date] = {
              bodyBattery: r.body_battery,
              restingHr: r.resting_hr,
              energy: r.energy,
              cyclePhase: r.cycle_phase,
              updatedAt: r.updated_at,
            };
          }
          const mergedCheckins = { ...cloudCheckins };
          for (const date in CHECKINS) {
            const local = CHECKINS[date];
            const cloud = cloudCheckins[date];
            if (!cloud) {
              mergedCheckins[date] = local;
            } else if (local.updatedAt && cloud.updatedAt && tsNewer(local.updatedAt, cloud.updatedAt)) {
              mergedCheckins[date] = local;
            }
          }
          CHECKINS = mergedCheckins;
          try { localStorage.setItem(CHECKIN_KEY, JSON.stringify(CHECKINS)); } catch (e) {}
          if (typeof renderCheckin === "function") renderCheckin();
          // Meals — MERGE rather than overwrite so any local-only meals
          // (logged but not yet pushed to cloud due to the 1.5s debounce or a
          // prior push failure) survive this pull. We treat the cloud as the
          // source of truth for any meal whose id appears there, and keep any
          // local meal whose id is NOT in the cloud snapshot.
          const cloudMealIds = new Set();
          const mergedMeals = {};
          for (const r of ml.data) {
            if (!mergedMeals[r.date]) mergedMeals[r.date] = [];
            mergedMeals[r.date].push({
              id: r.id,
              name: r.name,
              cal: r.calories,
              p: r.protein,
              c: r.carbs,
              f: r.fat,
              fiber: r.fiber,
              na: r.sodium,
              foodId: r.food_id || null,
              brand: r.brand || null,
              serving: r.serving_description || null,
              source: r.source || null,
              loggedAt: r.logged_at,
            });
            if (r.id) cloudMealIds.add(r.id);
          }
          // Preserve any local-only meals (unsynced).
          for (const date in MEALS) {
            for (const m of (MEALS[date] || [])) {
              if (m && m.id && !cloudMealIds.has(m.id)) {
                if (!mergedMeals[date]) mergedMeals[date] = [];
                mergedMeals[date].push(m);
              }
            }
          }
          MEALS = mergedMeals;
          try { localStorage.setItem(MEAL_KEY, JSON.stringify(MEALS)); } catch (e) {}
          // Saved foods — MERGE by key. Cloud is the source of truth for a
          // key unless the local copy was used more recently (last_used is
          // newer), which can happen when a scan/pick happened on this device
          // before the previous push landed. Local-only keys are preserved
          // and re-pushed on the next sync. Mirrors the MEALS merge above.
          if (sf && Array.isArray(sf.data)) {
            const mergedSaved = {};
            for (const r of sf.data) {
              mergedSaved[r.key] = {
                key: r.key,
                name: r.name, brand: r.brand || null,
                serving: r.serving || null, basis: r.basis || "unknown",
                cal: r.calories, protein_g: r.protein, carbs_g: r.carbs,
                fat_g: r.fat, fiber_g: r.fiber, sodium_mg: r.sodium,
                source: r.source || "scan", foodId: r.food_id || null,
                useCount: r.use_count || 1,
                savedAt: r.saved_at || r.last_used || new Date().toISOString(),
                lastUsed: r.last_used || new Date().toISOString(),
              };
            }
            for (const f of SAVED_FOODS) {
              const cloud = mergedSaved[f.key];
              if (!cloud || (f.lastUsed && tsNewer(f.lastUsed, cloud.lastUsed))) {
                mergedSaved[f.key] = f;
              }
            }
            SAVED_FOODS = Object.values(mergedSaved);
            try { localStorage.setItem(SAVED_FOODS_KEY, JSON.stringify(SAVED_FOODS)); } catch (e) {}
          }
          // Re-push so the local-only meals make it to the cloud on the
          // next sync cycle (the debounce queue may have been cleared by a
          // page reload between addMeal and this pull).
          if (typeof scheduleSync === "function") scheduleSync();
          if (typeof renderFuel === "function") renderFuel();
          // Re-render everything
          renderWeeks();
          renderToday();
          renderProgress();
          if (typeof renderThisWeek === "function") renderThisWeek();
          renderWeightStats();
          renderWeightChart();
          const histEl = document.getElementById("weightHistory");
          if (histEl && histEl.style.display !== "none") renderWeightHistory();
          localStorage.setItem(CLOUD_LAST_SYNC_KEY, new Date().toISOString());
          setCloudStatus("signed-in", `Signed in as ${supaUser.email}`);
          updateLastSyncDisplay();
        } catch (err) {
          console.error(err);
          setCloudStatus("error", "Pull failed: " + (err.message || err));
        }
      }

      // Push entire dataset to Supabase (upsert)
      async function pushToCloud() {
        if (!isSignedIn()) return;
        setCloudStatus("syncing", "Pushing to cloud...");
        try {
          const uid = supaUser.id;
          // Build all rows with user_id
          const workoutRows = Object.values(LOGS).map((l) => ({
            user_id: uid,
            date: l.date,
            distance: l.distance,
            duration_seconds: l.durationSec,
            pace_seconds_per_mile: l.paceSecPerMile,
            pace_label: l.paceLabel,
            avg_speed_mph: l.avgSpeedMph ?? null,
            avg_speed_label: l.avgSpeedLabel ?? null,
            avg_power: l.avgPower ?? null,
            rpe: l.rpe,
            heart_rate: l.heartRate,
            notes: l.notes,
            logged_at: l.loggedAt,
          }));
          const completionRows = Object.entries(COMPLETED).map(
            ([date, sections]) => ({
              user_id: uid,
              date,
              sections:
                typeof sections === "object" ? sections : { __legacy: true },
            }),
          );
          const weightRows = Object.values(WEIGHTS).map((w) => ({
            user_id: uid,
            date: w.date,
            weight: w.weight,
            body_fat: w.bodyFat,
            logged_at: w.loggedAt,
          }));
          const overrideRows = Object.entries(OVERRIDES).map(([date, ov]) => ({
            user_id: uid,
            date,
            title: ov.title,
            detail: ov.detail,
            routines: ov.routines,
            strength: ov.strength,
            updated_at: ov.updatedAt || null,
          }));
          // Meals (food log — one row per meal). Includes the FatSecret-
          // sourced metadata (food_id / brand / serving) when present so
          // we can re-display + potentially refresh on future syncs.
          const mealRows = [];
          for (const date in MEALS) {
            for (const m of MEALS[date]) {
              mealRows.push({
                id: m.id,
                user_id: uid,
                date,
                name: m.name,
                calories: m.cal != null ? parseInt(m.cal, 10) : null,
                protein: m.p ?? null,
                carbs: m.c ?? null,
                fat: m.f ?? null,
                fiber: m.fiber ?? null,
                sodium: m.na ?? null,
                food_id: m.foodId || null,
                brand: m.brand || null,
                serving_description: m.serving || null,
                source: m.source || (m.foodId ? "usda" : "manual"),
                logged_at: m.loggedAt || new Date().toISOString(),
              });
            }
          }
          // Saved foods (searchable pantry of scans + USDA picks). One row
          // per saved product, keyed by its stable `key` so re-scanning the
          // same product updates a single row instead of duplicating.
          const savedFoodRows = SAVED_FOODS.map((f) => ({
            user_id: uid,
            key: f.key,
            name: f.name,
            brand: f.brand || null,
            serving: f.serving || null,
            basis: f.basis || "unknown",
            calories: f.cal != null ? Math.round(f.cal) : null,
            protein: f.protein_g ?? null,
            carbs: f.carbs_g ?? null,
            fat: f.fat_g ?? null,
            fiber: f.fiber_g ?? null,
            sodium: f.sodium_mg ?? null,
            source: f.source || "scan",
            food_id: f.foodId || null,
            use_count: f.useCount || 1,
            saved_at: f.savedAt || new Date().toISOString(),
            last_used: f.lastUsed || new Date().toISOString(),
          }));
          // Check-ins (morning Body Battery, RHR, energy, cycle phase)
          const checkinRows = Object.entries(CHECKINS).map(([date, c]) => ({
            user_id: uid,
            date,
            body_battery: c.bodyBattery ?? null,
            resting_hr: c.restingHr ?? null,
            energy: c.energy ?? null,
            cycle_phase: c.cyclePhase ?? null,
            updated_at: c.updatedAt || new Date().toISOString(),
          }));
          // Flatten exercise logs into rows. Strength workouts use a
          // per-set `sets` array (each entry has reps/weight/weightUnit/
          // completed). Routine exercises use the top-level weight/reps/
          // notes/completed. We push both so a single round-trip preserves
          // either kind of log.
          const exerciseRows = [];
          for (const date in EX_LOGS) {
            for (const routineKey in EX_LOGS[date]) {
              for (const exerciseKey in EX_LOGS[date][routineKey]) {
                const log = EX_LOGS[date][routineKey][exerciseKey];
                exerciseRows.push({
                  user_id: uid, date,
                  routine_key: routineKey, exercise_key: exerciseKey,
                  completed: !!log.completed,
                  weight: log.weight ?? null,
                  reps: log.reps ?? null,
                  notes: log.notes ?? null,
                  sets: Array.isArray(log.sets) ? log.sets : null,
                  updated_at: log.updatedAt || new Date().toISOString(),
                });
              }
            }
          }
          const ops = [];
          if (workoutRows.length)
            ops.push(
              supaClient
                .from("workouts")
                .upsert(workoutRows, { onConflict: "user_id,date" }),
            );
          if (completionRows.length)
            ops.push(
              supaClient
                .from("completions")
                .upsert(completionRows, { onConflict: "user_id,date" }),
            );
          if (weightRows.length)
            ops.push(
              supaClient
                .from("weights")
                .upsert(weightRows, { onConflict: "user_id,date" }),
            );
          if (overrideRows.length)
            ops.push(
              supaClient
                .from("day_overrides")
                .upsert(overrideRows, { onConflict: "user_id,date" }),
            );
          if (exerciseRows.length)
            ops.push(
              supaClient
                .from("exercise_logs")
                .upsert(exerciseRows, { onConflict: "user_id,date,routine_key,exercise_key" }),
            );
          if (checkinRows.length)
            ops.push(
              supaClient
                .from("checkins")
                .upsert(checkinRows, { onConflict: "user_id,date" }),
            );
          if (mealRows.length)
            ops.push(
              supaClient
                .from("meals")
                .upsert(mealRows, { onConflict: "id" }),
            );
          if (savedFoodRows.length)
            ops.push(
              supaClient
                .from("saved_foods")
                .upsert(savedFoodRows, { onConflict: "user_id,key" }),
            );
          const results = await Promise.all(ops);
          for (const r of results) if (r.error) throw r.error;
          localStorage.setItem(CLOUD_LAST_SYNC_KEY, new Date().toISOString());
          setCloudStatus("signed-in", `Signed in as ${supaUser.email}`);
          updateLastSyncDisplay();
        } catch (err) {
          console.error(err);
          setCloudStatus("error", "Push failed: " + (err.message || err));
        }
      }

      // Auto-push on local change (debounced 1.5s)
      function scheduleSync() {
        if (!isSignedIn()) return;
        clearTimeout(syncTimeout);
        syncTimeout = setTimeout(pushToCloud, 1500);
      }

      // Targeted deletes (for when user removes a row entirely)
      async function cloudDelete(table, date) {
        if (!isSignedIn()) return;
        try {
          await supaClient
            .from(table)
            .delete()
            .eq("user_id", supaUser.id)
            .eq("date", date);
        } catch (err) {
          console.warn("Cloud delete failed:", err);
        }
      }

      function initCloudUI() {
        // Sign-in form: submit handler (handles both Enter key in field and Sign in button)
        document
          .getElementById("cloudAuthForm")
          .addEventListener("submit", signInWithPassword);
        document
          .getElementById("cloudSignUp")
          .addEventListener("click", signUpWithPassword);
        document
          .getElementById("cloudForgotPassword")
          .addEventListener("click", forgotPassword);
        document
          .getElementById("cloudSignOut")
          .addEventListener("click", signOut);
        // Password recovery form
        document
          .getElementById("cloudSetPassword")
          .addEventListener("click", setNewPassword);
        document
          .getElementById("cloudCancelRecovery")
          .addEventListener("click", cancelRecovery);
        // Manual sync buttons
        document
          .getElementById("cloudPullNow")
          .addEventListener("click", () => {
            if (
              !confirm(
                "Pull from cloud will REPLACE your local data with what's in Supabase. Continue?",
              )
            )
              return;
            pullFromCloud();
          });
        document
          .getElementById("cloudPushNow")
          .addEventListener("click", pushToCloud);
        // Refresh "X minutes ago" display every minute
        setInterval(updateLastSyncDisplay, 60000);
        // Connect using the hardcoded credentials at the top of the script
        initSupabase();
      }

      // ---------- Data export / import ----------
      function csvEscape(val) {
        if (val === null || val === undefined) return "";
        const s = String(val);
        if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      }
      function rowsToCsv(headers, rows) {
        const lines = [headers.map(csvEscape).join(",")];
        for (const r of rows) lines.push(r.map(csvEscape).join(","));
        return lines.join("\n");
      }
      function downloadFile(filename, content, mime) {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      function dataStatusMsg(msg, isError) {
        const el = document.getElementById("dataStatus");
        if (!el) return;
        el.style.color = isError ? "#B85450" : "var(--p1)";
        el.textContent = msg;
        setTimeout(() => {
          if (el && el.textContent === msg) el.textContent = "";
        }, 3000);
      }

      function exportWorkoutLogs() {
        const headers = [
          "date",
          "day_of_week",
          "week_num",
          "planned_title",
          "planned_detail",
          "distance_mi",
          "duration_min_sec",
          "pace_per_mile",
          "avg_speed_mph",
          "avg_power_w",
          "rpe",
          "heart_rate_avg",
          "notes",
          "logged_at",
        ];
        // Day-by-date map for context
        const dayMap = {};
        for (const w of DATA.weeks)
          for (const d of w.days) dayMap[d.date] = { day: d, week: w };
        const dates = Object.keys(LOGS).sort();
        const rows = dates.map((date) => {
          const log = LOGS[date];
          const ctx = dayMap[date] || {};
          const d = ctx.day || {},
            w = ctx.week || {};
          const dur =
            log.minutes != null && log.seconds != null
              ? `${log.minutes}:${String(log.seconds).padStart(2, "0")}`
              : log.minutes != null
                ? String(log.minutes)
                : "";
          return [
            date,
            d.day_name || "",
            w.num || "",
            d.title || "",
            d.detail || "",
            log.distance ?? "",
            dur,
            log.paceLabel || "",
            log.avgSpeedMph != null ? log.avgSpeedMph.toFixed(2) : "",
            log.avgPower ?? "",
            log.rpe ?? "",
            log.heartRate ?? "",
            log.notes || "",
            log.loggedAt || "",
          ];
        });
        if (!rows.length) {
          dataStatusMsg("No workout logs to export yet.", true);
          return;
        }
        downloadFile(
          "katie-workout-logs.csv",
          rowsToCsv(headers, rows),
          "text/csv;charset=utf-8",
        );
        dataStatusMsg(
          `Exported ${rows.length} workout log${rows.length === 1 ? "" : "s"}.`,
        );
      }

      function exportWeightLogs() {
        const headers = [
          "date",
          "weight_lb",
          "body_fat_pct",
          "delta_from_start_lb",
          "logged_at",
        ];
        const rows = sortedWeights().map((w) => [
          w.date,
          w.weight,
          w.bodyFat ?? "",
          (w.weight - WEIGHT_START).toFixed(1),
          w.loggedAt || "",
        ]);
        if (!rows.length) {
          dataStatusMsg("No weight entries to export yet.", true);
          return;
        }
        downloadFile(
          "katie-weight-log.csv",
          rowsToCsv(headers, rows),
          "text/csv;charset=utf-8",
        );
        dataStatusMsg(
          `Exported ${rows.length} weight entr${rows.length === 1 ? "y" : "ies"}.`,
        );
      }

      function exportCompletions() {
        const headers = [
          "date",
          "day_of_week",
          "week_num",
          "phase",
          "category",
          "planned_title",
          "sections_completed",
          "sections_total",
          "sections_done_count",
          "all_complete",
        ];
        const rows = [];
        for (const w of DATA.weeks) {
          for (const d of w.days) {
            const counts = sectionCounts(d);
            const cat = categorize(d);
            const sectionsDone = getSections(d).filter((s) =>
              isSectionDone(d, s),
            );
            rows.push([
              d.date,
              d.day_name,
              w.num,
              w.phase,
              cat,
              d.title,
              sectionsDone.join(";"),
              counts.total,
              counts.done,
              isDone(d) ? "yes" : "no",
            ]);
          }
        }
        downloadFile(
          "katie-completion-log.csv",
          rowsToCsv(headers, rows),
          "text/csv;charset=utf-8",
        );
        dataStatusMsg(`Exported ${rows.length} day records.`);
      }

      function backupAll() {
        const backup = {
          version: 1,
          app: "katie-mile-training",
          exportedAt: new Date().toISOString(),
          completed: COMPLETED,
          workoutLogs: LOGS,
          weights: WEIGHTS,
          overrides: OVERRIDES,
          exerciseLogs: EX_LOGS,
          checkins: CHECKINS,
          meals: MEALS,
          savedFoods: SAVED_FOODS,
          fuelPrefs: FUEL_PREFS,
        };
        const date = new Date().toISOString().slice(0, 10);
        downloadFile(
          `katie-training-backup-${date}.json`,
          JSON.stringify(backup, null, 2),
          "application/json",
        );
        dataStatusMsg("Full backup downloaded.");
      }

      function restoreBackup(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            if (data.app !== "katie-mile-training") {
              if (
                !confirm(
                  "This file isn't a recognized training backup. Try to restore anyway?",
                )
              )
                return;
            }
            if (
              !confirm(
                "Restoring will REPLACE all current data (completed checkmarks, workout logs, weight log). Continue?",
              )
            )
              return;
            if (data.completed) {
              COMPLETED = data.completed;
              saveCompleted(COMPLETED);
            }
            if (data.workoutLogs) {
              LOGS = data.workoutLogs;
              saveLogs();
            }
            if (data.weights) {
              WEIGHTS = data.weights;
              persistWeights();
            }
            if (data.overrides) {
              OVERRIDES = data.overrides;
              persistOverrides();
              applyOverrides();
            }
            if (data.exerciseLogs) {
              EX_LOGS = data.exerciseLogs;
              try { localStorage.setItem(EX_LOG_KEY, JSON.stringify(EX_LOGS)); } catch (e) {}
            }
            if (data.checkins) {
              CHECKINS = data.checkins;
              try { localStorage.setItem(CHECKIN_KEY, JSON.stringify(CHECKINS)); } catch (e) {}
              if (typeof renderCheckin === "function") renderCheckin();
            }
            if (data.meals) {
              MEALS = data.meals;
              try { localStorage.setItem(MEAL_KEY, JSON.stringify(MEALS)); } catch (e) {}
              if (typeof renderFuel === "function") renderFuel();
            }
            if (data.savedFoods) {
              SAVED_FOODS = data.savedFoods;
              try { localStorage.setItem(SAVED_FOODS_KEY, JSON.stringify(SAVED_FOODS)); } catch (e) {}
            }
            if (data.fuelPrefs) {
              FUEL_PREFS = data.fuelPrefs;
              try { localStorage.setItem(FUEL_PREFS_KEY, JSON.stringify(FUEL_PREFS)); } catch (e) {}
            }
            // Re-render everything
            renderWeeks();
            renderToday();
            renderProgress();
            renderWeightStats();
            renderWeightChart();
            const histEl = document.getElementById("weightHistory");
            if (histEl && histEl.style.display !== "none")
              renderWeightHistory();
            dataStatusMsg("Backup restored successfully.");
          } catch (err) {
            dataStatusMsg("Restore failed - file isn't valid JSON.", true);
          }
        };
        reader.readAsText(file);
      }

      function initDataExport() {
        const eW = document.getElementById("exportWorkouts");
        const eWt = document.getElementById("exportWeights");
        const eC = document.getElementById("exportCompletions");
        const bA = document.getElementById("backupAll");
        const rF = document.getElementById("restoreFile");
        if (eW) eW.addEventListener("click", exportWorkoutLogs);
        if (eWt) eWt.addEventListener("click", exportWeightLogs);
        if (eC) eC.addEventListener("click", exportCompletions);
        if (bA) bA.addEventListener("click", backupAll);
        if (rF)
          rF.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) restoreBackup(file);
            rF.value = "";
          });
      }

      // ---------- Reset progress ----------
      document.getElementById("resetProgress").addEventListener("click", () => {
        if (
          !confirm(
            "Clear ALL completed-workout checkmarks? This cannot be undone.",
          )
        )
          return;
        COMPLETED = {};
        saveCompleted(COMPLETED);
        renderWeeks();
        renderToday();
        renderProgress();
        if (typeof renderThisWeek === "function") renderThisWeek();
        // Day content/completion changed — today's Fuel targets may shift too.
        if (typeof renderFuel === "function") renderFuel();
      });


      // ==================================================================
      // Performance features: race predictor, training paces, readiness
      // nudge, weekly recap.
      // Projections use Daniels' VDOT model (O2 cost + %VO2max curve). It's
      // distance-aware and far more accurate across 5K–half than a single
      // Riegel exponent. The mile is the model's weak spot at short durations,
      // so the mile (and every target) is projected from your nearest REAL
      // result whenever you have one — personal calibration; see projectTarget.
      // ==================================================================
      // Distance constants (MILE_M, MI_MILE, MI_5K, MI_HALF, …) and the VDOT
      // engine / time formatters now live in lib/training-math.js, which loads
      // before this script and shares the global scope. See that file.
      const GOAL_MILE_SEC = 6 * 60;   // Sub-6:00 mile (Copenhagen B-race)
      const GOAL_HALF_SEC = 105 * 60; // Sub-1:45 half (Dresden A-race)
      const GARMIN_VO2MAX = 48; // from your watch — shown as a cross-check only;
                                // race-derived VDOT drives the actual projections.
      const TT_KEY = "katie-mile-tt-result";    // legacy single result (auto-migrated)
      const RESULTS_KEY = "katie-mile-results";  // list of real races / time trials
      const RESULTS_SEED_KEY = "katie-mile-results-seeded";
      const RECAP_DISMISS_KEY = "katie-mile-recap-dismissed";

      // Garmin race-predictor baseline (entered on request) — seeds the
      // predictor once so it mirrors Garmin until you log real results. Cleared
      // results won't be re-seeded (a flag is set on first load).
      const GARMIN_BASELINE = [
        { distance: 3.106855,  seconds: 22 * 60 + 3,             date: "2026-06-16" }, // 5K  22:03
        { distance: 6.213712,  seconds: 47 * 60 + 1,             date: "2026-06-16" }, // 10K 47:01
        { distance: 13.109375, seconds: 113 * 60 + 9,            date: "2026-06-16" }, // Half 1:53:09
        { distance: 26.21875,  seconds: 4 * 3600 + 26 * 60 + 59, date: "2026-06-16" }, // Marathon 4:26:59
      ];

      // VDOT engine (pctVO2max, o2Cost, vdotOf, timeAtVdot) and fmtRaceTime
      // now live in lib/training-math.js (loaded first, shared global scope).

      // Saved real results (races / time trials) — a list, so calibration can
      // use several efforts at once (e.g. a mile and a long race).
      function loadResults() {
        let list = [];
        try { list = JSON.parse(localStorage.getItem(RESULTS_KEY)) || []; } catch (e) { list = []; }
        if (!Array.isArray(list)) list = [];
        // One-time migration of the old single time-trial entry.
        if (!list.length) {
          try {
            const old = JSON.parse(localStorage.getItem(TT_KEY));
            if (old && old.distance && old.seconds) {
              list = [{ distance: +old.distance, seconds: +old.seconds, date: old.date || todayISO() }];
              localStorage.setItem(RESULTS_KEY, JSON.stringify(list));
            }
          } catch (e) {}
        }
        // One-time seed of the Garmin baseline so the predictor mirrors Garmin
        // out of the box. The flag means clearing results won't re-seed them.
        if (!list.length && !localStorage.getItem(RESULTS_SEED_KEY)) {
          list = GARMIN_BASELINE.map((r) => ({ ...r }));
          localStorage.setItem(RESULTS_KEY, JSON.stringify(list));
        }
        try { localStorage.setItem(RESULTS_SEED_KEY, "1"); } catch (e) {}
        return list;
      }
      function saveResults(list) {
        try { localStorage.setItem(RESULTS_KEY, JSON.stringify(list)); } catch (e) {}
      }

      // Gather candidate efforts. REAL results (races/TTs you enter) are
      // trusted at any distance. Logged training runs are soft proxies, used
      // only when sustained (>=1.5 mi) so a short fast rep can't over-rate
      // fitness; the best (fastest-equivalent) one wins so easy jogs don't
      // drag it down. Each effort carries its VDOT.
      function gatherEfforts() {
        const results = loadResults()
          .filter((r) => r && +r.distance >= 0.5 && +r.seconds > 0)
          .map((r) => ({ distMi: +r.distance, sec: +r.seconds, date: r.date || todayISO(),
                         genuine: true, vdot: vdotOf(+r.distance, +r.seconds) }));
        const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 60);
        const cutoffISO = cutoff.toISOString().slice(0, 10);
        const logged = [];
        for (const date in LOGS) {
          const l = LOGS[date];
          if (!l || !l.distance || !l.durationSec) continue;
          if (l.avgSpeedMph != null) continue;            // bike — not a run-fitness signal
          const d = parseFloat(l.distance);
          if (!d || d < 1.5 || date < cutoffISO) continue; // sustained efforts only
          logged.push({ distMi: d, sec: l.durationSec, date, genuine: false, vdot: vdotOf(d, l.durationSec) });
        }
        return { results, logged };
      }
      // Overall fitness = the highest VDOT among sustained efforts (best wins).
      function fitnessVdot(eff) {
        let pool = [...eff.results.filter((e) => e.distMi >= 1.5),
                    ...eff.logged.filter((e) => e.distMi >= 3)];
        if (!pool.length) pool = [...eff.results, ...eff.logged]; // relax if nothing sustained
        if (!pool.length) return null;
        return pool.reduce((b, e) => (e.vdot > b.vdot ? e : b));
      }
      // Project one target distance. Prefer a REAL result within ~2x of that
      // distance so the mile anchors to your real mile and the half to a real
      // long effort (personal calibration); otherwise estimate from fitness.
      function projectTarget(targetMi, eff, fitV) {
        // Calibrate from a real result within ~2.2x of the target distance —
        // wide enough that a 10K calibrates the half, narrow enough that a
        // mile never "calibrates" the half.
        const LOGWIN = Math.log(2.2);
        const near = eff.results
          .map((e) => ({ e, d: Math.abs(Math.log(e.distMi / targetMi)) }))
          .filter((x) => x.d <= LOGWIN + 1e-9)
          .sort((a, b) => a.d - b.d)[0];
        if (near) return { sec: timeAtVdot(targetMi, near.e.vdot), vdot: near.e.vdot, ref: near.e, calibrated: true };
        if (fitV) return { sec: timeAtVdot(targetMi, fitV.vdot), vdot: fitV.vdot, ref: fitV, calibrated: false };
        return null;
      }
      function currentProjections() {
        const eff = gatherEfforts();
        if (!eff.results.length && !eff.logged.length) return null;
        const fitV = fitnessVdot(eff);
        const mile = projectTarget(MI_MILE, eff, fitV);
        const fiveK = projectTarget(MI_5K, eff, fitV);
        const half = projectTarget(MI_HALF, eff, fitV);
        if (!mile && !fiveK && !half) return null;
        return {
          eff, fitV, mile, fiveK, half,
          // back-compat scalar fields used by paceZones()
          mileSec: mile ? mile.sec : null,
          fiveKSec: fiveK ? fiveK.sec : null,
          halfSec: half ? half.sec : null,
        };
      }

      // ---------- Race predictor card (Trends) ----------
      function predTile(label, sec, goalSec, goalLbl, calibrated) {
        let goal = "";
        if (goalSec) {
          const diff = Math.round(sec - goalSec);
          goal = diff <= 0
            ? `<div class="pred-goal ahead">On track for ${goalLbl}</div>`
            : `<div class="pred-goal behind">${goalLbl} +${fmtRaceTime(diff)}</div>`;
        }
        const tag = calibrated
          ? ` <span class="pred-cal" title="Calibrated to a real result near this distance">✓</span>`
          : ` <span class="pred-est" title="Estimated from your overall fitness — add a real result at this distance to calibrate">~</span>`;
        return `<div class="pred-tile"><div class="pred-time">${fmtRaceTime(sec)}</div><div class="pred-lbl">${label}${tag}</div>${goal}</div>`;
      }
      // parseTimeToSec now lives in lib/training-math.js (shared global scope).
      let ttWired = false;
      function wireTTForm() {
        if (ttWired) return;
        const save = document.getElementById("ttSave");
        const clear = document.getElementById("ttClear");
        if (!save || !clear) return;
        ttWired = true;
        save.addEventListener("click", () => {
          const dist = parseFloat(document.getElementById("ttDistance").value);
          const sec = parseTimeToSec(document.getElementById("ttTime").value);
          const date = document.getElementById("ttDate").value || todayISO();
          if (!dist || dist <= 0 || !sec || sec <= 0) {
            showToast("Enter a distance in miles and a time like 22:45 (or 1:45:00).", "error");
            return;
          }
          const list = loadResults();
          list.push({ distance: dist, seconds: sec, date });
          saveResults(list);
          document.getElementById("ttDistance").value = "";
          document.getElementById("ttTime").value = "";
          showToast("Result saved — projections updated.");
          renderRacePredictor();
          renderToday();
        });
        clear.addEventListener("click", () => {
          saveResults([]);
          try { localStorage.removeItem(TT_KEY); } catch (e) {}
          showToast("All results cleared.");
          renderRacePredictor();
          renderToday();
        });
      }
      // Render the saved-results list with per-item remove buttons.
      function renderResultsList() {
        const note = document.getElementById("ttNote");
        if (!note) return;
        const list = loadResults();
        if (!list.length) {
          note.textContent = "No results saved yet. For best accuracy add a mile and a longer effort (e.g. a 5K or 10K).";
          return;
        }
        note.innerHTML = `<div class="tt-list">` + list.map((r, i) =>
          `<div class="tt-item"><span>${r.distance} mi · ${fmtRaceTime(r.seconds)} · ${r.date || ""}</span>` +
          `<button type="button" class="tt-del" data-idx="${i}" title="Remove">×</button></div>`).join("") + `</div>`;
        note.querySelectorAll(".tt-del").forEach((b) => b.addEventListener("click", () => {
          const l = loadResults();
          l.splice(parseInt(b.dataset.idx, 10), 1);
          saveResults(l);
          renderRacePredictor();
          renderToday();
        }));
      }
      function renderRacePredictor() {
        const grid = document.getElementById("predGrid");
        const meta = document.getElementById("predMeta");
        if (!grid || !meta) return;
        wireTTForm();
        renderResultsList();
        const proj = currentProjections();
        if (!proj) {
          meta.textContent = "Log a run (or add a race / time-trial result below) to see projections.";
          grid.innerHTML = "";
          renderPacesCard(null);
          return;
        }
        const tiles = [];
        if (proj.mile)  tiles.push(predTile("Mile", proj.mile.sec, GOAL_MILE_SEC, "Sub-6:00", proj.mile.calibrated));
        if (proj.fiveK) tiles.push(predTile("5K", proj.fiveK.sec, null, "", proj.fiveK.calibrated));
        if (proj.half)  tiles.push(predTile("Half", proj.half.sec, GOAL_HALF_SEC, "Sub-1:45", proj.half.calibrated));
        grid.innerHTML = tiles.join("");
        const fit = proj.fitV;
        const calAny = [proj.mile, proj.fiveK, proj.half].some((p) => p && p.calibrated);
        let m = "";
        if (fit) {
          m = `Fitness estimate: VDOT ${fit.vdot.toFixed(1)} from your best sustained effort — ` +
              `${fit.distMi.toFixed(1)} mi in ${fmtRaceTime(fit.sec)} ` +
              `(${fit.genuine ? "result" : "logged run"}, ${fmtDate(fit.date, { month: "short", day: "numeric" })}). `;
        }
        m += calAny
          ? `Tiles marked ✓ are calibrated to a real result near that distance; ~ are estimated.`
          : `Add real results below — a mile and a longer effort — to calibrate (✓) instead of estimate (~).`;
        if (fit) m += ` · Watch VO2max ≈ ${GARMIN_VO2MAX} (vs race-based VDOT ${fit.vdot.toFixed(0)} — watch estimates usually read a touch high).`;
        meta.innerHTML = m;
        renderPacesCard(proj);
      }

      // ---------- Training paces (Daniels-style offsets from 5K pace) ----------
      // Hybrid training paces:
      //   • SPEED (interval/5K + mile/rep) are pinned to the NRC pace-chart
      //     "mile best" row you train off (default 6:30) — matches your speed.
      //   • ENDURANCE (easy, long, tempo, half) are anchored to your CURRENT
      //     fitness via the half projection, so easy stays truly easy. They
      //     speed up on their own as you log faster results.
      const NRC_PACE_ROWS = {
        // sec/mile from the NRC chart: mile best, 5K avg, 10K avg, tempo, half avg, recovery
        "6:00": { mile: 360, fiveK: 390, tenK: 405, tempo: 425, half: 435, recovery: 490 },
        "6:30": { mile: 390, fiveK: 425, tenK: 440, tempo: 460, half: 455, recovery: 525 },
        "7:00": { mile: 420, fiveK: 460, tenK: 475, tempo: 495, half: 500, recovery: 560 },
      };
      const NRC_ROW = "6:30";
      function paceZones(proj) {
        const row = NRC_PACE_ROWS[NRC_ROW] || NRC_PACE_ROWS["6:30"];
        // Endurance anchor: current half pace (calibrated to your Garmin/real
        // results); fall back to the NRC row's half pace if there's no data.
        const halfPace = (proj && proj.halfSec != null) ? proj.halfSec / MI_HALF : row.half;
        return {
          easy: [halfPace + 75, halfPace + 120],
          long: [halfPace + 45, halfPace + 90],
          half: [halfPace, null],
          tempo: [halfPace - 25, halfPace - 10],
          interval: [row.fiveK, null], // NRC 6:30 row — your speed
          mile: [row.mile, null],      // NRC 6:30 row — your speed
        };
      }
      function fmtZone(z) {
        if (!z) return "—";
        return z[1]
          ? `${fmtPace(z[0]).replace("/mi", "")}–${fmtPace(z[1])}`
          : fmtPace(z[0]);
      }
      function renderPacesCard(proj) {
        const card = document.getElementById("pacesCard");
        const rows = document.getElementById("pacesRows");
        const meta = document.getElementById("pacesMeta");
        if (!card || !rows) return;
        const z = paceZones(proj);
        if (!z) { card.style.display = "none"; return; }
        card.style.display = "";
        if (meta) meta.textContent = "Speed (mile, interval) from the NRC mile-best 6:30 row; easy/long/tempo/half from your current fitness. Endurance paces speed up as you log faster results.";
        const order = [
          ["Easy / recovery", z.easy],
          ["Long run", z.long],
          ["Half race pace", z.half],
          ["Tempo / threshold", z.tempo],
          ["Interval (VO2)", z.interval],
          ["Mile / rep pace", z.mile],
        ];
        rows.innerHTML = order
          .filter(([, zz]) => zz)
          .map(([lbl, zz]) => `<div class="pace-row"><span>${lbl}</span><b>${fmtZone(zz)}</b></div>`)
          .join("");
      }

      // Pace hint chip on the Today card, keyed off the workout text.
      function paceHintForDay(day) {
        const z = paceZones(currentProjections());
        if (!z) return null;
        const t = (day.title + " " + day.detail).toUpperCase();
        const cat = categorize(day);
        if (cat === "rest" || cat === "bike" || cat === "race") return null;
        if (cat === "quality" && z.mile && /MILE-PACE|MILE PACE|400|800|REP/.test(t))
          return `Mile/rep ${fmtZone(z.mile)} · Interval ${fmtZone(z.interval)}`;
        if (/TRACK:|VO2|FARTLEK/.test(t)) return `Interval ${fmtZone(z.interval)}`;
        if (/TEMPO|THRESHOLD/.test(t)) return `Tempo ${fmtZone(z.tempo)}`;
        if (z.half && /RACE-PACE|HALF PACE|HMP/.test(t)) return `Half pace ${fmtZone(z.half)}`;
        if (cat === "long") return `Long-run pace ${fmtZone(z.long)}`;
        if (cat === "easy") return `Easy pace ${fmtZone(z.easy)}`;
        return null;
      }
      function renderTodayPaceHint(day) {
        const detailEl = document.getElementById("todayDetail");
        if (!detailEl) return;
        const old = document.getElementById("todayPaceHint");
        if (old) old.remove();
        if (!day) return;
        const hint = paceHintForDay(day);
        if (!hint) return;
        const el = document.createElement("div");
        el.id = "todayPaceHint";
        el.className = "today-pace-hint";
        el.textContent = `Target: ${hint}`;
        detailEl.insertAdjacentElement("afterend", el);
      }

      // ---------- Readiness nudge (quality/long days) ----------
      // Rolling RHR baseline: mean of the last 28 logged values before
      // `beforeDate`. Needs >=5 values so one odd morning can't define it.
      function rhrBaseline(beforeDate) {
        const vals = [];
        for (const date in CHECKINS) {
          if (date >= beforeDate) continue;
          const v = CHECKINS[date].restingHr;
          if (v != null) vals.push({ date, v });
        }
        vals.sort((a, b) => a.date.localeCompare(b.date));
        const recent = vals.slice(-28).map((x) => x.v);
        if (recent.length < 5) return null;
        return recent.reduce((a, b) => a + b, 0) / recent.length;
      }
      // Timezone-safe date arithmetic on ISO strings (parseISO is local).
      function addDaysISO(iso, n) {
        const d = parseISO(iso);
        d.setDate(d.getDate() + n);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      }
      function renderReadiness(day) {
        const slot = document.getElementById("readinessSlot");
        if (!slot) return;
        slot.innerHTML = "";
        if (!day || day.date !== todayISO()) return; // only for the real today
        const cat = categorize(day);
        if (cat !== "quality" && cat !== "long") return;
        const ci = CHECKINS[day.date];
        if (!ci) return;
        const reasons = [];
        const base = rhrBaseline(day.date);
        if (base && ci.restingHr != null && ci.restingHr - base >= Math.max(4, base * 0.06)) {
          reasons.push(`resting HR ${ci.restingHr} vs ~${Math.round(base)} baseline`);
        }
        if (ci.energy != null && ci.energy <= 3) reasons.push(`energy ${ci.energy}/10`);
        if (ci.bodyBattery != null && ci.bodyBattery <= 25) reasons.push(`body battery ${ci.bodyBattery}`);
        if (!reasons.length) return;
        // Offer a one-tap swap with the next easy day (within 3 days).
        let swapDate = null;
        for (let i = 1; i <= 3; i++) {
          const cand = addDaysISO(day.date, i);
          const cd = findDay(cand);
          if (cd && categorize(cd) === "easy") { swapDate = cand; break; }
        }
        const banner = document.createElement("div");
        banner.className = "readiness-banner";
        banner.innerHTML =
          `<div class="rb-text"><b>Recovery flag:</b> ${reasons.join(" · ")}. ` +
          `Today is a ${cat} day — consider keeping it easy and hitting the hard session when you're fresher.</div>` +
          (swapDate ? `<button class="btn rb-swap" type="button">Swap with ${fmtDate(swapDate, { weekday: "short" })} (easy)</button>` : "");
        const swapBtn = banner.querySelector(".rb-swap");
        if (swapBtn) {
          swapBtn.addEventListener("click", () => {
            swapDays(day.date, swapDate);
            showToast(`Swapped today with ${fmtDate(swapDate, { weekday: "long" })}.`);
          });
        }
        slot.appendChild(banner);
      }

      // ---------- Weekly recap ----------
      function lastCompletedWeek() {
        const today = todayISO();
        let last = null;
        for (const w of DATA.weeks) {
          const end = w.days[w.days.length - 1].date;
          if (end < today) last = w;
        }
        return last;
      }
      function recapStats(week) {
        let workouts = 0;
        for (const d of week.days) {
          const l = LOGS[d.date];
          if (l && (l.distance || l.durationSec)) workouts++;
        }
        let done = 0, total = 0;
        for (const d of week.days) {
          const c = sectionCounts(d);
          done += c.done;
          total += c.total;
        }
        const first = week.days[0].date, lastD = week.days[week.days.length - 1].date;
        const wDates = Object.keys(WEIGHTS).filter((x) => x >= first && x <= lastD).sort();
        const wDelta = wDates.length >= 2
          ? WEIGHTS[wDates[wDates.length - 1]].weight - WEIGHTS[wDates[0]].weight
          : null;
        return {
          miles: actualWeekMiles(week),
          planned: week.mileage,
          workouts,
          pct: total ? Math.round((done / total) * 100) : 0,
          wDelta,
        };
      }
      function recapHTML(week, s, dismissible) {
        const milesCls = s.miles >= week.mileage * 0.85 ? "good" : "low";
        const wTxt = s.wDelta == null ? "—" : `${s.wDelta > 0 ? "+" : ""}${s.wDelta.toFixed(1)} lb`;
        return `
          <div class="recap-head">
            <h3>Week ${week.num} recap</h3>
            ${dismissible ? `<button class="recap-dismiss" type="button" aria-label="Dismiss">✕</button>` : ""}
          </div>
          <div class="recap-grid">
            <div class="recap-tile"><b class="${milesCls}">${s.miles.toFixed(1)}</b><span>of ${s.planned} planned mi</span></div>
            <div class="recap-tile"><b>${s.pct}%</b><span>sections done</span></div>
            <div class="recap-tile"><b>${s.workouts}</b><span>workouts logged</span></div>
            <div class="recap-tile"><b>${wTxt}</b><span>weight</span></div>
          </div>`;
      }
      // Trends card — always visible once a full plan week has elapsed.
      function renderRecap() {
        const card = document.getElementById("recapCard");
        if (!card) return;
        const week = lastCompletedWeek();
        if (!week) { card.style.display = "none"; return; }
        card.style.display = "";
        card.innerHTML = recapHTML(week, recapStats(week), false);
      }
      // Today slot — surfaces Mon–Wed only, dismissible per week.
      function renderRecapToday() {
        const slot = document.getElementById("weeklyRecapSlot");
        if (!slot) return;
        slot.innerHTML = "";
        const week = lastCompletedWeek();
        if (!week) return;
        const dow = new Date().getDay(); // 1=Mon ... 3=Wed
        if (dow < 1 || dow > 3) return;
        if (localStorage.getItem(`${RECAP_DISMISS_KEY}:${week.num}`)) return;
        const card = document.createElement("div");
        card.className = "recap-card";
        card.innerHTML = recapHTML(week, recapStats(week), true);
        card.querySelector(".recap-dismiss").addEventListener("click", () => {
          localStorage.setItem(`${RECAP_DISMISS_KEY}:${week.num}`, "1");
          slot.innerHTML = "";
        });
        slot.appendChild(card);
      }

      // ---------- Boot ----------
      // Snapshot original DATA before applying any overrides (needed for "reset plan")
      snapshotOriginalDays();
      applyOverrides();
      // Layer the runner-core routine onto Tuesday + Friday after overrides apply
      injectCoreRoutine();
      // Layer a short plyo block onto quality days in phases 1-3 (skipped during
      // peak + taper). Builds tendon stiffness + economy for the mile.
      injectPlyometrics();
      // Re-apply theme so the toggle button picks up its label/icon
      applyTheme(loadTheme());
      document
        .getElementById("themeToggle")
        .addEventListener("click", toggleTheme);
      // Wire reset-plan button
      document.getElementById("resetPlan").addEventListener("click", resetPlan);
      // Esc cancels any armed swap
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") clearSwapArmed();
      });

      renderCountdown();
      renderPhaseBar();
      renderMilesChart();
      renderWeeks();
      renderToday();
      renderProgress();
      renderWeightStats();
      renderWeightChart();
      initWeightForm();
      initDataExport();
      initCloudUI();
      initCheckin();
      initFuel();
      // ── European decimal comma support ───────────────────────
      // Replaces comma with period in real-time on any decimal input
      // so parseFloat() always works regardless of keyboard locale.
      document.addEventListener("input", (e) => {
        const el = e.target;
        if (el.inputMode === "decimal" && el.value.includes(",")) {
          const pos = el.selectionStart;
          el.value = el.value.replace(/,/g, ".");
          try { el.setSelectionRange(pos, pos); } catch(_) {}
        }
      });

      function parseDecimal(val) {
        if (val === undefined || val === null) return NaN;
        return parseFloat(String(val).replace(",", "."));
      }

      initStrava();
      initTabs();
      renderThisWeek();
      fillRef();

      // scroll to current week if visible
      const now = todayClampedISO();
      for (const w of DATA.weeks) {
        if (now >= w.start_date && now <= w.end_date) {
          setTimeout(() => {
            const t = document.getElementById(`week-${w.num}`);
            if (t) t.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 200);
          break;
        }
      }

      // ---------- PWA: register service worker ----------
      // Service workers only work over HTTPS or localhost (browser security rule).
      // If you're opening this file directly (file://), the page still works fully —
      // it just won't be offline-installable until you host it somewhere like Netlify or GitHub Pages.
      if (
        "serviceWorker" in navigator &&
        (location.protocol === "https:" ||
          location.hostname === "localhost" ||
          location.hostname === "127.0.0.1")
      ) {
        // Holds a reference to a waiting SW so swUpdateAndReload() can activate it.
        let _waitingSW = null;

        function showUpdateBanner(sw) {
          _waitingSW = sw;
          const banner = document.getElementById("sw-update-banner");
          if (banner) banner.classList.add("visible");
        }

        window.swUpdateAndReload = function () {
          if (_waitingSW) {
            _waitingSW.postMessage({ type: "SKIP_WAITING" });
            navigator.serviceWorker.addEventListener("controllerchange", () => {
              window.location.reload();
            });
          } else {
            window.location.reload();
          }
        };

        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("./sw.js")
            .then((reg) => {
              console.log("[PWA] Service worker registered:", reg.scope);

              // New SW installed while the page is open (e.g. after a deploy).
              reg.addEventListener("updatefound", () => {
                const newSW = reg.installing;
                if (!newSW) return;
                newSW.addEventListener("statechange", () => {
                  if (newSW.state === "installed" && navigator.serviceWorker.controller) {
                    showUpdateBanner(newSW);
                  }
                });
              });

              // SW was already waiting when the page loaded (tab open across a deploy).
              if (reg.waiting && navigator.serviceWorker.controller) {
                showUpdateBanner(reg.waiting);
              }
            })
            .catch((err) => {
              console.warn("[PWA] Service worker registration failed:", err);
            });
        });
      }
