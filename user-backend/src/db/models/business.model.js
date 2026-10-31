// src/db/models/business.model.js
// Category-specific answers live in the `attributes` JSONB keyed by field
// definition key (validated server-side against the form version), so admins
// can add fields without schema changes. Common filterable fields (city,
// category) stay as real columns for indexed queries.
export default (sequelize, DataTypes) => {
  const Business = sequelize.define('Business', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
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
    ownerUserId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    primaryCategoryId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(1500),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(13),
      allowNull: false,
      validate: {
        is: /^\+91[0-9]{10}$/
      }
    },
    whatsapp: {
      type: DataTypes.STRING(13),
      allowNull: true,
      validate: {
        is: /^\+91[0-9]{10}$/
      }
    },
    websiteUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    address: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    serviceArea: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    hours: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    openingDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending_review', 'published', 'rejected'),
      allowNull: false,
      defaultValue: 'draft'
    },
    verificationStatus: {
      type: DataTypes.ENUM('unverified', 'pending', 'verified'),
      allowNull: false,
      defaultValue: 'unverified'
    },
    completenessScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    },
    formVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    attributes: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    rejectionReason: {
      type: DataTypes.STRING(1000),
      allowNull: true
    }
  }, {
    tableName: 'businesses',
    underscored: true,
    timestamps: true
  });

  Business.associate = (models) => {
    Business.belongsTo(models.User, { foreignKey: 'ownerUserId', as: 'owner' });
    Business.belongsTo(models.Category, { foreignKey: 'primaryCategoryId', as: 'primaryCategory' });
    Business.belongsToMany(models.Category, {
      through: 'business_categories',
      foreignKey: 'businessId',
      otherKey: 'categoryId',
      as: 'secondaryCategories'
    });
    Business.hasMany(models.BusinessLink, { foreignKey: 'businessId', as: 'links' });
    Business.hasMany(models.BusinessMedia, { foreignKey: 'businessId', as: 'media' });
  };

  return Business;
};
