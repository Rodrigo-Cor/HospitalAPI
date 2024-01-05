const { DataTypes } = require("sequelize");
const Medicamento = require("./Medicamentos");
const sequelize = require("../utils/database.util");
const {
  getServerUser,
  hookInsertDeleteAfter,
  getPreviousCurrentValues,
} = require("../utils/hooks.util");

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
    hooks: {
      afterCreate: async (recipe_medicine, options) => {
        const id_recetaMedicamento = recipe_medicine.dataValues["id"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: id_recetaMedicamento,
          type: "INSERT",
          user,
          server,
          table: "recetas_medicamentos",
        });
      },
      afterUpdate: async (recipe_medicine, options) => {
        const { user, server } = await getServerUser();
        const { previousValues, currentValues } = getPreviousCurrentValues({
          table: recipe_medicine,
        });

        for (const [field, previousValue] of Object.entries(previousValues)) {
          let newValue = currentValues[field];

          if (previousValue !== newValue) {
            await Bitacora.create({
              tabla: "recetas_medicamentos",
              operacion: "UPDATE",
              campo: field,
              valor: previousValue,
              valor_nuevo: newValue,
              usuario: user,
              servidor: server,
              PK: currentValues["id"],
            });
          }
        }
      },
      afterDestroy: async (recipe_medicine, options) => {
        const id_recetaMedicamento = recipe_medicine.dataValues["id"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: id_recetaMedicamento,
          type: "DELETE",
          user,
          server,
          table: "recetas_medicamentos",
        });
      },
    },
  }
);

RecetaMedicamento.hasOne(Medicamento, {
  foreignKey: "id",
  sourceKey: "id_medicamento",
  targetKey: "id",
});

module.exports = RecetaMedicamento;
