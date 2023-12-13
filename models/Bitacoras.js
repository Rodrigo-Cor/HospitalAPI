const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");

const Bitacora = sequelize.define(
  "Bitacora",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tabla: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    operacion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    campo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    valor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    valor_nuevo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    usuario: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    servidor: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    PK: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "bitacoras",
  }
);

module.exports = Bitacora;
