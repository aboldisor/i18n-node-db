/**
 * @author      Created by Boldisor Andrian <aboldisor@gmail.com> on 2013-11-26.
 * @link        https://github.com/aboldisor
 * @license     http://opensource.org/licenses/MIT
 *
 * @version     0.0.1
 */


//TODO lib ... documentation

// dependencies and "private" vars
var vsprintf, fs, url, path, debug, warn, error, DBlanguage, LangWorker, locales, api, pathsep, defaultLocale, cookiename, connectionString, registredLocales, dbLang, langProcesor;
vsprintf = require('sprintf').vsprintf;
fs = require('fs');
url = require('url');
path = require('path');
debug = require('debug')('i18n:debug');
warn = require('debug')('i18n:warn');
error = require('debug')('i18n:error');
DBlanguage = require('./lib/language');
LangWorker = require('./lib/langWorker');
locales = {};
api = ['__', '__n', 'getLocale', 'setLocale', 'getCatalog', 'addText', 'updateText', 'updateSpecificText', 'deleteText'];
pathsep = path.sep || '/';



// / public exports
var i18n = exports;


i18n.version = '0.0.1';


i18n.addText = function i18nAddText(langKey,valuesObj) {
   langProcesor.addText(langKey,valuesObj);
    reloadLocales();

};

i18n.updateText = function i18nUpdateText(langKey,valuesObj){
    langProcesor.updateText(langKey,valuesObj);
    reloadLocales();

};


i18n.updateSpecificText = function i18nUpdateSpecificText(language ,key, newValues){
    langProcesor.updateSpecificText(language ,key, newValues);
    reloadLocales();

};

i18n.deleteText = function i18ndeleteText(key) {
    langProcesor.deleteText(key);
    reloadLocales();

};


i18n.configure = function i18nConfigure(opt) {

  // you may register helpers in global scope, up to you
  if (typeof opt.register === 'object') {
    applyAPItoObject(opt.register);
  }

  // sets a custom cookie name to parse locale settings from
  cookiename = (typeof opt.cookie === 'string') ? opt.cookie : null;


    dbLang = new DBlanguage();

    if(typeof opt.connectionString =='string'){
        connectionString = opt.connectionString
    } else {
        throw new Error('need to set connection to db in i18n.configure {connectionString : connection to db string}');
    }
   dbLang.createConnection(connectionString);

  // setting defaultLocale
  defaultLocale = (typeof opt.defaultLocale === 'string') ? opt.defaultLocale : 'en';



  if (typeof opt.locales === 'object') {
      registredLocales = opt.locales;
      opt.locales.forEach(function (l) {
        rdb(l);

    });
  }

    langProcesor = new LangWorker(dbLang);

};

i18n.init = function i18nInit(request, response, next) {
  if (typeof request === 'object') {
    guessLanguage(request);

    if (typeof response === 'object') {
      applyAPItoObject(request, response);

      // register locale to res.locals so hbs helpers know this.locale
      if (!response.locale) response.locale = request.locale;

      if (response.locals) {
        applyAPItoObject(request, response.locals);

        // register locale to res.locals so hbs helpers know this.locale
        if (!response.locals.locale) response.locals.locale = request.locale;
      }
    }
  }

    if (typeof next === 'function')  next();
};

i18n.__ = function i18nTranslate(phrase) {
  var msg;

  // called like __({phrase: "Hello", locale: "en"})
  if (typeof phrase === 'object') {
    if (typeof phrase.locale === 'string' && typeof phrase.phrase === 'string') {
      msg = translate(phrase.locale, phrase.phrase);
    }
  }
  // called like __("Hello")
  else {
    // get translated message with locale from scope (deprecated) or object


    msg = translate(getLocaleFromObject(this), phrase);
  }

  // if we have extra arguments with strings to get replaced,
  // an additional substition injects those strings afterwards
  if (arguments.length > 1) {
    msg = vsprintf(msg, Array.prototype.slice.call(arguments, 1));
  }
  return msg;
};
//NOt eat implemented plural form
//i18n.__n = function i18nTranslatePlural(singular, plural, count) {
//  var msg;
//
//  // called like __n({singular: "%s cat", plural: "%s cats", locale: "en"}, 3)
//  if (typeof singular === 'object') {
//    if (typeof singular.locale === 'string' && typeof singular.singular === 'string' && typeof singular.plural === 'string') {
//      msg = translate(singular.locale, singular.singular, singular.plural);
//    }
//    if(typeof plural === 'number'){
//      count = plural;
//    }
//
//    // called like __n({singular: "%s cat", plural: "%s cats", locale: "en", count: 3})
//    if(typeof singular.count === 'number' || typeof singular.count === 'string'){
//      count = singular.count;
//    }
//  }
//  // called like __n('%s cat', '%s cats', 3)
//  else {
//    // get translated message with locale from scope (deprecated) or object
//    msg = translate(getLocaleFromObject(this), singular, plural);
//  }
//  // parse translation and replace all digets '%d' by `count`
//  // this also replaces extra strings '%%s' to parseble '%s' for next step
//  // simplest 2 form implementation of plural, like https://developer.mozilla.org/en/docs/Localization_and_Plurals#Plural_rule_.231_.282_forms.29
//  if (parseInt(count, 10) > 1) {
//    msg = vsprintf(msg.other, [count]);
//  } else {
//    msg = vsprintf(msg.one, [count]);
//  }
//
//  // if we have extra arguments with strings to get replaced,
//  // an additional substition injects those strings afterwards
//  if (arguments.length > 3) {
//    msg = vsprintf(msg, Array.prototype.slice.call(arguments, 3));
//  }
//
//  return msg;
//};

