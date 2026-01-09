/*
  Simple dialogs.

  Defined classes:
  - SimpleDialog
*/


// ======== PUBLIC ========


class SimpleDialog {
  constructor(dialogID, EscapeHandler) {
    this.dialogElem = document.getElementById(dialogID)
    this.dialogElem.style.display = 'flex'

    this.EventListenerInfos = []

    this.firstButtonAdded = false

    this.RegisterEventHandler(window, 'keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        this.ExitDialog(EscapeHandler)
      }
    })
  }


  // returns this for method chaining
  HookupButton(buttonSelector, ClickHandler) {
    let buttonElem = this.dialogElem.querySelector(buttonSelector)
    if (buttonElem !== null) {
      this.RegisterEventHandler(buttonElem, 'click', () => {
        this.ExitDialog(ClickHandler)
      })

      if (!this.firstButtonAdded) {
        buttonElem.focus()
        this.firstButtonAdded = true
      }
    }

    return this
  }


  // ======== PRIVATE ========


  ExitDialog(Handler) {
    this.EventListenerInfos.forEach((eventListenerInfo) => {
      eventListenerInfo.elem.removeEventListener(eventListenerInfo.name, eventListenerInfo.Handler)
    })

    this.dialogElem.style.display = 'none'

    if (Handler !== undefined)
      Handler()
  }


  RegisterEventHandler(elem, name, Handler) {
    elem.addEventListener(name, Handler)
    this.EventListenerInfos.push({
      elem: elem,
      name: name,
      Handler: Handler
    })
  }
}




/*
  Contact page javascript module.

  Prerequisites:
  - simpleDialog.js

  Defined classes:
  - RecipeFormHandler
*/


class ContactFormHandler {
  FeedbackSent() {
    new SimpleDialog('feedbackSent').HookupButton('.exit')
  }


  FeedbackFailure() {
    new SimpleDialog('feedbackFailure').HookupButton('.exit')
  }
}




/*
  Contact form (page I/O) management.

  Prerequisites:
  - none

  Defined classes:
  - ContactForm
*/


// ======== PUBLIC ========


class ContactForm {
  constructor(formHandler) {
    this.formHandler = formHandler

    window.addEventListener('load', () => {
      this.HookUpGUI()
    })
  }


  // ======== PRIVATE ========


  async OnSubmit(event) {
    event.preventDefault()

    let allOK = false

    const contactURL = 'https://www.twologs.com/omeo-contact.asp'

    try {
      let response = await fetch(contactURL, {
        method: "GET",
        mode: "cors"
      })
      if (response.ok) {
        let spamCheck = await response.text()
        spamCheck = spamCheck.trim()

        let message = this.messageElem.value

        response = await fetch(contactURL, {
          method: "POST",
          mode: "cors",
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          body: 'message=' + encodeURIComponent(message) + '&check=' + spamCheck
        })
        if (response.ok) {
          let status = await response.text()
          allOK = status.trim().toLowerCase() == 'ok'
        }
      }
    }
    catch {
    }

    if (allOK)
      this.formHandler.FeedbackSent()
    else
      this.formHandler.FeedbackFailure()
  }


  HookUpGUI() {
    this.formElem = document.getElementById('contactForm')
    this.messageElem = this.formElem.querySelector('textarea')

    this.formElem.addEventListener('submit', (event) => {
      this.OnSubmit(event)
    })
  }
}




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




/*
  Details on all possible enchants.

  prerequisites:
  - none

  Defined funtions:
  - GetRomanNumeralForLevel

  Defined classes:
  - EnchantInfo
    - id: char
    - maxLevel: int
    - bookMultiplier: int
    - toolMultiplier: int
    - name: string

  Defined globals:
  - g_enchantInfos: array(EnchantInfo)
  - g_numDifferentEnchants: int
  - g_enchantIDsByName: Map(string -> int)
  - g_enchantInfosByID: Map(int -> EnchantInfo)
  - g_numEnchantIDBits: int
*/


// ======== PUBLIC ========


let g_enchantIDsByName = new Map()
let g_enchantInfosByID = new Map()
let g_numDifferentEnchants = 0


// returns string
function GetRomanNumeralForLevel(level) {
  return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][level - 1]
}


// returns string[]
function GetRomanNumeralsUpToLevel(level) {
  return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'].slice(0, level)
}


class EnchantInfo {
  // returns one of the static EnchantInfo globals
  static GetRehydrated(info) {
    return g_enchantInfosByID.get(info.id)
  }


  constructor(id, maxLevel, bookMultiplier, toolMultiplier, isCurse, name) {
    // ==== PUBLIC ====
    this.id = id
    this.maxLevel = maxLevel
    this.bookMultiplier = bookMultiplier
    this.toolMultiplier = toolMultiplier
    this.isCurse = isCurse
    this.name = name

    // ==== PRIVATE ====
    g_enchantIDsByName.set(name, id)
    g_enchantInfosByID.set(id, this)
    ++g_numDifferentEnchants
  }
}


let g_enchantInfos = [
  new EnchantInfo( 0, 4, 1, 1, false, 'Protection'),
  new EnchantInfo( 1, 4, 1, 2, false, 'Fire Protection'),
  new EnchantInfo( 2, 4, 1, 2, false, 'Feather Falling'),
  new EnchantInfo( 3, 4, 2, 4, false, 'Blast Protection'),
  new EnchantInfo( 4, 4, 1, 2, false, 'Projectile Protection'),
  new EnchantInfo( 5, 3, 4, 8, false, 'Thorns'),
  new EnchantInfo( 6, 3, 2, 4, false, 'Respiration'),
  new EnchantInfo( 7, 3, 2, 4, false, 'Depth Strider'),
  new EnchantInfo( 8, 1, 2, 4, false, 'Aqua Affinity'),
  new EnchantInfo( 9, 5, 1, 1, false, 'Sharpness'),
  new EnchantInfo(10, 5, 1, 2, false, 'Smite'),
  new EnchantInfo(11, 5, 1, 2, false, 'Bane of Arthropods'),
  new EnchantInfo(12, 2, 1, 2, false, 'Knockback'),
  new EnchantInfo(13, 2, 2, 4, false, 'Fire Aspect'),
  new EnchantInfo(14, 3, 2, 4, false, 'Looting'),
  new EnchantInfo(15, 5, 1, 1, false, 'Efficiency'),
  new EnchantInfo(16, 1, 4, 8, false, 'Silk Touch'),
  new EnchantInfo(17, 3, 1, 2, false, 'Unbreaking'),
  new EnchantInfo(18, 3, 2, 4, false, 'Fortune'),
  new EnchantInfo(19, 5, 1, 1, false, 'Power'),
  new EnchantInfo(20, 2, 2, 4, false, 'Punch'),
  new EnchantInfo(21, 1, 2, 4, false, 'Flame'),
  new EnchantInfo(22, 1, 4, 8, false, 'Infinity'),
  new EnchantInfo(23, 3, 2, 4, false, 'Luck of the Sea'),
  new EnchantInfo(24, 3, 2, 4, false, 'Lure'),
  new EnchantInfo(25, 2, 2, 4, false, 'Frost Walker'),
  new EnchantInfo(26, 1, 2, 4, false, 'Mending'),
  new EnchantInfo(27, 1, 4, 8, true,  'Curse of Binding'),
  new EnchantInfo(28, 1, 4, 8, true,  'Curse of Vanishing'),
  // Bedrock: Impaling multipliers are 1 & 2 instead of 2 & 4
  new EnchantInfo(29, 5, 2, 4, false, 'Impaling'),
  new EnchantInfo(30, 3, 2, 4, false, 'Riptide'),
  new EnchantInfo(31, 3, 1, 2, false, 'Loyalty'),
  new EnchantInfo(32, 1, 4, 8, false, 'Channeling'),
  new EnchantInfo(33, 1, 2, 4, false, 'Multishot'),
  new EnchantInfo(34, 4, 1, 1, false, 'Piercing'),
  new EnchantInfo(35, 3, 1, 2, false, 'Quick Charge'),
  new EnchantInfo(36, 3, 4, 8, false, 'Soul Speed'),
  new EnchantInfo(37, 3, 4, 8, false, 'Swift Sneak'),
  // Bedrock: Sweeping Edge doesn't exist
  new EnchantInfo(38, 3, 2, 4, false, 'Sweeping Edge'),
  new EnchantInfo(39, 4, 2, 4, false, 'Breach'),
  new EnchantInfo(40, 5, 1, 2, false, 'Density'),
  new EnchantInfo(41, 3, 2, 4, false, 'Wind Burst'),
  new EnchantInfo(42, 3, 1, 2, false, 'Lunge')
].sort((a, b) => { return a.name < b.name ? -1 : a.name > b.name ? +1 : 0; })


let g_numEnchantIDBits = g_numDifferentEnchants.toString(2).length




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




/*
  Details on all possible item types.

  Prerequisites:
  - enchantInfo.js
  - enchantConflicts.js

  Defined classes:
  - ItemInfo
    - name: string
    - id: int
    - iconIndexNormal: int
    - iconIndexEnchanted: int
    - isBook: bool
    - allowedEnchantIDs: Set(int)
    - conflictingEnchantIDSetsList: Array(Array(Set(int)))
    - nonConflictingNormalEnchantIDs: Set(int)
    - nonConflictingCursedEnchantIDs: Set(int)
    - CanHaveEnchant(enchantID: int) -> bool

  Defined globals:
  - g_itemInfosByID: Map(int -> ItemInfo)
  - g_bookID: int
  - g_numDifferentItems: int
  - g_numItemIDBits: int
*/


// ======== PUBLIC ========


class ItemInfo {
  // returns one of the static ItemInfo globals
  static GetRehydrated(info) {
    return g_itemInfosByID.get(info.id)
  }


  constructor(id, name, iconIndexNormal, iconIndexEnchanted, enchantNames) {
    // ==== PUBLIC ====
    this.id = id
    this.iconIndexNormal = iconIndexNormal
    this.iconIndexEnchanted = iconIndexEnchanted
    this.isBook = name == 'Book'
    this.name = name
    this.GatherAllowedEnchantIDs(enchantNames)
    this.conflictingEnchantIDSetsList = GetConflictingEnchantIDSetsListForIDs(this.allowedEnchantIDs)
    this.GatherNonConflictingEnchantIDs()

    // ==== PRIVATE ====
    if (this.isBook)
      g_bookID = this.id
    g_itemInfosByID.set(id, this)
    ++g_numDifferentItems
  }


  // returns bool
  CanHaveEnchant(enchantID) {
    return this.allowedEnchantIDs.has(enchantID)
  }


  // ==== PRIVATE ====


  GatherAllowedEnchantIDs(enchantNames) {
    this.allowedEnchantIDs = new Set(
      this.isBook ?
      g_enchantInfos.map((enchantInfo) => { return enchantInfo.id }) :
      enchantNames.map((enchantName) => { return g_enchantIDsByName.get(enchantName) })
    )
  }


  GatherNonConflictingEnchantIDs() {
    this.nonConflictingNormalEnchantIDs = new Set()
    this.nonConflictingCursedEnchantIDs = new Set()

    return this.allowedEnchantIDs.forEach((id) => {
      let isNonConflictingID = this.conflictingEnchantIDSetsList.every((idSets) => {
        return idSets.every((idSet) => {
          return !idSet.has(id)
        })
      })

      if (isNonConflictingID) {
        if (g_enchantInfosByID.get(id).isCurse)
          this.nonConflictingCursedEnchantIDs.add(id)
        else
          this.nonConflictingNormalEnchantIDs.add(id)
      }
    })
  }
}


let g_itemInfosByID = new Map()


