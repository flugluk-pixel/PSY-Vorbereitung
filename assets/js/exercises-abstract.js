const FIGMAT_SHAPES = ['triangle', 'circle', 'square', 'diamond'];
const FIGMAT_ERROR_LABELS = {
  rotation: 'Rotationsregel verfehlt',
  fill: 'Fuellungsregel verfehlt',
  count: 'Anzahlregel verfehlt',
  size: 'Groessenregel verfehlt',
  position: 'Positionsregel verfehlt',
  mask: 'Kombinationsregel verfehlt',
  mixed: 'Regelkombination verfehlt'
};
const FIGMAT_ERROR_CLASS_LABELS = {
  impulse: 'Impulsfehler',
  applied: 'Regel erkannt, falsch angewendet',
  combination: 'Regelkombination unsauber',
  hypothesis: 'Falsche Regelhypothese'
};

function fmRandInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fmCloneCell(cell) {
  return JSON.parse(JSON.stringify(cell));
}

function fmClamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function fmShuffle(items) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function fmCellSignature(cell) {
  if (cell.kind === 'mask') return `mask-${cell.mask}`;
  return [
    cell.shape,
    cell.rotation,
    cell.filled ? 1 : 0,
    cell.count,
    cell.size,
    cell.anchor
  ].join('-');
}

function fmApplyMaskOp(op, a, b) {
  if (op === 'xor') return a ^ b;
  if (op === 'overlay') return a | b;
  if (op === 'sub') return a & (~b) & 15;
  return (a + b) & 15;
}

function fmRuleDiffKinds(answerCell, candidateCell, ruleKinds) {
  if (!answerCell || !candidateCell) return ['mixed'];
  const diffs = [];
  const kinds = ruleKinds && ruleKinds.length ? ruleKinds : ['rotation', 'fill', 'count', 'size', 'position'];
  kinds.forEach(function(kind) {
    if (kind === 'rotation' && answerCell.rotation !== candidateCell.rotation) diffs.push('rotation');
    else if (kind === 'fill' && !!answerCell.filled !== !!candidateCell.filled) diffs.push('fill');
    else if (kind === 'count' && answerCell.count !== candidateCell.count) diffs.push('count');
    else if (kind === 'size' && answerCell.size !== candidateCell.size) diffs.push('size');
    else if (kind === 'position' && answerCell.anchor !== candidateCell.anchor) diffs.push('position');
    else if (kind === 'mask' && answerCell.mask !== candidateCell.mask) diffs.push('mask');
  });
  return diffs;
}

function fmTaskHasUniqueSolution(task) {
  if (!task || !task.options || !task.answerCell) return false;
  const answerSig = fmCellSignature(task.answerCell);
  const matching = task.options.filter(function(option) {
    return option && option.cell && fmCellSignature(option.cell) === answerSig;
  });
  if (matching.length !== 1) return false;

  const distractors = task.options.filter(function(option) {
    return option && option.cell && fmCellSignature(option.cell) !== answerSig;
  });
  for (let i = 0; i < distractors.length; i++) {
    const option = distractors[i];
    const diffs = fmRuleDiffKinds(task.answerCell, option.cell, task.ruleKinds);
    if (!diffs.length) return false;
    if (!option.violationKinds || !option.violationKinds.length) option.violationKinds = diffs;
  }
  return true;
}

function fmPickRuleKinds(level) {
  const simple = ['rotation', 'count', 'size', 'position', 'fill'];
  if (level <= 1) return [randomFrom(['rotation', 'count', 'position'])];
  if (level === 2) return [randomFrom(simple)];
  if (level === 3) {
    const primary = randomFrom(['rotation', 'position', 'fill']);
    const secondaryPool = simple.filter(function(kind) { return kind !== primary; });
    return [primary, randomFrom(secondaryPool)];
  }
  return fmShuffle(simple).slice(0, 2);
}

function fmRuleDescriptor(kind) {
  if (kind === 'rotation') return 'Rotation';
  if (kind === 'count') return 'Anzahl';
  if (kind === 'size') return 'Groesse';
  if (kind === 'position') return 'Position';
  if (kind === 'fill') return 'Fuellung';
  return kind;
}

function fmBuildRuleConfig(kind, level) {
  if (kind === 'rotation') {
    return { kind, rowStep: randomFrom([0, 90]), colStep: randomFrom([90, 180]) };
  }
  if (kind === 'fill') {
    return { kind, rowStep: randomFrom([0, 1]), colStep: 1 };
  }
  if (kind === 'count') {
    return { kind, rowStep: randomFrom([0, 1]), colStep: 1 };
  }
  if (kind === 'size') {
    return { kind, rowStep: randomFrom([0, 1]), colStep: 1 };
  }
  if (kind === 'position') {
    return { kind, rowStep: randomFrom([0, 1]), colStep: randomFrom([1, 2]) };
  }
  return { kind, rowStep: 0, colStep: 1 };
}

function fmGenerateFeatureTask(level) {
  const ruleKinds = fmPickRuleKinds(level);
  const rules = ruleKinds.map(function(kind) { return fmBuildRuleConfig(kind, level); });
  const usesRotation = ruleKinds.indexOf('rotation') >= 0;
  const base = {
    kind: 'feature',
    shape: usesRotation ? 'triangle' : randomFrom(FIGMAT_SHAPES),
    rotation: randomFrom([0, 90, 180, 270]),
    filled: randomFrom([true, false]),
    count: fmRandInt(1, 3),
    size: fmRandInt(1, 3),
    anchor: fmRandInt(0, 3)
  };

  function cellAt(row, col) {
    const cell = fmCloneCell(base);
    rules.forEach(function(rule) {
      const delta = row * rule.rowStep + col * rule.colStep;
      if (rule.kind === 'rotation') cell.rotation = ((cell.rotation + delta) % 360 + 360) % 360;
      else if (rule.kind === 'fill') cell.filled = ((cell.filled ? 1 : 0) + delta) % 2 === 1;
      else if (rule.kind === 'count') cell.count = fmClamp(cell.count + delta, 1, 4);
      else if (rule.kind === 'size') cell.size = fmClamp(cell.size + delta, 1, 3);
      else if (rule.kind === 'position') cell.anchor = ((cell.anchor + delta) % 4 + 4) % 4;
    });
    return cell;
  }

  const grid = [];
  for (let row = 0; row < 3; row++) {
    const line = [];
    for (let col = 0; col < 3; col++) {
      line.push(cellAt(row, col));
    }
    grid.push(line);
  }

  const answerCell = grid[2][2];
  const optionCount = level >= 3 ? 6 : 4;
  const options = fmBuildFeatureOptions(answerCell, rules, optionCount, level);
  const ruleText = rules.map(function(rule) { return fmRuleDescriptor(rule.kind); }).join(' + ');

  return {
    kind: 'feature',
    level,
    grid,
    answerCell,
    options,
    ruleKinds,
    ruleText,
    explanation: level >= 3
      ? `Es gelten zwei Regeln gleichzeitig (${ruleText}), die in jeder Zeile und Spalte konsistent fortgefuehrt werden.`
      : `Die Matrix folgt der Regel ${ruleText}. Das fehlende Feld setzt diese Regel logisch fort.`
  };
}

