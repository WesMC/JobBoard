/**
*	Description: Contain the main functionality of the entire project in JS code through the use of Angular JS
*		Angular JS lets us have the ability to shift our Server Side functionality to the Front End
*		So long as we keep the sensitive information on the server, and not here, this is perfectly acceptable
*
*	File: 					MyScript.js
*	Author: 				Wesley Couturier
*	Date (last modified): 	11-7-2016 (mm-dd-yyyy)
*/

// The ONLY globals we will have.
var app = angular.module("myApp", []);
// This is used to turn XML to a JSON objet for javascript usage
var my_x2js = new X2JS();

// Service contains variables and functions that multiple controllers might need access to.
// You can only get access to service variables through the use of it's functions, a.k.a. Encapsulation.
app.service('activeTabs', function() {
	// IDs for the tabs that determine which tab is active, so we know where to post our tab content
	var myIDs = {
		"programming": angular.element(document.querySelector('#ProgrammingJobs')),
		"writing": angular.element(document.querySelector('#WritingJobs')),
		"all": angular.element(document.querySelector('#AllJobs'))
	};

	// Bool to double check if we're allowed to get new content
	var reload = true;

	// Set/Dictionary used to contain the current contents of each tab. Why make another query when we had
	// it before?
	var myJobs = {
		"programming": "",
		"writing": "",
		"all": ""
	};

	return {
		// Returns specified set/Dictionary
		getJobBoard: function(idToGet) {
			var temp = Object.keys(myJobs);
			for (var i = 0; i < temp.length; i++) {
				if (angular.equals(temp[i], idToGet)) {
					return myJobs[temp[i]];
				}
			}
		},
		// Sets specified set/Dictionary in the Service
		setJobBoard: function(idToChange, myJson) {
			var temp = Object.keys(myJobs);
			for (var i = 0; i < temp.length; i++) {
				if (angular.equals(temp[i], idToChange)) {
					myJobs[temp[i]] = myJson;
				}
			}
		},

		getReload: function() {
			return reload;
		},

		setReload: function(boolIn) {
			reload = boolIn;
		},

		getIDs: function() {
			return myIDs;
		},
		// If we want to know which tab we're on, we need to check which one is active. This function
		// updates our service IDs so we know which one is active.
		updateIDs: function() {
			myIDs = {
				"programming": angular.element(document.getElementById('ProgrammingJobs')),
				"writing": angular.element(document.getElementById('WritingJobs')),
				"all": angular.element(document.getElementById('AllJobs'))
			};
		},

		reloadContainer: function() {
			// Need to make sure we get the right info for the right tab
			this.updateIDs();
			// tell parseString to remake url and Query
			reload = true;
			return this.getJobBoard();
		}
	};
});

// Parent Controller used to take broadcast event and data from one child to another
app.controller("tabParent", function($scope, activeTabs, $sce) {
	$scope.$on("url_reload_check_two", function(event, data) {
		// This function's sole purpose is to be here, Nothing else. Don't Do anything in here.
		// If you need additional functionaly, please write a new function in this Parent Controller.
	});
});

// Controller used to broadcast to sibling controller to update tab content
app.controller("myCtrl", function($scope, $http, activeTabs) {
	$scope.getUpdate = function($event) {
		// This will call the "url_reload_check_two" function in Parent to give this controller's
		// sibling the tab we seleted.
		$scope.$parent.$broadcast("url_reload_check_two", $event.target.hash);
	};
});

