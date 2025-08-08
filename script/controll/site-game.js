app.controller('site-game-controll', function($scope, $cookies, $document, gameService) {	
    $scope.stages = null;
    
    $scope.gameIndex = 0;
    $scope.stageIndex = 0;
    $scope.stageCount = 0;
    $scope.stageMatrix = null;
    $scope.stageList = ",";
    
    $scope.loadCookies = function() {
    	var gameIndex = $cookies.get('gameIndex');
    	var stageIndex = $cookies.get('stageIndex');
 	  	if(gameIndex && stageIndex) {
	    	$scope.gameIndex = parseInt(gameIndex);
			$scope.stageIndex = parseInt(stageIndex);
    	}
    	$scope.stageList = $cookies.get('stageList') ? $cookies.get('stageList') : ",";
    };
    
    $scope.saveCookies = function() {
		var expireDate = new Date();
		expireDate.setDate(expireDate.getDate() + (365 * 3));
    	$cookies.put('gameIndex', $scope.gameIndex, {'expires': expireDate});
    	$cookies.put('stageIndex', $scope.stageIndex, {'expires': expireDate});
    };

    $scope.saveSuccess = function() {
		var expireDate = new Date();
		expireDate.setDate(expireDate.getDate() + (365 * 3));   	
    	if($scope.stageList.indexOf("," + $scope.gameIndex + "." + $scope.stageIndex + ",") < 0) {
    		$scope.stageList = $scope.stageList + $scope.gameIndex + "." + $scope.stageIndex + ",";
    	}
    	$cookies.put('stageList', $scope.stageList, {'expires': expireDate});
    };
    
    $scope.isSuccessStage = function(gameIndex, stageIndex) {
    	return $scope.stageList.indexOf("," + gameIndex + "." + stageIndex + ",") >= 0;
    };
    
    $scope.selectGame = function(gameIndex) {
        $scope.gameIndex = gameIndex;
        $scope.stageIndex = -1;
        $scope.stageMatrix = null;
        if($scope.stages != null) {
            $scope.stageCount = $scope.stages[$scope.gameIndex].length;
        }
    };
    
    $scope.selectStage = function(gameIndex, stageIndex) {
        $scope.gameIndex = gameIndex;
        $scope.stageIndex = stageIndex;
        $scope.saveCookies();
        if($scope.stages != null) {
            $scope.stageCount = $scope.stages[$scope.gameIndex].length;
            $scope.stageMatrix = $scope.stages[$scope.gameIndex][$scope.stageIndex];
            $scope.loadStage();
        }
    };

    $scope.initStage = function(gameIndex, stageIndex) {
	    gameService.loadStages().then(function (stages) {
	    	$scope.stages = stages;
			$scope.selectStage(gameIndex, stageIndex); 
		});
    }
    
    $scope.loadStage = function() {
	    gameService.asynchCall(function() {
	    	_load($scope.stageIndex, $scope.stageMatrix, _element('container'), _element('titler'), $scope.onSuccess, $scope.keyPress); 
	    });
    }

    $scope.moveStep = function(step) {
       	if(_toward) _toward(step);
    }

    $scope.keyPress = function(ev) {
       	if(ev.keyCode == 33 && ev.altKey && $scope.stageIndex > 0) {
      		$scope.selectStage($scope.gameIndex, $scope.stageIndex - 1);
       	} else if(ev.keyCode == 34 && ev.altKey && $scope.stageIndex < $scope.stageCount - 1) {
      		$scope.selectStage($scope.gameIndex, $scope.stageIndex + 1);
      	}
    }

    $scope.onSuccess = function() {
		$scope.saveSuccess();
		var modal = new bootstrap.Modal($document[0].querySelector('#successModal'));
		modal.show();
	}
    
    $scope.goNext = function() {
       	$scope.selectStage($scope.gameIndex, $scope.stageIndex + 1);
    }
    
    $scope.loadCookies();
    $scope.initStage($scope.gameIndex, $scope.stageIndex);
});