let g_numDifferentItems = 0
let g_bookID = -1
let g_itemInfos = [
  new ItemInfo(0, 'Book', 0,1, []),
  new ItemInfo(1, 'Axe', 2,2, ['Bane of Arthropods'/*, 'Chopping'*/, 'Curse of Vanishing','Efficiency', 'Fortune', 'Mending', 'Sharpness', 'Silk Touch', 'Smite', 'Unbreaking']),
  new ItemInfo(2, 'Shovel', 3,3, ['Curse of Vanishing','Efficiency','Fortune','Mending','Silk Touch','Unbreaking']),
  new ItemInfo(3, 'Pickaxe', 4,4, ['Curse of Vanishing','Efficiency','Fortune','Mending','Silk Touch','Unbreaking']),
  new ItemInfo(4, 'Hoe', 5,5, ['Curse of Vanishing','Efficiency','Fortune','Mending','Silk Touch','Unbreaking']),
  new ItemInfo(5, 'Fishing Rod', 6,6, ['Curse of Vanishing','Luck of the Sea','Lure','Mending','Unbreaking']),
  new ItemInfo(6, 'Flint & Steel', 7,7, ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(7, 'Shears', 8,8, ['Curse of Vanishing','Efficiency','Mending','Unbreaking']),
  new ItemInfo(8, 'Elytra', 9,9, ['Curse of Binding','Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(9, 'Bow', 10,10, ['Curse of Vanishing','Flame','Infinity','Mending','Power','Punch','Unbreaking']),
  new ItemInfo(10, 'Crossbow', 11,11, ['Curse of Vanishing','Mending','Multishot','Piercing','Quick Charge','Unbreaking']),
  new ItemInfo(11, 'Sword', 12,12, ['Bane of Arthropods','Curse of Vanishing','Fire Aspect','Knockback','Looting','Mending','Sharpness','Smite','Sweeping Edge','Unbreaking']),
  new ItemInfo(12, 'Trident', 13,13, ['Channeling','Curse of Vanishing','Impaling','Loyalty','Mending','Riptide','Unbreaking']),
  new ItemInfo(13, 'Boots', 14,14, ['Blast Protection','Curse of Binding','Curse of Vanishing','Depth Strider','Feather Falling','Fire Protection','Frost Walker','Mending','Projectile Protection','Protection','Soul Speed','Thorns','Unbreaking']),
  new ItemInfo(14, 'Leggings', 15,15, ['Blast Protection','Curse of Binding','Curse of Vanishing','Fire Protection','Mending','Projectile Protection','Protection','Swift Sneak','Thorns','Unbreaking']),
  new ItemInfo(15, 'Chestplate', 16,16, ['Blast Protection','Curse of Binding','Curse of Vanishing','Fire Protection','Mending','Projectile Protection','Protection','Thorns','Unbreaking']),
  new ItemInfo(16, 'Helmet', 17,17, ['Aqua Affinity','Blast Protection','Curse of Binding','Curse of Vanishing','Fire Protection','Mending','Projectile Protection','Protection','Respiration','Thorns','Unbreaking']),
  new ItemInfo(17, 'Turtle Shell', 18,18, ['Aqua Affinity','Blast Protection','Curse of Binding','Curse of Vanishing','Fire Protection','Mending','Projectile Protection','Protection','Respiration','Thorns','Unbreaking']),
  new ItemInfo(18, 'Shield', 19,19, ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(19, 'Carrot on a Stick', 20,20, ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(20, 'Warped Fungus on a Stick', 21,21, ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(21, 'Pumpkin', 22,22, ['Curse of Binding','Curse of Vanishing']),
  new ItemInfo(22, 'Head', 23,23, ['Curse of Binding','Curse of Vanishing']),
  new ItemInfo(23, 'Brush', 24,24, ['Curse of Vanishing','Mending','Unbreaking']),
  new ItemInfo(24, 'Mace', 25,25, ['Bane of Arthropods','Breach','Curse of Vanishing','Density','Fire Aspect','Mending','Smite','Unbreaking','Wind Burst']),
  new ItemInfo(25, 'Spear', 26,26, ['Bane of Arthropods','Curse of Vanishing','Fire Aspect','Knockback','Looting','Lunge','Mending','Sharpness','Smite','Unbreaking'])
].sort((a, b) => { return a.name < b.name ? -1 : a.name > b.name ? +1 : 0; })


let g_numItemIDBits = g_numDifferentItems.toString(2).length




/*
  Data sets.  Used to keep track of the data set of all objects (e.g. Item,
  ItemTable, Enchant etc.).  Just === compare anyone's set with one of the
  defined global main set types.

  Prerequisites:
  - none

  Defined classes:
  - DataSet
    - id: int
    - desc: char

  Defined globals:
  - g_source: source DataSet
  - g_desired: desired DataSet
  - g_combined: combined DataSet
  - g_extra: extra inserted DataSet
  - g_numDataSetIDBits: int
  - g_dataSetsByID: [DataSet]
*/


// ======== PUBLIC ========


class DataSet {
  // returns one of the predefined DataSet globals
  static GetRehydrated(set) {
    return g_dataSetsByID[set.id]
  }


  constructor(id, desc) {
    // ==== PUBLIC ====
    this.id = id
    this.desc = desc
  }
}


let g_source = new DataSet(0, 's');
let g_desired = new DataSet(1, 'd');
let g_combined = new DataSet(2, 'c');
let g_extra = new DataSet(3, 'e');


let g_numDataSetIDBits = 2


let g_dataSetsByID = [
  g_source,
  g_desired,
  g_combined,
  g_extra
]




/*
  Trackers for item ancestry, used to prevent duplicate item use conflicts.
  ZeroOrigin is a convenient starting point for creating true ItemOrigins.

  Prerequisites:
  - item.js

  Defined classes:
  - ZeroOrigin
    used as a fast initial base for creating ItemOrigins
  - ItemOrigin
    keeps track of the origins of each item
*/


// ======== PUBLIC ========
class ZeroOrigin {
  static Rehydrate(origin) {
    Object.setPrototypeOf(origin, ZeroOrigin.prototype);
  }


  constructor(items) {
    // ==== PRIVATE ====
    let numItems = items.length

    this.maxUses = new Array(numItems)
    this.itemUses = new Array(numItems)

    for (let itemNr = 0; itemNr < numItems; ++itemNr) {
      let item = items[itemNr]
      this.maxUses[itemNr] = item.count
      this.itemUses[itemNr] = 0
    }
  }


  // returns ItemOrigin
  CreateOrigin(itemNr) {
    return new ItemOrigin(this, itemNr)
  }
}




class ItemOrigin {
  static Rehydrate(origin) {
    Object.setPrototypeOf(origin, ItemOrigin.prototype);
  }


  constructor(otherOrigin, itemNr) {
    this.maxUses = otherOrigin.maxUses // noone is modifying it; by ref is fine
    this.itemUses = otherOrigin.itemUses.slice()

    if (itemNr !== undefined) {
      if (itemNr >= this.itemUses.length)
        throw 'Illegal item nr used for origin.'

      this.itemUses[itemNr] += 1
    }
  }


  Combine(otherOrigin) {
    let combinedOrigin = new ItemOrigin(this)

    for (let itemNr = 0; itemNr < this.itemUses.length; ++itemNr)
      combinedOrigin.itemUses[itemNr] += otherOrigin.itemUses[itemNr]

    return combinedOrigin
  }


  DetermineMaxCombineCount(otherOrigin) {
    let numCombines = 9e9 // should be enough

    for (let itemNr = 0; itemNr < this.itemUses.length; ++itemNr) {
      let combinedItemUses = this.itemUses[itemNr] + otherOrigin.itemUses[itemNr]
      if (combinedItemUses > 0) {
        let thisItemNumCombines = Math.trunc(this.maxUses[itemNr] / combinedItemUses)
        if (numCombines > thisItemNumCombines)
          numCombines = thisItemNumCombines
      }
    }

    return numCombines
  }


  IsSubsetOf(otherOrigin) {
    for (let itemNr = 0; itemNr < this.itemUses.length; ++itemNr)
      if (this.itemUses[itemNr] > otherOrigin.itemUses[itemNr])
        return false

    return true
  }
}




/*
  Single enchant.

  Prerequisites:
  - enchantInfo.js

  Defined classes:
  - Enchant
    - id: char
    - level: int
    - info: EnchantInfo
*/


// ======== PUBLIC ========


class Enchant {
  static Rehydrate(enchant) {
    Object.setPrototypeOf(enchant, Enchant.prototype);
    enchant.info = EnchantInfo.GetRehydrated(enchant.info)
  }


  constructor(id, level) {
    // ==== PUBLIC ====
    this.id = id
    this.level = level
    this.info = g_enchantInfosByID.get(id)
  }
}




/*
  Single item (source, desired, combined or extra).

  Prerequisites:
  - dataSets.js
  - enchant.js
  - enchantInfo.js
  - itemInfo.js

  Defined classes:
  - Item
    all items:
    - count: int
    - set: DataSet
    - id: int
    - info: ItemInfo
    - enchantsByID: Map(int -> Enchant)
    - priorWork: int
    - cost: int // this is excl. rename, to make costs comparable
    - totalCost: int
    source and desired items only:
    - nr: int
    combined items only:
    - targetItem: Item
    - sacrificeItem: Item
    - renamePoint: bool
    - includesRename: bool
    all items except desired items:
    - origin: effectively an array(bool)
*/


// ======== PUBLIC ========


function RehydrateItems(items) {
  items.forEach((item) => {
    Item.Rehydrate(item)
  })
}


class Item {
  static Rehydrate(item) {
    Object.setPrototypeOf(item, Item.prototype);
    item.set = DataSet.GetRehydrated(item.set)
    item.info = ItemInfo.GetRehydrated(item.info)
    item.enchantsByID.forEach((enchant) => {
      Enchant.Rehydrate(enchant)
    })
    if (item.origin !== undefined)
      ItemOrigin.Rehydrate(item.origin)
    if (item.targetItem !== undefined)
      Item.Rehydrate(item.targetItem)
    if (item.sacrificeItem !== undefined)
      Item.Rehydrate(item.sacrificeItem)
  }


  constructor(count, set, id, priorWork, cost=0, totalCost=0) {
    // ==== PUBLIC ====
    this.count = count
    this.set = set
    this.id = id
    this.info = g_itemInfosByID.get(id)
    this.enchantsByID = new Map()
    this.priorWork = priorWork
    this.cost = cost
    this.totalCost = totalCost
  }


  // returns Item
  // Only clones the items themselves (item + target/sacrifice);
  // all other properties are shalow copies.
  Clone() {
    let clone = new Item(
      this.count,
      this.set,
      this.id,
      this.priorWork,
      this.cost,
      this.totalCost
    )
    clone.enchantsByID = this.enchantsByID

    if (this.set === g_source || this.set === g_desired) {
      clone.nr = this.nr
    }
    else if (this.set === g_combined) {
      clone.renamePoint = this.renamePoint
      clone.includesRename = this.includesRename

      if (this.targetItem === undefined) {
        clone.targetItem = undefined
        clone.sacrificeItem = undefined
      }
      else {
        clone.targetItem = this.targetItem.Clone()
        clone.sacrificeItem = this.sacrificeItem.Clone()
      }
    }

    return clone
  }


  // returns Item[]
  CollapseTree() {
    let targetItems =
      this.targetItem === undefined ?
      [] :
      this.targetItem.CollapseTree()

    let sacrificeItems =
      this.sacrificeItem === undefined ?
      [] :
      this.sacrificeItem.CollapseTree()

    return [this, ...targetItems, ...sacrificeItems]
  }


  SetEnchant(enchant) {
    this.enchantsByID.set(enchant.info.id, enchant)
  }


  DropUnusedEnchants() {
    let enchantIDsToDrop = []

    this.enchantsByID.forEach((enchant, id) => {
      if (enchant.level == 0)
        enchantIDsToDrop.push(id)
    })

    enchantIDsToDrop.forEach((enchantID) => {
      this.enchantsByID.delete(enchantID)
    })
  }


  DropAllEnchants() {
    this.enchantsByID = new Map()
  }


  // returns Item[]
  SplitIntoParts(itemSet) {
    let parts = [new Item(1, itemSet, this.id, 0)]

    this.enchantsByID.forEach((enchant, id) => {
      if (enchant.level != 0) {
        let book = new Item(1, itemSet, g_bookID, 0)
        book.SetEnchant(enchant)
        parts.push(book)
      }
    })

    return parts
  }


  // returns string
  HashType() {
    return this.Hash(false, false, false)
  }


  // returns string
  HashTypeAndPriorWork() {
    return this.Hash(true, false, false, false)
  }


  // returns string
  HashTypeAndPriorWorkAndCost() {
    return this.Hash(true, true, false, false)
  }


  // returns string
  HashAll() {
    return this.Hash(true, true, true, true)
  }


  // returns string
  Hash(withPriorWork, withCost, withCountAndRenamePoint, withSet) {
    // note: no fancy stuff for now with bit fiddling, just a big 'ol string concat

    let allData = this.id

    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchant = this.enchantsByID.get(g_enchantInfos[enchantNr].id)
      if (enchant !== undefined)
        allData += `|${enchant.id}|${enchant.level}`
    }

    if (withPriorWork)
      allData += `|${this.priorWork}`

    if (withCost)
      allData += `|${this.cost}|${this.totalCost}`

    if (withCountAndRenamePoint)
      allData += `|${this.count}|${this.renamePoint === undefined ? '-' : this.renamePoint == true ? 'y' : 'n'}|${this.includesRename === undefined ? '-' : this.includesRename == true ? 'y' : 'n'}`

    if (withSet)
      allData += `|${this.set.id}`

    return allData
  }
}




/*
  Bit serializer to stream bits into a text string.
  Uses a modified base64 encoding that is URL safe.

  Prerequisites:
  - none

  Defined classes:
  - BitStorer
  - BitRestorer
*/


// ======== PRIVATE ========


const g_numBitsPerBatch = 6
// note: applying |0 creates real uint32s
const g_allZeroBits = 0|0
const g_allOneBits = 0x3f|0


const g_streamSerializationChars = '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'


// ======== PUBLIC ========


class BitStorer {
  constructor() {
    // ==== PRIVATE ====
    this.serialized = ''
    this.StartNewChar()
  }


  AddBits(bits, numBitsToGo) {
    while (numBitsToGo > 0) {
      let batchNumBits = Math.min(numBitsToGo, this.numBitsToStore)
      let upcomingNumBits = numBitsToGo - batchNumBits

      this.storedBits <<= batchNumBits
      let bitMask = g_allOneBits >>> (g_numBitsPerBatch - batchNumBits)
      this.storedBits |= (bits >>> upcomingNumBits) & bitMask

      numBitsToGo -= batchNumBits
      this.numBitsToStore -= batchNumBits
      if (this.numBitsToStore == 0) {
        this.serialized += g_streamSerializationChars[this.storedBits]
        this.StartNewChar()
      }
    }
  }


  // returns string (the final stream data)
  Finalize() {
    // flush out any remaining data by pushing enough 0 bits
    this.AddBits(g_allZeroBits, this.numBitsToStore)

    return this.serialized
  }


  // ======== PRIVATE ========


  StartNewChar() {
    this.storedBits = g_allZeroBits
    this.numBitsToStore = g_numBitsPerBatch
  }
}


class BitRestorer {
  constructor(serialized) {
    this.valid = true
    this.overflow = false

    // ==== PRIVATE ====
    this.serialized = serialized
    this.nextCharNr = 0
    this.numBitsToRestore = 0
  }


  // returns int
  GetBits(numBitsToGo) {
    let bits = g_allZeroBits
    while (numBitsToGo > 0) {
      if (this.numBitsToRestore == 0)
        this.LoadNextBits()

      let batchNumBits = Math.min(numBitsToGo, this.numBitsToRestore)
      let upcomingNumBits = this.numBitsToRestore - batchNumBits

      bits <<= batchNumBits
      let bitMask = g_allOneBits >>> (g_numBitsPerBatch - batchNumBits)
      bits |= (this.restoredBits >>> upcomingNumBits) & bitMask

      numBitsToGo -= batchNumBits
      this.numBitsToRestore -= batchNumBits
    }

    return bits
  }


  // ======== PRIVATE ========


  LoadNextBits() {
    if (this.nextCharNr >= this.serialized.length) {
      this.restoredBits = g_allZeroBits // past end of stream... just play along
      this.overflow = true
    }
    else {
      let nextChar = this.serialized[this.nextCharNr]
      ++this.nextCharNr
      let charNr = g_streamSerializationChars.indexOf(nextChar)
      if (charNr < 0) {
        charNr = 0
        this.valid = false
      }
      this.restoredBits = charNr|0
    }

    this.numBitsToRestore = g_numBitsPerBatch
  }
}




/*
  Data stream serializer/deserializer.
  Used to load from/save to the #serialized element for data persistence.

  Prerequisites:
  - bitSerializer.js

  Defined classes:
  - DataStreamLoadingOptions
    - inConflict: bool
    - serialized: string
  - DataStream
*/


// ======== PUBLIC ========


class DataStreamLoadingOptions {
  constructor() {
    // ==== PRIVATE ====
    this.localStorage = localStorage.getItem('form') || ''
    this.withLocalStorage = this.localStorage.length > 0

    let urlDataMatches = RegExp('[?&]form=([^&#]*)').exec(location.search)
    this.url = urlDataMatches ? urlDataMatches[1] : ''
    this.withURL = this.url.length > 0

    // ==== PUBLIC ====
    this.inConflict = false
    if (!this.withURL && !this.withLocalStorage)
      this.serialized = ''
    else if (this.withURL && !this.withLocalStorage)
      this.serialized = this.url
    else if (!this.withURL && this.withLocalStorage)
      this.serialized = this.localStorage
    else if (this.url == this.localStorage)
      this.serialized = this.url
    else {
      this.inConflict = true
      this.serialized = ''
    }
  }


  ChooseURL() {
    this.inConflict = false
    this.serialized = this.url
  }


  ChooseLocalStorage() {
    this.inConflict = false
    this.serialized = this.localStorage

    // We're in conflict but the user chose for localStorage, so get rid of
    // the bookmark part keeping the old link with the bookmark in the history.
    window.history.replaceState(null, '', location.href.replace(location.search, ''))
  }
}




class DataStream {
  constructor(storeMode) {
    // ==== PRIVATE ====
    if (storeMode)
      this.storer = new BitStorer()
  }


  AddSizedInt(intValue, numBits) {
    this.storer.AddBits(intValue, numBits)
  }


  AddCount(intValue) {
    let numBits = intValue.toString(2).length
    this.AddSizedInt(numBits, 5) // 5 bits is more than we ever need to count
    this.AddSizedInt(intValue, numBits)
  }


  AddBool(boolValue) {
    this.AddSizedInt(boolValue ? 1 : 0, 1)
  }


  // returns int
  GetSizedInt(numBits) {
    return this.restorer.GetBits(numBits)
  }


  // returns int
  GetCount() {
    let numBits = this.GetSizedInt(5)
    return this.GetSizedInt(numBits)
  }


  // returns bool
  GetBool() {
    return this.GetSizedInt(1) == 1
  }


  // returns bool
  RetrievalOK() {
    return (
      this.restorer.valid &&
      !this.restorer.overflow
    )
  }


  Load(dataStreamLoadingOptions) {
    this.restorer = new BitRestorer(dataStreamLoadingOptions.serialized)

    return dataStreamLoadingOptions.serialized.length > 0
  }


  GetData() {
    return this.storer.Finalize()
  }


  GetAsURL(url) {
    let urlBase = url.href.replace(url.search, '')
    let serialized = this.GetData()
    return `${urlBase}?form=${serialized}`
  }


  SaveToBookmarkLink() {
    let bookmarkLink = this.GetAsURL(location)
    let bookmarkElem = document.getElementById('bookmark')
    bookmarkElem.style.display = 'inline'
    let bookmarkLinkElem = bookmarkElem.querySelector('a')
    bookmarkLinkElem.setAttribute('href', bookmarkLink)
  }


  SaveToLocalStorage() {
    let serialized = this.storer.Finalize()
    localStorage.setItem('form', serialized)
  }
}




/*
  All data in the main form.

  Prerequisites:
  - dataSets.js
  - enchant.js
  - enchantInfo.js
  - item.js
  - itemInfo.js

  Defined classes:
  - MainFormData
    - desiredItem: Item
    - sourceItems: array(Item)
    - renameToo: bool
*/


// ======== PUBLIC ========


class MainFormData {
  constructor() {
    // ==== PUBLIC ====
    this.Reset()
  }


  AddSourceItem(item) {
    this.sourceItems.push(item)
  }


  AddSourceItems(items) {
    items.forEach((item) => {
      this.AddSourceItem(item)
    })
  }


  SetDesiredItem(item) {
    this.desiredItem = item
  }


  SetRenameToo(renameToo) {
    this.renameToo = renameToo
  }


  Serialize(stream) {
    stream.AddCount(1) // version nr

    stream.AddCount(this.sourceItems.length)
    this.sourceItems.forEach((sourceItem) => {
      this.SerializeItem(sourceItem, stream)
    })

    this.SerializeItem(this.desiredItem, stream)

    stream.AddBool(this.renameToo)
  }


  // returns bool (if the data was OK)
  Deserialize(stream) {
    this.Reset()

    let dataVersion = stream.GetCount()
    switch (dataVersion) {
      case 1:
        return this.DeserializeV1(stream)
    }

    // unknown version...
    return false
  }


  // ======== PRIVATE ========


  Reset() {
    this.sourceItems = []
    this.desiredItem = undefined
    this.renameToo = false
  }


  // returns bool (if the data was OK)
  DeserializeV1(stream) {
    let dataOK = true
    let numSources = stream.GetCount()
    for (let sourceNr = 1; sourceNr <= numSources; ++sourceNr) {
      let sourceItem = this.DeserializeItem(stream, g_source)
      if (sourceItem === undefined || !stream.RetrievalOK()) {
        dataOK = false
        break
      }
      this.sourceItems.push(sourceItem)
    }

    if (dataOK) {
      this.desiredItem = this.DeserializeItem(stream, g_desired)
      dataOK = this.desiredItem !== undefined
    }

    if (dataOK) {
      this.renameToo = stream.GetBool()
      dataOK = stream.RetrievalOK()
    }

    if (!dataOK)
      this.Reset()

    return dataOK
  }


  SerializeEnchants(enchantsByID, stream) {
    let numEnchants = enchantsByID.size
    stream.AddCount(numEnchants)
    enchantsByID.forEach((enchant, id) => {
      stream.AddSizedInt(id, g_numEnchantIDBits)
      stream.AddSizedInt(enchant.level, 3)
    })
  }


  SerializeItem(item, stream) {
    stream.AddCount(item.count)
    stream.AddSizedInt(item.id, g_numItemIDBits)
    stream.AddSizedInt(item.priorWork, 3)
    this.SerializeEnchants(item.enchantsByID, stream)
  }


  // returns bool (whether the deserialization went OK)
  DeserializeEnchants(stream, item) {
    let numEnchants = stream.GetCount()
    for (let enchantNr = 0; enchantNr < numEnchants; ++enchantNr) {
      let enchant = new Enchant(
        stream.GetSizedInt(g_numEnchantIDBits),
        stream.GetSizedInt(3)
      )
      if (enchant.info === undefined || !stream.RetrievalOK())
        return false
      item.SetEnchant(enchant)
    }
    return true
  }


  // returns Item, or undefined on error
  DeserializeItem(stream, set) {
    let item = new Item(
      stream.GetCount(),
      set,
      stream.GetSizedInt(g_numItemIDBits),
      stream.GetSizedInt(3)
    )
    if (!this.DeserializeEnchants(stream, item))
      return undefined

    return (
      stream.RetrievalOK() ?
      item :
      undefined
    )
  }
}




/*
  All data on the recipe page.

  Prerequisites:
  - dataSets.js
  - enchant.js
  - enchantInfo.js
  - item.js
  - itemInfo.js

  Defined classes:
  - RecipeFormData
    - item: Item
*/


// ======== PUBLIC ========


class RecipeFormData {
  constructor() {
    // ==== PUBLIC ====
    this.Reset()
  }


  SetItem(item) {
    this.item = item
  }


  Serialize(stream) {
    stream.AddCount(1) // version nr

    this.SerializeItem(this.item, stream)
  }


  // returns bool (if the data was OK)
  Deserialize(stream) {
    this.Reset()

    let dataVersion = stream.GetCount()
    switch (dataVersion) {
      case 1:
        return this.DeserializeV1(stream)
    }

    // unknown version...
    return false
  }


  // ======== PRIVATE ========


  Reset() {
    this.item = undefined
  }


  // returns bool (if the data was OK)
  DeserializeV1(stream) {
    this.item = this.DeserializeItem(stream)
    return this.item !== undefined && stream.RetrievalOK()
  }


  SerializeEnchants(enchantsByID, stream) {
    let numEnchants = enchantsByID.size
    stream.AddCount(numEnchants)
    enchantsByID.forEach((enchant, id) => {
      stream.AddSizedInt(id, g_numEnchantIDBits)
      stream.AddSizedInt(enchant.level, 3)
    })
  }


  SerializeItem(item, stream) {
    stream.AddCount(item.count)
    stream.AddSizedInt(item.set.id, g_numDataSetIDBits)
    stream.AddSizedInt(item.id, g_numItemIDBits)
    stream.AddSizedInt(item.priorWork, 3)
    stream.AddCount(item.cost)
    stream.AddCount(item.totalCost)

    if (item.set === g_source)
      stream.AddCount(item.nr, 3)
    else if (item.set === g_combined)
      stream.AddBool(item.renamePoint)

    this.SerializeEnchants(item.enchantsByID, stream)

    let withChildren = item.targetItem !== undefined
    stream.AddBool(withChildren)
    if (withChildren) {
      this.SerializeItem(item.targetItem, stream)
      this.SerializeItem(item.sacrificeItem, stream)
    }
  }


  // returns bool (whether the deserialization went OK)
  DeserializeEnchants(stream, item) {
    let numEnchants = stream.GetCount()
    for (let enchantNr = 0; enchantNr < numEnchants; ++enchantNr) {
      let enchant = new Enchant(
        stream.GetSizedInt(g_numEnchantIDBits),
        stream.GetSizedInt(3)
      )
      if (enchant.info === undefined || !stream.RetrievalOK())
        return false
      item.SetEnchant(enchant)
    }
    return true
  }


  // returns Item, or undefined on error
  DeserializeItem(stream) {
    let item = new Item(
      stream.GetCount(),
      g_dataSetsByID[stream.GetSizedInt(g_numDataSetIDBits)],
      stream.GetSizedInt(g_numItemIDBits),
      stream.GetSizedInt(3),
      stream.GetCount(3),
      stream.GetCount(3)
    )
    if (item.set === g_source)
      item.nr = stream.GetCount(3)
    else if (item.set === g_combined)
      item.renamePoint = stream.GetBool()

    if (
      !this.DeserializeEnchants(stream, item) ||
      !stream.RetrievalOK()
    )
      return undefined

    let withChildren = stream.GetBool()
    if (withChildren) {
      item.targetItem = this.DeserializeItem(stream)
      if (item.targetItem === undefined)
        return undefined

      item.sacrificeItem = this.DeserializeItem(stream)
      if (item.sacrificeItem === undefined)
        return undefined
    }

    return item
  }
}




function SetIcon(iconElem, itemID, hasEnchants) {
  let itemInfo = g_itemInfosByID.get(itemID)
  let iconIndex = hasEnchants ? itemInfo.iconIndexEnchanted : itemInfo.iconIndexNormal
  iconElem.style.setProperty('--iconIndex', iconIndex)

  iconElem.querySelector('.glint').style.display = hasEnchants ? 'inline-block' : 'none'
}


function AnimateElementVisibility(elem, mustShow, displayStyle, speed, StartStopCallback) {
  let elemInfos = [{
    elem: elem,
    mustShow: mustShow,
    displayStyle: displayStyle
  }]
  AnimateElementsVisibility(elemInfos, speed, StartStopCallback)
}


// elemInfos = [ElemInfo], with ElemInfo: {
//   elem: DOM element
//   mustShow: bool
// }
function AnimateElementsVisibility(elemInfos, speed, StartStopCallback) {
  elemInfosToAnimate = elemInfos.filter((elemInfo) => {
    let isShown = elemInfo.elem.style.display != 'none'
    return isShown != elemInfo.mustShow
  })

  if (elemInfosToAnimate.length == 0)
    return

  if (StartStopCallback !== undefined)
    StartStopCallback(true)

  elemInfosToAnimate.forEach((elemInfo) => {
    elemInfo.elem.style.height = 'auto'
    elemInfo.elem.style.display = elemInfo.displayStyle
    elemInfo.elem.style.overflow = 'unset'
    let computedCSSHeight = document.defaultView.getComputedStyle(elemInfo.elem).height
    elemInfo.originalHeight = parseFloat(computedCSSHeight.replace('px', ''))

    elemInfo.elem.style.overflow = 'hidden'
    if (elemInfo.mustShow)
      elemInfo.elem.style.height = '0px'
  })

  let startTime = document.timeline.currentTime

  let Animate = (animationTime) => {
    let progress = (animationTime - startTime) / speed
    let animationDone = progress > 1.0

    if (animationDone) {
      elemInfosToAnimate.forEach((elemInfo) => {
        if (elemInfo.mustShow) {
          elemInfo.elem.style.height = 'auto'
          elemInfo.elem.style.overflow = 'unset'
          elemInfo.elem.style.opacity = 1.0
        }
        else
          elemInfo.elem.style.display = 'none'
      })

      if (StartStopCallback !== undefined)
        StartStopCallback(false)
    }
    else {
      progress = (Math.cos(progress * Math.PI) + 1.0) / 2.0
      elemInfosToAnimate.forEach((elemInfo) => {
        let animationProgress =
          elemInfo.mustShow ?
          (1.0 - progress) :
          progress
        elemInfo.elem.style.height = `${elemInfo.originalHeight * animationProgress}px`
        elemInfo.elem.style.opacity = animationProgress
      })
      window.requestAnimationFrame(Animate)
    }
  }

  Animate(startTime)
}




/*
  Set of wrappers for DOM template elements and derived
  real elements.

  Defined classes:
  - TemplateElement
  - RealElement
*/


// ======== PRIVATE ========


class DOMElement {
  constructor(elem) {
    // ==== PUBLIC ====
    this.elem = elem
  }


  IsReal() {
    return this.elem.dataset.real === '1'
  }
}


// ======== PUBLIC ========


class TemplateElement extends DOMElement {
  constructor(parentElem, elementClass) {
    super(parentElem.querySelector(`.template.${elementClass}`))

    this.elem.dataset.real = 0

    this.elementClass = elementClass
  }


  // returns the new DOM object
  CreateExtraElement() {
    let newElem = this.elem.cloneNode(true)
    this.elem.parentNode.insertBefore(newElem, this.elem)

    newElem.classList.remove('template')
    newElem.dataset.real = 1

    return newElem
  }


  // returns bool
  ElementsPresent() {
    return this.GetElements().length > 0
  }


  RemoveCreatedElements() {
    this.GetElements().forEach((element) => {
      element.remove()
    })
  }


  // ==== PRIVATE ====
  GetElements() {
    return this.elem.parentNode.querySelectorAll(`.${this.elementClass}[data-real="1"]`)
  }
}


class RealElement extends DOMElement {
  constructor(elem) {
    super(elem)
  }


  Remove() {
    this.elem.remove()
  }
}




/*
  Button strip GUI element management.

  Prerequisites:
  - none

  Defined classes:
  - ButtonStrip
*/


// ======== PUBLIC ========


class ButtonStrip {
  constructor(elem) {
    // ==== PRIVATE ====
    this.elem = elem
  }


  // note: options should be an array of any
  SetOptions(options, selectedOptionNr) {
    while (this.elem.hasChildNodes())
      this.elem.lastChild.remove()

    let buttonElems = document.createDocumentFragment()
    let maxOptionNr = options.length - 1
    for (let optionNr = 0; optionNr <= maxOptionNr; ++optionNr) {
      let option = options[optionNr]
      let buttonElem = this.CreateButtonElem(option, optionNr, maxOptionNr, selectedOptionNr)
      buttonElems.appendChild(buttonElem)
    }

    this.elem.appendChild(buttonElems)
  }


  // returns int
  // returns undefined when no selection is made
  GetSelectionNr() {
    let selectedButtonElem = this.elem.querySelector('.selectedButton')
    if (selectedButtonElem === null)
      return undefined

    let optionNr = parseInt(selectedButtonElem.value)
    if (isNaN(optionNr))
      return undefined

    return optionNr
  }


  SetSelectionNr(optionNr) {
    this.RemoveSelection()
    let buttonElemToSelect = this.elem.querySelector(`button[value="${optionNr}"]`)
    if (buttonElemToSelect === null)
      return

    buttonElemToSelect.classList.add('selectedButton')
  }


  // ==== PRIVATE ====


  RemoveSelection() {
    let allButtonElems = this.elem.querySelectorAll('button')
    allButtonElems.forEach((buttonElem) => {
      buttonElem.classList.remove('selectedButton')
    })
  }


  // returns a DOM element for the given option
  CreateButtonElem(option, optionNr, maxOptionNr, selectedOptionNr) {
    let buttonElem = document.createElement('button')

    buttonElem.setAttribute('type', 'button')

    buttonElem.value = optionNr

    buttonElem.classList.add('buttonBox')

    if (optionNr == 0 && optionNr == maxOptionNr)
      buttonElem.classList.add('onlyButton')
    else if (optionNr == 0)
      buttonElem.classList.add('firstButton')
    else if (optionNr == maxOptionNr)
      buttonElem.classList.add('lastButton')
    else
      buttonElem.classList.add('middleButton')

    if (optionNr === selectedOptionNr)
      buttonElem.classList.add('selectedButton')

    buttonElem.addEventListener('click', () => {
      this.RemoveSelection()
      buttonElem.classList.add('selectedButton')
    })

    let divElem = document.createElement('div')
    divElem.textContent = '' + option
    buttonElem.appendChild(divElem)

    return buttonElem
  }
}




/*
  Wrapper for a single row in an enchant table.

  Prerequisites:
  - templateElement.js
  - dataSets.js
  - enchant.js

  Defined classes:
  - EnchantRowTemplate
  - EnchantRow
*/


// ======== PUBLIC ========


class EnchantRowTemplate extends TemplateElement {
  constructor(parentElem, elementClass) {
    super(parentElem, elementClass)
  }


  // returns EnchantRow
  CreateNew(itemID, enchant, allRows, giveFocus, focusElemWhenAllGone, ChangeEnchantCallback) {
    let newRowElem = super.CreateExtraElement()
    let newRow = new EnchantRow(newRowElem, itemID, enchant, allRows, focusElemWhenAllGone, ChangeEnchantCallback)

    if (giveFocus)
      newRow.idElem.focus()

    return newRow
  }
}




class EnchantRow extends RealElement {
  constructor(rowElem, itemID, enchant, allRows, focusElemWhenAllGone, ChangeEnchantCallback) {
    super(rowElem)

    // ==== PRIVATE ====
    this.allRows = allRows
    this.allRows.push(this)

    this.idElem = rowElem.querySelector('select[name="enchantID"]')
    this.levelElem = new ButtonStrip(rowElem.querySelector('.levelInput'))
    this.UpdateEnchantOptions(itemID)

    this.focusElemWhenAllGone = focusElemWhenAllGone
    this.HookUpGUI(itemID, ChangeEnchantCallback)

    this.SetEnchant(enchant)
  }


  // returns int
  GetEnchantID() {
    return this.enchantID
  }


  // returns Enchant
  GetEnchant() {
    let enchantInfo = g_enchantInfosByID.get(this.enchantID)
    let enchantLevel = this.GetEnchantLevel(enchantInfo)
    return new Enchant(this.enchantID, enchantLevel)
  }


  Remove() {
    let focusRowElem = this.elem.nextElementSibling
    if (focusRowElem === null || !new DOMElement(focusRowElem).IsReal())
      focusRowElem = this.elem.previousElementSibling

    let focusElem
    if (focusRowElem !== null && new DOMElement(focusRowElem).IsReal())
      focusElem = focusRowElem.querySelector('button[name="removeEnchant"]')
    else
      focusElem = this.focusElemWhenAllGone

    if (focusElem)
      focusElem.focus()

    let ourRowNr = this.allRows.indexOf(this)
    if (ourRowNr != -1)
      this.allRows.splice(ourRowNr, 1)

    this.SendIDChange()

    super.Remove()
  }


  // ======== PRIVATE ========


  SetEnchant(enchant) {
    if (enchant === undefined) {
      this.enchantID = parseInt(this.idElem.value)
      enchant = this.GetEnchant()
    }
    else {
      this.enchantID = enchant.id
      this.idElem.value = enchant.id
    }

    this.UpdateLevelOptions(enchant)

    this.SendIDChange()
  }


  SendIDChange() {
    this.allRows.forEach((otherRow) => {
      if (otherRow !== this)
        otherRow.EnchantChoicesChanged()
    })
  }


  HookUpGUI(itemID, ChangeEnchantCallback) {
    this.idElem.addEventListener('change', () => {
      this.enchantID = parseInt(this.idElem.value)
      let enchant = this.GetEnchant()

      this.UpdateLevelOptions(enchant)

      this.SendIDChange()

      ChangeEnchantCallback()
    })

    this.elem.querySelector('button[name="removeEnchant"]').addEventListener('click', () => {
      this.Remove()

      ChangeEnchantCallback()
    })
  }


  // returns Set(int)
  GetUnusableEnchantIDs() {
    let unusableEnchantIDs = new Set()

    this.allRows.forEach((otherRow) => {
      if (this !== otherRow) {
        unusableEnchantIDs.add(otherRow.enchantID)
        GetConflictingEnchantIDs(otherRow.enchantID).forEach((conflictingID) => {
          unusableEnchantIDs.add(conflictingID)
        })
      }
    })

    return unusableEnchantIDs
  }


  EnchantChoicesChanged() {
    let unusableEnchantIDs = this.GetUnusableEnchantIDs()

    this.idElem.querySelectorAll('option').forEach((optionElem) => {
      let enchantID = parseInt(optionElem.value)

      if (enchantID != this.enchantID) {
        if (unusableEnchantIDs.has(enchantID))
          optionElem.setAttribute('disabled', 'disabled')
        else
          optionElem.removeAttribute('disabled')
      }
    })
  }


  UpdateEnchantOptions(itemID) {
    this.idElem.querySelectorAll('option').forEach((optionElem) => {
      optionElem.remove()
    })

    let itemInfo = g_itemInfosByID.get(itemID)

    let unusableEnchantIDs = this.GetUnusableEnchantIDs()

    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchantInfo = g_enchantInfos[enchantNr]
      if (itemInfo.CanHaveEnchant(enchantInfo.id)) {
        let enchantUnusable = unusableEnchantIDs.has(enchantInfo.id)
        let optionElem = document.createElement('option')
        optionElem.value = enchantInfo.id
        optionElem.textContent = enchantInfo.name
        if (enchantUnusable)
          optionElem.setAttribute('disabled', 'disabled')
        this.idElem.appendChild(optionElem)
      }
    }
  }


  // returns int
  GetEnchantLevel(enchantInfo) {
    let selectLevelNr = this.levelElem.GetSelectionNr()
    if (selectLevelNr === undefined)
      selectLevelNr = 0
    return Math.max(1, Math.min(enchantInfo.maxLevel, selectLevelNr + 1))
  }


  UpdateLevelOptions(enchant) {
    let levelTexts = GetRomanNumeralsUpToLevel(enchant.info.maxLevel)

    this.levelElem.SetOptions(levelTexts, enchant.level - 1)
  }
}




/*
  Wrapper for a single row in a combined enchant table.

  Prerequisites:
  - templateElement.js
  - dataSets.js
  - enchant.js

  Defined classes:
  - CombinedEnchantRowTemplate
  - CombinedEnchantRow
*/


// ======== PUBLIC ========


class CombinedEnchantRowTemplate extends TemplateElement {
  constructor(parentElem, elementClass) {
    super(parentElem, elementClass)
  }


  // returns CombinedEnchantRow
  CreateNew(enchant) {
    let newRowElem = super.CreateExtraElement()

    return new CombinedEnchantRow(newRowElem, enchant)
  }
}


class CombinedEnchantRow extends RealElement {
  constructor(rowElem, enchant) {
    super(rowElem)

    this.elem.querySelector('.name').textContent = enchant.info.name
    this.elem.querySelector('.level').textContent = GetRomanNumeralForLevel(enchant.level)
  }
}




/*
  Section of enchant rows in desired and source item tables.

  Prerequisites:
  - enchantInfo.js
  - enchantRow.js

  Defined classes:
  - EnchantSection
*/


// ======== PUBLIC ========


class EnchantSection {
  constructor(item, addEnchantElem, parentElem, EnchantStateChangedHandler) {
    // ==== PRIVATE ====
    this.addEnchantElem = addEnchantElem
    this.EnchantStateChangedHandler = EnchantStateChangedHandler
    this.HookUpGUI()

    this.enchantRowTemplate = new EnchantRowTemplate(parentElem, 'enchant')
    this.enchantRows = []

    this.ChangeItem(item)
  }


  HasEnchants() {
    return this.enchantRows.length > 0
  }


  RemoveEnchants() {
    this.enchantRowTemplate.RemoveCreatedElements()
    this.enchantRows.splice(0, Infinity)

    this.UpdateGUIState(false, true)
  }


  SetEnchants(enchants) {
    this.enchantRowTemplate.RemoveCreatedElements()
    this.enchantRows.splice(0, Infinity)

    enchants.forEach((enchant) => {
      this.AddEnchant(enchant, false)
    })

    this.UpdateGUIState(enchants.length > 0, false)
  }


  ChangeItem(item) {
    this.RemoveEnchants()
    let hasEnchants = false

    this.itemID = item.id
    this.CacheUsableIDs(item.id)

    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchant = item.enchantsByID.get(g_enchantInfos[enchantNr].id)
      if (enchant !== undefined) {
        this.AddEnchant(enchant, false)
        hasEnchants = true
      }
    }

    this.UpdateGUIState(hasEnchants, false)
  }


  AddEnchantsToItem(item) {
    this.enchantRows.forEach((enchantRow) => {
      let enchant = enchantRow.GetEnchant()
      item.SetEnchant(enchant)
    })
  }


  // ======== PRIVATE ========


  HookUpGUI() {
    this.addEnchantElem.addEventListener('click', () => {
      this.AddEnchant(undefined, true)

      this.UpdateGUIState(true, false)
    })
  }


  AddEnchant(enchant, giveFocus) {
    let ChangeEnchantCallback = () => {
      let hasEnchants = this.enchantRowTemplate.ElementsPresent()
      this.UpdateGUIState(hasEnchants, false)
    }

    let enchantRow = this.enchantRowTemplate.CreateNew(this.itemID, enchant, this.enchantRows, giveFocus, this.addEnchantElem, ChangeEnchantCallback)
  }


  CacheUsableIDs(itemID) {
    this.usableIDs = new Set()

    if (itemID !== undefined) {
      let itemInfo = g_itemInfosByID.get(this.itemID)
      for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
        let enchantInfo = g_enchantInfos[enchantNr]
        if (itemInfo.CanHaveEnchant(enchantInfo.id))
          this.usableIDs.add(enchantInfo.id)
      }
    }
  }


  // returns bool
  CanCreateNew() {
    let remainingIDs = new Set(this.usableIDs)

    this.enchantRows.forEach((row) => {
      let enchantID = row.GetEnchantID()
      remainingIDs.delete(enchantID)

      GetConflictingEnchantIDs(enchantID).forEach((conflictingID) => {
        remainingIDs.delete(conflictingID)
      })
    })

    return remainingIDs.size > 0
  }


  UpdateGUIState(hasEnchants, forceToEnabled) {
    this.EnchantStateChangedHandler(hasEnchants)

    let mayAddEnchants =
      forceToEnabled ?
      true :
      this.CanCreateNew(this.enchantRows)

    this.addEnchantElem.disabled = !mayAddEnchants
  }
}




/*
  Wrapper for a single row in an item table.

  Prerequisites:
  - templateElement.js
  - dataSets.js
  - enchantSection.js
  - item.js
  - guiHelpers.js

  Defined classes:
  - SourceItemRowTemplate
  - SourceItemRow
    - nr: int
*/


// ======== PUBLIC ========


class SourceItemRowTemplate extends TemplateElement {
  constructor(parentElem, elementClass) {
    super(parentElem, elementClass)

    this.SetupItemOptions()
  }


  // returns SourceItemRow
  CreateNew(nr, item, allRows, giveFocus, focusElemWhenAllGone) {
    let newRowElem = super.CreateExtraElement()
    let newItemRow = new SourceItemRow(newRowElem, allRows)

    newItemRow.SetNumber(nr)

    item = newItemRow.EnsureAppropriateItemUsed(item)
    newItemRow.SetItem(item)

    newItemRow.HookUpGUI(item)

    newItemRow.focusElemWhenAllGone = focusElemWhenAllGone
    if (giveFocus)
      newItemRow.idElem.focus()

    return newItemRow
  }


  // ======== PRIVATE ========


  SetupItemOptions() {
    let itemSelectElem = this.elem.querySelector('select[name="itemID"]')
    for (let itemNr = 0; itemNr < g_numDifferentItems; ++itemNr) {
      let itemInfo = g_itemInfos[itemNr]
      let optionElem = document.createElement('option')
      optionElem.value = itemInfo.id
      optionElem.textContent = itemInfo.name
      itemSelectElem.appendChild(optionElem)
    }
  }
}




class SourceItemRow extends RealElement {
  constructor(rowElem, allRows) {
    super(rowElem)

    // ==== PUBLIC ====
    this.nr = -1 // to be filled in later

    // ==== PRIVATE ====
    this.nrElem = rowElem.querySelector('.nr')
    this.countElem = rowElem.querySelector('input[name="count"]')
    this.countErrorElem = rowElem.querySelector('.error')
    this.iconElem = rowElem.querySelector('.icon')
    this.idElem = rowElem.querySelector('select[name="itemID"]')
    this.priorWorkElem = new ButtonStrip(rowElem.querySelector('.priorWorkInput'))

    this.allRows = allRows

    let item = this.SyncCurrentItemWithoutEnchants()

    let addEnchantElem = this.elem.querySelector('button[name="addEnchant"]')
    let EnchantStateChangedHandler = (hasEnchants) => {
      this.EnchantStateChanged(hasEnchants)
    }
    this.enchantSection = new EnchantSection(item, addEnchantElem, this.elem, EnchantStateChangedHandler)
  }


  Remove() {
    let focusRowElem = this.elem.nextElementSibling
    if (focusRowElem === null || !new DOMElement(focusRowElem).IsReal())
      focusRowElem = this.elem.previousElementSibling

    let focusElem
    if (focusRowElem !== null && new DOMElement(focusRowElem).IsReal())
      focusElem = focusRowElem.querySelector('button[name="removeItem"]')
    else
      focusElem = this.focusElemWhenAllGone

    if (focusElem)
      focusElem.focus()

    this.enchantSection.RemoveEnchants()
    super.Remove()

    let nextRowNr = this.nr
    this.allRows.splice(nextRowNr - 1, 1)

    for (; nextRowNr <= this.allRows.length; ++nextRowNr)
      this.allRows[nextRowNr - 1].SetNumber(nextRowNr)
  }


  SetNumber(nr) {
    this.nr = nr
    this.elem.dataset.nr = nr
    this.nrElem.textContent = nr
  }


  SetCount(newCount) {
    this.countElem.value = newCount
    this.countErrorElem.style.display = 'none'
  }


  // returns object:
  // - item: Item
  // - withCountError: bool
  GetItem() {
    let count = parseInt(this.countElem.value)
    let withCountError = isNaN(count)
    let itemID = parseInt(this.idElem.value)
    let priorWork = this.priorWorkElem.GetSelectionNr()

    let item = new Item(withCountError ? 1 : count, g_source, itemID, priorWork)
    this.enchantSection.AddEnchantsToItem(item)

    item.nr = parseInt(this.elem.dataset.nr)

    return {
      item: item,
      withCountError: withCountError
    }
  }


  SetItem(item) {
    this.itemID = item.id

    this.SetCount(item.count)
    this.idElem.value = item.id
    this.SetupPriorWorkOptions()
    this.priorWorkElem.SetSelectionNr(item.priorWork)

    this.enchantSection.ChangeItem(item)
  }


  // ======== PRIVATE ========


  // returns Item
  SyncCurrentItemWithoutEnchants() {
    this.itemID = parseInt(this.idElem.value)
    return new Item(
      1,
      g_source,
      parseInt(this.itemID),
      0
    )
  }


  SetupPriorWorkOptions() {
    this.priorWorkElem.SetOptions([0,1,2,3,4,5,6], undefined)
  }


  // returns Item
  EnsureAppropriateItemUsed(item) {
    if (item === undefined) {
      item = new Item(
        1,
        g_source,
        parseInt(this.idElem.value),
        0
      )
    }

    return item
  }


  HookUpGUI(item) {
    this.elem.querySelector('button[name="removeItem"]').addEventListener('click', () => {
      this.Remove()
    })

    this.countElem.addEventListener('focusout', () => {
      let count = parseInt(this.countElem.value)
      if (isNaN(count))
        this.countErrorElem.style.display = 'block'
      else
        this.countErrorElem.style.display = 'none'
    })

    this.idElem.addEventListener('change', () => {
      let item = this.SyncCurrentItemWithoutEnchants()
      this.enchantSection.ChangeItem(item)
    })
  }


  EnchantStateChanged(hasEnchants) {
    SetIcon(this.iconElem, this.itemID, hasEnchants)
  }
}




/*
  Wrapper for a single row in a combined item table.

  Prerequisites:
  - settings.js
  - templateElement.js
  - enchantInfo.js
  - combinedEnchantRow.js
  - item.js
  - guiHelpers.js

  Defined classes:
  - CombinedItemRowTemplate
  - CombinedItemRow
*/


// ======== PUBLIC ========


class CombinedItemRowTemplate extends TemplateElement {
  constructor(parentElem, elementClass, ShowDetails) {
    super(parentElem, elementClass)

    // ==== PRIVATE ====
    this.ShowDetails = ShowDetails
  }


  // returns CombinedItemRow
  CreateNew(ratedItem) {
    let newRowElem = super.CreateExtraElement()
    let newItemRow = new CombinedItemRow(newRowElem, this.ShowDetails)

    let item = ratedItem.item
    newItemRow.SetItem(ratedItem)

    let hasEnchants = item.enchantsByID.size > 0
    let iconElem = newItemRow.elem.querySelector('.icon')
    SetIcon(iconElem, item.id, hasEnchants)

    if (hasEnchants)
      newItemRow.SetEnchants(item.enchantsByID)

    return newItemRow
  }
}




class CombinedItemRow extends RealElement {
  constructor(rowElem, ShowDetails) {
    super(rowElem)

    // ==== PRIVATE ====
    this.ShowDetails = ShowDetails

    this.enchantTemplateRow = new CombinedEnchantRowTemplate(this.elem, 'enchant')
  }


  // ======== PRIVATE ========


  SetItem(ratedItem) {
    let item = ratedItem.item

    this.elem.querySelector('.count').textContent = item.count
    this.elem.querySelector('.type').textContent = item.info.name
    this.elem.querySelector('.priorWork').textContent = item.priorWork
    this.elem.querySelector('.cost').textContent = item.totalCost + (item.includesRename ? 1 : 0)
    let showDetailsElem = this.elem.querySelector('[name=show]')
    if (item.set === g_source)
      showDetailsElem.style.display = 'none'
    else
      showDetailsElem.addEventListener('click', () => {
        this.ShowDetails(item)
      })
  }


  SetEnchants(enchantsByID) {
    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchant = enchantsByID.get(g_enchantInfos[enchantNr].id)
      if (enchant !== undefined)
        this.enchantTemplateRow.CreateNew(enchant)
    }
  }
}




/*
  Wrapper for a single row group in a combined item table.

  Prerequisites:
  - templateElement.js
  - combinedItemRow.js

  Defined classes:
  - CombinedItemGroupTemplate
  - CombinedItemGroup
*/


// ======== PUBLIC ========


class CombinedItemGroupTemplate extends TemplateElement {
  constructor(parentElem, elementClass, ShowDetails) {
    super(parentElem, elementClass)

    this.ShowDetails = ShowDetails
  }


  // returns CombinedItemGroup
  CreateNew(match) {
    let newTBodyElem = super.CreateExtraElement()
    let newItemGroup = new CombinedItemGroup(newTBodyElem, this.ShowDetails, match)

    return newItemGroup
  }
}




class CombinedItemGroup extends RealElement {
  constructor(tbodyElem, ShowDetails, match) {
    super(tbodyElem)

    this.SetHeading(match)

    this.itemTemplateRow = new CombinedItemRowTemplate(this.elem, 'item', ShowDetails)
  }


  // returns CombinedItemRow
  AddItem(ratedItem) {
    return this.itemTemplateRow.CreateNew(ratedItem)
  }


  // ======== PRIVATE ========


  GetHeadingClassForMatch(match) {
    switch (match) {
      case g_exactMatch:
        return '.descriptionExact'
      case g_betterMatch:
        return '.descriptionBetter'
      case g_lesserMatch:
        return '.descriptionLesser'
      case g_mixedMatch:
        return '.descriptionMixed'
    }
  }


  SetHeading(match) {
    let headingClass = this.GetHeadingClassForMatch(match)
    let headingElem = this.elem.querySelector(headingClass)
    headingElem.classList.remove('template')
  }
}




/*
  Wrapper for source item tables.

  Prerequisites:
  - dataSets.js
  - sourceItemRow.js
  - sourceItemCollector.js

  Defined classes:
  - SourceItemTable
    - tableElem: the main table's element
*/


// ======== PUBLIC ========


class SourceItemTable {
  constructor(tableElem, addItemElem) {
    // ==== PUBLIC ====
    this.tableElem = tableElem

    // ==== PRIVATE ====
    this.addItemElem = addItemElem
    addItemElem.addEventListener('click', () => {
      this.AddRow()
    })

    this.templateRow = new SourceItemRowTemplate(this.tableElem, 'item')
    this.rows = []
  }


  // returns ItemRow
  AddRow() {
    let newNr = this.rows.length + 1
    let newRow = this.templateRow.CreateNew(newNr, undefined, this.rows, true, this.addItemElem)
    this.rows.push(newRow)
    return newRow
  }


  SetItems(items) {
    this.Clear()

    items.forEach((item, itemNr) => {
      let newRow = this.templateRow.CreateNew(itemNr + 1, item, this.rows, false, this.addItemElem)
      this.rows.push(newRow)
    })
  }


  // returns bool
  HasItems() {
    return this.rows.length > 0
  }


  // returns Item[]
  GetItems() {
    return this.rows.map((row) => {
      return row.GetItem().item
    })
  }


  // returns SourceItemCollectionResult
  ExtractItems(itemCollector) {
    this.rows.forEach((row) => {
      itemCollector.ProcessRow(row)
    })

    let result = itemCollector.Finalize()

    if (result.mergedItems) {
      this.RemoveMergedRows(result)
      this.UpdateRowCounts(result)
    }

    return result
  }


  // ======== PRIVATE ========


  Clear() {
    this.templateRow.RemoveCreatedElements()
    this.rows.splice(0, Infinity)

    this.addItemElem.focus()
  }


  RemoveMergedRows(mergeResult) {
    mergeResult.rowsToRemove.forEach((row) => {
      row.Remove()
    })
  }


  UpdateRowCounts(mergeResult) {
    mergeResult.rowsToUpdateCount.forEach((row) => {
      let item = mergeResult.itemsByRow.get(row)
      row.SetCount(item.count)
    })
  }
}




/*
  Wrapper for a single row in an item table.

  Prerequisites:
  - dataSets.js
  - enchantInfo.js
  - enchantSection.js
  - item.js
  - guiHelpers.js

  Defined classes:
  - DesiredItemSection
*/


// ======== PUBLIC ========


class DesiredItemSection {
  constructor(sectionElem, AskMaySetMaxedDesiredEnchants) {
    // ==== PRIVATE ====
    this.elem = sectionElem
    this.iconElem = this.elem.querySelector('.icon')
    this.idElem = this.elem.querySelector('select[name="itemID"]')
    this.SetupItemOptions()
    this.HookUpGUI(AskMaySetMaxedDesiredEnchants)

    let item = this.SyncCurrentItemWithoutEnchants()

    let addEnchantElem = this.elem.querySelector('button[name="addEnchant"]')
    let EnchantStateChangedHandler = (hasEnchants) => {
      this.EnchantStateChanged(hasEnchants)
    }
    this.enchantSection = new EnchantSection(item, addEnchantElem, this.elem, EnchantStateChangedHandler)

    this.SetItem(item)
  }


  // returns Item
  GetItem() {
    let item = this.SyncCurrentItemWithoutEnchants()
    this.enchantSection.AddEnchantsToItem(item)
    return item
  }


  SetItem(item) {
    this.itemID = item.id
    this.idElem.value = item.id

    this.enchantSection.ChangeItem(item)
  }


  // ======== PRIVATE ========


  // returns Item
  SyncCurrentItemWithoutEnchants() {
    let id = parseInt(this.idElem.value)
    this.itemID = id
    return new Item(
      1,
      g_desired,
      id,
      0
    )
  }


  SetupItemOptions() {
    for (let itemNr = 0; itemNr < g_numDifferentItems; ++itemNr) {
      let itemInfo = g_itemInfos[itemNr]
      let optionElem = document.createElement('option')
      optionElem.setAttribute('value', itemInfo.id)
      optionElem.textContent = itemInfo.name
      this.idElem.appendChild(optionElem)
    }
  }


  SetMaxEnchants(nonConflictingIDs, chosenConflictingIDs) {
    let ids = [...nonConflictingIDs, ...chosenConflictingIDs]
    let idInfos = ids.map((id) => {
      return {
        id: id,
        info: g_enchantInfosByID.get(id)
      }
    })
    idInfos.sort((idInfo1, idInfo2) => {
      return (
        idInfo1.info.name < idInfo2.info.name ?
        -1 :
        idInfo1.info.name > idInfo2.info.name ?
        +1 :
        0
      )
    })
    let maxLevelEnchants = idInfos.map((idInfo) => {
      return new Enchant(idInfo.id, idInfo.info.maxLevel)
    })
    this.enchantSection.SetEnchants(maxLevelEnchants)
  }


  AddMaxEnchants(AskMaySetMaxedDesiredEnchants) {
    let item = this.SyncCurrentItemWithoutEnchants()

    let maxEnchantsCallbackInfo = {
      enchantsAlreadyPresent: this.enchantSection.HasEnchants(),
      hasConflictingEnchants: item.info.conflictingEnchantIDSetsList.length > 0,
      info: item.info,
      OnContinue: (maxEnchantsCallbackInfo, chosenConflictingIDs) => {
        this.SetMaxEnchants(maxEnchantsCallbackInfo.info.nonConflictingNormalEnchantIDs, chosenConflictingIDs)
      }
    }

    if (!maxEnchantsCallbackInfo.enchantsAlreadyPresent && !maxEnchantsCallbackInfo.hasConflictingEnchants)
      maxEnchantsCallbackInfo.OnContinue(maxEnchantsCallbackInfo, [])
    else
      AskMaySetMaxedDesiredEnchants(maxEnchantsCallbackInfo)
  }


  HookUpGUI(AskMaySetMaxedDesiredEnchants) {
    this.idElem.addEventListener('change', () => {
      let item = this.SyncCurrentItemWithoutEnchants()
      this.enchantSection.ChangeItem(item)
    })

    this.elem.querySelector('button[name="addMaxEnchants"]').addEventListener('click', () => {
      this.AddMaxEnchants(AskMaySetMaxedDesiredEnchants)
    })
  }


  EnchantStateChanged(hasEnchants) {
    SetIcon(this.iconElem, this.itemID, hasEnchants)
  }
}




/*
  Wrapper for combined item tables.

  Prerequisites:
  - combinedItemRow.js

  Defined classes:
  - CombinedItemTable
    - tableElem: the main table's element
*/


// ======== PUBLIC ========


class CombinedItemTable {
  constructor(tableElem, ShowDetails) {
    // ==== PUBLIC ====
    this.tableElem = tableElem

    // ==== PRIVATE ====
    this.ShowDetails = ShowDetails

    this.itemTemplateGroup = new CombinedItemGroupTemplate(this.tableElem, 'group', ShowDetails)
  }


  Clear() {
    this.itemTemplateGroup.RemoveCreatedElements()
  }


  SetRatedItemGroup(filteredCombinedItems, match) {
    let ratedItems = filteredCombinedItems.ratedItemsByMatch[match]
    if (ratedItems.length > 0) {
      let itemGroup = this.itemTemplateGroup.CreateNew(match)

      ratedItems.forEach((ratedItem) => {
        itemGroup.AddItem(ratedItem)
      })
    }
  }


  SetCombinedItems(filteredCombinedItems) {
    this.Clear()

    this.SetRatedItemGroup(filteredCombinedItems, g_exactMatch)
    this.SetRatedItemGroup(filteredCombinedItems, g_betterMatch)
    this.SetRatedItemGroup(filteredCombinedItems, g_mixedMatch)
    this.SetRatedItemGroup(filteredCombinedItems, g_lesserMatch)
  }
}




/*
  Collects Item-s from SourceItemRow-s, merging mergeable items/rows in the process if needed.

  Prerequisites:
  - item.js
  - sourceItemRow.js

  Defined classes:
  - SourceItemCollectionResult
    - withCountErrors: bool
    - items: Item[]
    - mergedItems: bool
    - rowsToUpdateNr: ItemRow[]
    - rowsToUpdateCount: ItemRow[]
    - rowsToRemove: ItemRow[]
    - itemsByRow: Map(ItemRow -> Item)
      if mergedItems, maps the ItemRow-s returned in rowsToUpdateCount,
      rowsToUpdateNr and rowsToRemove to their corresponding Item-s
      returned in items.
  - SourceItemCollector
*/


// ======== PUBLIC ========


class SourceItemCollectionResult {
  constructor() {
    // ==== PUBLIC ====
    this.withCountErrors = false
    this.items = []
    this.mergedItems = false
    this.rowsToUpdateNr = []
    this.rowsToUpdateCount = []
    this.rowsToRemove = []
    this.itemsByRow = new Map()
  }
}




class SourceItemCollector {
  constructor(mergeItems) {
    // ==== PRIVATE ====
    this.mergeItems = mergeItems
    this.rowDetailsByHash = new Map()
    this.rowItemsMappedForUpdateCount = new Set()
    this.nextRowNr = 1

    this.result = new SourceItemCollectionResult()
  }


  ProcessRow(itemRow) {
    let itemResult = itemRow.GetItem()
    if (itemResult.withCountError)
      this.result.withCountErrors = true

    let item = itemResult.item
    let itemHash = item.HashTypeAndPriorWork()

    item.nr = this.nextRowNr

    let rowNrUpdated = false
    if (itemRow.nr != this.nextRowNr) {
      itemRow.nr = this.nextRowNr
      rowNrUpdated = true
    }

    let mayMergeRow =
      this.mergeItems &&
      !this.result.withCountErrors

    let rowMerged = false
    if (mayMergeRow) {
      let prevRowDetails = this.rowDetailsByHash.get(itemHash)
      if (prevRowDetails !== undefined) {
        this.result.rowsToRemove.push(itemRow)
        this.result.itemsByRow.set(itemRow, item)

        prevRowDetails.item.count += item.count
        if (!this.rowItemsMappedForUpdateCount.has(prevRowDetails.row)) {
          this.result.rowsToUpdateCount.push(prevRowDetails.row)
          this.result.itemsByRow.set(prevRowDetails.row, prevRowDetails.item)
          this.rowItemsMappedForUpdateCount.add(prevRowDetails.row)
        }

        rowMerged = true
        this.result.mergedItems = true
      }
    }

    if (!rowMerged) {
      if (rowNrUpdated) {
        this.result.rowsToUpdateNr.push(itemRow)
        this.result.itemsByRow.set(itemRow, item)
      }

      this.result.items.push(item)
      this.rowDetailsByHash.set(itemHash, {
        'item': item,
        'row': itemRow
      })

      ++this.nextRowNr
    }
  }


  // return SourceItemCollectionResult
  Finalize() {
    return this.result
  }
}




/*
  Combines enchants from two items.

  Prerequisites:
  - enchantInfo.js
  - item.js

  Defined classes:
  - EnchantCombiner
    - isRelevant: bool
*/


// ======== PUBLIC ========


class EnchantCombiner {
  constructor(targetItem, sacrificeItem, enchantInfo) {
    // ==== PRIVATE ====
    this.enchantInfo = enchantInfo

    this.targetItem = targetItem
    this.targetEnchant = targetItem.enchantsByID.get(enchantInfo.id)
    this.onTarget = this.targetEnchant !== undefined

    this.sacrificeItem = sacrificeItem
    this.sacrificeEnchant = sacrificeItem.enchantsByID.get(enchantInfo.id)
    this.onSacrifice = this.sacrificeEnchant !== undefined

    this.targetLevel = this.onTarget ? this.targetEnchant.level : 0
    this.sacrificeLevel = this.onSacrifice ? this.sacrificeEnchant.level : 0

    // ==== PUBLIC ====
    this.isRelevant = this.targetLevel > 0 || this.sacrificeLevel > 0
  }


  // returns object;
  // - targetUsed: bool
  // - sacrificeUsed: bool
  // - combinedLevel: int
  // - cost: int
  Combine() {
    let combinedLevel
    let targetUsed
    let sacrificeUsed
    let costless
    if (!this.isRelevant) {
      combinedLevel = 0
      targetUsed = false
      sacrificeUsed = false
      costless = true
    }
    else if (this.targetLevel < this.sacrificeLevel) {
      combinedLevel = this.sacrificeLevel
      targetUsed = false
      sacrificeUsed = true
      costless = false
    }
    else if (this.targetLevel > this.sacrificeLevel) {
      combinedLevel = this.targetLevel
      targetUsed = true
      sacrificeUsed = false
      costless = this.sacrificeLevel == 0
    }
    else { // this.targetLevel == this.sacrificeLevel
      combinedLevel = Math.min(this.targetLevel + 1, this.enchantInfo.maxLevel)
      targetUsed = combinedLevel > this.targetLevel
      sacrificeUsed = targetUsed
      costless = false
    }

    // difference for Bedrock: for the cost, do not multiply with the final
    // level, but with the level increase on the target item instead
    return {
      targetUsed: targetUsed,
      sacrificeUsed: sacrificeUsed,
      combinedLevel: combinedLevel,
      cost: costless ? 0 : this.MultiplierForItem(this.sacrificeItem) * combinedLevel
    }
  }


  // ======== PRIVATE ========


  // returns int
  MultiplierForItem(item) {
    return (
      item.info.isBook ?
      this.enchantInfo.bookMultiplier :
      this.enchantInfo.toolMultiplier
    )
  }
}




/*
  Tracks lists and progress for combining items.

  Strategy: we process all items, combining them with all items that
  come before them.  New items are added at the back so that they
  in turn will automatically be picked up too in time.  The process
  stops out of itself once no new items can be added anymore, which
  should happen since at some point all low-level combinations have
  already been made and new combinations are just too costly due to
  the prior work penalty.
  To make the process more efficient, we want to be able to remove
  inferior items.  For that we keep track of 3 lists;
  - allItems: Item[]
    Contains all items, incl. source items.
  - allItemsByTypeHash: Map(string -> Item)
    Groups same-typed items together to enable quick retrieval for
    comparison on fitness.
  - itemListInfosByItem: Map(Item -> ItemListInfo)
    Stores extra list indexing information for each item, to make
    managing our internal lists more efficient.
  Each ItemListInfo in turn tracks three things;
  - index: int
    The index the item has in the allItems list.
  - typeHash: string
    The type hash of the item, and thus also the index the item has
    in the allItemsByTypeHash list.
  - derivedItems: [Item]
    All items that are derived from the item (whose targetItem or
    sacrificeItem is set to that item).

  Prerequisites:
  - item.js

  Defined classes:
  - ItemCombineList
*/


class ItemCombineList {
  constructor(sourceItems) {
    this.allItems = []
    this.allItemsByTypeHash = new Map()
    this.itemListInfosByItem = new Map()

    this.numSourceItems = sourceItems.length
    sourceItems.forEach((item) => {
      this.AddItem(item, item.HashType())
    })

    this.item1Nr = 0
    this.item2Nr = 0
  }


  // Returns if there are next items.
  // Items will have its .item1 and .item2 set to the items.
  GetNextItems(items) {
    if (this.item1Nr >= this.allItems.length)
      return false

    items.item1 = this.allItems[this.item1Nr]
    items.item2 = this.allItems[this.item2Nr]

    ++this.item2Nr
    if (this.item2Nr > this.item1Nr) {
      ++this.item1Nr
      this.item2Nr = 0
    }

    return true
  }


  ProcessItem(combinedItem, GradeCombinedItems) {
    // Optimization: if the new item is identical to something we already
    // have in both type and enchants, then we can dedupe these and toss
    // the one that:
    // - has the same or a superset of the same origins, and
    // - has the same or a higher priorWork, and
    // - has the same or higher totalCost
    // If not all conditions are met it's a toss-up which one will turn out
    // to be the better one, so we need to take both.

    if (combinedItem === undefined)
      // No item; nothing to do.
      return

    let combinedItemTypeHash = combinedItem.HashType()

    // Note: we keep the item by default; if there is no itemsByHashType
    // for this item we haven't seen items of this kind yet, so keep it.
    // If there already are like items, we let GradeCombinedItems decide
    // what should happen by holding it against all other items.  And in
    // case that list has become empty, .every returns true for empty
    // arrays, which is what we want too.
    let keepItem = true
    let removeItems = []
    if (this.allItemsByTypeHash.has(combinedItemTypeHash)) {
      let otherSameTypedItems = this.allItemsByTypeHash.get(combinedItemTypeHash)
      keepItem = otherSameTypedItems.every((otherItem) => {
        let grade = GradeCombinedItems(otherItem, combinedItem)
        if (grade == -1)
          // This other item is constructed better, so we can discard the
          // new one.  We can also stop checking, since all other items
          // will not be worse than the new one either.
          return false

        if (grade == +1)
          // The new item is constructed better; we can discard the other
          // one and all it's decendants.
          removeItems.push(otherItem)

        // The new one's grade is a toss-up or better than all, so keep it.
        return true
      })
    }

    if (keepItem)
      this.AddItem(combinedItem, combinedItemTypeHash)

    if (removeItems.length > 0)
      this.RemoveItems(removeItems)
  }


  GetCombinedItems() {
    return this.allItems.slice(this.numSourceItems, this.allItems.length)
  }


  GetCurrentProgress() {
    return this.Progress(this.item1Nr) + this.item2Nr
  }


  GetMaxProgress() {
    return this.Progress(this.allItems.length)
  }


  // ======== PRIVATE ========


  Progress(value) {
    return value * (value + 1) / 2
  }


  AddItem(item, itemTypeHash) {
    let itemIndex = this.allItems.length
    let itemListInfo = {
      index: itemIndex,
      typeHash: itemTypeHash,
      derivedItems: []
    }

    this.allItems.push(item)

    this.itemListInfosByItem.set(item, itemListInfo)
    if (item.set === g_combined) {
      this.itemListInfosByItem.get(item.targetItem).derivedItems.push(item)
      this.itemListInfosByItem.get(item.sacrificeItem).derivedItems.push(item)
    }

    if (this.allItemsByTypeHash.has(itemTypeHash))
      this.allItemsByTypeHash.get(itemTypeHash).push(item)
    else
      this.allItemsByTypeHash.set(itemTypeHash, [item])
  }


  RemoveFromParentLists(item, parentItem) {
    // Note: if we already removed the parent item, it's
    // itemListInfo will also be gone by now.  That's OK
    // though; no need then to patch it up either.
    let parentListInfo = this.itemListInfosByItem.get(parentItem)
    if (parentListInfo !== undefined) {
      let index = parentListInfo.derivedItems.indexOf(item)
      parentListInfo.derivedItems.splice(index, 1)
    }
  }


  RemoveItems(items) {
    while (items.length > 0) {
      let item = items.pop()
      let listInfo = this.itemListInfosByItem.get(item)

      this.allItems.splice(listInfo.index, 1)
      for (let higherItemIndex = listInfo.index; higherItemIndex < this.allItems.length; ++higherItemIndex) {
        let higherItem = this.allItems[higherItemIndex]
        let higherListInfo = this.itemListInfosByItem.get(higherItem)
        --higherListInfo.index
      }
      if (listInfo.index < this.numSourceItems)
        --this.numSourceItems

      if (this.item1Nr == listInfo.index)
        this.item2Nr = 0
      else {
        if (this.item1Nr > listInfo.index)
          --this.item1Nr
        if (this.item2Nr > listInfo.index)
          --this.item2Nr
      }

      this.itemListInfosByItem.delete(item)
      if (item.set === g_combined) {
        this.RemoveFromParentLists(item, item.targetItem)
        this.RemoveFromParentLists(item, item.sacrificeItem)
      }

      let otherSameTypedItems = this.allItemsByTypeHash.get(listInfo.typeHash)
      let otherItemIndex = otherSameTypedItems.indexOf(item)
      otherSameTypedItems.splice(otherItemIndex, 1)

      if (listInfo.derivedItems.length > 0)
        items.push(...listInfo.derivedItems)
    }
  }
}




/*
  Performs all sorts of tests for item combining.

  Prerequisites:
  - none

  Defined classes:
  - ItemCombineTester
*/


// ======== PUBLIC ========


class ItemCombineTester {
  constructor() {
  }


  // returns bool
  TargetIsRelevant(targetItem, desiredItem) {
    return (
      targetItem.info.isBook ||
      targetItem.info === desiredItem.info
    )
  }


  // returns bool
  ItemsCompatible (targetItem, sacrificeItem) {
    return (
      targetItem.info.isBook ? (
        sacrificeItem.info.isBook // we can only add books to books
      ) : (
        sacrificeItem.info.isBook || // we can always add books to anything
        sacrificeItem.info === targetItem.info // or combine items of the same type
      )
    )
  }


  // returns bool
  CombineIsWasteful(targetItem, targetUsed, sacrificeItem, sacrificeUsed) {
    if (!targetItem.info.isBook && sacrificeItem.info.isBook)
      // ... book-on-tool: we only care if the book's enchants got used;
      // if the tool's enchants went unused we just singlehandedly upgraded
      // all enchants on the tool, which is perfectly fine
      return !sacrificeUsed
    else if (targetItem.info.isBook == sacrificeItem.info.isBook)
      // ... tool-on-tool or book-on-book; if either didn't get used it's
      // just a waste of that item (book or tool)
      return !targetUsed || !sacrificeUsed
    else
      // ... tool-on-book wtf situation; just bail out
      return true
  }


  // returns bool
  BareSourcePresent(sourceItems, desiredItem) {
    return sourceItems.some((sourceItem) => {
      return (
        sourceItem.info === desiredItem.info &&
        sourceItem.enchantsByID.size == 0 &&
        sourceItem.priorWork == 0
      )
    })
  }


  // returns bool
  EnchantConflictsForItem(enchantInfo, targetItem) {
    let conflicts = false
    targetItem.enchantsByID.forEach((enchant, id) => {
      if (EnchantIDsConflict(enchantInfo.id, id))
        conflicts = true
    })

    return conflicts
  }
}




/*
  Combines all given items to get all possible item combinations.

  Prerequisites:
  - dataSets.js
  - enchantConflicts.js
  - enchantInfo.js
  - item.js
  - enchant.js
  - itemOrigins.js
  - enchantCombiner.js
  - itemCombineList.js
  - itemCombineTester.js

  Defined classes:
  - ItemCombiner
*/


// ======== PRIVATE ========


class CombineResult {
  constructor() {
    this.targetUsed = false
    this.sacrificeUsed = false
    this.enchantsByID = new Map()
    this.cost = 0
  }
}


// ======== PUBLIC ========


class ItemCombiner {
  // returns object; { combinedItems: Item[], maxProgress: int }
  GetAllItemCombinations(sourceItems, desiredItem, renameToo, feedbackHandler) {
    this.renameToo = renameToo

    let tester = new ItemCombineTester()

    let filteredSourceItems = this.DropNonMatchingSourceItems(tester, sourceItems, desiredItem)

    this.DropUnusedEnchantsFromItems(filteredSourceItems, desiredItem)

    this.InsertExtraBareItem(tester, filteredSourceItems, desiredItem)

    this.SetupItemOrigins(filteredSourceItems)

    let itemList = new ItemCombineList(filteredSourceItems)

    this.MakeAllCombinations(tester, itemList, desiredItem, feedbackHandler)

    return {
      combinedItems: itemList.GetCombinedItems(),
      maxProgress: itemList.GetMaxProgress()
    }
  }


  // ======== PRIVATE ========


  DropNonMatchingSourceItems(tester, sourceItems, desiredItem) {
    return sourceItems.filter((sourceItem) => {
      return tester.TargetIsRelevant(sourceItem, desiredItem)
    })
  }


  DropUnusedEnchantsFromItems(sourceItems, desiredItem) {
    desiredItem.DropUnusedEnchants()
    sourceItems.forEach((sourceItem) => {
      sourceItem.DropUnusedEnchants()
    })
  }


  SetupItemOrigins(sourceItems) {
    let zeroOrigin = new ZeroOrigin(sourceItems)

    sourceItems.forEach((item, itemNr) => {
      item.origin = zeroOrigin.CreateOrigin(itemNr, item.count)
    })
  }


  // Grades the given combined items; returns:
  // -1: previousItem is constructed better
  // +1: newItem is constructed better
  //  0: it's a mixed bag
  //
  // Used to optimize adding items: if one item is identical to
  // something we already have in both type and enchants, then
  // we can dedupe these and toss the one that:
  // - has the same or a superset of the same origins, and
  // - has the same or a higher priorWork, and
  // - has the same or higher totalCost
  GradeCombinedItems(previousItem, newItem) {
    if (
      previousItem.totalCost <= newItem.totalCost &&
      previousItem.priorWork <= newItem.priorWork &&
      previousItem.origin.IsSubsetOf(newItem.origin)
    )
      return -1
    else if (
      newItem.totalCost <= previousItem.totalCost &&
      newItem.priorWork <= previousItem.priorWork &&
      newItem.origin.IsSubsetOf(previousItem.origin)
    )
      return +1
    else
      return 0
  }


  ProcessItemCombination(tester, item1, item2, desiredItem, itemList) {
    let combinedItem = this.CombineItems(tester, item1, item2, desiredItem)

    itemList.ProcessItem(combinedItem, this.GradeCombinedItems)
  }


  MakeAllCombinations(tester, itemList, desiredItem, feedbackHandler) {
    let nextItems = {}
    while (itemList.GetNextItems(nextItems)) {
      if (feedbackHandler.TimeForFeedback())
        feedbackHandler.TellProgress(
          itemList.GetCurrentProgress(),
          itemList.GetMaxProgress()
        )

      this.ProcessItemCombination(tester, nextItems.item1, nextItems.item2, desiredItem, itemList)
      if (nextItems.item1 !== nextItems.item2)
        // Optimization: no need reversing the same item onto itself
        this.ProcessItemCombination(tester, nextItems.item2, nextItems.item1, desiredItem, itemList)
    }
  }


  InsertExtraBareItem(tester, sourceItems, desiredItem) {
    let hasEnchants = desiredItem.enchantsByID.size > 0
    if (
      !desiredItem.info.isBook &&
      hasEnchants &&
      !tester.BareSourcePresent(sourceItems, desiredItem)
    ) {
      let extraItem = new Item(
        1,
        g_extra,
        desiredItem.info.id,
        0
      )
      sourceItems.push(extraItem)
    }
  }


  CombineEnchants(tester, targetItem, sacrificeItem, combineResult) {
    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchantInfo = g_enchantInfos[enchantNr]
      let enchantCombiner = new EnchantCombiner(targetItem, sacrificeItem, enchantInfo)
      if (
        targetItem.info.CanHaveEnchant(enchantInfo.id) &&
        enchantCombiner.isRelevant
      ) {
        if (tester.EnchantConflictsForItem(enchantInfo, targetItem))
          // Java: conflicts cost nonetheless
          // Bedrock: no penalty on conflicts
          ++combineResult.cost
        else {
          let enchantCombineResult = enchantCombiner.Combine()

          if (enchantCombineResult.targetUsed)
            combineResult.targetUsed = true
          if (enchantCombineResult.sacrificeUsed)
            combineResult.sacrificeUsed = true
          combineResult.enchantsByID.set(enchantInfo.id, new Enchant(enchantInfo.id, enchantCombineResult.combinedLevel))
          combineResult.cost += enchantCombineResult.cost
        }
      }
    }
  }


  // returns int
  PriorWorkToCost(priorWork) {
    return (1 << priorWork) - 1
  }


  // returns bool
  CanApplyRename(targetItem, desiredItem) {
    if (targetItem.renamePoint === true)
      return false

    if (targetItem.targetItem === undefined)
      return targetItem.id == desiredItem.id

    return this.CanApplyRename(targetItem.targetItem, desiredItem)
  }


  // returns bool
  IncludesRename(canApplyRename, targetItem, sacrificeItem) {
    return (
      canApplyRename || (
        this.renameToo &&
        (targetItem.includesRename === true || sacrificeItem.includesRename === true)
      )
    )
  }


  // returns Item (the combined item, or undefined if they couldn't be combined)
  CombineItems(tester, targetItem, sacrificeItem, desiredItem) {
    let combinedItem = undefined

    if (
      tester.TargetIsRelevant(targetItem, desiredItem) &&
      tester.ItemsCompatible(targetItem, sacrificeItem)
    ) {
      let combineResult = new CombineResult()
      let numCombines = targetItem.origin.DetermineMaxCombineCount(sacrificeItem.origin)
      if (numCombines > 0) {
        this.CombineEnchants(tester, targetItem, sacrificeItem, combineResult)

        combineResult.cost +=
          this.PriorWorkToCost(targetItem.priorWork) +
          this.PriorWorkToCost(sacrificeItem.priorWork)

        // Note: we don't take up the rename cost in the calculated
        // cost, since then we won't be able to grade two combinations
        // fairly on cost, plus we would get double combine costs when
        // later combines combine two already renamed subcombines.
        // We instead tag the item as 'renamed' and compare against a
        // lower maxCost to compensate.  But if the mere rename itself
        // would make the combine too costly, we take it up unrenamed,
        // since a rename might come from somewhere else anyway.
        let canApplyRename =
          this.renameToo &&
          this.CanApplyRename(targetItem, desiredItem)
        let costOK = combineResult.cost <= 38
        if (!costOK) {
          costOK = combineResult.cost == 39
          canApplyRename = false
        }

        if (
          costOK &&
          !tester.CombineIsWasteful(targetItem, combineResult.targetUsed, sacrificeItem, combineResult.sacrificeUsed)
        ) {
          let combinedPriorWork = Math.max(targetItem.priorWork, sacrificeItem.priorWork) + 1

          combinedItem = new Item(
            numCombines,
            g_combined,
            targetItem.info.id,
            combinedPriorWork
          )

          combinedItem.enchantsByID = combineResult.enchantsByID
          combinedItem.targetItem = targetItem
          combinedItem.sacrificeItem = sacrificeItem
          combinedItem.renamePoint = canApplyRename
          combinedItem.includesRename = this.IncludesRename(canApplyRename, targetItem, sacrificeItem)
          combinedItem.origin = targetItem.origin.Combine(sacrificeItem.origin)
          combinedItem.cost = combineResult.cost
          combinedItem.totalCost = combineResult.cost
          if (targetItem.set === g_combined)
            combinedItem.totalCost += targetItem.totalCost
          if (sacrificeItem.set === g_combined)
            combinedItem.totalCost += sacrificeItem.totalCost
        }
      }
    }

    return combinedItem
  }
}




