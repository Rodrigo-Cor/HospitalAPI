const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");

const Usuario = sequelize.define(
  "Usuarios",
  {
    correo: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    tipo_usuario: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "TipoUsuarios",
        key: "tipo_usuario",
      },
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    ap_paterno: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    ap_materno: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(256),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "Usuarios",
  }
);

module.exports = Usuario;
