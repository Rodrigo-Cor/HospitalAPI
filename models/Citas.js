const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const Paciente = require("./Pacientes");
const { getServerUser, hookInsertDeleteAfter } = require("../utils/hooks.util");

const Cita = sequelize.define(
  "Citas",
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
        model: "HorariosConsultorios",
        key: "id",
      },
    },
    nss: {
      type: DataTypes.STRING(11),
      allowNull: false,
      references: {
        model: "Pacientes",
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
      afterDestroy: async (cita, options) => {
        const id_cita = cita.dataValues["id"];
        const { user, server } = await getServerUser();
        await hookInsertDeleteAfter({
          PK: id_cita,
          type: "DELETE",
          user,
          server,
          table: "Citas",
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
