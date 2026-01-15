'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add OAuth provider ID columns
    await queryInterface.addColumn('Users', 'googleId', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true
    });

    await queryInterface.addColumn('Users', 'facebookId', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true
    });

    await queryInterface.addColumn('Users', 'linkedinId', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true
    });

    await queryInterface.addColumn('Users', 'twitterId', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true
    });

    await queryInterface.addColumn('Users', 'instagramId', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'googleId');
    await queryInterface.removeColumn('Users', 'facebookId');
    await queryInterface.removeColumn('Users', 'linkedinId');
    await queryInterface.removeColumn('Users', 'twitterId');
    await queryInterface.removeColumn('Users', 'instagramId');
  }
};