function fmGenerateMaskTask(level) {
  const op = randomFrom(['xor', 'overlay', 'sub']);
  const opText = op === 'xor'
    ? 'XOR (doppelte Elemente verschwinden)'
    : (op === 'overlay' ? 'Ueberlagerung (Vereinigung)' : 'Subtraktion (rechtes Muster wird entfernt)');

  function randomMask() {
    return fmRandInt(1, 15);
  }

  const grid = [[], [], []];
  for (let row = 0; row < 3; row++) {
    let a = randomMask();
    let b = randomMask();
    let c = fmApplyMaskOp(op, a, b);
    let tries = 0;
    while (c === 0 && tries < 30) {
      a = randomMask();
      b = randomMask();
      c = fmApplyMaskOp(op, a, b);
      tries++;
    }
    grid[row][0] = { kind: 'mask', mask: a };
    grid[row][1] = { kind: 'mask', mask: b };
    grid[row][2] = { kind: 'mask', mask: c };
  }

  const answerCell = grid[2][2];
  const options = fmBuildMaskOptions(answerCell.mask, op, 6);

  return {
    kind: 'mask',
    level,
    grid,
    answerCell,
    options,
    ruleKinds: ['mask'],
    ruleText: opText,
    explanation: `In jeder Zeile entsteht das dritte Feld aus Feld 1 und 2 durch die Regel ${opText}.`
  };
}

function fmBuildFeatureOptions(answerCell, rules, optionCount, level) {
  const usedKinds = rules.map(function(rule) { return rule.kind; });
  const mutatorKinds = usedKinds.length ? usedKinds.slice() : ['rotation', 'count', 'position'];
  const options = [{ cell: fmCloneCell(answerCell), correct: true, errorType: null }];
  const seen = new Set([fmCellSignature(answerCell)]);
  let guard = 0;

  while (options.length < optionCount && guard < 120) {
    guard++;
    const kind = randomFrom(mutatorKinds);
    const candidate = fmMutateFeatureCell(answerCell, kind);
    let violatedKinds = [kind];
    if (level >= 3 && (Math.random() < 0.75 || options.length < 3)) {
      const second = randomFrom(mutatorKinds);
      Object.assign(candidate, fmMutateFeatureCell(candidate, second));
      if (second !== kind) violatedKinds.push(second);
    }
    const signature = fmCellSignature(candidate);
    if (seen.has(signature)) continue;
    seen.add(signature);
    options.push({
      cell: candidate,
      correct: false,
      errorType: FIGMAT_ERROR_LABELS[kind] || FIGMAT_ERROR_LABELS.mixed,
      violationKinds: violatedKinds
    });
  }

  return fmShuffle(options);
}

function fmMutateFeatureCell(baseCell, kind) {
  const cell = fmCloneCell(baseCell);
  if (kind === 'rotation') cell.rotation = (cell.rotation + randomFrom([90, 180])) % 360;
  else if (kind === 'fill') cell.filled = !cell.filled;
  else if (kind === 'count') cell.count = fmClamp(cell.count + randomFrom([-1, 1]), 1, 4);
  else if (kind === 'size') cell.size = fmClamp(cell.size + randomFrom([-1, 1]), 1, 3);
  else if (kind === 'position') cell.anchor = (cell.anchor + randomFrom([1, 2])) % 4;
  return cell;
}

function fmBuildMaskOptions(correctMask, op, optionCount) {
  const options = [{ cell: { kind: 'mask', mask: correctMask }, correct: true, errorType: null }];
  const seen = new Set([`mask-${correctMask}`]);
  let tries = 0;
  while (options.length < optionCount && tries < 120) {
    tries++;
    const bit = 1 << fmRandInt(0, 3);
    const variant = (correctMask ^ bit) || randomFrom([3, 5, 6, 9, 10, 12]);
    const signature = `mask-${variant}`;
    if (seen.has(signature)) continue;
    seen.add(signature);
    options.push({
      cell: { kind: 'mask', mask: variant },
      correct: false,
      errorType: FIGMAT_ERROR_LABELS.mask,
      violationKinds: ['mask']
    });
  }
  return fmShuffle(options);
}

function buildFigurenmatrixTask(level) {
  let tries = 0;
  while (tries < 16) {
    tries++;
    const useMaskRule = level >= 4 || (level === 3 && Math.random() < 0.25);
    const task = useMaskRule ? fmGenerateMaskTask(level) : fmGenerateFeatureTask(level);
    if (fmTaskHasUniqueSolution(task)) return task;
  }
  const fallback = level >= 4 ? fmGenerateMaskTask(level) : fmGenerateFeatureTask(level);
  return fallback;
}

function fmResolvePositions(count, anchor) {
  const points = [
    { x: 28, y: 28 },
    { x: 72, y: 28 },
    { x: 28, y: 72 },
    { x: 72, y: 72 },
    { x: 50, y: 50 }
  ];
  if (count === 1) return [points[[4, 0, 1, 2, 3][anchor % 5]]];
  if (count === 2) {
    const patterns = [[0, 3], [1, 2], [0, 1], [2, 3]];
    return patterns[anchor % patterns.length].map(function(idx) { return points[idx]; });
  }
  if (count === 3) {
    const patterns = [[0, 1, 4], [1, 3, 4], [2, 3, 4], [0, 2, 4]];
    return patterns[anchor % patterns.length].map(function(idx) { return points[idx]; });
  }
  return [points[0], points[1], points[2], points[3]];
}

function fmShapeSvg(shape, x, y, size, rotation, filled) {
  const stroke = '#0f2d6b';
  const fill = filled ? '#0f2d6b' : '#ffffff';
  if (shape === 'circle') {
    return `<circle cx="${x}" cy="${y}" r="${size * 0.42}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  }
  if (shape === 'square') {
    const half = size * 0.45;
    return `<rect x="${x - half}" y="${y - half}" width="${half * 2}" height="${half * 2}" fill="${fill}" stroke="${stroke}" stroke-width="2" transform="rotate(${rotation} ${x} ${y})"/>`;
  }
  if (shape === 'diamond') {
    const half = size * 0.46;
    return `<rect x="${x - half}" y="${y - half}" width="${half * 2}" height="${half * 2}" fill="${fill}" stroke="${stroke}" stroke-width="2" transform="rotate(${45 + rotation} ${x} ${y})"/>`;
  }
  const h = size * 0.52;
  const p1 = `${x},${y - h}`;
  const p2 = `${x - h * 0.88},${y + h * 0.72}`;
  const p3 = `${x + h * 0.88},${y + h * 0.72}`;
  return `<polygon points="${p1} ${p2} ${p3}" fill="${fill}" stroke="${stroke}" stroke-width="2" transform="rotate(${rotation} ${x} ${y})"/>`;
}

function renderFigurenmatrixCellSvg(cell, sizePx) {
  const px = sizePx || 90;
  if (cell.kind === 'mask') {
    const mask = cell.mask || 0;
    const squares = [
      { bit: 1, x: 22, y: 22 },
      { bit: 2, x: 58, y: 22 },
      { bit: 4, x: 22, y: 58 },
      { bit: 8, x: 58, y: 58 }
    ].map(function(slot) {
      const on = (mask & slot.bit) === slot.bit;
      return `<rect x="${slot.x}" y="${slot.y}" width="20" height="20" rx="3" fill="${on ? '#0f2d6b' : '#ffffff'}" stroke="#0f2d6b" stroke-width="2"/>`;
    }).join('');
    return `<svg width="${px}" height="${px}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="84" height="84" rx="10" fill="#f8fbff" stroke="#b7c7e4"/>${squares}</svg>`;
  }

  const sizeMap = { 1: 16, 2: 20, 3: 24 };
  const symbolSize = sizeMap[cell.size] || 20;
  const positions = fmResolvePositions(cell.count || 1, cell.anchor || 0);
  const symbols = positions.map(function(pos) {
    return fmShapeSvg(cell.shape, pos.x, pos.y, symbolSize, cell.rotation || 0, !!cell.filled);
  }).join('');
  return `<svg width="${px}" height="${px}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="84" height="84" rx="10" fill="#f8fbff" stroke="#b7c7e4"/>${symbols}</svg>`;
}

