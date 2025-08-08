app.controller('site-other-controll', function($scope, $http) {
    console.log("site-other-controll loading");

	$http.get("data/site-other.json")
		.then(function (response) {
			$scope.apps = response.data.apps;
		}
	);
	
	$scope.download = function(link) {
		window.open(link, '_blank');
	}
});