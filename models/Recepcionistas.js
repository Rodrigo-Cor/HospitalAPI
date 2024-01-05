const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const Usuario = require("./Usuarios");
const {
  getServerUser,
  hookInsertDeleteAfter,
  getPreviousCurrentValues,
} = require("../utils/hooks.util");
const Bitacora = require("./Bitacoras");

const Recepcionista = sequelize.define(
  "Recepcionista",
  {
    no_empleado: {
      type: DataTypes.STRING(15),
      primaryKey: true,
    },
    correo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "Usuario",
        key: "correo",
      },
    },
  },
  {
    timestamps: false,
    tableName: "recepcionistas",
    hooks: {
      afterCreate: async (recepcionist, options) => {
        const no_empleado = recepcionist.dataValues["no_empleado"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: no_empleado,
          type: "INSERT",
          user,
          server,
          table: "recepcionistas",
        });
      },
      afterUpdate: async (recepcionist, options) => {
        const { user, server } = await getServerUser();
        const { previousValues, currentValues } = getPreviousCurrentValues({
          table: recepcionist,
        });

        for (const [field, previousValue] of Object.entries(previousValues)) {
          let newValue = currentValues[field];

          if (previousValue !== newValue) {
            await Bitacora.create({
              tabla: "recepcionistas",
              operacion: "UPDATE",
              campo: field,
              valor: previousValue,
              valor_nuevo: newValue,
              usuario: user,
              servidor: server,
              PK: currentValues["no_empleado"],
            });
          }
        }
      },
      afterDestroy: async (recepcionist, options) => {
        const no_empleado = recepcionist.dataValues["no_empleado"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: no_empleado,
          type: "DELETE",
          user,
          server,
          table: "recepcionistas",
        });
      },
    },
  }
);

Recepcionista.hasOne(Usuario, {
  foreignKey: "correo",
  sourceKey: "correo",
  targetKey: "correo",
});

module.exports = Recepcionista;
