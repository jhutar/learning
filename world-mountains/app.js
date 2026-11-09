// Mountain ranges to train. `id` must match an ellipse id in assets/markers.svg.
// To add a range: add one line here + one <ellipse id="el-N"> in the SVG.
const RANGES = [
  { id: "el-1", name: "Pobřežní nížina" },
  { id: "el-2", name: "Skalnaté hory" },
  { id: "el-3", name: "Kordilery" },
  { id: "el-4", name: "Apalačské pohoří" },
  { id: "el-5", name: "Mexická plošina" },
  { id: "ellipse1", name: "Andy" },
  { id: "ellipse2", name: "Amazonská nížina" },
  { id: "ellipse3", name: "Brazilská vysočina" },
  { id: "ellipse4", name: "Alpy" },
  { id: "ellipse5", name: "Atlas" },
  { id: "ellipse6", name: "Karpaty" },
  { id: "ellipse7", name: "Velké předělové pohoří" },
  { id: "ellipse8", name: "Artézská pánev" },
  { id: "ellipse9", name: "Arktická nížina" },
  { id: "ellipse10", name: "Pobřežní pásmo" },
  { id: "ellipse11", name: "Velká pánev" },
  { id: "ellipse12", name: "Velké planiny" },
  { id: "ellipse13", name: "Laplacká nížina" },
  { id: "ellipse14", name: "Guajanská vysočina" },
  { id: "ellipse15", name: "Plošina Matto Gresso" },
  { id: "ellipse16", name: "Dračí hory" },
  { id: "ellipse17", name: "Etiopská vysočina" },
  { id: "ellipse18", name: "Plošina Lundakatanga" },
  { id: "ellipse19", name: "Konžská pánev" },
  { id: "ellipse20", name: "Plošina Arande" },
  { id: "ellipse21", name: "Čadská pánev" },
  { id: "ellipse22", name: "Východoafrická vysočina" },
  { id: "ellipse23", name: "Tibesti" },
  { id: "ellipse24", name: "Kavkaz" },
  { id: "ellipse25", name: "Ural" },
  { id: "ellipse26", name: "Saravát" },
  { id: "ellipse27", name: "Zagros" },
  { id: "ellipse28", name: "Elborz" },
  { id: "ellipse29", name: "Íránská vysočina" },
  { id: "ellipse30", name: "Plošina Ustjurt" },
  { id: "ellipse31", name: "Východoevropská nížina" },
  { id: "ellipse32", name: "Západosibiřská nížina" },
  { id: "ellipse33", name: "Středosibiřská plošina" },
  { id: "ellipse34", name: "Turanská nížina" },
  { id: "ellipse35", name: "Verchojanské pohoří" },
  { id: "ellipse36", name: "Pohoří Čerského" },
  { id: "ellipse37", name: "Kolymské pohoří" },
  { id: "ellipse38", name: "Korjacké pohoří" },
  { id: "ellipse39", name: "Stanová vysočina" },
  { id: "ellipse40", name: "Stanové pohoří" },
  { id: "ellipse41", name: "Velký Chingan" },
  { id: "ellipse42", name: "Sichote-Aliň" },
  { id: "ellipse43", name: "Severočínská hornatina" },
  { id: "ellipse44", name: "Velká Čínská nížina" },
  { id: "ellipse45", name: "Jihočínská hornatina" },
  { id: "ellipse46", name: "Jin-šan" },
  { id: "ellipse47", name: "Kazašská plošina" },
  { id: "ellipse48", name: "Pamír" },
  { id: "ellipse49", name: "Hindůkůš" },
  { id: "ellipse50", name: "Ťan šan" },
  { id: "ellipse51", name: "Altaj" },
  { id: "ellipse52", name: "Changaj" },
  { id: "ellipse53", name: "Čchi-lien-šan" },
  { id: "ellipse54", name: "Altyn-tagh" },
  { id: "ellipse55", name: "Kchun-lun-šan" },
  { id: "ellipse56", name: "Tibetská plošina" },
  { id: "ellipse57", name: "Himaláj" },
];

