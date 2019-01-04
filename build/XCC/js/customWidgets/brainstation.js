/**
* IBM Connections Engagement Center - {custom}.js
* @copyright Copyright IBM Corp. 2017, 2017 All Rights Reserved
*/
(function () {
	"use strict";
	var WIDGET_ID = "Brainstation",
		DEBUG=false;

	XCC.X = XCC.X || {};

	XCC.X[WIDGET_ID] = function(){


		/**
		* @return {String} creates the HTML for loading div
		*/
		function getLoadingDiv(){
			return "<div class='loading'>" + XCC.L.get("ee_loading", "Loading...") + "</div>";
		}

		/**
		* Function which is called when the Widget is rendered.
		* @param	{[Jquery-Object]} container$ [the HTML-container in the Widget.. ]
		* @param	{[Object]} widgetData [The widget data]
		* */
		function createWidget(container$, widgetData) {

			var CATEGORY,
				PAGESIZE,
				ORDER_BY="",
				SORT_ASCENDING=true,
				customData = XCC.CustomEditor.getCustomData_static(widgetData);

			// default values
			if (!customData.numberItems){
				customData.numberItems = "5";
			}
			customData.numberItems = parseInt(customData.numberItems);
			customData.externalJobs = (customData.externalJobs === "true");
			customData.showSearch = (customData.showSearch === "true");
			customData.showAsList = (customData.showAsList === "true" || customData.showAsList === "List");

			PAGESIZE = customData.numberItems;

			function getBaseUrl(){
				return "/talentlink/brainstation/documents";
			}

			function fetchDocuments(targetContainer$, start, category, keywords){
				var urlString = getBaseUrl()
					+ "?pageSize=" + PAGESIZE
					+ "&start="	+ start
					+ "&lang=" + getLocale()
					+ (keywords? "&search=" + keywords : "")
					+ (category? "&category=" + category : "")
					+ (DEBUG? "&debug=true":"")
					+ (ORDER_BY? "&orderBy=" + ORDER_BY:"")
					+ "&sortAscending=" + SORT_ASCENDING;
				console.debug("fetch documents entering");

				targetContainer$.empty();
				targetContainer$.append(getLoadingDiv());

				$.ajax({
					url: urlString
				}).done(function(json){
					console.log("Server return", json);
					renderResults(targetContainer$, json);
				}).fail(function(){
					XCC.T.notifyError("Could not load brainstation data.");
				});
			} // END fetchDocuments;

			function getLocale(){
				if (window.currentLogin && window.currentLogin.language){
					return window.currentLogin.language;
				}
				return window.navigator.language;

			} // END getLocale

			/**
			* Renders the documents results JSON
			*
			* @param {Array} data documents JSON
			*/
			function renderResults(targetContainer$, data){
				var pagesizesResult = [5, 10, 25, 50],
					$pagesizeContainer = $("<div class='pagesize'/>"),
					$resultContainer = $("<div class='results'/>"),
					$resultTable = $("<table class='resultsTable'/>");



				// 1.) Create the resultnumber select
				/*$pagesizeContainer.append("<div class='numberresults'>" +
					XCC.L.get("talentlink_numberresults", "Number Results:") +
					"</div>");*/
				if (pagesizesResult.indexOf(customData.numberItems) < 0){
					pagesizesResult.push(customData.numberItems);
					pagesizesResult = pagesizesResult.sort(function(a,b){
						if (!a ){
							a = 0;
						}
						if (!b){
							b = 0;
						}
						return a-b;
					});
				}
				pagesizesResult.forEach(function(ps, index){
					$pagesizeContainer.append("<a class='pagesizeNumber" +
						(ps === PAGESIZE? " selectedNumber":"") +
						"'>" + ps + "</a>");
				});
				$.each($pagesizeContainer.find(".pagesizeNumber"), function(index, el){
					$(el).click(function(){
						var pagesize = parseInt(el.innerHTML);
						PAGESIZE = pagesize;
						submitSearch();
					});
				});

				/**
				* parses a long date into a localized date string
				* @param {long} longTime milliseconds of date
				* @return {String} localized date string
				*/
				function getDate(longTime){
					var date,
						locale = getLocale();
					if (!longTime)
					{
						return "";
					}

					date = new Date(longTime);
					return date.toLocaleDateString(locale);
				} // END getStartDate

				// 2.) Render results
				if (data.length){
					// there are results! should we render as list or as tiles?
					if (customData.showAsList){
						// display as list
						$resultTable.append("<tr><th>" +
							XCC.L.get("brainstation_documenttitle", "Title") +
							"</th><th>" +
							XCC.L.get("brainstation_category", "Category") +
							"</th><th>" +
						XCC.L.get("brainstation_ranking", "Ranking") +
							"</th><th>" +
							XCC.L.get("brainstation_created", "Created") +
							"</th><th>" +
							XCC.L.get("brainstation_lastMod", "Last Modified") +
							"</th></tr>"
						);
						data.forEach(function(object, index){
							if (index >= PAGESIZE){
								return false;
							}

							$resultTable.append("<tr><td>" +
									"<a href='" + object.openInBrainstationPath + "' target='_blank'>" +
										object.title +
									"</a>" +
								"</td><td>" +
								object.categoryBranchText +
								"</td><td>" +
								object.ranking +
								"</td><td>" +
								getDate(object.creatordate) +
								"</td><td>" +
								getDate(object.changedate) +
								"</td></tr>"
							);
							return true;
						});
						$resultContainer.append($resultTable);
					} else {
						// display with individual tiles
						data.forEach(function(object, index){
							var $div = $("<div class='item'/>");

							if (index >= PAGESIZE){
								return false;
							}

							$div.append("<h3>" + "<a href='" + object.openInBrainstationPath + "' target='_blank'>" +
								object.title +
							"</a>" + "</h3>" +
								"<div class='startDate'>" + getDate(object.changedate) + "</div>" +
								"<div class='category'>" + object.categoryBranchText + "</div>" +
								"<div class='ranking'>" + object.ranking + "</div>"
							);

							$div.click(function(){
								window.open(object.openInBrainstationPath, "_blank");
							});

							$resultContainer.append($div);
						});

						// append 2 empty divx at the end in case we need free space in 2- or 3-column grids
						// in the flex grid for uneven count (when in 2 columns)
						$resultContainer.append("<div class='empty'/>");
						$resultContainer.append("<div class='empty'/>");
					}
				} else {
					// no content
					$resultContainer.append("<div class='nocontent'>" +
						XCC.L.get("talentlink_noresults", "Your search returned no results.") +
						"</div>");
				}

				targetContainer$.empty();
				targetContainer$.append($resultContainer);
				targetContainer$.append($pagesizeContainer);

			} // END renderResults

			/**
			* Renders the search area if necessary, and then triggers loading the jobs
			*/
			function createSearch(){
				var search$=$("<div class='search'/>"),
					result$ = $("<div class='display-results'/>");
				container$.empty();
				container$.append(search$);
				container$.append(result$);
				result$.append(getLoadingDiv());

				// no search to be rendered: fetch documents immediately
				if (!customData.showSearch){
					submitSearch();
					return;
				}


				// We do have a search to be rendered.

				// Load the labels and values for our search form
				$.ajax({
					url: getBaseUrl() + "?type=getCategories&lang=" + getLocale() + (DEBUG? "&debug=true":"")
				}).done(function(json){
					console.log("Server return", json);

					renderSearch(json);
				}).fail(function(){
					XCC.T.notifyError("Could not load search criteria.");
					submitSearch();
				});

			} // END createSearch

			/**
			* Renders the search form, and then automatically sends the empty filter
			*
			* @param {JSON} json the CategoryTO with all the available search boxes and filters
			*/
			function renderSearch(json){
				var search$ = container$.find(".search"),
					topLevelOptions = [],
					categories$ = $("<div class='categories'/>"),
					buttonSearch$,
					sortByName$ = $("<div class='sort'><a href='javascript:void(0)'>Name</a></div>"),
					sortByDate$ = $("<div class='sort'><a href='javascript:void(0)'>Modified</a></div>");

				console.log("entering renderSearch");
				search$.empty();
				search$.append(categories$);

				// render topmost layer
				renderCategoriesLevel(json, 0, "", XCC.L.get("widgetType_brainstation_category", "Category"), categories$);

				/*
				* @param {JSON} json
				* @param {Number} level Level of the current rendering of subcategories
				* @param {String} categoryCaption display string for the category
				* @param {jquery} parentDiv$ div to which the subcategory can be appended
				*/
				function renderCategoriesLevel(json, level, currentCat, categoryCaption, parentDiv$){
					var selectId = "level" + level,
						options = [],
						categoryContainer$ = $("<div class='category'/>"),
						select$;

					/*
					* Options: do we have them?
					*/
					console.log("render categories entering(" + json + "," + level + "," + currentCat + "," + categoryCaption + ")");
					Object.keys(json).forEach(function(key){
						var value = json[key];
						if (key == "label" || key == "value"){
							return;
						}

						options.push(
							{
								"label":value.label,
								"value":value.value
							});
					});

					// we don't have any child categories: do nothing.
					if (options.length == 0){
						return;
					}

					/*
					* Render dropdown with options
					*/
					parentDiv$.empty();
					parentDiv$.append("<div class='group'><label for='" + selectId + "'>" + categoryCaption + "</label>"
						+ "<select name='" + selectId + "' id='" + selectId + "'/></div></div>"	);
					parentDiv$.append(categoryContainer$);
					// fill child categories
					select$ = parentDiv$.find("#" + selectId);
					populateSelectWithOptions(options, select$);

					/*
					* selection chatnge
					*/
					select$.change(function(){
						var selected$ = select$.find("option:selected"),
							selected = selected$.attr("value"),
							lastLevel;
						//console.log("Selected " + selected);
						if (selected == 0){
							// default: go back to parent element ID...
							if (level === 0){
								CATEGORY = "";
							} else {
								CATEGORY = currentCat;
							}

							// remove the child elements...
							categoryContainer$.empty();
						}

						else {
							// we chose a category. Create a child select with all subcategories
							CATEGORY = selected;
							lastLevel = selected.split('_');
							console.log("Selected, lastLevel, json",selected,lastLevel, json);
							lastLevel = lastLevel[lastLevel.length-2];

							renderCategoriesLevel(json[lastLevel], level+1, CATEGORY, selected$.text(), categoryContainer$);
						}
					});


				} // END renderCategoriesLevel

				/**
				* populates a select dropdown with options
				* @param {Array of JSON} options must have label + value for each item
				* @param {jQuery} select$ select item to be populated with the options
				*/
				function populateSelectWithOptions(options, select$){
					if (!options)
					{
						options = [];
					}
					select$.empty();
					select$.append("<option value='0'>" + XCC.L.get("widgetType_talentlink_all", "All") + "</option>");
					options.forEach(function(el, index){
						select$.append("<option value='" + el.value + "'>" + el.label + "</option>");
					});
				} // END populateSelectWithOptions


				// render keyword box

				// keywords
				search$.append("<div class='group'><label for='keywords'>" + XCC.L.get("widgetType_talentlink_keywords", "Keywords") + "</label>"
					+ "<textarea name='keywords' id='keywords'/></div>"	);





				/*
				* 3.) Set search button event
				*/
				buttonSearch$ = $("<div class='btn btn-default' id='search'>" + XCC.L.get("widgetType_talentlink_search", "Search") + "</div>");
				search$.append(buttonSearch$);
				buttonSearch$.click(function(){
					submitSearch();
				});

				/*
				* 4.) Sorting
				*/
				function setSortAction(sortParam){
					// we have already clicked the name? reverse the sort order
					if (ORDER_BY === sortParam){
						SORT_ASCENDING = !SORT_ASCENDING;
					}

					// we have not clicked the link: set params
					else {
						ORDER_BY = sortParam;
						SORT_ASCENDING = true;
					}

					// send filters
					submitSearch();
				}
				sortByName$.click(function(){
					setSortAction("");
				});
				sortByDate$.click(function(){
					setSortAction("changeDateTime");
				});
				search$.append(sortByName$);
				search$.append(sortByDate$);
				// other possible sortings:
				// subject, summary, isReleased, creatorName, publishName, changeName, publishDateTime, validFromDate, ranking, readStatus


				// trigger the standard search
				submitSearch();

			} // END renderSearch

			function submitSearch(){
				var result$ = container$.find(".display-results").first(),
					keyword;

				console.log("entering submitSearch");
				result$.empty();

				if (customData.showSearch){
					try {
						keyword = container$.find("#keywords")[0].value;
					} catch (e){
						console.log("Could not retrieve keyword for search query",e);
					}
				}

				// now actually load the stuff we are looking for
				fetchDocuments(result$, 0, CATEGORY, keyword);
			} // END submitSearch

			function getSearchCriteria(){
				var selectedCountry = container$.find("#country option:selected"),
					selectedCity = container$.find("#city option:selected"),
					selectedFunctions = container$.find("#function option:selected"),
					searchList = [],
					functionsList=[];

				// country and city: if a value other than '0' is chosen, add to the search criteria
				if (selectedCountry){
					selectedCountry = selectedCountry[0].value;
					if ('0' !== selectedCountry){
						searchList.push(selectedCountry);
					}
				}
				if (selectedCity){
					selectedCity = selectedCity[0].value;
					if ('0' !== selectedCity){
						searchList.push(selectedCity);
					}
				}

				// function: combine all functions to the or clause (concatenate all values with ',')
				if (selectedFunctions){
					$.each(selectedFunctions, function( index, element){
						if (element.value && element.value !== "0"){
							functionsList.push(element.value);
						}
					});
					functionsList = functionsList.join(',');
					if (functionsList){
						searchList.push(functionsList);
					}
				}

				return searchList;
			} // END getSearchCriteria


			createSearch();

		} // END createWidget

		var editor = {
			input: [
				{
					type: "check",
					label: "Search",
					name: "show",
					key: "showSearch"

				},
				{
					type: "text",
					label: "# items",
					name: "show",
					key: "numberItems"

				},
				{
					type: "radio",
					label: "Display",
					parentClass: 'asWidget-NaviPoints',
					options: "List,Tiles",
					key: "showAsList"

				}
			],
			channel: false
		};


		XCC.W.registerCustomWidget(WIDGET_ID,
		"flag",
		createWidget,
		editor); // END XCC.W.registerCustomWidget
	}; // END XCC.X[WIDGET_ID]
}());