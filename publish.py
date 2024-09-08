import os
import shutil
import tkinter
import tkinter.messagebox
import re
import traceback
import binascii


class PseudoFileEntry:
  def __init__(self, name, path):
    self.name = name
    self.path = path

  def is_dir(self):
    return False

  def stat(self):
    return os.stat(self.path)




class FileInfo:
  def __init__(self, file, fileUploadPath):
    self.file = file
    self.fileUploadPath = fileUploadPath
    self.content = ''
    self.contentSet = False
    self.hash = ''


  def GetContent(self):
    if len(self.content) == 0:
      with open(self.file.path, 'r') as realFile:
        self.content = realFile.read()

    return self.content


  def SetContent(self, newContent):
    self.content = newContent
    self.contentSet = True
    self.hash = ''


  def HasChangedContent(self):
    return self.contentSet


  def CalculateHash(self):
    if not self.IsHashed():
      crc32 = binascii.crc32(self.GetContent().encode())
      self.hash = f'{crc32:08x}'


  def GetHash(self):
    self.CalculateHash()
    return self.hash


  def IsHashed(self):
    return len(self.hash) > 0


  def CreateUploadVersion(self):
    if not os.path.isdir(self.fileUploadPath):
      os.makedirs(os.path.dirname(self.fileUploadPath), exist_ok=True)

    if self.contentSet:
      with open(self.fileUploadPath, 'w') as file:
        file.write(self.content)
    else:
      shutil.copyfile(self.file.path, self.fileUploadPath)




class FileProcessInstruction:
  def __init__(self, includeTagInstructions, replaceInstructions, includeFileNames):
    self.includeTagInstructions = includeTagInstructions
    self.replaceInstructions = replaceInstructions

    self.includedFileNames = includeFileNames




