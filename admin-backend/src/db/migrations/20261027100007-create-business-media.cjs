'use strict';

// Business photos/videos (logo, cover, gallery). Files are uploaded via the
// existing /uploads/images endpoint; only URLs are stored here.
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('business_media', {
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
      url: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      alt_text: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      kind: {
        type: Sequelize.ENUM('logo', 'cover', 'photo', 'video'),
        allowNull: false,
        defaultValue: 'photo'
      },
      sort_order: {
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

    await queryInterface.addIndex('business_media', ['business_id', 'sort_order']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('business_media');
  }
};