const ASKS_PER_RANGE = 2; // scheduled questions per range per session
const RETRY_GAP = 3; // questions between a wrong answer and its re-ask
const CHOICE_COUNT = 5; // name buttons (type 1) / candidate ellipses (type 3)
const CORRECT_MS = 700; // correct-answer animation before auto-advance

let state = null; // current session state, see startSession()

// Fisher-Yates shuffle, returns new array.
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick n random items from arr.
function sample(arr, n) {
  return shuffle(arr).slice(0, n);
}

// Build a fresh session: every range scheduled ASKS_PER_RANGE times, counters zeroed.
function startSession() {
  const all = RANGES.map((_, i) => i);
  const scheduled = [];
  for (let k = 0; k < ASKS_PER_RANGE; k++) scheduled.push(...all);
  state = {
    queue: shuffle(scheduled),
    pending: [], // wrong answers waiting to be re-asked: { target, delay }
    correct: new Set(), // range indexes answered correctly at least once
    passes: 0,
    fails: 0,
    current: null,
    locked: false,
  };
  updateStats();
  document.getElementById("overlay").hidden = true;
  document.getElementById("btn-next").hidden = true;
  nextQuestion();
}

// Load the next question from the queue; ends the session when done.
function nextQuestion() {
  if (checkSessionEnd()) return;
  const target = state.queue.shift();
  state.current = makeQuestion(target);
  state.locked = false;
  renderQuestion();
}

// End when every range answered correctly at least once and no retries pending.
function checkSessionEnd() {
  if (state.correct.size < RANGES.length || state.pending.length > 0) return false;
  finishSession();
  return true;
}

// Build one question: random type, target range, candidate set, name options.
function makeQuestion(target) {
  const type = Math.floor(Math.random() * 3);
  const all = RANGES.map((_, i) => i);
  const others = all.filter((i) => i !== target);
  let candidates = all;
  let options = null;
  if (type === 1) {
    // Highlighted range -> pick its name from shuffled name buttons.
    options = shuffle([target, ...sample(others, Math.min(CHOICE_COUNT - 1, others.length))]);
  } else if (type === 2) {
    candidates = all; // hard: pick from all ranges
  } else {
    const n = Math.min(CHOICE_COUNT, all.length);
    candidates = [target, ...sample(others, n - 1)]; // easy: 5 random candidates
  }
  return { type, target, candidates, options };
}

// Show the current question: text, name buttons, ellipse styles.
function renderQuestion() {
  const q = state.current;
  const choices = document.getElementById("choices");
  choices.innerHTML = "";
  document.getElementById("btn-next").hidden = true;
  document.getElementById("question").textContent =
    q.type === 1 ? "Which range is highlighted?" : "Where is " + RANGES[q.target].name + "?";

  // Name buttons only exist for type 1; types 2/3 are answered by map click.
  if (q.options) {
    q.options.forEach((i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = RANGES[i].name;
      b.addEventListener("click", () => handleAnswer(i));
      choices.appendChild(b);
    });
  }

  RANGES.forEach((r, i) => {
    const el = document.getElementById(r.id);
    el.classList.remove("candidate", "dim", "highlight", "wrong", "reveal");
    if (q.type === 1) {
      el.classList.add(i === q.target ? "highlight" : "dim");
    } else if (q.candidates.includes(i)) {
      el.classList.add("candidate");
    } else {
      el.classList.add("dim");
    }
  });
}

// Map ellipse click handler for question types 2 and 3.
function handleEllipseClick(i) {
  const q = state.current;
  if (state.locked || !q || q.type === 1 || !q.candidates.includes(i)) return;
  handleAnswer(i);
}

// Evaluate an answer for the current question (index of chosen range).
function handleAnswer(chosen) {
  if (state.locked) return;
  state.locked = true;
  const q = state.current;
  document.getElementById("choices").querySelectorAll("button").forEach((b) => (b.disabled = true));

  if (chosen === q.target) {
    state.passes++;
    state.correct.add(q.target);
    popAnimation(q.target);
  } else {
    state.fails++;
    document.getElementById(RANGES[chosen].id).classList.add("wrong");
    document.getElementById(RANGES[q.target].id).classList.add("reveal");
    document.getElementById("question").textContent = "Wrong. Correct answer: " + RANGES[q.target].name + ".";
    popAnimation(chosen, "wrong");
    scheduleRetry(q.target);
    document.getElementById("btn-next").hidden = false;
  }
  updateStats();

  if (chosen === q.target) {
    setTimeout(() => {
      decrementPending();
      nextQuestion();
    }, CORRECT_MS);
  }
}