i18n.setLocale = function i18nSetLocale(locale_or_request, locale) {
  var target_locale = locale_or_request,
      request;

  // called like setLocale(req, 'en')
  if (locale_or_request && typeof locale === 'string' && locales[locale]) {
    request = locale_or_request;
    target_locale = locale;
  }

  // called like req.setLocale('en')
  if (locale === undefined && typeof this.locale === 'string' && typeof locale_or_request === 'string') {
    request = this;
    target_locale = locale_or_request;
  }

  if (locales[target_locale]) {

    // called like setLocale('en')
    if (request === undefined) {
      defaultLocale = target_locale;
    }
    else {
      request.locale = target_locale;
    }
  }
  return i18n.getLocale(request);
};

i18n.getLocale = function i18nGetLocale(request) {

  // called like getLocale(req)
  if (request && request.locale) {
    return request.locale;
  }

  // called like req.getLocale()
  if (request === undefined && typeof this.locale === 'string') {
    return this.locale;
  }

  // called like getLocale()
  return defaultLocale;
};

i18n.getCatalog = function i18nGetCatalog(locale_or_request, locale) {
  var target_locale = locale_or_request;

  // called like getCatalog(req)
  if (typeof locale_or_request === 'object' && typeof locale_or_request.locale === 'string') {
    target_locale = locale_or_request.locale;
  }

  // called like getCatalog(req, 'en')
  if (typeof locale_or_request === 'object' && typeof locale === 'string') {
    target_locale = locale;
  }

  // called like req.getCatalog()
  if (locale === undefined && typeof this.locale === 'string') {
    target_locale = this.locale;
  }

  // called like req.getCatalog('en')
  if (locale === undefined && typeof locale_or_request === 'string') {
    target_locale = locale_or_request;
  }

  // called like getCatalog()
  if (target_locale === undefined || target_locale === '') {
    return locales;
  }

  if (locales[target_locale]) {
    return locales[target_locale];
  } else {
    logWarn('No catalog found for "' + target_locale + '"');
    return false;
  }
};

i18n.overrideLocaleFromQuery = function (req) {
  if (req === null) {
    return;
  }
  var urlObj = url.parse(req.url, true);
  if (urlObj.query.locale) {
    logDebug("Overriding locale from query: " + urlObj.query.locale);
    i18n.setLocale(req, urlObj.query.locale.toLowerCase());
  }
};

// ===================
// = private methods =
// ===================
/**
 * registers all public API methods to a given response object when not already declared
 */

function applyAPItoObject(request, response) {

  // attach to itself if not provided
  var object = response || request;
  api.forEach(function (method) {

    // be kind rewind, or better not touch anything already exiting
    if (!object[method]) {
      object[method] = function () {
        return i18n[method].apply(request, arguments);
      };
    }
  });
}

/**
 * guess language setting based on http headers
 */

function guessLanguage(request) {
  if (typeof request === 'object') {
    var language_header = request.headers['accept-language'],
        languages = [],
        regions = [];

    request.languages = [defaultLocale];
    request.regions = [defaultLocale];
    request.language = defaultLocale;
    request.region = defaultLocale;

    if (language_header) {
      language_header.split(',').forEach(function (l) {
        var header = l.split(';', 1)[0],
            lr = header.split('-', 2);
        if (lr[0]) {
          languages.push(lr[0].toLowerCase());
        }
        if (lr[1]) {
          regions.push(lr[1].toLowerCase());
        }
      });

      if (languages.length > 0) {
        request.languages = languages;
        request.language = languages[0];
      }

      if (regions.length > 0) {
        request.regions = regions;
        request.region = regions[0];
      }
    }

    // setting the language by cookie
    if (cookiename && request.cookies && request.cookies[cookiename]) {
      request.language = request.cookies[cookiename];
    }

    i18n.setLocale(request, request.language);
  }
}

/**
 * searches for locale in given object
 */

function getLocaleFromObject(obj) {

    if (obj && obj.scope) {
      var locale = obj.scope.locale;
  }
  if (obj && obj.locale) {
    locale = obj.locale;
  }
  return locale;
}

/**
 * read locale file, translate a msg and write to fs if new
 * function translate(locale, singular, plural) { Will be on implementation plural form future
 */

function translate(locale, key){
  if (locale === undefined) {
    logWarn("WARN: No locale found - check the context of the call to __(). Using " + defaultLocale + " as current locale");
    locale = defaultLocale;
  }

  // attempt to read when defined as valid locale
  if (!locales[locale]) {
    rdb(locale);
  }

  // fallback to default when missed
  if (!locales[locale]) {
    logWarn("WARN: Locale " + locale + " couldn't be read - check the context of the call to $__. Using " + defaultLocale + " (default) as current locale");
    locale = defaultLocale;
    rdb(locale);

  }

   if (Object.keys(locales).length == 0){

       return key;
   }

  return locales[locale][key];
}

/**
 * try reading a file
 */
function rdb(locale){

    dbLang.setLanguage(locale);

   try {
        dbModel = dbLang.getModelByName(locale);
        dbLang.queryAll(dbModel,function(callback){
        locales[locale] = callback;
    });


    }catch (readError){
           writedb(locale)
    }

}

function writedb (locale){
    dbLang.setLanguage(locale);
    rdb(locale);
}


function reloadLocales(){
    registredLocales.forEach(function (l) {
        rdb(l);
    });

}


/**
 * Logging proxies
 */

function logDebug(msg) {
  debug(msg);
}

function logWarn(msg) {
  warn(msg);
}

function logError(msg) {
  error(msg);
}