/*
  Rating details for combine result items.

  Prerequisites:
  - settings.js
  - item.js

  Defined constants:
  - g_exactMatch
  - g_betterMatch
  - g_lesserMatch
  - g_mixedMatch

  Defined classes:
  - RatedItem:
    - item: Item
    - isSource: bool
    - enchantMatch: int (one of the g_xxxMatch constants)
    - enchantRating: float (lower is better)
    - priorWorkRating: float (lower is better)
    - totalCostRating: float (lower is better)
    - totalRating: float (lower is better)
*/


// ======== PUBLIC ========


// Note: this is actually a bitmask
const g_exactMatch = 0
const g_betterMatch = 1
const g_lesserMatch = 2
const g_mixedMatch = 3


function RehydrateRatedItems(ratedItems) {
  ratedItems.forEach((ratedItem) => {
    RatedItem.Rehydrate(ratedItem)
  })
}




class RatedItem {
  // ======== PUBLIC ========


  static Rehydrate(ratedItem) {
    Object.setPrototypeOf(ratedItem, RatedItem.prototype);
    Item.Rehydrate(ratedItem.item)
  }


  constructor(item, desiredItem) {
    this.item = item

    this.AddSourceDetails()
    this.AddEnchantDetails(desiredItem)
    this.AddPriorWorkDetails()
    this.AddTotalCostDetails()

    this.AddTotalRating()
  }


