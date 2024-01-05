const { DataTypes } = require("sequelize");
const RecetaTratamiento = require("./RecetasTratamientos");
const RecetaMedicamento = require("./RecetasMedicamentos");
const RecetaServicio = require("./RecetasServicios");
const Cita = require("./Citas");
const sequelize = require("../utils/database.util");
const {
  getServerUser,
  hookInsertDeleteAfter,
  getPreviousCurrentValues,
} = require("../utils/hooks.util");

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
    hooks: {
      afterCreate: async (recipe, options) => {
        const id_receta = recipe.dataValues["id","diagnostico"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: id_receta,
          type: "INSERT",
          user,
          server,
          table: "recetas",
        });
      },
      afterUpdate: async (recipe, options) => {
        const { user, server } = await getServerUser();
        const { previousValues, currentValues } = getPreviousCurrentValues({
          table: recipe,
        });

        for (const [field, previousValue] of Object.entries(previousValues)) {
          let newValue = currentValues[field];

          if (previousValue !== newValue) {
            await Bitacora.create({
              tabla: "recetas",
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
      afterDestroy: async (recipe, options) => {
        const id_receta = recipe.dataValues["id"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: id_receta,
          type: "DELETE",
          user,
          server,
          table: "recetas",
        });
      },
    },
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
