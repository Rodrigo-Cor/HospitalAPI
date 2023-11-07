const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");

const Status = sequelize.define(
  "Status",
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
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "Status",
  }
);

module.exports = Status;
