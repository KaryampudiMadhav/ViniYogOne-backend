'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Get existing columns
      const tableDescription = await queryInterface.describeTable('users');
      
      // Add credits column only if it doesn't exist
      if (!tableDescription.credits) {
        await queryInterface.addColumn('users', 'credits', {
          type: Sequelize.INTEGER,
          defaultValue: 100,
          allowNull: false,
          comment: 'User credits (coins) for gamification rewards'
        }, { transaction });
      }

      // Add badgesCount column only if it doesn't exist
      if (!tableDescription.badgesCount) {
        await queryInterface.addColumn('users', 'badgesCount', {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false,
          comment: 'Total number of badges unlocked by the user'
        }, { transaction });
      }

      // Update existing users to have default credits and badges
      await queryInterface.sequelize.query(`
        UPDATE users 
        SET credits = COALESCE(credits, 100), "badgesCount" = COALESCE("badgesCount", 0);
      `, { transaction });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const tableDescription = await queryInterface.describeTable('users');
      
      if (tableDescription.credits) {
        await queryInterface.removeColumn('users', 'credits', { transaction });
      }
      if (tableDescription.badgesCount) {
        await queryInterface.removeColumn('users', 'badgesCount', { transaction });
      }
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
