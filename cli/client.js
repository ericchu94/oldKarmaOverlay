var io = require('socket.io-client')('http://localhost:1864');

io.on('connect', function () {
  io.emit('login', { username: 'admin', password: 'admin' });
});
