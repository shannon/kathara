angular.module('kathara.game', [])
	.factory('gameService', [
    function(){
    	var scenes = {};

      function connect(host, scene){
      	scene = getScene(scene || host);

      	var socket = io.connect('ws://' + host);

				socket.on('initial-state', function(data){
					//console.log(data);
			  });

				socket.on('state', function(data){
					//console.log(data);
			  });
      }

      function getScene(scene){
      	if(scene instanceof THREE.Scene){ return scene; }

      	if(!scenes[scene]){
      		scenes[scene] = new THREE.Scene();
      	}

      	return scenes[scene];
      }

      return {
        connect: connect,
        scene: getScene
      };
    }
  ])

;