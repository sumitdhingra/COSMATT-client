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


define('css!../css/placementtest',[],function(){});
/*
 * -------------------
 * Engine Module
 * -------------------
 * 
 * Name: MultiType Question Handler
 * Description: A HTML5 activity template to be used in mutli item activities.
 *  
 * Interfaces / Modes :->
 * 
 *	1. Supports Multi-item handler interface
 *		{
 *			init(),
 *			renderQuestions(),
 *			getAnswersJSON(),
 *			updateLastSavedResults(),
 *			hideAnswers(),
 *			showAnswers(),
 *			markAnswers(),
 *			disableInputs(),
 *			getAnswerMarkers()
 *		}		
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

multiitemhandler = (function() {
	"use strict";

	/*
	 * Reference to platform's activity adaptor (initialized during init() ).
	 */
	var activityAdaptor;
	
	/*
	 * Internal Engine State.
	 */ 
	var __state = {
		activityParams: null /* Activity Parameters. */
	};	
	
	/*
	 * Content (loaded / initialized during init() ).
	 */ 
	var __content = {
		itemObjects: {}, /* Stores different types of question objects. */
		lastResult: [], /* Stores different types of question objects. */
		questionKeyArray: [] /* Array to store all question numbers. */
	};
	
	/********************************************************/
	/*					MULTI ITEM HANDLER INIT FUNCTION
		
		"params" :->		Startup params passed by platform. Include the following sets of parameters:
						(a) State (Initial launch / Resume / Gradebook mode ).
						(b) TOC parameters (videoRoot, contentFile, keyframe, layout, etc.).
		"adaptor" :->        An adaptor interface for communication with platform (saveResults, closeActivity, savePartialResults, getLastResults, etc.).

	*/
	/********************************************************/	
	function init(params, adaptor)	{
		/* ---------------------- BEGIN OF INIT ---------------------------------*/	
		__state.activityParams = params;
		activityAdaptor = adaptor;
		/* ---------------------- END OF INIT ---------------------------------*/		
	} /* init() Ends. */
	
	/**
	 *	Function Used to Mark User Answers.
	 */
	function markAnswers(){
		for (var key in __content.itemObjects) {
			__content.itemObjects[key].markAnswers();
		}
	}

	/**
	 *	Function Used to disable inputs.
	 */
	function disableInputs(){
		for (var key in __content.itemObjects) {
			__content.itemObjects[key].disableInputs();
		}
	}

	/**
	 *	Function Used to return id answer is correct or not
	 */
	function getAnswerMarkers(){
		var itemAnswers = {};
		$.each(__content.questionKeyArray, function(key) {
			var value = __content.questionKeyArray[key];
			itemAnswers[value] = __content.itemObjects[value].isCorrectAnswer();
		});
		return itemAnswers;
	}
	
	/**
	 *	Render specific Question.
	 */	
	function renderQuestions(questionsInfo, isGradebookPreview){

		for(var i=0;i<questionsInfo.questions.length;i++){
			var question = questionsInfo.questions[i];
			var questionNumber = question.questionNumber;
			if(__content.itemObjects[questionNumber] === undefined) {
				var template = question.template;
				var questionJson =  question.questionJson;
				var container = question.container;
				var component = question.component;
				__content.questionKeyArray.push(questionNumber);
				__content.itemObjects[questionNumber] = eval("new " + component + "()");
				
				var multiItemParams = {questionNumber: questionNumber};
				
				__content.itemObjects[questionNumber].init(container, __state.activityParams, activityAdaptor, template, questionJson, "", multiItemParams);
				for (var result in __content.lastResult) {
					var key = __content.lastResult[result].itemUID;
						if(key !== undefined) {
							if(key.toString() === questionNumber.toString()) {
								__content.itemObjects[questionNumber].updateLastSavedResults(__content.lastResult[result]);
							}	
						}					
				}
				if(isGradebookPreview === true) {
					__content.itemObjects[questionNumber].markAnswers();
					__content.itemObjects[questionNumber].handleShowAnswers();
					__content.itemObjects[questionNumber].disableInputs();
				}
			}		
		}		
	}

	/**
	 * Function to show correct Answers to User, called on click of Show Answers Button.
	 */	 
	function showAnswers(){
		for (var key in __content.itemObjects) {
			__content.itemObjects[key].handleShowAnswers();
		}
	}

	/**
	 * Function to hide correct Answers from User.
	 */
	function hideAnswers(){
		for (var key in __content.itemObjects) {
			__content.itemObjects[key].handleHideAnswers();
		}
	}	
	
	/**
	 *  Function used to create JSON from user Answers for submit(soft/hard).
	 *  Called by :-
	 *   1. Engine
	 */
	function getAnswersJSON(){

		var results = [];
		$.each(__content.questionKeyArray, function(key) {
			var value = __content.questionKeyArray[key];
			var answerJSON = __content.itemObjects[value].getAnswersJSON();
			answerJSON.itemUID = parseInt(value,10);
			results.push(answerJSON);
		});
		return {
			results:results
		};
	}

	/**
	 * Function to display last result saved in LMS.
	 */	 
	function updateLastSavedResults(json) {
		var results = json.results;
		__content.lastResult = results;
		for (var result in results) {
			var key = results[result].itemUID;
			if(__content.itemObjects[key] && __content.itemObjects[key].updateLastSavedResults) {
				__content.itemObjects[key].updateLastSavedResults(results[result]);
			}
		}
	}

	return	{
		"init":init,
		"renderQuestions":renderQuestions,
		"getAnswersJSON":getAnswersJSON,
		"updateLastSavedResults":updateLastSavedResults,
		"hideAnswers":hideAnswers,
		"showAnswers":showAnswers,
		"markAnswers":markAnswers,
		"disableInputs":disableInputs,
		"getAnswerMarkers":getAnswerMarkers
	};
})();
define("multiitemhandler", function(){});

