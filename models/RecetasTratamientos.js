const { DataTypes } = require("sequelize");
const Tratamiento = require("./Tratamientos");
const sequelize = require("../utils/database.util");
const {
  getServerUser,
  hookInsertDeleteAfter,
  getPreviousCurrentValues,
} = require("../utils/hooks.util");
const Bitacora = require("./Bitacoras");


const RecetaTratamiento = sequelize.define(
  "RecetaTratamiento",
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
    id_tratamiento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Tratamientos",
        key: "id",
      },
    },
    duracion: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "recetas_tratamientos",
    hooks: {
      afterCreate: async (recipe_treatment, options) => {
        const id_recetaTratamiento = recipe_treatment.dataValues["id"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: id_recetaTratamiento,
          type: "INSERT",
          user,
          server,
          table: "recetas_tratamientos",
        });
      },
      afterUpdate: async (recipe_treatment, options) => {
        const { user, server } = await getServerUser();
        const { previousValues, currentValues } = getPreviousCurrentValues({
          table: recipe_treatment,
        });

        for (const [field, previousValue] of Object.entries(previousValues)) {
          let newValue = currentValues[field];

          if (previousValue !== newValue) {
            await Bitacora.create({
              tabla: "recetas_tratamientos",
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
      afterDestroy: async (recipe_treatment, options) => {
        const id_recetaTratamiento = recipe_treatment.dataValues["id"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: id_recetaTratamiento,
          type: "DELETE",
          user,
          server,
          table: "recetas_tratamientos",
        });
      },
    },
  }
);

RecetaTratamiento.hasOne(Tratamiento, {
  foreignKey: "id",
  sourceKey: "id_tratamiento",
  targetKey: "id",
});

module.exports = RecetaTratamiento;