function updateFigurenmatrixLiveStats(lastRtMs) {
  const session = figurenmatrixState.session;
  if (!session) return;
  const pct = getAccuracyPercent(session.correct, session.total);
  setTextEntries({
    'figurenmatrix-last-rt': lastRtMs === null ? '-' : `${(lastRtMs / 1000).toFixed(2)} s`,
    'figurenmatrix-live-acc': `${pct}%`,
    'figurenmatrix-live-points': String(session.points)
  });
}

function isFigurenmatrixPracticeMode() {
  return isPracticeModeForModule(figurenmatrixState);
}

function setFigurenmatrixPracticeUi(showFeedback, showNextButton) {
  setPracticeModeUi('figurenmatrix', showFeedback, showNextButton);
}

function updateFigurenmatrixTimerDisplay() {
  if (!figurenmatrixState.session) return;
  updateModuleTimer('figurenmatrix', figurenmatrixState.session);
}

function renderFigurenmatrixTask() {
  const session = figurenmatrixState.session;
  if (!session) return;
  clearStateTimeout(figurenmatrixState, 'advanceTimer');

  if (session.remainingSeconds <= 0) {
    finishFigurenmatrixExercise(true);
    return;
  }

  const task = buildFigurenmatrixTask(session.level);
  task.shownAt = Date.now();
  task.answered = false;
  figurenmatrixState.currentTask = task;
  figurenmatrixState.taskCount += 1;

  setTextEntries({
    'figurenmatrix-progress': String(figurenmatrixState.taskCount),
    'figurenmatrix-level': String(session.level)
  });

  const gridEl = document.getElementById('figurenmatrix-grid');
  gridEl.innerHTML = '';
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cell = document.createElement('div');
      cell.className = 'figmat-cell';
      if (row === 2 && col === 2) {
        cell.textContent = '?';
      } else {
        cell.innerHTML = renderFigurenmatrixCellSvg(task.grid[row][col], 92);
      }
      gridEl.appendChild(cell);
    }
  }

  const optionsEl = document.getElementById('figurenmatrix-options');
  optionsEl.innerHTML = '';
  task.options.forEach(function(option, index) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'figmat-option';
    button.innerHTML = `<span class="figmat-option-label">${String.fromCharCode(65 + index)})</span>${renderFigurenmatrixCellSvg(option.cell, 78)}`;
    button.addEventListener('click', function() {
      submitFigurenmatrixAnswer(index);
    });
    optionsEl.appendChild(button);
  });

  setText('figurenmatrix-feedback', '');
  document.getElementById('figurenmatrix-feedback').className = 'feedback';
  setFigurenmatrixPracticeUi(isFigurenmatrixPracticeMode(), false);
  updateFigurenmatrixLiveStats(null);
}

function startFigurenmatrixExercise() {
  const selectedMode = document.getElementById('figurenmatrix-mode-select').value === 'practice' ? 'practice' : 'test';
  const selectedMinutes = parseInt(document.getElementById('figurenmatrix-time-select').value, 10) || 5;
  const totalSeconds = selectedMinutes * 60;
  figurenmatrixState.session = {
    startedAt: Date.now(),
    runMode: selectedMode,
    selectedMinutes,
    totalSeconds,
    remainingSeconds: totalSeconds,
    level: 3,
    correctStreak: 0,
    wrongStreak: 0,
    correct: 0,
    wrong: 0,
    total: 0,
    points: 0,
    rtSum: 0,
    rtCount: 0,
    errorStats: {},
    errorClassStats: {},
    trials: []
  };
  figurenmatrixState.taskCount = 0;
  figurenmatrixState.currentTask = null;
  showScreen('screen-figurenmatrix-exercise');
  setText('figurenmatrix-mode-label', selectedMode === 'practice' ? 'Uebung' : 'Test');
  setFigurenmatrixPracticeUi(selectedMode === 'practice', false);
  clearFigurenmatrixTimer();
  updateFigurenmatrixTimerDisplay();
  startModuleTimer(figurenmatrixState, 'figurenmatrix', finishFigurenmatrixExercise);
  renderFigurenmatrixTask();
}

function fmClassifyError(task, option, rtMs) {
  if (rtMs < 1500) return 'impulse';
  const violationKinds = option && option.violationKinds ? option.violationKinds : [];
  const activeKinds = task && task.ruleKinds ? task.ruleKinds : [];
  const overlap = violationKinds.filter(function(kind) { return activeKinds.indexOf(kind) >= 0; });
  if (!violationKinds.length) return 'hypothesis';
  if (activeKinds.length >= 2) {
    if (overlap.length >= 2 || violationKinds.length >= 2) return 'combination';
    if (overlap.length === 1) return 'applied';
    return 'hypothesis';
  }
  if (overlap.length === 1) return 'applied';
  return 'hypothesis';
}

function submitFigurenmatrixAnswer(optionIndex) {
  const session = figurenmatrixState.session;
  const task = figurenmatrixState.currentTask;
  if (!session || !task || task.answered) return;
  task.answered = true;

  const option = task.options[optionIndex];
  const isCorrect = !!(option && option.correct);
  const rtMs = Math.max(0, Date.now() - task.shownAt);
  const errorClass = isCorrect ? null : fmClassifyError(task, option, rtMs);
  let pointsDelta = -1;
  if (isCorrect) pointsDelta = rtMs < 10000 ? 2 : 1;

  session.total += 1;
  if (isCorrect) {
    session.correct += 1;
    session.correctStreak += 1;
    session.wrongStreak = 0;
    if (session.correctStreak >= 3) {
      session.level = Math.min(4, session.level + 1);
      session.correctStreak = 0;
    }
  } else {
    session.wrong += 1;
    session.wrongStreak += 1;
    session.correctStreak = 0;
    const errorType = option && option.errorType ? option.errorType : 'Regelverwechslung';
    session.errorStats[errorType] = (session.errorStats[errorType] || 0) + 1;
    session.errorClassStats[errorClass] = (session.errorClassStats[errorClass] || 0) + 1;
    if (session.wrongStreak >= 2) {
      session.level = Math.max(1, session.level - 1);
      session.wrongStreak = 0;
    }
  }

  session.points += pointsDelta;
  session.rtSum += rtMs;
  session.rtCount += 1;

  const correctIndex = task.options.findIndex(function(item) { return item.correct; });
  const correctLetter = correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : '-';
  const buttons = Array.from(document.querySelectorAll('#figurenmatrix-options .figmat-option'));
  buttons.forEach(function(button, index) {
    button.disabled = true;
    if (isFigurenmatrixPracticeMode()) {
      if (index === correctIndex) button.classList.add('correct');
      if (index === optionIndex && !isCorrect) button.classList.add('wrong');
    }
  });

  const accuracy = getAccuracyPercent(session.correct, session.total);
  const feedbackText = (isCorrect ? 'Richtig' : 'Falsch')
    + ` | Loesung: ${correctLetter}`
    + ` | Regel: ${task.ruleText}`
    + ` | RT: ${(rtMs / 1000).toFixed(2)} s`
    + ` | Punkte: ${pointsDelta >= 0 ? '+' : ''}${pointsDelta}`
    + `${errorClass ? ` | Fehlerklasse: ${FIGMAT_ERROR_CLASS_LABELS[errorClass] || errorClass}` : ''}`
    + `\n${task.explanation}`;
  if (isFigurenmatrixPracticeMode()) {
    const feedbackEl = document.getElementById('figurenmatrix-feedback');
    feedbackEl.textContent = feedbackText;
    feedbackEl.className = isCorrect ? 'feedback richtig' : 'feedback falsch';
    setFigurenmatrixPracticeUi(true, true);
  } else {
    setText('figurenmatrix-feedback', '');
    document.getElementById('figurenmatrix-feedback').className = 'feedback';
    setFigurenmatrixPracticeUi(false, false);
  }

  updateFigurenmatrixLiveStats(rtMs);

  session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'reasoning',
    reactionTimeMs: rtMs,
    correct: isCorrect,
    omitted: false,
    anticipated: rtMs < 1500,
    difficultyLevel: task.level,
    sequenceLength: null,
    mode: task.kind,
    blockLabel: task.ruleText,
    pointsDelta: pointsDelta,
    errorType: isCorrect ? null : (option && option.errorType ? option.errorType : 'Regelverwechslung'),
    errorClass: errorClass
  });

  if (isFigurenmatrixPracticeMode()) {
    return;
  }

  figurenmatrixState.advanceTimer = setTimeout(function() {
    figurenmatrixState.advanceTimer = null;
    if (!figurenmatrixState.session) return;
    renderFigurenmatrixTask();
  }, 220);
}

