const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");

const Recepcionista = sequelize.define(
  "Recepcionistas",
  {
    no_empleado: {
      type: DataTypes.STRING(15),
      primaryKey: true,
    },
    correo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "Usuarios",
        key: "correo",
      },
    },
  },
  {
    timestamps: false,
    tableName: "Recepcionistas",
  }
);

module.exports = Recepcionista;
