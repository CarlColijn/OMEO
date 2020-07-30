/*
  Wrapper for a single row in an item table.

  Prerequisites:
  - dataSets.js
  - enchantDetails.js
  - enchantRow.js
  - item.js

  Defined classes:
  - ItemRow
    - set: char (s=source, d=desired, c=combined)
*/
class ItemRow {
  constructor(form, rowElemJQ, set) {
    // note our set
    this.set = set

    // note who the form is
    this.form = form

    // note our elements
    this.rowElemJQ = rowElemJQ
    if (set == g_source || set == g_desired)
      this.idElemJQ = rowElemJQ.find('select[name="itemID"]')
    else if (set == g_combined)
      this.typeElemJQ = rowElemJQ.find('.type')
    this.enchantTemplateRowElemJQ = this.rowElemJQ.find('.template').first()
    if (set == g_source)
      this.priorWorkElemJQ = rowElemJQ.find('select[name="priorWork"]')
    else if (set == g_combined) {
      this.priorWorkElemJQ = rowElemJQ.find('.priorWork')
      this.costElemJQ = rowElemJQ.find('.cost')
    }

    // and note whether we're real
    this.isReal = rowElemJQ.data('real') != 0
  }


  // numbers the row
  Number(nr) {
    this.rowElemJQ.data('nr', nr)
    this.rowElemJQ.find('.nr').text(nr)
  }


  // creates a new row based on us
  // returns the new row
  CreateNew(nr, item) {
    // create the new row
    let newRowElemJQ = this.rowElemJQ.clone()
    let rowParentElemJQ = this.rowElemJQ.parent()
    newRowElemJQ.appendTo(rowParentElemJQ)

    // make sure it is not a template row anymore
    newRowElemJQ.removeClass('template')
    newRowElemJQ.data('real', 1)

    // wrap it as a proper ItemRow
    let newItemRow = new ItemRow(this.form, newRowElemJQ, this.set)

    // number it correctly
    newItemRow.Number(nr)

    // link up it's buttons, if needed
    if (this.set == g_source) {
      newRowElemJQ.find('button[name="removeItem"]').click(() => {
        // make our row go away
        newRowElemJQ.remove()

        // and renumber all other rows
        rowParentElemJQ.find('.item').each((rowNr, rowElem) => {
          new ItemRow(this.form, $(rowElem), g_source).Number(rowNr)
        })
      })
      newRowElemJQ.find('button[name="addEnchant"]').click(() => {
        newItemRow.AddEnchant()
      })
    }
    else if (this.set == g_combined)
      newRowElemJQ.find('button[name="showDetails"]').click(() => {
        this.form.ShowDetails(item)
      })

    // set it's item, if needed
    if (item !== undefined)
      newItemRow.SetItem(item)

    // and hand over the row
    return newItemRow
  }


  // whether the row is real
  IsReal() {
    return this.isReal
  }


  // removes us
  Remove() {
    this.rowElemJQ.remove()
  }


  // adds an enchant row
  // returns the new row
  AddEnchant(enchant) {
    let templateRow = new EnchantRow(this.enchantTemplateRowElemJQ, this.set)
    return templateRow.CreateNew(enchant)
  }


  // removes all enchants
  RemoveEnchants() {
    this.rowElemJQ.find('.enchant').each((rowNr, enchantRowElem) => {
      let enchantRow = new EnchantRow($(enchantRowElem))
      if (enchantRow.IsReal())
        enchantRow.Remove()
      return true
    })
  }


  // gets the item on the row
  GetItem() {
    let priorWork =
      this.set == g_source ?
      parseInt(this.priorWorkElemJQ.val()) :
      0
    let item = new Item(
      this.set,
      this.idElemJQ.val(),
      parseInt(this.rowElemJQ.data('nr')),
      priorWork
    )
    item.enchantsByID = this.GetEnchants()
    return item
  }


  // sets the item on the row
  SetItem(item) {
    if (this.set == g_source || this.set == g_desired)
      this.idElemJQ.val(item.id)
    else if (this.set == g_combined)
      this.typeElemJQ.text(item.details.name)
    if (this.set == g_source)
      this.priorWorkElemJQ.val(item.priorWork)
    else if (this.set == g_combined)
      this.priorWorkElemJQ.text(item.priorWork)
    if (this.set == g_combined)
      this.costElemJQ.text(item.cost)
    this.SetEnchants(item.enchantsByID)
  }


  // gets the enchants on the row
  GetEnchants() {
    // add all enchants
    let enchantsByID = {}
    this.rowElemJQ.find('.enchants .enchant').each((rowNr, enchantRowElem) => {
      // look if this is a real data row
      let enchantRowElemJQ = $(enchantRowElem)
      let enchantRow = new EnchantRow(enchantRowElemJQ, this.set)
      if (enchantRow.IsReal()) {
        // yes -> get the data
        let enchant = enchantRow.GetEnchant()

        // and we got another one
        enchantsByID[enchant.id] = enchant
      }
      return true
    })

    // and return what we found
    return enchantsByID
  }


  // sets the enchants on the row
  SetEnchants(enchantsByID) {
    // load 'em all, in the order of the g_enchantDetails list
    for (let enchantNr = 0; enchantNr < g_numEnchants; ++enchantNr) {
      let enchant = enchantsByID[g_enchantDetails[enchantNr].id]
      if (enchant !== undefined)
        this.AddEnchant(enchant)
    }
  }
}
