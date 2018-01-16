'use babel';

import GemChecker from '../lib/gem-checker';
import $ from "jquery";
const GemDetective = require('../lib/gem_detective');

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
      editor.setCursorBufferPosition([3, 8]);
      spyOn( $, 'ajax' ).andCallFake( function (params) { 
        params.success({name: 'devise', info: "Flexible authentication solution for Rails with Warden",
                        gem_uri: "https://rubygems.org/gems/devise-4.4.0.gem",
                        homepage_uri: "https://github.com/plataformatec/devise",
                        project_uri: "https://rubygems.org/gems/devise",
                        version: "4.4.0"
                       }, {}, {status: 200}); 
      });
      atom.commands.dispatch(workspaceElement, 'gem-checker:get_gem_details');
      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        expect(atom.notifications.getNotifications().length).toBe(1);
        notification = atom.notifications.getNotifications()[0]
        expect(notification['message']).toBe("Gem Information");
        expect(notification['type']).toBe("info");
        expect(notification['options']['detail']).toBe("Name: devise\n \nDescription: Flexible authentication solution for Rails with Warden\n \nLatest Version: 4.4.0");
      });
    });
  });
});
