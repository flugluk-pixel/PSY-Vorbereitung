function openGoNoGoHome() {
  openModuleHome('gonogo');
}

function openStroopHome() {
  openModuleHome('stroop');
}

function openSequenceHome() {
  openModuleHome('sequence');
}

function openRotationHome() {
  openModuleHome('rotation');
}

function openDigitSpanHome() {
  openModuleHome('digitspan');
}

function openFlankerHome() {
  openModuleHome('flanker');
}

function openVisualSearchHome() {
  openModuleHome('visualsearch');
}

function rotateHeightMap90(map) {
  const n = map.length;
  const out = Array.from({ length: n }, () => Array.from({ length: n }, () => 0));
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      out[x][n - 1 - y] = map[y][x];
    }
  }
  return out;
}

function randomSpatialMap() {
  // No rotation: constraints (hidden positions >= 1) are defined per map and must not shift
  return SPATIAL_HEIGHTMAPS[Math.floor(Math.random() * SPATIAL_HEIGHTMAPS.length)].map(row => row.slice());
}

function countCubes(map) {
  let total = 0;
  map.forEach(row => row.forEach(v => { total += v; }));
  return total;
}

function heightMapKey(map) {
  return map.map(row => row.join(',')).join('|');
}

function rotateHeightMap(map, turns) {
  let out = cloneHeightMap(map);
  const normalizedTurns = ((turns % 4) + 4) % 4;
  for (let i = 0; i < normalizedTurns; i++) {
    out = rotateHeightMap90(out);
  }
  return out;
}

function pointsToString(points) {
  return points.map(p => `${p[0]},${p[1]}`).join(' ');
}

function renderSpatialSceneSvg(map, options) {
  const opts = options || {};
  const tileW = opts.tileW || 26;
  const tileH = opts.tileH || 14;
  const cubeH = opts.cubeH || 22;
  const width = opts.width || 300;
  const height = opts.height || 230;
  const originX = opts.originX || Math.round(width / 2);
  const originY = opts.originY || Math.round(height * 0.4);
  const ariaLabel = opts.ariaLabel || '3D-Würfelstruktur';
  const svgWidth = opts.svgWidth || '100%';
  const svgHeight = opts.svgHeight || 250;
  const cubes = [];

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const h = map[y][x];
      for (let z = 0; z < h; z++) {
        cubes.push({ x, y, z, d: x + y + z * 0.01 });
      }
    }
  }

  cubes.sort((a, b) => a.d - b.d);

  // Draw a subtle floor grid so the base level is visually grounded
  let svg = `<svg viewBox="0 0 ${width} ${height}" width="${svgWidth}" height="${svgHeight}" aria-label="${ariaLabel}">`;
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === 0) continue;
      const sx = originX + (x - y) * tileW;
      const sy = originY + (x + y) * tileH;
      const floor = [[sx, sy], [sx + tileW, sy + tileH], [sx, sy + 2 * tileH], [sx - tileW, sy + tileH]];
      svg += `<polygon points="${pointsToString(floor)}" fill="#d8e8f8" stroke="#7a9fc0" stroke-width="0.9"/>`;  // filled base tile
    }
  }

  cubes.forEach(c => {
    const sx = originX + (c.x - c.y) * tileW;
    const sy = originY + (c.x + c.y) * tileH - c.z * cubeH;
    const top   = [[sx, sy], [sx + tileW, sy + tileH], [sx, sy + 2 * tileH], [sx - tileW, sy + tileH]];
    const left  = [[sx - tileW, sy + tileH], [sx, sy + 2 * tileH], [sx, sy + 2 * tileH + cubeH], [sx - tileW, sy + tileH + cubeH]];
    const right = [[sx + tileW, sy + tileH], [sx, sy + 2 * tileH], [sx, sy + 2 * tileH + cubeH], [sx + tileW, sy + tileH + cubeH]];
    svg += `<polygon points="${pointsToString(left)}"  fill="#6e96be" stroke="#3d6888" stroke-width="1"/>`;
    svg += `<polygon points="${pointsToString(right)}" fill="#9dbddb" stroke="#4a7aaa" stroke-width="1"/>`;
    svg += `<polygon points="${pointsToString(top)}"   fill="#ddeeff" stroke="#4a7aaa" stroke-width="1"/>`;
  });
  svg += '</svg>';
  return svg;
}

function renderSpatialScene(map) {
  return renderSpatialSceneSvg(map);
}

function renderRotationScene(map, compact) {
  if (compact) {
    return renderSpatialSceneSvg(map, {
      width: 188,
      height: 136,
      svgWidth: 176,
      svgHeight: 126,
      tileW: 18,
      tileH: 10,
      cubeH: 16,
      originY: 54,
      ariaLabel: 'Rotierte Würfelstruktur'
    });
  }
  return renderSpatialSceneSvg(map, {
    width: 280,
    height: 188,
    svgWidth: 260,
    svgHeight: 172,
    tileW: 24,
    tileH: 13,
    cubeH: 20,
    originY: 76,
    ariaLabel: 'Vorlage Würfelstruktur'
  });
}

function buildSpatialTask() {
  const heightMap = randomSpatialMap();
  const correctTotal = countCubes(heightMap);
  const offsets = [-7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7];
  const wrong = [];
  for (let i = 0; i < offsets.length && wrong.length < 5; i++) {
    const candidate = correctTotal + offsets[i];
    if (candidate > 0 && candidate !== correctTotal && !wrong.includes(candidate)) {
      wrong.push(candidate);
    }
  }
  while (wrong.length < 5) {
    const candidate = correctTotal + (Math.floor(Math.random() * 9) - 4);
    if (candidate > 0 && candidate !== correctTotal && !wrong.includes(candidate)) wrong.push(candidate);
  }
  const options = [{ value: correctTotal, correct: true }]
    .concat(wrong.map(v => ({ value: v, correct: false })));
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = options[i];
    options[i] = options[j];
    options[j] = t;
  }
  return { heightMap, options, correctTotal };
}

function updateSpatialTimerDisplay() {
  if (!spatialState.session) return;
  const remaining = Math.max(0, spatialState.session.remainingSeconds);
  document.getElementById('spatial-total-time').textContent = formatTime(spatialState.session.totalSeconds);
  document.getElementById('spatial-remaining-time').textContent = formatTime(remaining);
  const pct = spatialState.session.totalSeconds > 0 ? (remaining / spatialState.session.totalSeconds) * 100 : 0;
  const bar = document.getElementById('spatial-progress-bar');
  bar.style.width = `${pct}%`;
  if (pct < 25) bar.style.background = 'linear-gradient(90deg, #b01010, #e03030)';
  else if (pct < 60) bar.style.background = 'linear-gradient(90deg, #9a6300, #e09000)';
  else bar.style.background = 'linear-gradient(90deg, #0f2d6b, #2a5fbb)';
}

function renderSpatialTask() {
  if (!spatialState.session) return;
  if (spatialState.advanceTimer) {
    clearTimeout(spatialState.advanceTimer);
    spatialState.advanceTimer = null;
  }
  spatialState.currentTask = buildSpatialTask();
  spatialState.taskCount++;
  document.getElementById('spatial-progress').textContent = String(spatialState.taskCount);
  document.getElementById('spatial-target-wrap').innerHTML = renderSpatialScene(spatialState.currentTask.heightMap);
  const optionsWrap = document.getElementById('spatial-options');
  optionsWrap.innerHTML = '';
  spatialState.currentTask.options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'spatial-option';
    btn.type = 'button';
    btn.textContent = String(option.value);
    btn.dataset.value = String(option.value);
    btn.addEventListener('click', () => submitSpatialAnswer(btn, option.value));
    optionsWrap.appendChild(btn);
  });
  const fb = document.getElementById('spatial-feedback');
  fb.textContent = '';
  fb.className = 'feedback';
  spatialState.currentTask.answered = false;
}

function startSpatialExercise() {
  const selectedMinutes = parseInt(document.getElementById('spatial-time-select').value, 10) || 5;
  const totalSeconds = selectedMinutes * 60;
  spatialState.session = {
    startedAt: Date.now(),
    totalSeconds,
    remainingSeconds: totalSeconds,
    correct: 0,
    wrong: 0,
    total: 0,
    trials: []
  };
  spatialState.taskCount = 0;
  showScreen('screen-spatial-exercise');
  clearSpatialTimer();
  updateSpatialTimerDisplay();
  spatialState.timerInterval = setInterval(() => {
    if (!spatialState.session) return;
    spatialState.session.remainingSeconds--;
    updateSpatialTimerDisplay();
    if (spatialState.session.remainingSeconds <= 0) {
      finishSpatialExercise(true);
    }
  }, 1000);
  renderSpatialTask();
}

function submitSpatialAnswer(button, value) {
  if (!spatialState.session || !spatialState.currentTask || spatialState.currentTask.answered) return;
  const feedback = document.getElementById('spatial-feedback');
  spatialState.currentTask.answered = true;
  spatialState.session.total++;
  const options = Array.from(document.querySelectorAll('#spatial-options .spatial-option'));
  options.forEach(btn => { btn.disabled = true; });
  const isCorrect = value === spatialState.currentTask.correctTotal;
  if (isCorrect) {
    spatialState.session.correct++;
    button.classList.add('correct');
    feedback.textContent = `Richtig! Es sind ${spatialState.currentTask.correctTotal} Würfel.`;
    feedback.className = 'feedback richtig';
  } else {
    spatialState.session.wrong++;
    button.classList.add('wrong');
    const correctBtn = options.find(btn => parseInt(btn.dataset.value, 10) === spatialState.currentTask.correctTotal);
    if (correctBtn) correctBtn.classList.add('correct');
    feedback.textContent = `Falsch. Richtig sind ${spatialState.currentTask.correctTotal} Würfel.`;
    feedback.className = 'feedback falsch';
  }

  spatialState.session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'accuracy',
    reactionTimeMs: null,
    correct: isCorrect,
    omitted: false,
    anticipated: false,
    difficultyLevel: null,
    sequenceLength: null,
    mode: null,
    blockLabel: String(spatialState.currentTask.correctTotal)
  });

  spatialState.advanceTimer = setTimeout(() => {
    spatialState.advanceTimer = null;
    if (!spatialState.session) return;
    renderSpatialTask();
  }, 550);
}

function nextSpatialQuestion() {
  if (!spatialState.session) return;
  renderSpatialTask();
}

function finishSpatialExercise(timedOut) {
  clearSpatialTimer();
  if (!spatialState.session) {
    showScreen('screen-spatial-results');
    return;
  }
  const pct = getAccuracyPercent(spatialState.session.correct, spatialState.session.total);
  const elapsed = getElapsedSeconds(spatialState.session.startedAt, spatialState.session.totalSeconds, timedOut);
  setTextEntries({
    'spatial-result-percent': `${pct}%`,
    'spatial-result-limit': formatTime(spatialState.session.totalSeconds),
    'spatial-result-correct': String(spatialState.session.correct),
    'spatial-result-wrong': String(spatialState.session.wrong),
    'spatial-result-total': String(spatialState.session.total),
    'spatial-result-duration': formatTime(elapsed)
  });
  setResultInsight('spatial-result-insight', 'spatial', pct);
  saveTrainingEntry({
    module: 'spatial',
    label: 'Würfel zählen',
    trials: spatialState.session.trials,
    correct: spatialState.session.correct,
    wrong: spatialState.session.wrong,
    total: spatialState.session.total,
    accuracy: pct,
    duration: elapsed,
    totalSeconds: spatialState.session.totalSeconds
  });
  showScreen('screen-spatial-results');
}

function restartSpatialMode() {
  startSpatialExercise();
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uniqueOptions(correct, deltas) {
  const opts = [correct];
  for (let i = 0; i < deltas.length && opts.length < 4; i++) {
    const v = correct + deltas[i];
    if (v > 0 && !opts.includes(v)) opts.push(v);
  }
  while (opts.length < 4) {
    const v = correct + (Math.floor(Math.random() * 11) - 5);
    if (v > 0 && !opts.includes(v)) opts.push(v);
  }
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = opts[i];
    opts[i] = opts[j];
    opts[j] = t;
  }
  return opts;
}

function buildNbackStimulus() {
  const n = 2;
  const stream = nbackState.session.stream;
  const prevN = stream.length >= n ? stream[stream.length - n] : null;
  const forceMatch = prevN !== null && Math.random() < 0.32;
  let value = forceMatch ? prevN : randomNum();
  if (prevN !== null && !forceMatch && value === prevN) {
    value = value === 9 ? 1 : value + 1;
  }
  return {
    value,
    expectedMatch: prevN !== null && value === prevN,
    prevN,
    answered: false
  };
}

function renderNbackStimulus() {
  if (!nbackState.session) return;
  nbackState.currentTask = buildNbackStimulus();
  nbackState.taskCount++;
  document.getElementById('nback-progress').textContent = String(nbackState.taskCount);
  document.getElementById('nback-stimulus').textContent = String(nbackState.currentTask.value);
  const prevRow = document.getElementById('nback-previous-row');
  const showPrevHint = nbackState.currentTask.prevN !== null && nbackState.session.showPrevHint;
  prevRow.style.display = showPrevHint ? 'block' : 'none';
  document.getElementById('nback-previous').textContent = nbackState.currentTask.prevN === null ? '-' : String(nbackState.currentTask.prevN);
  const fb = document.getElementById('nback-feedback');
  fb.textContent = '';
  fb.className = 'feedback';
}

function scheduleNextNbackStimulus(delayMs) {
  if (!nbackState.session) return;
  if (nbackState.advanceTimer) clearTimeout(nbackState.advanceTimer);
  nbackState.advanceTimer = setTimeout(() => {
    nbackState.advanceTimer = null;
    renderNbackStimulus();
  }, delayMs);
}

function nbackModeLabel(mode) {
  return mode === 'test' ? 'Test' : 'Übung';
}

function startNbackExercise() {
  const selectedMinutes = parseInt(document.getElementById('nback-time-select').value, 10) || 5;
  const mode = document.getElementById('nback-mode-select').value === 'test' ? 'test' : 'practice';
  const feedbackEnabled = mode === 'test'
    ? false
    : !!document.getElementById('nback-feedback-toggle').checked;
  const totalSeconds = selectedMinutes * 60;
  nbackState.session = {
    mode,
    feedbackEnabled,
    startedAt: Date.now(),
    totalSeconds,
    remainingSeconds: totalSeconds,
    correct: 0,
    wrong: 0,
    total: 0,
    consecutiveWrong: 0,
    showPrevHint: false,
    stream: [],
    trials: []
  };
  nbackState.taskCount = 0;
  showScreen('screen-nback-exercise');
  clearNbackTimer();
  updateModuleTimer('nback', nbackState.session);
  nbackState.timerInterval = setInterval(() => {
    if (!nbackState.session) return;
    nbackState.session.remainingSeconds--;
    updateModuleTimer('nback', nbackState.session);
    if (nbackState.session.remainingSeconds <= 0) finishNbackExercise(true);
  }, 1000);
  renderNbackStimulus();
}

function submitNbackAnswer(isMatch) {
  if (!nbackState.session || !nbackState.currentTask || nbackState.currentTask.answered) return;
  nbackState.currentTask.answered = true;
  nbackState.session.total++;
  const ok = isMatch === nbackState.currentTask.expectedMatch;
  const fb = document.getElementById('nback-feedback');
  if (ok) {
    nbackState.session.correct++;
    nbackState.session.consecutiveWrong = 0;
    nbackState.session.showPrevHint = false;
    if (nbackState.session.feedbackEnabled) {
      fb.textContent = '✓';
      fb.className = 'feedback richtig';
    }
  } else {
    nbackState.session.wrong++;
    nbackState.session.consecutiveWrong++;
    if (nbackState.session.mode === 'practice') {
      nbackState.session.showPrevHint = true;
    } else {
      nbackState.session.showPrevHint = nbackState.session.consecutiveWrong >= 3;
    }
    if (nbackState.session.feedbackEnabled) {
      fb.textContent = '✗';
      fb.className = 'feedback falsch';
    }
  }
  nbackState.session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'memory',
    reactionTimeMs: null,
    correct: ok,
    omitted: false,
    anticipated: false,
    difficultyLevel: 2,
    sequenceLength: 2,
    mode: nbackState.session.mode,
    blockLabel: nbackState.currentTask.expectedMatch ? 'match' : 'non-match'
  });
  nbackState.session.stream.push(nbackState.currentTask.value);
  const nextDelay = nbackState.session.feedbackEnabled ? 300 : 120;
  scheduleNextNbackStimulus(nextDelay);
}

function finishNbackExercise(timedOut) {
  clearNbackTimer();
  if (!nbackState.session) {
    showScreen('screen-nback-results');
    return;
  }
  const pct = getAccuracyPercent(nbackState.session.correct, nbackState.session.total);
  const elapsed = getElapsedSeconds(nbackState.session.startedAt, nbackState.session.totalSeconds, timedOut);
  setTextEntries({
    'nback-result-percent': `${pct}%`,
    'nback-result-mode': nbackModeLabel(nbackState.session.mode),
    'nback-result-limit': formatTime(nbackState.session.totalSeconds),
    'nback-result-correct': String(nbackState.session.correct),
    'nback-result-wrong': String(nbackState.session.wrong),
    'nback-result-total': String(nbackState.session.total),
    'nback-result-duration': formatTime(elapsed)
  });
  setResultInsight('nback-result-insight', 'nback', pct);
  saveTrainingEntry({
    module: 'nback',
    label: '2-Back',
    trials: nbackState.session.trials,
    correct: nbackState.session.correct,
    wrong: nbackState.session.wrong,
    total: nbackState.session.total,
    accuracy: pct,
    duration: elapsed,
    totalSeconds: nbackState.session.totalSeconds
  });
  showScreen('screen-nback-results');
}

function restartNbackMode() {
  startNbackExercise();
}

const GONOGO_RULES = [
  {
    id: 'rule-1',
    go: { shape: 'circle', color: '#1a7a2a', border: '#165f21', label: 'grüner Kreis' },
    nogo: { shape: 'square', color: '#b82020', border: '#851717', label: 'rotes Quadrat' }
  },
  {
    id: 'rule-2',
    go: { shape: 'square', color: '#0f2d6b', border: '#0b2150', label: 'blaues Quadrat' },
    nogo: { shape: 'triangle', color: '#b82020', border: '#851717', label: 'rotes Dreieck' }
  },
  {
    id: 'rule-3',
    go: { shape: 'triangle', color: '#1a7a2a', border: '#165f21', label: 'grünes Dreieck' },
    nogo: { shape: 'diamond', color: '#b58a00', border: '#8e6d00', label: 'gelbe Raute' }
  },
  {
    id: 'rule-4',
    go: { shape: 'diamond', color: '#0f2d6b', border: '#0b2150', label: 'blaue Raute' },
    nogo: { shape: 'circle', color: '#b82020', border: '#851717', label: 'roter Kreis' }
  }
];

const GONOGO_PALETTE_COLORS = [
  { color: '#1a7a2a', border: '#165f21' },
  { color: '#b82020', border: '#851717' },
  { color: '#0f2d6b', border: '#0b2150' },
  { color: '#b58a00', border: '#8e6d00' },
];
const GONOGO_PALETTE_SHAPES = ['circle', 'square', 'triangle', 'diamond'];

const GONOGO_DIFFICULTY = {
  easy: {
    label: 'Leicht',
    ruleChangeMin: 18,
    ruleChangeMax: 28,
    answerAdvanceMs: 420,
    bannerMs: 3000,
    trialMs: 4000,
    distractorRate: 0.15
  },
  medium: {
    label: 'Mittel',
    ruleChangeMin: 14,
    ruleChangeMax: 22,
    answerAdvanceMs: 260,
    bannerMs: 2600,
    trialMs: 2000,
    distractorRate: 0.20
  },
  hard: {
    label: 'Schwer',
    ruleChangeMin: 10,
    ruleChangeMax: 16,
    answerAdvanceMs: 140,
    bannerMs: 2200,
    trialMs: 1500,
    distractorRate: 0.25
  }
};

function randomIntBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickGoNoGoRule(excludeId) {
  const candidates = GONOGO_RULES.filter(r => r.id !== excludeId);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function updateGoNoGoRuleText() {
  const el = document.getElementById('gonogo-rule-text');
  if (!el) return;
  el.textContent = '';
  el.style.display = 'none';
}

function showGoNoGoRuleChangeBanner(reason) {
  const el = document.getElementById('gonogo-change-banner');
  if (!gonogoState.session || !gonogoState.session.rule) return;
  el.textContent = reason === 'start'
    ? `Startregel: GO ${gonogoState.session.rule.go.label} | NO-GO ${gonogoState.session.rule.nogo.label}`
    : `Regelwechsel: GO ${gonogoState.session.rule.go.label} | NO-GO ${gonogoState.session.rule.nogo.label}`;
  el.style.display = 'block';
}

function hideGoNoGoRuleChangeBanner() {
  const el = document.getElementById('gonogo-change-banner');
  if (el) el.style.display = 'none';
  if (gonogoState.session) gonogoState.session.ruleChangePending = false;
}

function completeGoNoGoRuleChangeIfPending() {
  if (gonogoState.session && gonogoState.session.ruleChangePending) {
    hideGoNoGoRuleChangeBanner();
  }
}

function maybeRotateGoNoGoRule() {
  if (!gonogoState.session) return;
  gonogoState.session.untilRuleChange--;
  if (gonogoState.session.untilRuleChange > 0) return;
  const previousId = gonogoState.session.rule ? gonogoState.session.rule.id : null;
  gonogoState.session.rule = pickGoNoGoRule(previousId);
  gonogoState.session.untilRuleChange = randomIntBetween(gonogoState.session.profile.ruleChangeMin, gonogoState.session.profile.ruleChangeMax);
  gonogoState.session.ruleJustChanged = true;
  gonogoState.session.ruleChangePending = true;
  updateGoNoGoRuleText();
  showGoNoGoRuleChangeBanner();
}

function styleGoNoGoStimulus(el, descriptor) {
  el.style.background = descriptor.color;
  el.style.borderColor = descriptor.border;
  el.style.clipPath = 'none';
  if (descriptor.shape === 'circle') {
    el.style.borderRadius = '50%';
  } else if (descriptor.shape === 'square') {
    el.style.borderRadius = '12px';
  } else if (descriptor.shape === 'triangle') {
    el.style.borderRadius = '0';
    el.style.clipPath = 'polygon(50% 4%, 95% 92%, 5% 92%)';
  } else {
    el.style.borderRadius = '0';
    el.style.clipPath = 'polygon(50% 4%, 96% 50%, 50% 96%, 4% 50%)';
  }
}

function buildGoNoGoStimulus() {
  const rule = gonogoState.session.rule;
  if (Math.random() < gonogoState.session.profile.distractorRate) {
    // Pick a shape+color combo that is neither GO nor NO-GO
    const candidates = [];
    GONOGO_PALETTE_SHAPES.forEach(shape => {
      GONOGO_PALETTE_COLORS.forEach(col => {
        if (shape === rule.go.shape && col.color === rule.go.color) return;
        if (shape === rule.nogo.shape && col.color === rule.nogo.color) return;
        candidates.push({ shape, color: col.color, border: col.border });
      });
    });
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    return {
      isGo: false,
      isDistractor: true,
      shape: pick.shape,
      color: pick.color,
      border: pick.border,
      startedAt: Date.now(),
      answered: false
    };
  }
  const isGo = Math.random() < 0.68;
  const descriptor = isGo ? rule.go : rule.nogo;
  return {
    isGo,
    isDistractor: false,
    shape: descriptor.shape,
    color: descriptor.color,
    border: descriptor.border,
    startedAt: Date.now(),
    answered: false
  };
}

function renderGoNoGoStimulus() {
  if (!gonogoState.session) return;
  // clear any existing per-trial timer
  if (gonogoState.session.trialTimer) {
    clearTimeout(gonogoState.session.trialTimer);
    gonogoState.session.trialTimer = null;
  }
  if (gonogoState.taskCount > 0) maybeRotateGoNoGoRule();
  gonogoState.currentTask = buildGoNoGoStimulus();
  gonogoState.taskCount++;
  document.getElementById('gonogo-progress').textContent = String(gonogoState.taskCount);
  const stim = document.getElementById('gonogo-stimulus');
  styleGoNoGoStimulus(stim, gonogoState.currentTask);
  const fb = document.getElementById('gonogo-feedback');
  fb.textContent = '';
  fb.className = 'feedback';
  startGoNoGoTrialTimer();
}

function startGoNoGoTrialTimer() {
  if (!gonogoState.session) return;
  const bar = document.getElementById('gonogo-trial-bar');
  bar.style.transition = 'none';
  bar.style.width = '100%';
  const bonus = gonogoState.session.ruleJustChanged ? gonogoState.session.profile.bannerMs + 2500 : 0;
  gonogoState.session.ruleJustChanged = false;
  if (bonus > 0) {
    bar.style.background = 'linear-gradient(90deg,#9a6300,#e09000)';
  } else {
    bar.style.background = 'linear-gradient(90deg,#1a7a2a,#2daa40)';
  }
  void bar.offsetWidth; // force reflow
  const ms = gonogoState.session.profile.trialMs + bonus;
  bar.style.transition = `width ${ms}ms linear`;
  bar.style.width = '0%';
  if (gonogoState.session.trialTimer) clearTimeout(gonogoState.session.trialTimer);
  gonogoState.session.trialTimer = setTimeout(onGoNoGoTrialTimeout, ms);
  gonogoState.trialTimer = gonogoState.session.trialTimer;
}

function onGoNoGoTrialTimeout() {
  if (!gonogoState.session) return;
  gonogoState.session.trialTimer = null;
  gonogoState.trialTimer = null;
  if (!gonogoState.currentTask || gonogoState.currentTask.answered) return;
  gonogoState.currentTask.answered = true;
  gonogoState.session.total++;
  const fb = document.getElementById('gonogo-feedback');
  if (gonogoState.currentTask.isDistractor) {
    gonogoState.session.correct++;
    gonogoState.session.distractorTotal++;
    gonogoState.session.distractorCorrect++;
    fb.textContent = 'Richtig - anderer Reiz ignoriert.';
    fb.className = 'feedback richtig';
  } else if (gonogoState.currentTask.isGo) {
    gonogoState.session.wrong++;
    fb.textContent = 'Zu langsam – das war ein GO-Reiz.';
    fb.className = 'feedback falsch';
  } else {
    gonogoState.session.correct++;
    fb.textContent = 'Richtig — NO-GO gehalten.';
    fb.className = 'feedback richtig';
  }
  gonogoState.session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'reaction',
    reactionTimeMs: null,
    correct: !gonogoState.currentTask.isGo,
    omitted: !!gonogoState.currentTask.isGo,
    anticipated: false,
    difficultyLevel: null,
    sequenceLength: null,
    mode: gonogoState.session.difficulty,
    blockLabel: gonogoState.session.rule ? gonogoState.session.rule.id : null
  });
  completeGoNoGoRuleChangeIfPending();
  if (gonogoState.advanceTimer) clearTimeout(gonogoState.advanceTimer);
  gonogoState.advanceTimer = setTimeout(() => {
    gonogoState.advanceTimer = null;
    renderGoNoGoStimulus();
  }, gonogoState.session.profile.answerAdvanceMs);
}

