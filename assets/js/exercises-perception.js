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
  startModuleTimer(digitspanState, 'digitspan', finishDigitSpanExercise);
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
  startModuleTimer(flankerState, 'flanker', finishFlankerExercise);
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
  startModuleTimer(visualsearchState, 'visualsearch', finishVisualSearchExercise);
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

