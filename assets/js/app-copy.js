(function() {
  'use strict';

  function dashboardDomainStatus(score) {
    if (score >= 80) return 'läuft gerade richtig gut';
    if (score >= 60) return 'ist schon recht stabil';
    return 'kann gerade noch zulegen';
  }

  function analyticsDomainStatus(score) {
    if (score >= 80) return 'läuft im Moment stark';
    if (score >= 60) return 'wirkt schon recht stabil';
    return 'braucht gerade etwas mehr Aufmerksamkeit';
  }

  function reactionSpeedSummary(meanReactionTimeMs, context) {
    if (meanReactionTimeMs === null) return 'Noch zu wenige saubere Reaktionen für eine belastbare Tempo-Einordnung.';
    if (isComplexVisualContext(context)) {
      if (meanReactionTimeMs <= 900) return 'Du bearbeitest diese visuell anspruchsvollere Aufgabe insgesamt sehr zügig und dennoch kontrolliert.';
      if (meanReactionTimeMs <= 1300) return 'Dein Such- und Entscheidungstempo wirkt hier zügig und unauffällig.';
      if (meanReactionTimeMs <= 1800) return 'Dein Bearbeitungstempo wirkt hier ordentlich, aber noch nicht besonders druckvoll.';
      return 'Für diese komplexere Such- oder Vergleichsaufgabe wirkt dein Bearbeitungstempo in dieser Einheit eher verlangsamt.';
    }
    if (isControlContext(context)) {
      if (meanReactionTimeMs <= 500) return 'Du reagierst unter dieser Aufmerksamkeitsanforderung insgesamt sehr zügig.';
      if (meanReactionTimeMs <= 750) return 'Dein Reaktionstempo wirkt hier zügig und ohne auffälliges Tempo-Problem.';
      if (meanReactionTimeMs <= 1000) return 'Dein Reaktionstempo wirkt hier ordentlich, aber nicht besonders schnell.';
      return 'Dein Reaktionstempo wirkt in dieser Einheit unter dieser Anforderung eher verlangsamt.';
    }
    if (meanReactionTimeMs <= 350) return 'Du reagierst hier insgesamt sehr zügig und schnell.';
    if (meanReactionTimeMs <= 500) return 'Du reagierst hier insgesamt zügig und ohne auffälliges Tempo-Problem.';
    if (meanReactionTimeMs <= 650) return 'Dein Reaktionstempo wirkt insgesamt ordentlich, aber nicht besonders schnell.';
    return 'Dein Reaktionstempo wirkt in dieser Einheit eher verlangsamt.';
  }

  function reactionStabilitySummary(coefficientOfVariation, standardDeviationMs, context) {
    if (coefficientOfVariation === null && standardDeviationMs === null) {
      return 'Zur Gleichmäßigkeit liegen nur wenige Werte vor.';
    }
    if (coefficientOfVariation !== null) {
      if (isComplexVisualContext(context)) {
        if (coefficientOfVariation <= 0.18) return 'Dein Such- und Entscheidungstempo blieb dabei sehr gleichmäßig.';
        if (coefficientOfVariation <= 0.28) return 'Dein Suchtempo blieb dabei überwiegend gleichmäßig.';
        if (coefficientOfVariation <= 0.38) return 'Dein Bearbeitungstempo hat dabei merklich geschwankt.';
        return 'Dein Bearbeitungstempo hat dabei deutlich geschwankt.';
      }
      if (coefficientOfVariation <= 0.18) return 'Die Reaktionen waren dabei sehr gleichmäßig.';
      if (coefficientOfVariation <= 0.28) return 'Die Reaktionen waren überwiegend gleichmäßig.';
      if (coefficientOfVariation <= 0.38) return 'Die Reaktionszeiten haben merklich geschwankt.';
      return 'Die Reaktionszeiten haben deutlich geschwankt.';
    }
    if (isComplexVisualContext(context)) {
      if (standardDeviationMs <= 80) return 'Dein Bearbeitungstempo wirkte ziemlich gleichmäßig.';
      if (standardDeviationMs <= 140) return 'Dein Bearbeitungstempo wirkte insgesamt noch recht stabil.';
      return 'Dein Bearbeitungstempo wirkte eher wechselhaft.';
    }
    if (standardDeviationMs <= 80) return 'Die Reaktionen wirkten ziemlich gleichmäßig.';
    if (standardDeviationMs <= 140) return 'Die Reaktionen wirkten insgesamt noch recht stabil.';
    return 'Die Reaktionen wirkten eher wechselhaft.';
  }

  function reactionAccuracySummary(reaction, context) {
    if (!reaction || !reaction.totalTrials) return 'Es liegen noch keine Fehler- oder Auslassungsdaten vor.';
    const snippets = [];
    if (reaction.errorRatePct <= 5) {
      snippets.push(isComplexVisualContext(context) ? 'Du hast nur wenige Fehlentscheidungen gezeigt' : 'Du hast nur wenige Fehlreaktionen gezeigt');
    } else if (reaction.errorRatePct <= 12) {
      snippets.push(isComplexVisualContext(context) ? 'es gab einzelne Fehlentscheidungen' : 'es gab einzelne Fehlreaktionen');
    } else {
      snippets.push(isComplexVisualContext(context) ? 'es gab relativ viele Fehlentscheidungen' : 'es gab relativ viele Fehlreaktionen');
    }

    if (reaction.omissionRatePct <= 3) {
      snippets.push(isComplexVisualContext(context) ? 'und kaum übersehene oder ausgelassene Antworten' : 'und kaum ausgelassene Antworten');
    } else if (reaction.omissionRatePct <= 10) {
      snippets.push(isComplexVisualContext(context) ? 'mit einigen übersehenen oder ausgelassenen Antworten' : 'mit einigen ausgelassenen Antworten');
    } else {
      snippets.push(isComplexVisualContext(context) ? 'mit vielen übersehenen oder ausgelassenen Antworten' : 'mit vielen ausgelassenen Antworten');
    }

    if (reaction.anticipationRatePct > 5) {
      snippets.push('sowie einigen sehr vorschnellen Reaktionen');
    }

    return snippets.join(' ') + '.';
  }

  function memoryCapacitySummary(memory) {
    if (!memory || memory.highestCorrectSpan === null) {
      return 'Noch zu wenige Daten für eine belastbare Einordnung deiner Merkspanne.';
    }
    if (memory.highestCorrectSpan >= 8) return 'Du konntest dir in dieser Einheit auch längere Folgen noch gut merken.';
    if (memory.highestCorrectSpan >= 6) return 'Deine Merkspanne wirkt in dieser Einheit solide und alltagstauglich.';
    if (memory.highestCorrectSpan >= 4) return 'Kürzere bis mittlere Folgen klappten, längere wurden eher anspruchsvoll.';
    return 'Schon kürzere Folgen waren in dieser Einheit eher anstrengend.';
  }

  function memoryAccuracySummary(memory) {
    if (!memory || !memory.totalTrials) return 'Es liegen noch keine ausreichenden Trefferdaten vor.';
    if (memory.accuracyPct >= 85) return 'Du hast einen großen Teil der Gedächtnisaufgaben richtig gelöst.';
    if (memory.accuracyPct >= 70) return 'Du hast viele Aufgaben richtig gelöst, aber nicht durchgehend stabil.';
    if (memory.accuracyPct >= 55) return 'Die Trefferquote war wechselhaft und mit spürbaren Unsicherheiten.';
    return 'Die Gedächtnisaufgaben waren in dieser Einheit insgesamt eher schwierig.';
  }

  function memoryDropoffSummary(memory) {
    if (!memory || memory.dropoffPct === null) return 'Wie stark die Leistung mit steigender Schwierigkeit abfällt, ist noch nicht klar erkennbar.';
    if (memory.dropoffPct <= 10) return 'Auch bei schwereren Folgen blieb die Leistung recht stabil.';
    if (memory.dropoffPct <= 25) return 'Bei schwereren Folgen war ein spürbarer, aber noch normaler Leistungsabfall zu sehen.';
    return 'Mit steigender Schwierigkeit ist die Leistung deutlich abgefallen.';
  }

  function progressSummary(baselineReady, vsBaselinePct, trendLabel) {
    const baselineText = baselineReady
      ? 'Dein persönlicher Durchschnitt ist inzwischen stabil genug, um deine aktuellen Werte sinnvoll damit zu vergleichen.'
      : 'Dein persönlicher Durchschnitt wird noch aufgebaut, deshalb sind Trend und Vergleich aktuell noch vorsichtiger zu lesen.';
    const vsBaselineText = vsBaselinePct === null
      ? 'Ein genauer Vergleich zur persönlichen Basis ist noch nicht möglich.'
      : (vsBaselinePct >= 0
        ? 'Aktuell liegst du über deinem bisherigen Durchschnitt.'
        : 'Aktuell liegst du etwas unter deinem bisherigen Durchschnitt.');
    const trendText = trendLabel
      ? 'Im kurzen Verlauf wirkt deine Entwicklung derzeit ' + trendLabel + '.'
      : 'Für den Kurzverlauf liegt noch keine klare Richtung vor.';
    return baselineText + ' ' + vsBaselineText + ' ' + trendText;
  }

  function isModuleContext(context, keys) {
    const baseKey = context && context.moduleConfig && context.moduleConfig.baseKey;
    return !!baseKey && keys.indexOf(baseKey) >= 0;
  }

  function isComplexVisualContext(context) {
    return isModuleContext(context, ['visual_search', 'formen', 'spatial_views', 'pqscan']);
  }

  function isFastReactionContext(context) {
    return isModuleContext(context, ['gonogo', 'flanker']);
  }

  function isControlContext(context) {
    return isModuleContext(context, ['stroop', 'concentration']);
  }

  function interpretationHeadline(state, context) {
    if (state === 'focused-stable') {
      if (isComplexVisualContext(context)) return 'Du arbeitest in dieser visuell anspruchsvolleren Aufgabe zügig, sauber und gleichmäßig. Das wirkt aktuell sehr kontrolliert und stabil.';
      if (isControlContext(context)) return 'Du reagierst unter dieser Aufmerksamkeitsanforderung schnell, sauber und gleichmäßig. Das wirkt aktuell sehr fokussiert und stabil.';
      return 'Du reagierst schnell, sauber und gleichmäßig. Das wirkt aktuell sehr fokussiert und stabil.';
    }
    if (state === 'impulsive') {
      if (isComplexVisualContext(context)) return 'Du findest die Lösung oft, antwortest für diese komplexere Aufgabe im Moment aber etwas zu hastig. Das spricht eher für Eile als für fehlendes Können.';
      return 'Dein Tempo ist gut, aber gerade kommen etwas mehr vorschnelle Antworten dazu. Eher ein Zeichen von Eile als von fehlendem Können.';
    }
    if (state === 'controlled-slow') {
      if (isComplexVisualContext(context)) return 'Du arbeitest in dieser komplexeren visuellen Aufgabe kontrolliert und ordentlich, im Moment aber eher vorsichtig als wirklich zügig.';
      return 'Du arbeitest kontrolliert und ordentlich, reagierst im Moment aber eher vorsichtig als schnell.';
    }
    if (state === 'fatigue') return 'Am Anfang lief es stabil, später hat die Leistung jedoch merklich nachgelassen.';
    if (state === 'inconsistent-attention') {
      if (isComplexVisualContext(context)) return 'Dein Arbeitstempo und deine Suchruhe schwanken in dieser Aufgabe im Moment deutlich. Das wirkt nach wechselnder Konzentration oder nachlassender Frische.';
      return 'Deine Reaktionen schwanken im Moment deutlich. Das wirkt nach wechselnder Konzentration oder nachlassender Frische.';
    }
    if (state === 'load-dropoff') return 'Sobald es schwerer wird, fällt deine Leistung im Moment spürbar ab. Das spricht eher für Überlastung in der Aufgabe als für fehlende Grundlage.';
    return 'Dein aktuelles Trainingsbild wirkt insgesamt solide. Einiges sitzt schon gut, anderes lässt sich noch gezielt verbessern.';
  }

  function interpretationObservation(type, context) {
    if (type === 'reaction-spread') {
      if (isComplexVisualContext(context)) return 'Dein Tempo streut in dieser Such- oder Vergleichsaufgabe recht stark. Dadurch wirkt die Bearbeitung nicht ganz gleichmäßig.';
      return 'Deine Reaktionen streuen im Moment recht stark. Dadurch wirkt die Aufmerksamkeit nicht ganz gleichmäßig.';
    }
    if (type === 'omissions') {
      if (isComplexVisualContext(context)) return 'Es gab mehrere ausgelassene Antworten. In dieser komplexeren Aufgabe hilft meist ein ruhigerer, systematischerer Suchrhythmus.';
      return 'Es gab mehrere ausgelassene Antworten. Etwas mehr Ruhe im Ablauf könnte hier helfen.';
    }
    if (type === 'anticipations') return 'Mehrere sehr frühe Reaktionen sprechen eher für vorschnelles Antworten als für saubere Kontrolle.';
    if (type === 'memory-dropoff') return 'Bei höherer Schwierigkeit fällt die Trefferquote deutlich ab. Das wirkt eher nach Überforderung in der Situation als nach fehlender Grundfähigkeit.';
    return 'Aktuell zeigen sich keine größeren Auffälligkeiten, die über ein normales Trainingsmuster hinausgehen.';
  }

  function interpretationTrendBuilding() {
    return 'Dein persönlicher Vergleichswert wird noch aufgebaut. Für einen wirklich stabilen Verlauf sind noch etwas mehr Daten nötig.';
  }

  function interpretationTrendRecent(vsRecentPct) {
    if (vsRecentPct === null) return 'Im Vergleich zu deinen letzten Einheiten gibt es aktuell noch keinen klaren Vergleichswert.';
    if (vsRecentPct >= 0) return 'Im Vergleich zu deinen letzten Einheiten liegst du aktuell ' + vsRecentPct + '% über deinem Schnitt der letzten 7 Einheiten.';
    return 'Im Vergleich zu deinen letzten Einheiten liegst du aktuell ' + Math.abs(vsRecentPct) + '% unter deinem Schnitt der letzten 7 Einheiten.';
  }

  function interpretationRecommendation(type, overallScore, context) {
    if (type === 'impulsive') return 'Für die nächste Runde hilft meist: einen Tick ruhiger starten und lieber sauber als überhastet antworten.';
    if (type === 'controlled-slow') {
      if (isComplexVisualContext(context)) return 'Bei dieser komplexeren Aufgabe ist sauberes Arbeiten wichtiger als Maximaltempo. Mehr Tempo lohnt sich erst, wenn Genauigkeit und Konstanz stabil bleiben.';
      return 'Wenn du dich stabil fühlst, kannst du im nächsten Durchgang etwas mehr Tempo zulassen.';
    }
    if (type === 'fatigue-or-load') return 'Hier helfen oft eher kürzere, klare Einheiten mit kleiner Pause als ein zu langer Block am Stück.';
    if (type === 'inconsistent-attention') return 'Ein ruhiger Start und ein gleichmäßigeres Antworttempo bringen hier meist mehr als noch mehr Druck.';
    if (overallScore >= 80) {
      if (isComplexVisualContext(context)) return 'Du kannst Schwierigkeit oder Reizdichte vorsichtig steigern, solange Genauigkeit und Suchruhe stabil bleiben.';
      if (isFastReactionContext(context)) return 'Du kannst Tempo oder Blocklänge vorsichtig steigern, solange die Antworten weiter sauber bleiben.';
      return 'Du kannst die Länge oder Schwierigkeit vorsichtig steigern, solange die Qualität stabil bleibt.';
    }
    return 'Halte die Einheit lieber kompakt und arbeite zuerst an Ruhe und Stabilität, bevor du mehr Tempo drauflegst.';
  }

  function quickStartReasonTemplate(mode, focusComponent) {
    const templates = {
      practice: {
        speed: 'um wieder leichter ins Arbeitstempo zu finden',
        accuracy: 'um unter Zeitdruck wieder sauberer zu arbeiten',
        consistency: 'um ruhiger und gleichmäßiger durch die Aufgaben zu gehen',
        memory: 'um Merkspanne und Arbeitsgedächtnis wieder nach vorne zu bringen',
        stability: 'um deine Reaktionskontrolle wieder etwas zu festigen'
      },
      test: {
        speed: 'als kurzer Check, wie schnell du im Moment arbeitest',
        accuracy: 'um zu sehen, wie sauber du unter Zeitdruck bleibst',
        consistency: 'um besser zu sehen, wie gleichmäßig du gerade arbeitest',
        memory: 'als kurzer Check für Merkspanne und Arbeitsgedächtnis',
        stability: 'um zu sehen, wie stabil deine Kontrolle gerade bleibt'
      }
    };
    const group = mode === 'practice' ? templates.practice : templates.test;
    return group[focusComponent] || group.accuracy;
  }

  function quickStartDefaultReason(mode) {
    return mode === 'practice'
      ? 'Ein ruhiger Wiedereinstieg für den nächsten Trainingsblock.'
      : 'Ein passender Start für einen kurzen Vergleichsblock.';
  }

  function quickStartGeneratedSummary(mode, hasHistory) {
    if (!hasHistory) {
      return 'Es sind noch kaum Verlaufsdaten da. Deshalb startet der Block bewusst ausgewogen über mehrere Kernbereiche.';
    }
    if (mode === 'practice') {
      return 'Der Block greift vor allem die Bereiche auf, die zuletzt noch nicht ganz stabil wirkten, und bleibt dabei bewusst abwechslungsreich.';
    }
    return 'Der Block mischt gerade schwächere Bereiche mit einer eher stabilen Vergleichsübung, damit du schnell wieder ein gutes Gefühl für deinen Stand bekommst.';
  }

  function quickStartEmphasis(focusText, hasFocus) {
    return hasFocus
      ? 'Der Block hat sich vor allem um ' + focusText + ' gekümmert.'
      : 'Der Block war bewusst ausgewogen zusammengestellt.';
  }

  function quickStartRecommendation(mode, primaryFocus) {
    if (mode === 'practice') {
      return 'Du hast jetzt vor allem ' + primaryFocus + ' trainiert. Als nächster Schritt passt ein kurzer Testblock, um zu sehen, ob sich das schon stabiler zeigt.';
    }
    return 'Du hast jetzt einen kompakten Überblick mit Schwerpunkt auf ' + primaryFocus + '. Als nächster Schritt passt ein Übungsblock, um genau diesen Bereich weiter zu festigen.';
  }

  function quickStartPreviewCopy(mode) {
    return mode === 'practice'
      ? 'Der Block nimmt vor allem die Bereiche auf, die gerade am meisten Trainingspotenzial haben, und bleibt dabei bewusst kompakt.'
      : 'Der Block stellt dir eine kurze, sinnvolle Testreihe zusammen, damit du deinen aktuellen Stand schnell wieder einschätzen kannst.';
  }

  function quickStartPreviewHeading(mode) {
    return mode === 'practice' ? 'Darauf legt der Block den Fokus' : 'So ist der Block gedacht';
  }

  function dashboardQuickCardText(slot, hasData) {
    if (slot === 'primary') {
      return hasData
        ? 'Diese Übung hattest du zuletzt seltener im Fokus. Sie ist ein guter nächster Schritt zur Abwechslung.'
        : 'Hier lohnt sich ein erster Start, damit du auch in diesem Bereich einen Vergleichswert aufbaust.';
    }
    if (slot === 'secondary') {
      return hasData
        ? 'Damit kannst du dort weitermachen, wo du zuletzt aufgehört hast.'
        : 'Eine gute Wahl für eine kurze, vertraute Trainingseinheit.';
    }
    return hasData
      ? 'Hier lief es zuletzt solide. Gut, wenn du an einer Stärke weiterarbeiten möchtest.'
      : 'Passt gut, wenn du heute bewusst etwas anderes als sonst machen möchtest.';
  }

  function dashboardFocusRecommendation(recentPerformance, weakestLabel) {
    return 'Dein letzter Leistungswert liegt im Schnitt bei ' + recentPerformance + '/100. Gerade lohnt sich besonders ' + weakestLabel + ', weil dort Tempo und Genauigkeit zuletzt am weitesten auseinanderlagen.';
  }

  function dashboardLastTrained(label, date, time) {
    return 'Zuletzt trainiert: ' + label + ' am ' + date + ' um ' + time + '.';
  }

  const dashboardQuickCardSlots = [
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

  const dashboardSectionDefs = [
    {
      title: 'Rechnen & Gedächtnis',
      copy: 'Hier trainierst du schnelles Rechnen, Merken und sicheres Behalten von Zahlenfolgen.',
      cards: [
        { moduleId: 'speed', kicker: 'Zahlenfolge', title: 'Speed-Rechnen', copy: 'Addiere schnell und gib immer nur die letzte Ziffer der Summe ein.', accent: true },
        { moduleId: 'math', kicker: 'Grundrechenarten', title: 'Kopfrechnen 1-4 Stellen', copy: 'Rechne Aufgaben im Kopf und wähle zwischen Addition, Subtraktion, Multiplikation oder gemischtem Modus.' },
        { moduleId: 'nback', kicker: 'Arbeitsgedächtnis', title: '2-Back', copy: 'Entscheide bei jeder Zahl, ob sie dieselbe ist wie die Zahl von vor zwei Schritten.' },
        { moduleId: 'digitspan', kicker: 'Arbeitsgedächtnis', title: 'Digit Span', copy: 'Merke dir kurze Zahlenfolgen und gib sie in der richtigen Reihenfolge oder rückwärts ein.' },
        { moduleId: 'wortanalogien', kicker: 'Verbales Denken', title: 'Wortanalogien', copy: 'Finde die passende Beziehung zwischen Begriffen und schließe die Analogie sauber ab.' }
      ]
    },
    {
      title: 'Aufmerksamkeit & Kontrolle',
      copy: 'Diese Übungen fordern schnelle Entscheidungen, konzentriertes Hinsehen und kontrolliertes Reagieren.',
      cards: [
        { moduleId: 'gonogo', kicker: 'Inhibition', title: 'Go / No-Go', copy: 'Drücke nur dann, wenn es passt, und halte rechtzeitig inne, wenn du nicht reagieren sollst.' },
        { moduleId: 'stroop', kicker: 'Aufmerksamkeit', title: 'Stroop', copy: 'Achte auf die aktuelle Regel und entscheide, ob die Farbe oder das Wort zählt.' },
        { moduleId: 'flanker', kicker: 'Selektive Aufmerksamkeit', title: 'Flanker', copy: 'Bestimme die Richtung des mittleren Pfeils und ignoriere die störenden Pfeile daneben.' },
        { moduleId: 'pqscan', kicker: 'Visuelle Selektion', title: 'P/Q-Scanner', copy: 'Markiere im dichten Buchstabenfeld nur den vorgegebenen Zielbuchstaben und trenne p und q sauber.' },
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
        { moduleId: 'figurenmatrix', kicker: 'Abstrakte Logik', title: 'Figurenmatrizen', copy: 'Ergänze die fehlende Figur in einer 3x3-Matrix über Regelkombinationen wie Rotation, Füllung oder Überlagerung.' },
        { moduleId: 'multitasking', kicker: 'Parallele Aufgaben', title: 'Multitasking', copy: 'Rechne weiter, während du gleichzeitig oben auf wechselnde Aufgaben reagieren musst.', accent: true }
      ]
    }
  ];

  window.TrainingAppCopy = {
    scoringUi: {
      noDataSummaryTitle: 'Dein Vergleichswert',
      noDataSummaryText: 'Dein persönlicher Vergleichswert entsteht nach und nach mit deinen nächsten Einheiten.',
      dashboardComparisonTitle: 'So wird verglichen',
      dashboardCurrentStateTitle: 'So wirkt dein aktueller Stand',
      dashboardDomainStatus: dashboardDomainStatus,
      analyticsDomainStatus: analyticsDomainStatus,
      resultInsightNote: 'Zur Orientierung im Training, nicht als medizinische Aussage.',
      reactionSpeedSummary: reactionSpeedSummary,
      reactionStabilitySummary: reactionStabilitySummary,
      reactionAccuracySummary: reactionAccuracySummary,
      memoryCapacitySummary: memoryCapacitySummary,
      memoryAccuracySummary: memoryAccuracySummary,
      memoryDropoffSummary: memoryDropoffSummary,
      progressSummary: progressSummary
    },
    interpretation: {
      headline: interpretationHeadline,
      fallbackStrength: 'Du bringst bereits eine brauchbare Basis mit, auf der sich gut weiter aufbauen lässt.',
      observation: interpretationObservation,
      trendBuilding: interpretationTrendBuilding,
      trendRecent: interpretationTrendRecent,
      recommendation: interpretationRecommendation
    },
    quickstart: {
      firstTimeReason: 'Gut geeignet, um in diesem Bereich erst einmal einen klaren Startwert aufzubauen.',
      longPauseReason: 'Passt gut, um diesen Bereich nach einer längeren Pause wieder aufzugreifen.',
      reasonTemplate: quickStartReasonTemplate,
      defaultReason: quickStartDefaultReason,
      generatedSummary: quickStartGeneratedSummary,
      emphasis: quickStartEmphasis,
      recommendation: quickStartRecommendation,
      previewCopy: quickStartPreviewCopy,
      previewHeading: quickStartPreviewHeading,
      historyHeading: 'Deine letzten Schnellblöcke',
      summaryHeading: 'Kurzer Rückblick',
      statDone: 'fertige Übungen',
      statDuration: 'Dauer des Blocks',
      statFocus: 'deutlichster Schwerpunkt',
      statNext: 'sinnvoller nächster Block',
      lastBlockAction: 'Passenden Folgeblock starten',
      lastBlockReview: 'Rückblick ansehen',
      activeTitle: 'Schnellblock läuft',
      activeContinue: 'Weiter mit dem Block',
      activeReplan: 'Neu zusammenstellen',
      floatingNext: 'Nächste Übung starten',
      floatingOpen: 'Aktuelle Übung öffnen',
      floatingView: 'Block ansehen',
      floatingRunningPractice: 'Übungsblock läuft',
      floatingRunningTest: 'Testblock läuft',
      previewDurationLabel: 'Geplante Dauer:'
    },
    dashboard: {
      quickCardSlots: dashboardQuickCardSlots,
      sectionDefs: dashboardSectionDefs,
      resultButtons: {
        newGame: '↻ Neues Spiel',
        export: '↓ Exportieren',
        replay: 'Nochmal starten',
        backToDashboard: 'Zum Dashboard'
      },
      resultPlaceholder: 'Hier erscheint nach der Übung eine kurze Einordnung.',
      statusReady: 'Bereit',
      statusNew: 'Neu',
      statusResume: 'Wieder aufnehmen',
      statusLastUsed: 'Zuletzt genutzt',
      noTrainingDataFocus: 'Du hast noch keine Trainingsdaten. Starte einfach mit einer Übung, dann erscheint hier dein Überblick.',
      loadedState: 'Dein Verlauf ist geladen.',
      quickCardText: dashboardQuickCardText,
      focusRecommendation: dashboardFocusRecommendation,
      lastTrained: dashboardLastTrained,
      storageReadWarning: 'Trainingsdaten konnten nicht vollständig gelesen werden. Der Verlauf wurde vorsichtshalber zurückgesetzt.',
      storageSaveWarning: 'Trainingsdaten konnten nicht gespeichert werden. Der Browser-Speicher ist wahrscheinlich voll.',
      deleteLogsConfirm: 'Alle Trainingsdaten wirklich löschen?\nDiese Aktion kann nicht rückgängig gemacht werden.'
    }
  };
})();