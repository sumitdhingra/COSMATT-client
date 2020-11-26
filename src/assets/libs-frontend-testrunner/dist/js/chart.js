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


define('text!../test/layouts/chart-table.html',[],function () { return '{{#with content}}\r\n<div class="activity-body chart-body">  \r\n   <h2><strong>{{getAdapterParams "activityName"}}</strong></h2>    \r\n   <p class="instructions">{{{directions}}} </p>  \r\n   <div class="smart-form">\r\n      <table class="table table-bordered">\r\n         {{#if canvas.data.heading}}\r\n            <thead>\r\n               {{#each tableHeaders}}\r\n                  <th>{{{this}}}</th>\r\n               {{/each}}\r\n            </thead>\r\n         {{/if}}\r\n         {{#each canvas.data.questiondata}}\r\n            <tbody>\r\n               <tr>\r\n                  {{#each this.parts}}\r\n                     <td>{{{this}}}</td>\r\n                  {{/each}}\r\n               </tr>\r\n            <tbody>\r\n         {{/each}}\r\n      </table>  \r\n   </div>\r\n   {{#if displaySubmit}}   \r\n      <footer>      \r\n         <div class="activity-toolbar">\r\n            <span class="bottom-logo"></span>           \r\n            <p class="pull-right">\r\n               <button class="btn btn-primary" id="submit">Submit</button>\r\n            </p>           \r\n            <div class="clearfix"></div>      \r\n         </div>\r\n      </footer>\r\n   {{/if}}\r\n</div>\r\n{{/with}}';});

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


