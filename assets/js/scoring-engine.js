// Core non-clinical scoring engine for the training dashboard.
(function() {
  'use strict';

  const Metrics = window.TrainingScoringMetrics;
  const Norms = window.TrainingScoringNorms;
  const Models = window.TrainingScoringModels;
  const Interpretation = window.TrainingScoringInterpretation;

  function moduleBaseKey(moduleKey) {
    if (!moduleKey) return 'default';
    const rawKey = String(moduleKey);
    if (rawKey.indexOf('math_') === 0) return 'math';
    if (rawKey === 'rotation') return 'spatial_views';
    if (rawKey === 'visualsearch') return 'visual_search';
    return rawKey;
  }

  function getModuleConfig(moduleKey) {
    const baseKey = moduleBaseKey(moduleKey);
    return Norms.MODULES[baseKey] || Norms.MODULES.default;
  }

  function sortByDate(entries) {
    return (Array.isArray(entries) ? entries : []).slice().sort(function(a, b) {
      return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
    });
  }

  function isScoringEligible(entry) {
    return !!entry && entry.countsTowardScoring !== false;
  }

  function getScoringEntries(entries) {
    return (Array.isArray(entries) ? entries : []).filter(isScoringEligible);
  }

  function getCategoryForScore(score) {
    return Norms.SCORE_CATEGORIES.find(function(category) {
      return score >= category.min;
    }) || Norms.SCORE_CATEGORIES[Norms.SCORE_CATEGORIES.length - 1];
  }

  function scaleZones(zones, multiplier) {
    const factor = multiplier || 1;
    return zones.map(function(zone) {
      return {
        key: zone.key,
        label: zone.label,
        min: typeof zone.min === 'number' ? zone.min * factor : null,
        max: typeof zone.max === 'number' ? zone.max * factor : null,
        scoreMin: zone.scoreMin,
        scoreMax: zone.scoreMax
      };
    });
  }

  function scoreFromZones(value, zones, higherIsBetter) {
    if (value === null || value === undefined || !isFinite(value)) return null;
    const ordered = (zones || []).slice();
    const direction = !!higherIsBetter;
    if (!direction) {
      for (let i = 0; i < ordered.length; i++) {
        const zone = ordered[i];
        const min = typeof zone.min === 'number' ? zone.min : -Infinity;
        const max = typeof zone.max === 'number' ? zone.max : Infinity;
        if (value >= min && value <= max) {
          if (!isFinite(max) || min === max) return zone.scoreMin;
          const ratio = (value - min) / (max - min || 1);
          return Metrics.round(zone.scoreMax - ratio * (zone.scoreMax - zone.scoreMin), 1);
        }
      }
      return ordered.length ? ordered[ordered.length - 1].scoreMin : null;
    }

    for (let i = 0; i < ordered.length; i++) {
      const zone = ordered[i];
      const min = typeof zone.min === 'number' ? zone.min : -Infinity;
      const max = typeof zone.max === 'number' ? zone.max : Infinity;
      if (value >= min && value <= max) {
        if (!isFinite(max) || min === max) return zone.scoreMax;
        const ratio = (value - min) / (max - min || 1);
        return Metrics.round(zone.scoreMin + ratio * (zone.scoreMax - zone.scoreMin), 1);
      }
    }
    return ordered.length ? ordered[0].scoreMin : null;
  }

  function compareToBaseline(currentValue, baselineValue, lowerIsBetter) {
    if (currentValue === null || baselineValue === null || baselineValue === 0) return null;
    const diffRatio = lowerIsBetter
      ? (baselineValue - currentValue) / baselineValue
      : (currentValue - baselineValue) / baselineValue;
    return Metrics.clamp(50 + diffRatio * 140, 5, 100);
  }

  function blendScores(normScore, baselineScore) {
    if (baselineScore === null || baselineScore === undefined) return normScore;
    if (normScore === null || normScore === undefined) return baselineScore;
    return Metrics.round((baselineScore * 0.55) + (normScore * 0.45), 1);
  }

  function getThroughput(entry) {
    if (!entry) return null;
    const durationSeconds = Number(entry.duration) || Number(entry.totalSeconds) || 0;
    const minutes = durationSeconds > 0 ? (durationSeconds / 60) : 0;
    if (!minutes) return null;
    return entry.correct / minutes;
  }

  function getStateThresholds(moduleConfig) {
    return Object.assign({}, Norms.STATE_THRESHOLDS || {}, (moduleConfig && moduleConfig.stateThresholds) || {});
  }

  function normalizeEntry(entry) {
    const normalized = Object.assign({}, entry || {});
    normalized.module = normalized.module || 'unknown';
    normalized.baseModule = moduleBaseKey(normalized.module);
    normalized.moduleConfig = getModuleConfig(normalized.module);
    normalized.label = normalized.label || normalized.moduleConfig.label;
    normalized.date = normalized.date || new Date().toISOString();
    normalized.sessionId = normalized.sessionId || Models.createSessionId(normalized.baseModule);
    normalized.nonClinical = normalized.nonClinical !== false;
    normalized.runMode = normalized.runMode === 'practice' ? 'practice' : 'test';
    normalized.countsTowardScoring = normalized.countsTowardScoring !== false && normalized.runMode !== 'practice';
    normalized.trials = Array.isArray(normalized.trials) ? normalized.trials : [];
    normalized.correct = Number(normalized.correct) || 0;
    normalized.wrong = Number(normalized.wrong) || 0;
    normalized.total = Number(normalized.total) || (normalized.correct + normalized.wrong);
    normalized.accuracy = typeof normalized.accuracy === 'number'
      ? normalized.accuracy
      : Metrics.round(Metrics.percentage(normalized.correct, normalized.total), 1);
    normalized.duration = Number(normalized.duration) || 0;
    normalized.totalSeconds = Number(normalized.totalSeconds) || normalized.duration;
    normalized.avgRt = typeof normalized.avgRt === 'number' && isFinite(normalized.avgRt) ? normalized.avgRt : null;
    normalized.maxSpan = typeof normalized.maxSpan === 'number' && isFinite(normalized.maxSpan) ? normalized.maxSpan : null;
    return normalized;
  }

  function computeBaseline(previousEntries) {
    const sample = Array.isArray(previousEntries) ? previousEntries : [];
    const recent = sample.slice(-7);
    const recentScores = recent.map(function(entry) { return entry.scoreProfile.overallScore; }).filter(isFinite);
    const allScores = sample.map(function(entry) { return entry.scoreProfile.overallScore; }).filter(isFinite);
    const reactionMeans = recent.map(function(entry) {
      return entry.reactionMetrics ? entry.reactionMetrics.meanReactionTimeMs : null;
    }).filter(isFinite);
    const sdValues = recent.map(function(entry) {
      return entry.reactionMetrics ? entry.reactionMetrics.standardDeviationMs : null;
    }).filter(isFinite);
    const accuracyValues = recent.map(function(entry) { return entry.accuracy; }).filter(isFinite);
    const throughputValues = recent.map(function(entry) {
      return entry.moduleConfig && entry.moduleConfig.speedLike ? getThroughput(entry) : null;
    }).filter(isFinite);
    const spanValues = recent.map(function(entry) {
      return entry.memoryMetrics ? entry.memoryMetrics.highestCorrectSpan : null;
    }).filter(isFinite);

    return {
      sampleCount: sample.length,
      averageScore: Metrics.average(allScores),
      recentAverageScore: Metrics.average(recentScores),
      bestScore: allScores.length ? Math.max.apply(null, allScores) : null,
      averageReactionTimeMs: Metrics.average(reactionMeans),
      averageSdMs: Metrics.average(sdValues),
      averageAccuracyPct: Metrics.average(accuracyValues),
      averageThroughput: Metrics.average(throughputValues),
      averageSpan: Metrics.average(spanValues)
    };
  }

  function buildStates(context) {
    const states = [];
    const thresholds = getStateThresholds(context.moduleConfig);
    const reaction = context.reactionMetrics;
    const memory = context.memoryMetrics;
    const baseline = context.baseline;
    const speedScore = context.componentMap.speed ? context.componentMap.speed.score : null;
    const accuracyScore = context.componentMap.accuracy ? context.componentMap.accuracy.score : null;
    const consistencyScore = context.componentMap.consistency ? context.componentMap.consistency.score : null;

    if (speedScore !== null && speedScore >= 82 && accuracyScore !== null && accuracyScore >= 82 && consistencyScore !== null && consistencyScore >= 75) {
      states.push('focused-stable');
    }
    if (reaction && reaction.anticipationRatePct > (thresholds.impulsiveAnticipationRatePct || 8)) states.push('impulsive');
    if (speedScore !== null && speedScore >= (thresholds.impulsiveFastScore || 82) && accuracyScore !== null && accuracyScore < (thresholds.impulsiveAccuracyFloor || 68)) states.push('impulsive');
    if (speedScore !== null && speedScore < (thresholds.controlledSlowSpeedCeiling || 54) && accuracyScore !== null && accuracyScore >= (thresholds.controlledSlowAccuracyFloor || 86)) states.push('controlled-slow');
    if (reaction && reaction.standardDeviationMs !== null && reaction.standardDeviationMs > (thresholds.inconsistentSdBaseMs || 80) * (context.moduleConfig.sdMultiplier || 1)) states.push('inconsistent-attention');

    if (reaction && Array.isArray(context.reactionTrials) && context.reactionTrials.length >= 8) {
      const split = Metrics.splitTrials(context.reactionTrials);
      const firstHalf = split.firstHalf.length ? Metrics.buildReactionMetrics(split.firstHalf, Norms.REACTION_THRESHOLDS) : null;
      const secondHalf = split.secondHalf.length ? Metrics.buildReactionMetrics(split.secondHalf, Norms.REACTION_THRESHOLDS) : null;
      if (firstHalf && secondHalf) {
        const speedDrift = (secondHalf.meanReactionTimeMs || 0) - (firstHalf.meanReactionTimeMs || 0);
        const errorLift = (secondHalf.errorRatePct + secondHalf.omissionRatePct) - (firstHalf.errorRatePct + firstHalf.omissionRatePct);
        if (speedDrift > (thresholds.fatigueSpeedDriftMs || 55) || errorLift > (thresholds.fatigueErrorLiftPct || 14)) states.push('fatigue');
      }
    }

    if (memory && memory.dropoffPct !== null && memory.dropoffPct > (thresholds.loadDropoffPct || 24)) states.push('load-dropoff');
    if (baseline.sampleCount >= Norms.MIN_BASELINE_SESSIONS && baseline.recentAverageScore !== null && context.scoreProfile.overallScore < baseline.recentAverageScore - (thresholds.dailyDipPoints || 12)) {
      states.push('daily-dip');
    }

    return Array.from(new Set(states));
  }

  function createComponent(id, label, score, status, strengthText) {
    return {
      id: id,
      label: label,
      score: score,
      status: status,
      strengthText: strengthText
    };
  }

  function buildComponentScores(entry, reactionMetrics, memoryMetrics, baseline) {
    const moduleConfig = entry.moduleConfig;
    const components = [];

    let speedScore = null;
    if (reactionMetrics && reactionMetrics.meanReactionTimeMs !== null) {
      const norm = scoreFromZones(
        reactionMetrics.meanReactionTimeMs,
        scaleZones(Norms.REACTION_SPEED_ZONES_MS, moduleConfig.rtMultiplier || 1),
        false
      );
      const personal = compareToBaseline(reactionMetrics.meanReactionTimeMs, baseline.averageReactionTimeMs, true);
      speedScore = blendScores(norm, personal);
      components.push(createComponent('speed', 'Reaktionsgeschwindigkeit', speedScore, reactionMetrics.meanReactionTimeMs + ' ms', 'Dein Reaktionstempo ist aktuell eine klare Stärke.'));
    } else if (moduleConfig.speedLike) {
      const throughput = getThroughput(entry);
      const personal = compareToBaseline(throughput, baseline.averageThroughput, false);
      speedScore = personal === null ? Metrics.clamp(40 + throughput * 2.5, 20, 88) : personal;
      components.push(createComponent('speed', 'Arbeitstempo', speedScore, Metrics.round(throughput, 1) + ' korrekte Aufgaben/Min', 'Dein Arbeitstempo ist im Training bereits gut nutzbar.'));
    }

    const accuracyBase = Metrics.clamp(
      entry.accuracy - (reactionMetrics ? (reactionMetrics.omissionRatePct * 0.45 + reactionMetrics.anticipationRatePct * 0.55) : 0),
      0,
      100
    );
    const accuracyPersonal = compareToBaseline(entry.accuracy, baseline.averageAccuracyPct, false);
    const accuracyScore = blendScores(accuracyBase, accuracyPersonal);
    components.push(createComponent('accuracy', 'Genauigkeit', accuracyScore, Metrics.round(entry.accuracy, 1) + '%', 'Deine Genauigkeit ist aktuell stabil.'));

    let consistencyScore = null;
    if (reactionMetrics && reactionMetrics.standardDeviationMs !== null) {
      const norm = scoreFromZones(
        reactionMetrics.standardDeviationMs,
        scaleZones(Norms.REACTION_CONSISTENCY_ZONES_SD, moduleConfig.sdMultiplier || 1),
        false
      );
      const personal = compareToBaseline(reactionMetrics.standardDeviationMs, baseline.averageSdMs, true);
      consistencyScore = blendScores(norm, personal);
      components.push(createComponent('consistency', 'Konstanz', consistencyScore, reactionMetrics.standardDeviationMs + ' ms SD', 'Deine Reaktionen wirken aktuell gleichmäßig und stabil.'));
    }

    let memoryScore = null;
    if (memoryMetrics && (memoryMetrics.highestCorrectSpan !== null || entry.baseModule === 'nback')) {
      const memoryNorms = moduleConfig.visualMemory
        ? Norms.MEMORY_SPAN_ZONES.visual
        : Norms.MEMORY_SPAN_ZONES.verbal;
      const spanValue = memoryMetrics.highestCorrectSpan !== null ? memoryMetrics.highestCorrectSpan : entry.maxSpan;
      const spanNorm = spanValue !== null ? scoreFromZones(spanValue, memoryNorms, true) : null;
      const accuracyBlend = Metrics.clamp((memoryMetrics.accuracyPct || entry.accuracy) * 0.9, 0, 100);
      const dropoffPenalty = memoryMetrics.dropoffPct !== null ? Metrics.clamp(memoryMetrics.dropoffPct * 0.8, 0, 30) : 0;
      const norm = Metrics.clamp(((spanNorm || accuracyBlend) * 0.6) + (accuracyBlend * 0.4) - dropoffPenalty, 0, 100);
      const personal = compareToBaseline(spanValue, baseline.averageSpan, false);
      memoryScore = blendScores(norm, personal);
      components.push(createComponent('memory', 'Merkfähigkeit', memoryScore, spanValue === null ? 'ohne Spanne' : 'Spanne ' + spanValue, 'Deine Merkleistung bildet eine solide Basis für weitere Belastung.'));
    }

    let stabilityScore = 78;
    if (reactionMetrics && Array.isArray(entry.reactionTrials) && entry.reactionTrials.length >= 8) {
      const split = Metrics.splitTrials(entry.reactionTrials);
      const firstHalf = split.firstHalf.length ? Metrics.buildReactionMetrics(split.firstHalf, Norms.REACTION_THRESHOLDS) : null;
      const secondHalf = split.secondHalf.length ? Metrics.buildReactionMetrics(split.secondHalf, Norms.REACTION_THRESHOLDS) : null;
      if (firstHalf && secondHalf) {
        const speedDrift = (secondHalf.meanReactionTimeMs || 0) - (firstHalf.meanReactionTimeMs || 0);
        const errorLift = (secondHalf.errorRatePct + secondHalf.omissionRatePct) - (firstHalf.errorRatePct + firstHalf.omissionRatePct);
        stabilityScore = 86;
        if (speedDrift > 20) stabilityScore -= 10;
        if (speedDrift > 40) stabilityScore -= 16;
        if (errorLift > 6) stabilityScore -= 10;
        if (errorLift > 12) stabilityScore -= 16;
      }
    }
    if (memoryMetrics && memoryMetrics.dropoffPct !== null) {
      stabilityScore -= Metrics.clamp(memoryMetrics.dropoffPct * 0.6, 0, 26);
    }
    if (baseline.sampleCount >= Norms.MIN_BASELINE_SESSIONS && baseline.recentAverageScore !== null) {
      const trendDelta = entry.accuracy - (baseline.averageAccuracyPct || entry.accuracy);
      stabilityScore += Metrics.clamp(trendDelta * 0.25, -8, 8);
    }
    stabilityScore = Metrics.clamp(stabilityScore, 15, 100);
    components.push(createComponent('stability', 'Stabilität', stabilityScore, 'über den Verlauf', 'Deine Leistung bleibt über die Einheit hinweg gut tragfähig.'));

    return components;
  }

  function finalizeScoreProfile(entry, componentScores, baseline) {
    const available = componentScores.filter(function(component) {
      return typeof component.score === 'number' && isFinite(component.score);
    });
    const weightMap = Norms.COMPONENT_WEIGHTS;
    const totalWeight = available.reduce(function(sum, component) {
      return sum + (weightMap[component.id] || 0);
    }, 0) || 1;

    const overallScore = Metrics.round(available.reduce(function(sum, component) {
      return sum + component.score * ((weightMap[component.id] || 0) / totalWeight);
    }, 0), 1);

    const category = getCategoryForScore(overallScore);
    const scoreProfile = {
      overallScore: overallScore,
      categoryKey: category.key,
      categoryLabel: category.label,
      categoryTone: category.tone,
      componentScores: available,
      baseline: {
        sampleCount: baseline.sampleCount,
        averageScore: baseline.averageScore === null ? null : Metrics.round(baseline.averageScore, 1),
        recentAverageScore: baseline.recentAverageScore === null ? null : Metrics.round(baseline.recentAverageScore, 1),
        bestScore: baseline.bestScore === null ? null : Metrics.round(baseline.bestScore, 1),
        vsBaselinePct: baseline.averageScore ? Metrics.round(((overallScore - baseline.averageScore) / baseline.averageScore) * 100, 1) : null,
        vsRecentPct: baseline.recentAverageScore ? Metrics.round(((overallScore - baseline.recentAverageScore) / baseline.recentAverageScore) * 100, 1) : null,
        vsBestPct: baseline.bestScore ? Metrics.round(((overallScore - baseline.bestScore) / baseline.bestScore) * 100, 1) : null
      },
      states: []
    };
    return scoreProfile;
  }

  function evaluateEntry(entry, previousEntries) {
    const normalized = normalizeEntry(entry);
    const moduleConfig = normalized.moduleConfig;
    const reactionTrials = normalized.trials.filter(function(trial) {
      return trial && (trial.kind === 'reaction' || typeof trial.reactionTimeMs === 'number' || !!trial.omitted || !!trial.anticipated);
    });
    const memoryTrials = normalized.trials.filter(function(trial) {
      return trial && (trial.kind === 'memory' || typeof trial.sequenceLength === 'number');
    });
    normalized.reactionTrials = reactionTrials;
    normalized.memoryTrials = memoryTrials;
    const reactionMetrics = reactionTrials.length
      ? Metrics.buildReactionMetrics(reactionTrials, Norms.REACTION_THRESHOLDS)
      : (moduleConfig.family === 'reaction' || normalized.avgRt !== null ? Metrics.buildReactionFallback(normalized) : null);
    const memoryMetrics = moduleConfig.family === 'memory' || normalized.maxSpan !== null || memoryTrials.some(function(trial) {
      return typeof trial.sequenceLength === 'number';
    }) ? Metrics.buildMemoryMetrics(memoryTrials, normalized) : null;
    const baseline = computeBaseline(previousEntries);
    const componentScores = buildComponentScores(normalized, reactionMetrics, memoryMetrics, baseline);
    const scoreProfile = finalizeScoreProfile(normalized, componentScores, baseline);
    const componentMap = {};
    scoreProfile.componentScores.forEach(function(component) {
      componentMap[component.id] = component;
    });
    scoreProfile.states = buildStates({
      entry: normalized,
      reactionTrials: reactionTrials,
      moduleConfig: moduleConfig,
      reactionMetrics: reactionMetrics,
      memoryMetrics: memoryMetrics,
      baseline: baseline,
      componentMap: componentMap,
      scoreProfile: scoreProfile
    });
    const interpretation = Interpretation.buildInterpretation({
      entry: normalized,
      moduleConfig: moduleConfig,
      reactionMetrics: reactionMetrics,
      memoryMetrics: memoryMetrics,
      baseline: baseline,
      componentMap: componentMap,
      scoreProfile: scoreProfile
    });

    return Object.assign({}, normalized, {
      reactionMetrics: reactionMetrics,
      memoryMetrics: memoryMetrics,
      scoreProfile: scoreProfile,
      interpretation: interpretation,
      avgRtMs: reactionMetrics && reactionMetrics.meanReactionTimeMs !== null ? reactionMetrics.meanReactionTimeMs : normalized.avgRt,
      speedScore: componentMap.speed ? componentMap.speed.score : null,
      baselineRt: baseline.averageReactionTimeMs,
      performanceScore: scoreProfile.overallScore,
      performanceCategory: scoreProfile.categoryLabel,
      nonClinicalNotice: Norms.NON_CLINICAL_NOTICE
    });
  }

  function buildPerformanceSeries(entries) {
    const sorted = sortByDate(entries).map(normalizeEntry);
    const historyByModule = {};
    return sorted.map(function(entry) {
      const key = entry.module;
      const previous = historyByModule[key] || [];
      const evaluated = evaluateEntry(entry, previous);
      if (entry.countsTowardScoring !== false) {
        historyByModule[key] = previous.concat(evaluated);
      }
      return evaluated;
    });
  }

  function enrichTrainingEntry(entry, existingLog) {
    const history = buildPerformanceSeries((existingLog || []).concat([entry]));
    return history[history.length - 1];
  }

  function buildAggregateSummary(entries) {
    const valid = Array.isArray(entries) ? entries : [];
    const scores = valid.map(function(entry) { return entry.scoreProfile.overallScore; }).filter(isFinite);
    const latest = valid.length ? valid[valid.length - 1] : null;
    const previousChunk = valid.slice(Math.max(0, valid.length - 14), Math.max(0, valid.length - 7));
    const recentChunk = valid.slice(-7);
    const previousAvg = Metrics.average(previousChunk.map(function(entry) { return entry.scoreProfile.overallScore; }).filter(isFinite));
    const recentAvg = Metrics.average(recentChunk.map(function(entry) { return entry.scoreProfile.overallScore; }).filter(isFinite));
    const delta = recentAvg !== null && previousAvg !== null ? Metrics.round(recentAvg - previousAvg, 1) : 0;
    const componentAverages = ['speed', 'accuracy', 'consistency', 'memory', 'stability'].map(function(componentId) {
      const componentValues = valid.map(function(entry) {
        const component = entry.scoreProfile.componentScores.find(function(item) { return item.id === componentId; });
        return component ? component.score : null;
      }).filter(isFinite);
      return {
        id: componentId,
        label: componentId === 'speed' ? 'Reaktionsgeschwindigkeit'
          : componentId === 'accuracy' ? 'Genauigkeit'
          : componentId === 'consistency' ? 'Reaktionskonstanz'
          : componentId === 'memory' ? 'Merkfähigkeit'
          : 'Stabilität',
        score: componentValues.length ? Metrics.round(Metrics.average(componentValues), 1) : null
      };
    }).filter(function(item) { return item.score !== null; });

    const score = scores.length ? Metrics.round(Metrics.average(scores), 1) : null;
    const category = getCategoryForScore(score || 0);
    return {
      score: score,
      category: category,
      latest: latest,
      trendDelta: delta,
      trendLabel: Metrics.describeTrend(delta, Norms.TREND_THRESHOLDS),
      componentAverages: componentAverages
    };
  }

  function buildDashboardModel(log, dashboardModuleMeta) {
    const series = buildPerformanceSeries(log).filter(isScoringEligible);
    const aggregate = buildAggregateSummary(series);
    const meta = dashboardModuleMeta || {};
    const moduleCards = Object.keys(meta).map(function(moduleId) {
      const moduleEntries = series.filter(function(entry) {
        return meta[moduleId].moduleKeys.indexOf(entry.module) >= 0;
      });
      const latest = moduleEntries.length ? moduleEntries[moduleEntries.length - 1] : null;
      const averageScore = moduleEntries.length
        ? Metrics.round(Metrics.average(moduleEntries.map(function(entry) { return entry.scoreProfile.overallScore; })), 1)
        : null;
      return {
        moduleId: moduleId,
        label: meta[moduleId].label,
        count: moduleEntries.length,
        latest: latest,
        averageScore: averageScore
      };
    });

    return {
      nonClinicalNotice: Norms.NON_CLINICAL_NOTICE,
      aggregate: aggregate,
      moduleCards: moduleCards,
      baselineMessage: series.length >= Norms.MIN_BASELINE_SESSIONS
        ? 'Deine persönliche Baseline fließt stärker ein als starre Orientierungswerte.'
        : 'Die persönliche Baseline wird noch aufgebaut. Bis dahin dienen die Werte vor allem als Trainingsorientierung.'
    };
  }

  function buildAnalyticsModel(log, filter) {
    const allSeries = buildPerformanceSeries(log).filter(isScoringEligible);
    const filtered = filter === 'all'
      ? allSeries
      : allSeries.filter(function(entry) { return entry.module === filter; });
    const aggregate = buildAggregateSummary(filtered);
    return {
      filter: filter,
      allEntries: allSeries,
      entries: filtered,
      aggregate: aggregate,
      latest: aggregate.latest,
      nonClinicalNotice: Norms.NON_CLINICAL_NOTICE,
      hasReliableBaseline: filtered.length >= Norms.MIN_BASELINE_SESSIONS
    };
  }

  function evaluateTransientResult(moduleId, options, existingLog) {
    const entry = normalizeEntry(Object.assign({
      module: moduleId === 'rotation' ? 'spatial_views' : (moduleId === 'visualsearch' ? 'visual_search' : moduleId),
      label: getModuleConfig(moduleId).label,
      duration: 0,
      totalSeconds: 0,
      correct: 0,
      wrong: 0,
      total: 0,
      accuracy: typeof options.accuracy === 'number' ? options.accuracy : 0
    }, options || {}));
    const history = buildPerformanceSeries(existingLog || []).filter(function(item) {
      return item.module === entry.module && isScoringEligible(item);
    });
    return evaluateEntry(entry, history);
  }

  function createReactionTrials(count, meanRt, sdRt, accuracyPct, omissionPct, anticipationPct) {
    const trials = [];
    for (let i = 0; i < count; i++) {
      const roll = Math.random() * 100;
      let reactionTimeMs = null;
      let correct = true;
      let omitted = false;
      let anticipated = false;
      if (roll < anticipationPct) {
        reactionTimeMs = 110 + Math.round(Math.random() * 25);
        anticipated = true;
        correct = false;
      } else if (roll < anticipationPct + omissionPct) {
        reactionTimeMs = null;
        omitted = true;
        correct = false;
      } else {
        const gaussian = (Math.random() + Math.random() + Math.random() + Math.random()) / 4;
        reactionTimeMs = Math.max(160, Math.round(meanRt + ((gaussian - 0.5) * 2 * sdRt)));
        correct = roll < anticipationPct + omissionPct + accuracyPct;
      }
      trials.push({
        timestamp: new Date().toISOString(),
        kind: 'reaction',
        reactionTimeMs: reactionTimeMs,
        correct: correct,
        omitted: omitted,
        anticipated: anticipated,
        difficultyLevel: null,
        sequenceLength: null,
        mode: null,
        blockLabel: null
      });
    }
    return trials;
  }

  function createMemoryTrials(levels, baseAccuracy, bestSpan) {
    const trials = [];
    levels.forEach(function(level, index) {
      for (let i = 0; i < 2; i++) {
        const difficultyPenalty = index * 9;
        const correct = Math.random() * 100 < Math.max(18, baseAccuracy - difficultyPenalty);
        trials.push({
          timestamp: new Date().toISOString(),
          kind: 'memory',
          reactionTimeMs: null,
          correct: correct,
          omitted: false,
          anticipated: false,
          difficultyLevel: level,
          sequenceLength: level,
          mode: 'forward',
          blockLabel: null
        });
      }
    });
    return trials;
  }

  function createDemoTrainingLog() {
    const now = Date.now();
    const demoEntries = [
      { module: 'flanker', label: 'Flanker', difficulty: 'medium', duration: 300, totalSeconds: 300, correct: 26, wrong: 6, total: 32, accuracy: 81.3, trials: createReactionTrials(32, 255, 36, 82, 3, 2) },
      { module: 'gonogo', label: 'Go / No-Go', difficulty: 'medium', duration: 300, totalSeconds: 300, correct: 28, wrong: 7, total: 35, accuracy: 80, trials: createReactionTrials(35, 248, 42, 80, 5, 4) },
      { module: 'digitspan', label: 'Digit Span (Vorwärts)', mode: 'forward', duration: 300, totalSeconds: 300, correct: 9, wrong: 3, total: 12, accuracy: 75, maxSpan: 7, trials: createMemoryTrials([4, 5, 6, 7, 8], 88, 7) },
      { module: 'visual_search', label: 'Zielreiz finden', difficulty: 'medium', duration: 300, totalSeconds: 300, correct: 20, wrong: 5, total: 25, accuracy: 80, trials: createReactionTrials(25, 465, 84, 81, 4, 1) },
      { module: 'stroop', label: 'Stroop', duration: 300, totalSeconds: 300, correct: 31, wrong: 8, total: 39, accuracy: 79.5, trials: createReactionTrials(39, 510, 96, 80, 4, 1) },
      { module: 'concentration', label: 'Konzentration', duration: 180, totalSeconds: 180, correct: 11, wrong: 5, total: 16, accuracy: 68.8, trials: createReactionTrials(16, 290, 82, 70, 10, 0) },
      { module: 'flanker', label: 'Flanker', difficulty: 'medium', duration: 300, totalSeconds: 300, correct: 29, wrong: 4, total: 33, accuracy: 87.9, trials: createReactionTrials(33, 244, 30, 88, 2, 1) },
      { module: 'gonogo', label: 'Go / No-Go', difficulty: 'medium', duration: 300, totalSeconds: 300, correct: 30, wrong: 4, total: 34, accuracy: 88.2, trials: createReactionTrials(34, 236, 34, 88, 3, 2) },
      { module: 'digitspan', label: 'Digit Span (Vorwärts)', mode: 'forward', duration: 300, totalSeconds: 300, correct: 10, wrong: 2, total: 12, accuracy: 83.3, maxSpan: 8, trials: createMemoryTrials([5, 6, 7, 8, 9], 90, 8) },
      { module: 'visual_search', label: 'Zielreiz finden', difficulty: 'medium', duration: 300, totalSeconds: 300, correct: 22, wrong: 4, total: 26, accuracy: 84.6, trials: createReactionTrials(26, 430, 68, 85, 3, 1) },
      { module: 'stroop', label: 'Stroop', duration: 300, totalSeconds: 300, correct: 33, wrong: 5, total: 38, accuracy: 86.8, trials: createReactionTrials(38, 472, 78, 86, 3, 1) },
      { module: 'concentration', label: 'Konzentration', duration: 180, totalSeconds: 180, correct: 13, wrong: 3, total: 16, accuracy: 81.3, trials: createReactionTrials(16, 265, 58, 82, 6, 0) }
    ];

    return demoEntries.map(function(entry, index) {
      const stamp = new Date(now - ((demoEntries.length - index) * 86400000)).toISOString();
      return Object.assign({}, entry, {
        sessionId: Models.createSessionId(entry.module),
        date: stamp,
        nonClinical: true
      });
    });
  }

  window.TrainingScoringEngine = {
    buildPerformanceSeries: buildPerformanceSeries,
    enrichTrainingEntry: enrichTrainingEntry,
    buildDashboardModel: buildDashboardModel,
    buildAnalyticsModel: buildAnalyticsModel,
    evaluateTransientResult: evaluateTransientResult,
    createDemoTrainingLog: createDemoTrainingLog,
    moduleBaseKey: moduleBaseKey,
    getModuleConfig: getModuleConfig
  };
})();