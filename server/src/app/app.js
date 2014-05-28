angular.module('kathara', [
  'kathara.templates',
  'kathara.game',
  'kathara.viewport',
  'ui.bootstrap',
  'ui.router'
])

.config(function($locationProvider, $stateProvider, $urlRouterProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
  $urlRouterProvider.otherwise( '/' );
  $stateProvider.state('app', {
    url: '/',
    controller: 'AppCtrl',
    templateUrl: 'app/app.tpl.html',
    resolve: {
      
    }
  });
})

.controller('AppCtrl', function($scope, $rootScope, $state, gameService) {
  $scope.engine = gameService.engine('mainEngine');
  $scope.scene = gameService.scene('mainScene', 'mainEngine');
  
  $scope.scene.enablePhysics();
  $scope.scene.setGravity(new BABYLON.Vector3(0, -10, 0));

  gameService.start('mainEngine', 'mainScene');
  gameService.connect('localhost', 'mainScene');

  window.addEventListener('resize', function(){
    $scope.$broadcast('refresh');
  });

  var postProcess = new BABYLON.PostProcess('Down Sample', './assets/shaders/downsample', ["screenSize", "highlightThreshold"], null, 0.25, null, BABYLON.Texture.BILINEAR_SAMPLINGMODE, $scope.engine, true);
  postProcess.onApply = function (effect) {
      effect.setFloat2("screenSize", 1000, 1000);
      effect.setFloat("highlightThreshold", 0.90);
  };
  // Temp test world
  var camera = new BABYLON.ArcRotateCamera('main', 1, 0.8, 10, new BABYLON.Vector3(0, 0, 0), $scope.scene);
  var light0 = new BABYLON.PointLight('Omni', new BABYLON.Vector3(0, 0, 10), $scope.scene);
  var origin = BABYLON.Mesh.CreateSphere('origin', 10, 1.0, $scope.scene);
  origin.setPhysicsState({ impostor: BABYLON.PhysicsEngine.MeshImpostor, mass: 1 });

  camera.attachPostProcess(postProcess);

})
;