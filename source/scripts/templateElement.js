/*
  Set of wrappers for DOM template elements and derived
  real elements.

  Defined classes:
  - TemplateElement
  - RealElement
*/


// ======== PRIVATE ========


class DOMElement {
  constructor(elemJQ) {
    // ==== PUBLIC ====
    this.elemJQ = elemJQ
    this.isReal = elemJQ.attr('data-real') != 0
  }


  IsReal() {
    return this.isReal
  }
}


// ======== PUBLIC ========


class TemplateElement extends DOMElement {
  constructor(elemJQ) {
    super(elemJQ)
  }


  // returns jQuery-wrapped DOM object
  CreateExtraElement() {
    let newElemJQ = this.elemJQ.clone()
    newElemJQ.appendTo(this.elemJQ.parent())

    newElemJQ.removeClass('template')
    newElemJQ.attr('data-real', 1)

    return newElemJQ
  }
}


class RealElement extends DOMElement {
  constructor(elemJQ) {
    super(elemJQ)
  }


  Remove() {
    this.elemJQ.remove()
  }
}
