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
                 "Versions Behind: " +  gem_summary[i]["num_out_of_date"] + "\n \n";
      try {
        fs.appendFileSync(file_path, gem_text);
      } catch (error) {
        console.log(error);
      }
    }
  }
}