function startGoNoGoExercise() {
  const selectedMinutes = parseInt(document.getElementById('gonogo-time-select').value, 10) || 5;
  const diffKeyRaw = document.getElementById('gonogo-difficulty-select').value;
  const diffKey = Object.prototype.hasOwnProperty.call(GONOGO_DIFFICULTY, diffKeyRaw) ? diffKeyRaw : 'medium';
  const profile = GONOGO_DIFFICULTY[diffKey];
  const totalSeconds = selectedMinutes * 60;
  gonogoState.session = {
    difficulty: diffKey,
    profile,
    startedAt: Date.now(),
    totalSeconds,
    remainingSeconds: totalSeconds,
    correct: 0,
    wrong: 0,
    total: 0,
    rtSum: 0,
    rtCount: 0,
    distractorTotal: 0,
    distractorCorrect: 0,
    commissionErrors: 0,
    trials: [],
    trialTimer: null,
    rule: pickGoNoGoRule(null),
    untilRuleChange: randomIntBetween(profile.ruleChangeMin, profile.ruleChangeMax),
    ruleChangePending: false,
    // Give the very first task extra reading time using the same bonus path as rule changes.
    ruleJustChanged: true
  };
  gonogoState.taskCount = 0;
  showScreen('screen-gonogo-exercise');
  clearGoNoGoTimer();
  updateModuleTimer('gonogo', gonogoState.session);
  document.getElementById('gonogo-level-label').textContent = profile.label;
  updateGoNoGoRuleText();
  showGoNoGoRuleChangeBanner('start');
  gonogoState.timerInterval = setInterval(() => {
    if (!gonogoState.session) return;
    gonogoState.session.remainingSeconds--;
    updateModuleTimer('gonogo', gonogoState.session);
    if (gonogoState.session.remainingSeconds <= 0) finishGoNoGoExercise(true);
  }, 1000);
  renderGoNoGoStimulus();
}

function submitGoNoGoAnswer(react) {
  if (!gonogoState.session || !gonogoState.currentTask || gonogoState.currentTask.answered) return;
  // Stop trial timer and freeze bar
  if (gonogoState.session.trialTimer) {
    clearTimeout(gonogoState.session.trialTimer);
    gonogoState.session.trialTimer = null;
    gonogoState.trialTimer = null;
  }
  const bar = document.getElementById('gonogo-trial-bar');
  bar.style.transition = 'none';
  bar.style.width = '0%';

  gonogoState.currentTask.answered = true;
  gonogoState.session.total++;
  const fb = document.getElementById('gonogo-feedback');
  const reactionTimeMs = react ? Math.max(0, Date.now() - gonogoState.currentTask.startedAt) : null;
  const anticipated = reactionTimeMs !== null && reactionTimeMs < 150;
  let trialCorrect = false;
  let trialOmitted = false;

  if (gonogoState.currentTask.isDistractor) {
    // Any button press on a distractor is a false alarm
    gonogoState.session.wrong++;
    gonogoState.session.distractorTotal++;
    gonogoState.session.commissionErrors++;
    fb.textContent = 'Falsch. Diese Kombination bitte ignorieren.';
    fb.className = 'feedback falsch';
  } else {
    const shouldReact = gonogoState.currentTask.isGo;
    const ok = react === shouldReact;
    trialCorrect = ok;
    trialOmitted = shouldReact && !react;
    if (ok) {
      gonogoState.session.correct++;
      fb.textContent = 'Richtig!';
      fb.className = 'feedback richtig';
      if (react) {
        gonogoState.session.rtSum += reactionTimeMs;
        gonogoState.session.rtCount++;
      }
    } else {
      gonogoState.session.wrong++;
      if (!shouldReact) {
        gonogoState.session.commissionErrors++;
        fb.textContent = 'Falsch. Das war ein NO-GO-Reiz.';
      } else {
        fb.textContent = 'Falsch. Das war ein GO-Reiz.';
      }
      fb.className = 'feedback falsch';
    }
  }

  gonogoState.session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'reaction',
    reactionTimeMs,
    correct: trialCorrect,
    omitted: trialOmitted,
    anticipated,
    difficultyLevel: null,
    sequenceLength: null,
    mode: gonogoState.session.difficulty,
    blockLabel: gonogoState.session.rule ? gonogoState.session.rule.id : null
  });

  completeGoNoGoRuleChangeIfPending();

  if (gonogoState.advanceTimer) clearTimeout(gonogoState.advanceTimer);
  gonogoState.advanceTimer = setTimeout(() => {
    gonogoState.advanceTimer = null;
    renderGoNoGoStimulus();
  }, gonogoState.session.profile.answerAdvanceMs);
}

function finishGoNoGoExercise(timedOut) {
  clearGoNoGoTimer();
  if (!gonogoState.session) {
    showScreen('screen-gonogo-results');
    return;
  }
  hideGoNoGoRuleChangeBanner();
  const pct = getAccuracyPercent(gonogoState.session.correct, gonogoState.session.total);
  const elapsed = getElapsedSeconds(gonogoState.session.startedAt, gonogoState.session.totalSeconds, timedOut);
  const avgRt = gonogoState.session.rtCount > 0 ? Math.round(gonogoState.session.rtSum / gonogoState.session.rtCount) : null;
  setTextEntries({
    'gonogo-result-percent': `${pct}%`,
    'gonogo-result-difficulty': gonogoState.session.profile.label,
    'gonogo-result-limit': formatTime(gonogoState.session.totalSeconds),
    'gonogo-result-correct': String(gonogoState.session.correct),
    'gonogo-result-wrong': String(gonogoState.session.wrong),
    'gonogo-result-total': String(gonogoState.session.total),
    'gonogo-result-distractor': gonogoState.session.distractorTotal > 0
      ? `${gonogoState.session.distractorCorrect} / ${gonogoState.session.distractorTotal}`
      : '-',
    'gonogo-result-commission': String(gonogoState.session.commissionErrors),
    'gonogo-result-duration': formatTime(elapsed),
    'gonogo-result-rt': avgRt === null ? '-' : `${avgRt} ms`
  });
  setResultInsight('gonogo-result-insight', 'gonogo', pct, { avgRt });
  saveTrainingEntry({
    module: 'gonogo',
    label: 'Go / No-Go',
    avgRt,
    trials: gonogoState.session.trials,
    correct: gonogoState.session.correct,
    wrong: gonogoState.session.wrong,
    total: gonogoState.session.total,
    accuracy: pct,
    duration: elapsed,
    totalSeconds: gonogoState.session.totalSeconds
  });
  showScreen('screen-gonogo-results');
}

function restartGoNoGoMode() {
  startGoNoGoExercise();
}

const STROOP_COLOR_WORDS = ['ROT', 'BLAU', 'GRUEN', 'GELB'];
const STROOP_NEUTRAL_WORDS = ['XXXX', 'HAUS', 'MOND', 'BUCH'];
const STROOP_COLOR_MAP = {
  ROT: { key: 'rot', css: '#b82020' },
  BLAU: { key: 'blau', css: '#0f2d6b' },
  GRUEN: { key: 'gruen', css: '#1a7a2a' },
  GELB: { key: 'gelb', css: '#b58a00' }
};
const STROOP_WORD_DISPLAY = { ROT: 'ROT', BLAU: 'BLAU', GRUEN: 'GRÜN', GELB: 'GELB' };
const STROOP_KEY_MAP = { r: 'rot', b: 'blau', g: 'gruen', y: 'gelb' };
const STROOP_BLOCK_CONFIG = { blocks: 3, trialsPerBlock: 40, pauseSeconds: 15 };
const STROOP_RULE_SWITCH_EXTRA_MS = 900;
const STROOP_DIFFICULTY = {
  easy: {
    label: 'Leicht',
    trialMs: 4000,
    answerAdvanceMs: 420,
    ruleSwitchMin: 7,
    ruleSwitchMax: 12
  },
  medium: {
    label: 'Mittel',
    trialMs: 2000,
    answerAdvanceMs: 260,
    ruleSwitchMin: 6,
    ruleSwitchMax: 11
  },
  hard: {
    label: 'Schwer',
    trialMs: 1500,
    answerAdvanceMs: 160,
    ruleSwitchMin: 4,
    ruleSwitchMax: 8
  }
};

function stroopRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function stroopRuleLabel(rule) {
  return rule === 'word' ? 'Wort' : 'Schriftfarbe';
}

function updateStroopRuleIndicator() {
  const indicator = document.getElementById('stroop-rule-indicator');
  if (!indicator || !stroopState.session) return;
  if (stroopState.session.showRuleSwitchBanner) {
    indicator.textContent = stroopState.session.ruleBannerReason === 'start'
      ? `Startregel: ${stroopRuleLabel(stroopState.session.answerRule)}`
      : `Regelwechsel: ${stroopRuleLabel(stroopState.session.answerRule)}`;
  } else {
    indicator.textContent = `Regel: ${stroopRuleLabel(stroopState.session.answerRule)}`;
  }
  indicator.classList.toggle('rule-attention', !!stroopState.session.showRuleSwitchBanner);
}

function acknowledgeStroopRuleSwitchBanner() {
  if (!stroopState.session || !stroopState.session.showRuleSwitchBanner) return;
  stroopState.session.showRuleSwitchBanner = false;
  stroopState.session.ruleBannerReason = null;
  updateStroopRuleIndicator();
}

function setStroopModeHint() {
  const modeSelect = document.getElementById('stroop-mode-select');
  const hint = document.getElementById('stroop-mode-hint');
  if (!modeSelect || !hint) return;
  hint.textContent = modeSelect.value === 'block'
    ? 'Blockmodus: 3 Blöcke mit je 40 Reizen, dazwischen 15 Sekunden Pause.'
    : 'Zeitmodus: Löse so viele Aufgaben wie möglich innerhalb des Zeitlimits.';
}

function setStroopDifficultyHint() {
  const diffSelect = document.getElementById('stroop-difficulty-select');
  const hint = document.getElementById('stroop-difficulty-hint');
  if (!diffSelect || !hint) return;

  const diffKeyRaw = diffSelect.value;
  const diffKey = Object.prototype.hasOwnProperty.call(STROOP_DIFFICULTY, diffKeyRaw) ? diffKeyRaw : 'medium';
  const profile = STROOP_DIFFICULTY[diffKey];
  const seconds = (profile.trialMs / 1000).toFixed(1).replace('.', ',');
  hint.textContent = `${profile.label}: ${seconds}s Reizzeit pro Aufgabe.`;
}

(function setupStroopModeUi() {
  const modeSelect = document.getElementById('stroop-mode-select');
  const diffSelect = document.getElementById('stroop-difficulty-select');
  if (modeSelect) modeSelect.addEventListener('change', setStroopModeHint);
  if (diffSelect) diffSelect.addEventListener('change', setStroopDifficultyHint);
  setStroopModeHint();
  setStroopDifficultyHint();
})();

function setStroopAnswerButtonsDisabled(disabled) {
  document.querySelectorAll('[data-stroop-answer]').forEach(btn => {
    btn.disabled = disabled;
  });
  const skipBtn = document.getElementById('stroop-skip-btn');
  if (skipBtn) skipBtn.disabled = disabled;
}

function updateStroopBlockStatus() {
  const status = document.getElementById('stroop-block-status');
  if (!status || !stroopState.session) return;
  const ruleText = stroopRuleLabel(stroopState.session.answerRule);

  if (stroopState.session.mode === 'block') {
    const cfg = stroopState.session.blockConfig;
    if (stroopState.session.inPause) {
      status.textContent = `Pause vor Block ${stroopState.session.blockIndex + 1}/${cfg.blocks} · weiter in ${stroopState.session.pauseRemaining}s · Regel: ${ruleText}`;
      return;
    }
    const trialNo = Math.min(stroopState.session.trialInBlock + 1, cfg.trialsPerBlock);
    status.textContent = `Block ${stroopState.session.blockIndex}/${cfg.blocks} · Reiz ${trialNo}/${cfg.trialsPerBlock} · Regel: ${ruleText}`;
    return;
  }

  status.textContent = `Zeitmodus · Reiz ${Math.max(1, stroopState.taskCount)} · Regel: ${ruleText}`;
}

function buildStroopTask() {
  const useWordRule = stroopState.session && stroopState.session.answerRule === 'word';
  const roll = Math.random();
  let condition = 'incongruent';

  if (useWordRule) {
    condition = roll < 0.5 ? 'congruent' : 'incongruent';
  } else {
    if (roll < 0.2) condition = 'neutral';
    else if (roll < 0.6) condition = 'congruent';
  }

  let word = '';
  let colorWord = randomFrom(STROOP_COLOR_WORDS);

  if (condition === 'congruent') {
    word = colorWord;
  } else if (condition === 'incongruent') {
    word = randomFrom(STROOP_COLOR_WORDS);
    while (word === colorWord) {
      word = randomFrom(STROOP_COLOR_WORDS);
    }
  } else {
    word = randomFrom(STROOP_NEUTRAL_WORDS);
  }

  return {
    word,
    condition,
    wordKey: STROOP_COLOR_MAP[word] ? STROOP_COLOR_MAP[word].key : null,
    colorKey: STROOP_COLOR_MAP[colorWord].key,
    colorCss: STROOP_COLOR_MAP[colorWord].css,
    shownAt: 0,
    answered: false
  };
}

function maybeSwitchStroopRule() {
  if (!stroopState.session) return;
  stroopState.session.trialsSinceRuleSwitch++;
  if (stroopState.session.trialsSinceRuleSwitch < stroopState.session.nextRuleSwitchAfter) return;

  stroopState.session.answerRule = stroopState.session.answerRule === 'color' ? 'word' : 'color';
  stroopState.session.ruleSwitches++;
  stroopState.session.trialsSinceRuleSwitch = 0;
  stroopState.session.nextRuleSwitchAfter = stroopRandomInt(stroopState.session.profile.ruleSwitchMin, stroopState.session.profile.ruleSwitchMax);
  stroopState.session.showRuleSwitchBanner = true;
  stroopState.session.ruleBannerReason = 'switch';
}

function stopStroopTrialTimer(resetBarToZero) {
  if (stroopState.trialTimer) {
    clearTimeout(stroopState.trialTimer);
    stroopState.trialTimer = null;
  }
  if (stroopState.trialInterval) {
    clearInterval(stroopState.trialInterval);
    stroopState.trialInterval = null;
  }
  if (stroopState.session && stroopState.session.trialTimer) {
    clearTimeout(stroopState.session.trialTimer);
    stroopState.session.trialTimer = null;
  }
  if (stroopState.session && stroopState.session.trialInterval) {
    clearInterval(stroopState.session.trialInterval);
    stroopState.session.trialInterval = null;
  }

  const bar = document.getElementById('stroop-trial-bar');
  if (bar && resetBarToZero) {
    bar.style.transition = 'none';
    bar.style.width = '0%';
  }
}

function updateStroopTrialTimerLabel() {
  const label = document.getElementById('stroop-trial-time');
  if (!label || !stroopState.session) return;

  const now = Date.now();
  const remainingMs = Math.max(0, (stroopState.session.trialEndsAt || now) - now);
  const seconds = (remainingMs / 1000).toFixed(1).replace('.', ',');
  label.textContent = stroopState.session.showRuleSwitchBanner
    ? `Reizzeit: ${seconds}s · ${stroopState.session.ruleBannerReason === 'start' ? 'Startregel' : 'Regelwechsel'}`
    : `Reizzeit: ${seconds}s`;
}

function startStroopTrialTimer() {
  if (!stroopState.session || stroopState.session.inPause) return;

  stopStroopTrialTimer(false);

  const bar = document.getElementById('stroop-trial-bar');
  if (!bar) return;

  const ms = stroopState.session.profile.trialMs + (stroopState.session.showRuleSwitchBanner ? STROOP_RULE_SWITCH_EXTRA_MS : 0);
  stroopState.session.trialEndsAt = Date.now() + ms;
  bar.style.transition = 'none';
  bar.style.width = '100%';
  bar.style.background = stroopState.session.showRuleSwitchBanner
    ? 'linear-gradient(90deg,#9a6300,#e09000)'
    : 'linear-gradient(90deg,#1a7a2a,#2daa40)';
  void bar.offsetWidth;
  bar.style.transition = `width ${ms}ms linear`;
  bar.style.width = '0%';

  updateStroopTrialTimerLabel();
  stroopState.trialInterval = setInterval(updateStroopTrialTimerLabel, 100);
  stroopState.trialTimer = setTimeout(() => {
    stopStroopTrialTimer(true);
    updateStroopTrialTimerLabel();
    handleStroopTimeout();
  }, ms);

  stroopState.session.trialTimer = stroopState.trialTimer;
  stroopState.session.trialInterval = stroopState.trialInterval;
}

function handleStroopTimeout() {
  if (!stroopState.session || !stroopState.currentTask || stroopState.currentTask.answered || stroopState.session.inPause) return;

  acknowledgeStroopRuleSwitchBanner();
  stroopState.currentTask.answered = true;
  stroopState.session.total++;
  stroopState.session.wrong++;

  const bucket = stroopState.session[stroopState.currentTask.condition] || stroopState.session.incongruent;
  bucket.total++;
  bucket.wrong++;

  if (stroopState.session.mode === 'block') {
    const blockBucket = stroopState.session.blockStats[stroopState.session.blockIndex - 1];
    if (blockBucket) {
      blockBucket.total++;
      blockBucket.wrong++;
    }
  }

  stroopState.session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'reaction',
    reactionTimeMs: null,
    correct: false,
    omitted: true,
    anticipated: false,
    difficultyLevel: null,
    sequenceLength: null,
    mode: stroopState.session.difficultyKey,
    blockLabel: `${stroopState.currentTask.condition}:${stroopState.session.answerRule}`
  });

  const fb = document.getElementById('stroop-feedback');
  fb.textContent = 'Zeit abgelaufen.';
  fb.className = 'feedback falsch';
  setStroopAnswerButtonsDisabled(true);

  if (stroopState.advanceTimer) clearTimeout(stroopState.advanceTimer);
  stroopState.advanceTimer = setTimeout(() => {
    stroopState.advanceTimer = null;
    advanceStroopFlow();
  }, stroopState.session.profile.answerAdvanceMs);
}

function renderStroopTask() {
  if (!stroopState.session || stroopState.session.inPause) return;
  if (stroopState.advanceTimer) {
    clearTimeout(stroopState.advanceTimer);
    stroopState.advanceTimer = null;
  }
  stopStroopTrialTimer(false);

  stroopState.currentTask = buildStroopTask();
  stroopState.taskCount++;
  if (stroopState.session.mode === 'block') stroopState.session.trialInBlock++;

  document.getElementById('stroop-progress').textContent = String(stroopState.taskCount);
  stroopState.currentTask.shownAt = Date.now();

  const word = document.getElementById('stroop-word');
  word.textContent = STROOP_WORD_DISPLAY[stroopState.currentTask.word] || stroopState.currentTask.word;
  word.style.color = stroopState.currentTask.colorCss;

  const fb = document.getElementById('stroop-feedback');
  fb.textContent = '';
  fb.className = 'feedback';

  setStroopAnswerButtonsDisabled(false);
  updateStroopRuleIndicator();
  updateStroopBlockStatus();
  if (stroopState.session.showRuleSwitchBanner) {
    const fb = document.getElementById('stroop-feedback');
    fb.textContent = stroopState.session.ruleBannerReason === 'start'
      ? 'Start: Erst Regel lesen, dann antworten.'
      : 'Regelwechsel: erst neue Regel anwenden, dann weiter.';
    fb.className = 'feedback';
  }
  startStroopTrialTimer();
}

function startStroopPause() {
  if (!stroopState.session || stroopState.session.mode !== 'block') return;
  const cfg = stroopState.session.blockConfig;

  if (stroopState.session.blockIndex >= cfg.blocks) {
    finishStroopExercise(false);
    return;
  }

  stroopState.session.inPause = true;
  stroopState.session.pauseRemaining = cfg.pauseSeconds;
  stroopState.currentTask = null;
  stopStroopTrialTimer(false);
  setStroopAnswerButtonsDisabled(true);

  const word = document.getElementById('stroop-word');
  word.textContent = 'PAUSE';
  word.style.color = '#6c7a90';

  const fb = document.getElementById('stroop-feedback');
  fb.textContent = `Kurze Pause - weiter in ${stroopState.session.pauseRemaining}s.`;
  fb.className = 'feedback';

  updateStroopBlockStatus();

  if (stroopState.pauseInterval) clearInterval(stroopState.pauseInterval);
  stroopState.pauseInterval = setInterval(() => {
    if (!stroopState.session) return;
    stroopState.session.pauseRemaining--;
    fb.textContent = `Kurze Pause - weiter in ${Math.max(0, stroopState.session.pauseRemaining)}s.`;
    updateStroopBlockStatus();
    if (stroopState.session.pauseRemaining <= 0) {
      clearInterval(stroopState.pauseInterval);
      stroopState.pauseInterval = null;
      stroopState.session.inPause = false;
      stroopState.session.blockIndex++;
      stroopState.session.trialInBlock = 0;
      renderStroopTask();
    }
  }, 1000);
}

function advanceStroopFlow() {
  if (!stroopState.session) return;
  if (stroopState.session.mode === 'block' && stroopState.session.trialInBlock >= stroopState.session.blockConfig.trialsPerBlock) {
    startStroopPause();
    return;
  }
  maybeSwitchStroopRule();
  renderStroopTask();
}

