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
