const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const Medico = require("./Medicos");
const HorarioConsultorio = require("./HorariosConsultorios");

const Consultorio = sequelize.define(
  "Consultorios",
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
    tableName: "Consultorios",
  }
);

Medico.hasOne(Consultorio, {
  foreignKey: "consultorio",
  sourceKey: "consultorio",
  targetKey: "consultorio",
});

HorarioConsultorio.hasOne(Consultorio, {
  foreignKey: "consultorio",
  sourceKey: "consultorio",
  targetKey: "consultorio",
});

Consultorio.hasMany(HorarioConsultorio, {
  foreignKey: "consultorio",
  sourceKey: "consultorio",
  targetKey: "consultorio",
});

Consultorio.belongsTo(Medico, {
  foreignKey: "consultorio",
  sourceKey: "consultorio",
  targetKey: "consultorio",
});


module.exports = Consultorio;
