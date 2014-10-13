var socket = require('socket.io-client')('http://localhost:1864');

var commands = {
  l: {
    fn: function (splitted) {
      socket.emit('login', { username: splitted[1], password: splitted[2] });
    },
    verbose: 'login USERNAME PASSWORD',
  },
  cal: {
    fn: function (splitted) {
      socket.emit('changeAuthenticationLevel', { userId: splitted[1], authenticationLevel: splitted[2] });
    },
    verbose: 'changeAuthenticationLevel USERID AUTHENTICATIONLEVEL',
  },
  lr: {
    fn: function (splitted) {
      socket.emit('listRooms');
    },
    verbose: 'listRooms',
  },
  cr: {
    fn: function (splitted) {
      socket.emit('createRoom', { name: splitted[1], password: splitted[2] });
    },
    verbose: 'createRoom',
  },
}

var stdin = process.openStdin();

stdin.addListener('data', function (data) {
  var line = data.toString().substring(0, data.length - 1);
  var splitted = line.split(' ');
  var cmd = commands[splitted[0]];
  if (cmd) {
    cmd.fn(splitted);
  } else {
      console.warn('Unknown command: ' + splitted[0]);
      displayCommands();
  }
});

function displayCommands() {
  console.log('Commands:');
  for (var idx in commands) {
    console.log(idx + ': ' + commands[idx].verbose);
  }
}

var user = null;

socket.on('createRoomSuccess', function (data) {
  console.log('Create room success');
});

socket.on('createRoomError', function (data) {
  console.log('Create room failure');
});

socket.on('listRoomsSuccess', function (data) {
  console.log('List rooms success');
});

socket.on('listRoomsError', function (data) {
  console.log('List rooms failure');
});

socket.on('loginSuccess', function (data) {
  console.log('Login success');
  user = data;
});

socket.on('loginError', function () {
  console.log('Login failure');
});

socket.on('changeAuthenticationLevelSuccess', function () {
  console.log('Change authentication level success');
});

socket.on('changeAuthenticationLevelError', function () {
  console.log('Change authentication level failure');
});

socket.on('connect', function () {
  console.log('Connected');
});
