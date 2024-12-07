/*
  Magic tweakable constants and settings.
*/


// ======== PUBLIC ========


// For mainForm.js
const g_mfSettings = {
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
  leftLabel: 'Left',
  rightLabel: 'Right',
  sourcePrefix: 'Source ',
  sourcePostfix: ' nr. #',
  extraPrefix: 'Extra ',
  desiredPrefix: 'Desired ',
  combinedPrefix: 'Combined ',
  noCost: '-',
  singleCost: '#s',
  compoundCost: '#s<br>#t&nbsp;total',
  expandCollapseSpeedMS: 200,
  expandGlyph: '&boxplus;',
  collapseGlyph: '&boxminus;',
}
