function SetIcon(iconElemJQ, itemID, hasEnchants) {
  let itemInfo = g_itemInfosByID.get(itemID)
  let iconIndex = hasEnchants ? itemInfo.iconIndexEnchanted : itemInfo.iconIndexNormal
  iconElemJQ.attr('style', `--iconIndex:${iconIndex};`)

  iconElemJQ.find('.glint').css('display', hasEnchants ? 'inline-block' : 'none')
}