function continueFigurenmatrixAfterFeedback() {
  if (!figurenmatrixState.session || !isFigurenmatrixPracticeMode()) return;
  clearStateTimeout(figurenmatrixState, 'advanceTimer');
  renderFigurenmatrixTask();
}

function getFigurenmatrixAssessment(accuracyPct, avgRtMs) {
  if (accuracyPct >= 90 && avgRtMs !== null && avgRtMs < 8000) return 'deutlich ueberdurchschnittlich';
  if (accuracyPct >= 75) return 'ueberdurchschnittlich';
  if (accuracyPct >= 55) return 'durchschnittlich';
  return 'unterdurchschnittlich';
}

function finishFigurenmatrixExercise(timedOut) {
  clearFigurenmatrixTimer();
  if (!figurenmatrixState.session) {
    showScreen('screen-figurenmatrix-results');
    return;
  }

  const session = figurenmatrixState.session;
  const elapsedSec = getElapsedSeconds(session.startedAt, session.totalSeconds, !!timedOut);
  const accuracyPct = getAccuracyPercent(session.correct, session.total);
  const avgRtMs = session.rtCount > 0 ? Math.round(session.rtSum / session.rtCount) : null;

  const topRuleError = Object.keys(session.errorStats).sort(function(a, b) {
    return (session.errorStats[b] || 0) - (session.errorStats[a] || 0);
  })[0] || '-';
  const topErrorClassKey = Object.keys(session.errorClassStats || {}).sort(function(a, b) {
    return (session.errorClassStats[b] || 0) - (session.errorClassStats[a] || 0);
  })[0] || null;
  const topErrorClass = topErrorClassKey ? (FIGMAT_ERROR_CLASS_LABELS[topErrorClassKey] || topErrorClassKey) : '-';
  const topError = topErrorClass === '-' ? topRuleError : `${topErrorClass} (${topRuleError})`;
  const assessment = getFigurenmatrixAssessment(accuracyPct, avgRtMs);

  setTextEntries({
    'figurenmatrix-result-percent': `${accuracyPct}%`,
    'figurenmatrix-result-rt': avgRtMs === null ? '-' : `${(avgRtMs / 1000).toFixed(2)} s`,
    'figurenmatrix-result-points': String(session.points),
    'figurenmatrix-result-limit': formatTime(session.totalSeconds),
    'figurenmatrix-result-correct': String(session.correct),
    'figurenmatrix-result-wrong': String(session.wrong),
    'figurenmatrix-result-total': String(session.total),
    'figurenmatrix-result-error': topError,
    'figurenmatrix-result-assessment': assessment,
    'figurenmatrix-result-duration': formatTime(elapsedSec)
  });

  setResultInsight('figurenmatrix-result-insight', 'figurenmatrix', accuracyPct, { avgRt: avgRtMs });
  saveTrainingEntry({
    module: 'figurenmatrix',
    label: 'Figurenmatrizen',
    ...getRunModeEntryProps(session.runMode || 'test'),
    avgRt: avgRtMs,
    points: session.points,
    trials: session.trials,
    correct: session.correct,
    wrong: session.wrong,
    total: session.total,
    accuracy: accuracyPct,
    duration: elapsedSec,
    totalSeconds: session.totalSeconds,
    topError: topError,
    assessment: assessment
  });

  showScreen('screen-figurenmatrix-results');
}

function restartFigurenmatrixMode() {
  startFigurenmatrixExercise();
}

function openFigurenmatrixHome() {
  openModuleHome('figurenmatrix');
}

const OPERATORCHECK_OPERATORS = [
  { key: 'add', symbol: '+', label: 'Plus', calc: function(a, b) { return a + b; } },
  { key: 'sub', symbol: '-', label: 'Minus', calc: function(a, b) { return a - b; } },
  { key: 'mul', symbol: '*', label: 'Multiplikation', calc: function(a, b) { return a * b; } },
  { key: 'div', symbol: '/', label: 'Division', calc: function(a, b) { return b !== 0 ? a / b : NaN; } }
];

function operatorByKey(key) {
  return OPERATORCHECK_OPERATORS.find(function(op) { return op.key === key; }) || OPERATORCHECK_OPERATORS[0];
}

function pickOperatorForLevel(level) {
  if (level <= 1) return randomFrom(['add', 'sub']);
  if (level === 2) return randomFrom(['add', 'sub', 'mul']);
  return randomFrom(['add', 'sub', 'mul', 'div']);
}

function randomOperandPair(level, operatorKey) {
  const maxA = level <= 1 ? 30 : (level === 2 ? 60 : (level === 3 ? 120 : 180));
  const maxB = level <= 1 ? 20 : (level === 2 ? 35 : (level === 3 ? 50 : 70));
  const minA = level >= 4 ? 2 : 1;
  const minB = level >= 4 ? 2 : 1;

  if (operatorKey === 'div') {
    const divisor = fmRandInt(minB, Math.max(minB + 2, Math.min(maxB, 18)));
    const quotient = fmRandInt(2, level >= 3 ? 16 : 10);
    return { a: divisor * quotient, b: divisor };
  }

  if (operatorKey === 'mul') {
    return { a: fmRandInt(minA, Math.min(maxA, level >= 3 ? 24 : 14)), b: fmRandInt(minB, Math.min(maxB, level >= 3 ? 18 : 12)) };
  }

  const a = fmRandInt(minA, maxA);
  const bMax = Math.min(maxB, level >= 4 ? maxB : a + 2);
  const b = fmRandInt(minB, Math.max(minB, bMax));
  return { a: a, b: b };
}

function buildOperatorcheckTask(level) {
  for (let tries = 0; tries < 120; tries++) {
    const operatorKey = pickOperatorForLevel(level);
    const pair = randomOperandPair(level, operatorKey);
    const operator = operatorByKey(operatorKey);
    const result = operator.calc(pair.a, pair.b);
    if (!Number.isFinite(result)) continue;
    if (Math.abs(result) > 999) continue;
    if (operatorKey === 'sub' && level <= 2 && result < 0) continue;
    if (operatorKey !== 'div' && Math.abs(result % 1) > 0.0001) continue;

    const validKeys = OPERATORCHECK_OPERATORS.filter(function(candidate) {
      const candidateResult = candidate.calc(pair.a, pair.b);
      return Number.isFinite(candidateResult) && Math.abs(candidateResult - result) < 0.0001;
    }).map(function(candidate) { return candidate.key; });
    if (validKeys.length !== 1) continue;

    return {
      a: pair.a,
      b: pair.b,
      result: result,
      operatorKey: operatorKey,
      operatorSymbol: operator.symbol,
      level: level,
      shownAt: Date.now(),
      answered: false
    };
  }

  return {
    a: 12,
    b: 3,
    result: 4,
    operatorKey: 'div',
    operatorSymbol: '/',
    level: level,
    shownAt: Date.now(),
    answered: false
  };
}

