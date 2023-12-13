const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const Usuario = require("./Usuarios");

const Recepcionista = sequelize.define(
  "Recepcionista",
  {
    no_empleado: {
      type: DataTypes.STRING(15),
      primaryKey: true,
    },
    correo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "Usuario",
        key: "correo",
      },
    },
  },
  {
    timestamps: false,
    tableName: "recepcionistas",
  }
);

Recepcionista.hasOne(Usuario, {
  foreignKey: "correo",
  sourceKey: "correo",
  targetKey: "correo",
});

module.exports = Recepcionista;
