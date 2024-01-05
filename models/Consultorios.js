const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const Medico = require("./Medicos");
const {
  getServerUser,
  hookInsertDeleteAfter,
  getPreviousCurrentValues,
} = require("../utils/hooks.util");

const Consultorio = sequelize.define(
  "Consultorio",
  {
    consultorio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    disponible: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[0, 1]],
      },
    },
  },
  {
    timestamps: false,
    tableName: "consultorios",
    hooks: {
      afterCreate: async (consultory, options) => {
        const consultorio = consultory.dataValues["consultorio"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: consultorio,
          type: "INSERT",
          user,
          server,
          table: "consultorios",
        });
      },
      afterUpdate: async (consultory, options) => {
        const { user, server } = await getServerUser();
        const { previousValues, currentValues } = getPreviousCurrentValues({
          table: consultory,
        });

        for (const [field, previousValue] of Object.entries(previousValues)) {
          let newValue = currentValues[field];

          if (previousValue !== newValue) {
            await Bitacora.create({
              tabla: "consultorios",
              operacion: "UPDATE",
              campo: field,
              valor: previousValue,
              valor_nuevo: newValue,
              usuario: user,
              servidor: server,
              PK: currentValues["consultorio"],
            });
          }
        }
      },
      afterDestroy: async (consultory, options) => {
        const consultorio = consultory.dataValues["consultorio"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: consultorio,
          type: "DELETE",
          user,
          server,
          table: "consultorios",
        });
      },
    },
  }
);

Medico.hasOne(Consultorio, {
  foreignKey: "consultorio",
  sourceKey: "consultorio",
  targetKey: "consultorio",
});

module.exports = Consultorio;
