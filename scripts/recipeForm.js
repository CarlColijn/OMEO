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

    $(() => {
      // only execute once the DOM is fully loaded
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

    this.backlinkElemJQ = $('#backlink')
    let dataLink = this.backlinkElemJQ.attr('href')
    dataLink += `?form=${data}`
    this.backlinkElemJQ.attr('href', dataLink)
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
        let recipeTable = new RecipeTable($('#recipe table'))
        recipeTable.SetItem(data.item)
      }
    }

    if (!allOK)
      this.formHandler.FailedToLoad()
  }
}
