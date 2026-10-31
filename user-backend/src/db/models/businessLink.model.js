// src/db/models/businessLink.model.js
// Linktree side of the profile: ordered links shown on the public page.
export default (sequelize, DataTypes) => {
  const BusinessLink = sequelize.define('BusinessLink', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    businessId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(
        'website', 'whatsapp', 'instagram', 'facebook', 'youtube',
        'booking', 'menu', 'map', 'custom'
      ),
      allowNull: false
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'business_links',
    underscored: true,
    timestamps: true
  });

  BusinessLink.associate = (models) => {
    BusinessLink.belongsTo(models.Business, { foreignKey: 'businessId', as: 'business' });
  };

  return BusinessLink;
};
