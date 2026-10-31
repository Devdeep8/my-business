'use strict';

// Admin-managed form field definitions. A null category_id makes the field
// universal (every business form includes it); otherwise it applies to that
// category and is inherited by its children. The unique composite index
// enforces one definition per key per scope — overriding a parent's key
// replaces it for the child.
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('field_definitions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      key: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      label_en: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      label_hi: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM(
          'text', 'number', 'select', 'multi_select', 'boolean',
          'time_range', 'address', 'phone', 'url', 'image', 'repeater'
        ),
        allowNull: false
      },
      options: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      validation: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      help_text_en: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      help_text_hi: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      display_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      show_on_profile: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      visible_if: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    await queryInterface.addIndex('field_definitions', ['category_id', 'key'], { unique: true });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('field_definitions');
  }
};