function updateOperatorcheckLiveStats(lastRtMs) {
  const session = operatorcheckState.session;
  if (!session) return;
  const pct = getAccuracyPercent(session.correct, session.total);
  setTextEntries({
    'operatorcheck-last-rt': lastRtMs === null ? '-' : `${(lastRtMs / 1000).toFixed(2)} s`,
    'operatorcheck-live-acc': `${pct}%`,
    'operatorcheck-live-points': String(session.points)
  });
}

function isOperatorcheckPracticeMode() {
  return isPracticeModeForModule(operatorcheckState);
}

function setOperatorcheckPracticeUi(showFeedback, showNextButton) {
  setPracticeModeUi('operatorcheck', showFeedback, showNextButton);
}

function updateOperatorcheckTimerDisplay() {
  if (!operatorcheckState.session) return;
  updateModuleTimer('operatorcheck', operatorcheckState.session);
}

function renderOperatorcheckTask() {
  const session = operatorcheckState.session;
  if (!session) return;
  clearStateTimeout(operatorcheckState, 'advanceTimer');

  if (session.remainingSeconds <= 0) {
    finishOperatorcheckExercise(true);
    return;
  }

  const task = buildOperatorcheckTask(session.level);
  task.shownAt = Date.now();
  task.answered = false;
  operatorcheckState.currentTask = task;
  operatorcheckState.taskCount += 1;

  setTextEntries({
    'operatorcheck-progress': String(operatorcheckState.taskCount),
    'operatorcheck-level': String(session.level),
    'operatorcheck-expression': `${task.a} ? ${task.b} = ${task.result}`
  });

  const optionsEl = document.getElementById('operatorcheck-options');
  optionsEl.innerHTML = '';
  OPERATORCHECK_OPERATORS.forEach(function(op) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'operatorcheck-option';
    button.textContent = op.symbol;
    button.setAttribute('aria-label', op.label);
    button.addEventListener('click', function() {
      submitOperatorcheckAnswer(op.key);
    });
    optionsEl.appendChild(button);
  });

  setText('operatorcheck-feedback', '');
  document.getElementById('operatorcheck-feedback').className = 'feedback';
  setOperatorcheckPracticeUi(isOperatorcheckPracticeMode(), false);
  updateOperatorcheckLiveStats(null);
}

function startOperatorcheckExercise() {
  const selectedMode = document.getElementById('operatorcheck-mode-select').value === 'practice' ? 'practice' : 'test';
  const selectedMinutes = parseInt(document.getElementById('operatorcheck-time-select').value, 10) || 5;
  const totalSeconds = selectedMinutes * 60;
  operatorcheckState.session = {
    startedAt: Date.now(),
    runMode: selectedMode,
    selectedMinutes: selectedMinutes,
    totalSeconds: totalSeconds,
    remainingSeconds: totalSeconds,
    level: 2,
    correctStreak: 0,
    wrongStreak: 0,
    correct: 0,
    wrong: 0,
    total: 0,
    points: 0,
    rtSum: 0,
    rtCount: 0,
    errorStats: {},
    trials: []
  };
  operatorcheckState.taskCount = 0;
  operatorcheckState.currentTask = null;

  showScreen('screen-operatorcheck-exercise');
  setText('operatorcheck-mode-label', selectedMode === 'practice' ? 'Uebung' : 'Test');
  setOperatorcheckPracticeUi(selectedMode === 'practice', false);
  clearOperatorcheckTimer();
  updateOperatorcheckTimerDisplay();
  startModuleTimer(operatorcheckState, 'operatorcheck', finishOperatorcheckExercise);
  renderOperatorcheckTask();
}

function operatorcheckErrorType(expectedKey, selectedKey) {
  if (!selectedKey) return 'Auslassung';
  if (expectedKey === selectedKey) return null;
  if ((expectedKey === 'add' && selectedKey === 'sub') || (expectedKey === 'sub' && selectedKey === 'add')) {
    return 'Plus/Minus-Verwechslung';
  }
  if ((expectedKey === 'mul' && selectedKey === 'div') || (expectedKey === 'div' && selectedKey === 'mul')) {
    return 'Mal/Geteilt-Verwechslung';
  }
  return 'Regelverwechslung';
}

function submitOperatorcheckAnswer(operatorKey) {
  const session = operatorcheckState.session;
  const task = operatorcheckState.currentTask;
  if (!session || !task || task.answered) return;
  task.answered = true;

  const isCorrect = operatorKey === task.operatorKey;
  const rtMs = Math.max(0, Date.now() - task.shownAt);
  const pointsDelta = isCorrect ? (rtMs < 6000 ? 2 : 1) : -1;

  session.total += 1;
  if (isCorrect) {
    session.correct += 1;
    session.correctStreak += 1;
    session.wrongStreak = 0;
    if (session.correctStreak >= 3) {
      session.level = Math.min(4, session.level + 1);
      session.correctStreak = 0;
    }
  } else {
    session.wrong += 1;
    session.wrongStreak += 1;
    session.correctStreak = 0;
    const err = operatorcheckErrorType(task.operatorKey, operatorKey);
    session.errorStats[err] = (session.errorStats[err] || 0) + 1;
    if (session.wrongStreak >= 2) {
      session.level = Math.max(1, session.level - 1);
      session.wrongStreak = 0;
    }
  }

  session.points += pointsDelta;
  session.rtSum += rtMs;
  session.rtCount += 1;

  const buttons = Array.from(document.querySelectorAll('#operatorcheck-options .operatorcheck-option'));
  buttons.forEach(function(button) {
    button.disabled = true;
    if (button.textContent === task.operatorSymbol && isOperatorcheckPracticeMode()) button.classList.add('correct');
    if (!isCorrect && button.textContent === operatorByKey(operatorKey).symbol && isOperatorcheckPracticeMode()) button.classList.add('wrong');
  });

  const errType = operatorcheckErrorType(task.operatorKey, operatorKey);
  if (isOperatorcheckPracticeMode()) {
    const feedbackText = (isCorrect ? 'Richtig' : 'Falsch')
      + ` | Loesung: ${task.operatorSymbol}`
      + ` | RT: ${(rtMs / 1000).toFixed(2)} s`
      + ` | Punkte: ${pointsDelta >= 0 ? '+' : ''}${pointsDelta}`
      + `${errType ? ` | Fehler: ${errType}` : ''}`
      + `\n${task.a} ${task.operatorSymbol} ${task.b} = ${task.result}`;
    const feedbackEl = document.getElementById('operatorcheck-feedback');
    feedbackEl.textContent = feedbackText;
    feedbackEl.className = isCorrect ? 'feedback richtig' : 'feedback falsch';
    setOperatorcheckPracticeUi(true, true);
  } else {
    setText('operatorcheck-feedback', '');
    document.getElementById('operatorcheck-feedback').className = 'feedback';
    setOperatorcheckPracticeUi(false, false);
  }

  updateOperatorcheckLiveStats(rtMs);

  session.trials.push({
    timestamp: new Date().toISOString(),
    kind: 'arithmetic',
    reactionTimeMs: rtMs,
    correct: isCorrect,
    omitted: false,
    anticipated: rtMs < 1200,
    difficultyLevel: task.level,
    sequenceLength: null,
    mode: session.runMode,
    blockLabel: task.operatorSymbol,
    pointsDelta: pointsDelta,
    errorType: isCorrect ? null : errType
  });

  if (isOperatorcheckPracticeMode()) return;

  operatorcheckState.advanceTimer = setTimeout(function() {
    operatorcheckState.advanceTimer = null;
    if (!operatorcheckState.session) return;
    renderOperatorcheckTask();
  }, 220);
}

