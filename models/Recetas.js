const { DataTypes } = require("sequelize");
const Cita = require("./Citas");
const sequelize = require("../utils/database.util");

const Receta = sequelize.define(
  "Recetas",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_cita: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Citas",
        key: "id",
      },
    },
  },
  {
    timestamps: false,
    tableName: "Recetas",
  }
);

Receta.hasOne(Cita, {
  foreignKey: "id",
  sourceKey: "id_cita",
});

module.exports = Paciente;