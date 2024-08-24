import os
import shutil
import tkinter
import tkinter.messagebox




class FileInfo:
  def __init__(self, file, fileUploadPath):
    self.file = file
    self.fileUploadPath = fileUploadPath




class Publisher:
  def __init__(self):
    # The special files to look out for.
    self.indexHTMLFileInfo = None
    self.recipeHTMLFileInfo = None
    self.itemCombineWorkerJSFileInfo = None
    self.combinedJSFileInfo = None

    # All JS files found.
    self.jsFileInfosByName = dict()
    self.includeJSFileNames = [] # added in the correct include order
    self.includedJSFileNames = set()



  def Publish(self, ourPath):
    self.webRootPath = os.path.join(ourPath, 'source')
    self.uploadRootPath = os.path.join(ourPath, 'upload')

    self.CleanUploadFolder()
    self.ProcessFolder(self.webRootPath, self.uploadRootPath)

    if (
      self.CheckAllOK() and
      self.GetUsedScriptFileNames() and
      self.CombineJSFiles()
    ):
      tkinter.messagebox.showinfo('Publishing done', 'All files have been published and are now ready in the folder "upload".')


  def CleanUploadFolder(self):
    if os.path.isdir(self.uploadRootPath):
      shutil.rmtree(self.uploadRootPath)


  def ProcessFolder(self, folderPath, uploadPath):
    if not os.path.isdir(uploadPath):
      os.mkdir(uploadPath)

    with os.scandir(folderPath) as folder:
      for entry in folder:
        entryUploadPath = os.path.join(uploadPath, entry.name)

        if entry.name.lower() == 'index.html':
          self.indexHTMLFileInfo = FileInfo(entry, entryUploadPath)
        elif entry.name.lower() == 'recipe.html':
          self.recipeHTMLFileInfo = FileInfo(entry, entryUploadPath)
        elif entry.name.lower() == 'script.js':
          self.combinedJSFileInfo = FileInfo(entry, entryUploadPath)
        elif entry.name.lower() == 'itemcombineworker.js':
          self.itemCombineWorkerJSFileInfo = FileInfo(entry, entryUploadPath)
        elif entry.is_file():
          if entry.name.endswith('.js'):
            self.jsFileInfosByName[entry.name] = FileInfo(entry, entryUploadPath)
          else:
            shutil.copyfile(entry.path, entryUploadPath)

        if entry.is_dir():
          self.ProcessFolder(entry.path, entryUploadPath)


  def ReadFileContent(self, file):
    with open(file.path, 'r') as realFile:
      return realFile.read()


  def WriteFileContent(self, filePath, fileContent):
    with open(filePath, 'w') as file:
      file.write(fileContent)


  def CheckAllOK(self):
    obligatoryFileInfos = [
      (self.indexHTMLFileInfo, 'html file "index.html"'),
      (self.recipeHTMLFileInfo, 'html file "recipe.html"'),
      (self.itemCombineWorkerJSFileInfo, 'js file "itemCombineWorker.js"'),
      (self.combinedJSFileInfo, 'js file "script.js"'),
    ]

    for (fileInfo, description) in obligatoryFileInfos:
      if fileInfo == None:
        tkinter.messagebox.showerror('Publishing error', f'The {description} could not be found.')
        return False

    return True


  # Returns [preText, betweenText, postText].
  # Throws an exception when not found.
  def GetSplitText(self, totalText, startSequence, endSequence):
    firstSplit = totalText.split(startSequence)
    secondSplit = firstSplit[1].split(endSequence)
    return [firstSplit[0], secondSplit[0], secondSplit[1]]


  def AddUsedScriptsFromFile(self, fileInfo, blockStartTag, blockEndTag, lineStartTag, lineEndTag):
    try:
      fileContent = self.ReadFileContent(fileInfo.file)
      fileBlocks = self.GetSplitText(fileContent, blockStartTag, blockEndTag)
    except:
      tkinter.messagebox.showerror('Publishing error', f'The include part in the file "{fileInfo.file.name}" could not be found.')
      return False

    scriptLines = fileBlocks[1].split('\n')

    fileBlocks[1] = f'{lineStartTag}script.js{lineEndTag}'
    fileContent = ''.join(fileBlocks)
    self.WriteFileContent(fileInfo.fileUploadPath, fileContent)

    jsFileNames = []
    try:
      for scriptLine in scriptLines:
        scriptLine = scriptLine.strip()
        if len(scriptLine) > 0:
          scriptLineParts = self.GetSplitText(scriptLine, lineStartTag, lineEndTag)
          jsFileNames.append(scriptLineParts[1])
    except:
      tkinter.messagebox.showerror('Publishing error', f'One of the script references in the scripts part in the file "{fileInfo.file.name}" cannot be processed.')
      return False

    for jsFileName in jsFileNames:
      if not jsFileName in self.jsFileInfosByName:
        tkinter.messagebox.showerror('Publishing error', f'The referenced javascript file "{jsFileName}" could not be found.')
        return False
      if not jsFileName in self.includedJSFileNames:
        self.includeJSFileNames.append(jsFileName)
        self.includedJSFileNames.add(jsFileName)

    return True


  def GetUsedScriptFileNames(self):
    return (
      self.AddUsedScriptsFromFile(self.indexHTMLFileInfo, '<!-- scripts -->', '<!-- /scripts -->', '<script src="scripts/', '"></script>') and
      self.AddUsedScriptsFromFile(self.recipeHTMLFileInfo, '<!-- scripts -->', '<!-- /scripts -->', '<script src="scripts/', '"></script>') and
      self.AddUsedScriptsFromFile(self.itemCombineWorkerJSFileInfo, '// scripts', '// /scripts', 'importScripts(\'', '\')')
    )


  def CombineJSFiles(self):
    jsCodeParts = []

    for jsFileName in self.includeJSFileNames:
      if not jsFileName in self.jsFileInfosByName:
        tkinter.messagebox.showerror('Publishing error', f'The referenced javascript file "{jsFileName}" could not be found.')
        return False

      jsCodeParts.append(self.ReadFileContent(self.jsFileInfosByName[jsFileName].file))

    totalJSCode = '\n\n\n\n'.join(jsCodeParts)
    self.WriteFileContent(self.combinedJSFileInfo.fileUploadPath, totalJSCode)

    return True




ourPath = os.path.dirname(os.path.realpath(__file__))
Publisher().Publish(ourPath)