/*
 * -------------------
 * Engine Module
 * -------------------
 * 
 * Name: Placement Test engine
 * Description: A HTML5 activity template for a placement test type activity.
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

define('placementtest',['css!../css/placementtest.css',
	'multiitemhandler'], function () {
	
   placementtest = function() {
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
		TOTAL_QUESTIONS_IN_EACH_LEVEL: 50, /* Total Questions in each level. */				
		MAX_TABS_PER_PAGE: 10, /* Maximum tabs per page. */		
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
		activityPreviewGradebook: false, /* State whether activity mode or gradebook mode. Possible Values: true/false(Boolean) */
		activityLastResults: null, /* Activity Last Results. */
		activityParams: null, /* Activity Parameters. */
		activityelRoot: null, /* Activity el root required after submit to show report. */
		currentTabGroup: '', /* Current Tab Group. */		
		currentQuestion: 0 /* Current Question Number. */
		
	};	
	
	/*
	 * Content (loaded / initialized during init() ).
	 */ 
	var __content = {
		reportLayout: "",
		questionInformationXML: {}, /* Contains all information related to a particular question (question, option, answer). */		
		itemUIDMap: {}, /* Item UID Map */		
		levelArray: [] /* Includes all levels of placement test.  */
	};	

	/********************************************************/
	/*					ENGINE-SHELL INIT FUNCTION
		
		"elRoot" :->		DOM Element reference where the engine should paint itself.														
		"params" :->		Startup params passed by platform. Include the following sets of parameters:
						(a) State (Initial launch / Resume / Gradebook mode ).
						(b) TOC parameters (contentFile, keyframe, layout, etc.).
		"adaptor" :->        An adaptor interface for communication with platform (saveResults, closeActivity, savePartialResults, getLastResults, etc.).
		"htmlLayout" :->    Activity HTML layout (as defined in the TOC LINK paramter). 
		"jsonContentXML" :->    Activity XML content in JSON format (as defined in the TOC LINK paramter).
		"callback" :->      To inform the shell that init is complete.

	*/
	/********************************************************/
	function init(elRoot, params, adaptor, htmlLayout, jsonContentXML, callback)  {
	
		/* Function Local to INIT */
		
		/* ---------------------- BEGIN OF INIT ---------------------------------*/	
		activityAdaptor = adaptor;
		__state.activityParams = params;	

		function acitivityInitializer(lastResults, nextQuestion){

			__state.activityLastResults = lastResults;
			
			var isContentValid = true;

			/* ------ VALIDATION BLOCK START -------- */	
			if (jsonContentXML.activity === undefined) {
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
			var processedJsonContentXML = parseAndUpdateJSONContent(jsonContentXML, params, lastResults, nextQuestion);

			/* Apply the content JSON to the htmllayout */
			var processedHTML = processLayoutWithContent(htmlLayout, processedJsonContentXML);

			__state.activityelRoot = elRoot;
			
			/* Update the DOM and render the processed HTML - main body of the activity */					
			$(elRoot).html(processedHTML);

			if(params["mode"].activityState === "state_preview") {
				$('.tabbable #myTab').removeClass('hidden');
				$('.questionCounter').removeClass('hidden');
				previewGradebook(params["lastResults"]);
				return;
			}
			
			/* Setup Event Handlers on the Layout HTML for Placement Test interaction */
			setupEventHandlers();
			
			if(lastResults === undefined) {
				showQuestion(0);
				$('li#tab_1').addClass('active');
				$('#question-container-1').addClass('active');
			} else {
				var lastQuestion = lastResults.results.length;
				showQuestion(lastQuestion);
				var nextQue = lastQuestion + 1;
				$('li#tab_' + nextQue).addClass('active');
				$('#question-container-' + nextQue).addClass('active');
			}
		}

		/* -- Making for loop available to the templates ---- */
		Handlebars.registerHelper('for', function(from, to, incr, block) {
			var accum = '';
			for(var i = from; i <= to; i += incr) {
				accum += block.fn(i);
			}
			return accum;
		});

		/* -- Making getQuotient available to the templates ---- */
		Handlebars.registerHelper('getQuotient', function(num1, num2) {
			return parseInt((num1-1)/num2,10);
		});

		multiitemhandler.init(params, adaptor);

		if(params["mode"].activityState === "state_preview"){
			acitivityInitializer(params["lastResults"]);
		} else if (params["mode"].activityState === "state_resume") {   
			activityAdaptor.getLastResults( function(lastResults) {
				/* Getting next question to be displayed from user preferences. */
				activityAdaptor.getModel("PT_TEST", function(nextQuestion) {
					acitivityInitializer(lastResults, nextQuestion.model);
				});
			});
		} else {
			acitivityInitializer();
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
	 * 2. levelEnrolled : Level in which user is currently enrolled.
	 */
	function saveResults(bSubmit, levelEnrolled){

		/*Getting answer in JSON format*/
		var answerJSON = getAnswersJSON();

		if(bSubmit===true) { /*Hard Submit*/
		
			answerJSON.objectives = {
				myeltPlacementLevel : levelEnrolled
			};

			/*Send Results to platform*/
			activityAdaptor.submitResults(answerJSON, function(data, status){
				if(status==='NO_ERROR'){
					__state.activitySubmitted = true;
					/*Close platform's session*/
					activityAdaptor.closeActivity();
					__state.currentTries = 0;
				} else {
					/* There was an error during platform communication, so try again (till MAX_RETRIES) */								
					if(__state.currentTries < __config.MAX_RETRIES) {
						__state.currentTries++ ;
						saveResults(bSubmit, levelEnrolled);
					}
				}
			});
		} else { /*Soft Submit*/
			/*Send Results to platform*/		
			activityAdaptor.savePartialResults(answerJSON,function(data, status){
				if(status==='NO_ERROR'){
					__state.activityPariallySubmitted = true;
				} else {
					/* There was an error during platform communication, do nothing for partial saves */
				}
			});
			/* Update model to keep a track of last question attempted by the student. */
			activityAdaptor.updateModel("PT_TEST", __content.questionInformationXML.questionsJSON[__state.currentQuestion + 1].questionNumber);
		}
	}
	
	/*
	 * -------------------
	 * DOM EVENT HANDLERS                      
	 * -------------------
	 */

	/**
	* Function to handle next question.
	*/
	function handleNextQuestion() {
		if(!__state.activityPreviewGradebook) {
			if(((__state.currentQuestion + 1) % __config.TOTAL_QUESTIONS_IN_EACH_LEVEL === 0) && __state.activitySubmitted === false){
				var levelStatus = checkLevelStatus();
				if(!levelStatus || __state.currentQuestion + 1 === __content.questionInformationXML.totalQuestions) {
					var currentLevel = (__state.currentQuestion + 1) / __config.TOTAL_QUESTIONS_IN_EACH_LEVEL;
					var levelEnrolled;
					if(__state.currentQuestion + 1 === __content.questionInformationXML.totalQuestions && levelStatus) {
						levelEnrolled = currentLevel + 1;
					} else {
						levelEnrolled = currentLevel;
					}
					handleSubmit(levelEnrolled);
					return;
				}
			}
		}
	
		var questionNo = __state.currentQuestion + 2;
		$('li#tab_' + questionNo + ' a').tab('show');
	}
	
	/**
	* Display Question.
	*/
	function showQuestion(questionNumber, isGradebookPreview) {
		if(isGradebookPreview) {
			showTabGroup(parseInt(questionNumber/__config.MAX_TABS_PER_PAGE,10));
		}

		__state.currentQuestion = questionNumber;

		if(isGradebookPreview !== true || __state.currentQuestion + 1 === __content.questionInformationXML.totalQuestions){
			$(".nextQuestion").attr("disabled","disabled");
		} else {
			$(".nextQuestion").removeAttr("disabled","disabled");
		}

		var questionJSON = __content.questionInformationXML.questionsJSON[questionNumber];
		activityAdaptor.getResource(questionJSON.questionJson._layout, "text", function(layout){
			__content.questionInformationXML.questionsJSON[questionNumber].template = layout;			
			
			var engineFileName = questionJSON.questionJson._js.replace(/^.*[\\\/]/, ''); 
			
			var fullEnginePathTOC = questionJSON.questionJson._js;
			
			var basePathToEngine = fullEnginePathTOC.substring(0, fullEnginePathTOC.length - (engineFileName.length + 1));
			
			var engineName = extractEngineName(engineFileName);
						
			if (activityAdaptor.debug) {
				require.config({
					baseUrl: basePathToEngine + "/js"
					/*e.g. baseUrl="http:/............./engines/DND/0.0.l/js" */
				});
                        } else {
				require.config({
					baseUrl: basePathToEngine
					/*e.g. baseUrl="http:/............./engines/DND/0.0.l" */
				});
			}			
							
			require([engineName], function () {
				questionJSON.container = $("#question-container-" + (questionNumber+1));
				multiitemhandler.renderQuestions({questions:[questionJSON]},isGradebookPreview);
				activityAdaptor.autoResizeActivityIframe();
				$('body').imagesLoaded(function () {
					activityAdaptor.autoResizeActivityIframe();
				});
				if(isGradebookPreview === true){
					if(questionNumber + 1 === __state.activityLastResults.results.length) {
						markAnswersOnTab();
					}
					$('.number_bullet' + questionNumber).removeClass("hidden");
				}
			});			
		});
	}	
	
	/*
	* Paint tabs according to the screen size.
	*/
	function repainttabs(noOfTabsPerPage){
		if(__config.MAX_TABS_PER_PAGE === noOfTabsPerPage) {
			return;
		}
		var currentNoOfGroups = parseInt(__content.questionInformationXML.totalQuestions/__config.MAX_TABS_PER_PAGE,10) + 1;
		__config.MAX_TABS_PER_PAGE = noOfTabsPerPage;
		for(var i = 0; i < currentNoOfGroups; i++){
			$(".questiontabs").removeClass("tabGroup" + i);
		}
		for(var j=0;j<__content.questionInformationXML.totalQuestions;j++){
			$($(".questiontabs").get(j)).addClass("tabGroup" + parseInt(j/__config.MAX_TABS_PER_PAGE,10));
		}
		showTabGroup(parseInt(__state.currentQuestion/__config.MAX_TABS_PER_PAGE,10));
	}	
	
	/**
	* Check status for a particular level whether student is passed or not.
	*/
	function checkLevelStatus() {

		/*Getting answer in JSON format*/
		var answerJSON = getAnswersJSON();
		var results = answerJSON.response.results;
		var correctAnswers = 0;
		var totalQuestions = 0;
		var lastLevelAttempted = results.length / __config.TOTAL_QUESTIONS_IN_EACH_LEVEL;
		var lowerLimit = (lastLevelAttempted - 1) * __config.TOTAL_QUESTIONS_IN_EACH_LEVEL;
		for(var i = lowerLimit ; i < results.length; i++) {
			if(results[i].answer === results[i].correctAnswer) {
				correctAnswers++;
			}
			totalQuestions++;
		}
		var levelPercentage = ((correctAnswers / totalQuestions) * 100).toFixed();
		if(levelPercentage >= 60) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Bound to click of Activity submit button.
	 */
	function handleSubmit(levelEnrolled){

		/* Saving Answer. */
		saveResults(true, levelEnrolled);

		/*Getting answer in JSON format*/
		var answerJSON = getAnswersJSON();
		var testReport = getTestReport(answerJSON, levelEnrolled);
        var placementTestReportPath = __content.reportLayout;
        
        activityAdaptor.getResource(placementTestReportPath, "text", function(layout){
			var processedHTML = processLayoutWithContent(layout, testReport);
			$(__state.activityelRoot).html(processedHTML);
		});
	}
	
	/**
	* Function to create JSON from user Answersfor generating report
	*/
	function getTestReport(answerJSON, levelEnrolled) {
		var counter = 0;
		var results = answerJSON.response.results;
		var totalCategory = "Total";
		var levelCategory = "Level";
		var levelAttempted = results.length/__config.TOTAL_QUESTIONS_IN_EACH_LEVEL;
		var levelResult = [];
		var headingArray = [];
		for(var level = 0; level < levelAttempted; level++) {
			var resultJSONMap = {};
			var totalQuestions = 0;
			var totalCorrectAnswers = 0;
			resultJSONMap["Level"] = level + 1;

			var subtestMap =  __content.levelArray[level];
			var subtestMapSize = getObjectSize(subtestMap);
			if(level === levelAttempted -1) {
				headingArray.push(levelCategory);
			}

			for(var i = 0; i < subtestMapSize; i++) {
				var subtestQuestionsSize = subtestMap[i];
				var category = __content.questionInformationXML.questionsJSON[counter].questionJson._category;
				if(level === levelAttempted -1) {
					headingArray.push(category);
				}
				var subtestTotalQuestions = 0;
				var subtestCorrectAnswers = 0;
				var subtestLastQuestion = counter + subtestQuestionsSize;
				for(var j = counter; j < subtestLastQuestion; j++) {
					if(results[j].answer === results[j].correctAnswer) {
						subtestCorrectAnswers++;
					}	
					subtestTotalQuestions++;
					counter++;
				}
				totalCorrectAnswers = totalCorrectAnswers + subtestCorrectAnswers;
				totalQuestions = totalQuestions + subtestTotalQuestions;
				var subtestPercentage = (subtestCorrectAnswers/subtestTotalQuestions) * 100;
				resultJSONMap[category] = subtestPercentage.toFixed() + "%";
			}
			if(level === levelAttempted -1) {
				headingArray.push(totalCategory);
			}
			var totalPercentage = (totalCorrectAnswers/totalQuestions) * 100;
			resultJSONMap[totalCategory] = totalPercentage.toFixed() + "%";
			levelResult.push({resultJSONMap: resultJSONMap});
		}
		return {testReport: {levelEnrolled: levelEnrolled, headingArray: headingArray, levelResult: levelResult}};
	}
	
	/**
	* Function to get Map Size.
	*/
	function getObjectSize(myObject) {
		var key;
		for (key in myObject) {
		}
		var count = parseInt(key,10) + 1;
		return count;
	}	
	

	/**
	* Function to get no of tabs to be displayed based on screen width.
	*/
	function getNoOfTabsByWidth() {
		var width  = $(window).width();
		var tabs;
		if(width < 300){
			tabs = 3;
		} else if(width < 640){
			tabs = 5;
		} else {
			tabs = 10;
		}
		return tabs;
	}

	/**
	*  Function Used to Mark Question status on tab.
	*/
	function markAnswersOnTab() {
		var answerMarkers = multiitemhandler.getAnswerMarkers();
		for (var key in answerMarkers) {
			$('li#tab_' + (__content.itemUIDMap[key] + 1) +' a').addClass(answerMarkers[key]?'correct':'wrong');
		}
	}

	/**
	 *  Function to extract name from the filename by trimming extension, package version (if any) and minified text(if any).
	 */
	function trimExtension(filename) {
		var jsName;
		var lastPosition = filename.lastIndexOf(".js");
		var startPosition = filename.lastIndexOf("/") + 1;
		jsName = filename.substring(startPosition, lastPosition);
		var firstIndex = jsName.indexOf("-");
		if(firstIndex === -1) {
			return jsName;
		} else {
			return jsName.substring(0, firstIndex);    
		}
	}


	/**
	* Function to get the percentage decrease in no of questions in each level.
	*/
	function getDecreasePercentage(subtestLength, jsonContentXML, level) {

		var leveltotalQuestions = 0;
		for(var i = 0;i < subtestLength; i++) {
			leveltotalQuestions = leveltotalQuestions + jsonContentXML.activity.subtest[i].level[level].que.length;
		}

		/*
		* Decreasing the total questions in one level to 50.
		*/
		var decreasePercentage = Math.round(((leveltotalQuestions - __config.TOTAL_QUESTIONS_IN_EACH_LEVEL)/leveltotalQuestions) * 100);

		return decreasePercentage;
	}

	/**
	* Function to get question category and instruction for each question.
	*/
	function getQuestionCategoryAndInstruction(subtestID) {
		var category = "";
		var instruction = "";
		var categoryInstruction = [];

		if(subtestID === "LK_OC") {
			category = "Language Knowledge and Oral Communication";
			instruction = "Instruções: selecione a resposta correta.";
		} else if(subtestID === "LC") {
			category = "Listening Comprehension";
			instruction = "Instruções: escute o dialogo e selecione a resposta correta.";
		} else if(subtestID === "R_W") {
			category = "Reading and Writing";
			instruction = "Instruções: selecione a resposta correta.";
		}

		categoryInstruction.push(category);
		categoryInstruction.push(instruction);

		return categoryInstruction;
	}

	/**
	* Function to format question JSON for each question.
	*/
	function formatQuestionJSON(questionJSON, js, layout, category, instruction, subtestID) {

		questionJSON.component = trimExtension(js);
		questionJSON.questionJson._category = category;
		questionJSON.questionJson._instruction = instruction;
		questionJSON.questionJson._subtestID = subtestID;
		questionJSON.questionJson._layout = layout;
		questionJSON.questionJson._js = js;
		var questionNumber = questionJSON.questionJson.question._no;
		if(questionNumber.indexOf("_") !== -1) {
			questionNumber = questionNumber.replace(/_/g, '');
		}

		questionJSON.questionNumber = questionNumber;

		if(questionJSON.questionJson.question.cont._img !== undefined) {
			questionJSON.questionJson.question.content = {__text :questionJSON.questionJson.question.cont.__cdata, __img :questionJSON.questionJson.question.cont._img, __imgAlt :questionJSON.questionJson.question.cont._imgAlt, __image :true};
		} else if(questionJSON.questionJson.question.cont._aud !== undefined) {
			questionJSON.questionJson.question.content = {__text :questionJSON.questionJson.question.cont.__cdata, __aud :questionJSON.questionJson.question.cont._aud, __audio :true};
		} else if(questionJSON.questionJson.question.passage !== undefined) {
			if(questionJSON.questionJson.question.passage.__cdata.indexOf(".jpg") !== -1) {
				questionJSON.questionJson.question.content = {__text :questionJSON.questionJson.question.cont.__cdata, __psg :questionJSON.questionJson.question.passage.__cdata, __passage :true};
			} else {
				questionJSON.questionJson.question.content = {__text :questionJSON.questionJson.question.cont.__cdata, __psg :questionJSON.questionJson.question.passage.__cdata, __passage :true, __content :true};
			}
		} else {
			questionJSON.questionJson.question.content = {__text :questionJSON.questionJson.question.cont.__cdata};
		}

		var opts = questionJSON.questionJson.question.opts.__cdata;
		var optns = [];
		optns = opts.split("|");
		var option = [] ;
		for(var k = 0;k < optns.length; k++) {
		option.push({content: {__text: optns[k]}});
		}
		questionJSON.questionJson.options = {option: option};

		var correctAnswer = questionJSON.questionJson.question.opts._ans;

		questionJSON.questionJson.answers = {answer: {content: {__text: correctAnswer}}};

		return questionJSON;

	}

	/**
	* Function to show Tab Group.
	*/
	function showTabGroup(tabGroup){
		if(__state.currentTabGroup !== tabGroup){
			$('li.questiontabs').addClass('hidden');
			$('li.tabGroup' + tabGroup).removeClass('hidden');
		}
	}

	/**
	* Function to handle window resize.
	*/
	function handleWindowResize(){
		var tabs = getNoOfTabsByWidth();
		repainttabs(tabs);
	}

	/**
	* Function to Preview Gradebook
	*/
	function previewGradebook(lastResults) {

		__state.activityPreviewGradebook = true;

		$('.nextQuestion').click(handleNextQuestion);

		updateLastSavedResults(lastResults, true);
		$('a[data-toggle="tab"]').on('shown', function (e) {
			showQuestion(parseInt($(e.target).data('itemno'),10)-1,true);
		});

		var totalQuestions = lastResults.results.length;
		for(var i=1; i <= totalQuestions; i++) {
			$('li#tab_' + i + ' a').tab('show');
		}

		$('li#tab_1 a').tab('show');

		$(".media-heading").addClass('hide');
		$(window).resize(handleWindowResize);
	}

	/**
	 *  Function used to create JSON from user Answers for submit(soft/hard).
	 *  Called by saveResults (internal).
	 */
	function getAnswersJSON(){
		var answers = multiitemhandler.getAnswersJSON();
		var results = answers.results;
		if(__state.activityLastResults !== undefined) {
			results = __state.activityLastResults.results.concat(answers.results);
		}
		return {
			response: {
				"results": results
			}
		};				
	}
	
	/*
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
	 * Parse and Update JSON based on PlacementTest specific requirements.
	 */
	function parseAndUpdateJSONContent(jsonContentXML, params, lastResults, nextQuestion) {

		__config.MAX_TABS_PER_PAGE = getNoOfTabsByWidth();
		var totalLevels = 4;

		__content.questionInformationXML.totalQuestions = totalLevels * __config.TOTAL_QUESTIONS_IN_EACH_LEVEL;
		__content.questionInformationXML.maxTabsPerPage = __config.MAX_TABS_PER_PAGE;
		__content.questionInformationXML.questionsJSON = [];
		__content.reportLayout = jsonContentXML.activity.report.__cdata;
		
		var level = 0;
		var currentLevelQuestionAttempted;
		var currentLevel;

		if(params["mode"].activityState === "state_preview" || (lastResults !== undefined && nextQuestion !== undefined)) {
			var results = lastResults.results;

			level = Math.floor(results.length / __config.TOTAL_QUESTIONS_IN_EACH_LEVEL);
			currentLevel = level;
			currentLevelQuestionAttempted = lastResults.results.length - (__config.TOTAL_QUESTIONS_IN_EACH_LEVEL * level);

			/* To fill Level Array for report purpose. */
			for(var p = 0; p < level; p++) {
				var subTestMap = {};
				var subtestLen = jsonContentXML.activity.subtest.length;
				var decreasedPercentage = getDecreasePercentage(subtestLen, jsonContentXML, p);

				var levelQuestionsAlreadyAdded = 0;
				for(var subtest = 0; subtest < subtestLen; subtest++) {
					var levelSubtestQuestions = jsonContentXML.activity.subtest[subtest].level[p].que.length;
					if(subtest === subtestLen - 1) {
						levelSubtestQuestions = __config.TOTAL_QUESTIONS_IN_EACH_LEVEL - levelQuestionsAlreadyAdded;
					} else {
						levelSubtestQuestions = levelSubtestQuestions - Math.round(((decreasedPercentage/100) * levelSubtestQuestions));
					}
					levelQuestionsAlreadyAdded = levelQuestionsAlreadyAdded + levelSubtestQuestions;
					subTestMap[subtest] = levelSubtestQuestions;
				}
				__content.levelArray.push(subTestMap);
			}


			var questionJSONMap = {};

			var nextLevel = Math.min(currentLevel + 1, totalLevels);
			for(var lev =0; lev < nextLevel; lev++) {
				var subLength = jsonContentXML.activity.subtest.length;
				for(var k = 0; k < subLength; k++) {
					var subTestID = jsonContentXML.activity.subtest[k]._id;
					var javascript = jsonContentXML.activity.subtest[k]._js;
					var subLayout = jsonContentXML.activity.subtest[k]._layout;

					var catInstr = getQuestionCategoryAndInstruction(subTestID);

					var questionArray = jsonContentXML.activity.subtest[k].level[lev].que;

					for(var l = 0 ; l < questionArray.length; l++) {
						var qstnJSON = {questionJson: {question: questionArray[l]}};
						qstnJSON = formatQuestionJSON(qstnJSON, javascript, subLayout, catInstr[0], catInstr[1], subTestID);
						questionJSONMap[qstnJSON.questionNumber] = qstnJSON;
					}
				}
			}

			for (var result = 0; result < results.length; result++) {
				var resultUID = results[result].itemUID;
				__content.questionInformationXML.questionsJSON.push(questionJSONMap[resultUID]);
				__content.itemUIDMap[resultUID] = result;
			}

			if(params["mode"].activityState === "state_preview") {
				__content.questionInformationXML.totalQuestions = results.length;
				return __content.questionInformationXML;
			}

			__content.questionInformationXML.questionsJSON.push(questionJSONMap[nextQuestion]);
			__content.itemUIDMap[nextQuestion] = "";
		}

		for (; level< totalLevels; level++) {

			var subtestLength = jsonContentXML.activity.subtest.length;

			var decreasePercentage = getDecreasePercentage(subtestLength, jsonContentXML, level);

			var levelQuestionsAdded = 0;
			var subtestMap = {};
			var currentSubtestHandled = false;
			for(var i = 0; i < subtestLength; i++) {
				var levelQuestions = jsonContentXML.activity.subtest[i].level[level].que.length;
				if(i === subtestLength - 1) {
					levelQuestions = __config.TOTAL_QUESTIONS_IN_EACH_LEVEL - levelQuestionsAdded;
				} else {
					levelQuestions = levelQuestions - Math.round(((decreasePercentage/100) * levelQuestions));
				}
				levelQuestionsAdded = levelQuestionsAdded + levelQuestions;
				subtestMap[i] = levelQuestions;
				if(lastResults !== undefined && nextQuestion !== undefined && currentLevel === level && !currentSubtestHandled) {
					if(currentLevelQuestionAttempted >= levelQuestionsAdded) {
						continue;
					} else {
						levelQuestions = (levelQuestionsAdded - currentLevelQuestionAttempted) - 1;
						currentSubtestHandled = true;
					}
				}


				var questionJSON = [];
				var questionJSONArray = [];

				var subtestID = jsonContentXML.activity.subtest[i]._id;
				var js = jsonContentXML.activity.subtest[i]._js;
				var layout = jsonContentXML.activity.subtest[i]._layout;

				var categoryInstruction = getQuestionCategoryAndInstruction(subtestID);

				var j = 0;
				questionJSONArray = jsonContentXML.activity.subtest[i].level[level].que;
				var newQuestionJSONArray = questionJSONArray.shuffle();
				while(questionJSON.length < levelQuestions) {
					if(lastResults !== undefined && nextQuestion !== undefined && currentLevel === level) {
						var newQuestionUID = newQuestionJSONArray[j]._no;
						if(newQuestionUID.indexOf("_") !== -1) {
							newQuestionUID = newQuestionUID.replace(/_/g, '');
						}
						if(__content.itemUIDMap[newQuestionUID] === undefined) {
							questionJSON.push(formatQuestionJSON({questionJson: {question: newQuestionJSONArray[j]}}, js, layout, categoryInstruction[0], categoryInstruction[1], subtestID));
						}
					} else {
						questionJSON.push(formatQuestionJSON({questionJson: {question: newQuestionJSONArray[j]}}, js, layout, categoryInstruction[0], categoryInstruction[1], subtestID));
					}
					j++;
				}
				__content.questionInformationXML.questionsJSON = __content.questionInformationXML.questionsJSON.concat(questionJSON);
			}
			__content.levelArray.push(subtestMap);
		}
		return __content.questionInformationXML;
	}
	
	/**
	 * Setting event listeners.
	 */
	function setupEventHandlers() {
		
		/* Event to handle next question click. */
		$('.nextQuestion').click(handleNextQuestion);

		/* Event to know whether user is answered. */
		$(document).bind('userAnswered', function() {
			/* Disabling next button. */
			$(".nextQuestion").removeAttr('disabled');
		});

		/* Tab click event. */
		$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			if(__state.activitySubmitted === false) {
				saveResults(false);
			}
			showQuestion(parseInt($(e.target).data('itemno'),10)-1);
		});
	}	
    
	/**
	 * Function to display last result saved in LMS.
	 */
	function updateLastSavedResults(lastResults) {
		multiitemhandler.updateLastSavedResults(lastResults);
	}
	
	/*
	 * Function to extract engine name from the filename by trimming extension, package version (if any) and minified text(if any).
	 */
	function extractEngineName(filename) {
		var jsName;
		var lastPosition = filename.lastIndexOf(".js");
		var startPosition = filename.lastIndexOf("/") + 1;
		jsName = filename.substring(startPosition, lastPosition);
		var firstIndex = jsName.indexOf("-");
		if(firstIndex === -1) {
			return jsName;
		} else {
			return jsName.substring(0, firstIndex);    
		}
	}	
	
	return  {
		/*Engine-Shell Interface*/
		"init": init, /* Shell requests the engine intialized and render itself. */
		"getStatus": getStatus, /* Shell requests a gradebook status from engine, based on its current state. */
		"getConfig" : getConfig /* Shell requests a engines config settings.  */
	};
    };
});

