'use babel';

import { CompositeDisposable } from 'atom';
import $ from "jquery";
const fs = require('file-system');

module.exports = class SummaryWriter{

  write_gem_summary_to_file(file_path, gem_summary, subtitle){
    try {
      fs.appendFileSync(file_path, subtitle);
    } catch (error) {
      console.log(error);
    }
    for(i = 0; i < gem_summary.length; i++){
      gem_text = "Name: " + gem_summary[i]["name"] +
                 "\nCurrent Version: " + gem_summary[i]["current_version"] +
                 "\nLatest Version: " + gem_summary[i]["latest_version"] +
                 "\nVersions Behind: " +  gem_summary[i]["num_out_of_date"] + "\n \n";
      try {
        fs.appendFileSync(file_path, gem_text);
      } catch (error) {
        console.log(error);
      }
    }
  }

  create_gem_summary_file(file_path){
    try {
      fs.writeFileSync(file_path, "Gem Summary\n");
    } catch (error) {
      atom.notifications.addError("Error: Unable to Create Summary Report", {
        detail: "A problem occurred when generating the Summary Report.\n \n" +
                "Error:" + error,
        dismissable: true
      });
    }
  }

  warning_highlight(row, warning_class, enable_highlights){
    if(enable_highlights){
      range = editor.getBuffer().rangeForRow(row);
      marker = editor.markBufferRange(range, {invalidate: 'inside'});
      decoration = editor.decorateMarker(marker, {type: 'line', class: warning_class});
    }
  }
}
