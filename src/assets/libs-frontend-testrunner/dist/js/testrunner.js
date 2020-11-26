(function () {
    adaptormap = {};
    renderActivityMap = {};

    TestRunner = function () {
        "use strict";

        /*************************************************************
         * Private variables
         **************************************************************/

        /* Product Assets Base Path (for accessing images, videos or other assets referenced by questions) */
        var productAssetsBasePath = "";

        /* Media/Assets configurations. */
        var mediaManager = {};

        /* Platform or Container base path (shared/common dependencies) for bower components. */
        var dependencyBase = "../";        

        /* Display Submit. Whether you want to give your own submit button or want to use activity built in submit button. */
        var displaySubmit = false;

        /* Codemirror instance. */
        var codeMirrorInstance;

        /* Render preferences (size, color, resizing, etc.) */
        // var renderOverrides = {}; 

        /* Event Context Object. */
        var eventContextObj = "";

        /* To be used for encryption/decryption of responses and feedback. */
        // var key;

        /************************************************************* 
         * Constants
         **************************************************************/ 
        var PROFILE_SMART_ADMIN = 'SMARTADMIN'; //Internally uses libs-frontend-core library.
        var PROFILE_BOOTSTRAP = 'VANILLA_BOOTSTRAP'; //Internally uses bootstrap library.         
        var PROFILE_COSMATT1 = 'COSMATT_PROFILE1';
        var PROFILE_COSMATT2 = 'COSMATT_PROFILE2';
        var ITEM_TYPE_CORE = 'core';
        var ITEM_TYPE_EXTERNAL = 'external';        

        /*
         * Engine and layout mapping.
         * engineType - Defines the type of Item(Engine). We currently receive this value from activities.json
         * layoutType - Defines the layout type of Item. We currently receive this value from activities.json 
         * engineID - This value is passed to engine, which it further uses to uniquely identify how to parse the question.
         * engineName - This further refers to the engine file name.
         */
        var engineOverrides = {
            "FIB" : {               
                "CHART" : {
                    "engine": "chart",
                    "variation": "CHART"
                },
                "DND_FIB" : {
                    "engine": "dnd",
                    "variation": "DND_FIB"
                },
                "DND_MATCH" : {
                    "engine": "dnd",
                    "variation": "DND_MATCH"
                },
                "DND_TABLE" : {
                    "engine": "dnd",
                    "variation": "DND_TABLE"
                },
                "DND_VIDEO" : {
                    "engine": "dnd",
                    "variation": "DND_VIDEO"
                }
            }
        };

        /* 
         * Function used to initialize test runner. 
         * uniqueTestId - Unique Test Id.
         * paths - Paths.
         * containerElementRef - Iframe container Id.
         * renderOverrides - Render preferences (size, color, resizing, etc.)
         * eventContext - Contains all callback notifications i.e. functions originating from inside the engine.
         * loaderId - Loader Id. (Optional)
         * secretKey - To be used for encryption/decryption of responses and feedback. (Optional)         
         * mediaManagerObj - Media configurations.
         */
        var init = function(uniqueTestId, paths, containerElementRef, renderOverrides, eventContext, loaderId, secretKey, mediaManagerObj) {

            /* ----Setting globals to be required while paintintg the questions.---- */
            if(paths && paths.productAssets) {
                productAssetsBasePath = paths.productAssets;
            }                        
            if(mediaManagerObj) {
                mediaManager = mediaManagerObj;
            }
            if(paths && paths.dependencyBase && paths.dependencyBase !== "") {
                dependencyBase = paths.dependencyBase + "libs-frontend-testrunner/";
            } else {
                dependencyBase = paths.dependencyBase + "../";
            }
            // if(paintPrefsObj) {
            //     renderOverrides = paintPrefsObj;
            // }
            // if(secretKey && !$.isEmptyObject(secretKey)) {
            //     key = secretKey;
            // }
            eventContextObj = eventContext;
            if(loaderId) {
                loaderId = "#" + loaderId;
            } else {
                loaderId = undefined;
            }

            var containerID = "#" + containerElementRef;

            renderActivityMap[uniqueTestId] = {
                "renderOverrides": renderOverrides,
                "secretKey": secretKey,
                "containerID": containerID,
                "runtimeProfile": ""
            };

            /* --------Setup Adaptor-- */
            var adaptor = new AdapterGenerator(uniqueTestId);
            var activityadapter = adaptor.getActivityAdapter({
                "iframeContainerId" : containerID,
                "iframeId" : "#iframe_" + uniqueTestId,
                "loaderId": loaderId,
                "autoResize": renderOverrides.autoResize,
                "renderOverrides": renderOverrides,
                "doAfterSaveResult" : afterItemSubmit,
                "doAfterSavePartialResult" : afterItemSavePartialResult,
                "doAfterInitializationCompleted" : afterItemLoaded,
                "doAfterDimensionChange" : afterDimensionChange,
                "doAfterSkipQuestion": doAfterSkipQuestion,
                "itemChangedInEditor" : itemChangedInEditor,
                "doAfterItemSavedInEditor" : doAfterItemSavedInEditor,
                "sendStatement" : sendStatement
            });   
            adaptormap[uniqueTestId] = activityadapter;
            eventContextObj.initializationCompleted();
        }; 
    
        /* 
         * Function used to paint question.
         * uniqueTestId - Unique Test Id.         
         * questionParams - Parameters containtinfg all information about ONE question required to navigate between questions.
         * engineParams - Parameters containtinfg all information about engine.         
         * mode - mode in which you want to paint your question. Possible Values : MODE_ENGINE, MODE_EDITOR.
         * runtimeProfile - Using this choose the common/shared libraries which should be loaded for your engine. Possible Values - SMARTADMIN, VANILLA_BOOTSTRAP.
         * callback - Callback function.
         */             
        var paintQuestion = function(uniqueTestId, questionParams, engineParams, mode, runtimeProfile, callback) {

          if(mode === "MODE_EDITOR") {              
            if(engineParams.supportsEditor) {
              questionParams.engine += '-EDITOR';
              questionParams.variation += '_EDITOR';                
            } else {
              if(!codeMirrorInstance) {
                $(renderActivityMap[uniqueTestId].containerID).html('<section class="widget"><textarea id="json-textarea"></textarea></section>');
                codeMirrorInstance = CodeMirror.fromTextArea(document.getElementById('json-textarea'), {
                  lineNumbers:true,
                  theme:'twilight',
                  scrollbarStyle:'native',
                  mode:{
                    name: 'javascript', 
                    json: true
                  }
                }); 
              }
              codeMirrorInstance.setValue(JSON.stringify(questionParams.content, null, 4));
              /* ---------------------- SETUP EVENTHANDLER STARTS----------------------------*/
              setUpEventHandlers(uniqueTestId);
              /* ---------------------- SETUP EVENTHANDLER ENDS----------------------------*/
              if(callback) {
                callback();
              }
              return;               
            }                
          }

          if(questionParams.content) {
            var questionFeedback = questionParams.content.feedback;
            var questionResponses = questionParams.content.responses;
            if(!$.isEmptyObject(questionResponses)) {
              var questionFeedbackJSON;
              if(!$.isEmptyObject(questionFeedback)) {
                questionFeedbackJSON = JSON.parse(JSON.stringify(questionFeedback));
              }
              var questionResponsesJSON = JSON.parse(JSON.stringify(questionResponses));
              if((!$.isEmptyObject(questionFeedback) && typeof questionFeedbackJSON !== 'object') || typeof questionResponsesJSON !== 'object') {
                var secretKey = renderActivityMap[uniqueTestId].secretKey;
                if(secretKey && !$.isEmptyObject(secretKey)) {
                  if(typeof questionFeedbackJSON !== 'object') {
                    try {
                      questionFeedback = JSON.parse(questionFeedback);
                      var cipher = forge.aes.createDecryptionCipher(secretKey);
                      var iv = "comprodls1234";
                      cipher.start(iv);
                      questionFeedback.__proto__ = Object.getPrototypeOf(cipher.output);
                      cipher.update(questionFeedback);
                      cipher.finish();
                      var decryptedFeedback = cipher.output.data;
                      decryptedFeedback = forge.util.decodeUtf8(decryptedFeedback);
                      decryptedFeedback = JSON.parse(decryptedFeedback);
                      if(typeof decryptedFeedback ==='object') {
                        questionParams.content.feedback = decryptedFeedback;
                      } else {
                        return;
                      }
                    }
                    catch(err) {
                      console.error("Secret Key: " + secretKey);
                      console.error("Question Feedback: " + questionFeedback.toString());
                      console.error(err.message);
                      return;
                    }                           
                  }
                  if(typeof questionResponsesJSON !=='object') {
                    try {
                      questionResponses = JSON.parse(questionResponses);
                      var cipher = forge.aes.createDecryptionCipher(secretKey);
                      var iv = "comprodls1234";
                      cipher.start(iv);
                      questionResponses.__proto__ = Object.getPrototypeOf(cipher.output);
                      cipher.update(questionResponses);
                      cipher.finish();
                      var decryptedResponses = cipher.output.data;
                      decryptedResponses = forge.util.decodeUtf8(decryptedResponses);
                      decryptedResponses = JSON.parse(decryptedResponses);
                      if(typeof decryptedResponses ==='object') {
                        questionParams.content.responses = decryptedResponses;
                      } else {
                        return;
                      }
                    }
                    catch(err) {
                      console.error("Secret Key: " + secretKey);
                      console.error("Question Response: " + questionResponses.toString());                      
                      console.error(err.message);
                      return;
                    }
                  }                                                         
                } else {
                  return;
                }                            
              }
            } else {
              return;
            }
          }

          if(renderActivityMap[uniqueTestId].renderOverrides.displaySubmit) {
            displaySubmit = renderActivityMap[uniqueTestId].renderOverrides.displaySubmit;
          }
          if(questionParams.engine === 'OPEN') {
            displaySubmit = true;    
          }
          questionParams.displaySubmit = displaySubmit;

          if(engineParams && engineParams.type === ITEM_TYPE_EXTERNAL) {
            //External engines.
            questionParams.engine = questionParams.engine.toLowerCase();
            questionParams.engineType = engineParams.engineType;
            var externalPath = engineParams.externalPath;
            if(externalPath) {
              if(location.protocol === "https:" && externalPath.substr(0, externalPath.indexOf("//")) !== "https:") {
                return;
              }
              if(externalPath.includes('github.com')) {
                externalPath = externalPath.replace('github.com', 'rawgit.com');
              }
              if(externalPath.charAt(externalPath.length - 1) !== "/") {
                externalPath = externalPath.concat('/');
              }
              questionParams.externalPath = externalPath;
            }
          } else {
            //Core engines.
            if(engineOverrides[questionParams.engine] && engineOverrides[questionParams.engine][questionParams.variation]) {
              questionParams.engine = engineOverrides[questionParams.engine][questionParams.variation].engine + '-min-' + '1.8.5';
            } else {
              questionParams.engine = questionParams.engine.toLowerCase();
              questionParams.engine = questionParams.engine + '-min-' + '1.8.5';
            }
          }   
          questionParams.variation = questionParams.variation.toUpperCase();

          questionParams.productAssetsBasePath = productAssetsBasePath;
          questionParams.mediaManager = mediaManager;
          questionParams.renderOverrides = renderActivityMap[uniqueTestId].renderOverrides;

          var activityadapter = adaptormap[uniqueTestId];    
          if($(activityadapter.adapterConfig.iframeId).length !== 0 && activityadapter.shell && runtimeProfile === renderActivityMap[uniqueTestId].runtimeProfile) {
            activityadapter.launchNewItem(questionParams);
          } else {
            if(runtimeProfile === PROFILE_SMART_ADMIN) {
              questionParams.html = "<!DOCTYPE html><html lang='en' class='medium'><head><meta content='text/html; charset=UTF-8' http-equiv='Content-Type'><meta charset='utf-8'><title>Activity Content</title><link rel='stylesheet' href='" + dependencyBase + "dist/css/libs-frontend-core-min-0.6.4.css'><style type='text/css'>body,html{background:none repeat scroll 0 0 #fff}html{font-size:14px}html.small{font-size:12px}html.medium{font-size:14px}html.large{font-size:16px}body{font-size:1em;font-family:Arial}html.open-sans-font,html.open-sans-font body{font-family:'Open Sans',Verdana}html.oswald-font,html.oswald-font body{font-family:Oswald,cursive}html.roboto-font,html.roboto-font body{font-family:Roboto,Arial,sans-serif}#placeholder{padding:0}.activity-body .btn{background-color:#637182;color:#fff;font-size:1em}.activity-body h2{font-size:1.6em;margin:7px 0}.activity-body h3{border-bottom:2px solid #CECECE}.activity-body hr{border-bottom:1px dashed #C2C2C2;margin:1.1em}.activity-body p.instructions{font-size:1.1em}.activity-body button i.fa{color:#000}.activity-body .smart-form p{color:#366894;font-size:1.286em}.activity-body .smart-form .instructions{color:#000;margin-top:7px}.activity-body .smart-form ol{width:100%}.activity-body .smart-form ol li{padding:.7em .4em .7em 1.8em}.activity-body .smart-form ul{width:100%}.activity-body .smart-form ul li{padding:.7em .4em .7em 1.8em}.activity-body .smart-form ul li.highlight{background-color:#F2F2F2;border-radius:6px}.activity-body .smart-form .label{font-size:1em;line-height:1.8em}.activity-body .smart-form .checkbox,.activity-body .smart-form .radio{font-size:1em;line-height:1.8em;color:#3D3D3D}.activity-body .smart-form .radio.state-error input:checked+i{border-color:#a90329}.activity-body .smart-form .radio.state-error input+i:after{background-color:#a90329}.activity-body .smart-form .radio.state-success input:checked+i{border-color:#7dc27d}.activity-body .smart-form .radio.state-success input+i:after{background-color:#7dc27d}.activity-body .smart-form .checkbox.state-error input:checked+i{border-color:#a90329}.activity-body .smart-form .checkbox.state-error input+i:after{color:#a90329}.activity-body .smart-form .checkbox.state-success input:checked+i{border-color:#7dc27d}.activity-body .smart-form .checkbox.state-success input+i:after{color:#7dc27d}.activity-body footer{margin-top:.5em}button .glyphicon{color:#000;line-height:2}.fixed-header{height:100%}.scroll-pane{overflow-y:auto;position:absolute;width:100%}.fixed-footer{bottom:0;position:absolute;width:100%}.style-yellow,.style-yellow .activity-body .smart-form .radio i,.style-yellow body{background:#f7f1cf}.small .activity-body .smart-form ul li{padding:.2em .2em .2em 1.8em}.large .radio-lg i,.medium .radio-lg i{height:1.8em;width:1.8em;top:-.1em}.large .radio-lg input+i:after,.medium .radio-lg input+i:after{height:1.2em;width:1.2em;top:.3em;left:.3em}.large .checkbox-lg i,.medium .checkbox-lg i{top:0;height:1.8em;width:1.8em}.large .checkbox-lg input+i::after,.medium .checkbox-lg input+i::after{font:1.6em/1.2em FontAwesome;left:.1em}.large .checkbox-lg input:checked:hover+i::after,.medium .checkbox-lg input:checked:hover+i::after{left:.15em}.large .radio-sm i,.medium .radio-sm i{height:1.4em;width:1.4em;top:.2em}.large .radio-sm input+i:after,.medium .radio-sm input+i:after{height:1em;left:.2em;top:.2em;width:1em}.ribbon-adjustments{margin:30px 30px 0}</style></head><body><div id='placeholder' class='placeholder ribbon-adjustments'></div><script src='" + dependencyBase + "dist/js/require-min-1.9.8.js' type='text/javascript'></script><script type='text/javascript'>require.config({paths: {'vendor': '" + dependencyBase + "dist/js/vendor-min-1.8.5','shell': '" + dependencyBase + "dist/js/shell-min-1.8.6'},shim: {'shell': {deps: ['vendor']}}});require(['shell'], function(shellRef){var shell = new Shell('" + uniqueTestId + "');shell.init();});</script></body></html>";
            } else if(runtimeProfile === PROFILE_COSMATT1) {
              questionParams.html = "<!DOCTYPE html><html lang='en' class='medium'><head><meta content='text/html; charset=UTF-8' http-equiv='Content-Type'><meta charset='utf-8'><title>Activity Content</title><link rel='stylesheet' href='" + dependencyBase + "dist/css/libs-frontend-core-min-0.6.4.css'><style type='text/css'>body,html{background:none repeat scroll 0 0 #fff}html{font-size:14px}html.small{font-size:12px}html.medium{font-size:14px}html.large{font-size:16px}body{font-size:1em;font-family:Open Sans}html.open-sans-font,html.open-sans-font body{font-family:'Open Sans',Verdana}html.oswald-font,html.oswald-font body{font-family:Oswald,cursive}html.roboto-font,html.roboto-font body{font-family:Roboto,Arial,sans-serif}#placeholder{padding:0}.activity-body .btn{background-color:#637182;color:#fff;font-size:1em}.activity-body h2{font-size:1.6em;margin:7px 0}.activity-body h3{border-bottom:2px solid #CECECE}.activity-body hr{border-bottom:1px dashed #C2C2C2;margin:1.1em}.activity-body p.instructions{font-size:1.1em}.activity-body button i.fa{color:#000}.activity-body .smart-form p{color:#366894;font-size:1.286em}.activity-body .smart-form .instructions{color:#000;margin-top:7px}.activity-body .smart-form ol{width:100%}.activity-body .smart-form ol li{padding:.7em .4em .7em 1.8em}.activity-body .smart-form ul{width:100%}.activity-body .smart-form ul li{padding:.7em .4em .7em 1.8em}.activity-body .smart-form ul li.highlight{background-color:#F2F2F2;border-radius:6px}.activity-body .smart-form .label{font-size:1em;line-height:1.8em}.activity-body .smart-form .checkbox,.activity-body .smart-form .radio{font-size:1em;line-height:1.8em;color:#3D3D3D}.activity-body .smart-form .radio.state-error input:checked+i{border-color:#a90329}.activity-body .smart-form .radio.state-error input+i:after{background-color:#a90329}.activity-body .smart-form .radio.state-success input:checked+i{border-color:#7dc27d}.activity-body .smart-form .radio.state-success input+i:after{background-color:#7dc27d}.activity-body .smart-form .checkbox.state-error input:checked+i{border-color:#a90329}.activity-body .smart-form .checkbox.state-error input+i:after{color:#a90329}.activity-body .smart-form .checkbox.state-success input:checked+i{border-color:#7dc27d}.activity-body .smart-form .checkbox.state-success input+i:after{color:#7dc27d}.activity-body footer{margin-top:.5em}button .glyphicon{color:#000;line-height:2}.fixed-header{height:100%}.scroll-pane{overflow-y:auto;position:absolute;width:100%}.fixed-footer{bottom:0;position:absolute;width:100%}.style-yellow,.style-yellow .activity-body .smart-form .radio i,.style-yellow body{background:#f7f1cf}.small .activity-body .smart-form ul li{padding:.2em .2em .2em 1.8em}.large .radio-lg i,.medium .radio-lg i{height:1.8em;width:1.8em;top:-.1em}.large .radio-lg input+i:after,.medium .radio-lg input+i:after{height:1.2em;width:1.2em;top:.3em;left:.3em}.large .checkbox-lg i,.medium .checkbox-lg i{top:0;height:1.8em;width:1.8em}.large .checkbox-lg input+i::after,.medium .checkbox-lg input+i::after{font:1.6em/1.2em FontAwesome;left:.1em}.large .checkbox-lg input:checked:hover+i::after,.medium .checkbox-lg input:checked:hover+i::after{left:.15em}.large .radio-sm i,.medium .radio-sm i{height:1.4em;width:1.4em;top:.2em}.large .radio-sm input+i:after,.medium .radio-sm input+i:after{height:1em;left:.2em;top:.2em;width:1em}.ribbon-adjustments{margin:30px 30px 0}</style><link rel='stylesheet' href='" + dependencyBase + "dist/css/cosmatt-min.css'></head><body><div id='placeholder' class='placeholder ribbon-adjustments'></div><script src='" + dependencyBase + "dist/js/require-min-1.9.8.js' type='text/javascript'></script><script type='text/javascript'>require.config({paths: {'vendor': '" + dependencyBase + "dist/js/vendor-min-1.8.5','shell': '" + dependencyBase + "dist/js/shell-min-1.8.6'},shim: {'shell': {deps: ['vendor']}}});require(['shell'], function(shellRef){var shell = new Shell('" + uniqueTestId + "');shell.init();});</script></body></html>";
            } else if(runtimeProfile === PROFILE_COSMATT2) {
              questionParams.html = "<!DOCTYPE html><html lang='en' class='medium'><head><meta content='text/html; charset=UTF-8' http-equiv='Content-Type'><meta charset='utf-8'><title>Activity Content</title><link rel='stylesheet' href='" + dependencyBase + "dist/css/bootstrap.min.css'><link rel='stylesheet' href='" + dependencyBase + "dist/css/font-awesome.min.css'><style type='text/css'>body,html{background:none repeat scroll 0 0 #fff}html{font-size:14px}html.small{font-size:12px}html.medium{font-size:14px}html.large{font-size:16px}body{font-size:1em;font-family:Open Sans}html.open-sans-font,html.open-sans-font body{font-family:'Open Sans',Verdana}html.oswald-font,html.oswald-font body{font-family:Oswald,cursive}html.roboto-font,html.roboto-font body{font-family:Roboto,Arial,sans-serif}#placeholder{padding:0}.activity-body .btn{background-color:#637182;color:#fff;font-size:1em}.activity-body h2{font-size:1.6em;margin:7px 0}.activity-body h3{border-bottom:2px solid #CECECE}.activity-body hr{border-bottom:1px dashed #C2C2C2;margin:1.1em}.activity-body p.instructions{font-size:1.1em}.activity-body button i.fa{color:#000}.activity-body .smart-form p{color:#366894;font-size:1.286em}.activity-body .smart-form .instructions{color:#000;margin-top:7px}.activity-body .smart-form ol{width:100%}.activity-body .smart-form ol li{padding:.7em .4em .7em 1.8em}.activity-body .smart-form ul{width:100%}.activity-body .smart-form ul li{padding:.7em .4em .7em 1.8em}.activity-body .smart-form ul li.highlight{background-color:#F2F2F2;border-radius:6px}.activity-body .smart-form .label{font-size:1em;line-height:1.8em}.activity-body .smart-form .checkbox,.activity-body .smart-form .radio{font-size:1em;line-height:1.8em;color:#3D3D3D}.activity-body .smart-form .radio.state-error input:checked+i{border-color:#a90329}.activity-body .smart-form .radio.state-error input+i:after{background-color:#a90329}.activity-body .smart-form .radio.state-success input:checked+i{border-color:#7dc27d}.activity-body .smart-form .radio.state-success input+i:after{background-color:#7dc27d}.activity-body .smart-form .checkbox.state-error input:checked+i{border-color:#a90329}.activity-body .smart-form .checkbox.state-error input+i:after{color:#a90329}.activity-body .smart-form .checkbox.state-success input:checked+i{border-color:#7dc27d}.activity-body .smart-form .checkbox.state-success input+i:after{color:#7dc27d}.activity-body footer{margin-top:.5em}button .glyphicon{color:#000;line-height:2}.fixed-header{height:100%}.scroll-pane{overflow-y:auto;position:absolute;width:100%}.fixed-footer{bottom:0;position:absolute;width:100%}.style-yellow,.style-yellow .activity-body .smart-form .radio i,.style-yellow body{background:#f7f1cf}.small .activity-body .smart-form ul li{padding:.2em .2em .2em 1.8em}.large .radio-lg i,.medium .radio-lg i{height:1.8em;width:1.8em;top:-.1em}.large .radio-lg input+i:after,.medium .radio-lg input+i:after{height:1.2em;width:1.2em;top:.3em;left:.3em}.large .checkbox-lg i,.medium .checkbox-lg i{top:0;height:1.8em;width:1.8em}.large .checkbox-lg input+i::after,.medium .checkbox-lg input+i::after{font:1.6em/1.2em FontAwesome;left:.1em}.large .checkbox-lg input:checked:hover+i::after,.medium .checkbox-lg input:checked:hover+i::after{left:.15em}.large .radio-sm i,.medium .radio-sm i{height:1.4em;width:1.4em;top:.2em}.large .radio-sm input+i:after,.medium .radio-sm input+i:after{height:1em;left:.2em;top:.2em;width:1em}.ribbon-adjustments{margin:30px 30px 0}</style><link rel='stylesheet' href='" + dependencyBase + "dist/css/cosmatt-min.css'></head><body><div id='placeholder' class='placeholder ribbon-adjustments'></div><script src='" + dependencyBase + "dist/js/require-min-1.9.8.js' type='text/javascript'></script><script type='text/javascript'>require.config({paths: {'vendor': '" + dependencyBase + "dist/js/vendor-min-1.8.5','shell': '" + dependencyBase + "dist/js/shell-min-1.8.6'},shim: {'shell': {deps: ['vendor']}}});require(['shell'], function(shellRef){var shell = new Shell('" + uniqueTestId + "');shell.init();});</script></body></html>";
            } else {
              questionParams.html = "<!DOCTYPE html><html lang='en' class='medium'><head><meta content='text/html; charset=UTF-8' http-equiv='Content-Type'><meta charset='utf-8'><title>Activity Content</title><link rel='stylesheet' href='" + dependencyBase + "dist/css/bootstrap.min.css'><link rel='stylesheet' href='" + dependencyBase + "dist/css/font-awesome.min.css'><style type='text/css'>body,html{background:none repeat scroll 0 0 #fff}html{font-size:14px}html.small{font-size:12px}html.medium{font-size:14px}html.large{font-size:16px}body{font-size:1em;font-family:Arial}html.open-sans-font,html.open-sans-font body{font-family:'Open Sans',Verdana}html.oswald-font,html.oswald-font body{font-family:Oswald,cursive}html.roboto-font,html.roboto-font body{font-family:Roboto,Arial,sans-serif}#placeholder{padding:0}.activity-body .btn{background-color:#637182;color:#fff;font-size:1em}.activity-body h2{font-size:1.6em;margin:7px 0}.activity-body h3{border-bottom:2px solid #CECECE}.activity-body hr{border-bottom:1px dashed #C2C2C2;margin:1.1em}.activity-body p.instructions{font-size:1.1em}.activity-body button i.fa{color:#000}.activity-body .smart-form p{color:#366894;font-size:1.286em}.activity-body .smart-form .instructions{color:#000;margin-top:7px}.activity-body .smart-form ol{width:100%}.activity-body .smart-form ol li{padding:.7em .4em .7em 1.8em}.activity-body .smart-form ul{width:100%}.activity-body .smart-form ul li{padding:.7em .4em .7em 1.8em}.activity-body .smart-form ul li.highlight{background-color:#F2F2F2;border-radius:6px}.activity-body .smart-form .label{font-size:1em;line-height:1.8em}.activity-body .smart-form .checkbox,.activity-body .smart-form .radio{font-size:1em;line-height:1.8em;color:#3D3D3D}.activity-body .smart-form .radio.state-error input:checked+i{border-color:#a90329}.activity-body .smart-form .radio.state-error input+i:after{background-color:#a90329}.activity-body .smart-form .radio.state-success input:checked+i{border-color:#7dc27d}.activity-body .smart-form .radio.state-success input+i:after{background-color:#7dc27d}.activity-body .smart-form .checkbox.state-error input:checked+i{border-color:#a90329}.activity-body .smart-form .checkbox.state-error input+i:after{color:#a90329}.activity-body .smart-form .checkbox.state-success input:checked+i{border-color:#7dc27d}.activity-body .smart-form .checkbox.state-success input+i:after{color:#7dc27d}.activity-body footer{margin-top:.5em}button .glyphicon{color:#000;line-height:2}.fixed-header{height:100%}.scroll-pane{overflow-y:auto;position:absolute;width:100%}.fixed-footer{bottom:0;position:absolute;width:100%}.style-yellow,.style-yellow .activity-body .smart-form .radio i,.style-yellow body{background:#f7f1cf}.small .activity-body .smart-form ul li{padding:.2em .2em .2em 1.8em}.large .radio-lg i,.medium .radio-lg i{height:1.8em;width:1.8em;top:-.1em}.large .radio-lg input+i:after,.medium .radio-lg input+i:after{height:1.2em;width:1.2em;top:.3em;left:.3em}.large .checkbox-lg i,.medium .checkbox-lg i{top:0;height:1.8em;width:1.8em}.large .checkbox-lg input+i::after,.medium .checkbox-lg input+i::after{font:1.6em/1.2em FontAwesome;left:.1em}.large .checkbox-lg input:checked:hover+i::after,.medium .checkbox-lg input:checked:hover+i::after{left:.15em}.large .radio-sm i,.medium .radio-sm i{height:1.4em;width:1.4em;top:.2em}.large .radio-sm input+i:after,.medium .radio-sm input+i:after{height:1em;left:.2em;top:.2em;width:1em}.ribbon-adjustments{margin:30px 30px 0}</style></head><body><div id='placeholder' class='placeholder ribbon-adjustments'></div><script src='" + dependencyBase + "dist/js/require-min-1.9.8.js' type='text/javascript'></script><script type='text/javascript'>require.config({paths: {'vendor': '" + dependencyBase + "dist/js/vendor-min-1.8.5','shell': '" + dependencyBase + "dist/js/shell-min-1.8.6'},shim: {'shell': {deps: ['vendor']}}});require(['shell'], function(shellRef){var shell = new Shell('" + uniqueTestId + "');shell.init();});</script></body></html>";
            }
            activityadapter.launch(questionParams);
          }

          if(runtimeProfile) {
            renderActivityMap[uniqueTestId].runtimeProfile = runtimeProfile;
          }          

          if(callback) {
            callback();
          }               
        }; 

        /* 
         * Function used to setup event handlers.
         * uniqueTestId - Unique Test Id.
         */ 
        var setUpEventHandlers = function(uniqueTestId) {
          codeMirrorInstance.on("change", function(codeMirrorInstance, change) {
            itemChangedInEditor(uniqueTestId, JSON.parse(codeMirrorInstance.getValue()));
          });
        };        

        /* 
         * Function used to update paint preferences.
         * activitySettings - Settings comprise of attributes like background color, font size etc.
         * uniqueTestId - ID to uniquely identify an object.         
         */  
        var updateRenderPreferences = function(uniqueTestId, activitySettings) {
            if(uniqueTestId) {
                var activityadapter = adaptormap[uniqueTestId];
                activityadapter.setRenderOverrides(activitySettings);
            } else {
                for (var key in adaptormap) {
                  if (adaptormap.hasOwnProperty(key)) {
                    var activityadapter = adaptormap[key];
                    activityadapter.setRenderOverrides(activitySettings);
                  }
                }
            }
        };
                
        /* 
         * Function used for submitting answers forcefully.
         * uniqueTestId - ID to uniquely identify an object.                  
         */     
        var forceSubmit = function(uniqueTestId) {
            var activityadapter = adaptormap[uniqueTestId];
            activityadapter.forceSubmit();            
        };      

        /* 
         * Function used for skipping any question.
         * uniqueTestId - ID to uniquely identify an object.         
         */     
        var skipQuestion = function(uniqueTestId) {
            var activityadapter = adaptormap[uniqueTestId];
            activityadapter.shell.getActivityDelegate().skipQuestionActivity();              
        };     

        /* 
         * Function used for submitting an answer.
         * uniqueTestId - ID to uniquely identify an object.         
         */     
        var submitAnswer = function(uniqueTestId) {
            var activityadapter = adaptormap[uniqueTestId];
            activityadapter.shell.getActivityDelegate().submitActivity();
        };    

        /* 
         * Function used for showing grades.
         * uniqueTestId - ID to uniquely identify an object.         
         */     
        var showGrades = function(uniqueTestId) {
            var activityadapter = adaptormap[uniqueTestId];
            activityadapter.shell.getActivityDelegate().showGrades();
        }; 

        var clearGrades = function(uniqueTestId) {
            var activityadapter = adaptormap[uniqueTestId];
            activityadapter.shell.getActivityDelegate().clearGrades();
        }; 

        var resetAnswers = function(uniqueTestId) {
            var activityadapter = adaptormap[uniqueTestId];
            activityadapter.shell.getActivityDelegate().resetAnswers();
        }; 

        /* 
         * Function used to display input area.
         * uniqueTestId - ID to uniquely identify an object.
         * savedAnswer - Already saved answer.
         */
        var displayInputArea = function(uniqueTestId, savedAnswer) {
            var activityadapter = adaptormap[uniqueTestId];
            activityadapter.shell.getActivityDelegate().displayInputArea(savedAnswer);
        };

        /* 
         * Function used to show feedback.
         * uniqueTestId - ID to uniquely identify an object.
         */
        var showFeedback = function(uniqueTestId) {
            var activityadapter = adaptormap[uniqueTestId];
            activityadapter.shell.getActivityDelegate().showFeedback();
        };

        /* 
         * Function used to show feedback.
         * uniqueTestId - ID to uniquely identify an object.
         */
        // var showInteractionFeedback = function(uniqueTestId) {
        //     var activityadapter = adaptormap[uniqueTestId];
        //     activityadapter.shell.getActivityDelegate().showInteractionFeedback();
        // };                

        /* 
         * Function used for updating last saved results.
         * uniqueTestId - ID to uniquely identify an object.
         * savedAnswer - Already saved answer.         
         */     
        var updateLastSavedResults = function(uniqueTestId, savedAnswers) {
            var activityadapter = adaptormap[uniqueTestId];
            activityadapter.shell.getActivityDelegate().updateLastSavedResults(savedAnswers);
        };                       

        /* 
         * Event to inform that item/question is successfully saved.
         * uniqueTestId - ID to uniquely identify an object.
         * json - Question JSON with user answer and correct answer.
         */     
        var afterItemSavePartialResult = function(uniqueTestId, json) {
            if(eventContextObj.afterPartialSave) {
                eventContextObj.afterPartialSave(uniqueTestId, json);    
            }
        };
        
        /* 
         * Event to inform that item/question is successfully submitted.
         * uniqueTestId - ID to uniquely identify an object.
         * json - Question JSON with user answer and correct answer.         
         */             
        var afterItemSubmit = function(uniqueTestId, json) {
            if(eventContextObj.afterCompleted) {
                eventContextObj.afterCompleted(uniqueTestId, json);    
            }
        };

        var sendStatement = function(uniqueTestId, statement) {
            if(eventContextObj.sendStatement) {
                eventContextObj.sendStatement(uniqueTestId, statement);
            }
        };

        /* 
         * Event to inform that item/question is successfully submitted.
         * uniqueTestId - ID to uniquely identify an object.
         * json - Question JSON with user answer and correct answer.         
         */             
        var doAfterSkipQuestion = function(uniqueTestId, json) {
            if(eventContextObj.doAfterSkipQuestion) {
                eventContextObj.doAfterSkipQuestion(uniqueTestId, json);    
            }
        };        

        /* 
         * Event to inform that item/question is successfully loaded.
         * engineConfig - Engine Config.         
         * uniqueTestId - ID to uniquely identify an object.
         */     
        var afterItemLoaded = function(engineConfig, uniqueTestId) {
            if(eventContextObj.afterLoaded) {
                eventContextObj.afterLoaded(uniqueTestId);    
            }
        }; 

        /* 
         * Event to inform that item is succesfully loaded and taken its required height and width.
         * activityResizeParams - Activity Resize Parameters.         
         * uniqueTestId - ID to uniquely identify an object.         
         */   
        var afterDimensionChange = function(activityResizeParams, uniqueTestId) {
            if(eventContextObj.afterDimensionChange) {
                eventContextObj.afterDimensionChange(uniqueTestId, activityResizeParams);              
            }
        };  

        /* 
         * Event to inform that item/question is changed in editor mode.
         */     
        var itemChangedInEditor = function(uniqueTestId, json) {
            if(eventContextObj.itemChangedInEditor) {
                eventContextObj.itemChangedInEditor(uniqueTestId, json);    
            }
        };    

        /* 
         * Event to inform that item/question is successfully edited.
         * uniqueTestId - Unique Test Id.
         * json - Question JSON with user answer and correct answer.          
         */  
        var doAfterItemSavedInEditor = function(uniqueTestId, json) {
            if(eventContextObj.doAfterItemSavedInEditor) {
                eventContextObj.doAfterItemSavedInEditor(uniqueTestId, json);    
            }
        }; 

        /* 
         * Function used to get item content.
         * uniqueTestId - Unique Test Id.
         * layout - Selected Layout.
         */     
        var getItemContent = function(uniqueTestId, layout) {
            var activityadapter = adaptormap[uniqueTestId];
            return activityadapter.shell.getActivityDelegate().getItemContent(layout);
        };         

        /* 
         * Function used for submitting edited changes.
         * uniqueTestId - Unique Test Id.         
         */     
        var saveItemInEditor = function(uniqueTestId, supportsEditor) {
        	if(supportsEditor) {
	            var activityadapter = adaptormap[uniqueTestId];
	            activityadapter.shell.getActivityDelegate().saveItemInEditor();        		
        	} else {
        		doAfterItemSavedInEditor(uniqueTestId, JSON.parse(codeMirrorInstance.getValue()));
        	}
        };                                                                   

        return {
            "init": init,
            "adaptormap": adaptormap,
            "paintQuestion": paintQuestion,
            "updateRenderPreferences": updateRenderPreferences,
            "forceSubmit": forceSubmit,
            "skipQuestion": skipQuestion,
            "submitAnswer": submitAnswer,
            "showGrades": showGrades,
            "clearGrades": clearGrades,
            "resetAnswers": resetAnswers,
            "updateLastSavedResults": updateLastSavedResults,
            "displayInputArea": displayInputArea,
            "showFeedback": showFeedback,
            // "showInteractionFeedback": showInteractionFeedback,
            "saveItemInEditor": saveItemInEditor,
            "getItemContent": getItemContent
        };
    };
    return TestRunner;
}());