'use strict';

// Businesses: base columns every business has regardless of category; the
// category-specific answers live in the attributes JSONB keyed by field
// definition key. GIN index on attributes for future filtering/search.
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('businesses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      owner_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      primary_category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      description: {
        type: Sequelize.STRING(1500),
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING(13),
        allowNull: false
      },
      whatsapp: {
        type: Sequelize.STRING(13),
        allowNull: true
      },
      website_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      address: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      service_area: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      hours: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      opening_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'pending_review', 'published', 'rejected'),
        allowNull: false,
        defaultValue: 'draft'
      },
      verification_status: {
        type: Sequelize.ENUM('unverified', 'pending', 'verified'),
        allowNull: false,
        defaultValue: 'unverified'
      },
      completeness_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      form_version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      attributes: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      rejection_reason: {
        type: Sequelize.STRING(1000),
        allowNull: true
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

    await queryInterface.addIndex('businesses', ['owner_user_id']);
    await queryInterface.addIndex('businesses', ['primary_category_id']);
    await queryInterface.addIndex('businesses', ['status']);
    await queryInterface.addIndex('businesses', ['attributes'], { using: 'gin' });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('businesses');
  }
};
