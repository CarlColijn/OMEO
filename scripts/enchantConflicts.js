/*
  Enchant conflicts.

  Prerequisites:
  - enchantInfo.js

  Defined globals:
  - EnchantIDsConflict: whether 2 given enchants conflict
*/


// ======== PUBLIC ========


// returns bool
function EnchantIDsConflict(id1, id2) {
  return g_conflictingEnchantIDs.has(`${id1}~${id2}`)
}


// ======== PRIVATE ========


let g_conflictingEnchantIDs = new Set()


function RegisterConflictingEnchants(enchantNames) {
  for (let enchant1Nr = 0; enchant1Nr < enchantNames.length - 1; ++enchant1Nr) {
    let enchant1ID = g_enchantIDsByName.get(enchantNames[enchant1Nr])
    for (let enchant2Nr = enchant1Nr + 1; enchant2Nr < enchantNames.length; ++enchant2Nr) {
      let enchant2ID = g_enchantIDsByName.get(enchantNames[enchant2Nr])
      g_conflictingEnchantIDs.add(`${enchant1ID}~${enchant2ID}`)
      g_conflictingEnchantIDs.add(`${enchant2ID}~${enchant1ID}`)
    }
  }
}


RegisterConflictingEnchants(['Protection', 'Blast Protection', 'Fire Protection', 'Projectile Protection'])
RegisterConflictingEnchants(['Depth Strider', 'Frost Walker'])
RegisterConflictingEnchants(['Sharpness', 'Smite', 'Bane of Arthropods', 'Density', 'Breach'])
// Silk Touch & Fortune can be combined with commands
RegisterConflictingEnchants(['Silk Touch', 'Fortune'])
RegisterConflictingEnchants(['Infinity', 'Mending'])
RegisterConflictingEnchants(['Riptide', 'Loyalty'])
RegisterConflictingEnchants(['Riptide', 'Channeling'])
RegisterConflictingEnchants(['Multishot', 'Piercing'])
