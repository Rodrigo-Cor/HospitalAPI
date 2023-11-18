const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const TipoUsuario = require("./TipoUsuarios");

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
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "Usuarios",
  }
);

Usuario.hasOne(TipoUsuario, {
  foreignKey: "tipo_usuario",
  sourceKey: "tipo_usuario",
  targetKey: "tipo_usuario",
});

module.exports = Usuario;
