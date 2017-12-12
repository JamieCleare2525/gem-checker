'use babel';

import GemCheckerView from './gem-checker-view';
import { CompositeDisposable } from 'atom';
import request from 'request';
import $ from "jquery";
const fs = require('file-system');
const electron = require('electron')
const BrowserWindow = electron.remote.BrowserWindow;

export default {

  gemCheckerView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.gemCheckerView = new GemCheckerView(state.gemCheckerViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.gemCheckerView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'gem-checker:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.gemCheckerView.destroy();
  },

  serialize() {
    return {
      gemCheckerViewState: this.gemCheckerView.serialize()
    };
  },

  toggle() {
    editor = atom.workspace.getActiveTextEditor();
    if (editor.getPath().endsWith("Gemfile")){
      var gem_file = fs.readFileSync(editor.getPath() + ".lock")
      var gem_file_lines = gem_file.toString().split("\n");
      gems = editor.getBuffer().getLines();
      for (i=0; i < gems.length; i++){
        gem_code = gems[i].split(' ');
        gem_title = gem_code[1];
        if (gem_code[0] == "gem" && !gem_code.includes("path:") && !gem_code.includes("git:")){
          this.gem_versions(gem_title.replace(/["',]/g, ""), gem_file_lines);
        }
      }
    }
  },

  gem_versions(gem_title, gem_file_lines){
    version_url = 'https://rubygems.org/api/v1/versions/' + gem_title + '.json';
    let self = this
    $.ajax({url: version_url,
            type: "GET",
            success: function(data, status, xhr) {
              gem_version_list = self.version_list(data);
              for(i=0; i < gem_file_lines.length; i++){
                regex_string = gem_title + '\\s\\([\\d.]*\\)';
                regex = new RegExp(regex_string, 'gi');
                if(gem_file_lines[i].trim().match(regex)){
                  current_version = gem_file_lines[i].trim().split(" ")[1].replace(/\(|\)/g, '');
                  self.gem_details(gem_title, current_version, gem_version_list);
                  // self.version_checker(gem_title, current_version, gem_version_list);
                };
              }
            },
            error: function(xhr, status) {
              if (xhr['status'] == 429){
                setTimeout(function(){ self.gem_versions(gem_title, gem_file_lines); }, 6000);
              }
            }
          });
  },

  gem_details(gem_title, current_version, gem_version_list){
    details_url = "https://rubygems.org/api/v1/gems/" + gem_title + ".json";
    let self = this;
    $.ajax({url: details_url,
            type: "GET",
            success: function(data, status, xhr) {
              self.version_checker(gem_title, current_version, gem_version_list, data);
            },
            error: function(xhr, status) {
              if (xhr['status'] == 429){
                setTimeout(function(){ self.gem_details(gem_title, gem_file_lines); }, 6000);
              }
            }
          });
  },

  version_list(gem_info){
    gem_versions = [];
    for(i=0; i < gem_info.length; i++){
      gem_versions.push(gem_info[i]["number"]);
    }
    return gem_versions;
  },

  version_checker(gem_title, current_version, gem_version_list, gem_info){
    current_version_number = gem_version_list.indexOf(current_version);
    if(current_version_number == 0){
      // do nothing
    } else if(current_version_number == 1){
      atom.notifications.addInfo("Information: New Gem Version Available", {
        detail: "Gem: " + gem_title + "\nNew Version Available for this Gem!" +
        "\n \nCurrent Version: " + current_version +
        "\nLatest Version: " + gem_version_list[0],
        dismissable: true,
        buttons: [
          {
            className: "btn-details",
            onDidClick: function() {
              mainWindow = new BrowserWindow({
                height: 600,
                width: 800
              });
              mainWindow.loadURL(gem_info["project_uri"]);
            },
            text: gem_info["project_uri"]
          },
          {
            className: "btn-details",
            onDidClick: function() {
              mainWindow = new BrowserWindow({
                height: 600,
                width: 800
              });
              mainWindow.loadURL(gem_info["homepage_uri"]);
            },
            text: "GitHub Repo"
          }
        ]
      })
    } else if(current_version_number >= 4){
      atom.notifications.addError("Warning: Gem Out-of-Date", {
        detail: "Gem: " + gem_title + "\nThis Gem is Severely Out-of-Date! Please consider Updating this Gem!" +
        "\n \nCurrent Version: " + current_version +
        "\nLatest Version: " + gem_version_list[0],
        dismissable: true,
        buttons: [
          {
            className: "btn-details",
            onDidClick: function() {
              mainWindow = new BrowserWindow({
                height: 600,
                width: 800
              });
              mainWindow.loadURL(gem_info["project_uri"]);
            },
            text: "RubyGem Docs"
          },
          {
            className: "btn-details",
            onDidClick: function() {
              mainWindow = new BrowserWindow({
                height: 600,
                width: 800
              });
              mainWindow.loadURL(gem_info["homepage_uri"]);
            },
            text: "Repo"
          }
        ]
      })
    } else if(current_version_number >=2){
      atom.notifications.addWarning("Caution: Gem Out-of-Date", {
        detail: "Gem: " + gem_title + "\nThis Gem is Out-of-Date. Please consider Updating this Gem." +
        "\n \nCurrent Version: " + current_version +
        "\nLatest Version: " + gem_version_list[0],
        dismissable: true,
        buttons: [
          {
            className: "btn-details",
            onDidClick: function() {
              mainWindow = new BrowserWindow({
                height: 600,
                width: 800
              });
              mainWindow.loadURL(gem_info["project_uri"]);
            },
            text: "RubyGem Docs"
          },
          {
            className: "btn-details",
            onDidClick: function() {
              mainWindow = new BrowserWindow({
                height: 600,
                width: 800
              });
              mainWindow.loadURL(gem_info["homepage_uri"]);
            },
            text: "Repo"
          }
        ]
      })
    };
  }

};
