const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");

const TipoUsuario = sequelize.define(
  "TipoUsuarios",
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
    tableName: "TipoUsuarios",
  }
);

/*
Cita.hasOne(Status, {
  foreignKey: "id", // PK de la tabla que hereda la PK
  sourceKey: "status", // FK de la tabla que tiene FK
  targetKey: "status", /// FK de la tabla que tiene FK
});

Status.belongsTo(Cita, {
  foreignKey: "id", // PK de la tabla que hereda la PK
  sourceKey: "id", //  PK de la tabla que hereda la PK
  targetKey: "status", // FK de la tabla que tiene FK
});
*/

module.exports = TipoUsuario;
