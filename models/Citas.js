const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const Paciente = require("./Pacientes");
const {
  getServerUser,
  hookInsertDeleteAfter,
  getPreviousCurrentValues,
} = require("../utils/hooks.util");

const Cita = sequelize.define(
  "Cita",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_horario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "HorarioConsultorio",
        key: "id",
      },
    },
    nss: {
      type: DataTypes.STRING(11),
      allowNull: false,
      references: {
        model: "Paciente",
        key: "nss",
      },
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Status",
        key: "id",
      },
    },
  },
  {
    timestamps: false,
    tableName: "citas",
    hooks: {
      afterCreate: async (cita, options) => {
        const id_cita = cita.dataValues["id"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: id_cita,
          type: "INSERT",
          user,
          server,
          table: "citas",
        });
      },
      afterUpdate: async (cita, options) => {
        const { user, server } = await getServerUser();
        const { previousValues, currentValues } = getPreviousCurrentValues({
          table: cita,
        });

        for (const [field, previousValue] of Object.entries(previousValues)) {
          let newValue = currentValues[field];

          if (previousValue !== newValue) {
            await Bitacora.create({
              tabla: "citas",
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
      afterDestroy: async (cita, options) => {
        const id_cita = cita.dataValues["id"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: id_cita,
          type: "DELETE",
          user,
          server,
          table: "citas",
        });
      },
    },
  }
);

Paciente.hasMany(Cita, {
  foreignKey: "nss",
  sourceKey: "nss",
  targetKey: "nss",
});

Cita.belongsTo(Paciente, {
  foreignKey: "nss",
  sourceKey: "nss",
  targetKey: "nss",
});

module.exports = Cita;