function continueOperatorcheckAfterFeedback() {
  if (!operatorcheckState.session || !isOperatorcheckPracticeMode()) return;
  clearStateTimeout(operatorcheckState, 'advanceTimer');
  renderOperatorcheckTask();
}

function getOperatorcheckAssessment(accuracyPct, avgRtMs) {
  if (accuracyPct >= 90 && avgRtMs !== null && avgRtMs < 5500) return 'deutlich ueberdurchschnittlich';
  if (accuracyPct >= 75) return 'ueberdurchschnittlich';
  if (accuracyPct >= 55) return 'durchschnittlich';
  return 'unterdurchschnittlich';
}

function finishOperatorcheckExercise(timedOut) {
  clearOperatorcheckTimer();
  if (!operatorcheckState.session) {
    showScreen('screen-operatorcheck-results');
    return;
  }

  const session = operatorcheckState.session;
  const elapsedSec = getElapsedSeconds(session.startedAt, session.totalSeconds, !!timedOut);
  const accuracyPct = getAccuracyPercent(session.correct, session.total);
  const avgRtMs = session.rtCount > 0 ? Math.round(session.rtSum / session.rtCount) : null;
  const topError = Object.keys(session.errorStats).sort(function(a, b) {
    return (session.errorStats[b] || 0) - (session.errorStats[a] || 0);
  })[0] || '-';
  const assessment = getOperatorcheckAssessment(accuracyPct, avgRtMs);

  setTextEntries({
    'operatorcheck-result-percent': `${accuracyPct}%`,
    'operatorcheck-result-rt': avgRtMs === null ? '-' : `${(avgRtMs / 1000).toFixed(2)} s`,
    'operatorcheck-result-points': String(session.points),
    'operatorcheck-result-limit': formatTime(session.totalSeconds),
    'operatorcheck-result-correct': String(session.correct),
    'operatorcheck-result-wrong': String(session.wrong),
    'operatorcheck-result-total': String(session.total),
    'operatorcheck-result-error': topError,
    'operatorcheck-result-assessment': assessment,
    'operatorcheck-result-duration': formatTime(elapsedSec)
  });

  setResultInsight('operatorcheck-result-insight', 'operatorcheck', accuracyPct, { avgRt: avgRtMs });
  saveTrainingEntry({
    module: 'operatorcheck',
    label: 'Operatoren-Check',
    ...getRunModeEntryProps(session.runMode || 'test'),
    avgRt: avgRtMs,
    points: session.points,
    trials: session.trials,
    correct: session.correct,
    wrong: session.wrong,
    total: session.total,
    accuracy: accuracyPct,
    duration: elapsedSec,
    totalSeconds: session.totalSeconds,
    topError: topError,
    assessment: assessment
  });

  showScreen('screen-operatorcheck-results');
}

function restartOperatorcheckMode() {
  startOperatorcheckExercise();
}

function openOperatorcheckHome() {
  openModuleHome('operatorcheck');
}

const LEADERSHIP_DIMENSIONS = {
  leadership: 'Führungsverhalten',
  decisions: 'Entscheidungsfähigkeit',
  integrity: 'Integrität',
  stress: 'Stressresistenz',
  impulse: 'Impulskontrolle',
  social: 'Soziale Kompetenz',
  reflection: 'Selbstreflexion',
  responsibility: 'Verantwortungsbewusstsein'
};

const LEADERSHIP_ITEMS = [
  { id: 1, d: 'leadership', t: 'Ich treffe Entscheidungen auch dann, wenn Informationen unvollständig sind.' },
  { id: 2, d: 'leadership', t: 'Ich vermeide es, Verantwortung für Entscheidungen zu übernehmen.', r: true },
  { id: 3, d: 'leadership', t: 'In unklaren Lagen gebe ich meinem Team eine klare Richtung.' },
  { id: 4, d: 'leadership', t: 'Ich warte meist, bis andere die Führung übernehmen.', r: true },
  { id: 5, d: 'leadership', t: 'Ich delegiere Aufgaben passend zu den Stärken der Teammitglieder.' },
  { id: 6, d: 'leadership', t: 'Wenn eine Entscheidung unpopulär ist, schiebe ich sie lieber weiter.', r: true },

  { id: 7, d: 'decisions', t: 'Unter Druck kann ich klare Prioritäten setzen.' },
  { id: 8, d: 'decisions', t: 'Ich neige dazu, Entscheidungen hinauszuzögern.', r: true },
  { id: 9, d: 'decisions', t: 'In zeitkritischen Situationen entscheide ich auf Basis der besten verfügbaren Informationen.' },
  { id: 10, d: 'decisions', t: 'Ich verliere mich in Details und komme nicht zum Entscheidungspunkt.', r: true },
  { id: 11, d: 'decisions', t: 'Auch bei widersprüchlichen Informationen finde ich handlungsfähige Lösungen.' },
  { id: 12, d: 'decisions', t: 'Ich ändere Entscheidungen häufig, ohne dass neue Fakten vorliegen.', r: true },

  { id: 13, d: 'integrity', t: 'Ich halte Regeln ein, auch wenn ich dadurch Nachteile habe.' },
  { id: 14, d: 'integrity', t: 'In Ausnahmesituationen sind Regelverstöße akzeptabel.', r: true, c: true },
  { id: 15, d: 'integrity', t: 'Ich spreche Probleme offen an, auch wenn es unbequem ist.' },
  { id: 16, d: 'integrity', t: 'Ich passe Standards an, wenn mich niemand kontrolliert.', r: true, c: true },
  { id: 17, d: 'integrity', t: 'Vertrauliche Informationen behandle ich strikt verantwortungsvoll.' },
  { id: 18, d: 'integrity', t: 'Zielerreichung rechtfertigt gelegentlich unfaire Mittel.', r: true, c: true },

  { id: 19, d: 'stress', t: 'Auch in belastenden Situationen bleibe ich handlungsfähig.' },
  { id: 20, d: 'stress', t: 'Unter Stress reagiere ich emotionaler als sonst.', r: true },
  { id: 21, d: 'stress', t: 'Bei hoher Arbeitslast bleibe ich strukturiert.' },
  { id: 22, d: 'stress', t: 'In akuten Drucksituationen blockiere ich eher.', r: true },
  { id: 23, d: 'stress', t: 'Nach Rückschlägen kann ich mich schnell neu fokussieren.' },
  { id: 24, d: 'stress', t: 'In Konfliktlagen verliere ich schnell die Nerven.', r: true },

  { id: 25, d: 'impulse', t: 'Ich überlege die Konsequenzen meines Handelns im Voraus.' },
  { id: 26, d: 'impulse', t: 'Ich handle manchmal spontan und korrigiere erst danach.', r: true },
  { id: 27, d: 'impulse', t: 'Bevor ich reagiere, prüfe ich Handlungsalternativen.' },
  { id: 28, d: 'impulse', t: 'Wenn ich mich angegriffen fühle, antworte ich sofort.', r: true },
  { id: 29, d: 'impulse', t: 'Ich kann kurzfristige Impulse zugunsten langfristiger Ziele zurückstellen.' },
  { id: 30, d: 'impulse', t: 'Ich unterbreche andere häufig, wenn ich eine Idee habe.', r: true },

  { id: 31, d: 'social', t: 'Ich kann mich in die Perspektive anderer hineinversetzen.' },
  { id: 32, d: 'social', t: 'Ich setze mich durch, auch wenn es zu Konflikten kommt.' },
  { id: 33, d: 'social', t: 'Ich höre aktiv zu, bevor ich entscheide.' },
  { id: 34, d: 'social', t: 'Ich vermeide Konfrontation, selbst wenn Klärung nötig ist.', r: true },
  { id: 35, d: 'social', t: 'Ich gebe Feedback klar und respektvoll.' },
  { id: 36, d: 'social', t: 'In Diskussionen übergehe ich Gegenargumente häufig.', r: true },

  { id: 37, d: 'reflection', t: 'Ich hinterfrage meine Entscheidungen im Nachhinein kritisch.' },
  { id: 38, d: 'reflection', t: 'Ich bin selten im Unrecht.', r: true, c: true, sd: true },
  { id: 39, d: 'reflection', t: 'Ich suche aktiv Rückmeldung zu meinem Führungsverhalten.' },
  { id: 40, d: 'reflection', t: 'Fehler sehe ich eher als Lernchance denn als Bedrohung.' },
  { id: 41, d: 'reflection', t: 'Ich reflektiere, wie mein Verhalten auf andere wirkt.' },
  { id: 42, d: 'reflection', t: 'Ich mache nie Fehler.', r: true, c: true, sd: true },

  { id: 43, d: 'responsibility', t: 'Ich fühle mich für die Konsequenzen meiner Entscheidungen verantwortlich.' },
  { id: 44, d: 'responsibility', t: 'Fehler entstehen meist durch andere.', r: true, c: true },
  { id: 45, d: 'responsibility', t: 'Ich übernehme Verantwortung auch dann, wenn das Ergebnis negativ ist.' },
  { id: 46, d: 'responsibility', t: 'Ich schiebe unangenehme Aufgaben auf andere ab.', r: true },
  { id: 47, d: 'responsibility', t: 'Ich sichere ab, dass Zusagen zuverlässig eingehalten werden.' },
  { id: 48, d: 'responsibility', t: 'Ich entscheide immer richtig.', r: true, c: true, sd: true }
];

