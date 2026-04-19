// German non-clinical training feedback text generation.
(function() {
  'use strict';

  function joinList(parts) {
    return parts.filter(Boolean).join(' ');
  }

  function buildHeadline(context) {
    const states = context.scoreProfile.states;
    if (states.includes('focused-stable')) {
      return 'Du reagierst schnell, sauber und konstant. Das spricht aktuell für einen sehr guten Fokus.';
    }
    if (states.includes('impulsive')) {
      return 'Deine Geschwindigkeit ist stark, allerdings passieren dabei etwas mehr Fehler. Das spricht eher für impulsives Antworten.';
    }
    if (states.includes('controlled-slow')) {
      return 'Du arbeitest kontrolliert und präzise, reagierst aktuell aber eher vorsichtig als schnell.';
    }
    if (states.includes('fatigue')) {
      return 'Zu Beginn war deine Leistung stabil, im weiteren Verlauf gab es aber einen erkennbaren Leistungsabfall.';
    }
    if (states.includes('inconsistent-attention')) {
      return 'Deine Reaktionen schwanken aktuell deutlich. Das kann auf wechselnde Konzentration oder Ermüdung hindeuten.';
    }
    if (states.includes('load-dropoff')) {
      return 'Mit steigender Schwierigkeit sinkt deine Leistung aktuell spürbar. Das ist ein typisches Signal für Belastung im Training.';
    }
    return 'Dein aktuelles Trainingsprofil wirkt insgesamt solide. Einige Bereiche sind bereits stabil, andere lassen sich noch gezielt ausbauen.';
  }

  function buildStrengths(context) {
    const strengths = [];
    context.scoreProfile.componentScores.forEach(function(component) {
      if (component.score >= 78) strengths.push(component.strengthText);
    });
    if (!strengths.length && context.reactionMetrics && context.reactionMetrics.validTrials >= 1) {
      strengths.push('Du bringst bereits eine verwertbare Trainingsbasis mit, auf der sich gut aufbauen lässt.');
    }
    return strengths.slice(0, 2);
  }

  function buildObservations(context) {
    const notes = [];
    const reaction = context.reactionMetrics;
    const memory = context.memoryMetrics;

    if (reaction && reaction.standardDeviationMs !== null && reaction.standardDeviationMs > 70 * (context.moduleConfig.sdMultiplier || 1)) {
      notes.push('Die Streuung deiner Reaktionen ist aktuell eher hoch. Dadurch wirkt die Aufmerksamkeit etwas wechselhaft.');
    }
    if (reaction && reaction.omissionRatePct > 8) {
      notes.push('Es gab mehrere Auslassungen. Für eine stabile Aufmerksamkeit lohnt sich hier mehr Ruhe im Ablauf.');
    }
    if (reaction && reaction.anticipationRatePct > 6) {
      notes.push('Mehrere sehr frühe Reaktionen sprechen eher für vorschnelles Antworten als für saubere Kontrolle.');
    }
    if (memory && memory.dropoffPct !== null && memory.dropoffPct > 18) {
      notes.push('Bei höherer Schwierigkeit fällt die Trefferquote deutlich ab. Das spricht eher für Belastung als für fehlende Grundfähigkeit.');
    }
    if (!notes.length) {
      notes.push('Aktuell zeigen sich keine auffälligen Schwankungen, die über ein normales Trainingsmuster hinausgehen.');
    }
    return notes.slice(0, 2);
  }

  function buildTrendText(context) {
    const baseline = context.scoreProfile.baseline;
    if (!baseline || baseline.sampleCount < window.TrainingScoringNorms.MIN_BASELINE_SESSIONS) {
      return 'Baseline wird aufgebaut. Noch zu wenige Daten für eine verlässliche Verlaufsauswertung.';
    }

    const recentText = baseline.vsRecentPct === null
      ? 'ohne Vergleich zur letzten Trainingsphase'
      : (baseline.vsRecentPct >= 0
        ? `${baseline.vsRecentPct}% über deinem Schnitt der letzten 7 Sessions`
        : `${Math.abs(baseline.vsRecentPct)}% unter deinem Schnitt der letzten 7 Sessions`);
    return 'Deine aktuelle Tagesform liegt ' + recentText + '.';
  }

  function buildRecommendation(context) {
    const states = context.scoreProfile.states;
    if (states.includes('impulsive')) return 'Für die nächste Runde hilft etwas weniger Tempo und ein klarer Fokus auf saubere Entscheidungen.';
    if (states.includes('controlled-slow')) return 'Wenn du dich stabil fühlst, kannst du im nächsten Durchgang etwas mehr Tempo zulassen.';
    if (states.includes('fatigue') || states.includes('load-dropoff')) return 'Kurze, klare Einheiten mit Pause dazwischen sind hier oft sinnvoller als noch mehr Dauer.';
    if (states.includes('inconsistent-attention')) return 'Ein ruhiger Start und ein etwas gleichmäßigeres Antworttempo helfen meist mehr als zusätzlicher Druck.';
    if (context.scoreProfile.overallScore >= 80) return 'Du kannst den Schwierigkeitsgrad oder die Länge der Einheit behutsam steigern.';
    return 'Halte die Einheit kompakt und arbeite zuerst an Stabilität, bevor du weiter beschleunigst.';
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