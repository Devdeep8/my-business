'use strict';

// Immutable snapshots of a category's resolved form (universal + inherited +
// own fields). Businesses reference the version they onboarded with, so admin
// form edits never invalidate existing profiles.
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('field_definition_versions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      definition: {
        type: Sequelize.JSONB,
        allowNull: false
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

    await queryInterface.addIndex('field_definition_versions', ['category_id', 'version'], { unique: true });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('field_definition_versions');
  }
};