function startStroopExercise() {
  const selectedMode = (document.getElementById('stroop-mode-select').value || 'time');
  const selectedDifficultyRaw = document.getElementById('stroop-difficulty-select').value;
  const selectedDifficulty = Object.prototype.hasOwnProperty.call(STROOP_DIFFICULTY, selectedDifficultyRaw) ? selectedDifficultyRaw : 'medium';
  const profile = STROOP_DIFFICULTY[selectedDifficulty];
  const selectedMinutes = parseInt(document.getElementById('stroop-time-select').value, 10) || 5;
  const totalSeconds = selectedMinutes * 60;
  const blockStats = Array.from({ length: STROOP_BLOCK_CONFIG.blocks }, () => ({ total: 0, correct: 0, wrong: 0, rtSum: 0, rtCount: 0 }));

  stroopState.session = {
    startedAt: Date.now(),
    mode: selectedMode,
    answerRule: 'color',
    difficultyKey: selectedDifficulty,
    profile,
    ruleSwitches: 0,
    trialsSinceRuleSwitch: 0,
    nextRuleSwitchAfter: stroopRandomInt(profile.ruleSwitchMin, profile.ruleSwitchMax),
    showRuleSwitchBanner: true,
    ruleBannerReason: 'start',
    totalSeconds,
    remainingSeconds: totalSeconds,
    inPause: false,
    pauseRemaining: 0,
    trialTimer: null,
    trialInterval: null,
    trialEndsAt: null,
    blockConfig: { ...STROOP_BLOCK_CONFIG },
    blockIndex: 1,
    trialInBlock: 0,
    blockStats,
    correct: 0,
    wrong: 0,
    total: 0,
    rtSum: 0,
    rtCount: 0,
    trials: [],
    congruent: { total: 0, correct: 0, wrong: 0, rtSum: 0, rtCount: 0 },
    incongruent: { total: 0, correct: 0, wrong: 0, rtSum: 0, rtCount: 0 },
    neutral: { total: 0, correct: 0, wrong: 0, rtSum: 0, rtCount: 0 }
  };

  stroopState.taskCount = 0;
  showScreen('screen-stroop-exercise');
  clearStroopTimer();

  if (selectedMode === 'time') {
    updateModuleTimer('stroop', stroopState.session);
    stroopState.timerInterval = setInterval(() => {
      if (!stroopState.session) return;
      stroopState.session.remainingSeconds--;
      updateModuleTimer('stroop', stroopState.session);
      if (stroopState.session.remainingSeconds <= 0) finishStroopExercise(true);
    }, 1000);
  } else {
    document.getElementById('stroop-total-time').textContent = 'Blockmodus';
    document.getElementById('stroop-remaining-time').textContent = `${STROOP_BLOCK_CONFIG.blocks}x${STROOP_BLOCK_CONFIG.trialsPerBlock}`;
    const bar = document.getElementById('stroop-progress-bar');
    bar.style.width = '100%';
    bar.style.background = 'linear-gradient(90deg, #0f2d6b, #2a5fbb)';
  }

  updateStroopRuleIndicator();
  updateStroopBlockStatus();
  renderStroopTask();
}

function submitStroopAnswer(colorKey) {
  if (!stroopState.session || !stroopState.currentTask || stroopState.currentTask.answered || stroopState.session.inPause) return;
  stopStroopTrialTimer(true);

  acknowledgeStroopRuleSwitchBanner();
  stroopState.currentTask.answered = true;
  stroopState.session.total++;

  const bucket = stroopState.session[stroopState.currentTask.condition] || stroopState.session.incongruent;
  bucket.total++;

  const blockBucket = stroopState.session.mode === 'block'
    ? stroopState.session.blockStats[stroopState.session.blockIndex - 1]
    : null;
  if (blockBucket) blockBucket.total++;

  const rt = stroopState.currentTask.shownAt > 0 ? Math.max(0, Date.now() - stroopState.currentTask.shownAt) : null;
  if (rt !== null) {
    stroopState.session.rtSum += rt;
    stroopState.session.rtCount++;
    bucket.rtSum += rt;
    bucket.rtCount++;
    if (blockBucket) {
      blockBucket.rtSum += rt;
      blockBucket.rtCount++;
    }
  }

  const expectedKey = stroopState.session.answerRule === 'word' ? stroopState.currentTask.wordKey : stroopState.currentTask.colorKey;
  const ok = expectedKey !== null && colorKey === expectedKey;
  const anticipated = rt !== null && rt < 150;
  const fb = document.getElementById('stroop-feedback');
  if (ok) {
    stroopState.session.correct++;
    bucket.correct++;
    if (blockBucket) blockBucket.correct++;
    fb.textContent = 'Richtig!';
    fb.className = 'feedback richtig';
  } else {
    stroopState.session.wrong++;
    bucket.wrong++;
    if (blockBucket) blockBucket.wrong++;
    const ruleHint = stroopState.session.answerRule === 'word' ? 'Achte auf das Wort.' : 'Achte auf die Schriftfarbe.';
    fb.textContent = `Falsch. ${ruleHint}`;
    fb.className = 'feedback falsch';
  }

  stroopState.session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'reaction',
    reactionTimeMs: rt,
    correct: ok,
    omitted: false,
    anticipated,
    difficultyLevel: null,
    sequenceLength: null,
    mode: stroopState.session.difficultyKey,
    blockLabel: `${stroopState.currentTask.condition}:${stroopState.session.answerRule}`
  });

  if (stroopState.advanceTimer) clearTimeout(stroopState.advanceTimer);
  stroopState.advanceTimer = setTimeout(() => {
    stroopState.advanceTimer = null;
    advanceStroopFlow();
  }, stroopState.session.profile.answerAdvanceMs);
}

function nextStroopTask() {
  if (!stroopState.session || stroopState.session.inPause) return;
  stopStroopTrialTimer(true);
  acknowledgeStroopRuleSwitchBanner();
  if (stroopState.advanceTimer) {
    clearTimeout(stroopState.advanceTimer);
    stroopState.advanceTimer = null;
  }

  if (stroopState.currentTask && !stroopState.currentTask.answered) {
    stroopState.currentTask.answered = true;
    stroopState.session.total++;
    stroopState.session.wrong++;

    const bucket = stroopState.session[stroopState.currentTask.condition] || stroopState.session.incongruent;
    bucket.total++;
    bucket.wrong++;

    if (stroopState.session.mode === 'block') {
      const blockBucket = stroopState.session.blockStats[stroopState.session.blockIndex - 1];
      if (blockBucket) {
        blockBucket.total++;
        blockBucket.wrong++;
      }
    }

    stroopState.session.trials.push({
      timestamp: new Date().toISOString(),
      kind: 'reaction',
      reactionTimeMs: null,
      correct: false,
      omitted: true,
      anticipated: false,
      difficultyLevel: null,
      sequenceLength: null,
      mode: stroopState.session.difficultyKey,
      blockLabel: `${stroopState.currentTask.condition}:${stroopState.session.answerRule}`
    });
  }

  advanceStroopFlow();
}

function renderStroopBlockBreakdown() {
  const panel = document.getElementById('stroop-block-breakdown');
  const body = document.getElementById('stroop-block-breakdown-body');
  if (!panel || !body || !stroopState.session) return;

  if (stroopState.session.mode !== 'block') {
    panel.classList.add('hidden');
    body.innerHTML = '';
    return;
  }

  panel.classList.remove('hidden');
  body.innerHTML = '';
  stroopState.session.blockStats.forEach((block, idx) => {
    const pct = block.total > 0 ? `${Math.round((block.correct / block.total) * 100)}%` : '-';
    const rt = block.rtCount > 0 ? `${Math.round(block.rtSum / block.rtCount)} ms` : '-';
    body.insertAdjacentHTML('beforeend', `<tr><td>Block ${idx + 1}</td><td>${pct}</td><td>${rt}</td></tr>`);
  });
}

function finishStroopExercise(timedOut) {
  clearStroopTimer();
  if (!stroopState.session) {
    showScreen('screen-stroop-results');
    return;
  }

  const pct = getAccuracyPercent(stroopState.session.correct, stroopState.session.total);
  const elapsed = stroopState.session.mode === 'time'
    ? getElapsedSeconds(stroopState.session.startedAt, stroopState.session.totalSeconds, timedOut)
    : Math.max(0, Math.floor((Date.now() - stroopState.session.startedAt) / 1000));
  const avgRtAll = stroopState.session.rtCount > 0 ? Math.round(stroopState.session.rtSum / stroopState.session.rtCount) : null;
  const congAcc = stroopState.session.congruent.total > 0 ? Math.round((stroopState.session.congruent.correct / stroopState.session.congruent.total) * 100) : null;
  const incongAcc = stroopState.session.incongruent.total > 0 ? Math.round((stroopState.session.incongruent.correct / stroopState.session.incongruent.total) * 100) : null;
  const neutralAcc = stroopState.session.neutral.total > 0 ? Math.round((stroopState.session.neutral.correct / stroopState.session.neutral.total) * 100) : null;
  const congErr = stroopState.session.congruent.total > 0 ? (stroopState.session.congruent.wrong / stroopState.session.congruent.total) * 100 : null;
  const incongErr = stroopState.session.incongruent.total > 0 ? (stroopState.session.incongruent.wrong / stroopState.session.incongruent.total) * 100 : null;
  const congRt = stroopState.session.congruent.rtCount > 0 ? stroopState.session.congruent.rtSum / stroopState.session.congruent.rtCount : null;
  const incongRt = stroopState.session.incongruent.rtCount > 0 ? stroopState.session.incongruent.rtSum / stroopState.session.incongruent.rtCount : null;
  const interferenceRt = incongRt !== null && congRt !== null ? Math.round(incongRt - congRt) : null;
  const interferenceErr = incongErr !== null && congErr !== null ? Math.round((incongErr - congErr) * 10) / 10 : null;

  document.getElementById('stroop-result-percent').textContent = `${pct}%`;
  document.getElementById('stroop-result-difficulty').textContent = stroopState.session.profile.label;
  document.getElementById('stroop-result-limit').textContent = stroopState.session.mode === 'block'
    ? `${stroopState.session.blockConfig.blocks}x${stroopState.session.blockConfig.trialsPerBlock}`
    : formatTime(stroopState.session.totalSeconds);
  document.getElementById('stroop-result-correct').textContent = String(stroopState.session.correct);
  document.getElementById('stroop-result-wrong').textContent = String(stroopState.session.wrong);
  document.getElementById('stroop-result-total').textContent = String(stroopState.session.total);
  document.getElementById('stroop-result-duration').textContent = formatTime(elapsed);
  document.getElementById('stroop-result-rt-all').textContent = avgRtAll === null ? '-' : `${avgRtAll} ms`;
  document.getElementById('stroop-result-acc-cong').textContent = congAcc === null ? '-' : `${congAcc}%`;
  document.getElementById('stroop-result-acc-incong').textContent = incongAcc === null ? '-' : `${incongAcc}%`;
  document.getElementById('stroop-result-acc-neutral').textContent = neutralAcc === null ? '-' : `${neutralAcc}%`;
  document.getElementById('stroop-result-int-rt').textContent = interferenceRt === null ? '-' : `${interferenceRt} ms`;
  document.getElementById('stroop-result-int-err').textContent = interferenceErr === null ? '-' : `${interferenceErr}%`;
  setResultInsight('stroop-result-insight', 'stroop', pct, { avgRtAll, interferenceRt, interferenceErr });
  saveTrainingEntry({
    module: 'stroop',
    label: 'Stroop',
    avgRt: avgRtAll,
    trials: stroopState.session.trials,
    correct: stroopState.session.correct,
    wrong: stroopState.session.wrong,
    total: stroopState.session.total,
    accuracy: pct,
    duration: elapsed,
    totalSeconds: stroopState.session.totalSeconds || 0
  });
  renderStroopBlockBreakdown();
  showScreen('screen-stroop-results');
}

function restartStroopMode() {
  startStroopExercise();
}

const CONCENTRATION_POSITIONS = 36;
const CONCENTRATION_RADIUS = 200;
const CONCENTRATION_JUMP_INTERVAL_MS = 1000;
const CONCENTRATION_DOUBLE_MIN_MS = 3000;
const CONCENTRATION_DOUBLE_MAX_MS = 60000;
const CONCENTRATION_MISSED_FEEDBACK_MS = 800;

function getConcentrationDirectionLabel(dir, pathType) {
  const dirLabel = dir === 'clockwise' ? 'Uhrzeigersinn' : 'Gegen Uhrzeigersinn';
  const shapeLabel = pathType === 'eight' ? '· 8er-Form' : '· Kreis';
  return dirLabel + ' ' + shapeLabel;
}

function getConcentrationAngle(positionIndex) {
  return (positionIndex / CONCENTRATION_POSITIONS) * 360 - 90;
}

function getConcentrationCoords(positionIndex, pathType) {
  if (pathType === 'eight') {
    // Continuous infinity path (lemniscate-like), avoids branch switching at center.
    const t = (positionIndex / CONCENTRATION_POSITIONS) * Math.PI * 2;
    const a = 180;
    const b = 120;
    const cx = 240 + a * Math.sin(t);
    const cy = 240 + b * Math.sin(t) * Math.cos(t);
    return { cx, cy };
  }
  const angle = (getConcentrationAngle(positionIndex) * Math.PI) / 180;
  return { cx: 240 + CONCENTRATION_RADIUS * Math.cos(angle), cy: 240 + CONCENTRATION_RADIUS * Math.sin(angle) };
}

function scheduleNextConcentrationDouble() {
  if (!concentrationState.session || concentrationState.doubleTimer) return;
  const delayMs = CONCENTRATION_DOUBLE_MIN_MS + Math.random() * (CONCENTRATION_DOUBLE_MAX_MS - CONCENTRATION_DOUBLE_MIN_MS);
  concentrationState.doubleTimer = setTimeout(() => {
    concentrationState.doubleTimer = null;
    concentrationState.session.nextIsDouble = true;
  }, delayMs);
}

function generateConcentrationMove(session) {
  const isDouble = !!session.nextIsDouble;
  session.nextIsDouble = false;
  const step = isDouble ? 2 : 1;
  let nextPos;
  if (session.direction === 'clockwise') {
    nextPos = (session.currentPosition + step) % CONCENTRATION_POSITIONS;
  } else {
    nextPos = (session.currentPosition - step + CONCENTRATION_POSITIONS) % CONCENTRATION_POSITIONS;
  }
  return {
    isDouble,
    step,
    positionIndex: nextPos,
    timestamp: Date.now(),
    answered: false
  };
}

function clearConcentrationTimer() {
  clearStateInterval(concentrationState, 'timerInterval');
  clearStateTimeout(concentrationState, 'advanceTimer');
  clearStateInterval(concentrationState, 'moveInterval');
  clearStateTimeout(concentrationState, 'doubleTimer');
}

function updateConcentrationDirectionLabel() {
  const label = document.getElementById('concentration-direction-label');
  if (!label || !concentrationState.session) return;
  label.textContent = getConcentrationDirectionLabel(concentrationState.session.direction, concentrationState.session.pathType);
}

function renderConcentrationMove() {
  if (!concentrationState.session) return;

  const fb = document.getElementById('concentration-feedback');
  const missedDouble = concentrationState.currentTask && concentrationState.currentTask.isDouble && !concentrationState.currentTask.answered;

  // Check if previous double was missed
  if (missedDouble && fb) {
    fb.textContent = 'Vergessen!';
    fb.className = 'feedback falsch';
    concentrationState.session.wrong++;
    concentrationState.session.feedbackHoldUntil = Date.now() + CONCENTRATION_MISSED_FEEDBACK_MS;
    concentrationState.session.trials.push({
      timestamp: new Date().toISOString(),
      kind: 'reaction',
      reactionTimeMs: null,
      correct: false,
      omitted: true,
      anticipated: false,
      difficultyLevel: 2,
      sequenceLength: null,
      mode: concentrationState.session.pathType,
      blockLabel: concentrationState.session.direction
    });
  }

  concentrationState.currentTask = generateConcentrationMove(concentrationState.session);
  concentrationState.session.total++;

  if (concentrationState.currentTask.isDouble) {
    concentrationState.session.doubles++;
  }

  // Keep "Vergessen!" briefly visible; otherwise clear stale feedback on new moves.
  if (fb && !missedDouble) {
    if (!concentrationState.session.feedbackHoldUntil || Date.now() >= concentrationState.session.feedbackHoldUntil) {
      fb.textContent = '';
      fb.className = '';
      concentrationState.session.feedbackHoldUntil = 0;
    }
  }

  concentrationState.session.currentPosition = concentrationState.currentTask.positionIndex;

  const coords = getConcentrationCoords(concentrationState.currentTask.positionIndex, concentrationState.session.pathType);
  const dot = document.getElementById('concentration-dot');
  if (dot) {
    dot.setAttribute('cx', Math.round(coords.cx));
    dot.setAttribute('cy', Math.round(coords.cy));
  }

  document.getElementById('concentration-progress').textContent = String(concentrationState.session.total);

  // Schedule next double if not already pending
  if (!concentrationState.session.nextIsDouble && !concentrationState.doubleTimer) {
    scheduleNextConcentrationDouble();
  }
}

function submitConcentrationClick() {
  if (!concentrationState.session || !concentrationState.currentTask || concentrationState.currentTask.answered) return;

  concentrationState.currentTask.answered = true;
  concentrationState.session.clickCount++;
  document.getElementById('concentration-clicks').textContent = String(concentrationState.session.clickCount);

  const fb = document.getElementById('concentration-feedback');
  concentrationState.session.feedbackHoldUntil = 0;

  if (concentrationState.currentTask.isDouble) {
    concentrationState.session.correct++;
    fb.textContent = 'Richtig! ✓';
    fb.className = 'feedback richtig';
    const rt = Date.now() - concentrationState.currentTask.timestamp;
    concentrationState.session.rtSum += rt;
    concentrationState.session.rtCount++;
    concentrationState.session.trials.push({
      timestamp: new Date().toISOString(),
      kind: 'reaction',
      reactionTimeMs: rt,
      correct: true,
      omitted: false,
      anticipated: rt < 150,
      difficultyLevel: 2,
      sequenceLength: null,
      mode: concentrationState.session.pathType,
      blockLabel: concentrationState.session.direction
    });
    // Schedule next double jump after correct detection
    if (!concentrationState.session.nextIsDouble && !concentrationState.doubleTimer) {
      scheduleNextConcentrationDouble();
    }
  } else {
    concentrationState.session.wrong++;
    fb.textContent = 'Falsch!';
    fb.className = 'feedback falsch';
    concentrationState.session.trials.push({
      timestamp: new Date().toISOString(),
      kind: 'reaction',
      reactionTimeMs: Math.max(0, Date.now() - concentrationState.currentTask.timestamp),
      correct: false,
      omitted: false,
      anticipated: false,
      difficultyLevel: 1,
      sequenceLength: null,
      mode: concentrationState.session.pathType,
      blockLabel: concentrationState.session.direction
    });
  }
}

function startConcentrationExercise() {
  const selectedDirection = Math.random() < 0.5 ? 'clockwise' : 'counterclockwise';
  const selectedPathType = Math.random() < 0.5 ? 'circle' : 'eight';
  const selectedMinutes = parseInt(document.getElementById('concentration-time-select').value, 10) || 3;
  const totalSeconds = selectedMinutes * 60;

  concentrationState.session = {
    startedAt: Date.now(),
    direction: selectedDirection,
    pathType: selectedPathType,
    totalSeconds,
    remainingSeconds: totalSeconds,
    currentPosition: 0,
    nextIsDouble: false,
    doubleTimer: null,
    moveInterval: null,
    total: 0,
    doubles: 0,
    correct: 0,
    wrong: 0,
    clickCount: 0,
    rtSum: 0,
    rtCount: 0,
    feedbackHoldUntil: 0,
    trials: []
  };

  concentrationState.taskCount = 0;
  concentrationState.currentTask = null;
  showScreen('screen-concentration-exercise');
  clearConcentrationTimer();

  updateConcentrationDirectionLabel();
  updateModuleTimer('concentration', concentrationState.session);

  concentrationState.timerInterval = setInterval(() => {
    if (!concentrationState.session) return;
    concentrationState.session.remainingSeconds--;
    updateModuleTimer('concentration', concentrationState.session);
    if (concentrationState.session.remainingSeconds <= 0) finishConcentrationExercise(true);
  }, 1000);

  // First jump immediately, then every second
  renderConcentrationMove();
  concentrationState.moveInterval = setInterval(() => {
    if (!concentrationState.session) return;
    renderConcentrationMove();
  }, CONCENTRATION_JUMP_INTERVAL_MS);

  // Schedule first double jump
  scheduleNextConcentrationDouble();
}

function finishConcentrationExercise(timedOut) {
  clearConcentrationTimer();
  if (!concentrationState.session) {
    showScreen('screen-concentration-results');
    return;
  }

  const scoredReactions = concentrationState.session.correct + concentrationState.session.wrong;
  const accuracy = getAccuracyPercent(concentrationState.session.correct, scoredReactions);
  const elapsed = getElapsedSeconds(concentrationState.session.startedAt, concentrationState.session.totalSeconds, timedOut);
  const avgRt = concentrationState.session.rtCount > 0 ? Math.round(concentrationState.session.rtSum / concentrationState.session.rtCount) : null;

  setTextEntries({
    'concentration-result-percent': `${accuracy}%`,
    'concentration-result-rt': avgRt === null ? '-' : String(avgRt),
    'concentration-result-direction': getConcentrationDirectionLabel(concentrationState.session.direction, concentrationState.session.pathType),
    'concentration-result-limit': formatTime(concentrationState.session.totalSeconds),
    'concentration-result-total': String(concentrationState.session.total),
    'concentration-result-doubles': String(concentrationState.session.doubles),
    'concentration-result-correct': String(concentrationState.session.correct),
    'concentration-result-wrong': String(concentrationState.session.wrong),
    'concentration-result-duration': formatTime(elapsed)
  });
  setResultInsight('concentration-result-insight', 'concentration', accuracy, { avgRt, doubles: concentrationState.session.doubles });
  saveTrainingEntry({
    module: 'concentration',
    label: 'Konzentration',
    avgRt,
    trials: concentrationState.session.trials,
    correct: concentrationState.session.correct,
    wrong: concentrationState.session.wrong,
    total: scoredReactions,
    accuracy: accuracy,
    duration: elapsed,
    totalSeconds: concentrationState.session.totalSeconds
  });

  showScreen('screen-concentration-results');
}

function restartConcentrationMode() {
  startConcentrationExercise();
}

// ═══════════════════════════ MULTITASKING ═══════════════════════════

const MULTITASK_OPERATIONS = ['add', 'sub', 'mul', 'div'];
const MULTITASK_TOP_MODE_POOL = ['gonogo', 'stroop', 'gonogo', 'stroop', 'formen'];
const MULTITASK_TOP_PHASE_SECONDS = 22;
const MULTITASK_GONOGO_TRIAL_MS = 10000;
const MULTITASK_STROOP_TRIAL_MS = 10000;
const MULTITASK_FORMEN_TRIAL_MS = 10000;
const MULTITASK_TOP_ADVANCE_MS = 260;

function clearMultitaskingTimer() {
  clearStateInterval(multitaskingState, 'timerInterval');
  clearStateTimeout(multitaskingState, 'topTrialTimer');
  clearStateTimeout(multitaskingState, 'topAdvanceTimer');
  clearStateTimeout(multitaskingState, 'topPhaseTimer');
  const inp = document.getElementById('multitask-math-input');
  if (inp) {
    inp.removeEventListener('input', handleMultitaskingMathInput);
    inp.removeEventListener('keydown', handleMultitaskingMathKeydown);
  }
}

function buildMultitaskMathTask() {
  const op = MULTITASK_OPERATIONS[Math.floor(Math.random() * MULTITASK_OPERATIONS.length)];
  let a, b, answer;

  if (op === 'add') {
    a = Math.floor(Math.random() * 81) + 10;
    b = Math.floor(Math.random() * (100 - a)) + 1;
    answer = a + b;
  } else if (op === 'sub') {
    a = Math.floor(Math.random() * 90) + 10;
    b = Math.floor(Math.random() * 90) + 10;
    if (a < b) [a, b] = [b, a];
    answer = a - b;
  } else if (op === 'mul') {
    b = Math.floor(Math.random() * 9) + 2;
    a = Math.floor(Math.random() * Math.floor(100 / b)) + 1;
    answer = a * b;
  } else {
    b = Math.floor(Math.random() * 9) + 2;
    answer = Math.floor(Math.random() * Math.floor(100 / b)) + 1;
    a = answer * b;
  }

  return { a, b, op, answer, answered: false };
}

