'use strict';

// ─── Constants ────────────────────────────────────────────────────────────────
const PSY_APP_META = Object.freeze({
  name: 'PSY-Vorbereitung',
  shortName: 'PSY',
  version: '2026.2'
});

window.PSY_APP_META = PSY_APP_META;

const DEFAULT_SPEED_SECONDS = 20 * 60;

function createEmptySpeedStats() {
  return { richtig: 0, falsch: 0, keineZahl: 0, rechnungen: 0 };
}

function createEmptySpeedMinutes() {
  return Array.from({ length: 20 }, () => ({ richtig: 0, falsch: 0 }));
}

// ─── State ────────────────────────────────────────────────────────────────────
const speedState = {
  num1: 0,
  num2: 0,
  elapsedSeconds: 0,
  totalSeconds: DEFAULT_SPEED_SECONDS,
  inputBlocked: false,
  isFirstPair: true,
  consecutiveErrors: 0,
  hintActive: false,
  stats: createEmptySpeedStats(),
  perMinute: createEmptySpeedMinutes()
};
const mathState = {
  session: null,
  currentTask: null,
  taskCount: 0,
  timerInterval: null,
  advanceTimer: null,
  taskTimeout: null
};
const spatialState = {
  session: null,
  currentTask: null,
  taskCount: 0,
  timerInterval: null,
  advanceTimer: null
};
const nbackState = {
  session: null,
  currentTask: null,
  taskCount: 0,
  timerInterval: null,
  advanceTimer: null
};
const gonogoState = {
  session: null,
  currentTask: null,
  taskCount: 0,
  timerInterval: null,
  advanceTimer: null,
  trialTimer: null
};
const stroopState = {
  session: null,
  currentTask: null,
  taskCount: 0,
  timerInterval: null,
  advanceTimer: null,
  pauseInterval: null,
  trialTimer: null,
  trialInterval: null
};
const sequenceState = {
  session: null,
  currentTask: null,
  taskCount: 0,
  timerInterval: null,
  advanceTimer: null,
  ruleHintTimer: null
};
const rotationState = {
  session: null,
  currentTask: null,
  taskCount: 0,
  timerInterval: null,
  advanceTimer: null
};
const digitspanState = {
  session: null,
  currentTask: null,
  taskCount: 0,
  timerInterval: null,
  phaseTimer: null
};
const flankerState = {
  session: null,
  currentTask: null,
  taskCount: 0,
  timerInterval: null,
  advanceTimer: null
};
const visualsearchState = {
  session: null,
  currentTask: null,
  taskCount: 0,
  timerInterval: null,
  advanceTimer: null
};
const pqscanState = {
  session: null,
  currentTask: null,
  taskCount: 0,
  timerInterval: null,
  advanceTimer: null,
  boardInterval: null
};
const wortanalogienState = {
  session: null,
  currentTask: null,
  taskCount: 0,
  timerInterval: null,
  advanceTimer: null
};
const figurenmatrixState = {
  session: null,
  currentTask: null,
  taskCount: 0,
  advanceTimer: null
};
const formenState = {
  session: null,
  currentTask: null,
  taskCount: 0,
  timerInterval: null,
  advanceTimer: null,
  trialTimer: null
};
const concentrationState = {
  session: null,
  currentTask: null,
  taskCount: 0,
  timerInterval: null,
  advanceTimer: null,
  moveInterval: null,
  doubleTimer: null
};
const multitaskingState = {
  session: null,
  currentTask: null,
  taskCount: 0,
  timerInterval: null,
  topCurrentTask: null,
  topTrialTimer: null,
  topAdvanceTimer: null,
  topPhaseTimer: null
};
let timerInterval = null;
let speedFocusTimer = null;
let speedInputBlockTimer = null;
const HINT_AFTER_ERRORS = 1;
let trainingLogWarningMessage = '';
let trainingLogParseWarningMessage = '';
let trainingLogSaveWarningMessage = '';

