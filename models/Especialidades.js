const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const Medico = require("./Medicos");
const Especialidad = sequelize.define(
  "Especialidad",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    especialidad: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "Especialidades",
  }
);

Medico.hasOne(Especialidad, {
  foreignKey: "id",
  sourceKey: "especialidad",
  targetKey: "especialidad",
});

Especialidad.belongsTo(Medico, {
  foreignKey: "id",
  sourceKey: "id",
  targetKey: "especialidad",
});


module.exports = Especialidad;
