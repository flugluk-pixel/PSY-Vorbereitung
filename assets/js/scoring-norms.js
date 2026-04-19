// Configurable training-oriented reference values. These are not clinical norms.
(function() {
  'use strict';

  const SCORE_CATEGORIES = [
    { key: 'excellent', label: 'exzellent', min: 90, tone: 'good' },
    { key: 'strong', label: 'stark', min: 75, tone: 'good' },
    { key: 'solid', label: 'solide', min: 60, tone: 'mid' },
    { key: 'developing', label: 'ausbaufähig', min: 40, tone: 'mid' },
    { key: 'needs-work', label: 'deutlich verbesserungsfähig', min: 0, tone: 'low' }
  ];

  const REACTION_SPEED_ZONES_MS = [
    { key: 'very-strong', label: 'sehr stark', max: 220, scoreMin: 94, scoreMax: 100 },
    { key: 'good', label: 'gut', min: 220, max: 260, scoreMin: 82, scoreMax: 93 },
    { key: 'average', label: 'durchschnittlich', min: 261, max: 320, scoreMin: 62, scoreMax: 81 },
    { key: 'below-average', label: 'unterdurchschnittlich', min: 321, max: 380, scoreMin: 40, scoreMax: 61 },
    { key: 'slow', label: 'langsam', min: 381, scoreMin: 10, scoreMax: 39 }
  ];

  const REACTION_CONSISTENCY_ZONES_SD = [
    { key: 'very-stable', label: 'sehr stabil', max: 30, scoreMin: 92, scoreMax: 100 },
    { key: 'stable', label: 'stabil', min: 30, max: 50, scoreMin: 75, scoreMax: 91 },
    { key: 'medium', label: 'mittel', min: 51, max: 70, scoreMin: 52, scoreMax: 74 },
    { key: 'unstable', label: 'instabil', min: 71, scoreMin: 15, scoreMax: 51 }
  ];

  const VERBAL_SPAN_ZONES = [
    { key: 'strong', label: 'stark', min: 8, scoreMin: 92, scoreMax: 100 },
    { key: 'good', label: 'gut', min: 7, max: 7, scoreMin: 80, scoreMax: 91 },
    { key: 'average', label: 'durchschnittlich', min: 6, max: 6, scoreMin: 62, scoreMax: 79 },
    { key: 'below-average', label: 'unterdurchschnittlich', min: 5, max: 5, scoreMin: 42, scoreMax: 61 },
    { key: 'weak', label: 'schwach', max: 4, scoreMin: 15, scoreMax: 41 }
  ];

  const VISUAL_SPAN_ZONES = [
    { key: 'strong', label: 'stark', min: 7, scoreMin: 92, scoreMax: 100 },
    { key: 'good', label: 'gut', min: 6, max: 6, scoreMin: 80, scoreMax: 91 },
    { key: 'average', label: 'durchschnittlich', min: 5, max: 5, scoreMin: 62, scoreMax: 79 },
    { key: 'below-average', label: 'unterdurchschnittlich', min: 4, max: 4, scoreMin: 42, scoreMax: 61 },
    { key: 'weak', label: 'schwach', max: 3, scoreMin: 15, scoreMax: 41 }
  ];

  const COMPONENT_WEIGHTS = {
    speed: 30,
    accuracy: 25,
    consistency: 20,
    memory: 15,
    stability: 10
  };

  const NON_CLINICAL_NOTICE = 'Dieses Dashboard liefert Trainings- und Orientierungsfeedback für mentale Übungen. Es ersetzt keine klinische oder medizinische Diagnostik.';

  const MODULES = {
    speed: { baseKey: 'speed', family: 'speed', label: 'Speed-Rechnen', speedLike: true },
    math: { baseKey: 'math', family: 'accuracy', label: 'Kopfrechnen', speedLike: true },
    spatial: { baseKey: 'spatial', family: 'accuracy', label: 'Würfel zählen', visualMemory: true },
    nback: { baseKey: 'nback', family: 'memory', label: '2-Back', memoryType: 'working' },
    gonogo: { baseKey: 'gonogo', family: 'reaction', label: 'Go / No-Go', rtMultiplier: 1.0, sdMultiplier: 1.0 },
    stroop: { baseKey: 'stroop', family: 'reaction', label: 'Stroop', rtMultiplier: 1.35, sdMultiplier: 1.25 },
    sequence: { baseKey: 'sequence', family: 'memory', label: 'Zahlenreihen', memoryType: 'sequence' },
    spatial_views: { baseKey: 'spatial_views', family: 'reaction', label: 'Rotations-Übung', rtMultiplier: 4.6, sdMultiplier: 2.3, visualMemory: true },
    formen: { baseKey: 'formen', family: 'reaction', label: 'Formen vergleichen', rtMultiplier: 2.9, sdMultiplier: 2.0, visualMemory: true },
    concentration: { baseKey: 'concentration', family: 'reaction', label: 'Konzentration', rtMultiplier: 1.2, sdMultiplier: 1.4 },
    multitasking: { baseKey: 'multitasking', family: 'composite', label: 'Multitasking' },
    digitspan: { baseKey: 'digitspan', family: 'memory', label: 'Digit Span', memoryType: 'verbal' },
    flanker: { baseKey: 'flanker', family: 'reaction', label: 'Flanker', rtMultiplier: 1.0, sdMultiplier: 1.0 },
    visual_search: { baseKey: 'visual_search', family: 'reaction', label: 'Zielreiz finden', rtMultiplier: 1.85, sdMultiplier: 1.55, visualMemory: true },
    default: { baseKey: 'default', family: 'general', label: 'Training' }
  };

  window.TrainingScoringNorms = {
    NON_CLINICAL_NOTICE: NON_CLINICAL_NOTICE,
    SCORE_CATEGORIES: SCORE_CATEGORIES,
    REACTION_THRESHOLDS: {
      anticipationMs: 150,
      validMaxMs: 1000,
      omissionMs: 1000
    },
    REACTION_SPEED_ZONES_MS: REACTION_SPEED_ZONES_MS,
    REACTION_CONSISTENCY_ZONES_SD: REACTION_CONSISTENCY_ZONES_SD,
    MEMORY_SPAN_ZONES: {
      verbal: VERBAL_SPAN_ZONES,
      visual: VISUAL_SPAN_ZONES
    },
    COMPONENT_WEIGHTS: COMPONENT_WEIGHTS,
    MIN_BASELINE_SESSIONS: 3,
    MIN_REACTION_TRIALS: 6,
    MODULES: MODULES,
    TREND_THRESHOLDS: {
      rising: 6,
      slightlyRising: 2,
      slightlyFalling: -2,
      falling: -6
    }
  };
})();