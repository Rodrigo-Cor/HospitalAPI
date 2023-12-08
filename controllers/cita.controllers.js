"use strict";

const HorarioConsultorio = require("../models/HorariosConsultorios.js");
const Cita = require("../models/Citas.js");
const Medico = require("../models/Medicos.js");
const Usuario = require("../models/Usuarios.js");
const Consultorio = require("../models/Consultorios.js");
const Especialidad = require("../models/Especialidades.js");

const sequelize = require("../utils/database.util");
const {
  fetchConsultaCost,
  checkAppointmentAvailability,
} = require("../utils/appointment.util.js");

const { Sequelize } = require("sequelize");

const citaController = {};

const fetchUniqueConsultorios = async () =>
  await Consultorio.findAll({
    attributes: [
      [Sequelize.fn("DISTINCT", Sequelize.col("consultorio")), "consultorio"],
    ],
  });

const fetchDoctorsWithConsultorios = async () => {
  const today = new Date();
  const hoursToday = today.getUTCHours();
  const date72HoursAfter = new Date(today);
  date72HoursAfter.setUTCHours(hoursToday + 72);

  return await Medico.findAll({
    attributes: ["no_empleado", "especialidad"],
    include: [
      {
        model: Especialidad,
        attributes: ["especialidad"],
      },
      {
        model: Usuario,
        attributes: ["nombre", "ap_paterno", "ap_materno"],
        where: {
          fecha_fin: {
            [Sequelize.Op.is]: null,
          },
        },
      },
      {
        model: Consultorio,
        required: true,
        attributes: ["consultorio"],
        include: [
          {
            model: HorarioConsultorio,
            required: true,
            where: {
              disponible: true,
              fecha_hora_inicio: {
                [Sequelize.Op.gte]: date72HoursAfter,
              },
            },
            attributes: {
              exclude: [
                "id",
                "consultorio",
                "fecha_hora_inicio",
                "fecha_hora_final",
                "disponible",
              ],
            },
          },
        ],
      },
    ],
    order: [
      [Especialidad, "especialidad", "ASC"],
      ["consultorio", "ASC"],
    ],
  });
};

citaController.getDoctors = async (req, res) => {
  try {
    const doctorsWithConsultorios = await fetchDoctorsWithConsultorios();
    if (!doctorsWithConsultorios.length) {
      return res.json([]);
    }

    let specialtiesCost = [];

    const availableDoctors = await Promise.all(
      doctorsWithConsultorios.map(
        async ({
          no_empleado,
          Especialidad: { especialidad },
          Consultorio: { consultorio },
          Usuario: { nombre, ap_paterno, ap_materno },
        }) => {
          const costo = await fetchConsultaCost(
            "Consulta " + especialidad.toLowerCase()
          );
          const existingEntry = specialtiesCost.find(
            (speciality) => speciality.especialidad === especialidad
          );

          if (!existingEntry) {
            specialtiesCost = [...specialtiesCost, { especialidad, costo }];
          }

          const nombreCompleto = nombre + " " + ap_paterno + " " + ap_materno;
          return {
            no_empleado,
            especialidad,
            nombreCompleto,
            consultorio,
          };
        }
      )
    );
    return res.json({ availableDoctors, specialtiesCost });
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
    const { nss, id_horario, fecha_hora_inicio } = req.body;

    if (!checkAppointmentAvailability({ nss, fecha_hora_inicio })) {
      return res
        .status(400)
        .json({ message: "Ya tienes una cita agendada a esa misma hora" });
    }

    const citaExisting = await Cita.findOne({
      where: {
        nss: nss,
        id_horario: id_horario,
        status: 2,
      },
      attributes: ["id"],
    });

    if (!citaExisting) {
      await Cita.create(
        {
          id_horario: id_horario,
          nss: nss,
          status: 1,
        },
        { transaction: t }
      );
    } else {
      await Cita.update(
        {
          status: 1,
        },
        {
          where: {
            id: id,
          },
        },
        { transaction: t }
      );
    }

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
