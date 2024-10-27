function SerializeIDSet(idSet) {
  return '[' + [...idSet].map((id) => {
    return g_enchantInfosByID.get(id).name
  }).toSorted(
  ).reduce((serialized, name, nameNr) => {
    return serialized + (nameNr == 0 ? '' : ',') + name
  }, '') + ']'
}


function SerializeIDSets(idSets) {
  return '[' + idSets.map((idSet) => {
    return SerializeIDSet(idSet)
  }).toSorted(
  ).reduce((serialized, nameSet, nameSetNr) => {
    return serialized + (nameSetNr == 0 ? '' : ',') + nameSet
  }, '') + ']'
}


function SerializeIDSetsList(idSetsList) {
  return '[' + idSetsList.map((idSets) => {
    return SerializeIDSets(idSets)
  }).toSorted(
  ).reduce((serialized, nameSets, nameSetsNr) => {
    return serialized + (nameSetsNr == 0 ? '' : ',') + nameSets
  }, '') + ']'
}


function TestConflictingSetsListsMatch(jazil, setsList1, setsList2) {
  serializedSetsList1 = SerializeIDSetsList(setsList1)
  serializedSetsList2 = SerializeIDSetsList(setsList2)
  jazil.ShouldBe(serializedSetsList1, serializedSetsList2, 'sets lists are not equal!')
}


