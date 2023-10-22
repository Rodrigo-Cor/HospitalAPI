const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");

const Consultorio = sequelize.define(
  "Consultorios",
  {
    consultorio: {
      type: DataTypes.NUMBER,
      primaryKey: true,
      autoIncrement: true,
    },
    disponible: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isIn: {
          args: [[0, 1]],
        },
      },
    },
  },
  {
    timestamps: false,
    tableName: "Consultorios",
  }
);

module.exports = Consultorio;
