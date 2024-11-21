function SetIcon(iconElem, itemID, hasEnchants) {
  let itemInfo = g_itemInfosByID.get(itemID)
  let iconIndex = hasEnchants ? itemInfo.iconIndexEnchanted : itemInfo.iconIndexNormal
  iconElem.style.setProperty('--iconIndex', iconIndex)

  iconElem.querySelector('.glint').style.display = hasEnchants ? 'inline-block' : 'none'
}


function HideElemAnimated(elem, speed) {
  elem.style.display = 'none'
}


function ShowElemAnimated(elem, displayStyle, speed) {
  elem.style.display = displayStyle
}