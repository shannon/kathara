function Client(socket, initialState){
	var client = this;
	client.targetFPS = process.env.KATHARA_TARGET_FPS || 60;
	client.socket = socket;
  client.lastSent = initialState;
  client.socket.emit('initial-state', initialState);
}

Client.prototype.processState = function(state){
	var client = this

  var delta = state.gameTime - client.lastSent.gameTime;
  if(delta >= client.targetFPS / 10){
    client.socket.emit('state', client.deltaState(state));
    client.lastSent = state;
  }
}

function almostEqual(a, b, precision){
    if(precision === undefined){
      precision = 1e-6;
    }
    return Math.abs(a.x - b.x) < precision &&
        	 Math.abs(a.y - b.y) < precision &&
        	 Math.abs(a.z - b.z) < precision;
};

Client.prototype.deltaState = function(state){
	var client = this;
	var lastEntities = client.lastSent.entities.slice();

	var delta = {
		serverTime: state.serverTime,
		gameTime: state.gameTime,
		entities: []
	};

	state.entities.forEach(function(entity){
		for(var e = 0; e < lastEntities.length; e++){
			if(entity.id === lastEntities[e].id){
				if(!almostEqual(entity.position, lastEntities[e].position)){
					delta.entities.push(entity);
				}
				lastEntities.splice(e, 1);
				return;
			}
		}
		delta.entities.push(entity);
	});

	return delta;
}


module.exports = Client;