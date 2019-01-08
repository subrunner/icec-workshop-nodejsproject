/**
* IBM Connections Engagement Center - {custom}.js
* @copyright Copyright IBM Corp. 2017, 2017 All Rights Reserved
*/
(function () {
	"use strict";
	var WIDGET_ID = "Mein_Peopleselector";

	XCC.X = XCC.X || {};

	XCC.X[WIDGET_ID] = function(){




		/**
		* Function which is called when the Widget is rendered.
		* @param	{[Jquery-Object]} container$ [the HTML-container in the Widget.. ]
		* @param	{[Object]} widgetData [The widget data]
		* */
		function createWidget(container$, widgetData) {
			console.log(widgetData);
			container$[0].innerHTML="<div>" + widgetData.contentStream[0].name + "<p style='background: red; height: 20px;width:100%'>test</p></div>";
		} // END createWidget

		/**
		* TODO Editor Anpassen - an XCC-EDITOR-Config.js orientieren
		*/
		var editor = {
			channel: {
				maxChannel: 10,
				namePlaceholder: false,
				autocompletePosts: "People",
				selectLabel: XCC.L.get("icec_widget_channel_selectPeople", "Select Person"),
				channelName: true
			}
		};


		XCC.W.registerCustomWidget(WIDGET_ID,
		"flag",
		createWidget,
		editor); // END XCC.W.registerCustomWidget
	}; // END XCC.X[WIDGET_ID]
}());