  // ======== PRIVATE ========


  AddSourceDetails() {
    this.isSource = this.item.set === g_source
  }


  AddEnchantDetails(desiredItem) {
    this.enchantRating = 0.0
    let missesEnchants = false
    let extraEnchants = false

    // all enchants on desired, missing or not on combined
    desiredItem.enchantsByID.forEach((desiredEnchant, id) => {
      let levelDiff = 0
      if (this.item.enchantsByID.has(id)) {
        let itemEnchant = this.item.enchantsByID.get(id)
        levelDiff = desiredEnchant.level - itemEnchant.level
        if (levelDiff > 0)
          missesEnchants = true
        else if (levelDiff < 0)
          extraEnchants = true
      }
      else {
        levelDiff = desiredEnchant.level
        missesEnchants = true
      }

      this.enchantRating += (levelDiff / desiredEnchant.info.maxLevel)
    })

    // all enchants missing on desired
    this.item.enchantsByID.forEach((itemEnchant, id) => {
      if (!desiredItem.enchantsByID.has(id)) {
        extraEnchants = true
        let extraPenalty = itemEnchant.info.isCurse ? g_riSettings.unwantedCurseWeight : 1
        this.enchantRating -= (itemEnchant.level / itemEnchant.info.maxLevel) * extraPenalty
      }
    })

    this.enchantRating *= g_riSettings.enchantWeight

    this.enchantMatch =
      (missesEnchants ? g_lesserMatch : 0) +
      (extraEnchants ? g_betterMatch : 0)
  }


