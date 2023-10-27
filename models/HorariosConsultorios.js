const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const Consultorio = require("./Consultorios");
const HorarioConsultorio = sequelize.define(
  "HorariosConsultorios",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    consultorio: {
      type: DataTypes.INTEGER,
      len: [0, 10],
      allowNull: false,
      references: {
        model: "Consultorio",
        key: "consultorio",
      },
    },
    disponible: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      validate: {
        isIn: {
          args: [[0, 1]],
          msg: 'El campo "disponible" debe ser 0 o 1.',
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
    tableName: "HorariosConsultorios",
  }
);


module.exports = HorarioConsultorio;
