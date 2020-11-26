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


define('text!../test/layouts/mcqmc-regular.html',[],function () { return '<!-- iFrame Starts Here-->\r\n{{#with content}}\r\n<div class="activity-body mcq-multiple-body">\r\n    <h2><strong>{{getAdapterParams \'activityName\'}}</strong></h2>\r\n    <p class="instructions">{{{directions}}}</p>\r\n    <div class="smart-form">               \r\n        <p>\r\n           {{#with canvas.data}}\r\n              {{#each questiondata}}\r\n                 {{{this.text}}}\r\n              {{/each}}\r\n           {{/with}}\r\n        </p>            \r\n        <ul class="list-unstyled nested-list">\r\n            {{#each interactions}}\r\n                {{#with this}}\r\n                   {{#each this}}\r\n                      {{#each this}}\r\n                         {{#each this}}      \r\n                            <li>\r\n                               <label class="checkbox checkbox-lg">\r\n                                  <span id="answer{{@index}}" class="invisible wrong"></span>\r\n                                  <input type="checkbox" name="optionsCheck" class="option" id="option{{@index}}" value="{{{this}}}">\r\n                                  <i></i>\r\n                                  <span class="content">{{{this}}}</span>\r\n                               </label>\r\n                            </li>\r\n                         {{/each}} \r\n                      {{/each}}\r\n                   {{/each}}\r\n                {{/with}}\r\n            {{/each}}   \r\n        </ul>\r\n    </div>\r\n    {{#if displaySubmit}}\r\n        <footer>       \r\n            <div class="activity-toolbar">\r\n                <span class="bottom-logo"></span>            \r\n                <p class="pull-right">\r\n                    <button class="btn btn-primary" id="submit">Submit</button>\r\n                </p>           \r\n                <div class="clearfix"></div>        \r\n            </div>   \r\n        </footer>\r\n    {{/if}}\r\n</div>\r\n{{/with}}\r\n<!-- iFrame Ends Here-->';});

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