define('css!../css/chart',[],function(){});
/*
 * -------------------
 * Engine Module
 * -------------------
 * 
 * Name: Chart engine
 * Description: A HTML5 activity template for a chart type activity.
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
    
define('chart',['text!../test/layouts/chart-table.html', 'css!../css/chart.css'], function (chartTemplateRef) {
	
  chart = function () {
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
		ENTRY_BOX_PREFIX: 'entry_box_', /* Entry Box Prefix used for ID purpose in text box. */
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
		activitySubmitted: false /* State whether activity has been submitted. Possible Values: true/false(Boolean) */
	};	

	/*
	 * Content (loaded / initialized during init() ).
	 */ 
	var __content = {
        directionsXML: "", /* Contains activity specific instruction obtained from content XML. */
        activtiyDelimiterXML: "", /* Contains activity specific delimiter obtained from content XML. */
        questionsXML: [], /* Contains all questions obtained from content XML. */
		answersXML: {}, /* Contains all correct answers obtained from content XML. */
		userAnswersXML:{}, /* Contains all user answers submiited. */
		maxscore:0 /* Contains maxscore provided by content creator. */
	};
	
	/*
	 * Constants.
	 */
	var __constants = {
        /* CONSTANTS for HTML selectors */
        DOM_SEL_SUBMIT_BTN: "#submit",
        DOM_SEL_ACTIVITY_BODY: ".activity-body",
        DOM_SEL_INPUT_BOX: "userAnswer",
        DOM_SEL_FOOTER: ".activity-toolbar",
        
        /* CONSTANTS for Activity State (Resume / Preview) */
        ACT_STATE_RESUME: "state_resume",
        ACT_STATE_PREVIEW: "state_preview",
        
        /* CONSTANT for identifier in which Adaptor Instance will be stored */
        ADAPTOR_INSTANCE_IDENTIFIER: "data-objectid",

		/* CONSTANTS for activity status */
        ACTIVITY_NOT_ATTEMPTED: "not_attempted", /* Activity not yet Attempted. */
        ACTIVITY_IN_PROGRESS: "in_progress", /* In Progress Activity. */
		ACTIVITY_NOT_APPLICABLE: "not_applicable", /* Not Applicable. */         
        ACTIVITY_PARTIALLY_CORRECT: "partially_correct", /* Partially Correct Activity. */
        ACTIVITY_CORRECT: "correct", /* Correct Activity. */ 
        ACTIVITY_INCORRECT: "incorrect", /* Incorrect Activity. */      
        
        /* CONSTANT for PLATFORM Save Status NO ERROR */
        STATUS_NOERROR: "NO_ERROR",
        
        /* CONSTANTS for Activity Layout to be used */
		TEMPLATES: {
            /* Regular Chart Layout */
            CHART: chartTemplateRef
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

		/* Update the DOM and render the processed HTML - main body of the activity */		
		$(elRoot).html(processedHTML);
        
        //$(__constants.DOM_SEL_SUBMIT_BTN).attr(__constants.ADAPTOR_INSTANCE_IDENTIFIER, adaptor.getId());
        $(__constants.DOM_SEL_ACTIVITY_BODY).attr(__constants.ADAPTOR_INSTANCE_IDENTIFIER, adaptor.getId());       
		
		/* Load Previous result IF Resume Mode OR Preview (gradebook) mode. */
		if (params["mode"].activityState === __constants.ACT_STATE_PREVIEW || params["mode"].activityState === __constants.ACT_STATE_RESUME) {
			renderResults(params);
		}
		
		if (params["mode"].activityState !== __constants.ACT_STATE_PREVIEW) {
			/* HTML Rendering is NOW complete, so setup Event Handlers on the Layout HTML for Chart interaction */														
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
	 * Function called to send result JSON to adaptor (partial save OR submit).
	 * Parameters:
	 * 1. bSumbit (Boolean): true: for Submit, false: for Partial Save.
	 */
	function saveResults(bSubmit) {

        //var submitBtnObjectRef = $(__constants.DOM_SEL_SUBMIT_BTN).attr(__constants.ADAPTOR_INSTANCE_IDENTIFIER);
        var activityBodyObjectRef = $(__constants.DOM_SEL_ACTIVITY_BODY).attr(__constants.ADAPTOR_INSTANCE_IDENTIFIER); 
        
		/*Getting answer in JSON format*/
		var answerJSON = getAnswersJSON(false);

		if (bSubmit === true) { /*Hard Submit*/

			/*Send Results to platform*/
			activityAdaptor.submitResults(answerJSON, activityBodyObjectRef, function (data, status) {
				if (status === __constants.STATUS_NOERROR) {
					__state.activitySubmitted = true;
					
					/*Close platform's session*/
					activityAdaptor.closeActivity();
					
					__state.currentTries = 0;
				} else {
					/* There was an error during platform communication, so try again (till MAX_RETRIES) */				
					if (__state.currentTries < __config.MAX_RETRIES) {
						__state.currentTries++;
						saveResults(bSubmit);
					}
				}

			});
		} else { /*Soft Submit*/
			
			/*Send Results to platform*/
			activityAdaptor.savePartialResults(answerJSON, activityBodyObjectRef, function (data, status) {
				if (status === __constants.STATUS_NOERROR) {
					__state.activityPariallySubmitted = true;
				} else {
					/* There was an error during platform communication, do nothing for partial saves */
				}
			});
		}
	}

	/**
	 * Retrieving all answers from HTML and storing them in memory, Called on click of Submit.
	 */
	function retrieveAllAnswersFromHTML() {
        /* Get interaction id's */
        var keys = Object.keys(__content.answersXML);

        /* Get value of each interaction */
        $.each(keys, function (i) {
            __content.userAnswersXML[this] = $('#' + this).val().replace(/^\s+|\s+$/g, '');
        });
	}

	/*
	 * -------------------
	 * DOM EVENT HANDLERS                      
	 * -------------------
	 */
	 
	/**
	 * Partial save after Text Last Focus.
	 */
	function handleQuestionTextLostFocus(event) {
		var currentTarget = event.currentTarget;
		var newAnswer = currentTarget.value.replace(/^\s+|\s+$/g, '');
		var answerIndex = 0;
		answerIndex = currentTarget.id;
			
		/* If user did not change answer don't soft save. */
		if (newAnswer === __content.userAnswersXML[answerIndex]) {
			return;
		}

		/* Save new Answer back in __content. */
		__content.userAnswersXML[answerIndex] = newAnswer;			
		
		/* Soft save answers. */
		saveResults(false);		
	}
	
	/**
	 * Bound to click of Activity submit button.
	 */
	function handleSubmit(event) {

		/* Retrieving all answers from HTML and storing them in memory. */
		retrieveAllAnswersFromHTML();

		/* Saving Answer. */
		saveResults(true);

		/* Disabling entry(input) boxes on click of Submit. */
		$("." + __constants.DOM_SEL_INPUT_BOX).attr('disabled', 'disabled');
		
		/* Marking Answers. */
        // if (activityAdaptor.showAnswers) {
        //     markAnswers();
        //     activityAdaptor.autoResizeActivityIframe();
        // }

		/* Disabling submit button. */
		$(__constants.DOM_SEL_SUBMIT_BTN).attr('disabled', 'disabled');
	}

    /* Function to show last answers and mark answers. */
    function showGrades() {
        /* Disable answered questions */
        // $.each(lastResults.interactions, function(i) {
        //     if(this.answer !== "" && this.answer !== undefined) {
        //         $("#" + this.id).attr('disabled', 'disabled');
        //         $("#" + this.id).addClass("state-disabled");  
        //     }    
        // });
		$("." + __constants.DOM_SEL_INPUT_BOX).attr('disabled', 'disabled');        
        /* Mark answers if only question fully attempted */
        // var mark = false;
        // for (var i = 0; i < lastResults.interactions.length; i++) {
        //     if(lastResults.interactions[i].answer === "" || lastResults.interactions[i].answer === undefined) {
        //         mark = false;
        //         break;
        //     } else {
        //         mark = true;
        //     }
        // }
        // if(mark || reviewMode) {
        //     markAnswers();
        //     activityAdaptor.autoResizeActivityIframe();
        // }        
        
        markAnswers();
        activityAdaptor.autoResizeActivityIframe();
        
    }
	
	/**
	 * Function to show correct Answers to User, called on click of Show Answers Button.
	 */
	function markAnswers() {
        /* Get interaction id's. */
        var keys = Object.keys(__content.userAnswersXML);
        $.each(keys, function(i) {
            var correctAnswer = __content.answersXML[keys[i]];
            var userAnswer = __content.userAnswersXML[keys[i]];
            markBlank(keys[i],  correctAnswer, userAnswer);
        });
    }
    
    /**
	 * Function to higlight a partcular input box with Red (answer is wrong) and Green (answer is correct).
     * Also, display correct answer after the blank if the answer is wrong.
	 */
    function markBlank(interactionId, correctAnswer, userAnswer) {    
		/* Looping through answers to show correct answer. */
        if (correctAnswer === userAnswer) {
            $('#' + interactionId).closest('label').addClass("state-success");
        } else if($('#' + interactionId).siblings().length === 0) {
            $('#' + interactionId).after("<span id='correctAnswer' style='color:green'> (" + correctAnswer + ")" + "</span>");
            $('#' + interactionId).closest('label').addClass("state-error");
        }
	}

	function clearGrades()
	{	$("." + __constants.DOM_SEL_INPUT_BOX).attr('disabled', false);
		var keys = Object.keys(__content.userAnswersXML);
        $.each(keys, function(i) {
            markClear(keys[i]);
        });
        activityAdaptor.autoResizeActivityIframe();
	}

	function markClear(interactionId) {    
		$('#' + interactionId).closest('label').removeClass("state-success");
        $('#' + interactionId).closest('label').removeClass("state-error");
        $('#correctAnswer').remove();
        /* Enabling submit button. */
		$(__constants.DOM_SEL_SUBMIT_BTN).removeAttr('disabled');
    }

	function resetAnswers(){
		$("." + __constants.DOM_SEL_INPUT_BOX).val("");

		var keys = Object.keys(__content.userAnswersXML);
		$.each(keys, function(i) {
            __content.userAnswersXML[this] = "";
        });
    	    
        __state.currentTries = 0; 
        __state.activityPariallySubmitted = false; 
        __state.activitySubmitted = false; 

	}

	/**
      * Function to Resume Mode & Preview activity (gradebook mode).
      */
	function renderResults(params) {
		/* Resume Mode or Preview Gradebook Mode. */
		if (params["mode"].activityState === __constants.ACT_STATE_RESUME || params["mode"].activityState === __constants.ACT_STATE_PREVIEW) {	
		
			activityAdaptor.getLastResults(function (results) {

                /* Get activity state. */
				updateLastSavedResults(results, true);
                
                /* Mark Answers in Preview Gradebook Mode. */
                if (params["mode"].activityState === __constants.ACT_STATE_PREVIEW) {    
                    /* Mark Answers. */
                    markAnswers();

                    /* Hiding activity Toolbar (Includes buttons :- Submit, Show Answers, Hide Answers.). */
                    $(__constants.DOM_SEL_FOOTER).hide();

                    /* Disabling user answer entry boxes. */
                    $("." + __constants.DOM_SEL_INPUT_BOX).attr('readonly', 'readonly');				
                }
			});		
		}
	}
	
	/**
	 *  Function used to create JSON from user Answers for submit(soft/hard).
	 *  Called by :-
	 *   1. saveResults (internal).
	 *   2. Multi-item-handler (external).
	 */
	function getAnswersJSON(skipQuestion) {
        var answer = "";
		var interaction = {};
        var answerKeys = Object.keys(__content.answersXML);
        var questionText = "";

        var statusProgress = __constants.ACTIVITY_NOT_ATTEMPTED;
        var statusEvaluation = __constants.ACTIVITY_NOT_APPLICABLE;
        var partiallyCorrect = false;
        var correct = true;
        var incorrect = false;
				
		/*Setup interaction array */
		var interactionArray = new Array(answerKeys.length);
        $.each(answerKeys, function(i) {
            var interactionScore = 0;
            var interactionMaxScore = __content.maxscore/answerKeys.length;
            if (skipQuestion) {
                answer = "Not Answered";
            } else {
                answer = __content.userAnswersXML[this].toString();
                /* Calculating scores.*/
                if(answer) {
	                if (__content.answersXML[this].toUpperCase() === __content.userAnswersXML[this].toUpperCase()) {
						interactionScore += interactionMaxScore;
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
            }
            /* Get questionText having this id as interaction id */
            $.each(__content.questionsXML, function(num) {
                if(this.questionText.indexOf(answerKeys[i]) > -1) {
                    questionText = this.questionText;
                }
            });
            interaction = {
                id: this,
                // interactioncontext: questionText,
                // correctanswer: __content.answersXML[this],
                score: interactionScore,
                // comment: '',
                answer: answer,
                maxscore: interactionMaxScore
            };
            interactionArray[i] = interaction;

        });

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
      
    function parseAndUpdateJSONContent(jsonContent, params) {
        var blankNumber = 0;
        var question = jsonContent.content.canvas.data.questiondata;
        __content.activtiyDelimiterXML = jsonContent.content.canvas.data.heading.delimiter;

        if(jsonContent.content.instructions && jsonContent.content.instructions[0] && jsonContent.content.instructions[0].tag) {
        	var tagName = jsonContent.content.instructions[0].tag;	
        	__content.directionsXML = jsonContent.content.instructions[0][tagName];
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
        $.each(question, function (num) {

            /* Extract interaction id's and tags from question text. */
            var interactionId = [];
            var interactionTag = [];

            /* String present in href of interaction tag. */
            var interactionReferenceString = "http://www.comprodls.com/m1.0/interaction/chart";
            /* Parse question text as html to get HTML tags. */
            var parsedQuestionArray = $.parseHTML(this.text);
            var j = 0;
            $.each( parsedQuestionArray, function(i) {
                /* If href is same as string than this tag is interaction tag. */
                if(this.href === interactionReferenceString) {
                    interactionId[j] = this.childNodes[0].nodeValue.trim();
                    interactionTag[j] = this.outerHTML;
                    interactionTag[j] = interactionTag[j].replace(/"/g, "'");
                    j++;
                }
            });
            this.answers = 0;
            this.answerIndex = "";
            this.questionText = this.text;
            /* Split question on delimeter. */
            this.parts = this.questionText.split(__content.activtiyDelimiterXML);
            j = 0;
            $.each(this.parts, function (questionParts) { 
               if (this.indexOf(interactionTag[j]) > -1) {
                __content.answersXML[interactionId[j]] = jsonContent.responses[interactionId[j]].correct;
                    question[num].parts[questionParts] = this.replace(interactionTag[j],"<label class='input'><input type='text' id='" + interactionId[j] + "' class='" + __constants.DOM_SEL_INPUT_BOX + "'/></label>");
                   question[num].answers ++;
                   
                   if (question[num].answerIndex === "") {
                        question[num].answerIndex = blankNumber;
                    } else {
                        question[num].answerIndex += __content.activtiyDelimiterXML + blankNumber;
                    }
                    blankNumber ++;
                    __content.userAnswersXML[interactionId[j]] = "";
                    j++;
                }       
            });
            __content.questionsXML.push(this);
        });

		/* Add displaySubmit, tableHeaders and directions field in json.content */
        jsonContent.content.displaySubmit = activityAdaptor.displaySubmit;  
        jsonContent.content.tableHeaders = jsonContent.content.canvas.data.heading.text.split(__content.activtiyDelimiterXML);
        jsonContent.content.directions = __content.directionsXML;

		/* Returning processed JSON. */
		return jsonContent;	
    }

	/**
	 * Setting event listeners.
	 */
	function setupEventHandlers() {
		/* Chart Entry Box blur event. */
		$("." + __constants.DOM_SEL_INPUT_BOX).blur(handleQuestionTextLostFocus);

		/* Submit button event. */
		$(__constants.DOM_SEL_SUBMIT_BTN).click(handleSubmit);
	}

	/**
	 * Function to display last result saved in LMS.
	 */
	function updateLastSavedResults(lastResults, isGradebookPreview) {
		/* Displaying results. */
		var result = lastResults.interactions;
		for (var i = 0; i < result.length; i++) {
			var id = result[i].id;
			var answer = result[i].answer;

			__content.userAnswersXML[id] = answer;
			/* Displaying results. */
			$("#" +  id).val(answer);
		}		
	}
    
    /**
	 * Function to force submit current activity and provide answer json with user answer as "Not Answered"
	 */
    function forceSubmit() {
        //var submitBtnObjectRef = $(__constants.DOM_SEL_SUBMIT_BTN).attr(__constants.ADAPTOR_INSTANCE_IDENTIFIER); 
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
('/*******************************************************\r\n *\r\n * Core styles for the CHART Engine\r\n * \r\n * These styles do not include any product-specific branding\r\n * and/or layout / design. They represent minimal structural\r\n * CSS which is necessary for a default rendering of an\r\n * CHART activity\r\n *\r\n * The styles are linked/depending on the presence of \r\n * certain elements (classes / ids / tags) in the DOM (as would\r\n * be injected via a valid CHART layout HTML and/or dynamically\r\n * created by the CHART engine JS)\r\n * \r\n * DOM Dependencies\r\n * (1) QUESTION BLANKS (where user types answers): one or more <input type=\"text\" ....> elements enclosed \r\n *     inside container with class=\"chart-body\"\r\n *\r\n *\r\n *\r\n *******************************************************/\r\n\r\n/* input type text box styles */\r\n.chart-body .smart-form .input input {\r\n    border-width: 0 0px 1px 0px;\r\n    display: inline;\r\n    width: 80%;\r\n}\r\n\r\n.chart-body .smart-form .input {\r\n    display: inline;\r\n}\r\n\r\n.chart-body .table thead tr {\r\n    font-size: 1.143em;    \r\n}\r\n\r\n.chart-body .table tbody tr, .chart-body .smart-form .input input {\r\n    font-size: 1em;\r\n    font-weight: normal;\r\n}');
