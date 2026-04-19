// Non-clinical training data models used by the dashboard scoring pipeline.
(function() {
  'use strict';

  /**
   * @typedef {Object} TrainingTrial
   * @property {string} timestamp
   * @property {string} kind
   * @property {?number} reactionTimeMs
   * @property {boolean} correct
   * @property {boolean} omitted
   * @property {boolean} anticipated
   * @property {?number} difficultyLevel
   * @property {?number} sequenceLength
   * @property {?string} mode
   * @property {?string} blockLabel
   */

  /**
   * @typedef {Object} TrainingSessionEntry
   * @property {string} sessionId
   * @property {string} date
   * @property {string} module
   * @property {string} label
   * @property {boolean} nonClinical
   * @property {number} duration
   * @property {number} totalSeconds
   * @property {number} correct
   * @property {number} wrong
   * @property {number} total
   * @property {number} accuracy
   * @property {?number} avgRt
   * @property {?number} maxSpan
   * @property {?TrainingTrial[]} trials
   */

  /**
   * @typedef {Object} ReactionMetrics
   * @property {number} totalTrials
   * @property {number} validTrials
   * @property {number} correctCount
   * @property {number} errorCount
   * @property {number} omissionCount
   * @property {number} anticipationCount
   * @property {?number} meanReactionTimeMs
   * @property {?number} medianReactionTimeMs
   * @property {?number} minReactionTimeMs
   * @property {?number} maxReactionTimeMs
   * @property {?number} standardDeviationMs
   * @property {?number} coefficientOfVariation
   * @property {number} accuracyPct
   * @property {number} errorRatePct
   * @property {number} omissionRatePct
   * @property {number} anticipationRatePct
   * @property {boolean} limited
   */

  /**
   * @typedef {Object} MemoryMetrics
   * @property {number} totalTrials
   * @property {number} correctTrials
   * @property {number} accuracyPct
   * @property {?number} highestCorrectSpan
   * @property {?number} averageCorrectSpan
   * @property {?number} dropoffPct
   * @property {Array<Object>} levelBreakdown
   * @property {boolean} limited
   */

  /**
   * @typedef {Object} ScoreProfile
   * @property {number} overallScore
   * @property {string} categoryKey
   * @property {string} categoryLabel
   * @property {Array<Object>} componentScores
   * @property {Array<string>} states
   * @property {Object} baseline
   */

  function createSessionId(prefix) {
    const base = prefix || 'session';
    return base + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  }

  window.TrainingScoringModels = {
    createSessionId: createSessionId
  };
})();