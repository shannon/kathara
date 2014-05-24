var express         = require('express')
  , bodyParser      = require('body-parser')
  , cookieParser    = require('cookie-parser')
  , expressSession  = require('express-session')
  , MongoStore      = require('connect-mongo')(expressSession)
  , http            = require('http')
  , io              = require('socket.io')
  , ioMongoStore    = require('mong.socket.io')
  , Path            = require('path')
  , mongoose        = require('mongoose')
  , Q               = require('q')
  , grace           = require('./grace')
  , Client          = require('./client')
;

function Server(){
  var server = this;

  server.connect().then(function(){
    server.configureExpress();
    server.configureIO();

    process.on('message', function(message) {
      if(message.method){
        server[message.method].apply(server, message.arguments);
      };
    });
  }).catch(function(error){
    console.error(error);
  });
}

Server.prototype.connect = function(){
  var server = this;
  var deferred = Q.defer();

  mongoose.connect('mongodb://' + process.env.MONGO_PORT_27017_TCP_ADDR + ':' + process.env.MONGO_PORT_27017_TCP_PORT + '/' + process.env.MONGO_DATABASE);

  mongoose.connection.db.on('error', function(error){
    deferred.reject('Mongo Connection Error: ' + error)
  });
  mongoose.connection.db.once('open', function callback () {
    deferred.resolve();
  });

  return deferred.promise;
}

Server.prototype.configureExpress = function(){
  var server = this;

  server.app = express();
  server.http = http.Server(server.app);

  server.app.set('port',  process.env.WEB_PORT || 80);
  server.app.set('views', Path.join(__dirname, 'views'));
  server.app.set('view engine', 'ejs');
  server.app.use(bodyParser.json());
  server.app.use(bodyParser.urlencoded());
  server.app.use(cookieParser(process.env.KATHARA_COOKIE_SECRET));
  server.app.use(expressSession({
    secret: process.env.KATHARA_COOKIE_SECRET,
    maxAge: new Date(Date.now() + parseInt(process.env.KATHARA_COOKIE_MAX, 10)),
    store: new MongoStore({
      host: process.env.MONGO_PORT_27017_TCP_ADDR,
      port: process.env.MONGO_PORT_27017_TCP_PORT,
      db: process.env.MONGO_DATABASE
    })
  }));

  server.app.use(express.static(Path.resolve(__dirname, 'build')));

  server.http.listen(process.env.KATHARA_WEB_PORT || 80, function() {
    console.info('Listening on port %d', server.http.address().port);
  });
  
  grace(server.http);
}

Server.prototype.configureIO = function(){
  var server = this;
  server.io = io.listen(server.http, { log: false });
  server.clients = {};
  server.state = {
    gameTime: 0,
    serverTime: Date.now(),
    bodies: []
  }

  server.io.configure(function() {
    var store = new ioMongoStore({
      url: 'mongodb://' + process.env.MONGO_PORT_27017_TCP_ADDR + ':' + process.env.MONGO_PORT_27017_TCP_PORT + '/' + process.env.MONGO_DATABASE
    });
    server.io.set('store', store);
  });

  server.io.sockets.on('connection', function (socket) {
    server.clients[socket.id] = new Client(socket, server.state);
    socket.on('disconnect', function(){
      delete server.clients['' + socket.id];
    });
  });
}

Server.prototype.processState = function(state){
  var server = this;
  server.state = state;
  if(server.io){
    server.io.sockets.clients().forEach(function (socket) {
      var client = server.clients[socket.id];
      client.processState(state);
    });
  }
}

module.exports = Server;