function buildMultitaskGoNoGoTrial(rule) {
  if (Math.random() < 0.2) {
    const candidates = [];
    GONOGO_PALETTE_SHAPES.forEach(shape => {
      GONOGO_PALETTE_COLORS.forEach(col => {
        if (shape === rule.go.shape && col.color === rule.go.color) return;
        if (shape === rule.nogo.shape && col.color === rule.nogo.color) return;
        candidates.push({ shape, color: col.color, border: col.border });
      });
    });
    const pick = randomFrom(candidates);
    return {
      mode: 'gonogo',
      isGo: false,
      isDistractor: true,
      shape: pick.shape,
      color: pick.color,
      border: pick.border,
      answered: false,
      shownAt: Date.now()
    };
  }

  const isGo = Math.random() < 0.68;
  const descriptor = isGo ? rule.go : rule.nogo;
  return {
    mode: 'gonogo',
    isGo,
    isDistractor: false,
    shape: descriptor.shape,
    color: descriptor.color,
    border: descriptor.border,
    answered: false,
    shownAt: Date.now()
  };
}

function buildMultitaskStroopTrial() {
  const roll = Math.random();
  let condition = 'incongruent';
  if (roll < 0.2) condition = 'neutral';
  else if (roll < 0.6) condition = 'congruent';

  let word = '';
  const colorWord = randomFrom(STROOP_COLOR_WORDS);
  if (condition === 'congruent') {
    word = colorWord;
  } else if (condition === 'incongruent') {
    word = randomFrom(STROOP_COLOR_WORDS);
    while (word === colorWord) word = randomFrom(STROOP_COLOR_WORDS);
  } else {
    word = randomFrom(STROOP_NEUTRAL_WORDS);
  }

  return {
    mode: 'stroop',
    word,
    colorKey: STROOP_COLOR_MAP[colorWord].key,
    colorCss: STROOP_COLOR_MAP[colorWord].css,
    answered: false,
    shownAt: Date.now()
  };
}

function buildMultitaskFormenTrial() {
  const task = buildFormenTaskFromProfile(FORMEN_PROFILE);
  return {
    mode: 'formen',
    items: task.items,
    explanation: task.explanation,
    taskMode: task.taskMode,
    answered: false,
    shownAt: Date.now()
  };
}

function pickNextMultitaskTopMode(currentMode) {
  let nextMode = currentMode;
  while (nextMode === currentMode) {
    nextMode = randomFrom(MULTITASK_TOP_MODE_POOL);
  }
  return nextMode;
}

function setMultitaskTopModeLabel() {
  if (!multitaskingState.session) return;
  let label = 'Go/No-Go';
  if (multitaskingState.session.topMode === 'stroop') label = 'Stroop';
  if (multitaskingState.session.topMode === 'formen') label = 'Formen vergleichen';
  document.getElementById('multitask-top-mode-label').textContent = label;
}

function scheduleMultitaskTopPhaseSwitch() {
  if (multitaskingState.topPhaseTimer) {
    clearTimeout(multitaskingState.topPhaseTimer);
    multitaskingState.topPhaseTimer = null;
  }
  if (!multitaskingState.session) return;

  multitaskingState.topPhaseTimer = setTimeout(() => {
    if (!multitaskingState.session) return;
    multitaskingState.session.topMode = pickNextMultitaskTopMode(multitaskingState.session.topMode);
    if (multitaskingState.session.topMode === 'gonogo') {
      multitaskingState.session.topRule = pickGoNoGoRule(multitaskingState.session.topRule ? multitaskingState.session.topRule.id : null);
    }
    setMultitaskTopModeLabel();
    renderMultitaskingTopTask();
    scheduleMultitaskTopPhaseSwitch();
  }, MULTITASK_TOP_PHASE_SECONDS * 1000);
}

function renderMultitaskingGoNoGoTrial() {
  if (!multitaskingState.session) return;

  const rule = multitaskingState.session.topRule;
  const topContainer = document.getElementById('multitask-top-container');
  const trial = buildMultitaskGoNoGoTrial(rule);
  multitaskingState.topCurrentTask = trial;

  topContainer.innerHTML = `
    <div style="width:100%; text-align:center;">
      <div class="math-note" style="margin-bottom:8px;">GO: ${rule.go.label} | NO-GO: ${rule.nogo.label}</div>
      <div id="multitask-gng-stimulus" style="width:86px; height:86px; margin:0 auto 12px; border:4px solid #2a4a84;"></div>
      <div class="btn-row" style="justify-content:center;">
        <button type="button" class="btn btn-primary" onclick="submitMultitaskingTopGoNoGo(true)">Go</button>
        <button type="button" class="btn btn-secondary" onclick="submitMultitaskingTopGoNoGo(false)">No-Go</button>
      </div>
    </div>
  `;

  const stim = document.getElementById('multitask-gng-stimulus');
  styleGoNoGoStimulus(stim, trial);

  multitaskingState.topTrialTimer = setTimeout(() => {
    if (!multitaskingState.session || !multitaskingState.topCurrentTask || multitaskingState.topCurrentTask.answered || multitaskingState.session.topMode !== 'gonogo') return;
    const autoResponse = false;
    submitMultitaskingTopGoNoGo(autoResponse, true);
  }, MULTITASK_GONOGO_TRIAL_MS);
}

function renderMultitaskingStroopTrial() {
  if (!multitaskingState.session) return;

  const topContainer = document.getElementById('multitask-top-container');
  const trial = buildMultitaskStroopTrial();
  multitaskingState.topCurrentTask = trial;

  topContainer.innerHTML = `
    <div style="width:100%; text-align:center;">
      <div class="math-note" style="margin-bottom:8px;">Klicke die FARBE der Schrift</div>
      <div style="font-size:2.2em; font-weight:800; letter-spacing:0.06em; margin-bottom:12px; color:${trial.colorCss};">${STROOP_WORD_DISPLAY[trial.word] || trial.word}</div>
      <div class="btn-row" style="justify-content:center; gap:8px; flex-wrap:wrap;">
        <button type="button" class="btn btn-secondary" onclick="submitMultitaskingTopStroop('rot')">Rot</button>
        <button type="button" class="btn btn-secondary" onclick="submitMultitaskingTopStroop('blau')">Blau</button>
        <button type="button" class="btn btn-secondary" onclick="submitMultitaskingTopStroop('gruen')">Grün</button>
        <button type="button" class="btn btn-secondary" onclick="submitMultitaskingTopStroop('gelb')">Gelb</button>
      </div>
    </div>
  `;

  multitaskingState.topTrialTimer = setTimeout(() => {
    if (!multitaskingState.session || !multitaskingState.topCurrentTask || multitaskingState.topCurrentTask.answered || multitaskingState.session.topMode !== 'stroop') return;
    multitaskingState.topCurrentTask.answered = true;
    multitaskingState.session.topTotal++;
    multitaskingState.session.topWrong++;
    multitaskingState.session.overall_total++;
    multitaskingState.session.trials.push({
      timestamp: new Date().toISOString(),
      kind: 'reaction',
      reactionTimeMs: null,
      correct: false,
      omitted: true,
      anticipated: false,
      difficultyLevel: null,
      sequenceLength: null,
      mode: 'multitask-top-stroop',
      blockLabel: multitaskingState.topCurrentTask.word
    });
    disableMultitaskingTopButtons();
    const topFb = document.getElementById('multitask-top-feedback');
    topFb.textContent = 'Zeit abgelaufen';
    topFb.className = 'feedback falsch';
    multitaskingState.topAdvanceTimer = setTimeout(() => {
      if (!multitaskingState.session || multitaskingState.session.topMode !== 'stroop') return;
      renderMultitaskingStroopTrial();
    }, MULTITASK_TOP_ADVANCE_MS);
  }, MULTITASK_STROOP_TRIAL_MS);
}

function renderMultitaskingFormenTrial() {
  if (!multitaskingState.session) return;

  const topContainer = document.getElementById('multitask-top-container');
  const trial = buildMultitaskFormenTrial();
  multitaskingState.topCurrentTask = trial;

  const itemsHtml = trial.items.map((item, idx) => {
    const svg = item.svg != null ? item.svg : makeFormenTileSVG(item.shapeId, item.col, item.rot, 86);
    return `<button type="button" class="formen-item" style="padding:6px; min-height:98px;" onclick="submitMultitaskingTopFormen(${idx})">${svg}</button>`;
  }).join('');

  topContainer.innerHTML = `
    <div style="width:100%; text-align:center;">
      <div class="math-note" style="margin-bottom:10px;">Finde die eine Form, die von den anderen abweicht</div>
      <div class="formen-grid" style="max-width:330px; gap:8px;">${itemsHtml}</div>
    </div>
  `;

  multitaskingState.topTrialTimer = setTimeout(() => {
    if (!multitaskingState.session || !multitaskingState.topCurrentTask || multitaskingState.topCurrentTask.answered || multitaskingState.session.topMode !== 'formen') return;
    multitaskingState.topCurrentTask.answered = true;
    multitaskingState.session.topTotal++;
    multitaskingState.session.topWrong++;
    multitaskingState.session.overall_total++;
    multitaskingState.session.trials.push({
      timestamp: new Date().toISOString(),
      kind: 'reaction',
      reactionTimeMs: null,
      correct: false,
      omitted: true,
      anticipated: false,
      difficultyLevel: null,
      sequenceLength: null,
      mode: 'multitask-top-formen',
      blockLabel: multitaskingState.topCurrentTask.taskMode || null
    });
    disableMultitaskingTopButtons();
    const buttons = Array.from(document.querySelectorAll('#multitask-top-container .formen-item'));
    const correctIdx = multitaskingState.topCurrentTask.items.findIndex(function(it) { return it.isOdd; });
    if (buttons[correctIdx]) buttons[correctIdx].classList.add('correct');
    const topFb = document.getElementById('multitask-top-feedback');
    topFb.textContent = 'Zeit abgelaufen';
    topFb.className = 'feedback falsch';
    multitaskingState.topAdvanceTimer = setTimeout(() => {
      if (!multitaskingState.session || multitaskingState.session.topMode !== 'formen') return;
      renderMultitaskingFormenTrial();
    }, MULTITASK_TOP_ADVANCE_MS);
  }, MULTITASK_FORMEN_TRIAL_MS);
}

function renderMultitaskingTopTask() {
  if (!multitaskingState.session) return;
  if (multitaskingState.topTrialTimer) {
    clearTimeout(multitaskingState.topTrialTimer);
    multitaskingState.topTrialTimer = null;
  }
  if (multitaskingState.topAdvanceTimer) {
    clearTimeout(multitaskingState.topAdvanceTimer);
    multitaskingState.topAdvanceTimer = null;
  }

  const topFb = document.getElementById('multitask-top-feedback');
  topFb.textContent = '';
  topFb.className = 'feedback';

  if (multitaskingState.session.topMode === 'stroop') {
    renderMultitaskingStroopTrial();
  } else if (multitaskingState.session.topMode === 'formen') {
    renderMultitaskingFormenTrial();
  } else {
    renderMultitaskingGoNoGoTrial();
  }
}

function disableMultitaskingTopButtons() {
  setButtonsDisabled('#multitask-top-container button', true);
}

function submitMultitaskingTopGoNoGo(react, timedOut) {
  if (!multitaskingState.session || !multitaskingState.topCurrentTask || multitaskingState.topCurrentTask.answered || multitaskingState.session.topMode !== 'gonogo') return;
  if (multitaskingState.topTrialTimer) {
    clearTimeout(multitaskingState.topTrialTimer);
    multitaskingState.topTrialTimer = null;
  }

  multitaskingState.topCurrentTask.answered = true;
  multitaskingState.session.topTotal++;
  multitaskingState.session.overall_total++;
  disableMultitaskingTopButtons();

  let ok = false;
  const reactionTimeMs = timedOut ? null : (multitaskingState.topCurrentTask.shownAt ? Math.max(0, Date.now() - multitaskingState.topCurrentTask.shownAt) : null);
  if (multitaskingState.topCurrentTask.isDistractor) {
    ok = react === false;
  } else {
    ok = react === multitaskingState.topCurrentTask.isGo;
  }

  const topFb = document.getElementById('multitask-top-feedback');
  if (ok) {
    multitaskingState.session.topCorrect++;
    multitaskingState.session.overall_correct++;
    topFb.textContent = timedOut ? 'Richtig ignoriert' : 'Richtig';
    topFb.className = 'feedback richtig';
  } else {
    multitaskingState.session.topWrong++;
    topFb.textContent = 'Falsch';
    topFb.className = 'feedback falsch';
  }

  multitaskingState.session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'reaction',
    reactionTimeMs,
    correct: ok,
    omitted: !!timedOut,
    anticipated: reactionTimeMs !== null && reactionTimeMs < 150,
    difficultyLevel: null,
    sequenceLength: null,
    mode: 'multitask-top-gonogo',
    blockLabel: multitaskingState.session.topRule ? multitaskingState.session.topRule.id : null
  });

  multitaskingState.topAdvanceTimer = setTimeout(() => {
    if (!multitaskingState.session || multitaskingState.session.topMode !== 'gonogo') return;
    renderMultitaskingGoNoGoTrial();
  }, MULTITASK_TOP_ADVANCE_MS);
}

function submitMultitaskingTopStroop(colorKey) {
  if (!multitaskingState.session || !multitaskingState.topCurrentTask || multitaskingState.topCurrentTask.answered || multitaskingState.session.topMode !== 'stroop') return;
  if (multitaskingState.topTrialTimer) {
    clearTimeout(multitaskingState.topTrialTimer);
    multitaskingState.topTrialTimer = null;
  }

  multitaskingState.topCurrentTask.answered = true;
  multitaskingState.session.topTotal++;
  multitaskingState.session.overall_total++;
  disableMultitaskingTopButtons();

  const ok = colorKey === multitaskingState.topCurrentTask.colorKey;
  const reactionTimeMs = multitaskingState.topCurrentTask.shownAt ? Math.max(0, Date.now() - multitaskingState.topCurrentTask.shownAt) : null;
  const topFb = document.getElementById('multitask-top-feedback');
  if (ok) {
    multitaskingState.session.topCorrect++;
    multitaskingState.session.overall_correct++;
    topFb.textContent = 'Richtig';
    topFb.className = 'feedback richtig';
  } else {
    multitaskingState.session.topWrong++;
    topFb.textContent = 'Falsch';
    topFb.className = 'feedback falsch';
  }

  multitaskingState.session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'reaction',
    reactionTimeMs,
    correct: ok,
    omitted: false,
    anticipated: reactionTimeMs !== null && reactionTimeMs < 150,
    difficultyLevel: null,
    sequenceLength: null,
    mode: 'multitask-top-stroop',
    blockLabel: multitaskingState.topCurrentTask.word
  });

  multitaskingState.topAdvanceTimer = setTimeout(() => {
    if (!multitaskingState.session || multitaskingState.session.topMode !== 'stroop') return;
    renderMultitaskingStroopTrial();
  }, MULTITASK_TOP_ADVANCE_MS);
}

function submitMultitaskingTopFormen(index) {
  if (!multitaskingState.session || !multitaskingState.topCurrentTask || multitaskingState.topCurrentTask.answered || multitaskingState.session.topMode !== 'formen') return;
  if (multitaskingState.topTrialTimer) {
    clearTimeout(multitaskingState.topTrialTimer);
    multitaskingState.topTrialTimer = null;
  }

  multitaskingState.topCurrentTask.answered = true;
  multitaskingState.session.topTotal++;
  multitaskingState.session.overall_total++;

  const item = multitaskingState.topCurrentTask.items[index];
  const ok = !!item && item.isOdd;
  const reactionTimeMs = multitaskingState.topCurrentTask.shownAt ? Math.max(0, Date.now() - multitaskingState.topCurrentTask.shownAt) : null;
  const buttons = Array.from(document.querySelectorAll('#multitask-top-container .formen-item'));
  const correctIdx = multitaskingState.topCurrentTask.items.findIndex(function(it) { return it.isOdd; });
  disableMultitaskingTopButtons();
  if (buttons[correctIdx]) buttons[correctIdx].classList.add('correct');
  if (!ok && buttons[index]) buttons[index].classList.add('wrong');
  const topFb = document.getElementById('multitask-top-feedback');
  if (ok) {
    multitaskingState.session.topCorrect++;
    multitaskingState.session.overall_correct++;
    topFb.textContent = 'Richtig';
    topFb.className = 'feedback richtig';
  } else {
    multitaskingState.session.topWrong++;
    topFb.textContent = 'Falsch';
    topFb.className = 'feedback falsch';
  }

  multitaskingState.session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'reaction',
    reactionTimeMs,
    correct: ok,
    omitted: false,
    anticipated: reactionTimeMs !== null && reactionTimeMs < 150,
    difficultyLevel: null,
    sequenceLength: null,
    mode: 'multitask-top-formen',
    blockLabel: multitaskingState.topCurrentTask.taskMode || null
  });

  multitaskingState.topAdvanceTimer = setTimeout(() => {
    if (!multitaskingState.session || multitaskingState.session.topMode !== 'formen') return;
    renderMultitaskingFormenTrial();
  }, MULTITASK_TOP_ADVANCE_MS);
}

function startMultitaskingExercise() {
  const selectedMinutes = parseInt(document.getElementById('multitask-time-select').value, 10) || 2;
  const totalSeconds = selectedMinutes * 60;

  multitaskingState.session = {
    startedAt: Date.now(),
    totalSeconds,
    remainingSeconds: totalSeconds,
    mathCorrect: 0,
    mathWrong: 0,
    mathTotal: 0,
    topCorrect: 0,
    topWrong: 0,
    topTotal: 0,
    overall_correct: 0,
    overall_total: 0,
    trials: [],
    topMode: randomFrom(MULTITASK_TOP_MODE_POOL),
    topRule: pickGoNoGoRule(null)
  };

  multitaskingState.taskCount = 0;
  multitaskingState.currentTask = null;
  multitaskingState.topCurrentTask = null;
  showScreen('screen-multitasking-exercise');
  clearMultitaskingTimer();
  updateModuleTimer('multitask', multitaskingState.session);

  multitaskingState.timerInterval = setInterval(() => {
    if (!multitaskingState.session) return;
    multitaskingState.session.remainingSeconds--;
    updateModuleTimer('multitask', multitaskingState.session);
    if (multitaskingState.session.remainingSeconds <= 0) finishMultitaskingExercise(true);
  }, 1000);

  const inp = document.getElementById('multitask-math-input');
  inp.addEventListener('input', handleMultitaskingMathInput);
  inp.addEventListener('keydown', handleMultitaskingMathKeydown);

  setMultitaskTopModeLabel();
  renderMultitaskingMathTask();
  renderMultitaskingTopTask();
  scheduleMultitaskTopPhaseSwitch();
}

function renderMultitaskingMathTask() {
  if (!multitaskingState.session) return;
  multitaskingState.currentTask = buildMultitaskMathTask();
  multitaskingState.currentTask.shownAt = Date.now();
  multitaskingState.taskCount++;

  const opSymbols = { add: '+', sub: '-', mul: 'x', div: '/' };
  document.getElementById('multitask-math-question').textContent = `${multitaskingState.currentTask.a} ${opSymbols[multitaskingState.currentTask.op]} ${multitaskingState.currentTask.b} = ?`;

  const inp = document.getElementById('multitask-math-input');
  inp.value = '';
  inp.focus();

  const fb = document.getElementById('multitask-math-feedback');
  fb.textContent = '';
  fb.className = 'feedback';
}

function handleMultitaskingMathInput() {
  if (!multitaskingState.session || !multitaskingState.currentTask || multitaskingState.currentTask.answered) return;
  const inp = document.getElementById('multitask-math-input');
  const raw = inp.value.trim();
  if (!raw || raw === '-' || !/^-?\d+$/.test(raw)) return;
  const value = parseInt(raw, 10);
  if (value === multitaskingState.currentTask.answer) submitMultitaskingMathAnswer(value);
}

function handleMultitaskingMathKeydown(event) {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  submitMultitaskingMathAnswer();
}

function submitMultitaskingMathAnswer(prefilled) {
  if (!multitaskingState.session || !multitaskingState.currentTask || multitaskingState.currentTask.answered) return;

  const inp = document.getElementById('multitask-math-input');
  const value = Number.isInteger(prefilled) ? prefilled : parseInt(inp.value.trim(), 10);
  if (!Number.isInteger(value)) return;
  const reactionTimeMs = multitaskingState.currentTask.shownAt ? Math.max(0, Date.now() - multitaskingState.currentTask.shownAt) : null;

  const fb = document.getElementById('multitask-math-feedback');
  if (value !== multitaskingState.currentTask.answer) {
    multitaskingState.currentTask.answered = true;
    multitaskingState.session.mathTotal++;
    multitaskingState.session.mathWrong++;
    multitaskingState.session.overall_total++;
    fb.textContent = `Falsch. Richtig war ${multitaskingState.currentTask.answer}.`;
    fb.className = 'feedback falsch';
    multitaskingState.session.trials.push({
      timestamp: new Date().toISOString(),
      kind: 'accuracy',
      reactionTimeMs,
      correct: false,
      omitted: false,
      anticipated: false,
      difficultyLevel: null,
      sequenceLength: null,
      mode: `multitask-math-${multitaskingState.currentTask.op}`,
      blockLabel: null
    });
    setTimeout(() => {
      if (!multitaskingState.session) return;
      renderMultitaskingMathTask();
    }, 300);
    return;
  }

  multitaskingState.currentTask.answered = true;
  multitaskingState.session.mathTotal++;
  multitaskingState.session.mathCorrect++;
  multitaskingState.session.overall_total++;
  multitaskingState.session.overall_correct++;
  multitaskingState.session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'accuracy',
    reactionTimeMs,
    correct: true,
    omitted: false,
    anticipated: false,
    difficultyLevel: null,
    sequenceLength: null,
    mode: `multitask-math-${multitaskingState.currentTask.op}`,
    blockLabel: null
  });

  fb.textContent = 'Richtig!';
  fb.className = 'feedback richtig';

  setTimeout(() => {
    if (!multitaskingState.session) return;
    renderMultitaskingMathTask();
  }, 200);
}

function finishMultitaskingExercise(timedOut) {
  clearMultitaskingTimer();

  if (!multitaskingState.session) {
    showScreen('screen-multitasking-results');
    return;
  }

  const inp = document.getElementById('multitask-math-input');
  inp.removeEventListener('input', handleMultitaskingMathInput);
  inp.removeEventListener('keydown', handleMultitaskingMathKeydown);

  const overallAccuracy = getAccuracyPercent(multitaskingState.session.overall_correct, multitaskingState.session.overall_total);
  const mathAccuracy = getAccuracyPercent(multitaskingState.session.mathCorrect, multitaskingState.session.mathTotal);
  const topAccuracy = getAccuracyPercent(multitaskingState.session.topCorrect, multitaskingState.session.topTotal);
  const elapsed = getElapsedSeconds(multitaskingState.session.startedAt, multitaskingState.session.totalSeconds, timedOut);

  setTextEntries({
    'multitask-result-percent': `${overallAccuracy}%`,
    'multitask-result-math-acc': `${mathAccuracy}%`,
    'multitask-result-top-acc': `${topAccuracy}%`,
    'multitask-result-limit': formatTime(multitaskingState.session.totalSeconds),
    'multitask-result-math-total': String(multitaskingState.session.mathTotal),
    'multitask-result-math-correct': String(multitaskingState.session.mathCorrect),
    'multitask-result-math-wrong': String(multitaskingState.session.mathWrong),
    'multitask-result-top-total': String(multitaskingState.session.topTotal),
    'multitask-result-top-correct': String(multitaskingState.session.topCorrect),
    'multitask-result-top-wrong': String(multitaskingState.session.topWrong),
    'multitask-result-overall-total': String(multitaskingState.session.overall_total),
    'multitask-result-overall-correct': String(multitaskingState.session.overall_correct),
    'multitask-result-duration': formatTime(elapsed)
  });
  setResultInsight('multitask-result-insight', 'multitasking', overallAccuracy, { mathAccuracy, topAccuracy });
  saveTrainingEntry({
    module: 'multitasking',
    label: 'Multitasking',
    trials: multitaskingState.session.trials,
    correct: multitaskingState.session.overall_correct,
    wrong: multitaskingState.session.overall_total - multitaskingState.session.overall_correct,
    total: multitaskingState.session.overall_total,
    accuracy: overallAccuracy,
    duration: elapsed,
    totalSeconds: multitaskingState.session.totalSeconds
  });

  multitaskingState.session = null;
  multitaskingState.currentTask = null;
  multitaskingState.topCurrentTask = null;
  showScreen('screen-multitasking-results');
}

