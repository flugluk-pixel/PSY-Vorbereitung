// Rendering helpers for the non-clinical training dashboard.
(function() {
  'use strict';

  const Norms = window.TrainingScoringNorms;
  const Metrics = window.TrainingScoringMetrics;
  const Copy = window.TrainingAppCopy || {};
  const ScoringCopy = Copy.scoringUi || {};

  function toneClass(score) {
    if (score >= 90) return 'good';
    if (score >= 60) return 'mid';
    return 'low';
  }

  function placeholder(message) {
    return '<div class="training-empty-state">' + message + '</div>';
  }

  function formatMilliseconds(value) {
    return value === null ? '—' : Metrics.round(value, 1) + ' ms';
  }

  function formatPercent(value) {
    return value === null ? '—' : Metrics.round(value, 1) + '%';
  }

  function formatPoints(value) {
    return value === null ? '—' : Metrics.round(value, 1) + ' Punkte';
  }

  function buildMetricLabel(title, helper) {
    return '<div class="training-metric-label"><strong>' + title + '</strong>'
      + (helper ? '<small>' + helper + '</small>' : '')
      + '</div>';
  }

  function describeReactionSpeed(meanReactionTimeMs) {
    return typeof ScoringCopy.reactionSpeedSummary === 'function'
      ? ScoringCopy.reactionSpeedSummary(meanReactionTimeMs)
      : 'Noch zu wenige saubere Reaktionen für eine belastbare Tempo-Einordnung.';
  }

  function describeReactionStability(coefficientOfVariation, standardDeviationMs) {
    return typeof ScoringCopy.reactionStabilitySummary === 'function'
      ? ScoringCopy.reactionStabilitySummary(coefficientOfVariation, standardDeviationMs)
      : 'Zur Gleichmäßigkeit liegen nur wenige Werte vor.';
  }

  function describeReactionAccuracy(reaction) {
    return typeof ScoringCopy.reactionAccuracySummary === 'function'
      ? ScoringCopy.reactionAccuracySummary(reaction)
      : 'Es liegen noch keine Fehler- oder Auslassungsdaten vor.';
  }

  function buildReactionProfileSummary(reaction) {
    if (!reaction) return '';
    return '<p class="training-metric-intro">'
      + describeReactionSpeed(reaction.meanReactionTimeMs) + ' '
      + describeReactionStability(reaction.coefficientOfVariation, reaction.standardDeviationMs) + ' '
      + describeReactionAccuracy(reaction)
      + '</p>';
  }

  function describeMemoryCapacity(memory) {
    return typeof ScoringCopy.memoryCapacitySummary === 'function'
      ? ScoringCopy.memoryCapacitySummary(memory)
      : 'Noch zu wenige Daten für eine belastbare Einordnung deiner Merkspanne.';
  }

  function describeMemoryAccuracy(memory) {
    return typeof ScoringCopy.memoryAccuracySummary === 'function'
      ? ScoringCopy.memoryAccuracySummary(memory)
      : 'Es liegen noch keine ausreichenden Trefferdaten vor.';
  }

  function describeMemoryDropoff(memory) {
    return typeof ScoringCopy.memoryDropoffSummary === 'function'
      ? ScoringCopy.memoryDropoffSummary(memory)
      : 'Wie stark die Leistung mit steigender Schwierigkeit abfällt, ist noch nicht klar erkennbar.';
  }

  function buildMemoryProfileSummary(memory) {
    if (!memory) return '';
    return '<p class="training-metric-intro">'
      + describeMemoryCapacity(memory) + ' '
      + describeMemoryAccuracy(memory) + ' '
      + describeMemoryDropoff(memory)
      + '</p>';
  }

  function buildProgressSummary(baseline, aggregate) {
    if (!baseline) return '';
    const text = typeof ScoringCopy.progressSummary === 'function'
      ? ScoringCopy.progressSummary(baseline.sampleCount >= Norms.MIN_BASELINE_SESSIONS, baseline.vsBaselinePct, aggregate && aggregate.trendLabel)
      : '';
    return '<p class="training-metric-intro">' + text + '</p>';
  }

  function renderDashboardPanels(model) {
    const kpiRoot = document.getElementById('dashboard-training-overview');
    const domainRoot = document.getElementById('dashboard-training-domains');
    const summaryRoot = document.getElementById('dashboard-training-summary');
    const noteRoot = document.getElementById('dashboard-training-note');
    if (!kpiRoot || !domainRoot || !summaryRoot || !noteRoot) return;

    noteRoot.textContent = model.nonClinicalNotice;

    if (!model.aggregate.latest) {
      kpiRoot.innerHTML = placeholder('Noch keine Trainingsdaten für eine belastbare Trainingsauswertung.');
      domainRoot.innerHTML = '';
      summaryRoot.innerHTML = '<div class="training-summary-block"><strong>' + (ScoringCopy.noDataSummaryTitle || 'Dein Vergleichswert') + '</strong><p>' + (ScoringCopy.noDataSummaryText || 'Dein persönlicher Vergleichswert entsteht nach und nach mit deinen nächsten Einheiten.') + '</p></div>';
      return;
    }

    kpiRoot.innerHTML = [
      '<div class="training-kpi-card" title="Ein zusammengefasster Überblick über deine aktuelle Trainingsleistung."><span>Trainingsscore</span><strong>' + model.aggregate.score + '</strong><small>' + model.aggregate.category.label + '</small></div>',
      '<div class="training-kpi-card" title="Zeigt, ob deine letzten Einheiten eher besser, schlechter oder stabil waren."><span>Trend</span><strong>' + model.aggregate.trendLabel + '</strong><small>' + (model.aggregate.trendDelta > 0 ? '+' : '') + model.aggregate.trendDelta + ' Punkte</small></div>',
      '<div class="training-kpi-card" title="So wurde deine zuletzt ausgewertete Einheit insgesamt eingeordnet."><span>Letzte Einheit</span><strong>' + model.aggregate.latest.scoreProfile.categoryLabel + '</strong><small>' + model.aggregate.latest.label + '</small></div>'
    ].join('');

    domainRoot.innerHTML = model.aggregate.componentAverages.map(function(component) {
      return '<div class="training-domain-card training-domain-card--' + toneClass(component.score) + '" title="Das ist ein einzelner Teilbereich deiner aktuellen Trainingsleistung."><div class="training-domain-head"><span>' + component.label + '</span><strong>' + component.score + '</strong></div><p>' + ((typeof ScoringCopy.dashboardDomainStatus === 'function' ? ScoringCopy.dashboardDomainStatus(component.score) : 'ist schon recht stabil')) + '</p></div>';
    }).join('');

    summaryRoot.innerHTML = '<div class="training-summary-block"><strong>' + (ScoringCopy.dashboardComparisonTitle || 'So wird verglichen') + '</strong><p>' + model.baselineMessage + '</p></div>'
      + '<div class="training-summary-block"><strong>' + (ScoringCopy.dashboardCurrentStateTitle || 'So wirkt dein aktueller Stand') + '</strong><p>' + model.aggregate.latest.interpretation.summary + '</p></div>';
  }

  function renderAnalyticsPanels(model) {
    const noteRoot = document.getElementById('analytics-nonclinical-note');
    const scoreboardRoot = document.getElementById('analytics-scoreboard');
    const domainRoot = document.getElementById('analytics-domain-grid');
    const interpretationRoot = document.getElementById('analytics-interpretation-panel');
    const detailRoot = document.getElementById('analytics-detail-grid');
    if (!noteRoot || !scoreboardRoot || !domainRoot || !interpretationRoot || !detailRoot) return;

    noteRoot.textContent = model.nonClinicalNotice;

    if (!model.latest) {
      scoreboardRoot.innerHTML = placeholder('Noch zu wenige Daten für eine verlässliche Verlaufsauswertung.');
      domainRoot.innerHTML = '';
      interpretationRoot.innerHTML = '';
      detailRoot.innerHTML = '';
      return;
    }

    const baseline = model.latest.scoreProfile.baseline;
    scoreboardRoot.innerHTML = [
      '<div class="analytics-score-card analytics-score-card--' + toneClass(model.aggregate.score) + '" title="Ein kompakter Gesamtüberblick über deine heutige oder zuletzt gewählte Leistung."><span>Gesamtbild heute</span><strong>' + model.aggregate.score + '</strong><small>' + model.aggregate.category.label + '</small></div>',
      '<div class="analytics-score-card" title="Hier siehst du, ob du gerade eher über oder unter deinem sonst üblichen Niveau liegst."><span>Vergleich mit deinem üblichen Niveau</span><strong>' + (baseline.vsBaselinePct === null ? '—' : (baseline.vsBaselinePct >= 0 ? '+' : '') + baseline.vsBaselinePct + '%') + '</strong><small>' + (baseline.sampleCount >= Norms.MIN_BASELINE_SESSIONS ? 'persönlicher Vergleich' : 'wird noch aufgebaut') + '</small></div>',
      '<div class="analytics-score-card" title="Vergleich mit deinen zuletzt gemessenen Einheiten."><span>Vergleich mit den letzten Einheiten</span><strong>' + (baseline.vsRecentPct === null ? '—' : (baseline.vsRecentPct >= 0 ? '+' : '') + baseline.vsRecentPct + '%') + '</strong><small>' + 'Verlauf aktuell: ' + model.aggregate.trendLabel + '</small></div>',
      '<div class="analytics-score-card" title="Zeigt, wie groß der Abstand zu deinem bisher besten Ergebnis ist."><span>Abstand zu deinem Bestwert</span><strong>' + (baseline.vsBestPct === null ? '—' : (baseline.vsBestPct >= 0 ? '+' : '') + baseline.vsBestPct + '%') + '</strong><small>' + (baseline.bestScore === null ? 'noch kein Bestwert' : baseline.bestScore + ' Punkte') + '</small></div>'
    ].join('');

    domainRoot.innerHTML = model.aggregate.componentAverages.map(function(component) {
      return '<div class="training-domain-card training-domain-card--' + toneClass(component.score) + '" title="Das ist ein einzelner Bereich deiner aktuellen Auswertung."><div class="training-domain-head"><span>' + component.label + '</span><strong>' + component.score + '</strong></div><p>' + ((typeof ScoringCopy.analyticsDomainStatus === 'function' ? ScoringCopy.analyticsDomainStatus(component.score) : 'wirkt schon recht stabil')) + '</p></div>';
    }).join('');

    interpretationRoot.innerHTML = '<div class="training-summary-block"><strong>Kurzfazit</strong><p>' + model.latest.interpretation.headline + '</p></div>'
      + '<div class="training-summary-block"><strong>Was aktuell gut läuft</strong><p>' + model.latest.interpretation.strengths.join(' ') + '</p></div>'
      + '<div class="training-summary-block"><strong>Was gerade auffällt</strong><p>' + model.latest.interpretation.observations.join(' ') + '</p></div>'
      + '<div class="training-summary-block"><strong>Entwicklung zuletzt</strong><p>' + model.latest.interpretation.trendText + '</p></div>'
      + '<div class="training-summary-block"><strong>Sinnvoller nächster Schritt</strong><p>' + model.latest.interpretation.recommendation + '</p></div>';

    const reaction = model.latest.reactionMetrics;
    const memory = model.latest.memoryMetrics;
    const metricCards = [];

    if (reaction) {
      metricCards.push('<div class="analytics-detail-card"><h3>Reaktionsprofil leicht erklärt</h3>'
        + buildReactionProfileSummary(reaction)
        + '<table class="training-metric-table">'
        + '<tr title="So lange hast du für deine üblichen, sauber auswertbaren Antworten gebraucht."><td>' + buildMetricLabel('Typische Reaktionszeit', 'Wie lange du meist bis zu einer Antwort brauchst') + '</td><td>' + formatMilliseconds(reaction.meanReactionTimeMs) + '</td></tr>'
        + '<tr title="Ein Mittelwert, der einzelne Ausreißer weniger stark mit einbezieht."><td>' + buildMetricLabel('Robuster Mittelwert', 'Der Wert, der Ausreißer weniger stark mitzählt') + '</td><td>' + formatMilliseconds(reaction.medianReactionTimeMs) + '</td></tr>'
        + '<tr title="Hier siehst du den Bereich zwischen deiner schnellsten und langsamsten sauberen Antwort."><td>' + buildMetricLabel('Schnellste bis langsamste Antwort', 'Zeigt die Spannweite deiner gültigen Reaktionen') + '</td><td>' + (reaction.minReactionTimeMs === null ? '—' : formatMilliseconds(reaction.minReactionTimeMs) + ' bis ' + formatMilliseconds(reaction.maxReactionTimeMs)) + '</td></tr>'
        + '<tr title="Das zeigt, wie stark deine Reaktionszeiten in dieser Einheit geschwankt haben."><td>' + buildMetricLabel('Schwankung in Millisekunden', 'Höher bedeutet: deine Reaktionen waren ungleichmäßiger') + '</td><td>' + formatMilliseconds(reaction.standardDeviationMs) + '</td></tr>'
        + '<tr title="Je niedriger dieser Wert ist, desto gleichmäßiger waren deine Reaktionen."><td>' + buildMetricLabel('Gleichmäßigkeit', 'Niedriger Prozentwert bedeutet: konstantere Reaktionen') + '</td><td>' + (reaction.coefficientOfVariation === null ? '—' : Metrics.round(reaction.coefficientOfVariation * 100, 1) + '%') + '</td></tr>'
        + '<tr title="So oft hast du zwar reagiert, aber nicht richtig."><td>' + buildMetricLabel('Fehlreaktionen', 'Wie oft du zwar reagiert hast, aber falsch') + '</td><td>' + reaction.errorRatePct + '%</td></tr>'
        + '<tr title="So oft kam keine rechtzeitige Antwort."><td>' + buildMetricLabel('Ausgelassene Antworten', 'Wie oft gar keine rechtzeitige Antwort kam') + '</td><td>' + reaction.omissionCount + ' (' + reaction.omissionRatePct + '%)</td></tr>'
        + '<tr title="Das sind sehr frühe Reaktionen, die oft eher geraten als sauber verarbeitet sind."><td>' + buildMetricLabel('Vorschnelle Reaktionen', 'Sehr frühe Antworten, oft eher geraten als sauber verarbeitet') + '</td><td>' + reaction.anticipationCount + ' (' + reaction.anticipationRatePct + '%)</td></tr>'
        + '<tr title="So viele Antworten konnten für die Tempo-Auswertung sinnvoll genutzt werden."><td>' + buildMetricLabel('Ausgewertete Antworten', 'So viele Antworten konnten für das Tempo wirklich herangezogen werden') + '</td><td>' + reaction.validTrials + ' / ' + reaction.totalTrials + '</td></tr>'
        + '</table></div>');
    }

    if (memory && (memory.highestCorrectSpan !== null || memory.totalTrials > 0)) {
      metricCards.push('<div class="analytics-detail-card"><h3>Gedächtnisprofil leicht erklärt</h3>'
        + buildMemoryProfileSummary(memory)
        + '<table class="training-metric-table">'
        + '<tr title="Die längste Folge, die du in dieser Einheit richtig behalten konntest."><td>' + buildMetricLabel('Längste richtig gemerkte Folge', 'Die längste Folge, die du in dieser Einheit korrekt behalten konntest') + '</td><td>' + (memory.highestCorrectSpan === null ? '—' : memory.highestCorrectSpan) + '</td></tr>'
        + '<tr title="Diese Länge war bei richtigen Antworten im Schnitt gut erreichbar."><td>' + buildMetricLabel('Typische richtige Folgenlänge', 'Zeigt, welche Länge bei korrekten Antworten meist erreichbar war') + '</td><td>' + (memory.averageCorrectSpan === null ? '—' : memory.averageCorrectSpan) + '</td></tr>'
        + '<tr title="So viele Gedächtnisaufgaben hast du insgesamt richtig gelöst."><td>' + buildMetricLabel('Richtige Antworten', 'Wie viele Gedächtnisaufgaben insgesamt korrekt gelöst wurden') + '</td><td>' + formatPercent(memory.accuracyPct) + '</td></tr>'
        + '<tr title="Das zeigt, wie stark es mit steigender Schwierigkeit schwerer wurde."><td>' + buildMetricLabel('Unterschied zwischen leicht und schwer', 'Höher bedeutet: mit steigender Schwierigkeit wurde es deutlich schwerer') + '</td><td>' + formatPercent(memory.dropoffPct) + '</td></tr>'
        + '</table></div>');
    }

    metricCards.push('<div class="analytics-detail-card"><h3>Verlauf leicht erklärt</h3>'
      + buildProgressSummary(baseline, model.aggregate)
      + '<table class="training-metric-table">'
      + '<tr title="Das ist deine bisher übliche Leistung über mehrere Einheiten hinweg."><td>' + buildMetricLabel('Dein persönlicher Durchschnitt', 'Das ist deine bisherige normale Leistung über mehrere Einheiten') + '</td><td>' + (baseline.sampleCount >= Norms.MIN_BASELINE_SESSIONS ? formatPoints(baseline.averageScore || 0) : 'wird aufgebaut') + '</td></tr>'
      + '<tr title="So sah dein Schnitt in den zuletzt gemessenen Einheiten aus."><td>' + buildMetricLabel('Deine letzten 7 Einheiten', 'Zeigt, wie du in der jüngeren Vergangenheit im Schnitt abgeschnitten hast') + '</td><td>' + formatPoints(baseline.recentAverageScore) + '</td></tr>'
      + '<tr title="Das ist der beste Wert, den du bisher erreicht hast."><td>' + buildMetricLabel('Dein bisher bester Wert', 'Der höchste Wert, den du bislang erreicht hast') + '</td><td>' + formatPoints(baseline.bestScore) + '</td></tr>'
      + '<tr title="Hier siehst du, ob deine Leistung zuletzt eher steigt, fällt oder stabil bleibt."><td>' + buildMetricLabel('Aktuelle Entwicklung', 'Beschreibt, ob deine Werte eher steigen, fallen oder stabil bleiben') + '</td><td>' + model.aggregate.trendLabel + '</td></tr>'
      + '</table></div>');

    detailRoot.innerHTML = metricCards.join('');
  }

  function renderResultInsight(el, evaluated) {
    if (!el || !evaluated) return;
    const tone = toneClass(evaluated.scoreProfile.overallScore);
    el.className = 'result-insight result-insight--' + tone;
    el.innerHTML = '<strong>' + evaluated.interpretation.headline + '</strong>'
      + '<div class="result-insight-subline">' + evaluated.interpretation.trendText + '</div>'
        + '<div class="result-insight-subline">' + evaluated.interpretation.recommendation + ' <span class="result-insight-note">' + (ScoringCopy.resultInsightNote || 'Zur Orientierung im Training, nicht als medizinische Aussage.') + '</span></div>';
  }

  window.TrainingScoringUI = {
    renderDashboardPanels: renderDashboardPanels,
    renderAnalyticsPanels: renderAnalyticsPanels,
    renderResultInsight: renderResultInsight
  };
})();