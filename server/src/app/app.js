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

.controller('AppCtrl', function($scope, $state, gameService) {
  $scope.scene = gameService.scene('main');
  $scope.scene2 = gameService.scene('main2');


  gameService.connect('localhost', 'main');

  var sphere = new THREE.Mesh( new THREE.SphereGeometry( 1, 32, 32 ), new THREE.MeshBasicMaterial( {color: 0xffff00} ) );
  var sphere2 = new THREE.Mesh( new THREE.SphereGeometry( 1, 32, 32 ), new THREE.MeshBasicMaterial( {color: 0xffff00} ) );
  $scope.scene.add( sphere );
  $scope.scene2.add( sphere2 );
})

;