function restartMultitaskingMode() {
  startMultitaskingExercise();
}

function applySequenceOp(value, op) {
  if (op.type === 'add') return value + op.value;
  if (op.type === 'sub') return value - op.value;
  if (op.type === 'div') return value / op.value;
  return value * op.value;
}

function formatSequenceOp(op) {
  if (op.type === 'add') return `+${op.value}`;
  if (op.type === 'sub') return `-${op.value}`;
  if (op.type === 'div') return `/${op.value}`;
  return `*${op.value}`;
}

function buildSequenceFromOps(start, ops) {
  let current = start;
  const series = [current];
  for (let i = 0; i < 3; i++) {
    current = applySequenceOp(current, ops[i]);
    series.push(current);
  }
  const correct = applySequenceOp(current, ops[3]);
  return { series, correct };
}

function buildSequenceTaskByMode(mode) {
  if (mode === 'add') {
    const step = Math.floor(Math.random() * 8) + 2;
    const start = Math.floor(Math.random() * 30) + 3;
    const series = [start, start + step, start + 2 * step, start + 3 * step];
    return {
      series,
      correct: start + 4 * step,
      ruleText: `Immer ${step > 0 ? '+' : ''}${step}`,
      deltas: [-8, -5, -3, -2, 2, 3, 5, 8]
    };
  }

  if (mode === 'sub') {
    const step = Math.floor(Math.random() * 8) + 2;
    const start = Math.floor(Math.random() * 50) + 35;
    const series = [start, start - step, start - 2 * step, start - 3 * step];
    return {
      series,
      correct: start - 4 * step,
      ruleText: `Immer -${step}`,
      deltas: [-8, -5, -3, -2, 2, 3, 5, 8]
    };
  }

  if (mode === 'div') {
    const divisor = randomFrom([2, 3]);
    // start must be a multiple of divisor^4 so all values stay whole integers
    const pow4 = divisor ** 4; // 16 or 81
    const maxK = divisor === 2 ? 14 : 3;
    const k = Math.floor(Math.random() * maxK) + 2;
    const start = pow4 * k;
    const series = [start, start / divisor, start / divisor ** 2, start / divisor ** 3];
    const correct = start / divisor ** 4;
    const spread = Math.max(3, Math.round(correct * 0.6));
    return {
      series,
      correct,
      ruleText: `Immer /${divisor}`,
      deltas: [-spread, -Math.round(spread * 0.55), -Math.round(spread * 0.3), -1, 1, Math.round(spread * 0.3), Math.round(spread * 0.55), spread]
    };
  }

  if (mode === 'mul') {
    const factor = randomFrom([2, 3]);
    const startMax = factor === 2 ? 24 : 10;
    const start = Math.floor(Math.random() * startMax) + 2;
    const series = [start, start * factor, start * factor * factor, start * factor * factor * factor];
    const correct = start * factor * factor * factor * factor;
    const spread = Math.max(6, Math.round(correct * 0.2));
    return {
      series,
      correct,
      ruleText: `Immer *${factor}`,
      deltas: [-spread, -Math.round(spread * 0.55), -Math.round(spread * 0.3), -4, 4, Math.round(spread * 0.3), Math.round(spread * 0.55), spread]
    };
  }

  if (mode === 'alt') {
    const stepA = Math.floor(Math.random() * 6) + 2;
    const stepB = Math.floor(Math.random() * 6) + 3;
    const start = Math.floor(Math.random() * 20) + 5;
    const series = [start, start + stepA, start + stepA + stepB, start + 2 * stepA + stepB];
    return {
      series,
      correct: start + 2 * stepA + 2 * stepB,
      ruleText: `Abwechselnd +${stepA}, +${stepB}`,
      deltas: [-8, -5, -3, -2, 2, 3, 5, 8]
    };
  }

  if (mode === 'mix_cycle') {
    const addStep = Math.floor(Math.random() * 4) + 2;
    const mulFactor = randomFrom([2, 3]);
    const ops = [
      { type: 'add', value: addStep },
      { type: 'mul', value: mulFactor },
      { type: 'add', value: addStep },
      { type: 'mul', value: mulFactor }
    ];
    const start = Math.floor(Math.random() * 10) + 2;
    const out = buildSequenceFromOps(start, ops);
    const spread = Math.max(6, Math.round(out.correct * 0.18));
    return {
      series: out.series,
      correct: out.correct,
      ruleText: `Abwechselnd ${formatSequenceOp(ops[0])}, ${formatSequenceOp(ops[1])}`,
      deltas: [-spread, -Math.round(spread * 0.6), -Math.round(spread * 0.35), -4, 4, Math.round(spread * 0.35), Math.round(spread * 0.6), spread]
    };
  }

  // grow: steps increase by a constant each time (+d, +2d, +3d, +4d)
  const d = Math.floor(Math.random() * 4) + 2;
  const start = Math.floor(Math.random() * 20) + 5;
  const series = [start, start + d, start + 3 * d, start + 6 * d];
  const correct = start + 10 * d;
  const spread = Math.max(4, d * 2);
  return {
    series,
    correct,
    ruleText: `Schritte wachsen: +${d}, +${2*d}, +${3*d}, ...`,
    deltas: [-spread * 2, -spread, -Math.round(spread * 0.5), -d, d, Math.round(spread * 0.5), spread, spread * 2]
  };
}

function buildSequenceTask() {
  const mode = randomFrom(['add', 'sub', 'mul', 'div', 'alt', 'mix_cycle', 'grow']);
  let task = null;
  for (let tries = 0; tries < 20; tries++) {
    task = buildSequenceTaskByMode(mode);
    const allVals = [...task.series, task.correct];
    if (allVals.every(v => Number.isFinite(v) && Number.isInteger(v) && v > 0 && v <= 800)) break;
  }
  const options = uniqueOptions(task.correct, task.deltas);
  return { series: task.series, correct: task.correct, options, ruleText: task.ruleText, answered: false };
}

function renderSequenceTask() {
  if (!sequenceState.session) return;
  if (sequenceState.advanceTimer) {
    clearTimeout(sequenceState.advanceTimer);
    sequenceState.advanceTimer = null;
  }
  if (sequenceState.ruleHintTimer) {
    clearTimeout(sequenceState.ruleHintTimer);
    sequenceState.ruleHintTimer = null;
  }
  sequenceState.currentTask = buildSequenceTask();
  sequenceState.taskCount++;
  document.getElementById('sequence-progress').textContent = String(sequenceState.taskCount);
  document.getElementById('sequence-row').textContent = `${sequenceState.currentTask.series.join(', ')}, ?`;
  const ruleHint = document.getElementById('sequence-rule-hint');
  ruleHint.textContent = '';
  ruleHint.classList.add('hidden');
  const row = document.getElementById('sequence-options-row');
  row.innerHTML = '';
  sequenceState.currentTask.options.forEach(v => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-secondary';
    btn.textContent = String(v);
    btn.addEventListener('click', () => submitSequenceAnswer(v));
    row.appendChild(btn);
  });
  const fb = document.getElementById('sequence-feedback');
  fb.textContent = '';
  fb.className = 'feedback';
}

function startSequenceExercise() {
  const selectedMinutes = parseInt(document.getElementById('sequence-time-select').value, 10) || 5;
  const totalSeconds = selectedMinutes * 60;
  sequenceState.session = {
    startedAt: Date.now(),
    totalSeconds,
    remainingSeconds: totalSeconds,
    correct: 0,
    wrong: 0,
    total: 0,
    trials: []
  };
  sequenceState.taskCount = 0;
  showScreen('screen-sequence-exercise');
  clearSequenceTimer();
  updateModuleTimer('sequence', sequenceState.session);
  sequenceState.timerInterval = setInterval(() => {
    if (!sequenceState.session) return;
    sequenceState.session.remainingSeconds--;
    updateModuleTimer('sequence', sequenceState.session);
    if (sequenceState.session.remainingSeconds <= 0) finishSequenceExercise(true);
  }, 1000);
  renderSequenceTask();
}

function submitSequenceAnswer(value) {
  if (!sequenceState.session || !sequenceState.currentTask || sequenceState.currentTask.answered) return;
  sequenceState.currentTask.answered = true;
  sequenceState.session.total++;
  const ok = value === sequenceState.currentTask.correct;
  const fb = document.getElementById('sequence-feedback');
  if (ok) {
    sequenceState.session.correct++;
    fb.textContent = 'Richtig!';
    fb.className = 'feedback richtig';
  } else {
    sequenceState.session.wrong++;
    fb.textContent = `Falsch. Richtig wäre ${sequenceState.currentTask.correct}.`;
    fb.className = 'feedback falsch';
  }

  sequenceState.session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'memory',
    reactionTimeMs: null,
    correct: ok,
    omitted: false,
    anticipated: false,
    difficultyLevel: sequenceState.currentTask.series.length,
    sequenceLength: sequenceState.currentTask.series.length,
    mode: 'sequence',
    blockLabel: sequenceState.currentTask.ruleText
  });

  if (sequenceState.advanceTimer) clearTimeout(sequenceState.advanceTimer);
  sequenceState.advanceTimer = setTimeout(() => {
    sequenceState.advanceTimer = null;
    nextSequenceTask();
  }, 320);
}

function nextSequenceTask() {
  if (!sequenceState.session) return;
  if (sequenceState.advanceTimer) {
    clearTimeout(sequenceState.advanceTimer);
    sequenceState.advanceTimer = null;
  }
  if (sequenceState.ruleHintTimer) {
    clearTimeout(sequenceState.ruleHintTimer);
    sequenceState.ruleHintTimer = null;
  }
  if (sequenceState.currentTask && !sequenceState.currentTask.answered) {
    sequenceState.session.total++;
    sequenceState.session.wrong++;
  }
  renderSequenceTask();
}

function showSequenceRuleHint() {
  if (!sequenceState.session || !sequenceState.currentTask) return;
  const ruleHint = document.getElementById('sequence-rule-hint');
  if (!ruleHint) return;
  ruleHint.textContent = `Regel: ${sequenceState.currentTask.ruleText}`;
  ruleHint.classList.remove('hidden');
  if (sequenceState.ruleHintTimer) clearTimeout(sequenceState.ruleHintTimer);
  sequenceState.ruleHintTimer = setTimeout(() => {
    sequenceState.ruleHintTimer = null;
    ruleHint.classList.add('hidden');
  }, 4200);
}

function finishSequenceExercise(timedOut) {
  clearSequenceTimer();
  if (!sequenceState.session) {
    showScreen('screen-sequence-results');
    return;
  }
  const pct = getAccuracyPercent(sequenceState.session.correct, sequenceState.session.total);
  const elapsed = getElapsedSeconds(sequenceState.session.startedAt, sequenceState.session.totalSeconds, timedOut);
  setTextEntries({
    'sequence-result-percent': `${pct}%`,
    'sequence-result-limit': formatTime(sequenceState.session.totalSeconds),
    'sequence-result-correct': String(sequenceState.session.correct),
    'sequence-result-wrong': String(sequenceState.session.wrong),
    'sequence-result-total': String(sequenceState.session.total),
    'sequence-result-duration': formatTime(elapsed)
  });
  setResultInsight('sequence-result-insight', 'sequence', pct);
  saveTrainingEntry({
    module: 'sequence',
    label: 'Zahlenreihen',
    trials: sequenceState.session.trials,
    correct: sequenceState.session.correct,
    wrong: sequenceState.session.wrong,
    total: sequenceState.session.total,
    accuracy: pct,
    duration: elapsed,
    totalSeconds: sequenceState.session.totalSeconds
  });
  showScreen('screen-sequence-results');
}

function restartSequenceMode() {
  startSequenceExercise();
}

// ─── Rotations-Übung (Räumliches Denken) ─────────────────────────────────────

const ROTATION_DIFFICULTY = {
  easy: {
    label: 'Leicht',
    allowedTurns: [1, 2, 3],
    advanceMs: 1200
  },
  medium: {
    label: 'Mittel',
    allowedTurns: [1, 2, 3],
    advanceMs: 1100
  },
  hard: {
    label: 'Schwer',
    allowedTurns: [1, 2, 3],
    advanceMs: 1000
  }
};

const ROTATION_TURN_META = {
  1: { label: '90° nach rechts', explanation: 'um 90° nach rechts gedreht' },
  2: { label: '180°', explanation: 'um 180° gedreht' },
  3: { label: '90° nach links', explanation: 'um 90° nach links gedreht' }
};

function cloneHeightMap(map) {
  return map.map(row => row.slice());
}

function mirrorHeightMapHorizontal(map) {
  return map.map(row => row.slice().reverse());
}

function mutateHeightMap(baseMap, intensity) {
  const out = cloneHeightMap(baseMap);
  const changes = intensity === 'hard' ? 2 : 1;
  for (let i = 0; i < changes; i++) {
    const y = Math.floor(Math.random() * out.length);
    const x = Math.floor(Math.random() * out[y].length);
    const direction = Math.random() < 0.5 ? -1 : 1;
    out[y][x] = Math.max(0, Math.min(4, out[y][x] + direction));
  }
  if (heightMapKey(out) === heightMapKey(baseMap)) {
    const y = 1;
    const x = 1;
    out[y][x] = out[y][x] === 0 ? 1 : Math.max(0, out[y][x] - 1);
  }
  return out;
}

function buildRotationDistractors(baseMap, correctMap, turn, profile) {
  const distractors = [];
  const seen = new Set([heightMapKey(correctMap)]);

  const pushCandidate = (map) => {
    const key = heightMapKey(map);
    if (seen.has(key)) return;
    seen.add(key);
    distractors.push(map);
  };

  [1, 2, 3].forEach(otherTurn => {
    if (otherTurn !== turn) pushCandidate(rotateHeightMap(baseMap, otherTurn));
  });

  const mirrored = mirrorHeightMapHorizontal(baseMap);
  pushCandidate(mirrored);
  pushCandidate(rotateHeightMap(mirrored, turn));
  if (profile.label !== 'Leicht') {
    pushCandidate(rotateHeightMap(mirrored, (turn + 1) % 4 || 1));
    pushCandidate(mutateHeightMap(correctMap, profile.label === 'Schwer' ? 'hard' : 'medium'));
  }
  if (profile.label === 'Schwer') {
    pushCandidate(mutateHeightMap(rotateHeightMap(baseMap, ((turn + 1) % 4) || 1), 'hard'));
    pushCandidate(mutateHeightMap(baseMap, 'hard'));
  }

  while (distractors.length < 3) {
    pushCandidate(mutateHeightMap(correctMap, profile.label === 'Schwer' ? 'hard' : 'medium'));
  }

  return distractors.slice(0, 3);
}

function buildRotationTask() {
  const profile = rotationState.session.profile;
  for (let attempt = 0; attempt < 40; attempt++) {
    const baseMap = randomSpatialMap();
    const turn = randomFrom(profile.allowedTurns);
    const correctMap = rotateHeightMap(baseMap, turn);
    if (heightMapKey(baseMap) === heightMapKey(correctMap)) continue;

    const distractors = buildRotationDistractors(baseMap, correctMap, turn, profile);
    if (distractors.length < 3) continue;

    const options = [{ map: correctMap, correct: true }]
      .concat(distractors.map(map => ({ map, correct: false })));
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = options[i];
      options[i] = options[j];
      options[j] = tmp;
    }

    return {
      baseMap,
      turn,
      options,
      correctKey: heightMapKey(correctMap),
      answered: false,
      shownAt: Date.now()
    };
  }

  const fallbackMap = randomSpatialMap();
  const fallbackTurn = 1;
  const fallbackCorrect = rotateHeightMap(fallbackMap, fallbackTurn);
  return {
    baseMap: fallbackMap,
    turn: fallbackTurn,
    options: [
      { map: fallbackCorrect, correct: true },
      { map: mirrorHeightMapHorizontal(fallbackMap), correct: false },
      { map: rotateHeightMap(fallbackMap, 2), correct: false },
      { map: mutateHeightMap(fallbackCorrect, 'medium'), correct: false }
    ],
    correctKey: heightMapKey(fallbackCorrect),
    answered: false,
    shownAt: Date.now()
  };
}

function renderRotationAnswerChoices(task) {
  const grid = document.getElementById('rotation-answer-grid');
  if (!grid || !task) return;
  grid.innerHTML = '';
  task.options.forEach((opt, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-outline rotation-answer-btn';
    const key = heightMapKey(opt.map);
    btn.dataset.key = key;
    btn.innerHTML = `<span class="scene-wrap">${renderRotationScene(opt.map, true)}</span><span class="lbl">Option ${String.fromCharCode(65 + index)}</span>`;
    btn.addEventListener('click', () => submitRotationAnswer(key, btn));
    grid.appendChild(btn);
  });
}

function resetRotationAnswerButtons() {
  const buttons = document.querySelectorAll('#rotation-answer-wrap .rotation-answer-btn');
  buttons.forEach(btn => {
    btn.classList.remove('correct', 'wrong');
    btn.disabled = false;
  });
}

function renderRotationTask() {
  if (!rotationState.session) return;
  clearRotationTaskTimers();
  updateModuleTimer('rotation', rotationState.session);
  rotationState.currentTask = buildRotationTask();
  rotationState.taskCount++;

  document.getElementById('rotation-progress').textContent = String(rotationState.taskCount);
  document.getElementById('rotation-stimulus').innerHTML = renderRotationScene(rotationState.currentTask.baseMap, false);
  const turnMeta = ROTATION_TURN_META[rotationState.currentTask.turn] || ROTATION_TURN_META[1];
  document.getElementById('rotation-phase-label').textContent = `Drehung: ${turnMeta.label}`;
  document.getElementById('rotation-cue').textContent = 'Wähle die Antwort mit exakt derselben Struktur nach dieser Drehung.';
  document.getElementById('rotation-cue-seq').textContent = 'Spiegelungen sind falsch, auch wenn die Silhouette auf den ersten Blick ähnlich wirkt.';
  document.getElementById('rotation-answer-wrap').style.display = '';

  renderRotationAnswerChoices(rotationState.currentTask);
  resetRotationAnswerButtons();

  const fb = document.getElementById('rotation-feedback');
  fb.textContent = '';
  fb.className = 'feedback';
  document.getElementById('rotation-explanation').style.display = 'none';
  document.getElementById('rotation-next-wrap').style.display = 'none';
}

function submitRotationAnswer(choiceKey, button) {
  if (!rotationState.session || !rotationState.currentTask || rotationState.currentTask.answered) return;
  if (!button) return;

  rotationState.currentTask.answered = true;
  rotationState.session.total++;
  const isCorrect = choiceKey === rotationState.currentTask.correctKey;
  const reactionTimeMs = Math.max(0, Date.now() - rotationState.currentTask.shownAt);

  const allBtns = Array.from(document.querySelectorAll('#rotation-answer-wrap .rotation-answer-btn'));
  setButtonsDisabled('#rotation-answer-wrap .rotation-answer-btn', true);

  const fb = document.getElementById('rotation-feedback');
  if (isCorrect) {
    rotationState.session.correct++;
    rotationState.session.rtSum += reactionTimeMs;
    rotationState.session.rtCount++;
    button.classList.add('correct');
    fb.textContent = 'Richtig!';
    fb.className = 'feedback richtig';
  } else {
    rotationState.session.wrong++;
    button.classList.add('wrong');
    const correctBtn = allBtns.find(b => b.dataset.key === rotationState.currentTask.correctKey);
    if (correctBtn) correctBtn.classList.add('correct');
    fb.textContent = 'Falsch. Richtige Ansicht markiert.';
    fb.className = 'feedback falsch';
  }

  rotationState.session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'reaction',
    reactionTimeMs,
    correct: isCorrect,
    omitted: false,
    anticipated: reactionTimeMs < 150,
    difficultyLevel: rotationState.currentTask.turn,
    sequenceLength: null,
    mode: rotationState.session.difficulty,
    blockLabel: null
  });

  const expl = document.getElementById('rotation-explanation');
  const turnMeta = ROTATION_TURN_META[rotationState.currentTask.turn] || ROTATION_TURN_META[1];
  expl.innerHTML = `<strong>Erklärung:</strong> Gesucht war dieselbe Struktur, <strong>${turnMeta.explanation}</strong>. Die Kameraperspektive bleibt dabei unverändert.`;
  expl.style.display = 'block';
  document.getElementById('rotation-next-wrap').style.display = 'block';

  rotationState.advanceTimer = setTimeout(() => {
    rotationState.advanceTimer = null;
    renderRotationTask();
  }, rotationState.session.profile.advanceMs);
}

function rotationAdvanceNow() {
  if (rotationState.advanceTimer) {
    clearTimeout(rotationState.advanceTimer);
    rotationState.advanceTimer = null;
  }
  renderRotationTask();
}

function startRotationExercise() {
  const selectedMinutes = parseInt(document.getElementById('rotation-time-select').value, 10) || 5;
  const diffKeyRaw = document.getElementById('rotation-difficulty-select').value;
  const diffKey = Object.prototype.hasOwnProperty.call(ROTATION_DIFFICULTY, diffKeyRaw) ? diffKeyRaw : 'medium';
  const profile = ROTATION_DIFFICULTY[diffKey];
  const totalSeconds = selectedMinutes * 60;

  rotationState.session = {
    difficulty: diffKey,
    profile,
    startedAt: Date.now(),
    totalSeconds,
    remainingSeconds: totalSeconds,
    correct: 0,
    wrong: 0,
    total: 0,
    rtSum: 0,
    rtCount: 0,
    trials: []
  };

  rotationState.taskCount = 0;
  showScreen('screen-rotation-exercise');
  clearRotationTimer();
  updateModuleTimer('rotation', rotationState.session);
  document.getElementById('rotation-level-label').textContent = profile.label;

  rotationState.timerInterval = setInterval(() => {
    if (!rotationState.session) return;
    rotationState.session.remainingSeconds--;
    updateModuleTimer('rotation', rotationState.session);
    if (rotationState.session.remainingSeconds <= 0) finishRotationExercise(true);
  }, 1000);

  renderRotationTask();
}

function finishRotationExercise(timedOut) {
  clearRotationTimer();
  if (!rotationState.session) { showScreen('screen-rotation-results'); return; }

  const pct = getAccuracyPercent(rotationState.session.correct, rotationState.session.total);
  const elapsed = getElapsedSeconds(rotationState.session.startedAt, rotationState.session.totalSeconds, timedOut);
  const avgRt = rotationState.session.rtCount > 0 ? Math.round(rotationState.session.rtSum / rotationState.session.rtCount) : null;
  setTextEntries({
    'rotation-result-percent': `${pct}%`,
    'rotation-result-difficulty': rotationState.session.profile.label,
    'rotation-result-limit': formatTime(rotationState.session.totalSeconds),
    'rotation-result-correct': String(rotationState.session.correct),
    'rotation-result-wrong': String(rotationState.session.wrong),
    'rotation-result-total': String(rotationState.session.total),
    'rotation-result-duration': formatTime(elapsed),
    'rotation-result-rt': avgRt === null ? '-' : `${avgRt} ms`
  });
  setResultInsight('rotation-result-insight', 'rotation', pct, { avgRt });
  saveTrainingEntry({
    module: 'spatial_views',
    label: 'Rotations-Übung',
    difficulty: rotationState.session.difficulty,
    avgRt,
    trials: rotationState.session.trials,
    correct: rotationState.session.correct,
    wrong: rotationState.session.wrong,
    total: rotationState.session.total,
    accuracy: pct,
    duration: elapsed,
    totalSeconds: rotationState.session.totalSeconds
  });
  showScreen('screen-rotation-results');
}

function restartRotationMode() {
  startRotationExercise();
}

function showAnleitung() {
  document.getElementById('modal-anleitung').classList.remove('hidden');
}

function showImpressum() {
  document.getElementById('modal-impressum').classList.remove('hidden');
}

function closeOverlay(id) {
  document.getElementById(id).classList.add('hidden');
}

