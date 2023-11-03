const { DataTypes } = require("sequelize");
const Usuario = require("./Usuarios");
const sequelize = require("../utils/database.util");

const Paciente = sequelize.define(
  "Pacientes",
  {
    nss: {
      type: DataTypes.STRING(11),
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
    telefono: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    metodo_pago: {
      type: DataTypes.STRING(16),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "Pacientes",
  }
);

Paciente.hasOne(Usuario, {
  foreignKey: "correo",
  sourceKey: "correo",
});


module.exports = Paciente;
