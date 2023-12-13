const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const Medico = require("./Medicos");

const Consultorio = sequelize.define(
  "Consultorio",
  {
    consultorio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    disponible: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[0, 1]],
      },
    },
  },
  {
    timestamps: false,
    tableName: "consultorios",
  }
);

Medico.hasOne(Consultorio, {
  foreignKey: "consultorio",
  sourceKey: "consultorio",
  targetKey: "consultorio",
});

module.exports = Consultorio;
