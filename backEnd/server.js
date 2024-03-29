var port = 1864;
var models = require('./models');
var io = require('socket.io')(port);
console.info('Server listening on ' + port);

function Client(socket) {
  this.socket = socket;
  this.user = null;

  // register events
  this.on('login', Client.AuthenticationLevel.ANON, this.onLogin);
  this.on('changeAuthenticationLevel', Client.AuthenticationLevel.ADMIN, this.onChangeAuthenticationLevel);
  this.on('listRooms', Client.AuthenticationLevel.USER, this.onListRooms);
  this.on('createRoom', Client.AuthenticationLevel.OFFICER, this.onCreateRoom);
  this.on('destroyRoom', Client.AuthenticationLevel.OFFICER, this.onDestroyRoom);
}

Client.AuthenticationLevel = {
  ANON: 0,
  USER: 1,
  OFFICER: 2,
  ADMIN: 3,
};

Client.prototype.onDestroyRoom = function (data) {
  var client = this;
  models.destroyRoom(data.roomId).then(function () {
    client.emit('destroyRoomSuccess');
  }, function (err) {
    console.warn(err);
    client.emit('destroyRoomError');
  });
};

Client.prototype.onCreateRoom = function (data) {
  var client = this;
  models.createRoom(data.name, data.password).then(function (room) {
    client.emit('createRoomSuccess', room.getViewModel());
  }, function (err) {
    console.warn(err);
    client.emit('createRoomError');
  });
};

Client.prototype.onListRooms = function () {
  var client = this;
  models.getRooms().then(function (rooms) {
    for (var i = 0; i < rooms.length; ++i) {
      rooms[i] = rooms[i].getViewModel();
    }
    client.emit('listRoomsSuccess', rooms);
  }, function (err) {
    console.warn(err);
    client.emit('listRoomsError');
  });
};

Client.prototype.onChangeAuthenticationLevel = function (data) {
  var client = this;
  models.changeAuthenticationLevel(data.userId, data.authenticationLevel).then(function () {
    client.emit('changeAuthenticationLevelSuccess');
  }, function (err) {
    console.warn(err);
    client.emit('changeAuthenticationLevelError');
  });
};

Client.prototype.onLogin = function (data) {
  var client = this;
  models.login(data.username, data.password).then(function (user) {
    client.user = user;
    client.emit('loginSuccess', user.getViewModel());
  }, function (err) {
    console.warn(err);
    client.emit('loginError');
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
