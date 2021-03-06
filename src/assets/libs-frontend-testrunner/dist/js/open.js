/**
 * @license text 2.0.15 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/text/LICENSE
 */
/*jslint regexp: true */
/*global require, XMLHttpRequest, ActiveXObject,
  define, window, process, Packages,
  java, location, Components, FileUtils */

define('text',['module'], function (module) {
    'use strict';

    var text, fs, Cc, Ci, xpcIsWindows,
        progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
        xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
        bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
        hasLocation = typeof location !== 'undefined' && location.href,
        defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
        defaultHostName = hasLocation && location.hostname,
        defaultPort = hasLocation && (location.port || undefined),
        buildMap = {},
        masterConfig = (module.config && module.config()) || {};

    function useDefault(value, defaultValue) {
        return value === undefined || value === '' ? defaultValue : value;
    }

    //Allow for default ports for http and https.
    function isSamePort(protocol1, port1, protocol2, port2) {
        if (port1 === port2) {
            return true;
        } else if (protocol1 === protocol2) {
            if (protocol1 === 'http') {
                return useDefault(port1, '80') === useDefault(port2, '80');
            } else if (protocol1 === 'https') {
                return useDefault(port1, '443') === useDefault(port2, '443');
            }
        }
        return false;
    }

    text = {
        version: '2.0.15',

        strip: function (content) {
            //Strips <?xml ...?> declarations so that external SVG and XML
            //documents can be added to a document without worry. Also, if the string
            //is an HTML document, only the part inside the body tag is returned.
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            } else {
                content = "";
            }
            return content;
        },

        jsEscape: function (content) {
            return content.replace(/(['\\])/g, '\\$1')
                .replace(/[\f]/g, "\\f")
                .replace(/[\b]/g, "\\b")
                .replace(/[\n]/g, "\\n")
                .replace(/[\t]/g, "\\t")
                .replace(/[\r]/g, "\\r")
                .replace(/[\u2028]/g, "\\u2028")
                .replace(/[\u2029]/g, "\\u2029");
        },

        createXhr: masterConfig.createXhr || function () {
            //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
            var xhr, i, progId;
            if (typeof XMLHttpRequest !== "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject !== "undefined") {
                for (i = 0; i < 3; i += 1) {
                    progId = progIds[i];
                    try {
                        xhr = new ActiveXObject(progId);
                    } catch (e) {}

                    if (xhr) {
                        progIds = [progId];  // so faster next time
                        break;
                    }
                }
            }

            return xhr;
        },

        /**
         * Parses a resource name into its component parts. Resource names
         * look like: module/name.ext!strip, where the !strip part is
         * optional.
         * @param {String} name the resource name
         * @returns {Object} with properties "moduleName", "ext" and "strip"
         * where strip is a boolean.
         */
        parseName: function (name) {
            var modName, ext, temp,
                strip = false,
                index = name.lastIndexOf("."),
                isRelative = name.indexOf('./') === 0 ||
                             name.indexOf('../') === 0;

            if (index !== -1 && (!isRelative || index > 1)) {
                modName = name.substring(0, index);
                ext = name.substring(index + 1);
            } else {
                modName = name;
            }

            temp = ext || modName;
            index = temp.indexOf("!");
            if (index !== -1) {
                //Pull off the strip arg.
                strip = temp.substring(index + 1) === "strip";
                temp = temp.substring(0, index);
                if (ext) {
                    ext = temp;
                } else {
                    modName = temp;
                }
            }

            return {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },

        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

        /**
         * Is an URL on another domain. Only works for browser use, returns
         * false in non-browser environments. Only used to know if an
         * optimized .js version of a text resource should be loaded
         * instead.
         * @param {String} url
         * @returns Boolean
         */
        useXhr: function (url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort,
                match = text.xdRegExp.exec(url);
            if (!match) {
                return true;
            }
            uProtocol = match[2];
            uHostName = match[3];

            uHostName = uHostName.split(':');
            uPort = uHostName[1];
            uHostName = uHostName[0];

            return (!uProtocol || uProtocol === protocol) &&
                   (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
                   ((!uPort && !uHostName) || isSamePort(uProtocol, uPort, protocol, port));
        },

        finishLoad: function (name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content;
            if (masterConfig.isBuild) {
                buildMap[name] = content;
            }
            onLoad(content);
        },

        load: function (name, req, onLoad, config) {
            //Name has format: some.module.filext!strip
            //The strip part is optional.
            //if strip is present, then that means only get the string contents
            //inside a body tag in an HTML string. For XML/SVG content it means
            //removing the <?xml ...?> declarations so the content can be inserted
            //into the current doc without problems.

            // Do not bother with the work if a build and text will
            // not be inlined.
            if (config && config.isBuild && !config.inlineText) {
                onLoad();
                return;
            }

            masterConfig.isBuild = config && config.isBuild;

            var parsed = text.parseName(name),
                nonStripName = parsed.moduleName +
                    (parsed.ext ? '.' + parsed.ext : ''),
                url = req.toUrl(nonStripName),
                useXhr = (masterConfig.useXhr) ||
                         text.useXhr;

            // Do not load if it is an empty: url
            if (url.indexOf('empty:') === 0) {
                onLoad();
                return;
            }

            //Load the text. Use XHR if possible and in a browser.
            if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
                text.get(url, function (content) {
                    text.finishLoad(name, parsed.strip, content, onLoad);
                }, function (err) {
                    if (onLoad.error) {
                        onLoad.error(err);
                    }
                });
            } else {
                //Need to fetch the resource across domains. Assume
                //the resource has been optimized into a JS module. Fetch
                //by the module name + extension, but do not include the
                //!strip part to avoid file system issues.
                req([nonStripName], function (content) {
                    text.finishLoad(parsed.moduleName + '.' + parsed.ext,
                                    parsed.strip, content, onLoad);
                });
            }
        },

        write: function (pluginName, moduleName, write, config) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName,
                               "define(function () { return '" +
                                   content +
                               "';});\n");
            }
        },

        writeFile: function (pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName),
                extPart = parsed.ext ? '.' + parsed.ext : '',
                nonStripName = parsed.moduleName + extPart,
                //Use a '.js' file name so that it indicates it is a
                //script that can be loaded across domains.
                fileName = req.toUrl(parsed.moduleName + extPart) + '.js';

            //Leverage own load() method to load plugin value, but only
            //write out values that do not have the strip argument,
            //to avoid any potential issues with ! in file names.
            text.load(nonStripName, req, function (value) {
                //Use own write() method to construct full module value.
                //But need to create shell that translates writeFile's
                //write() to the right interface.
                var textWrite = function (contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function (moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                };

                text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    };

    if (masterConfig.env === 'node' || (!masterConfig.env &&
            typeof process !== "undefined" &&
            process.versions &&
            !!process.versions.node &&
            !process.versions['node-webkit'] &&
            !process.versions['atom-shell'])) {
        //Using special require.nodeRequire, something added by r.js.
        fs = require.nodeRequire('fs');

        text.get = function (url, callback, errback) {
            try {
                var file = fs.readFileSync(url, 'utf8');
                //Remove BOM (Byte Mark Order) from utf8 files if it is there.
                if (file[0] === '\uFEFF') {
                    file = file.substring(1);
                }
                callback(file);
            } catch (e) {
                if (errback) {
                    errback(e);
                }
            }
        };
    } else if (masterConfig.env === 'xhr' || (!masterConfig.env &&
            text.createXhr())) {
        text.get = function (url, callback, errback, headers) {
            var xhr = text.createXhr(), header;
            xhr.open('GET', url, true);

            //Allow plugins direct access to xhr headers
            if (headers) {
                for (header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        xhr.setRequestHeader(header.toLowerCase(), headers[header]);
                    }
                }
            }

            //Allow overrides specified in config
            if (masterConfig.onXhr) {
                masterConfig.onXhr(xhr, url);
            }

            xhr.onreadystatechange = function (evt) {
                var status, err;
                //Do not explicitly handle errors, those should be
                //visible via console output in the browser.
                if (xhr.readyState === 4) {
                    status = xhr.status || 0;
                    if (status > 399 && status < 600) {
                        //An http 4xx or 5xx error. Signal an error.
                        err = new Error(url + ' HTTP status: ' + status);
                        err.xhr = xhr;
                        if (errback) {
                            errback(err);
                        }
                    } else {
                        callback(xhr.responseText);
                    }

                    if (masterConfig.onXhrComplete) {
                        masterConfig.onXhrComplete(xhr, url);
                    }
                }
            };
            xhr.send(null);
        };
    } else if (masterConfig.env === 'rhino' || (!masterConfig.env &&
            typeof Packages !== 'undefined' && typeof java !== 'undefined')) {
        //Why Java, why is this so awkward?
        text.get = function (url, callback) {
            var stringBuffer, line,
                encoding = "utf-8",
                file = new java.io.File(url),
                lineSeparator = java.lang.System.getProperty("line.separator"),
                input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
                content = '';
            try {
                stringBuffer = new java.lang.StringBuffer();
                line = input.readLine();

                // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
                // http://www.unicode.org/faq/utf_bom.html

                // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
                // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
                if (line && line.length() && line.charAt(0) === 0xfeff) {
                    // Eat the BOM, since we've already found the encoding on this file,
                    // and we plan to concatenating this buffer with others; the BOM should
                    // only appear at the top of a file.
                    line = line.substring(1);
                }

                if (line !== null) {
                    stringBuffer.append(line);
                }

                while ((line = input.readLine()) !== null) {
                    stringBuffer.append(lineSeparator);
                    stringBuffer.append(line);
                }
                //Make sure we return a JavaScript string and not a Java string.
                content = String(stringBuffer.toString()); //String
            } finally {
                input.close();
            }
            callback(content);
        };
    } else if (masterConfig.env === 'xpconnect' || (!masterConfig.env &&
            typeof Components !== 'undefined' && Components.classes &&
            Components.interfaces)) {
        //Avert your gaze!
        Cc = Components.classes;
        Ci = Components.interfaces;
        Components.utils['import']('resource://gre/modules/FileUtils.jsm');
        xpcIsWindows = ('@mozilla.org/windows-registry-key;1' in Cc);

        text.get = function (url, callback) {
            var inStream, convertStream, fileObj,
                readData = {};

            if (xpcIsWindows) {
                url = url.replace(/\//g, '\\');
            }

            fileObj = new FileUtils.File(url);

            //XPCOM, you so crazy
            try {
                inStream = Cc['@mozilla.org/network/file-input-stream;1']
                           .createInstance(Ci.nsIFileInputStream);
                inStream.init(fileObj, 1, 0, false);

                convertStream = Cc['@mozilla.org/intl/converter-input-stream;1']
                                .createInstance(Ci.nsIConverterInputStream);
                convertStream.init(inStream, "utf-8", inStream.available(),
                Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

                convertStream.readString(inStream.available(), readData);
                convertStream.close();
                inStream.close();
                callback(readData.value);
            } catch (e) {
                throw new Error((fileObj && fileObj.path || '') + ': ' + e);
            }
        };
    }
    return text;
});


define('text!../test/layouts/oe-image.html',[],function () { return '{{#with content}}\r\n<div class="activity-body oe-body">   \r\n    <h2><strong>{{getAdapterParams "activityName"}}</strong></h2>   \r\n    <div class="smart-form">\r\n        <p class="question-text">\r\n            {{#each canvas.data.questiondata}} \r\n                {{{this.text}}}\r\n            {{/each}}\r\n        </p>\r\n        <p class="instructions">{{{directions}}} </p>\r\n    </div>\r\n    {{#each stimulus}}\r\n        {{#if this.image}}\r\n            <img src="{{{this.image}}}" class="img-responsive oe-stimulus">\r\n        {{/if}}\r\n        {{#if this.options}}   \r\n            <div class="well well-sm answerOptions">\r\n                {{#each options}}\r\n                    <span>{{{this}}}</span>\r\n                {{/each}}\r\n            </div>   \r\n        {{/if}}\r\n    {{/each}}\r\n    <div class="modal fade userFeedback" id="myModal" role="dialog">\r\n        <div class="modal-dialog">\r\n            <!-- Modal content-->\r\n            <div class="modal-content">\r\n                <div class="modal-header">\r\n                    <button type="button" class="close" data-dismiss="modal">&times;</button>\r\n                    <h4 class="modal-title">Feedback</h4>\r\n                </div>\r\n                <div class="modal-body">\r\n                    <p></p>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>       \r\n</div>\r\n{{/with}}';});


define('text!../test/layouts/oe-audio.html',[],function () { return '{{#with content}}\r\n<div class="activity-body oe-body">   \r\n    <h2><strong>{{getAdapterParams "activityName"}}</strong></h2>   \r\n    <div class="smart-form">\r\n        <p class="question-text">\r\n            {{#each canvas.data.questiondata}} \r\n                {{{this.text}}}\r\n            {{/each}}\r\n        </p>\r\n        <p class="instructions">{{{directions}}} </p>            \r\n    </div>\r\n    {{#each stimulus}}\r\n        {{#if this.audio}}   \r\n            <div class="audiojsZ oe-stimulus">\r\n                <audio src=\'{{{this.audio}}}\' preload=\'auto\' id=\'audio1\'></audio>\r\n                <div class=\'play-pauseZ\'>          \r\n                   <p class=\'playZ\'></p>          \r\n                   <p class=\'pauseZ\'></p>         \r\n                   <p class=\'loadingZ\'><i class=\'fa fa-spinner fa-spin\'></i></p>         \r\n                   <p class=\'errorZ\'></p>      \r\n                </div>      \r\n                <div class=\'scrubberZ\'>       \r\n                   <div class=\'progressZ\'></div>        \r\n                   <div class=\'loadedZ\'></div>      \r\n                </div>      \r\n                <div class=\'timeZ\'>\r\n                    <em class=\'playedZ\'>00:00</em>/<strong class=\'durationZ\'>00:00</strong>\r\n                </div>   \r\n                <div class=\'volumeZ\' data-volume=\'100\'>\r\n                    <button><i class=\'fa fa-plus\'></i></button>\r\n                    <button><i class=\'fa fa-volume-up\'></i></button>\r\n                    <button><i class=\'fa fa-minus\'></i></button>\r\n                </div>       \r\n                <div class=\'error-messageZ\'></div>    \r\n            </div>    \r\n        {{/if}}\r\n        {{#if this.options}}   \r\n            <div class="well well-sm answerOptions">\r\n                {{#each options}}\r\n                    <span>{{{this}}}</span>\r\n                {{/each}}\r\n            </div>   \r\n        {{/if}}\r\n    {{/each}}\r\n    <div class="modal fade userFeedback" id="myModal" role="dialog">\r\n        <div class="modal-dialog">\r\n            <!-- Modal content-->\r\n            <div class="modal-content">\r\n                <div class="modal-header">\r\n                    <button type="button" class="close" data-dismiss="modal">&times;</button>\r\n                    <h4 class="modal-title">Feedback</h4>\r\n                </div>\r\n                <div class="modal-body">\r\n                    <p></p>\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>       \r\n</div>\r\n{{/with}}\r\n\r\n\r\n    ';});


define('text!../test/layouts/oe-regular.html',[],function () { return '{{#with content}}\r\n<div class="activity-body oe-body">   \r\n    <h2><strong>{{getAdapterParams "activityName"}}</strong></h2>\r\n    <div class=\'row\'>\r\n        <div class=\'col-md-12\'>\r\n            <div class="smart-form">\r\n                <p>\r\n                    {{#each canvas.data.questiondata}} \r\n                        {{{this.text}}}\r\n                    {{/each}}\r\n                </p>\r\n                <p class="instructions">{{{directions}}}</p>\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <div>\r\n        {{#if canvas.textbox}}\r\n            <textarea placeholder="enter your answer" class="col-md-12"></textarea>\r\n        {{/if}}\r\n    </div>\r\n    <div class="clearfix"></div>\r\n    {{#if displaySubmit}}  \r\n        <footer>       \r\n            <div class="activity-toolbar">\r\n                <span class="bottom-logo"></span>   \r\n                <p class="pull-right">\r\n                    <button class="btn btn-primary" id="submit">Submit</button>\r\n                </p>        \r\n                <div class="clearfix"></div>    \r\n            </div> \r\n        </footer>\r\n    {{/if}}\r\n</div>\r\n{{/with}}';});

/*
 * Require-CSS RequireJS css! loader plugin
 * 0.1.10
 * Guy Bedford 2014
 * MIT
 */

/*
 *
 * Usage:
 *  require(['css!./mycssFile']);
 *
 * Tested and working in (up to latest versions as of March 2013):
 * Android
 * iOS 6
 * IE 6 - 10
 * Chrome 3 - 26
 * Firefox 3.5 - 19
 * Opera 10 - 12
 * 
 * browserling.com used for virtual testing environment
 *
 * Credit to B Cavalier & J Hann for the IE 6 - 9 method,
 * refined with help from Martin Cermak
 * 
 * Sources that helped along the way:
 * - https://developer.mozilla.org/en-US/docs/Browser_detection_using_the_user_agent
 * - http://www.phpied.com/when-is-a-stylesheet-really-loaded/
 * - https://github.com/cujojs/curl/blob/master/src/curl/plugin/css.js
 *
 */

define('css',[],function() {
  if (typeof window == 'undefined')
    return { load: function(n, r, load){ load() } };

  var head = document.getElementsByTagName('head')[0];

  var engine = window.navigator.userAgent.match(/Trident\/([^ ;]*)|AppleWebKit\/([^ ;]*)|Opera\/([^ ;]*)|rv\:([^ ;]*)(.*?)Gecko\/([^ ;]*)|MSIE\s([^ ;]*)|AndroidWebKit\/([^ ;]*)/) || 0;

  // use <style> @import load method (IE < 9, Firefox < 18)
  var useImportLoad = false;
  
  // set to false for explicit <link> load checking when onload doesn't work perfectly (webkit)
  var useOnload = true;

  // trident / msie
  if (engine[1] || engine[7])
    useImportLoad = parseInt(engine[1]) < 6 || parseInt(engine[7]) <= 9;
  // webkit
  else if (engine[2] || engine[8] || 'WebkitAppearance' in document.documentElement.style)
    useOnload = false;
  // gecko
  else if (engine[4])
    useImportLoad = parseInt(engine[4]) < 18;

  //main api object
  var cssAPI = {};

  cssAPI.pluginBuilder = './css-builder';

  // <style> @import load method
  var curStyle, curSheet;
  var createStyle = function () {
    curStyle = document.createElement('style');
    head.appendChild(curStyle);
    curSheet = curStyle.styleSheet || curStyle.sheet;
  }
  var ieCnt = 0;
  var ieLoads = [];
  var ieCurCallback;
  
  var createIeLoad = function(url) {
    curSheet.addImport(url);
    curStyle.onload = function(){ processIeLoad() };
    
    ieCnt++;
    if (ieCnt == 31) {
      createStyle();
      ieCnt = 0;
    }
  }
  var processIeLoad = function() {
    ieCurCallback();
 
    var nextLoad = ieLoads.shift();
 
    if (!nextLoad) {
      ieCurCallback = null;
      return;
    }
 
    ieCurCallback = nextLoad[1];
    createIeLoad(nextLoad[0]);
  }
  var importLoad = function(url, callback) {
    if (!curSheet || !curSheet.addImport)
      createStyle();

    if (curSheet && curSheet.addImport) {
      // old IE
      if (ieCurCallback) {
        ieLoads.push([url, callback]);
      }
      else {
        createIeLoad(url);
        ieCurCallback = callback;
      }
    }
    else {
      // old Firefox
      curStyle.textContent = '@import "' + url + '";';

      var loadInterval = setInterval(function() {
        try {
          curStyle.sheet.cssRules;
          clearInterval(loadInterval);
          callback();
        } catch(e) {}
      }, 10);
    }
  }

  // <link> load method
  var linkLoad = function(url, callback) {
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    if (useOnload)
      link.onload = function() {
        link.onload = function() {};
        // for style dimensions queries, a short delay can still be necessary
        setTimeout(callback, 7);
      }
    else
      var loadInterval = setInterval(function() {
        for (var i = 0; i < document.styleSheets.length; i++) {
          var sheet = document.styleSheets[i];
          if (sheet.href == link.href) {
            clearInterval(loadInterval);
            return callback();
          }
        }
      }, 10);
    link.href = url;
    head.appendChild(link);
  }

  cssAPI.normalize = function(name, normalize) {
    if (name.substr(name.length - 4, 4) == '.css')
      name = name.substr(0, name.length - 4);

    return normalize(name);
  }

  cssAPI.load = function(cssId, req, load, config) {

    (useImportLoad ? importLoad : linkLoad)(req.toUrl(cssId + '.css'), load);

  }

  return cssAPI;
});


define('css!../css/audioact',[],function(){});

define('css!../css/open',[],function(){});
// A cross-browser javascript shim for html5 audio
(function(audiojs, audiojsInstance, container) {
  // Use the path to the audio.js file to create relative paths to the swf and player graphics
  // Remember that some systems (e.g. ruby on rails) append strings like '?1301478336' to asset paths
  var path = require.toUrl('');
  
  // ##The audiojs interface
  // This is the global object which provides an interface for creating new `audiojs` instances.
  // It also stores all of the construction helper methods and variables.
  container[audiojs] = {
    instanceCount: 0,
    instances: {},
    // The markup for the swf. It is injected into the page if there is not support for the `<audio>` element. The `$n`s are placeholders.  
    // `$1` The name of the flash movie  
    // `$2` The path to the swf  
    // `$3` Cache invalidation  
    flashSource: '\
      <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" id="$1" width="1" height="1" name="$1" style="position: absolute; left: -1px;"> \
        <param name="movie" value="$2?playerInstance='+audiojs+'.instances[\'$1\']&datetime=$3"> \
        <param name="allowscriptaccess" value="always"> \
        <embed name="$1" src="$2?playerInstance='+audiojs+'.instances[\'$1\']&datetime=$3" width="1" height="1" allowscriptaccess="always"> \
      </object>',

    // ### The main settings object
    // Where all the default settings are stored. Each of these variables and methods can be overwritten by the user-provided `options` object.
    settings: {
      autoplay: false,
      loop: false,
      preload: true,
      imageLocation: path + 'player-graphics.gif',
      swfLocation: path + 'audiojs.swf',
      useFlash: (function() {
        var a = document.createElement('audio');
        return !(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
      })(),
      hasFlash: (function() {
        if (navigator.plugins && navigator.plugins.length && navigator.plugins['Shockwave Flash']) {
          return true;
        } else if (navigator.mimeTypes && navigator.mimeTypes.length) {
          var mimeType = navigator.mimeTypes['application/x-shockwave-flash'];
          return mimeType && mimeType.enabledPlugin;
        } else {
          try {
            var ax = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            return true;
          } catch (e) {}
        }
        return false;
      })(),
      // The default markup and classes for creating the player:
      createPlayer: {
        markup: '\
          <div class="play-pause"> \
            <p class="play"></p> \
            <p class="pause"></p> \
            <p class="loading"></p> \
            <p class="error"></p> \
          </div> \
          <div class="scrubber"> \
            <div class="progress"></div> \
            <div class="loaded"></div> \
          </div> \
          <div class="time"> \
            <em class="played">00:00</em>/<strong class="duration">00:00</strong> \
          </div> \
          <div class="error-message"></div>',
        playPauseClass: 'play-pause',
        scrubberClass: 'scrubber',
        progressClass: 'progress',
        loaderClass: 'loaded',
        timeClass: 'time',
        durationClass: 'duration',
        playedClass: 'played',
        errorMessageClass: 'error-message',
        playingClass: 'playing',
        loadingClass: 'loading',
        errorClass: 'error'
      },
      // The css used by the default player. This is is dynamically injected into a `<style>` tag in the top of the head.
      css: '\
        .audiojs audio { position: absolute; left: -1px; } \
        .audiojs { width: 460px; height: 36px; background: #404040; overflow: hidden; font-family: monospace; font-size: 12px; \
          background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #444), color-stop(0.5, #555), color-stop(0.51, #444), color-stop(1, #444)); \
          background-image: -moz-linear-gradient(center top, #444 0%, #555 50%, #444 51%, #444 100%); \
          -webkit-box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.3); -moz-box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.3); \
          -o-box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.3); box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.3); } \
        .audiojs .play-pause { width: 25px; height: 40px; padding: 4px 6px; margin: 0px; float: left; overflow: hidden; border-right: 1px solid #000; } \
        .audiojs p { display: none; width: 25px; height: 40px; margin: 0px; cursor: pointer; } \
        .audiojs .play { display: block; } \
        .audiojs .scrubber { position: relative; float: left; width: 280px; background: #5a5a5a; height: 14px; margin: 10px; border-top: 1px solid #3f3f3f; border-left: 0px; border-bottom: 0px; overflow: hidden; } \
        .audiojs .progress { position: absolute; top: 0px; left: 0px; height: 14px; width: 0px; background: #ccc; z-index: 1; \
          background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #ccc), color-stop(0.5, #ddd), color-stop(0.51, #ccc), color-stop(1, #ccc)); \
          background-image: -moz-linear-gradient(center top, #ccc 0%, #ddd 50%, #ccc 51%, #ccc 100%); } \
        .audiojs .loaded { position: absolute; top: 0px; left: 0px; height: 14px; width: 0px; background: #000; \
          background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #222), color-stop(0.5, #333), color-stop(0.51, #222), color-stop(1, #222)); \
          background-image: -moz-linear-gradient(center top, #222 0%, #333 50%, #222 51%, #222 100%); } \
        .audiojs .time { float: left; height: 36px; line-height: 36px; margin: 0px 0px 0px 6px; padding: 0px 6px 0px 12px; border-left: 1px solid #000; color: #ddd; text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.5); } \
        .audiojs .time em { padding: 0px 2px 0px 0px; color: #f9f9f9; font-style: normal; } \
        .audiojs .time strong { padding: 0px 0px 0px 2px; font-weight: normal; } \
        .audiojs .error-message { float: left; display: none; margin: 0px 10px; height: 36px; width: 400px; overflow: hidden; line-height: 36px; white-space: nowrap; color: #fff; \
          text-overflow: ellipsis; -o-text-overflow: ellipsis; -icab-text-overflow: ellipsis; -khtml-text-overflow: ellipsis; -moz-text-overflow: ellipsis; -webkit-text-overflow: ellipsis; } \
        .audiojs .error-message a { color: #eee; text-decoration: none; padding-bottom: 1px; border-bottom: 1px solid #999; white-space: wrap; } \
        \
        .audiojs .play { background: url("$1") -2px -1px no-repeat; } \
        .audiojs .loading { background: url("$1") -2px -31px no-repeat; } \
        .audiojs .error { background: url("$1") -2px -61px no-repeat; } \
        .audiojs .pause { background: url("$1") -2px -91px no-repeat; } \
        \
        .playing .play, .playing .loading, .playing .error { display: none; } \
        .playing .pause { display: block; } \
        \
        .loading .play, .loading .pause, .loading .error { display: none; } \
        .loading .loading { display: block; } \
        \
        .error .time, .error .play, .error .pause, .error .scrubber, .error .loading { display: none; } \
        .error .error { display: block; } \
        .error .play-pause p { cursor: auto; } \
        .error .error-message { display: block; }',
      // The default event callbacks:
      trackEnded: function(e) {},
      flashError: function() {
        var player = this.settings.createPlayer,
            errorMessage = getByClass(player.errorMessageClass, this.wrapper),
            html = 'Missing <a href="http://get.adobe.com/flashplayer/">flash player</a> plugin.';
        if (this.mp3) html += ' <a href="'+this.mp3+'">Download audio file</a>.';
        container[audiojs].helpers.removeClass(this.wrapper, player.loadingClass);
        container[audiojs].helpers.addClass(this.wrapper, player.errorClass);
        errorMessage.innerHTML = html;
      },
      loadError: function(e) {
        var player = this.settings.createPlayer,
            errorMessage = getByClass(player.errorMessageClass, this.wrapper);
        container[audiojs].helpers.removeClass(this.wrapper, player.loadingClass);
        container[audiojs].helpers.addClass(this.wrapper, player.errorClass);
        errorMessage.innerHTML = 'Error loading: "'+this.mp3+'"';
      },
      init: function() {
        var player = this.settings.createPlayer;
        container[audiojs].helpers.addClass(this.wrapper, player.loadingClass);
      },
      loadStarted: function() {
        var player = this.settings.createPlayer,
            duration = getByClass(player.durationClass, this.wrapper),
            m = Math.floor(this.duration / 60),
            s = Math.floor(this.duration % 60);
        container[audiojs].helpers.removeClass(this.wrapper, player.loadingClass);
        duration.innerHTML = ((m<10?'0':'')+m+':'+(s<10?'0':'')+s);
      },
      loadProgress: function(percent) {
        var player = this.settings.createPlayer,
            scrubber = getByClass(player.scrubberClass, this.wrapper),
            loaded = getByClass(player.loaderClass, this.wrapper);
        loaded.style.width = (scrubber.offsetWidth * percent) + 'px';
      },
      playPause: function() {
        if (this.playing) this.settings.play();
        else this.settings.pause();
      },
      play: function() {
        var player = this.settings.createPlayer;
        container[audiojs].helpers.addClass(this.wrapper, player.playingClass);
      },
      pause: function() {
        var player = this.settings.createPlayer;
        container[audiojs].helpers.removeClass(this.wrapper, player.playingClass);
      },
      updatePlayhead: function(percent) {
        var player = this.settings.createPlayer,
            scrubber = getByClass(player.scrubberClass, this.wrapper),
            progress = getByClass(player.progressClass, this.wrapper);
        progress.style.width = (scrubber.offsetWidth * percent) + 'px';

        var played = getByClass(player.playedClass, this.wrapper),
            p = this.duration * percent,
            m = Math.floor(p / 60),
            s = Math.floor(p % 60);
        played.innerHTML = ((m<10?'0':'')+m+':'+(s<10?'0':'')+s);
      }
    },

    // ### Contructor functions

    // `create()`  
    // Used to create a single `audiojs` instance.  
    // If an array is passed then it calls back to `createAll()`.  
    // Otherwise, it creates a single instance and returns it.  
    create: function(element, options) {
      var options = options || {}
      if (element.length) {
        return this.createAll(options, element);
      } else {
        return this.newInstance(element, options);
      }
    },

    // `createAll()`  
    // Creates multiple `audiojs` instances.  
    // If `elements` is `null`, then automatically find any `<audio>` tags on the page and create `audiojs` instances for them.
    createAll: function(options, elements) {
      var audioElements = elements || document.getElementsByTagName('audio'),
          instances = []
          options = options || {};
      for (var i = 0, ii = audioElements.length; i < ii; i++) {
        instances.push(this.newInstance(audioElements[i], options));
      }
      return instances;
    },

    // ### Creating and returning a new instance
    // This goes through all the steps required to build out a usable `audiojs` instance.
    newInstance: function(element, options) {
      var element = element,
          s = this.helpers.clone(this.settings),
          id = 'audiojs'+this.instanceCount,
          wrapperId = 'audiojs_wrapper'+this.instanceCount,
          instanceCount = this.instanceCount++;

      // Check for `autoplay`, `loop` and `preload` attributes and write them into the settings.
      if (element.getAttribute('autoplay') != null) s.autoplay = true;
      if (element.getAttribute('loop') != null) s.loop = true;
      if (element.getAttribute('preload') == 'none') s.preload = false;
      // Merge the default settings with the user-defined `options`.
      if (options) this.helpers.merge(s, options);

      // Inject the player html if required.
      if (s.createPlayer.markup) element = this.createPlayer(element, s.createPlayer, wrapperId);
      else element.parentNode.setAttribute('id', wrapperId);

      // Return a new `audiojs` instance.
      var audio = new container[audiojsInstance](element, s);

      // If css has been passed in, dynamically inject it into the `<head>`.
      if (s.css) this.helpers.injectCss(audio, s.css);

      // If `<audio>` or mp3 playback isn't supported, insert the swf & attach the required events for it.
      if (s.useFlash && s.hasFlash) {
        this.injectFlash(audio, id);
        this.attachFlashEvents(audio.wrapper, audio);
      } else if (s.useFlash && !s.hasFlash) {
        this.settings.flashError.apply(audio);
      }

      // Attach event callbacks to the new audiojs instance.
      if (!s.useFlash || (s.useFlash && s.hasFlash)) this.attachEvents(audio.wrapper, audio);

      // Store the newly-created `audiojs` instance.
      this.instances[id] = audio;
      return audio;
    },

    // ### Helper methods for constructing a working player
    // Inject a wrapping div and the markup for the html player.
    createPlayer: function(element, player, id) {
      var wrapper = document.createElement('div'),
          newElement = element.cloneNode(true);
      wrapper.setAttribute('class', 'audiojs');
      wrapper.setAttribute('className', 'audiojs');
      wrapper.setAttribute('id', id);

      // Fix IE's broken implementation of `innerHTML` & `cloneNode` for HTML5 elements.
      if (newElement.outerHTML && !document.createElement('audio').canPlayType) {
        newElement = this.helpers.cloneHtml5Node(element);
        wrapper.innerHTML = player.markup;
        wrapper.appendChild(newElement);
        element.outerHTML = wrapper.outerHTML;
        wrapper = document.getElementById(id);
      } else {
        wrapper.appendChild(newElement);
        wrapper.innerHTML = wrapper.innerHTML + player.markup;
        element.parentNode.replaceChild(wrapper, element);
      }
      return wrapper.getElementsByTagName('audio')[0];
    },

    // Attaches useful event callbacks to an `audiojs` instance.
    attachEvents: function(wrapper, audio) {
      if (!audio.settings.createPlayer) return;
      var player = audio.settings.createPlayer,
          playPause = getByClass(player.playPauseClass, wrapper),
          scrubber = getByClass(player.scrubberClass, wrapper),
          leftPos = function(elem) {
            var curleft = 0;
            if (elem.offsetParent) {
              do { curleft += elem.offsetLeft; } while (elem = elem.offsetParent);
            }
            return curleft;
          };

      container[audiojs].events.addListener(playPause, 'click', function(e) {
        audio.playPause.apply(audio);
      });

      container[audiojs].events.addListener(scrubber, 'click', function(e) {
        var relativeLeft = e.clientX - leftPos(this);
        audio.skipTo(relativeLeft / scrubber.offsetWidth);
      });

      // _If flash is being used, then the following handlers don't need to be registered._
      if (audio.settings.useFlash) return;

      // Start tracking the load progress of the track.
      container[audiojs].events.trackLoadProgress(audio);

      container[audiojs].events.addListener(audio.element, 'timeupdate', function(e) {
        audio.updatePlayhead.apply(audio);
      });

      container[audiojs].events.addListener(audio.element, 'ended', function(e) {
        audio.trackEnded.apply(audio);
      });

      container[audiojs].events.addListener(audio.source, 'error', function(e) {
        // on error, cancel any load timers that are running.
        clearInterval(audio.readyTimer);
        clearInterval(audio.loadTimer);
        audio.settings.loadError.apply(audio);
      });

    },

    // Flash requires a slightly different API to the `<audio>` element, so this method is used to overwrite the standard event handlers.
    attachFlashEvents: function(element, audio) {
      audio['swfReady'] = false;
      audio['load'] = function(mp3) {
        // If the swf isn't ready yet then just set `audio.mp3`. `init()` will load it in once the swf is ready.
        audio.mp3 = mp3;
        if (audio.swfReady) audio.element.load(mp3);
      }
      audio['loadProgress'] = function(percent, duration) {
        audio.loadedPercent = percent;
        audio.duration = duration;
        audio.settings.loadStarted.apply(audio);
        audio.settings.loadProgress.apply(audio, [percent]);
      }
      audio['skipTo'] = function(percent) {
        if (percent > audio.loadedPercent) return;
        audio.updatePlayhead.call(audio, [percent])
        audio.element.skipTo(percent);
      }
      audio['updatePlayhead'] = function(percent) {
        audio.settings.updatePlayhead.apply(audio, [percent]);
      }
      audio['play'] = function() {
        // If the audio hasn't started preloading, then start it now.  
        // Then set `preload` to `true`, so that any tracks loaded in subsequently are loaded straight away.
        if (!audio.settings.preload) {
          audio.settings.preload = true;
          audio.element.init(audio.mp3);
        }
        audio.playing = true;
        // IE doesn't allow a method named `play()` to be exposed through `ExternalInterface`, so lets go with `pplay()`.  
        // <http://dev.nuclearrooster.com/2008/07/27/externalinterfaceaddcallback-can-cause-ie-js-errors-with-certain-keyworkds/>
        audio.element.pplay();
        audio.settings.play.apply(audio);
      }
      audio['pause'] = function() {
        audio.playing = false;
        // Use `ppause()` for consistency with `pplay()`, even though it isn't really required.
        audio.element.ppause();
        audio.settings.pause.apply(audio);
      }
      audio['setVolume'] = function(v) {
        audio.element.setVolume(v);
      }
      audio['loadStarted'] = function() {
        // Load the mp3 specified by the audio element into the swf.
        audio.swfReady = true;
        if (audio.settings.preload) audio.element.init(audio.mp3);
        if (audio.settings.autoplay) audio.play.apply(audio);
      }
    },

    // ### Injecting an swf from a string
    // Build up the swf source by replacing the `$keys` and then inject the markup into the page.
    injectFlash: function(audio, id) {
      var flashSource = this.flashSource.replace(/\$1/g, id);
      flashSource = flashSource.replace(/\$2/g, audio.settings.swfLocation);
      // `(+new Date)` ensures the swf is not pulled out of cache. The fixes an issue with Firefox running multiple players on the same page.
      flashSource = flashSource.replace(/\$3/g, (+new Date + Math.random()));
      // Inject the player markup using a more verbose `innerHTML` insertion technique that works with IE.
      var html = audio.wrapper.innerHTML,
          div = document.createElement('div');
      div.innerHTML = flashSource + html;
      audio.wrapper.innerHTML = div.innerHTML;
      audio.element = this.helpers.getSwf(id);
    },

    // ## Helper functions
    helpers: {
      // **Merge two objects, with `obj2` overwriting `obj1`**  
      // The merge is shallow, but that's all that is required for our purposes.
      merge: function(obj1, obj2) {
        for (attr in obj2) {
          if (obj1.hasOwnProperty(attr) || obj2.hasOwnProperty(attr)) {
            obj1[attr] = obj2[attr];
          }
        }
      },
      // **Clone a javascript object (recursively)**
      clone: function(obj){
        if (obj == null || typeof(obj) !== 'object') return obj;
        var temp = new obj.constructor();
        for (var key in obj) temp[key] = arguments.callee(obj[key]);
        return temp;
      },
      // **Adding/removing classnames from elements**
      addClass: function(element, className) {
        var re = new RegExp('(\\s|^)'+className+'(\\s|$)');
        if (re.test(element.className)) return;
        element.className += ' ' + className;
      },
      removeClass: function(element, className) {
        var re = new RegExp('(\\s|^)'+className+'(\\s|$)');
        element.className = element.className.replace(re,' ');
      },
      // **Dynamic CSS injection**  
      // Takes a string of css, inserts it into a `<style>`, then injects it in at the very top of the `<head>`. This ensures any user-defined styles will take precedence.
      injectCss: function(audio, string) {

        // If an `audiojs` `<style>` tag already exists, then append to it rather than creating a whole new `<style>`.
        var prepend = '',
            styles = document.getElementsByTagName('style'),
            css = string.replace(/\$1/g, audio.settings.imageLocation);

        for (var i = 0, ii = styles.length; i < ii; i++) {
          var title = styles[i].getAttribute('title');
          if (title && ~title.indexOf('audiojs')) {
            style = styles[i];
            if (style.innerHTML === css) return;
            prepend = style.innerHTML;
            break;
          }
        };

        var head = document.getElementsByTagName('head')[0],
            firstchild = head.firstChild,
            style = document.createElement('style');

        if (!head) return;

        style.setAttribute('type', 'text/css');
        style.setAttribute('title', 'audiojs');

        if (style.styleSheet) style.styleSheet.cssText = prepend + css;
        else style.appendChild(document.createTextNode(prepend + css));

        if (firstchild) head.insertBefore(style, firstchild);
        else head.appendChild(styleElement);
      },
      // **Handle all the IE6+7 requirements for cloning `<audio>` nodes**  
      // Create a html5-safe document fragment by injecting an `<audio>` element into the document fragment.
      cloneHtml5Node: function(audioTag) {
        var fragment = document.createDocumentFragment(),
            doc = fragment.createElement ? fragment : document;
        doc.createElement('audio');
        var div = doc.createElement('div');
        fragment.appendChild(div);
        div.innerHTML = audioTag.outerHTML;
        return div.firstChild;
      },
      // **Cross-browser `<object>` / `<embed>` element selection**
      getSwf: function(name) {
        var swf = document[name] || window[name];
        return swf.length > 1 ? swf[swf.length - 1] : swf;
      }
    },
    // ## Event-handling
    events: {
      memoryLeaking: false,
      listeners: [],
      // **A simple cross-browser event handler abstraction**
      addListener: function(element, eventName, func) {
        // For modern browsers use the standard DOM-compliant `addEventListener`.
        if (element.addEventListener) {
          element.addEventListener(eventName, func, false);
          // For older versions of Internet Explorer, use `attachEvent`.  
          // Also provide a fix for scoping `this` to the calling element and register each listener so the containing elements can be purged on page unload.
        } else if (element.attachEvent) {
          this.listeners.push(element);
          if (!this.memoryLeaking) {
            window.attachEvent('onunload', function() {
              if(this.listeners) {
                for (var i = 0, ii = this.listeners.length; i < ii; i++) {
                  container[audiojs].events.purge(this.listeners[i]);
                }
              }
            });
            this.memoryLeaking = true;
          }
          element.attachEvent('on' + eventName, function() {
            func.call(element, window.event);
          });
        }
      },

      trackLoadProgress: function(audio) {
        // If `preload` has been set to `none`, then we don't want to start loading the track yet.
        if (!audio.settings.preload) return;

        var readyTimer,
            loadTimer,
            audio = audio,
            ios = (/(ipod|iphone|ipad)/i).test(navigator.userAgent);

        // Use timers here rather than the official `progress` event, as Chrome has issues calling `progress` when loading mp3 files from cache.
        readyTimer = setInterval(function() {
          if (audio.element.readyState > -1) {
            // iOS doesn't start preloading the mp3 until the user interacts manually, so this stops the loader being displayed prematurely.
            if (!ios) audio.init.apply(audio);
          }
          if (audio.element.readyState > 1) {
            if (audio.settings.autoplay) audio.play.apply(audio);
            clearInterval(readyTimer);
            // Once we have data, start tracking the load progress.
            loadTimer = setInterval(function() {
              audio.loadProgress.apply(audio);
              if (audio.loadedPercent >= 1) clearInterval(loadTimer);
            });
          }
        }, 10);
        audio.readyTimer = readyTimer;
        audio.loadTimer = loadTimer;
      },

      // **Douglas Crockford's IE6 memory leak fix**  
      // <http://javascript.crockford.com/memory/leak.html>  
      // This is used to release the memory leak created by the circular references created when fixing `this` scoping for IE. It is called on page unload.
      purge: function(d) {
        var a = d.attributes, i;
        if (a) {
          for (i = 0; i < a.length; i += 1) {
            if (typeof d[a[i].name] === 'function') d[a[i].name] = null;
          }
        }
        a = d.childNodes;
        if (a) {
          for (i = 0; i < a.length; i += 1) purge(d.childNodes[i]);
        }
      },

      // **DOMready function**  
      // As seen here: <https://github.com/dperini/ContentLoaded/>.
      ready: (function() { return function(fn) {
        var win = window, done = false, top = true,
        doc = win.document, root = doc.documentElement,
        add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
        rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
        pre = doc.addEventListener ? '' : 'on',
        init = function(e) {
          if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
          (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
          if (!done && (done = true)) fn.call(win, e.type || e);
        },
        poll = function() {
          try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
          init('poll');
        };
        if (doc.readyState == 'complete') fn.call(win, 'lazy');
        else {
          if (doc.createEventObject && root.doScroll) {
            try { top = !win.frameElement; } catch(e) { }
            if (top) poll();
          }
          doc[add](pre + 'DOMContentLoaded', init, false);
          doc[add](pre + 'readystatechange', init, false);
          win[add](pre + 'load', init, false);
        }
      }
      })()

    }
  }

  // ## The audiojs class
  // We create one of these per `<audio>` and then push them into `audiojs['instances']`.
  container[audiojsInstance] = function(element, settings) {
    // Each audio instance returns an object which contains an API back into the `<audio>` element.
    this.element = element;
    this.wrapper = element.parentNode;
    this.source = element.getElementsByTagName('source')[0] || element;
    // First check the `<audio>` element directly for a src and if one is not found, look for a `<source>` element.
    this.mp3 = (function(element) {
      var source = element.getElementsByTagName('source')[0];
      return element.getAttribute('src') || (source ? source.getAttribute('src') : null);
    })(element);
    this.settings = settings;
    this.loadStartedCalled = false;
    this.loadedPercent = 0;
    this.duration = 1;
    this.playing = false;
  }

  container[audiojsInstance].prototype = {
    // API access events:
    // Each of these do what they need do and then call the matching methods defined in the settings object.
    updatePlayhead: function() {
      var percent = this.element.currentTime / this.duration;
      this.settings.updatePlayhead.apply(this, [percent]);
    },
    skipTo: function(percent) {
      if (percent > this.loadedPercent) return;
      this.element.currentTime = this.duration * percent;
      this.updatePlayhead();
    },
    load: function(mp3) {
      this.loadStartedCalled = false;
      this.source.setAttribute('src', mp3);
      // The now outdated `load()` method is required for Safari 4
      this.element.load();
      this.mp3 = mp3;
      container[audiojs].events.trackLoadProgress(this);
    },
    loadError: function() {
      this.settings.loadError.apply(this);
    },
    init: function() {
      this.settings.init.apply(this);
    },
    loadStarted: function() {
      // Wait until `element.duration` exists before setting up the audio player.
      if (!this.element.duration) return false;

      this.duration = this.element.duration;
      this.updatePlayhead();
      this.settings.loadStarted.apply(this);
    },
    loadProgress: function() {
      if (this.element.buffered != null && this.element.buffered.length) {
        // Ensure `loadStarted()` is only called once.
        if (!this.loadStartedCalled) {
          this.loadStartedCalled = this.loadStarted();
        }
        var durationLoaded = this.element.buffered.end(this.element.buffered.length - 1);
        this.loadedPercent = durationLoaded / this.duration;

        this.settings.loadProgress.apply(this, [this.loadedPercent]);
      }
    },
    playPause: function() {
      if (this.playing) this.pause();
      else this.play();
    },
    play: function() {
      var ios = (/(ipod|iphone|ipad)/i).test(navigator.userAgent);
      // On iOS this interaction will trigger loading the mp3, so run `init()`.
      if (ios && this.element.readyState == 0) this.init.apply(this);
      // If the audio hasn't started preloading, then start it now.  
      // Then set `preload` to `true`, so that any tracks loaded in subsequently are loaded straight away.
      if (!this.settings.preload) {
        this.settings.preload = true;
        this.element.setAttribute('preload', 'auto');
        container[audiojs].events.trackLoadProgress(this);
      }
      this.playing = true;
      this.element.play();
      this.settings.play.apply(this);
    },
    pause: function() {
      this.playing = false;
      this.element.pause();
      this.settings.pause.apply(this);
    },
    setVolume: function(v) {
      this.element.volume = v;
    },
    trackEnded: function(e) {
      this.skipTo.apply(this, [0]);
      if (!this.settings.loop) this.pause.apply(this);
      this.settings.trackEnded.apply(this);
    }
  }

  // **getElementsByClassName**  
  // Having to rely on `getElementsByTagName` is pretty inflexible internally, so a modified version of Dustin Diaz's `getElementsByClassName` has been included.
  // This version cleans things up and prefers the native DOM method if it's available.
  var getByClass = function(searchClass, node) {
    var matches = [];
    node = node || document;

    if (node.getElementsByClassName) {
      matches = node.getElementsByClassName(searchClass);
    } else {
      var i, l, 
          els = node.getElementsByTagName("*"),
          pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");

      for (i = 0, l = els.length; i < l; i++) {
        if (pattern.test(els[i].className)) {
          matches.push(els[i]);
        }
      }
    }
    return matches.length > 1 ? matches : matches[0];
  };
// The global variable names are passed in here and can be changed if they conflict with anything else.
})('audiojs', 'audiojsInstance', this);
define("audio", function(){});

/*
 * -------------------
 * Engine Module
 * -------------------
 * 
 * Name: Open Ended engine.
 * Description: A HTML5 activity template for a open ended type activity.
 *  
 * Interfaces / Modes :->
 * 
 *	1. Supports Standard ENGINE-SHELL interface
 *		{
 *			init(),
 *			getStatus(),
 *			getConfig()
 *		}
 * 
 * ENGINE - SHELL interface : ->
 *
 * This engine assume that a module "shell.js" loads first, and establishes interface with the platform. The shell in
 * turn instantiates [ engine.init() ] this engine with necessary configuration paramters and a reference to platform Adapter
 * object which allows subsequent communuication with the platform.
 *
 * SHELL calls engine.getStatus() to check if SUBMIT has been pressed or not - the response from the engine is 
 * used to enable / disable LMS controls.
 *
 * SHELL calls engine.getConfig() to request SIZE information - the response from the engine is 
 * used to resize the container iframe.
 *
 *
 * EXTERNAL JS DEPENDENCIES : ->
 * Following are shared/common dependencies (specified in index.html), and assumed to loaded via the platform)
 * 1. JQuery
 * 2. Handlebars
 * 3. LMS Adapter
 * 4. Utils (for activity resize etc.)
 * 5. SHELL
 *
 *
 */

define('open',['text!../test/layouts/oe-image.html', 'text!../test/layouts/oe-audio.html', 'text!../test/layouts/oe-regular.html', 'css!../css/audioact.css', 'css!../css/open.css', 'audio'], function (oeImageTemplateRef, oeAudioTemplateRef, oeRegularTemplateRef) {

	open = function() {
	"use strict";
		
	/*
	 * Reference to platform's activity adaptor (initialized during init() ).
	 */
	var activityAdaptor;	 
	
	/*
	 * Internal Engine Config.
	 */ 
	var __config = {
		MAX_RETRIES: 10, /* Maximum number of retries for sending results to platform for a particular activity. */	
		RESIZE_MODE: "auto", /* Possible values - "manual"/"auto". Default value is "auto". */
		RESIZE_HEIGHT: "580" /* Applicable, if RESIZE_MODE is manual. If RESIZE_HEIGHT is defined in TOC then that will overrides. */
		/* If both config RESIZE_HEIGHT and TOC RESIZE_HEIGHT are not defined then RESIZE_MODE is set to "auto"*/
	};
	
	/*
	 * Internal Engine State.
	 */ 
	var __state = {
		currentTries: 0, /* Current try of sending results to platform */
		activityPariallySubmitted: false, /* State whether activity has been partially submitted. Possible Values: true/false(Boolean) */
		activitySubmitted: false, /* State whether activity has been submitted. Possible Values: true/false(Boolean) */
		audioTrackCompleted: false, /* State whether audio track is completed.  Possible Values: true/false(Boolean) */
		bookAudio: null /* Used only in case of Audio Activities. */
	};	
	
	/*
	 * Content (loaded / initialized during init() ).
	 */ 
    var __content = {
        displaySubmit: false,
        displayTextarea: false,
        correctFeedback: "",
        correctAnswer: "",
        directionsXML: "",
        questionsXML: [], /* Contains the question obtained from content XML. */
        feedbackXML: {}, /* Contains the feedback for a particular question. */
        feedbackJSON: {},        
        userAnswersXML: "", /* Contains the user answer for a particular question. */
        //activityType: null,  /* Type of OE activity. */	
        endTestKeywords: "",  /* Keywords to end test. */
        maxscore: 0 /* Contains maxscore provided by content creator. */
    };

	/*
	 * Constants.
	 */
	var __constants = {
		/* CONSTANT for HTML selectors */
		DOM_SEL_SUBMIT_BTN: "#submit",
		DOM_SEL_ACTIVITY_BODY: ".activity-body",
		
		/* CONSTANTS for Activity State (Resume / Preview) */
		ACT_STATE_RESUME: "state_resume",
		ACT_STATE_PREVIEW: "state_preview",

		/* CONSTANT for PLATFORM Save Status NO ERROR */
		STATUS_NOERROR: "NO_ERROR",
		
		/* CONSTANT for identifier in which Adaptor Instance will be stored */
		ADAPTOR_INSTANCE_IDENTIFIER: "data-objectid",

		/* CONSTANT to start and end partial save call timer. */
        PARTIAL_SAVE_TIMER: undefined,

		/* CONSTANT for textarea template. */
        USER_INPUT_AREA: '<textarea placeholder="Enter your answer here. When you are done click the button below to check your answer and get feeback." class="form-control"></textarea>',

        /* CONSTANT for submit button area template. */
        SUBMIT_BUTTON_AREA: '<div class="submit-button-area"><button class="btn btn-primary" id="submit" data-toggle="modal" data-target="#myModal">Done, Check my answer.</button><div class="clear"></div></div>',

        /* CONSTANT for feedback area template. */
        FEEDBACK_AREA: "<div id='oe-feedback-area'></div>",

        /* CONSTANT for user answer template. */
        USER_ANSWER_WELL: "<div class='response-well'><h4>Your Answer</h4></div>",
        
        /* CONSTANT for feedback template. */
        FEEDBACK_WELL: "<div class='response-well'><span></span><h4>Feedback</h4></div>",

        /* CONSTANT to end test. */
        END_TEST: false,

        /* CONSTANT for global feedback. */
        GLOBAL_FEEDBACK: "global",
        INTERACTION_FEEDBACK: "interaction",        

		/* CONSTANTS for activity status */
        ACTIVITY_NOT_ATTEMPTED: "not_attempted", /* Activity not yet Attempted. */
        ACTIVITY_IN_PROGRESS: "in_progress", /* In Progress Activity. */
        ACTIVITY_NOT_APPLICABLE: "not_applicable", /* Not Applicable. */ 
        ACTIVITY_PARTIALLY_CORRECT: "partially_correct", /* Partially Correct Activity. */
        ACTIVITY_CORRECT: "correct", /* Correct Activity. */ 
        ACTIVITY_INCORRECT: "incorrect", /* Incorrect Activity. */          
		
		TEMPLATES: {
			/* OE Layout with Image. */
		   OE_IMAGE: oeImageTemplateRef,

		   /* OE Layout with Audio. */
		   OE_AUDIO: oeAudioTemplateRef,

		   /* OE regular Layout. */
		   OE_REGULAR: oeRegularTemplateRef
		}
	};
	

		
	/********************************************************/
	/*					ENGINE-SHELL INIT FUNCTION
		
		"elRoot" :->		DOM Element reference where the engine should paint itself.														
		"params" :->		Startup params passed by platform. Include the following sets of parameters:
						(a) State (Initial launch / Resume / Gradebook mode ).
						(b) TOC parameters (videoRoot, keyframe, layout, etc.).
		"adaptor" :->        An adaptor interface for communication with platform (saveResults, closeActivity, savePartialResults, getLastResults, etc.).
		"htmlLayout" :->    Activity HTML layout (as defined in the TOC LINK paramter). 
		"jsonContent" :->    Activity JSON content (as defined in the TOC LINK paramter).
		"callback" :->      To inform the shell that init is complete.
	*/
	/********************************************************/	
	function init(elRoot, params, adaptor, htmlLayout, jsonContentObj, callback) {
		/* Function Local to INIT */
			
		/**
		*  Initializing AUDIO JS.
		*/		
		function initializeAudioJS() {
			audiojs.events.ready(function () {
				var audios = document.getElementsByTagName('audio');
				__state.bookAudio = audiojs.create(audios[0], {
						css: false,
						createPlayer: {
							markup: false,
							playPauseClass: 'play-pauseZ',
							scrubberClass: 'scrubberZ',
							progressClass: 'progressZ',
							loaderClass: 'loadedZ',
							timeClass: 'timeZ',
							durationClass: 'durationZ',
							playedClass: 'playedZ',
							errorMessageClass: 'error-messageZ',
							playingClass: 'playingZ',
							loadingClass: 'loadingZ',
							errorClass: 'errorZ'
						}
					});
				/* Volume control not available in iPad. */
				if (navigator.userAgent.indexOf("iPad") !== -1) {
					$(".scrubberZ").width("60%");
					$(".loadedZ").width($(".scrubberZ").width());
					$(".timeZ").css("border-right", "0");
					$(".volumeZ").addClass("hidden");
				}

			});

			$(".audiojsZ .volumeZ button").click(function(){
				var volElem = $(this).parent();
				var volume = volElem.attr('data-volume');
				var type = $(this).find("i");
				if(type.hasClass("fa-plus")) {
					if (volume<100){
						__state.bookAudio.setVolume(0.1 + (volume/100));
						volElem.attr('data-volume',parseInt(volume,10)+10);
						if(volElem.find(".fa-volume-down").length>0){
							volElem.find(".fa-volume-down").toggleClass("fa-volume-up fa-volume-down");
						}
					}
				} else if (type.hasClass("fa-minus")) {
					if (volume>0){
						__state.bookAudio.setVolume((volume/100) - 0.1);
						volElem.attr('data-volume',volume-10);
						if(volElem.find(".fa-volume-down").length>0){
							volElem.find(".fa-volume-down").toggleClass("fa-volume-up fa-volume-down");
						}
					}
				} else if (type.hasClass("fa-volume-up")) {
					__state.bookAudio.setVolume(0);
					$(this).find("i").toggleClass("fa-volume-up fa-volume-down");
				} else if (type.hasClass("fa-volume-down")) {
					__state.bookAudio.setVolume(volume/100);
					$(this).find("i").toggleClass("fa-volume-up fa-volume-down");
				}
			});
			
			/* Required for placement test. */
			__state.bookAudio.trackEnded = function() {
				audioTrackEnded();
				__state.bookAudio.play = function() {
				};
			};			
				
		} /* initializeAudioJS() Ends. */	

		/* ---------------------- BEGIN OF INIT ---------------------------------*/
		var jsonContent = jQuery.extend(true, {}, jsonContentObj);
		activityAdaptor = adaptor;
		
		var isContentValid = true;

		/* ------ VALIDATION BLOCK START -------- */	
		if (jsonContent.content === undefined) {
			isContentValid = false;
		}
		/* ------ VALIDATION BLOCK END -------- */	

		if(!isContentValid) {
			/* Inform the shell that init is complete */
			if(callback) {
				callback();
			}			
			return; /* -- EXITING --*/
		}		
		

		/* Parse and update content JSON. */
		var processedJsonContent = parseAndUpdateJSONContent(jsonContent, params);
						
		/* Apply the content JSON to the htmllayout */
		var processedHTML = processLayoutWithContent(__constants.TEMPLATES[htmlLayout], processedJsonContent);
		processedHTML = processedHTML.replace(/&lt;/g,"<");
		processedHTML = processedHTML.replace(/&gt;/g,">");

		/* Update the DOM and render the processed HTML - main body of the activity */		
		$(elRoot).html(processedHTML);
		
		$(__constants.DOM_SEL_ACTIVITY_BODY).attr(__constants.ADAPTOR_INSTANCE_IDENTIFIER, adaptor.getId());       
			
		/* Initialize AudioJs engine, if content XML/JSON has an audio element */		
		if(( $("#audio1").html() !== undefined && $("#audio1").html() !== null ) || (processedJsonContent.containsAudio) ) {
			initializeAudioJS();
		} else {
			/* Required for placement test. */
			__state.audioTrackCompleted = true;		
		}		
		
		/* Render footer if NOT Gradebook Mode. */			
		if (params["mode"].activityState !== __constants.ACT_STATE_PREVIEW) {
			/* HTML Rendering is NOW complete, so setup Event Handlers on the Layout HTML for OPEN ended type interaction */
			setupEventHandlers();		

			/* Inform the shell that init is complete */
			if(callback) {
				callback();
			}					
		} else {
			/* Inform the shell that init is complete */
			if(callback) {
				callback();
			}								
		}
		/* ---------------------- END OF INIT ---------------------------------*/
	} /* init() Ends. */        
	
	/**
	 * ENGINE-SHELL Interface
	 *
	 * Return configuration
	 */
	function getConfig () {
		return __config;
	}
	
	/**
	 * ENGINE-SHELL Interface
	 *
	 * Return the current state (Activity Submitted/ Partial Save State.) of activity.
	 */
	function getStatus() {
		return __state.activitySubmitted || __state.activityPariallySubmitted;
	}

	/**
	 * Parse and Update JSON based on OE specific requirements.
	 */
	function parseAndUpdateJSONContent(jsonContent, params) { 
		jsonContent.content.displaySubmit = activityAdaptor.displaySubmit;
		__content.displayTextarea = jsonContent.content.canvas.textbox;
		__content.displaySubmit = activityAdaptor.displaySubmit; 
		
		// __content.activityType = params.variation;
			
		/* Activity Instructions. */
		if(jsonContent.content.instructions && jsonContent.content.instructions[0] && jsonContent.content.instructions[0].tag) {
			var tagName = jsonContent.content.instructions[0].tag;
			__content.directionsXML = jsonContent.content.instructions[0][tagName];			
		}

		__content.maxscore = jsonContent.meta.score.max;
		/* Put directions in JSON. */
		jsonContent.content.directions = __content.directionsXML;

		/* Make options array and attach base path in media. */
		$.each(jsonContent.content.stimulus, function(i) {
			if(this.tag === "options") {
				this.options = this.options.split(",");
			}
			if(this.tag === "image") {
				this.image = params.productAssetsBasePath + this.image;
			}
			if(this.tag === "audio") {
				this.audio = params.productAssetsBasePath + this.audio;
				jsonContent.content.containsAudio = true;
			}
			if(this.tag === "video") {
				this.video = params.productAssetsBasePath + this.video;   
			}
		});
		
		/* Extract interaction id's and tags from question text. */
		var interactionId = "";
		var interactionTag = "";
		/* String present in href of interaction tag. */
		var interactionReferenceString = "http://www.comprodls.com/m1.0/interaction/open";
		/* Parse questiontext as HTML to get HTML tags. */
		var parsedQuestionArray = $.parseHTML(jsonContent.content.canvas.data.questiondata[0].text);
		$.each( parsedQuestionArray, function(i, el) {
		  if(this.href === interactionReferenceString) {
			interactionId = this.childNodes[0].nodeValue.trim();
			interactionTag = this.outerHTML;
			interactionTag = interactionTag.replace(/"/g, "'");
		  }
		});
		/* Replace interaction tag with blank string. */
		jsonContent.content.canvas.data.questiondata[0].text = jsonContent.content.canvas.data.questiondata[0].text.replace(interactionTag,"");
		var questionText = jsonContent.content.canvas.data.questiondata[0].text;
		__content.questionsXML[0] = questionText + " ^^ " + interactionId;
		__content.feedbackXML = jsonContent.feedback;
        if(!jsonContent.feedback["global"]) {
    		if(jsonContent.feedback[interactionId]["fn_contains"]) {
                $.each(jsonContent.feedback[interactionId]["fn_contains"], function(i) {
                    if(this.action === "end-current-question") {
                        __content.correctAnswer = this.keywords;
                        __content.correctFeedback = this.message;
                    } else if (this.action === "end-current-test") {
                        __content.endTestKeywords = this.keywords;
                    }
                }); 
            }
        }
		/* Returning processed JSON. */
		return jsonContent;	
	}

	/**
	 * Function used to display textarea or feedback div(based on requirement).
	 */

	function displayInputArea(savedAnswer) {
        var correctAnswerFound = false;
        if(savedAnswer && savedAnswer.interactions.length) {
            __content.userAnswersXML = (savedAnswer.interactions[0].answer).replace(/^\s+|\s+$/g, '');
            var interactionId = __content.questionsXML[0].split("^^")[1].trim();
            if(__content.correctAnswer === "" && __content.userAnswersXML !== "") {
                displayFeedbackArea();
            } else {
                $.each(__content.correctAnswer, function(i) {
                    /* If answer is correct then append feedback div. */
                    if((__content.userAnswersXML.toLowerCase()).match(this.toLowerCase())) {                        
                        displayFeedbackArea();
                        correctAnswerFound = true; 
                    }  
                });
            }
            /* If answer is not correct then insert textarea. */
            if(!correctAnswerFound) {
                displayTextarea(savedAnswer);
            }
        } else { /* If question not attempted, insert textarea. */
            displayTextarea(); 
        }
    }

    /**
	 * Function to display textarea.
	 */

    function displayTextarea(savedAnswer) {
    	if(__content.displayTextarea) {
            $(__constants.DOM_SEL_ACTIVITY_BODY).append(__constants.USER_INPUT_AREA);
            if(savedAnswer && savedAnswer.interactions.length) {
               $(".activity-body textarea").val(savedAnswer.interactions[0].answer);
            }
            if(__content.displaySubmit) {
                $(__constants.DOM_SEL_ACTIVITY_BODY).append(__constants.SUBMIT_BUTTON_AREA);      
            }
            /* Auto resize iframe container. */           
            activityAdaptor.autoResizeActivityIframe();
        }
    }

    /**
	 * Function to display feedbackarea.
	 */

    function displayFeedbackArea() {
    	var answerWell = $(__constants.USER_ANSWER_WELL).append(__content.userAnswersXML);
        var feedbackWell = $(__constants.FEEDBACK_WELL).append(__content.correctFeedback);
        var feedbackArea = $(__constants.FEEDBACK_AREA).html(answerWell[0].outerHTML + feedbackWell[0].outerHTML);
        $(__constants.DOM_SEL_ACTIVITY_BODY).append(feedbackArea[0].outerHTML);
        $(".activity-body #oe-feedback-area .response-well span").addClass("correct");
        /* Auto resize iframe container. */
        activityAdaptor.autoResizeActivityIframe();
    } 

	/**
	 * Function to process HandleBars template with JSON.
	 */ 
	
	function processLayoutWithContent(layoutHTML, contentJSON) {
		/* Compiling Template Using Handlebars. */
		var compiledTemplate = Handlebars.compile(layoutHTML);

		/*Compiling HTML from Template. */
		var compiledHTML = compiledTemplate(contentJSON);
		return compiledHTML;
	}

	/**
	 * Function to generate user feedback.
	 */

    function showFeedback() {
        var interactionId = __content.questionsXML[0].split("^^")[1].trim();

        /* End current test based on keywords. */
        $.each(__content.endTestKeywords, function(i) {
            if((__content.userAnswersXML.toLowerCase()).match(this.toLowerCase())) {
                 __constants.END_TEST = true; 
            }  
        }); 


        if(!$.isEmptyObject(__content.feedbackJSON)) {
            var feedbackJSON = __content.feedbackJSON;
            
            /* Appned userFeedback in modal. */
            $(".activity-body .userFeedback .modal-body p").html(feedbackJSON[interactionId].content);        
                    
           
        }        
    }

    function getFeedbackJSON(feedbackSource, interactionId) {
        var feedbackJSON = {};
        var id = "";
        var content = "";

        if(feedbackSource === __constants.INTERACTION_FEEDBACK && __content.feedbackXML[interactionId]) {
            var feedback = __content.feedbackXML[interactionId];
            __content.userAnswersXML = $(".activity-body textarea").val();


            /* If feedback object is not empty than generate userFeedback. */
            if(feedback !== "" && feedback !== undefined && !($.isEmptyObject(feedback))) {
                if(__content.userAnswersXML === "") { /* If user answer is empty. */
                    id = "interaction.empty";
                    content = feedback["empty"];
                } else if(__content.userAnswersXML.match(/[^\x00-\x7F]+/)) { /* If user answer contains non-english characters. */
                    id = "interaction.gibberish";
                    content = feedback["gibberish"];
                } else {
                    if(feedback["fn_contains"]) {
                        $.each(feedback["fn_contains"], function(i) { /* Match user answer with keywords to generate corresponding feedback. */
                            var flag = 0;
                            $.each(this.keywords, function(num) {
                                if((__content.userAnswersXML.toLowerCase()).match(this.toLowerCase())) {
                                    flag = 1;
                                }
                            });
                            if(flag) {
                                id = "interaction.contains";
                                content = this.message;
                            }
                        });
                    }               
                }
                /* If userFeedback is still empty, than put default value in it. */
                if(content === "") {
                    id = "interaction.default";
                    content = feedback["default"];
                }
            }   
        }
        feedbackJSON = {
            id: id,
            content: content
        };        

        return feedbackJSON;
    }    

	/**
	 * Function to handle modal close event.
	 */

	function handleModalCloseButton() {
        /* Display feedback area if user answer is correct. */
        $.each(__content.correctAnswer, function(i) {
            if((__content.userAnswersXML.toLowerCase()).match(this.toLowerCase())) {
                $(".oe-body textarea, #submit, .submit-button-area").css("display","none");
        		displayFeedbackArea(); 
            }  
        });          
    }

	/**
	 * Function called to send result JSON to adaptor (partial save OR submit).
	 * Parameters:
	 * 1. bSumbit (Boolean): true: for Submit, false: for Partial Save.
	 */
	function saveResults(bSubmit){
		
		var submitBtnObjectRef = $(__constants.DOM_SEL_ACTIVITY_BODY).attr(__constants.ADAPTOR_INSTANCE_IDENTIFIER); 

		/*Getting answer in JSON format*/
		var answerJSON = getAnswersJSON(false);

        if(!$.isEmptyObject(__content.feedbackJSON)) {
            answerJSON.response.feedback = __content.feedbackJSON;    
        }        

		if(bSubmit===true) {/*Hard Submit*/

            /* Call to generate feedback. */
            showFeedback();            

			/*Send Results to platform*/
			activityAdaptor.submitResults(answerJSON, submitBtnObjectRef, function(data, status){
				if(status=== __constants.STATUS_NOERROR){
					__state.activitySubmitted = true;
					/*Close platform's session*/
					activityAdaptor.closeActivity();
					__state.currentTries = 0;
				} else {
					/* There was an error during platform communication, so try again (till MAX_RETRIES) */             
					if(__state.currentTries < __config.MAX_RETRIES) {
						__state.currentTries++ ;
						saveResults(bSubmit);
					}

				}

			});
		} else{ /*Soft Submit*/
			/*Send Results to platform*/
			activityAdaptor.savePartialResults(answerJSON, submitBtnObjectRef, function(data, status){
				if(status=== __constants.STATUS_NOERROR){
					__state.activityPariallySubmitted = true;
				} else {
					/* There was an error during platform communication, do nothing for partial saves */
				}
			});
		}

	}

	 /**
     * Partial save after every 5 sec once coming in focus.
     */
    function handleQuestionTextOnFocus(event) {
        __constants.PARTIAL_SAVE_TIMER = setInterval(function(){ 
            var newAnswer = $(".activity-body textarea").val();
            /* If user did not change answer don't soft save. */
            if (newAnswer === __content.userAnswersXML) {
                return;
            }

            /* Save new Answer back in __content. */
            __content.userAnswersXML = newAnswer;           
            
            /* Soft save answers. */
            saveResults(false);    
        }, 5000);         
    }

    /**
	 * Partial save after Text Lost Focus.
	 */
	function handleQuestionTextLostFocus(event) {
		var newAnswer = $(".activity-body textarea").val();
        /* If user did not change answer don't soft save. */
        if (newAnswer === __content.userAnswersXML) {
            return;
        }

        var interactionId = __content.questionsXML[0].split("^^")[1].trim();
        
        /* Save new Answer back in __content. */
        __content.userAnswersXML = newAnswer;           
        
        // if(__content.feedbackXML[__constants.GLOBAL_FEEDBACK]) {
        //     var globalFeedbackJSON = getFeedbackJSON(__constants.GLOBAL_FEEDBACK);
        //     if(globalFeedbackJSON && __content.feedbackJSON) {
        //         __content.feedbackJSON.id = globalFeedbackJSON.id;
        //         __content.feedbackJSON.content = globalFeedbackJSON.content;
        //     }
        // }

        if(__content.feedbackXML[interactionId]) {
            var interactionFeedbackJSON = getFeedbackJSON(__constants.INTERACTION_FEEDBACK, interactionId);
            if(interactionFeedbackJSON) {
                __content.feedbackJSON[interactionId] = interactionFeedbackJSON;
            }
        }        

        /* Soft save answers. */
        saveResults(false);
	}

	/**
	 *  Function used to create JSON from user Answers for submit(soft/hard).
	 *  Called by :-
	 *   1. saveResults (internal).
	 *   2. Multi-item-handler (external).
	 */  
	function getAnswersJSON(skipQuestion){

        var score = 0;
        var maxscore = __content.maxscore;
        var answer = "";
        var interaction = {};
        var end_current_test = false;
        var correctAnswer = __content.correctAnswer[0];

        var statusProgress = __constants.ACTIVITY_NOT_ATTEMPTED;
        var statusEvaluation = __constants.ACTIVITY_NOT_APPLICABLE;
        var partiallyCorrect = false;
        var correct = true;
        var incorrect = false;        
        
        /*Setup interaction array */
        var interactionArray = new Array(1);
        
        if (skipQuestion) {
            answer = "Not Answered";
        } else {
            answer = __content.userAnswersXML;
        }
        if(__constants.END_TEST) {
            end_current_test = true;
        } 
        if(answer) {
			if(correctAnswer === answer) {
	            score += maxscore;
	            partiallyCorrect = true;
	        } else {
	        	incorrect = true;
	        	correct = false;
	        }
        } else {
        	correct = false;
        }

        if(correct) {
            statusEvaluation = __constants.ACTIVITY_CORRECT;
        } else if(partiallyCorrect) {
            statusEvaluation = __constants.ACTIVITY_PARTIALLY_CORRECT;
        } else if(incorrect) {
            statusEvaluation = __constants.ACTIVITY_INCORRECT;
        }        
        
        interaction = {
            id: __content.questionsXML[0].split("^^")[1].trim(),
            // interactioncontext: __content.questionsXML[0].split("^^")[0],
            // correctanswer: "",
            score: score,
            // comment: '',
            end_current_test: end_current_test,
            answer: answer,
            maxscore: maxscore
        };
        interactionArray[0] = interaction;
        var response = {
            // "directions": __content.directionsXML,
            "interactions": interactionArray
        }; 
        if(!skipQuestion) {
            statusProgress = __constants.ACTIVITY_IN_PROGRESS;
        }
        response.statusProgress = statusProgress;
        response.statusEvaluation = statusEvaluation;        
        return {
            response: response
        };    
    }

	/**
	 * Function to display last result saved in LMS.
	 */
	function updateLastSavedResults(lastResults) {
		/*__content.userAnswersXML = (lastResults.results[0].answer).replace(/^\s+|\s+$/g, '');
		var interactionId = __content.questionsXML[0].split("^^")[1].trim();*/
        // $.each(lastResults.interactions, function(num) {
        //     __content.userAnswersXML[num] = this.answer.replace(/^\s+|\s+$/g, '').trim();
        //     var interactionId = lastResults.interactions[num].id;
        //     if(__content.feedbackXML[interactionId]) {
        //         var interactionFeedbackJSON = getFeedbackJSON(__constants.INTERACTION_FEEDBACK, interactionId);
        //         if(interactionFeedbackJSON) {
        //             __content.feedbackJSON[interactionId] = interactionFeedbackJSON;
        //         }
        //     }                        
        // });

        // if(__content.feedbackXML[__constants.GLOBAL_FEEDBACK]) {
        //     var globalFeedbackJSON = getFeedbackJSON(__constants.GLOBAL_FEEDBACK);
        //     if(globalFeedbackJSON && __content.feedbackJSON) {
        //         __content.feedbackJSON.id = globalFeedbackJSON.id;
        //         __content.feedbackJSON.content = globalFeedbackJSON.content;
        //     }
        // } 		
	}

	/* Function to show last answers. */
	function showGrades(){
		/* Fill last answered questions */
		/*updateLastSavedResults(lastResults);*/
		
	}  

	function clearGrades(){
		 $(".activity-body .userFeedback .modal-body p").val("");
	}

	function resetAnswers(){
		 $(".activity-body textarea").val("");

        __content.userAnswersXML = "";
        __content.feedbackJSON = {};

        __state.currentTries = 0; 
        __state.activityPariallySubmitted = false; 
        __state.activitySubmitted = false;
	}

	/*
	 * -------------------
	 * DOM EVENT HANDLERS                      
	 * -------------------
	 */
	 
        /**
        * Bound to click of Activity submit button.
        */
    function handleSubmit(event){

        /* Disabling submit button. */
        // $(__constants.DOM_SEL_SUBMIT_BTN).attr('disabled','disabled');
        saveResults(true);
    }

	/**
	 * Escaping HTML codes from String.
	 */
	function getHTMLEscapeValue(content) {	
		var tempDiv = $("<div></div>");
		$(tempDiv).html(content);
		$("body").append(tempDiv);
		content  = $(tempDiv).html();
		$(tempDiv).remove();	
		return content;
	}	

	/**
	 * Setting event listeners.
	 */
	function setupEventHandlers() {
		
		/* Submit button event. */
		$(document).off("click", "#submit").on( "click", "#submit" , function() {
			handleSubmit();
		});

		/* Textarea on focus event. */
        $(document).on( "focus", "textarea" , function() {
            handleQuestionTextOnFocus();
        });

        /* Textarea focus out event. */
        $(document).on( "blur", "textarea" , function() {
        	/* Stop previous timer. */
        	if(__constants.PARTIAL_SAVE_TIMER) {
            	clearInterval(__constants.PARTIAL_SAVE_TIMER);
        	}
			handleQuestionTextLostFocus();
		});

		/* Close modal button event. */
		$(document).off("click", ".close").on( "click", ".close" , function(event) {
			handleModalCloseButton();            
		});
		//$(__constants.DOM_SEL_SUBMIT_BTN).click(handleSubmit);
	}

	/**
	* Function called when audio track is ended (required only in case of Placement test).
	*/
	function audioTrackEnded(){
		__state.audioTrackCompleted = true;
	}

    /**
     * Function used to get item content
     */
    function getItemContent(htmlLayout) {
        var itemContent = {
            "layout": __constants.TEMPLATES[htmlLayout],
            "css": ""
        }
        return itemContent;
    }     
	
	return {
		/*Engine-Shell Interface*/
		"init": init, /* Shell requests the engine intialized and render itself. */
		"getStatus": getStatus, /* Shell requests a gradebook status from engine, based on its current state. */
		"getConfig" : getConfig, /* Shell requests a engines config settings.  */
		"handleSubmit" : handleSubmit,
		"showGrades": showGrades,
		"clearGrades": clearGrades,
        "resetAnswers" : resetAnswers,
		"updateLastSavedResults" : updateLastSavedResults,
        "getItemContent" : getItemContent,
		"displayInputArea": displayInputArea,
        "showFeedback": showFeedback
	};
	};
});

(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})
('/****Audio Activity start****/\r\n\r\n.audiojsZ audio {\r\n    left: -1px;\r\n    position: absolute;\r\n}\r\n.audiojsZ {\r\n    background: #7d7e7d; /* Old browsers */\r\n    /* IE9 SVG, needs conditional override of \'filter\' to \'none\' */\r\n    background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEgMSIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+CiAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkLXVjZ2ctZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgogICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzdkN2U3ZCIgc3RvcC1vcGFjaXR5PSIxIi8+CiAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMzNTM1MzUiIHN0b3Atb3BhY2l0eT0iMSIvPgogIDwvbGluZWFyR3JhZGllbnQ+CiAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0idXJsKCNncmFkLXVjZ2ctZ2VuZXJhdGVkKSIgLz4KPC9zdmc+);\r\n    background: -moz-linear-gradient(top,  #7d7e7d 0%, #353535 100%); /* FF3.6+ */\r\n    background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#7d7e7d), color-stop(100%,#353535)); /* Chrome,Safari4+ */\r\n    background: -webkit-linear-gradient(top,  #7d7e7d 0%,#353535 100%); /* Chrome10+,Safari5.1+ */\r\n    background: -o-linear-gradient(top,  #7d7e7d 0%,#353535 100%); /* Opera 11.10+ */\r\n    background: -ms-linear-gradient(top,  #7d7e7d 0%,#353535 100%); /* IE10+ */\r\n    background: linear-gradient(to bottom,  #7d7e7d 0%,#353535 100%); /* W3C */\r\n    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#7d7e7d\', endColorstr=\'#353535\',GradientType=0 ); /* IE6-8 */\r\n    box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.3);\r\n    font-family: monospace;\r\n    font-size: 12px;  \r\n    overflow: hidden;    \r\n    border-radius: 5px;\r\n}\r\n.audiojsZ {\r\n    width: 75%; \r\n    height: 44px;\r\n    margin-left:12%;\r\n}\r\n.audiojsZ .play-pauseZ {\r\n    border-right: 1px solid #000000;\r\n    float: left;   \r\n    margin: 0;\r\n    overflow: hidden;\r\n    padding: 6px;\r\n}\r\n.audiojsZ .play-pauseZ{\r\n    width: 4%;\r\n    height: 45px; \r\n}\r\n.audiojsZ p {\r\n    cursor: pointer;\r\n    display: none;\r\n    height: 50px;\r\n    margin: 0;\r\n    width: 100%;\r\n}\r\n.audiojsZ .playZ {\r\n    display: block;\r\n}\r\n.audiojsZ .scrubberZ {\r\n    background: none repeat scroll 0 0 #5A5A5A;\r\n    border-bottom: 0;\r\n    border-left: 0;\r\n    border-top: 1px solid #3F3F3F;\r\n    float: left;\r\n    margin: 16px;\r\n    overflow: hidden;\r\n    position: relative;\r\n}\r\n.audiojsZ .scrubberZ{\r\n    height: 14px;\r\n    width: 34%;\r\n}\r\n.audiojsZ .progressZ {\r\n    background: #ffffff; /* Old browsers */\r\n    /* IE9 SVG, needs conditional override of \'filter\' to \'none\' */\r\n    background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEgMSIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+CiAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkLXVjZ2ctZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgogICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmZmZmZiIgc3RvcC1vcGFjaXR5PSIxIi8+CiAgICA8c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI2YxZjFmMSIgc3RvcC1vcGFjaXR5PSIxIi8+CiAgICA8c3RvcCBvZmZzZXQ9IjUxJSIgc3RvcC1jb2xvcj0iI2UxZTFlMSIgc3RvcC1vcGFjaXR5PSIxIi8+CiAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmNmY2ZjYiIHN0b3Atb3BhY2l0eT0iMSIvPgogIDwvbGluZWFyR3JhZGllbnQ+CiAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0idXJsKCNncmFkLXVjZ2ctZ2VuZXJhdGVkKSIgLz4KPC9zdmc+);\r\n    background: -moz-linear-gradient(top,  #ffffff 0%, #f1f1f1 50%, #e1e1e1 51%, #f6f6f6 100%); /* FF3.6+ */\r\n    background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#ffffff), color-stop(50%,#f1f1f1), color-stop(51%,#e1e1e1), color-stop(100%,#f6f6f6)); /* Chrome,Safari4+ */\r\n    background: -webkit-linear-gradient(top,  #ffffff 0%,#f1f1f1 50%,#e1e1e1 51%,#f6f6f6 100%); /* Chrome10+,Safari5.1+ */\r\n    background: -o-linear-gradient(top,  #ffffff 0%,#f1f1f1 50%,#e1e1e1 51%,#f6f6f6 100%); /* Opera 11.10+ */\r\n    background: -ms-linear-gradient(top,  #ffffff 0%,#f1f1f1 50%,#e1e1e1 51%,#f6f6f6 100%); /* IE10+ */\r\n    background: linear-gradient(to bottom,  #ffffff 0%,#f1f1f1 50%,#e1e1e1 51%,#f6f6f6 100%); /* W3C */\r\n    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#ffffff\', endColorstr=\'#f6f6f6\',GradientType=0 ); /* IE6-8 */\r\n    height: 14px;\r\n    left: 0;\r\n    position: absolute;\r\n    top: 0;\r\n    width: 0;\r\n    z-index: 1;\r\n}\r\n.audiojsZ .loadedZ {\r\n    background: #000000; /* Old browsers */\r\n    /* IE9 SVG, needs conditional override of \'filter\' to \'none\' */\r\n    background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEgMSIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+CiAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkLXVjZ2ctZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgogICAgPHN0b3Agb2Zmc2V0PSIxJSIgc3RvcC1jb2xvcj0iIzAwMDAwMCIgc3RvcC1vcGFjaXR5PSIxIi8+CiAgICA8c3RvcCBvZmZzZXQ9IjQ5JSIgc3RvcC1jb2xvcj0iIzI2MjYyNiIgc3RvcC1vcGFjaXR5PSIxIi8+CiAgICA8c3RvcCBvZmZzZXQ9IjUxJSIgc3RvcC1jb2xvcj0iIzNmM2YzZiIgc3RvcC1vcGFjaXR5PSIxIi8+CiAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxMTExMTEiIHN0b3Atb3BhY2l0eT0iMSIvPgogIDwvbGluZWFyR3JhZGllbnQ+CiAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0idXJsKCNncmFkLXVjZ2ctZ2VuZXJhdGVkKSIgLz4KPC9zdmc+);\r\n    background: -moz-linear-gradient(top,  #000000 1%, #262626 49%, #3f3f3f 51%, #111111 100%); /* FF3.6+ */\r\n    background: -webkit-gradient(linear, left top, left bottom, color-stop(1%,#000000), color-stop(49%,#262626), color-stop(51%,#3f3f3f), color-stop(100%,#111111)); /* Chrome,Safari4+ */\r\n    background: -webkit-linear-gradient(top,  #000000 1%,#262626 49%,#3f3f3f 51%,#111111 100%); /* Chrome10+,Safari5.1+ */\r\n    background: -o-linear-gradient(top,  #000000 1%,#262626 49%,#3f3f3f 51%,#111111 100%); /* Opera 11.10+ */\r\n    background: -ms-linear-gradient(top,  #000000 1%,#262626 49%,#3f3f3f 51%,#111111 100%); /* IE10+ */\r\n    background: linear-gradient(to bottom,  #000000 1%,#262626 49%,#3f3f3f 51%,#111111 100%); /* W3C */\r\n    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#000000\', endColorstr=\'#111111\',GradientType=0 ); /* IE6-8 */\r\n    height: 14px;\r\n    left: 0;\r\n    position: absolute;\r\n    top: 0;\r\n    width: 0;\r\n}\r\n.audiojsZ .timeZ {\r\n    border-left: 1px solid #000000;\r\n    border-right: 1px solid #000000;\r\n    color: #DDDDDD;\r\n    float: left;\r\n    height: 50px;\r\n    line-height: 50px;\r\n    padding: 0 8px;\r\n    text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);\r\n/*    width: 16.5%;*/\r\n}\r\n.audiojsZ .timeZ em {\r\n    color: #F9F9F9;\r\n    font-style: normal;\r\n    padding: 0 2px 0 0;\r\n}\r\n.audiojsZ .timeZ strong {\r\n    font-weight: normal;\r\n    padding: 0 0 0 2px;\r\n}\r\n.audiojsZ .error-messageZ {\r\n    color: #FFFFFF;\r\n    display: none;\r\n    float: left;\r\n    height: 50px;\r\n    line-height: 50px;\r\n    margin: 0 10px;\r\n    overflow: hidden;\r\n    text-overflow: ellipsis;\r\n    white-space: nowrap;\r\n    width: 100%;\r\n}\r\n.audiojsZ .error-messageZ a {\r\n    border-bottom: 1px solid #999999;\r\n    color: #EEEEEE;\r\n    padding-bottom: 1px;\r\n    text-decoration: none;\r\n}\r\n.audiojsZ .playZ:before {\r\n    font-family: fontawesome;\r\n    color: white;\r\n    content: \"\\f04b\";\r\n    margin: 6px;\r\n    vertical-align: text-top;\r\n    font-size: 20px;\r\n}\r\n.audiojsZ .loadingZ {\r\n    color: white;\r\n    margin: 2px;\r\n    vertical-align: text-top;\r\n    font-size: 17px;\r\n}\r\n.audiojsZ .errorZ:before {\r\n    content: \"\\f00d\";\r\n    font-family: fontawesome;\r\n    color: white;\r\n    margin: 3px 5px;\r\n    vertical-align: text-top;\r\n    font-size:20px;\r\n}\r\n.audiojsZ .pauseZ:before {\r\n    content: \"\\f04c\";\r\n    font-family: fontawesome;\r\n    color: white;\r\n    margin: 4px;\r\n    vertical-align: text-top;\r\n    font-size: 18px;\r\n}\r\n.playingZ .playZ, .playingZ .loadingZ, .playingZ .errorZ {\r\n    display: none;\r\n}\r\n.playingZ .pauseZ {\r\n    display: block;\r\n}\r\n.loadingZ .playZ, .loadingZ .pauseZ, .loadingZ .errorZ {\r\n    display: none;\r\n}\r\n.loadingZ .loadingZ {\r\n    display: block;\r\n}\r\n.errorZ .timeZ, .errorZ .playZ, .errorZ .pauseZ, .errorZ .scrubberZ, .errorZ .loadingZ {\r\n    display: none;\r\n}\r\n.errorZ .errorZ {\r\n    display: block;\r\n}\r\n.errorZ .play-pauseZ p {\r\n    cursor: auto;\r\n}\r\n.errorZ .error-messageZ {\r\n    display: block;\r\n}\r\n.audiojsZ .volumeZ {\r\n    color: #FFFFFF;\r\n    float:left;\r\n    padding-top: 5px;\r\n    text-align: center;\r\n    width: 35%;\r\n}\r\n.audiojsZ .volumeZ  button{\r\n    padding: 5px;\r\n}\r\n@media (min-width: 768px) and (max-width: 979px) {\r\n   .audiojsZ .volumeZ {\r\n        width: 31%;\r\n    }\r\n}\r\n@media (max-width: 767px) {\r\n   .audiojsZ .volumeZ {\r\n        width: 25%;\r\n    }\r\n\t.audiojsZ {\r\n\t\tmargin-left:5%;\r\n\t}\r\n}\r\n@media (min-width:480px ) and (max-width: 768px) {\r\n\r\n    .audiojsZ .scrubberZ {\r\n        width: 30%;\r\n    }\r\n    .audiojsZ .volumeZ button {\r\n        padding: 2px;\r\n    }\r\n}\r\n@media (max-width: 480px) {\r\n\r\n    .audiojsZ .scrubberZ {\r\n        width: 60%;\r\n    }\r\n}\r\n\r\n/****Audio Activity end****/\r\n/*******************************************************\r\n *\r\n * Core styles for the OE Engine\r\n * \r\n * These styles do not include any product-specific branding\r\n * and/or layout / design. They represent minimal structural\r\n * CSS which is necessary for a default rendering of an\r\n * OE activity\r\n *\r\n * The styles are linked/depending on the presence of \r\n * certain elements (classes / ids / tags) in the DOM (as would\r\n * be injected via a valid OE layout HTML and/or dynamically\r\n * created by the OE engine JS)\r\n *\r\n *******************************************************/\r\n.oe-body textarea {\r\n    margin-top: 20px;\r\n\tmin-height: 100px;\r\n\tborder: 1px solid #A2A2A2;\r\n\tfont-size: 14px;\r\n\tresize: none;\r\n}\r\n.oe-body .audiojsZ .play-pauseZ {\r\n    width: 12%;\r\n}\r\n.oe-body #submit{\r\n\tfloat: right;\r\n\tmargin: 5px;\r\n}\r\n.oe-body .oe-stimulus {\r\n    margin: 25px 0 25px 0;\r\n}\r\n.submit-button-area {\r\n\tborder-left: 1px solid #A2A2A2;\r\n\tborder-bottom: 1px solid #A2A2A2;\r\n\tborder-right: 1px solid #A2A2A2;\r\n\tbackground-color: #eee;\r\n}\r\n.submit-button-area div:first-child {\r\n\tpadding: 10px;\r\n}\r\n.smart-form {\r\n\tmargin-bottom: 15px;\r\n}\r\n#oe-feedback-area {\r\n\tmargin-top: 18px;\t\r\n}\r\n.clear {\r\n\tclear:both;\r\n}\r\n.smart-form p.question-text{\r\n    font-size: 1.8em;\r\n    line-height: 1.1;\r\n}\r\n.response-well {\r\n    border: 1px solid #ddd;\r\n    border-radius: 4px;\r\n    padding: 20px;\r\n    margin: 10px 0px 10px 0px;\r\n    background-color: #eee;\r\n}\r\n.response-well > h4 {\r\n    padding-bottom: 10px;\r\n    font-weight: 700;\r\n}\r\n\r\n.activity-body .btn{\r\n    background-color: #333;\r\n    color: white;\r\n    font-size: 1em;\r\n}\r\n/* CORRECT ANSWER icon/mark */\r\n.oe-body span.correct:before {\r\n    content: \"\\f00c\";\r\n    font-family: fontawesome;\r\n    display: block;\r\n    margin-right: 10px;\r\n    color: #009900;\r\n    float: left;\r\n    font-size: 18px;\r\n    border: 2px solid #009900;\r\n    padding: 3px 5px 3px 5px;\r\n    border-radius: 16px;\r\n}\r\n\r\n');
