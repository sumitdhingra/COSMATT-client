/*JSHINT global variables*/
/*global window */
/*global com */
/*global jQuery*/
/*global document*/

utils = (function () {
    "use strict";

    // Activity launch mode state
    var LAUNCH_MODE_STATE_START = 'state_start';
    var LAUNCH_MODE_STATE_RESUME = 'state_resume';
    var LAUNCH_MODE_STATE_PREVIEW = 'state_preview';
    var LAUNCH_MODE_STATE_SPLASH = 'state_splash';
    
    // Buffer scroll height for iframe resizing activity
    var bufferScrollHeight = 20;
	
	/***************************************************** Helper functions Starts *****************************************************/
    
    /**
     *  Purpose: Internal function to resize the iframe according to its content.
     *  Input: adapterConfig: adaptor conguration
     *         engineConfig - Configuration of engine
     *         platformAdapter - Instance of adapter object.
     */
    var autoResizeActivityIframe = function(adapterConfig, engineConfig, platformAdapter) {
       var newheight = 0;
       /* If engine configuration is defined and has resize mode property set to "manual",
        * then set height of activity container height to
        * 1) Height specified for activity in toc. If not specified then
        * 2) Height specified in engine configuration. If not specified then
        * 3) Auto calculate of height
        */
       if(engineConfig !== undefined && engineConfig !== null) {
           var resizeMode = engineConfig.RESIZE_MODE;
           if(resizeMode !== undefined && resizeMode !== null && resizeMode.toLowerCase() === "manual") {
               var resizeHeight = parseInt(engineConfig.RESIZE_HEIGHT, 10);
               var tocHeight;
               if(platformAdapter !== undefined) {
                   tocHeight = parseInt(platformAdapter.RESIZE_HEIGHT, 10);
               }
               if(tocHeight !== undefined && tocHeight !== null && tocHeight !== "" && !isNaN(tocHeight)) {
                   newheight = tocHeight;
               } else if(resizeHeight !== undefined && resizeHeight !== null && resizeHeight !== "" && !isNaN(resizeHeight)) {
                   newheight = resizeHeight;
		       }
           }
       }
        var $iframe = jQuery(adapterConfig.iframeId);
        var $iframeParent = $iframe.parent();
        //To prevent scroll bar from moving up
        $iframeParent.css('height', $iframeParent.height());
        $iframe.css('height', '');
        // Converting jquery object to dom object
        var body = $iframe.get(0).contentWindow.document.body,
            html = $iframe.get(0).contentWindow.document.documentElement;
        if(newheight === 0) {
          newheight = Math.max(body.scrollHeight, body.offsetHeight,
                            html.clientHeight, html.scrollHeight, html.offsetHeight);
        }
        newheight += bufferScrollHeight;
        
        $iframe.css('height', newheight + "px");
        $iframeParent.css('height', '');
        
        // CALL CONATINER EVENT FOR HEIGHT CHANGE
        if (adapterConfig.doAfterDimensionChange !== undefined && jQuery.isFunction( adapterConfig.doAfterDimensionChange )) {
            var data = {};
            data.CURRENT_HEIGHT = newheight;
            data.MIN_HEIGHT = $(adapterConfig.iframeId).contents().find('body').height();
            
            var uniqueTestId = undefined;
            
            if(platformAdapter !== undefined) {
                uniqueTestId =  platformAdapter.id;
            }
            
            adapterConfig.doAfterDimensionChange(data, uniqueTestId);
        }
    };
    
    /***************************************************** Helper functions Ends *****************************************************/

    /***************************************************** Launch mode Starts *****************************************************/
    /**
     * Function returns possible activity launch mode.
     */
    var getActivityLaunchMode = function () {
        return {
            "LAUNCH_MODE_STATE_START" : LAUNCH_MODE_STATE_START,
            "LAUNCH_MODE_STATE_RESUME" : LAUNCH_MODE_STATE_RESUME,
            "LAUNCH_MODE_STATE_PREVIEW" : LAUNCH_MODE_STATE_PREVIEW,
            "LAUNCH_MODE_STATE_SPLASH" : LAUNCH_MODE_STATE_SPLASH
        };
    };
    /***************************************************** Launch mode Ends *****************************************************/

    /********************************************************/
    /*              Public                                  */
    /********************************************************/
    return {
        "getActivityLaunchMode" : getActivityLaunchMode,
        "autoResizeActivityIframe" : autoResizeActivityIframe
    };
})();

