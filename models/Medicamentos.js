const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database.util");

const Medicamento = sequelize.define(
  "Medicamentos",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    costo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    cantidad_stock: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "Medicamentos",
  }
);

/*
    const consultoriosDisponibles = await Cita.findAll({
      attributes: ["nss", "id_horario", "status"],
      where: {
        status: "1",
      },
      include: {
        model: HorarioConsultorio,
        attributes: ["fecha_hora_inicio", "fecha_hora_final"],
        where: {
          fecha_hora_inicio: { [Sequelize.Op.gte]: new Date() },
        },
        include: {
          model: Consultorio,
          attributes: ["consultorio", "disponible"],
          include: {
            model: Medico,
          },
        },
      },
    });
*/

/*
    const doctorsWithConsultorios = await Medico.findAll({
      attributes: ["no_empleado"],
      include: {
        model: Consultorio,
        attributes: ["consultorio"],
      },
    });

    const doctorsConsultorioMap = {};
    doctorsWithConsultorios.forEach(
      ({ no_empleado, Consultorio: { consultorio } }) => {
        doctorsConsultorioMap[consultorio] = {
          no_empleado,
        };
      }
    );

    const consultorios = doctorsWithConsultorios.map(
      ({ Consultorio: { consultorio } }) => consultorio
    );

    const appointmentAfterToday = await Cita.findAll({
      attributes: ["nss", "id_horario", "status"],
      where: {
        status: "1",
      },
      include: {
        model: HorarioConsultorio,
        attributes: ["fecha_hora_inicio", "fecha_hora_final"],
        where: {
          consultorio: consultorios,
          fecha_hora_inicio: { [Sequelize.Op.gte]: new Date() },
        },
        include: {
          model: Consultorio,
          attributes: ["consultorio", "disponible"],
        },
      },
    });

    const consultoriosDisponibles = appointmentAfterToday.map((appointment) => {
      const {
        nss,
        status,
        id_horario,
        HorariosConsultorio: {
          fecha_hora_inicio,
          fecha_hora_final,
          Consultorios,
        },
      } = appointment;

      const { consultorio, disponible } = Consultorios[0];
      const { no_empleado } = doctorsConsultorioMap[consultorio];

      return {
        nss,
        status,
        id_horario,
        fecha_hora_inicio,
        fecha_hora_final,
        consultorio,
        disponible,
        no_empleado,
      };
    }); 
*/

module.exports = Medicamento;
