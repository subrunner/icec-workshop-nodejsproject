/**!
 * CommunityOverview.js - IBM Connections Engagement Center (ICEC)
 * register with communityOverview
 *
 * Renders Communities with a picture and a short description in a list.
 *
 * @copyright Copyright IBM Corp. 2017, 2017 All Rights Reserved
 *
 * @author Christian Luxem (CLU)
 * @depends jQuery
 *****************************************************************************/
/*jslint browser:true,white:true,multivar:true,this:true,fudge:true,single:true*/
/*global XCC, jQuery, window*/
/*exported createCommunityOverview */
(function ($, W) {
	"use strict";

	var X = (function () {W.XCC = W.XCC || {}; return W.XCC; }()); // get or create and expose the XCC Object

	/**
	 * <p>Creates a widget, which shows latest or selected 3 blog entries underneath with an image,
	 * same like our TopNews widget.</p>
	 */
	function createCommunityOverview(data, cCS, wBox$) {

		var cCS2 = cCS ? cCS : W.communityUuid ? [{uid: W.communityUuid}] : [],
			fullFeed = [],
			deferredArr = [],
			pushFeed = function (data) {
				fullFeed.push($(data));
			},
			pulldata = function (uid) {
				return $.ajax({
					url: X.T.getRootPath("Communities") + "/service/atom/community/instance",
					data: {
						communityUuid: uid
					},
					cache: false,
					useDb: pushFeed
				})
					.done(pushFeed)
					.fail(function (e) {
						X.console.error("Error retrieving Community", e);
					});
			};
		wBox$.empty().append(X.U.createLoadingIcon());


		function renderwidget() {
			var arr = [],
				html = "",
				columns = "";
			$.each(cCS2, function (i, el) {
				var entry$ = $(fullFeed).filter(function () {
					return $(this).find("communityUuid,snx\\:communityUuid").text() === el.uid;
				});
				if (entry$[0]) {
					arr.push(entry$[0]);
				}
			});
			fullFeed = $(arr);

			// compute class for 2 column layout if placeholder is wide enough
			if (wBox$.width() >= 820) {
				columns = " xccCO2Columns";
			}

			$(fullFeed).each(function(index, el$) {
				var summary = X.T.sanitizeHTML(el$.find("summary").first().text()),
					title = X.T.sanitizeHTML(el$.find("title").first().text()),
					communityUrl = el$.find("link[rel$=logo]").attr("href");
				// summary is a string cut to length 300...
				// we will append "..." at the end of the string!
				if (summary.length == 300) {
					summary += "...";
				}
				html += '<a target="_blank" rel="noopener noreferrer" href="'
					+ el$.find("link[rel=alternate]").attr("href")
					+ '" style="display: block;"><div class="xccEntry xccEntryExt' + columns + ' clearfix">'
					+ '<div class="newsOverviewContainer clearfix">'
					+ '<img alt="' + X.L.get("aria_communityImage", "Community Image of $1", title) + '" class="newsOverviewImage" data-src="'
					+ communityUrl + '" src="' + communityUrl
					+ '"></div><div class="newsOverviewContent clearfix bidi-btd bidi-align">'
					+ '<h3 style="font-size:16px;" class="xccHeadline">'
					+ title
					+ "</h3>"
					+ '<div class="newsOverviewTeaser" style="color:#222;">'
					+ summary
					+ "</div></div></div></a>";
			});
			wBox$.html(html).find("img").unveil();
			X.T.triggerEventsForWidget(data, wBox$);
			console.log("CommunityOverview: exit renderwidget");
		} // END renderwidget


		$.map(cCS2, function eachCCS(val) {
			deferredArr.push(pulldata(val.uid));
		});

		if (!cCS2.length && (X.C.admin || X.C.contentMaster)) {
			wBox$.html(X.U.createBootstrapAlert(X.L.get("commo_invalid_noCommunity", "Please adjust Widget configuration. Settings missing: No Community defined.")));
		} else {
			$.whenAll.apply($, deferredArr).always(renderwidget);
		}
	} // END createCommunityOverview

	// expose functions
	// define this function in dependency of nothing else
	X.define([""], function () {
		return createCommunityOverview;
	}); // END X.define
} (XCC.jQuery || jQuery, window));