const LEADERSHIP_CONSISTENCY_PAIRS = [
  [1, 2], [3, 4], [7, 8], [13, 14], [19, 20], [25, 26], [31, 34], [37, 38], [43, 44], [45, 46]
];

function openLeadershipHome() {
  openModuleHome('leadership');
}

function startLeadershipExercise() {
  const totalSeconds = 25 * 60;
  leadershipState.session = {
    startedAt: Date.now(),
    totalSeconds: totalSeconds,
    remainingSeconds: totalSeconds,
    itemIndex: 0,
    answers: [],
    rtFastCount: 0,
    rtSlowCount: 0
  };
  leadershipState.currentTask = null;
  leadershipState.taskCount = 0;
  showScreen('screen-leadership-exercise');
  clearLeadershipTimer();
  updateModuleTimer('leadership', leadershipState.session);
  startModuleTimer(leadershipState, 'leadership', finishLeadershipExercise);
  renderLeadershipQuestion();
}

function renderLeadershipQuestion() {
  const session = leadershipState.session;
  if (!session) return;
  if (session.itemIndex >= LEADERSHIP_ITEMS.length) {
    finishLeadershipExercise(false);
    return;
  }

  const item = LEADERSHIP_ITEMS[session.itemIndex];
  leadershipState.currentTask = {
    itemId: item.id,
    shownAt: Date.now(),
    answered: false
  };

  setTextEntries({
    'leadership-question-counter': `Frage ${session.itemIndex + 1} / ${LEADERSHIP_ITEMS.length}`,
    'leadership-question-text': item.t
  });

  const progressPct = ((session.itemIndex) / LEADERSHIP_ITEMS.length) * 100;
  const bar = document.getElementById('leadership-progress-bar');
  if (bar) bar.style.width = `${Math.max(3, progressPct)}%`;
  setText('leadership-rt-hint', '');
  document.getElementById('leadership-rt-hint').className = 'feedback';
}

function submitLeadershipAnswer(value) {
  const session = leadershipState.session;
  if (!session || !leadershipState.currentTask || leadershipState.currentTask.answered) return;
  const normalized = parseInt(value, 10);
  if (normalized < 1 || normalized > 5) return;

  const item = LEADERSHIP_ITEMS[session.itemIndex];
  const rtMs = Math.max(0, Date.now() - leadershipState.currentTask.shownAt);
  leadershipState.currentTask.answered = true;

  if (rtMs < 1000) session.rtFastCount++;
  if (rtMs > 15000) session.rtSlowCount++;

  session.answers.push({
    itemId: item.id,
    dimension: item.d,
    value: normalized,
    score: item.r ? (6 - normalized) : normalized,
    rtMs: rtMs,
    reverse: !!item.r,
    critical: !!item.c,
    sd: !!item.sd
  });

  session.itemIndex++;
  leadershipState.taskCount = session.itemIndex;

  if (session.itemIndex >= LEADERSHIP_ITEMS.length) {
    finishLeadershipExercise(false);
    return;
  }

  if (rtMs < 1000) {
    setImmediateFeedback('leadership-rt-hint', session, 'Hinweis: sehr schnelle Antwort (< 1s) erkannt.', 'falsch');
  } else if (rtMs > 15000) {
    setImmediateFeedback('leadership-rt-hint', session, 'Hinweis: sehr lange Antwortzeit (> 15s) erkannt.', 'richtig');
  }

  setTimeout(renderLeadershipQuestion, 90);
}

function leadershipMean(values) {
  if (!values || !values.length) return null;
  return values.reduce(function(sum, value) { return sum + value; }, 0) / values.length;
}

function leadershipClassifyScale(value) {
  if (value === null) return '-';
  if (value <= 2.4) return 'niedrig';
  if (value <= 3.4) return 'durchschnittlich';
  return 'hoch';
}

function leadershipFormatScale(value) {
  if (value === null) return '-';
  return `${value.toFixed(2)} (${leadershipClassifyScale(value)})`;
}

