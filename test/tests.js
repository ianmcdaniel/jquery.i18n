/*
 * Unit Tests for jQuery.i18n
 *
 * Copyright (C) 2010 Ian McDaniel
 *
 */

;(function($) {
    $(document).ready(function() {
        module('Plugin Registration');
        test('$.i18n is registered', function() {
          expect(1);
          ok($.i18n, '$.i18n is ' + $.i18n);
        });

        test('$.i18n default properties exist', function() {
          expect(2);
          ok($.i18n.locale, '$.i18n.locale is "' + $.i18n.locale + '"');
          ok($.i18n.translations_path, '$.i18n.translations_path is "' + $.i18n.translations_path + '"');
        });

        test('$.translations is registered', function() {
          expect(1);
          ok($.translations, '$.translations is ' + $.translations);
        });


        test('$.t is registered', function() {
          expect(1);
          ok($.t, '$.t is ' + $.t);
        });

        test('$.fn.t is registered', function() {
          expect(1);
          ok($.fn.t, '$.fn.t is ' + $.fn.t);
        });

        module('Translation');
        test('Basic $.t call', function() {
          expect(1);

          $.translations['en'] = {
            hello_world:"Hello World"
          }

          var translated_text = $.t('hello_world');
          equals($(translated_text).text(), "Hello World");
        });

        test('Basic $.fn.t call', function() {
          expect(1);

          $.translations['en'] = {
            hello_world:"Hello World"
          }

          var container = $('<div>hello_world</div>');
          container.t();
          equals($(container).text(), "Hello World");
        });

        test('$.fn.t call to multiple matches', function() {
          expect(2);

          $.translations['en'] = {
            hello_world:"Hello World"
          }

          var container = $(
              '<div>' +
              '  <div class="c">hello_world</div>' +
              '  <div class="c">hello_world</div>' +
              '</div>');

          $('div.c', container).t();
          $('div.c', container).each(function(i,el) {
            equals($(el).text(), 'Hello World');
          });
        });

        test('Passing data', function() {
          expect(2);

          $.translations['en'] = {
            welcome:"Welcome {{name}}"
          }

          var data = {name:'John Smith'};
          var translated_text = $.t('welcome',data);
          equals($(translated_text).text(), "Welcome John Smith", "$.t call");

          var container = $('<div>welcome</div>');
          container.t(data);
          equals($(container).text(), "Welcome John Smith","$.fn.t call");
        });

        test('Pluralization', function() {
          expect(3);

          $.translations['en'] = {}
          $.translations['en'].how_many_items = {
            'zero':"I have no items",
            'one':"I have one item",
            'other':"I have {{count}} items"
          }

          var translated_text = $.t('how_many_items',{count:0});
          equals($(translated_text).text(), "I have no items", "0");

          var translated_text = $.t('how_many_items',{count:1});
          equals($(translated_text).text(), "I have one item", "1");

          var translated_text = $.t('how_many_items',{count:50});
          equals($(translated_text).text(), "I have 50 items", "50");

        });

        test('Switch Language', function() {
          expect(2);

          $.translations['en'] = {
            hello_world:"Hello World"
          }

          $.translations['es'] = {
            hello_world:"Hola Mundo"
          }

          var container = $('<div></div>');
          var translated_text = $.t('hello_world');
          container.append(translated_text);
          $('body').append(container)

          equals($(container).text(), "Hello World");
          $.i18n.changeLocale('es')
          equals($(container).text(), "Hola Mundo");
          container.remove()
        });

        test('Switch Language with data', function() {
          expect(2);


          $.translations['en'] = {
            welcome:"Welcome {{name}}"
          }

          $.translations['es'] = {
            welcome:"Bienvenido {{name}}"
          }

          $.i18n.changeLocale('es')

          var container = $('<div></div>');
          var translated_text = $.t('welcome',{name:'John Smith'});
          container.append(translated_text);
          $('body').append(container)

          equals($(container).text(), "Bienvenido John Smith");
          $.i18n.changeLocale('en')
          equals($(container).text(), "Welcome John Smith");
          container.remove()
        });


        test('Load Language file', function() {
          expect(2);
          stop()
          $.i18n.changeLocale('fr',function(){
            ok($.translations['fr'], "$.translations['fr'] is " + $.translations['fr']);

            var translated_text = $.t('hello_world');
            equals($(translated_text).text(), "Bonjour tout le monde");

            start()
          })
        });

    });
}(jQuery));
