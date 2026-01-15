'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Get existing columns (use lowercase table name for PostgreSQL)
      const tableDescription = await queryInterface.describeTable('users');
      
      // Add OAuth provider ID columns only if they don't exist
      if (!tableDescription.googleId) {
        await queryInterface.addColumn('users', 'googleId', {
          type: Sequelize.STRING(255),
          allowNull: true,
          unique: true
        }, { transaction });
      }

      if (!tableDescription.facebookId) {
        await queryInterface.addColumn('users', 'facebookId', {
          type: Sequelize.STRING(255),
          allowNull: true,
          unique: true
        }, { transaction });
      }

      if (!tableDescription.linkedinId) {
        await queryInterface.addColumn('users', 'linkedinId', {
          type: Sequelize.STRING(255),
          allowNull: true,
          unique: true
        }, { transaction });
      }

      if (!tableDescription.twitterId) {
        await queryInterface.addColumn('users', 'twitterId', {
          type: Sequelize.STRING(255),
          allowNull: true,
          unique: true
        }, { transaction });
      }

      if (!tableDescription.instagramId) {
        await queryInterface.addColumn('users', 'instagramId', {
          type: Sequelize.STRING(255),
          allowNull: true,
          unique: true
        }, { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const tableDescription = await queryInterface.describeTable('users');
      
      if (tableDescription.googleId) {
        await queryInterface.removeColumn('users', 'googleId', { transaction });
      }
      if (tableDescription.facebookId) {
        await queryInterface.removeColumn('users', 'facebookId', { transaction });
      }
      if (tableDescription.linkedinId) {
        await queryInterface.removeColumn('users', 'linkedinId', { transaction });
      }
      if (tableDescription.twitterId) {
        await queryInterface.removeColumn('users', 'twitterId', { transaction });
      }
      if (tableDescription.instagramId) {
        await queryInterface.removeColumn('users', 'instagramId', { transaction });
      }
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
