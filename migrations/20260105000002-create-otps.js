'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('otps', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      otp: {
        type: Sequelize.STRING(6),
        allowNull: false
      },
      purpose: {
        type: Sequelize.ENUM('signup', 'login', 'reset-password'),
        allowNull: false
      },
      "expiresAt": {
        type: Sequelize.DATE,
        allowNull: false
      },
      "isUsed": {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      "createdAt": {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('otps', ['email', 'purpose'], {
      name: 'otps_email_purpose_index'
    });
    
    await queryInterface.addIndex('otps', ['expiresAt'], {
      name: 'otps_expiresAt_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('otps');
  }
};
