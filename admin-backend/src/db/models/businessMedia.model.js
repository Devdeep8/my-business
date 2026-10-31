// src/db/models/businessMedia.model.js
export default (sequelize, DataTypes) => {
  const BusinessMedia = sequelize.define('BusinessMedia', {
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
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    altText: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    kind: {
      type: DataTypes.ENUM('logo', 'cover', 'photo', 'video'),
      allowNull: false,
      defaultValue: 'photo'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'business_media',
    underscored: true,
    timestamps: true
  });

  BusinessMedia.associate = (models) => {
    BusinessMedia.belongsTo(models.Business, { foreignKey: 'businessId', as: 'business' });
  };

  return BusinessMedia;
};
