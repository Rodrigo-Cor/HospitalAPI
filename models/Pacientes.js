const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const Usuario = require("./Usuarios");
const {
  getServerUser,
  hookInsertDeleteAfter,
  getPreviousCurrentValues,
} = require("../utils/hooks.util");

const Paciente = sequelize.define(
  "Pacientes",
  {
    nss: {
      type: DataTypes.STRING(11),
      primaryKey: true,
    },
    correo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "Usuarios",
        key: "correo",
      },
    },
    telefono: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    metodo_pago: {
      type: DataTypes.STRING(16),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "pacientes",
    hooks: {
      afterCreate: async (patient, options) => {
        const nss = patient.dataValues["nss"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: nss,
          type: "INSERT",
          user,
          server,
          table: "Pacientes",
        });
      },
      afterUpdate: async (patient, options) => {
        const { user, server } = await getServerUser();
        const { previousValues, currentValues } = getPreviousCurrentValues({
          table: patient,
        });

        for (const [field, previousValue] of Object.entries(previousValues)) {
          let newValue = currentValues[field];

          if (previousValue !== newValue) {
            await Bitacora.create({
              tabla: "Pacientes",
              operacion: "UPDATE",
              campo: field,
              valor: previousValue,
              valor_nuevo: newValue,
              usuario: user,
              servidor: server,
              PK: currentValues["nss"],
            });
          }
        }
      },
      afterDestroy: async (patient, options) => {
        const nss = patient.dataValues["nss"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: nss,
          type: "DELETE",
          user,
          server,
          table: "Pacientes",
        });
      },
    },
  }
);

Paciente.hasOne(Usuario, {
  foreignKey: "correo",
  sourceKey: "correo",
  targetKey: "correo",
});

module.exports = Paciente;
