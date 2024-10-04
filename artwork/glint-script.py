"""
Usage:
- open the gradient source file in Gimp
- open the Python-Fu consle
- paste the below script into the console
- call the MakeGlint() function

Avoid empty lines in the script; they prevent you from the ability
to paste the entire script in one go into the python-fu console.

Scripting documentation:
https://www.gimp.org/docs/python/index.html

Glint info:
https://www.minecraftforum.net/forums/mapping-and-modding-java-edition/resource-packs/resource-pack-discussion/1256366-the-all-inclusive-updated-guide-to-texturing#EnchantmentGlint
"""
numFrames = 50
import os
import math
def MakeGlint():
  # access the gradient
  image = gimp.image_list()[0]
  # convert to rgb mode
  pdb.gimp_image_convert_rgb(image)
  # make it a true transparent gradient
  mainLayer = image.layers[0]
  pdb.gimp_layer_add_alpha(mainLayer)
  pdb.gimp_drawable_brightness_contrast(mainLayer, 0.5, 0)
  mask = pdb.gimp_layer_create_mask(mainLayer, 5) # 5 = ADD-MASK-COPY
  pdb.gimp_layer_add_mask(mainLayer, mask)
  pdb.gimp_layer_remove_mask(mainLayer, 0) # 0 = APPLY
  pdb.gimp_layer_set_opacity(mainLayer, 40)
  pdb.plug_in_gauss(image, mainLayer, 1.5, 1.5, 0)
  # make it purple
  pdb.gimp_drawable_color_balance(mainLayer, 0, True, 100, -100, 100) # 0 = SHADOWS
  pdb.gimp_drawable_color_balance(mainLayer, 1, True, 100, -100, 100) # 1 = MIDTONES
  pdb.gimp_drawable_color_balance(mainLayer, 2, True, 100, -100, 100) # 2 = HIGHLIGHTS
  pdb.gimp_drawable_hue_saturation(
    mainLayer,
    0, # 0 = HUE-RANGE-ALL
    0, # hue-offset
    -70, # lightness
    0, # saturation
    0 # overlap
  )
  # duplicate the layer to make it easier to create a moving gradient
  for x in range(-2, 3):
    for y in range(-2, 3):
      if x != 0 or y != 0:
        copiedLayer = pdb.gimp_layer_copy(mainLayer, True)
        copiedLayer.set_offsets(x * 64, y * 64)
        pdb.gimp_image_add_layer(image, copiedLayer, 0)
  while len(image.layers) > 1:
    pdb.gimp_image_merge_down(image, image.layers[0], 0)
  # create the two direction gradients
  dir1Layer = image.layers[0]
  dir2Layer = pdb.gimp_layer_copy(dir1Layer, 0)
  pdb.gimp_image_add_layer(image, dir2Layer, 0)
  pdb.gimp_rotate(dir1Layer, True, 0.785398)
  pdb.gimp_rotate(dir2Layer, True, 1.5708 + 0.785398)
  pdb.gimp_image_resize_to_layers(image)
  # create the animation layers
  dir1Layer = image.layers[1]
  dir2Layer = image.layers[0]
  for frameNr in range(1, numFrames):
    relFrameNr = math.sqrt(2) * frameNr / float(numFrames)
    dir1LayerCopy = pdb.gimp_layer_copy(dir1Layer, 0)
    dir1LayerCopy.set_offsets(int(-128 * relFrameNr), 0)
    pdb.gimp_image_add_layer(image, dir1LayerCopy, 0)
    dir2LayerCopy = pdb.gimp_layer_copy(dir2Layer, 0)
    dir2LayerCopy.set_offsets(0, int(-64 * relFrameNr))
    pdb.gimp_image_add_layer(image, dir2LayerCopy, 0)
    pdb.gimp_image_merge_down(image, dir2LayerCopy, 0)
  # merge the source layers too as the first frame
  pdb.gimp_image_merge_down(image, image.layers[len(image.layers) - 2], 0)
  # crop to a 64x64 viewport
  pdb.gimp_image_resize(image, 24, 24, -128, -192)
  # crop all layers to the viewport too
  for layer in image.layers:
    pdb.gimp_layer_resize_to_image_size(layer)
  # and export to the final glint image
  saveFilePath = os.path.join(os.path.dirname(pdb.gimp_image_get_filename(image)), 'glint.webp')
  pdb.file_webp_save2(
    image,
    image.layers[0],
    saveFilePath, 'glint.webp',
    0, # 0 = AUTO preset
    1, # lossless
    90, # quality
    90, # alpha_quality
    1, # use animation
    1, # loop animation
    1, # minimize animation size
    0, # keyframe distance
    0, 0, 0, 0, # extra save options
    int(5000 / numFrames), # delay in ms
    1 # force delay on all frames
  )
