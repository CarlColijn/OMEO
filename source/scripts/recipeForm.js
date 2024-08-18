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
      this.recipeTable = new RecipeTable($('#recipe table'))

      this.Load()
    })
  }


  // ======== PRIVATE ========


  Load() {
    let allOK = false
    let stream = new DataStream(false)

    let loadingOptions = new DataStreamLoadingOptions()
    loadingOptions.ChooseURL()
    if (stream.Load(loadingOptions)) {
      let data = new RecipeFormData()
      allOK = data.Deserialize(stream)
      if (allOK)
        this.recipeTable.SetItem(data.item)
    }

    if (!allOK)
      this.formHandler.FailedToLoad()
  }
}
