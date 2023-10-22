const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");

const Paciente = sequelize.define(
  "Pacientes",
  {
    nss: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      len: [0, 11],
    },
    correo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "Usuarios",
        key: "correo",
      },
    },
    telefono: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "Pacientes",
  }
);

module.exports = Paciente;
