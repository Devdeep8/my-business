'use strict';

// Secondary categories join table (primary lives on businesses.primary_category_id).
// MVP limit of 5 secondary categories is enforced at the API layer.
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('business_categories', {
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
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('business_categories', ['business_id', 'category_id'], { unique: true });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('business_categories');
  }
};
