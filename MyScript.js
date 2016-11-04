var app = angular.module("myApp", []);
var my_x2js = new X2JS();

app.service('activeTabs', function() {
	var myIDs = {
		"programming": angular.element(document.querySelector('#ProgrammingJobs')),
		"writing": angular.element(document.querySelector('#WritingJobs')),
		"all": angular.element(document.querySelector('#AllJobs'))
	};
	var reload = true;
	var myJobs = {
		"programming": "",
		"writing": "",
		"all": ""
	};
	return {
		getJobBoard: function(idToGet) {
			var temp = Object.keys(myJobs);
			for (var i = 0; i < temp.length; i++) {
				if (angular.equals(temp[i], idToGet)) {
					return myJobs[temp[i]];
				}
			}
		},
		setJobBoard: function(idToChange, myXml) {
			var temp = Object.keys(myJobs);
			for (var i = 0; i < temp.length; i++) {
				if (angular.equals(temp[i], idToChange)) {
					myJobs[temp[i]] = myXml;
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
			//tell parseString to remake url and Query
			reload = true;
			return this.getJobBoard();
		}
	};
});

app.controller("tabParent", function($scope, activeTabs, $sce) {
	$scope.customHTML = $sce.trustAsHtml('<div class=bootcards-list><div class=list-group><div class=row><div ng-repeat="response in jsonResponse"><div ng-repeat="myResults in response.results.result"><div class=col-sm-6><div ng-if="$index % 2 == 0"></div><div class="panel panel-default"><div class="clearfix panel-heading"><h3 class=text-center>{{myResults.jobtitle}}</h3></div><div class=list-group><div class=list-group-item><p class=list-group-item-text>Company<h4 class=list-group-item-heading>{{myResults.company}}</h4></div><div class=list-group-item><p class=list-group-item-text>Location<h4 class=list-group-item-heading>{{myResults.formattedLocation}}</h4></div><div class=list-group-item><p class=list-group-item-text>{{myResults.snippet}}</div></div><div class=panel-footer><div class="btn-group btn-group-justified"><div class=btn-group><a class="btn btn-default"href=#><i class="fa fa-arrow-down"></i> View More Info</a></div><div class=btn-group><a class="btn btn-default"href={{myResults.url}}><i class="fa fa-envelope"></i> Go To Post</a></div></div></div></div></div></div></div></div></div></div>');
	$scope.$on("url_reload_check_two", function(event, data) {
		// Testing purposes, IT WORKS!!
		//console.log("Parent $on function");
	});
});

app.controller("myCtrl", function($scope, $http, activeTabs) {
	//$scope.writingHtml = $sce.trustAsHtml(htmlToSend)
	$scope.getUpdate = function($event) {
		//console.log($event.target.hash);
		//console.log(angular.element(document.getElementById($event.target.hash)).scope.controller;
		$scope.$parent.$broadcast("url_reload_check_two", $event.target.hash);
	};
});

app.controller("parseString", function($scope, $sce, $http, activeTabs) {
	var vm = this;
	var currentId = "";
	vm.response = [];
	$scope.indeedRequestUrl = "http://api.indeed.com/ads/apisearch?";
	$scope.indeedStringBuild = {
		"publisher": "9810209592087925",
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
	$scope.URL_Handle = function(jobBoard) {
		// console.log($scope.stringBuild send api request);
		// $scope.requestUrl = $scope.indeedUrlBuilder($scope.indeedRequestUrl, $scope.indeedStringBuild)
		$scope.requestUrl = $scope.indeedUrlBuilder($scope.indeedRequestUrl, $scope.indeedStringBuild);
		console.log($scope.requestUrl);
		// For now, we must assume that we have a XML string to setup list-group stuff on the main page
		$http.get($scope.requestUrl).then(function(data) {
			vm.response = data.data;
		}).then(function(data) {
			$scope.jsonResponse = my_x2js.xml_str2json(vm.response);
			activeTabs.setJobBoard(currentId, $scope.jsonResponse);
		});
	};
	// Only get the URL if we need to reload the container
	function url_reload_check(id) {
		if (activeTabs.getReload() == true) {
			//console.log(activeTabs);
			if (activeTabs.getJobBoard(currentId) != "") {
				$scope.jsonResponse = activeTabs.getJobBoard(currentId);
				activeTabs.setReload(false);
			} else {
				$scope.URL_Handle(id);
				activeTabs.setReload(false);
			}
		}
	}
	$scope.$on("url_reload_check_two", function(event, args) {
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
				url_reload_check(temp[i]);
				//console.log($scope.indeedStringBuild);
			}
		}
	});
	$scope.indeedStringBuild["q"] = "programming";
	currentId = "programming";
	url_reload_check();
});
