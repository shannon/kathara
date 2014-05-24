/*
* Kathara Game Client
*/
(function(window, document){
	var Kathara = function(element){
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
		this.camera.position.z = 10;

		this.initRenderer(element);
		this.testScene();
	};

	Kathara.prototype.initRenderer = function(element){
		this.renderer = new THREE.WebGLRenderer({ antialias:true });
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		(element || document.body).appendChild( this.renderer.domElement );
		this.render();
	}

	Kathara.prototype.render = function(){
		this.renderer.render( this.scene, this.camera );
		window.requestAnimationFrame( this.render.bind(this) );
	};

	Kathara.prototype.connect = function(host){
		var socket = io.connect('ws://' + host);

		socket.on('initial-state', function(data){
			//console.log(data);
	  });

		socket.on('state', function(data){
			//console.log(data);
	  });
	};

	Kathara.prototype.testScene = function(){
		var geometry = new THREE.SphereGeometry( 1, 32, 32 );
		var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
		var sphere = new THREE.Mesh( geometry, material );
		this.scene.add( sphere );
	}

	window.Kathara = Kathara;
})(window, document)