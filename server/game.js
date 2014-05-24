var CANNON  = require('cannon')
;

function Game(server){
  var game = this;
  game.debugServer = server;

  game.time = 0;
  game.lastStep = Date.now();
  game.frameAccumulator = 0;
  game.targetFPS = process.env.KATHARA_TARGET_FPS || 60;
  game.prepareWorld();


  game.step();
}

Game.prototype.step = function(){
  var game = this;
  var now = Date.now();
  var delta = now - game.lastStep;
  game.lastStep = now;

  if(!game.paused){

    game.frameAccumulator += delta;

    while (game.frameAccumulator >= 1000 / game.targetFPS) {
      game.update();
      game.frameAccumulator -= 1000 / game.targetFPS;
    }
  }

   setTimeout(game.step.bind(game), 1000 / game.targetFPS);
}

Game.prototype.update = function(){
  var game = this;
  game.time++;
  game.world.step(1 / game.targetFPS);
  game.state = {
    serverTime: Date.now(),
    gameTime: game.time,
    entities: game.entities.map(function(entity){
      return {
        id: entity.id,
        position: entity.body.position
      };
    })
  }
  game.broadcastState();
}

Game.prototype.broadcastState = function(){
  //Broadcast state to server instances
  if(this.debugServer){
    this.debugServer.processState(this.state);
  } else {
    process.send({ process: 'server', method: 'processState', arguments: [this.state] });
  }
}

Game.prototype.prepareWorld = function(){
  //temp world
  var game = this;
  game.world = new CANNON.World();
  game.world.solver.iterations = process.env.KATHARA_SOLVER_ITERATIONS || 10;
  game.world.gravity.set(0, 0, -10);
  game.world.broadphase = new CANNON.NaiveBroadphase();

  // Create a sphere
  var mass = 5, radius = 1;
  var sphereShape = new CANNON.Sphere(radius);
  var sphereBody = new CANNON.RigidBody(mass, sphereShape);
  sphereBody.position.set(0, 0, 1000);
  game.world.add(sphereBody);

  // Create a plane
  var groundShape = new CANNON.Plane();
  var groundBody = new CANNON.RigidBody(0, groundShape);
  game.world.add(groundBody);

  game.entities = [
    { id: 'sphere', body: sphereBody },
    { id: 'plane', body: groundBody }
  ];
}

module.exports = Game;