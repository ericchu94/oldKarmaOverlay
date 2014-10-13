var Sequelize = require('sequelize')
  , sequelize = new Sequelize('karma_overlay', 'karma_overlay', 'karma_overlay', {
    dialect: 'sqlite',
    storage: 'db.sqlite',
  });

var User = sequelize.define('User', {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  authenticationLevel: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  instanceMethods: {
    getViewModel: function () {
      var user = this.dataValues;
      delete user.password;
      delete user.createdAt;
      delete user.updatedAt;
      return user;
    },
  },
});

var Room = sequelize.define('Room', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

sequelize.sync().then(function () {
  console.log('Database sync success');
}, function (err) {
  console.error(err);
});

module.exports = {
  login: function (username, password) {
    return User.findOrCreate({
      where: {
        username: username,
        password: password,
      }
    }).spread(function (result, created) {
      return result.getViewModel();
    });
  },

  changeAuthenticationLevel: function (userId, authenticationLevel) {
    return User.update({ authenticationLevel: authenticationLevel }, {
      where: {
        id: userId,
      },
    });
  },

  getRooms: function () {
    return Room.findAll().then(function (results) {
      for (var i = 0; i < results.length; ++i) {
        var result = results[i];
        var room = result.dataValues;
        delete room.password;
        delete room.createdAt;
        delete room.updatedAt;
        results[i] = room;
      }
      return results;
    });
  },

  createRoom: function (name, password) {
    return Room.create({
      name: name,
      password: password,
    }).then(function (result) {
      var room = result.dataValues;
      delete room.password;
      delete room.createdAt;
      delete room.updatedAt;
      return room;
    });
  },
};
