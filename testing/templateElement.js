// Note: the TestTemplateElement and TestRealElement classes
// cannot be defined in the global scope, since the classes
// they extend are only ever present once the OMEO page itself
// has fully loaded, which is too late.  We must thus postpone
// the class definitions to when the actual tests run, and we
// do so by wrapping the actual class definitions in a function
// we call from the first test function.
// Long live JavaScript's dynamic nature I guess.
let TestTemplateElement
function MakeTestTemplateElementAvailable() {
  TestTemplateElement = class extends TemplateElement {
    constructor() {
      super(document.getElementById('templateElement'), 'test')
    }


    CreateNew(description) {
      return new TestRealElement(super.CreateExtraElement(), description)
    }
  }
}


let TestRealElement
function MakeTestRealElementAvailable() {
  TestRealElement = class extends RealElement {
    constructor(elem, description) {
      super(elem)

      this.elem.querySelector('.description').textContent = description
    }


    GetDescription() {
      return this.elem.querySelector('.description').textContent
    }
  }
}


function ElementPresent(description) {
  let foundElement = false
  document.querySelectorAll('#templateElement tr').forEach((rowElem) => {
    if (description == rowElem.querySelector('.description').textContent) {
      foundElement = true
      return false
    }
    return true
  })

  return foundElement
}




jazil.AddTestSet(mainPage, 'TemplateElement', {
  'Class definition initialization for further tests': (jazil) => {
    MakeTestTemplateElementAvailable()
    MakeTestRealElementAvailable()
  },

  'Template element is not real': (jazil) => {
    let templateElement = new TestTemplateElement()
    jazil.ShouldBe(templateElement.IsReal(), false)
  },

  'New element is real': (jazil) => {
    let templateElement = new TestTemplateElement()
    let element = templateElement.CreateNew('test 1')
    jazil.ShouldBe(element.IsReal(), true)
    jazil.ShouldBe(templateElement.ElementsPresent(), true, 'added element not reported!')
  },

  'Create new element from template': (jazil) => {
    let templateElement = new TestTemplateElement()
    let element = templateElement.CreateNew('test 2')
    let description = element.GetDescription()
    jazil.ShouldBe(description, 'test 2', 'description is off!')
    jazil.ShouldBe(ElementPresent('test 2'), true, 'added element is not present!')
  },

  'Added element count is OK': (jazil) => {
    let templateElement = new TestTemplateElement()
    let numElementsPre = document.querySelectorAll('#templateElement tr').length
    let element1 = templateElement.CreateNew('test 3')
    let element2 = templateElement.CreateNew('test 4')
    let element3 = templateElement.CreateNew('test 5')
    let numElementsPost = document.querySelectorAll('#templateElement tr').length
    jazil.ShouldBe(numElementsPost - numElementsPre, 3, 'amount of elements added is off!')
  },

  'Individual elements can be removed': (jazil) => {
    let templateElement = new TestTemplateElement()
    let element1 = templateElement.CreateNew('test 6')
    let element2 = templateElement.CreateNew('test 7')
    let element3 = templateElement.CreateNew('test 8')
    let numElementsPre = document.querySelectorAll('#templateElement tr').length
    element2.Remove()
    let numElementsPost = document.querySelectorAll('#templateElement tr').length
    jazil.ShouldBe(numElementsPost - numElementsPre, -1, 'amount of elements removed is off!')
    jazil.ShouldBe(ElementPresent('test 7'), false, 'removed element is still present!')
  },

  'All elements can be removed': (jazil) => {
    let templateElement = new TestTemplateElement()
    let element8 = templateElement.CreateNew('test 8')
    let numElementsPre = document.querySelectorAll('#templateElement tr').length
    templateElement.RemoveCreatedElements()
    let numElementsPost = document.querySelectorAll('#templateElement tr').length
    jazil.ShouldBe(numElementsPost, 1, 'amount of elements removed is off!')
    jazil.ShouldBe(ElementPresent('test 8'), false, 'removed element is still present!')
    jazil.ShouldBe(templateElement.ElementsPresent(), false, 'element presence still reported!')
  },

})
