// src/db/models/fieldDefinition.model.js
// Field definitions are admin-managed, never hardcoded: they drive the
// category-specific onboarding form and the public profile page. A null
// categoryId means the field is universal (applies to every category).
export default (sequelize, DataTypes) => {
  const FieldDefinition = sequelize.define('FieldDefinition', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        is: /^[a-z][a-z0-9_]*$/
      }
    },
    label_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    label_hi: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    type: {
      type: DataTypes.ENUM(
        'text', 'number', 'select', 'multi_select', 'boolean',
        'time_range', 'address', 'phone', 'url', 'image', 'repeater'
      ),
      allowNull: false
    },
    options: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    validation: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    helpText_en: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    helpText_hi: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    showOnProfile: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    // Conditional logic: show this field only when these conditions match,
    // e.g. { field: 'has_menu', equals: true }
    visibleIf: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'field_definitions',
    underscored: true,
    timestamps: true,
    indexes: [
      // One definition per key per category scope
      { unique: true, fields: ['categoryId', 'key'] }
    ]
  });

  FieldDefinition.associate = (models) => {
    FieldDefinition.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
  };

  return FieldDefinition;
};
