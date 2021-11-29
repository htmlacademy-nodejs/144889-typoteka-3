"use strict";

const {DataTypes, Model} = require(`sequelize`);

class Article extends Model {}

const define = (sequelize) => Article.init({
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  announce: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fullText: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
}, {
  sequelize,
  modelName: `Article`,
  tableName: `articles`
});

module.exports = define;
