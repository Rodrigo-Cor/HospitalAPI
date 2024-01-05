const { DataTypes } = require("sequelize");
const Servicio = require("./Servicios");
const sequelize = require("../utils/database.util");
const {
  getServerUser,
  hookInsertDeleteAfter,
  getPreviousCurrentValues,
} = require("../utils/hooks.util");


const RecetaServicio = sequelize.define(
  "RecetaServicio",
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
    id_servicio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Servicios",
        key: "id",
      },
    },
    cantidad_servicios: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "recetas_servicios",
    hooks: {
      afterCreate: async (recipe_service, options) => {
        const id_recetaServicio = recipe_service.dataValues["id"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: id_recetaServicio,
          type: "INSERT",
          user,
          server,
          table: "recetas_servicios",
        });
      },
      afterUpdate: async (recipe_service, options) => {
        const { user, server } = await getServerUser();
        const { previousValues, currentValues } = getPreviousCurrentValues({
          table: recipe_service,
        });

        for (const [field, previousValue] of Object.entries(previousValues)) {
          let newValue = currentValues[field];

          if (previousValue !== newValue) {
            await Bitacora.create({
              tabla: "recetas_servicios",
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
      afterDestroy: async (recipe_service, options) => {
        const id_recetaServicio = recipe_service.dataValues["id"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: id_recetaServicio,
          type: "DELETE",
          user,
          server,
          table: "recetas_servicios",
        });
      },
    },
  }
);

RecetaServicio.hasOne(Servicio, {
  foreignKey: "id",
  sourceKey: "id_servicio",
  targetKey: "id",
});

module.exports = RecetaServicio;
