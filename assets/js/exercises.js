function openGoNoGoHome() {
  openModuleHome('gonogo');
}

function openStroopHome() {
  openModuleHome('stroop');
}

// ─── Generic practice mode helpers ─────────────────────────────────────────────
function isPracticeModeForModule(state) {
  return !!(state.session && state.session.runMode === 'practice');
}

function setPracticeModeUi(prefix, showFeedback, showNextButton) {
  const fb = document.getElementById(prefix + '-feedback');
  const nb = document.getElementById(prefix + '-next-button');
  if (fb) fb.classList.toggle('hidden', !showFeedback);
  if (nb) nb.classList.toggle('hidden', !showNextButton);
}

function showResultScreenIfSessionMissing(state, resultScreenId) {
  if (!state.session) {
    showScreen(resultScreenId);
    return true;
  }
  return false;
}

// ─── Exercise function exports ─────────────────────────────────────────────────

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

function openPQScanHome() {
  openModuleHome('pqscan');
}

function openWortanalogienHome() {
  openModuleHome('wortanalogien');
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
  updateExerciseTimerVisibility('screen-spatial-exercise', spatialState.session);
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
  const runMode = getSelectedRunMode('spatial-runmode-select');
  const totalSeconds = selectedMinutes * 60;
  spatialState.session = {
    runMode,
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
  startModuleTimer(spatialState, 'spatial', finishSpatialExercise);
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
    if (isPracticeRun(spatialState.session)) button.classList.add('correct');
    setImmediateFeedback(feedback, spatialState.session, `Richtig! Es sind ${spatialState.currentTask.correctTotal} Würfel.`, 'richtig');
  } else {
    spatialState.session.wrong++;
    if (isPracticeRun(spatialState.session)) button.classList.add('wrong');
    const correctBtn = options.find(btn => parseInt(btn.dataset.value, 10) === spatialState.currentTask.correctTotal);
    if (isPracticeRun(spatialState.session) && correctBtn) correctBtn.classList.add('correct');
    setImmediateFeedback(feedback, spatialState.session, `Falsch. Richtig sind ${spatialState.currentTask.correctTotal} Würfel.`, 'falsch');
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
    ...getRunModeEntryProps(spatialState.session.runMode),
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

function getSelectedRunMode(selectId) {
  const select = document.getElementById(selectId);
  return select && select.value === 'practice' ? 'practice' : 'test';
}

function isPracticeRun(session) {
  return !!session && session.runMode === 'practice';
}

function setImmediateFeedback(target, session, text, toneClass) {
  const el = typeof target === 'string' ? document.getElementById(target) : target;
  if (!el) return;
  if (isPracticeRun(session)) {
    el.textContent = text;
    el.className = toneClass ? `feedback ${toneClass}` : 'feedback';
    return;
  }
  el.textContent = '';
  el.className = 'feedback';
}

function getRunModeEntryProps(runMode) {
  const normalized = runMode === 'practice' ? 'practice' : 'test';
  return {
    runMode: normalized,
    countsTowardScoring: normalized !== 'practice'
  };
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
  const runMode = getSelectedRunMode('nback-mode-select');
  const feedbackEnabled = runMode === 'test'
    ? false
    : !!document.getElementById('nback-feedback-toggle').checked;
  const totalSeconds = selectedMinutes * 60;
  nbackState.session = {
    runMode,
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
  startModuleTimer(nbackState, 'nback', finishNbackExercise);
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
    if (nbackState.session.runMode === 'practice') {
      nbackState.session.showPrevHint = true;
    } else {
      nbackState.session.showPrevHint = false;
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
    mode: nbackState.session.runMode,
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
    'nback-result-mode': nbackModeLabel(nbackState.session.runMode),
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
    ...getRunModeEntryProps(nbackState.session.runMode),
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
    setImmediateFeedback(fb, gonogoState.session, 'Richtig - anderer Reiz ignoriert.', 'richtig');
  } else if (gonogoState.currentTask.isGo) {
    gonogoState.session.wrong++;
    setImmediateFeedback(fb, gonogoState.session, 'Zu langsam - das war ein GO-Reiz.', 'falsch');
  } else {
    gonogoState.session.correct++;
    setImmediateFeedback(fb, gonogoState.session, 'Richtig - NO-GO gehalten.', 'richtig');
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
  const runMode = getSelectedRunMode('gonogo-runmode-select');
  const profile = GONOGO_DIFFICULTY[diffKey];
  const totalSeconds = selectedMinutes * 60;
  gonogoState.session = {
    runMode,
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
  startModuleTimer(gonogoState, 'gonogo', finishGoNoGoExercise);
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
    setImmediateFeedback(fb, gonogoState.session, 'Falsch. Diese Kombination bitte ignorieren.', 'falsch');
  } else {
    const shouldReact = gonogoState.currentTask.isGo;
    const ok = react === shouldReact;
    trialCorrect = ok;
    trialOmitted = shouldReact && !react;
    if (ok) {
      gonogoState.session.correct++;
      setImmediateFeedback(fb, gonogoState.session, 'Richtig!', 'richtig');
      if (react) {
        gonogoState.session.rtSum += reactionTimeMs;
        gonogoState.session.rtCount++;
      }
    } else {
      gonogoState.session.wrong++;
      if (!shouldReact) {
        gonogoState.session.commissionErrors++;
        setImmediateFeedback(fb, gonogoState.session, 'Falsch. Das war ein NO-GO-Reiz.', 'falsch');
      } else {
        setImmediateFeedback(fb, gonogoState.session, 'Falsch. Das war ein GO-Reiz.', 'falsch');
      }
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
  if (showResultScreenIfSessionMissing(gonogoState, 'screen-gonogo-results')) return;
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
    ...getRunModeEntryProps(gonogoState.session.runMode),
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
  setImmediateFeedback(fb, stroopState.session, 'Zeit abgelaufen.', 'falsch');
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
  const runMode = getSelectedRunMode('stroop-runmode-select');
  const selectedDifficultyRaw = document.getElementById('stroop-difficulty-select').value;
  const selectedDifficulty = Object.prototype.hasOwnProperty.call(STROOP_DIFFICULTY, selectedDifficultyRaw) ? selectedDifficultyRaw : 'medium';
  const profile = STROOP_DIFFICULTY[selectedDifficulty];
  const selectedMinutes = parseInt(document.getElementById('stroop-time-select').value, 10) || 5;
  const totalSeconds = selectedMinutes * 60;
  const blockStats = Array.from({ length: STROOP_BLOCK_CONFIG.blocks }, () => ({ total: 0, correct: 0, wrong: 0, rtSum: 0, rtCount: 0 }));

  stroopState.session = {
    startedAt: Date.now(),
    runMode,
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
    startModuleTimer(stroopState, 'stroop', finishStroopExercise);
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
    setImmediateFeedback(fb, stroopState.session, 'Richtig!', 'richtig');
  } else {
    stroopState.session.wrong++;
    bucket.wrong++;
    if (blockBucket) blockBucket.wrong++;
    const ruleHint = stroopState.session.answerRule === 'word' ? 'Achte auf das Wort.' : 'Achte auf die Schriftfarbe.';
    setImmediateFeedback(fb, stroopState.session, `Falsch. ${ruleHint}`, 'falsch');
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
  if (showResultScreenIfSessionMissing(stroopState, 'screen-stroop-results')) return;

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
    ...getRunModeEntryProps(stroopState.session.runMode),
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
    setImmediateFeedback(fb, concentrationState.session, 'Vergessen!', 'falsch');
    concentrationState.session.wrong++;
    concentrationState.session.feedbackHoldUntil = isPracticeRun(concentrationState.session)
      ? Date.now() + CONCENTRATION_MISSED_FEEDBACK_MS
      : 0;
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
    setImmediateFeedback(fb, concentrationState.session, 'Richtig! ✓', 'richtig');
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
    setImmediateFeedback(fb, concentrationState.session, 'Falsch!', 'falsch');
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
  const runMode = getSelectedRunMode('concentration-runmode-select');
  const totalSeconds = selectedMinutes * 60;

  concentrationState.session = {
    runMode,
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
    ...getRunModeEntryProps(concentrationState.session.runMode),
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
    setImmediateFeedback(topFb, multitaskingState.session, 'Zeit abgelaufen', 'falsch');
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
    if (isPracticeRun(multitaskingState.session) && buttons[correctIdx]) buttons[correctIdx].classList.add('correct');
    const topFb = document.getElementById('multitask-top-feedback');
    setImmediateFeedback(topFb, multitaskingState.session, 'Zeit abgelaufen', 'falsch');
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
    setImmediateFeedback(topFb, multitaskingState.session, timedOut ? 'Richtig ignoriert' : 'Richtig', 'richtig');
  } else {
    multitaskingState.session.topWrong++;
    setImmediateFeedback(topFb, multitaskingState.session, 'Falsch', 'falsch');
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
    setImmediateFeedback(topFb, multitaskingState.session, 'Richtig', 'richtig');
  } else {
    multitaskingState.session.topWrong++;
    setImmediateFeedback(topFb, multitaskingState.session, 'Falsch', 'falsch');
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
  if (isPracticeRun(multitaskingState.session) && buttons[correctIdx]) buttons[correctIdx].classList.add('correct');
  if (isPracticeRun(multitaskingState.session) && !ok && buttons[index]) buttons[index].classList.add('wrong');
  const topFb = document.getElementById('multitask-top-feedback');
  if (ok) {
    multitaskingState.session.topCorrect++;
    multitaskingState.session.overall_correct++;
    setImmediateFeedback(topFb, multitaskingState.session, 'Richtig', 'richtig');
  } else {
    multitaskingState.session.topWrong++;
    setImmediateFeedback(topFb, multitaskingState.session, 'Falsch', 'falsch');
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
  const runMode = getSelectedRunMode('multitask-runmode-select');
  const totalSeconds = selectedMinutes * 60;

  multitaskingState.session = {
    runMode,
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
    setImmediateFeedback(fb, multitaskingState.session, `Falsch. Richtig war ${multitaskingState.currentTask.answer}.`, 'falsch');
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

  setImmediateFeedback(fb, multitaskingState.session, 'Richtig!', 'richtig');

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
    ...getRunModeEntryProps(multitaskingState.session.runMode),
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
  const ruleHintBtn = document.getElementById('sequence-rule-hint-btn');
  ruleHint.textContent = '';
  ruleHint.classList.add('hidden');
  if (ruleHintBtn) ruleHintBtn.disabled = !isPracticeRun(sequenceState.session);
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
  const runMode = getSelectedRunMode('sequence-runmode-select');
  const totalSeconds = selectedMinutes * 60;
  sequenceState.session = {
    runMode,
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
  startModuleTimer(sequenceState, 'sequence', finishSequenceExercise);
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
    setImmediateFeedback(fb, sequenceState.session, 'Richtig!', 'richtig');
  } else {
    sequenceState.session.wrong++;
    setImmediateFeedback(fb, sequenceState.session, `Falsch. Richtig wäre ${sequenceState.currentTask.correct}.`, 'falsch');
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
  if (!isPracticeRun(sequenceState.session)) return;
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
    ...getRunModeEntryProps(sequenceState.session.runMode),
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

