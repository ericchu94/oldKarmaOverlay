var port = 1864;
var models = require('./models');
var io = require('socket.io')(port);
console.info('Server listening on ' + 1864);

function Client(socket) {
  this.socket = socket;
  this.user = null;

  // register events
  this.on('login', this.onLogin);
}

Client.prototype.onLogin = function (data) {
  debugger;
  var user = models.login(data.username, data.password);
  if (user) {
    this.user = user;
    this.emit('loginSuccess');
  } else {
    this.emit('loginFailure');
  }
};

Client.prototype.on = function (name, fn) {
  console.info('Registering handler for ' + name);
  var client = this;
  this.socket.on(name, function (data) {
    console.info('Handling event: ' + name);
    fn.call(client, data);
  });
};

Client.prototype.emit = function (name, data) {
  console.info('Emitting event: ' + name);
  this.socket.emit(name, data);
};

io.on('connection', function (socket) {
  console.info('Incoming connection');
  var client = new Client(socket);
});