/*JSHINT global variables*/
/*global com */
/*global jQuery */

var AdapterGenerator = (function () {
    "use strict";
    
    // var that = {};
    var STATUS_OK = 'PLATFORM_OK';
    var STATUS_FAIL = 'PLATFORM_FAIL'; 
    
    // Activity launch modes - state_start, state_resume, etc
    var launchModeTypes = utils.getActivityLaunchMode();
    var winWidth = jQuery(window).width();
    var winHeight = jQuery(window).height();
    
    // Token mismatch json
    var tokenMismatchJson = {
        'readyState' : 4,
        'status' : 401,
        'statusText' : 'Either activity session is closed or does not exist.',
        'responseText' : '<html><head><title>Failure - Token Mismatch</title><body><p>Either activity session is closed or does not exist.</p></body></html>'
    };

    // Success json data for other platforms (workbench, test, etc)
    var otherPlatformDummyData = {
        'readyState' : 4,
        'status' : 200,
        'statusText' : 'No interaction with LMS',
        'responseText' : '<html><head><title>Success</title><body><p>No interaction with LMS.</p></body></html>'
    };

    // Adapter parameters with default values
    var defaultAdapterParams = {
        engineType: "",
        engine: "",
        content: "",
        externalPath: "",
        videoRoot: "",
        displaySubmit: true,
        productAssetsBasePath: "",
        mediaManager: {},
        showAnswers: true,
        variation: "",
        activityName: "Default Activity Name",
        currentAttempt : 0,
        maxAttempts : 0,
        splashScreen: '',
        RESIZE_MODE : 'auto', // TOC resize mode (RESIZE_MODE) parameter.
        RESIZE_HEIGHT: 0, // TOC resize height (RESIZE_HEIGHT) parameter.
        MIN_HEIGHT_THRESHOLD : 0, // TOC minimum threshold height (MIN_HEIGHT_THRESHOLD) parameter.
        renderOverrides: {},
        mode: {
                'activityState' : launchModeTypes.LAUNCH_MODE_STATE_START
              },
       lastResults : ""
    };
    
    /* Constructor function */
    function adapterGenerator(id){
        var that = this;
        this.id = id;
        this.shell = undefined;
        this.activityEngineConfig;
        this.renderOverridesHandler;
        this.eventObj = {
            fired: false
        },
        this.platformStatus = {
            code : STATUS_OK,
            message  : "Success"
        },
        // Adapter configuration with default values
        this.adapterConfig = {
            loaderId : "#loader", // Default value of iframe loader
            iframeContainerId : "#iframeContainer", // Default value of iframe container
            iframeId : "#activity_container", // Default value of iframe
            autoResize: true, // Default value of auto resizing set to true.
            loadedResources : [],
            loadedJS: [],
            loadedCSS : [],
            doAfterInitializationCompleted :  function(){}, //Function called after activity calls initializationCompleted
            autoResizeActivityIframe : "",  //For autoResizing Iframe
            doAfterSavePartialResult : function(){},
            doAfterSaveResult : function(){},
            doAfterSkipQuestion:  function(){},
            itemChangedInEditor : function(){},
            doAfterItemSavedInEditor : function(){}
        },
        /**
         * Purpose: platform Adapter which acts as Interface Between HTML5 Activity and LMS parent Window.
         * Responsibilities:    1. Maintain Launch Parameters to be Used by HTML5 activity.
         *                      2. Provide functions to facilitate interface between HTML5 activity and LMS.
         *                          a. Save Results.
         *                          b. Close Activity Session.
         *                          c. Get Last Results to be passed to HTML5 activity.
         */
        this.platformAdapter = {
            //Launch Parameters - START
            engineType: defaultAdapterParams.engineType,
            engine: defaultAdapterParams.engine,
            content: defaultAdapterParams.content,
            externalPath: defaultAdapterParams.externalPath,
            videoRoot: defaultAdapterParams.videoRoot,
            displaySubmit: defaultAdapterParams.displaySubmit,
            productAssetsBasePath: defaultAdapterParams.productAssetsBasePath,
            mediaManager: defaultAdapterParams.mediaManager,
            showAnswers: defaultAdapterParams.showAnswers,
            variation: defaultAdapterParams.variation,
            activityName: defaultAdapterParams.activityName,
            splashScreen: defaultAdapterParams.splashScreen,
            RESIZE_MODE: defaultAdapterParams.RESIZE_MODE,
            RESIZE_HEIGHT: defaultAdapterParams.RESIZE_HEIGHT, // TOC resize height (RESIZE_HEIGHT) parameter.
            MIN_HEIGHT_THRESHOLD: defaultAdapterParams.MIN_HEIGHT_THRESHOLD,
            renderOverrides: defaultAdapterParams.renderOverrides,
            mode: defaultAdapterParams.mode,
            currentAttempt : defaultAdapterParams.currentAttempt,
            maxAttempts : defaultAdapterParams.maxAttempts,
            lastResults :  defaultAdapterParams.lastResults,
            getParameterMap: function () {
                return {
                    "engineType": this.engineType,
                    "engine": this.engine,
                    "content": this.content,
                    "externalPath": this.externalPath,
                    "videoRoot": this.videoRoot,
                    "variation": this.variation,
                    "displaySubmit": this.displaySubmit,
                    "productAssetsBasePath": this.productAssetsBasePath,
                    "mediaManager": this.mediaManager,
                    "showAnswers": this.showAnswers,
                    "activityName": this.activityName,
                    "splashScreen": this.splashScreen,
                    "renderOverrides": this.renderOverrides,
                    "mode": this.mode,
                    "currentAttempt": this.currentAttempt,
                    "maxAttempts": this.maxAttempts
                };
            },
            getId: function(){
                return that.id;
            },
            setShellObject: function (shellObj) {
                that.shell = shellObj;
            },
            showLoadingSpinner: function () {
                jQuery(that.adapterConfig.loaderId).removeClass('hidden');
            },
            hideLoadingSpinner: function () {
                jQuery(that.adapterConfig.loaderId).addClass('hidden');
            },
            initializationCompleted: function (engineConfig, engineEventsObj) {
                that.activityEngineConfig = engineConfig;
                if (engineEventsObj !== undefined) {
                    that.renderOverridesHandler = engineEventsObj.renderOverridesHandler;
                }
                that.adapterConfig.doAfterInitializationCompleted(engineConfig, that.id);
                jQuery(that.adapterConfig.iframeContainerId).removeClass("invisible");
                jQuery(that.adapterConfig.loaderId).addClass("hidden");
                this.autoResizeActivityIframe(engineConfig);
            },
            autoResizeActivityIframe: function () {
                if(this.adapterConfig.autoResize) {
                    if(jQuery.isFunction(this.adapterConfig.autoResizeActivityIframe)) {
                        this.adapterConfig.autoResizeActivityIframe(this.adapterConfig.iframeId, this.activityEngineConfig, this);
                    } else {
                        utils.autoResizeActivityIframe(this.adapterConfig, this.activityEngineConfig, this);
                    }                    
                }

            }.bind(this),
            /**
             * Purpose: To retrieve Last Results saved
             * Input:   callback: The function to callback after retrieving the results
             * Output:  Passes Last Result JSON to the callback
             */
            getLastResults: function (callback) {
                if(callback) {
                    callback(otherPlatformDummyData, "NO_ERROR");
                }
            },
            /**
             * Purpose: To save the activity results
             * Input:   json: The json Result passed by HTML5 activity.
             *          callback: The function to callback after submitting the results
             * Output:  Passes the submit result to the callback function along with the status of "NO ERROR" or "ERROR"
             */
            submitResults: function (json, submitBtnObjectRef, callback) {
	        that.adapterConfig.doAfterSaveResult(submitBtnObjectRef, json);
                if(callback) {
                    callback(otherPlatformDummyData, "NO_ERROR");
                }
            },
            savePartialResults: function (json, submitBtnObjectRef, callback) {
               that.adapterConfig.doAfterSavePartialResult(submitBtnObjectRef, json);
               if(callback) {
                   callback(otherPlatformDummyData, "NO_ERROR");
               }
            },
            sendStatement: function (uniqueID, statement) {
               that.adapterConfig.sendStatement(uniqueID, statement);
            },
            submitSkipQuestion: function (json, submitBtnObjectRef) {
	           that.adapterConfig.doAfterSkipQuestion(submitBtnObjectRef, json);
            },

            /**
             * Purpose: To save the Edit changes done in the Item.
             * Input:   json: The updated json passed by HTML5 activity.
             *          callback: The function to callback after saving the updated changes.
             */
            submitEditChanges: function (json, submitBtnObjectRef, callback) {
                that.adapterConfig.doAfterItemSavedInEditor(submitBtnObjectRef, json);
                if(callback) {
                    callback();
                }
            },      

            /**
             * Purpose: It will be called once item is changed in editor mode.
             */
            itemChangedInEditor: function (json, uniqueID) {
               that.adapterConfig.itemChangedInEditor(uniqueID, json);
            },                 
            
            /**
             * Purpose: Sends a call to LMS to indicate closing of activity session
             * Input:   callback: The function to callback after closing the session
             * Output:  Passes the close request result to the callback function.
             */
            closeActivity: function (callback) {
                if(callback) {
                    callback(otherPlatformDummyData, "NO_ERROR");
                }
            },
            zoomImage: function (path) {
                jQuery.fancybox({
                    href: path
                }, {
                    type: 'iframe'
                });
            },
            launchHTML: function (path) {
                jQuery.fancybox({
                    href: path
                }, {
                    type: 'iframe'
                });

            },
            launchPDF: function (path) {
                jQuery.fancybox({
                    href: path
                }, {
                    type: 'iframe',
                    autoSize: false,
                    autoCenter: true,
                    iframe: {
                        preload: false
                    }
                });
            },
            showOverlayDiv: function () {
                var $overlay = jQuery("<div></div>");
                $overlay.addClass("overlay");
                jQuery(that.adapterConfig.iframeContainerId).append($overlay);
            },
            removeOverlayDiv: function () {
                var $overlay = jQuery(that.adapterConfig.iframeContainerId + " .overlay");
                $overlay.remove();
            },
            getResource: function (path, type, callback) {
                if (that.adapterConfig.loadedResources[path] !== undefined) {
                    callback(that.adapterConfig.loadedResources[path], "NO_ERROR");
                    return;
                }
            /*
                Load HTML template using AJAX Call
            */
                jQuery.ajax({
                    url: path,
                    dataType: type
                }).done(function (data) {
                    that.adapterConfig.loadedResources[path] = data;
                    callback(data, "NO_ERROR");
                }).fail(function (error) {
                    console.error("AJAX to get resource failed with path:" + path + ",status:" + error.status + ", with Status Text:" + error.statusText);
                    callback(error, "ERROR");
                });
            },
            loadJS: function (path, callback) {
                if (that.adapterConfig.loadedJS[path] === true) {
                    callback();
                    return;
                }
                utils.loadJS(path, function () {
                    that.adapterConfig.loadedJS[path] = true;
                    callback();
                });
            },
            loadCSS: function (path, callback) {
                if (that.adapterConfig.loadedCSS[path] === true) {
                    callback();
                    return;
                }
                utils.loadCSS(path, function () {
                    that.adapterConfig.loadedCSS[path] = true;
                    callback();
                });
            },
            /* Used in placement test engine for getting next question to be displayed to student */
            getModel: function (provider, callback) {
                if(callback) {
                    callback(otherPlatformDummyData, "NO_ERROR");
                }
            },
            /* Used in placement test engine for keeping track of last question attempted by the student. */
            updateModel: function (provider, model, callback) {
                if(callback) {
                    callback(otherPlatformDummyData, "NO_ERROR");
                }
            }
        },
        /* Binding auto resize activity iframe method with window resize event
         */
        jQuery(window).bind('resize', function () {
            if(jQuery(that.adapterConfig.iframeId).length > 0) {
                //New height and width
                var winNewWidth = jQuery(window).width();
                var winNewHeight = jQuery(window).height();
                /* IE was going in loop - verification function on resize should call only if width or height is changed */
                if(winWidth!=winNewWidth || winHeight!=winNewHeight) {
                    that.platformAdapter.autoResizeActivityIframe();
                }
                //Update the width and height
                winWidth = winNewWidth;
                winHeight = winNewHeight;
            }
        })
    }
    
    adapterGenerator.prototype = {
        /* Activity launcher platform pass its options which overrides default adapter configuration and returns platform adapter.
         */
        getActivityAdapter: function(options){
            jQuery.extend(this.adapterConfig, options);
            return this;
        },
        /* Set Paint Prefs of activity and apply those by calling engine
         */
        setRenderOverrides: function(renderOverridesObj){
            this.platformAdapter.renderOverrides = renderOverridesObj;
            if ($.isFunction(this.renderOverridesHandler)) {
                this.renderOverridesHandler();
            }
        },
        /* Clear cached resources.
         */
        clearCachedResources: function(){
            this.adapterConfig.loadedJS = [];
            this.adapterConfig.loadedCSS = [];
        },
        /* Returns activity related html elements used in adapter and platform.
         */
        getActivityHtmlElements: function(){
            return {
            "loaderId" : this.adapterConfig.loaderId,
            "iframeContainerId" : this.adapterConfig.iframeContainerId,
            "iframeId" : this.adapterConfig.iframeId
            };
        },
        /* Method to populate adapter parameters with the activity parameters
         */
        populateAdapterParameters: function(activityParams){
            var message = "success";
            this.platformAdapter.engineType = activityParams.engineType;
            this.platformAdapter.engine = activityParams.engine;
            this.platformAdapter.activityName = activityParams.activityname;
            this.platformAdapter.productAssetsBasePath = activityParams.productAssetsBasePath;
            this.platformAdapter.mediaManager = activityParams.mediaManager;
            this.platformAdapter.content = (activityParams.content)?activityParams.content:"";
            this.platformAdapter.externalPath = (activityParams.externalPath)?activityParams.externalPath:"";
            this.platformAdapter.videoRoot = (activityParams.videoRoot)?activityParams.videoRoot:"";            
            this.platformAdapter.displaySubmit = (activityParams.displaySubmit !== undefined)?activityParams.displaySubmit:true;
            this.platformAdapter.showAnswers = (activityParams.showAnswers !== undefined)?activityParams.showAnswers:true;
            this.platformAdapter.RESIZE_MODE = activityParams.RESIZE_MODE;
            this.platformAdapter.RESIZE_HEIGHT = activityParams.RESIZE_HEIGHT;
            this.platformAdapter.MIN_HEIGHT_THRESHOLD = activityParams.MIN_HEIGHT_THRESHOLD;
            this.platformAdapter.renderOverrides = activityParams.renderOverrides;
            this.platformAdapter.variation = activityParams.variation;
            this.platformAdapter.currentAttempt = activityParams.currentAttempt;
            this.platformAdapter.maxAttempts = activityParams.maxAttempts;
       
            /* Check for mode defined in activity parameters. If mode is not defined then activity mode is set to default values.
             * activityState - Start
             */
            if (activityParams.mode !== undefined) {
               if(activityParams.mode.activityState !== undefined) {
                   this.platformAdapter.mode.activityState = activityParams.mode.activityState;
               }
            }

            // Do not pass splash screen in preview mode.
            if(this.platformAdapter.mode.activityState !== launchModeTypes.LAUNCH_MODE_STATE_PREVIEW) {
                this.platformAdapter.splashScreen = activityParams.splashScreen;
            }

            return message;
        },
        /* Method to reset adapter parameters with default values
         */
        resetAdapterToDefaultParams: function(){
            this.platformAdapter.engineType = defaultAdapterParams.engineType;
            this.platformAdapter.engine = defaultAdapterParams.engine;
            this.platformAdapter.content = defaultAdapterParams.content;
            this.platformAdapter.externalPath = defaultAdapterParams.externalPath;
            this.platformAdapter.videoRoot = defaultAdapterParams.videoRoot;            
            this.platformAdapter.variation = defaultAdapterParams.variation;
            this.platformAdapter.displaySubmit = defaultAdapterParams.displaySubmit;
            this.platformAdapter.productAssetsBasePath = defaultAdapterParams.productAssetsBasePath;
            this.platformAdapter.mediaManager = defaultAdapterParams.mediaManager;
            this.platformAdapter.showAnswers = defaultAdapterParams.showAnswers;
            this.platformAdapter.activityName = defaultAdapterParams.activityName;
            this.platformAdapter.splashScreen = defaultAdapterParams.splashScreen;
            this.platformAdapter.RESIZE_MODE = defaultAdapterParams.RESIZE_MODE;
            this.platformAdapter.RESIZE_HEIGHT = defaultAdapterParams.RESIZE_HEIGHT;
            this.platformAdapter.MIN_HEIGHT_THRESHOLD = defaultAdapterParams.MIN_HEIGHT_THRESHOLD;
            this.platformAdapter.renderOverrides = defaultAdapterParams.renderOverrides;
            this.platformAdapter.mode = defaultAdapterParams.mode;
            this.platformAdapter.currentAttempt = defaultAdapterParams.currentAttempt;
            this.platformAdapter.maxAttempts = defaultAdapterParams.maxAttempts;
            this.platformAdapter.lastResults = defaultAdapterParams.lastResults;
            this.activityEngineConfig = null;
            this.renderOverridesHandler = null;
        },
        launch: function(data, bookId){
            this.resetAdapterToDefaultParams();
            var message = "";
            var activityHtmlElements = this.getActivityHtmlElements();
            var iframeId = activityHtmlElements.iframeId;  
            var loaderId = activityHtmlElements.loaderId;
            var iframeContainerId = activityHtmlElements.iframeContainerId;
            var iframeHTML = data.html;
            if(iframeId === undefined || iframeId === "" || iframeId.indexOf("#") !== 0) {
                 message += "Incorrect value supplied for iframe. Value supplied is " + iframeId + ".";   
            }
            if(loaderId === undefined || loaderId === "" || loaderId.indexOf("#") !== 0) {
                 message += " Incorrect value supplied for loader. Value supplied is " + loaderId + ".";
            }
            if(iframeContainerId === undefined || iframeContainerId === "" || iframeContainerId.indexOf("#") !== 0) {
                 message += " Incorrect value supplied for iframe container. Value supplied is " + iframeContainerId + ".";
            }
            if(iframeHTML === undefined || iframeHTML === "") {
                 message += " Incorrect value supplied for iframe html.";
            }
            jQuery(iframeContainerId).html("");
            var iframe = document.createElement('iframe');
            iframe.id = iframeId.split('#')[1];
            jQuery(iframe).attr('frameborder', "0");
            jQuery(iframe).css('width', "100%");

            jQuery(iframeContainerId).addClass("invisible");

            jQuery(iframeContainerId).append(iframe);
            var iframedoc = iframe.document;
            if (iframe.contentDocument) {
                iframedoc = iframe.contentDocument;
            } else if (iframe.contentWindow) {
                iframedoc = iframe.contentWindow.document;
            }
            if (iframedoc){
                // Put the content in the iframe
                iframedoc.open();
                iframedoc.writeln(iframeHTML);
                iframedoc.close();
            }
            jQuery(loaderId).removeClass('hidden');
            jQuery(loaderId).css("position", "fixed");
            jQuery(loaderId).css("top", "55%");
            //jQuery(loaderId).css("left", (jQuery(".book-activity").position().left + jQuery(".book-activity").width() / 2) + "px");
            jQuery(loaderId).css("left", "48%");
            if(data.productAssetsBasePath === undefined) {
              data.productAssetsBasePath = "";  
            }
            var adapterResponse = this.populateAdapterParameters(data);
            if(adapterResponse === "failure") {
                message += " Incorrect value supplied for mandatory adapter parameters."
            }
            if(message !== "") {
                this.platformStatus.code =  STATUS_FAIL;
                this.platformStatus.message = message;
            }

            this.eventObj.fired = true;
            jQuery(this.eventObj).triggerHandler("readyEvent");
        },
        launchNewItem: function(data){
            // that = this;
            var activityHtmlElements = this.getActivityHtmlElements();
            var loaderId = activityHtmlElements.loaderId;
            
            jQuery(loaderId).removeClass('hidden');
            jQuery(loaderId).css("position", "fixed");
            jQuery(loaderId).css("top", "55%");
            jQuery(loaderId).css("left", "48%");
            if(data.productAssetsBasePath === undefined) {
              data.productAssetsBasePath = "";  
            }
            this.populateAdapterParameters(data);
            
            this.shell.initializeEngine(this.platformAdapter);
        }
    };
    
    return adapterGenerator;
    
}());