(function(c){var d=document,a='appendChild',i='styleSheet',s=d.createElement('style');s.type='text/css';d.getElementsByTagName('head')[0][a](s);s[i]?s[i].cssText=c:s[a](d.createTextNode(c));})
('/*******************************************************\r\n *\r\n * Core styles for the PLACEMENTTEST Engine\r\n *\r\n * These styles do not include any product-specific branding\r\n * and/or layout / design. They represent minimal structural\r\n * CSS which is necessary for a default rendering of an\r\n * PLACEMENTTEST activity\r\n *\r\n * The styles are linked/depending on the presence of\r\n * certain elements (classes / ids / tags) in the DOM (as would\r\n * be injected via a valid PLACEMENTTEST layout HTML and/or dynamically\r\n * created by the PLACEMENTTEST engine JS)\r\n *\r\n *\r\n *******************************************************/\r\n\r\n.activity-body .multitabDivContainer input[type=\"text\"] {\r\n\tbackground-color:#ffffff;\r\n}\r\n\r\n.activity-body .multitabDivContainer {\r\n\tpadding: 30px;\r\n}\r\n\r\nspan.correct:before {\r\n    content: \"\\f00c\";\r\n    font-family: fontawesome;\r\n\tposition: relative;\r\n    margin-top: -4px;\r\n\tmargin-right: 5px;  \r\n}\r\n\r\nspan.wrong:before {\r\n    content: \"\\f00d\";\r\n    font-family: fontawesome;\r\n\tposition: relative; \r\n    margin-top: -4px;\r\n\tmargin-right: 5px;\r\n}\r\n\r\n.activity-body .multitabDivContainer span.wrong:before,\r\n.activity-body .multitabDivContainer span.correct:before {\r\n\tdisplay: inherit;\r\n}\r\n\r\n.activity-body .questionContainer .progressTest .col-6.last-child {\r\n\tmin-height: 200px;\r\n\tborder-left: 1px dashed #C2C2C2;\r\n\tpadding-left: 20px;\r\n}\r\n\r\n.activity-body .prev-next-toolbar {\r\n\tdisplay:block;\r\n}\r\n\r\n.activity-body.progress-test .prev-next-toolbar\tbutton i {\r\n\tline-height:1.15;\r\n}\r\n\r\n.activity-body .questiontabs a:hover,\r\n.activity-body .questiontabs a:focus,\r\n.activity-body.progress-test .prev-next-toolbar\tbutton:focus,\r\n.activity-body.progress-test .prev-next-toolbar\tbutton:hover {\r\n\toutline: none;\r\n}\r\n\r\n.activity-body span.cursorPointer {\r\n\tcursor: pointer;\r\n}\r\n\r\n.overflow-y {\r\n\toverflow-y: auto;\r\n\t-webkit-overflow-scrolling: touch;\r\n}\r\n\r\n.stepLeftRight {\r\n\tmargin-top: 30px;\r\n\tmargin-bottom: 20px;\r\n}\r\n\r\n.cursor_pointer {\r\n\tcursor:pointer;\r\n}\r\n\r\n.book-info .headers {\r\n    width: 85%;\r\n}\r\n\r\n.activity-body .questionContainer .placementTest .col-6.last-child {\r\n\tmin-height: 200px;\r\n\tborder-left: 1px dashed #C2C2C2;\r\n\tpadding-left: 20px;\r\n}\r\n\r\n.activity-body .pt-instructions {\r\n\tcolor: #000000;\r\n}\r\n\r\n/********Responsive Starts*******/\r\n@media (max-width: 767px) {\r\n\r\n\t.activity-body .questionContainer .progressTest .col-6.last-child {\r\n\t\tborder-left: 0 none;\r\n\t\tpadding-left: 0px;\r\n\t}\r\n\r\n\t.activity-body .multitabDivContainer .col-6 hr {\r\n\t\tdisplay: inherit;\r\n\t}\r\n\t\r\n\t.activity-body .questionContainer .placementTest .col-6.last-child {\r\n\t\tborder-left: 0 none;\r\n\t\tpadding-left: 0px;\r\n\t}\r\n\t.activity-body .questionContainer .placementTest .col-6.last-child {\r\n\t\tborder-left: 0 none;\r\n\t\tpadding-left: 0px;\r\n\t}   \r\n\t.placementTest .multitabDivContainer {\r\n\t\tpadding: 30px 8px;\r\n\t}\r\n\t.placementTest .table th {\r\n\t\tpadding: 2px 5px;\r\n\t\tfont-size: 14px;\r\n\t} \t\r\n}\r\n\r\n@media (max-width: 480px) {\r\n\r\n\t.activity-body.progress-test .stepLeftRight button.btn-lg {\r\n\t\tfont-size: 13.5px;\r\n\t\tpadding: 11px 14px;\r\n\t}\r\n\r\n\t.activity-body.progress-test .stepLeftRight a {\r\n\t\tline-height: 15px;\r\n\t}\r\n\t\r\n\t.placementTest .multitabDivContainer {\r\n\t\tpadding: 20px 3px;\r\n\t}\r\n\t.placementTest .table th {\r\n\t\tfont-size: 12px;\r\n\t\tpadding: 1px;\r\n\t\tmin-width: 20%;\r\n\t}\r\n\t.placementTest .table tr {\r\n\t\tfont-size: 15px;\r\n\t}\r\n\t.table th, .table td {\r\n\t\tword-break: break-all;\r\n\t}\t\r\n}');
