'use babel';

import { CompositeDisposable } from 'atom';
import $ from "jquery";

module.exports = class GemDetective{

  get_gem_details(gem_title){
    return new Promise(function(resolve, reject) {
      details_url = "https://rubygems.org/api/v1/gems/" + gem_title + ".json";
      $.ajax({url: details_url,
              type: "GET",
              success: function(data, status, xhr) {
                if(xhr.status == 200){
                  console.log(data);
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
                  console.log(data);
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
}
