app.service('gameService', function ($q, $http) {
    console.log("site-game-service loading ... ...");
    this.loadStages = function () {
        var deferred = $q.defer();
 	    $http.get("data/site-game.json", { cache: false }).then(function (response) {
	            deferred.resolve(response.data.stages);
	    });
        return deferred.promise;
	}
    
    this.asynchCall = function (task) {
    	setTimeout(function() { task() }, 0);
    }

});