  AddPriorWorkDetails() {
    this.priorWorkRating = this.item.priorWork * g_riSettings.priorWorkWeight
  }


  AddTotalCostDetails() {
    this.totalCostRating = this.item.totalCost * g_riSettings.totalCostWeight
  }


  AddTotalRating() {
    this.totalRating = (
      this.enchantRating +
      this.priorWorkRating +
      this.totalCostRating
    )
  }
}




/*
  Combined items result filtering and grouping.
  Used to filter, group, grade, sort and pick-best resulting combined items
  for display to the user.  Non-relevant items (wrong type) and extra items
  (added for combining) are filtered out.

  Prerequisites:
  - ratedItem.js

  Defined classes:
  - FilteredCombinedItems: {
      exactOnlyWithoutRename: bool,
      ratedItemsByMatch: RatedItem[][] // 1st index is one of the g_xxxMatch consts
    }

  - CombineResultFilter
*/


// ======== PUBLIC ========


class CombineResultFilter {
  // ======== PUBLIC ========


  constructor(desiredItem, renameToo) {
    this.desiredItem = desiredItem
    this.renameToo = renameToo
  }


  // returns FilteredCombinedItems
  FilterItems(combinedItems, numItemsToTake) {
    let relevantItems = this.GetRelevantItems(combinedItems)

    let ratedItems = this.RateItems(relevantItems)

    let foundUnrenamedExact = this.HasUnrenamedExact(ratedItems)

    ratedItems = this.RemoveRenameMismatches(ratedItems)

    ratedItems = this.GetLowestPrioAndCostItems(ratedItems)

    let filteredCombinedItems = this.GroupRatedItems(ratedItems, foundUnrenamedExact)

    this.SortGroups(filteredCombinedItems)

    this.KeepBestInGroup(filteredCombinedItems, numItemsToTake)

    return filteredCombinedItems
  }


