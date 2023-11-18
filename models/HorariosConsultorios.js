const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const Cita = require("./Citas");
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

Cita.hasOne(HorarioConsultorio, {
  foreignKey: "id", //FK de la tabla que tiene PK
  sourceKey: "id_horario", //FK de la tabla que tiene FK
  targetKey: "id_horario",  //PK de la tabla que tiene FK
});

HorarioConsultorio.belongsTo(Cita, {
  foreignKey: "id", // PK de la tabla que hereda la PK
  sourceKey: "id", // PK de la tabla que hereda la PK
  targetKey: "id_horario", //PK de la tabla que tiene FK
});

module.exports = HorarioConsultorio;
