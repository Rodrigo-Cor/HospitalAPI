const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");

const Medico = sequelize.define(
  "Medicos",
  {
    no_empleado: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "Usuarios",
        key: "correo",
      },
    },
    especialidad: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "Especialidad",
        key: "especialidad",
      },
    },
    consultorio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Consultorio",
        key: "consultorio",
      },
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "Medicos",
  }
);


module.exports = Medico;
