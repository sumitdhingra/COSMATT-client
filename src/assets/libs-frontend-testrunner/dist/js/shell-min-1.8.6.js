var Shell=function(){"use strict";function shell(a){thatObj=this,this.id=a,this.elRoot="#placeholder",this.activityDelegate=void 0}function PLATFORM_CALLBACK(a,b){"PLATFORM_OK"===b.code?(a.setShellObject(thatObj),thatObj.initializeEngine(a)):alert("PLATFORM INIT ERROR - "+b.message)}function loadCssAsEmbedded(a,b){var c=document.getElementsByTagName("head")[0],d=document.createElement("style");d.type="text/css",d.id=b,d.styleSheet?d.styleSheet.cssText=a:d.appendChild(document.createTextNode(a)),c.appendChild(d)}function processLayoutWithContent(a,b){var c=Handlebars.compile(a),d=c(b);return d}function extractFileName(a){var b=a.replace(/^.*[\\\/]/,"");return b}function loadDelayedCSSAsEmbedded(a,b,c){a.getResource(b,"text",function(a){loadCssAsEmbedded(a,c)})}function setRenderOverrides(a,b){if(void 0!==a&&(void 0!==a.size&&($("html").removeClass("small medium large").addClass(a.size),"small"===a.size?$(".activity-body .btn").removeClass("btn-lg").addClass("btn-sm"):"large"===a.size?$(".activity-body .btn").removeClass("btn-sm").addClass("btn-lg"):$(".activity-body .btn").removeClass("btn-sm btn-lg")),b||(void 0!==a.backgroundColor?($("html").css("background",a.backgroundColor),$("html body").css("background",a.backgroundColor)):($("html").css("background",""),$("html body").css("background",""))),void 0!==a.fontFamily)){var c="font_family_link",d={"open-sans-font":{fontFamily:"Open Sans",url:"https://fonts.googleapis.com/css?family=Open+Sans"},"oswald-font":{fontFamily:"Oswald",url:"https://fonts.googleapis.com/css?family=Oswald"},"roboto-font":{fontFamily:"Roboto",url:"https://fonts.googleapis.com/css?family=Roboto"}};$("html").removeClass("open-sans-font oswald-font roboto-font").addClass(a.fontFamily);var e=$("head",$("html")),f=$("#"+c,e),g=d[a.fontFamily];if(g.fontFamily&&g.url){var h=f.length?f.attr("data-fontfamily"):void 0;f.length?h!=g.fontFamily&&f.attr({"data-fontfamily":g.fontFamily,href:g.url}):(f=$("<link/>",{id:c,"data-fontfamily":g.fontFamily,rel:"stylesheet",type:"text/css"}),e.append(f),f.attr({href:g.url}))}else f.length&&f.remove()}}var thatObj={};return shell.prototype={getId:function(){return this.id},getActivityDelegate:function(){return this.activityDelegate},init:function(){return void 0===parent.registerForReadyEvent?void console.error("PLATFORM LMS handler not available"):(Array.prototype.shuffle=function(){for(var a=this.slice(0),b=a.length-1;b>0;b--){var c=Math.floor(Math.random()*(b+1)),d=a[b];a[b]=a[c],a[c]=d}return a},void parent.registerForReadyEvent(PLATFORM_CALLBACK,this.id))},initializeEngine:function(adaptor){var __engine,elRoot=this.elRoot,__platformParams=adaptor.getParameterMap(),platformEngineName=__platformParams.engine,platformEngineType;platformEngineType=-1!==platformEngineName.indexOf("-min")?platformEngineName.substr(0,platformEngineName.indexOf("-min")):platformEngineName,-1!==platformEngineName.indexOf("-editor")&&(platformEngineType=platformEngineName.substr(0,platformEngineName.indexOf("-editor")),platformEngineType+="Editor");var platformContentJSON=__platformParams.content,platformEnginePath=__platformParams.externalPath,platformLayout=__platformParams.variation;if(void 0===platformLayout||void 0===platformEngineName){var errorMessage="One or more of REQUIRED platform params (type, layoutType) undefined!";return void(void 0!==console&&console.error(errorMessage))}var that={};that.htmlLayout=platformLayout;var callSetRenderOverrides=function(){setRenderOverrides(adaptor.renderOverrides,!0),adaptor.autoResizeActivityIframe()};if(""!==platformContentJSON&&void 0!==platformContentJSON){that.jsonContent=platformContentJSON,$('head script[src*="shell"]').each(function(){var a=this.src,b=extractFileName(a),c=a.substring(0,a.length-b.length);platformEnginePath&&(c=platformEnginePath),adaptor&&adaptor.renderOverrides&&adaptor.renderOverrides.waitSeconds?require.config({baseUrl:c,waitSeconds:adaptor.renderOverrides.waitSeconds}):require.config({baseUrl:c})});var callEngine=function(a){__engine.init(elRoot,__platformParams,adaptor,that.htmlLayout,that.jsonContent,a)},initializationCompleted=function(a){if($.isEmptyObject(a)?setRenderOverrides(adaptor.renderOverrides,!1):setRenderOverrides(a,!1),"undefined"!=typeof delayedCss&&void 0!==delayedCss&&delayedCss.length>0)for(var b=0;b<delayedCss.length;b++)loadDelayedCSSAsEmbedded(adaptor,delayedCss[b],"delayed"+(b+1));$("body").imagesLoaded(function(){if($.isFunction(__engine.getConfig)){var a={renderOverridesHandler:callSetRenderOverrides};adaptor.initializationCompleted(__engine.getConfig(),a)}else adaptor.initializationCompleted();$(document).triggerHandler("initComplete")})},callback=function(a){initializationCompleted(a)};require([platformEngineName],function(platformEngine){if(__engine="dnd2"===platformEngineType||"mcq6"===platformEngineType||"mcq6Editor"===platformEngineType?eval("new platformEngine."+platformEngineType+"(elRoot,__platformParams,adaptor,that.htmlLayout,that.jsonContent,callback)"):eval("new "+platformEngineType+"()"),thatObj.activityDelegate=function(){var a=function(){return __engine.getStatus()},b=function(){return __engine.handleSubmit()},c=function(){return __engine.saveItemInEditor()},d=function(){return __engine.showGrades()},e=function(){return __engine.clearGrades()},f=function(){return"undefined"!=typeof __engine.showHints?__engine.showHints():void 0},g=function(){return"undefined"!=typeof __engine.hideHints?__engine.hideHints():void 0},h=function(){return"undefined"!=typeof __engine.hasHints?__engine.hasHints():!1},i=function(){return"undefined"!=typeof __engine.remainingHints?__engine.remainingHints():0},j=function(){return __engine.resetAnswers()},k=function(a){return __engine.displayInputArea(a)},l=function(){return __engine.showFeedback()},m=function(a){return __engine.updateLastSavedResults(a)},n=function(){return __engine.forceSubmit()},o=function(){var a=!1;return __engine.handleSubmit(a)},p=function(a){return __engine.getItemContent(a)};return{getStatus:a,submitActivity:b,saveItemInEditor:c,skipQuestionActivity:n,softsaveActivity:o,showGrades:d,resetAnswers:j,clearGrades:e,showHints:f,hideHints:g,hasHints:h,remainingHints:i,updateLastSavedResults:m,displayInputArea:k,showFeedback:l,getItemContent:p}}(),void 0===__engine){var errMessage="Engine "+platformEngineName+" could not be resolved.";return void console.error(errMessage)}if("dnd2"!==platformEngineType&&"mcq6"!==platformEngineType&&"mcq6Editor"!==platformEngineType&&void 0===__engine.init){var errMssg="Init not defined in Engine "+platformEngineName;return void console.error(errMssg)}Handlebars.registerHelper("getAdapterParams",function(a){return __platformParams[a]}),"dnd2"!==platformEngineType&&"mcq6"!==platformEngineType&&"mcq6Editor"!==platformEngineType&&callEngine(function(a){initializationCompleted(a)})})}else{Handlebars.registerHelper("getAdapterParams",function(a){return __platformParams[a]});var compiledTemplate=Handlebars.compile(that.htmlLayout),compiledHTML=compiledTemplate({});$(elRoot).html(compiledHTML),$(document).ready(function(){$("body").imagesLoaded(function(){var a=null;adaptor.initializationCompleted(a)})})}}},shell}();