  // ======== PRIVATE ========


  // returns Item[]
  GetRelevantItems(items) {
    return items.filter((item) => {
      return item.info === this.desiredItem.info
    })
  }


  // returns RatedItem[]
  RateItems(items) {
    return items.map((item) => {
      return new RatedItem(item, this.desiredItem)
    })
  }


  // returns bool
  HasUnrenamedExact(ratedItems) {
    if (!this.renameToo)
      return false

    return ratedItems.some((ratedItem) => {
      return (
        ratedItem.enchantMatch == g_exactMatch &&
        !ratedItem.item.includesRename
      )
    })
  }


  // return RatedItem[]
  RemoveRenameMismatches(ratedItems) {
    if (!this.renameToo)
      return ratedItems

    return ratedItems.filter((ratedItem) => {
      return ratedItem.item.includesRename
    })
  }


  AddLowestPrioAndCostItemsFromGroup(ratedItems, ratedItemsToKeep) {
    /*
      Strategy:
      - For each priorWork and totalCost, decide which item has the lowest
        other property value.  This way we get an optimum for each value in
        each category.
      - Afterwards we find the items which score best on both accounts from
        these optimized lists.  If we e.g. know the item with the lowest
        priorWork for a particular totalCost, then we're only interested in
        that item if there isn't any lower totalCost item for that priorWork.
        We also check if there aren't any other items with both lower priorWork
        and totalCost.
    */

    let minTotalCostItemByPriorWork = new Map()
    let minPriorWorkItemByTotalCost = new Map()
    ratedItems.forEach((ratedItem) => {
      if ((minTotalCostItemByPriorWork.get(ratedItem.item.priorWork)?.item.totalCost ?? 9e9) > ratedItem.item.totalCost)
        minTotalCostItemByPriorWork.set(ratedItem.item.priorWork, ratedItem)
      if ((minPriorWorkItemByTotalCost.get(ratedItem.item.totalCost)?.item.priorWork ?? 9e9) > ratedItem.item.priorWork)
        minPriorWorkItemByTotalCost.set(ratedItem.item.totalCost, ratedItem)
    })

    let CheckNoBetterItemPresent = (ratedItem, ratedItemsByKey) => {
      let noBetterItemPresent = true
      ratedItemsByKey.forEach((otherRatedItem) => {
        if (
          otherRatedItem.item.priorWork < ratedItem.item.priorWork &&
          otherRatedItem.item.totalCost < ratedItem.item.totalCost
        )
          noBetterItemPresent = false
        return noBetterItemPresent
      })
      return noBetterItemPresent
    }

    let selectedRatedItems = new Set()
    minTotalCostItemByPriorWork.forEach((ratedItem) => {
      if (
        minPriorWorkItemByTotalCost.get(ratedItem.item.totalCost) === ratedItem &&
        CheckNoBetterItemPresent(ratedItem, minTotalCostItemByPriorWork)
      ) {
        ratedItemsToKeep.push(ratedItem)
        selectedRatedItems.add(ratedItem)
      }
    })
    minPriorWorkItemByTotalCost.forEach((ratedItem) => {
      if (
        !selectedRatedItems.has(ratedItem) &&
        minTotalCostItemByPriorWork.get(ratedItem.item.priorWork) === ratedItem &&
        CheckNoBetterItemPresent(ratedItem, minPriorWorkItemByTotalCost)
      )
        ratedItemsToKeep.push(ratedItem)
    })
  }


