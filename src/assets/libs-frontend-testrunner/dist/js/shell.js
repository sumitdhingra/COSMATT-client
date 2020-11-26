/*
 * -------------------
 * SHELL Module
 * -------------------
 *
 * Name: Generic Shell Module
 * Description: Communicates with Adaptor, loads engines that expose the following functions:
 *      {
 *          init(),
 *          getStatus(),
 *          getConfig()
 *      }
 * also know as ENGINE - SHELL interface.
 * 
 *
 * External Dependencies : ->
 * Following are shared/common dependencies (specified in index.html), and assumed to loaded via the platform)
 * 1. JQuery
 * 2. Handlebars
 * 3. Adapter
 * 4. Adaptor Utils (for namespacing, )
 * 5. XML2JSON
 * 
 *
 *
 */
var Shell = (function () {
    "use strict";
    var thatObj = {};
    
    function shell(id){
        thatObj = this;
        this.id = id;
        this.elRoot = "#placeholder";
        this.activityDelegate = undefined;
    }
    
    shell.prototype = {
        getId: function(){
            return this.id;
        },
        getActivityDelegate: function() {
            return this.activityDelegate;
        },
        /*
         * SHELL STARTUP
         *
         * The SHELL JS is loaded in the content iFrame (managed by the platform) via index.html. 
         * Once loaded, the shell tries to establish and handshake with the underlying platform. If 
         * this handshake is successful, Platform will callback the SHELL indicating success.
         *
         */
        init: function(){
            /* Check if PLATFORM LMS handler available or not. */
            if (parent.registerForReadyEvent === undefined) {
                console.error("PLATFORM LMS handler not available");
                return;
            }

            /*Utility Functions Start available to childs*/
            
            Array.prototype.shuffle = function () {
                var newArray = this.slice(0);
                for (var i = newArray.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    var tmp = newArray[i];
                    newArray[i] = newArray[j];
                    newArray[j] = tmp;
                }
                return newArray;
            };
            
            /*Utility Functions End*/
                        
            /* Register with Platform, and wait for it for the callback. */
            parent.registerForReadyEvent(PLATFORM_CALLBACK, this.id);
        },
        initializeEngine: function(adaptor){
            
            /* Engine. */
            var __engine;   
            
            var elRoot = this.elRoot;
            
            /* Getting Launch parameters (as defined in TOC link atttributes) */
            var __platformParams = adaptor.getParameterMap();

            /* Engine Name. */
            var platformEngineName = __platformParams["engine"];

            /* Engine Type. */
            var platformEngineType;
            if(platformEngineName.indexOf("-min") !== -1) {
                platformEngineType = platformEngineName.substr(0, platformEngineName.indexOf("-min"));                
            } else {
                platformEngineType = platformEngineName;
            }

            if(platformEngineName.indexOf("-editor") !== -1) {
                platformEngineType = platformEngineName.substr(0, platformEngineName.indexOf("-editor"));                
                platformEngineType += 'Editor';
            }

            /* JSON Content. */
            var platformContentJSON = __platformParams["content"];

            /* Engine Path. */
            var platformEnginePath = __platformParams["externalPath"];            

            /* Layout. */
            var platformLayout = __platformParams["variation"];

            /* Splash Screen. */
            // var platformSplashScreen = __platformParams["splashScreen"];
            
            // var platformPaintPrefsActivity = __platformParams["renderOverrides"];

            /* VALIDATION -  Check if any of the mandatory parameters is missing. */
            //Temporary change.
            //if (platformLayout === undefined || platformEngineName === undefined || platformContentJSON === undefined) {
            if (platformLayout === undefined || platformEngineName === undefined) {

                //Temporary change.
                //var errorMessage = "One or more of REQUIRED platform params (contentJSON, type, layoutType) undefined!";
                var errorMessage = "One or more of REQUIRED platform params (type, layoutType) undefined!";
                
                if(console !== undefined) {
                    console.error(errorMessage);
                }

                return; /* -- EXITING --*/
            }
                    
            /*
            * Load JSON content (for passsing to the Engine).
            */
            var that = {};

            that.htmlLayout = platformLayout;
            
            var callSetRenderOverrides = function() {
                setRenderOverrides(adaptor.renderOverrides, true);
                adaptor.autoResizeActivityIframe();
            }

            /* -- Now load the Content JSON (in future we should do this in parellel) -- */
            if(platformContentJSON !== '' && platformContentJSON !== undefined) {
                that.jsonContent = platformContentJSON;
                
                /*
                 * Now load ENGINE.
                 */
                
                /** Find script in head which has source as shell.js, extract base path from its source **/
                $('head script[src*="shell"]').each(function() {
                    
                    var fullShellPath = this.src;
                    /*e.g. fullShellPath="http:/........../dist/js/shell.js" */
                    
                    var shellFileName = extractFileName(fullShellPath); 
                    /*e.g. shellFileName="shell-min......js" */
                    
                    // Deduct the length of filename 'shell-min.....js from fullShellPath to get base path
                    var basePathToEngine = fullShellPath.substring(0, fullShellPath.length - shellFileName.length);
                    /*e.g. basePathToEngine="http:/........../dist/js/" */

                    if(platformEnginePath) {
                        basePathToEngine = platformEnginePath;
                    }                    
                    
                    if(adaptor && adaptor.renderOverrides && adaptor.renderOverrides.waitSeconds) {
                        // The number of seconds to wait before giving up on loading a script. Setting it to 0 disables the timeout. The default is 7 seconds.
                        require.config({
                            baseUrl: basePathToEngine,
                            waitSeconds: adaptor.renderOverrides.waitSeconds 
                            /*e.g. baseUrl="http:/........../dist/js/" */
                        });
                    } else {
                        require.config({
                            baseUrl: basePathToEngine
                            /*e.g. baseUrl="http:/........../dist/js/" */
                        });
                    }
                }); 
        
                var callEngine = function(callback) {
                    __engine.init(elRoot,
                            __platformParams,
                            adaptor,
                            that.htmlLayout,
                            that.jsonContent, 
                            callback); 
                }, initializationCompleted = function(themeConfig) {
                    
                    if(!$.isEmptyObject(themeConfig)) {
                        setRenderOverrides(themeConfig, false);    
                    } else {
                        setRenderOverrides(adaptor.renderOverrides, false);
                    }
                    
                    
                    /* Inject delayed CSS styles (Product Skin). */
                    if (typeof delayedCss !== "undefined" && delayedCss !== undefined && delayedCss.length > 0) {
                        for (var i=0; i < delayedCss.length; i++) {
                            loadDelayedCSSAsEmbedded(adaptor, delayedCss[i], "delayed"+(i+1));
                        }
                    }
                    $('body').imagesLoaded(function () {
                        /*  Passing engine configuration to initialization completed method. Currently, it will be
                        used for handling of auto resizing of activities based on configuration. */
                        if ($.isFunction(__engine["getConfig"])) {
                            
                            /* engineEventsObj contains handlers for painting user preferences, paint new question and is passed to adaptor so that adaptor can execute                                             these handlers whenever any such event is fired by paltform */
                            var engineEventsObj = {
                                "renderOverridesHandler":  callSetRenderOverrides
                            };
                            
                            adaptor.initializationCompleted(__engine.getConfig(), engineEventsObj);
                        } else {
                            adaptor.initializationCompleted();                                                          
                        }
                        $(document).triggerHandler("initComplete");
                    });
                };

                var callback = function(themeConfig) {
                    initializationCompleted(themeConfig);
                };

                require([platformEngineName], function (platformEngine) {
                    if(platformEngineType === "dnd2" || platformEngineType === "mcq6" || platformEngineType === "mcq6Editor") {
                        __engine = eval("new platformEngine." + platformEngineType + "(elRoot,__platformParams,adaptor,that.htmlLayout,that.jsonContent,callback)");
                    } else {
                        __engine = eval("new " + platformEngineType + "()");    
                    }                    

                    /*
                     * Setup an delegate object for returning back to the platform. Adaptor will use 
                     * this to raise events or request status from the content.
                     */
                    thatObj.activityDelegate = (function () {

                        var internalGetStatus = function () {
                            return __engine.getStatus();
                        };

                        var internalSubmitActivity = function () {
                            return __engine.handleSubmit();
                        };

                        var internalSaveItemInEditor  = function () {
                            return __engine.saveItemInEditor();
                        };                             

                        var internalShowGrades = function () {
                            return __engine.showGrades();
                        };         

                        var internalClearGrades = function () {
                            return __engine.clearGrades();
                        };

                        var internalShowHints = function () {
                            if(typeof __engine.showHints !="undefined"){
                                return __engine.showHints();
                            }
                        };         

                        var internalHideHints = function () {
                            if(typeof __engine.hideHints !="undefined"){
                                return __engine.hideHints();
                            }
                        };
                        var internalHasHints = function () {
                            if(typeof __engine.hasHints!='undefined'){
                                return __engine.hasHints();
                            }
                            return false;
                        };
                        
                        var internalRemainingHints = function () {
                            if(typeof __engine.remainingHints !="undefined"){
                                return __engine.remainingHints();
                            }
                            return 0;
                        };
                        
                        
                        var internalResetAnswers = function () {
                            return __engine.resetAnswers();
                        };                           

                        var internalDisplayInputArea = function (savedAnswer) {
                            return __engine.displayInputArea(savedAnswer);
                        };

                        var internalShowFeedback = function () {
                            return __engine.showFeedback();
                        };                      

                        // var internalShowInteractionFeedback = function () {
                        //     return __engine.showInteractionFeedback();
                        // };                                                
                        
                        var internalUpdateLastSavedResults = function (savedAnswers) {
                            return __engine.updateLastSavedResults(savedAnswers);
                        };                         
                        
                        var internalSkippedQuestionSubmit = function () {
                            return __engine.forceSubmit();
                        };

                        var internalSoftsaveActivity = function () {
                            /* resume false for SOFT SAVE*/
                            var resume = false;
                            return __engine.handleSubmit(resume);
                        };

                        var internalGetItemContent = function (layout) {
                            return __engine.getItemContent(layout);
                        };

                        return {
                            "getStatus": internalGetStatus,
                            "submitActivity": internalSubmitActivity,
                            "saveItemInEditor": internalSaveItemInEditor ,                            
                            "skipQuestionActivity": internalSkippedQuestionSubmit,
                            "softsaveActivity": internalSoftsaveActivity,
                            "showGrades": internalShowGrades,
                            "resetAnswers": internalResetAnswers,
                            "clearGrades": internalClearGrades,
                            "showHints": internalShowHints,
                            "hideHints": internalHideHints,
                            "hasHints": internalHasHints,
                            "remainingHints": internalRemainingHints,
                            
                            
                            "updateLastSavedResults": internalUpdateLastSavedResults,
                            "displayInputArea": internalDisplayInputArea,
                            "showFeedback": internalShowFeedback,
                            // "showInteractionFeedback": internalShowInteractionFeedback,
                            "getItemContent": internalGetItemContent
                        };
                    }());   
                    
                    /** Check if engine is undefined. */
                    if (__engine === undefined) {
                        var errMessage = "Engine " + platformEngineName + " could not be resolved.";
                        console.error(errMessage);
                        return;
                    }

                    /** Check if engine init is undefined. */
                    if(platformEngineType !== "dnd2" && platformEngineType !== "mcq6" && platformEngineType !== "mcq6Editor") {
                        if (__engine.init === undefined) {
                            var errMssg = "Init not defined in Engine " + platformEngineName;
                            console.error(errMssg);
                            return;
                        }
                    }

                    /* -- Making Handlebars available to the Engine ---- */
                    Handlebars.registerHelper("getAdapterParams", function (key) {
                        return __platformParams[key];
                    });

                    /* -- Check if activity contains splash screen. ---- */
                    // if(platformSplashScreen !== undefined && platformSplashScreen !== '' ) {
                    //     /* -- Triggered on click of next button of activity's last splash screen page. ---- */
                    //     $(document).bind('launchEngine',function(){
                    //         callEngine(function() {
                    //             initializationCompleted();
                    //         });
                            
                    //     });
                    //     /* -- Loading activity's 2nd to nth splash screen page. ---- */
                    //     $(document).bind('launchSplashTemplate',function(event, path){
                    //         adaptor.getResource(path, "text", function (data) {
                    //             var processedHTML = processLayoutWithContent(data,{});
                    //             $(elRoot).html(processedHTML);
                    //             adaptor.autoResizeActivityIframe();
                    //         });
                    //     });
                        
                    //     adaptor.getResource(platformSplashScreen, "text", function (data) {
                    //         var processedHTML = processLayoutWithContent(data,{});
                    //         $(elRoot).html(processedHTML);
                    //         adaptor.initializationCompleted();
                    //     });
                    // } else {

                    if(platformEngineType !== "dnd2" && platformEngineType !== "mcq6" && platformEngineType !== "mcq6Editor") {
                        callEngine(function(themeConfig) {
                            initializationCompleted(themeConfig);
                        });
                    }
                    // }
                });
            } else {
                Handlebars.registerHelper("getAdapterParams", function (key) {
                    return __platformParams[key];
                });

                /* Compiling Template Using Handlebar*/
                var compiledTemplate = Handlebars.compile(that.htmlLayout);

                /*Compiling HTML from Template*/
                var compiledHTML = compiledTemplate({});

                $(elRoot).html(compiledHTML);
                $(document).ready(function () {
                    $('body').imagesLoaded(function () {
                        var screenPreference = null;
                        adaptor.initializationCompleted(screenPreference);
                    });
                });
            }
        }
    };
    
    /*
     * PLATFOM CALLBACK FUNCTION
     *     
     * Platform calls this function indicating that the PLATFORM is ready
     * and content (i.e. the engine / shell) should now start its own work.
     *
     * Parameters:
     *   (1) adaptor: Platform Adaptor object, which allow the shell (and engine) to communicate with platform
     *   (2) status: This should be "PLATFORM_OK", else some error has occurred at the platform end.
     *
     * Interfaces / Modes :->
     * 
     *  PLATFORM ADAPTOR FUNCTIONS
     *      {
     *          initializationCompleted(),
     *          getParameterMap(),
     *          getResource(),   
     *          getLastResults(),
     *          saveResults(),
     *          savePartialResults(),
     *          closeActivity()
     *      } 
     * 
     */
    function PLATFORM_CALLBACK(adaptor, status) {
    
        if (status.code === "PLATFORM_OK") {
            
            adaptor.setShellObject(thatObj);
            
            thatObj.initializeEngine(adaptor);
        } else {
            /* ---------------- A PLATFORM ERROR HAS OCCURRED -----------------*/
            alert("PLATFORM INIT ERROR - " + status.message);
        }
    }

    /*
     * ----------------------
     * SHELL HELPER FUNCTIONS
     * ----------------------
     */
        
    /*
     * Function to load CSS as embedded script tag.
     */
    function loadCssAsEmbedded(cssData, styleId) {
        var head = document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        style.type = 'text/css';
        style.id = styleId;
        if (style.styleSheet){
            style.styleSheet.cssText = cssData;
        } else {
            style.appendChild(document.createTextNode(cssData));
        }
        head.appendChild(style);
    }
            
    /**
     * Function to process HandleBars template with JSON.
     */
    function processLayoutWithContent(layoutHTML, contentJSON) {

        /* Compiling Template Using Handlebars*/
        var compiledTemplate = Handlebars.compile(layoutHTML);

        /*Compiling HTML from Template*/
        var compiledHTML = compiledTemplate(contentJSON);
        return compiledHTML;
    }        
    
    /*
     * Function to extract file name from path.
     */
    function extractFileName(fullPath) {
        var filename = fullPath.replace(/^.*[\\\/]/, '');
        return filename;
    }
    
    function loadDelayedCSSAsEmbedded(adaptor, delayedCssName, delayedCSSId) {
        adaptor.getResource(delayedCssName, "text", function (delayedCssData) {
            loadCssAsEmbedded(delayedCssData, delayedCSSId);
        });
    }
    
    function setRenderOverrides(renderOverridesObj, isStyleVariation){
        if (renderOverridesObj !== undefined) {
            if (renderOverridesObj.size !== undefined) {
                $('html').removeClass('small medium large').addClass(renderOverridesObj.size);

                if(renderOverridesObj.size === 'small') {
                    $('.activity-body .btn').removeClass("btn-lg").addClass("btn-sm");
                } else if (renderOverridesObj.size === 'large') {
                    $('.activity-body .btn').removeClass("btn-sm").addClass("btn-lg");
                } else {
                    $('.activity-body .btn').removeClass("btn-sm btn-lg");
                }
            }

            // if (renderOverridesObj.color !== undefined) {
            //     $('html').removeClass('style-white style-yellow').addClass(renderOverridesObj.color);  
            // }

            if(!isStyleVariation) {
                if (renderOverridesObj.backgroundColor !== undefined) {
                    $('html').css('background', renderOverridesObj.backgroundColor);
                    $('html body').css('background', renderOverridesObj.backgroundColor);
                } else {
                    $('html').css('background', '');
                    $('html body').css('background', '');
                }                
            }

            if (renderOverridesObj.fontFamily !== undefined) {
                var FONT_FAMILY_ID = 'font_family_link';
                var defaultFonts = {
                    "open-sans-font": {
                        fontFamily: "Open Sans",
                        url: "https://fonts.googleapis.com/css?family=Open+Sans"                        
                    },
                    "oswald-font": {
                        fontFamily: "Oswald",
                        url: "https://fonts.googleapis.com/css?family=Oswald"
                    },
                    "roboto-font": {
                        fontFamily: "Roboto",
                        url: "https://fonts.googleapis.com/css?family=Roboto"                        
                    }
                };

                $('html').removeClass('open-sans-font oswald-font roboto-font').addClass(renderOverridesObj.fontFamily);
                var docHead = $("head", $('html'));
                var link = $("#" + FONT_FAMILY_ID, docHead);

                var fontObj = defaultFonts[renderOverridesObj.fontFamily];
                if(fontObj.fontFamily && fontObj.url){
                    var dataFontFamily = link.length ? link.attr("data-fontfamily") : undefined;
                    if(!link.length){
                        link = $("<link/>", {
                            "id" : FONT_FAMILY_ID,
                            "data-fontfamily" : fontObj.fontFamily,
                            "rel" : "stylesheet",
                            "type" : "text/css"
                        });
                        docHead.append(link);
                            
                        link.attr({
                            "href" : fontObj.url
                        });                        
                    } else if(dataFontFamily != fontObj.fontFamily){
                    
                        link.attr({
                            "data-fontfamily" : fontObj.fontFamily,
                            "href" : fontObj.url
                        });
                    }
                } else {
                    if(link.length) link.remove();
                }
            }
        }
    }
    
return shell;
    
}());