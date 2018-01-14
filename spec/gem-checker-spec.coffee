GemChecker = require '../lib/gem-checker'

describe 'GemChecker', ->
  [activationPromise, editor, editorView] = []

  gemFile = (callback) ->
    atom.commands.dispatch(editorView, 'gem-checker:get_gem_details')
    waitsForPromise -> activationPromise
    runs(callback)

  beforeEach ->
    waitsForPromise ->
      atom.workspace.open('Gemfile')

    runs ->
      editor = atom.workspace.getActiveTextEditor()
      editorView = atom.views.getView(editor)

      activationPromise = atom.packages.activatePackage('gem-checker')

  describe 'Gem-Checker', ->
    describe 'when the gem details function is triggered', ->
      it 'should create a notification with containing the details of the gem', ->
        editor.setCursorBufferPosition([3, 8])
        b = editor.lineTextForBufferRow(editor.getCursorBufferPositions()[0]["row"]).trim();
        console.log(b)
        gemFile ->
          expect(atom.packages.isPackageActive('gem-checker')).toBe true
