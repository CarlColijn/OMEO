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
    self.indexFileInfo = None
    self.mainJSFileInfo = None
    self.jsFileInfosByName = dict()



  def Publish(self, ourPath):
    self.webRootPath = os.path.join(ourPath, 'source')
    self.uploadRootPath = os.path.join(ourPath, 'upload')

    self.StartClean()
    self.ProcessFolder(self.webRootPath, self.uploadRootPath)
    if not self.CheckAllOK():
      return

    if self.ProcessSpecialFiles():
        tkinter.messagebox.showinfo('Publishing done', 'All files have been published and are now ready in the folder "upload".')


  def StartClean(self):
    if os.path.isdir(self.uploadRootPath):
      shutil.rmtree(self.uploadRootPath)


  def ProcessIndexHTMLFile(self, file, fileUploadPath):
    self.indexFileInfo = FileInfo(file, fileUploadPath)


  def ProcessJSFile(self, file, isMainJSFile, fileUploadPath):
    self.jsFileInfosByName[file.name] = FileInfo(file, fileUploadPath)

    if (isMainJSFile):
      self.mainJSFileInfo = FileInfo(file, fileUploadPath)


  def ProcessOtherFile(self, file, fileUploadPath):
    shutil.copyfile(file.path, fileUploadPath)


  def ProcessFolder(self, folderPath, uploadPath):
    if not os.path.isdir(uploadPath):
      os.mkdir(uploadPath)

    with os.scandir(folderPath) as folder:
      for entry in folder:
        entryUploadPath = os.path.join(uploadPath, entry.name)

        if entry.name.lower() == 'index.html':
          self.ProcessIndexHTMLFile(entry, entryUploadPath)
        elif entry.is_file():
          if entry.name.endswith('.js'):
            isMainJSFile = entry.name.lower() == 'main.js'
            self.ProcessJSFile(entry, isMainJSFile, entryUploadPath)
          else:
            self.ProcessOtherFile(entry, entryUploadPath)

        if entry.is_dir():
          self.ProcessFolder(entry.path, entryUploadPath)


  def ReadFileContent(self, file):
    with open(file.path, 'r') as realFile:
      return realFile.read()


  def WriteFileContent(self, filePath, fileContent):
    with open(filePath, 'w') as file:
      file.write(fileContent)


  def CheckAllOK(self):
    if self.indexFileInfo == None:
      tkinter.messagebox.showerror('Publishing error', 'The main html file "index.html" could not be found.')
      return False

    if self.mainJSFileInfo == None:
      tkinter.messagebox.showerror('Publishing error', 'The main javascript file "main.js" could not be found.')
      return False

    return True


  # Returns [preText, betweenText, postText].
  # Throws an exception when not found.
  def GetSplitText(self, totalText, startSequence, endSequence):
    firstSplit = totalText.split(startSequence)
    secondSplit = firstSplit[1].split(endSequence)
    return [firstSplit[0], secondSplit[0], secondSplit[1]]


  def ProcessSpecialFiles(self):
    html = self.ReadFileContent(self.indexFileInfo.file)
    try:
      htmlParts = self.GetSplitText(html, '<!-- scripts -->', '<!-- /scripts -->')
    except:
      tkinter.messagebox.showerror('Publishing error', f'The scripts part in the file "index.html" could not be found.')
      return False

    scriptLines = htmlParts[1].split('\n')
    try:
      jsFileNames = [self.GetSplitText(scriptLine, 'src="scripts/', '"></script>')[1] for scriptLine in scriptLines]
    except:
      tkinter.messagebox.showerror('Publishing error', f'One of the script references in the scripts part in the file "index.html" cannot be processed.')
      return False

    jsCodeParts = []
    for jsFileName in jsFileNames:
      if not jsFileName in self.jsFileInfosByName:
        tkinter.messagebox.showerror('Publishing error', f'The referenced javascript file "{jsFileName}" could not be found.')
        return False

      jsCodeParts.append(self.ReadFileContent(self.jsFileInfosByName[jsFileName].file))

    totalJSCode = '\n\n\n\n'.join(jsCodeParts)
    self.WriteFileContent(self.mainJSFileInfo.fileUploadPath, totalJSCode)

    htmlParts[1] = f'<script src="scripts/main.js"></script>'
    totalHTML = ''.join(htmlParts)
    self.WriteFileContent(self.indexFileInfo.fileUploadPath, totalHTML)
    return True




ourPath = os.path.dirname(os.path.realpath(__file__))
Publisher().Publish(ourPath)