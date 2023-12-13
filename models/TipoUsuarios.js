const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");

const TipoUsuario = sequelize.define(
  "TipoUsuario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipo_usuario: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "tipo_usuarios",
  }
);

module.exports = TipoUsuario;