// Re-ask a missed range after RETRY_GAP other questions (immediately if fewer remain).
function scheduleRetry(target) {
  state.pending.push({ target, delay: Math.min(RETRY_GAP, state.queue.length) });
}

// Every answered question moves pending retries one step closer.
function decrementPending() {
  state.pending = state.pending.filter((p) => {
    p.delay--;
    if (p.delay <= 0) {
      state.queue.push(p.target);
      return false;
    }
    return true;
  });
}

// Update header pass/fail counters.
function updateStats() {
  document.getElementById("stat-pass").innerHTML = "&#10003; " + state.passes;
  document.getElementById("stat-fail").innerHTML = "&#10007; " + state.fails;
}

// Show the session-complete overlay with final score.
function finishSession() {
  state.locked = true;
  document.getElementById("overlay-stats").textContent =
    "Passed: " + state.passes + "   Failed: " + state.fails;
  document.getElementById("overlay").hidden = false;
}

// Answer animation: expanding ring + popping symbol over the given ellipse.
// kind "correct" -> green ring + check; kind "wrong" -> red ring + cross.
function popAnimation(rangeIndex, kind = "correct") {
  const el = document.getElementById(RANGES[rangeIndex].id);
  const svg = document.getElementById("markers").querySelector("svg");
  // Ellipse center (local cx/cy, may be rotated/moved) -> viewBox units.
  // Both CTMs map to the element viewport's px, so el.getCTM() composes
  // with svg.getCTM().inverse(). (Mixing getCTM with getScreenCTM adds the
  // page offset of the svg and flings the ring off-center/clipped.)
  const pt = svg.createSVGPoint();
  pt.x = Number(el.getAttribute("cx"));
  pt.y = Number(el.getAttribute("cy"));
  const p = pt.matrixTransform(el.getCTM()).matrixTransform(svg.getCTM().inverse());
  const cx = p.x;
  const cy = p.y;
  const r = Math.max(el.getAttribute("rx"), el.getAttribute("ry")) + 6;

  const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  ring.setAttribute("cx", cx);
  ring.setAttribute("cy", cy);
  ring.setAttribute("r", r);
  ring.classList.add("ring");
  if (kind === "wrong") ring.classList.add("ring-wrong");

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", cx);
  text.setAttribute("y", cy - r);
  text.classList.add("pop");
  if (kind === "wrong") text.classList.add("pop-wrong");
  text.textContent = kind === "wrong" ? "✗" : "✓";

  svg.appendChild(ring);
  svg.appendChild(text);
  setTimeout(() => {
    ring.remove();
    text.remove();
  }, CORRECT_MS);
}

// Fetch markers.svg, wire ellipse clicks, start first session.
async function init() {
  const text = await fetch("assets/markers.svg").then((r) => r.text());
  document.getElementById("markers").innerHTML = text;
  const svg = document.getElementById("markers").querySelector("svg");
  svg.classList.add("markers-svg");
  // href "world-map.jpg" is relative to assets/ (svg's folder), but after DOM
  // injection the browser resolves it against the page URL -> re-point it.
  svg.querySelector("image").setAttribute("href", "assets/world-map.jpg");
  // Inline style attrs (Inkscape exports them) would beat the state classes
  // in styles.css -> strip them so .highlight/.candidate/.wrong etc. apply.
  svg.querySelectorAll("ellipse").forEach((el) => el.removeAttribute("style"));

  RANGES.forEach((r, i) =>
    document.getElementById(r.id).addEventListener("click", () => handleEllipseClick(i))
  );
  document.getElementById("btn-new-session").addEventListener("click", startSession);
  document.getElementById("btn-restart").addEventListener("click", startSession);
  document.getElementById("btn-next").addEventListener("click", () => {
    document.getElementById("btn-next").hidden = true;
    decrementPending();
    nextQuestion();
  });

  startSession();
}

document.addEventListener("DOMContentLoaded", init);