function bindDeclarativeActions() {
  const actionAliases = {
    stoppGedrueckt: 'stoppGedrückt'
  };

  function parseActionArgs(element) {
    const rawArgs = element.dataset.actionArgs;
    if (!rawArgs) return [];
    const parsedArgs = JSON.parse(rawArgs);
    return parsedArgs.map(function(arg) {
      if (arg === '$value') return element.value;
      return arg;
    });
  }

  function invokeAction(element, actionName) {
    const resolvedAction = actionAliases[actionName] || actionName;
    const handler = window[resolvedAction];
    if (typeof handler === 'function') {
      handler.apply(null, parseActionArgs(element));
    }
  }

  document.querySelectorAll('[data-action]').forEach(function(element) {
    if (element.dataset.actionBound === 'true') return;
    element.dataset.actionBound = 'true';
    element.addEventListener('click', function() {
      const action = element.dataset.action;
      if (action === 'closeOverlay') {
        closeOverlay(element.dataset.overlayId);
        return;
      }
      invokeAction(element, action);
    });
  });

  document.querySelectorAll('[data-change-action]').forEach(function(element) {
    if (element.dataset.changeActionBound === 'true') return;
    element.dataset.changeActionBound = 'true';
    element.addEventListener('change', function() {
      invokeAction(element, element.dataset.changeAction);
    });
  });
}

// Close overlay on background click
document.querySelectorAll('.overlay').forEach(el => {
  el.addEventListener('click', function(e) {
    if (e.target === this) closeOverlay(this.id);
  });
});

function randomIntDigits(digits) {
  const min = digits === 1 ? 1 : Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomOperation(mode) {
  if (mode === 'mix') {
    const ops = ['add', 'sub', 'mul'];
    return ops[Math.floor(Math.random() * ops.length)];
  }
  return mode;
}

function opLabel(op) {
  if (op === 'add') return 'Addition';
  if (op === 'sub') return 'Subtraktion';
  if (op === 'mul') return 'Multiplikation';
  return 'Gemischt';
}

function opSymbol(op) {
  if (op === 'add') return '+';
  if (op === 'sub') return '-';
  return '×';
}

function buildMathTask(mode) {
  const operation = randomOperation(mode);
  let d1 = Math.floor(Math.random() * 4) + 1;
  let d2 = Math.floor(Math.random() * 4) + 1;
  let a = randomIntDigits(d1);
  let b = randomIntDigits(d2);

  if (operation === 'mul') {
    // Keep multiplying tasks within 4 digits total.
    let tries = 0;
    while ((a * b) > 9999 && tries < 200) {
      d1 = Math.floor(Math.random() * 4) + 1;
      d2 = Math.floor(Math.random() * 4) + 1;
      a = randomIntDigits(d1);
      b = randomIntDigits(d2);
      tries++;
    }
    if ((a * b) > 9999) {
      // Safe fallback in the unlikely case random retries fail.
      a = randomIntDigits(2);
      b = randomIntDigits(2);
    }
  }

  if (operation === 'sub' && b > a) {
    const t = a;
    a = b;
    b = t;
  }
  let answer = 0;
  if (operation === 'add') answer = a + b;
  else if (operation === 'sub') answer = a - b;
  else answer = a * b;
  return { operation, a, b, answer };
}

function renderMathTask() {
  if (!mathState.session) return;
  if (mathState.advanceTimer) {
    clearTimeout(mathState.advanceTimer);
    mathState.advanceTimer = null;
  }
  mathState.currentTask = buildMathTask(mathState.session.mode);
  mathState.currentTask.answered = false;
  mathState.taskCount++;
  document.getElementById('math-mode-label').textContent = opLabel(mathState.session.mode);
  document.getElementById('math-progress').textContent = String(mathState.taskCount);
  document.getElementById('math-question').textContent = `${mathState.currentTask.a} ${opSymbol(mathState.currentTask.operation)} ${mathState.currentTask.b} = ?`;
  const inp = document.getElementById('math-input');
  inp.value = '';
  inp.focus();
  const fb = document.getElementById('math-feedback');
  fb.textContent = '';
  fb.className = 'feedback';
}

function startMathExercise(mode) {
  const selectedMinutes = parseInt(document.getElementById('math-time-select').value, 10) || 5;
  const totalSeconds = selectedMinutes * 60;
  mathState.session = {
    mode: mode || 'mix',
    startedAt: Date.now(),
    selectedMinutes,
    totalSeconds,
    remainingSeconds: totalSeconds,
    correct: 0,
    wrong: 0,
    total: 0,
    trials: []
  };
  mathState.taskCount = 0;
  showScreen('screen-math-exercise');
  clearMathTimer();
  updateMathTimerDisplay();
  mathState.timerInterval = setInterval(() => {
    if (!mathState.session) return;
    mathState.session.remainingSeconds--;
    updateMathTimerDisplay();
    if (mathState.session.remainingSeconds <= 0) {
      finishMathExercise(true);
    }
  }, 1000);
  renderMathTask();
}

function submitMathAnswer() {
  if (!mathState.session || !mathState.currentTask || mathState.currentTask.answered) return;
  const input = document.getElementById('math-input').value.trim().replace(',', '.');
  const feedback = document.getElementById('math-feedback');
  if (!input || !/^-?\d+$/.test(input)) {
    feedback.textContent = 'Bitte eine ganze Zahl eingeben.';
    feedback.className = 'feedback falsch';
    return;
  }
  mathState.currentTask.answered = true;
  const user = parseInt(input, 10);
  mathState.session.total++;
  const isCorrect = user === mathState.currentTask.answer;
  if (isCorrect) {
    mathState.session.correct++;
    feedback.textContent = 'Richtig!';
    feedback.className = 'feedback richtig';
  } else {
    mathState.session.wrong++;
    feedback.textContent = `Falsch. Richtig wäre ${mathState.currentTask.answer}.`;
    feedback.className = 'feedback falsch';
  }

  mathState.session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'accuracy',
    reactionTimeMs: null,
    correct: isCorrect,
    omitted: false,
    anticipated: false,
    difficultyLevel: null,
    sequenceLength: null,
    mode: mathState.currentTask.operation,
    blockLabel: null
  });

  // Short feedback pause, then automatically continue with next task.
  mathState.advanceTimer = setTimeout(() => {
    mathState.advanceTimer = null;
    if (!mathState.session) return;
    renderMathTask();
  }, 550);
}

function nextMathQuestion() {
  if (!mathState.session) return;
  renderMathTask();
}

function finishMathExercise(timedOut) {
  clearMathTimer();
  if (!mathState.session) {
    showScreen('screen-math-results');
    return;
  }
  const pct = getAccuracyPercent(mathState.session.correct, mathState.session.total);
  const elapsed = getElapsedSeconds(mathState.session.startedAt, mathState.session.totalSeconds, timedOut);
  setTextEntries({
    'math-result-percent': `${pct}%`,
    'math-result-mode': opLabel(mathState.session.mode),
    'math-result-limit': formatTime(mathState.session.totalSeconds),
    'math-result-correct': String(mathState.session.correct),
    'math-result-wrong': String(mathState.session.wrong),
    'math-result-total': String(mathState.session.total),
    'math-result-duration': formatTime(elapsed)
  });
  setResultInsight('math-result-insight', 'math', pct, { mode: mathState.session.mode });
  saveTrainingEntry({
    module: 'math_' + mathState.session.mode,
    label: 'Kopfrechnen (' + opLabel(mathState.session.mode) + ')',
    trials: mathState.session.trials,
    correct: mathState.session.correct,
    wrong: mathState.session.wrong,
    total: mathState.session.total,
    accuracy: pct,
    duration: elapsed,
    totalSeconds: mathState.session.totalSeconds
  });
  showScreen('screen-math-results');
}

function restartMathMode() {
  const mode = mathState.session ? mathState.session.mode : 'mix';
  startMathExercise(mode);
}

document.getElementById('math-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitMathAnswer();
  }
});

document.getElementById('digitspan-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitDigitSpanAnswer();
  }
});

document.addEventListener('keydown', function(e) {
  const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
  if (tag === 'input' || tag === 'textarea' || e.altKey || e.ctrlKey || e.metaKey) return;

  const flankerScreen = document.getElementById('screen-flanker-exercise');
  if (flankerScreen && !flankerScreen.classList.contains('hidden') && flankerState.session) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      submitFlankerAnswer('left');
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      submitFlankerAnswer('right');
      return;
    }
  }

  const screen = document.getElementById('screen-stroop-exercise');
  if (!screen || screen.classList.contains('hidden')) return;
  if (!stroopState.session || stroopState.session.inPause) return;

  const mapped = STROOP_KEY_MAP[(e.key || '').toLowerCase()];
  if (!mapped) return;
  e.preventDefault();
  submitStroopAnswer(mapped);
});

(function setupNbackModeUi() {
  const modeSelect = document.getElementById('nback-mode-select');
  const feedbackToggle = document.getElementById('nback-feedback-toggle');
  if (!modeSelect || !feedbackToggle) return;

  const applyModeUi = () => {
    const isTest = modeSelect.value === 'test';
    feedbackToggle.disabled = isTest;
    if (isTest) feedbackToggle.checked = false;
  };

  modeSelect.addEventListener('change', applyModeUi);
  applyModeUi();
})();

// ─── Start exercise ───────────────────────────────────────────────────────────
function startExercise() {
  // Reset state
  speedState.stats = createEmptySpeedStats();
  speedState.perMinute = createEmptySpeedMinutes();
  speedState.elapsedSeconds = 0;
  const selectedMinutes = parseInt(document.getElementById('speed-time-select').value, 10) || 20;
  speedState.totalSeconds = selectedMinutes * 60;
  speedState.inputBlocked = false;
  speedState.consecutiveErrors = 0;
  speedState.hintActive = false;
  speedState.trials = [];

  // Reset UI
  clearFeedback();
  updateCounter();
  updateTimerDisplay();

  // Generate first pair (different numbers)
  speedState.isFirstPair = true;
  speedState.num1 = randomNum();
  do { speedState.num2 = randomNum(); } while (speedState.num2 === speedState.num1);
  refreshNumbers();

  showScreen('screen-exercise');
  
  // Focus the input after transition
  if (speedFocusTimer) clearTimeout(speedFocusTimer);
  speedFocusTimer = setTimeout(() => {
    speedFocusTimer = null;
    const inp = document.getElementById('txt-eingabe');
    if (inp) inp.focus();
  }, 80);

  // Start timer tick
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(onTick, 1000);
}

// ─── Timer tick ───────────────────────────────────────────────────────────────
function onTick() {
  speedState.elapsedSeconds++;
  updateTimerDisplay();
  if (speedState.elapsedSeconds >= speedState.totalSeconds) {
    stoppGedrückt();
  }
}

function updateTimerDisplay() {
  document.getElementById('timer-elapsed').textContent   = formatTime(speedState.elapsedSeconds);
  const remaining = Math.max(0, speedState.totalSeconds - speedState.elapsedSeconds);
  document.getElementById('timer-remaining').textContent = formatTime(remaining);
  // Progress bar (shrinks as time passes)
  const pct = speedState.totalSeconds > 0 ? (remaining / speedState.totalSeconds) * 100 : 0;
  const bar = document.getElementById('progress-bar');
  bar.style.width = pct + '%';
  if (pct < 25) {
    bar.style.background = 'linear-gradient(90deg, #b01010, #e03030)';
  } else if (pct < 60) {
    bar.style.background = 'linear-gradient(90deg, #9a6300, #e09000)';
  } else {
    bar.style.background = 'linear-gradient(90deg, #0f2d6b, #2a5fbb)';
  }
}

// ─── Number display ───────────────────────────────────────────────────────────
function refreshNumbers() {
  const topBox = document.getElementById('lbl-eins');
  if (speedState.isFirstPair || speedState.hintActive) {
    topBox.textContent = speedState.num1;
    topBox.classList.remove('remembered');
    if (speedState.hintActive) topBox.classList.add('hint-reveal');
  } else {
    topBox.textContent = '?';
    topBox.classList.remove('hint-reveal');
    topBox.classList.add('remembered');
  }
  document.getElementById('lbl-zwei').textContent = speedState.num2;
}

// ─── Input handling ───────────────────────────────────────────────────────────
(function setupInput() {
  const inp = document.getElementById('txt-eingabe');

  // Primary: catch every typed character immediately
  inp.addEventListener('input', function () {
    const val = this.value.trim();
    this.value = ''; // Always clear immediately

    if (!val || speedState.inputBlocked) return;

    const firstChar = val[0];
    if (/^\d$/.test(firstChar)) {
      processDigit(parseInt(firstChar, 10));
    } else if (firstChar) {
      handleKeineZahl(firstChar);
    }
  });

  // Prevent non-useful keys from accumulating
  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Enter with a digit already typed is handled by 'input' event
      // Enter with empty field: ignore
    }
  });
})();

function processDigit(digit) {
  const answer = correctAnswer(); // last digit of (num1 + num2)
  const rememberedNumber = speedState.num2;
  const isCorrect = digit === answer;

  if (isCorrect) {
    speedState.consecutiveErrors = 0;
    speedState.hintActive = false;
    handleRichtig();
  } else {
    speedState.consecutiveErrors++;
    handleFalsch();
    // After N consecutive errors: reveal the remembered number as a hint
    if (!speedState.isFirstPair && speedState.consecutiveErrors >= HINT_AFTER_ERRORS) {
      speedState.hintActive = true;
      refreshNumbers(); // show num1 in top box
      showFeedback('Tipp: gemerkte Zahl ist ' + speedState.num1, 'richtig', 3000);
      return; // don't advance yet – let them enter the correct answer
    }
  }

  speedState.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'accuracy',
    reactionTimeMs: null,
    correct: isCorrect,
    omitted: false,
    anticipated: false,
    difficultyLevel: null,
    sequenceLength: null,
    mode: 'speed',
    blockLabel: null
  });

  // The previously visible bottom number carries forward as the remembered number
  speedState.isFirstPair = false;
  speedState.hintActive = false;
  speedState.num1 = rememberedNumber;
  do { speedState.num2 = randomNum(); } while (speedState.num2 === speedState.num1);
  refreshNumbers();

  speedState.stats.rechnungen++;
  updateCounter();
}

function handleRichtig() {
  speedState.stats.richtig++;
  speedState.perMinute[currentMinuteIndex()].richtig++;
  if (document.getElementById('cbx-warnung').checked) {
    showFeedback('richtig!', 'richtig', 900);
  }
}

function handleFalsch() {
  speedState.stats.falsch++;
  speedState.perMinute[currentMinuteIndex()].falsch++;
  if (document.getElementById('cbx-warnung').checked) {
    showFeedback('Ergebnis falsch!', 'falsch', 900);
  }
}

function handleKeineZahl(char) {
  speedState.stats.keineZahl++;
  speedState.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'accuracy',
    reactionTimeMs: null,
    correct: false,
    omitted: false,
    anticipated: false,
    difficultyLevel: null,
    sequenceLength: null,
    mode: 'speed-non-digit',
    blockLabel: char
  });
  if (document.getElementById('cbx-warnung').checked) {
    showFeedback('keine Zahl!', 'falsch', 1100);
  }
  // Block input for ~1 second (same as original Excel behavior)
  speedState.inputBlocked = true;
  if (speedInputBlockTimer) clearTimeout(speedInputBlockTimer);
  speedInputBlockTimer = setTimeout(() => {
    speedInputBlockTimer = null;
    speedState.inputBlocked = false;
    clearFeedback();
    const inp = document.getElementById('txt-eingabe');
    if (inp) { inp.value = ''; inp.focus(); }
  }, 1100);
}

let feedbackTimer = null;
function showFeedback(text, cssClass, duration) {
  const el = document.getElementById('lbl-warnung');
  el.textContent = text;
  el.className = 'feedback ' + cssClass;
  if (feedbackTimer) clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(clearFeedback, duration);
}

function clearFeedback() {
  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
    feedbackTimer = null;
  }
  const el = document.getElementById('lbl-warnung');
  el.textContent = '';
  el.className = 'feedback';
}

// ─── Counter display ──────────────────────────────────────────────────────────
function updateCounter() {
  const shown = document.getElementById('cbx-rechnungen').checked;
  const wrap  = document.getElementById('counter-wrap');
  wrap.style.display = shown ? 'block' : 'none';
  document.getElementById('lbl-zaehler').textContent = speedState.stats.rechnungen;
}

document.getElementById('cbx-rechnungen').addEventListener('change', updateCounter);

// ─── Stop ─────────────────────────────────────────────────────────────────────
function stoppGedrückt() {
  clearMainSpeedTimer();
  showResults();
}

// ─── Results ──────────────────────────────────────────────────────────────────
function showResults() {
  document.getElementById('res-zeitlimit').textContent = formatTime(speedState.totalSeconds);
  document.getElementById('res-richtig').textContent   = speedState.stats.richtig;
  document.getElementById('res-falsch').textContent    = speedState.stats.falsch;
  document.getElementById('res-dauer').textContent     = formatTime(speedState.elapsedSeconds);

  const answered = speedState.stats.richtig + speedState.stats.falsch;
  const pct = answered > 0
    ? Math.round((speedState.stats.richtig / answered) * 100)
    : 0;
  document.getElementById('res-percent-text').textContent = pct + '%';
  setResultInsight('res-insight', 'speed', pct);
  const circle = document.getElementById('res-percent-circle');
  if (pct >= 80)      { circle.style.borderColor = '#1a7a2a'; circle.style.color = '#1a7a2a'; circle.style.background = '#f0fff4'; }
  else if (pct >= 50) { circle.style.borderColor = '#9a6300'; circle.style.color = '#9a6300'; circle.style.background = '#fffbf0'; }
  else                { circle.style.borderColor = '#b82020'; circle.style.color = '#b82020'; circle.style.background = '#fff4f4'; }
  saveTrainingEntry({
    module: 'speed',
    label: 'Speed-Rechnen',
    trials: speedState.trials || [],
    correct: speedState.stats.richtig,
    wrong: speedState.stats.falsch,
    total: speedState.stats.richtig + speedState.stats.falsch,
    accuracy: pct,
    duration: speedState.elapsedSeconds,
    totalSeconds: speedState.totalSeconds
  });
  renderChart();
  showScreen('screen-results');
}

// ─── Chart ────────────────────────────────────────────────────────────────────
function renderChart() {
  const W = 360, H = 190;
  const ml = 34, mr = 14, mt = 20, mb = 36;
  const cW = W - ml - mr;
  const cH = H - mt - mb;

  // Determine how many minutes have data
  let lastMin = 0;
  speedState.perMinute.forEach((m, i) => { if (m.richtig + m.falsch > 0) lastMin = i; });
  const numCols = Math.max(5, lastMin + 2);

  const maxVal = Math.max(1, ...speedState.perMinute.slice(0, numCols).map(m => m.richtig + m.falsch));

  const colW   = cW / numCols;
  const barW   = Math.max(3, colW * 0.32);

  // Y-axis nice ticks
  const yTicks = 4;

  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">`;
  s += `<g transform="translate(${ml},${mt})">`;

  // Gridlines + Y labels
  for (let i = 0; i <= yTicks; i++) {
    const y   = cH - (i / yTicks) * cH;
    const val = Math.round((i / yTicks) * maxVal);
    s += `<line x1="0" y1="${y}" x2="${cW}" y2="${y}" stroke="#e8ecf2" stroke-width="1"/>`;
    s += `<text x="-4" y="${y + 4}" text-anchor="end" font-size="10" fill="#889">${val}</text>`;
  }

  // Axes
  s += `<line x1="0" y1="0" x2="0" y2="${cH}" stroke="#bbc" stroke-width="1.5"/>`;
  s += `<line x1="0" y1="${cH}" x2="${cW}" y2="${cH}" stroke="#bbc" stroke-width="1.5"/>`;

  // Bars
  for (let i = 0; i < numCols; i++) {
    const m   = speedState.perMinute[i] || { richtig: 0, falsch: 0 };
    const cx  = i * colW + colW / 2;

    if (m.richtig > 0) {
      const bh = (m.richtig / maxVal) * cH;
      s += `<rect x="${(cx - barW).toFixed(1)}" y="${(cH - bh).toFixed(1)}"
        width="${barW.toFixed(1)}" height="${bh.toFixed(1)}"
        fill="#0f2d6b" rx="2" opacity="0.87"/>`;
    }
    if (m.falsch > 0) {
      const bh = (m.falsch / maxVal) * cH;
      s += `<rect x="${(cx + 1).toFixed(1)}" y="${(cH - bh).toFixed(1)}"
        width="${barW.toFixed(1)}" height="${bh.toFixed(1)}"
        fill="#b82020" rx="2" opacity="0.83"/>`;
    }

    s += `<text x="${cx.toFixed(1)}" y="${cH + 14}" text-anchor="middle" font-size="10" fill="#778">${i + 1}</text>`;
  }

  // X axis label
  s += `<text x="${(cW / 2).toFixed(0)}" y="${cH + 30}" text-anchor="middle" font-size="11" fill="#667">Minute</text>`;

  // Legend
  const lx = cW - 76;
  s += `<rect x="${lx}" y="2"  width="11" height="11" fill="#0f2d6b" rx="2"/>`;
  s += `<text x="${lx + 15}" y="12" font-size="11" fill="#333">Richtig</text>`;
  s += `<rect x="${lx}" y="18" width="11" height="11" fill="#b82020" rx="2"/>`;
  s += `<text x="${lx + 15}" y="28" font-size="11" fill="#333">Falsch</text>`;

  s += '</g></svg>';
  document.getElementById('chart-area').innerHTML = s;
}

bindDeclarativeActions();

