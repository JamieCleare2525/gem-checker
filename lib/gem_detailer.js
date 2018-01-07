'use babel';

import { CompositeDisposable } from 'atom';
import $ from "jquery";

module.exports = class GemDetailer{

  get_gem_details(gem){
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
}
