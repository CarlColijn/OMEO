/*
  Enchant conflicts.

  Prerequisites:
  - enchantInfo.js

  Defined globals:
  - EnchantIDsConflict: whether 2 given enchants conflict
  - GetConflictingEnchantIDs: gets the IDs that conflict with a given ID
  - GetConflictingEnchantIDSetsListForIDs: gets the enchant conflict sets filtered for a given ID set
*/


// ======== PUBLIC ========


// returns bool
function EnchantIDsConflict(id1, id2) {
  conflictingIDs = g_conflictingEnchantIDsByID.get(id1)
  return (
    conflictingIDs !== undefined &&
    conflictingIDs.has(id2)
  )
}


// returns Set(int)
function GetConflictingEnchantIDs(id) {
  return g_conflictingEnchantIDsByID.get(id) ?? new Set()
}


// returns Array(Array(Set(int)))
function GetConflictingEnchantIDSetsListForIDs(relevantIDs) {
  let filteredIDSetsList = []
  g_conflictingEnchantIDSetsList.forEach((conflictingIDSets) => {
    let filteredIDSets = []
    conflictingIDSets.forEach((conflictingIDSet) => {
      // Note: prime candidate for conflictingIDSet.union when it's
      // matured enough...
      let filteredIDSet = new Set()
      relevantIDs.forEach((relevantID) => {
        if (conflictingIDSet.has(relevantID))
          filteredIDSet.add(relevantID)
      })

      if (filteredIDSet.size > 0)
        filteredIDSets.push(filteredIDSet)
    })

    if (filteredIDSets.length > 1)
      filteredIDSetsList.push(filteredIDSets)
  })

  return filteredIDSetsList
}


// ======== PRIVATE ========


let g_conflictingEnchantIDsByID = new Map()
let g_conflictingEnchantIDSetsList = new Array()


function RegisterConflictingEnchantIDs(id1, id2) {
  let ids = g_conflictingEnchantIDsByID.get(id1)
  if (ids === undefined) {
    ids = new Set()
    g_conflictingEnchantIDsByID.set(id1, ids)
  }
  ids.add(id2)
}


function RegisterConflictingEnchants(nameSetsList) {
  // Phase 1: name to ID
  g_conflictingEnchantIDSetsList = nameSetsList.map((nameSets) => {
    return nameSets.map((nameSet) => {
      return new Set(
        nameSet.map((name) => {
          return g_enchantIDsByName.get(name)
        })
      )
    })
  })

  // Phase 2: register the mutual id conflicts embedded within
  g_conflictingEnchantIDSetsList.forEach((idSets) => {
    idSets.forEach((idSet1) => {
      idSets.forEach((idSet2) => {
        if (idSet1 !== idSet2) {
          idSet1.forEach((id1) => {
            idSet2.forEach((id2) => {
              if (id1 != id2)
                RegisterConflictingEnchantIDs(id1, id2)
            })
          })
        }
      })
    })
  })
}


RegisterConflictingEnchants([
  [['Protection'], ['Blast Protection'], ['Fire Protection'], ['Projectile Protection']],
  [['Depth Strider'], ['Frost Walker']],
  [['Sharpness'], ['Smite'], ['Bane of Arthropods'], ['Density'], ['Breach']],
  // Silk Touch & Fortune can be combined with commands
  [['Silk Touch'], ['Fortune']],
  [['Infinity'], ['Mending']],
  [['Riptide'], ['Loyalty', 'Channeling']],
  [['Multishot'], ['Piercing']]
])
