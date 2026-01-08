'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('streak_history', {
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
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      "streakCount": {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      "xpEarned": {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      "actionType": {
        type: Sequelize.ENUM('login', 'investment', 'learning', 'quiz', 'challenge'),
        allowNull: false
      },
      "createdAt": {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('streak_history', ['userId', 'date'], {
      name: 'streak_history_userId_date_index'
    });
    
    await queryInterface.addIndex('streak_history', ['userId'], {
      name: 'streak_history_userId_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('streak_history');
  }
};
