'use strict';

// Linktree-style ordered links shown on the public profile page.
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('business_links', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      business_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM(
          'website', 'whatsapp', 'instagram', 'facebook', 'youtube',
          'booking', 'menu', 'map', 'custom'
        ),
        allowNull: false
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      display_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('business_links', ['business_id', 'display_order']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('business_links');
  }
};
