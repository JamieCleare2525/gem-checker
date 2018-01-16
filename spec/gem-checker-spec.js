'use babel';

import GemChecker from '../lib/gem-checker';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('GemChecker', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    waitsForPromise(() => {
      return atom.workspace.open('Gemfile');
    });
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('gem-checker');
  });

  describe('when the gem-detective:toggle event is triggered', () => {
    it('hides and shows the modal panel', () => {

      // This is an activation event, triggering it will cause the package to be
      // activated.
      editor = atom.workspace.getActiveTextEditor();
      editor.setCursorBufferPosition([2, 8]);
      atom.commands.dispatch(workspaceElement, 'gem-checker:get_gem_details');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        console.log(atom.notifications.getNotifications());
        expect(atom.notifications.getNotifications().length).toBe(1);
      });
    });
  });
});
