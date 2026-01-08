'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      "firstName": {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      "lastName": {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      "phoneNumber": {
        type: Sequelize.STRING(15),
        allowNull: true,
        unique: true
      },
      "isEmailVerified": {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      "isPhoneVerified": {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      "googleId": {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      },
      "facebookId": {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      },
      "linkedinId": {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      },
      "twitterId": {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      },
      "profilePicture": {
        type: Sequelize.TEXT,
        allowNull: true
      },
      "dateOfBirth": {
        type: Sequelize.DATE,
        allowNull: true
      },
      "kycStatus": {
        type: Sequelize.ENUM('pending', 'submitted', 'verified', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
      },
      "riskProfile": {
        type: Sequelize.ENUM('conservative', 'moderate', 'aggressive'),
        allowNull: true
      },
      "currentStreak": {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      "longestStreak": {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      "lastLoginDate": {
        type: Sequelize.DATE,
        allowNull: true
      },
      "totalXP": {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      level: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      "streakFreezeCount": {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      "isActive": {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      "createdAt": {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      "updatedAt": {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('users', ['email'], {
      name: 'users_email_index'
    });
    
    await queryInterface.addIndex('users', ['googleId'], {
      name: 'users_googleId_index'
    });
    
    await queryInterface.addIndex('users', ['facebookId'], {
      name: 'users_facebookId_index'
    });
    
    await queryInterface.addIndex('users', ['linkedinId'], {
      name: 'users_linkedinId_index'
    });
    
    await queryInterface.addIndex('users', ['twitterId'], {
      name: 'users_twitterId_index'
    });
    
    await queryInterface.addIndex('users', ['phoneNumber'], {
      name: 'users_phoneNumber_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
