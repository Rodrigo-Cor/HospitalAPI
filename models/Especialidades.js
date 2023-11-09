const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const Medico = require("./Medicos");
const Especialidad = sequelize.define(
  "Especialidades",
  {
    especialidad: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
  },
  {
    timestamps: false,
    tableName: "Especialidades",
  }
);

Medico.hasOne(Especialidad, {
  foreignKey: "especialidad",
  sourceKey: "especialidad",
  targetKey: "especialidad",
});

Especialidad.belongsTo(Medico, {
  foreignKey: "especialidad",
  sourceKey: "especialidad",
  targetKey: "especialidad",
});

module.exports = Especialidad;
