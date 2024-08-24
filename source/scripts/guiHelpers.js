function SetIcon(iconElemJQ, itemID, hasEnchants) {
  let itemInfo = g_itemInfosByID.get(itemID)

  let iconX = -24 * (itemInfo.iconXPos)
  let iconY = -24 * (itemInfo.iconYPos + (hasEnchants ? 3 : 0))
  let iconCSSPosition = `${iconX}px ${iconY}px`

  iconElemJQ.css('object-position', iconCSSPosition)
}
