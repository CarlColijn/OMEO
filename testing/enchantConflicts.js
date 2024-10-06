jazil.AddTestSet(mainPage, 'EnchantConflicts', {
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

})