function evaluateLeadershipSession(session) {
  const byItemId = {};
  session.answers.forEach(function(answer) {
    byItemId[answer.itemId] = answer;
  });

  const dimensionScores = {};
  Object.keys(LEADERSHIP_DIMENSIONS).forEach(function(key) {
    const scores = session.answers
      .filter(function(answer) { return answer.dimension === key; })
      .map(function(answer) { return answer.score; });
    dimensionScores[key] = leadershipMean(scores);
  });

  const rtValues = session.answers.map(function(answer) { return answer.rtMs; });
  const avgRt = leadershipMean(rtValues);
  const rawValues = session.answers.map(function(answer) { return answer.value; });
  const rawMean = leadershipMean(rawValues) || 0;
  const variance = rawValues.length
    ? rawValues.reduce(function(sum, value) { return sum + Math.pow(value - rawMean, 2); }, 0) / rawValues.length
    : 0;

  const consistencyDiffs = [];
  let contradictionCount = 0;
  LEADERSHIP_CONSISTENCY_PAIRS.forEach(function(pair) {
    const first = byItemId[pair[0]];
    const second = byItemId[pair[1]];
    if (!first || !second) return;
    const diff = Math.abs(first.value - (6 - second.value));
    consistencyDiffs.push(diff);
    if (diff >= 3) contradictionCount++;
  });

  const consistencyMean = leadershipMean(consistencyDiffs) || 0;
  const consistencyIndex = Math.max(0, Math.min(100, Math.round(100 - (consistencyMean / 4) * 100)));
  const sdHigh = session.answers.filter(function(answer) { return answer.sd && answer.value >= 4; }).length;
  const criticalHigh = session.answers.filter(function(answer) { return answer.critical && answer.value >= 4; }).length;
  const endpointCount = rawValues.filter(function(value) { return value === 1 || value === 5; }).length;
  const uniqueRaw = Array.from(new Set(rawValues));
  const onlyExtreme = uniqueRaw.length === 1 && (uniqueRaw[0] === 1 || uniqueRaw[0] === 5);
  const endpointRatio = rawValues.length ? Math.round((endpointCount / rawValues.length) * 100) : 0;

  const overallMean = leadershipMean(Object.keys(dimensionScores).map(function(key) { return dimensionScores[key] || 0; })) || 0;
  let adjustedScore = overallMean;
  if (consistencyIndex < 60) adjustedScore -= 0.4;
  if (sdHigh >= 2) adjustedScore -= 0.25;
  if (onlyExtreme) adjustedScore -= 0.3;
  if (session.rtFastCount >= 12 || session.rtSlowCount >= 12) adjustedScore -= 0.2;

  let suitability = 'gut geeignet für Führungsaufgaben';
  if (adjustedScore < 2.6) suitability = 'eingeschränkt geeignet';
  else if (adjustedScore < 3.3) suitability = 'bedingt geeignet';
  else if (adjustedScore < 4.1) suitability = 'geeignet';

  return {
    dimensionScores: dimensionScores,
    avgRt: avgRt,
    variance: variance,
    consistencyIndex: consistencyIndex,
    contradictions: contradictionCount,
    sdHigh: sdHigh,
    criticalHigh: criticalHigh,
    endpointRatio: endpointRatio,
    onlyExtreme: onlyExtreme,
    overallMean: overallMean,
    suitability: suitability,
    rtFastCount: session.rtFastCount,
    rtSlowCount: session.rtSlowCount
  };
}

function leadershipListFromItems(items, fallbackText) {
  if (!items.length) return fallbackText;
  return '<ul style="margin:0; padding-left:18px;">' + items.map(function(item) {
    return `<li>${item}</li>`;
  }).join('') + '</ul>';
}

function finishLeadershipExercise(timedOut) {
  clearLeadershipTimer();
  if (!leadershipState.session) {
    showScreen('screen-leadership-results');
    return;
  }

  const session = leadershipState.session;
  if (!session.answers.length) {
    showScreen('screen-leadership-home');
    return;
  }

  const report = evaluateLeadershipSession(session);

  setTextEntries({
    'leadership-overall-score': report.overallMean.toFixed(2),
    'leadership-avg-rt': report.avgRt === null ? '-' : `${(report.avgRt / 1000).toFixed(2)} s`,
    'leadership-consistency': `${report.consistencyIndex}/100`,
    'leadership-variance': report.variance.toFixed(2),
    'leadership-score-leadership': leadershipFormatScale(report.dimensionScores.leadership),
    'leadership-score-decisions': leadershipFormatScale(report.dimensionScores.decisions),
    'leadership-score-integrity': leadershipFormatScale(report.dimensionScores.integrity),
    'leadership-score-stress': leadershipFormatScale(report.dimensionScores.stress),
    'leadership-score-impulse': leadershipFormatScale(report.dimensionScores.impulse),
    'leadership-score-social': leadershipFormatScale(report.dimensionScores.social),
    'leadership-score-reflection': leadershipFormatScale(report.dimensionScores.reflection),
    'leadership-score-responsibility': leadershipFormatScale(report.dimensionScores.responsibility)
  });

  const ranked = Object.keys(report.dimensionScores)
    .map(function(key) { return { key: key, value: report.dimensionScores[key] || 0, label: LEADERSHIP_DIMENSIONS[key] }; })
    .sort(function(a, b) { return b.value - a.value; });
  const strengths = ranked.filter(function(item) { return item.value >= 3.5; }).slice(0, 3).map(function(item) {
    return `${item.label} (${item.value.toFixed(2)})`;
  });
  const development = ranked.slice().reverse().filter(function(item) { return item.value <= 3.4; }).slice(0, 3).map(function(item) {
    return `${item.label} (${item.value.toFixed(2)})`;
  });

  const validityNotes = [];
  if (report.contradictions > 0) validityNotes.push(`${report.contradictions} auffällige Widerspruchspaare in den Konsistenzchecks.`);
  if (report.sdHigh >= 2) validityNotes.push('leichte bis deutliche Tendenz zu sozial erwünschten Antworten.');
  if (report.onlyExtreme || report.endpointRatio >= 85) validityNotes.push('Extremantwortmuster (starker Fokus auf Skalenenden) erkannt.');
  validityNotes.push(`RT-Muster: ${report.rtFastCount}x < 1s, ${report.rtSlowCount}x > 15s.`);
  if (report.criticalHigh >= 3) validityNotes.push('Erhöhte Zustimmung bei kritischen Aussagen (Regel- und Verantwortungsrisiko).');

  const empathy = leadershipMean([
    (session.answers.find(function(item) { return item.itemId === 31; }) || {}).score || 0,
    (session.answers.find(function(item) { return item.itemId === 33; }) || {}).score || 0,
    (session.answers.find(function(item) { return item.itemId === 35; }) || {}).score || 0
  ]);
  const assertiveness = leadershipMean([
    (session.answers.find(function(item) { return item.itemId === 32; }) || {}).score || 0,
    (session.answers.find(function(item) { return item.itemId === 34; }) || {}).score || 0,
    (session.answers.find(function(item) { return item.itemId === 36; }) || {}).score || 0
  ]);

  const balanceText = Math.abs((assertiveness || 0) - (empathy || 0)) <= 0.6
    ? 'Die Balance zwischen Durchsetzung und Empathie wirkt ausgeglichen.'
    : ((assertiveness || 0) > (empathy || 0)
      ? 'Die Durchsetzung ist stärker ausgeprägt als die Empathie.'
      : 'Die Empathie ist stärker ausgeprägt als die Durchsetzung.');

  const overallText = [
    `Entscheidungsstärke unter Unsicherheit: ${leadershipClassifyScale(report.dimensionScores.decisions)}.`,
    `Umgang mit Verantwortung: ${leadershipClassifyScale(report.dimensionScores.responsibility)}.`,
    `Verhalten unter Stress: ${leadershipClassifyScale(report.dimensionScores.stress)}.`,
    balanceText,
    `Risiko für impulsives oder vermeidendes Verhalten: ${report.dimensionScores.impulse >= 3.5 ? 'niedrig bis moderat' : 'erhöht'}.`,
    `Orientierende Klassifikation: ${report.suitability}.`,
    'Hinweis: Dieses Ergebnis ist ein Entwicklungsfeedback und keine klinische Diagnose oder alleinige Eignungsentscheidung.'
  ].join(' ');

  document.getElementById('leadership-strengths').innerHTML = leadershipListFromItems(
    strengths,
    'Keine klaren Hochbereiche. Das Profil wirkt überwiegend ausgeglichen.'
  );
  document.getElementById('leadership-development').innerHTML = leadershipListFromItems(
    development,
    'Keine klaren Niedrigbereiche. Es zeigen sich aktuell keine dominanten Entwicklungsfelder.'
  );
  document.getElementById('leadership-validity').innerHTML = leadershipListFromItems(validityNotes, 'Keine auffälligen Validitätshinweise.');
  setText('leadership-overall-classification', overallText);

  if (timedOut) {
    setText('leadership-rt-hint', 'Die Gesamtzeit ist abgelaufen, die bisherigen Antworten wurden ausgewertet.');
  }

  showScreen('screen-leadership-results');
}

function restartLeadershipMode() {
  startLeadershipExercise();
}

function resetLeadershipAnswers() {
  startLeadershipExercise();
}



