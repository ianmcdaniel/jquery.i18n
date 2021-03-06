/*
 * jQuery i18n Plugin
 * version: 0.1 (2010-04-23)
 *
 * Copyright (C) 2010 Ian McDaniel
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation, version 2.1
 * of the License.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 */


(function($) {

  var default_locale    = "en";
  var translations_path = "translations/";

  // Make sure translations object exists
  $.translations = $.translations || {};

  // i18n Constuructor
  var i18n = function() {
    $.extend(this,{
      locale            : default_locale,
      translations_path : translations_path
    })
  }

  /**
   * Load a translation file
   *
   * The given locale will be used to find the correct translation file at the translation_path.
   * A callback is fired once the file is returned successfully
   */
  i18n.prototype.loadLocale = function(locale,callback) {
    $.ajax({
      dataType:'script',
      url: this.translations_path + locale + ".js",
      success: callback,
      error:function(){
        $.error('translation file not found')
      }
    });
  }


  /**
   * Switch Langauage
   *
   * Loads translations from a file if they are not already loaded then sets the
   * new langaguage as the current locale and translates the page. A callback can be
   * passed.
   */
  i18n.prototype.changeLocale = function(locale,callback) {
    if(!$.translations[locale]) {
      var self = this;
      this.loadLocale(locale,function(){
        self.locale = locale;
        self.translatePage();
        if(callback) callback();
      })
    } else {
      this.locale = locale;
      this.translatePage();
      if(callback) callback();
    }
  }


  /**
   * Translate Page
   *
   * Finds all previously translated elements on the page and translates them to
   * the current language making sure to
   */
  i18n.prototype.translatePage = function() {
    var self = this;
    $('.translation').each(function(index, el){
      var new_tr = self.translate($(el).attr('translation_key'),$(el).attr('translation_data'),true);
      (new_tr.missing) ?  $(el).addClass('missing') : $(el).removeClass('missing');
      $(el).text(new_tr.text);
    })
  }


  /**
   * Translate
   *
   * The core translation method. The KEY is a uniquie id to your translation. DATA
   * should be an object used to build the translated text. The method returns an
   * object with a text string of the actual translated text, an html string of the
   * translated text wrapped in a span element (needed to translate page into a
   * separate language) and a missing flag to indicate if a translation was found.
   */
  i18n.prototype.translate = function(key, data) {
    var translated, translation_obj, missing = false;
    if(data && typeof data == 'string') data = $.evalJSON(data);

    if($.translations[this.locale]) {
      translated = this.getEntry(key);
    }

    if (!translated) {
      translated = key;
      missing = true;
    } else {
      if (data) {
        if(data.count || data.count === 0) translated = this.pluralize(key, translated, data["count"]);

        if(typeof translated == 'string') {
          for (var p in data) {
            
            var re = new RegExp('\\\{\\\{(' + p + '|' + p + ' .+)\\\}\\\}', 'g');
            translated = translated.replace(re, function(match,text){
              var args = text.split(' ');
              if(args.length>1) {
                if(data[args[0]] && typeof data[args[0]] == 'function') {
                  return data[args.shift()](args.join(' '))
                } else {
                  missing = true;
                  return match;
                }
              } else {
                return data[p];
              }
            });
          };
        } else {
          translated = key;
          missing = true;
        }
      };
    }

    var tk = "translation_key='" + key + "'";
    var td = (data) ? "translation_data='" + $.toJSON(data) + "'" : "";
    var mc = (missing) ? "missing" : "";

    translation_obj = {
      text:translated,
      html:"<span class='translation " + mc + "' " + tk + " " + td + ">" + translated + "</span>",
      missing:missing
    }
    translation_obj.node = $(translation_obj.html);
    return translation_obj;
  }

  // Parse through the dot notation to get the correct entry
  i18n.prototype.getEntry = function(key) {
    var ns = key.split('.');
    var i, l = ns.length;
    var base = $.translations[this.locale];
    for (i = 0; i < l; i++) {
      if (typeof(base[ns[i]]) == 'undefined') return false;
      base = base[ns[i]];
    }
    return base;
  }


  /**
   * Pluralize
   *
   * The correct translation will be selected depending on the given COUNT. Separate
   * translations can be made for a count of "zero", "one" and "other".
   *
   * TODO: Add support for additional grammatical number types (Dual, Trial, Paucal)
   */
  i18n.prototype.pluralize = function(key, entry, count) {
    if(!entry || typeof(entry) != 'object') return key;
    var count_key = (count==0) ? "zero" : (count==1) ? "one" : "other";
    if (entry[count_key]) {
      return entry[count_key];
    } else {
      return key;
    }
  }



  // create the i18n object in jQuery namespace
  $.i18n = new i18n();

  // wrapper for i18n.translate, returns html string
  $.t = function(key,data,type) {
    type = type || 'html';
    if(!type.match(/^text$|^html$|^node$/)) {
      $.error('Type not supported, try "html","text" or "node".');
      type = 'html'
    }
    return $.i18n.translate(key,data)[type];
  }

  // translates text in all selected DOM node to current language
  $.fn.t = function(data,type) {
    type = type || 'html';
    return this.each(function() {
      var t = $(this).text();
      $(this).empty().html($.i18n.translate(t,data)[type]);
    });
  }


})(jQuery);






























