const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const Cita = require("./Citas");

const Status = sequelize.define(
  "Status",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "status",
  }
);

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


module.exports = Status;
