// Pure statistical helpers for training-oriented scoring.
(function() {
  'use strict';

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round(value, digits) {
    const factor = Math.pow(10, digits || 0);
    return Math.round(value * factor) / factor;
  }

  function sum(values) {
    return values.reduce(function(total, value) {
      return total + value;
    }, 0);
  }

  function average(values) {
    if (!values.length) return null;
    return sum(values) / values.length;
  }

  function median(values) {
    if (!values.length) return null;
    const sorted = values.slice().sort(function(a, b) { return a - b; });
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  function standardDeviation(values) {
    if (values.length < 2) return null;
    const avg = average(values);
    const variance = average(values.map(function(value) {
      return Math.pow(value - avg, 2);
    }));
    return Math.sqrt(variance);
  }

  function coefficientOfVariation(values) {
    const avg = average(values);
    const sd = standardDeviation(values);
    if (avg === null || sd === null || avg === 0) return null;
    return sd / avg;
  }

  function percentage(part, total) {
    if (!total) return 0;
    return (part / total) * 100;
  }

  function min(values) {
    return values.length ? Math.min.apply(null, values) : null;
  }

  function max(values) {
    return values.length ? Math.max.apply(null, values) : null;
  }

  function buildReactionMetrics(trials, thresholds) {
    const settings = thresholds || window.TrainingScoringNorms.REACTION_THRESHOLDS;
    const sourceTrials = Array.isArray(trials) ? trials : [];
    const validReactionTimes = [];
    let totalTrials = 0;
    let correctCount = 0;
    let errorCount = 0;
    let omissionCount = 0;
    let anticipationCount = 0;

    sourceTrials.forEach(function(trial) {
      totalTrials += 1;
      const reactionTimeMs = typeof trial.reactionTimeMs === 'number' && isFinite(trial.reactionTimeMs)
        ? trial.reactionTimeMs
        : null;
      const anticipated = !!trial.anticipated || (reactionTimeMs !== null && reactionTimeMs < settings.anticipationMs);
      const omitted = !!trial.omitted || reactionTimeMs === null || reactionTimeMs > settings.omissionMs;
      const valid = !anticipated && !omitted && reactionTimeMs >= settings.anticipationMs && reactionTimeMs <= settings.validMaxMs;

      if (anticipated) anticipationCount += 1;
      if (omitted) omissionCount += 1;
      if (trial.correct) correctCount += 1;
      if (!trial.correct && !omitted) errorCount += 1;
      if (valid && reactionTimeMs !== null) validReactionTimes.push(reactionTimeMs);
    });

    const meanReactionTimeMs = average(validReactionTimes);
    const standardDeviationMs = standardDeviation(validReactionTimes);

    return {
      totalTrials: totalTrials,
      validTrials: validReactionTimes.length,
      correctCount: correctCount,
      errorCount: errorCount,
      omissionCount: omissionCount,
      anticipationCount: anticipationCount,
      meanReactionTimeMs: meanReactionTimeMs === null ? null : round(meanReactionTimeMs, 1),
      medianReactionTimeMs: median(validReactionTimes),
      minReactionTimeMs: min(validReactionTimes),
      maxReactionTimeMs: max(validReactionTimes),
      standardDeviationMs: standardDeviationMs === null ? null : round(standardDeviationMs, 1),
      coefficientOfVariation: coefficientOfVariation(validReactionTimes),
      accuracyPct: round(percentage(correctCount, totalTrials), 1),
      errorRatePct: round(percentage(errorCount, totalTrials), 1),
      omissionRatePct: round(percentage(omissionCount, totalTrials), 1),
      anticipationRatePct: round(percentage(anticipationCount, totalTrials), 1),
      limited: false,
      validReactionTimes: validReactionTimes
    };
  }

  function buildReactionFallback(entry) {
    const totalTrials = Number(entry.total) || 0;
    const correctCount = Number(entry.correct) || 0;
    const errorCount = Number(entry.wrong) || 0;
    const avgRt = typeof entry.avgRt === 'number' && isFinite(entry.avgRt) ? entry.avgRt : null;
    return {
      totalTrials: totalTrials,
      validTrials: avgRt !== null ? Math.max(1, correctCount) : 0,
      correctCount: correctCount,
      errorCount: errorCount,
      omissionCount: Number(entry.omissions) || 0,
      anticipationCount: Number(entry.anticipations) || 0,
      meanReactionTimeMs: avgRt,
      medianReactionTimeMs: avgRt,
      minReactionTimeMs: avgRt,
      maxReactionTimeMs: avgRt,
      standardDeviationMs: null,
      coefficientOfVariation: null,
      accuracyPct: round(typeof entry.accuracy === 'number' ? entry.accuracy : percentage(correctCount, totalTrials), 1),
      errorRatePct: round(percentage(errorCount, totalTrials), 1),
      omissionRatePct: round(percentage(Number(entry.omissions) || 0, totalTrials), 1),
      anticipationRatePct: round(percentage(Number(entry.anticipations) || 0, totalTrials), 1),
      limited: true,
      validReactionTimes: avgRt !== null ? [avgRt] : []
    };
  }

  function buildMemoryMetrics(trials, fallback) {
    const sourceTrials = Array.isArray(trials) ? trials.filter(function(trial) {
      return typeof trial.sequenceLength === 'number' && isFinite(trial.sequenceLength);
    }) : [];

    if (!sourceTrials.length) {
      const highestCorrectSpan = typeof fallback.maxSpan === 'number' ? fallback.maxSpan : null;
      return {
        totalTrials: Number(fallback.total) || 0,
        correctTrials: Number(fallback.correct) || 0,
        accuracyPct: typeof fallback.accuracy === 'number' ? fallback.accuracy : round(percentage(Number(fallback.correct) || 0, Number(fallback.total) || 0), 1),
        highestCorrectSpan: highestCorrectSpan,
        averageCorrectSpan: highestCorrectSpan,
        dropoffPct: null,
        levelBreakdown: [],
        limited: true
      };
    }

    const perLevel = {};
    sourceTrials.forEach(function(trial) {
      const key = String(trial.sequenceLength);
      if (!perLevel[key]) {
        perLevel[key] = { sequenceLength: trial.sequenceLength, total: 0, correct: 0 };
      }
      perLevel[key].total += 1;
      if (trial.correct) perLevel[key].correct += 1;
    });

    const levelBreakdown = Object.keys(perLevel).map(function(key) {
      const level = perLevel[key];
      return {
        sequenceLength: level.sequenceLength,
        total: level.total,
        correct: level.correct,
        accuracyPct: round(percentage(level.correct, level.total), 1)
      };
    }).sort(function(a, b) {
      return a.sequenceLength - b.sequenceLength;
    });

    const correctSpans = sourceTrials.filter(function(trial) { return trial.correct; }).map(function(trial) {
      return trial.sequenceLength;
    });
    const lowHalf = levelBreakdown.slice(0, Math.ceil(levelBreakdown.length / 2));
    const highHalf = levelBreakdown.slice(Math.floor(levelBreakdown.length / 2));
    const lowAcc = average(lowHalf.map(function(level) { return level.accuracyPct; }));
    const highAcc = average(highHalf.map(function(level) { return level.accuracyPct; }));

    return {
      totalTrials: sourceTrials.length,
      correctTrials: correctSpans.length,
      accuracyPct: round(percentage(correctSpans.length, sourceTrials.length), 1),
      highestCorrectSpan: correctSpans.length ? max(correctSpans) : null,
      averageCorrectSpan: correctSpans.length ? round(average(correctSpans), 2) : null,
      dropoffPct: lowAcc !== null && highAcc !== null ? round(lowAcc - highAcc, 1) : null,
      levelBreakdown: levelBreakdown,
      limited: false
    };
  }

  function splitTrials(trials) {
    if (!Array.isArray(trials) || trials.length < 4) {
      return { firstHalf: [], secondHalf: [] };
    }
    const midpoint = Math.floor(trials.length / 2);
    return {
      firstHalf: trials.slice(0, midpoint),
      secondHalf: trials.slice(midpoint)
    };
  }

  function describeTrend(delta, thresholds) {
    const limits = thresholds || window.TrainingScoringNorms.TREND_THRESHOLDS;
    if (delta >= limits.rising) return 'steigend';
    if (delta >= limits.slightlyRising) return 'leicht steigend';
    if (delta <= limits.falling) return 'fallend';
    if (delta <= limits.slightlyFalling) return 'leicht fallend';
    return 'stabil';
  }

  window.TrainingScoringMetrics = {
    clamp: clamp,
    round: round,
    sum: sum,
    average: average,
    median: median,
    min: min,
    max: max,
    standardDeviation: standardDeviation,
    coefficientOfVariation: coefficientOfVariation,
    percentage: percentage,
    buildReactionMetrics: buildReactionMetrics,
    buildReactionFallback: buildReactionFallback,
    buildMemoryMetrics: buildMemoryMetrics,
    splitTrials: splitTrials,
    describeTrend: describeTrend
  };
})();