'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'instagramId', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true
    });

    // Add index for faster lookups
    await queryInterface.addIndex('users', ['instagramId'], {
      name: 'users_instagramId_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', 'users_instagramId_index');
    await queryInterface.removeColumn('users', 'instagramId');
  }
};
