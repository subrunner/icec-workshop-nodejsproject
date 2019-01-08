/**!
 * PeopleSelector.js - IBM Connections Engagement Center (ICEC)
 *
 * People Selector Widget
 * With this widget you can select one or more persons to be displayed
 * with their business card. By using channels and channel headlines
 * you may use annotations to people groups.
 *
 * @version 2
 *
 * @copyright Copyright IBM Corp. 2017, 2017 All Rights Reserved
 *
 * @author Michael Gollmick (MGO)
 * @depends jQuery, BusinessCard
 *****************************************************************************/
/*jslint browser:true,white:true,multivar:true,this:true,fudge:true,single:true*/
/*global XCC, jQuery, window*/
/*exported createPeopleSelector */
(function ($, W) {
	"use strict";

	var X = W.XCC = W.XCC || {}; // get or create and expose the XCC Object

	// define this function in dependency of profiles
	X.define(["profiles", "businessCard", "businessPopup"], function (PROFILES, renderBusinessCard) {
		function createPeopleSelector(data, wBox$) {
			var profilesRoot = X.T.getRootPath("Profiles"), // store that path for a later fast reuse
				resultDiv$ = $("<div></div>", { // create and append a layer inside the
					"class" : "pf-result"	// widget that holds the selected business cards
				}).appendTo(wBox$),
				cs = (data || {}).contentStream;

			/**
			 * checks if any of the contentStreams of the widget has entries and
			 * items
			 *
			 * @param contentStreams the contentStreams array to check
			 * @return {boolean} whether or not any contentstream has items
			 * */
			function hasCSEntries(contentStreams) {
				var ret = false;
				$.each(contentStreams || [], function (numCs, cS) {
					if (cS.entry && cS.entry && cs[0].entry[0].items && cs[0].entry[0].items.length) {
						ret = true;
					}
					return !ret; // be speedy if we have found an entry
				});
				return ret;
			} // END hasCSEntries


			if (!hasCSEntries(cs)) {
				// if we have no people selected in the config
				if (X.C.admin || X.C.contentMaster) {
					// and are Editor to this page
					resultDiv$.append(X.U.createBootstrapAlert(X.L.get("ps_no_person", "No person selected.")));
				}
			} else {
				// draw the contents of the single contentStreams
				$.map(cs, function (lCs) {
					var entry = lCs.entry || [],
						fentry = entry[0] || {},
						items = fentry.items || [],
						channelName = lCs.name,
						channel$ = $("<div/>", {
							"class" : "pf-channel"
						});
					// add the channel headline if one is given
					if (channelName) {
						channel$.append($("<div/>", {
							"class" : "pf-channel-headline"
						}).text(channelName));
					}
					// now add the selected items
					$.map(items, function (item) {
						channel$.append($("<div/>", {
							"class" : "pf-result", // loading shows a throbbler, needs to re removed later
							"data-uuid" : item.srcId,
							"data-name" : item.srcName,
							"rel" : "person"
						}).append(X.U.createLoadingIcon()));
					}); // END map
					channel$.appendTo(resultDiv$);
				}); // END map cs

				// now parse and load the user data from the divs information
				resultDiv$.find("[rel=person]").each(function (i, v) {
					// now retrieve the persons profile doc
					var v$ = $(v), // get the node as a jQuery object
						d = v$.data(); // get the nodes data-attributes
					PROFILES.getProfileDocByUUID(d.uuid, false, true)
						.done(function (doc) {
							var node$ = $(doc).find(">feed>entry"),
								bc$ = renderBusinessCard({ // and render the result
									atomNode : node$,
									parent : v$,
									profilesRoot : profilesRoot
								}).fadeIn();
							bc$.find("img").unveil(200);
							if (!X.S.mobile) {
								bc$.xccBusinessPopup({
									atomNode : node$,
									detachOnHide : false
								});
							}
						})
						.fail(function () {
							if (X.C.admin || X.C.contentMaster) {
								v$.append(X.U.createBootstrapAlert(X.L.get("ps_profile_error", "Cannot load profile for '$1'", d.name)));
							} else {
								v$.detach();
							}
						}).always(function () { // in any case remove the loading class to remove the throbbler
							v$.find(".xccLoading").remove();
						});
				}); // END resultDiv$.find("[rel=person]")
			} // END else
			X.T.triggerEventsForWidget(data, wBox$);
			alert("Mein Peopleselector");
		} // END createPeopleSelector


		// expose functions
		return createPeopleSelector;
	}); // END XCC.define
} (XCC.jQuery || jQuery, window));
