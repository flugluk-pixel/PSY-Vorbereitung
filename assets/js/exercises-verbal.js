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

  startModuleTimer(pqscanState, 'pqscan', function() {
    if (pqscanState.currentTask && !pqscanState.currentTask.answered) {
      submitPQScanBoard(true, true);
      return;
    }
    finishPQScanExercise(true);
  });

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
  if (showResultScreenIfSessionMissing(pqscanState, 'screen-pqscan-results')) return;

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

