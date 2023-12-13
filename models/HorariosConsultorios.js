const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const Cita = require("./Citas");
const { getServerUser, hookInsertDeleteAfter } = require("../utils/hooks.util");

const HorarioConsultorio = sequelize.define(
  "HorarioConsultorio",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    no_empleado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Medico",
        key: "no_empleado",
      },
    },
    disponible: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        isIn: {
          args: [[0, 1]],
        },
      },
    },
    fecha_hora_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_hora_final: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "horarios_consultorios",
    hooks: {
      afterDestroy: async (horarioconsultorio, options) => {
        const id_horario = horarioconsultorio.dataValues["id"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: id_horario,
          type: "DELETE",
          user,
          server,
          table: "horarios_consultorios",
        });
      },
    },
  }
);

Cita.hasOne(HorarioConsultorio, {
  foreignKey: "id", //FK de la tabla que tiene PK
  sourceKey: "id_horario", //FK de la tabla que tiene FK
  targetKey: "id_horario", //PK de la tabla que tiene FK
});

HorarioConsultorio.belongsTo(Cita, {
  foreignKey: "id", // PK de la tabla que hereda la PK
  sourceKey: "id", // PK de la tabla que hereda la PK
  targetKey: "id_horario", //PK de la tabla que tiene FK
});

module.exports = HorarioConsultorio;
