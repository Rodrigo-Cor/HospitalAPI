const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const Usuario = require("./Usuarios");

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
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Especialidad",
        key: "id",
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

Medico.hasOne(Usuario, {
  foreignKey: "correo",
  sourceKey: "correo",
  targetKey: "correo",
});

module.exports = Medico;
