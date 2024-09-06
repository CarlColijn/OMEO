/*
  Magic tweakable constants and settings.
*/


// ======== PUBLIC ========


// For combinedItemRow.js
const g_cirSettings = {
  sourceItemSuffix: ' (source nr. #)',
  extraItemSuffix: ' (extra)',
}

// For mainForm.js
const g_mfSettings = {
  webWorkerURLVersion: '2',
  feedbackIntervalMS: 100,
  numItemsPerGroup: 5,
  showHideSpeedMS: 400,
}

// For ratedItem.js
const g_riSettings = {
  enchantWeight: 50,
  unwantedCurseWeight: 10,
  priorWorkWeight: 1,
  totalCostWeight: 1/50,
}

// For recipeTable.js
const g_rtSettings = {
  resultLabel: 'Result',
  sourcePrefix: 'Source ',
  sourcePostfix: ' nr. #',
  extraPrefix: 'Extra ',
  desiredPrefix: 'Desired ',
  combinedPrefix: 'Combined ',
  noCost: '-',
  singleCost: '#s',
  compoundCost: '#s (#t in total)',
  expandCollapseSpeedMS: 100,
  expandGlyph: '&boxplus;',
  collapseGlyph: '&boxminus;',
}
