angular.module('kathara.viewport', [])

	/* 
	* Viewport - renders a threejs scene
	* 
	* TODO: expose camera settings and position to scope
	* TODO: expose option to allow free mode with controls
	*	TODO: expose settings for subdividing viewport using renderer.viewport
	*
	*
	* Due to a limitation in threejs, multiple angular viewports cannot render the 
	* same scene and require the use of renderer.viewport
	*/
	.directive('katharaViewport', function(){	  
	  return {
	    restrict: 'A',
	    scope: {
	      scene: '='
	    },
	    link: function(scope, element, attrs){
	    	var elem = element[0];
	    	var renderer = new THREE.WebGLRenderer({ antialias:true });
				var camera = new THREE.PerspectiveCamera( 75, elem.offsetWidth / elem.offsetHeight, 1, 10000 );
  			camera.position.z = 10;

				var raf, width, height;
				(function render(){
					if(width !== elem.offsetWidth || height !== elem.offsetHeight){
						width = elem.offsetWidth;
						height = elem.offsetHeight;
						renderer.setSize( elem.offsetWidth, elem.offsetHeight );
						camera.aspect = elem.offsetWidth / elem.offsetHeight;
						camera.updateProjectionMatrix();
					}

					renderer.render( scope.scene, camera );
					raf = requestAnimationFrame(render);
				})();

				scope.$on('$destroy', function(){
					cancelAnimationFrame(raf);
				});

				elem.appendChild( renderer.domElement );


	    }
	  };
	})
;