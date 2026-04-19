const { chromium } = require('playwright');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const repoRoot = path.resolve(__dirname, '..');
const htmlPath = path.join(repoRoot, 'PSY-Vorbereitung.html');
const appUrl = pathToFileURL(htmlPath).href;

const STANDARD_MODULE_FLOWS = [
  {
    name: 'math flow reaches result screen',
    dashboardCard: '#dash-card-math .btn',
    homeScreen: '#screen-math-home',
    startSelector: '#screen-math-home button[data-action="startMathExercise"]:has-text("Addition")',
    exerciseScreen: '#screen-math-exercise',
    finishSelector: '#screen-math-exercise button[data-action="finishMathExercise"]',
    resultScreen: '#screen-math-results',
    insightSelector: '#math-result-insight'
  },
  {
    name: 'spatial flow reaches result screen',
    dashboardCard: '#dash-card-spatial .btn',
    homeScreen: '#screen-spatial-home',
    startSelector: '#screen-spatial-home button[data-action="startSpatialExercise"]',
    exerciseScreen: '#screen-spatial-exercise',
    finishSelector: '#screen-spatial-exercise button[data-action="finishSpatialExercise"]',
    resultScreen: '#screen-spatial-results',
    insightSelector: '#spatial-result-insight'
  },
  {
    name: 'nback flow reaches result screen',
    dashboardCard: '#dash-card-nback .btn',
    homeScreen: '#screen-nback-home',
    startSelector: '#screen-nback-home button[data-action="startNbackExercise"]',
    exerciseScreen: '#screen-nback-exercise',
    finishSelector: '#screen-nback-exercise button[data-action="finishNbackExercise"]',
    resultScreen: '#screen-nback-results',
    insightSelector: '#nback-result-insight'
  },
  {
    name: 'go-no-go flow reaches result screen',
    dashboardCard: '#dash-card-gonogo .btn',
    homeScreen: '#screen-gonogo-home',
    startSelector: '#screen-gonogo-home button[data-action="startGoNoGoExercise"]',
    exerciseScreen: '#screen-gonogo-exercise',
    finishSelector: '#screen-gonogo-exercise button[data-action="finishGoNoGoExercise"]',
    resultScreen: '#screen-gonogo-results',
    insightSelector: '#gonogo-result-insight'
  },
  {
    name: 'stroop flow reaches result screen',
    dashboardCard: '#dash-card-stroop .btn',
    homeScreen: '#screen-stroop-home',
    startSelector: '#screen-stroop-home button[data-action="startStroopExercise"]',
    exerciseScreen: '#screen-stroop-exercise',
    finishSelector: '#screen-stroop-exercise button[data-action="finishStroopExercise"]',
    resultScreen: '#screen-stroop-results',
    insightSelector: '#stroop-result-insight'
  },
  {
    name: 'sequence flow reaches result screen',
    dashboardCard: '#dash-card-sequence .btn',
    homeScreen: '#screen-sequence-home',
    startSelector: '#screen-sequence-home button[data-action="startSequenceExercise"]',
    exerciseScreen: '#screen-sequence-exercise',
    finishSelector: '#screen-sequence-exercise button[data-action="finishSequenceExercise"]',
    resultScreen: '#screen-sequence-results',
    insightSelector: '#sequence-result-insight'
  },
  {
    name: 'rotation flow reaches result screen',
    dashboardCard: '#dash-card-rotation .btn',
    homeScreen: '#screen-rotation-home',
    startSelector: '#screen-rotation-home button[data-action="startRotationExercise"]',
    exerciseScreen: '#screen-rotation-exercise',
    finishSelector: '#screen-rotation-exercise button[data-action="finishRotationExercise"]',
    resultScreen: '#screen-rotation-results',
    insightSelector: '#rotation-result-insight'
  },
  {
    name: 'formen flow reaches result screen',
    dashboardCard: '#dash-card-formen .btn',
    homeScreen: '#screen-formen-home',
    startSelector: '#screen-formen-home button[data-action="startFormenExercise"]',
    exerciseScreen: '#screen-formen-exercise',
    finishSelector: '#screen-formen-exercise button[data-action="finishFormenExercise"]',
    resultScreen: '#screen-formen-results',
    insightSelector: '#formen-result-insight'
  },
  {
    name: 'concentration flow reaches result screen',
    dashboardCard: '#dash-card-concentration .btn',
    homeScreen: '#screen-concentration-home',
    startSelector: '#screen-concentration-home button[data-action="startConcentrationExercise"]',
    exerciseScreen: '#screen-concentration-exercise',
    finishSelector: '#screen-concentration-exercise button[data-action="finishConcentrationExercise"]',
    resultScreen: '#screen-concentration-results',
    insightSelector: '#concentration-result-insight'
  },
  {
    name: 'multitasking flow reaches result screen',
    dashboardCard: '#dash-card-multitasking .btn',
    homeScreen: '#screen-multitasking-home',
    startSelector: '#screen-multitasking-home button[data-action="startMultitaskingExercise"]',
    exerciseScreen: '#screen-multitasking-exercise',
    finishSelector: '#screen-multitasking-exercise button[data-action="finishMultitaskingExercise"]',
    resultScreen: '#screen-multitasking-results',
    insightSelector: '#multitask-result-insight'
  },
  {
    name: 'digit span flow reaches result screen',
    dashboardCard: '#dash-card-digitspan .btn',
    homeScreen: '#screen-digitspan-home',
    startSelector: '#screen-digitspan-home button[data-action="startDigitSpanExercise"]',
    exerciseScreen: '#screen-digitspan-exercise',
    finishSelector: '#screen-digitspan-exercise button[data-action="finishDigitSpanExercise"]',
    resultScreen: '#screen-digitspan-results',
    insightSelector: '#digitspan-result-insight'
  },
  {
    name: 'flanker flow reaches result screen',
    dashboardCard: '#dash-card-flanker .btn',
    homeScreen: '#screen-flanker-home',
    startSelector: '#screen-flanker-home button[data-action="startFlankerExercise"]',
    exerciseScreen: '#screen-flanker-exercise',
    finishSelector: '#screen-flanker-exercise button[data-action="finishFlankerExercise"]',
    resultScreen: '#screen-flanker-results',
    insightSelector: '#flanker-result-insight'
  },
  {
    name: 'visual search flow reaches result screen',
    dashboardCard: '#dash-card-visualsearch .btn',
    homeScreen: '#screen-visualsearch-home',
    startSelector: '#screen-visualsearch-home button[data-action="startVisualSearchExercise"]',
    exerciseScreen: '#screen-visualsearch-exercise',
    finishSelector: '#screen-visualsearch-exercise button[data-action="finishVisualSearchExercise"]',
    resultScreen: '#screen-visualsearch-results',
    insightSelector: '#visualsearch-result-insight'
  }
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function expectVisible(page, selector, label) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
  const visible = await page.isVisible(selector);
  assert(visible, `${label} is not visible`);
}