// Controller that handles the tab content, url building and querying from Indeed's API
app.controller("parseString", function($scope, $sce, $http, activeTabs) {
	// NEED variable of this instance. You'll see later.
	var vm = this;
	// Which tab ID is Active for tab content load.
	var currentId = "";
	// Empty container for response returns.
	vm.response = [];

	// scope variables to building the URL
	$scope.indeedRequestUrl = "http://api.indeed.com/ads/apisearch?";
	$scope.indeedStringBuild = {
		"publisher": "{{PUBLISHER-ID}}",
		"v": 2,
		"format": "xml",
		"callback": "",
		"q": "",
		"l": "",
		"sort": "",
		"radius": "",
		"st": "",
		"jt": "",
		"start": "",
		"limit": 25,
		"fromage": "",
		"highlight": "",
		"filter": 1,
		"latlong": 0,
		"chnl": "",
		"co": "us",
		"userip": "1.2.3.4",
		"useragent": "Mozilla/%2F4.0(Firefox)"
	};

	$scope.indeedUrlBuilder = function(baseUrl, GivenJson) {
		/** This builds the api url for indeed's request
		 *	PARAMETERS:
		 *		baseUrl - the header url for indeed, typically is contained in $scope.indeedRequestUrl
		 *		GivenJson - The JSON object that contains the different that are to be added to make the url
		 * 	RETURNS:
 		 *		correctly built URL as a String
		 */
		var urlToReturn = "";
		urlToReturn += baseUrl;
		for (var key in GivenJson) {
			if (GivenJson.hasOwnProperty(key)) { //THIS WORKS!!
				urlToReturn += key + "=" + GivenJson[key] + "&";
			}
		}
		return urlToReturn;
	};

	$scope.URL_Handle = function() {
		/** Function gets built URL, then uses $http to request a response. We should have the
		*		functions built into $http for success or failure
		*	PARAMETERS:
		*		none
		* 	RETURNS:
		*		nothing
		*/

		$scope.requestUrl = $scope.indeedUrlBuilder($scope.indeedRequestUrl, $scope.indeedStringBuild);
		// console.log($scope.requestUrl);		// *** Debug Purposes, keep here *** //
		// For now, we must assume that we have a XML string to setup list-group stuff on the main page
		$http.get($scope.requestUrl).then(function(data) {
			vm.response = data.data;
		}).then(function(data) {
			$scope.jsonResponse = my_x2js.xml_str2json(vm.response);
			activeTabs.setJobBoard(currentId, $scope.jsonResponse);
		});
	};

	function xml_handler (ID) {
		/** Function returns xml response from resquest of local xml files located in project path
		*	PARAMETERS:
		*		ID - current ID that we're going to use to determine which xml file to grab
		* 	RETURNS:
		*		xml data from local files
		*/

		var xhttp = new XMLHttpRequest();
		var parser = new DOMParser();
		if (ID == "programming") {
			xhttp.open("GET", "../libs/xml/allProgramming.xml", false);
			xhttp.send();
		}
		else if (ID == "writing") {
			xhttp.open("GET", "../libs/xml/allWriting.xml", false);
			xhttp.send();
		}
		else {
			xhttp.open("GET", "../libs/xml/allJobs.xml", false);
			xhttp.send();
		}

		return xhttp.responseText;
	}

	$scope.URL_Handle_2 = function () {
		/** Function returns back a pre-determined reponse from Indeed.com's API using the proper format
		* 		of an API call. Uses the files /libs/xml/
		*	PARAMETERS:
		*		none
		* 	RETURNS:
		*		nothing
		*/
		
		if (currentId == "programming")
			$scope.jsonResponse = my_x2js.xml_str2json(xml_handler(currentId));
		else if (currentId == "writing")
			$scope.jsonResponse = my_x2js.xml_str2json(xml_handler(currentId));
		else if (currentId == "all")
			$scope.jsonResponse = my_x2js.xml_str2json(xml_handler(currentId));

		activeTabs.setJobBoard(currentId, $scope.jsonResponse);
	}

	function url_reload_check() {
		/** Determines if 1) we CAN check for a chenge of tab content, and 2)
		*		if we should get a new URL response, or get our JobBoard if there's anything in there.
		*	PARAMETERS:
		*		none
		* 	RETURNS:
		*		nothing
		*/
		if (activeTabs.getReload() == true) {
			//console.log(activeTabs);
			if (activeTabs.getJobBoard(currentId) != "") {
				$scope.jsonResponse = activeTabs.getJobBoard(currentId);
				activeTabs.setReload(false);
			} else {
				// For Web server usage
				//$scope.URL_Handle();

				// For Local Usage, pulling from the XML files
				$scope.URL_Handle_2();

				activeTabs.setReload(false);
			}
		}
	}

	$scope.$on("url_reload_check_two", function(event, args) {
		/** Receives Parent's broadcast, and interprets which tab content to load. as well as tells
		*	the string build what to query (i.e. Programming, Writing, or All Jobs)
		*	PARAMETERS:
		*		event - Where the event broadcast call took place, this is a default
		*		args - an array if more than one item is in here, Is nothing more than what we want to pass,
		*				In this case, it is the id of the element of what we want to make the tab Content to
		*/
		var myIDs = activeTabs.getIDs();
		var temp = Object.keys(myIDs);
		activeTabs.setReload(true);
		// determine what are we querying based on which id is active
		// object containing which ID's we're checking against
		for (var i = 0; i < temp.length; i++) {
			if (angular.equals(myIDs[temp[i]], angular.element(document.querySelector(args)))) {
				//console.log("I'm in if");
				$scope.indeedStringBuild["q"] = temp[i];
				currentId = temp[i];
				url_reload_check();
				//console.log($scope.indeedStringBuild);
			}
		}
	});

	// Some defaults to get the ball rolling.
	$scope.indeedStringBuild["q"] = "programming";
	currentId = "programming";
	url_reload_check();
});
