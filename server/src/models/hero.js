module.exports = function(sequelize, DataTypes) {
  const Hero = sequelize.define('heroes', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    equipment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    heroId: {
      type: DataTypes.STRING,
      allowNull: false,
      get: function () {
        return parseInt(this.getDataValue('heroId'));
      }
    },
    hero_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hero_tittle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imgUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    job: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    level: {
      type: DataTypes.TEXT,
      allowNull: false,
      set(value) {
        this.setDataValue('level', JSON.stringify(value))
      },
      get() {
        return JSON.parse(this.getDataValue('level'));
      }
    },
    otherjob: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    otherrace: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    partner: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.STRING,
      allowNull: false,
      get: function(value) {
        return parseInt(this.getDataValue('price'));
      }
    },
    race: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    season_id: {
      type: DataTypes.STRING,
      allowNull: false,
      get: function(value) {
        return parseInt(this.getDataValue('season_id'));
      }
    },
    skill_introduce: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    skill_name: {
      type: DataTypes.STRING,
      allowNull: false,
      get: function(value) {
        return parseInt(this.getDataValue('skill_name'));
      }
    },
    skill_num: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    skill_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    special_desc: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    special_heroid: {
      type: DataTypes.STRING,
      allowNull: false,
      get: function(value) {
        return parseInt(this.getDataValue('special_heroid'));
      }
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  });
  return Hero;
};