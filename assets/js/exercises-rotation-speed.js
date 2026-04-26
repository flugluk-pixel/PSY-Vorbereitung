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
  startModuleTimer(rotationState, 'rotation', finishRotationExercise);
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
  startModuleTimer(mathState, 'math', finishMathExercise);
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

