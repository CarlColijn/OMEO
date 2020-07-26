/*
  List of enchant conflicts.

  Prerequisites:
  - enchantDetails.js

  Defined globals:
  - g_enchantIDConflicts: map(char, char -> bool); indexes are the ids of the 2 enchants to check
*/


// mututally exclusive enchant groups
let g_enchantNameGroups = [
  // Java: protection conflict dropped in 1.14
  // Bedrock: these are still conflicts there
  //['Blast protection', 'Fire protection', 'Projectile protection', 'Protection'],
  // chopping is not yet enabled
  ['Bane of arthropods', 'Sharpness', 'Smite', /*'Chopping'*/],
  ['Infinity', 'Mending'],
  ['Multishot', 'Piercing'],
  // Fortune & Silk touch can be combined with commands only
  ['Fortune', 'Silk touch'],
  ['Channeling', 'Loyalty'],
  ['Channeling', 'Riptide'],
  ['Depth strider', 'Frost walker']
]
let g_numEnchantNameGroups = g_enchantNameGroups.length


// start up the enchant compatibility lookup table to all falses
let g_enchantIDConflicts = {}
for (let enchantNr = 0; enchantNr < g_numEnchants; ++enchantNr) {
  let enchantID = g_enchantDetails[enchantNr].id
  g_enchantIDConflicts[enchantID] = {}
  for (otherEnchantNr = 0; otherEnchantNr < g_numEnchants; ++otherEnchantNr) {
    let otherEnchantID = g_enchantDetails[otherEnchantNr].id
    g_enchantIDConflicts[enchantID][otherEnchantID] = false
  }
}

// and fill it in correctly
for (let groupNr = 0; groupNr < g_numEnchantNameGroups; ++groupNr) {
  let nameGroup = g_enchantNameGroups[groupNr]
  for (let enchant1GroupNr = 0; enchant1GroupNr < nameGroup.length - 1; ++enchant1GroupNr) {
    let enchant1ID = g_enchantIDsByName[nameGroup[enchant1GroupNr]]
    for (let enchant2GroupNr = enchant1GroupNr + 1; enchant2GroupNr < nameGroup.length; ++enchant2GroupNr) {
      let enchant2ID = g_enchantIDsByName[nameGroup[enchant2GroupNr]]
      g_enchantIDConflicts[enchant1ID][enchant2ID] = true
      g_enchantIDConflicts[enchant2ID][enchant1ID] = true
    }
  }
}
