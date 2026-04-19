// German non-clinical training feedback text generation.
(function() {
  'use strict';

  const STATE_THRESHOLDS = window.TrainingScoringNorms.STATE_THRESHOLDS || {};
  const Copy = (window.TrainingAppCopy || {}).interpretation || {};

  function joinList(parts) {
    return parts.filter(Boolean).join(' ');
  }

  function buildHeadline(context) {
    const states = context.scoreProfile.states;
    if (states.includes('focused-stable')) return typeof Copy.headline === 'function' ? Copy.headline('focused-stable') : '';
    if (states.includes('impulsive')) return typeof Copy.headline === 'function' ? Copy.headline('impulsive') : '';
    if (states.includes('controlled-slow')) return typeof Copy.headline === 'function' ? Copy.headline('controlled-slow') : '';
    if (states.includes('fatigue')) return typeof Copy.headline === 'function' ? Copy.headline('fatigue') : '';
    if (states.includes('inconsistent-attention')) return typeof Copy.headline === 'function' ? Copy.headline('inconsistent-attention') : '';
    if (states.includes('load-dropoff')) return typeof Copy.headline === 'function' ? Copy.headline('load-dropoff') : '';
    return typeof Copy.headline === 'function' ? Copy.headline('default') : 'Dein aktuelles Trainingsbild wirkt insgesamt solide.';
  }

  function buildStrengths(context) {
    const strengths = [];
    context.scoreProfile.componentScores.forEach(function(component) {
      if (component.score >= 78) strengths.push(component.strengthText);
    });
    if (!strengths.length && context.reactionMetrics && context.reactionMetrics.validTrials >= 1) {
      strengths.push(Copy.fallbackStrength || 'Du bringst bereits eine brauchbare Basis mit, auf der sich gut weiter aufbauen lässt.');
    }
    return strengths.slice(0, 2);
  }

  function buildObservations(context) {
    const notes = [];
    const reaction = context.reactionMetrics;
    const memory = context.memoryMetrics;

    if (reaction && reaction.standardDeviationMs !== null && reaction.standardDeviationMs > (STATE_THRESHOLDS.inconsistentSdBaseMs || 80) * (context.moduleConfig.sdMultiplier || 1)) {
      notes.push(typeof Copy.observation === 'function' ? Copy.observation('reaction-spread') : 'Deine Reaktionen streuen im Moment recht stark.');
    }
    if (reaction && reaction.omissionRatePct > (STATE_THRESHOLDS.omissionObservationPct || 10)) {
      notes.push(typeof Copy.observation === 'function' ? Copy.observation('omissions') : 'Es gab mehrere ausgelassene Antworten.');
    }
    if (reaction && reaction.anticipationRatePct > (STATE_THRESHOLDS.impulsiveAnticipationRatePct || 8)) {
      notes.push(typeof Copy.observation === 'function' ? Copy.observation('anticipations') : 'Mehrere sehr frühe Reaktionen sprechen eher für vorschnelles Antworten.');
    }
    if (memory && memory.dropoffPct !== null && memory.dropoffPct > (STATE_THRESHOLDS.loadDropoffPct || 24)) {
      notes.push(typeof Copy.observation === 'function' ? Copy.observation('memory-dropoff') : 'Bei höherer Schwierigkeit fällt die Trefferquote deutlich ab.');
    }
    if (!notes.length) {
      notes.push(typeof Copy.observation === 'function' ? Copy.observation('default') : 'Aktuell zeigen sich keine größeren Auffälligkeiten.');
    }
    return notes.slice(0, 2);
  }

  function buildTrendText(context) {
    const baseline = context.scoreProfile.baseline;
    if (!baseline || baseline.sampleCount < window.TrainingScoringNorms.MIN_BASELINE_SESSIONS) {
      return typeof Copy.trendBuilding === 'function' ? Copy.trendBuilding() : 'Dein persönlicher Vergleichswert wird noch aufgebaut.';
    }
    return typeof Copy.trendRecent === 'function'
      ? Copy.trendRecent(baseline.vsRecentPct)
      : 'Im Vergleich zu deinen letzten Einheiten gibt es aktuell noch keinen klaren Vergleichswert.';
  }

  function buildRecommendation(context) {
    const states = context.scoreProfile.states;
    if (states.includes('impulsive')) return typeof Copy.recommendation === 'function' ? Copy.recommendation('impulsive', context.scoreProfile.overallScore) : '';
    if (states.includes('controlled-slow')) return typeof Copy.recommendation === 'function' ? Copy.recommendation('controlled-slow', context.scoreProfile.overallScore) : '';
    if (states.includes('fatigue') || states.includes('load-dropoff')) return typeof Copy.recommendation === 'function' ? Copy.recommendation('fatigue-or-load', context.scoreProfile.overallScore) : '';
    if (states.includes('inconsistent-attention')) return typeof Copy.recommendation === 'function' ? Copy.recommendation('inconsistent-attention', context.scoreProfile.overallScore) : '';
    return typeof Copy.recommendation === 'function' ? Copy.recommendation('default', context.scoreProfile.overallScore) : 'Halte die Einheit lieber kompakt.';
  }

  function buildInterpretation(context) {
    return {
      headline: buildHeadline(context),
      strengths: buildStrengths(context),
      observations: buildObservations(context),
      trendText: buildTrendText(context),
      recommendation: buildRecommendation(context),
      summary: joinList([
        buildHeadline(context),
        buildTrendText(context),
        buildRecommendation(context)
      ])
    };
  }

  window.TrainingScoringInterpretation = {
    buildInterpretation: buildInterpretation
  };
})();