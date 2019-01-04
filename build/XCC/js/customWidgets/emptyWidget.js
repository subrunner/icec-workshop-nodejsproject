/**
* IBM Connections Engagement Center - {custom}.js
* @copyright Copyright IBM Corp. 2017, 2017 All Rights Reserved
*/
(function () {
	"use strict";
	var WIDGET_ID = "_myID_";

	XCC.X = XCC.X || {};

	XCC.X[WIDGET_ID] = function(){




		/**
		* Function which is called when the Widget is rendered.
		* @param	{[Jquery-Object]} container$ [the HTML-container in the Widget.. ]
		* @param	{[Object]} widgetData [The widget data]
		* */
		function createWidget(container$, widgetData) {
			// TODO create code!
			var customData = XCC.CustomEditor.getCustomData_static(widgetData); // contains all editor.input key-value pairs
		} // END createWidget

		/**
		* TODO Editor Anpassen - an XCC-EDITOR-Config.js orientieren
		*/
		var editor = {

			channel: false // muss explizit ausgeschaltet werden, wenn keine Channels erwünscht sind
		};


		XCC.W.registerCustomWidget(WIDGET_ID,
		"flag",
		createWidget,
		editor); // END XCC.W.registerCustomWidget
	}; // END XCC.X[WIDGET_ID]
}());