class Publisher:
  def __init__(self):
    self.htmlFileInfos = []
    self.jsFileInfos = []
    self.cssFileInfos = []
    self.otherFileInfos = []

    self.fileInfosByName = dict()

    self.jsIncludeFileNames = []
    self.cssIncludeFileNames = []


  def Publish(self, ourPath):
    self.DeterminePathsToUse(ourPath)
    self.CleanUploadFolder()
    self.SetUpProcessInstructions()
    self.ScanFolder(self.webRootPath, self.uploadRootPath)
    self.ProcessIncludes()
    self.CombineIncludeFiles()
    self.ApplyFileHashes()
    self.FinalizeAllFileTypes()


  def DeterminePathsToUse(self, ourPath):
    self.webRootPath = os.path.join(ourPath, 'source')
    self.uploadRootPath = os.path.join(ourPath, 'upload')


  def CleanUploadFolder(self):
    if os.path.isdir(self.uploadRootPath):
      shutil.rmtree(self.uploadRootPath)


  def SetUpProcessInstructions(self):
    self.htmlCSSProcessInstructions = FileProcessInstruction(
      [],
      [
        (r'styles.css', 'styles.css?v=[###styles.css###]')
      ],
      self.cssIncludeFileNames
    )
    self.htmlJSProcessInstructions = FileProcessInstruction(
      [
        ('<script src="scripts/', '"></script>', 'script.js?v=[###script.js###]')
      ],
      [],
      self.jsIncludeFileNames
    )

    self.jsJSProcessInstructions = FileProcessInstruction(
      [
        ("importScripts('", "')", 'script.js?v=[###script.js###]')
      ],
      [
        (r'scripts/([a-zA-Z_\-.]+)', r'scripts/\1?v=[###\1###]')
      ],
      self.jsIncludeFileNames
    )


  def ScanFolder(self, folderPath, uploadPath):
    with os.scandir(folderPath) as folder:
      for entry in folder:
        entryUploadPath = os.path.join(uploadPath, entry.name)
        fileInfo = FileInfo(entry, entryUploadPath)

        if entry.is_dir():
          self.ScanFolder(entry.path, entryUploadPath)
        else:
          self.fileInfosByName[entry.name] = fileInfo
          if entry.name.endswith('.html'):
            self.htmlFileInfos.append(fileInfo)
          elif entry.name.endswith('.js'):
            self.jsFileInfos.append(fileInfo)
          elif entry.name.endswith('.css'):
            self.cssFileInfos.append(fileInfo)
          else:
            self.otherFileInfos.append(fileInfo)


  # Returns either [totalText] or [preText, betweenText, postText].
  # Throws an exception when unexpected input patterns are given.
  def GetSplitText(self, totalText, startSequence, endSequence):
    firstSplit = totalText.split(startSequence)
    if len(firstSplit) == 1:
      return [totalText]
    else:
      secondSplit = firstSplit[1].split(endSequence)
      return [firstSplit[0] + startSequence, secondSplit[0], endSequence + secondSplit[1]]


  def ProcessIncludesForFile(self, fileInfo, processInstructions):
    fileContent = fileInfo.GetContent()
    lines = fileContent.split('\n')

    for processInstruction in processInstructions:
      updatedLines = []
      handledFirstInclude = False
      for line in lines:
        useLine = True
        for includeTagInstruction in processInstruction.includeTagInstructions:
          lineParts = self.GetSplitText(line, includeTagInstruction[0], includeTagInstruction[1])
          if len(lineParts) > 1:
            processInstruction.includedFileNames.append(lineParts[1])
            if handledFirstInclude:
              useLine = False
            else:
              line = f'{lineParts[0]}{includeTagInstruction[2]}{lineParts[2]}'
              handledFirstInclude = True
        if useLine:
          updatedLines.append(line)
      lines = updatedLines

    fileContent = '\n'.join(lines)
    for processInstruction in processInstructions:
      for replaceInstruction in processInstruction.replaceInstructions:
        fileContent = re.sub(replaceInstruction[0], replaceInstruction[1], fileContent)

    fileInfo.SetContent(fileContent)


  def ProcessIncludes(self):
    for htmlFileInfo in self.htmlFileInfos:
      self.ProcessIncludesForFile(htmlFileInfo, [self.htmlCSSProcessInstructions, self.htmlJSProcessInstructions])

    for jsFileInfo in self.jsFileInfos:
      self.ProcessIncludesForFile(jsFileInfo, [self.jsJSProcessInstructions])

    for cssFileInfo in self.cssFileInfos:
      self.ProcessIncludesForFile(cssFileInfo, [])


  def CreateSyntheticFileInfo(self, fileInfos, *pathComponents):
    sourceFilePath = os.path.join(self.webRootPath, *pathComponents)
    uploadFilePath = os.path.join(self.uploadRootPath, *pathComponents)
    file = PseudoFileEntry(pathComponents[-1], sourceFilePath)
    extraFileInfo = FileInfo(file, uploadFilePath)

    fileInfos.append(extraFileInfo)
    self.fileInfosByName[file.name] = extraFileInfo

    return extraFileInfo


  def CombineIncludeFilesForType(self, fileNames, combineFileInfo):
    codeParts = []
    includedFileNames = set()

    for fileName in fileNames:
      if not fileName in includedFileNames:
        if not fileName in self.fileInfosByName:
          raise Exception(f'The referenced file "{fileName}" could not be found.')

        includedFileNames.add(fileName)
        codeParts.append(self.fileInfosByName[fileName].GetContent())

    totalCode = '\n\n\n\n'.join(codeParts)

    combineFileInfo.SetContent(totalCode)


  def CombineIncludeFiles(self):
    combinedJSFileInfo = self.CreateSyntheticFileInfo(self.jsFileInfos, 'scripts', 'script.js')
    self.CombineIncludeFilesForType(self.jsIncludeFileNames, combinedJSFileInfo)

    combinedCSSFileInfo = self.CreateSyntheticFileInfo(self.cssFileInfos, 'styles', 'styles.css')
    self.CombineIncludeFilesForType(self.cssIncludeFileNames, combinedCSSFileInfo)


  def GetReffedFileInfosByFileInfo(self):
    reffedFileInfosByFileInfo = dict()

    for fileInfo in self.fileInfosByName.values():
      if fileInfo.HasChangedContent():
        fileContent = fileInfo.GetContent()
        for otherFileInfo in self.fileInfosByName.values():
          hashTag = f'[###{otherFileInfo.file.name}###]'
          if fileContent.find(hashTag) >= 0:
            #print(f'{fileInfo.file.name} -> {otherFileInfo.file.name}')
            if fileInfo not in reffedFileInfosByFileInfo:
              reffedFileInfosByFileInfo[fileInfo] = []
            reffedFileInfosByFileInfo[fileInfo].append(otherFileInfo)

    return reffedFileInfosByFileInfo


  def HashFiles(self, reffedFileInfosByFileInfo):
    # Note: we hash the content as-is, without first substituting
    # hashes for reffed files in the file's content itself.
    # This is perfectly fine, and is the best we can do anyway, since
    # there are circular refs in our files' include patterns.
    for reffedFileInfos in reffedFileInfosByFileInfo.values():
      for reffedFileInfo in reffedFileInfos:
        reffedFileInfo.CalculateHash()


  def ApplyFileHashesForFiles(self, reffedFileInfosByFileInfo):
    # Note: we only need to apply hashes for files that
    # actually refer to other files.
    for fileInfo in reffedFileInfosByFileInfo.keys():
      fileContent = fileInfo.GetContent()
      for reffedFileInfo in reffedFileInfosByFileInfo[fileInfo]:
        hashTag = f'[###{reffedFileInfo.file.name}###]'
        fileContent = fileContent.replace(hashTag, reffedFileInfo.GetHash())

      fileInfo.SetContent(fileContent)


  def ApplyFileHashes(self):
    reffedFileInfosByFileInfo = self.GetReffedFileInfosByFileInfo()

    self.HashFiles(reffedFileInfosByFileInfo)

    self.ApplyFileHashesForFiles(reffedFileInfosByFileInfo)


  def FinalizeFileTypes(self, fileInfos, includedFileNames):
    for fileInfo in fileInfos:
      if fileInfo.file.name not in includedFileNames:
        fileInfo.CreateUploadVersion()


  def FinalizeAllFileTypes(self):
    self.FinalizeFileTypes(self.htmlFileInfos, [])
    self.FinalizeFileTypes(self.jsFileInfos, self.jsIncludeFileNames)
    self.FinalizeFileTypes(self.cssFileInfos, self.cssIncludeFileNames)
    self.FinalizeFileTypes(self.otherFileInfos, [])




ourPath = os.path.dirname(os.path.realpath(__file__))
try:
  Publisher().Publish(ourPath)
  tkinter.messagebox.showinfo('Publishing done', 'All files have been published and are now ready in the folder "upload".')
except Exception as exception:
  tkinter.messagebox.showerror('Publishing error', f'Publishing failed;\n\n{exception}\n\n{traceback.format_exc()}')