// ─── FORMEN VERGLEICHEN ─────────────────────────────────────────────────────────
function _formenPolyPts(n, cx, cy, r, startDeg) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (startDeg + i * (360 / n)) * Math.PI / 180;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `<polygon points="${pts.join(' ')}"/>`;
}
function _formenStarPts(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * 36 - 90) * Math.PI / 180;
    const rad = i % 2 === 0 ? r : r * 0.42;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `<polygon points="${pts.join(' ')}"/>`;
}
function _formenCross(cx, cy, r) {
  const w = r * 0.35;
  const p = [
    [cx-w,cy-r],[cx+w,cy-r],[cx+w,cy-w],[cx+r,cy-w],
    [cx+r,cy+w],[cx+w,cy+w],[cx+w,cy+r],[cx-w,cy+r],
    [cx-w,cy+w],[cx-r,cy+w],[cx-r,cy-w],[cx-w,cy-w]
  ].map(([x,y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  return `<polygon points="${p}"/>`;
}
function _formenArrow(cx, cy, r) {
  const hw = r * 0.36, aw = r * 0.72;
  const p = [
    [cx-r,cy-hw],[cx,cy-hw],[cx,cy-aw],[cx+r,cy],[cx,cy+aw],[cx,cy+hw],[cx-r,cy+hw]
  ].map(([x,y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  return `<polygon points="${p}"/>`;
}
const FORMEN_SHAPE_DEFS = {
  circle:   { label: 'Kreis',    sym: true,  fn: (cx,cy,r) => `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r.toFixed(2)}"/>` },
  square:   { label: 'Quadrat',  sym: true,  fn: (cx,cy,r) => `<rect x="${(cx-r).toFixed(2)}" y="${(cy-r).toFixed(2)}" width="${(r*2).toFixed(2)}" height="${(r*2).toFixed(2)}" rx="4"/>` },
  triangle: { label: 'Dreieck', sym: false, fn: (cx,cy,r) => `<polygon points="${cx.toFixed(2)},${(cy-r).toFixed(2)} ${(cx+r*0.87).toFixed(2)},${(cy+r*0.5).toFixed(2)} ${(cx-r*0.87).toFixed(2)},${(cy+r*0.5).toFixed(2)}"/>` },
  diamond:  { label: 'Raute',    sym: true,  fn: (cx,cy,r) => `<polygon points="${cx.toFixed(2)},${(cy-r).toFixed(2)} ${(cx+r*0.78).toFixed(2)},${cy.toFixed(2)} ${cx.toFixed(2)},${(cy+r).toFixed(2)} ${(cx-r*0.78).toFixed(2)},${cy.toFixed(2)}"/>` },
  pentagon: { label: 'F\u00fcnfeck', sym: false, fn: (cx,cy,r) => _formenPolyPts(5, cx, cy, r, -90) },
  hexagon:  { label: 'Sechseck', sym: true,  fn: (cx,cy,r) => _formenPolyPts(6, cx, cy, r, -30) },
  cross:    { label: 'Kreuz',    sym: true,  fn: (cx,cy,r) => _formenCross(cx, cy, r) },
  star:     { label: 'Stern',   sym: false, fn: (cx,cy,r) => _formenStarPts(cx, cy, r) },
  arrow:    { label: 'Pfeil',   sym: false, fn: (cx,cy,r) => _formenArrow(cx, cy, r) },
};
const FORMEN_COLORS = [
  { fill: '#2060c0', stroke: '#1045a0', label: 'Blau' },
  { fill: '#c02020', stroke: '#8f1818', label: 'Rot' },
  { fill: '#1a7a2a', stroke: '#125a1e', label: 'Gr\u00fcn' },
  { fill: '#c07800', stroke: '#9a5e00', label: 'Orange' },
  { fill: '#7030a8', stroke: '#502080', label: 'Lila' },
  { fill: '#0a7a7a', stroke: '#085858', label: 'T\u00fcrkis' },
];
const FORMEN_PROFILE = { label: 'Anspruchsvoll', mode: 'mixed', advanceMs: 1500, trialMs: 5000 };
const FORMEN_MIX_POOL = ['color', 'rotation', 'rotation', 'shape-line', 'shape-line', 'shape-line', 'lines-angle', 'lines-angle', 'lines-count', 'lines-count', 'lines-glyph', 'lines-glyph', 'lines-overlay', 'lines-overlay', 'shape-line'];
const FORMEN_TRIAL_MS_BY_MODE = {
  shape: 4600,
  color: 4400,
  rotation: 4100,
  'shape-line': 3700,
  'lines-angle': 4200,
  'lines-count': 4400,
  'lines-glyph': 4000,
  'lines-overlay': 3900,
};
const FORMEN_SHAPE_LINE_KEYS = ['triangle', 'square', 'star', 'circle'];
const FORMEN_GLYPH_SEGMENTS = {
  E: {
    label: 'E',
    segments: [
      [0.26, 0.18, 0.26, 0.82],
      [0.26, 0.18, 0.76, 0.18],
      [0.26, 0.50, 0.68, 0.50],
      [0.26, 0.82, 0.76, 0.82],
    ],
  },
  Y: {
    label: 'Y',
    segments: [
      [0.24, 0.20, 0.50, 0.46],
      [0.76, 0.20, 0.50, 0.46],
      [0.50, 0.46, 0.50, 0.82],
    ],
  },
  F: {
    label: 'F',
    segments: [
      [0.28, 0.18, 0.28, 0.82],
      [0.28, 0.18, 0.76, 0.18],
      [0.28, 0.50, 0.66, 0.50],
    ],
  },
  H: {
    label: 'H',
    segments: [
      [0.28, 0.18, 0.28, 0.82],
      [0.72, 0.18, 0.72, 0.82],
      [0.28, 0.50, 0.72, 0.50],
    ],
  },
  A: {
    label: 'A',
    segments: [
      [0.30, 0.82, 0.50, 0.18],
      [0.50, 0.18, 0.70, 0.82],
      [0.38, 0.55, 0.62, 0.55],
    ],
  },
  K: {
    label: 'K',
    segments: [
      [0.30, 0.18, 0.30, 0.82],
      [0.30, 0.50, 0.74, 0.18],
      [0.30, 0.50, 0.74, 0.82],
    ],
  },
  T: {
    label: 'T',
    segments: [
      [0.24, 0.20, 0.76, 0.20],
      [0.50, 0.20, 0.50, 0.82],
    ],
  },
  X: {
    label: 'X',
    segments: [
      [0.26, 0.20, 0.74, 0.82],
      [0.74, 0.20, 0.26, 0.82],
    ],
  },
  M: {
    label: 'M',
    segments: [
      [0.24, 0.82, 0.24, 0.20],
      [0.24, 0.20, 0.50, 0.54],
      [0.50, 0.54, 0.76, 0.20],
      [0.76, 0.20, 0.76, 0.82],
    ],
  },
  N: {
    label: 'N',
    segments: [
      [0.26, 0.82, 0.26, 0.20],
      [0.26, 0.20, 0.74, 0.82],
      [0.74, 0.82, 0.74, 0.20],
    ],
  },
  Z: {
    label: 'Z',
    segments: [
      [0.24, 0.22, 0.76, 0.22],
      [0.76, 0.22, 0.24, 0.82],
      [0.24, 0.82, 0.76, 0.82],
    ],
  },
};

function _makeFormenGlyphTile(glyphId, missingSegmentIdx, col, size) {
  const def = FORMEN_GLYPH_SEGMENTS[glyphId];
  const strokeW = (size * 0.075).toFixed(1);
  let lines = '';
  def.segments.forEach(function(seg, idx) {
    if (idx === missingSegmentIdx) return;
    const x1 = (seg[0] * size).toFixed(2);
    const y1 = (seg[1] * size).toFixed(2);
    const x2 = (seg[2] * size).toFixed(2);
    const y2 = (seg[3] * size).toFixed(2);
    lines += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + col.fill + '" stroke-width="' + strokeW + '" stroke-linecap="round"/>';
  });
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg">' + lines + '</svg>';
}

function _makeFormenLineTile(angleDeg, col, size) {
  const half = size / 2;
  const len = size * 0.42;
  const rad = angleDeg * Math.PI / 180;
  const x1 = (half - len * Math.cos(rad)).toFixed(2);
  const y1 = (half - len * Math.sin(rad)).toFixed(2);
  const x2 = (half + len * Math.cos(rad)).toFixed(2);
  const y2 = (half + len * Math.sin(rad)).toFixed(2);
  const sw = (size * 0.07).toFixed(1);
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg"><line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + col.fill + '" stroke-width="' + sw + '" stroke-linecap="round"/></svg>';
}
function _makeFormenCountTile(count, col, size) {
  const sw = (size * 0.055).toFixed(1);
  const margin = size * 0.15;
  const usable = size - 2 * margin;
  const x1 = (size * 0.12).toFixed(2);
  const x2 = (size * 0.88).toFixed(2);
  let lines = '';
  for (let i = 0; i < count; i++) {
    const y = count === 1 ? size / 2 : margin + (usable / (count - 1)) * i;
    lines += '<line x1="' + x1 + '" y1="' + y.toFixed(2) + '" x2="' + x2 + '" y2="' + y.toFixed(2) + '" stroke="' + col.fill + '" stroke-width="' + sw + '" stroke-linecap="round"/>';
  }
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg">' + lines + '</svg>';
}
function _makeFormenOverlayTile(angles, col, size) {
  const half = size / 2;
  const len = size * 0.40;
  const sw = (size * 0.055).toFixed(1);
  let lines = '';
  angles.forEach(function(angleDeg) {
    const rad = angleDeg * Math.PI / 180;
    const x1 = (half - len * Math.cos(rad)).toFixed(2);
    const y1 = (half - len * Math.sin(rad)).toFixed(2);
    const x2 = (half + len * Math.cos(rad)).toFixed(2);
    const y2 = (half + len * Math.sin(rad)).toFixed(2);
    lines += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + col.fill + '" stroke-width="' + sw + '" stroke-linecap="round"/>';
  });
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg">' + lines + '</svg>';
}

function getFormenTrialMs(taskMode) {
  return FORMEN_TRIAL_MS_BY_MODE[taskMode] || FORMEN_PROFILE.trialMs;
}

function clearFormenTrialTimer() {
  if (formenState.trialTimer) {
    clearInterval(formenState.trialTimer);
    formenState.trialTimer = null;
  }
}

function startFormenTrialTimer() {
  if (!formenState.currentTask || !formenState.session) return;
  clearFormenTrialTimer();
  const trialMs = formenState.currentTask.trialMs;
  const trialEndAt = Date.now() + trialMs;
  const bar = document.getElementById('formen-trial-bar');
  const label = document.getElementById('formen-trial-remaining');
  bar.style.width = '100%';
  label.textContent = (trialMs / 1000).toFixed(1) + ' s';
  formenState.trialTimer = setInterval(() => {
    if (!formenState.currentTask || formenState.currentTask.answered) {
      clearFormenTrialTimer();
      return;
    }
    const remaining = Math.max(0, trialEndAt - Date.now());
    const pct = Math.max(0, remaining / trialMs * 100);
    bar.style.width = pct + '%';
    label.textContent = (remaining / 1000).toFixed(1) + ' s';
    if (remaining <= 0) {
      clearFormenTrialTimer();
      onFormenTrialTimeout();
    }
  }, 100);
}

function onFormenTrialTimeout() {
  if (!formenState.session || !formenState.currentTask || formenState.currentTask.answered) return;
  formenState.currentTask.answered = true;
  formenState.session.total++;
  formenState.session.wrong++;
  const isPractice = formenState.session.runMode === 'practice';
  const allBtns = Array.from(document.querySelectorAll('#formen-grid .formen-item'));
  setButtonsDisabled('#formen-grid .formen-item', true);
  const correctIdx = formenState.currentTask.items.findIndex(it => it.isOdd);
  if (isPractice && allBtns[correctIdx]) allBtns[correctIdx].classList.add('correct');
  if (isPractice) {
    showFormenPracticeFeedback('Zeit abgelaufen.', 'falsch', formenState.currentTask.explanation);
    scheduleFormenNext(formenState.session.profile.advanceMs);
  } else {
    hideFormenFeedbackUi();
    scheduleFormenNext(180);
  }
}

function showFormenPracticeFeedback(text, toneClass, explanationHtml) {
  const fb = document.getElementById('formen-feedback');
  fb.textContent = text;
  fb.className = 'feedback ' + toneClass;
  const expl = document.getElementById('formen-explanation');
  expl.innerHTML = `<strong>Erklaerung:</strong> ${explanationHtml}`;
  expl.style.display = 'block';
  document.getElementById('formen-next-wrap').style.display = 'block';
}

function hideFormenFeedbackUi() {
  document.getElementById('formen-feedback').textContent = '';
  document.getElementById('formen-feedback').className = 'feedback';
  document.getElementById('formen-explanation').style.display = 'none';
  document.getElementById('formen-next-wrap').style.display = 'none';
}

function scheduleFormenNext(delayMs) {
  formenState.advanceTimer = setTimeout(() => {
    formenState.advanceTimer = null;
    renderFormenTask();
  }, delayMs);
}

function makeFormenTileSVG(shapeId, col, rot, size) {
  const def = FORMEN_SHAPE_DEFS[shapeId];
  const r = size * 0.38;
  const cx = size / 2, cy = size / 2;
  const inner = def.fn(cx, cy, r);
  const rotAttr = rot !== 0 ? ` transform="rotate(${rot}, ${cx.toFixed(1)}, ${cy.toFixed(1)})"` : '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"><g fill="${col.fill}" stroke="${col.stroke}" stroke-width="1.5"${rotAttr}>${inner}</g></svg>`;
}

function _makeFormenShapeLineTile(shapeId, angleDeg, col, size) {
  const def = FORMEN_SHAPE_DEFS[shapeId];
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const outline = def.fn(cx, cy, r);
  const lineLen = size * 0.24;
  const rad = angleDeg * Math.PI / 180;
  const x1 = (cx - lineLen * Math.cos(rad)).toFixed(2);
  const y1 = (cy - lineLen * Math.sin(rad)).toFixed(2);
  const x2 = (cx + lineLen * Math.cos(rad)).toFixed(2);
  const y2 = (cy + lineLen * Math.sin(rad)).toFixed(2);
  const shapeStroke = (size * 0.045).toFixed(1);
  const lineStroke = (size * 0.06).toFixed(1);
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" xmlns="http://www.w3.org/2000/svg">'
    + '<g fill="none" stroke="' + col.stroke + '" stroke-width="' + shapeStroke + '" stroke-linejoin="round" stroke-linecap="round">' + outline + '</g>'
    + '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + col.fill + '" stroke-width="' + lineStroke + '" stroke-linecap="round"/>'
    + '</svg>';
}

function buildFormenTaskFromProfile(profile) {
  const taskMode = profile.mode === 'mixed' ? randomFrom(FORMEN_MIX_POOL) : profile.mode;
  const count = 9;
  const oddIdx = Math.floor(Math.random() * count);
  let items, explanation;

  if (taskMode === 'shape') {
    const allKeys = Object.keys(FORMEN_SHAPE_DEFS);
    const baseShape = randomFrom(allKeys);
    let oddShape; do { oddShape = randomFrom(allKeys); } while (oddShape === baseShape);
    const col = randomFrom(FORMEN_COLORS);
    items = Array.from({length: count}, (_, i) => ({ shapeId: i === oddIdx ? oddShape : baseShape, col, rot: 0, isOdd: i === oddIdx }));
    explanation = `Die abweichende Form hatte eine andere Gestalt (<strong>${FORMEN_SHAPE_DEFS[oddShape].label}</strong> statt ${FORMEN_SHAPE_DEFS[baseShape].label}).`;

  } else if (taskMode === 'color') {
    const shapeKey = randomFrom(Object.keys(FORMEN_SHAPE_DEFS));
    const baseCol = randomFrom(FORMEN_COLORS);
    let oddCol; do { oddCol = randomFrom(FORMEN_COLORS); } while (oddCol === baseCol);
    items = Array.from({length: count}, (_, i) => ({ shapeId: shapeKey, col: i === oddIdx ? oddCol : baseCol, rot: 0, isOdd: i === oddIdx }));
    explanation = `Die abweichende Form hatte eine andere Farbe (<strong>${oddCol.label}</strong> statt ${baseCol.label}).`;

  } else if (taskMode === 'rotation') {
    const asymKeys = Object.keys(FORMEN_SHAPE_DEFS).filter(k => !FORMEN_SHAPE_DEFS[k].sym);
    const shapeKey = randomFrom(asymKeys);
    const col = randomFrom(FORMEN_COLORS);
    const allRots = [0, 45, 90, 135, 180, 225, 270, 315];
    const baseRot = randomFrom(allRots);
    const oddCandidates = allRots.filter(function(r) {
      const diff = Math.min(Math.abs(r - baseRot), 360 - Math.abs(r - baseRot));
      return diff >= 45 && diff <= 90;
    });
    const oddRot = randomFrom(oddCandidates.length ? oddCandidates : allRots.filter(function(r) { return r !== baseRot; }));
    items = Array.from({length: count}, (_, i) => ({ shapeId: shapeKey, col, rot: i === oddIdx ? oddRot : baseRot, isOdd: i === oddIdx }));
    explanation = `Die abweichende Form war um <strong>${oddRot}&deg;</strong> gedreht, die anderen um ${baseRot}&deg;.`;
  } else if (taskMode === 'shape-line') {
    const shapeKey = randomFrom(FORMEN_SHAPE_LINE_KEYS);
    const col = randomFrom(FORMEN_COLORS);
    const angleChoices = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170];
    const angleLabel = { 0: '0°', 10: '10°', 20: '20°', 30: '30°', 40: '40°', 50: '50°', 60: '60°', 70: '70°', 80: '80°', 90: '90°', 100: '100°', 110: '110°', 120: '120°', 130: '130°', 140: '140°', 150: '150°', 160: '160°', 170: '170°' };
    const baseAngle = randomFrom(angleChoices);
    const oddCandidates = angleChoices.filter(function(a) {
      const diff = Math.min(Math.abs(a - baseAngle), 180 - Math.abs(a - baseAngle));
      return diff >= 10 && diff <= 20;
    });
    const oddAngle = randomFrom(oddCandidates.length ? oddCandidates : angleChoices.filter(function(a) { return a !== baseAngle; }));
    items = Array.from({length: count}, function(_, i) {
      return { svg: _makeFormenShapeLineTile(shapeKey, i === oddIdx ? oddAngle : baseAngle, col, 120), isOdd: i === oddIdx };
    });
    explanation = 'Die abweichende ungefuellte <strong>' + FORMEN_SHAPE_DEFS[shapeKey].label + '</strong>-Form hatte den Innenstrich '
      + '<strong>' + angleLabel[oddAngle] + '</strong> statt <strong>' + angleLabel[baseAngle] + '</strong> Neigung.';
  } else if (taskMode === 'lines-angle') {
    const col = randomFrom(FORMEN_COLORS);
    const allAngles = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165];
    const baseAngle = randomFrom(allAngles);
    const validOdd = allAngles.filter(function(a) {
      const diff = Math.min(Math.abs(a - baseAngle), 180 - Math.abs(a - baseAngle));
      return diff >= 15 && diff <= 30;
    });
    const oddAngle = randomFrom(validOdd.length ? validOdd : allAngles.filter(function(a){ return a !== baseAngle; }));
    items = Array.from({length: count}, function(_, i) {
      return { svg: _makeFormenLineTile(i === oddIdx ? oddAngle : baseAngle, col, 120), isOdd: i === oddIdx };
    });
    explanation = 'Die abweichende Linie hatte eine Neigung von <strong>' + oddAngle + '&deg;</strong>, die anderen von ' + baseAngle + '&deg;.';

  } else if (taskMode === 'lines-count') {
    const col = randomFrom(FORMEN_COLORS);
    const baseCounts = [3, 4, 5, 6];
    const baseCount = randomFrom(baseCounts);
    const oddCount = Math.random() < 0.5
      ? (baseCount > 2 ? baseCount - 1 : baseCount + 1)
      : (baseCount < 7 ? baseCount + 1 : baseCount - 1);
    items = Array.from({length: count}, function(_, i) {
      return { svg: _makeFormenCountTile(i === oddIdx ? oddCount : baseCount, col, 120), isOdd: i === oddIdx };
    });
    explanation = 'Die abweichende Kachel hatte <strong>' + oddCount + ' Linie' + (oddCount !== 1 ? 'n' : '') + '</strong>, die anderen hatten ' + baseCount + '.';
  } else if (taskMode === 'lines-glyph') {
    const glyphId = randomFrom(['E', 'A', 'K', 'H', 'M', 'N', 'Z']);
    const segCount = FORMEN_GLYPH_SEGMENTS[glyphId].segments.length;
    const missingIdx = Math.floor(Math.random() * segCount);
    const col = randomFrom(FORMEN_COLORS);
    items = Array.from({length: count}, function(_, i) {
      return {
        svg: _makeFormenGlyphTile(glyphId, i === oddIdx ? missingIdx : -1, col, 120),
        isOdd: i === oddIdx
      };
    });
    explanation = 'Die abweichende Form war ein <strong>' + FORMEN_GLYPH_SEGMENTS[glyphId].label + '</strong> mit fehlendem Strich.';
  } else if (taskMode === 'lines-overlay') {
    const col = randomFrom(FORMEN_COLORS);
    const allAngles = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165];
    const baseA = randomFrom(allAngles);
    const baseB = randomFrom(allAngles.filter(function(a) { return a !== baseA; }));
    const baseC = randomFrom(allAngles.filter(function(a) { return a !== baseA && a !== baseB; }));
    const oddAOptions = allAngles.filter(function(a) {
      const diff = Math.min(Math.abs(a - baseA), 180 - Math.abs(a - baseA));
      return diff >= 15 && diff <= 30;
    });
    const oddA = randomFrom(oddAOptions.length ? oddAOptions : allAngles.filter(function(a) { return a !== baseA; }));
    items = Array.from({length: count}, function(_, i) {
      const angles = i === oddIdx ? [oddA, baseB, baseC] : [baseA, baseB, baseC];
      return { svg: _makeFormenOverlayTile(angles, col, 120), isOdd: i === oddIdx };
    });
    explanation = 'Die abweichende Kachel hatte ein minimal veraendertes ueberlagertes Linienmuster.';
  }

  if (!items) {
    return buildFormenTaskFromProfile(profile);
  }

  return { items, explanation, taskMode, trialMs: getFormenTrialMs(taskMode), answered: false, shownAt: Date.now() };
}

function buildFormenTask() {
  return buildFormenTaskFromProfile(formenState.session.profile);
}

function renderFormenTask() {
  if (!formenState.session) return;
  if (formenState.advanceTimer) { clearTimeout(formenState.advanceTimer); formenState.advanceTimer = null; }
  clearFormenTrialTimer();
  formenState.currentTask = buildFormenTask();
  formenState.taskCount++;
  document.getElementById('formen-progress').textContent = String(formenState.taskCount);
  const grid = document.getElementById('formen-grid');
  grid.innerHTML = '';
  formenState.currentTask.items.forEach((item, idx) => {
    const btn = document.createElement('button');
    btn.className = 'formen-item';
    btn.type = 'button';
    btn.innerHTML = item.svg != null ? item.svg : makeFormenTileSVG(item.shapeId, item.col, item.rot, 120);
    btn.dataset.idx = String(idx);
    btn.addEventListener('click', () => submitFormenAnswer(btn, item));
    grid.appendChild(btn);
  });
  hideFormenFeedbackUi();
  startFormenTrialTimer();
}

function submitFormenAnswer(button, item) {
  if (!formenState.session || !formenState.currentTask || formenState.currentTask.answered) return;
  clearFormenTrialTimer();
  formenState.currentTask.answered = true;
  formenState.session.total++;
  const isPractice = formenState.session.runMode === 'practice';
  const allBtns = Array.from(document.querySelectorAll('#formen-grid .formen-item'));
  setButtonsDisabled('#formen-grid .formen-item', true);
  const correctIdx = formenState.currentTask.items.findIndex(it => it.isOdd);
  const reactionTimeMs = Math.max(0, Date.now() - formenState.currentTask.shownAt);
  if (isPractice && allBtns[correctIdx]) allBtns[correctIdx].classList.add('correct');
  if (item.isOdd) {
    formenState.session.correct++;
    formenState.session.rtSum += reactionTimeMs;
    formenState.session.rtCount++;
  } else {
    formenState.session.wrong++;
    if (isPractice) {
      button.classList.add('wrong');
    }
  }
  formenState.session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'reaction',
    reactionTimeMs,
    correct: !!item.isOdd,
    omitted: false,
    anticipated: reactionTimeMs < 150,
    difficultyLevel: null,
    sequenceLength: null,
    mode: formenState.session.runMode,
    blockLabel: formenState.currentTask.taskMode || null
  });
  if (isPractice) {
    showFormenPracticeFeedback(item.isOdd ? 'Richtig!' : 'Falsch.', item.isOdd ? 'richtig' : 'falsch', formenState.currentTask.explanation);
    scheduleFormenNext(formenState.session.profile.advanceMs);
  } else {
    hideFormenFeedbackUi();
    scheduleFormenNext(120);
  }
}

function formenAdvanceNow() {
  if (formenState.advanceTimer) { clearTimeout(formenState.advanceTimer); formenState.advanceTimer = null; }
  renderFormenTask();
}

function clearFormenTimer() {
  clearStateInterval(formenState, 'timerInterval');
  clearStateTimeout(formenState, 'advanceTimer');
  clearFormenTrialTimer();
}

function openFormenHome() {
  openModuleHome('formen');
}

function openConcentrationHome() {
  openModuleHome('concentration');
}

function openMultitaskHome() {
  openModuleHome('multitasking');
}

function startFormenExercise() {
  const selectedMinutes = parseInt(document.getElementById('formen-time-select').value, 10) || 3;
  const runMode = document.getElementById('formen-runmode-select').value === 'test' ? 'test' : 'practice';
  const runModeLabel = runMode === 'test' ? 'Testmodus' : 'Übungsmodus';
  const profile = FORMEN_PROFILE;
  const totalSeconds = selectedMinutes * 60;
  formenState.session = { profile, runMode, runModeLabel, startedAt: Date.now(), totalSeconds, remainingSeconds: totalSeconds, correct: 0, wrong: 0, total: 0, rtSum: 0, rtCount: 0, trials: [] };
  formenState.taskCount = 0;
  formenState.currentTask = null;
  document.getElementById('formen-level-label').textContent = profile.label;
  document.getElementById('formen-mode-label').textContent = runModeLabel;
  document.getElementById('formen-total-time').textContent = formatTime(totalSeconds);
  document.getElementById('formen-remaining-time').textContent = formatTime(totalSeconds);
  document.getElementById('formen-progress-bar').style.width = '100%';
  document.getElementById('formen-trial-bar').style.width = '100%';
  document.getElementById('formen-trial-remaining').textContent = '--.- s';
  document.getElementById('formen-progress').textContent = '0';
  showScreen('screen-formen-exercise');
  renderFormenTask();
  formenState.timerInterval = setInterval(() => {
    if (!formenState.session) { clearFormenTimer(); return; }
    formenState.session.remainingSeconds--;
    document.getElementById('formen-remaining-time').textContent = formatTime(formenState.session.remainingSeconds);
    const pct = Math.max(0, formenState.session.remainingSeconds / formenState.session.totalSeconds * 100);
    document.getElementById('formen-progress-bar').style.width = pct + '%';
    if (formenState.session.remainingSeconds <= 0) { clearFormenTimer(); finishFormenExercise(true); }
  }, 1000);
}

function finishFormenExercise(timedOut) {
  clearFormenTimer();
  if (!formenState.session) return;
  const s = formenState.session;
  const elapsed = getElapsedSeconds(s.startedAt, s.totalSeconds, timedOut);
  const pct = getAccuracyPercent(s.correct, s.total);
  const avgRtMs = s.rtCount > 0 ? Math.round(s.rtSum / s.rtCount) : null;
  const avgRt = avgRtMs === null ? '-' : (avgRtMs / 1000).toFixed(2) + ' s';
  setTextEntries({
    'formen-result-percent': pct + '%',
    'formen-result-rt': avgRt,
    'formen-result-mode': s.runModeLabel,
    'formen-result-difficulty': s.profile.label,
    'formen-result-limit': formatTime(s.totalSeconds),
    'formen-result-correct': String(s.correct),
    'formen-result-wrong': String(s.wrong),
    'formen-result-total': String(s.total),
    'formen-result-duration': formatTime(elapsed)
  });
  setResultInsight('formen-result-insight', 'formen', pct, { avgRt: avgRtMs });
  saveTrainingEntry({
    module: 'formen',
    label: 'Formen vergleichen',
    avgRt: avgRtMs,
    trials: s.trials,
    correct: s.correct,
    wrong: s.wrong,
    total: s.total,
    accuracy: pct,
    duration: elapsed,
    totalSeconds: s.totalSeconds
  });
  showScreen('screen-formen-results');
}

function restartFormenMode() { startFormenExercise(); }

// ─── Digit Span ───────────────────────────────────────────────────────────────

const DIGITSPAN_MODE_LABELS = {
  forward: 'Vorwärts',
  backward: 'Rückwärts'
};

function digitSpanModeLabel(mode) {
  return DIGITSPAN_MODE_LABELS[mode] || DIGITSPAN_MODE_LABELS.forward;
}

function buildDigitSpanSequence(length) {
  const sequence = [];
  for (let i = 0; i < length; i++) {
    let nextDigit = Math.floor(Math.random() * 10);
    if (i > 0 && nextDigit === sequence[i - 1]) {
      nextDigit = (nextDigit + 3) % 10;
    }
    sequence.push(nextDigit);
  }
  return sequence;
}

function playDigitSpanSequence() {
  if (!digitspanState.session || !digitspanState.currentTask) return;
  const display = document.getElementById('digitspan-display');
  const prompt = document.getElementById('digitspan-prompt');
  const input = document.getElementById('digitspan-input');
  const sequence = digitspanState.currentTask.sequence;
  let index = 0;

  input.disabled = true;
  input.value = '';

  const revealNext = () => {
    if (!digitspanState.session || !digitspanState.currentTask || digitspanState.currentTask.answered) return;
    if (index >= sequence.length) {
      display.textContent = 'Eingeben';
      display.className = 'memory-placeholder';
      prompt.textContent = digitspanState.session.mode === 'backward'
        ? 'Gib die Folge jetzt rückwärts ein.'
        : 'Gib die Folge jetzt vorwärts ein.';
      digitspanState.currentTask.phase = 'answer';
      input.disabled = false;
      input.focus();
      return;
    }

    display.textContent = String(sequence[index]);
    display.className = 'memory-digit';
    prompt.textContent = 'Merken...';
    digitspanState.phaseTimer = setTimeout(() => {
      display.textContent = '·';
      display.className = 'memory-placeholder';
      index++;
      digitspanState.phaseTimer = setTimeout(revealNext, 170);
    }, 680);
  };

  revealNext();
}

function queueNextDigitSpanTask(delayMs) {
  if (digitspanState.phaseTimer) clearTimeout(digitspanState.phaseTimer);
  digitspanState.phaseTimer = setTimeout(() => {
    digitspanState.phaseTimer = null;
    renderDigitSpanTask();
  }, delayMs);
}

function renderDigitSpanTask() {
  if (!digitspanState.session) return;
  if (digitspanState.phaseTimer) {
    clearTimeout(digitspanState.phaseTimer);
    digitspanState.phaseTimer = null;
  }

  digitspanState.taskCount++;
  const spanLength = digitspanState.session.spanLength;
  const sequence = buildDigitSpanSequence(spanLength);
  digitspanState.currentTask = {
    sequence,
    expected: digitspanState.session.mode === 'backward' ? sequence.slice().reverse().join('') : sequence.join(''),
    phase: 'showing',
    answered: false
  };

  setTextEntries({
    'digitspan-progress': String(digitspanState.taskCount),
    'digitspan-length': String(spanLength),
    'digitspan-mode-label': digitSpanModeLabel(digitspanState.session.mode)
  });
  document.getElementById('digitspan-feedback').textContent = '';
  document.getElementById('digitspan-feedback').className = 'feedback';
  playDigitSpanSequence();
}

function startDigitSpanExercise() {
  const selectedMinutes = parseInt(document.getElementById('digitspan-time-select').value, 10) || 5;
  const mode = document.getElementById('digitspan-mode-select').value === 'backward' ? 'backward' : 'forward';
  const totalSeconds = selectedMinutes * 60;
  digitspanState.session = {
    mode,
    startedAt: Date.now(),
    totalSeconds,
    remainingSeconds: totalSeconds,
    correct: 0,
    wrong: 0,
    total: 0,
    spanLength: mode === 'backward' ? 4 : 3,
    maxSpan: mode === 'backward' ? 4 : 3,
    trials: []
  };

  digitspanState.taskCount = 0;
  showScreen('screen-digitspan-exercise');
  clearDigitSpanTimer();
  updateModuleTimer('digitspan', digitspanState.session);
  document.getElementById('digitspan-input').value = '';
  document.getElementById('digitspan-input').disabled = true;

  digitspanState.timerInterval = setInterval(() => {
    if (!digitspanState.session) return;
    digitspanState.session.remainingSeconds--;
    updateModuleTimer('digitspan', digitspanState.session);
    if (digitspanState.session.remainingSeconds <= 0) finishDigitSpanExercise(true);
  }, 1000);

  renderDigitSpanTask();
}

function applyDigitSpanResult(isCorrect, message) {
  if (!digitspanState.session || !digitspanState.currentTask) return;
  const feedback = document.getElementById('digitspan-feedback');
  const input = document.getElementById('digitspan-input');
  input.disabled = true;
  digitspanState.currentTask.answered = true;
  digitspanState.session.total++;

  if (isCorrect) {
    digitspanState.session.correct++;
    digitspanState.session.maxSpan = Math.max(digitspanState.session.maxSpan, digitspanState.currentTask.sequence.length);
    digitspanState.session.spanLength = Math.min(9, digitspanState.currentTask.sequence.length + 1);
    feedback.textContent = message;
    feedback.className = 'feedback richtig';
  } else {
    digitspanState.session.wrong++;
    digitspanState.session.spanLength = Math.max(3, digitspanState.currentTask.sequence.length - 1);
    feedback.textContent = message;
    feedback.className = 'feedback falsch';
  }

  digitspanState.session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'memory',
    reactionTimeMs: null,
    correct: isCorrect,
    omitted: false,
    anticipated: false,
    difficultyLevel: digitspanState.currentTask.sequence.length,
    sequenceLength: digitspanState.currentTask.sequence.length,
    mode: digitspanState.session.mode,
    blockLabel: null
  });

  queueNextDigitSpanTask(800);
}

