var app = angular.module('site-app', ['ngCookies']);
app.filter('range', function() {
	return function(input, total) {
		total = parseInt(total);
	    for (var i=0; i<total; i++) {
	    	input.push(i);
	    }
	    return input;
	};
});

app.filter('integer', function() {
	return function(value) {
		return parseInt(value);
	};
});

app.filter('trustAsResourceUrl', ['$sce', function($sce) {
    return function(value) {
        return $sce.trustAsResourceUrl(value);
    };
}])

app.controller('site-app-controll', function($scope) {
    console.log("site-app-controll loading ...");

    $scope.page = "game";
    $scope.goPage = function(page) {
        $scope.page = page;
    }
});