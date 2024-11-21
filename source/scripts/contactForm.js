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