function submitDigitSpanAnswer() {
  if (!digitspanState.session || !digitspanState.currentTask || digitspanState.currentTask.phase !== 'answer' || digitspanState.currentTask.answered) return;
  const input = document.getElementById('digitspan-input');
  const normalized = (input.value || '').replace(/\D/g, '');
  if (!normalized) {
    const feedback = document.getElementById('digitspan-feedback');
    feedback.textContent = 'Bitte gib die Zahlenfolge ein.';
    feedback.className = 'feedback falsch';
    return;
  }

  const isCorrect = normalized === digitspanState.currentTask.expected;
  applyDigitSpanResult(isCorrect, isCorrect
    ? `Richtig! Folge ${digitspanState.currentTask.expected} korrekt erinnert.`
    : `Falsch. Richtig war ${digitspanState.currentTask.expected}.`);
}

function skipDigitSpanTask() {
  if (!digitspanState.session || !digitspanState.currentTask || digitspanState.currentTask.answered) return;
  if (digitspanState.phaseTimer) {
    clearTimeout(digitspanState.phaseTimer);
    digitspanState.phaseTimer = null;
  }
  applyDigitSpanResult(false, `Übersprungen. Richtig wäre ${digitspanState.currentTask.expected} gewesen.`);
}

function finishDigitSpanExercise(timedOut) {
  clearDigitSpanTimer();
  if (!digitspanState.session) {
    showScreen('screen-digitspan-results');
    return;
  }

  const pct = getAccuracyPercent(digitspanState.session.correct, digitspanState.session.total);
  const elapsed = getElapsedSeconds(digitspanState.session.startedAt, digitspanState.session.totalSeconds, timedOut);
  setTextEntries({
    'digitspan-result-percent': `${pct}%`,
    'digitspan-result-span': String(digitspanState.session.maxSpan),
    'digitspan-result-mode': digitSpanModeLabel(digitspanState.session.mode),
    'digitspan-result-limit': formatTime(digitspanState.session.totalSeconds),
    'digitspan-result-correct': String(digitspanState.session.correct),
    'digitspan-result-wrong': String(digitspanState.session.wrong),
    'digitspan-result-total': String(digitspanState.session.total),
    'digitspan-result-duration': formatTime(elapsed)
  });
  setResultInsight('digitspan-result-insight', 'digitspan', pct, { maxSpan: digitspanState.session.maxSpan, mode: digitspanState.session.mode });
  saveTrainingEntry({
    module: 'digitspan',
    label: `Digit Span (${digitSpanModeLabel(digitspanState.session.mode)})`,
    mode: digitspanState.session.mode,
    maxSpan: digitspanState.session.maxSpan,
    trials: digitspanState.session.trials,
    correct: digitspanState.session.correct,
    wrong: digitspanState.session.wrong,
    total: digitspanState.session.total,
    accuracy: pct,
    duration: elapsed,
    totalSeconds: digitspanState.session.totalSeconds
  });
  showScreen('screen-digitspan-results');
}

function restartDigitSpanMode() {
  startDigitSpanExercise();
}

// ─── Flanker ──────────────────────────────────────────────────────────────────

const FLANKER_DIFFICULTY = {
  easy: { label: 'Leicht', incongruentRate: 0.25, advanceMs: 500 },
  medium: { label: 'Mittel', incongruentRate: 0.45, advanceMs: 430 },
  hard: { label: 'Schwer', incongruentRate: 0.65, advanceMs: 360 }
};

function buildFlankerTask() {
  const profile = flankerState.session.profile;
  const target = Math.random() < 0.5 ? 'left' : 'right';
  const type = Math.random() < profile.incongruentRate ? 'incongruent' : 'congruent';
  const targetChar = target === 'left' ? '<' : '>';
  const flankChar = type === 'congruent' ? targetChar : (target === 'left' ? '>' : '<');
  return {
    type,
    target,
    stimulus: flankChar + flankChar + targetChar + flankChar + flankChar,
    shownAt: Date.now(),
    answered: false
  };
}

function renderFlankerTask() {
  if (!flankerState.session) return;
  if (flankerState.advanceTimer) {
    clearTimeout(flankerState.advanceTimer);
    flankerState.advanceTimer = null;
  }
  flankerState.currentTask = buildFlankerTask();
  flankerState.taskCount++;
  setTextEntries({
    'flanker-progress': String(flankerState.taskCount),
    'flanker-level-label': flankerState.session.profile.label,
    'flanker-type-label': flankerState.currentTask.type === 'incongruent' ? 'Störende Richtung' : 'Gleiche Richtung'
  });
  document.getElementById('flanker-stimulus').textContent = flankerState.currentTask.stimulus;
  document.getElementById('flanker-feedback').textContent = '';
  document.getElementById('flanker-feedback').className = 'feedback';
}

function startFlankerExercise() {
  const selectedMinutes = parseInt(document.getElementById('flanker-time-select').value, 10) || 5;
  const difficultyKeyRaw = document.getElementById('flanker-difficulty-select').value;
  const difficultyKey = Object.prototype.hasOwnProperty.call(FLANKER_DIFFICULTY, difficultyKeyRaw) ? difficultyKeyRaw : 'medium';
  const profile = FLANKER_DIFFICULTY[difficultyKey];
  const totalSeconds = selectedMinutes * 60;
  flankerState.session = {
    difficulty: difficultyKey,
    profile,
    startedAt: Date.now(),
    totalSeconds,
    remainingSeconds: totalSeconds,
    correct: 0,
    wrong: 0,
    total: 0,
    rtSum: 0,
    rtCount: 0,
    trials: [],
    congruent: { correct: 0, total: 0 },
    incongruent: { correct: 0, total: 0 }
  };

  flankerState.taskCount = 0;
  showScreen('screen-flanker-exercise');
  clearFlankerTimer();
  updateModuleTimer('flanker', flankerState.session);
  document.getElementById('flanker-level-label').textContent = profile.label;
  flankerState.timerInterval = setInterval(() => {
    if (!flankerState.session) return;
    flankerState.session.remainingSeconds--;
    updateModuleTimer('flanker', flankerState.session);
    if (flankerState.session.remainingSeconds <= 0) finishFlankerExercise(true);
  }, 1000);
  renderFlankerTask();
}

function submitFlankerAnswer(direction) {
  if (!flankerState.session || !flankerState.currentTask || flankerState.currentTask.answered) return;
  flankerState.currentTask.answered = true;
  flankerState.session.total++;
  flankerState.session[flankerState.currentTask.type].total++;
  const isCorrect = direction === flankerState.currentTask.target;
  const reactionTimeMs = Math.max(0, Date.now() - flankerState.currentTask.shownAt);
  const feedback = document.getElementById('flanker-feedback');
  if (isCorrect) {
    flankerState.session.correct++;
    flankerState.session[flankerState.currentTask.type].correct++;
    flankerState.session.rtSum += reactionTimeMs;
    flankerState.session.rtCount++;
    feedback.textContent = 'Richtig!';
    feedback.className = 'feedback richtig';
  } else {
    flankerState.session.wrong++;
    feedback.textContent = `Falsch. Richtig war ${flankerState.currentTask.target === 'left' ? 'links' : 'rechts'}.`;
    feedback.className = 'feedback falsch';
  }

  flankerState.session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'reaction',
    reactionTimeMs,
    correct: isCorrect,
    omitted: false,
    anticipated: reactionTimeMs < 150,
    difficultyLevel: null,
    sequenceLength: null,
    mode: flankerState.session.difficulty,
    blockLabel: flankerState.currentTask.type
  });

  flankerState.advanceTimer = setTimeout(() => {
    flankerState.advanceTimer = null;
    renderFlankerTask();
  }, flankerState.session.profile.advanceMs);
}

function finishFlankerExercise(timedOut) {
  clearFlankerTimer();
  if (!flankerState.session) {
    showScreen('screen-flanker-results');
    return;
  }
  const pct = getAccuracyPercent(flankerState.session.correct, flankerState.session.total);
  const elapsed = getElapsedSeconds(flankerState.session.startedAt, flankerState.session.totalSeconds, timedOut);
  const avgRt = flankerState.session.rtCount > 0 ? Math.round(flankerState.session.rtSum / flankerState.session.rtCount) : null;
  setTextEntries({
    'flanker-result-percent': `${pct}%`,
    'flanker-result-rt': avgRt === null ? '-' : `${avgRt} ms`,
    'flanker-result-difficulty': flankerState.session.profile.label,
    'flanker-result-limit': formatTime(flankerState.session.totalSeconds),
    'flanker-result-correct': String(flankerState.session.correct),
    'flanker-result-wrong': String(flankerState.session.wrong),
    'flanker-result-total': String(flankerState.session.total),
    'flanker-result-duration': formatTime(elapsed)
  });
  setResultInsight('flanker-result-insight', 'flanker', pct, { avgRt });
  saveTrainingEntry({
    module: 'flanker',
    label: 'Flanker',
    difficulty: flankerState.session.difficulty,
    avgRt,
    trials: flankerState.session.trials,
    correct: flankerState.session.correct,
    wrong: flankerState.session.wrong,
    total: flankerState.session.total,
    accuracy: pct,
    duration: elapsed,
    totalSeconds: flankerState.session.totalSeconds
  });
  showScreen('screen-flanker-results');
}

function restartFlankerMode() {
  startFlankerExercise();
}

// ─── Visuelle Suche ──────────────────────────────────────────────────────────

const VISUALSEARCH_DIFFICULTY = {
  easy: {
    label: 'Leicht',
    size: 4,
    pairs: [['C', 'G'], ['E', 'F'], ['P', 'R']],
    advanceMs: 550
  },
  medium: {
    label: 'Mittel',
    size: 5,
    pairs: [['O', 'Q'], ['M', 'N'], ['H', 'K'], ['P', 'R']],
    advanceMs: 500
  },
  hard: {
    label: 'Schwer',
    size: 6,
    pairs: [['O', 'Q'], ['M', 'N'], ['U', 'V'], ['C', 'G'], ['E', 'F']],
    advanceMs: 450
  }
};

function buildVisualSearchTask() {
  const profile = visualsearchState.session.profile;
  const pair = randomFrom(profile.pairs);
  const target = Math.random() < 0.5 ? pair[0] : pair[1];
  const distractor = target === pair[0] ? pair[1] : pair[0];
  const totalCells = profile.size * profile.size;
  const correctIndex = Math.floor(Math.random() * totalCells);
  const cells = Array.from({ length: totalCells }, (_, index) => index === correctIndex ? target : distractor);
  return {
    target,
    distractor,
    correctIndex,
    cells,
    size: profile.size,
    shownAt: Date.now(),
    answered: false
  };
}

function renderVisualSearchTask() {
  if (!visualsearchState.session) return;
  if (visualsearchState.advanceTimer) {
    clearTimeout(visualsearchState.advanceTimer);
    visualsearchState.advanceTimer = null;
  }
  visualsearchState.currentTask = buildVisualSearchTask();
  visualsearchState.taskCount++;
  setTextEntries({
    'visualsearch-progress': String(visualsearchState.taskCount),
    'visualsearch-level-label': visualsearchState.session.profile.label,
    'visualsearch-target': visualsearchState.currentTask.target
  });
  const grid = document.getElementById('visualsearch-grid');
  grid.style.gridTemplateColumns = `repeat(${visualsearchState.currentTask.size}, minmax(0, 1fr))`;
  grid.innerHTML = '';
  visualsearchState.currentTask.cells.forEach((cell, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'visual-search-cell';
    btn.textContent = cell;
    btn.style.fontSize = visualsearchState.currentTask.size >= 6 ? '1.25em' : '1.55em';
    btn.addEventListener('click', () => submitVisualSearchAnswer(index, btn));
    grid.appendChild(btn);
  });
  document.getElementById('visualsearch-feedback').textContent = '';
  document.getElementById('visualsearch-feedback').className = 'feedback';
}

function startVisualSearchExercise() {
  const selectedMinutes = parseInt(document.getElementById('visualsearch-time-select').value, 10) || 5;
  const difficultyKeyRaw = document.getElementById('visualsearch-difficulty-select').value;
  const difficultyKey = Object.prototype.hasOwnProperty.call(VISUALSEARCH_DIFFICULTY, difficultyKeyRaw) ? difficultyKeyRaw : 'medium';
  const profile = VISUALSEARCH_DIFFICULTY[difficultyKey];
  const totalSeconds = selectedMinutes * 60;
  visualsearchState.session = {
    difficulty: difficultyKey,
    profile,
    startedAt: Date.now(),
    totalSeconds,
    remainingSeconds: totalSeconds,
    correct: 0,
    wrong: 0,
    total: 0,
    rtSum: 0,
    rtCount: 0,
    trials: []
  };

  visualsearchState.taskCount = 0;
  showScreen('screen-visualsearch-exercise');
  clearVisualSearchTimer();
  updateModuleTimer('visualsearch', visualsearchState.session);
  document.getElementById('visualsearch-level-label').textContent = profile.label;
  visualsearchState.timerInterval = setInterval(() => {
    if (!visualsearchState.session) return;
    visualsearchState.session.remainingSeconds--;
    updateModuleTimer('visualsearch', visualsearchState.session);
    if (visualsearchState.session.remainingSeconds <= 0) finishVisualSearchExercise(true);
  }, 1000);
  renderVisualSearchTask();
}

function submitVisualSearchAnswer(index, button) {
  if (!visualsearchState.session || !visualsearchState.currentTask || visualsearchState.currentTask.answered) return;
  visualsearchState.currentTask.answered = true;
  visualsearchState.session.total++;
  const isCorrect = index === visualsearchState.currentTask.correctIndex;
  const reactionTimeMs = Math.max(0, Date.now() - visualsearchState.currentTask.shownAt);
  const feedback = document.getElementById('visualsearch-feedback');
  const buttons = Array.from(document.querySelectorAll('#visualsearch-grid .visual-search-cell'));
  buttons.forEach(btn => { btn.disabled = true; });

  if (isCorrect) {
    visualsearchState.session.correct++;
    visualsearchState.session.rtSum += reactionTimeMs;
    visualsearchState.session.rtCount++;
    button.classList.add('correct');
    feedback.textContent = 'Richtig gefunden!';
    feedback.className = 'feedback richtig';
  } else {
    visualsearchState.session.wrong++;
    button.classList.add('wrong');
    const correctBtn = buttons[visualsearchState.currentTask.correctIndex];
    if (correctBtn) correctBtn.classList.add('correct');
    feedback.textContent = 'Falsch. Der Zielreiz ist markiert.';
    feedback.className = 'feedback falsch';
  }

  visualsearchState.session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'reaction',
    reactionTimeMs,
    correct: isCorrect,
    omitted: false,
    anticipated: reactionTimeMs < 150,
    difficultyLevel: visualsearchState.currentTask.size,
    sequenceLength: null,
    mode: visualsearchState.session.difficulty,
    blockLabel: visualsearchState.currentTask.target
  });

  visualsearchState.advanceTimer = setTimeout(() => {
    visualsearchState.advanceTimer = null;
    renderVisualSearchTask();
  }, visualsearchState.session.profile.advanceMs);
}

function finishVisualSearchExercise(timedOut) {
  clearVisualSearchTimer();
  if (!visualsearchState.session) {
    showScreen('screen-visualsearch-results');
    return;
  }
  const pct = getAccuracyPercent(visualsearchState.session.correct, visualsearchState.session.total);
  const elapsed = getElapsedSeconds(visualsearchState.session.startedAt, visualsearchState.session.totalSeconds, timedOut);
  const avgRt = visualsearchState.session.rtCount > 0 ? Math.round(visualsearchState.session.rtSum / visualsearchState.session.rtCount) : null;
  setTextEntries({
    'visualsearch-result-percent': `${pct}%`,
    'visualsearch-result-rt': avgRt === null ? '-' : `${avgRt} ms`,
    'visualsearch-result-difficulty': visualsearchState.session.profile.label,
    'visualsearch-result-limit': formatTime(visualsearchState.session.totalSeconds),
    'visualsearch-result-correct': String(visualsearchState.session.correct),
    'visualsearch-result-wrong': String(visualsearchState.session.wrong),
    'visualsearch-result-total': String(visualsearchState.session.total),
    'visualsearch-result-duration': formatTime(elapsed)
  });
  setResultInsight('visualsearch-result-insight', 'visualsearch', pct, { avgRt });
  saveTrainingEntry({
    module: 'visual_search',
    label: 'Zielreiz finden',
    difficulty: visualsearchState.session.difficulty,
    avgRt,
    trials: visualsearchState.session.trials,
    correct: visualsearchState.session.correct,
    wrong: visualsearchState.session.wrong,
    total: visualsearchState.session.total,
    accuracy: pct,
    duration: elapsed,
    totalSeconds: visualsearchState.session.totalSeconds
  });
  showScreen('screen-visualsearch-results');
}

function restartVisualSearchMode() {
  startVisualSearchExercise();
}



