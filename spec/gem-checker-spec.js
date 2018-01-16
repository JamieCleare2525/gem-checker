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

  describe('when the gem-checker:get_gem_details event is triggered on a gem', () => {
    it('shows a info notification containing the details of the gem', () => {

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

  describe('when the gem-checker:check_gem_maintenance event is triggered on a gem', () => {
    it('shows a warning notification containing the version details of the gem', () => {
      editor = atom.workspace.getActiveTextEditor();
      editor.setCursorBufferPosition([3, 8]);
      spyOn( $, 'ajax' ).andCallFake( function (params) { 
        params.success([{name: 'devise', info: "Flexible authentication solution for Rails with Warden",
                        gem_uri: "https://rubygems.org/gems/devise-4.4.0.gem",
                        built_at: "2015-03-14T00:00:00.000Z",
                        homepage_uri: "https://github.com/plataformatec/devise",
                        project_uri: "https://rubygems.org/gems/devise",
                        number: "4.4.0"
                       }], {}, {status: 200}); 
      });
      atom.commands.dispatch(workspaceElement, 'gem-checker:check_gem_maintenance');
      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        expect(atom.notifications.getNotifications().length).toBe(1);
        notification = atom.notifications.getNotifications()[0]
        expect(notification['message']).toBe("Warning: Gem Not Maintained");
        expect(notification['type']).toBe("warning");
        expect(notification['options']['detail']).toBe("This Gem has not been updated since Sat Mar 14 2015 00:00:00 GMT+0000 (GMT), this may indicate that the Gem is no longer maintained.");
      });
    });
  });
});