// map[y][x]: y=0 hinten, y=2 vorne; x=0 links, x=2 rechts
// Regel: map[0][1] (hinten-mitte) und map[1][1] (Zentrum) immer >= 1
// Randpositionen (Vorderreihe y=2, Seitenspalten x=0/x=2) können 0 sein
const SPATIAL_HEIGHTMAPS = [
  // 12 Würfel
  [[1,1,0],[0,2,2],[2,2,2]],
  // 13 Würfel
  [[0,1,1],[2,2,0],[2,3,2]],
  // 13 Würfel
  [[1,2,0],[0,1,2],[2,3,2]],
  // 14 Würfel
  [[1,2,1],[2,2,0],[1,3,2]],
  // 14 Würfel
  [[0,1,2],[2,2,1],[3,2,1]],
  // 15 Würfel
  [[1,2,1],[0,3,2],[2,2,2]],
  // 15 Würfel
  [[2,1,0],[2,2,2],[2,3,1]],
  // 15 Würfel
  [[1,2,2],[1,2,0],[3,2,2]],
  // 15 Würfel
  [[0,2,1],[2,3,1],[2,2,2]],
  // 16 Würfel
  [[1,3,0],[2,2,2],[2,3,1]],
  // 16 Würfel
  [[2,2,1],[0,3,2],[2,2,2]],
  // 17 Würfel
  [[1,2,2],[3,2,1],[2,3,1]]
];

function clearStateTimeout(state, key) {
  if (state && state[key]) {
    clearTimeout(state[key]);
    state[key] = null;
  }
}

function clearStateInterval(state, key) {
  if (state && state[key]) {
    clearInterval(state[key]);
    state[key] = null;
  }
}

function clearMathTimer() {
  clearStateInterval(mathState, 'timerInterval');
  clearStateTimeout(mathState, 'advanceTimer');
  clearStateTimeout(mathState, 'taskTimeout');
}

function clearSpatialTimer() {
  clearStateInterval(spatialState, 'timerInterval');
  clearStateTimeout(spatialState, 'advanceTimer');
}

function clearNbackTimer() {
  clearStateInterval(nbackState, 'timerInterval');
  clearStateTimeout(nbackState, 'advanceTimer');
}

function clearGoNoGoTimer() {
  clearStateInterval(gonogoState, 'timerInterval');
  clearStateTimeout(gonogoState, 'advanceTimer');
  clearStateTimeout(gonogoState, 'trialTimer');
  clearStateTimeout(gonogoState.session, 'trialTimer');
}

function clearStroopTimer() {
  clearStateInterval(stroopState, 'timerInterval');
  clearStateInterval(stroopState, 'pauseInterval');
  clearStateTimeout(stroopState, 'advanceTimer');
  clearStateTimeout(stroopState, 'trialTimer');
  clearStateInterval(stroopState, 'trialInterval');
  clearStateTimeout(stroopState.session, 'trialTimer');
  clearStateInterval(stroopState.session, 'trialInterval');
}

function clearSequenceTimer() {
  clearStateInterval(sequenceState, 'timerInterval');
  clearStateTimeout(sequenceState, 'advanceTimer');
  clearStateTimeout(sequenceState, 'ruleHintTimer');
}

function clearRotationTimer() {
  clearStateInterval(rotationState, 'timerInterval');
  clearRotationTaskTimers();
}

function clearRotationTaskTimers() {
  clearStateTimeout(rotationState, 'advanceTimer');
}

function clearDigitSpanTimer() {
  clearStateInterval(digitspanState, 'timerInterval');
  clearStateTimeout(digitspanState, 'phaseTimer');
}

function clearFlankerTimer() {
  clearStateInterval(flankerState, 'timerInterval');
  clearStateTimeout(flankerState, 'advanceTimer');
}

function clearVisualSearchTimer() {
  clearStateInterval(visualsearchState, 'timerInterval');
  clearStateTimeout(visualsearchState, 'advanceTimer');
}

function clearPQScanTimer() {
  clearStateInterval(pqscanState, 'timerInterval');
  clearStateTimeout(pqscanState, 'advanceTimer');
  clearStateInterval(pqscanState, 'boardInterval');
}

function clearWortanalogienTimer() {
  clearStateInterval(wortanalogienState, 'timerInterval');
  clearStateTimeout(wortanalogienState, 'advanceTimer');
}

