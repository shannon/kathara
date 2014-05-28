angular.module('kathara.game', [])
	.factory('gameService', [
    function(){
      var engines = {};
    	var scenes = {};
      var cameras = {};

      function getEngine(engine, canvas){
        if(typeof engine === 'object'){ return engine; }

        if(!engines[engine]){
          engines[engine] = new BABYLON.Engine(document.createElement('canvas'), true);
        }

        return engines[engine];
      }

      function getScene(scene, engine){
      	if(typeof scene === 'object'){ return scene; }

      	if(!scenes[scene]){
      		scenes[scene] = new BABYLON.Scene(getEngine(engine || scene));
      	}

      	return scenes[scene];
      }

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

      function start(engine, scene){
        scene = getScene(scene);
        getEngine(engine).runRenderLoop(function () {
          scene.render();
        });
      }

      return {
        engine: getEngine,
        connect: connect,
        scene: getScene,
        start: start
      };
    }
  ])

  .directive('katharaGameView', function(gameService){    
      return {
        restrict: 'A',
        scope: {
          engine: '=katharaGameView',
          controls: '=' //list of scenes to allow controls
        },
        link: function(scope, element, attrs){
          var elem = element[0];
          var canvas = gameService.engine(scope.engine).getRenderingCanvas();

          element.append(canvas);

          canvas.width = elem.offsetWidth;
          canvas.height = elem.offsetHeight;

          scope.$on('refresh', function(){
            canvas.width = elem.offsetWidth;
            canvas.height = elem.offsetHeight;
          })

          // scope.$watch('controls', function(newVal, oldVal){
          //   scene.activeCamera.attachControl(canvas);
          // })
        }
      };
    })

;