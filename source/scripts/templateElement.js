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
  }


  IsReal() {
    return this.elemJQ.attr('data-real') != 0
  }
}


// ======== PUBLIC ========


class TemplateElement extends DOMElement {
  constructor(parentElemJQ, elementClass) {
    super(parentElemJQ.find(`.template.${elementClass}`))

    this.elemJQ.attr('data-real', 0)

    this.parentElemJQ = parentElemJQ
    this.elementClass = elementClass
  }


  // returns jQuery-wrapped DOM object
  CreateExtraElement() {
    let newElemJQ = this.elemJQ.clone()
    newElemJQ.insertBefore(this.elemJQ)

    newElemJQ.removeClass('template')
    newElemJQ.attr('data-real', 1)

    return newElemJQ
  }


  // returns bool
  ElementsPresent() {
    return this.parentElemJQ.find(`.${this.elementClass}[data-real="1"]`).length > 0
  }


  RemoveCreatedElements() {
    this.parentElemJQ.find(`.${this.elementClass}[data-real="1"]`).remove()
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
