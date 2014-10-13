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
      var user = result.dataValues;
      delete user.password;
      delete user.createdAt;
      delete user.updatedAt;
      return result.dataValues;
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
    return Room.findAll();
  },

  createRoom: function (name, password) {
    return Room.create({
      name: name,
      password: password,
    });
  },
};