function clearFigurenmatrixTimer() {
  clearStateTimeout(figurenmatrixState, 'advanceTimer');
}

function callOptionalGlobal(name) {
  const handler = window[name];
  if (typeof handler === 'function') {
    handler();
  }
}

const MINI_MODULE_DEFS = {
  math: {
    homeScreen: 'screen-math-home',
    screens: ['screen-math-home', 'screen-math-exercise', 'screen-math-results'],
    clear: clearMathTimer,
    reset: function() {
      mathState.session = null;
      mathState.currentTask = null;
      mathState.taskCount = 0;
    }
  },
  spatial: {
    homeScreen: 'screen-spatial-home',
    screens: ['screen-spatial-home', 'screen-spatial-exercise', 'screen-spatial-results'],
    clear: clearSpatialTimer,
    reset: function() {
      spatialState.session = null;
      spatialState.currentTask = null;
      spatialState.taskCount = 0;
    }
  },
  nback: {
    homeScreen: 'screen-nback-home',
    screens: ['screen-nback-home', 'screen-nback-exercise', 'screen-nback-results'],
    clear: clearNbackTimer,
    reset: function() {
      nbackState.session = null;
      nbackState.currentTask = null;
      nbackState.taskCount = 0;
    }
  },
  gonogo: {
    homeScreen: 'screen-gonogo-home',
    screens: ['screen-gonogo-home', 'screen-gonogo-exercise', 'screen-gonogo-results'],
    clear: clearGoNoGoTimer,
    reset: function() {
      gonogoState.session = null;
      gonogoState.currentTask = null;
      gonogoState.taskCount = 0;
    }
  },
  stroop: {
    homeScreen: 'screen-stroop-home',
    screens: ['screen-stroop-home', 'screen-stroop-exercise', 'screen-stroop-results'],
    clear: clearStroopTimer,
    reset: function() {
      stroopState.session = null;
      stroopState.currentTask = null;
      stroopState.taskCount = 0;
    },
    beforeShow: function() {
      callOptionalGlobal('setStroopModeHint');
      callOptionalGlobal('setStroopDifficultyHint');
    }
  },
  sequence: {
    homeScreen: 'screen-sequence-home',
    screens: ['screen-sequence-home', 'screen-sequence-exercise', 'screen-sequence-results'],
    clear: clearSequenceTimer,
    reset: function() {
      sequenceState.session = null;
      sequenceState.currentTask = null;
      sequenceState.taskCount = 0;
    }
  },
  rotation: {
    homeScreen: 'screen-rotation-home',
    screens: ['screen-rotation-home', 'screen-rotation-exercise', 'screen-rotation-results'],
    clear: clearRotationTimer,
    reset: function() {
      rotationState.session = null;
      rotationState.currentTask = null;
      rotationState.taskCount = 0;
    }
  },
  formen: {
    homeScreen: 'screen-formen-home',
    screens: ['screen-formen-home', 'screen-formen-exercise', 'screen-formen-results'],
    clear: function() {
      callOptionalGlobal('clearFormenTimer');
    },
    reset: function() {
      formenState.session = null;
      formenState.currentTask = null;
      formenState.taskCount = 0;
    }
  },
  concentration: {
    homeScreen: 'screen-concentration-home',
    screens: ['screen-concentration-home', 'screen-concentration-exercise', 'screen-concentration-results'],
    clear: function() {
      callOptionalGlobal('clearConcentrationTimer');
    },
    reset: function() {
      concentrationState.session = null;
      concentrationState.currentTask = null;
      concentrationState.taskCount = 0;
    }
  },
  multitasking: {
    homeScreen: 'screen-multitasking-home',
    screens: ['screen-multitasking-home', 'screen-multitasking-exercise', 'screen-multitasking-results'],
    clear: function() {
      callOptionalGlobal('clearMultitaskingTimer');
    },
    reset: function() {
      multitaskingState.session = null;
      multitaskingState.currentTask = null;
      multitaskingState.topCurrentTask = null;
      multitaskingState.taskCount = 0;
    }
  },
  digitspan: {
    homeScreen: 'screen-digitspan-home',
    screens: ['screen-digitspan-home', 'screen-digitspan-exercise', 'screen-digitspan-results'],
    clear: clearDigitSpanTimer,
    reset: function() {
      digitspanState.session = null;
      digitspanState.currentTask = null;
      digitspanState.taskCount = 0;
    }
  },
  flanker: {
    homeScreen: 'screen-flanker-home',
    screens: ['screen-flanker-home', 'screen-flanker-exercise', 'screen-flanker-results'],
    clear: clearFlankerTimer,
    reset: function() {
      flankerState.session = null;
      flankerState.currentTask = null;
      flankerState.taskCount = 0;
    }
  },
  visualsearch: {
    homeScreen: 'screen-visualsearch-home',
    screens: ['screen-visualsearch-home', 'screen-visualsearch-exercise', 'screen-visualsearch-results'],
    clear: clearVisualSearchTimer,
    reset: function() {
      visualsearchState.session = null;
      visualsearchState.currentTask = null;
      visualsearchState.taskCount = 0;
    }
  },
  pqscan: {
    homeScreen: 'screen-pqscan-home',
    screens: ['screen-pqscan-home', 'screen-pqscan-exercise', 'screen-pqscan-results'],
    clear: clearPQScanTimer,
    reset: function() {
      pqscanState.session = null;
      pqscanState.currentTask = null;
      pqscanState.taskCount = 0;
    }
  },
  wortanalogien: {
    homeScreen: 'screen-wortanalogien-home',
    screens: ['screen-wortanalogien-home', 'screen-wortanalogien-exercise', 'screen-wortanalogien-results'],
    clear: clearWortanalogienTimer,
    reset: function() {
      wortanalogienState.session = null;
      wortanalogienState.currentTask = null;
      wortanalogienState.taskCount = 0;
    }
  },
  figurenmatrix: {
    homeScreen: 'screen-figurenmatrix-home',
    screens: ['screen-figurenmatrix-home', 'screen-figurenmatrix-exercise', 'screen-figurenmatrix-results'],
    clear: clearFigurenmatrixTimer,
    reset: function() {
      figurenmatrixState.session = null;
      figurenmatrixState.currentTask = null;
      figurenmatrixState.taskCount = 0;
    }
  }
};