define('css!../css/mcmr',[],function(){});
/*
 * -------------------
 * Engine Module
 * -------------------
 * 
 * Name: MCQ Multiple Choice Quesion engine
 * Description: A HTML5 activity template for a MCQ Multiple Choice type activity.
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
    
define('mcmr',['text!../test/layouts/mcqmc-regular.html', 'css!../css/mcmr.css'], function (mcqTemplateRef) {

    mcmr = function() {
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
		bookAudio: null /* Used only in case of Audio Activities. */
	};	
	
	/*
	 * Content (loaded / initialized during init() ).
	 */ 
	var __content = {
		directionsXML: "",
		questionXML: "", /* Contains the question obtained from content XML. */
		optionsXML: [], /* Contains all the options for a particular question obtained from content XML. */
		answersXML: [], /* Contains all answers for a particular question obtained from content XML. */
		userAnswersXML: [], /* Contains all user answers for a particular question. */
		maxscore: 0 /* Contains maxscore provided by content creator. */
	};

	/*
	 * Constants.
	 */
	var __constants = {
        /* CONSTANT for HTML selectors */
        DOM_SEL_ACTIVITY_BODY: ".activity-body",

        /* CONSTANT for identifier in which Adaptor Instance will be stored */
        ADAPTOR_INSTANCE_IDENTIFIER: "data-objectid",

		/* CONSTANTS for activity status */
        ACTIVITY_NOT_ATTEMPTED: "not_attempted", /* Activity not yet Attempted. */
        ACTIVITY_IN_PROGRESS: "in_progress", /* In Progress Activity. */
        ACTIVITY_NOT_APPLICABLE: "not_applicable", /* Not Applicable. */ 
        ACTIVITY_PARTIALLY_CORRECT: "partially_correct", /* Partially Correct Activity. */
        ACTIVITY_CORRECT: "correct", /* Correct Activity. */ 
        ACTIVITY_INCORRECT: "incorrect", /* Incorrect Activity. */         

        /* CONSTANT for Activity Layout to be used */
		TEMPLATES: {
            /* Regular MCQ Layout */
            MCQ: mcqTemplateRef
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
				var audios = $("#audio1");				
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
					var type = $(this).find("i").attr("class");
					switch(type){
						case "icon-plus":
							if (volume<100){
								__state.bookAudio.setVolume(0.1 + (volume/100));
								volElem.attr('data-volume',parseInt(volume,10)+10);
								if(volElem.find(".icon-volume-down").length>0){
									volElem.find(".icon-volume-down").toggleClass("icon-volume-up icon-volume-down");
								}
							}
							break;
						case "icon-minus":
							if (volume>0){
								__state.bookAudio.setVolume((volume/100) - 0.1);
								volElem.attr('data-volume',volume-10);
								if(volElem.find(".icon-volume-down").length>0){
									volElem.find(".icon-volume-down").toggleClass("icon-volume-up icon-volume-down");
								}
							}
							break;
						case "icon-volume-up":
							__state.bookAudio.setVolume(0);
							$(this).find("i").toggleClass("icon-volume-up icon-volume-down");
							break;
						case "icon-volume-down":
							__state.bookAudio.setVolume(volume/100);
							$(this).find("i").toggleClass("icon-volume-up icon-volume-down");
							break;
					}

			});
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
			// console.log("Invalid content schema. Please check the underlying " , params["contentFile"]);			
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

		/* Update the DOM and render the processed HTML - main body of the activity */		
		$(elRoot).html(processedHTML);
        
        //$("#submit").attr("data-objectid", adaptor.getId());
        $(__constants.DOM_SEL_ACTIVITY_BODY).attr(__constants.ADAPTOR_INSTANCE_IDENTIFIER, adaptor.getId());
			
		/* Initialize AudioJs engine, if content XML/JSON has an audio element */		
		if(processedJsonContent.containsAudio) {
			initializeAudioJS();
		}
		
		/* Load Previous result IF Resume Mode OR Preview (gradebook) mode. */
		if (params["mode"].activityState === "state_preview" || params["mode"].activityState === "state_resume") {
			renderResults(params);
		}

		/* Render footer if NOT multi-item mode and NOT Gradebook Mode. */			
		if (params["mode"].activityState !== "state_preview") {
			setupEventHandlers();						
		}
		
		/* Inform the shell that init is complete */
		if(callback) {
			callback();
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
	 * Function called to send result JSON to adaptor (partial save OR submit).
	 * Parameters:
	 * 1. bSumbit (Boolean): true: for Submit, false: for Partial Save.
	 */
	function saveResults(bSubmit){
        
        //var submitBtnObjectRef = $("#submit").attr("data-objectid"); 
        var activityBodyObjectRef = $(__constants.DOM_SEL_ACTIVITY_BODY).attr(__constants.ADAPTOR_INSTANCE_IDENTIFIER);

		/*Getting answer in JSON format*/
		var answerJSON = getAnswersJSON(false);

		if(bSubmit===true) {/*Hard Submit*/

			/*Send Results to MyELT*/
			activityAdaptor.submitResults(answerJSON, activityBodyObjectRef, function(data, status){
				if(status==='NO_ERROR'){
					__state.activitySubmitted = true;
					/*Close MyELT's session*/
					activityAdaptor.closeActivity();
					__state.currentTries = 0;
				} else {
					/* There was an error during MyELT communication, so try again (till MAX_RETRIES) */				
					if(__state.currentTries < __config.MAX_RETRIES) {
						__state.currentTries++ ;
						saveResults(bSubmit);
					}

				}

			});
		} else{ /*Soft Submit*/
			/*Send Results to MyELT*/
			activityAdaptor.savePartialResults(answerJSON, activityBodyObjectRef, function(data, status){
				if(status==='NO_ERROR'){
					__state.activityPariallySubmitted = true;
				} else {
					/* There was an error during MyELT communication, do nothing for partial saves */
				}
			});
		}
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
		/* Saving Answer. */
		saveResults(true);

		/* Marking Answers. */
        // if (activityAdaptor.showAnswers) {
        //     markAnswers();
        // }

		$('input[id^=option]').attr("disabled", true);
		
		/* Disabling submit button. */
		$("#submit").attr('disabled','disabled');
	}

	/**
	* Function to handle check box button click.
	*/
	function handleCheckBoxButtonClick(event){
		/*
		 * Soft save here
		 */
		var currentTarget = event.currentTarget;
		var newAnswer = currentTarget.value.replace(/^\s+|\s+$/g, '');
		
		if(currentTarget.checked === true) {
			/* Save new Answer in memory. */
			__content.userAnswersXML.push(newAnswer.replace(/^\s+|\s+$/g, ''));			
		} else if (currentTarget.checked === false) {
			var index = $.inArray(newAnswer.replace(/^\s+|\s+$/g, ''), __content.userAnswersXML);
			if(index !== -1) {
				__content.userAnswersXML.splice(index, 1);
			}
		}

		$(document).triggerHandler('userAnswered');
	}
	
	
    /**
    * Function to show marked answer and mark answers.
    */
    function showGrades(){
        $("input.option").attr("disabled", true); 
        markAnswers();    
        activityAdaptor.autoResizeActivityIframe();
        
    }    

	
	/**
	 *	Function Used to Mark User Answers.
	 */
	function markAnswers(){
		/* Looping through answers to show correct answer. */
		for(var j=0;j<__content.answersXML.length;j++){
			for(var i = 0; i < __content.optionsXML.length; i++){
				if($.inArray(__content.optionsXML[i], __content.answersXML) !== -1) {				
					$("#answer" + i).removeClass("wrong");
					$("#answer" + i).addClass("correct");
                    $("#answer" + i).parent().addClass("state-success");
				} else {
					$("#answer" + i).removeClass("correct");
					$("#answer" + i).addClass("wrong");
                    $("#answer" + i).parent().addClass("state-error");
				}
				$("#answer" + i).removeClass("invisible");
			}
		}
	}


	function clearGrades() {
        $("input.option").attr("disabled", false); 
        markClear();    
        activityAdaptor.autoResizeActivityIframe();
	}

	function markClear() {    
		for(var i = 0; i < __content.optionsXML.length; i++){
			
			$("#answer" + i).removeClass("correct");
            $("#answer" + i).parent().removeClass("state-success");
            $("#answer" + i).parent().removeClass("state-error");
            
            $("#answer" + i).addClass("wrong");
            $("#answer" + i).addClass("invisible");
		}
	}

	function resetAnswers() {
       $("input.option").prop("checked", false);   

		__content.userAnswersXML = [];
    	    
        __state.currentTries = 0; 
        __state.activityPariallySubmitted = false; 
        __state.activitySubmitted = false; 
     
	} 
	
	/**
	 *  Function used to create JSON from user Answers for submit(soft/hard).
	 *  Called by :-
	 *   1. saveResults (internal).
	 *   2. Multi-item-handler (external).
	 */	 
	function getAnswersJSON(skipQuestion){
	    var answer = "";
		var interaction = {};

        var statusProgress = __constants.ACTIVITY_NOT_ATTEMPTED;
        var statusEvaluation = __constants.ACTIVITY_NOT_APPLICABLE;
        var partiallyCorrect = false;
        var correct = true;
        var incorrect = false;

		/*Setup interaction array. */
		var interactionArray = new Array(1);
        /* Split question to get interaction id. */
        var questionData = __content.questionXML.split("^^");
        var interactionId = questionData[2].trim();
		
        if (skipQuestion) {
            answer = "Not Answered";
        } else {
            var flag = true;
            answer =  __content.userAnswersXML.join(" ^^ ");
            var score = 0;
            var maxscore = __content.maxscore;            

            /* Calculating scores.*/
            if(answer) {
	            if(__content.answersXML.length === __content.userAnswersXML.length){
	                for(var i=0; i < __content.answersXML.length; i++) {
	                    if($.inArray(__content.userAnswersXML[i], __content.answersXML) === -1) {
	                        flag = false;
	                        break;
	                    }
	                }
	                if(flag === true) {
	                    score += maxscore;
	                }
	            } else {
                    flag = false;
                }
                if(flag === true) {
                    partiallyCorrect = true
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
        }
		
		interaction = {
			id: interactionId,
			// interactioncontext: __content.questionXML,
			// correctanswer: __content.answersXML.toString(),
			score: score,
			// comment: '',
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
	 * Parse and Update JSON based on MCQSC specific requirements.
	 */
	function parseAndUpdateJSONContent(jsonContent, params) {
        jsonContent.content.displaySubmit = activityAdaptor.displaySubmit;    

		/* Activity Instructions. */
		if(jsonContent.content.instructions && jsonContent.content.instructions[0] && jsonContent.content.instructions[0].tag) {
	        var instructionsTag = jsonContent.content.instructions[0].tag;
	        __content.directionsXML = jsonContent.content.instructions[0][instructionsTag];			
		}

        __content.maxscore = jsonContent.meta.score.max;

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
            }
            if(this.tag === "video") {
                this.video = params.productAssetsBasePath + this.video;   
            }
        });

        /* Extract interaction id's and tags from question text. */
        var interactionId = "";
        var interactionTag = "";

        /* String present in href of interaction tag. */
        var interactionReferenceString = "http://www.comprodls.com/m1.0/interaction/mcqmc";

        /* Parse questiontext as HTML to get HTML tags. */
        var parsedQuestionArray = $.parseHTML(jsonContent.content.canvas.data.questiondata[0].text);
        var j = 0;
        $.each( parsedQuestionArray, function(i) {
          if(this.href === interactionReferenceString) {
            interactionId = this.childNodes[0].nodeValue.trim();
            interactionTag = this.outerHTML;
            interactionTag = interactionTag.replace(/"/g, "'");
            j++;
          }
        });

        /* Replace interaction tag with blank string. */
        jsonContent.content.canvas.data.questiondata[0].text = jsonContent.content.canvas.data.questiondata[0].text.replace(interactionTag,"");
        var questionText = "1.  " + jsonContent.content.canvas.data.questiondata[0].text; 
        var interactionType = jsonContent.content.interactions[interactionId].type;
		var correctAnswers = jsonContent.responses[interactionId].correct;
		
		/*for(var j =0; j < correctAnswers.length; j ++) {
			__content.answersXML.push(jsonContent.content.interactions[interactionId][interactionType][correctAnswers[j]].replace(/^\s+|\s+$/g, ''));	
		}*/
		
        /* Make optionsXML and answerXML from JSON. */
		var optionCount = jsonContent.content.interactions[interactionId][interactionType].length;
		for(var i = 0; i < optionCount; i++) {
            var optionObject = jsonContent.content.interactions[interactionId][interactionType][i];
			var option = optionObject[Object.keys(optionObject)].replace(/^\s+|\s+$/g, '');
			__content.optionsXML.push(getHTMLEscapeValue(option));
			optionObject[Object.keys(optionObject)] = option;
            /* Update JSON after updating option. */
            jsonContent.content.interactions[interactionId][interactionType][i] = optionObject;
            $.each(correctAnswers, function(i) {
                if(Object.keys(optionObject) == this) {
                    __content.answersXML.push(optionObject[Object.keys(optionObject)]);
                }
            })
		}

		__content.questionXML = questionText + " ^^ " + __content.optionsXML.toString() + " ^^ " + interactionId;				
		
		/* Returning processed JSON. */
		return jsonContent;	
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
    	/*
		 *    Capturing check box and adding events.
		 */
		$('input[id^=option]').change(handleCheckBoxButtonClick);  

		$('.loadedZ, .progressZ').click(function(event){
			event.stopPropagation();
		});
		
		$(document).unbind('userAnswered');

		/* Submit button event. */
		$('#submit').click(handleSubmit);

		$(document).bind('userAnswered', function() {
			saveResults(false);
		});
	}
	
	/**
	 * Function to display last result saved in LMS.
	 */	
	function updateLastSavedResults(lastResults) {
        var lastAnswers;
        if(lastResults.interactions.length === 1) {
            lastAnswers = lastResults.interactions[0].answer.split("^^");    
        }
		for(var i=0;i<lastAnswers.length;i++) {
			__content.userAnswersXML.push(lastAnswers[i]);			
			for(var j = 0; j < __content.optionsXML.length; j++) {
				if(lastAnswers[i].trim() === __content.optionsXML[j]) {
					//Displaying results
					$("input#option" + j).attr("checked","checked");
				}
			}			
		}				
	}
    
    /**
	 * Function to force submit current activity and provide answer json with user answer as "Not Answered"
	 */
    function forceSubmit() {
        //var submitBtnObjectRef = $("#submit").attr("data-objectid");
        var activityBodyObjectRef = $(__constants.DOM_SEL_ACTIVITY_BODY).attr(__constants.ADAPTOR_INSTANCE_IDENTIFIER); 
        
        /*Getting answer in JSON format*/
		var answerJSON = getAnswersJSON(true);
        
        /*Send Results to platform*/
		activityAdaptor.submitSkipQuestion(answerJSON, activityBodyObjectRef);
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
        "forceSubmit" : forceSubmit,
        "showGrades": showGrades,
        "clearGrades": clearGrades,
        "resetAnswers" : resetAnswers,
        "getItemContent" : getItemContent,
        "updateLastSavedResults": updateLastSavedResults
  	};
    };
});

(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})
('/*******************************************************\r\n *\r\n * Core styles for the MCQMC Engine\r\n *\r\n * These styles do not include any product-specific branding\r\n * and/or layout / design. They represent minimal structural\r\n * CSS which is necessary for a default rendering of an\r\n * MCQMC activity\r\n *\r\n * The styles are linked/depending on the presence of\r\n * certain elements (classes / ids / tags) in the DOM (as would\r\n * be injected via a valid MCQMC layout HTML and/or dynamically\r\n * created by the MCQMC engine JS)\r\n *\r\n *\r\n *******************************************************/\r\n\r\n.mcq-multiple-body span.correct:before {\r\n    content: \"\\f00c\";\r\n    color: green;\r\n    font-family: fontawesome;\r\n\tmargin: 0 3.5em auto -3.5em;\r\n}\r\n\r\n.mcq-multiple-body span.wrong:before {\r\n    content: \"\\f00d\";\r\n    color: red;\r\n    font-family: fontawesome;\r\n\tmargin: 0 3.5em auto -3.5em;\r\n}');
