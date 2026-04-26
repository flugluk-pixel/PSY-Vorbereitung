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
    if (isPracticeRun(rotationState.session)) button.classList.add('correct');
    setImmediateFeedback(fb, rotationState.session, 'Richtig!', 'richtig');
  } else {
    rotationState.session.wrong++;
    if (isPracticeRun(rotationState.session)) button.classList.add('wrong');
    const correctBtn = allBtns.find(b => b.dataset.key === rotationState.currentTask.correctKey);
    if (isPracticeRun(rotationState.session) && correctBtn) correctBtn.classList.add('correct');
    setImmediateFeedback(fb, rotationState.session, 'Falsch. Richtige Ansicht markiert.', 'falsch');
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
  if (isPracticeRun(rotationState.session)) {
    expl.innerHTML = `<strong>Erklärung:</strong> Gesucht war dieselbe Struktur, <strong>${turnMeta.explanation}</strong>. Die Kameraperspektive bleibt dabei unverändert.`;
    expl.style.display = 'block';
    document.getElementById('rotation-next-wrap').style.display = 'block';
  }

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
  const runMode = getSelectedRunMode('rotation-runmode-select');
  const profile = ROTATION_DIFFICULTY[diffKey];
  const totalSeconds = selectedMinutes * 60;

  rotationState.session = {
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
    ...getRunModeEntryProps(rotationState.session.runMode),
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

function updateMathExerciseTimerVisibility() {
  const screen = document.getElementById('screen-math-exercise');
  if (!screen) return;
  const remainingEl = screen.querySelector('.timer-remaining');
  const progressWrap = screen.querySelector('.progress-wrap');
  const showRunningTimer = isPracticeRun(mathState.session);
  if (remainingEl) remainingEl.style.display = showRunningTimer ? '' : 'none';
  if (progressWrap) progressWrap.style.display = showRunningTimer ? '' : 'none';
}

function renderMathTask() {
  if (!mathState.session) return;
  if (mathState.advanceTimer) {
    clearTimeout(mathState.advanceTimer);
    mathState.advanceTimer = null;
  }
  if (mathState.taskTimeout) {
    clearTimeout(mathState.taskTimeout);
    mathState.taskTimeout = null;
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

  // Hidden per-task time cap: unanswered items are auto-counted as wrong after 20s.
  mathState.taskTimeout = setTimeout(() => {
    mathState.taskTimeout = null;
    submitMathAnswer({ timedOut: true });
  }, 20000);
}

function startMathExercise(mode) {
  const selectedMinutes = parseInt(document.getElementById('math-time-select').value, 10) || 5;
  const runMode = getSelectedRunMode('math-runmode-select');
  const totalSeconds = selectedMinutes * 60;
  mathState.session = {
    runMode,
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
  updateMathExerciseTimerVisibility();
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

function submitMathAnswer(options) {
  if (!mathState.session || !mathState.currentTask || mathState.currentTask.answered) return;
  const timedOut = !!(options && options.timedOut);
  const feedback = document.getElementById('math-feedback');
  let user = null;

  if (!timedOut) {
    const input = document.getElementById('math-input').value.trim().replace(',', '.');
    if (!input || !/^-?\d+$/.test(input)) {
      feedback.textContent = 'Bitte eine ganze Zahl eingeben.';
      feedback.className = 'feedback falsch';
      return;
    }
    user = parseInt(input, 10);
  }

  if (mathState.taskTimeout) {
    clearTimeout(mathState.taskTimeout);
    mathState.taskTimeout = null;
  }

  mathState.currentTask.answered = true;
  mathState.session.total++;
  const isCorrect = !timedOut && user === mathState.currentTask.answer;
  if (isCorrect) {
    mathState.session.correct++;
    setImmediateFeedback(feedback, mathState.session, 'Richtig!', 'richtig');
  } else {
    mathState.session.wrong++;
    const msg = timedOut
      ? `Zeit abgelaufen. Richtig wäre ${mathState.currentTask.answer}.`
      : `Falsch. Richtig wäre ${mathState.currentTask.answer}.`;
    setImmediateFeedback(feedback, mathState.session, msg, 'falsch');
  }

  mathState.session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'accuracy',
    reactionTimeMs: null,
    correct: isCorrect,
    omitted: timedOut,
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
    ...getRunModeEntryProps(mathState.session.runMode),
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

  const pqscanScreen = document.getElementById('screen-pqscan-exercise');
  if (pqscanScreen && !pqscanScreen.classList.contains('hidden') && pqscanState.session) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitPQScanBoard(false);
      return;
    }
  }

  const mathScreen = document.getElementById('screen-math-exercise');
  if (mathScreen && !mathScreen.classList.contains('hidden') && mathState.session) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitMathAnswer();
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

function updateSpeedExerciseVisibility() {
  const exerciseScreen = document.getElementById('screen-exercise');
  if (!exerciseScreen) return;
  const isPractice = speedState.runMode === 'practice';

  const optionsRow = exerciseScreen.querySelector('.options-row');
  const counterWrap = document.getElementById('counter-wrap');
  const remainingWrap = exerciseScreen.querySelector('.timer-remaining');
  const progressWrap = exerciseScreen.querySelector('.progress-wrap');
  const elapsedLabel = exerciseScreen.querySelector('.timer-elapsed');

  if (optionsRow) optionsRow.style.display = isPractice ? '' : 'none';
  if (counterWrap) counterWrap.style.display = isPractice ? counterWrap.style.display : 'none';
  if (remainingWrap) remainingWrap.style.display = isPractice ? '' : 'none';
  if (progressWrap) progressWrap.style.display = isPractice ? '' : 'none';
  if (elapsedLabel) elapsedLabel.innerHTML = isPractice
    ? '&#9201; Zeit: <span id="timer-elapsed"></span>'
    : 'Zeitlimit: <span id="timer-elapsed"></span>';
}

// ─── Start exercise ───────────────────────────────────────────────────────────
function startExercise() {
  // Reset state
  speedState.stats = createEmptySpeedStats();
  speedState.perMinute = createEmptySpeedMinutes();
  speedState.elapsedSeconds = 0;
  const selectedMinutes = parseInt(document.getElementById('speed-time-select').value, 10) || 20;
  speedState.runMode = getSelectedRunMode('speed-runmode-select');
  speedState.totalSeconds = selectedMinutes * 60;
  speedState.inputBlocked = false;
  speedState.consecutiveErrors = 0;
  speedState.hintActive = false;
  speedState.trials = [];

  updateSpeedExerciseVisibility();

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
  const isPractice = speedState.runMode === 'practice';
  document.getElementById('timer-elapsed').textContent = isPractice
    ? formatTime(speedState.elapsedSeconds)
    : formatTime(speedState.totalSeconds);
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
    if (speedState.runMode === 'practice' && !speedState.isFirstPair && speedState.consecutiveErrors >= HINT_AFTER_ERRORS) {
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
  if (speedState.runMode === 'practice' && document.getElementById('cbx-warnung').checked) {
    showFeedback('richtig!', 'richtig', 900);
  }
}

function handleFalsch() {
  speedState.stats.falsch++;
  speedState.perMinute[currentMinuteIndex()].falsch++;
  if (speedState.runMode === 'practice' && document.getElementById('cbx-warnung').checked) {
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
  if (speedState.runMode === 'practice' && document.getElementById('cbx-warnung').checked) {
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
  if (speedState.runMode !== 'practice') {
    document.getElementById('counter-wrap').style.display = 'none';
    return;
  }
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
    ...getRunModeEntryProps(speedState.runMode),
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
  updateExerciseTimerVisibility('screen-formen-exercise', formenState.session);
  renderFormenTask();
  formenState.timerInterval = setInterval(() => {
    if (!formenState.session) { clearFormenTimer(); return; }
    updateExerciseTimerVisibility('screen-formen-exercise', formenState.session);
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
    ...getRunModeEntryProps(s.runMode),
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
  const runMode = getSelectedRunMode('digitspan-runmode-select');
  const totalSeconds = selectedMinutes * 60;
  digitspanState.session = {
    mode,
    runMode,
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
    setImmediateFeedback(feedback, digitspanState.session, message, 'richtig');
  } else {
    digitspanState.session.wrong++;
    digitspanState.session.spanLength = Math.max(3, digitspanState.currentTask.sequence.length - 1);
    setImmediateFeedback(feedback, digitspanState.session, message, 'falsch');
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
    ...getRunModeEntryProps(digitspanState.session.runMode),
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
  const runMode = getSelectedRunMode('flanker-runmode-select');
  const profile = FLANKER_DIFFICULTY[difficultyKey];
  const totalSeconds = selectedMinutes * 60;
  flankerState.session = {
    runMode,
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
    setImmediateFeedback(feedback, flankerState.session, 'Richtig!', 'richtig');
  } else {
    flankerState.session.wrong++;
    setImmediateFeedback(feedback, flankerState.session, `Falsch. Richtig war ${flankerState.currentTask.target === 'left' ? 'links' : 'rechts'}.`, 'falsch');
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
    ...getRunModeEntryProps(flankerState.session.runMode),
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
  const runMode = getSelectedRunMode('visualsearch-runmode-select');
  const profile = VISUALSEARCH_DIFFICULTY[difficultyKey];
  const totalSeconds = selectedMinutes * 60;
  visualsearchState.session = {
    runMode,
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
    if (isPracticeRun(visualsearchState.session)) button.classList.add('correct');
    setImmediateFeedback(feedback, visualsearchState.session, 'Richtig gefunden!', 'richtig');
  } else {
    visualsearchState.session.wrong++;
    if (isPracticeRun(visualsearchState.session)) button.classList.add('wrong');
    const correctBtn = buttons[visualsearchState.currentTask.correctIndex];
    if (isPracticeRun(visualsearchState.session) && correctBtn) correctBtn.classList.add('correct');
    setImmediateFeedback(feedback, visualsearchState.session, 'Falsch. Der Zielreiz ist markiert.', 'falsch');
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
    ...getRunModeEntryProps(visualsearchState.session.runMode),
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

// ─── P/Q-SCANNER ───────────────────────────────────────────────────────────

const PQSCAN_DIFFICULTY = {
  easy: {
    label: 'Leicht',
    rows: 6,
    cols: 8,
    targetMin: 10,
    targetMax: 14,
    advanceMs: 520
  },
  medium: {
    label: 'Mittel',
    rows: 7,
    cols: 9,
    targetMin: 12,
    targetMax: 18,
    advanceMs: 460
  },
  hard: {
    label: 'Schwer',
    rows: 8,
    cols: 10,
    targetMin: 14,
    targetMax: 22,
    advanceMs: 420
  }
};

function buildPQScanTask() {
  const profile = pqscanState.session.profile;
  const target = Math.random() < 0.5 ? 'p' : 'q';
  const distractor = target === 'p' ? 'q' : 'p';
  const totalCells = profile.rows * profile.cols;
  const maxTargets = Math.min(profile.targetMax, totalCells - 4);
  const minTargets = Math.min(profile.targetMin, maxTargets);
  const targetCount = Math.max(1, minTargets + Math.floor(Math.random() * (maxTargets - minTargets + 1)));
  const cells = [];
  for (let i = 0; i < targetCount; i++) cells.push(target);
  for (let i = targetCount; i < totalCells; i++) cells.push(distractor);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = cells[i];
    cells[i] = cells[j];
    cells[j] = t;
  }
  return {
    target,
    distractor,
    rows: profile.rows,
    cols: profile.cols,
    cells,
    targetCount,
    shownAt: Date.now(),
    answered: false
  };
}

function updatePQScanBoardTimer() {
  if (!pqscanState.session || !pqscanState.currentTask || pqscanState.currentTask.answered) return;
  const elapsedMs = Math.max(0, Date.now() - pqscanState.currentTask.shownAt);
  setText('pqscan-board-remaining', (elapsedMs / 1000).toFixed(1) + ' s');
}

function updatePQScanSelectionCount() {
  const selected = document.querySelectorAll('#pqscan-grid .pqscan-cell.selected').length;
  setText('pqscan-selected-count', String(selected));
}

function renderPQScanTask() {
  if (!pqscanState.session) return;
  if (pqscanState.advanceTimer) {
    clearTimeout(pqscanState.advanceTimer);
    pqscanState.advanceTimer = null;
  }
  clearStateInterval(pqscanState, 'boardInterval');

  pqscanState.currentTask = buildPQScanTask();
  pqscanState.taskCount++;

  setTextEntries({
    'pqscan-progress': String(pqscanState.taskCount),
    'pqscan-level-label': pqscanState.session.profile.label,
    'pqscan-target-letter': pqscanState.currentTask.target.toUpperCase()
  });

  const grid = document.getElementById('pqscan-grid');
  const submitBtn = document.querySelector('#screen-pqscan-exercise button[data-action="submitPQScanBoard"]');
  grid.style.gridTemplateColumns = `repeat(${pqscanState.currentTask.cols}, minmax(0, 1fr))`;
  grid.innerHTML = '';
  pqscanState.currentTask.cells.forEach((cell, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pqscan-cell';
    btn.textContent = cell;
    btn.dataset.idx = String(index);
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', function() {
      if (!pqscanState.currentTask || pqscanState.currentTask.answered) return;
      const active = btn.classList.toggle('selected');
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      updatePQScanSelectionCount();
    });
    grid.appendChild(btn);
  });

  if (submitBtn) submitBtn.disabled = false;
  setText('pqscan-selected-count', '0');
  setText('pqscan-feedback', '');
  document.getElementById('pqscan-feedback').className = 'feedback';
  setText('pqscan-board-remaining', '0.0 s');
  updatePQScanBoardTimer();
  pqscanState.boardInterval = setInterval(updatePQScanBoardTimer, 100);
}

function startPQScanExercise() {
  const selectedMinutes = parseInt(document.getElementById('pqscan-time-select').value, 10) || 5;
  const difficultyKeyRaw = document.getElementById('pqscan-difficulty-select').value;
  const difficultyKey = Object.prototype.hasOwnProperty.call(PQSCAN_DIFFICULTY, difficultyKeyRaw) ? difficultyKeyRaw : 'medium';
  const runMode = getSelectedRunMode('pqscan-runmode-select');
  const profile = PQSCAN_DIFFICULTY[difficultyKey];
  const totalSeconds = selectedMinutes * 60;

  pqscanState.session = {
    runMode,
    difficulty: difficultyKey,
    profile,
    startedAt: Date.now(),
    totalSeconds,
    remainingSeconds: totalSeconds,
    correct: 0,
    wrong: 0,
    total: 0,
    symbolCorrect: 0,
    symbolFalse: 0,
    symbolMiss: 0,
    rtSum: 0,
    rtCount: 0,
    trials: []
  };

  pqscanState.taskCount = 0;
  showScreen('screen-pqscan-exercise');
  clearPQScanTimer();
  updateModuleTimer('pqscan', pqscanState.session);
  setText('pqscan-level-label', profile.label);

  pqscanState.timerInterval = setInterval(function() {
    if (!pqscanState.session) return;
    pqscanState.session.remainingSeconds--;
    if (pqscanState.session.remainingSeconds < 0) pqscanState.session.remainingSeconds = 0;
    updateModuleTimer('pqscan', pqscanState.session);
    if (pqscanState.session.remainingSeconds <= 0) {
      if (pqscanState.currentTask && !pqscanState.currentTask.answered) {
        submitPQScanBoard(true, true);
      } else {
        finishPQScanExercise(true);
      }
    }
  }, 1000);

  renderPQScanTask();
}

function submitPQScanBoard(timedOut, finishAfterSubmission) {
  if (!pqscanState.session || !pqscanState.currentTask || pqscanState.currentTask.answered) return;
  pqscanState.currentTask.answered = true;
  clearStateInterval(pqscanState, 'boardInterval');
  const submitBtn = document.querySelector('#screen-pqscan-exercise button[data-action="submitPQScanBoard"]');
  if (submitBtn) submitBtn.disabled = true;

  const now = Date.now();
  const pageDurationMs = Math.max(0, now - pqscanState.currentTask.shownAt);
  const buttons = Array.from(document.querySelectorAll('#pqscan-grid .pqscan-cell'));
  const selectedButtons = buttons.filter(function(btn) { return btn.classList.contains('selected'); });
  setText('pqscan-selected-count', String(selectedButtons.length));
  const selectedIdx = new Set(selectedButtons.map(function(btn) { return Number(btn.dataset.idx); }));

  let correctHits = 0;
  let falseHits = 0;

  buttons.forEach(function(btn, idx) {
    const isTarget = pqscanState.currentTask.cells[idx] === pqscanState.currentTask.target;
    const isSelected = selectedIdx.has(idx);
    if (isSelected && isTarget) {
      correctHits++;
      btn.classList.add('correct');
    } else if (isSelected && !isTarget) {
      falseHits++;
      btn.classList.add('wrong');
    }
    btn.disabled = true;
  });

  const misses = Math.max(0, pqscanState.currentTask.targetCount - correctHits);
  const pageErrors = falseHits + misses;
  const errorRatio = pageErrors / Math.max(1, pqscanState.currentTask.targetCount);
  const pageCorrect = errorRatio <= 0.10;
  const pageOmitted = selectedButtons.length === 0;

  pqscanState.session.correct += pageCorrect ? 1 : 0;
  pqscanState.session.wrong += pageCorrect ? 0 : 1;
  pqscanState.session.total += 1;
  pqscanState.session.symbolCorrect += correctHits;
  pqscanState.session.symbolFalse += falseHits;
  pqscanState.session.symbolMiss += misses;
  pqscanState.session.rtSum += pageDurationMs;
  pqscanState.session.rtCount += 1;

  pqscanState.session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'reaction',
    reactionTimeMs: pageDurationMs,
    correct: pageCorrect,
    omitted: pageOmitted,
    anticipated: pageDurationMs < 300,
    difficultyLevel: pqscanState.currentTask.rows * pqscanState.currentTask.cols,
    sequenceLength: null,
    mode: pqscanState.session.difficulty,
    blockLabel: pqscanState.currentTask.target + ':' + pqscanState.currentTask.targetCount
  });

  const feedbackText = timedOut
    ? `Zeit abgelaufen. Seite ${pageCorrect ? 'sauber' : 'mit Fehlern'}: Treffer ${correctHits}, Fehlklicks ${falseHits}, verpasst ${misses}.`
    : `Seite ${pageCorrect ? 'sauber' : 'mit Fehlern'}: Treffer ${correctHits}, Fehlklicks ${falseHits}, verpasst ${misses}.`;
  setImmediateFeedback('pqscan-feedback', pqscanState.session, feedbackText, pageCorrect ? 'richtig' : 'falsch');

  if (finishAfterSubmission) {
    finishPQScanExercise(true);
    return;
  }

  const delay = isPracticeRun(pqscanState.session) ? pqscanState.session.profile.advanceMs : 180;
  pqscanState.advanceTimer = setTimeout(function() {
    pqscanState.advanceTimer = null;
    if (!pqscanState.session || pqscanState.session.remainingSeconds <= 0) {
      finishPQScanExercise(true);
      return;
    }
    renderPQScanTask();
  }, delay);
}

function finishPQScanExercise(timedOut) {
  if (pqscanState.session && pqscanState.currentTask && !pqscanState.currentTask.answered) {
    submitPQScanBoard(!!timedOut, true);
    return;
  }

  clearPQScanTimer();
  if (!pqscanState.session) {
    showScreen('screen-pqscan-results');
    return;
  }

  const pagePct = getAccuracyPercent(pqscanState.session.correct, pqscanState.session.total);
  const symbolTotal = pqscanState.session.symbolCorrect + pqscanState.session.symbolFalse + pqscanState.session.symbolMiss;
  const symbolPct = getAccuracyPercent(pqscanState.session.symbolCorrect, symbolTotal);
  const elapsed = getElapsedSeconds(pqscanState.session.startedAt, pqscanState.session.totalSeconds, timedOut);
  const avgRt = pqscanState.session.rtCount > 0 ? Math.round(pqscanState.session.rtSum / pqscanState.session.rtCount) : null;
  const minutes = elapsed > 0 ? elapsed / 60 : 0;
  const throughput = minutes > 0 ? (pqscanState.session.total / minutes) : 0;

  setTextEntries({
    'pqscan-result-percent': `${symbolPct}%`,
    'pqscan-result-rt': avgRt === null ? '-' : `${avgRt} ms`,
    'pqscan-result-throughput': `${throughput.toFixed(1)} Seiten/Min`,
    'pqscan-result-difficulty': pqscanState.session.profile.label,
    'pqscan-result-limit': formatTime(pqscanState.session.totalSeconds),
    'pqscan-result-correct': String(pqscanState.session.correct),
    'pqscan-result-wrong': String(pqscanState.session.wrong),
    'pqscan-result-total': String(pqscanState.session.total),
    'pqscan-result-symbol-correct': String(pqscanState.session.symbolCorrect),
    'pqscan-result-symbol-false': String(pqscanState.session.symbolFalse),
    'pqscan-result-symbol-miss': String(pqscanState.session.symbolMiss),
    'pqscan-result-duration': formatTime(elapsed)
  });

  setResultInsight('pqscan-result-insight', 'pqscan', symbolPct, { avgRt });
  saveTrainingEntry({
    module: 'pqscan',
    label: 'P/Q-Scanner',
    ...getRunModeEntryProps(pqscanState.session.runMode),
    difficulty: pqscanState.session.difficulty,
    avgRt,
    throughput,
    pageAccuracy: pagePct,
    pageTotal: pqscanState.session.total,
    pageCorrect: pqscanState.session.correct,
    pageWrong: pqscanState.session.wrong,
    symbolCorrect: pqscanState.session.symbolCorrect,
    symbolFalse: pqscanState.session.symbolFalse,
    symbolMiss: pqscanState.session.symbolMiss,
    trials: pqscanState.session.trials,
    correct: pqscanState.session.symbolCorrect,
    wrong: pqscanState.session.symbolFalse + pqscanState.session.symbolMiss,
    total: symbolTotal,
    accuracy: symbolPct,
    duration: elapsed,
    totalSeconds: pqscanState.session.totalSeconds
  });
  showScreen('screen-pqscan-results');
}

function restartPQScanMode() {
  startPQScanExercise();
}

// ─── Wortanalogien (Verbales Schlussfolgern) ─────────────────────────────────

const WORTANALOGIEN_HISTORY_KEY = 'psy_wortanalogien_history';
const WORTANALOGIEN_RELATION_ORDER = [
  'synonym',
  'antonym',
  'teil_ganzes',
  'funktion',
  'ursache_wirkung',
  'kategorie',
  'abstrakt'
];

const WORTANALOGIEN_RELATION_LABELS = {
  synonym: 'Synonym',
  antonym: 'Antonym',
  teil_ganzes: 'Teil-Ganzes',
  funktion: 'Funktion',
  ursache_wirkung: 'Ursache-Wirkung',
  kategorie: 'Kategorie',
  abstrakt: 'Abstrakte Relation'
};

const WORTANALOGIEN_MEMORY_WORDS = [
  'Kompass', 'Resonanz', 'Atlas', 'Signal', 'Muster', 'Axiom', 'Brücke', 'Magnet',
  'Kontrast', 'Taktik', 'Vektor', 'Horizont', 'Schema', 'Formel', 'Leitbild', 'Matrix'
];

const WORTANALOGIEN_ITEM_BANK = {
  synonym: {
    1: [
      { a: 'schnell', b: 'rasch', c: 'klug', correct: 'intelligent', partial: 'gebildet', wrong: ['laut', 'müde'], explanation: 'Die Beziehung ist Bedeutungsnähe. Wie schnell und rasch nahezu gleich sind, passen klug und intelligent zusammen.' },
      { a: 'ruhig', b: 'still', c: 'froh', correct: 'heiter', partial: 'freundlich', wrong: ['schmal', 'hart'], explanation: 'Beide Paare bestehen aus sinngleichen Begriffen. Froh entspricht hier am treffendsten heiter.' },
      { a: 'mutig', b: 'tapfer', c: 'traurig', correct: 'betrübt', partial: 'niedergeschlagen', wrong: ['kalt', 'eng'], explanation: 'Die Relation ist Bedeutungsgleichheit. Mutig und tapfer bedeuten dasselbe, ebenso traurig und betrübt.' },
      { a: 'klug', b: 'weise', c: 'seltsam', correct: 'merkwürdig', partial: 'eigenartig', wrong: ['laut', 'hart'], explanation: 'Wie klug und weise sinngleich sind, sind seltsam und merkwürdig bedeutungsnah.' }
    ],
    2: [
      { a: 'sorgfältig', b: 'gewissenhaft', c: 'deutlich', correct: 'klar', partial: 'präzise', wrong: ['kurz', 'nass'], explanation: 'Die Beziehung bleibt synonym. Deutlich wird im alltäglichen Sprachgebrauch am direktesten durch klar gespiegelt.' },
      { a: 'bequem', b: 'komfortabel', c: 'wertvoll', correct: 'kostbar', partial: 'teuer', wrong: ['früh', 'weich'], explanation: 'Bequem und komfortabel sind bedeutungsgleich. Entsprechend bilden wertvoll und kostbar die engste Parallele.' },
      { a: 'genau', b: 'akkurat', c: 'selten', correct: 'rar', partial: 'ungewöhnlich', wrong: ['viel', 'nah'], explanation: 'Genau und akkurat sind bedeutungsgleich. Rar ist das engste Synonym zu selten.' },
      { a: 'wichtig', b: 'bedeutsam', c: 'schwierig', correct: 'anspruchsvoll', partial: 'mühsam', wrong: ['lang', 'frisch'], explanation: 'Die Relation bleibt synonym. Anspruchsvoll entspricht schwierig in der engsten Bedeutung.' }
    ],
    3: [
      { a: 'vage', b: 'unkonkret', c: 'präzise', correct: 'exakt', partial: 'genau', wrong: ['lärmend', 'nahe'], explanation: 'Die Analogie koppelt gleichwertige Begriffe. Präzise und exakt bilden hier das engste Synonympaar.' },
      { a: 'fragil', b: 'verletzlich', c: 'robust', correct: 'widerstandsfähig', partial: 'stabil', wrong: ['eng', 'fern'], explanation: 'Fragil und verletzlich sind bedeutungsnah. Robust entspricht deshalb am besten widerstandsfähig.' },
      { a: 'trügerisch', b: 'irreführend', c: 'hartnäckig', correct: 'beharrlich', partial: 'ausdauernd', wrong: ['schnell', 'kühl'], explanation: 'Trügerisch und irreführend sind Synonyme. Beharrlich ist das treffendste Synonym zu hartnäckig.' },
      { a: 'sparsam', b: 'haushälterisch', c: 'großzügig', correct: 'freigebig', partial: 'verschwenderisch', wrong: ['arm', 'karg'], explanation: 'Die Paare sind jeweils bedeutungsgleich. Freigebig entspricht großzügig am engsten.' }
    ],
    4: [
      { a: 'ubiquitär', b: 'allgegenwärtig', c: 'ephemeral', correct: 'flüchtig', partial: 'kurzlebig', wrong: ['still', 'hart'], explanation: 'Wie ubiquitär und allgegenwärtig semantisch deckungsgleich sind, entspricht ephemeral am direktesten flüchtig.' },
      { a: 'konsistent', b: 'widerspruchsfrei', c: 'ambivalent', correct: 'zwiespältig', partial: 'unsicher', wrong: ['fleißig', 'eng'], explanation: 'Die Relation bleibt synonym auf abstraktem Niveau. Ambivalent wird sprachlogisch am klarsten mit zwiespältig gespiegelt.' },
      { a: 'kongruent', b: 'deckungsgleich', c: 'divergent', correct: 'auseinanderlaufend', partial: 'abweichend', wrong: ['klar', 'streng'], explanation: 'Kongruent und deckungsgleich sind identisch. Divergent entspricht am genausten auseinanderlaufend.' },
      { a: 'redundant', b: 'überflüssig', c: 'elementar', correct: 'grundlegend', partial: 'wesentlich', wrong: ['gering', 'nebensächlich'], explanation: 'Redundant und überflüssig sind bedeutungsgleich. Grundlegend ist das engste Synonym zu elementar.' }
    ]
  },
  antonym: {
    1: [
      { a: 'hell', b: 'dunkel', c: 'warm', correct: 'kalt', partial: 'kühl', wrong: ['laut', 'langsam'], explanation: 'Die Beziehung ist ein Gegenbegriff. Zu warm gehört als direktes Antonym kalt.' },
      { a: 'groß', b: 'klein', c: 'hoch', correct: 'niedrig', partial: 'flach', wrong: ['weich', 'offen'], explanation: 'Wie groß das Gegenteil von klein ist, ist hoch das Gegenteil von niedrig.' },
      { a: 'laut', b: 'leise', c: 'nass', correct: 'trocken', partial: 'feucht', wrong: ['eng', 'lang'], explanation: 'Die Beziehung ist Gegensatz. Zu nass gehört als direktes Antonym trocken.' },
      { a: 'alt', b: 'jung', c: 'lang', correct: 'kurz', partial: 'knapp', wrong: ['rund', 'hoch'], explanation: 'Wie alt das Gegenteil von jung ist, ist lang das Gegenteil von kurz.' }
    ],
    2: [
      { a: 'früh', b: 'spät', c: 'nah', correct: 'fern', partial: 'weit', wrong: ['hell', 'eng'], explanation: 'Die Struktur verlangt den gegensätzlichen Begriff. Nah steht in der Analogie zu fern.' },
      { a: 'aktiv', b: 'passiv', c: 'geordnet', correct: 'chaotisch', partial: 'unruhig', wrong: ['hell', 'teuer'], explanation: 'Aktiv und passiv sind Gegensätze. Entsprechend wird geordnet mit chaotisch kontrastiert.' },
      { a: 'mutig', b: 'feige', c: 'ehrlich', correct: 'unehrlich', partial: 'lügnerisch', wrong: ['stark', 'laut'], explanation: 'Die Struktur verlangt den Gegenbegriff. Unehrlich ist das direkte Antonym zu ehrlich.' },
      { a: 'komplex', b: 'einfach', c: 'flexibel', correct: 'starr', partial: 'unbeweglich', wrong: ['leise', 'nah'], explanation: 'Wie komplex und einfach Gegensätze sind, stehen flexibel und starr als Gegenpaar.' }
    ],
    3: [
      { a: 'konkret', b: 'abstrakt', c: 'stabil', correct: 'instabil', partial: 'fragil', wrong: ['laut', 'neutral'], explanation: 'Die Paare spiegeln einen klaren Gegensatz. Stabil wird in diesem Muster am genausten durch instabil ergänzt.' },
      { a: 'offensiv', b: 'defensiv', c: 'expansiv', correct: 'restriktiv', partial: 'begrenzt', wrong: ['froh', 'scharf'], explanation: 'Wie offensiv und defensiv Gegensätze sind, kontrastieren expansiv und restriktiv.' },
      { a: 'linear', b: 'nichtlinear', c: 'homogen', correct: 'heterogen', partial: 'gemischt', wrong: ['rund', 'kurz'], explanation: 'Die Paare spiegeln einen klaren Gegensatz. Homogen wird in diesem Muster durch heterogen kontrastiert.' },
      { a: 'symmetrisch', b: 'asymmetrisch', c: 'kohärent', correct: 'inkohärent', partial: 'widersprüchlich', wrong: ['eng', 'laut'], explanation: 'Wie symmetrisch und asymmetrisch Gegensätze sind, sind kohärent und inkohärent ein Gegenpaar.' }
    ],
    4: [
      { a: 'deterministisch', b: 'zufällig', c: 'transparent', correct: 'opak', partial: 'undurchsichtig', wrong: ['schnell', 'klar'], explanation: 'Die Relation ist Gegensinn auf abstrakter Ebene. Transparent wird in diesem Kontext mit opak gespiegelt.' },
      { a: 'immanent', b: 'transzendent', c: 'explizit', correct: 'implizit', partial: 'verdeckt', wrong: ['langsam', 'eng'], explanation: 'Wie immanent und transzendent gegensätzlich sind, stehen explizit und implizit als Gegenpaar.' },
      { a: 'konstruktiv', b: 'destruktiv', c: 'induktiv', correct: 'deduktiv', partial: 'ableitend', wrong: ['leise', 'klar'], explanation: 'Die Relation ist Gegensinn auf abstrakter Ebene. Deduktiv ist das Gegenstück zu induktiv.' },
      { a: 'konvex', b: 'konkav', c: 'positiv', correct: 'negativ', partial: 'gegenteilig', wrong: ['lang', 'schwer'], explanation: 'Konvex und konkav sind geometrische Gegensätze. Positiv und negativ bilden das analoge Gegenpaar.' }
    ]
  },
  teil_ganzes: {
    1: [
      { a: 'Rad', b: 'Fahrrad', c: 'Seite', correct: 'Buch', partial: 'Heft', wrong: ['Tisch', 'Lampe'], explanation: 'Die erste Komponente ist ein Teil des zweiten Begriffs. Eine Seite ist Teil eines Buchs.' },
      { a: 'Finger', b: 'Hand', c: 'Blatt', correct: 'Baum', partial: 'Zweig', wrong: ['Wolke', 'Stein'], explanation: 'Teil zu Ganzem: Finger gehört zur Hand, Blatt gehört zum Baum.' },
      { a: 'Flügel', b: 'Vogel', c: 'Flosse', correct: 'Fisch', partial: 'Hai', wrong: ['Welle', 'Wasser'], explanation: 'Die erste Komponente ist Teil des zweiten Begriffs. Eine Flosse ist Teil eines Fischs.' },
      { a: 'Scheibe', b: 'Auto', c: 'Luke', correct: 'Schiff', partial: 'Boot', wrong: ['Motor', 'Welle'], explanation: 'Teil-Ganzes: Eine Scheibe ist Teil eines Autos, eine Luke ist Teil eines Schiffs.' }
    ],
    2: [
      { a: 'Kapitel', b: 'Roman', c: 'Artikel', correct: 'Zeitung', partial: 'Magazin', wrong: ['Fenster', 'Motor'], explanation: 'Kapitel ist Bestandteil eines Romans. Analog ist ein Artikel Bestandteil einer Zeitung.' },
      { a: 'Taste', b: 'Klavier', c: 'Pedal', correct: 'Fahrrad', partial: 'Auto', wrong: ['Schirm', 'Kissen'], explanation: 'Taste und Klavier stehen in Teil-Ganzes-Beziehung. Pedal ist entsprechend Teil eines Fahrrads.' },
      { a: 'Zeiger', b: 'Uhr', c: 'Antenne', correct: 'Radio', partial: 'Sender', wrong: ['Strom', 'Wand'], explanation: 'Zeiger ist Bestandteil einer Uhr. Analog ist eine Antenne Bestandteil eines Radios.' },
      { a: 'Linse', b: 'Auge', c: 'Klappe', correct: 'Herz', partial: 'Lunge', wrong: ['Nerv', 'Haut'], explanation: 'Linse ist Teil des Auges. Entsprechend ist die Klappe Teil des Herzens.' }
    ],
    3: [
      { a: 'Neuron', b: 'Gehirn', c: 'Alveole', correct: 'Lunge', partial: 'Bronchie', wrong: ['Leber', 'Sehne'], explanation: 'Neuron ist Teil des Gehirns. Gleichartig ist Alveole als Teil der Lunge.' },
      { a: 'Paragraph', b: 'Gesetz', c: 'Klausel', correct: 'Vertrag', partial: 'Abkommen', wrong: ['Gericht', 'Zeuge'], explanation: 'Paragraph gehört zu einem Gesetz. Entsprechend ist Klausel Teil eines Vertrags.' },
      { a: 'Isotop', b: 'Element', c: 'Allel', correct: 'Gen', partial: 'Chromosom', wrong: ['Zelle', 'Kern'], explanation: 'Isotop ist Bestandteil eines Elements. Gleichartig ist ein Allel Teil eines Gens.' },
      { a: 'Takt', b: 'Melodie', c: 'Strophe', correct: 'Lied', partial: 'Gedicht', wrong: ['Chor', 'Bühne'], explanation: 'Teil-Ganzes: Ein Takt ist Bestandteil einer Melodie, eine Strophe ist Bestandteil eines Lieds.' }
    ],
    4: [
      { a: 'Morphem', b: 'Lexem', c: 'Phonem', correct: 'Silbe', partial: 'Wort', wrong: ['Satzbau', 'Text'], explanation: 'Die Relation folgt Teil zu sprachlicher Einheit. Ein Phonem ist Bestandteil einer Silbe.' },
      { a: 'Subroutine', b: 'Programm', c: 'Thread', correct: 'Prozess', partial: 'Anwendung', wrong: ['Kernel', 'Datei'], explanation: 'Subroutine ist Teil eines Programms. Entsprechend ist ein Thread Teil eines Prozesses.' },
      { a: 'Exponent', b: 'Term', c: 'Prädikat', correct: 'Satz', partial: 'Aussage', wrong: ['Norm', 'Feld'], explanation: 'Ein Exponent ist Bestandteil eines Terms. Analog ist ein Prädikat Teil eines Satzes.' },
      { a: 'Transistor', b: 'Schaltkreis', c: 'Pixel', correct: 'Bildschirm', partial: 'Anzeige', wrong: ['Signal', 'Datei'], explanation: 'Teil-Ganzes: Transistor ist Bestandteil eines Schaltkreises, Pixel ist Bestandteil eines Bildschirms.' }
    ]
  },
  funktion: {
    1: [
      { a: 'Schlüssel', b: 'aufschließen', c: 'Schere', correct: 'schneiden', partial: 'zuschneiden', wrong: ['rollen', 'wiegen'], explanation: 'Im ersten Paar beschreibt B die Hauptfunktion von A. Die Schere dient entsprechend dem Schneiden.' },
      { a: 'Besen', b: 'kehren', c: 'Topf', correct: 'kochen', partial: 'braten', wrong: ['fliegen', 'singen'], explanation: 'B nennt die typische Nutzung von A. Ein Topf wird primär zum Kochen verwendet.' },
      { a: 'Messer', b: 'schneiden', c: 'Pinsel', correct: 'malen', partial: 'streichen', wrong: ['bauen', 'graben'], explanation: 'Im ersten Paar beschreibt B die Hauptfunktion von A. Der Pinsel dient entsprechend dem Malen.' },
      { a: 'Brille', b: 'sehen', c: 'Helm', correct: 'schützen', partial: 'sichern', wrong: ['hören', 'riechen'], explanation: 'Brille und sehen: Objekt und Funktion. Ein Helm dient primär dem Schutz.' }
    ],
    2: [
      { a: 'Kompass', b: 'navigieren', c: 'Thermometer', correct: 'messen', partial: 'prüfen', wrong: ['tragen', 'lagern'], explanation: 'Die Analogie verbindet Objekt und Kernfunktion. Ein Thermometer dient dem Messen.' },
      { a: 'Filter', b: 'reinigen', c: 'Archiv', correct: 'speichern', partial: 'ordnen', wrong: ['bewegen', 'falten'], explanation: 'Wie ein Filter zum Reinigen dient, dient ein Archiv dem Speichern.' },
      { a: 'Pumpe', b: 'fördern', c: 'Ventil', correct: 'regeln', partial: 'begrenzen', wrong: ['erzeugen', 'messen'], explanation: 'Die Analogie verbindet Objekt und Kernfunktion. Ein Ventil dient dem Regeln von Durchfluss.' },
      { a: 'Leuchtturm', b: 'warnen', c: 'Deich', correct: 'schützen', partial: 'abgrenzen', wrong: ['beleuchten', 'leiten'], explanation: 'Wie ein Leuchtturm zum Warnen dient, dient ein Deich dem Schutz.' }
    ],
    3: [
      { a: 'Katalysator', b: 'beschleunigen', c: 'Puffer', correct: 'stabilisieren', partial: 'abmildern', wrong: ['verdoppeln', 'teilen'], explanation: 'Die Funktion ist ein Wirkprinzip. Ein Puffer hat als zentrale Funktion das Stabilisieren.' },
      { a: 'Moderator', b: 'steuern', c: 'Mediator', correct: 'vermitteln', partial: 'schlichten', wrong: ['dominieren', 'verhindern'], explanation: 'Die Begriffe sind über ihre Hauptaufgabe verknüpft. Ein Mediator vermittelt zwischen Positionen.' },
      { a: 'Enzym', b: 'katalysieren', c: 'Antikörper', correct: 'neutralisieren', partial: 'markieren', wrong: ['transportieren', 'synthetisieren'], explanation: 'Die Funktion ist ein biochemisches Wirkprinzip. Ein Antikörper neutralisiert Fremdkörper.' },
      { a: 'Index', b: 'verweisen', c: 'Glossar', correct: 'erklären', partial: 'definieren', wrong: ['gliedern', 'zitieren'], explanation: 'Wie ein Index auf Fundstellen verweist, dient ein Glossar dem Erklären von Begriffen.' }
    ],
    4: [
      { a: 'Heuristik', b: 'vereinfachen', c: 'Axiom', correct: 'begründen', partial: 'ableiten', wrong: ['verzerren', 'verkleinern'], explanation: 'Die Beziehung benennt die Funktion im Denkprozess. Ein Axiom dient als begründende Ausgangsbasis.' },
      { a: 'Paradigma', b: 'rahmen', c: 'Hypothese', correct: 'erklären', partial: 'prognostizieren', wrong: ['vertagen', 'korrigieren'], explanation: 'Paradigma rahmt Erkenntnis. Entsprechend wird eine Hypothese zur Erklärung und Prüfung genutzt.' },
      { a: 'Metaanalyse', b: 'aggregieren', c: 'Simulation', correct: 'modellieren', partial: 'approximieren', wrong: ['verifizieren', 'segmentieren'], explanation: 'Die Beziehung benennt die analytische Hauptfunktion. Eine Simulation dient dem Modellieren.' },
      { a: 'Kalibrierung', b: 'justieren', c: 'Normierung', correct: 'standardisieren', partial: 'vergleichbar machen', wrong: ['erzeugen', 'beschleunigen'], explanation: 'Beziehung Objekt–Funktion auf methodischem Niveau. Normierung dient dem Standardisieren.' }
    ]
  },
  ursache_wirkung: {
    1: [
      { a: 'Regen', b: 'Pfütze', c: 'Hitze', correct: 'Schweiß', partial: 'Durst', wrong: ['Mantel', 'Schatten'], explanation: 'A führt typischerweise zu B. Hitze führt analog zu Schweiß.' },
      { a: 'Lernen', b: 'Wissen', c: 'Training', correct: 'Fortschritt', partial: 'Routine', wrong: ['Pause', 'Chaos'], explanation: 'Die Beziehung ist Ursache zu Wirkung. Training erzeugt im Regelfall Fortschritt.' },
      { a: 'Schlaf', b: 'Erholung', c: 'Sport', correct: 'Fitness', partial: 'Ausdauer', wrong: ['Hunger', 'Kälte'], explanation: 'A führt typischerweise zu B. Sport führt analog zu Fitness.' },
      { a: 'Fehler', b: 'Korrektur', c: 'Frage', correct: 'Antwort', partial: 'Erklärung', wrong: ['Schweigen', 'Ablenkung'], explanation: 'Die Beziehung ist Ursache–Wirkung. Eine Frage erzeugt im Regelfall eine Antwort.' }
    ],
    2: [
      { a: 'Stress', b: 'Erschöpfung', c: 'Lärm', correct: 'Ablenkung', partial: 'Unruhe', wrong: ['Gehalt', 'Vorfreude'], explanation: 'Stress verursacht oft Erschöpfung. Entsprechend verursacht Lärm häufig Ablenkung.' },
      { a: 'Mangel', b: 'Defizit', c: 'Überschuss', correct: 'Sattheit', partial: 'Fülle', wrong: ['Leere', 'Stillstand'], explanation: 'Mangel hat Defizit als Folge. Beim Überschuss ist die passende Wirkung hier Sattheit.' },
      { a: 'Kritik', b: 'Verbesserung', c: 'Konkurrenz', correct: 'Innovation', partial: 'Anpassung', wrong: ['Stillstand', 'Rückzug'], explanation: 'Kritik führt typischerweise zu Verbesserung. Konkurrenz erzeugt entsprechend oft Innovation.' },
      { a: 'Isolation', b: 'Einsamkeit', c: 'Vernetzung', correct: 'Austausch', partial: 'Kommunikation', wrong: ['Abstand', 'Trennung'], explanation: 'Isolation führt zu Einsamkeit. Umgekehrt führt Vernetzung zu Austausch.' }
    ],
    3: [
      { a: 'Inflation', b: 'Kaufkraftverlust', c: 'Innovation', correct: 'Produktivitätsgewinn', partial: 'Veränderung', wrong: ['Stagnation', 'Stillstand'], explanation: 'Die Struktur bildet Ursache und typische Folge ab. Innovation wirkt sich meist als Produktivitätsgewinn aus.' },
      { a: 'Fehlinterpretation', b: 'Missverständnis', c: 'Präzisierung', correct: 'Klarheit', partial: 'Ordnung', wrong: ['Verwirrung', 'Verzug'], explanation: 'Wie Fehlinterpretation zu Missverständnis führt, führt Präzisierung zu Klarheit.' },
      { a: 'Überregulierung', b: 'Innovationshemmung', c: 'Transparenz', correct: 'Vertrauen', partial: 'Akzeptanz', wrong: ['Bürokratie', 'Komplexität'], explanation: 'Überregulierung hemmt Innovation. Transparenz hingegen führt zu Vertrauen.' },
      { a: 'Selektion', b: 'Anpassung', c: 'Mutation', correct: 'Variation', partial: 'Diversität', wrong: ['Regression', 'Stillstand'], explanation: 'Die Struktur bildet Ursache und typische biologische Folge ab. Mutation erzeugt Variation.' }
    ],
    4: [
      { a: 'Polarisierung', b: 'Fragmentierung', c: 'Koordination', correct: 'Kohärenz', partial: 'Einigkeit', wrong: ['Spaltung', 'Anarchie'], explanation: 'Polarisierung erzeugt Fragmentierung. Umgekehrt führt Koordination am ehesten zu Kohärenz.' },
      { a: 'Ambiguität', b: 'Interpretationskonflikt', c: 'Operationalisierung', correct: 'Messbarkeit', partial: 'Vergleichbarkeit', wrong: ['Beliebigkeit', 'Komplexität'], explanation: 'Ambiguität erzeugt Konflikt in der Deutung. Operationalisierung erzeugt dagegen Messbarkeit.' },
      { a: 'Pfadabhängigkeit', b: 'Strukturkonservierung', c: 'Disruption', correct: 'Paradigmenwechsel', partial: 'Neuausrichtung', wrong: ['Gleichgewicht', 'Standardisierung'], explanation: 'Pfadabhängigkeit konserviert Strukturen. Disruption führt dagegen zu einem Paradigmenwechsel.' },
      { a: 'kognitive Dissonanz', b: 'Einstellungsänderung', c: 'Resonanz', correct: 'Verstärkung', partial: 'Bestätigung', wrong: ['Neutralisierung', 'Abbau'], explanation: 'Kognitive Dissonanz erzeugt Einstellungsänderung. Resonanz führt analog zu Verstärkung.' }
    ]
  },
  kategorie: {
    1: [
      { a: 'Rose', b: 'Blume', c: 'Lachs', correct: 'Fisch', partial: 'Meerestier', wrong: ['Wasser', 'Netz'], explanation: 'A ist ein Beispiel für die Kategorie B. Lachs ist entsprechend ein Beispiel für Fisch.' },
      { a: 'Tisch', b: 'Möbel', c: 'Pullover', correct: 'Kleidung', partial: 'Textil', wrong: ['Winter', 'Schrank'], explanation: 'Die Beziehung ist Unterbegriff zu Oberbegriff. Pullover gehört zur Kategorie Kleidung.' },
      { a: 'Hamster', b: 'Tier', c: 'Gitarre', correct: 'Instrument', partial: 'Musikgerät', wrong: ['Lied', 'Bühne'], explanation: 'A ist ein Beispiel für die Kategorie B. Eine Gitarre ist ein Instrument.' },
      { a: 'Apfel', b: 'Obst', c: 'Karotte', correct: 'Gemüse', partial: 'Nahrung', wrong: ['Garten', 'Ernte'], explanation: 'Wie Apfel eine Obstart ist, ist Karotte eine Gemüseart.' }
    ],
    2: [
      { a: 'Roman', b: 'Literatur', c: 'Sinfonie', correct: 'Musik', partial: 'Kunst', wrong: ['Orchester', 'Probe'], explanation: 'Roman ist eine Form von Literatur. Sinfonie ist analog eine Form von Musik.' },
      { a: 'Birke', b: 'Baum', c: 'Smaragd', correct: 'Edelstein', partial: 'Mineral', wrong: ['Grün', 'Ring'], explanation: 'Wie Birke ein Baum ist, ist Smaragd ein Edelstein.' },
      { a: 'Quadrat', b: 'Vieleck', c: 'Ellipse', correct: 'Kurve', partial: 'Figur', wrong: ['Fläche', 'Muster'], explanation: 'Ein Quadrat ist ein Vieleck. Analog ist eine Ellipse eine geometrische Kurve.' },
      { a: 'Marsch', b: 'Musikstück', c: 'Ballade', correct: 'Gedicht', partial: 'Literatur', wrong: ['Chor', 'Rhythmus'], explanation: 'Ein Marsch ist ein Musikstück. Entsprechend ist eine Ballade ein Gedicht.' }
    ],
    3: [
      { a: 'Hypothese', b: 'Aussage', c: 'Algorithmus', correct: 'Verfahren', partial: 'Methode', wrong: ['Computer', 'Code'], explanation: 'Hypothese ordnet sich als spezielle Aussage ein. Analog ist Algorithmus ein spezielles Verfahren.' },
      { a: 'Sonett', b: 'Gedicht', c: 'Etüde', correct: 'Komposition', partial: 'Musikstück', wrong: ['Klavier', 'Rhythmus'], explanation: 'Sonett ist eine spezifische Form von Gedicht. Etüde ist eine spezifische Form von Komposition.' },
      { a: 'Regressionsgerade', b: 'statistische Methode', c: 'Konfidenzintervall', correct: 'Schätzverfahren', partial: 'Kennwert', wrong: ['Variable', 'Stichprobe'], explanation: 'Regressionsgerade ordnet sich als statistische Methode ein. Analog ist ein Konfidenzintervall ein Schätzverfahren.' },
      { a: 'Dialekt', b: 'Sprachvarietät', c: 'Pidgin', correct: 'Kontaktsprache', partial: 'Mischsprache', wrong: ['Schrift', 'Grammatik'], explanation: 'Dialekt ist eine Sprachvarietät. Entsprechend ist Pidgin eine Kontaktsprache.' }
    ],
    4: [
      { a: 'Silogismus', b: 'Schlussform', c: 'Metapher', correct: 'Stilfigur', partial: 'Sprachbild', wrong: ['Poesie', 'Text'], explanation: 'Silogismus ist Unterkategorie einer Schlussform. Metapher ist entsprechend Unterkategorie einer Stilfigur.' },
      { a: 'Mikroexpression', b: 'nonverbales Signal', c: 'Prosodie', correct: 'parasprachliches Merkmal', partial: 'Stimmmerkmal', wrong: ['Lautstärke', 'Aussage'], explanation: 'Die Beziehung ordnet Fachbegriffe in ihre Oberkategorie ein. Prosodie gehört zu parasprachlichen Merkmalen.' },
      { a: 'Fuzzy-Logik', b: 'Inferenzsystem', c: 'Bayes-Netz', correct: 'probabilistisches Modell', partial: 'Wahrscheinlichkeitsmodell', wrong: ['Regel', 'Funktion'], explanation: 'Fuzzy-Logik ist Unterkategorie eines Inferenzsystems. Ein Bayes-Netz ist ein probabilistisches Modell.' },
      { a: 'Performanz', b: 'Sprachverhalten', c: 'Kompetenz', correct: 'Sprachfähigkeit', partial: 'Sprachkenntnis', wrong: ['Kommunikation', 'Ausdruck'], explanation: 'Performanz ist beobachtbares Sprachverhalten. Kompetenz ist die zugrundeliegende Sprachfähigkeit.' }
    ]
  },
  abstrakt: {
    1: [
      { a: 'Funke', b: 'Feuer', c: 'Idee', correct: 'Projekt', partial: 'Plan', wrong: ['Papier', 'Büro'], explanation: 'Die Relation beschreibt den Übergang vom Auslöser zum größeren Ergebnis. Idee führt analog zu einem Projekt.' },
      { a: 'Samen', b: 'Pflanze', c: 'Impuls', correct: 'Handlung', partial: 'Reaktion', wrong: ['Stille', 'Pause'], explanation: 'Ein kleiner Anfang entwickelt sich zu einem größeren Resultat. Impuls führt entsprechend zu Handlung.' },
      { a: 'Regen', b: 'Regenbogen', c: 'Konflikt', correct: 'Lösung', partial: 'Kompromiss', wrong: ['Streit', 'Stille'], explanation: 'Die Relation beschreibt den Übergang von Problem zu Ergebnis. Konflikt führt analog zu einer Lösung.' },
      { a: 'Dunkel', b: 'Licht', c: 'Angst', correct: 'Mut', partial: 'Stärke', wrong: ['Flucht', 'Kälte'], explanation: 'Die Abstraktion modelliert den Übergang zum Gegenstück. Angst führt zum überwindenden Mut.' }
    ],
    2: [
      { a: 'Skizze', b: 'Entwurf', c: 'Probe', correct: 'Aufführung', partial: 'Generalprobe', wrong: ['Bühne', 'Publikum'], explanation: 'Vom Vorläufer geht es zur ausgereiften Form. Probe steht zur Aufführung in derselben Logik.' },
      { a: 'Signal', b: 'Orientierung', c: 'Feedback', correct: 'Anpassung', partial: 'Korrektur', wrong: ['Wiederholung', 'Verzögerung'], explanation: 'A erzeugt eine steuernde Folge B. Feedback führt in dieser Struktur zu Anpassung.' },
      { a: 'Druck', b: 'Reaktion', c: 'Vertrauen', correct: 'Kooperation', partial: 'Zusammenarbeit', wrong: ['Kontrolle', 'Distanz'], explanation: 'Der erste Begriff löst eine typische Folge aus. Vertrauen ermöglicht Kooperation.' },
      { a: 'Regel', b: 'Ordnung', c: 'Ausnahme', correct: 'Chaos', partial: 'Unklarheit', wrong: ['Norm', 'Muster'], explanation: 'Regeln erzeugen Ordnung. Die Ausnahme steht entsprechend für Chaos in diesem Muster.' }
    ],
    3: [
      { a: 'Hypothese', b: 'Prüfung', c: 'These', correct: 'Argumentation', partial: 'Debatte', wrong: ['Abbruch', 'Gewohnheit'], explanation: 'Die Beziehung beschreibt den nächsten kognitiven Schritt. Auf eine These folgt in der Regel Argumentation.' },
      { a: 'Norm', b: 'Abweichung', c: 'Ziel', correct: 'Diskrepanz', partial: 'Lücke', wrong: ['Belohnung', 'Stille'], explanation: 'Hier wird die relationale Messidee abgebildet: Norm zu Abweichung, Ziel zu Diskrepanz.' },
      { a: 'Krise', b: 'Transformation', c: 'Stabilität', correct: 'Kontinuität', partial: 'Beständigkeit', wrong: ['Wachstum', 'Beschleunigung'], explanation: 'Krise führt zu Transformation. Stabilität führt entsprechend zu Kontinuität.' },
      { a: 'Erwartung', b: 'Enttäuschung', c: 'Planung', correct: 'Abweichung', partial: 'Überraschung', wrong: ['Erfolg', 'Ergebnis'], explanation: 'Erwartung kann zu Enttäuschung führen. Planung legt den Maßstab für eine Abweichung fest.' }
    ],
    4: [
      { a: 'Rahmen', b: 'Interpretation', c: 'Metrik', correct: 'Bewertung', partial: 'Einordnung', wrong: ['Behauptung', 'Verzerrung'], explanation: 'Der erste Begriff steuert den zweiten. Entsprechend steuert eine Metrik die Bewertung.' },
      { a: 'Kohärenz', b: 'Verstehen', c: 'Inkonsistenz', correct: 'Zweifel', partial: 'Unsicherheit', wrong: ['Entscheidung', 'Sicherheit'], explanation: 'Die Analogie modelliert Wirkrichtung auf abstrakter Ebene. Inkonsistenz führt typischerweise zu Zweifel.' },
      { a: 'Entropie', b: 'Informationsverlust', c: 'Kompression', correct: 'Effizienz', partial: 'Reduktion', wrong: ['Rauschen', 'Übertragung'], explanation: 'Entropie führt zu Informationsverlust. Kompression führt dagegen zu Effizienz.' },
      { a: 'Emergenz', b: 'Systemverhalten', c: 'Reduktionismus', correct: 'Elementaranalyse', partial: 'Vereinfachung', wrong: ['Komplexität', 'Wechselwirkung'], explanation: 'Emergenz beschreibt übergeordnetes Systemverhalten. Reduktionismus führt zur Elementaranalyse.' }
    ]
  }
};

function shuffleWortanalogienOptions(options) {
  const list = options.slice();
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = list[i];
    list[i] = list[j];
    list[j] = temp;
  }
  return list;
}

function loadWortanalogienHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(WORTANALOGIEN_HISTORY_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveWortanalogienHistory(entries) {
  try {
    localStorage.setItem(WORTANALOGIEN_HISTORY_KEY, JSON.stringify(entries.slice(-20)));
  } catch (error) {
    // Ignore storage errors and keep app flow running.
  }
}

function rtBucketLabel(rtMs) {
  if (typeof rtMs !== 'number' || !isFinite(rtMs)) return '-';
  const seconds = rtMs / 1000;
  if (seconds < 3) return 'sehr schnell';
  if (seconds <= 6) return 'normal';
  return 'langsam';
}

function classificationFromScore(value) {
  if (value >= 85) return 'deutlich überdurchschnittlich';
  if (value >= 70) return 'überdurchschnittlich';
  if (value >= 50) return 'durchschnittlich';
  return 'unterdurchschnittlich';
}

function getWortanalogienBlockMetrics(taskEvents) {
  const source = (taskEvents || []).slice(-5);
  if (!source.length) {
    return {
      avgRtMs: null,
      accuracyPct: 0,
      memoryPct: 0,
      points: 0
    };
  }

  const rtValues = source.map(function(entry) { return entry.reactionTimeMs; }).filter(function(value) {
    return typeof value === 'number' && isFinite(value);
  });
  const correctCount = source.filter(function(entry) { return !!entry.correct; }).length;
  const memoryEvents = source.filter(function(entry) { return entry.kind === 'memory'; });
  const memoryCorrect = memoryEvents.filter(function(entry) { return !!entry.correct; }).length;

  return {
    avgRtMs: rtValues.length ? Math.round(rtValues.reduce(function(sum, value) { return sum + value; }, 0) / rtValues.length) : null,
    accuracyPct: Math.round((correctCount / source.length) * 100),
    memoryPct: memoryEvents.length ? Math.round((memoryCorrect / memoryEvents.length) * 100) : 0,
    points: source.reduce(function(sum, entry) { return sum + (entry.pointsDelta || 0); }, 0)
  };
}

function buildWortanalogienAnalogyTask() {
  const session = wortanalogienState.session;
  const relationType = WORTANALOGIEN_RELATION_ORDER[session.relationCursor % WORTANALOGIEN_RELATION_ORDER.length];
  session.relationCursor += 1;

  const level = session.level;
  const candidates = ((WORTANALOGIEN_ITEM_BANK[relationType] || {})[level] || []).slice();
  const unused = candidates.filter(function(item) {
    return session.usedAnalogies.indexOf(item.promptKey || `${relationType}:${item.a}:${item.c}`) === -1;
  });
  const picked = (unused.length ? randomFrom(unused) : randomFrom(candidates));
  const promptKey = picked.promptKey || `${relationType}:${picked.a}:${picked.c}`;
  session.usedAnalogies.push(promptKey);
  if (session.usedAnalogies.length > 120) session.usedAnalogies = session.usedAnalogies.slice(-80);

  const prompt = `${picked.a} : ${picked.b} = ${picked.c} : ?`;
  const options = shuffleWortanalogienOptions([
    { label: picked.correct, scoreMode: 'correct', errorType: null },
    { label: picked.partial, scoreMode: 'partial', errorType: 'falsche Beziehung erkannt' },
    { label: picked.wrong[0], scoreMode: 'wrong', errorType: 'semantische Verwechslung' },
    { label: picked.wrong[1], scoreMode: 'wrong', errorType: 'oberflächliche Ähnlichkeit' }
  ]);

  return {
    kind: 'analogy',
    prompt: prompt,
    relationType: relationType,
    relationLabel: WORTANALOGIEN_RELATION_LABELS[relationType] || relationType,
    explanation: picked.explanation,
    level: level,
    options: options,
    shownAt: Date.now(),
    answered: false,
    memoryCueWord: null
  };
}

function buildWortanalogienMemoryTask() {
  const session = wortanalogienState.session;
  const target = session.pendingMemoryWord;
  const wrongPool = WORTANALOGIEN_MEMORY_WORDS.filter(function(word) { return word !== target; });
  const shuffledWrong = shuffleWortanalogienOptions(wrongPool).slice(0, 3);
  const options = shuffleWortanalogienOptions([
    { label: target, scoreMode: 'correct', errorType: null },
    { label: shuffledWrong[0], scoreMode: 'wrong', errorType: 'falsche Beziehung erkannt' },
    { label: shuffledWrong[1], scoreMode: 'wrong', errorType: 'semantische Verwechslung' },
    { label: shuffledWrong[2], scoreMode: 'wrong', errorType: 'oberflächliche Ähnlichkeit' }
  ]);

  return {
    kind: 'memory',
    prompt: 'Welches Wort solltest du dir merken?',
    relationType: 'arbeitsgedaechtnis',
    relationLabel: 'Arbeitsgedächtnis-Abruf',
    explanation: `Das Zielwort war "${target}". Die Aufgabe prüft den verzögerten Abruf über mehrere Zwischenschritte.`,
    level: session.level,
    options: options,
    shownAt: Date.now(),
    answered: false,
    memoryCueWord: null,
    targetWord: target
  };
}

function buildWortanalogienTask() {
  const session = wortanalogienState.session;

  if (session.pendingMemoryWord && session.analogySinceMemoryCue >= 3) {
    return buildWortanalogienMemoryTask();
  }

  const task = buildWortanalogienAnalogyTask();
  if (!session.pendingMemoryWord && session.analogySinceMemoryCue === 0) {
    const memoryWord = randomFrom(WORTANALOGIEN_MEMORY_WORDS);
    session.pendingMemoryWord = memoryWord;
    task.memoryCueWord = memoryWord;
  }
  return task;
}

function setWortanalogienFeedback(feedbackText, toneClass) {
  const feedbackEl = document.getElementById('wortanalogien-feedback');
  if (!feedbackEl) return;
  feedbackEl.textContent = feedbackText;
  feedbackEl.className = 'feedback feedback-compact';
  if (toneClass) {
    feedbackEl.classList.add(toneClass);
  }
}

function renderWortanalogienTask() {
  if (!wortanalogienState.session) return;
  if (wortanalogienState.advanceTimer) {
    clearTimeout(wortanalogienState.advanceTimer);
    wortanalogienState.advanceTimer = null;
  }

  wortanalogienState.currentTask = buildWortanalogienTask();
  wortanalogienState.taskCount++;

  const task = wortanalogienState.currentTask;
  const metaLabel = `[AUFGABE #${wortanalogienState.taskCount} | LEVEL ${task.level}]`;
  setTextEntries({
    'wortanalogien-progress': String(wortanalogienState.taskCount),
    'wortanalogien-prompt': task.prompt,
    'wortanalogien-task-meta': metaLabel
  });

  const cueEl = document.getElementById('wortanalogien-memory-cue');
  if (cueEl) {
    if (task.memoryCueWord) {
      cueEl.innerHTML = `MERKWORT:<span class="cue-word">${task.memoryCueWord}</span>`;
      cueEl.classList.remove('hidden');
      cueEl.classList.remove('cue-pop');
      void cueEl.offsetWidth;
      cueEl.classList.add('cue-pop');
    } else {
      cueEl.textContent = '';
      cueEl.classList.remove('cue-pop');
      cueEl.classList.add('hidden');
    }
  }

  const row = document.getElementById('wortanalogien-options-row');
  row.innerHTML = '';
  task.options.forEach(function(option, optionIndex) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-secondary';
    btn.textContent = `${String.fromCharCode(65 + optionIndex)}) ${option.label}`;
    btn.addEventListener('click', function() {
      submitWortanalogienAnswer(optionIndex, false);
    });
    row.appendChild(btn);
  });

  setWortanalogienFeedback('', null);
}

function startWortanalogienExercise() {
  const selectedMinutes = parseInt(document.getElementById('wortanalogien-time-select').value, 10) || 5;
  const runMode = getSelectedRunMode('wortanalogien-runmode-select');
  const totalSeconds = selectedMinutes * 60;
  wortanalogienState.session = {
    runMode,
    startedAt: Date.now(),
    totalSeconds: totalSeconds,
    remainingSeconds: totalSeconds,
    correct: 0,
    wrong: 0,
    total: 0,
    points: 0,
    rtSum: 0,
    rtCount: 0,
    level: runMode === 'practice' ? 1 : 2,
    relationCursor: 0,
    correctStreak: 0,
    wrongStreak: 0,
    pendingMemoryWord: null,
    analogySinceMemoryCue: 0,
    memoryTotal: 0,
    memoryCorrect: 0,
    usedAnalogies: [],
    errorStats: {
      semantic: 0,
      superficial: 0,
      relation: 0,
      impulse: 0
    },
    taskEvents: [],
    trials: []
  };

  wortanalogienState.taskCount = 0;
  showScreen('screen-wortanalogien-exercise');
  clearWortanalogienTimer();
  updateModuleTimer('wortanalogien', wortanalogienState.session);
  wortanalogienState.timerInterval = setInterval(function() {
    if (!wortanalogienState.session) return;
    wortanalogienState.session.remainingSeconds--;
    if (wortanalogienState.session.remainingSeconds < 0) wortanalogienState.session.remainingSeconds = 0;
    updateModuleTimer('wortanalogien', wortanalogienState.session);
    if (wortanalogienState.session.remainingSeconds <= 0) {
      finishWortanalogienExercise(true);
    }
  }, 1000);

  renderWortanalogienTask();
}

function mapWortanalogienErrorType(rawType) {
  if (rawType === 'semantische Verwechslung') return 'semantic';
  if (rawType === 'oberflächliche Ähnlichkeit') return 'superficial';
  if (rawType === 'falsche Beziehung erkannt') return 'relation';
  return null;
}

function submitWortanalogienAnswer(optionIndex, omitted) {
  if (!wortanalogienState.session || !wortanalogienState.currentTask || wortanalogienState.currentTask.answered) return;
  wortanalogienState.currentTask.answered = true;

  const session = wortanalogienState.session;
  const task = wortanalogienState.currentTask;
  const now = Date.now();
  const reactionTimeMs = omitted ? null : Math.max(0, now - task.shownAt);
  const pickedOption = omitted ? null : task.options[optionIndex];
  const scoreMode = omitted ? 'wrong' : (pickedOption ? pickedOption.scoreMode : 'wrong');
  const isCorrect = scoreMode === 'correct';
  const isPartial = scoreMode === 'partial';
  let pointsDelta = 0;

  if (task.kind === 'memory') {
    session.memoryTotal += 1;
    if (isCorrect) {
      session.memoryCorrect += 1;
      pointsDelta = 2;
    } else {
      pointsDelta = 0;
    }
    session.pendingMemoryWord = null;
    session.analogySinceMemoryCue = 0;
  } else {
    session.analogySinceMemoryCue += 1;
    if (isCorrect) {
      pointsDelta = reactionTimeMs !== null && reactionTimeMs < 5000 ? 2 : 1;
    } else if (isPartial) {
      pointsDelta = 0;
    } else {
      pointsDelta = -1;
    }

    if (isCorrect) {
      session.correctStreak += 1;
      session.wrongStreak = 0;
      if (session.correctStreak >= 3) {
        session.level = Math.min(4, session.level + 1);
        session.correctStreak = 0;
      }
    } else {
      session.wrongStreak += 1;
      session.correctStreak = 0;
      if (session.wrongStreak >= 2) {
        session.level = Math.max(1, session.level - 1);
        session.wrongStreak = 0;
      }
    }
  }

  session.total += 1;
  if (isCorrect) session.correct += 1;
  else session.wrong += 1;
  session.points += pointsDelta;
  if (reactionTimeMs !== null) {
    session.rtSum += reactionTimeMs;
    session.rtCount += 1;
  }

  let errorType = null;
  if (!isCorrect) {
    errorType = omitted ? 'falsche Beziehung erkannt' : (pickedOption ? pickedOption.errorType : 'falsche Beziehung erkannt');
    const mapped = mapWortanalogienErrorType(errorType);
    if (mapped) session.errorStats[mapped] += 1;
    if (reactionTimeMs !== null && reactionTimeMs < 3000) {
      session.errorStats.impulse += 1;
      errorType = 'Impulsfehler (zu schnell)';
    }
  }

  const correctIndex = task.options.findIndex(function(option) { return option.scoreMode === 'correct'; });
  const correctLabel = correctIndex >= 0 ? task.options[correctIndex].label : '-';
  const correctLetter = correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : '-';
  const relationLabel = task.kind === 'memory' ? 'Arbeitsgedächtnis' : task.relationLabel;
  const rtLabel = reactionTimeMs === null ? '-' : `${(reactionTimeMs / 1000).toFixed(1)} s (${rtBucketLabel(reactionTimeMs)})`;
  const outcomeLabel = isCorrect ? 'Richtig' : (isPartial ? 'Teilweise logisch' : 'Falsch');
  const optionLetter = optionIndex >= 0 ? String.fromCharCode(65 + optionIndex) : '-';
  const verboseToggle = document.getElementById('wortanalogien-verbose-toggle');
  const verboseFeedback = verboseToggle && verboseToggle.checked;
  let feedbackText;
  if (verboseFeedback) {
    feedbackText = `[ERGEBNIS] ${outcomeLabel} | Antwort: ${optionLetter} | RT: ${rtLabel} | Punkte: ${pointsDelta >= 0 ? '+' : ''}${pointsDelta}`
      + `\n[LÖSUNG] ${correctLetter}) ${correctLabel}`
      + `\n[BEZIEHUNGSTYP] ${relationLabel}`
      + `\n[ERKLÄRUNG] ${task.explanation}`
      + `${errorType ? `\n[FEHLERKLASSE] ${errorType}` : ''}`;
  } else {
    feedbackText = `${outcomeLabel} | ${correctLetter}) ${correctLabel} | Punkte ${pointsDelta >= 0 ? '+' : ''}${pointsDelta}`
      + `${errorType ? ` | ${errorType}` : ''}`;
  }
  setWortanalogienFeedback(feedbackText, isCorrect ? 'richtig' : 'falsch');

  const buttons = Array.from(document.querySelectorAll('#wortanalogien-options-row .btn'));
  buttons.forEach(function(button, index) {
    button.disabled = true;
    if (index === correctIndex) button.classList.add('btn-success');
    if (!omitted && index === optionIndex && !isCorrect) button.classList.add('btn-danger');
  });

  session.taskEvents.push({
    kind: task.kind,
    relationType: task.relationType,
    level: task.level,
    correct: isCorrect,
    partial: isPartial,
    reactionTimeMs: reactionTimeMs,
    pointsDelta: pointsDelta,
    errorType: errorType,
    optionLetter: optionLetter,
    timestamp: new Date().toISOString()
  });

  session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'reaction',
    reactionTimeMs: reactionTimeMs,
    correct: isCorrect,
    omitted: !!omitted,
    anticipated: reactionTimeMs !== null && reactionTimeMs < 2500,
    difficultyLevel: task.level,
    sequenceLength: null,
    mode: task.relationType,
    blockLabel: task.prompt
  });

  wortanalogienState.advanceTimer = setTimeout(function() {
    wortanalogienState.advanceTimer = null;
    if (!wortanalogienState.session || wortanalogienState.session.remainingSeconds <= 0) {
      finishWortanalogienExercise(true);
      return;
    }
    renderWortanalogienTask();
  }, 520);
}

function skipWortanalogienTask() {
  submitWortanalogienAnswer(-1, true);
}

function buildWortanalogienCognitiveSummary(session, avgRtMs, accuracyPct) {
  const maxLevel = session.taskEvents.reduce(function(maxValue, event) {
    return Math.max(maxValue, event.level || 1);
  }, 1);
  const levelThreeEvents = session.taskEvents.filter(function(event) {
    return event.kind === 'analogy' && event.level >= 3;
  });
  const levelThreeAccuracy = levelThreeEvents.length
    ? Math.round((levelThreeEvents.filter(function(event) { return event.correct; }).length / levelThreeEvents.length) * 100)
    : Math.max(40, accuracyPct - 8);

  const processingScore = avgRtMs === null ? 50 : (avgRtMs < 3000 ? 88 : (avgRtMs <= 6000 ? 66 : 42));
  const abstractionScore = Math.min(96, Math.round((maxLevel / 4) * 55 + (levelThreeAccuracy * 0.45)));
  const concentrationScore = Math.max(20, Math.min(95, Math.round(accuracyPct - session.errorStats.impulse * 4 + (session.memoryCorrect * 6))));
  const rtValues = session.taskEvents.map(function(event) { return event.reactionTimeMs; }).filter(function(value) {
    return typeof value === 'number' && isFinite(value);
  });
  const rtSpread = rtValues.length > 3 ? Math.max.apply(null, rtValues) - Math.min.apply(null, rtValues) : 0;
  const pressureScore = Math.max(20, Math.min(94, Math.round(80 - (rtSpread / 220) - (session.errorStats.impulse * 5))));

  return {
    processing: { label: 'Verarbeitungsgeschwindigkeit', score: processingScore, cls: classificationFromScore(processingScore) },
    abstraction: { label: 'Abstraktionsniveau', score: abstractionScore, cls: classificationFromScore(abstractionScore) },
    concentration: { label: 'Konzentration', score: concentrationScore, cls: classificationFromScore(concentrationScore) },
    pressure: { label: 'Stabilität unter Druck', score: pressureScore, cls: classificationFromScore(pressureScore) }
  };
}

function buildWortanalogienTrend(currentSession) {
  const history = loadWortanalogienHistory();
  const merged = history.concat((currentSession.taskEvents || []).map(function(event) {
    return {
      timestamp: event.timestamp,
      level: event.level,
      correct: event.correct,
      reactionTimeMs: event.reactionTimeMs,
      pointsDelta: event.pointsDelta,
      errorType: event.errorType
    };
  })).slice(-20);
  saveWortanalogienHistory(merged);

  const firstHalf = merged.slice(0, Math.floor(merged.length / 2));
  const secondHalf = merged.slice(Math.floor(merged.length / 2));
  const avgPointsFirst = firstHalf.length ? firstHalf.reduce(function(sum, item) { return sum + (item.pointsDelta || 0); }, 0) / firstHalf.length : 0;
  const avgPointsSecond = secondHalf.length ? secondHalf.reduce(function(sum, item) { return sum + (item.pointsDelta || 0); }, 0) / secondHalf.length : 0;
  const trendDelta = avgPointsSecond - avgPointsFirst;
  const trendLabel = trendDelta > 0.25 ? 'Verbesserung' : (trendDelta < -0.25 ? 'Ermüdung' : 'Leistungsschwankung');

  const rtByLevel = {};
  const errorsByLevel = {};
  merged.forEach(function(item) {
    const levelKey = String(item.level || 1);
    if (!rtByLevel[levelKey]) rtByLevel[levelKey] = [];
    if (!errorsByLevel[levelKey]) errorsByLevel[levelKey] = { total: 0, errors: 0 };
    if (typeof item.reactionTimeMs === 'number' && isFinite(item.reactionTimeMs)) rtByLevel[levelKey].push(item.reactionTimeMs);
    errorsByLevel[levelKey].total += 1;
    if (!item.correct) errorsByLevel[levelKey].errors += 1;
  });

  const levelParts = Object.keys(errorsByLevel).sort(function(a, b) { return Number(a) - Number(b); }).map(function(levelKey) {
    const info = errorsByLevel[levelKey];
    const rate = info.total ? Math.round((info.errors / info.total) * 100) : 0;
    return `L${levelKey}: ${rate}% Fehler`;
  });

  return {
    trendLabel: trendLabel,
    trendDelta: trendDelta,
    historyCount: merged.length,
    levelErrorRateText: levelParts.join(' | ')
  };
}

function finishWortanalogienExercise(timedOut) {
  clearWortanalogienTimer();
  if (!wortanalogienState.session) {
    showScreen('screen-wortanalogien-results');
    return;
  }

  const session = wortanalogienState.session;
  const accuracyPct = getAccuracyPercent(session.correct, session.total);
  const elapsed = getElapsedSeconds(session.startedAt, session.totalSeconds, timedOut);
  const avgRt = session.rtCount > 0 ? Math.round(session.rtSum / session.rtCount) : null;
  const minutes = elapsed > 0 ? elapsed / 60 : 0;
  const throughput = minutes > 0 ? (session.total / minutes) : 0;
  const memoryText = `${session.memoryCorrect}/${session.memoryTotal}`;
  const blockMetrics = getWortanalogienBlockMetrics(session.taskEvents);
  const cognitive = buildWortanalogienCognitiveSummary(session, avgRt, accuracyPct);
  const trend = buildWortanalogienTrend(session);

  setTextEntries({
    'wortanalogien-result-percent': `${accuracyPct}%`,
    'wortanalogien-result-rt': avgRt === null ? '-' : `${avgRt} ms`,
    'wortanalogien-result-throughput': `${throughput.toFixed(1)} Aufgaben/Min`,
    'wortanalogien-result-limit': formatTime(session.totalSeconds),
    'wortanalogien-result-correct': String(session.correct),
    'wortanalogien-result-wrong': String(session.wrong),
    'wortanalogien-result-total': String(session.total),
    'wortanalogien-result-duration': formatTime(elapsed),
    'wortanalogien-result-points': String(session.points),
    'wortanalogien-result-memory': memoryText,
    'wortanalogien-result-block': blockMetrics.avgRtMs === null
      ? '-'
      : `RT ${(blockMetrics.avgRtMs / 1000).toFixed(1)} s | Treffer ${blockMetrics.accuracyPct}% | Gedächtnisabruf ${blockMetrics.memoryPct}% | Punktesumme ${blockMetrics.points >= 0 ? '+' : ''}${blockMetrics.points}`
  });

  const cognitiveText = [
    `${cognitive.processing.label}: ${cognitive.processing.cls}`,
    `${cognitive.abstraction.label}: ${cognitive.abstraction.cls}`,
    `${cognitive.concentration.label}: ${cognitive.concentration.cls}`,
    `${cognitive.pressure.label}: ${cognitive.pressure.cls}`
  ].join(' | ');
  setText('wortanalogien-result-cognitive', cognitiveText);

  const errorsText = `Semantisch: ${session.errorStats.semantic} | Oberflächlich: ${session.errorStats.superficial} | Beziehung: ${session.errorStats.relation} | Impuls: ${session.errorStats.impulse}`;
  setText('wortanalogien-result-errors', errorsText);

  const trendText = `${trend.trendLabel} (${trend.trendDelta >= 0 ? '+' : ''}${trend.trendDelta.toFixed(2)} Punkte je Aufgabe), Verlauf: ${trend.historyCount} Aufgaben, Fehlerquote pro Level: ${trend.levelErrorRateText || '-'}`;
  setText('wortanalogien-result-trend', trendText);

  setResultInsight('wortanalogien-result-insight', 'wortanalogien', accuracyPct, { avgRt: avgRt });
  saveTrainingEntry({
    module: 'wortanalogien',
    label: 'Wortanalogien',
    ...getRunModeEntryProps(session.runMode),
    avgRt: avgRt,
    throughput: throughput,
    points: session.points,
    memoryCorrect: session.memoryCorrect,
    memoryTotal: session.memoryTotal,
    errorStats: session.errorStats,
    taskEvents: session.taskEvents,
    trials: session.trials,
    correct: session.correct,
    wrong: session.wrong,
    total: session.total,
    accuracy: accuracyPct,
    duration: elapsed,
    totalSeconds: session.totalSeconds
  });

  showScreen('screen-wortanalogien-results');
}

function restartWortanalogienMode() {
  startWortanalogienExercise();
}



