const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const Status = require("./Status");
const HorarioConsultorio = require("./HorariosConsultorios");
const Paciente = require("./Pacientes");

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
    tableName: "Citas",
  }
);

Paciente.hasMany(Cita, {
  foreignKey: "nss",
  sourceKey: "nss",
  targetKey: "nss",
});

Cita.hasOne(HorarioConsultorio, {
  foreignKey: "id",
  sourceKey: "id_horario",
});

Cita.hasOne(Status, {
  foreignKey: "id",
  sourceKey: "status",
});

Cita.belongsTo(Paciente, {
  foreignKey: "nss",
  sourceKey: "nss",
  targetKey: "nss",
});

module.exports = Cita;