async function loadDashboard(page) {
  await page.goto(appUrl, { waitUntil: 'load' });
  await expectVisible(page, '#screen-dashboard', 'dashboard');
}

async function runStandardModuleFlow(page, flow) {
  await loadDashboard(page);
  await page.click(flow.dashboardCard);
  await expectVisible(page, flow.homeScreen, `${flow.name} home`);
  await page.click(flow.startSelector);
  await expectVisible(page, flow.exerciseScreen, `${flow.name} exercise`);
  await page.click(flow.finishSelector);
  await expectVisible(page, flow.resultScreen, `${flow.name} results`);
  await expectVisible(page, flow.insightSelector, `${flow.name} insight`);
  await page.click(`${flow.resultScreen} button:has-text("Zum Dashboard")`);
  await expectVisible(page, '#screen-dashboard', `${flow.name} dashboard return`);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const failures = [];

  async function test(name, fn) {
    try {
      await fn();
      console.log(`PASS ${name}`);
    } catch (error) {
      failures.push(`${name}: ${error.message}`);
      console.log(`FAIL ${name}: ${error.message}`);
    }
  }

  await test('dashboard renders', async () => {
    await loadDashboard(page);
    await expectVisible(page, '#screen-dashboard', 'dashboard');
    const quickCards = await page.locator('#dashboard-quick-cards .dashboard-quick-card').count();
    const dashboardCards = await page.locator('#dashboard-sections-root .dash-card').count();
    assert(quickCards === 3, `expected 3 quick cards, got ${quickCards}`);
    assert(dashboardCards === 14, `expected 14 dashboard cards, got ${dashboardCards}`);
  });

  await test('analytics shows non-clinical scoring panels', async () => {
    await loadDashboard(page);
    await expectVisible(page, '#dashboard-training-overview', 'dashboard training overview');
    await page.click('button[data-action="openAnalytics"]');
    await expectVisible(page, '#screen-analytics', 'analytics screen');
    await expectVisible(page, '#analytics-nonclinical-note', 'analytics non-clinical note');
    await expectVisible(page, '#analytics-scoreboard', 'analytics scoreboard');
  });

  await test('speed flow reaches result screen', async () => {
    await loadDashboard(page);
    await page.click('#dash-card-speed .btn');
    await expectVisible(page, '#screen-speed-home', 'speed home');
    await page.click('button[data-action="startExercise"]');
    await expectVisible(page, '#screen-exercise', 'speed exercise');
    await page.click('#btn-stopp');
    await expectVisible(page, '#screen-results', 'speed results');
    await expectVisible(page, '#res-insight', 'speed insight');
    await page.click('button:has-text("Neues Spiel")');
    await expectVisible(page, '#screen-speed-home', 'speed home after reset');
    await page.click('button:has-text("Zurück zum Dashboard")');
    await expectVisible(page, '#screen-dashboard', 'dashboard after speed');
  });

  await test('multitasking restart does not duplicate enter handler', async () => {
    await loadDashboard(page);
    await page.click('#dash-card-multitasking .btn');
    await expectVisible(page, '#screen-multitasking-home', 'multitasking home');
    await page.click('#screen-multitasking-home button[data-action="startMultitaskingExercise"]');
    await expectVisible(page, '#screen-multitasking-exercise', 'multitasking exercise first run');
    await page.click('#screen-multitasking-exercise button[data-action="openMultitaskHome"]');
    await expectVisible(page, '#screen-multitasking-home', 'multitasking home after leave');

    await page.evaluate(() => {
      window.__multitaskSubmitCalls = 0;
      const original = window.submitMultitaskingMathAnswer;
      window.submitMultitaskingMathAnswer = function(...args) {
        window.__multitaskSubmitCalls += 1;
        return original.apply(this, args);
      };
    });

    await page.click('#screen-multitasking-home button[data-action="startMultitaskingExercise"]');
    await expectVisible(page, '#screen-multitasking-exercise', 'multitasking exercise second run');
    await page.fill('#multitask-math-input', '0');
    await page.press('#multitask-math-input', 'Enter');

    const submitCalls = await page.evaluate(() => window.__multitaskSubmitCalls);
    assert(submitCalls === 1, `expected one Enter submission handler call, got ${submitCalls}`);
  });

  for (const flow of STANDARD_MODULE_FLOWS) {
    await test(flow.name, async () => {
      await runStandardModuleFlow(page, flow);
    });
  }

  await browser.close();

  if (failures.length) {
    console.error('\nFailures:');
    failures.forEach(failure => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log('\nAll smoke tests passed.');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});