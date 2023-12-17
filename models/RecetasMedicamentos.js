const { DataTypes } = require("sequelize");
const Medicamento = require("./Medicamentos");
const sequelize = require("../utils/database.util");

const RecetaMedicamento = sequelize.define(
  "RecetaMedicamento",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_receta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Recetas",
        key: "id",
      },
    },
    id_medicamento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Medicamentos",
        key: "id",
      },
    },
    cantidad_medicamento: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "recetas_medicamentos",
  }
);

RecetaMedicamento.hasOne(Medicamento, {
  foreignKey: "id",
  sourceKey: "id_medicamento",
  targetKey: "id",
});

module.exports = RecetaMedicamento;
