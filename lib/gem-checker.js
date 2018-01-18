'use babel';

import GemCheckerView from './gem-checker-view';
import { CompositeDisposable } from 'atom';
import $ from "jquery";
const fs = require('file-system');
const electron = require('electron')
const BrowserWindow = electron.remote.BrowserWindow;
const GemDetective = require('./gem_detective');

export default {

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
      'gem-checker:all_gem_versions': () => this.all_gem_versions(),
      'gem-checker:gem_info': () => this.gem_info(),
      'gem-checker:check_gem_maintenance': () => this.check_gem_maintenance()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  gem_info(){
    editor = atom.workspace.getActiveTextEditor();
    if (editor.getPath().endsWith("Gemfile")){
      gem_line = editor.lineTextForBufferRow(editor.getCursorBufferPositions()[0]["row"]).trim();
      if (!gem_line.includes('path')){
        gem_title = gem_line.split(" ")[1].replace(/["',]/g, "");
        gem_file = fs.readFileSync(editor.getPath() + ".lock");
        gem_file_lines = gem_file.toString().split("\n");
        detective = new GemDetective;
        current_version = detective.current_version_finder(gem_title, gem_file_lines);
        details = detective.gem_details(gem_title);
        details.then(function(val) {
          atom.notifications.addInfo("Gem Information", {
                detail: "Name: " + val['name'] + "\n \n" +
                        "Description: " + val['info'] + "\n \n" +
                        "Current Version: " + current_version + "\n" +
                        "Latest Version: " + val['version'],
                dismissable: true,
                buttons: [
                  {
                    className: "btn-details",
                    onDidClick: function() {
                      mainWindow = new BrowserWindow({
                        height: 600,
                        width: 800
                      });
                      mainWindow.loadURL(val["project_uri"]);
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
                      mainWindow.loadURL(val["homepage_uri"]);
                    },
                    text: "Repo"
                  }
                ]
              })
        }).catch((error) => {
          atom.notifications.addError('Error: Gem Information Error', {
              detail: error['responseText']
            }
          )
        })
      }else{
        atom.notifications.addError("Error: Local Gem", {
          detail: "This gem is stored locally. Please find this gem via the file path."
        })
      }
    }
  },

  check_gem_maintenance(){
    editor = atom.workspace.getActiveTextEditor();
    if (editor.getPath().endsWith("Gemfile")){
      gem_line = editor.lineTextForBufferRow(editor.getCursorBufferPositions()[0]["row"]).trim();
      if (!gem_line.includes('path')){
        gem_title = gem_line.split(" ")[1].replace(/["',]/g, "");
        detective = new GemDetective;
        gem_details = detective.gem_details(gem_title);
        gem_details.then(function(gem_info){
          version_details = detective.get_version_details(gem_title);
          version_details.then(function(version_info){
            latest_update = version_info[0]["built_at"];
            latest_mod_date = new Date(latest_update);
            warning_date = new Date();
            warning_date.setMonth(warning_date.getMonth() - 6);
            if(latest_mod_date < warning_date){
              atom.notifications.addWarning("Warning: Gem Not Maintained", {
                    detail: "Name: " + gem_title + "\n \nThis Gem has not been updated since:\n" + latest_mod_date +
                            "\n \nThis may indicate that the Gem is no longer maintained.",
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
            }
          }).catch((error) => {
            atom.notifications.addError('Gem Information Error', {
                detail: error['responseText']
              }
            )
          })
        });
      }else{
        atom.notifications.addError("Error: Local Gem", {
          detail: "This gem is stored locally. Please find this gem via the file path."
        })
      }
    }
  },

  all_gem_versions() {
    editor = atom.workspace.getActiveTextEditor();
    if (editor.getPath().endsWith("Gemfile")){
      var gem_lock_file = fs.readFileSync(editor.getPath() + ".lock")
      var gem_file_lines = gem_lock_file.toString().split("\n");
      gems = editor.getBuffer().getLines();
      for (i=0; i < gems.length; i++){
        gem_code = gems[i].split(' ');
        gem_title = gem_code[1];
        if (gem_code[0] == "gem" && !gem_code.includes("path:") && !gem_code.includes("git:")){
          this.cycle_gem_details(gem_title.replace(/["',]/g, ""), gem_file_lines);
        }
      }
    }
  },

  cycle_gem_details(gem_title, gem_lock_lines){
    self = this;
    detective = new GemDetective;
    gem_details = detective.gem_details(gem_title);
    gem_details.then(function(gem_info){
      self.cycle_gem_versions(gem_title, gem_lock_lines, gem_info);
    }).catch((error) => {
      if(error['status'] == 429){
        setTimeout(function(){ self.cycle_gem_details(gem_title, gem_lock_lines); }, 6000);
      }else{
        console.log(error);
        atom.notifications.addError('Gem Information Error', {
          detail: "Gem: " + gem_title + "\n" + error['responseText']
        })
      }
    });
  },

  cycle_gem_versions(gem_title, gem_lock_lines, gem_info){
    self = this;
    detective = new GemDetective;
    version_details = detective.get_version_details(gem_title);
    version_details.then(function(version_info){
      current_version = detective.current_version_finder(gem_title, gem_lock_lines);
      gem_version_list = self.version_list(version_info);
      self.version_checker(gem_title, current_version, gem_version_list, gem_info)
    }).catch((error) => {
      if(error['status'] == 429){
        setTimeout(function(){ self.cycle_gem_versions(gem_title, gem_lock_lines, gem_info); }, 6000);
      }else{
        console.log(error);
        atom.notifications.addError('Gem Information Error', {
          detail: "Gem: " + gem_title + "\n" + error['responseText']
        })
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
