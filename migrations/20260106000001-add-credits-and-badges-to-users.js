'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'credits', {
      type: Sequelize.INTEGER,
      defaultValue: 100,
      allowNull: false,
      comment: 'User credits (coins) for gamification rewards'
    });

    await queryInterface.addColumn('users', 'badgesCount', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Total number of badges unlocked by the user'
    });

    // Update existing users to have default credits and badges
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET credits = 100, "badgesCount" = 0 
      WHERE credits IS NULL OR "badgesCount" IS NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'credits');
    await queryInterface.removeColumn('users', 'badgesCount');
  }
};
