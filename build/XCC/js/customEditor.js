/**
*	This class registers a custom editor that other widgets can use to
* quickly create their editor / save actions.
*
*/
(function(){
	"use strict";

	var CE = XCC.CustomEditor || {};
	XCC.CustomEditor = CE;

	CE.getCustomData_static = function(widgetData){
		var ret = {};
		if (widgetData.xccProperty){
			widgetData.xccProperty.forEach(function(property){
				ret[property.propKey] = property.propValue;
			});
		}

		return ret;
	};

})();