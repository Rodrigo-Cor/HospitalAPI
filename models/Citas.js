const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const HorarioConsultorio = require("./HorariosConsultorios");

const Cita = sequelize.define(
  "Citas",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_horario:{
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
        model: "Paciente",
        key: "nss",
      },
    },
    pagado: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        isIn: {
          args: [[0, 1]],
        },
      },
    },
  },
  {
    timestamps: false,
    tableName: "Citas",
  }
);

Cita.hasOne(HorarioConsultorio, {
  foreignKey: "id",
  sourceKey: "id_horario",
});


module.exports = Cita;
