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

sequelize.sync().success(function () {
  console.log('Database sync success');
}).error(function (err) {
  console.error(err);
});

module.exports = {
  login: function (username, password) {
    return User.findOrCreate({
      where: {
        username: username,
        password: password,
      }
    });
  },

  changeAuthenticationLevel: function (userId, authenticationLevel) {
    console.log(userId, authenticationLevel);
    return User.update({ authenticationLevel: authenticationLevel }, {
      where: {
        id: userId,
      },
    });
  },
};