  // returns Item[]
  GetLowestPrioAndCostItems(ratedItems) {
    let ratedItemsToKeep = []

    let ratedItemsByType = new Map()
    ratedItems.forEach((ratedItem) => {
      let itemHash = ratedItem.item.HashType()
      if (ratedItemsByType.has(itemHash))
        ratedItemsByType.get(itemHash).push(ratedItem)
      else
        ratedItemsByType.set(itemHash, [ratedItem])
    })

    ratedItemsByType.forEach((ratedItems) => {
      this.AddLowestPrioAndCostItemsFromGroup(ratedItems, ratedItemsToKeep)
    })

    return ratedItemsToKeep
  }


  // returns FilteredCombinedItems
  GroupRatedItems(ratedItems, foundUnrenamedExact) {
    let exacts = []
    let betters = []
    let lessers = []
    let mixeds = []

    ratedItems.forEach((ratedItem) => {
      if (!this.renameToo || ratedItem.item.includesRename) {
        switch (ratedItem.enchantMatch) {
          case g_exactMatch:
            exacts.push(ratedItem)
            break
          case g_betterMatch:
            betters.push(ratedItem)
            break
          case g_lesserMatch:
            lessers.push(ratedItem)
            break
          case g_mixedMatch:
            mixeds.push(ratedItem)
            break
        }
      }
    })

    return {
      exactOnlyWithoutRename: foundUnrenamedExact && exacts.length == 0,
      ratedItemsByMatch: [exacts, betters, lessers, mixeds]
    }
  }


  SortGroups(filteredCombinedItems) {
    filteredCombinedItems.ratedItemsByMatch.forEach((ratedItems) => {
      ratedItems.sort((ratedItem1, ratedItem2) => {
        // note: lower is better, so the - order is inverted
        return ratedItem1.totalRating - ratedItem2.totalRating
      })
    })
  }


  KeepBestInGroup(filteredCombinedItems, numItemsToTake) {
    filteredCombinedItems.ratedItemsByMatch.forEach((ratedItems) => {
      ratedItems.splice(numItemsToTake, Infinity)
    })
  }
}




/*
  Finalizes an item cost tree.

  Prerequisites:
  - item.js

  Defined classes:
  - ItemCostTreeFinalizer
*/


// ======== PUBLIC ========


class ItemCostTreeFinalizer {
  constructor(item) {
    // ==== PRIVATE ====
    this.item = item
  }


  // returns Item (the corrected clone)
  UpdateCostsForRename() {
    let clone = this.item.Clone()

    let allItems = clone.CollapseTree()

    let costIncreaseItem = this.SelectRenameItem(allItems)

    this.UpdateCostThroughTree(allItems, costIncreaseItem)

    return clone
  }


  // ======== PRIVATE ========


  // returns Item or undefined
  SelectRenameItem(items) {
    let leastCostlyRenameItem = undefined

    items.forEach((item) => {
      if (item.renamePoint === true) {
        if (leastCostlyRenameItem === undefined)
          leastCostlyRenameItem = item
        else if (leastCostlyRenameItem.cost > item.cost) {
          leastCostlyRenameItem.renamePoint = false
          leastCostlyRenameItem = item
        }
        else
          item.renamePoint = false
      }
    })

    return leastCostlyRenameItem
  }


  UpdateCostThroughTree(items, renameItem) {
    while (renameItem !== undefined) {
      renameItem.cost += 1
      renameItem.totalCost += 1

      renameItem = items.find((otherItem) => {
        return (
          otherItem.targetItem === renameItem ||
          otherItem.sacrificeItem === renameItem
        )
      })
    }
  }
}




/*
  Enchant conflict picker.

  Prerequisites:
  - itemInfo.js
  - templateElement.js

  Defined classes:
  - EnchantConflictPicker
*/


// ======== PUBLIC ========


class EnchantConflictPicker {
  constructor(dialogElem, itemInfo) {
    let ids = [...itemInfo.nonConflictingNormalEnchantIDs]
    let names = ids.reduce((names, id) => {
      return names + (names.length == 0 ? '' : ' &#x2022; ') + g_enchantInfosByID.get(id).name
    }, '')
    dialogElem.querySelector('.nonConflictEnchants').innerHTML = names

    let conflictTemplateElem = new TemplateElement(dialogElem, 'conflictEnchants')

    conflictTemplateElem.RemoveCreatedElements()
    this.selectElems = []

    itemInfo.conflictingEnchantIDSetsList.forEach((idSets) => {
      let conflictElem = conflictTemplateElem.CreateExtraElement()
      let selectElem = conflictElem.querySelector('select')
      this.selectElems.push(selectElem)

      let optionOptions = idSets.map((idSet) => {
        let ids = [...idSet]
        let idWithNames = ids.map((id) => {
          return {
            id: id,
            name: g_enchantInfosByID.get(id).name
          }
        }).sort((idWithName1, idWithName2) => {
          return (
            idWithName1.name < idWithName2.name ?
            -1 :
            idWithName1.name > idWithName2.name ?
            +1 :
            0
          )
        })
        return {
          idsText: idWithNames.reduce((idsText, idWithName, idNr) => {
            return idsText + (idNr == 0 ? '' : ',') + idWithName.id
          }, ''),
          names: idWithNames.reduce((names, idWithName, idNr) => {
            return names + (idNr == 0 ? '' : ', ') + idWithName.name
          }, '')
        }
      })

      optionOptions.sort((optionOption1, optionOption2) => {
        return (
          optionOption1.names < optionOption2.names ?
          -1 :
          optionOption1.names > optionOption2.names ?
          +1 :
          0
        )
      })

      optionOptions.forEach((optionOption) => {
        let optionElem = document.createElement('option')
        optionElem.value = optionOption.idsText
        optionElem.textContent = optionOption.names
        selectElem.appendChild(optionElem)
      })
    })
  }


  GetChosenIDs() {
    let chosenIDsText = this.selectElems.reduce((idsText, selectElem, selectElemNr) => {
        return idsText + (selectElemNr == 0 ? '' : ',') + selectElem.value
    }, '')

    return chosenIDsText.split(',').map((idText) => {
      return parseInt(idText)
    })
  }
}




/*
  Main page javascript module.

  Prerequisites:
  - simpleDialog.js
  - enchantConflictPicker.js

  Defined classes:
  - MainFormHandler
*/


class MainFormHandler {
  AskLoadFromURLOrLocalStorage(OnLocalStorage, OnURL) {
    let dialogElem = document.getElementById('urlVsLocalStorageConflict')
    dialogElem.style.display = 'flex'

    dialogElem.querySelector('.useURL').addEventListener('click', () => {
      dialogElem.style.display = 'none'

      OnURL()
    })

    dialogElem.querySelector('.useLocalStorage').addEventListener('click', () => {
      dialogElem.style.display = 'none'

      OnLocalStorage()
    })
  }


  FailedToLoad() {
    new SimpleDialog('dataInErrorForLoad').HookupButton('.exit')
  }


  TellFailedToSaveOnRequest() {
    new SimpleDialog('dataInErrorForSave').HookupButton('.exit')
  }


  TellDataInErrorForDivine() {
    new SimpleDialog('dataInErrorForDivine').HookupButton('.exit')
  }


  TellDataInErrorForFillSources() {
    new SimpleDialog('dataInErrorForFillSources').HookupButton('.exit')
  }


  TellItemsMerged(OnExit) {
    new SimpleDialog('itemsMerged', OnExit).HookupButton('.exit', OnExit)
  }


  AskMaySetMaxedDesiredEnchants(maxEnchantsCallbackInfo) {
    let dialogID =
      maxEnchantsCallbackInfo.hasConflictingEnchants && maxEnchantsCallbackInfo.enchantsAlreadyPresent ?
      'maySetMaxedDesiredEnchants_askConflictAndReplace' :
      maxEnchantsCallbackInfo.hasConflictingEnchants ?
      'maySetMaxedDesiredEnchants_askConflictOnly' :
      'maySetMaxedDesiredEnchants_askReplaceOnly'

    let withEnchantConflictPicker = maxEnchantsCallbackInfo.hasConflictingEnchants
    let enchantConflictPicker =
      withEnchantConflictPicker ?
      new EnchantConflictPicker(document.getElementById(dialogID), maxEnchantsCallbackInfo.info) :
      undefined
    let OnYesClicked = () => {
      maxEnchantsCallbackInfo.OnContinue(
        maxEnchantsCallbackInfo,
        withEnchantConflictPicker ?
        enchantConflictPicker.GetChosenIDs() :
        []
      )
    }
    new SimpleDialog(dialogID).HookupButton('.no').HookupButton('.yes', OnYesClicked)
  }


  AskMayOverwriteSources(OnYesClicked) {
    new SimpleDialog('mayOverwriteSources').HookupButton('.no').HookupButton('.yes', OnYesClicked)
  }


  TellCombineStarting(OnCancel) {
    document.getElementById('divineTitle').textContent = 'Divination is in progress'
    document.getElementById('divineProgress').textContent = 'Starting up...'
    document.querySelector('#divining .exit').textContent = 'Stop'

    new SimpleDialog('divining', OnCancel).HookupButton('.exit', OnCancel)
  }


  TellCombineFinalizing() {
    document.getElementById('divineProgress').textContent = 'Finalizing...'
  }


  TellCombineProgress(progress, maxProgress, timeInMilliseconds) {
    document.getElementById('divineProgress').innerHTML = this.GetProgressMessageHTML(progress, maxProgress, timeInMilliseconds)
  }


  TellCombineDone(filteredCombinedItems, maxProgress, timeInMilliseconds) {
    let timeInSeconds = Math.round(timeInMilliseconds / 1000)
    let hasExactMatches = filteredCombinedItems.ratedItemsByMatch[g_exactMatch].length > 0
    let hasBetterMatches = filteredCombinedItems.ratedItemsByMatch[g_betterMatch].length > 0
    let hasLesserMatches = filteredCombinedItems.ratedItemsByMatch[g_lesserMatch].length > 0
    let hasMixedMatches = filteredCombinedItems.ratedItemsByMatch[g_mixedMatch].length > 0

    let title = 'Divination is compete!'
    let messageHTML = `${this.GetProgressMessageHTML(maxProgress, maxProgress, timeInMilliseconds)}<br><br>`
    if (filteredCombinedItems.exactOnlyWithoutRename)
      messageHTML += 'An exact match cannot be made when renaming; it would be too costly.<br><br>Consider not renaming the item to see what is possible.'

    if (!hasExactMatches && !hasBetterMatches && !hasLesserMatches && !hasMixedMatches) {
      title = 'Divination is unsuccessful'
      if (!filteredCombinedItems.exactOnlyWithoutRename)
        messageHTML += 'Sorry, I couldn\'t come up with your desired item at all.<br><br>Please look at your source items and desired item and make sure there is some sort of match.'
    }
    else if (hasExactMatches) {
      if (hasBetterMatches)
        messageHTML += 'I could also create combinations with even more enchantments.<br><br>I\'ll also show these combinations.'
      else
        messageHTML += 'I\'ll show how to get at your desired item.'
    }
    else {
      if (!filteredCombinedItems.exactOnlyWithoutRename)
        messageHTML += 'An exact match cannot be made.'

      if (hasBetterMatches)
        messageHTML += '<br><br>I could create other combinations with even more enchantments; I\'ll show these instead.'
      else
        messageHTML += '<br><br>I\'ll show you what can be made.'
    }

    document.getElementById('divineTitle').textContent = title
    document.getElementById('divineProgress').innerHTML = messageHTML
    document.querySelector('#divining .exit').textContent = 'OK'
  }


