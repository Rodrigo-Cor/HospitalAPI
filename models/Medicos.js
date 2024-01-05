const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const Usuario = require("./Usuarios");
const HorarioConsultorio = require("./HorariosConsultorios");
const {
  getServerUser,
  hookInsertDeleteAfter,
  getPreviousCurrentValues,
} = require("../utils/hooks.util");

const Medico = sequelize.define(
  "Medico",
  {
    no_empleado: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "Usuario",
        key: "correo",
      },
    },
    especialidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Especialidad",
        key: "id",
      },
    },
    consultorio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Consultorio",
        key: "consultorio",
      },
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "medicos",
    hooks: {
      afterCreate: async (doctor, options) => {
        const no_empleado = doctor.dataValues["no_empleado"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: no_empleado,
          type: "INSERT",
          user,
          server,
          table: "medicos",
        });
      },
      afterUpdate: async (doctor, options) => {
        const { user, server } = await getServerUser();
        const { previousValues, currentValues } = getPreviousCurrentValues({
          table: doctor,
        });

        for (const [field, previousValue] of Object.entries(previousValues)) {
          let newValue = currentValues[field];

          if (previousValue !== newValue) {
            await Bitacora.create({
              tabla: "medicos",
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
      afterDestroy: async (doctor, options) => {
        const no_empleado = doctor.dataValues["no_empleado"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: no_empleado,
          type: "DELETE",
          user,
          server,
          table: "medicos",
        });
      },
    },
  }
);

Medico.hasOne(Usuario, {
  foreignKey: "correo",
  sourceKey: "correo",
  targetKey: "correo",
});

Medico.hasMany(HorarioConsultorio, {
  foreignKey: "no_empleado",
  sourceKey: "no_empleado",
  targetKey: "no_empleado",
});

HorarioConsultorio.belongsTo(Medico, {
  foreignKey: "no_empleado",
  sourceKey: "no_empleado",
  targetKey: "no_empleado",
});

module.exports = Medico;
