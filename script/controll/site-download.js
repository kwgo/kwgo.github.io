app.controller('site-download-controll', function($scope, $http) {
    console.log("site-download-controll loading");

	$http.get("data/site-download.json")
		.then(function (response) {
			$scope.apps = response.data.apps;
		}
	);
		
	$scope.download = function(link) {
		window.open(link, '_blank');
	}	
});