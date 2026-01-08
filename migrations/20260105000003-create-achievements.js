'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('achievements', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      "userId": {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      "achievementType": {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      "achievementName": {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      "badgeIcon": {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      "xpReward": {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      "unlockedAt": {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      },
      "createdAt": {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('achievements', ['userId'], {
      name: 'achievements_userId_index'
    });
    
    await queryInterface.addIndex('achievements', ['achievementType'], {
      name: 'achievements_achievementType_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('achievements');
  }
};