function clearAllMiniTimers() {
  Object.keys(MINI_MODULE_DEFS).forEach(function(moduleId) {
    const def = MINI_MODULE_DEFS[moduleId];
    if (def && typeof def.clear === 'function') def.clear();
  });
}

function resetMiniModuleState() {
  Object.keys(MINI_MODULE_DEFS).forEach(function(moduleId) {
    const def = MINI_MODULE_DEFS[moduleId];
    if (def && typeof def.reset === 'function') def.reset();
  });
}

function updateExerciseTimerVisibility(screenId, session) {
  const screen = document.getElementById(screenId);
  if (!screen) return;
  const showRunningTimer = !session || !session.runMode || session.runMode === 'practice';
  const remainingEl = screen.querySelector('.timer-remaining');
  const progressWrap = screen.querySelector('.progress-wrap');
  if (remainingEl) remainingEl.style.display = showRunningTimer ? '' : 'none';
  if (progressWrap) progressWrap.style.display = showRunningTimer ? '' : 'none';
}

function updateMathTimerDisplay() {
  if (!mathState.session) return;
  updateExerciseTimerVisibility('screen-math-exercise', mathState.session);
  const remaining = Math.max(0, mathState.session.remainingSeconds);
  document.getElementById('math-total-time').textContent = formatTime(mathState.session.totalSeconds);
  document.getElementById('math-remaining-time').textContent = formatTime(remaining);
  const pct = mathState.session.totalSeconds > 0 ? (remaining / mathState.session.totalSeconds) * 100 : 0;
  const bar = document.getElementById('math-progress-bar');
  bar.style.width = `${pct}%`;
  if (pct < 25) {
    bar.style.background = 'linear-gradient(90deg, #b01010, #e03030)';
  } else if (pct < 60) {
    bar.style.background = 'linear-gradient(90deg, #9a6300, #e09000)';
  } else {
    bar.style.background = 'linear-gradient(90deg, #0f2d6b, #2a5fbb)';
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function randomNum() {
  return Math.floor(Math.random() * 9) + 1;
}

function correctAnswer() {
  return (speedState.num1 + speedState.num2) % 10;
}

function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return m + ':' + s;
}

function getAccuracyPercent(correct, total) {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

function getElapsedSeconds(startedAt, totalSeconds, timedOut) {
  if (timedOut) return totalSeconds;
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  return Math.min(elapsed, totalSeconds);
}

function setButtonsDisabled(selector, disabled) {
  Array.from(document.querySelectorAll(selector)).forEach(function(btn) {
    btn.disabled = disabled;
  });
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setTextEntries(entries) {
  Object.keys(entries).forEach(function(id) {
    setText(id, entries[id]);
  });
}

function currentMinuteIndex() {
  return Math.min(19, Math.floor(speedState.elapsedSeconds / 60));
}

function updateModuleTimer(prefix, session) {
  if (!session) return;
  updateExerciseTimerVisibility(`screen-${prefix}-exercise`, session);
  const remaining = Math.max(0, session.remainingSeconds);
  document.getElementById(`${prefix}-total-time`).textContent = formatTime(session.totalSeconds);
  document.getElementById(`${prefix}-remaining-time`).textContent = formatTime(remaining);
  const pct = session.totalSeconds > 0 ? (remaining / session.totalSeconds) * 100 : 0;
  const bar = document.getElementById(`${prefix}-progress-bar`);
  bar.style.width = `${pct}%`;
  if (pct < 25) bar.style.background = 'linear-gradient(90deg, #b01010, #e03030)';
  else if (pct < 60) bar.style.background = 'linear-gradient(90deg, #9a6300, #e09000)';
  else bar.style.background = 'linear-gradient(90deg, #0f2d6b, #2a5fbb)';
}

// ─── Screen / overlay management ──────────────────────────────────────────────
const CORE_SCREEN_IDS = ['screen-dashboard', 'screen-speed-home', 'screen-exercise', 'screen-results', 'screen-analytics'];
const ALL_SCREEN_IDS = CORE_SCREEN_IDS.concat(Object.keys(MINI_MODULE_DEFS).reduce(function(screenIds, moduleId) {
  return screenIds.concat(MINI_MODULE_DEFS[moduleId].screens);
}, []));
let currentScreenId = 'screen-dashboard';

function showScreen(id) {
  ALL_SCREEN_IDS.forEach(sid => {
    document.getElementById(sid).classList.toggle('hidden', sid !== id);
  });
  currentScreenId = id;
  if (typeof window.renderQuickStartState === 'function') {
    window.renderQuickStartState(id);
  }
}

function getCurrentScreenId() {
  return currentScreenId;
}

function clearMainSpeedTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  if (speedFocusTimer) {
    clearTimeout(speedFocusTimer);
    speedFocusTimer = null;
  }
  if (speedInputBlockTimer) {
    clearTimeout(speedInputBlockTimer);
    speedInputBlockTimer = null;
  }
  speedState.inputBlocked = false;
  clearFeedback();
}

function openModuleHome(moduleId) {
  const def = MINI_MODULE_DEFS[moduleId];
  if (!def) return;
  clearAllMiniTimers();
  resetMiniModuleState();
  refreshAdaptiveHints();
  if (typeof def.beforeShow === 'function') def.beforeShow();
  showScreen(def.homeScreen);
}

function goDashboard() {
  clearMainSpeedTimer();
  clearAllMiniTimers();
  resetMiniModuleState();
  refreshAdaptiveHints();
  refreshDashboardSummary();
  showScreen('screen-dashboard');
}

function openSpeedHome() {
  clearMainSpeedTimer();
  clearAllMiniTimers();
  resetMiniModuleState();
  showScreen('screen-speed-home');
}

function openMathHome() {
  openModuleHome('math');
}

function openSpatialHome() {
  openModuleHome('spatial');
}

function openNbackHome() {
  openModuleHome('nback');
}



