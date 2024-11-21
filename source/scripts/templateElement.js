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
