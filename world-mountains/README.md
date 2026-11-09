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
   `{ id: "ellipse7", name: "Karakorum" },`
2. `assets/markers.svg` — add the ellipse (open in Inkscape, viewBox is
   `0 0 425.92 220.16`, place by eye over the map):
   `<ellipse id="ellipse7" cx="300" cy="80" rx="8" ry="5" fill="none" stroke="#000"/>`

Current ranges:

| id | name |
|---|---|
| `el-1` | Pobřežní nížina |
| `el-2` | Skalnaté hory |
| `el-3` | Kordilery |
| `el-4` | Apalačské pohoří |
| `el-5` | Mexická plošina |
| `ellipse1` | Andy |
| `ellipse2` | Amazonská nížina |
| `ellipse3` | Brazilská vysočina |
| `ellipse4` | Alpy |
| `ellipse5` | Atlas |
| `ellipse6` | Karpaty |
| `ellipse7` | Velké předělové pohoří |
| `ellipse8` | Artézská pánev |
| `ellipse9` | Arktická nížina |
| `ellipse10` | Pobřežní pásmo |
| `ellipse11` | Velká pánev |
| `ellipse12` | Velké planiny |
| `ellipse13` | Laplacká nížina |
| `ellipse14` | Guajanská vysočina |
| `ellipse15` | Plošina Matto Gresso |
| `ellipse16` | Dračí hory |
| `ellipse17` | Plošina Lundakatanga |
| `ellipse18` | Konžská pánev |
| `ellipse19` | Plošina Arande |
| `ellipse20` | Čadská pánev |
| `ellipse21` | Východoafrická vysočina |
| `ellipse22` | Tibesti |
| `ellipse23` | Kavkaz |
| `ellipse24` | Ural |
| `ellipse25` | Saravát |
| `ellipse26` | Zagros |
| `ellipse27` | Elborz |
| `ellipse28` | Íránská vysočina |
| `ellipse29` | Plošina Ustjurt |
| `ellipse30` | Východoevropská nížina |
| `ellipse31` | Západosibiřská nížina |
| `ellipse32` | Středosibiřská plošina |
| `ellipse33` | Turanská nížina |
| `ellipse34` | Verchojanské pohoří |
| `ellipse35` | Pohoří Čerského |
| `ellipse36` | Kolymské pohoří |
| `ellipse37` | Korjacké pohoří |
| `ellipse38` | Stanová vysočina |
| `ellipse39` | Stanové pohoří |
| `ellipse40` | Velký Chingan |
| `ellipse41` | Sichote-Aliň |
| `ellipse42` | Severočínská hornatina |
| `ellipse43` | Velká Čínská nížina |
| `ellipse44` | Jihočínská hornatina |
| `ellipse45` | Jin-šan |
| `ellipse46` | Kazašská plošina |
| `ellipse47` | Pamír |
| `ellipse48` | Hindůkůš |
| `ellipse49` | Ťan šan |
| `ellipse50` | Altaj |
| `ellipse51` | Changaj |
| `ellipse52` | Čchi-lien-šan |
| `ellipse53` | Altyn-tagh |
| `ellipse54` | Kchun-lun-šan |
| `ellipse55` | Tibetská plošina |
| `ellipse56` | Himaláj |

Note: rotated ellipses must transform **around their own center**
(`rotate(θ cx cy)` or a matrix with matching translation). Inkscape sometimes
emits `rotate(θ)` around the origin, which flings the ellipse off-canvas.
`app.js` handles transformed ellipses for the correct-answer animation via
`getCTM()`.

## Files

| File | Role |
|---|---|
| `index.html` | Static page: header (stats + New session), map container (SVG only, no `<img>`), question bar, choice buttons, Next button, end overlay |
| `app.js` | All game logic. `RANGES` array + tunables (`ASKS_PER_RANGE`, `RETRY_GAP`, `CHOICE_COUNT`, `CORRECT_MS`) at top. State machine in `startSession` / `nextQuestion` / `handleAnswer` / `scheduleRetry` / `decrementPending` / `checkSessionEnd` |
| `styles.css` | Layout + ellipse state classes (`candidate`, `dim`, `highlight`, `wrong`, `reveal`) + correct/wrong animations (`ring`, `pop`) |
| `assets/world-map.jpg` | Background map, embedded **inside** `markers.svg` via `<image xlink:href="world-map.jpg">` (1331x688). Not loaded separately by HTML |
| `assets/markers.svg` | Map image + stroke-only ellipses (no fill). Keep `viewBox="0 0 425.92 220.16"` and ids matching `app.js` |

## Replacing the map art

- `world-map.jpg`: swap the file, keep it next to `markers.svg` (same folder).
  Keep the aspect ratio 1331:688 (same as the `markers.svg` viewBox), or
  update `aspect-ratio` in `styles.css` `#map-container` — the SVG `<image>`
  uses `preserveAspectRatio="none"` so it always stretches to fill the
  container exactly.
- `markers.svg`: ellipses must keep their `id`s. Positions are matched by eye
  in Inkscape (the map is not a standard equirectangular projection).

## Intentional design decisions

- Opaque-free `el-*` / `ellipse*` ids (not semantic ids) with the name mapping
  only in `app.js` — chosen over `range-himalaya`-style ids.
- Map lives inside `markers.svg` (not a separate `<img>` in HTML) so ellipse
  positions always align with the map; single SVG fills the container.
- Ellipses are stroke-only (no fill); all state styling in `styles.css`
  overrides the inline `fill:none` via stroke color/width.
- Question types are fully random; a range may be asked with the same type
  twice in a row (deliberate, not a bug).
- Session can end before all 10 scheduled questions run — as soon as every
  range is correct at least once (chosen spec, option "c").
- Type 1 always shows exactly 5 name options even when more ranges exist.

## Verified so far

- `node --check app.js` clean.
- Logic simulation (5000 random sessions mirroring the state transitions): all
  terminated, all ranges correct at end, counters consistent.
- Real map embedded in `markers.svg`; 3 off-canvas ellipses (`el-4`,
  `ellipse3`, `ellipse6`) repaired — re-estimate positions by eye, they were
  guesses.
- Not yet verified: visual/browser testing, final ellipse placement.
