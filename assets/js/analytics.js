// ─── Training Log ─────────────────────────────────────────────────────────────
const TRAINING_LOG_KEY = 'psy_vorbereitung_log';
const DASHBOARD_MODULE_META = {
  speed: { label: 'Speed-Rechnen', openHandler: 'openSpeedHome', badgeId: 'dash-status-speed', moduleKeys: ['speed'] },
  math: { label: 'Kopfrechnen 1-4 Stellen', openHandler: 'openMathHome', badgeId: 'dash-status-math', moduleKeys: ['math_add', 'math_sub', 'math_mul', 'math_mix'] },
  nback: { label: '2-Back', openHandler: 'openNbackHome', badgeId: 'dash-status-nback', moduleKeys: ['nback'] },
  digitspan: { label: 'Digit Span', openHandler: 'openDigitSpanHome', badgeId: 'dash-status-digitspan', moduleKeys: ['digitspan'] },
  gonogo: { label: 'Go / No-Go', openHandler: 'openGoNoGoHome', badgeId: 'dash-status-gonogo', moduleKeys: ['gonogo'] },
  stroop: { label: 'Stroop', openHandler: 'openStroopHome', badgeId: 'dash-status-stroop', moduleKeys: ['stroop'] },
  flanker: { label: 'Flanker', openHandler: 'openFlankerHome', badgeId: 'dash-status-flanker', moduleKeys: ['flanker'] },
  concentration: { label: 'Konzentration', openHandler: 'openConcentrationHome', badgeId: 'dash-status-concentration', moduleKeys: ['concentration'] },
  spatial: { label: 'Würfel zählen', openHandler: 'openSpatialHome', badgeId: 'dash-status-spatial', moduleKeys: ['spatial'] },
  rotation: { label: 'Rotations-Übung', openHandler: 'openRotationHome', badgeId: 'dash-status-rotation', moduleKeys: ['spatial_views'] },
  formen: { label: 'Formen vergleichen', openHandler: 'openFormenHome', badgeId: 'dash-status-formen', moduleKeys: ['formen'] },
  visualsearch: { label: 'Zielreiz finden', openHandler: 'openVisualSearchHome', badgeId: 'dash-status-visualsearch', moduleKeys: ['visual_search'] },
  sequence: { label: 'Zahlenreihen', openHandler: 'openSequenceHome', badgeId: 'dash-status-sequence', moduleKeys: ['sequence'] },
  multitasking: { label: 'Multitasking', openHandler: 'openMultitaskHome', badgeId: 'dash-status-multitasking', moduleKeys: ['multitasking'] }
};
const DASHBOARD_QUICK_CARD_SLOTS = [
  {
    slot: 'primary',
    tag: 'Jetzt passend',
    fallbackTitle: 'Speed-Rechnen',
    fallbackText: 'Ein schneller Start für eine kurze, klare Trainingseinheit.'
  },
  {
    slot: 'secondary',
    tag: 'Wieder aufnehmen',
    fallbackTitle: 'Kopfrechnen',
    fallbackText: 'Gut, wenn du heute erst einmal mit einer vertrauten Übung starten willst.'
  },
  {
    slot: 'tertiary',
    tag: 'Abwechslung',
    fallbackTitle: '2-Back',
    fallbackText: 'Hilft, den Fokus nach Rechenübungen auf Merkfähigkeit und Kontrolle zu verlagern.'
  }
];
const DASHBOARD_SECTION_DEFS = [
  {
    title: 'Rechnen & Gedächtnis',
    copy: 'Hier trainierst du schnelles Rechnen, Merken und sicheres Behalten von Zahlenfolgen.',
    cards: [
      { moduleId: 'speed', kicker: 'Zahlenfolge', title: 'Speed-Rechnen', copy: 'Addiere schnell und gib immer nur die letzte Ziffer der Summe ein.', accent: true },
      { moduleId: 'math', kicker: 'Grundrechenarten', title: 'Kopfrechnen 1-4 Stellen', copy: 'Rechne Aufgaben im Kopf und wähle zwischen Addition, Subtraktion, Multiplikation oder gemischtem Modus.' },
      { moduleId: 'nback', kicker: 'Arbeitsgedächtnis', title: '2-Back', copy: 'Entscheide bei jeder Zahl, ob sie dieselbe ist wie die Zahl von vor zwei Schritten.' },
      { moduleId: 'digitspan', kicker: 'Arbeitsgedächtnis', title: 'Digit Span', copy: 'Merke dir kurze Zahlenfolgen und gib sie in der richtigen Reihenfolge oder rückwärts ein.' }
    ]
  },
  {
    title: 'Aufmerksamkeit & Kontrolle',
    copy: 'Diese Übungen fordern schnelle Entscheidungen, konzentriertes Hinsehen und kontrolliertes Reagieren.',
    cards: [
      { moduleId: 'gonogo', kicker: 'Inhibition', title: 'Go / No-Go', copy: 'Drücke nur dann, wenn es passt, und halte rechtzeitig inne, wenn du nicht reagieren sollst.' },
      { moduleId: 'stroop', kicker: 'Aufmerksamkeit', title: 'Stroop', copy: 'Achte auf die aktuelle Regel und entscheide, ob die Farbe oder das Wort zählt.' },
      { moduleId: 'flanker', kicker: 'Selektive Aufmerksamkeit', title: 'Flanker', copy: 'Bestimme die Richtung des mittleren Pfeils und ignoriere die störenden Pfeile daneben.' },
      { moduleId: 'concentration', kicker: 'Aufmerksamkeit & Kontrolle', title: 'Konzentration', copy: 'Beobachte den springenden Punkt und reagiere sofort, wenn ein Doppelsprung auftaucht.' }
    ]
  },
  {
    title: 'Raum & Wahrnehmung',
    copy: 'Hier geht es um räumliches Vorstellen, genaues Vergleichen und schnelles Finden.',
    cards: [
      { moduleId: 'spatial', kicker: 'Raumvorstellung', title: 'Würfel zählen', copy: 'Zähle, wie viele kleine Würfel insgesamt in der gezeigten Struktur stecken.' },
      { moduleId: 'rotation', kicker: 'Räumliches Denken', title: 'Rotations-Übung', copy: 'Wähle die Antwort, die dieselbe Form nach der vorgegebenen Drehung zeigt.' },
      { moduleId: 'formen', kicker: 'Wahrnehmung', title: 'Formen vergleichen', copy: 'Unter neun Formen ist genau eine anders. Finde sie so schnell und genau wie möglich.' },
      { moduleId: 'visualsearch', kicker: 'Visuelle Suche', title: 'Zielreiz finden', copy: 'Suche in einem Feld mit ähnlichen Symbolen genau das eine passende Zeichen.' }
    ]
  },
  {
    title: 'Muster & Belastung',
    copy: 'Diese Übungen verbinden Mustererkennung mit höherer Belastung und mehreren Anforderungen gleichzeitig.',
    cards: [
      { moduleId: 'sequence', kicker: 'Logik', title: 'Zahlenreihen', copy: 'Finde die Regel hinter der Zahlenreihe und wähle die nächste passende Zahl.' },
      { moduleId: 'multitasking', kicker: 'Parallele Aufgaben', title: 'Multitasking', copy: 'Rechne weiter, während du gleichzeitig oben auf wechselnde Aufgaben reagieren musst.', accent: true }
    ]
  }
];
const RESULT_SCREEN_FOOTER_DEFS = {
  speed: {
    insightId: 'res-insight',
    buttons: [
      { label: '↻ Neues Spiel', className: 'btn btn-primary', handler: 'backToStart' },
      { label: '↓ Exportieren', className: 'btn btn-success', handler: 'exportStats' }
    ]
  },
  math: {
    insightId: 'math-result-insight',
    buttons: [
      { label: 'Nochmal starten', className: 'btn btn-primary', handler: 'restartMathMode' },
      { label: 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  spatial: {
    insightId: 'spatial-result-insight',
    buttons: [
      { label: 'Nochmal starten', className: 'btn btn-primary', handler: 'restartSpatialMode' },
      { label: 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  nback: {
    insightId: 'nback-result-insight',
    buttons: [
      { label: 'Nochmal starten', className: 'btn btn-primary', handler: 'restartNbackMode' },
      { label: 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  gonogo: {
    insightId: 'gonogo-result-insight',
    buttons: [
      { label: 'Nochmal starten', className: 'btn btn-primary', handler: 'restartGoNoGoMode' },
      { label: 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  stroop: {
    insightId: 'stroop-result-insight',
    buttons: [
      { label: 'Nochmal starten', className: 'btn btn-primary', handler: 'restartStroopMode' },
      { label: 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  sequence: {
    insightId: 'sequence-result-insight',
    buttons: [
      { label: 'Nochmal starten', className: 'btn btn-primary', handler: 'restartSequenceMode' },
      { label: 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  rotation: {
    insightId: 'rotation-result-insight',
    buttons: [
      { label: 'Nochmal starten', className: 'btn btn-primary', handler: 'restartRotationMode' },
      { label: 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  formen: {
    insightId: 'formen-result-insight',
    buttons: [
      { label: 'Nochmal starten', className: 'btn btn-primary', handler: 'restartFormenMode' },
      { label: 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  concentration: {
    insightId: 'concentration-result-insight',
    buttons: [
      { label: 'Nochmal starten', className: 'btn btn-primary', handler: 'restartConcentrationMode' },
      { label: 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  multitasking: {
    insightId: 'multitask-result-insight',
    buttonRowStyle: 'margin-top:20px;',
    buttons: [
      { label: 'Nochmal starten', className: 'btn btn-primary', handler: 'restartMultitaskingMode' },
      { label: 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  digitspan: {
    insightId: 'digitspan-result-insight',
    buttons: [
      { label: 'Nochmal starten', className: 'btn btn-primary', handler: 'restartDigitSpanMode' },
      { label: 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  flanker: {
    insightId: 'flanker-result-insight',
    buttons: [
      { label: 'Nochmal starten', className: 'btn btn-primary', handler: 'restartFlankerMode' },
      { label: 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  },
  visualsearch: {
    insightId: 'visualsearch-result-insight',
    buttons: [
      { label: 'Nochmal starten', className: 'btn btn-primary', handler: 'restartVisualSearchMode' },
      { label: 'Zum Dashboard', className: 'btn btn-success', handler: 'goDashboard' }
    ]
  }
};
let dashboardQuickActions = { primary: 'speed', secondary: 'math', tertiary: 'nback' };

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
      insight.textContent = 'Hier erscheint nach der Übung eine kurze Einordnung.';
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
        status.textContent = 'Bereit';
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
    trainingLogParseWarningMessage = 'Trainingsdaten konnten nicht vollständig gelesen werden. Der Verlauf wurde vorsichtshalber zurückgesetzt.';
    updateGlobalStorageWarning();
    return [];
  }
}

function saveTrainingEntry(entry) {
  const log = loadTrainingLog();
  const candidate = {
    ...entry,
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
    trainingLogSaveWarningMessage = 'Trainingsdaten konnten nicht gespeichert werden. Der Browser-Speicher ist wahrscheinlich voll.';
    updateGlobalStorageWarning();
  }
}

function deleteAllLogs() {
  if (confirm('Alle Trainingsdaten wirklich löschen?\nDiese Aktion kann nicht rückgängig gemacht werden.')) {
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
    const performanceEntries = buildPerformanceSeries(entries);
    const lastEntry = entries.length ? entries[entries.length - 1] : null;
    const lastTs = lastEntry ? new Date(lastEntry.date).getTime() : 0;
    const avgAccuracy = averageOf(entries.map(entry => entry.accuracy).filter(value => typeof value === 'number' && isFinite(value)));
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
      badge.textContent = 'Neu';
      badge.classList.add('dash-card-status--new');
      return;
    }
    const daysSince = Math.floor((Date.now() - stat.lastTs) / 86400000);
    if (daysSince >= 5) {
      badge.textContent = 'Wieder aufnehmen';
      badge.classList.add('dash-card-status--return');
      return;
    }
    if (daysSince <= 1) {
      badge.textContent = 'Zuletzt genutzt';
      badge.classList.add('dash-card-status--last');
      return;
    }
    badge.textContent = 'Bereit';
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
      text: primary.count
        ? `Diese Übung hattest du zuletzt seltener im Fokus. Sie ist ein guter nächster Schritt zur Abwechslung.`
        : 'Hier lohnt sich ein erster Start, damit du auch in diesem Bereich einen Vergleichswert aufbaust.'
    },
    secondary: {
      title: secondary.meta.label,
      text: secondary.count
        ? `Damit kannst du dort weitermachen, wo du zuletzt aufgehört hast.`
        : 'Eine gute Wahl für eine kurze, vertraute Trainingseinheit.'
    },
    tertiary: {
      title: tertiary.meta.label,
      text: tertiary.count
        ? `Hier lief es zuletzt solide. Gut, wenn du an einer Stärke weiterarbeiten möchtest.`
        : 'Passt gut, wenn du heute bewusst etwas anderes als sonst machen möchtest.'
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
  const performanceLog = buildPerformanceSeries(log);
  const totalSessions = log.length;
  const totalDuration = log.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const accValues = log
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
    focusNoteEl.textContent = 'Du hast noch keine Trainingsdaten. Starte einfach mit einer Übung, dann erscheint hier dein Überblick.';
    return;
  }

  const recent = log.slice(-5);
  const recentPerformance = averageOf(buildPerformanceSeries(recent).map(entry => entry.performanceScore));
  const grouped = {};
  log.forEach(entry => {
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
    focusNoteEl.textContent = `Dein letzter Leistungswert liegt im Schnitt bei ${recentPerformance}/100. Gerade lohnt sich besonders ${getTrainingEntryLabel(grouped[weakest.module][0])}, weil dort Tempo und Genauigkeit zuletzt am weitesten auseinanderlagen.`;
    return;
  }

  focusNoteEl.textContent = lastEntry
    ? `Zuletzt trainiert: ${getTrainingEntryLabel(lastEntry)} am ${formatLogDate(lastEntry.date)} um ${formatLogTime(lastEntry.date)}.`
    : 'Dein Verlauf ist geladen.';
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
    historyByModule[moduleKey] = priorEntries.concat(entry);
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
  const historyEntries = allLog.filter(entry => entry.module === moduleKey);
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
    'visualsearch-home-recommendation': 'visual_search'
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
  allLog.forEach(entry => {
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

function renderAnalytics(filter) {
  const allLog  = loadTrainingLog();
  const entries = filter === 'all' ? allLog : allLog.filter(e => e.module === filter);
  const performanceEntries = buildPerformanceSeries(entries);

  if (window.TrainingScoringEngine && window.TrainingScoringUI) {
    const analyticsModel = window.TrainingScoringEngine.buildAnalyticsModel(allLog, filter);
    window.TrainingScoringUI.renderAnalyticsPanels(analyticsModel);
  }

  const totalSessions  = entries.length;
  const totalDuration  = entries.reduce((s, e) => s + (e.duration || 0), 0);
  const best           = entries.length ? Math.max(...entries.map(e => e.accuracy || 0)) : 0;
  const avgAcc         = entries.length
    ? Math.round(entries.reduce((s, e) => s + (e.accuracy || 0), 0) / entries.length)
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

  renderAnalyticsInsights(entries, filter, allLog);
  updateAnalyticsWarning();
  renderProgressChart(entries);

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
    const sorted = [...performanceEntries].reverse(); // newest first
    tbody.innerHTML = sorted.map(e => `
      <tr>
        <td>${formatLogDate(e.date)}</td>
        <td>${formatLogTime(e.date)}</td>
        <td>${getTrainingEntryLabel(e)}</td>
        <td>${formatTime(e.duration || 0)}</td>
        <td style="color:#1a7a2a; font-weight:700;">${e.correct || 0}</td>
        <td style="color:#b82020; font-weight:700;">${e.wrong || 0}</td>
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
  let csv = 'Datum;Uhrzeit;Modul;Dauer;Richtig;Falsch;Aufgaben;Trefferquote;Leistungswert;Niveau;Modus;MaxSpan;ØRT\n';
  entries.forEach((entry, index) => {
    const perf = performanceEntries[index];
    csv += [
      formatLogDate(entry.date),
      formatLogTime(entry.date),
      getTrainingEntryLabel(entry),
      formatTime(entry.duration || 0),
      entry.correct || 0,
      entry.wrong || 0,
      entry.total || 0,
      `${entry.accuracy || 0}%`,
      perf ? perf.performanceScore : '',
      entry.difficulty || '',
      entry.mode || '',
      entry.maxSpan || '',
      entry.avgRt || ''
    ].join(';') + '\n';
  });
  downloadTextFile(`${analyticsExportBaseName()}.csv`, '\uFEFF' + csv, 'text/csv;charset=utf-8;');
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
}

initializePsyApp();



