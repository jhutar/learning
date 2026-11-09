# World Mountains Trainer

Single-page, frontend-only web app (no build step, no dependencies) for training
the geographic location of the world's biggest mountain ranges. Designed to run
on GitHub Pages.

## How to run

Must be served over HTTP (`fetch()` does not work from `file://`):

```bash
cd world-mountains && python3 -m http.server 8000
# open http://localhost:8000
```

## Game rules (agreed spec)

- **Session** starts automatically on page load. Each range is scheduled
  `ASKS_PER_RANGE = 2` times. Session ends when every range has been answered
  correctly at least once and the retry queue is drained.
- **3 question types**, chosen fully at random (no type-repetition rule):
  1. Target range highlighted on the map; user clicks 1 of 5 shuffled name
     buttons (target + 4 random distractors, no A-E letters).
  2. "Where is X?" — candidate set = all N ranges (the hard variant).
  3. "Where is X?" — candidate set = 5 random ranges including target (easier
     once N > 5; identical to type 2 while N = 5). Non-candidates are dimmed
     and unclickable.
- **Correct answer:** green pulse ring + ✔ pop (~700 ms), then auto-advance.
- **Wrong answer:** clicked ellipse flashes red, correct ellipse glows green,
  question bar shows "Correct answer: X", Next button appears. That range is
  re-asked after 3 other questions (immediately if fewer than 3 remain).
- **Header** shows live pass/fail counters. "New session" button resets
  counters, builds a fresh queue, auto-starts. Session-complete overlay shows
  final score.
- **Language:** English UI.

## Adding a mountain range

Two edits, nothing else:

1. `app.js` — append to the `RANGES` array at the top:
   `{ id: "el-6", name: "Karakorum" },`
2. `assets/markers.svg` — add the ellipse (viewBox is `0 0 1000 500`,
   equirectangular: `x = (lon + 180) / 360 * 1000`, `y = (90 - lat) / 180 * 500`):
   `<ellipse id="el-6" cx="705" cy="165" rx="22" ry="12"/>`

Current ranges: `el-1` Himalaya, `el-2` Andes, `el-3` Rockies, `el-4` Ural,
`el-5` Alpen.

## Files

| File | Role |
|---|---|
| `index.html` | Static page: header (stats + New session), map container, question bar, choice buttons, Next button, end overlay |
| `app.js` | All game logic. `RANGES` array + tunables (`ASKS_PER_RANGE`, `RETRY_GAP`, `CHOICE_COUNT`, `CORRECT_MS`) at top. State machine in `startSession` / `nextQuestion` / `handleAnswer` / `scheduleRetry` / `decrementPending` / `checkSessionEnd` |
| `styles.css` | Layout + ellipse state classes (`candidate`, `dim`, `highlight`, `wrong`, `reveal`) + correct/wrong animations (`ring`, `pop`) |
| `assets/world-map.jpg` | Background map, **placeholder** (blue grid, 2:1 aspect). Replace with a real no-letter world map |
| `assets/markers.svg` | Ellipses positioned over the map, **placeholder** positions. Replace with real art; keep `viewBox="0 0 1000 500"` (or update both) and ids `el-1`…`el-N` matching `app.js` |

## Replacing the placeholder art

- `world-map.jpg`: any image, keep 2:1 aspect (or change `aspect-ratio` in
  `styles.css` `#map-container`).
- `markers.svg`: ellipses must keep their `id`s. If the real map uses a
  different projection, positions must be matched by eye; the equirectangular
  formula above only works for equirectangular maps.

## Intentional design decisions

- `el-1`…`el-N` ids (not semantic ids) with the name mapping only in `app.js` —
  chosen over `range-himalaya`-style ids.
- Question types are fully random; a range may be asked with the same type
  twice in a row (deliberate, not a bug).
- Session can end before all 10 scheduled questions run — as soon as every
  range is correct at least once (chosen spec, option "c").
- Type 1 always shows exactly 5 name options even when more ranges exist.

## Verified so far

- `node --check app.js` clean.
- Logic simulation (5000 random sessions mirroring the state transitions): all
  terminated, all ranges correct at end, counters consistent.
- Not yet verified: visual/browser testing, real map art.
