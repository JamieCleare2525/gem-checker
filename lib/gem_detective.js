'use babel';

import { CompositeDisposable } from 'atom';
import $ from "jquery";

module.exports = class GemDetective{

  gem_details(gem_title){
    return new Promise(function(resolve, reject) {
      details_url = "https://rubygems.org/api/v1/gems/" + gem_title + ".json";
      $.ajax({url: details_url,
              type: "GET",
              success: function(data, status, xhr) {
                if(xhr.status == 200){
                  resolve(data);
                }else{
                  reject(xhr);
                }
              },
              error: function(xhr, status) {
                reject(xhr);
              }
            });
    });
  }

  get_version_details(gem_title){
    return new Promise(function(resolve, reject) {
      details_url = "https://rubygems.org/api/v1/versions/" + gem_title + ".json";
      $.ajax({url: details_url,
              type: "GET",
              success: function(data, status, xhr) {
                if(xhr.status == 200){
                  resolve(data);
                }else{
                  reject(xhr);
                }
              },
              error: function(xhr, status) {
                reject(xhr);
              }
            });
    });
  }

  current_version_finder(gem_title, lock_gems){
    current_version = "Current Version Not Found";
    regex_string = gem_title + '\\s\\([\\d.]*[pre]*\\)';
    regex = new RegExp(regex_string, 'gi');
    for(i=0; i < lock_gems.length; i++){
      gem_lock_code = lock_gems[i].trim().split(" ");
      if(lock_gems[i].trim().match(regex) && gem_lock_code[0] == gem_title){
        current_version = gem_lock_code[1].replace(/\(|\)/g, '');
        break;
      }
    }
    return current_version;
  }

  version_list(gem_info){
    gem_versions = [];
    for(i=0; i < gem_info.length; i++){
      gem_versions.push(gem_info[i]["number"]);
    }
    return gem_versions;
  }

  cycle_gem_versions(gem_title, wait = false){
    self = this;
    if(wait){
      setTimeout(function(){}, 6000);
    }
    return new Promise(function(resolve, reject) {
      details_url = "https://rubygems.org/api/v1/versions/" + gem_title + ".json";
      $.ajax({url: details_url,
              type: "GET",
              success: function(data, status, xhr) {
                if(xhr.status == 200){
                  resolve({versions: data, name: gem_title});
                }else{
                  reject({xhr:xhr, name: gem_title});
                }
              },
              error: function(xhr, status) {
                if(xhr.status == 429){
                  resolve(self.cycle_gem_versions(gem_title, true));
                }else{
                  reject({xhr:xhr, name: gem_title});
                }
              }
            });
    });
  }
}
