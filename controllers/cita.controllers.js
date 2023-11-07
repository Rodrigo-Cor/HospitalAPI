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

const fetchDoctorsWithConsultorios = async () =>
  await Medico.findAll({
    attributes: ["correo", "consultorio", "especialidad"],
    order: [["consultorio", "ASC"]],
    include: {
      model: Consultorios,
      attributes: ["consultorio"],
      include: {
        model: HorariosConsultorios,
        where: { disponible: true },
      },
    },
  });

const fetchAvailableDoctors = async (medicos) => {
  return (
    await Promise.all(
      medicos.map(async ({ correo, Consultorio }) => {
        if (!Consultorio) return null;

        const medico_usuario = await fetchDoctorDetails(correo);

        if (medico_usuario) {
          const {
            no_empleado,
            consultorio,
            especialidad,
            Usuario: { nombre, ap_paterno, ap_materno },
          } = medico_usuario;
          return {
            no_empleado: no_empleado,
            especialidad: especialidad,
            costo: await fetchConsultaCost(especialidad),
            nombreCompleto: nombre + " " + ap_paterno + " " + ap_materno,
            consultorio: consultorio,
          };
        }
        return null;
      })
    )
  ).filter((medico) => medico !== null);
};

const fetchDoctorDetails = async (correo) =>
  await Medico.findOne({
    where: { correo },
    attributes: ["no_empleado", "consultorio", "especialidad"],
    include: {
      model: Usuario,
      attributes: ["nombre", "ap_paterno", "ap_materno"],
    },
  });

const fetchConsultaCost = async (especialidad) => {
  const servicio = await Servicio.findOne({
    where: {
      nombre: "Consulta " + especialidad.toLowerCase(),
    },
    attributes: ["costo"],
  });
  return servicio?.costo || 0;
};

const fetchDoctorInfo = async (medicos) =>
  await Promise.all(
    medicos.map(
      ({ no_empleado, especialidad, costo, nombreCompleto, consultorio }) => {
        return {
          no_empleado: no_empleado,
          especialidad: especialidad,
          costo: costo,
          nombreCompleto: nombreCompleto,
          consultorio: consultorio,
        };
      }
    )
  );

citaController.getDoctors = async (req, res) => {
  try {
    const medicos = await fetchDoctorsWithConsultorios();

    if (!medicos.length) {
      return res.json([]);
    }

    const medicosDisponibles = await fetchAvailableDoctors(medicos);

    const doctoresInfo = await fetchDoctorInfo(medicosDisponibles);

    return res.json(doctoresInfo);
  } catch (error) {
    console.error("Error al obtener doctores:", error);
    return res.status(500).json({ message: "Error al obtener doctores" });
  }
};

citaController.getAppointmentsDays = async (req, res) => {
  try {
    const { consultorio } = req.body;
    
    const today = new Date();
    const hoursToday = today.getUTCHours();
    const date48HoursAfter = new Date(today);
    date48HoursAfter.setUTCHours(hoursToday + 48);
    
    const citas_disponibles = await HorarioConsultorio.findAll({
      where: {
        disponible: 1,
        consultorio: consultorio,
        fecha_hora_inicio: {
          [Sequelize.Op.gte]: date48HoursAfter,
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

citaController.scheduleAppointment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { nss, id_horario } = req.body;

    await Cita.create(
      {
        id_horario: id_horario,
        nss: nss,
        status: 1,
      },
      { transaction: t }
    );

    await HorarioConsultorio.update(
      {
        disponible: 0,
      },
      {
        where: {
          id: id_horario,
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
