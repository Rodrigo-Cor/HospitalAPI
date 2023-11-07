const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");

const Tratamiento = sequelize.define(
  "Tratamientos",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    descripcion: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "Tratamientos",
  }
);

module.exports = Tratamiento;