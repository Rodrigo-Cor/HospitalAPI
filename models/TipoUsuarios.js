const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");

const TipoUsuario = sequelize.define(
    "TipoUsuarios",
    {
      tipo_usuario: {
        type: DataTypes.STRING(50),
        primaryKey: true,
      },
    },
    {
      timestamps: false,
      tableName: "TipoUsuarios",
    }
  );
  
  module.exports = TipoUsuario;

  