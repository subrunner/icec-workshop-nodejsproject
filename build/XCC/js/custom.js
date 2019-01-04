/**
 * IBM Connections Engagement Center - {custom}.js
 * @copyright Copyright IBM Corp. 2017, 2018 All Rights Reserved
 */
(function () {
	"use strict";
	XCC.X = XCC.X || {};
	XCC.X.init = function() {
		var tempModuleObject = {},
			customPath = "/xcc/rest/public/custom/";

		// initialize CustomWidgets, if they are defined
		$.each(XCC.X.customWidgets || [], function (i, widgetName) {
			try {
				XCC.X[widgetName]();
			} catch (e){
				console.log("Cannot initialize widget " + widgetName + "!");
				console.error(e);
			}
		});

		// calculate path of customModules. Here we need to follow a name convention: All replaced Modules have the name "CUSTOM-<Originalname>"
		$.each(XCC.X.replacedModules || [], function (i, val) {
			var originalName = XCC.requirejs.s.contexts._.config.paths[val].split("/").pop(),
				newName = "CUSTOM-" + originalName;

			tempModuleObject[val] = customPath + newName;
		});
		// now we replace the original paths with our new Custom-paths
		$.extend(XCC.requirejs.s.contexts._.config.paths, tempModuleObject);

	};
}());