const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
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
      allowNull: true,
      validate: {
        isIn: {
          args: [[0, 1]],
        },
      },
    },
  },
  {
    timestamps: false,
    tableName: "Consultorios",
  }
);

Consultorio.hasMany(HorarioConsultorio, { foreignKey: "consultorio" });

module.exports = Consultorio;
