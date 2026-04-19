// Rendering helpers for the non-clinical training dashboard.
(function() {
  'use strict';

  const Norms = window.TrainingScoringNorms;
  const Metrics = window.TrainingScoringMetrics;

  function toneClass(score) {
    if (score >= 90) return 'good';
    if (score >= 60) return 'mid';
    return 'low';
  }

  function placeholder(message) {
    return '<div class="training-empty-state">' + message + '</div>';
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
      summaryRoot.innerHTML = '<div class="training-summary-block"><strong>Baseline</strong><p>Die persönliche Baseline wird mit deinen nächsten Sessions aufgebaut.</p></div>';
      return;
    }

    kpiRoot.innerHTML = [
      '<div class="training-kpi-card" title="Gesamtscore als Trainings- und Orientierungswert, ohne klinischen Anspruch."><span>Trainingsscore</span><strong>' + model.aggregate.score + '</strong><small>' + model.aggregate.category.label + '</small></div>',
      '<div class="training-kpi-card" title="Vergleich der letzten sieben Sessions mit dem Block davor."><span>Trend</span><strong>' + model.aggregate.trendLabel + '</strong><small>' + (model.aggregate.trendDelta > 0 ? '+' : '') + model.aggregate.trendDelta + ' Punkte</small></div>',
      '<div class="training-kpi-card" title="Zuletzt bewertete Einheit im Verlauf."><span>Letzte Einheit</span><strong>' + model.aggregate.latest.scoreProfile.categoryLabel + '</strong><small>' + model.aggregate.latest.label + '</small></div>'
    ].join('');

    domainRoot.innerHTML = model.aggregate.componentAverages.map(function(component) {
      return '<div class="training-domain-card training-domain-card--' + toneClass(component.score) + '" title="Teilbereich des Trainingsscores."><div class="training-domain-head"><span>' + component.label + '</span><strong>' + component.score + '</strong></div><p>' + (component.score >= 80 ? 'aktuell stark' : component.score >= 60 ? 'solide Basis' : 'gerade ausbaufähig') + '</p></div>';
    }).join('');

    summaryRoot.innerHTML = '<div class="training-summary-block"><strong>Trainingslogik</strong><p>' + model.baselineMessage + '</p></div>'
      + '<div class="training-summary-block"><strong>Einordnung</strong><p>' + model.aggregate.latest.interpretation.summary + '</p></div>';
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
      '<div class="analytics-score-card analytics-score-card--' + toneClass(model.aggregate.score) + '" title="Gesamtscore aus Geschwindigkeit, Genauigkeit, Konstanz, Gedächtnis und Stabilität."><span>Gesamtscore</span><strong>' + model.aggregate.score + '</strong><small>' + model.aggregate.category.label + '</small></div>',
      '<div class="analytics-score-card" title="Heutiger oder zuletzt gewählter Wert im Vergleich zur persönlichen Baseline."><span>Zur Baseline</span><strong>' + (baseline.vsBaselinePct === null ? '—' : (baseline.vsBaselinePct >= 0 ? '+' : '') + baseline.vsBaselinePct + '%') + '</strong><small>' + (baseline.sampleCount >= Norms.MIN_BASELINE_SESSIONS ? 'personalisierter Vergleich' : 'Baseline im Aufbau') + '</small></div>',
      '<div class="analytics-score-card" title="Vergleich mit dem Schnitt der letzten sieben Sessions."><span>Letzte 7 Sessions</span><strong>' + (baseline.vsRecentPct === null ? '—' : (baseline.vsRecentPct >= 0 ? '+' : '') + baseline.vsRecentPct + '%') + '</strong><small>' + model.aggregate.trendLabel + '</small></div>',
      '<div class="analytics-score-card" title="Vergleich mit deinem bisherigen Bestwert."><span>Zum Bestwert</span><strong>' + (baseline.vsBestPct === null ? '—' : (baseline.vsBestPct >= 0 ? '+' : '') + baseline.vsBestPct + '%') + '</strong><small>' + (baseline.bestScore === null ? 'kein Bestwert' : baseline.bestScore + ' Punkte') + '</small></div>'
    ].join('');

    domainRoot.innerHTML = model.aggregate.componentAverages.map(function(component) {
      return '<div class="training-domain-card training-domain-card--' + toneClass(component.score) + '" title="Teilbereich der aktuellen Auswertung."><div class="training-domain-head"><span>' + component.label + '</span><strong>' + component.score + '</strong></div><p>' + (component.score >= 80 ? 'starker Bereich' : component.score >= 60 ? 'solide Grundlage' : 'aktuell anfälliger') + '</p></div>';
    }).join('');

    interpretationRoot.innerHTML = '<div class="training-summary-block"><strong>Hauptbewertung</strong><p>' + model.latest.interpretation.headline + '</p></div>'
      + '<div class="training-summary-block"><strong>Stärken</strong><p>' + model.latest.interpretation.strengths.join(' ') + '</p></div>'
      + '<div class="training-summary-block"><strong>Auffälligkeiten</strong><p>' + model.latest.interpretation.observations.join(' ') + '</p></div>'
      + '<div class="training-summary-block"><strong>Tagesform / Trend</strong><p>' + model.latest.interpretation.trendText + '</p></div>'
      + '<div class="training-summary-block"><strong>Kurze Empfehlung</strong><p>' + model.latest.interpretation.recommendation + '</p></div>';

    const reaction = model.latest.reactionMetrics;
    const memory = model.latest.memoryMetrics;
    const metricCards = [];

    if (reaction) {
      metricCards.push('<div class="analytics-detail-card"><h3>Reaktionsprofil</h3><table class="training-metric-table">'
        + '<tr title="Mittlere Reaktionszeit gültiger Reaktionen."><td>Mean</td><td>' + (reaction.meanReactionTimeMs === null ? '—' : reaction.meanReactionTimeMs + ' ms') + '</td></tr>'
        + '<tr title="Median robuster gegenüber Ausreißern."><td>Median</td><td>' + (reaction.medianReactionTimeMs === null ? '—' : reaction.medianReactionTimeMs + ' ms') + '</td></tr>'
        + '<tr title="Schnellste und langsamste gültige Reaktion."><td>Min / Max</td><td>' + (reaction.minReactionTimeMs === null ? '—' : reaction.minReactionTimeMs + ' / ' + reaction.maxReactionTimeMs + ' ms') + '</td></tr>'
        + '<tr title="Standardabweichung als Maß für Streuung und Stabilität."><td>Streuung</td><td>' + (reaction.standardDeviationMs === null ? '—' : reaction.standardDeviationMs + ' ms') + '</td></tr>'
        + '<tr title="Relative Streuung im Verhältnis zum Mittelwert."><td>Variabilität</td><td>' + (reaction.coefficientOfVariation === null ? '—' : Metrics.round(reaction.coefficientOfVariation * 100, 1) + '%') + '</td></tr>'
        + '<tr title="Anteil nicht korrekter Antworten ohne Auslassungen."><td>Fehlerquote</td><td>' + reaction.errorRatePct + '%</td></tr>'
        + '<tr title="Keine Reaktion oder deutlich zu spät."><td>Auslassungen</td><td>' + reaction.omissionCount + ' (' + reaction.omissionRatePct + '%)</td></tr>'
        + '<tr title="Reaktionen unter 150 ms."><td>Antizipationen</td><td>' + reaction.anticipationCount + ' (' + reaction.anticipationRatePct + '%)</td></tr>'
        + '<tr title="Gültige Reaktionen im Bereich 150–1000 ms."><td>Gültige Trials</td><td>' + reaction.validTrials + ' / ' + reaction.totalTrials + '</td></tr>'
        + '</table></div>');
    }

    if (memory && (memory.highestCorrectSpan !== null || memory.totalTrials > 0)) {
      metricCards.push('<div class="analytics-detail-card"><h3>Gedächtnisprofil</h3><table class="training-metric-table">'
        + '<tr title="Höchste korrekt geschaffte Spannweite."><td>Beste Spanne</td><td>' + (memory.highestCorrectSpan === null ? '—' : memory.highestCorrectSpan) + '</td></tr>'
        + '<tr title="Durchschnittliche Länge korrekt gelöster Sequenzen."><td>Ø korrekt</td><td>' + (memory.averageCorrectSpan === null ? '—' : memory.averageCorrectSpan) + '</td></tr>'
        + '<tr title="Anteil korrekter Gedächtnisaufgaben."><td>Trefferquote</td><td>' + memory.accuracyPct + '%</td></tr>'
        + '<tr title="Abfall zwischen leichteren und schwierigeren Niveaus."><td>Leistungsabfall</td><td>' + (memory.dropoffPct === null ? '—' : memory.dropoffPct + '%') + '</td></tr>'
        + '</table></div>');
    }

    metricCards.push('<div class="analytics-detail-card"><h3>Verlauf</h3><table class="training-metric-table">'
      + '<tr title="Persönliche Baseline aus deinen bisherigen Sessions."><td>Baseline</td><td>' + (baseline.sampleCount >= Norms.MIN_BASELINE_SESSIONS ? Metrics.round(baseline.averageScore || 0, 1) + ' Punkte' : 'Baseline wird aufgebaut') + '</td></tr>'
      + '<tr title="Durchschnitt der letzten sieben Sessions."><td>Letzte 7</td><td>' + (baseline.recentAverageScore === null ? '—' : baseline.recentAverageScore + ' Punkte') + '</td></tr>'
      + '<tr title="Persönlicher Bestwert."><td>Bestwert</td><td>' + (baseline.bestScore === null ? '—' : baseline.bestScore + ' Punkte') + '</td></tr>'
      + '<tr title="Qualitative Verlaufseinordnung."><td>Trend</td><td>' + model.aggregate.trendLabel + '</td></tr>'
      + '</table></div>');

    detailRoot.innerHTML = metricCards.join('');
  }

  function renderResultInsight(el, evaluated) {
    if (!el || !evaluated) return;
    const tone = toneClass(evaluated.scoreProfile.overallScore);
    el.className = 'result-insight result-insight--' + tone;
    el.innerHTML = '<strong>' + evaluated.interpretation.headline + '</strong>'
      + '<div class="result-insight-subline">' + evaluated.interpretation.trendText + '</div>'
      + '<div class="result-insight-subline">' + evaluated.interpretation.recommendation + ' <span class="result-insight-note">Trainingsfeedback, keine Diagnostik.</span></div>';
  }

  window.TrainingScoringUI = {
    renderDashboardPanels: renderDashboardPanels,
    renderAnalyticsPanels: renderAnalyticsPanels,
    renderResultInsight: renderResultInsight
  };
})();