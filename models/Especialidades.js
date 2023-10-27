const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const Especialidad = sequelize.define(
  "Especialidades",
  {
    especialidad: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
  },
  {
    timestamps: false,
    tableName: "Especialidades",
  }
);

module.exports = Especialidad;
