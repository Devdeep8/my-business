// src/db/models/category.model.js
export default (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name_en: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    name_hi: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        is: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
      }
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    isLeaf: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'categories',
    underscored: true,
    timestamps: true
  });

  Category.associate = (models) => {
    Category.belongsTo(models.Category, { foreignKey: 'parentId', as: 'parent' });
    Category.hasMany(models.Category, { foreignKey: 'parentId', as: 'children' });
    Category.hasMany(models.FieldDefinition, { foreignKey: 'categoryId', as: 'fieldDefinitions' });
    Category.hasMany(models.Business, { foreignKey: 'primaryCategoryId', as: 'businesses' });
    Category.belongsToMany(models.Business, {
      through: 'business_categories',
      foreignKey: 'categoryId',
      otherKey: 'businessId',
      as: 'secondaryBusinesses'
    });
  };

  return Category;
};
