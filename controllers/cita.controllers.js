const HorarioConsultorio = require("../models/HorariosConsultorios.js");
const Cita = require("../models/Citas.js");
const Medico = require("../models/Medicos.js");
const Usuario = require("../models/Usuarios.js");
const Servicio = require("../models/Servicios.js");
const HorariosConsultorios = require("../models/HorariosConsultorios.js");
const Consultorios = require("../models/Consultorios.js");
const sequelize = require("../utils/database.util");
const { Sequelize } = require("sequelize");
const citaController = {};

citaController.getEspecialidades = async (req, res) => {
  try {
    let especialidades = await Medico.findAll({
      attributes: [
        [
          Sequelize.fn("DISTINCT", Sequelize.col("especialidad")),
          "especialidad",
        ],
      ],
    });

    especialidades = await Promise.all(
      especialidades.map(async (especialidad) => {
        const costo = await Servicio.findOne({
          where: {
            nombre: "Consulta " + especialidad.especialidad.toLowerCase(),
          },
          attributes: ["costo"],
        });
        especialidad.dataValues.costo = costo.dataValues.costo;
        return especialidad;
      })
    );

    return res.json(especialidades);
  } catch (error) {
    console.error("Error al obtener especialidades:", error);
    return res.status(500).json({ message: "Error al obtener especialidades" });
  }
};

citaController.getAppointmentsDays = async (req, res) => {
  try {
    const { consultorio } = req.body;
    const citas_disponibles = await HorarioConsultorio.findAll({
      where: {
        disponible: 1,
        consultorio: consultorio,
        fecha_hora_inicio: {
          [Sequelize.Op.gte]: new Date().setHours(new Date().getHours() + 48),
        },
      },
      order: [["fecha_hora_inicio", "ASC"]],
      attributes: ["fecha_hora_inicio", "fecha_hora_final", "id"],
    });

    return res.json(citas_disponibles);
  } catch (error) {
    console.error("Error al obtener citas:", error);
    return res.status(500).json({ message: "Error al obtener citas" });
  }
};

citaController.getDoctors = async (req, res) => {
  try {
    const medicos = await Medico.findAll({
      attributes: ["correo", "consultorio", "especialidad"],
      order: [["consultorio", "ASC"]],
      include: [
        {
          model: Consultorios,
          attributes: ["consultorio"],
          include: {
            model: HorariosConsultorios,
            where: { disponible: true },
          },
        },
      ],
    });

    console.log(medicos);

    let medicosDisponibles = (
      await Promise.all(
        medicos.map(async (medico) => {
          if (medico.Consultorio === null) return null;
          const medico_usuario = await Medico.findOne({
            where: {
              correo: medico.correo,
            },
            attributes: ["no_empleado", "consultorio", "especialidad"],
            include: {
              model: Usuario,
              attributes: ["nombre", "ap_paterno", "ap_materno"],
            },
          });

          medico_usuario.dataValues.nombreCompleto = `${medico_usuario.Usuario.nombre} ${medico_usuario.Usuario.ap_paterno} ${medico_usuario.Usuario.ap_materno}`;

          delete medico_usuario.dataValues.Usuario;
          return {
            ...medico_usuario.dataValues,
          };
        })
      )
    ).filter((medico) => medico !== null);

    medicosDisponibles = await Promise.all(
      medicosDisponibles.map(async (especialidad) => {
        const costo = await Servicio.findOne({
          where: {
            nombre: "Consulta " + especialidad.especialidad.toLowerCase(),
          },
          attributes: ["costo"],
        });
        especialidad.costo = costo.dataValues.costo;
        return especialidad;
      })
    );

    return res.json(medicosDisponibles);
  } catch (error) {
    console.log(error);
    console.log("Error al obtener doctores:", error);
    return res.status(500).json({ message: "Error al obtener doctores" });
  }
};

citaController.scheduleAppointment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { fecha_hora_inicio, fecha_hora_final, nss, no_empleado } = req.body;

    await Cita.create(
      {
        fecha_hora_inicio: fecha_hora_inicio,
        fecha_hora_final: fecha_hora_final,
        nss: nss,
        no_empleado: no_empleado,
      },
      { transaction: t }
    );

    const medico = await Medico.findOne({
      where: {
        no_empleado: no_empleado,
      },
      attributes: ["consultorio"],
    });

    await HorarioConsultorio.update(
      {
        disponible: 0,
      },
      {
        where: {
          consultorio: medico.consultorio,
          fecha_hora_inicio: fecha_hora_inicio,
          fecha_hora_final: fecha_hora_final,
        },
      },
      { transaction: t }
    );

    await t.commit();
    return res.json({ message: "Cita agendada" });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ message: error.message });
  }
};


module.exports = citaController;
