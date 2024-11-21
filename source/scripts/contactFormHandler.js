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
