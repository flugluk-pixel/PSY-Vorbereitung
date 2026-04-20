// ─── Training Log ─────────────────────────────────────────────────────────────
const TRAINING_LOG_KEY = 'psy_vorbereitung_log';
const AppCopy = window.TrainingAppCopy || {};
const DashboardCopy = AppCopy.dashboard || {};
const DASHBOARD_MODULE_META = {
  speed: { label: 'Speed-Rechnen', openHandler: 'openSpeedHome', badgeId: 'dash-status-speed', moduleKeys: ['speed'] },
  math: { label: 'Kopfrechnen 1-4 Stellen', openHandler: 'openMathHome', badgeId: 'dash-status-math', moduleKeys: ['math_add', 'math_sub', 'math_mul', 'math_mix'] },
  nback: { label: '2-Back', openHandler: 'openNbackHome', badgeId: 'dash-status-nback', moduleKeys: ['nback'] },
  digitspan: { label: 'Digit Span', openHandler: 'openDigitSpanHome', badgeId: 'dash-status-digitspan', moduleKeys: ['digitspan'] },
  gonogo: { label: 'Go / No-Go', openHandler: 'openGoNoGoHome', badgeId: 'dash-status-gonogo', moduleKeys: ['gonogo'] },
  stroop: { label: 'Stroop', openHandler: 'openStroopHome', badgeId: 'dash-status-stroop', moduleKeys: ['stroop'] },
  flanker: { label: 'Flanker', openHandler: 'openFlankerHome', badgeId: 'dash-status-flanker', moduleKeys: ['flanker'] },
  pqscan: { label: 'P/Q-Scanner', openHandler: 'openPQScanHome', badgeId: 'dash-status-pqscan', moduleKeys: ['pqscan'] },
  concentration: { label: 'Konzentration', openHandler: 'openConcentrationHome', badgeId: 'dash-status-concentration', moduleKeys: ['concentration'] },
  spatial: { label: 'Würfel zählen', openHandler: 'openSpatialHome', badgeId: 'dash-status-spatial', moduleKeys: ['spatial'] },
  rotation: { label: 'Rotations-Übung', openHandler: 'openRotationHome', badgeId: 'dash-status-rotation', moduleKeys: ['spatial_views'] },
  formen: { label: 'Formen vergleichen', openHandler: 'openFormenHome', badgeId: 'dash-status-formen', moduleKeys: ['formen'] },
  visualsearch: { label: 'Zielreiz finden', openHandler: 'openVisualSearchHome', badgeId: 'dash-status-visualsearch', moduleKeys: ['visual_search'] },
  sequence: { label: 'Zahlenreihen', openHandler: 'openSequenceHome', badgeId: 'dash-status-sequence', moduleKeys: ['sequence'] },
  multitasking: { label: 'Multitasking', openHandler: 'openMultitaskHome', badgeId: 'dash-status-multitasking', moduleKeys: ['multitasking'] }
};
const DASHBOARD_QUICK_CARD_SLOTS = DashboardCopy.quickCardSlots || [];
const DASHBOARD_SECTION_DEFS = DashboardCopy.sectionDefs || [];
const RESULT_SCREEN_FOOTER_DEFS = {
  speed: {
    insightId: 'res-insight',
    buttons: [
      { label: (DashboardCopy.resultButtons || {}).newGame || '↻ Neues Spiel', className: 'btn btn-primary', handler: 'backToStart' },
      { label: (DashboardCopy.resultButtons || {}).export || '↓ Exportieren', className: 'btn btn-success', handler: 'exportStats' }
    ]
  },
  math: {
    insightId: 'math-result-insight',
    buttons: [
      { label: (DashboardCopy.resultButtons || {}).replay || 'Nochmal starten', className: 'btn btn-primary', handler: 'restartMathMode' },
      { label: (DashboardCopy.resultButtons || {}).backToDashboard || 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  spatial: {
    insightId: 'spatial-result-insight',
    buttons: [
      { label: (DashboardCopy.resultButtons || {}).replay || 'Nochmal starten', className: 'btn btn-primary', handler: 'restartSpatialMode' },
      { label: (DashboardCopy.resultButtons || {}).backToDashboard || 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  nback: {
    insightId: 'nback-result-insight',
    buttons: [
      { label: (DashboardCopy.resultButtons || {}).replay || 'Nochmal starten', className: 'btn btn-primary', handler: 'restartNbackMode' },
      { label: (DashboardCopy.resultButtons || {}).backToDashboard || 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  gonogo: {
    insightId: 'gonogo-result-insight',
    buttons: [
      { label: (DashboardCopy.resultButtons || {}).replay || 'Nochmal starten', className: 'btn btn-primary', handler: 'restartGoNoGoMode' },
      { label: (DashboardCopy.resultButtons || {}).backToDashboard || 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  stroop: {
    insightId: 'stroop-result-insight',
    buttons: [
      { label: (DashboardCopy.resultButtons || {}).replay || 'Nochmal starten', className: 'btn btn-primary', handler: 'restartStroopMode' },
      { label: (DashboardCopy.resultButtons || {}).backToDashboard || 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  sequence: {
    insightId: 'sequence-result-insight',
    buttons: [
      { label: (DashboardCopy.resultButtons || {}).replay || 'Nochmal starten', className: 'btn btn-primary', handler: 'restartSequenceMode' },
      { label: (DashboardCopy.resultButtons || {}).backToDashboard || 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  rotation: {
    insightId: 'rotation-result-insight',
    buttons: [
      { label: (DashboardCopy.resultButtons || {}).replay || 'Nochmal starten', className: 'btn btn-primary', handler: 'restartRotationMode' },
      { label: (DashboardCopy.resultButtons || {}).backToDashboard || 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  formen: {
    insightId: 'formen-result-insight',
    buttons: [
      { label: (DashboardCopy.resultButtons || {}).replay || 'Nochmal starten', className: 'btn btn-primary', handler: 'restartFormenMode' },
      { label: (DashboardCopy.resultButtons || {}).backToDashboard || 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  concentration: {
    insightId: 'concentration-result-insight',
    buttons: [
      { label: (DashboardCopy.resultButtons || {}).replay || 'Nochmal starten', className: 'btn btn-primary', handler: 'restartConcentrationMode' },
      { label: (DashboardCopy.resultButtons || {}).backToDashboard || 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  multitasking: {
    insightId: 'multitask-result-insight',
    buttonRowStyle: 'margin-top:20px;',
    buttons: [
      { label: (DashboardCopy.resultButtons || {}).replay || 'Nochmal starten', className: 'btn btn-primary', handler: 'restartMultitaskingMode' },
      { label: (DashboardCopy.resultButtons || {}).backToDashboard || 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  digitspan: {
    insightId: 'digitspan-result-insight',
    buttons: [
      { label: (DashboardCopy.resultButtons || {}).replay || 'Nochmal starten', className: 'btn btn-primary', handler: 'restartDigitSpanMode' },
      { label: (DashboardCopy.resultButtons || {}).backToDashboard || 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  flanker: {
    insightId: 'flanker-result-insight',
    buttons: [
      { label: (DashboardCopy.resultButtons || {}).replay || 'Nochmal starten', className: 'btn btn-primary', handler: 'restartFlankerMode' },
      { label: (DashboardCopy.resultButtons || {}).backToDashboard || 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  visualsearch: {
    insightId: 'visualsearch-result-insight',
    buttons: [
      { label: (DashboardCopy.resultButtons || {}).replay || 'Nochmal starten', className: 'btn btn-primary', handler: 'restartVisualSearchMode' },
      { label: (DashboardCopy.resultButtons || {}).backToDashboard || 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  pqscan: {
    insightId: 'pqscan-result-insight',
    buttons: [
      { label: (DashboardCopy.resultButtons || {}).replay || 'Nochmal starten', className: 'btn btn-primary', handler: 'restartPQScanMode' },
      { label: (DashboardCopy.resultButtons || {}).backToDashboard || 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  }
};
let dashboardQuickActions = { primary: 'speed', secondary: 'math', tertiary: 'nback' };
const QuickStartCopy = AppCopy.quickstart || {};
const QUICKSTART_PLAN_KEY = 'psy_vorbereitung_quickstart_plan';
const QUICKSTART_LAST_SUMMARY_KEY = 'psy_vorbereitung_quickstart_last_summary';
const QUICKSTART_HISTORY_KEY = 'psy_vorbereitung_quickstart_history';
const QUICKSTART_HISTORY_LIMIT = 5;
const QUICKSTART_COMPONENT_LABELS = {
  speed: 'Reaktionsgeschwindigkeit',
  accuracy: 'Genauigkeit',
  consistency: 'Reaktionskonstanz',
  memory: 'Merkfähigkeit',
  stability: 'Stabilität'
};
const QUICKSTART_DEFAULT_PLANS = {
  test: ['speed', 'math', 'gonogo', 'nback', 'flanker', 'digitspan'],
  practice: ['speed', 'math', 'nback', 'visualsearch', 'sequence', 'gonogo']
};
const QUICKSTART_MODULE_CONFIG = {
  speed: {
    group: 'numeric',
    loadLevel: 1,
    practiceStarter: 10,
    testStarter: 12,
    testAnchor: 8,
    timeOptions: [2, 5, 10, 15, 20],
    runModeSelectId: 'speed-runmode-select',
    timeSelectId: 'speed-time-select',
    openHandler: 'openSpeedHome',
    startHandler: 'startExercise',
    resultScreens: ['screen-results'],
    weights: { speed: 1, consistency: 0.8, accuracy: 0.6 }
  },
  math: {
    group: 'numeric',
    loadLevel: 1,
    practiceStarter: 9,
    testStarter: 10,
    testAnchor: 7,
    timeOptions: [2, 5, 10, 15, 20],
    runModeSelectId: 'math-runmode-select',
    timeSelectId: 'math-time-select',
    openHandler: 'openMathHome',
    startHandler: 'startMathExercise',
    startArgs: ['mix'],
    resultScreens: ['screen-math-results'],
    weights: { speed: 0.75, accuracy: 0.95, memory: 0.25 }
  },
  nback: {
    group: 'memory',
    loadLevel: 2,
    practiceStarter: 7,
    testStarter: 7,
    testAnchor: 5,
    timeOptions: [2, 5, 10, 15, 20],
    runModeSelectId: 'nback-mode-select',
    timeSelectId: 'nback-time-select',
    openHandler: 'openNbackHome',
    startHandler: 'startNbackExercise',
    resultScreens: ['screen-nback-results'],
    weights: { memory: 1, accuracy: 0.7, stability: 0.35 },
    prepare: function(runMode) {
      const toggle = document.getElementById('nback-feedback-toggle');
      if (toggle) toggle.checked = runMode === 'practice';
    }
  },
  digitspan: {
    group: 'memory',
    loadLevel: 2,
    practiceStarter: 6,
    testStarter: 7,
    testAnchor: 6,
    timeOptions: [2, 5, 10],
    runModeSelectId: 'digitspan-runmode-select',
    timeSelectId: 'digitspan-time-select',
    openHandler: 'openDigitSpanHome',
    startHandler: 'startDigitSpanExercise',
    resultScreens: ['screen-digitspan-results'],
    weights: { memory: 1, accuracy: 0.55, stability: 0.25 },
    prepare: function(runMode) {
      setSelectValue('digitspan-mode-select', runMode === 'practice' ? 'forward' : 'backward');
    }
  },
  gonogo: {
    group: 'control',
    loadLevel: 2,
    practiceStarter: 8,
    testStarter: 9,
    testAnchor: 7,
    timeOptions: [2, 5, 10, 15, 20],
    runModeSelectId: 'gonogo-runmode-select',
    timeSelectId: 'gonogo-time-select',
    openHandler: 'openGoNoGoHome',
    startHandler: 'startGoNoGoExercise',
    resultScreens: ['screen-gonogo-results'],
    weights: { stability: 1, speed: 0.7, accuracy: 0.75 },
    prepare: function(runMode) {
      setSelectValue('gonogo-difficulty-select', runMode === 'practice' ? 'easy' : 'medium');
    }
  },
  stroop: {
    group: 'control',
    loadLevel: 3,
    practiceStarter: 4,
    testStarter: 6,
    testAnchor: 5,
    timeOptions: [2, 5, 10, 15, 20],
    runModeSelectId: 'stroop-runmode-select',
    timeSelectId: 'stroop-time-select',
    openHandler: 'openStroopHome',
    startHandler: 'startStroopExercise',
    resultScreens: ['screen-stroop-results'],
    weights: { stability: 0.9, accuracy: 0.8, speed: 0.6 },
    prepare: function(runMode) {
      setSelectValue('stroop-mode-select', 'time');
      setSelectValue('stroop-difficulty-select', runMode === 'practice' ? 'easy' : 'medium');
      if (typeof window.setStroopModeHint === 'function') window.setStroopModeHint();
      if (typeof window.setStroopDifficultyHint === 'function') window.setStroopDifficultyHint();
    }
  },
  flanker: {
    group: 'control',
    loadLevel: 2,
    practiceStarter: 7,
    testStarter: 8,
    testAnchor: 7,
    timeOptions: [2, 5, 10],
    runModeSelectId: 'flanker-runmode-select',
    timeSelectId: 'flanker-time-select',
    openHandler: 'openFlankerHome',
    startHandler: 'startFlankerExercise',
    resultScreens: ['screen-flanker-results'],
    weights: { stability: 0.8, accuracy: 0.75, speed: 0.7 },
    prepare: function(runMode) {
      setSelectValue('flanker-difficulty-select', runMode === 'practice' ? 'easy' : 'medium');
    }
  },
  concentration: {
    group: 'control',
    loadLevel: 2,
    practiceStarter: 6,
    testStarter: 7,
    testAnchor: 5,
    timeOptions: [2, 3, 5, 10],
    runModeSelectId: 'concentration-runmode-select',
    timeSelectId: 'concentration-time-select',
    openHandler: 'openConcentrationHome',
    startHandler: 'startConcentrationExercise',
    resultScreens: ['screen-concentration-results'],
    weights: { stability: 0.9, consistency: 0.55, speed: 0.55 }
  },
  spatial: {
    group: 'spatial',
    loadLevel: 3,
    practiceStarter: 5,
    testStarter: 6,
    testAnchor: 4,
    timeOptions: [2, 5, 10, 15, 20],
    runModeSelectId: 'spatial-runmode-select',
    timeSelectId: 'spatial-time-select',
    openHandler: 'openSpatialHome',
    startHandler: 'startSpatialExercise',
    resultScreens: ['screen-spatial-results'],
    weights: { accuracy: 0.85, memory: 0.45, stability: 0.25 }
  },
  rotation: {
    group: 'spatial',
    loadLevel: 3,
    practiceStarter: 5,
    testStarter: 6,
    testAnchor: 4,
    timeOptions: [2, 5, 10],
    runModeSelectId: 'rotation-runmode-select',
    timeSelectId: 'rotation-time-select',
    openHandler: 'openRotationHome',
    startHandler: 'startRotationExercise',
    resultScreens: ['screen-rotation-results'],
    weights: { accuracy: 0.75, memory: 0.5, speed: 0.35 },
    prepare: function(runMode) {
      setSelectValue('rotation-difficulty-select', runMode === 'practice' ? 'easy' : 'medium');
    }
  },
  formen: {
    group: 'spatial',
    loadLevel: 2,
    practiceStarter: 6,
    testStarter: 7,
    testAnchor: 6,
    timeOptions: [2, 3, 5],
    runModeSelectId: 'formen-runmode-select',
    timeSelectId: 'formen-time-select',
    openHandler: 'openFormenHome',
    startHandler: 'startFormenExercise',
    resultScreens: ['screen-formen-results'],
    weights: { speed: 0.75, accuracy: 0.8, stability: 0.35 }
  },
  visualsearch: {
    group: 'spatial',
    loadLevel: 2,
    practiceStarter: 7,
    testStarter: 8,
    testAnchor: 7,
    timeOptions: [2, 5, 10],
    runModeSelectId: 'visualsearch-runmode-select',
    timeSelectId: 'visualsearch-time-select',
    openHandler: 'openVisualSearchHome',
    startHandler: 'startVisualSearchExercise',
    resultScreens: ['screen-visualsearch-results'],
    weights: { speed: 0.8, accuracy: 0.8, stability: 0.35 },
    prepare: function(runMode) {
      setSelectValue('visualsearch-difficulty-select', runMode === 'practice' ? 'easy' : 'medium');
    }
  },
  pqscan: {
    group: 'spatial',
    loadLevel: 2,
    practiceStarter: 7,
    testStarter: 8,
    testAnchor: 7,
    timeOptions: [2, 5, 10],
    runModeSelectId: 'pqscan-runmode-select',
    timeSelectId: 'pqscan-time-select',
    openHandler: 'openPQScanHome',
    startHandler: 'startPQScanExercise',
    resultScreens: ['screen-pqscan-results'],
    weights: { speed: 0.7, accuracy: 0.9, consistency: 0.55 },
    prepare: function(runMode) {
      setSelectValue('pqscan-difficulty-select', runMode === 'practice' ? 'easy' : 'medium');
    }
  },
  sequence: {
    group: 'highload',
    loadLevel: 3,
    practiceStarter: 4,
    testStarter: 5,
    testAnchor: 4,
    timeOptions: [2, 5, 10, 15, 20],
    runModeSelectId: 'sequence-runmode-select',
    timeSelectId: 'sequence-time-select',
    openHandler: 'openSequenceHome',
    startHandler: 'startSequenceExercise',
    resultScreens: ['screen-sequence-results'],
    weights: { memory: 0.7, accuracy: 0.8, stability: 0.25 }
  },
  multitasking: {
    group: 'highload',
    loadLevel: 4,
    practiceStarter: 2,
    testStarter: 4,
    testAnchor: 2,
    timeOptions: [1, 2, 3, 5],
    runModeSelectId: 'multitask-runmode-select',
    timeSelectId: 'multitask-time-select',
    openHandler: 'openMultitaskHome',
    startHandler: 'startMultitaskingExercise',
    resultScreens: ['screen-multitasking-results'],
    weights: { stability: 1, speed: 0.45, accuracy: 0.55, memory: 0.45 }
  }
};

function safeJsonParse(rawValue, fallback) {
  try {
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch (error) {
    return fallback;
  }
}

function loadQuickStartPlan() {
  const parsed = safeJsonParse(localStorage.getItem(QUICKSTART_PLAN_KEY), null);
  if (!parsed || !Array.isArray(parsed.steps)) return null;
  const steps = parsed.steps
    .map(function(step, index) {
      const config = QUICKSTART_MODULE_CONFIG[step.moduleId];
      if (!config) return null;
      return {
        moduleId: step.moduleId,
        minutes: config.timeOptions.indexOf(step.minutes) >= 0 ? step.minutes : config.timeOptions[0],
        reason: step.reason || '',
        focusComponent: step.focusComponent || null,
        status: step.status === 'done' ? 'done' : (step.status === 'active' ? 'active' : 'pending'),
        order: index
      };
    })
    .filter(Boolean);
  if (!steps.length) return null;
  return {
    mode: parsed.mode === 'practice' ? 'practice' : 'test',
    totalMinutes: typeof parsed.totalMinutes === 'number' ? parsed.totalMinutes : 15,
    actualMinutes: typeof parsed.actualMinutes === 'number' ? parsed.actualMinutes : steps.reduce(function(sum, step) { return sum + step.minutes; }, 0),
    summary: parsed.summary || '',
    focusTags: Array.isArray(parsed.focusTags) ? parsed.focusTags.slice(0, 3) : [],
    createdAt: parsed.createdAt || new Date().toISOString(),
    steps: steps
  };
}

function saveQuickStartPlan(plan) {
  if (!plan) {
    localStorage.removeItem(QUICKSTART_PLAN_KEY);
    return;
  }
  localStorage.setItem(QUICKSTART_PLAN_KEY, JSON.stringify(plan));
}

function normalizeQuickStartSummary(summary) {
  if (!summary || !Array.isArray(summary.steps)) return null;
  const mode = summary.mode === 'practice' ? 'practice' : 'test';
  const focusTags = Array.isArray(summary.focusTags) ? summary.focusTags.filter(Boolean).slice(0, 3) : [];
  const primaryFocus = summary.primaryFocus || focusTags[0] || 'Ausgewogenheit';
  const emphasisText = summary.emphasisText || (typeof QuickStartCopy.emphasis === 'function'
    ? QuickStartCopy.emphasis(joinQuickStartFocusTags(focusTags), !!summary.stepCount)
    : 'Der Block war bewusst ausgewogen zusammengestellt.');
  return {
    mode: mode,
    completedAt: summary.completedAt || new Date().toISOString(),
    steps: summary.steps,
    stepCount: typeof summary.stepCount === 'number' ? summary.stepCount : summary.steps.length,
    totalMinutes: typeof summary.totalMinutes === 'number' ? summary.totalMinutes : summary.steps.reduce(function(sum, step) { return sum + (step.minutes || 0); }, 0),
    focusTags: focusTags,
    primaryFocus: primaryFocus,
    emphasisText: emphasisText,
    nextMode: summary.nextMode === 'practice' ? 'practice' : (summary.nextMode === 'test' ? 'test' : getQuickStartNextMode(mode)),
    recommendation: summary.recommendation || (typeof QuickStartCopy.recommendation === 'function'
      ? QuickStartCopy.recommendation(mode, primaryFocus)
      : 'Du hast jetzt einen kompakten Überblick mit Schwerpunkt auf ' + primaryFocus + '.')
  };
}

function loadQuickStartSummary() {
  return normalizeQuickStartSummary(safeJsonParse(localStorage.getItem(QUICKSTART_LAST_SUMMARY_KEY), null));
}

function saveQuickStartSummary(summary) {
  if (!summary) {
    localStorage.removeItem(QUICKSTART_LAST_SUMMARY_KEY);
    return;
  }
  localStorage.setItem(QUICKSTART_LAST_SUMMARY_KEY, JSON.stringify(summary));
}

function loadQuickStartHistory() {
  const history = safeJsonParse(localStorage.getItem(QUICKSTART_HISTORY_KEY), []);
  return Array.isArray(history)
    ? history.map(normalizeQuickStartSummary).filter(Boolean).slice(0, QUICKSTART_HISTORY_LIMIT)
    : [];
}

function saveQuickStartHistory(history) {
  const normalized = Array.isArray(history) ? history.slice(0, QUICKSTART_HISTORY_LIMIT) : [];
  if (!normalized.length) {
    localStorage.removeItem(QUICKSTART_HISTORY_KEY);
    return;
  }
  localStorage.setItem(QUICKSTART_HISTORY_KEY, JSON.stringify(normalized));
}

function pushQuickStartHistoryEntry(summary) {
  if (!summary) return;
  const history = loadQuickStartHistory().filter(function(item) {
    return item && item.completedAt !== summary.completedAt;
  });
  history.unshift(summary);
  saveQuickStartHistory(history);
}

function getQuickStartModeLabel(mode) {
  return mode === 'practice' ? 'Übungsblock' : 'Testblock';
}

function formatQuickStartHistoryDate(isoString) {
  if (!isoString) return 'ohne Datum';
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return 'ohne Datum';
  return parsed.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function joinQuickStartFocusTags(focusTags) {
  const tags = Array.isArray(focusTags) ? focusTags.filter(Boolean) : [];
  if (!tags.length) return 'ausgewogenen Kernbereichen';
  if (tags.length === 1) return tags[0];
  return tags.slice(0, -1).join(', ') + ' und ' + tags[tags.length - 1];
}

function getQuickStartNextMode(mode) {
  return mode === 'practice' ? 'test' : 'practice';
}

function getQuickStartReasonText(moduleId, focusComponent, mode, stat) {
  const template = typeof QuickStartCopy.reasonTemplate === 'function'
    ? QuickStartCopy.reasonTemplate(mode, focusComponent)
    : 'um unter Zeitdruck wieder sauberer zu arbeiten';
  const count = stat && typeof stat.count === 'number' ? stat.count : 0;
  const lastTs = stat && typeof stat.lastTs === 'number' ? stat.lastTs : 0;
  const daysSince = lastTs ? Math.floor((Date.now() - lastTs) / 86400000) : null;

  if (!count) {
    return QuickStartCopy.firstTimeReason || 'Gut geeignet, um in diesem Bereich erst einmal einen klaren Startwert aufzubauen.';
  }
  if (daysSince !== null && daysSince >= 6) {
    return QuickStartCopy.longPauseReason || 'Passt gut, um diesen Bereich nach einer längeren Pause wieder aufzugreifen.';
  }
  return 'Sinnvoll, ' + template + '.';
}

function getQuickStartCounts(plan) {
  const steps = (plan && Array.isArray(plan.steps)) ? plan.steps : [];
  const done = steps.filter(function(step) { return step.status === 'done'; }).length;
  const currentIndex = steps.findIndex(function(step) { return step.status !== 'done'; });
  return {
    total: steps.length,
    done: done,
    currentIndex: currentIndex,
    remaining: Math.max(0, steps.length - done)
  };
}

function getQuickStartCurrentStep(plan) {
  if (!plan || !Array.isArray(plan.steps)) return null;
  return plan.steps.find(function(step) { return step.status !== 'done'; }) || null;
}

function setSelectValue(selectId, value) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const matchingOption = Array.from(select.options).find(function(option) {
    return option.value === String(value);
  });
  if (matchingOption) select.value = matchingOption.value;
}

function getQuickStartModuleStatsMap(log) {
  const moduleStats = getDashboardModuleStats(log);
  const mapped = {};
  moduleStats.forEach(function(stat) {
    mapped[stat.moduleId] = stat;
  });
  return mapped;
}

function getQuickStartComponentScores(log) {
  const fallback = {
    speed: 60,
    accuracy: 60,
    consistency: 60,
    memory: 60,
    stability: 60
  };
  if (!window.TrainingScoringEngine) return fallback;
  const model = window.TrainingScoringEngine.buildDashboardModel(log, DASHBOARD_MODULE_META);
  const averages = (((model || {}).aggregate || {}).componentAverages || []);
  averages.forEach(function(component) {
    if (typeof component.score === 'number' && isFinite(component.score)) {
      fallback[component.id] = component.score;
    }
  });
  return fallback;
}

function getQuickStartExerciseCount(totalMinutes) {
  if (totalMinutes <= 10) return 2;
  if (totalMinutes <= 15) return 3;
  if (totalMinutes <= 20) return 4;
  if (totalMinutes <= 30) return 5;
  return 6;
}

function createQuickStartCandidates(log, mode) {
  const statsMap = getQuickStartModuleStatsMap(log);
  const componentScores = getQuickStartComponentScores(log);
  return Object.keys(QUICKSTART_MODULE_CONFIG).map(function(moduleId) {
    const config = QUICKSTART_MODULE_CONFIG[moduleId];
    const stat = statsMap[moduleId] || { count: 0, lastTs: 0, avgPerformance: 0 };
    const weightedWeaknesses = Object.keys(config.weights).map(function(componentId) {
      const weight = config.weights[componentId];
      const score = typeof componentScores[componentId] === 'number' ? componentScores[componentId] : 60;
      return {
        id: componentId,
        weakValue: (100 - score) * weight,
        strongValue: score * weight
      };
    });
    const topWeakness = weightedWeaknesses.slice().sort(function(a, b) {
      return b.weakValue - a.weakValue;
    })[0] || { id: 'accuracy', weakValue: 0, strongValue: 0 };
    const topStrength = weightedWeaknesses.slice().sort(function(a, b) {
      return b.strongValue - a.strongValue;
    })[0] || topWeakness;
    const weaknessScore = weightedWeaknesses.reduce(function(sum, item) { return sum + item.weakValue; }, 0);
    const strengthScore = weightedWeaknesses.reduce(function(sum, item) { return sum + item.strongValue; }, 0);
    const daysSince = stat.count ? Math.floor((Date.now() - stat.lastTs) / 86400000) : 12;
    const noveltyBonus = stat.count === 0 ? 18 : Math.min(12, Math.max(0, daysSince) * 1.2);
    const undertrainedBonus = Math.max(0, 10 - Math.min(10, stat.count));
    const practiceRank = weaknessScore * 0.95 + noveltyBonus + undertrainedBonus - strengthScore * 0.08 + (config.practiceStarter || 0) * 0.45;
    const testRank = weaknessScore * 0.55 + strengthScore * 0.22 + noveltyBonus * 0.45 + undertrainedBonus * 0.35 + (config.testStarter || 0) * 0.35;
    const benchmarkRank = strengthScore * 0.55 + noveltyBonus * 0.3 + (stat.avgPerformance || 0) * 0.15 + (config.testAnchor || 0) * 0.45;
    const selectedComponent = mode === 'practice'
      ? topWeakness.id
      : (weaknessScore >= strengthScore * 0.95 ? topStrength.id : topWeakness.id);
    const reason = getQuickStartReasonText(moduleId, selectedComponent, mode, stat);
    return {
      moduleId: moduleId,
      label: DASHBOARD_MODULE_META[moduleId].label,
      group: config.group,
      loadLevel: config.loadLevel || 2,
      practiceStarter: config.practiceStarter || 0,
      testStarter: config.testStarter || 0,
      testAnchor: config.testAnchor || 0,
      practiceRank: practiceRank,
      testRank: testRank,
      benchmarkRank: benchmarkRank,
      focusComponent: selectedComponent,
      reason: reason,
      stat: stat
    };
  });
}

function orderQuickStartModules(selected, mode) {
  const ordered = selected.slice();
  if (mode === 'practice') {
    ordered.sort(function(a, b) {
      return (a.loadLevel - b.loadLevel)
        || (b.practiceStarter - a.practiceStarter)
        || (b.practiceRank - a.practiceRank);
    });
    return ordered;
  }

  ordered.sort(function(a, b) {
    return (b.testStarter - a.testStarter)
      || (a.loadLevel - b.loadLevel)
      || (b.testRank - a.testRank);
  });

  if (ordered.length >= 3) {
    const anchorCandidate = ordered
      .slice()
      .sort(function(a, b) {
        return (b.benchmarkRank + b.testAnchor) - (a.benchmarkRank + a.testAnchor);
      })[0];
    const anchorIndex = ordered.findIndex(function(item) { return item.moduleId === anchorCandidate.moduleId; });
    if (anchorIndex >= 0) {
      const anchor = ordered.splice(anchorIndex, 1)[0];
      ordered.push(anchor);
    }
  }

  return ordered;
}

function pickQuickStartModules(candidates, mode, targetCount) {
  const selected = [];
  const remaining = candidates.slice();
  const groupCounts = {};
  const primaryKey = mode === 'practice' ? 'practiceRank' : 'testRank';

  if (remaining.length) {
    const starter = remaining.slice().sort(function(a, b) {
      const starterDelta = mode === 'practice'
        ? (b.practiceStarter - a.practiceStarter)
        : (b.testStarter - a.testStarter);
      return starterDelta || (b[primaryKey] - a[primaryKey]);
    })[0];
    const starterIndex = remaining.findIndex(function(candidate) {
      return candidate.moduleId === starter.moduleId;
    });
    if (starterIndex >= 0) {
      const chosenStarter = remaining.splice(starterIndex, 1)[0];
      selected.push(chosenStarter);
      groupCounts[chosenStarter.group] = (groupCounts[chosenStarter.group] || 0) + 1;
    }
  }

  while (selected.length < targetCount && remaining.length) {
    let bestIndex = 0;
    let bestScore = -Infinity;
    remaining.forEach(function(candidate, index) {
      const groupPenalty = (groupCounts[candidate.group] || 0) * (mode === 'practice' ? 10 : 7);
      const repeatPenalty = selected.length && selected[selected.length - 1].group === candidate.group ? 6 : 0;
      const score = candidate[primaryKey] - groupPenalty - repeatPenalty;
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });
    const chosen = remaining.splice(bestIndex, 1)[0];
    selected.push(chosen);
    groupCounts[chosen.group] = (groupCounts[chosen.group] || 0) + 1;
  }

  return orderQuickStartModules(selected, mode);
}

function findBestQuickStartAllocation(moduleIds, totalMinutes) {
  const optionsList = moduleIds.map(function(moduleId) {
    return (QUICKSTART_MODULE_CONFIG[moduleId] || {}).timeOptions || [2];
  });
  let best = { diff: Infinity, sum: 0, allocation: optionsList.map(function(options) { return options[0]; }) };

  function visit(index, currentSum, allocation) {
    if (index >= optionsList.length) {
      const diff = Math.abs(totalMinutes - currentSum);
      const preferCurrent = diff < best.diff
        || (diff === best.diff && Math.abs(totalMinutes - currentSum) === Math.abs(totalMinutes - best.sum) && currentSum > best.sum);
      if (preferCurrent) {
        best = { diff: diff, sum: currentSum, allocation: allocation.slice() };
      }
      return;
    }

    optionsList[index].forEach(function(option) {
      allocation[index] = option;
      visit(index + 1, currentSum + option, allocation);
    });
  }

  visit(0, 0, []);
  return best;
}

function generateQuickStartPlan(mode, totalMinutes, log) {
  const planMode = mode === 'practice' ? 'practice' : 'test';
  const hasScoringHistory = getScoringEntries(log).length > 0;
  const targetCount = getQuickStartExerciseCount(totalMinutes);
  const selected = hasScoringHistory
    ? pickQuickStartModules(createQuickStartCandidates(log, planMode), planMode, targetCount)
    : QUICKSTART_DEFAULT_PLANS[planMode].slice(0, targetCount).map(function(moduleId) {
        return {
          moduleId: moduleId,
          label: DASHBOARD_MODULE_META[moduleId].label,
          focusComponent: null,
          reason: typeof QuickStartCopy.defaultReason === 'function'
            ? QuickStartCopy.defaultReason(planMode)
            : 'Ein ruhiger Wiedereinstieg für den nächsten Trainingsblock.'
        };
      });
  const allocation = findBestQuickStartAllocation(selected.map(function(item) { return item.moduleId; }), totalMinutes);
  const steps = selected.map(function(item, index) {
    return {
      moduleId: item.moduleId,
      minutes: allocation.allocation[index],
      reason: item.reason,
      focusComponent: item.focusComponent || null,
      status: 'pending'
    };
  });
  const focusTags = Array.from(new Set(steps
    .map(function(step) { return step.focusComponent; })
    .filter(Boolean)
    .slice(0, 3)
    .map(function(componentId) { return QUICKSTART_COMPONENT_LABELS[componentId] || componentId; })));
  return {
    mode: planMode,
    totalMinutes: totalMinutes,
    actualMinutes: allocation.sum,
    summary: typeof QuickStartCopy.generatedSummary === 'function'
      ? QuickStartCopy.generatedSummary(planMode, hasScoringHistory)
      : 'Es sind noch kaum Verlaufsdaten da. Deshalb startet der Block bewusst ausgewogen über mehrere Kernbereiche.',
    focusTags: focusTags,
    createdAt: new Date().toISOString(),
    steps: steps
  };
}

function buildQuickStartPlanHtml(steps) {
  return steps.map(function(step, index) {
    const statusClass = step.status === 'done'
      ? ' quickstart-plan-item--done'
      : (step.status === 'active' ? ' quickstart-plan-item--active' : '');
    const statusPrefix = step.status === 'done' ? 'Abgeschlossen' : (step.status === 'active' ? 'Aktuell' : `Schritt ${index + 1}`);
    return '<div class="quickstart-plan-item' + statusClass + '">'
      + '<div class="quickstart-plan-top"><span class="quickstart-plan-title">' + statusPrefix + ': ' + DASHBOARD_MODULE_META[step.moduleId].label + '</span><span class="quickstart-plan-minutes">' + step.minutes + ' Min</span></div>'
      + '<div class="quickstart-plan-reason">' + step.reason + '</div>'
      + '</div>';
  }).join('');
}

function buildQuickStartSummary(plan) {
  const steps = ((plan || {}).steps || []).filter(function(step) {
    return step.status === 'done';
  }).map(function(step) {
    return {
      moduleId: step.moduleId,
      minutes: step.minutes,
      reason: step.reason,
      focusComponent: step.focusComponent || null,
      status: 'done'
    };
  });
  const focusTags = Array.isArray(plan && plan.focusTags) ? plan.focusTags : [];
  const totalMinutes = steps.reduce(function(sum, step) { return sum + (step.minutes || 0); }, 0);
  const primaryFocus = focusTags[0] || 'Ausgewogenheit';
  const nextMode = getQuickStartNextMode((plan && plan.mode) === 'practice' ? 'practice' : 'test');
  const emphasisText = typeof QuickStartCopy.emphasis === 'function'
    ? QuickStartCopy.emphasis(joinQuickStartFocusTags(focusTags), steps.length > 0)
    : 'Der Block war bewusst ausgewogen zusammengestellt.';
  const recommendation = (plan && plan.mode) === 'practice'
    ? (typeof QuickStartCopy.recommendation === 'function' ? QuickStartCopy.recommendation('practice', primaryFocus) : '')
    : (typeof QuickStartCopy.recommendation === 'function' ? QuickStartCopy.recommendation('test', primaryFocus) : '');
  return {
    mode: (plan && plan.mode) === 'practice' ? 'practice' : 'test',
    completedAt: new Date().toISOString(),
    steps: steps,
    stepCount: steps.length,
    totalMinutes: totalMinutes,
    focusTags: focusTags,
    primaryFocus: primaryFocus,
    emphasisText: emphasisText,
    nextMode: nextMode,
    recommendation: recommendation
  };
}

function buildQuickStartHistoryHtml(history, excludeCompletedAt) {
  const items = (Array.isArray(history) ? history : []).filter(function(entry) {
    return entry && entry.completedAt !== excludeCompletedAt;
  }).slice(0, 3);
  if (!items.length) return '';
  return '<h3 style="margin:14px 0 8px;">' + (QuickStartCopy.historyHeading || 'Deine letzten Schnellblöcke') + '</h3>'
    + items.map(function(entry) {
      const focusLabel = joinQuickStartFocusTags(entry.focusTags);
      return '<div class="quickstart-history-card">'
        + '<strong>' + getQuickStartModeLabel(entry.mode) + ' · ' + formatQuickStartHistoryDate(entry.completedAt) + '</strong>'
        + '<p>' + entry.stepCount + ' Uebungen in ' + entry.totalMinutes + ' Minuten · Schwerpunkt: ' + focusLabel + '.</p>'
        + '</div>';
    }).join('');
}

function renderQuickStartCompletion(summary) {
  const modal = document.getElementById('modal-quickstart-summary');
  const titleEl = document.getElementById('quickstart-summary-title');
  const copyEl = document.getElementById('quickstart-summary-copy');
  const badgeEl = document.getElementById('quickstart-summary-badge');
  const statsEl = document.getElementById('quickstart-summary-stats');
  const listEl = document.getElementById('quickstart-summary-list');
  const historyEl = document.getElementById('quickstart-summary-history');
  const replanBtn = document.getElementById('quickstart-summary-replan-btn');
  if (!summary || !modal || !titleEl || !copyEl || !badgeEl || !statsEl || !listEl || !historyEl || !replanBtn) return;

  titleEl.textContent = getQuickStartModeLabel(summary.mode) + ' abgeschlossen';
  copyEl.textContent = summary.emphasisText + ' ' + summary.recommendation;
  badgeEl.textContent = getQuickStartModeLabel(summary.mode);
  badgeEl.className = summary.mode === 'practice' ? 'quickstart-mode-badge quickstart-mode-badge--practice' : 'quickstart-mode-badge';
  statsEl.innerHTML = '<strong>' + (QuickStartCopy.summaryHeading || 'Kurzer Rückblick') + '</strong><br>'
    + summary.emphasisText + ' ' + summary.recommendation
    + '<div class="quickstart-summary-kpis">'
    + '<div class="quickstart-summary-stat"><strong>' + summary.stepCount + '</strong><span>' + (QuickStartCopy.statDone || 'fertige Übungen') + '</span></div>'
    + '<div class="quickstart-summary-stat"><strong>' + summary.totalMinutes + ' Min</strong><span>' + (QuickStartCopy.statDuration || 'Dauer des Blocks') + '</span></div>'
    + '<div class="quickstart-summary-stat"><strong>' + (summary.primaryFocus || 'Ausgewogen') + '</strong><span>' + (QuickStartCopy.statFocus || 'deutlichster Schwerpunkt') + '</span></div>'
    + '<div class="quickstart-summary-stat"><strong>' + getQuickStartModeLabel(summary.nextMode) + '</strong><span>' + (QuickStartCopy.statNext || 'sinnvoller nächster Block') + '</span></div>'
    + '</div>';
  listEl.innerHTML = buildQuickStartPlanHtml(summary.steps);
  historyEl.innerHTML = buildQuickStartHistoryHtml(loadQuickStartHistory(), summary.completedAt);
  replanBtn.textContent = getQuickStartModeLabel(summary.nextMode) + ' planen';
  replanBtn.dataset.actionArgs = JSON.stringify([summary.nextMode]);
  modal.classList.remove('hidden');
  if (typeof bindDeclarativeActions === 'function') bindDeclarativeActions();
}

function renderQuickStartPreview() {
  const modeInput = document.getElementById('quickstart-mode-input');
  const durationSelect = document.getElementById('quickstart-duration-select');
  const summaryEl = document.getElementById('quickstart-preview-summary');
  const listEl = document.getElementById('quickstart-preview-list');
  const badgeEl = document.getElementById('quickstart-modal-badge');
  const titleEl = document.getElementById('quickstart-modal-title');
  const copyEl = document.getElementById('quickstart-modal-copy');
  if (!modeInput || !durationSelect || !summaryEl || !listEl || !badgeEl || !titleEl || !copyEl) return;

  const mode = modeInput.value === 'practice' ? 'practice' : 'test';
  const totalMinutes = parseInt(durationSelect.value, 10) || 15;
  const preview = generateQuickStartPlan(mode, totalMinutes, loadTrainingLog());
  titleEl.textContent = mode === 'practice' ? 'Schneller Übungsblock' : 'Schneller Testblock';
  copyEl.textContent = typeof QuickStartCopy.previewCopy === 'function'
    ? QuickStartCopy.previewCopy(mode)
    : 'Der Block stellt dir eine kurze, sinnvolle Testreihe zusammen.';
  badgeEl.textContent = mode === 'practice' ? 'Übungsblock' : 'Testblock';
  badgeEl.className = mode === 'practice' ? 'quickstart-mode-badge quickstart-mode-badge--practice' : 'quickstart-mode-badge';
  summaryEl.innerHTML = '<strong>' + (typeof QuickStartCopy.previewHeading === 'function' ? QuickStartCopy.previewHeading(mode) : 'So ist der Block gedacht') + '</strong><br>'
    + preview.summary
    + '<div class="quickstart-focus-tags">'
    + (preview.focusTags.length ? preview.focusTags.map(function(tag) {
      return '<span class="quickstart-focus-tag">' + tag + '</span>';
    }).join('') : '<span class="quickstart-focus-tag">Ausgewogener Einstieg</span>')
    + '</div>'
    + '<div style="margin-top:10px;"><strong>' + (QuickStartCopy.previewDurationLabel || 'Geplante Dauer:') + '</strong> ' + preview.actualMinutes + ' Minuten über ' + preview.steps.length + ' Übungen.</div>';
  listEl.innerHTML = buildQuickStartPlanHtml(preview.steps);
}

function openQuickStartOverlay(mode) {
  const modal = document.getElementById('modal-quickstart');
  const modeInput = document.getElementById('quickstart-mode-input');
  if (!modal || !modeInput) return;
  modeInput.value = mode === 'practice' ? 'practice' : 'test';
  modal.classList.remove('hidden');
  renderQuickStartPreview();
}

function updateQuickStartPreview() {
  renderQuickStartPreview();
}

function clearQuickStartPlan() {
  saveQuickStartPlan(null);
  renderQuickStartState(typeof getCurrentScreenId === 'function' ? getCurrentScreenId() : 'screen-dashboard');
}

function openLastQuickStartSummary() {
  const summary = loadQuickStartSummary();
  if (!summary) return;
  renderQuickStartCompletion(summary);
}

function closeQuickStartSummaryToDashboard() {
  closeOverlay('modal-quickstart-summary');
  if (typeof goDashboard === 'function') goDashboard();
}

function replanQuickStartFromSummary(mode) {
  closeOverlay('modal-quickstart-summary');
  openQuickStartOverlay(mode);
}

function startQuickStartPlanFromOverlay() {
  const modeInput = document.getElementById('quickstart-mode-input');
  const durationSelect = document.getElementById('quickstart-duration-select');
  const mode = modeInput && modeInput.value === 'practice' ? 'practice' : 'test';
  const totalMinutes = parseInt((durationSelect || {}).value, 10) || 15;
  const plan = generateQuickStartPlan(mode, totalMinutes, loadTrainingLog());
  saveQuickStartSummary(null);
  saveQuickStartPlan(plan);
  closeOverlay('modal-quickstart');
  renderQuickStartState(typeof getCurrentScreenId === 'function' ? getCurrentScreenId() : 'screen-dashboard');
  startActiveQuickStartStep();
}

function startActiveQuickStartStep() {
  const plan = loadQuickStartPlan();
  const step = getQuickStartCurrentStep(plan);
  if (!plan || !step) return;
  const config = QUICKSTART_MODULE_CONFIG[step.moduleId];
  if (!config) return;
  const stepIndex = plan.steps.findIndex(function(item) { return item.moduleId === step.moduleId && item.status !== 'done'; });
  if (stepIndex >= 0 && plan.steps[stepIndex].status === 'pending') {
    plan.steps[stepIndex].status = 'active';
    saveQuickStartPlan(plan);
  }
  callGlobalHandler(config.openHandler);
  setSelectValue(config.runModeSelectId, plan.mode);
  setSelectValue(config.timeSelectId, step.minutes);
  if (typeof config.prepare === 'function') config.prepare(plan.mode, step, plan);
  const startHandler = window[config.startHandler];
  if (typeof startHandler === 'function') {
    startHandler.apply(null, config.startArgs || []);
  }
}

function advanceQuickStartAfterResult() {
  const plan = loadQuickStartPlan();
  if (!plan) return;
  const currentIndex = plan.steps.findIndex(function(step) { return step.status !== 'done'; });
  if (currentIndex < 0) {
    renderQuickStartState(typeof getCurrentScreenId === 'function' ? getCurrentScreenId() : 'screen-dashboard');
    return;
  }
  plan.steps[currentIndex].status = 'done';
  const nextIndex = plan.steps.findIndex(function(step) { return step.status === 'pending'; });
  if (nextIndex >= 0) plan.steps[nextIndex].status = 'active';
  if (nextIndex >= 0) {
    saveQuickStartPlan(plan);
  } else {
    const summary = buildQuickStartSummary(plan);
    saveQuickStartSummary(summary);
    pushQuickStartHistoryEntry(summary);
    saveQuickStartPlan(null);
  }
  renderQuickStartState(typeof getCurrentScreenId === 'function' ? getCurrentScreenId() : 'screen-dashboard');
  if (nextIndex >= 0) {
    startActiveQuickStartStep();
    return;
  }
  renderQuickStartCompletion(loadQuickStartSummary());
}

function isQuickStartResultScreen(step, screenId) {
  const config = step ? QUICKSTART_MODULE_CONFIG[step.moduleId] : null;
  const screens = (config && config.resultScreens) || [];
  return screens.indexOf(screenId) >= 0;
}

function renderQuickStartState(screenId) {
  const activeRoot = document.getElementById('dashboard-quickstart-active');
  const floatingBar = document.getElementById('quickstart-floating-bar');
  const plan = loadQuickStartPlan();
  const lastSummary = loadQuickStartSummary();
  const history = loadQuickStartHistory();
  const activeScreen = screenId || (typeof getCurrentScreenId === 'function' ? getCurrentScreenId() : 'screen-dashboard');
  const body = document.body;

  if (!plan) {
    if (body) body.classList.remove('quickstart-body-offset');
    if (activeRoot) {
      if (lastSummary && activeScreen === 'screen-dashboard') {
        activeRoot.className = 'dashboard-quickstart-active dashboard-quickstart-active--summary';
        activeRoot.innerHTML = '<h3>Letzter ' + getQuickStartModeLabel(lastSummary.mode).toLowerCase() + '</h3>'
          + '<p>' + lastSummary.stepCount + ' Uebungen in ' + lastSummary.totalMinutes + ' Minuten abgeschlossen. ' + lastSummary.emphasisText + ' ' + lastSummary.recommendation + '</p>'
          + '<div class="quickstart-plan-list">' + buildQuickStartPlanHtml(lastSummary.steps.slice(0, 3)) + '</div>'
          + buildQuickStartHistoryHtml(history, lastSummary.completedAt)
          + '<div class="btn-row">'
          + '<button class="btn btn-primary" type="button" data-action="openQuickStartOverlay" data-action-args=\'' + JSON.stringify([lastSummary.nextMode]) + '\'>' + (QuickStartCopy.lastBlockAction || 'Passenden Folgeblock starten') + '</button>'
          + '<button class="btn btn-outline" type="button" data-action="openLastQuickStartSummary">' + (QuickStartCopy.lastBlockReview || 'Rückblick ansehen') + '</button>'
          + '</div>';
        activeRoot.classList.remove('hidden');
      } else {
        activeRoot.innerHTML = '';
        activeRoot.className = 'dashboard-quickstart-active hidden';
      }
    }
    if (floatingBar) {
      floatingBar.innerHTML = '';
      floatingBar.classList.add('hidden');
    }
    if (typeof bindDeclarativeActions === 'function') bindDeclarativeActions();
    return;
  }

  const counts = getQuickStartCounts(plan);
  const currentStep = getQuickStartCurrentStep(plan);
  const remainingSteps = plan.steps.filter(function(step) { return step.status !== 'done'; });
  if (activeRoot) {
    activeRoot.className = 'dashboard-quickstart-active';
    activeRoot.classList.remove('hidden');
    activeRoot.innerHTML = '<h3>' + (counts.remaining ? (QuickStartCopy.activeTitle || 'Schnellblock läuft') : 'Schnellblock abgeschlossen') + '</h3>'
      + '<p>' + (counts.remaining
        ? (plan.mode === 'practice' ? 'Uebungsblock' : 'Testblock') + ' · ' + counts.done + ' von ' + counts.total + ' Uebungen erledigt. Als Naechstes kommt ' + DASHBOARD_MODULE_META[currentStep.moduleId].label + ' fuer ' + currentStep.minutes + ' Minuten.'
        : 'Der letzte Schnellblock ist abgeschlossen. Du kannst ihn beenden oder direkt einen neuen zusammenstellen.') + '</p>'
      + '<div class="quickstart-plan-list">' + buildQuickStartPlanHtml(remainingSteps.slice(0, 3)) + '</div>'
      + '<div class="btn-row">'
      + (counts.remaining ? '<button class="btn btn-primary" type="button" data-action="startActiveQuickStartStep">' + (QuickStartCopy.activeContinue || 'Weiter mit dem Block') + '</button>' : '')
      + '<button class="btn btn-outline" type="button" data-action="openQuickStartOverlay" data-action-args=\'' + JSON.stringify([plan.mode]) + '\'>' + (QuickStartCopy.activeReplan || 'Neu zusammenstellen') + '</button>'
      + '<button class="btn btn-secondary" type="button" data-action="clearQuickStartPlan">Block beenden</button>'
      + '</div>';
  }

  if (!floatingBar) return;
  const onExerciseScreen = /exercise$/.test(activeScreen);
  if (onExerciseScreen) {
    if (body) body.classList.remove('quickstart-body-offset');
    floatingBar.innerHTML = '';
    floatingBar.classList.add('hidden');
    if (typeof bindDeclarativeActions === 'function') bindDeclarativeActions();
    return;
  }

  const actionButton = counts.remaining
    ? (currentStep && isQuickStartResultScreen(currentStep, activeScreen)
      ? '<button class="btn btn-primary" type="button" data-action="advanceQuickStartAfterResult">' + (QuickStartCopy.floatingNext || 'Nächste Übung starten') + '</button>'
      : '<button class="btn btn-primary" type="button" data-action="startActiveQuickStartStep">' + (QuickStartCopy.floatingOpen || 'Aktuelle Übung öffnen') + '</button>')
    : '<button class="btn btn-primary" type="button" data-action="openQuickStartOverlay" data-action-args=\'' + JSON.stringify([plan.mode]) + '\'>Neuen Block planen</button>';

  floatingBar.classList.remove('hidden');
  if (body) body.classList.add('quickstart-body-offset');
  floatingBar.innerHTML = '<div class="quickstart-floating-bar-inner">'
    + '<div>'
    + '<strong>' + (counts.remaining
      ? (plan.mode === 'practice' ? (QuickStartCopy.floatingRunningPractice || 'Übungsblock läuft') : (QuickStartCopy.floatingRunningTest || 'Testblock läuft'))
      : 'Schnellblock abgeschlossen') + '</strong>'
    + '<p>' + (counts.remaining
      ? 'Schritt ' + (counts.done + 1) + ' von ' + counts.total + ': ' + DASHBOARD_MODULE_META[currentStep.moduleId].label + ' · ' + currentStep.minutes + ' Minuten.'
      : 'Alle empfohlenen Uebungen dieses Blocks sind abgeschlossen.') + '</p>'
    + '</div>'
    + '<div class="btn-row">'
    + actionButton
    + '<button class="btn btn-outline" type="button" data-action="openQuickStartOverlay" data-action-args=\'' + JSON.stringify([plan.mode]) + '\'>' + (QuickStartCopy.floatingView || 'Block ansehen') + '</button>'
    + '<button class="btn btn-secondary" type="button" data-action="clearQuickStartPlan">Beenden</button>'
    + '</div>'
    + '</div>';

  if (typeof bindDeclarativeActions === 'function') bindDeclarativeActions();
}

function cloneTemplateContent(templateId) {
  const template = document.getElementById(templateId);
  return template ? template.content.firstElementChild.cloneNode(true) : null;
}

function callGlobalHandler(handlerName) {
  const handler = window[handlerName];
  if (typeof handler === 'function') handler();
}

function renderResultScreenFooters() {
  const roots = document.querySelectorAll('[data-result-footer]');
  if (!roots.length) return;

  roots.forEach(root => {
    const footerKey = root.dataset.resultFooter;
    const footerDef = RESULT_SCREEN_FOOTER_DEFS[footerKey];
    if (!footerDef) return;
    const footer = cloneTemplateContent('result-screen-footer-template');
    if (!footer) return;

    const insight = footer.querySelector('.result-insight');
    const buttonRow = footer.querySelector('.btn-row');
    if (insight) {
      insight.id = footerDef.insightId;
      insight.textContent = DashboardCopy.resultPlaceholder || 'Hier erscheint nach der Übung eine kurze Einordnung.';
    }
    if (buttonRow && footerDef.buttonRowStyle) buttonRow.style.cssText = footerDef.buttonRowStyle;

    footerDef.buttons.forEach(buttonDef => {
      if (!buttonRow) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = buttonDef.className;
      button.textContent = buttonDef.label;
      button.addEventListener('click', function() {
        callGlobalHandler(buttonDef.handler);
      });
      buttonRow.appendChild(button);
    });

    root.innerHTML = '';
    root.appendChild(footer);
  });
}

function renderDashboardStructure() {
  const quickRoot = document.getElementById('dashboard-quick-cards');
  const sectionsRoot = document.getElementById('dashboard-sections-root');
  if (!quickRoot || !sectionsRoot) return;

  quickRoot.innerHTML = '';
  DASHBOARD_QUICK_CARD_SLOTS.forEach(cardDef => {
    const card = cloneTemplateContent('dashboard-quick-card-template');
    if (!card) return;
    card.id = `dashboard-quick-${cardDef.slot}`;
    card.dataset.slot = cardDef.slot;
    card.addEventListener('click', function() {
      openDashboardQuickAction(cardDef.slot);
    });
    const tag = card.querySelector('.tag');
    const title = card.querySelector('strong');
    const copy = card.querySelector('.dashboard-quick-card-copy');
    if (tag) tag.textContent = cardDef.tag;
    if (title) title.textContent = cardDef.fallbackTitle;
    if (copy) copy.textContent = cardDef.fallbackText;
    quickRoot.appendChild(card);
  });

  sectionsRoot.innerHTML = '';
  DASHBOARD_SECTION_DEFS.forEach(sectionDef => {
    const section = cloneTemplateContent('dashboard-section-template');
    if (!section) return;
    const title = section.querySelector('.dashboard-section-title');
    const copy = section.querySelector('.dashboard-section-copy');
    const grid = section.querySelector('.dashboard-grid');
    if (title) title.textContent = sectionDef.title;
    if (copy) copy.textContent = sectionDef.copy;

    sectionDef.cards.forEach(cardDef => {
      const meta = DASHBOARD_MODULE_META[cardDef.moduleId];
      const card = cloneTemplateContent('dashboard-module-card-template');
      if (!card || !meta) return;
      card.id = `dash-card-${cardDef.moduleId}`;
      card.classList.toggle('dash-card--accent', !!cardDef.accent);
      const kicker = card.querySelector('.dash-kicker');
      const status = card.querySelector('.dash-card-status');
      const heading = card.querySelector('h2');
      const body = card.querySelector('p');
      const button = card.querySelector('button');
      if (kicker) kicker.textContent = cardDef.kicker;
      if (status) {
        status.id = meta.badgeId;
        status.textContent = DashboardCopy.statusReady || 'Bereit';
      }
      if (heading) heading.textContent = cardDef.title;
      if (body) body.textContent = cardDef.copy;
      if (button) {
        button.addEventListener('click', function() {
          callGlobalHandler(meta.openHandler);
        });
      }
      grid.appendChild(card);
    });

    sectionsRoot.appendChild(section);
  });
}

function updateGlobalStorageWarning() {
  const banner = document.getElementById('storage-warning-banner');
  if (!banner) return;
  const combinedWarning = [trainingLogParseWarningMessage, trainingLogSaveWarningMessage].filter(Boolean).join(' ');
  if (combinedWarning) {
    banner.textContent = combinedWarning;
    banner.classList.remove('hidden');
  } else {
    banner.textContent = '';
    banner.classList.add('hidden');
  }
}

function loadTrainingLog() {
  try {
    const raw = localStorage.getItem(TRAINING_LOG_KEY);
    trainingLogParseWarningMessage = '';
    updateGlobalStorageWarning();
    return raw ? JSON.parse(raw) : [];
  } catch(e) {
    trainingLogParseWarningMessage = DashboardCopy.storageReadWarning || 'Trainingsdaten konnten nicht vollständig gelesen werden. Der Verlauf wurde vorsichtshalber zurückgesetzt.';
    updateGlobalStorageWarning();
    return [];
  }
}

function isScoringEligibleEntry(entry) {
  return !!entry && entry.countsTowardScoring !== false;
}

function getScoringEntries(entries) {
  return (Array.isArray(entries) ? entries : []).filter(isScoringEligibleEntry);
}

function saveTrainingEntry(entry) {
  const log = loadTrainingLog();
  const candidate = {
    ...entry,
    runMode: entry && entry.runMode === 'practice' ? 'practice' : 'test',
    countsTowardScoring: entry && entry.countsTowardScoring === false ? false : !(entry && entry.runMode === 'practice'),
    id: Date.now(),
    date: new Date().toISOString(),
    nonClinical: true
  };
  const storedEntry = window.TrainingScoringEngine
    ? window.TrainingScoringEngine.enrichTrainingEntry(candidate, log)
    : candidate;
  log.push(storedEntry);
  if (log.length > 1000) log.splice(0, log.length - 1000);
  try {
    localStorage.setItem(TRAINING_LOG_KEY, JSON.stringify(log));
    trainingLogSaveWarningMessage = '';
    updateGlobalStorageWarning();
    refreshDashboardSummary();
  } catch(e) {
    trainingLogSaveWarningMessage = DashboardCopy.storageSaveWarning || 'Trainingsdaten konnten nicht gespeichert werden. Der Browser-Speicher ist wahrscheinlich voll.';
    updateGlobalStorageWarning();
  }
}

function deleteAllLogs() {
  if (confirm(DashboardCopy.deleteLogsConfirm || 'Alle Trainingsdaten wirklich löschen?\nDiese Aktion kann nicht rückgängig gemacht werden.')) {
    localStorage.removeItem(TRAINING_LOG_KEY);
    trainingLogParseWarningMessage = '';
    trainingLogSaveWarningMessage = '';
    updateGlobalStorageWarning();
    refreshDashboardSummary();
    renderAnalytics(document.getElementById('analytics-filter').value);
  }
}

function openAnalytics() {
  document.getElementById('analytics-filter').value = 'all';
  renderAnalytics('all');
  showScreen('screen-analytics');
}

function formatLogDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatLogTime(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function formatDashboardDuration(seconds) {
  if (!seconds || seconds <= 0) return '0 Min';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours <= 0) return `${Math.max(1, minutes)} Min`;
  if (minutes <= 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function getTrainingEntryLabel(entry) {
  if (!entry) return '-';
  if (entry.module === 'spatial_views') return 'Rotations-Übung';
  return entry.label || entry.module;
}

function getDashboardModuleStats(log) {
  return Object.keys(DASHBOARD_MODULE_META).map(moduleId => {
    const meta = DASHBOARD_MODULE_META[moduleId];
    const entries = log.filter(entry => meta.moduleKeys.includes(entry.module));
    const scoringEntries = getScoringEntries(entries);
    const performanceEntries = buildPerformanceSeries(scoringEntries);
    const lastEntry = entries.length ? entries[entries.length - 1] : null;
    const lastTs = lastEntry ? new Date(lastEntry.date).getTime() : 0;
    const avgAccuracy = averageOf(scoringEntries.map(entry => entry.accuracy).filter(value => typeof value === 'number' && isFinite(value)));
    const avgPerformance = averageOf(performanceEntries.map(entry => entry.performanceScore).filter(value => typeof value === 'number' && isFinite(value)));
    return {
      moduleId,
      meta,
      entries,
      count: entries.length,
      lastEntry,
      lastTs,
      avgAccuracy: avgAccuracy === null ? 0 : avgAccuracy,
      avgPerformance: avgPerformance === null ? 0 : avgPerformance
    };
  });
}

function applyDashboardCardStatuses(moduleStats) {
  moduleStats.forEach(stat => {
    const badge = document.getElementById(stat.meta.badgeId);
    if (!badge) return;
    badge.className = 'dash-card-status';
    if (!stat.count) {
      badge.textContent = DashboardCopy.statusNew || 'Neu';
      badge.classList.add('dash-card-status--new');
      return;
    }
    const daysSince = Math.floor((Date.now() - stat.lastTs) / 86400000);
    if (daysSince >= 5) {
      badge.textContent = DashboardCopy.statusResume || 'Wieder aufnehmen';
      badge.classList.add('dash-card-status--return');
      return;
    }
    if (daysSince <= 1) {
      badge.textContent = DashboardCopy.statusLastUsed || 'Zuletzt genutzt';
      badge.classList.add('dash-card-status--last');
      return;
    }
    badge.textContent = DashboardCopy.statusReady || 'Bereit';
  });
}

function updateDashboardQuickCards(moduleStats) {
  const rankedByGap = moduleStats
    .slice()
    .sort((a, b) => (a.count - b.count) || (a.lastTs - b.lastTs));
  const rankedRecent = moduleStats
    .filter(stat => stat.count > 0)
    .slice()
    .sort((a, b) => b.lastTs - a.lastTs);
  const rankedStrong = moduleStats
    .filter(stat => stat.count > 0)
    .slice()
    .sort((a, b) => b.avgPerformance - a.avgPerformance);

  const primary = rankedByGap[0] || moduleStats[0];
  const secondary = rankedRecent[0] || rankedByGap[1] || moduleStats[1] || primary;
  const tertiary = rankedStrong.find(stat => stat.moduleId !== primary.moduleId && stat.moduleId !== secondary.moduleId)
    || rankedByGap.find(stat => stat.moduleId !== primary.moduleId && stat.moduleId !== secondary.moduleId)
    || moduleStats[2]
    || primary;

  dashboardQuickActions = {
    primary: primary.moduleId,
    secondary: secondary.moduleId,
    tertiary: tertiary.moduleId
  };

  const mapping = {
    primary: {
      title: primary.meta.label,
      text: typeof DashboardCopy.quickCardText === 'function'
        ? DashboardCopy.quickCardText('primary', primary.count > 0)
        : (primary.count
          ? 'Diese Übung hattest du zuletzt seltener im Fokus. Sie ist ein guter nächster Schritt zur Abwechslung.'
          : 'Hier lohnt sich ein erster Start, damit du auch in diesem Bereich einen Vergleichswert aufbaust.')
    },
    secondary: {
      title: secondary.meta.label,
      text: typeof DashboardCopy.quickCardText === 'function'
        ? DashboardCopy.quickCardText('secondary', secondary.count > 0)
        : (secondary.count
          ? 'Damit kannst du dort weitermachen, wo du zuletzt aufgehört hast.'
          : 'Eine gute Wahl für eine kurze, vertraute Trainingseinheit.')
    },
    tertiary: {
      title: tertiary.meta.label,
      text: typeof DashboardCopy.quickCardText === 'function'
        ? DashboardCopy.quickCardText('tertiary', tertiary.count > 0)
        : (tertiary.count
          ? 'Hier lief es zuletzt solide. Gut, wenn du an einer Stärke weiterarbeiten möchtest.'
          : 'Passt gut, wenn du heute bewusst etwas anderes als sonst machen möchtest.')
    }
  };

  Object.keys(mapping).forEach(slot => {
    const root = document.getElementById(`dashboard-quick-${slot}`);
    if (!root) return;
    const strong = root.querySelector('strong');
    const text = root.querySelector('span:last-child');
    if (strong) strong.textContent = mapping[slot].title;
    if (text) text.textContent = mapping[slot].text;
  });
}

function openDashboardQuickAction(slot) {
  const moduleId = dashboardQuickActions[slot];
  const meta = DASHBOARD_MODULE_META[moduleId];
  if (meta) callGlobalHandler(meta.openHandler);
}

function refreshDashboardSummary() {
  renderDashboardStructure();
  const totalSessionsEl = document.getElementById('dashboard-total-sessions');
  const totalDurationEl = document.getElementById('dashboard-total-duration');
  const averageAccuracyEl = document.getElementById('dashboard-average-accuracy');
  const lastModuleEl = document.getElementById('dashboard-last-module');
  const focusNoteEl = document.getElementById('dashboard-focus-note');
  if (!totalSessionsEl || !totalDurationEl || !averageAccuracyEl || !lastModuleEl || !focusNoteEl) return;

  const log = loadTrainingLog();
  const moduleStats = getDashboardModuleStats(log);
  const scoringLog = getScoringEntries(log);
  const performanceLog = buildPerformanceSeries(scoringLog);
  const totalSessions = log.length;
  const totalDuration = log.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const accValues = scoringLog
    .map(entry => entry.accuracy)
    .filter(value => typeof value === 'number' && isFinite(value));
  const avgAccuracy = averageOf(accValues);
  const lastEntry = totalSessions ? log[log.length - 1] : null;

  totalSessionsEl.textContent = String(totalSessions);
  totalDurationEl.textContent = formatDashboardDuration(totalDuration);
  averageAccuracyEl.textContent = `${avgAccuracy === null ? 0 : avgAccuracy}%`;
  lastModuleEl.textContent = lastEntry ? getTrainingEntryLabel(lastEntry) : '-';
  applyDashboardCardStatuses(moduleStats);
  updateDashboardQuickCards(moduleStats);

  if (window.TrainingScoringEngine && window.TrainingScoringUI) {
    const dashboardModel = window.TrainingScoringEngine.buildDashboardModel(log, DASHBOARD_MODULE_META);
    window.TrainingScoringUI.renderDashboardPanels(dashboardModel);
  }

  if (!totalSessions) {
    focusNoteEl.textContent = DashboardCopy.noTrainingDataFocus || 'Du hast noch keine Trainingsdaten. Starte einfach mit einer Übung, dann erscheint hier dein Überblick.';
    return;
  }

  const recent = scoringLog.slice(-5);
  const recentPerformance = averageOf(buildPerformanceSeries(recent).map(entry => entry.performanceScore));
  const grouped = {};
  scoringLog.forEach(entry => {
    if (!grouped[entry.module]) grouped[entry.module] = [];
    grouped[entry.module].push(entry);
  });
  const weakest = Object.keys(grouped)
    .map(module => ({
      module,
      avg: averageOf(buildPerformanceSeries(grouped[module].slice(-4)).map(entry => entry.performanceScore))
    }))
    .filter(item => item.avg !== null)
    .sort((a, b) => a.avg - b.avg)[0];

  if (weakest && recentPerformance !== null) {
    focusNoteEl.textContent = typeof DashboardCopy.focusRecommendation === 'function'
      ? DashboardCopy.focusRecommendation(recentPerformance, getTrainingEntryLabel(grouped[weakest.module][0]))
      : `Dein letzter Leistungswert liegt im Schnitt bei ${recentPerformance}/100. Gerade lohnt sich besonders ${getTrainingEntryLabel(grouped[weakest.module][0])}, weil dort Tempo und Genauigkeit zuletzt am weitesten auseinanderlagen.`;
    return;
  }

  focusNoteEl.textContent = lastEntry
    ? (typeof DashboardCopy.lastTrained === 'function'
      ? DashboardCopy.lastTrained(getTrainingEntryLabel(lastEntry), formatLogDate(lastEntry.date), formatLogTime(lastEntry.date))
      : `Zuletzt trainiert: ${getTrainingEntryLabel(lastEntry)} am ${formatLogDate(lastEntry.date)} um ${formatLogTime(lastEntry.date)}.`)
    : (DashboardCopy.loadedState || 'Dein Verlauf ist geladen.');
}

function getFilteredTrainingEntries(filter) {
  const allLog = loadTrainingLog();
  return filter === 'all' ? allLog : allLog.filter(e => e.module === filter);
}

function averageOf(values) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;
}

function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function medianOf(values) {
  if (!values.length) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  return sorted[mid];
}

const PERFORMANCE_RT_BASELINES = {
  gonogo: 780,
  stroop: 1100,
  concentration: 700,
  spatial_views: 3200,
  formen: 2200,
  flanker: 700,
  visual_search: 1500
};

function getEntryAvgRtMs(entry) {
  if (!entry) return null;
  if (typeof entry.avgRt === 'number' && isFinite(entry.avgRt)) return entry.avgRt;
  if (typeof entry.avgRtAll === 'number' && isFinite(entry.avgRtAll)) return entry.avgRtAll;
  if (typeof entry.avgRt === 'string') {
    const value = parseFloat(entry.avgRt.replace(',', '.'));
    if (!isFinite(value)) return null;
    if (entry.avgRt.includes(' s')) return Math.round(value * 1000);
    return Math.round(value);
  }
  return null;
}

function getModuleContextKey(moduleId, options) {
  const data = options || {};
  if (moduleId === 'math') return `math_${data.mode || 'mix'}`;
  if (moduleId === 'rotation') return 'spatial_views';
  if (moduleId === 'visualsearch') return 'visual_search';
  return moduleId;
}

function getRtBaselineForModule(moduleKey, historyEntries) {
  const historicalRt = (historyEntries || [])
    .map(getEntryAvgRtMs)
    .filter(value => typeof value === 'number' && isFinite(value));
  if (historicalRt.length >= 2) {
    return medianOf(historicalRt.slice(-5));
  }
  return PERFORMANCE_RT_BASELINES[moduleKey] || null;
}

function getSpeedScore(avgRt, baselineRt) {
  if (avgRt === null || baselineRt === null) return null;
  const ratio = avgRt / Math.max(1, baselineRt);
  return clampValue(Math.round(100 - ((ratio - 1) * 60)), 20, 100);
}

function getPerformanceMetrics(moduleKey, accuracy, avgRt, historyEntries) {
  const baselineRt = getRtBaselineForModule(moduleKey, historyEntries);
  const speedScore = getSpeedScore(avgRt, baselineRt);
  const score = speedScore === null
    ? clampValue(Math.round(accuracy), 0, 100)
    : clampValue(Math.round((accuracy * 0.72) + (speedScore * 0.28)), 0, 100);
  return { score, speedScore, baselineRt };
}

function buildPerformanceSeries(entries) {
  if (window.TrainingScoringEngine) {
    return window.TrainingScoringEngine.buildPerformanceSeries(entries);
  }
  const historyByModule = {};
  return entries.map(entry => {
    const moduleKey = getModuleContextKey(entry.module || '', entry);
    const priorEntries = historyByModule[moduleKey] || [];
    const avgRt = getEntryAvgRtMs(entry);
    const metrics = getPerformanceMetrics(moduleKey, entry.accuracy || 0, avgRt, priorEntries);
    if (isScoringEligibleEntry(entry)) {
      historyByModule[moduleKey] = priorEntries.concat(entry);
    }
    return {
      ...entry,
      avgRtMs: avgRt,
      performanceScore: metrics.score,
      speedScore: metrics.speedScore,
      baselineRt: metrics.baselineRt
    };
  });
}

function getCurrentPerformanceSnapshot(moduleId, accuracy, options) {
  if (window.TrainingScoringEngine) {
    return window.TrainingScoringEngine.evaluateTransientResult(moduleId, {
      ...options,
      accuracy
    }, loadTrainingLog());
  }
  const moduleKey = getModuleContextKey(moduleId, options);
  const allLog = loadTrainingLog();
  const historyEntries = getScoringEntries(allLog.filter(entry => entry.module === moduleKey));
  const avgRt = getEntryAvgRtMs(options || {});
  const metrics = getPerformanceMetrics(moduleKey, accuracy, avgRt, historyEntries);
  const priorScores = buildPerformanceSeries(historyEntries).slice(-4).map(entry => entry.performanceScore);
  const trendDelta = priorScores.length ? metrics.score - averageOf(priorScores) : null;
  return {
    moduleKey,
    avgRt,
    historyEntries,
    score: metrics.score,
    speedScore: metrics.speedScore,
    baselineRt: metrics.baselineRt,
    trendDelta
  };
}

function getResultInsightTone(score) {
  if (score >= 85) return 'good';
  if (score >= 60) return 'mid';
  return 'low';
}

function getResultInsightLead(score) {
  if (score >= 90) return 'Sehr stark:';
  if (score >= 80) return 'Stabil:';
  if (score >= 65) return 'Ordentlich:';
  if (score >= 45) return 'Ausbaufähig:';
  return 'Noch holprig:';
}

function describePerformanceTrend(delta) {
  if (delta === null) return 'ohne Vergleichswert';
  if (delta >= 8) return `spürbar besser als zuletzt (+${delta})`;
  if (delta >= 3) return `leicht besser als zuletzt (+${delta})`;
  if (delta <= -8) return `spürbar schwächer als zuletzt (${delta})`;
  if (delta <= -3) return `leicht schwächer als zuletzt (${delta})`;
  return 'nahe an deinem letzten Niveau';
}

function describeTempo(avgRt, baselineRt, speedScore) {
  if (avgRt === null || baselineRt === null || speedScore === null) return 'ohne gesonderte Tempowertung';
  if (speedScore >= 88) return `Tempo klar stark (${avgRt} ms)`;
  if (speedScore >= 72) return `Tempo passend (${avgRt} ms)`;
  return `Tempo bremst noch (${avgRt} ms)`;
}

function buildResultInsight(moduleId, pct, options) {
  const data = options || {};
  const performance = getCurrentPerformanceSnapshot(moduleId, pct, data);
  const lead = getResultInsightLead(performance.score);
  const trendText = describePerformanceTrend(performance.trendDelta);
  const tempoText = describeTempo(performance.avgRt, performance.baselineRt, performance.speedScore);
  const speedDominates = performance.speedScore !== null && performance.speedScore < 72 && pct >= 75;
  const accuracyDominates = performance.speedScore !== null && performance.speedScore >= 88 && pct < 70;

  if (moduleId === 'speed') {
    return pct >= 80
      ? `${lead} Du rechnest aktuell ${trendText}. Die Genauigkeit ist gut, jetzt zählt vor allem, das Niveau länger zu halten.`
      : `${lead} Die Grundidee sitzt, aber unter Zeitdruck entstehen noch Fehler. Arbeite zuerst an sauberen Serien, bevor du weiter beschleunigst.`;
  }
  if (moduleId === 'math') {
    return pct >= 80
      ? `${lead} Deine Rechenwege sind ${trendText}. Jetzt lohnt sich mehr Tempo oder ein schwierigerer Modus.`
      : `${lead} Rechne weiter bewusst sauber. Erst wenn die Trefferquote stabil ist, lohnt sich mehr Tempo.`;
  }
  if (moduleId === 'spatial') {
    return pct >= 80
      ? `${lead} Du erkennst die Würfelstrukturen sicher und bist ${trendText}. Mehr Zeitdruck oder längere Serien sind jetzt sinnvoll.`
      : `${lead} Achte noch genauer auf verdeckte Würfel und sichtbare Lücken in der Struktur.`;
  }
  if (moduleId === 'nback') {
    return pct >= 80
      ? `${lead} Dein Arbeitsgedächtnis wirkt hier stabil und ${trendText}. Ein längerer Block oder Testmodus passt gut als nächster Schritt.`
      : `${lead} Nimm dir bei jeder Zahl kurz den Vergleich zu vor zwei Schritten vor, statt zu schnell zu reagieren.`;
  }
  if (moduleId === 'gonogo') {
    if (speedDominates) return `${lead} Trefferquote stark, aber ${tempoText}. Der nächste Hebel ist schnelleres Entscheiden bei gleichbleibender Kontrolle.`;
    if (accuracyDominates) return `${lead} Das Tempo ist gut, aber die Fehlerquote kostet Punkte. Mehr Ruhe vor dem Reagieren lohnt sich gerade mehr als noch mehr Geschwindigkeit.`;
    return pct >= 80
      ? `${lead} Deine Reaktionskontrolle ist stabil und ${trendText}. ${tempoText}.`
      : `${lead} Achte stärker auf die Regel und stoppe bewusster bei NO-GO oder anderen Reizen.`;
  }
  if (moduleId === 'stroop') {
    if (speedDominates) return `${lead} Die Regel sitzt, aber ${tempoText}. Wenn du etwas schneller umschaltest, steigt dein Gesamtwert deutlich.`;
    if (accuracyDominates) return `${lead} Das Tempo passt, aber beim Regelwechsel gehen noch zu viele Antworten verloren. Prüfe vor jeder Antwort kurz, ob Wort oder Schriftfarbe zählt.`;
    return pct >= 80
      ? `${lead} Du hältst die aktuelle Regel gut und bist ${trendText}. ${tempoText}.`
      : `${lead} Prüfe vor jeder Antwort kurz, ob Farbe oder Wort zählt. Genau dort entstehen hier meist die Fehler.`;
  }
  if (moduleId === 'sequence') {
    return pct >= 80
      ? `${lead} Du erkennst Muster sicher und bist ${trendText}. Jetzt kannst du Reihen schneller lösen oder Hinweise seltener nutzen.`
      : `${lead} Suche zuerst nach einer einfachen Regel wie plus, minus oder Wechselmuster, bevor du rätst.`;
  }
  if (moduleId === 'rotation') {
    if (speedDominates) return `${lead} Räumlich triffst du schon gut, aber ${tempoText}. Wenn du Drehungen schneller abgleichst, bringt das sofort mehr.`;
    return pct >= 80
      ? `${lead} Deine räumliche Vorstellung wirkt sicher und ${trendText}. ${tempoText}.`
      : `${lead} Drehe die Form gedanklich Schritt für Schritt und prüfe bewusst, ob nur ähnlich aussehende Antworten dich täuschen.`;
  }
  if (moduleId === 'formen') {
    if (speedDominates) return `${lead} Du findest die Unterschiede zuverlässig, aber ${tempoText}. Als Nächstes lohnt sich vor allem schnelleres Mustern.`;
    return pct >= 80
      ? `${lead} Du findest kleine Unterschiede zuverlässig und bist ${trendText}. ${tempoText}.`
      : `${lead} Schau noch systematischer auf Linien, Ausrichtung und kleine Details, statt den ersten Eindruck zu nehmen.`;
  }
  if (moduleId === 'concentration') {
    if (speedDominates) return `${lead} Du erkennst die Reize ordentlich, aber ${tempoText}. Reagiere etwas schneller, ohne hektischer zu werden.`;
    return pct >= 80
      ? `${lead} Du erkennst Doppelsprünge sicher und bist ${trendText}. ${tempoText}.`
      : `${lead} Reagiere nur auf echte Doppelsprünge und bleibe zwischen den Klicks bewusst ruhig.`;
  }
  if (moduleId === 'multitasking') {
    const mathAccuracy = data.mathAccuracy || 0;
    const topAccuracy = data.topAccuracy || 0;
    if (pct >= 80) return `${lead} Du hältst beide Aufgaben gut zusammen und bist ${trendText}. Jetzt kannst du vor allem an noch mehr Tempo arbeiten.`;
    return mathAccuracy >= topAccuracy
      ? `${lead} Das Rechnen war stabiler als die obere Aufgabe. Der nächste Fokus sollte auf sauberem Reagieren unter Doppelbelastung liegen.`
      : `${lead} Die obere Aufgabe lief stabiler als das Rechnen. Als Nächstes lohnt sich mehr Ruhe im unteren Rechenteil.`;
  }
  if (moduleId === 'digitspan') {
    const maxSpan = data.maxSpan || 0;
    if (pct >= 80) return `${lead} Deine Merkspanne ist stabil und ${trendText}. Beste Folge heute: ${maxSpan}. Rückwärts oder längere Folgen sind jetzt sinnvoll.`;
    return `${lead} Wiederhole die Zahlen innerlich ruhig und gleichmäßig. Beste Folge heute: ${maxSpan}.`; 
  }
  if (moduleId === 'flanker') {
    if (speedDominates) return `${lead} Die Störreize blendest du ordentlich aus, aber ${tempoText}. Mehr Entschlossenheit bei der Antwort hilft hier direkt.`;
    if (accuracyDominates) return `${lead} Das Tempo ist schon gut, aber die Ablenkung kostet noch zu viele Punkte. Richte den Blick noch konsequenter auf den mittleren Pfeil.`;
    return pct >= 80
      ? `${lead} Du blendest die störenden Pfeile gut aus und bist ${trendText}. ${tempoText}.`
      : `${lead} Richte den Blick noch konsequenter auf den mittleren Pfeil und ignoriere die äußeren Reize bewusster.`;
  }
  if (moduleId === 'visualsearch') {
    if (speedDominates) return `${lead} Du findest den Zielreiz meist zuverlässig, aber ${tempoText}. Ein etwas direkteres Scannen des Feldes würde jetzt am meisten bringen.`;
    return pct >= 80
      ? `${lead} Du findest den Zielreiz zuverlässig und bist ${trendText}. ${tempoText}.`
      : `${lead} Arbeite lieber etwas systematischer durch das Feld, statt zu schnell zu klicken.`;
  }
  return `${lead} Dein Leistungswert liegt bei ${performance.score}. Du bist ${trendText}. Bleib bei kurzen, sauberen Einheiten und steigere erst dann das Tempo.`;
}

function setResultInsight(id, moduleId, pct, options) {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.TrainingScoringEngine && window.TrainingScoringUI) {
    const evaluated = window.TrainingScoringEngine.evaluateTransientResult(moduleId, {
      ...options,
      accuracy: pct
    }, loadTrainingLog());
    window.TrainingScoringUI.renderResultInsight(el, evaluated);
    return;
  }
  const performance = getCurrentPerformanceSnapshot(moduleId, pct, options || {});
  const tone = getResultInsightTone(performance.score);
  el.className = `result-insight result-insight--${tone}`;
  el.innerHTML = `<strong>${buildResultInsight(moduleId, pct, options)}</strong>`;
}

function calculateTrendSlope(values) {
  if (!values.length) return 0;
  const data = values.slice(-8);
  if (data.length < 2) return 0;
  const first = data[0];
  const last = data[data.length - 1];
  return Math.round((last - first) * 10) / 10;
}

function describeTrend(slope) {
  if (slope >= 6) return 'deutlich steigend';
  if (slope >= 2) return 'leicht steigend';
  if (slope <= -6) return 'deutlich fallend';
  if (slope <= -2) return 'leicht fallend';
  return 'stabil';
}

function getRecommendedDifficultyByAccuracy(entries) {
  const recent = entries.slice(-5);
  const avgAcc = averageOf(recent.map(e => e.accuracy || 0));
  if (avgAcc === null) return 'medium';
  if (avgAcc >= 84) return 'hard';
  if (avgAcc <= 58) return 'easy';
  return 'medium';
}

function buildHomeRecommendation(moduleKey) {
  const entries = getFilteredTrainingEntries(moduleKey);
  if (!entries.length) {
    if (moduleKey === 'digitspan') return '<strong>Hinweis:</strong> Starte mit Vorwärts für 5 Minuten. So bekommst du zuerst ein gutes Gefühl für die Aufgabe.';
    return '<strong>Hinweis:</strong> Starte mit Mittel für 5 Minuten. Wenn du sicher triffst, kannst du später steigern.';
  }

  if (moduleKey === 'digitspan') {
    const recent = entries.slice(-5);
    const avgAcc = averageOf(recent.map(e => e.accuracy || 0)) || 0;
    const bestSpan = Math.max(...recent.map(e => e.maxSpan || 0), 0);
    if (avgAcc >= 82 && bestSpan >= 6) {
      return `<strong>Hinweis:</strong> Du warst zuletzt sehr sicher. Probiere jetzt <b>Rückwärts</b> oder längere Folgen. Deine beste Spanne zuletzt: <b>${bestSpan}</b>.`;
    }
    return `<strong>Hinweis:</strong> Bleib vorerst bei <b>${digitSpanModeLabel((recent[recent.length - 1] || {}).mode || 'forward')}</b>. Deine Trefferquote zuletzt: <b>${avgAcc}%</b>.`;
  }

  const recommended = getRecommendedDifficultyByAccuracy(entries);
  const label = recommended === 'hard' ? 'Schwer' : (recommended === 'easy' ? 'Leicht' : 'Mittel');
  const avgAcc = averageOf(entries.slice(-5).map(e => e.accuracy || 0)) || 0;
  return `<strong>Hinweis:</strong> Als Nächstes passt das Niveau <b>${label}</b>. Deine Trefferquote in den letzten Sitzungen: <b>${avgAcc}%</b>.`;
}

function refreshAdaptiveHints() {
  const mapping = {
    'digitspan-home-recommendation': 'digitspan',
    'flanker-home-recommendation': 'flanker',
    'visualsearch-home-recommendation': 'visual_search',
    'pqscan-home-recommendation': 'pqscan'
  };
  Object.keys(mapping).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = buildHomeRecommendation(mapping[id]);
  });
}

function getAnalyticsRecommendation(filter, entries, allLog) {
  if (!entries.length) {
    return 'Mach zuerst ein paar kurze Sitzungen. Danach lassen sich deine Ergebnisse besser einschätzen.';
  }
  if (filter !== 'all') {
    const performanceEntries = buildPerformanceSeries(entries);
    const latest = performanceEntries[performanceEntries.length - 1];
    const recommended = filter === 'digitspan'
      ? buildHomeRecommendation(filter).replace(/<[^>]+>/g, '')
      : latest && latest.speedScore !== null && latest.speedScore < 72 && latest.accuracy >= 75
        ? 'Die Genauigkeit ist schon gut. Der nächste Schritt ist vor allem schnelleres, aber kontrolliertes Antworten.'
        : `Deine letzten fünf Sitzungen sprechen für ${getRecommendedDifficultyByAccuracy(entries) === 'hard' ? 'Schwer' : (getRecommendedDifficultyByAccuracy(entries) === 'easy' ? 'Leicht' : 'Mittel')}.`;
    return recommended;
  }

  const grouped = {};
  getScoringEntries(allLog).forEach(entry => {
    if (!grouped[entry.module]) grouped[entry.module] = [];
    grouped[entry.module].push(entry);
  });
  const ranked = Object.keys(grouped)
    .map(module => ({ module, avg: averageOf(buildPerformanceSeries(grouped[module].slice(-4)).map(e => e.performanceScore)) || 0 }))
    .sort((a, b) => b.avg - a.avg);
  const best = ranked[0];
  const weakest = ranked[ranked.length - 1];
  if (!best || !weakest) return 'Trainiere weiter möglichst ausgewogen und beobachte, wie sich deine Werte entwickeln.';
  return `Aktuell läuft es am besten bei ${getTrainingEntryLabel((grouped[best.module] || [])[0])}. Am meisten lohnt sich als Nächstes ${getTrainingEntryLabel((grouped[weakest.module] || [])[0])}.`;
}

function renderAnalyticsInsights(entries, filter, allLog) {
  const container = document.getElementById('analytics-insights');
  if (!container) return;
  const performanceEntries = buildPerformanceSeries(entries);
  const slope = calculateTrendSlope(performanceEntries.map(entry => entry.performanceScore));
  const avgScore = averageOf(performanceEntries.map(entry => entry.performanceScore));
  const rtValues = performanceEntries.map(e => e.avgRtMs).filter(v => typeof v === 'number' && isFinite(v));
  const avgRt = averageOf(rtValues);
  const last = performanceEntries.length ? performanceEntries[performanceEntries.length - 1] : null;
  container.innerHTML = `
    <div class="stat-box"><span class="a-lbl">Leistungswert</span><strong>${avgScore === null ? '-' : `${avgScore}/100`}</strong><div class="math-note" style="margin-top:8px;">Bewertet die Balance aus Trefferquote und Tempo, wenn Reaktionszeit vorhanden ist.</div></div>
    <div class="stat-box"><span class="a-lbl">Trend letzte Sitzungen</span><strong>${describeTrend(slope)}</strong><div class="math-note" style="margin-top:8px;">Veränderung beim Leistungswert: ${slope > 0 ? '+' : ''}${slope} Punkte</div></div>
    <div class="stat-box"><span class="a-lbl">Tempo & nächster Schritt</span><strong style="font-size:1.05em; line-height:1.4;">${avgRt === null ? 'Ohne separate Tempomessung' : `${avgRt} ms im Schnitt`}</strong><div class="math-note" style="margin-top:8px;">${getAnalyticsRecommendation(filter, entries, allLog)}${last ? ` Zuletzt: ${getTrainingEntryLabel(last)} mit ${last.performanceScore}/100.` : ''}</div></div>
  `;
}

function updateAnalyticsWarning() {
  const warning = document.getElementById('analytics-warning');
  if (!warning) return;
  const combinedWarning = [trainingLogParseWarningMessage, trainingLogSaveWarningMessage].filter(Boolean).join(' ');
  if (combinedWarning) {
    trainingLogWarningMessage = combinedWarning;
    warning.textContent = combinedWarning;
    warning.style.display = '';
  } else {
    trainingLogWarningMessage = '';
    warning.textContent = '';
    warning.style.display = 'none';
  }
}

function accBadge(pct) {
  if (pct >= 80) return `<span class="analytics-badge badge-good">${pct}%</span>`;
  if (pct >= 50) return `<span class="analytics-badge badge-ok">${pct}%</span>`;
  return `<span class="analytics-badge badge-poor">${pct}%</span>`;
}

function formatHistoryCount(entry, value) {
  const count = Number(value) || 0;
  if (entry && entry.module === 'pqscan') {
    return `${count} <span class="math-note" style="font-size:0.85em;">(Symbole)</span>`;
  }
  return String(count);
}

function renderAnalytics(filter) {
  const allLog  = loadTrainingLog();
  const entries = filter === 'all' ? allLog : allLog.filter(e => e.module === filter);
  const scoringEntries = getScoringEntries(entries);
  const performanceEntries = buildPerformanceSeries(scoringEntries);
  const historyEntries = buildPerformanceSeries(entries);

  if (window.TrainingScoringEngine && window.TrainingScoringUI) {
    const analyticsModel = window.TrainingScoringEngine.buildAnalyticsModel(allLog, filter);
    window.TrainingScoringUI.renderAnalyticsPanels(analyticsModel);
  }

  const totalSessions  = entries.length;
  const totalDuration  = entries.reduce((s, e) => s + (e.duration || 0), 0);
  const best           = scoringEntries.length ? Math.max(...scoringEntries.map(e => e.accuracy || 0)) : 0;
  const avgAcc         = scoringEntries.length
    ? Math.round(scoringEntries.reduce((s, e) => s + (e.accuracy || 0), 0) / scoringEntries.length)
    : 0;
  const avgPerformance = performanceEntries.length
    ? Math.round(performanceEntries.reduce((sum, entry) => sum + (entry.performanceScore || 0), 0) / performanceEntries.length)
    : 0;

  const hours      = Math.floor(totalDuration / 3600);
  const mins       = Math.floor((totalDuration % 3600) / 60);
  const durStr     = hours > 0 ? `${hours}h ${mins}m` : `${mins} Min`;

  document.getElementById('analytics-summary').innerHTML = `
    <div class="analytics-stat"><span class="a-lbl">Sitzungen gesamt</span><span class="a-val">${totalSessions}</span></div>
    <div class="analytics-stat"><span class="a-lbl">Übungszeit gesamt</span><span class="a-val">${durStr}</span></div>
    <div class="analytics-stat"><span class="a-lbl">Ø Trefferquote</span><span class="a-val">${avgAcc}%</span></div>
    <div class="analytics-stat"><span class="a-lbl">Ø Leistungswert</span><span class="a-val">${avgPerformance}/100</span></div>
  `;

  renderAnalyticsInsights(scoringEntries, filter, allLog);
  updateAnalyticsWarning();
  renderProgressChart(scoringEntries);

  const tbody    = document.getElementById('analytics-history-body');
  const emptyMsg = document.getElementById('analytics-empty-msg');
  const table    = document.getElementById('analytics-history-table');

  if (!entries.length) {
    tbody.innerHTML      = '';
    emptyMsg.style.display = '';
    table.style.display    = 'none';
  } else {
    emptyMsg.style.display = 'none';
    table.style.display    = '';
    const sorted = [...historyEntries].reverse(); // newest first
    tbody.innerHTML = sorted.map(e => `
      <tr>
        <td>${formatLogDate(e.date)}</td>
        <td>${formatLogTime(e.date)}</td>
        <td>${getTrainingEntryLabel(e)}</td>
        <td>${e.runMode === 'practice' ? 'Übung' : 'Test'}</td>
        <td>${formatTime(e.duration || 0)}</td>
        <td style="color:#1a7a2a; font-weight:700;">${formatHistoryCount(e, e.correct)}</td>
        <td style="color:#b82020; font-weight:700;">${formatHistoryCount(e, e.wrong)}</td>
        <td>${accBadge(e.accuracy || 0)}</td>
        <td><span class="analytics-badge ${e.performanceScore >= 80 ? 'badge-good' : (e.performanceScore >= 50 ? 'badge-ok' : 'badge-poor')}">${e.performanceScore || 0}</span></td>
      </tr>
    `).join('');
  }
}

function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 500);
}

function analyticsExportBaseName() {
  const now = new Date();
  const ts = now.getFullYear()
    + String(now.getMonth() + 1).padStart(2, '0')
    + String(now.getDate()).padStart(2, '0')
    + '_'
    + String(now.getHours()).padStart(2, '0')
    + String(now.getMinutes()).padStart(2, '0')
    + String(now.getSeconds()).padStart(2, '0');
  const filter = (document.getElementById('analytics-filter') || {}).value || 'all';
  return `training_${filter}_${ts}`;
}

function exportAnalyticsCsv() {
  const filter = (document.getElementById('analytics-filter') || {}).value || 'all';
  const entries = getFilteredTrainingEntries(filter);
  const performanceEntries = buildPerformanceSeries(entries);
  let csv = 'Datum;Uhrzeit;Modul;Dauer;Richtig;Falsch;Aufgaben;Einheit;Trefferquote;Leistungswert;Niveau;Modus;MaxSpan;ØRT\n';
  entries.forEach((entry, index) => {
    const perf = performanceEntries[index];
    const countUnit = entry.module === 'pqscan' ? 'Symbole' : 'Aufgaben';
    csv += [
      formatLogDate(entry.date),
      formatLogTime(entry.date),
      getTrainingEntryLabel(entry),
      formatTime(entry.duration || 0),
      entry.correct || 0,
      entry.wrong || 0,
      entry.total || 0,
      countUnit,
      `${entry.accuracy || 0}%`,
      perf ? perf.performanceScore : '',
      entry.difficulty || '',
      entry.runMode || entry.mode || '',
      entry.maxSpan || '',
      entry.avgRt || ''
    ].join(';') + '\n';
  });
  const csvNameSuffix = filter === 'pqscan' ? '-symbole' : '';
  downloadTextFile(`${analyticsExportBaseName()}${csvNameSuffix}.csv`, '\uFEFF' + csv, 'text/csv;charset=utf-8;');
}

function exportAnalyticsJson() {
  const filter = (document.getElementById('analytics-filter') || {}).value || 'all';
  const entries = getFilteredTrainingEntries(filter);
  downloadTextFile(`${analyticsExportBaseName()}.json`, JSON.stringify(entries, null, 2), 'application/json;charset=utf-8;');
}

function seedAnalyticsDemoData() {
  if (!window.TrainingScoringEngine) return;
  if (!confirm('Demo-Daten laden?\nBestehende Trainingsdaten werden dabei ersetzt.')) return;

  const seededLog = [];
  window.TrainingScoringEngine.createDemoTrainingLog().forEach(entry => {
    seededLog.push(window.TrainingScoringEngine.enrichTrainingEntry(entry, seededLog));
  });

  localStorage.setItem(TRAINING_LOG_KEY, JSON.stringify(seededLog));
  trainingLogParseWarningMessage = '';
  trainingLogSaveWarningMessage = '';
  updateGlobalStorageWarning();
  refreshDashboardSummary();
  renderAnalytics((document.getElementById('analytics-filter') || {}).value || 'all');
}

function renderProgressChart(entries) {
  const area = document.getElementById('analytics-chart-area');
  if (!entries.length) {
    area.innerHTML = '<p class="math-note" style="text-align:center; color:#aaa; padding:20px 0;">Für diese Auswahl sind noch keine Ergebnisse vorhanden.</p>';
    return;
  }

  const data = buildPerformanceSeries(entries).slice(-30);
  const W = 640, H = 210;
  const ml = 40, mr = 18, mt = 28, mb = 46;
  const cW = W - ml - mr, cH = H - mt - mb;
  const n    = data.length;
  const step = n > 1 ? cW / (n - 1) : cW;

  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" style="max-width:100%;display:block;margin:0 auto;">`;
  s += `<g transform="translate(${ml},${mt})">`;

  // Gridlines + Y-axis labels
  [0, 25, 50, 75, 100].forEach(v => {
    const y = cH - (v / 100) * cH;
    s += `<line x1="0" y1="${y.toFixed(1)}" x2="${cW}" y2="${y.toFixed(1)}" stroke="${v === 0 ? '#bbc' : '#e8ecf2'}" stroke-width="${v === 0 ? '1.5' : '1'}"/>`;
    s += `<text x="-5" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="#889">${v}</text>`;
  });

  // Axes
  s += `<line x1="0" y1="0" x2="0" y2="${cH}" stroke="#bbc" stroke-width="1.5"/>`;

  // Filled area under line
  const pts = data.map((e, i) => {
    const x = n === 1 ? cW / 2 : i * step;
    const y = cH - ((e.performanceScore || 0) / 100) * cH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const left  = (n === 1 ? cW / 2 : 0).toFixed(1);
  const right = (n === 1 ? cW / 2 : (n - 1) * step).toFixed(1);
  s += `<polygon points="${left},${cH} ${pts.join(' ')} ${right},${cH}" fill="#0f2d6b" opacity="0.08"/>`;

  // Line
  s += `<polyline points="${pts.join(' ')}" fill="none" stroke="#0f2d6b" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;

  // Dots + performance labels
  const labelEvery = Math.max(1, Math.ceil(n / 10));
  data.forEach((e, i) => {
    const x   = n === 1 ? cW / 2 : i * step;
    const y   = cH - ((e.performanceScore || 0) / 100) * cH;
    const col = e.performanceScore >= 80 ? '#1a7a2a' : (e.performanceScore >= 50 ? '#9a6300' : '#b82020');
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="${col}" stroke="#fff" stroke-width="1.5"/>`;
    s += `<text x="${x.toFixed(1)}" y="${(y - 9).toFixed(1)}" text-anchor="middle" font-size="9.5" fill="${col}" font-weight="700">${e.performanceScore}</text>`;
    if (i % labelEvery === 0 || i === n - 1) {
      const d   = new Date(e.date);
      const lbl = `${d.getDate().toString().padStart(2,'0')}.${(d.getMonth()+1).toString().padStart(2,'0')}.`;
      s += `<text x="${x.toFixed(1)}" y="${(cH + 16).toFixed(1)}" text-anchor="middle" font-size="9" fill="#778">${lbl}</text>`;
    }
  });

  s += `<text x="${(cW / 2).toFixed(0)}" y="${(cH + 34).toFixed(0)}" text-anchor="middle" font-size="11" fill="#667">Leistungswert je Sitzung (chronologisch · max. 30)</text>`;
  s += '</g></svg>';

  area.innerHTML = s;
}

// ─── Export ───────────────────────────────────────────────────────────────────
function exportStats() {
  const now  = new Date();
  const ts   = now.getFullYear()
    + String(now.getMonth() + 1).padStart(2, '0')
    + String(now.getDate()).padStart(2, '0')
    + '_'
    + String(now.getHours()).padStart(2, '0')
    + String(now.getMinutes()).padStart(2, '0')
    + String(now.getSeconds()).padStart(2, '0');

  let csv = 'Minute;Richtig;Falsch\n';
  speedState.perMinute.forEach((m, i) => {
    csv += `${i + 1};${m.richtig};${m.falsch}\n`;
  });
  csv += '\nGesamt-Richtig;' + speedState.stats.richtig + '\n';
  csv += 'Gesamt-Falsch;'   + speedState.stats.falsch   + '\n';
  csv += 'Zeitlimit;'       + formatTime(speedState.totalSeconds) + '\n';
  csv += 'Dauer;'           + formatTime(speedState.elapsedSeconds) + '\n';

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'Statistik_' + ts + '.csv';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
}

// ─── Back to start ────────────────────────────────────────────────────────────
function backToStart() {
  clearMainSpeedTimer();
  showScreen('screen-speed-home');
}

function initializePsyApp() {
  renderResultScreenFooters();
  renderDashboardStructure();
  refreshAdaptiveHints();
  refreshDashboardSummary();
  renderQuickStartState(typeof getCurrentScreenId === 'function' ? getCurrentScreenId() : 'screen-dashboard');
}

initializePsyApp();



