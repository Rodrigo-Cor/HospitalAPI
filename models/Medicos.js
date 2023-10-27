const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");
const Usuario = require("./Usuarios");
const Consultorio = require("./Consultorios");
const Medico = sequelize.define(
  "Medicos",
  {
    no_empleado: {
      type: DataTypes.STRING(15),
      primaryKey: true,
    },
    correo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "Usuarios",
        key: "correo",
      },
    },
    especialidad: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "Especialidad",
        key: "especialidad",
      },
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
    telefono: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "Medicos",
  }
);

Medico.hasOne(Usuario, {
  foreignKey: "correo",
  sourceKey: "correo",
});

Medico.hasOne(Consultorio, {
  foreignKey: "consultorio",
  sourceKey: "consultorio",
});


module.exports = Medico;
