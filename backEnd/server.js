var port = 1864;
var models = require('./models');
var io = require('socket.io')(port);
console.info('Server listening on ' + port);

function Client(socket) {
  this.socket = socket;
  this.user = null;

  // register events
  this.on('login', Client.AuthenticationLevel.ANON, this.onLogin);
}

Client.AuthenticationLevel = {
  ANON: 0,
  USER: 1,
  OFFICER: 2,
  ADMIN: 3,
};

Client.prototype.onChangeAuthenticationLevel = function (data) {
  var client = this;
  models.changeAuthenticationLevel(data.userId, data.authenticationLevel).success(function () {
    client.emit('changeAuthenticationLevelSuccess');
  }).error(function (err) {
    console.warn(err);
    client.emit('changeAuthenticationLevelFailure');
  });
};

Client.prototype.onLogin = function (data) {
  var client = this;
  models.login(data.username, data.password).success(function (user, created) {
    client.user = user.dataValues;
    client.emit('loginSuccess');
  }).error(function (err) {
    console.warn(err);
    client.emit('loginFailure');
  });
};

Client.prototype.getAuthenticationLevel = function (data) {
  var level = Client.AuthenticationLevel.ANON;

  if (this.user) {
    return this.user.authenticationLevel;
  }

  return level;
};

Client.prototype.on = function (name, authLevel, fn) {
  console.info('Registering handler for ' + name);
  var client = this;
  this.socket.on(name, function (data) {
    if (client.getAuthenticationLevel() < authLevel) {
      console.warn('Insufficient priviledges to handle event: ' + name);
      return;
    }

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
