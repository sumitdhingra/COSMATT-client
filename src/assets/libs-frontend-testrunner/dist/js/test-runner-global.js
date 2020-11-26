/**
* Purpose: GLOBAL Function to enable registering for Activity Ready Event.
* Input:   The callback to call after the event is triggered
* Output:  1. If event has already been triggered in the past, simply call the callback function
*          2. Else bind the call back funtion to the event.
*          3. Pass "platformAdapter" and "Error" Status to the callback function
*/
registerForReadyEvent = function (callback, uniqueTestId) {
	//loadNewItem = callback;

	//get adaptor object from TestRunner = platformAdapter
	myeltadapter = adaptormap[uniqueTestId];
	//verify if eventObj.fired is a function of platformAdapter


	if (myeltadapter.eventObj.fired === true) {
		MyActivityDelegate = callback(myeltadapter.platformAdapter, myeltadapter.platformStatus);
	} else {
		jQuery(myeltadapter.eventObj).bind("readyEvent", function () {
			MyActivityDelegate = callback(myeltadapter.platformAdapter, myeltadapter.platformStatus);
		});
	}
};