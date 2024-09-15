import os
import shutil
import stat
import tkinter
import tkinter.messagebox
import tkinter.simpledialog
import re
import traceback
import binascii
import datetime
# The environment variable needs to be set before we can import git.
os.environ['GIT_PYTHON_GIT_EXECUTABLE'] = 'C:\\Program Files\\SmartGit\\git\\bin\\git.exe'
import git


def RemoveFolderSafe(folderPath):
  def FixSHUtilError(func, path, exc):
    os.chmod(path, stat.S_IRWXU | stat.S_IRWXG | stat.S_IRWXO)
    func(path)

  if os.path.isdir(folderPath):
    shutil.rmtree(folderPath, ignore_errors=False, onerror=FixSHUtilError)



class PseudoFileEntry:
  def __init__(self, name, path):
    self.name = name
    self.path = path

  def is_dir(self):
    return False

  def stat(self):
    return os.stat(self.path)




class FileInfo:
  def __init__(self, file, repoFilePath):
    self.file = file
    self.repoFilePath = repoFilePath
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


  def CreateRepoVersion(self):
    if not os.path.isdir(self.repoFilePath):
      os.makedirs(os.path.dirname(self.repoFilePath), exist_ok=True)

    if self.contentSet:
      with open(self.repoFilePath, 'w') as file:
        file.write(self.content)
    else:
      shutil.copyfile(self.file.path, self.repoFilePath)




class FileProcessInstruction:
  def __init__(self, includeTagInstructions, replaceInstructions, includeFileNames):
    self.includeTagInstructions = includeTagInstructions
    self.replaceInstructions = replaceInstructions

    self.includedFileNames = includeFileNames




class Publisher:
  def __init__(self):
    self.repoFilePaths = set()

    self.htmlFileInfos = []
    self.jsFileInfos = []
    self.cssFileInfos = []
    self.otherFileInfos = []
    self.allFilePaths = set()

    self.fileInfosByName = dict()

    self.jsIncludeFileNames = []
    self.cssIncludeFileNames = []


  def Publish(self):
    self.DeterminePathsToUse()
    if not self.EnsureWeMayRun():
      return False
    if not self.GetAuthenticationTokens():
      return False
    self.CheckOutRepo()
    self.IndexRepoFiles(self.repoPath)
    self.SetUpProcessInstructions()
    self.ScanFolder(self.webRootPath, self.repoPath)
    self.ProcessIncludes()
    self.CombineIncludeFiles()
    self.ApplyFileHashes()
    self.FinalizeAllFileTypes()
    self.KillRemovedFiles()
    committed = self.MakeGitCommit()
    if committed:
      self.CheckInRepo()
    self.RemoveRepo()
    return committed


  def DeterminePathsToUse(self):
    ourPath = os.path.dirname(os.path.realpath(__file__))

    self.webRootPath = os.path.join(ourPath, 'source')
    self.repoPath = os.path.join(os.path.dirname(ourPath), 'GHPagesRepository')


  def EnsureWeMayRun(self):
    if not os.path.exists(self.repoPath):
      return True

    return tkinter.messagebox.askokcancel(
      'Repository destination conflict',
      f'There is already a file or folder located at the spot the OMEO repository needs to be checked out;\n{self.repoPath}\n\nRemove this folder and continue?',
      default=tkinter.messagebox.CANCEL
    )


  def GetAuthenticationTokens(self):
    def GetInformation(title, prompt):
      information = tkinter.simpledialog.askstring(title, prompt, show='*')
      if information is None:
        return ''
      else:
        return information.strip()

    self.userName = GetInformation('GitHub user name for OMEO', 'Enter your GitHub user name:')
    if len(self.userName) == 0:
      return False

    self.accessToken = GetInformation('GitHub authentication token for OMEO', 'Enter your GitHub SSH authentication token:')
    return len(self.accessToken) > 0


  def CheckOutRepo(self):
    RemoveFolderSafe(self.repoPath)
    remoteURL = f'https://{self.userName}:{self.accessToken}@github.com/{self.userName}/OMEO.git'
    self.repo = git.Repo.clone_from(remoteURL, self.repoPath)
    self.repo.git.checkout('gh-pages')


  def IndexRepoFiles(self, folderPath):
    with os.scandir(folderPath) as folder:
      for entry in folder:
        if entry.is_file():
          self.repoFilePaths.add(entry.path)
        elif not entry.name == '.git':
          self.IndexRepoFiles(entry.path)


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


  def ScanFolder(self, folderPath, repoPath):
    with os.scandir(folderPath) as folder:
      for entry in folder:
        entryRepoPath = os.path.join(repoPath, entry.name)
        fileInfo = FileInfo(entry, entryRepoPath)

        if entry.is_dir():
          self.ScanFolder(entry.path, entryRepoPath)
        else:
          self.allFilePaths.add(entry.path)
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
    repoFilePath = os.path.join(self.repoPath, *pathComponents)
    file = PseudoFileEntry(pathComponents[-1], sourceFilePath)
    extraFileInfo = FileInfo(file, repoFilePath)

    fileInfos.append(extraFileInfo)
    self.allFilePaths.add(sourceFilePath)
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
        fileInfo.CreateRepoVersion()


  def FinalizeAllFileTypes(self):
    self.FinalizeFileTypes(self.htmlFileInfos, [])
    self.FinalizeFileTypes(self.jsFileInfos, self.jsIncludeFileNames)
    self.FinalizeFileTypes(self.cssFileInfos, self.cssIncludeFileNames)
    self.FinalizeFileTypes(self.otherFileInfos, [])


  def KillRemovedFiles(self):
    relRepoFilePaths = set([os.path.relpath(filePath, start=self.repoPath) for filePath in self.repoFilePaths])
    relAllFilePaths = set([os.path.relpath(filePath, start=self.webRootPath) for filePath in self.allFilePaths])
    relRemovedFilePaths = relRepoFilePaths - relAllFilePaths
    for relFilePath in relRemovedFilePaths:
      os.remove(os.path.join(self.repoPath, relFilePath))


  def MakeGitCommit(self):
    filesToAdd = self.repo.untracked_files
    filesToRemove = []
    for diff in self.repo.index.diff(None):
      if diff.change_type == 'D':
        filesToRemove.append(diff.a_path)
      else:
        filesToAdd.append(diff.a_path)

    hasFilesToRemove = len(filesToRemove) > 0
    hasFilesToAdd = len(filesToAdd) > 0
    if hasFilesToRemove:
      self.repo.index.remove(filesToRemove, working_tree=True)
    if hasFilesToAdd:
      self.repo.index.add(filesToAdd)
    somethingToDo = hasFilesToRemove or hasFilesToAdd

    if somethingToDo:
      dateTimeStamp = datetime.datetime.now().replace(microsecond=0).isoformat()
      self.repo.index.commit(f'Auto-publish: {dateTimeStamp}')
    else:
      tkinter.messagebox.showinfo('Publishing not needed', 'There are no changes to commit to GitHub.')

    return somethingToDo


  def CheckInRepo(self):
    self.repo.remotes.origin.push().raise_if_error()


  def RemoveRepo(self):
    RemoveFolderSafe(self.repoPath)




try:
  if Publisher().Publish():
    tkinter.messagebox.showinfo('Publishing done', 'All files have been published and uploaded to GitHub.')
except Exception as exception:
  tkinter.messagebox.showerror('Publishing error', f'Publishing failed;\n\n{exception}\n\n{traceback.format_exc()}')
