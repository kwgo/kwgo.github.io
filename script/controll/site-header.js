app.controller('site-header-controll', function($scope, smtpService) {
    console.log("site_header-controll loading ... ...");
    $scope.goPage = function(page) {
    	$scope.$parent.goPage(page);
    }
	
	$scope.send = function(email) {	
		email.subject = "Contact us from Sokoban (Boxman) Online:";
		smtpService.send(email);
	}
});