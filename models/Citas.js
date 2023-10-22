const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");

const Cita = sequelize.define(
  "Citas",
  {
    id: {
      type: DataTypes.NUMBER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha_hora_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_hora_final: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    nss: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Paciente",
        key: "nss",
      },
    },
    no_empleado: {
      type: DataTypes.STRING(15),
      allowNull: false,
      references: {
        model: "Medico",
        key: "no_empleado",
      },
    },
  },
  {
    timestamps: false,
    tableName: "Citas",
  }
);

module.exports = Cita;
