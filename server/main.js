var cluster  = require('cluster')
  , os       = require('os')
  , Server   = require('./server')
  , Game     = require('./game')
  , fs       = require('fs-extra')
  , winston  = require('winston')
  , mongoose = require('mongoose-q')(require('mongoose'), { spread:true })
;

var debug = process.execArgv.join(' ').indexOf('--debug') !== -1;

if (cluster.isMaster) {

  if(debug){
    new Game(new Server());
  } else{
    cluster.setupMaster({ silent: true });

    fs.mkdirsSync(process.env.KATHARA_LOG_PATH);

    var logger = new (winston.Logger)({
      transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: process.env.KATHARA_LOG_PATH + '/server.log' })
      ]
    });

    var workerTypes = {};
    function fork(type){
      var worker = cluster.fork({ KATHARA_PROCESS_TYPE: type });
      workerTypes[worker.id] = type;
    }

    //We want one game process and as many servers as possible
    fork('game');
    fork('server');

    var cpuCount = os.cpus().length;

    for (var i = 0; i < cpuCount - 2; i ++) {
      fork('server');
    }

    cluster.on('exit', function(worker, code, signal) {
      console.log('Worker ' + worker.process.pid + ' died');
      fork(workerTypes[worker.id]);
      delete workerTypes[worker.id];
    });

    cluster.on('fork', function(worker){
      worker.process.stdout.on('data', function(chunk) {
        logger.info('worker ' + worker.id + ': ' + chunk);
      });
      worker.process.stderr.on('data', function(chunk) {
        logger.warn('worker ' + worker.id + ': ' + chunk);
      });

      worker.on('message', function(message){
        if(message.process){
          for (var id in cluster.workers) {
            if(workerTypes[id] === message.process){
              cluster.workers[id].send({ method: message.method, arguments: message.arguments });
            }
          }
        };
      });
    });
  }

} else {
  switch(process.env.KATHARA_PROCESS_TYPE){
    case 'game':
      new Game();
      break;
    case 'server':
      new Server();
      break;
  }
}