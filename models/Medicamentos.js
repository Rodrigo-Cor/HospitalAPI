const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");

const Medicamento = sequelize.define(
  "Medicamentos",
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
    cantidad_stock: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "Medicamentos",
  }
);

module.exports = Medicamento;
