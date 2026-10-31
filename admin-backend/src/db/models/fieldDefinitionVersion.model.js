// src/db/models/fieldDefinitionVersion.model.js
// Immutable snapshot of a category's resolved form (universal + inherited +
// own fields) taken when an admin publishes. Businesses fill the version that
// existed when they onboarded, so form changes never break existing profiles;
// new required fields surface as "complete your profile" prompts instead.
export default (sequelize, DataTypes) => {
  const FieldDefinitionVersion = sequelize.define('FieldDefinitionVersion', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    definition: {
      type: DataTypes.JSONB,
      allowNull: false
    }
  }, {
    tableName: 'field_definition_versions',
    underscored: true,
    timestamps: true,
    indexes: [
      { unique: true, fields: ['categoryId', 'version'] }
    ]
  });

  FieldDefinitionVersion.associate = (models) => {
    FieldDefinitionVersion.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
  };

  return FieldDefinitionVersion;
};
