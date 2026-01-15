'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Get existing columns
      const tableDescription = await queryInterface.describeTable('Users');
      
      // Add OAuth provider ID columns only if they don't exist
      if (!tableDescription.googleId) {
        await queryInterface.addColumn('Users', 'googleId', {
          type: Sequelize.STRING(255),
          allowNull: true,
          unique: true
        }, { transaction });
      }

      if (!tableDescription.facebookId) {
        await queryInterface.addColumn('Users', 'facebookId', {
          type: Sequelize.STRING(255),
          allowNull: true,
          unique: true
        }, { transaction });
      }

      if (!tableDescription.linkedinId) {
        await queryInterface.addColumn('Users', 'linkedinId', {
          type: Sequelize.STRING(255),
          allowNull: true,
          unique: true
        }, { transaction });
      }

      if (!tableDescription.twitterId) {
        await queryInterface.addColumn('Users', 'twitterId', {
          type: Sequelize.STRING(255),
          allowNull: true,
          unique: true
        }, { transaction });
      }

      if (!tableDescription.instagramId) {
        await queryInterface.addColumn('Users', 'instagramId', {
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
      const tableDescription = await queryInterface.describeTable('Users');
      
      if (tableDescription.googleId) {
        await queryInterface.removeColumn('Users', 'googleId', { transaction });
      }
      if (tableDescription.facebookId) {
        await queryInterface.removeColumn('Users', 'facebookId', { transaction });
      }
      if (tableDescription.linkedinId) {
        await queryInterface.removeColumn('Users', 'linkedinId', { transaction });
      }
      if (tableDescription.twitterId) {
        await queryInterface.removeColumn('Users', 'twitterId', { transaction });
      }
      if (tableDescription.instagramId) {
        await queryInterface.removeColumn('Users', 'instagramId', { transaction });
      }
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
