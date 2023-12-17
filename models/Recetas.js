const { DataTypes } = require("sequelize");
const RecetaTratamiento = require("./RecetasTratamientos");
const RecetaMedicamento = require("./RecetasMedicamentos");
const RecetaServicio = require("./RecetasServicios");
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
        model: "Cita",
        key: "id",
      },
    },
    diagnostico: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "recetas",
  }
);

Cita.hasOne(Receta, {
  foreignKey: "id_cita",
  sourceKey: "id",
  targetKey: "id",
});


Receta.hasMany(RecetaMedicamento, {
  foreignKey: "id_medicamento",
  sourceKey: "id",
  targetKey: "id",
});

Receta.hasMany(RecetaTratamiento, {
  foreignKey: "id_tratamiento",
  sourceKey: "id",
  targetKey: "id",
});

Receta.hasMany(RecetaServicio, {
  foreignKey: "id_servicio",
  sourceKey: "id",
  targetKey: "id",
});

module.exports = Receta;
