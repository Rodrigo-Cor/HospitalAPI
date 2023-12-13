const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const Usuario = require("./Usuarios");
const HorarioConsultorio = require("./HorariosConsultorios");

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
