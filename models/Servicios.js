const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");

const Servicio = sequelize.define(
  "Servicio",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    costo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "servicios",
  }
);

module.exports = Servicio;