jazil.AddTestSet(mainPage, 'EnchantConflicts', {
  'Internal testing function test': (jazil) => {
    let testIDSetsList = [
      [new Set([0]), new Set([4]), new Set([7])],
      [new Set([2]), new Set([1, 3]), new Set([6])],
      [new Set([5, 8]), new Set([9])]
    ]
    let serializedIDSetsList = '[[[Aqua Affinity,Thorns],[Sharpness]],[[Blast Protection,Fire Protection],[Feather Falling],[Respiration]],[[Depth Strider],[Projectile Protection],[Protection]]]'
    jazil.ShouldBe(SerializeIDSetsList(testIDSetsList), serializedIDSetsList)
  },

  'Conflicting ids conflict both ways': (jazil) => {
    let infinityID = g_enchantIDsByName.get('Infinity')
    let mendingID = g_enchantIDsByName.get('Mending')

    jazil.Assert(EnchantIDsConflict(mendingID, infinityID), 'Mending doesn\'t conflict with Inifity!')
    jazil.Assert(EnchantIDsConflict(infinityID, mendingID), 'Inifity doesn\'t conflict with Mending!')
  },

  'Conflicting ids conflict in all ways': (jazil) => {
    let baneID = g_enchantIDsByName.get('Bane of Arthropods')
    let sharpnessID = g_enchantIDsByName.get('Sharpness')
    let smiteID = g_enchantIDsByName.get('Smite')

    jazil.Assert(EnchantIDsConflict(sharpnessID, baneID), 'Sharpness doesn\'t conflict with Bane!')
    jazil.Assert(EnchantIDsConflict(baneID, sharpnessID), 'Bane doesn\'t conflict with Sharpness!')
    jazil.Assert(EnchantIDsConflict(smiteID, baneID), 'Smite doesn\'t conflict with Bane!')
    jazil.Assert(EnchantIDsConflict(baneID, smiteID), 'Bane doesn\'t conflict with Smite!')
    jazil.Assert(EnchantIDsConflict(sharpnessID, smiteID), 'Sharpness doesn\'t conflict with Smite!')
    jazil.Assert(EnchantIDsConflict(smiteID, sharpnessID), 'Smite doesn\'t conflict with Sharpness!')
  },

  'Non-conflicting ids don\'t conflict': (jazil) => {
    let mendingID = g_enchantIDsByName.get('Mending')
    let piercingID = g_enchantIDsByName.get('Piercing')

    jazil.Assert(!EnchantIDsConflict(piercingID, mendingID), 'Piercing conflicts with Mending!')
    jazil.Assert(!EnchantIDsConflict(mendingID, piercingID), 'Mending conflicts with Piercing!')
  },

  'Querying conflicting ids return correct list': (jazil) => {
    let ids = [
      g_enchantIDsByName.get('Protection'),
      g_enchantIDsByName.get('Fire Protection'),
      g_enchantIDsByName.get('Blast Protection'),
      g_enchantIDsByName.get('Projectile Protection')
    ]

    ids.forEach((id) => {
      let conflictingIDs = GetConflictingEnchantIDs(id)
      jazil.ShouldBe(conflictingIDs.size, ids.length - 1, `Incorrect number of conflicts returned for ${id}!`)

      ids.forEach((otherID) => {
        if (otherID != id)
          jazil.ShouldBe(conflictingIDs.has(otherID), true, `Incorrect id ${otherID} marked as conflicting for ${id}!`)
      })
    })
  },

  'Complex conflict schemes are represented OK': (jazil) => {
    let riptideID = g_enchantIDsByName.get('Riptide')
    let channelingID = g_enchantIDsByName.get('Channeling')
    let loyaltyID = g_enchantIDsByName.get('Loyalty')

    jazil.Assert(EnchantIDsConflict(riptideID, channelingID), 'Riptide and Channeling don\'t conflict!')
    jazil.Assert(EnchantIDsConflict(riptideID, loyaltyID), 'Riptide and Loyalty don\'t conflict!')
    jazil.Assert(!EnchantIDsConflict(channelingID, loyaltyID), 'Channeling and Loyalty conflict!')
  },

  'Filtering simple conflict sets list works OK': (jazil) => {
    let fireProtectionID = g_enchantIDsByName.get('Fire Protection')
    let projectileProtectionID = g_enchantIDsByName.get('Projectile Protection')
    let fortuneID = g_enchantIDsByName.get('Fortune')
    let smiteID = g_enchantIDsByName.get('Smite')
    let densityID = g_enchantIDsByName.get('Density')
    let breachID = g_enchantIDsByName.get('Breach')
    let ids = [
      // 1st sets
      fireProtectionID,
      projectileProtectionID,
      // will be skipped since it only results in a one-element set
      fortuneID,
      // 2nd sets
      smiteID,
      densityID,
      breachID
    ]

    let conflictingIDSetsList = GetConflictingEnchantIDSetsListForIDs(ids)
    let expectedIDSetsList = [
      [new Set([fireProtectionID]), new Set([projectileProtectionID])],
      [new Set([smiteID]), new Set([densityID]), new Set([breachID])]
    ]

    TestConflictingSetsListsMatch(jazil, conflictingIDSetsList, expectedIDSetsList)
  },

  'Returning complex conflict sets list works OK': (jazil) => {
    let riptideID = g_enchantIDsByName.get('Riptide')
    let channelingID = g_enchantIDsByName.get('Channeling')
    let loyaltyID = g_enchantIDsByName.get('Loyalty')
    let ids = [
      riptideID,
      channelingID,
      loyaltyID
    ]

    let conflictingIDSetsList = GetConflictingEnchantIDSetsListForIDs(ids)
    let expectedIDSetsList = [
      [new Set([riptideID]), new Set([channelingID, loyaltyID])]
    ]

    TestConflictingSetsListsMatch(jazil, conflictingIDSetsList, expectedIDSetsList)
  },

  'Filtering complex conflict sets list works OK': (jazil) => {
    let channelingID = g_enchantIDsByName.get('Channeling')
    let loyaltyID = g_enchantIDsByName.get('Loyalty')
    let ids = [
      channelingID,
      loyaltyID
    ]

    let conflictingIDSetsList = GetConflictingEnchantIDSetsListForIDs(ids)
    let expectedIDSetsList = [
    ]

    TestConflictingSetsListsMatch(jazil, conflictingIDSetsList, expectedIDSetsList)
  },

})