  // returns string
  GetFormattedTime(time) {
    time = Math.round(time)
    let seconds = time % 60
    time = Math.round((time - seconds) / 60)
    let minutes = time % 60
    time = Math.round((time - minutes) / 60)
    let hours = time
    return (
      hours == 0 ?
      `${minutes}:${seconds.toString().padStart(2, '0')}` :
      `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    )
  }


  // returns string
  GetProgressMessageHTML(progress, maxProgress, timeInMilliseconds) {
    let timeInSeconds = Math.round(timeInMilliseconds / 1000)

    let percentageText =
      maxProgress == 0 ?
      '100.0' :
      (100 * progress / maxProgress).toFixed(1)
    let maxProgressText = maxProgress.toLocaleString('en-US')
    let maxTimeInMilliseconds =
      progress == 0 ?
      0 :
      timeInMilliseconds * maxProgress / progress
    let maxTimeInSeconds = Math.round(maxTimeInMilliseconds / 1000)

    return `Progress: ${percentageText}% of ${maxProgressText} combinations<br>Time elapsed: ${this.GetFormattedTime(timeInSeconds)} of ${this.GetFormattedTime(maxTimeInSeconds)}`
  }
}




/*
  Main form (page I/O) management.  Links all buttons to action handlers, and
  populates form element values/options.

  Prerequisites:
  - settings.js
  - dataSets.js
  - enchantInfo.js
  - itemInfo.js
  - sourceItemTable.js
  - desiredItemSection.js
  - combinedItemTable.js
  - itemRow.js
  - mainFormData.js
  - dataStream.js
  - itemCombiner.js
  - combineResultFilter.js
  - recipeFormData.js
  - itemCostTreeFinalizer.js

  Defined classes:
  - MainForm
*/


// ======== PUBLIC ========


class MainForm {
  constructor(formHandler) {
    this.formHandler = formHandler

    window.addEventListener('load', () => {
      this.StartUp()
    })

    // Note: to be deprecated Soon, already not available everywhere...
    window.addEventListener('unload', () => {
      this.Save(false)
    })

    window.addEventListener('beforeunload', () => {
      this.Save(false)
    })

    // Note: also fires on tab switch, but better safe than sorry.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState == 'hidden')
        this.Save(false)
    })

    window.addEventListener('pagehide', () => {
      this.Save(false)
    })
  }


  // ======== PRIVATE ========


  StartUp() {
    this.InitializeSubObjects()

    this.HookUpGUI()

    this.InitializeNotesSection()

    this.StartLoading()
  }


  ShowRecipePage(item) {
    let recipeStream = new DataStream(true)

    let clone = new ItemCostTreeFinalizer(item).UpdateCostsForRename()

    let recipeFormData = new RecipeFormData()
    recipeFormData.SetItem(clone)
    recipeFormData.Serialize(recipeStream)

    let ourStream = new DataStream(true)
    let extraData =
      this.SaveToStream(ourStream, false) ?
      '&data=' + ourStream.GetData() :
      ''

    let baseURL = new URL('recipe.html', document.baseURI)
    let recipeUrl = recipeStream.GetAsURL(baseURL) + extraData
    window.open(recipeUrl)
  }


  InitializeSubObjects() {
    this.sourceItemTable = new SourceItemTable(document.querySelector('#sources table'), document.getElementById('addSourceItem'))
    this.desiredItemSection = new DesiredItemSection(document.querySelector('#desired .item'), (maxEnchantsCallbackInfo) => { return this.AskMaySetMaxedDesiredEnchants(maxEnchantsCallbackInfo) })
    this.renameTooElem = document.getElementById('renameToo')

    let ShowDetailsCallback = (item) => {
      this.ShowRecipePage(item)
    }
    this.combineItemTable = new CombinedItemTable(document.querySelector('#combined table'), ShowDetailsCallback)
  }


  HookUpGUI() {
    document.querySelector('#autoFillSources').addEventListener('click', () => {
      this.AutoFillSources()
    })

    document.querySelector('#divine').addEventListener('click', () => {
      this.PerformDivine()
    })

    document.querySelector('#makeBookmark').addEventListener('click', () => {
      if (!this.Save(true))
        this.formHandler.TellFailedToSaveOnRequest()
    })
  }


  AskMaySetMaxedDesiredEnchants(maxEnchantsCallbackInfo) {
    this.formHandler.AskMaySetMaxedDesiredEnchants(maxEnchantsCallbackInfo)
  }


  ContinueFillSources() {
    let dataInContext = this.GetData(true, false)
    if (dataInContext.withCountErrors)
      this.formHandler.TellDataInErrorForFillSources()
    else {
      let desiredItem = dataInContext.data.desiredItem
      let desiredParts = desiredItem.SplitIntoParts(g_source)
      this.sourceItemTable.SetItems(desiredParts)
    }
  }


  AutoFillSources() {
    if (!this.sourceItemTable.HasItems())
      this.ContinueFillSources()
    else
      this.formHandler.AskMayOverwriteSources(() => { this.ContinueFillSources() })
  }


  ContinueDivine(dataInContext) {
    this.formHandler.TellCombineStarting(() => {
      this.ExitDivine()
    })

    // Note: the path should be relative to the html document loading us!
    this.combineWorker = new Worker('scripts/itemCombineWorker.js?v=d1c4847d')

    this.combineWorker.onmessage = (e) => {
      switch (e.data.type) {
        case 0:
          this.formHandler.TellCombineProgress(e.data.progress, e.data.maxProgress, e.data.timeInMS)
          break
        case 1:
          this.formHandler.TellCombineFinalizing()
          break
        case 2:
          let filteredCombinedItems = e.data.filteredCombinedItems
          filteredCombinedItems.ratedItemsByMatch.forEach((ratedItems) => {
            RehydrateRatedItems(ratedItems)
          })

          this.ShowCombinedItems(filteredCombinedItems)

          this.formHandler.TellCombineDone(filteredCombinedItems, e.data.maxProgress, e.data.timeInMS)
          break
      }
    }

    this.combineWorker.postMessage({
      type: 0,
      sourceItems: dataInContext.data.sourceItems,
      desiredItem: dataInContext.data.desiredItem,
      renameToo: dataInContext.data.renameToo,
      feedbackIntervalMS: g_mfSettings.feedbackIntervalMS,
      numItemsToTake: g_mfSettings.numItemsPerGroup
    })
  }


  PerformDivine() {
    this.ClearResult()

    let dataInContext = this.GetData(false, true)
    if (dataInContext.withCountErrors)
      this.formHandler.TellDataInErrorForDivine()
    else {
      let ContinueCombine = () => {
        this.ContinueDivine(dataInContext)
      }

      if (dataInContext.mergedSourceItems)
        this.formHandler.TellItemsMerged(ContinueCombine)
      else
        ContinueCombine()
    }
  }


  ExitDivine() {
    if (this.combineWorker !== undefined) {
      this.combineWorker.terminate()
      this.combineWorker = undefined
    }
  }


  InitializeNotesSection() {
    let notesElem = document.getElementById('notes')
    let hideNotesElem = document.getElementById('hideNotes')
    let showNotesElem = document.getElementById('showNotes')

    let notesHeight = notesElem.clientHeight

    let SetNotesVisibility = (mustShow, interactive) => {
      hideNotesElem.style.display = mustShow ? 'inline-block' : 'none'
      showNotesElem.style.display = mustShow ? 'none' : 'inline-block'
      if (!interactive)
        notesElem.style.display = mustShow ? 'block' : 'none'
      else {
        if (mustShow)
          hideNotesElem.focus()
        else
          showNotesElem.focus()
        AnimateElementVisibility(notesElem, mustShow, 'block', g_mfSettings.showHideSpeedMS)
      }
    }

    let mustShowNotes = localStorage.getItem('hideNotes') == null
    SetNotesVisibility(mustShowNotes, false)

    hideNotesElem.addEventListener('click', () => {
      SetNotesVisibility(false, true)
      localStorage.setItem('hideNotes', '1')
    })
    showNotesElem.addEventListener('click', () => {
      SetNotesVisibility(true, true)
      localStorage.removeItem('hideNotes')
    })
  }


  ClearResult() {
    this.combineItemTable.Clear()
  }


  ShowCombinedItems(filteredCombinedItems) {
    this.combineItemTable.SetCombinedItems(filteredCombinedItems)
  }


  // returns object;
  // - data: MainFormData
  // - withCountErrors: bool
  // - mergedSourceItems: bool
  GetData(onlyDesiredItem, mergeSourceItems) {
    let sourceItemsResult
    if (onlyDesiredItem)
      sourceItemsResult = {
        items: [],
        withCountErrors: false
      }
    else
      sourceItemsResult = this.sourceItemTable.ExtractItems(new SourceItemCollector(mergeSourceItems))
    let desiredItem = this.desiredItemSection.GetItem()
    let renameToo = this.renameTooElem.checked

    let data = new MainFormData()
    data.AddSourceItems(sourceItemsResult.items)
    data.SetDesiredItem(desiredItem)
    data.SetRenameToo(renameToo)

    return {
      data: data,
      withCountErrors: sourceItemsResult.withCountErrors,
      mergedSourceItems: sourceItemsResult.mergedItems
    }
  }


  SetData(data) {
    this.ClearResult()
    this.sourceItemTable.SetItems(data.sourceItems)
    this.desiredItemSection.SetItem(data.desiredItem)
    this.renameTooElem.checked = data.renameToo
  }


  StartLoading() {
    let loadingOptions = new DataStreamLoadingOptions()

    let ContinueLoading = () => {
      let allOK = true
      let stream = new DataStream(false)
      if (stream.Load(loadingOptions)) {
        let data = new MainFormData()
        allOK = data.Deserialize(stream)
        if (allOK)
          this.SetData(data)
      }

      if (!allOK)
        this.formHandler.FailedToLoad()
    }

    if (!loadingOptions.inConflict)
      ContinueLoading()
    else {
      this.formHandler.AskLoadFromURLOrLocalStorage(() => {
        loadingOptions.ChooseLocalStorage()
        ContinueLoading()
      },
      () => {
        loadingOptions.ChooseURL()
        ContinueLoading()
      })
    }
  }


  // returns bool
  SaveToStream(stream, ignoreCountErrors) {
    let dataInContext = this.GetData(false, false)
    if (dataInContext.withCountErrors && !ignoreCountErrors)
      return false

    dataInContext.data.Serialize(stream)
    return true
  }


  // returns bool (if saving was successful)
  Save(toURL) {
    let stream = new DataStream(true)
    if (!this.SaveToStream(stream, !toURL))
      return false

    if (toURL)
      stream.SaveToBookmarkLink()
    else
      stream.SaveToLocalStorage()

    return true
  }
}




/*
  Wrapper for the recipe table on the page.

  Prerequisites:
  - dataSets.js
  - enchantInfo.js
  - guiHelpers.js

  Defined classes:
  - RecipeTable
*/


// ======== PUBLIC ========


class RecipeTable {
  constructor(tableElem) {
    // ==== PRIVATE ====
    this.tableElem = tableElem
    this.itemTemplateRow = new TemplateElement(tableElem, 'item')

    this.nextCheckboxID = 0
  }


  SetItem(item) {
    let maxItemDepth = this.GetItemDepth(item)

    this.AddItemTree(item, maxItemDepth, 'f', g_rtSettings.resultLabel, undefined)
    // Note: only the 1st th needs the colspan, and querySelector only returns the 1st
    this.tableElem.querySelector('th').setAttribute('colspan', maxItemDepth + 1)
  }


  // ======== PRIVATE ========


  // returns int
  GetItemDepth(item) {
    if (item === undefined)
      return 0
    if (item.targetItem === undefined)
      return 1

    return 1 + Math.max(
      this.GetItemDepth(item.targetItem),
      this.GetItemDepth(item.sacrificeItem)
    )
  }


  // returns string
  GetItemDescription(item) {
    let description
    switch (item.set) {
      case g_combined: description = g_rtSettings.combinedPrefix; break
      case g_source:   description = g_rtSettings.sourcePrefix; break
      case g_extra:    description = g_rtSettings.extraPrefix; break
      case g_desired:  description = g_rtSettings.desiredPrefix; break
    }

    description += item.info.name
    if (item.set === g_source)
      description += g_rtSettings.sourcePostfix.replace('#', item.nr)
    return description
  }


  AddEnchants(enchantTemplateElem, item) {
    for (let enchantNr = 0; enchantNr < g_numDifferentEnchants; ++enchantNr) {
      let enchant = item.enchantsByID.get(g_enchantInfos[enchantNr].id)
      if (enchant !== undefined) {
        let enchantRowElem = enchantTemplateElem.CreateExtraElement()

        enchantRowElem.querySelector('.name').textContent = enchant.info.name
        enchantRowElem.querySelector('.level').textContent = GetRomanNumeralForLevel(enchant.level)
      }
    }
  }


  // returns string
  GetItemCost(item) {
    if (item.set !== g_combined)
      return g_rtSettings.noCost
    else if (item.cost == item.totalCost)
      return g_rtSettings.singleCost.replace('#s', item.cost)
    else
      return g_rtSettings.compoundCost.replace('#s', item.cost).replace('#t', item.totalCost)
  }


  LinkLabelToCheckbox(labelElem, checkboxElem) {
    let checkboxID = `check_${this.nextCheckboxID}`
    checkboxElem.setAttribute('id', checkboxID)
    labelElem.setAttribute('for', checkboxID)

    ++this.nextCheckboxID
  }


  GatherAnimationInfos(hide, rowInfo, rowElemInfos, tdElemInfos) {
    rowInfo.numHides += (hide ? 1 : -1)
    let mustShow = rowInfo.numHides == 0

    rowInfo.childRowInfos.forEach((childRowInfo) => {
      rowElemInfos.push({
        elem: childRowInfo.rowElem,
        mustShow: mustShow
      })
      childRowInfo.rowElem.querySelectorAll('.sizer').forEach((tdElem) => {
        tdElemInfos.push({
          elem: tdElem,
          mustShow: mustShow,
          displayStyle: 'block'
        })
      })

      this.GatherAnimationInfos(hide, childRowInfo, rowElemInfos, tdElemInfos)
    })
  }


  NodeClicked(rowInfo) {
    rowInfo.isUserCollapsed = !rowInfo.isUserCollapsed

    rowInfo.expanderElem.innerHTML =
      rowInfo.isUserCollapsed ?
      g_rtSettings.expandGlyph :
      g_rtSettings.collapseGlyph

    let rowElemInfos = []
    let tdElemInfos = []
    this.GatherAnimationInfos(rowInfo.isUserCollapsed, rowInfo, rowElemInfos, tdElemInfos)

    AnimateElementsVisibility(tdElemInfos, g_rtSettings.expandCollapseSpeedMS, (started) => {
      if (started) {
        if (!rowInfo.isUserCollapsed)
          rowInfo.mainTDElem.classList.add('treeLeft')

        rowElemInfos.forEach((rowElemInfo) => {
          if (rowElemInfo.mustShow)
            rowElemInfo.elem.style.display = 'table-row'
        })
      }
      else {
        if (rowInfo.isUserCollapsed)
          rowInfo.mainTDElem.classList.remove('treeLeft')

        rowElemInfos.forEach((rowElemInfo) => {
          if (!rowElemInfo.mustShow)
            rowElemInfo.elem.style.display = 'none'
        })
      }
    })
  }


  // returns RowInfo
  AddNewRow() {
    let newRowElem = this.itemTemplateRow.CreateExtraElement()

    return {
      rowElem: newRowElem,
      treeNodeTemplateElem: new TemplateElement(newRowElem, 'treeNode'),
      enchantTemplateElem: new TemplateElement(newRowElem, 'enchant'),
      isUserCollapsed: false,
      numHides: 0,
      childRowInfos: []
    }
  }


  AddItemTree(item, numUnusedColumns, collapseTrail, placement, parentRowInfo) {
    let newRowInfo = this.AddNewRow()
    if (parentRowInfo !== undefined)
      parentRowInfo.childRowInfos.push(newRowInfo)
    let hasChildren = item.targetItem !== undefined

    let placementTDElem = newRowInfo.rowElem.querySelector('.placementNode')

    let isExpandableNode = false
    for (let tdElemNr = 0; tdElemNr < collapseTrail.length; ++tdElemNr) {
      let tdElem = newRowInfo.treeNodeTemplateElem.CreateExtraElement()

      let isLeafNode = tdElemNr == 0
      let isNonLeafNode = tdElemNr > 0
      let isExpandableLeafNode = isLeafNode && hasChildren
      let isUnexpandableLeafNode = isLeafNode && !hasChildren
      let isOneBeforeLeafNode = tdElemNr == 1
      let isPassthroughFromLeftNode =
        !isNonLeafNode ?
        false :
        collapseTrail[tdElemNr - 1] == 'l'

      if (isLeafNode)
        newRowInfo.mainTDElem = tdElem

      if (isExpandableLeafNode) {
        isExpandableNode = true
        newRowInfo.expanderElem = tdElem.querySelector('.expander')
        tdElem.classList.add('treeClick')
        newRowInfo.expanderElem.innerHTML = g_rtSettings.collapseGlyph
        newRowInfo.mainTDElem.addEventListener('click', () => {
          this.NodeClicked(newRowInfo)
        })
      }

      if (isUnexpandableLeafNode || isOneBeforeLeafNode)
        tdElem.classList.add('treeTop')

      if (isExpandableLeafNode || isPassthroughFromLeftNode)
        tdElem.classList.add('treeLeft')

      newRowInfo.rowElem.prepend(tdElem)
    }

    placementTDElem.setAttribute('colspan', numUnusedColumns)
    let placementElem = newRowInfo.rowElem.querySelector('.placement')
    if (isExpandableNode) {
      placementElem.classList.add('treeClick')
      placementElem.addEventListener('click', () => {
        this.NodeClicked(newRowInfo)
      })
    }
    placementElem.innerHTML = placement
    if (item.renamePoint)
      newRowInfo.rowElem.querySelector('.renameInstructions').classList.remove('hidden')
    newRowInfo.rowElem.querySelector('.description').textContent = this.GetItemDescription(item)
    this.AddEnchants(newRowInfo.enchantTemplateElem, item)
    newRowInfo.rowElem.querySelector('.priorWork').textContent = item.priorWork
    newRowInfo.rowElem.querySelector('.cost').innerHTML = this.GetItemCost(item)

    let iconElem = newRowInfo.rowElem.querySelector('.icon')
    let hasEnchants = item.enchantsByID.size > 0
    SetIcon(iconElem, item.id, hasEnchants)

    let labelElem = newRowInfo.rowElem.querySelector('label')
    let checkboxElem = newRowInfo.rowElem.querySelector('input')
    this.LinkLabelToCheckbox(labelElem, checkboxElem)

    if (hasChildren) {
      this.AddItemTree(item.targetItem, numUnusedColumns - 1, 'l' + collapseTrail, g_rtSettings.leftLabel, newRowInfo)
      this.AddItemTree(item.sacrificeItem, numUnusedColumns - 1, 'r' + collapseTrail, g_rtSettings.rightLabel, newRowInfo)
    }
  }
}




/*
  Recipe page javascript module.

  Prerequisites:
  - simpleDialog.js

  Defined classes:
  - RecipeFormHandler
*/


class RecipeFormHandler {
  FailedToLoad() {
    new SimpleDialog('dataInErrorForLoad').HookupButton('.exit')
  }
}




/*
  Recipe form (page I/O) management.

  Prerequisites:
  - dataSets.js
  - enchantInfo.js
  - itemInfo.js
  - itemTable.js
  - itemRow.js
  - dataStream.js
  - recipeFormData.js

  Defined classes:
  - RecipeForm
*/


// ======== PUBLIC ========


class RecipeForm {
  constructor(formHandler) {
    this.formHandler = formHandler

    window.addEventListener('load', () => {
      this.SetBacklink()

      this.Load()
    })
  }


  // ======== PRIVATE ========


  SetBacklink() {
    let urlDataMatches = RegExp('[?&]data=([^&#]*)').exec(location.search)
    let data = urlDataMatches ? urlDataMatches[1] : ''
    if (data.length == 0)
      // hmmm... no backlink; leave it like it is
      return

    let backlinkElem = document.getElementById('backlink')
    let dataLink = backlinkElem.getAttribute('href')
    dataLink += `?form=${data}`
    backlinkElem.setAttribute('href', dataLink)
  }


  Load() {
    let allOK = false
    let stream = new DataStream(false)

    let loadingOptions = new DataStreamLoadingOptions()
    loadingOptions.ChooseURL()
    if (stream.Load(loadingOptions)) {
      let data = new RecipeFormData()
      allOK = data.Deserialize(stream)
      if (allOK) {
        let recipeTable = new RecipeTable(document.querySelector('#recipe table'))
        recipeTable.SetItem(data.item)
      }
    }

    if (!allOK)
      this.formHandler.FailedToLoad()
  }
}
