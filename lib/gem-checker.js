'use babel';

import GemCheckerView from './gem-checker-view';
import { CompositeDisposable } from 'atom';
import $ from "jquery";
const fs = require('file-system');
const electron = require('electron')
const BrowserWindow = electron.remote.BrowserWindow;
const GemDetective = require('./gem_detective');
const SummaryWriter = require('./summary_writer');

export default {

  subscriptions: null,

  config: {
    date_warning_threshold: {
      title: 'Out of Date Warning Threshold',
      description: 'Customise the number of versions a RubyGem is behind the latest version, and goes from being declared as "Out of Date" to "Severely Out of Date"',
      type: 'integer',
      default: 5
    },
    maintenance_warning_threshold:{
      title: 'Poor Maintenance Warning Threshold',
      description: 'Customise the number of months a RubyGem has not been maintained for, before it is declared as "Poorly Maintenance"',
      type: 'integer',
      default: 6
    }
  },

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
      'gem-checker:check_gem_maintenance': () => this.check_gem_maintenance(),
      'gem-checker:gemfile_summary': () => this.gemfile_summary(),
      'gem-checker:show_settings': () => this.show_settings()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  show_settings(){
    atom.workspace.open(`atom://config/packages/gem-checker`);
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
            warning_date.setMonth(warning_date.getMonth() - atom.config.get('gem-checker.maintenance_warning_threshold'));
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
            }else{
              atom.notifications.addSuccess("Success: Gem Well Maintained", {
                    detail: "Name: " + gem_title + "\n \n"
                            + "Latest update:\n" + latest_mod_date +
                            "\n \nThis Gem appears to be well maintained!",
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
    } else if(current_version_number >= atom.config.get('gem-checker.date_warning_threshold')){
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
    } else {
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
  },

  gemfile_summary(){
    self = this;
    editor = atom.workspace.getActiveTextEditor();
    path = editor.getPath();
    if(path.endsWith("Gemfile")){
      path_array = path.split("/");
      path_array[path_array.length - 1] = "gem_version_summary.txt";
      file_path = path_array.join("/");
      var gem_lock_file = fs.readFileSync(editor.getPath() + ".lock");
      var gem_lock_lines = gem_lock_file.toString().split("\n");
      gems = editor.getBuffer().getLines();
      self.summarize_gems(gems, gem_lock_lines, file_path);
    }
  },

  summarize_gems(gems, gem_lock_lines, file_path){
    atom.notifications.addInfo("Running Gemfile Summary",
      {detail: "Atom is running the Gemfile Summary.\nPlease wait.."}
    )
    info_gems = [];
    warning_gems = [];
    error_gems = [];
    promises = [];
    for (i=0; i < gems.length; i++){
      gem_code = gems[i].split(' ');
      gem_title = gem_code[1];
      if (gem_code[0] == "gem" && !gem_code.includes("path:") && !gem_code.includes("git:")){
        detective = new GemDetective;
        gem_title = gem_title.replace(/["',]/g, "");
        promises.push(detective.cycle_gem_versions(gem_title).then(function(version_data){
          current_version = detective.current_version_finder(version_data["name"], gem_lock_lines);
          detective = new GemDetective;
          gem_version_list = detective.version_list(version_data["versions"]);
          current_version_number = gem_version_list.indexOf(current_version);
          if(current_version_number == 0){
            // do nothing
          } else if(current_version_number == 1){
            info_gems.push({name: version_data["name"], current_version: current_version, latest_version: gem_version_list[0], num_out_of_date: current_version_number});
          } else if(current_version_number >= atom.config.get('gem-checker.date_warning_threshold')){
            error_gems.push({name: version_data["name"], current_version: current_version, latest_version: gem_version_list[0], num_out_of_date: current_version_number});
          } else {
            warning_gems.push({name: version_data["name"], current_version: current_version, latest_version: gem_version_list[0], num_out_of_date: current_version_number});
          }
        }).catch(function(error){
          console.log(error);
        }));
      }
    }
    Promise.all(promises).then(function(){
      problem_gems = (info_gems.length + warning_gems.length + error_gems.length)
      if(problem_gems == 0){
      }else{
        summary_writer = new SummaryWriter;
        summary_writer.create_gem_summary_file(file_path);
        summary_writer.write_gem_summary_to_file(file_path, info_gems, "\n======================\nNew Versions Available\n======================\n");
        summary_writer.write_gem_summary_to_file(file_path, warning_gems, "\n======================\nGems 2 - " + (atom.config.get('gem-checker.date_warning_threshold') - 1) + " Versions Out of Date\n======================\n");
        summary_writer.write_gem_summary_to_file(file_path, error_gems, "\n======================\nGems " + atom.config.get('gem-checker.date_warning_threshold') + "+ Versions Out of Date\n======================\n");
        atom.notifications.addWarning("Warning: Summary Completed - Out of Date Gems", {
          detail: problem_gems + " Gems are out of date with the latest versions.\n \n" +
                  info_gems.length + " :New Version Available\n" +
                  warning_gems.length + " :2 - " + (atom.config.get('gem-checker.date_warning_threshold') - 1) + " Versions Out of Date\n" +
                  error_gems.length + " :" + atom.config.get('gem-checker.date_warning_threshold') + " or more Versions Out of Date\n \n" +
                  "Please view the gem_version_summary.txt file or view your applications Gemfile.",
          dismissable: true
        });
      }
    });
  }
};
